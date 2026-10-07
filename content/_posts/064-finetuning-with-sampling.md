---
title: "[2026-10-01] Finetuning with Sampling: SFT Learns Better Than You Think"
permalink: "/posts/论文解读/finetuning-with-sampling.html"
date: "2026-10-06T10:30:00+08:00"
updated: "2026-10-07T18:43:19+08:00"
cover: "/lib/papers/finetuning-with-sampling/cover.svg"
description: "Sampling SFT 如何把偏离基础模型分布的专家解题记录改写成更易学习的训练数据；逐步区分信息投影、理论采样规则、公开的贪心实现、真实案例与实验结果。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 8
categories:
  - "论文解读"
tags:
  - "Supervised Finetuning"
  - "On-policy Learning"
  - "MCMC"
  - "Data Curation"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Harvard · arXiv:2610.02140v1 · 最早公开于 2026-10-01</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2610.02140">论文主页</a>
  <a href="https://arxiv.org/pdf/2610.02140">论文 PDF</a>
  <a href="https://github.com/aakaran/finetuning-with-sampling">官方代码</a>
  <a href="https://aakaran.github.io/finetuning_with_sampling/">项目页</a>
</div>

<section class="deck-wrap" aria-label="Finetuning with Sampling 交互图解">
  <div class="deck-head"><strong>8 页交互图解 · 信息投影、真实样本、理论保证、完整流程与结果边界</strong><a href="/lib/decks/finetuning-with-sampling-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/finetuning-with-sampling-visual-guide.html" title="Finetuning with Sampling 论文图解，共 8 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可点左下角返回文章</span></p>
  </div>
</section>

<p class="lead">Qwen2.5-3B 直接拿专家答案做 SFT 后，MATH(3,4,5) 同分布测试准确率从 0.315 降到 0.243。论文把问题指向训练数据与基础模型生成分布的距离，并在训练前多次切开、重写专家答案的后缀，只保留基础模型更容易生成的版本。训练阶段仍是普通 SFT。理论部分用 Metropolis-Hastings（MH，一种按接受概率在候选之间移动的采样算法）推导，公开代码采用“只接受平均概率提高”的贪心近似。</p>

<div class="interest"><b>博客作者兴趣度 8.0 / 10</b><span>评分只表示博客作者本人兴趣程度；先改造训练数据的想法很强，但理论算法与公开实现之间的距离需要认真对待</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>0.315 → 0.243</strong><span>Base → 普通 SFT 的 MATH(3,4,5) 测试准确率</span></div>
  <div class="metric"><strong>0.534</strong><span>Sampling SFT 的数学新任务平均准确率</span></div>
  <div class="metric"><strong>99.5%</strong><span>数学实验中的旧能力平均保持率：0.420 / 0.422</span></div>
  <div class="metric"><strong>0.567</strong><span>Sampling SFT 再接 GRPO 后的数学新任务均分</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>论文改的是训练数据分布。</strong>训练阶段仍使用标准的 SFT 交叉熵损失。</li>
    <li><strong>理想目标是基础模型在“答案保持等价”集合上的条件分布。</strong>这样可以同时利用专家答案提供的信息和学生模型自己的表达习惯。</li>
    <li><strong>公开代码不是完整的 Metropolis-Hastings 采样。</strong>它只接受平均对数概率更高的候选改写，没有计算正反向提议概率之比，也不会随机接受概率下降的候选。</li>
    <li><strong>结果并非所有任务都第一。</strong>Sampling SFT 在 Qwen 化学和数学任务上很强，但在医疗任务和 Olmo 化学任务上的新任务准确率低于 OPSD（用当前模型生成数据，再训练同一模型的自蒸馏基线）。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 同策略数据、分布外专家轨迹与信息投影是什么？

这里的 **off-policy expert trajectory（分布外的专家轨迹）** 是别人或更强系统写出的正确解答。它提供基础模型当前不会生成的信息，但措辞、推理顺序和 token（模型处理的文本单位）分布可能与基础模型惯常生成的内容相差很远。直接做 SFT 会强迫模型拟合这些低概率序列，作者认为这会增加过拟合和旧能力遗忘。

**On-policy data（同策略数据）** 来自当前模型自身，通常更容易学习，也更接近模型原来的行为。不过，模型在困难任务上可能一次正确回答都生成不出来，强化学习因而拿不到正奖励。

论文希望找到两者之间的目标：答案仍与专家解答等价，但在这些正确答案里尽量遵循基础模型的概率分布。这个条件分布写成 `p_C`，作者称其为 **information projection（信息投影）**。</aside>

## Q1. 为什么不直接用专家解题记录做 SFT？

**正确数据仍可能不适合当前模型学习，因为它的 token 序列离当前模型的生成分布太远。**

普通 SFT 把专家回答当成唯一目标，不考虑基础模型原本会如何表达。模型为了拟合一条低概率轨迹，可能发生较大的参数更新，并让新任务的表述方式干扰旧能力。同策略强化学习和自蒸馏通常更稳定，因为训练样本来自当前模型附近；代价是困难样本很难生成成功回答。

作者保留 SFT，但先用基础模型重写数据。专家解答仍放在生成提示词里，作为模型平时看不到的额外信息；新生成的后缀则来自基础模型。因此候选回答可以保留答案内容，同时更接近待训练模型自己的表达分布。

<figure class="figure wide">
  <img src="/lib/papers/finetuning-with-sampling/cover.svg" alt="从分布外专家解题记录到 Sampling SFT 训练数据的流程">
  <figcaption>根据论文图 2、算法 1 与公开 `boost_sci.py` 重绘。图中区分了论文推导的 MH 采样与公开代码实际采用的“概率只升不降”规则。</figcaption>
</figure>

## Q2. 它与强化学习、自蒸馏和加权 SFT 有什么区别？

**这篇论文在训练前改写数据，让样本更接近待训练模型自己的分布。**

<div class="table-scroll">
<table>
  <thead><tr><th>方法</th><th>专家信息怎样进入</th><th>改变什么</th><th>困难任务的限制</th></tr></thead>
  <tbody>
    <tr><td>普通 SFT</td><td>直接拟合专家轨迹</td><td>不改训练目标，也不改数据</td><td>数据可能离学生模型的分布很远。</td></tr>
    <tr><td>重要性加权 / KL 约束 SFT</td><td>仍使用原始专家数据</td><td>修改损失函数，或增加 KL 约束来限制新旧模型的回答分布差异</td><td>需要可靠的重要性比率或正则项。</td></tr>
    <tr><td>GRPO / UFT（两种同策略训练方法；UFT 把监督微调与强化学习统一起来）</td><td>专家轨迹作为生成时的额外上下文</td><td>根据当前模型自己生成的回答和奖励更新模型</td><td>基础模型仍可能难以产生可训练的成功回答组。</td></tr>
    <tr><td>OPSD（同策略自蒸馏）</td><td>基础模型在额外上下文下充当教师</td><td>做自蒸馏</td><td>每次训练需要教师分布或多次生成结果。</td></tr>
    <tr><td>Sampling SFT</td><td>专家解答约束候选改写</td><td>先改变数据分布，再做普通 SFT</td><td>需要大量生成计算，并依赖改写前后语义不变。</td></tr>
  </tbody>
</table>
</div>

把 **MCMC（马尔可夫链蒙特卡洛）** 用于语言模型并非这篇论文首次提出。已有工作用 MCMC 让采样分布偏向外部奖励，或偏向更集中的推理分布；这里从分布外的专家数据出发，改写后的结果用于继续微调，而不是只改善推理时生成的样本。

## Q3. 从目标分布到公开代码，算法到底做了什么？

**论文给出一个严格的目标分布和 Metropolis-Hastings（MH）推导，实验代码采用更激进的近似。两者必须分开讲。**

固定一个问题，并令 `C` 表示所有与专家轨迹信息等价的回答。理想目标是：

<div class="formula">p_C(x) ∝ p_base(x) · 1[x ∈ C]</div>

也就是把基础模型的分布限制在正确集合 `C` 内。论文算法 1 从专家轨迹开始，逐段扩展回答。每次 MCMC 更新随机选择切分点，把当前前缀、原题和完整专家解答一起交给基础模型，让它重写后缀。理论算法应根据目标概率，以及从旧回答提议新回答和从新回答提议旧回答的概率，计算 Metropolis-Hastings 接受概率。

### 公开实现实际接受什么？

<div class="code-scroll"><pre><code># official boost_sci.py / boost_math.py
target_log_prob_prop = get_logprobs_vLLM(p, question, prop)

if target_log_prob_prop[0] &gt; target_log_prob_cur[0]:
    gen = prop
    target_log_prob_cur = target_log_prob_prop</code></pre></div>

`get_logprobs_vLLM` 返回回答中各 token 在基础模型下的平均对数概率。代码只在候选改写的概率更高时替换当前回答，没有计算正反向提议概率之比 `κ(x|x') / κ(x'|x)`，也没有按照接受概率随机接纳概率下降的候选。因此公开实现更接近只向高处移动的贪心爬山。附录 C.2 将它称为近似，并说明这样做是为了少算一次反向提议所需的模型前向计算。

这处差别影响理论边界：论文关于 MH **stationary distribution（经过足够多步后保持不变的目标分布）** 和逐步逼近 `p_C` 的结论，只适用于理想的转移规则，不能直接当作公开代码的保证。图 5 只能说明在作者的化学实验中，随着更新次数增加，估计的 KL 距离降低且准确率上升。

### 三条理论保证分别说了什么？

论文的 Proposition 1 证明 `p_C` 是所有满足答案约束的分布中，对 `p_base` 做 KL 投影得到的唯一解。Proposition 2 把这个难以直接采样的目标改写成可执行的 MH 转移：对 `p_C` 使用普通 proposal，与对 `p_base` 使用保证答案等价的 proposal，会得到相同的接受规则。Proposition 3 说明，在这些条件成立时，第 `k+1` 步数据分布到基础模型的 KL 距离不会大于第 `k` 步，即 `KL(π_{k+1} || p_base) ≤ KL(π_k || p_base)`。

第三条保证说的是理想链每走一步都不会离基础模型更远，不代表每条样本的概率严格上升，也不适用于删去了完整接受概率的公开贪心代码。

### Algorithm 1 的完整流程与成本

Algorithm 1 先从专家轨迹开始，按块扩展当前答案。每生成一个新块，算法就在已有部分中随机选切分点，用原题、专家解答与保留的前缀生成同长度候选；随后按完整 MH 接受概率决定是否替换，并在当前块内重复 `N` 次。完成一块后固定当前结果，继续下一块，直到达到最长序列长度 `T`。论文实验使用 `T=1,856`、`N=10`、块大小 `B=32`。

附录 Eq. 9 给出的理论生成量是 `T²N / (4B)`。代入上述参数得到 `1,856² × 10 / (4 × 32) = 269,120`，也就是每条轨迹约 26.9 万个生成 token。它是一次性数据改写的量级估算，不含完整的打分前向计算、失败重试、GPU 吞吐或美元成本。换一个基础模型后，目标分布也随之改变，数据原则上需要重新采样。

### 真实案例：附录 A 的化学方程式

<div class="case">
<h4>`CO₂ + H₂O → C₃H₆O₃ + O₂`</h4>
<ol>
  <li><strong>来源：</strong>论文附录 A 发布了原始回答与改写后的回答；生成逻辑对应公开脚本 `boost_sci.py`。</li>
  <li><strong>输入：</strong>问题要求配平方程，并保持反应物与生成物的原有顺序。专家解答给出正确系数和推理过程。</li>
  <li><strong>候选改写：</strong>代码随机选择一个 token 位置，把当前前缀与完整专家解答放进化学任务提示词，重新生成剩余后缀。</li>
  <li><strong>接受条件：</strong>只有候选改写在基础模型下的平均对数概率高于当前回答时，代码才会保留它。</li>
  <li><strong>输出检查：</strong>生成结束后，化学方程式检查器比较方程是否配平，并写入 `is_correct`。</li>
  <li><strong>公开结果：</strong>附录中的改写回答保持了正确配平，但论文没有发布这个样本逐轮接受或拒绝候选的记录。</li>
</ol>
</div>

公开脚本会把 `is_correct` 写进数据行，随后无条件把整条记录追加到逐行 JSON（JSONL）文件。仓库说明（README）说这些输出可以转换为 SFT 的提示词/回答数据，却没有说明是否先过滤 `is_correct=0`。论文报告最终改写数据集的正确率在 93.94% 到 95.86% 之间，所以“答案信息保持不变”在实现中只是经验比例，不是严格条件。

另一个小问题是脚本接受 `--seed` 参数，却固定执行 `random.seed(0)`；传入其他随机种子不会改变 Python 的随机切分序列。

## Q4. 实验结果能支持多强的结论？

**Sampling SFT 在 Qwen 数学新任务上得到 0.534，超过 GRPO 的 0.457 和 UFT 的 0.452；再接 GRPO 后达到 0.567。**

<figure class="figure wide">
  <img src="/lib/papers/finetuning-with-sampling/results.svg" alt="普通 SFT、Sampling SFT、GRPO 和 UFT 在 Qwen2.5-3B 数学实验中的结果">
  <figcaption>根据论文 Table 1 重绘。所有数值都是 single-shot accuracy；论文没有提供多随机种子结果或误差条。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>实验</th><th>Sampling SFT</th><th>最相关基线</th><th>怎么读</th></tr></thead>
  <tbody>
    <tr><td>Qwen2.5-7B 化学</td><td>66.0</td><td>SFT 61.8；OPSD 61.8</td><td>新任务准确率高 4.2 个百分点；旧能力平均分 58.6，接近基础模型的 59.7。</td></tr>
    <tr><td>Qwen2.5-3B 数学平均分</td><td>0.534</td><td>GRPO 0.457；UFT 0.452</td><td>Sampling SFT 高 0.077 / 0.082；再接 GRPO 可到 0.567。</td></tr>
    <tr><td>Qwen2.5-7B 医疗</td><td>45.8</td><td>OPSD 46.6</td><td>新任务准确率低 0.8；旧能力平均分 51.6，高于 OPSD 的 50.1。</td></tr>
    <tr><td>Olmo-3-7B 化学</td><td>58.3</td><td>OPSD 59.7</td><td>新任务准确率低 1.4；旧能力平均分 61.7，为表中最高。</td></tr>
  </tbody>
</table>
</div>

在 MATH(3,4,5) 这个与训练题同分布的测试集上，Base 是 0.315，普通 SFT 降到 0.243，Sampling SFT 则达到 0.495。旧能力方面，基础模型在 Chemistry、MMLU、GPQA 三项上的平均分是 0.422，Sampling SFT 为 0.420，保持率为 `0.420 / 0.422 = 99.5%`。Sampling SFT 在这三项上的遗忘也都是表中所有微调方法里最少的。

一个支持作者机制解释的对照实验是跨模型数据错配：用 Olmo 改写的数据训练 Qwen，化学准确率只有 57.33%，低于普通 SFT 的 61.8%；把 Qwen 改写数据与原始数据各混一半，得到 62.14%，落在普通 SFT 与完整 Qwen Sampling SFT 之间。这说明效果依赖数据与目标基础模型的匹配，单纯把专家答案写得更流畅解释不了这组差异。

不过，全部结果都只来自一次实验。论文没有报告多个随机种子或置信区间，也没有把 Sampling SFT 与所有基线的总生成成本放在同一张表里。医疗任务的正确性还依赖 GPT-5-mini 判分，因此 0.8 个百分点的差异不宜过度解读。

## Q5. 这条路线下一步应该怎样验证？

**最需要的实验是在相同计算预算下，比较严格采样器、只接受概率上升的近似实现和简单改写。**

第一组对照应实现论文里的完整接受概率，至少在较短序列上检查最终经验分布是否接近理论的 stationary distribution（经过足够多步后保持不变的目标分布）。第二组保留当前“只接受基础模型平均概率更高候选”的规则。第三组直接生成多个由专家答案引导的改写，再选基础模型平均概率最高的一条。三组固定候选生成次数与 token 预算，才能判断 MCMC 的转移结构是否真的贡献了额外效果。

数据方面，应明确 SFT 前是否过滤 `is_correct=0`，并同时报告过滤前后样本数、任务覆盖与最终准确率。若保留错误数据行，就需要解释它们为何仍属于正确集合 `C`；若过滤，则数据生成成本和筛选偏差都会改变。

最后，应该发布改写后的数据集、每轮候选被接受或拒绝的记录、模型存档，并补充多随机种子实验。当前仓库只包含化学/数学数据生成和评测脚本，没有医疗任务的数据生成流程，也没有声明仓库许可证。README 说明生成程序会输出接受轨迹字段 `trace_boosted`，仓库里仍没有作者实验对应的实际轨迹文件。

## Q6. 最终应该怎样评价这篇论文？

**先改造训练数据再做 SFT 值得继续研究；实验显示它能改善新任务准确率与旧能力保留之间的折中，但“MCMC 保证”与公开算法之间仍有明显缺口。**

<div class="limit-grid">
  <div><b>论文已经支持</b><span>对 Qwen 化学与数学任务，使用改写数据的 SFT 明显优于普通 SFT，并在主要旧能力评测上遗忘更少。</span></div>
  <div><b>负结果</b><span>医疗任务与 Olmo 化学任务的新任务准确率没有超过 OPSD，因此方法不应描述成全面优于同策略学习。</span></div>
  <div><b>实现边界</b><span>代码使用只接受基础模型平均概率上升候选的贪心规则；理论 MH 关于稳定分布的结论不能直接转移。改写后的数据也没有做到 100% 正确。</span></div>
  <div><b>最可复用的想法</b><span>在不改 SFT 损失函数的前提下，用目标学生模型重写专家轨迹，让监督数据更接近学生模型自己的分布。</span></div>
</div>

这篇论文适合研究后训练、蒸馏与数据筛选的读者。我的判断是：想法比当前实证更成熟。它给出了一个清楚的问题表述，也展示了几组有说服力的结果；下一步若能把理论目标、近似采样器与公开数据逐项对齐，研究价值会更扎实。

<p class="source-note">主要来源：论文 v1 全文与附录、官方仓库版本 aa7080885f114fdc5d141f19c09f53008a1c061e。代码检查日期：2026-10-07。仓库未发布改写后的数据集、训练模型存档、实际接受轨迹或医疗任务的数据生成流程。</p>

</div>

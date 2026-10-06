---
title: "[2026-10-01] Finetuning with Sampling: SFT Learns Better Than You Think"
permalink: "/posts/论文解读/finetuning-with-sampling.html"
date: "2026-10-06T10:30:00+08:00"
updated: "2026-10-06T10:30:00+08:00"
cover: "/lib/papers/finetuning-with-sampling/cover.svg"
description: "Sampling SFT 如何把 off-policy expert traces 改写成更接近 base model 的训练数据；逐步区分 information projection、理想 MH、公开 greedy 实现、真实 case 与实验结果。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
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
  <div class="deck-head"><strong>12 页交互图解 · information projection、代码实现、真实样本与结果边界</strong><a href="/lib/decks/finetuning-with-sampling-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/finetuning-with-sampling-visual-guide.html" title="Finetuning with Sampling 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可点左下角返回文章</span></p>
  </div>
</section>

<p class="lead">这篇论文没有修改 SFT objective。它先处理数据：把一条正确但远离 base-model distribution 的 expert trajectory，多次切开并重写 suffix，保留 base model 更容易生成的版本，再做普通 SFT。论文把理想目标写成 information projection，并用 Metropolis-Hastings 解释；公开代码则采用了更直接的 greedy likelihood ascent。</p>

<div class="interest"><b>博客作者兴趣度 8.0 / 10</b><span>评分只表示博客作者本人兴趣程度；data shaping 的想法很强，但 theory 与 released implementation 的距离需要认真对待</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>66.0%</strong><span>Qwen chemistry Sampling SFT</span></div>
  <div class="metric"><strong>53.4%</strong><span>Qwen math average</span></div>
  <div class="metric"><strong>10</strong><span>MCMC-style updates per block</span></div>
  <div class="metric"><strong>93.94%-95.86%</strong><span>boosted data correctness</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>论文改的是 data distribution。</strong>训练阶段仍使用 standard SFT cross-entropy。</li>
    <li><strong>理想目标是 base distribution 在“答案保持等价”集合上的条件分布。</strong>这样可以同时利用 expert information 与 student 自己的表达习惯。</li>
    <li><strong>公开代码不是完整 Metropolis-Hastings。</strong>它只接受平均 log probability 更高的 proposal，缺少 proposal ratio 与随机 acceptance。</li>
    <li><strong>结果并非所有任务都第一。</strong>Sampling SFT 在 Qwen chemistry 和 math 很强，但 medical 与 Olmo chemistry 的 new-task accuracy 低于 OPSD。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### on-policy、off-policy 和 information projection

这里的 **off-policy expert trajectory** 是别人或更强系统写出的正确解答。它提供 base model 当前不会生成的信息，但措辞、推理顺序和 token distribution 可能离 base model 很远。直接 SFT 会强迫模型拟合这些低概率序列，作者认为这与过拟合和旧能力遗忘有关。

**On-policy data** 来自当前模型自身，通常更容易学习，也更接近模型原来的行为。不过，模型在 hard task 上可能一次正确 rollout 都采不到，RL 因而没有正 reward。

论文希望找到两者之间的目标：答案仍与 expert 等价，但在这些正确答案里尽量遵循 base model 的概率分布。这个条件分布写成 `p_C`，作者称其为 information projection。</aside>

## Q1. 为什么不直接对 expert traces 做 SFT？

**正确数据仍可能不适合当前模型学习，因为它的 token sequence 对这个模型来说过于 off-policy。**

普通 SFT 把 expert response 当成唯一目标，无论 base model 原本会如何表达。模型为拟合一条低概率 trajectory 可能发生较大的参数更新，并把新任务的表述方式覆盖到旧能力上。on-policy RL 与 self-distillation 通常更稳定，因为训练样本来自当前 policy 附近；代价是 hard examples 很难得到成功 rollout。

作者的选择是保留 SFT，但先用 base model 重写数据。expert solution 仍放在 proposal prompt 里提供 privileged information；生成出的 suffix 则来自 base model。因此候选 response 可以同时保持答案内容，并更接近 student 的语言分布。

<figure class="figure wide">
  <img src="/lib/papers/finetuning-with-sampling/cover.svg" alt="从 off-policy expert trajectory 到 sampling SFT 的流程">
  <figcaption>根据论文 Figure 2、Algorithm 1 与公开 `boost_sci.py` 重绘。图中区分了论文推导的 MH 与公开代码实际采用的 greedy acceptance。</figcaption>
</figure>

## Q2. 它与 RL、self-distillation 和 weighted SFT 有什么区别？

**这篇论文把“如何靠近 learner”放在训练前的数据生成阶段。**

<div class="table-scroll">
<table>
  <thead><tr><th>方法</th><th>expert information 怎样进入</th><th>改变什么</th><th>hard task 的限制</th></tr></thead>
  <tbody>
    <tr><td>Vanilla SFT</td><td>直接拟合 expert trajectory</td><td>不改 objective，不改数据</td><td>数据可能离 student distribution 很远。</td></tr>
    <tr><td>Importance-weighted / KL SFT</td><td>仍使用原始 expert data</td><td>修改 loss 或增加 KL</td><td>需要可靠 importance ratio 或 regularization。</td></tr>
    <tr><td>GRPO / UFT</td><td>expert trace 可作为 rollout 的 privileged context</td><td>用 reward 做 on-policy update</td><td>基础模型仍可能难以产生可训练的成功组。</td></tr>
    <tr><td>OPSD</td><td>base model 在 privileged context 下形成 teacher</td><td>self-distillation</td><td>每次训练需要 teacher distribution 或 rollouts。</td></tr>
    <tr><td>Sampling SFT</td><td>expert solution 约束 proposal</td><td>先变换 data distribution，再做普通 SFT</td><td>需要昂贵的 sampling，并依赖语义保持。</td></tr>
  </tbody>
</table>
</div>

MCMC for LLMs 也不是这篇论文第一次提出。已有工作用 MCMC tilt 到 external reward 或 sharpened reasoning distribution；这里的区别是从 off-policy expert data 出发，目标产物随后用于 finetuning，而不是只改善 inference-time samples。

## Q3. 从目标分布到公开代码，算法到底做了什么？

**论文给出一个严格的目标分布和 MH 推导，实验代码采用更激进的近似。两者必须分开讲。**

固定一个 query，并令 `C` 表示所有与 expert trajectory 信息等价的 responses。理想目标是：

<div class="formula">p_C(x) ∝ p_base(x) · 1[x ∈ C]</div>

也就是把 base model 的分布限制在正确集合 `C` 内。论文的 Algorithm 1 从 expert trajectory 开始，逐 block 扩展 response。每次 MCMC update 随机选择切分点，把当前 prefix、原题和完整 expert solution 一起交给 base model，让它重写 suffix。理论算法应按 target density 与正反 proposal probabilities 构造 Metropolis-Hastings acceptance probability。

### 公开实现实际接受什么？

<div class="code-scroll"><pre><code># official boost_sci.py / boost_math.py
target_log_prob_prop = get_logprobs_vLLM(p, question, prop)

if target_log_prob_prop[0] &gt; target_log_prob_cur[0]:
    gen = prop
    target_log_prob_cur = target_log_prob_prop</code></pre></div>

`get_logprobs_vLLM` 返回 response tokens 在 base model 下的平均 log probability。代码只在 proposal 更高时替换当前 response，没有计算 `κ(x|x') / κ(x'|x)`，也没有按 acceptance probability 随机接受下降 proposal。因此公开实现更接近 greedy hill-climbing。Appendix C.2 把它称为近似，并说明这样做是为了少一次反向 proposal 的 forward pass。

这处差别影响理论边界：论文关于 MH stationary distribution 和逐步逼近 `p_C` 的结论属于理想 kernel，不能直接当作公开代码的保证。Figure 5 只能说明在作者的 chemistry experiment 中，随着 update 次数增加，估计 KL 降低且 accuracy 上升。

### 真实 case：Appendix A 的 chemical equation

<div class="case">
<h4>`CO₂ + H₂O → C₃H₆O₃ + O₂`</h4>
<ol>
  <li><strong>来源：</strong>论文 Appendix A 发布了 original 与 boosted response；生成逻辑对应公开 `boost_sci.py`。</li>
  <li><strong>输入：</strong>问题要求配平方程并保持 reactants/products 顺序。expert solution 给出正确系数和 reasoning。</li>
  <li><strong>proposal：</strong>代码随机选一个 token index，把当前 prefix 与完整 expert solution 放进 chemistry prompt，重新生成剩余 suffix。</li>
  <li><strong>接受：</strong>只有 proposal 的 base-model average log probability 高于当前 response 才被保留。</li>
  <li><strong>输出检查：</strong>生成结束后，chemical-equation grader 比较方程，写入 `is_correct`。</li>
  <li><strong>公开结果：</strong>Appendix 中的 boosted response 保持了正确配平，但论文没有发布这个样本逐轮被接受或拒绝的 trace。</li>
</ol>
</div>

公开脚本会把 `is_correct` 写进 row，随后无条件把整条 record 追加到 JSONL。README 说这些输出可以转换为 SFT prompt/response，却没有说明是否先过滤 `is_correct=0`。论文报告最终 boosted dataset 的正确率在 93.94% 到 95.86% 之间，所以 information preservation 在实现中是经验比例，不是严格条件。

另一个小问题是脚本接受 `--seed` 参数，却固定执行 `random.seed(0)`；传入其他 seed 不会改变 Python 的随机切分序列。

## Q4. 实验结果能支持多强的结论？

**Sampling SFT 在 Qwen chemistry 与 math 上表现较好，也保留了更多旧能力；medical 和 Olmo 结果说明它并未在所有任务上超过 on-policy baseline。**

<figure class="figure wide">
  <img src="/lib/papers/finetuning-with-sampling/results.svg" alt="Sampling SFT 在 chemistry、math、medical 和 Olmo 上的结果">
  <figcaption>根据论文 Tables 1-2 重绘。所有数值为 single-shot accuracy 的 percentage points，论文没有提供多 seed 或误差条。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>实验</th><th>Sampling SFT</th><th>最相关 baseline</th><th>怎么读</th></tr></thead>
  <tbody>
    <tr><td>Qwen2.5-7B chemistry</td><td>66.0</td><td>SFT 61.8；OPSD 61.8</td><td>new-task accuracy 高 4.2 points；prior average 58.6，接近 base 59.7。</td></tr>
    <tr><td>Qwen2.5-3B math average</td><td>53.4</td><td>GRPO 45.7；UFT 45.2</td><td>Sampling SFT 高 7.7 / 8.2 points；再接 RL 可到 56.7。</td></tr>
    <tr><td>Qwen2.5-7B medical</td><td>45.8</td><td>OPSD 46.6</td><td>new-task accuracy 低 0.8；prior average 51.6 高于 OPSD 50.1。</td></tr>
    <tr><td>Olmo-3-7B chemistry</td><td>58.3</td><td>OPSD 59.7</td><td>new-task accuracy 低 1.4；prior average 61.7 为表中最高。</td></tr>
  </tbody>
</table>
</div>

一个支持作者机制解释的 control 是跨模型数据错配：用 Olmo-boosted data 训练 Qwen，chemistry 只有 57.33%，低于 vanilla SFT 的 61.8%；把 Qwen-boosted 与 original data 各混一半，得到 62.14%，落在 vanilla SFT 与完整 Qwen Sampling SFT 之间。它说明 boosted data 的效果依赖目标 base model，不只是把 expert answer 改写得更流畅。

不过，全部结果都是单次 point estimate。论文没有 multi-seed、confidence interval，也没有把 sampling compute 与所有 baselines 的总生成成本放在同一张表里。medical correctness 还依赖 GPT-5-mini judge，因此 0.8 point 的差异不宜过度解读。

## Q5. 这条路线下一步应该怎样验证？

**最需要的实验是把 exact sampler、greedy approximation 和简单 rewrite 放在同一 compute budget 下比较。**

第一组对照应实现论文里的完整 acceptance ratio，至少在较短 sequences 上验证 empirical stationary distribution。第二组保留当前 `higher likelihood only` 规则。第三组直接生成多个 conditioned rewrites 后取 likelihood 最高者。三组固定 proposal calls 与 token budget，才能判断 MCMC structure 是否真的贡献了额外效果。

数据方面，应明确 SFT 前是否过滤 `is_correct=0`，并同时报告过滤前后样本数、任务覆盖与最终 accuracy。若保留错误 rows，就需要解释它们为何仍属于 `C`；若过滤，则数据生成成本和 selection bias 都会改变。

最后，应该发布 boosted datasets、accepted proposal traces 与 checkpoints，并补 multi-seed。当前仓库只包含 chemistry/math generation 与 evaluation scripts，没有 medical generation pipeline，也没有仓库 license。

## Q6. 最终应该怎样评价这篇论文？

**data shaping 值得继续研究，实验显示它能改善新任务准确率与旧能力保留之间的折中；“MCMC 保证”与 released algorithm 之间仍有明显缺口。**

<div class="limit-grid">
  <div><b>论文已经支持</b><span>对 Qwen chemistry 与 math，经过 sampling 的 SFT 明显优于 vanilla SFT，并在主要 prior benchmarks 上遗忘更少。</span></div>
  <div><b>负结果</b><span>medical 与 Olmo chemistry 的 new-task accuracy 没有超过 OPSD，因此方法不应描述成全面优于 on-policy learning。</span></div>
  <div><b>实现边界</b><span>代码使用 greedy likelihood acceptance；理论 MH 的 stationary-distribution 结论不能直接转移。boosted data 也没有做到 100% correctness。</span></div>
  <div><b>最可复用的想法</b><span>在不改 SFT loss 的前提下，用目标 student model 重写 expert traces，让监督数据更接近 learner distribution。</span></div>
</div>

这篇论文适合做 post-training、distillation 与 data curation 的读者。我的判断是：idea 比当前实证更成熟。它给出了一个清楚的问题表述，也展示了几组有说服力的结果；下一步若能把 exact target、approximate sampler 与 released data 对齐，研究价值会更扎实。

<p class="source-note">主要来源：论文 v1 全文与附录、官方仓库 revision 6d3e9f0bfaa98dcca534247dd35dc1b33dd8c428。代码检查日期：2026-10-06。仓库未发布 boosted datasets、training checkpoints 或 medical generation pipeline。</p>

</div>

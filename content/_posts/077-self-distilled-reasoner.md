---
title: "[2026-01-26] Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models"
permalink: "/posts/论文解读/self-distilled-reasoner.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-19T15:37:00+08:00"
cover: "/lib/papers/self-distilled-reasoner/cover.svg"
description: "模型先只看题目写答案，再让冻结的同模型副本多看标准解，计算这份答案每个位置的下一词概率。OPSD 用两份概率的差异训练模型，不需要另请一个更大的模型生成训练答案。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "On-Policy Distillation"
  - "OPSD"
  - "Reasoning"
  - "Privileged Information"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>@media(max-width:640px){.page-paper-reading .prose .paper-reading .deck-wrap .post-deck-embed-frame{height:460px;padding-top:0}.page-paper-reading .prose .figure.dense-original>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}.page-paper-reading .prose .figure.dense-original>a>img{width:850px;max-width:none;height:auto}}</style>

<div class="paper-reading">

<p class="paper-meta">Siyan Zhao, Zhihui Xie, Mengchen Liu, et al. · arXiv:2601.18734v3 · 最早公开于 2026-01-26</p>
<div class="source-links"><a href="https://arxiv.org/abs/2601.18734">论文主页</a><a href="https://arxiv.org/pdf/2601.18734v3">论文 PDF</a><a href="https://github.com/siyan-zhao/OPSD">官方代码</a></div>

<section class="deck-wrap" aria-label="OPSD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 训练过程、真实案例与复现边界</strong><a href="/lib/decks/self-distilled-reasoner-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/self-distilled-reasoner-visual-guide.html" title="OPSD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>按钮或 ← → 翻页；手机可在图解内上下滚动</span><span>F 进入或退出全屏，Esc 退出；独立打开后可返回文章</span></p></div>
</section>

<p class="source-note">原论文图表遵循 <a href="https://arxiv.org/abs/2601.18734">arXiv 页面标示的 CC BY 4.0 许可</a>。本站从 v3 PDF 裁切留白，保留英文标注、原始数值和图注。手机上可左右滑动原图，点“放大查看”可看全幅；其余九项可在文末展开。</p>

<p class="lead">训练时，当前模型先只看题目，写出自己的答案。训练开始时保存的一份同模型副本保持冻结，它额外阅读标准解，再计算当前答案各位置的下一词概率。OPSD 用两份概率分布的差异更新模型。标准解不直接成为训练输出，训练落在当前模型自己会写到的位置上。</p>

<aside class="part0"><span class="kicker">PART 0 · 先把角色和训练位置说清楚</span><h3>模型自己生成，再由多看标准解的副本提供监督</h3><p>把问题记为 <code>x</code>，正在更新的模型称为 <strong>student</strong>，它自己生成推理 <code>y</code>。<strong>token</strong> 是模型一次预测的文字单位；在第 <code>t</code> 个 token 前已写出的 <code>y&lt;t</code> 称为 <strong>prefix</strong>。冻结副本称为 <strong>teacher</strong>，它多看标准解，但计算的是 student 同一 prefix 后的概率。<strong>on-policy rollout</strong> 指当前 student 自己生成的这次尝试，区别于固定数据集答案。<strong>KL divergence</strong> 衡量两份下一 token 概率表的差异。student 用 <strong>LoRA</strong> 更新附加的低秩参数，基础模型不改；梯度不更新 teacher。</p></aside>

<div class="metrics" aria-label="OPSD 关键数字"><div class="metric"><strong>43.4</strong><span>Qwen3-1.7B OPSD 平均分</span></div><div class="metric"><strong>1</strong><span>每题一个 student rollout</span></div><div class="metric"><strong>1,024</strong><span>主实验最大输出 token</span></div><div class="metric"><strong>9/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>teacher 不生成替代答案；它对 student 已经生成的 prefix 计算完整词表概率。</li><li>主实验 teacher 固定在初始模型；只有 student 的 LoRA 参数更新。</li><li>训练用单次、最长 1,024 token 的输出，评测用 12 次、最长 38K token 的尝试，两者不是同一预算。</li><li>每个位置有概率监督，并不等于每条生成答案都已被判定正确。</li></ul></aside>


<h2 id="为什么让模型在自己的回答上接受监督">1. Motivation：为什么让模型在自己的回答上接受监督</h2>

<p><strong>当前模型会生成自己的错误，训练应覆盖这些实际出现的位置。</strong>监督微调（SFT）通常只训练标准答案中的后续 token，推理时模型却可能走到训练集没有覆盖的错误 prefix；只看最终答案的强化学习又难以指出哪一步应改。OPSD 让 student 先走自己的路径，再让看过标准解的 teacher 在同一位置提供下一 token 分布。</p><p>省掉的是另一个独立、更大的 teacher，不是所有外部数据。本文仍需要含标准推理与答案的 OpenThoughts 数据；这个标准解只在训练时给 teacher。论文没有验证仅凭最终代码、完全没有解题过程也能得到相同效果。</p>

<h2 id="与-SFT、GRPO-和独立教师蒸馏的区别">2. Related Work：与 SFT、GRPO 和独立教师蒸馏的区别</h2>

<p><strong>与普通 on-policy distillation 相比，OPSD 用额外标准解制造同模型两分支的能力差异。</strong>普通做法也让 student 自己生成训练回答，但由另一个独立 teacher 评价。GRPO 则让当前模型一题采样多条回答，按整题对错计算组内相对优势；这里的“组”是同一道题的多次尝试。</p>
<div class="table-scroll"><table><thead><tr><th>方法</th><th>训练文字由谁写</th><th>更新信号</th><th>需要什么外部资料</th></tr></thead><tbody><tr><td>SFT</td><td>固定数据集</td><td>提高标准答案 token 的概率</td><td>完整标准答案</td></tr><tr><td>GRPO</td><td>当前模型多次采样</td><td>按最终正确性比较同组尝试</td><td>可检查的答案或规则</td></tr><tr><td>独立 teacher OPD</td><td>当前 student</td><td>另一模型的下一 token 分布</td><td>独立 teacher</td></tr><tr><td>OPSD</td><td>当前 student</td><td>冻结同模型看标准解后的分布</td><td>标准推理与答案</td></tr></tbody></table></div>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-1.webp" width="1524" height="372" alt="Table 1：原论文按训练数据、反馈密度、采样成本和独立 teacher 比较四类方法。" loading="lazy" decoding="async"></a><figcaption>Table 1 原图 · 原论文按训练数据、反馈密度、采样成本和独立 teacher 比较四类方法。 <a href="https://arxiv.org/pdf/2601.18734v3#page=3">Zhao et al., v3, PDF 第 3 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<p>主实验每题只生成一个最长 1,024 token 的 student 尝试；GRPO 每题生成八个、每个最长 <strong>16,000</strong> token 的尝试，不是 16,384。OPSD 因而减少了生成 token，但还要计算两个分支的完整词表概率，不能仅凭输出长度推断实际 GPU 时间减少相同倍数。teacher 对某一种标准解的偏好，也不等于数学或代码的唯一正确性。</p>

<p>更近的相关工作有三组。<strong>Learning by Distilling Context</strong> 给同模型 teacher 额外上下文，再用它生成的答案做 SFT；OPSD 改成 student 自己采样和软概率监督。<strong>STaR / ReST</strong> 生成尝试、按正确性筛选后训练；OPSD 不要求这条 student 回答先通过答案检查。<strong>In-context Editing</strong> 已用 student 采样与上下文诱导的软分布学习知识编辑；因此“同模型多看 context”本身不是首次出现，本文的重点是推理任务、标准解上下文与逐词表分量截断。同期 SDPO 使用环境反馈，SDFT 研究持续学习，附加信息与任务都不同。</p>

<h2 id="一轮训练：生成、重评、更新">3. Method：一轮训练：生成、重评、更新</h2>

<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-figure-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-figure-1.webp" width="1524" height="621" alt="Figure 1：论文总览：student 自己采样，teacher 多读参考解答后评价同一条回答。" loading="lazy" decoding="async"></a><figcaption>Figure 1 原图 · 论文总览：student 自己采样，teacher 多读参考解答后评价同一条回答。 <a href="https://arxiv.org/pdf/2601.18734v3#page=2">Zhao et al., v3, PDF 第 2 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>

<p><strong>训练只生成一次 student 回答，再用两种输入计算同一回答位置的概率。</strong>先用一条题目理解流程。Figure 2 的原例是求 <code>f(x)=3x²+2x−5</code> 在 <code>x=2</code> 的导数；标准解为 <code>f′(x)=6x+2</code>，所以答案 14。student 只收到题目；teacher 额外收到这条标准解及“理解后按自己的方法解答”的过渡说明。这个说明让后续 prefix 在语言上自然衔接，teacher 本身并不另外生成一条推理。</p>
<ol><li>数据整理器从同一记录构造仅含题目的 student 输入，和包含题目、标准解的 teacher 输入。</li><li>当前 student 生成一份回答，不提前筛掉错误尝试。</li><li>把完全相同的回答 token 拼到两种输入后；teacher 不用标准解替换 student 轨迹。</li><li>两分支一次批量前向计算各回答位置的完整词表概率。只有回答位置计入损失，题目与标准解位置不计。</li><li>teacher 输出不反传梯度；训练更新 student 的 LoRA 参数。LoRA 是附加在冻结基础模型上的低秩可训练参数。</li></ol>

<div class="formula">L = Eᵧ∼student [(1/|y|) Σₜ Σᵥ qₜ(v) log(qₜ(v)/pₜ(v))]</div>

<p><code>pₜ</code> 是 student 只看题目和已写 prefix 的概率，<code>qₜ</code> 是 teacher 还看标准解的概率；对词表 <code>v</code> 求和是 <strong>forward KL，KL(q‖p)</strong>，然后对回答位置平均。这是<strong>截断前</strong>的分布损失。即使 student 在某一处采到了一个错误 token，监督仍包含其他候选 token，而不只给这个被选词一个分数。</p>

<p>假设一个简化位置只有两种候选，teacher 对“14 / 错误候选”的概率为 (0.8,0.2)，student 为 (0.5,0.5)，KL 为 <code>0.8 ln(1.6)+0.2 ln(0.4)≈0.193</code>；student 改为 (0.7,0.3) 后降到约 0.026。这里的概率和单 token 假设均为本文示意，并非论文模型输出。它解释分布如何靠近，不证明整条推理正确。</p>

<div class="code-scroll"><pre><code># 根据固定公开版本整理的流程伪代码，不是可直接运行的训练器
y = student.generate(problem)
with student.disable_adapter():   # 冻结的 base checkpoint 充当 teacher
    q = teacher_logits(problem, reference_solution, y.prefixes)
p = student_logits(problem, y.prefixes)
loss = KL(q || p)                  # completion positions only</code></pre></div>
<p>固定 teacher 在代码中通过暂时关闭 LoRA adapter 实现。<code>opsd_trainer.py::generalized_jsd_loss</code> 的 <code>beta=0</code> 是 forward KL，<code>beta=1</code> 是 reverse KL；主结论使用前者。<code>jsd_token_clip</code> 在词表分量求和前逐项设置<strong>上限</strong>，不是先算完整 token KL 再截断，更不是把值限制在 <code>[-τ,+τ]</code>。</p>

```python
# 固定公开代码的 forward-KL 分支；q 已停止梯度。
component = q * (log_q - log_p)       # [batch, 回答位置, 词表]
component = component.clamp(max=tau) # 只封顶正贡献，负贡献不设下限
loss = component[completion_mask].sum() / completion_mask.sum()
```

<p>单个 <code>q·log(q/p)</code> 可以是负数。把大的正项封顶、保留负项后，总损失也可能为负，仓库 README 同样提醒了这一点；不能把截断后的值当成始终非负的“概率距离”。代码在整个 batch 的有效回答位置上平均，长回答占更多位置；论文 Algorithm 1 则写为先逐回答平均、再逐样本平均。变长回答下这两种聚合不同，复现时应明确选哪一种。</p>

<p>公开默认参数也不等于论文主实验：<code>fixed_teacher=False</code> 时，用当前 student 权重做 teacher；主实验启动脚本明确加了 <code>--fixed_teacher</code>。当前仓库还有 EMA teacher、先生成 teacher 推理、只取概率最高若干候选词等选项；本文的主链不包含这些路径。脚本中 1.7B/4B 的截断上限为 0.05、8B 为 0.06；README 另列的非 thinking 实验用了更小上限，不能混成同一配置。</p>

<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-figure-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-figure-2.webp" width="1524" height="768" alt="Figure 2：导数题的两份原始提示。teacher 看见参考解答；这张图展示输入，不是测试日志。" loading="lazy" decoding="async"></a><figcaption>Figure 2 原图 · 导数题的两份原始提示。teacher 看见参考解答；这张图展示输入，不是测试日志。 <a href="https://arxiv.org/pdf/2601.18734v3#page=4">Zhao et al., v3, PDF 第 4 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>

<h2 id="评测规则、主结果与消融">4. Experiments：评测规则、主结果与消融</h2>

<p><strong>数学实验支持少量 student 生成配合完整分布监督，但结果采用最佳训练版本。</strong>训练最多 30K OpenThoughts 数学题，Qwen3-1.7B、4B、8B，batch 32、学习率 <code>5e-6</code>、LoRA rank 64 与 alpha 128，100 次更新。主实验 student 关闭 thinking mode，teacher 开启；训练生成 temperature 为 1.1。训练用八张 A100 或 H100、AdamW、bfloat16。评测开启 thinking，temperature=1.0、top-p=.95、top-k=-1，每条最多 <strong>38,912 token</strong>。关闭 thinking 的训练输出，不能与开启 thinking 的测试推理长度混为同一预算。</p>

<p><strong>Avg@12</strong> 是一道题独立生成 12 次后，正确次数除以 12，再对所有题平均；不是 12 次有一次正确就算该题通过。若一道题 12 次答对 5 次，贡献 5/12≈41.7%，不是 100%。Table 2 最后再等权平均 AIME24、AIME25、HMMT25：1.7B 的 <code>(57.2+43.9+29.2)/3=43.43</code>，得到 43.4。</p>

<div class="table-scroll"><table><thead><tr><th>模型</th><th>Base</th><th>SFT</th><th>GRPO</th><th>OPSD</th></tr></thead><tbody><tr><td>Qwen3-1.7B</td><td>37.1</td><td>35.8</td><td>37.7</td><td><strong>43.4</strong></td></tr><tr><td>Qwen3-4B</td><td>61.2</td><td>58.6</td><td>62.7</td><td>63.6</td></tr><tr><td>Qwen3-8B</td><td>61.8</td><td>59.8</td><td>64.0</td><td>64.8</td></tr></tbody></table></div>

<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-figure-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-figure-3.webp" width="1524" height="588" alt="Figure 3：训练步数、生成 token 与 GRPO 零奖励标准差批次的原始曲线。生成 token 较少不等于总 GPU 成本同比降低。" loading="lazy" decoding="async"></a><figcaption>Figure 3 原图 · 训练步数、生成 token 与 GRPO 零奖励标准差批次的原始曲线。生成 token 较少不等于总 GPU 成本同比降低。 <a href="https://arxiv.org/pdf/2601.18734v3#page=6">Zhao et al., v3, PDF 第 6 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>

<p>OPSD 每 20 步评测，取 100 步以内最好成绩；GRPO 取 500 步内峰值。它们不是同一个固定训练步的比较，也没有提供多种独立训练 seed 的稳定排名。OPSD 对 1.7B 提升 6.3 个百分点，但 8B 在 HMMT25 为 45.8，低于 GRPO 的 46.7；平均更高不意味着每个任务都更高。</p>

<p>Table 2 没有说明这些峰值是否来自同一个共同 checkpoint，或各测试集分别挑最好；因此不能把表格理解成一个预先固定 checkpoint 的最终测试。SFT 的退化被作者归因于参考解较简短、导致测试推理变短，这是原文的解释，不是单独控制解答长度后证实的因果结论。</p>

<p>分布方向消融用 Qwen3-1.7B 的 AIME25 Avg@12：forward KL 在 step 50/100 为 43.9/41.1，reverse KL 为 37.5/35.0，JSD 为 36.9/39.0，base 为 36.7。forward KL 仍会从峰值回落，不应写成持续单调提升。</p>

<p>完整词表与只看采样词的消融是另一设置：Qwen3-4B、训练生成上限 2,048，报告的是 <strong>pass@8</strong>，不是主表 Avg@12。完整词表在 AIME25/HMMT25 为 84.1/60.0，采样词为 82.1/57.3。pass@8 看多次尝试是否能覆盖正确答案，Avg@12 则平均每次尝试的正确率，数值不能直接相减。采样词分支用 <code>log q(yₜ)−log p(yₜ)</code> 作停止梯度的权重，再乘 <code>−log p(yₜ)</code>；它不是把完整词表 KL 简单删掉未采样项。</p>

<p>把生成长度从 1,024 增至 4,096 没有稳定收益；完整词表前向却需要保存“batch × 回答长度 × 词表大小”的概率信息，显存成本高于只取一个词。词类诊断又只平均 10 道题，并按预设关键词区分 math/style，不能把较大数学词 KL 直接当作推理能力证明。GRPO 在该数据上许多采样组全对或全错，组内奖励没有差异，因而缺少更新信号；这不是所有 RL 数据必然发生的性质。</p>

<p>公开代码固定到 <code>ae7d2519e94920c4eb6206c0c26de46d9c50abae</code>。其中 <code>eval/evaluate_math.py</code> 从最后一个 <code>\boxed{...}</code> 提取答案；这是 LaTeX 的方框答案格式。<code>math_verify</code> 解析后检查数学等价，5 秒超时；没有方框答案直接判错，检查异常时退到字符串比较。比如 <code>\boxed{14}</code> 对 14 可判对，普通文字“答案 14”即使数值相同，仍被格式检查拒绝。这是该公开版本的实现，不代表论文当时的所有 grader 细节都已证明完全一致；Figure 2 的导数题也是 prompt 示例，不是实际测试日志。</p>

<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-2.webp" width="1524" height="918" alt="Table 2：三种 Qwen3 规模在 AIME24、AIME25、HMMT25 上的完整 Avg@12 成绩和等权平均。" loading="lazy" decoding="async"></a><figcaption>Table 2 原图 · 三种 Qwen3 规模在 AIME24、AIME25、HMMT25 上的完整 Avg@12 成绩和等权平均。 <a href="https://arxiv.org/pdf/2601.18734v3#page=7">Zhao et al., v3, PDF 第 7 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>

<h2 id="能迁移到哪些数据，应该怎样验证">5. Discussion：能迁移到哪些数据，应该怎样验证</h2>

<p><strong>若换成游戏生成，先检验“看到代码的 teacher 能否正确评价另一种实现”。</strong>标准代码、从代码提取的功能说明、引擎 API 使用信息可以分别作为 teacher 附加输入；student 仍只看原始图文需求。正确程序可能采用完全不同的节点、类名与控制流，不能只因为远离参考风格就长期惩罚它。应准备功能正确但实现不同的程序，用编译、运行和玩法检查确认正确性，再观察 teacher 分布是否仍偏向参考写法。</p><p>这是本文的迁移建议，不是 OPSD 已完成的实验。论文主要使用已含推理过程的数学数据；没有证明代码或其摘要在没有强模型推理轨迹时一定能替代它，也不能用 KL 降低代替可执行验收。</p>

<h2 id="结论与复现边界">6. Conclusion：结论与复现边界</h2>

<p><strong>OPSD 给出了可以直接检查的最小训练流程，但 teacher 偏好仍需要正确性检验。</strong>主论文使用初始冻结 teacher、完整词表 forward KL 和逐分量截断；后来的公开代码还含其他 teacher 更新或损失选项，不能把所有默认值都当成原实验。复现应记录代码 revision、teacher 是否更新、thinking mode、采样长度与 checkpoint 选择。</p><p>固定代码版本未见明确 license，复用前应确认条款。个人兴趣程度 9/10。最值得保留的是当前模型自己采样、同一 prefix 上比较两种上下文的分布；最不能跳过的是标准解质量、替代解法和实际任务判分。</p>

<details><summary>其余 9 项原论文图表：算法、消融与完整配置</summary>
<p>这些图表保留原英文标注和数值。手机上可横向滚动，点击图片可放大；各项均链接到 PDF 原页。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-algorithm-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-algorithm-1.webp" width="1524" height="588" alt="Algorithm 1：原论文的逐样本训练伪代码：先对各回答位置平均，再对批内样本平均。" loading="lazy" decoding="async"></a><figcaption>Algorithm 1 原图 · 原论文的逐样本训练伪代码：先对各回答位置平均，再对批内样本平均。 <a href="https://arxiv.org/pdf/2601.18734v3#page=5">Zhao et al., v3, PDF 第 5 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-3.webp" width="768" height="363" alt="Table 3：Qwen3-1.7B 的 forward KL、reverse KL 与 JSD：第 50 步和第 100 步并列。" loading="lazy" decoding="async"></a><figcaption>Table 3 原图 · Qwen3-1.7B 的 forward KL、reverse KL 与 JSD：第 50 步和第 100 步并列。 <a href="https://arxiv.org/pdf/2601.18734v3#page=7">Zhao et al., v3, PDF 第 7 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-figure-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-figure-4.webp" width="753" height="531" alt="Figure 4：有无逐词表分量截断时，Qwen3-1.7B 在 AIME24 的训练曲线。" loading="lazy" decoding="async"></a><figcaption>Figure 4 原图 · 有无逐词表分量截断时，Qwen3-1.7B 在 AIME24 的训练曲线。 <a href="https://arxiv.org/pdf/2601.18734v3#page=8">Zhao et al., v3, PDF 第 8 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-figure-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-figure-5.webp" width="768" height="492" alt="Figure 5：把 student 训练生成上限从 1,024 增至 4,096 的两项数学测试曲线。" loading="lazy" decoding="async"></a><figcaption>Figure 5 原图 · 把 student 训练生成上限从 1,024 增至 4,096 的两项数学测试曲线。 <a href="https://arxiv.org/pdf/2601.18734v3#page=8">Zhao et al., v3, PDF 第 8 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-4.webp" width="1524" height="279" alt="Table 4：Qwen3-4B、2,048-token 训练长度下，完整词表与采样词目标的 pass@8 消融。" loading="lazy" decoding="async"></a><figcaption>Table 4 原图 · Qwen3-4B、2,048-token 训练长度下，完整词表与采样词目标的 pass@8 消融。 <a href="https://arxiv.org/pdf/2601.18734v3#page=9">Zhao et al., v3, PDF 第 9 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-5.webp" width="1524" height="462" alt="Table 5：十道题、预设词类下的 KL 分析；它测分布差异，不能单独证明数学推理质量。" loading="lazy" decoding="async"></a><figcaption>Table 5 原图 · 十道题、预设词类下的 KL 分析；它测分布差异，不能单独证明数学推理质量。 <a href="https://arxiv.org/pdf/2601.18734v3#page=13">Zhao et al., v3, PDF 第 13 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-6.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-6.webp" width="1218" height="618" alt="Table 6：GRPO 与 OPSD 的训练配置，包括每题采样次数、生成上限和更新步数。" loading="lazy" decoding="async"></a><figcaption>Table 6 原图 · GRPO 与 OPSD 的训练配置，包括每题采样次数、生成上限和更新步数。 <a href="https://arxiv.org/pdf/2601.18734v3#page=13">Zhao et al., v3, PDF 第 13 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-7.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-7.webp" width="915" height="477" alt="Table 7：SFT 训练配置；与主表中模型效果的解释一起阅读。" loading="lazy" decoding="async"></a><figcaption>Table 7 原图 · SFT 训练配置；与主表中模型效果的解释一起阅读。 <a href="https://arxiv.org/pdf/2601.18734v3#page=14">Zhao et al., v3, PDF 第 14 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-distilled-reasoner/source-table-8.webp" target="_blank" rel="noopener"><img src="/lib/papers/self-distilled-reasoner/source-table-8.webp" width="756" height="459" alt="Table 8：测试采样配置：每题 12 次、最多 38,912 token，开启 thinking。" loading="lazy" decoding="async"></a><figcaption>Table 8 原图 · 测试采样配置：每题 12 次、最多 38,912 token，开启 thinking。 <a href="https://arxiv.org/pdf/2601.18734v3#page=14">Zhao et al., v3, PDF 第 14 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站只裁切相邻留白。</figcaption></figure>
</details>

<p class="source-note">主要来源：arXiv v3，Figures 1–3、Table 2、Table 3 与 Appendix B；公开代码固定版本 <code>ae7d2519e94920c4eb6206c0c26de46d9c50abae</code> 的 <code>opsd_trainer.py</code> 和 <code>eval/evaluate_math.py</code>。导数题来自论文 prompt 示例，KL 算例与 Avg@12 说明为本文计算。兴趣程度 9/10 仅表示博客作者个人兴趣。</p>

</div>

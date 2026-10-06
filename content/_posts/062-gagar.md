---
title: "[2026-09-26] Groupwise Agentic Grading and Advantage Redistribution for Code Agent RL"
permalink: "/posts/论文解读/gagar.html"
date: "2026-10-06T09:30:00+08:00"
updated: "2026-10-06T09:30:00+08:00"
cover: "/lib/papers/gagar/cover.svg"
description: "GAGAR 如何在测试通过的 code-agent trajectories 之间比较 patch 质量，再重分配 advantage；拆解 grader、公式、训练结果、bounded implementation 与未公开证据。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "Code Agent"
  - "Reinforcement Learning"
  - "Credit Assignment"
  - "Agentic Judge"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Xiaomi MiMo · arXiv:2609.32577v1 · 最早公开于 2026-09-26</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.32577">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.32577">论文 PDF</a>
</div>

<section class="deck-wrap" aria-label="GAGAR 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · grader、advantage、实验结果与证据边界</strong><a href="/lib/decks/gagar-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/gagar-visual-guide.html" title="GAGAR 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可点左下角返回文章</span></p>
  </div>
</section>

<p class="lead">GAGAR 处理的是 code-agent RL 里一个很具体的问题：同一道任务生成 16 条 trajectories，几条都通过测试时，binary reward 会给它们相同的训练信号。论文增加一个 agentic grader，让它联合查看 repository、完整轨迹、patch 与 test output，再把正 advantage 从质量较差的 passing trajectory 转给更好的实现。</p>

<div class="interest"><b>博客作者兴趣度 8.5 / 10</b><span>评分只表示博客作者本人兴趣程度；主题与 code agent、RL harness 和 agentic judge 直接相关</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>16</strong><span>rollouts per prompt</span></div>
  <div class="metric"><strong>62.2%</strong><span>DeepSWE step 28 avg@3</span></div>
  <div class="metric"><strong>-15.6%</strong><span>mean turns at step 28</span></div>
  <div class="metric"><strong>30 tasks</strong><span>独立质量审计样本量</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>GAGAR 不替代 executable tests。</strong>测试先决定 pass 或 fail，grader 只在 passing candidates 内比较实现质量。</li>
    <li><strong>方法会重新分配 positive advantage。</strong>低质量 pass 让出的训练权重会按质量比例分给其他 passes，而不是直接丢掉。</li>
    <li><strong>最干净的结果是 step 28 的共享 checkpoint。</strong>DeepSWE avg@3 为 62.2% 对 50.2%，同时 turns 与 tokens 更少。</li>
    <li><strong>证据还不足以独立复核 grader。</strong>论文没有发布 grader prompt、训练任务、真实 grading records 或实现代码。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### GRPO、rollout group 和 advantage 是什么？

对一道 coding task，policy 会生成多条完整执行记录。每条记录从读 repository 开始，包含搜索、编辑、运行测试以及最终 patch。论文把每条记录称为一条 **trajectory**，同一 task 的 16 条 trajectories 构成一个 **rollout group**。

测试通过记作 `R=1`，失败记作 `R=0`。GAGAR 沿用 Dr. GRPO 的 mean-centered advantage：

<div class="formula">Aᵢ = Rᵢ - R̄</div>

假设一组 16 条里有 4 条通过，`R̄=0.25`。四条 passing trajectories 的 advantage 都是 `0.75`，其余都是 `-0.25`。因此基础算法知道哪些结果成功，却不知道四个成功 patch 中哪个更精准、哪个带有多余改动。</aside>

## Q1. 为什么 executable tests 还不够？

**测试能验证结果，却不会自动评价实现质量。**

同一个 test suite 可能同时接受两种 patch：一种修复 root cause，只改必要文件；另一种增加特殊分支、修改无关模块，甚至写出只针对已知测试的 workaround。它们的 binary reward 都是 1。训练继续强化这两条 trajectory 时，policy 得不到“应该更像第一种实现”的信号。

GAGAR 要求 grader 比较同一任务的 passing candidates。这样的比较比独立打分多了一层上下文：grader 能看到不同 Agent 如何理解同一个 bug，哪些改动是必要的，哪些只是掩盖症状。failed trajectories 也会放进共享 workspace，帮助 grader 识别已经试过但无效的路线，不过失败样本不参加质量排序。

<figure class="figure wide">
  <img src="/lib/papers/gagar/cover.svg" alt="GAGAR 从 rollout group 到 agentic grading 和 advantage redistribution 的流程">
  <figcaption>根据论文 Figure 1 与 Sections 3.1-3.3 重绘。图中最后一项特意标出：实现中的 λ 上限触发时，正文给出的精确守恒性质不再全部成立。</figcaption>
</figure>

## Q2. 它和 outcome reward、process reward、LLM judge 有什么区别？

**GAGAR 的边界是：保留测试作为 correctness gate，再让一个能操作 repository 的 grader 比较多条完整 trajectory。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>输入</th><th>输出信号</th><th>与 GAGAR 的区别</th></tr></thead>
  <tbody>
    <tr><td>Binary outcome RL / GRPO</td><td>最终 test result</td><td>pass / fail</td><td>同一 group 内的所有 passing trajectories 得到相同 advantage。</td></tr>
    <tr><td>Process reward / step-level credit</td><td>中间步骤或匹配后的 state</td><td>逐步 reward 或 token credit</td><td>code-agent trajectories 很长且 repository state 各自分叉，跨 rollout 对齐中间状态很难。</td></tr>
    <tr><td>Static LLM-as-a-judge</td><td>prompt、answer 或 patch 摘要</td><td>分数或偏好</td><td>GAGAR 的 grader 可以继续读代码、测试日志，并运行 targeted checks。</td></tr>
    <tr><td>Agent-as-a-Judge</td><td>task environment 与 candidate artifacts</td><td>agentic evaluation</td><td>GAGAR 把相似思想放进 online RL，并把排序转成 advantage redistribution。</td></tr>
  </tbody>
</table>
</div>

论文的贡献主要在 credit assignment 组合方式，不是发明了新的 code benchmark，也不是用 grader 覆盖 executable tests。评测仍使用 DeepSWE v1.1 与 SWE-bench Pro。

## Q3. 一组 trajectories 怎样变成新的训练信号？

**流程包含 test filtering、agentic grading、tier-to-factor、redistribution 和 training 五步。**

<ol class="steps">
  <li><b>1 · VERIFY</b><span>先运行任务测试。infrastructure-invalid trajectories 会被 mask；确认的 hack 被改成 reward 0。</span></li>
  <li><b>2 · GRADE</b><span>grader 读取 task、repo、trajectories、patches 与 test outputs，只排序有效的 passing candidates。</span></li>
  <li><b>3 · MAP</b><span>T1 factor 为 1.0 或 0.9；T2 从 0.85 降至 0.4；T3 为 0.2。</span></li>
  <li><b>4 · RESCALE</b><span>对 passing advantages 乘 factor，再用共同的 λ 恢复原有 positive sum。</span></li>
  <li><b>5 · TRAIN</b><span>结果作为 sequence-level advantage，广播到该 trajectory 的 model-generated tokens。</span></li>
</ol>

grader 使用五项 1-5 分标准：Approach Suitability、Implementation Precision、Minimality of Changes、Unintended Side Effects 与 Codebase Consistency。初始加权分数为：

<div class="formula">Wᵢ = 0.30s_app + 0.25s_prec + 0.20s_min + 0.15s_side + 0.10s_style</div>

它随后根据严重问题划分 T1、T2、T3，并允许在 tier 内调整排序或保留 ties。论文要求负面判断引用具体 patch location、trajectory event 或 execution result。

### 一个明确标注的 constructed example

<div class="case">
<h4>这个例子只解释公式，不是论文公开的真实训练样本</h4>
<ol>
  <li>四条 rollout 中两条 pass、两条 fail，因此 `R̄=0.5`。两个 passes 的初始 advantage 都是 `+0.5`。</li>
  <li>假设 grader 把第一个 patch 归为 T1，factor 为 `1.0`；第二个归为 T3，factor 为 `0.2`。</li>
  <li>简单降权后，positive sum 从 `1.0` 变成 `0.6`。GAGAR 计算 `λ=1/0.6≈1.667`。</li>
  <li>两个 passes 的新 advantage 分别为 `0.833` 与 `0.167`，总和仍为 `1.0`；两个 failures 仍为 `-0.5`。</li>
</ol>
</div>

论文没有发布真实 task、candidate patches、grader reasoning 或最终 tier assignment，所以无法从公开材料复原一个真实 GAGAR grading case。这里宁可保留这个缺口，也不把合理猜测写成事实。

### 正文公式和 bounded implementation 的差别

正文 Equation 2 的 rescaling factor 可以精确保持 positive-advantage sum。Appendix A.2 说明训练实现还会使用 `λ_max=1.5`：

<div class="formula">λ_bnd = min(λ, 1.5)</div>

当上面的 constructed example 需要 `λ≈1.667` 时，上限会触发。实现随后重新减去 group mean，因此 ranking 仍在，但 positive sum 和 failed-trajectory advantages 不再严格等于原值。论文附录明确承认这一点；解读时不能只引用正文的 exact conservation。

## Q4. 实验怎样做，结果具体说明了什么？

**最可靠的结论来自 MiMo-V2.6-Flash 的 code-only controlled run，而不是最终 mixed-task 模型与外部模型的横向比较。**

主要对照从同一个 pre-RL SFT checkpoint 出发。训练 batch 为 128 prompts，每个 prompt 生成 16 条 rollouts。评测使用 DeepSWE v1.1 与 SWE-bench Pro，每题生成 3 个 samples，报告 `avg@3`。binary baseline 在 step 28 因性能快速下降而停止，因此共同训练区间只到 step 28。

<figure class="figure wide">
  <img src="/lib/papers/gagar/results.svg" alt="GAGAR 在 DeepSWE step 28 的结果与 30 task 质量审计">
  <figcaption>根据论文 Figures 2-3 重绘。62.2 与 50.2 是图表显示值，直接相减为 12.0 points；论文正文写 12.1 points，可能使用未四舍五入的内部数值。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>DeepSWE v1.1 · step 28</th><th>Binary baseline</th><th>GAGAR</th><th>差值</th></tr></thead>
  <tbody>
    <tr><td>Pass rate avg@3</td><td>50.2%</td><td>62.2%</td><td>+12.0 displayed points</td></tr>
    <tr><td>Mean main-agent turns</td><td>132.3</td><td>111.6</td><td>-15.6%</td></tr>
    <tr><td>Mean total token length</td><td>191.9k</td><td>172.9k</td><td>-9.9%</td></tr>
  </tbody>
</table>
</div>

只降权、不重新分配的 ablation 在 step 28 得到 56.2%，低于完整方法的 62.2%；mean turns 为 143.5 对 111.6，tokens 为 236.0k 对 172.9k。这个对照支持“保持正负 credit 的量级有助于稳定训练”。

另一个结果是 30 个随机 DeepSWE tasks 的质量审计。Claude Opus 5 同时查看两种方法的匿名 trajectories、patches 与 test outcomes。在两组都训练到的最后一个 checkpoint 上，GAGAR 的 rubric-weighted quality 为 4.03，对照为 3.70；passing candidates 的平均 win rate 为 69.8%。样本量较小，而且 judge 仍是 LLM，不能把它等同于真实工程师的 code review。

## Q5. 这套方法下一步最值得验证什么？

**下一步应该把 grader 变成可重复评测的公开对象，并把质量收益连接到真实开发成本。**

第一项需要公开匿名化的 `task + repository snapshot + trajectories + patches + tests + grade` bundle。这样才能检验不同 grader model、prompt 与 temperature 是否产生稳定排序，也能让人类 reviewer 测量 agreement。

第二项需要把 `λ_max` 单独做 ablation。当前论文把 exact sum-preserving method 与 bounded implementation 放在正文和附录两个位置，却没有报告上限触发频率。这个频率决定训练过程中有多少 groups 真正满足正文的守恒性质。

第三项是把“质量”落到开发者成本。比如让 reviewer 在不知道模型来源的情况下记录发现问题所需时间、requested changes 数量，以及 patch 是否能直接 merge。这样的指标比另一个 LLM 的 1-5 分更接近论文声称的 maintainability。

## Q6. 最终应该怎样评价 GAGAR？

**方法抓住了 code-agent RL 中真实存在的盲点，受控实验也有一致信号；公开证据尚不足以判断 grader 是否可靠地识别了好代码。**

<div class="limit-grid">
  <div><b>论文已经支持</b><span>在同一 Flash SFT 起点与 shared training steps 下，GAGAR 的 DeepSWE pass rate 更高，trajectories 更短；downweight-only ablation 也明显更不稳定。</span></div>
  <div><b>论文没有支持</b><span>没有多 seed、置信区间、人工 code-review study，也没有公开 grader prompt、training tasks、真实 case 或实现。</span></div>
  <div><b>不要误读</b><span>step 44/52 的继续训练结果只能说明 GAGAR run 还能继续优化，不能与 step 28 停止的 baseline 当成同预算比较。</span></div>
  <div><b>可复用的设计</b><span>保留 executable correctness gate，在通过样本内部增加质量偏好，并避免简单 downweight 破坏正负 advantage 平衡。</span></div>
</div>

如果研究目标是 Claude Code、Codex 一类完整 software-agent harness，这篇值得读。它提供了一种把 repository-aware review 接进 RL 的方式。复现门槛目前很高；接下来的研究需要公开 grader 的输入和判据，并测量排序稳定性以及它与人工 code review 的一致程度。

<p class="source-note">主要来源：论文 v1 Sections 1-5、Appendix A、Figures 1-4、Tables 1-2。公开 artifact 检查日期：2026-10-06。未发现官方代码仓库、grader prompt、训练任务或逐组 grading records。</p>

</div>

---
title: "[2026-08-26] V-Rubrics: Visual Faithfulness via Rubric-Based Reinforcement Learning"
permalink: "/posts/论文解读/v-rubrics.html"
date: "2026-10-06T10:00:00+08:00"
updated: "2026-10-06T10:00:00+08:00"
cover: "/lib/papers/v-rubrics/cover.svg"
description: "V-Rubrics 怎样把视觉问答拆成 VF、RC、IF criteria，再做 component-wise prefix credit；包含真实 AI2D 样本、judge 输入、reward 重算、结果与公开实现差异。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "Vision-Language Model"
  - "Reinforcement Learning"
  - "Rubric Reward"
  - "Credit Assignment"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">S-Lab, NTU 等 · arXiv:2608.25580v1 · 最早公开于 2026-08-26</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.25580">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.25580">论文 PDF</a>
  <a href="https://github.com/shulin16/v-rubrics">官方代码</a>
  <a href="https://huggingface.co/datasets/v-rubrics/v-rubrics-50k">V-Rubrics 50K</a>
  <a href="https://shulin16.github.io/v-rubrics/">项目页</a>
</div>

<section class="deck-wrap" aria-label="V-Rubrics 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 数据构建、真实 rubric case、prefix credit 与实验边界</strong><a href="/lib/decks/v-rubrics-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/v-rubrics-visual-guide.html" title="V-Rubrics 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可点左下角返回文章</span></p>
  </div>
</section>

<p class="lead">V-Rubrics 认为视觉推理的 reward 太粗。一个模型可以看错图、走错推理，最后碰巧选中正确答案；answer-only reward 仍然给 1。作者把 reference response 拆成多条可独立判断的 rubric items，再将每项 credit 放到对应 response prefix，希望训练信号能指出“哪一条视觉事实或推理成立”。</p>

<div class="interest"><b>博客作者兴趣度 7.5 / 10</b><span>评分只表示博客作者本人兴趣程度；主要价值在细粒度 reward 与公开实现，不代表所有视觉任务都稳定受益</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>50,248</strong><span>RL training examples</span></div>
  <div class="metric"><strong>352,938</strong><span>VF / RC / IF rubric items</span></div>
  <div class="metric"><strong>+1.79</strong><span>knowledge overall vs answer GRPO</span></div>
  <div class="metric"><strong>+0.51</strong><span>visual overall vs answer GRPO</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>V-Rubrics 的贡献是 credit assignment，不是一个新的 evaluation benchmark。</strong>50K 数据用于 GRPO training，最终成绩来自 10 个已有的视觉与知识 benchmark families。</li>
    <li><strong>rubric judge 不看 raw image。</strong>它只读取 model response 和一条 self-contained textual criterion。</li>
    <li><strong>相对 answer-only GRPO 的净增量不大。</strong>两组 overall average 分别提高 1.79 与 0.51 points，而且若干单项下降。</li>
    <li><strong>公开代码很有价值，但不能只运行默认配置就声称复现论文 ablation。</strong>release launcher 的 reward budget、learning rate 与 batch defaults 需要单独核对。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### VF、RC、IF 和 prefix credit 是什么？

一条视觉回答常包含几种不同内容。**Visual Faithfulness (VF)** 检查文字是否与图里可见的对象、数量、关系或数值一致；**Reasoning Consistency (RC)** 检查模型从这些视觉事实推出的结论是否成立；**Instruction Following (IF)** 检查输出格式或任务要求。

**Prefix credit** 指的是一条 rubric 不必把 reward 广播到整个回答。judge 如果能返回支持该判断的原句，系统会找到这句话结束处的 token position，并让该项 advantage 只作用到这一位置之前。论文采用的是 prefix，而不是精确 span：支持句之后的 token 不吃这项 credit，支持句之前的所有 token 都会收到。</aside>

## Q1. 为什么 final-answer reward 无法训练视觉忠实度？

**一条答案可以包含多个局部判断，最终正确与这些判断全部正确不是一回事。**

图表题里，模型可能读错一个柱子的高度，却通过其他线索猜对选项；几何题里，模型可能识别出形状，却使用不成立的关系完成推导。answer-only GRPO 把这些情况都压成一个标量。对于同一 prompt 的 rollouts，模型只知道谁答对，不知道哪条视觉陈述值得保留。

V-Rubrics 先把参考答案拆成 atomic propositions，再让 judge 分别输出 yes/no。正权重 rubric 给 partial credit；负权重 `PITFALL` 描述应避免的错误，一旦确认违反，会取消 answer credit 与正 rubric credit。

<figure class="figure wide">
  <img src="/lib/papers/v-rubrics/cover.svg" alt="V-Rubrics 从视觉问答数据到 rubric-guided GRPO 的流程">
  <figcaption>根据论文 Figures 1-3 与 Sections 3.2-3.5 重绘。最后一栏标出 judge 的输入边界：训练 judge 不读取 raw image。</figcaption>
</figure>

## Q2. 它与已有 VLM RL 和 rubric reward 工作差在哪里？

**论文把三件已有思路接在一起：自动生成 rubric、逐项判断 response、把每项 advantage 放到可对齐的 prefix。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>训练信号</th><th>主要缺口</th><th>V-Rubrics 的位置</th></tr></thead>
  <tbody>
    <tr><td>Answer-only visual RL</td><td>final answer correctness</td><td>无法区分视觉事实、推理和格式错误</td><td>保留 answer reward，同时增加 item-level criteria。</td></tr>
    <tr><td>Holistic LLM judge</td><td>整条 response 的单一分数</td><td>具体错误仍被折叠</td><td>每条 rubric 独立 yes/no，正权重再归一化。</td></tr>
    <tr><td>Rubric-based reward</td><td>criteria 或评分表</td><td>常在 sequence level 聚合</td><td>对每项 rubric 单独做 group-relative standardization。</td></tr>
    <tr><td>Process / token credit</td><td>step 或 token-level signal</td><td>需要可靠地把证据与 response 对齐</td><td>用支持句的 endpoint 生成 prefix mask；对齐失败时退回 sequence-wide。</td></tr>
  </tbody>
</table>
</div>

相较 OMR、MMR1、MM-Eureka 等视觉 RL 系统，这篇论文的重点不在扩大 reasoning trace 数据，而在 reward 的结构。它的 claim 也应限制在这套 Qwen3-VL-8B training stack 上；表格中的 closed-source 与其他 open-source models 使用不同数据和训练预算，不能当成受控方法比较。

## Q3. 50K 数据、judge 和 prefix advantage 是怎样连起来的？

**数据构建与训练 judging 是两个阶段，使用的模型也不同。**

作者先在 OpenMMReasoner-SFT-874K 上微调 Qwen3-VL-8B-Instruct，得到固定的 `πSFT`。同一个 checkpoint 用来生成 rejection-sampling rollouts，也分别初始化可训练的 actor 和固定不更新的 KL reference model。

随后，17 个视觉数据源经过 rule-based filters。每个候选问题由 `πSFT` 生成 8 次：

<div class="table-scroll">
<table>
  <thead><tr><th>8 次 rollout 中正确数</th><th>Difficulty</th><th>是否进入 50K</th></tr></thead>
  <tbody><tr><td>0</td><td>hard</td><td>保留</td></tr><tr><td>1-5</td><td>medium</td><td>保留</td></tr><tr><td>6-7</td><td>simple</td><td>保留</td></tr><tr><td>8</td><td>过于简单</td><td>丢弃</td></tr></tbody>
</table>
</div>

最终得到 18,121 个 hard、25,306 个 medium、6,821 个 simple examples。Gemini-3-Pro 根据 image、instruction 与 reference response 为每条样本生成 JSON rubrics。总计 352,938 条，其中 VF 209,436、RC 101,369、IF 42,133。论文没有报告人工逐条 audit 或 annotator agreement。

### 真实 case：AI2D `original_id=2501`

<div class="case">
<h4>公开数据中的 spring tide 问题</h4>
<ol>
  <li><strong>来源：</strong>AI2D，公开 row UID 为 `chart_02501_3c2e6864`；`rs_score=0/8`，因此归为 hard。</li>
  <li><strong>问题：</strong>`What is represented in this image?` 四个选项中 option 3 是 `spring tide`。</li>
  <li><strong>rubrics：</strong>识别 Sun/Earth/Moon（VF, 5）；识别三者共线（VF, 5）；识别 tidal bulges（VF, 4）；解释引力叠加（RC, 4）；选择 spring tide（IF, 5）；区分 neap tide 的 90° 关系（RC, 3）。</li>
  <li><strong>可见边界：</strong>训练 policy 看 image 和 instruction。rubric judge 只看 model response 与其中一条 criterion，不看 image。</li>
  <li><strong>PASS：</strong>每条 criterion 独立得到 yes/no。一个回答可以通过选项 rubric，同时在视觉与推理 rubrics 上失败。</li>
</ol>
</div>

若模型只回答 `spring tide`，并且 judge 只把 `Selection_of_Spring_Tide` 判为 1，则正 rubric weight 总和是 26，`Rrub=5/26≈0.1923`。论文公式取 `α=0.5`，同时 final-answer reward 为 1，因此 semantic reward 为：

<div class="formula">R = 0.5 × 1 + 0.5 × 0.1923 ≈ 0.5962</div>

这是根据公开 row 与公式重算的 explanatory trace，不是已发布的 reward log。实际 judge 是否会额外判定某条 criterion 成立，要看它对 response 的具体判断。

在 prefix mode 中，每条 rubric 的 yes/no 会在 rollout group 内单独标准化。judge 若返回一段 supporting sentence，代码先做 exact 和 case-insensitive match，再以 fuzzy cutoff 60 尝试对齐；仍找不到时，这一项回退为 sequence-wide credit。

<div class="note red"><p><strong>这个 row 还有一个分类问题：</strong>数据把“选择 spring tide”标成 IF。这个 criterion 更接近 answer correctness，而不是典型的格式或指令约束，说明 VF/RC/IF 标签并不总能把三类能力分得很干净。</p></div>

## Q4. 实验结果到底有多大，哪些 benchmark 没有提升？

**rubric GRPO 相对共同 SFT 起点提升明显；相对 answer-only GRPO 的额外收益是 1.79 与 0.51 points。**

<figure class="figure wide">
  <img src="/lib/papers/v-rubrics/results.svg" alt="V-Rubrics 相对 SFT 和 answer-only GRPO 的结果">
  <figcaption>根据论文 Tables 1-3 重绘。Overall Avg. 是论文所列 metrics 的 unweighted average。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>Model stage</th><th>General + knowledge overall</th><th>Visual reasoning overall</th></tr></thead>
  <tbody><tr><td>SFT</td><td>64.93</td><td>58.45</td></tr><tr><td>Answer-only GRPO</td><td>66.25</td><td>61.94</td></tr><tr><td>Rubric GRPO</td><td>68.04</td><td>62.45</td></tr></tbody>
</table>
</div>

rubric model 并非每项都更高。它在 MMBench-Dev 比 answer-only 低 0.43 points，在 MathVerse V/O 低 2.79，在 CharXiv reasoning 低 0.40；MathVision、DynaMath、WeMath 与 LogicVista 则上升。这个分布与作者的解释一致：rubrics 在多步视觉事实和推理能被 criterion 覆盖时更有帮助，面对 exact symbolic correctness 或数据集特定规范时可能存在 rubric-metric mismatch。

### Table 3 能否证明 prefix localization 有效？

论文的三档结果是 answer-only 66.25、sequence-level rubrics 67.74、component + prefix 68.04。最后 0.30 points 同时包含 component-wise standardization 与 prefix localization，论文自己也没有把两者拆开。

公开仓库还带来另一层复现风险。revision `6515819` 的两个 canonical launcher 默认使用不同 reward budgets：

<div class="table-scroll">
<table>
  <thead><tr><th>公开 mode</th><th>Answer</th><th>Format</th><th>Rubric</th><th>Credit assignment</th></tr></thead>
  <tbody><tr><td>`rubric-sequence`</td><td>0.10</td><td>0.10</td><td>0.80</td><td>sequence-level</td></tr><tr><td>`rubric-prefix`</td><td>0.50</td><td>0.05</td><td>0.45</td><td>component + prefix</td></tr></tbody>
</table>
</div>

论文 Appendix D.2 报告 semantic answer/rubric balance 为 0.5/0.5，并将 format reward 另列。公开 release 的 changelog 说明 prefix 总预算后来规范为 1.0。由这些材料无法确认 Table 3 的 sequence run 是否用了完全相同的 reward budget。因此，公开默认值不能直接用来证明 0.30 points 全来自 credit localization。

## Q5. 如果继续做这条路线，哪些实验最有价值？

**最优先的实验是固定 reward budget，只改变 signal decomposition 与 token mask。**

至少需要四组：answer-only、answer + scalar rubrics、component-wise sequence、component-wise prefix。四组保持 batch size、learning rate、rollout samples 和 answer/rubric/format 总预算一致。这样才能区分收益来自更多监督信息、每项独立标准化，还是 prefix localization。

其次，应增加一组让 judge 看到 raw image 的对照。当前 text-only judge 的优点是便宜且 criteria 容易审计，缺点是 annotation 一旦写错，judge 无法从图像纠正。可以在人类抽样审核过的子集上比较 text-only 与 image-aware judge 的准确率和训练收益。

最后，需要报告自动 rubrics 的质量：随机抽样覆盖每个 source、difficulty 与 criterion type，记录 factual correctness、atomicity、type label、遗漏项及人类一致性。50K 数据规模本身不能回答这些问题。

## Q6. 最终应该怎样评价 V-Rubrics？

**它给出了完整、可运行的细粒度 visual RL pipeline；目前的证据更支持“rubric reward 有增益”，还不足以单独证明 prefix localization 是主要原因。**

<div class="limit-grid">
  <div><b>论文已经支持</b><span>在共同 SFT 起点上，answer-only 与 rubric GRPO 都有提升；rubric model 在两组 overall average 上略高。</span></div>
  <div><b>公开实现的价值</b><span>dataset、reward modules、VERL patch、evaluation runner 与 tests 均已公开，代码边界比多数 reward 论文清楚。</span></div>
  <div><b>最强限制</b><span>rubrics 全部自动生成，judge 不看图，论文没有人工 annotation audit；若 rubric 错了，reward 会稳定地强化错误标准。</span></div>
  <div><b>复现注意</b><span>paper Table 6 与 repository launcher defaults 在 learning rate、batch size 和 reward budgets 上存在差别，需要保留完整 overrides。</span></div>
</div>

这篇适合关心 multimodal RL、LLM judge 与 fine-grained credit assignment 的读者。最可迁移的部分是“把一条结果拆成几条可独立判断的 proposition”；最不该跳过的部分是 rubric 自己由谁生成、judge 看得到什么，以及 ablation 有没有同时修改其他变量。

<p class="source-note">主要来源：论文 v1 全文与附录、V-Rubrics 官方仓库 revision 6515819、V-Rubrics 50K 公开数据 row `chart_02501_3c2e6864`。代码与数据检查日期：2026-10-06。</p>

</div>

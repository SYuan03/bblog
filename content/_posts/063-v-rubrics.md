---
title: "[2026-08-26] V-Rubrics: Visual Faithfulness via Rubric-Based Reinforcement Learning"
permalink: "/posts/论文解读/v-rubrics.html"
date: "2026-10-06T10:00:00+08:00"
updated: "2026-10-06T14:41:16+08:00"
cover: "/lib/papers/v-rubrics/cover.svg"
description: "V-Rubrics 怎样把视觉回答拆成视觉忠实度、推理一致性和指令遵循三类评分项，再把训练权重分配到相关回答前缀；包含真实 AI2D 样本、判分输入、奖励重算与公开实现差异。"
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
  <div class="deck-head"><strong>12 页交互图解 · 数据构建、真实评分案例、前缀归因与实验边界</strong><a href="/lib/decks/v-rubrics-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/v-rubrics-visual-guide.html" title="V-Rubrics 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可点左下角返回文章</span></p>
  </div>
</section>

<p class="lead">V-Rubrics 认为视觉推理的奖励太粗。模型即使看错图、推理出错，也可能碰巧选中正确答案；只检查最终答案的奖励（answer-only reward）仍然会给 1。作者把参考回答拆成多条可独立判断的评分项（rubric items），再把每项训练权重放到与它相关的回答前缀，希望模型知道“究竟是哪一条视觉事实或推理成立”。</p>

<div class="interest"><b>博客作者兴趣度 7.5 / 10</b><span>评分只表示博客作者本人兴趣程度；主要价值在细粒度奖励与公开实现，不代表所有视觉任务都稳定受益</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>50,248</strong><span>强化学习训练样本</span></div>
  <div class="metric"><strong>352,938</strong><span>视觉事实、推理与指令遵循三类评分项</span></div>
  <div class="metric"><strong>+1.79</strong><span>知识类平均分相对只看答案的 GRPO</span></div>
  <div class="metric"><strong>+0.51</strong><span>视觉推理平均分相对只看答案的 GRPO</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>V-Rubrics 的贡献是训练权重归因，不是一个新的评测基准。</strong>50K 数据用于 GRPO 训练；GRPO 指按同一道题的多次回答做相对比较，再更新模型。最终成绩来自 10 组已有的视觉与知识评测。</li>
    <li><strong>评分项判分模型不看原图。</strong>它只读取模型回答和一条本身包含判断所需信息的文字标准。</li>
    <li><strong>相对只看最终答案的 GRPO，额外提升不大。</strong>知识类和视觉推理类平均分分别提高 1.79 与 0.51 个百分点，而且若干单项下降。</li>
    <li><strong>公开代码很有价值，但不能只运行默认配置就声称复现论文消融实验。</strong>启动脚本的奖励权重、学习率与批大小默认值需要单独核对。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 视觉忠实度、推理一致性、指令遵循与前缀归因是什么？

一条视觉回答常包含几种不同内容。**Visual Faithfulness (VF，视觉忠实度)** 检查文字是否与图里可见的对象、数量、关系或数值一致；**Reasoning Consistency (RC，推理一致性)** 检查模型从这些视觉事实推出的结论是否成立；**Instruction Following (IF，指令遵循)** 检查输出格式或任务要求。GRPO 是一种按同一道题多次回答的相对得分更新模型的强化学习方法。

**Prefix credit（前缀归因）** 指一条评分项不必把奖励施加到整段回答。判分模型如果能返回支持该判断的原句，系统会找到这句话结束处的 token（模型处理的文本单位），并让该项 advantage（在组内标准化后的训练权重）只作用到这一位置之前。论文使用的是整段前缀，而不是只覆盖精确文本片段：支持句之后的 token 不接收这项权重，支持句及其之前的 token 都会收到。</aside>

## Q1. 为什么只看最终答案的奖励无法训练视觉忠实度？

**一条答案可以包含多个局部判断，最终正确与这些判断全部正确不是一回事。**

图表题里，模型可能读错一个柱子的高度，却通过其他线索猜对选项；几何题里，模型可能识别出形状，却使用不成立的关系完成推导。只看最终答案的 GRPO 把这些情况都压成一个数值。对于同一问题的多次生成结果，模型只知道哪次答对，不知道哪条视觉陈述值得保留。

V-Rubrics 先把参考答案拆成“每条只表达一个事实或推理”的判断项，再让判分模型分别输出是或否。正权重评分项提供部分得分；`PITFALL` 是描述“回答中不能出现什么错误”的负权重条目，一旦判分模型认定回答触发了它，最终答案得分与正评分项得分都会被取消。

<figure class="figure wide">
  <img src="/lib/papers/v-rubrics/cover.svg" alt="V-Rubrics 从视觉问答数据、逐项判分到组内相对训练的流程">
  <figcaption>根据论文图 1-3 与第 3.2-3.5 节重绘。最后一栏标出判分模型的输入边界：训练时的判分模型不读取原图。</figcaption>
</figure>

## Q2. 它与已有视觉模型强化学习和评分项奖励有什么区别？

**论文把三件已有思路接在一起：自动生成评分项、逐项判断回答，再把每项 advantage 放到能够对齐的回答前缀。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>训练信号</th><th>主要缺口</th><th>V-Rubrics 的位置</th></tr></thead>
  <tbody>
    <tr><td>只看答案的视觉强化学习</td><td>最终答案是否正确</td><td>无法区分视觉事实、推理和格式错误</td><td>保留答案奖励，同时增加逐项评分标准。</td></tr>
    <tr><td>大语言模型（LLM）整段判分</td><td>整条回答的单一分数</td><td>具体错误仍被折叠</td><td>每条评分项独立判断是或否，再归一化正权重。</td></tr>
    <tr><td>基于评分项的奖励</td><td>多条判断标准或评分表</td><td>常把各项分数汇总到整段回答</td><td>每条评分项分别在同一道题的多次回答中做标准化。</td></tr>
    <tr><td>过程归因 / token 归因</td><td>每一步或每个 token 的信号</td><td>需要可靠地把证据与回答位置对齐</td><td>用支持句的结束位置生成前缀遮罩；对齐失败时退回整段回答。</td></tr>
  </tbody>
</table>
</div>

相较 OMR、MMR1、MM-Eureka 等视觉强化学习系统，这篇论文的重点不在扩大推理轨迹数据，而在改变奖励结构。结论也应限制在这套 Qwen3-VL-8B 训练配置上；表格中的闭源模型和其他开源模型使用不同数据与训练预算，不能当成受控方法比较。

## Q3. 50K 数据、判分模型和前缀权重是怎样连起来的？

**数据构建与训练时判分是两个阶段，使用的模型也不同。**

作者先在 OpenMMReasoner-SFT-874K 上做监督微调（SFT），得到固定的 `πSFT` 模型。这个模型存档用来反复生成候选回答并按正确性筛选，也分别初始化可训练的策略模型和固定不更新的参考模型；后者用于计算 KL 距离，也就是衡量训练后的回答分布偏离起点有多远。

随后，17 个视觉数据源经过基于规则的过滤。`πSFT` 对每个候选问题生成 8 次回答：

<div class="table-scroll">
<table>
  <thead><tr><th>8 次回答中的正确数</th><th>难度</th><th>是否进入 50K</th></tr></thead>
  <tbody><tr><td>0</td><td>困难</td><td>保留</td></tr><tr><td>1-5</td><td>中等</td><td>保留</td></tr><tr><td>6-7</td><td>简单</td><td>保留</td></tr><tr><td>8</td><td>过于简单</td><td>丢弃</td></tr></tbody>
</table>
</div>

最终得到 18,121 个困难样本、25,306 个中等样本和 6,821 个简单样本。Gemini-3-Pro 根据图像、问题指令与参考回答，为每条样本生成 JSON 格式的评分项。总计 352,938 条，其中 VF 209,436、RC 101,369、IF 42,133。论文没有报告人工逐条审计或标注者一致性。

### 真实案例：AI2D `original_id=2501`

<div class="case">
<h4>公开数据中的 spring tide 问题</h4>
<ol>
  <li><strong>来源：</strong>AI2D，公开数据行的 UID（唯一编号）为 `chart_02501_3c2e6864`；`rs_score` 记录固定模型 8 次回答中的正确次数，`rs_score=0/8` 因此表示 8 次都答错，样本被归为困难。</li>
  <li><strong>问题：</strong>`What is represented in this image?`，即“图中表示什么？”；四个选项中的第 3 项是 `spring tide（大潮）`。</li>
  <li><strong>评分项：</strong>识别太阳、地球、月球（VF, 5）；识别三者共线（VF, 5）；识别潮汐隆起（VF, 4）；解释引力叠加（RC, 4）；选择大潮（IF, 5）；区分小潮需要 90° 夹角（RC, 3）。</li>
  <li><strong>可见边界：</strong>待训练模型能看图像和问题指令。评分项判分模型只看模型回答与其中一条判断标准，不看原图。</li>
  <li><strong>通过条件：</strong>每条判断标准独立得到“是”或“否”。一个回答可以通过选项评分项，同时在视觉与推理评分项上失败。</li>
</ol>
</div>

若模型只回答 `spring tide`，并且判分模型只把 `Selection_of_Spring_Tide` 这一项判为 1，则正评分项的权重总和是 26，`Rrub=5/26≈0.1923`。论文公式取 `α=0.5`，最终答案奖励为 1，因此语义奖励为：

<div class="formula">R = 0.5 × 1 + 0.5 × 0.1923 ≈ 0.5962</div>

这是根据公开数据行与公式重算的解释性过程，不是作者发布的真实奖励日志。判分模型是否会额外认定其他评分项成立，要看它对具体回答的判断。

在前缀模式中，每条评分项的“是/否”结果会在同一道题的多次回答中单独标准化。判分模型若返回一段支持句，代码先做完全匹配和忽略大小写的匹配，再用阈值 60 的模糊匹配尝试定位；仍找不到时，这项权重退回整段回答。

<div class="note red"><p><strong>这个数据行还有一个分类问题：</strong>数据把“选择大潮”标成 IF。这个判断更接近答案正确性，不是典型的格式或指令约束，说明 VF、RC、IF 标签并不总能把三类能力分得很干净。</p></div>

## Q4. 实验结果到底有多大，哪些评测没有提升？

**使用评分项奖励的 GRPO 相对共同 SFT 起点提升明显；相对只看答案的 GRPO，额外收益是 1.79 与 0.51 个百分点。**

<figure class="figure wide">
  <img src="/lib/papers/v-rubrics/results.svg" alt="V-Rubrics 相对 SFT 和 answer-only GRPO 的结果">
  <figcaption>根据论文表 1-3 重绘。`Overall Avg.`（总体平均分）指论文所列指标的简单平均，每项权重相同。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>模型阶段</th><th>通用与知识类平均分</th><th>视觉推理类平均分</th></tr></thead>
  <tbody><tr><td>SFT</td><td>64.93</td><td>58.45</td></tr><tr><td>只看答案的 GRPO</td><td>66.25</td><td>61.94</td></tr><tr><td>评分项 GRPO</td><td>68.04</td><td>62.45</td></tr></tbody>
</table>
</div>

评分项模型并非每项都更高。它在 MMBench-Dev 上比只看答案的模型低 0.43 个百分点，在 MathVerse V/O 上低 2.79，在 CharXiv 推理项上低 0.40；MathVision、DynaMath、WeMath 与 LogicVista 则上升。作者认为，多步视觉事实和推理若能被评分项覆盖，方法更容易奏效；对于要求符号答案完全准确或带有数据集特定规范的任务，评分项和最终评测指标可能并不一致。

### 表 3 能否证明前缀定位有效？

论文的三档结果是：只看答案为 66.25；把评分项作用于整段回答为 67.74；逐项标准化并作用于前缀为 68.04。最后 0.30 个百分点同时包含“每项分别标准化”和“前缀定位”两处变化，论文自己也没有把两者拆开。

公开仓库还带来另一层复现风险。版本 `6515819` 的两个官方启动脚本默认使用不同的奖励权重：

<div class="table-scroll">
<table>
  <thead><tr><th>公开模式</th><th>答案奖励</th><th>格式奖励</th><th>评分项奖励</th><th>权重作用范围</th></tr></thead>
  <tbody><tr><td>`rubric-sequence`</td><td>0.10</td><td>0.10</td><td>0.80</td><td>整段回答</td></tr><tr><td>`rubric-prefix`</td><td>0.50</td><td>0.05</td><td>0.45</td><td>逐项标准化后作用于前缀</td></tr></tbody>
</table>
</div>

论文附录 D.2 报告答案与评分项的语义奖励比例为 0.5/0.5，并将格式奖励另列。公开版本的变更记录说明，前缀模式的总奖励权重后来才统一为 1.0。由这些材料无法确认表 3 的整段回答模式是否使用了完全相同的奖励权重。因此，公开默认值不能直接证明 0.30 个百分点全部来自前缀定位。

## Q5. 如果继续做这条路线，哪些实验最有价值？

**最优先的实验是固定各项奖励的总权重，只改变奖励如何拆分以及哪些 token 接收权重。**

至少需要四组：只看答案；答案加汇总后的评分项；评分项分别标准化但作用于整段回答；评分项分别标准化并作用于前缀。四组保持批大小、学习率、每题生成次数，以及答案/评分项/格式奖励的总权重一致。这样才能区分收益来自更多监督信息、每项独立标准化，还是前缀定位。

其次，应增加一组让判分模型看到原图的对照。当前只看文字的判分模型更便宜，评分标准也容易审计；但自动标注一旦写错，它无法回到图像纠正。可以在人类抽样审核过的子集上，比较只看文字和同时看图的判分模型准确率及训练收益。

最后，需要报告自动评分项的质量：随机抽样覆盖每个数据来源、难度与评分项类型，记录事实是否正确、一条评分项是否只表达一个判断、类型标签是否合适、有无遗漏，以及人类标注者是否一致。50K 数据规模本身不能回答这些问题。

## Q6. 最终应该怎样评价 V-Rubrics？

**它给出了完整、可运行的细粒度视觉强化学习流程；目前的证据更支持“评分项奖励有增益”，还不足以单独证明前缀定位是主要原因。**

<div class="limit-grid">
  <div><b>论文已经支持</b><span>从共同的 SFT 起点出发，只看答案和使用评分项的 GRPO 都有提升；评分项模型在两组总体平均分上略高。</span></div>
  <div><b>公开实现的价值</b><span>数据集、奖励模块、开源强化学习训练框架 VERL 的修改补丁、评测程序与测试均已公开，代码边界比多数奖励论文清楚。</span></div>
  <div><b>最强限制</b><span>评分项全部自动生成，判分模型不看图，论文也没有人工标注审计；若评分项写错，奖励会稳定地强化错误标准。</span></div>
  <div><b>复现注意</b><span>论文表 6 与仓库启动脚本默认值在学习率、批大小和奖励权重上存在差别，复现时需要保存全部参数覆盖项。</span></div>
</div>

这篇适合关心多模态强化学习、大语言模型判分与细粒度训练权重归因的读者。最可迁移的部分是“把一条回答拆成几条可独立判断的陈述”；最不该跳过的部分是评分项由谁生成、判分模型看得到什么，以及消融实验有没有同时修改其他变量。

<p class="source-note">主要来源：论文 v1 全文与附录、V-Rubrics 官方仓库版本 6515819、V-Rubrics 50K 公开数据行 `chart_02501_3c2e6864`。代码与数据检查日期：2026-10-06。</p>

</div>

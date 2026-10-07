---
title: "[2026-09-03] EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness?"
permalink: "/posts/论文解读/evoharnessbench.html"
date: "2026-10-08T00:08:00+08:00"
updated: "2026-10-08T00:08:00+08:00"
cover: "/lib/papers/evoharnessbench/cover.svg"
description: "EvoHarnessBench 不是让 Agent 写 harness，而是把 tools、skills、specialist agents 分阶段扩张，测试部署退化、持久适应、forward transfer 与 forgetting。本文明确它与 harness coding 的边界，并拆解 17 条 streams、802 个任务与三条演化轴。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 10
categories:
  - "论文解读"
tags:
  - "Agent Harness"
  - "Coding Agent"
  - "Harness Engineering"
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">arXiv:2609.04280v1 · 最早公开于 2026-09-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.04280">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.04280">论文 PDF</a>
  <a href="https://mas-orchestra.salesforceresearch.ai/evoharness/">项目页</a>
</div>

<section class="deck-wrap" aria-label="EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness? 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/evoharnessbench-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/evoharnessbench-visual-guide.html" title="EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness? 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">EvoHarnessBench 不是让 Agent 写 harness，而是把 tools、skills、specialist agents 分阶段扩张，测试部署退化、持久适应、forward transfer 与 forgetting。本文明确它与 harness coding 的边界，并拆解 17 条 streams、802 个任务与三条演化轴。</p>
<div class="interest"><b>博客作者兴趣度 7.8 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>17</strong><span>evolution streams</span></div>
  <div class="metric"><strong>802</strong><span>unique tasks</span></div>
  <div class="metric"><strong>520 / 42 / 62</strong><span>tools / skills / agents</span></div>
  <div class="metric"><strong>−34.7%</strong><span>最严重 agent-axis BWT</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>独特贡献 把 tools、skills、agents 三种扩张拆开，并同时报告 BWT/FWT。 边界 benchmark 本身不要求 Agent 编写 harness。 构造风险 skill association 是规则匹配，不是完整因果标注。 推荐对象 已经读完前几篇、想补长期部署视角的读者。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>这篇与前八篇的方向相反：外部平台在增加 tools、skills 或 specialist agents，被测系统要适应变化。code-based Meta-Harness 只是若干 adaptation baseline 之一；benchmark 本身不要求每个 Agent 都写 harness code。</p></aside>

## Q1. 为什么把外部 harness 的持续扩张当成独立问题？

<p><strong>因为部署中的 harness 不会静止：工具目录、技能库和 specialist roster 会不断扩张，旧经验可能失效，选择空间也会变大。</strong>EvoHarnessBench 同时测新能力能否学会，以及旧能力会不会因更大的 harness 或累积状态而遗忘。</p>

## Q2. 它和“让 Agent 写 harness code”的工作到底差在哪？

<p><strong>它主要测“适应外部 harness 演化”，不是直接测“能否写 harness code”。</strong>deployment 模式每阶段重新实例化，只观察更大 capability pool 的直接影响；self-evolving adaptation 才允许 memory、prompt 或 code 跨阶段保留。Meta-Harness 在这里是一个 code-based baseline，不是 benchmark 的唯一任务定义。</p><p>因此把它纳入这组阅读的价值是提供下游压力测试：前八篇产出的动态 harness 若真的投入长期部署，应该同时报告这里的 retention 与 adaptation，而不能只看当前阶段分数。</p>

## Q3. 17 条 streams、三条 axis 与两种模式怎样构造？

<p><strong>数据包含 17 条 stream、每条 3–6 stages、802 个 unique tasks；按 axis 展开后是 1,510 个 examples。</strong>能力宇宙含 520 tools、42 latent skills、62 specialist agents。每项能力按任务频率从 core 到 long tail 分批释放，任务在全部必需能力首次可用时引入，并至少需要本 stage 的一个新能力。</p><p>tools 直接继承源 benchmark 的 oracle annotations；skills 从 procedural rules 挖掘，再按 verifier keyword 关联，作者明确承认这些匹配不是必要、充分或唯一的技能解释；agents 则按 tool owner 分组，lead agent 无直接工具。</p><div class="formula">BWT = weighted(final old-task accuracy − introduction accuracy)<br>FWT = weighted(post-adaptation new-task accuracy − pre-adaptation accuracy)</div><p>另报 final cumulative ACC、tokens、tool calls 和 latency。BWT 看遗忘，FWT 看新阶段适应，两者不能用一个总分替代。</p>

## Q4. tools、skills、agents 三组结果分别暴露什么瓶颈？

<p><strong>三条 axis 的困难不同：tools 是检索噪声，skills 是会不会真的调用，agents 是 recall 与 coordination。</strong>tools 的累计目录有时提分，却显著加成本；EOG 上 MemToolAgent 38.6%、ReasoningBank 36.9%、Meta-Harness 35.2%，deployment 为 30.2%。ALE 多数方法接近或低于 baseline。</p><p>skills 扩张本身影响小；GEPA 在 EOG 从 18.9% 到 24.1%，但 GPT-5 默认系统几乎不调用 offered skills。agents 上 Meta-Harness 在 EOG 从 8.8% 到 18.5%，ALE 多数方法不改善。selection precision 已约 90%，瓶颈主要是 required-agent recall 和选中后的 coordination。</p><div class="case"><h3>为什么 retention 与 adaptation 必须分开？</h3><p>跨 axis 最坏 forgetting 分别是 tools −5.3%、skills −4.0%、agents −34.7%；最佳相对 adaptation gain 又分别达到 +27.8%、+27.5%、+110.2%。一个方法完全可能更少忘旧题，却在新阶段出现负 FWT。</p></div>

## Q5. harness coding 研究者应该怎样使用这个 benchmark？

<p><strong>把它用作“演化后 harness 的持续部署回归集”，而不是拿它替代 harness-coding benchmark。</strong>创建或修复系统后，应让新工具、skill、agent 分阶段进入，分别测 fresh deployment 与 persistent adaptation；同时记录 catalog size、routing recall、token/call cost 与 old/new cohort matrix。</p><p>项目页可访问，但截至 2026-10-08 未链接独立公开 code/checker repository。skills 的 rule-based annotation 也只是一种 proxy；若把低 skill overlap 直接解释成模型缺能力，会混入 annotation incompleteness。</p>

## Q6. 最后怎样评价 EvoHarnessBench？

<p><strong>EvoHarnessBench 对“写 harness code”的相关性是间接但重要的。</strong>它提醒我们，一个今天高分的 harness，在工具或 agent 池扩大后可能迅速退化；而持续写 prompt/code 的 adaptation 也可能保住旧能力却伤害新任务。</p><div class="limit-grid"><div><b>独特贡献</b><span>把 tools、skills、agents 三种扩张拆开，并同时报告 BWT/FWT。</span></div><div><b>边界</b><span>benchmark 本身不要求 Agent 编写 harness。</span></div><div><b>构造风险</b><span>skill association 是规则匹配，不是完整因果标注。</span></div><div><b>推荐对象</b><span>已经读完前几篇、想补长期部署视角的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：availability checked 2026-10-08; project page available but no dedicated public code/checker repository linked。</p>

<aside class="source-note"><p>论文列出的来源、筛选、split 与泄漏风险都在正文中单独说明。任务检查、标注来源与无法从公开材料确认的部分均被明确区分。文章明确区分 evaluated system 可见内容与隐藏 test、checker 或 reference。分数公式、聚合层级、分母和不确定性按论文协议解释。至少一个具体执行案例从输入、修改、运行一直追到 PASS 或 FAIL。公开材料不足时，文章不会把推测伪装成官方 checker 实现。模型、harness、预算、重复次数、失败运行和主结果没有混成单一排行榜。相邻工作按修改对象、反馈、隐藏边界和交付物比较。文章把外部有效性、方差、checker blind spot 与公开 artifact 缺口列为结论边界。</p></aside>
</div>

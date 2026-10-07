---
title: "[2026-09-01] HarnessDev: Can LLMs Create and Evolve Their Own Agent Harness?"
permalink: "/posts/论文解读/harnessdev.html"
date: "2026-10-08T00:00:00+08:00"
updated: "2026-10-08T00:00:00+08:00"
cover: "/lib/papers/harnessdev/cover.svg"
description: "HarnessDev 把评测对象从任务答案换成可运行的 harness：六个模型从弱 seed 创建完整执行系统，再用下游反馈继续演化。本文拆解任务边界、隐藏评测、执行器迁移、真实失败与 2,207 个实例上的结果。"
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

<p class="paper-meta">arXiv:2609.01437v1 · 最早公开于 2026-09-01</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.01437">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.01437">论文 PDF</a>
  <a href="https://self-developing-agents.github.io/">项目页</a>
</div>

<section class="deck-wrap" aria-label="HarnessDev: Can LLMs Create and Evolve Their Own Agent Harness? 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harnessdev-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harnessdev-visual-guide.html" title="HarnessDev: Can LLMs Create and Evolve Their Own Agent Harness? 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">HarnessDev 把评测对象从任务答案换成可运行的 harness：六个模型从弱 seed 创建完整执行系统，再用下游反馈继续演化。本文拆解任务边界、隐藏评测、执行器迁移、真实失败与 2,207 个实例上的结果。</p>
<div class="interest"><b>博客作者兴趣度 9.6 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>2,207</strong><span>unique downstream instances</span></div>
  <div class="metric"><strong>18</strong><span>独立创建的 Code harness</span></div>
  <div class="metric"><strong>67.8 vs 86.2</strong><span>最佳 Self-Eval vs 人工 reference</span></div>
  <div class="metric"><strong>+4.44 pp</strong><span>最大 held-out Evolution 增益</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>最强证据 2,207 个唯一实例、avg@3 创建、630 个后验 held-out，以及 26,679 条运行轨迹。 最大风险 人工 reference 不是统一模型下的 paired control；公开 checker 与 artifacts 尚不可得。 工程启示 检查“机制是否进入真实主路径”，比统计代码行数或自测次数更有用。 推荐对象 想系统理解 harness creation、evolution 与 transfer 的读者。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>这里的 harness 是模型权重之外的执行系统：它决定 prompt、工具、循环、上下文、状态、恢复与验证。HarnessDev 不让模型直接解隐藏题，而是让 creator model 写出这套系统，再由 executor model 通过它解题。</p></aside>

## Q1. HarnessDev 为什么把“可运行基础设施”当成新的评测对象？

<p><strong>它要测的是模型能否把一个只规定输入、输出和审计接口的弱 seed，发展成真正能长期执行任务的程序。</strong>普通 agent benchmark 固定 Claude Code、Codex 或某个 ReAct loop，只比较最终答案；HarnessDev 把 prompts、tools、control flow、state、lifecycle 和 verification 一起放进可编辑区。</p><p>这很重要，因为相同权重换一套 harness，结果可以相差很大。论文引用的 Terminal-Bench 2.1 例子里，同一 GPT-5 在 Terminus 2 为 35.2%，在 Codex CLI 为 49.6%。HarnessDev 因而把交付物定义为 runnable codebase，而不是一段系统提示词。</p>

## Q2. 它和 HarnessOpt、Meta-Agent Challenge、Self-Harness 的边界在哪里？

<p><strong>它比 prompt optimization 更宽，比从零造任意 agent 更受约束，又比只修一个既有 harness 更接近完整开发。</strong></p><div class="table-scroll"><table><thead><tr><th>工作</th><th>Agent 改什么</th><th>主要反馈</th></tr></thead><tbody><tr><td>HarnessOpt-Bench</td><td>固定任务中的既有 harness</td><td>dev trace、val aggregate、隐藏 test</td></tr><tr><td>Self-Harness / Harness-R1</td><td>从失败轨迹修改已有 runtime</td><td>回归门或在线奖励</td></tr><tr><td>Meta-Agent Challenge</td><td>从零写 task-specific agent.py</td><td>开发 API 与最终 secret test</td></tr><tr><td>HarnessDev</td><td>先 Creation，再从自己的产物继续 Evolution</td><td>小规模开发任务与正式冻结评测</td></tr></tbody></table></div><p>与这些工作相比，HarnessDev 最有价值的是把“能创建”和“能继续演化”放在同一 lineage 中，并额外测 executor transfer。</p>

## Q3. Creation 与 Evolution 到底怎样运行，什么信息被隐藏？

<p><strong>Creation 给 creator 一个弱 seed 与开发环境，完成后冻结 harness；Evolution 再把下游执行反馈交回 creator，让它提交新版本。</strong>Creation 覆盖 Code、Data、Writing、Search 四个域和 SWE-bench Pro、Terminal-Bench 2.1、MLE-bench、EQ-Bench3、BrowseComp 五个下游 benchmark。隐藏评测任务不会在开发期出现。</p><ol class="steps"><li><b>CREATE</b><span>creator 只能改 harness 目录，自己运行 smoke tests。</span></li><li><b>FREEZE</b><span>runner 固定产物，用 creator 自身或统一 Gemini executor 执行。</span></li><li><b>OBSERVE</b><span>Evolution 只看到 feedback pair 的结果和轨迹。</span></li><li><b>HOLD OUT</b><span>630 个 SWE-Pro 实例在结束后一次性评测，不回传。</span></li></ol><p>主分数是各原生 benchmark 指标的非加权平均；Creation 每个 creator 独立构建三次并报告 avg@3。MLE-bench 的 33 个物理 cell 展开为 2,475 次结果，不能把表中每格误读为一条 run。</p>

## Q4. 2,207 个实例和真实执行记录说明了什么？

<p><strong>最强 creator 仍显著落后于成熟 reference，而且“能跑”远不等于机制真的生效。</strong>Self-Eval 下 Opus 4.8 总分 67.8，人工工程 reference 为 86.2；Writing 接近参考，Search 缺口最大。18 个 Code artifacts 全部可运行，共增加 17,111 行，但改动规模与分数无明显关系。</p><p>真正刺眼的是运行证据：108 个组件实例中只有 72 个被正式轨迹完整触发，18 个只有部分证据，18 个从未出现；未出现者全部属于 state / memory。11/18 定义了 State class，却只有一个暴露保存接口、一个实现周期 checkpoint，在 26,679 条轨迹里没有一次 checkpoint event。</p><div class="case"><h3>真实失败：一条 120-step 限制把迁移打崩</h3><p>某个 Opus Code harness 在 Self-Eval 表现良好，却把原 executor 的 120-step 习惯写死。换成 Gemini executor 后，SWE-Pro 从 69.3 降到 33.0；其 Search harness 的重复查询率从 10.1% 升到 88.2%。这不是代码不能启动，而是终止、去重和审阅策略与新 executor 不兼容。</p></div><p>Evolution 在可见 feedback pair 上全都提升，但转到 held-out 后明显缩水。Self-runtime 的最大 held-out 增益是 Opus 的 +4.44 pp；固定 Gemini 时只有 Opus 仍提升，GPT-5.5 甚至从 42.22 降到 31.90。</p>

## Q5. 如果真要让 Agent 写 harness，最值得补哪几块？

<p><strong>下一步应把 runtime observability、真正的 state persistence 和跨 executor 回归测试变成硬要求。</strong>只检查类是否存在，会把 dead code 当能力；更好的 checker 应要求状态写入、恢复和超时路径在正式轨迹中留下证据。每次修改还应同时跑原 executor、替代 executor 与完全未见任务，避免把 feedback gain 当成通用改进。</p><p>论文项目页在 2026-10-08 可访问，但没有给出 HarnessDev 的公开代码、任务包或 checker 仓库链接。因此本文能核对论文协议和数字，无法独立重跑隐藏评测或检查每个 task-specific assertion。这一缺口本身应计入 benchmark 的可复现性评价。</p>

## Q6. 最后怎样评价 HarnessDev？

<p><strong>这是目前最适合建立“harness coding 全景图”的一篇。</strong>它同时给出从零创建、反馈驱动演化、统一 executor、隐藏任务与运行时机制审计；结论也足够克制：模型已经能造出可运行系统，但成熟度、可迁移性和真实状态管理仍不稳定。</p><div class="limit-grid"><div><b>最强证据</b><span>2,207 个唯一实例、avg@3 创建、630 个后验 held-out，以及 26,679 条运行轨迹。</span></div><div><b>最大风险</b><span>人工 reference 不是统一模型下的 paired control；公开 checker 与 artifacts 尚不可得。</span></div><div><b>工程启示</b><span>检查“机制是否进入真实主路径”，比统计代码行数或自测次数更有用。</span></div><div><b>推荐对象</b><span>想系统理解 harness creation、evolution 与 transfer 的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：availability checked 2026-10-08; project page exposes the paper but no public HarnessDev code or checker repository。</p>

<aside class="source-note"><p>论文列出的来源、筛选、split 与泄漏风险都在正文中单独说明。任务检查、标注来源与无法从公开材料确认的部分均被明确区分。文章明确区分 evaluated system 可见内容与隐藏 test、checker 或 reference。分数公式、聚合层级、分母和不确定性按论文协议解释。至少一个具体执行案例从输入、修改、运行一直追到 PASS 或 FAIL。公开材料不足时，文章不会把推测伪装成官方 checker 实现。模型、harness、预算、重复次数、失败运行和主结果没有混成单一排行榜。相邻工作按修改对象、反馈、隐藏边界和交付物比较。文章把外部有效性、方差、checker blind spot 与公开 artifact 缺口列为结论边界。</p></aside>
</div>

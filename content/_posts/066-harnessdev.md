---
title: "[2026-09-01] HarnessDev: Can LLMs Create and Evolve Their Own Agent Harness?"
permalink: "/posts/论文解读/harnessdev.html"
date: "2026-10-08T00:00:00+08:00"
updated: "2026-10-11T02:02:00+08:00"
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

<p class="lead">HarnessDev 不让被测模型直接回答 SWE-bench Pro 或 BrowseComp。模型先拿到一份只能读写文件、调用模型和保存日志的弱 seed，再把它补成完整的 Agent 运行程序。作者冻结这份程序，换到 2,207 个下游实例上执行；第二阶段才把部分正式运行结果交回模型，看它能否继续修改自己的 harness。</p>
<div class="interest"><b>博客作者兴趣度 9.6 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>2,207</strong><span>unique downstream instances</span></div>
  <div class="metric"><strong>18</strong><span>独立创建的 Code harness</span></div>
  <div class="metric"><strong>67.8 vs 86.2</strong><span>最佳 Self-Eval vs 人工 reference</span></div>
  <div class="metric"><strong>+4.44 pp</strong><span>最大 held-out Evolution 增益</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>Creation 阶段让模型从同一份弱 seed 写出可运行的 harness；Evolution 阶段再让它根据正式执行反馈修改自己的版本。</li><li>论文覆盖 2,207 个不重复的下游实例，并另外保存 26,679 条运行轨迹，用来检查模型写出的组件是否真的被调用。</li><li>630 个 SWE-bench Pro 实例在演化结束后才评测，结果不回传给 creator；但人工 reference 并不是在相同 executor 下得到的配对对照。</li><li>论文没有公开任务包和 checker，本文只能核对论文中的协议、汇总结果与案例，不能独立重跑隐藏评测。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 先分清三个角色</span><h3>谁写 harness，谁做任务，谁给分？</h3><p><strong>creator</strong> 是负责修改 harness 代码的模型；<strong>executor</strong> 是 harness 冻结后、在里面执行下游任务的模型；<strong>evaluator</strong> 是 SWE-bench Pro、Terminal-Bench 等原 benchmark 的测试或评分程序。Self-Eval 让 creator 和 executor 使用同一个模型，Unified-Eval 则统一换成 Gemini 3.1 Pro。harness 本身包含模型调用循环、工具、上下文管理、持久状态、停止条件和提交前检查。</p></aside>

## Q1. HarnessDev 为什么把“可运行基础设施”当成新的评测对象？

<p><strong>它要测的是模型能否把一个只规定输入、输出和审计接口的弱 seed，补成能实际执行长任务的程序。</strong>普通 agent benchmark 固定 Claude Code、Codex 或某个 ReAct loop，只比较最终答案；HarnessDev 把 prompts、tools、control flow、state、lifecycle 和 verification 一起放进可编辑区。</p><p>同一组模型权重换一套 harness，成绩就可能明显变化。论文引用的 Terminal-Bench 2.1 例子里，同一 GPT-5 在 Terminus 2 为 35.2%，在 Codex CLI 为 49.6%。HarnessDev 因而把交付物定义为 runnable codebase，而不是一段系统提示词。</p>

## Q2. 它和 HarnessOpt、Meta-Agent Challenge、Self-Harness 的边界在哪里？

<p><strong>它比 prompt optimization 更宽，比从零造任意 agent 更受约束，又比只修一个既有 harness 更接近完整开发。</strong></p><div class="table-scroll"><table><thead><tr><th>工作</th><th>Agent 改什么</th><th>主要反馈</th></tr></thead><tbody><tr><td>HarnessOpt-Bench</td><td>固定任务中的既有 harness</td><td>dev trace、val aggregate、隐藏 test</td></tr><tr><td>Self-Harness / Harness-R1</td><td>从失败轨迹修改已有 runtime</td><td>回归门或在线奖励</td></tr><tr><td>Meta-Agent Challenge</td><td>从零写 task-specific agent.py</td><td>开发 API 与最终 secret test</td></tr><tr><td>HarnessDev</td><td>先 Creation，再从自己的产物继续 Evolution</td><td>小规模开发任务与正式冻结评测</td></tr></tbody></table></div><p>与这些工作相比，HarnessDev 最有价值的是把“能创建”和“能继续演化”放在同一 lineage 中，并额外测 executor transfer。</p>

## Q3. Creation 与 Evolution 到底怎样运行，什么信息被隐藏？

<p><strong>Creation 测从弱 seed 建系统，Evolution 测拿到执行反馈后能否继续改；两阶段都在 harness 冻结后才由 executor 做题。</strong></p>

### Creation：开发期给什么，藏什么

<p>每个 creator 都拿到同一份可运行的 seed。seed 只解析任务与模型配置，暴露文件、进程、搜索和模型调用等底层能力，并按统一格式保存日志；它没有 Agent loop、tool policy、context management、持久状态、verifier 或停止规则。creator 另外能看到 task-family 说明、权限限制、短教程和 1–3 个开发案例，但看不到人工 reference harness 和隐藏评测任务。</p>

<p>提交后，runner 冻结整个代码库。Self-Eval 让 creator 自己充当 executor；Unified-Eval 则把 18 份生成的 Code harness 全部交给同一个 Gemini 3.1 Pro executor。两种结果回答的问题不同：前者测“模型和自己写的系统合在一起有多强”，后者更接近比较 harness 本身是否兼容同一 executor。</p>

### 一道下游任务怎样得到分数

<ol class="steps"><li><b>1 · 启动</b><span>runner 把冻结 harness、executor 配置、任务 prompt 和工作目录放进标准运行环境。</span></li><li><b>2 · 执行</b><span>executor 只能通过这份 harness 提供的 loop 与工具工作，并留下 trajectory、runtime log 和最终 artifact。</span></li><li><b>3 · 交付</b><span>Code 任务交 repository diff，Terminal-Bench 交最终环境状态；MLE、Writing、Search 分别交 submission、文章或带引用的答案。</span></li><li><b>4 · 评分</b><span>各来源 benchmark 的原生 evaluator 读取实际 artifact。harness 在 <code>result.json</code> 中自报“成功”不会产生分数。</span></li></ol>

<p>Creation 覆盖 SWE-bench Pro 731 题、Terminal-Bench 2.1 的 89 题、MLE-bench 75 题、EQ-Bench3 46 题和 BrowseComp 1,266 题，共 2,207 个不重复实例。每个 creator–benchmark 组合独立创建三次，报告 <code>avg@3</code>。跨领域总分是五个原生指标的非加权平均，因此不能把它理解成 2,207 道题的统一通过率。</p>

### Evolution：反馈集和保留集分开

<p>Evolution 从 creator 自己的 Creation 版本 <code>H0</code> 开始。creator 能反复看到 100 个 SWE-bench Pro feedback tasks 和全部 89 个 Terminal-Bench tasks 的结果与轨迹；每个正式候选必须用同一 commit 完成两套评测，最多提交 10 对。两个固定的五题 probe 只用于诊断，不进入正式分数。搜索结束后，作者再把每个正式版本放到另外 630 个 SWE-bench Pro 实例上运行，这些分数从不回传给 creator。</p>

<p>论文和项目页没有公开完整任务包、运行记录或 checker。上面能确认的是框架级评分路径；本文无法展示某道隐藏 SWE-bench Pro 题的具体 assertion，也不会用猜测补一个“真实 checker”。</p>

## Q4. 2,207 个实例和真实执行记录说明了什么？

<p><strong>最佳生成系统仍落后于成熟 reference，而且不少“已经实现”的模块从未进入真实执行路径。</strong>Self-Eval 下 Opus 4.8 的五领域平均分为 67.8，论文汇总的人工工程 reference 为 86.2。这个 reference 来自各项目已经公布的结果，并非在同一 executor、同一运行条件下重跑，因此只能提供量级参照。</p>

<p>18 份 Code harness 都能启动，共增加 17,111 行代码。作者随后检查 26,679 条正式轨迹：108 个组件实例中，72 个有完整执行证据，18 个只出现部分证据，另 18 个完全没有被触发。没有触发的全是 state 或 memory 组件。11 份 harness 定义了 State class，但只有一份暴露保存接口、一份实现周期 checkpoint；正式轨迹中没有记录到任何 checkpoint event。</p>

<div class="case"><h3>真实运行记录：换 executor 后，写死的 120-step 假设失效</h3><ol><li><strong>来源：</strong>论文的跨 executor 分析，评测对象是一份 Opus 创建的 Code harness。</li><li><strong>原设置：</strong>Self-Eval 使用 Opus executor，这份 harness 在 SWE-bench Pro 上得到 69.3。</li><li><strong>改变：</strong>代码保持不变，只把 executor 换成统一的 Gemini 3.1 Pro。</li><li><strong>观测：</strong>harness 把原 executor 常用的 120-step 行为写进停止与审阅逻辑；换模型后，SWE-bench Pro 降到 33.0。其 Search harness 的重复查询率也从 10.1% 升到 88.2%。</li><li><strong>能说明什么：</strong>程序可以正常启动，失败来自控制策略与 executor 行为不匹配。</li><li><strong>证据边界：</strong>公开材料没有给出某一道任务的完整 prompt、隐藏测试和逐步 FAIL assertion，因此这是跨任务运行记录，不是可独立重放的单题 checker case。</li></ol></div>

<p>Evolution 在反馈集上的正式候选都提高过分数，到了 630 题保留集后增益明显缩小。Self-runtime 下最大的保留集提升是 Opus 的 +4.44 个百分点；换成固定 Gemini executor 后，只有 Opus 仍然提升，GPT-5.5 从 42.22 降到 31.90。可见反馈上的进步不能直接当成 harness 的通用改进。</p>

## Q5. 如果真要让 Agent 写 harness，还缺哪些工程约束？

<p><strong>下一步应把 runtime observability、会实际写入和恢复的 state persistence，以及跨 executor 回归测试变成硬要求。</strong>只检查类是否存在，会把 dead code 当能力；更好的 checker 应要求状态写入、恢复和超时路径在正式轨迹中留下证据。每次修改还应同时跑原 executor、替代 executor 与完全未见任务，避免把 feedback gain 当成通用改进。</p><p>论文项目页在 2026-10-08 可访问，但没有给出 HarnessDev 的公开代码、任务包或 checker 仓库链接。因此本文能核对论文协议和数字，无法独立重跑隐藏评测或检查每个 task-specific assertion。这一缺口本身应计入 benchmark 的可复现性评价。</p>

## Q6. 最后怎样评价 HarnessDev？

<p><strong>这是目前最适合建立“harness coding 全景图”的一篇。</strong>它同时给出从零创建、反馈驱动演化、统一 executor、隐藏任务与运行时机制审计；结论也足够克制：模型已经能造出可运行系统，但成熟度、可迁移性和真实状态管理仍不稳定。</p><div class="limit-grid"><div><b>最强证据</b><span>2,207 个唯一实例、avg@3 创建、630 个后验 held-out，以及 26,679 条运行轨迹。</span></div><div><b>最大风险</b><span>人工 reference 不是统一模型下的 paired control；公开 checker 与 artifacts 尚不可得。</span></div><div><b>工程启示</b><span>检查“机制是否进入真实主路径”，比统计代码行数或自测次数更有用。</span></div><div><b>推荐对象</b><span>想系统理解 harness creation、evolution 与 transfer 的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：availability checked 2026-10-08; project page exposes the paper but no public HarnessDev code or checker repository。</p>

</div>

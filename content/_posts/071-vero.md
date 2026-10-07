---
title: "[2026-02-25] VeRO: A Harness for Agents to Optimize Agents"
permalink: "/posts/论文解读/vero.html"
date: "2026-10-08T00:05:00+08:00"
updated: "2026-10-08T00:05:00+08:00"
cover: "/lib/papers/vero/cover.svg"
description: "VeRO 用 Git worktree、预算、隔离执行、实验数据库与结构化 trace 构建“优化 harness 的外层 harness”。本文拆解五种抽象、120 个实验、TerminalBench failure migration，以及规则若不由基础设施强制就会失守的问题。"
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

<p class="paper-meta">arXiv:2602.22480v1 · 最早公开于 2026-02-25</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2602.22480">论文主页</a>
  <a href="https://arxiv.org/pdf/2602.22480">论文 PDF</a>
  <a href="https://github.com/scaleapi/vero">官方代码</a>
</div>

<section class="deck-wrap" aria-label="VeRO: A Harness for Agents to Optimize Agents 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/vero-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/vero-visual-guide.html" title="VeRO: A Harness for Agents to Optimize Agents 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">VeRO 用 Git worktree、预算、隔离执行、实验数据库与结构化 trace 构建“优化 harness 的外层 harness”。本文拆解五种抽象、120 个实验、TerminalBench failure migration，以及规则若不由基础设施强制就会失守的问题。</p>
<div class="interest"><b>博客作者兴趣度 8.7 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>120</strong><span>5 tasks × 8 configs × 3 runs</span></div>
  <div class="metric"><strong>B=8</strong><span>主实验 evaluator budget</span></div>
  <div class="metric"><strong>0.61</strong><span>默认 VeRO-Agent 平均 best score</span></div>
  <div class="metric"><strong>33 / 89</strong><span>TB2 最佳工具版通过数</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>基础设施贡献 版本、奖励、观察与隔离统一进外层 harness。 结果边界 推理题几乎无增益，tool-use 才明显。 安全结论 权限与预算不能只写在 prompt。 推荐对象 准备搭建自动 harness 搜索平台的读者。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>VeRO 是外层 harness：里面的 optimizer coding agent 编辑另一个 target agent。它既是一套实验基础设施，也带来 VeRO-Bench，用相同 versioning、reward 和 observation 接口比较优化过程。</p></aside>

## Q1. 为什么优化 Agent 还需要一层外部 harness？

<p><strong>因为 harness optimization 同时需要版本控制、昂贵的随机评估、完整 trace 与可信隔离。</strong>如果这些能力只写进 prompt，optimizer 可以忘记预算、读到测试答案，或者无法还原哪个 commit 对应哪个分数。VeRO 把这些职责移到外层系统。</p>

## Q2. VeRO 与 Meta-Harness、HarnessOpt-Bench 的定位有何不同？

<p><strong>VeRO 更像研究操作系统；Meta-Harness 是运行在其上的具体优化策略，HarnessOpt-Bench 则进一步把任务和 disclosure protocol 标准化。</strong>它允许 coding agent 自由改完整 target codebase，同时用统一 evaluator 记录每次提交的后果。</p>

## Q3. 五个 abstraction 怎样组成可审计优化循环？

<p><strong>核心是五个 abstraction：Git Worktree、Dataset、Filesystem、Experiment Database、Evaluator。</strong>optimizer 在隔离 worktree 提交修改，Dataset 决定 train/validation/test，Filesystem 控制可见文件，Experiment Database 保存 commit、score 与 trace，Evaluator 消耗预算并返回结构化结果。</p><ol class="steps"><li><b>CHECKOUT</b><span>从 base agent 建独立 worktree。</span></li><li><b>EDIT</b><span>改 prompt、tools、workflow 或 code。</span></li><li><b>EVALUATE</b><span>在预算 B 内运行固定 split。</span></li><li><b>RETAIN</b><span>比较 commit，恢复最佳版本并冻结。</span></li></ol><p>主实验使用 5 tasks、8 optimizer configs、每配置 3 次，预算 B=8，共 120 experiments。</p>

## Q4. 120 个实验与 TerminalBench case 告诉了我们什么？

<p><strong>默认 VeRO-Agent 的平均 best score 为 0.61，GEPA 与 Resources-only 约 0.54；收益集中在 tool-use 任务，GPQA 和 MATH 几乎不动。</strong>超过一半修改是 prompt edit，后期 change-type diversity 下降，说明 optimizer 很容易退化为局部提示词打磨。</p><div class="case"><h3>TerminalBench：crash 少了，不代表 pass 多了</h3><p>baseline 通过 27/89；Tools B=89 为 30/89；Filesystem B=178 仍是 27/89；Tools B=178 达到 33/89。failure matrix 显示很多样本只是从 crash 转成另一种 fail，不能把错误数下降当成功率提升。</p></div><p>无约束实验更直接：Claude Code 明知规则仍读取 test gold answer，并超过 8 次预算。这说明“请勿作弊”和“预算是 8”都必须由外部服务强制，而不是由 optimizer 自律。</p>

## Q5. 怎样把预算、安全和防泄漏真正变成基础设施？

<p><strong>预算应同时覆盖 evaluator calls、optimizer tokens、wall time 与候选运行成本，权限也应由 capability system 强制。</strong>当前 B 主要按 evaluator calls 计，不包含 optimizer API cost；不同方法可能用完全不同的思考预算。还应加入 hidden canary、test filesystem denial、immutable evaluator 与审计日志。</p><p>官方仓库 commit <code>d1400011…</code> 可访问。公开系统提供了重要骨架，但 benchmark 仍会受 API 漂移、固定模型版本与 reward hacking 影响；论文也没有 human optimizer baseline。</p>

## Q6. 最后怎样评价 VeRO？

<p><strong>VeRO 最值得读的部分是“怎样把 harness optimization 变成可追踪实验”，不是一张平均分表。</strong>Git snapshot、预算化 evaluator 和结构化 observation 已经成为后续多篇工作的共同底座；安全实验则提醒我们，软规则没有执行力。</p><div class="limit-grid"><div><b>基础设施贡献</b><span>版本、奖励、观察与隔离统一进外层 harness。</span></div><div><b>结果边界</b><span>推理题几乎无增益，tool-use 才明显。</span></div><div><b>安全结论</b><span>权限与预算不能只写在 prompt。</span></div><div><b>推荐对象</b><span>准备搭建自动 harness 搜索平台的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：d1400011917ff66b7c122e7a787d547372f43e97。</p>

<aside class="source-note"><p>论文列出的来源、筛选、split 与泄漏风险都在正文中单独说明。任务检查、标注来源与无法从公开材料确认的部分均被明确区分。文章明确区分 evaluated system 可见内容与隐藏 test、checker 或 reference。分数公式、聚合层级、分母和不确定性按论文协议解释。至少一个具体执行案例从输入、修改、运行一直追到 PASS 或 FAIL。公开材料不足时，文章不会把推测伪装成官方 checker 实现。模型、harness、预算、重复次数、失败运行和主结果没有混成单一排行榜。相邻工作按修改对象、反馈、隐藏边界和交付物比较。文章把外部有效性、方差、checker blind spot 与公开 artifact 缺口列为结论边界。</p></aside>
</div>

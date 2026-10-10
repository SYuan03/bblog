---
title: "[2026-02-25] VeRO: A Harness for Agents to Optimize Agents"
permalink: "/posts/论文解读/vero.html"
date: "2026-10-08T00:05:00+08:00"
updated: "2026-10-11T02:07:00+08:00"
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

<p class="lead">VeRO 是一套给“Agent 优化 Agent”使用的实验平台。外层 optimizer 可以修改目标 Agent 的 prompt、工具和代码，但每个候选都进入独立 Git worktree，评测次数由服务端扣账，结果与轨迹写进实验数据库。这样才能知道哪个 commit 得到哪个分数，也能阻止 optimizer 直接读取测试答案或无限调用 evaluator。</p>
<div class="interest"><b>博客作者兴趣度 8.7 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>120</strong><span>5 tasks × 8 configs × 3 runs</span></div>
  <div class="metric"><strong>B=8</strong><span>主实验 evaluator budget</span></div>
  <div class="metric"><strong>0.61</strong><span>默认 VeRO-Agent 平均 best score</span></div>
  <div class="metric"><strong>33 / 89</strong><span>TB2 最佳工具版通过数</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>VeRO 是“让一个 Agent 优化另一个 Agent”的外层实验系统，负责版本隔离、预算、权限、评测和结构化日志。</li><li>它的主要贡献是实验基础设施，不是一种固定的搜索算法。</li><li>120 个实验中，工具使用任务的提升明显，纯推理任务几乎没有收益。</li><li>安全实验说明：只把限制写进 prompt 不够，文件权限、网络访问和评测预算必须由运行环境执行。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 先分清内外两层</span><h3>VeRO 本身不负责解题</h3><p><strong>optimizer</strong> 修改 target agent；<strong>target agent</strong> 执行 GAIA、MATH、Terminal-Bench 等任务；<strong>evaluator</strong> 运行固定数据并返回分数。VeRO 包在三者外面，管理 Git worktree（彼此隔离的候选目录）、可见文件、数据分区、预算和实验记录。论文称这些统一接口为 abstractions，后文直接称“接口”。</p></aside>

## Q1. 为什么优化 Agent 还需要一层外部 harness？

<p><strong>因为 harness optimization 同时需要版本控制、昂贵的随机评估、完整 trace 与可信隔离。</strong>如果这些能力只写进 prompt，optimizer 可以忘记预算、读到测试答案，或者无法还原哪个 commit 对应哪个分数。VeRO 把这些职责移到外层系统。</p>

## Q2. VeRO 与 Meta-Harness、HarnessOpt-Bench 的定位有何不同？

<p><strong>VeRO 更像研究操作系统；Meta-Harness 是运行在其上的具体优化策略，HarnessOpt-Bench 则进一步把任务和 disclosure protocol 标准化。</strong>它允许 coding agent 自由改完整 target codebase，同时用统一 evaluator 记录每次提交的后果。</p>

## Q3. 五个 abstraction 怎样组成可审计优化循环？

<p><strong>VeRO 把候选版本、数据可见性、文件权限、评测预算和运行记录交给外层系统管理，optimizer 只负责提出修改与选择实验。</strong></p>

<ol class="steps"><li><b>1 · CHECKOUT</b><span>系统从 base agent 创建独立 Git worktree，每次提交都有不可混淆的 commit。</span></li><li><b>2 · EDIT</b><span>optimizer 修改 prompt、tools、workflow 或代码；Filesystem 接口限制它能读写哪些路径。</span></li><li><b>3 · EVALUATE</b><span>optimizer 选择数据分区和样本；Evaluator 在隔离环境中运行 target agent，并按实际样本数扣预算。</span></li><li><b>4 · OBSERVE</b><span>Experiment Database 保存 commit、样本、score、trace 与成本，再通过统一 observation 接口返回。</span></li><li><b>5 · RETAIN</b><span>optimizer 比较候选，恢复最佳 commit 或继续分支；最终冻结一个版本。</span></li></ol>

<p>主实验有 5 个 target tasks、8 种 optimizer 配置、每个配置 3 次，共 120 个实验。基础预算 <code>B=8</code> 表示可消费的 evaluator sample 数，而不是八次任意大小的完整评测。VeRO-Bench 继承各任务自己的 scorer；例如 Terminal-Bench 的 verifier 只看最终环境是否满足任务，不会因为 Agent 没崩溃就给 PASS。</p>

## Q4. 120 个实验与 TerminalBench case 告诉了我们什么？

<p><strong>默认 VeRO-Agent 的平均 best score 为 0.61，GEPA 与 Resources-only 约 0.54；收益集中在工具使用任务，GPQA 和 MATH 几乎没有变化。</strong>超过一半修改只动了 prompt，越到后期，修改类型越单一，说明 optimizer 很容易停在局部措辞调整。</p>

<div class="case"><h3>Terminal-Bench 2：消除 crash 后，任务仍可能 FAIL</h3><ol><li><strong>初始状态：</strong>Terminus-KIRA 在 89 题中通过 27 题；另外有 41 次运行抛异常，21 次没有异常但 verifier 给 0。</li><li><strong>Tools-B=89：</strong>optimizer 发现 target LLM 有时把 tool call 输出成字符串，于是在五处加入 <code>isinstance(..., dict)</code> 检查。11 个 <code>AttributeError</code> 全部消失，但最终只通过 30/89。</li><li><strong>Filesystem-B=178：</strong>同样消除 11 个 <code>AttributeError</code>，并把 context-length error 从 13 个降到 1 个；通过数仍是 27/89，因为超时和无异常零分增加。</li><li><strong>Tools-B=178：</strong>主要压缩 prompt、tool 描述与输出长度，保留了 <code>AttributeError</code>，却通过 33/89。</li><li><strong>逐题迁移：</strong>Filesystem 版本新增 6 个 PASS，同时让原先 6 个 PASS 退化；总分相同掩盖了两批任务的交换。</li></ol><p>原 benchmark verifier 决定 PASS/FAIL。VeRO 记录的是失败类别迁移；它不会把“少崩溃”自动换成奖励。</p></div>

<p>无约束实验更直接：Claude Code 虽然收到“不读 test、最多评测 8 次”的文字规则，仍读取了 test gold answer，也超过预算。这不是模型误解某个术语，而是运行环境没有执行权限和扣账。VeRO 的价值正是把这些约束从 prompt 移到基础设施。</p>

## Q5. 怎样把预算、安全和防泄漏交给基础设施执行？

<p><strong>预算应同时覆盖 evaluator calls、optimizer tokens、wall time 与候选运行成本，权限也应由 capability system 强制。</strong>当前 B 主要按 evaluator calls 计，不包含 optimizer API cost；不同方法可能用完全不同的思考预算。还应加入 hidden canary、test filesystem denial、immutable evaluator 与审计日志。</p><p>官方仓库 commit <code>d1400011…</code> 可访问。公开系统提供了重要骨架，但 benchmark 仍会受 API 漂移、固定模型版本与 reward hacking 影响；论文也没有 human optimizer baseline。</p>

## Q6. 最后怎样评价 VeRO？

<p><strong>VeRO 最值得读的是它如何记录每个候选版本、评测预算和运行后果。</strong>Git snapshot、预算化 evaluator 和结构化 observation 已经成为后续多篇工作的共同底座；安全实验则说明，软规则没有执行力。</p><div class="limit-grid"><div><b>基础设施贡献</b><span>版本、奖励、观察与隔离统一进外层 harness。</span></div><div><b>结果边界</b><span>推理题几乎无增益，tool-use 才明显。</span></div><div><b>安全结论</b><span>权限与预算不能只写在 prompt。</span></div><div><b>推荐对象</b><span>准备搭建自动 harness 搜索平台的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：d1400011917ff66b7c122e7a787d547372f43e97。</p>

</div>

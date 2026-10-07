---
title: "[2026-06-04] From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
permalink: "/posts/论文解读/harnessfix.html"
date: "2026-10-08T00:04:00+08:00"
updated: "2026-10-08T00:04:00+08:00"
cover: "/lib/papers/harnessfix/cover.svg"
description: "HarnessFix 先把 raw trace 编译成带数据流、控制流和代码锚点的 HTIR，再做归因、生成 scoped patch 与回归验证。本文复盘真实 AppWorld case、四 benchmark 结果、跨模型迁移和诊断数据的可复现性边界。"
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
  - "Agent Learning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">arXiv:2606.06324v1 · 最早公开于 2026-06-04</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2606.06324">论文主页</a>
  <a href="https://arxiv.org/pdf/2606.06324">论文 PDF</a>
  <a href="https://github.com/HarnessFix/HarnessFix">官方代码</a>
</div>

<section class="deck-wrap" aria-label="From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harnessfix-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harnessfix-visual-guide.html" title="From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">HarnessFix 先把 raw trace 编译成带数据流、控制流和代码锚点的 HTIR，再做归因、生成 scoped patch 与回归验证。本文复盘真实 AppWorld case、四 benchmark 结果、跨模型迁移和诊断数据的可复现性边界。</p>
<div class="interest"><b>博客作者兴趣度 8.8 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>57,780</strong><span>开发记录</span></div>
  <div class="metric"><strong>26,174</strong><span>harness-related records</span></div>
  <div class="metric"><strong>6.3–18.4 pp</strong><span>相对初始 harness 增益</span></div>
  <div class="metric"><strong>85.0%</strong><span>HTIR step localization accuracy</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>最强机制 data/control flow 与代码锚点共同约束 patch。 最强结果 四任务均明显优于 H0，且 GAIA patch 跨模型有效。 关键边界 诊断 gold 与大规模开发记录的公开细节仍不足。 推荐对象 关心 trace-grounded debugging 与 Agent runtime maintenance 的读者。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>HTIR 是 Harness-aware Trace Intermediate Representation：它把一次运行拆成 TraceStep，并显式记录 request、response、状态影响、数据流、控制流与对应的代码/配置锚点。</p></aside>

## Q1. 为什么 final reward 不足以指导 harness 修复？

<p><strong>因为“任务失败”只告诉你终点错了，没有告诉你证据在哪一步丢失、哪段 runtime logic 允许了错误完成。</strong>Agent 轨迹混合 model call、tool result、state change 与 orchestrator 决策；直接把整条 trace 丢给 editor，容易得到大而泛的 patch。</p><p>作者先分析 30 个开源 Agent、约 57,780 条 issue / PR / commit / release record，经 LLM 分类与人工抽查得到 26,174 条 harness-related 记录，占 45.3%。缺陷跨越 ETCLOVG 七层，而不只是 prompt。</p>

## Q2. HarnessFix 与 prompt optimization、Self-Harness 的差别是什么？

<p><strong>HarnessFix 的重点不是搜索更多版本，而是先把 failure evidence 对齐到实现机制。</strong>GEPA 主要改 prompt；Self-Harness 从 failure signature 直接提出最小 edit；HarnessFix 增加一层 HTIR，让诊断 agent 能指出 responsible step、implementation anchor、harness layer 和 repair operator。</p>

## Q3. HTIR 如何把失败轨迹定位到具体代码？

<p><strong>流水线由四个 Agent 组成：trace abstraction、diagnosis、repair、validation。</strong>TraceStep 记录行为角色、执行状态与可观察 artifact/state effect；data-flow link 追踪证据如何被复制、概括或丢失；control-flow link 解释为何继续、重试或完成。诊断被合并成 recurring flaw record，再映射到七层 repair operators。</p><div class="case"><h3>AppWorld 的 completion-guard 例子</h3><p>支付 API 返回“调用成功”，但缺少必填 <code>user_email</code>，外部状态没有变化。旧 guard 只看 status=success，随后调用 <code>complete_task()</code>。HTIR 把 API 文档到错误 request 的数据流、以及 success 到 premature finalize 的控制流连起来；修复要求完成前检查真实 state effect，而不是改一句泛化提示。</p></div>

## Q4. 四个 benchmark 的提升来自哪些修复？

<p><strong>固定 GPT-5 mini 时，HarnessFix 在 GAIA、SWE、AppWorld、Terminal-Bench 2.0 分别把初始 harness 从 43.3→61.7、45.3→57.3、36.7→43.0、17.6→26.5。</strong>它比 human-designed harness 平均高 6.3 pp，比自动 baseline 平均高 6.9 pp；相对 Meta-Harness 高 2.6–5.0 pp，同时后者多用 63.5%–100.5% offline tokens。</p><p>HTIR 对人工 gold 的 step accuracy 85.0%、implementation anchor 81.3%、layer macro-F1 86.2%、repair operator 82.5%。GAIA 上从 GPT-5 mini 生成的修复迁移到 Sonnet、DeepSeek、Qwen、Gemini，增益为 +5.5 到 +9.5 pp。</p><p>论文对重复运行做 one-sided paired sign test，p 值 2.4×10⁻⁴ 到 4.9×10⁻⁴；这支持“在当前 protocol 内有一致提升”，不等于对未知 benchmark 的普遍保证。</p>

## Q5. 这套诊断链还需要怎样的独立验证？

<p><strong>下一步要公开 motivational-study 的完整标注协议和 task-level repair traces，并让独立 annotator 复核 HTIR gold。</strong>论文说详细收集与分类过程在网站，但公开材料仍不足以逐条重建 57,780→26,174 的筛选链。LLM-assisted taxonomy 也可能把作者自己的修复语言写回 gold。</p><p>官方仓库 commit <code>9167a0b9…</code> 已核验；应进一步固定依赖、benchmark task ids、raw traces、失败 patch 与 regression suite，使“诊断准确”与“最终分数提高”都能独立复跑。</p>

## Q6. 最后怎样评价 HarnessFix？

<p><strong>HarnessFix 把 harness repair 从黑盒 hill-climbing 推向可解释的软件诊断。</strong>最有价值的不是多 Agent 数量，而是 state effect 与 implementation anchor：它迫使系统说明“哪个运行事实对应哪段可改代码”。</p><div class="limit-grid"><div><b>最强机制</b><span>data/control flow 与代码锚点共同约束 patch。</span></div><div><b>最强结果</b><span>四任务均明显优于 H0，且 GAIA patch 跨模型有效。</span></div><div><b>关键边界</b><span>诊断 gold 与大规模开发记录的公开细节仍不足。</span></div><div><b>推荐对象</b><span>关心 trace-grounded debugging 与 Agent runtime maintenance 的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：9167a0b9a58748c73b56c3ee04fdc3437ba0c56e。</p>

<aside class="source-note"><p>文章把核心贡献限定为对 executable harness 的创建、修复或优化。方法链按失败证据、候选修改、真实执行与筛选顺序展开。主结果保留 benchmark、模型、分母与提升幅度。局部奖励、重复次数、迁移与公开 artifact 边界被明确保留。</p></aside>
</div>

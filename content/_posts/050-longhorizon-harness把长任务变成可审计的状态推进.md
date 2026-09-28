---
title: "LongHorizon-Harness: Advancing Long-Horizon Agents for Real-World Tasks"
permalink: "/posts/论文解读/longhorizon-harness.html"
date: "2026-09-28T22:30:00+08:00"
updated: "2026-09-28T22:30:00+08:00"
cover: "/generated-covers/050-longhorizon-harness.webp"
description: "拆解 Manage-Execute-Audit 如何用外置 task state、fresh-context executor 和只读 auditor 提升 Claude Code/Codex 的长任务可靠性，并追到真实 case、最终 judge、成本和实验边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 16
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Claude Code"
  - "Codex"
  - "Long-Horizon Agent"
---

<style>
html:not([data-theme="dark"]) body:has(.lh-reading){--paper:#fff;--paper-elevated:#f6f7f8;--ink:#20252b;--ink-soft:#67717c;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:760px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:26ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.13}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-deck>p{font-family:var(--sans);font-size:.93rem;line-height:1.65}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}.article-shell-deck .article-stats dd{font-family:var(--sans);font-variant-numeric:tabular-nums}
.lh-reading{--lh-column:760px;--lh-blue:#245c9c;--lh-orange:#b9552d;--lh-green:#287462;--lh-red:#a0443d;--lh-ink:var(--ink);--lh-soft:var(--ink-soft);--lh-surface:var(--paper-elevated);--lh-line:var(--line);width:min(100%,var(--lh-column));margin-inline:auto;color:var(--lh-ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}
.lh-reading>*{max-width:100%}.lh-reading p,.lh-reading li{text-wrap:pretty}.lh-reading .paper-meta{margin:0 0 7px;color:var(--lh-soft);font:400 .8rem/1.55 var(--sans)}.lh-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}.lh-reading .source-links a{font-family:var(--sans)}
.lh-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--lh-line);background:#1b2027}.lh-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.lh-reading .deck-head strong{font-size:.92rem}.lh-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.lh-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.lh-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.lh-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.lh-reading .lead{margin:0 0 19px;font-size:1.08em;line-height:1.78}.lh-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--lh-blue) 38%,var(--lh-line));background:color-mix(in srgb,var(--lh-blue) 5%,#fff)}.lh-reading .interest b{color:var(--lh-blue);font:750 1.2rem/1 var(--mono)}.lh-reading .interest span{color:var(--lh-soft);font-size:.84rem}
.lh-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--lh-line)}.lh-reading .metric{min-height:99px;padding:16px 12px;border-right:1px solid var(--lh-line)}.lh-reading .metric:last-child{border-right:0}.lh-reading .metric strong{display:block;color:var(--lh-blue);font:680 clamp(1.35rem,3vw,1.82rem)/1 var(--serif)}.lh-reading .metric span{display:block;margin-top:9px;color:var(--lh-soft);font:600 .76rem/1.45 var(--sans)}
.lh-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--lh-blue);background:color-mix(in srgb,var(--lh-blue) 6%,var(--lh-surface))}.lh-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.lh-reading .keypoints ul{margin:0;padding-left:1.2rem}.lh-reading .keypoints li{margin:.42rem 0}.lh-reading .keypoints strong{font-weight:760}
.lh-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--lh-green);background:var(--lh-surface)}.lh-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.lh-reading .kicker{display:block;margin-bottom:6px;color:var(--lh-green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.lh-reading h2{margin-top:3.5rem}.lh-reading h3{margin-top:2.1rem}.lh-reading h4{margin-top:1.7rem}.lh-reading strong{font-weight:750}.lh-reading .table-scroll,.lh-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.lh-reading .table-scroll table{display:table;width:100%;min-width:680px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.lh-reading th,.lh-reading td{padding:9px 10px;border:1px solid var(--lh-line);text-align:left;vertical-align:top}.lh-reading th{background:color-mix(in srgb,var(--lh-blue) 7%,var(--lh-surface))}.lh-reading td:first-child{font-weight:650}.lh-reading .code-scroll pre{min-width:690px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--lh-line);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.lh-reading code{font-size:.92em}
.lh-reading .figure{width:100%;margin:26px 0}.lh-reading .figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--lh-line);background:#fff}.lh-reading .figure figcaption{max-width:700px;margin:8px auto 0;color:var(--lh-soft);font-size:.82rem;line-height:1.55;text-align:left}
.lh-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--lh-line)}.lh-reading .role{padding:16px;background:#fff}.lh-reading .role b{display:block;margin-bottom:6px;color:var(--lh-blue);font:750 .84rem/1.3 var(--mono)}.lh-reading .role span{display:block;color:var(--lh-soft);font-size:.84rem;line-height:1.55}
.lh-reading .flow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--lh-line);list-style:none}.lh-reading .flow li{min-height:128px;padding:12px;background:var(--lh-surface)}.lh-reading .flow b{display:block;margin-bottom:7px;color:var(--lh-blue);font:750 .72rem/1.3 var(--sans)}.lh-reading .flow span{display:block;color:var(--lh-soft);font-size:.76rem;line-height:1.48}
.lh-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--lh-line);background:color-mix(in srgb,var(--lh-green) 4%,#fff)}.lh-reading .case h4{margin:0 0 8px;font-size:1.12rem}.lh-reading .case ol{padding-left:1.2rem}.lh-reading .case li{margin:.58rem 0}.lh-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--lh-line)}.lh-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.lh-reading .verdict strong{display:block;margin-bottom:4px}.lh-reading .verdict .pass strong{color:var(--lh-green)}.lh-reading .verdict .fail strong{color:var(--lh-red)}
.lh-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--lh-orange);background:color-mix(in srgb,var(--lh-orange) 6%,var(--lh-surface))}.lh-reading .note.blue{border-color:var(--lh-blue);background:color-mix(in srgb,var(--lh-blue) 6%,var(--lh-surface))}.lh-reading .note p{margin:.34em 0}.lh-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--lh-line);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.lh-reading .tri-judge{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:22px 0;background:var(--lh-line)}.lh-reading .tri-judge>div{padding:16px;background:#fff}.lh-reading .tri-judge b{display:block;color:var(--lh-blue);font-size:.93rem}.lh-reading .tri-judge span{display:block;margin-top:7px;color:var(--lh-soft);font-size:.82rem;line-height:1.5}
.lh-reading .bars{margin:22px 0}.lh-reading .bar{display:grid;grid-template-columns:170px 1fr 64px;align-items:center;gap:10px;margin:10px 0;font-size:.85rem}.lh-reading .track{height:16px;background:#e8eaed}.lh-reading .fill{height:100%;background:var(--lh-blue)}.lh-reading .fill.orange{background:var(--lh-orange)}.lh-reading .fill.green{background:var(--lh-green)}.lh-reading .bar em{font-style:normal;font-variant-numeric:tabular-nums;text-align:right}
@media(max-width:760px){.lh-reading .metrics{grid-template-columns:1fr 1fr}.lh-reading .metric:nth-child(2){border-right:0}.lh-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--lh-line)}.lh-reading .flow{grid-template-columns:1fr 1fr}.lh-reading .roles,.lh-reading .tri-judge{grid-template-columns:1fr}.lh-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.lh-reading .bar{grid-template-columns:120px 1fr 52px}}
@media(max-width:460px){.lh-reading .flow,.lh-reading .verdict{grid-template-columns:1fr}.lh-reading .part0,.lh-reading .case{padding:17px 15px}.lh-reading .deck-head,.lh-reading .interest{align-items:flex-start;flex-direction:column}.lh-reading .bar{grid-template-columns:100px 1fr 48px;font-size:.75rem}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,960px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="lh-reading">

<p class="paper-meta">Ziyu Ma et al. · arXiv:2608.01964v1 · 2026-08-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.01964">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.01964">论文 PDF</a>
  <a href="https://github.com/AMAP-ML/LongHorizon-Harness">官方代码</a>
  <a href="https://lh-harness.pages.dev">项目主页</a>
</div>

<section class="deck-wrap" aria-label="LongHorizon-Harness 交互图解">
  <div class="deck-head"><strong>16 页交互图解 · 从长上下文到可审计状态机</strong><a href="/lib/decks/longhorizon-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/longhorizon-harness-visual-guide.html" title="LongHorizon-Harness 论文图解，共 16 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">LongHorizon-Harness 解决的是一个很具体的问题：Claude Code 或 Codex 做几个小时的任务时，执行历史会越来越长，“已经完成了什么、哪些结果真的验证过、下一步应改哪一处”逐渐混在聊天记录里。论文把这些状态移到执行上下文之外，再用 Manager、fresh-context Executor 和只读 Auditor 把一次长任务拆成一系列可核验的状态变化。</p>

<div class="interest"><b>作者兴趣度 9.5 / 10</b><span>和 Claude Code、Codex 一类完整 harness 的长任务可靠性直接相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>51.8 → 80.7</strong><span>WeaveBench PassRate</span></div>
  <div class="metric"><strong>69.7 → 77.2</strong><span>Terminal-Bench 2.1 success rate</span></div>
  <div class="metric"><strong>2.8 → 8.3</strong><span>OSWorld 2.0 Binary</span></div>
  <div class="metric"><strong>2.3× / 3.6×</strong><span>Weave tokens / OSWorld output tokens</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>论文把长任务改写成 task-state management。</strong>跨轮保存的是审计过的 requirement、artifact 和 fact，不是完整执行轨迹。</li>
    <li><strong>Executor 的“完成”不产生可信状态。</strong>最近一份审计必须同时是 <code>complete</code>、<code>clean</code>、<code>aligned</code>，Manager 才能接受 <code>Next: done</code>。</li>
    <li><strong>内部 Auditor 和 benchmark judge 是两层系统。</strong>前者决定下一轮怎么走，后者在任务结束后按 WeaveBench、OSWorld 或 Terminal-Bench 的官方协议结算分数。</li>
    <li><strong>提升不免费，也没有组件消融。</strong>WeaveBench token 约增至 2.3 倍，OSWorld output token 约增至 3.6 倍；实验没有拆出 task state、fresh context 和 Auditor 各自贡献。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先区分 harness、task state 和 judge

这里的 harness 是围在语言模型外面的执行系统。Claude Code、Codex CLI 和 OpenClaw 都属于完整 harness：它们决定给模型哪些上下文、开放哪些工具、怎样执行命令、何时结束，以及怎样把工具结果送回下一轮。

Task state 不是聊天摘要。它记录原任务的 requirement、已经生成的 artifact、从环境里确认的 fact，以及它们当前是 <code>completed</code>、<code>pending</code>、<code>blocked</code> 还是 <code>untrusted</code>。每条可信状态还要指向一轮 audit evidence。

本文有两个容易混淆的 judge。LongHorizon-Harness 内部的 Auditor 负责检查本轮环境变化，它的报告会影响下一轮。Benchmark 的最终 judge 负责算论文表格里的分数。内部审计通过，不代表外部 benchmark 一定高分；它只是让系统更少在错误状态上继续工作。
</aside>

## Q1. 为什么长上下文还不能解决长任务？

**长上下文保存了历史，却没有把“可信的当前状态”单独维护出来。** 同一个会话同时负责执行、记住进度和判断自己是否完成时，三个问题会互相放大。

第一是 compounding errors。某一步把“文件已经保存”误判为真的，后面几百步都会把这个误判当作前提。第二是 context rot。截图、shell 输出、试错和解释越积越多，Agent 很难从几十万 tokens 里稳定恢复当前约束。第三是 task-state loss。任务往往要求保留多个相互依赖的状态，例如先截图错误，再修复公式，再截图修复结果；只记住“公式已修好”会直接破坏证据链。

论文的结构性判断是：执行轨迹和任务状态不应该放在同一个不断增长的 context 里，执行者也不应该给自己的结果盖章。LongHorizon-Harness 因此把任务状态放到 Executor 外面，并让独立 Auditor 只读检查环境。

<figure class="figure">
  <img src="/lib/papers/longhorizon-harness/harness-performance.webp" alt="LongHorizon-Harness 官方仓库性能总览图">
  <figcaption>官方仓库 <code>assets/harness_perf.png</code>。图把本文结果和部分官方榜单放在一起；因果解释应以同模型、同 executor backend 的 paired rows 为主。官方仓库 MIT License。</figcaption>
</figure>

**方法依赖明确的职责和权限边界**：Manager 不接触环境，Executor 可以改变环境，Auditor 能观察环境但不能修复它。三个角色可以使用同一个模型，但每次调用必须拿到不同的上下文、工具和写权限。

## Q2. 它和 Harness-Zero、AHE 以及普通多 Agent 有什么区别？

**LongHorizon-Harness 优化的是一次任务运行中的状态推进，不训练模型，也不自动修改底层 harness。** 它把 Claude Code、Codex CLI 等系统当作可替换 backend，在外面增加 orchestration 与审计。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>可变化的对象</th><th>发生阶段</th><th>本文与它的边界</th></tr></thead>
  <tbody>
    <tr><td><a href="/posts/论文解读/harness-zero.html">Harness-Zero</a></td><td>从 teacher harness 生成并筛选训练轨迹，更新 base model</td><td>训练阶段</td><td>目标是让模型学会 harness 提供的行为；LongHorizon 不更新模型</td></tr>
    <tr><td><a href="/posts/论文解读/agentic-harness-engineering.html">Agentic Harness Engineering</a></td><td>prompt、tool、middleware、skill、memory 等 harness component</td><td>跨任务演化</td><td>目标是自动改进 harness；LongHorizon 固定 backend，在单个任务内控制状态</td></tr>
    <tr><td>Claude Code / Codex 原生 loop</td><td>会话中的 plan、tool call、context compression</td><td>单次运行</td><td>执行和自我判断通常共享历史；LongHorizon 把持久状态与审计拆出来</td></tr>
    <tr><td>Planner / worker / reviewer 多 Agent</td><td>角色和消息拓扑</td><td>单次运行</td><td>角色名相似不够；本文明确规定谁可写环境、哪些证据可跨轮、何时允许 done</td></tr>
  </tbody>
</table>
</div>

论文没有单列 Related Work，也没有系统性地把所有 orchestration 方法放进同一张实验表。它引用了 planning、subagent、computer-use 和长上下文相关工作，但实证问题收得更窄：**外置已审计 task state，能否让现成 harness 在长任务中少丢进度、少相信错误的自我判断。**

## Q3. Manage-Execute-Audit 具体怎样运行？

### 3.1 Manager 保存什么？

Manager 每轮读原始任务、当前 task state 和历史 audit reports，但它没有 GUI、shell 或文件权限。它维护两份自然语言状态：<code>Current task state</code> 和 <code>Task contract</code>。

Task state 至少分四栏：Completed、Incomplete、Blockers/Risks、Untrusted/Do not reuse。Task contract 则保持原任务中的精确对象、文件名、路径、字段、格式、应用位置和禁止项，并写清 final-state carrier、authoritative input、state-production process、commit/persistence boundary 和 acceptance constraints。Contract 写的是这轮可检查的验收边界，不负责列出完整执行计划。

官方源码在 <code>ManagedRound</code> 中保留这些字段。下面是基于 revision <code>a1dd930</code> 的原始结构摘录，运行时为 Python 3.11+：

<div class="code-scroll"><pre><code class="language-python">@dataclass
class ManagedRound:
    round_index: int
    next_step: RoleNextStep
    plan_text: str
    executor_output: str = ""
    auditor_report: str = ""
    harness_feedback: str = ""
    task_state: str = ""
    task_contract: str = ""
    related_report_refs: list[str] = field(default_factory=list)</code></pre></div>

### 3.2 一轮只执行一个 bounded contract

<ol class="flow">
  <li><b>1 · READ</b><span>Manager 读取原任务、task state、audits。</span></li>
  <li><b>2 · CONTRACT</b><span>挑一个未完成目标，写 acceptance 与 boundaries。</span></li>
  <li><b>3 · ROUTE</b><span>按主要状态变化选择 GUI 或 CLI。</span></li>
  <li><b>4 · EXECUTE</b><span>新 episode 只拿本轮 context，修改环境。</span></li>
  <li><b>5 · REPORT</b><span>Executor 报告动作和产物，此时仍未验证。</span></li>
  <li><b>6 · AUDIT</b><span>新 context 只读检查环境，写 evidence 与 gaps。</span></li>
  <li><b>7 · UPDATE</b><span>Manager 采用审计事实，决定下一轮或结束。</span></li>
</ol>

Executor 收到原任务、task state、当前 contract，以及 contract 明确引用的 audit reports。它看不到以前的 raw trajectory。官方通用 adapter 每轮创建唯一 prompt 文件，再在同一 workspace 启动一个新的 CLI 进程。Claude Code adapter 额外设置 <code>CLAUDE_CODE_DISABLE_AUTO_MEMORY=1</code> 和 <code>CLAUDE_CODE_SKIP_PROMPT_HISTORY=1</code>；Codex adapter 通过 <code>codex exec --json</code> 从 stdin 读取本轮 prompt。

这里有一个安全细节：Codex adapter 默认在隔离环境中使用 <code>--dangerously-bypass-approvals-and-sandbox</code>，因为外层环境已经负责隔离。论文的角色边界不能替代部署隔离；如果把它放进真实项目，workspace、凭据和 network 权限仍要单独设计。

<figure class="figure">
  <img src="/lib/papers/longhorizon-harness/manage-execute-audit.webp" alt="LongHorizon-Harness Manage Execute Audit 官方架构图">
  <figcaption>官方仓库 <code>assets/mea_main.png</code>。Manager 无环境访问；Executor 可读写；Auditor 只读。论文 Figure 2 与当前仓库流程一致，但当前源码还要求 contract audit 为 aligned。官方仓库 MIT License。</figcaption>
</figure>

### 3.3 Auditor 怎样把“看起来完成”变成可用状态？

Auditor 看到原任务、task state、contract、相关历史审计和 Executor 的简短报告。它不看 Executor 的内部 reasoning 或完整历史。GUI Auditor 只能观察屏幕与已有截图；CLI Auditor 只能用 Read/Glob/Grep 和受控只读命令。Claude Code adapter 还会在审计前后做 workspace snapshot diff。若 Auditor 改了 task 文件，报告会被标为 integrity violation。

Auditor 的前三行是机器会解析的控制头：

<div class="code-scroll"><pre><code>Status: complete | incomplete | blocked
Integrity: clean | suspect | violation
Contract audit: aligned | unknown | needs_revision | invalid</code></pre></div>

源码用 guard 强制执行完成条件：

<div class="code-scroll"><pre><code class="language-python">return (
    report.status == "complete"
    and report.integrity_status == "clean"
    and report.contract_audit_status == "aligned"
)</code></pre></div>

如果 Manager 仍输出 <code>Next: done</code>，主循环不会结束。它会生成 synthetic repair feedback，把“没有 complete/clean/aligned 证据”送回下一轮 Manager。若 Auditor 报告存在 blocking constraints，解析器也会把 <code>complete</code> 降成 <code>incomplete</code>。

## Q4. 实验怎样评分，真实 case 到底说明什么？

### 4.1 内部 Auditor 不负责论文表格里的分数

<div class="tri-judge">
  <div><b>WeaveBench · 114 tasks</b><span>用 trajectory-aware Agent-as-Judge。Judge 读取 task spec、结果目录和完整 <code>chat.jsonl</code>，逐 artifact 拆 clause，再打 8 个维度。</span></div>
  <div><b>OSWorld 2.0 · 108 tasks</b><span>使用官方 <code>env.evaluate()</code>。Binary 只把 final score = 1 计为完成；Partial 是 108 题的平均细粒度分数。</span></div>
  <div><b>Terminal-Bench 2.1</b><span>Harbor + Docker，保留每题原始 CPU、memory 和环境限制。本文配置每题运行三次，取三次平均。</span></div>
</div>

WeaveBench judge 的公开 prompt 规定：先逐项检查 deliverable 与 clause，再给 task completion、deliverable correctness、quality、evidence authenticity、tool use、final state、efficiency 和 instruction following 八个维度。若发现 hack，最终分数直接为 0；否则：

<div class="formula">final_score = min(mean(8 dimension scores), deliverable_correctness)</div>

论文附录把 WeaveBench PassRate 定义为 <code>score ≥ 0.8</code> 的任务比例，Overall 是 114 题平均分。Judge 没找到 artifact 时还必须查完整轨迹；如果轨迹能证明文件确实创建过但没有被收进结果目录，可以记录 <code>unstaged_evidence=true</code>，同时降低分数。这个 judge 不是纯 file checker，也不是简单看最终截图。

### 4.2 WEB_task_16：卡在 Wireshark 后怎样恢复？

<div class="case">
<h4>WebRTC simulcast-layer audit · 0.59 → 0.92</h4>
<ol>
  <li><strong>任务来源与可见输入：</strong>WeaveBench 官方任务。Agent 要在浏览器与 Wireshark 中检查 simulcast layer，留下 chart、JSON 和 packet-level evidence。</li>
  <li><strong>Baseline 的真实轨迹：</strong>Claude Code 已经判断 <code>Decode As</code> 对话框无响应，随后仍围绕同一个 GUI 交互重试 400 多步。它只解码了一个 stream，后续证据没有补完。</li>
  <li><strong>LongHorizon 的处理：</strong>Auditor 把已验证的浏览器结果与未解决的 Wireshark blocker 分开写进 task state。Manager 后续只派缺失证据，不重新做已经确认的部分。</li>
  <li><strong>最终 judge：</strong>WeaveBench judge 对照任务 clause、结果目录和完整轨迹。Baseline 因缺证据得 0.59；LongHorizon 补齐 browser charts、JSON state 和 packet cross-validation，得 0.92。</li>
</ol>
</div>

这个 case 说明“Agent 意识到失败”与“系统从失败中恢复”是两件事。Baseline 的文字里已经出现正确诊断，但这个诊断没有被提升成跨轮 blocker，所以执行 loop 继续消耗预算。

### 4.3 DOC_task_2 与 DOC_task_4：最终状态正确还不够

<div class="case">
<h4>DOC_task_2 · heading-style normalization · 0.00 → 0.89</h4>
<ol>
  <li>任务要求通过指定 LibreOffice GUI workflow 统一 15 个 heading，并保留正确的底层 style 与 outline level。</li>
  <li>Baseline 直接改 document XML，视觉上像正确标题，但没有按要求走 LibreOffice workflow。论文的 judge 将该结果判为 0.00。</li>
  <li>LongHorizon 先用 CLI 检查底层 ODT 结构，再通过 GUI 应用正确 heading style，最后重查 XML 中 15 个 heading 的语义状态，得 0.89。</li>
</ol>
</div>

<div class="case">
<h4>DOC_task_4 · VLOOKUP repair · 0.45 → 0.87</h4>
<ol>
  <li>任务不仅要修 Calc 中的 VLOOKUP，还要保留修复前和修复后的证据。</li>
  <li>Baseline 先修公式，再回头补 pre-repair screenshot。文件已经被改变，重开后看到的错误与原始前态对不上，证据序列自相矛盾。</li>
  <li>LongHorizon 把 pre-repair evidence 作为 pending prerequisite，先保存错误状态，再修改公式、复核结果并完成九张截图序列。</li>
</ol>
</div>

这两个 case 对应两种常见错法：把视觉外观当成文件语义，把不可逆前态当成事后可以补交的附件。Task contract 提前标出最终 judge 依赖的状态载体和证据时间顺序。

### 4.4 WEB_task_10、SQLite gcov 和 mystery binary

WEB_task_10 要做 Lighthouse performance optimization 并收集 DevTools 证据。Baseline 完成了核心优化，却在证据采集里耗尽预算，没有交齐 deliverables，得 0.53。LongHorizon 把已验证的优化状态留在 task state，把剩余 screenshot 和 metadata 交给后续轮次，得 0.85。

Terminal-Bench 的两个附录 case 更像传统 coding judge。SQLite 任务有三个明确 tests：<code>test_sqlite_compiled</code>、<code>test_sqlite_in_path</code> 和 <code>test_gcov_enabled</code>。Baseline 通过前两项，但 gcov 检查失败，reward 0；LongHorizon 把 <code>.gcno</code> 产物和覆盖率符号写成 acceptance criteria，三项全过，reward 1。

Mystery binary 要独立写出 <code>/app/mystery.c</code>；官方 verifier 的三个 test 名称是 <code>test_image_c_exists</code>、<code>test_image_compiles</code> 和 <code>test_image_similarity</code>。Baseline 做了大量逆向探索，却没有交付通过相似度检查的独立实现。LongHorizon 把 strings、strace、输入输出和图像观察保存为 audited facts，再让后续轮次收敛到可编译、行为一致的 C 程序，reward 1。

### 4.5 主结果先看 matched pairs

<div class="table-scroll">
<table>
  <thead><tr><th>Benchmark</th><th>Baseline</th><th>LongHorizon</th><th>可比性</th></tr></thead>
  <tbody>
    <tr><td>WeaveBench PassRate</td><td>51.8%</td><td><strong>80.7%</strong></td><td>同 Qwen 3.7-Plus、同 Claude Code executor；最干净的主对比</td></tr>
    <tr><td>WeaveBench Overall</td><td>0.702</td><td><strong>0.835</strong></td><td>同上；114 tasks</td></tr>
    <tr><td>Terminal-Bench 2.1</td><td>69.7%</td><td><strong>77.2%</strong></td><td>同 Qwen 3.7-Plus、同 Claude Code；每题三次</td></tr>
    <tr><td>OSWorld Binary</td><td>2.8%</td><td><strong>8.3%</strong></td><td>baseline 为 single-action GUI，本文为 hybrid GUI+CLI</td></tr>
    <tr><td>OSWorld Partial</td><td>21.5%</td><td><strong>35.2%</strong></td><td>同上，108 tasks</td></tr>
    <tr><td>OSWorld Opus subset</td><td>20.6% / 55.8%</td><td><strong>35.3% / 66.9%</strong></td><td>34 tasks；Binary / Partial，工具模式也不同</td></tr>
  </tbody>
</table>
</div>

WeaveBench 官方最佳行使用普通用户权限，作者自己的 Qwen runs 在 task VM 中有 root，因此官方 41.2% 只能作为参考。OSWorld 的主要 limitation 更直接：Baseline 是 single-action GUI，LongHorizon 使用 hybrid GUI+CLI。它同时改变了 orchestration 和 action space，不能把全部提升都归给 MEA。

还有一个论文内部不一致。Abstract 写 Claude Opus 4.7 在子集上从 20.0% 到 34.3%，Table 3 与 Appendix B.1 则是 20.6% 到 35.3%。这里采用表格和附录的 20.6→35.3，并把摘要数字视为排版或版本同步错误。

## Q5. 这篇论文对 harness 研究最有用的启发是什么？

### 5.1 把“状态”设计成可引用的证据图

最值得复用的是 state transition 的数据契约。每条事实有来源轮次，每个 contract 只携带相关 reports，下一步依赖项必须来自已审计事实。这样可以把“上下文压缩”从文本摘要问题改成 provenance 问题：哪些事实能进入下一轮，为什么能信，谁验证过。

对 Claude Code 或 Codex 的研究，可以把它进一步做成结构化 schema，而不是完全依赖自然语言 section parser。例如 requirement、artifact、fact 各自拥有稳定 ID、status、evidence locator、freshness 和 invalidation rule。当前官方实现主要从自然语言 prompt 中提取 <code>Current task state</code> 与 <code>Task contract</code>，可读性强，但格式修复和状态冲突处理仍会依赖模型。

### 5.2 Auditor 需要硬权限边界

源码里有两层约束：prompt 告诉 Auditor 只读，Claude adapter 在审计前后做 workspace snapshot diff。这个方向是对的，因为单独写“你是 reviewer，请不要修改”并不能形成可靠边界。

下一步应把它做得更硬：只读 mount、单独容器、network policy、命令 allowlist、artifact content hash、GUI observation proxy，以及对 Auditor 本身的 false positive / false negative 校准。当前仓库对 Codex 的角色隔离没有像 Claude Code adapter 那样完整展示 tool-policy 与 mutation guard，跨 backend 的安全等价性还需要额外验证。

### 5.3 把 budget 分给执行、核验和恢复

Auditor 占 LongHorizon 总 token 的 19.4%（WeaveBench）、24.8%（OSWorld）和 38.1%（Terminal-Bench）；Manager 只占 2.8%、2.0% 和 8.1%。**独立核验是主要 token 支出。**

<div class="bars" aria-label="成本变化">
  <div class="bar"><span>WeaveBench total tokens</span><div class="track"><div class="fill orange" style="width:64%"></div></div><em>2.3×</em></div>
  <div class="bar"><span>OSWorld output tokens</span><div class="track"><div class="fill orange" style="width:100%"></div></div><em>3.6×</em></div>
  <div class="bar"><span>Terminal-Bench tokens</span><div class="track"><div class="fill green" style="width:21%"></div></div><em>-24%</em></div>
</div>

同一机制在 Terminal-Bench 反而少用 24% token，说明核验有时能砍掉无效重试；在 OSWorld 这种截图密集任务里，它也可能产生很高成本。论文的 Games 子集更能说明模型与 harness 的耦合：Qwen 从 10.7M 增至 34.3M tokens，Opus 却从 16.5M 降至 11.1M。弱模型可能需要更多恢复轮次，强模型则会因为明确 contract 少走弯路。

## Q6. 最后该怎样评价这篇工作？

**它证明了一整套“外置状态、fresh episode、独立审计”的系统能显著提高长任务完成率，但没有证明其中哪一部分是必要条件。** 这使它非常适合当工程与研究起点，也留下了清楚的实验缺口。

最主要的限制有五个：

1. 没有组件消融。Task state、fresh context、Auditor、GUI/CLI routing 和额外 compute 没有被单独拆开。
2. OSWorld 同时改变 action space，因果解释不干净。Opus 34-task subset 里还有明显 regression，例如若干 baseline 已满分的任务被 LongHorizon 做坏。
3. WeaveBench 与 OSWorld 没有报告多 seed 或统计显著性。Terminal-Bench 每题三次，但主框架仍没有多次独立 orchestration run 的方差分析。
4. 内部 Auditor 仍由模型生成自然语言判断。Workspace mutation guard 能抓到写文件，却不能证明语义判断已经校准，也没有报告 Auditor 对每类错误的 precision / recall。
5. 成本高度依赖模型和任务。一个更谨慎的 harness 可能提高成功率，也可能让弱模型在恢复循环里消耗三倍 token。

如果要沿这个方向继续发论文，我会优先做四组实验：固定总 token / wall-clock 的预算对比；对 task state、fresh context、Auditor 的完整因子消融；跨模型互审和 auditor calibration；把 task state 从自然语言升级为带 provenance、invalidation 和 confidence 的结构化状态图。这样才能回答 LongHorizon-Harness 目前没有回答的问题：提升究竟来自更好的记忆、更干净的上下文、更严格的 judge，还是更多次尝试。

</div>

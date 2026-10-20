---
title: "[2026-08-03] LongHorizon-Harness: Advancing Long-Horizon Agents for Real-World Tasks"
permalink: "/posts/论文解读/longhorizon-harness.html"
date: "2026-09-28T22:30:00+08:00"
updated: "2026-10-20T14:00:00+08:00"
cover: "/generated-covers/050-longhorizon-harness.webp"
description: "拆解 LongHorizon-Harness 如何单独保存任务进度、每轮重新启动执行会话并独立核验结果；结合真实失败案例，说明评分、成本与实验限制。"
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
@media(max-width:700px){.lh-reading .post-deck-embed-frame{height:min(75vh,640px);aspect-ratio:auto}}
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
  <div class="deck-head"><strong>16 页交互图解 · 保存进度、分轮执行、独立核验</strong><a href="/lib/decks/longhorizon-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/longhorizon-harness-visual-guide.html" title="LongHorizon-Harness 论文图解，共 16 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机端可在图解内上下滑动；独立打开后可点“返回文章”</span></p>
  </div>
</section>

<p class="lead">LongHorizon-Harness 解决的是一个很具体的问题：Claude Code 或 Codex 做几个小时的任务时，执行历史会越来越长，“已经完成了什么、哪些结果真的验证过、下一步应改哪一处”逐渐混在聊天记录里。论文单独保存任务进度：Manager 分派下一步，Executor 在新会话里执行，Auditor 只读检查结果。下一轮不继承完整聊天历史，只使用已经核验的进度和当前子任务。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读前需要知道的概念</span>

### 先区分 harness、task state 和 judge

这里的 harness 是围在语言模型外面的执行系统。Claude Code、Codex CLI 和 OpenClaw 都属于完整 harness：它们决定给模型哪些上下文、开放哪些工具、怎样执行命令、何时结束，以及怎样把工具结果送回下一轮。

**Task state 是任务进度记录，不是聊天摘要。** 它分别记录原任务要求（requirement）、生成的文件或其他产物（artifact）、从环境确认的事实（fact），并标为已完成、待完成、受阻或尚未可信。比如“修复前截图已保存”必须引用 Auditor 检查过的截图，不能仅凭 Executor 说“保存好了”。

**Task contract 是本轮的验收要求。** 它写明这轮要改什么、哪些已有结果不能改变、完成后检查哪个文件或屏幕。Fresh context 则指启动一个不带旧聊天历史的新会话；项目文件仍保留，并不是每轮从空目录重做。

本文有两个容易混淆的 judge，也就是检查结果是否满足要求的评测者。LongHorizon-Harness 内部的 Auditor 负责检查本轮环境变化，它的报告会影响下一轮。Benchmark 的最终 judge 负责算论文表格里的分数。内部审计通过，不代表外部 benchmark 一定高分；它只是让系统更少在错误状态上继续工作。WeaveBench 的 PassRate 是最终分数不低于 0.8 的任务比例；Terminal-Bench 的 success rate 是测试通过率；OSWorld 的 Binary 则只把最终分数等于 1 的任务计为完成。
</aside>

<div class="interest"><b>作者兴趣度 9.5 / 10</b><span>和 Claude Code、Codex 一类完整 harness 的长任务可靠性直接相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>51.8 → 80.7</strong><span>WeaveBench PassRate</span></div>
  <div class="metric"><strong>69.7 → 77.2</strong><span>Terminal-Bench 2.1 success rate</span></div>
  <div class="metric"><strong>2.8 → 8.3</strong><span>OSWorld 2.0 Binary</span></div>
  <div class="metric"><strong>2.3× / 3.6×</strong><span>Weave 总 token / OSWorld 输出 token</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>论文单独维护任务进度。</strong>跨轮保存核验过的需求、产物与事实，不是完整执行轨迹。</li>
    <li><strong>Executor 的“完成”不产生可信状态。</strong>当前源码要求最近一份审计同时确认任务完成、核验未违规、验收要求与原任务一致，即 <code>complete</code>、<code>clean</code>、<code>aligned</code>，才接受 <code>Next: done</code>。</li>
    <li><strong>内部 Auditor 与最终评分者是两层系统。</strong>前者决定下一轮怎么走，后者在任务结束后按 WeaveBench、OSWorld 或 Terminal-Bench 的官方协议结算分数。</li>
    <li><strong>提升不免费，也没有组件消融。</strong>WeaveBench 总 token 约为 2.3 倍，OSWorld 输出 token 约为 3.6 倍；未单独检验进度记录、新会话和核验各自的贡献。</li>
  </ul>
</aside>


<h2 id="长聊天历史为什么仍会丢进度？">1. Motivation：长聊天历史为什么仍会丢进度？</h2>

**长上下文保存了历史，却没有把“可信的当前状态”单独维护出来。** 同一个会话同时负责执行、记住进度和判断自己是否完成时，三个问题会互相放大。

论文列出三种失败。Compounding errors 指早期误判被后续步骤反复沿用，例如把“文件已保存”当成事实。Context rot 指历史越长，模型越难从截图、命令输出和试错里找准当前约束。Task-state loss 指某些必要进度被遗忘，例如任务要求先截错误状态、再修公式、最后截修复结果；只记住“公式修好了”就无法补回真实的修复前截图。

论文的结构性判断是：执行轨迹和任务状态不应该放在同一个不断增长的上下文里，执行者也不应该给自己的结果盖章。LongHorizon-Harness 因此把任务状态放到 Executor 外面，并让独立 Auditor 只读检查环境。

<figure class="figure">
  <a href="/lib/papers/longhorizon-harness/harness-performance.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/longhorizon-harness/harness-performance.webp" alt="LongHorizon-Harness 官方仓库性能总览图" width="2200" height="1800"></a>
  <figcaption>官方仓库 <code>assets/harness_perf.png</code>。图把本文结果和部分官方榜单放在一起；因果解释应以同模型、同执行程序的配对结果为主。官方仓库 MIT License。</figcaption>
</figure>

**方法依赖明确的职责和权限边界**：Manager 不接触环境，Executor 可以改变环境，Auditor 能观察环境但不能修复它。三个角色可以使用同一个模型，但每次调用必须拿到不同的上下文、工具和写权限。

<h2 id="与模型蒸馏、执行程序演化和普通多-Agent-的区别">2. Related Work：与模型蒸馏、执行程序演化和普通多 Agent 的区别</h2>

**LongHorizon-Harness 优化的是一次任务运行中的状态推进，不训练模型，也不自动修改底层 harness。** 它把 Claude Code、Codex CLI 等系统当作可替换的执行程序，在外层决定每轮做什么、保留哪些进度、何时结束。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>可变化的对象</th><th>发生阶段</th><th>本文与它的边界</th></tr></thead>
  <tbody>
    <tr><td><a href="/posts/论文解读/harness-zero.html">Harness-Zero</a></td><td>用教师执行程序生成、筛选训练记录，再微调基础模型</td><td>训练阶段</td><td>目标是让模型学会 harness 提供的行为；LongHorizon 不更新模型</td></tr>
    <tr><td><a href="/posts/论文解读/agentic-harness-engineering.html">Agentic Harness Engineering</a></td><td>提示词、工具、中间处理逻辑、技能和记忆</td><td>跨任务演化</td><td>目标是自动改进 harness；LongHorizon 固定执行后端，在单个任务内控制状态</td></tr>
    <tr><td>Claude Code / Codex 原有运行循环</td><td>会话中的计划、工具调用和历史压缩</td><td>单次运行</td><td>执行和自我判断通常共享历史；LongHorizon 把持久状态与审计拆出来</td></tr>
    <tr><td>Planner / worker / reviewer 多 Agent</td><td>角色与消息流程</td><td>单次运行</td><td>角色名相似不够；本文明确规定谁可写环境、哪些证据可跨轮、何时允许 done</td></tr>
  </tbody>
</table>
</div>

论文没有单列 Related Work，也没有系统性地把所有多角色编排方法放进同一张实验表。它引用了规划、子 Agent、计算机操作和长上下文相关工作，但实证问题收得更窄：**单独保存已核验进度，能否让现成 harness 在长任务中少丢进度、少相信错误的自我判断。**

<h2 id="一轮执行：分派子任务、操作环境、核验结果">3. Method：一轮执行：分派子任务、操作环境、核验结果</h2>

**Manager 分派下一步，Executor 修改环境，Auditor 独立检查；只有核验支持的进度才能复用。**

<h3 id="3-1-Manager-保存什么？">3.1 Manager 保存什么？</h3>

Manager 每轮读原始任务、当前任务进度与历史核验报告，但它没有 GUI、shell 或文件权限。它维护两份自然语言状态：<code>Current task state</code> 和 <code>Task contract</code>。

Task state 至少分四栏：已完成、未完成、阻碍与风险、尚未可信／不可复用。Task contract 保留原任务中的精确对象、文件名、路径、字段、格式和禁止项，同时写清五件事：最终结果保存在哪、以哪个输入为准、必须经过哪些操作、何时算真正保存完成、怎样验收。它限定本轮的检查范围，不是让 Manager 代替 Executor 写出每一步操作。

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

<h3 id="3-2-每轮只执行一份有明确范围的验收要求">3.2 每轮只执行一份有明确范围的验收要求</h3>

<ol class="flow">
  <li><b>1 · 读取进度</b><span>Manager 读取原任务、当前进度与历史核验。</span></li>
  <li><b>2 · 写验收要求</b><span>选择一个未完成目标，写验收条件和禁止改动。</span></li>
  <li><b>3 · 选择执行方式</b><span>按主要状态变化选择 GUI 或 CLI。</span></li>
  <li><b>4 · 执行</b><span>新会话只接收本轮信息，修改环境。</span></li>
  <li><b>5 · 报告</b><span>Executor 报告动作和产物，此时仍未验证。</span></li>
  <li><b>6 · 核验</b><span>新会话只读检查结果，记录证据与缺项。</span></li>
  <li><b>7 · 更新进度</b><span>Manager 采用审计事实，决定下一轮或结束。</span></li>
</ol>

Executor 收到原任务、任务进度、本轮验收要求，以及明确引用的历史核验报告。它看不到以前逐步生成的思考、命令与观察记录。官方通用适配器每轮创建唯一提示文件，再在同一工作区启动一个新的 CLI 进程。Claude Code adapter 额外设置 <code>CLAUDE_CODE_DISABLE_AUTO_MEMORY=1</code> 和 <code>CLAUDE_CODE_SKIP_PROMPT_HISTORY=1</code>；Codex adapter 通过 <code>codex exec --json</code> 从 stdin 读取本轮提示。

这里有一个安全细节：Codex adapter 默认在隔离环境中使用 <code>--dangerously-bypass-approvals-and-sandbox</code>，因为外层环境已经负责隔离。论文的角色边界不能替代部署隔离；如果把它放进真实项目，工作区、凭据和网络权限仍要单独设计。

<figure class="figure">
  <a href="/lib/papers/longhorizon-harness/manage-execute-audit.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/longhorizon-harness/manage-execute-audit.webp" alt="LongHorizon-Harness Manage Execute Audit 官方架构图" width="2400" height="1600"></a>
  <figcaption>官方仓库 <code>assets/mea_main.png</code>。Manager 无环境访问；Executor 可读写；Auditor 只读。论文 Figure 2 与当前仓库流程一致，但当前源码还要求 contract audit 为 aligned。官方仓库 MIT License。</figcaption>
</figure>

<h3 id="3-3-Auditor-怎样把“看起来完成”变成可用状态？">3.3 Auditor 怎样把“看起来完成”变成可用状态？</h3>

Auditor 看到原任务、当前进度与验收要求、相关历史审计和 Executor 的简短报告。它不看 Executor 的内部推理文字或完整历史。论文要求它只观察环境，不改变待检结果。当前仓库的 GUI Auditor 提示词还更严格地禁止点击、输入、滚动和改变窗口，允许观察屏幕、检查已有截图与只读文件。Claude Code adapter 会比较审计前后的工作区快照；若检测到任务文件被修改，报告会被标为 <code>integrity violation</code>，即核验过程违反只读要求。

**论文的权限设计与固定代码版本不能混成一件事。** 在 revision <code>a1dd930</code> 中，GUI 和 CLI Executor 都能加载计算机操作工具，差别主要由任务提示限定；GUI 并非从工具层彻底失去 shell。Auditor 的禁用名单屏蔽 Write、Edit、NotebookEdit 和 Agent，却没有禁用 Bash 或全部计算机操作工具，只读命令也没有在这里实现为硬性允许名单。Manager 提示词要求不读取环境，但工具禁用名单没有排除 Read/Glob/Grep。因此这些角色规则加上快照检测，仍不等于文件系统或进程沙箱。

Auditor 的前三行是机器会解析的控制头：

<div class="code-scroll"><pre><code>Status: complete | incomplete | blocked
Integrity: clean | suspect | violation
Contract audit: aligned | unknown | needs_revision | invalid</code></pre></div>

源码强制检查完成条件：

<div class="code-scroll"><pre><code class="language-python">return (
    report.status == "complete"
    and report.integrity_status == "clean"
    and report.contract_audit_status == "aligned"
)</code></pre></div>

<code>complete</code> 表示任务完成，<code>clean</code> 表示核验未发现越权修改，<code>aligned</code> 表示本轮验收要求与原任务一致。**当前源码的三个条件缺一不可。** 不满足时，即使 Manager 输出 <code>Next: done</code>，主循环也会拒绝结束，并把缺失条件送回下一轮；报告里仍有阻断项时，解析器还会把 <code>complete</code> 改成 <code>incomplete</code>。论文 §2.4 本身列的是完成状态、完整性状态和支持进度更新的证据；第三行 <code>Contract audit</code> 是固定仓库版本中能直接检查到的附加要求。

论文和当前配置都规定最多 25 轮，每轮 Executor 最多 1800 秒，Manager 和 Auditor 各 300 秒。它们是各角色调用的上限，不是每题实际平均耗时。附录 Figure 20 的一轮 Auditor 却记录了 600 秒调用上限以及命令在 660 秒超时；这一条展示轨迹与上述默认值不同，不能把默认值说成所有实验调用都严格遵循的事实。

<h2 id="评分协议与真实失败案例">4. Experiments：评分协议与真实失败案例</h2>

**内部 Auditor 帮助继续执行，论文分数仍由各 benchmark 的最终评测器决定。**

<h3 id="4-1-内部-Auditor-不负责论文表格里的分数">4.1 内部 Auditor 不负责论文表格里的分数</h3>

<div class="tri-judge">
  <div><b>WeaveBench · 114 道题</b><span>用模型担任最终评分者。它读取任务说明、结果目录和完整 <code>chat.jsonl</code>，逐个产物核对要求，再给八个维度打分。</span></div>
  <div><b>OSWorld 2.0 · 108 道题</b><span>使用官方 <code>env.evaluate()</code>。Binary 只把 final score = 1 计为完成；Partial 是 108 题的平均细粒度分数。</span></div>
  <div><b>Terminal-Bench 2.1 · 89 道题</b><span>Harbor + Docker，保留每题原始 CPU、内存与环境限制。每题三个独立 trial，每个 trial 最多五小时，共 267 条运行记录。</span></div>
</div>

WeaveBench judge 的公开 prompt 规定：先逐项检查产物和要求，再评任务完成、产物正确性、质量、证据真实性、工具使用、最终状态、效率与遵循指令八个维度。发现利用评分漏洞，最终分数直接为 0；否则：

<div class="formula">final_score = min(mean(8 dimension scores), deliverable_correctness)</div>

例如八维均分为 0.90、产物正确性为 0.70，最终分只能是 0.70，不能靠其他高分抵消错误；这是根据公式构造的说明例，不是作者的逐题结果。论文附录把 WeaveBench PassRate 定义为 <code>score ≥ 0.8</code> 的任务比例，Overall 是 114 题平均分。论文使用 Claude Opus 4.7 担任最终评分者，通过 OpenClaw 运行，思考档位为 medium。评分者没找到产物时还必须查完整轨迹；如果轨迹能证明文件确实创建过但没有被收进结果目录，可以记录 <code>unstaged_evidence=true</code>，同时降低分数。这个评分者不只查文件，也不是简单看最终截图。

三种聚合分别是：WeaveBench 的 <code>PassRate = Σ 1[sᵢ ≥ 0.8] / 114</code>；OSWorld 的 <code>Binary = Σ 1[sᵢ = 1] / 108</code>、<code>Partial = Σ sᵢ / 108</code>；Terminal-Bench 的 <code>success rate = Σₜ Σᵣ rewardₜ,ᵣ / (89 × 3)</code>，其中测试全部通过时 reward 为 1，否则为 0。用 267 作分母，186/267 ≈ 69.7%，206/267 ≈ 77.2%；这只是按论文保留一位小数的总体值反算，不能据此指定哪道题的三次运行成功。

<figure class="figure wide"><a href="/lib/papers/longhorizon-harness/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/longhorizon-harness/body-case.svg" alt="WEB_task_16 从重复操作卡住的界面到保存进度、补齐证据及最终判分的过程" width="1000" height="980"></a><figcaption>根据论文 §3.4、Figures 7 / 14 整理。内部 Auditor 保存核验结果；最终 0.59 / 0.92 分由 WeaveBench judge 给出。图解释公开案例，不是原文截图或完整模型日志。</figcaption></figure>

<h3 id="4-2-WEB-task-16：Wireshark-卡住后的恢复">4.2 WEB_task_16：Wireshark 卡住后的恢复</h3>

<div class="case">
<h4>WebRTC simulcast-layer audit · 0.59 → 0.92</h4>
<ol>
  <li><strong>任务来源与可见输入：</strong>WeaveBench 官方任务。Agent 要检查 WebRTC 同时发送的不同视频质量层（simulcast layers），用浏览器图表、JSON 状态和 Wireshark 抓包相互印证。</li>
  <li><strong>Baseline 的真实轨迹：</strong>Claude Code 已经判断 <code>Decode As</code> 对话框无响应，随后仍围绕同一个 GUI 交互重试 400 多步。它只解码了一个数据流，后续证据没有补完。</li>
  <li><strong>LongHorizon 的处理：</strong>系统把已验证结果与未解决的 Wireshark 阻碍分别写入进度。后续轮次补证据：Figure 14 显示在约 46.5 秒处截取最高质量的 f 视频层 <code>fps=0</code>、<code>frameWidth=0×0</code>，确认帧率图在 38–52 秒区间为 0，再用 Wireshark 中的 21,018 个包交叉检查。Manager 不再派已经确认的前半段工作。</li>
  <li><strong>最终 judge：</strong>WeaveBench judge 对照任务要求、结果目录和完整轨迹。Baseline 因缺证据得 0.59；LongHorizon 补齐浏览器图表、JSON 状态和抓包交叉核验，得 0.92。</li>
</ol>
</div>

这个 case 说明“Agent 意识到失败”与“系统从失败中恢复”是两件事。Baseline 的文字里已经出现正确诊断，但这条诊断没有作为“尚未解决的阻碍”明确交给下一轮，执行程序仍围着同一个对话框重试。

<h3 id="4-3-两个文档任务：操作要求和证据顺序也要满足">4.3 两个文档任务：操作要求和证据顺序也要满足</h3>

<div class="case">
<h4>DOC_task_2 · 统一标题样式 · 0.00 → 0.89</h4>
<ol>
  <li>任务要求在 LibreOffice 图形界面里统一 15 个标题，同时保证文档实际保存的是正确标题样式与大纲层级，而不只是字体看着相似。</li>
  <li>Baseline 先从样式下拉框发现 “Results” 实际是 <code>FakeBoldParagraph</code>，随后直接改文档 XML。它把目录看起来正确、导出对话框关闭当成完成，却没有遵循要求的 LibreOffice 图形操作，也没证实 PDF 已产生。论文 judge 判为 0.00。</li>
  <li>LongHorizon 在图形界面检查当前样式，通过样式下拉框应用 Heading 1，再逐页检查全部 15 个标题。Auditor 随后解析文档 XML，确认样式为 <code>Heading_20_1</code>、<code>outline-level="1"</code>，得 0.89。Figure 8 支持的是“先 GUI 修改、再 XML 核验”，不是“先 CLI 检查、再 GUI 修改”。</li>
</ol>
</div>

<div class="case">
<h4>DOC_task_4 · 修复 VLOOKUP 并保留前后截图 · 0.45 → 0.87</h4>
<ol>
  <li>任务不仅要修 Calc 中的 VLOOKUP，还要保留修复前和修复后的证据。</li>
  <li>Baseline 已保存一部分初始错误截图，但还没收齐要求的修复前证据就直接修改 XML。重新打开文件仍显示 <code>Err:510</code>；最终文件和截图序列不一致。问题是前态证据未收全，不是完全没有先截图。</li>
  <li>LongHorizon 把修复前证据列为必须先做的待办项，先保存错误状态，再修改公式、复核结果并完成九张截图序列。</li>
</ol>
</div>

这两个 case 对应两种常见错法：把视觉外观当成文件语义，把不可逆前态当成事后可以补交的附件。本轮验收要求需要提前写明最终评分要检查的文件、屏幕状态，以及截图必须发生在哪次修改之前或之后。

<h3 id="4-4-WEB-task-10、SQLite-gcov-和-mystery-binary">4.4 WEB_task_10、SQLite gcov 和 mystery binary</h3>

WEB_task_10 要做 Lighthouse 网页性能优化并收集 DevTools 证据。Baseline 完成了核心优化，却在证据采集里耗尽预算，没有交齐产物，得 0.53。LongHorizon 把已验证的优化状态留在进度记录中，把剩余截图和元数据交给后续轮次，得 0.85。

Terminal-Bench 的两个附录 case 用程序测试结算。SQLite 任务有三项明确测试：<code>test_sqlite_compiled</code>、<code>test_sqlite_in_path</code> 和 <code>test_gcov_enabled</code>。gcov 是检查代码哪些部分真正运行过的覆盖率工具；编译时需加入相应选项，并产生 <code>.gcno</code> 文件和覆盖率符号。Baseline 通过前两项，但 gcov 检查失败，reward 0；LongHorizon 在六轮中分别检查源码来源、编译位置、覆盖率、PATH 和最终保存位置，三项全过，reward 1。

Mystery binary 要独立写出 <code>/app/mystery.c</code>，复刻给定程序产生的图像；最终评测器的三个 test 名称是 <code>test_image_c_exists</code>、<code>test_image_compiles</code> 和 <code>test_image_similarity</code>。Baseline 已交付能编译的文件，前两项通过，但图像相似度失败，reward 0。LongHorizon 把已核验的逆向结果交给后续轮次：用 <code>gcc -static -o reversed mystery.c -lm</code> 编译，检查源文件 gzip 后小于 2000 字节，并确认它不调用原程序。Figure 20 展示独立实现生成相同图像、临时移走原程序后图像 MD5 仍一致；九轮后 reward 1。这里证明的是公开案例中的图像、大小与独立性检查，不能扩写成未展示的“多类输入均等价”。

<h3 id="4-5-主结果：优先比较相同模型和执行后端">4.5 主结果：优先比较相同模型和执行后端</h3>

<div class="table-scroll">
<table>
  <thead><tr><th>Benchmark</th><th>Baseline</th><th>LongHorizon</th><th>可比性</th></tr></thead>
  <tbody>
    <tr><td>WeaveBench PassRate</td><td>51.8%</td><td><strong>80.7%</strong></td><td>同 Qwen 3.7-Plus、同 Claude Code 执行程序；最干净的主对比</td></tr>
    <tr><td>WeaveBench Overall</td><td>0.702</td><td><strong>0.835</strong></td><td>同上；114 道题</td></tr>
    <tr><td>Terminal-Bench 2.1</td><td>69.7%</td><td><strong>77.2%</strong></td><td>同 Qwen 3.7-Plus、同 Claude Code；每题三次</td></tr>
    <tr><td>OSWorld Binary</td><td>2.8%</td><td><strong>8.3%</strong></td><td>基线只允许单次图形操作；本文可同时用图形界面与命令行</td></tr>
    <tr><td>OSWorld Partial</td><td>21.5%</td><td><strong>35.2%</strong></td><td>同上，108 道题</td></tr>
    <tr><td>OSWorld Opus subset</td><td>20.6% / 55.8%</td><td><strong>35.3% / 66.9%</strong></td><td>34 道题；Binary / Partial，工具模式也不同</td></tr>
  </tbody>
</table>
</div>

WeaveBench 官方最佳行使用普通用户权限，作者自己的 Qwen 实验在任务虚拟机中有 root 权限，因此官方 41.2% 只能作为参考。同 Qwen、同 Claude Code 的 51.8→80.7 更有比较价值，但没有控制相同总 token 成本。OSWorld 的主要限制更直接：Baseline 是 single-action GUI，LongHorizon 使用 hybrid GUI+CLI，即同时允许图形操作和命令行。它同时改变多角色编排和可用工具，不能把全部提升都归给 MEA。

**额外核验也会把原本成功的任务做坏。** Appendix Table 5 中，Opus 子集的 021 和 030 都从 1 降到 0。Table 6 中，WeaveBench Desktop 的 PassRate 增加 5.56 个百分点，平均分却从 0.8671 降到 0.8465。Table 9 中，Terminal-Bench 数学类从 0.917 降到 0.750，数据科学类从 0.792 降到 0.667。不能从总体提升推出每类任务都更可靠。

还有一个论文内部不一致。Abstract 写 Claude Opus 4.7 在子集上从 20.0% 到 34.3%，Table 3 与 Appendix B.1 则是 20.6% 到 35.3%。这里保留表格和附录的 20.6→35.3，同时标明摘要不同；论文没有解释差异，不能确定是排版问题还是运行版本不同。

<h2 id="可复用的设计与需要补做的实验">5. Discussion：可复用的设计与需要补做的实验</h2>

**进度需要对应具体证据，额外核验也需要接受固定预算下的成本比较。**

<h3 id="5-1-每条进度都说明依据，文件变化后重新核验">5.1 每条进度都说明依据，文件变化后重新核验</h3>

最值得复用的是进度记录规则：每条事实注明由哪轮核验，每次执行只收到相关报告，不能把 Executor 自述直接当成已完成。这样后续模型知道哪些进度能沿用、依据是什么；文件变了，旧报告也应重新检查。

对 Claude Code 或 Codex 的研究，可以把它进一步做成结构化格式，而不是完全依赖自然语言段落解析。例如给任务要求、文件产物和已确认事实分配稳定 ID，记录状态、证据位置、最后核验时间，以及什么改动会使旧结论失效。当前官方实现主要从自然语言提示中提取 <code>Current task state</code> 与 <code>Task contract</code>，可读性强，但格式修复和状态冲突处理仍会依赖模型。

<h3 id="5-2-Auditor-需要硬权限边界">5.2 Auditor 需要硬权限边界</h3>

源码里有两层约束：prompt 告诉 Auditor 只读，Claude Code 适配器在审计前后做工作区前后快照比较。这个方向是对的，因为单独写“你是 reviewer，请不要修改”并不能形成可靠边界。

下一步应把它做得更硬：只读挂载、独立容器、网络权限限制、允许执行的命令清单、文件哈希，以及只开放观察操作的 GUI 接口。还应测 Auditor 有多少误放行和误拒绝，不能把“没改文件”当成“判断正确”。当前仓库对 Codex 的角色隔离没有像 Claude Code 适配器那样完整展示工具权限与写入检测，跨执行后端的安全等价性还需要额外验证。

<h3 id="5-3-在固定预算下衡量核验是否划算">5.3 在固定预算下衡量核验是否划算</h3>

Auditor 占 LongHorizon 总 token 的 19.4%（WeaveBench）、24.8%（OSWorld）和 38.1%（Terminal-Bench）；Manager 只占 2.8%、2.0% 和 8.1%。**独立核验是主要 token 支出。**

<div class="bars" aria-label="成本变化">
  <div class="bar"><span>WeaveBench 总 token</span><div class="track"><div class="fill orange" style="width:64%"></div></div><em>2.3×</em></div>
  <div class="bar"><span>OSWorld 输出 token</span><div class="track"><div class="fill orange" style="width:100%"></div></div><em>3.6×</em></div>
  <div class="bar"><span>Terminal-Bench 总 token</span><div class="track"><div class="fill green" style="width:21%"></div></div><em>-24%</em></div>
</div>

同一机制在 Terminal-Bench 反而少用 24% token，说明核验有时能砍掉无效重试；在 OSWorld 这种截图密集任务里，它也可能产生很高成本。论文的 Games 子集更能说明模型与 harness 的耦合：Qwen 从 10.7M 增至 34.3M tokens，Opus 却从 16.5M 降至 11.1M。弱模型可能需要更多恢复轮次，强模型则会因为明确的验收要求少走弯路。

<h2 id="已有证据与实验限制">6. Conclusion：已有证据与实验限制</h2>

**它证明了一整套“单独保存进度、新会话执行、独立核验”的系统能显著提高长任务完成率，但没有证明其中哪一部分是必要条件。** 这使它非常适合当工程与研究起点，也留下了清楚的实验缺口。

最主要的限制有五个：

1. 没有组件消融。进度记录、新会话、Auditor、图形与命令行分派和额外算力没有被单独拆开。
2. OSWorld 同时改变可用工具，因果解释不干净。Opus 34 题子集里还有明显退化，例如若干基线已满分的任务被 LongHorizon 做坏。
3. WeaveBench 与 OSWorld 没有报告多随机种子或统计显著性。Terminal-Bench 每题三次，但主框架仍没有多次独立多角色运行的方差分析。
4. 内部 Auditor 仍由模型生成自然语言判断。工作区写入检测能抓到写文件，却不能证明语义判断已经校准，也没有报告 Auditor 对每类错误的精确率 / 召回率。
5. 成本高度依赖模型和任务。一个更谨慎的 harness 可能提高成功率，也可能让弱模型在恢复循环里消耗三倍 token。

如果要沿这个方向继续发论文，我会优先做四组实验：固定总 token 与运行时间的预算对比；分别去掉进度记录、新会话和独立核验；测不同模型互审时的误放行与误拒绝；比较自然语言进度表和能记录证据来源、失效条件的结构化记录。这样才能回答 LongHorizon-Harness 目前没有回答的问题：提升究竟来自更好的记忆、更干净的上下文、更严格的 judge，还是更多次尝试。

</div>

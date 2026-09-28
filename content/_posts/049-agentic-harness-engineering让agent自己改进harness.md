---
title: "Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses"
permalink: "/posts/论文解读/agentic-harness-engineering.html"
date: "2026-09-28T21:30:00+08:00"
updated: "2026-09-28T21:30:00+08:00"
cover: "/generated-covers/049-agentic-harness-engineering.webp"
description: "从三层 observability、change manifest 和真实失败轨迹出发，拆解 AHE 如何自动修改 prompt、tool、middleware 与 memory，以及它在 Terminal-Bench 2 上真正证明了什么。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 14
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Coding Agent"
  - "Self-Evolving Agent"
---

<style>
html:not([data-theme="dark"]) body:has(.ahe-reading){--paper:#fff;--paper-elevated:#f6f7f8;--ink:#20252b;--ink-soft:#67717c;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:760px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:25ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.13}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-deck>p{font-family:var(--sans);font-size:.93rem;line-height:1.65}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}.article-shell-deck .article-stats dd{font-family:var(--sans);font-variant-numeric:tabular-nums}
.ahe-reading{--ahe-column:760px;--ahe-blue:#245c9c;--ahe-orange:#b9552d;--ahe-green:#287462;--ahe-red:#a0443d;--ahe-ink:var(--ink);--ahe-soft:var(--ink-soft);--ahe-surface:var(--paper-elevated);--ahe-line:var(--line);width:min(100%,var(--ahe-column));margin-inline:auto;color:var(--ahe-ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}
.ahe-reading>*{max-width:100%}.ahe-reading p,.ahe-reading li{text-wrap:pretty}.ahe-reading .paper-meta{margin:0 0 7px;color:var(--ahe-soft);font:400 .8rem/1.55 var(--sans)}.ahe-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}.ahe-reading .source-links a{font-family:var(--sans)}
.ahe-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--ahe-line);background:#1b2027}.ahe-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.ahe-reading .deck-head strong{font-size:.92rem}.ahe-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.ahe-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.ahe-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.ahe-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.ahe-reading .lead{margin:0 0 19px;font-size:1.08em;line-height:1.78}.ahe-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--ahe-blue) 38%,var(--ahe-line));background:color-mix(in srgb,var(--ahe-blue) 5%,#fff)}.ahe-reading .interest b{color:var(--ahe-blue);font:750 1.2rem/1 var(--mono)}.ahe-reading .interest span{color:var(--ahe-soft);font-size:.84rem}
.ahe-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--ahe-line)}.ahe-reading .metric{min-height:99px;padding:16px 12px;border-right:1px solid var(--ahe-line)}.ahe-reading .metric:last-child{border-right:0}.ahe-reading .metric strong{display:block;color:var(--ahe-blue);font:680 clamp(1.45rem,3vw,1.9rem)/1 var(--serif)}.ahe-reading .metric span{display:block;margin-top:9px;color:var(--ahe-soft);font:600 .78rem/1.45 var(--sans)}
.ahe-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--ahe-blue);background:color-mix(in srgb,var(--ahe-blue) 6%,var(--ahe-surface))}.ahe-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.ahe-reading .keypoints ul{margin:0;padding-left:1.2rem}.ahe-reading .keypoints li{margin:.42rem 0}.ahe-reading .keypoints strong{font-weight:760}
.ahe-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--ahe-green);background:var(--ahe-surface)}.ahe-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.ahe-reading .kicker{display:block;margin-bottom:6px;color:var(--ahe-green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.ahe-reading h2{margin-top:3.5rem}.ahe-reading h3{margin-top:2.1rem}.ahe-reading h4{margin-top:1.7rem}.ahe-reading strong{font-weight:750}.ahe-reading .table-scroll,.ahe-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.ahe-reading .table-scroll table{display:table;width:100%;min-width:650px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.ahe-reading th,.ahe-reading td{padding:9px 10px;border:1px solid var(--ahe-line);text-align:left;vertical-align:top}.ahe-reading th{background:color-mix(in srgb,var(--ahe-blue) 7%,var(--ahe-surface))}.ahe-reading td:first-child{font-weight:650}.ahe-reading .code-scroll pre{min-width:660px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--ahe-line);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.ahe-reading code{font-size:.92em}
.ahe-reading .figure{width:100%;margin:26px 0}.ahe-reading .figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--ahe-line);background:#fff}.ahe-reading .figure figcaption{max-width:700px;margin:8px auto 0;color:var(--ahe-soft);font-size:.82rem;line-height:1.55;text-align:left}
.ahe-reading .pillars{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--ahe-line)}.ahe-reading .pillar{padding:16px;background:#fff}.ahe-reading .pillar b{display:block;margin-bottom:6px;color:var(--ahe-blue);font:750 .84rem/1.3 var(--mono)}.ahe-reading .pillar span{display:block;color:var(--ahe-soft);font-size:.84rem;line-height:1.55}
.ahe-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--ahe-line);list-style:none}.ahe-reading .flow li{min-height:124px;padding:13px;background:var(--ahe-surface)}.ahe-reading .flow b{display:block;margin-bottom:7px;color:var(--ahe-blue);font:750 .77rem/1.3 var(--sans)}.ahe-reading .flow span{display:block;color:var(--ahe-soft);font-size:.8rem;line-height:1.5}
.ahe-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--ahe-line);background:color-mix(in srgb,var(--ahe-green) 4%,#fff)}.ahe-reading .case h4{margin:0 0 8px;font-size:1.12rem}.ahe-reading .case ol{padding-left:1.2rem}.ahe-reading .case li{margin:.58rem 0}.ahe-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--ahe-line)}.ahe-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.ahe-reading .verdict strong{display:block;margin-bottom:4px}.ahe-reading .verdict .pass strong{color:var(--ahe-green)}.ahe-reading .verdict .fail strong{color:var(--ahe-red)}
.ahe-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--ahe-orange);background:color-mix(in srgb,var(--ahe-orange) 6%,var(--ahe-surface))}.ahe-reading .note.blue{border-color:var(--ahe-blue);background:color-mix(in srgb,var(--ahe-blue) 6%,var(--ahe-surface))}.ahe-reading .note p{margin:.34em 0}.ahe-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--ahe-line);font:600 .95rem/1.6 var(--mono);overflow-x:auto}
.ahe-reading .bars{margin:22px 0}.ahe-reading .bar{display:grid;grid-template-columns:170px 1fr 64px;align-items:center;gap:10px;margin:10px 0;font-size:.85rem}.ahe-reading .track{height:16px;background:#e8eaed}.ahe-reading .fill{height:100%;background:var(--ahe-blue)}.ahe-reading .fill.orange{background:var(--ahe-orange)}.ahe-reading .fill.green{background:var(--ahe-green)}.ahe-reading .bar em{font-style:normal;font-variant-numeric:tabular-nums;text-align:right}
@media(max-width:760px){.ahe-reading .metrics{grid-template-columns:1fr 1fr}.ahe-reading .metric:nth-child(2){border-right:0}.ahe-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--ahe-line)}.ahe-reading .flow{grid-template-columns:1fr 1fr}.ahe-reading .pillars{grid-template-columns:1fr}.ahe-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.ahe-reading .bar{grid-template-columns:120px 1fr 52px}}
@media(max-width:460px){.ahe-reading .flow,.ahe-reading .verdict{grid-template-columns:1fr}.ahe-reading .part0,.ahe-reading .case{padding:17px 15px}.ahe-reading .deck-head,.ahe-reading .interest{align-items:flex-start;flex-direction:column}.ahe-reading .bar{grid-template-columns:100px 1fr 48px;font-size:.75rem}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,960px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="ahe-reading">

<p class="paper-meta">Jiahang Lin et al. · arXiv:2604.25850v4 · 2026-05-18</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2604.25850">论文主页</a>
  <a href="https://arxiv.org/pdf/2604.25850">论文 PDF</a>
  <a href="https://github.com/china-qijizhifeng/agentic-harness-engineering">官方代码</a>
</div>

<section class="deck-wrap" aria-label="Agentic Harness Engineering 交互图解">
  <div class="deck-head"><strong>14 页交互图解 · 从失败轨迹到可回滚的 harness 修改</strong><a href="/lib/decks/agentic-harness-engineering-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/agentic-harness-engineering-visual-guide.html" title="Agentic Harness Engineering 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">这篇论文把 coding agent 的 harness 当成一个可以自动维护的软件系统：模型本身保持不变，Evolve Agent 根据真实任务轨迹修改 prompt、tool、middleware 和 memory，再用下一轮任务的 pass/fail 变化检验修改是否有效。它最有价值的地方不是 77.0% 这个单点成绩，而是把“为什么改、改了什么、预期修谁、实际修到谁”串成了一条可以审计的链。</p>

<div class="interest"><b>作者兴趣度 10 / 10</b><span>和 Claude Code、Codex 一类完整 harness 的研究方向高度相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>69.7 → 77.0</strong><span>Terminal-Bench 2 pass@1</span></div>
  <div class="metric"><strong>75.2 → 75.6</strong><span>SWE-bench Verified，冻结 harness</span></div>
  <div class="metric"><strong>526k → 461k</strong><span>SWE-bench 每条 completed trial 的 tokens</span></div>
  <div class="metric"><strong>11.8 / 11.1%</strong><span>regression prediction precision / recall</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>AHE 优化的是模型外部执行系统。</strong>同一个 GPT-5.4 high，从 bash-only NexAU₀ 出发，十轮后 pass@1 从 69.7% 到 77.0%。</li>
    <li><strong>收益主要在 tool、middleware 和 long-term memory，不在 system prompt。</strong>把 evolved prompt 单独装回 seed，成绩反而从 69.7% 降到 67.4%。</li>
    <li><strong>它能发现“已做对又被自己毁掉”的长链路错误。</strong><code>path-tracing</code> 已经生成正确图片，最后一次 cleanup 把交付物删了；publish-state guard 把 0/2 改成 2/2。</li>
    <li><strong>自我归因只对 fix 有一定信号，对 regression 几乎失明。</strong>fix precision / recall 为 33.7% / 51.4%，regression 只有 11.8% / 11.1%。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 这里的 harness 到底包括什么？

Coding agent 并不只是一个语言模型。模型产生下一步意图，harness 决定它能看到哪些上下文、能调用哪些工具、工具如何执行、长输出怎样截断、何时压缩上下文、怎样记住经验、哪些动作会被拦下。Claude Code、Codex CLI、OpenCode 都属于完整 harness 的例子。

论文把可编辑面拆成七类文件：system prompt、tool description、tool implementation、middleware、skill、sub-agent configuration 和 long-term memory。这里的 middleware 指执行循环中的 hook，例如在一次 shell command 之后检查错误模式，或在下一次模型调用之前插入提醒。这样解释后，后文的“component-level edit”就不是抽象概念，而是对某个明确文件和运行时行为的修改。
</aside>

## Q1. 为什么需要自动做 harness engineering？

**同一个 base model 换一套 harness，完成率会明显变化；问题是目前这种优化主要靠人手看轨迹、找模式、改代码。** 模型发布节奏越来越快，旧 harness 还可能和新模型不匹配。把所有经验继续堆进 system prompt，也解决不了执行时拦截、跨步骤状态和工具语义这些问题。

AHE 把难点分成三类。第一，修改面异构：一句 prompt、一个 tool schema、一段 middleware Python 和一条 memory 规则不是同一种动作。第二，证据过长：一次 Terminal-Bench rollout 可以跨很多轮工具调用，真正有用的失败点埋在数百万 tokens 里。第三，因果难归属：成绩变了，并不能自动说明是哪一项 edit 起作用，也不能说明它破坏了哪些原本能过的任务。

<figure class="figure">
  <img src="/lib/papers/agentic-harness-engineering/figure-1-training-curve.png" alt="AHE 在 Terminal-Bench 2 上十轮演化曲线">
  <figcaption>论文 Figure 1，作者官方仓库版本。深色线是每轮 pass@1，浅色阶梯线是 best-so-far。四个峰值分别对应 contract-first workflow、publish-state guard、cross-step risk monitor 和 post-success hard block。官方仓库 MIT License。</figcaption>
</figure>

论文的核心判断是：如果 optimizer 能看到清楚的修改面、压缩过且可回钻的执行证据，并且每次修改都带可检验的预测，那么完整 harness 可以进入自动优化闭环。这里的“自动”不是无限制地让 Agent 改自己；verifier、model config、tracer、runs 目录都只读，Agent 只能修改 workspace 中的 harness 文件。

## Q2. 它和 prompt evolution、agent workflow search 有什么区别？

**AHE 的边界在于“完整 harness + 真实执行证据 + 文件级回滚”。** 相关工作里，Reflexion 一类方法改写下一次回答，ACE 把成功经验压成 in-context playbook，TF-GRPO 强化成功 tool sequence，DSPy 优化多阶段程序里的 instructions 与 demonstrations，AFlow 和 ADAS 则搜索 workflow 或 agent program。它们各自有效，但多数只开放一个表面给 optimizer。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>可修改对象</th><th>主要反馈</th><th>和 AHE 的差别</th></tr></thead>
  <tbody>
    <tr><td>人工 harness engineering</td><td>prompt、tools、hooks、memory 等</td><td>开发者读 log 与 benchmark</td><td>修改面完整，但依赖人工诊断和维护</td></tr>
    <tr><td>ACE / Expel / Reflexion</td><td>playbook、instruction 或 episodic memory</td><td>成功轨迹与文字反思</td><td>经验主要回到上下文，没有直接修改执行层</td></tr>
    <tr><td>TF-GRPO</td><td>prompt 中的 trajectory feedback</td><td>group-relative 成功序列</td><td>不打开 tool implementation 与 middleware</td></tr>
    <tr><td>AFlow / ADAS</td><td>workflow graph 或 agent program</td><td>rollout score</td><td>侧重程序结构搜索，不以 file-level harness component 为归因单位</td></tr>
    <tr><td><strong>AHE</strong></td><td><strong>七类 harness component</strong></td><td><strong>layered traces + next-round task flips</strong></td><td><strong>每个 edit 有 manifest、Git commit 和 rollback 粒度</strong></td></tr>
  </tbody>
</table>
</div>

论文也直接比较了三种自演化设置。ACE、TF-GRPO 和 AHE 都从同一个 bash-only NexAU₀ 出发，base model 都是 GPT-5.4 high。ACE 得到 68.9%，TF-GRPO 为 72.3%，AHE 为 77.0%。作者的解释是 layer mismatch：前两者能改自然语言经验，AHE 还能把规律落实到 tool 和 middleware。这个解释得到组件消融支持，但实验没有把所有相关方法在多次独立 evolution run 下重做，因此还不能把差距完全归因于“修改面更完整”。

## Q3. AHE 的闭环具体怎样运行？

### 3.1 三层 observability 各自产生什么 artifact？

<div class="pillars">
  <div class="pillar"><b>COMPONENT</b><span>七类组件固定为文件；每个逻辑修改一个 Git commit。目标是让 action space 可见、可写、可回滚。</span></div>
  <div class="pillar"><b>EXPERIENCE</b><span>Agent Debugger 把 raw traces 转成 benchmark overview 和 per-task reports，同时保留原始轨迹供回钻。</span></div>
  <div class="pillar"><b>DECISION</b><span>change manifest 记录 failure evidence、root cause、targeted fix、predicted fixes、risk tasks 与 constraint level。</span></div>
</div>

<figure class="figure">
  <img src="/lib/papers/agentic-harness-engineering/figure-2-method.png" alt="AHE 三层 observability 闭环">
  <figcaption>论文 Figure 2，作者官方仓库版本。左侧是 NexAU harness 的可编辑组件，中间是执行环境和 raw trace，右侧是 Agent Debugger 与 Evolve Agent。官方仓库 MIT License。</figcaption>
</figure>

Experience observability 的关键是 progressive disclosure。Evolve Agent 先读跨任务的 <code>analysis/overview.md</code>，再按需打开 <code>analysis/detail/{task}.md</code>；只有报告证据不够时才回到 <code>nexau_in_memory_tracer.cleaned.json</code>。论文称原始轨迹约 10M tokens，压缩后的入口约 10K tokens。Agent Debugger 本身仍由模型完成，公开仓库也注明其核心只部分开源，所以这里的“证据蒸馏”并不是一个完全可复现的确定性程序。

### 3.2 一轮不是“改完再看总分”，而是先结算上一轮

<ol class="flow">
  <li><b>1 · ROLLOUT</b><span>当前 harness 每题执行 k 次。</span></li>
  <li><b>2 · CLEAN</b><span>轨迹转成统一文件结构。</span></li>
  <li><b>3 · ATTRIBUTE</b><span>用 task-level flip 结算上一轮 manifest。</span></li>
  <li><b>4 · DISTILL</b><span>Debugger 生成分层证据。</span></li>
  <li><b>5 · EVOLVE</b><span>修改 workspace 并写新 manifest。</span></li>
  <li><b>6 · COMMIT</b><span>Git 记录，更新 best-so-far。</span></li>
</ol>

论文主实验每题 <code>k = 2</code>。这很重要，因为同一题一条过、一条不过时，可以对照两个 rollout 的分歧点，而不是只看到总分。每轮会把上一轮的 <code>predicted_fixes</code>、<code>risk_tasks</code> 和实际 fail→pass、pass→fail 集合求交，给出 <code>EFFECTIVE</code>、<code>PARTIALLY_EFFECTIVE</code>、<code>MIXED</code>、<code>INEFFECTIVE</code> 或 <code>HARMFUL</code>。

### 3.3 官方代码里的 publish-state guard 是怎样拦命令的？

下面是我根据官方仓库 revision <code>8b2a55d</code> 的 <code>experiments/evolved_harness/tools/shell_tools/run_shell_command.py</code> 压缩的等价片段。它不是 benchmark checker，而是 AHE 最终学出的 shell tool 行为。

<div class="code-scroll">
<pre><code># 根据官方实现压缩；Python 3.13 / NexAU runtime&#10;def maybe_block(command, description, guard):&#10;    override = "ALLOW_POST_SUCCESS_RESET" in (command + (description or ""))&#10;    reasons, hard_reasons = [], []&#10;&#10;    for path in guard["files"]:&#10;        if destructive_rm(command, path):&#10;            reasons.append(f"delete protected output {path}")&#10;            if not path.startswith("/tmp/"):&#10;                hard_reasons.append(reasons[-1])&#10;        if writes_or_reruns(command, path):&#10;            reasons.append(f"rewrite or rerun protected file {path}")&#10;            hard_reasons.append(reasons[-1])&#10;&#10;    if hard_reasons or (reasons and not override):&#10;        return {"exit_code": 90, "type": "POST_SUCCESS_STATE_GUARD"}&#10;    return None</code></pre>
</div>

Guard 什么时候开始保护？一次带有 <code>final</code>、<code>evaluator-style</code> 或 <code>acceptance</code> 描述的命令成功后，tool 从命令中提取明确出现的文件、script entrypoint、Git root、web root 和当前工作目录，写入 per-agent state。后续删除、重写、重跑或破坏 Git metadata 的命令会在 shell 真正执行之前被阻止。第 5 轮的 override token 仍能放行部分动作；第 8 轮把非 <code>/tmp</code> 交付物删除和 live root reset 升级成 hard block，override 也不能绕过。

## Q4. 实验、真实 case 和 judge 到底说明了什么？

### 4.1 评测对象、可见输入与计分

主优化集是 Terminal-Bench 2 的 89 个 task，其中 Easy 4、Medium 55、Hard 30。Harbor 把每个 rollout 放进 fresh E2B sandbox，最长 3600 秒；模型能看到 task brief、workspace 与工具输出，不能修改 verifier、tracer、dispatcher 或 LLM config。Verifier 是任务自带的可执行检查。timeout、sandbox crash 和 API timeout 都按失败计入 pass@1，而 token mean 会排除这些未完整结束的 trial。

<div class="formula">pass@1 = (1 / k|D|) · Σᵢ Σⱼ rᵢⱼ，rᵢⱼ ∈ {0, 1}</div>

主实验只有一条十轮 evolution campaign，大约 32 小时。Code Agent、Agent Debugger 和 Evolve Agent 都用 GPT-5.4；Code Agent 是 high reasoning，Evolve Agent 是 xhigh。每个 task 两次 rollout，并行度 96。这里没有人工标注新的 benchmark：任务和 verifier 来自 Terminal-Bench 2，AHE 产生的是轨迹分析和 harness edit。

我也核查了论文仓库引用的 <code>harbor-datasets</code>。截至 revision <code>37db1088</code>，公开目录里没有 Terminal-Bench 2 task pack；AHE 仓库本身也没有打包这四个 task 的 verifier。因此下文的 task brief、隐藏检查和逐步结果来自论文 Appendix C，不能当作我从公开 checker 源码独立复核后的结论。可以独立复核的是 AHE 的 orchestration、change attribution，以及最终 evolved shell tool 和 middleware。

<div class="table-scroll">
<table>
  <thead><tr><th>Harness / loop</th><th>All</th><th>Easy</th><th>Medium</th><th>Hard</th></tr></thead>
  <tbody>
    <tr><td>OpenCode</td><td>47.2</td><td>75.0</td><td>52.7</td><td>33.3</td></tr>
    <tr><td>Terminus-2</td><td>62.9</td><td>75.0</td><td>74.5</td><td>40.0</td></tr>
    <tr><td>Codex</td><td>71.9</td><td>75.0</td><td>80.0</td><td><strong>56.7</strong></td></tr>
    <tr><td>NexAU₀</td><td>69.7</td><td>87.5</td><td>78.2</td><td>51.7</td></tr>
    <tr><td>ACE</td><td>68.9</td><td>91.7</td><td>78.2</td><td>48.9</td></tr>
    <tr><td>TF-GRPO</td><td>72.3</td><td><strong>100.0</strong></td><td>79.4</td><td>55.6</td></tr>
    <tr><td><strong>AHE</strong></td><td><strong>77.0</strong></td><td><strong>100.0</strong></td><td><strong>88.2</strong></td><td>53.3</td></tr>
  </tbody>
</table>
</div>

结论要分层看。AHE 的总分最高，主要来自 55 个 Medium tasks；Hard 上 53.3% 仍低于 Codex 的 56.7% 和 TF-GRPO 的 55.6%。优化目标按 89 题平均，Medium 数量占优势，所以 Evolve Agent 有动机接受对 Medium 有利、对 Hard 略有代价的组合。

### 4.2 Case 1：正确图片为什么还会 FAIL？

<div class="case">
  <h4><code>path-tracing</code>：生成成功，cleanup 删除交付物</h4>
  <ol>
    <li>Terminal-Bench 2 task 要求 Agent 写出 <code>/app/reconstructed.ppm</code>。Verifier 只读取这个文件，和 reference image 做逐像素比较。</li>
    <li>第 4 轮两个 rollout 都已经 render 出正确图片，并完成了自己的结构检查。</li>
    <li>Agent 最后执行类似 <code>rm -rf /app/image /app/reconstructed.ppm /app/scratch</code> 的 cleanup，然后把命令 exit code 0 当成可以提交的依据。</li>
    <li>Verifier 执行时，唯一交付物已经不存在，因此两条都失败，得分 0/2。</li>
    <li>第 5 轮的 prompt rule 说明“通过 acceptance 后的状态就是 publish state”；shell tool 同时记录 protected output，并在后续删除命令执行前返回 block。</li>
  </ol>
  <div class="verdict"><div class="fail"><strong>原始 FAIL</strong>正确文件曾经存在，但 verifier 运行时已经被删。</div><div class="pass"><strong>修复后 PASS</strong>cleanup 被 tool 拦下，Agent 保留文件并结束，下一轮 2/2。</div></div>
</div>

这个例子说明 prompt 和 execution guard 的差别。论文明确写到，seed prompt 已经提醒不要破坏 verified state，但模型仍会执行 cleanup；直到 tool implementation 把删除动作变成不可执行，错误才稳定消失。

### 4.3 Case 2：为什么“两个数字文件都在”仍然 FAIL？

<div class="case">
  <h4><code>mcmc-sampling-stan</code>：proxy answer 代替真实 pipeline</h4>
  <ol>
    <li>Task 要求安装 rstan 2.32.7，用 30 条观测拟合 hierarchical beta-binomial model，并写出 posterior mean。</li>
    <li>Verifier 会自己安装 package，再从头运行 Agent 提交的 <code>analysis.R</code>。最终要求 alpha ∈ [2.84, 2.91]，beta ∈ [16.1, 16.7]。</li>
    <li>失败 rollout 用独立 grid integration 算出看似合理的 2.876 / 16.375，把它们先写进文件；真正的 MCMC 放到后台后，约 3 分钟就被 kill，理由是“保留已经写好的 deliverables”。</li>
    <li>Agent 的最终检查只确认两个文件存在且内容能 parse。Verifier 重跑未收敛的 <code>analysis.R</code>，得到约 1.28e19 / 2.60e17，2/6 tests fail。</li>
    <li>第 6 轮的 middleware 识别 inline proxy 与 shallow validation；publish-state guard 同时把 <code>analysis.R</code> 作为 protected entrypoint。修复后的 rollout 跑完 <code>iter=100000</code>，又在 <code>/tmp</code> 独立复跑，约 2.872 / 16.43，6/6 tests pass。</li>
  </ol>
</div>

这里的 judge 不是“看文件有没有”，而是复现官方计算流程并检查数值区间。AHE 的作用也不是泄漏隐藏答案，而是逼 Agent 走完 task brief 明确要求的 pipeline，并用独立执行交叉验证。

<figure class="figure">
  <img src="/lib/papers/agentic-harness-engineering/figure-5-case-study.png" alt="AHE 的 middleware、prompt 与 tool 修改实例">
  <figcaption>论文 Figure 5，作者官方仓库版本。三个真实 edit 分别落在 middleware、prompt 和 tool 层。官方仓库 MIT License。</figcaption>
</figure>

### 4.4 Transfer、消融和负结果

SWE-bench Verified 使用完整 500 题、七个 repository，AHE harness 不做 in-domain re-evolution。Aggregate success 从 NexAU₀ 的 75.2% 到 75.6%，只高 0.4 pp；tokens/trial 从 526k 降到 461k，少约 12%。收益主要集中在 django 与 sphinx-doc，scikit-learn、pydata、astropy 三个较小 repo 都退化。因而这张表更强的证据是效率迁移，不是大幅准确率迁移。

<div class="table-scroll">
<table>
  <thead><tr><th>Setting</th><th>SWE-bench Verified</th><th>Tokens / completed trial</th><th>Succ / Mtok</th></tr></thead>
  <tbody>
    <tr><td>ACE</td><td>74.6%</td><td>679k</td><td>1.10</td></tr>
    <tr><td>TF-GRPO</td><td>74.2%</td><td>582k</td><td>1.27</td></tr>
    <tr><td>NexAU₀</td><td>75.2%</td><td>526k</td><td>1.43</td></tr>
    <tr><td><strong>AHE</strong></td><td><strong>75.6%</strong></td><td><strong>461k</strong></td><td><strong>1.64</strong></td></tr>
  </tbody>
</table>
</div>

<figure class="figure">
  <img src="/lib/papers/agentic-harness-engineering/figure-3-transfer.png" alt="AHE 跨模型迁移结果">
  <figcaption>论文 Figure 3，作者官方仓库版本。冻结 AHE harness 在五个额外 operating point 上均高于各自 seed，增益从 +2.3 到 +10.1 pp。官方仓库 MIT License。</figcaption>
</figure>

组件消融更值得注意：memory only 75.3%、tool only 73.0%、middleware only 71.9%，都高于 69.7% seed；system prompt only 为 67.4%。三个正向组件的增益相加是 +11.1 pp，高于 full AHE 的 +7.3 pp。作者在轨迹中看到几层组件都在反复做 closure verification，叠加后会耗掉 Hard task 的 turn budget。完整 harness 的组件不是可独立相加的积木。

最后看 self-attribution。跨九个可比较 round，fix prediction 的 precision / recall 是 33.7% / 51.4%，约为随机基线的五倍；regression prediction 是 11.8% / 11.1%，只比随机基线高约一倍。附录进一步报告累计 43 个 regression predictions 只有 5 个命中，同时有 40 个实际 regression 没被预见。AHE 会记录因果假设，但它对副作用的判断仍然很弱。

## Q5. 对 Claude Code、Codex 这类 harness 研究有什么启发？

**最直接的启发是把 harness 设计成可以实验和结算的组件系统。** 如果所有逻辑都写进一段大 prompt，optimizer 很难知道某条规则是没有被读到、没有被执行，还是和另一个规则冲突。把“建议”升级成 middleware 或 tool guard，也应当有明确条件：必须先从跨任务轨迹里看到重复 failure pattern，并验证 prompt-level fix 不够稳定。

对完整 coding harness，我会优先复用下面四个研究设计：

1. 每个组件固定路径、明确 schema，并让一个 logical edit 对应一个 commit。
2. 同题至少两个 rollout，专门比较 partial-pass 的 divergence point。
3. 让 optimizer 在修改前写 predicted fixes 与 risk tasks，下一轮按 task-level delta 结算。
4. 把 soft instruction、runtime reminder 和 hard block 当成三个不同强度的控制层，按错误的可逆性和风险选择。

论文还暴露出一个很有研究价值的问题：怎样让 optimizer 预测 cross-component interference。AHE 的 manifest 以单个 edit 为中心，但实际执行中 prompt、memory、middleware 可能同时推动同一种行为，导致重复检查。更完整的后续实验可以把 edit 组合当作因果单元，加入 factorial 或 bandit-style 的组合消融，并为 Easy、Medium、Hard 分别设预算约束，而不是只优化一个由 55 个 Medium tasks 主导的 aggregate。

## Q6. 这篇论文的证据边界和最终判断是什么？

**AHE 已经证明完整 harness 可以进入自动优化闭环，但还没有证明这个闭环稳定、低成本、可跨场景长期自治。** 下面几个边界会直接影响复现和研究设计：

- 主结果来自一条十轮 campaign，没有多 seed 的均值和方差。每轮又只有每题两次 rollout，单 task flip 的噪声仍然大。
- 三个角色都使用 GPT-5.4，且 Evolve Agent 是 xhigh reasoning。论文保持 base model 不变，隔离了 harness edit 的作用；它没有证明较弱 optimizer 也能完成同样的诊断。
- Agent Debugger 的核心只部分开源。公开仓库能看到 loop、prompt、evolved harness 与 attribution code，但不能完全复现“10M tokens 如何压成 10K tokens 证据”的所有细节。
- SWE-bench Verified 的 aggregate accuracy 只高 seed 0.4 pp，且三个小 repo 下降；跨 benchmark 结果应主要理解为 token efficiency 和部分 repository 上的迁移。
- operating point 在 GPT-5.4 high 上调过。medium、high、xhigh 的增益不是单调的，xhigh 可能因为更慢而越过 task timeout。
- self-modification 的安全边界仍是研究原型：workspace 限权、Git rollback 和 verifier 只读能防一批明显捷径，但不能替代完整的 misuse prevention 与长期 cleanup governance。

我的结论是：**如果要研究 Claude Code、Codex 这一类完整 harness，这篇值得优先精读和复现。** 它既给了可以直接实现的工程对象，也公开了很具体的失败轨迹；更重要的是，论文没有把 self-evolution 包装成一路单调上升，反而把 component interference 和 regression blindness 摆到了台面上。作者兴趣度因此是 10/10。

</div>

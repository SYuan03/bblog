---
title: "[2026-04-28] Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses"
permalink: "/posts/论文解读/agentic-harness-engineering.html"
date: "2026-09-28T21:30:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/generated-covers/049-agentic-harness-engineering.webp"
description: "固定模型，自动读取失败记录，修改提示、工具代码、运行时检查和经验文件，再用下一轮测试验收。本文沿着误删图片、未完成采样两条实际失败记录，解释修改流程、计分和组件冲突。"
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

<p class="lead">同一个模型，工具怎么执行、什么时候检查结果、怎样保存经验，都会影响任务能否完成。AHE 固定 GPT-5.4，让另一个负责维护的模型读取真实执行记录，修改这些执行程序，再重跑任务。每次修改记录“预计修好哪些题、可能破坏哪些题”；下一轮对照实际通过与失败的变化，检查这次判断准不准。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读前需要的背景</span>

### 提示之外，哪些代码也会影响模型做事？

模型输出回答或命令，外面的执行程序负责构造上下文、运行工具、截断长输出、保存经验和阻止危险动作。论文把这套程序称为 harness；Claude Code、Codex CLI、OpenCode 都有这样的执行层。一次从任务输入到最终提交的完整尝试称为 rollout，它包含模型回答、工具结果和环境变化。

论文允许维护模型编辑七类文件：系统提示、工具说明、工具实现、middleware、技能文件、子 Agent 配置和长期经验。Middleware 是执行中自动触发的检查代码，例如在命令结束后识别错误，或在下一次模型调用前插入提醒。负责修改这些文件的角色称为 Evolve Agent；执行任务的 Code Agent 和分析记录的 Agent Debugger 则有各自独立的调用与上下文。
</aside>

<div class="interest"><b>作者兴趣度 10 / 10</b><span>和 Claude Code、Codex 一类完整 harness 的研究方向高度相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>69.7 → 77.0</strong><span>Terminal-Bench 2 pass@1</span></div>
  <div class="metric"><strong>75.2 → 75.6</strong><span>SWE-bench Verified，冻结 harness</span></div>
  <div class="metric"><strong>526k → 461k</strong><span>SWE-bench 每次完整结束尝试的 token</span></div>
  <div class="metric"><strong>11.8 / 11.1%</strong><span>预测“原本通过的题会失败”的精确率 / 召回率</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>AHE 优化的是模型外部执行系统。</strong>同一个 GPT-5.4 high，从 bash-only NexAU₀ 出发，十轮后 pass@1 从 69.7% 到 77.0%。</li>
    <li><strong>收益主要来自工具、调用处理和长期记忆，而不是系统提示。</strong>只将新提示装回初始程序，成绩反而从 69.7% 降到 67.4%。</li>
    <li><strong>它能发现“已做对又被自己毁掉”的长链路错误。</strong><code>path-tracing</code> 已经生成正确图片，最后的清理把交付物删了；交付状态保护代码把 0/2 改成 2/2。</li>
    <li>维护模型预测“原本失败的题会通过”的精确率 / 召回率为 33.7% / 51.4%；预测相反的退步只有 11.8% / 11.1%。<strong>它更难预见修改的副作用。</strong></li>
  </ul>
</aside>


<h2 id="为什么修改执行程序需要任务级证据？">1. Motivation：为什么修改执行程序需要任务级证据？</h2>

**同一个基础模型换一套 harness，完成率会明显变化；问题是目前这种优化主要靠人手看轨迹、找模式、改代码。** 模型发布节奏越来越快，旧 harness 还可能和新模型不匹配。把所有经验继续堆进系统提示，也解决不了执行时拦截、跨步骤状态和工具语义这些问题。

AHE 把难点分成三类。第一，可修改对象不同：提示文字、工具参数格式、Python 处理代码和记忆规则，不能用同一种方法修改。第二，证据过长：一次 Terminal-Bench rollout 可以跨很多轮工具调用，真正有用的失败点埋在数百万 tokens 里。第三，因果难归属：成绩变了，并不能自动说明是哪项修改起作用，也不能说明它破坏了哪些原本能过的任务。

<figure class="figure">
  <a href="/lib/papers/agentic-harness-engineering/figure-1-training-curve.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/agentic-harness-engineering/figure-1-training-curve.png" alt="AHE 在 Terminal-Bench 2 上十轮演化曲线" width="1390" height="672"></a>
  <figcaption>论文 Figure 1，作者官方仓库版本。深色实线阶梯是截至当前轮的最高分，浅色虚线是各轮实际 pass@1。四次刷新最高分分别对应明确验收流程、保护交付状态、跨步骤风险监测和成功后禁止破坏成果。官方仓库 MIT License。</figcaption>
</figure>

论文的判断是：维护模型需要看清可修改文件、压缩后仍能回查的执行证据，以及每次修改对应的可检验预测。具备这三项条件后，系统才能反复修改 harness，并用下一轮结果结算。验收程序、模型配置、记录器和运行记录目录始终只读；维护模型只能修改工作区内的执行程序。

<h2 id="从提示优化到完整执行层修改">2. Related Work：从提示优化到完整执行层修改</h2>

**AHE 的边界在于“完整 harness + 真实执行证据 + 文件级回滚”。** 相关工作里，Reflexion 一类方法改写下一次回答，ACE 将成功经验写成上下文手册，TF-GRPO 强化成功工具序列，DSPy 优化多阶段程序的指令与示例，AFlow 和 ADAS 搜索工作流或 Agent 程序。各方法开放的修改对象不同。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>可修改对象</th><th>主要反馈</th><th>和 AHE 的差别</th></tr></thead>
  <tbody>
    <tr><td>人工 harness engineering</td><td>提示、工具、调用处理与记忆</td><td>开发者读日志与评测结果</td><td>修改面完整，但依赖人工诊断和维护</td></tr>
    <tr><td>ACE / Expel / Reflexion</td><td>手册、指令或历史经验</td><td>成功轨迹与文字反思</td><td>经验主要回到上下文，没有直接修改执行层</td></tr>
    <tr><td>TF-GRPO</td><td>提示中的执行反馈</td><td>同组比较成功序列</td><td>不修改工具实现与调用处理</td></tr>
    <tr><td>AFlow / ADAS</td><td>工作流图或 Agent 程序</td><td>执行得分</td><td>侧重结构搜索，不逐个文件记录组件修改效果</td></tr>
    <tr><td><strong>AHE</strong></td><td><strong>七类执行程序组件</strong></td><td><strong>分层执行记录与下一轮通过／失败变化</strong></td><td><strong>每项修改记录清单、Git 提交和可回滚的文件范围</strong></td></tr>
  </tbody>
</table>
</div>

论文也直接比较了三种自演化设置。ACE、TF-GRPO 和 AHE 都从同一个 bash-only NexAU₀ 出发，base model 都是 GPT-5.4 high。ACE 得到 68.9%，TF-GRPO 为 72.3%，AHE 为 77.0%。作者解释为修改层次不同：前两者修改自然语言经验，AHE 还能改工具实现和执行时处理代码。这个解释得到组件消融支持，但实验没有把所有相关方法在多次独立演化实验下重做，因此还不能把差距完全归因于“修改面更完整”。

<h2 id="一轮修改：执行、诊断、预测与复测">3. Method：一轮修改：执行、诊断、预测与复测</h2>

**每轮先重跑任务、核对上一轮预测，再提出下一轮修改。**

<h3 id="3-1-让维护模型看到文件、执行记录和修改理由">3.1 让维护模型看到文件、执行记录和修改理由</h3>

论文把所需证据分为三层：可编辑文件告诉模型“能改哪里”，分层执行记录告诉它“哪里失败”，修改清单让下一轮能检查“预期效果是否出现”。这三层合称 observability，在这里就是能追查修改对象、错误过程和判断依据。

<div class="pillars">
  <div class="pillar"><b>可修改文件</b><span>七类组件固定为文件；每个逻辑修改一个 Git commit。目标是明确哪些文件可改，并能逐项撤销。</span></div>
  <div class="pillar"><b>执行记录</b><span>Agent Debugger 把原始执行记录整理为任务总览和逐题报告，同时保留原始轨迹供查阅。</span></div>
  <div class="pillar"><b>修改预测</b><span>修改清单记录失败证据、原因、要修什么、预计修好的题、风险题和限制层次。</span></div>
</div>

<figure class="figure">
  <a href="/lib/papers/agentic-harness-engineering/figure-2-method.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/agentic-harness-engineering/figure-2-method.png" alt="AHE 三层 observability 闭环" width="1267" height="809"></a>
  <figcaption>论文 Figure 2，作者官方仓库版本。左侧是 NexAU harness 的可编辑组件，中间是执行环境和原始执行记录，右侧是 Agent Debugger 与 Evolve Agent。官方仓库 MIT License。</figcaption>
</figure>

Agent Debugger 先把执行记录整理成总览和逐题报告。Evolve Agent 先读 <code>analysis/overview.md</code>，再按需打开 <code>analysis/detail/{task}.md</code>；报告不够时回查原始轨迹 <code>nexau_in_memory_tracer.cleaned.json</code>。论文称这种 progressive disclosure（先总览、再局部、最后原始记录）的入口约 10K tokens，原始记录约 10M。Debugger 也由模型完成，核心只部分开源，不能把这一步当成完全可复现的固定压缩算法。

<h3 id="3-2-修改清单怎样接受下一轮结果检验">3.2 修改清单怎样接受下一轮结果检验</h3>

<ol class="flow">
  <li><b>1 · 执行任务</b><span>当前 harness 每题执行 k 次。</span></li>
  <li><b>2 · 整理记录</b><span>轨迹转成统一文件结构。</span></li>
  <li><b>3 · 核对旧预测</b><span>用各题通过 / 失败的变化核对上一轮修改清单。</span></li>
  <li><b>4 · 生成报告</b><span>Debugger 生成分层证据。</span></li>
  <li><b>5 · 修改组件</b><span>修改工作区内组件，写新清单。</span></li>
  <li><b>6 · 保存新修改</b><span>每项修改独立提交，等下一轮执行后验收。</span></li>
</ol>

论文主实验每题 <code>k = 2</code>。这很重要，因为同一题一条过、一条不过时，可以对照两个 rollout 的分歧点，而不是只看到总分。每轮会把上一轮的 <code>predicted_fixes</code>（预计修好的任务）、<code>risk_tasks</code>（预计会退步的任务）与实际失败变通过、通过变失败的集合比较。这些预测写在 change manifest，也就是随修改保存的清单里。程序再标为 <code>EFFECTIVE</code>、<code>PARTIALLY_EFFECTIVE</code>、<code>MIXED</code>、<code>INEFFECTIVE</code> 或 <code>HARMFUL</code>；它们表示预测和实际结果的对应情况，不能消除同题两次采样带来的波动。

固定版本 <code>8b2a55d</code> 的执行顺序还需要说明两点。<code>evolve.py</code> 在收到当前版本的成绩后，先核对旧预测、更新已评测的最佳版本，再让维护模型写新修改。<strong>新文件还没有分数，要等下一轮执行；不能把当前成绩记给刚写出的修改。</strong> 论文 Algorithm 1 在这一点上混用了版本下标，本文按代码中的输入快照与评测顺序解释。

其次，<code>evaluate_changes</code> 只把清单声明的修复题和风险题用于单项判定。例如预计修好的题全部转为成功、声明的风险题没有退步，就标为 <code>EFFECTIVE</code>；没有被声明的退步另列报告。因此这个标签不代表“没有任何副作用”。代码生成核对报告后，由 Evolve Agent 决定撤销或重做哪些文件，不是程序一看到无效标签就自动撤销全部修改。

<h3 id="3-3-通过检查后，怎样阻止模型又删掉成果？">3.3 通过检查后，怎样阻止模型又删掉成果？</h3>

下面是我根据官方仓库 revision <code>8b2a55d</code> 的 <code>experiments/evolved_harness/tools/shell_tools/run_shell_command.py</code> 压缩的等价片段。它不是任务验收程序，而是 AHE 最终演化出的终端工具行为。

<div class="code-scroll">
<pre><code># 根据官方实现压缩；Python 3.13 / NexAU runtime&#10;def maybe_block(command, description, guard):&#10;    override = "ALLOW_POST_SUCCESS_RESET" in (command + (description or ""))&#10;    reasons, hard_reasons = [], []&#10;&#10;    for path in guard["files"]:&#10;        if destructive_rm(command, path):&#10;            reasons.append(f"delete protected output {path}")&#10;            if not path.startswith("/tmp/"):&#10;                hard_reasons.append(reasons[-1])&#10;        if writes_or_reruns(command, path):&#10;            reasons.append(f"rewrite or rerun protected file {path}")&#10;            hard_reasons.append(reasons[-1])&#10;&#10;    if hard_reasons or (reasons and not override):&#10;        return {"exit_code": 90, "type": "POST_SUCCESS_STATE_GUARD"}&#10;    return None</code></pre>
</div>

一次标为 <code>final</code>、<code>evaluator-style</code> 或 <code>acceptance</code> 的检查命令成功后，工具记录命令明确涉及的输出文件、待重跑脚本和项目目录。后续命令若准备删除或重写这些对象，shell 执行前就返回拦截结果。论文称它为 publish-state guard，具体是“保护已通过检查的交付状态”。第 5 轮还允许用授权标记放行部分动作；第 8 轮把删除非 <code>/tmp</code> 交付物和重置正在使用的项目目录改为不可绕过的拦截。

<h2 id="从两条失败记录理解评分与修改效果">4. Experiments：从两条失败记录理解评分与修改效果</h2>

**是否通过由任务自带的 verifier 决定，维护模型的自测不能代替最终验收。** 主结果和两条真实案例都沿用 Terminal-Bench 2 的任务与评分器。

<h3 id="4-1-评测对象、可见输入与计分">4.1 评测对象、可见输入与计分</h3>

主优化集是 Terminal-Bench 2 的 89 道题，其中 Easy 4、Medium 55、Hard 30。<strong>这 89 题全部用于驱动十轮修改，也用于挑选最高分版本；77.0% 不是在另留的测试集上得到的成绩。</strong> 独立任务集上的迁移证据来自后面的 SWE-bench Verified。Harbor 把每个 rollout 放进新建 E2B 隔离环境，最长 3600 秒；模型能看到任务说明、工作区与工具输出，不能修改验收、记录器、调度器或模型配置。任务验收是可执行检查；超时、隔离环境崩溃与 API 超时都计为失败，而平均 token 不含这些未完整结束的尝试。

<div class="formula">pass@1 = (1 / k|D|) · Σᵢ Σⱼ rᵢⱼ，rᵢⱼ ∈ {0, 1}</div>

公式中的 <code>|D|=89</code> 是任务数，<code>k=2</code> 是每题尝试数，<code>rᵢⱼ</code> 是某次尝试是否通过全部任务检查。分母因此为 <code>89×2=178</code>；某题两次全失败贡献 0/178，两次都成功贡献 2/178，一次成功贡献 1/178。这是所有尝试的平均成功率，不是“两次中成功一次就算解出该题”。

主实验只有一次十轮演化实验，大约 32 小时。三个角色都用 GPT-5.4，每题两次尝试，并行度 96。推理强度的记载有一处不一致：正文 §4.1 称三个角色均为 high，附录 Table 4 的配置表则列出 Code Agent 为 high、Evolve Agent 为 xhigh。本文保留这处差异，不把它当成同一配置。这里没有人工标注新的评测任务：任务和 verifier 来自 Terminal-Bench 2，AHE 产生的是轨迹分析和执行程序修改。

我也核查了论文仓库引用的 <code>harbor-datasets</code>。截至 revision <code>37db1088</code>，公开目录里没有 Terminal-Bench 2 任务包；AHE 仓库本身也没有打包这四道题的验收程序。因此下文的任务说明、隐藏检查和逐步结果来自论文 Appendix C，不能当作我从公开验收源码独立复核后的结论。可以独立复核的是 AHE 的运行编排、修改效果核对，以及最终工具实现和调用处理代码。

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

结论要分层看。AHE 的总分最高，主要来自 55 道中等难度题；Hard 上 53.3% 仍低于 Codex 的 56.7% 和 TF-GRPO 的 55.6%。优化目标按 89 题平均，Medium 数量占优势，所以 Evolve Agent 有动机接受对 Medium 有利、对 Hard 略有代价的组合。

<h3 id="4-2-图片生成正确，提交前却被删除">4.2 图片生成正确，提交前却被删除</h3>

<div class="case">
  <h4><code>path-tracing</code>：生成成功，清理动作删除交付物</h4>
  <ol>
    <li>Terminal-Bench 2 任务要求 Agent 写出 <code>/app/reconstructed.ppm</code>。Verifier 只读取这个文件，与参考图像做逐像素比较。</li>
    <li>第 4 轮两次尝试都已生成正确图片，并完成了自己的结构检查。</li>
    <li>Agent 最后执行类似 <code>rm -rf /app/image /app/reconstructed.ppm /app/scratch</code> 的清理，然后把命令退出码 0 当成可以提交的依据。</li>
    <li>任务验收运行时，唯一交付物已经不存在，因此两条都失败，得分 0/2。</li>
    <li>第 5 轮提示说明“通过验收后的状态应保留”；终端工具记录受保护输出，在删除命令执行前拦截。</li>
  </ol>
  <div class="verdict"><div class="fail"><strong>原始 FAIL</strong>正确文件曾经存在，但 verifier 运行时已经被删。</div><div class="pass"><strong>修复后 PASS</strong>清理被工具拦下，Agent 保留文件并结束，下一轮 2/2。</div></div>
</div>

这个例子说明提示建议与执行拦截的差别。论文明确写到，初始提示已要求不破坏验证结果，模型仍会清理；直到工具实现禁止删除，错误才稳定消失。

<h3 id="4-3-两个结果文件存在，计算过程却没有完成">4.3 两个结果文件存在，计算过程却没有完成</h3>

<div class="case">
  <h4><code>mcmc-sampling-stan</code>：提前写入数字，未完成要求的采样</h4>
  <ol>
    <li>任务要求安装 rstan 2.32.7，用 30 条观测拟合 hierarchical beta-binomial model：用一组参数描述不同观测的成功概率如何分布。Agent 要写出加入观测后估计的 alpha、beta 平均值，也就是后验均值。</li>
    <li>Verifier 会自己安装依赖包，再从头运行 Agent 提交的 <code>analysis.R</code>。最终要求 alpha ∈ [2.84, 2.91]，beta ∈ [16.1, 16.7]。</li>
    <li>失败尝试用网格积分算出 2.876 / 16.375 并提前写进文件；任务要求的 MCMC（通过反复采样来估计参数分布）被放到后台，约 3 分钟就终止，理由是保留已有结果文件。</li>
    <li>Agent 的最终检查只确认两个文件存在且内容能解析。Verifier 重跑未收敛的 <code>analysis.R</code>，得到约 1.28e19 / 2.60e17，六项测试有两项失败。</li>
    <li>第 6 轮的检查代码识别“用替代计算先写答案、只检查文件存在”的做法；保护代码同时记录 <code>analysis.R</code>，避免已验证的脚本被后续动作改坏。修复后的执行记录跑完 <code>iter=100000</code>，又在 <code>/tmp</code> 独立复跑，约 2.872 / 16.43，六项测试全部通过。</li>
  </ol>
</div>

这里的 judge 不是“看文件有没有”，而是复现官方计算流程并检查数值区间。AHE 的作用也不是泄漏隐藏答案，而是逼 Agent 走完任务说明要求的计算流程，并用独立执行交叉验证。

<figure class="figure">
  <a href="/lib/papers/agentic-harness-engineering/figure-5-case-study.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/agentic-harness-engineering/figure-5-case-study.png" alt="AHE 的 middleware、prompt 与 tool 修改实例" width="2489" height="1536"></a>
  <figcaption>论文 Figure 5，作者官方仓库版本。三项真实修改分别落在 middleware、prompt 和 tool 层。官方仓库 MIT License。</figcaption>
</figure>

<h3 id="4-4-跨任务迁移、组件冲突与预测副作用">4.4 跨任务迁移、组件冲突与预测副作用</h3>

SWE-bench Verified 使用完整 500 题、七个仓库，AHE harness 不再针对该领域演化。总体成功率从 NexAU₀ 的 75.2% 到 75.6%，只高 0.4 个百分点；完整结束的尝试平均 token 从 526k 降到 461k，少约 12%。收益主要集中在 django 与 sphinx-doc，scikit-learn、pydata、astropy 三个较小仓库都退化。因而这张表更强的证据是效率迁移，不是大幅准确率迁移。

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

这里的 <code>Succ / Mtok</code> 表示每消耗一百万 tokens，预期能完成多少次任务。附录定义为 <code>成功率 × 10⁶ / 每次尝试的平均 tokens</code>。以 AHE 为例，用表中的四舍五入值计算：<code>0.756 × 10⁶ / 461000 ≈ 1.64</code>。成功率统计包含异常退出的失败，token 均值却只统计完整结束的尝试；这个效率指标没有把异常尝试消耗的全部成本计入。

<figure class="figure">
  <a href="/lib/papers/agentic-harness-engineering/figure-3-transfer.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/agentic-harness-engineering/figure-3-transfer.png" alt="AHE 跨模型迁移结果" width="821" height="542"></a>
  <figcaption>论文 Figure 3，作者官方仓库版本。本图画出 Gemini、DeepSeek、Qwen 三种模型的对比；完整 Table 4 还包含 GPT-5.4 的 medium 与 xhigh 两种推理强度。五种额外配置均高于各自初始配置，增益为 2.3 至 10.1 个百分点。官方仓库 MIT License。</figcaption>
</figure>

组件消融更值得注意：只加记忆为 75.3%、只加工具为 73.0%、只加调用处理为 71.9%，均高于初始 69.7%；只换系统提示则为 67.4%。<strong>Hard 的成绩只加记忆时为 63.3%，装上完整 AHE 却降到 53.3%。</strong> 三个正向组件的增益相加是 +11.1 个百分点，高于完整 AHE 的 +7.3 个百分点。作者在轨迹中看到几个组件都在重复要求提交前验证，叠加后会耗尽难题允许的交互轮数。因此不能把三个组件各自的增益相加，预测完整系统的成绩。

最后看修改效果预测。跨九轮可比较实验，修复预测的精确率 / 召回率是 33.7% / 51.4%，约为随机基线的五倍；退化预测是 11.8% / 11.1%，约为随机基线的两倍。精确率问的是“预计变化的题中，多少真的变化”，召回率问的是“实际变化的题中，多少提前预测到”。附录进一步报告累计 43 个退化预测只有 5 个命中，同时有 40 个实际退化没被预见。累计精确率是 <code>5/43≈11.6%</code>，与逐轮精确率取均值得到的 11.8% 不是同一种平均；累计召回率是 <code>5/(5+40)≈11.1%</code>。AHE 会记录修改假设，但它对副作用的判断仍然很弱。

<h2 id="可复用的修改协议，以及还需要补的对照">5. Discussion：可复用的修改协议，以及还需要补的对照</h2>

**执行规则要能分别修改、记录理由并做回归测试。** 如果所有逻辑都写进一段大提示，维护模型很难知道某条规则是没有被读到、没有被执行，还是和另一个规则冲突。把“建议”升级成执行时提醒或工具拦截，也应当有明确条件：必须先从跨任务轨迹里看到重复错误，并验证只改提示仍不稳定。

对完整代码执行程序，我会优先复用下面四个研究设计：

1. 每个组件固定路径、明确格式，使一项逻辑修改对应一个 commit。
2. 同题至少两次尝试，对照同题一过一错时从哪步开始不同。
3. 让维护模型先写预计修复题与风险题，下一轮按真实成败变化核对。
4. 把提示建议、运行时提醒和执行前拦截当成三个不同强度的控制层，按错误的可逆性和风险选择。

论文还暴露出一个很有研究价值的问题：怎样让维护模型预测多个组件同时作用时的冲突。AHE 的清单围绕单项修改，但实际提示、记忆和调用处理可能同时推动同一种行为，导致重复检查。更完整的后续实验可以把多项修改的组合作为实验变量，逐一开关组件比较，并为 Easy、Medium、Hard 分别设预算约束，而不是只优化由 55 道中等难度题主导的总体平均分。

<h2 id="单次演化证明了什么，哪些稳定性仍未知？">6. Conclusion：单次演化证明了什么，哪些稳定性仍未知？</h2>

**AHE 证明模型可以按固定流程修改完整 harness，并用下一轮任务结果结算；现有实验还不足以说明这个过程稳定、低成本或能跨场景长期运行。** 下面几个边界会直接影响复现和研究设计：

- 主结果来自一条十轮实验，没有不同随机种子的均值和方差。每轮又只有每题两次 rollout，单题成败变化的噪声仍然大。
- 三个角色都使用 GPT-5.4，推理强度在正文与附录配置表之间存在差异。论文保持 base model 不变，隔离了执行程序修改的作用；它没有证明较弱的维护模型也能完成同样的诊断。
- Agent Debugger 的核心只部分开源。公开仓库可检查运行循环、提示、最终组件与效果核对代码，但不能完全复现“10M tokens 如何压成 10K tokens 证据”的所有细节。
- SWE-bench Verified 的总体准确率只高初始配置 0.4 个百分点，且三个小 repo 下降；跨 benchmark 结果应主要理解为 token 效率与部分仓库上的迁移。
- 程序先针对 GPT-5.4 high 调整。medium、high、xhigh 的增益不是单调的，xhigh 可能因为更慢而超过任务超时。
- 自动修改的安全边界仍是研究原型：工作区限权、Git 回滚和验收只读能防一批明显捷径，但不能替代完整的防滥用与长期清理规则。

我的结论是：**如果要研究 Claude Code、Codex 这一类完整 harness，这篇值得优先精读和复现。** 它给出了可以直接实现的工程对象，也公开了具体失败轨迹。实验曲线并非一路上升，组件冲突与副作用预测不足都有可核对的负面结果。作者兴趣度因此是 10/10。

</div>

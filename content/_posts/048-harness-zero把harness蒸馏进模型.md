---
title: "[2026-09-21] Harness-Zero: Harness Distillation via Agent-as-Harness"
permalink: "/posts/论文解读/harness-zero.html"
date: "2026-09-28T20:30:00+08:00"
updated: "2026-09-28T20:30:00+08:00"
cover: "/generated-covers/048-harness-zero.webp"
description: "用 h、h*、K 三个对象和一个真实 SpreadsheetBench 案例，讲清 Harness-Zero 如何把专用 agent harness 的行为转成可在最小工具接口下学习的训练轨迹。"
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
  - "Knowledge Distillation"
  - "SFT"
---

<style>
html:not([data-theme="dark"]) body:has(.hz-reading){--paper:#fff;--paper-elevated:#f6f7f8;--ink:#20252b;--ink-soft:#67717c;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:760px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:25ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.13}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-deck>p{font-family:var(--sans);font-size:.93rem;line-height:1.65}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}.article-shell-deck .article-stats dd{font-family:var(--sans);font-variant-numeric:tabular-nums}
.hz-reading{--hz-column:760px;--hz-blue:#245c9c;--hz-orange:#b9552d;--hz-green:#287462;--hz-ink:var(--ink);--hz-soft:var(--ink-soft);--hz-surface:var(--paper-elevated);--hz-line:var(--line);width:min(100%,var(--hz-column));margin-inline:auto;color:var(--hz-ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}
.hz-reading>*{max-width:100%}.hz-reading p,.hz-reading li{text-wrap:pretty}.hz-reading .hz-paper-meta{margin:0 0 7px;color:var(--hz-soft);font:400 .8rem/1.55 var(--sans)}.hz-reading .hz-source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}.hz-reading .hz-source-links a{font-family:var(--sans)}
.hz-reading .hz-deck{margin:0 0 34px;border:1px solid var(--hz-line);background:#1b2027}.hz-reading .hz-deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.hz-reading .hz-deck-head strong{font-size:.92rem}.hz-reading .hz-deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.hz-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.hz-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.hz-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.hz-reading .hz-lead{margin:0 0 22px;font-size:1.08em;line-height:1.78}.hz-reading .hz-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 26px;border-block:1px solid var(--hz-line)}.hz-reading .hz-metric{min-height:96px;padding:16px 13px;border-right:1px solid var(--hz-line)}.hz-reading .hz-metric:last-child{border-right:0}.hz-reading .hz-metric strong{display:block;color:var(--hz-blue);font:680 clamp(1.55rem,3vw,2.05rem)/1 var(--serif)}.hz-reading .hz-metric span{display:block;margin-top:9px;color:var(--hz-soft);font:600 .79rem/1.45 var(--sans)}
.hz-reading .hz-keypoints{margin:0 0 38px;padding:18px 22px;border-left:5px solid var(--hz-blue);background:color-mix(in srgb,var(--hz-blue) 6%,var(--hz-surface))}.hz-reading .hz-keypoints h3{margin:0 0 8px;font-size:1rem}.hz-reading .hz-keypoints ul{margin:0;padding-left:1.2rem}.hz-reading .hz-keypoints li{margin:.42rem 0}.hz-reading .hz-keypoints strong{font-weight:760}
.hz-reading .hz-part0{margin:34px 0 42px;padding:20px 22px;border-top:4px solid var(--hz-green);background:var(--hz-surface)}.hz-reading .hz-part0 h3{margin:0 0 11px;font-size:1.3rem}.hz-reading .hz-kicker{display:block;margin-bottom:6px;color:var(--hz-green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.hz-reading h2{margin-top:3.5rem}.hz-reading h3{margin-top:2.1rem}.hz-reading h4{margin-top:1.7rem}.hz-reading strong{font-weight:750}.hz-reading .hz-table-scroll,.hz-reading .hz-code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.hz-reading .hz-table-scroll table{display:table;width:100%;min-width:650px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.hz-reading th,.hz-reading td{padding:9px 10px;border:1px solid var(--hz-line);text-align:left;vertical-align:top}.hz-reading th{background:color-mix(in srgb,var(--hz-blue) 7%,var(--hz-surface))}.hz-reading td:first-child{font-weight:650}.hz-reading .hz-code-scroll pre{min-width:660px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--hz-line);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.hz-reading code{font-size:.92em}
.hz-reading .hz-figure{width:100%;margin:26px 0}.hz-reading .hz-figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--hz-line);background:#fff}.hz-reading .hz-figure figcaption{max-width:700px;margin:8px auto 0;color:var(--hz-soft);font-size:.82rem;line-height:1.55;text-align:left}
.hz-reading .hz-objects{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:21px 0;background:var(--hz-line)}.hz-reading .hz-object{padding:16px;background:#fff}.hz-reading .hz-object b{display:block;margin-bottom:5px;color:var(--hz-blue);font:750 1rem/1.35 var(--mono)}.hz-reading .hz-object span{display:block;color:var(--hz-soft);font-size:.86rem;line-height:1.58}
.hz-reading .hz-flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--hz-line);list-style:none}.hz-reading .hz-flow li{min-height:122px;padding:13px;background:var(--hz-surface)}.hz-reading .hz-flow b{display:block;margin-bottom:7px;color:var(--hz-blue);font:750 .77rem/1.3 var(--sans)}.hz-reading .hz-flow span{display:block;color:var(--hz-soft);font-size:.8rem;line-height:1.5}
.hz-reading .hz-boundary{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--hz-line)}.hz-reading .hz-boundary>div{padding:17px 18px;background:#fff}.hz-reading .hz-boundary h4{margin:0 0 8px;font-size:1rem}.hz-reading .hz-boundary ul{margin:0;padding-left:1.18rem}.hz-reading .hz-boundary li{margin:.36rem 0;font-size:.88rem}.hz-reading .hz-boundary .private{background:#fbf4f0}.hz-reading .hz-boundary .private h4{color:var(--hz-orange)}
.hz-reading .hz-case{margin:25px 0;padding:20px;border-block:1px solid var(--hz-line);background:color-mix(in srgb,var(--hz-green) 4%,#fff)}.hz-reading .hz-case h4{margin:0 0 8px;font-size:1.12rem}.hz-reading .hz-case ol{padding-left:1.2rem}.hz-reading .hz-case li{margin:.58rem 0}.hz-reading .hz-verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--hz-line)}.hz-reading .hz-verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.hz-reading .hz-verdict strong{display:block;margin-bottom:4px}.hz-reading .hz-verdict .pass strong{color:var(--hz-green)}.hz-reading .hz-verdict .fail strong{color:var(--hz-orange)}
.hz-reading .hz-note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--hz-orange);background:color-mix(in srgb,var(--hz-orange) 6%,var(--hz-surface))}.hz-reading .hz-note.blue{border-color:var(--hz-blue);background:color-mix(in srgb,var(--hz-blue) 6%,var(--hz-surface))}.hz-reading .hz-note p{margin:.34em 0}.hz-reading .hz-formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--hz-line);font:600 .95rem/1.6 var(--mono);overflow-x:auto}
.hz-reading .hz-bars{margin:22px 0}.hz-reading .hz-bar{display:grid;grid-template-columns:170px 1fr 64px;align-items:center;gap:10px;margin:10px 0;font-size:.85rem}.hz-reading .hz-track{height:16px;background:#e8eaed}.hz-reading .hz-fill{height:100%;background:var(--hz-blue)}.hz-reading .hz-fill.orange{background:var(--hz-orange)}.hz-reading .hz-fill.green{background:var(--hz-green)}.hz-reading .hz-bar em{font-style:normal;font-variant-numeric:tabular-nums;text-align:right}
@media(max-width:760px){.hz-reading .hz-metrics{grid-template-columns:1fr 1fr}.hz-reading .hz-metric:nth-child(2){border-right:0}.hz-reading .hz-metric:nth-child(-n+2){border-bottom:1px solid var(--hz-line)}.hz-reading .hz-flow{grid-template-columns:1fr 1fr}.hz-reading .hz-objects{grid-template-columns:1fr}.hz-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.hz-reading .hz-bar{grid-template-columns:120px 1fr 52px}}
@media(max-width:460px){.hz-reading .hz-flow,.hz-reading .hz-boundary,.hz-reading .hz-verdict{grid-template-columns:1fr}.hz-reading .hz-part0,.hz-reading .hz-case{padding:17px 15px}.hz-reading .hz-deck-head{align-items:flex-start;flex-direction:column}.hz-reading .hz-bar{grid-template-columns:100px 1fr 48px;font-size:.75rem}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,960px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="hz-reading">

<p class="hz-paper-meta">Haoran Ye, Yuxing Lu, Haonan Dong, Zhaochen Su, Guojie Song · arXiv:2609.24974v1 · 2026-09-21</p>

<div class="hz-source-links">
  <a href="https://arxiv.org/abs/2609.24974">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.24974">论文 PDF</a>
  <a href="https://github.com/metaevo-ai/harness-zero">官方代码与数据</a>
</div>

<section class="hz-deck" aria-label="Harness-Zero 交互图解">
  <div class="hz-deck-head"><strong>14 页交互图解 · Harness-Zero 从训练到部署</strong><a href="/lib/decks/harness-zero-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame">
      <iframe src="/lib/decks/harness-zero-visual-guide.html" title="Harness-Zero 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe>
    </div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="hz-lead">一个专门设计的 agent harness 可以让模型更会用工具、更少犯流程错误，但这些收益通常和那套 harness 绑在一起。Harness-Zero 的目标，是把专用 harness 诱导出的做事方式写回模型参数：训练时让一个 harnessing agent 在每次执行前审查 student 的下一步，必要时把它改写成 student 原本就能执行的动作；SFT 结束后，部署只留下微调后的模型和一个最小 harness。</p>

<div class="hz-metrics" aria-label="论文关键结果">
  <div class="hz-metric"><strong>23.3 → 44.3</strong><span>Qwen3.5-9B 三领域 macro average</span></div>
  <div class="hz-metric"><strong>81.1%</strong><span>frontier models 上 agent-as-harness 平均成绩</span></div>
  <div class="hz-metric"><strong>82.3%</strong><span>28 种 harness-exclusive behavior 的平均恢复率</span></div>
  <div class="hz-metric"><strong>2.4×</strong><span>USPTO 轨迹采集平均延迟</span></div>
</div>

<aside class="hz-keypoints">
  <h3>先记住三个判断</h3>
  <ul>
    <li><strong>核心不是模仿更强模型的答案，而是翻译 harness 的行为。</strong>每个 correction 都必须落在 student 部署时仍然拥有的 action space 里。</li>
    <li><strong>训练轨迹是否容易成功，不等于它是否适合蒸馏。</strong>拿到 oracle answer 的 reviewer 把采集成功率推到 98.6%，微调后只有 15.0%；使用私有参考 harness <code>K</code> 时，采集成功率只有 59.4%，测试却达到 30.0%。</li>
    <li><strong>程序化工作流更容易迁移，深领域知识和专用工具更难。</strong>SpreadsheetBench、AppWorld 上蒸馏模型超过 <code>h*</code>；USPTO 上仍低 8 个百分点。</li>
  </ul>
</aside>

<aside class="hz-part0">
<span class="hz-kicker">PART 0 · READING PRIMER</span>

### 先把 agent harness 理解成“模型之外的执行系统”

模型只负责生成下一条 response。真正把 response 变成工具调用、保存文件、截断上下文、阻止危险提交、注入经验和继续下一轮的，是 harness。它可以只有一个 Bash 工具，也可以包含 middleware、skills、memory 和领域专用工具。论文研究的不是把整个 agent 复制进参数，而是：当一套专用 harness 已经找到有效流程后，能否让模型在更小、更固定的接口下学会这些流程。

<div class="hz-objects">
  <div class="hz-object"><b>model</b><span>根据当前上下文生成下一条 response。本文的 student 是 Qwen3.5-9B。</span></div>
  <div class="hz-object"><b>harness</b><span>组织提示、工具、状态和执行循环。它决定模型能做什么，也决定动作如何落到环境里。</span></div>
  <div class="hz-object"><b>environment</b><span>真正保存 workbook、应用状态或化学任务文件的 sandbox。命令结果再作为 observation 返回。</span></div>
</div>
</aside>

## Q1. 为什么要把 harness 蒸馏掉？

Harness engineering 已经是一条有效的 agent 优化路线：给模型增加工具、在关键节点做检查、把长期任务拆开、保存跨任务经验，都能提高完成率。问题在于，<strong>提升发生在模型外面，部署时就必须继续携带那套系统</strong>。

这会形成两个不太理想的选择。只保留一套通用 harness，模型会失去领域流程和专用工具带来的收益；为不同领域、实例和模型保留多套 harness，又需要持续维护路由、上下文、调用链和兼容性。模型升级以后，原先写死在代码里的假设还可能过时。

Harness-Zero 把目标写成一个明确的迁移问题：训练阶段有一套经过优化的 harness，部署阶段只允许使用固定的最小 harness。论文用三个符号区分它们：

<div class="hz-objects">
  <div class="hz-object"><b>h</b><span>目标 harness。部署时保留；本文只有一个 <code>execute</code> Bash 工具和固定 system prompt。</span></div>
  <div class="hz-object"><b>h*</b><span>在训练任务上演化得到的专用 student-side harness，含 tools、middleware、skills、memory。</span></div>
  <div class="hz-object"><b>K</b><span>把 <code>h*</code> 改写成给 harnessing agent 读取的私有参考 harness。它不直接挂在 student 上。</span></div>
</div>

要解决的难点并非普通的 teacher–student distillation。<code>h*</code> 可能提供部署时不存在的工具，也可能在 student 看不到的地方直接读 sandbox、阻止动作或改写状态。直接模仿 <code>h*</code> 下的轨迹，会把这些不存在的 tool calls 一起教给模型。论文把这个问题称为 action-space mismatch。

## Q2. 它和已有工作差在哪？

相关工作大致有三条线。第一条优化 harness 本身，例如 Meta-Harness 自动搜索工具、middleware、skills 和 memory；收益很好，但上线仍要带着优化后的 harness。第二条共同优化模型和 harness；模型更新会利用新 harness 采集的数据，不过最终能力仍可能依赖训练时的外部系统。第三条蒸馏 privileged guidance：EvoHarness-RL 和 OPHSD 都说明模型能吸收一部分外部流程，但前者部署时仍保留 workspace，后者没有完整的交互式工具循环。

<div class="hz-table-scroll">
<table>
  <thead><tr><th>方向</th><th>训练或推理时做什么</th><th>部署时还需要什么</th><th>Harness-Zero 的边界</th></tr></thead>
  <tbody>
    <tr><td>Harness optimization</td><td>搜索更好的 prompt、tools、workflow、middleware</td><td>优化后的专用 harness</td><td>把已经找到的行为转成训练数据</td></tr>
    <tr><td>Model–harness co-evolution</td><td>交替或联合更新模型参数与 harness</td><td>通常仍依赖共同优化后的 harness</td><td>部署目标固定为最小 <code>h</code></td></tr>
    <tr><td>Privileged-guidance distillation</td><td>蒸馏 verifier、plan–solve 或外部状态管理</td><td>有的方法仍保留部分外部机制</td><td>处理完整 tool-using harness 与 action-space mismatch</td></tr>
    <tr><td>Harness-Zero</td><td>用 agent 把 <code>h*</code> 的指导逐步改写成 <code>h</code> 中可执行的 response</td><td>微调模型 + 固定 <code>h</code></td><td>当前仍不擅长深领域知识和无法写成 response 的机制</td></tr>
  </tbody>
</table>
</div>

论文的关键区别是 enforcement point（干预位置）变了。<code>h*</code> 原来直接包住 student；Harness-Zero 让 harnessing agent 在 response 进入执行器之前做审查。这样既能参考专用 harness，又能保证被接受的动作从一开始就属于 <code>h</code>。

## Q3. Harness-Zero 具体怎么做？

### 3.1 先把 <code>h*</code> 改写成 <code>K</code>

作者先在训练任务上演化 <code>h*</code>，再根据目标 harness <code>h</code> 改写每类组件。工具变成 action recipe，告诉 reviewer 如何用普通 Bash/Python 构造等价操作；middleware 变成 review middleware，只根据 candidate response 和 student 可见轨迹判断是否要干预；skills 变成 review guidance；memory 中积累的失败则变成 failure patterns。

<figure class="hz-figure">
  <a href="/lib/papers/harness-zero/figure-1-overview.png"><img src="/lib/papers/harness-zero/figure-1-overview.png" alt="Harness-Zero 的 evolve、agent-as-harness trajectory collection、SFT 与 deployment 全流程"></a>
  <figcaption><strong>论文 Figure 1。</strong>上半部分是 <code>h*</code> 到 <code>K</code> 的改写；中间是每一步 PASS/REPLACE；右侧表示部署时只留下 distilled student 与 <code>h</code>。图片来自作者官方仓库，Apache-2.0。</figcaption>
</figure>

### 3.2 每个 response 都先审查，再执行

<ol class="hz-flow" aria-label="Agent-as-harness 轨迹收集流程">
  <li><b>1 · PROPOSE</b><span>student 在 <code>h</code> 下生成尚未执行的 <code>y_t</code>。</span></li>
  <li><b>2 · REVIEW</b><span>harnessing agent 读取可见轨迹、candidate 和私有 <code>K</code>。</span></li>
  <li><b>3 · DECIDE</b><span>选择 PASS，或给出完整 REPLACE response。</span></li>
  <li><b>4 · EXECUTE</b><span>accepted response 通过目标 harness <code>h</code> 执行。</span></li>
  <li><b>5 · OBSERVE</b><span>命令结果进入 student-visible trajectory。</span></li>
  <li><b>6 · TRAIN</b><span>对 accepted responses 做 SFT；部署移除 reviewer。</span></li>
</ol>

PASS 保留原 response。REPLACE 必须给出一条完整的 student response，而且只能调用 <code>h</code> 允许的 <code>execute</code>。官方实现的 schema 会拒绝三种情况：PASS 却带 replacement、REPLACE 没有 replacement、replacement 既无可见文字也无 tool call。每次无效提交最多重试三次。

<div class="hz-boundary">
  <div><h4>student 能看到并用于训练</h4><ul><li>任务与固定 system prompt</li><li>已接受的 response</li><li><code>execute</code> 的 stdout / stderr 与 exit code</li><li>之前所有 accepted observations</li></ul></div>
  <div class="private"><h4>只属于 harnessing agent</h4><ul><li>私有参考 harness <code>K</code></li><li>PASS/REPLACE 的理由与组件名</li><li>未执行的原始 proposal</li><li>review middleware 的内部提示</li></ul></div>
</div>

这个可见性边界很重要。harnessing agent 没有 student sandbox 的私有挂载，也不能读取隐藏答案。它只能根据 student 已经看到的 observation 判断下一步，并把 correction 写成 student 自己能执行的动作。

### 3.3 真实 case：预填示例单元格不能被覆盖

SpreadsheetBench 的一些任务要求填写一段 answer range，其中已经放了少量 worked examples。这些单元格本身就是规格：student 要从中推断规则和格式，只填写空白位置。常见错误是脚本对整段区域批量写值，把示例一起覆盖。

<div class="hz-case">
  <h4>同一个 guard，如何从 <code>h*</code> 迁移到 student 的行为里</h4>
  <ol>
    <li><strong>原始 <code>h*</code>：</strong><code>prefilled_guard</code> 在 student 准备 finish 时，直接进入 sandbox，比较输入、输出 workbook 的 answer range；只要预填 literal 被改动，就拒绝结束。</li>
    <li><strong>改写成 <code>K</code>：</strong>review middleware 不再读取 sandbox，只扫描 student-visible trajectory，寻找“比较过输入和输出”的证据。</li>
    <li><strong>触发 REPLACE：</strong>student 若直接 finish，harnessing agent 把 finish 换成一条普通 <code>execute</code> 命令。命令创建并运行 workbook diff 脚本。</li>
    <li><strong>形成监督：</strong>diff 输出进入 student 的下一轮上下文。student 看见 PASS 才结束；看见被改动的坐标，就先修复。SFT 学到的是“提交前主动比较”，不是某个隐藏 middleware 的调用名。</li>
  </ol>
  <div class="hz-verdict"><div class="pass"><strong>PASS 轨迹</strong>比较结果显示没有预填单元格变化，student 再提交最终答案。</div><div class="fail"><strong>FAIL 后的修复轨迹</strong>例如输出 <code>FAIL changed cells: ['B7']</code>，student 恢复 B7 并重新运行验证。</div></div>
</div>

下面的代码根据论文 Appendix B.2 / Code 1–3 压缩改写。它展示 action recipe 最终如何变成 <code>h</code> 可执行的 student action；不是新的 benchmark checker。

<div class="hz-code-scroll"><pre><code># 在 accepted response 里创建并执行；目标 harness h 只看见一次 Bash execute
python3 - &lt;&lt;'PY' INPUT.xlsx OUTPUT.xlsx B3:B40
import sys, openpyxl
from openpyxl.utils import range_boundaries

input_path, output_path, cell_range = sys.argv[1:4]
wb_in = openpyxl.load_workbook(input_path)
wb_out = openpyxl.load_workbook(output_path)
ws_in, ws_out = wb_in.active, wb_out.active
min_c, min_r, max_c, max_r = range_boundaries(cell_range)

changed = []
for row in range(min_r, max_r + 1):
    for col in range(min_c, max_c + 1):
        before = ws_in.cell(row=row, column=col)
        after = ws_out.cell(row=row, column=col)
        if before.value is not None and before.data_type != "f":
            if after.value != before.value:
                changed.append(before.coordinate)

print("PASS" if not changed else f"FAIL changed cells: {changed}")
raise SystemExit(bool(changed))
PY</code></pre></div>

### 3.4 轨迹过滤与 SFT

SpreadsheetBench 和 AppWorld 只保留 verifier reward 为 1.0 且没有执行异常的 trial；USPTO 保留全部 500 条，保证各 ablation 使用相同任务。作者还扫描私有路径、candidate 文件名、review submission tool 名和内部 middleware 名，防止 reviewer 私有信息进入训练数据。若 replacement 的 reasoning 出现“student proposal”“review”“rewrite”等 reviewer 视角表达，该 reasoning token span 会从 loss 中 mask 掉。

最终每个领域单独训练：SpreadsheetBench 487 条轨迹，AppWorld 282 条，USPTO 500 条。模型是 Qwen3.5-9B，LoRA rank / alpha 都是 32，batch size 8，sequence length 65,536，训练 2 epochs；peak learning rate 为 <code>2e-4</code>，5% warmup 后降到 <code>1e-6</code>，seed 42。

## Q4. 实验到底说明了什么？

### 4.1 三个领域与统一部署接口

<div class="hz-table-scroll">
<table>
  <thead><tr><th>Domain</th><th>训练 / 测试</th><th>任务与指标</th><th>专用 harness 主要提供什么</th></tr></thead>
  <tbody>
    <tr><td>SpreadsheetBench Verified</td><td>300 / 100</td><td>真实 spreadsheet manipulation；single-run pass@1</td><td>检查、编辑、保存和验证 workbook 的流程</td></tr>
    <tr><td>AppWorld</td><td>147 / 168 tasks</td><td>56 个三任务 scenario；SGC</td><td>API 参数、分页、mutation 后回读、完成条件</td></tr>
    <tr><td>USPTO retrosynthesis</td><td>500 / 100</td><td>单步前体预测；single-run pass@1</td><td>反应先验、候选生成、RDKit / SMILES 验证</td></tr>
  </tbody>
</table>
</div>

所有任务通过 Harbor 在 Docker sandbox 中运行。student 部署接口始终是最小 mini-SWE-agent：一个固定 system prompt、一个非空 Bash 命令参数的 <code>execute</code> 工具；每次调用启动新 shell，文件系统状态保留。

### 4.2 Agent-as-harness 是否比直接挂载代码更有效？

Table 1 在 GPT-5.6 Sol 和 DeepSeek-V4-Pro 上做了六个 benchmark–model 设置。这里没有训练；同一个模型同时扮演 student 和 harnessing agent，所以提升不能归因于更强 teacher。

<div class="hz-bars" aria-label="Table 1 平均结果重绘">
  <div class="hz-bar"><span>minimal h</span><div class="hz-track"><div class="hz-fill" style="width:68.6%"></div></div><em>68.6</em></div>
  <div class="hz-bar"><span>h + empty review</span><div class="hz-track"><div class="hz-fill orange" style="width:69.2%"></div></div><em>69.2</em></div>
  <div class="hz-bar"><span>code-as-harness h*</span><div class="hz-track"><div class="hz-fill" style="width:78.1%"></div></div><em>78.1</em></div>
  <div class="hz-bar"><span>agent-as-harness K</span><div class="hz-track"><div class="hz-fill green" style="width:81.1%"></div></div><em><strong>81.1</strong></em></div>
</div>

<p class="hz-paper-meta">根据论文 Table 1 重绘；单位为六个设置的平均百分比。空 <code>K</code> 只比 <code>h</code> 高 0.6 分，说明收益来自演化出的指导，而不是“多加一个 reviewer”。</p>

### 4.3 蒸馏后，拿掉 <code>h*</code> 还能剩多少？

<div class="hz-table-scroll">
<table>
  <thead><tr><th>Setting</th><th>SpreadsheetBench</th><th>AppWorld</th><th>USPTO</th><th>Macro avg.</th></tr></thead>
  <tbody>
    <tr><td>Base + minimal <code>h</code></td><td>31.0</td><td>26.8</td><td>12.0</td><td>23.3</td></tr>
    <tr><td>Base + evolved <code>h*</code></td><td>39.0</td><td>48.2</td><td><strong>38.0</strong></td><td>41.7</td></tr>
    <tr><td>Base + DeepAgents</td><td>35.0</td><td>19.6</td><td>7.0</td><td>20.5</td></tr>
    <tr><td>Base + Claude Code</td><td>31.0</td><td>10.7</td><td>6.0</td><td>15.9</td></tr>
    <tr><td><strong>Harness-Zero + minimal <code>h</code></strong></td><td><strong>44.0</strong></td><td><strong>58.9</strong></td><td>30.0</td><td><strong>44.3</strong></td></tr>
  </tbody>
</table>
</div>

根据论文 Table 2，macro average 从 <strong>23.3% 升到 44.3%</strong>，比 base model 继续挂着 <code>h*</code> 的 41.7% 还高 2.6 分。分领域看则更谨慎：SpreadsheetBench 与 AppWorld 主要依赖可在轨迹中示范的程序化步骤；USPTO 的 <code>h*</code> 还提供反应先验、候选生成和可执行 SMILES 验证，因此 distilled model 的 30.0% 仍低于 38.0%。

### 4.4 为什么成功率最高的轨迹，不一定最适合蒸馏？

USPTO ablation 是全文最值得看的实验。所有条件都从同一个 Qwen3.5-9B 出发，使用相同 500 个采集任务、相同训练 recipe，并在 <code>h</code> 下测试。

<div class="hz-table-scroll">
<table>
  <thead><tr><th>Trajectory source</th><th>Collection success</th><th>微调后 test pass@1 under <code>h</code></th></tr></thead>
  <tbody>
    <tr><td>Base（未训练）</td><td>—</td><td>12.0</td></tr>
    <tr><td>GPT-5.6 teacher rollout</td><td>52.0</td><td>12.0</td></tr>
    <tr><td>Teacher under <code>h*</code></td><td>62.0</td><td><strong>3.0</strong></td></tr>
    <tr><td>Student under <code>h*</code></td><td>39.4</td><td>12.0</td></tr>
    <tr><td>Review with empty <code>K</code></td><td>44.2</td><td>11.0</td></tr>
    <tr><td>Review with oracle answer</td><td><strong>98.6</strong></td><td>15.0</td></tr>
    <tr><td><strong>Harness-Zero with <code>K</code></strong></td><td>59.4</td><td><strong>30.0</strong></td></tr>
  </tbody>
</table>
</div>

<p class="hz-paper-meta">根据论文 Table 3 重绘。Collection success 在训练集采集阶段测量；最右列才是蒸馏后模型在独立测试集、最小 <code>h</code> 下的成绩。</p>

直接蒸馏 <code>h*</code> 轨迹的失败最能说明 action-space mismatch：模型学会了部署时不存在的 harness-tool call，大量 trial 因此耗尽 turn limit。Oracle answer 则容易产生只对当前题有效的捷径。<code>K</code> 没有答案，提供的是“先枚举候选、再用图结构和化学规则过滤、最后验证输出”的可复用程序。

### 4.5 82.3% 的 behavior recovery 怎么算？

作者为 <code>h*</code> 中的每条 memory、skill、tool 和 middleware 规则写了确定性 trajectory detector。对每个 pattern，只保留这样的 test task：base model 在 <code>h*</code> 下出现该行为，在 <code>h</code> 下不出现；support tasks 少于 10 的 pattern 被丢弃。最终得到 SpreadsheetBench 18 种、USPTO 6 种、AppWorld 4 种。

<div class="hz-formula">recovery(pattern) = distilled model 出现该行为的 support tasks / 该 pattern 的 support tasks</div>

28 个 pattern 的平均恢复率为 <strong>82.3%</strong>。例如“保护预填单元格”是 24/26（92%），“读取完整分页”是 21/53（40%），“用 RDKit 验证”是 60/60（100%）。这里不能把 82.3% 当成自然任务分布上的总体行为准确率：support set 的定义已经让 base + <code>h</code> 为 0%、base + <code>h*</code> 为 100%。它测的是蒸馏能否在专门挑出的 harness-exclusive 场景里恢复行为。

## Q5. 这项工作给 agent 训练带来什么启发？

第一，训练数据的价值取决于 deployment compatibility。更强 teacher、更高采集成功率、甚至 oracle answer，都不保证 student 能在自己的工具接口里复现。Harness-Zero 让 teacher 只改“下一步”，每次 correction 都经过目标 harness 执行，把可执行性直接写进数据生成过程。

第二，harness 可以被看成一种程序化课程。<code>K</code> 不给最终答案，而是在 student 正要犯错的时刻加入一次 inspection、verification 或 recovery。它保留 student 原有轨迹的大部分状态，只对关键 decision 做小改动。相比完整接管任务，这种数据更接近 student 的能力范围，也更明确地示范一个可复用行为。

第三，未来更值得研究 selective review。当前方法审查每个 proposal，训练时每一步至少两次模型调用；但真正需要 replacement 的步骤只占一部分。若能用便宜的 detector 或 uncertainty signal 筛选高风险节点，可能保留主要监督价值，同时显著降低采集成本。

最后，论文也给 harness 设计提出了一个新问题：哪些组件的价值来自可学习流程，哪些必须在部署时继续作为外部能力存在？SpreadsheetBench 的检查工作流很容易写进 response；上下文裁剪、真正的并行调度、需要私有状态的安全隔离，就未必能靠 SFT 取代。

## Q6. 结论与限制

Harness-Zero 提供了一条完整路径：先优化 student-side harness <code>h*</code>，再把它改写成 reviewer 读取的 <code>K</code>；harnessing agent 用 PASS/REPLACE 把指导翻译成目标 action space <code>h</code> 中的 response；SFT 只学习 accepted trajectory；部署时移除 <code>h*</code>、<code>K</code> 和 reviewer。

现有证据支持一个相对克制的结论：<strong>程序化 harness 行为可以在不保留专用 harness 的情况下，较大比例地迁移进一个 9B 模型。</strong>三领域 macro average 提高 21.0 个百分点，28 个 harness-exclusive patterns 平均恢复 82.3%。但这还不是“所有 harness 都能被蒸馏掉”。

- reviewer 必须足够强。USPTO 上，agent-as-harness 相对 code-as-harness 在 GPT-5.6 Sol、DeepSeek-V4-Pro 上分别高 1 分和 4 分；在 DeepSeek-V4-Flash、Qwen3.6-35B-A3B 上则分别低 1 分和 12 分。最弱模型替换了 66.0% 的步骤，但这些改写整体有害。
- 采集成本明显增加。USPTO 上 minimal harness 平均 100.1 秒，agent-as-harness 为 237.2 秒，约 2.4×；这部分成本在训练数据采集期发生，部署后消失。
- SFT 对深领域知识与真正的可执行能力吸收有限。USPTO 的蒸馏结果仍落后 <code>h*</code> 8 分。
- 不是所有机制都能自然地写成 student response。论文明确提到 context management 仍是困难项。
- 主要 pass@1 / SGC 都是 single-run，论文没有报告重复实验方差；frontier model 对比复用了在 Qwen3.5-9B 上演化的 <code>h*</code>，这个设计有利于考察迁移，但不等同于为每个强模型分别寻找最优 harness。

Harness-Zero 不让 reviewer 替 student 完成整道题。它把外部 harness 的检查与工作流，翻译成 student 在部署接口下也能亲自执行、并能通过 SFT 留下来的行为。

</div>

---
title: "[2026-09-08] Co-Evolving Harnesses and Models: On-Policy Correction Helps Weaker Models Catch Up Where Imitation Fails"
permalink: "/posts/论文解读/co-evolving-harnesses-and-models.html"
date: "2026-09-29T17:02:00+08:00"
updated: "2026-10-20T08:30:00+08:00"
cover: "/generated-covers/057-co-evolving-harnesses-and-models.webp"
description: "先为弱模型调整提示、工具和运行时检查，再让它完整模仿强模型，成绩反而下降。本文沿着两条真实失败记录，解释为何改用学生自己的执行记录，只修错误发生的那一轮，并核对数据和实验限制。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Coding Agent"
  - "Imitation Learning"
  - "On-Policy Learning"
  - "LoRA"
  - "Claude Code"
  - "Codex"
---

<style>
html:not([data-theme="dark"]) body:has(.opc-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:42ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.1}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.opc-reading{--column:780px;--blue:#2d669f;--orange:#b75b35;--green:#2b7863;--red:#a3443d;--violet:#6e5aa8;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.opc-reading>*{max-width:100%}.opc-reading p,.opc-reading li{text-wrap:pretty}.opc-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.opc-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.opc-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.opc-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.opc-reading .deck-head strong{font-size:.92rem}.opc-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.opc-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.opc-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.opc-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.opc-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.opc-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line-local));background:color-mix(in srgb,var(--violet) 5%,#fff)}.opc-reading .interest b{color:var(--violet);font:750 1.2rem/1 var(--mono)}.opc-reading .interest span{color:var(--soft);font-size:.84rem}
.opc-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.opc-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.opc-reading .metric:last-child{border-right:0}.opc-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.opc-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.opc-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.opc-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.opc-reading .keypoints ul{margin:0;padding-left:1.2rem}.opc-reading .keypoints li{margin:.42rem 0}.opc-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--violet);background:var(--surface)}.opc-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.opc-reading .kicker{display:block;margin-bottom:6px;color:var(--violet);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.opc-reading h2{margin-top:3.55rem}.opc-reading h3{margin-top:2.1rem}.opc-reading h4{margin-top:1.7rem}.opc-reading strong{font-weight:750}.opc-reading .table-scroll,.opc-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.opc-reading .table-scroll table{display:table;width:100%;min-width:720px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.opc-reading th,.opc-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.opc-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.opc-reading td:first-child{font-weight:650}.opc-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.opc-reading code{font-size:.92em}
.opc-reading .figure{width:100%;margin:27px 0}.opc-reading .figure img{display:block;width:auto;max-width:100%;max-height:780px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.opc-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.opc-reading .roles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.opc-reading .role{padding:16px;background:#fff}.opc-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.opc-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}
.opc-reading .process{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.opc-reading .process li{min-height:140px;padding:12px;background:var(--surface)}.opc-reading .process b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.opc-reading .process span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}.opc-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.opc-reading .case h4{margin:0 0 8px;font-size:1.12rem}.opc-reading .case ol{padding-left:1.2rem}.opc-reading .case li{margin:.58rem 0}.opc-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.opc-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.opc-reading .verdict strong{display:block;margin-bottom:4px}.opc-reading .verdict .pass strong{color:var(--green)}.opc-reading .verdict .fail strong{color:var(--red)}
.opc-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.opc-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.opc-reading .note p{margin:.34em 0}.opc-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.opc-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.opc-reading .limit-grid>div{padding:17px;background:#fff}.opc-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.opc-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.9rem,8.4vw,2.38rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.opc-reading,.opc-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.opc-reading .source-links a{overflow-wrap:anywhere}.opc-reading .deck-wrap{max-width:100%;overflow:hidden}.opc-reading .metrics{grid-template-columns:1fr 1fr}.opc-reading .metric:nth-child(2){border-right:0}.opc-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.opc-reading .process{grid-template-columns:1fr 1fr}.opc-reading .roles{grid-template-columns:1fr}.opc-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.opc-reading .process,.opc-reading .verdict,.opc-reading .limit-grid{grid-template-columns:1fr}.opc-reading .part0,.opc-reading .case{padding:17px 15px}.opc-reading .deck-head,.opc-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
.opc-reading .supplement{margin:20px 0;border:1px solid var(--line-local);background:var(--surface)}
.opc-reading .supplement>summary{cursor:pointer;padding:12px 16px;color:var(--blue);font-weight:700;list-style:revert}
.opc-reading .supplement>.table-scroll,.opc-reading .supplement>.figure{margin:0 15px 17px;width:calc(100% - 30px)}
.opc-reading .source-crops{display:none}
.opc-reading .source-crop{margin:12px 0;padding:12px;border:1px solid var(--line-local);background:#fff}
.opc-reading .source-crop b{display:block;margin-bottom:8px;color:#38546a;font-size:.85rem}
.opc-reading .source-crop a{display:block;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.opc-reading .source-crop img{display:block;width:auto;max-width:none;max-height:none;height:auto;margin:0;border:0}
.opc-reading .source-crop .paper-figure-expand{display:none}
.opc-reading .original-link{display:none;font-size:.83rem}
@media(max-width:760px){
  .opc-reading .figure.has-mobile-crops>a:first-child{display:none}
  .opc-reading .source-crops{display:block}
  .opc-reading .source-crop.narrow img{width:min(100%,440px)}
  .opc-reading .source-crop.wide img{width:720px;max-width:none}
  .opc-reading .source-crop.wide b::after{content:" · 左右滑动看全图";color:var(--soft);font-weight:500}
  .opc-reading .original-link{display:inline-block;margin:4px 0 8px}
}
@media(max-width:700px){.opc-reading .post-deck-embed-frame{height:min(75vh,640px);aspect-ratio:auto}}
</style>

<div class="opc-reading">

<p class="paper-meta">Zhou Yu, Bin Bi, Shiva Kumar Pentyala, Shubham Mehrotra, Sougata Chaudhuri, Shilpa Bhagavath, Zeyuan Chen, Ran Xu, Phil Mui, James Zhu, Sitaram Asur · arXiv:2609.09134v1 · 2026-09-08</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.09134">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.09134">论文 PDF</a>
  <a href="https://arxiv.org/abs/2607.08938">上游任务与执行程序演化论文</a>
</div>

<section class="deck-wrap" aria-label="On-Policy Correction 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · 模型与执行程序的配合、真实失败与修正数据</strong><a href="/lib/decks/on-policy-correction-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/on-policy-correction-visual-guide.html" title="Co-Evolving Harnesses and Models 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">作者先围绕弱模型调整提示、工具和运行时检查，得到一套执行程序（harness），再用强模型的成功执行记录微调弱模型，成绩反而下降。Qwen3-Coder 在调整后的程序下原本达到 78.0%，完整模仿 Gemini 后降到 63.1%。作者改为保留 Qwen 自己的执行记录，只让专家模型重写错误发生的那一轮回复与工具调用，最终得到 79.7%。下面分别解释执行程序怎样改、训练记录怎样修，以及这些分数测什么。</p>

<aside class="part0">
<span class="kicker">阅读准备</span>

### 初始与演化后的执行程序，学生与专家记录

论文把初始 harness 记为 `h0`。作者让 Qwen3-Coder-30B-A3B 在七类企业任务上运行，再由 Gemini-3.1-Pro-Preview 当修改者，根据失败记录改系统提示、工具、hooks（调用前后的处理逻辑）和上下文管理。每类任务最后选出的版本是 `h*`。这套 `h*` 包含针对 Qwen 原有行为调过的提示、工具和执行规则，不只是一段提示词。Harness 是模型外的执行程序；rollout 是一次完整任务执行记录。

<div class="roles">
  <div class="role"><b>较弱模型／学生</b><span>Qwen3-Coder-30B-A3B，主实验里既负责生成程序演化所需的执行记录，也是后续 LoRA-SFT 的对象。</span></div>
  <div class="role"><b>较强模型／专家</b><span>Gemini-3.1-Pro-Preview。它修改执行程序，也生成完整模仿记录或单次回复修正。</span></div>
  <div class="role"><b>演化后的执行程序 h*</b><span>主要改系统提示，也可增删工具和调用处理；按验证分选择。</span></div>
  <div class="role"><b>任务验收</b><span>给每次完整执行 0/1 成功分；本文未公开任务文件、验收代码或逐条修正数据。</span></div>
</div>

Full-trajectory imitation（完整轨迹模仿）训练专家自己的执行步骤；on-policy correction（在学生当前执行记录上修正）从学生失败开始，只把定位的一个错误回复换成专家版本，其余学生记录保留。SFT 是监督微调；LoRA 是只训练少量附加参数的微调方式。
</aside>

<div class="interest"><b>博客作者兴趣度 9.7 / 10</b><span>评分仅表示博客作者本人兴趣程度；它直接研究完整 harness 与模型权重更新之间的兼容性</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>29.2 → 78.0</strong><span>Qwen：初始程序 → 演化后程序</span></div>
  <div class="metric"><strong>78.0 → 63.1</strong><span>模仿专家完整执行记录</span></div>
  <div class="metric"><strong>78.0 → 79.7</strong><span>只修学生实际执行中的一次回复</span></div>
  <div class="metric"><strong>1.1% → 14.6%</strong><span>各条件的失败记录中，规划失败所占比例</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li>程序围绕弱模型原有的检查与提交节奏演化，权重更新可能改变这套配合。完整模仿后七项任务都退步。</li>
    <li>部门计算规则使用率从 30.8% 升到 76.1%；但各条件失败记录中的<strong>规划失败占比从 1.1% 升到 14.6%</strong>。这些占比不是全部执行的失败率。</li>
    <li>局部修正保留学生自己访问过的状态。约 500 条训练数据中，约 400 条是单回复修正，另混入约 50 条学生成功记录；约数的差额未解释。</li>
    <li>79.7% 比 78.0% 只高 1.7 个百分点。方法主要<strong>避免了完整模仿的 14.9 点回退</strong>，没有追平同一 harness 下 Gemini 的 93.6%。</li>
  </ul>
</aside>


<h2 id="为弱模型调好的执行程序，为什么会被完整模仿打乱？">1. Motivation：为弱模型调好的执行程序，为什么会被完整模仿打乱？</h2>

**作者的解释是，演化后的 harness 已适配弱模型的检查与提交节奏，完整模仿却同时改变知识和执行习惯。** 在文中的案例里，强模型少解释、少做中间检查，也较早提交答案。弱模型模仿了这种做法，却未必获得支撑这套执行顺序的能力。

Gemini 在 Qwen 的 `h*` 下达到 93.6%，比 Qwen 的 78.0% 高 15.6 个百分点。但 `h*` 的提示、工具、调用处理与执行顺序，是根据 Qwen 的失败记录逐步改出来的。完整模仿改变了 Qwen 常走的步骤、检查时机与提交时机；外层规则没变，模型却未必按这些规则原先预期的节奏执行。

<figure class="figure has-mobile-crops">
  <a href="/lib/papers/on-policy-correction/figure-1-content-crop.webp" target="_blank" rel="noopener" aria-label="打开去除空白边的原图"><img src="/lib/papers/on-policy-correction/figure-1-content-crop.webp" alt="论文 Figure 1：执行程序演化、完整专家模仿与学生记录局部修正，去除空白边" width="1220" height="520"></a>
  <div class="source-crops" aria-label="原论文 Figure 1 的手机分段阅读版">
    <div class="source-crop figure narrow"><b>1. 围绕弱模型演化执行程序 · 原论文局部裁切</b><a href="/lib/papers/on-policy-correction/figure-1-harness-crop.webp" target="_blank" rel="noopener" aria-label="放大执行程序演化局部图"><img src="/lib/papers/on-policy-correction/figure-1-harness-crop.webp" alt="Figure 1 左侧：弱模型执行任务，收到验收与执行反馈，再由修改者提出并选择程序改动" width="390" height="490" loading="lazy"></a></div>
    <div class="source-crop figure wide"><b>2. 完整专家模仿打乱原有配合 · 原论文局部裁切</b><a href="/lib/papers/on-policy-correction/figure-1-imitation-crop.webp" target="_blank" rel="noopener" aria-label="放大完整模仿局部图"><img src="/lib/papers/on-policy-correction/figure-1-imitation-crop.webp" alt="Figure 1 右上：专家完整执行记录使模型规划方式变化，与演化后程序的配合受损" width="825" height="285" loading="lazy"></a></div>
    <div class="source-crop figure wide"><b>3. 在学生失败记录上只修一轮 · 原论文局部裁切</b><a href="/lib/papers/on-policy-correction/figure-1-correction-crop.webp" target="_blank" rel="noopener" aria-label="放大局部修正图"><img src="/lib/papers/on-policy-correction/figure-1-correction-crop.webp" alt="Figure 1 右下：定位学生失败的一轮，由专家修正后继续使用原执行程序" width="825" height="235" loading="lazy"></a></div>
  </div>
  <a class="original-link" href="/lib/papers/on-policy-correction/figure-1-coevolution.png" target="_blank" rel="noopener">查看 Figure 1 完整原图</a>
  <figcaption>原论文 Figure 1，CC0 1.0。桌面图仅去除空白边；手机端按程序演化、完整模仿和局部修正分段裁切。红色路径用专家完整记录更新学生；绿色路径从学生失败记录中只修一次回复。</figcaption>
</figure>

论文用一个必要的对照支持这个解释：同样的完整专家模仿方案放回未演化的 `h0` 后，Qwen 从 29.2% 升到 35.5%。专家记录在普通执行程序下有正收益；它与已经适配 Qwen 的 `h*` 组合时，才出现明显退化。

<h2 id="与联合优化、Harness-Zero-和普通局部纠错的区别">2. Related Work：与联合优化、Harness-Zero 和普通局部纠错的区别</h2>

**这篇论文研究的是“先演化 harness、再更新模型”时，模型与 harness 能否继续配合。** 它不移除演化后的执行程序，也不证明修正模型能换用另一套工具；部署仍是修正后的 Qwen 加上原来的 `h*`。

<details class="supplement"><summary>展开：相关路线的逐项对照</summary>
<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>训练时改变什么</th><th>部署时保留什么</th><th>与本文的边界</th></tr></thead>
  <tbody>
    <tr><td>Meta-Harness / Better Harnesses</td><td>搜索提示、工具、调用处理与执行流程</td><td>固定模型 + 演化后程序</td><td>提供上游程序演化；不更新模型权重。</td></tr>
    <tr><td>Co-Harness / WHALE / HarnessForge</td><td>交替或联合优化程序与权重</td><td>最终配合使用的模型与程序</td><td>证明两者可协同；本文专门隔离完整模仿引起的负迁移。</td></tr>
    <tr><td>普通 on-policy expert correction</td><td>在学生实际遇到的状态上请教师接管或续写</td><td>模型 + 固定接口</td><td>本文把同一思想放进围绕特定模型调过的程序，目标是维持二者配合。</td></tr>
    <tr><td>Harness-Zero</td><td>把原专用程序的行为改成目标接口可执行动作后训练模型</td><td>模型 + 更小的目标接口</td><td>Harness-Zero 要移除原专用程序；本文始终保留 <code>h*</code>。</td></tr>
    <tr><td>Grow the Harness</td><td>把重复控制写进可执行代码</td><td>固定模型 + 专用程序</td><td>与本文部署立场接近，但它主要优化可复用代码，不修正模型。</td></tr>
  </tbody>
</table>
</div>
</details>

论文给出的关键反例是：**教师更强、记录全部成功且格式正确，学生仍可能因为执行计划改变而退化。** 这比笼统地说“on-policy 比 off-policy 好”更有信息量。

<h2 id="执行程序演化与修正数据的构造">3. Method：执行程序演化与修正数据的构造</h2>

**先改外层执行程序，再比较两种微调数据：完整专家记录，或只修学生记录中定位到的一轮错误回复。**

<h3 id="3-1-七类任务与执行程序演化">3.1 七类任务与执行程序演化</h3>

作者沿用 Yang et al. (2026) 的七类企业任务：考勤与工资审计、预算审批、库存警报、物联网异常检测、Playwright 浏览器自动化、网站管理和代码重构。论文称这些任务有客观验收程序，但未重新列出各划分任务数、逐题验收或原始任务包。

作者对上游环境做了两处修改：在涉及 MCP 工具的任务中，Agent 必须通过工具访问数据，不能直接修改任务数据库；工具调用错误也会交给程序修改模型。论文因此提醒，本文绝对分数不能直接与 Yang et al. 的原结果比较。

每类任务单独演化执行程序，过程如下：

<ol class="process">
  <li><b>1 · ROLLOUT</b><span>Qwen 在当前程序下执行一小批任务。</span></li>
  <li><b>2 · FEEDBACK</b><span>验收判定、执行记录与工具错误交给修改模型。</span></li>
  <li><b>3 · EDIT</b><span>Gemini 修改系统提示，也可增删工具或调用处理。</span></li>
  <li><b>4 · VALIDATE</b><span>只有小批任务表现改善的修改，才进入候选集合。</span></li>
  <li><b>5 · SELECT</b><span>三个随机种子，每类任务预算 $20，单次执行最多 600 秒；按验证分选 <code>h*</code>，同分取较早版本。</span></li>
</ol>

训练和验证划分用于优化程序与模型，测试划分不参与选择。主表报告三次运行的测试成功率均值与 SEM（均值的标准误）。

<h3 id="3-2-完整模仿的数据怎样构造？">3.2 完整模仿的数据怎样构造？</h3>

作者先收集 Gemini 在 `h*` 下得分为 1.0 的完整成功记录，再加入 Qwen 自己的成功轨迹，转换成 Qwen 的消息与工具调用格式后做 LoRA-SFT。主实验对三个独立 LoRA 随机种子（0、101、202）取平均。

训练配置是 rank 16 或 64 取较好结果、训练 2 遍、学习率 `1e-4`、bf16、有效批量为 8。论文未说明 rank 按哪份数据的分数选择。默认序列长度为 49,152 tokens；当超过 5% 训练样本被截断时，作者再训练一个 98,304-token 版本。Adapter 合并为约 57 到 61 GB 的模型权重，在两张 H200 上推理；论文称一次训练少于一小时，不包括收集记录、专家生成和候选选择的全部成本。

<h3 id="3-3-学生失败记录上的局部修正怎样构造？">3.3 学生失败记录上的局部修正怎样构造？</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/on-policy-correction/reading-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/on-policy-correction/reading-method.svg" alt="根据原论文 Appendix B 绘制的正文方法图；正文纵向阅读图" width="600" height="1177"></a><figcaption>根据原论文 Appendix B 绘制的正文方法图。</figcaption></figure>

作者改从 Qwen 在 `h*` 下的失败记录出发。自动定位程序找出一轮导致失败的回复与工具调用；**论文没有定义“最早错误”的搜索算法**。Gemini 看到任务说明、截至该轮的执行记录和失败检查点，只输出“一句修正策略 + 修正后的工具调用”。每个位置采样三个候选，再由质量评分者选一个。

<div class="code-scroll"><pre><code># Article reconstruction from Appendix B, not official code.
def make_training_example(student_rollout, failed_checkpoint):
    turn = failure_localizer.locate_failing_turn(
        rollout=student_rollout,
        checkpoint=failed_checkpoint,
    )
    candidates = [
        expert.rewrite_only_this_turn(
            task=student_rollout.task,
            prefix=student_rollout.before(turn),
            failed_checkpoint=failed_checkpoint,
        )
        for _ in range(3)
    ]
    correction = quality_judge.select_best(candidates)
    return student_rollout.replace(turn, correction)
</code></pre></div>

最终训练集约 500 条：约 400 条局部修正，加约 50 条 Qwen 成功记录；成功样本优先选择同题有时成功、有时失败的情况。论文未解释这些约数剩余的差额，也未公开错误定位提示、质量评分者身份、筛选标准或修正记录的重新执行比例。

**修正后不是重新生成整条成功轨迹。** 按附录描述，作者替换错误回复，其他学生内容保持不变。工具调用改了，后面的环境状态本来可能也会改变；论文没有公开重新执行比例，因此不能把这 400 条都称作“已验证的修正成功轨迹”。质量评分者选出的合理回复，与真实环境重跑后成功，是两层不同证据。

<h3 id="3-4-两条真实失败：验证循环与漏掉筛选">3.4 两条真实失败：验证循环与漏掉筛选</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/on-policy-correction/reading-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/on-policy-correction/reading-case.svg" alt="根据原论文 Appendix D 重绘；正文纵向阅读图" width="600" height="1251"></a><figcaption>根据原论文 Appendix D 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>完整案例重绘图（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/on-policy-correction/cases.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/on-policy-correction/cases.svg" alt="Payroll audit 与 WebArena 的两条 planning failure" width="1400" height="760"></a>
  <figcaption>根据原论文 Appendix D 重绘。两条案例都说明学生学到部分领域知识，但完整模仿改变了它与 harness 配合的执行节奏。</figcaption>
</figure>
</details>

<div class="case">
<h4>Case 1：Payroll audit，算对了却没提交</h4>
<ol>
  <li>任务要求汇总考勤并计算薪资。<code>h*</code> 写清员工级汇总、部门均值的计算，以及先向上取整再乘薪资和最终舍入规则。</li>
  <li>原始 Qwen 按“计算 → 验证一次 → 提交”执行，同一例子的三次执行都在 14 到 20 步内得到 1.0。</li>
  <li>完整模仿后的 Qwen 仍写出了正确部门汇总，说明计算规则已学会。</li>
  <li>它随后把一次检查变成循环：同一视图请求发出 29 次、提示约重读 20 次，78 步内仍没有调用结束工具，因此任务验收给 0。</li>
</ol>
</div>

<div class="case">
<h4>Case 2：WebArena，351 不是 346</h4>
<ol>
  <li>问题询问 Magento Admin 中 Approved（已批准）评论的总数，参考答案是 346。</li>
  <li><code>h*</code> 给出明确过程：找到状态列，筛选 Approved（已批准），读取筛选后的总数，再用结束工具返回。</li>
  <li>原始 Gemma 先筛选再计数，返回 346。</li>
  <li>SFT-imitation 后的 Gemma 进入评论表格后直接读取未筛选的 “351 records found”，跳过筛选并提前提交 351。</li>
</ol>
</div>

这两条是作者选出的真实解释案例，不是随机抽取的错误样本。论文没有公开原始日志和验收代码，本文只能核对 Appendix D 的叙述，不能独立重放。

<h2 id="主结果、失败分类和第二模型验证">4. Experiments：主结果、失败分类和第二模型验证</h2>

**主要增益来自 harness 演化；局部修正避免完整模仿的回退，只比未微调模型再高 1.7 个百分点。**

<h3 id="4-1-主结果：harness-很强，完整模仿七项全退">4.1 主结果：harness 很强，完整模仿七项全退</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/on-policy-correction/reading-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/on-policy-correction/reading-results.svg" alt="根据原论文 Table 1 重绘；失败分类来自 Table 3；正文纵向阅读图" width="600" height="1191"></a><figcaption>根据原论文 Table 1 重绘；失败分类来自 Table 3。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/on-policy-correction/results.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/on-policy-correction/results.svg" alt="Qwen 与 Gemini 在不同 harness 和训练条件下的平均成功率" width="1400" height="760"></a>
  <figcaption>根据原论文 Table 1 重绘。Avg 是七项任务成功率的算术平均；每个单元是三次运行的均值 ± 标准误。</figcaption>
</figure>
</details>

Qwen 从 `h0` 的 29.2±0.61 升到 `h*` 的 78.0±0.97，说明执行程序演化是主要增益来源。Gemini 也能使用这套为 Qwen 演化的 harness，从 84.4±0.85 升到 93.6±0.46，证明 `h*` 不只是 Qwen 能触发的一组脆弱提示。

Gemini 的平均分提高，不代表每项都不退步：Attendance 从 97.4 降到 97.0，Budget 从 97.2 降到 93.2，Refactor 保持 85.0。论文概括的“各任务都不低于原程序”与 Table 1 不符，应以这些逐项数字限定结论。

问题出现在权重更新。Qwen 在 `h*` 下做完整模仿后降到 63.1±0.81，七项任务全部下降，范围是 −4.2 到 −29.9 个百分点。On-policy correction 则达到 79.7±0.67：五项上升，Attendance 与 Budget 分别 −0.4、−0.6，作者将其视为接近饱和条件下的噪声范围。

<details class="supplement"><summary>展开：七项任务逐项变化</summary>
<figure class="figure">
  <a href="/lib/papers/on-policy-correction/task-deltas.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/on-policy-correction/task-deltas.svg" alt="完整模仿与 on-policy correction 在七项任务上的变化" width="1400" height="760"></a>
  <figcaption>根据原论文 Table 1 重绘。图中是相对同一 Qwen + <code>h*</code> 基线的百分点变化；论文没有给出逐任务显著性检验。</figcaption>
</figure>
</details>

<h3 id="4-2-机制证据：计算规则学会了，执行节奏却变差">4.2 机制证据：计算规则学会了，执行节奏却变差</h3>

<details class="supplement"><summary>展开：失败记录分类图</summary>
<figure class="figure">
  <a href="/lib/papers/on-policy-correction/failure-analysis.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/on-policy-correction/failure-analysis.svg" alt="完整模仿和局部修正的 planning 与 knowledge failure 占比" width="1400" height="720"></a>
<figcaption>根据原论文 Table 3 重绘。模型分类器将得分为 0 的失败记录分成六类；图里只显示变化最大的知识与规划两类。</figcaption>
</figure>
</details>

完整模仿后，部门计算规则的使用率从 30.8% 升到 76.1%。Table 3 的分母则是**各条件下得 0 分的失败记录**：其中知识不足占比从 46.2% 降到 44.5%，规划失败占比从 1.1% 跳到 14.6%。局部修正组相应为 43.2% 与 1.8%。这些比例描述失败组成，不能读成全部任务的失败概率。

§3.4 还报告总体失败率 28.9%→26.8%，却没有给出匹配的样本数与聚合方式。它们不是 Table 1 七项平均成功率 78.0%→79.7% 的补数；本文保留这处记账缺口，不把两组统计直接相减或换算。

这组证据与“执行计划改变破坏模型与程序配合”一致，但仍属于行为归因。失败类型由模型分类器判定；论文未报告人工一致率、评分模型、提示或混淆矩阵，因此不能把 14.6% 当成无争议的人工诊断。

<h3 id="4-3-Gemma-复查排除了什么？">4.3 Gemma 复查排除了什么？</h3>

作者在 WebArena 任务上把弱模型换成 Gemma-4-26B-A4B。Harness evolution 让它从 46.7% 升到 55.6%；Gemini 使用同一 harness 时从 71.1% 升到 81.1%；Gemma 做完整模仿后降到 41.1%。这说明退化不只出现在 Qwen-Gemini 组合里，也难以只用表面输出风格不同来解释。

它没有排除更多因素：Gemma 只测了一类任务，仍用同一个专家和同一套 LoRA 方案，也没有比较 DAgger、RL、KL 约束或不同修正范围。

<h2 id="模型升级后应重新检查执行程序兼容性">5. Discussion：模型升级后应重新检查执行程序兼容性</h2>

**升级模型权重后，旧 harness 要重新做兼容性回归测试。** 为某个模型调过的工具规则、子 Agent 分工、重试处理或历史压缩，不保证适合更新后的检查和提交节奏。

收集修正数据时，应先运行当前学生，找出真正导致后续失败的一步，再请专家修正。这样输入的仓库、工具输出和历史更接近学生实际会遇到的情况，而非照搬专家访问的状态。

**采用了某条规则，不等于能顺利完成任务。** 本文完整模仿后的模型更常使用计算规则，却更易陷入循环或提前提交；应同时看任务成功率、循环次数、结束行为和未完成原因。

扩展到 Claude Code／Codex 时，至少比较完整模仿、单步修正与短窗口修正；跨模型版本测试旧 harness；让人工复核定位出的错误；最后在环境里执行修正调用并重新生成后续，确认修改不只在文本上合理。

本文的两个训练组同时改变了学生访问的状态、修正长度、成功与失败样本比例和数据量。还需要在同样的学生状态上，比较专家续写整条后续与单轮修正，并匹配数据量和 LoRA 配置，才能分清收益来自哪些因素。

<h2 id="负结果的价值与局部修正尚未证明的部分">6. Conclusion：负结果的价值与局部修正尚未证明的部分</h2>

**它给出了一个很有价值的负结果：专家成功执行记录也可能是错误的训练单位。** 围绕 78.0→63.1 的异常，作者补了初始程序对照、第二模型家族、新增规则使用统计、失败分类和两个可读案例。证据比只提出一种新监督微调方案完整得多。

需要保留的限制也很明确：

<div class="limit-grid">
  <div><b>数据和实现没有公开</b><span>论文与 arXiv 页面没有本工作官方代码链接；约 500 条修正数据、错误定位器、质量评分者和逐题日志均不可下载。</span></div>
  <div><b>局部修正的净增益很小</b><span>主结果是 78.0→79.7，只有 +1.7 个百分点。它最强的证据是避免 63.1 的退化，不是大幅超过演化后程序的未微调基线。</span></div>
  <div><b>失败分类依赖模型评分</b><span>论文没有报告人工标注协议、评分者身份、提示或一致率；执行节奏适配解释合理，但还不是因果定论。</span></div>
  <div><b>只测试一个专家模型</b><span>Qwen 和 Gemma 都由 Gemini-3.1-Pro-Preview 提供执行记录或修正，无法判断教师风格是否影响结果。</span></div>
  <div><b>任务来自同一上游任务集合</b><span>七项任务覆盖多种工具交互，但仍是同一企业任务基准；真实大型代码库和多人开发流程未验证。</span></div>
  <div><b>没有完整多轮共同演化结果</b><span>Figure 1 画出了下一轮循环，实验主要验证一次程序演化后的一次模型更新。</span></div>
</div>

我的判断是：**这篇论文应该和 Harness-Zero、Multi-Harness RL 一起读。** Harness-Zero 问怎样把行为带离原专用程序，Multi-Harness RL 说明混合多个 harness 不会自动产生可换接口的能力，而本文指出即使继续使用同一个演化后程序，粗暴的完整轨迹模仿也会破坏兼容性。三篇合起来，把“数据在哪套执行程序里产生、来自学生还是专家实际遇到的状态、部署还保留哪套程序”三个问题分开了。

<div class="note"><p>论文为 arXiv:2609.09134v1，arXiv 页面标注 CC0 1.0。本文直接引用 Figure 1 并注明来源，其余图表均根据 Tables 1-3 与 Appendix D 数据重绘。2026-10-20 重查 arXiv 条目与原文，仍无本工作官方代码或修正数据的发布链接；这不等于证明作者没有在其他位置发布未链接的材料。</p></div>

</div>

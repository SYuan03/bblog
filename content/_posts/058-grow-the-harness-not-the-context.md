---
title: "[2026-09-22] Grow the Harness, Not the Context: From Strategy-Free Scaffolds to Reusable Specialist Agents"
permalink: "/posts/论文解读/grow-the-harness-not-the-context.html"
date: "2026-09-29T18:20:00+08:00"
updated: "2026-09-29T18:20:00+08:00"
cover: "/generated-covers/058-grow-the-harness-not-the-context.webp"
description: "从空白 scaffold 出发，如何让失败轨迹长成可复用的 agent harness：逐步拆解 function-level trace、failure window、held-out gate、真实 Repair 31，以及完整的成功率与成本边界。"
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
  - "Program Synthesis"
  - "Web Agent"
  - "Claude Code"
  - "Codex"
---

<style>
html:not([data-theme="dark"]) body:has(.gth-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:44ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.1}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.gth-reading{--column:780px;--green:#2d7466;--blue:#356a9e;--orange:#ad5c34;--red:#a1453f;--violet:#6758a3;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.gth-reading>*{max-width:100%}.gth-reading p,.gth-reading li{text-wrap:pretty}.gth-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.gth-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.gth-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.gth-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.gth-reading .deck-head strong{font-size:.92rem}.gth-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.gth-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.gth-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.gth-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.gth-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.gth-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line-local));background:color-mix(in srgb,var(--violet) 5%,#fff)}.gth-reading .interest b{color:var(--violet);font:750 1.2rem/1 var(--mono)}.gth-reading .interest span{color:var(--soft);font-size:.84rem}
.gth-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.gth-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.gth-reading .metric:last-child{border-right:0}.gth-reading .metric strong{display:block;color:var(--green);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.gth-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.gth-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--green);background:color-mix(in srgb,var(--green) 6%,var(--surface))}.gth-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.gth-reading .keypoints ul{margin:0;padding-left:1.2rem}.gth-reading .keypoints li{margin:.42rem 0}.gth-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--violet);background:var(--surface)}.gth-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.gth-reading .kicker{display:block;margin-bottom:6px;color:var(--violet);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.gth-reading h2{margin-top:3.55rem}.gth-reading h3{margin-top:2.1rem}.gth-reading h4{margin-top:1.7rem}.gth-reading strong{font-weight:750}.gth-reading .table-scroll,.gth-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.gth-reading .table-scroll table{display:table;width:100%;min-width:740px;margin:0;border-collapse:collapse;font:400 .86rem/1.52 var(--sans)}.gth-reading th,.gth-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.gth-reading th{background:color-mix(in srgb,var(--green) 7%,var(--surface))}.gth-reading td:first-child{font-weight:650}.gth-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.gth-reading code{font-size:.92em}
.gth-reading .figure{width:100%;margin:27px 0}.gth-reading .figure img{display:block;width:auto;max-width:100%;max-height:800px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.gth-reading .figure.wide img{max-width:min(1080px,calc(100vw - 42px));margin-left:50%;transform:translateX(-50%)}.gth-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}
.gth-reading .roles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.gth-reading .role{padding:16px;background:#fff}.gth-reading .role b{display:block;margin-bottom:6px;color:var(--green);font:750 .84rem/1.3 var(--mono)}.gth-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.gth-reading .process{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.gth-reading .process li{min-height:145px;padding:12px;background:var(--surface)}.gth-reading .process b{display:block;margin-bottom:7px;color:var(--green);font:750 .72rem/1.3 var(--sans)}.gth-reading .process span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.gth-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.gth-reading .case h4{margin:0 0 8px;font-size:1.12rem}.gth-reading .case ol{padding-left:1.2rem}.gth-reading .case li{margin:.58rem 0}.gth-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.gth-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.gth-reading .verdict strong{display:block;margin-bottom:4px}.gth-reading .verdict .pass strong{color:var(--green)}.gth-reading .verdict .fail strong{color:var(--red)}
.gth-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.gth-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.gth-reading .note p{margin:.34em 0}.gth-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.gth-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.gth-reading .limit-grid>div{padding:17px;background:#fff}.gth-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.gth-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.9rem,8.4vw,2.38rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.gth-reading,.gth-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.gth-reading .source-links a{overflow-wrap:anywhere}.gth-reading .deck-wrap{max-width:100%;overflow:hidden}.gth-reading .metrics{grid-template-columns:1fr 1fr}.gth-reading .metric:nth-child(2){border-right:0}.gth-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.gth-reading .process{grid-template-columns:1fr 1fr}.gth-reading .roles{grid-template-columns:1fr}.gth-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.gth-reading .figure.wide img{max-width:100%;margin-left:auto;transform:none}}
@media(max-width:460px){.gth-reading .process,.gth-reading .verdict,.gth-reading .limit-grid{grid-template-columns:1fr}.gth-reading .part0,.gth-reading .case{padding:17px 15px}.gth-reading .deck-head,.gth-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="gth-reading">

<p class="paper-meta">Laizhen Li, Jiarui Li, Juanjuan Zhao, Kejiang Ye, Ye Li, Cheng-zhong Xu, Xitong Gao · arXiv:2609.26760v2 · 2026-09-24</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.26760">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.26760">论文 PDF</a>
  <a href="https://arxiv.org/html/2609.26760">HTML 全文</a>
</div>

<section class="deck-wrap" aria-label="Grow the Harness 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · 训练循环、Repair 31、judge、完整结果与研究边界</strong><a href="/lib/decks/grow-the-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/grow-the-harness-visual-guide.html" title="Grow the Harness, Not the Context 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">很多 agent harness 把搜索、重试、验证和停止都交给 LLM。即使连续处理的是同一类任务，模型仍要在每条 trajectory 里重新做这些控制判断。Growing Harness 从一个几乎为空的 scaffold 开始，根据失败 trace 修改 harness code，让可重复、可判定的控制逻辑留在程序里，把语义判断继续交给模型。</p>

<div class="interest"><b>博客作者兴趣度 9.6 / 10</b><span>评分仅表示博客作者本人兴趣程度；这篇论文直接研究可复用 specialist harness 如何从任务反馈中长出来</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>5 / 6</strong><span>benchmark × model 设置中平均成功率最高</span></div>
  <div class="metric"><strong>76.0% 至 91.8%</strong><span>相对 Tool-Calling 减少 LLM calls</span></div>
  <div class="metric"><strong>44.7% 至 45.3%</strong><span>WebArena 上 4B 到 120B 的成功率</span></div>
  <div class="metric"><strong>200 / 50 / 50</strong><span>每个 benchmark 的 train / gate / final split</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>论文只更新 harness program。</strong>模型权重和 tool API 在训练期间保持固定，prompt 也不会随着任务一直增长。</li>
    <li><strong>一次 repair 不能只看眼前的一条失败。</strong>Failure window 把多条失败放在一起，促使 optimizer 写出可复用控制，而不是 task-specific patch。</li>
    <li><strong>候选代码要经过两层检查。</strong>它先在当前失败窗口里修够指定数量的任务，再通过 held-out gate；成功率下降就整段回滚。</li>
    <li><strong>成本结论只覆盖部署阶段。</strong>论文排除了 evaluator 和 offline optimizer 的调用成本，因此没有回答训练投入多久才能回本。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先分清 context、tool 和 harness

Context 是某一次任务里送给 LLM 的 prompt、历史动作和 observation。Tool 是模型可调用的外部接口，例如搜索或浏览器操作。Harness 是把这些部分组织起来的可执行程序：它决定何时调用模型、给模型看什么、是否重试、怎样验证，以及何时结束。

论文里的 strategy-free scaffold 只暴露入口、固定模型和固定工具，没有预先写 ReAct loop 或其他 controller。它的初始 <code>main</code> 直接返回空答案。训练过程更新的是程序 <code>h</code>。

<div class="code-scroll"><pre><code># 原论文 Figure 2 的最小 scaffold
def main(task: str, max_llm_calls: int) -&gt; dict:
    return {"final_answer": ""}
</code></pre></div>

“把控制写进代码”也不等于完全移除 LLM。JSON 解析、过滤、重试、预算检查和停止条件可以程序化；理解网页含义、比较证据、形成答案仍需要模型。论文把这个边界称为 code-first, LLM-assisted。
</aside>

## Q1. 为什么要让 harness 增长，而不是继续扩充 context？

**因为同一 task family 会反复需要相似的控制，context 却会在每次任务结束后丢失。** 普通 Tool-Calling agent 每一步都把历史交给模型，让它再次决定搜索什么、是否继续、怎样恢复错误。这样做很灵活，但模型调用、输入 token 和上下文压力都会随 trajectory 增长。

作者提出三个具体要求。第一，训练任务上学到的行为要能复用于同分布的新任务；第二，重复控制要从在线推理移到低成本代码，语义判断仍由 LLM 处理；第三，起点不应预设完整 controller，否则最后得到的结构可能只是手工模板的小修小补。

<figure class="figure wide">
  <img src="/lib/papers/growing-harness/figure-1-success-cost.png" alt="原论文 Figure 1：Growing Harness 在成功率与在线成本上的位置">
  <figcaption>原论文 Figure 1，CC BY 4.0。每个点是三次独立 final-evaluation run 的均值；图中省略的 95% confidence interval 在 Table 1 给出。</figcaption>
</figure>

这项工作的目标不是让一个 harness 适配所有问题。作者为 BrowseComp-Plus 和 WebArena-Verified 分别训练一套 specialist harness；复用范围是同一 task family 内的新任务。

## Q2. 它和 workflow search、skill library、memory 以及其他 harness work 有什么区别？

**最清楚的比较轴是：训练后到底留下什么，以及部署时还要让 LLM 做多少控制。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>持续积累的对象</th><th>部署时怎样运行</th><th>与 Growing Harness 的边界</th></tr></thead>
  <tbody>
    <tr><td>ReAct / Self-Ask / IRCoT</td><td>固定 loop 和当前任务 history</td><td>LLM 在线重做大部分控制判断</td><td>本文把跨任务重复的控制固化为 executable code。</td></tr>
    <tr><td>ExpeL / Agent Workflow Memory</td><td>可检索的文字经验或 workflow</td><td>LLM 取回并解释经验</td><td>本文让积累后的 controller 直接执行。</td></tr>
    <tr><td>Voyager / LATM / CRAFT</td><td>skill 或 tool library</td><td>既有 agent 选择并调用 skill</td><td>本文修改共享 harness 本身，包括主控制流。</td></tr>
    <tr><td>AFlow / ADAS</td><td>代码化 workflow 或 agent design</td><td>运行搜索得到的结构</td><td>本文从失败出发，用 execution trace 限定局部 edit，并持续累积。</td></tr>
    <tr><td>AutoHarness / Meta-Harness</td><td>harness code 或 config</td><td>固定模型运行优化后的 harness</td><td>本文强调 strategy-free 起点、multi-failure repair 和可整段回滚的 held-out gate。</td></tr>
    <tr><td>Harness-Zero</td><td>从 source harness 产生的行为数据</td><td>训练后的模型在更小 target harness 上运行</td><td>Harness-Zero 想移除 source harness；本文保留并部署长出来的 specialist harness。</td></tr>
  </tbody>
</table>
</div>

它和 Meta-Harness 最接近，但解决的问题更窄、更具体：如何让一份不断变大的程序继续从失败中局部修复，同时防止新 patch 破坏旧能力。论文没有训练模型权重，也没有尝试跨 benchmark 共用一套 controller。

## Q3. 一条失败怎样变成可复用的 harness code？

**完整路径是：执行当前 harness，记录 function-level trace，把多条失败放进窗口，局部生成候选代码，重跑失败窗口，再用 held-out gate 决定接受或整段回滚。**

<figure class="figure wide">
  <img src="/lib/papers/growing-harness/figure-2-overview.png" alt="原论文 Figure 2：Growing Harness 的训练循环和 Repair 31">
  <figcaption>原论文 Figure 2，CC BY 4.0。左边是空 scaffold，中间展示 trace-local repair，右边是重新执行、gate 和累积后的 learned harness。</figcaption>
</figure>

### 3.1 Trace 先把失败定位到有限的代码面

每条执行 trace 记录 task、function-call DAG、LLM call、tool call、输入输出、runtime error、最终 verdict 和资源用量。Optimizer 只能修改入口 <code>main</code>、当前失败 trace 实际调用过的函数，以及少量新增 helper。已有但未进入 trace 的函数不能被顺手重写。

这条限制解决了一个实际问题：harness 越长，整份程序交给 optimizer 的搜索空间越大。Function-level trace 把本轮 edit 限制在与失败有直接执行关系的代码上。Edit budget <code>L</code> 继续限制被改函数与新增函数的数量。

训练时，offline optimizer 还会看到 evaluator feedback、retrieved-document identifiers、evidence、action statistics 和 errors。这些诊断信息只用于生成 repair，不会暴露给部署中的 harness。论文因此把“训练监督”和“Agent 执行时可见的信息”分成了两层。

### 3.2 Failure window 让一次 repair 同时解释多条失败

当前 harness 顺序处理 training stream。成功 task 直接离开；失败 task 连同最新 trace 进入容量为 <code>K</code> 的窗口。Optimizer 看到整个窗口，再提出一份完整 candidate harness。Candidate 必须重新跑窗口内所有任务，至少修复 <code>Q</code> 条才进入下一关。

未解决任务会保留新 trace 并累计尝试次数，达到 <code>Rmax</code> 后退出。若一个完整窗口里的任务都耗尽预算，系统恢复到该窗口开始前保存的 checkpoint，防止一串无效 edit 留在程序里。

<figure class="figure">
  <img src="/lib/papers/growing-harness/algorithm-1.png" alt="原论文 Algorithm 1：Growing Harness 的完整训练算法">
  <figcaption>原论文 Algorithm 1，CC BY 4.0。它明确区分 active failure test 与 held-out gate；二者失败时的回滚范围不同。</figcaption>
</figure>

### 3.3 Held-out gate 只守成功率，不拿便宜换退化

Candidate 修过当前窗口后，还要与最近一次 accepted checkpoint 在 50 条 gate tasks 上比较。只有 <code>SR_G(candidate) ≥ SR_G(checkpoint)</code> 才接受。若 gate success 下降，系统会回滚从上个 checkpoint 以来的整个 repair sequence，包括 harness、窗口、task cursor、计数器和元数据。

<div class="formula">Accept h_candidate iff fixed_failures ≥ Q and SR_G(h_candidate) ≥ SR_G(h_checkpoint)</div>

Gate 是 success-first：成本会被记录，但更便宜不能补偿成功率下降。训练结束后，如果最后一段改动还没有经过 gate，系统会再跑一次最终 gate。

### 3.4 Repair 31：答案已经找到，却被 prompt compaction 删掉

<div class="case">
<h4>BrowseComp-Plus Task 819 的完整因果链</h4>
<ol>
  <li><strong>题目来源与可见输入。</strong>这是一条 BrowseComp-Plus training task，要求找出一篇 2013 年访谈里描述某种声音的五个词。Agent 能看到问题、固定 search tool 和自己的执行历史；final split 及答案不会提供给它。</li>
  <li><strong>Search 已经成功。</strong>Harness 找到包含正确引文的材料。正确答案仍保存在 <code>_collection_search_evidence</code> 的输出中：Energetic; melodic; banging; clubby; bacon.</li>
  <li><strong>第一个坏输出来自 prompt 组装。</strong><code>_evidence_for_prompt</code> 把每篇文档截到 2,600 characters，包含答案的片段被切掉。后续 LLM call 从未看见正确证据，最终 <code>final_answer</code> 为空。</li>
  <li><strong>Optimizer 改的是参与失败的函数。</strong>它把上限从 2,600 提到 9,000 characters，把两轮分析放宽到最多四轮，为 final call 预留预算，并加入 targeted search 与 quote-aware judge。</li>
  <li><strong>修复仍需重新执行。</strong>Candidate 先重跑 active window；达到修复阈值后，还要在 held-out gate 上不退化，才能写入共享 harness。</li>
</ol>
<div class="verdict">
  <div class="fail"><strong>原 harness 为什么 FAIL</strong>不是检索不到，而是 compaction 在最后推理前删掉了决定性 quote；模型只能基于不完整 evidence 返回空答案。</div>
  <div class="pass"><strong>Candidate 怎样成为 accepted repair</strong>保留更长 evidence、调整 call budget，并通过 active failures 与 gate 两层执行检查。论文没有公开这条 task 的逐步重放日志。</div>
</div>
</div>

这个 case 也说明 trace-local 的含义：task-level 0/1 只能告诉你失败了；DAG 和中间 I/O 才能区分 search failure、evidence loss 与 final answer failure。

<figure class="figure wide">
  <img src="/lib/papers/growing-harness/figure-6-structures.png" alt="原论文 Figure 6：两个 benchmark 最终学到的 harness 结构">
  <figcaption>原论文 Figure 6，CC BY 4.0。这是作者对 learned code 的 post-hoc abstraction，不是训练前写好的架构。BrowseComp 长成共享检索与证据验证 pipeline；WebArena 长出 deterministic resolver、site-specific routine、通用 browser fallback 和 completion validator。</figcaption>
</figure>

## Q4. Benchmark 怎样分、怎样判，结果到底有多强？

**两个 benchmark 都按 200 train / 50 gate / 50 final 划分，seed 为 42。Final evaluation 每题只有一次 rollout，每个 setting 独立运行三次；论文报告所有 task-run pair 的平均成功率。**

### 4.1 Task、可见边界与 judge

BrowseComp-Plus 是固定且人工核验 retrieval corpus 上的 deep-search benchmark。Agent 看到问题和同一 search tool；Growing Harness、Tool-Calling、Self-Ask、IRCoT 共用 split、工具、模型与预算。最终答案交给 LLM-based equivalence judge 判断语义是否等价。本文没有给出 judge model、prompt 或人工复核率。

WebArena-Verified 是经过审计和修正的 multi-step web benchmark。本文只取 shopping、reddit、map 三类站点，并按 intent template、task type 和 website 分层抽样。所有方法只拿 accessibility-tree text，不用截图；任务结束后运行 benchmark 自带 evaluator。Growing Harness 与 Tool-Calling、WebDreamer、AgentOccam 使用相同 tool API、split、deployment model 和调用上限。

每题最多 50 次 online LLM calls，每次最多输出 8,192 tokens，temperature 1.0，reasoning effort 为 Medium，timeout 1,800 秒。Agent 不会收到“还剩几次调用”的文本提醒，预算由 harness 执行。

### 4.2 指标如何聚合

若 final set 有 50 个 tasks、每个 setting 跑三次，则分母是 150 个 task-run pairs：

<div class="formula">SR = successful task-run pairs / (3 × 50)</div>

不是给同一道题三次机会后取最好结果。Calls、tokens 和 time 在 150 个 task-run pairs 上取平均。Total Online Cost 是一次 50-task run 的 deployed-agent LLM 费用，再对三次 runs 取平均；它排除了 judge 与 offline optimizer。

置信区间使用 task-level cluster bootstrap：重复 10,000 次，每次按 task 有放回抽取 50 个 cluster，并保留该 task 的三次 runs。表里的 <code>±</code> 是 <code>1.96 × bootstrap SE</code>，即 normal-approximation 95% CI half-width，不是标准差。

### 4.3 六组主结果

<div class="table-scroll">
<table>
  <thead><tr><th>Benchmark / model</th><th>Tool-Calling SR</th><th>Growing Harness SR</th><th>Calls</th><th>一次 50-task run 的在线成本</th></tr></thead>
  <tbody>
    <tr><td>BrowseComp / gpt-oss-120b</td><td>40.0 ± 11.6</td><td><strong>49.3 ± 11.7</strong></td><td>32.7 → 6.0</td><td>$6.70 → $0.87</td></tr>
    <tr><td>BrowseComp / gpt-oss-20b</td><td><strong>40.0 ± 11.7</strong></td><td>39.3 ± 12.6</td><td>24.8 → 6.0</td><td>$2.03 → $0.52</td></tr>
    <tr><td>BrowseComp / Qwen3.5-4B</td><td>12.0 ± 7.1</td><td><strong>29.3 ± 11.8</strong></td><td>29.6 → 5.5</td><td>$8.33 → $0.81</td></tr>
    <tr><td>WebArena / gpt-oss-120b</td><td>30.0 ± 11.4</td><td><strong>45.3 ± 13.4</strong></td><td>26.3 → 3.8</td><td>$2.72 → $0.10</td></tr>
    <tr><td>WebArena / gpt-oss-20b</td><td>12.7 ± 7.3</td><td><strong>44.7 ± 13.4</strong></td><td>22.3 → 1.8</td><td>$0.39 → $0.03</td></tr>
    <tr><td>WebArena / Qwen3.5-4B</td><td>6.7 ± 4.9</td><td><strong>45.3 ± 13.4</strong></td><td>37.8 → 5.4</td><td>$7.26 → $0.10</td></tr>
  </tbody>
</table>
</div>

五组设置中，Growing Harness 的平均成功率最高；BrowseComp + gpt-oss-20b 低于 Tool-Calling 0.7 个百分点。相对 Tool-Calling，六组减少 76.0% 至 91.8% 的 LLM calls 和 74.4% 至 98.6% 的 deployed-agent online cost。

WebArena 的结果尤其醒目：模型从 120B 缩到 4B，Growing Harness 仍在 44.7% 至 45.3%；Tool-Calling 则从 30.0% 降到 6.7%。这与“代码承担重复 browser control，小模型保留语义判断”的解释一致。这项实验没有进行跨模型训练：同一 benchmark 的 harness 由指定 training-time model 长出，再换三种 deployment model 评测。

<figure class="figure wide">
  <img src="/lib/papers/growing-harness/figure-5-efficiency.png" alt="原论文 Figure 5：逐任务调用次数、context、成本与 token 对比">
  <figcaption>原论文 Figure 5，CC BY 4.0。以 gpt-oss-20b 为例，逐 task 对比 Tool-Calling 与 Growing Harness；cost 与 token 均排除 judge。</figcaption>
</figure>

### 4.4 Ablation 说明三个机制都有效，但证据强度有限

<figure class="figure wide">
  <img src="/lib/papers/growing-harness/figure-3-convergence.png" alt="原论文 Figure 3：两个 benchmark 上的 gate success 训练曲线">
  <figcaption>原论文 Figure 3，CC BY 4.0。每个点是一次 gate evaluation；两套 harness 的训练超参数不同，曲线不能直接用来比较 benchmark 难度。</figcaption>
</figure>

<figure class="figure wide">
  <img src="/lib/papers/growing-harness/figure-4-ablation.png" alt="原论文 Figure 4：三项核心机制的消融曲线">
  <figcaption>原论文 Figure 4，CC BY 4.0。去掉 gate 后，gate success 一度到 30%，随后退到 16%；完整方法会保留最佳 accepted checkpoint。</figcaption>
</figure>

BrowseComp-Plus + gpt-oss-20b 的 single-run ablation 是：Full 36%，去掉 Failure-Window 为 28%，去掉 Gate Validation 为 22%，去掉 Function-Level Guidance 为 18%。每个 variant 只优化一次、共 10 steps，也没有重复 run 的误差条，因此可以说明组件与这一次训练结果相关，不能当成稳定的效应量。

训练阶段的固定超参数也值得保留：BrowseComp 用 gpt-oss-20b 作为 deployment LLM、GPT-5.6-terra High 作为 optimizer，<code>K=8, Q=1, Rmax=5, L=10</code>；WebArena 用 gpt-oss-120b 与 GPT-5.4 High，<code>K=4, Q=8, Rmax=5, L=10</code>。每一步只生成一个 candidate。

## Q5. 对 Claude Code、Codex 这类完整 harness 有什么启发？

**最值得迁移的是一套变更协议：让生产 harness 的失败可定位、让一次修复覆盖多个同类失败、让每个候选都经过独立回归门禁。**

对 coding agent，可以把 function-call DAG 换成 repository-aware execution trace：记录 prompt module、tool adapter、hook、sub-agent、command、文件 diff、test result 和 timeout。Optimizer 只能改与失败路径有关的 harness module，并保留接口与权限边界。

Failure window 在实践中可以按 failure pattern 组织。例如把“误读测试输出”“反复读取同一文件”“工具错误后丢失状态”分别聚类，再要求一个 patch 至少修复多个仓库中的同型失败。这样更接近论文想得到的 reusable control。

Held-out gate 需要覆盖旧任务家族、不同代码库、权限拒绝、长上下文和不同模型版本。对 Claude Code 或 Codex，成功率相等还不够；生产 gate 还应约束 destructive action、token/call budget、wall time、用户中断和可恢复性。

<div class="note blue"><p><strong>如果沿这条路线继续做论文，我会补三个实验：</strong>第一，比较 whole-harness edit、trace-local edit 和 module-level edit 的样本效率；第二，报告 offline optimizer 总成本与 amortization break-even；第三，把同一 learned harness 交叉部署到不同模型、不同 repo distribution 和模型升级版本，测 portability 与 regression。</p></div>

## Q6. 这篇论文最后该怎样评价？

**论文把“agent 从经验中学习”落到了一个可执行、可回滚的程序更新过程上。** 它从空 controller 开始，给出了清楚的 trace、window、candidate、gate 与 checkpoint 边界；Repair 31 也让读者看到一次 0/1 失败怎样定位到具体函数和具体数据丢失。实验同时报告成功率、调用、token、时间和在线成本，主结论不靠一个单独指标支撑。

还需要保留以下限制：

<div class="limit-grid">
  <div><b>没有公开 learned artifacts</b><span>arXiv 页面和论文没有给出官方代码、learned harness、trace、split、task-level logs 或 optimizer prompts。本文无法独立复跑 Repair 31 和结果表。</span></div>
  <div><b>成本不含训练</b><span>Total Online Cost 明确排除 evaluator 与 offline optimizer。论文证明部署边际成本下降，但没有报告训练总投入和回本点。</span></div>
  <div><b>每个 family 一套 specialist harness</b><span>结果覆盖两个 benchmark，不是一个 controller 跨领域复用；train、gate 与 final 仍来自同一 task family。</span></div>
  <div><b>Judge 透明度不一致</b><span>WebArena 使用 benchmark evaluator；BrowseComp 使用 LLM equivalence judge，但论文没有披露 judge model、prompt、人工一致率或误判分析。</span></div>
  <div><b>Ablation 只有 single run</b><span>36%、28%、22%、18% 都来自一次 10-step optimization，没有 seed variance。</span></div>
  <div><b>生成代码仍需要安全边界</b><span>论文在结论中明确提出 sandbox、permission boundary 和 generated-code validation；实验没有系统评估这些部署风险。</span></div>
</div>

我的判断是：它应该和 Meta-Harness、Harness-of-Harness、Harness-Zero、Multi-Harness RL 一起读。Meta-Harness 关注如何搜索 harness；Harness-of-Harness 关注多日任务中的上层调度；Harness-Zero 研究怎样把 source-harness 行为带到更小 runtime；Multi-Harness RL 讨论跨 harness 训练是否真的带来 portability。Growing Harness 补上的问题是：**当任务会重复到来时，一份 specialist harness 怎样从失败中持续长大，又不把已有能力改坏。**

<div class="note"><p><strong>来源与授权说明：</strong>论文为 arXiv:2609.26760v2，arXiv 页面标注 CC BY 4.0。本文直接引用原论文 Figures 1 至 6 与 Algorithm 1 并逐一注明来源；结果表、消融数字、评测公式与超参数来自 Tables 1 至 5。论文 PDF、HTML、附录和 arXiv metadata 于 2026-09-29 核查；未找到本工作的官方代码或数据发布。</p></div>

</div>

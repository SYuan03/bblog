---
title: "[2026-09-22] Grow the Harness, Not the Context: From Strategy-Free Scaffolds to Reusable Specialist Agents"
permalink: "/posts/论文解读/grow-the-harness-not-the-context.html"
date: "2026-09-29T18:20:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/generated-covers/058-grow-the-harness-not-the-context.webp"
description: "从空程序起步，把失败任务暴露出的重复处理步骤写进代码，供后续任务复用。用论文的 Repair 31 案例说明怎样找出错误、修改函数和验收，并核对成功率与成本的计算范围。"
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
.gth-reading .figure{width:100%;margin:27px 0}.gth-reading .figure img{display:block;width:auto;max-width:100%;max-height:800px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.gth-reading .figure.wide img{width:100%;max-width:100%;margin-inline:auto;transform:none}.gth-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}
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
  <div class="deck-head"><strong>18 页交互图解 · 训练循环、Repair 31、评分、完整结果与研究边界</strong><a href="/lib/decks/grow-the-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/grow-the-harness-visual-guide.html" title="Grow the Harness, Not the Context 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">很多 agent harness 把搜索、重试、验证和停止都交给 LLM。即使连续处理的是同一类任务，模型仍要在每次任务的执行中重新做这些控制判断。Growing Harness 从一个几乎为空的起始程序开始，根据实际失败记录改执行程序，把解析、重试、预算检查等重复逻辑写进代码，理解网页和形成答案仍由模型完成。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读前的几个概念</span>

### 先分清 context、tool 和 harness

Context（上下文）是这次任务送给 LLM 的提示、历史动作和执行反馈。Tool（工具）是模型可调用的外部接口，例如搜索或浏览器操作。Harness 是组织它们的执行程序：它决定何时调用模型、给模型看什么、是否重试、怎样验证，以及何时结束。

Strategy-free scaffold 是“没有预写解题策略的起始程序”：只开放入口、固定模型和工具，没有现成 ReAct（逐步推理—行动）循环或其他控制流程，初始 <code>main</code> 直接返回空答案。这里的“训练”更新程序 <code>h</code>，不是更新模型权重。

Failure window（失败窗口）是容量有限的失败任务清单，保存任务、最新执行记录和修复次数。Held-out gate（验证关卡）是一组不用于产生修改的任务，检查修改有没有破坏旧能力；checkpoint（检查点）保存当时的代码及训练进度，便于完整恢复。后文简称失败窗口、gate 和检查点。

<div class="code-scroll"><pre><code># 原论文 Figure 2 的最小 scaffold
def main(task: str, max_llm_calls: int) -&gt; dict:
    return {"final_answer": ""}
</code></pre></div>

“把控制写进代码”也不等于完全移除 LLM。JSON 解析、过滤、重试、预算检查和停止条件可以程序化；理解网页含义、比较证据、形成答案仍需要模型。论文把这个边界称为 code-first, LLM-assisted。
</aside>

<div class="interest"><b>博客作者兴趣度 9.6 / 10</b><span>评分仅表示博客作者本人兴趣程度；这篇论文直接研究面向同类任务的执行程序怎样根据失败记录改进</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>5 / 6</strong><span>任务基准 × 模型设置中平均成功率最高</span></div>
  <div class="metric"><strong>76.0% 至 91.8%</strong><span>相对 Tool-Calling 减少模型调用</span></div>
  <div class="metric"><strong>44.7% 至 45.3%</strong><span>WebArena 上 4B 到 120B 的成功率</span></div>
  <div class="metric"><strong>200 / 50 / 50</strong><span>每套基准的训练／gate／最终测试题数</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>论文只更新执行程序。</strong>模型权重和工具 API 保持固定，不靠往任务上下文不断追加经验来学习。</li>
    <li><strong>一次修复不能只看眼前的一条失败。</strong>失败窗口同时提供多条失败，让负责修改代码的模型寻找共同原因，不只为当前题写补丁。</li>
    <li><strong>候选代码要重跑当前失败，并按间隔做回归检查。</strong>§3.6 与 Table 5 把 Q 定义为累计修复任务后的 gate 间隔；Algorithm 1 却写成单次修复阈值，两者存在冲突，方法部分明确区分。</li>
    <li><strong>成本结论只覆盖部署阶段。</strong>论文排除了评分与离线修改程序的模型调用成本，因此没有回答训练投入多久才能回本。</li>
  </ul>
</aside>


<h2 id="重复控制为什么应跨任务保留在程序里？">1. Motivation：重复控制为什么应跨任务保留在程序里？</h2>

**因为同类任务反复需要相似的控制，而当前上下文不会自动保留到下一道题。** 普通 Tool-Calling agent 每一步都把历史交给模型，让它再次决定搜索什么、是否继续、怎样恢复错误。这样做很灵活，但模型调用、输入 token 和上下文压力都会随执行记录增长。

作者提出三个具体要求。第一，训练任务上学到的行为要能复用于同分布的新任务；第二，重复控制要从在线推理移到低成本代码，语义判断仍由 LLM 处理；第三，起点不应预设完整控制流程，否则最后得到的结构可能只是手工模板的小修小补。

<figure class="figure wide">
  <a href="/lib/papers/growing-harness/figure-1-success-cost.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/figure-1-success-cost.png" alt="原论文 Figure 1：Growing Harness 在成功率与在线成本上的位置" width="1102" height="611"></a>
  <figcaption>原论文 Figure 1，CC BY 4.0。每个点是三次独立最终测试的均值；图中省略的 95% 置信区间见 Table 1。</figcaption>
</figure>

这项工作的目标不是让一个 harness 适配所有问题。作者为 BrowseComp-Plus 和 WebArena-Verified 分别训练一套专门的执行程序；复用范围是同类的新任务。

<h2 id="与工作流搜索、技能库、记忆和其他执行程序优化的区别">2. Related Work：与工作流搜索、技能库、记忆和其他执行程序优化的区别</h2>

**最清楚的比较轴是：训练后到底留下什么，以及部署时还要让 LLM 做多少控制。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>持续积累的对象</th><th>部署时怎样运行</th><th>与 Growing Harness 的边界</th></tr></thead>
  <tbody>
    <tr><td>ReAct / Self-Ask / IRCoT</td><td>固定交互循环与当前任务历史</td><td>LLM 在线重做大部分控制判断</td><td>本文把跨任务重复的控制写成可执行代码。</td></tr>
    <tr><td>ExpeL / Agent Workflow Memory</td><td>可检索的文字经验或工作流</td><td>LLM 取回并解释经验</td><td>本文让积累后的控制程序直接执行。</td></tr>
    <tr><td>Voyager / LATM / CRAFT</td><td>技能或工具库</td><td>现有 Agent 选择并调用技能</td><td>本文修改共享 harness 本身，包括主控制流。</td></tr>
    <tr><td>AFlow / ADAS</td><td>代码化工作流或 Agent 程序</td><td>运行搜索得到的结构</td><td>本文从失败出发，用实际执行记录限定修改范围，再逐次积累。</td></tr>
    <tr><td>AutoHarness / Meta-Harness</td><td>执行代码或配置</td><td>固定模型运行优化后的 harness</td><td>本文强调无解题策略的起点、多条失败共同修复，以及 gate 未通过时整段回滚。</td></tr>
    <tr><td>Harness-Zero</td><td>专用执行程序产生的行为数据</td><td>训练后的模型在更简单的执行程序上运行</td><td>Harness-Zero 想移除训练用的专用程序；本文保留并部署改进后的专用程序。</td></tr>
  </tbody>
</table>
</div>

它和 Meta-Harness 最接近，但解决的问题更窄、更具体：如何让一份不断变大的程序继续从失败中局部修复，同时防止新补丁破坏旧能力。论文没有训练模型权重，也没有尝试跨任务基准共用一套控制程序。

<h2 id="从失败记录到局部修改，再到完整回归">3. Method：从失败记录到局部修改，再到完整回归</h2>

**完整路径是：运行当前程序，记录函数级执行过程，把多条失败放进窗口，局部修改代码，重跑失败，再按间隔用单独留出的 gate 任务验收。** 以下按 §3.5–3.6 与设置表说明；Algorithm 1 的不同写法另行标出。

<figure class="figure wide">
  <a href="/lib/papers/growing-harness/figure-2-overview.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/figure-2-overview.png" alt="原论文 Figure 2：Growing Harness 的训练循环和 Repair 31" width="1980" height="1530"></a>
  <figcaption>原论文 Figure 2，CC BY 4.0。左边是空起始程序，中间展示怎样定位参与失败的函数并修改，右边是重新执行、gate 与累积后的程序。</figcaption>
</figure>

<h3 id="3-1-用实际调用的函数限定修改范围">3.1 用实际调用的函数限定修改范围</h3>

每条 trace（执行记录）包含任务、函数调用 DAG（有向无环图，用父子关系表示谁调用谁）、模型与工具调用、输入输出、运行错误、最终判定和资源用量。负责改代码的模型（optimizer）只能修改入口 <code>main</code>、当前失败记录中实际调用过的函数，以及少量新增辅助函数。已有但未被调用的函数不能顺手重写。

候选必须保留既有函数签名和工具接口，不能删除函数，也不能把题目 ID、参考答案或固定解法硬写进去。被修改的函数与新增函数合计最多 <code>L=10</code> 个。程序先通过语法、入口、接口、修改范围和数量检查，再运行任务；这些约束不是由任务成功率代替的。

这条限制解决了一个实际问题：harness 越长，把整份程序交给修改模型，可选择的改法就越多。函数级执行记录把修改限制在与失败直接相关的代码上；修改预算 <code>L</code> 再限制被改和新增函数的总数。

训练时，离线修改模型还会看到评分反馈、检索文档标识、证据、动作统计和报错。这些诊断信息只用于生成修改，不会暴露给部署中的 harness。论文因此把“训练监督”和“Agent 执行时可见的信息”分成了两层。

<h3 id="3-2-多条失败一起检查，已修任务退出窗口">3.2 多条失败一起检查，已修任务退出窗口</h3>

当前 harness 顺序处理训练任务。直接成功的任务不进入修复；失败任务与最新执行记录进入容量为 <code>K</code> 的窗口。修改模型同时看这些失败，生成一份完整候选；候选先通过语法、入口、接口和修改范围检查，再重跑整个窗口。

按 §3.5，合法候选成为临时使用的程序，修好的任务离开窗口，未修好的任务保留新 trace 并增加尝试次数；达到 <code>Rmax</code> 后退出，后续失败补进窗口。开始优化完整窗口前保存进度；若整窗都耗尽尝试仍没有修复，则恢复窗口开始前状态。论文没有公开代码，候选未修好任何题时的完整接受条件不能靠实现进一步确认。

<figure class="figure">
  <a href="/lib/papers/growing-harness/algorithm-1.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/algorithm-1.png" alt="原论文 Algorithm 1：Growing Harness 的训练伪代码" width="1466" height="1041"></a>
  <figcaption>原论文 Algorithm 1，CC BY 4.0。注意第 11 行把 Q 当作单次窗口修复阈值、第 16 行每次候选立即 gate；这与 §3.5–3.6 和 Table 5 的间隔式验收不一致，不能混成一套流程。</figcaption>
</figure>

<h3 id="3-3-累计修复后做-gate；伪代码与正文定义冲突">3.3 累计修复后做 gate；伪代码与正文定义冲突</h3>

§3.6 先在 50 道 gate 任务上评估初始程序，之后**每累计修复 Q 条任务，再评估当前程序**，与上次已接受的检查点比较：

<div class="formula">累计修复达到 Q → 运行 gate；仅当 SR_G(h_current) ≥ SR_G(h_gate) 才接受整段修改</div>

通过后，当前代码、窗口、任务游标、计数器和训练记录一起成为新检查点；失败则恢复上次 gate 的全部状态，撤销中间整段修复。训练结束时，最后尚未经过 gate 的改动再验收一次。成本只记录，不允许用更便宜抵消成功率下降。

<div class="note"><p><strong>论文内部冲突，不能忽略：</strong>Algorithm 1 把 Q 称为“repair threshold”，要求单个候选在当前窗口修好至少 Q 题，然后立即 gate；§3.6 和 Table 5 则称它为“gate interval”。WebArena 的 <code>K=4、Q=8</code> 最能说明问题：窗口最多四题，不可能一次修好八题。本文采用与设置表一致的累计间隔说明，但并不声称已从代码解决歧义；官方实现与执行日志未公开，精确复现仍需作者澄清。</p></div>

<h3 id="3-4-Repair-31：检索已找到答案，证据却被截断">3.4 Repair 31：检索已找到答案，证据却被截断</h3>

<div class="case">
<h4>BrowseComp-Plus Task 819 的完整因果链</h4>
<ol>
  <li>Figure 2 选取 BrowseComp-Plus 训练题 Task 819，要求找出一篇 2013 年访谈里描述某种声音的五个词。Agent 能看到问题、固定搜索工具和自己的执行历史；参考答案不提供给执行任务的 Agent。</li>
  <li>Harness 已经找到包含正确引文的材料。<code>_collection_search_evidence</code> 的输出保留了五个词：Energetic; melodic; banging; clubby; bacon.</li>
  <li>组装提示的函数 <code>_evidence_for_prompt</code> 把每篇文档截到 2,600 个字符，包含答案的片段被切掉。后续模型调用没有看见正确证据，最终 <code>final_answer</code> 为空。</li>
  <li>修改模型把截断上限从 2,600 提到 9,000 个字符，把两轮分析放宽到最多四轮，同时用 <code>max_rounds ≤ calls_left − 1</code> 为最终回答保留一次调用。它还加入定向搜索与核对原句的判断步骤。</li>
  <li>按论文的验收规则，候选需要重跑当前失败窗口；累计修复达到间隔后，再在 gate 上检查是否退化。Figure 2 展示了问题与改法，没有公开这份候选的每次重跑结果或 gate 分数，不能把图当作独立复现的通过日志。</li>
</ol>
<div class="verdict">
  <div class="fail"><strong>原程序为什么失败</strong>不是检索不到，而是证据压缩在最后推理前删掉了决定性引文；模型没有看见完整证据，返回了空答案。</div>
  <div class="pass"><strong>候选还必须满足什么条件</strong>在重新执行时答对题目，并在相应 gate 检查中不退化。原图说明了预期修复路径；本文没有独立重放这次修复。</div>
</div>
</div>

这个案例也说明为什么要按执行记录定位：任务的 0/1 分数只能告诉你失败了；调用图与中间输入输出才能区分检索失败、证据丢失和最终回答失败。

<figure class="figure wide">
  <a href="/lib/papers/growing-harness/figure-6-structures.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/figure-6-structures.png" alt="原论文 Figure 6：两个 benchmark 最终学到的 harness 结构" width="1171" height="978"></a>
  <figcaption>原论文 Figure 6，CC BY 4.0。这是作者在训练后对最终代码结构的归纳，不是训练前写好的架构。BrowseComp 形成共享检索与证据验证流程；WebArena 形成规则解析、站点专用操作、通用浏览器后备路径与完成状态检查。</figcaption>
</figure>

<h2 id="两套基准的评分、主结果与成本">4. Experiments：两套基准的评分、主结果与成本</h2>

**两项任务基准都留 200 道训练题、50 道验证题和 50 道最终测试题，划分随机种子为 42。每个设置独立测试三轮，每轮每题只尝试一次；报告全部题目与尝试的平均成功率。**

<h3 id="4-1-任务、可见信息与评分">4.1 任务、可见信息与评分</h3>

BrowseComp-Plus 是一套多步检索任务，使用固定、人工核验过的检索语料。Agent 看到问题和相同的搜索工具；Growing Harness、Tool-Calling、Self-Ask、IRCoT 共用任务划分、工具、模型与预算。最终答案由模型判断与参考答案是否语义等价。论文没有给出评分模型、评分提示或人工复核率。

WebArena-Verified 是经过审计和修正的多步网页操作基准。本文只取 shopping、reddit、map 三类站点，按意图模板、任务类型和网站分层抽样。所有方法只看无障碍树文本（accessibility-tree text，用文字表示页面元素），不看截图；任务结束后运行基准自带检查程序。Growing Harness 与 Tool-Calling、WebDreamer、AgentOccam 使用相同工具 API、任务划分、部署模型和调用上限。

最终评测（Table 3）每题最多 50 次模型调用、每次最多输出 8,192 tokens，采样温度 1.0、推理强度为 Medium，超时 1,800 秒。训练阶段（Table 5）则是 BrowseComp 超时 900 秒、WebArena 1,800 秒；不能把训练与最终评测预算混为一谈。Agent 不会收到“还剩几次调用”的文本提醒，预算由 harness 执行。

<h3 id="4-2-指标如何聚合">4.2 指标如何聚合</h3>

最终测试有 50 道题，每种设置独立跑三轮，所以分母是 150 次任务尝试：

<div class="formula">成功率 SR = 成功的任务尝试数 / (3 × 50)</div>

不是给同一道题三次机会后取最好结果。模型调用、token 和时间在这 150 次尝试上取平均。Total Online Cost（在线总费用）是完成一轮 50 题时执行 Agent 的模型费用，再对三轮取平均；不含评分与离线修改程序的费用。

费用根据输入、输出和缓存读取的 token 数乘提供商单价估算。缓存读取量按**同一道任务中**与此前请求共有的最长前缀估算，不假设跨题缓存，也不是实测账单。Table 4 的单价单位是美元／百万 tokens；例如 gpt-oss-120b 的输入、缓存读取、输出分别为 $0.15、$0.075、$0.60。

置信区间按题目成组重抽样（cluster bootstrap）：重复 10,000 次，每次有放回抽 50 道题，并保留每题的三次尝试。表里的 <code>±</code> 是重抽样标准误乘 1.96，即正态近似 95% 置信区间的半宽，不是标准差。

<h3 id="4-3-六组主结果">4.3 六组主结果</h3>

<div class="table-scroll">
<table>
  <thead><tr><th>任务基准／模型</th><th>Tool-Calling SR</th><th>Growing Harness SR</th><th>模型调用</th><th>一轮 50 题的在线费用</th></tr></thead>
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

五组设置中，Growing Harness 的平均成功率最高；BrowseComp + gpt-oss-20b 低于 Tool-Calling 0.7 个百分点。相对 Tool-Calling，六组减少 76.0% 至 91.8% 的模型调用和 74.4% 至 98.6% 的执行模型在线费用。

**平均分排第一，不等于差异已达到统计显著。** 最终测试只有 50 道题，表中的置信区间较宽；论文没有报告逐项配对差值的置信区间或显著性检验。它也没有在每个指标上都胜过所有其他基线：较便宜或较快的方法可能成功率更低。

WebArena 的结果尤其醒目：模型从 120B 缩到 4B，Growing Harness 仍在 44.7% 至 45.3%；Tool-Calling 则从 30.0% 降到 6.7%。这与“代码承担重复网页操作，小模型保留语义判断”的解释一致。这项实验没有进行跨模型训练：每套基准的执行程序由指定模型训练，再换三种部署模型评测。

<figure class="figure wide">
  <a href="/lib/papers/growing-harness/figure-5-efficiency.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/figure-5-efficiency.png" alt="原论文 Figure 5：逐任务调用次数、context、成本与 token 对比" width="1874" height="1010"></a>
  <figcaption>原论文 Figure 5，CC BY 4.0。以 gpt-oss-20b 为例，逐题对比 Tool-Calling 与 Growing Harness；费用与 token 均不含评分。</figcaption>
</figure>

<h3 id="4-4-三项组件消融：方向一致，重复次数不足">4.4 三项组件消融：方向一致，重复次数不足</h3>

<figure class="figure wide">
  <a href="/lib/papers/growing-harness/figure-3-convergence.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/figure-3-convergence.png" alt="原论文 Figure 3：两个 benchmark 上的 gate success 训练曲线" width="623" height="334"></a>
  <figcaption>原论文 Figure 3，CC BY 4.0。每个点是一次 gate 验收；两套程序的训练超参数不同，不能直接用曲线比较任务难度。</figcaption>
</figure>

<figure class="figure wide">
  <a href="/lib/papers/growing-harness/figure-4-ablation.png" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/growing-harness/figure-4-ablation.png" alt="原论文 Figure 4：三项核心机制的消融曲线" width="1188" height="603"></a>
  <figcaption>原论文 Figure 4，CC BY 4.0。去掉 gate 后，gate 成功率一度到 30%，随后退到 16%；完整方法则会保留最佳已接受检查点。</figcaption>
</figure>

BrowseComp-Plus + gpt-oss-20b 的单次消融结果是：完整方法 36%，去掉失败窗口 28%，去掉 gate 验收 22%，去掉函数级修改指引 18%。每种方案只优化一次，共 10 步，没有重复运行的误差条，因此可以说明组件与这一次训练结果相关，不能当成稳定的效应量。

这里有两处容易误读。第一，**Table 2 的分母是 50 道最终测试题，Figure 4 则是另外 50 道 gate 题的训练曲线**；无 gate 方法的 22% 与曲线的 30% → 16% 不是同一组任务。第二，去掉 Function-Level Guidance 时，作者同时去掉函数级执行记录、由记录确定的修改范围，以及函数数量预算 <code>L</code>，允许改整份程序。36% → 18% 不能单独证明“函数定位”贡献了 18 个百分点。

训练阶段的固定超参数也值得保留：BrowseComp 用 gpt-oss-20b 作为实际执行任务的模型、GPT-5.6-terra High 作为修改程序的模型，<code>K=8, Q=1, Rmax=5, L=10</code>；WebArena 用 gpt-oss-120b 与 GPT-5.4 High，<code>K=4, Q=8, Rmax=5, L=10</code>。每步只生成一个候选程序。

<h2 id="局部修复与回归测试应怎样迁移到-coding-harness？">5. Discussion：局部修复与回归测试应怎样迁移到 coding harness？</h2>

**可复用的是局部修改与完整回归的规则，不是照搬有歧义的伪代码。**

对 coding harness，记录提示模块、工具适配代码、调用钩子、子 Agent、命令、文件修改、测试和超时之间的实际调用关系，只改失败路径相关模块。失败窗口也可按“误读测试输出”“重复读文件”“工具报错后丢进度”等类型组织，检验一个修改能否修多个仓库的同类问题。

Gate 要覆盖旧任务、不同代码库、权限拒绝、长上下文和模型升级；生产环境还要限制破坏性操作、运行预算、用户中断与恢复行为。成功率不降低只是最低要求。

后续应比较整份程序重写、函数级局部改动和模块级改动；统计离线优化与评分的总费用，计算需要复用多少次才回本；在不同模型和代码库上交叉部署同一程序，测增益是否保持。

<h2 id="已有证据与复现限制">6. Conclusion：已有证据与复现限制</h2>

**论文把“agent 从经验中学习”落到了一个可执行、可回滚的程序更新过程上。** 它从无解题策略的控制程序开始，说明执行记录怎样定位错误、失败窗口怎样更新、候选何时验收，以及回滚恢复什么；Repair 31 也展示了怎样从 0/1 失败分数定位到具体函数与丢失的引文。实验同时报告成功率、调用、token、时间和在线成本，主结论不靠一个单独指标支撑。

还需要保留以下限制：

<div class="limit-grid">
  <div><b>伪代码与设置存在冲突</b><span>Algorithm 1 的单次修复阈值与 §3.6／Table 5 的 gate 间隔不一致，WebArena K=4、Q=8 下前者不可执行；没有公开代码可进一步消歧。</span></div>
  <div><b>没有公开训练产物</b><span>arXiv 页面和论文没有给出官方代码、最终程序、执行记录、任务划分、逐题日志或修改模型的提示。本文无法独立复跑 Repair 31 和结果表。</span></div>
  <div><b>成本不含训练</b><span>在线总费用明确排除评分与离线修改程序。论文报告部署费用下降，但没有报告训练总投入和回本点。</span></div>
  <div><b>每类任务一套专用程序</b><span>结果覆盖两个任务基准，不是一套控制程序跨领域复用；训练、gate 与最终测试仍属于同类任务。</span></div>
  <div><b>评分透明度不一致</b><span>WebArena 使用基准自带检查；BrowseComp 使用模型判断语义等价，但未披露评分模型、提示、与人类判断的一致率或误判分析。</span></div>
  <div><b>消融每组只跑一次</b><span>36%、28%、22%、18% 都来自一次十步优化，没有不同随机种子的方差。</span></div>
  <div><b>生成代码仍需要安全边界</b><span>论文在结论中明确提出隔离环境、权限限制与生成代码检查；实验没有系统评估这些部署风险。</span></div>
</div>

我的判断是：它应该和 Meta-Harness、Harness-of-Harness、Harness-Zero、Multi-Harness RL 一起读。Meta-Harness 关注如何搜索 harness；Harness-of-Harness 关注多日任务中的上层调度；Harness-Zero 研究怎样把专用程序诱导的行为迁移到更简单的执行环境；Multi-Harness RL 讨论跨执行程序训练是否真的提高部署迁移能力。Growing Harness 补上的问题是：**当任务会重复到来时，一份专用执行程序怎样根据失败持续改进，又不把已有能力改坏。**

<div class="note"><p>来源与授权：论文为 arXiv:2609.26760v2，arXiv 页面标注 CC BY 4.0。本文引用 Figures 1 至 6 与 Algorithm 1 并逐一注明来源；结果、公式与设置来自 Tables 1 至 5。2026-10-14 核查论文主页；主页与论文仍未给出本工作的官方代码或数据链接。上游基准公开，不代表本次训练程序和记录已公开。</p></div>

</div>

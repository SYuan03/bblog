---
title: "[2026-08-31] Learning Where Outcomes Change: Credit-Addressable Reasoning for Multimodal Geometry"
permalink: "/posts/论文解读/learning-where-outcomes-change.html"
date: "2026-10-02T18:30:00+08:00"
updated: "2026-10-02T18:30:00+08:00"
cover: "/generated-covers/059-learning-where-outcomes-change.webp"
description: "Code-CoT 如何把几何推理变成可寻址事件，CE-GRPO 又怎样从同一 prefix 分叉完整 future，用终局差异把 credit 落到真正改变结果的位置。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 17
categories:
  - "论文解读"
tags:
  - "Multimodal Reasoning"
  - "Geometry Reasoning"
  - "Reinforcement Learning"
  - "GRPO"
  - "Credit Assignment"
---

<style>
html:not([data-theme="dark"]) body:has(.car-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:800px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:46ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.1}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.car-reading{--column:800px;--blue:#2c6fa3;--green:#28796d;--orange:#b45f32;--red:#a33f3d;--violet:#6d5aa7;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.car-reading>*{max-width:100%}.car-reading p,.car-reading li{text-wrap:pretty}.car-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.car-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.car-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.car-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.car-reading .deck-head strong{font-size:.92rem}.car-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.car-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.car-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.car-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.car-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.car-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line-local));background:color-mix(in srgb,var(--violet) 5%,#fff)}.car-reading .interest b{color:var(--violet);font:750 1.2rem/1 var(--mono)}.car-reading .interest span{color:var(--soft);font-size:.84rem}
.car-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.car-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.car-reading .metric:last-child{border-right:0}.car-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.car-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.car-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.car-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.car-reading .keypoints ul{margin:0;padding-left:1.2rem}.car-reading .keypoints li{margin:.42rem 0}.car-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--violet);background:var(--surface)}.car-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.car-reading .kicker{display:block;margin-bottom:6px;color:var(--violet);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.car-reading h2{margin-top:3.55rem}.car-reading h3{margin-top:2.1rem}.car-reading h4{margin-top:1.7rem}.car-reading strong{font-weight:750}.car-reading .table-scroll,.car-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.car-reading .table-scroll table{display:table;width:100%;min-width:760px;margin:0;border-collapse:collapse;font:400 .85rem/1.52 var(--sans)}.car-reading th,.car-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.car-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.car-reading td:first-child{font-weight:650}.car-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.car-reading code{font-size:.92em}
.car-reading .figure{width:100%;margin:27px 0}.car-reading .figure img{display:block;width:auto;max-width:100%;max-height:820px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.car-reading .figure.wide img{max-width:min(1120px,calc(100vw - 42px));margin-left:50%;transform:translateX(-50%)}.car-reading .figure figcaption{max-width:740px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}
.car-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.car-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.car-reading .note p{margin:.34em 0}.car-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .88rem/1.7 var(--mono);overflow-x:auto}.car-reading .steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.car-reading .steps li{min-height:150px;padding:13px;background:var(--surface)}.car-reading .steps b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.car-reading .steps span{display:block;color:var(--soft);font-size:.76rem;line-height:1.5}.car-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.car-reading .case h4{margin:0 0 8px;font-size:1.12rem}.car-reading .case ol{padding-left:1.2rem}.car-reading .case li{margin:.58rem 0}.car-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.car-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.car-reading .verdict strong{display:block;margin-bottom:4px}.car-reading .verdict .pass strong{color:var(--green)}.car-reading .verdict .fail strong{color:var(--red)}.car-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.car-reading .limit-grid>div{padding:17px;background:#fff}.car-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.car-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.85rem,8vw,2.34rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.car-reading,.car-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.car-reading .source-links a{overflow-wrap:anywhere}.car-reading .deck-wrap{max-width:100%;overflow:hidden}.car-reading .metrics{grid-template-columns:1fr 1fr}.car-reading .metric:nth-child(2){border-right:0}.car-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.car-reading .steps{grid-template-columns:1fr 1fr}.car-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.car-reading .figure.wide img{max-width:100%;margin-left:auto;transform:none}}
@media(max-width:460px){.car-reading .steps,.car-reading .verdict,.car-reading .limit-grid{grid-template-columns:1fr}.car-reading .part0,.car-reading .case{padding:17px 15px}.car-reading .deck-head,.car-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,1000px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="car-reading">

<p class="paper-meta">Jiani Guo, Junjie Wang, Jie Wu, Pengxiang Zhao, Dongdong Zhang, Shaohan Huang, Yujiu Yang, Furu Wei · arXiv:2608.30457v1 · 最早公开于 2026-08-31</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.30457">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.30457">论文 PDF</a>
  <a href="https://github.com/gjn12-31/CE-GRPO">官方仓库</a>
</div>

<section class="deck-wrap" aria-label="Credit-Addressable Reasoning 交互图解">
  <div class="deck-head"><strong>17 页交互图解 · Code-CoT、CE-GRPO、真实几何 case、结果与证据边界</strong><a href="/lib/decks/credit-addressable-reasoning-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/credit-addressable-reasoning-visual-guide.html" title="Learning Where Outcomes Change 论文图解，共 17 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">这篇论文研究的不是“让模型多写几步”，而是怎样找出真正改变答案的那一步。作者先用 Code-CoT 把图形识别、辅助构造、坐标化和推导写成带类型的 event，再从某个 event 之前固定完整 prefix，采样多个直到最终答案的 future。只要这些 future 的 reward 不同，这个分叉点就提供了局部 credit。</p>

<div class="interest"><b>博客作者兴趣度 8.7 / 10</b><span>评分只表示博客作者本人兴趣程度；方法把结构化推理和 credit assignment 接到了同一个接口上</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>76.04</strong><span>九项 benchmark 的无权平均准确率</span></div>
  <div class="metric"><strong>+3.43 pp</strong><span>相对 trajectory-level GRPO</span></div>
  <div class="metric"><strong>18,302</strong><span>经过程序化过滤的 SFT traces</span></div>
  <div class="metric"><strong>3,270</strong><span>训练前固定采集的 shared prefixes</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>Code-CoT 的价值不只是“用代码画图”。</strong>它把几何操作变成能被 parser 定位、checker 验证、RL 分叉的 event。</li>
    <li><strong>CE-GRPO 仍然用终局 reward。</strong>局部性来自“固定同一 prefix 后比较完整 future”，不是为每一步训练一个 reward model。</li>
    <li><strong>增益主要出现在长依赖任务。</strong>相对 trajectory GRPO，GeoLaux-mini 提升 15.16 个百分点，MM-Math 提升 9.44 个百分点；两项常规 benchmark 反而略低。</li>
    <li><strong>论文可读，但目前不可独立复现。</strong>官方仓库在本文核查时只有 README，没有训练代码、checker、数据处理脚本或 checkpoint。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先理解 trajectory-level GRPO 的问题

标准 GRPO 对同一个问题采样一组完整回答。每条回答拿到终局 reward，再减去组内均值并除以标准差。得到的 advantage 会施加到这条回答的所有生成 token 上。

<div class="formula">A(i) = [R(i) - mean(R)] / [std(R) + δ]</div>

几何推理里，一个对象绑定错误会让后续推导全部建立在错误前提上。Trajectory-level GRPO 只知道“这条回答错了”，无法区分第一个结构错误和后面那些逻辑上自洽、但继承了错误前提的步骤。本文把这个问题拆成两个缺口：自由文本没有稳定的几何事件边界，这是 representation gap；一个终局信号覆盖整条轨迹，这是 credit gap。
</aside>

## Q1. 这篇论文真正想解决什么？

**它想让推理时出现的语义单元，同时成为训练时比较 future 和分配 credit 的位置。** 作者把这条原则叫作 credit-addressable reasoning。

“可寻址”有明确含义。假设一条回答已经完成图像转代码、写好 plan，并生成了若干 `<think>` 和 `<action>`。训练器可以精确找到某个完整 event 的起点，把此前的 image、question 和 response 全部固定为 prefix，再让模型从这里重新生成。这样比较的是“同一状态下换一种决定，会不会改变终局”。

这比直接找 high-entropy token 多了一层语义约束。token 的不确定性可能来自措辞；一个完整的 `<reference>`、`<auxiliary>` 或 `<coordinate>` event 则对应真实几何操作。反过来，只有结构也不够，因为并非每个 event 都值得花四条 rollout。论文让结构决定哪些位置允许分叉，让按 event type 归一化后的 entropy 决定优先级。

### 为什么先做 diagram + code 的对照实验

作者在 MathVerse 的五种视觉依赖版本上比较了四种输入：只给图像 `I`、只给外部模型生成的代码 `C`、图像与代码一起给 `I+C`，以及只给模型自己生成的代码 `C_self`。

六个开源或闭源模型里，`I+C` 都是最好：相对只给图像提升 0.7 到 18.4 个百分点。对三个开源模型，`C_self` 又比 external-code-only 低 11.7 到 16.6 个百分点。这两个结果合起来说明：代码应当补充图像，而不是替代图像；可靠地产生代码也不能只靠一句 prompt。

这个判断被后续主实验再次印证。Qwen3-VL-8B 直接套 Code-CoT prompt，九项平均准确率从 67.95 掉到 49.26；经过 SFT 后才回到 69.55。

## Q2. 它与程序推理和细粒度 credit 方法差在哪里？

**最清楚的比较方式，是同时看“推理用什么结构”和“训练在哪里比较替代方案”。CE-GRPO 的特点是两者共用 Code-CoT event。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>推理表示</th><th>credit 或监督位置</th><th>与本文的边界</th></tr></thead>
  <tbody>
    <tr><td>PAL / ToRA</td><td>程序或 tool call</td><td>主要围绕完整解题轨迹</td><td>它们让计算可执行；本文进一步让 typed event 成为 RL 的分支状态。</td></tr>
    <tr><td>AlphaGeometry / GDP / GeoTikzBridge</td><td>形式语言、符号关系或解析结果</td><td>通常是外部表示或两阶段 pipeline</td><td>Code-CoT 保留原图，在一次 response 内生成 perception code 并继续推理。</td></tr>
    <tr><td>CodePlot-CoT / MathCanvas</td><td>代码生成图像、视觉 action 或动态构造</td><td>中间表示帮助模型继续思考</td><td>本文把结构化 event 明确接入 candidate selection、prefix branching 和 policy loss。</td></tr>
    <tr><td>VinePPO / SPO / high-entropy token</td><td>state、segment 或 token</td><td>用 value、固定 segment 或 token statistics 细分 advantage</td><td>CE-GRPO 先用几何语义结构确定边界，再在同类型 event 内比较 entropy。</td></tr>
    <tr><td>GPO / SRPO / CFPO / GRPO-MA</td><td>critical step、reset state 或 thought branch</td><td>反事实 future 或 thought advantage</td><td>这是最近的一组。本文不使用 process label、learned critic 或 task-specific reward，event 边界直接来自 Code-CoT tag。</td></tr>
  </tbody>
</table>
</div>

这里需要保留一个措辞边界：上表的差异主要来自本文 Related Work 和 baseline adaptation 的定位。官方仓库没有公开这些 baseline 的适配代码，因此无法检查每种方法是否获得了同等程度的工程优化。

## Q3. Code-CoT 怎样把一条几何解题过程变成可检查的事件？

**一次 Code-CoT 回答包含 perception code、一个 plan、若干完整的 reasoning/action event 和最终答案。Parser 依赖 tag 切 event，checker 依赖代码与行号检查 action。**

<figure class="figure wide">
  <img src="/lib/papers/credit-addressable-reasoning/pipeline-redrawn.svg" alt="Code-CoT 与 CE-GRPO 的五步流程">
  <figcaption>根据原论文 Figure 3、Sections 4.1 至 4.4 重绘。蓝色部分是一条回答，橙色部分是训练时新增的 shared-prefix branching。</figcaption>
</figure>

### 一条 response 的固定协议

它从恰好一个 `<perception>` 开始。这里是带行号的可执行 Matplotlib code，记录点、线、标签、角度和长度。后面是一行 `PLAN:`，再交替生成 `<think>` 与三类 action，最后用恰好一个非空 `<answer>` 结束。

三类 action 的职责不同：

- `reference` 在第一次使用某个视觉事实前，引用 perception block 中的原始代码行。Checker 要求行号存在、复制内容一致，而且不超过 8 行。
- `auxiliary` 添加连线、延长线、中点、角平分线、圆、变量等工作对象。新对象必须有具体可执行代码，引用的旧对象必须已存在。
- `coordinate` 建立可执行坐标系，必须调用 `set_frame`，不能使用省略号，所有坐标都要给出具体值。

结构有效的 response 至少要有两个 action。设总 action 数为 `n(Y)`，通过各自类型检查的数量为 `v(Y)`，action-validity rate 是 `v(Y) / n(Y)`。

### 训练数据不是人工逐步标注

SFT 数据来自八个几何数据集。作者先在 question 和 image 两层去除与评测集的重叠，再让 Gemini-3.1-Pro 把图转成 perception code；DeepSeek-V4-Pro 根据问题和 code 合成 plan、events 与 answer。Reference answer 只在合成时做静默一致性检查，不作为 student 输入。

最终保留 18,302 条 trace。每条都要通过结构、代码执行、reference grounding、action validity 和答案正确性检查。论文没有报告人工复核、抽检比例或合成模型之间的一致率，因此这里应理解为 programmatically filtered synthetic supervision，而不是人工标注的 process data。

<div class="table-scroll">
<table>
  <thead><tr><th>来源</th><th>保留样本</th><th>来源</th><th>保留样本</th></tr></thead>
  <tbody><tr><td>MultiMath-Geo</td><td>4,974</td><td>FormalGeo7K</td><td>1,931</td></tr><tr><td>UniGeo</td><td>2,313</td><td>GeoAux</td><td>240</td></tr><tr><td>Geo170K</td><td>816</td><td>GeoSym127K</td><td>1,183</td></tr><tr><td>MultiMath-300K</td><td>4,227</td><td>PGPS9K</td><td>2,618</td></tr></tbody>
</table>
</div>

RL pool 是 11,450 道去重后的原始问题，不带预先合成的 Code-CoT trace。当前 policy 必须在线生成 perception code、events 和答案。它由 GeoSym127K 的 hard/expert、未用于 SFT 的 PGPS9K training samples，以及一个较小的 GeoQA subset 组成。

### Reward 到底怎样算

结构无效直接得到 `-1`。结构有效时：

<div class="formula">R(x,y) = clip(correct(y) + 0.3 × action_valid_rate(y) - Ω(y), -1, 1.3)</div>

`Ω` 包括 duplicated action、repetitive generation 和 answer leakage 三类惩罚。选择题要求 exact option match，数值题容许 1% relative tolerance。答案正确、所有 action 有效且没有惩罚时，reward 达到 1.3。这里没有 learned reward model，但也不能说它完全只靠最终答案，因为 action checker 提供了逐 action 的辅助信号。

### 3.5 CE-GRPO 怎样找出“改变结局”的 event？

**它先挑一个语义上合法、统计上值得试的 event，再固定 event 之前的完整状态，采样四个直到答案的 continuation。只有 sibling futures 的 reward 出现差异，这个位置才产生非零局部 credit。**

### 先选 candidate，不提前贴 critical 标签

每个 event 先计算 token entropy 的均值。由于不同 event type 的熵尺度差异很大，论文在 batch 内按类型做 z-score；采集到的 trace 中，`think` 的平均 raw entropy 大约是 `reference` 的 7.7 倍，直接混排会偏向 think。

Selector 默认选择第一个完整 `<think>`。只有另一条 think 的 type-normalized entropy 高出 1 个标准差以上时，才替换它。第二个候选是 entropy 最高的 action。15% 的概率会把一个候选换成随机 event。离线 selector validation 同时评估这两个候选，正式训练只使用返回的第一个。

### 固定 prefix，再重采完整 future

设候选 event 从位置 `s_c` 开始，prefix 是 `z_c = y[:s_c]`。训练器保留原图、问题和全部 prefix，把它作为 assistant prefill，然后采样 `G=4` 个 continuation。每个 continuation 都必须重新写出候选 event，并一直生成到最终答案。

<div class="formula">A(j | z_c) = [R(z_c ⊕ u_j) - mean(R | z_c)] / [std(R | z_c) + δ]</div>

Prefix 只是条件，不进入 policy loss。Advantage 会更新重新生成的 event 和全部后续 token。若四条 future 得到相同 reward，标准差为 0，这个 group 不提供更新。一次选错位置的主要代价是浪费 rollout，而不是制造一条虚假的局部标签。

正式训练把 11,450 条普通 RL problem 与 11,450 条 counterfactual-prefix row 按 1:1 混合。后者来自 3,270 个固定 prefix，每个最多重复四次。这些 prefix 在 RL 开始前由初始 SFT policy 一次性采集，训练过程中不会随着 policy 更新而刷新。

### 真实 case：错误不是算错，而是把对称性用过了头

<figure class="figure wide">
  <img src="/lib/papers/credit-addressable-reasoning/triangle-case-redrawn.svg" alt="等腰三角形问题中的错误和正确 CE-GRPO 分支">
  <figcaption>根据原论文 Figure 5 和 Appendix C.1 重绘。题设、数值、错误假设和 reward 方向均来自论文；图形布局与说明为本文重画。</figcaption>
</figure>

题目给出等腰三角形 `AB = AC = 13`、`BC = 10`，点 `D` 在 `BC` 上且 `BD = 2`，要求 `AD`。正确答案是 `3√17`。

<div class="case">
<h4>从同一 prefix 出发的两条 future</h4>
<ol>
  <li><strong>共享状态。</strong>模型已经识别 `ABC` 是等腰三角形，并准备求 cevian `AD`。Cevian 指从顶点连到对边任意一点的线段，`D` 并不是中点。</li>
  <li><strong>错误分支。</strong>模型把等腰三角形的对称性过度推广，直接假设 `AD ⟂ BC`。随后按半底边 5 计算，得到 `√(13²-5²)=12`。后面的勾股计算没问题，错在最初的结构假设。</li>
  <li><strong>正确分支。</strong>模型保留 `BD=2`、`DC=8`，用 Stewart 定理：`13²×8 + 13²×2 = 10(AD² + 2×8)`，得到 `AD²=153`，所以 `AD=3√17`。</li>
  <li><strong>怎样形成 credit。</strong>这两条 continuation 共享错误发生前的全部 prefix，却拿到不同终局 reward。CE-GRPO 因此强化能保留 `D` 真实位置的 decision，压低无依据的垂直线或角平分线假设。</li>
</ol>
</div>

下面这段是依据论文公开公式写的说明性伪代码，不是官方实现。官方仓库目前没有训练代码。

<div class="code-scroll"><pre><code>&#35; explanatory pseudocode, adapted from Equations 5-7
def ce_group(image, question, prefix, policy, reward, group_size=4):
    futures = [
        policy.complete(image=image, question=question, assistant_prefill=prefix)
        for _ in range(group_size)
    ]
    rewards = [reward(prefix + future) for future in futures]
    scale = std(rewards) + 1e-6
    advantages = [(r - mean(rewards)) / scale for r in rewards]
    return [(future, advantage) for future, advantage in zip(futures, advantages)]
&#35; prefix tokens are context only; policy loss starts at each regenerated future
</code></pre></div>

如果想验证这道题的几何关系，可以直接运行下面的 Python 3 + Matplotlib 示例。代码由本文根据公开题设编写，不来自作者未公开的 benchmark 或 checker。

<div class="code-scroll"><pre><code>import numpy as np
import matplotlib.pyplot as plt
A = np.array([0.0, 12.0])
B = np.array([-5.0, 0.0])
C = np.array([5.0, 0.0])
D = np.array([-3.0, 0.0])  &#35; BD = 2, DC = 8
for p, q in [(A, B), (A, C), (B, C), (A, D)]:
    plt.plot([p[0], q[0]], [p[1], q[1]], "k-")
print(np.linalg.norm(A-B), np.linalg.norm(A-C))  &#35; 13.0, 13.0
print(np.linalg.norm(A-D))                       &#35; 12.369..., = 3*sqrt(17)
plt.axis("equal")
plt.show()
</code></pre></div>

## Q4. 实验怎样评，结果能支持什么？

**主结果支持“event-localized credit 对长依赖几何推理更有效”，但没有给出重复运行的方差，也没有做到完全等算力比较。**

### 九项 test set 与 judge

论文覆盖四类任务：视觉 grounding、平面几何、辅助构造和 process-level multimodal reasoning。各固定 test set 的样本量是：MathVerse 3,940，VisOnlyQA-Syn 485，VisOnlyQA-Real 295，MathVista-GPS 216，Geometry3K 589，PGPS9K 1,000，GeoQA 754，GeoLaux-mini 330，MM-Math 996。Headline `Avg.` 是九项 accuracy 的无权平均，不按样本量加权。

答案由 Gemini-3.1-Pro-Preview 与 Gemini-2.5-Pro 独立判断 prediction 是否与 reference 等价。两者不一致时重复评审，直到结论一致。Code-CoT 模型只把 `<answer>` 内容交给 judge，其他 baseline 则提交完整 response。论文没有报告初始一致率、重复次数或人工 adjudication。

推理配置也不完全相同。Code-CoT SFT 使用 temperature 0.6、top-p 0.95 和 top-k 20；CE-GRPO 与其他作者训练的 post-training 方法使用 greedy decoding。

### 主结果不能只看 76.04

<figure class="figure wide">
  <img src="/lib/papers/credit-addressable-reasoning/results-redrawn.svg" alt="CE-GRPO 在九项 benchmark 上的结果对比">
  <figcaption>根据原论文 Table 2 重绘。最后一列是本文用表内数值复算的 CE-GRPO 相对 trajectory-level GRPO 差值。</figcaption>
</figure>

CE-GRPO 的九项无权平均是 **76.04**，比 native Qwen3-VL-8B 高 8.09 个百分点，比 Code-CoT SFT 高 6.49，比 trajectory-level GRPO 高 3.43，也比作者实现的最强细粒度 baseline 高 6.73。

增益并不平均。GeoLaux-mini 从 trajectory GRPO 的 75.45 升到 90.61，增加 15.16 个百分点；MM-Math 从 70.88 升到 80.32，增加 9.44。两项更常规的任务下降：VisOnlyQA-Syn 低 0.72，Geometry3K 低 2.89。这个分布与作者的机制解释一致：中间 construction 或 decision 会影响很多后续步骤时，定位 event 更有价值。

与两阶段系统比较时，CE-GRPO 比 `GDP-4B-RL → Qwen3-VL-8B` 的九项平均高 3.07，七项胜出；但 Geometry3K 低 4.42，PGPS9K 低 7.30。单次调用不等于所有任务都更强，关系解析占主导时，专门的第一阶段 parser 仍有优势。

### 三组机制证据

第一，selector ablation 中，random prefix、entropy only、structure only、structure + entropy 的平均分依次为 72.48、72.83、74.26、76.04。组合方法的 unclosed rate 也最低，为 4.73%。不过每个 variant 报的是最佳 validation checkpoint，主表没有误差条。

第二，300 道题的离线 selector validation 共检查每种 selector 的 1,998 个 event。Random 的 `Crit.@2` 是 0.222；structure 是 0.289；structure + entropy 是 0.287。组合方法没有提高命中率，却把每个 critical event 的生成成本从 structure-only 的 85.0k tokens 降到 75.0k，并把平均绝对 reward change 从 0.405 提到 0.409。这更像“结构负责定位，entropy 负责节省预算”，不是 entropy 独自发现关键步骤。

第三，作者把九项任务的平均 event 数与相对 SFT 的增益做回归。CE-GRPO 相对 trajectory GRPO 的 margin 每多一个 event 增加 3.77 个百分点，`r=0.866`，exact `p=0.0016`；leave-one-benchmark-out 的 `p≤0.028`。样本单位只有九个 benchmark，这是一条支持性相关证据，不是因果证明。

### Code 质量也提高了，但 judge 仍是闭源模型

作者从 100 道 MathVerse-TD 问题抽取 perception block。Gemini-3.1-Pro-Preview 先为每张图列一组可见几何事实，再由不知道模型条件的 judge 对每条事实给 1、0.5 或 0 分；渲染失败整题 macro recall 记 0。

Base + prompt、Code-CoT SFT、CE-GRPO 的 macro recall 分别是 55.21、70.16、80.43；render success 是 89%、95%、99%。结果说明训练不只修了 answer tag，也提高了代码可执行性与覆盖几何事实的能力。限制是事实抽取和评分依赖闭源 Gemini，论文没有公开 judge prompt 或人类校准结果。

### 训练成本和公平性边界

CE-GRPO 使用 64 张 A100-80GB、每个 prompt 4 条 rollout；trajectory-level GRPO 使用 8 张 MI300X、每个 prompt 8 条 rollout。二者都做 full-parameter update，学习率都是 `1e-6`，但硬件和每组 rollout 数不同。DPO 与 GPO 只训练 LoRA。论文列出了配置，却没有报告总 token、总 GPU-hours 或 wall-clock，因此无法比较样本效率和训练成本。

## Q5. 对其他推理任务有什么启发？

**方法上的核心贡献很清楚：不要先在 token 上猜“哪一步关键”，先让模型用任务语义写出稳定 event，再让 RL 从 event boundary 比较 future。** 这条设计原则比某个几何 prompt 更有迁移价值。

对其他领域，关键不是照搬 Matplotlib，而是找出能同时满足三件事的表示：推理时自然出现，程序能稳定解析，训练器能在边界处安全截断并继续生成。例如 coding agent 可以把 test、patch、tool call、verification block 定义成 event；科学推理可以把 measurement、assumption、calculation 和 conclusion 定义成 event。之后再验证从这些边界分叉是否真的更容易改变 outcome。

## Q6. 这篇论文该怎样评价？

<div class="limit-grid">
  <div><b>复现缺口</b><span>官方 GitHub revision <code>a6b03dcc</code> 只有 README。没有训练代码、parser、checker、数据构造脚本、prefix 集合、checkpoint 或 task-level predictions。</span></div>
  <div><b>Judge 依赖</b><span>主评测使用两个 Gemini judge，分歧会重复到一致；论文未报告一致率、重试次数、人工复核或 prompt。</span></div>
  <div><b>数据依赖</b><span>SFT trace 由 Gemini-3.1-Pro 与 DeepSeek-V4-Pro 合成。过滤能保证格式和最终答案，却不能证明中间推理没有系统性偏差。</span></div>
  <div><b>静态 prefix</b><span>3,270 个 prefix 只从初始 SFT policy 采一次。Policy 后期访问的状态分布可能已经改变，论文没有比较 online refresh。</span></div>
  <div><b>结果不确定性</b><span>九项主结果没有重复 run、confidence interval 或 task-level prediction。只有 event-count 回归给出统计检验。</span></div>
  <div><b>外部有效性</b><span>全部任务都属于多模态几何。Typed event 是否能稳定迁移到开放式代码、网页操作或科学实验，需要新的结构和 checker。</span></div>
</div>

我会优先做三项后续实验。第一，公开 parser、reward、prefix rows 和逐题 prediction，跑至少三个 training seeds。第二，用相同 rollout token budget 比较 CE-GRPO、trajectory GRPO 和随机 prefix，避免把计算量差异混进方法增益。第三，让 prefix 随 policy 定期刷新，再测静态 prefix 是否在训练后期失配。

最终判断是：**这篇论文给出了一个值得继续做的 credit assignment 接口，也提供了相当完整的论文内实验；但当前公开 artifact 远未达到可复现这些结果的程度。** 如果后续代码补齐，它很适合作为“结构化 reasoning trace + outcome-based RL”的基础工作继续扩展。

</div>

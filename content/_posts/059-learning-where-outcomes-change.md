---
title: "[2026-08-31] Learning Where Outcomes Change: Credit-Addressable Reasoning for Multimodal Geometry"
permalink: "/posts/论文解读/learning-where-outcomes-change.html"
date: "2026-10-02T18:30:00+08:00"
updated: "2026-10-20T07:22:00+08:00"
cover: "/generated-covers/059-learning-where-outcomes-change.webp"
description: "把几何解题过程写成带标签的步骤，固定某一步以前的内容，再从这里生成不同完整解法，用最终分数差训练后半段。结合等腰三角形真实案例，说明数据来源、评分、更新范围与实验限制。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
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
.car-reading .figure{width:100%;margin:27px 0}.car-reading .figure img{display:block;width:auto;max-width:100%;max-height:820px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.car-reading .figure.wide img{width:100%;max-width:100%;margin-inline:auto;transform:none}.car-reading .figure figcaption{max-width:740px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}
.page-paper-reading .prose .car-reading .figure.reading-diagram img{width:100%;max-width:100%}
.car-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.car-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.car-reading .note p{margin:.34em 0}.car-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .88rem/1.7 var(--mono);overflow-x:auto}.car-reading .steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.car-reading .steps li{min-height:150px;padding:13px;background:var(--surface)}.car-reading .steps b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.car-reading .steps span{display:block;color:var(--soft);font-size:.76rem;line-height:1.5}.car-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.car-reading .case h4{margin:0 0 8px;font-size:1.12rem}.car-reading .case ol{padding-left:1.2rem}.car-reading .case li{margin:.58rem 0}.car-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.car-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.car-reading .verdict strong{display:block;margin-bottom:4px}.car-reading .verdict .pass strong{color:var(--green)}.car-reading .verdict .fail strong{color:var(--red)}.car-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.car-reading .limit-grid>div{padding:17px;background:#fff}.car-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.car-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.85rem,8vw,2.34rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.car-reading,.car-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.car-reading .source-links a{overflow-wrap:anywhere}.car-reading .deck-wrap{max-width:100%;overflow:hidden}.car-reading .metrics{grid-template-columns:1fr 1fr}.car-reading .metric:nth-child(2){border-right:0}.car-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.car-reading .steps{grid-template-columns:1fr 1fr}.car-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.car-reading .figure.wide img{max-width:100%;margin-left:auto;transform:none}}
@media(max-width:460px){.car-reading .steps,.car-reading .verdict,.car-reading .limit-grid{grid-template-columns:1fr}.car-reading .part0,.car-reading .case{padding:17px 15px}.car-reading .deck-head,.car-reading .interest{align-items:flex-start;flex-direction:column}}
@media(max-width:700px){.car-reading .post-deck-embed-frame{height:min(75vh,640px);aspect-ratio:auto}}
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
  <div class="deck-head"><strong>18 页交互图解 · 格式、分支训练、几何案例、评分与结果</strong><a href="/lib/decks/credit-addressable-reasoning-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/credit-addressable-reasoning-visual-guide.html" title="Learning Where Outcomes Change 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>每页可上下滚动；使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">一个错误的几何关系，可能让后续每一步计算都沿着错误前提走。这篇论文让模型把识图、辅助构造、坐标化和推导写成带类型标签的步骤，称为 Code-CoT；训练时固定某一步以前的全部内容，从这里生成四条到最终答案的后续。最终分数有差异时，提高较好后续的生成概率、降低较差后续的概率；固定的前半段不更新。这套训练方法叫 CE-GRPO。</p>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 完整回答比较，和从某一步重新比较

标准 GRPO 对同一个问题采样一组完整回答。每条回答拿到最终得分，再减去组内均值并除以标准差。Advantage 表示比同组平均好或差多少，会施加到整条回答的所有生成 token（分词后的文本单元）上。这就是 trajectory-level GRPO，即整条回答级别的更新。

<div class="formula">A(i) = [R(i) - mean(R)] / [std(R) + δ]</div>

几何推理里，一个对象绑定错误会让后续推导全部建立在错误前提上。Trajectory-level GRPO 只知道“这条回答错了”，无法区分第一个结构错误和后面那些逻辑上自洽、但继承了错误前提的步骤。本文把问题拆成两个缺口：自由文本不方便找出完整几何操作的起点；最终分数又无法单独比较某一步的替代方案。

Event 是一个完整、带类型标签的推理或操作步骤。Prefix 是这一步开始前已经生成的全部内容；future／continuation 是从这里重采到答案的后续。Credit assignment 指怎样用最终分数决定哪些生成该被鼓励，不是人工给每步贴对错标签。
</aside>

<div class="interest"><b>博客作者兴趣度 8.7 / 10</b><span>评分只表示博客作者本人兴趣程度；方法把结构化推理和得分分配接到了同一个接口上</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>76.04</strong><span>九项任务基准的平均准确率</span></div>
  <div class="metric"><strong>+3.43 pp</strong><span>相对 trajectory-level GRPO</span></div>
  <div class="metric"><strong>18,302</strong><span>通过程序过滤的监督微调记录</span></div>
  <div class="metric"><strong>3,270</strong><span>训练前固定采集的分支前缀</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li>Code-CoT 把几何操作写成带标签的完整步骤，训练器能找到步骤起点，并从这里生成不同后续。</li>
    <li>CE-GRPO 比较同一前文后的完整后续分数；<strong>更新重新生成的步骤与全部后续</strong>，不为每步另训练评分模型。</li>
    <li>相对整条回答级 GRPO，GeoLaux-mini 提升 15.16 个百分点，MM-Math 提升 9.44 个百分点；VisOnlyQA-Syn 和 Geometry3K 反而略低。</li>
    <li>官方仓库目前只有 README，没有训练代码、验收实现、数据处理脚本或模型权重。</li>
  </ul>
</aside>


<h2 id="同一几何操作，能否同时用来定位和训练？">1. Motivation：同一几何操作，能否同时用来定位和训练？</h2>

**它想让程序找到一个完整几何步骤，再比较从这一步出发的不同解法。** 作者称之为 credit-addressable reasoning：“可寻址”就是能靠标签和边界准确找到生成位置，并从那里继续。

“可寻址”有明确含义。假设一条回答已经完成图像转代码、写好计划，并生成了若干 `<think>` 和 `<action>`。训练器可以精确找到某个完整 event 的起点，把此前的图像、问题与回答全部固定为前缀，再让模型从这里重新生成。这样比较的是“同一状态下换一种决定，会不会改变终局”。

这比直接找 high-entropy token 多了一层语义约束。token 的不确定性可能来自措辞；一个完整的 `<reference>`、`<auxiliary>` 或 `<coordinate>` event 则对应真实几何操作。反过来，只有结构也不够，因为并非每个步骤都值得生成四条后续。论文让结构决定哪些位置允许分叉，让同类型步骤内标准化后的不确定性决定优先级。

<h3 id="为什么先做图像与代码的对照实验">1.1 为什么先做图像与代码的对照实验</h3>

作者在 MathVerse 的五种视觉依赖版本上比较了四种输入：只给图像 `I`、只给外部模型生成的代码 `C`、图像与代码一起给 `I+C`，以及只给模型自己生成的代码 `C_self`。

六个开源或闭源模型里，`I+C` 都是最好：相对只给图像提升 0.7 到 18.4 个百分点。对三个开源模型，`C_self` 又比只给外部模型生成的代码低 11.7 到 16.6 个百分点。这两个结果合起来说明：代码应当补充图像，而不是替代图像；可靠地产生代码也不能只靠一句提示。

这个判断被后续主实验再次印证。Qwen3-VL-8B 直接套 Code-CoT 提示，九项平均准确率从 67.95 掉到 49.26；经过 SFT 后才回到 69.55。

<h2 id="与程序推理和细粒度训练反馈方法的区别">2. Related Work：与程序推理和细粒度训练反馈方法的区别</h2>

**最清楚的比较方式，是同时看“推理用什么结构”和“训练在哪里比较替代方案”。CE-GRPO 的特点是两者共用 Code-CoT event。**

<details><summary>展开相邻方法：推理表示与训练信号的对照</summary>
<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>推理表示</th><th>得分或监督分配位置</th><th>与本文的边界</th></tr></thead>
  <tbody>
    <tr><td>PAL / ToRA</td><td>程序或工具调用</td><td>主要围绕完整解题轨迹</td><td>它们让计算可执行；本文进一步让完整带标签的步骤成为强化学习的分支起点。</td></tr>
    <tr><td>AlphaGeometry / GDP / GeoTikzBridge</td><td>形式语言、符号关系或解析结果</td><td>通常是外部表示或两阶段流程</td><td>Code-CoT 保留原图，在一次回答内生成识图代码并继续推理。</td></tr>
    <tr><td>CodePlot-CoT / MathCanvas</td><td>代码生成图像、视觉操作或动态构造</td><td>中间表示帮助模型继续思考</td><td>本文把完整带标签的步骤作为分支起点；重采后续的分数用于训练全部新生成内容。</td></tr>
    <tr><td>VinePPO / SPO / high-entropy token</td><td>状态、片段或 token</td><td>用价值模型、固定片段或 token 统计细分相对分</td><td>CE-GRPO 先用几何语义结构确定边界，再在同类型步骤内比较不确定性。</td></tr>
    <tr><td>GPO / SRPO / CFPO / GRPO-MA</td><td>关键步骤、重置点或推理分支</td><td>重采后续，比较不同决定的回报</td><td>这是最近的一组。CE-GRPO 不另用逐步标注或价值模型；边界由 Code-CoT 标签确定，但仍使用几何任务评分规则。</td></tr>
  </tbody>
</table>
</div>
</details>

上表按论文相关工作区分方法；主实验比较的是作者在同一 Code-CoT 格式下适配的基线，并非这些方法原论文的全部设置。例如 Table 12 的 GRPO-MA 使用固定的离线分支，**没有 thought-level credit（给每条中间推理单独分配相对得分）**；SRPO 使用离线 self-reset 版本。DPO、GPO 只更新 1.95% 的 LoRA 参数，CE-GRPO 更新完整策略。公开仓库没有这些适配代码，不能把主表写成对各方法完整实现的最终排名。

<h2 id="格式、合成数据、评分与-CE-GRPO-更新">3. Method：格式、合成数据、评分与 CE-GRPO 更新</h2>

**一次 Code-CoT 回答包含识图代码、计划、若干推理／操作步骤和最终答案。** Parser（格式解析程序）按标签找步骤边界，checker（检查程序）按代码与行号核验操作；结构必须由模型生成，不是把原图直接替换成一份标准答案代码。

<figure class="figure wide reading-diagram"><a href="/lib/papers/credit-addressable-reasoning/reading-method.svg" target="_blank" rel="noopener"><picture><source media="(max-width: 600px)" srcset="/lib/papers/credit-addressable-reasoning/reading-method-mobile.svg" width="360" height="531"><img src="/lib/papers/credit-addressable-reasoning/reading-method.svg" alt="Code-CoT 生成带标签的步骤后，CE-GRPO 固定步骤前文并比较四条完整后续" width="900" height="354"></picture></a><figcaption>根据<a href="https://arxiv.org/pdf/2608.30457#page=4">原论文 Figure 3、Sections 4.1 至 4.4</a>重绘；示例 reward 是按公开公式构造，并非模型轨迹。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure wide">
  <a href="/lib/papers/credit-addressable-reasoning/pipeline-redrawn.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/credit-addressable-reasoning/pipeline-redrawn.svg" alt="Code-CoT 与 CE-GRPO 的五步流程" width="1200" height="680"></a>
  <figcaption>根据原论文 Figure 3、Sections 4.1 至 4.4 重绘。蓝色部分是一条回答，橙色部分是训练时新增的固定共同前文再重采后续。</figcaption>
</figure>
</details>

<h3 id="3-1-一条回答的格式">3.1 一条回答的格式</h3>

它从恰好一个 `<perception>` 开始。这里是带行号的可执行 Matplotlib 代码，记录点、线、标签、角度和长度。后面是一行 `PLAN:`，再交替生成 `<think>` 与三类操作，最后用恰好一个非空 `<answer>` 结束。

三类操作的职责不同：

- `reference` 在第一次使用某个视觉事实前，引用识图代码块中的原始代码行。Checker 要求行号存在、复制内容一致，而且不超过 8 行。
- `auxiliary` 添加连线、延长线、中点、角平分线、圆、变量等工作对象。新对象必须有具体可执行代码，引用的旧对象必须已存在。
- `coordinate` 建立可执行坐标系，必须调用 `set_frame`，不能使用省略号，所有坐标都要给出具体值。

结构有效的回答至少要有两个操作。设总操作数为 `n(Y)`，通过各自类型检查的数量为 `v(Y)`，操作有效率是 `v(Y) / n(Y)`。

**引用行号正确，只能证明回答与代码一致，不能证明代码忠实于原图。** Table 8 的 reference 检查是“行存在、复制内容一致、不超过 8 行”；论文没有公开一个进一步判断这些行是否真正支持所声称几何事实的程序。识图代码的视觉准确性另由 Table 4 的模型评分评估，不能用“代码能运行”代替。

<h3 id="3-2-谁合成记录，学生与合成模型各能看到什么">3.2 谁合成记录，学生与合成模型各能看到什么</h3>

SFT 数据来自八个几何数据集。作者先按问题文字和图像去除与评测集的重叠。Gemini-3.1-Pro 接收原图，生成识图代码；DeepSeek-V4-Pro **接收问题、代码和参考答案**，合成计划、步骤与答案。Table 10 要求它只把参考答案用于生成过程中的一致性检查，但这仍意味着合成模型能看到答案，不能写成只在生成后才核验。

接受监督微调的学生模型只收到原图与问题，要自己生成整条记录，包括识图代码；参考答案不作为学生输入。这里没有人工逐步标注，却有强模型生成的完整监督记录，不能等同于“只用问题和最终奖励训练”。

最终保留 18,302 条记录，全部检查结构、代码执行、引用行号与复制内容是否一致、操作是否合法和答案是否正确。论文没有报告人工复核、抽检比例或合成模型之间的一致率。这些程序过滤不能保证原图中的每个事实都被正确转成代码。

<details><summary>展开八个来源数据集的保留样本数</summary>
<div class="table-scroll">
<table>
  <thead><tr><th>来源</th><th>保留样本</th><th>来源</th><th>保留样本</th></tr></thead>
  <tbody><tr><td>MultiMath-Geo</td><td>4,974</td><td>FormalGeo7K</td><td>1,931</td></tr><tr><td>UniGeo</td><td>2,313</td><td>GeoAux</td><td>240</td></tr><tr><td>Geo170K</td><td>816</td><td>GeoSym127K</td><td>1,183</td></tr><tr><td>MultiMath-300K</td><td>4,227</td><td>PGPS9K</td><td>2,618</td></tr></tbody>
</table>
</div>
</details>

强化学习任务池是 11,450 道去重后的原始问题，不带预先合成的 Code-CoT 记录；当前模型必须在线生成识图代码、步骤和答案。它由 GeoSym127K 的 hard/expert、未用于 SFT 的 PGPS9K 训练样本，以及一个较小的 GeoQA 子集组成。

<h3 id="3-3-最终正确性、操作有效率与惩罚">3.3 最终正确性、操作有效率与惩罚</h3>

结构无效直接得到 `-1`。结构有效时：

<div class="formula">R(x,y) = clip(correct(y) + 0.3 × action_valid_rate(y) - Ω(y), -1, 1.3)</div>

`Ω` 包括重复操作、反复重复的文字和答案泄漏三类惩罚。选择题要求选项完全匹配，数值题容许 1% 相对误差。答案正确、所有操作有效且没有惩罚时，最终分达到 1.3。没有另训评分模型，但也不只看最终答案：程序还逐项检查操作是否合法。

论文没有给出三项惩罚的阈值、权重或检测程序，因此目前只能复算公式，不能精确重建完整 reward。即使答案错误，只要操作都有效、无惩罚，也能得到 0.3；一组后续分数不同，不一定意味着答案正确性发生变化。

<h3 id="3-4-选完整步骤，再固定前文重采后续">3.4 选完整步骤，再固定前文重采后续</h3>

**先选择一条完整步骤，固定此前内容，采样四条到答案的后续。四条最终分数不同时，才产生非零组内优势。** 它不要求人工提前标明“这步关键”；所有后续同分，就没有更新信号。

<h3 id="3-5-选择规则：步骤类型、熵和随机探索">3.5 选择规则：步骤类型、熵和随机探索</h3>

每个步骤先计算 token entropy（熵）的均值，衡量模型对下一 token 的不确定程度。由于不同步骤类型的熵尺度差异很大，论文在同一批样本内，按类型减去均值再除以标准差；采集到的记录中，`think` 的平均原始熵大约是 `reference` 的 7.7 倍，直接混排会偏向 think。

这里的熵是用记录的 top-20 候选 token 概率近似计算，不是完整词表的熵。Appendix A.4 未说明剩余概率如何处理，也未说明某类型标准差为 0 时的后备规则。

选择器默认选择第一个完整 `<think>`。只有另一条 think 的同类型标准化后的熵高出 1 个标准差以上时，才替换它。第二个候选是不确定性最高的操作。15% 的概率会把一个候选换成随机步骤。离线选择器验证同时评估这两个候选，正式训练只使用返回的第一个。

<h3 id="3-6-更新范围：前文不动，重新生成的步骤和后续都训练">3.6 更新范围：前文不动，重新生成的步骤和后续都训练</h3>

设候选步骤从位置 `s_c` 开始，prefix 是 `z_c = y[:s_c]`。训练器保留原图、问题和此前回答，将它作为 assistant prefill（模型继续生成前已填好的回答），采样 `G=4` 条后续；每条都要重新写出候选步骤，并一直生成到最终答案。

<div class="formula">A(j | z_c) = [R(z_c ⊕ u_j) - mean(R | z_c)] / [std(R | z_c) + δ]</div>

前缀只作输入，不参与训练损失。相对得分更新重生成的步骤与全部后续 token；四条后续同分时，组内标准差为 0，不提供更新。选错位置主要浪费采样，而不是制造一条虚假的局部标签。

例如同一前文后的四条后续得分为 <code>[1.3, 1.3, 0.3, 0.3]</code>，均值 0.8、总体标准差 0.5，相对得分约为 <code>[+1,+1,−1,−1]</code>。这是按公式构造的示例，不是论文公开分支日志。每条后续的**候选步骤和全部后续 token** 都接受这个优势；不是只更新那个步骤，也不是把末尾正确性直接标成每个中间动作的人工真值。

正式训练把 11,450 条普通强化学习问题与 11,450 条固定前缀样本按 1:1 混合。后者来自 3,270 个固定 prefix，每个最多重复四次。这些 prefix 在 RL 开始前由初始监督微调模型一次性采集，训练中不随模型更新刷新。

两种样本使用同一奖励和 GRPO 目标。概率比裁剪范围是 `[0.8, 1.28]`，不另加 KL 惩罚；每组损失除以这组所有后续的生成 token 总数，而非先让长短回答各占相同权重。普通问题组从头生成，能训练识图代码；前缀组只训练截断后新写的内容。前文在该组中不计损失，不代表共享参数不会被其他组更新。

<h3 id="3-7-真实三角形案例：对称性被用错位置">3.7 真实三角形案例：对称性被用错位置</h3>

<figure class="figure wide reading-diagram"><a href="/lib/papers/credit-addressable-reasoning/reading-case.svg" target="_blank" rel="noopener"><picture><source media="(max-width: 600px)" srcset="/lib/papers/credit-addressable-reasoning/reading-case-mobile.svg" width="360" height="533"><img src="/lib/papers/credit-addressable-reasoning/reading-case.svg" alt="等腰三角形中 D 不在中点；错误地把 AD 当高得到 12，保留 D 的位置得到 3√17" width="900" height="364"></picture></a><figcaption>根据<a href="https://arxiv.org/pdf/2608.30457#page=16">原论文 Figure 5 和 Appendix C.1</a>重绘；图中坐标算式由公开题设推导。论文的 R=−1 还取决于未公开的检查与惩罚。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure wide">
  <a href="/lib/papers/credit-addressable-reasoning/triangle-case-redrawn.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/credit-addressable-reasoning/triangle-case-redrawn.svg" alt="等腰三角形问题中的错误和正确 CE-GRPO 分支" width="1100" height="620"></a>
  <figcaption>根据原论文 Figure 5 和 Appendix C.1 重绘。题设、数值、错误假设和 reward 方向均来自论文；图形布局与说明为本文重画。</figcaption>
</figure>
</details>

题目给出等腰三角形 `AB = AC = 13`、`BC = 10`，点 `D` 在 `BC` 上且 `BD = 2`，要求 `AD`。正确答案是 `3√17`。

这是 Figure 5 与 Appendix C.1 的作者精选案例；论文未给出所属数据集、任务 ID 或完整分支日志。下文几何计算可以独立核对，不能作为作者训练运行的重现。

<div class="case">
<h4>从同一前文出发的两条后续</h4>
<ol>
  <li><strong>共享状态。</strong>模型已经识别 <code>ABC</code> 是等腰三角形，并准备求 cevian <code>AD</code>。Cevian 指从顶点连到对边任意一点的线段，<code>D</code> 并不是中点。</li>
  <li><strong>错误分支。</strong>模型把等腰三角形的对称性过度推广，直接假设 <code>AD ⟂ BC</code>。随后按半底边 5 计算，得到 <code>√(13²-5²)=12</code>。后面的勾股计算没问题，错在最初的结构假设。</li>
  <li><strong>正确分支。</strong>模型保留 <code>BD=2</code>、<code>DC=8</code>，用 Stewart 定理（连接顶点与对边任意点时，关联两侧边、底边分段与这条连线长度）：<code>13²×8 + 13²×2 = 10(AD² + 2×8)</code>，得到 <code>AD²=153</code>，所以 <code>AD=3√17</code>。</li>
  <li><strong>怎样影响参数更新。</strong>这两条后续共享错误前的全部内容，但最终得分不同。CE-GRPO 因此提高保留 <code>D</code> 真实位置的后续概率，压低建立在无依据垂直线或角平分线假设上的后续。</li>
</ol>
</div>

按训练奖励的 1% 数值容差，`12` 相对正确值 `3√17≈12.3693` 的误差约为 **2.986%**，所以答案正确性项应为 0。原图把垂直线分支标成 `R=-1`，但仅凭答案错误无法从公开公式推出这个总分；还需知道结构检查、操作检查和未公开的惩罚。本文只复算数值误差，不把 `-1` 归因于“算错了答案”。

下面这段是依据论文公开公式写的说明性伪代码，不是官方实现。官方仓库目前没有训练代码。

<details><summary>展开 CE-GRPO 四条后续的说明性伪代码</summary>
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
</details>

如果想验证这道题的几何关系，可以直接运行下面的 Python 3 + Matplotlib 示例。代码由本文根据公开题设编写，不来自作者未公开的评测任务或验收实现。

<details><summary>展开 Python 3 + Matplotlib 几何验证示例</summary>
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
</details>

<h2 id="九套测试、主要结果与计算预算">4. Experiments：九套测试、主要结果与计算预算</h2>

**主结果支持“从完整步骤起点重采后续，对长依赖几何推理更有效”，但没有给出重复运行的方差，也没有做到完全等算力比较。**

<h3 id="4-1-九项测试的样本量和评分者">4.1 九项测试的样本量和评分者</h3>

论文覆盖四类任务：核对图像事实、平面几何、辅助构造和多步多模态推理。各固定测试集的样本量是：MathVerse 3,940，VisOnlyQA-Syn 485，VisOnlyQA-Real 295，MathVista-GPS 216，Geometry3K 589，PGPS9K 1,000，GeoQA 754，GeoLaux-mini 330，MM-Math 996。主表 `Avg.` 是九项准确率的算术平均，不按样本量加权。

其中 MathVerse 的 3,940 是 788 道原题的五种输入版本，不是 3,940 道彼此独立的原题。训练 reward 的 1% 数值检查也不能直接当作主表评测器；主表使用下面的双模型答案评审。

答案由 Gemini-3.1-Pro-Preview 与 Gemini-2.5-Pro 独立判断预测答案与参考答案是否等价。两者不一致时重复评审，直到结论一致。Code-CoT 模型只把 `<answer>` 内容交给评分模型，其他基线提交完整回答。论文没有报告初始一致率、重复次数或人工裁决。

推理配置也不完全相同。Code-CoT SFT 使用 temperature 0.6、top-p 0.95 和 top-k 20；CE-GRPO 与作者训练的其他方法，每步都选概率最高的 token，不做随机采样。

<h3 id="4-2-长依赖题收益较大，常规题并非都提高">4.2 长依赖题收益较大，常规题并非都提高</h3>

<figure class="figure wide reading-diagram"><a href="/lib/papers/credit-addressable-reasoning/reading-results.svg" target="_blank" rel="noopener"><picture><source media="(max-width: 600px)" srcset="/lib/papers/credit-addressable-reasoning/reading-results-mobile.svg" width="360" height="406"><img src="/lib/papers/credit-addressable-reasoning/reading-results.svg" alt="CE-GRPO 九项平均比整条回答级 GRPO 高 3.43 个百分点，但两项任务下降" width="900" height="320"></picture></a><figcaption>根据<a href="https://arxiv.org/pdf/2608.30457#page=6">原论文 Table 2</a>重绘；增益由表内 CE-GRPO 与 trajectory-level GRPO 数值复算。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure wide">
  <a href="/lib/papers/credit-addressable-reasoning/results-redrawn.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/credit-addressable-reasoning/results-redrawn.svg" alt="CE-GRPO 在九项 benchmark 上的结果对比" width="1200" height="650"></a>
  <figcaption>根据原论文 Table 2 重绘。最后一列是本文用表内数值复算的 CE-GRPO 相对 trajectory-level GRPO 差值。</figcaption>
</figure>
</details>

CE-GRPO 的九项无权平均是 **76.04**，比原始 Qwen3-VL-8B 高 8.09 个百分点，比 Code-CoT SFT 高 6.49，比 trajectory-level GRPO 高 3.43，也比作者实现的最强细粒度基线高 6.73。

增益并不平均。GeoLaux-mini 从 trajectory GRPO 的 75.45 升到 90.61，增加 15.16 个百分点；MM-Math 从 70.88 升到 80.32，增加 9.44。两项更常规的任务下降：VisOnlyQA-Syn 低 0.72，Geometry3K 低 2.89。这个分布与作者的机制解释一致：中间构造或决定影响很多后续步骤时，定位完整步骤更有价值。

与两阶段系统比较时，CE-GRPO 比 `GDP-4B-RL → Qwen3-VL-8B` 的九项平均高 3.07，七项胜出；但 Geometry3K 低 4.42，PGPS9K 低 7.30。单次调用不等于所有任务都更强，关系解析占主导时，专门的第一阶段 parser 仍有优势。

<h3 id="4-3-排除无效答案后，还剩多少增益？">4.3 排除无效答案后，还剩多少增益？</h3>

Table 6 只在各模型自己的有效结束回答中计算准确率。CE-GRPO 的九项平均是 79.82，整条回答级 GRPO 是 75.92；论文报告差值 3.91（由未舍入数计算，显示值相减为 3.90）。CE-GRPO 的未有效结束比例却略高，4.72% 对 4.22%。这说明平均收益不能全部解释为更会写结束标签。

以 MathVerse 为例，`62.44% / (1 − 5.61%) ≈ 66.15%`，就是 CE-GRPO 的有效回答准确率。**两模型的分母是各自有效的回答，不是同一组题的配对比较**，因此这个对照只能部分排除格式影响。Table 5 的 4.73% 与 Table 6 的 4.72% 还存在 0.01 个百分点的报告差别，本文保留原表数字。

<h3 id="4-4-选择器消融与机制分析">4.4 选择器消融与机制分析</h3>

第一，选择器消融中，随机前缀、只看不确定性、只看结构、结构加不确定性的平均分依次为 72.48、72.83、74.26、76.04。组合方法的未闭合标签比例也最低，为 4.73%。不过各方案报告验证分最高的模型版本，主表没有误差条。

第二，作者在 300 道题上离线验证选择器：每条原回答选两个完整步骤，从各自起点重采到最终答案；新旧回答的最终结果不同，就把这个步骤记为“关键”。`Crit.@2` 是两次选择中至少命中一个关键步骤的回答比例，不是关键步骤占全部步骤的比例。随机选择、只看结构、结构加不确定性分别为 0.222、0.289、0.287。组合方法没有提高命中率，却把每个关键步骤的生成成本从 85.0k token 降到 75.0k，最终分数变化的平均绝对值从 0.405 升到 0.409。这更像“结构负责定位，不确定性帮助节省预算”，不是不确定性独自发现关键步骤。Table 14 另外报告每种选择器检查了 1,998 个步骤，但未说明 300 道题、每条回答两个候选与这个总数之间的采样关系。

第三，作者把九项任务的平均步骤数与相对 SFT 的增益做回归。CE-GRPO 相对整条回答级 GRPO 的分差，每多一个步骤增加 3.77 个百分点，`r=0.866`，精确检验 `p=0.0016`；逐次留出一项任务基准重算后仍有 `p≤0.028`。样本单位只有九个任务基准，这是一条支持性相关证据，不是因果证明。

<h3 id="4-5-识图代码能运行、是否覆盖可见事实？">4.5 识图代码能运行、是否覆盖可见事实？</h3>

作者从 100 道 MathVerse-TD 问题抽取识图代码块。Gemini-3.1-Pro-Preview 先为每张图列一组可见几何事实，再由不知道该记录来自哪种模型条件的评分者对每条事实给 1、0.5 或 0 分；渲染失败整题可见事实覆盖分记 0。

Base + prompt、Code-CoT SFT、CE-GRPO 的平均可见事实覆盖分分别是 55.21、70.16、80.43；渲染成功率是 89%、95%、99%。结果说明训练不只修了答案标签格式，也提高了代码可执行性与覆盖几何事实的能力。限制是事实抽取和评分依赖闭源 Gemini，论文没有公开评分提示或人类校准结果。

<h3 id="4-6-不同硬件与采样数，不能视为等算力">4.6 不同硬件与采样数，不能视为等算力</h3>

CE-GRPO 使用 64 张 A100-80GB、每题 4 条后续；trajectory-level GRPO 使用 8 张 MI300X、每题 8 条回答。二者都做全参数更新，学习率都是 `1e-6`，但硬件和每组采样数不同。DPO 与 GPO 只训练 LoRA。论文列出了配置，却没有报告总 token、总 GPU 小时或实际耗时，因此无法比较样本效率和训练成本。

<h2 id="扩展到其他任务时，需要哪些条件？">5. Discussion：扩展到其他任务时，需要哪些条件？</h2>

**先定义程序能解析的完整操作，再比较从这些操作出发的后续，是本文最值得复用的设计。** 但分支更新仍覆盖全部后续，只是把比较起点移到了语义边界。

扩展到 coding agent 时，可以试把测试、补丁、工具调用和核验写成完整步骤；科学推理可试测量、假设、计算与结论。需要先确认三件事：模型自然地按此格式生成，程序能稳定找到边界，从边界截断后继续不会缺环境状态。然后再做实验看这样的分支是否比随机位置更有效，不能仅凭“结构看起来清楚”推断能提高训练。

<h2 id="已有论文证据与公开实现缺口">6. Conclusion：已有论文证据与公开实现缺口</h2>

**论文内有较完整的实验，公开仓库却只有 README，目前还不能复现训练结果。**

<div class="limit-grid">
  <div><b>复现缺口</b><span>官方 GitHub revision <code>a6b03dcc</code> 只有 README。没有训练代码、格式解析、验收、数据构造、前缀集合、模型权重或逐题预测。</span></div>
  <div><b>Judge 依赖</b><span>主评测使用两个 Gemini 评分模型，分歧会重复到一致；论文未报告一致率、重试次数、人工复核或 prompt。</span></div>
  <div><b>数据与验收依赖</b><span>DeepSeek-V4-Pro 合成时可见参考答案。引用检查只确认代码行一致，不能证明图像事实正确；三类 reward 惩罚也缺少具体规则。</span></div>
  <div><b>静态 prefix</b><span>3,270 个 prefix 只从初始监督微调模型采一次。模型后期遇到的状态分布可能已经改变，论文没有比较训练中重采前缀。</span></div>
  <div><b>结果不确定性</b><span>九项主结果没有重复训练、置信区间或逐题预测。只有步骤数回归给出统计检验。</span></div>
  <div><b>外部有效性</b><span>全部任务都属于多模态几何。带类型步骤是否能稳定迁移到开放式代码、网页操作或科学实验，需要新的结构和验收程序。</span></div>
</div>

我会优先做三项后续实验。第一，公开格式解析、评分实现、分支前缀数据和逐题预测，至少重复三个随机种子的训练。第二，用相同生成 token 预算比较 CE-GRPO、整条执行记录 GRPO 和随机前缀，避免把计算量差异混入方法增益。第三，用更新后的模型定期重采分支前缀，检查固定起点在训练后期是否仍有用。

最终判断是：**这篇论文给出了一个值得继续做的 credit assignment 接口，也提供了相当完整的论文内实验；但当前公开材料远未达到可复现这些结果的程度。** 如果后续代码补齐，它很适合作为“结构化推理记录 + 最终结果强化学习”的基础工作继续扩展。

</div>

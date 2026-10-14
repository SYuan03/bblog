---
title: "[2026-09-21] Harness-Zero: Harness Distillation via Agent-as-Harness"
permalink: "/posts/论文解读/harness-zero.html"
date: "2026-09-28T20:30:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/generated-covers/048-harness-zero.webp"
description: "训练时先审查模型准备执行的下一步，把专用工具与检查规则改写成普通 Bash 动作，再用执行记录微调模型。本文解释审查流程、表格案例、三个领域的评分与蒸馏失败的原因。"
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

<p class="hz-lead">专门设计的工具和检查规则能提高模型完成任务的概率，但上线时往往也得带上整套执行程序。Harness-Zero 先让另一个模型审查“下一步准备做什么”，必要时把专用流程改写成普通 Bash 命令，再实际执行。作者用这些执行记录微调 Qwen3.5-9B；部署时移除审查者，只保留微调模型、固定提示和一个 Bash 工具。</p>

<aside class="hz-part0">
<span class="hz-kicker">PART 0 · READING PRIMER</span>

### 模型输出以后，还需要谁来执行？

模型生成一条回答或工具调用，外面的执行程序负责运行命令、保存文件、把结果送回下一轮。论文称这套程序为 harness。本文把待训练模型称为 student，把每一步的回答与工具调用称为 response；“轨迹”就是这些 response 与实际执行结果的记录。专用 harness 能直接做表格检查，部署用的最小 harness 却只有 Bash，因此检查必须换成 Bash 能运行的脚本。SFT（supervised fine-tuning，监督微调）用保留下来的回复训练模型，使它在相同上下文中更可能生成这些回复。

<div class="hz-objects">
  <div class="hz-object"><b>模型</b><span>根据当前上下文生成下一条回复；待训练模型是 Qwen3.5-9B。</span></div>
  <div class="hz-object"><b>harness</b><span>组织提示、工具、状态和执行循环。它决定模型能做什么，也决定动作如何落到环境里。</span></div>
  <div class="hz-object"><b>任务环境</b><span>保存工作簿、应用状态或化学任务文件的隔离环境；命令结果返回模型。</span></div>
</div>
</aside>

<div class="hz-metrics" aria-label="论文关键结果">
  <div class="hz-metric"><strong>23.3 → 44.3</strong><span>Qwen3.5-9B 三领域得分的算术平均</span></div>
  <div class="hz-metric"><strong>81.1%</strong><span>两个强模型、三个领域的审查模式平均成绩</span></div>
  <div class="hz-metric"><strong>82.3%</strong><span>28 种专用程序诱导的行为，微调后的恢复比例</span></div>
  <div class="hz-metric"><strong>2.4×</strong><span>USPTO 轨迹采集平均延迟</span></div>
</div>

<aside class="hz-keypoints">
  <h3>先记住三个判断</h3>
  <ul>
    <li>每次修正都必须是部署工具能执行的动作。例如专用表格检查要变成 Bash/Python 脚本，不能教模型调用一个上线时不存在的工具。</li>
    <li><strong>采集成功率高，不保证微调后测试成绩高。</strong>审查者拿到标准答案时，采集成功率为 98.6%，微调后仅 15.0%；只给流程指导时，采集成功率为 59.4%，测试达到 30.0%。</li>
    <li><strong>程序化工作流更容易迁移，深领域知识和专用工具更难。</strong>SpreadsheetBench、AppWorld 上蒸馏模型超过 <code>h*</code>；USPTO 上仍低 8 个百分点。</li>
  </ul>
</aside>


<h2 id="专用执行程序的收益，能否保留在模型里？">1. Motivation：专用执行程序的收益，能否保留在模型里？</h2>

**论文想保留专用检查与工作流带来的收益，同时减少部署依赖。** 给模型增加工具、在关键节点检查、保存跨任务经验，都是优化 harness 的常见办法；这些改动没有更新模型参数，部署时通常要继续携带原执行程序。

这会形成两个不太理想的选择。只保留一套通用 harness，模型会失去领域流程和专用工具带来的收益；为不同领域、实例和模型保留多套 harness，又需要持续维护路由、上下文、调用链和兼容性。模型升级以后，原先写死在代码里的假设还可能过时。

Harness-Zero 把目标写成一个明确的迁移问题：训练阶段有一套经过优化的 harness，部署阶段只允许使用固定的最小 harness。论文用三个符号区分它们：

<div class="hz-objects">
  <div class="hz-object"><b>h</b><span>目标 harness。部署时保留；本文只有一个 <code>execute</code> Bash 工具和固定系统提示。</span></div>
  <div class="hz-object"><b>h*</b><span>在训练任务上演化得到的专用程序，包含工具、调用前后处理、技能和记忆。</span></div>
  <div class="hz-object"><b>K</b><span>把 <code>h*</code> 改写成给审查模型读取的私有参考文件；它不直接包裹待训练模型。</span></div>
</div>

难点是工具接口不一致。<code>h*</code> 可能提供部署时不存在的工具，或在模型看不到的地方检查文件、拦截提交。直接模仿这套程序下的记录，可能教会模型调用上线时不存在的工具。论文称之为 action-space mismatch，具体就是“训练时能做的动作，部署时做不了”。

<h2 id="与优化执行程序、联合训练和上下文蒸馏的区别">2. Related Work：与优化执行程序、联合训练和上下文蒸馏的区别</h2>

**最重要的比较是部署时还要保留什么。** Meta-Harness 搜索提示、工具、运行时检查与经验文件，上线时继续使用搜索出的程序。共同优化方法既改模型也改 harness，最终能力仍可能依赖二者的配合。EvoHarness-RL 和 OPHSD 则把训练时额外提供的指导蒸馏进模型；前者部署时仍保留工作区，后者没有完整的多轮工具交互。

<div class="hz-table-scroll">
<table>
  <thead><tr><th>方向</th><th>训练或推理时做什么</th><th>部署时还需要什么</th><th>Harness-Zero 的边界</th></tr></thead>
  <tbody>
    <tr><td>优化执行程序</td><td>搜索更好的提示、工具、流程和调用处理</td><td>优化后的专用 harness</td><td>把已经找到的行为转成训练数据</td></tr>
    <tr><td>模型与执行程序共同演化</td><td>交替或联合更新模型参数与 harness</td><td>通常仍依赖共同优化后的 harness</td><td>部署目标固定为最小 <code>h</code></td></tr>
    <tr><td>训练专有指导蒸馏</td><td>蒸馏检查、规划再执行或外部状态管理</td><td>有的方法仍保留部分外部机制</td><td>处理多轮工具执行，以及训练与部署的工具差异</td></tr>
    <tr><td>Harness-Zero</td><td>用审查模型把 <code>h*</code> 的指导逐步改写成 <code>h</code> 中可执行的 response</td><td>微调模型 + 固定 <code>h</code></td><td>深领域知识和无法写成模型回复的机制仍难迁移</td></tr>
  </tbody>
</table>
</div>

Harness-Zero 把检查移到执行之前：另一个模型先读 student 准备发出的 response，再决定保留还是替换。论文把这个审查角色称为 harnessing agent。它参考专用流程，但替换后的命令必须能由最小 <code>h</code> 执行；生成训练数据时就保证工具接口与部署相同。

<h2 id="从执行前审查，到微调与部署">3. Method：从执行前审查，到微调与部署</h2>

**审查者只能替换下一步，不能私下替模型跑完整个任务。**

<h3 id="3-1-先把-h-改写成-K">3.1 先把 <code>h*</code> 改写成 <code>K</code></h3>

每个领域都先用 Qwen3.5-9B 和最小 <code>h</code> 运行训练题，再让 Kimi K3 在 Kimi Code 中分析失败记录，改进一套所有训练题共享的 <code>h*</code>。这一步共做三轮：每轮只分析上一轮失败的题，提出可复用的工具、检查规则、技能或经验修改；主控模型合并提议，再让同一个学生模型挂载改后的 <code>h*</code> 重跑这些失败题。通过的题退出后续轮次，尚未通过的题进入下一轮。<strong>共享组件不能写入某道题的答案、具体单元格、文件名或只适用于该题的步骤。</strong>Appendix A 明确要求接受这类单题残留失败，而不把它们写成共享规则。

得到 <code>h*</code> 后，作者再把它改写成审查者读取的参考文件 <code>K</code>。原来的专用工具改成 action recipe，也就是用 Bash/Python 完成同类操作的脚本说明；运行时检查改为 review middleware（审查前后的处理代码），只读待执行回复和模型已经看到的结果；技能文件提供流程指导，经验文件提供重复错误的识别规则。

<figure class="hz-figure">
  <a href="/lib/papers/harness-zero/figure-1-overview.png"><img src="/lib/papers/harness-zero/figure-1-overview.png" alt="Harness-Zero 从专用程序演化、逐步审查、监督微调到部署的全流程" width="2158" height="1088"></a>
  <figcaption><strong>论文 Figure 1。</strong>上半部分是 <code>h*</code> 到 <code>K</code> 的改写；中间是每一步 PASS/REPLACE；右侧表示部署时只留下微调后的学生模型与 <code>h</code>。图片来自作者官方仓库，Apache-2.0。</figcaption>
</figure>

<h3 id="3-2-每条回复都先审查，再执行">3.2 每条回复都先审查，再执行</h3>

<ol class="hz-flow" aria-label="Agent-as-harness 轨迹收集流程">
  <li><b>1 · PROPOSE</b><span>学生在 <code>h</code> 下生成尚未执行的 <code>y_t</code>。</span></li>
  <li><b>2 · REVIEW</b><span>审查模型读取可见执行记录、下一步提案和私有 <code>K</code>。</span></li>
  <li><b>3 · DECIDE</b><span>选择 PASS（保留），或 REPLACE（给出完整替代回复）。</span></li>
  <li><b>4 · EXECUTE</b><span>获接受的回复通过目标接口 <code>h</code> 执行。</span></li>
  <li><b>5 · OBSERVE</b><span>命令结果进入学生能看到的执行记录。</span></li>
  <li><b>6 · TRAIN</b><span>用已接受且实际执行的回复做监督微调；部署移除审查者。</span></li>
</ol>

PASS 保留原回复。REPLACE 必须给出一条完整的学生回复，而且只能调用 <code>h</code> 允许的 <code>execute</code>。官方格式检查拒绝三种情况：保留原回复却又附替代内容；要求替换却没有替代内容；替代回复既没有文字也没有工具调用。每次无效提交最多重试三次。

<strong>审查协议逐步作决定，但可以替换多少步另有上限。</strong>Appendix C.2 写明，SpreadsheetBench 和 AppWorld 分别用每题最多 5、3、1 次替换的设置采集轨迹，USPTO 始终最多 5 次。这个上限计算 REPLACE 的次数，不是工具调用总数，也不是最多只审查 5 轮。另有一条代码细节：固定版本 <code>aa63a775</code> 的 <code>HarnessReviewMiddleware</code> 在替换次数耗尽后直接放行后续提案，不再调用审查模型。因此“逐步审查”描述的是论文协议，不能据此假定实际仓库会在预算耗尽后继续付出审查调用成本。

<div class="hz-boundary">
  <div><h4>保留给学生的执行记录</h4><ul><li>任务与固定系统提示</li><li>审查后实际接受的回复</li><li><code>execute</code> 的命令输出与退出码</li><li>此前所有实际执行的反馈</li></ul></div>
  <div class="private"><h4>不进入后续执行记录或 SFT</h4><ul><li>私有参考文件 <code>K</code></li><li>PASS/REPLACE 的理由与组件名</li><li>被拒绝、未执行的原始提案</li><li>审查处理代码的内部提示</li></ul></div>
</div>

被拒绝的原始提案是学生自己生成的，审查者也会读它；上图说的是它不进入<strong>后续保留的执行记录和 SFT 目标</strong>，并非学生从未见过它。SFT 以接受后的模型回复为学习目标，任务提示与工具输出则作为上下文；不会要求模型预测工具输出。

**审查者没有独立访问任务环境的接口，也看不到隐藏答案。** 例如它怀疑某个 Excel 单元格被改坏，不能私下打开文件再把结论交给 student；它必须把检查脚本写进替代 response，交给 student 的 Bash 工具运行。执行结果进入下一轮上下文，student 才能据此继续。这保证训练记录包含真正需要学会的检查动作。

<figure class="figure wide"><a href="/lib/papers/harness-zero/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/harness-zero/body-case.svg" alt="Harness-Zero 将预填单元格检查从专用程序改为学生实际执行动作的流程" width="1000" height="900"></a><figcaption>根据论文 Appendix B.2、Code 1–3 整理。作者展示了这类错误和检查代码，未提供完整任务日志；B7 是说明坐标。预填值检查只能保护示例，不等于整题正确。</figcaption></figure>

<h3 id="3-3-论文的表格示例：保留预填单元格">3.3 论文的表格示例：保留预填单元格</h3>

SpreadsheetBench 的一些任务要求填写指定区域，里面已填了少量示例。模型要从这些示例推断规则和格式，只写空白位置。脚本若对整段区域批量赋值，就可能覆盖示例。Appendix B.2 展示的是这种重复错误及检查代码，并未给出完整任务 ID 和原始模型日志；下文的 <code>B7</code> 用来说明检测输出，不冒充某条实测记录。

<div class="hz-case">
  <h4>同一项保护检查，怎样迁移到学生的行为里</h4>
  <ol>
    <li><strong>原始 <code>h*</code>：</strong><code>prefilled_guard</code> 在学生准备结束时进入隔离工作区，比较输入与输出工作簿的答题区域；原有非公式示例值改了，就拒绝结束。</li>
    <li><strong>改写成 <code>K</code>：</strong>审查代码不再读取工作区，只扫描学生可见的执行记录，寻找“比较过输入和输出”的证据。</li>
    <li><strong>触发 REPLACE：</strong>学生若直接结束，审查模型将结束动作替换为一条普通 <code>execute</code> 命令。命令创建并运行工作簿比较脚本。</li>
    <li><strong>形成监督：</strong>比较结果进入学生下一轮上下文；检查通过才结束；看见被改动的坐标，就先修复。SFT 学到提交前主动比较输入与输出的动作，而非一个部署时不存在的工具名。</li>
  </ol>
  <div class="hz-verdict"><div class="pass"><strong>PASS 轨迹</strong>比较结果显示没有预填单元格变化，学生再提交最终答案。</div><div class="fail"><strong>FAIL 后的修复轨迹</strong>例如输出 <code>FAIL changed cells: ['B7']</code>，学生恢复 B7 并重新运行验证。</div></div>
</div>

下面的代码根据论文 Appendix B.2 / Code 1–3 压缩改写，使用 Python 3 与 openpyxl。它逐格比较输入和输出中的非空、非公式单元格，有改动就返回退出码 1。它只验证“没有覆盖示例”，不验证所有新填值是否正确，更不是 SpreadsheetBench 的完整评分器。

<div class="hz-code-scroll"><pre><code># 在 accepted response 里创建并执行；目标 harness h 只看见一次 Bash execute
python3 - &lt;&lt;'PY' INPUT.xlsx OUTPUT.xlsx B3:B40
import sys, openpyxl
from openpyxl.utils import range_boundaries&#10;
input_path, output_path, cell_range = sys.argv[1:4]
wb_in = openpyxl.load_workbook(input_path)
wb_out = openpyxl.load_workbook(output_path)
ws_in, ws_out = wb_in.active, wb_out.active
min_c, min_r, max_c, max_r = range_boundaries(cell_range)&#10;
changed = []
for row in range(min_r, max_r + 1):
    for col in range(min_c, max_c + 1):
        before = ws_in.cell(row=row, column=col)
        after = ws_out.cell(row=row, column=col)
        if before.value is not None and before.data_type != "f":
            if after.value != before.value:
                changed.append(before.coordinate)&#10;
print("PASS" if not changed else f"FAIL changed cells: {changed}")
raise SystemExit(bool(changed))
PY</code></pre></div>

<h3 id="3-4-轨迹过滤与-SFT">3.4 轨迹过滤与 SFT</h3>

SpreadsheetBench 和 AppWorld 只保留任务分为 1.0 且没有执行异常的尝试；USPTO 保留全部 500 条，使各消融使用同一批题。作者还扫描私有路径、提案文件名、审查提交工具名和内部处理组件名，防止审查者私有信息进入训练数据。替代回复若出现“student proposal”“review”“rewrite”等审查者视角措辞，对应推理 token 不参与训练损失。

最终每个领域单独训练：SpreadsheetBench 487 条轨迹，AppWorld 282 条，USPTO 500 条。模型是 Qwen3.5-9B，采用 LoRA，只训练少量附加参数；rank（低秩矩阵的秩）和 alpha（缩放参数）都是 32。每批 8 条、最大长度 65,536 token，训练 2 遍；峰值学习率为 <code>2e-4</code>，前 5% 步数预热，之后降到 <code>1e-6</code>，随机种子为 42。

<h2 id="三个领域怎样评分，哪些行为真正迁移了？">4. Experiments：三个领域怎样评分，哪些行为真正迁移了？</h2>

**主结果是三个领域各自评分后取算术平均，不是把全部测试任务混在一起。** 下表先说明任务和分母，再区分采集时审查的效果与移除审查者后的效果。

<h3 id="4-1-三个领域与统一部署接口">4.1 三个领域与统一部署接口</h3>

化学任务是单步 retrosynthesis（逆合成预测）：给定目标产物，推测生成它的上一反应步需要哪些前体。SMILES 是用字符串表示分子结构的格式；RDKit 是读取和处理这类分子结构的化学软件库。它能检查一个 SMILES 是否能解析成分子、辅助比较结构，但“能解析”并不等于“这个反应预测正确”。

<div class="hz-table-scroll">
<table>
  <thead><tr><th>领域</th><th>训练 / 测试</th><th>任务与指标</th><th>专用 harness 主要提供什么</th></tr></thead>
  <tbody>
    <tr><td>SpreadsheetBench Verified</td><td>300 / 100</td><td>真实电子表格操作；每题一次尝试的 pass@1</td><td>检查、编辑、保存与验证工作簿的流程</td></tr>
    <tr><td>AppWorld</td><td>147 / 168 道题</td><td>56 个三任务场景；SGC</td><td>API 参数、分页、修改数据后回读验证与完成条件</td></tr>
    <tr><td>USPTO retrosynthesis</td><td>500 / 100</td><td>单步前体预测；每题一次尝试的 pass@1</td><td>反应先验、候选生成、RDKit / SMILES 验证</td></tr>
  </tbody>
</table>
</div>

所有任务通过 Harbor 在 Docker 隔离环境中运行。学生部署接口始终是最小 mini-SWE-agent：一个固定系统提示、一个非空 Bash 命令参数的 <code>execute</code> 工具；每次调用启动新 shell，文件系统状态保留。当前目录和环境变量不跨调用保存。

SpreadsheetBench 和 USPTO 每题尝试一次，通过记 1，失败记 0；100 个测试任务的平均值就是 pass@1。AppWorld 的单题成功要求该题所有检查通过：官方评分代码先调用 <code>evaluate_task</code>，再把 <code>tracker.success</code> 转成 0/1；缺失、损坏的状态快照或评测异常记 0。

AppWorld 报告 SGC（scenario goal completion，场景目标完成率）。同一场景含三道题，评分器对三题的成功值取最小值，<strong>三题都成功才算这个场景成功</strong>。因此 <code>SGC = 100 × 成功场景数 / 56</code>，不是 168 道单题的平均正确率。例如三题得分 <code>[1, 1, 0]</code>，整个场景记 0；Table 2 的 58.9% 对应 <code>33 / 56 × 100 ≈ 58.9%</code>。这个聚合规则已核对 Harness-Zero 的单题评分代码和其固定使用的 AppWorld v0.1.3.post1 的 <code>Metric._compute_metrics</code>。

三个领域的平均分是 <code>(44.0 + 58.9 + 30.0) / 3 = 44.3</code>。表格案例里的“预填保护 PASS”只是内部检查的一项，通过它仍不保证整个任务得 1。

<div class="hz-note blue"><p><strong>官方代码的复现补充。</strong>论文 Appendix E 用“固定提示 + 单个 Bash 工具”描述最小接口；但固定版本 <code>aa63a775</code> 的 AppWorld README 要求使用专门的 <code>AppWorldMinisweAgent</code> 与环境。它在首轮加入 23 条示范、用户身份和应用说明，加上系统提示共 24 条消息。普通 agent 只有系统提示与任务说明两条消息，仓库明确说这种配置会产生无效 AppWorld 分数。两者的工具仍只有 <code>execute</code>，区别在初始上下文和评分前的状态导出，不能把该领域解释成完全没有额外示范。</p></div>

<h3 id="4-2-Agent-as-harness-是否比直接挂载代码更有效？">4.2 Agent-as-harness 是否比直接挂载代码更有效？</h3>

Table 1 在 GPT-5.6 Sol 和 DeepSeek-V4-Pro 上做了三个领域 × 两个模型的六种设置。这里没有训练；同一模型分别扮演学生与审查者，因此提升不能归因于换了更强的教师。

<div class="hz-bars" aria-label="Table 1 平均结果重绘">
  <div class="hz-bar"><span>最小接口 h</span><div class="hz-track"><div class="hz-fill" style="width:68.6%"></div></div><em>68.6</em></div>
  <div class="hz-bar"><span>h + 无指导审查</span><div class="hz-track"><div class="hz-fill orange" style="width:69.2%"></div></div><em>69.2</em></div>
  <div class="hz-bar"><span>直接挂载程序 h*</span><div class="hz-track"><div class="hz-fill" style="width:78.1%"></div></div><em>78.1</em></div>
  <div class="hz-bar"><span>按 K 逐步审查</span><div class="hz-track"><div class="hz-fill green" style="width:81.1%"></div></div><em><strong>81.1</strong></em></div>
</div>

<p class="hz-paper-meta">根据论文 Table 1 重绘；单位为六个设置的平均百分比。空 <code>K</code> 只比 <code>h</code> 高 0.6 分，说明收益来自演化出的指导，而不是只多加一次审查调用。</p>

<h3 id="4-3-蒸馏后，拿掉-h-还能剩多少？">4.3 蒸馏后，拿掉 <code>h*</code> 还能剩多少？</h3>

<div class="hz-table-scroll">
<table>
  <thead><tr><th>设置</th><th>SpreadsheetBench</th><th>AppWorld</th><th>USPTO</th><th>三领域平均</th></tr></thead>
  <tbody>
    <tr><td>原模型 + 最小 <code>h</code></td><td>31.0</td><td>26.8</td><td>12.0</td><td>23.3</td></tr>
    <tr><td>原模型 + 专用 <code>h*</code></td><td>39.0</td><td>48.2</td><td><strong>38.0</strong></td><td>41.7</td></tr>
    <tr><td>原模型 + DeepAgents</td><td>35.0</td><td>19.6</td><td>7.0</td><td>20.5</td></tr>
    <tr><td>原模型 + Claude Code</td><td>31.0</td><td>10.7</td><td>6.0</td><td>15.9</td></tr>
    <tr><td><strong>Harness-Zero + 最小 <code>h</code></strong></td><td><strong>44.0</strong></td><td><strong>58.9</strong></td><td>30.0</td><td><strong>44.3</strong></td></tr>
  </tbody>
</table>
</div>

根据论文 Table 2，三领域平均从 <strong>23.3% 升到 44.3%</strong>，比原模型继续使用 <code>h*</code> 的 41.7% 还高 2.6 分。分领域看则更谨慎：SpreadsheetBench 与 AppWorld 主要依赖可在轨迹中示范的程序化步骤；USPTO 的 <code>h*</code> 还提供反应先验、候选生成和可执行 SMILES 验证，因此微调后模型的 30.0% 仍低于 38.0%。

<h3 id="4-4-为什么成功率最高的轨迹，不一定最适合蒸馏？">4.4 为什么成功率最高的轨迹，不一定最适合蒸馏？</h3>

USPTO 的数据来源消融，是全文最值得看的实验。所有条件都从同一个 Qwen3.5-9B 出发，使用相同 500 个采集任务、相同训练方案，并在 <code>h</code> 下测试。

<div class="hz-table-scroll">
<table>
  <thead><tr><th>数据来源</th><th>采集成功率</th><th>微调后在 <code>h</code> 下的测试 pass@1</th></tr></thead>
  <tbody>
    <tr><td>原模型（未训练）</td><td>—</td><td>12.0</td></tr>
    <tr><td>GPT-5.6 Sol 独立完成任务</td><td>52.0</td><td>12.0</td></tr>
    <tr><td>GPT-5.6 Sol 使用 <code>h*</code></td><td>62.0</td><td><strong>3.0</strong></td></tr>
    <tr><td>Qwen3.5-9B 使用 <code>h*</code></td><td>39.4</td><td>12.0</td></tr>
    <tr><td>空 <code>K</code> 下审查</td><td>44.2</td><td>11.0</td></tr>
    <tr><td>审查者可读标准答案</td><td><strong>98.6</strong></td><td>15.0</td></tr>
    <tr><td><strong>Harness-Zero：审查者使用 <code>K</code></strong></td><td>59.4</td><td><strong>30.0</strong></td></tr>
  </tbody>
</table>
</div>

<p class="hz-paper-meta">根据论文 Table 3 重绘。采集成功率在训练集上测量；最右列才是蒸馏后模型在独立测试集、最小 <code>h</code> 下的成绩。</p>

直接蒸馏 <code>h*</code> 轨迹的失败最能说明 action-space mismatch：模型学会了部署时不存在的专用工具调用，大量尝试耗尽轮数上限。审查者直接看到标准答案，则容易提供只对当前题有效的捷径。<code>K</code> 没有答案，提供的是“先枚举候选、再用图结构和化学规则过滤、最后验证输出”的可复用程序。

<h3 id="4-5-82-3-的行为恢复率怎么算？">4.5 82.3% 的行为恢复率怎么算？</h3>

作者为 <code>h*</code> 中的每条记忆、技能、工具或调用处理规则写了确定性的行为检测程序。对每种行为，只保留这样的测试题：原模型在 <code>h*</code> 下出现该行为，在 <code>h</code> 下不出现；能暴露该行为的题目少于 10 时，丢弃该行为。最终得到 SpreadsheetBench 18 种、USPTO 6 种、AppWorld 4 种。

<div class="hz-formula">行为恢复率 = 蒸馏模型表现出该行为的题数 / 能暴露该行为差异的题数</div>

28 种行为的平均恢复率为 <strong>82.3%</strong>。例如“保护预填单元格”是 24/26（92%），“读取完整分页”是 21/53（40%），“用 RDKit 验证”是 60/60（100%）。这里不能把 82.3% 当成自然任务分布上的总体行为准确率：样本筛选已使原模型 + <code>h</code> 为 0%、原模型 + <code>h*</code> 为 100%。它测的是蒸馏能否在专门挑出的“只有专用程序能触发该行为”的场景里恢复行为。

<figure class="figure wide"><a href="/lib/papers/harness-zero/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/harness-zero/body-results.svg" alt="Harness-Zero 在固定部署接口中的三领域成绩与 USPTO 迁移不足" width="1000" height="740"></a><figcaption>根据论文 Table 2 重绘。蒸馏后 9B 模型的三领域平均为 44.3%，但 USPTO 仍低于直接使用专用 harness 的原模型；平均收益不能代表所有领域都迁移充分。</figcaption></figure>

<h2 id="训练数据必须与部署工具兼容">5. Discussion：训练数据必须与部署工具兼容</h2>

**最值得复用的是数据生成时就检查部署可执行性。** 更强教师、更高采集成功率，甚至标准答案，都不保证学生能在自己的工具接口里复现。Harness-Zero 只改下一步，再实际交给目标 harness 执行；被监督的记录因此包含它上线后也能完成的动作。

<code>K</code> 不给最终答案。它在模型准备犯错时加入一次文件检查、结果验证或恢复动作，保留原有轨迹的大部分状态。相比完全接管任务，这种记录更清楚地展示“遇到这种情况，下一步该怎么做”。

论文按逐步审查描述采集流程；在预算尚未耗尽时，一步要调用学生模型和审查模型，真正需要替换的却只占一部分。固定仓库在替换次数耗尽后直接放行，因此不能把整条轨迹的成本统一写成每步至少两次调用。后续可以研究只在高风险步骤审查：用较便宜的检测规则筛出可能覆盖文件、漏验证或调用错误工具的动作，再衡量省下的成本和损失的监督效果。

最后，论文也给 harness 设计提出了一个新问题：哪些组件的价值来自可学习流程，哪些必须在部署时继续作为外部能力存在？SpreadsheetBench 的检查工作流很容易写进模型回复；上下文裁剪、真正的并行调度、需要私有状态的安全隔离，就未必能靠 SFT 取代。

<h2 id="已证明的收益与尚未解决的依赖">6. Conclusion：已证明的收益与尚未解决的依赖</h2>

**程序化检查与工作流可以部分迁移进 9B 模型，深领域知识和所有外部机制尚不能一并移除。** 完整路径是：先优化包裹学生的专用程序 <code>h*</code>，再把它改写成审查者读取的 <code>K</code>；审查模型用 PASS/REPLACE 把指导改写成 <code>h</code> 能执行的 response；监督微调只学已接受且实际执行的记录；部署时移除 <code>h*</code>、<code>K</code> 和审查者。

现有证据支持一个相对克制的结论：<strong>程序化 harness 行为可以在不保留专用 harness 的情况下，较大比例地迁移进一个 9B 模型。</strong>三领域平均分提高 21.0 个百分点，28 种仅在专用程序中触发的行为平均恢复 82.3%。但这还不是“所有 harness 都能被蒸馏掉”。

- 审查模型必须足够强。USPTO 上，agent-as-harness 相对 code-as-harness 在 GPT-5.6 Sol、DeepSeek-V4-Pro 上分别高 1 分和 4 分；在 DeepSeek-V4-Flash、Qwen3.6-35B-A3B 上则分别低 1 分和 12 分。最弱模型替换了 66.0% 的步骤，但这些改写整体有害。
- 采集成本明显增加。USPTO 上最小执行接口平均 100.1 秒，agent-as-harness 为 237.2 秒，约 2.4×；这部分成本在训练数据采集期发生，部署后消失。
- SFT 对深领域知识与真正的可执行能力吸收有限。USPTO 的蒸馏结果仍落后 <code>h*</code> 8 分。
- 不是所有机制都能自然地写成学生回复。论文明确提到上下文管理仍是难以迁移的机制。
- 主要 pass@1 / SGC 都是单次运行结果，论文没有报告重复实验方差；强模型对比复用了在 Qwen3.5-9B 上演化的 <code>h*</code>，这个设计有利于考察迁移，但不等同于为每个强模型分别寻找最优 harness。

对复现而言，应同时检查执行记录有没有包含完整验证动作，以及部署工具是否支持这些动作。只确认训练答案正确，无法重现这篇论文最有信息量的对照。

</div>

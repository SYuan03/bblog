---
title: "[2026-01-29] ASTRA: Automated Synthesis of agentic Trajectories and Reinforcement Arenas"
permalink: "/posts/论文解读/astra.html"
date: "2026-10-05T16:30:00+08:00"
updated: "2026-10-20T05:55:00+08:00"
cover: "/generated-covers/061-astra.webp"
description: "ASTRA 先生成工具调用示范，再把多步问答写成可执行的模拟工具，用模型自己的执行结果继续训练。本文分开解释数据构造、环境检查、训练奖励、行李加购真实样本及公开代码与论文的差异。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "Tool Agent"
  - "Agent Training"
  - "Reinforcement Learning"
  - "MCP"
  - "Synthetic Data"
---

<style>
html:not([data-theme="dark"]) body:has(.astra-reading){--paper:#fff;--paper-elevated:#f5f7f7;--ink:#20262b;--ink-soft:#65717a;--line:rgba(32,38,43,.14);background:#fff}.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:820px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:52ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.1}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.astra-reading{--column:820px;--blue:#33749b;--green:#2f7d6b;--orange:#b7683a;--red:#a64643;--violet:#6e5a9c;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.astra-reading>*{max-width:100%}.astra-reading p,.astra-reading li{text-wrap:pretty}.astra-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.astra-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.astra-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2329}.astra-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2329}.astra-reading .deck-head strong{font-size:.92rem}.astra-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.astra-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.astra-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.astra-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2329;border-top:1px solid #3b464e;font-size:.78rem!important}
.astra-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.astra-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line-local));background:color-mix(in srgb,var(--violet) 5%,#fff)}.astra-reading .interest b{color:var(--violet);font:750 1.2rem/1 var(--mono)}.astra-reading .interest span{color:var(--soft);font-size:.84rem}.astra-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.astra-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.astra-reading .metric:last-child{border-right:0}.astra-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.astra-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.astra-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.astra-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.astra-reading .keypoints ul{margin:0;padding-left:1.2rem}.astra-reading .keypoints li{margin:.42rem 0}.astra-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--violet);background:var(--surface)}.astra-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.astra-reading .kicker{display:block;margin-bottom:6px;color:var(--violet);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.astra-reading h2{margin-top:3.55rem}.astra-reading h3{margin-top:2.1rem}.astra-reading h4{margin-top:1.7rem}.astra-reading strong{font-weight:760}.astra-reading .table-scroll,.astra-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.astra-reading .table-scroll table{display:table;width:100%;min-width:760px;margin:0;border-collapse:collapse;font:400 .85rem/1.52 var(--sans)}.astra-reading th,.astra-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.astra-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.astra-reading td:first-child{font-weight:650}.astra-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f272d;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.astra-reading code{font-size:.92em}
.astra-reading .figure{width:100%;margin:27px 0}.astra-reading .figure img{display:block;width:auto;max-width:100%;max-height:820px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.astra-reading .figure.wide img{width:100%;max-width:100%;margin-inline:auto;transform:none}.astra-reading .figure figcaption{max-width:760px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.astra-reading .figure.source img{border:0}.astra-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.astra-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.astra-reading .note.red{border-color:var(--red);background:color-mix(in srgb,var(--red) 6%,var(--surface))}.astra-reading .note p{margin:.34em 0}.astra-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .88rem/1.7 var(--mono);overflow-x:auto}.astra-reading .steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.astra-reading .steps li{min-height:144px;padding:13px;background:var(--surface)}.astra-reading .steps b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.astra-reading .steps span{display:block;color:var(--soft);font-size:.76rem;line-height:1.5}.astra-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.astra-reading .case h4{margin:0 0 8px;font-size:1.12rem}.astra-reading .case ol{padding-left:1.2rem}.astra-reading .case li{margin:.58rem 0}.astra-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.astra-reading .limit-grid>div{padding:17px;background:#fff}.astra-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.astra-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.75rem,7.5vw,2.25rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.astra-reading,.astra-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.astra-reading .source-links a{overflow-wrap:anywhere}.astra-reading .deck-wrap{max-width:100%;overflow:hidden}.astra-reading .metrics{grid-template-columns:1fr 1fr}.astra-reading .metric:nth-child(2){border-right:0}.astra-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.astra-reading .steps{grid-template-columns:1fr 1fr}.astra-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.astra-reading .figure.wide img{max-width:100%;margin-left:auto;transform:none}}
@media(max-width:460px){.astra-reading .steps,.astra-reading .limit-grid{grid-template-columns:1fr}.astra-reading .part0,.astra-reading .case{padding:17px 15px}.astra-reading .deck-head,.astra-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,1020px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="astra-reading">

<p class="paper-meta">Beike Language and Intelligence (BLI) · arXiv:2601.21558v2 · 最早公开于 2026-01-29，v2 更新于 2026-01-30</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2601.21558">论文主页</a>
  <a href="https://arxiv.org/pdf/2601.21558">论文 PDF</a>
  <a href="https://github.com/LianjiaTech/astra">官方仓库</a>
  <a href="https://huggingface.co/collections/Emperorizzis/astra-dataset">公开数据</a>
</div>

<section class="deck-wrap" aria-label="ASTRA 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · 两条生成流程、真实样本、奖励、评测与局限</strong><a href="/lib/decks/astra-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/astra-visual-guide.html" title="ASTRA 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">ASTRA 想训练能连续使用工具的模型。它先根据工具说明生成多轮示范，让模型学会选工具、填参数和理解返回结果；再把多步问答写成可运行的 Python 模拟工具，让模型自己做任务，按完成程度和调用次数获得奖励。<strong>示范数据与可执行环境来自两条不同的生成流程，最后接成两阶段训练。</strong></p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 工具说明、完整执行记录与训练环境

**MCP server** 在这里是一组可调用工具，工具用 JSON schema 规定名称和参数，用文字说明用途。比如一个旅行服务可能暴露 `find_reservation`、`get_baggage_allowance`、`calculate_fee` 与 `process_payment`。ASTRA 生成固定示范的一支读取这些说明，不需要先有人工写好的问答。

一次任务中的提问、推理、工具调用、返回值和最终回答，合起来是一条 **trajectory**。用固定示范训练叫 **SFT**；让当前模型自己执行任务，再根据奖励更新叫 **online RL**。执行这条记录的过程叫 rollout，正在被训练的模型称为 policy。

**Environment** 是工具调用真正执行的程序。这里没有连接真实航空、支付或医院系统，而是根据问答及其中的依赖关系生成 **mock tools**：模拟真实接口的 Python 函数。“可验证”指代码能运行且返回预设答案，不自动保证它在现实世界也正确。
</aside>

<div class="interest"><b>博客作者兴趣度 8.5 / 10</b><span>评分只表示博客作者本人兴趣程度；兴趣来自工具 Agent 训练、自动生成环境和长轨迹强化学习</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>54,885</strong><span>监督微调对话样本</span></div>
  <div class="metric"><strong>6,596</strong><span>强化学习环境样本</span></div>
  <div class="metric"><strong>4.37</strong><span>每个强化学习样本平均推理步骤</span></div>
  <div class="metric"><strong>+17.29</strong><span>14B 的 ACEBench 总分，从基座到最终模型</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li>示范数据从工具文档出发，可执行环境从多步问答出发；<strong>两条流程分别生成，不应混成一条。</strong></li>
    <li>任务筛选、示范评分、环境准入、训练奖励是<strong>四种不同检查</strong>，分别在构造与训练的不同阶段起作用。</li>
    <li><strong>最终模型在三项工具使用评测都超过基座。</strong>BFCL 与 τ² 的增量主要来自 RL；ACEBench 的增量反而主要来自 SFT。总提升不能全部归到 RL。</li>
    <li><strong>代码可执行，不等于现实正确。</strong>公开环境检查只验证目标答案是否出现在标准输出，公开数据第 0 行还存在同名工具覆盖、目标支付结果无法复现的问题。</li>
  </ul>
</aside>


<h2 id="动机：工具调用示范与可训练环境缺一不可">1. Motivation：工具调用示范与可训练环境缺一不可</h2>

**模型先要会基本调用，才有机会从自己的长任务失败中学习。** ASTRA 同时解决示范覆盖与环境扩展，避免只拥有其中一边。

SFT 能让模型模仿固定示范，但不会针对它当下的错误给反馈。直接做 RL 又可能出现起步困难：模型连工具和参数都选不对，很少完成任务，奖励无法区分好坏。如果每次工具返回都由另一个 LLM 临时编写，同一动作还可能产生不同结果，奖励就不稳定。ASTRA 因此先教基本调用，再把第二阶段的环境固定成可执行代码。

两阶段各自准备的材料是：

1. 按工具之间可能连续调用的关系组织数据，生成跨领域的多轮示范，先做 SFT；
2. 按多步问答的依赖关系生成每条样本的 Python 环境，再做多轮 online RL。

<figure class="figure wide">
  <a href="/lib/papers/astra/body-method.svg" target="_blank" rel="noopener"><picture><source media="(max-width: 600px)" srcset="/lib/papers/astra/body-method-mobile.svg" width="360" height="445"><img src="/lib/papers/astra/body-method.svg" width="900" height="316" alt="ASTRA 从工具文档生成 SFT 示范，从多步问答生成 RL 环境，两种材料依次训练同一个模型"></picture></a>
  <figcaption>根据<a href="https://arxiv.org/pdf/2601.21558v2#page=3">论文 Sections 2–3 与 Figures 2–4</a>重绘。两条流程分别提供固定示范与可执行环境，最后在模型训练中衔接。</figcaption>
</figure>

SFT 使用事先生成的完整示范，RL 则让当前模型在固定工具上重新做任务，按结果更新。论文用 static tool topology 指工具之间可能连续调用的关系，用 semantic topology 指答案之间的依赖关系。两种图组织不同材料，并不代表 SFT 只学“怎么调用”、RL 只学“何时调用”；阶段效果仍要看后面的分项实验。

<h2 id="相邻工作：生成轨迹与生成环境的交叉点">2. Related Work：生成轨迹与生成环境的交叉点</h2>

**它的组合点是两阶段训练，不是首次使用工具图或 GRPO。** GRPO 按同一道题的多次尝试的相对奖励更新模型。工具图组织可能连续调用的接口，问答依赖图组织完成任务所需的中间事实；它们服务于不同数据流程。

<details><summary>相邻工作对照：四条路线的输入、产物与 ASTRA 的位置</summary>
<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>代表工作</th><th>主要解决什么</th><th>ASTRA 的位置</th></tr></thead>
  <tbody>
    <tr><td>工具调用示范</td><td>ToolLLM、ToolACE、Toucan</td><td>从 API / MCP 工具清单生成请求、调用与返回值</td><td>同样从工具文档起步；额外组织同一服务内的调用关系，生成完整多轮记录。</td></tr>
    <tr><td>多轮轨迹生成</td><td>MAGNET、ToolACE-MT、APIGen-MT</td><td>用图、任务蓝图或模拟器构造连续调用</td><td>最接近 SFT 流程；ASTRA 用这些固定示范初始化模型，再接第二阶段在线 RL。</td></tr>
    <tr><td>按模型弱点更新数据</td><td>LoopTool、GEM</td><td>围绕模型错误生成新数据，或从文本恢复隐含流程</td><td>除了生成离线轨迹，还把多步问答依赖写成能执行的独立工具。</td></tr>
    <tr><td>自动扩展环境</td><td>EnvScaler、AutoForge、AgentScaler、CuES、GenEnv</td><td>自动生成环境、任务、检查器或训练课程</td><td>这是 ASTRA 的最近邻；它组合问答生成环境、F1 奖励、无关工具混入与两阶段训练。</td></tr>
  </tbody>
</table>
</div>
</details>

论文对较早的多轮工具训练的一个重要批评是：有的方法虽然先生成多轮数据，训练时却把它拆成独立单步样本，模型难以学习“读完上一条工具返回，再决定下一步”。ASTRA 保留整段模型与工具的交互，并允许在线执行最长 32 轮。

论文的 fully automated 指不需要逐条人工标注，不代表每步都有独立事实来源。SFT 主要由模型评分；RL 工具由模型根据目标问答生成，再检查是否返回那份问答的目标。这能规模化造训练材料，但不能当作现实 API 的完整复刻。

<h2 id="方法：先造示范，再造环境，最后用奖励训练">3. Method：先造示范，再造环境，最后用奖励训练</h2>

**两条生成流程最后分别提供离线示范与在线训练环境。** 第一条流程只在同一 MCP server 内组织工具，不跨服务编排。

作者从开放 MCP 注册表、RapidAPI、内部工具说明和公开数据集收集文档，统一成 OpenAI 风格的函数调用格式。工具少于三个、说明含糊或格式无法转换的服务被丢弃；最后保留 **1,585 个 MCP 服务、19,036 份工具文档、41 个领域**。论文明确限制组合发生在同一 server 内，不做跨服务的调用流程。

<figure class="figure wide source">
  <a href="/lib/papers/astra/official-sft-pipeline.webp" target="_blank" rel="noopener"><img src="/lib/papers/astra/official-sft-pipeline.webp" width="2400" height="1766" alt="ASTRA 官方 SFT trajectory synthesis pipeline"></a>
  <figcaption>官方仓库 <code>assets/sft-pipeline.png</code>（Apache-2.0），对应论文 Figure 2。图中依次是工具收集、调用链构造、任务生成、多轮执行与示范评分。</figcaption>
</figure>

<ul class="steps">
  <li><b>1 · 收集工具</b><span>清洗参数格式，按来源服务分组，过滤不可用文档。</span></li>
  <li><b>2 · 连调用图</b><span>LLM 提出任务和可能的调用链；连续工具形成有向边，再沿图随机行走，限制链长。</span></li>
  <li><b>3 · 验参数依赖</b><span>后续必需参数应能来自请求或前面返回值，任务也应与调用链一致。</span></li>
  <li><b>4 · 生成任务</b><span>分别按调用链或只按服务文档生成任务，再改写表达、复杂度和用户身份。</span></li>
  <li><b>5 · 执行并筛选</b><span>Qwen-Agent 调真实 MCP 或保存状态的模拟器，记录完整过程后评分。</span></li>
</ul>

任务先经过问题质量、场景真实性、是否确需工具三项筛选。生成示范时，已部署的 MCP 直接执行；只有文档、没有可用后端的工具，由另一个能保存前序交互状态的 LLM 模拟器返回结果。为了让模型遇到失败后继续处理，模拟调用以 **20% 概率**注入超时或服务不可达一类错误。

<h3 id="示范筛选：七项评分不能代替环境验证">3.1 示范筛选：七项评分不能代替环境验证</h3>

示范评分分成七个维度，最后取算术平均，覆盖对请求与工具返回的理解、调用成功率、调用是否必要，以及最终回答是否忠实于工具结果。

<details><summary>七项示范评分的具体维度</summary>
<div class="table-scroll">
<table>
  <thead><tr><th>维度</th><th>看哪一段</th><th>判断内容</th></tr></thead>
  <tbody>
    <tr><td>Query Understanding</td><td>最初模型回答</td><td>是否正确理解用户请求。</td></tr>
    <tr><td>Query Planning</td><td>最初模型回答</td><td>初始计划是否可行、完整。</td></tr>
    <tr><td>Tool-call Understanding</td><td>当前步骤的交互上下文</td><td>是否正确读懂上一条工具返回。</td></tr>
    <tr><td>Tool-call Planning</td><td>当前步骤的交互上下文</td><td>下一步行动是否由当前证据支持。</td></tr>
    <tr><td>Tool-call Success</td><td>执行记录</td><td>调用是否成功完成。</td></tr>
    <tr><td>Tool Conciseness</td><td>完整执行记录</td><td>是否有重复或不必要调用。</td></tr>
    <tr><td>Final Answer</td><td>最终回答与工具结果</td><td>是否相关、完整，并忠实于执行结果。</td></tr>
  </tbody>
</table>
</div>
</details>

这里有一个论文正文没强调、但公开实现值得注意的细节：评分请求抛异常，或返回对象没有 `score` 字段时，代码会写入 **1.0**。

<div class="code-scroll"><pre><code>if isinstance(result, Exception):
    scores.append(1.0)
else:
    scores.append(result.get("score", 1.0))
</code></pre></div>

这叫 **fail-open**：评分服务出错时不拒绝样本，而给满分。论文没有报告触发次数，不能断言训练集显著污染；复现时应重试，仍失败则隔离，并统计比例。

公开代码与论文公式还有一个小差异。论文 Equation 8 把成功调用记为 1、失败调用记为 0；`reward.py` 实际计算的是 `(1.0 × success + 0.5 × fail) / total_calls`，因此失败调用仍有 0.5 分。这个差异不会改变“七项求平均”的框架，却会改变示范轨迹的具体排序，复现实验时应该固定以论文还是代码为准。

最终 SFT 数据包含 **54,885 段对话、580,983 条消息**，每条平均 10.59 条消息和 4.42 次工具调用，覆盖 6,765 个不同工具函数。公开 Hugging Face 数据是 **1,000 条样本**，不是论文中的完整 54,885 条。

<h3 id="第二条流程：从多步问答生成可执行环境">3.2 第二条流程：从多步问答生成可执行环境</h3>

这条流程从主问题与答案出发，拆出需要哪些中间事实、前后依赖什么的问答。需要外部信息的子问题会被写成 Python 工具；检查器先验证目标输入是否返回目标答案。后面训练的 F1 奖励则检查整次任务完成了多少中间目标、用了多少调用，二者不是同一层检查。

<figure class="figure wide source">
  <a href="/lib/papers/astra/official-rl-pipeline.webp" target="_blank" rel="noopener"><img src="/lib/papers/astra/official-rl-pipeline.webp" width="2400" height="1092" alt="ASTRA 官方 QA-based RL environment synthesis pipeline"></a>
  <figcaption>官方仓库 <code>assets/env.png</code>（Apache-2.0），对应论文 Figure 3。问答拆解、工具必要性检查、质量验证、环境生成与工具合并都属于构造阶段；后面训练奖励另行计算。</figcaption>
</figure>

主问题先被拆成若干子问题，标出哪些可以并行、哪些依赖前一步答案。LLM 随后检查依赖是否合理、每题是否只要求一个事实、执行顺序是否正确，以及合起来是否足以回答主问题。需要工具的节点依次生成文档、参数、调用语句和 Python 实现。

论文还做了局部合并校验：同功能、不同参数的节点可以共用一个工具。每向实现中加入一条记录，就在沙箱重放该工具已有的调用语句，检查所有对应答案仍然返回。**这项检查确实存在，但不等于最终所有工具名称、调用依赖和奖励目标都已统一验证**；后面的公开行李样本仍有具体不一致。

问答可以根据已有主问题生成，也可以让 LLM 依据领域材料 `K` 和允许的推理步骤数 `H` 从头生成。论文只把 `K` 说明为文本语料一类知识源，没有列出上游出处、许可、去重规则或训练/测试泄漏检查。公开仓库带有可运行的 `knowledge/en/*.jsonl` 与 `knowledge/zh/*.jsonl` 输入，其中也能找到下文行李 case 的来源场景，但仓库同样没有交代这些文本由谁编写或从哪里采集。问题拆解和四项质量检查全部由 LLM 完成，没有加入人工标注，也没有标注者一致性数据。

训练时，policy 看到用户请求、当前工具说明和每次执行结果。`sub_qa_dict` 中的目标答案用于算奖励，不作为作答提示交给 policy；每条样本的 Python 环境彼此隔离，不共享状态。

<h3 id="环境准入：目标字符串出现在执行输出">3.3 环境准入：目标字符串出现在执行输出</h3>

公开 `step_04_env_synthesis.py` 的关键通过条件如下：

<div class="code-scroll"><pre><code>call_ans = get_code_sandbox_ans(final_code)
if call_ans["status"] == "Success":
    if q_a_pairs["answer"] in call_ans["run_result"]["stdout"]:
        is_success = True
</code></pre></div>

也就是说，生成的 Python 代码在沙箱中执行成功，而且标准输出 stdout **包含**目标答案，就算通过；失败则重新生成。这个检查建立的是可执行的自洽性：生成代码在已知输入上返回合成问答指定的答案。它不连接真实数据库，也不验证其他输入，所以没有证明外部事实或整个接口行为正确。

数据规模是 **6,596 条样本、28,794 个子问题**；91.3% 的子问题需要工具，平均 4.37 个推理步骤。任务中 71.2% 为英文、28.8% 为中文；47.8% 是能并行处理部分中间目标的 Parallel Multi-Hop，34.8% 是顺序依赖中间答案的 Multi-Hop。公开数据同样只放出 **1,000 条**。

<h3 id="训练奖励：完成程度与调用效率一起算">3.4 训练奖励：完成程度与调用效率一起算</h3>

设一个任务有 `n` 个目标子任务，当前执行命中 `n_hat` 个，工具一共调用 `c` 次：

<div class="formula">recall r = n_hat / n　　precision p = n_hat / (c + ε)　　reward = 2pr / (p + r)</div>

做全 4 项、正好调用 4 次，reward 接近 1；做全 4 项却调用 6 次，F1 约为 0.80；只做对 3 项、调用 4 次，约为 0.75。这里的 recall 是完成目标的比例，precision 是“每次工具调用解决了多少目标子任务”的效率分，不是分类准确率。这些数字是条件代入，忽略 ε 的极小修正，不是任何公开样本的实测奖励。一次对话轮次可以发多个调用，不能把轮数当成公式里的 c。

作者还给工具列表混入高、中、低三档相似的无关选项。具体是用 Qwen3-Embedding-8B 编码工具文档，算余弦相似度，再按每个目标工具的最小/最大相似度归一化到 0-1；排除同领域候选后，按 `>0.85`、`0.4-0.85`、`<0.4` 分档，每档最多抽 K 个。论文没有写出 K 的具体数值。消融曲线显示不加无关工具最差，随机加 5-9 个优于不加，但低于分档采样；论文没有提供曲线终点的精确表格值，因此不应从图上臆测具体提升。

<h3 id="真实样本：四个行李加购目标如何变成奖励">3.5 真实样本：四个行李加购目标如何变成奖励</h3>

<figure class="figure wide">
  <a href="/lib/papers/astra/body-case.svg" target="_blank" rel="noopener"><picture><source media="(max-width: 600px)" srcset="/lib/papers/astra/body-case-mobile.svg" width="360" height="562"><img src="/lib/papers/astra/body-case.svg" width="900" height="366" alt="公开行李样本四个隐藏目标与已检查工具实现的观察：前三项条件命中，支付目标不匹配"></picture></a>
  <figcaption>根据 Hugging Face <a href="https://huggingface.co/datasets/Emperorizzis/ASTRA-RL-1k"><code>ASTRA-RL-1k</code></a> train row 0 重绘，revision <code>dbc70e26</code>。图中“命中”来自指定输入的本地核对，不是公开的 policy 运行记录或完整 RL 得分。</figcaption>
</figure>

<div class="case">
<h4>公开环境与四个评分目标的核对</h4>
<ol>
  <li>Hugging Face 的 <code>ASTRA-RL-1k</code> train row 0 由论文的数据生成流程产生，没有逐行人工标注。<strong>Policy 能看请求、工具说明和返回结果，不能看用于评分的目标答案。</strong> Amit Kumar 要修改 Bengaluru City 与 Chennai Central 之间、9 月 20 日去程和 9 月 23 日返程的预订，把行李额度从 1 件加到 3 件；先告知费用，再用钱包支付。请求没有指定年份。</li>
  <li><code>sub_qa_dict</code> 保存四个目标字符串：<code>Reservation ID: RES987654</code>、<code>Current baggage allowance: 1 bag</code>、<code>Extra charge: ₹600</code>、<code>Payment successful. Transaction ID: TXN123456789</code>。它们由问答生成流程写入数据，不是运行真实航空或支付接口取得的事实。</li>
  <li>理想情况下，四个目标都命中、调用四次，<code>n_hat=4, n=4, c=4</code>，F1 reward 接近 1。重复查预订或费用会增加 <code>c</code>，即使最终答案完整也会扣分。</li>
  <li>公开 <code>tool_schema</code> 有 9 项，其中两个都叫 <code>payment_processor</code>；按名称索引的 <code>tool_dict</code> 只剩 8 个不同名称。保留下来的实现需要 <code>payment_instrument_id</code> 和 <code>charge_type</code>，返回 <code>Charge processed successfully...</code>，交易编号通常随机生成，与目标支付字符串不同。若按另一份同名 schema 只传 <code>reservation_id</code>、金额和货币，会因缺少两个必填参数而报错。</li>
</ol>
</div>

我对这四个已检查的模拟函数做了本地调用核对，前三项返回值包含目标，支付项不包含。这个核对有两处需要明说：预订函数只在代码写死的 <code>2024-09-20</code> / <code>2024-09-23</code> 上返回该预订，我按这个分支选了年份；支付调用中的钱包编号也是为测试函数填的输入，不是模型从公开执行日志中取得的结果。前三个目标命中，验证的是这些已知输入下的模拟分支。

公开预订实现把去返程日期写成了 2024 年。下面保留条件摘录（Python；省略返回值与其他参数检查）：

<details><summary>查看预订函数对 2024 年日期的条件检查</summary>
<div class="code-scroll"><pre><code>if (passenger_name == "Amit Kumar" and
    origin == "Bengaluru City" and
    destination == "Chennai Central" and
    travel_date == "2024-09-20" and
    trip_type == "round_trip" and
    return_date == "2024-09-23"):
    # 该分支返回 Reservation ID: RES987654
    ...
</code></pre></div>
</details>

**这里没有复现官方 RL 得分，也没有一条真实 policy 的完整执行日志。** 若奖励按上述字符串命中数计算、且四次调用仅命中前三项，代入公式才得到约 0.75；公开仓库缺少完整 RL 奖励实现，不能把这个条件计算写成样本实测分数。论文 Appendix A.2 的股票与轮胎示例也只展示推理文本，未给出实际工具调用、返回值与评分日志。

这是公开 1k 子集中的一行缺陷，**不能据此推断内部全部 6,596 个环境都有问题**。论文已有同功能工具插入数据后的局部重放，公开样本却仍出现工具重名和随机交易编号。最终数据还需在实际按名称注册的工具集合上重放全部目标调用，确认工具名唯一，返回值与奖励目标一致。

<h3 id="一次-RL-更新：哪些数据固定，哪些参数改变">3.6 一次 RL 更新：哪些数据固定，哪些参数改变</h3>

SFT 用已生成的完整示范做训练。进入 RL 后，每个样本的 Python 工具与目标答案固定；当前 policy 接收请求和工具 schema，生成多次完整调用记录。环境执行调用，奖励程序比较已解决的子目标与调用数。训练只更新 policy 参数，不在每步重新训练工具或问答生成器。

<details><summary>训练设置：SFT 与 RL 的批次、长度和学习率</summary>
<p>SFT 从 Qwen3-14B 和 Qwen3-32B 开始，各遍历示范数据 2 次（2 epochs），每批 32 条，最大序列长度 20k tokens（token 是模型处理的文本单位），不把多条短记录拼接训练；学习率分别为 <code>5e-6</code> 与 <code>2e-6</code>。用余弦学习率调度，前 5% 步骤预热。长序列分摊到设备处理的 Context Parallelism，14B 设置 CP=2，32B 设置 CP=4。</p>

<p>RL 使用 GRPO，batch size 与 mini-batch size 都是 256，学习率 <code>2e-6</code>；输入上限 25,600 tokens，回答上限 49,152 tokens，论文对 user 与 assistant 各写了最多 32 轮。作者去掉 KL 正则（限制回答分布偏离起点的项）与熵奖励（鼓励生成多样性的项），在整个 batch 的 token 上取平均损失。</p>
</details>

同一道题的一组执行记录如果奖励完全相同，GRPO 没有组内好坏对比，学习信号为零。**Adaptive Batch Filling** 是筛选并凑足这种有效训练组的操作：只保留奖励标准差高于阈值的组，多余记录缓存在下一步使用。它改变训练 batch 的组成，不改变环境如何判定目标。

<h2 id="实验：奖励之外，模型在真实评测上学到了什么">4. Experiments：外部评测的增益来自哪个阶段</h2>

**最终 RL 在三项工具使用评测上都提高，但部分离线训练子项会先退化。** 下面比较固定基座、SFT 后和最终 RL，避免把合成数据内部奖励当成外部能力。

<div class="table-scroll">
<table>
  <thead><tr><th>Benchmark</th><th>测什么</th><th>论文 protocol</th><th>需要注意</th></tr></thead>
  <tbody>
    <tr><td>BFCL-v3 MT</td><td>多轮函数调用，含正确工具缺失、参数缺失、长上下文</td><td>vLLM 推理服务，temperature 0.6</td><td>四个子项平均为总分；未报告重复试验或置信区间。</td></tr>
    <tr><td>τ²-Bench</td><td>模型与模拟用户共同操作环境</td><td>排除 airline；GPT-5.1 模拟用户；temperature 0；4 次试验；报告 pass^1</td><td>pass^1 是单次尝试的成功概率估计，不是“重试四次只要成功一次”。airline 因先前报告指出标准评分质量问题而排除。</td></tr>
    <tr><td>ACEBench</td><td>多轮与多步工具使用</td><td>Agent 分组 50 题；GPT-4.1 模拟用户；temperature 0.6；重复 4 次</td><td>报告平均准确率；50 个不同任务重复四次，仍不是 200 个独立任务。</td></tr>
    <tr><td>AIME 2024/2025</td><td>检查无工具数学推理是否退化</td><td>temperature 0.6、top-p 0.95；top-k 20 与 -1 各生成 32 次</td><td>两种生成参数的通过率再平均。</td></tr>
  </tbody>
</table>
</div>

<figure class="figure wide">
  <a href="/lib/papers/astra/body-results.svg" target="_blank" rel="noopener"><picture><source media="(max-width: 600px)" srcset="/lib/papers/astra/body-results-mobile.svg" width="360" height="540"><img src="/lib/papers/astra/body-results.svg" width="900" height="326" alt="ASTRA 14B 和 32B 在三项工具评测的基座、SFT、RL 成绩及各阶段增量"></picture></a>
  <figcaption>根据<a href="https://arxiv.org/pdf/2601.21558v2#page=15">论文 Table 2</a>重绘。阶段增量按表中显示值相减，单位为各评测自己的百分点；不同评测没有合成一个总分。</figcaption>
</figure>

表中的 temperature、top-p、top-k 是回答采样参数；top-k=-1 表示不限制候选数。论文 Table 1 与 Table 2 的基座成绩不完全相同：14B 的 τ² 为 46.05 对 44.55，32B 的 BFCL 为 49.63 对 47.88，没有解释为何变化。下文只用 Table 2 的同组基座做阶段比较，不能把两张表的更高值混用。

14B 从 base 到最终 RL，BFCL-MT 为 **44.50→58.13**，τ²-Bench 为 **44.55→57.70**，ACEBench 为 **51.67→68.96**。32B 分别是 **47.88→64.25**、**49.70→63.70**、**59.79→71.88**。最终模型三榜方向一致，阶段贡献却不同：

- 14B 的 BFCL：SFT +4.00，后续 RL +9.63；τ²：SFT +5.90，RL +7.25。
- 14B 的 ACE：SFT 已从 51.67 升到 67.71（+16.04），后续 RL 只升到 68.96（+1.25）。**+17.29 是两阶段总增益，不能全算给 RL。**
- 32B 同样是 BFCL 与 τ² 的 RL 增量更大，ACE 的 SFT +7.92 大于后续 RL +4.17。

但 SFT 不是所有子项都变好。BFCL Missing Function 在 14B 上从 39.50 降到 25.50，在 32B 上从 52.50 降到 40.00；RL 后才分别升到 56.00 与 65.50。这说明离线示范能改善常规调用习惯，却可能让 policy 更倾向“总要找个 tool 用”；加入无关工具和在线奖励后，拒绝不存在功能的能力才恢复。

AIME 用于检查工具训练是否损害数学推理。14B 在两种生成参数下的平均分别为 73.45→73.40 与 72.60→72.60；32B 为 74.90→74.85 与 74.15→75.15。可以说没有观察到系统性退化，但它不是一般能力的全面评测。

Table 4 还报告 BFCL-MT 的每次调用平均输出长度：32B 从 1,145.3 tokens 变成最终 RL 的 1,130.1 tokens，变化很小；不能据此声称大幅降低推理成本。表中“平均调用次数 × 每次平均长度”也不能直接当作“每题平均总长度”，三者的汇总对象不同。

<h2 id="下一步：先修最终环境，再隔离训练组件的贡献">5. Discussion：先修最终环境，再隔离训练组件的贡献</h2>

**应在最终注册的环境上验完整目标调用。** 论文已有局部函数合并重放；下一层应要求名称唯一、参数有效、输出与所有奖励目标一致。遇到评分模型异常，应重试或隔离样本，避免满分默认值混进示范。公开行李样本给出了具体的测试目标。

然后用真实 API 或独立模拟器做未见任务迁移，检查 mock 工具学到的调用策略能否复用。固定轨迹预算与随机种子，分别拿掉初始示范、相似度分档的无关工具和 Adaptive Batch Filling，再比较 F1 与只算完成程度或只算调用效率的奖励。这才能区分更多数据、环境设计与训练算法的贡献；不是论文已经完成的全组件控制实验。

<h2 id="总结：训练分层的价值与公开实现的边界">6. Conclusion：训练分层的价值与公开实现的边界</h2>

**最值得保留的是四层检查分开：任务质量、示范质量、环境能否返回目标、外部评测是否真正提高。** 它们不能互相替代。公开代码的评分默认值与行李样本又说明，训练奖励必须依赖一致的最终工具与目标。

<div class="limit-grid">
  <div><b>LLM judge 会 fail-open</b><span>SFT 评分服务异常或缺少 score 时默认 1.0。论文没有报告异常比例，公开实现也没有隔离这些样本。</span></div>
  <div><b>可执行不等于事实正确</b><span>环境检查只验证目标答案出现在标准输出，证明合成工具与目标自洽；没有真实系统或独立事实来源验证工具行为。</span></div>
  <div><b>公开子集不是完整训练数据</b><span>论文报告 54,885 条 SFT 与 6,596 条 RL 样本；Hugging Face 各公开 1,000 条，仓库的 <code>trajectory_synthesis/data</code> 则有 1,482 行 MCP 服务记录与 941 行任务记录。</span></div>
  <div><b>强化学习不能端到端复现</b><span>仓库公开了两条数据生成流程、数据子集和模型，但没有提供论文使用的强化学习训练脚本与完整内部数据。</span></div>
  <div><b>主结果缺少多个训练随机种子</b><span>τ² 与 ACEBench 有重复评测；训练本身没有多个训练随机种子，也没有给主要分数的置信区间。Table 1 与 2 部分基座成绩不同，论文没有解释。</span></div>
  <div><b>组件贡献没有完全隔离</b><span>无关工具与奖励有曲线消融，但缺少示范来源、环境来源和训练组筛选等组件的完整组合消融。</span></div>
</div>

F1 奖励把完成目标和少用工具放在同一个可计算值里。论文曲线显示只追求目标覆盖或只追求调用效率的版本后期退化，组合更稳定；但好公式仍依赖最终工具与目标一致，名称覆盖或随机交易编号会直接改变学习信号。


<aside class="note blue">
<p><strong>结论：</strong>ASTRA 从工具文档生成示范，从多步问答生成可执行环境，接成两阶段训练，在 14B / 32B 上得到一致的三榜提升。长任务训练因此有了可扩展材料；论文所称 rule-verifiable（按规则验证）的边界是合成环境能执行、与指定目标自洽，不证明现实事实。后续实现需要修复评分异常默认满分，以及公开行李样本的工具与目标不一致。</p>
</aside>

</div>

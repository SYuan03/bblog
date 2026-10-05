---
title: "[2026-01-29] ASTRA: Automated Synthesis of agentic Trajectories and Reinforcement Arenas"
permalink: "/posts/论文解读/astra.html"
date: "2026-10-05T16:30:00+08:00"
updated: "2026-10-05T16:30:00+08:00"
cover: "/generated-covers/061-astra.webp"
description: "ASTRA 怎样从 MCP tool graph 合成 SFT trajectories，再把 QA decomposition 编译成可执行 RL environments；逐层拆清数据、judge、reward、真实样本、评测结果与公开实现的证据边界。"
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
.astra-reading .figure{width:100%;margin:27px 0}.astra-reading .figure img{display:block;width:auto;max-width:100%;max-height:820px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.astra-reading .figure.wide img{max-width:min(1120px,calc(100vw - 42px));margin-left:50%;transform:translateX(-50%)}.astra-reading .figure figcaption{max-width:760px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.astra-reading .figure.source img{border:0}.astra-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.astra-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.astra-reading .note.red{border-color:var(--red);background:color-mix(in srgb,var(--red) 6%,var(--surface))}.astra-reading .note p{margin:.34em 0}.astra-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .88rem/1.7 var(--mono);overflow-x:auto}.astra-reading .steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.astra-reading .steps li{min-height:144px;padding:13px;background:var(--surface)}.astra-reading .steps b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.astra-reading .steps span{display:block;color:var(--soft);font-size:.76rem;line-height:1.5}.astra-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.astra-reading .case h4{margin:0 0 8px;font-size:1.12rem}.astra-reading .case ol{padding-left:1.2rem}.astra-reading .case li{margin:.58rem 0}.astra-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.astra-reading .limit-grid>div{padding:17px;background:#fff}.astra-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.astra-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
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
  <div class="deck-head"><strong>18 页交互图解 · 两条数据生产线、真实 sample、reward、评测与局限</strong><a href="/lib/decks/astra-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/astra-visual-guide.html" title="ASTRA 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">ASTRA 是一套训练 tool agent 的数据与环境生产线。它先从 MCP tool documentation 合成多轮 SFT trajectories，让 base model 学会基本的选工具、填参数和接续 tool output；再把有依赖关系的 QA 拆解编译成 Python mock tools，让模型在可执行环境里做 online RL。论文把 <strong>cold start、长轨迹 rollout、可执行反馈和调用效率</strong> 放进了同一套训练方案。</p>

<div class="interest"><b>博客作者兴趣度 8.5 / 10</b><span>评分只表示博客作者本人兴趣程度；这篇与 tool agent 训练、environment synthesis 和长轨迹 RL 高度相关</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>54,885</strong><span>SFT conversation samples</span></div>
  <div class="metric"><strong>6,596</strong><span>RL environments / samples</span></div>
  <div class="metric"><strong>4.37</strong><span>RL sample 平均 reasoning hops</span></div>
  <div class="metric"><strong>+17.29</strong><span>14B 在 ACEBench overall 的提升</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>SFT 与 RL 数据不是同一条 pipeline。</strong>前者从 MCP tools 出发，后者从 QA decomposition 出发。</li>
    <li><strong>论文里至少有四种不同的“检查”。</strong>task filter、SFT trajectory judge、RL environment validation、训练 reward 解决的是不同问题。</li>
    <li><strong>最大的增益来自 RL。</strong>14B 与 32B 在三项 agentic benchmark 上都明显超过 base；SFT 提供 cold start，但并非每个子项都上升。</li>
    <li><strong>code-executable 不等于现实正确。</strong>公开 environment checker 只验证目标 answer 是否出现在 stdout，公开 RL row 0 还存在同名 tool collision 和目标 payment output 无法复现的问题。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### MCP、trajectory、environment 和 online RL 分别是什么？

**MCP server** 在这里可以先理解成一组有 JSON schema 和自然语言说明的 tools。比如一个旅行服务可能暴露 `find_reservation`、`get_baggage_allowance`、`calculate_fee` 与 `process_payment`。ASTRA 的 SFT 分支读取这些说明，不需要先有人工写好的问答。

**Trajectory** 是一次完整交互：user query、assistant reasoning、tool call、tool output、下一步调用和 final answer 都在里面。SFT 学的是这条已经生成好的记录；online RL 则让当前 policy 在环境中重新 rollout，根据整条执行结果更新参数。

**Environment** 是 tool call 真正落地的地方。ASTRA 的 RL environment 并不是连接真实航空、支付或医院系统，而是针对一个 QA graph 生成的 Python mock tools。因此“可执行、可验证”准确地说是：代码能运行，已知输入能返回预设答案；它不自动保证模拟世界与现实世界一致。
</aside>

## Q1. ASTRA 想解决的训练瓶颈是什么？

**强 tool agent 既需要广覆盖的示范轨迹，也需要能反复 rollout、稳定给 reward 的多步环境；现有路线通常只解决其中一半。**

只做 SFT，数据可以离线生成，训练也稳定，但模型看到的是固定答案，无法从自己当前 policy 的错误中学习。只做 RL，又会遇到 cold start：base model 连基本的 tool selection 和 argument filling 都不稳定，很难探索到足够多的成功轨迹。更麻烦的是，很多工作让另一个 LLM 临时扮演 tool 或 environment；这样扩展很快，却可能让同一个 action 在不同 rollout 中得到不同 state transition，reward 也不再是确定规则。

ASTRA 因而把问题拆成两段：

1. 用 tool graph 合成大量、跨领域的多轮 trajectory，先做 SFT；
2. 用 QA dependency graph 生成样本级 Python environment，再做 multi-turn online RL。

<figure class="figure wide">
  <img src="/lib/papers/astra/two-pipeline-redrawn.svg" alt="ASTRA 的 SFT trajectory synthesis 与 RL environment synthesis 两条独立生产线">
  <figcaption>根据论文 Sections 2-3 与 Figures 2-4 重绘。SFT branch 的起点是 MCP tool documents；RL branch 的起点是带 dependency 的 QA。两边最终在训练阶段汇合，不应把它们写成一条数据流水线。</figcaption>
</figure>

这套设计的实际含义很直接：SFT 负责让模型“先会用工具”，RL 再训练“在一个任务中连续做对，并且少走弯路”。论文把前者称为在 static tool topology 上拓宽能力，把后者称为在 semantic topology 上加深能力。这个说法略抽象，落到数据上就是：一边组织哪些 tools 可能连续出现，另一边组织一个答案依赖哪些中间事实。

## Q2. 它与已有 tool-agent 训练和 environment synthesis 工作差在哪里？

**ASTRA 把大规模 SFT cold start 与 QA-derived executable environments 接成了一套公开 pipeline；tool graph、trajectory synthesis 和 GRPO 则分别有已有工作。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>代表工作</th><th>主要解决什么</th><th>ASTRA 的位置</th></tr></thead>
  <tbody>
    <tr><td>大规模 tool-use SFT</td><td>ToolLLM、ToolACE、Toucan</td><td>从 API / tool inventory 生成 query、call 与 response</td><td>同样从 tool documents 起步；额外聚合同一 server 内的 transition graph，并生成完整多轮 trajectory。</td></tr>
    <tr><td>多轮 trajectory synthesis</td><td>MAGNET、ToolACE-MT、APIGen-MT</td><td>用 graph、blueprint 或 simulator 构造连续调用</td><td>最接近 ASTRA 的 SFT branch；区别是 ASTRA 还把合成 trajectory 用作第二阶段 RL 的 cold start。</td></tr>
    <tr><td>数据闭环与 text-to-trajectory</td><td>LoopTool、GEM</td><td>围绕模型弱点迭代数据，或从文本恢复隐含流程</td><td>ASTRA 除了生成离线轨迹，还把 QA decomposition 编译成能执行的独立 tools。</td></tr>
    <tr><td>Environment scaling</td><td>EnvScaler、AutoForge、AgentScaler、CuES、GenEnv</td><td>自动生成 executable environments、tasks、validators 或 curriculum</td><td>这是 ASTRA 的最近邻；其组合点是 QA-derived environment、F1 trajectory reward、irrelevant-tool mixing 与两阶段训练。</td></tr>
  </tbody>
</table>
</div>

论文对 earlier multi-turn work 的一个重要批评是：有的方法虽然先生成多轮数据，训练时却把它拆成独立 single-step instances，模型仍没有真正学习“读完上一条 tool output 再决定下一步”。ASTRA 保留整段 assistant–tool 交互，并允许 online rollout 最长 32 turns。

不过，“fully automated”也要读得准确。它表示 pipeline 不需要逐条人工标注，不表示每一步都有外部事实 oracle。SFT 的质量主要由 LLM judges 决定；RL tools 由 LLM 根据目标 QA 生成，验证的也是与目标答案的自洽性。这一点决定了它更像一座可扩展的 synthetic training factory，而不是现实 API 的数字孪生。

## Q3. 54,885 条 SFT trajectories 是怎样造出来并筛选的？

**SFT branch 先把同一个 MCP server 内的 tools 连成 transition graph，再生成 task、执行完整交互，最后用七项 LLM score 过滤 trajectory。**

作者从 open MCP registries、RapidAPI、内部 tool specifications 和公开数据集收集文档，统一成 OpenAI-style function calling schema。少于三个 tools、说明含糊或 schema 无法转换的 server 会被丢弃；最后保留 **1,585 个 MCP servers、19,036 份 tool documents、41 个 domains**。论文明确限制组合发生在同一 server 内，不做跨 server workflow。

<figure class="figure wide source">
  <img src="/lib/papers/astra/official-sft-pipeline.webp" alt="ASTRA 官方 SFT trajectory synthesis pipeline">
  <figcaption>官方仓库 <code>assets/sft-pipeline.png</code>（Apache-2.0），对应论文 Figure 2。它把 tool collection、chain construction、task generation、multi-turn interaction 和 reward system 分成五段。</figcaption>
</figure>

<ul class="steps">
  <li><b>1 · COLLECT</b><span>清洗 schema，按来源 service 分组，过滤不可用 documents。</span></li>
  <li><b>2 · BUILD GRAPH</b><span>LLM 先提出 task 与 plausible chain；连续 tools 形成有向边，再做 length-bounded random walk。</span></li>
  <li><b>3 · VERIFY</b><span>检查后续 tool 的 required arguments 能否来自 query 或前序 output，也检查 task-chain coherence。</span></li>
  <li><b>4 · MAKE TASKS</b><span>合并 chain-conditioned 与 server-only 两类 task，再做 diversity、complexity、persona augmentation。</span></li>
  <li><b>5 · ROLLOUT</b><span>Qwen-Agent 调 deployed MCP 或 stateful emulator，记录完整 trajectory 后评分。</span></li>
</ul>

task 先过三项门槛：question quality、scenario realism、tool-use necessity。trajectory 生成时，真实部署的 MCP 会直接执行；只有文档、没有可用 backend 的 tools 则由 stateful LLM emulator 返回结果。为了让模型遇到失败后继续处理，emulated calls 以 **20% 概率**注入 timeout 或 unreachable 一类错误。

### 七项 trajectory judge 到底在看什么？

评分分成七个维度，最后取算术平均：

<div class="table-scroll">
<table>
  <thead><tr><th>维度</th><th>看哪一段</th><th>判断内容</th></tr></thead>
  <tbody>
    <tr><td>Query Understanding</td><td>最初 assistant response</td><td>是否正确理解 user query。</td></tr>
    <tr><td>Query Planning</td><td>最初 assistant response</td><td>初始 plan 是否可行、完整。</td></tr>
    <tr><td>Tool-call Understanding</td><td>每一步局部 context</td><td>是否正确读懂上一条 tool response。</td></tr>
    <tr><td>Tool-call Planning</td><td>每一步局部 context</td><td>下一步 action 是否由当前证据支持。</td></tr>
    <tr><td>Tool-call Success</td><td>执行记录</td><td>调用是否成功完成。</td></tr>
    <tr><td>Tool Conciseness</td><td>整条 trajectory</td><td>是否有重复或不必要调用。</td></tr>
    <tr><td>Final Answer</td><td>最终回答与 tool evidence</td><td>是否相关、完整，并忠实于执行结果。</td></tr>
  </tbody>
</table>
</div>

这里有一个论文正文没强调、但公开实现值得注意的细节：judge request 抛异常，或返回对象没有 `score` 字段时，代码会写入 **1.0**。

<div class="code-scroll"><pre><code>if isinstance(result, Exception):
    scores.append(1.0)
else:
    scores.append(result.get("score", 1.0))
</code></pre></div>

这是一种 **fail-open** 策略：评审服务失败并不会保守地拒绝样本，反而给满分。论文没有报告实际有多少 trajectories 触发 fallback，因此不能断言它显著污染了训练集；但在复现或扩展时，应改成 fail-closed、重试后隔离，至少把 fallback rate 报出来。

公开代码与论文公式还有一个小差异。论文 Equation 8 把成功调用记为 1、失败调用记为 0；`reward.py` 实际计算的是 `(1.0 × success + 0.5 × fail) / total_calls`，因此失败调用仍有 0.5 分。这个差异不会改变“七项求平均”的框架，却会改变 trajectory 的具体排序，复现实验时应该固定以论文还是代码为准。

最终 SFT 数据包含 **54,885 个 conversations、580,983 条 messages**，每条平均 10.59 条 message 和 4.42 次 tool call，覆盖 6,765 个 unique tool functions。公开 Hugging Face release 是 **1,000 条样本**，不是论文中的完整 54,885 条。

## Q4. 6,596 个 RL environments 怎样生成、验证和给 reward？

**RL branch 先把主问题拆成带 dependency 的 sub-QA graph，再把需要外部信息的 sub-question 编成 Python tool。checker 验证代码对目标输入能输出目标字符串；训练时按 sub-task coverage 与 tool-call 数量计算 F1 reward。**

<figure class="figure wide source">
  <img src="/lib/papers/astra/official-rl-pipeline.webp" alt="ASTRA 官方 QA-based RL environment synthesis pipeline">
  <figcaption>官方仓库 <code>assets/env.png</code>（Apache-2.0），对应论文 Figure 3。QA decomposition、necessity check、verification、environment synthesis 与 tool merging 是构造步骤；它们不是训练时的 reward。</figcaption>
</figure>

主问题先被拆成若干 sub-questions，并显式标出哪些可以并行、哪些依赖前一步答案。LLM 随后做四类结构检查：dependency 是否合理、每个 sub-question 是否 atomic、执行顺序是否正确、合起来是否足以回答 main question。需要 tool 的节点依次生成 tool document、补充 parameters、生成 call statement 和 Python implementation；功能接近的节点最后可以合并到一个 tool 里。

QA 可以由已有 main question 条件生成，也可以让 LLM 根据 domain-specific knowledge source `K` 和 hop budget `H` 从头生成。论文只把 `K` 说明为 text corpus 一类知识源，没有列出这些材料的上游出处、license、去重规则或 train/test leakage audit。公开仓库带有可运行的 `knowledge/en/*.jsonl` 与 `knowledge/zh/*.jsonl` 输入，其中也能找到下文行李 case 的来源场景，但仓库同样没有交代这些文本由谁编写或从哪里采集。整个 decomposition 与四项 quality check 都由 LLM 完成，作者没有加入人工标注，也就没有 annotator agreement 可报告。

训练时，policy 看到 user query、当前可选的 tool schemas，以及每次执行后返回的 tool output。`sub_qa_dict` 中的目标 answers 用来计算 reward，并不作为作答提示交给 policy；每个 sample 的 Python environment 彼此隔离，不共享 state。

### Environment validation 验证了什么？

公开 `step_04_env_synthesis.py` 的关键通过条件如下：

<div class="code-scroll"><pre><code>call_ans = get_code_sandbox_ans(final_code)
if call_ans["status"] == "Success":
    if q_a_pairs["answer"] in call_ans["run_result"]["stdout"]:
        is_success = True
</code></pre></div>

也就是说，生成的 Python code 在 sandbox 中执行成功，并且 stdout **包含**目标 answer，就算通过；失败则重新生成。这个检查能建立 executable self-consistency：已知 call 确实能得到合成 QA 指定的答案。它没有连接真实 database 或 API，也不检查其他输入上的行为，所以不能把它解释成 factual correctness 或完整的 tool semantics validation。

数据规模是 **6,596 个 samples、28,794 个 sub-questions**；91.3% 的 sub-questions 需要 tool，平均 4.37 个 reasoning hops。任务中 71.2% 为英文、28.8% 为中文；47.8% 是 Parallel Multi-Hop，34.8% 是 Multi-Hop。公开 release 同样只放出 **1,000 条**。

### 训练 reward 与上面的 checker 不是一回事

设一条 job 有 `n` 个目标 sub-tasks，当前 rollout 命中 `n_hat` 个，tool 一共调用 `c` 次：

<div class="formula">recall r = n_hat / n　　precision p = n_hat / (c + ε)　　reward = 2pr / (p + r)</div>

做全 4 项、正好调用 4 次，reward 接近 1；做全 4 项却调用 6 次，F1 约为 0.80；只做对 3 项、调用 4 次，约为 0.75。这里的 precision 不是分类 precision，而是“每次 tool call 解决了多少目标 sub-task”的效率分。

为防止模型只会在给出的正确 tools 中机械选择，作者还混入 high / medium / low similarity 三档 irrelevant tools，阈值分别是 `>0.85`、`0.4-0.85`、`<0.4`。消融曲线显示不加 distractors 最差，随机加 5-9 个优于不加，但低于分档采样；论文没有提供曲线终点的精确表格值，因此不应从图上臆测具体提升。

### 一个公开的行李加购 sample：从 task 到 PASS / FAIL

<figure class="figure wide">
  <img src="/lib/papers/astra/baggage-case-redrawn.svg" alt="ASTRA-RL-1k 行李加购样本、四个目标 sub-QA 与公开 tool mismatch">
  <figcaption>根据 Hugging Face <code>ASTRA-RL-1k</code> train row 0 重绘，revision <code>dbc70e26</code>。绿色路径是数据声明的目标；红色分支是我核对公开 <code>tool_schema</code> 与 <code>tool_dict</code> 后发现的不一致。</figcaption>
</figure>

<div class="case">
<h4>按执行顺序看这个 released row</h4>
<ol>
  <li><strong>User request。</strong>Amit Kumar 要修改 Bengaluru City 与 Chennai Central 之间、9 月 20 日去程和 9 月 23 日返程的 reservation，把 baggage allowance 从 1 件加到 3 件；先告知费用，再用 wallet 支付。</li>
  <li><strong>目标 sub-QA。</strong><code>reservation_finder</code> 应给出 <code>RES987654</code>；<code>baggage_allowance_retriever</code> 给出当前 1 bag；<code>baggage_fee_calculator</code> 算出额外 ₹600；<code>payment_processor</code> 应返回支付成功和 <code>TXN123456789</code>。</li>
  <li><strong>理想 rollout。</strong>四个目标都命中、调用四次，<code>n_hat=4, n=4, c=4</code>，F1 reward 接近 1。重复查 reservation 或 fee 会增加 <code>c</code>，即使最终答案完整也会扣分。</li>
  <li><strong>公开 artifact 的问题。</strong><code>tool_schema</code> 有 9 项，其中两个都叫 <code>payment_processor</code>；转成按名称索引的 <code>tool_dict</code> 后只剩 8 个 unique names。保留下来的 implementation 返回 <code>Charge processed successfully...</code>，transaction ID 通常随机生成，无法复现目标 <code>Payment successful. Transaction ID: TXN123456789</code>。</li>
  <li><strong>可能的评测后果。</strong>前三个 sub-task 可以命中，但 payment target 按公开实现无法稳定命中。若其他判定逻辑不补偿，结果会落到 <code>3/4</code> 一类，而不是理想 PASS。</li>
</ol>
</div>

这是公开 1k 子集中的一行缺陷，**不能据此推断内部全部 6,596 个 environments 都有问题**。它能说明的是：仅做 answer-in-stdout 的逐 tool validation，没有捕获 tool merging、同名覆盖或最终序列化后产生的跨组件不一致。更可靠的 release check 应该在最终 artifact 上逐行重放全部 target calls，并检查 tool name uniqueness、deterministic outputs 与 reward target 一致性。

## Q5. 训练和外部评测具体怎样做，结果说明了什么？

**SFT 提供稳定的 cold start，RL 带来更大且更一致的三榜提升；但最终结果同时包含数据、environment、reward、distractor 与 batching 的作用，不能归因给单一组件。**

SFT 从 Qwen3-14B 和 Qwen3-32B 开始，各训练 2 epochs；学习率分别为 `5e-6` 与 `2e-6`。RL 使用 GRPO，batch size 与 mini-batch size 都是 256，学习率 `2e-6`；最大 prompt 25,600 tokens，最大 response 49,152 tokens，user 与 assistant 都允许最多 32 turns。作者去掉 KL regularizer 与 entropy bonus，并使用 batch-level token loss averaging。

长轨迹 RL 还有一个常见问题：同一 query 的一组 rollouts 如果 reward 完全相同，group-relative advantage 就是 0，这组样本不产生有效梯度。ASTRA 的 **Adaptive Batch Filling** 只接受 reward standard deviation 大于阈值的 groups，先把有效 samples 填满 batch，多出来的放入 buffer 留到下一步；它改变的是每次优化时“有没有可学的对比”，不是 environment judge。

<div class="table-scroll">
<table>
  <thead><tr><th>Benchmark</th><th>测什么</th><th>论文 protocol</th><th>需要注意</th></tr></thead>
  <tbody>
    <tr><td>BFCL-v3 MT</td><td>多轮 function calling，含 missing function、missing parameter、long context</td><td>vLLM，temperature 0.6</td><td>论文未报告 repeated trials 或置信区间。</td></tr>
    <tr><td>τ²-Bench</td><td>agent 与 user simulator 共同推进环境状态</td><td>排除 airline；GPT-5.1 user simulator；temperature 0；4 trials；报告 pass^1</td><td>airline 因先前报告指出 ground-truth grading 质量问题而排除。</td></tr>
    <tr><td>ACEBench</td><td>multi-turn 与 multi-step tool use</td><td>agent split 50 题；GPT-4.1 user simulator；temperature 0.6；重复 4 次</td><td>样本仍小，小分差要谨慎。</td></tr>
    <tr><td>AIME 2024/2025</td><td>检查非 agentic 数学推理是否退化</td><td>temperature 0.6、top-p 0.95；top-k 20 与 -1 各 32 generations</td><td>两种 decoding 的 pass-rate estimate 再平均。</td></tr>
  </tbody>
</table>
</div>

<figure class="figure wide">
  <img src="/lib/papers/astra/results-redrawn.svg" alt="ASTRA 14B 与 32B 从 base 到 SFT 再到 RL 的三项 agentic benchmark 变化">
  <figcaption>根据论文 Table 2 重绘。三组柱分别是 base、SFT 与 RL；数字是各 benchmark overall，而不是混成一个总分。</figcaption>
</figure>

14B 从 base 到最终 RL，BFCL-MT 为 **44.50→58.13**，τ²-Bench 为 **44.55→57.70**，ACEBench 为 **51.67→68.96**。32B 分别是 **47.88→64.25**、**49.70→63.70**、**59.79→71.88**。三榜方向一致，而且 RL stage 的增量普遍大于 SFT stage。

但 SFT 不是所有子项都变好。BFCL Missing Function 在 14B 上从 39.50 降到 25.50，在 32B 上从 52.50 降到 40.00；RL 后才分别升到 56.00 与 65.50。这说明离线示范能改善常规调用习惯，却可能让 policy 更倾向“总要找个 tool 用”；加入 irrelevant tools 和在线 reward 后，拒绝不存在功能的能力才恢复。

AIME 用于检查核心 reasoning 是否被 tool training 破坏。14B 在两种 decoding 下的平均分别为 73.45→73.40 与 72.60→72.60；32B 为 74.90→74.85 与 74.15→75.15。可以说没有观察到系统性退化，但它不是一般能力的全面评测。

## Q6. 这篇论文最值得复用什么，证据边界又在哪里？

**最值得复用的是把训练系统分层：SFT data quality、environment self-consistency、trajectory reward 和 external evaluation 各自有独立 contract；最需要补的是 fail-closed validation、最终 artifact 重放与更完整的因果消融。**

<div class="limit-grid">
  <div><b>LLM judge 会 fail-open</b><span>SFT scorer 异常或缺少 score 时默认 1.0。论文没有报告 fallback rate，公开实现也没有把异常样本隔离。</span></div>
  <div><b>可执行不等于事实正确</b><span>RL checker 验证目标 answer 出现在 stdout，证明的是 self-consistency；没有真实系统或独立 oracle 证明 mock semantics。</span></div>
  <div><b>公开 release 不是完整训练数据</b><span>论文报告 54,885 SFT 与 6,596 RL samples；Hugging Face 各公开 1,000 条，仓库的 <code>trajectory_synthesis/data</code> 则有 1,482 个 MCP server rows 和 941 个 task rows。</span></div>
  <div><b>RL training 不能端到端复现</b><span>仓库公开了两条 synthesis pipelines、数据子集和模型，但没有提供论文使用的 RL training scripts 与完整内部数据。</span></div>
  <div><b>主结果缺少多 seed</b><span>τ² 与 ACEBench 有重复 evaluation；训练本身没有 multiple seeds，也没有给主要分数的置信区间。</span></div>
  <div><b>组件贡献没有完全隔离</b><span>irrelevant tools 与 reward 有曲线消融，但缺少 SFT data、environment source、batch filling 等组件的完整 factorial ablation。</span></div>
</div>

论文的 F1 reward 设计尤其值得保留：它把“任务做了多少”和“用了多少次工具”放到同一个容易解释的 scalar 里；recall-only 会鼓励不断调用，precision-only 会鼓励过早停止，论文的训练曲线也显示两者后期崩溃，而 F1 保持稳定。与此同时，公开 baggage row 说明 **reward 再漂亮，也依赖 target 与 environment implementation 对齐**。数据工程中的 name collision 或随机输出会直接改变模型收到的学习信号。

如果沿这条路线继续研究，我会优先补三项：第一，在最终 merged environment 上重放所有 golden calls，而不是只验证生成中间件；第二，用真实 API 或独立 simulator 做 held-out transfer，测 mock environment 学到的 policy 能否迁移；第三，在同样 rollout budget 下分别拿掉 SFT cold start、similarity-stratified distractors 与 Adaptive Batch Filling，报告多 seed 的稳定性。这样才能回答提升究竟来自更多合成数据，还是来自更好的训练 contract。

<aside class="note blue">
<p><strong>结论：</strong>ASTRA 把 <strong>MCP graph → SFT trajectory</strong> 与 <strong>QA graph → executable RL environment</strong> 接成两阶段 tool-agent 训练系统，并在 14B / 32B 上得到一致的三榜提升。它说明了长轨迹训练可以怎样分层；“rule-verifiable”的实际边界则是合成环境内部可执行、自洽，并不证明现实事实。后续实现还需要修复 fail-open judge 与 baggage sample mismatch。</p>
</aside>

</div>

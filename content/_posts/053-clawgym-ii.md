---
title: "[2026-08-17] ClawGym II: Exploring Black-Box RL on Agent Harness"
permalink: "/posts/论文解读/clawgym-ii.html"
date: "2026-09-29T18:30:00+08:00"
updated: "2026-10-14T03:10:00+08:00"
cover: "/generated-covers/053-clawgym-ii.webp"
description: "ClawGym II 保留 Claude Code 和 OpenClaw 的工具执行流程，通过模型调用记录和任务评分训练模型。本文解释分支怎样恢复、哪些生成不参与训练，并实际运行公开周报任务的检查程序，核对评分与实验边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 20
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Claude Code"
  - "OpenClaw"
  - "Reinforcement Learning"
  - "Benchmark"
---

<style>
html:not([data-theme="dark"]) body:has(.claw-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:31ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.claw-reading{--column:780px;--blue:#285d9b;--orange:#ad5735;--green:#2b7562;--red:#a0443d;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.claw-reading>*{max-width:100%}.claw-reading p,.claw-reading li{text-wrap:pretty}.claw-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.claw-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.claw-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.claw-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.claw-reading .deck-head strong{font-size:.92rem}.claw-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.claw-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.claw-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.claw-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.claw-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.claw-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line-local));background:color-mix(in srgb,var(--blue) 5%,#fff)}.claw-reading .interest b{color:var(--blue);font:750 1.2rem/1 var(--mono)}.claw-reading .interest span{color:var(--soft);font-size:.84rem}
.claw-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.claw-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.claw-reading .metric:last-child{border-right:0}.claw-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.22rem,3vw,1.68rem)/1 var(--serif)}.claw-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.claw-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.claw-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.claw-reading .keypoints ul{margin:0;padding-left:1.2rem}.claw-reading .keypoints li{margin:.42rem 0}.claw-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--green);background:var(--surface)}.claw-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.claw-reading .kicker{display:block;margin-bottom:6px;color:var(--green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.claw-reading h2{margin-top:3.55rem}.claw-reading h3{margin-top:2.1rem}.claw-reading h4{margin-top:1.7rem}.claw-reading strong{font-weight:750}.claw-reading .table-scroll,.claw-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.claw-reading .table-scroll table{display:table;width:100%;min-width:720px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.claw-reading th,.claw-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.claw-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.claw-reading td:first-child{font-weight:650}.claw-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.claw-reading code{font-size:.92em}
.claw-reading .figure{width:100%;margin:27px 0}.claw-reading .figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.claw-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.claw-reading .figure-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:26px 0}.claw-reading .figure-grid .figure{min-width:0;margin:0}.claw-reading .figure-grid .figure img{width:100%}
.claw-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.claw-reading .role{padding:16px;background:#fff}.claw-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.claw-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.claw-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.claw-reading .flow li{min-height:132px;padding:12px;background:var(--surface)}.claw-reading .flow b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.claw-reading .flow span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.claw-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.claw-reading .case h4{margin:0 0 8px;font-size:1.12rem}.claw-reading .case ol{padding-left:1.2rem}.claw-reading .case li{margin:.58rem 0}.claw-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.claw-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.claw-reading .verdict strong{display:block;margin-bottom:4px}.claw-reading .verdict .pass strong{color:var(--green)}.claw-reading .verdict .fail strong{color:var(--red)}
.claw-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.claw-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.claw-reading .note p{margin:.34em 0}.claw-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.claw-reading .judge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:22px 0;background:var(--line-local)}.claw-reading .judge-grid>div{padding:16px;background:#fff}.claw-reading .judge-grid b{display:block;color:var(--blue);font-size:.93rem}.claw-reading .judge-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.82rem;line-height:1.5}.claw-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.claw-reading .limit-grid>div{padding:17px;background:#fff}.claw-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.claw-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.claw-reading .metrics{grid-template-columns:1fr 1fr}.claw-reading .metric:nth-child(2){border-right:0}.claw-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.claw-reading .flow{grid-template-columns:1fr 1fr}.claw-reading .roles,.claw-reading .judge-grid{grid-template-columns:1fr}.claw-reading .figure-grid{grid-template-columns:1fr}.claw-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.claw-reading .flow,.claw-reading .verdict,.claw-reading .limit-grid{grid-template-columns:1fr}.claw-reading .part0,.claw-reading .case{padding:17px 15px}.claw-reading .deck-head,.claw-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="claw-reading">

<p class="paper-meta">Huatong Song et al. · arXiv:2608.16798v1 · 2026-08-17</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.16798">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.16798">论文 PDF</a>
  <a href="https://github.com/SsmallSong/ClawGym-II">论文代码页</a>
  <a href="https://github.com/ClawGym/ClawGym-Bench">ClawGym-Bench</a>
  <a href="https://github.com/ClawGym/ClawGym-SynData">ClawGym-SynData</a>
</div>

<section class="deck-wrap" aria-label="ClawGym II 交互图解">
  <div class="deck-head"><strong>20 页交互图解 · 调用分支、真实评分与跨执行程序结果</strong><a href="/lib/decks/clawgym-ii-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/clawgym-ii-visual-guide.html" title="ClawGym II 论文图解，共 20 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">ClawGym II 希望训练模型在 Claude Code 或 OpenClaw 里工作，同时保留这些程序原有的工具调用、历史压缩和错误恢复逻辑。训练系统记录模型请求与回复，任务结束后检查产出的文件，再根据得分更新模型。关键步骤是恢复调用之间的关系：重试留下的旧回复要排除，生成历史摘要与执行子任务的调用也不能直接接受主任务分数。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读前提</span>

### 先分清 model、harness、environment 和 verifier

Model（模型）生成下一段回答或工具调用。Harness 是模型外的执行程序：它构造提示、声明工具、执行调用、返回结果，也可能重试、调用子 Agent 或压缩历史。Environment 是本题的工作目录与工具；verifier 是任务结束后检查最终目录并打分的程序。Rollout 指一次完整任务执行，trajectory 指其中按顺序连接的模型生成和环境反馈。

ClawGym II 里的 black-box 指 harness 对训练器是黑盒，不是模型参数不可见。训练器仍然持有并更新待训练模型，只是不接管 Claude Code 或 OpenClaw 的执行顺序。它在两处接入：模型 API 处收集原始生成，任务结束后拿测试分数（reward）。PPO 和 GRPO 都用这些分数提高表现较好记录的生成概率；PPO 额外训练价值模型（value model）预测未来分数；GRPO 用同题多次执行计算 advantage，即比组平均好或差多少。

每题包含任务说明、初始化目录和对应检查程序。ClawGym-Bench 的检查项可以部分得分，得到的是 0 到 1 的完成度。论文把整体指标称为 Pass@1，通常这个名字表示一次尝试的成功率；但公开程序平均的是连续任务分，没有“全部要求满足才算成功”的阈值。阅读结果时要保留这个区别。
</aside>

<div class="interest"><b>作者兴趣度 9.8 / 10</b><span>与 Claude Code、Codex 一类完整 harness 的在线训练高度相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>52.64 → 62.62</strong><span>OpenClaw · ClawGym-Bench · 30A3B</span></div>
  <div class="metric"><strong>37.06 → 51.87</strong><span>Claude Code · ClawGym-Bench · 30A3B</span></div>
  <div class="metric"><strong>75.61 → 87.32</strong><span>OpenClaw · PinchBench</span></div>
  <div class="metric"><strong>54.14 → 71.42</strong><span>Claude Code · PinchBench</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>训练接口放在模型服务端点。</strong>Harness 内部逻辑不变，代理保存原始 token、生成时的对数概率和任务标识。</li>
    <li><strong>模型调用先按共同历史连接成前缀树。</strong>丢弃被重试替代的旧分支、生成历史摘要与执行子任务的辅助调用；压缩历史后继续执行主任务的记录仍保留。</li>
    <li><strong>ClawGym-Bench 的公开实现给的是连续完成度分数。</strong>论文称指标为 Pass@1，但 runner 实际汇总 <code>final_score</code> 的均值，没有发现二值化阈值。</li>
    <li><strong>主结果没有重复训练或置信区间。</strong>提升很大且覆盖两种 harness，但稳定性证据主要来自单条训练曲线。</li>
  </ul>
</aside>


<h2 id="保留原本执行流程，为什么还需要恢复调用结构？">1. Motivation：保留原本执行流程，为什么还需要恢复调用结构？</h2>

**部署时用哪套 harness，训练时最好让模型经历同一套交互。** Claude Code 和 OpenClaw 会自己决定怎样定义工具格式、怎样把工具结果写回提示、什么时候重试、什么时候压缩上下文。把这些行为重写成训练框架内部的工具调用循环，虽然方便收集执行记录，却也换掉了模型真正要适应的环境。

黑盒接入的麻烦在于，一次任务不会自然留下“一条干净序列”。模型服务代理看到的是多次彼此相关的模型调用。OpenClaw 遇到格式错误的工具调用可能重新生成；上下文压缩会从短历史重新开始；子 Agent 也会形成另一条调用链。训练器如果把每次调用当成独立样本，共享历史会被重复计算，任务最终分还可能错误地用于训练辅助分支。

另一个风险更隐蔽。Harness 可能把模型输出重新序列化后再放回上下文，例如规范化工具调用格式。如果训练器事后从重新整理的文本再次编码，token 编号未必与实际生成时相同。即使 tokens 相同，生成引擎与训练引擎的精度、计算实现和并行方式不同，重算的概率也可能漂移。**这篇论文的核心工程目标是：保留原生 harness，同时让任务分、原始 token 和生成概率能用于强化学习更新。**

<figure class="figure reading-diagram"><a href="/lib/papers/clawgym-ii/reading-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/clawgym-ii/reading-method.svg" alt="根据原论文 Figure 1 与 §3.1–§3.3 重绘；正文纵向阅读图" width="600" height="1481"></a><figcaption>根据原论文 Figure 1 与 §3.1–§3.3 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/clawgym-ii/pipeline.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/clawgym-ii/pipeline.svg" alt="ClawGym II black-box RL 完整流水线" width="1600" height="900"></a>
  <figcaption>根据原论文 Figure 1 与 §3.1–§3.3 重绘。原程序在临时隔离环境中运行；代理记录模型生成；验收只检查最终工作区；训练器按恢复后的调用树更新模型。</figcaption>
</figure>
</details>

<h2 id="与-ClawGym、POLAR-和-LEGO-RL-的区别">2. Related Work：与 ClawGym、POLAR 和 LEGO-RL 的区别</h2>

**ClawGym II 的区别是把零散模型调用接成前缀树（prefix tree），再让 PPO／GRPO 按分支结构训练。** 前缀树用共同历史作共享节点，重试或并行调用形成不同分支；它不是第一次把现成 Agent 接入 RL。 与它同期的多项工作也把模型 API 当作接入点。比较时要把任务来源、harness 控制权、记录怎样连接、验收文件怎样隔离分开看。

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>任务 / 环境</th><th>Harness 是否原样运行</th><th>训练信号怎样接入</th><th>与 ClawGym II 的主要区别</th></tr></thead>
  <tbody>
    <tr><td>ClawGym</td><td>合成工作区任务；程序检查与模型评分规则</td><td>面向 OpenClaw</td><td>提供 SynData、Bench 和初始模型</td><td>提供数据和初始模型；ClawGym II 在其上增加保留原执行程序的在线强化学习。</td></tr>
    <tr><td>POLAR</td><td>多类 Agent 任务</td><td>是</td><td>在模型服务端点收集生成</td><td>同样支持现成执行程序；ClawGym II 详细处理分叉调用和树上的训练。</td></tr>
    <tr><td>Dressage</td><td>多 Agent / 多隔离环境</td><td>是</td><td>通用执行记录收集系统</td><td>偏系统扩展性；ClawGym II 聚焦从黑盒调用记录恢复训练序列。</td></tr>
    <tr><td>OpenForgeRL</td><td>可插拔环境</td><td>是</td><td>保留原部署程序的强化学习</td><td>目标接近；ClawGym II 额外给出 OpenClaw / Claude Code 的分叉处理与跨执行程序实验。</td></tr>
    <tr><td>LEGO-RL</td><td>2,699 道代码任务；Harbor 任务验收</td><td>Claude Code、OpenHands、OpenCode</td><td>进程内代理保存 token；训练时重放 MoE 模型的专家选择</td><td>详细说明了执行调度、验收隔离与调试；ClawGym II 对前缀树、PPO 和混合执行程序训练讲得更细。</td></tr>
    <tr><td>White-box AgentLoop</td><td>ClawGym 任务</td><td>否，训练器自行定义调用循环</td><td>直接记录全部状态与动作</td><td>更容易把得分分配到生成步骤；换到 OpenClaw 后交互方式发生变化。</td></tr>
  </tbody>
</table>
</div>

这张表不是独立复现排名。POLAR、Dressage 与 OpenForgeRL 的位置来自各自论文或官方仓库，ClawGym II 对相关工作的描述也带有作者视角。真正可比的实验是论文自己的白盒 AgentLoop 与 OpenClaw 的迁移对比：同一 WhiteBox-30A3B 在训练用的 AgentLoop 下为 59.90，放进 OpenClaw 后降到 50.33；直接在 OpenClaw 内训练的 ClawII-OC-30A3B 为 62.62。

<h2 id="调用恢复、分支训练与真实任务评分">3. Method：调用恢复、分支训练与真实任务评分</h2>

**代理保存原始生成，训练器恢复调用分支，任务检查程序只在执行结束后给最终目录打分。**

<h3 id="3-1-Proxy-先保存事实，prefix-tree-再恢复结构">3.1 Proxy 先保存事实，prefix tree 再恢复结构</h3>

每个 rollout 在独立临时隔离环境中运行。OpenClaw 或 Claude Code 仍然负责工具执行与控制顺序；模型服务代理保存每次请求的输入 token、输出 token、生成时的对数概率和任务标识。

第 <code>i</code> 次调用的输入是 <code>x_i</code>，模型输出是 <code>y_i</code>。树构造器查找已有节点，找出与本次输入匹配的最长历史前缀，再接上这次调用；两个节点之间新增的内容就是工具输出或其他环境反馈。从根到叶连起来，得到一条候选执行序列。

<figure class="figure">
  <a href="/lib/papers/clawgym-ii/prefix-tree.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/clawgym-ii/prefix-tree.svg" alt="Prefix tree 的构造与过滤" width="1600" height="900"></a>
  <figcaption>根据论文 §3.2.1 至 §3.2.3 绘制。按历史压缩点划分交互段，每段保留延续最长的有效末端，排除重试留下的短分支。生成历史摘要与子 Agent 的辅助调用不训练；压缩后继续执行主任务的段保留。分支数过多则丢弃整次执行，阈值未披露。</figcaption>
</figure>

例如模型先读文件，第一次工具调用格式错误，于是从共同历史重试：失败尝试没有后续，成为 dead leaf（被重试替代的末端），应排除；真正继续修改并测试的路径保留。历史压缩会建立一个新交互段，所以不是在整次任务里只留一条最长路径。<strong>同一次执行保留的主任务分支使用同一个最终目录分数，共享历史中的生成 token 只训练一次。</strong>这些是论文规则的说明例，不是公开的完整模型日志。

<h3 id="3-2-GRPO-与-PPO-怎样把一个-reward-写回树">3.2 GRPO 与 PPO 怎样把一个 reward 写回树</h3>

GRPO 以同一“任务 × harness”的 `n` 次完整执行为一组。先完成执行和验收，再计算组均值 `μq` 和标准差 `σq`，最后把每次执行的得分变成相对表现：

<div class="formula">Âᵢ = (Rᵢ − μq) / (σq + ε)</div>

同次执行的所有保留节点拿到同一个相对得分 advantage `Âᵢ`。PPO 则把每条分支当作独立执行路径，设 `γ = 1、λ = 1`，在自己的末 token 接收 reward `Rᵢ`：

<div class="formula">Âₜ = Rᵢ − Vφ(sₜ)</div>

一个分支的优势不会传播给兄弟分支。比如最终分为 1、价值模型在某位置预测 0.6，则该位置 advantage 为 0.4；这是公式说明例。作者承认这仍是简化：value model 要从早期状态预测很远的最终分数，不做时间折扣可能增加波动。

<h3 id="3-3-保留原始-token，并修正两套引擎的概率差">3.3 保留原始 token，并修正两套引擎的概率差</h3>

训练引擎直接使用生成端保存的原始 token，不重新编码 harness 改写后的文本。原程序使用解码后的文本执行工具；训练器使用原始 token 更新模型。两个引擎的概率仍可能不同，因此论文给每个训练 token 乘上有上限的重要性权重：

<div class="formula">wₜ = min(exp(log πold(aₜ|sₜ) − log πrollout(aₜ|sₜ)), c̄)</div>

这里比较同一个 token 在训练引擎与生成引擎的旧模型概率，再用上限 <code>c̄</code> 限制权重。按整条序列修正理论上更接近无偏，但长记录会使权重波动很大；论文改用逐 token 修正，接受一定偏差以降低波动。截断阈值 <code>c̄</code> 没有披露。

<h3 id="3-4-先收齐记录，再训练；执行故障要另外处理">3.4 先收齐记录，再训练；执行故障要另外处理</h3>

原生程序的异步操作还带来三个问题，论文 §3.4 给了具体处理。

一次回复还没生成完时，harness 的流式解析器可能误判工具调用结束。作者先缓存整轮生成，同时持续发送保活的 Server-Sent Events（SSE），等这一轮完整返回后再解析一次。论文称它为 pseudo-streaming：接口仍是流式，工具调用的解析却推迟到整轮结束。

外部请求返回也不代表后台记录已写完。组装前缀树之前，训练系统反复检查记录数量，等数量连续不变且没有待写记录，再取数据；固定超时防止一直等待。这一步叫 settling，作用是避免收进半条执行记录，检查间隔和等待上限未公布。

初始化失败、HTTP 错误等明确的隔离环境故障会被排除，<strong>既不参加组均值／标准差计算，也不进入模型更新。</strong>达到墙钟时间上限的长任务则强制结束；论文没有完整说明每种超时最终保留哪些 token、如何评分，不能一概写成“所有超时都给 0”。

<h3 id="3-5-混合训练：同题在不同执行程序里分别比较">3.5 混合训练：同题在不同执行程序里分别比较</h3>

同一道任务在 OpenClaw 与 Claude Code 中可能呈现不同工具协议、上下文管理和任务分分布。ClawGym II 会把 `(task, OpenClaw)` 与 `(task, Claude Code)` 当成两个组，分别计算组内相对表现，再共同更新一个模型。这样不会把“这套执行程序本来更易得分”误当成某条生成更好。

<h3 id="3-6-数据生成、人工复核与基准筛选">3.6 数据生成、人工复核与基准筛选</h3>

这部分数据流程来自前作 ClawGym 与其公开生成仓库，不是 ClawGym II 重新建立的数据集。ClawGym-SynData 约有 13.5K 题，来自两条合成路线。

<div class="roles">
  <div class="role"><b>按用户需求生成</b><span>GPT-5 根据用户角色、9 大类／43 子类场景和 7 类／26 种基础操作生成任务。</span></div>
  <div class="role"><b>按技能组合生成</b><span>MiniMax-M2.5 标注约 30K 条 ClawHub 技能描述，筛到约 16K；GPT-5 选 1 个主要技能，最多加 3 个辅助技能。</span></div>
  <div class="role"><b>生成检查，再做复核</b><span>GPT-5 生成模拟工作区、验收程序和模型评分规则；GPT-5.4 检查任务、难度、验收与两种评分的分工。</span></div>
</div>

前作从训练数据随机抽 50 题做人工检查：任务合理性 4.46／5，可执行性 3.50／5，资源一致性 4.36／5，评分质量 3.92／5，总平均 4.06／5。可执行性最弱，不能只报总体均分就说每题可靠；没有多标注者一致性，也没有说明训练数据全量经过人工复核。

ClawGym-Bench 从未用于训练的合成题中筛选 200 题。候选题由一个强模型和一个小模型各试 4 次。平均分要求：强模型 ≥ 0.2，小模型 ≤ 0.6，且强模型高于小模型。GPT-5.4 先检查，人工再接受、修改或拒绝；论文没有披露两种模型的具体名称。最终 156 题只用程序验收，44 题再加入模型评分。

<h3 id="3-7-真实周报任务：输入、产物与隐藏检查">3.7 真实周报任务：输入、产物与隐藏检查</h3>

下面这条 case 来自官方 `benchmark_data.jsonl` 第一行，类别是 `Messaging and Collaboration`。任务内容是为志愿者污染修复团队准备周报。它来自前作的合成与复核流程，不是现实组织提供的人工任务；公开记录未注明这条具体任务由哪位人工审阅者修改。

<div class="case">
<h4>Agent 看到的任务与目录</h4>
<ol>
  <li>Agent 能读取 <code>data/tasks.csv</code>、<code>data/updates.jsonl</code>、<code>input/draft_announcement.txt</code>、<code>tools/summarize.py</code> 和两个公开 pytest 文件。</li>
  <li>Agent 要在 <code>build/</code> 下生成 <code>summary.json</code>、<code>test_results.txt</code>、<code>status_report.md</code> 和 <code>announcement_rewrite.txt</code>。</li>
  <li>CSV 有 7 条任务：<code>todo=2</code>、<code>in_progress=2</code>、<code>done=2</code>、<code>blocked=1</code>。周报要复现这些统计，列出最新 3 条更新、受阻任务和进行中任务；公告少于 120 词，包含 <code>thank you</code>、<code>let's coordinate</code> 和四种状态。</li>
</ol>

<h4>任务结束后的隐藏评分</h4>
<ol start="4">
  <li>Agent 看不到 <code>reward/test.py</code>、两条模型评分规则和评分提示。执行结束后，评测程序才在最终工作区上运行验收。</li>
  <li>Python 验收程序返回 15 个等权的 0/1 检查项，包括文件存在、JSON 与重新计算结果一致、提交的测试日志显示通过、周报各段准确，以及公告长度和必需短语。它不重新执行 pytest。</li>
  <li>论文使用 GPT-5.4 评公告语气和回复要求是否明确。评分提示要求每条规则取 0、0.25、0.5、0.75 或 1；公开解析器只把数值限制在 0 到 1，并没有强制数值落在这五个点上。</li>
</ol>

<div class="verdict"><div class="pass"><strong>实际运行程序检查：15/15</strong>本文按规则构造四个输出，先运行摘要程序和公开 pytest，得到 <code>2 passed</code>，再执行原任务的检查器，15 项全得 1。没有调用模型评分器；若两条模型评分都为 1，论文协议下总分也是 1。</div><div class="fail"><strong>只颠倒更新顺序：14/15</strong>检查器期望任务 4、3、2，改成 2、3、4 后，只有 <code>status_report_highlights_top3_correct</code> 变成 0。程序分 14/15；假设语气评分不变且都为 1，论文协议下为 <code>0.9533</code>。这是本文构造并实测的失败输入，不是模型日志。</div></div>
</div>

<div class="code-scroll"><pre><code># 官方 reward/test.py 的完整公告长度分支；其他字段略
announcement_path = build_dir / "announcement_rewrite.txt"
if announcement_path.exists():
    scores["announcement_exists"] = 1.0
    ann_text = _read_text(announcement_path) or ""
    wc = _word_count(ann_text)
    if wc &lt; 120:
        scores["announcement_under_120_words"] = 1.0</code></pre></div>

真实输入让顺序检查很明确：任务 4 更新于 4 月 15 日 09:15，任务 3 更新于 4 月 14 日 18:20，任务 2 更新于 4 月 14 日 10:05。检查器按时间倒序、同时间按任务编号升序，逐条比较 <code>- [编号] 原更新文本</code>。受阻项必须有任务 5／Nora；下一步必须列出任务 2／Marco 和任务 4／Sam。只有数量正确而文本、编号或顺序不对，仍会丢对应分数。

<figure class="figure reading-diagram"><a href="/lib/papers/clawgym-ii/reading-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/clawgym-ii/reading-case.svg" alt="真实周报案例的输入、隐藏检查与实测失败结果" width="600" height="1630"></a><figcaption>根据 ClawGym-Bench revision c8cbd1d 的 case 与公开评分代码绘制。本文实测原检查器；模型评分未运行，总分只作条件计算。</figcaption></figure>

<details class="reading-evidence"><summary>完整案例重绘图（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/clawgym-ii/judge-case.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/clawgym-ii/judge-case.svg" alt="真实 ClawGym-Bench case 的可见输入、隐藏 judge 和分数聚合" width="1600" height="900"></a>
  <figcaption>根据 ClawGym-Bench revision c8cbd1d 的 case、reward.py、judge.py 与 runner.py 绘制。公开评分模型只接收任务、待评文件和评分规则；论文 Appendix A 的评分提示还列出其他修改文件和可选执行记录，两者并不完全一致。</figcaption>
</figure>
</details>

公告不存在时，存在、长度、短语和行动要求四项都为 0。本文删除测试目录里的公告重新运行检查器，程序分从 1 变成 <code>11/15</code>；文件存在性是长度检查的前置条件。

真正需要警惕的是另外两处。其一，<code>tests_all_passed</code> 只搜索提交的 <code>test_results.txt</code> 中是否有 <code>passed</code>，且没有 <code>failed</code>、<code>error</code> 或 <code>traceback</code>。本文把日志改成单词 <code>passed</code> 后，该项仍得 1。**它证明日志文本符合规则，不独立证明测试确实执行且通过。**

其二，任务要求把 <code>summary.json</code> 的原字符串复制进周报，但提供的摘要程序输出缩进两空格的多行 JSON，隐藏检查器要求键排序、无多余空格的一行 JSON。本文原样复制多行文件内容，只丢 <code>status_report_raw_json_line_exact</code>，程序分为 <code>14/15</code>；重新序列化为紧凑单行则通过。这个差异是任务说明与检查实现的不一致，不是模型读错统计。

<p>这些检查可用 <a href="/lib/papers/clawgym-ii/worked-case-checks.py">本文的可运行脚本</a>复核（Python 3.11+、pytest；实际核查使用 Python 3.13.5）。脚本读取固定版本的第一条任务，在临时目录运行原摘要程序、公开测试与隐藏检查器，只构造解释性输出；不会调用模型，也不代表复现论文训练。</p>

对程序与模型混合评分的题目，论文 §4.1.1 指定：

<div class="formula">s_task = 0.7 · s_code + 0.3 · s_rubric</div>

其中 <code>s_code</code> 是程序返回数值的均值，<code>s_rubric</code> 是模型评分总和除以满分总和。**公开 CLI 和 <code>combine_scores()</code> 默认权重却是 0.5／0.5**，要显式传入 <code>--code-weight 0.7 --rubric-weight 0.3</code> 才与论文一致。上面的 14/15 失败例，论文配置下为 0.9533，默认配置下则为 0.9667。

缺分要分层看：模型漏报某一条评分规则时，这一条计 0，满分分母不变；整个程序侧或模型侧没有数值时，公开实现重新归一化，只使用另一侧。若整题没有数值，<code>save_run_summary()</code> 不把它计入平均分的分母，而是另外记录 <code>attempts</code>（总执行数）与 <code>scored_attempts</code>（有分执行数）。因此不能只看平均分，还要看缺分率；本文没有据此推断作者实际实验漏掉了多少题。

最后要把指标名称说准确。论文把 Table 1 的结果称为 Pass@1；公开 runner 的 <code>save_run_summary()</code> 却直接对有分执行的连续 <code>final_score</code> 求 <code>mean_score</code>，没有“满分才算 pass”的二值阈值。**下面保留论文报告的指标名称和数值，同时注明公开实现汇总的是一次执行的平均完成度。**

<h2 id="两套执行程序的训练结果与迁移实验">4. Experiments：两套执行程序的训练结果与迁移实验</h2>

**两种 harness 内的训练成绩都提高，但跨 harness 迁移后仍有差距；两边的初始化模型也不同。**

<h3 id="4-1-主结果：两个-harness-内都能学到提升">4.1 主结果：两个 harness 内都能学到提升</h3>

论文训练 Qwen3-8B 与 Qwen3-30A3B。OpenClaw 的主实验从 ClawII-Cold 开始：这是先用部分 ClawGym-SynData 执行记录做轻量监督训练的模型；Claude Code 直接从原始 Qwen3 模型开始。每次请求的上下文窗口为 64K token，长任务由 harness 自行压缩历史，<strong>64K 不是整题累计生成额度。</strong>ClawGym-Bench 有 200 题；PinchBench 使用 2026 年 4 月 10 日任务集，去掉多模态题后保留 30 题。主要结果如下：

<figure class="figure reading-diagram"><a href="/lib/papers/clawgym-ii/reading-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/clawgym-ii/reading-results.svg" alt="根据论文 Table 1 重绘；正文纵向阅读图" width="600" height="1334"></a><figcaption>根据论文 Table 1 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/clawgym-ii/results.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/clawgym-ii/results.svg" alt="ClawGym II 30A3B 主结果" width="1600" height="900"></a>
  <figcaption>根据论文 Table 1 重绘，柱长按 0–100 缩放。OpenClaw 两个增益相对 ClawII-Cold-30A3B；Claude Code 两个增益相对原始 Qwen3-30A3B。</figcaption>
</figure>
</details>

<div class="table-scroll">
<table>
  <thead><tr><th>模型／执行程序</th><th>ClawGym-Bench 初始分</th><th>RL 后</th><th>增益</th><th>PinchBench 初始分</th><th>RL 后</th><th>增益</th></tr></thead>
  <tbody>
    <tr><td>ClawII-OC-8B / OpenClaw</td><td>47.06</td><td>54.98</td><td>+7.92</td><td>71.29</td><td>77.44</td><td>+6.15</td></tr>
    <tr><td>ClawII-OC-30A3B / OpenClaw</td><td>52.64</td><td><strong>62.62</strong></td><td><strong>+9.98</strong></td><td>75.61</td><td><strong>87.32</strong></td><td>+11.71</td></tr>
    <tr><td>ClawII-CC-8B / Claude Code</td><td>18.54</td><td>42.05</td><td>+23.51</td><td>27.40</td><td>61.21</td><td>+33.81</td></tr>
    <tr><td>ClawII-CC-30A3B / Claude Code</td><td>37.06</td><td><strong>51.87</strong></td><td><strong>+14.81</strong></td><td>54.14</td><td><strong>71.42</strong></td><td>+17.28</td></tr>
  </tbody>
</table>
</div>

这些数值支持同一训练接口能在两种 harness 内提高模型表现；不能直接排名 Claude Code 和 OpenClaw，因为初始模型、初始分和交互方式都不同。

相邻基线也要看：OpenClaw 下的 ClawII-OC-30A3B 为 62.62，比前作监督训练模型 ClawGym-30A3B 的 56.82 高 5.80 分，但 RL 起点是另一份 ClawII-Cold 权重，不是从这份监督模型继续训练的配对对照。分项上也非全面提高，Analysis & Reasoning 为 64.09，低于 ClawGym-30A3B 的 64.64。

<h3 id="4-2-PPO-与-GRPO：相同执行次数，不等于相同计算量">4.2 PPO 与 GRPO：相同执行次数，不等于相同计算量</h3>

GRPO 每次更新使用 32 题 × 每题 8 次；PPO 使用 256 题 × 每题 1 次，所以两者同为 256 次执行。PPO 覆盖更多不同题，但额外训练价值模型，还先做价值模型预训练；GRPO 用同题多次采样计算相对表现。论文控制的是执行次数，没有控制生成 token 总数、GPU 时间和价值模型的额外成本。

Figures 2 与 3 的训练分和验证分在约 200 至 400 次更新中总体上升。生成分布的熵（entropy，反映输出选择的分散程度）在 PPO 中较平滑，OpenClaw 的 GRPO 后期下降更明显。熵平稳不是通用稳定性证明，两边初始化不同也会影响曲线。

这部分没有重复训练，也没有置信区间。曲线说明单次训练没有明显崩溃，不能回答不同随机种子下的均值与方差。

<h3 id="4-3-更难任务、混合训练与初始化对照">4.3 更难任务、混合训练与初始化对照</h3>

在 Claude Code 内执行任务时，JobBench-Easy 从 20.46 提高到 27.20，OfficeQA-Full 从 8.53 提高到 21.54。前者要求从图片、数据库、Office 文件等资源产出工作结果，后者从文档中找证据、计算并回答问题。作者按两者格式合成训练题；没有披露各自训练数量、完整构造细节或逐题得分，不能写成直接在测试题上训练。

Figure 4 的混合训练从原始 Qwen3-30A3B 开始，没有 ClawII-Cold 预训练，不能把它直接接在 Table 1 的 OpenClaw 主实验之后。每次更新随机混入 32 个“任务 × harness”组合，每组 8 次，总计 256 次执行，<strong>不是每套 harness 各 256 次。</strong>同题在两套程序内分别计算组均值，再共同更新一个模型。

作者报告混合训练模型在两套程序下都与单程序训练相当或略高，证据是曲线而非完整数值表，也没有重复训练。因此它支持共同训练可行，还不足以证明混合训练稳定优于单程序训练。

Figure 7 单独固定 OpenClaw、Qwen3-30A3B 和 GRPO，比较轻量监督预训练与直接从原始模型开始。两者都能学，但预训练组从更高任务分开始，验证分持续更强，熵也较平稳。这是“初始化不能忽略”的直接证据；预训练子集大小和完整超参数没有披露。

<h3 id="4-4-White-box-能迁移，但没有抹平-harness-差异">4.4 White-box 能迁移，但没有抹平 harness 差异</h3>

<figure class="figure">
  <a href="/lib/papers/clawgym-ii/transfer.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/clawgym-ii/transfer.svg" alt="White-box AgentLoop 到 OpenClaw 的迁移结果" width="1600" height="900"></a>
  <figcaption>根据论文 Table 2 重绘。WhiteBox-30A3B 在训练用 AgentLoop 下得 59.90，转到 OpenClaw 后为 50.33；直接在 OpenClaw 内训练的 ClawII-OC-30A3B 为 62.62。</figcaption>
</figure>

WhiteBox-30A3B 在训练器自定义的 AgentLoop 中训练，转到 OpenClaw 后仍比原始 Qwen3-30A3B 的 45.11 高 5.22 分，说明部分能力能迁移。但它从原环境的 59.90 降到 50.33，而且 Content & Domain 分项从原始模型的 51.95 降到 50.36，并非所有类别提高。

直接在 OpenClaw 内训练的模型得 62.62，与迁移模型相差 12.29 分；这个比较提示工具协议、提示组织和历史管理会影响表现。两组初始化与训练过程未被完全控制，不能把全部差距都归因为某一种协议。

<h2 id="应复用的记录规则与需要补的对照">5. Discussion：应复用的记录规则与需要补的对照</h2>

**首先保存原始生成，而不是最终聊天文本。** 至少记录输入／输出 token、生成时对数概率、任务和模型版本、结束原因、最终目录及测试分数。

**其次说明哪段生成接受哪份分数。** 重试、历史压缩、并行调用和子 Agent 不一定是同一条执行；树结构能避免重复训练共享历史，但仍需要说明辅助调用为什么该接受或不接受主任务分数。

**跨执行程序的收益需要完整配对对照。** 固定任务、初始权重、执行次数、采样参数和测试程序，分别在 A、B、A+B 中训练，再全部放回 A、B 评测，才能区分通用能力、特定工具协议适配和更多数据的收益。

**评分程序需要逐项试错，不只检查能否得满分。** 周报案例中，假的测试通过日志仍能得分，忠实复制 JSON 文件却失分。应构造只违反一条要求的输出，同时核对任务文字与隐藏程序是否一致。

论文排除的是生成历史摘要和子 Agent 的辅助调用，保留压缩后继续执行主任务的记录。以后若要训练辅助调用，需要先建立能检查它们局部产出的评分，直接把主任务最终分广播过去仍缺依据。

<h2 id="已有证据与公开实现缺口">6. Conclusion：已有证据与公开实现缺口</h2>

**我给 9.8 / 10 的作者兴趣度。** 它和 Claude Code、Codex 这类完整 harness 的研究问题高度重合，而且具体说明了 API 记录、前缀树恢复、分支过滤、原始 token 保存、概率修正和按任务／执行程序分组。论文也做了 OpenClaw、Claude Code、white-box AgentLoop、JobBench、OfficeQA 与 PinchBench 的多角度实验。

需要保留六个限制：

<div class="limit-grid">
  <div><b>训练代码缺口</b><span>截至核查时，论文 companion GitHub 仓库为空。Prefix-tree 和 trainer 实现无法独立复现。</span></div>
  <div><b>方差未知</b><span>没有多随机种子重复训练或置信区间；曲线平稳只说明展示的这次训练。</span></div>
  <div><b>评分口径有差异</b><span>论文写 Pass@1，公开 runner 平均连续任务分，且只把有数值的执行计入分母；默认权重也与论文不同。</span></div>
  <div><b>评分模型收到的信息不同</b><span>Appendix A 含其他修改文件与可选执行记录；公开版本的 judge.py 不传这两项。</span></div>
  <div><b>部分配置未披露</b><span>难度校准模型、分支数阈值、初始化预训练规模，以及 JobBench／OfficeQA 合成训练题数量未披露。</span></div>
  <div><b>混合训练证据偏弱</b><span>只有曲线和“相当或略高”的描述，没有完整表格、重复训练或完全配对的跨程序消融。</span></div>
</div>

<strong>黑盒 harness 中的模型可以通过任务分训练，前提是正确恢复调用关系，并保留原始生成与概率。</strong>论文在两套程序和两种模型规模上展示了明显提升。若要进一步主张模型能通用不同执行程序，还需要公开核心实现、统一初始条件和完整迁移对照。

<div class="note blue"><p><strong>证据说明：</strong>论文采用 arXiv non-exclusive distribution license，本文没有直接复制原图。Figure 1、Table 1 与 Table 2 以数据和机制重绘；Figures 2–8 的信息在文字与图表中总结。官方 ClawGym II 代码页截至核查时为空；case 与 judge 依据 ClawGym-Bench revision <code>c8cbd1d0df033af24fc14064d40d6964ca8f611f</code>，数据生成流程依据 ClawGym-SynData revision <code>98d0478ca2a0fbda22fcbba5da3e5e03da95f20d</code>。</p></div>

</div>

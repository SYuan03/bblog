---
title: "ClawGym II: Exploring Black-Box RL on Agent Harness"
permalink: "/posts/论文解读/clawgym-ii.html"
date: "2026-09-29T18:30:00+08:00"
updated: "2026-09-29T18:30:00+08:00"
cover: "/generated-covers/053-clawgym-ii.webp"
description: "从一条真实 ClawGym-Bench 任务入手，拆解 ClawGym II 如何在不改写 OpenClaw 与 Claude Code 内部逻辑的前提下恢复 prefix tree、计算 PPO/GRPO reward，并说明公开 judge 与论文指标之间的证据边界。"
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
  <div class="deck-head"><strong>20 页交互图解 · Prefix tree、真实 judge 与跨 harness 结果</strong><a href="/lib/decks/clawgym-ii-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/clawgym-ii-visual-guide.html" title="ClawGym II 论文图解，共 20 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">ClawGym II 研究的是一件很实用、也很容易被系统细节弄坏的事：如果训练对象要在 Claude Code 或 OpenClaw 里工作，能否保留这套 harness 原有的工具调用、上下文压缩和错误恢复逻辑，只在模型 API 边界收集 trajectory，再用 PPO 或 GRPO 更新模型？论文给出的答案是可以，但必须先解决分叉轨迹、token 对齐和终局 reward 的归因。</p>

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
    <li><strong>训练接口放在 model-serving boundary。</strong>Harness 内部逻辑保持不动，proxy 保存 exact tokens、rollout log-prob 和 task metadata。</li>
    <li><strong>零散 model calls 要先恢复成 rollout-level prefix tree。</strong>重试产生的 dead leaves、compaction 与 subagent 分支不能直接继承主任务 reward。</li>
    <li><strong>ClawGym-Bench 的公开实现给的是连续完成度分数。</strong>论文称指标为 Pass@1，但 runner 实际汇总 <code>final_score</code> 的均值，没有发现二值化阈值。</li>
    <li><strong>主结果没有重复训练 run 或置信区间。</strong>提升很大且覆盖两种 harness，但稳定性证据主要来自单条训练曲线。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先分清 model、harness、environment 和 verifier

Model 负责生成下一段 assistant tokens。Harness 是模型外面的控制系统：它拼 prompt、声明工具、执行 tool call、把结果塞回上下文，还可能重试、调用 subagent 或压缩历史。Environment 是这道任务的 workspace 与可执行工具。Verifier 在 rollout 结束后读取最终 workspace，产出 reward。

ClawGym II 里的 black-box 指 harness 对训练器是黑盒，不是模型参数不可见。训练器仍然持有并更新 policy model，只是不接管 Claude Code 或 OpenClaw 的 control flow。它在两处与外部系统相接：模型 API 处收集生成记录，任务结束后从 verifier 拿 reward。

论文把每道任务抽象成 instruction、初始化 workspace 和 task-specific verifier。这个抽象决定了方法能否迁移到 JobBench-style 或 OfficeQA-style 任务，也决定了评测质量最终受 checker 质量约束。
</aside>

## Q1. 为什么要绕过 harness 内部逻辑做 RL？

**部署时用哪套 harness，训练时最好让模型经历同一套交互。** Claude Code 和 OpenClaw 会自己决定怎样组织工具 schema、怎样把 tool result 写回 prompt、什么时候重试、什么时候压缩上下文。把这些行为重写成训练框架内部的 agent loop，虽然方便拿 trajectory，却也换掉了模型真正要适应的环境。

黑盒接入的麻烦在于，一次任务不会自然留下“一条干净序列”。Serving proxy 看到的是多次彼此相关的 model calls。OpenClaw 遇到 malformed tool call 可能重新生成；上下文压缩会从短历史重新开始；subagent 也会形成另一条调用链。训练器如果把每个 call 当成独立样本，共享历史会被重复计算，终局 reward 还可能错误地广播给辅助分支。

另一个风险更隐蔽。Harness 可能把模型输出重新序列化后再放回上下文，例如规范化 tool call。如果训练器事后从 transcript 重新 tokenize，得到的 token IDs 未必是 rollout 时真实采样的序列。即使 tokens 相同，inference engine 与 training engine 的精度、kernel 和并行方式不同，重算的概率也可能漂移。**这篇论文的核心工程目标是：保留原生 harness，同时让 reward、token 与 log-prob 仍能组成可用的 policy-gradient 样本。**

<figure class="figure">
  <img src="/lib/papers/clawgym-ii/pipeline.svg" alt="ClawGym II black-box RL 完整流水线">
  <figcaption>根据原论文 Figure 1 与 §2.1–§2.3 重绘。Harness 在临时 sandbox 中运行；proxy 记录模型侧数据；verifier 只看最终 workspace；trainer 根据恢复后的树更新 policy。</figcaption>
</figure>

## Q2. 它和 ClawGym、POLAR、LEGO-RL 等工作到底差在哪里？

**ClawGym II 的辨识度在 prefix-tree reconstruction 和 fork-aware PPO/GRPO，而不是“第一次把现成 Agent 接入 RL”。** 与它同期的多项工作也把 model API 当作接入点。比较时要把任务来源、harness 控制权、轨迹表示和 reward 隔离分开看。

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>任务 / 环境</th><th>Harness 是否原样运行</th><th>训练信号怎样接入</th><th>与 ClawGym II 的主要区别</th></tr></thead>
  <tbody>
    <tr><td>ClawGym</td><td>合成 workspace tasks；code checker + rubric</td><td>面向 OpenClaw</td><td>构造 SynData、Bench 与 cold-start models</td><td>提供数据和初始模型；ClawGym II 在其上增加 black-box online RL。</td></tr>
    <tr><td>POLAR</td><td>多类 agentic tasks</td><td>是</td><td>model-serving boundary</td><td>同属 any-harness 路线；ClawGym II 详细处理 forked calls 与 tree loss。</td></tr>
    <tr><td>Dressage</td><td>多 Agent / 多 sandbox</td><td>是</td><td>通用 rollout infrastructure</td><td>偏系统扩展性；ClawGym II 聚焦从黑盒 traces 恢复训练轨迹。</td></tr>
    <tr><td>OpenForgeRL</td><td>可插拔环境</td><td>是</td><td>harness-native RL</td><td>目标接近；ClawGym II 额外给出 OpenClaw / Claude Code 的分叉处理与 cross-harness 实验。</td></tr>
    <tr><td>LEGO-RL</td><td>2,699 个 coding tasks；Harbor verifier</td><td>Claude Code、OpenHands、OpenCode</td><td>in-process proxy、token capture、routing replay</td><td>工程闭环和 reward 防作弊更完整；ClawGym II 对 prefix tree、PPO 与 mix-harness 讲得更细。</td></tr>
    <tr><td>White-box AgentLoop</td><td>ClawGym tasks</td><td>否，训练器定义 loop</td><td>直接拿完整 state/action trajectory</td><td>credit assignment 更直接；部署到 OpenClaw 时存在 harness distribution shift。</td></tr>
  </tbody>
</table>
</div>

这张表不是独立复现排名。POLAR、Dressage 与 OpenForgeRL 的位置来自各自论文或官方仓库，ClawGym II 对相关工作的描述也带有作者视角。真正可比的实验是论文自己的 white-box / OpenClaw transfer matrix：同一 WhiteBox-30A3B 在训练用的 AgentLoop 下为 59.90，放进 OpenClaw 后降到 50.33；直接在 OpenClaw 内训练的 ClawII-OC-30A3B 为 62.62。

## Q3. 从一次 model call 到 reward，完整流程怎样工作？

### 3.1 Proxy 先保存事实，prefix tree 再恢复结构

每个 rollout 在独立临时 sandbox 中运行。OpenClaw 或 Claude Code 仍然负责工具执行与 control flow；serving proxy 作为模型 endpoint，保存每次请求的 input tokens、output tokens、rollout log-prob 和 task metadata。

对第 (i) 次 model call，论文记输入 context 为 (x_i)，输出 response 为 (y_i)。树构造器把该 call 接到“累计历史是 (x_i) 最长前缀”的已有节点上。父节点的历史与子调用输入之间多出的内容，就是 harness 插入的 tool output 或环境反馈。Root-to-leaf path 因而恢复出一条候选 trajectory。

<figure class="figure">
  <img src="/lib/papers/clawgym-ii/prefix-tree.svg" alt="Prefix tree 的构造与过滤">
  <figcaption>根据论文 §2.2.1–§2.2.3 绘制。Retry dead leaf 被丢弃；over-branching rollout 整体丢弃；compaction 与 subagent trajectories 不进主任务 loss。论文没有公开 over-branching threshold。</figcaption>
</figure>

同一 rollout 的所有保留分支共享最终 workspace reward。训练时，branch-specific tokens 正常参与 loss，共享 prefix 在该 rollout 内只计一次，避免分支越多权重越大。

### 3.2 GRPO 与 PPO 怎样把一个 reward 写回树

GRPO 以同一道任务的 `n` 个 rollout 为一组，先对 rollout reward 做标准化：

<div class="formula">Âᵢ = (Rᵢ − μq) / (σq + ε)</div>

同一 rollout 的所有保留节点拿到同一个 advantage `Âᵢ`。PPO 则把每个 branch 当作独立 trajectory，设 `γ = 1、λ = 1`，在自己的末 token 接收 reward `Rᵢ`：

<div class="formula">Âₜ = Rᵢ − Vφ(sₜ)</div>

优势不会跨 branch point 传播给 sibling。作者也承认这是一种简化：critic 要从很早的 state 预测长程回报，而且没有时间折扣，advantage variance 可能更大。

### 3.3 Token-in-token-out 解决什么

Training engine 只使用 inference engine 当时生成并保存的 token，不把 harness 重写后的文本重新 encode。Harness 看到的 decoded text 和 trainer 看到的 token record 是两条用途不同的数据流。概率仍可能因 engine 实现不同而偏移，论文在每个训练 token 上乘一个截断 importance weight：

<div class="formula">wₜ = min(exp(log πold(aₜ|sₜ) − log πrollout(aₜ|sₜ)), c̄)</div>

Sequence-level correction 理论上更接近无偏，但长 trajectory 容易出现高方差；论文选择 token-level correction，在 bias 与 variance 之间折中。截断阈值 `c̄` 没有披露。

### 3.4 Mix-harness 为什么按 task-harness pair 分组

同一道 task 在 OpenClaw 与 Claude Code 中可能呈现不同工具协议、上下文管理和 reward 分布。ClawGym II 会把 `(task, OpenClaw)` 与 `(task, Claude Code)` 当成两个组，分别计算组内 advantage，再让两组梯度共同更新一个 policy。这样避免把 harness 差异混入 relative reward，同时仍能学习跨 harness 的共享行为。

### 3.5 训练任务和 benchmark 是谁做的

ClawGym-SynData 约有 13.5K 题，来自两条合成路线。

<div class="roles">
  <div class="role"><b>PERSONA ROUTE</b><span>GPT-5 根据 persona、9 大类 / 43 子类场景和 7 类 / 26 种 atomic operations 生成任务。</span></div>
  <div class="role"><b>SKILL ROUTE</b><span>MiniMax-M2.5 标注约 30K ClawHub skills，筛到约 16K；GPT-5 选择 1 个主 skill，最多加 3 个辅助 skills。</span></div>
  <div class="role"><b>VERIFICATION</b><span>GPT-5 生成 mock workspace、checker 与 rubric；GPT-5.4 检查 plausibility、difficulty、checker alignment 和互补性。</span></div>
</div>

作者从 50 个训练任务做人工抽样，四个质量维度均分 4.06 / 5。论文没有给多标注者一致性，也没有说明全量数据经过人工复核。

ClawGym-Bench 从未用于训练的合成题中筛选 200 题。候选题由一个 strong agent 和一个 small agent 各跑 4 次；入选条件是 strong average ≥ 0.2、small average ≤ 0.6，并且 strong > small。GPT-5.4 先诊断，human reviewer 最终 accept、revise 或 reject。论文没有披露 strong/small 的具体模型。最终 156 题只有 code checker，44 题同时有 code checker 与 rubric。

### 3.6 一条真实任务怎样从 workspace 走到分数

下面这条 case 来自官方 `benchmark_data.jsonl` 第一行，类别是 `Messaging and Collaboration`。任务内容是为志愿者污染修复团队准备周报。它不是我编造的例子，也不是现实组织贡献的人工任务；它来自前述合成与复核流程。

<div class="case">
<h4>Agent-visible brief</h4>
<ol>
  <li>Agent 能读取 <code>data/tasks.csv</code>、<code>data/updates.jsonl</code>、<code>input/draft_announcement.txt</code>、<code>tools/summarize.py</code> 和两个公开 pytest 文件。</li>
  <li>Agent 要在 <code>build/</code> 下生成 <code>summary.json</code>、<code>test_results.txt</code>、<code>status_report.md</code> 和 <code>announcement_rewrite.txt</code>。</li>
  <li>周报必须复现 CSV 统计，选出按时间倒序的 3 条最新 update，列出 blocked 与 in-progress 任务；公告要少于 120 词，包含 <code>thank you</code>、<code>let's coordinate</code> 和四种状态。</li>
</ol>

<h4>Hidden evaluation</h4>
<ol start="4">
  <li>Agent 看不到 <code>reward/test.py</code>、两条 rubric 和 judge prompt。Rollout 结束后，runner 才在最终 workspace 上执行 checker。</li>
  <li>Python checker 返回 15 个等权 0/1 metrics，包括文件存在、JSON 与计算一致、pytest 全过、周报各段准确，以及公告长度和必需短语。</li>
  <li>GPT-5.4 只评两件代码不容易判断的事：语气是否 constructive / collaborative，以及“请回复状态”的 actionability。每条 rubric 只能取 0、0.25、0.5、0.75 或 1。</li>
</ol>

<div class="verdict"><div class="pass"><strong>完整 PASS 轨迹</strong>四个文件存在，15/15 code metrics 全得 1；两条 rubric 都得 1。最终 <code>0.7 × 1 + 0.3 × 1 = 1</code>。</div><div class="fail"><strong>解释性 partial-fail 轨迹</strong>如果最新三条 update 排序错误，其余 14 项正确，code score 为 14/15。若两条 rubric 都得 1，最终分数为 <code>0.7 × 14/15 + 0.3 = 0.9533</code>。这是依据公开规则推导的例子，不是论文中的模型日志。</div></div>
</div>

<div class="code-scroll"><pre><code># 官方 reward/test.py 的核心结构，省略其余同类字段
scores = {
    "summary_json_exists": 0.0,
    "summary_json_valid_and_matches_computation": 0.0,
    "tests_all_passed": 0.0,
    "status_report_highlights_top3_correct": 0.0,
    "announcement_under_120_words": 0.0,
    # ... 共 15 项
}

ann_text = _read_text(announcement_path) or ""
if _word_count(ann_text) &lt; 120:
    scores["announcement_under_120_words"] = 1.0

return scores</code></pre></div>

<figure class="figure">
  <img src="/lib/papers/clawgym-ii/judge-case.svg" alt="真实 ClawGym-Bench case 的可见输入、隐藏 judge 和分数聚合">
  <figcaption>根据 ClawGym-Bench revision c8cbd1d 的 case、reward.py、judge.py 与 runner.py 绘制。公开实现中的 LLM judge 只接收 task、rubric target files 和 rubric；论文 Appendix A 的 prompt 还列出 additional changed files 与 optional transcript，两者并不完全一致。</figcaption>
</figure>

代码里还有一个小但真实的 blind spot：公告文件不存在时，<code>ann_text</code> 会变成空字符串，word count 等于 0，因此 <code>announcement_under_120_words</code> 仍得 1。缺文件的 <code>announcement_exists</code> 会得 0，所以总分不会满分，但“少于 120 词”这一项没有先检查文件存在。

对 hybrid task，公开 runner 的公式是：

<div class="formula">s_task = 0.7 · s_code + 0.3 · s_rubric</div>

其中 (s_{code}) 是 checker 返回数值的均值，(s_{rubric}) 是 rubric 分值总和除以满分总和。若某一侧没有得到数值，公开实现会只使用另一侧并重新归一化，而不是自动判 0。

最后要把指标名称说准确。论文把 Table 1 的结果称为 Pass@1；公开 runner 的 <code>save_run_summary()</code> 却直接对每次 rollout 的连续 <code>final_score</code> 求 <code>mean_score</code>，没有发现“满分才算 pass”的二值阈值。**因此，下面的数字最好理解为论文报告的 Pass@1，同时注明公开实现更像单次 rollout 的平均完成度分数。**

## Q4. 实验结果支持了哪些结论？

### 4.1 主结果：两个 harness 内都能学到提升

论文训练 Qwen3-8B 与 Qwen3-30A3B。OpenClaw runs 从 ClawII-Cold 初始化，Claude Code runs 直接从 Qwen3 base 初始化。30A3B 的主结果如下：

<figure class="figure">
  <img src="/lib/papers/clawgym-ii/results.svg" alt="ClawGym II 30A3B 主结果">
  <figcaption>根据论文 Table 1 重绘，柱长按 0–100 缩放。OpenClaw 两个增益相对 ClawII-Cold-30A3B；Claude Code 两个增益相对原始 Qwen3-30A3B。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>Model / harness</th><th>ClawGym-Bench baseline</th><th>RL 后</th><th>增益</th><th>PinchBench baseline</th><th>RL 后</th><th>增益</th></tr></thead>
  <tbody>
    <tr><td>ClawII-OC-8B / OpenClaw</td><td>47.06</td><td>54.98</td><td>+7.92</td><td>71.29</td><td>77.44</td><td>+6.15</td></tr>
    <tr><td>ClawII-OC-30A3B / OpenClaw</td><td>52.64</td><td><strong>62.62</strong></td><td><strong>+9.98</strong></td><td>75.61</td><td><strong>87.32</strong></td><td>+11.71</td></tr>
    <tr><td>ClawII-CC-8B / Claude Code</td><td>18.54</td><td>42.05</td><td>+23.51</td><td>27.40</td><td>61.21</td><td>+33.81</td></tr>
    <tr><td>ClawII-CC-30A3B / Claude Code</td><td>37.06</td><td><strong>51.87</strong></td><td><strong>+14.81</strong></td><td>54.14</td><td><strong>71.42</strong></td><td>+17.28</td></tr>
  </tbody>
</table>
</div>

这些数值支持“同一套 black-box RL 接口能在两种 harness 中工作”。它们不能证明 Claude Code 比 OpenClaw 更适合训练，因为两边的初始模型不同，base score 也不同。

### 4.2 PPO、GRPO 与 256-rollout budget

GRPO 每次 update 使用 32 tasks × 8 rollouts；PPO 使用 256 tasks × 1 rollout，所以两者同为 256 rollouts。PPO 每次覆盖更多不同任务，但要额外训练 value model；GRPO 能用同题多次采样计算相对 advantage。OpenClaw 与 Claude Code 的曲线在约 200–400 steps 内总体上升。作者观察到 PPO entropy 较平滑，GRPO 在 OpenClaw 后期出现更明显的 entropy 下降。

这部分没有重复 runs，也没有置信区间。曲线说明单次训练没有明显崩溃，不能回答 seed 变化后的均值与方差。

### 4.3 更难任务与 mix-harness

使用 Claude Code 生成 rollout 时，JobBench-Easy 从 20.46 提高到 27.20，OfficeQA-Full 从 8.53 提高到 21.54。论文只说明训练题是 JobBench-style / OfficeQA-style，没有披露各自的训练任务数量、完整构造细节或 task-level results。

Mix-harness 模型在 OpenClaw 与 Claude Code 上都达到“与 single-harness 相当或略高”的水平。证据来自训练曲线和作者描述，没有完整结果表，也没有重复 run。因此它更像一项可行性结果，还不足以证明跨 harness 训练稳定优于单 harness。

### 4.4 White-box 能迁移，但没有抹平 harness 差异

<figure class="figure">
  <img src="/lib/papers/clawgym-ii/transfer.svg" alt="White-box AgentLoop 到 OpenClaw 的迁移结果">
  <figcaption>根据论文 Table 2 重绘。WhiteBox-30A3B 在训练用 AgentLoop 下得 59.90，转到 OpenClaw 后为 50.33；直接在 OpenClaw 内训练的 ClawII-OC-30A3B 为 62.62。</figcaption>
</figure>

White-box policy 的确学到一部分通用 agent 能力，因为它在 OpenClaw 上仍比原始 Qwen3-30A3B 高 5.22 分。但 50.33 与 62.62 的差距说明，工具协议、prompt 组织和 context management 带来的 harness-specific behavior 没有消失。

## Q5. 对 Claude Code、Codex harness 研究有什么直接启发？

**第一，model API boundary 可以成为训练接口，但必须记录 token-level 事实。** 只保存最终 transcript 不够。至少要保存原始 input/output tokens、rollout log-prob、task identity、model version、termination reason 和最终 workspace 的 verifier result。

**第二，trajectory store 应该原生支持树，而不是把每个 call 塞进线性日志。** 重试、context compaction、parallel tool execution 和 subagent 都会产生非线性结构。研究 Codex 或 Claude Code 时，最好先定义“哪个 actor 的哪些 tokens 接受哪个 reward”，再决定怎样落盘。

**第三，跨 harness 训练要有严格的 transfer matrix。** 一个更有说服力的实验是固定 task pool、initial weights、rollout budget、sampling temperature 和 verifier，分别在 Harness A、Harness B 以及 A+B 中训练，再把三个 policy 都放回 A 与 B 评测。这样才能区分通用能力、harness specialization 和简单的数据量收益。

**第四，judge 应该像训练代码一样接受单元测试。** 本文真实 case 里的“缺文件仍通过 under-120-words”说明，一个看似合理的 binary metric 也会漏掉 prerequisite。可以为每个 checker 自动生成 minimally failing workspaces，检查每条 metric 是否真的在预期条件下翻转。

**第五，subagent 与 compaction 不一定永远该丢掉。** ClawGym II 先排除它们，避免错误 credit，这是稳妥的第一版。下一步可以给不同 actor 分开记 reward，或者只在有局部 verifier 时训练辅助轨迹。直接继承主任务终局 reward 仍然缺乏归因依据。

## Q6. 最后怎样评价这篇论文？

**我给 9.8 / 10 的作者兴趣度。** 它和 Claude Code、Codex 这类完整 harness 的研究问题高度重合，而且把“外部 Agent 怎么接 RL”推进到了一组可实现的机制：serving proxy、prefix-tree reconstruction、fork filtering、token-in-token-out、importance correction 和 task-harness grouping。论文也做了 OpenClaw、Claude Code、white-box AgentLoop、JobBench、OfficeQA 与 PinchBench 的多角度实验。

需要保留六个限制：

<div class="limit-grid">
  <div><b>训练代码缺口</b><span>截至核查时，论文 companion GitHub 仓库为空。Prefix-tree 和 trainer 实现无法独立复现。</span></div>
  <div><b>方差未知</b><span>没有多 seed 重复训练或置信区间；曲线平稳只说明展示的 run。</span></div>
  <div><b>指标命名不透明</b><span>论文写 Pass@1，公开 runner 汇总连续 final_score 的均值，未发现严格 pass threshold。</span></div>
  <div><b>Judge prompt 有版本差异</b><span>Appendix A 含 changed files 与 optional transcript；公开 revision 的 judge.py 没有传这两项。</span></div>
  <div><b>数据选择信息不完整</b><span>strong/small 校准模型、over-branching threshold、JobBench-style 与 OfficeQA-style 训练规模未披露。</span></div>
  <div><b>Mix-harness 证据偏弱</b><span>只有曲线和“相当或略高”的描述，没有完整表格、重复 run 或严格的 cross-harness ablation。</span></div>
</div>

这篇论文最值得带走的结论很具体：**黑盒 harness 不是不能做 RL，难点是把 harness 产生的非线性调用记录恢复成可归因、可对齐、可验证的训练样本。** 它已经证明这条路径能带来明显提升；要把结论推进到 harness-general learning，还需要公开实现、统一初始条件和更完整的跨 harness 因果对照。

<div class="note blue"><p><strong>证据说明：</strong>论文采用 arXiv non-exclusive distribution license，本文没有直接复制原图。Figure 1、Table 1 与 Table 2 以数据和机制重绘；Figures 2–8 的信息在文字与图表中总结。官方 ClawGym II 代码页截至核查时为空；case 与 judge 依据 ClawGym-Bench revision <code>c8cbd1d0df033af24fc14064d40d6964ca8f611f</code>，数据生成流程依据 ClawGym-SynData revision <code>98d0478ca2a0fbda22fcbba5da3e5e03da95f20d</code>。</p></div>

</div>

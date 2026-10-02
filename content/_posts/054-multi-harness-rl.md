---
title: "[2026-09-03] What Does Multi-Harness RL Learn? Credit Assignment and Portability in Coding Agents"
permalink: "/posts/论文解读/multi-harness-rl.html"
date: "2026-09-29T20:10:00+08:00"
updated: "2026-09-29T20:10:00+08:00"
cover: "/generated-covers/054-multi-harness-rl.webp"
description: "固定模型、轨迹、reward 与更新次数，只改变 GRPO 的分组边界：这篇工作用四种 coding harness 和一个 held-out weak-ReAct，区分 source-configuration adaptation 与可迁移能力。"
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
  - "Reinforcement Learning"
  - "GRPO"
  - "SWE-bench Verified"
  - "Coding Agent"
---

<style>
html:not([data-theme="dark"]) body:has(.mh-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:34ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.mh-reading{--column:780px;--blue:#285d9b;--orange:#ad5735;--green:#2b7562;--red:#a0443d;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.mh-reading>*{max-width:100%}.mh-reading p,.mh-reading li{text-wrap:pretty}.mh-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.mh-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.mh-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.mh-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.mh-reading .deck-head strong{font-size:.92rem}.mh-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.mh-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.mh-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.mh-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.mh-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.mh-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line-local));background:color-mix(in srgb,var(--blue) 5%,#fff)}.mh-reading .interest b{color:var(--blue);font:750 1.2rem/1 var(--mono)}.mh-reading .interest span{color:var(--soft);font-size:.84rem}
.mh-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.mh-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.mh-reading .metric:last-child{border-right:0}.mh-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.22rem,3vw,1.68rem)/1 var(--serif)}.mh-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.mh-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.mh-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.mh-reading .keypoints ul{margin:0;padding-left:1.2rem}.mh-reading .keypoints li{margin:.42rem 0}.mh-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--green);background:var(--surface)}.mh-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.mh-reading .kicker{display:block;margin-bottom:6px;color:var(--green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.mh-reading h2{margin-top:3.55rem}.mh-reading h3{margin-top:2.1rem}.mh-reading h4{margin-top:1.7rem}.mh-reading strong{font-weight:750}.mh-reading .table-scroll,.mh-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.mh-reading .table-scroll table{display:table;width:100%;min-width:720px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.mh-reading th,.mh-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.mh-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.mh-reading td:first-child{font-weight:650}.mh-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.mh-reading code{font-size:.92em}
.mh-reading .figure{width:100%;margin:27px 0}.mh-reading .figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.mh-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.mh-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.mh-reading .role{padding:16px;background:#fff}.mh-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.mh-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.mh-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.mh-reading .flow li{min-height:132px;padding:12px;background:var(--surface)}.mh-reading .flow b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.mh-reading .flow span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.mh-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.mh-reading .case h4{margin:0 0 8px;font-size:1.12rem}.mh-reading .case ol{padding-left:1.2rem}.mh-reading .case li{margin:.58rem 0}.mh-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.mh-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.mh-reading .verdict strong{display:block;margin-bottom:4px}.mh-reading .verdict .pass strong{color:var(--green)}.mh-reading .verdict .fail strong{color:var(--red)}
.mh-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.mh-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.mh-reading .note p{margin:.34em 0}.mh-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.mh-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.mh-reading .limit-grid>div{padding:17px;background:#fff}.mh-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.mh-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.mh-reading .metrics{grid-template-columns:1fr 1fr}.mh-reading .metric:nth-child(2){border-right:0}.mh-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.mh-reading .flow{grid-template-columns:1fr 1fr}.mh-reading .roles{grid-template-columns:1fr}.mh-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.mh-reading .flow,.mh-reading .verdict,.mh-reading .limit-grid{grid-template-columns:1fr}.mh-reading .part0,.mh-reading .case{padding:17px 15px}.mh-reading .deck-head,.mh-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="mh-reading">

<p class="paper-meta">Chenqian Le, Jiayi Cheng, Qijia He, Runhao Li, Yinghao Li, Xupeng Chen · arXiv:2609.04518v1 · 2026-09-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.04518">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.04518">论文 PDF</a>
  <a href="https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified">SWE-bench Verified 数据</a>
  <a href="https://github.com/SWE-bench/SWE-bench">SWE-bench evaluator</a>
</div>

<section class="deck-wrap" aria-label="What Does Multi-Harness RL Learn 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · 分组边界、sealed oracle 与 portability 诊断</strong><a href="/lib/decks/multi-harness-rl-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/multi-harness-rl-visual-guide.html" title="What Does Multi-Harness RL Learn 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">同一个 coding model，换一套 harness，成绩可能相差四倍。那把多种 harness 的 rollout 混在一起做 RL，学到的是可迁移的 coding 能力，还是对训练配置的适应？这篇论文固定模型起点、训练记录、reward、token、loss mask 和更新次数，只改变 GRPO 的分组边界，再把 checkpoint 放进训练时从未出现的 weak-ReAct 接口测试。</p>

<div class="interest"><b>博客作者兴趣度 9.7 / 10</b><span>直接检验 multi-harness RL 是否真的产生接口无关能力</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>4.3×</strong><span>评测 harness 导致的均值跨度</span></div>
  <div class="metric"><strong>1.16×</strong><span>六种训练 recipe 的均值跨度</span></div>
  <div class="metric"><strong>+0.25 pp</strong><span>held-out avg@8：Cross − Within</span></div>
  <div class="metric"><strong>0.174–0.350 bit</strong><span>同一 checkpoint 跨 harness 的 action JSD</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个判断</h3>
  <ul>
    <li><strong>Multi-harness exposure 与 cross-harness credit 是两件事。</strong>两组实验都看过四种 harness；差别只在 reward 是否跨 harness 一起标准化。</li>
    <li><strong>Cross 的 source-harness 均值比 SFT 高 0.77 pp，但校正多重比较后的 99% CI 包含 0。</strong>最大的单列增益来自 OpenHands。</li>
    <li><strong>换到未参与训练的 weak-ReAct 后，Cross 与 Within 没有可检测的差异。</strong>三 seed 合并差值为 +0.16 pp，区间为 [−0.41,+0.72]。</li>
    <li><strong>Harness 决定 action repertoire 的程度远大于 credit rule。</strong>跨 harness 的 JSD 至少是同 harness 内 SFT→Cross 的 59 倍。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### GRPO 的“组”为什么是这篇论文唯一要动的旋钮？

GRPO 不训练单独的 value model。它让同一组里的多条 rollout 相互比较：每条 reward 先减去组均值，再除以组内标准差，得到 advantage。组里放谁，会直接决定哪条轨迹拿正梯度、哪条拿负梯度。

这里的 `Within` 把同一 task、同一 harness 的 rollout 放在一组；`Cross` 把同一 task 在四种 harness 下的 rollout 放在一组。两者都见过 Aider、OpenHands、Qwen Code 与 SWE-agent。论文没有比较“单 harness 训练”和“多 harness 训练”，而是在多 harness exposure 已经固定的前提下，只问跨 harness 比分有没有额外价值。

`source harness` 指参与训练数据采集的四套接口。`held-out harness` 是训练中完全没出现的简化版 `weak-ReAct`。Source 上升可能来自对某套 prompt、工具和控制流的适应；held-out 上升才更接近作者要测的 portability。
</aside>

## Q1. 为什么要把 multi-harness RL 拆成“见过多种接口”和“跨接口比较 reward”？

**因为这两个干预在已有工作里经常同时发生，最终涨分时很难知道是哪一个起作用。** ClawGym II 按 task-harness pair 分组，HarnessX 则让同题在不同 harness 或模型版本下的轨迹直接竞争。两类系统还同时改变数据量、rollout 方式、训练阶段和评测接口，端到端成绩不能回答分组边界本身的作用。

Harness 不是薄薄的一层 prompt。它决定模型收到什么 observation、能调用哪些 tools、怎样重试、何时截断上下文，以及最终怎样提交 patch。论文先用六个 checkpoint × 四套评测 harness × 500 题 × 两次尝试构造 24,000 次评测。列均值从 2.14% 到 9.27%，相差 4.3 倍；训练 recipe 的行均值只有 5.55% 到 6.46%，相差 1.16 倍。

这意味着同一 checkpoint 在一套界面里不会做，并不等于模型没有对应能力；反过来，训练后只在原生 harness 上涨分，也不能自动解释成模型把能力内化了。论文把“换到 unseen harness 后是否还涨”作为 portability 的操作性定义。

<figure class="figure">
  <img src="/lib/papers/multi-harness-rl/protocol.svg" alt="固定训练数据、只改变 GRPO 分组边界的实验设计">
  <figcaption>根据原论文 Figure 1 重绘。四套 source harness 采集的 records 先被冻结；Within 与 Cross 从同一个 SFT checkpoint 出发，用相同数据和预算训练，再交给同一个 sealed oracle 评测。</figcaption>
</figure>

## Q2. 它和 HarnessX、ClawGym II、POLAR、OpenForgeRL 的边界在哪里？

**这篇论文做的是一组把 credit-assignment boundary 单独隔离出来的因果对照。** 它不训练更大的系统，也不追求比同期工作更高的绝对分数；证据价值主要来自控制变量和负结果。

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>多 harness 怎样进入训练</th><th>怎样评测</th><th>本文关心的证据边界</th></tr></thead>
  <tbody>
    <tr><td>ClawGym II</td><td>一个 policy 接收多种 harness rollout；advantage 在 task-harness pair 内标准化</td><td>原生 harness 与跨 harness transfer</td><td>对应本文的 Within 思路，但它还改变了数据和训练系统。</td></tr>
    <tr><td>HarnessX</td><td>同题在连续演化的 harness / model 版本间共享 GRPO group</td><td>整体 recipe 的 end-to-end 结果</td><td>对应 Cross 思路；版本演化与 credit rule 没有被拆开。</td></tr>
    <tr><td>POLAR</td><td>通过 production harness 做原生 GRPO</td><td>各 checkpoint 在自己的训练 harness 上测</td><td>报告 +0.6 到 +22.6 pp 的 harness-indexed gain，不能单独识别 portability。</td></tr>
    <tr><td>OpenForgeRL</td><td>SFT distillation 与 RL rollout 都使用三种 harness</td><td>ClawEval held-out gain +9.5 / +20.3 pp</td><td>同时改变 exposure 与训练阶段，不能把收益只归给 cross-harness credit。</td></tr>
    <tr><td>Orchard</td><td>完整 harness 产生 SFT 数据</td><td>2×2 matched / mismatched harness</td><td>matched 53.5–57.9%，mismatched 19.0–28.0%，直接暴露接口锁定。</td></tr>
    <tr><td>本文</td><td>四 harness exposure 完全相同，只移动 GRPO group 边界</td><td>四个 source harness + unseen weak-ReAct</td><td>能回答“跨 harness 比较 reward 是否额外带来 portability”。</td></tr>
  </tbody>
</table>
</div>

论文因此适合作为其他大系统论文的 negative control，也就是用严格控制的负结果检验宽泛解释。它排除了一个较窄的说法：**只要把不同 harness 的二值结果放进同一个 GRPO group，模型就会自然学到 interface-invariant policy。** Multi-harness exposure、更多任务和更长训练是否有效，不在这组实验的否定范围内。

## Q3. 数据、分组、sealed oracle 和一条真实 case 到底怎样串起来？

### 3.1 训练集从哪里来，谁产生什么

训练 trajectory 来自 SWE-Gym，评测使用与它按 benchmark family 分离的 SWE-bench Verified。作者先让四套 harness 在同一训练池上运行，再从 1,008 个已评分任务中选择 183 个“不同 harness 结果不一致”的任务。只有这些任务的 pooled group 有非零 reward 方差，能给 Cross 提供梯度。

SFT warm start 使用 186 个任务、8,841 条成功轨迹 records。这里的 record 是从 trajectory 中拆出的训练记录。四个 RL arms 都重放同一份冻结 manifest：183 个任务、5,543 个 episodes、81,216 条 records，并都完成 81,200 个 optimizer steps。Task 与测试来自 SWE-Gym / SWE-bench；本文作者没有重新人工编写问题或测试。作者负责采集、筛选、分组、训练和统计分析。

<div class="roles">
  <div class="role"><b>UPSTREAM DATASET</b><span>SWE-Gym 提供训练任务；SWE-bench Verified 提供 500 个经人工验证的真实 GitHub issue–PR 对与测试规格。</span></div>
  <div class="role"><b>FOUR HARNESSES</b><span>在各自 prompt、tools、observation 与 control flow 下生成 patch；它们不能看到 sealed test oracle。</span></div>
  <div class="role"><b>THIS PAPER</b><span>冻结 records，构造 Within / Cross advantages，训练 checkpoint，并用同一 oracle 做 source 与 held-out 评测。</span></div>
</div>

论文也把运行环境锁到了具体版本，避免“同名 harness”掩盖实现差异：Aider `0.86.2`，OpenHands SDK `1.0.0a6` 与 `openhands-ai 0.62.0`，Qwen Code `0.19.3`，SWE-agent / SWE-ReX `1.1.0 / 1.4.0`；训练栈是 `torch 2.6.0`、`transformers 4.51.3`、`verl 0.4.1`，评测使用 `swebench 4.1.0` 与 `udocker 1.3.17`。

### 3.2 Within 与 Cross 的差别只有分母里的同伴

对 task `x`、harness `h`、第 `i` 条 rollout，reward `r(x,h,i)` 只有 0 或 1：

<div class="formula">A<sub>Within</sub>(x,h,i) = [r(x,h,i) − μ(x,h)] / [σ(x,h) + ε]</div>

<div class="formula">A<sub>Cross</sub>(x,h,i) = [r(x,h,i) − μ(x)] / [σ(x) + ε]</div>

Within 只和同一 harness 的其他尝试比较，所以 harness 整体更强或更弱的 offset 会被消掉。Cross 把四种 harness 混在一起；如果 OpenHands 在训练任务上的成功率是 27.0%，Aider 只有 6.9%，模型经由 OpenHands 得到的 rollout 会系统性拿到更高 advantage。论文后面的 classifier 正是在测这部分 harness identity。

<div class="code-scroll"><pre><code># 解释性伪代码；不是论文公开仓库中的实现
for task in frozen_manifest:
    if recipe == "Within":
        groups = group_by(task, harness)
    elif recipe == "Cross":
        groups = group_by(task)  # pool all four harnesses
    advantage = zscore(binary_oracle_reward, within=groups)
    update_same_policy(records, advantage, masked_observation_tokens=True)</code></pre></div>

### 3.3 一个 episode 怎样得到 0 或 1

每道题都有一个 sealed per-instance oracle，也就是只服务于该实例的隐藏测试。评测 Agent 能看到 GitHub issue、固定在 `base_commit` 的 repository、harness 提供的 prompt / tools，以及命令输出。它提交 patch 后，评测器才在隔离容器中应用 patch、运行隐藏的 `test_patch`，再把日志解析成测试状态。任务要记作 resolved，`FAIL_TO_PASS` 必须全部从失败变成通过，`PASS_TO_PASS` 也必须全部继续通过。空 patch、patch 无法应用、缺少测试输出或必要测试失败都不会得到 1；基础设施错误被单列并排除，不冒充模型失败。

<div class="formula">solve(x) = mean<sub>graded attempts</sub> 1[all F2P pass ∧ all P2P pass]；headline = mean<sub>tasks</sub> solve(x)</div>

Source matrix 用 avg@2。held-out weak-ReAct 先用 avg@4，三条主要 checkpoint 又加密到 avg@8。每个 cell 只纳入达到至少 95% graded coverage 的数据；对比在 task 层配对，bootstrap 也按 task cluster 重采样 10,000 次。

### 3.4 真实 case：`astropy__astropy-12907`

这条 case 是 SWE-bench Verified 官方 500 题中的第一条，也在本文声明的完整评测 roster 内。问题是 `separability_matrix` 在嵌套 `CompoundModel` 中错误地把两个独立 `Linear1D` 分支判断成互相依赖。

<div class="case">
<h4>从 issue 到 verdict</h4>
<ol>
  <li><strong>来源：</strong>Astropy 的真实 issue–PR 对；Verified 数据维护者对原始 SWE-bench 样本做人工质量验证。本文直接使用这套任务，没有重新标注。</li>
  <li><strong>Agent 可见：</strong>issue 正文、Astropy repository 的 `d16bfe05…` 基线版本，以及当前 harness 暴露的工具和输出。金标准 patch 与隐藏 test patch 不提供给 Agent。</li>
  <li><strong>Agent 要做：</strong>定位组合模型构造 separability matrix 的逻辑，提交 repository patch。</li>
  <li><strong>隐藏检查：</strong>两条 `FAIL_TO_PASS` 覆盖嵌套组合形式，13 条 `PASS_TO_PASS` 覆盖原有坐标矩阵、stack、算术组合与其他 separability case。</li>
  <li><strong>PASS：</strong>候选 patch 能应用，2/2 新回归测试与 13/13 原有测试全部通过，episode reward 为 1。</li>
  <li><strong>FAIL：</strong>如果 patch 只修正 `rot &amp; (sh1 &amp; sh2)`，却让另一种嵌套组合仍得到耦合矩阵，至少一条 `FAIL_TO_PASS` 失败，整个 episode reward 为 0。这是按公开 test list 推导的解释性轨迹，不是论文发布的模型日志。</li>
</ol>
</div>

<figure class="figure">
  <img src="/lib/papers/multi-harness-rl/judge-case.svg" alt="SWE-bench Verified 真实 Astropy case 的可见输入和隐藏 judge">
  <figcaption>任务与测试名称来自官方 SWE-bench Verified 数据；判定逻辑来自论文固定的 swebench 4.1.0 evaluator。论文未公开这道题在四种 harness 下的逐条 trajectory，因此这里没有编造 Agent 的具体编辑过程。</figcaption>
</figure>

论文说所有数字都由 `results/postfreeze_2026q3/` 下的 JSON 和脚本生成，也说 `weak-ReAct` 与 grader 随 artifact 发布。但 arXiv 页面、PDF 和 source archive 没有给出 artifact URL；截至 2026-09-29，我无法独立检查这些文件。上面的真实 case 与 judge 来自官方 SWE-bench Verified 数据和论文锁定的 `swebench==4.1.0`，并不等价于本文缺失的 per-harness episode logs。

## Q4. 结果支持“学会了什么”，又排除了什么？

### 4.1 Source harness 上有小幅 gain，但最大变量是评测接口

<figure class="figure">
  <img src="/lib/papers/multi-harness-rl/source-matrix.svg" alt="四种评测 harness 与六种训练 recipe 的 solve rate 矩阵">
  <figcaption>根据原论文 Figure 2 / Table 1 数据重绘。列均值跨度为 7.13 pp；行均值跨度只有 0.91 pp。</figcaption>
</figure>

Cross 在四个 source harness 上的平均成绩是 6.46%，SFT 是 5.70%，差值为 <strong>+0.77 pp，95% CI [+0.03,+1.52]</strong>。论文预先对五个 recipe 对比做 Bonferroni 修正后，99% CI 变成 [−0.21,+1.75]。四列里的最大增益是 OpenHands 上的 +1.81 pp；Within 也把最大增益放在 OpenHands，幅度 +1.71 pp。两条 RL 线都把最大收益留在训练时见过的配置上。

第二个 model family 也说明“harness 强弱”不能当成固定常数。Seed-Coder-8B 在 weak-ReAct 上是 5.00%，与 Qwen3-8B 的 4.07% 接近；换成 Aider 或 SWE-agent 后，它相对自己的 weak-ReAct 分别下降 4.41 与 4.40 pp。OpenHands 和 Qwen Code 的 2,000 次尝试全部没产出 patch，因此记为 not measurable，没有被硬算成 0。

### 4.2 Held-out 上没有检测到 Cross 的额外 portability

<figure class="figure">
  <img src="/lib/papers/multi-harness-rl/heldout.svg" alt="held-out weak-ReAct 的得分、检出能力和多 seed 结果">
  <figcaption>根据原论文 Figure 3a、Tables 2–4 重绘。avg@4 的六种 recipe 只落在 4.01%–4.73%，小于最窄对比的 1.19 pp 检出下限。</figcaption>
</figure>

把尝试数从 4 加到 8 后，Cross − Within 从 +0.58 pp 缩到 <strong>+0.25 pp，95% CI [−0.48,+1.02]</strong>；Cross − SFT 是 +0.13 pp [−0.65,+0.92]。三 seed 合并时，Cross − Within 为 +0.16 pp [−0.41,+0.72]，而三个 seed 的单点差值是 +0.62、+0.05、−0.20 pp，符号会翻转。

这组结果支持“没有检测到大于约 1 pp 的稳定收益”，不支持数学意义上的完全等价。avg@8 的 80% power 最小可检差异仍为 0.88–1.14 pp。比它更小的真实收益，实验没有足够精度排除。

### 4.3 Cross 确实污染了 advantage，但污染没有变成可见行为差异

作者训练一个 out-of-fold classifier，只看 advantage 就猜它来自哪套 harness。Within 比各自 shuffled-label null 高 +0.02 pp，区间跨 0；Cross 高 <strong>+4.48 pp [+3.22,+5.83]</strong>。Coverage matching 还剩 +1.17 pp；Residualized 反而是 +4.54 pp，因为它从 1,008 个多数全失败的任务估计 baseline，实际只消掉 183 个 disagreement tasks 中 9% 的 offset。

<figure class="figure">
  <img src="/lib/papers/multi-harness-rl/diagnostics.svg" alt="advantage 中的 harness identity 与 action distribution JSD">
  <figcaption>根据原论文 Figure 3b、Figure 4、Tables 9–10 重绘。Aider 的 transcript 是 plain chat，没有可解析 tool call，因此不进入 action-label 分析。</figcaption>
</figure>

行为侧的结果更直接。同一个 checkpoint 换 harness，action composition 的 Jensen–Shannon divergence 是 0.174–0.350 bit；同一 harness 内把 SFT 换成 Cross，只有 0.0003–0.0029 bit。160 个 turn 的人工抽查里，rule-based labeler 错了 11 个，其中 8 个来自 SWE-agent。即便考虑这项噪声，两个量级仍相差很远。

### 4.4 冻结 replay 和基础设施是否把结果做平了？

论文额外训练了一条 re-collected Cross：前半程重放冻结数据，后半程让半训练 policy 重新跑四种 harness。它相对 offline Cross 为 +0.13 pp [−0.85,+1.10]，相对 Within 为 +0.75 pp [−0.10,+1.65]，仍没有显著差异。

Appendix H 披露了五类会悄悄改结果的系统故障：跨条件 container 污染、model registration race 导致约 20% episode 丢失、UTF-8 grader crash 压低可用分母、container Git 损坏，以及 hollow image cache 把每轮截断在 25 题。作者修复后重新验证。这份清单说明一次 harness 实验要在哪些位置设置 fail-closed 检查。

## Q5. 对 Claude Code、Codex 这类完整 harness，下一步最值得做什么？

**训练报告至少要把 exposure、credit grouping、source gain 和 held-out gain 分开写。** 只报一个多 harness 总分，读者无法知道模型看过哪些接口，也不知道正负梯度是在什么比较组里产生的。

如果要继续做这个方向，我会优先补四组实验：

1. 用 Claude Code、Codex CLI、OpenHands 等真实 interface 做完整 train-harness × eval-harness 矩阵，同时固定 model、task、budget 与 grader。
2. 除二值 episode reward 外，引入 tool-level 或 phase-level credit，检查更细的归因能否带来 portability。
3. 把 residual baseline 只估计在真正产生梯度的 disagreement population 上，并和 learned baseline、per-step value、hindsight credit 对照。
4. 把 held-out harness 从一个简化 weak-ReAct 扩展到多种未见 prompt schema、tool vocabulary、context policy 与 recovery strategy，分别测哪一层能迁移。

<div class="note blue"><p>对产品系统也有一个直接提醒：同一个 model 在不同 harness 上可能呈现完全不同的成功率和动作结构。模型评测、上线配置与安全评估都应把 harness 名称、版本、tool schema、rollout 数和 grader 一起记录。</p></div>

## Q6. 最后怎样评价这篇论文？

论文的证据强度主要来自控制变量。作者把 exposure 固定，只移动 credit-assignment boundary，再用 held-out interface、三 seed、avg@8、re-collected rollout、minimum detectable difference 和 action JSD 从不同角度检查同一个结论。

<div class="limit-grid">
  <div><b>MODEL / DOMAIN</b><span>真正参与训练的只有 Qwen3-8B，一档预算，Python repository tasks；第二模型族只做未训练的 harness 效应比较。</span></div>
  <div><b>LOW ABSOLUTE RATE</b><span>绝对 solve rate 多在 1%–10%。Source 只做 avg@2，多数对比只来自一个 checkpoint。</span></div>
  <div><b>HELD-OUT SCOPE</b><span>未见接口只有一个极简 weak-ReAct。它不能代表所有 Claude Code、Codex 或 IDE agent 的分布变化。</span></div>
  <div><b>SELECTION</b><span>RL 只使用 183 个 harness 会产生分歧的任务。这个选择让 Cross 有梯度，也限制了结论适用的任务分布。</span></div>
  <div><b>ARTIFACT GAP</b><span>论文描述了公开 artifacts，但 arXiv 版本没有给出 URL，本文无法复核 per-harness logs、weak-ReAct 实现和分析 JSON。</span></div>
  <div><b>STATISTICAL READING</b><span>“没有检测到差异”不等于严格等价；当前设计仍可能漏掉小于约 1 pp 的 portability gain。</span></div>
</div>

我的结论是：**它是一篇很扎实的负结果，也给出了 multi-harness RL 应有的最低对照标准。** 对 Claude Code、Codex harness 研究而言，训练和评测都要把接口当成一等变量。若要声称模型学到了可迁移能力，证据必须来自未见过的 harness。

</div>

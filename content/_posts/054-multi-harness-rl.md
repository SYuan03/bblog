---
title: "[2026-09-03] Multi-Harness Reinforcement Learning for Coding Agents: Training Gains and Harness Dependence"
permalink: "/posts/论文解读/multi-harness-rl.html"
date: "2026-09-29T20:10:00+08:00"
updated: "2026-10-14T18:00:00+08:00"
cover: "/generated-covers/054-multi-harness-rl.webp"
description: "同一批编程执行记录，按接口分别比较成绩，或把同题不同接口的成绩合起来比较：两种训练都只有小幅提升，评测接口带来的差异更大；换到未见接口后，谁更好仍没有稳定证据。"
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

<p class="paper-meta">Chenqian Le, Jiayi Cheng, Qijia He, Runhao Li, Yinghao Li, Xupeng Chen · 初次公开：2026-09-03 · 本文解读 v2（2026-10-09，23 页）</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.04518">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.04518v2">论文 PDF（v2）</a>
  <a href="https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified">SWE-bench Verified 数据</a>
  <a href="https://github.com/SWE-bench/SWE-bench">SWE-bench evaluator</a>
</div>

<section class="deck-wrap" aria-label="Multi-Harness Reinforcement Learning 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · 怎样分组、隐藏测试、能否换接口</strong><a href="/lib/decks/multi-harness-rl-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/multi-harness-rl-visual-guide.html" title="Multi-Harness Reinforcement Learning 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">把同一批编程执行记录拿来训练，模型能涨多少分？涨分能否带到另一套工具和交互规则里？作者让 Qwen3-8B 通过四套负责提示构造、工具执行和历史管理的程序（harness）采集数据，固定模型起点、数据和更新预算，比较两种分数分组方式。两种方式在原接口上都只有小幅提升；换一个评测接口带来的成绩差异明显更大。未见接口的实验也没有确定谁更好。</p>

<aside class="part0">
<span class="kicker">阅读准备</span>

### Part 0：模型怎样从一组成功与失败的执行中学习？

GRPO 是强化学习更新方法，不额外训练预测分数的价值模型。它比较同组多条 rollout（完整任务执行记录）：每条测试分减去组均值，再除以组内标准差，得到 advantage（比组平均好或差多少）。组里放谁，会直接改变哪些生成被鼓励、哪些被压低。Harness 指模型外的提示构造、工具执行和上下文管理程序。

这里的 `Within` 把同一题、同一执行程序下的记录放在一组；`Cross` 把同一题在四套程序下的记录放在一组。两者都见过 Aider、OpenHands、Qwen Code 与 SWE-agent。论文没有比较“单 harness 训练”和“多 harness 训练”，而是在已经固定两组都接触四套执行程序的前提下，只问跨 harness 比分有没有额外价值。

Source harness 指采集训练数据时用过的四套接口；held-out harness 指训练未用过的简化 weak-ReAct。Portability 在本文里就是换到这个未见接口后能否保持提升。Avg@8 指每题尝试八次，先对获得有效判定的尝试取平均，再对纳入的题目取平均；不是“八次有一次成功就算过”。后文还会解释不同表格怎样筛选有效题目。
</aside>

<div class="interest"><b>博客作者兴趣度 9.7 / 10</b><span>直接检验多执行程序训练是否真的产生可换接口的能力</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>+0.48 / +0.77 pp</strong><span>原接口：Within / Cross 相对 SFT 的估计增益</span></div>
  <div class="metric"><strong>7.13 pp</strong><span>四种评测接口的列均值最大差异</span></div>
  <div class="metric"><strong>+0.25 pp</strong><span>held-out avg@8：Cross − Within</span></div>
  <div class="metric"><strong>55.1% → 0%</strong><span>从 Within 换到 Cross：零 advantage 的执行占比</span></div>
</div>

<aside class="keypoints">
  <h3>先看三个结论</h3>
  <ul>
    <li>两组都见过同样四种 harness；它们只改变分数是否跨接口一起标准化，<strong>没有检验增加训练接口数量本身是否有效</strong>。</li>
    <li>Within、Cross 的原接口平均增益分别为 +0.48、+0.77 pp，远小于评测接口列均值的 7.13 pp 差异。Cross 的增益在校正五次比较后，99% 置信区间包含 0。</li>
    <li><strong>未见接口上，两种规则都没有显著超过 SFT。</strong>Cross − Within 的三种训练随机种子合并差值为 +0.16 pp，95% 置信区间 [−0.41,+0.72]；这也不能证明两种规则等价。</li>
  </ul>
</aside>


<h2 id="多接口训练的收益，能带到另一套执行接口吗？">1. Motivation：多接口训练的收益，能带到另一套执行接口吗？</h2>

**训练接口上的涨分和换接口后的涨分，需要分别测量。** 模型通过某套 harness 看到的工具、命令输出、错误提示和历史记录都带有这套程序的特点。训练后更善于使用它，不一定意味着换一套程序还能保持同样的提升。

Harness 不是薄薄的一层提示。它决定模型收到什么反馈、能调用哪些工具、怎样重试、何时截断上下文，以及最终怎样提交代码补丁。论文先用六个模型版本 × 四套评测程序 × 500 题 × 两次尝试构造 24,000 次评测。列均值从 2.14% 到 9.27%，相差 4.3 倍；训练方案的行均值只有 5.55% 到 6.46%，相差 1.16 倍。

论文把这个问题拆成三项比较：RL 与共同的 SFT 起点相比涨多少分；同一模型换 harness 后成绩变多少；跨接口分组的 Cross 是否比接口内分组的 Within 更容易把增益带到未见接口。前两项说明收益和接口差异的规模，最后一项才是对分组规则的受控检验。

<figure class="figure reading-diagram"><a href="/lib/papers/multi-harness-rl/reading-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/multi-harness-rl/reading-method.svg" alt="根据原论文 Figure 1 重绘；正文纵向阅读图" width="600" height="1011"></a><figcaption>根据原论文 Figure 1 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/multi-harness-rl/protocol.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/multi-harness-rl/protocol.svg" alt="固定训练数据、只改变 GRPO 分组边界的实验设计" width="1200" height="660"></a>
  <figcaption>根据原论文 Figure 1 重绘。四套原执行程序采集的记录先固定下来；Within 与 Cross 从同一个监督微调起点出发，用相同数据和预算训练，再交给同一套隔离的隐藏测试评测。</figcaption>
</figure>
</details>

<h2 id="相关系统已经做了什么，本文还要单独检验什么？">2. Related Work：相关系统已经做了什么，本文还要单独检验什么？</h2>

**本文固定采集数据和训练预算，单独比较分数的分组方式。** ClawGym II 与 HarnessX 已经训练多接口模型，但完整系统还改变了数据采集、模型版本或训练设置，不能直接从最终成绩判断跨接口分组的作用。

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>多 harness 怎样进入训练</th><th>怎样评测</th><th>本文关心的证据边界</th></tr></thead>
  <tbody>
    <tr><td>ClawGym II</td><td>一个模型接收多套程序的记录，按“题目 × 程序”计算相对分</td><td>原程序与换程序测试</td><td>对应本文的 Within 思路，但它还改变了数据和训练系统。</td></tr>
    <tr><td>HarnessX</td><td>同题在连续演化的 harness / model 版本间共享 GRPO 比较组</td><td>整套训练方案的最终结果</td><td>对应 Cross 思路；版本演化与得分分配规则没有被拆开。</td></tr>
    <tr><td>Polar</td><td>分别在真实部署程序中执行 GRPO</td><td>每个模型在各自的训练接口中测试</td><td>原接口增益从 Qwen Code 的 +0.6 pp 到 Codex 的 +22.6 pp；没有统一检验换接口。</td></tr>
    <tr><td>OpenForgeRL</td><td>比较 ZeroClaw 单接口与三接口的 SFT+RL</td><td>ClawEval；单接口模型换到 OpenClaw / Codex，较 Base 增益为 +3.3 / +4.6 pp</td><td>三接口模型的 +9.5 / +20.3 pp 来自它已经见过的 OpenClaw / Codex，不能叫未见接口收益；两阶段的接口接触也同时变化。</td></tr>
    <tr><td>Orchard</td><td>分别用 mini-swe-agent 或 OpenHands 的记录做 SFT</td><td>两个训练接口 × 两个评测接口</td><td>训练评测匹配时 53.5%–57.9%，不匹配时 19.0%–28.0%；这里比较的是 SFT 接口匹配。</td></tr>
    <tr><td>本文</td><td>四套训练程序相同，只改变 GRPO 分组</td><td>四个原接口 + 未见 weak-ReAct</td><td>能回答“跨程序比较分数是否额外改善迁移”。</td></tr>
  </tbody>
</table>
</div>

这些相关工作数字来自本文 v2 的 §2 与 Appendix D，数据集、模型和预算不同，不能排成统一榜单。本文的增量是提供一个范围较窄的对照：在固定数据上，Cross 没有显示出稳定优于 Within 的未见接口表现。它没有否定增加接口数量、继续在线采集或更长训练的价值。

<h2 id="数据、比较组与隐藏测试怎样连接？">3. Method：数据、比较组与隐藏测试怎样连接？</h2>

**四个训练方案重放同一批已采集记录，最后由相同的隐藏测试判修复是否成功。** 作者不在训练过程中继续采新任务记录，因此这是一组冻结数据上的受控比较。

<h3 id="3-1-训练集从哪里来，谁产生什么">3.1 训练集从哪里来，谁产生什么</h3>

训练执行记录来自 SWE-Gym，评测使用 SWE-bench Verified；作者声明本研究的训练与评测任务不重叠。从 1,008 个采集任务里，作者选择 183 个<strong>同题合并所有接口的尝试后，既有成功又有失败</strong>的任务。这不要求不同接口各自全对或全错，同一个接口内的成功与失败也能满足条件。这个筛选保证 Cross 的每个任务组都存在分数差异。

监督微调起点使用 186 个任务的成功执行，处理成 8,841 条训练记录。四个 RL 方案都重放同一份固定清单：183 个任务、5,543 次完整执行、81,216 条处理后的训练记录，实际日志记录 81,200 个 optimizer steps（优化器更新步骤）。<strong>任务数、完整执行次数、训练记录数、更新次数是四种不同单位。</strong> v2 没有披露每条 record 的具体切分规则或这 16 条记录与更新次数差异的原因，不能把它们直接等同。任务问题和测试来自上游数据集；本文作者负责采集、筛选、分组、训练和统计。

<div class="roles">
  <div class="role"><b>上游数据集</b><span>SWE-Gym 提供训练任务；SWE-bench Verified 提供 500 个经人工验证的真实 GitHub issue–PR 对与测试规格。</span></div>
  <div class="role"><b>四套执行程序</b><span>给模型提供各自的提示、工具和反馈，执行工具调用；模型生成候选补丁，执行时看不到隐藏测试。</span></div>
  <div class="role"><b>本文作者</b><span>固定记录，计算 Within / Cross 相对分，训练模型，再用相同隐藏测试评测原接口与未见接口。</span></div>
</div>

论文也把运行环境锁到了具体版本，避免“同名 harness”掩盖实现差异：Aider `0.86.2`，OpenHands SDK `1.0.0a6` 与 `openhands-ai 0.62.0`，Qwen Code `0.19.3`，SWE-agent / SWE-ReX `1.1.0 / 1.4.0`；训练栈是 `torch 2.6.0`、`transformers 4.51.3`、`verl 0.4.1`，评测使用 `swebench 4.1.0` 与 `udocker 1.3.17`。

<h3 id="3-2-Within-与-Cross-改变的是组均值和标准差">3.2 Within 与 Cross 改变的是组均值和标准差</h3>

对 task `x`、harness `h`、第 `i` 条 rollout，reward `r(x,h,i)` 只有 0 或 1：

<div class="formula">A<sub>Within</sub>(x,h,i) = [r(x,h,i) − μ(x,h)] / [σ(x,h) + ε]</div>

<div class="formula">A<sub>Cross</sub>(x,h,i) = [r(x,h,i) − μ(x)] / [σ(x) + ε]</div>

`μ` 是所在组的平均测试分，`σ` 是标准差，`ε` 防止除零。Within 对每个“任务 × harness”组单独减均值；Cross 对整道题只减一次均值。如果某个接口在这道题上的平均分高于混合组均值，Cross 下它的平均 advantage 就偏正。入选训练集里，OpenHands 的总体成功率为 27.0%，Aider 为 6.9%，但这两个总体数不意味着每条 OpenHands 记录都得到更高 advantage。

可以用一个小组看清差别。以下是按公式构造的例子，不是论文任务日志：同题在 A 接口四次全成功，在 B 接口四次全失败。Within 里 A 的分数都等于 A 均值 1，B 都等于 B 均值 0，两组 advantage 全为 0；Cross 把八次放一起，均值 0.5、总体标准差 0.5，于是 A 约为 +1、B 约为 −1。**Cross 会鼓励 A 接口下的生成，即使差别来自工具和执行程序，而非模型本身的解题策略。** 原文实验有四种接口，这个两接口例子只用于说明公式。

一次更新的顺序是：读取冻结记录及其当时的输入、生成 token 和 0/1 分数；按选定规则预先计算这次完整执行的 advantage；用当前模型重算生成 token 的概率；比较当前概率与采集时的概率，用 GRPO 的截断目标更新模型。工具输出等 observation token（环境返回的文本）不参与生成损失，但仍在模型输入里。同一条完整执行的 advantage 加权它的各个生成 token，作者没有提供逐步奖励。

<div class="formula">ρ<sub>t</sub> = π<sub>θ</sub>(a<sub>t</sub> | s<sub>t</sub>) / π<sub>old</sub>(a<sub>t</sub> | s<sub>t</sub>)<br>j<sub>t</sub> = min[ρ<sub>t</sub>A, clip(ρ<sub>t</sub>, 1−δ, 1+δ)A] − β D<sub>KL</sub>(π<sub>θ</sub> ∥ π<sub>ref</sub>)</div>

`a_t` 是这一步已采样的生成 token，`s_t` 是之前的交互历史，`π_old` 是生成记录的模型，`π_θ` 是当前训练模型；`δ` 控制概率比截断，`π_ref` 提供 KL 约束。正 advantage 鼓励这条记录的生成，负 advantage 压低它。<strong>advantage 为 0 只去掉奖励项的贡献，KL 项仍可能产生梯度。</strong>四种方案共用学习率 `3e-7`、KL 系数 `0.01`、一个 epoch 和相同 GPU 分配；v2 未给出 `δ`、`ε` 的实际数值或更详细的批量设置。

Within 共形成 698 个“任务 × harness”组，其中 44.8% 的组既有成功又有失败；全对或全错的组对应 55.1% 的完整执行。前者以<strong>组</strong>为分母，后者以<strong>执行</strong>为分母。Cross 的 183 个任务组都有混合结果，零 advantage 执行占比为 0%。Coverage-matched 从 Cross 出发，把 55.1% 执行的 advantage 置零，保留全部训练记录和剩余相对分；它没有减少更新次数。旧记录重放的平均概率比为 0.996–0.999，有效样本比例 ESS 至少 0.993，说明权重没有明显集中到少数记录，不等于进行了持续在线采集。（Appendix A.1–A.2、Table 1）

<h3 id="3-3-一次完整任务尝试怎样得到-0-或-1">3.3 一次完整任务尝试怎样得到 0 或 1</h3>

模型提交候选补丁后，独立评分程序在每题的隔离容器中运行隐藏测试；论文称它为 sealed per-instance oracle。模型执行时能看到 GitHub issue、固定在 `base_commit` 的仓库、当前 harness 提供的提示和工具，以及命令输出。作者声明最终复测用的测试与执行时的反馈测试分开；复测成功记 1，失败记 0。**这套专用复测代码尚未公开，不能只凭它使用 `swebench==4.1.0` 就推断每项内部判定。**

公开 SWE-bench 数据则把测试组织成两份清单。`FAIL_TO_PASS`（F2P）列出修复前失败、参考修复后通过的测试；`PASS_TO_PASS`（P2P）列出修复前后都应通过的测试，防止修新问题时破坏旧功能。评测器应用候选修复与上游 PR 提供的 `test_patch`（新增或修改测试的补丁），运行测试，再解析逐项状态。测试补丁和参考修复不作为模型输入；仓库原有的测试代码仍可能可见，不能笼统说模型看不到任何测试。

为什么不用执行中的测试反馈直接当分数？作者的初步检查发现，它与隔离评分器有 2.58% 的判定不一致，超过预设的 1% 容许值，而且全是执行中误以为成功。最终表格一律采用独立隐藏测试判定。（Appendix B.2）

<div class="formula">solve(x) = mean<sub>有效判定的尝试</sub> 1[专用复测判成功]；headline = mean<sub>纳入的任务</sub> solve(x)</div>

例如同一道题四次有效判定为 `1, 0, 0, 0`，avg@4 的题级分数是 `1/4=25%`；另外一道题四次都失败，分数为 0。只对这两题取平均，得到 12.5%。它与“尝试四次至少成功一次”的 pass@4 不同。

原接口每题尝试两次；未见接口先尝试四次，再给 SFT、Within、Cross 增加到八次。每个“模型 × harness”条件至少 95% 的尝试必须有有效判定，否则不接受这一条件的结果。没有判定的基础设施故障不进入分母；已完成但测试失败的尝试计为 0。置信区间以<strong>题目</strong>为单位重采样 10,000 次，保留同题多次尝试的关联，不能把每次尝试当独立样本。

<h3 id="3-4-真实-Astropy-任务：括号不应改变输入与输出的依赖关系">3.4 真实 Astropy 任务：括号不应改变输入与输出的依赖关系</h3>

下面用公开任务 `astropy__astropy-12907` 走一遍输入、修复和标准判分。这是固定数据版本 `c104f840…` 的第 0 行，属于论文声明使用的 500 题范围，**但不是作者公开的模型执行日志，也不代表这道题实际获得了有效判定。**

Astropy 是 Python 天文学库，其中 `&` 可以把两个数学变换并排组合。一个输出依赖哪个输入，用 `separability_matrix` 返回的布尔矩阵表示：行是输出，列是输入，`True` 表示存在依赖。两个一维线性变换并排执行，本应互不影响。上游 [issue #12906](https://github.com/astropy/astropy/issues/12906) 指出：给两个 `Linear1D` 先加括号，再放到一个二维变换右侧，右下角却从对角矩阵变成全 `True`；括号错误地改变了依赖分析。

问题与参考 PR [#12907](https://github.com/astropy/astropy/pull/12907) 都由 Stuart Mumford（GitHub 用户 `Cadair`）提交。<strong><code>test_patch</code> 来自这个 PR 的测试改动，不是本文作者临时生成的检查。</strong>Verified 对上游样本做人工质量验证，但公开材料没有提供这条任务的逐项人工审查表。

PR 的一个真实测试把二维旋转 `rot = Rotation2D(2)` 与两次平移 `sh1 = Shift(1)`、`sh2 = Shift(2)` 组合成 `rot & (sh1 & sh2)`。旋转的两个输出都依赖前两个输入；后两次平移各自只依赖自己的输入。期望与错误输出如下，`1/0` 分别表示 `True/False`：

```text
期望                         修复前的错误结果
1 1 0 0                      1 1 0 0
1 1 0 0                      1 1 0 0
0 0 1 0                      0 0 1 1
0 0 0 1                      0 0 1 1
```

原因就在 `_cstack`：右侧子模型已经算好了自己的依赖矩阵，旧代码却把整块覆盖成常量 `1`。参考修复只改一行，保留右侧原矩阵。下面是官方 PR 的原始代码差异，适用 Astropy 4.3 的该基线版本，NumPy 数组操作：

```diff
- cright[-right.shape[0]:, -right.shape[1]:] = 1
+ cright[-right.shape[0]:, -right.shape[1]:] = right
```

<div class="case">
<h4>一份候选修复怎样被检查</h4>
<ol>
  <li>模型收到 issue 正文、Astropy 的 <code>d16bfe05…</code> 基线代码与执行工具，交付修复补丁。输入不含参考修复或 PR 新增测试；原有测试代码仍在仓库中。</li>
  <li>标准评测器在任务容器中应用候选修复，恢复评测用测试文件到基线，再应用上游 <code>test_patch</code>，运行 <code>pytest -rA astropy/modeling/tests/test_separable.py</code>。</li>
  <li>两项 F2P 分别检查 <code>rot &amp; (sh1 &amp; sh2)</code> 与 <code>rot &amp; sh1 &amp; (scl1 &amp; scl2)</code>；后者在末尾增加两个独立 Scale 变换。每项测试同时断言各输出是否独立，以及完整依赖矩阵是否正确。</li>
  <li>13 项 P2P 检查原有坐标矩阵、拼接、算术组合和其他组合形式。PR 新增四种组合，但其中两种原本就通过，属于 P2P，不能把“四个新增测试”都叫失败修复测试。</li>
  <li>正常全部运行时，2/2 F2P 与 13/13 P2P 都通过，标准 grader 返回 <code>resolved=True</code>。若第一种嵌套已修好、第二种仍错，F2P 得 1/2，返回部分修复但 <code>resolved=False</code>，整次尝试仍记 0。若修新问题却破坏一项旧测试，同样记 0。</li>
</ol>
</div>

实际 F2P 的 pytest 名称是下面两项。测试字典跳过了 `cm6`，参数序号按插入顺序产生，所以名字里的 `6` 对应 `cm8`，`9` 对应 `cm11`，不能按字典标签猜测试 ID。

```text
astropy/modeling/tests/test_separable.py::test_separable[compound_model6-result6]
astropy/modeling/tests/test_separable.py::test_separable[compound_model9-result9]
```

<h3 id="3-5-标准评分器有一个需单独说明的边界">3.5 标准评分器有一个需单独说明的边界</h3>

核对 `swebench 4.1.0` 的 `grading.py` 与 Astropy 日志解析器后，标准规则比“所有测试必须实际运行并通过”宽松。它把 `PASSED` 和 `XFAIL`（pytest 标记的预期失败）放进成功列表；`FAILED`、`ERROR` 和日志中缺失的测试放进失败列表；<strong><code>SKIPPED</code> 两边都不放，因而不进入分母。</strong>F2P 与 P2P 各自按“成功数 ÷（成功数＋失败数）”计算，分母为 0 时返回 1，两个分数都是 1 才算完整修复。

```python
# 本文写的简化计算例，Python 3.10+。
# 仅对应 4.1.0 的 Astropy PASS_AND_FAIL 状态分支；
# 不含容器、补丁应用、日志标记校验，不是完整评测器。
def group_score(statuses):
    success = sum(s in {"PASSED", "XFAIL"} for s in statuses)
    failure = sum(s in {None, "FAILED", "ERROR"} for s in statuses)
    total = success + failure
    return success / total if total else 1.0

print(group_score(["PASSED", "FAILED"]))   # 0.5
print(group_score(["PASSED", "SKIPPED"]))  # 1.0，而非 0.5
```

我对下载的原函数做了独立的源码级微测：一项 F2P 为 `SKIPPED`、其他项为 `PASSED` 时，它确实返回完整修复。这是构造状态和日志的检查，不是模型运行结果，更不是完整容器复现。**论文专用复测代码如何处理跳过测试没有公开，不能把标准包的这个边界当成论文已证实的问题。**

<figure class="figure reading-diagram"><a href="/lib/papers/multi-harness-rl/reading-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/multi-harness-rl/reading-case.svg" alt="Astropy 原始测试、矩阵错误、参考修复与标准评分器边界" width="600" height="1500"></a><figcaption>根据上游 Astropy PR #12907、固定 SWE-bench Verified 数据与 swebench 4.1.0 源码绘制；失败例是按测试规则推导，不是模型日志。</figcaption></figure>

<details class="reading-evidence"><summary>完整案例重绘图（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/multi-harness-rl/judge-case.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/multi-harness-rl/judge-case.svg" alt="SWE-bench Verified 真实 Astropy case 的可见输入和隐藏 judge" width="1200" height="690"></a>
  <figcaption>任务与测试名称来自固定的 SWE-bench Verified 数据；标准包的判定规则来自 swebench 4.1.0 源码。论文虽固定此包版本，但专用复测代码未公开；两者不能视为同一份已复现实现。</figcaption>
</figure>
</details>

<strong>本文专用的执行日志和评分器还没有公开。</strong>2026-10-14 核对的 v2 Appendix E.1 明确说：evaluation harness、grading oracle、分析代码、结果和分析计划拟在以后发布，投稿时尚未公开；arXiv source archive 也只有论文材料。上面的任务来自公开数据，源码微测只验证标准包的局部分支，不能据此声称已复现本文各接口下的执行或成绩。

<h2 id="原接口小幅提升，未见接口没有稳定额外收益">4. Experiments：原接口小幅提升，未见接口没有稳定额外收益</h2>

<strong>两种规则在原接口上只有小幅估计增益，未见接口上都没有显著超过 SFT。</strong>Cross 也没有显示出跨训练随机种子稳定优于 Within 的表现。

<h3 id="4-1-原接口有小幅增益，但最大变量是评测接口">4.1 原接口有小幅增益，但最大变量是评测接口</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/multi-harness-rl/reading-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/multi-harness-rl/reading-results.svg" alt="根据 v2 Figure 2 / Table 4 数据重绘；未见接口来自 Tables 5–7；正文纵向阅读图" width="600" height="1139"></a><figcaption>根据 v2 Figure 2 / Table 4 数据重绘；未见接口来自 Tables 5–7。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/multi-harness-rl/source-matrix.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/multi-harness-rl/source-matrix.svg" alt="四种评测 harness 与六种训练方案的 solve rate 矩阵" width="1200" height="670"></a>
  <figcaption>根据 v2 Figure 2 / Table 4 数据重绘。列均值差异为 7.13 pp；行均值差异为 0.91 pp。Aider、OpenHands、Qwen Code、SWE-agent 各列分别纳入 482、498、497、495 题；不是每列都用完整 500 题。</figcaption>
</figure>
</details>

Within 在四个原接口上的行均值为 6.18%，Cross 为 6.46%，SFT 为 5.70%；相对 SFT 的估计增益为 +0.48、+0.77 pp。Cross 的配对增益在 Table 6 报为 <strong>+0.77 pp，95% CI [+0.03,+1.52]</strong>；对五次模型比较做 Bonferroni 修正后，99% CI 为 [−0.21,+1.75]，包含 0。最大单列增益都在 OpenHands：Within 为 +1.71 pp，Cross 为 +1.81 pp。

列均值从 Aider 的 2.14% 到 OpenHands 的 9.27%，差 7.13 pp；模型行均值从 Base 的 5.55% 到 Cross 的 6.46%，差 0.91 pp。这个<strong>描述性比较</strong>说明本设置下接口差异更大，不说明具体哪种工具导致差异，也不能把不同模型的列平均说成“每个模型都相差四倍”。

第二个预训练模型 Seed-Coder-8B 在 weak-ReAct 上是 5.00%，Qwen3-8B 为 4.07%；Seed-Coder 换成 Aider 或 SWE-agent，较自己的 weak-ReAct 分别下降 4.41、4.40 pp。它在 OpenHands、Qwen Code 下各 1,000 次尝试全部发生 harness error，没有产出补丁，这两项记为无法测量。另一方面，Seed-Coder 的 2,000 次 weak-ReAct 尝试中，32 次超过 32,768 token 上下文限制，论文<strong>把它们计为失败 0</strong>。不能笼统说所有执行错误都排除。（Table 8）

<h3 id="4-2-未见接口上没有检测到-Cross-的额外迁移收益">4.2 未见接口上没有检测到 Cross 的额外迁移收益</h3>

<figure class="figure">
  <a href="/lib/papers/multi-harness-rl/heldout.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/multi-harness-rl/heldout.svg" alt="held-out weak-ReAct 的得分、检出能力和多随机种子结果" width="1200" height="650"></a>
  <figcaption>根据 v2 Figure 3a、Tables 5–7 重绘。avg@4 的六种模型只落在 4.01%–4.73%；它们的得分差异小于估计的最小可检出效应。</figcaption>
</figure>

在匹配题目集合的预算比较中，每题尝试从四次增至八次，Cross − Within 从 +0.58 pp 缩到 <strong>+0.25 pp，95% CI [−0.48,+1.02]</strong>。八次尝试的 Cross − SFT 为 +0.13 pp [−0.65,+0.92]，Within − SFT 为 −0.03 pp [−0.64,+0.59]；都没有显著超过 SFT。三种训练随机种子的 Cross − Within 分别为 +0.62、+0.05、−0.20 pp，合并为 +0.16 pp [−0.41,+0.72]。合并区间对题目重采样、固定这三种已观察的 seed，不能当成覆盖所有训练随机性的区间。

为什么 Table 5 的八次尝试绝对分是 SFT 4.38%、Within 4.28%、Cross 4.38%，Table 6 的配对差值却不能直接相减出来？<strong>它们用的题目和有效尝试集合不同。</strong>Table 5 纳入三种模型都有分的 500 题，每题用实际获得判定的尝试。Table 6 先筛到三种模型都至少有七次有效判定的 486 题，再对每一对模型只保留双方八次判定完整的题；三项比较的最终题目集合可以不同，所以差值不必可加。Table 7 又匹配四次与八次预算的题目，这也是其 +0.58 pp 不等于主要四次对比 +0.62 pp 的原因。

这组结果没有建立两种规则的等价性。作者估计，avg@8 的最小可检出效应在 0.88–1.14 pp：这是按区间宽度近似计算、检出概率达到 80% 所需的真实差异，<strong>不是“已经排除的差异上限”</strong>。较小的收益或损失仍与当前区间相容。（Appendix B.2）

<h3 id="4-3-从-advantage-能猜出接口，但行为差异仍主要由接口决定">4.3 从 advantage 能猜出接口，但行为差异仍主要由接口决定</h3>

作者将 183 题分为五折，同题所有执行必须留在同一折。分类器只输入一个 advantage 数值，用其他四折训练，在剩下一折猜记录来自哪套 harness；再把每题内部的 harness 标签打乱，得到各方案自己的基准准确率。Cross 是 30.63%−26.15%=<strong>+4.48 pp</strong> [3.22,5.83]，Within 是 26.41%−26.39%=+0.02 pp，区间包含 0。它测出相对分与接口身份的关联，没有证明模型已经“记住接口”或因此不能迁移。（Table 9）

两个辅助对照也没有解决因果归因。Coverage-matched 把部分 advantage 置零，同时把分类器超出基准的准确率降到 +1.17 pp，因此它既改变非零信号数量，也改变接口可预测性。Residualized 先减去各 harness 在<strong>其他任务</strong>上的平均分，再按任务混合标准化；基准来自全部 1,008 题，其中多数全失败，训练却只用 183 个混合结果任务，分布不匹配。调整后接口仍可预测，超出基准 +4.54 pp。两项对照相对 Cross 的未见接口差值为 −0.28、−0.03 pp，置信区间都包含 0；不能据此说已经单独检验并排除了某个原因。

<figure class="figure">
  <a href="/lib/papers/multi-harness-rl/diagnostics.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/multi-harness-rl/diagnostics.svg" alt="advantage 中的 harness identity 与 action distribution JSD" width="1200" height="680"></a>
  <figcaption>根据原论文 Figure 3b、Figure 4、Tables 9–10 重绘。Aider 只保存普通聊天，没有可解析的工具调用，因此不进入动作标签分析。</figcaption>
</figure>

动作分析比较的是 <strong>SFT 与 Cross</strong>，没有比较 Within 与 Cross。规则程序给每个 assistant turn（模型的一次回复）一个优先级最高的动作标签，顺序为提交、编辑、写文件、测试、运行脚本、搜索、读取等；同一回复先编辑再测试，会只记为编辑。各次执行内先算动作占比，再对题目取平均。因此 weak-ReAct 的测试主标签占比 0.6% 不表示几乎没有运行测试：允许一条回复记多个标签后，SFT / Cross 的测试占比为 3.2% / 2.9%。（Appendix C.2）

作者用 Jensen–Shannon divergence（JSD）衡量两组动作频率分布的差异，单位 bit，0 表示分布相同。同一模型换接口的六组两两比较在 0.174–0.350 bit；同接口比较 SFT 与 Cross 只有 0.0003–0.0029 bit。160 条回复人工抽查中错标 11 条，其中 8 条来自 SWE-agent。<strong>频率接近不代表每一步决策一样，也不评价动作是否正确。</strong>它只能辅助说明动作组成对接口敏感，迁移结论仍要看隐藏测试成绩。

<h3 id="4-4-重采执行记录后，结论是否改变？">4.4 重采执行记录后，结论是否改变？</h3>

论文额外训练了一条 re-collected Cross：前半程重放冻结数据；中途让当前模型通过四套 harness 重跑原来的 183 题，其中 131 题仍同时出现成功与失败，供后半程更新使用。新数据第一次更新时，概率比与 ESS 均为 1.000，因为它刚由这个模型采集。未见接口的 avg@4 为 4.85%；较离线 Cross 高 +0.13 pp [−0.85,+1.10]，较 Within 高 +0.75 pp [−0.10,+1.65]，仍没有显著差异。<strong>它只检验 Cross 的一次中途重采，不是 Within 与 Cross 的持续在线训练对照。</strong>

Appendix A.4 披露了作者排查过的五类故障：不同条件共用容器导致代码相互污染，服务还没注册模型便返回 404 导致受影响批次约 20% 执行被跳过，严格 UTF-8 解码使评分器崩溃，容器 Git 损坏，以及镜像缓存不全导致每轮固定停在 25 题。作者说修复并重新验证后才纳入分析；原始材料未公开，本解读不能独立证实修复效果。

<h2 id="对完整-coding-harness-研究的实验建议">5. Discussion：对完整 coding harness 研究的实验建议</h2>

**训练报告应分别写清模型见过什么接口、分数怎样分组、原接口涨多少、未见接口涨多少。** 一个多接口总分无法区分这些因素。

后续优先做四组对照：

1. 用 Claude Code、Codex CLI、OpenHands 做完整的训练接口 × 评测接口矩阵，固定模型、任务、预算和评分程序。
2. 比较整题二值分数与工具级、阶段级反馈，检验更细的归因是否有助于换接口。
3. 若要扣除接口本身的平均分偏移，在实际训练任务分布上验证调整确实有效，再检验迁移；预测回报的 value model 可以作为另一种对照。
4. 增加多个未见接口，分别改提示格式、工具名称、上下文规则和错误恢复策略，定位哪一层阻碍迁移。

<div class="note blue"><p>产品评测也应一起记录模型、harness 名称和版本、工具格式、尝试次数和评分程序。同一模型换执行接口，成功率和动作分布都可能明显改变。</p></div>

<h2 id="负结果的价值与适用范围">6. Conclusion：负结果的价值与适用范围</h2>

<strong>值得保留的是受控比较，结论须限于这组数据、模型和接口。</strong>作者区分了原接口增益、未见接口增益、分组规则差异，并报告了随机种子、有效题目集合和检出能力；这比只给一个总分更容易判断证据。

<div class="limit-grid">
  <div><b>模型与任务范围</b><span>训练模型只有 Qwen3-8B，绝对成功率多为 1%–10%；Python 仓库修复不能代表高能力模型或其他交互领域。</span></div>
  <div><b>未见接口范围</b><span>只测试一个极简 weak-ReAct，不能代表 Claude Code、Codex 或 IDE 的各种分布变化。</span></div>
  <div><b>训练任务筛选</b><span>只保留同题合并后既有成功又有失败的 183 题。Cross 的全覆盖依赖这个筛选；没有匹配的单接口训练对照。</span></div>
  <div><b>SFT 基线</b><span>SFT 与 RL 都用 3e-7 学习率和匹配预算，但没有独立调优成功轨迹蒸馏超参数。RL 超过这个基线，不等于超过最好的 SFT 配方。</span></div>
  <div><b>材料未公开</b><span>v2 明确说执行程序、专用评分器、结果与分析代码拟以后发布；目前不能独立复核逐题成绩。</span></div>
  <div><b>统计与因果限制</b><span>不显著不能推出等价。辅助对照没有分别隔离非零信号数量与接口可预测性；动作频率也不能证明能力或因果机制。</span></div>
</div>

对 Claude Code、Codex 相关研究，这篇最有用的是实验问题的拆分：<strong>在原流程中训练得更好、换流程后仍然更好、仅改变分组就能更好，是三项需要分别证明的主张。</strong>本文没有为最后两项提供稳定的正证据，也没有证明多接口 RL 无用。

</div>

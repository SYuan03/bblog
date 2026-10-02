---
title: "[2026-08-23] Learning Generalizable Behaviors for Terminal Agents"
permalink: "/posts/论文解读/learning-generalizable-behaviors-for-terminal-agents.html"
date: "2026-09-29T16:24:00+08:00"
updated: "2026-09-29T16:24:00+08:00"
cover: "/generated-covers/056-learning-generalizable-behaviors-for-terminal-agents.webp"
description: "RIVER 先审计 instruction、Docker 与 verifier，从原有训练集留下约 3.5K 个可信环境，再用 repetition penalty 修正 turn-level advantage。本文从两条真实误判 case 出发，拆清数据、judge、训练与证据边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Terminal Agent"
  - "Reinforcement Learning"
  - "Agent Harness"
  - "Verifier"
  - "Benchmark"
---

<style>
html:not([data-theme="dark"]) body:has(.river-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:40ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.river-reading{--column:780px;--blue:#2d669f;--orange:#b75b35;--green:#2b7863;--red:#a3443d;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.river-reading>*{max-width:100%}.river-reading p,.river-reading li{text-wrap:pretty}.river-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.river-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.river-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.river-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.river-reading .deck-head strong{font-size:.92rem}.river-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.river-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.river-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.river-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.river-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.river-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line-local));background:color-mix(in srgb,var(--blue) 5%,#fff)}.river-reading .interest b{color:var(--blue);font:750 1.2rem/1 var(--mono)}.river-reading .interest span{color:var(--soft);font-size:.84rem}
.river-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.river-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.river-reading .metric:last-child{border-right:0}.river-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.river-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.river-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.river-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.river-reading .keypoints ul{margin:0;padding-left:1.2rem}.river-reading .keypoints li{margin:.42rem 0}.river-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--green);background:var(--surface)}.river-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.river-reading .kicker{display:block;margin-bottom:6px;color:var(--green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.river-reading h2{margin-top:3.55rem}.river-reading h3{margin-top:2.1rem}.river-reading h4{margin-top:1.7rem}.river-reading strong{font-weight:750}.river-reading .table-scroll,.river-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.river-reading .table-scroll table{display:table;width:100%;min-width:720px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.river-reading th,.river-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.river-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.river-reading td:first-child{font-weight:650}.river-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.river-reading code{font-size:.92em}
.river-reading .figure{width:100%;margin:27px 0}.river-reading .figure img{display:block;width:auto;max-width:100%;max-height:780px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.river-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.river-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.river-reading .role{padding:16px;background:#fff}.river-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.river-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.river-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.river-reading .flow li{min-height:130px;padding:12px;background:var(--surface)}.river-reading .flow b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.river-reading .flow span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.river-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.river-reading .case h4{margin:0 0 8px;font-size:1.12rem}.river-reading .case ol{padding-left:1.2rem}.river-reading .case li{margin:.58rem 0}.river-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.river-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.river-reading .verdict strong{display:block;margin-bottom:4px}.river-reading .verdict .pass strong{color:var(--green)}.river-reading .verdict .fail strong{color:var(--red)}
.river-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.river-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.river-reading .note p{margin:.34em 0}.river-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.river-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.river-reading .limit-grid>div{padding:17px;background:#fff}.river-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.river-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(2rem,9.2vw,2.45rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.river-reading,.river-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.river-reading .source-links a{overflow-wrap:anywhere}.river-reading .deck-wrap{max-width:100%;overflow:hidden}.river-reading .metrics{grid-template-columns:1fr 1fr}.river-reading .metric:nth-child(2){border-right:0}.river-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.river-reading .flow{grid-template-columns:1fr 1fr}.river-reading .roles{grid-template-columns:1fr}.river-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.river-reading .flow,.river-reading .verdict,.river-reading .limit-grid{grid-template-columns:1fr}.river-reading .part0,.river-reading .case{padding:17px 15px}.river-reading .deck-head,.river-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="river-reading">

<p class="paper-meta">Yihang Yao, Bo Pang, Xuan Phi Nguyen, Ding Zhao, Shafiq Joty, Semih Yavuz · arXiv:2608.22631v3 · 2026-09-24</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.22631">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.22631">论文 PDF</a>
  <a href="https://terminal-river.github.io/">官方项目页</a>
  <a href="https://github.com/Terminal-River/terminal-river.github.io">项目页源码</a>
  <a href="https://huggingface.co/datasets/allenai/TMax-15K">上游 TMax-15K</a>
</div>

<section class="deck-wrap" aria-label="RIVER 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · motivation、judge、真实 case、训练与证据边界</strong><a href="/lib/decks/river-terminal-agents-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/river-terminal-agents-visual-guide.html" title="Learning Generalizable Behaviors for Terminal Agents 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">Terminal agent 的 RL 看起来像一道规模题：合成更多任务，让模型在更多 Docker 环境里练习。RIVER 先检查了更基础的一件事：这些环境给出的 reward 到底对不对。它发现 TMax-15K 中只有 35.8% 被 GPT-5.4 判为 CLEAN；有的 verifier 会奖励直接读取泄露答案，有的会因为函数名不同而拒绝功能完全正确的实现。论文据此把环境过滤、oracle pass@2 和 turn-level repetition penalty 组合成一套训练 recipe。</p>

<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>评分仅表示博客作者本人兴趣程度；reward integrity 与完整 terminal harness 研究高度相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>14,399 → ≈3.5K</strong><span>TMax 环境经过两级过滤</span></div>
  <div class="metric"><strong>19.4 ±1.2</strong><span>River-8B 四 benchmark 平均分</span></div>
  <div class="metric"><strong>0.64 → 0.74</strong><span>behavior features 的 success AUC</span></div>
  <div class="metric"><strong>32.3 → 49.2</strong><span>只用 2 domains 做 RL 的 held-out 总分</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>RIVER 把 reward signal 的可信度放在环境数量之前。</strong>约 3.5K 个环境胜过完整 TMax，是过滤后的实验结果，不是一个越小越好的规模定律。</li>
    <li><strong>14,399 个环境没有经过人工逐条标注。</strong>GPT-5.4 根据 instruction、Docker 和 verifier 给出八类 verdict；Claude Opus 4.8 只在 120 个分层样本上做独立复判。</li>
    <li><strong>最终训练 reward 仍来自原任务 verifier。</strong>GPT-5.4 audit 和 GPT-5.4 + Terminus-2 的 pass@2 负责筛任务，不直接给 policy 每一步打分；只有 repetition rule 进入 turn-level advantage shaping。</li>
    <li><strong>“+106% / +30%”指 RL gain 的相对增幅。</strong>它不是 Terminal-Bench 的绝对分数提高 106 个百分点。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 读这篇论文前，先把 terminal-agent RL 的四个角色分开

一个训练环境通常包含 `instruction.md`、Docker 镜像或 Dockerfile、任务文件，以及训练结束后运行的 verifier。被训练的 policy 通过 harness 看到任务文字、自己执行过的 command 和 terminal observation，也能读取容器里实际暴露的文件。Verifier 在 rollout 后判定 PASS / FAIL。环境作者本来想隐藏的 reference 如果被打进可读容器，它事实上就是 Agent-visible input。

<div class="roles">
  <div class="role"><b>TMax AUTHORS</b><span>生成上游合成任务、容器与原始 verifier。</span></div>
  <div class="role"><b>RIVER AUTHORS</b><span>用 GPT-5.4 审计环境，再用 oracle pass@2 做第二次筛选。</span></div>
  <div class="role"><b>TRAINED POLICY</b><span>在留下的任务中交互；原 verifier 给 binary outcome reward。</span></div>
  <div class="role"><b>BEHAVIOR RULE</b><span>检测 command 与 observation 的重复，为对应 turn 加负 shaping。</span></div>
  <div class="role"><b>EVAL HARNESS</b><span>在四个外部 benchmark 上按各自默认 checker 评分。</span></div>
  <div class="role"><b>THIS ARTICLE</b><span>重画数据和真实 rollout；未把缺失的 checker 代码补成“官方实现”。</span></div>
</div>

GRPO 对同一个 prompt 采样一组 rollout。第 (i) 条轨迹通过全部 verifier 时 (r_i=1)，否则为 0；组内标准化后的 (A_i) 会广播给该轨迹的 token。RIVER 在这之后加一个 turn-level 项 (s_{i,t})：如果本 turn 的 command 和 observation 都与更早 turn 的 Jaccard similarity 大于 0.8，就对该 turn 的 response tokens 加 (-\delta)。论文使用 (delta=0.05)，每条 rollout 最多扣 0.15。
</aside>

## Q1. 为什么 terminal-agent RL 不能只靠扩大环境数量？

**Policy 会沿着 verifier 的实际判定边界学习，即使这条边界偏离了 instruction。** 对数学题，错误答案通常只是一次负样本；对长程 terminal task，一个弱 checker 会让整条错误策略得到正向强化。Agent 如果发现复制 `/app/ground_truth.txt` 最容易拿到 1 分，RL 就会提高这种 shortcut 的概率。

现有路线已经覆盖了更多技能和任务类型。Endless-Terminals 展示了大规模合成环境上的 RL，TMax 又扩展到 14,399 个跨领域任务。RIVER 检查这些环境的 reward integrity：instruction 说的目标、Docker 实际提供的状态和 verifier 检查的条件，是否指向同一件事。

论文给出一个机制解释。Pre-training 与 SFT 主要提供 atomic skills，例如写 shell pipeline、调用编译器、理解某个领域操作；RL 更可能改变跨多个 turn 的 behavior，例如是否先检查环境、遇错后换方案、结束前验证，以及是否反复执行近似命令。它称之为 **Agentic Compositional Generalization**。

<figure class="figure">
  <img src="/lib/papers/river-terminal-agents/behavior.svg" alt="RIVER 的 skill 与 behavior 分析">
  <figcaption>根据原论文 Figures 1、5 与 §5.1-5.2 重绘。Behavior features 的 AUC 从 SFT 的约 0.64 升到 RL 的 0.74；skill-presence features 约 0.48-0.56。这个结果是相关性和结构变化证据，不能作为严格的因果分解。</figcaption>
</figure>

这套解释有两个可检验预测。第一，SFT 数据的 skill coverage 应该影响较弱模型的起点。第二，RL 环境的 verifier 会决定哪些跨 turn 模式被强化。RIVER 的方法和实验都围绕这两个预测展开。

## Q2. 它与 Endless-Terminals、TMax 和“更强测试”路线的边界在哪里？

**Endless-Terminals 与 TMax 主要扩大训练覆盖，RIVER 把研究对象换成 reward integrity，并尝试解释 RL 到底改变了 trajectory 的哪一层。** 它不是新的通用 terminal benchmark，也没有提出新的 task generator。上游环境仍来自 TMax。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>主要扩展对象</th><th>Reward / judge</th><th>与 RIVER 的边界</th></tr></thead>
  <tbody>
    <tr><td>Endless-Terminals</td><td>大规模可执行 terminal environments</td><td>每个环境的 outcome verifier</td><td>证明 synthetic RL 可以提升 terminal agent；RIVER 进一步检查 verifier 是否给对信号。</td></tr>
    <tr><td>TMax</td><td>14,399 个任务的 domain 与 skill coverage</td><td>随环境发布的 task-specific verifier</td><td>RIVER 直接使用它作为 source pool，只留下约 3.5K 个任务。</td></tr>
    <tr><td>Stronger-tests / verifier-generation</td><td>为 coding task 生成更强 unit tests</td><td>提高 output correctness 的判别力</td><td>RIVER 同时检查 instruction、环境与 verifier 的一致性，并关注这些信号塑造的 multi-turn behavior。</td></tr>
    <tr><td>Compositional generalization</td><td>单轮 reasoning 中的 primitive 与 composition</td><td>通常是最终答案 reward</td><td>本文把假设扩展到有 command、observation 和 recovery 的多轮 agent trajectory。</td></tr>
  </tbody>
</table>
</div>

RIVER 把方法和机制解释绑在一起：如果 RL 主要塑造可复用 behavior，那么 verifier 的错误会跨 domain 扩散；一个简单但可靠的重复检测规则，也可能在许多任务上同时生效。

## Q3. 14,399 个环境怎样变成 3.5K，judge 又怎样产生一条 reward？

### 3.1 数据来源、筛选与责任边界

RIVER 从 TMax 的 14,399 个训练环境开始。每个环境的核心是 instruction、Docker / bundled data 与 task-specific verifier。论文没有报告人工 annotator 逐条创建 CLEAN 标签，而是让 GPT-5.4 同时读取这三类材料，围绕“一个认真遵守 instruction 的 Agent 能不能理解任务并通过 verifier”给出一个主 verdict。

八类 verdict 是 CLEAN、VERIFIER-TOO-WEAK、INSTR-VERIFIER-MISMATCH、INSTR-ENV-MISMATCH、ANSWER-LEAK、INSTR-AMBIGUOUS、TASK-TRIVIAL 和 OTHER。一个任务可能同时有多个缺陷，但 audit 强制选择一个主类别。GPT-5.4 判 CLEAN 后，作者再用 **GPT-5.4 + Terminus-2** 对环境做 oracle `pass@2`，移除两次都失败的任务。后一步主要排除过难任务和训练 infrastructure 不兼容，而不是再次判断 verifier 是否正确。

<figure class="figure">
  <img src="/lib/papers/river-terminal-agents/pipeline.svg" alt="RIVER 从 TMax 环境到 RL 训练集的完整流程">
  <figcaption>根据原论文 Figure 2、Algorithm 1、§3.2 与 Appendix A-C 重绘。GPT-5.4 rubric audit、oracle pass@2 和训练时 verifier 是三个不同阶段，不能合并成一个“LLM judge”。</figcaption>
</figure>

<ol class="flow">
  <li><b>1 · PACKAGE</b><span>TMax 作者提供 instruction、container 与 verifier。</span></li>
  <li><b>2 · AUDIT</b><span>GPT-5.4 静态读三类材料，给八类 verdict。</span></li>
  <li><b>3 · ORACLE</b><span>GPT-5.4 + Terminus-2 各跑两次，去掉 pass@2=0。</span></li>
  <li><b>4 · ROLLOUT</b><span>Policy 在留下的 container 中按 harness 交互。</span></li>
  <li><b>5 · CHECK</b><span>原任务 verifier 全部通过才得到 outcome reward 1。</span></li>
  <li><b>6 · SHAPE</b><span>重复 turn 的 response-token advantage 额外扣分。</span></li>
</ol>

### 3.2 Agent 能看见什么，什么应当隐藏？

Policy 能看见 instruction、command history、terminal observations，以及容器权限允许读取的文件。GPT audit verdict、oracle 两次 rollout 和其他训练样本不在它的 prompt 中。Task verifier 在 rollout 后运行，作为 outcome reward 的来源。

理想情况下，ground truth、reference implementation 和 hidden tests 应当只对 verifier 可见。TMax 的部分任务把它们直接放进 `/app`，于是“应当隐藏”与“实际隐藏”发生分离。RIVER 的 ANSWER-LEAK 标签就是为这种问题准备的。论文没有给出统一的 sandbox access-control 规范，也没有发布 3.5K 过滤结果供本文逐条核查；这里能确认的是论文和项目页公开的 audit 结果与 case files。

### 3.3 一条 PASS 和一条 FAIL 为什么都判错了？

<figure class="figure">
  <img src="/lib/papers/river-terminal-agents/judge-cases.svg" alt="TMax 中一条 false-positive reward 与一条 false-negative reward">
  <figcaption>根据原论文 Appendix C.4 的真实 rollout 重绘。左侧 `task_003722` 因 reference 文件可读而奖励 shortcut；右侧 `task_006064` 因源码字符串检查而拒绝功能正确的 Rust 实现。</figcaption>
</figure>

`task_003722` 要从 `broadcast.mp4` 中 OCR 新闻 ticker。Agent 先发现并读取 `/app/ground_truth.txt`，随后还是尝试了正常抽帧与 OCR，但自己的结果与 reference 的 similarity 只有 0.368，低于 0.85 门槛。第 7 个 turn 它用泄露 reference 覆盖输出，第 8 个 turn 达到 1.0，于是 reward=1。Similarity 的计算本身没有问题，问题出在 reference 被放进了 Agent 可读区域。

`task_006064` 要求 Rust 程序保留 `a-z` 与空格。Agent 使用 `is_ascii_alphabetic()`，生成的 top tokens 与 covariance matrix 都通过 functional tests。第三个 test 却在源码里 grep `is_alphabetic` 字面量。合法 API 名不含这段连续字符串，整题因此 reward=0。这个 FAIL 测到的是 implementation spelling，不是 instruction 规定的行为。

### 3.4 Turn-level repetition penalty 到底怎样算？

<div class="formula">A<sub>i,t</sub> = (r<sub>i</sub> − mean(r)) / (std(r) + ε) &nbsp;&nbsp;·&nbsp;&nbsp; Ã<sub>i,t</sub> = A<sub>i,t</sub> + s<sub>i,t</sub></div>

下面是按论文公式写的最小重建示例，只用于解释接口，**不是官方训练代码**。论文作者截至 2026-09-29 没有公开 RIVER training repo、River-8B checkpoint 或 RIVER-TMax-3.5K 下载。

<div class="code-scroll"><pre><code># Article reconstruction from Eq. (1), not official code.
def repeat_shaping(turns, delta=0.05, cap=0.15):
    """Return per-turn penalties after GRPO reward normalization."""
    penalties = [0.0] * len(turns)
    spent = 0.0
    for i, current in enumerate(turns):
        repeated = any(
            jaccard(current.command, old.command) &gt; 0.8
            and jaccard(current.observation, old.observation) &gt; 0.8
            for old in turns[:i]
        )
        if repeated and spent &lt; cap:
            penalty = min(delta, cap - spent)
            penalties[i] = -penalty
            spent += penalty
    return penalties</code></pre></div>

这个 rule 要求 command 和 observation 同时近似，避免把“同一检查命令得到新信息”全部当作 loop。它改变相应 turn 的 token advantage，不改最终 PASS / FAIL。论文的消融还试过 verify-before-done reward。那条 reward 确实增加了结束前验证行为，却没有继续提高 benchmark 表现，所以最终 recipe 只保留 repetition penalty。

### 3.5 Audit 本身可靠吗？

<figure class="figure">
  <img src="/lib/papers/river-terminal-agents/audit.svg" alt="三个 terminal environment 集合的 clean rate 与双模型复判结果">
  <figcaption>根据原论文 Figure 11、Table 7 与 Appendix C 重绘。120 个样本按 GPT-5.4 的八类 verdict 分层抽取，因此 83.3% 只能描述这套 sampling design 下的 binary agreement。</figcaption>
</figure>

作者让 Claude Opus 4.8 在看不到 GPT 标签的情况下复判 120 个环境，每个 GPT verdict 类别抽 15 个。八分类完全一致只有 22.5%，因为同一坏环境常有多个缺陷；合并成 CLEAN / defective 后，一致 100/120，即 83.3%。更有用的是条件结果：GPT 判 defective 的 105 个中，Claude 也判 defective 的有 94 个，89.5%；GPT 判 CLEAN 的 15 个中，Claude 仍判 CLEAN 的只有 6 个，40%。所以这套 audit 更适合保守排除明显坏环境，不适合把 CLEAN 当成经过充分人工认证。

## Q4. 实验结果支持哪些结论？

### 4.1 River-8B 的主结果

<figure class="figure">
  <img src="/lib/papers/river-terminal-agents/results.svg" alt="River-8B 与 OpenThinker-8B-RL 在四个 terminal benchmark 上的结果">
  <figcaption>根据原论文 Table 1 重绘。River-8B 在 OpenThoughts-TBLite、Terminal-Bench-v2.1、Terminal-Bench-Pro 和 TerminalWorld-Verified 上的平均分为 19.4±1.2，最强 baseline OpenThinker-8B-RL 为 17.8±0.7。</figcaption>
</figure>

River-8B 从 Qwen3-8B 出发，先用约 78K OpenThoughts trajectories 做 SFT，再用 RIVER-TMax-3.5K、EndlessAgent harness 和 GRPO 做 RL。四个 benchmark 共 589 tasks；每个 checkpoint 运行 3 seeds，单题最多 64 action turns 或 600 秒。OpenThoughts-TBLite 给连续分数，其余三个只有全部 checker 通过才记 1。主表的 Average 是四个 benchmark 的不加权平均。

**最精确的主结论是：River-8B 在论文重测的 open-source RL-trained 8B agents 中，四项与平均分均最高。** 不能把它直接扩成“所有 terminal agents 的 SOTA”，因为闭源 Claude / Codex 不在这张表里，而且 baseline 使用各自原生 harness。作者尽量统一 serving 与 budget，但模型、SFT 数据、RL 环境和 harness 仍有多处同时变化。

### 4.2 为什么 broad-skill SFT 也在 recipe 里？

作者为 Qwen3-8B 构造了三个 SFT 起点：以 `nl2bash` 和 `InferredBugs` 为主的 Narrow-SFT，约 13.6K trajectories；从更广来源组成的 Diverse-SFT，约 78K；以及从 Diverse-SFT 随机抽到同样 13.6K 的 Diverse-DS-SFT。Narrow-SFT 与 Diverse-DS-SFT 在 SFT 后的平均分接近，继续做同一套 RL 后却拉开明显差距。这个 size-matched 对照部分排除了数据量的影响，剩下的差别主要来自 atomic-skill coverage。

论文还报告了一次失败的早期实验。作者在未经过 RIVER 过滤的 TermiGen 环境上使用 partial reward，训练 reward 和 in-distribution score 都上升，外部四项平均分反而下降，同时 rollout 越来越早结束。换成 Diverse-SFT 起点后，同一设置的 reward hacking 有所减轻。作者因此把 broad-skill SFT 放在较弱 base model 的 RL 之前；它不是 RIVER 的环境过滤核心，但会影响 policy 有没有能力通过正常路径完成训练任务。

### 4.3 少于 30% 的环境，为什么会出现 +106%？

作者进一步沿用 TMax 的 Qwen3.5-2B/4B/9B、Qwen3.6-27B、Vanillux2 harness 与 DPPO 设置，只把完整 TMax 训练集换成 RIVER 过滤后的约 3.5K 环境。论文按每个模型的 `RL score − base score` 先算 RL gain，再比较两套训练集的 gain。

结果是 Terminal-Bench-Lite 上的平均 RL gain 相对 TMax **增大 106%**，Terminal-Bench-v2.1 上增大 30%。这说明过滤后的 reward signal 在这些配置里更有效率。它不表示模型得分增加 106 个百分点，也不表示每个 model size 都提高相同比例。

### 4.4 Behavior 是否真的跨 domain 转移？

<figure class="figure">
  <img src="/lib/papers/river-terminal-agents/transfer.svg" alt="使用二到八个 domain 做 RL 后的 held-out 任务表现">
  <figcaption>根据原论文 Table 2 与 Figure 8 重绘。只在 Debug + Systems 的约 800 个环境上做 RL，held-out 总分仍从 SFT 的 32.3 升到 49.2；四域与八域分别是 53.6 与 53.9。</figcaption>
</figure>

作者从 RIVER-TMax-3.5K 中另留约 300 个任务做 controlled evaluation，再让 RL 只看 2、4、6 或 8 个 domain。两域训练只包含 Debug 和 Systems，其他六域仍然出现提升。轨迹里的 inspection、error recovery、repetition 等 behavior 变化也同时出现在未训练域。

这组结果支持“跨 domain 的 behavior transfer”。边界同样要写清：domain 来自作者对 TMax task skill 的分类，held-out tasks 仍属于同一个合成环境家族；它不是独立收集的真实用户分布。

## Q5. 对 Claude Code、Codex 这类完整 harness，哪些结论最值得复用？

**第一，harness 里的 evaluator 是训练系统的一部分。** 只要 checker 错了，更多 rollout 会更稳定地优化错误目标。构建 terminal-agent 训练集时，应当把 instruction、sandbox、可见文件、hidden reference、test protocol 和 reward aggregation 当成一个整体审计，而不是只数任务类别。

**第二，judge 要同时检查 false positive 与 false negative。** 前者让 shortcut 得分，后者让正确方案受罚。只做 pass@k 难度过滤会漏掉两类问题：一个泄露答案的任务可能很容易 pass，一个错误 hard-coded reference 可能让所有强模型都失败。

**第三，behavior feature 可以成为轻量诊断层。** Command repetition、inspection、error recovery 和 verify-before-done 都可以从真实 terminal traces 里确定性提取。它们适合做训练监控和 failure analysis；只有经过 intervention 证明会提高结果的 feature，才适合进入 advantage shaping。本文中 verify reward 就是一个反例：相关但没有带来额外性能收益。

<div class="note blue"><p><strong>对下一篇完整 harness 论文，我会优先补三个实验：</strong>在 Claude Code、Codex CLI 与开源 runner 上使用同一批 sealed tasks；让独立人工与多个 model judges 复核 reward disagreement；把 task family、container provenance 和 checker author 全部隔离到未见 split。这样才能判断学到的是可迁移 behavior，还是某个上游 generator / harness 的惯例。</p></div>

## Q6. 最后怎样评价这篇论文？

**这篇论文最强的部分，是用真实 false-positive / false-negative rollout 说明 reward integrity 会怎样改变 Agent 行为，再用跨 model、size、harness 和 domain 的实验检查同一 recipe。** 它还认真报告了一个负结果：verify-before-done 与成功相关，但直接奖励它没有继续提高性能。

需要保留的限制也很具体：

<div class="limit-grid">
  <div><b>Audit 不是人工金标准</b><span>14,399 个环境由 GPT-5.4 判主类别；Claude 只复判 120 个分层样本，CLEAN 条件一致率为 40%。</span></div>
  <div><b>官方训练 artifacts 未公开</b><span>截至 2026-09-29，只找到项目网页仓库 revision <code>6da2749</code>。没有训练代码、3.5K 清单、checkpoint 或 task-level logs。</span></div>
  <div><b>主表仍有 harness confound</b><span>River、OpenThinker 与 TMax 使用不同原生 harness。2B-27B 的 TMax 对照更干净，但作者也因资源限制改成本地 Docker。</span></div>
  <div><b>机制证据主要是相关性</b><span>Behavior AUC、RSA 与 domain transfer 都符合 hypothesis；它们没有证明 RL 的所有增益都由这 12 个 behavior 导致。</span></div>
  <div><b>外部 benchmark 的 hidden boundary 未统一披露</b><span>论文采用四个 benchmark 的默认 evaluator，没有逐个公开 checker 可见性与 contamination audit。</span></div>
  <div><b>环境家族仍然集中</b><span>训练和 controlled held-out 都来自 TMax 系列。跨真实组织、私有 repo 和长期任务的转移还未验证。</span></div>
</div>

我的最终判断是：**RIVER 要求先审计 reward，再决定是否扩大训练环境。** 它的 3.5K 环境未公开，限制了完全复核；但两类真实 verifier failure、严格区分的筛选 actor，以及 behavior reward 的正负消融，已经给 terminal-agent RL 提供了一套很实用的实验框架。

<div class="note"><p><strong>来源与授权说明：</strong>论文为 arXiv non-exclusive distribution license，项目仓库未声明 license。本文没有复用原图像素，所有图均根据 arXiv:2608.22631v3 的 Figures 1-11、Tables 1-9、Algorithm 1 和公开 case 数据重绘。项目页与仓库于 2026-09-29 核查，仓库 revision 为 <code>6da2749578df2779b8a7e134ccb8d063d84693aa</code>。</p></div>

</div>

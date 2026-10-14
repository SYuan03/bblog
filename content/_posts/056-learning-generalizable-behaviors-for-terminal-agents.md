---
title: "[2026-08-23] Learning Generalizable Behaviors for Terminal Agents"
permalink: "/posts/论文解读/learning-generalizable-behaviors-for-terminal-agents.html"
date: "2026-09-29T16:24:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/generated-covers/056-learning-generalizable-behaviors-for-terminal-agents.webp"
description: "RIVER 先检查任务说明、容器和测试程序是否一致，再让强模型各试两次，从原训练集筛出约 3.5K 个环境。两条真实误判记录说明答案泄漏和脆弱测试怎样带偏训练，以及重复操作的扣分加在何处。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 20
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
  <div class="deck-head"><strong>20 页交互图解 · 动机、评分、真实案例、训练与证据边界</strong><a href="/lib/decks/river-terminal-agents-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/river-terminal-agents-visual-guide.html" title="Learning Generalizable Behaviors for Terminal Agents 论文图解，共 20 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">用强化学习训练会操作终端的模型，依赖环境告诉它任务做对了没有。RIVER 先检查这些分数是否可信：GPT-5.4 阅读 TMax-15K 的任务说明、容器配置和测试程序后，只把 35.8% 判为 CLEAN，即没有发现列出的环境缺陷。这不是人工确认的正确率。有的测试会奖励直接复制泄露答案，有的会因函数名不同而拒绝功能正确的实现。作者保留审查通过的环境，再让强模型各跑两次，删掉两次都未完成的题；训练时还对没有新信息的重复操作扣减更新信号。</p>

<aside class="part0">
<span class="kicker">阅读准备</span>

### 环境、被训练模型、筛选模型和测试程序

一个训练环境通常包含 `instruction.md`、Docker 镜像或 Dockerfile、任务文件，以及训练结束后运行的 verifier。Policy 是被训练的模型，harness 是它外面的提示构造与命令执行程序。它看到任务文字、自己执行过的命令和终端输出，也能读取容器权限允许的文件。Verifier 是任务结束后判 PASS／FAIL 的测试程序；rollout 是这次完整执行。如果参考答案被打包进可读容器，哪怕作者原意是隐藏，它事实上也已暴露给 Agent。

GPT-5.4 在这里有两种用途：先静态检查任务、Docker 和测试是否一致，再搭配 Terminus-2 执行每题两次作难度筛选（oracle pass@2）。这两个阶段不直接给被训练模型每一步打分。实际 RL 分数仍由原任务 verifier 给出，只有重复检测规则额外影响每轮训练优势。

GRPO 用同题多条执行记录计算 advantage（相对组平均的优劣），不额外训练预测未来分数的模型。本文在这个优势上加小惩罚；具体计算和上限见方法部分。

AUC-ROC 用于检查一组特征能否预测任务成功：随机取一条成功和一条失败记录，分类器把成功排在前面的概率就是 AUC；0.5 接近猜测，1 表示完全区分。本文的行为特征由规则从执行记录提取，不是模型能力的直接评分。RSA（Representational Similarity Analysis，表示相似性分析）则比较训练前后“哪些技能一起出现”和“哪些任务使用相似技能”的矩阵结构，不是测隐藏推理过程。
</aside>

<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>评分仅表示博客作者本人兴趣程度；评分可靠性与完整终端执行程序研究高度相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>14,399 → ≈3.5K</strong><span>TMax 环境经过两级过滤</span></div>
  <div class="metric"><strong>19.4 ±1.2</strong><span>River-8B 四项评测平均分</span></div>
  <div class="metric"><strong>0.64 → 0.74</strong><span>行为特征预测成功的 AUC</span></div>
  <div class="metric"><strong>32.3 → 49.2</strong><span>只用两个领域训练后的未见题总分</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li>相同约 3.5K 个环境下，筛选组平均分 <strong>19.4 ±1.2</strong>，随机组 17.7 ±0.7；但 Terminal-Bench-Pro 上随机组略高。环境质量的证据比“少用数据”更具体。</li>
    <li>14,399 个环境由 GPT-5.4 给八类判定；Claude Opus 4.8 只复判 120 个分层样本，<strong>并非人工逐条标注</strong>。</li>
    <li>最终训练得分仍来自原任务验收。静态检查和强模型 pass@2 只筛任务；重复检测额外扣减对应回复的训练优势。</li>
    <li>“+106% / +30%”比较的是训练前后增益的相对增幅，不是最终准确率提高 106 个百分点。</li>
  </ul>
</aside>


<h2 id="错误的测试信号为什么会强化错误行为？">1. Motivation：错误的测试信号为什么会强化错误行为？</h2>

**模型会学习如何通过测试程序，即使测试条件偏离任务要求。** 对数学题，错误答案通常只是一次负样本；对长程终端任务，一个检查不严的测试程序会让整条错误策略得到正向强化。Agent 如果发现复制 `/app/ground_truth.txt` 最容易拿到 1 分，RL 就会提高这种捷径的概率。

现有路线已经覆盖了更多技能和任务类型。Endless-Terminals 展示了大规模合成环境上的 RL，TMax 又扩展到 14,399 个跨领域任务。RIVER 检查这些环境的 reward integrity（验收分数是否可信）：任务说明的目标、Docker 实际提供的状态和测试检查的条件，是否指向同一件事。

论文用一个假设解释这种训练：预训练与监督微调主要提供写命令、调用编译器等基础技能；强化学习更可能改变跨多个步骤的行为，例如先检查环境、遇错后换方案、结束前验证，以及减少无效重复。作者把这些行为在未训练任务中的组合使用称为 Agentic Compositional Generalization。实验检查了这一解释，但没有证明全部提升都来自这些行为。

<figure class="figure">
  <a href="/lib/papers/river-terminal-agents/behavior.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/river-terminal-agents/behavior.svg" alt="RIVER 的 skill 与 behavior 分析" width="1400" height="760"></a>
  <figcaption>根据原论文 Figures 1、5 与 §5.1-5.2 重绘。行为特征预测成败的 AUC 从 SFT 的约 0.64 升到 RL 的 0.74；只检查基础技能是否出现的特征约 0.48-0.56。这个结果是相关性和结构变化证据，不能作为严格的因果分解。</figcaption>
</figure>

这套解释有两个可检验预测。第一，监督微调数据覆盖哪些技能应该影响较弱模型的起点。第二，训练环境的验收程序会决定哪些跨步骤行为被强化。RIVER 的方法和实验都围绕这两个预测展开。

<h2 id="与扩大环境、生成更强测试的路线相比">2. Related Work：与扩大环境、生成更强测试的路线相比</h2>

**Endless-Terminals 与 TMax 主要扩大训练覆盖，RIVER 研究验收分数是否可信，并尝试解释强化学习改变了执行记录中的哪些行为。** 它不是新的通用终端评测，也没有另造任务生成器。上游环境仍来自 TMax。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>主要扩展对象</th><th>怎样验收</th><th>与 RIVER 的边界</th></tr></thead>
  <tbody>
    <tr><td>Endless-Terminals</td><td>大规模可执行终端环境</td><td>每个环境的结果验收程序</td><td>表明合成环境训练能提升终端 Agent；RIVER 进一步检查评分是否对题。</td></tr>
    <tr><td>TMax</td><td>14,399 个任务的领域和技能覆盖</td><td>随任务发布的专用验收程序</td><td>RIVER 直接使用它作为初始任务集合，只留下约 3.5K 个任务。</td></tr>
    <tr><td>更强测试 / 自动生成验收</td><td>为代码任务生成更强单元测试</td><td>更准确判断输出是否正确</td><td>同时检查任务说明、环境与验收是否一致，以及评分如何影响多步行为。</td></tr>
    <tr><td>基础推理步骤的组合与泛化</td><td>单轮推理的基本步骤与组合</td><td>通常按最终答案给分</td><td>扩展到包含命令、反馈和错误恢复的多轮 Agent 执行。</td></tr>
  </tbody>
</table>
</div>

RIVER 把方法和机制解释绑在一起：如果强化学习主要塑造可复用行为，那么错误评分也可能影响多个领域；一个简单但可靠的重复检测规则，也可能在许多任务上同时生效。

<h2 id="环境筛选、两条误判记录与训练更新">3. Method：环境筛选、两条误判记录与训练更新</h2>

**作者先筛任务与测试，再训练模型；重复惩罚改的是每次生成的训练优势，不是最终测试分。**

<h3 id="3-1-数据来源、筛选与责任边界">3.1 数据来源、筛选与责任边界</h3>

RIVER 从 TMax 的 14,399 个训练环境开始。每个环境的核心是任务说明、Docker 和任务数据，以及专用验收程序。论文没有报告人工标注者逐条创建 CLEAN 标签，而是让 GPT-5.4 同时读取这三类材料，围绕“一个认真遵守说明的 Agent 能否理解任务并通过验收”给出一个主要判定。

八类判定是 CLEAN、VERIFIER-TOO-WEAK、INSTR-VERIFIER-MISMATCH、INSTR-ENV-MISMATCH、ANSWER-LEAK、INSTR-AMBIGUOUS、TASK-TRIVIAL 和 OTHER。一个任务可能同时有多个缺陷，但审计强制选择一个主类别。GPT-5.4 判 CLEAN 后，作者再用 **GPT-5.4 + Terminus-2** 对环境做 oracle `pass@2`，移除两次都失败的任务。后一步主要排除过难任务和训练设施不兼容，而不是再次判断验收是否正确。

<figure class="figure reading-diagram"><a href="/lib/papers/river-terminal-agents/reading-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/river-terminal-agents/reading-method.svg" alt="根据原论文 Figure 2、Algorithm 1、§3.2 与 Appendix A-C 重绘；正文纵向阅读图" width="600" height="1344"></a><figcaption>根据原论文 Figure 2、Algorithm 1、§3.2 与 Appendix A-C 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/river-terminal-agents/pipeline.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/river-terminal-agents/pipeline.svg" alt="RIVER 从 TMax 环境到 RL 训练集的完整流程" width="1400" height="760"></a>
  <figcaption>根据原论文 Figure 2、Algorithm 1、§3.2 与 Appendix A-C 重绘。GPT-5.4 静态审计、强模型试做 pass@2 和训练时任务验收是三个不同阶段，不能合并成一个“LLM judge”。</figcaption>
</figure>
</details>

<ol class="flow">
  <li><b>1 · 提供任务</b><span>TMax 作者提供任务说明、容器与验收程序。</span></li>
  <li><b>2 · 静态检查</b><span>GPT-5.4 读三类材料，给八类判定。</span></li>
  <li><b>3 · 试做筛选</b><span>GPT-5.4 + Terminus-2 各跑两次，去掉 pass@2=0。</span></li>
  <li><b>4 · 模型执行</b><span>训练模型在保留的容器中，通过原程序执行任务。</span></li>
  <li><b>5 · 任务验收</b><span>原任务验收全部通过，最终分才为 1。</span></li>
  <li><b>6 · 调整优势</b><span>重复步骤的回复 token 额外扣减训练优势。</span></li>
</ol>

<h3 id="3-2-Agent-能看见什么，什么应当隐藏？">3.2 Agent 能看见什么，什么应当隐藏？</h3>

训练模型能看见任务说明、命令历史和终端输出，以及容器权限允许读取的文件。静态审计标签、强模型两次试做和其他训练样本不进入它的提示。任务验收在执行后运行，给出最终分数。

理想情况下，参考答案、参考实现和隐藏测试应当只对验收程序可见。TMax 的部分任务把它们直接放进 `/app`，于是“应当隐藏”与“实际隐藏”发生分离。RIVER 的 ANSWER-LEAK 标签就是为这种问题准备的。论文没有给出统一的隔离环境访问权限规范，也没有发布 3.5K 过滤结果供本文逐条核查；这里能确认的是论文和项目页公开的审计结果与案例文件。

<h3 id="3-3-两条真实误判：答案泄露与实现方式绑定">3.3 两条真实误判：答案泄露与实现方式绑定</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/river-terminal-agents/reading-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/river-terminal-agents/reading-case.svg" alt="根据原论文 Appendix C.4 的真实 rollout 重绘；正文纵向阅读图" width="600" height="1329"></a><figcaption>根据原论文 Appendix C.4 的真实 rollout 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>完整案例重绘图（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/river-terminal-agents/judge-cases.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/river-terminal-agents/judge-cases.svg" alt="TMax 中一条 false-positive reward 与一条 false-negative reward" width="1400" height="850"></a>
  <figcaption>根据原论文 Appendix C.4 的真实 rollout 重绘。左侧 <code>task_003722</code> 因参考答案文件可读而奖励抄答案的捷径；右侧 <code>task_006064</code> 因源码字符串检查而拒绝功能正确的 Rust 实现。</figcaption>
</figure>
</details>

`task_003722` 要从 `archive_broadcast.mp4` 中用 OCR（图像文字识别）提取新闻滚动字幕，按时间顺序写到 `reconstructed_ticker.txt`。Agent 先发现并读取 `/app/ground_truth.txt`，随后还是尝试了正常抽帧与 OCR，但自己的结果与参考文字相似度只有 0.368，低于 0.85 门槛。第 7 步用泄露的参考答案覆盖输出，第 8 步相似度达到 1.0，于是最终得分为 1。参考答案放在 Agent 可读区域，使得验收接受了直接复制的结果。

`task_006064` 要求 Rust 程序保留 `a-z` 与空格。Agent 使用 `is_ascii_alphabetic()`，生成的高频词和协方差矩阵都通过功能测试。第三个测试却在源码里搜索 `is_alphabetic` 字面量。合法 API 名不含这段连续字符串，整题因此得 0。这个失败判定拒绝了不同写法，测到的不是任务要求的实际行为。

这两条是作者在 Appendix C.4 整理的真实执行案例。项目仓库的 `build_inputs/cases.json` 复述了步骤与判定，没有提供完整原始命令日志、任务文件和可运行验收器；本文没有独立重放这两题，也无法核验相似度计算的全部细节。

<h3 id="3-4-重复操作怎样影响这一轮的训练优势？">3.4 重复操作怎样影响这一轮的训练优势？</h3>

<div class="formula">A<sub>i,t</sub> = (r<sub>i</sub> − mean(r)) / (std(r) + ε) &nbsp;&nbsp;·&nbsp;&nbsp; Ã<sub>i,t</sub> = A<sub>i,t</sub> + s<sub>i,t</sub></div>

GRPO 先给整条执行记录一个组内标准化优势，再在重复 turn（一次模型回复与对应环境观察）上加 <code>s_(i,t)</code>。命令和观察都与早前某轮的 Jaccard 相似度大于 0.8 时，该轮**全部回复 token 的优势各扣 0.05**。Jaccard 是两个集合交集大小除以并集大小；论文没有充分交代文本怎样切成集合。

例如成功记录原训练优势为 +1，某一轮重复，则该轮变为 +0.95；失败记录原为 −1，重复轮变为 −1.05。扣的是训练优势，不是把成功任务最终分数从 1 改成 0.95。这是公式说明例，不是模型日志。

下面是 Python 3 的公式说明代码，由本文编写，**不是官方训练代码**。它只表达 Eq. (1) 的逐回复扣减。Table 4 另列了每条执行记录 0.15 的惩罚上限，却没有说明怎样在回复和 token 间分配；因此不能据此补出“只罚前三个重复步骤”的实现。

<div class="code-scroll"><pre><code># Article reconstruction from Eq. (1), not official code.
def repeat_shaping(turns, delta=0.05):
    """Eq. (1) only; each value applies to all response tokens of a turn."""
    penalties = [0.0] * len(turns)
    for i, current in enumerate(turns):
        repeated = any(
            jaccard(current.command, old.command) &gt; 0.8
            and jaccard(current.observation, old.observation) &gt; 0.8
            for old in turns[:i]
        )
        if repeated:
            penalties[i] = -delta
    return penalties</code></pre></div>

规则要求命令和观察结果同时相似，避免把“同一命令得到新信息”也罚掉。它只降低对应回复 token 的训练优势，不改最终 PASS／FAIL。论文还试过奖励结束前验证（verify-before-done），虽然增加了这种行为，却没进一步提高评测分数；最终方法只保留重复惩罚。

Appendix D 用来分析行为的“重复率”只检查命令 token 的 Jaccard ≥0.8。它是更宽的统计指标，不能当成训练时要求命令、观察都 >0.8 的同一个检测器。

<h3 id="3-5-一轮训练实际用了多少交互？">3.5 一轮训练实际用了多少交互？</h3>

Qwen3-8B 先在 78K 条执行记录上做一轮全参数 SFT，只对 assistant token 计算损失，学习率为 `1e-5`，最长序列 16,384 tokens。随后每个 RL 批次取 32 道题，每题采样 8 条执行记录；训练最多 16 轮交互，每轮最多生成 2,048 tokens，输入上限 16,384，temperature 为 0.6。作者用 8 张 H200 跑约 60 小时，完成 400 个 RL step。

最终评测的预算另算：最多 64 次动作、600 秒，提供模型完整的 40,960-token 输入窗口。**训练的 16 轮与评测的 64 次动作不能混写成同一个预算。** 这些都是上限，不是每题实际平均调用数。

<h3 id="3-6-静态审计本身可靠吗？">3.6 静态审计本身可靠吗？</h3>

<figure class="figure">
  <a href="/lib/papers/river-terminal-agents/audit.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/river-terminal-agents/audit.svg" alt="三个 terminal environment 集合的 clean rate 与双模型复判结果" width="1400" height="760"></a>
  <figcaption>根据原论文 Figure 11、Table 7 与 Appendix C 重绘。120 个样本按 GPT-5.4 的八类判定分层抽取，因此 83.3% 只能描述这种分层抽样下的“无缺陷 / 有缺陷”一致率。</figcaption>
</figure>

作者让 Claude Opus 4.8 在看不到 GPT 标签的情况下复判 120 个环境，每个 GPT 判定类别抽 15 个。八分类完全一致只有 22.5%，因为同一坏环境常有多个缺陷；合并成 CLEAN（无缺陷）/ defective（有缺陷） 后，一致 100/120，即 83.3%。更有用的是条件结果：GPT 判 defective 的 105 个中，Claude 也判 defective 的有 94 个，89.5%；GPT 判 CLEAN 的 15 个中，Claude 仍判 CLEAN 的只有 6 个，40%。所以这套审计更适合保守排除明显坏环境，不适合把 CLEAN 当成经过充分人工认证。

<h2 id="主结果、环境过滤消融与跨领域测试">4. Experiments：主结果、环境过滤消融与跨领域测试</h2>

**筛掉有问题的环境后，终端任务成功率提高；其他领域的保持能力还依赖广任务 SFT。**

<h3 id="4-1-River-8B-的主结果">4.1 River-8B 的主结果</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/river-terminal-agents/reading-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/river-terminal-agents/reading-results.svg" alt="根据原论文 Table 1 重绘；正文纵向阅读图" width="600" height="1138"></a><figcaption>根据原论文 Table 1 重绘。</figcaption></figure>

<details class="reading-evidence"><summary>横向总览（可打开原尺寸）</summary>
<figure class="figure">
  <a href="/lib/papers/river-terminal-agents/results.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/river-terminal-agents/results.svg" alt="River-8B 与 OpenThinker-8B-RL 在四个 terminal benchmark 上的结果" width="1400" height="760"></a>
  <figcaption>根据原论文 Table 1 重绘。River-8B 在 OpenThoughts-TBLite、Terminal-Bench-v2.1、Terminal-Bench-Pro 和 TerminalWorld-Verified 上的平均分为 19.4±1.2，最强 baseline OpenThinker-8B-RL 为 17.8±0.7。</figcaption>
</figure>
</details>

River-8B 从 Qwen3-8B 出发，先用约 78K OpenThoughts 执行记录做监督微调，再用 RIVER-TMax-3.5K、EndlessAgent harness 和 GRPO 做 RL。四项评测共 589 道题；每个模型版本用 3 个随机种子评测，单题最多 64 次动作或 600 秒。OpenThoughts-TBLite 给连续分数，其余三项只有全部验收通过才记 1。主表 Average 是四项等权算术平均：`(21.8 + 9.7 + 23.0 + 23.0) / 4 = 19.375`，显示为 19.4。`±` 是三个种子成绩的标准差，不是标准误。

**最精确的主结论是：River-8B 在论文重测的开源、经强化学习训练的 8B Agent 中，四项与平均分均最高。** 不能把它直接扩成“所有终端 Agent 中的最优模型”，因为闭源 Claude / Codex 不在这张表里，而且对照模型使用各自原部署程序。作者尽量统一模型服务与预算，但模型、SFT 数据、RL 环境和 harness 仍有多处同时变化。

更直接检验过滤效果的是 Appendix Table 8：训练都用约 3.5K 个环境，一组经过 RIVER 筛选，另一组从完整 TMax 随机抽取。这样至少控制了环境数量。

<div class="table-scroll"><table><thead><tr><th>约 3.5K 环境的训练组</th><th>OT-TBLite</th><th>TB-v2.1</th><th>TB-Pro</th><th>TW-Verified</th><th>四项平均</th></tr></thead><tbody><tr><td>RIVER 筛选组</td><td>21.8 ±2.9</td><td>9.7 ±0.6</td><td>23.0 ±3.1</td><td>23.0 ±2.5</td><td>19.4 ±1.2</td></tr><tr><td>TMax 随机组</td><td>18.6 ±1.9</td><td>8.2 ±1.3</td><td>23.7 ±1.5</td><td>20.3 ±0.6</td><td>17.7 ±0.7</td></tr></tbody></table></div>

过滤组平均高 1.7 个百分点，但 **TB-Pro 上随机组 23.7 高于过滤组 23.0**。结果支持这套筛选在四项合计上更有效，不支持每个评测都提升，也没有隔离出八类缺陷中的哪一类贡献最多。训练代码未公开，所有细微设置是否相同仍无法逐项核验。

<h3 id="4-2-为什么还要先用覆盖多种技能的数据微调？">4.2 为什么还要先用覆盖多种技能的数据微调？</h3>

作者为 Qwen3-8B 构造了三个 SFT 起点：以 `nl2bash` 和 `InferredBugs` 为主的 Narrow-SFT，约 13.6K 执行记录；从更广来源组成的 Diverse-SFT，约 78K；以及从 Diverse-SFT 随机抽到同样 13.6K 的 Diverse-DS-SFT。Narrow-SFT 与 Diverse-DS-SFT 在 SFT 后的平均分接近，继续做同一套 RL 后却拉开明显差距。这个相同数据量的对照部分排除了数据量的影响，剩下的差别主要来自基础技能覆盖。

论文还报告了一次失败的早期实验。作者在未经过 RIVER 过滤的 TermiGen 环境上使用部分完成度奖励，训练分和同来源测试分都上升，外部四项平均分反而下降，同时执行越来越早结束。换成 Diverse-SFT 起点后，同一设置下利用评分漏洞的行为有所减少。作者因此把覆盖多种技能的监督微调放在较弱模型的强化学习之前；它不是 RIVER 的环境过滤核心，但会影响模型有没有能力通过正常路径完成训练任务。

<h3 id="4-3-少于-30-的环境，为什么会出现-106-？">4.3 少于 30% 的环境，为什么会出现 +106%？</h3>

作者进一步沿用 TMax 的 Qwen3.5-2B/4B/9B、Qwen3.6-27B、Vanillux2 harness 与 DPPO 设置，只把完整 TMax 训练集换成 RIVER 过滤后的约 3.5K 环境。论文按每个模型的 `RL score − base score` 先算训练增益，再比较两套数据的增益。

结果是 Terminal-Bench-Lite 上的平均训练增益相对 TMax **增大 106%**，Terminal-Bench-v2.1 上增大 30%。这说明过滤后的验收分数在这些配置里更有效率。它不表示模型得分增加 106 个百分点，也不表示每种模型规模都提高相同比例。

<h3 id="4-4-学到的行为是否真的跨领域迁移？">4.4 学到的行为是否真的跨领域迁移？</h3>

<figure class="figure">
  <a href="/lib/papers/river-terminal-agents/transfer.svg" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/river-terminal-agents/transfer.svg" alt="使用二到八个 domain 做 RL 后的 held-out 任务表现" width="1400" height="720"></a>
  <figcaption>根据原论文 Table 2 与 Figure 8 重绘。只在 Debug + Systems 的约 800 个环境上做 RL，未训练题总分仍从 SFT 的 32.3 升到 49.2；四域与八域分别是 53.6 与 53.9。</figcaption>
</figure>

作者从 RIVER-TMax-3.5K 中另留约 300 个任务做受控评测，再只用 2、4、6 或 8 个领域训练。两域训练只包含 Debug 和 Systems，其他六域仍然出现提升。轨迹里的检查环境、错误恢复与重复操作等行为变化也同时出现在未训练域。

这组结果支持“跨领域的行为迁移”。但领域来自作者对 TMax 任务技能的分类，未训练题仍属同一个合成环境来源；它不是独立收集的真实用户分布。

<h2 id="对完整-coding-harness-训练的启发">5. Discussion：对完整 coding harness 训练的启发</h2>

**评分程序本身就是训练系统的一部分。** 任务要求、容器、可读文件、隐藏答案、测试步骤与分数聚合应一起审计，而不只是数任务数量和类别。

答案泄露会让错误捷径得分，源码字符串检查会让正确实现受罚。仅按强模型能否通过来筛难度，不能替代对这两类错误的检查。

分析行为也需要区分标注方法。§5.1 由 GPT-5.4 标出 60 种技能在 589 题执行记录中是否出现；§5.2 的 Model-S 还包含任务类别，Model-B 则用规则提取 12 种跨步骤行为，再比较它们预测成功的能力。标出某种技能“出现过”不等于它被正确使用。

这些特征适合先用于诊断。奖励某个行为是否有帮助，还要单独干预测试；本文的 verify-before-done 方案让验证行为更多，却没有提高成绩，已经给出一个反例。

后续应在 Claude Code、Codex CLI 和开源执行器上使用同一批隐藏任务；让人工和多个模型复核测试分歧；按任务家族、容器来源和测试作者划分未见集合。这样才能区分跨任务行为与某个数据生成器的惯例。

<h2 id="有说服力的证据与尚未公开的部分">6. Conclusion：有说服力的证据与尚未公开的部分</h2>

**这篇论文最强的部分，是用真实误放行与误拒绝记录说明，错误评分会怎样影响 Agent 行为，再换模型、规模、执行程序与领域检查同一训练方案。** 它还认真报告了一个负结果：verify-before-done 与成功相关，但直接奖励它没有继续提高性能。

需要保留的限制也很具体：

<div class="limit-grid">
  <div><b>Audit 不是逐条人工确认的标准</b><span>14,399 个环境由 GPT-5.4 判主类别；Claude 只复判 120 个分层样本，CLEAN 条件一致率为 40%。</span></div>
  <div><b>官方训练材料未公开</b><span>2026-10-14 重查项目网页仓库 revision <code>6da2749</code>，仍没有训练代码、3.5K 清单、模型权重或完整逐任务日志。上游 TMax 数据公开，但不等于 RIVER 筛选集。</span></div>
  <div><b>主表同时更换模型与执行程序</b><span>River、OpenThinker 与 TMax 使用不同原生 harness。2B-27B 的 TMax 对照更干净，但作者也因资源限制改成本地 Docker。</span></div>
  <div><b>机制证据主要是相关性</b><span>行为 AUC、RSA 表示结构分析与跨领域迁移符合作者假设，但未证明全部增益都来自这 12 种行为。</span></div>
  <div><b>外部评测的隐藏文件范围未逐项披露</b><span>论文采用四个 benchmark 的默认评测程序，没有逐个公开验收可见范围与数据重叠检查。</span></div>
  <div><b>环境家族仍然集中</b><span>训练题与受控未见题都来自 TMax 系列。跨真实组织、私有代码仓库和长期任务的转移还未验证。</span></div>
</div>

我的最终判断是：**RIVER 要求先审计验收分数，再决定是否扩大训练环境。** 它的 3.5K 环境未公开，限制了完全复核；但两类真实验收错误、明确区分的筛选阶段，以及行为奖励的正负消融，已经给终端 Agent 强化学习提供了一套很实用的实验框架。

<div class="note"><p>论文为 arXiv non-exclusive distribution license，项目仓库未声明 license。本文没有复用原图像素，图表根据 arXiv:2608.22631v3 与作者整理的案例重绘，具体 Figure、Table 和 Algorithm 编号见图注。项目页与仓库于 2026-10-14 重查，固定 revision 为 <code>6da2749578df2779b8a7e134ccb8d063d84693aa</code>；公开案例摘要不等于完整可重放的轨迹和验收代码。</p></div>

</div>

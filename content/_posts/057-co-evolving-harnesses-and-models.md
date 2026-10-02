---
title: "[2026-09-08] Co-Evolving Harnesses and Models: On-Policy Correction Helps Weaker Models Catch Up Where Imitation Fails"
permalink: "/posts/论文解读/co-evolving-harnesses-and-models.html"
date: "2026-09-29T17:02:00+08:00"
updated: "2026-09-29T17:02:00+08:00"
cover: "/generated-covers/057-co-evolving-harnesses-and-models.webp"
description: "Harness 为弱模型量身演化后，直接模仿强模型的完整轨迹会破坏二者的配合。本文沿着两条真实失败轨迹，拆解 on-policy correction 为什么只改学生自己的第一个错误 turn。"
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
  - "Coding Agent"
  - "Imitation Learning"
  - "On-Policy Learning"
  - "LoRA"
  - "Claude Code"
  - "Codex"
---

<style>
html:not([data-theme="dark"]) body:has(.opc-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:42ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.1}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.opc-reading{--column:780px;--blue:#2d669f;--orange:#b75b35;--green:#2b7863;--red:#a3443d;--violet:#6e5aa8;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.opc-reading>*{max-width:100%}.opc-reading p,.opc-reading li{text-wrap:pretty}.opc-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.opc-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.opc-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.opc-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.opc-reading .deck-head strong{font-size:.92rem}.opc-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.opc-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.opc-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.opc-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.opc-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.opc-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line-local));background:color-mix(in srgb,var(--violet) 5%,#fff)}.opc-reading .interest b{color:var(--violet);font:750 1.2rem/1 var(--mono)}.opc-reading .interest span{color:var(--soft);font-size:.84rem}
.opc-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.opc-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.opc-reading .metric:last-child{border-right:0}.opc-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.opc-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.opc-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.opc-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.opc-reading .keypoints ul{margin:0;padding-left:1.2rem}.opc-reading .keypoints li{margin:.42rem 0}.opc-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--violet);background:var(--surface)}.opc-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.opc-reading .kicker{display:block;margin-bottom:6px;color:var(--violet);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.opc-reading h2{margin-top:3.55rem}.opc-reading h3{margin-top:2.1rem}.opc-reading h4{margin-top:1.7rem}.opc-reading strong{font-weight:750}.opc-reading .table-scroll,.opc-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.opc-reading .table-scroll table{display:table;width:100%;min-width:720px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.opc-reading th,.opc-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.opc-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.opc-reading td:first-child{font-weight:650}.opc-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.opc-reading code{font-size:.92em}
.opc-reading .figure{width:100%;margin:27px 0}.opc-reading .figure img{display:block;width:auto;max-width:100%;max-height:780px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.opc-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.opc-reading .roles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.opc-reading .role{padding:16px;background:#fff}.opc-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.opc-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}
.opc-reading .process{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.opc-reading .process li{min-height:140px;padding:12px;background:var(--surface)}.opc-reading .process b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.opc-reading .process span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}.opc-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.opc-reading .case h4{margin:0 0 8px;font-size:1.12rem}.opc-reading .case ol{padding-left:1.2rem}.opc-reading .case li{margin:.58rem 0}.opc-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.opc-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.opc-reading .verdict strong{display:block;margin-bottom:4px}.opc-reading .verdict .pass strong{color:var(--green)}.opc-reading .verdict .fail strong{color:var(--red)}
.opc-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.opc-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.opc-reading .note p{margin:.34em 0}.opc-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.opc-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.opc-reading .limit-grid>div{padding:17px;background:#fff}.opc-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.opc-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.9rem,8.4vw,2.38rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.opc-reading,.opc-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.opc-reading .source-links a{overflow-wrap:anywhere}.opc-reading .deck-wrap{max-width:100%;overflow:hidden}.opc-reading .metrics{grid-template-columns:1fr 1fr}.opc-reading .metric:nth-child(2){border-right:0}.opc-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.opc-reading .process{grid-template-columns:1fr 1fr}.opc-reading .roles{grid-template-columns:1fr}.opc-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.opc-reading .process,.opc-reading .verdict,.opc-reading .limit-grid{grid-template-columns:1fr}.opc-reading .part0,.opc-reading .case{padding:17px 15px}.opc-reading .deck-head,.opc-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="opc-reading">

<p class="paper-meta">Zhou Yu, Bin Bi, Shiva Kumar Pentyala, Shubham Mehrotra, Sougata Chaudhuri, Shilpa Bhagavath, Zeyuan Chen, Ran Xu, Phil Mui, James Zhu, Sitaram Asur · arXiv:2609.09134v1 · 2026-09-08</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.09134">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.09134">论文 PDF</a>
  <a href="https://arxiv.org/abs/2607.08938">上游任务与 harness evolution 论文</a>
</div>

<section class="deck-wrap" aria-label="On-Policy Correction 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · model-harness fit、两条真实 case、数据构造与实验边界</strong><a href="/lib/decks/on-policy-correction-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/on-policy-correction-visual-guide.html" title="Co-Evolving Harnesses and Models 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">这篇论文抓住了一个很容易被忽略的顺序问题：团队先围绕弱模型演化出一套好用的 harness，再用强模型的成功轨迹微调弱模型，结果可能更差。Qwen3-Coder 在 evolved harness 下原本达到 78.0%，完整模仿 Gemini 后降到 63.1%。作者改为保留 Qwen 自己的 rollout，只让 expert 重写其中第一个错误 turn，最终得到 79.7%。</p>

<div class="interest"><b>博客作者兴趣度 9.7 / 10</b><span>评分仅表示博客作者本人兴趣程度；它直接研究完整 harness 与模型权重更新之间的兼容性</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>29.2 → 78.0</strong><span>Qwen：base harness → evolved harness</span></div>
  <div class="metric"><strong>78.0 → 63.1</strong><span>完整 expert trajectory imitation</span></div>
  <div class="metric"><strong>78.0 → 79.7</strong><span>On-policy single-turn correction</span></div>
  <div class="metric"><strong>1.1% → 14.6%</strong><span>Imitation 后 planning failures 占比</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>Harness evolution 和 model SFT 不能视为互不影响的两个旋钮。</strong>Harness 是围绕弱模型原有的 planning cadence 演化出来的，权重更新会改变这套配合。</li>
    <li><strong>完整模仿的失败不是因为模型没学到 expert knowledge。</strong>Domain-computation recipe 的使用率从 30.8% 升到 76.1%，但 planning failures 从 1.1% 升到 14.6%。</li>
    <li><strong>On-policy correction 只改学生自己访问到的错误状态。</strong>约 500 条训练数据中，约 400 条来自单 turn expert correction，另混入约 50 条学生自己的成功 rollout。</li>
    <li><strong>79.7% 只是比 78.0% 高 1.7 个百分点。</strong>方法的价值主要是避免 14.9 点回退，并没有追平同一 harness 下 Gemini 的 93.6%。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先分清 `h0`、`h*`、student rollout 和 expert rollout

论文把初始 harness 记为 `h0`。作者让 Qwen3-Coder-30B-A3B 在七类 enterprise tasks 上运行，再由 Gemini-3.1-Pro-Preview 充当 meta-agent，根据失败轨迹修改 system prompt、tools、hooks 和 context management。每个任务最后选出的版本是 `h*`。这套 `h*` 包含针对 Qwen 原有行为调过的 prompt、tool 和执行规则，远不止一段提示词。

<div class="roles">
  <div class="role"><b>WEAKER MODEL / STUDENT</b><span>Qwen3-Coder-30B-A3B，主实验里既负责生成 harness-evolution rollout，也是后续 LoRA-SFT 的对象。</span></div>
  <div class="role"><b>STRONGER EXPERT</b><span>Gemini-3.1-Pro-Preview。它提出 harness edit，也生成 imitation trajectory 或单 turn correction。</span></div>
  <div class="role"><b>EVOLVED HARNESS h*</b><span>主要改 system prompt，也可增删 tool 与 hook；用 validation score 选出。</span></div>
  <div class="role"><b>TASK VERIFIER</b><span>给每条 rollout 二元 task success。论文没有公开本工作的 task files、checker code 或逐条 correction 数据。</span></div>
</div>

Full-trajectory imitation 使用 expert 自己访问到的 states 和整条 planning path。On-policy correction 从 student 的失败 rollout 开始，因此训练样本仍围绕 student 真正会遇到的 states，只把定位出的一个错误 response 换成 expert response。
</aside>

## Q1. 为什么强模型的成功轨迹会把弱模型教坏？

**因为 evolved harness 已经适配了弱模型原有的 planning cadence，而完整 imitation 同时改了知识和规划风格。** 强模型能在更少的中间检查下直接执行，也更早提交答案。弱模型会模仿这种 terse（少解释、少检查）、answer-early（更早提交答案）的轨迹，但未必同时获得支撑这套节奏的执行能力。

这和普通 SFT 的直觉正面冲突。Gemini 在 Qwen 的 `h*` 下能达到 93.6%，显著高于 Qwen 的 78.0%，看起来是一位合适的 teacher。但 `h*` 的 prompt、tool、hook 与执行顺序，是根据 Qwen 的失败记录逐步改出来的。完整 imitation 改变了 Qwen 的 planning distribution，也就是它通常会访问哪些 states、何时检查、何时提交。结果是脚手架还在，模型的动作节奏却变了。

<figure class="figure">
  <img src="/lib/papers/on-policy-correction/figure-1-coevolution.png" alt="论文 Figure 1：harness-model co-evolution 与两种模型更新路径">
  <figcaption>原论文 Figure 1，依据 arXiv 页面标明的 CC0 1.0 授权直接引用。红色路径用完整 expert rollout 更新 student，绿色路径在 student 自己的失败状态上只修一个 turn。</figcaption>
</figure>

论文用一个必要的 control 支持这个解释：同样的 expert-imitation recipe 放回未演化的 `h0` 后，Qwen 从 29.2% 升到 35.5%。Expert trajectory 在普通 harness 下有正收益；它与已经适配 Qwen 的 `h*` 组合时，才出现明显退化。

## Q2. 它和联合优化、Harness-Zero、普通 on-policy imitation 有什么区别？

**这篇论文研究的是“先演化 harness、再更新模型”时，模型与 harness 能否继续配合。** 它不移除 evolved harness，也不证明 correction 能跨到另一个 action space。部署产物仍是 corrected Qwen 加上原来的 `h*`。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>训练时改变什么</th><th>部署时保留什么</th><th>与本文的边界</th></tr></thead>
  <tbody>
    <tr><td>Meta-Harness / Better Harnesses</td><td>搜索 prompt、tool、hook 与 control flow</td><td>固定模型 + evolved harness</td><td>提供上游 harness evolution；不更新模型权重。</td></tr>
    <tr><td>Co-Harness / WHALE / HarnessForge</td><td>交替或联合优化 harness 与 weights</td><td>最终 model-harness pair</td><td>证明两者可协同；本文专门隔离 full imitation 引起的负迁移。</td></tr>
    <tr><td>普通 on-policy expert correction</td><td>在 student 访问到的 state 上请 teacher 接管或续写</td><td>模型 + 固定 interface</td><td>本文把同一思想放进 model-specific evolved harness，目标是保住 pair fit。</td></tr>
    <tr><td>Harness-Zero</td><td>把 source-harness 行为转成 target-harness 有效动作后训练模型</td><td>模型 + 更小的 target harness</td><td>Harness-Zero 要移除 specialized source harness；本文始终保留 `h*`。</td></tr>
    <tr><td>Grow the Harness</td><td>把重复控制写进可执行代码</td><td>固定模型 + specialist harness</td><td>与本文部署立场接近，但它主要优化可复用代码，不做 model correction。</td></tr>
  </tbody>
</table>
</div>

论文给出的关键反例是：**teacher 更强、trajectory 全部成功、格式已经转换正确，student 仍然可能因为 planning shift 而退化。** 这比笼统地说“on-policy 比 off-policy 好”更有信息量。

## Q3. Harness 怎样演化，correction 数据又是怎样造出来的？

### 3.1 七类任务和 harness evolution

作者沿用 Yang et al. (2026) 的七类 enterprise tasks：payroll attendance audit、budget approval、stock alert、IoT anomaly detection、Playwright browser automation、website management 和 code refactoring。论文称这些任务有客观 verifier，但没有在本文重新列出每个 split 的任务数、逐任务 checker 或原始 task package。

作者对上游环境做了两处修改：在涉及 MCP tool 的任务中，Agent 必须通过工具访问数据，不能直接修改 task database；tool-call errors 也会交给 harness optimizer。论文因此提醒，本文绝对分数不能直接与 Yang et al. 的原结果比较。

每个任务单独演化 harness，过程如下：

<ol class="process">
  <li><b>1 · ROLLOUT</b><span>Qwen 在当前 harness 下执行 task minibatch。</span></li>
  <li><b>2 · FEEDBACK</b><span>Verifier verdict、trace 与 tool errors 交给 optimizer。</span></li>
  <li><b>3 · EDIT</b><span>Gemini meta-agent 修改 prompt，也可增删 tool 或 hook。</span></li>
  <li><b>4 · VALIDATE</b><span>只有 minibatch performance 提升的 edit 才进入 Pareto pool。</span></li>
  <li><b>5 · SELECT</b><span>三 seed、每 task $20、单 rollout 600 秒；按 validation score 选 `h*`，同分取较早 iteration。</span></li>
</ol>

Training 和 validation split 用于 harness 与 model optimization，test split 保持 held out。主表报告 test success 的三次运行均值与 SEM。

### 3.2 Full imitation 数据怎样构造？

作者先收集 Gemini 在 `h*` 下 reward=1.0 的完整成功轨迹，再加入 Qwen 自己的成功轨迹，转换成 Qwen 的 chat/tool-call 格式后做 LoRA-SFT。主实验对三次独立 LoRA seed（0、101、202）取平均。

训练配置是 rank 16 或 64 取较好结果、2 epochs、learning rate `1e-4`、bf16、effective batch size 8。默认 sequence length 为 49,152 tokens；当超过 5% 训练样本被截断时，作者再训练一个 98,304-token 版本。Adapter 合并为约 57 到 61 GB 的 dense checkpoint，在两张 H200 上推理；论文称一次训练少于一小时。

### 3.3 On-policy correction 数据怎样构造？

作者改从 Qwen 在 `h*` 下的失败 rollout 出发。自动化的 failure localization 先找到第一个错误 turn；Gemini 看到 task instruction、截至该 turn 的 trajectory 和失败 checkpoint，然后只输出“一句修正策略 + 修正后的 tool call”。每个 turn 采样 `N=3` 个候选，再由另一个 quality judge 留下一个。

<div class="code-scroll"><pre><code># Article reconstruction from Appendix B, not official code.
def make_training_example(student_rollout, failed_checkpoint):
    turn = failure_localizer.first_wrong_turn(
        rollout=student_rollout,
        checkpoint=failed_checkpoint,
    )
    candidates = [
        expert.rewrite_only_this_turn(
            task=student_rollout.task,
            prefix=student_rollout.before(turn),
            failed_checkpoint=failed_checkpoint,
        )
        for _ in range(3)
    ]
    correction = quality_judge.select_best(candidates)
    return student_rollout.replace(turn, correction)
</code></pre></div>

最终训练集约 500 rows：约 400 条 single-turn correction，加上约 50 条 Qwen 自己的 passing rollout；后者优先挑能力边界附近的样本，也就是同一任务有时成功、有时失败的 capability-boundary examples。论文没有解释这些约数之间剩余的差额，也没有公开 localizer prompt、quality judge 身份、筛选 rubric 或 corrected trajectory 的重新执行率。

### 3.4 两条 case 具体发生了什么？

<figure class="figure">
  <img src="/lib/papers/on-policy-correction/cases.svg" alt="Payroll audit 与 WebArena 的两条 planning failure">
  <figcaption>根据原论文 Appendix D 重绘。两条 case 都说明 student 获得了部分 domain knowledge，但完整 imitation 改变了它与 harness 配合的执行节奏。</figcaption>
</figure>

<div class="case">
<h4>Case 1：Payroll audit，算对了却没提交</h4>
<ol>
  <li>上游 task 要求完成 payroll aggregation。`h*` 明确写出 employee-level aggregation、department mean-of-means、ceiling-then-multiply payroll 和 rounding。</li>
  <li>原始 Qwen 按“compute → verify once → finish”执行，同一 example 的三条 rollout 都在 14 到 20 steps 内得到 1.0。</li>
  <li>SFT-imitation 后的 Qwen 仍写出了正确 department aggregates，说明 domain recipe 已学会。</li>
  <li>它随后把一次 verify 变成循环：同一 view 发出 29 次、prompt 约重读 20 次，78 steps 内始终没有调用 finish，因此 task verifier 给 0。</li>
</ol>
</div>

<div class="case">
<h4>Case 2：WebArena，351 不是 346</h4>
<ol>
  <li>问题询问 Magento Admin 中 Approved reviews 的总数，ground truth 是 346。</li>
  <li>`h*` 给出明确过程：找到 status column，筛选 Approved，读取 filtered total，再通过 structured finish 返回。</li>
  <li>原始 Gemma 会执行 filter-then-count，并返回 346。</li>
  <li>SFT-imitation 后的 Gemma 进入 review grid 后直接读取未筛选的 “351 records found”，跳过筛选并提前提交 351。</li>
</ol>
</div>

这两条是作者挑选的解释性 rollout，不是随机 error sample。论文没有公开原始日志和 checker code，本文只能核对 Appendix D 的叙述，不能独立重放。

## Q4. 实验结果到底证明了什么？

### 4.1 主结果：harness 很强，完整 imitation 七项全退

<figure class="figure">
  <img src="/lib/papers/on-policy-correction/results.svg" alt="Qwen 与 Gemini 在不同 harness 和训练条件下的平均成功率">
  <figcaption>根据原论文 Table 1 重绘。Avg 是七项 task success 的算术平均；每个 cell 是三次运行的 mean ± SEM。</figcaption>
</figure>

Qwen 从 `h0` 的 29.2±0.61 升到 `h*` 的 78.0±0.97，说明 harness evolution 是主要增益来源。Gemini 也能使用这套为 Qwen 演化的 harness，从 84.4±0.85 升到 93.6±0.46，证明 `h*` 不只是 Qwen 能触发的一组脆弱提示。

问题出现在权重更新。Qwen 在 `h*` 下做 full imitation 后降到 63.1±0.81，七项任务全部下降，范围是 −4.2 到 −29.9 个百分点。On-policy correction 则达到 79.7±0.67：五项上升，Attendance 与 Budget 分别 −0.4、−0.6，作者将其视为接近饱和条件下的噪声范围。

<figure class="figure">
  <img src="/lib/papers/on-policy-correction/task-deltas.svg" alt="完整模仿与 on-policy correction 在七项任务上的变化">
  <figcaption>根据原论文 Table 1 重绘。图中是相对同一 Qwen + `h*` baseline 的百分点变化；论文没有给出逐任务显著性检验。</figcaption>
</figure>

### 4.2 机制证据：knowledge 上升，planning fit 下降

<figure class="figure">
  <img src="/lib/papers/on-policy-correction/failure-analysis.svg" alt="完整模仿和局部修正的 planning 与 knowledge failure 占比">
<figcaption>根据原论文 Table 3 重绘。LLM-as-judge classifier 把 hard-failure rollouts，也就是得分为 0 的轨迹，分成六类；图里只显示变化最大的 knowledge 与 planning 两类。</figcaption>
</figure>

Full imitation 后，domain-computation recipe 的使用率从 30.8% 升到 76.1%，implicit-knowledge failures 从 46.2% 降到 44.5%。但 planning failures 从 1.1% 跳到 14.6%。On-policy correction 把 planning failures 保持在 1.8%，同时把 knowledge failures 降到 43.2%，总体 failure rate 也从 28.9% 降到 26.8%。

这组证据与“planning-style drift 破坏 model-harness fit”一致，但仍属于行为归因。Failure category 由 LLM classifier 判定，论文没有人工 agreement、judge model、prompt 或 confusion matrix，因此不能把 14.6% 当成无争议的人工诊断。

### 4.3 Gemma replication 排除了什么？

作者在 WebArena task 上把 weak model 换成 Gemma-4-26B-A4B。Harness evolution 让它从 46.7% 升到 55.6%；Gemini 使用同一 harness 时从 71.1% 升到 81.1%；Gemma 做 full imitation 后降到 41.1%。这说明退化不只出现在 Qwen-Gemini 组合里，也难以只用表面输出 style 不同来解释。

它没有排除更多因素：Gemma 只测了一个 task，仍使用同一个 expert 和同一套 LoRA recipe，也没有比较 DAgger、RL、KL regularization 或不同 correction 粒度。

## Q5. 对 Claude Code、Codex 这类完整 harness 有什么启发？

**最直接的结论是：升级模型权重后，旧 harness 需要重新做 compatibility regression。** 一个为 Claude Code 某个版本调出来的 tool policy、sub-agent 分工、retry hook 或 context compaction 规则，不一定能原样适配下一版模型。模型更强也不保证它会按旧 scaffold 预期的节奏走完任务。

第二，收集训练数据时应优先保留 learner state distribution。对真实 coding agent，可以先运行当前模型，定位第一处导致后续失败的 decision，再让更强模型只修这一步。这样产生的数据更接近学生部署时会遇到的 repository state、tool output 和 context history。

第三，**“用了 harness 组件”不等于“与 harness 配合正确”。** 本文的 imitation model 更频繁使用 domain recipe，却更容易在规划上失败。监控系统至少要同时看 task success、tool/hook adoption、planning loops、finish behavior 和未完成原因。

<div class="note blue"><p><strong>如果把这篇论文扩展到 Claude Code / Codex，我会补四个实验：</strong>用同一组 repo-level sealed tasks 比较 base、full imitation、single-turn correction 和 short-window correction；在模型版本升级前后交叉测试旧 harness；由人工复核 first-failure localization；最后把 corrected turn 重新放回真实环境执行，确认后续 trajectory 仍然成立。</p></div>

## Q6. 最后怎样评价这篇论文？

**它给出了一个很有价值的负结果：成功 expert trajectory 也可能是错误的训练单位。** 围绕 78.0→63.1 的异常，作者补了 baseline-harness control、第二模型家族、模型是否采用新增 harness 规则的统计、failure composition 和两条可读的 rollout case。证据链比单纯提出一种新 SFT recipe 完整得多。

需要保留的限制也很明确：

<div class="limit-grid">
  <div><b>数据和实现没有公开</b><span>论文与 arXiv 页面没有本工作官方代码链接；约 500 rows 的 correction set、failure localizer、quality judge 和 task-level logs 均不可下载。</span></div>
  <div><b>Correction 的净增益很小</b><span>主结果是 78.0→79.7，只有 +1.7 points。它最强的证据是避免 63.1 的退化，不是大幅超过 evolved-harness baseline。</span></div>
  <div><b>Failure taxonomy 依赖 LLM judge</b><span>论文没有报告人工标注协议、judge identity、prompt 或一致率；planning-fit 解释合理，但还不是因果定论。</span></div>
  <div><b>只测试一个 expert</b><span>Qwen 和 Gemma 都由 Gemini-3.1-Pro-Preview 提供轨迹或 correction，无法判断 teacher style 是否影响结果。</span></div>
  <div><b>任务来自同一上游 suite</b><span>七项任务覆盖多种工具交互，但仍是同一 enterprise benchmark family；真实大型 repo 和多人开发流程未验证。</span></div>
  <div><b>没有完整 co-evolution 多轮结果</b><span>Figure 1 画出了下一轮循环，实验主要验证一次 harness evolution 后的一次 model update。</span></div>
</div>

我的判断是：**这篇论文应该和 Harness-Zero、Multi-Harness RL 一起读。** Harness-Zero 问怎样把行为带离 source harness，Multi-Harness RL 说明混合多个 harness 不会自动产生 portability，而本文指出即使继续使用同一个 evolved harness，粗暴的完整轨迹模仿也会破坏兼容性。三篇合起来，把“训练数据来自哪个 runtime、保留了谁的 state distribution、部署时还剩哪个 harness”这三个问题分开了。

<div class="note"><p><strong>来源与授权说明：</strong>论文为 arXiv:2609.09134v1，arXiv 页面标注 CC0 1.0。本文直接引用 Figure 1 并注明来源，其余图表均根据 Tables 1-3 与 Appendix D 数据重绘。论文 PDF、arXiv metadata 与公开代码链接于 2026-09-29 核查；未找到本工作的官方代码或数据发布。</p></div>

</div>

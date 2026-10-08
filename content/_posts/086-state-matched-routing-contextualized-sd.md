---
title: "[2026-08-05] When Privileged Guidance Misaligns: State-Matched Routing and Contextualized Self-Distillation for Multi-Turn Agents"
permalink: "/posts/论文解读/state-matched-routing-contextualized-sd.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/state-matched-routing-contextualized-sd/cover.svg"
description: "SMRC-SD 把成功 trajectory 当成 state-indexed resource：只有 student 当前执行状态与 reference prefix 匹配时才启用 dense distillation，否则 abstain，所有 turn 仍保留 GRPO。本文也核查了 repo 中缺失的 reference data。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "State Matching"
  - "Agent Training"
  - "On-Policy Distillation"
  - "Routing"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Junzhuo Liu, Weiwei Li, Jun Ling, Peng Wang · arXiv:2608.05219v1 · 最早公开于 2026-08-05</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.05219">论文主页</a><a href="https://arxiv.org/pdf/2608.05219v1">论文 PDF</a><a href="https://github.com/liujunzhuo/SMRC-SD">官方代码</a></div>

<section class="deck-wrap" aria-label="SMRC-SD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/state-matched-routing-contextualized-sd-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/state-matched-routing-contextualized-sd-visual-guide.html" title="SMRC-SD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">SMRC-SD 解决一个动态问题：student 前几步一旦偏离 reference，完整成功轨迹就不再是当前 state 的合法指导。方法先匹配执行状态，匹配成功才做 privileged distillation；不匹配就 abstain。</p>

<div class="metrics" aria-label="SMRC-SD 关键数字"><div class="metric"><strong>0.865</strong><span>ALFWorld Average@4</span></div><div class="metric"><strong>0.693</strong><span>WebShop success</span></div><div class="metric"><strong>20.2%</strong><span>structured matching coverage</span></div><div class="metric"><strong>10/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>reference action 只在产生它的 state 附近有效，不能无条件监督所有 student turns。</li><li>match-only routing 单独把 ALFWorld 0.746 提到 0.836，加 localized context 后到 0.865。</li><li>core code 很完整，但 README 声称 bundled 的四个 reference/validation files 在 audited commit 里不存在。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 为什么 multi-turn 特别容易错位</span><h3>每个 student action 都会改变下一步的合法空间</h3><p>agent 先拿了哪个物体、站在哪个页面、完成了哪个 subgoal，都会改变可执行 action。reference trajectory 的“下一步”只有在当前 state 与 reference prefix 兼容时才有意义。论文把“不使用这条 reference 监督当前 turn”称为 abstain。</p></aside>

## Q1. Full-path guidance 为什么会在中途变成错答案？

<p><strong>reference 只证明某个 action 在它自己的 state 上有效；student 一旦按不同顺序完成 subgoal，继续照搬下一步就会误导。</strong>这不是 context 太长的问题，而是 state-reference mismatch。</p><p>SMRC-SD 把 successful trajectory 索引到多个 reference prefixes。每一 turn 都重建 student state signature，选择最新兼容位置；没有匹配就不给 dense SD loss。</p>

## Q2. Routing、contextualization 与 reward 如何分工？

<div class="table-scroll"><table><thead><tr><th>模块</th><th>作用</th><th>未匹配时</th></tr></thead><tbody><tr><td>State matcher</td><td>判断 reference prefix 是否兼容</td><td>abstain</td></tr><tr><td>Router</td><td>选择最新 compatible position</td><td>不路由</td></tr><tr><td>Context builder</td><td>完整 path + current summary + candidate action</td><td>不构造</td></tr><tr><td>GRPO</td><td>所有 turn 的 outcome optimization</td><td>继续生效</td></tr><tr><td>Self-distillation</td><td>matched turns 的 token signal</td><td>关闭</td></tr></tbody></table></div><p>因此 gain 可以拆成两部分：先决定“何时听 reference”，再决定“给 teacher 看怎样的 local context”。</p>

## Q3. ALFWorld 与 WebShop 怎样定义 state match？

<p><strong>ALFWorld adapter 把位置、inventory 与 subgoal 进度压成 deterministic execution-state signature；WebShop adapter 则记录 goal progress，并检查 required option 是否可用。</strong>matcher 同时确认 task identity、必要 progress fields 与 reference next action 的 admissibility，也就是这一步在当前环境中能否执行。</p><div class="case"><h4>论文真实 case</h4><p>ALFWorld student 已把 <code>lettuce 3</code> 放进 fridge。history matcher 因文本前缀相似，仍建议再开 fridge；structured state 识别到第一对象已经完成，路由到 second-object phase。另一个 case 里 agent 位于 <code>fridge 1</code>，表面相似的初始 history 会建议去 <code>diningtable 2</code>，location mismatch 让 SMRC-SD abstain。</p></div>

## Q4. setting、ablation 与 replay audit 说明什么？

<p>ALFWorld 有 3,553 个训练 games，每个一条 verified expert walkthrough；WebShop-small 有 6,910 条 deterministic trace。Qwen3-1.7B / Qwen2.5-3B；每 update 16 tasks × 8 rollouts；actor LR <code>1e-6</code>，GRPO clip 0.2，SDL coefficient 0.01，4×H800。主结果用固定 final checkpoint。</p><div class="table-scroll"><table><thead><tr><th>Qwen3-1.7B · ALFWorld</th><th>Average@4</th></tr></thead><tbody><tr><td>FullPath-SD</td><td>0.746</td></tr><tr><td>Random same-count turns</td><td>0.723</td></tr><tr><td>Match-only routing</td><td>0.836</td></tr><tr><td>Routing + localized context</td><td><b>0.865</b></td></tr><tr><td>Dynamic context but distill unmatched</td><td>0.695</td></tr></tbody></table></div><p><strong>same-count random control 只有 0.723，说明收益不是简单减少 distillation turns。</strong>35,712 个 archived identical turns 中，structured matcher 覆盖 20.2%，history matcher 覆盖 15.4%；前者保留了 98.8% 的 history matches。作者还从 structured matches 中抽取 781 条，把候选 action 接回 canonical suffix 后重放，781 条都成功。</p>

## Q5. 游戏代码的 state signature 应包含什么？

<p><strong>建议把 partial code state、compile state、scene graph 与 runtime fixture 合成 signature。</strong>至少包含 files/AST summary、已注册 InputMap、nodes/signals/resources、compile diagnostics、当前 hidden-test fixture、runtime snapshot 和已满足 obligations。</p><p>reference continuation 只有在 required node/API/state 已存在、下一操作仍 admissible 时才能进入 teacher context。否则 dense loss abstain，但 executable reward 继续训练。这个“会沉默的 teacher”比总能给建议的 teacher 更可靠。</p>

## Q6. 官方 repo 的复现缺口是什么？

<p><strong>matcher、routing、context builder、trainer、environment、launcher、probe 与 unit tests 都在；README 所称 included 的四个 data files 却不存在。</strong>缺失项包括 ALFWorld walkthrough prefixes/trajectories、WebShop oracle paths 和 fixed val128 manifest。</p><p>这会阻断 paper launcher 的 default path，除非自己重建并记录等价 pipeline。兴趣程度 10/10：它的 state-dependent abstention 是 game project 最应该直接借用的机制。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 10/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

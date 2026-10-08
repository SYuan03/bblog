---
title: "[2026-02-04] Privileged Information Distillation for Language Models"
permalink: "/posts/论文解读/privileged-information-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/privileged-information-distillation/cover.svg"
description: "π-Distill 面向多轮 agent：frontier teacher 不开放 hidden reasoning，只留下成功的 action/tool-call trace。论文研究怎样把这类 action-only privileged information 迁移到 inference 时看不到它的 policy。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Privileged Information"
  - "Agent Training"
  - "Tool Use"
  - "Reinforcement Learning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Emiliano Penaloza, Dheeraj Vattikonda, Nicolas Gontier, et al. · arXiv:2602.04942v3 · 最早公开于 2026-02-04</p>
<div class="source-links"><a href="https://arxiv.org/abs/2602.04942">论文主页</a><a href="https://arxiv.org/pdf/2602.04942v3">论文 PDF</a></div>

<section class="deck-wrap" aria-label="π-Distill 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/privileged-information-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/privileged-information-distillation-visual-guide.html" title="π-Distill 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">这篇把 privileged information 从数学答案推进到多轮 agent 的成功 action/tool-call trace。它的核心结论很适合游戏代码：dense privileged loss 可以提供形状更细的监督，但不能替代真正的 task reward。</p>

<div class="metrics" aria-label="π-Distill 关键数字"><div class="metric"><strong>15,885</strong><span>Retail successful traces</span></div><div class="metric"><strong>44.1</strong><span>Travel Planner，π-Distill</span></div><div class="metric"><strong>17/21</strong><span>ablation 需要非零 RL reward</span></div><div class="metric"><strong>8.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>PI 来自成功的 DeepSeek-chat-v3.1 agent run，保留最短成功轨迹，并非人工 action annotation。</li><li>π-Distill 联合训练 privileged teacher 与 unprivileged student；论文的 OPSD 变体则把 reverse-KL penalty 加到 RL。</li><li>17/21 个 ablation 中非零 RL coefficient 很重要，说明 dense PI loss 不是 correctness verifier。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · action-only PI 是什么</span><h3>只能看到 teacher 做了什么，看不到它为什么这样做</h3><p>商业 frontier model 往往隐藏 chain-of-thought，但 API 会暴露 tool name、arguments 和 environment observation。论文把这些成功 action trajectories 当成 privileged information，训练后的 student 在部署时不再拿到整条 reference trajectory。</p></aside>

## Q1. 没有 teacher chain-of-thought，还能蒸馏什么？

<p><strong>可以蒸馏 successful action/tool-call trajectory，因为 environment 会记录每一步可观察行为。</strong>论文假设 frontier agent 的隐藏推理不可得，但成功调用过哪些工具、参数是什么、环境返回什么仍然可见。</p><p>训练目标不是逐字复原 hidden reasoning，而是让 inference policy 在没有 reference trajectory 时也更容易选到正确 action。</p>

## Q2. π-Distill 与 OPSD 分别解决哪一段？

<div class="table-scroll"><table><thead><tr><th>方法</th><th>Privileged teacher</th><th>Unprivileged student</th><th>Outcome reward</th></tr></thead><tbody><tr><td>π-Distill</td><td>随 RL 一起学习</td><td>同时匹配 teacher</td><td>teacher 与 student 均可用</td></tr><tr><td>论文中的 OPSD</td><td>同模型看成功 trace</td><td>student on-policy rollout</td><td>与 reverse-KL penalty 联合</td></tr><tr><td>SFT + RL</td><td>先模仿 static trajectory</td><td>再跑 RL</td><td>有</td></tr></tbody></table></div><p>π-Distill 的 teacher 也在训练，不要求一开始就能把 PI 用好；OPSD 更接近 fixed privileged teacher。两者共同测试 tool calls with arguments、tool names only 与 self-generated hints。</p>

## Q3. 数据与训练协议具体是什么？

<p><strong>所有 PI 都来自成功的 DeepSeek-chat-v3.1 run，作者为每个 task 保留最短成功轨迹。</strong>tau-Bench Retail 共 15,885 条成功 trace，500 个 training tasks 中有 300 个配 PI；Travel Planner 有 1,986 条 trace，覆盖 45 个 training tasks。</p><p>backbone 为 Qwen3-4B/8B 与 R1-Distill-Llama-8B。两张 H100，25K context，temperature 0.75，三 seeds；Retail 600 steps，Travel Planner 400 steps。OOD 测试还包括 tau-Bench Airline 与七个 GEM search environments。</p><div class="case"><h4>一个 action-only PI 的可见边界</h4><p>teacher trace 可以写“调用搜索工具、参数 A；读取结果；再调用 booking 工具、参数 B”，但不包含 teacher 的内部理由。student 在 rollout 时只看到当前 task 和已经发生的 environment history。训练期 teacher 额外看到完整 successful trace，对 student 当前 action 分布提供监督。</p></div>

## Q4. 结果为什么不能只看最高分？

<div class="table-scroll"><table><thead><tr><th>Travel Planner · Qwen3-8B</th><th>Score</th></tr></thead><tbody><tr><td>Base</td><td>23.6</td></tr><tr><td>SFT + CoT + RL</td><td>32.3</td></tr><tr><td>OPSD</td><td>37.5</td></tr><tr><td>π-Distill α=0</td><td>40.7</td></tr><tr><td>π-Distill α=0.5</td><td>41.1</td></tr><tr><td>π-Distill α=1</td><td><b>44.1</b></td></tr></tbody></table></div><p><strong>论文在 17/21 个 ablation 中发现非零 RL reward 重要。</strong>这直接限制了“只做 token-level privileged matching”的解释。初始 teacher-student KL 过大时，PI 即便内容丰富也可能难以传递。</p><p>表格对每个 seed 先取 peak 再平均，而 learning curves 是同一步数上平均 seeds；这两种统计不能混为一谈。</p>

## Q5. 对游戏代码训练最直接的启发是什么？

<p><strong>保留 compile、hidden tests、runtime gameplay 与 visual rubric 的 outcome reward，再把成功 build trace 当 shaping。</strong>可尝试三档 PI：只给 tool name（compile/run/screenshot）、给 tool arguments 与结果、给压缩后的 failure→repair trace。</p><p>如果游戏生成需要十几轮 tool call，action-only PI 比 full reference code 更贴近 agent harness。它教的是“在什么状态下调用什么工具”，而不是要求 student 复制一种 scene tree。</p>

## Q6. 这篇的证据边界在哪里？

<p><strong>没有官方公开代码，所有 PI 又来自一个 frontier model，因此复现依赖未公开的 trace generation。</strong>实验只到 8B；PI utility、长度、初始 KL 和 trace quality 没有被完全独立控制。</p><p>兴趣程度 8.5/10。它的主要价值是把 RL reward 的角色说清楚：privileged distillation 是 dense shaping，不是 verifier。要作为实现基线，还得借 OPSD/SMRC-SD 的公开训练代码。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染。论文未提供 official repository；代码可用性按 2026-10-08 的 arXiv 页面与公开仓库检索结果记录。兴趣程度 8.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

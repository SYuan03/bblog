---
title: "[2026-08-13] Latent On-Policy Self-Distillation"
permalink: "/posts/论文解读/latent-on-policy-self-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/latent-on-policy-self-distillation/cover.svg"
description: "LOPD 检索成功经验并压成 continuous latent tokens，由 latent-conditioned frozen teacher 监督 student on-policy trajectory。它报告强结果，但 compressor checkpoint、paper data、memory bank 与 logs 不公开，默认还允许 same-task retrieval。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Latent Context"
  - "On-Policy Distillation"
  - "Experience Retrieval"
  - "Code Generation"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Guibin Zhang, Jiayang Lyu, Ran Sun, et al. · arXiv:2608.13040v1 · 最早公开于 2026-08-13</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.13040">论文主页</a><a href="https://arxiv.org/pdf/2608.13040v1">论文 PDF</a><a href="https://github.com/bingreeky/LOPD">官方代码</a></div>

<section class="deck-wrap" aria-label="LOPD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/latent-on-policy-self-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/latent-on-policy-self-distillation-visual-guide.html" title="LOPD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">LOPD 不再手写 privileged context，而是检索过去成功 trajectory，用 encoder + QFormer 压成 latent tokens，让 frozen teacher 读这些连续表示。它是高潜力第二阶段，不适合当第一个 game experiment。</p>

<div class="metrics" aria-label="LOPD 关键数字"><div class="metric"><strong>3×32</strong><span>默认 retrieved latent tokens</span></div><div class="metric"><strong>48.78</strong><span>Qwen3-4B LiveCodeBench</span></div><div class="metric"><strong><30%</strong><span>GRPO/Skill-SD rollout budget</span></div><div class="metric"><strong>7/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>student 仍从原任务与 history 生成 on-policy trajectory；latent context 只给 teacher。</li><li>privileged-margin 防止 composer 为了降低 KL 而把 teacher collapse 到 student。</li><li>repo 公开 core pipeline，但 compressor checkpoint、paper bank、scenarios、embeddings 与 result logs 缺失；config 默认 allow_self_retrieval=true。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · Latent context 不是普通 prompt</span><h3>privileged information 被压成连续向量，无法直接阅读</h3><p>每条 retrieved experience 被压成 32 个 latent tokens，默认检索三条。teacher 在 transformer hidden-state 层读取它们；student 部署时没有这些 latent tokens。</p></aside>

## Q1. 为什么要让 privileged context 自己学？

<p><strong>手写 answer、hint、skill 或 trajectory 都预设了“什么信息重要”；LOPD 把这个选择交给 retriever 与 composer。</strong>它希望从 experience bank 里找相关成功历史，再压缩成 teacher 最有用的连续表示。</p><p>代价是解释性下降，而且系统新增 retriever、encoder LoRA、QFormer compressor、latent injection 与 margin constraint。</p>

## Q2. LOPD 相对 OPSD 改了哪一层？

<div class="table-scroll"><table><thead><tr><th>阶段</th><th>OPSD</th><th>LOPD</th></tr></thead><tbody><tr><td>Context source</td><td>单条 reference solution</td><td>retrieved successful experiences</td></tr><tr><td>Representation</td><td>可读 text</td><td>continuous latent tokens</td></tr><tr><td>Teacher</td><td>frozen self-teacher</td><td>latent-conditioned frozen self-teacher</td></tr><tr><td>Student</td><td>question-only rollout</td><td>task + interaction history rollout</td></tr></tbody></table></div><p>default 检索三条 experience，每条压成 32 latent tokens。reverse KL 只匹配 student top-20 vocabulary entries，加一个 aggregated tail bucket。</p>

## Q3. Composer、margin 与 cold start 怎样工作？

<p><strong>每个 task-experience pair 经 frozen backbone + trainable encoder LoRA，再由八层共享参数 QFormer cross-attention 压缩。</strong>cold start 先用 successful trajectory next-token likelihood 训练 composer。</p><p>joint training 容易出现一个坏解：composer 让 teacher 变得与 student 一样弱，KL 很小但没有 teaching advantage。privileged-margin 要求 teacher 对 sampled token 保持与 reward sign 一致的 log-prob advantage；dual variable 执行约束，L2 anchor 限制 latent drift。</p>

## Q4. 数据、结果与 baseline fairness 怎样看？

<p>tool-use 用 2,349 EnvScaler-derived tasks；code 用约 7K verified TACO problems。experience bank 只放 training-split success trajectories。训练 32 rollouts/step，LR <code>1e-5</code>，temperature 0.7，top-p 0.95，top-k 20，margin 0.05。</p><div class="table-scroll"><table><thead><tr><th>Backbone / benchmark</th><th>LOPD</th></tr></thead><tbody><tr><td>Qwen3-4B EnvScaler</td><td>63.7</td></tr><tr><td>Qwen3-8B EnvScaler</td><td>66.4</td></tr><tr><td>Qwen3-4B LiveCodeBench</td><td>48.78</td></tr><tr><td>Qwen3-4B EvalPlus</td><td>81.36</td></tr><tr><td>OLMo3-7B LiveCodeBench</td><td>50.98</td></tr></tbody></table></div><p><strong>joint training without margin 得 0.551 EnvScaler reward，加 m=0.05 后到 0.637。</strong>三条 retrieved experiences 是最早达到 0.637 的设置，更多 retrieval 不单调更好。</p><p>baseline pool 在 base trajectory 覆盖不足时会补 DeepSeek-V4-Pro 与 Qwen3.7-Max，而 LOPD bank 使用成功 training trajectories；这不是纯 context-only fairness。</p>

## Q5. 游戏数据什么时候值得上 latent context？

<p><strong>先用 discrete context 实验搞清楚 strategy、execution feedback、state routing 和 span credit，之后再压缩最好的 context。</strong>否则 latent gain 无法解释：它可能来自 answer leakage、same-task retrieval 或更强的 bank。</p><p>game bank 应按 game/template/asset family 严格 split，默认禁用 same-task retrieval，并同时报告 readable discrete context 与 latent context。retriever 命中、latent capacity 和 verifier reward 都要单独 ablate。</p>

## Q6. 公开代码的关键风险是什么？

<p><strong>core rollout、teacher、trainer、QFormer composer 与 memory bank code 已公开，但 paper compressor checkpoint、scenarios、bank、embeddings 与 logs 没有。</strong>README 写 compressor “on the way”，configs 仍有 placeholder paths。</p><p>更关键的是 cold-start 与 LOPD configs 默认 <code>allow_self_retrieval: true</code>。如果 bank 含当前 task 的成功 trajectory，teacher 就可能直接读到这道题的成功经验。复现应关闭此项；若要保留，只能把它作为 teacher 获得同题答案的上限对照（oracle）单列。兴趣程度 7/10。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 7/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

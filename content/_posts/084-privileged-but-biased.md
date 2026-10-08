---
title: "[2026-08-05] Privileged, but Biased: How PI-Conditioned Teachers Break Self-Distillation"
permalink: "/posts/论文解读/privileged-but-biased.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/privileged-but-biased/cover.svg"
description: "这篇反例论文说明 PI-conditioned teacher 可能奖励 reference-path similarity，而不是 correctness。它对 QA、数学、代码和多轮 tool use 的 dense self-distillation 做压力测试，是游戏多解程序必须读的失败诊断。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Self-Distillation"
  - "Privileged Information"
  - "Bias"
  - "Negative Results"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Sarthak Harne, Chinmay Karkar, Yash Pandya, et al. · arXiv:2608.04794v1 · 最早公开于 2026-08-05</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.04794">论文主页</a><a href="https://arxiv.org/pdf/2608.04794v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="Privileged, but Biased 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/privileged-but-biased-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/privileged-but-biased-visual-guide.html" title="Privileged, but Biased 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">这篇问得很尖锐：如果没有 reward，只靠 PI-conditioned teacher 的 dense token loss，模型真的学会正确性了吗？在较难的 QA、数学、代码和 agent tasks 上，答案通常是否定的。</p>

<div class="metrics" aria-label="Privileged, but Biased 关键数字"><div class="metric"><strong>0.31 vs 0.08</strong><span>off-path / on-path KL</span></div><div class="metric"><strong>−4.28</strong><span>math think，OPSD change</span></div><div class="metric"><strong>4 类</strong><span>PI Bias Score targets</span></div><div class="metric"><strong>9.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>teacher 看过一条 reference path 后，会强烈偏好该 path；另一条正确解的待遇接近 unrelated correct solution。</li><li>loss 和 KL 很难区分 correct 与 incorrect rollout，梯度大量落在标点、stopword 和 style token。</li><li>论文只否定“self-distillation 作为 lone objective”，没有测试 reward + state-gated dense loss。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 先区分正确性与 reference similarity</span><h3>代码有多个正确实现时，这两个目标会明显分叉</h3><p>一个 Godot mechanic 可以用 signal、直接 method call、state machine 或 data-driven component 实现。功能都通过 hidden tests，不代表 token 或 AST 接近唯一 reference project。</p></aside>

## Q1. PI-conditioned teacher 为什么会偏？

<p><strong>teacher 已经看过一条 reference solution，因此它的 next-token distribution 会把“沿着这条路写”当成高概率，而不是把所有正确替代路径都同等提高。</strong>论文把这称为 PI bias。</p><p>PI Bias Score 比较 teacher 相对 unprivileged student 对四种 target 的 log-probability advantage：reference solution、另一条 correct solution、incorrect solution、unrelated correct solution。观察到的顺序是 reference 远高于 alternative correct，后者只略好于 incorrect，并接近 unrelated correct。</p>

## Q2. 这篇反驳了哪些结论，又没有反驳什么？

<div class="table-scroll"><table><thead><tr><th>结论</th><th>论文证据</th></tr></thead><tbody><tr><td>“dense SD loss 单独能教 correctness”</td><td>在 harder tasks 上不成立</td></tr><tr><td>“full reference PI 一定优于其他 context”</td><td>不成立，reference-path bias 很强</td></tr><tr><td>“所有 self-distillation 都无效”</td><td>没有证明</td></tr><tr><td>“reward + routing + local credit 也无效”</td><td>没有测试</td></tr></tbody></table></div><p>它的实验是故意拿掉 reward 的压力测试。阅读时不要把“lone objective 失败”误写成“OPSD 在任何组合里都失败”。</p>

## Q3. PI Bias Score 与训练设置怎么做？

<p>Qwen3-8B think/instruct，补充 Qwen3-32B；MMLU-Pro、DAPO-Math、CodeForces、BFCL multi-turn。QA、math、code 各 2,000 items，BFCL 100 tasks。JSD clip 0.001，EMA 0.001，LR 多数 <code>1e-5</code>，code/agent <code>1e-6</code>，batch 32，八 rollouts，三 epochs，response 16,384，8×B200。</p><p><strong>诊断不只看 accuracy，还把 token 按 reference path、exploration、stopword、punctuation 和 style marker 分类。</strong>这使“loss 明明下降、任务却变差”的机制可被定位。</p>

## Q4. 负面结果具体有多严重？

<div class="table-scroll"><table><thead><tr><th>Setting</th><th>Validation change</th></tr></thead><tbody><tr><td>OPSD · general QA think</td><td>−1.96</td></tr><tr><td>OPSD · math think</td><td><b>−4.28</b></td></tr><tr><td>OPSD · math instruct</td><td>−0.44</td></tr><tr><td>ordinary SD · coding think</td><td>−0.30</td></tr><tr><td>ordinary SD · agentic think</td><td>−3.51</td></tr></tbody></table></div><p><strong>正确 rollout 中，off-reference exploratory token 的 KL 约 0.31，on-reference token 只有 0.08。</strong>student entropy 上升、response 变短；更长 rollout、easy subset、32B scale 与 hint/skill-card PI 都没有修好。</p><p>loss 与 KL 对 correct/incorrect 的区分很弱，说明训练曲线下降不能当成 task learning 的证据。</p>

## Q5. 游戏论文必须增加什么实验？

<p><strong>构造一个 2×2 diagnostic：correct/incorrect × reference-near/reference-divergent。</strong>对每组测 teacher loss、KL、reward 和 update direction。最重要的一格是 correct + reference-divergent，它决定方法会不会压掉合法创新实现。</p><div class="table-scroll"><table><thead><tr><th>程序组</th><th>用途</th></tr></thead><tbody><tr><td>Correct + near</td><td>确认 teacher 能利用 reference</td></tr><tr><td>Correct + divergent</td><td>测 single-solution bias</td></tr><tr><td>Incorrect + near</td><td>防止“像 reference 就高分”</td></tr><tr><td>Incorrect + divergent</td><td>普通负例</td></tr></tbody></table></div><p>再比较 reward-only、full-reference dense loss、state-gated loss 与 implicated-span loss。只报告最终 pass rate，会掩盖 method 是否靠 mode collapse 获益。</p>

## Q6. 证据和 artifact 有什么限制？

<p><strong>论文没有测试 reward 与 self-distillation 联合，主诊断又集中在一个 model family。</strong>它能否定“PI token matching 自身就是 correctness”，不能否定带 verifier 的 execution-grounded distillation。</p><p>paper 声称 code 在 supplementary，但公开 arXiv source tar 只有 TeX、bibliography/style 与 figures，没有 code archive 或 repository URL。兴趣程度 9.5/10；它应当成为你的 mandatory diagnostic，而不是 implementation base。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；另检查公开 arXiv source tar，未发现论文所说的 supplementary code。兴趣程度 9.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

---
title: "[2026-05-09] Training with Harnesses: On-Policy Harness Self-Distillation for Complex Reasoning"
permalink: "/posts/论文解读/training-with-harnesses.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/training-with-harnesses/cover.svg"
description: "OPHSD 把临时 inference harness 变成训练期 teacher context：student 仍直接作答，teacher 则读取 Plan–Solve 或 Draft–Verify 的 terminal context。本文区分哪些 procedure 能内化，哪些实时结果永远需要继续执行。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Agent Harness"
  - "On-Policy Distillation"
  - "Reasoning"
  - "Training Scaffolds"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Zhengyang Zhao, Lu Ma, Wentao Zhang · arXiv:2605.08741v1 · 最早公开于 2026-05-09</p>
<div class="source-links"><a href="https://arxiv.org/abs/2605.08741">论文主页</a><a href="https://arxiv.org/pdf/2605.08741v1">论文 PDF</a><a href="https://github.com/zzy1127/OPHSD-On-Policy-Harness-Self-Distillation">官方代码</a></div>

<section class="deck-wrap" aria-label="OPHSD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/training-with-harnesses-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/training-with-harnesses-visual-guide.html" title="OPHSD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">OPHSD 的 teacher context 不是静态答案，而是一个实际运行过的 harness terminal。它想把 Plan–Solve、Draft–Verify 这类 procedure 的收益压回模型参数，让部署时可以拆掉 scaffold。</p>

<div class="metrics" aria-label="OPHSD 关键数字"><div class="metric"><strong>69.50</strong><span>数学平均 pass@8</span></div><div class="metric"><strong>53.33</strong><span>HMMT25</span></div><div class="metric"><strong>3×10K</strong><span>公开训练子集</span></div><div class="metric"><strong>9/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>harness 的执行结果只进入 teacher；student rollout 仍从原任务接口直接生成。</li><li>模型可以内化 procedure，但不能凭参数记住未来网页、当前 build 或实时 game state。</li><li>仓库 fixed-checkpoint 四次运行与 arXiv v1 best-checkpoint 数字属于不同 reporting protocol，不能混表。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 这里的 harness 指什么</span><h3>harness 是控制模型怎样检索、规划、验证和修订的外部流程</h3><p>Plan–Solve 先生成 plan 再求解；Draft–Verify 先检索近邻、产生 draft，再收集支持与反对证据。OPHSD 在训练时执行这些流程，部署时只保留 direct model。</p></aside>

## Q1. 为什么要把 harness 蒸馏回模型？

<p><strong>inference harness 能提高正确率，却增加 latency、token cost、工程复杂度和新的 control-flow failure。</strong>如果 harness 只是临时训练 scaffold，模型可能在部署时直接输出更好的答案。</p><p>OPHSD 的科学问题不是“harness 是否有用”，而是 harness 带来的 procedure 是否能通过同一模型的 privileged teacher 内化。</p>

## Q2. 它与普通 OPSD 的差别在哪里？

<div class="table-scroll"><table><thead><tr><th>方法</th><th>Teacher context</th><th>Context 怎样产生</th></tr></thead><tbody><tr><td>OPSD</td><td>reference solution</td><td>数据集静态提供</td></tr><tr><td>OPHSD Plan–Solve</td><td>抽象 plan + solver terminal</td><td>reference 先交给 planner</td></tr><tr><td>OPHSD Draft–Verify</td><td>retrieval、confirm/challenge evidence</td><td>harness 实际执行检索和复核</td></tr></tbody></table></div><p>student 与 teacher 仍评分同一批 on-policy token。不同的是 privileged context 由当前模型在可执行 procedure 中构造，不是一段预存 hint。</p>

## Q3. 两个 harness 具体怎样运转？

<h3>Plan–Solve</h3><ol><li>训练期 planner 看 problem 与 reference solution，写一份不泄漏答案的策略 sketch。</li><li>solver 只看 problem 与 plan，产生 harness terminal。</li><li>frozen teacher 用 terminal context 评分 direct student rollout。</li></ol><h3>Draft–Verify</h3><ol><li>检索五个近邻 draft。</li><li>五个 confirmer 与五个 challenger 分别找支持和反例。</li><li>reviser 综合证据；teacher 再把这份 richer terminal 压到 student token distribution。</li></ol><p><strong>teacher 的优势来自执行过的 procedure，而不是单纯多一段 reference text。</strong></p>

## Q4. setting、结果与真实失败 case 是什么？

<p>Qwen3-8B；CAIL、USPTO、DeepMath 各 10K items；batch 64，8,192 tokens，学习率 <code>1e-6</code>，8×H100。text task 300 steps，math 150 steps。</p><div class="table-scroll"><table><thead><tr><th>任务</th><th>GRPO</th><th>OPSD</th><th>OPHSD</th></tr></thead><tbody><tr><td>LawBench</td><td>62.44</td><td>64.25</td><td><b>69.51</b></td></tr><tr><td>USPTO</td><td>90.01</td><td>88.01</td><td><b>90.81</b></td></tr><tr><td>Math avg pass@8</td><td>66.57</td><td>66.68</td><td><b>69.50</b></td></tr><tr><td>HMMT25</td><td>—</td><td>42.50</td><td><b>53.33</b></td></tr></tbody></table></div><div class="case"><h4>为什么 harness 不是永远可靠</h4><p>LawBench 的一个 case 中，检索到的样例全部指向 intentional injury，掩盖了 negligent homicide。论文观察到训练后的 direct student 反而能保留两种解释。reattach harness 在 inference 时没有继续增益，有时还会降分。</p></div>

## Q5. 游戏 coding harness 哪些东西能内化？

<p><strong>可以尝试内化“先列 obligations、实现、compile、运行 fixture、检查 state、再修订”的 procedure；不能省掉当前程序真正的 execution。</strong>未来 query 的 asset、engine version 和生成代码都不同，compile error、render diff 与 gameplay trace 必须在当次 build 上计算。</p><p>最合理的 game OPHSD teacher context 是当前 student build 经过 harness 后产生的 terminal，而不是 reference game 的预录日志。这样 procedure 可复用，evidence 仍与当前状态绑定。</p>

## Q6. 代码 release 足够复现吗？

<p><strong>官方仓库公开 trainer、两套 harness、reward、data conversion、3×10K 训练子集与 fixed-checkpoint 四次运行 CSV。</strong>DeepMath 依赖 Git LFS，evaluation sets 不打包，仓库也没有检测到明确 license。</p><p>论文 v1 的 text 表取 run 内 best checkpoint；仓库后续 CSV 固定 text step 300、math step 150 并做四次运行。二者都可读，但不能把每列最方便的数拼在同一张表。兴趣程度 9/10。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 9/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

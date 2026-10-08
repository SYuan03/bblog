---
title: "[2026-08-03] Is More Privileged Information Better? From Solution Traces to Problem-Solving Structure in Self-Distilled Reasoning"
permalink: "/posts/论文解读/problem-space-guided-opsd.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/problem-space-guided-opsd/cover.svg"
description: "PS-OPSD 不把完整 solution 交给 self-teacher，而是提取 initial state、goal、constraints 与 state-transition path。它说明结构化 problem space 比原始 trace 更好，但论文没有公开 code 与 run manifest。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "OPSD"
  - "Problem Space"
  - "Structured Context"
  - "Reasoning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Xuyang Zhao, Liting Zhang, Zichen Xu, et al. · arXiv:2608.01589v1 · 最早公开于 2026-08-03</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.01589">论文主页</a><a href="https://arxiv.org/pdf/2608.01589v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="PS-OPSD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/problem-space-guided-opsd-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/problem-space-guided-opsd-visual-guide.html" title="PS-OPSD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">PS-OPSD 试图保留 reference solution 里的“问题结构”，删掉具体答案与表面推导。对游戏代码，它对应的不是完整 project，而是 assets/initial state、success conditions、engine constraints 和实现 transitions。</p>

<div class="metrics" aria-label="PS-OPSD 关键数字"><div class="metric"><strong>64.32</strong><span>4B PS-OPSD</span></div><div class="metric"><strong>65.40</strong><span>8B PS-OPSD</span></div><div class="metric"><strong>0.5%</strong><span>4B train PI invocation</span></div><div class="metric"><strong>8/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>context 由 initial state、goal conditions、constraints 和 selected state transitions 四部分组成。</li><li>4B 上 wrong-task matched-length context 只有 61.76，说明 gain 不只是 token length。</li><li>exact temperature、clip threshold、run manifest、完整 hyperparameter table 与 code 都未公开。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · Problem-space guidance 是什么</span><h3>告诉 teacher 问题怎样推进，不交付一条已经算完的答案</h3><p>每个 transition 写 operator、preconditions、transformation 和 resulting state。student 在 inference 时仍只看原问题，不会看到这份结构。</p></aside>

## Q1. 为什么把 solution 改写成 problem space？

<p><strong>完整 solution 绑定一个具体推理轨迹，还可能让 teacher 依赖 final answer；problem-space guidance 只保留可执行的状态变化。</strong>它希望 teacher 提供“下一步应满足什么条件”，而不是“reference 下一行写了什么”。</p><p>这种表示对多解问题更自然，但仍来自一条 verified path，不等于覆盖所有合法 solution space。</p>

## Q2. 四个字段分别承担什么角色？

<div class="table-scroll"><table><thead><tr><th>字段</th><th>含义</th><th>游戏代码类比</th></tr></thead><tbody><tr><td>Initial state</td><td>题目已知对象与关系</td><td>assets、starter repo、scene state</td></tr><tr><td>Goal conditions</td><td>成功必须满足的状态</td><td>hidden tests、gameplay outcomes</td></tr><tr><td>Constraints</td><td>不可违反的规则</td><td>engine/API/version 限制</td></tr><tr><td>State transitions</td><td>operator + preconditions + result</td><td>实现或 repair steps</td></tr></tbody></table></div><p>extractor 是 Qwen3.6-35B-A3B，离线读取 OpenThoughts problem 与 verified solution。guidance 删掉 instantiated final answer，student rollout 与 OPSD objective 保持不变。</p>

## Q3. PS-OPSD 的训练与对照怎样设计？

<p><strong>student 只看 question，teacher 看四字段 guidance 并评分 student 自己的 tokens。</strong>模型为 Qwen3-1.7B/4B/8B；每个 benchmark 对每题评 12 个 stored generations。</p><p>4B ablation 同时测试 flattened fields、wrong-problem matched-length guidance 和 corrupted transition order。它们分别得到 63.61、61.76、62.19，完整 PS-OPSD 是 64.32。结构、relevance 和顺序都有贡献。</p>

## Q4. 结果与 checkpoint 聚合有什么限制？

<div class="table-scroll"><table><thead><tr><th>模型</th><th>Base</th><th>OPSD</th><th>PS-OPSD</th></tr></thead><tbody><tr><td>1.7B</td><td>36.67</td><td>41.08</td><td><b>43.12</b></td></tr><tr><td>4B</td><td>61.76</td><td>61.70</td><td><b>64.32</b></td></tr><tr><td>8B</td><td>62.31</td><td>63.58</td><td><b>65.40</b></td></tr></tbody></table></div><p><strong>PS-OPSD 在三个 scale 都高于 OPSD，但 Avg 仍可能混合每个 benchmark 独立选出的最佳 checkpoint。</strong>90 个 benchmark problems 中，相对 base 改善 18 个、退化 7 个，总体 +2.56。</p><p>explicit PI invocation 在 4B train problems 从 OPSD 的 3.0% 降到 0.5%，held-out 从 2.2% 降到 0.4%。这是行为 proxy，不是严格的信息泄漏证明。</p>

## Q5. 游戏版 problem-space context 应该长什么样？

<p><strong>先生成 implementation-neutral contract，再决定是否给 transition path。</strong>例如：initial assets/scene obligations、mechanic success predicates、Godot version 与 allowed APIs、需要创建的 signals/state transitions。不要出现 reference node path、class name 或具体 code span。</p><p>至少加入同长度 prose、wrong-game context、shuffled transitions 与 no-transition controls，判断 gain 来自 semantic structure 还是仅仅来自更多提示。</p>

## Q6. 为什么它只能当概念参照？

<p><strong>论文没有公开 official repository、run manifests、exact temperature、clipping threshold、完整 batch/LR/update/LoRA 设置。</strong>因此 64.32/65.40 可以作为 paper claim，不能当作可直接复跑的 baseline。</p><p>兴趣程度 8/10。它很适合设计 game context family，但 state transition 仍来自一条 reference path；后续必须用 SMRC-SD 的 state matching 决定何时 abstain。</p>

<p class="source-note">证据范围：本文阅读全文，并分别检查 PDF 文本和逐页渲染。论文未提供 official repository 或 run manifest；代码可用性按 2026-10-08 的公开检索结果记录。兴趣程度 8/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

---
title: "[2026-01-26] Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models"
permalink: "/posts/论文解读/self-distilled-reasoner.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/self-distilled-reasoner/cover.svg"
description: "OPSD 让同一个模型在两种上下文下分别充当学生和 teacher：学生只看问题并生成自己的轨迹，teacher 额外看到 verified solution，再给同一批 token 密集监督。本文同时核对论文与官方代码。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "On-Policy Distillation"
  - "OPSD"
  - "Reasoning"
  - "Privileged Information"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Siyan Zhao, Zhihui Xie, Mengchen Liu, et al. · arXiv:2601.18734v3 · 最早公开于 2026-01-26</p>
<div class="source-links"><a href="https://arxiv.org/abs/2601.18734">论文主页</a><a href="https://arxiv.org/pdf/2601.18734v3">论文 PDF</a><a href="https://github.com/siyan-zhao/OPSD">官方代码</a></div>

<section class="deck-wrap" aria-label="OPSD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/self-distilled-reasoner-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/self-distilled-reasoner-visual-guide.html" title="OPSD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">OPSD 建立了这条研究线最基本的训练合同：学生只看部署时能看到的问题，生成自己的 completion；冻结的同模型 teacher 多看一份训练期 reference solution，并在学生已经走到的每个 token prefix 上给出完整词表分布。</p>

<div class="metrics" aria-label="OPSD 关键数字"><div class="metric"><strong>43.4</strong><span>Qwen3-1.7B OPSD 平均分</span></div><div class="metric"><strong>1</strong><span>每题一个 student rollout</span></div><div class="metric"><strong>1,024</strong><span>主实验最大输出 token</span></div><div class="metric"><strong>9/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>它是最适合复用的最小 OPSD 基线，但不是“full reference code 一定最好”的证据。</li><li>teacher 不生成替代答案；它只对 student 已经采样的 token 重新打分。</li><li>论文的 dense loss 没有先判断 student 轨迹是否正确，游戏代码必须另保留可执行 verifier。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 先把 on-policy 说清楚</span><h3>“On-policy”指监督落在 student 已经写出的 token 前缀上</h3><p>把问题记为 <code>x</code>，student 自己生成代码或推理 <code>y ~ πθ(·|x)</code>。这里的 prefix 指 <code>y&lt;t</code>，也就是生成到第 <code>t</code> 个 token 前已经写出的内容。teacher 看到额外信息 <code>z</code>，但仍然评估同一个 prefix。SFT 的训练 token 来自数据集，OPSD 的训练 token 来自当前 student。</p></aside>

## Q1. OPSD 到底解决了什么问题？

<p><strong>OPSD 的关键不是让学生模仿一条 teacher 生成的答案，而是让 teacher 在学生自己的 token prefix 上重新打分。</strong>传统 knowledge distillation 常由更大的 teacher 生成或标注数据；OPSD 让同一个 base checkpoint 通过“有没有 reference solution”形成能力差异，省掉独立大 teacher。</p><p>动机来自一个训练分布问题。离线 demonstration 很少覆盖 student 会犯的具体错误，RL 的 outcome reward 又只告诉系统最后对不对。OPSD 让 student 暴露自己的错误路径，再让多看一份 verified reasoning trace 的 teacher 在每个位置提供分布监督。</p>

## Q2. 它与 SFT、GRPO 和普通 distillation 的边界在哪里？

<div class="table-scroll"><table><thead><tr><th>方法</th><th>谁生成训练 token</th><th>监督信号</th><th>部署时额外上下文</th></tr></thead><tbody><tr><td>SFT</td><td>数据集 reference</td><td>next-token likelihood</td><td>无</td></tr><tr><td>GRPO</td><td>当前 student</td><td>可验证 reward 的组内相对优势</td><td>无</td></tr><tr><td>Teacher OPD</td><td>当前 student</td><td>独立 teacher 的 token distribution</td><td>无</td></tr><tr><td>OPSD</td><td>当前 student</td><td>同模型 privileged teacher 的 distribution</td><td>无</td></tr></tbody></table></div><p>OPSD 的优点是 token efficient：主实验每题只采一个最长 1,024-token rollout，而 GRPO 使用八个 rollout、最长 16K token、500 updates。代价是 teacher 的偏好未必等于 correctness，尤其当 reference 只是众多正确解法中的一个。</p>

## Q3. 一次 OPSD update 具体怎么走？

<p><strong>student 先从 question-only prompt 采样，teacher 再用同一个 prefix 加 reference solution 计算分布。</strong>只有 completion token 参与 loss；teacher 冻结，student 更新 LoRA。</p><ol><li>collator 生成 student prompt：只有 problem。</li><li>student 以当前参数采样 completion。</li><li>teacher prompt 加入 problem、reference solution 和过渡说明，再拼回 student completion。</li><li>teacher 与 student 都对 completion 位置输出完整 vocabulary logits。</li><li>训练最小化 teacher-to-student forward KL。</li></ol><div class="code-scroll"><pre><code># 根据 audited commit 写成的等价伪代码
y = student.generate(problem)
with student.disable_adapter():   # 冻结的 base checkpoint 充当 teacher
    q = teacher_logits(problem, reference_solution, y.prefixes)
p = student_logits(problem, y.prefixes)
loss = KL(q || p)                  # completion positions only</code></pre></div><p><strong>固定 teacher 通过暂时关闭 LoRA adapter 实现</strong>。当前代码的 <code>jsd_token_clip</code> 会先逐 vocabulary component 截断 divergence，再求和；它不是“每个 token 的总 KL 算完后再 clip”。</p>

## Q4. 实验设置与结果能支持什么结论？

<p>主数据约 30K OpenThoughts 数学题，模型为 Qwen3-1.7B/4B/8B。batch 32，学习率 <code>5e-6</code>，LoRA rank 64、alpha 128，主实验 100 updates。</p><div class="table-scroll"><table><thead><tr><th>模型</th><th>Base</th><th>GRPO</th><th>OPSD</th></tr></thead><tbody><tr><td>Qwen3-1.7B</td><td>37.1</td><td>37.7</td><td><b>43.4</b></td></tr><tr><td>Qwen3-4B</td><td>61.2</td><td>62.7</td><td><b>63.6</b></td></tr><tr><td>Qwen3-8B</td><td>61.8</td><td>64.0</td><td><b>64.8</b></td></tr></tbody></table></div><p><strong>Qwen3-1.7B 的平均分从 37.1 提到 43.4</strong>，增益在最小模型上最大。paper ablation 中 full-vocabulary forward KL 强于 reverse KL、JSD 和 sampled-token matching；把 rollout 从 1,024 延到 4,096 没有稳定收益。</p><p>要注意论文若干 headline 取 best checkpoint。它能说明 OPSD 在这些数学设置上有效，不能说明同一 context 和 checkpoint 对所有任务都最优。</p>

## Q5. 对游戏 query-to-code 应该怎么改？

<p><strong>第一版可以直接复用它的“student rollout + frozen self-teacher”骨架，但要把 reference solution 拆成多种 context 条件。</strong>最小对照应包含 full reference code、implementation plan、engine/API inventory、当前 build 的 compiler/runtime diagnostic，以及无 privileged context 的 reward-only baseline。</p><p>游戏代码有大量正确替代实现，所以必须额外构造“功能正确但 scene tree、class 名和控制流远离 reference”的程序。若 teacher 对这些正确程序给出更高 KL，就说明它在教 reference similarity，而不是 correctness。</p>

## Q6. 复现时最容易踩哪些坑？

<p><strong>完整 reference solution 并不等于正确性信号</strong>。代码仓库是可运行基线，但 audited commit 比原论文发布晚，含 chat-template、ZeRO-2、point-wise clipping 和 EMA teacher 等后续改动。复现实验必须记录 commit，并明确 fixed teacher、loss estimator 与 clipping 方式。</p><p>仓库没有检测到明确 license。用于论文实验前还要确认复用条款。我的兴趣程度是 9/10：它应当作为实现起点，但研究贡献应放在 context 设计、state alignment 与 execution-grounded credit，而不是再次证明数学题上的 full-solution OPSD。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 9/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

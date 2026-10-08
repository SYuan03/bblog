---
title: "[2026-02-12] On-Policy Context Distillation for Language Models"
permalink: "/posts/论文解读/on-policy-context-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/on-policy-context-distillation/cover.svg"
description: "OPCD 研究怎样把历史经验或优化过的 system prompt 蒸馏进模型参数。它保留 student 的 on-policy rollout，再让 context-conditioned teacher 对同一批 token 重新评分。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "On-Policy Distillation"
  - "Context Distillation"
  - "Agent Experience"
  - "Text Games"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Tianzhu Ye, Li Dong, Xun Wu, Shaohan Huang, Furu Wei · arXiv:2602.12275v2 · 最早公开于 2026-02-12</p>
<div class="source-links"><a href="https://arxiv.org/abs/2602.12275">论文主页</a><a href="https://arxiv.org/pdf/2602.12275v2">论文 PDF</a><a href="https://github.com/microsoft/LMOps/tree/main/opcd">官方代码</a></div>

<section class="deck-wrap" aria-label="OPCD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/on-policy-context-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/on-policy-context-distillation-visual-guide.html" title="OPCD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">OPCD 把 privileged context 从“标准答案”扩展到历史经验和 system prompt。它最值得读的结果不是某个最高分，而是 raw trace 会伤害模型，经过提炼的经验才稳定有用。</p>

<div class="metrics" aria-label="OPCD 关键数字"><div class="metric"><strong>79.7</strong><span>math，OPCD</span></div><div class="metric"><strong>53.9</strong><span>Sokoban，filtered experience</span></div><div class="metric"><strong>256</strong><span>teacher top-k vocabulary</span></div><div class="metric"><strong>8.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>student 不带 experience 采样，teacher 带 experience 重评完全相同的 response tokens。</li><li>主实现是 student-to-teacher reverse KL，并可只保留 student 概率最高的 256 个词。</li><li>成功历史不是天然可用的 context；raw trace 在数学任务把 75.1 降到 70.5。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · Context distillation 的目标</span><h3>训练期能查资料，部署时不再携带资料</h3><p>Context distillation 试图把一段外部 context 的作用写进模型参数。OPCD 加上 on-policy 约束：需要被蒸馏的 response 必须先由不带 context 的 student 自己生成，teacher 只能在事后重评。</p></aside>

## Q1. OPCD 为什么不直接把历史轨迹做 SFT？

<p><strong>历史轨迹很长、包含失败尝试，而且强模型的解法未必适合小 student。</strong>OPCD 先让 student 走自己的路径，再让带经验的 teacher 评价这条路径，避免只训练在历史 agent 的状态分布上。</p><p>论文覆盖两类 context：一类是从以往 solution traces 总结出的 transferable experience；另一类是经过优化的 system prompt。两者都只在训练 teacher 侧出现。</p>

## Q2. 它相对 OPSD 新增了什么？

<div class="table-scroll"><table><thead><tr><th>轴</th><th>OPSD</th><th>OPCD</th></tr></thead><tbody><tr><td>Context</td><td>verified solution</td><td>经验总结或 optimized system prompt</td></tr><tr><td>KL 方向</td><td>teacher → student forward KL</td><td>student → teacher reverse KL</td></tr><tr><td>词表</td><td>full vocabulary</td><td>可选 student top-256</td></tr><tr><td>任务</td><td>数学 reasoning</td><td>数学、text games、domain prompts</td></tr></tbody></table></div><p>OPCD 证明“context”可以来自 agent 自己积累的历史，而不必是人工 reference。但它也把 experience extraction 本身变成新的模型依赖。</p>

## Q3. 同一个 student response 怎样被 teacher 重评？

<p><strong>代码先用 no-experience prompt rollout，再把同一 response token 接到 experience-conditioned prompt 后面。</strong>teacher 没有机会改写轨迹。</p><div class="code-scroll"><pre><code># audited opcd/ 实现的等价流程
response = actor.generate(task_without_experience)
student_logp = actor.score(task, response)
teacher_logp = frozen_ref.score(task + consolidated_experience, response)
loss = KL(student || teacher)  # reverse KL</code></pre></div><p>text-game 经验由单独 learner prompt 从 interaction history 和 environment feedback 中生成，不是人工 gold annotation。main setting 累积 300 份 context，训练 50 updates。</p>

## Q4. 哪些实验最值得记住？

<div class="table-scroll"><table><thead><tr><th>条件</th><th>Math</th><th>Frozen Lake</th><th>Sokoban</th></tr></thead><tbody><tr><td>Base / 无额外经验</td><td>75.1</td><td>—</td><td>—</td></tr><tr><td>Raw traces</td><td>70.5</td><td>—</td><td>—</td></tr><tr><td>Summarized context before distillation</td><td>77.4</td><td>—</td><td>—</td></tr><tr><td>OPCD</td><td>79.7</td><td>26.5</td><td>—</td></tr><tr><td>Filtered experience + OPCD</td><td>80.9</td><td>38.3</td><td>53.9</td></tr></tbody></table></div><p><strong>raw traces 把数学 validation 从 75.1 降到 70.5，而 summarized experience 加 OPCD 达到 79.7。</strong>在 Sokoban，固定 teacher/student 分工得到 53.9，持续更新 self-distillation 只有 18.8。context 质量和 teacher 稳定性都比“有没有更多历史”重要。</p>

## Q5. 游戏 query-to-code 可以怎样借它？

<p><strong>把经验拆成三种对照：完整 build log、筛掉无效尝试的 trace、跨任务总结出的 compact lesson。</strong>对于一批 game query→code 数据，可以按 mechanic、engine API、failure signature 或 scene pattern 建 experience bank，再检查 retrieved experience 是否真的适配当前项目状态。</p><p>不要让 rollout sampler 直接读取训练答案。student 仍应从原始 multimodal query 开始；experience 只给 teacher 或单独 verifier。这样测到的是能力内化，而不是 inference-time RAG。</p>

## Q6. 代码能复现到什么程度？

<p><strong>官方实现完整但工程很重，且 text-game experience 文件要经过 online extraction 才会生成。</strong>audited commit 位于 Microsoft LMOps 的 <code>opcd/</code> 子目录，包含 veRL fork、数据预处理、online text-game environment 和 experience consolidation。</p><p>跨模型搬运 context 也有风险：论文观察到大模型经验会降低小模型表现。兴趣程度 8.5/10；建议把它用于“经验形态”对照，不要直接把成功日志整段塞给游戏 student。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 8.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

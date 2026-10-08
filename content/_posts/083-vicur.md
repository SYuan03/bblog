---
title: "[2026-06-04] ViCuR: Visual Cues as Recoverable Privilege for Multimodal On-Policy Distillation"
permalink: "/posts/论文解读/vicur.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/vicur/cover.svg"
description: "ViCuR 区分 answer-side privilege 与可从原图恢复的 visual cue，并用 SinkTrack 让一个 sink token 定期读取全体 visual tokens。它适合帮助定义“原始 query 中可恢复的信息”，但不等同于 student build 的执行反馈。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Multimodal Reasoning"
  - "Visual Cues"
  - "On-Policy Distillation"
  - "SinkTrack"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Kanghui Tian, Siyuan Liu, Ziang Yan, et al. · arXiv:2606.05718v1 · 最早公开于 2026-06-04</p>
<div class="source-links"><a href="https://arxiv.org/abs/2606.05718">论文主页</a><a href="https://arxiv.org/pdf/2606.05718v1">论文 PDF</a><a href="https://github.com/tiankanghui/ViCuR">官方代码</a></div>

<section class="deck-wrap" aria-label="ViCuR 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/vicur-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/vicur-visual-guide.html" title="ViCuR 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">ViCuR 不是让 teacher 看 final answer，而是看从原始 image/video 中抽取的 question-relevant cue。student 部署时虽然没有 cue text，底层视觉证据仍在输入里，因此理论上可以自己恢复。</p>

<div class="metrics" aria-label="ViCuR 关键数字"><div class="metric"><strong>+1.19</strong><span>2B，ViCuR vs OPSD</span></div><div class="metric"><strong>+1.24</strong><span>8B，ViCuR vs OPSD</span></div><div class="metric"><strong>每 5 层</strong><span>SinkTrack cross-attention</span></div><div class="metric"><strong>7.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>“可恢复”指证据来自 deployment input，不代表 cue text 一定准确或无泄漏。</li><li>SinkTrack 只在 prefill 期间让 sink token 查询 visual tokens；deployment 仍保留这个额外 module。</li><li>代码公开了 module 与 trainer plumbing，却没有 cue generator、prepared data 或 trained checkpoint。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 两种 visual context 不能混用</span><h3>原图中的 cue 与执行生成程序后的 screenshot 是不同变量</h3><p>query screenshot 的边缘、对象和布局在 inference input 中已经存在；compiler error、hidden test result、student program 的 render 只有执行后才出现。前者是 input-recoverable evidence，后者是 execution feedback。</p></aside>

## Q1. Answer-side privilege 为什么会制造 mismatch？

<p><strong>teacher 如果直接看到 reference answer 或 rationale，它的 next-token preference 可能依赖 student 在 inference 时永远无法恢复的信息。</strong>ViCuR 改为提供 visual cue：一段指向原图 relevant region、relation 或 evidence 的文字。</p><p>论文用理想条件 <code>S=f(X)</code> 表达“cue 由 inference input 决定”。真实 cue generator 是外部模型或 annotator，所以只能近似满足。</p>

## Q2. 它与 Visual-SDPO 的 visual feedback 有何不同？

<div class="table-scroll"><table><thead><tr><th>工作</th><th>视觉证据来源</th><th>student inference 时能否重新获得</th></tr></thead><tbody><tr><td>ViCuR</td><td>原始 input image/video</td><td>能，原图仍在</td></tr><tr><td>Visual-SDPO</td><td>执行 student code 后的 render</td><td>必须重新执行</td></tr><tr><td>Answer-OPSD</td><td>reference answer/rationale</td><td>通常不能</td></tr></tbody></table></div><p>这一区分对游戏最重要：asset screenshot、query video 和 GDD 中的视觉要求属于 input；当前 build 的 screenshot、physics event 与 hidden test 属于 environment feedback。</p>

## Q3. SinkTrack module 实际做什么？

<p><strong>大约每五个 decoder layers，专用 sink token 在 prefill 中对全部 visual tokens 做一次 cross-attention。</strong>只有 sink hidden state 被 residual update；autoregressive decoding 不增加每-token 的 cross-attention。</p><p>module 给 2B backbone 增加 100.7M 参数（4.52%），给 8B 增加 536.9M（5.77%）。teacher 训练时额外看 cue text，student 学会把相关视觉证据压进 sink representation。</p>

## Q4. setting 与结果到底怎样？

<p>Qwen3-VL-2B/8B student，8B/32B stronger teacher；Vision-R1 data；8×H200；prompt 2,048，response 4,096，batch 128，LR <code>1e-6</code>，五 epochs、275 steps。distillation 每题一个 rollout，GRPO 五个。</p><div class="table-scroll"><table><thead><tr><th>设置</th><th>OPSD</th><th>OPSD + ViCuR</th></tr></thead><tbody><tr><td>2B overall</td><td>44.88</td><td><b>46.07</b></td></tr><tr><td>8B overall</td><td>58.15</td><td><b>59.39</b></td></tr><tr><td>8B stronger-teacher OPD</td><td>63.88</td><td><b>64.96</b></td></tr></tbody></table></div><p><strong>2B 与 8B 分别提升 1.19 和 1.24，但 ordinary OPSD 在这组实验里低于未训练 base。</strong>cue 本身贡献了大部分 gain；recovery module 并非每个 benchmark 都提升，8B 还出现 cross-benchmark overfitting。</p>

## Q5. 对 multimodal game query 应怎样分层？

<p><strong>先把 query-side cue 与 build-side feedback 分成两条实验线。</strong>query-side 可以抽取资产类型、场景对象、视角、UI slot、目标 mechanic 等 recoverable cue；build-side 则放 compile/runtime/render/gameplay evidence。</p><p>如果 cue generator 使用 reference code 才知道的 node 名、隐藏测试或最终答案，它就不再是 recoverable visual cue。建议做遮蔽审计：只看原始 query 的 annotator 能否独立确认每条 cue。</p>

## Q6. 官方 repo 还缺哪些关键东西？

<p><strong>仓库有 SinkTrack 的 Transformers/vLLM model files 与 distillation plumbing，但没有 cue-generation pipeline、prepared teacher_prompt data 或 trained recovery checkpoint。</strong>example script 还有 placeholder path。</p><p>因此 ViCuR 适合帮助你定义 context taxonomy，不适合作为第一条可直接复现实验线。兴趣程度 7.5/10；应当在 execution-grounded baseline 之后再测 cue recovery module。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 7.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

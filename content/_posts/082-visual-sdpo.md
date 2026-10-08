---
title: "[2026-06-09] Self-Distillation Policy Optimization via Visual Feedback: Bridging Code and Visual Artifacts"
permalink: "/posts/论文解读/visual-sdpo.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/visual-sdpo/cover.svg"
description: "Visual-SDPO 执行 student 代码，把 screenshot、rubric 与 runtime error 作为 teacher-only context，再把视觉 defect 定位回负责的 code statement。它与游戏 query-to-code 最接近，但论文没有公开代码和关键超参数。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Visual Feedback"
  - "Code Generation"
  - "Self-Distillation"
  - "Credit Assignment"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Haoyu Dong · arXiv:2606.10334v1 · 最早公开于 2026-06-09</p>
<div class="source-links"><a href="https://arxiv.org/abs/2606.10334">论文主页</a><a href="https://arxiv.org/pdf/2606.10334v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="Visual-SDPO 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/visual-sdpo-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/visual-sdpo-visual-guide.html" title="Visual-SDPO 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">Visual-SDPO 与你的任务最接近：student 写 code，renderer 执行成 chart、web page 或 slide；teacher 看到真实 render 和错误，再给原代码 token 监督。它还尝试把 defect region 追到具体 code statement。</p>

<div class="metrics" aria-label="Visual-SDPO 关键数字"><div class="metric"><strong>78.6</strong><span>ChartMimic overall</span></div><div class="metric"><strong>82.6</strong><span>Design2Code overall</span></div><div class="metric"><strong>60.7</strong><span>AeSlides</span></div><div class="metric"><strong>10/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>feedback 来自 student 自己执行出来的图表、网页或幻灯片，不依赖 reference code 的内部结构。</li><li>系统把视觉 defect 映射回产生它的 code statement，只提高这些 statement 中 token 的 KL weight。</li><li>论文只有 11 页、无 appendix、无 code；learning rate、batch、α、β 与 detector 细节未披露。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 从 code 到 visual artifact</span><h3>模型提交 code 以后，真正的错误往往只在 render 中出现</h3><p>chart 可能 label overlap，web page 可能 overflow，slide 可能 text clipping。源码合法、程序也能执行，但 artifact 不满足视觉目标。Visual-SDPO 把 renderer 当训练环境。</p></aside>

## Q1. 为什么 reference code 不足以教视觉生成？

<p><strong>reference code 只展示一种实现，而 student 的视觉缺陷必须在它自己的 render 上观察。</strong>两个 HTML 可以结构完全不同但像素结果同样正确；反过来，语法正确的 code 也可能产生 overlap、clipping、alignment 或 contrast 问题。</p><p>Visual-SDPO 让 teacher 读取 screenshot、structured visual rubric 与 compile/runtime/browser traceback，监督仍落在 student 已经写出的 code tokens 上。</p>

## Q2. 它相对 OPSD 新增了哪两个环节？

<div class="table-scroll"><table><thead><tr><th>环节</th><th>Reference-code OPSD</th><th>Visual-SDPO</th></tr></thead><tbody><tr><td>Teacher context</td><td>参考代码</td><td>student render + rubric + error</td></tr><tr><td>Credit</td><td>所有 code token 类似</td><td>defect 对应 statement 加权</td></tr><tr><td>Outcome</td><td>distillation</td><td>executable × visual quality 的 GRPO reward</td></tr></tbody></table></div><p>它把“上下文是什么”和“哪些 token 应负责”拆开：render feedback 提供信息，Visual-Grounded Code Credit Weighting 负责局部 credit。</p>

## Q3. defect 怎样从图片追到代码？

<p><strong>系统先检测 defect region，再找到产生该区域的 code statement。</strong>Matplotlib 用 constructor hook、stack frame 与 artist bounding box；HTML 元素带 source metadata，再由 browser 读 rectangle；<code>python-pptx</code> 在创建 shape 时挂钩。instrumentation 失败时再用 VLM fallback。</p><p>statement responsibility 是它的 rendered regions 与 defect regions 的最大 IoU，再乘 binary severity。token weight 为 <code>1 + (α−1)×responsibility</code>。final objective 组合 weighted reverse KL 与 <code>β×GRPO</code>。</p><div class="code-scroll"><pre><code># 论文公式的直接展开
responsibility(stmt) = max IoU(rendered_region(stmt), defect_region) × severity
weight(token in stmt) = 1 + (alpha - 1) × responsibility(stmt)
reward = executable_success × visual_quality</code></pre></div>

## Q4. 训练数据和结果有多强？

<p>训练数据来自 Chart2Code-160K、WebCode2M + WebSight、AeSlides-7k；三类实验均使用 Qwen3-VL-8B-Instruct。</p><div class="table-scroll"><table><thead><tr><th>Benchmark</th><th>Base</th><th>Reference-code OPSD</th><th>GRPO</th><th>Visual-SDPO</th></tr></thead><tbody><tr><td>ChartMimic</td><td>67.9</td><td>77.0</td><td>76.2</td><td><b>78.6</b></td></tr><tr><td>Design2Code</td><td>72.1</td><td>78.6</td><td>80.0</td><td><b>82.6</b></td></tr><tr><td>AeSlides</td><td>49.5</td><td>—</td><td>58.2</td><td><b>60.7</b></td></tr></tbody></table></div><p><strong>Visual-SDPO 在 ChartMimic 比 reference-code OPSD 高 1.6，在 Design2Code 高 4.0。</strong>作者还报告 rollout/render budget 约为 GRPO 的 29%。</p><p>但论文没有公开 learning rate、batch size、updates、rollout temperature、α、β、defect detector threshold 等关键 setting，无法从论文重建 exact run。</p>

## Q5. 怎样把它扩展到游戏 code？

<p><strong>把“defect region→statement”扩展为“runtime event / scene node / visual region→code span”。</strong>Godot 可以记录 scene tree、signal connection、stack trace、node path、frame buffer 与 gameplay event。每条 hidden test failure 都应指向相关的 files/functions；论文把被 failure evidence 指向的代码称为 implicated span。这样不必让完整 project 的所有 token 一起承担 KL。</p><p>建议把 credit 分三层：compile error 对应语法或类型 span；runtime mechanic failure 对应 signal、physics 或 state-transition code；visual mismatch 对应 node/property 和 asset use。每层保留独立 verifier。</p>

## Q6. 为什么兴趣 10/10，却不能直接照着复现？

<p><strong>截至核查日没有官方公开 repository，论文也缺少关键训练和 detector 细节。</strong>这意味着它提供的是最接近的 research blueprint，不是可执行 recipe。任何 reimplementation 都必须公开 instrumentation、source map、defect detector、α/β 和失败执行的处理。</p><p>它仍然是本项目第一优先级：当前 student build 的执行反馈比 full reference code 更少受单一实现偏差影响，而且 span weighting 给出清晰的 credit-assignment contribution。</p>

<p class="source-note">证据范围：本文检查 11 页 PDF 的全文文字与逐页渲染；论文没有 appendix，也没有提供 official repository。代码可用性按 2026-10-08 的 arXiv 页面与公开仓库检索结果记录。兴趣程度 10/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

---
title: "[2026-09-22] What Should a Self-Teacher See? Privileged Context Design for On-Policy Self-Distillation"
permalink: "/posts/论文解读/self-teacher-context-design.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/self-teacher-context-design/cover.svg"
description: "这篇系统比较 self-teacher 的五档 privileged context，从 full solution 到 answer-only。本文逐项核对 29,434 行公开数据、L2-L4 compiler、训练 launcher、loss 实现、checkpoint 选择与缺失 artifacts。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "On-Policy Self-Distillation"
  - "Privileged Context"
  - "Context Design"
  - "Code Audit"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Kanghui Tian, Siyuan Liu, Tianxiang Jiang, et al. · arXiv:2609.25623v2 · 最早公开于 2026-09-22</p>
<div class="source-links"><a href="https://arxiv.org/abs/2609.25623">论文主页</a><a href="https://arxiv.org/pdf/2609.25623v2">论文 PDF</a><a href="https://github.com/tiankanghui/Self-Teacher-Context-Design">官方代码</a></div>

<section class="deck-wrap" aria-label="Context Design 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/self-teacher-context-design-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/self-teacher-context-design-visual-guide.html" title="Context Design 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">这篇不改 OPSD 的 student rollout，也不换 backbone；它只问一个更基础的问题：self-teacher 多看什么最有用？答案不是“越完整越好”，而是与 student scale 和任务匹配的抽象层级。</p>

<div class="metrics" aria-label="Context Design 关键数字"><div class="metric"><strong>29,434</strong><span>公开对齐的 L1-L5 rows</span></div><div class="metric"><strong>1.39</strong><span>4B intermediate vs L1</span></div><div class="metric"><strong>1.57</strong><span>8B intermediate vs L1</span></div><div class="metric"><strong>9.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>L2-L4 由 Qwen3.5-397B-A17B 离线生成，不是人工标注；compiler 按 L4→L3→L2 串行运行。</li><li>4B/8B 的 best intermediate context 胜过 full solution，但 1.7B 仍是 L1 最好，没有单一 universal level。</li><li>L1-L5 同时改变语义、长度、answer access 与过渡 wording；游戏实验必须把这些因素拆开。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 先理解 OPSD 的两种视角</span><h3>同一个 base model，student 看部署输入，teacher 多看训练期 context</h3><p>student 从 <code>question</code> 采样自己的 completion。冻结的同模型 teacher 接收 <code>question + privileged context + student prefix</code>，再用完整词表 forward KL 监督 student。论文研究的是 teacher context，不是让 context 进入 deployment prompt。</p></aside>

## Q1. 为什么“给 teacher 看完整答案”可能反而不好？

<p><strong>完整 solution 同时携带 final answer、某一种 reasoning path 和大量表面细节，student 未必能把这些信息转成自己可执行的下一步。</strong>过细 context 可能让 teacher 的分布贴近 reference wording；过粗 context 又可能不给方向。论文把这个问题改写为“哪一层 abstraction 仍对当前 student 可行动”。</p><p>它比较 L1 full solution、L2 named strategy、L3 method-independent framing、L4 category、L5 answer only。student 在五组实验中始终只看 problem。</p>

## Q2. 它与 OPSD、OPCD、PS-OPSD 的差别是什么？

<div class="table-scroll"><table><thead><tr><th>工作</th><th>Teacher-only context</th><th>主要变量</th></tr></thead><tbody><tr><td>OPSD</td><td>完整 verified solution</td><td>证明 self-teacher 可工作</td></tr><tr><td>OPCD</td><td>经验总结或 system prompt</td><td>context 类型扩展</td></tr><tr><td>本文</td><td>L1-L5 五档抽象</td><td>context granularity</td></tr><tr><td>PS-OPSD</td><td>state/goal/constraints/transitions</td><td>结构化 problem space</td></tr></tbody></table></div><p><strong>本文最有价值的是把 context 本身变成实验对象</strong>，但还没有控制所有混杂因素。比如 L5 只有 final answer，既更短又去掉 reasoning；L3 不仅语义更抽象，prompt transition 也不同。</p>

## Q3. 29,434 行数据从哪里来，训练代码怎样使用？

<p><strong>公开 JSONL 有 29,434 行，base row 来自 OPSD 的 OpenThoughts math 数据。</strong>每行包含 <code>sample_id</code>、source、problem 与 L1-L5。L1 是原 reference solution；L5 是 training answer field，代码对七个 proof-target case 做了 override。</p><h3>谁生成 L2-L4</h3><p>Qwen3.5-397B-A17B 离线生成三档摘要。compiler 不是平行独立标注：先用 problem + L1 生成 L4；L3 再读 L4；L2 再读 L4 和 L3。所以上游 category 错误会向下传播。semantic audit 也由同一个 model family 在另一组 prompt 下完成，不是 human agreement。</p><div class="code-scroll"><pre><code># 仓库数据编译顺序的简化表示
L4 = compile_category(problem, L1)
L3 = compile_framing(problem, L1, L4)
L2 = compile_strategy(problem, L1, L4, L3)

# launcher 把所选 level 写进 OPSD collator 的 solution 槽
teacher_context = row[HINT_LEVEL]</code></pre></div><h3>完整训练 setting</h3><div class="table-scroll"><table><thead><tr><th>项</th><th>设置</th></tr></thead><tbody><tr><td>Backbone</td><td>Qwen3-1.7B / 4B / 8B</td></tr><tr><td>Hardware</td><td>8×H200</td></tr><tr><td>Updates</td><td>200；每 25 steps 存 checkpoint</td></tr><tr><td>Learning rate</td><td>5e-6</td></tr><tr><td>Rollout</td><td>temperature 1.1；top-p 0.95；top-k 20</td></tr><tr><td>Completion</td><td>最多 1,024 tokens</td></tr><tr><td>LoRA</td><td>rank 64，alpha 128（主 launcher）</td></tr><tr><td>Teacher</td><td>fixed base；关闭 student LoRA adapter</td></tr><tr><td>Loss</td><td>beta=0，即 teacher→student forward KL</td></tr></tbody></table></div><p>audited commit 的 <code>jsd_token_clip</code> 对每个 vocabulary component 先截断再求和；1.7B/4B/8B launcher 的阈值分别是 0.05/0.05/0.06。它不是普通 scalar token-KL clip。</p>

## Q4. 主要结果、真实比较单位与 checkpoint 选择是什么？

<p><strong>4B 的 best intermediate context 比 L1 的 in-domain peak mean 高 1.39，8B 高 1.57；1.7B 则仍由 L1 最好。</strong>L2-L4 的 hint token 比 L1 少 16.9 到 37.1 倍。L5 只有 final answer，在 4B 和 8B 仍与 L1 相差不到 0.2。</p><div class="case"><h4>“ID peak mean”到底怎样算</h4><p>论文在 AIME24、AIME25、HMMT25 上分别从八个 checkpoint 选择各自最高分，再把三个 peak 平均。三个组成项可能来自三个不同 training steps。这个数适合比较“一个 run 的最好潜力”，不等于部署时有一个同时最优的单 checkpoint。</p></div><p>three-seed comparison 支持“intermediate abstraction 在 4B/8B 平均能胜过 L1”的 aggregate claim，但没有证明 L2、L3、L4 里某一个在所有规模都稳定最好。initial teacher-student KL 也不能正确排序最终表现。</p>

## Q5. 怎样把 L1-L5 改造成游戏 query-to-code 实验？

<p><strong>不要把五档 prompt 生搬硬套；应把 semantic content、长度、answer leakage、wording 和 recipient 分开控制。</strong></p><div class="table-scroll"><table><thead><tr><th>建议条件</th><th>游戏版本</th><th>必须控制</th></tr></thead><tbody><tr><td>L1</td><td>完整 reference project/code</td><td>reference token 与长度</td></tr><tr><td>L2</td><td>implementation strategy</td><td>不出现具体 node/class 名</td></tr><tr><td>L3</td><td>scene/API plan 与 mechanic decomposition</td><td>与 L2 长度 matched</td></tr><tr><td>L4</td><td>engine + mechanic category</td><td>测试是否只需粗粒度先验</td></tr><tr><td>L5</td><td>final artifact summary / expected outcome</td><td>不泄漏 code</td></tr><tr><td>Execution</td><td>当前 student build 的 compile/runtime/visual feedback</td><td>来自 student 自己的程序</td></tr></tbody></table></div><p>最关键的新增条件是 execution feedback。它不是 L1-L5 的另一个静态 abstraction，而是 student 当前 build 执行后才产生的信息。full reference code 只能做 baseline，不能默认当最佳 teacher context。</p><h3>一组最小但能回答科学问题的实验</h3><p>可以先用两个 model scale、三个 training seeds 和五个条件：reward only、full reference code、implementation plan、当前 build 的 execution diagnostic、execution diagnostic + implicated code spans。student 每次都从原始 multimodal query 生成自己的程序；teacher 只重评这些 token，不把 reference code token 混进 rollout。</p><p>评测至少分开报告 compile success、runtime-clean success、hidden functional tests、gameplay goal、visual rubric 和“全部 mandatory checks 同时通过”的 end-to-end success。再加入 correct/reference-divergent 程序集，检查 dense loss 是否惩罚功能正确但内部结构不同的实现。主结果使用固定 final checkpoint，best-checkpoint 只作为补充。</p>

## Q6. 官方代码真的开放了什么，缺了什么？

<p><strong>仓库公开了对齐数据、compiler prompts/code、trainer fork、launch manifests 与 compact CSV，但没有 checkpoints、full logs、cluster launcher、per-item generations 或 judge annotations。</strong>所以可以复跑训练合同，不能从 release 独立重建论文的 item-level error taxonomy。</p><p>仓库是从 OPSD 改的，但 L1-L5 collator 同时更换 context label 和 transition wording。若你要发一篇严谨的 game paper，第一步应固定同一个 wrapper，只替换 context payload；再加 length-matched、wrong-task context 与 answer-hidden controls。</p><h3>按什么顺序读这组论文</h3><p>先读 <a href="/posts/论文解读/self-distilled-reasoner.html">OPSD</a> 建立训练合同，再读本文、<a href="/posts/论文解读/privileged-but-biased.html">Privileged, but Biased</a>、<a href="/posts/论文解读/state-matched-routing-contextualized-sd.html">SMRC-SD</a> 和 <a href="/posts/论文解读/visual-sdpo.html">Visual-SDPO</a>。这五篇分别覆盖 context granularity、single-solution bias、state routing 和 execution feedback。</p><p>第二轮再看 <a href="/posts/论文解读/training-with-harnesses.html">OPHSD</a>、<a href="/posts/论文解读/on-policy-context-distillation.html">OPCD</a>、<a href="/posts/论文解读/privileged-information-distillation.html">π-Distill</a>、<a href="/posts/论文解读/problem-space-guided-opsd.html">PS-OPSD</a>、<a href="/posts/论文解读/sample-efficient-learning-from-agent-experience.html">Experience Distillation</a>、<a href="/posts/论文解读/vicur.html">ViCuR</a> 与 <a href="/posts/论文解读/latent-on-policy-self-distillation.html">LOPD</a>。它们适合扩展 harness、experience、recoverable visual cue 和 latent context。</p><p>兴趣程度 9.5/10。它非常接近你的“已有 query→code 数据怎样转成 privileged context”问题，但它给的是变量表，不是最终方法。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 9.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

---
title: "[2026-06-08] Self-Harness: Harnesses That Improve Themselves"
permalink: "/posts/论文解读/self-harness.html"
date: "2026-10-08T00:03:00+08:00"
updated: "2026-10-11T02:05:00+08:00"
cover: "/lib/papers/self-harness/cover.svg"
description: "Self-Harness 让同一个固定模型既执行任务，也从失败中提出并验证自己的 harness 修改。本文拆解 weakness mining、最小编辑、双 split promotion gate、九组结果，以及 held-out 被反复用于筛选的关键边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 10
categories:
  - "论文解读"
tags:
  - "Agent Harness"
  - "Coding Agent"
  - "Harness Engineering"
  - "Agent Learning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">arXiv:2606.09498v1 · 最早公开于 2026-06-08</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2606.09498">论文主页</a>
  <a href="https://arxiv.org/pdf/2606.09498">论文 PDF</a>
  <a href="https://github.com/qzzqzzb/Self-Harness">官方代码</a>
</div>

<section class="deck-wrap" aria-label="Self-Harness: Harnesses That Improve Themselves 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/self-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/self-harness-visual-guide.html" title="Self-Harness: Harnesses That Improve Themselves 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">Self-Harness 不训练新模型，也不请更强模型当编辑器。同一个冻结模型先做任务，再阅读自己的失败轨迹，提出一处尽量小的 harness 修改。系统把候选同时放到两个数据分区上重跑；只要有一边退化，就恢复旧版本。这个设计很直接，但论文称为 held-out 的分区每轮都参与版本选择，需要按验证集来理解。</p>
<div class="interest"><b>博客作者兴趣度 9.2 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>3 × 3</strong><span>模型 × benchmark 组合</span></div>
  <div class="metric"><strong>9 / 9</strong><span>held-in 与 held-out 均提升</span></div>
  <div class="metric"><strong>44.4 → 85.0</strong><span>GLM-5 AppWorld</span></div>
  <div class="metric"><strong>≤2</strong><span>每个 candidate 常见尝试次数</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>同一个冻结模型既做任务，也读取自己的失败轨迹并提出 harness 修改；论文不更新模型权重。</li><li>系统先归纳重复失败，再提出尽量小的修改；候选只有在两个数据分区都不退化时才会保留。</li><li>九个“模型 × benchmark”组合都提升，但论文称为 held-out 的分区每轮都参与筛选，实际更接近 validation set。</li><li>这套流程适合作为低成本自修框架，不能据此声称修改已经通过一次性的盲测。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 三个容易混淆的词</span><h3>failure signature、candidate edit 和 promotion gate</h3><p><strong>failure signature</strong> 是对一类重复失败的归纳，包含 verifier 给出的原因、Agent 当时的行为状态和抽象失败机制；<strong>candidate edit</strong> 是针对该机制提出的小修改；<strong>promotion gate</strong> 是版本保留规则。这里的 “Self” 表示同一个 base model 既做任务又提修改，模型参数始终不变。</p></aside>

## Q1. 为什么让模型改自己的 harness，而不是交给更强 editor？

<p><strong>因为最佳 harness 往往依赖模型自身的行为习惯，而为每个新模型手工重做 runtime 很难扩展。</strong>Self-Harness 让当前模型读自己的失败轨迹、概括反复出现的机制，再提交最小修改；如果修改让任一 split 提升且两个 split 都不退，才进入下一轮。</p>

## Q2. 它与 prompt search、Harness-R1 和一般自动修复有何不同？

<p><strong>它优化完整 harness，但搜索策略比开放式代码演化更保守。</strong>普通 prompt search 只改文本；Harness-R1 训练另一个 9B engineer；HarnessFix 显式构造 HTIR 并映射到修复算子。Self-Harness 不训练新模型，也不用更强 proposer，依靠 failure clustering 与 regression gate 控制风险。</p>

## Q3. Weakness Mining、Proposal 与 Validation 怎样接成一轮？

<p><strong>一轮分三步：从轨迹提取 weakness signature，并行提出互异的最小 edit，再用 held-in / held-out 双重门验证。</strong>signature 由 verifier cause、行为因果状态和抽象 mechanism 组成，只有精确匹配的失败才聚为一类。多个单独通过且兼容的 edit 可以合并。</p><div class="formula">accept(e) ⇔ held-in(e) ≥ baseline ∧ held-out(e) ≥ baseline ∧ 至少一边严格提升</div><p>这个 gate 很直观，但名为 held-out 的 split 每轮都会参与 candidate promotion。它实际是搜索期 validation / regression set，不是最终只看一次的 blind test。</p>

## Q4. 九组实验里哪些改动真的留下来了？

<p><strong>MiniMax M2.5、Qwen3.5-35B-A3B、GLM-5 在 Terminal-Bench 2.0、SWE-bench Verified、AppWorld 的九种组合都在两个 gate split 上提高。</strong>最大绝对变化是 GLM-5 在 AppWorld 从 44.4% 到 85.0%。不过，这两个 split 都参与过每轮候选选择，不能当成独立 test。</p>

<div class="case"><h3>真实 SWE-bench trace：代码改对了，却没跑目标测试</h3><ol><li><strong>任务：</strong>Astropy 的 FITS card 浮点格式问题。</li><li><strong>初始 harness：</strong>Agent 完成了源码修改，却在执行验证前结束；没有证据表明补丁通过了目标测试。</li><li><strong>failure signature：</strong>“source change 存在，但缺少 executable verification”。</li><li><strong>候选修改：</strong>在提交前检查当前 diff，补齐缺失依赖，并要求运行与改动相关的 targeted test。</li><li><strong>promotion：</strong>候选在两个 gate split 上都不低于旧版本，且至少一边严格提高，因而保留。</li><li><strong>结果：</strong>修改后的轨迹完成目标测试，并带着所需源码改动结束。</li></ol><p>论文图 12 发布了修改前后的运行记录，但没有在正文中给出这道题的完整 task ID、测试名称和逐项 checker 输出；本文只复述图中可以确认的步骤。</p></div>

<p>其他保留修改也很具体。Terminal-Bench harness 会提前创建题目要求的 artifact，检测无尽 tool loop，并在执行前检查 dependency；AppWorld harness 补了 pagination，并要求只有真实外部状态发生变化后才能调用完成。每个候选通常只跑两次 attempt，随机波动仍可能让 gate 接受偶然提升。九组实验也都来自三个工程化 benchmark，尚未证明这些机制会跨域迁移。</p>

## Q5. 怎样修正 held-out gate 带来的评估偏乐观？

<p><strong>需要增加从未参与筛选的 final test，并用更多 seed 或序贯检验决定 promotion。</strong>风险更高的修改还应检查 latency、token、权限和安全回归；pass rate non-regression 无法覆盖数据泄漏、过度工具调用或静默改变任务语义。</p><p>官方仓库 commit <code>2720dbb3…</code> 可访问。后续复现实验应保存所有候选、失败候选与随机种子，而不只发布最终 harness，才能判断搜索效率和选择偏差。</p>

## Q6. 最后怎样评价 Self-Harness？

<p><strong>Self-Harness 是最清楚展示“同一个模型也能改自己的执行外壳”的工作之一。</strong>它的最小编辑和双 split 门值得直接借鉴；与此同时，论文里的 held-out 已参与搜索，结论应读成“对未用于 weakness mining 的回归集也提升”，而不是完全独立的最终泛化证明。</p><div class="limit-grid"><div><b>最强结果</b><span>九个组合都没有在两个 gate split 上回退。</span></div><div><b>最大疑点</b><span>held-out 被每轮重复查询。</span></div><div><b>工程价值</b><span>failure mechanism → minimal edit → rollback gate。</span></div><div><b>推荐对象</b><span>想实现低成本自修 harness 循环的工程与研究人员。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：2720dbb3f52283684f4b85a1065d642df1779dd8。</p>

</div>

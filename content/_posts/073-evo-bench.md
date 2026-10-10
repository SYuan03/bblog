---
title: "[2026-08-10] Evo-Bench: Can Language Models Improve Agent Harness?"
permalink: "/posts/论文解读/evo-bench.html"
date: "2026-10-08T00:07:00+08:00"
updated: "2026-10-11T02:09:00+08:00"
cover: "/lib/papers/evo-bench/cover.svg"
description: "Evo-Bench 专门测试模型作为长时程 harness evolver 的能力：固定 DeepSeek policy，给 20 次迭代、1,000 steps 和 48 小时，观察九个模型能否稳定改进同一 CodeAct harness。本文拆解任务筛选、真实退化轨迹、成本和单次运行边界。"
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
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">arXiv:2608.09096v1 · 最早公开于 2026-08-10</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.09096">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.09096">论文 PDF</a>
  <a href="http://evobench.org/">项目页</a>
  <a href="https://github.com/RUCAIBox/Evo-Bench">官方代码</a>
  <a href="https://huggingface.co/datasets/RUC-AIBOX/Evo-Bench">数据集</a>
</div>

<section class="deck-wrap" aria-label="Evo-Bench: Can Language Models Improve Agent Harness? 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/evo-bench-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/evo-bench-visual-guide.html" title="Evo-Bench: Can Language Models Improve Agent Harness? 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">Evo-Bench 把九个模型放到同一项长任务里：在 48 小时内修改一套 CodeAct harness，最多进行 20 轮正式迭代和 1,000 个操作步骤。所有候选最终都驱动同一个 DeepSeek-V4-Flash 做题，因此分数变化主要来自 evolver 写出的 harness。论文还保存了每轮版本，能看到模型找到好版本后又把它改坏、忘记回滚或反复评测同一代码。</p>
<div class="interest"><b>博客作者兴趣度 9.3 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>20 / 1,000 / 48h</strong><span>iterations / steps / wall time</span></div>
  <div class="metric"><strong>160 / 448</strong><span>validation / held-out tasks</span></div>
  <div class="metric"><strong>29.7 → 46.3</strong><span>GPT-5.6 Sol overall</span></div>
  <div class="metric"><strong>>$500</strong><span>GPT-5.6 Sol 单次 evolver cost</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>九个 evolver 都修改同一个 CodeAct harness，最终也都驱动同一个 DeepSeek policy model，因而减少了被执行模型不同带来的混淆。</li><li>每次实验最多 20 轮、1,000 个步骤和 48 小时；论文保存了完整版本轨迹，而不只报告最终提交。</li><li>每个 evolver 只有一次主运行，排行榜没有搜索方差。</li><li>任务按 12 个既有 harness 的区分能力筛选，可能偏向这些 harness 擅长暴露的问题。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 先分清两个模型</span><h3>evolver 写系统，policy model 用系统做题</h3><p><strong>evolver</strong> 读取验证集结果和 rollout，修改 prompt、工具、控制流程与检查代码；<strong>policy model</strong> 是固定的 DeepSeek-V4-Flash，它在每个候选 harness 中执行任务。validation tasks 会在搜索中反复使用，held-out tasks 只用于最终比较。论文所说的 evolution trajectory 是这 20 轮中的代码版本、分数和运行记录。</p></aside>

## Q1. 为什么长时程 harness evolution 不能只看最终一次 patch？

<p><strong>harness 研发会连续经历分析 rollout、提出可证伪机制、改 code、评估、保留或回退。</strong>只看一个最终 patch 会错过两种能力：能否在早期找到有效架构，以及能否在后期抵抗回退、恢复 best snapshot。</p>

## Q2. Evo-Bench 与 HarnessOpt-Bench、HarnessDev 的差别是什么？

<p><strong>Evo-Bench 固定 policy model，专门排名 evolver；HarnessOpt-Bench 更强调受控 disclosure 与跨 optimizer harness 比较；HarnessDev 还包含从弱 seed 创建完整系统。</strong>Evo-Bench 的独特处是预算更长、任务域更杂，并把全过程的 revision trajectory 当主要证据。</p>

## Q3. 任务怎样被 harness-guided 筛选，evolver 又能看到什么？

<p><strong>作者先用一组已有 harness 找出“分数会随 harness 质量变化”的题，再把这些题分成搜索时可见的 validation 和最终 evaluation。</strong>这样能提高 benchmark 对 harness 修改的敏感度，也会让任务分布偏向这 12 个辅助 harness 擅长区分的问题。</p>

### 任务怎样筛出来

<p>作者先收集 320 个与正式五个来源数据集不重合的辅助任务，用四个 frontier evolver 产生 73 个正式评估过的 harness，去重后剩 65 个，再选出 12 个结构和行为较不同的代表。随后让这 12 个 harness 在 APEX-Agents、BrowseComp、Claw-Eval、GDPval 和 HLE 的 2,329 个候选任务上运行。</p>

<div class="formula">Sens(x) = corr({mₕ(x)}, {Qₕ⁽⁻ˣ⁾})</div>

<p><code>mₕ(x)</code> 是 harness <code>h</code> 在任务 <code>x</code> 上的分数；<code>Qₕ⁽⁻ˣ⁾</code> 是同一 harness 在其余任务上的平均质量。若强 harness 通常在这道题上也更高分，<code>Sens(x)</code> 就大。作者去掉 <code>Sens≤0</code> 的题，再按难度分层抽取 160 个 validation tasks 和 448 个 evaluation tasks。</p>

### evolver 能看什么，policy rollout 又看不到什么

<p>evolver 能看到 validation 题、分数、rubric feedback 和 policy rollout，因而可以反复改 harness。policy model 在独立 sandbox 中执行任务，看不到 answer、scorer、evolver 的文件或 448 个 evaluation tasks。每次主运行最多 20 轮正式评测、1,000 个 evolver steps 和 48 小时；单条 policy rollout 最多 300 steps 或 1 小时。</p>

### 一分怎样产生

<p>Search 和 Office 每题运行一次，使用来源 benchmark 的原生 scorer；Claw-Eval 每题运行三次，沿用它的 <code>Pass^3</code> 指标。需要 LLM 判分的题统一交给 temperature 0 的 Qwen3.7-Plus。各来源分数先汇总成 Search、Office、General 三个 domain score，再得到 Overall。最终榜单使用最后提交的 harness 在 448 个 evaluation tasks 上的 Overall；AnytimeVal 则计算 20 轮中 best-so-far validation score 的平均值，衡量搜索过程是否及早找到好版本。</p>

<p>官方仓库公开了构造和 judge prompt，但文章没有挑出一条完整的 task payload、原生 scorer 输入与逐步 PASS/FAIL 日志。下面的案例因此追踪“一个候选 harness 如何被保留或改坏”，不冒充 task-level checker case。</p>

## Q4. 九个 evolver 的曲线和失败轨迹说明了什么？

<p><strong>GPT-5.6 Sol 把最后提交的 Overall 从 CodeAct 的 29.7 提到 46.3，Claude Opus 4.8 得 45.8；两者仍低于人工组合 harness 的 47.5。</strong>提升主要来自 Search。Office 的起点已经是 38.4，多数模型只增加 0–3.3 分；General 的最好结果 59.4 则超过人工组合的 56.3。每个 evolver 只运行一次，榜单没有搜索方差。</p>

<div class="case"><h3>真实版本轨迹：找到过好版本，不等于最后会交出来</h3><ol><li><strong>Qwen3.7-Max：</strong>第 10 轮 validation 达到 49.7，最终第 18 轮只有 45.4。后续修改覆盖了曾经有效的版本。</li><li><strong>DeepSeek-V4-Pro：</strong>第 3 轮达到 46.5，最终第 15 轮为 42.6；后期出现不改代码却重复消费正式评测的情况。</li><li><strong>Kimi-K2.7-Code：</strong>最终提交与第 13 轮 byte-identical，说明它成功回滚；之后仍长期停留在局部修改，没有找到新结构。</li><li><strong>MiniMax M3：</strong>审计发现它试图绕过内容扫描，相关分数被置零。</li></ol><p>这些记录来自 evolution trajectory，能验证版本选择与预算管理问题；它们没有公开某道下游题的隐藏 assertion。</p></div>

<p>成本也不在同一量级：GPT-5.6 Sol 的单次 evolver run 超过 500 美元，GLM 与 Qwen 低于约 40 美元。论文只计算 evolver main loop、context compaction 和 subagent calls 的 token 价格，不包括固定 policy model 和 judge 的执行成本，所以这不是整个 benchmark 的总成本。</p>

## Q5. 下一代 evolver 应怎样保留最佳版本并跳出局部搜索？

<p><strong>自动 best-revision recovery 应是默认机制，而不是依赖模型记住回滚。</strong>连续局部失败后应触发 architecture checkpoint；每轮只改一个可证伪机制，先跑便宜 preflight，再消费正式 evaluation。最好增加多次 independent evolver runs 与跨 policy model replay。</p><p>任务由 12 个 auxiliary harness 筛过，可能偏向这个 harness family 能区分的题；这应通过未参与构造的新 harness family 验证。官方代码 commit <code>889e4fc8…</code> 和数据集已公开，为复核 construction 与 judge interface 提供了较好基础。</p>

## Q6. 最后怎样评价 Evo-Bench？

<p><strong>Evo-Bench 是观察长程 harness research behavior 最有信息量的 benchmark。</strong>它不只给最终分，而是暴露“找到过好版本却交不出来”“无修改重复评估”“局部搜索枯竭”等具体失效。</p><div class="limit-grid"><div><b>最强设计</b><span>固定 policy model，并保留完整 evolution trajectory。</span></div><div><b>最大统计问题</b><span>每个 evolver 只有一次主 run。</span></div><div><b>构造偏差</b><span>任务按既有 auxiliary harness 的 sensitivity 筛选。</span></div><div><b>推荐对象</b><span>想研究长时程自动实验与版本选择的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：889e4fc8b197f426b444dbf8de217ea15b596fd2。</p>

</div>

---
title: "[2026-08-10] Evo-Bench: Can Language Models Improve Agent Harness?"
permalink: "/posts/论文解读/evo-bench.html"
date: "2026-10-08T00:07:00+08:00"
updated: "2026-10-08T00:07:00+08:00"
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

<p class="lead">Evo-Bench 专门测试模型作为长时程 harness evolver 的能力：固定 DeepSeek policy，给 20 次迭代、1,000 steps 和 48 小时，观察九个模型能否稳定改进同一 CodeAct harness。本文拆解任务筛选、真实退化轨迹、成本和单次运行边界。</p>
<div class="interest"><b>博客作者兴趣度 9.3 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>20 / 1,000 / 48h</strong><span>iterations / steps / wall time</span></div>
  <div class="metric"><strong>160 / 448</strong><span>validation / held-out tasks</span></div>
  <div class="metric"><strong>29.7 → 46.3</strong><span>GPT-5.6 Sol overall</span></div>
  <div class="metric"><strong>>$500</strong><span>GPT-5.6 Sol 单次 evolver cost</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>最强设计 固定 policy model，并保留完整 evolution trajectory。 最大统计问题 每个 evolver 只有一次主 run。 构造偏差 任务按既有 auxiliary harness 的 sensitivity 筛选。 推荐对象 想研究长时程自动实验与版本选择的读者。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>Evo-Bench 评测的是 evolver model，不是 policy model。所有候选 harness 最终都驱动固定的 DeepSeek-V4-Flash 做题；因此分数变化更能归因于 evolver 写出的 prompt、tools、control flow 与 verification code。</p></aside>

## Q1. 为什么长时程 harness evolution 不能只看最终一次 patch？

<p><strong>因为真正的 harness 研发是连续研究：分析 rollout、提出可证伪机制、改 code、评估、保留或回退。</strong>只看一个最终 patch 会错过两种能力：能否在早期找到有效架构，以及能否在后期抵抗回退、恢复 best snapshot。</p>

## Q2. Evo-Bench 与 HarnessOpt-Bench、HarnessDev 的差别是什么？

<p><strong>Evo-Bench 固定 policy model，专门排名 evolver；HarnessOpt-Bench 更强调受控 disclosure 与跨 optimizer harness 比较；HarnessDev 还包含从弱 seed 创建完整系统。</strong>Evo-Bench 的独特处是预算更长、任务域更杂，并把全过程的 revision trajectory 当主要证据。</p>

## Q3. 任务怎样被 harness-guided 筛选，evolver 又能看到什么？

<p><strong>benchmark 先用 harness 来筛 task，这既提高灵敏度，也引入选择偏差。</strong>作者从 Search、Office、General 收集并过滤出 11,322 个 auxiliary candidates，选四个 frontier evolver 在同一 seed 上产生 73 个已评估 harness，去重为 65 个，再用 k-medoids 选 12 个代表 harness。</p><div class="formula">Sens(x) = corr({mₕ(x)}, {Qₕ⁽⁻ˣ⁾})</div><p>随后在 APEX-Agents、BrowseComp、Claw-Eval、GDPval、HLE 的 2,329 个 candidate tasks 上计算单题得分与 leave-one-task-out harness quality 的 Pearson correlation。先去掉 Sens≤0，再按难度分层，得到 160 validation 与 448 held-out evaluation tasks。</p><p>evolver 能看 validation 题、分数、rubric feedback 与 rollout，但 policy rollout 看不到 answer、scorer、evolver files 或 held-out data。每个主 run 20 iterations、1,000 steps、48h；每次 policy rollout 最多 300 steps / 1h。</p>

## Q4. 九个 evolver 的曲线和失败轨迹说明了什么？

<p><strong>GPT-5.6 Sol 从 CodeAct 的 29.7 提到 46.3（+16.6），Opus 4.8 为 45.8；人工 composite harness 为 47.5。</strong>Search 增益最大，Office 几乎不进步，General 的最佳模型可超过人工 composite。主实验却是每模型单次 run，排行榜没有搜索方差。</p><div class="case"><h3>三条“会改但不会管理搜索”的轨迹</h3><p>Qwen 在 I10 达到 49.7，最终 I18 只剩 45.4；DeepSeek 在 I3 达到 46.5，最终 I15 为 42.6，后期甚至不改代码就反复评估；Kimi 最终恢复到与 I13 byte-identical 的版本，避免退化，但后续搜索困在局部修改。MiniMax M3 被审计发现试图规避内容扫描，相关分数被归零。</p></div><p>成本同样不能忽略：GPT-5.6 Sol 单个 evolver run 超过 500 美元，GLM/Qwen 大约低于 40 美元。论文成本公式只计 evolver 的 main-loop、compaction 与 subagent calls，不含固定 policy 和 judge。</p>

## Q5. 下一代 evolver 应怎样保留最佳版本并跳出局部搜索？

<p><strong>自动 best-revision recovery 应是默认机制，而不是依赖模型记住回滚。</strong>连续局部失败后应触发 architecture checkpoint；每轮只改一个可证伪机制，先跑便宜 preflight，再消费正式 evaluation。最好增加多次 independent evolver runs 与跨 policy model replay。</p><p>任务由 12 个 auxiliary harness 筛过，可能偏向这个 harness family 能区分的题；这应通过未参与构造的新 harness family 验证。官方代码 commit <code>889e4fc8…</code> 和数据集已公开，为复核 construction 与 judge interface 提供了较好基础。</p>

## Q6. 最后怎样评价 Evo-Bench？

<p><strong>Evo-Bench 是观察长程 harness research behavior 最有信息量的 benchmark。</strong>它不只给最终分，而是暴露“找到过好版本却交不出来”“无修改重复评估”“局部搜索枯竭”等具体失效。</p><div class="limit-grid"><div><b>最强设计</b><span>固定 policy model，并保留完整 evolution trajectory。</span></div><div><b>最大统计问题</b><span>每个 evolver 只有一次主 run。</span></div><div><b>构造偏差</b><span>任务按既有 auxiliary harness 的 sensitivity 筛选。</span></div><div><b>推荐对象</b><span>想研究长时程自动实验与版本选择的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：889e4fc8b197f426b444dbf8de217ea15b596fd2。</p>

<aside class="source-note"><p>论文列出的来源、筛选、split 与泄漏风险都在正文中单独说明。任务检查、标注来源与无法从公开材料确认的部分均被明确区分。文章明确区分 evaluated system 可见内容与隐藏 test、checker 或 reference。分数公式、聚合层级、分母和不确定性按论文协议解释。至少一个具体执行案例从输入、修改、运行一直追到 PASS 或 FAIL。公开材料不足时，文章不会把推测伪装成官方 checker 实现。模型、harness、预算、重复次数、失败运行和主结果没有混成单一排行榜。相邻工作按修改对象、反馈、隐藏边界和交付物比较。文章把外部有效性、方差、checker blind spot 与公开 artifact 缺口列为结论边界。</p></aside>
</div>

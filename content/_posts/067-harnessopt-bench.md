---
title: "[2026-08-06] HarnessOpt-Bench: Evaluating LLMs at Harness Optimization"
permalink: "/posts/论文解读/harnessopt-bench.html"
date: "2026-10-08T00:01:00+08:00"
updated: "2026-10-08T00:01:00+08:00"
cover: "/lib/papers/harnessopt-bench/cover.svg"
description: "HarnessOpt-Bench 用固定 seed、target model、环境、verifier 和严格 dev/val/test 边界，把“优化 agent harness”变成可比较实验。本文拆解预算、normalized gain、111 次 scored runs、模型效应与 evaluator 过拟合风险。"
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

<p class="paper-meta">arXiv:2608.06301v1 · 最早公开于 2026-08-06</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.06301">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.06301">论文 PDF</a>
  <a href="https://scale.com/research">Scale Research</a>
</div>

<section class="deck-wrap" aria-label="HarnessOpt-Bench: Evaluating LLMs at Harness Optimization 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harnessopt-bench-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harnessopt-bench-visual-guide.html" title="HarnessOpt-Bench: Evaluating LLMs at Harness Optimization 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">HarnessOpt-Bench 用固定 seed、target model、环境、verifier 和严格 dev/val/test 边界，把“优化 agent harness”变成可比较实验。本文拆解预算、normalized gain、111 次 scored runs、模型效应与 evaluator 过拟合风险。</p>
<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>111</strong><span>scored optimization runs</span></div>
  <div class="metric"><strong>0.142 vs 0.079</strong><span>optimizer model effect vs coding-harness effect</span></div>
  <div class="metric"><strong>11 : 9</strong><span>shared vs native harness pair wins</span></div>
  <div class="metric"><strong>82%</strong><span>中位 case-pass 配额消耗</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>强项 变量拆得干净，预算与信息边界明确。 弱项 每配置只有两次 optimizer replicate，且代码尚未公开。 最重要发现 真正先耗尽的是 case passes，不是 evaluation call 数。 阅读建议 先看协议和 Table 3，再读 model/harness effect。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>优化者不是最终答题模型。optimizer model 在 coding harness 中改写 target agent；target model、environment 和 verifier 固定。最终要比较的是改后的 harness 在隐藏 test 上相对 seed 捕获了多少剩余 headroom。</p></aside>

## Q1. 为什么 harness optimization 需要独立 benchmark？

<p><strong>因为一套 harness 的效果只能通过昂贵、随机的 Agent rollout 间接估计，不能像普通单元测试那样即时判定。</strong>optimizer 必须同时做失败诊断、系统修改、预算分配和候选选择；如果每篇论文使用不同 seed、模型、split 与反馈接口，结果几乎无法横向比较。</p><p>HarnessOpt-Bench 固定四件事：初始 harness、target model、执行环境、verifier。优化者只能改 harness code，不能换模型或测试规则。这样才把“更强的被测 Agent”和“更会优化 harness 的 optimizer”分开。</p>

## Q2. 它与 VeRO、Meta-Harness 和普通 coding benchmark 差在哪？

<p><strong>VeRO 提供外层实验基础设施，Meta-Harness 提出具体搜索法；HarnessOpt-Bench 把问题固定成统一赛道。</strong>它又不同于 SWE-bench：patch 的效用不是确定性测试，而是多次随机 rollout 的均值；反馈成本本身就是问题的一部分。</p><p>四个任务是 OfficeQA、BrowseComp-Plus、Terminal-Bench 2.0 与 GAIA。前三个 seed 是能工作的朴素 agent；GAIA seed 是不可运行 stub，所以 GAIA 测的更像从零造 agent，不能和“优化一个可用 seed”无条件合并。</p>

## Q3. 协议如何阻止 optimizer 偷看 test，又怎样计算 gain？

<p><strong>dev 暴露逐例输入、结果与 trace；validation 只暴露 aggregate score；test 在最终 nomination 前完全不可见。</strong>每个分区最多 100 次 evaluation calls，dev/val 各最多四个 full case passes，另有 target-token cap。optimizer 推理 token 被计量但未封顶。</p><div class="formula">g = (E(H⁺) − E(H₀)) / (1 − E(H₀))</div><p>这里的 normalized gain 表示拿回了 seed 上方多少剩余空间；负值表示最终候选比 seed 更差。seed 与最终 candidate 都对每个 test case 跑三次。每个 optimizer configuration 只重复两轮，因此表中 range 是观测范围，不是置信区间。</p><p>具体执行链是：optimizer commit 候选 → 选择 dev/val cases → trusted service 在隔离 sandbox 运行 → 按 disclosure policy 返回 trace 或 aggregate → optimizer nominate 一个 commit → server 一次性跑隐藏 test。</p>

## Q4. 111 次 scored runs 真正说明了什么？

<p><strong>optimizer model 的影响比外层 coding harness 更大，但两者都没有稳定赢家。</strong>平衡子集里，更换 optimizer model 的平均效应为 0.142 gain units；更换 coding harness 为 0.079，约小 1.8 倍。20 个 model-task 对中 shared OpenCode 赢 11 次，native harness 赢 9 次。</p><p>更广的 intervention breadth 与 gain 正相关，但它和修改量混杂，不能直接解释成“改得越多越好”。更反直觉的是，111 个 scored cells 中只有 7 个使用 detailed trace，共 16 次，且没有观察到收益关联。optimizer 通常不是被 100 次 API call 卡住：中位只用了 8 次调用，却吃掉 82% 的 case-pass allowance。</p><div class="case"><h3>一个可复核的预算例子</h3><p>OfficeQA split 为 49/98/99，seed 0.341；BrowseComp-Plus 为 33/66/66，seed 0.462；Terminal-Bench 为 17/36/36，seed 0.241；GAIA 为 33/66/66，seed 0。一个 full validation pass 因而一次消耗整个 val case allowance 的四分之一，解释了为什么“评多少个案例”比“调多少次接口”更先绑定。</p></div>

## Q5. 怎样把这个 benchmark 做得更可靠、更难作弊？

<p><strong>最需要补的是更多 optimizer replicate、动态 target model 与对 evaluator artifact 的抗过拟合检查。</strong>两次重复不足以估计长程搜索的方差；每任务只固定一个 target model，也无法判断修改是否迁移。可以加入交叉 evaluator、隐藏 prompt mutation 与跨模型 replay。</p><p>论文没有链接独立公开仓库；截至 2026-10-08，Scale Research 索引也未给出可下载的完整 seed、server 和 checker artifact。因此协议设计可以审阅，独立复现仍受限。尤其 GAIA stub 与三个 competent seeds 应分榜报告。</p>

## Q6. 最后怎样评价 HarnessOpt-Bench？

<p><strong>这是这组论文里实验控制最值得借鉴的一篇。</strong>它没有发明新的 optimizer，却把 fixed target、分层 disclosure、不可见 test 与向量预算讲清楚了，也用负结果纠正了“native harness 必然更好”“详细 trace 必然有用”这类直觉。</p><div class="limit-grid"><div><b>强项</b><span>变量拆得干净，预算与信息边界明确。</span></div><div><b>弱项</b><span>每配置只有两次 optimizer replicate，且代码尚未公开。</span></div><div><b>最重要发现</b><span>真正先耗尽的是 case passes，不是 evaluation call 数。</span></div><div><b>阅读建议</b><span>先看协议和 Table 3，再读 model/harness effect。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：availability checked 2026-10-08; no dedicated public HarnessOpt-Bench repository linked from paper or research index。</p>

<aside class="source-note"><p>论文列出的来源、筛选、split 与泄漏风险都在正文中单独说明。任务检查、标注来源与无法从公开材料确认的部分均被明确区分。文章明确区分 evaluated system 可见内容与隐藏 test、checker 或 reference。分数公式、聚合层级、分母和不确定性按论文协议解释。至少一个具体执行案例从输入、修改、运行一直追到 PASS 或 FAIL。公开材料不足时，文章不会把推测伪装成官方 checker 实现。模型、harness、预算、重复次数、失败运行和主结果没有混成单一排行榜。相邻工作按修改对象、反馈、隐藏边界和交付物比较。文章把外部有效性、方差、checker blind spot 与公开 artifact 缺口列为结论边界。</p></aside>
</div>

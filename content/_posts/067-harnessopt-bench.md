---
title: "[2026-08-06] HarnessOpt-Bench: Evaluating LLMs at Harness Optimization"
permalink: "/posts/论文解读/harnessopt-bench.html"
date: "2026-10-08T00:01:00+08:00"
updated: "2026-10-11T02:03:00+08:00"
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

<p class="lead">这篇把 harness 优化拆成一个受控实验：被修改的 Agent、它调用的模型、运行环境和 verifier 都固定，只更换“谁来改 harness”以及它使用哪套 coding harness。开发集返回逐题轨迹，验证集只返回总分，最终测试集不提供任何反馈。111 次完整实验用来回答两个问题：哪种 optimizer 更会改，以及外层 coding harness 会不会改变优化结果。</p>
<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>111</strong><span>scored optimization runs</span></div>
  <div class="metric"><strong>0.142 vs 0.079</strong><span>optimizer model effect vs coding-harness effect</span></div>
  <div class="metric"><strong>11 : 9</strong><span>shared vs native harness pair wins</span></div>
  <div class="metric"><strong>82%</strong><span>中位 case-pass 配额消耗</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>benchmark 固定 target model、seed harness、environment 和 verifier，只让 optimizer 修改 harness。</li><li>dev 会返回逐题结果和 trace，validation 只返回汇总分，test 在 optimizer 提交最终版本前完全隐藏。</li><li>每个配置只重复两轮，表中的范围不是置信区间；代码、seed 和服务端 checker 也尚未公开。</li><li>多数 optimizer 先用光的是“完整跑过多少道题”的额度，而不是调用评测服务的次数。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 先分清两层 Agent</span><h3>optimizer 修改谁，最终又评谁？</h3><p><strong>optimizer</strong> 是外层模型，它在 Codex、Claude Code、OpenCode 等 coding harness 中修改代码；<strong>target agent</strong> 是被修改的内层 Agent，最终由固定 target model 驱动。评测服务在隔离环境中运行 target agent，并用原任务的 verifier 给分。文中的 <strong>case pass</strong> 指把一个 split 中每道题完整跑一遍；它与“调用一次评测 API”不是同一个预算单位。</p></aside>

## Q1. 为什么 harness optimization 需要独立 benchmark？

<p><strong>因为一套 harness 的效果只能通过昂贵、随机的 Agent rollout 间接估计，不能像普通单元测试那样即时判定。</strong>optimizer 必须同时做失败诊断、系统修改、预算分配和候选选择；如果每篇论文使用不同 seed、模型、split 与反馈接口，结果几乎无法横向比较。</p><p>HarnessOpt-Bench 固定四件事：初始 harness、target model、执行环境、verifier。优化者只能改 harness code，不能换模型或测试规则。这样才把“更强的被测 Agent”和“更会优化 harness 的 optimizer”分开。</p>

## Q2. 它与 VeRO、Meta-Harness 和普通 coding benchmark 差在哪？

<p><strong>VeRO 提供外层实验基础设施，Meta-Harness 提出具体搜索法；HarnessOpt-Bench 把问题固定成统一赛道。</strong>它又不同于 SWE-bench：patch 的效用不是确定性测试，而是多次随机 rollout 的均值；反馈成本本身就是问题的一部分。</p><p>四个任务是 OfficeQA、BrowseComp-Plus、Terminal-Bench 2.0 与 GAIA。前三个 seed 是能工作的朴素 agent；GAIA seed 是不可运行 stub，所以 GAIA 测的更像从零造 agent，不能和“优化一个可用 seed”无条件合并。</p>

## Q3. 协议如何阻止 optimizer 偷看 test，又怎样计算 gain？

<p><strong>optimizer 可以反复用 dev 和 validation 调试，却直到提交最终 commit 后才知道 test 分数。</strong>四个任务直接继承 OfficeQA、BrowseComp-Plus、Terminal-Bench 2.0 和 GAIA 的 environment 与 verifier。前三个 seed 是能运行但没有专门优化的 Agent；GAIA 的 seed 是得 0 分的 stub，因此 GAIA 更接近从零开发，不能与另外三项无条件合并。</p>

### 可见内容与隐藏内容

<div class="table-scroll"><table><thead><tr><th>分区</th><th>optimizer 能看到什么</th><th>用途</th></tr></thead><tbody><tr><td>dev</td><td>题目、逐题结果和完整 execution trace</td><td>定位失败、修改代码</td></tr><tr><td>validation</td><td>只返回所选题目的 aggregate score</td><td>比较候选，减少对单题轨迹过拟合</td></tr><tr><td>test</td><td>搜索期间完全不可见</td><td>optimizer nominate 一个 commit 后，由 trusted server 一次性运行</td></tr></tbody></table></div>

<p>每个分区最多调用评测服务 100 次，但 dev 和 validation 分别只有四次 full case pass。full case pass 是把该分区所有题各跑一次；只评一小部分题则按实际题数扣额度。另有 target-model token 上限。optimizer 自己的推理 token 只记录、不封顶，这一点会影响不同模型的成本公平性。</p>

### 一个 test 分数怎样产生

<ol class="steps"><li><b>1 · 固定候选</b><span>optimizer 提交并 nominate 一个可执行 harness commit。</span></li><li><b>2 · 独立运行</b><span>trusted server 在临时 sandbox 中，用固定 target model 对每个 test case 运行候选。</span></li><li><b>3 · 原生判分</b><span>来源 benchmark 的 verifier 把完整 trajectory 映射到 0–1 分；论文没有另加一个 LLM judge。</span></li><li><b>4 · 重复</b><span>seed 与最终候选对每个 test case 各跑三次，再计算平均 test performance <code>E(H)</code>。</span></li></ol>

<div class="formula">g = (E(H⁺) − E(H₀)) / (1 − E(H₀))</div>

<p><code>g</code> 表示候选拿回了 seed 上方多少剩余空间。例如 seed 为 0.4、候选为 0.55，则 <code>g=(0.55-0.4)/(1-0.4)=0.25</code>。负值说明 optimizer 最终提交的版本比 seed 更差。每个 optimizer 配置只重复两轮，论文表中的 min–max 是两次观测范围，不是置信区间。</p>

<p>论文没有公开四份 seed、server 和 checker artifact。因此本文能解释完整协议和预算，不能从官方文件追一条 OfficeQA 或 Terminal-Bench 隐藏题到具体 PASS/FAIL assertion；“一个可复核的预算例子”不应冒充任务 case。</p>

## Q4. 111 次 scored runs 能说明什么？

<p><strong>optimizer model 的影响大于外层 coding harness，但二者都没有形成稳定的赢家。</strong>平衡子集里，更换 optimizer model 的平均效应是 0.142 gain units；只更换 coding harness 的平均效应是 0.079。20 个“模型 × 任务”配对中，共用的 OpenCode 赢 11 次，各模型原生 harness 赢 9 次。</p>

<p>intervention breadth，也就是修改覆盖了多少类 harness 组件，与 gain 正相关；不过它和总修改量混在一起，不能据此得出“改得越多越好”。111 个有分数的实验单元中，只有 7 个配置主动索取过 detailed trace，共 16 次，论文没有观察到 trace 使用与最终 gain 的关系。这里的负结果只说明当前 optimizer 很少有效利用昂贵轨迹，不说明轨迹本身无用。</p>

<div class="case"><h3>真实预算记录：为什么先耗尽的是题目额度</h3><ol><li>OfficeQA 的 dev/val/test 为 49/98/99，seed test score 为 0.341。</li><li>BrowseComp-Plus 为 33/66/66，seed 为 0.462；Terminal-Bench 为 17/36/36，seed 为 0.241；GAIA 为 33/66/66，seed 为 0。</li><li>一次 full validation pass 会用掉四次总额度中的一次。optimizer 即使只调用评测服务几次，也可能一次跑完整个 split。</li><li>111 个实验单元中，评测 API 调用数的中位数只有 8，case-pass 额度却平均使用了 82%。</li></ol><p>这条记录解释的是预算瓶颈，不是某道任务的 judge。任务级 checker 未公开，本文无法展示官方单题 PASS/FAIL 轨迹。</p></div>

## Q5. 怎样把这个 benchmark 做得更可靠、更难作弊？

<p><strong>最需要补的是更多 optimizer replicate、动态 target model 与对 evaluator artifact 的抗过拟合检查。</strong>两次重复不足以估计长程搜索的方差；每任务只固定一个 target model，也无法判断修改是否迁移。可以加入交叉 evaluator、隐藏 prompt mutation 与跨模型 replay。</p><p>论文没有链接独立公开仓库；截至 2026-10-08，Scale Research 索引也未给出可下载的完整 seed、server 和 checker artifact。因此协议设计可以审阅，独立复现仍受限。尤其 GAIA stub 与三个 competent seeds 应分榜报告。</p>

## Q6. 最后怎样评价 HarnessOpt-Bench？

<p><strong>这组论文里，HarnessOpt-Bench 的实验控制尤其值得借鉴。</strong>它没有发明新的 optimizer，却把 fixed target、分层 disclosure、不可见 test 与向量预算讲清楚了，也用负结果纠正了“native harness 必然更好”“详细 trace 必然有用”这类直觉。</p><div class="limit-grid"><div><b>强项</b><span>变量拆得干净，预算与信息边界明确。</span></div><div><b>弱项</b><span>每配置只有两次 optimizer replicate，且代码尚未公开。</span></div><div><b>预算瓶颈</b><span>case passes 先耗尽，evaluation call 数反而较少。</span></div><div><b>阅读建议</b><span>先看协议和 Table 3，再读 model/harness effect。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：availability checked 2026-10-08; no dedicated public HarnessOpt-Bench repository linked from paper or research index。</p>

</div>

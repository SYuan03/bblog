---
title: "[2026-08-03] Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories"
permalink: "/posts/论文解读/harness-r1.html"
date: "2026-10-08T00:02:00+08:00"
updated: "2026-10-08T00:02:00+08:00"
cover: "/lib/papers/harness-r1/cover.svg"
description: "Harness-R1 把 harness 修补训练成一个 9B 模型的专门能力：从 failure packet 生成 lifecycle-wide patch，再用冻结 target agent 的真实重跑收益做 GRPO。本文区分训练目标、四个 hooks、迁移结果与同批奖励的局限。"
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

<p class="paper-meta">arXiv:2608.02276v1 · 最早公开于 2026-08-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.02276">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.02276">论文 PDF</a>
  <a href="https://github.com/DeepExperience/Harness-R1">官方代码</a>
  <a href="https://huggingface.co/ShaoShuai0605/Harness-R1">模型</a>
</div>

<section class="deck-wrap" aria-label="Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harness-r1-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harness-r1-visual-guide.html" title="Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">Harness-R1 把 harness 修补训练成一个 9B 模型的专门能力：从 failure packet 生成 lifecycle-wide patch，再用冻结 target agent 的真实重跑收益做 GRPO。本文区分训练目标、四个 hooks、迁移结果与同批奖励的局限。</p>
<div class="interest"><b>博客作者兴趣度 9.1 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>9B</strong><span>专门的 harness engineer</span></div>
  <div class="metric"><strong>44.3 → 53.6</strong><span>vanilla target 平均成功率</span></div>
  <div class="metric"><strong>877</strong><span>SFT 冷启动样本</span></div>
  <div class="metric"><strong>+8.9 ± 1.5 pp</strong><span>稀疏失败 held-out 增益</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><p>最可复用 invalid / no-op patch 归零，以及冻结 target 的真实 rerun 奖励。 最大限制 same-batch transductive reward。 可靠结果 稀疏失败 held-out 增益给出 ±1.5 pp。 推荐对象 研究 harness repair post-training 与 model–harness co-evolution 的读者。</p></aside>
<aside class="part0"><span class="kicker">PART 0 · 阅读准备</span><h3>这篇里的 harness 指什么？</h3><p>Harness-R1 同时包含两个模型：target agent 负责做 WebShop、ALFWorld、DBBench；harness engineer 读取失败包并写 patch。训练时只更新 engineer，target agent 始终冻结。</p></aside>

## Q1. 为什么要专门训练一个 harness engineer？

<p><strong>论文把“读失败—改 runtime—重跑验证”从一次性 prompt 技巧变成可训练策略。</strong>通用 frontier editor 有时能写出好 patch，也会把已有能力改坏；固定规则又不能从新失败中学习。Harness-R1 用单独的 Qwen3.5-9B engineer 学习什么失败该改、改哪个生命周期位置、什么代码才会带来真实任务收益。</p>

## Q2. 它与 Self-Harness、HarnessFix 和直接微调 target 有什么不同？

<p><strong>它的独特之处是在线强化学习直接奖励 patch 后的 target-agent 成功率。</strong>Self-Harness 用同一个模型提出并筛选自己的修改；HarnessFix 先构造 HTIR 做结构化诊断；直接 SFT target 则更新任务模型权重。Harness-R1 不碰 target weights，而是训练另一个模型编辑四个 runtime hooks。</p><p>因此结果要解释为“学习到的工程师对冻结 target 的增益”，不是 target model 本身更聪明。论文也展示 target 做过 SFT 后，专门 engineer 仍能继续增益，指向 model 与 harness 两条更新轴。</p>

## Q3. failure packet 如何变成可执行 patch 和在线奖励？

<p><strong>每个 failure packet 包含失败轨迹、环境反馈和当前 harness；engineer 输出四处 hook 的补丁。</strong>它们分别是 <code>on_init</code>、<code>make_pre_hint</code>、<code>on_before_action</code>、<code>on_post_step</code>，覆盖初始化、决策前提示、动作前守卫和动作后反馈。</p><ol class="steps"><li><b>SFT</b><span>877 个冷启动例：WebShop 381、ALFWorld 248、DBBench 248。</span></li><li><b>SAMPLE</b><span>每个 packet 采样 8 个 patch。</span></li><li><b>VALIDATE</b><span>必须可解析、可安装、能完成完整 rerun；no-op 与不完整 patch 奖励为 0。</span></li><li><b>REWARD</b><span>比较同一完整 batch 修补前后的 realized success，再做 GRPO。</span></li></ol><p>这个奖励路径很实在，却也是最关键的边界：patch 直接针对产生 failure packet 的同一 batch 优化，是 transductive objective；训练目标没有单独惩罚 held-out regression 或推理成本。</p>

## Q4. 三个环境与迁移实验支持多强的结论？

<p><strong>在三个训练环境上，vanilla Qwen3.5-9B 从 44.3% 提到 53.6%，增加 9.3 个百分点；target 先 SFT 后再修 harness，则从 59.2% 到 64.2%。</strong>在 20 个 unseen targets 上平均 +7.06 pp，21×3 个 model-environment 配对中 56/63 改善。只给稀疏失败的 1,270 个 held-out tasks，提升为 +8.9±1.5 pp，而两个 frontier editor 的平均改动为负。</p><div class="case"><h3>patch 具体改了什么？</h3><p>WebShop patch 在颜色未选择时阻止 <code>Buy Now</code>；ALFWorld 组合 stage state、hint 与 placement guard；DBBench 保留 verifier 需要的 <code>4 Hours</code> 大小写。相反，一个 Gemini patch 把 ALFWorld 从 41.6% 降到 35.4%，说明“能写合理代码”不等于行为会改善。</p></div><p>ablation 显示 pre-action 与 post-feedback 最重要，但贡献随环境变化，不能相加成一条普遍排序。</p>

## Q5. 下一步怎样避免同批过拟合与回归？

<p><strong>应把奖励从 same-batch delta 扩展成 train gain、held-out non-regression 与运行成本的多目标函数。</strong>每个 patch 应在相邻任务和不同 seed 上重放，并设置自动 rollback。还需要研究 engineer 是否迁移到不同 hook API、不同 target model 和更大代码库。</p><p>官方仓库可访问，本文固定核验 commit <code>94f2e087…</code>；模型权重也公开。可复现性优于只给论文的工作，但在线 RL 的完整计算成本和跨版本依赖仍需谨慎记录。</p>

## Q6. 最后怎样评价 Harness-R1？

<p><strong>Harness-R1 的贡献不是“RL 又赢一次”，而是把 executable patch 的真实后果接回训练环。</strong>证据表明专门化 engineer 比通用一次性 editor 更稳定；但同批奖励仍可能鼓励局部修补，尚不能证明它学会了普遍的软件维护能力。</p><div class="limit-grid"><div><b>最可复用</b><span>invalid / no-op patch 归零，以及冻结 target 的真实 rerun 奖励。</span></div><div><b>最大限制</b><span>same-batch transductive reward。</span></div><div><b>可靠结果</b><span>稀疏失败 held-out 增益给出 ±1.5 pp。</span></div><div><b>推荐对象</b><span>研究 harness repair post-training 与 model–harness co-evolution 的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：94f2e087f573e1b82fc9568bb634d4ae9a887e28。</p>

<aside class="source-note"><p>文章把核心贡献限定为对 executable harness 的创建、修复或优化。方法链按失败证据、候选修改、真实执行与筛选顺序展开。主结果保留 benchmark、模型、分母与提升幅度。局部奖励、重复次数、迁移与公开 artifact 边界被明确保留。</p></aside>
</div>

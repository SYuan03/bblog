---
title: "[2026-08-03] Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories"
permalink: "/posts/论文解读/harness-r1.html"
date: "2026-10-08T00:02:00+08:00"
updated: "2026-10-11T02:04:00+08:00"
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

<p class="lead">Harness-R1 训练一个 9B 模型专门修 Agent 运行程序。它读取一次失败的完整材料，修改初始化、动作前后处理等四个 hook，再让冻结的 target agent 重新执行原任务。补丁只有在真实重跑后提高成功率才得到正奖励，因此训练信号来自代码的实际后果，而不是另一个模型对补丁文字的评价。</p>
<div class="interest"><b>博客作者兴趣度 9.1 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>9B</strong><span>专门的 harness engineer</span></div>
  <div class="metric"><strong>44.3 → 53.6</strong><span>vanilla target 平均成功率</span></div>
  <div class="metric"><strong>877</strong><span>SFT 冷启动样本</span></div>
  <div class="metric"><strong>+8.9 ± 1.5 pp</strong><span>稀疏失败 held-out 增益</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>训练对象是一个 9B harness engineer；负责执行 WebShop、ALFWorld 和 DBBench 的 target agent 始终冻结。</li><li>engineer 写出的 patch 必须能安装并完成重跑。无效 patch、没有改动的 patch 和中途失败的重跑都得到 0 奖励。</li><li>主要训练奖励来自产生 failure packet 的同一批任务，因此容易学到只对当前 batch 有效的修补。</li><li>较可信的泛化结果来自 1,270 个稀疏失败任务：平均提升 8.9±1.5 个百分点。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 先分清训练对象</span><h3>被训练的不是做题模型</h3><p><strong>target agent</strong> 负责做 WebShop、ALFWorld 和 DBBench，整个训练期间参数冻结；<strong>harness engineer</strong> 读取 failure packet，也就是失败轨迹、环境反馈和当前 harness 代码，再输出 patch。论文所说的 <strong>rerun</strong> 是安装补丁后完整重跑同一批任务。GRPO 只更新 engineer。</p></aside>

## Q1. 为什么要专门训练一个 harness engineer？

<p><strong>论文把“读失败—改 runtime—重跑验证”从一次性 prompt 技巧变成可训练策略。</strong>通用 frontier editor 有时能写出好 patch，也会把已有能力改坏；固定规则又不能从新失败中学习。Harness-R1 用单独的 Qwen3.5-9B engineer 学习什么失败该改、改哪个生命周期位置、什么代码才会带来真实任务收益。</p>

## Q2. 它与 Self-Harness、HarnessFix 和直接微调 target 有什么不同？

<p><strong>它的独特之处是在线强化学习直接奖励 patch 后的 target-agent 成功率。</strong>Self-Harness 用同一个模型提出并筛选自己的修改；HarnessFix 先构造 HTIR 做结构化诊断；直接 SFT target 则更新任务模型权重。Harness-R1 不碰 target weights，而是训练另一个模型编辑四个 runtime hooks。</p><p>因此结果要解释为“学习到的工程师对冻结 target 的增益”，不是 target model 本身更聪明。论文也展示 target 做过 SFT 后，专门 engineer 仍能继续增益，指向 model 与 harness 两条更新轴。</p>

## Q3. failure packet 如何变成可执行 patch 和在线奖励？

<p><strong>每个 failure packet 包含失败轨迹、环境反馈和当前 harness；engineer 输出四处 hook 的补丁。</strong>它们分别是 <code>on_init</code>、<code>make_pre_hint</code>、<code>on_before_action</code>、<code>on_post_step</code>，覆盖初始化、决策前提示、动作前守卫和动作后反馈。</p><ol class="steps"><li><b>SFT</b><span>877 个冷启动例：WebShop 381、ALFWorld 248、DBBench 248。</span></li><li><b>SAMPLE</b><span>每个 packet 采样 8 个 patch。</span></li><li><b>VALIDATE</b><span>必须可解析、可安装、能完成完整 rerun；no-op 与不完整 patch 奖励为 0。</span></li><li><b>REWARD</b><span>比较同一完整 batch 修补前后的 realized success，再做 GRPO。</span></li></ol><p>这个奖励直接针对产生 failure packet 的同一 batch 优化，属于 transductive objective。训练目标没有单独惩罚 held-out regression 或推理成本。</p>

## Q4. 三个环境与迁移实验支持多强的结论？

<p><strong>在三个训练环境上，vanilla Qwen3.5-9B 从 44.3% 提到 53.6%，增加 9.3 个百分点；target 先 SFT 后再修 harness，则从 59.2% 到 64.2%。</strong>在 20 个未见 target 上平均提升 7.06 个百分点，21×3 个 model–environment 配对中有 56 个改善。只给稀疏失败证据的 1,270 个 held-out tasks 上，提升为 8.9±1.5 个百分点，而 Qwen3.5-397B 与 DeepSeek-V4-Pro 两个一次性 editor 的平均改动为负。</p>

<div class="case"><h3>真实 WebShop case：先选 black brown，再允许 Buy Now</h3><ol><li><strong>初始任务：</strong>购买一件价格低于 40 美元、颜色为 black brown 的 synthetic hairpiece。</li><li><strong>原始轨迹：</strong>target agent 找到合适商品，却没有选择颜色就执行 <code>Buy Now</code>；环境只给 0.667 的部分奖励。</li><li><strong>补丁：</strong>harness engineer 在 <code>on_before_action</code> 安装 guard。只要价格超预算，或任务要求的 option 尚未选择，它就拦截规范化后的 <code>Buy Now</code>。</li><li><strong>重跑：</strong>target agent 再次尝试提前购买，guard 返回提示；Agent 随后选择 black brown，再购买。</li><li><strong>结果：</strong>同一道题从 0.667 变成 1.0；同一十题 batch 的完整成功数从 2/10 增至 5/10，原先已成功的两题没有退化。</li></ol></div>

<p>另外两个公开案例说明补丁不必都长成同一种形式。ALFWorld patch 同时维护 stage state、给下一步 hint，并阻止把物体放到错误位置，batch 从 1/10 提到 6/10，但也让一条原本成功的任务退化；DBBench patch 先查看 schema 和当前行，把 <code>3 Hours</code> 改成大小写一致的 <code>4 Hours</code>，batch 从 4/10 提到 6/10。相反，一个 Gemini patch 把 ALFWorld 从 41.6% 降到 35.4%，说明补丁看起来合理、能安装，都不等于实际行为会改善。</p>

<p>生命周期位置消融中，移除 pre-action guard 的平均分下降 3.9 个百分点，移除 post-feedback state update 下降 3.3 个百分点；不同环境的下降幅度并不一致，不能把它们相加成固定的组件排名。</p>

## Q5. 下一步怎样避免同批过拟合与回归？

<p><strong>应把奖励从 same-batch delta 扩展成 train gain、held-out non-regression 与运行成本的多目标函数。</strong>每个 patch 应在相邻任务和不同 seed 上重放，并设置自动 rollback。还需要研究 engineer 是否迁移到不同 hook API、不同 target model 和更大代码库。</p><p>官方仓库可访问，本文固定核验 commit <code>94f2e087…</code>；模型权重也公开。可复现性优于只给论文的工作，但在线 RL 的完整计算成本和跨版本依赖仍需谨慎记录。</p>

## Q6. 最后怎样评价 Harness-R1？

<p><strong>Harness-R1 把 executable patch 的实际后果变成 harness engineer 的训练信号。</strong>证据表明专门化 engineer 比通用一次性 editor 更稳定；但同批奖励仍可能鼓励局部修补，尚不能证明它学会了普遍的软件维护能力。</p><div class="limit-grid"><div><b>可复用设计</b><span>invalid / no-op patch 归零，以及冻结 target 的真实 rerun 奖励。</span></div><div><b>主要限制</b><span>same-batch transductive reward。</span></div><div><b>可靠结果</b><span>稀疏失败 held-out 增益给出 ±1.5 pp。</span></div><div><b>推荐对象</b><span>研究 harness repair post-training 与 model–harness co-evolution 的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：94f2e087f573e1b82fc9568bb634d4ae9a887e28。</p>

</div>

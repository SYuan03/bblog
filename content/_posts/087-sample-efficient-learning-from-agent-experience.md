---
title: "[2026-07-23] Sample-Efficient Learning from Agent Experience"
permalink: "/posts/论文解读/sample-efficient-learning-from-agent-experience.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-08T18:30:00+08:00"
cover: "/lib/papers/sample-efficient-learning-from-agent-experience/cover.svg"
description: "Experience Distillation 从长达数万 token 的 agent trial history 分叉，只生成下一次完整 decision，不再调用 environment。它在 749 个 software tasks 上保留 64.8% 的 ICL 增益，但代码、task set、histories 与 verifier 均未公开。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Agent Experience"
  - "Context Distillation"
  - "Software Engineering"
  - "Sample Efficiency"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Chenhui Gou, Haoqin Tu, Yunhao Fang, Jianfei Cai, Hamid Rezatofighi · arXiv:2607.21051v1 · 最早公开于 2026-07-23</p>
<div class="source-links"><a href="https://arxiv.org/abs/2607.21051">论文主页</a><a href="https://arxiv.org/pdf/2607.21051v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="Experience Distillation 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练链、真实 case 与复现边界</strong><a href="/lib/decks/sample-efficient-learning-from-agent-experience-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/sample-efficient-learning-from-agent-experience-visual-guide.html" title="Experience Distillation 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">这篇处理的是昂贵 environment interaction：agent 已经积累了几十轮 trial history，如何在不再运行 environment 的前提下把经验写进参数？它从每个历史节点采样 teacher 的下一次 decision，到 action 为止就停。</p>

<div class="metrics" aria-label="Experience Distillation 关键数字"><div class="metric"><strong>51.4%</strong><span>software pass@1</span></div><div class="metric"><strong>64.8%</strong><span>retained ICL gain</span></div><div class="metric"><strong>9.6×</strong><span>fewer software trials vs PPO</span></div><div class="metric"><strong>8/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>它不是 OPSD：teacher 生成 one-step training target，而不是评分 student on-policy decision。</li><li>software histories 平均 60.5 turns、82.4K tokens；branch packing 把 4,096 examples 压成 128 sequences。</li><li>749 tasks、histories、model checkpoint、verifier 与 code 都未公开，结果无法端到端复现。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · One-step branch 的边界</span><h3>生成 decision，但不生成下一条 environment observation</h3><p>teacher 读取完整 recorded history，生成下一次 reasoning/action。分支在 action 处终止，因此无需 world model，也没有新增 environment sample；真正的 observation 仍来自原历史。</p></aside>

## Q1. 为什么长历史既有用又难以训练？

<p><strong>trial history 包含失败假设、environment feedback 与最终修复，in-context 很有效，但移除 context 后增益消失。</strong>SFT 只模仿 recorded action，难以综合多次尝试；重新让 teacher 在 environment 中 rollout 又会花费昂贵样本。</p><p>Experience Distillation 把每个 history prefix 当分叉点，只生成下一次完整 decision，loss 只落在新生成 token。</p>

## Q2. 它与 OPCD / OPSD 的训练分布有何不同？

<div class="table-scroll"><table><thead><tr><th>方法</th><th>训练 target 来自谁</th><th>需要新 environment interaction</th></tr></thead><tbody><tr><td>OPSD / OPCD</td><td>student on-policy tokens，teacher 重评</td><td>需要 student rollout</td></tr><tr><td>Experience Distillation</td><td>teacher 从 archived history 采样 next decision</td><td>不需要</td></tr><tr><td>SFT</td><td>recorded historical decision</td><td>不需要</td></tr></tbody></table></div><p>default objective 是 sampled teacher decision 的 next-token prediction，可视为 teacher-sampled forward KL。它适合样本昂贵的环境，但不保证 target 落在当前 student 会访问的 state。</p>

## Q3. 749 个 software tasks 与六个 games 怎样构造？

<p><strong>每个 software task 跑 8 至 12 个独立的 repeated-rollout processes，每个最多十次 trials；只保留多次尝试后产生 accepted commit 的 trajectory。</strong>749 条选中 history 平均 60.5 turns、82.4K tokens，总计 61.7M tokens。</p><p>TaleSuite 有六个 text-adventure tasks，47 trials、3,672 turns、502K tokens。模型是未披露的 in-house model，software 与 TaleSuite 还使用不同 base checkpoints。</p><div class="case"><h4>MapStore2 真实 case</h4><p>任务需要把 geometry 显式重置为 <code>value: null</code>，并修复 query pipeline 不要丢掉这个值为 null 的 update。第六次 trial 才把 trial 5 的 UI reset 与 pipeline repair 合并。teacher branches 学到这两个 accepted component，也重复了两个已被否定的 hypothesis；最终十个选中 patch 全部被外部 verifier 接受。</p></div>

## Q4. 结果、sample efficiency 与 branch packing 如何理解？

<div class="table-scroll"><table><thead><tr><th>Software · pass@1</th><th>Score</th></tr></thead><tbody><tr><td>Zero-shot</td><td>5.3%</td></tr><tr><td>Task-specific ICL</td><td>76.4%</td></tr><tr><td>SFT</td><td>8.0%</td></tr><tr><td>Experience Distillation</td><td><b>51.4%</b></td></tr></tbody></table></div><p><strong>Experience Distillation 保留 64.8% 的 software ICL 增益；TaleSuite 保留 93.4%。</strong>它以至少 9.6× 更少 software trials 达到 51.4%，而 PPO 是 17.7%；TaleSuite 相对 GRPO 少 57.2× trials。</p><p>branch packing 把 4,096 examples 合成 128 sequences，training steps 从 768 降到 64。one-step target 在五个 games 上优于用 learned observation 的 two-step branch。</p>

## Q5. 游戏 code 的 expensive simulation 能怎样用？

<p><strong>如果一次 build/playtest 很贵，可以从已经记录的 compile-run-debug histories 分叉，蒸馏“下一次 repair decision”，不再启动 engine。</strong>这适合做 experience pretraining，随后仍要回到 on-policy execution fine-tuning 校准当前 student distribution。</p><p>每个 branch target 必须标记依据来自哪些 past observations，避免模型凭 teacher hallucinate 未发生的 future state。accepted commit 与 hidden-test log 也应一起发布。</p>

## Q6. 为什么它不是可直接落地的 baseline？

<p><strong>论文未公开 model checkpoint、preprocessing prompt、完整 optimizer schedule、749-task list、external verifier、code 或 histories。</strong>部分 local browser suites 没跑，acceptance 依赖未公开 external verifier；curated task 还按 sharp pass@10 contrast 选择，不能估计真实 prevalence。</p><p>兴趣程度 8/10。one-step branch 是很好的 efficiency idea，但你的主论文若研究 on-policy privileged context，应把它放在扩展实验，而不是用它替代当前 student execution。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染。论文未提供 official repository、749-task set、histories 或 verifier。兴趣程度 8/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

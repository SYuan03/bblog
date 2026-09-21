---
title: "GameASG-Bench 如何验证一个游戏真的做完了"
permalink: "/posts/论文解读/gameasg-bench.html"
date: "2026-09-21T21:31:01+08:00"
updated: "2026-09-21T21:31:01+08:00"
cover: "/generated-covers/046-gameasg-bench.webp"
description: "从公开测试契约、真实浏览器输入到严格任务成功率，逐层拆解 GameASG-Bench，并用 Armor Alley 的测试代码说明它究竟在测什么。"
wide_content: true
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "Benchmark"
  - "游戏开发"
  - "软件测试"
---

下面 18 页从一个具体问题出发：生成的游戏能打开，离完整交付还有多远？内容覆盖评测动机、公开测试契约、Armor Alley 实例、测试代码、模型表现和方法边界。

<div class="post-deck-embed">
  <div class="post-deck-embed-frame">
    <iframe src="/lib/decks/gameasg-bench-visual-guide.html" title="GameASG-Bench 论文图解，共 18 页" allow="fullscreen"></iframe>
  </div>
  <p class="post-deck-embed-note"><span>共 18 页 · 可点击右下角按钮或使用方向键翻页</span><span>手机端建议横屏后全屏阅读</span></p>
</div>

论文：[arXiv 2609.21293](https://arxiv.org/abs/2609.21293)；代码与任务：[areal-project/GameASG-Bench](https://github.com/areal-project/GameASG-Bench)。图中的实验结果均来自作者公开的单次运行，解读和局限分析由本文作者完成。

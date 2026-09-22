---
title: "GameASG-Bench 如何验证一个游戏真的做完了"
permalink: "/posts/论文解读/gameasg-bench.html"
date: "2026-09-21T21:31:01+08:00"
updated: "2026-09-22T12:46:00+08:00"
cover: "/generated-covers/046-gameasg-bench.webp"
description: "从预先定稿的评测规则、Armor Alley 真实断言和两类失败样例，拆解 GameASG-Bench 如何验收 47 个浏览器游戏任务。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 26
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "Benchmark"
  - "游戏开发"
  - "软件测试"
---

<style>
html:not([data-theme="dark"]) body:has(.gb-reading){--paper:#fff;--paper-elevated:#f7f8fa;--ink:#20252d;--ink-soft:#68707c;--line:rgba(32,37,45,.1);--line-strong:rgba(32,37,45,.2);--sea:#2b5d91;background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:720px;margin-bottom:2.25rem}.article-shell-deck .article-header h1{max-width:24ch;margin:.72rem 0 1.05rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-deck>p{font-family:var(--sans);font-size:.93rem;line-height:1.65}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}.article-shell-deck .article-stats dd{font-family:var(--sans);font-variant-numeric:tabular-nums}
.gb-reading{--gb-column:720px;--gb-blue:var(--sea);--gb-orange:var(--coral);--gb-green:#3f8a68;--gb-ink:var(--ink);--gb-soft:var(--ink-soft);--gb-surface:var(--paper-elevated);--gb-line:var(--line-strong);width:min(100%,var(--gb-column));margin-inline:auto;color:var(--gb-ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.78;-webkit-font-smoothing:antialiased}
.gb-reading>*{max-width:100%}
.gb-reading p,.gb-reading li{text-wrap:pretty}
.gb-reading .gb-paper-meta{margin:0 0 8px;color:var(--gb-soft);font:400 .8rem/1.6 var(--sans)}
.gb-reading .gb-source-links{display:flex;flex-wrap:wrap;gap:7px 18px;margin:0 0 24px;font-size:.92em}.gb-reading .gb-source-links a{font-family:var(--sans)}
.gb-reading .gb-lead{margin:0 0 24px;font-size:1.08em;line-height:1.78}
.gb-reading .gb-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:22px 0 30px;border-block:1px solid var(--gb-line)}.gb-reading .gb-metric{min-height:102px;padding:17px 14px;border-right:1px solid var(--gb-line)}.gb-reading .gb-metric:last-child{border-right:0}.gb-reading .gb-metric strong{display:block;color:var(--gb-blue);font:650 clamp(1.65rem,3vw,2.25rem)/1 var(--serif)}.gb-reading .gb-metric span{display:block;margin-top:10px;color:var(--gb-soft);font:600 .82rem/1.5 var(--sans)}
.gb-reading .gb-deck{margin:28px 0 38px;border-block:1px solid var(--gb-line);background:var(--gb-surface)}.gb-reading .gb-deck>summary{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:76px;padding:14px 16px;cursor:pointer;list-style:none}.gb-reading .gb-deck>summary::-webkit-details-marker{display:none}.gb-reading .gb-deck-title{display:grid;gap:3px}.gb-reading .gb-deck-title small{color:var(--gb-blue);font:800 .68rem/1.2 var(--mono);letter-spacing:.1em}.gb-reading .gb-deck-title strong{font-size:1rem}.gb-reading .gb-deck-action{color:var(--gb-blue);font:700 .8rem/1 var(--sans);white-space:nowrap}.gb-reading .gb-deck[open] .gb-deck-action::before{content:"收起";font-size:.8rem}.gb-reading .gb-deck[open] .gb-deck-action{font-size:0}.gb-reading .gb-player-shell{border-top:1px solid var(--gb-line);background:#252b31}.gb-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.gb-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.gb-reading .post-deck-embed-note{margin:0!important;padding:10px 14px!important;color:#c4ccd3!important;background:#252b31;border-top:1px solid #424950}.gb-reading .gb-deck-links{display:flex;justify-content:flex-end;padding:0 14px 13px;background:#252b31}.gb-reading .gb-deck-links a{color:#fff;padding:8px 12px;border:1px solid #ffffff4a;text-decoration:none;font:700 .78rem/1 var(--sans)}
.gb-reading .gb-table-scroll{width:100%;margin:22px 0;overflow-x:auto}.gb-reading .gb-table-scroll table{display:table;width:100%;min-width:680px;margin:0;border-collapse:collapse;font:400 .875rem/1.55 var(--sans)}.gb-reading th,.gb-reading td{padding:9px 10px;border:1px solid var(--gb-line);text-align:left;vertical-align:top}.gb-reading th{background:color-mix(in srgb,var(--gb-blue) 8%,var(--gb-surface))}.gb-reading td:first-child{font-weight:650}.gb-reading code{font-size:.92em}
.gb-reading .gb-figure{width:100%;margin:26px 0}.gb-reading .gb-figure img{display:block;width:100%;height:auto;margin:0;border:1px solid color-mix(in srgb,var(--gb-line) 65%,transparent);border-radius:0;background:#fff;box-shadow:none}.gb-reading .gb-figure figcaption{margin:8px 0 0;color:var(--gb-soft);font-size:.84rem;line-height:1.6;text-align:left}.gb-reading .gb-figure figcaption strong{color:var(--gb-ink)}
.gb-reading .gb-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--gb-line);list-style:none}.gb-reading .gb-flow li{min-height:128px;padding:14px;background:var(--gb-surface)}.gb-reading .gb-flow b{display:block;margin-bottom:7px;color:var(--gb-blue);font:750 .8rem/1.35 var(--sans)}.gb-reading .gb-flow span{display:block;color:var(--gb-soft);font-size:.84rem;line-height:1.58}
.gb-reading .gb-note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--gb-orange);background:color-mix(in srgb,var(--gb-orange) 7%,var(--gb-surface))}.gb-reading .gb-note.blue{border-color:var(--gb-blue);background:color-mix(in srgb,var(--gb-blue) 7%,var(--gb-surface))}.gb-reading .gb-note p{margin:.35em 0}
.gb-reading .gb-formula{margin:22px 0;padding:18px;border-block:1px solid var(--gb-line);text-align:center}.gb-reading .gb-formula code{display:block;padding:0;color:var(--gb-ink);background:none;font-size:clamp(.8rem,1.5vw,.98rem)}.gb-reading .gb-formula span{display:block;margin-top:8px;color:var(--gb-soft);font:400 .84rem/1.55 var(--sans)}
.gb-reading>figure.highlight,.gb-reading>.highlight-container{width:100%;max-width:100%;margin-inline:0;contain:inline-size}.gb-reading pre{max-width:100%;overflow:auto;font-size:.84rem;line-height:1.68}
.gb-reading .gb-evidence-details{margin:24px 0;border-block:1px solid var(--gb-line)}.gb-reading .gb-evidence-details>summary{display:flex;justify-content:space-between;gap:16px;padding:15px 2px;color:var(--gb-ink);cursor:pointer;font:700 .86rem/1.4 var(--sans)}.gb-reading .gb-evidence-details>summary span:last-child{color:var(--gb-soft);font-weight:500}.gb-reading .gb-evidence-details .gb-figure{margin:8px 0 26px}
.gb-reading .gb-case-path{margin:18px 0 24px;padding-left:1.25rem}.gb-reading .gb-case-path li{margin:.55rem 0;padding-left:.25rem}
@media(max-width:760px){.article-shell-deck .article-header{max-width:100%}.gb-reading .gb-metrics{grid-template-columns:1fr 1fr}.gb-reading .gb-metric:nth-child(2){border-right:0}.gb-reading .gb-metric:nth-child(-n+2){border-bottom:1px solid var(--gb-line)}.gb-reading .gb-flow{grid-template-columns:1fr 1fr}.gb-reading .gb-flow li:last-child{grid-column:1/-1}.gb-reading .gb-deck>summary{align-items:flex-start}.gb-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.gb-reading .gb-flow{grid-template-columns:1fr}.gb-reading .gb-flow li:last-child{grid-column:auto}.gb-reading .gb-deck>summary{display:grid}.gb-reading .gb-deck-action{justify-self:start}.gb-reading .gb-metric{min-height:94px;padding:14px 11px}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,920px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="gb-reading">

<p class="gb-paper-meta">Xiuhui Zhang, Yi Chen, Shusheng Xu, Fan Li, Huan Wang, Tongkai Yang, Binhang Yuan · arXiv:2609.21293 · 2026-09-18</p>

<div class="gb-source-links">
  <a href="https://arxiv.org/abs/2609.21293">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.21293">论文 PDF</a>
  <a href="https://github.com/areal-project/GameASG-Bench">官方代码与 47 个任务</a>
  <a href="https://papers.cool/arxiv/2609.21293">papers.cool FAQ</a>
</div>

<details class="gb-deck" id="interactive-deck" open>
  <summary>
    <span class="gb-deck-title"><small>INTERACTIVE PAPER DECK</small><strong>26 页交互图解：从评测规则到真实输入检查</strong></span>
    <span class="gb-deck-action">展开阅读</span>
  </summary>
  <div class="gb-player-shell">
    <div class="post-deck-embed">
      <div class="post-deck-embed-frame">
        <iframe src="/lib/decks/gameasg-bench-visual-guide.html" title="GameASG-Bench 论文图解，共 26 页" allow="fullscreen" allowfullscreen loading="eager"></iframe>
      </div>
      <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机端建议横屏阅读</span></p>
    </div>
    <div class="gb-deck-links"><a href="/lib/decks/gameasg-bench-visual-guide.html">沉浸模式 ↗</a></div>
  </div>
</details>

<p class="gb-lead">GameASG-Bench 检查 Coding Agent 交付的游戏能否真正响应玩家输入、随游戏时钟正常运行，并把变化显示在画面上。最佳配置的平均 L2 通过率达到 93.2%，完整通过全部必需检查的任务却只有 26/47。多数单项检查通过，不等于整款游戏的功能已经接通。</p>

<div class="gb-metrics" aria-label="GameASG-Bench 关键数字">
  <div class="gb-metric"><strong>47</strong><span>浏览器游戏任务，覆盖 12 种游戏类型</span></div>
  <div class="gb-metric"><strong>1,221</strong><span>336 条 L1，加上 885 条 L2</span></div>
  <div class="gb-metric"><strong>93.2%</strong><span>最佳配置的平均 L2 通过率</span></div>
  <div class="gb-metric"><strong>26/47</strong><span>最佳配置完整通过，即 55.3%</span></div>
</div>

## Q1: 这篇论文试图解决什么问题？

论文记录了一个很能说明问题的失败样例：GPT-6-Astra 生成的餐厅服务游戏 Diner Dasher 能正常启动，评测接口也可以调用，并且通过了 L1（源码层检查），以及 L2 的 P0（运行前提）和 P2（扩展功能）检查。但当评测器像玩家一样把餐点拖给顾客时，订单没有任何变化。也就是说，源码和测试接口分别看都像正常，真正的拖拽却没有触发订单状态更新。

GameASG-Bench 要测的是 Coding Agent 交付的完整应用是否满足每一项核心行为需求。哪怕只是一个小型游戏，也要让输入处理、状态变化、画面反馈、得分与资源变化、胜负判断和重启在同一份程序里协调工作。任何一个环节没有接通，程序都可能“能打开但不能玩”。函数级输入输出测试和源码扫描只能看到局部；笼统的“看起来可玩”评分又说不清究竟是哪条需求失败。

更棘手的是，同一个任务可以有完全不同的代码结构。评测器不能假定某个变量叫什么，也不能假定状态一定存在某个对象里。如果测试直接读写某份实现内部的变量或数据结构，也就是论文所说的 private implementation，换一种写法后测试就可能失效。反过来，有些机制只会在游戏后期或很少出现的局面中触发。论文把这类测试起点称为 rare or late-game preconditions。如果每次都从开局靠 GUI 玩到那里，测试会很慢，也容易受操作时序影响。

论文因此让任务作者在生成前写好一份统一的评测接口规范（evaluation interface specification）。Agent 按规范提供接口；评测器再通过这个接口把游戏带到一个正常游玩也能到达的起始状态，执行玩家动作，并读取约定好的状态字段。隐藏检查还会按需核对真实键鼠输入、游戏时钟是否继续推进、Canvas/WebGL 是否实际绘制，以及浏览器有没有报错。

## Q2: 有哪些相关研究？

相关工作可以按“评什么、怎样改进生成、怎样验证游戏”分成三类：

- APPS、EvalPlus 评测输入和输出边界明确的程序题；SWE-bench 把范围扩展到已有仓库中的 issue 修复。WebGen-Bench、E2EDev 开始评测完整应用，Vision2Web 和 VISTA 还会检查视觉与交互结果。
- GameGPT、Play2Code、ALIVE 和 GameCWM 等工作分别用多角色协作、自动试玩和程序执行反馈来改进生成或训练。它们关心的是怎样借助这些机制把游戏做得更好。
- WebGameBench、GameCraft-Bench、GameGen-Verifier 和 GameXpert-Bench 直接评测生成出来的游戏。它们与本文最接近，区别主要在三个地方：评测规则是在生成前还是生成后确定，测试怎样把游戏带到目标场景，以及最后依据哪些证据判定结果。

### 与最接近的游戏基准相比，它新在哪里

下表从三个方面比较这些工作：评测对象是什么，怎样把游戏带到待测场景，用什么证据判定结果。GameASG-Bench 的区别在于，公开的评测接口规范和隐藏检查都在生成前定稿，之后再用同一套断言评测同一任务的不同实现。

<div class="gb-table-scroll">
<table>
  <thead><tr><th>工作</th><th>评测对象与证据</th><th>与 GameASG-Bench 的关键差别</th></tr></thead>
  <tbody>
    <tr><td><a href="https://arxiv.org/abs/2105.09938">APPS</a> / <a href="https://arxiv.org/abs/2305.01210">EvalPlus</a></td><td>范围明确的函数级编程题，以输入输出测试为主</td><td>还要检查完整应用中的连续输入、状态变化、画面反馈和胜负结果</td></tr>
    <tr><td><a href="https://www.swebench.com/">SWE-bench</a></td><td>已有仓库中的 issue 修复，沿用项目测试</td><td>从空工作区生成完整单页游戏，并实现统一评测接口</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>浏览器游戏，按规格驱动浏览器操作</td><td>生成前声明合法起点、玩家动作、观察字段和 invariant（执行前后都必须成立的条件）</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>完整 Godot 项目；候选需提供包含场景初始化的可重放演示，再按隐藏 rubric（评分规则）检查回放证据</td><td>统一交付浏览器 <code>index.html</code>，使用固定的 L1/L2 检查</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.07442">GameGen-Verifier</a></td><td>从规格抽取 precondition → interaction → postcondition（前置条件 → 交互 → 后置条件）检查点，再向每个实现注入运行时状态</td><td>场景含义由任务作者预先确定，加载场景不能直接制造待测结果</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2608.21833">GameXpert-Bench</a></td><td>生成完成后，汇总各个游戏实现中的事件，再经人工审核形成共享 rubric</td><td>规格和可执行检查在生成前定稿，之后不随候选实现改动</td></tr>
  </tbody>
</table>
</div>

## Q3: 论文如何解决这个问题？

GameASG-Bench 的核心做法，是让每个任务在开始生成之前就带上一份公开的评测接口规范（evaluation interface specification）。任务作者会在里面说明怎样准备场景、执行哪些玩家动作、读取哪些状态，以及非法动作应如何拒绝。Agent 在编写游戏时还要按规范提供这套接口；隐藏的 L1/L2 检查再验证源码和浏览器中的实际行为。规范和检查一旦定稿，就不会针对某个 Agent 的提交临时修改。

### 47 个任务如何选出来

每个任务都必须包含一个完整、可在限时浏览器测试中跑完的玩法循环：玩家输入会改变游戏状态，随后能看到进展或胜负结果，游戏也能重新开始。依赖后端、账号、外部数据库、付费或私有资产的设计，以及无法在一次限时测试中完整运行的多人系统，都被排除在外。最终任务集覆盖 12 类游戏，其中 32 个是 2D，15 个是 3D。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/figure-1-corpus.png"><img src="/lib/papers/gameasg-bench/figure-1-corpus.png" alt="GameASG-Bench 47 个任务的类型、2D/3D 与参考实现技术分布"></a>
  <figcaption><strong>原论文 Figure 1。</strong>参考实现主要使用 Canvas 2D 和 Three.js。图中的 technology 一栏只记录参考实现采用的渲染技术，不要求 Agent 使用同一种技术。点击图片可查看原尺寸。</figcaption>
</figure>

### 公开文档与隐藏检查从哪里来

任务作者在生成前人工写好并固定玩法规格、评测接口规范、L1/L2 检查和 P0/P1/P2 优先级。这些材料不会根据 Agent 提交的代码临时改写。Agent 能读到 <code>target.md</code>、<code>game-spec.md</code> 和 <code>tdd.md</code>，看不到 <code>checks.json</code>、<code>checks.js</code>、参考实现或历史报告。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-1-task-documents.png"><img src="/lib/papers/gameasg-bench/table-1-task-documents.png" alt="原论文 Table 1：三份任务文档及其作用"></a>
  <figcaption><strong>原论文 Table 1。</strong>三份文档都放在 Agent 的工作区中；只有 <code>target.md</code> 会由 harness（负责启动和管理 Agent 的运行框架）直接写入提示词，另外两份需要 Agent 自行读取。</figcaption>
</figure>

<div class="gb-table-scroll">
<table>
  <thead><tr><th>材料</th><th>谁写、谁看</th><th>用途</th></tr></thead>
  <tbody>
    <tr><td><code>target.md</code></td><td>人类任务作者；Agent 可见</td><td>工作区规则、交付协议、简短玩法说明</td></tr>
    <tr><td><code>game-spec.md</code></td><td>人类任务作者；Agent 可见</td><td>玩家可见的玩法机制、操作方式、反馈、胜负条件和最低可玩循环</td></tr>
    <tr><td><code>tdd.md</code></td><td>人类任务作者；Agent 可见</td><td>怎样准备场景、执行动作和读取状态；非法动作如何拒绝；哪些条件必须保持不变</td></tr>
    <tr><td><code>checks.json</code></td><td>人类任务作者；对 Agent 隐藏</td><td>L1 的结构或语法检查、正则断言与 anti-pattern（明确禁止的源码写法）检查</td></tr>
    <tr><td><code>checks.js</code></td><td>人类任务作者；对 Agent 隐藏</td><td>L2 浏览器行为检查</td></tr>
    <tr><td>参考实现</td><td>作者团队；不交给 Agent</td><td>先由人独立试玩确认符合核心需求，再运行同一套检查，作为 positive control（已知应当通过的正确样例）</td></tr>
  </tbody>
</table>
</div>

<ol class="gb-flow" aria-label="从任务概念到固定评测的五步流程">
  <li><b>01 · 选题</b><span>筛出玩法循环完整、能在浏览器中复现的游戏任务。</span></li>
  <li><b>02 · 写规格</b><span>写清玩家可见需求与最低可玩循环。</span></li>
  <li><b>03 · 写接口规范</b><span>定义合法场景、玩家动作、快照字段与必须保持成立的条件。</span></li>
  <li><b>04 · 写检查</b><span>把需求写成隐藏的 L1/L2 断言，并标注优先级。</span></li>
  <li><b>05 · 验证</b><span>人工试玩参考实现，再运行固定检查；通过后才开始生成。</span></li>
</ol>

作者先对 47 份参考实现分别做人工验证，确认真实操作、核心状态变化、胜负与重启都符合规格，再让它们运行同一套 L1/L2 检查。所有参考实现均通过全部 L1 和适用的 L2 P0/P1，因此可以充当 positive control。不过，论文没有报告 mutation testing（人为注入缺陷后看测试能否发现）或 negative control（已知应当失败的错误样例），因此无法量化这套测试会漏掉多少错误实现。

### 统一接口如何适配不同实现

Agent 最终交付一份可独立运行的 <code>index.html</code>，不依赖后端服务或外部数据。生成和评测分别运行在两个隔离容器中。评测开始前，系统先确认生成进程正常退出，并检查文件存在、不是符号链接、内容非空且包含 <code>&lt;/html&gt;</code>；通过这些预检后，提交的 HTML 和测试脚本才会以只读方式挂载到评测容器。

每个游戏都提供同一个全局入口；具体有哪些场景、动作和状态字段，则由对应任务的 <code>tdd.md</code> 规定：

```js
window.__gameTest = {
  reset(options),
  loadScenario(name, options),
  input(action),
  getSnapshot()
}
```

<code>loadScenario</code> 可以调整资源和位置，把游戏置于正常游玩也能到达的合法状态；但它不能提前制造待测结果，例如一加载就判定胜负。这样既省掉了从开局一路操作的时间，也能保证待测结果仍由最后的玩家动作触发。

### L1、L2 与严格成功怎样计算

L1 不运行游戏，只检查交付的 HTML 及其本地脚本是否符合语法、接口声明、正则断言和 anti-pattern（已知的不合规写法）等要求。L1 只能证明这些源码层条件成立，不能证明游戏行为正确。

L2 在 headless Chromium（无界面浏览器）中真正运行游戏。每条检查都遵循 prepare → act → observe（准备场景 → 执行动作 → 观察结果）：先加载合法场景，再通过 <code>input(...)</code> 调用 <code>tdd.md</code> 中定义的 semantic action（与具体按键无关的玩法动作），或直接发送真实键鼠事件。最后，检查会结合 <code>getSnapshot</code> 返回的 JSON 状态摘要，以及浏览器侧的 Canvas/WebGL 绘制、动画循环（<code>requestAnimationFrame</code>）、正常时间推进和运行时异常来判定结果。每条检查只选取与当前需求有关的证据，不要求同时用上所有信号。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-2-check-counts.png"><img src="/lib/papers/gameasg-bench/table-2-check-counts.png" alt="原论文 Table 2：L1 与 L2 检查数量"></a>
  <figcaption><strong>原论文 Table 2。</strong>L1/L2 表示证据层级：L1 看源码，L2 看浏览器中的实际行为；P0/P1/P2 表示需求优先级：运行前提、核心需求和扩展能力。</figcaption>
</figure>

L1 共 336 条：43 条结构或语法类检查、288 条正则断言和 5 条 anti-pattern 检查。L2 共 885 条：102 条 P0、534 条 P1、249 条 P2；每条返回 <code>PASS</code>、<code>FAIL</code> 或 <code>NOT_APPLICABLE</code>。平均 L1 通过率与总体 L2 通过率，都是先算出每个完成评测任务的检查通过率，再对任务取平均；P0/P1/P2 则把所有适用检查汇总后计算。因此，93.2% 表示平均 L2 通过率，并非 93.2% 的任务完整通过。

论文的主指标叫 strict task success，下文称为“完整通过”。它不是平均分：一个任务只有在交付有效、评测完成，并且全部 L1 和所有适用的 L2 P0/P1 都通过时才记为 1；否则记为 0。P2 不参与这项判定。

<div class="gb-formula">
  <code>s_g = delivery_g · evaluation_g · ∏ pass(g,c),　c ∈ L1_g ∪ L2(P0,P1)_g</code>
  <code>StrictSuccess = (1 / 47) · Σ s_g</code>
  <span>任意一条 L1 或适用的 L2 P0/P1 失败，整题记为 0。</span>
</div>

论文还明确提示：当前评测程序（runner）计算分数时会忽略返回 <code>NOT_APPLICABLE</code> 的检查，但没有限制 P1 使用这个返回值。这样一来，某条本应检查核心需求的 P1 也可能被当成“不适用”，从而不影响任务能否完整通过。这是解读结果时需要留意的计分细节。

### 真实案例：Armor Alley 的持续射击

Armor Alley 是一款横向卷轴直升机战术游戏。任务规格中的“按住时持续开火，松开后停止”还不能直接拿来自动验收。作者先在公开文档中定义动作和合法场景，再用隐藏的源码检查确认接口存在，最后在浏览器里发送真实按键，验证按下和松开后的状态变化。对应的官方文件可直接核对：[game-spec.md](https://github.com/areal-project/GameASG-Bench/blob/main/task/armor-alley/game-spec.md)、[tdd.md](https://github.com/areal-project/GameASG-Bench/blob/main/task/armor-alley/tdd.md)、[checks.json](https://github.com/areal-project/GameASG-Bench/blob/main/tests/armor-alley/checks.json)、[checks.js](https://github.com/areal-project/GameASG-Bench/blob/main/tests/armor-alley/checks.js)。

<div class="gb-note blue">
  <p><code>game-spec.md</code> 要求：按住时持续耗弹并产生可见弹丸；松开后停止。</p>
  <p><code>tdd.md</code> 定义了 <code>air_attack_with_targets</code> 场景：直升机仍有可用武器，场上至少有一个能够接近或锁定的敌方单位或威胁。加载场景时不能让目标预先受击，也不能在玩家动作发生前就计入伤害或移除目标。</p>
</div>

<code>checks.json</code> 中有一条 P0 正则检查，用来确认四个接口方法同时存在。下面的示意代码保留了原检查的字段和含义；官方版本使用了更完整的正则，以兼容多种 JavaScript 写法：

```json
{
  "id": "p0-contract-methods-reset-input-snapshot",
  "level": "P0",
  "type": "regex_all",
  "patterns": ["reset", "loadScenario", "input", "getSnapshot"],
  "fix_hint": "Define reset, loadScenario, input, and getSnapshot on window.__gameTest."
}
```

L1 到这里仍只证明源码中存在所需的接口声明。L2 真正测试开火时，不会调用 <code>input({type: "holdFire"})</code>，而是直接向浏览器发送 Space 键事件。松开 Space 后，评测辅助函数（helper）会再等待一段时间，观察游戏是否停止连续射击：

```js
const setup = await legalScenario(
  game,
  'air_attack_with_targets',
  s => s.phase === 'playing' &&
       s.result === 'none' &&
       s.helicopter?.airborne
);
if (!setup.ok) return FAIL(setup.detail);

const before = setup.snap;
await browser.keyDown('Space');
await browser.sleep(650);
const held = await game.snapshot();

await browser.keyUp('Space');
await browser.sleep(300);
const released = await game.snapshot();
const afterRelease = await game.wait(550);

const grewWhileHeld =
  count(held, 'projectiles') > count(before, 'projectiles') ||
  rev(held, 'combat') > rev(before, 'combat') ||
  num(held.helicopter?.ammo?.current) <
    num(before.helicopter?.ammo?.current);

const plateauAfterRelease =
  count(afterRelease, 'projectiles') <=
    count(released, 'projectiles') + 1 ||
  rev(afterRelease, 'projectiles') ===
    rev(released, 'projectiles');

if (!grewWhileHeld) return FAIL('held fire produced no evidence');
if (!plateauAfterRelease) return FAIL('fire continued after release');
return PASS('real key path creates and stops sustained fire');
```

加载合法场景后，测试会直接在浏览器中按下 Space，并在 650 ms 后读取状态快照。如果弹丸数增加、combat revision（记录战斗状态变化的计数）增加，或者弹药减少，就说明按住期间确实发生了开火。松开 Space 后，测试会隔一段时间读取两次状态快照。如果弹丸数最多只增加 1，或者 projectile revision（弹丸变化计数）不再增长，就认为连续射击已经停止。这样既能发现“测试接口可以开火，但真实按键没有接上”，也能发现一些松开按键后仍在连续射击的错误实现。

不过，这条隐藏检查也暴露了公开规格与实际检查之间的缺口。公开的 <code>game-spec.md</code> 只要求“按住时开火、松开后停止”，<code>tdd.md</code> 只定义 <code>holdFire</code> 这个玩法动作，两者都没有规定开火键必须是 Space。某个提交即使完整实现了公开要求，只要使用了其他开火键，仍会被这条隐藏检查判为失败。真实按键检查本身有价值，但它依赖的按键映射也必须写进公开规格。

## Q4: 论文做了哪些实验？

论文先用 47 份参考实现确认评测器能接受人工验证过的正确实现，随后回答四个研究问题。每种“任务 × 配置”组合只运行一次，且都从空白工作区开始；L2 评测统一在 1280×800 的无头 Chromium 中执行。因此，这些结果可以用来观察失败模式，却无法告诉我们同一配置重跑时会波动多大。

### RQ1：九种模型与运行框架组合能交付多少完整游戏

论文把“模型 + coding harness”称为 agent stack。这里的 harness 不是某个测试脚本，而是让模型实际工作的整套执行环境，负责系统指令、上下文管理和工具调用。例如，GPT-6-Astra + Codex CLI 就是一个 stack。RQ1 比较了九种 stack，每种都使用该模型可用的最高一档 reasoning effort（推理强度）和完整工具权限。主指标是完整通过率；平均 L1、平均 L2 以及按 P0/P1/P2 拆开的通过率，则用于判断失败发生在哪一层。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-3-leaderboard.png"><img src="/lib/papers/gameasg-bench/table-3-leaderboard.png" alt="原论文 Table 3：九个模型与 harness 组合的严格成功率和检查通过率"></a>
  <figcaption><strong>原论文 Table 3。</strong>GPT-6-Astra + Codex CLI 的平均 L2 通过率为 93.2%，但 47 个任务中只有 26 个通过全部必选检查，另外 21 个至少失败了一项。</figcaption>
</figure>

- 九种 stack 的平均 L1 通过率都在 97.7% 至 99.6%，完整通过的任务数却只有 7/47 至 26/47。这说明多数产物都能通过检查源码结构和接口声明的 L1，但到了真实运行阶段，关键操作仍经常无法完成。
- GPT-5.6-Sol 的平均 L2 为 91.3%，高于 Claude-Opus-5 的 90.4%；但完整通过数反而分别是 21/47 和 24/47。按平均检查通过率排序，和按完整通过的任务数排序，结论并不一样。
- Table 4 也看不出“交付物越大、token（模型处理的文本单位）消耗越多，完整通过的任务就越多”这一关系。

### RQ2：工具权限和轮次上限会怎样影响结果

这组消融实验固定使用 DeepSeek-V4-Flash、Claude Code 和 Maximum reasoning effort，只改变 Agent 可以使用的工具。四种条件分别是：不提供工作区文件，而是把输入序列化后直接交给 API；只允许读写文件；允许读写文件并运行语法检查；开放全部工具。四种条件下完整通过的任务数依次为 7/47、6/47、9/47 和 18/47。

不过，“全部工具”同时增加了多种能力，并不只是多了浏览器。因此，Table 5 无法单独算出浏览器执行贡献了多少提升。附录中的运行轨迹（trace）只能说明，在部分具体案例里，浏览器测试确实让 Agent 在提交前发现了行为错误。

把轮次上限分别设为 30、60 和 120 后，完成评测的任务数依次为 10、32、47，完整通过数依次为 7、13、18，分母均为全部 47 个计划任务。轮次上限越高，越多任务能在 Agent 被强制停止前完成生成和交付，因而进入评测。

### RQ3：更多推理不一定带来更多完整通过

在 Low、High、Maximum 三档推理强度下，完整通过数分别为 7/47、19/47 和 18/47；P1 通过率则分别为 71.7%、82.7% 和 86.7%。Maximum 虽然通过了更多 P1 核心检查，却比 High 少完整通过 1 个任务。High 使用的 reasoning tokens（用于模型内部推理的 token）还比 Maximum 少 26.9%。

### RQ4：同一个模型换一套 harness，结果会变吗

DeepSeek-V4-Flash 在 Claude Code 和 Codex CLI 下都完整通过了 18/47 个任务，但真正重合的成功任务只有 10 个；另外各有 8 个任务只在其中一个 harness 下成功，剩下 21 个在两边都失败。换一个 harness，模型做成的可能是另一批任务。这里比较的是两套完整运行环境，包括系统指令、上下文管理、工具接口格式（schema）、命令执行方式，以及与模型服务通信的接口协议。因此，差异不能只归因于模型本身。

<details class="gb-evidence-details">
  <summary><span>展开 RQ1 至 RQ4 的原始消融表</span><span>原论文 Tables 4 至 8</span></summary>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-4-resource-use.png"><img src="/lib/papers/gameasg-bench/table-4-resource-use.png" alt="原论文 Table 4：生成文件大小、token 和报告成本"></a><figcaption><strong>Table 4。</strong>token 用得更多、生成文件更大，都不意味着会完整通过更多任务。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-5-tool-ablation.png"><img src="/lib/papers/gameasg-bench/table-5-tool-ablation.png" alt="原论文 Table 5：工具权限消融"></a><figcaption><strong>Table 5。</strong>完整工具配置下有 18/47 个任务完整通过，无工具配置下为 7/47。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-6-turn-budget.png"><img src="/lib/papers/gameasg-bench/table-6-turn-budget.png" alt="原论文 Table 6：30、60、120 轮预算"></a><figcaption><strong>Table 6。</strong>轮次太少时，许多任务在完成生成和交付之前就达到轮次上限，因此无法进入评测。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-7-reasoning-effort.png"><img src="/lib/papers/gameasg-bench/table-7-reasoning-effort.png" alt="原论文 Table 7：推理强度比较"></a><figcaption><strong>Table 7。</strong>High 完整通过 19/47，Maximum 为 18/47；但 Maximum 的 P1 通过率更高。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-8-harness.png"><img src="/lib/papers/gameasg-bench/table-8-harness.png" alt="原论文 Table 8：Claude Code 与 Codex CLI harness 比较"></a><figcaption><strong>Table 8。</strong>两种 harness 的完整通过数相同，做成的却不是同一批任务。</figcaption></figure>
</details>

### 两个真实失败样例

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-9-diagnostics.png"><img src="/lib/papers/gameasg-bench/table-9-diagnostics.png" alt="原论文 Table 9：Diner Dasher 与 Turbo Smash Beast 的诊断证据"></a>
  <figcaption><strong>原论文 Table 9。</strong>Diner Dasher 在真实拖拽时失败；Turbo Smash Beast 则在加载场景后停止随真实时间推进。</figcaption>
</figure>

#### Diner Dasher：餐点就在托盘上，拖给顾客却没有完成上菜

<ol class="gb-case-path">
  <li>加载 <code>tray_with_correct_item</code> 后，从 snapshot（状态摘要）中取得托盘餐点和顾客在屏幕上的矩形坐标（bounds）。</li>
  <li>测试通过 CDP（Chrome DevTools Protocol，浏览器控制协议）发送真实鼠标事件，把餐点从一个矩形的中心拖到顾客矩形的中心。</li>
  <li>拖拽后，已完成的订单项数、当日收入、已服务顾客数三者中至少有一个必须增加；如果订单项的 <code>served</code> 计数增加，托盘中的餐点数量还必须减少。</li>
  <li>如果能读取 Canvas hash（画面内容摘要），那么它或 <code>renderRevision</code>（渲染版本号）也必须变化，用来证明画面确实更新了。</li>
</ol>

论文中由 GPT-6-Astra 生成的 Diner Dasher 通过了 L1 和 L2 P0/P2。它能通过评测接口返回状态，画面也能正常显示，但真实的鼠标和触摸拖拽都无法完成上菜。下面的代码从<a href="https://github.com/areal-project/GameASG-Bench/blob/main/tests/diner-dasher/checks.js">官方检查</a>中删去了兼容不同实现的分支，只保留核心逻辑；完整版本还会检查坐标是否合法，以及上菜后托盘中的餐点是否减少。

```js
const setup = await game.loadScenario('tray_with_correct_item');
const from = center(firstTrayItem(setup)?.bounds);
const to = center(firstCustomer(setup)?.bounds);
const beforeHash = await game.canvasHash();

await game.realMouseDrag(from, to);
const after = await game.snapshot();
const afterHash = await game.canvasHash();

if (!serviceProgressed(setup, after))
  return FAIL('correct real drag produced no service progress');
if (beforeHash === afterHash &&
    after.observability?.renderRevision === setup.observability?.renderRevision)
  return FAIL('no visible render evidence changed');
```

#### Turbo Smash Beast：加载测试场景后，游戏时钟不再自动前进

在这个失败实现里，调用 <code>reset</code> 或 <code>loadScenario</code> 会开启 test mode（测试模式），同时关闭 natural-time simulation。这里的 natural time 指游戏随真实等待自动更新，而不是由测试接口手动推进时间。进入 test mode 后，如果接口不显式推进时间，游戏状态就不会继续变化。

Agent 在生成时分别测试过两条路径：一条通过接口手动推进时间，另一条在刚打开的页面里用真实输入驾驶。两条路径单独测试时都能工作。

L2 检查却把两者接在一起：先加载 <code>readyUnlockedLevel</code>，再持续按住鼠标 350 ms，并继续等待 450 ms。此时 <code>speedRatio</code>（速度比例）没有继续上升，<code>forwardProgress</code>（前进进度）、<code>motionRevision</code>（运动状态版本号）和 HUD 速度也没有发生应有变化。

这两类错误只有在一次测试中连续执行多个步骤才会暴露：先准备场景，再发送真实输入，让游戏随真实时间推进，最后核对内部状态和画面反馈。分开测试其中每一步，可能发现不了它们接在一起时出了问题。

## Q5: 有什么可以进一步探索的点？

论文没有单列 Future Work（未来工作）一节。以下六点是本文根据实验结果和当前评测尚未覆盖的部分提出的后续方向，并非论文已经验证的结论。

1. **按失败情况分配推理和工具预算。** High effort 比 Maximum 少用 26.9% 的 reasoning tokens，却完整通过了 19/47 个任务；Maximum 为 18/47。在另一组实验中，完整工具权限下的完整通过数也高于三种受限配置。后续可以让 Agent 根据浏览器返回的失败证据选择下一步：继续推理、只运行 syntax check（语法检查），还是打开浏览器做行为测试。
2. **让 Agent 根据 L2 失败继续修复。** 当前基准主要在生成结束后评分。可以把被破坏的 invariant（执行前后必须成立的约束）、没有走通的真实输入路径和画面更新情况反馈给 Agent，让它继续修改。然后再比较这种“测试失败后继续修复”的流程，究竟提高了完整通过率，还是只多通过了一些局部检查。
3. **自动生成评测规则，但保留独立审核。** <code>tdd.md</code>、<code>checks.json</code> 和 <code>checks.js</code> 目前由人编写。后续可以研究如何从玩法规格中提取场景、动作和 invariant；自动生成的检查仍需独立审核，避免生成代码和生成测试以同一种方式误解需求，导致错误实现也被判为正确。
4. **检查公开规格与隐藏检查是否对齐。** Armor Alley 的公开规格只要求“按住/松开开火”，隐藏检查却固定发送 Space 键，说明真实输入所依赖的按键也应公开。P1 返回 <code>NOT_APPLICABLE</code> 的情况同样需要限制或单独报告。还可以加入 mutation testing（故意向正确实现注入错误）和 negative controls（已知错误样例），估计评测器会漏掉多少错误实现。
5. **同一配置多跑几次，并拆分 harness 的影响。** 当前每种配置只运行一次。同一配置重复运行，才能估计结果会波动多大；再逐项改变系统提示、上下文管理和工具策略，才能分清差异来自随机性、模型本身还是运行框架。
6. **增加新的证据和任务类型。** 现有评测可以继续加入视觉模型对画面的判断，以及帧率、内存占用和快速连续输入等检查，也可以迁移到其他前端应用。后端、多人游戏和大型 asset pipeline（批量制作、处理和打包游戏资源的流程）则需要新的隔离方式与状态控制方案。

## Q6: 总结一下论文的主要内容

GameASG-Bench 包含 47 个可以独立运行的浏览器游戏任务，用来测试 Agent 能否根据自然语言需求交付一个完整可玩的游戏。任务作者在生成前手工写好公开的玩法规格和评测接口，同时把对 Agent 隐藏的 L1/L2 检查固定下来。Agent 要交付 <code>index.html</code>，并实现 <code>window.__gameTest</code>。

评测时，系统既读取游戏通过评测接口返回的结构化状态，也会发送真实键鼠事件，让游戏随真实时间运行，并检查画面是否更新、浏览器是否报错。只有 Agent 成功交付有效文件、评测完整跑完，且所有 L1 以及适用的 L2 P0/P1 都通过，这个任务才算完整通过。最佳 stack 的平均 L2 通过率达到 93.2%，完整通过的任务却仍只有 26/47。这说明“通过大多数检查”和“整个任务全部验收通过”相差很大。

### 这些数字应当怎样解读

- 47 个任务都是可以独立运行的浏览器单页，结果不能直接用于判断后端、多人游戏和大型游戏资源制作流程的生成能力。
- 每种配置只运行一次，因此论文无法估计同一配置重跑时的波动，表中的名次也不应视为稳定的能力排名。
- 分数既反映游戏实现能力，也反映 Agent 是否准确遵守公开的评测接口规范。Armor Alley 的公开规格只要求“按住/松开开火”，隐藏检查却固定发送 Space 键，说明分数还会受到隐藏检查是否与公开规格对齐的影响。
- 参考实现只能证明正确实现能通过这套检查，它们是 positive control（已知应当通过的正确样例）。论文没有系统性地构造“已知有错”的实现作为 negative control（已知应当失败的错误样例），因此仍可能有错误未被检查捕获，却被计为完整通过。
- L1 的正则可能只是匹配到注释；评测程序又没有禁止 P1 返回 <code>NOT_APPLICABLE</code>，并会把这类结果排除在分母之外。因此，解读总分时还需要查看具体检查结果。

把这套方法迁移到其他应用时，至少要在生成前写清五件事：测试从哪个可由正常操作到达的状态开始，执行什么动作，预期看到什么结果，非法动作应怎样处理，以及哪些条件在执行前后都必须成立（invariants）。测试场景只能把应用带到准备状态，不能直接制造待测结果。

验收时，既要读取应用通过测试接口返回的结构化状态，也要用真实输入和真实等待来操作它，再核对画面变化与运行时错误。报告中应同时列出单条检查通过率和完整任务通过率。比较不同配置时，模型、harness、工具权限和预算也应作为一个整体来报告。

论文：[GameASG-Bench: Benchmarking Autonomous Software Generation for Game Development](https://arxiv.org/abs/2609.21293)。代码与任务：[areal-project/GameASG-Bench](https://github.com/areal-project/GameASG-Bench)。本文原图均裁自论文，流程与代码解读依据论文第 2 至 5 节及官方仓库整理。

</div>

---
title: "GameASG-Bench 如何验证一个游戏真的做完了"
permalink: "/posts/论文解读/gameasg-bench.html"
date: "2026-09-21T21:31:01+08:00"
updated: "2026-09-22T12:00:00+08:00"
cover: "/generated-covers/046-gameasg-bench.webp"
description: "从冻结测试契约、Armor Alley 真实断言和两类失败样例，拆解 GameASG-Bench 如何验收 47 个浏览器游戏任务。"
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
    <span class="gb-deck-title"><small>INTERACTIVE PAPER DECK</small><strong>26 页交互图解：从任务契约到真实输入检查</strong></span>
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

<p class="gb-lead">GameASG-Bench 检查 Coding Agent 交付的游戏能否在真实输入、自然时间和可见画面中完成需求。最佳组合的平均 L2 通过率达到 93.2%，最终完整通过的任务仍只有 26/47。这个差距对应论文要测的集成失败。</p>

<div class="gb-metrics" aria-label="GameASG-Bench 关键数字">
  <div class="gb-metric"><strong>47</strong><span>浏览器游戏任务，覆盖 12 个类型</span></div>
  <div class="gb-metric"><strong>1,221</strong><span>336 条 L1，加上 885 条 L2</span></div>
  <div class="gb-metric"><strong>93.2%</strong><span>最佳 agent stack 的平均 L2</span></div>
  <div class="gb-metric"><strong>26/47</strong><span>最佳严格成功数，即 55.3%</span></div>
</div>

## Q1: 这篇论文试图解决什么问题？

一个 GPT-6-Astra 生成的 Diner Dasher 能启动，测试接口也可调用，L1 以及 L2 的 P0、P2 均通过。玩家把餐点拖给顾客时，订单却没有任何进展。源码、接口字段和浏览器画面分别证明了局部功能存在，真实玩家路径仍然断开。

GameASG-Bench 要测的是 Coding Agent 交付的完整应用是否满足每一项核心行为需求。游戏把输入、状态机、动画、渲染、资源、终局和重启放在同一个持续运行的系统中，任何一处接线错误都可能让“能打开”的程序无法游玩。函数测试和源码扫描很难覆盖这种集成失败，单一的“看起来可玩”评分又无法指出究竟坏在哪里。

难点还在于，47 个候选可以采用完全不同的内部结构。测试如果直接改写私有变量，就会绑定某个对象名或数据结构；只从 GUI 重新玩到稀有状态，又慢且不稳定。论文因此把一层语义评测契约放进生成任务，再用真实键鼠、自然时间、状态快照、Canvas/WebGL 活动和运行时异常交叉验证。

## Q2: 有哪些相关研究？

论文把相关工作分成三条线，三者解决的问题并不相同：

- APPS、EvalPlus 把正确性落实到有界程序的输入输出，SWE-bench 把任务扩展到已有仓库中的 issue 修复；WebGen-Bench、E2EDev 继续走向完整应用，Vision2Web 和 VISTA 更强调视觉与交互证据。
- GameGPT、Play2Code、ALIVE 和 GameCWM 等工作把角色协作、自动游玩或执行反馈用于生成、测试与训练，重点是怎样让生成过程变好。
- WebGameBench、GameCraft-Bench、GameGen-Verifier 和 GameXpert-Bench 评估游戏生成及其行为验证，GameXpert-Bench 还覆盖修复与多轮优化。它们与本文最接近，关键差别在于评测契约何时产生、场景如何准备、最终依据什么证据判定。

### 最接近的基准怎样划分边界

下表比较任务起点和正确性定义。GameASG-Bench 的区别是，在候选生成前固定公开接口和隐藏检查，随后用同一组断言复跑不同实现。

<div class="gb-table-scroll">
<table>
  <thead><tr><th>工作</th><th>评测对象与证据</th><th>GameASG-Bench 补上的部分</th></tr></thead>
  <tbody>
    <tr><td><a href="https://arxiv.org/abs/2105.09938">APPS</a> / <a href="https://arxiv.org/abs/2305.01210">EvalPlus</a></td><td>函数程序，以输入输出测试为主</td><td>完整应用中的连续输入、状态、渲染和终局</td></tr>
    <tr><td><a href="https://www.swebench.com/">SWE-bench</a></td><td>已有仓库中的 issue 修复，沿用项目测试</td><td>从空工作区生成完整单页游戏，并实现统一评测接口</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>浏览器游戏，规格引导的浏览器交互</td><td>生成前声明合法场景、动作、观察和不变量</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>Godot 项目，以回放、场景初始化和隐藏 rubric 验收</td><td>统一为浏览器 <code>index.html</code>，使用固定 L1/L2 断言</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.07442">GameGen-Verifier</a></td><td>抽取 precondition-interaction-postcondition，再注入运行时状态</td><td>任务作者预先固定场景语义，场景不得直接制造待测结果</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2608.21833">GameXpert-Bench</a></td><td>生成后汇集事件并加入人工审核，形成共享 rubric</td><td>规格和可执行检查在候选生成前冻结，可跨实现复跑</td></tr>
  </tbody>
</table>
</div>

## Q3: 论文如何解决这个问题？

GameASG-Bench 先把“怎样观察行为”写进需求，再让 Agent 自由决定“怎样实现游戏”。公开接口负责建立可复现场景和读取语义状态，隐藏测试负责检查源码与真实运行；两者都在候选生成前冻结。

### 47 个任务如何选出来

每个任务都要有可在有限浏览器会话中完成的玩法循环：玩家输入改变状态，游戏给出可观察进展或终局，并能重启。依赖后端、账号、外部数据库、付费或私有资产、无界多人设施的设计被排除。最终语料覆盖 12 类游戏，其中 32 个为 2D，15 个为 3D。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/figure-1-corpus.png"><img src="/lib/papers/gameasg-bench/figure-1-corpus.png" alt="GameASG-Bench 47 个任务的类型、2D/3D 与参考实现技术分布"></a>
  <figcaption><strong>原论文 Figure 1。</strong>参考实现主要使用 Canvas 2D 和 Three.js；technology 不限制 Agent 的实现选择。点击图片可查看原尺寸。</figcaption>
</figure>

### 公开文档与隐藏检查从哪里来

任务作者在生成前人工编写并冻结玩法规格、接口规格、L1/L2 检查和 P0/P1/P2 优先级。它们不是模型根据候选代码临时生成的。Agent 能读到 <code>target.md</code>、<code>game-spec.md</code> 和 <code>tdd.md</code>，看不到 <code>checks.json</code>、<code>checks.js</code>、参考实现或历史报告。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-1-task-documents.png"><img src="/lib/papers/gameasg-bench/table-1-task-documents.png" alt="原论文 Table 1：三份任务文档及其作用"></a>
  <figcaption><strong>原论文 Table 1。</strong>三份任务文档都在 Agent 工作区内，只有 <code>target.md</code> 会由 harness 直接放进生成提示。</figcaption>
</figure>

<div class="gb-table-scroll">
<table>
  <thead><tr><th>材料</th><th>谁写、谁看</th><th>用途</th></tr></thead>
  <tbody>
    <tr><td><code>target.md</code></td><td>人类任务作者；Agent 可见</td><td>工作区规则、交付协议、简短玩法说明</td></tr>
    <tr><td><code>game-spec.md</code></td><td>人类任务作者；Agent 可见</td><td>控制、机制、反馈、终局和最低可玩循环</td></tr>
    <tr><td><code>tdd.md</code></td><td>人类任务作者；Agent 可见</td><td>合法场景、动作、快照字段、拒绝语义和不变量</td></tr>
    <tr><td><code>checks.json</code></td><td>人类任务作者；对 Agent 隐藏</td><td>L1 工具、正则和反模式检查</td></tr>
    <tr><td><code>checks.js</code></td><td>人类任务作者；对 Agent 隐藏</td><td>L2 浏览器行为检查</td></tr>
    <tr><td>参考实现</td><td>benchmark 团队；不交给 Agent</td><td>人工操作后运行同一套检查，作为正控制</td></tr>
  </tbody>
</table>
</div>

<ol class="gb-flow" aria-label="从任务概念到固定评测的五步流程">
  <li><b>01 · 选题</b><span>筛出有完整循环、可在浏览器内复现的概念。</span></li>
  <li><b>02 · 写规格</b><span>固定玩家可见需求与最低可玩循环。</span></li>
  <li><b>03 · 写契约</b><span>定义合法场景、动作、观察和不变量。</span></li>
  <li><b>04 · 写检查</b><span>把需求落成隐藏 L1/L2 断言并标优先级。</span></li>
  <li><b>05 · 验证</b><span>人工试玩参考实现，再跑固定检查；随后才生成候选。</span></li>
</ol>

47 份参考实现都经过人工试玩，并通过 L1 以及适用的 L2 P0/P1。这是正控制，说明检查至少接受一份人工确认可玩的实现。论文没有系统性的 mutation testing 或负控制，因此没有量化错误实现被漏检的概率。

### 统一接口怎样跨实现工作

Agent 最终交付一个自包含 <code>index.html</code>。生成与评测位于两个容器；系统先检查进程退出、文件存在且非符号链接、内容非空并包含 <code>&lt;/html&gt;</code>，再把提交和测试以只读方式挂进评测容器。

每个游戏都暴露同一个入口，具体场景名、动作和快照字段由本题的 <code>tdd.md</code> 决定：

```js
window.__gameTest = {
  reset(options),
  loadScenario(name, options),
  input(action),
  getSnapshot()
}
```

<code>loadScenario</code> 只能准备正常游玩可达的前置条件，不能直接造成胜利、伤害或得分。它解决的是“怎样稳定抵达待测状态”，不是替测试制造正确结果。

### L1、L2 与严格成功怎样计算

L1 读取交付文件，检查语法、接口声明、源码模式和反模式。L2 在无头 Chromium 中逐条打开新页面，执行 prepare、act、observe：加载合法场景，调用语义动作或发送真实键鼠，再比较快照、Canvas/WebGL 活动、animation frame、自然时间和运行时异常。每条检查只选与需求有关的证据，不要求所有信号同时出现。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-2-check-counts.png"><img src="/lib/papers/gameasg-bench/table-2-check-counts.png" alt="原论文 Table 2：L1 与 L2 检查数量"></a>
  <figcaption><strong>原论文 Table 2。</strong>L1/L2 表示源码证据与运行行为；P0/P1/P2 表示前置条件、核心需求和扩展能力，两套标签相互独立。</figcaption>
</figure>

L1 包含 43 条工具检查、288 条正则和 5 条反模式检查。L2 包含 102 条 P0、534 条 P1 和 249 条 P2，结果为 <code>PASS</code>、<code>FAIL</code> 或 <code>NOT_APPLICABLE</code>。Mean L1 和 overall L2 先算每题通过率再取平均；P0/P1/P2 汇总所有适用检查。93.2% 因此是平均 L2，不是完整成功率。

<div class="gb-formula">
  <code>s_g = delivery_g · evaluation_g · ∏ pass(g,c),　c ∈ L1_g ∪ L2(P0,P1)_g</code>
  <code>StrictSuccess = (1 / 47) · Σ s_g</code>
  <span>P2 不进入严格成功。任意一条 L1、P0 或 P1 失败，整题记为 0。</span>
</div>

当前 runner 会从分母中排除 <code>NOT_APPLICABLE</code>，却没有硬性限制 P1 返回它。这是严格成功口径需要注意的一处实现边界。

### 真实 case：Armor Alley 的持续射击

Armor Alley 是横向卷轴直升机战术游戏。“按住开火，松开后停止”从自然语言变成自动验收，要经过公开玩法、公开场景、源码检查和真实输入四层。对应的官方文件可直接核对：[game-spec.md](https://github.com/areal-project/GameASG-Bench/blob/main/task/armor-alley/game-spec.md)、[tdd.md](https://github.com/areal-project/GameASG-Bench/blob/main/task/armor-alley/tdd.md)、[checks.json](https://github.com/areal-project/GameASG-Bench/blob/main/tests/armor-alley/checks.json)、[checks.js](https://github.com/areal-project/GameASG-Bench/blob/main/tests/armor-alley/checks.js)。

<div class="gb-note blue">
  <p><code>game-spec.md</code> 要求：按住时持续耗弹并产生可见弹丸；松开后停止。</p>
  <p><code>tdd.md</code> 定义 <code>air_attack_with_targets</code>：直升机有武器，附近有可接近或选中的威胁，场景本身不能先命中或移除目标。</p>
</div>

<code>checks.json</code> 先用 P0 正则确认四个契约方法同时存在。下面按原检查的字段与含义写成示意代码；官方版本包含兼容多种 JavaScript 写法的完整正则：

```json
{
  "id": "p0-contract-methods-reset-input-snapshot",
  "level": "P0",
  "type": "regex_all",
  "patterns": ["reset", "loadScenario", "input", "getSnapshot"],
  "fix_hint": "Define reset, loadScenario, input, and getSnapshot on window.__gameTest."
}
```

L1 只证明接口外壳写进了源码。下面的 JavaScript 按官方 L2 检查压缩而成。<code>p1-keyboard-sustained-fire-release</code> 在开火阶段绕过 <code>input({type: "holdFire"})</code>，直接向浏览器发送 Space；最后的等待仍通过评测 helper 推进：

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

检查先加载合法场景，再按住 Space 650 ms，观察弹丸、战斗 revision 或弹药变化；松开后取两次样本，接受“弹丸数至多增加 1”或“projectile revision 不再变化”中的任一停止证据。它能抓住“测试 API 会开火，真实按键没接上”，也能捕捉一部分释放后仍连射的实现。

这条检查也暴露出契约缺口。公开 <code>game-spec.md</code> 只写 hold/release，<code>tdd.md</code> 公开的是 <code>holdFire</code> 语义动作，都没有指定 Space。一个使用其他按键、同时正确实现公开语义的候选，仍可能在隐藏检查上失败。真实输入提高了证据强度，输入映射也应进入公开规格。

## Q4: 论文做了哪些实验？

论文先验证 47 份参考实现，再围绕四个研究问题比较 agent stack。每个 task-configuration 只运行一次，从干净工作区开始；L2 使用固定的 1280×800 无头 Chromium。结果适合分析失败模式，不足以估计重复运行方差。

### RQ1：当前 agent stack 能交付多少完整游戏

九个模型与 harness 组合均使用最大推理强度和完整工具。主指标是严格成功，平均 L1、平均 L2 和分优先级通过率用于诊断。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-3-leaderboard.png"><img src="/lib/papers/gameasg-bench/table-3-leaderboard.png" alt="原论文 Table 3：九个模型与 harness 组合的严格成功率和检查通过率"></a>
  <figcaption><strong>原论文 Table 3。</strong>GPT-6-Astra + Codex CLI 的平均 L2 为 93.2%，严格成功为 26/47；仍有 21 个任务缺少至少一项必需证据。</figcaption>
</figure>

- 九个 stack 的平均 L1 都在 97.7% 至 99.6%，严格成功却从 7/47 到 26/47。源码结构容易补齐，运行中的组合路径仍会失败。
- GPT-5.6-Sol 的平均 L2 为 91.3%，高于 Claude-Opus-5 的 90.4%；严格成功却是 21 对 24。平均分和整题交付会给出不同排序。
- Table 4 显示，产物大小和 token 消耗与严格成功没有稳定的正相关关系。

### RQ2：工具访问和轮次预算改变了什么

这组消融固定 DeepSeek-V4-Flash、Claude Code 和最大推理强度。无工具、仅文件、文件加语法检查、完整工具四种条件的严格成功分别为 7/47、6/47、9/47 和 18/47。完整工具同时改变了多项能力，Table 5 不能单独识别浏览器执行的因果贡献；附录 trace 只证明浏览器测试曾帮助部分运行在提交前发现行为错误。

轮次从 30、60 增加到 120 时，完成评测的任务数从 10、32 增加到 47，严格成功依次为 7/47、13/47 和 18/47。在这组运行中，更大预算伴随更多任务走完实现、测试和交付，也伴随更高的严格成功数。

### RQ3：推理越多并不保证严格成功越高

同一模型和工具条件下，Low、High、Maximum 的严格成功分别是 7/47、19/47 和 18/47。P1 通过率仍从 71.7% 升到 82.7% 和 86.7%，说明局部核心检查与整题成功可以朝不同方向变化。High 比 Maximum 少用 26.9% 的推理 token，却多成功 1 个任务。

### RQ4：相同模型换一个 harness 会怎样

DeepSeek-V4-Flash 在 Claude Code 与 Codex CLI 下都得到 18/47，但只有 10 个共同成功任务；各有 8 个任务只在其中一个 harness 下成功，另有 21 个两边都失败。相同总分掩盖了不同的成功集合，也说明结果属于模型、系统指令、上下文管理、工具和预算组成的完整 agent stack。

<details class="gb-evidence-details">
  <summary><span>展开 RQ1 至 RQ4 的原始消融表</span><span>原论文 Tables 4 至 8</span></summary>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-4-resource-use.png"><img src="/lib/papers/gameasg-bench/table-4-resource-use.png" alt="原论文 Table 4：产物大小、token 和报告成本"></a><figcaption><strong>Table 4。</strong>更多 token 或更大文件没有稳定对应更多严格成功。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-5-tool-ablation.png"><img src="/lib/papers/gameasg-bench/table-5-tool-ablation.png" alt="原论文 Table 5：工具权限消融"></a><figcaption><strong>Table 5。</strong>完整工具条件严格成功 18/47，无工具为 7/47。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-6-turn-budget.png"><img src="/lib/papers/gameasg-bench/table-6-turn-budget.png" alt="原论文 Table 6：30、60、120 轮预算"></a><figcaption><strong>Table 6。</strong>30、60、120 轮时分别只有 10、32、47 个任务完成评测；预算首先改变了完成率。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-7-reasoning-effort.png"><img src="/lib/papers/gameasg-bench/table-7-reasoning-effort.png" alt="原论文 Table 7：推理强度比较"></a><figcaption><strong>Table 7。</strong>High 严格成功 19/47，Max 为 18/47；Max 的聚合 P1 更高。</figcaption></figure>
  <figure class="gb-figure"><a href="/lib/papers/gameasg-bench/table-8-harness.png"><img src="/lib/papers/gameasg-bench/table-8-harness.png" alt="原论文 Table 8：Claude Code 与 Codex CLI harness 比较"></a><figcaption><strong>Table 8。</strong>两个 harness 总分相同，成功任务集合明显不同。</figcaption></figure>
</details>

### 两个真实失败样例

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-9-diagnostics.png"><img src="/lib/papers/gameasg-bench/table-9-diagnostics.png" alt="原论文 Table 9：Diner Dasher 与 Turbo Smash Beast 的诊断证据"></a>
  <figcaption><strong>原论文 Table 9。</strong>一个失败在真实拖拽，另一个失败在“场景加载后继续自然时间”的组合路径。</figcaption>
</figure>

#### Diner Dasher：场景存在，真实拖拽没有接上订单

<ol class="gb-case-path">
  <li>从 <code>tray_with_correct_item</code> 快照读取餐点和顾客的屏幕边界。</li>
  <li>CDP 从两个矩形中心发送真实鼠标拖拽。</li>
  <li>订单、当日收入或已服务顾客数至少增加一项；若订单项的 served 数增加，托盘数量必须下降。</li>
  <li>Canvas 哈希可用时，哈希或 render revision 还要发生变化。</li>
</ol>

论文中的 GPT-6-Astra 产物通过 L1 和 L2 P0/P2，却在鼠标与触摸拖拽上都没有服务进展。语义状态、渲染和真实交互分别存在，连接三者的事件路径坏了。下面是按<a href="https://github.com/areal-project/GameASG-Bench/blob/main/tests/diner-dasher/checks.js">官方检查</a>压缩的示意代码，完整版本还包含边界有效性与托盘数量断言。

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

#### Turbo Smash Beast：合法场景加载后，自然时间停了

失败实现的 <code>reset</code> 或 <code>loadScenario</code> 会进入 test mode，并停止自然时间模拟。Agent 单独自测过“通过接口推进时间”和“新页面里真实驾驶”，两条都工作。L2 把两条路径组合起来：先加载 <code>readyUnlockedLevel</code>，再按住真实鼠标并等待 350 ms 和 450 ms。此时 <code>speedRatio</code>、<code>forwardProgress</code>、<code>motionRevision</code> 和 HUD 速度都没有按要求增长。

这两个案例说明 L2 的价值在组合。它检查场景准备、真实输入、自然时间、状态与可见反馈能否在同一次执行中连起来，失败报告也能落到具体断点。

## Q5: 有什么可以进一步探索的点？

论文没有单列 future work。下面六点是根据实验结果和协议边界作出的推演，不是作者已经验证的结论。

1. **动态分配推理与工具预算。** High effort 用更少 token 得到 19/47，Maximum 为 18/47；本次观测中，完整工具也高于受限工具。下一步可以让 Agent 根据浏览器失败证据决定何时继续推理、何时调用语法或运行测试。
2. **把 L2 诊断送回修复循环。** 当前 benchmark 主要负责最终评测。若把失败的不变量、真实输入路径和渲染证据转成定向修复信号，可以检验“执行反馈是否真能提高严格成功”，而不是只提高平均通过率。
3. **自动生成并审查评测契约。** <code>tdd.md</code>、<code>checks.json</code> 和 <code>checks.js</code> 目前依赖人工编写。可以研究从玩法规格提取场景、动作和不变量，但生成后的契约仍需独立审核，避免测试和候选共享同一误解。
4. **补上规格与 checker 的边界测试。** Armor Alley 的 Space 映射说明真实输入假设应公开；P1 的 <code>NOT_APPLICABLE</code> 也应限制或单列报告。加入 mutation testing 和负控制，还能估计错误实现被误接受的概率。
5. **重复运行并拆解 harness。** 每个配置当前只跑一次。多次运行、报告方差，并分别消融系统提示、上下文管理和工具策略，才能区分随机性、模型能力与 harness 效果。
6. **扩展证据和任务范围。** 现有协议可继续加入视觉模型判断、帧率、内存与快速连续输入等检查，也可迁移到前端应用；后端、多玩家和大型资产管线仍需要新的隔离与状态控制方案。

## Q6: 总结一下论文的主要内容

GameASG-Bench 用 47 个自包含浏览器游戏评估从自然语言需求到完整软件产物的端到端生成。任务作者先人工写好公开的玩法与评测接口，再冻结隐藏的 L1/L2 检查；Agent 交付 <code>index.html</code> 和 <code>window.__gameTest</code>，评测器把语义快照与真实输入、自然时间、渲染活动和运行时异常组合起来。严格成功要求交付有效、评测完成，并通过全部 L1 和适用的 L2 P0/P1。最佳 stack 的平均 L2 达到 93.2%，严格成功仍只有 26/47，这个差值说明局部正确不等于完整交付。

### 阅读结论时要保留的边界

- 47 个任务都是自包含浏览器单页，结果不能直接外推到后端、多人与大型资产管线。
- 每个配置只生成一次，没有方差或置信区间；模型与 harness 排名不宜视为稳定的能力排序。
- 分数同时包含游戏实现能力与遵守测试契约的能力。Armor Alley 的 Space 键错位说明隐藏断言也可能超出公开规格。
- 参考实现提供了正控制，论文没有系统负控制；检查覆盖不到的错误不会进入严格成功。
- L1 正则可能命中注释，P1 又可返回 <code>NOT_APPLICABLE</code>。两者都会影响最终解释。

如果要把这套方法迁移到别的应用，最小配方是：生成前写清可达前置条件、动作、结果、拒绝路径和不变量；场景只负责缩短准备过程；最后用真实输入、自然时间、渲染变化和运行时异常约束候选自报的语义快照。报告同时保留局部检查通过率和整题成功率，并把模型、harness、工具与预算视为一个 agent stack。

论文：[GameASG-Bench: Benchmarking Autonomous Software Generation for Game Development](https://arxiv.org/abs/2609.21293)。代码与任务：[areal-project/GameASG-Bench](https://github.com/areal-project/GameASG-Bench)。本文原图均裁自论文，流程与代码解读依据论文第 2 至 5 节及官方仓库整理。

</div>

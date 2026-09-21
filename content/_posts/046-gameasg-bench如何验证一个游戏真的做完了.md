---
title: "GameASG-Bench 如何验证一个游戏真的做完了"
permalink: "/posts/论文解读/gameasg-bench.html"
date: "2026-09-21T21:31:01+08:00"
updated: "2026-09-22T01:38:40+08:00"
cover: "/generated-covers/046-gameasg-bench.webp"
description: "拆解 GameASG-Bench 的问题定义、人工测试构建、公开行为契约、L1/L2 评测、真实游戏案例、四组实验与相关工作边界。"
wide_content: true
wide_toc: true
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
.gb-reading{--gb-blue:var(--sea);--gb-orange:var(--coral);--gb-green:#3f8a68;--gb-ink:var(--ink);--gb-soft:var(--ink-soft);--gb-surface:var(--paper-elevated);--gb-line:var(--line-strong);color:var(--gb-ink)}
.gb-reading>h2,.gb-reading>h3,.gb-reading>p,.gb-reading>ul,.gb-reading>ol,.gb-reading>blockquote{width:min(100%,760px);margin-left:auto;margin-right:auto}.gb-reading>figure.highlight,.gb-reading>.highlight-container{width:min(100%,860px);margin-left:auto;margin-right:auto}
.gb-reading .gb-button{display:inline-block;padding:11px 18px;border:1px solid color-mix(in srgb,var(--gb-blue) 78%,#000);background:var(--gb-blue);color:#fff!important;text-decoration:none!important;font-weight:700;white-space:nowrap}
.gb-reading .gb-player-shell{width:100%;margin:4px 0 34px;border:1px solid #c5c2ba;background:#252b31;box-shadow:0 20px 60px #17202a24}.gb-reading .gb-player-bar{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:17px 20px;color:#eef3f7;background:#252b31}.gb-reading .gb-player-copy{display:grid;gap:3px}.gb-reading .gb-player-copy small{font:800 .72em/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#7fc1ff}.gb-reading .gb-player-copy strong{font-size:1.02em}.gb-reading .gb-player-copy span{font-size:.82em;color:#b9c2ca}.gb-reading .gb-player-shell .post-deck-embed{margin:0}.gb-reading .gb-player-shell .post-deck-embed-frame{border:0;border-top:1px solid #424950;background:#dcd9d2}.gb-reading .gb-player-shell .post-deck-embed-note{margin:0;padding:11px 17px;color:#c4ccd3;background:#252b31;border-top:1px solid #424950}
.gb-reading .gb-source-links{display:flex;flex-wrap:wrap;gap:8px 20px;width:min(100%,760px);margin:0 auto 34px;font-size:.94em}.gb-reading .gb-source-links a{font-family:var(--sans)}
.gb-reading .gb-paper-meta{width:min(100%,760px);margin:0 auto 10px;color:var(--gb-soft);font:400 .8rem/1.6 var(--sans)}
.gb-reading .gb-callout{width:min(100%,760px);padding:18px 22px;margin:22px auto;border-left:5px solid var(--gb-orange);background:color-mix(in srgb,var(--gb-orange) 8%,var(--gb-surface))}.gb-reading .gb-callout.blue{border-color:var(--gb-blue);background:color-mix(in srgb,var(--gb-blue) 8%,var(--gb-surface))}.gb-reading .gb-callout.green{border-color:var(--gb-green);background:color-mix(in srgb,var(--gb-green) 8%,var(--gb-surface))}.gb-reading .gb-callout p{margin:.45em 0}
.gb-reading .gb-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin:28px 0;background:var(--gb-line);border:1px solid var(--gb-line)}.gb-reading .gb-metric{min-height:128px;padding:19px;background:var(--gb-surface)}.gb-reading .gb-metric strong{display:block;color:var(--gb-blue);font:650 clamp(1.8rem,3vw,2.65rem)/1 var(--serif)}.gb-reading .gb-metric span{display:block;margin-top:12px;color:var(--gb-soft);font:600 .78rem/1.45 var(--sans)}
.gb-reading .gb-figure{margin:30px 0}.gb-reading .gb-figure img{display:block;width:100%;height:auto;border:1px solid color-mix(in srgb,var(--gb-line) 65%,transparent);border-radius:0;background:#fff;box-shadow:none}.gb-reading .gb-figure figcaption{margin:9px auto 0;color:var(--gb-soft);font-size:.86em;line-height:1.6;text-align:left}.gb-reading .gb-figure figcaption strong{color:var(--gb-ink)}
.gb-reading .gb-flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin:24px 0}.gb-reading .gb-flow>div{position:relative;min-height:142px;padding:16px 14px;border-top:5px solid var(--gb-blue);background:var(--gb-surface)}.gb-reading .gb-flow>div:nth-child(2n){border-color:var(--gb-orange)}.gb-reading .gb-flow b{display:block;margin-bottom:8px;font-size:.92em}.gb-reading .gb-flow span{display:block;color:var(--gb-soft);font-size:.82em;line-height:1.5}.gb-reading .gb-flow em{position:absolute;right:-10px;top:50%;z-index:2;padding:2px;color:var(--gb-soft);background:var(--paper);font-style:normal}
.gb-reading .gb-role-table,.gb-reading .gb-compare,.gb-reading .gb-evidence{width:100%;border-collapse:collapse;margin:22px 0;font:400 .86em/1.55 var(--sans)}.gb-reading th,.gb-reading td{padding:10px 11px;border:1px solid var(--gb-line);text-align:left;vertical-align:top}.gb-reading th{background:color-mix(in srgb,var(--gb-blue) 8%,var(--gb-surface))}.gb-reading td:first-child{font-weight:650}.gb-reading code{font-size:.92em}.gb-reading pre{overflow:auto;max-height:none}
.gb-reading .gb-two{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:22px 0}.gb-reading .gb-two>*{min-width:0}.gb-reading .gb-mini{padding:18px;border-top:5px solid var(--gb-blue);background:var(--gb-surface)}.gb-reading .gb-mini:nth-child(2){border-color:var(--gb-orange)}.gb-reading .gb-mini h4{margin-top:0}.gb-reading .gb-inline-code{padding:2px 6px;border:1px solid var(--gb-line);background:var(--gb-surface);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}
.gb-reading .gb-formula{width:min(100%,760px);margin:24px auto;padding:20px;border-block:1px solid var(--gb-line);text-align:center}.gb-reading .gb-formula code{display:block;padding:0;color:var(--gb-ink);background:none;font-size:clamp(.82rem,1.5vw,1rem)}.gb-reading .gb-formula span{display:block;margin-top:9px;color:var(--gb-soft);font:400 .8rem/1.55 var(--sans)}
.gb-reading #interactive-deck{scroll-margin-top:88px}
@media(max-width:900px){.gb-reading .gb-player-shell{margin-bottom:28px}.gb-reading .gb-player-bar{align-items:flex-start;padding:14px;gap:12px}.gb-reading .gb-player-copy span{display:none}.gb-reading .gb-button{padding:9px 12px;font-size:.84em}.gb-reading .gb-metrics{grid-template-columns:1fr 1fr}.gb-reading .gb-flow{grid-template-columns:1fr 1fr}.gb-reading .gb-flow em{display:none}.gb-reading .gb-two{grid-template-columns:1fr}.gb-reading .gb-compare,.gb-reading .gb-role-table,.gb-reading .gb-evidence{display:block;overflow-x:auto;white-space:nowrap}.gb-reading .gb-button{text-align:center}}
@media(max-width:520px){.gb-reading .gb-metric{min-height:108px;padding:15px}.gb-reading .gb-flow{grid-template-columns:1fr}.gb-reading .gb-player-copy strong{font-size:.9em}}
</style>

<div class="gb-reading">

<div id="interactive-deck" class="gb-player-shell">
  <div class="gb-player-bar">
    <div class="gb-player-copy"><small>INTERACTIVE PAPER DECK</small><strong>GameASG-Bench · 26 页可交互图解</strong><span>页面内直接翻页；支持方向键、目录、全屏与手机横屏。</span></div>
    <a class="gb-button" href="/lib/decks/gameasg-bench-visual-guide.html">沉浸模式 ↗</a>
  </div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame">
      <iframe src="/lib/decks/gameasg-bench-visual-guide.html" title="GameASG-Bench 论文图解，共 26 页" allow="fullscreen" loading="eager"></iframe>
    </div>
    <p class="post-deck-embed-note"><span>共 26 页 · 点击按钮或使用 ← → 翻页</span><span>手机端建议横屏后全屏阅读</span></p>
  </div>
</div>

<p class="gb-paper-meta">Xiuhui Zhang, Yi Chen, Shusheng Xu, Fan Li, Huan Wang, Tongkai Yang, Binhang Yuan · arXiv:2609.21293 · 2026-09-18</p>

<div class="gb-source-links">
  <a href="https://arxiv.org/abs/2609.21293">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.21293">论文 PDF</a>
  <a href="https://github.com/areal-project/GameASG-Bench">官方代码与 47 个任务</a>
  <a href="#附录：原图与资料">原图索引</a>
</div>

## 导读：93.2% 的行为检查通过率，55.3% 的完整交付率

一个 GPT-6-Astra 生成的 Diner Dasher 可以启动，测试接口也能调用，L1 以及 L2 的 P0、P2 检查都通过了。玩家用鼠标或触摸把餐点拖给顾客时，订单却没有任何进展。这个失败样例概括了 GameASG-Bench 的出发点：完整应用的各个部件分别存在，不代表它们在真实操作下能够协同工作。

<div class="gb-metrics" aria-label="GameASG-Bench 关键数字">
  <div class="gb-metric"><strong>47</strong><span>浏览器游戏任务，覆盖 12 个主要类型</span></div>
  <div class="gb-metric"><strong>1,221</strong><span>336 条 L1 与 885 条 L2 自动检查</span></div>
  <div class="gb-metric"><strong>93.2%</strong><span>最佳 agent stack 的平均 L2 通过率</span></div>
  <div class="gb-metric"><strong>26/47</strong><span>最佳严格成功数，即 55.3%</span></div>
</div>

GameASG-Bench 要求 Coding Agent 在干净工作区里交付一个自包含的 `index.html`。第一方 HTML、CSS 和 JavaScript 必须放在这个文件中，任务允许时可以从稳定 CDN 加载第三方库。任务作者在生成开始前写好玩法规格、公开测试接口和隐藏检查；Agent 能看到行为契约，看不到 `checks.json`、`checks.js` 或历史测试报告。评测器随后把合法场景、玩家级动作、语义快照和浏览器证据组合起来，逐条复核需求。

论文的主要贡献是一套预先声明、可以复跑的评测协议，47 个游戏任务是这套协议的载体。它给出了清楚的责任边界：任务作者提前定义正确行为，Agent 选择内部实现，评测器用固定检查收集行为证据。

## 1. 问题定义：可运行不等于完成

函数题通常有清晰的输入和返回值，仓库修复题通常继承已有测试。一个游戏则把控制、状态机、动画、渲染、资源变化、反馈、胜负和重启装进同一个持续运行的系统。某个函数局部正确，仍可能更新错对象、在暂停时继续运行，或者只改了快照而没有改变画面。

<table class="gb-evidence">
  <thead><tr><th>常见证据</th><th>能证明什么</th><th>仍然证明不了什么</th></tr></thead>
  <tbody>
    <tr><td>页面成功打开</td><td>HTML 至少没有在启动阶段直接崩溃</td><td>输入、玩法循环、终局和重启是否工作</td></tr>
    <tr><td>单张截图像游戏</td><td>某一帧具有角色、HUD 或场景</td><td>玩家操作能否推动状态和渲染</td></tr>
    <tr><td>源码出现 <code>win</code>、<code>ammo</code></td><td>存在相应字符串或代码结构</td><td>这些分支是否能被真实路径触发</td></tr>
    <tr><td>语义 API 返回正确字段</td><td>测试接口表面上满足契约</td><td>接口状态是否和键鼠输入、自然时间、画面共用同一状态</td></tr>
    <tr><td>平均检查通过率很高</td><td>大部分被测行为已经实现</td><td>是否仍缺一条阻断交付的核心需求</td></tr>
  </tbody>
</table>

浏览器游戏适合作为这个问题的受控代理。它比单个函数更接近完整应用，又能被限制在单页、有限时间和固定视口中。输入改变状态，状态再改变反馈或渲染，若干状态转移组成终局，因此一个短游戏可以集中测试多种集成行为。

评测的难点在于既要可控，又不能绑死实现。纯 GUI playtesting 很难稳定走到“敌方运输车接近基地”之类的罕见状态；直接改某个候选实现的内部变量，又要求所有 Agent 使用相同对象名和数据结构。论文用公开语义接口准备合法前置条件，再按需求选择语义动作或真实浏览器输入。检查由此只依赖行为含义，对候选代码的私有结构不作假设。

## 2. 核心设计：在生成前固定测试契约

论文用公开接口给不同私有实现建立共同观察面。接口规定场景、动作、稳定快照、拒绝行为和不变量，Agent 在实现游戏时一并实现它，同时仍可自由选择引擎、对象图和代码布局。

### 公开契约与隐藏验收分开

公开部分告诉 Agent 必须支持哪些行为，以及评测如何观察这些行为。隐藏部分把这些要求实现成固定断言。两部分都在生成前完成，所以测试不会在看到候选代码后临时迁就实现，也不会把具体断言暴露给 Agent。

<table class="gb-role-table">
  <thead><tr><th>参与方</th><th>生成前</th><th>生成时</th><th>生成后</th></tr></thead>
  <tbody>
    <tr><td>任务作者</td><td>写玩法规格、接口规格、L1/L2 检查和优先级</td><td>不修改测试以适配当前候选</td><td>用同一套检查验收产物</td></tr>
    <tr><td>Coding Agent</td><td>拿不到隐藏检查</td><td>实现游戏与 <code>window.__gameTest</code></td><td>提交一个自包含 <code>index.html</code></td></tr>
    <tr><td>评测器</td><td>持有冻结的检查</td><td>与生成环境隔离</td><td>跑交付预检、L1、L2 并计算严格成功</td></tr>
  </tbody>
</table>

### 合法场景只准备前置条件

`loadScenario` 可以缩短漫长或稀有状态的准备过程，例如补充资源、移动角色或生成目标。它不能直接造成待测结果。一个“接近胜利”的场景仍然需要玩家行动才能获胜，一个危险场景也不能预先扣血。这个限制保留了动作与结果之间的因果关系。

测试接口必须操作画面使用的同一份底层状态。单项 L2 会按需要组合接口快照、键鼠输入、Canvas 哈希、revision、animation frame 和运行时异常，并非每项检查都使用全部信号。其中真实输入与 Canvas 哈希来自浏览器侧，revision 则是候选快照的一部分；多种证据组合后，单独维护一份“只给测试看”的影子状态更容易被发现。

## 3. 基准构建：从游戏概念到可验收任务

### 任务边界与语料构成

每个任务必须包含完整可玩循环：玩家输入改变状态，游戏产生可观察进展或终局，并且支持重启。作者排除了依赖后端、账号、外部数据库、付费或私有资产、无界多人基础设施，以及无法在有限浏览器执行中到达和观察的行为。最终语料有 47 个任务，覆盖 12 类游戏，其中 32 个是 2D，15 个是 3D。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/figure-1-corpus.png" alt="GameASG-Bench 47 个任务的类型、2D/3D 与参考实现技术分布">
  <figcaption><strong>原论文 Figure 1。</strong>参考实现主要使用 Canvas 2D 和 Three.js。这里的 technology 只描述参考实现，不限制 Agent 必须采用同一种技术。</figcaption>
</figure>

### 任务材料、可见性与冻结时点

论文第 3.2 节说明，`game-spec.md`、`tdd.md`、`checks.json` 和 `checks.js` 均由人类开发者在候选生成前写定并冻结，P0/P1/P2 也在此时人工分配。生成完成后，评测端不会再从候选代码推导或调整这些材料。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-1-task-documents.png" alt="原论文 Table 1：三份任务文档及其作用">
  <figcaption><strong>原论文 Table 1。</strong>三份文档都在 Agent 工作区中；只有 <code>target.md</code> 直接进入 harness 的生成提示，Agent 需要自行读取另外两份规格。</figcaption>
</figure>

<table class="gb-role-table">
  <thead><tr><th>文件或产物</th><th>编写者</th><th>Agent 可见性</th><th>内容</th></tr></thead>
  <tbody>
    <tr><td><code>target.md</code></td><td>任务作者</td><td>可见，直接传入 harness</td><td>工作区规则、交付协议和简短玩法说明</td></tr>
    <tr><td><code>game-spec.md</code></td><td>任务作者</td><td>可见</td><td>目标、控制、实体、状态转移、反馈、终局和最低可玩循环</td></tr>
    <tr><td><code>tdd.md</code></td><td>任务作者</td><td>可见</td><td>场景、动作、快照字段、拒绝语义与不变量</td></tr>
    <tr><td><code>checks.json</code></td><td>任务作者</td><td>隐藏</td><td>L1 结构、工具、正则和反模式检查</td></tr>
    <tr><td><code>checks.js</code></td><td>任务作者</td><td>隐藏</td><td>L2 浏览器行为检查</td></tr>
    <tr><td>参考实现</td><td>benchmark 团队</td><td>不提供给 Agent</td><td>人工复核后的正控制；公开仓库未附实现文件</td></tr>
    <tr><td><code>index.html</code></td><td>Coding Agent</td><td>Agent 自己生成</td><td>最终交付的 HTML、CSS 与 JavaScript</td></tr>
  </tbody>
</table>

<div class="gb-flow" aria-label="GameASG-Bench 从选题到评测的构建流程">
  <div><b>1. 选择概念</b><span>完整循环，可在有界浏览器会话中执行。</span><em>→</em></div>
  <div><b>2. 写玩法规格</b><span>目标、机制、反馈、终局和重启。</span><em>→</em></div>
  <div><b>3. 写测试契约</b><span>合法场景、动作、观察与不变量。</span><em>→</em></div>
  <div><b>4. 写隐藏检查</b><span>L1/L2 断言和 P0/P1/P2 优先级。</span><em>→</em></div>
  <div><b>5. 验证参考实现</b><span>人工操作后再跑自动验收。</span><em>→</em></div>
  <div><b>6. 生成与评测</b><span>新会话生成，隔离环境运行固定检查。</span></div>
</div>

### 参考实现作为正控制

每道题都有一份独立验证的参考实现。人工检查覆盖真实用户操作、核心状态转移、终局、重启，以及测试接口与可见玩法的一致性。随后，同一套 L1 和 L2 检查运行在参考实现上。47 份参考实现全部通过所有 L1 和适用的 L2 P0/P1 检查。

这个过程证明测试能够接受至少一份人工确认满足核心要求的实现。它只验证正向可接受性，不能说明测试能捕获所有错误。

## 4. 评测协议：准备、操作、观察与计分

### 交付预检与环境隔离

生成和评测位于两个容器。生成容器有可写工作区，测试与 runner 不会挂载进去。Agent 结束后，系统先检查进程成功退出，`index.html` 是常规文件、不是符号链接、文件非空，并且包含 `</html>`。通过预检后，评测容器以只读方式挂载提交和测试。

### 四个公共测试方法

所有游戏都暴露同一个入口，具体场景名、动作和快照字段由任务自己的 `tdd.md` 定义：

```js
window.__gameTest = {
  reset(options),
  loadScenario(name, options),
  input(action),
  getSnapshot()
}
```

- `reset` 恢复初始状态，并清除弹窗、终局锁和临时对象。
- `loadScenario` 建立正常游玩可达的前置条件，但不提前制造被测结果。
- `input` 执行玩家级语义动作，例如下单、选择目标或暂停。
- `getSnapshot` 返回 JSON 可序列化的稳定语义摘要，不暴露私有对象图。

L2 通常按 prepare、act、observe 执行：先建立合法场景，再调用语义动作或发送真实浏览器输入，最后比较状态、渲染和不变量。每条检查在一个新页面里运行，完成或超时后关闭。共享浏览器 hook 记录 animation frame、输入监听器和 Canvas/WebGL 活动；检查还可以读取快照、渲染输出和运行时异常。

### 两个证据层与三个需求优先级

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-2-check-counts.png" alt="原论文 Table 2：L1 与 L2 检查数量">
  <figcaption><strong>原论文 Table 2。</strong>L1 有 336 条，L2 有 885 条。L1/L2 表示证据来自源码还是运行行为；P0/P1/P2 表示需求优先级。两套标签相互独立。</figcaption>
</figure>

L1 检查 HTML 以及内联或直接链接的本地脚本，包括 43 条工具检查、288 条正则和 5 条反模式检查。它适合发现缺失接口、语法问题和明显空壳，但正则也可能命中注释或字符串，所以论文只把 L1 解释为源码级证据。

L2 在无头 Chromium 中执行 `checks.js`。102 条 P0 检查覆盖启动、接口和最低运行条件；534 条 P1 检查覆盖核心机制、交互和不变量；249 条 P2 检查描述高级玩法与完整度。每条 L2 返回 `PASS`、`FAIL` 或 `NOT_APPLICABLE`，并记录耗时和诊断信息。

均值的分母也不同。Mean L1 和 overall L2 会先计算每个任务的检查通过率，再对已完成评测的任务取平均；P0、P1、P2 则把所有已评测任务中的 applicable checks 汇总后计算。93.2% 是 mean L2，不代表 93.2% 的任务完整成功。

### 严格成功的判定规则

对任务 `g`，令 `d_g` 表示交付有效，`e_g` 表示评测完成，`L_g` 是全部 L1，`B_g` 是适用的 L2 P0/P1。每条检查通过时 `p_g,c = 1`，否则为 0：

<div class="gb-formula">
  <code>s_g = d_g · e_g · ∏(p_g,c),　c ∈ L_g ∪ B_g</code>
  <code>SR(G) = (1 / |G|) · Σ s_g</code>
  <span>L2 P2 不进入严格成功。任意一个必需检查失败，整道任务的 s_g 就是 0。</span>
</div>

当前 runner 会把 `NOT_APPLICABLE` 排除在适用检查分母之外，却没有限制 P1 返回这个状态，这是计分协议中已知的边界。

## 5. 贯穿案例：Armor Alley 的持续射击

Armor Alley 是一款横向卷轴直升机战术游戏。玩家驾驶直升机，也能花钱生产地面单位；友方运输车到达敌方基地后获胜，敌方运输车突破己方基地则失败。官方任务文件可直接查看：[game-spec.md](https://github.com/areal-project/GameASG-Bench/blob/main/task/armor-alley/game-spec.md)、[tdd.md](https://github.com/areal-project/GameASG-Bench/blob/main/task/armor-alley/tdd.md)、[checks.json](https://github.com/areal-project/GameASG-Bench/blob/main/tests/armor-alley/checks.json) 和 [checks.js](https://github.com/areal-project/GameASG-Bench/blob/main/tests/armor-alley/checks.js)。

“按住开火，松开后停止”是一条公开需求。沿着它进入隐藏断言的过程，可以看到一处契约缺口：公开文件规定了持续射击的语义，却没有指定 Space 键。

### 公开规格固定因果链

`game-spec.md` 要求按住开火键时持续消耗弹药，并产生朝向目标或飞行方向移动的可见弹丸；松开按键后停止持续射击。单独让弹药数字下降，或者只画一层特效，都没有满足完整因果链。

`tdd.md` 对 `air_attack_with_targets` 的公开定义是：直升机有一些武器，并且至少一个敌人或威胁可被接近或选中；场景不能预先命中目标、结算伤害或移除对象。快照公开弹药、弹丸数量、战斗 revision 和通知等字段。

隐藏的 `legalScenario` predicate 实际只检查 `phase === "playing"`、`result === "none"` 和直升机在空中，没有再次验证武器或目标。这是测试覆盖的一处缝隙：公开场景契约更强，下面这条 L2 的前置断言更弱。

### L1 验证接口外壳

`checks.json` 中有一条真实的 P0 检查。以下摘录保留其字段与含义；官方正则支持多种合法 JavaScript 写法，此处省略正则细节：

```json
{
  "id": "p0-contract-methods-reset-input-snapshot",
  "level": "P0",
  "name": "Required contract methods are defined together",
  "type": "regex_all",
  "patterns": [
    "... reset ...",
    "... input ...",
    "... getSnapshot ...",
    "... loadScenario ..."
  ],
  "fix_hint": "Define reset, loadScenario, input, and getSnapshot on window.__gameTest."
}
```

另一条 P1 会查找 `startBattle`、`setFlightIntent`，以及 `holdFire`、`dropBomb`、`orderUnit` 三者中的至少一种动作分支。L1 只能确认源码中存在契约外壳，行为仍交给 L2。

### L2 把持续射击映射到真实 Space 键

这段代码来自官方 `checks.js` 的 `p1-keyboard-sustained-fire-release`。检查绕过 `input({type: "holdFire"})`，直接向浏览器发送 Space 的 keydown 和 keyup：

```js
const setup = await legalScenario(
  game,
  'air_attack_with_targets',
  s => s.phase === 'playing' &&
       s.result === 'none' &&
       s.helicopter?.airborne,
  'air attack must be active and airborne'
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
  rev(held, 'projectiles') > rev(before, 'projectiles') ||
  rev(held, 'combat') > rev(before, 'combat') ||
  num(held.helicopter?.ammo?.current) <
    num(before.helicopter?.ammo?.current);

const plateauAfterRelease =
  count(afterRelease, 'projectiles') <=
    count(released, 'projectiles') + 1 ||
  rev(afterRelease, 'projectiles') ===
    rev(released, 'projectiles');

if (!grewWhileHeld)
  return FAIL('held fire did not create projectile/combat/ammo evidence');
if (!plateauAfterRelease)
  return FAIL('fire continued growing after release');
return PASS('real key path creates and stops sustained fire without contract fire rescue');
```

判定链有五步：隐藏 predicate 检查基础起点；浏览器按住 Space 650 ms；弹丸、战斗 revision 或弹药至少出现一种变化；松开后分两次取样；弹丸计数没有继续显著增长，或者 projectile revision 保持不变。这条检查旨在发现只有语义 API 能开火、真实按键没有接上玩法，以及松开后仍持续射击等问题。

它没有完整执行公开规格的全部因果链。按住阶段只要弹药下降、弹丸计数上升或 revision 变化中的任一项成立即可，不要求弹丸可见、方向正确或命中目标；松开后的 plateau 也是两个条件取其一。这条检查只提供有针对性的行为证据，持续射击需求中的弹丸可见性、方向和命中仍未被穷尽验证。

这里存在公开契约与隐藏检查的错位。`game-spec.md` 只写了 hold/release fire，`tdd.md` 公开的是 `holdFire` 语义 action，两份文件都没有把 Space 指定为物理按键。一个完整实现如果选择鼠标或其他按键，并正确实现公开的 `holdFire`，仍可能在这条隐藏检查上失败。真实输入能排除 API 空壳。要让严格成功只反映已公开的要求，具体输入映射也需要写进公开规格。

同一个任务还会从 `flight_control_sample` 发送真实鼠标移动，验证左右和上下位移符号相反；从 `air_hazard_nearby` 尽量让直升机朝有坐标的危险移动，坐标不可用时则向下移动，再观察生命、战斗 revision、爆炸或警告。合法生产检查要求资金下降，并观察队列增长或 production revision；随后还要出现队列完成、友军数增长或新的 production revision 之一。另一条非法订单检查验证资金、队列与友军数量保持不变。完整因果链是测试设计目标，字段变化只是其中一种证据。

## 6. 实验结果：高平均分下的交付缺口

### 设置与读数口径

RQ1 比较九个 agent stack。这里的 stack 是模型与 harness 的组合，harness 为 Claude Code 2.1.206 或 Codex CLI 0.153.4。RQ1 全部使用各 stack 的最大 reasoning effort 和完整工具权限；RQ2 至 RQ4 以 DeepSeek-V4-Flash、Claude Code、最大 reasoning effort、完整工具和 120 轮名义预算为共同基线，再改变一个因素。

所有实验使用同一批 47 个任务。每个 task-configuration 组合只运行一次，从干净工作区开始；L2 使用固定 1280×800 的无头 Chromium。这些是论文条件下的单次观测，无法给出方差估计或稳定排名。

### RQ1：九个 agent stack 的端到端交付

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-3-leaderboard.png" alt="原论文 Table 3：九个模型与 harness 组合的严格成功率和检查通过率">
  <figcaption><strong>原论文 Table 3。</strong>GPT-6-Astra + Codex CLI 的严格成功为 26/47，平均 L2 为 93.2%。Claude-Opus-5 为 24/47，GPT-5.6-Sol 为 21/47。</figcaption>
</figure>

九个 stack 的平均 L1 都在 97.7% 至 99.6% 之间，严格成功却分布在 14.9% 至 55.3%。即使 GPT-6-Astra 的平均 L2 达到 93.2%，仍有 21 个任务没有满足全部必需检查；它的 47 个产物中也只有 40 个通过全部 L1。

两个指标的排序还会冲突。GPT-5.6-Sol 的平均 L2 为 91.3%，高于 Claude-Opus-5 的 90.4%，严格成功数却是 21 对 24。按 mean L2 排名会把这两个 stack 的严格成功顺序排反。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-4-resource-use.png" alt="原论文 Table 4：各模型与 harness 组合的产物大小、token 和报告成本">
  <figcaption><strong>原论文 Table 4。</strong>更多 token 或更大的文件没有稳定对应更多严格成功。GPT-6-Astra 平均输出 55.5k token，严格成功 26 个；两个 DeepSeek 变体约为 203k，分别成功 18 和 15 个。</figcaption>
</figure>

### RQ2：工具权限与轮数预算

<div class="gb-two">
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-5-tool-ablation.png" alt="原论文 Table 5：工具权限消融"><figcaption><strong>原论文 Table 5。</strong>DeepSeek-V4-Flash 在无工具、仅文件、文件加语法检查、完整工具下分别严格成功 7、6、9、18 个任务。完整工具的 P1 通过率为 86.7%。</figcaption></figure>
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-6-turn-budget.png" alt="原论文 Table 6：30、60、120 轮预算"><figcaption><strong>原论文 Table 6。</strong>30、60、120 轮时分别只有 10、32、47 个任务完成评测，按全部 47 个计划任务计算的严格成功为 7、13、18。</figcaption></figure>
</div>

完整工具带来的变化主要出现在运行行为。L1 在四种工具条件下都接近 99%，完整工具却把 P1 提高到 86.7%，严格成功升至 18/47。只加入 `node --check` 让严格成功从 6 增到 9，但 P1 从 66.2% 降到 63.4%；`node --check` 的增益没有体现在 P1 通过率上。

轮数表需要同时看两个分母。30 轮时仅 10 个任务进入评测，其中 7 个成功，条件成功率看起来有 70.0%；按预先计划的全部 47 个任务计算，仍只有 14.9%。更高预算让更多任务完成生成并进入评测，数据不能据此证明已评测任务本身的行为质量也随预算提高。

### RQ3：High 严格成功 19/47，Max 为 18/47

<div class="gb-two">
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-7-reasoning-effort.png" alt="原论文 Table 7：推理强度比较"><figcaption><strong>原论文 Table 7。</strong>High 严格成功 19/47，Max 为 18/47。High 少用 26.9% 的 reasoning token；Max 的 P0/P1/P2 通过率更高。</figcaption></figure>
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-8-harness.png" alt="原论文 Table 8：Claude Code 与 Codex CLI harness 比较"><figcaption><strong>原论文 Table 8。</strong>两种 harness 都严格成功 18/47，但只有 10 个任务共同成功，各有 8 个独占成功，另有 21 个都失败。</figcaption></figure>
</div>

Low、High、Max 的严格成功分别为 7、19、18。与此同时，聚合 P1 从 71.7% 上升到 82.7% 和 86.7%。Max 的更高聚合 P1 没有转化为更多严格成功；每个配置又是一次独立生成，论文没有提供逐任务配对因果证据。

### RQ4：相同总分对应不同成功集合

Claude Code 与 Codex CLI 在固定模型和 reasoning effort 下都得到 18 个严格成功，成功集合却明显不同。harness 会改变系统指令、上下文管理、工具 schema、命令执行和 endpoint 协议。只写模型名或只看总分，都会丢失实际被测 agent stack 的重要信息。

论文还比较了同一 Sortie 任务的修复轨迹。Codex CLI 的真实输入测试发现了坐标偏移；Claude Code 的自测发现 reset 后残留状态。两条路径都最终成功，但用不同证据找到了不同错误，这也解释了相同总分为何不代表相同能力分布。

## 7. 失败诊断：真实输入与状态组合暴露缺口

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-9-diagnostics.png" alt="原论文 Table 9：Diner Dasher 与 Turbo Smash Beast 的诊断证据">
  <figcaption><strong>原论文 Table 9。</strong>Diner Dasher 的真实拖拽未推动订单；Turbo Smash Beast 在场景加载后停止了自然时间。</figcaption>
</figure>

### Diner Dasher：接口可调用，真实拖拽无效

测试从 `tray_with_correct_item` 读取托盘物品和顾客的屏幕边界，再用 CDP 从两个矩形中心发送真实鼠标拖拽。拖完后，订单、当日收入或已服务顾客数至少要有一个增加；若顾客已被服务，托盘数量必须下降。Canvas 哈希可用时，检查还要求哈希或 render revision 至少有一个变化。以下是[官方检查](https://github.com/areal-project/GameASG-Bench/blob/main/tests/diner-dasher/checks.js)的核心逻辑：

```js
const setup = await game.loadScenario('tray_with_correct_item');
const item = firstTrayItem(setup);
const customer = firstCustomer(setup);
const from = center(item && item.bounds);
const to = center(customer && customer.bounds);
if (!hasFinitePoint(from) || !hasFinitePoint(to))
  return FAIL('missing tray/customer bounds for real drag');

const beforeHash = await game.canvasHash();
const beforeScore = moneyToday(setup);
const beforeServed = countServed(setup);
const beforeTray = trayCount(setup);

await game.realMouseDrag(from, to);
const after = await game.snapshot();
const afterHash = await game.canvasHash();

if (countServed(after) <= beforeServed &&
    moneyToday(after) <= beforeScore &&
    customersServedToday(after) <= customersServedToday(setup)) {
  return FAIL('correct real drag produced no order, score, or service progress');
}
if (trayCount(after) >= beforeTray && countServed(after) > beforeServed)
  return FAIL('served item but tray did not decrease');
if (beforeHash != null && afterHash != null &&
    beforeHash === afterHash &&
    after.observability?.renderRevision === setup.observability?.renderRevision)
  return FAIL('no visible render evidence changed after real drag');
```

论文中的 GPT-6-Astra 失败产物通过 L1 和 L2 P0/P2，鼠标与触摸拖拽都没有推动服务流程。接口能调用，场景也能渲染，但真实玩家路径没有接上服务逻辑。

### Turbo Smash Beast：场景加载关闭了自然时间

这个失败实现的 `reset` 或 `loadScenario` 会进入 test mode，并停止自然时间模拟。Agent 分别自测了两条路径：通过测试接口显式推进时间，以及从新页面直接真实驾驶。两条都能工作。benchmark 的 L2 把它们组合起来，先加载 `readyUnlockedLevel` 合法场景，再按住真实鼠标并等待浏览器时间，于是车辆完全不前进。

[官方检查](https://github.com/areal-project/GameASG-Bench/blob/main/tests/turbo-smash-beast/checks.js)在按下后等待 350 ms 和 450 ms，要求 `speedRatio` 连续增长，`forwardProgress` 与 `motionRevision` 增长，HUD 速度同步上升；松开后还需要短暂滑行并减速。场景、输入、自然时间和 HUD 任一环节断开，整条核心机制都会失败。

## 8. 与相邻基准的评测边界

GameASG-Bench 连接了代码生成、完整应用生成与游戏行为验证三条工作线。下表按产物范围、测试标准的来源和行为证据比较最相邻的 benchmark，依据论文第 5 节整理。

<table class="gb-compare">
  <thead><tr><th>工作</th><th>产物范围</th><th>评测路径</th><th>与 GameASG-Bench 的边界</th></tr></thead>
  <tbody>
    <tr><td><a href="https://arxiv.org/abs/2105.09938">APPS</a> / <a href="https://arxiv.org/abs/2305.01210">EvalPlus</a></td><td>边界清晰的函数程序</td><td>输入输出与扩展测试</td><td>GameASG-Bench 处理持续运行、输入、状态和渲染相互依赖的完整产物。</td></tr>
    <tr><td><a href="https://www.swebench.com/">SWE-bench</a></td><td>已有仓库中的修复</td><td>Issue、仓库上下文与项目测试</td><td>GameASG-Bench 从空工作区生成一个完整单页游戏，并额外要求实现公开评测接口。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>完整浏览器游戏</td><td>规格引导的浏览器交互，可在最终用户动作前准备候选状态</td><td>GameASG-Bench 固定四方法接口框架，并在每题生成前声明合法场景语义，由候选实现该接口。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>完整 Godot 项目</td><td>可回放 demo、场景初始化与隐藏 rubric</td><td>GameASG-Bench 的范围更窄，交付统一为浏览器 <code>index.html</code>，以固定 L1/L2 断言验收。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.07442">GameGen-Verifier</a></td><td>生成游戏</td><td>抽取 precondition-interaction-postcondition keypoint，并向每个实现注入运行时状态</td><td>GameASG-Bench 由任务作者预先定义场景、动作和观察语义，场景不能直接制造待测结果。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2608.21833">GameXpert-Bench</a></td><td>生成、修复与迭代</td><td>生成轨在产物完成后汇集事件并加入人工审核，形成共享 event rubric</td><td>GameASG-Bench 的规格和可执行检查在生成前冻结，重点是同一检查跨私有实现复跑。</td></tr>
  </tbody>
</table>

论文的辨识度来自 predeclared evaluation interface：先定义可达前置条件、玩家级动作、稳定观察和不变量，再让 Agent 同时实现游戏与接口。这套设计给出更可复跑的逐项诊断，同时增加了接口负担，并把任务限制在单页浏览器范围内。

## 9. 局限与可迁移经验

### 结论的适用范围

- 47 个任务都要求自包含浏览器单页。结果不能直接外推到后端服务、多人同步、大型资产管线或长期运行系统。
- 每个 task-configuration 组合只跑一次。论文没有报告重复运行方差或置信区间，模型与 harness 的名次不宜解读为精确总体排序。
- 公开接口增加了实现负担。分数同时包含游戏开发能力与遵守测试契约的能力。
- L1 正则可能匹配注释；P1 的 `NOT_APPLICABLE` 又没有硬限制。两者都会影响严格成功的解释。
- 47 个参考实现全部通过，说明正控制能够被接受。论文没有报告系统性的 mutation testing 或负控制实验，因此尚不能量化检查漏过错误实现的概率。
- 严格成功依赖检查覆盖面和人工优先级。未被写成 L1 或 L2 P0/P1 的要求，不会进入这个乘积式验收指标。

### 可迁移到其他生成任务的五条设计原则

1. 在生成前写观察契约。先明确场景、动作、结果、拒绝路径和不变量，再让 Agent 实现。
2. 场景准备只缩短前置路径。最终结果仍由被测动作触发，避免把答案直接塞进初始状态。
3. 组合语义状态与独立证据。真实输入、自然时间、渲染变化和运行时异常可以约束自报快照。
4. 同时报告局部通过率与整体验收。前者便于诊断，后者揭示任何核心短板造成的交付失败。
5. 把 model、harness、工具和预算作为同一个 agent stack 报告。论文中的 harness 对照表明，相同总分也可能来自不同成功集合。

55.3% 是特定模型、harness 与单次运行条件下的结果。更容易迁移的是它的评测协议：生成前声明行为表面，用合法场景准备前置条件，以语义动作或真实输入触发结果，再用快照和运行证据交叉验证。这套流程可以把完整应用的失败定位到具体需求和组合路径。

## 附录：原图与资料

本文已在对应章节嵌入原论文全部 1 张 Figure 和 9 张 Table。逐图入口如下：

- [Figure 1：47 个任务的类型、维度与参考技术](/lib/papers/gameasg-bench/figure-1-corpus.png)
- [Table 1：三份任务文档](/lib/papers/gameasg-bench/table-1-task-documents.png)
- [Table 2：L1/L2 检查数量](/lib/papers/gameasg-bench/table-2-check-counts.png)
- [Table 3：九个 agent stack 的主结果](/lib/papers/gameasg-bench/table-3-leaderboard.png)
- [Table 4：产物大小、token 与成本](/lib/papers/gameasg-bench/table-4-resource-use.png)
- [Table 5：工具权限消融](/lib/papers/gameasg-bench/table-5-tool-ablation.png)
- [Table 6：30、60、120 轮预算](/lib/papers/gameasg-bench/table-6-turn-budget.png)
- [Table 7：推理强度比较](/lib/papers/gameasg-bench/table-7-reasoning-effort.png)
- [Table 8：Claude Code 与 Codex CLI harness 比较](/lib/papers/gameasg-bench/table-8-harness.png)
- [Table 9：Diner Dasher 与 Turbo Smash Beast 诊断](/lib/papers/gameasg-bench/table-9-diagnostics.png)

论文：[GameASG-Bench: Benchmarking Autonomous Software Generation for Game Development](https://arxiv.org/abs/2609.21293)。代码与任务：[areal-project/GameASG-Bench](https://github.com/areal-project/GameASG-Bench)。图表均裁自原论文；中文流程图与解读根据论文第 2 至 5 节及官方仓库整理。

</div>

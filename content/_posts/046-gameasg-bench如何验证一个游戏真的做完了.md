---
title: "[2026-09-18] GameASG-Bench: Benchmarking Autonomous Software Generation for Game Development"
permalink: "/posts/论文解读/gameasg-bench.html"
date: "2026-09-21T21:31:01+08:00"
updated: "2026-10-13T19:10:00+08:00"
cover: "/generated-covers/046-gameasg-bench.webp"
description: "47 个浏览器游戏怎样验收：谁写测试、编码模型系统看见哪些材料、真实拖拽如何判失败，以及为什么运行检查平均通过率 93.2% 只对应 26/47 个完整成功任务。"
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
.gb-reading .gb-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:22px 0 30px;border-block:1px solid var(--gb-line)}.gb-reading .gb-metric{min-height:102px;padding:17px 14px;border-right:1px solid var(--gb-line)}.gb-reading .gb-metric:last-child{border-right:0}.gb-reading .gb-metric strong{display:block;color:var(--gb-blue);font:680 clamp(1.65rem,3vw,2.25rem)/1 var(--sans);font-variant-numeric:tabular-nums}.gb-reading .gb-metric span{display:block;margin-top:10px;color:var(--gb-soft);font:600 .82rem/1.5 var(--sans)}
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

<p class="gb-lead">GameASG-Bench 要回答一个具体问题：模型通过编码工具根据需求做出的游戏，能否让玩家真正完成要求的操作和流程？作者用 47 个浏览器游戏测试这件事。最佳配置通过了大多数单项检查，但只有 26 个游戏通过全部必需检查。</p>

论文把通过框架读写文件、调用工具并生成代码的模型系统称为 Coding Agent，下文简称 Agent。作者把检查分成两层：L1 读取源码，检查语法和接口声明等条件；L2 在浏览器中运行游戏，实际操作并检查行为。P0、P1、P2 是另一套标签，分别表示运行前提、核心需求和扩展能力，不能与 L1/L2 混为一谈。

<div class="gb-metrics" aria-label="GameASG-Bench 关键数字">
  <div class="gb-metric"><strong>47</strong><span>浏览器游戏任务，覆盖 12 类游戏</span></div>
  <div class="gb-metric"><strong>1,221</strong><span>336 条源码检查 + 885 条行为检查</span></div>
  <div class="gb-metric"><strong>93.2%</strong><span>最佳配置的平均运行检查通过率</span></div>
  <div class="gb-metric"><strong>26/47</strong><span>最佳配置完整通过，即 55.3%</span></div>
</div>

<aside aria-label="阅读要点">
<ul>
  <li><strong>检查和公开规格都在人类写任务时确定。</strong>生成游戏的 Agent 要实现统一接口，但不能看隐藏测试。</li>
  <li>测试可以直接准备一个合法游戏局面，随后仍要执行玩家动作。加载场景本身不能提前给出胜负或伤害。</li>
  <li><strong>任意一条必需检查失败，整题就是失败。</strong>93.2% 的单项通过率和 55.3% 的完整成功率衡量的是两件不同的事。</li>
</ul>
</aside>

<h2 id="研究问题：游戏能打开，为什么仍不算做完">1. Motivation：游戏能打开，为什么仍不算做完</h2>

**能启动、能返回测试状态，还不足以证明玩家操作有效。** 论文中的 Diner Dasher 是餐厅服务游戏：GPT-6-Astra 生成的版本能打开，通过了源码检查、运行前提和扩展能力检查；评测器把托盘里的正确餐点拖给顾客后，订单和收入却都没有变化。真实鼠标和触摸两条路径都失败了。来源是论文 §4.6、Table 9 和 Appendix A.1，后文会沿着官方检查说明它怎样被判为失败。

小游戏也需要输入、角色状态、画面、资源和胜负流程协同工作。例如，扣弹药的函数可能写对了，但开火按键没有调用它；移动代码也可能只改变测试接口里的坐标，没有改变实际渲染的角色。函数测试和源码扫描很难单独证明这些环节已经接通。

评测器还必须适应不同实现。同一项需求可以用数组、对象或不同事件处理方式实现，测试不能绑定某个内部变量名。让测试每次从开局重新玩到后期，又会花费很长时间。作者因此要求游戏提供一个公开测试接口：评测器用它准备局面、执行约定的玩法动作并读取状态，再按需加入真实键鼠、画面变化和浏览器报错等证据。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/body-method.svg"><img src="/lib/papers/gameasg-bench/body-method.svg" alt="GameASG-Bench 从人工任务规格到隐藏评测和整题成功的流程" width="1200" height="820"></a>
  <figcaption><strong>本文绘制的评测流程。</strong>左侧是生成前固定的材料，右侧是收到成品后的执行顺序。测试接口必须读写实际驱动画面的游戏状态；L1 失败也不阻止 L2 继续运行。依据论文 §2、§3 和 Appendix B。</figcaption>
</figure>

<h2 id="相关工作：同样测游戏，判分依据有何不同">2. Related Work：同样测游戏，判分依据有何不同</h2>

**本文的重点是让同一套预先写好的检查适用于不同代码实现。** 它沿用软件测试中的公开行为规范和隐藏断言，并把这套分工放进完整游戏生成任务。

APPS、EvalPlus 主要检查边界明确的程序题；SWE-bench 检查已有仓库的修复。WebGen-Bench、E2EDev 等将对象扩展到完整应用。GameGPT、Play2Code、ALIVE 等则研究协作、试玩或执行反馈怎样改善游戏生成。与 GameASG-Bench 最接近的是下面四种游戏评测设计。

<div class="gb-table-scroll">
<table>
  <thead><tr><th>工作</th><th>Agent 交付与可见输入</th><th>如何取得判分证据</th><th>与本文的主要区别</th></tr></thead>
  <tbody>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>根据规格生成浏览器游戏</td><td>按规格指导浏览器交互；允许先准备候选状态，再执行用户动作</td><td>本文提前规定场景、动作、状态字段和不应被破坏的条件，并固定可执行检查</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>完整 Godot 项目，以及可重放的演示</td><td>演示含场景初始化；隐藏评分规则检查回放证据</td><td>本文交付单个 HTML，由评测器运行 L1/L2 检查，而非只看 Agent 提交的演示</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.07442">GameGen-Verifier</a></td><td>根据规格生成游戏</td><td>将需求拆成前置条件、交互和后置条件，再向每份实现注入运行状态</td><td>本文让 Agent 主动实现公开接口，场景含义在生成前就确定</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2608.21833">GameXpert-Bench</a></td><td>生成、修复及迭代改进游戏</td><td>生成赛道汇总已完成产物中的事件，经人工审核形成共享评分规则，再检查代码和实时交互</td><td>本文的规格和检查在生成前定稿，不随候选实现调整</td></tr>
  </tbody>
</table>
</div>

这个区别不意味着其他工作“都不测真实操作”。WebGameBench 和 GameGen-Verifier 也会准备状态、执行交互。本文要解决的是不同实现怎样接受一致的检查，以及检查里的每条失败怎样对应一项公开需求。比较依据为论文 §5.3；这里没有把各 benchmark 的不同分数当成可直接横比的能力排名。

<h2 id="任务与评测：从公开规格走到一条真实判定">3. Benchmark / Protocol：从公开规格走到一条真实判定</h2>

**人类写需求和检查，Agent 写游戏，评测器运行隐藏检查。** 这三种责任必须分开，才能读懂数据是怎么来的、失败又是在哪里发生的。

<h3 id="任务来源和纳入范围">3.1 任务来源和纳入范围</h3>

每个任务都必须包含一个完整、可在限时浏览器测试中跑完的玩法循环：玩家输入改变状态，产生可观察的进展或胜负，并能重新开始。依赖后端、账号、外部数据库、付费或私有资产，以及无法在有限测试时间里观察结果的多人系统被排除。最终任务集覆盖 12 类游戏，其中 32 个是 2D，15 个是 3D。47 题在所有报告实验中共用，论文没有另外划出训练集。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/figure-1-corpus-redrawn.svg"><img src="/lib/papers/gameasg-bench/figure-1-corpus-redrawn.svg" alt="根据论文 Figure 1 数据重绘的 47 个任务分布" width="1480" height="720"></a>
  <figcaption><strong>根据原论文 Figure 1 数据重绘。</strong>任务类型、2D/3D 和参考实现的渲染技术是三种独立描述。Canvas 2D、Three.js 等标签只统计参考实现，不限制 Agent 必须使用相同技术。点击查看原尺寸。</figcaption>
</figure>

<h3 id="三份公开文档和两份隐藏检查">3.2 三份公开文档和两份隐藏检查</h3>

任务作者在生成前人工写好并固定玩法规格、评测接口规范、L1/L2 检查和 P0/P1/P2 优先级。这些材料不会根据 Agent 提交的代码临时改写。负责启动模型会话、管理上下文和提供工具的运行框架称为 harness。它只把 <code>target.md</code> 直接传入提示词；另外两份文档放在工作区，由 Agent 读取。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-1-task-documents-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-1-task-documents-redrawn.svg" alt="根据 Table 1 重绘的公开文档、内容和可见范围" width="1312" height="397"></a>
  <figcaption><strong>根据原论文 Table 1 数据重绘。</strong>三份文档都放在 Agent 的工作区中；只有 <code>target.md</code> 直接进入初始提示。文件名并不代表来源：它们由任务作者编写，不是 Agent 完成游戏后自动生成的报告。</figcaption>
</figure>

<div class="gb-table-scroll">
<table>
  <thead><tr><th>材料</th><th>来源与可见性</th><th>具体用途</th></tr></thead>
  <tbody>
    <tr><td><code>target.md</code></td><td>人类任务作者；Agent 可见</td><td>工作区规则、交付要求和简短玩法说明</td></tr>
    <tr><td><code>game-spec.md</code></td><td>人类任务作者；Agent 可见</td><td>玩家操作、玩法机制、反馈、胜负和重启</td></tr>
    <tr><td><code>tdd.md</code></td><td>人类任务作者；Agent 可见</td><td>测试怎样加载局面、执行动作、读取状态；非法动作应拒绝什么、哪些值应保持不变</td></tr>
    <tr><td><code>checks.json</code></td><td>人类任务作者；对 Agent 隐藏</td><td>声明 L1 的结构或语法检查、正则断言和禁止出现的源码写法</td></tr>
    <tr><td><code>checks.js</code></td><td>人类任务作者；对 Agent 隐藏</td><td>用 JavaScript 实现 L2 的浏览器操作和行为判断</td></tr>
    <tr><td>参考实现</td><td>作者团队提供；不交给 Agent</td><td>人类先独立试玩确认合格，再用同一套自动测试验收</td></tr>
  </tbody>
</table>
</div>

论文说清了人工编写和参考实现验证，但没有报告标注者人数、标注者之间的一致率或系统性的错误实现测试。不能把“人工写好检查”进一步理解成已经量化了测试的误杀和漏判率。

<h3 id="Agent-交付什么，接口怎样工作">3.3 Agent 交付什么，接口怎样工作</h3>

Agent 在全新工作区和会话里生成 <code>index.html</code>。官方 README 进一步说明：自写 HTML、CSS 和 JavaScript 都要包含在该文件里，允许的第三方库可以使用稳定 CDN 地址；评测不提供本地配套资产。因此，“单文件交付”不等于完全禁止第三方网络库。

生成与评测在两个隔离容器里运行。进入评测前，系统要求生成进程正常退出，<code>index.html</code> 是普通文件、不是符号链接、非空且含 <code>&lt;/html&gt;</code>。通过预检后，HTML 和检查脚本才以只读方式交给评测容器。

公开接口统一叫 <code>window.__gameTest</code>，但场景、动作和返回字段由各任务的 <code>tdd.md</code> 决定。下面是接口形状示意，不是可直接运行的 JavaScript：

```text
window.__gameTest
  reset(options)                 → 初始游戏状态
  loadScenario(name, options)    → 指定合法起点
  input(action)                 → 执行玩家级动作后的状态
  getSnapshot()                 → 当前状态摘要
```

<code>getSnapshot</code> 返回 JSON 状态摘要，论文称为 snapshot，例如弹药、角色位置和胜负状态。它必须报告实际游戏使用的状态，不能另外维护一套专供测试的假数据。<code>loadScenario</code> 可以调整位置和资源，直接准备一个正常游玩也能到达的局面；但不能在加载时提前打中敌人、完成上菜或判定胜负。

<h3 id="一次-L2-检查怎样执行">3.4 一次 L2 检查怎样执行</h3>

L1 先检查 HTML 及其内联或直接链接的本地脚本。正则匹配只能证明要求的源码模式出现过，甚至可能匹配到注释；它不能证明玩法有效。L1 失败不会阻止 L2 执行，报告仍可区分源码条件失败和运行行为失败。

L2 在无界面 Chromium 浏览器中执行 <code>checks.js</code>。每条 L2 检查都新建一个页面，加载游戏、准备场景、执行动作、观察结果；完成或超时后关闭页面，再运行下一条。检查可以调用公开接口，也可以发送真实鼠标、键盘或触摸输入。浏览器观测代码记录动画帧、输入监听器、Canvas/WebGL 绘制和运行异常，具体检查再选用相关信号。

“画面确实更新”与“画面内容正确”仍是不同判断。一次 Canvas 绘制或一个版本计数增加，不能单独证明弹丸打中了正确敌人。每条检查究竟要求哪些证据，要看它自己的布尔条件，而不能把整个评测器拥有的信号都当作该条已经用过。

<h3 id="真实-case：Diner-Dasher-的鼠标上菜">3.5 真实 case：Diner Dasher 的鼠标上菜</h3>

这条 case 延续开头的失败样例。来源是人类作者写的 <a href="https://github.com/areal-project/GameASG-Bench/blob/6427cb6517ce11ff350ec45fcae17b67c5aec245/tests/diner-dasher/checks.js">官方 <code>checks.js</code></a> 中 <code>p1-real-mouse-drag-correct-serve</code>，以及论文 Appendix A.1。

评测器先加载 <code>tray_with_correct_item</code>：托盘里放着能满足当前顾客订单的餐点，但尚未完成上菜。随后从 snapshot 读取餐点和顾客在屏幕上的矩形边界，取各自中心作为拖拽起点和终点。坐标来自当前游戏，不是写死的像素常量。

浏览器按下鼠标左键，分 6 次移动到顾客中心，每次等待 40 ms，最后松开并等 250 ms。之后再读取状态和画面摘要。官方检查依次要求：

1. 已完成订单项数、当日收入、已服务顾客数中至少一个增加。
2. 如果订单项的 <code>served</code> 计数增加，托盘餐点数量还必须减少。
3. 只有前后 Canvas hash 都可读时，才检查画面摘要或 <code>renderRevision</code> 至少一个改变。Canvas hash 是画面像素的摘要；<code>renderRevision</code> 是游戏报告的渲染变化计数。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/body-case.svg"><img src="/lib/papers/gameasg-bench/body-case.svg" alt="Diner Dasher 从托盘拖餐点到顾客的真实输入检查及失败位置" width="1200" height="820"></a>
  <figcaption><strong>本文根据官方检查绘制的上菜 case。</strong>图中只画出状态、操作和断言，没有补造作者未公开的坐标或收入数值。GPT-6-Astra 的实际失败发生在第一项“服务进度没有增加”，尚未执行后面的托盘消耗和画面断言。依据 Appendix A.1 和 <code>checks.js</code> 第 552–581 行。</figcaption>
</figure>

下面节选 JavaScript/Chromium 检查的核心判断，辅助函数来自官方脚本，节选本身不是独立可运行程序：

```js
const beforeScore = moneyToday(setup);
const beforeServed = countServed(setup);
const beforeTray = trayCount(setup);
await game.realMouseDrag(from, to);
const after = await game.snapshot();
const afterHash = await game.canvasHash();

if (countServed(after) <= beforeServed &&
    moneyToday(after) <= beforeScore &&
    customersServedToday(after) <= customersServedToday(setup))
  return FAIL('correct real drag produced no order, score, or service progress');

if (trayCount(after) >= beforeTray && countServed(after) > beforeServed)
  return FAIL('served item but tray did not decrease');

if (beforeHash != null && afterHash != null &&
    beforeHash === afterHash &&
    (after.observability || {}).renderRevision ===
      (setup.observability || {}).renderRevision)
  return FAIL('no visible render evidence changed after real drag');
```

论文里的 GPT-6-Astra + Codex CLI 提交在鼠标和触摸两条上菜检查中都没有产生服务进度，因此 P1 失败。它通过了 L1、P0、P2，仍不满足核心需求。这是公开的真实失败记录；上面的图是根据规则绘制，不是模型运行截图。

<h3 id="再核对一条官方检查：Armor-Alley-持续射击">3.6 再核对一条官方检查：Armor Alley 持续射击</h3>

Armor Alley 是横向卷轴直升机战术游戏。<a href="https://github.com/areal-project/GameASG-Bench/blob/6427cb6517ce11ff350ec45fcae17b67c5aec245/task/armor-alley/game-spec.md">公开玩法规格</a>要求按住时消耗弹药并产生可见弹丸，松开后停止；<a href="https://github.com/areal-project/GameASG-Bench/blob/6427cb6517ce11ff350ec45fcae17b67c5aec245/task/armor-alley/tdd.md"><code>tdd.md</code></a> 定义 <code>holdFire</code> 动作及 <code>air_attack_with_targets</code> 场景。场景应有可用武器和可攻击目标，不能提前记录命中或伤害。

隐藏的 <code>checks.json</code> 用正则确认四个接口方法的源码声明；真正的射击检查位于 <code>checks.js</code> 的 <code>p1-keyboard-sustained-fire-release</code>。该条先核对必要状态字段、正在游玩、尚无胜负、直升机已升空；它并未在前置谓词里逐项检查有弹药和可攻击目标。接着执行下面的真实按键序列。代码按官方逻辑节选，省去驱动器和通用数值辅助函数；运行环境是 JavaScript/Chromium，不是独立可运行样例。

```js
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
  count(afterRelease, 'projectiles') <= count(released, 'projectiles') + 1 ||
  rev(afterRelease, 'projectiles') === rev(released, 'projectiles');

if (!grewWhileHeld) return FAIL('held fire did not create projectile/combat/ammo evidence');
if (!plateauAfterRelease) return FAIL('fire continued growing after release');
```

<code>rev(...)</code> 读取游戏报告的变化计数：<code>projectiles</code> 表示弹丸变化，<code>combat</code> 表示战斗变化。按住期间，四种证据只要有一种成立就通过；松开后，弹丸数量最多增加 1 或弹丸变化计数不变，两者也只需成立其一。

这里有个容易误读的辅助函数。官方 <code>game.wait</code> 的执行顺序是先调用游戏的 <code>input({type:'wait'})</code>、保存它返回的快照，再让浏览器等待，最后返回此前保存的快照：

```js
async wait(durationMs = 250) {
  const snap = clonePublic(
    await call('input', { type: 'wait', durationMs })
  );
  await browser.sleep(Math.min(Math.max(durationMs, 50), 1000));
  return snap;
}
```

因此 <code>afterRelease</code> **不是自然等待 550 ms 后重新读取的状态**。按下、松开和最初的等待是真实浏览器操作，但最后一份观察还经过公开 <code>wait</code> 动作。不能把这条描述成完全不调用测试接口的自然时间测试。依据官方文件第 149–153、435–457 行。

按该布尔规则做一个说明性计算：假设按住后弹药从 20 降到 18，即使当前弹丸数没增加，第一项也成立；松开后的两份观察若弹丸数相同，第二项成立。反过来，如果四种开火证据都没有变化，检查立即 FAIL。这些数字只是演算，不是作者公开的模型日志；该条本身也不要求一定命中敌人。

这条还暴露了公开规格与隐藏输入的不一致：<code>game-spec.md</code> 只要求按住/松开开火，<code>tdd.md</code> 只定义 <code>holdFire</code>，两者都没有规定必须使用 Space 键。某个提交即使完整实现了公开要求，只要使用了其他开火键，仍会被这条隐藏检查判为失败。真实按键检查的按键映射也应该进入公开规格。

<h3 id="从单条-PASS-汇总到完整成功">3.7 从单条 PASS 汇总到完整成功</h3>

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-2-check-counts-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-2-check-counts-redrawn.svg" alt="根据论文 Table 2 重绘的 L1/L2 数量和优先级" width="1142" height="451"></a>
  <figcaption><strong>根据原论文 Table 2 数据重绘。</strong>L1 共 336 条：43 条工具检查、288 条正则检查、5 条禁止写法检查。L2 共 885 条：102 条 P0、534 条 P1、249 条 P2。层级和优先级不是同一种分类。</figcaption>
</figure>

每条 L2 返回 <code>PASS</code>、<code>FAIL</code> 或 <code>NOT_APPLICABLE</code>。后者表示不适用，在适用检查的分母中排除。主指标叫 strict task success，下文称“完整通过”：一个任务只有在交付有效、评测完成，并且全部 L1 和所有适用的 L2 P0/P1 都通过时才记为 1；否则记为 0。P2 单独报告，不参与这项判定。

<div class="gb-formula">
  <code>s_g = delivery_g × evaluation_g × ∏ pass(g,c), c ∈ L1_g ∪ applicable L2(P0,P1)_g</code>
  <code>StrictSuccess = (Σ s_g) / 47</code>
  <span>没有交付、评测未完成或任一必需检查失败，都记为 0；全部 47 个计划任务仍在分母里。</span>
</div>

部分通过率采用不同口径：平均 L1 和总体 L2 是先算每个完成评测任务的检查通过率，再对任务取平均；P0/P1/P2 则汇总所有完成评测任务中的适用检查，以通过项数除以总项数。因此，93.2% 表示平均 L2 通过率，并非 93.2% 的任务完整通过。26/47 × 100 = 55.319…%，按表格精度就是 55.3%。

当前 runner 没有禁止 P1 返回 <code>NOT_APPLICABLE</code>，而计分又会忽略这类检查。也就是说，本应验收的某条核心需求可能被排除，而没有阻止整题通过。这个限制来自论文 §2.4，不是仅凭“隐藏测试”就能消除的问题。

<h3 id="测试本身怎样验证">3.8 测试本身怎样验证</h3>

任务作者对 47 份参考实现先做人类独立检查，确认真实操作、核心状态、胜负、重启及接口与画面的一致性，再运行同一套自动测试。全部参考实现通过 L1 和适用的 P0/P1，它们是 positive controls，即已知应通过的正确样例。

这只能证明测试能接受这些正确实现。论文没有报告系统性的 mutation testing，也就是故意向正确代码注入缺陷再检查能否发现。因此，测试到底会漏掉多少种错误、接口快照和画面证据能否被同时伪造，仍不能由这 47 个正样例量化。

<h2 id="实验结果：高单项分数为何掩盖整题失败">4. Experiments：高单项分数为何掩盖整题失败</h2>

**最强配置也只完整通过了 26/47；L1 高分主要说明源码条件容易满足。** 论文比较九种模型与 harness 组合，每个“任务 × 配置”只运行一次，从空白工作区开始。统一使用 1280×800 的无界面 Chromium。harness 版本是 Claude Code 2.1.206、Codex CLI 0.153.4。

<h3 id="九种完整配置的主结果">4.1 九种完整配置的主结果</h3>

RQ1 使用各模型可用的最高推理强度和全部工具，九种配置都交付并完成评测。论文把“模型 + harness”称为 agent stack，强调成品来自模型、上下文管理和工具环境共同作用。

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-3-leaderboard-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-3-leaderboard-redrawn.svg" alt="根据论文 Table 3 重绘的九种模型与 harness 结果" width="1252" height="659"></a>
  <figcaption><strong>根据原论文 Table 3 数据重绘。</strong>GPT-6-Astra + Codex CLI 的平均 L2 通过率为 93.2%，但 47 个任务中只有 26 个通过全部必选检查。剩余 21 个至少有一项必需条件不满足；单项分数不能直接当作整题成功率。</figcaption>
</figure>

九种配置的 L1 均值在 97.7% 至 99.6%，完整成功数却从 7/47 到 26/47。GPT-5.6-Sol 的平均 L2 为 91.3%，高于 Claude-Opus-5 的 90.4%，完整成功数反而是 21 对 24。错误散落在不同游戏里，还是集中在少数游戏里，会改变整题结果。

Table 4 也没有显示文件越大或 token 用量越高，就越容易完成更多任务。这里的 token 是模型处理的文本单位；不同供应商的输入、缓存和推理计费口径也需要随配置一起读，不能只拿一个输出长度解释能力。

<h3 id="工具和轮次：更多任务先获得了交付机会">4.2 工具和轮次：更多任务先获得了交付机会</h3>

RQ2–RQ4 共用 DeepSeek-V4-Flash + Claude Code、最高推理强度、全部工具和名义 120 轮作为基线。轮次是框架允许的模型交互上限，不等于浏览器操作次数。官方 README 的默认单次生成时限为 3,600 秒、一次新会话尝试；这是代码默认值，不据此推断所有论文运行都用了相同实际时长。

工具消融依次为无工具的序列化 API、只读写文件、文件加 <code>node --check</code> 语法检查、完整工具。完整成功数分别是 7、6、9、18，分母均为 47。语法检查从 6 增到 9，但 P1 通过率反而从 66.2% 降到 63.4%，再次说明两种指标不等价。

完整工具增加了多种能力，**没有单独隔离浏览器工具的贡献**。附录能展示某次浏览器运行怎样暴露 Canvas 错误或输入坐标错误，但不能由此算出浏览器本身贡献了多少总提升。

轮次上限为 30、60、120 时，完成评测的任务数依次是 10、32、47，完整成功数是 7、13、18。按全部 47 题算，成功率提高；只看已完成评测的子集，则是 7/10 = 70.0%、13/32 = 40.6%、18/47 = 38.3%。后一组下降不能解读成“更多轮次让模型变差”：不同上限下进入评测的任务集合不同。

<h3 id="推理强度和-harness：只有一次运行，别把一题差距当定律">4.3 推理强度和 harness：只有一次运行，别把一题差距当定律</h3>

Low、High、Maximum 的完整成功数为 7、19、18；P1 通过率为 71.7%、82.7%、86.7%。High 用的内部推理 token 比 Maximum 少 26.9%，多完成一题。它说明这批运行里存在成本与整题结果的折中，没有建立“High 总比 Maximum 好”的稳定规律。

换 harness 后，DeepSeek-V4-Flash 在 Claude Code 和 Codex CLI 下都成功 18/47，但只有 10 题重合，各有 8 题独有成功，另有 21 题双方都失败。系统指令、上下文、工具格式、执行方式和模型接口协议同时变化，不能把差别只归因于某一个功能。

<details class="gb-evidence-details">
  <summary><span>资源、工具、轮次和 harness 的完整数据</span><span>根据原论文 Tables 4 至 8 重绘</span></summary>
  <figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-4-resource-use-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-4-resource-use-redrawn.svg" alt="根据 Table 4 重绘的文件大小、token 与成本" width="1162" height="671"></a>
  <figcaption><strong>根据 Table 4 数据重绘。</strong>输入 token 合并报告中的 input、cache-read、cache-write；文件大小和资源用量没有稳定对应更多完整成功。</figcaption>
</figure>
  <figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-5-tool-ablation-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-5-tool-ablation-redrawn.svg" alt="根据 Table 5 重绘的四种工具条件" width="1162" height="461"></a>
  <figcaption><strong>根据 Table 5 数据重绘。</strong>完整工具成功 18/47，三种受限条件为 6 至 9/47；无法单独确定浏览器的贡献。</figcaption>
</figure>
  <figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-6-turn-budget-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-6-turn-budget-redrawn.svg" alt="根据 Table 6 重绘的轮次和交付完成情况" width="1092" height="412"></a>
  <figcaption><strong>根据 Table 6 数据重绘。</strong>30/60/120 轮时仅 10/32/47 题完成评测；主指标仍以全部 47 题为分母。</figcaption>
</figure>
  <figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-7-reasoning-effort-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-7-reasoning-effort-redrawn.svg" alt="根据 Table 7 重绘的三档推理强度" width="1107" height="418"></a>
  <figcaption><strong>根据 Table 7 数据重绘。</strong>High 成功 19/47，Maximum 为 18/47，但后者的 P1 通过率更高；均为一次运行。</figcaption>
</figure>
  <figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-8-harness-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-8-harness-redrawn.svg" alt="根据 Table 8 重绘的两个 harness 比较" width="1112" height="375"></a>
  <figcaption><strong>根据 Table 8 数据重绘。</strong>两个 harness 各成功 18 题，只有 10 题相同。</figcaption>
</figure>
</details>

<h3 id="另一种真实失败：接口自测与自然运行没有接上">4.4 另一种真实失败：接口自测与自然运行没有接上</h3>

<figure class="gb-figure">
  <a href="/lib/papers/gameasg-bench/table-9-diagnostics-redrawn.svg"><img src="/lib/papers/gameasg-bench/table-9-diagnostics-redrawn.svg" alt="根据 Table 9 重绘的 Diner Dasher 与 Turbo Smash Beast 失败" width="1382" height="448"></a>
  <figcaption><strong>根据原论文 Table 9 数据重绘。</strong>Diner Dasher 在真实拖拽时失败；Turbo Smash Beast 则在加载场景后停止随真实时间推进。前者已经在方法部分沿官方检查展开。</figcaption>
</figure>

Turbo Smash Beast 中，DeepSeek-V4-Flash + Claude Code 生成的代码在 <code>reset</code> 或 <code>loadScenario</code> 后开启 test mode，关闭了随真实时间推进的仿真。Agent 的接口自测会手动推进时间，而真实驾驶自测从一个新打开的页面开始，两条测试都没触发“先加载场景，再真实驾驶”的组合。

官方 <code>p1-real-hold-accelerates</code> 先加载 <code>readyUnlockedLevel</code>，在游戏区内按住鼠标，350 ms 后取中间状态，再保持按下并等待 450 ms 取最终状态，最后松开。检查要求输入被识别为持续按下，速度依次上升，前进进度和运动变化计数增加，速度 HUD 也增加。注意第二段等待时鼠标仍按着，不是先松开再滑行。

论文里的错误实现加载场景后停止自动更新，真实等待无法产生这些变化。来源是 Appendix A.1 和官方 <code>checks.js</code> 第 845–870 行。它与 Armor Alley 最后调用 <code>wait</code> 接口的检查不同：这条加速观察确实使用两段真实等待和之后的新快照。

<h2 id="研究启发：先补哪些能改变结论的实验">5. Discussion：先补哪些能改变结论的实验</h2>

**最值得补的是评测可靠性和可归因的对照。** 论文没有单独的未来工作章节；以下是基于结果提出的分析，不是作者已经验证的方法。

首先，用明确有错的实现检查测试本身。可以分别断开真实输入、伪造 snapshot、让场景加载冻结时钟、只支持某个按键，再看哪些检查能发现。公开按键要求和 P1 的 <code>NOT_APPLICABLE</code> 规则也应一并修正，否则分数会混入规格不一致和测试漏判。

其次，把工具或 harness 的变化拆开，并重复同一配置。完整工具相对受限工具高分，但增加的不止浏览器；High 与 Maximum 只差一题；两套 harness 同分却成功不同任务。只有固定其他条件、逐项改动并重跑，才能判断某种修复或执行策略是否稳定有效。

如果进一步研究“将执行反馈用于训练”，应把可见训练测试和最终隐藏检查分开。模型可能学会迎合接口和已知断言，却没有改善真实游戏；需要用新的场景、错误实现对照和真实输入一起验收。这个建议是从本文的检查边界推导的，不是论文训练实验的结论。

<h2 id="总结与边界：这是需求验收，不是完整游戏质量排名">6. Conclusion：这是需求验收，不是完整游戏质量排名</h2>

**GameASG-Bench 把“完整成功”定义得比平均检查分数严格。** 人类提前写好玩法、接口和隐藏检查；Agent 交付游戏；评测器准备合法局面、操作并观察。最佳平均 L2 通过率为 93.2%，完整成功率为 26/47 = 55.3%，这是这篇论文最清楚的实验证据。

它没有量化所有错误实现的漏判率，也不覆盖后端、大规模多人服务或完整游戏内容与体验。接口状态、版本计数和画面信号能提供互补证据，但具体检查仍可能较宽松。Armor Alley 的 Space 映射和最后的 <code>wait</code> 快照顺序，说明读者需要核对真实脚本，不能只读流程图就默认每个步骤都完美实现。

每种配置只运行一次，排名和一题的差距都带有未估计的随机波动。使用这套 benchmark 时，应该同时报告有效交付、完成评测、适用检查通过率和完整成功数，并明确模型、harness、工具权限、预算与代码版本。

论文：<a href="https://arxiv.org/abs/2609.21293">GameASG-Bench</a>。代码核对版本：<a href="https://github.com/areal-project/GameASG-Bench/tree/6427cb6517ce11ff350ec45fcae17b67c5aec245">6427cb6</a>。原论文分发许可未确认允许直接复用图像，因此本文保留其全部 1 张 Figure、9 张 Table 的数据重绘，另画流程和真实 case，不使用原论文像素。

</div>

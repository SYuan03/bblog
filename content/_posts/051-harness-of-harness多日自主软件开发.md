---
title: "[2026-09-01] Harness-of-Harness: Multi-Day Autonomous Software Development with Continual Improvement"
permalink: "/posts/论文解读/harness-of-harness.html"
date: "2026-09-29T07:30:00+08:00"
updated: "2026-10-14T16:00:00+08:00"
cover: "/generated-covers/051-harness-of-harness.webp"
description: "让现成编码助手反复规划、开发和独立测试同一个项目，保留代码与对应版本的验证记录。结合真实第 70 轮失败记录，核对方法、评分、成本，以及论文设计与公开实现的差别。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 22
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Codex"
  - "Autonomous Software Development"
  - "Software Engineering"
---

<style>
html:not([data-theme="dark"]) body:has(.hoh-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:28ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.hoh-reading{--column:780px;--blue:#285d9b;--orange:#ad5735;--green:#2b7562;--red:#a0443d;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.hoh-reading>*{max-width:100%}.hoh-reading p,.hoh-reading li{text-wrap:pretty}.hoh-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.hoh-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.hoh-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.hoh-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.hoh-reading .deck-head strong{font-size:.92rem}.hoh-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.hoh-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.hoh-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.hoh-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.hoh-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.hoh-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line-local));background:color-mix(in srgb,var(--blue) 5%,#fff)}.hoh-reading .interest b{color:var(--blue);font:750 1.2rem/1 var(--mono)}.hoh-reading .interest span{color:var(--soft);font-size:.84rem}
.hoh-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.hoh-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.hoh-reading .metric:last-child{border-right:0}.hoh-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.27rem,3vw,1.72rem)/1 var(--serif)}.hoh-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.hoh-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.hoh-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.hoh-reading .keypoints ul{margin:0;padding-left:1.2rem}.hoh-reading .keypoints li{margin:.42rem 0}.hoh-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--green);background:var(--surface)}.hoh-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.hoh-reading .kicker{display:block;margin-bottom:6px;color:var(--green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.hoh-reading h2{margin-top:3.55rem}.hoh-reading h3{margin-top:2.1rem}.hoh-reading h4{margin-top:1.7rem}.hoh-reading strong{font-weight:750}.hoh-reading .table-scroll,.hoh-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.hoh-reading .table-scroll table{display:table;width:100%;min-width:700px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.hoh-reading th,.hoh-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.hoh-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.hoh-reading td:first-child{font-weight:650}.hoh-reading .code-scroll pre{min-width:700px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.hoh-reading code{font-size:.92em}
.hoh-reading .figure{width:100%;margin:27px 0}.hoh-reading .figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.hoh-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.hoh-reading .figure-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:26px 0}.hoh-reading .figure-grid .figure{min-width:0;margin:0}.hoh-reading .figure-grid .figure img{width:100%}
.hoh-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.hoh-reading .role{padding:16px;background:#fff}.hoh-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.hoh-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.hoh-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.hoh-reading .flow li{min-height:132px;padding:12px;background:var(--surface)}.hoh-reading .flow b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.hoh-reading .flow span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.hoh-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.hoh-reading .case h4{margin:0 0 8px;font-size:1.12rem}.hoh-reading .case ol{padding-left:1.2rem}.hoh-reading .case li{margin:.58rem 0}.hoh-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.hoh-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.hoh-reading .verdict strong{display:block;margin-bottom:4px}.hoh-reading .verdict .pass strong{color:var(--green)}.hoh-reading .verdict .fail strong{color:var(--red)}
.hoh-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.hoh-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.hoh-reading .note p{margin:.34em 0}.hoh-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.hoh-reading .judge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:22px 0;background:var(--line-local)}.hoh-reading .judge-grid>div{padding:16px;background:#fff}.hoh-reading .judge-grid b{display:block;color:var(--blue);font-size:.93rem}.hoh-reading .judge-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.82rem;line-height:1.5}.hoh-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.hoh-reading .limit-grid>div{padding:17px;background:#fff}.hoh-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.hoh-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.hoh-reading .metrics{grid-template-columns:1fr 1fr}.hoh-reading .metric:nth-child(2){border-right:0}.hoh-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.hoh-reading .flow{grid-template-columns:1fr 1fr}.hoh-reading .roles,.hoh-reading .judge-grid{grid-template-columns:1fr}.hoh-reading .figure-grid{grid-template-columns:1fr}.hoh-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.hoh-reading .flow,.hoh-reading .verdict,.hoh-reading .limit-grid{grid-template-columns:1fr}.hoh-reading .part0,.hoh-reading .case{padding:17px 15px}.hoh-reading .deck-head,.hoh-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="hoh-reading">

<p class="paper-meta">Haoyang Yan et al. · arXiv:2609.01481v1 · 2026-09-01</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.01481">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.01481">论文 PDF</a>
  <a href="https://github.com/Flesymeb/HarnessOfHarness">HoH 官方代码</a>
  <a href="https://github.com/Flesymeb/fusepoint">Fusepoint 开发记录</a>
  <a href="https://flesymeb.github.io/HarnessOfHarness/">项目主页</a>
</div>

<section class="deck-wrap" aria-label="Harness-of-Harness 交互图解">
  <div class="deck-head"><strong>22 页交互图解 · 从角色权限到 Loop 70 真实 QA</strong><a href="/lib/decks/harness-of-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harness-of-harness-visual-guide.html" title="Harness-of-Harness 论文图解，共 22 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">这篇论文让 Codex、OpenCode、Pi 这类编码助手反复处理同一个项目：先由 Planner（规划者）安排本轮任务，再由 Developer（开发者）修改项目，最后由 QA Tester（独立测试者）检查。作者把这层长期开发程序称为 Harness-of-Harness（HoH）。每轮保留当前代码与资源，以及属于这个版本的测试记录；测试者不替开发者修源码，开发过程结束也不等于项目通过验收。</p>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先区分 harness、artifact、evidence 和两层 judge

Harness 是包在语言模型外面的运行系统。Codex CLI、OpenCode、Pi 会决定模型看到什么、能调用哪些工具、命令如何执行、结果怎样进入下一步。HoH 再包一层，不修改这些 harness 的内部实现。

Artifact state <code>A_t</code> 是第 <code>t</code> 轮结束时实际保存的代码、配置、资源和项目元数据。Evidence state <code>E_t</code> 是验证记录：哪些行为已经有截图、操作回放（replay）、运行时状态记录（runtime trace）、日志或公开测试支持，哪些仍缺证据（gap）。只保存代码会丢掉“什么已经验证、哪些失败还没解决”。

PRD（Product Requirements Document）是公开的产品需求文档。Planner 把它拆成本轮开发文档 <code>D_t</code>：要做什么、怎样验收、哪些已通过功能不能改坏。QA 是质量检查，不是最终论文评分；这两层必须分开。

文中有两层 judge。内部 QA Tester 决定本轮证据怎样进入下一轮 Planner；外部 benchmark verifier，即正式评测程序，在开发结束后按 GameCraft-Bench、FrontierSWE 或 ProgramBench 的协议评分。**外部隐藏测试、分数和 rubric 不进入 HoH 循环。**
</aside>

<div class="interest"><b>作者兴趣度 9.5 / 10</b><span>和 Claude Code、Codex 这类完整 harness 的多日自治开发直接相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>49.58 → 71.52</strong><span>GameCraft-Bench · Codex</span></div>
  <div class="metric"><strong>0.31 → 0.54</strong><span>FrontierSWE mean reward · Codex</span></div>
  <div class="metric"><strong>60.41 → 66.50</strong><span>ProgramBench Avg. Test Pass Rate</span></div>
  <div class="metric"><strong>65 / 81</strong><span>Fusepoint：第 70 轮已关闭问题</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>HoH 固定模型和底层 harness，改变的是外层开发协议。</strong>同一个 harness/model 分别以 Planner、Developer、QA Tester 身份被调用。</li>
    <li><strong>生产项目只由 Developer 修改。</strong>QA 在隔离副本上检查本轮版本，其证据会进入下一轮；最终基准的隐藏分数不会回流。Planner 如何接触项目，在论文设计与公开实现中有差别，下面单独说明。</li>
    <li><strong>三轮带来稳定的总体提升，但单题会退步。</strong>例如 Pi 的 Spire Descent 从 26.61 降到 10.96，Pipe Crisis 从 53.26 降到 37.65。</li>
    <li><strong>主实验每个任务与配置只跑一次有效实验。</strong>没有可复现的生成随机种子，也没有同题多次采样；均值和重采样置信区间不能替代生成方差。</li>
  </ul>
</aside>


<h2 id="多日开发为什么需要单独维护验证记录？">1. Motivation：多日开发为什么需要单独维护验证记录？</h2>

**当开发持续几天，项目状态、验证结论和下一步决策会逐渐脱节。** 普通 coding harness 往往在一次有时间或步数上限的会话里修一个问题或写一个局部功能。从零开始开发项目（greenfield development）持续几天时，会同时积累代码、资源、设计选择、已知缺陷和曾经通过的行为；后续局部修复还可能破坏早期功能。

论文把风险归为三类。第一，早期需求和设计决定会被遗忘。第二，高层 PRD 通常无法唯一确定“下一步最值得做什么”，Agent 容易在局部修补中循环。第三，完整软件的正确性分散在编译、交互、状态迁移、视觉、音频和运行稳定性里，单个通用测试很难覆盖。

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-2-development-modes.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-2-development-modes.webp" alt="人类在环开发与自主软件开发的区别" width="1983" height="920"></a>
  <figcaption>原论文 Figure 2。左侧由人持续发现问题并重新调用 coding agent；右侧由 HoH 自动观察、规划、开发和测试。论文按 CC BY 4.0 发布。</figcaption>
</figure>

HoH 据此用“需求文档 + 当前项目 + 已验证记录”共同决定下一步。每轮只选择一个功能增量：范围有限，但局部完整、可测试。这样既避免一次改动扩散到整个项目，也避免只修一个文件却留下一条无法运行的半成品路径。

<h2 id="与多-Agent、长上下文和执行程序自优化的区别">2. Related Work：与多 Agent、长上下文和执行程序自优化的区别</h2>

**HoH 优化正在开发的项目，模型和底层 harness 保持不变。** 它和角色式多 Agent 的表面结构相似，差别落在权限、跨轮状态和验收证据上。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>变化对象</th><th>状态怎样跨轮</th><th>与 HoH 的区别</th></tr></thead>
  <tbody>
    <tr><td>长上下文／外部记忆</td><td>模型可见历史</td><td>对话、摘要或外部记忆</td><td>能记住过去，不等于把每个事实绑定到一个已测试候选</td></tr>
    <tr><td>MetaGPT / ChatDev</td><td>固定的角色和消息流程</td><td>角色间文档与对话</td><td>HoH 额外固定读写权限、冻结待测版本和验证记录格式</td></tr>
    <tr><td>AgileCoder / EvoDev / EvoMAC</td><td>开发迭代、功能依赖或测试反馈</td><td>迭代计划和实现状态</td><td>HoH 把当前项目和 QA 验证记录分别保存</td></tr>
    <tr><td>AutoHarness / Meta-Harness / Self-Harness</td><td>提示词、工具、执行程序或调用流程</td><td>跨任务优化结果</td><td>它们改变模型外的执行机制；HoH 固定执行机制，持续改变项目</td></tr>
    <tr><td><a href="/posts/论文解读/longhorizon-harness.html">LongHorizon-Harness</a></td><td>单任务进度与有明确范围的验收要求</td><td>进度记录 + 只读核验报告</td><td>更通用地包裹 GUI/CLI 任务；HoH 针对软件开发保留版本化项目与独立质量检查</td></tr>
    <tr><td><strong>Harness-of-Harness</strong></td><td>当前项目和开发验证记录</td><td><code>(A_(t-1), E_(t-1)) → (A_t, E_t)</code></td><td>Planner、Developer、QA 每轮各调用一次同一 harness/model</td></tr>
  </tbody>
</table>
</div>

论文还引用 Proof-or-Stop、Self-Refine 和 Reflexion。它们都强调反馈或证据；HoH 进一步把“谁能写项目、谁能验收、证据属于哪个候选版本”落实成外层运行程序检查的规则。**方法落在候选冻结、权限隔离和证据归属上。**

<h2 id="一轮-HoH：规划、开发、冻结版本、独立测试">3. Method：一轮 HoH：规划、开发、冻结版本、独立测试</h2>

**每轮产生一份待测版本，只有 Developer 能写入，QA 的记录留给下一轮规划。**

<h3 id="3-1-三个角色看到什么、能改什么？">3.1 三个角色看到什么、能改什么？</h3>

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-3-hoh-framework.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-3-hoh-framework.webp" alt="Harness-of-Harness 官方方法总览" width="8305" height="4388"></a>
  <figcaption>原论文 Figure 3。模型、底层 harness、角色定义和运行权限在一次实验内固定；开发文档、项目与验证记录随轮次变化。</figcaption>
</figure>

<div class="roles">
  <div class="role"><b>PROJECT PLANNER</b><span>读取公开需求和上一轮验证记录，输出开发文档 <code>D_t</code>。正文设计允许只读查看项目；公开实现的提示词禁止检查生产代码，并使用单独的规划目录。</span></div>
  <div class="role"><b>DEVELOPER</b><span>从上一轮项目 <code>A_(t-1)</code> 继续开发（warm-start），读取需求与 <code>D_t</code>；只有它能写项目，先测旧版本，再修改和自测。</span></div>
  <div class="role"><b>QA TESTER</b><span>在隔离副本上运行冻结的 <code>A_t</code>，不能修代码；把已验证项和缺证据项分别写入 <code>E_t</code>。</span></div>
</div>

论文的 Algorithm 1 可以压缩成六步：

<ol class="flow">
  <li><b>1 · PLAN</b><span>用需求和旧验证记录选择一项可测的改动。</span></li>
  <li><b>2 · PRESERVE</b><span>列出不能回归的已验证行为。</span></li>
  <li><b>3 · 开发前检查</b><span>Developer 先测旧版本，确认哪些行为应保留。</span></li>
  <li><b>4 · 修改并自测</b><span>在现有项目上实现，再检查重要修改是否生效。</span></li>
  <li><b>5 · FREEZE</b><span>复制待测版本到隔离区，记录唯一版本标识。</span></li>
  <li><b>6 · ASSESS</b><span>QA 用黑盒和白盒证据生成下一轮 <code>E_t</code>。</span></li>
</ol>

<div class="formula">D_t = Plan_H(S, E_(t-1)) &nbsp;·&nbsp; A_t = Dev_H(A_(t-1); S, D_t) &nbsp;·&nbsp; E_t = Test_H(A_t; S, D_t)</div>

<h3 id="3-2-外层代码也检查角色权限和调用顺序">3.2 外层代码也检查角色权限和调用顺序</h3>

公开的 <code>hoh-lite</code>（revision <code>ae7cc6f</code>，Python 3.12+，Apache-2.0）先用不可变 <code>RoleBinding</code> 检查角色配置。下面是官方源码摘录；Planner 或 Tester 如果被配置为读写工作区，初始化就会报错。**这段代码校验的是配置，实际阻止读写还要看后续如何启动进程和挂载文件。**

<div class="code-scroll"><pre><code class="language-python">class WorkspaceAccess(str, Enum):
    READ_ONLY = "read-only"
    READ_WRITE = "read-write"
@dataclass(frozen=True)
class RoleBinding:
    role: RoleName
    workspace_access: WorkspaceAccess
    godot_mcp: GodotMCPAccess
    def __post_init__(self) -> None:
        if self.role is not RoleName.DEVELOPER:
            if self.workspace_access is WorkspaceAccess.READ_WRITE:
                raise ValueError(
                    f"{self.role.value} cannot receive a read-write candidate workspace"
                )
            if self.godot_mcp is GodotMCPAccess.READ_WRITE:
                raise ValueError(
                    f"{self.role.value} cannot receive read-write Godot MCP"
                )</code></pre></div>

Runtime 还检查调用顺序。正常调用顺序必须从 Planner 开始，Planner 后只能到 Developer；Developer 后才能到 Tester。每次调用的角色、状态、开始时间、耗时和摘要会写入 <code>runtime_receipt.json</code>。这让外层程序可以复核实际调用顺序，而不只是相信 Agent 的自述。

实际启动部分有三处值得区分。Planner 在单独的 <code>planner/workspace</code> 目录运行；Codex 适配器默认传入 <code>--sandbox read-only</code>，OpenCode 的 Planner 配置则禁用所有工具。正文 §3 允许 Planner 只读查看项目，但附录提示词和公开模板都写着“不检查生产代码”。因此，不能把公开 Planner 描述成实际浏览源码后作计划。

GameCraft 的 QA 在复制出的工作区运行。外层用 bubblewrap（Linux 文件挂载隔离工具）隐藏原任务、原提交目录和私有评测路径，并核对原提交源码的 SHA-256。Codex QA 在这个副本内反而使用 <code>danger-full-access</code>，方便写报告和更新 Godot 导入文件；不修产品代码是角色规则，保护原提交靠外层隔离与哈希核对。公开实现还有允许无隔离运行的显式开关，不能把默认路径的保护说成所有运行方式都具备。

公开 Planner 也不是从头自由重写整份计划：外层先生成文档框架，Planner 只补充最多三个优先事项及保留、验收要求。输出不合格式时会要求修正，仍失败则保留原框架并记录 fallback（规划调用失败后的备用结果）。这些实现细节来自固定代码版本，不能据此补写论文内部运行系统未公开的行为。

<h3 id="3-3-测试结论需要原始输出和文件路径">3.3 测试结论需要原始输出和文件路径</h3>

论文把每个待检查项写成 <code>(claim, execution records, status)</code>：要验证的行为、实际执行证据、当前判定。例如“左右键会移动角色”需要引用操作回放和运行时位置变化；如果任务结束截图没有结果页，“出现结果页”就仍是缺项。下一轮 Planner 把前者列为不能破坏的功能，把后者列为需要补做并重新测试的目标。

<div class="code-scroll"><pre><code class="language-json">{
  "verified_records": [{
    "claim_id": "player_control",
    "execution_records": [
      {"type": "replay", "observation": "Left and right inputs move the avatar."},
      {"type": "runtime_trace", "observation": "Position changes after each input event."}
    ],
    "status": "verified"
  }],
  "gap_records": [{
    "claim_id": "result_state",
    "execution_records": [
      {"type": "screenshot", "observation": "The objective ends without a result screen."}
    ],
    "status": "gap"
  }]
}</code></pre></div>

这段是论文 Listing 1 的缩减摘录。QA 可以引用截图、视频、操作回放、运行状态、日志和公开测试；**代码里存在某个分支，不代表测试时已经执行过它。**

<h2 id="评分、对照实验与真实开发失败">4. Experiments：评分、对照实验与真实开发失败</h2>

**HoH 的 QA 只看公开任务、当前项目和公开执行记录。**

<h3 id="4-1-内部检查与最终任务评分是两套系统">4.1 内部检查与最终任务评分是两套系统</h3>

Benchmark 在整次开发结束后才运行隐藏测试或按私有评分标准评判；结果不会进入 Planner、Developer 或 QA。

<div class="judge-grid">
  <div><b>GameCraft-Bench · 45 tasks</b><span>在先前固定子集上，用 seed 20260707 分层补齐至 15 类各 3 题，选题不参考模型分数。编译或运行失败时 <code>B=0</code>，Overall 为 0；可运行时按四个维度加权。</span></div>
  <div><b>FrontierSWE · 15 tasks</b><span>4 个实现、9 个性能、2 个研究任务。官方 17 题中排除了 <code>frogsgame-rl</code>（需要当时不可用的 Tinker API 登录）和 <code>modular-stack-wan21</code>（要求 NVIDIA driver ≥580，实验 H200 worker 为 570.133.20）。每题由官方验收程序给分。</span></div>
  <div><b>ProgramBench</b><span>Agent 只拿可执行文件和文档重建程序。每题对隐藏行为测试计算通过比例，再对任务做宏平均。</span></div>
</div>

<div class="formula">GameCraft Overall = 100 · B · (0.15M + 0.35D + 0.15V + 0.35A)</div>

其中 <code>M/D/V/A</code> 分别是核心玩法、内容深度、功能视觉、艺术与呈现四类评分项的均分。例如游戏可运行（<code>B=1</code>）且四项均为 0.8，总分就是 80；只要编译或启动失败（<code>B=0</code>），其他项再高也变成 0。这是公式说明例，不是作者案例的逐项分数。FrontierSWE 总分是 15 道题得分的算术平均；Dominance（相对优势分）先在同题上与其余 11 个配置逐一比较，胜/平/负记 1/0.5/0，再在领域内平均，再对三个领域平均。ProgramBench 的 <code>Pass Rate†</code> 是先算每题隐藏测试通过比例、再对题目取平均，**不是整题全部通过的比例。**

主实验使用 Codex CLI 0.142.5、OpenCode 1.14.30、Pi Coding Agent 0.80.10；对应模型如下表。每个任务在每种配置下只有一次有效实验。基础设施或模型服务通信故障会重跑，不算额外重复实验。不同客户端没有共同的可复现生成随机种子，论文也没有统一规定 temperature 或 top-p。

<h3 id="4-2-主结果：三种-harness-都有提升">4.2 主结果：三种 harness 都有提升</h3>

<div class="table-scroll">
<table>
  <thead><tr><th>Harness + model</th><th>GameCraft Overall</th><th>FrontierSWE mean reward</th><th>ProgramBench Avg. Test Pass Rate</th></tr></thead>
  <tbody>
    <tr><td>Codex + GPT-5.5 high</td><td>49.58 → <strong>71.52</strong></td><td>0.31 → <strong>0.54</strong></td><td>60.41 → <strong>66.50</strong></td></tr>
    <tr><td>OpenCode + DeepSeek-V4-Pro</td><td>26.90 → <strong>48.98</strong></td><td>0.23 → <strong>0.31</strong></td><td>45.27 → <strong>57.56</strong></td></tr>
    <tr><td>Pi + MiniMax-M3</td><td>42.16 → <strong>58.78</strong></td><td>0.26 → <strong>0.55</strong></td><td>35.83 → <strong>52.68</strong></td></tr>
  </tbody>
</table>
</div>

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-4-gamecraft-components.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-4-gamecraft-components.webp" alt="GameCraft-Bench 四个评分维度的 Vanilla 和 HoH 对比" width="1549" height="400"></a>
  <figcaption>原论文 Figure 4。三种 harness/model 在四个 GameCraft 评分维度上都提高；误差条是对 45 道题做 20,000 次 bootstrap（有放回重采样）的 95% 分位数置信区间。</figcaption>
</figure>

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-6-gamecraft-examples.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-6-gamecraft-examples.webp" alt="Momentum Lab、Kitchen Rush 和 Ant Empire 的 Vanilla 与 HoH 产物对比" width="1479" height="725"></a>
  <figcaption>原论文 Figure 6。Momentum Lab、Kitchen Rush、Ant Empire 的 Overall 分别从 34.05→70.61、42.62→73.38、65.52→87.88。这是定性项目对比，不能用来还原逐步失败轨迹。</figcaption>
</figure>

<h3 id="4-3-对照：普通继续开发能否获得同样收益？">4.3 对照：普通继续开发能否获得同样收益？</h3>

Vanilla Continuation 先做一次普通开发，再从最新项目继续做两次开发，固定提示是 <code>Continue developing and testing the current game.</code>；它没有新开发文档和独立 QA 记录。正文称其延续同一会话，附录 B.5 只规定同一 harness/model 的额外调用。公开包没有足够的实验记录确认三次调用是否共享完整对话，因此比较中能确定的是同样的开发次数、同样的模型和沿已有项目继续。一次 pass 指一次开发阶段：

<div class="table-scroll">
<table>
  <thead><tr><th>方法</th><th>1 pass</th><th>2 passes</th><th>3 passes</th><th>三轮 token / task</th></tr></thead>
  <tbody>
    <tr><td>Vanilla / Continuation</td><td>49.58</td><td>54.99</td><td>58.24</td><td>6.33M</td></tr>
    <tr><td>HoH</td><td>59.71</td><td>64.84</td><td><strong>71.52</strong></td><td>8.41M</td></tr>
  </tbody>
</table>
</div>

HoH@2 用 5.67M tokens 得到 64.84，已经超过三轮 Vanilla Continuation 的 58.24 和 6.33M。按论文公式，相对 Vanilla 每增加 1M tokens，三轮 Continuation 增加 2.32 分，HoH 增加 3.77 分。

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-9-budget-tradeoff.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-9-budget-tradeoff.webp" alt="HoH 和 Vanilla Continuation 的分数与 token 轨迹" width="1508" height="465"></a><figcaption>原论文 Figure 9。相同 pass 下的质量与累计 token。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-10-ablation.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-10-ablation.webp" alt="HoH 跨轮状态消融" width="1508" height="388"></a><figcaption>原论文 Figure 10。去掉 plan update、evidence feedback 或 warm-start 都会降分。</figcaption></figure>
</div>

消融的 Full HoH@3 是 71.52。固定第一轮开发文档、不再更新计划（w/o Plan Update）后为 63.39；下一轮规划看不到 QA 记录（w/o Evidence Feedback）后为 65.23；每轮从初始工作区重建、不沿旧项目继续（w/o Warm-Start）后为 63.67。最后一项还把 token 从 8.41M 推到 11.12M。

**三项消融降低的是总体均分，不是每道题都下降。** 正文称所有消融在每题上都弱于完整 HoH，但 Table 22 的 Lighthouse 是反例：完整方法 80.90，去掉 Warm-Start 反而是 81.50。不能用平均收益推出单题必然收益。

<h3 id="4-4-FrontierSWE-能继续迭代，但仍有长期零分任务">4.4 FrontierSWE 能继续迭代，但仍有长期零分任务</h3>

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-5-frontierswe-dominance.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-5-frontierswe-dominance.webp" alt="FrontierSWE 十轮 Dominance" width="691" height="491"></a><figcaption>原论文 Figure 5。Codex 的 Dominance 从 Vanilla 27.33% 增到 HoH@10 的 72.67%，HoH@9 达到 76.00%。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-8-frontierswe-categories.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-8-frontierswe-categories.webp" alt="FrontierSWE 三个类别的均值" width="1540" height="451"></a><figcaption>原论文 Figure 8。Implementation、Performance、Research 的 task 数分别是 4、9、2。</figcaption></figure>
</div>

Figure 5 与主表的 Dominance 不能直接拼成一条曲线。Table 1 在三种系统各四个阶段组成的 <strong>12 配置池</strong>里比较，每题对手有 11 个；Figure 5 只比较 Codex 的 Vanilla 与 HoH@1–10，共 <strong>11 个阶段</strong>，每题对手有 10 个。所以同一个 Vanilla 在主表是 22%，到 Figure 5 变成 27.33%；这是比较池变化，不是重跑得到的准确率。十轮曲线的阴影表示 ±1 个标准误，也不是 Figure 4 的 95% bootstrap 区间。

聚合分数会遮住停滞项。Codex 在 Cranelift、Dependent Type Checker、FFmpeg 和 Inference System 四个性能任务上从 Vanilla 到 HoH@3 都是 0。Pi 的 Revideo 也一直是 0。持续迭代能提高部分任务，不保证跨过每个 verifier 的硬门槛。

<h3 id="4-5-真实-Loop-70：开发者说完成，独立检查为何不通过">4.5 真实 Loop 70：开发者说完成，独立检查为何不通过</h3>

<div class="case">
<h4>Fusepoint · 第 70 轮战斗可读性修复 · <code>loop-70-c3d32741612b</code></h4>
<ol>
  <li><strong>来源：</strong>作者公开 Fusepoint 仓库 revision <code>55b442fc</code> 的真实规划、开发与测试记录。Planner 从问题清单里选了四个待修项，同时要求保留正常启动、三组敌人数量、鼠标视角控制、武器组件和结局逻辑。</li>
  <li><strong>要求：</strong>步枪敌人不能误用手枪动画；Alpha/Bravo/Charlie 三组应分别准备出 3/5/10 个敌人，再进入实际战斗；剧情提示应等待玩家确认，而不是自行消失；战斗反馈也要完整清理。</li>
  <li><strong>开发阶段：</strong>公开 Planner 记录分配了动画绑定、敌人战斗流程、剧情提示与反馈清理三项任务。Developer 记录提供修改前后的源码哈希，证明产出了新候选；它只引用一份未在公开树中找到的详细开发回执，不能独立证明“修改了六个文件”或开发者如何自报 PASS。</li>
  <li><strong>测试操作：</strong>QA 先检查正常启动，再进入游戏，调用各组遭遇战的准备与推进路径，采集敌人运行状态、截图、日志和画面。测试的是冻结副本，不能现场改代码。</li>
  <li><strong>实际观察：</strong>3/5/10 个步枪敌人能生成，代码也不再把步枪状态映射到 <code>Pistol_*</code> 动画。但推进后只看到待机和走路，没有发现目标、允许开火、射击、换弹、受击或死亡的证据。点击 Replay 回到部署前页面后，已测试的输入也不能通过 DeployButton 重新开局。</li>
  <li><strong>判定：</strong>正常启动通过，步枪动画绑定这个局部问题也有修复证据；但敌人战斗 AI、完整动作、战斗反馈、音效／视觉特效、运行稳定性未通过。测试者给出 <code>status = fail</code>，外层最终 <code>phase_status = blocked</code>。规则要求所有必需检查通过、阻断项为空且无 major/blocker 级发现；局部启动 PASS 无法满足这条规则。</li>
</ol>
<div class="verdict"><div class="pass"><strong>真正验证过</strong>正常启动；步枪不再误用手枪动画；三组敌人可以准备出来；短时测试未崩溃。</div><div class="fail"><strong>仍缺证据或未满足</strong>完整战斗流程；剧情提示和 HUD（屏幕状态界面）要求；重开后部署；三次 1920×1080 全流程回放。使用 llvmpipe 软件渲染的一次采样只有 8 FPS，也不足以证明性能稳定。</div></div>
</div>

**“代码修过了”和“当前版本实际通过验收”必须分开。** 这轮敌人存在、动画名正确，都不能推出它们能瞄准、开火、换弹并完成战斗。QA 把这些尚未观察到的动作保留为待解决项，而不是用局部代码检查关掉整条问题。

这里的结论来自公开记录，不是我重新运行了游戏。测试前后的源码 SHA-256 相同，报告里的截图、操作与判定引用同一候选；公开 Developer 记录没有详细实现日志。另一个重要边界是，单案例使用 <strong>GPT-5.6-Sol high、Godot 4.7、专用素材／界面／测试 skills 和 GitHub issue 管理</strong>；主 benchmark 用 GPT-5.5 high 等三种配置、Godot 4.6.2，不能把两套配置的结果混作一次实验。

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-1-fusepoint-trajectory.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-1-fusepoint-trajectory.webp" alt="Fusepoint 前 70 轮开发和 issue 轨迹" width="1595" height="948"></a>
  <figcaption>原论文 Figure 1。论文截点是 Loop 70：81 个 issue 中关闭 65 个、未解决 16 个，17 个曾关闭的 issue 后来因回归而重开。当前公开仓库快照已继续到 Loop 96，并显示 101 个 issue、94 closed、7 open；后者不是论文实验截点。</figcaption>
</figure>

<h3 id="4-6-补充结果：按类别统计与作者挑选的产物">4.6 补充结果：按类别统计与作者挑选的产物</h3>

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-7-gamecraft-groups.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-7-gamecraft-groups.webp" alt="GameCraft 五个 reporting group 的 Overall" width="1508" height="471"></a>
  <figcaption>原论文 Figure 7。五个 reporting group 各含 9 道题；这是作者为了分析新增的粗粒度分组，不是 GameCraft-Bench 原始分类。</figcaption>
</figure>

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-11-token-distribution.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-11-token-distribution.webp" alt="三种 harness 每次调用的 token 分布" width="1495" height="404"></a>
  <figcaption>原论文 Figure 11。不同模型服务商的缓存计费不同，只适合在同一 harness/model 内比较。</figcaption>
</figure>

<details class="result-gallery"><summary>查看原论文 Figures 12–16：15 类游戏的产物对比</summary>
<p>每类选取 HoH@3 分数最高的一题，共 15 题、60 个产物。图片能展示效果变化，不能代表随机抽样的成功率；精确分项分数见 Table 25。</p>
<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-12-action.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-12-action.webp" alt="Action 三类游戏的 Vanilla 到 HoH3 对比" width="1521" height="686"></a><figcaption>原论文 Figure 12：Platformer、Shooter、Roguelike。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-13-timing.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-13-timing.webp" alt="Timing 三类游戏的 Vanilla 到 HoH3 对比" width="1521" height="686"></a><figcaption>原论文 Figure 13：Racing、Rhythm、Sports。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-14-strategy.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-14-strategy.webp" alt="Strategy 三类游戏的 Vanilla 到 HoH3 对比" width="1521" height="686"></a><figcaption>原论文 Figure 14：Strategy、Card Game、Puzzle。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/harness-of-harness/figure-15-simulation.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-15-simulation.webp" alt="Simulation 三类游戏的 Vanilla 到 HoH3 对比" width="1521" height="686"></a><figcaption>原论文 Figure 15：Tycoon、Idle、Simulation。</figcaption></figure>
</div>

<figure class="figure">
  <a href="/lib/papers/harness-of-harness/figure-16-adventure.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/harness-of-harness/figure-16-adventure.webp" alt="Adventure 三类游戏的 Vanilla 到 HoH3 对比" width="1521" height="686"></a>
  <figcaption>原论文 Figure 16：Horror、Open World、Visual Novel。Figures 12–16 每类游戏选择 HoH@3 分数最高的一题，不能把它们当成随机案例。</figcaption>
</figure>
</details>

<h2 id="值得复用的规则与后续对照">5. Discussion：值得复用的规则与后续对照</h2>

**对后续研究更有用的是四条可测试的系统约束。**

第一，生产项目只由 Developer 修改。Planner 根据公开需求和已验证记录安排任务，QA 运行副本；公开实现对副本的权限与原项目的保护是两回事，都应检查。

第二，证据属于具体版本。截图、日志和回放必须对应同一份冻结代码；否则旧截图和新代码拼起来，可能给出一个任何真实版本都没有通过的结论。

第三，公开反馈与最终隐藏评测分开。开发过程可以使用公开测试和运行观察，不能使用最后评测的隐藏答案、分数和解释。

第四，下一轮不仅写“要修什么”，还写“哪些功能不能改坏”。Fusepoint 有 17 个曾关闭问题后来重新出现，说明长期开发的难点会逐渐从补功能变成防止回退。

后续需要的对照也很具体：

1. 固定总 token、运行时间和模型调用次数，比较普通继续开发、HoH 与 LongHorizon-Harness。
2. 测 QA 的误放行、误拒绝及跨模型一致性，分别去掉运行观察和代码检查，看哪类证据有效。
3. 统一版本标识、测试操作、观察与判定的记录格式，让不同 coding harness 复用。
4. 比较始终沿最新版本开发、回滚旧版本和保留多个候选的策略。本文尚未系统比较这些选择。
5. 在总体均分上涨时，单独跟踪持续变差的任务，检验停止或回滚规则。

<h2 id="已证明的收益与仍未解决的限制">6. Conclusion：已证明的收益与仍未解决的限制</h2>

**论文有一套完整、可执行、公开到角色权限和真实调用记录的 harness 设计；实验支持整套 HoH 有效，但还不足以精确分解收益或证明多日项目已经达到独立产品验收标准。**

<div class="limit-grid">
  <div><b>能证明</b><span>固定 harness/model 下，三轮 HoH 在三套任务基准的总体指标上都超过 Vanilla；同开发次数比较、token 效率和三项消融支持规划更新、验证反馈和沿已有项目开发均有作用。</span></div>
  <div><b>单题不保证改善</b><span>Pi 的 Spire Descent、Pipe Crisis、Space Colony、Autobattler、Border Check 在 HoH@3 低于 Vanilla；整体逐轮提高不等于每道题都提高。</span></div>
  <div><b>生成方差未知</b><span>每个任务与配置只跑一次有效实验，没有共同生成 seed，也没有重复采样。GameCraft 各维度的置信区间只重采题目，不能估计同题多次生成的波动。</span></div>
  <div><b>ProgramBench 披露不足</b><span>论文给出 Avg. Test Pass Rate，却没有在附录列出完整任务数、清单、运行环境、逐题结果或运行配置；无法像另外两套 benchmark 那样复核分母和失败分布。</span></div>
  <div><b>Fusepoint 是单案例</b><span>70 轮开发记录展示了持久开发与回归，但论文没有对照同预算对照，也没有给出完整独立人工产品验收。附录定义 PXI 评分，却没有出现它所说的正文 PXI 结果表。</span></div>
  <div><b>公开包不是完整复现包</b><span>附录明确说原始运行文件、分析记录、环境文件和隐藏评分程序不在匿名代码包中。公开 <code>hoh-lite</code> 足以检查运行编排协议，不足以复算全部表格。</span></div>
</div>

我的结论是：**HoH 把“继续让 Agent 写”改造成“每轮产生一个版本化候选，再用独立证据决定下一步”。** 对 Claude Code、Codex 这类完整 harness，这比再加一段更长 prompt 更接近真实项目里的版本管理和验收流程。后续最值得补的实验是：测 QA 的误判率，在固定预算下分配三类调用，以及验证何时该停止开发或回滚到旧版本。

</div>

---
title: "[2026-09-01] Harness-of-Harness: Multi-Day Autonomous Software Development with Continual Improvement"
permalink: "/posts/论文解读/harness-of-harness.html"
date: "2026-09-29T07:30:00+08:00"
updated: "2026-09-29T07:30:00+08:00"
cover: "/generated-covers/051-harness-of-harness.webp"
description: "拆解 Harness-of-Harness 如何用固定的 Planner、Developer、QA Tester 和跨轮 evidence state，让 Codex 等现成 coding harness 连续开发多日；同时追到真实 Loop 70 失败记录、三套 benchmark 的最终 judge、成本、消融与实验缺口。"
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

<p class="lead">Harness-of-Harness（HoH）在 Codex、OpenCode、Pi 这类现成 coding harness 外再加一层长期开发协议。它让 Planner → Developer → QA Tester 反复处理同一个项目，并跨轮保留两份状态：可继续修改的软件 artifact，以及经过 QA 绑定到具体候选版本的 evidence。</p>

<div class="interest"><b>作者兴趣度 9.5 / 10</b><span>和 Claude Code、Codex 这类完整 harness 的多日自治开发直接相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>49.58 → 71.52</strong><span>GameCraft-Bench · Codex</span></div>
  <div class="metric"><strong>0.31 → 0.54</strong><span>FrontierSWE mean reward · Codex</span></div>
  <div class="metric"><strong>60.41 → 66.50</strong><span>ProgramBench Avg. Test Pass Rate</span></div>
  <div class="metric"><strong>65 / 81</strong><span>Fusepoint：Loop 70 时已关闭 issue</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>HoH 固定模型和底层 harness，改变的是外层开发协议。</strong>同一个 harness/model 分别以 Planner、Developer、QA Tester 身份被调用。</li>
    <li><strong>Developer 是唯一写入者。</strong>Planner 只读项目，QA 在隔离副本上检查冻结候选；QA 的证据会进入下一轮，最终 benchmark judge 的隐藏结果不会回流。</li>
    <li><strong>三轮带来稳定的总体提升，但单题会退步。</strong>例如 Pi 的 Spire Descent 从 26.61 降到 10.96，Pipe Crisis 从 53.26 降到 37.65。</li>
    <li><strong>主实验每个 task-condition 只有一次有效 run。</strong>没有可复现的生成 seed，也没有同题多次采样；均值和 bootstrap interval 不能替代生成方差。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 先区分 harness、artifact、evidence 和两层 judge

Harness 是包在语言模型外面的运行系统。Codex CLI、OpenCode、Pi 会决定模型看到什么、能调用哪些工具、命令如何执行、结果怎样进入下一步。HoH 再包一层，不修改这些 harness 的内部实现。

Artifact state <code>A_t</code> 是第 <code>t</code> 轮结束时真实存在的代码、配置、资源和项目元数据。Evidence state <code>E_t</code> 则记录哪些行为已经被当前候选的截图、replay、runtime trace、日志或公开测试支持，哪些仍是 gap。只保存代码会丢掉“为什么这样改、什么已经验证、哪些失败还没解决”。

文中有两层 judge。内部 QA Tester 决定本轮证据怎样进入下一轮 Planner；外部 benchmark verifier 在开发结束后按 GameCraft-Bench、FrontierSWE 或 ProgramBench 的正式协议评分。**外部隐藏测试、分数和 rubric 不进入 HoH 循环。**
</aside>

## Q1. 为什么现有 coding harness 很难连续开发几天？

**当开发持续几天，项目状态、验证结论和下一步决策会逐渐脱节。** 普通 coding harness 往往在一个 bounded episode 里完成 issue 或局部功能。多日 greenfield development 会同时积累代码、资源、设计选择、已知缺陷和曾经通过的行为；后续局部修复还可能破坏早期功能。

论文把风险归为三类。第一，早期 requirement 和设计决定会被遗忘。第二，高层 PRD 通常无法唯一确定“下一步最值得做什么”，Agent 容易在局部修补中循环。第三，完整软件的正确性分散在编译、交互、状态迁移、视觉、音频和运行稳定性里，单个通用 test 很难覆盖。

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-2-development-modes.webp" alt="人类在环开发与自主软件开发的区别">
  <figcaption>原论文 Figure 2。左侧由人持续发现问题并重新调用 coding agent；右侧由 HoH 自动观察、规划、开发和测试。论文按 CC BY 4.0 发布。</figcaption>
</figure>

HoH 据此用“PRD + 当前 artifact + 已验证 evidence”共同决定下一步。每轮只选择一个 bounded but locally complete increment，也就是范围有限、但在用户可观察行为上自洽的增量。这样既避免一次改动扩散到整个项目，也避免只修一个文件却留下一条无法运行的半成品路径。

## Q2. HoH 和多 Agent、长上下文、harness 自优化有什么区别？

**HoH 优化正在开发的项目，模型和底层 harness 保持不变。** 它和角色式多 Agent 的表面结构相似，差别落在权限、跨轮状态和验收证据上。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>变化对象</th><th>状态怎样跨轮</th><th>与 HoH 的区别</th></tr></thead>
  <tbody>
    <tr><td>长 context / memory</td><td>模型可见历史</td><td>对话、摘要或外部 memory</td><td>能记住过去，不等于把每个事实绑定到一个已测试候选</td></tr>
    <tr><td>MetaGPT / ChatDev</td><td>固定的角色和消息流程</td><td>角色间文档与对话</td><td>HoH 额外固定读写权限、冻结候选和 evidence schema</td></tr>
    <tr><td>AgileCoder / EvoDev / EvoMAC</td><td>sprint、feature dependency 或测试反馈</td><td>迭代计划和实现状态</td><td>HoH 把 artifact 与 QA evidence 明确拆成两条持久通道</td></tr>
    <tr><td>AutoHarness / Meta-Harness / Self-Harness</td><td>prompt、tool、harness code 或 orchestration</td><td>跨任务优化结果</td><td>它们改变 operational layer；HoH 固定 operational layer，持续改变项目</td></tr>
    <tr><td><a href="/posts/论文解读/longhorizon-harness.html">LongHorizon-Harness</a></td><td>单任务的 task state 与 bounded contract</td><td>Manager state + read-only audit</td><td>更通用地包裹 GUI/CLI 任务；HoH 针对软件开发保留版本化 artifact 与角色化 QA</td></tr>
    <tr><td><strong>Harness-of-Harness</strong></td><td>当前软件 artifact 和 development evidence</td><td><code>(A_(t-1), E_(t-1)) → (A_t, E_t)</code></td><td>Planner、Developer、QA 每轮各调用一次同一 harness/model</td></tr>
  </tbody>
</table>
</div>

论文还引用 Proof-or-Stop、Self-Refine 和 Reflexion。它们都强调反馈或证据；HoH 进一步把“谁能写项目、谁能验收、证据属于哪个候选版本”落实成 Runtime contract。**方法落在候选冻结、权限隔离和证据归属上。**

## Q3. 一轮 HoH 到底怎样运行？

### 3.1 三个角色看到什么、能改什么？

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-3-hoh-framework.webp" alt="Harness-of-Harness 官方方法总览">
  <figcaption>原论文 Figure 3。模型、底层 harness、角色定义和 Runtime policy 在一次 run 内固定；development document、artifact 和 evidence 随轮次变化。</figcaption>
</figure>

<div class="roles">
  <div class="role"><b>PROJECT PLANNER</b><span>读取公开 PRD、上一轮 evidence，并以只读方式检查项目结构。它不能改生产代码，只输出本轮 development document <code>D_t</code>。</span></div>
  <div class="role"><b>DEVELOPER</b><span>从 <code>A_(t-1)</code> warm-start，读取 PRD 和 <code>D_t</code>，是唯一允许写 artifact 的角色。它负责 baseline、修改和自测。</span></div>
  <div class="role"><b>QA TESTER</b><span>在隔离副本上读取并运行冻结的 <code>A_t</code>，不能修代码。它把 verified records 与 gap records 写入 <code>E_t</code>。</span></div>
</div>

论文的 Algorithm 1 可以压缩成六步：

<ol class="flow">
  <li><b>1 · PLAN</b><span>用 PRD 和旧 evidence 选择一个可验证增量。</span></li>
  <li><b>2 · PRESERVE</b><span>列出不能回归的已验证行为。</span></li>
  <li><b>3 · DEVELOP</b><span>Developer 在现有 artifact 上实现。</span></li>
  <li><b>4 · SELF-TEST</b><span>先建立 baseline，再对每次重要修改重测。</span></li>
  <li><b>5 · FREEZE</b><span>把候选复制到 QA 隔离区，绑定 candidate identity。</span></li>
  <li><b>6 · ASSESS</b><span>QA 用黑盒和白盒证据生成下一轮 <code>E_t</code>。</span></li>
</ol>

<div class="formula">D_t = Plan_H(S, E_(t-1)) &nbsp;·&nbsp; A_t = Dev_H(A_(t-1); S, D_t) &nbsp;·&nbsp; E_t = Test_H(A_t; S, D_t)</div>

### 3.2 权限不只写在 prompt 里

公开的 <code>hoh-lite</code>（revision <code>ae7cc6f</code>，Python 3.12+，Apache-2.0）用枚举和不可变 <code>RoleBinding</code> 强制权限。下面是官方源码摘录；Planner 或 Tester 如果拿到读写 workspace，初始化就会报错。

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

Runtime 还检查调用顺序。正常路径必须从 Planner 开始，Planner 后只能到 Developer；Developer 后才能到 Tester。每次调用的 role、状态、开始时间、耗时和摘要会写入 <code>runtime_receipt.json</code>。这让“Agent 说自己按顺序做了”变成 host 可以复核的事件记录。

### 3.3 Evidence 不是一句“测试通过”

论文把每个可检查 claim 写成三元组 <code>(claim, execution records, status)</code>。例如“左右键会移动角色”需要引用 replay 和 runtime trace；“完成目标后出现结果页”如果截图只显示任务结束却没有结果页，就进入 gap records。下一轮 Planner 会把前者写成 preservation constraint，把后者写成 update target 和 validation requirement。

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

这段是论文 Listing 1 的缩减摘录。QA 可以引用截图、视频、replay、runtime state、日志和公开 test；source-code presence 本身不能证明行为已经发生。

## Q4. 实验怎么评，结果和真实 case 说明什么？

### 4.1 内部 QA 和最终 benchmark judge 是两套系统

**HoH 的 QA 只看公开任务、当前 artifact 和公开执行记录。** Benchmark 在完整 run 结束后才运行 hidden tests 或 private rubric；结果不会进入 Planner、Developer 或 QA。

<div class="judge-grid">
  <div><b>GameCraft-Bench · 45 tasks</b><span>从 15 个 game family 各采 3 题，seed 20260707。编译或运行失败时 <code>B=0</code>，Overall 直接为 0；可运行时按四个 rubric dimension 加权。</span></div>
  <div><b>FrontierSWE · 15 tasks</b><span>4 个 Implementation、9 个 Performance、2 个 Research。官方 17 题中排除了 <code>frogsgame-rl</code>（需要当时不可用的 Tinker API 登录）和 <code>modular-stack-wan21</code>（要求 NVIDIA driver ≥580，实验 H200 worker 为 570.133.20）。每题由官方 verifier 给 reward。</span></div>
  <div><b>ProgramBench</b><span>Agent 只拿可执行文件和文档重建程序。每题对 hidden behavioral tests 计算通过比例，再对任务做宏平均。</span></div>
</div>

<div class="formula">GameCraft Overall = 100 · B · (0.15M + 0.35D + 0.15V + 0.35A)</div>

其中 <code>M/D/V/A</code> 分别是 Core Mechanics、Content Depth、Functional Visuals、Art and Presentation 的 rubric-item 均值。FrontierSWE headline mean 是 15 个 task reward 的无权均值；Dominance 先在同一 task 上与其余 11 个配置逐一比较，胜/平/负记 1/0.5/0，再在 domain 内平均，最后对三个 domain 做 macro average。ProgramBench 的 <code>Pass Rate†</code> 不是 solved-task rate，而是 per-task hidden-test fraction 的平均。

<div class="note blue"><p><strong>运行次数：</strong>每个 task-condition 只有 1 次有效 run。Infrastructure 或 provider transport error 会被替换，不算额外 replicate。客户端没有共同的可复现生成 seed，论文也没有统一覆盖 temperature 或 top-p。</p></div>

### 4.2 主结果：三种 harness 都有提升

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
  <img src="/lib/papers/harness-of-harness/figure-4-gamecraft-components.webp" alt="GameCraft-Bench 四个评分维度的 Vanilla 和 HoH 对比">
  <figcaption>原论文 Figure 4。三种 harness/model 在四个 GameCraft rubric dimension 上都提高；error bar 是对 45 个 task 做 20,000 次 bootstrap 的 95% percentile interval。</figcaption>
</figure>

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-6-gamecraft-examples.webp" alt="Momentum Lab、Kitchen Rush 和 Ant Empire 的 Vanilla 与 HoH 产物对比">
  <figcaption>原论文 Figure 6。Momentum Lab、Kitchen Rush、Ant Empire 的 Overall 分别从 34.05→70.61、42.62→73.38、65.52→87.88。这是定性 artifact 对比，不能用来还原逐步失败轨迹。</figcaption>
</figure>

### 4.3 不是“多跑几遍就会涨”

三次 Vanilla Continuation 会在同一 session 里收到固定提示 <code>Continue developing and testing the current game.</code>，但没有新的 development document，也没有独立 QA evidence。按相同 development pass 比较：

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
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-9-budget-tradeoff.webp" alt="HoH 和 Vanilla Continuation 的分数与 token 轨迹"><figcaption>原论文 Figure 9。相同 pass 下的质量与累计 token。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-10-ablation.webp" alt="HoH 跨轮状态消融"><figcaption>原论文 Figure 10。去掉 plan update、evidence feedback 或 warm-start 都会降分。</figcaption></figure>
</div>

消融的 Full HoH@3 是 71.52。去掉 Plan Update 后是 63.39，去掉 Evidence Feedback 后是 65.23，去掉 Warm-Start 后是 63.67。后者还把 token 从 8.41M 推到 11.12M，因为每轮都从空 workspace 重建。

### 4.4 FrontierSWE 能继续迭代，但仍有长期零分任务

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-5-frontierswe-dominance.webp" alt="FrontierSWE 十轮 Dominance"><figcaption>原论文 Figure 5。Codex 的 Dominance 从 Vanilla 27.33% 增到 HoH@10 的 72.67%，HoH@9 达到 76.00%。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-8-frontierswe-categories.webp" alt="FrontierSWE 三个类别的均值"><figcaption>原论文 Figure 8。Implementation、Performance、Research 的 task 数分别是 4、9、2。</figcaption></figure>
</div>

聚合分数会遮住停滞项。Codex 在 Cranelift、Dependent Type Checker、FFmpeg 和 Inference System 四个 Performance task 上从 Vanilla 到 HoH@3 都是 0。Pi 的 Revideo 也一直是 0。持续迭代能提高部分任务，不保证跨过每个 verifier 的硬门槛。

### 4.5 真实 Loop 70：Developer PASS，为什么 QA 仍判 FAIL？

<div class="case">
<h4>Fusepoint · combat_readability · candidate <code>loop-70-c3d32741612b</code></h4>
<ol>
  <li><strong>来源与状态：</strong>这是作者公开 Fusepoint 仓库 revision <code>55b442fc</code> 的真实 Planner/Developer/Tester receipt。Planner 从已有 issue ledger 选择四个 active issue，要求同时保留 clean boot、A/B/C 敌人数量、mouse-look、武器组件和终局逻辑。</li>
  <li><strong>本轮实现目标：</strong>修复 rifle enemy 把 pistol animation 绑定到活体敌人的问题；让 Alpha/Bravo/Charlie 的 3/5/10 敌人能分离 prepare 与 advance；把小号、定时消失的 story cue 改成玩家确认后才推进，并补齐 combat feedback cleanup。</li>
  <li><strong>Developer 输出：</strong>公开 README 记录 Developer Status = PASS、Completed tasks = 3、Changed paths = 6。这个 PASS 只表示开发阶段结束，不能关闭 QA criterion。</li>
  <li><strong>QA setup 与 action：</strong>Tester 先验证 clean boot，再用普通路线进入 gameplay；随后调用各 encounter 的 prepare/advance 路径，采集 runtime actor state、截图、日志和 frame。候选在测试期间冻结，QA 不能改代码。</li>
  <li><strong>观察：</strong>3/5/10 个 rifle actor 能准备出来，source 也不再把 rifle state 映射到 <code>Pistol_*</code>。但 advance 只产生 idle/walk sample，没有 target visibility、fire authorization、shot、reload、hit reaction 或 death；Replay 返回 predeployment 后，DeployButton 也无法用已测输入重新开局。</li>
  <li><strong>判定：</strong><code>clean_boot = PASS</code>，rifle-pistol binding issue 被 verified；enemy combat AI、animation motion quality、combat feedback、audio/VFX、performance stability 均 FAIL。最终 <code>phase_status = blocked</code>、Tester review = FAIL。</li>
</ol>
<div class="verdict"><div class="pass"><strong>这轮真正通过的部分</strong>clean boot；rifle state 不再解析为 pistol clip；A/B/C roster 可被 prepare；candidate 未在有界 smoke 中崩溃。</div><div class="fail"><strong>仍不能关闭 issue 的原因</strong>缺少完整 live combat transition；story cue 与 HUD contract 未满足；Replay 后不能部署；llvmpipe sample 只有 8 FPS，且没有 1920×1080 全流程三次 replay。</div></div>
</div>

这个 case 展示了 HoH 最重要的语义：**“实现了修复”与“在冻结候选上观察到验收行为”是两个状态。** QA 还区分代码修复、运行路径可达、证据完整和产品完成度，避免一个局部 source assertion 把整条交互链直接判成通过。

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-1-fusepoint-trajectory.webp" alt="Fusepoint 前 70 轮开发和 issue 轨迹">
  <figcaption>原论文 Figure 1。论文截点是 Loop 70：81 个 issue 中关闭 65 个、未解决 16 个，17 个曾关闭的 issue 后来因回归而重开。当前公开仓库快照已继续到 Loop 96，并显示 101 个 issue、94 closed、7 open；后者不是论文实验截点。</figcaption>
</figure>

### 4.6 全部原论文结果图放在一起看

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-7-gamecraft-groups.webp" alt="GameCraft 五个 reporting group 的 Overall">
  <figcaption>原论文 Figure 7。五个 reporting group 各含 9 个 task；这是作者为了分析新增的粗粒度分组，不是 GameCraft-Bench 原始 taxonomy。</figcaption>
</figure>

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-11-token-distribution.webp" alt="三种 harness 每次调用的 token 分布">
  <figcaption>原论文 Figure 11。不同 provider 的 cache accounting 不同，只适合在同一 harness/model 内比较。</figcaption>
</figure>

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-12-action.webp" alt="Action 三类游戏的 Vanilla 到 HoH3 对比"><figcaption>原论文 Figure 12：Platformer、Shooter、Roguelike。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-13-timing.webp" alt="Timing 三类游戏的 Vanilla 到 HoH3 对比"><figcaption>原论文 Figure 13：Racing、Rhythm、Sports。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-14-strategy.webp" alt="Strategy 三类游戏的 Vanilla 到 HoH3 对比"><figcaption>原论文 Figure 14：Strategy、Card Game、Puzzle。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/harness-of-harness/figure-15-simulation.webp" alt="Simulation 三类游戏的 Vanilla 到 HoH3 对比"><figcaption>原论文 Figure 15：Tycoon、Idle、Simulation。</figcaption></figure>
</div>

<figure class="figure">
  <img src="/lib/papers/harness-of-harness/figure-16-adventure.webp" alt="Adventure 三类游戏的 Vanilla 到 HoH3 对比">
  <figcaption>原论文 Figure 16：Horror、Open World、Visual Novel。Figures 12–16 每个 family 选择 HoH@3 分数最高的一题，不能把它们当成随机 case。</figcaption>
</figure>

## Q5. 对 Claude Code、Codex harness 研究有什么启发？

**对后续研究更有用的是四条可测试的系统约束。**

第一，单写者边界。Planner 可以读结构，QA 可以运行候选，只有 Developer 能改 artifact。这样一次状态变化有明确责任人，QA 证据也不会混入边测边修的中间版本。

第二，evidence 必须绑定 candidate identity。截图、日志和 replay 需要指向同一个 frozen artifact。否则一份报告可能把旧截图、新代码和测试中临时修过的状态拼在一起。

第三，内部 feedback 与隐藏 benchmark 隔离。Harness 可以利用公开运行证据修项目，但不能看最终 judge 的 hidden tests、分数或 rationale。这条边界决定实验是在改进开发协议，还是在对 evaluator 过拟合。

第四，把 preservation constraint 当成一等输入。下一轮除了“要修什么”，还需要“哪些已验证行为不能退步”。Fusepoint 的 17 次 reopen 说明，长任务的主要风险会从缺功能逐渐转向 regression management。

如果要在这个方向继续发论文，我会优先做以下实验：

1. 在固定 token、wall time 和 harness invocation 数下比较普通 continuation、HoH 和 LongHorizon-Harness，避免“更多调用”解释全部增益。
2. 对 evidence 做校准：测 QA 的 false positive、false negative、跨模型一致性，以及黑盒和白盒证据分别贡献多少。
3. 把 candidate-bound receipt 做成 harness-neutral protocol，让 Claude Code、Codex、OpenCode 能复用同一种 evidence object，而不是每个 benchmark 写一套胶水。
4. 加入 rollback 或 branch selection。当前 HoH 总是沿最新 artifact 继续；遇到严重回归时，系统虽保留 version history，却没有在主实验中系统比较回滚策略。
5. 对 task-level regression 建模。聚合均值提高时，仍需要检测 Spire Descent、Pipe Crisis 一类持续退步的 task，并决定何时停止继续迭代。

## Q6. 这篇论文目前能证明什么，不能证明什么？

**论文有一套完整、可执行、公开到角色权限和真实 receipt 的 harness 设计；实验支持整套 HoH 有效，但还不足以精确分解收益或证明多日项目已经达到独立产品验收标准。**

<div class="limit-grid">
  <div><b>能证明</b><span>固定 harness/model 下，三轮 HoH 在三套 benchmark 的总体指标上都超过 Vanilla；matched-pass、token efficiency 和三项跨轮消融支持 plan update、evidence feedback、warm-start 都有作用。</span></div>
  <div><b>单题不保证改善</b><span>Pi 的 Spire Descent、Pipe Crisis、Space Colony、Autobattler、Border Check 在 HoH@3 低于 Vanilla；整体单调不等于 task-level 单调。</span></div>
  <div><b>生成方差未知</b><span>每个 task-condition 只有一次有效 run，没有共同生成 seed，也没有重复采样。GameCraft component 的 bootstrap 只重采 task，不能估计同题多次生成的波动。</span></div>
  <div><b>ProgramBench 披露不足</b><span>论文给出 Avg. Test Pass Rate，却没有在附录列出完整 task 数、task 清单、运行环境、逐题结果或 run configuration；无法像另外两套 benchmark 那样复核分母和失败分布。</span></div>
  <div><b>Fusepoint 是单案例</b><span>70 轮 trajectory 展示了持久开发与回归，但论文没有对照同预算 baseline，也没有给出完整独立人工产品验收。附录定义 PXI scoring，却没有出现它所说的 main-paper PXI result table。</span></div>
  <div><b>公开包不是完整复现包</b><span>附录明确说 raw run artifacts、analysis records、environment files 和 hidden evaluator 不在匿名代码包中。公开 <code>hoh-lite</code> 足以检查 orchestration contract，不足以复算全部表格。</span></div>
</div>

我的结论是：**HoH 把“继续让 Agent 写”改造成“每轮产生一个版本化候选，再用独立证据决定下一步”。** 对 Claude Code、Codex 这类完整 harness，这比再加一段更长 prompt 更接近真实的软件工程控制面。它还留下三个明确研究口：如何校准 QA、如何在固定预算下分配 Planner/Developer/Tester，以及如何让长期迭代在单题上也具备可检测的停止与回滚条件。

</div>

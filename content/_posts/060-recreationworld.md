---
title: "[2026-09-18] RecreationWorld: Scalable and Verifiable Environments for Hybrid Computer-Use Agents"
permalink: "/posts/论文解读/recreationworld.html"
date: "2026-10-02T22:30:00+08:00"
updated: "2026-10-11T23:20:00+08:00"
cover: "/generated-covers/060-recreationworld.webp"
description: "RecreationWorld 怎样用 250 个五平台复刻任务，检验 Agent 能否在 GUI 探索、写代码、运行和验证之间自主往返；逐项拆清任务来源、隐藏测试、Logbert 真实 case、评分公式、模型结果与证据边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 15
categories:
  - "论文解读"
tags:
  - "Computer-Use Agent"
  - "Coding Agent"
  - "Benchmark"
  - "Agent Harness"
  - "GUI Agent"
---

<style>
html:not([data-theme="dark"]) body:has(.rw-reading){--paper:#fff;--paper-elevated:#f5f7f7;--ink:#20262b;--ink-soft:#65717a;--line:rgba(32,38,43,.14);background:#fff}.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:820px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:52ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.1}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.rw-reading{--column:820px;--blue:#33749b;--green:#2f7d6b;--orange:#b7683a;--red:#a64643;--violet:#6e5a9c;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.rw-reading>*{max-width:100%}.rw-reading p,.rw-reading li{text-wrap:pretty}.rw-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.rw-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.rw-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2329}.rw-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2329}.rw-reading .deck-head strong{font-size:.92rem}.rw-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.rw-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.rw-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.rw-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2329;border-top:1px solid #3b464e;font-size:.78rem!important}
.rw-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.rw-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--violet) 38%,var(--line-local));background:color-mix(in srgb,var(--violet) 5%,#fff)}.rw-reading .interest b{color:var(--violet);font:750 1.2rem/1 var(--mono)}.rw-reading .interest span{color:var(--soft);font-size:.84rem}.rw-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.rw-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.rw-reading .metric:last-child{border-right:0}.rw-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.2rem,3vw,1.62rem)/1 var(--serif)}.rw-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.rw-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.rw-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.rw-reading .keypoints ul{margin:0;padding-left:1.2rem}.rw-reading .keypoints li{margin:.42rem 0}.rw-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--violet);background:var(--surface)}.rw-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.rw-reading .kicker{display:block;margin-bottom:6px;color:var(--violet);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.rw-reading h2{margin-top:3.55rem}.rw-reading h3{margin-top:2.1rem}.rw-reading h4{margin-top:1.7rem}.rw-reading strong{font-weight:760}.rw-reading .table-scroll,.rw-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.rw-reading .table-scroll table{display:table;width:100%;min-width:760px;margin:0;border-collapse:collapse;font:400 .85rem/1.52 var(--sans)}.rw-reading th,.rw-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.rw-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.rw-reading td:first-child{font-weight:650}.rw-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f272d;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.rw-reading code{font-size:.92em}
.rw-reading .figure{width:100%;margin:27px 0}.rw-reading .figure img{display:block;width:auto;max-width:100%;max-height:820px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.rw-reading .figure.wide img{max-width:min(1120px,calc(100vw - 42px));margin-left:50%;transform:translateX(-50%)}.rw-reading .figure figcaption{max-width:760px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.rw-reading .figure.source img{border:0}.rw-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.rw-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.rw-reading .note p{margin:.34em 0}.rw-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .88rem/1.7 var(--mono);overflow-x:auto}.rw-reading .steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.rw-reading .steps li{min-height:144px;padding:13px;background:var(--surface)}.rw-reading .steps b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.rw-reading .steps span{display:block;color:var(--soft);font-size:.76rem;line-height:1.5}.rw-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.rw-reading .case h4{margin:0 0 8px;font-size:1.12rem}.rw-reading .case ol{padding-left:1.2rem}.rw-reading .case li{margin:.58rem 0}.rw-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.rw-reading .limit-grid>div{padding:17px;background:#fff}.rw-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.rw-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.article-shell-deck .article-header{width:100%;max-width:100%;min-width:0}.article-shell-deck .article-header h1{max-width:100%;font-size:clamp(1.75rem,7.5vw,2.25rem);overflow-wrap:anywhere;text-wrap:pretty}.article-shell-deck .article-deck,.article-shell-deck .article-deck>p,.rw-reading,.rw-reading .source-links{min-width:0}.article-shell-deck .article-deck>p,.rw-reading .source-links a{overflow-wrap:anywhere}.rw-reading .deck-wrap{max-width:100%;overflow:hidden}.rw-reading .metrics{grid-template-columns:1fr 1fr}.rw-reading .metric:nth-child(2){border-right:0}.rw-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.rw-reading .steps{grid-template-columns:1fr 1fr}.rw-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.rw-reading .figure.wide img{max-width:100%;margin-left:auto;transform:none}}
@media(max-width:460px){.rw-reading .steps,.rw-reading .limit-grid{grid-template-columns:1fr}.rw-reading .part0,.rw-reading .case{padding:17px 15px}.rw-reading .deck-head,.rw-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,1020px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="rw-reading">

<p class="paper-meta">Alibaba Token Hub, Alibaba Group · arXiv:2609.22000v2 · 最早公开于 2026-09-18，v2 更新于 2026-09-21</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.22000">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.22000">论文 PDF</a>
  <a href="https://github.com/QwenLM/RecreationWorld">官方仓库</a>
</div>

<section class="deck-wrap" aria-label="RecreationWorld 交互图解">
  <div class="deck-head"><strong>15 页交互图解 · 任务、构造、隐藏评测、Logbert case、结果与局限</strong><a href="/lib/decks/recreationworld-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/recreationworld-visual-guide.html" title="RecreationWorld 论文图解，共 15 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">RecreationWorld 把“照着一个正在运行的软件，重做一个行为相同的版本”变成训练环境和 benchmark。Agent 既要操作 reference GUI，找出菜单、状态变化和计算结果，又要写代码、构建并启动自己的版本，再回到 GUI 检查哪里不像。评测关心的是 <strong>GUI 探索与软件实现能否在同一条长轨迹里反复配合</strong>。</p>

<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>评分只表示博客作者本人兴趣程度；它同时覆盖 hybrid CUA、coding harness、可执行评测与训练数据扩展</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>250</strong><span>五个平台各 50 个 held-out task</span></div>
  <div class="metric"><strong>58.06</strong><span>GPT-6 Astra 的五平台 overall score</span></div>
  <div class="metric"><strong>2.8%</strong><span>GPT-6 Astra 获得 Prog 100% 的任务占比</span></div>
  <div class="metric"><strong>35,000</strong><span>用于 SFT 的筛选后 recreation trajectories</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>这不是 screenshot-to-code。</strong>Agent 可以反复操作 reference、修改实现、运行 candidate，再根据画面和行为继续修。</li>
    <li><strong>隐藏测试来自 reference 的真实运行结果。</strong>作者先生成 action 与 expected outcome，在干净 reference 上回放，再让人工复核，最后冻结测试。</li>
    <li><strong>58.06 是断言级平均，不是任务完成率。</strong>最强模型只有 2.8% 的任务通过全部 programmatic assertions。</li>
    <li><strong>训练结果还缺少关键对照和复现材料。</strong>论文报告最高 +17.9 个百分点；没有公开所选 trajectories、checkpoint、完整超参数或多次随机种子。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### Hybrid computer-use agent 到底“hybrid”在哪里？

GUI-only agent 会看屏幕、点击、输入；terminal/coding agent 会读写文件、运行命令、构建软件。这里的 **hybrid CUA** 会在同一条轨迹中交替使用两类操作：先在 reference 里试一个功能，写一部分 candidate，启动后发现不对，再回 reference 验证一个细节，然后继续改。

论文记录的 rollout 中，顶层 tool call 中位数是 **282.5**；每 100 次调用平均出现 **9.08 次 GUI 与 code-edit 之间的切换**。一次评测通常要持续保存上下文、执行代码、查看结果并纠错，而不是生成一版页面就结束。
</aside>

## Q1. 为什么要用“复刻软件”研究 hybrid CUA？

**因为 recreation 同时逼着 Agent 看懂一个可运行系统、实现它，并用执行结果检查自己的实现；reference 又天然提供可复验的 ground truth。**

现有 computer-use benchmark 通常给 Agent 一个现成应用，让它完成“发邮件、改表格、下单”一类操作；coding benchmark 则给 issue、仓库和 tests，让它在终端里改代码。两者都只覆盖循环的一半。RecreationWorld 反过来让 Agent 从一个运行中的 reference 开始：规格不在文档里，而在窗口、控件、菜单、输入输出和状态变化里。Agent 的交付物则必须是可构建、可启动的代码。

<figure class="figure wide source">
  <img src="/lib/papers/recreationworld/official-overview.png" alt="RecreationWorld 五平台任务、训练迁移与 benchmark 结果概览">
  <figcaption>官方仓库 `assets/overview.png`，对应论文 Figure 1；经核对仓库采用 MIT License。左侧是五平台 task，中间是训练后在五项 OOD benchmark 上的变化，右侧是十个模型的 Prog / VLM 得分。</figcaption>
</figure>

这个设计同时解决三个问题：

- **任务必须 hybrid。** 只点 GUI 交不出源代码，只在终端写代码又无法发现 reference 的真实行为。
- **结果可以自动验证。** 同一组隐藏 actions 和 assertions 可以先跑 reference，再原样跑 candidate；评分不要求 candidate 使用相同语言或架构。
- **训练数据可以扩展。** 公开软件持续提供新的 reference；高分 rollout 可以被筛选成训练轨迹。

## Q2. 它和相邻工作到底差在哪里？

**这项工作同时提供五个平台的 task environment、GUI+code harness、reference-grounded judge 和 trajectory generation。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>Agent 接触什么</th><th>主要交付或评测</th><th>与 RecreationWorld 的关键差别</th></tr></thead>
  <tbody>
    <tr><td>OSWorld / AndroidWorld / WebArena</td><td>现成应用或网站</td><td>完成指定操作，检查环境状态</td><td>侧重“使用软件”；一般不要求 Agent 同时重建软件并验证自己的产物。</td></tr>
    <tr><td>SWE-bench / ProgramBench</td><td>仓库、issue、terminal</td><td>代码 patch 或程序行为</td><td>侧重“修改软件”；缺少通过 GUI 主动发现规格和检查 render 的循环。</td></tr>
    <tr><td>Design2Code / Interaction2Code / WebGen-Bench</td><td>截图、说明或网页交互</td><td>前端或网站实现</td><td>最接近 visual coding，但通常集中于 Web，reference exploration 的深度和平台范围更窄。</td></tr>
    <tr><td>APPFORGE / RealDevWorld / GameCraft-Bench</td><td>移动应用、桌面软件或游戏目标</td><td>可执行 artifact，功能与视觉评测</td><td>也强调完整软件与可执行 judge；RecreationWorld 进一步统一五个平台，并研究 GUI↔code 的轨迹和训练迁移。</td></tr>
    <tr><td>Gym-Anything / CUA-Gym / GUI-GENESIS</td><td>自动构造的环境、任务与 reward</td><td>规模化训练环境或可验证轨迹</td><td>同属 scalable environment 路线；本文用运行中的 reference 同时产生规格、测试依据和训练经验。</td></tr>
    <tr><td>WeaveBench / PhoneHarness / StateAct</td><td>GUI 与 terminal、API 或 program state</td><td>混合工具工作流</td><td>直接研究 hybrid action；本文把重点放在 explore→implement→verify 的完整软件复刻流程。</td></tr>
  </tbody>
</table>
</div>

这里不应把“首个”当作结论。APPFORGE、RealDevWorld、GUI-GENESIS 等已经覆盖 reference-driven application generation 或功能+视觉评测。RecreationWorld 更有说服力的贡献是：**同一个 task contract 横跨 Ubuntu、macOS、Windows、Android 与 Web，并且把 benchmark 和训练轨迹生产连接起来。**

## Q3. 250 个任务从哪里来，Agent 能看见什么？

**任务不是由自然语言描述凭空写出来的。作者从可固定版本、可在隔离环境运行的软件或网站中选 reference，再为它准备可复现的启动方式、fixture 与隐藏 tests。**

RecreationBench 每个平台 50 个 task。三个桌面平台的 release inventory 记录 upstream repository 与 revision；Android 选择不声明 Internet permission、核心状态保存在本机的应用；Web 包含 44 个 synthetic site 和 6 个来自 public website 的站点。作者按功能域、UI framework、语言、规模和可测性筛选，并排除无法稳定构建、启动后被 update dialog 挡住或依赖在线服务的候选。公开仓库提供 250 个 task manifest、五平台 runner、统一 result schema 与评测代码；完整 frozen task bundles 由项目链接到 Hugging Face / ModelScope 分发。

<figure class="figure wide">
  <img src="/lib/papers/recreationworld/task-contract-redrawn.svg" alt="RecreationBench task contract 与可见隐藏边界">
  <figcaption>根据论文 Sections 2.1、4.1、4.2、4.5 与 Appendix C.6 重绘。Agent 拿到运行中的 reference 和完整开发环境；tests 与 ground truth 不给 Agent。</figcaption>
</figure>

### Benchmark 构造和提交评测是两条流程

先说**构造阶段**。作者分析 reference 的页面或源码来发现功能，实际操作 reference 获取 expected outcome，生成能重放的 case，再把每个 case 放到干净 reference 上执行。没有稳定通过 reference 的 case 会被丢弃；保留下来的 fixture、actions 和 expected observations 还要经过人工复核，然后才冻结。论文没有报告 reviewer 数量、inter-annotator agreement 或复核驳回率，所以可以确认“有人审”，不能推断标注一致性有多高。

再说**评测阶段**。Agent 只能看到 task prompt、运行中的 reference、开发工具和自己的 workspace。Desktop 与 Android 尽量做到 source-blind：reference source、test suite、ground-truth screenshots 和 credentials 都放在受保护位置。Web 是明确例外，因为浏览器运行静态站点时必然收到 HTML、CSS、JavaScript 与 assets；因此 Web 只能隐藏 captured ground truth 和 generated tests，并禁止 candidate 在评测时直接加载 reference。

<ul class="steps">
  <li><b>1 · EXPLORE</b><span>Agent 操作 reference，自己决定看哪些状态。</span></li>
  <li><b>2 · IMPLEMENT</b><span>在 workspace 写 source、build 与 launch 入口。</span></li>
  <li><b>3 · CHECK</b><span>启动 candidate，操作并检查画面或行为。</span></li>
  <li><b>4 · FREEZE</b><span>20 小时结束后终止 Agent process，冻结提交树。</span></li>
  <li><b>5 · EVALUATE</b><span>隐藏 suite 在隔离环境重放，不让 Agent 看 judge。</span></li>
</ul>

各平台的 programmatic 接口分别是 AT-SPI、AXUIElement、UI Automation、UiAutomator 和 DOM/ARIA。它们读到的是控件文字、状态、层级和 action outcome，不是 candidate 的内部变量。这样，同一个功能可以用 GTK、SwiftUI、WPF、React 或别的结构实现，只要外部行为一致即可。

## Q4. 一个真实 case 怎样从 fixture 走到 PASS / FAIL？

**Logbert case 展示了完整 judge 链：固定输入制造确定状态，隐藏 actions 把应用推进到 Statistic 页面，Prog 检查精确值，VLM 检查结构化接口看不到的图形与布局。**

<figure class="figure wide">
  <img src="/lib/papers/recreationworld/logbert-case-redrawn.svg" alt="Logbert 固定日志测试、交互步骤、programmatic 与 visual assertions">
  <figcaption>根据论文 Figure 8、Appendix C.5 与公开测试清单重绘。浅色 FAIL 分支是根据公开断言推演的说明，不是某个模型的真实日志。</figcaption>
</figure>

<div class="case">
<h4>把这个 case 按发生顺序读一遍</h4>
<ol>
  <li><strong>来源与作者。</strong>这是论文作者为 Windows task `couchcoding-logbert` 生成并复核的隐藏 case。公开 task manifest 能确认该 task 存在；Figure 8 展示了 case 名、fixture、actions 和 assertions。</li>
  <li><strong>准备状态。</strong>evaluator 提供固定日志 `sample_log4net_mixed.log`，共 10 条：5 条 Info、3 条 Error、2 条 Debug。81 个 task 共打包 393 个 fixture file，避免依赖用户机器上的偶然内容。</li>
  <li><strong>执行动作。</strong>runner 打开 New Logger，选择 fixture，等待 Number 列出现，再点击 Statistic。交互深度从初始状态一路推进到 depth 3。</li>
  <li><strong>Programmatic evidence。</strong>Windows UI Automation 必须读到且只读到 `20%`、`30%`、`50%` 三个 label，并确认旧值 `17%` 不存在。</li>
  <li><strong>Visual evidence。</strong>Qwen3.7-Plus 在 temperature 0 下判断 50% slice 是否显著最大、20% 是否最小，legend 是否为 Debug:2 / Info:5 / Error:3，以及 tab、grid 和 status 是否仍正确。</li>
  <li><strong>判定边界。</strong>缺少 expected evidence 就失败；judge 的 transport 或 parsing error 会重跑，不会直接记作模型失败。Build 或 launch 失败则整个 task 为 0。</li>
</ol>
</div>

下面是根据 Figure 8 公开断言写的 Python 3 说明代码，用来说明“精确状态”如何判定；它不是作者未公开 test bundle 的逐字副本。

<div class="code-scroll"><pre><code>def check_statistic_labels(labels):
    observed = sorted(v.strip() for v in labels if v and v.strip())
    assert observed == ["20%", "30%", "50%"]
    assert len(labels) == 3
    assert "17%" not in labels
&#35; PASS: ["50%", "30%", "20%"]
&#35; FAIL: ["50%", "30%", "20%", "17%"]  &#35; stale UI state remains
</code></pre></div>

### 分数到底怎样汇总

每个 assertion 先得到 pass/fail。Prog 与 VLM 分别在一个 application 内汇总；再在每个平台内对 50 个 application 做 macro average；最后让五个平台等权。Headline overall 是两条通道的算术平均：

<div class="formula">Overall = (five-platform macro-average Prog + five-platform macro-average VLM) / 2</div>

官方 MIT 仓库中的 `RunResult` 还专门区分“确实评为 0”和“根本没有完成评分”：`task_score = None` 表示 not graded，不应偷偷当作 0；`EvalCounts.rate` 优先用 `passed / total`，避免历史文件里的缓存比例与原始计数不一致。这一实现避免把“没有完成评分”混进真实 0 分，聚合时也优先信任原始计数。

<div class="code-scroll"><pre><code>&#35; Adapted from src/recreation_bench/result.py in the official MIT repository
@property
def graded(self) -&gt; bool:
    return self.task_score is not None
@property
def prog_pass_rate(self):
    if self.eval_prog_n:
        return self.eval_prog / self.eval_prog_n
    return self.programmatic.rate if self.programmatic else None
</code></pre></div>

## Q5. 模型表现、harness 实验和训练迁移说明了什么？

**最强模型仍远未复刻完整行为；但 programmable harness 显著降低交互开销，recreation trajectories 也显示出跨 benchmark 迁移。两组结果都值得继续做，但目前还不是严格因果结论。**

<figure class="figure wide">
  <img src="/lib/papers/recreationworld/results-redrawn.svg" alt="RecreationBench 三个领先模型的 Prog、VLM、overall 与严格完成率">
  <figcaption>根据论文 Table 3 重绘。GPT-6 Astra 的 overall 为 58.06，但 Prog=100% 的 task 只占 2.8%；这两个数字回答的是不同问题。</figcaption>
</figure>

十个模型中，GPT-6 Astra 以 Prog 58.19、VLM 57.92、overall 58.06 排第一；Claude Opus 5 是 45.99 / 42.34 / 44.16；GPT-5.6 Sol 是 40.63 / 43.49 / 42.06。论文的错误分析显示：模型更容易复制静态 interface structure，interaction 与 computed output 更难；生成的应用通常比 reference 小得多，也更集中在少数大文件里。

### Programmable SDK：少把每个 click 都送回模型

主榜使用 direct MCP：每个 click、keypress、observation 都单独返回模型。作者另做了一项 Windows 配对实验，让 Claude Opus 4.8 通过 persistent Node.js REPL 调用 typed JavaScript SDK，从而在一次执行里写循环、保存状态并只返回需要的观察。

<div class="table-scroll">
<table>
  <thead><tr><th>比较项</th><th>Direct MCP</th><th>Programmable SDK</th><th>变化</th></tr></thead>
  <tbody>
    <tr><td>Prog score</td><td>35.05</td><td>35.60</td><td>+0.55 pp</td></tr>
    <tr><td>VLM score</td><td>31.00</td><td>32.29</td><td>+1.29 pp</td></tr>
    <tr><td>computer-use calls</td><td>baseline</td><td>—</td><td>−39.9%</td></tr>
    <tr><td>input tokens</td><td>baseline</td><td>—</td><td>−40.7%</td></tr>
    <tr><td>tool-result text</td><td>baseline</td><td>—</td><td>−65.5%</td></tr>
    <tr><td>wall-clock / task</td><td>4.12 h</td><td>3.04 h</td><td>−26.1%</td></tr>
    <tr><td>estimated model cost / task</td><td>$90.50</td><td>$41.58</td><td>−54.1%</td></tr>
    <tr><td>output tokens</td><td>baseline</td><td>—</td><td>+15.7%</td></tr>
  </tbody>
</table>
</div>

效率统计只覆盖两种配置都没有 terminal error 且 usage 完整的 39 对；质量分覆盖所有 evaluator-valid pair。每个 task/configuration 只有一次 rollout，而且 REPL、SDK、context 返回方式一起变化，所以证据只支持“这一整套配置观察到更低开销”，不能把全部差值归因于 persistent runtime。

### 35,000 条轨迹是否真的教会了通用能力？

作者用 Qwen3.8-Max 生成 trajectories，每个平台选 7,000 条，组成 35,000 条 SFT mixture，再训练两个 initialization。两个 run 在五项 OOD coding / hybrid computer-use benchmark 的最后 checkpoint 都高于各自第一个被评测 checkpoint，单项最大提升 **17.9 个百分点**；后期 checkpoint 也更常运行自己的产物并读取 render。

这说明 recreation data 与更强的跨任务表现相关，但还缺少三个关键控制：没有 multiple seeds；没有 equal-data 的普通 coding trajectory 对照；没有发布被选中的 35,000 条 trajectory、训练 checkpoint 与完整 hyperparameters。因而论文证明了“这条训练路线值得做”，还没有隔离出究竟是 hybrid loop、数据规模、筛选策略还是 teacher model 带来的增益。

## Q6. 这篇论文应该怎样评价？

**如果你关注 Claude Code / Codex 式 harness，这篇很值得优先读：任务与 judge 都能执行，并且横跨五个平台。它的主要证据缺口是 VLM judge 的校准报告、重复运行和训练复现材料。**

<div class="limit-grid">
  <div><b>有限 tests ≠ 行为等价</b><span>隐藏 suite 只覆盖有限状态和路径。拿满分也只能说明通过了这些 assertions，不能证明 candidate 在所有输入下等同于 reference。</span></div>
  <div><b>VLM judge 缺少校准报告</b><span>论文说明了模型、temperature 与 error rerun，却没有给 human agreement、false-positive/negative 或不同 judge 的敏感性。</span></div>
  <div><b>source-blind 不是五平台同强度</b><span>Web 天生暴露 client code；Android 虽做权限与网络控制，仍承认 APK extraction 与 packet-level isolation 的残余风险。</span></div>
  <div><b>公开软件可能进入 pretraining</b><span>论文做了 source-overlap audit，但无法排除模型见过项目、截图或相关代码；这会把“探索理解”与“记忆复现”混在一起。</span></div>
  <div><b>榜单只有单次 rollout</b><span>长轨迹受采样和工具故障影响很大；没有方差或 repeated trials，很难判断接近分数之间的稳定差异。</span></div>
  <div><b>harness 比较改变多个变量</b><span>persistent runtime 的结果很实用，但它比较的是 complete configuration；不能单独声称某个 SDK 设计导致了 54.1% 成本下降。</span></div>
</div>

沿这条线继续研究，建议先补三项可证伪实验。第一，给 VLM assertions 做人工校准并公开 disagreement；第二，让同一模型、同一 task 重复运行，报告 task-level uncertainty；第三，在相同数据量与 teacher 下比较 recreation trajectory、普通 coding trajectory 和 GUI-only trajectory，单独估计 hybrid supervision 带来的变化。

</div>

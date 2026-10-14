---
title: "[2026-09-18] RecreationWorld: Scalable and Verifiable Environments for Hybrid Computer-Use Agents"
permalink: "/posts/论文解读/recreationworld.html"
date: "2026-10-02T22:30:00+08:00"
updated: "2026-10-14T16:00:00+08:00"
cover: "/generated-covers/060-recreationworld.webp"
description: "Agent 一边操作原软件弄清行为，一边写代码复刻，再运行自己的版本检查差异。本文用 Logbert 固定日志案例说明任务与隐藏测试的来源、两种评分通道、五平台结果和训练迁移。"
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
.rw-reading .figure{width:100%;margin:27px 0}.rw-reading .figure img{display:block;width:auto;max-width:100%;max-height:820px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.rw-reading .figure.wide img{width:100%;max-width:100%;margin-inline:auto;transform:none}.rw-reading .figure figcaption{max-width:760px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.rw-reading .figure.source img{border:0}.rw-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.rw-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.rw-reading .note p{margin:.34em 0}.rw-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .88rem/1.7 var(--mono);overflow-x:auto}.rw-reading .steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.rw-reading .steps li{min-height:144px;padding:13px;background:var(--surface)}.rw-reading .steps b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.rw-reading .steps span{display:block;color:var(--soft);font-size:.76rem;line-height:1.5}.rw-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.rw-reading .case h4{margin:0 0 8px;font-size:1.12rem}.rw-reading .case ol{padding-left:1.2rem}.rw-reading .case li{margin:.58rem 0}.rw-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.rw-reading .limit-grid>div{padding:17px;background:#fff}.rw-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.rw-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
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

<p class="lead">RecreationWorld 让 Agent 照着一个正在运行的软件，重做行为和画面相近的版本。Agent 先操作原软件，找出菜单、输入输出和状态变化；再写代码、构建并启动自己的版本；发现差异后，可以回到原软件继续观察。<strong>评测的是屏幕探索、软件实现和运行检查能否相互配合</strong>，不是只根据截图生成一张页面。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读前需要知道的概念</span>

### 同一个 Agent 怎样探索界面并写代码

只操作图形界面（GUI）的 Agent 会看屏幕、点击、输入；写代码的 Agent 会读写文件、运行命令和构建软件。这里的 **hybrid CUA** 是同一个 Agent 交替使用这两类工具。作为观察目标的原软件叫 **reference**，Agent 自己写出的版本叫 **candidate**；一次从探索到提交的完整执行记录叫 **rollout**。

Figure 3 记录了两项中位数：每条 rollout 有 **282.5 次顶层工具调用**，每 100 次调用有 **9.08 次界面操作与代码编辑之间的切换**，误差线是四分位距。这种切换先把动作归到 GUI 操作或显式文件修改，再数相邻类别的变化；其他调用仍留在分母中。通过屏幕上的终端输入代码仍被记作 GUI 操作。这是使用各 benchmark 自己的工具框架得到的轨迹结构比较，不能直接用来比较模型能力。
</aside>

<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>评分只表示博客作者本人兴趣程度；兴趣来自混合工具 Agent、代码执行框架、可执行评测与训练数据扩展</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>250</strong><span>五个平台各 50 个正式评测任务</span></div>
  <div class="metric"><strong>58.06</strong><span>GPT-6 Astra 的两通道五平台平均分</span></div>
  <div class="metric"><strong>2.8%</strong><span>GPT-6 Astra 获得程序检查满分的任务占比</span></div>
  <div class="metric"><strong>35,000</strong><span>筛选后用于监督微调的完整复刻记录</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li>Agent 可以反复操作原软件、修改实现、运行自己的版本，再根据画面和行为继续修；任务不限于照截图生成代码。</li>
    <li><strong>隐藏测试以原软件的真实结果为准。</strong>作者生成动作和预期结果，先在重置后的原软件上回放，再经人工复核，最后冻结。</li>
    <li>58.06 先在每个平台汇总程序检查与画面检查，再做五平台等权平均，不是任务完成率。最强模型只有 <strong>2.8%</strong> 的任务拿到程序检查满分。</li>
    <li><strong>训练结果还缺少关键对照和复现材料。</strong>论文报告最高 +17.9 个百分点；没有公开所选执行记录、模型检查点、完整超参数或多个训练随机种子的结果。</li>
  </ul>
</aside>


<h2 id="复刻软件为什么适合研究混合操作能力">1. Motivation：复刻软件为什么适合研究混合操作能力</h2>

**原软件同时提供可探索的规格和可核对的运行结果。** Agent 不只要做出外观，还要实现点击之后的结果。作者先在原软件上运行测试，再用同样输入和动作检查 candidate，避免靠想象规定标准答案。

现有软件操作评测通常给 Agent 一个现成应用，让它完成“发邮件、改表格、下单”一类操作；代码评测则给问题描述、仓库和测试，让它在终端里改代码。它们通常不要求在同一任务里同时探索软件、重新实现它并检查实现。RecreationWorld 反过来让 Agent 从一个运行中的 reference 开始：许多行为细节要从窗口、控件、菜单、输入输出和状态变化中发现。Agent 的交付物则必须是可构建、可启动的代码。

<figure class="figure wide source">
  <a href="/lib/papers/recreationworld/official-overview.png" target="_blank" rel="noopener"><img src="/lib/papers/recreationworld/official-overview.png" width="2160" height="900" alt="RecreationWorld 五平台任务、训练迁移与 benchmark 结果概览"></a>
  <figcaption>官方仓库 <code>assets/overview.png</code>，对应论文 Figure 1；经核对仓库采用 MIT License。左侧是五平台任务，中间是训练后在五项未见评测上的变化，右侧分别展示程序与画面两种检查得分。</figcaption>
</figure>

这个设计同时解决三个问题：

- 只点界面交不出源代码，只写代码又容易漏掉原软件的交互细节，任务要求两类工具配合。
- 同一组隐藏动作和断言（assertions，即必须成立的观察条件）先在原软件验证，再检查新版本；评分不要求两者使用相同语言或架构。
- 公开软件提供新的观察对象；高分执行记录可以被筛选成训练轨迹。

<h2 id="相邻工作：软件使用、代码生成与复刻评测">2. Related Work：软件使用、代码生成与复刻评测</h2>

**它把五平台的任务、混合工具、基于原软件的检查，以及训练轨迹生产放在一起。** 每条相邻路线都覆盖其中一部分；区别应看具体输入与评分，不应只看“首次”之类标签。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>Agent 接触什么</th><th>主要交付或评测</th><th>与 RecreationWorld 的关键差别</th></tr></thead>
  <tbody>
    <tr><td>OSWorld / AndroidWorld / WebArena</td><td>现成应用或网站</td><td>完成指定操作，检查环境状态</td><td>侧重“使用软件”；一般不要求 Agent 同时重建软件并验证自己的产物。</td></tr>
    <tr><td>SWE-bench / ProgramBench</td><td>仓库、问题描述、终端</td><td>代码补丁或程序行为</td><td>侧重“修改软件”；缺少通过界面主动发现行为细节、再检查运行画面的流程。</td></tr>
    <tr><td>Design2Code / Interaction2Code / WebGen-Bench</td><td>截图、说明或网页交互</td><td>前端或网站实现</td><td>最接近根据视觉输入写代码的任务，但通常集中于 Web，对原软件的探索深度和平台范围更窄。</td></tr>
    <tr><td>APPFORGE / RealDevWorld / GameCraft-Bench</td><td>移动应用、桌面软件或游戏目标</td><td>可执行软件，功能与视觉评测</td><td>也强调完整软件与可执行评分器；RecreationWorld 进一步统一五个平台，并研究界面操作与代码编辑交替的轨迹和训练迁移。</td></tr>
    <tr><td>Gym-Anything / CUA-Gym / GUI-GENESIS</td><td>自动构造的环境、任务与奖励</td><td>规模化训练环境或可验证轨迹</td><td>同属可扩展训练环境路线；本文用原软件的运行结果产生任务依据、测试依据和训练经验。</td></tr>
    <tr><td>WeaveBench / PhoneHarness / StateAct</td><td>图形界面与终端、API 或程序状态</td><td>混合工具工作流</td><td>直接研究两类工具配合；本文把重点放在探索、实现、检查相互衔接的完整复刻流程。</td></tr>
  </tbody>
</table>
</div>

相邻工作已经做过部分相同的事。APPFORGE、RealDevWorld、GUI-GENESIS 等已经覆盖根据原应用生成新应用或功能+视觉评测。RecreationWorld 更有说服力的贡献是：**同一套任务与交付规则横跨 Ubuntu、macOS、Windows、Android 与 Web，并且把 benchmark 和训练轨迹生产连接起来。**

<h2 id="从原软件构造任务，到隐藏检查给出分数">3. Benchmark / Protocol：从原软件构造任务，到隐藏检查给出分数</h2>

**任务先有可运行的原软件，再有固定输入与隐藏检查。** 作者为原软件固定版本和启动方式；测试前放入的文档、日志或目录等输入叫 **fixture**，它负责产生可复现状态，不是答案或断言。

RecreationBench 每个平台 50 个任务。三个桌面平台的发布清单记录上游仓库和版本；Android 选择未声明联网权限、核心状态保存在本机的应用；Web 包含 44 个合成站点与 6 个公开网站。作者按功能领域、界面框架、语言、规模和可测性筛选，排除构建不稳定、启动后被更新对话框挡住或依赖在线服务的应用。公开仓库提供 250 个任务清单、五平台执行程序、统一结果格式和评测代码；完整冻结任务包通过项目链接在 Hugging Face / ModelScope 分发。

<figure class="figure wide">
  <a href="/lib/papers/recreationworld/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/recreationworld/body-method.svg" width="1000" height="950" alt="RecreationBench 的 Agent 可见输入、可启动提交和隐藏检查边界"></a>
  <figcaption>根据论文 Sections 2.1、4.1、4.2、4.5 与 Appendix C.6 重绘。Agent 拿到运行中的原软件和完整开发环境；隐藏测试与参考结果不给 Agent。</figcaption>
</figure>

<h3 id="Benchmark-构造和提交评测是两条流程">3.1 Benchmark 构造和提交评测是两条流程</h3>

构造阶段，作者先安排一个负责探索的 Agent 检查页面或源码，操作原软件，并记录功能入口、触发动作、前后状态与必要输入。专门生成测试的 Agent 再根据这些记录写检查模块。源码帮助发现功能，**预期文字、状态与计算值取自实际运行结果**。Desktop 和 Android 按结构、导航或菜单、交互、计算、状态、文字等职责分工，避免同一观察重复计分。每条测试还要在重置后的原软件上执行；不能稳定通过的测试被修复或丢弃。保留下来的输入、动作与预期观察经过人工复核后才冻结。论文没有报告复核人数、标注者一致性或驳回率，因此能确认有人审核，不能推断审核有多可靠。

Web 还做两类筛选。作者先在多种模型的重建版本上运行检查，删去所有版本都能通过、区分能力弱的项目；再合并重复链接与交互。最终要求只检查元素存在的项目不超过 30%，交互项目至少 60%，交互项目中至少 40% 有一层以上导航、10% 有两层以上导航。Table 2 的最终套件统计是五平台等权平均：约 77% 的检查不止停留在初始界面，94.2% 检查动作产生的结果，其中 40.7% 进一步要求精确结果；这里的导航层数不计算在同一界面内的独立点击。

评测阶段，Agent 只能看到任务提示、运行中的原软件、开发工具和自己的工作目录。Desktop 与 Android 尽量隐藏原软件源码，论文称为 source-blind：源码、测试、参考截图与凭证都放在受保护位置。部分 Ubuntu 与 Windows 输入文件可以提供给 Agent，规范副本和测试逻辑仍隐藏；macOS 与 Android 的测试输入由评分端安装。Web 是明确例外，浏览器运行静态站点必然收到 HTML、CSS、JavaScript 和资源文件；只能隐藏另行采集的参考结果与测试，并禁止新版本在评测时直接加载原站点。Android 已安装的 APK 原则上仍可提取，论文也没有证明它具有与桌面相同强度的网络隔离。

<ul class="steps">
  <li><b>1 · 探索</b><span>Agent 操作原软件，自己决定看哪些状态。</span></li>
  <li><b>2 · 实现</b><span>在工作目录写源代码、构建与启动入口。</span></li>
  <li><b>3 · 检查</b><span>启动自己的版本，操作并检查画面或行为。</span></li>
  <li><b>4 · 冻结</b><span>20 小时结束后终止 Agent 进程，冻结提交文件。</span></li>
  <li><b>5 · 评分</b><span>隐藏测试在隔离环境回放，不让 Agent 看评分器。</span></li>
</ul>

检查器先执行真实点击与输入，再通过 AT-SPI、AXUIElement、UI Automation、UiAutomator 或 DOM/ARIA 等平台接口，读取控件的文字、选中状态和计算结果。论文把这条结构化检查通道叫 **Prog**。颜色、绘图和布局不能总从控件树读取，所以另一条 **VLM** 通道把截图和基于原软件写好的文字标准交给视觉语言模型判断。二者都检查外部行为，不要求 candidate 使用与 reference 相同的语言或数据结构。

<h3 id="Logbert：固定日志如何产生一个-PASS-FAIL">3.2 Logbert：固定日志如何产生一个 PASS / FAIL</h3>

**这条检查要验证日志统计，不只是看到一个饼图。** 作者提供十条日志，负责回放测试的执行程序（runner）打开它并进入 Statistic 页面，再检查精确百分比与对应图形。

<figure class="figure wide">
  <a href="/lib/papers/recreationworld/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/recreationworld/body-case.svg" width="1000" height="1110" alt="Logbert 固定日志、界面动作、精确百分比检查和视觉检查的实际顺序"></a>
  <figcaption>根据论文 Figure 8、Appendix C.5 与公开测试清单重绘。浅色 FAIL 分支是根据公开断言推演的说明，不是某个模型的真实日志。</figcaption>
</figure>

<div class="case">
<h4>把这个 case 按发生顺序读一遍</h4>
<ol>
  <li>这是论文作者为 Windows 任务 <code>couchcoding-logbert</code> 生成并复核的隐藏用例。公开任务清单能确认该任务存在；Figure 8 与 Appendix C.5 展示了测试函数摘录、输入、动作和断言。本文没有把完整隐藏任务包重新运行一遍。</li>
  <li>评测程序提供固定日志 <code>sample_log4net_mixed.log</code>，共 10 条：5 条 Info、3 条 Error、2 条 Debug。整个 benchmark 的 81 个任务共打包 393 个输入文件，避免依赖用户机器上的偶然内容。这是打包文件数，不是 393 个独立测试用例。</li>
  <li>runner 打开 New Logger，选择 fixture，等待 Number 列出现，再点击 Statistic。从打开菜单、选择日志、加载记录到统计页，共经过三个导航层次，论文记为 depth 3。</li>
  <li>Windows UI Automation 必须读到且只读到 <code>20%</code>、<code>30%</code>、<code>50%</code> 三个文字标签，并确认旧值 <code>17%</code> 不存在。因为总数是 10，Info 的计算是 <code>5 / 10 × 100 = 50%</code>，Error 与 Debug 同理得到 30% 与 20%。</li>
  <li>Qwen3.7-Plus 在 temperature 0 下判断 50% 的扇区是否显著最大、20% 是否最小，图例是否为 Debug:2 / Info:5 / Error:3，以及标签页、列表和状态栏是否仍正确。只写对三个数字、饼图却画错，可以通过文字检查而失败于画面检查。</li>
  <li>例如 ["50%","30%","20%","17%"] 会因为残留旧值和数量为四而失败；这是按已发布断言推演的说明，不是某模型的真实日志。缺少截图会让该视觉断言失败。论文把评分服务连接或解析错误视为应重新测量的基础设施问题，不算 candidate 失败；下文另外说明当前 Web 代码遇到这类问题时如何改变分母。无法构建或启动则整个任务为 0。</li>
</ol>
</div>

下面是根据 Figure 8 与 Appendix C.5 测试摘录改写的 Python 3 说明代码，运行时只需要标准库。它示范精确文字检查，不是完整隐藏 test bundle，也没有执行 GUI 或视觉评分。

<div class="code-scroll"><pre><code>def check_statistic_labels(labels):
    observed = sorted(v.strip() for v in labels if v and v.strip())
    assert observed == ["20%", "30%", "50%"]
    assert len(observed) == 3
    assert "17%" not in observed
&#35; PASS: ["50%", "30%", "20%"]
&#35; FAIL: ["50%", "30%", "20%", "17%"]  &#35; stale UI state remains
</code></pre></div>

<h3 id="不同平台的分数怎样汇总">3.3 不同平台的分数怎样汇总</h3>

桌面与 Android 的 Prog 是固定测试 case 的通过比例；它们的 VLM 是视觉断言通过比例。Web 的功能检查按具体程度加权，行为与内容检查比“能启动、元素存在”更重；视觉分先在页面/视口内聚合，再合并桌面与手机版。

固定公开代码 <code>b5cda868</code> 的 <code>scripts/web/evaluation/evaluator.py</code> 给出功能权重：启动类 gate 为 0.1，结构类 struct 为 0.15，内容为 1.0，路由与交互各 0.4，其他为 0.3。分数是 <code>通过检查的权重之和 / 全部检查的权重之和</code>。例如四项检查的权重分别为 0.1、0.15、1.0、0.4，只通过前两项时，原始通过率是 2/4，加权得分却只有 <strong>0.25/1.65 = 15.15%</strong>。这是按公开公式算的教学例子，不是某个模型的成绩。

同版本 <code>vlm_judge.py</code> 先计算一个视口中视觉项目的加权平均，再按 desktop 0.6、mobile 0.4 合并，同一网站的页面等权。**没有 candidate 截图是实际零分，judge 没能给出判断则是 <code>None</code>。** 后者所在的视口从页面分母中去掉，剩余视口权重重新归一；整页都没有有效判断时，页面也从网站平均中去掉。如果整个网站都未判分，代码返回 <code>-1</code> 标记，再由汇总代码退回 SSIM/LPIPS 图像相似度。返回的判断数量不齐时，只对权重与判断都存在的项目计分。它支持重测错误视口，但这段当前代码不能证明论文历史榜单对所有失败都重试到有效。这些分母和备用指标应随运行报告一起检查。

随后每个平台内对各应用等权平均，避免测试较多的应用占据更多权重；五个平台再等权。两条通道的最终平均为：

<div class="formula">Overall = (five-platform macro-average Prog + five-platform macro-average VLM) / 2</div>

公开仓库的 `src/recreation_bench/result.py` 是读取统一结果的 schema，不是重新计算平台总分的第二套评分器。它保留 Android 的应用平均与 Web 的原生加权结果，不用原始计数覆盖这些分数。`task_score=None` 表示没有得到评分，实际零分仍是 `0.0`。原始计数访问器 `EvalCounts.rate` 会优先读 `passed/total`，但它不能证明全榜都按断言简单平均。

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

<h2 id="实验结果：复刻程度、工具成本与训练迁移">4. Experiments：复刻程度、工具成本与训练迁移</h2>

**平均部分检查做得不错，不等于整个应用复刻完成。** 工具配置的成本实验和轨迹训练实验分别支持继续探索，但需要保留它们各自的控制边界。

<figure class="figure wide">
  <a href="/lib/papers/recreationworld/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/recreationworld/body-results.svg" width="1000" height="825" alt="RecreationBench 三个领先模型的 Prog、VLM、overall 与严格完成率"></a>
  <figcaption>根据论文 Table 3 重绘。GPT-6 Astra 的 overall 为 58.06，但 Prog=100% 的 task 只占 2.8%；这两个数字回答的是不同问题。</figcaption>
</figure>

十个模型中，GPT-6 Astra 以 Prog 58.19、VLM 57.92、overall 58.06 排第一；Claude Opus 5 是 45.99 / 42.34 / 44.16；GPT-5.6 Sol 是 40.63 / 43.49 / 42.06。Astra 与 Sol 使用 Codex 0.145.0，其他模型使用 Claude Code；各模型的上下文与输出上限并不相同，最长执行时间都是 20 小时，每个任务只运行一次。这是完整 Agent 配置的比较，不能把分差全算在模型权重上。2.8% 仅要求 Prog 满分，没有同时要求 VLM 满分。

论文的错误分析显示：模型更容易复制静态界面结构，交互和计算结果更难；生成应用通常比原软件小得多，也更集中在少数大文件里。Figure 10 还给出一个直接反例：最后改完源码后，重新启动并查看候选界面的比例，Astra 是 29.1%，Qwen3.8-Max-0902 是 47.5%，但后者榜单分更低。这个行为指标不等于功能真正验证通过，也不能单独解释模型排名。

<h3 id="用代码批量控制工具，成本下降来自哪套配置">4.1 用代码批量控制工具，成本下降来自哪套配置</h3>

主榜使用 **direct MCP**：每次点击、按键或观察都作为单独工具调用返回模型。Windows 配对实验则让 Claude Opus 4.8 在保持变量的 Node.js 执行环境中，用 JavaScript SDK 批量操作工具、写循环，只返回有用观察。前者与后者的区别是工具怎么组织执行，模型权重没有重新训练。下表的 token 是模型处理的文本单位，输入与输出分别计数。

<div class="table-scroll">
<table>
  <thead><tr><th>比较项</th><th>Direct MCP</th><th>Programmable SDK</th><th>变化</th></tr></thead>
  <tbody>
    <tr><td>Prog 分数</td><td>35.05</td><td>35.60</td><td>+0.55 个百分点</td></tr>
    <tr><td>VLM 分数</td><td>31.00</td><td>32.29</td><td>+1.29 个百分点</td></tr>
    <tr><td>界面操作工具调用数</td><td>对照起点</td><td>未列绝对数</td><td>−39.9%</td></tr>
    <tr><td>输入 token</td><td>对照起点</td><td>未列绝对数</td><td>−40.7%</td></tr>
    <tr><td>工具返回文本量</td><td>对照起点</td><td>未列绝对数</td><td>−65.5%</td></tr>
    <tr><td>每任务实际经过时间</td><td>4.12 h</td><td>3.04 h</td><td>−26.1%</td></tr>
    <tr><td>每任务估算模型成本</td><td>$90.50</td><td>$41.58</td><td>−54.1%</td></tr>
    <tr><td>输出 token</td><td>对照起点</td><td>未列绝对数</td><td>+15.7%</td></tr>
  </tbody>
</table>
</div>

效率统计只覆盖两种配置都没有终端错误、用量记录完整的 39 对；质量分覆盖全部 50 个 Windows 应用中评分有效的配对任务。每个任务/配置只执行一次，而且 driver 版本、给模型的操作说明、交互式运行环境、SDK、上下文返回方式一起变化，所以证据只支持“这一整套配置观察到更低开销”，不能把全部差值归因于持续保留变量的运行环境。成本使用公开 API 单价估算，假定 90% 的输入按缓存读取收费，不是账单，也不包含工具运行与基础设施开销。

<h3 id="筛选轨迹训练后的迁移证据">4.2 筛选轨迹训练后的迁移证据</h3>

作者用 Qwen3.8-Max 生成执行记录，再用各任务行为检查筛选高分记录，每个平台选 7,000 条，组成 35,000 条监督微调数据。**均衡的是轨迹条数，不是 token 数或训练权重**，长短不同的轨迹可以贡献不同文本量。两条训练路线分别从已经完成后训练的 Qwen3.7-Plus，以及内部持续预训练后的 Qwen-Flash-CPT 开始。

Figure 5 比较的是训练过程中第一个与最后一个被评测的模型存档，不一定是训练前原模型。每个任务、每个存档只执行一次，全部使用 Claude Code，但外部 benchmark 的预算、工具版本和评分器不同：ProgramBench 200 题看测试通过比例；GameCraft-Bench 140 题看构建后规则分；Vision2Web 193 题按三个难度层级组合视觉与功能分；OSWorld 2.0 是 108 题的部分得分；WeaveBench 是 114 题经捷径审查后的分数。两条路线最后都高于自己的起点，曲线却并非一直上涨。最大 **+17.9 个百分点** 是 Qwen-Flash-CPT 在 OSWorld 2.0 的 28.2→46.1，不是五 benchmark 平均值；五项平均提升分别为 +5.8 和 +12.1。

Figure 6 显示后期模型更常检查自己的代码与画面、操作 GUI，但三组比例不能相加：代码验证的分母是 ProgramBench 的 Bash 调用，图片检查是两个视觉编程 benchmark 的读图比例，GUI 操作则来自两个计算机操作 benchmark。其 post-edit 指第一次源码修改之后，不保证检查发生在最后一次修改之后。行为比例与分数一起变化，仍未证明前者导致后者。

复刻数据与更强的跨任务表现相关，但还缺少关键控制：没有多个训练随机种子，也没有等量普通代码轨迹作对照；所选 35,000 条记录、训练检查点和完整超参数尚未发布。因此收益究竟来自工具交替、数据规模、筛选策略还是生成数据的强模型，尚未分清。

<h2 id="下一步：分开验证评分可靠性与训练收益">5. Discussion：分开验证评分可靠性与训练收益</h2>

**先补评分校准和同条件训练对照，才能知道高分与迁移收益是否可靠。** 给 VLM 断言做人工复核，报告它与人的分歧和误判；同一模型、同一任务重复执行，报告分数波动。固定数据量和生成轨迹的模型，再比较复刻软件、普通代码任务与纯界面操作的轨迹，才能单独估计交替探索与实现的训练价值。

公开测试还可以加入故意遗漏计算、保留旧值或只复制静态界面的新版本，看是否确实失败。这能检验隐藏测试是否真的区分功能与外观，而不只是把所有原软件能通过的浅层检查留下来。以上是本文根据证据缺口建议的实验，不是论文已经验证的结论。

<h2 id="总结：可执行规格的价值与当前边界">6. Conclusion：可执行规格的价值与当前边界</h2>

**最值得借鉴的是让原软件的运行结果同时服务任务说明与测试依据。** 五平台共同验证 Agent 是否能把屏幕探索与写代码接起来；但有限测试、视觉误判、训练对照不足，仍限制结论。

<div class="limit-grid">
  <div><b>有限测试不能证明行为等价</b><span>隐藏测试只覆盖有限状态和路径。拿满分也只能说明通过了这些检查，不能证明新版本在所有输入下等同于原软件。</span></div>
  <div><b>视觉评分缺少校准报告</b><span>论文说明了评分模型、生成温度和异常重测，却没有报告与人工判断的一致性、漏判与误判率。当前 Web 代码还会排除无判断的页面，全部无法判分时换用图像相似度，运行报告必须说明这些变化。</span></div>
  <div><b>source-blind 不是五平台同强度</b><span>Web 必然向浏览器发送网页代码；Android 虽做权限与网络控制，仍承认安装包可被提取、网络隔离不完全等风险。</span></div>
  <div><b>公开软件可能进入预训练</b><span>论文做了源码重叠检查，但无法排除模型见过项目、截图或相关代码；这会把“探索理解”与“记忆复现”混在一起。</span></div>
  <div><b>榜单只有单次 rollout</b><span>长轨迹受采样和工具故障影响很大；没有方差或重复执行，很难判断接近分数之间的稳定差异。</span></div>
  <div><b>harness 比较改变多个变量</b><span>持续运行环境的结果很实用，但比较的是整套配置；不能单独声称某个 SDK 设计导致了 54.1% 成本下降。</span></div>
</div>


</div>

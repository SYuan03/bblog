---
title: "[2026-03-30] Meta-Harness: End-to-End Optimization of Model Harnesses"
permalink: "/posts/论文解读/meta-harness.html"
date: "2026-09-29T22:20:00+08:00"
updated: "2026-09-29T22:20:00+08:00"
cover: "/generated-covers/055-meta-harness.webp"
description: "让 Claude Code 读取全部候选代码、分数与原始执行轨迹，再由独立外层程序验证和评测新 harness：本文拆解 Meta-Harness 的搜索闭环、三组实验、TerminalBench 真实迭代与证据边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Claude Code"
  - "Program Search"
  - "Context Engineering"
  - "TerminalBench"
---

<style>
html:not([data-theme="dark"]) body:has(.metah-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:34ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.metah-reading{--column:780px;--blue:#285d9b;--orange:#ad5735;--green:#2b7562;--red:#a0443d;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.metah-reading>*{max-width:100%}.metah-reading p,.metah-reading li{text-wrap:pretty}.metah-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.metah-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.metah-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.metah-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.metah-reading .deck-head strong{font-size:.92rem}.metah-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.metah-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.metah-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.metah-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.metah-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.metah-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line-local));background:color-mix(in srgb,var(--blue) 5%,#fff)}.metah-reading .interest b{color:var(--blue);font:750 1.2rem/1 var(--mono)}.metah-reading .interest span{color:var(--soft);font-size:.84rem}
.metah-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.metah-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.metah-reading .metric:last-child{border-right:0}.metah-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.22rem,3vw,1.68rem)/1 var(--serif)}.metah-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.metah-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.metah-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.metah-reading .keypoints ul{margin:0;padding-left:1.2rem}.metah-reading .keypoints li{margin:.42rem 0}.metah-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--green);background:var(--surface)}.metah-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.metah-reading .kicker{display:block;margin-bottom:6px;color:var(--green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.metah-reading h2{margin-top:3.55rem}.metah-reading h3{margin-top:2.1rem}.metah-reading h4{margin-top:1.7rem}.metah-reading strong{font-weight:750}.metah-reading .table-scroll,.metah-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.metah-reading .table-scroll table{display:table;width:100%;min-width:720px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.metah-reading th,.metah-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.metah-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.metah-reading td:first-child{font-weight:650}.metah-reading .code-scroll pre{min-width:720px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.metah-reading code{font-size:.92em}
.metah-reading .figure{width:100%;margin:27px 0}.metah-reading .figure img{display:block;width:auto;max-width:100%;max-height:760px;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.metah-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.metah-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.metah-reading .role{padding:16px;background:#fff}.metah-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.metah-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.metah-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.metah-reading .flow li{min-height:132px;padding:12px;background:var(--surface)}.metah-reading .flow b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.metah-reading .flow span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.metah-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.metah-reading .case h4{margin:0 0 8px;font-size:1.12rem}.metah-reading .case ol{padding-left:1.2rem}.metah-reading .case li{margin:.58rem 0}.metah-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.metah-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.metah-reading .verdict strong{display:block;margin-bottom:4px}.metah-reading .verdict .pass strong{color:var(--green)}.metah-reading .verdict .fail strong{color:var(--red)}
.metah-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.metah-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.metah-reading .note p{margin:.34em 0}.metah-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.metah-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.metah-reading .limit-grid>div{padding:17px;background:#fff}.metah-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.metah-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.metah-reading .metrics{grid-template-columns:1fr 1fr}.metah-reading .metric:nth-child(2){border-right:0}.metah-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.metah-reading .flow{grid-template-columns:1fr 1fr}.metah-reading .roles{grid-template-columns:1fr}.metah-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.metah-reading .flow,.metah-reading .verdict,.metah-reading .limit-grid{grid-template-columns:1fr}.metah-reading .part0,.metah-reading .case{padding:17px 15px}.metah-reading .deck-head,.metah-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="metah-reading">

<p class="paper-meta">Yoonho Lee, Roshen Nair, Qizheng Zhang, Kangwook Lee, Omar Khattab, Chelsea Finn · arXiv:2603.28052v1 · 2026-03-30</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2603.28052">论文主页</a>
  <a href="https://arxiv.org/pdf/2603.28052">论文 PDF</a>
  <a href="https://yoonholee.com/meta-harness/">项目页</a>
  <a href="https://github.com/stanford-iris-lab/meta-harness">官方代码</a>
  <a href="https://github.com/stanford-iris-lab/meta-harness-tbench2-artifact">TerminalBench artifact</a>
</div>

<section class="deck-wrap" aria-label="Meta-Harness 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · 搜索闭环、真实迭代、代码与证据边界</strong><a href="/lib/decks/meta-harness-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/meta-harness-visual-guide.html" title="Meta-Harness 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">如果把 Claude Code 或 Codex 周围的 prompt、memory、retrieval、tool loop 都视为可编辑代码，谁来调这套代码？Meta-Harness 的答案是：再放一个 coding agent 在外层，让它读取历次候选的源码、分数和原始执行轨迹，提出下一版 harness；但候选能不能运行、得多少分、哪些结果可以进入最终测试，仍由独立程序控制。</p>

<div class="interest"><b>博客作者兴趣度 9.6 / 10</b><span>完整 harness 自动工程化的代表性工作；方法简单，证据边界也很值得借鉴</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>48.6%</strong><span>在线分类 test accuracy</span></div>
  <div class="metric"><strong>+4.7 pp</strong><span>IMO-level math 相对 no retrieval</span></div>
  <div class="metric"><strong>76.4%</strong><span>TerminalBench-2 · Opus 4.6</span></div>
  <div class="metric"><strong>82 files</strong><span>TerminalBench 每轮中位读取量</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个判断</h3>
  <ul>
    <li><strong>Meta-Harness 优化的是 executable harness code，不更新被包裹模型的权重。</strong></li>
    <li><strong>方法的核心是 full-history filesystem。</strong>Proposer 自己选择要读的旧代码和 raw traces；外层程序不替它把历史压成 summary。</li>
    <li><strong>三组实验的泛化含义不同。</strong>分类有 held-out test 与 OOD datasets；math 有未见题和四个真正未见模型；TerminalBench 则在同一 89 道公开任务上搜索和终测。</li>
    <li><strong>TerminalBench 的最终提升来自很小的环境预取模块。</strong>它在第一次 LLM call 前收集工作目录、文件、语言工具链、包管理器和内存，失败时静默退回原流程。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 这里的 harness、proposer 与 evaluator 分别是谁？

`task harness` 是包在固定模型外面的程序：它构造 prompt，维护 memory，决定怎样检索、调用工具、更新状态和结束任务。`proposer` 是负责改写这段程序的 Claude Code + Opus 4.6。`evaluator` 则在 proposer 之外运行候选，对接口做验证、执行任务并返回分数。

所以这不是“让模型自己宣布自己进步”。Proposer 只能写候选代码；外层循环决定代码能否导入、运行哪些题、怎样计分、哪些候选进入 Pareto frontier，以及何时解冻 final test。论文中的 base model 始终冻结，变化发生在它外面的程序层。
</aside>

## Q1. 为什么已有 prompt optimizer 不足以处理完整 harness？

**因为 harness 的错误往往隔很多步骤才显现，而现有优化器通常在 proposer 看见历史之前就把反馈压缩掉了。** 一次 retrieval 选错例子，可能直到十轮以后才表现为错误答案；一次 completion-state 修改，可能让已经完成任务的 Agent 又重复验证几十步。单个 scalar score 只能告诉 proposer “变差了”，不能告诉它哪段状态转换造成了回归。

论文估算，已有 text optimizer 每次迭代提供给 proposer 的反馈规模大约在 100 到 30,000 tokens，而最重的 harness 评测一次可以产生约 1,000 万 tokens 的诊断材料。Meta-Harness 不把这些内容硬塞进一个 prompt，也不先写成摘要。它把每个候选的 source code、score、model output、tool call 和 state update 放到文件系统里，让 coding agent 用 `grep`、`cat`、脚本和局部读取主动取证。

<figure class="figure">
  <img src="/lib/papers/meta-harness/figure-2-loop.svg" alt="Meta-Harness 的 proposer、evaluator 与文件系统闭环">
  <figcaption>原论文 Figure 2（CC BY 4.0）。第 1 步由 proposer 读历史并写候选；第 2 步由外层 evaluator 跑任务；第 3 步才把 code、score 与 trace 写回历史。</figcaption>
</figure>

TerminalBench search 的读取记录说明 proposer 确实使用了这套历史：十轮里，每轮读取 **69 到 99 个文件，中位数 82 个**；其中 41% 是旧 harness 源码，40% 是 execution traces，只有 6% 是 score 或 summary 文件。它会跨候选查证，不是只在最新版本附近做局部修改。

## Q2. 它与 GEPA、OpenEvolve、TTT-Discover、ACE/MCE 和共同进化方法差在哪？

**Meta-Harness 的位置可以用三条轴看清：优化对象是完整代码，反馈是跨 population 的 raw history，模型权重保持冻结。** 它没有发明复杂的 parent-selection rule；population 与 Pareto frontier 由外层保存，但读哪个旧候选、改哪一层、做局部 patch 还是整体重写，交给 coding agent 决定。

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>优化对象</th><th>反馈接口</th><th>与本文的关键边界</th></tr></thead>
  <tbody>
    <tr><td>GEPA</td><td>prompt / text artifact</td><td>单候选 rollout 的 reflective feedback / summary</td><td>反馈比 scalar 丰富，但没有让 proposer 自由检索全部候选的 raw traces。</td></tr>
    <tr><td>AlphaEvolve / OpenEvolve</td><td>指定函数或可执行程序</td><td>program database + evaluation scores</td><td>同样搜索 code；Meta-Harness 强调完整诊断历史，而不是固定 mutation operator。</td></tr>
    <tr><td>TTT-Discover</td><td>test-time artifact</td><td>最近 solution fragment + PUCT reuse</td><td>更依赖手写搜索结构；本文让 proposer 自己选择证据与 edit granularity。</td></tr>
    <tr><td>ACE / MCE</td><td>在线 memory 或 natural-language skills</td><td>样例、反思与技能库</td><td>它们是分类实验里的手写 harness baseline；Meta-Harness 搜索产生新的 retrieval / prompt program。</td></tr>
    <tr><td>HarnessForge / Co-Harness</td><td>harness 与 model weights</td><td>失败归因 + 成功 trajectory</td><td>最终产品是共同进化的 model/harness pair；本文只改 harness，因此产物更容易跨 base model 复用。</td></tr>
  </tbody>
</table>
</div>

Table 3 直接检验了这条边界。在线分类 search 中，scores-only 的 candidate accuracy 中位数 / 最优值为 34.6 / 41.3；加入 LLM summary 后是 34.9 / 38.7；保留 raw execution traces 的完整版本达到 **50.0 / 56.7**。这些数字来自 search-set candidates，并非最终 test score。结果表明，一段看似合理的总结不能代替可回溯证据。

## Q3. 从一个旧候选到一版新 harness，具体经过哪些步骤？

### 3.1 主循环的责任边界

<ol class="flow">
  <li><b>1 · READ</b><span>Proposer 检索历史 code、scores 与 raw traces。</span></li>
  <li><b>2 · DIAGNOSE</b><span>它提出失败原因与可证伪改动。</span></li>
  <li><b>3 · WRITE</b><span>生成新的单文件 Python harness。</span></li>
  <li><b>4 · VALIDATE</b><span>外层程序先做 import / interface check。</span></li>
  <li><b>5 · EVALUATE</b><span>固定 base model 在 search tasks 上运行。</span></li>
  <li><b>6 · LOG</b><span>新 code、score、trace 进入 filesystem。</span></li>
</ol>

论文中的一个典型 run 约 20 轮、评测 60 个候选。多目标场景不先把 accuracy 与 context cost 压成单一分数，而是保留 Pareto frontier。Test result 不回传给 proposer；最终只对 search 阶段留下的 frontier 做 test evaluation。

官方 classification release 把这些责任分得很清楚：`meta_harness.py` 先调用 Claude Code proposer，读取 `pending_eval.json`；随后单独 import-check 每个候选，再由 `benchmark.py` 评分、更新 frontier。`--test` 是显式 finalization 路径。这里的 test 隔离是**运行协议**，不靠访问控制实现。公开仓库中仍有 test data，复现实验时必须保持同样的流程纪律。

### 3.2 一个真实搜索 case：为什么 iteration 7 才找到有效方向

TerminalBench-2 的搜索日志给出了一条完整的因果链。起点 Terminus-KIRA 的 search score 是 64.4%。Iteration 1 同时做 marker stripping、loop breaker、prompt cleanup 和 checklist，降到 58.9%；Iteration 2 改 completion state machine，却继续沿用新 prompt，降到 57.8%。

到了 iteration 3，proposer 没有简单判断“结构修复无效”，而是发现两个失败候选共享的是 cleanup-heavy prompt：它会让 Agent 在任务真正结束前删除仍有用的状态。于是 iteration 3 恢复原 prompt，只保留 structural fixes，分数回到 63.3%。这仍低于 baseline，但回归大幅缩小，支持了 confound diagnosis。

Iterations 4 到 6 又尝试 completion flag 修复、弱化 cleanup 语言和 smart waiting，仍然回归。Iteration 7 因而换了策略：**不再碰已知脆弱的 prompt、completion flow 或 observation processing，只在第一次模型调用前追加环境快照。** Proposer 根据前六轮失败，把改动从“重写控制流”收缩为“额外提供信息”。

<div class="case">
  <h4>官方 artifact 中 `_gather_env_snapshot()` 到底收集什么</h4>
  <ol>
    <li>运行 `pwd`，列出 `/app`；超过 25 行时只保留前 20 个条目和剩余数量。</li>
    <li>查询 Python、GCC、G++、Node、Java、Rust 与 Go 版本。</li>
    <li>查询 `pip3`、`pip`、`apt-get` 与可用内存。</li>
    <li>内部命令超时 15 秒；外层 `asyncio.wait_for` 超时 20 秒。</li>
    <li>成功时把 `[Environment Snapshot]` 追加到 initial prompt；任何异常都返回空串或被捕获，Agent 回到原本的探索路径。</li>
  </ol>
</div>

<div class="code-scroll"><pre><code># 官方 agent.py 的忠实节选；为阅读删去 section parsing
result = await asyncio.wait_for(
    env.exec(command=bootstrap_cmd, timeout_sec=15),
    timeout=20,
)
snapshot = "[Environment Snapshot]\n" + format_sections(result.stdout)
if snapshot:
    initial_prompt = f"{initial_prompt}\n\n{snapshot}"
# 异常时 silent fallback，不阻断原 agent loop</code></pre></div>

这段改动让 Agent 少花 2 到 4 个 turns 用 `ls`、`which python3` 之类的命令摸环境，尤其帮助依赖 bioinformatics library、rendering pipeline、chess engine 或 crypto utility 的任务。论文报告，相比 Terminus-KIRA，它在 89 个任务中的 7 个上取得增益，最大改善出现在 `protein-assembly` 与 `path-tracing`。

<figure class="figure">
  <img src="/lib/papers/meta-harness/figure-9-tbench-harness.webp" alt="加入 environment bootstrap 的 TerminalBench-2 harness">
  <figcaption>原论文 Figure 9（CC BY 4.0）。绿色部分继承自 Terminus-KIRA；红色 environment bootstrap 是 Meta-Harness 搜索得到的主要新增模块。</figcaption>
</figure>

## Q4. 三组实验分别证明了什么？

### 4.1 在线分类：既提高 accuracy，也压低 context cost

作者用 GPT-OSS-120B 做固定分类模型，在 LawBench、Symptom2Disease 和 USPTO-50k 上搜索 40 个候选。最终 harness 的平均 test accuracy 为 **48.6%**，比 ACE 的 40.9% 高 **7.7 pp**，比 MCE 的 40.0% 高 8.6 pp；论文 Table 2 报告的 context 是 11.4K，而 ACE 为 50.8K。

<figure class="figure">
  <img src="/lib/papers/meta-harness/figure-4-curves.svg" alt="各类 text optimizer 的 search progress">
  <figcaption>原论文 Figure 4（CC BY 4.0）。在相同 Opus 4.6 proposer 与相同 candidate-evaluation budget 下，Meta-Harness 约四次评测追平 OpenEvolve / TTT-Discover 的最终水平。</figcaption>
</figure>

最终程序并非“再塞更多 few-shot”。它先列出有效 label，再为每个 label 取一条与 query 相关的 coverage example，最后补上局部相似但 label 不同的 contrastive pairs。九个 search 中未出现的 OOD datasets 上，平均 accuracy 为 73.1%，ACE 为 70.2%；Meta-Harness 在 6/9 个数据集上最好。

这里有一个原论文没有解释的记账冲突：**Table 2 把 context 标成 tokens，Figure 3 和 Appendix Table 9 却写 characters。** 因而“11.4K vs 50.8K”可以安全地视为论文内部同表比较，但不能把图表的横轴单位无条件当成 token 精确换算。

### 4.2 Math：有效的是 retrieval policy，不是“有 retrieval 就行”

Math search 用 GPT-OSS-20B 在 250 道 Olympiad-difficulty problems 上跑 40 轮，产生 109 个候选。最终 harness 先用关键词和 regex 把题路由到 combinatorics、geometry、number theory 或 algebra/other，再为不同 route 使用不同的 BM25、去重、difficulty reranking 和 sample count。

<figure class="figure">
  <img src="/lib/papers/meta-harness/figure-8-math-router.webp" alt="四路 math retrieval harness">
  <figcaption>原论文 Figure 8（CC BY 4.0）。四条 route 共用 BM25 基础设施，但选择、重排和示例数不同。</figcaption>
</figure>

最终评测是 200 道未见 IMO-level problems，每题采样三次后计算 pass@1。No Retriever 平均 34.1%，固定 BM25 为 37.5%，Meta-Harness 为 **38.8%**。五个模型列都比 no-retrieval 高，平均提升 **4.7 pp**。

不过论文把它写成“five held-out models”略显宽松：GPT-OSS-20B 同时用于 search 选 harness 和 final evaluation；真正没有参与 search 的 base models 是 GPT-5.4-nano、GPT-5.4-mini、Gemini-3.1-Flash-Lite 与 Gemini-3-Flash 四个。更准确的结论是：**harness 在未见题上有效，并迁移到了四个未见模型。**

### 4.3 TerminalBench-2：强结果，但不是 held-out task 泛化

这组实验从 Terminus 2 与 Terminus-KIRA 出发，在 TerminalBench-2 的全部 89 个公开任务上搜索；最终也在同一 89 题上评测。作者把它明确称为 discovery problem，并用人工检查和 regex audit 排查 task-specific string leakage，但没有独立 task split。

官方 artifact 报告 Claude Opus 4.6 上 **89 tasks × 5 trials = 445 trials**，总体 pass rate 76.4%；论文中的 Terminus-KIRA 是 74.7%。按难度分层，Easy 4 题为 100.0%，Medium 55 题为 81.1%，Hard 30 题为 64.7%。在 Claude Haiku 4.5 上，Meta-Harness 为 37.6%，高于当时列出的 Goose 35.5%。

因此这组结果能支持“自动搜索可以在一个公开、竞争激烈的 benchmark 上找到比强手写 harness 更好的实现”，**不能单独支持“这段 environment bootstrap 对未见 terminal tasks 也有相同增益”。**

## Q5. 对 Claude Code、Codex 这类完整 harness，最值得复用的是什么？

**History store 应当是一套可查询的证据库。** 对完整 coding agent，失败诊断往往需要同时查看旧代码、terminal transcript、tool result、timeout 与 evaluator output。目录结构、稳定命名和小型检索脚本，本身就是 optimizer 的一部分。

**Proposal 与 acceptance 需要分开。** Proposer 可以自由写代码，但不应自己控制 benchmark split、final test、timeout 处理和 frontier 更新。官方 release 里，提出候选、import validation、benchmark、frontier update 与 test finalization 都是独立阶段。这种分层也适用于日常 Claude Code / Codex harness 迭代。

**每次改动都应记录可反驳的 hypothesis。** TerminalBench 的日志同时保留了前六轮失败原因、共同变量和 iteration 7 选择 additive change 的理由。后续 Agent 因此可以沿证据链检查，而不是重复尝试同类修改。

<strong>评测要区分四种泛化：</strong>未见 example、未见 task/dataset、未见 base model、未见 benchmark/interface。这篇论文三个 domain 各自覆盖不同层级；以后如果优化 Claude Code 或 Codex 的 harness，至少要明确 search set、selection model 与 deployment environment 哪些重合。

<div class="note blue">
  <p><strong>一个直接可做的后续实验：</strong>固定同一批 coding tasks，把 Claude Code、Codex CLI 与一个极简 ReAct runner 同时作为被优化 harness；每套只在自己的 search split 上进化，再做 cross-harness × unseen-task 的完整矩阵。这样才能区分“找到了普适的环境信息策略”与“学会了某个 runner 的私有控制流”。</p>
</div>

## Q6. 最后怎样评价这篇论文？

**论文把“工程师翻日志改 harness”做成了一套简洁、完整的优化闭环。** 信息访问权交给强 coding agent，外层只负责验证和计分；scores-only、summary 与 raw-trace 消融则说明高带宽历史确实重要。TerminalBench 的 iterations 1 到 7 还给出了一条可追踪的失败归因过程。

但结论需要收窄：

<div class="limit-grid">
  <div><b>Proposer 单一</b><span>只研究 Claude Code + Opus 4.6。结果可能依赖 2026 年初 frontier coding agent 的工具使用与长程诊断能力。</span></div>
  <div><b>TerminalBench 无独立 split</b><span>同一 89 题用于 search 与 final score；leakage audit 不能替代 held-out tasks。</span></div>
  <div><b>Math 的“held-out models”措辞偏宽</b><span>五列里只有四个模型从未参与 search；GPT-OSS-20B 是 selection model。</span></div>
  <div><b>Context 单位不一致</b><span>分类 Table 2 写 tokens，Figure 3 与 Appendix Table 9 写 characters。</span></div>
  <div><b>代码是 cleaned release</b><span>官方 repo 明说整理后的代码只检查到“能运行”，不是完整 reproduction package。</span></div>
  <div><b>成本报告仍不完整</b><span>论文给出“数小时 wall-clock”与候选数，但没有统一披露三个 domain 的完整 token / dollar / compute cost。</span></div>
</div>

我的最终判断是：**Meta-Harness 很好地证明了 raw execution history 能把 coding agent 从“随机改代码”提升为“基于历史证据做局部实验”的 optimizer；它还没有证明同一搜索 recipe 能自动产生跨 benchmark 的通用 harness。** 对准备研究 Claude Code、Codex 等完整系统的人，这两句话都很重要：前一句给出可复用方法，后一句规定下一篇论文该补的实验。

<div class="note">
  <p><strong>来源说明：</strong>论文为 CC BY 4.0，本文复用的原图均在图注标明 Figure 编号。代码行为核查基于官方 `meta-harness` revision <code>0cbc31e</code> 与 `meta-harness-tbench2-artifact` revision <code>57fefdb</code>；代码库自述为 cleaned release，本文没有把它等同于完整训练日志。</p>
</div>

</div>

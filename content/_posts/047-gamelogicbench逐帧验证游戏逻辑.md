---
title: "GameLogicBench：如何逐帧验证 Coding Agent 写对了游戏逻辑"
permalink: "/posts/论文解读/gamelogicbench.html"
date: "2026-09-22T13:30:00+08:00"
updated: "2026-09-22T18:07:17+08:00"
cover: "/generated-covers/047-gamelogicbench.webp"
description: "从 Godot 的场景树与物理帧讲起，拆解 GameLogicBench 如何用 72 个任务、403 个手工场景、1,451 个测试用例和逐帧断言评测游戏逻辑。"
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
  - "Godot"
  - "游戏开发"
  - "软件测试"
---

<style>
html:not([data-theme="dark"]) body:has(.glb-reading){--paper:#fff;--paper-elevated:#f6f8fa;--ink:#20252d;--ink-soft:#66707c;--line:rgba(32,37,45,.11);--line-strong:rgba(32,37,45,.2);--glb-purple:#6652a3;--glb-teal:#117d72;background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:740px;margin-bottom:2.2rem}.article-shell-deck .article-header h1{max-width:25ch;margin:.72rem 0 1.05rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-deck>p{font-family:var(--sans);font-size:.93rem;line-height:1.65}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}.article-shell-deck .article-stats dd{font-family:var(--sans);font-variant-numeric:tabular-nums}
.glb-reading{--glb-column:740px;--glb-accent:var(--glb-purple);--glb-teal:var(--glb-teal);--glb-ink:var(--ink);--glb-soft:var(--ink-soft);--glb-surface:var(--paper-elevated);--glb-line:var(--line-strong);width:min(100%,var(--glb-column));margin-inline:auto;color:var(--glb-ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.78;-webkit-font-smoothing:antialiased}
.glb-reading>*{max-width:100%}.glb-reading p,.glb-reading li{text-wrap:pretty}.glb-reading .glb-paper-meta{margin:0 0 8px;color:var(--glb-soft);font:400 .8rem/1.6 var(--sans)}.glb-reading .glb-source-links{display:flex;flex-wrap:wrap;gap:7px 18px;margin:0 0 24px;font-size:.92em}.glb-reading .glb-source-links a{font-family:var(--sans)}.glb-reading .glb-lead{margin:0 0 24px;font-size:1.08em;line-height:1.78}
.glb-reading .glb-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:22px 0 30px;border-block:1px solid var(--glb-line)}.glb-reading .glb-metric{min-height:102px;padding:17px 14px;border-right:1px solid var(--glb-line)}.glb-reading .glb-metric:last-child{border-right:0}.glb-reading .glb-metric strong{display:block;color:var(--glb-accent);font:650 clamp(1.65rem,3vw,2.2rem)/1 var(--serif)}.glb-reading .glb-metric span{display:block;margin-top:10px;color:var(--glb-soft);font:600 .82rem/1.5 var(--sans)}
.glb-reading .glb-keypoints{margin:0 0 38px;padding:18px 22px;border-left:5px solid var(--glb-accent);background:color-mix(in srgb,var(--glb-accent) 6%,var(--glb-surface))}.glb-reading .glb-keypoints h3{margin:0 0 9px;font-size:1rem}.glb-reading .glb-keypoints ul{margin:0;padding-left:1.25rem}.glb-reading .glb-keypoints li{margin:.42rem 0}.glb-reading .glb-keypoints strong{color:var(--glb-ink);font-weight:760}
.glb-reading .glb-deck{margin:28px 0 38px;border-block:1px solid var(--glb-line);background:var(--glb-surface)}.glb-reading .glb-deck>summary{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:76px;padding:14px 16px;cursor:pointer;list-style:none}.glb-reading .glb-deck>summary::-webkit-details-marker{display:none}.glb-reading .glb-deck-title{display:grid;gap:3px}.glb-reading .glb-deck-title small{color:var(--glb-accent);font:800 .68rem/1.2 var(--mono);letter-spacing:.1em}.glb-reading .glb-deck-title strong{font-size:1rem}.glb-reading .glb-deck-action{color:var(--glb-accent);font:700 .8rem/1 var(--sans);white-space:nowrap}.glb-reading .glb-deck[open] .glb-deck-action::before{content:"收起";font-size:.8rem}.glb-reading .glb-deck[open] .glb-deck-action{font-size:0}.glb-reading .glb-player-shell{border-top:1px solid var(--glb-line);background:#20262d}.glb-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.glb-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.glb-reading .post-deck-embed-note{margin:0!important;padding:10px 14px!important;color:#cbd2d8!important;background:#20262d;border-top:1px solid #424950}.glb-reading .glb-deck-links{display:flex;justify-content:flex-end;padding:0 14px 13px;background:#20262d}.glb-reading .glb-deck-links a{color:#fff;padding:8px 12px;border:1px solid #ffffff4a;text-decoration:none;font:700 .78rem/1 var(--sans)}
.glb-reading .glb-part0{margin:34px 0 42px;padding:22px 24px;border-top:5px solid var(--glb-teal);background:var(--glb-surface)}.glb-reading .glb-part0 h3{margin:0 0 12px;font-size:1.38rem}.glb-reading .glb-kicker{display:block;margin-bottom:7px;color:var(--glb-teal);font:800 .72rem/1 var(--mono);letter-spacing:.1em}.glb-reading .glb-concept-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:20px 0;background:var(--glb-line)}.glb-reading .glb-concept{padding:16px;background:#fff}.glb-reading .glb-concept strong{display:block;margin-bottom:5px;color:var(--glb-accent)}.glb-reading .glb-concept span{display:block;color:var(--glb-soft);font-size:.9rem;line-height:1.62}
.glb-reading .glb-table-scroll{width:100%;margin:22px 0;overflow-x:auto}.glb-reading .glb-table-scroll table{display:table;width:100%;min-width:690px;margin:0;border-collapse:collapse;font:400 .875rem/1.55 var(--sans)}.glb-reading th,.glb-reading td{padding:9px 10px;border:1px solid var(--glb-line);text-align:left;vertical-align:top}.glb-reading th{background:color-mix(in srgb,var(--glb-accent) 8%,var(--glb-surface))}.glb-reading td:first-child{font-weight:650}.glb-reading code{font-size:.92em}
.glb-reading .glb-figure{width:100%;margin:26px 0}.glb-reading .glb-figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid color-mix(in srgb,var(--glb-line) 65%,transparent);border-radius:0;background:#fff;box-shadow:none}.glb-reading .glb-figure figcaption{max-width:680px;margin:8px auto 0;color:var(--glb-soft);font-size:.84rem;line-height:1.6;text-align:left}.glb-reading .glb-figure figcaption strong{color:var(--glb-ink)}
.glb-reading .glb-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--glb-line);list-style:none}.glb-reading .glb-flow li{min-height:126px;padding:14px;background:var(--glb-surface)}.glb-reading .glb-flow b{display:block;margin-bottom:7px;color:var(--glb-accent);font:750 .8rem/1.35 var(--sans)}.glb-reading .glb-flow span{display:block;color:var(--glb-soft);font-size:.84rem;line-height:1.58}
.glb-reading .glb-note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--coral);background:color-mix(in srgb,var(--coral) 7%,var(--glb-surface))}.glb-reading .glb-note.purple{border-color:var(--glb-accent);background:color-mix(in srgb,var(--glb-accent) 7%,var(--glb-surface))}.glb-reading .glb-note.teal{border-color:var(--glb-teal);background:color-mix(in srgb,var(--glb-teal) 7%,var(--glb-surface))}.glb-reading .glb-note p{margin:.35em 0}
.glb-reading .glb-trace{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--glb-line)}.glb-reading .glb-trace>div{padding:14px;background:#fff}.glb-reading .glb-trace b{display:block;color:var(--glb-accent);font-size:.79rem}.glb-reading .glb-trace span{display:block;margin-top:6px;color:var(--glb-soft);font-size:.82rem;line-height:1.5}
.glb-reading .glb-case{margin:24px 0;padding:18px 20px;border-block:1px solid var(--glb-line)}.glb-reading .glb-case h4{margin:0 0 8px;font-size:1.08rem}.glb-reading .glb-case-meta{margin:0 0 14px;color:var(--glb-soft);font-size:.86rem}.glb-reading .glb-case ol{padding-left:1.2rem}.glb-reading .glb-case li{margin:.55rem 0}.glb-reading .glb-verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--glb-line)}.glb-reading .glb-verdict div{padding:13px 15px;background:var(--glb-surface);font-size:.88rem;line-height:1.55}.glb-reading .glb-verdict strong{display:block;margin-bottom:4px;color:var(--glb-teal)}
.glb-reading .glb-evidence-details{margin:24px 0;border-block:1px solid var(--glb-line)}.glb-reading .glb-evidence-details>summary{display:flex;justify-content:space-between;gap:16px;padding:15px 2px;color:var(--glb-ink);cursor:pointer;font:700 .86rem/1.4 var(--sans)}.glb-reading .glb-evidence-details>summary span:last-child{color:var(--glb-soft);font-weight:500}.glb-reading .glb-gallery{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:8px 0 28px}.glb-reading .glb-gallery .glb-figure{margin:0}.glb-reading .glb-gallery .glb-figure img{width:100%}
.glb-reading>figure.highlight,.glb-reading>.highlight-container{width:100%;max-width:100%;margin-inline:0;contain:inline-size}.glb-reading pre{max-width:100%;overflow:auto;font-size:.84rem;line-height:1.68}.glb-reading .glb-code-label{display:block;margin:22px 0 0;color:var(--glb-soft);font:700 .76rem/1.4 var(--sans)}
@media(max-width:760px){.article-shell-deck .article-header{max-width:100%}.glb-reading .glb-metrics{grid-template-columns:1fr 1fr}.glb-reading .glb-metric:nth-child(2){border-right:0}.glb-reading .glb-metric:nth-child(-n+2){border-bottom:1px solid var(--glb-line)}.glb-reading .glb-flow,.glb-reading .glb-trace{grid-template-columns:1fr 1fr}.glb-reading .glb-flow li:last-child,.glb-reading .glb-trace>div:last-child{grid-column:1/-1}.glb-reading .glb-deck>summary{align-items:flex-start}.glb-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}.glb-reading .glb-gallery{grid-template-columns:1fr}.glb-reading .glb-verdict{grid-template-columns:1fr}}
@media(max-width:460px){.glb-reading .glb-flow,.glb-reading .glb-trace,.glb-reading .glb-concept-grid{grid-template-columns:1fr}.glb-reading .glb-flow li:last-child,.glb-reading .glb-trace>div:last-child{grid-column:auto}.glb-reading .glb-deck>summary{display:grid}.glb-reading .glb-deck-action{justify-self:start}.glb-reading .glb-metric{min-height:94px;padding:14px 11px}.glb-reading .glb-part0{padding:18px 16px}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,940px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="glb-reading">

<p class="glb-paper-meta">Xinyu Che, Yunfei Ge, Shihao Li, Yanchen Liu, Hang Yan, Xinping Lei et al. · arXiv:2609.21562v2 · 2026-09-21</p>

<div class="glb-source-links">
  <a href="https://arxiv.org/abs/2609.21562">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.21562">论文 PDF</a>
  <a href="https://github.com/NJU-LINK/GameLogicBench">官方评测框架</a>
  <a href="https://docs.godotengine.org/en/4.4/">Godot 4.4 文档</a>
</div>

<details class="glb-deck" id="interactive-deck" open>
  <summary>
    <span class="glb-deck-title"><small>INTERACTIVE PAPER DECK</small><strong>26 页交互图解：从 Godot 的物理帧到 mutant 校准</strong></span>
    <span class="glb-deck-action">展开阅读</span>
  </summary>
  <div class="glb-player-shell">
    <div class="post-deck-embed">
      <div class="post-deck-embed-frame">
        <iframe src="/lib/decks/gamelogicbench-visual-guide.html" title="GameLogicBench 论文图解，共 26 页" allow="fullscreen" loading="eager"></iframe>
      </div>
      <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机端建议横屏阅读</span></p>
    </div>
    <div class="glb-deck-links"><a href="/lib/decks/gamelogicbench-visual-guide.html">沉浸模式 ↗</a></div>
  </div>
</details>

<p class="glb-lead">一局游戏结束时看起来正确，不代表它在中途没有违规则。GameLogicBench 把这个差别变成了可重复执行的测试：Agent 在 Godot 项目里补上玩法逻辑；隐藏的判分程序（judge）选择不同场景和随机种子，在每一个 simulation tick（仿真更新步）检查位置、时间、资源和事件顺序是否始终满足规则。</p>

<div class="glb-metrics" aria-label="GameLogicBench 关键数字">
  <div class="glb-metric"><strong>72</strong><span>Godot gameplay-logic 任务</span></div>
  <div class="glb-metric"><strong>403</strong><span>人工设计的测试场景（scenario）</span></div>
  <div class="glb-metric"><strong>1,451</strong><span>scenario 经 seed 取值后得到的 test case</span></div>
  <div class="glb-metric"><strong>52.78%</strong><span>论文中最佳单次 solve rate</span></div>
</div>

<aside class="glb-keypoints" aria-label="阅读全文前需要记住的三个结论">
  <h3>先记住三件事</h3>
  <ul>
    <li><strong>GameLogicBench 评的是完整运行轨迹。</strong>最终抵达目标仍不够；中间任意一个 tick 触墙、超时或违反事件顺序，test case 就失败。</li>
    <li><strong>一次提交必须通过全部 scenario × seed。</strong>每个 test case 先独立判定，某一项 task 的所有计分 case 都通过，才记为 solved。</li>
    <li><strong>最佳单次结果是 38/72；只测公开 preview 会把平均 solve rate 高估 58.1 个百分点。</strong>隐藏场景负责区分“记住示例”和“实现规则”。</li>
  </ul>
</aside>

<section class="glb-part0" id="part-0-godot">
<span class="glb-kicker">PART 0 · READING PRIMER</span>

### 先认识 Godot：为什么这篇论文总在谈 Scene、Node 和 tick

Godot 用 scene（场景）和 node tree（节点树）组织游戏。角色可以是一个 `CharacterBody2D` 节点，下面挂着碰撞体、贴图和相机；关卡 scene 再把这棵角色树实例化进来。脚本通常附着在某个 node 上，通过引擎回调推进状态，再用 signal（信号）通知其他 node。Godot 官方文档把 node 称为游戏的基本构件，把 scene 描述为可保存、可重复实例化的 node tree。

<div class="glb-concept-grid">
  <div class="glb-concept"><strong>Scene / Node tree</strong><span>场景是节点树；节点负责渲染、物理、声音、输入等具体工作。换一个节点或连线，就可能改变整条运行路径。</span></div>
  <div class="glb-concept"><strong>GDScript</strong><span>Godot 自带的脚本语言。论文只评测 Godot 4.4 与 GDScript，不覆盖 C#、C++ 或其他引擎。</span></div>
  <div class="glb-concept"><strong>Simulation tick</strong><span>引擎推进一次仿真的离散步骤。物理逻辑通常写在 <code>_physics_process(delta)</code> 中；论文的 judge 以固定 timestep 运行并逐 tick 断言。</span></div>
  <div class="glb-concept"><strong>Signal</strong><span>节点发出的事件消息。例如角色受伤后发出 <code>health_changed</code>，UI 订阅后更新血条，不需要把 UI 写死进角色脚本。</span></div>
</div>

下面是一段可以挂到 `CharacterBody2D` 的 Godot 4.x 脚本。它故意很小，却包含了这篇论文关心的三类东西：每个物理帧读取输入、更新速度和位置；生命值变化时发出事件；外部代码能从公开状态读取行为结果。

<span class="glb-code-label">player.gd · Godot 4.x</span>

```gdscript
extends CharacterBody2D

signal health_changed(value: int)

@export var speed := 220.0
var health := 3

func _physics_process(_delta: float) -> void:
    var direction := Input.get_vector("left", "right", "up", "down")
    velocity = direction * speed
    move_and_slide()

func take_damage(amount: int) -> void:
    health = max(health - amount, 0)
    health_changed.emit(health)

func snapshot() -> Dictionary:
    return {
        "position": global_position,
        "velocity": velocity,
        "health": health
    }
```

如果只在最后读取 `health == 3`，就看不出它是否曾被错误地扣到 2、又被另一段代码补回 3。逐 tick 评测会检查完整轨迹：每一步发生了什么、何时发生、不同系统是否同时遵守约束。这正是 GameLogicBench 选择游戏逻辑作为研究对象的原因。

背景资料来自 Godot 4.4 官方文档的 [Nodes and Scenes](https://docs.godotengine.org/en/4.4/getting_started/step_by_step/nodes_and_scenes.html) 与 [Using signals](https://docs.godotengine.org/en/4.4/getting_started/step_by_step/signals.html)；上面的示例是为本文写的最小示意，不是论文任务代码。
</section>

## Q1: 这篇论文试图解决什么问题？

很多游戏规则约束的不是终点，而是到达终点的过程。设想一个资源系统：第 30 帧扣掉 10 单位资源，第 31 帧又错误地多加 10；结束时余额与正确实现相同。如果评测只看最后一帧，它会把这段错误轨迹当成正确。类似问题也会出现在 cooldown（冷却时间）、移动碰撞、跳跃落地、状态机切换和同一帧内的多个请求中。

现有游戏开发 benchmark 常见三种判法：复播一条固定示例、看最终视频或截图、让另一个模型操作并打分。它们各有用处，但没有同时提供下面三项能力：

- judge 自己选择多个合法场景，而不是只看 Agent 已见过的 preview；
- 在运行过程的多个 tick 读取状态和事件历史，而不是只核对最后结果；
- 判分路径中没有语言模型，使同一提交、场景与 seed 可以得到完全一致的 verdict（判定）。

GameLogicBench 不评价“这款游戏好不好玩”，也不评价美术和关卡内容。它只检查一件事：Agent 补上的 gameplay logic，能否在多种合法运行条件下始终遵守预先写好的规则。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-2-overview.png"><img src="/lib/papers/gamelogicbench/figure-2-overview.png" alt="GameLogicBench 的任务层级、求解与评测流程以及 Claude Code 下的模型结果"></a>
  <figcaption><strong>原论文 Figure 2。</strong>左侧把任务分成 Atom、Combo、Repo；中间是隔离的 SOLVE 与 JUDGE；右侧是 Claude Code 下各模型的单次 solve rate。点击查看原尺寸。</figcaption>
</figure>

## Q2: 有哪些相关研究？

先区分两类任务。GameCraft-Bench、WebGameBench 等评测完整游戏能否生成、能否玩、视觉是否符合要求；GameLogicBench 给 Agent 一个可运行的 Godot 项目，只让它补上指定机制，再用 engine assertion（引擎内断言）验收。GameLogicBench 的覆盖面较窄，但每个 verdict 都能复现，也能定位运行途中发生的违规。

<div class="glb-table-scroll">
<table>
  <thead><tr><th>Benchmark</th><th>产物 / 任务</th><th>判定方式</th><th>确定性</th><th>跨 tick</th><th>每题 scenario</th></tr></thead>
  <tbody>
    <tr><td><a href="https://www.swebench.com/">SWE-bench</a></td><td>软件仓库 patch</td><td>Unit tests</td><td>是</td><td>不适用</td><td>不适用</td></tr>
    <tr><td>Terminal-Bench 2.0</td><td>终端任务，生成或 patch</td><td>Unit tests</td><td>是</td><td>不适用</td><td>不适用</td></tr>
    <tr><td>WebCompass</td><td>Chromium / JS，生成或 patch</td><td>Agent judge</td><td>否</td><td>不适用</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>浏览器游戏，从头生成</td><td>Agent judge</td><td>否</td><td>否</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2602.11103">GameDevBench</a></td><td>Godot / GDScript，真实项目 patch</td><td>Test scripts</td><td>是</td><td>部分任务</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.19830">JAMER</a></td><td>Godot / GDScript，生成或 patch</td><td>Engine verify</td><td>是</td><td>否</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>完整 Godot 游戏，从头生成</td><td>VLM judge</td><td>否</td><td>否</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2607.03525">GameEngineBench</a></td><td>UE5 / C++，真实项目 patch</td><td>Tests + LLM judge</td><td>否</td><td>部分任务</td><td>1</td></tr>
    <tr><td>AutoUE</td><td>UE5 / C++，从头生成</td><td>LLM judge</td><td>否</td><td>否</td><td>1</td></tr>
    <tr><td>GameLogicBench</td><td>Godot / GDScript，生成项目或真实项目 patch</td><td>Engine assertions</td><td>是</td><td>全部任务</td><td>2–12</td></tr>
  </tbody>
</table>
</div>

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/table-1-comparison.png"><img src="/lib/papers/gamelogicbench/table-1-comparison.png" alt="原论文 Table 1：运行中产物 benchmark 的评测设计对比"></a>
  <figcaption><strong>原论文 Table 1。</strong>“Deterministic”“Tick-level”“Scenarios”是本文用来定位相关工作的三条主轴。表中的圆圈表示只有部分任务满足，不是完全支持。</figcaption>
</figure>

这张比较表需要保留一个边界：它比较的是作者选取的、会直接判断运行中产物的 benchmark，不是所有代码 benchmark 的完整综述；“本文唯一同时具备三项性质”也只在这组对照里成立。

## Q3: 论文如何解决这个问题？

这一节按实际发生顺序展开：**先定义 task，再说明 task 如何进入 benchmark，随后划清 Agent 与 judge 的信息边界，最后跟着一次 submission 看判分。**

### 先确定评测单位：一道 task 包含什么

GameLogicBench 的一道 task 不只是一段需求文字。完整的评测单位包含五部分：写明规则与接口的 brief、可运行的 Godot 项目、一个公开 preview、Agent 可以提交的文件范围，以及只在判分阶段出现的 hidden scenarios、seeds 与 judge。Agent 要交付的是指定 GDScript 或组件；**judge 只根据运行状态和事件记录判行为，不要求某种内部代码结构。**

三个 tier 描述的是需要接入多少现有系统：

- **Atom**：在为 benchmark 新做的最小游戏里隔离一个机制，例如敌人寻路；21 题。
- **Combo**：仍是最小游戏，但几个机制会在时间、空间或并发调用中互相影响，例如巡逻、视线、跳跃和追逐同时成立；28 题。
- **Repo**：在真实开源 Godot 项目中补回一个组件，需要读懂现有调用方、动画、相机、数据资源和共享状态；23 题。

三类任务不是难度标签，而是 integration scope（集成范围）。论文的数据确实显示 Repo 更难，但不能反过来把所有 Repo 都理解成“难题”，也不能把 Atom 理解成简单算法题。

### 72 道 task 从哪里来

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-3-construction.png"><img src="/lib/papers/gamelogicbench/figure-3-construction.png" alt="GameLogicBench 的任务构建与验证流水线"></a>
  <figcaption><strong>原论文 Figure 3。</strong>人类负责入口筛选和最终录取；Agent 辅助完成 feasibility、blueprint、implementation 与 independent review。所有 Agent 产物仍要经过校准和人工复核。</figcaption>
</figure>

<ol class="glb-flow" aria-label="从候选机制到评测任务的五个阶段">
  <li><b>01 · SOURCING</b><span>从开源 Godot 项目、已发布游戏和功能能力 taxonomy 收集候选机制。</span></li>
  <li><b>02 · SCREENING</b><span>三名人工标注者判断规则能否写成唯一值、合法事件顺序或守恒量。</span></li>
  <li><b>03 · BUILD</b><span>Agent 依次做可行性试验、blueprint 和可执行 task / judge。</span></li>
  <li><b>04 · CALIBRATE</b><span>用正确解、等价正确解、naive 解和 mutants 检查 judge。</span></li>
  <li><b>05 · REVIEW</b><span>独立 review agent 复跑，再由三名人工标注者录取、退修或淘汰。</span></li>
</ol>

作者先收集约 200 个候选机制。三名人工标注者筛掉无法确定性判定的想法；Agent 再协助完成可行性试验、任务蓝图、Godot 项目和 judge。122 个候选走完构建、校准与独立 Agent review，三名标注者最终录取 72 个。这里的“标注”不是给现成样本贴标签，而是**把自然语言规则做成可执行场景和断言，再用正确与错误实现反复校准。**

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-4-statistics.png"><img src="/lib/papers/gamelogicbench/figure-4-statistics.png" alt="GameLogicBench 的游戏类型、能力场景与 token 规模"></a>
  <figcaption><strong>原论文 Figure 4。</strong>72 题覆盖 12 种来源类型。403 个 scenario 可以同时标记多个能力类别，因此中间七根柱子的数量之和大于 403。右图表明在配对设置下，GameLogicBench 的输出 token 约为 GameDevBench 的 15 倍，非缓存输入接近 4 倍。</figcaption>
</figure>

每道任务有 2–12 个 scenario、10–38 个 test case。Repo 平均含 209 个游戏文件、17,599 行游戏代码；Atom 与 Combo 平均都只有 5 个游戏文件，代码量分别为 316 与 421 行。这个规模差解释了 Repo 的主要额外负担：Agent 要先找到真正控制行为的位置，还得维持周边系统依赖的接口与共享状态。

### Agent 可以看见什么，judge 隐藏什么

每题给 Agent 一个任务说明和 Godot 项目，其中有可运行的 preview 与调试输出。Agent 知道功能规则、允许修改的文件、接口和“场景每次会重新生成”等事实；它只看到一个公开的 baseline scenario（基线场景）。隐藏 judge 使用同一接口，但会选择其他布局、输入序列、调用顺序和 seed。隐藏的是具体测试实例与 judge 代码，不是另外一套规则。

<div class="glb-trace" aria-label="GameLogicBench 信息与执行边界">
  <div><b>BRIEF</b><span>告诉 Agent 要实现的行为、接口和可修改文件。</span></div>
  <div><b>PREVIEW</b><span>一个公开 scenario，可换 seed 运行并查看调试输出。</span></div>
  <div><b>PATCH</b><span>Agent 只交付指定脚本及允许的 helper。</span></div>
  <div><b>HIDDEN JUDGE</b><span>换 scenario、seed、调用时序，并读取运行状态。</span></div>
  <div><b>VERDICT</b><span>只要任何一个 test case 破坏规则，任务失败。</span></div>
</div>

### Judge 怎样执行一次 submission

求解和判分在两个独立、断网的容器里进行。Agent 交付一次 submission 后，judge 按下面六步给出 verdict：

1. solve container 把 brief、Godot 项目和公开 preview 交给 Agent；Agent 可以运行、调试并重新选择 preview seed。
2. 求解结束后，harness 复制 Agent 的 workspace，交给另一个 judge container。
3. harness 按 <code>game → solution → judge</code> 的顺序组装评测项目。冻结的 judge 文件最后覆盖，因此 Agent 在求解阶段改动同名文件也不会改变判分逻辑。
4. judge 遍历每个 scored scenario 及其 seeds。scenario 规定测试结构，seed 把高度、距离、时间等参数实例化，二者共同产生一个 test case。
5. 每个 test case 都用 fixed timestep 推进。judge 可以改变接口允许的 call schedule，包括 concurrent calls、re-entry 和 stretched time base，并在每个 tick 读取 runtime state 与 event history。
6. tick-level 与终局断言全部满足才输出 PASS。运行时、submission、scenario、seed 和 judge 文件相同，verdict 也相同；评分路径中没有语言模型。

官方仓库目前公开了评测 harness，没有公开 72 道题各自的 checker。可以直接核查的部分包括双容器隔离、workspace 复制、<code>game → solution → judge</code> 覆盖顺序和 seed 传入方式。论文链接的 <code>GameLogicBench-Tasks</code> 仓库截至 2026-09-22 返回 404，因而**已知的是统一执行协议和论文公开的 task brief；未知的是每道题的完整断言实现。**

下面是根据论文 Evaluation Protocol 重写的伪代码，用来表示判分顺序。它不是官方 task-specific judge 源码。

```gdscript
for scenario in hidden_scenarios:
    for seed in scenario.seeds:
        var run = launch_fixed_timestep(scenario, seed)
        while not run.finished:
            apply_allowed_calls(scenario.schedule_for(run.tick))
            run.advance_one_tick()
            var state = read_runtime_state(run)
            var events = read_event_history(run)
            assert(scenario.tick_rules_hold(state, events))
        assert(scenario.terminal_rules_hold(run))
```

### 真实 case 1：Atom / Enemy Navigation

<div class="glb-case">
  <h4>Enemy Navigation：终点正确，路径仍可能失败</h4>
  <p class="glb-case-meta">一手来源：论文 Appendix F.2 的完整 task brief；统一执行协议来自 Evaluation Protocol。</p>
  <ol>
    <li><strong>Agent 收到什么：</strong>一个固定 preview，以及 <code>self_pos</code>、<code>goal_pos</code>、角色 <code>radius</code>、<code>world</code>、<code>nav_map</code>、<code>dt</code> 和累计时间 <code>t</code>。</li>
    <li><strong>Agent 实现什么：</strong>只提交 <code>res://logic/controller.gd</code> 及其 helper。<code>decide(state) -&gt; Vector2</code> 每个 physics frame 返回方向；非零向量会被归一化，角色沿该方向前进固定距离，<code>Vector2.ZERO</code> 表示停留。</li>
    <li><strong>Judge 怎样准备场景：</strong>arena 由程序生成，墙、门洞、起点和终点会改变；不同 seed 再给这些参数取值。公开 brief 承诺的是规则，Agent 看不到计分布局。</li>
    <li><strong>Judge 观察什么：</strong>固定 timestep 下逐帧检查圆形角色是否接触墙体，结束前再检查是否在时限内到达目标。角色半径算进碰撞，擦到墙角也失败。</li>
  </ol>
  <div class="glb-verdict"><div><strong>PASS</strong>每个计分 seed 都按时到达，且从起点到终点没有任何一帧触墙。</div><div><strong>FAIL</strong>路径只按角色中心点规划，没有为半径留余量；角色在某一帧擦过门洞角落，之后即使到达终点，这个 test case 仍是 FAIL。</div></div>
  <p class="glb-case-meta">证据边界：碰撞与到达条件来自公开 brief；最后一格是按该条件写出的具体失败轨迹，不是作者公开的模型运行日志。task-specific checker 源码未公开。</p>
</div>

这个 case 把 terminal-only（只看最终状态）的盲点说得很直接：终局只有“已抵达”，逐 tick 轨迹里却保留了先触墙再到达的违规。

### 真实 case 2：Combo / Platform Guard

<div class="glb-case">
  <h4>Platform Guard：state 里有坐标，不等于角色看得见</h4>
  <p class="glb-case-meta">一手来源：论文 Appendix F.3 的完整 task brief；统一执行协议来自 Evaluation Protocol。</p>
  <ol>
    <li><strong>Agent 收到什么：</strong>角色位置和速度、是否着地、全部平台和 tower、home platform、<code>vision_range</code>，以及所有 intruder 的真实坐标。<code>intruders</code> 是完整名单，不能直接当作“已看见目标”。</li>
    <li><strong>Agent 实现什么：</strong><code>decide(state)</code> 每帧返回 <code>{"move": float, "jump": bool, "chasing": int}</code>。安静期要覆盖 home platform 至少 <strong>34%</strong> 的可行走范围；看见目标后要在地面上接近至 <strong>130 units</strong>；环境恢复安静后要在 <strong>6 秒</strong>内回家。</li>
    <li><strong>Judge 怎样准备场景：</strong>程序改变平台宽度、gap、出生点和访客时序，还会放置遮挡视线的 tower。一次 watch 共 1,800 frames，即 <strong>30 秒、60 Hz</strong>。</li>
    <li><strong>Judge 观察什么：</strong>每帧记录 fall、ghost chase、unconfronted visitor、overstayed absence 与 patrol coverage。进入 130 units 时若仍在空中，不算完成 confrontation。</li>
  </ol>
  <div class="glb-verdict"><div><strong>PASS</strong>所有 seed 中，巡逻覆盖、视线判断、落地 confrontation 与及时返回都持续满足 brief。</div><div><strong>FAIL</strong>一个 intruder 出现在 tower 后方。controller 因为 <code>intruders</code> 列表含有它就填入 <code>chasing=id</code>；judge 同一帧确认射线被 tower 挡住，记录 ghost chase。</div></div>
  <p class="glb-case-meta">证据边界：数值、state 字段和错误类别都来自公开 brief；失败轨迹按其中的 ghost-chase 定义展开。隐藏场景参数与 checker 源码未公开。</p>
</div>

### 真实 case 3：Repo / AMSG Character Movement

<div class="glb-case">
  <h4>AMSG Character Movement：能从正面上台阶，不代表组件写对了</h4>
  <p class="glb-case-meta">一手来源：论文 Appendix F.4 的完整 task brief，以及正文 §3 的公开/隐藏 scenario 示例。</p>
  <ol>
    <li><strong>Agent 收到什么：</strong>一个真实第三人称角色 kit 和缺少方法体的 <code>CharacterMovementComponent.gd</code>。类、export、状态字段与方法签名冻结；动画、相机、PlayerController 和其他组件都在读写这个接口。</li>
    <li><strong>Agent 实现什么：</strong>三种 gait、松开输入后的减速、蹲伏与头顶阻挡、全方向台阶、落地跳跃，以及离地 <strong>0.1 秒</strong>后才确认 falling。调用方有输入时每 step 调 <code>add_movement_input(...)</code>，松开后停止调用；<code>rotation_mode</code>、<code>gait</code> 和 <code>stance</code> 可在移动中被外部组件改写。</li>
    <li><strong>Judge 怎样准备场景：</strong>公开 preview 让角色沿 <code>+X</code> 走上合法台阶。论文披露的计分 scenario 改为沿 <code>-X</code> 接近，合法台阶后面还有一堵超过最大 stair height 的墙。</li>
    <li><strong>Judge 观察什么：</strong>角色要从不同方向爬上合法高度，同时不能把高墙误判成台阶。动画和控制组件还会持续读取速度、姿态与空中状态，因此冻结接口也不能被破坏。</li>
  </ol>
  <div class="glb-verdict"><div><strong>PASS</strong><code>-X</code> 场景中能登上合法台阶，却不会跨上后方的过高墙体；接口与运动状态仍符合调用方契约。</div><div><strong>FAIL</strong>实现把探测射线写死在 <code>+X</code>。它能通过 preview；换成 <code>-X</code> 后探测仍朝 <code>+X</code>，角色撞在合法台阶上，计分 case 失败。</div></div>
  <p class="glb-case-meta">证据边界：方向变化和高墙来自论文披露的真实计分场景；最后一格把“方向写死”具体化为失败轨迹。完整 task-specific checker 仍未公开。</p>
</div>

### 分数怎样从 tick 汇总到 72 道题

看完三个 case，再把 PASS/FAIL 汇总成榜单分数。GameLogicBench 使用严格的四层合取关系：

1. **Test case PASS**：这个 scenario × seed 的所有逐 tick 断言和终局断言都成立。
2. **Scenario strict pass**：该 scenario 的每个 seed 都 PASS。
3. **Task solved**：该 task 的所有计分 test case 都 PASS；任何一个 case 失败，整题记为 unsolved。
4. **Solve rate = solved tasks / 72**。没有可判定 solution 的运行和不可用的 computation 都算失败，不会从分母中剔除。

因此，1,451 个 test case 不是被摊成一个“平均通过率”。它们先在各自 task 内做严格合取，再统计 72 道题里解出了多少道。Figure 8 的能力分数采用另一种分组：一个 scenario 的所有 seed 先严格通过，然后在带有对应能力标签的 scenario 上汇总。scenario 可以有多个标签，所以七类能力的分母不能相加。

### Checker calibration：减少误杀与漏判

一套测试只跑过 reference solution，可能把变量名、控制流程或某个偶然数值误当成正确性的必要条件。GameLogicBench 用四类 calibration artifact 检查两件事：正确行为会不会被误杀，缺失能力的实现能不能漏过。

<div class="glb-table-scroll">
<table>
  <thead><tr><th>校准样例</th><th>必须得到的结果</th><th>它在检查什么</th></tr></thead>
  <tbody>
    <tr><td>proper solution</td><td>所有 scenario 与 seed 都通过，并离容差边界有余量</td><td>任务确实可解</td></tr>
    <tr><td>behavior-preserving control</td><td>通过</td><td>内部结构不同，只要可观察行为相同，也应被接受</td></tr>
    <tr><td>naive solution</td><td>失败</td><td>常见的“看似能跑”实现不能蒙混过关</td></tr>
    <tr><td>single-capability mutant</td><td>至少被一个专门 scenario 抓住</td><td>每次只删一项能力，验证 judge 对这项缺失确实敏感</td></tr>
  </tbody>
</table>
</div>

这一步确实改过判分。作者在 36 题审计子集上回看修补前的 criterion：<strong>666 个 mutant 中有 127 个错误实现通过，暴露出 19 道任务里的 24 个缺失检查。</strong>修补后，9 个模型 × 2 个 scaffold 的历史提交里，有 3 个结果从 PASS 变为 FAIL，涉及 2 道任务和 3 个模型；proper solution 与 behavior-preserving control 仍然通过。换句话说，mutant calibration 不只是流程说明，它修复了会改动榜单的 judge 漏洞。

## Q4: 做了哪些实验？效果如何？

### 实验设置

作者测试了 20 个 model + scaffold 组合。scaffold 是承载模型、提供读文件、改代码和执行命令等工具的 Agent 框架；论文使用 Claude Code 2.1.177、Codex 0.144.1 和 OpenCode 1.17.18。所有配置使用 `effort=high`，每题上限 3,600 秒，求解与判分都运行 Godot 4.4。主表中的每个组合只运行一次，因此它是 observed result（观察到的一次结果），不能当作稳定的模型能力估计。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/table-3-results.png"><img src="/lib/papers/gamelogicbench/table-3-results.png" alt="原论文 Table 3：20 个模型与 scaffold 组合的分层通过率、轮数和成本"></a>
  <figcaption><strong>原论文 Table 3。</strong>最佳单次结果是 Claude-Opus-5 + Claude Code：38/72，即 52.78%。同一模型换 scaffold 后差异很大，例如 Qwen-3.8-Max 从 26.39% 到 44.44%，因此论文强调比较单位应是 model + scaffold 这套完整配置。</figcaption>
</figure>

### 结果 1：集成范围越大，所有模型都明显掉分

固定 Claude Code 后，12 个模型都从 Atom 到 Combo、再到 Repo 下降。聚合 solve rate 是 <strong>45.2% → 31.5% → 21.7%</strong>。与此同时，平均 turn 增加，Agent 启动 Godot 的次数更多，重新选择 preview seed 的 session 比例从 Atom 的 38.9% 上升到 Repo 的 55.8%。Agent 确实在尝试运行反馈，但项目范围扩大后，它们仍然难以同时满足全部规则。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-5-tier.png"><img src="/lib/papers/gamelogicbench/figure-5-tier.png" alt="原论文 Figure 5：任务层级对 solve rate、轮数、运行实验和工具调用的影响"></a>
  <figcaption><strong>原论文 Figure 5。</strong>从 Atom 到 Repo，检查代码的 tool call 明显增加；修改和执行调用主要在 Atom → Combo 阶段增加。</figcaption>
</figure>

### 结果 2：多数失败项目能运行，但机制行为不合格

作者把失败 scenario 分成三类：<strong>74.3% 是 mechanism failure（机制失败）</strong>，即提交可以运行和判分，但行为违反了契约；17.2% 没有可判定的提交；8.5% 的求解过程本身不可用。把全部配置和 scenario 合并统计后，Engine contract 的 strict pass rate 为 88.75%，在 20 个配置中的 19 个排第一；Commitment、Spatial 与 Timing 只有 53.4%–58.57%，在 20 个配置中的 17 个排倒数三位。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-8-capabilities.png"><img src="/lib/papers/gamelogicbench/figure-8-capabilities.png" alt="原论文 Figure 8：20 个配置在七类能力上的严格场景通过率"></a>
  <figcaption><strong>原论文 Figure 8。</strong>“会用 Godot 的时钟和求解器”通常不是瓶颈；难的是让决策承诺、空间约束和时间不变量在完整运行中持续成立。每个 scenario 可以属于多个能力类别。</figcaption>
</figure>

### 结果 3：删掉逐帧检查或隐藏场景，分数会被大幅高估

在 36 题审计集上，作者固定同一批 666 个 mutant 和 20 个配置产生的 720 份提交，分别做两种消融：

- **Terminal-only**：保留所有 scenario 与 seed，但只看终局。236/666 个 mutant 逃过检查，34/36 题至少漏掉一个 mutant；原本失败的提交中有 64/488 被误判为通过，平均 solve rate 增加 8.9 个百分点。
- **Preview-only**：保留完整逐 tick criterion，但只跑公开 preview。508/666 个 mutant 逃过检查，36/36 题都有漏网；418/488 个原本失败的提交被误判为通过，平均 solve rate 增加 58.1 个百分点。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/table-5-ablation.png"><img src="/lib/papers/gamelogicbench/table-5-ablation.png" alt="原论文 Table 5：仅终态和仅公开场景的评测消融"></a>
  <figcaption><strong>原论文 Table 5。</strong>逐 tick 与多 scenario 不是两种可替代方案：前者防止“中途错、结尾对”，后者防止“只对已见示例过拟合”。</figcaption>
</figure>

### 结果 4：同一模型换一个 scaffold，表现和工具使用都会变

Qwen-3.8-Max 在三个 scaffold 下分别得到 44.44%、26.39% 和 29.17%；GPT-5.6-Sol 则是 41.67%、34.72% 和 34.72%。Codex 平均 turn 最少，Qwen-3.8-Max 与 GPT-5.6-Sol 在 Codex 下的各分位 tool call 也更少，但“交互少”并不稳定对应更高或更低的分数。模型与框架是共同起作用的系统，单独按模型名字排榜会掩盖这个差异。

### 结果 5：开放网络会让 Repo 题变成源码检索题

作者另外让五个配置在 Repo 题上开放网络，并审阅 URL、查询和命令轨迹。四个配置确实找到了上游源码，而且人工检查发现了直接复用；这四个配置的 Repo 成绩都高于各自的断网版本。最大增幅是 Kimi-K3 + Claude Code，从 3 题增加到 12 题（+9）。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-7-retrieval.png"><img src="/lib/papers/gamelogicbench/figure-7-retrieval.png" alt="原论文 Figure 7：开放网络时的上游源码检索与 Repo 成绩变化"></a>
  <figcaption><strong>原论文 Figure 7。</strong>断网不是为了人为增加难度，而是避免 benchmark 已知源项目被直接检索和复制。第五个配置没有尝试检索，成绩也没有变化。</figcaption>
</figure>

<details class="glb-evidence-details">
  <summary><span>完整原始图表索引</span><span>论文的 9 张 Figure 与 12 张编号 Table 均有记录</span></summary>
  <div class="glb-gallery">
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-1-cost.png"><img src="/lib/papers/gamelogicbench/figure-1-cost.png" alt="Figure 1 成本与 solve rate"></a><figcaption><strong>Figure 1。</strong>20 个配置的成本与 solve rate；标出的 frontier 只是观察描述，不是新的排名指标。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-2-overview.png"><img src="/lib/papers/gamelogicbench/figure-2-overview.png" alt="Figure 2 benchmark 总览"></a><figcaption><strong>Figure 2。</strong>任务层级、求解、判分和 Claude Code 结果。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-3-construction.png"><img src="/lib/papers/gamelogicbench/figure-3-construction.png" alt="Figure 3 构建流程"></a><figcaption><strong>Figure 3。</strong>任务构建与验证流程。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-4-statistics.png"><img src="/lib/papers/gamelogicbench/figure-4-statistics.png" alt="Figure 4 benchmark 统计"></a><figcaption><strong>Figure 4。</strong>来源类型、能力覆盖与 token 规模。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-5-tier.png"><img src="/lib/papers/gamelogicbench/figure-5-tier.png" alt="Figure 5 tier 效应"></a><figcaption><strong>Figure 5。</strong>tier 对成功率、运行试验和工具调用的影响。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-6-tools.png"><img src="/lib/papers/gamelogicbench/figure-6-tools.png" alt="Figure 6 scaffold 工具调用"></a><figcaption><strong>Figure 6。</strong>三个 scaffold 的调用量与操作类型。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-7-retrieval.png"><img src="/lib/papers/gamelogicbench/figure-7-retrieval.png" alt="Figure 7 上游源码检索"></a><figcaption><strong>Figure 7。</strong>开放网络后的源码检索与 Repo 成绩变化。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-8-capabilities.png"><img src="/lib/papers/gamelogicbench/figure-8-capabilities.png" alt="Figure 8 能力通过率"></a><figcaption><strong>Figure 8。</strong>七类能力的 strict scenario pass rate。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-9-coverage.png"><img src="/lib/papers/gamelogicbench/figure-9-coverage.png" alt="Figure 9 每题覆盖矩阵"></a><figcaption><strong>Figure 9。</strong>20 个配置在 72 个具体任务上的成败矩阵。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-2-composition.png"><img src="/lib/papers/gamelogicbench/table-2-composition.png" alt="Table 2 tier 规模"></a><figcaption><strong>Table 2。</strong>三类任务的项目文件、代码行与正确解规模。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-4-variance.png"><img src="/lib/papers/gamelogicbench/table-4-variance.png" alt="Table 4 重复运行方差"></a><figcaption><strong>Table 4。</strong>三个配置重复三次后的 pass@1、pass@3、worst@3 与标准差。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-6-model-card.png"><img src="/lib/papers/gamelogicbench/table-6-model-card.png" alt="Table 6 模型价格"></a><figcaption><strong>Table 6。</strong>实验计算成本时使用的发布时间与当时价格。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-7-capabilities.png"><img src="/lib/papers/gamelogicbench/table-7-capabilities.png" alt="Table 7 七类能力定义"></a><figcaption><strong>Table 7。</strong>七类 gameplay-logic 能力的正式定义。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-8-tool-profile.png"><img src="/lib/papers/gamelogicbench/table-8-tool-profile.png" alt="Table 8 工具使用"></a><figcaption><strong>Table 8。</strong>20 个配置的平均 tool-use profile。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-9-tool-quantiles.png"><img src="/lib/papers/gamelogicbench/table-9-tool-quantiles.png" alt="Table 9 工具调用分位数"></a><figcaption><strong>Table 9。</strong>三个跨 scaffold 模型的 tool-call 分位数。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-10-bash.png"><img src="/lib/papers/gamelogicbench/table-10-bash.png" alt="Table 10 Bash 操作"></a><figcaption><strong>Table 10。</strong>Bash 调用按 inspect、execute、modify 及组合分解。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-11-tokens.png"><img src="/lib/papers/gamelogicbench/table-11-tokens.png" alt="Table 11 token 使用"></a><figcaption><strong>Table 11。</strong>各配置每题平均输入、缓存读取、输出与复用比例。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-12-cache.png"><img src="/lib/papers/gamelogicbench/table-12-cache.png" alt="Table 12 Claude Code 缓存流量"></a><figcaption><strong>Table 12。</strong>Claude-Opus-5 与 Claude-Sonnet-5 的 cache write / read。</figcaption></figure>
  </div>
</details>

## Q5: 有哪些值得继续探索的问题？

第一，扩大可测范围。当前 benchmark 主动排除了依赖审美和体验的规则，只覆盖能写成确定性状态断言的 gameplay logic。美术质量、节奏、关卡趣味和完整玩家体验仍要由其他 benchmark 补上；未来也可以加入更长交互和更多 runtime signal，但前提是保持 verdict 可重复。

第二，扩展引擎与多人系统。现在只测 Godot 4.4 + GDScript，单容器 harness 也不覆盖网络同步。迁移到 Unity、Unreal 或多容器 client–server 测试时，如何继续控制时钟、异步任务和网络事件顺序，是直接而困难的后续问题。

第三，增加统计稳定性。主表每个 model + scaffold 组合只有一次完整运行。论文另对 Qwen-3.8-Max、GLM-5.2、Kimi-K3 在 Claude Code 下各跑三次：单次分数的标准差相当于约 2–3 道题，而 pass@3 与 worst@3 相差 26.39–36.11 个百分点。“某配置这次解出 38/72”只能表示这一次运行的结果，不能当作稳定能力上限。

第四，补足公开复现链。论文主页提供了评测框架仓库，README 指向单独的 `GameLogicBench-Tasks` 仓库；截至本文核查时间（2026-09-22），该链接返回 404。因此可以审计 harness 和论文附录中的三个完整 brief，却不能从公开仓库逐项复跑 72 题、隐藏 judge 与 mutant archive。本文中的 task case 只引用论文公开材料；任何等价代码都明确标为示意，而非官方 judge 源码。

第五，把“防污染”当成 benchmark 设计的一部分。Repo 任务来自公开项目；只要模型能联网，测试可能从“理解仓库并实现机制”变成“找到原文件并复制”。未来发布任务时，需要在可审计性与防直接检索之间做版本化设计，例如保留可公开的构建记录，同时把真正计分的新变体放在受控评测环境中。

## Q6: 总结

GameLogicBench 的主要贡献是一条可以反复审计的评测链。人类先筛选能够确定性判断的机制；Agent 辅助构建 task 与 judge；正确解和等价正确解检查测试是否错误地绑定某种实现；naive 解与单能力 mutant 检查测试能否拒绝缺失能力的实现；最终 judge 再用多个 scenario、多个 seed 和逐 tick 状态断言评测提交。

它的实验给出三个直接结论：第一，只看最终状态会漏掉大量中途违规；第二，只测公开 preview 会严重高估成功率；第三，大部分失败项目其实能运行，真正薄弱的是跨帧维持决策、空间和时间约束。最佳单次结果仍只有 52.78%，而 Repo tier 在 Claude Code 下的聚合 solve rate 只有 21.7%。

读这篇论文时也要保留两条边界：它不评价一款游戏是否好玩，只评价指定逻辑是否满足可执行规则；主结果是一次运行的观察值，并且完整任务库当前无法从公开链接取得。把它当作“怎样设计可信的 runtime benchmark”比把它当作模型绝对排名更有收获。

<p class="glb-paper-meta">图表版权：原论文以 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> 发布；本文保留原图并标注 Figure / Table 编号。Godot 背景资料来自 Godot 4.4 官方文档。文中的中文解释与示意代码由本文整理。</p>

</div>

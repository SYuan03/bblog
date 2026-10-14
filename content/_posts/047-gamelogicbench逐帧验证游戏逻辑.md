---
title: "[2026-09-18] GameLogicBench: Evaluating Coding Agents on Runtime Game Logic with Tick-Level State Assertions"
permalink: "/posts/论文解读/gamelogicbench.html"
date: "2026-09-22T13:30:00+08:00"
updated: "2026-10-13T18:00:00+08:00"
cover: "/generated-covers/047-gamelogicbench.webp"
description: "在给定 Godot 项目里补好玩法逻辑，怎样确认它每一步都守规则？从引擎与代码示例讲起，逐项拆解任务构建、真实案例、隐藏判分和实验分母。"
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
html:not([data-theme="dark"]) body:has(.glb-reading){--paper:#fff;--paper-elevated:#f6f8fa;--ink:#20252d;--ink-soft:#66707c;--line:rgba(32,37,45,.11);--line-strong:rgba(32,37,45,.2);--glb-purple:#365f85;--glb-teal:#357067;background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:740px;margin-bottom:2.2rem}.article-shell-deck .article-header h1{max-width:25ch;margin:.72rem 0 1.05rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-deck>p{font-family:var(--sans);font-size:.93rem;line-height:1.65}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}.article-shell-deck .article-stats dd{font-family:var(--sans);font-variant-numeric:tabular-nums}
.glb-reading{--glb-column:740px;--glb-accent:var(--glb-purple);--glb-teal:var(--glb-teal);--glb-ink:var(--ink);--glb-soft:var(--ink-soft);--glb-surface:var(--paper-elevated);--glb-line:var(--line-strong);width:min(100%,var(--glb-column));margin-inline:auto;color:var(--glb-ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.78;-webkit-font-smoothing:antialiased}
.glb-reading>*{max-width:100%}.glb-reading p,.glb-reading li{text-wrap:pretty}.glb-reading .glb-paper-meta{margin:0 0 8px;color:var(--glb-soft);font:400 .8rem/1.6 var(--sans)}.glb-reading .glb-source-links{display:flex;flex-wrap:wrap;gap:7px 18px;margin:0 0 24px;font-size:.92em}.glb-reading .glb-source-links a{font-family:var(--sans)}.glb-reading .glb-lead{margin:0 0 24px;font-size:1.08em;line-height:1.78}
.glb-reading .glb-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:22px 0 30px;border-block:1px solid var(--glb-line)}.glb-reading .glb-metric{min-height:102px;padding:17px 14px;border-right:1px solid var(--glb-line)}.glb-reading .glb-metric:last-child{border-right:0}.glb-reading .glb-metric strong{display:block;color:var(--glb-accent);font:680 clamp(1.65rem,3vw,2.2rem)/1 var(--sans);font-variant-numeric:tabular-nums}.glb-reading .glb-metric span{display:block;margin-top:10px;color:var(--glb-soft);font:600 .82rem/1.5 var(--sans)}
.glb-reading .glb-keypoints{margin:0 0 38px;padding:18px 22px;border-left:5px solid var(--glb-accent);background:color-mix(in srgb,var(--glb-accent) 6%,var(--glb-surface))}.glb-reading .glb-keypoints h3{margin:0 0 9px;font-size:1rem}.glb-reading .glb-keypoints ul{margin:0;padding-left:1.25rem}.glb-reading .glb-keypoints li{margin:.42rem 0}.glb-reading .glb-keypoints strong{color:var(--glb-ink);font-weight:760}
.glb-reading .glb-deck{margin:28px 0 38px;border-block:1px solid var(--glb-line);background:var(--glb-surface)}.glb-reading .glb-deck>summary{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:76px;padding:14px 16px;cursor:pointer;list-style:none}.glb-reading .glb-deck>summary::-webkit-details-marker{display:none}.glb-reading .glb-deck-title{display:grid;gap:3px}.glb-reading .glb-deck-title small{color:var(--glb-accent);font:800 .68rem/1.2 var(--mono);letter-spacing:.1em}.glb-reading .glb-deck-title strong{font-size:1rem}.glb-reading .glb-deck-action{color:var(--glb-accent);font:700 .8rem/1 var(--sans);white-space:nowrap}.glb-reading .glb-deck[open] .glb-deck-action::before{content:"收起";font-size:.8rem}.glb-reading .glb-deck[open] .glb-deck-action{font-size:0}.glb-reading .glb-player-shell{border-top:1px solid var(--glb-line);background:#20262d}.glb-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.glb-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.glb-reading .post-deck-embed-note{margin:0!important;padding:10px 14px!important;color:#cbd2d8!important;background:#20262d;border-top:1px solid #424950}.glb-reading .glb-deck-links{display:flex;justify-content:flex-end;padding:0 14px 13px;background:#20262d}.glb-reading .glb-deck-links a{color:#fff;padding:8px 12px;border:1px solid #ffffff4a;text-decoration:none;font:700 .78rem/1 var(--sans)}
.glb-reading .glb-part0{margin:34px 0 42px;padding:22px 24px;border-top:5px solid var(--glb-teal);background:var(--glb-surface)}.glb-reading .glb-part0 h3{margin:0 0 12px;font-size:1.38rem}.glb-reading .glb-kicker{display:block;margin-bottom:7px;color:var(--glb-teal);font:800 .72rem/1 var(--mono);letter-spacing:.1em}.glb-reading .glb-concept-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:20px 0;background:var(--glb-line)}.glb-reading .glb-concept{padding:16px;background:#fff}.glb-reading .glb-concept strong{display:block;margin-bottom:5px;color:var(--glb-accent)}.glb-reading .glb-concept span{display:block;color:var(--glb-soft);font-size:.9rem;line-height:1.62}
.glb-reading .glb-table-scroll{width:100%;margin:22px 0;overflow-x:auto}.glb-reading .glb-table-scroll table{display:table;width:100%;min-width:690px;margin:0;border-collapse:collapse;font:400 .875rem/1.55 var(--sans)}.glb-reading th,.glb-reading td{padding:9px 10px;border:1px solid var(--glb-line);text-align:left;vertical-align:top}.glb-reading th{background:color-mix(in srgb,var(--glb-accent) 8%,var(--glb-surface))}.glb-reading td:first-child{font-weight:650}.glb-reading code{font-size:.92em}
.glb-reading .glb-figure{width:100%;margin:26px 0}.glb-reading .glb-figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid color-mix(in srgb,var(--glb-line) 65%,transparent);border-radius:0;background:#fff;box-shadow:none}.glb-reading .glb-figure figcaption{max-width:680px;margin:8px auto 0;color:var(--glb-soft);font-size:.84rem;line-height:1.6;text-align:left}.glb-reading .glb-figure figcaption strong{color:var(--glb-ink)}
.glb-reading .glb-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--glb-line);list-style:none}.glb-reading .glb-flow li{min-height:126px;padding:14px;background:var(--glb-surface)}.glb-reading .glb-flow b{display:block;margin-bottom:7px;color:var(--glb-accent);font:750 .8rem/1.35 var(--sans)}.glb-reading .glb-flow span{display:block;color:var(--glb-soft);font-size:.84rem;line-height:1.58}
.glb-reading .glb-note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--coral);background:color-mix(in srgb,var(--coral) 7%,var(--glb-surface))}.glb-reading .glb-note.purple{border-color:var(--glb-accent);background:color-mix(in srgb,var(--glb-accent) 7%,var(--glb-surface))}.glb-reading .glb-note.teal{border-color:var(--glb-teal);background:color-mix(in srgb,var(--glb-teal) 7%,var(--glb-surface))}.glb-reading .glb-note p{margin:.35em 0}
.glb-reading .glb-trace{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--glb-line)}.glb-reading .glb-trace>div{padding:14px;background:#fff}.glb-reading .glb-trace b{display:block;color:var(--glb-accent);font-size:.79rem}.glb-reading .glb-trace span{display:block;margin-top:6px;color:var(--glb-soft);font-size:.82rem;line-height:1.5}
.glb-reading .glb-case{margin:24px 0;padding:18px 20px;border-block:1px solid var(--glb-line)}.glb-reading .glb-case h4{margin:0 0 8px;font-size:1.08rem}.glb-reading .glb-case-meta{margin:0 0 14px;color:var(--glb-soft);font-size:.86rem}.glb-reading .glb-case ol{padding-left:1.2rem}.glb-reading .glb-case li{margin:.55rem 0}.glb-reading .glb-verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--glb-line)}.glb-reading .glb-verdict div{padding:13px 15px;background:var(--glb-surface);font-size:.88rem;line-height:1.55}.glb-reading .glb-verdict strong{display:block;margin-bottom:4px;color:var(--glb-teal)}
.glb-reading .glb-evidence-details{margin:24px 0;border-block:1px solid var(--glb-line)}.glb-reading .glb-evidence-details>summary{display:flex;justify-content:space-between;gap:16px;padding:15px 2px;color:var(--glb-ink);cursor:pointer;font:700 .86rem/1.4 var(--sans)}.glb-reading .glb-evidence-details>summary span:last-child{color:var(--glb-soft);font-weight:500}.glb-reading .glb-gallery{display:grid;grid-template-columns:1fr;gap:28px;margin:8px 0 28px}.glb-reading .glb-gallery .glb-figure{margin:0}.glb-reading .glb-gallery .glb-figure img{width:100%}
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
    <span class="glb-deck-title"><small>INTERACTIVE PAPER DECK</small><strong>26 页交互图解：从 Godot 的物理更新到错误实现校准</strong></span>
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

<p class="glb-lead">GameLogicBench 要测的是：模型能否在现有 Godot 游戏项目中补好指定玩法，并在不同地图、输入和时序下始终遵守规则。作者用程序检查整个运行过程，而不只看最终画面或结果。最佳配置一次解出 38/72 题；多数失败项目可以运行，问题出在玩法行为。</p>

<section class="glb-part0" id="part-0-godot">
<span class="glb-kicker">PART 0 · READING PRIMER</span>

### Godot 怎样运行一段游戏代码

Godot 是游戏引擎，负责绘制画面、读取输入、模拟碰撞和调用游戏脚本。它用节点（node）分担这些工作，再把节点组织成可保存、可重复使用的场景（scene）。例如一个角色节点 `CharacterBody2D` 下面可以挂碰撞体、贴图和相机；关卡场景再放入这个角色。

游戏脚本通常写在 Godot 自带的语言 GDScript 中，并附着在节点上。引擎每做一次物理更新，就调用脚本的 `_physics_process(delta)`；`delta` 是这一步经过的仿真时间。这种离散更新步称为 **simulation tick**。本文说“逐 tick 检查”，就是在运行的每一步检查状态和事件，不等游戏结束后才验收。它与画面刷新不是同一个概念。

节点还可以发出事件通知，Godot 称为 signal。例如角色受伤后发出 `health_changed`，界面收到后更新血条，不必让角色脚本直接操纵界面。

<span class="glb-code-label">player.gd · 为本文写的 Godot 4.4 背景示例，不是 benchmark 任务</span>

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

这段脚本需要挂到有碰撞体的 `CharacterBody2D`；在项目的 Input Map 中配置 `left/right/up/down` 四个动作后，才有对应按键输入。它每个物理步读取方向，让引擎处理移动和碰撞。调用 `take_damage` 时，生命值变化并通知订阅者；`snapshot` 是本文加的公开读取示例，不是 Godot 自动生成的评测接口。

背景依据 [Godot 4.4 的 Nodes and Scenes](https://docs.godotengine.org/en/4.4/getting_started/step_by_step/nodes_and_scenes.html) 与 [Using signals](https://docs.godotengine.org/en/4.4/getting_started/step_by_step/signals.html)。论文实际只评测 Godot 4.4 + GDScript，不覆盖其他引擎和语言。
</section>

<div class="glb-metrics" aria-label="GameLogicBench 关键数字">
  <div class="glb-metric"><strong>72</strong><span>在已有 Godot 项目中补逻辑</span></div>
  <div class="glb-metric"><strong>403</strong><span>人工设计的测试场景</span></div>
  <div class="glb-metric"><strong>1,451</strong><span>场景按不同参数生成的测试用例</span></div>
  <div class="glb-metric"><strong>38/72</strong><span>最佳配置的单次解题数（52.78%）</span></div>
</div>

<aside class="glb-keypoints" aria-label="三个关键结论">
  <h3>先记住三个结论</h3>
  <ul>
    <li>一题要通过所有计分测试才算解出。中途任一步触墙、超时或破坏事件顺序，都可能使整题失败。</li>
    <li>在固定的 36 题审计集上，只看最终状态会把平均解题率抬高 <strong>8.89 个百分点</strong>；只测公开示例会抬高 <strong>58.06 个百分点</strong>。两种简化漏掉的是不同错误。</li>
    <li>检查程序也要测试。作者用刻意删掉一项能力的错误实现反查测试，发现修补前有 127/666 个错误实现漏过，修补实际改变了三份历史提交的判定。</li>
  </ul>
</aside>

<h2 id="为什么游戏逻辑需要检查整个运行过程">1. Motivation：为什么游戏逻辑需要检查整个运行过程</h2>

**同一个最终结果，可能来自正确过程，也可能掩盖中途违规。** 资源系统如果先错误地扣掉 10 单位、下一步又补回 10，最后余额仍正确；角色也可能先擦过墙体，再到达终点。冷却时间、跳跃落地、状态切换和同一帧的多个请求，都有这类过程约束。

已有评测可以看视频、检查最终状态，或让另一个模型操作游戏并打分。GameLogicBench 聚焦能由程序明确判断的玩法规则：运行期间是否一直满足约束、换了合法输入是否仍然正确、同一提交重跑是否得到同一判定。

作者把被测系统称为 coding agent，本文简称 Agent：模型通过框架提供的读文件、改代码和执行工具，在已有游戏项目中补全指定脚本。判分程序称为 **judge**，它在 Godot 内运行提交并检查状态、事件和时间。这里评价的是指定玩法逻辑，不包括美术、趣味、关卡内容或整款游戏的体验。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-2-overview.png"><img src="/lib/papers/gamelogicbench/figure-2-overview.png" alt="GameLogicBench 的任务层级、求解与评测流程及模型结果" width="1900" height="910"></a>
  <figcaption>原论文 Figure 2（CC BY 4.0）。左侧是三种任务范围，中间区分 Agent 求解与 judge 判分，右侧是 Claude Code 下各模型的单次解题率。三种任务都在给定项目里补代码，不是让 Agent 从零生成游戏。</figcaption>
</figure>

<h2 id="与已有游戏开发评测相比，它改变了什么">2. Related Work：与已有游戏开发评测相比，它改变了什么</h2>

**最近的对照是同样在 Godot 项目中补代码的 GameDevBench；差别主要在测试证据与场景覆盖。** GameDevBench 使用测试脚本，部分任务会在多个运行时刻读取状态，但每题只有一个手工场景。GameLogicBench 把多时刻状态检查用于全部任务，并由 judge 为每题选择 2–12 个手工场景，再通过随机种子改变数值参数。

论文 Table 1 还比较了从零生成游戏、模型打分和真实工程补代码等设置。表中“确定性”表示决定区分成绩的判分部分不依赖模型判断；“Tick-level”表示至少在两个仿真步读取游戏状态，不一定意味着每一步都查。论文对自身协议的描述更强：固定时间步运行并逐 tick 检查。

<div class="glb-table-scroll">
<table>
  <thead><tr><th>Benchmark</th><th>给 Agent 的任务 / 产物</th><th>判分依据</th><th>不依赖模型判断</th><th>多 tick 状态检查</th><th>每题手工场景</th></tr></thead>
  <tbody>
    <tr><td>SWE-bench</td><td>真实软件仓库；提交补丁（patch）</td><td>单元测试</td><td>全部任务</td><td>不适用</td><td>不适用</td></tr>
    <tr><td>Terminal-Bench 2.0</td><td>终端任务；生成或修改文件</td><td>单元测试</td><td>全部任务</td><td>不适用</td><td>不适用</td></tr>
    <tr><td>WebCompass</td><td>交互网页；从零生成或修改</td><td>Agent 操作并判断</td><td>否</td><td>不适用</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>从零生成浏览器游戏</td><td>Agent 操作并判断</td><td>否</td><td>否</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2602.11103">GameDevBench</a></td><td>真实 Godot 项目；提交 patch</td><td>测试脚本</td><td>全部任务</td><td>部分任务</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.19830">JAMER</a></td><td>Godot 项目；从零生成或修改</td><td>引擎内验证</td><td>全部任务</td><td>否</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>从零生成完整 Godot 游戏</td><td>视觉语言模型（VLM）判断</td><td>否</td><td>否</td><td>1</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2607.03525">GameEngineBench</a></td><td>真实 UE5 / C++ 项目；提交 patch</td><td>测试与语言模型判断</td><td>否</td><td>部分任务</td><td>1</td></tr>
    <tr><td>AutoUE</td><td>从零生成 UE5 / C++ 项目</td><td>语言模型判断</td><td>否</td><td>否</td><td>1</td></tr>
    <tr><td>GameLogicBench</td><td>专门构建或真实 Godot 项目；全部提交 patch</td><td>引擎内状态、事件断言</td><td>全部任务</td><td>全部任务</td><td>2–12</td></tr>
  </tbody>
</table>
</div>

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/table-1-comparison.png"><img src="/lib/papers/gamelogicbench/table-1-comparison.png" alt="原论文 Table 1：运行中产物 benchmark 的评测设计对比" width="1160" height="535"></a>
  <figcaption>原论文 Table 1（CC BY 4.0）。Task 是提交方式；Codebase 是项目来源。因此最后一行的 Patch / Both 指在两种来源的给定项目中补代码。表中的 Tick-level 口径为至少两个仿真步，空心圆表示仅部分任务满足。</figcaption>
</figure>

这是作者选取的运行中产物评测集合，不能据此宣称所有代码 benchmark 都缺少这些性质。它也没有证明程序判分能够替代体验评价；这里先把研究对象收窄到能写成明确运行规则的机制，再增加检查深度。

<h2 id="任务怎样构建，一份提交怎样得到判定">3. Benchmark / Protocol：任务怎样构建，一份提交怎样得到判定</h2>

**先把规则、可修改接口与隐藏测试固定，再用同一套 judge 检查每份提交。** 理解这条链，要分开任务构建和提交评测：前者决定测什么、测试是否可信，后者决定某份代码是否通过。

<h3 id="任务包与数据来源">3.1 任务包与数据来源</h3>

一道任务（task）包含说明文档 **brief**、给定 Godot 项目、公开可运行示例 **preview**、可提交的文件范围，以及 Agent 看不到的计分场景和 judge。brief 写行为与接口要求，Agent 要补指定 GDScript 或组件，不需要生成整个项目。

三种层级（tier）描述需要接入多少现有系统：

- Atom：为 benchmark 专门做的最小游戏，隔离一个机制，例如敌人寻路；21 题。
- Combo：仍是专门构建的小游戏，但同时要求几个机制在时间、空间或并发调用下兼容；28 题。
- Repo：在真实项目规模的系统中补充指定机制，同时保持动画、相机、资源和其他组件依赖的接口与共享状态；23 题。Appendix G 给出三种构造方式：补完项目原本缺失或未完成的系统；移去已有子系统后重新实现（carve out and reimplement）；在现有系统相互约束下新增机制。它们都补缺失功能，不是按报错修已有缺陷。

Repo 在数据中更难，但 tier 的定义是集成范围，不是预先给题目贴难度标签。Repo 平均含 209 个游戏文件、17,599 行代码；Atom / Combo 都平均只有 5 个文件，分别为 316 / 421 行。Agent 要在较大的项目里找到行为控制位置、读懂调用方，并避免修好一处却破坏另一处。

候选机制来自开源 Godot 仓库、已发布游戏和按功能能力整理的分类。仓库代码只有许可证允许才复用；不能复用时，作者重做机制。借鉴已发布游戏的机制时，作者新写游戏，不复制原游戏代码或素材。§Ethical Considerations 只明确说其中 20 道 Repo 题源自公开开源 Godot 项目，未解释与 Repo 总数 23 的差别，不能把全部 23 题都写成直接移除上游代码的任务。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-3-construction.png"><img src="/lib/papers/gamelogicbench/figure-3-construction.png" alt="任务候选经过人工筛选、Agent 辅助构建、校准及人工录取" width="2582" height="1469"></a>
  <figcaption>原论文 Figure 3（CC BY 4.0）。人类负责入口筛选和最终录取；不同 Agent 做小规模可行性试验、设计任务、实现项目与检查程序，再独立复跑。它们不是最终被测模型替自己临时生成一套测试。</figcaption>
</figure>

三名人工标注者先筛掉依赖审美或体验判断的机制。保留项的正确性必须能够写成唯一值、合法事件顺序，或运行中应守恒的量；还要有实现挑战并支持完整运行。辅助构建的 Agent 先比较正确与常见错误实现，再形成任务设计，最后生成给被测 Agent 的项目、judge 和校准样例。能直接照 brief 写出而无需处理运行交互的候选会被淘汰。

约 200 个想法中，122 个完成构建、校准和独立 Agent 复跑；三名标注者最终录取 72 个，其他候选退修或淘汰。论文没有给出标注者一致率，也没有说明最终录取采用多数票还是一致同意，不能据“三人复核”推断这些统计。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-4-statistics.png"><img src="/lib/papers/gamelogicbench/figure-4-statistics.png" alt="游戏类型、能力场景与 token 规模统计" width="2240" height="659"></a>
  <figcaption>原论文 Figure 4（CC BY 4.0）。72 题覆盖 12 种游戏类型。403 个场景可带多个能力标签，七根能力柱不能相加成样本总数。右侧只是在固定 GLM-5.2 + OpenCode 配对下的比较：输出 token 约为 GameDevBench 的 15 倍，非缓存输入近 4 倍。</figcaption>
</figure>

<h3 id="公开材料与隐藏测试的边界">3.2 公开材料与隐藏测试的边界</h3>

Agent 看得到规则、接口、可修改文件、公开 preview 和调试输出。每题只展示一个场景结构，但 Agent 可以换随机种子（seed）运行这个示例。judge 使用同一行为规则和接口，另外选择地图、输入序列和调用时序。**隐藏的是具体计分实例和 judge 实现，不是另外一套玩法规则。**

作者手工设计测试结构，称为 **scenario**；例如从哪个方向接近台阶、后面是否有高墙。seed 再给高度、距离或时间等数值参数取值，一个 scenario × seed 构成一个测试用例（test case）。全库有 403 个 scenario、1,451 个 test case；每题 2–12 个 scenario、10–38 个 test case。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/body-method.svg"><img src="/lib/papers/gamelogicbench/body-method.svg" alt="求解、隔离组装、逐帧判分以及 case 到题级分数的关系" width="1200" height="790"></a>
  <figcaption>本文根据 §2–3 与官方 README 整理。评测从一份完成的提交开始；任务筛选、标注与校准在这之前已经完成。</figcaption>
</figure>

<h3 id="一次提交的执行顺序">3.3 一次提交的执行顺序</h3>

承载模型并提供读写、命令工具的框架，论文称为 **scaffold**，例如 Claude Code、Codex 或 OpenCode。负责复制工作区、隔离容器和启动测试的外层评测程序是 harness；它不等同于被测模型的 scaffold。

1. harness 在求解容器中交给 Agent brief、项目和公开 preview。Agent 可以运行与调试游戏；模型 API 可访问，其他出网访问被封。
2. 求解结束后，harness 把 Agent 工作区复制到另一个完全断网的 judge 容器。
3. 官方 README 说明项目按 `game → solution → judge` 顺序组装。冻结 judge 最后覆盖，因此 Agent 调试时改了同名文件，也不会替换最终检查程序。
4. judge 遍历每个计分 scenario 及其 seeds，启动一个固定 timestep 的运行。它可以采用接口允许的同时调用、重复进入同一方法（re-entry），或改变时间参数；改变的是合法执行条件，不是规则。
5. 每个 tick 检查运行状态和事件记录，结束时再检查终局条件。所有相关条件成立才给该 case 输出 PASS，否则 FAIL。
6. 固定运行环境、judge、提交、scenario 和 seed 后，重跑判定相同。评分过程不调用语言模型。

统一协议来自论文和公开 harness 的 README；不能把 README 当成 72 道题的断言代码。独立任务库 `NJU-LINK/GameLogicBench-Tasks` 在 **2026-09-22 的历史核查中返回 404**。本文没有据此宣称它今天仍不可用。以下三个 case 依据论文公开的完整 brief 与场景例子；没有取得每题隐藏 checker，因而不能逐行复跑其断言与容差。

下面的 GDScript 风格伪代码仅表示论文协议，不是官方 judge，也不是可运行 Godot 程序：

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

<h3 id="Case-1：Enemy-Navigation，路径到达却擦到墙角">3.4 Case 1：Enemy Navigation，路径到达却擦到墙角</h3>

<div class="glb-case">
  <h4>Atom / Enemy Navigation</h4>
  <p class="glb-case-meta">来源：Appendix F.2 的公开任务 brief，由 benchmark 构建流程准备；执行方式依据 §3.1。</p>
  <ol>
    <li>Agent 得到公开 preview，并每个物理帧接收 <code>self_pos</code>、<code>goal_pos</code>、角色 <code>radius</code>、<code>world</code>、<code>nav_map</code>、时间步 <code>dt</code> 与累计时间 <code>t</code>。</li>
    <li>Agent 提交 <code>res://logic/controller.gd</code> 及允许的 helper。<code>decide(state) → Vector2</code> 返回移动方向；非零向量由游戏归一化，角色前进固定距离；<code>Vector2.ZERO</code> 表示停留。</li>
    <li>judge 换地图场景与 seed，使墙、门洞、起点和终点不同。角色必须在任务时间预算内到达，并且整个身体从不接触墙，擦到墙角也算违规。公开 brief 未给具体时限，不应补成某个秒数。</li>
    <li>按规则展开的失败：控制器只为中心点规划路径，没给半径留空间。在门洞某一帧，中心没进墙但身体擦过墙角；后来抵达终点也无法消除这次违规。</li>
  </ol>
  <div class="glb-verdict"><div><strong>PASS</strong>全部计分 seed 中按时到达，所有运行步身体都不触墙。</div><div><strong>FAIL</strong>任意 case 中途碰墙，或者没有按时到达；整题不算 solved。</div></div>
  <p class="glb-case-meta">碰墙与到达规则是公开内容；墙角失败是本文依据规则写的解释性轨迹，不是论文公布的模型日志。完整隐藏布局、checker 与容差未知。</p>
</div>

这类错误解释了只查终局的盲点：最终的“已到达”没有记录到达之前的触墙。

<h3 id="Case-2：Platform-Guard，坐标名单不等于可见目标">3.5 Case 2：Platform Guard，坐标名单不等于可见目标</h3>

<div class="glb-case">
  <h4>Combo / Platform Guard</h4>
  <p class="glb-case-meta">来源：Appendix F.3 的公开完整 brief。它把巡逻、视线、真实跳跃、追逐与返回同时交给一个控制器。</p>
  <ol>
    <li>每帧输入含守卫位置、速度、是否着地，全部平台与塔（tower），家所在的平台（home platform）以及 <code>intruders</code>。最后一个字段始终列出所有访客的真实坐标，不替控制器筛选可见目标。</li>
    <li>控制器返回 <code>{"move": float, "jump": bool, "chasing": int}</code>。<code>move</code> 限在 [-1,1]，<code>jump</code> 只在着地时接受；<code>chasing</code> 为正在追的目标 ID，没追时为 -1。</li>
    <li>目标必须同时在 <code>vision_range</code> 距离内、视线没有被塔或平台挡住，才算可见。控制器要自己计算这个条件；光看名单或距离都不够。</li>
    <li>公开要求还包括安静期巡逻覆盖至少 34% 的家平台可行走范围；看到访客后及时在地面上接近至 130 世界单位；安静后离家不超过 6 秒，再恢复巡逻。空中掠过 130 单位范围，不算完成接近。</li>
    <li>测试改变平台宽度、间隙、出生点和来访时序，并可放遮挡视线的塔。每次 watch 是 1,800 帧，即 30 秒、60 Hz；公开物理常量为速度 200、跳跃初速度 -400、重力 980、角色胶囊半径 12。</li>
  </ol>
  <div class="glb-verdict"><div><strong>PASS</strong>所有计分用例持续满足巡逻、可见性、地面接近、返回与不坠落要求。</div><div><strong>FAIL 示例</strong>名单里有塔后访客，控制器直接返回 <code>chasing=id</code>。目标实际不可见，违反“只追看得见的目标”，即 brief 的 ghost chase（声称追逐不可见目标）。</div></div>
  <p class="glb-case-meta">上面的数值、接口与 ghost-chase 定义来自 brief；FAIL 是规则的解释性展开，不能声称已看见某次模型运行，或知道隐藏 judge 用哪条射线断言。</p>
</div>

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/body-case.svg"><img src="/lib/papers/gamelogicbench/body-case.svg" alt="塔挡住视线，完整坐标名单仍含访客；直接返回追逐 ID 会违反可见性要求" width="1200" height="840"></a>
  <figcaption>本文根据 Appendix F.3 画的示意。输入包含真实坐标，是为了让 Agent 实现视线判断，而非自动授予守卫“看见所有人”的能力。图中位置不代表真实隐藏关卡。</figcaption>
</figure>

<h3 id="Case-3：AMSG-Character-Movement，接口正确还要行为兼容">3.6 Case 3：AMSG Character Movement，接口正确还要行为兼容</h3>

<div class="glb-case">
  <h4>Repo / AMSG Character Movement</h4>
  <p class="glb-case-meta">来源：Appendix F.4 的公开完整 brief；公开 +X 与计分 -X 场景来自 §2.1。</p>
  <ol>
    <li>这个案例采用移去已有实现再补回的方式（carve-out）：Agent 接手真实第三人称角色项目中的 <code>CharacterMovementComponent.gd</code>，补回被移去的方法体。类名、导出属性、状态字段和签名不能改，因为动画、相机、PlayerController 和其他组件都在使用它们。</li>
    <li>它要实现行走（walking）、跑步（running）、冲刺（sprinting）三种步态，以及松开输入后的减速、蹲伏、头顶阻挡、全方向上台阶和跳跃。调用方按住方向时每步调用 <code>add_movement_input(...)</code>，松开后停止调用；其他组件可在移动途中改变 <code>gait</code>（步态等级）、<code>stance</code>（站立或蹲伏姿态）与 <code>rotation_mode</code>（朝向控制模式），运动必须立即使用当前配置。</li>
    <li>离地后有 0.1 秒确认窗口，之后才进入 airborne（空中状态）；确认前不能标为空中状态，也不能提前施加重力。头顶被挡住时不能站起或靠跳跃增加高度。</li>
    <li>公开 preview 沿 +X 方向上合法台阶。论文披露的计分场景沿 -X 接近，后方再放超过最大台阶高度的墙。角色要爬合法台阶，但不能把高墙也当成台阶。</li>
    <li>本文按规则写的 FAIL：探测方向固定为 +X，公开示例能通过；换成 -X 后仍向另一侧探测，角色卡在合法台阶。这个错误不代表论文公开了相应模型日志。</li>
  </ol>
  <div class="glb-verdict"><div><strong>PASS</strong>变化后的场景仍守住运动规则和既有接口；全部计分 case 通过。</div><div><strong>FAIL</strong>只支持公开方向、破坏调用方接口，或让一个运动机制与另一个机制冲突，都会使任务不通过。</div></div>
  <p class="glb-case-meta">场景方向和高墙是作者披露的真实例子；失败代码原因是本文示意。完整 task-specific checker 及逐项数值容差未取得。</p>
</div>

<h3 id="分数怎样从运行步汇总到整题">3.7 分数怎样从运行步汇总到整题</h3>

每个 case 的逐 tick 与终局断言都要成立；每个 scenario 的全部 seed 通过，才是该场景严格通过（strict scenario pass）；一道 task 的所有计分 case 通过，才是 solved。

**Solve rate = solved tasks / 72。** 无可判定提交或求解过程不可用的结果仍计失败，不从分母删除。因此最佳 38/72 = 52.777…%，四舍五入为 52.78%。1,451 个 case 没有被直接平均成这个标题分数。

能力分析用的是不同单位：先对每个 scenario 的所有 seed 严格合取，再在有某能力标签的 scenario 中计算通过率。场景可能带多个标签，所以能力分组的分母不能相加，也不能拿它与整题 solve rate 直接比较。

<h3 id="如何验证-judge-没有误杀与漏判">3.8 如何验证 judge 没有误杀与漏判</h3>

作者在录取任务之前准备四类校准实现。正确实现（proper solution）要跨全部 scenario 和 seed 通过，且不贴着容差边界；内部写法不同但行为相同的正确实现（behavior-preserving control）也要通过。包含常见错误的 naive solution 必须失败；每次只删掉一项目标能力的 **single-capability mutant**，至少要被专门暴露这项缺失的一个场景抓住。

独立 Agent 再复跑全部场景和 seed，检查校准结果与公开/隐藏边界，最后三名人工标注者决定录取。具体容差不是统一给定值；没有取得各题 checker，不应在案例里补一个假定阈值。

这步有实际证据：36 题审计集的修补前检查放过 127/666 个 mutant，暴露 19 道任务中的 24 个缺失检查。修补后，9 个模型 × 2 个框架的历史提交有三份由 PASS 变 FAIL，涉及两题、三个模型；正确实现和等价正确实现仍通过。只验证“好实现能过”，不能证明“坏实现过不了”。

<h2 id="实验测到了哪些失败，哪些比较最有说服力">4. Experiments：实验测到了哪些失败，哪些比较最有说服力</h2>

**最强证据来自固定提交重判：删掉过程检查或隐藏场景，都会让本来失败的代码过关。** 主表则显示模型和框架共同决定成绩；它只有一次运行，不足以给模型排稳定能力名次。

<h3 id="实验设置与主结果">4.1 实验设置与主结果</h3>

论文测试 20 个模型与执行框架配对，使用 Claude Code 2.1.177、Codex 0.144.1、OpenCode 1.17.18，求解与判分都是 Godot 4.4。全部求解设置 `effort=high`，每题最多 3,600 秒。主表每个配置只做一次完整运行。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/table-3-results.png"><img src="/lib/papers/gamelogicbench/table-3-results.png" alt="20 个模型和框架配置的任务解题率、轮数与成本" width="1220" height="830"></a>
  <figcaption>原论文 Table 3（CC BY 4.0）。Claude-Opus-5 + Claude Code 一次解出 38/72，最佳 52.78%。Qwen-3.8-Max 换框架后从 Codex 的 26.39% 到 Claude Code 的 44.44%；两者差 18.05 个百分点，不能按模型名称忽略框架。</figcaption>
</figure>

Qwen-3.8-Max 在 Claude Code / Codex / OpenCode 分别为 44.44% / 26.39% / 29.17%；GPT-5.6-Sol 为 41.67% / 34.72% / 34.72%。Codex 平均模型交互轮数最少，并且 Qwen、GPT 在其下的各报告分位工具调用也较少。但工具调用少不稳定对应更好或更差的成绩，论文没有把它作为单独原因。

<h3 id="集成范围扩大，运行尝试增加仍然掉分">4.2 集成范围扩大，运行尝试增加仍然掉分</h3>

固定 Claude Code，12 个模型都从 Atom 到 Combo 再到 Repo 下降；汇总解题率为 45.2% → 31.5% → 21.7%。Agent 在 Repo 花更多交互轮、启动引擎更多，也更常改公开示例的随机种子：相关会话比例从 Atom 的 38.9% 到 Repo 的 55.8%。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-5-tier.png"><img src="/lib/papers/gamelogicbench/figure-5-tier.png" alt="任务集成范围与解题率、模型轮数、运行实验和工具调用" width="1217" height="373"></a>
  <figcaption>原论文 Figure 5（CC BY 4.0）。代码检查调用在 Repo 明显增加；修改、执行调用主要在 Atom → Combo 增加。这是工具使用与任务范围的观察关系，不是“多读代码导致失败”的因果实验。</figcaption>
</figure>

<h3 id="能启动引擎，仍维持不好具体规则">4.3 能启动引擎，仍维持不好具体规则</h3>

在合并统计的失败 scenario 中，74.3% 的提交可以运行且可判分，但违反玩法规则；17.2% 没有可判定提交，8.5% 求解过程不可用。**这三个比例的分母是失败场景，不是 72 道题，也不是所有运行。**

七类能力包括跨多个帧保持一个决定的 Intention commitment，资源守恒与共享分配的 Resource accounting，空间寻路与避障的 Spatial navigation and steering，状态转移的 State machine，冷却与时间窗口的 Timing，同帧竞争请求的优先级与去重的 Arbitration，以及正确使用 Godot 时钟、求解器和子系统的 Engine contract。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-8-capabilities.png"><img src="/lib/papers/gamelogicbench/figure-8-capabilities.png" alt="七类能力的严格场景通过率" width="1225" height="935"></a>
  <figcaption>原论文 Figure 8（CC BY 4.0）。20 个配置合并后，Engine contract 场景严格通过率 88.75%，19/20 个配置中最高；Commitment、Spatial、Timing 在 17/20 配置中是最难三类，合并值为 53.4%–58.57%。它们分别要求持续维持决定、空间限制与时间规则，不只是“会不会调用 Godot API”。</figcaption>
</figure>

<h3 id="固定测试与提交，删哪一层会漏什么">4.4 固定测试与提交，删哪一层会漏什么</h3>

36 题审计集含 666 个 mutant 和 20 配置 × 36 题 = 720 份模型提交；其中 488 份在完整 judge 下失败。作者不重新生成代码，而是给同一批产物换判分方式。

只查终局（Terminal-only）保留全部 scenario 与 seed，删掉中途断言：236/666 个 mutant 逃过，34/36 题至少漏一个；64/488 份原失败提交变成通过。平均解题率增加的分母是全部 720 份提交，因此 **64/720 × 100 = 8.89 个百分点**，不是 64/488。

只查公开示例（Preview-only）保留逐 tick 断言，却仅跑公开 scenario：508/666 个 mutant 逃过，全部 36 题都漏掉错误；418/488 份原失败提交变成通过。因此 **418/720 × 100 = 58.06 个百分点**。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/table-5-ablation.png"><img src="/lib/papers/gamelogicbench/table-5-ablation.png" alt="相同 36 题、mutant 与提交在终局检查、公开场景检查下的重判结果" width="570" height="280"></a>
  <figcaption>原论文 Table 5（CC BY 4.0）。前一种简化漏掉 Enemy Navigation 式的“过程错、结尾对”；后一种简化让代码只需适应已见结构。表中 flip 的 488 分母是原失败提交；solve-rate uplift 的分母是所有 720 份提交。</figcaption>
</figure>

<h3 id="开放网络改变了评测问题">4.5 开放网络改变了评测问题</h3>

在 Repo 上，作者给五个配置开放网络，并与各自封闭运行对照。四个配置检索到了上游源码，人工检查轨迹发现直接复用；这四个配置解出题数都上升。Kimi-K3 + Claude Code 从 3 题增至 12 题，增加九题。第五个配置没尝试检索，成绩也没变。

<figure class="glb-figure">
  <a href="/lib/papers/gamelogicbench/figure-7-retrieval.png"><img src="/lib/papers/gamelogicbench/figure-7-retrieval.png" alt="开放网络后上游源码检索及 Repo 解题数变化" width="1269" height="439"></a>
  <figcaption>原论文 Figure 7（CC BY 4.0）。封闭出网限制防的是求解时直接找回原实现；它不能证明模型训练数据没有见过相关仓库。</figcaption>
</figure>

<details class="glb-evidence-details">
  <summary><span>完整原始图表索引</span><span>论文的 9 张 Figure 与 12 张编号 Table 均有记录</span></summary>
  <div class="glb-gallery">
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-1-cost.png"><img src="/lib/papers/gamelogicbench/figure-1-cost.png" alt="Figure 1 成本与解题率" width="2520" height="1260"></a><figcaption><strong>Figure 1。</strong>20 个配置的成本与解题率；图中的成本—成绩边界连接表现较好的配置，只是这次实验的观察结果，不是新的排名指标。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-2-overview.png"><img src="/lib/papers/gamelogicbench/figure-2-overview.png" alt="Figure 2 任务基准总览" width="1900" height="910"></a><figcaption><strong>Figure 2。</strong>任务层级、求解、判分和 Claude Code 结果。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-3-construction.png"><img src="/lib/papers/gamelogicbench/figure-3-construction.png" alt="Figure 3 构建流程" width="2582" height="1469"></a><figcaption><strong>Figure 3。</strong>任务构建与验证流程。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-4-statistics.png"><img src="/lib/papers/gamelogicbench/figure-4-statistics.png" alt="Figure 4 任务基准统计" width="2240" height="659"></a><figcaption><strong>Figure 4。</strong>来源类型、能力覆盖与 token 规模。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-5-tier.png"><img src="/lib/papers/gamelogicbench/figure-5-tier.png" alt="Figure 5 任务集成范围" width="1217" height="373"></a><figcaption><strong>Figure 5。</strong>任务集成范围与成功率、运行试验、工具调用的关系。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-6-tools.png"><img src="/lib/papers/gamelogicbench/figure-6-tools.png" alt="Figure 6 执行框架工具调用" width="1285" height="469"></a><figcaption><strong>Figure 6。</strong>三个执行框架的调用量与操作类型。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-7-retrieval.png"><img src="/lib/papers/gamelogicbench/figure-7-retrieval.png" alt="Figure 7 上游源码检索" width="1269" height="439"></a><figcaption><strong>Figure 7。</strong>开放网络后的源码检索与 Repo 成绩变化。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-8-capabilities.png"><img src="/lib/papers/gamelogicbench/figure-8-capabilities.png" alt="Figure 8 能力通过率" width="1225" height="935"></a><figcaption><strong>Figure 8。</strong>七类能力的场景严格通过率：一个场景的全部随机种子都通过，才记为成功。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/figure-9-coverage.png"><img src="/lib/papers/gamelogicbench/figure-9-coverage.png" alt="Figure 9 每题覆盖矩阵" width="3113" height="1050"></a><figcaption><strong>Figure 9。</strong>20 个配置在 72 个具体任务上的成败矩阵。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-2-composition.png"><img src="/lib/papers/gamelogicbench/table-2-composition.png" alt="Table 2 任务集成规模" width="550" height="180"></a><figcaption><strong>Table 2。</strong>三类任务的项目文件、代码行与正确解规模。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-4-variance.png"><img src="/lib/papers/gamelogicbench/table-4-variance.png" alt="Table 4 重复运行方差" width="550" height="220"></a><figcaption><strong>Table 4。</strong>三个配置重复三次后的 pass@1、pass@3、worst@3 与标准差。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-6-model-card.png"><img src="/lib/papers/gamelogicbench/table-6-model-card.png" alt="Table 6 模型价格" width="1150" height="660"></a><figcaption><strong>Table 6。</strong>实验计算成本时使用的发布时间与当时价格。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-7-capabilities.png"><img src="/lib/papers/gamelogicbench/table-7-capabilities.png" alt="Table 7 七类能力定义" width="1130" height="460"></a><figcaption><strong>Table 7。</strong>七类玩法逻辑能力的正式定义。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-8-tool-profile.png"><img src="/lib/papers/gamelogicbench/table-8-tool-profile.png" alt="Table 8 工具使用" width="1150" height="540"></a><figcaption><strong>Table 8。</strong>20 个配置的平均工具使用分布。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-9-tool-quantiles.png"><img src="/lib/papers/gamelogicbench/table-9-tool-quantiles.png" alt="Table 9 工具调用分位数" width="800" height="510"></a><figcaption><strong>Table 9。</strong>三个跨执行框架模型的工具调用分位数。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-10-bash.png"><img src="/lib/papers/gamelogicbench/table-10-bash.png" alt="Table 10 Bash 操作" width="695" height="655"></a><figcaption><strong>Table 10。</strong>Bash 调用按检查（inspect）、执行（execute）、修改（modify）及组合分解。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-11-tokens.png"><img src="/lib/papers/gamelogicbench/table-11-tokens.png" alt="Table 11 token 使用" width="1150" height="580"></a><figcaption><strong>Table 11。</strong>各配置每题平均输入、缓存读取、输出与复用比例。</figcaption></figure>
    <figure class="glb-figure"><a href="/lib/papers/gamelogicbench/table-12-cache.png"><img src="/lib/papers/gamelogicbench/table-12-cache.png" alt="Table 12 Claude Code 缓存流量" width="640" height="180"></a><figcaption><strong>Table 12。</strong>Claude-Opus-5 与 Claude-Sonnet-5 的缓存写入／读取 token 数。</figcaption></figure>
  </div>
</details>

<h2 id="后续研究最该隔离哪些因素">5. Discussion：后续研究最该隔离哪些因素</h2>

**优先分开“真正实现规则”和“碰巧适应示例”，再谈更大任务或更多工具。** 这不是论文已经验证的新方法，而是据现有失败证据提出的下一步实验。

可以固定模型、工具与时间预算，比较三种求解反馈：只给公开 preview；给更多合法输入变体；给首次违规的时间、状态和事件。需要另留未见过的计分场景，否则增加反馈只是帮助模型适应测试。观察整题 solved、过程违规类别和总工具/token 成本，比只报公开示例通过更能回答反馈有没有用。

还要增加重复运行。论文在 Claude Code 下为 Qwen-3.8-Max、GLM-5.2、Kimi-K3 各跑三次：pass@1 是三次题级解题率均值，pass@3 是至少一次解出的题目比例，worst@3 是三次都解出的比例。单次分数标准差为 3.67%–4.24%，约两三题；pass@3 与 worst@3 差 26.39–36.11 个百分点。因此一次 38/72 不等于稳定可解那 38 题。

方法迁移到 Unity、Unreal 或多人游戏还需新证据。现在只覆盖 Godot 4.4、GDScript 和单容器游戏；网络同步、异步任务及多客户端事件顺序会增加控制难度。美术、节奏与玩家体验也不能自动写成同类确定性断言，需另用体验评价补充。

最后，应把公开复现与防直接检索一起设计：明确任务、judge、参考解和校准错误实现的版本，保证别人可以复跑，同时另留计分新变体。本文保留任务库的历史可用性缺口；没有取得的隐藏代码，不用“合理猜测”补成官方实现。

<h2 id="最值得保留的结论与边界">6. Conclusion：最值得保留的结论与边界</h2>

**它的贡献是同时检验运行过程、输入变化和检查程序本身。** 多场景避免只适应公开示例，逐 tick 检查避免最终结果掩盖违规，正确与错误实现校准则避免 judge 接受错误或误杀另一种正确写法。

这三部分的证据力度不同：固定提交重判的消融直接显示简化测试会漏错；666 个 mutant 的反查实际修补了 judge；20 配置主表则是单次结果，不能当成稳定模型排名。最佳 52.78% 和 Claude Code 下 Repo 汇总 21.7% 也都要放回严格整题分母理解。

读这篇最有用的收获，是如何把一句“这个玩法实现对了”拆成可以重复检查的条件。它没有评价完整游戏体验；封闭出网不是无训练污染的证明；三个公开 brief 也不等于完整隐藏任务库。这些边界与主结果一样，应当留在解读中。

<p class="glb-paper-meta">图表版权：原论文以 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> 发布；本文保留原图并标注 Figure / Table 编号。新增机制与案例图为本文根据明确来源整理；Godot 示例仅用于背景解释。</p>

</div>

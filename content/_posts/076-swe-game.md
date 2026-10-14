---
title: "[2026-09-27] SWE-Game: Can Coding Agents Build the Games We Want?"
permalink: "/posts/论文解读/swe-game.html"
date: "2026-10-08T13:26:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/lib/papers/swe-game/cover.svg"
description: "41 个可运行 Godot 参考游戏派生出 247 道开发、补全、修复与移植题。SWE-Game 用预定动作试玩，再检查状态变化和无输入对照；本文沿 Beacon Relay 的拾取、计时、送达过程解释判分。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 14
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "Benchmark"
  - "游戏开发"
  - "Godot"
  - "软件测试"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Xiaoyu Chen, Lai Wei, Jin Wang, et al. · arXiv:2609.33678v3 · 最早公开于 2026-09-27</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.33678">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.33678v3">论文 PDF</a>
  <a href="https://arxiv.org/html/2609.33678v3">HTML 全文与附录</a>
</div>

<section class="deck-wrap" aria-label="SWE-Game 交互图解">
  <div class="deck-head"><strong>14 页交互图解 · 题目、模型、harness、真实 case 与评分链</strong><a href="/lib/decks/swe-game-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/swe-game-visual-guide.html" title="SWE-Game 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">SWE-Game 让评测器亲自操作游戏，再从引擎状态判断指定机制是否真的发生。41 个可运行参考游戏被拆成 247 道题，覆盖从短描述开发完整游戏、照设计文档实现、补全初始工程、修 bug，以及把 Godot 游戏迁移到 Unity。能够启动、画面相似与玩法正确分别评价，不把它们混成一次主观试玩。</p>

<aside class="part0"><span class="kicker">PART 0 · 先分清开发与验收</span><h3>模型写游戏，作者的系统检查游戏</h3><p>Godot 是开放源代码游戏引擎，主要脚本语言为 GDScript；场景由对象节点和脚本组成。Unity 是另一套引擎，本文移植题要原生重写而非启动 Godot。<strong>Agent harness</strong> 是模型读文件、改代码与调用工具的系统，六个模型各用一套，论文没披露具体客户端。作者的 <strong>evaluation harness</strong> 负责验收：<strong>driver</strong> 是执行预定输入的程序，<strong>probe</strong> 是读取引擎状态的探针。<strong>GDD（Game Design Document）</strong> 是写明玩法、关卡与反馈的游戏设计文档；<strong>VLM</strong> 是能阅读画面的视觉语言模型，此处仅负责视觉评分。</p></aside>

<div class="metrics" aria-label="SWE-Game 关键数字">
  <div class="metric"><strong>247</strong><span>任务，来自 41 个参考游戏</span></div>
  <div class="metric"><strong>5</strong><span>开发、补全、修复与移植模式</span></div>
  <div class="metric"><strong>50.38</strong><span>最佳 Brief-to-Game 总分</span></div>
  <div class="metric"><strong>92.59%</strong><span>可执行检查的 balanced accuracy</span></div>
</div>

<aside class="keypoints"><h3>先记住</h3><ul><li>榜单比较的是六个“模型 + 各自运行程序”组合，论文未公开六套程序的名字与统一工具预算。</li><li>提交者登记候选中的对象和实时数值；具体输入路线、检查代码与期望状态由评测器掌握。</li><li>三类从头构建任务的最佳总分仍低于 60；能生成合法项目，离实现指定玩法还有明显距离。</li></ul></aside>


<h2 id="为什么必须验证动作真的引发玩法">1. Motivation：为什么必须验证动作真的引发玩法</h2>

<p><strong>游戏的结果必须由玩家动作引起，画面相似和胜利界面都不能单独证明玩法成立。</strong>一个平台跳跃游戏可以把尖刺画得很像，却没有实现碰撞伤害；一个候选也可能直接进入胜利状态，绕过整条关卡。静态源码检查看不到这类因果错误，单看录像的 VLM 又难以确认隐藏碰撞、精确时序和内部状态。</p>

<p>SWE-Game 把需求落到可执行行为上。评测器按预定输入操作候选游戏，观察玩家、敌人、危险物、收集物和进度等状态。如果同样时长的无输入对照也能达到目标，这条路线不给分。视觉质量另交给 VLM，按每个游戏的 <strong>rubric（逐项评分规则）</strong> 检查，不让画面评分代替玩法正确性。</p>

<p>同一个玩法还可能有完全不同的代码结构。两个候选的玩家节点可能分别叫 <code>Hero</code> 和 <code>CharacterBody3D</code>，检查程序不能只找作者的节点名。论文要求提交者把对象登记到 <code>gb_player</code>、<code>gb_hazard</code> 等组，并指出哪一个实时数值对应 <code>progress</code>、<code>health</code>、<code>timer</code>。这是候选提交的对象和属性绑定，不是提交者自己编写通过规则。</p>

<h2 id="与游戏生成、代码补丁评测的区别">2. Related Work：与游戏生成、代码补丁评测的区别</h2>

<p><strong>SWE-Game 用同一批可执行参考游戏贯通“从头做、补全、修复、移植”，由评测侧检查不同实现的实际行为。</strong>GameCraft-Bench 偏完整 Godot 游戏生成和多模态逐项评分；GameDevBench、JamBench、GameLogicBench 也使用工程或运行时检查，但任务类型、输入材料和计分单元不同。SWE-Game 逐条评需求、按参考输入路线验证状态变化，并覆盖 Godot 到 Unity 的迁移；具体路线与评分方法放在评测部分展开。</p>

<div class="table-scroll"><table>
  <thead><tr><th>工作</th><th>主要输入与产物</th><th>主要证据</th><th>SWE-Game 的差别</th></tr></thead>
  <tbody>
    <tr><td>GameCraft-Bench</td><td>文本、资产 → Godot 游戏</td><td>视觉模型按逐项规则评分</td><td>增加评测器自己掌握的状态探针、输入重放，并覆盖五种开发任务</td></tr>
    <tr><td>GameDevBench</td><td>文本、代码、资产、图像、视频 → 代码补丁</td><td>可执行单元测试</td><td>验收完整候选项目，并允许内部架构不同</td></tr>
    <tr><td>GameLogicBench</td><td>文本、源码、资产 → 代码补丁</td><td>引擎中的状态断言</td><td>从构建扩展到修复和跨引擎移植</td></tr>
    <tr><td>SWE-Game</td><td>按模式提供简述、GDD、代码、资产、视频 → 游戏或修复</td><td>状态探针、输入重放、视觉模型评分</td><td>41 个参考游戏派生 247 个统一协议任务</td></tr>
  </tbody>
</table></div>

<p>它的边界也很明确：41 个参考项目都是作者围绕许可明确的公共资产制作和人工试玩的 Godot 游戏，不是从真实商业团队的长期问题记录中抽样。项目规模中位数为 3,367 行玩法脚本和 32 个场景，尚未覆盖大型游戏的多年维护。</p>

<h2 id="参考游戏、题目构造与模型可见材料">3. Benchmark / Protocol：参考游戏、题目构造与模型可见材料</h2>

<p><strong>24 个 2D、17 个 3D 参考游戏各产生四道非修复题，再加 83 个注入故障的修复题，合计 <code>41×4+83=247</code>。</strong>参考集合覆盖 13 类玩法，含 168,335 行 gameplay GDScript、1,587 个场景、22,140 个场景树节点和 138 段试玩录像。参考游戏由作者制作、人工试玩；设计文档经过复核，修复题则从可运行参考项目中注入行为故障。这些是围绕参考游戏派生的任务，不是 247 个真实用户 issue。</p>

<div class="table-scroll"><table>
  <thead><tr><th>模式</th><th>Agent 可见</th><th>必须交付</th><th>评测重点</th></tr></thead>
  <tbody>
    <tr><td>Brief-to-Game</td><td>简短需求、资产、参考视频、公开接口</td><td>自写 GDD、Godot 项目、<code>demos.json</code></td><td>玩法机制、内容、可玩性、设计文档、视觉评分</td></tr>
    <tr><td>GDD-to-Game</td><td>完整 GDD、必须演示的功能、资产、视频、接口</td><td>Godot 项目、<code>demos.json</code></td><td>玩法机制、内容、可玩性、视觉评分</td></tr>
    <tr><td>Skeleton Completion</td><td>新建的最小工程、需求、资产、视频、接口</td><td>完成后的 Godot 项目、<code>demos.json</code></td><td>前述三项、初始工程接口接入、视觉评分</td></tr>
    <tr><td>Bug Repair</td><td>带注入故障的完整项目、玩家视角的故障说明、需求</td><td>保留无关行为的修复项目</td><td>恢复故障行为、保住原路线、保留无关行为、产物有效</td></tr>
    <tr><td>Godot-to-Unity</td><td>Godot 源码、GDD、资产、视频、固定的 Unity 工程与接口</td><td>原生 Unity 项目、<code>ops.json</code>、<code>BUILD.md</code></td><td>玩法机制、可玩性、结构、视觉、稳定性</td></tr>
  </tbody>
</table></div>

<p>Skeleton Completion 的初始工程由作者按公开要求新建，称为 <strong>scaffold</strong>：它只固定入口、占位关卡与结束场景、InputMap、<code>gb_levels.json</code> 和玩家接口。它并不是从参考游戏删几个函数，Agent 可以重新组织其余代码。<code>gb_levels.json</code> 是作者公开的提交接口的一部分，候选填入关卡路径、对象标识与数值绑定；它不是人工给每个候选写出的评分答案。drivers、probes 与预期行为另由评测侧掌握。</p>

<p>更准确地说，作者提供的接口包括 <code>contract.json</code> 与 <code>gb_interface.schema.json</code>；<code>gb_levels.json</code> 只是候选要填写的 manifest（项目接口清单）。下面是 Appendix C 的公开契约节选，不是隐藏检查，也不是某个模型的提交：</p>

```json
{
  "groups": {"required": ["gb_player"],
             "optional": ["gb_collectible", "gb_goal", "gb_hazard", "gb_enemy",
                          "gb_checkpoint", "gb_door", "gb_interactive"]},
  "actions": ["gb_left", "gb_right", "gb_up", "gb_down", "gb_jump",
              "gb_action", "gb_pause", "gb_reset"],
  "numeric_slots": ["progress", "health", "timer", "score"],
  "manifest": {"required": ["levels", "endings"]}
}
```

<p>通用契约只把 <code>gb_player</code> 设为必需组，其他组是否必需由具体任务决定。候选的 <code>numeric</code> 把标准数值项映射到实际属性名，<code>device_ids</code> 标识具体对象；登记 <code>timer</code> 并不等于已经实现计时，probe 还会检查它是否随真实玩法变化。Unity 用 <code>GBEntity</code> 标记对象，并通过 <code>GBTelemetry</code>/<code>GBObservableState</code> 读取状态，不复制 Godot 节点名。</p>

<figure class="figure wide"><a href="/lib/papers/swe-game/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/swe-game/body-case.svg" width="1050" height="816" alt="Beacon Relay 的拾取、携带倒计时、踩敌人加时与信标存入" loading="lazy" decoding="async"></a><figcaption>根据 Figure 6 与 Appendix B.2 的真实 GDD 重绘。拾取启动 fuse，踩敌人加 2.5 秒，送达 beacon 才提高进度；不是自造隐藏路线。</figcaption></figure>

<div class="case"><h4>Beacon Relay：简述允许自由设计，完整 GDD 固定运送机制</h4><p>Brief-to-Game 只要求第三人称 3D 穿越与信标接力，失败可恢复、终点明确；路线、移动手感、信标规则由 Agent 设计，<strong>不能把下面的 cell/fuse 机制反过来当作简述题的硬要求</strong>。完整 GDD 则要求三关、11 个 <strong>cells（待运送的能量单元）</strong>、三类敌人、七类移动装置、每关一个生命补给，以及三格护盾。玩家捡到 cell 后，<strong>fuse（携带期限倒计时）</strong> 按关卡从 13、12 或 11 秒开始，颜色由绿变黄再变红。携带时踩中敌人可增加 2.5 秒，侧面接触会损失护盾；只有送入 <strong>beacon（信标接收点）</strong> 才增加进度。完整流程在固定 60 Hz 下约 6 至 9 分钟。</p><p>Skeleton 只给占位三关、结束场景、玩家接口和 <code>progress/health/timer</code> 绑定要求；Repair 给能启动但行为错误的完整项目及症状；Porting 给 Godot 源码和锁定的 Unity 6000.3.23f1 工程。它们共享参考游戏，但不同模式的输入和硬性要求不能混用。</p></div>

<h3 id="六个被测系统与资源统计">3.1 六个被测系统与资源统计</h3>

<p>六个配置是 Qwen3.8 Flash、Grok4.6、GPT-5.6 Luna、Opus5、GLM5.3 Flash 和 Minimax M3；每个都跑全部 247 道题。每次运行使用隔离工作区和独立可写用户目录，没有可供操作的桌面显示。Godot 版本为 4.5.1，Unity 为 6000.3.23f1。</p>

<aside class="evidence"><strong>论文没有公开的部分：</strong>六个模型各自使用的 Agent 框架、工具参数定义、终端与图像或视频操作能力、实际运行时限、失败重试规则和统一调用预算。正文明确说每个模型搭配自己的框架和工具，因此 Table 3 比较的是六套完整系统，无法单独归因于模型。Brief-to-Game 中 Opus5 平均使用 8.49M 输入 token、127.34k 输出 token 和 111.37 次工具调用；GPT-5.6 Luna 分别为 2.56M、34.05k 和 57.15 次。M 表示百万，k 表示千，资源差异本身已经很大。</aside>

<p>输入 token 包括缓存读写，每次重新处理旧上下文都计入；输出使用服务报告的量，不把推理 token 再加一遍。Figure 4 的虚线只连接同一任务下“没有另一配置同时更省 token 且分数不低”的点，不是统一预算下的算法优势。</p>

<h2 id="从提交项目到状态检查与最终分数">4. Experiments：从提交项目到状态检查与最终分数</h2>


<p><strong>作者的评测器先核对接口，再操作工作副本、读取状态，最后判分。</strong>候选提交 <code>gb_levels.json</code>，声明关卡、结束场景、数值属性和对象标识，并给对象加 <code>gb_player</code>、<code>gb_enemy</code>、<code>gb_hazard</code>、<code>gb_collectible</code> 等组。评测器核对这些公开绑定，在工作副本装入自己的 driver 和 probe。提交者看不到具体检查与预期结果，也不能直接设置答案状态。</p>

<ol>
  <li>作者先在参考游戏编写、验证输入序列，再在候选保留同样动作时序，必要时从相对语义对象的位置开始，检查途中目标与最终目标。这叫 <strong>certified route</strong>。</li>
  <li>评测器再启动相同场景、等待相同时长，但不输入玩家动作，称为 <strong>no-input control</strong>。若它也到达目标，原路线记 0，排除按时间自动完成的假实现。</li>
  <li>Agent 在 <code>demos.json</code> 提交自己的演示动作。每段从第一关全新启动，不能注入状态或选隐藏起点；重复演示不重复增加覆盖率。<strong>这套独立功能演示不要求每段通关整场游戏</strong>，未演示的要求仍不算覆盖。旧的整场 <code>ops.json</code> 路径也被接受，附录短提示中的“clear the game”是保留的旧措辞。</li>
  <li>评测器录制游戏，再由视觉模型按 41 份游戏专属 <strong>rubric（逐项评分规则）</strong> 的 658 个条目评分。四组为玩法呈现、内容组成、引导与反馈、画面呈现，权重分别是 0.10、0.18、0.27、0.45；只在适用组中重新归一化。每项先打 0–1 的实现程度，触发缺陷上限后再组内平均，不能靠其他好看画面抵消关键缺陷。</li>
</ol>

<figure class="figure wide"><a href="/lib/papers/swe-game/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/swe-game/body-method.svg" width="1050" height="913" alt="SWE-Game 参考输入路线、状态探针与同长度无输入对照的判分流程" loading="lazy" decoding="async"></a><figcaption>根据 Figure 2 与 §3.4、Appendix H 重绘。输入必须造成目标状态变化；若无输入也达标，该路线记零。具体题目的断言代码未公开。</figcaption></figure>

<p>Appendix H.6 的视觉请求还有一个实际运行覆盖规则：基础提示把没有观察到的内容记为 unknown，但覆盖规则要求所有适用项给数值，完全没有可见满足证据时可给 0。<strong>视觉分并不总能区分“没实现”与“没拍到”</strong>，也不能认证隐藏碰撞、音频或精确输入时延。judge 必须引用候选帧和对应条款；参考图、资产预览以及画面内文字不能自行证明候选正确。</p>

<div class="case"><h4>Beacon Relay 的一条可执行验收链</h4><ol><li>Agent 看到 GDD、资产、参考视频以及公开动作和对象绑定要求，写出候选项目，把玩家、cell、敌人、beacon 和实时进度登记到统一接口。</li><li>评测器全新启动游戏，运行自己的输入程序。公开 GDD 要求：碰到台座上的 cell 后，场景中的收集物数量减少，fuse 开始倒计时；携带 cell 与 beacon 重叠后，progress 增加且 fuse 停止。</li><li>probe 读取碰撞、对象出现或移除以及 <code>progress</code>/<code>timer</code> 的变化。隐藏路线的按键时长、起点参数和断言代码尚未公开。</li><li>同长度 no-input control 不得产生同样的拾取或送达结果。若候选只按时间自动增加 progress，即使最后显示胜利，这条行为仍不给分。</li></ol><p class="source-note">最后一条 FAIL 是根据公开规则整理的解释性轨迹。论文没有发布对应的模型原始记录，也没有公开这道题的检查文件。</p></div>

<div class="formula">Construction（0–100）: <code>S = 100 × (0.85O + 0.15V)</code><br>Repair case: <code>S = 100 × restoration × retained routes × preservation × validity</code></div>

<p>三类从头构建任务先按各自模式的权重合并客观检查分，再加入 15% 的视觉分。Bug Repair 在每道题内把四个因子相乘，任何一项接近 0 都会压低整题，最后对 83 道修复题取算术平均。移植任务则按玩法机制 35%、可玩性 25%、结构 15%、视觉 15%、稳定性 10% 加权；除修复外，各模式都有 41 道题，分别取平均。</p>

<p>式中的 <code>O</code> 与 <code>V</code> 都在 0–1；论文 Equation 1 在这个尺度计分，主表再乘 100。<code>O</code> 是把最高 85 分的客观加权项除以 85；<code>V</code> 是视觉分，不是“文件有效”这个布尔量。修复式依次检查故障行为是否恢复（restoration）、原输入路线是否保住（retained routes）、无关行为是否仍正确（preservation）、产物是否有效（validity）。四个因子都在 0 至 1：假设恢复 90% 故障行为、保住 80% 原路线、满足全部保留行为要求且产物有效，则 <code>S=100×0.9×0.8×1×1=72</code>。若有 10% 无关行为被破坏，保留要求因子变成 0.9，分数降为 64.8。这是本文算例，不是某个修复任务的公开日志。必须先逐题相乘再平均；把四列均值相乘，通常不能复算主表 83.46。</p>

<div class="table-scroll"><table><thead><tr><th>从头构建模式</th><th>Mechanics</th><th>Content</th><th>Playability</th><th>Design / Scaffold</th><th>视觉</th></tr></thead><tbody>
<tr><td>Brief-to-Game</td><td>26.71%</td><td>42.50%</td><td>13.36%</td><td>Design 2.43%</td><td>15%</td></tr>
<tr><td>GDD-to-Game</td><td>27.50%</td><td>43.75%</td><td>13.75%</td><td>—</td><td>15%</td></tr>
<tr><td>Skeleton Completion</td><td>31.57%</td><td>34.00%</td><td>8.50%</td><td>Scaffold 10.93%</td><td>15%</td></tr>
</tbody></table></div>

<p>这是 Table 9 的最终分权重，不要在这些百分比之外再把客观项乘一次 0.85。修复题也有构造准入：同一测试场景必须在参考版通过、故障版的指定行为失败、未受影响行为仍通过，才打包进 83 个案例。故障包会混入看似可疑但无害的改动，修复不要求补丁与参考答案逐字一致。</p>

<div class="table-scroll"><table><thead><tr><th>模型 + 各自框架</th><th>Brief</th><th>GDD</th><th>Skeleton</th><th>Repair</th><th>Porting</th></tr></thead><tbody>
<tr><td>Qwen3.8 Flash</td><td>27.00</td><td>37.35</td><td>39.19</td><td>26.13</td><td>51.23</td></tr>
<tr><td>Grok4.6</td><td>39.01</td><td>48.55</td><td>40.76</td><td>52.44</td><td>59.04</td></tr>
<tr><td>GPT-5.6 Luna</td><td>34.18</td><td>52.67</td><td>43.10</td><td>58.05</td><td>59.85</td></tr>
<tr><td>Opus5</td><td><strong>50.38</strong></td><td><strong>59.68</strong></td><td><strong>54.06</strong></td><td><strong>83.46</strong></td><td><strong>72.40</strong></td></tr>
<tr><td>GLM5.3 Flash</td><td>31.05</td><td>40.18</td><td>34.38</td><td>27.55</td><td>44.33</td></tr>
<tr><td>Minimax M3</td><td>30.47</td><td>42.58</td><td>35.69</td><td>27.36</td><td>49.62</td></tr>
</tbody></table></div>

<p>各列是不同规则下的 0–100 分，修复高分不能解读为“从头做游戏成功率更高”。所有模型 GDD 分都高于 Brief，但输入与评分权重一起改变，不能当成只加一份 GDD 的单变量消融。</p>

<div class="table-scroll"><table>
  <thead><tr><th>模式</th><th>Opus5</th><th>第二名</th><th>最值得看的分解</th></tr></thead>
  <tbody>
    <tr><td>Brief-to-Game</td><td>50.38</td><td>Grok4.6 · 39.01</td><td>Mechanics 27.55；Playability 80.99</td></tr>
    <tr><td>GDD-to-Game</td><td>59.68</td><td>GPT-5.6 Luna · 52.67</td><td>Mechanics 32.96；VLM 75.03</td></tr>
    <tr><td>Skeleton Completion</td><td>54.06</td><td>GPT-5.6 Luna · 43.10</td><td>Scaffold 94.62；Content 36.93</td></tr>
    <tr><td>Bug Repair</td><td>83.46</td><td>GPT-5.6 Luna · 58.05</td><td>Restoration 90.18；retained routes 99.51</td></tr>
    <tr><td>Godot-to-Unity</td><td>72.40</td><td>GPT-5.6 Luna · 59.85</td><td>Structure 90.53；Visual 58.40</td></tr>
  </tbody>
</table></div>

<p><strong>比起总榜，各评分项之间的落差更能解释问题。</strong>Mechanics 检查输入、碰撞和状态变化是否满足玩法要求；Content 检查指定内容和资产是否实现；Playability 检查演示覆盖、完成过程和动作依赖；Scaffold 检查初始工程接口是否保留并接入。Skeleton Completion 中，Opus5 的 Scaffold 得 94.62，却只拿到 36.93 Content 和 36.22 Mechanics。移植也类似：GPT-5.6 Luna 的 Structure（内容与跨引擎结构一致性）为 82.87，Playability 为 51.44，Visual 为 31.60。项目结构合格并不代表玩法与呈现已经迁移完成。</p>

<p>Figure 6 的 Beacon Relay 候选分别是 Opus5 59.68（功能贡献 49.70 + 视觉贡献 9.98）、GPT-5.6 Luna 27.84（22.02 + 5.82）、GLM5.3 Flash 32.99（31.17 + 1.82）。<strong>这里的两项已经是加权贡献，直接相加，不能再乘 0.85/0.15。</strong>截图显示了不同布局与呈现，图中却没有逐条测试日志，也未写明任务模式；不能把整体失分精确归因于某个 fuse 或送达断言失败。</p>

<h3 id="自动检查的人工校准">4.1 自动检查的人工校准</h3>

<p>作者从三类从头构建任务的 100 个 Agent 项目中分层抽取 1,200 条行为断言，由人判断是否成立：每个项目九条 Mechanics、三条 Content。它们不含用于构造检查器的参考游戏和注入故障案例，避免直接在制订测试的原样本上验证测试。可执行检查正确接受 411/452 条真人判为正确的行为，并抓到 705/748 条缺陷；两率为 90.93% 和 94.25%，算术平均正好是 92.59% balanced accuracy。balanced accuracy 在这里就是“接受正确行为”和“检出缺陷”两种准确率等权平均。视频 VLM 的对应值约为 78.41%，差距主要在缺陷检出率：75.40% 对 94.25%。</p>

<p>视觉侧在 200 段录像上与人工评分的 <strong>Spearman ρ=0.829</strong>，表示排序的一致程度；平均绝对误差 MAE 为 0.103，同一录像重复评分的标准差为 0.034。论文没有披露人工标注者数量、一致率，也没有命名视觉 judge 的具体模型。自动检查还有 41 条正确行为被拒绝、43 条缺陷被接受，因此 92.59% 支持在这批样例上优于视频判断，不代表所有机制都可靠。</p>

<figure class="figure wide"><a href="/lib/papers/swe-game/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/swe-game/body-results.svg" width="1050" height="672" alt="SWE-Game 五种任务模式的组件分数和最佳配置对照" loading="lazy" decoding="async"></a><figcaption>根据 Table 3 重绘。三类从头构建任务的最佳总分仍低于 60；修复与移植另用各自计分规则，不能混成同一种成功率。</figcaption></figure>

<h2 id="对游戏开发系统的改进方向">5. Discussion：对游戏开发系统的改进方向</h2>

<p><strong>应先逐条实现需求，再用玩家动作验证它真的发生。</strong>人工复核中，GPT-5.6 Luna 的已分类问题有 56.4% 是遗漏需求，Opus5 为 36.9%；GLM5.3 Flash 最大类别是玩法逻辑错误，占 52.2%。前一类需要记录设计文档每项要求对应哪段实现、哪段演示；后一类需要触发拾取、伤害、计时和送达，再核对状态变化。这两个改进目标不同，不宜只增加一次截图检查。</p>

<p>这些百分比的分母是每个模型<strong>已归类的问题数量</strong>，一份游戏可以贡献多个问题；不是“56.4% 的游戏漏需求”。论文没给出完整逐问题记录，不能据此推算所有 247 题的错误频率。</p>

<p>参考视频的消融在相同 41 题上只改变 Agent 输入，评测器仍保留相同参考证据。加入视频让 GPT-5.6 Luna 的 <strong>VLM 视觉总分</strong>提高 5.60，Opus5 提高 2.23；这不是完整任务总分的增量。两者的 Visual Presentation（画面呈现）分别提高 6.48 和 9.00，Content Composition（内容组成）反而分别下降 6.01 和 9.93。稳定增益在呈现，其他组方向混合；这组实验没给出足够证据说明视频一定改善玩法正确性。</p>

<p>一个可信的后续实验应把模型和运行框架拆开：同一模型跑统一 harness，同一 harness 再换模型；固定实际运行时限、token 和工具调用预算，以及视频读取能力；每题重复运行并报告方差。评测器也应公开任务文件、参考路线的编写和验证过程、状态探针代码与人工标注规程，让外部研究者能检查隐藏测试是否过度依赖接口声明，或漏掉非预期但正确的实现。</p>

<p>还有两项需要单独验证。固定参考动作时序可能拒绝移动参数不同但仍正确的候选，尤其是允许自由设计的模式；语义起点不能消除所有这类差异。无输入对照排除了“什么都不做也会过关”，却不排除任意按键触发的捷径；仍需途中条件、动作效果和状态变化共同检查。Unity 验收则使用评测器自己的固定构建程序，不执行 <code>BUILD.md</code> 里提交者写的任意 shell；SDK、依赖锁文件与引擎版本必须保持不变。</p>

<h2 id="结论与公开性限制">6. Conclusion：结论与公开性限制</h2>

<p><strong>这篇把“我们想要的游戏”拆成可执行的玩家动作、可观察状态和独立视觉证据。</strong>VLM 检查外观与呈现；玩法正确性则由引擎状态检查、参考输入重放和同长度无输入对照验证。这个分工比单一“像不像、能不能玩”的总评更容易定位问题。</p>

<div class="limit-grid"><div><b>任务规模</b><span>41 个中小型 Godot reference games，尚未覆盖大型项目和长期协作。</span></div><div><b>配置混杂</b><span>六个模型各配自己的 Agent framework 和 tools，缺少同 harness 对照。</span></div><div><b>复现缺口</b><span>截至 2026-10-08，论文未链接公开 benchmark、checker 或完整结果仓库。</span></div><div><b>统计边界</b><span>主榜未报告重复运行和方差；人工标注者数量与 agreement 未披露。</span></div></div>

<p>当前最强配置已经很会搭出可运行、可演示、结构合格的游戏项目，但三类从头构建任务仍没有一个总分达到 60。指定玩法没有完整实现、要求的内容有所遗漏，是主要失分来源。SWE-Game 给出了一套值得继续验证的评测方向，也留下了足以影响排名解释的公开性与实验控制问题。</p>

<p class="source-note">证据范围：本文依据 arXiv:2609.33678v3 的 28 页正文、附录、全部 Figure 1–6 与 Table 1–9，以及 arXiv v1 日期元数据。2026-10-08 检查论文页面和公开搜索时，没有找到作者链接的正式 benchmark/checker repository；一个同名的公开 task catalogue 属于另一套任务，未作为本文证据。</p>

</div>

---
title: "[2026-10-03] Video2World: Benchmarking Coding Agents for Interactive World Modeling from Embodied Videos"
permalink: "/posts/论文解读/video2world.html"
date: "2026-10-06T22:10:00+08:00"
updated: "2026-10-13T12:00:00+08:00"
cover: "/lib/papers/video2world/cover.svg"
description: "只给一段操作视频，Agent 要写出能在物理模拟器里完成同一任务的场景与控制代码。本文用立瓶子的完整案例说明输入、隐藏标注、执行状态、成功判据、评分公式与九套系统的结果。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 19
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "World Model"
  - "Embodied AI"
  - "Simulation"
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Aether Labs · arXiv:2610.04432v1 · 最早公开于 2026-10-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2610.04432">论文主页</a>
  <a href="https://arxiv.org/pdf/2610.04432">论文 PDF</a>
  <a href="https://aetherlabsai.github.io/Video2World">项目页</a>
  <a href="https://github.com/AetherLabsAI/Video2World">官方代码</a>
  <a href="https://huggingface.co/datasets/AetherLabs-AI/Video2World">公开数据</a>
</div>

<section class="deck-wrap" aria-label="Video2World 交互图解">
  <div class="deck-head"><strong>19 页交互图解 · 任务边界、真实案例、评分与结果</strong><a href="/lib/decks/video2world-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/video2world-visual-guide.html" title="Video2World 论文图解，共 19 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">Video2World 给 Agent 一段人或机器人操作的视频，要求它写出一个能在物理模拟器中完成同一任务的程序包。Agent 要恢复场景、物体尺寸、机器人位置，再生成控制动作。<strong>机器人必须真的拿起、放下、开合或装配物体，任务完成和画面相似分开评分。</strong></p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 这里的 world model 是可以运行的模拟程序

论文所说的 **interactive world modeling** 是把视频场景与动作写成可以运行的模拟程序。三维表面由 **mesh**（网格模型）表示；物体初始位置、朝向、尺寸、质量和摩擦，以及相机与机器人配置，都进入场景文件。另一个动作数组控制机器人，评测器把整个 **package**（程序包）加载到 SAPIEN、Isaac Sim 或 MuJoCo，记录真实的模拟执行。

视频生成只产生画面；三维重建主要恢复形状与外观；这里还要让动作在物理条件下成立。一次实际执行中任务是否完成记为 **Task Success**。瓶子画得很像却抓不住，这项仍为 0；能正确加载并启动场景则记为 **Build=1**，也不能替代任务成功。把任务完成程度、几何相似程度与运动相似程度合成的评分叫 **V2WScore**，具体计算在方法部分。
</aside>

<div class="interest"><b>博客作者兴趣度 9.2 / 10</b><span>评分只表示博客作者本人兴趣程度；它连接代码 Agent、可执行场景重建与机器人评测，但分母说明和系统间公平比较仍有缺口</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>189</strong><span>输入视频；Table A8 列出九组来源</span></div>
  <div class="metric"><strong>222</strong><span>重建任务实例，覆盖 39 类任务</span></div>
  <div class="metric"><strong>48.52</strong><span>最强自动系统 Fable-5.1 的 V2WScore</span></div>
  <div class="metric"><strong>25.5%</strong><span>Fable-5.1 的 Task Success；39 类任务等权平均</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>交付物是一个可执行模拟程序包。</strong>它至少包含场景、动作、控制协议和本地资源；单独生成视频或三维表面网格都不够。</li>
    <li>功能、几何与运动分开测：Task Success 检查任务完成，几何与轨迹误差检查是否像参考；不能只挑一个最好指标称“重建最准确”。</li>
    <li><strong>最强自动系统也只达到 48.52 / 100。</strong>Fable-5.1 的 Task Success 为 25.5%；人类辅助重建（HAR）在主表为 58.8%，附录 C.5 又写为 57.3%。这处统计冲突需要保留，不能自行选一个替代另一个。</li>
    <li>GPT-6 Astra 的 Shape CD（物体形状的点云误差）和 Size error（尺寸误差）在自动系统中最好；Fable-5.1 的总分、任务成功率与 Scene CD（整场景表面误差）更好。各列回答的问题不同。</li>
  </ul>
</aside>


<h2 id="动机：视频没有自动给出能交互的模拟世界">1. Motivation：视频没有自动给出能交互的模拟世界</h2>

**视频容易采集，但变成能执行的世界仍需要大量补充工作。** 场景资源、机器人配置、物体状态与控制程序不会自动从画面里出现。

真实机器人数据集和第一视角人类视频越来越多，里面有完整的抓取、移动、装配和工具使用过程。但一段 RGB 视频不会直接告诉我们桌面坐标、相机内外参、物体 mesh、碰撞体、质量、关节位置，更不会自动给出能让另一台机器人复现动作的控制序列。传统真实场景转模拟器的 real-to-sim 流程要把这些部分逐项补齐，成本高，也很难扩展到大量新场景。

Video2World 的研究问题因此很具体：给 coding agent 一段视频，以及目标模拟器和机器人的公共接口说明，它能不能通过读图、写文件、执行自己的候选重建、观察报错和反复修改，最终交出一个可运行的环境？这同时考查视觉理解、几何估计、3D 资源制作、机器人控制、物理调试和长程工具使用。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/figure-1.png" target="_blank" rel="noopener"><img src="/lib/papers/video2world/figure-1.png" width="2024" height="1104" alt="Video2World 从视频输入到可执行 simulator package 的任务概览"></a>
  <figcaption>原论文 Figure 1。输入既包括机器人示范，也包括第一/第三视角的人类示范；输出需要在目标机器人与模拟器中重建场景并完成相同任务。论文为 CC BY-SA 4.0，图像按同许可引用。</figcaption>
</figure>

这个 benchmark 同时测“看起来像”和“真的能做”。只测任务成功，Agent 可以用极简几何体甚至取巧完成目标；只测几何，又无法判断世界是否可以交互。Video2World 用功能、静态几何和动态轨迹三组指标区分这些失败。

<h2 id="相邻工作：视频策略、场景重建与可执行程序">2. Related Work：视频策略、场景重建与可执行程序</h2>

**它要求把理解视频、恢复场景和控制目标机器人一起交付。** 目标机器人或手的类型叫 embodiment；同一视频换一种 embodiment，会形成不同任务实例。

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>输入与输出</th><th>主要检查</th><th>与 Video2World 的差别</th></tr></thead>
  <tbody>
    <tr><td>Video2Policy</td><td>人类视频 → 机器人动作策略</td><td>机器人能否模仿任务</td><td>重点是训练动作策略，不要求代码 Agent 交付完整模拟场景与资源。</td></tr>
    <tr><td>Agentic Real2Sim</td><td>真实观察 → 可执行模拟</td><td>自动把真实场景还原到模拟器</td><td>问题最接近；Video2World 更强调统一 benchmark、隐藏参考与九套代码 Agent 的系统比较。</td></tr>
    <tr><td>BVB</td><td>视频 → Blender 场景 / 构建过程</td><td>视觉与场景重建</td><td>主要在 Blender 与视觉结果上评测，不把机器人控制和任务评分作为中心。</td></tr>
    <tr><td>SceneActBench</td><td>已有三维场景的视觉观察与操作任务 → 场景操作</td><td>Agent 能否在看到的三维场景里执行指定操作</td><td>不要求从一段操作视频恢复整个模拟场景和机器人控制程序。</td></tr>
    <tr><td>CaP-X</td><td>多模态观察 → 控制机器人的代码</td><td>代码能否控制机器人</td><td>侧重控制程序；Video2World 还要求恢复环境几何、相机与对象属性。</td></tr>
    <tr><td>EmbodiedSWE</td><td>具身任务与机器人接口 → 可执行控制代码</td><td>代码在具身环境中能否完成物理任务</td><td>主要检查控制行为；Video2World 还把场景重建本身作为交付物和评分对象。</td></tr>
  </tbody>
</table>
</div>

论文提供了一条完整的 coding-agent 评测链：统一的公开说明、提交格式、simulator runner（负责加载和执行提交的程序）、隐藏参考答案和按任务编写的 judge。结果表同时包含 OpenCode、Codex CLI 和 Claude Code 的原生 harness（给模型提供工具并管理执行的框架）。这些 harness 并不完全相同，因此 Table 2 是 **system-level comparison（模型与执行框架整体比较）**，不能当作只更换模型的排行榜。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/figure-2.png" target="_blank" rel="noopener"><img src="/lib/papers/video2world/figure-2.png" width="2020" height="999" alt="Video2World benchmark 的数据来源、构造、Agent 执行和评测总览"></a>
  <figcaption>原论文 Figure 2。视频与 simulator profile（机器人和模拟器的目标配置）组成任务；Agent 反复构建并执行候选重建，隐藏 evaluator 再计算功能、几何和运动指标。</figcaption>
</figure>

<h2 id="协议：视频、人工参考与隐藏物理判定">3. Benchmark / Protocol：视频、人工参考与隐藏物理判定</h2>

**作者把 189 段视频配到目标模拟器、机器人与 end-effector（末端工具），形成 222 个重建实例。** 其中 33 段人类视频各配机械臂和 paired-hand（成对机械手）两个版本。附录 Table A8 的来源清单如下，共九组。

<div class="table-scroll">
<table>
  <thead><tr><th>来源</th><th>视频 / 实例</th><th>它补充的任务类型</th></tr></thead>
  <tbody>
    <tr><td>FurnitureBench</td><td>64 个实例</td><td>家具零件操作与装配</td></tr>
    <tr><td>DROID</td><td>20</td><td>真实机械臂日常物体操作</td></tr>
    <tr><td>RoboDojo</td><td>25</td><td>跨任务机器人示范</td></tr>
    <tr><td>HOI4D</td><td>9 段视频 / 18 个实例</td><td>第一视角的人与物体交互</td></tr>
    <tr><td>HOT3D</td><td>7 / 14</td><td>手部与物体交互</td></tr>
    <tr><td>DexYCB</td><td>11 / 22</td><td>手-物体抓取</td></tr>
    <tr><td>OakInk2</td><td>6 / 12</td><td>双手物体操作</td></tr>
    <tr><td>In-house household</td><td>37 / 37</td><td>家居操作，目标为 G1 与 Omnipicker 夹爪</td></tr>
    <tr><td>Reconstructed twins</td><td>10 / 10</td><td>真实视频配人工重建的物理目标：平面推动 3、绳索穿槽 5、软玩具装入容器 2</td></tr>
  </tbody>
</table>
</div>

<figure class="figure source">
  <a href="/lib/papers/video2world/task-family-counts.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/task-family-counts.svg" width="468" height="500" alt="39 个 task families 的实例数量分布"></a>
  <figcaption>原论文 Figure A1：39 个 task families（共用一套任务判定逻辑的类别）的完整清单，共计 222 个视频与目标配置组合。机械臂与机械手版本分开计数，但可以共享同一段原视频。</figcaption>
</figure>

这些视频窗口不是 189 次彼此独立的采集：64 个家具片段来自 46 个原始 episode（一次完整录制），一些人类片段也共享较长的源录制。家具窗口按装配步骤设数量上限，排序时会使用参考执行结果和终态一致性；这是偏向可重建片段的筛选，不是随机抽样。失败的已选参考仍保留。

作者先用源数据构造隐藏标注，再另做人类辅助重建（HAR）。标注记录对象身份、尺寸、初始位置、随时间变化的位姿、目标关系、拿起/松手事件及观测有效区间。FurnitureBench 可用 CAD、相机标定和机器人日志；DROID 需要拟合对象与支撑面；人类视频依赖各源数据已有的对象和相机信息；重建对照组则使用明确注明来源的建模目标。<strong>这些额外信息不给被测 Agent，HAR 执行也不是隐藏标注本身。</strong>

作者把任务规则与源视频、对象轨迹及物理执行一起复核，检查规则是否接受合理替代动作、拒绝未完成的交互。参考执行失败不会自动使一个标注作废，参考成功也不是样本入选的统一条件。论文没有报告独立多标注者的一致率或完整人工工时；不能把“作者复核”写成已经完成了这些验证。

<figure class="figure source">
  <a href="/lib/papers/video2world/annotation-example.png" target="_blank" rel="noopener"><img src="/lib/papers/video2world/annotation-example.png" width="1627" height="785" alt="Video2World 的视频和任务标注示例"></a>
  <figcaption>原论文 Figure A2：HOI4D 的移瓶示范。上方帧与下方源位姿曲线标出拿起和松手；手绘轮廓只是视觉指引，不是分割标注，也不是标注软件界面的截图。</figcaption>
</figure>

<h3 id="Agent-得到什么？">3.1 Agent 得到什么？</h3>

- RGB 视频、分辨率、帧数和播放信息；
- 目标模拟器与机器人的公共说明、资源文件、关节范围和控制格式；
- 终端、文件、图片查看和代码编辑工具；
- 自己候选重建的格式检查结果、执行视频（rendered rollout）和报错。

<h3 id="Agent-明确看不到什么？">3.2 Agent 明确看不到什么？</h3>

- 参考场景/网格、测量得到的示范轨迹和原始机器人日志；
- 隐藏相机标定、参考控制序列与参考提交；
- 按任务制定的成功条件与评测分数。

<h3 id="最终交付的-package-有什么？">3.3 最终交付的 package 有什么？</h3>

<figure class="figure wide">
  <a href="/lib/papers/video2world/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/body-method.svg" width="1000" height="1010" alt="Video2World 公开输入、隐藏信息、提交包和 evaluator 流程"></a>
  <figcaption>根据论文 Sections 3–5、附录 7–9 与官方 <code>docs/benchmark.md</code> 重绘。</figcaption>
</figure>

核心文件是 `protocol.json`、`actions.npy` 和 `scene.json` 或 `scene.xml`，另加本地 3D meshes、textures（纹理）、`source/` 与 `report.md`。某些机器人/模拟器配置还允许 `expected/obj_poses.npy`，但它只是 Agent 声明的预期物体轨迹，**不能直接驱动物体**。物体必须由 robot actuation（机器人控制）与 simulator physics 产生运动；否则任务 judge 和实际执行都不会认可。

评测对象是九套完整代码 Agent 配置。七个模型运行在 OpenCode `1.18.29`，GPT-6 Astra 使用 Codex CLI `0.154.0-alpha.6.2`，Fable-5.1 使用 Claude Code `2.1.276`。每个实例只有一次独立构建 session（可在其中多次修改），没有统一的总工具调用次数上限。

附录 E 给出共同的名义预算：180 分钟、60 美元和最多三次提交，但附录 A.5 区分了落实方式。OpenCode 由 benchmark executor 管理，接受有效提交后立即结束；未显式交付时，按阶段期限保留有效 checkpoint（中途保存的可用程序包），最终生成期限为 165 分钟。两个原生 harness 由外部进程监督，保留各自的终止与候选保存方式，不能说成同一套提交状态机。OpenCode 的 60 美元也是已观测账单阈值，延迟上报曾使一次 Opus 任务达到 61.07 美元。隐藏评分均不给 Agent，最终版本不按隐藏分数挑选。

<h3 id="程序包如何变成一次物理判定">3.4 程序包如何变成一次物理判定</h3>

评测器先检查文件格式并构建场景，再执行控制动作，记录机器人与物体状态。任务规则根据这些真实状态判断成功和进度，几何与轨迹指标另与隐藏参考比较；不是从最后一张截图猜是否完成。

<ul class="steps">
  <li><b>1 · 格式检查</b><span>检查文件结构、资源路径与控制数组是否合法。</span></li>
  <li><b>2 · 构建</b><span>在 SAPIEN、Isaac Sim 或 MuJoCo 中加载场景与机器人。</span></li>
  <li><b>3 · 执行</b><span>按 <code>protocol.json</code> 的时间步执行 <code>actions.npy</code>。</span></li>
  <li><b>4 · 判定</b><span>按任务规则检查接触、支撑、释放、姿态与静止状态。</span></li>
  <li><b>5 · 比较</b><span>在参考时间戳上计算几何误差与绝对/相对位姿误差。</span></li>
</ul>

<h3 id="真实案例：把横放的小瓶立起来">3.5 真实案例：把横放的小瓶立起来</h3>

论文 Appendix 8.4 完整公开了一次 GPT-6 Astra 在视觉反馈下反复修改后的提交（visual-refinement submission）。输入来自 DROID：**83 帧、640×640、7.5 Hz**；原视频取第 64–228 帧，每隔一帧抽取一次，因此可见示范约 **10.93 秒**。任务是抓起横放在桌上的小瓶，把它转成直立姿态，重新放到桌面并松手；目标配置是 SAPIEN + Panda + Robotiq 2F-85。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/worked-evaluation-example.png" target="_blank" rel="noopener"><img src="/lib/papers/video2world/worked-evaluation-example.png" width="1394" height="1139" alt="Video2World 直立瓶子案例的输入、重建和评测结果"></a>
  <figcaption>原论文 Figure A3。上排是输入示范，中排是提交动作在重建场景中的执行；下方分别画出瓶子运动和示范时间轴上的平移误差。两排帧的时间并不相同。</figcaption>
</figure>

Agent 看到了视频帧拼图（contact sheet）、机器人与 TCP（tool center point，末端工具中心点）规范和提交格式。此处来自独立的 visual-refinement 实验：外部 controller（负责执行的控制程序）在两轮之间运行候选，将初始渲染、动作视频拼图、逆运动学误差和静止诊断交给 Agent；<strong>这个案例没有赋予 Agent 直接运行 simulator 的工具</strong>。相机标定、物体几何、参考轨迹、任务标注和分数仍隐藏，不能拿它冒充主榜所有系统完全相同的执行权限。最终程序包包含瓶子网格、桌面与背景几何、估计的相机和机器人位置，另有 **97×7 的控制数组**（`dt=0.2 s`）和 **83×7 的预期物体位姿**。预期位姿仍然只是声明；评测器从实际物理执行记录（physics rollout）中采集了 **97 个物体状态**。

执行时间线说明了为什么不能只比较视频帧：0.4 秒抓住瓶子，2.6 秒开始移动，12.8 秒松手，19.2 秒才完成终态判定。运动轨迹误差只在 83 个示范时间戳上比较；示范结束后的 41 个执行状态不进入运动误差评分，但任务评分程序仍会用它们确认物体最后是否稳定。

<figure class="figure wide">
  <a href="/lib/papers/video2world/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/body-case.svg" width="1000" height="1115" alt="从瓶子视频、提交数组、实际执行状态到支撑直立松手静止判定的真实案例"></a>
  <figcaption>根据 Figure A3、Appendix 8.4 与公开 <code>v2w/metrics/task.py</code> 重绘，整理实际执行与评分顺序。图中 FAIL 是按核对过的规则推演；本例官方 Task Success 为 1。</figcaption>
</figure>

<h3 id="立瓶子：成功判据与一个具体失败分支">3.6 立瓶子：成功判据与一个具体失败分支</h3>

官方 `v2w/metrics/task.py` 中，这个 upright-bottle family 的最终逻辑可简化为：

<div class="code-scroll"><pre><code>&#35; 根据官方 task.py:652-675 简化，不是完整可运行 checker
geometry_ok = supported and angle_deg &lt;= 30
success = geometry_ok and released and quiescent</code></pre></div>

还要先通过 `gate_initial_goal`：如果瓶子一开始已经直立，Agent 什么都不做不能得分。这个实例要求瓶子最后由提交中声明的 tabletop（桌面支撑体）托住，实测支撑间隙 support gap 小于 0.01 mm，瓶轴和桌面法线约差 0.009°，机械手已经松开，且处于 quiescent/rest（物体运动足够小的静止状态）。公开门槛还包括 30° 的直立容差、1 cm 的支撑间隙和 5 mm 的桌面边界余量。

如果最后角度已经小于 30°、接触桌面也合格，但 <code>grasping_final=true</code>（仍被夹着），代码返回失败，原因是 <code>still held or release unrecorded</code>；缺少静止证据也失败。这是根据已核对代码推演的说明，不是本例实际日志。当前规则还要防止初始就已完成目标的偷懒提交；案例的旧公开 brief 曾有绝对终点限制，但当前评分用的是桌面支撑与直立语义条件，绝对位置误差另报。

该提交最终得到 Build=1、Task Success=1、Progress=100%；Scene CD 2.51 cm、Shape CD 3.58 cm、Size error 5.76 cm。按示范时刻比较平移的 T-APE 为 7.77 cm、比较朝向的 R-APE 为 9.27°；比较短时位移增量的 T-RPE 为 0.68 cm。T 表示平移，R 表示旋转。initial centre error（初始中心位置误差）达到 24.80 cm，但任务仍成功：瓶子在提交场景中完成了要求的交互，场景位置是否像原视频则另测。

<h3 id="几何、运动与复合分数怎么算">3.7 几何、运动与复合分数怎么算</h3>

表面点之间的距离叫 Chamfer Distance（CD）；每个时刻的位置或朝向误差叫 absolute pose error（APE）；两时刻间变化的误差叫 relative pose error（RPE）。这里各指标保留不同信息，不能把“对齐”理解成给所有指标统一消除误差：

- Scene CD 比较可见场景表面，关键操作物体和接收物权重更高。它允许平移、最多 15° 旋转与 0.95–1.05 倍缩放后拟合；按对象计算的中位距离与反向加权中位距离相加，各方向截到 10 cm。它不是普通点云均值公式的直接套用。
- Shape CD 比较物体自身表面，先做旋转和平移的刚性对齐，<strong>不缩放</strong>。Size error 另比较按大小排序的包围盒三条边；Centre error 保留初始位置误差。Scene CD 的拟合变换不用于这些位置与轨迹测量。
- T-APE 在示范时间戳上比较物体位移，但各减去自己的初始位置，所以去掉的是恒定初始平移。T-RPE 比较约 0.2 秒间隔的位移增量。R-APE 比较对应物体坐标系的朝向，并按标注处理对称性；它不减去初始朝向。主运动指标不做时间伸缩，已完整执行却比示范短时才按规则延用最后状态。

绳索、软玩具、布料和只能观察到表面点的家居任务使用各自适用的表面或点轨迹指标，不能强行当成完整刚体位姿。上述误差越小越好，但都不替代任务判断。

对误差 `e`，先按阈值 `τ` 转成 `[0,1]` 的质量分 quality：

<div class="formula">quality(e) = max(0, 1 − e / τ)</div>

其中 Scene / Shape / Size 的 `τ=10 cm`，T-APE 为 20 cm，R-APE 为 90°，T-RPE 为 10 cm。然后：

<div class="formula">F = (Task Success + Progress) / 2<br>G = 该实例适用的几何质量分均值<br>D = 该实例适用的动态质量分均值<br>V2WScore = Build × (F + G + D) / 3</div>

分数先在每个实例内计算，再对同类任务汇总，最后对非空、评分适用的类别等权平均并乘 100。评分资格要求有任务标注，并至少有一项几何和一项运动测量。哪些项适用，由参考标注预先固定，不由候选决定；构建失败仍在分母内，复合分为 0。已适用测量缺失、版本错误或评分器执行失败，会使公开 <code>scoring.py</code> 报告 <code>blocked</code>，不能删除难项缩小分母。真正不适用的项才不进入该实例的 G/D。

单独报告的几何/运动误差均值与复合分的口径不同：它们只在构建成功且标注适用的实例上计算类内均值，再平均有测量的类别。因此不同方法可能覆盖不同连续误差子集；比较时需要同时看可评测数量。Build、Success、Progress 则保留构建失败为零。Progress 的任务阶段也不是所有环境统一“四步”：刚体任务计算同一次抓取尝试里按顺序完成的最长阶段前缀，原生 RoboDojo、布料和软体任务有各自规则。

把上述瓶子案例代入公开公式，可得到 `F=1`，`G=((1−2.51/10)+(1−3.58/10)+(1−5.76/10))/3≈0.605`；`D=((1−7.77/20)+(1−9.27/90)+(1−0.68/10))/3≈0.814`，重算结果约为 **80.6 / 100**。论文明确说这个完整案例没有发布正式的实例复合分；80.6 只用于解释公式，**不是论文报告的官方数值**。

<h2 id="实验：能构建与能完成任务之间的距离">4. Experiments：能构建与能完成任务之间的距离</h2>

**Fable-5.1 的整体结果最好，GPT-6 Astra 的对象层几何误差更小，Claude Opus 5 的 Task Success 又高于 Astra；所有自动系统与人类辅助重建之间仍有明显距离。**

<figure class="figure wide">
  <a href="/lib/papers/video2world/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/body-results.svg" width="1000" height="1110" alt="Video2World 九个系统与人类辅助重建的 V2WScore 和任务成功率"></a>
  <figcaption>根据论文 Table 2 重绘。复合分与任务成功分开列出；二者均先在类内平均，再对 39 个 task families 等权平均。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>Method</th><th>V2WScore</th><th>Build</th><th>Success</th><th>Progress</th><th>Scene CD</th><th>Shape CD</th><th>Size</th><th>T-APE</th><th>R-APE</th><th>T-RPE</th></tr></thead>
  <tbody>
    <tr><td>HAR</td><td><strong>74.24</strong></td><td>100.0</td><td>58.8</td><td>.70</td><td>2.19</td><td>.15</td><td>.43</td><td>9.40</td><td>41.09</td><td>2.42</td></tr>
    <tr><td>Fable-5.1</td><td><strong>48.52</strong></td><td>93.1</td><td><strong>25.5</strong></td><td>.53</td><td><strong>5.35</strong></td><td>1.00</td><td>2.78</td><td><strong>18.71</strong></td><td>104.61</td><td>8.25</td></tr>
    <tr><td>GPT-6 Astra</td><td>43.55</td><td>93.1</td><td>10.7</td><td>.33</td><td>6.23</td><td><strong>.69</strong></td><td><strong>1.62</strong></td><td>20.78</td><td><strong>95.08</strong></td><td><strong>6.19</strong></td></tr>
    <tr><td>Claude Opus 5</td><td>41.56</td><td>92.8</td><td>16.0</td><td>.34</td><td>6.01</td><td>1.14</td><td>3.13</td><td>19.37</td><td>110.85</td><td>8.42</td></tr>
    <tr><td>Kimi K3</td><td>33.19</td><td>92.0</td><td>4.8</td><td>.21</td><td>8.08</td><td>1.41</td><td>4.23</td><td>27.28</td><td>111.16</td><td>14.29</td></tr>
    <tr><td>GPT-5.6 Sol</td><td>31.00</td><td>92.5</td><td>2.5</td><td>.11</td><td>7.79</td><td>1.37</td><td>3.76</td><td>31.68</td><td>105.03</td><td>18.00</td></tr>
    <tr><td>DeepSeek V4.1 Flash</td><td>30.54</td><td>92.4</td><td>4.1</td><td>.13</td><td>8.59</td><td>1.50</td><td>4.13</td><td>34.64</td><td>104.52</td><td>20.85</td></tr>
    <tr><td>Gemini 3.8 Flash</td><td>30.11</td><td>93.1</td><td>2.0</td><td>.09</td><td>8.57</td><td>1.25</td><td>3.67</td><td>37.97</td><td>114.82</td><td>28.65</td></tr>
    <tr><td>Qwen3.8 Max</td><td>26.55</td><td>87.6</td><td>1.5</td><td>.11</td><td>8.36</td><td>1.51</td><td>4.13</td><td>41.28</td><td>110.06</td><td>27.38</td></tr>
    <tr><td>GLM-5.3 Flash</td><td>25.69</td><td>87.7</td><td>2.0</td><td>.09</td><td>9.58</td><td>1.62</td><td>5.04</td><td>41.16</td><td>103.83</td><td>30.16</td></tr>
  </tbody>
</table>
</div>

这些列必须分开读。Fable-5.1 的 **V2WScore 48.52、Task Success 25.5% 和 Scene CD 5.35 cm** 都是自动系统第一。Astra 的 **Shape CD 0.69 cm、Size error 1.62 cm、R-APE 95.08° 和 T-RPE 6.19 cm** 最好，但 Task Success 只有 10.7%，低于 Opus 5 的 16.0%。所以它更像“物体形状和部分轨迹指标更准”，不能概括成“整个重建最准确”。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/geometry-function.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/geometry-function.svg" width="396" height="126" alt="几何 fidelity 与 Task Success 的关系"></a>
  <figcaption>原论文 Figure 4。系统层面 Shape CD 较低不保证 Task Success 更高；在每个模型和任务类别内，按几何误差由低到高分为四组时，误差较低组通常更容易成功，但仍有大量例外。</figcaption>
</figure>

<figure class="figure wide source">
  <a href="/lib/papers/video2world/construction-cases.png" target="_blank" rel="noopener"><img src="/lib/papers/video2world/construction-cases.png" width="1590" height="838" alt="Video2World 多种 Agent 重建结果与失败模式"></a>
  <figcaption>原论文 Figure A5 的两个 Astra 结果：取出记号笔只达到 39.4% 顶点在容器外，低于 95% 门槛；立瓶子则成功，但 Shape CD 与尺寸误差仍为 3.58 / 5.76 cm。功能完成和几何准确需要分开看。</figcaption>
</figure>

<h3 id="HAR-不是“只看同一段-RGB-的人类上限”">4.1 HAR 不是“只看同一段 RGB 的人类上限”</h3>

Human-assisted reconstruction（HAR，人类辅助重建）可以使用原始 CAD 设计文件、RGB-D 图像与深度、相机标定、机器人日志、任务判据与隐藏分数，并反复人工调试。它的 V2WScore 是 74.24；Task Success 主表按类别等权平均为 58.8%。附录 C.5 却列 113/222（50.9% 实例率）及 57.3% 类别均值，与主表不完全一致，下文保留这个报告问题。

HAR 的试验历史还表明它不是同预算的人类上限：家具批次记录 128 次试跑，覆盖 64 个实例；一批人类视频接触搜索覆盖 20/66 个机械臂/机械手配置，每配置 26–31 条记录，其他来源没有同样完整的总数。作者没有系统记录人工工时，不能从试跑时长推算。家具执行条件也不同：HAR 终态观察 10 秒，Agent executor 静置 1 秒，并有自己的有界抓取对齐或零件保持近似。相同评分定义不等于完全相同的执行条件。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/har-source-disclosure.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/har-source-disclosure.svg" width="894" height="444" alt="HAR 各来源的结果与已记录的尝试次数"></a>
  <figcaption>原论文 Figure A4。左侧报告最终选中的 reference execution；右侧只统计两组有完整试验记录的实验批次。未汇总的历史不是零次尝试，trial 数也不能换算成人工工时。</figcaption>
</figure>

<h3 id="成本、人工偏好与跨场景执行">4.2 成本、人工偏好与跨场景执行</h3>

九个系统合计约花费 **9,700 美元、1,044 agent-hours 和 286 L40S GPU-hours**。Fable 平均每次任务执行 14.03 美元、37.5 分钟；Astra 6.40 美元、14.6 分钟；Opus 13.83 美元、32.6 分钟；Kimi 平均 82.2 分钟，是最慢的一组。论文没有把性能、API 价格与实际经过时间合成一个效率指标。七种 OpenCode 配置用供应商账单，两个原生 harness 用 token 的标价等值；调用数记录也不一致。这不是精确同价格的成本对照。

人工偏好研究由 12 名内部评审完成，每个视频对交给三位评审，共保留 243 条有效判断，覆盖 81 个视频对、39 个案例。评审会同时看源示范和两份候选，判断哪份更忠实；“相当”和“两份都差”均按半胜半负进入 Bradley–Terry 相对偏好模型。68/243 条判断认为两份都差，不能把这种平局读成双方都成功。Human Preference Rating 的均值固定在 1000，是相对偏好分，不是成功百分比。评审来自作者与公司员工，区间按源视频重采样，不是独立外部人群的一致结论。

**同一份场景和动作一起成功，不代表拆开后仍能用。** 附录 D.1 已把动作和场景互换：Set A 选 20 个参考场景能被固定、读取物体状态的控制器完成的实例；Set B 选 44 个 HAR 动作在 HAR 场景中成功的实例。将 Agent 动作不变地放入 HAR 场景，两个子集的可用记录都只成功 2.3%；用隐藏初始物体位置平移整条动作后，分别升到 15.5% 和 15.1%。这说明初始位置错位影响很大，但并未单独控制其他差异。

在已经“自家动作＋自家场景”成功的记录中，Set A 的 19/43、Set B 的 30/63 仍同时失败于两项互换测试：参考控制器在 Agent 场景中失败，平移后的 Agent 动作在 HAR 场景中也失败。论文据此指出场景和动作可能互相适配。<strong>44% / 48% 是成功记录中两项互换均失败的比例，不是全 benchmark 的失败率。</strong>固定控制器失败也不能证明场景无法被任何控制器使用；这些诊断只覆盖支持的类别，且有缺失配对记录。

论文还测试了 9 段原视频、3 个模型在新布局上的执行：分别平移物体或目标，在两个方向取 2、5、10、15、20 cm 五档，每模型 180 次，共 540 次。直接复用原控制成功 525/540（97.22%）；让 Agent 针对新位置调整动作后成功 536/540（99.26%）。调整时固定场景、物理参数与任务规则，每布局重新开上下文，最多 10 次执行或 10 分钟，最后清空状态重测。它修复了 15 个失败中的 13 个，同时破坏了 525 个原本成功中的 2 个；Gemini 的结果反而从 98.33% 降到 97.78%。这只覆盖<strong>初始重建已经成功、位移已由 HAR 验证可行</strong>的同九个任务，不能推成新任务泛化或策略训练收益。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/rq2-paper.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/rq2-paper.svg" width="522" height="198" alt="三种模型在 shifted layouts 上直接复用与 adaptation 的结果"></a>
  <figcaption>原论文 Figure A6。每个模型在 9 段已成功重建的 source videos 上测试五档位移；0 cm 是原始 layout，阴影为按 source-video 配对 bootstrap 的 95% 区间。</figcaption>
</figure>

<figure class="figure wide source">
  <a href="/lib/papers/video2world/case-nine-models.svg" target="_blank" rel="noopener"><img src="/lib/papers/video2world/case-nine-models.svg" width="805" height="450" alt="九模型在 bowl nesting 和 can lifting 两个案例中的 judge 结果"></a>
  <figcaption>原论文 Figure A11。绿色是通过，灰色是任务条件未满足，红色是被 physical-validity checks（物理有效性检查）拒绝；它与页首演示中的 Figures A9-A10 配套，说明画面终态越过某个阈值仍不等于完整成功。</figcaption>
</figure>

<h2 id="下一步：先对齐分母，再区分感知与控制的失败">5. Discussion：先对齐分母，再区分感知与控制的失败</h2>

**后续实验首先要把每个实例、参考版本和失败计数公开对齐。** 当前正文的 222 与附录 215、HAR 的 58.8% 与 57.3%，都需要作者解释。相同场景与任务在不同目标机器人下还应独立重跑，避免错误配置让一种系统永远无法通过。

算法比较可以固定模型与 harness，分别给真实几何、真实相机、真实动作中的一项额外信息，观察哪部分能恢复 Task Success。这样的对照才可以分清视觉估计、资源构建和控制生成的瓶颈；高质量 Shape CD 并不证明整个动作已成功。

作者已经用初态满足目标的灯罩、未完全取出的记号笔和方向判定错误的瓶子修过评分器，并对保留执行重新评分。后续应扩大反例覆盖和独立复核，而不是把这些已完成检查再写成新实验。动作/场景互换也已做过；更有区分力的延伸是让多种独立控制器在<strong>匹配执行条件</strong>下测试同一重建，并公开全部适用与失败记录。

<h2 id="总结：可执行评测已经建立，可靠重建尚未解决">6. Conclusion：可执行评测已经建立，可靠重建尚未解决</h2>

**它最扎实地证明了：单段操作视频到可执行模拟程序包已经可以被标准化评测，强 coding-agent 系统能完成一部分任务，但可靠重建仍远未解决。**

<div class="limit-grid">
  <div><b>已经建立</b><span>公开输入、隐藏参考、可执行程序包、物理执行、任务判定、几何和轨迹指标被放进同一套 benchmark。</span></div>
  <div><b>关键结果</b><span>自动系统 build rate 多在 90% 左右，但最强 Task Success 只有 25.5%；“能加载”与“能完成任务”之间差距很大。</span></div>
  <div><b>比较边界</b><span>OpenCode、Codex CLI 与 Claude Code 的 harness 不同，结果是完整系统比较；HAR 还使用更多原始信息。</span></div>
  <div><b>下一步</b><span>应固定执行框架，公开逐实例记录和失败原因，再分别研究视觉估计、资源构建、控制生成和判定规则的可靠性。</span></div>
</div>

最明显的报告问题是统计分母。附录 C.4 说主评测固定使用 **222 个实例、39 类任务**，构建失败在 Build / Success / Progress 中计零；C.5 又列 S0=215、S2 primary=179、S1 HAR-pass=112。A2 段说没有成功参考的 18 个实例保留在主要集合，后面却说 S2 删除 A1 与 A2。79 页 v1 PDF 的 Table A12 说明本身就有未解析的“Table ??”，并非仅 HTML 转换丢失。论文也没有解释 222 与 215 的七个实例差额。本文按 Table 2 报主结果，将这些互相冲突的统计单列为待作者澄清，不能自行拼成一致的过滤流程。

Table 2 的 Fable **25.5%** 是 39 类任务等权平均的 Task Success；Table A12 的 **19.1% / 20.6% / 24.2%** 则使用三个按实例计算的分母。两组数统计口径不同，不能互相代换。这个缺口不推翻主结果，但会妨碍复现者核对样本过滤和失败计零方式。

我的判断是：Video2World 已经给出一套完整的评测框架。它把提交包、真实物理执行和任务专用评分器组合起来，比只看截图的世界生成评测更接近可用系统。结果也保留了重要的失败：大量 Agent 可以生成能加载的场景，却无法把对象稳定抓起、移动并放到正确状态。下一步应把失败分别归到视频测量、场景构建、robot retargeting（把示范动作转换到目标机器人上）、控制器生成、物理参数校准和 judge 设计，再在相同 harness 与相同预算下比较方法。

<figure class="figure wide source">
  <a href="/lib/papers/video2world/case-native-final.png" target="_blank" rel="noopener"><img src="/lib/papers/video2world/case-native-final.png" width="982" height="1123" alt="Video2World 原生机器人视频重建案例"></a>
  <figcaption>原论文 Figure A13：native robot example。论文附录还分别给出 pose、receiver、nine-bowl、nine-lift 与 egocentric cases；完整图组保留在页首演示中。</figcaption>
</figure>

<p class="source-note">主要来源：Video2World arXiv v1 全文与全部附录；官方仓库 revision <code>44b1760c52cc14e519aa88b5a91c374e09b81653</code>；官方 benchmark 文档、评分实现 <code>v2w/scoring.py</code>、配置 <code>v2w/config/score.json</code> 与 task judge <code>v2w/metrics/task.py</code>。论文图像依 CC BY-SA 4.0 引用，官方代码为 Apache-2.0。检查日期：2026-10-06。</p>

</div>

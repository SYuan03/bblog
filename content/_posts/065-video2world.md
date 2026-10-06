---
title: "[2026-10-03] Video2World: Benchmarking Coding Agents for Interactive World Modeling from Embodied Videos"
permalink: "/posts/论文解读/video2world.html"
date: "2026-10-06T22:10:00+08:00"
updated: "2026-10-06T22:10:00+08:00"
cover: "/lib/papers/video2world/cover.svg"
description: "Video2World 如何把单段具身视频变成可执行模拟器重建任务：逐项拆解 222 个实例的来源、Agent 可见边界、submission package、物理执行、task judge、V2WScore、真实直立瓶子案例与九套 coding-agent 系统的结果。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "World Model"
  - "Embodied AI"
  - "Simulation"
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

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
  <div class="deck-head"><strong>18 页交互图解 · 任务边界、真实 case、judge、V2WScore 与结果</strong><a href="/lib/decks/video2world-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/video2world-visual-guide.html" title="Video2World 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">Video2World 要测的不是“模型能否看视频生成一张相似的 3D 图”，而是更难的一件事：<strong>coding agent 能否只看一段真实的人或机器人的操作视频，写出一个能在物理模拟器中重新执行该任务的完整 package</strong>。场景、物体尺寸、机器人位置和控制序列都要自己恢复；最终还要真的完成拿取、放置、开合或装配，而不是只让渲染结果看起来相似。</p>

<div class="interest"><b>博客作者兴趣度 9.2 / 10</b><span>评分只表示博客作者本人兴趣程度；它直接连接 coding harness、可执行 world reconstruction 与具身评测，但分母说明和系统间公平比较仍有缺口</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>189</strong><span>输入视频，来自八类真实与合成来源</span></div>
  <div class="metric"><strong>222</strong><span>reconstruction instances，覆盖 39 个 task families</span></div>
  <div class="metric"><strong>48.52</strong><span>最强自动系统 Fable-5.1 的 V2WScore</span></div>
  <div class="metric"><strong>25.5%</strong><span>Fable-5.1 的 Task Success；39 类任务等权平均</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>交付物是一个可执行模拟器 package。</strong>它至少包含场景、动作、控制协议和本地 assets；单独生成视频或 3D mesh 都不够。</li>
    <li><strong>功能完成和外观相似分开测。</strong>task judge 判断任务是否真的完成；Chamfer Distance（点云之间的几何距离）、APE / RPE（轨迹误差）衡量重建与运动是否接近参考。</li>
    <li><strong>最强自动系统也只达到 48.52 / 100。</strong>Fable-5.1 的 Task Success 为 25.5%；人类辅助重建（HAR）也只有 58.8%，说明数据本身和控制器都有难度。</li>
    <li><strong>不能笼统地说 Astra“重建最准确”。</strong>GPT-6 Astra 的 Shape CD 和 Size error 最好，但 Fable-5.1 的总分、任务成功率与 Scene CD（整场景点云误差）更好。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 这里的 world model，不是生成一段未来视频

论文所说的 **interactive world modeling（可交互世界建模）**，是把视频里的场景和动作写成一个可以继续运行、施加控制并发生物理交互的 simulator。Agent 需要选择或创建 mesh，设置尺寸、质量、摩擦、相机、机器人初始位姿，再生成一串控制命令。评测器会从头加载这个 package，让机器人在 SAPIEN、Isaac Sim 或 MuJoCo 中真实执行。

因此，三个看起来相近的问题实际不同：**视频生成**只需产生像真的 pixels；**3D reconstruction**主要恢复几何与外观；Video2World 还要求恢复让任务发生的动作和物理条件。一个瓶子模型即使画得很像，如果机械臂抓不住、没有把它立起来，Task Success 仍是 0。
</aside>

## Q1. 为什么要评测“从视频重建可交互世界”？

**因为真实示范最容易获得，但现有具身系统通常还要人工准备 scene assets、robot configuration、object state 和 task-specific controller，才能把一段示范变成可训练或可测试的模拟环境。**

真实机器人数据集和第一视角人类视频越来越多，里面有完整的抓取、移动、装配和工具使用过程。但一段 RGB 视频不会直接告诉我们桌面坐标、相机内外参、物体 mesh、碰撞体、质量、关节位置，更不会自动给出能让另一台机器人复现动作的控制序列。传统 real-to-sim 流程要把这些部分逐项补齐，成本高，也很难扩展到大量新场景。

Video2World 的研究问题因此很具体：给 coding agent 一段视频，以及目标 simulator 和 robot 的公共接口说明，它能不能通过读图、写文件、执行自己的候选重建、观察报错和反复修改，最终交出一个可运行的环境？这同时考查视觉理解、几何估计、3D 资源制作、机器人控制、物理调试和长程工具使用。

<figure class="figure wide source">
  <img src="/lib/papers/video2world/figure-1.png" alt="Video2World 从视频输入到可执行 simulator package 的任务概览">
  <figcaption>原论文 Figure 1。输入既包括机器人示范，也包括第一/第三视角的人类示范；输出需要在目标 robot 与 simulator 中重建场景并完成相同任务。论文为 CC BY-SA 4.0，图像按同许可引用。</figcaption>
</figure>

这个 benchmark 最有价值的地方是把“看起来像”和“真的能做”同时保留。只测 task success，Agent 可以用极简几何体甚至取巧完成目标；只测几何，又无法判断世界是否可以交互。Video2World 用功能、静态几何和动态轨迹三组指标把两种失败分开。

## Q2. 它与相邻工作差在哪里？

**Video2World 把视频理解、场景重建、目标 embodiment（要执行任务的机器人或手）转换和物理执行放进一次完整提交。**

<div class="table-scroll">
<table>
  <thead><tr><th>工作</th><th>输入与输出</th><th>主要检查</th><th>与 Video2World 的差别</th></tr></thead>
  <tbody>
    <tr><td>Video2Policy</td><td>人类视频 → robot policy</td><td>机器人能否模仿任务</td><td>重点是 policy learning，不要求 coding agent 交付完整 simulator scene 与 assets。</td></tr>
    <tr><td>Agentic Real2Sim</td><td>真实观察 → 可执行 simulation</td><td>自动化 real-to-sim reconstruction</td><td>问题最接近；Video2World 更强调统一 benchmark、隐藏 reference 与九套 coding-agent 系统比较。</td></tr>
    <tr><td>BVB</td><td>视频 → Blender scene / procedure</td><td>视觉与场景重建</td><td>主要在 Blender 与视觉结果上评测，不把 robot actuation 和 task judge 作为中心。</td></tr>
    <tr><td>SceneActBench</td><td>场景与动作描述 → 可执行 simulation</td><td>场景、动作与物理合理性</td><td>强调 scene-action synthesis；Video2World 的任务规格主要来自 embodied video。</td></tr>
    <tr><td>CaP-X</td><td>多模态观察 → code-as-policy</td><td>代码能否控制机器人</td><td>侧重控制程序；Video2World 还要求恢复环境几何、相机与对象属性。</td></tr>
    <tr><td>EmbodiedSWE</td><td>具身系统仓库 issue → patch</td><td>软件测试是否通过</td><td>属于 embodied software engineering，交付代码 patch；这里交付的是新的可执行世界与控制轨迹。</td></tr>
  </tbody>
</table>
</div>

论文提供了一条完整的 coding-agent 评测链：统一的公开说明、提交格式、simulator runner（负责加载和执行提交的程序）、隐藏参考答案和按任务编写的 judge。结果表同时包含 OpenCode、Codex CLI 和 Claude Code 的原生 harness（给模型提供工具并管理执行的框架）。这些 harness 并不完全相同，因此 Table 2 是 **system-level comparison（模型与执行框架整体比较）**，不能当作只更换模型的排行榜。

<figure class="figure wide source">
  <img src="/lib/papers/video2world/figure-2.png" alt="Video2World benchmark 的数据来源、构造、Agent 执行和评测总览">
  <figcaption>原论文 Figure 2。视频与 simulator profile（机器人和模拟器的目标配置）组成任务；Agent 反复构建并执行候选重建，隐藏 evaluator 再计算功能、几何和运动指标。</figcaption>
</figure>

## Q3. 189 段视频怎样变成 222 个实例，Agent 能看到什么？

**作者从八类数据来源收集 189 段视频，再根据目标 simulator、robot 与 end-effector（机器人末端工具）配置形成 222 个 reconstruction instances；其中 33 段人类视频同时对应机械臂和 paired-hand（成对机械手）两种目标配置。**

<div class="table-scroll">
<table>
  <thead><tr><th>来源</th><th>视频 / 实例</th><th>它补充的任务类型</th></tr></thead>
  <tbody>
    <tr><td>FurnitureBench</td><td>64 instances</td><td>家具零件操作与装配</td></tr>
    <tr><td>DROID</td><td>20</td><td>真实机械臂日常物体操作</td></tr>
    <tr><td>RoboDojo</td><td>25</td><td>跨任务机器人示范</td></tr>
    <tr><td>HOI4D</td><td>9 videos / 18 instances</td><td>第一视角 human-object interaction</td></tr>
    <tr><td>HOT3D</td><td>7 / 14</td><td>手部与物体交互</td></tr>
    <tr><td>DexYCB</td><td>11 / 22</td><td>手-物体抓取</td></tr>
    <tr><td>OakInk2</td><td>6 / 12</td><td>双手物体操作</td></tr>
    <tr><td>in-house</td><td>37</td><td>作者补采的真实示范</td></tr>
    <tr><td>reconstructed twins</td><td>10</td><td>已经有模拟重建对照的任务</td></tr>
  </tbody>
</table>
</div>

<figure class="figure source">
  <img src="/lib/papers/video2world/task-family-counts.svg" alt="39 个 task families 的实例数量分布">
  <figcaption>原论文 Figure A1：39 个 task families（共用一套任务判定逻辑的类别）的完整清单，共计 222 个视频与目标配置组合。arm / hand variant 分开计数，但可以共享同一段原视频。</figcaption>
</figure>

作者为每个实例准备 reference reconstruction（用于评分的参考重建）、任务定义、评测窗口和目标配置，并由人工复核。论文附录展示了标注界面：标注者需要确认视频窗口、任务阶段、关键对象和目标 simulator；参考重建还要经过物理有效性与成功执行检查。任务判定来自 benchmark 作者编写和复核的 task definition 与 evaluator 逻辑，具体门槛随 task family 改变，并不是模型自动生成一个 `check.json` 就直接充当答案。

<figure class="figure source">
  <img src="/lib/papers/video2world/annotation-example.png" alt="Video2World 的视频和任务标注示例">
  <figcaption>原论文 Figure A2：annotation example。它展示如何选择视频片段、描述任务阶段，并把一个 source demonstration 配到目标机器人和模拟器。</figcaption>
</figure>

### Agent 得到什么？

- RGB 视频、分辨率、帧数和播放信息；
- 目标 simulator 与 robot 的公共说明、assets、joint limits 和 control format；
- shell、文件、图片查看和代码编辑工具；
- 自己候选重建的格式检查结果、执行视频（rendered rollout）和报错。

### Agent 明确看不到什么？

- reference scene / mesh、测量得到的 source trajectories 和 source robot logs；
- 隐藏 camera calibration、reference controls 与 reference submission；
- task-specific success criteria 和 benchmark scores。

### 最终交付的 package 有什么？

<figure class="figure wide">
  <img src="/lib/papers/video2world/protocol.svg" alt="Video2World 公开输入、隐藏信息、提交包和 evaluator 流程">
  <figcaption>根据论文 Sections 3–5、附录 7–9 与官方 `docs/benchmark.md` 重绘。</figcaption>
</figure>

核心文件是 `protocol.json`、`actions.npy` 和 `scene.json` 或 `scene.xml`，另加本地 3D meshes、textures（纹理）、`source/` 与 `report.md`。某些机器人/模拟器配置还允许 `expected/obj_poses.npy`，但它只是 Agent 声明的预期物体轨迹，**不能直接驱动物体**。物体必须由 robot actuation（机器人控制）与 simulator physics 产生运动；否则任务 judge 和实际执行都不会认可。

评测的对象是九个完整 coding-agent configurations。七个模型运行在 OpenCode 1.18.29 的 managed executor；GPT-6 Astra 使用 Codex CLI `0.154.0-alpha.6.2`，Fable-5.1 使用 Claude Code `2.1.276`。每个实例只允许一次 construction attempt，wall-clock 上限 180 分钟，observed API cost 达到 60 美元后停止，最多提交三次，而且 Agent 看不到隐藏分数，不能用 benchmark score 选 checkpoint。

## Q4. evaluator 怎样把一个 package 变成 PASS / FAIL？

**评测器先检查 package 能否构建，再在指定 simulator 中执行动作，记录 robot 与 object states；task judge 依据物理状态判定成功和进度，随后再把重建几何与运动轨迹对齐到隐藏 reference。**

<ul class="steps">
  <li><b>1 · VALIDATE</b><span>检查文件、schema、asset path 与控制数组是否合法。</span></li>
  <li><b>2 · BUILD</b><span>在 SAPIEN、Isaac Sim 或 MuJoCo 中加载 scene 与 robot。</span></li>
  <li><b>3 · EXECUTE</b><span>按 `protocol.json` 的时间步执行 `actions.npy`。</span></li>
  <li><b>4 · JUDGE</b><span>用 task-specific predicates 检查接触、支撑、释放、姿态与静止状态。</span></li>
  <li><b>5 · COMPARE</b><span>在 reference 时间戳上计算 geometry、APE 和 RPE。</span></li>
</ul>

### 真实案例：把横放的小瓶立起来

论文 Appendix 8.4 完整公开了一次 GPT-6 Astra 在视觉反馈下反复修改后的提交（visual-refinement submission）。输入来自 DROID：**83 帧、640×640、7.5 Hz**；原视频取第 64–228 帧，每隔一帧抽取一次，因此可见示范约 **10.93 秒**。任务是抓起横放在桌上的小瓶，把它转成直立姿态，重新放到桌面并松手；目标配置是 SAPIEN + Panda + Robotiq 2F-85。

<figure class="figure wide source">
  <img src="/lib/papers/video2world/worked-evaluation-example.png" alt="Video2World 直立瓶子案例的输入、重建和评测结果">
  <figcaption>原论文 Figure A3：worked evaluation example。左侧是输入视频，中间是 Agent 重建与执行，右侧给出隐藏 evaluator 记录的功能、几何和轨迹指标。</figcaption>
</figure>

Agent 看到了视频帧拼图（contact sheet）、robot / TCP（tool center point，末端工具中心点）规范和提交格式，但没有相机标定参数、物体几何、参考轨迹、任务标注或分数。最终 package 包含瓶子 mesh、桌面与背景几何、估计的相机和 robot placement，以及 **79×7 的控制数组**（`dt=0.2 s`）和 **83×7 的预期物体位姿**。预期位姿仍然只是声明；evaluator 从实际 physics rollout（物理执行记录）中采集了 **97 个物体状态**。

执行时间线说明了为什么不能只比较视频帧：0.4 秒抓住瓶子，2.6 秒开始移动，12.8 秒松手，19.2 秒才完成终态判定。运动轨迹误差只在 83 个示范时间戳上比较；示范结束后的 41 个执行状态不进入 motion score，但 task judge 仍会用它们确认物体最后是否稳定。

### Judge 具体看什么？

官方 `v2w/metrics/task.py` 中，这个 upright-bottle family 的最终逻辑可简化为：

<div class="code-scroll"><pre><code># simplified from official task.py:652-675
geometry_ok = supported and angle_deg &lt;= 30
success = geometry_ok and released and quiescent</code></pre></div>

还要先通过 `gate_initial_goal`：如果瓶子一开始已经直立，Agent 什么都不做不能得分。这个实例要求瓶子最后由提交中声明的 tabletop（桌面支撑体）托住，support gap 小于 0.01 mm，瓶轴和桌面法线约差 0.009°，机械手已经松开，且处于 quiescent/rest（物体运动足够小的静止状态）。公开门槛还包括 30° 的直立容差、1 cm 的支撑间隙和 5 mm 的桌面边界余量。

最终它得到 Build=1、Task Success=1、Progress=100%；Scene CD 2.51 cm、Shape CD 3.58 cm、Size error 5.76 cm、T-APE 7.77 cm、R-APE 9.27°、T-RPE 0.68 cm。initial centre error（初始中心位置误差）达到 24.80 cm，但任务仍然成功。judge 同时检查可执行结果与多类误差，并不要求第一帧完全一致。

### V2WScore 怎样合成？

对一个越小越好的误差 `e`，先按阈值 `τ` 转成 `[0,1]` quality：

<div class="formula">quality(e) = max(0, 1 − e / τ)</div>

其中 Scene / Shape / Size 的 `τ=10 cm`，T-APE 为 20 cm，R-APE 为 90°，T-RPE 为 10 cm。然后：

<div class="formula">F = (Task Success + Progress) / 2<br>G = applicable geometry qualities 的平均<br>D = applicable dynamics qualities 的平均<br>V2WScore = Build × (F + G + D) / 3</div>

分数先在 instance 内计算，再对同一 task family 汇总，最后让 39 个 families 等权平均并乘 100。这样，大 family 不会仅凭实例多就支配总分，build failure 也会把该实例的复合分数压到 0。

把上述瓶子案例代入公开公式，可得到 `F=1`、`G≈0.605`、`D≈0.814`，重算结果约为 **80.6 / 100**。论文明确说这个 worked example 没有发布正式的 per-instance composite score；80.6 只用于解释公式，**不是论文报告的官方数值**。

## Q5. 九个系统表现如何，这对下一步研究意味着什么？

**Fable-5.1 的整体结果最好，GPT-6 Astra 的对象层几何误差更小，Claude Opus 5 的 Task Success 又高于 Astra；所有自动系统与人类辅助重建之间仍有明显距离。**

<figure class="figure wide">
  <img src="/lib/papers/video2world/results.svg" alt="Video2World 九个系统与人类辅助重建的 V2WScore 和任务成功率">
  <figcaption>根据论文 Table 2 重绘。深色是 V2WScore，浅色是 Task Success；二者均为 39 个 task families 等权平均后的百分数。</figcaption>
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
  <img src="/lib/papers/video2world/geometry-function.svg" alt="几何 fidelity 与 Task Success 的关系">
  <figcaption>原论文 Figure 4。系统层面 Shape CD 较低不保证 Task Success 更高；在每个模型和 family 内，geometry error 较低的 quartile 通常更容易成功，但仍有大量例外。</figcaption>
</figure>

<figure class="figure wide source">
  <img src="/lib/papers/video2world/construction-cases.png" alt="Video2World 多种 Agent 重建结果与失败模式">
  <figcaption>原论文 Figure A5：construction cases。不同系统可能得到看似合理但抓取点、物体尺度、相机、机器人基座或控制时间不正确的 package。</figcaption>
</figure>

### HAR 不是“只看同一段 RGB 的人类上限”

Human-assisted reconstruction（HAR，人类辅助重建）可以使用原始 CAD、RGB-D、相机标定、robot logs、task predicates、隐藏分数并反复人工调试。它的 V2WScore 是 74.24；Task Success 按 39 个 families 等权平均为 58.8%，按实例计则是 113/222，即 50.9%。失败里有 19 个因物理有效性被拒，18 个所在 family 没有任何通过执行，7 个 near miss（接近成功）和 65 个 controller failures（控制器未完成任务）。作者没有系统记录人工工时，部分实验批次留下了大量物理试跑。因此 HAR 是使用额外信息和工程调试得到的参考结果，并非与 Agent 同信息条件的人类基线。

<figure class="figure wide source">
  <img src="/lib/papers/video2world/har-source-disclosure.svg" alt="HAR 各来源的结果与已记录的尝试次数">
  <figcaption>原论文 Figure A4。左侧报告最终选中的 reference execution；右侧只统计两组有完整试验记录的实验批次。未汇总的历史不是零次尝试，trial 数也不能换算成人工工时。</figcaption>
</figure>

### 成本、人工偏好与跨场景执行

九个系统合计约花费 **9,700 美元、1,044 agent-hours 和 286 L40S GPU-hours**。Fable 平均每个 episode 14.03 美元、37.5 分钟；Astra 6.40 美元、14.6 分钟；Opus 13.83 美元、32.6 分钟；Kimi 平均 82.2 分钟，是最慢的一组。论文没有把性能、API 价格与 wall-clock 合成一个效率指标。

human study 由 12 名内部评审完成，共收集 243 个有效的两两比较、覆盖 39 个 cases，再用 Bradley-Terry 模型汇总成 Human Preference Rating。评审来自作者与公司员工，不是独立外部评测。它补充了人对场景和交互相似度的判断，不能替代隐藏物理 judge。

论文还测试了 9 段原视频、3 个模型在 shifted layouts（把物体或目标位置平移后的新布局）上的执行：每个模型 180 次，共 540 次。直接复用原控制成功 525/540（97.22%）；让 Agent 做 adaptation（针对新位置调整）后成功 536/540（99.26%）。调整修复了 15 个直接复用失败案例中的 13 个，同时破坏了 525 个原本成功案例中的 2 个。这个结果只覆盖 **initial reconstruction 已成功** 的条件，不能解释最困难的“第一次从视频造出正确世界”。

<figure class="figure wide source">
  <img src="/lib/papers/video2world/rq2-paper.svg" alt="三种模型在 shifted layouts 上直接复用与 adaptation 的结果">
  <figcaption>原论文 Figure A6。每个模型在 9 段已成功重建的 source videos 上测试五档位移；0 cm 是原始 layout，阴影为按 source-video 配对 bootstrap 的 95% 区间。</figcaption>
</figure>

<figure class="figure wide source">
  <img src="/lib/papers/video2world/case-nine-models.svg" alt="九模型在 bowl nesting 和 can lifting 两个案例中的 judge 结果">
  <figcaption>原论文 Figure A11。绿色是通过，灰色是任务条件未满足，红色是被 physical-validity checks（物理有效性检查）拒绝；它与页首演示中的 Figures A9-A10 配套，说明画面终态越过某个阈值仍不等于完整成功。</figcaption>
</figure>

## Q6. 这篇论文真正证明了什么，还有哪些问题没解决？

**它最扎实地证明了：单段 embodied video 到可执行 simulator package 已经可以被标准化评测，强 coding-agent 系统能完成一部分任务，但可靠重建仍远未解决。**

<div class="limit-grid">
  <div><b>已经建立</b><span>公开输入、隐藏 reference、可执行 package、物理 rollout、task judge、geometry 和 trajectory metrics 被放进同一套 benchmark。</span></div>
  <div><b>关键结果</b><span>自动系统 build rate 多在 90% 左右，但最强 Task Success 只有 25.5%；“能加载”与“能完成任务”之间差距很大。</span></div>
  <div><b>比较边界</b><span>OpenCode、Codex CLI 与 Claude Code 的 harness 不同，结果是完整系统比较；HAR 还使用更多 source information。</span></div>
  <div><b>下一步</b><span>应固定 harness、公开 per-instance records 和失败归因，并分别研究 perception、asset retrieval、control synthesis 与 judge robustness。</span></div>
</div>

最明显的报告问题是统计分母（denominator）。附录 9.4 说主评测固定使用 **222 instances、39 families**，build failure 在 Build / Success / Progress 中计零；附录 9.5 又列出 S0=215 个 Agent 实际评测的实例、S2 primary=179、S1 HAR-pass=112。Table A12 还写着“S2 is the primary set used in Table [missing label]”，但 HTML / LaTeXML 的交叉引用缺失。论文没有解释 222 与 215 的七个实例差额，也无法确定这里指哪张表。

Table 2 的 Fable **25.5%** 是 39 个 families 等权的 Task Success；Table A12 的 **19.1% / 20.6% / 24.2%** 则使用三个按实例计算的分母。两组数统计口径不同，不能互相代换。这个缺口不推翻主结果，但会妨碍复现者核对样本过滤和失败计零方式。

我的判断是：Video2World 已经给出一套完整的 benchmark framework。它把 submission package、真实物理执行和 task-specific judge 组合起来，比只看截图的 world-generation 评测更接近可用系统。结果也保留了重要的失败：大量 Agent 可以生成能加载的场景，却无法把对象稳定抓起、移动并放到正确状态。下一步应把失败分别归到视频测量、场景构建、robot retargeting（把示范动作转换到目标机器人上）、控制器生成、物理参数校准和 judge 设计，再在相同 harness 与相同预算下比较方法。

<figure class="figure wide source">
  <img src="/lib/papers/video2world/case-native-final.png" alt="Video2World 原生机器人视频重建案例">
  <figcaption>原论文 Figure A13：native robot example。论文附录还分别给出 pose、receiver、nine-bowl、nine-lift 与 egocentric cases；完整图组保留在页首演示中。</figcaption>
</figure>

<p class="source-note">主要来源：Video2World arXiv v1 全文与全部附录；官方仓库 revision <code>44b1760c52cc14e519aa88b5a91c374e09b81653</code>；官方 benchmark 文档、评分实现 <code>v2w/scoring.py</code>、配置 <code>v2w/config/score.json</code> 与 task judge <code>v2w/metrics/task.py</code>。论文图像依 CC BY-SA 4.0 引用，官方代码为 Apache-2.0。检查日期：2026-10-06。</p>

</div>

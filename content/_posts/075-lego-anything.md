---
title: "[2026-09-28] LEGO-Anything: Coding Agents for 3D Scene Reconstruction"
permalink: "/posts/论文解读/lego-anything.html"
date: "2026-10-08T13:10:00+08:00"
updated: "2026-10-08T13:10:00+08:00"
cover: "/lib/papers/lego-anything/cover.svg"
description: "LEGO-Anything 把单图 3D 重建改写为 Image-to-Code：coding agent 反复编写与执行 Blender 程序，最终交付可编辑、可执行、可查询的场景。本文完整拆解 LEGO-Bench、轨迹退化、LEGO-Plugin 与 LEGO-World。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
categories:
  - "论文解读"
tags:
  - "3D Reconstruction"
  - "Coding Agent"
  - "Image-to-Code"
  - "World Model"
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">University of Maryland, College Park · AWS · arXiv:2609.36380v1 · 最早公开于 2026-09-28</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.36380">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.36380">论文 PDF</a>
  <a href="https://lego-anything.com">项目页</a>
  <a href="https://github.com/xirui-li/lego-anything-website">项目网站仓库</a>
  <a href="https://arxiv.org/src/2609.36380v1/anc/appendix_verified_evidence.json">附录证据文件</a>
</div>

<section class="deck-wrap" aria-label="LEGO-Anything 交互图解">
  <div class="deck-head"><strong>18 页交互图解 · Image-to-Code、LEGO-Bench、失败轨迹与 scene readout</strong><a href="/lib/decks/lego-anything-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/lego-anything-visual-guide.html" title="LEGO-Anything 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">给一张 RGB 图片，让 coding agent 在 Blender 里把整个场景重新搭出来。它要自己理解相机、房间、物体、材质和光照，反复写代码、执行、渲染、检查，最后交付可继续编辑和查询的 3D scene program。LEGO-Anything 研究的正是这条 Image-to-Code 路线。</p>

<div class="interest"><b>博客作者兴趣度 9.3 / 10</b><span>评分只表示博客作者本人兴趣程度；可执行场景表示、严格的可见表面评测和完整失败诊断很有价值，但研究代码尚未公开，真实照片上的定量证据也不足</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>208</strong><span>RGB inputs，来自 104 个 simulator scenes</span></div>
  <div class="metric"><strong>53.4%</strong><span>GPT-6-astra 室内 Overall；室外为 39.6%</span></div>
  <div class="metric"><strong>29.6%</strong><span>GPT-5.6-sol 的编辑令场景得分下降</span></div>
  <div class="metric"><strong>62.7%</strong><span>LEGO-Plugin 在 Office 子集上的最大相对提升</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>交付物是场景程序。</strong>Agent 交付 <code>scene.blend</code>、<code>scene.glb</code> 和渲染图，评测器会重新打开并渲染，而不是相信 Agent 自己提交的截图。</li>
    <li><strong>“文件有效”远不等于“重建正确”。</strong>六个 GPT 配置的 Validity 接近饱和，几何与外观分数仍相差很大。</li>
    <li><strong>迭代会退步。</strong>后一次修改可能破坏相机、几何或材质；Agent 对几何好坏的自评接近随机。</li>
    <li><strong>场景可以被继续查询。</strong>同一份冻结的 3D scene 能导出检测框、实例 mask 和相对深度，但离专用视觉模型还有明显差距。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 这里的 scene program 是什么？

一张生成图片只保留 pixels，一份普通 mesh 主要保留表面几何。LEGO-Anything 让 Blender 程序显式创建相机、对象、材质、灯光与层级关系。程序执行后得到的场景可以重新渲染、修改对象，也可以查询每个对象在图像中的投影、mask 和深度。

单张图片无法唯一确定背后的 3D 世界。遮挡后的形状、绝对尺度和材质都存在多解，因此这篇论文并没有宣称恢复“唯一真值”。LEGO-Bench 选择 simulator scene 生成输入图片，同时保留隐藏几何和深度，使候选场景能够在固定相机坐标中接受一致的自动评测。
</aside>

## Q1. 为什么要把单图 3D 重建写成程序？

**因为显式场景程序保留了对象、相机、材质和空间关系，重建结果能够执行、检查、修改和查询。**

传统单图 3D reconstruction 常输出 mesh、point map 或一组对象。这些表示适合渲染或测量，但不天然包含“这张桌子是哪一个对象”“相机在哪里”“哪个脚本生成了墙体”“修改灯光后会发生什么”等可操作结构。模块化系统可以把感知、资产检索和场景装配串起来，端到端模型也能直接预测 3D 输出；两者通常都没有把反复执行和修订作为核心接口。

LEGO-Anything 把任务写成：给定图片 <i>I</i> 和 Blender 环境 <i>E</i>，coding agent π 生成程序 <i>P</i>，执行程序得到场景 <i>S</i>：

<div class="formula">P = π(I; E),　S = Exec<sub>E</sub>(P)</div>

Agent 会多轮构造场景。在第 <i>t</i> 步，它修改程序 <i>P</i><sub>t</sub>，执行后得到场景 <i>S</i><sub>t</sub> 和观察 <i>o</i><sub>t</sub>，再根据渲染与代码状态继续修改。最终提交是整条轨迹的最后一个程序，最后一步并不保证是最好的一步。

<ul class="steps">
  <li><b>1 · INTERPRET</b><span>理解参考图中的相机、房间结构与主要对象。</span></li>
  <li><b>2 · PLAN</b><span>把场景拆成可逐步构造的对象和空间关系。</span></li>
  <li><b>3 · CODE</b><span>编写 Blender Python，创建 geometry、materials、lights 和 camera。</span></li>
  <li><b>4 · EXECUTE</b><span>运行代码，生成 <code>scene.blend</code> 并渲染预览。</span></li>
  <li><b>5 · REVISE</b><span>比较参考图与当前结果，修改程序后再次执行。</span></li>
</ul>

## Q2. 它与已有 3D reconstruction 工作差在哪里？

**LEGO-Anything 的边界是“单张自然图像风格输入、完整场景、可执行 Blender 程序、隐藏 simulator ground truth”。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>输入</th><th>输出</th><th>本文关注的差别</th></tr></thead>
  <tbody>
    <tr><td>Object-level image-to-3D</td><td>单个对象图片</td><td>mesh、Gaussian 或结构化资产</td><td>通常不恢复完整房间、相机、对象布局与多对象关系。</td></tr>
    <tr><td>Single-image scene reconstruction</td><td>单张场景图</td><td>固定 3D 表示</td><td>可以恢复整体几何，但不一定交付可继续执行和编辑的程序。</td></tr>
    <tr><td>VIGA / SEIG</td><td>图片</td><td>可执行 visual / Blender program</td><td>最接近；SEIG 的定量评测更偏对象级，LEGO-Bench 强调完整场景。</td></tr>
    <tr><td>3DCodeBench / P3D-Bench</td><td>文本或结构化规格</td><td>程序化对象与部件</td><td>主要测 object / part modeling，不要求从一张场景图恢复全局布局。</td></tr>
    <tr><td>WorldCoder-Bench</td><td>文本世界规格</td><td>可交互 3D world</td><td>强调物理世界生成，目标不是对一张参考图做视觉重建。</td></tr>
    <tr><td>SceneActBench</td><td>校准的多视角室内观察</td><td>可执行场景</td><td>不要求恢复 room structure 和 texture；LEGO-Bench 只给单图。</td></tr>
  </tbody>
</table>
</div>

LEGO-Anything 没有提出新的 3D backbone。它把通用 coding agent、Blender 执行环境、可审计产物和 simulator-grounded evaluator 接成一项完整任务，用来考查 Agent 能否通过代码完成视觉逆向工程。

## Q3. LEGO-Bench 是怎样构造和评分的？

**作者从专业 simulator assets 组装 104 个场景，再把真实几何、深度和实例 mask 留给隐藏 evaluator。**

### 从资产到 208 张输入图

作者使用 LychSim 组装场景，并从 Fab 选择许可条款允许 AI 使用的资产。候选场景先接受 collision 与 stability 检查，再由人工检查构图和拍摄质量；未通过的场景会返工。最终数据包含 443 个注册资产、8 类环境、17 个主题、104 个逻辑场景和 208 张 RGB 输入图。

Easy、Medium、Hard 不是按全局对象数量硬切。每个 matched family 都满足 <i>O</i><sub>E</sub> ⊂ <i>O</i><sub>M</sub> ⊂ <i>O</i><sub>H</sub>：高难度场景增加可见内容，同时固定建筑、光照、材质、相机，以及共享对象的 identity、transform、scale 和 bounding box。额外的 NYC aerial split 有 10 个俯视案例，没有 matched family，因此不进入配对复杂度分析。

### Agent 看见什么，评测器藏着什么？

<div class="table-scroll">
<table>
  <thead><tr><th>Agent 可见</th><th>仅 evaluator 可见</th><th>Agent 必须交付</th></tr></thead>
  <tbody>
    <tr><td>一张 RGB image</td><td>reference geometry 与 depth</td><td><code>scene.blend</code></td></tr>
    <tr><td>图像尺寸、horizontal FOV</td><td>instance masks 与对象对应</td><td><code>scene.glb</code></td></tr>
    <tr><td>category taxonomy、output schema</td><td>scene transforms 与 benchmark scores</td><td><code>final.png</code></td></tr>
    <tr><td>Blender MCP、文件与代码工具</td><td>逐对象评分范围</td><td>真实 3D geometry，而非贴一张参考图</td></tr>
  </tbody>
</table>
</div>

所有正式实验运行在隔离的 Harbor task 中，使用 Blender 5.0.1、Xvfb 和每个 trial 独立的 Blender MCP listener。主实验每个模型配置运行三次，报告 mean ± standard deviation。论文说明各 coding-agent campaign 固定 agent、harness、prompt、evaluator、timeout policy 和 container image，但没有给出主实验统一的精确 token 或 wall-clock 上限。

### 四个分数怎样计算？

Validity <i>V</i><sub>i</sub> 检查三个产物是否可用：<code>scene.blend</code> 必须可重新打开、至少包含一个 mesh 和 active camera；<code>scene.glb</code> 必须格式正确且非空；<code>final.png</code> 必须可解码且不是退化图像。主表还把 unresolved headline-evaluation failure 视作 <i>V</i><sub>i</sub>=0。超时并不会自动失败，只要它留下了合法产物；正常退出也不会自动通过。

Reconstruction <i>R</i><sub>i</sub> 只比较参考视角可见的对象表面。评测器从隐藏 depth 反投影 reference points，从候选场景的 active camera 栅格化 predicted points，再用隐藏 instance mask 把点分配给各对象。它不做平移、旋转、缩放或 per-object alignment，也不根据 Agent 的对象名称做匹配。对参考点 <i>g</i>，容差是 τ(<i>g</i>)=0.05<i>z</i>(<i>g</i>)，其中 <i>z</i>(<i>g</i>) 是参考相机中的前向深度。逐对象计算 precision、recall 和 F1，最后对合格对象做 macro average。

Appearance <i>A</i><sub>i</sub> 不使用 Agent 自己的 <code>final.png</code>。评测器固定引擎、分辨率和 full-frame output，重新渲染提交的 Blender scene，同时保留其相机、geometry、materials、lights 和 color settings。像素三个 RGB channel 的最大绝对误差不超过 30 时记为命中：

<div class="formula">Aᵢ = (1 / |Ωᵢ|) Σ<sub>u∈Ωᵢ</sub> 𝟙[‖Îᵢ(u) − Iᵢ(u)‖∞ ≤ 30]</div>

最终分数把无效和未解决的评测失败留在分母中：

<div class="formula">S = (1 / N) Σ<sub>i=1…N</sub> Vᵢ · (Rᵢ + Aᵢ) / 2</div>

### 一个公开的真实 trial

项目网站公开了 GPT-6-astra、run 01 在 `reconstruction__office__l3__open_plan_paired_l3_00` 上的结果。Agent 交付了有效场景，<i>V</i>=1。隐藏 evaluator 得到 Reconstruction 0.5731、Appearance 0.5441，因此 Overall 为 (0.5731+0.5441)/2=0.5586。公开资产还记录了 `object_macro_depth_relative_no_scale_fscore_v1`、5% depth-relative tolerance、fixed reference camera 和 RGB tolerance 30。

这里能复核结果文件和计算关系，却不能审计 evaluator 的实际实现。项目网站 README 指向 `xirui-li/lego-anything` 研究仓库；截至 2026-10-08，该仓库未公开，GitHub API 返回 404。论文附录描述了 checker protocol，arXiv 也提供带哈希的结果证据 JSON，但 verifier、dataset converter 和 plugin code 目前不可获得。

## Q4. 实验结果说明当前 Agent 卡在哪里？

**Agent 几乎都能生成合法文件，真正拉开差距的是几何和外观；室外、复杂场景与后期修改会进一步放大问题。**

<div class="table-scroll">
<table>
  <thead><tr><th rowspan="2">Model + Codex</th><th colspan="4">Indoor</th><th colspan="4">Outdoor</th></tr><tr><th>V</th><th>R</th><th>A</th><th>S</th><th>V</th><th>R</th><th>A</th><th>S</th></tr></thead>
  <tbody>
    <tr><td>GPT-6-astra</td><td>100.0</td><td>52.4</td><td>54.4</td><td><strong>53.4</strong></td><td>98.0</td><td>34.0</td><td>45.5</td><td><strong>39.6</strong></td></tr>
    <tr><td>GPT-6-sol</td><td>99.4</td><td>22.2</td><td>42.5</td><td>32.3</td><td>99.7</td><td>19.8</td><td>28.7</td><td>24.2</td></tr>
    <tr><td>GPT-6-luna</td><td>99.7</td><td>15.8</td><td>30.5</td><td>23.2</td><td>99.7</td><td>13.2</td><td>21.4</td><td>17.3</td></tr>
    <tr><td>GPT-5.6-sol</td><td>97.8</td><td>9.8</td><td>19.8</td><td>14.8</td><td>98.7</td><td>12.8</td><td>17.7</td><td>15.3</td></tr>
    <tr><td>GPT-5.6-terra</td><td>99.7</td><td>9.5</td><td>21.3</td><td>15.4</td><td>98.0</td><td>8.1</td><td>15.0</td><td>11.5</td></tr>
    <tr><td>GPT-5.6-luna</td><td>99.1</td><td>10.2</td><td>18.0</td><td>14.1</td><td>97.0</td><td>7.8</td><td>16.6</td><td>12.1</td></tr>
  </tbody>
</table>
</div>

数据来自论文 Table 3，单位为百分比；每个值是三次运行均值，表中省略标准差以便阅读。GPT-6-astra 室内 Overall 为 53.4±0.8，室外为 39.6±0.8。Gen3DSR 的室内 Reconstruction 达到 65.4，高于 Astra 的 52.4，但它没有可评的 Appearance；这说明专用几何系统和完整可执行场景并非同一任务。

复杂度分析把六个 GPT 配置合并：Validity 在三个 tier 都约为 99.5%，Overall 从 Easy 24.6 降至 Medium 21.3、Hard 20.5。室外 Reconstruction 从 18.4 降至 12.7。增加对象没有阻止 Agent 交付文件，却让布局、遮挡和几何更难恢复。

在固定 42-case Office 子集上，提高 reasoning effort 对 GPT-6 系列有效：Astra 从 32.3 升至 61.8，Sol 从 21.3 升至 39.7，Luna 从 14.4 升至 21.2。GPT-5.6 系列没有稳定的单调提升。该 sweep 每个 model-effort-task 只有一个结果，图中的 95% bootstrap interval 衡量 42 个 task inputs 的均值不确定性，不是重复运行方差。

### 轨迹中的退化

作者重新评分所有可渲染的中间 checkpoint。GPT-6-astra 较早占用更多绝对时间，但大约在自身执行预算的前 20% 内得到首个可评场景；GPT-5.6-sol 约在 55% 左右才达到这一点。正文中“约前十分之一 / 五分之一”的描述与附录 Figure 11 的正式 common-task analysis 口径不同，文章以附录图示口径解释，不把两者混成一个精确数字。

GPT-5.6-sol 有 29.6% 的更新令分数下降，最终结果比最佳中间状态低 3.2 个百分点。附录 Figure 12 给出同一个 House bedroom 案例：GPT-6-astra 在 step 2 的最佳 Q=(R+A)/2 为 33.90%，step 4 的最后结果跌到 4.35%；GPT-5.6-terra 则从 step 4 的 36.93% 跌到 step 19 的 2.10%。图中可以看到后期版本的房间明显变暗或视角退化，但论文没有公开导致退化的具体代码 diff。

### Agent 能不能自己选出更好的版本？

作者从 60 条不同轨迹中为每个 builder 选择 checkpoint pairs，让六个模型分别判断哪张 render 的 Reconstruction 或 Appearance 更好，再与确定性指标方向比较。完整 6×6 矩阵包含 2,160 次主要判断。

Self-judgment 对 Reconstruction 的平均一致率是 45.8%，cross-model judgment 是 45.4%；两者都接近或低于随机二选一。Appearance 稍好，但 self 仍只有 62.2%，低于 cross-model 的 63.9%。Agent 看渲染图时更容易判断颜色和光照，难以判断隐藏的三维表面是否真的更准确。

## Q5. LEGO-Plugin 和 LEGO-World 各自验证了什么？

**LEGO-Plugin 证明受控初始化、基于证据的修正和版本回退能减少过程性失败；LEGO-World 则检验最终场景能否作为视觉表示。**

### 三种针对性干预

Enhanced Initialization 使用 VGGT 从参考图估计 gravity-aligned、Z-up Manhattan frame，联合安装 room shell 和 camera。它给每个可见对象记录 normalized centroid、projected extent、relative / ordinal depth 和 observability flags。单图不能稳定恢复 metric depth 与绝对对象尺寸，因此 proposal 故意不提供这两项。

Grounded Refinement 从 SAM 3 object regions 与 Depth Anything V2 relative depth 中提取可测证据，检查对象是否存在、transform 与尺寸是否合法、支撑、包含、碰撞、朝向、重复布局、相机可见性、投影中心和范围、相对深度、depth order 与 luminance。硬要求失败或缺少证据时，候选修改不能接受；场景一旦变化，旧报告立即失效。

Version Control 把一次编辑包装成 transaction。Agent 先声明 editable entities、protected entities、允许的 change types 和 acceptance requirements；系统快照 transforms、meshes、materials、hierarchy、visibility、active camera 与 render settings。修改触碰未声明或受保护对象、没有产生允许的变化，或硬条件不通过时，系统移除新增实体并恢复快照。实验最多允许 8 个 transactions 和 2 次 rollbacks，避免无限修复。

这三个模块在 42-case Office subset 上保持输入、prompt、执行预算、reasoning effort 和 evaluator 相同。六个模型全部提高 Overall：GPT-5.6-luna、terra、sol 分别相对提高 62.7%、55.8%、55.3%；GPT-6-luna 和 sol 提高 27.5%、12.1%；GPT-6-astra 只提高 2.1%。Reception 案例从 14.7 升到 32.5，Copy room 从 10.9 升到 27.8；论文比较的是最佳三次 base run 与 plugin 输出，不能把这两个案例当成总体均值。

### 一份场景，直接读出三种视觉任务

LEGO-World 让 GPT-6-astra 在自然图片上重建场景，然后冻结 scene，不做任务专用训练。评测程序把对象 geometry 投影成 detection boxes 和 instance masks，并把 camera-space depth render 当作相对深度预测。

<div class="table-scroll">
<table>
  <thead><tr><th>任务</th><th>数据与指标</th><th>LEGO-Anything</th><th>专用模型</th></tr></thead>
  <tbody>
    <tr><td>Detection</td><td>COCO Box AP ↑</td><td>30.14</td><td>DINO 59.88</td></tr>
    <tr><td>Segmentation</td><td>LVIS Mask AP ↑</td><td>14.75</td><td>SAM 3 53.96</td></tr>
    <tr><td>Relative depth</td><td>ETH3D AbsRel ↓</td><td>0.1554</td><td>Depth Anything 3 0.0783</td></tr>
  </tbody>
</table>
</div>

三个 track 各尝试 100 张图。检测与分割实际产生 94 份 scene outputs，但官方 AP 仍把全部 100 张图放进评测，缺失输出记作无 detections。scene schema 没有 calibrated confidence，因此所有实例 confidence 都设为 1.0，并用 image ID、category ID 和 payload 决定 tie order；这组 AP 更适合看作固定排序下的兼容性诊断。深度有 99 个有效输出，主表把 99 个 LEGO 输出的 AbsRel 与 direct baseline 的 100 图均值并列；同一 99 图上的 paired baseline 是 0.07845，LEGO-Anything 为 0.15540。

## Q6. 这篇论文最终证明了什么，哪里还不够？

**它证明通用 coding agent 已经能稳定交付可执行 3D 场景，但可见表面、相机与外观仍不足以忠实表示输入图片。**

我最喜欢的是它对评测对象的选择。LEGO-Bench 重新打开最终 artifact，在固定相机和隐藏对象 mask 下测几何，再统一渲染测外观。Agent 的解释、代码是否优雅以及自己挑选的截图都不参与评分。Validity、Reconstruction 和 Appearance 分开报告，使“程序跑通”和“场景恢复正确”不再混为一个数字。

论文也留下了几条明确边界：

- 输入主要来自专业 simulator scene 的渲染，虽然有 natural-image style，仍不等于真实照片的长尾噪声、反射、动态人物和未知相机处理。
- 单图本身有尺度、遮挡和背面形状歧义；no-alignment 评分严格且清楚，却无法告诉我们某个视觉上合理的多解是否应被接受。
- 主表比较的是 end-to-end systems。task-specific baselines 的工具、native outputs、恢复流程、推理预算和信息访问并不统一，论文自己也明确写出“equalizes scoring, but not inference budget or information access”。
- LEGO-Plugin 只在 42-case Office subset 上评测，强模型增益很小；没有模块消融可以分清 initialization、grounded checks 与 rollback 各贡献多少。
- Articulation 仍是探索性实验。补齐 443 个资产的 canonical manifest 后，一个 frozen Office submission 在 14 个可评分 articulated targets 上仍得到 0。
- 论文网站和结果证据已公开，研究仓库与 evaluator 实现尚未公开。当前可以复核结果记录和协议描述，不能独立重跑 LEGO-Bench 或检查全部实现细节。

下一步可以分别控制初始化、几何证据和版本回退，报告每个模块对 best-to-final regret、相机误差、逐对象 F1 与成本的影响。同时加入真实照片和多解标注，区分“与 simulator 真值不同”和“视觉上不成立”。LEGO-World 也应在同一批图片上同时评测 detection、segmentation 和 depth，避免三个 100-image track 被误读为同一组场景支持三项任务。

这篇论文把 coding agent 的输出从“写对一段代码”扩展到“交付一个可以继续运行和测量的世界”。现阶段最可靠的能力是产物交付，最薄弱的仍是三维忠实度。

<div class="paper-sources">
<strong>主要来源</strong>
<a href="https://arxiv.org/abs/2609.36380">论文与 v1 元数据</a>
<a href="https://lego-anything.com">官方项目页</a>
<a href="https://github.com/xirui-li/lego-anything-website/commit/07a67eb8a41d50756a31aa3d73a38cbe10e77e63">项目网站固定版本</a>
<a href="https://arxiv.org/src/2609.36380v1/anc/appendix_verified_evidence.json">官方附录证据 JSON</a>
</div>

</div>

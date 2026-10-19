---
title: "[2026-09-28] LEGO-Anything: Coding Agents for 3D Scene Reconstruction"
permalink: "/posts/论文解读/lego-anything.html"
date: "2026-10-08T13:10:00+08:00"
updated: "2026-10-19T16:55:00+08:00"
cover: "/lib/papers/lego-anything/cover.svg"
description: "给一张图片，让模型写 Blender 代码搭出整间房间或室外场景，再检查隐藏几何与重新渲染后的画面。LEGO-Anything 区分了文件能用、场景恢复正确，以及后续修改是否真的变好。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 20
categories:
  - "论文解读"
tags:
  - "3D Reconstruction"
  - "Coding Agent"
  - "Image-to-Code"
  - "World Model"
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

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
  <div class="deck-head"><strong>20 页交互图解 · 从图片搭场景、隐藏评分、版本退化与场景查询</strong><a href="/lib/decks/lego-anything-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/lego-anything-visual-guide.html" title="LEGO-Anything 论文图解，共 20 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">给一张图片，让模型在 Blender 里把整个场景重新搭出来。它要判断相机、房间、物体、材质和光照，反复写代码、执行、渲染、检查，最后交付可以重新打开和修改的三维场景。LEGO-Anything 用隐藏几何与统一重新渲染检验这个场景，而不只看模型提交的截图是否好看。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 这里的 scene program 是什么？

Blender 是三维建模与渲染软件，本文的 Agent 用 Python 创建相机、对象、材质、灯光和层级。可再次执行的这份代码称为 **scene program**。它保存的 <code>scene.blend</code> 是完整 Blender 场景，<code>scene.glb</code> 是三维导出文件，<code>final.png</code> 是提交时的渲染图。

**mesh** 是由顶点与面组成的表面几何；**instance mask** 标记图中哪些像素属于同一个对象；深度记录可见表面距离相机有多远。评测器用隐藏深度还原表面点、用 mask 把点分给对象，再比较候选场景。文件能否使用称为 Validity；几何是否相符称为 Reconstruction；重新渲染后的颜色是否相符称为 Appearance。

单张图片无法唯一确定背后的 3D 世界。遮挡后的形状、绝对尺度和材质都存在多解，因此这篇论文并没有宣称恢复“唯一真值”。LEGO-Bench 用模拟器场景生成输入图片，同时保留隐藏几何和深度，使候选场景能够在固定相机坐标中接受一致的自动评测。
</aside>

<div class="interest"><b>博客作者兴趣度 9.3 / 10</b><span>评分只表示博客作者本人兴趣程度；可执行场景表示、严格的可见表面评测和完整失败诊断很有价值，但研究代码尚未公开，真实照片上的定量证据也不足</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>208</strong><span>输入图，来自 104 个模拟场景</span></div>
  <div class="metric"><strong>53.4%</strong><span>GPT-6-astra 室内总分（Overall）；室外为 39.6%</span></div>
  <div class="metric"><strong>29.6%</strong><span>GPT-5.6-sol 的编辑令场景得分下降</span></div>
  <div class="metric"><strong>62.7%</strong><span>LEGO-Plugin 在 Office 子集上的最大相对提升</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li>评测器重新打开并渲染候选，模型提交的截图不直接决定外观分数。</li>
    <li>六个 GPT 配置几乎都能交付有效文件，几何与外观分数仍相差很大。</li>
    <li>后一次修改可能破坏相机、几何或材质；Agent 对几何好坏的自评接近随机。</li>
    <li>同一份场景能导出检测框、实例 mask 和深度，但对应任务的成绩仍低于专用视觉模型。</li>
  </ul>
</aside>


<h2 id="把单图重建写成可执行场景">1. Motivation：把单图重建写成可执行场景</h2>

**因为显式场景程序保留了对象、相机、材质和空间关系，重建结果能够执行、检查、修改和查询。**

传统单图重建常输出 mesh、每个像素对应的三维点（point map）或一组对象。这些表示适合渲染或测量，但不一定包含可编辑的相机、对象层级和生成代码。模块化系统可以把识别、资产检索和装配串起来，端到端模型也能直接预测三维输出；LEGO-Anything 则让通用 coding agent 在执行反馈下逐轮修改完整场景。

LEGO-Anything 把任务写成：给定图片 <i>I</i> 和 Blender 环境 <i>E</i>，coding agent π 生成程序 <i>P</i>，执行程序得到场景 <i>S</i>：

<div class="formula">P = π(I; E),　S = Exec<sub>E</sub>(P)</div>

<figure class="figure original"><a href="/lib/papers/lego-anything/source-figure-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/lego-anything/source-figure-1.webp" width="1419" height="636" alt="Figure 1 原图：单张悉尼歌剧院参考图、Blender 可执行场景及检测、分割、深度读出；下方展示 Agent 编码循环与三类评测。" loading="lazy" decoding="async"></a><figcaption>Figure 1 原图。单张参考图到可执行场景，以及同一场景的下游读出；它是任务示意，不代表论文已证明真实照片的定量重建质量。<a href="https://arxiv.org/pdf/2609.36380v1#page=2">Li et al., v1, PDF 第 2 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站仅裁切页边留白。</figcaption></figure>

Agent 会多轮构造场景。在第 <i>t</i> 步，它修改程序 <i>P</i><sub>t</sub>，执行后得到场景 <i>S</i><sub>t</sub> 和观察 <i>o</i><sub>t</sub>，再根据渲染与代码状态继续修改。最终提交是整条轨迹的最后一个程序，最后一步并不保证是最好的一步。

<ul class="steps">
  <li><b>1 · INTERPRET</b><span>理解参考图中的相机、房间结构与主要对象。</span></li>
  <li><b>2 · PLAN</b><span>把场景拆成可逐步构造的对象和空间关系。</span></li>
  <li><b>3 · CODE</b><span>编写 Blender Python，创建几何、材质、灯光和相机。</span></li>
  <li><b>4 · EXECUTE</b><span>运行代码，生成 <code>scene.blend</code> 并渲染预览。</span></li>
  <li><b>5 · REVISE</b><span>比较参考图与当前结果，修改程序后再次执行。</span></li>
</ul>

<h2 id="与对象重建和程序化建模的区别">2. Related Work：与对象重建和程序化建模的区别</h2>

**论文同时要求单图输入、完整场景和可执行程序，并用模拟器真值评价。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>输入</th><th>输出</th><th>本文关注的差别</th></tr></thead>
  <tbody>
    <tr><td>单对象 Image-to-3D</td><td>单个对象图片</td><td>网格、三维高斯点或结构化资产</td><td>通常不恢复完整房间、相机、对象布局与多对象关系。</td></tr>
    <tr><td>单图场景重建</td><td>单张场景图</td><td>固定三维数据</td><td>可以恢复整体几何，但不一定交付可继续执行和编辑的程序。</td></tr>
    <tr><td>VIGA / SEIG</td><td>图片</td><td>可执行视觉或 Blender 程序</td><td>最接近；SEIG 的定量评测更偏对象级，LEGO-Bench 强调完整场景。</td></tr>
    <tr><td>3DCodeBench / P3D-Bench</td><td>对象图片、部件规格等</td><td>程序化对象与部件</td><td>本文 Table 1 把两者都列为支持图像输入；区别在对象或部件级任务，不是“它们只吃文字”。</td></tr>
    <tr><td>WorldCoder-Bench</td><td>文本世界规格</td><td>可交互三维世界</td><td>强调物理世界生成，目标不是对一张参考图做视觉重建。</td></tr>
    <tr><td>SceneActBench</td><td>校准的多视角室内观察</td><td>可执行场景</td><td>不要求恢复房间结构与纹理；LEGO-Bench 只给单图。</td></tr>
  </tbody>
</table>
</div>

LEGO-Anything 没有提出新的三维预测网络。它让通用 Agent 写代码、在 Blender 中执行，再用模拟器保留的真实几何评测产物，考查模型能否从图片反推场景。

<h2 id="LEGO-Bench-的构造与完整评分路径">3. Method：LEGO-Bench 的构造与完整评分路径</h2>



**作者从专业资产组装 104 个场景，再把真实几何、深度和实例 mask 留给隐藏评测器。**

<figure class="figure original"><a href="/lib/papers/lego-anything/source-figure-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/lego-anything/source-figure-3.webp" width="1053" height="474" alt="Figure 3 原图：Fab 资产经过数据挖掘、场景提议、模拟器装配、物理检查与人工复核，返工后才进入基准。" loading="lazy" decoding="async"></a><figcaption>Figure 3 原图。Fab 资产经模拟器装配、程序检查与人工复核；流程中的重新制作和返工不能省略。隐藏几何与对象标注来自模拟器。<a href="https://arxiv.org/pdf/2609.36380v1#page=5">Li et al., v1, PDF 第 5 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站仅裁切页边留白。</figcaption></figure>

<h3 id="从资产到-208-张输入图">3.1 从资产到 208 张输入图</h3>

作者使用 LychSim 模拟器组装场景，并从 Fab 选择许可条款允许 AI 使用的资产。程序先检查对象是否碰撞、摆放是否稳定，人工再检查构图和拍摄质量；未通过的场景会返工。最终数据包含 443 个注册资产、8 类环境、17 个主题、104 个逻辑场景和 208 张输入图。隐藏几何、深度和对象 mask 由模拟器导出，不是看图猜出来的人工三维标注。

作者把同一布局做成 Easy、Medium、Hard 三个版本，称为 matched family（配对场景组）。对象集合满足 <i>O</i><sub>E</sub> ⊂ <i>O</i><sub>M</sub> ⊂ <i>O</i><sub>H</sub>：更难的版本增加可见对象，但建筑、光照、材质、相机，以及共有对象的身份、位置、旋转、缩放和包围盒不变。因此难度不是按所有场景的对象数量统一切分。额外的 NYC aerial 子集有 10 个俯视案例，没有这类配对版本，不进入配对复杂度分析。

<h3 id="Agent-看见什么，评测器藏着什么？">3.2 Agent 看见什么，评测器藏着什么？</h3>

<div class="table-scroll">
<table>
  <thead><tr><th>Agent 可见</th><th>只有评测器可见</th><th>Agent 必须交付</th></tr></thead>
  <tbody>
    <tr><td>一张 RGB 彩色图</td><td>参考几何与深度</td><td><code>scene.blend</code></td></tr>
    <tr><td>图像尺寸、水平视场角（FOV）</td><td>每个对象的像素范围与配对关系</td><td><code>scene.glb</code></td></tr>
    <tr><td>类别清单和输出格式</td><td>场景位置、旋转、缩放与评测分数</td><td><code>final.png</code></td></tr>
    <tr><td>Blender MCP、文件与代码工具</td><td>逐对象评分范围</td><td>真实三维几何，而非贴一张参考图</td></tr>
  </tbody>
</table>
</div>

所有正式实验使用 Harbor 隔离执行任务，版本为 Blender 5.0.1。Xvfb 提供虚拟显示，Blender MCP 接口让 Agent 调用 Blender 操作；每次独立尝试都有自己的监听进程。主实验每个模型配置运行三次，报告均值和标准差。论文说明配置内的 Agent、harness、提示词、评测器、超时规则与容器镜像固定，但没有给出主实验统一的精确 token 或运行时间上限。

这里用的是 Harbor 的 Codex 容器适配器；Appendix I 记录最终实验的 <code>model_provider=amazon-bedrock</code>。表中的模型家族名称并不能单独说明实际服务路径。文中也介绍了 Hermes 适配器，但“支持接入”不等于它参与了主表实验。

<h3 id="四个分数怎样计算？">3.3 四个分数怎样计算？</h3>

<figure class="figure original"><a href="/lib/papers/lego-anything/source-figure-18.webp" target="_blank" rel="noopener"><img src="/lib/papers/lego-anything/source-figure-18.webp" width="1422" height="729" alt="Figure 18 原图：Validity 检查交付文件；Reconstruction 用隐藏深度和对象 mask 比较可见表面；Appearance 用评测器重新渲染结果比较参考图。" loading="lazy" decoding="async"></a><figcaption>Figure 18 原图。Validity、可见表面 Reconstruction 与评测器重新渲染的 Appearance 各自检查什么；底部是总分公式。图中点云只是协议示意，不能代替未公开的 evaluator 实现。<a href="https://arxiv.org/pdf/2609.36380v1#page=26">Li et al., v1, PDF 第 26 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站仅裁切页边留白。</figcaption></figure>

Validity <i>V</i><sub>i</sub> 检查三个产物是否可用：<code>scene.blend</code> 必须可重新打开、至少包含一个 mesh 和当前渲染相机（active camera）；<code>scene.glb</code> 必须格式正确且非空；<code>final.png</code> 必须可解码且不是退化图像。主评测失败且未解决时，主表也记 <i>V</i><sub>i</sub>=0。超时并不会自动失败，只要它留下了合法产物；正常退出也不会自动通过。

<p>Reconstruction <i>R</i><sub>i</sub> 只比较参考视角可见的对象表面。评测器用隐藏深度反投影出参考表面点，用候选场景的当前相机生成候选表面点，再按隐藏 instance mask 分给各对象。它不把候选额外平移、旋转或缩放到真值上，也不根据 Agent 的对象名做匹配。对参考点 <i>g</i>，容差是 τ(<i>g</i>)=0.05<i>z</i>(<i>g</i>)，其中 <i>z</i>(<i>g</i>) 是沿参考相机前向轴的深度。</p>

<p>逐对象的 <strong>precision</strong> 是候选表面点中有多少比例落在参考表面容差内；<strong>recall</strong> 是参考表面有多少比例被候选覆盖。多造表面可能损失 precision，少造表面会损失 recall。用 <code>F1=2PR/(P+R)</code> 合并后，所有评分对象等权平均，称为 <strong>object macro average</strong>，不是把大桌子的全部点和小物体的点一起平均。</p>

<p><strong>这个分数有明确的检查范围。</strong>候选点先投影到参考图，再由隐藏 mask 分配到对应区域；不是根据对象名称，也不是先找一组最相似的对象配对。只有落在评分 mask 内的多余表面才会降低该对象的 precision；所有 mask 外的额外几何不直接进入主 Reconstruction 分数，尽管可能拉低 Appearance 或辅助指标。它也不检查被遮挡的背面是否完整。</p>

<p>整场景先按固定规则把点数上限设为 100,000，再分配给对象。采样后没有参考点的对象不进入对象平均的分母；有参考点、候选却没有点的对象，其 precision、recall 和 F1 都为零。5% 容差随参考深度变化，没有额外的固定米制下限或上限。</p>

<p>一个说明容差与聚合的算例：参考点深度为 2 个场景单位，容差就是 0.1；若它最近的候选点误差为 0.12，便不命中。假设对象 1 的 precision 为 0.75、recall 为 0.5，其 F1=0.6；对象 2 的 F1=0.4，则场景 <code>R=(0.6+0.4)/2=0.5</code>。这些数是本文示意，实际评测器的点采样与合格对象范围仍以附录为准。</p>

Appearance <i>A</i><sub>i</sub> 不使用 Agent 自己的 <code>final.png</code>。评测器固定引擎、分辨率，并比较整张图，重新渲染提交的 Blender 场景；候选自己的相机、几何、材质、灯光和颜色设置仍保留。像素三个 RGB 颜色通道的最大绝对误差不超过 30 时记为命中：

<div class="formula">Aᵢ = (1 / |Ωᵢ|) Σ<sub>u∈Ωᵢ</sub> 𝟙[‖Îᵢ(u) − Iᵢ(u)‖∞ ≤ 30]</div>

<p>三个通道误差分别为 (20,25,29) 的像素命中，(20,25,31) 则不命中；不是把三个误差平均后再判断。分母 <code>|Ωᵢ|</code> 是完整评分图像的像素数。Validity 失败使整条样例为零，不能只在成功生成场景的样例里平均。</p>

最终分数把无效和未解决的评测失败留在分母中：

<div class="formula">S = (1 / N) Σ<sub>i=1…N</sub> Vᵢ · (Rᵢ + Aᵢ) / 2</div>

<h3 id="分数与人的判断是否一致？">3.4 分数与人的判断是否一致？</h3>

<p>作者让 6 人各判断 40 组场景对，每组观察 4 个局部区域。人和指标的 83.7% 是<strong>允许平局的兼容率</strong>，不表示指标在 83.7% 的场景上判对了唯一答案。</p>

<details><summary>展开人工标注数量与平局规则</summary>
Appendix E.5 另做了人工校准：6 位标注者各判断 40 组场景对，其中 20 组比较几何、20 组比较外观；每组标出 4 个对象或局部区域。总计是 <strong>240 次“标注者 × 场景对”记录、960 个局部判断，不是 960 个场景</strong>。几何题要求忽略颜色和灯光，比较形状、大小、姿态、位置与缺失表面；外观题只比较圈出的区域。

论文报告的人工一致率 86.6% 是 <strong>compatibility agreement（允许平局的一致）</strong>：A 与 B 的直接冲突算不一致，Tie 与 A、Tie 与 B 都算兼容。它不是三分类标签完全相同的比例。人工票数相等时记为 Both OK；指标分差小于 0.05 时也记为 Both OK。在这一规则下，人和指标的兼容率为 83.7%，不能写成“指标判对了 83.7%”。后面的模型自评实验用另一套严格方向匹配规则，二者不能直接比较。
</details>

<h3 id="一个公开的实际运行结果">3.5 一个公开的实际运行结果</h3>

项目网站公开了 GPT-6-astra 第 1 次运行在 `reconstruction__office__l3__open_plan_paired_l3_00` 上的结果，运行 ID 为 `928fa0fc-9e4b-4f41-9c46-7e3b96ceb02d`。Agent 交付了有效场景，<i>V</i>=1。隐藏评测器得到 Reconstruction 0.5731、Appearance 0.5441，因此 Overall 为 (0.5731+0.5441)/2=0.5586。结果文件把几何检查记为 `object_macro_depth_relative_no_scale_fscore_v1`，对应前文的“逐对象 F1、深度的 5% 容差、不额外对齐或缩放”；同时记录固定参考相机与 RGB 误差阈值 30。

这个 Office 输出有 18 个对象级结果：Plant 1 的 precision=0.6053、recall=1.0、F1=0.7541；Office equipment 1 只有 F1=0.1153。文件中的几何总分是各对象 F1 的平均，<strong>不能拿平均 precision 与平均 recall 再算一次 F1</strong>。外观更容易逐项复核：512×288 共 147,456 个像素，命中 80,226 个，正好得到 0.544067。

```python
# 用官方 ex05-metrics.json 的数值复核汇总，不是评测器源码。
appearance = 80226 / (512 * 288)
reconstruction = 0.5730743681556181  # 官方对象级 F1 的平均
overall = (reconstruction + appearance) / 2  # 此次 V=1
assert abs(overall - 0.558570875484059) < 1e-12
```

网站还展示了三维采样点，但结果文件明确写着 <code>point_sampling: display_only</code>；那些展示用点数不能反推完整评测中的命中数。

这里能复核结果文件和计算关系，却不能审计评测器的实际实现。项目网站 README 指向 `xirui-li/lego-anything` 研究仓库；本轮核查留存的 2026-10-14 GitHub API 结果为 404，无法区分未公开、私有或地址不存在。论文附录描述了检查协议，也提供带哈希的结果证据 JSON，但检查程序、数据转换程序和插件源码目前不可获得。

<h2 id="主结果、复杂度与后期退化">4. Experiments：主结果、复杂度与后期退化</h2>

**Agent 几乎都能生成合法文件，真正拉开差距的是几何和外观；室外、复杂场景与后期修改会进一步放大问题。**

<figure class="figure original"><a href="/lib/papers/lego-anything/source-table-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/lego-anything/source-table-3.webp" width="1419" height="621" alt="Table 3 原表：六个通用编码 Agent 及六个专用系统在室内、室外分区的 Validity、Reconstruction、Appearance、Overall 均值和标准差。" loading="lazy" decoding="async"></a><figcaption>Table 3 原表。六个通用编码 Agent 与专用系统的室内、室外结果，单位为百分比；括号内是三次运行的标准差。表较密，可点“图片详情”后选“清晰”并横向滚动。<a href="https://arxiv.org/pdf/2609.36380v1#page=6">Li et al., v1, PDF 第 6 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站仅裁切页边留白。</figcaption></figure>

<p>最强的 GPT-6-astra 室内 Overall 为 53.4±0.8，室外为 39.6±0.8。Gen3DSR 的室内 Reconstruction 为 65.4，高于 Astra 的 52.4，但主表 Appearance 为 0。文件有效性接近饱和也没有消除几何与外观的差距。</p>

<details><summary>展开可复制的主表数值和基线说明</summary>

<div class="table-scroll">
<table>
  <thead><tr><th rowspan="2">模型 + Codex</th><th colspan="4">室内</th><th colspan="4">室外</th></tr><tr><th>V</th><th>R</th><th>A</th><th>S</th><th>V</th><th>R</th><th>A</th><th>S</th></tr></thead>
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

数据来自论文 Table 3，单位为百分比；每个值是三次运行均值，表中省略标准差以便阅读。GPT-6-astra 室内 Overall 为 53.4±0.8，室外为 39.6±0.8。下面补齐主表的其他系统；“—”是没有支持该分区的结果，零分则是论文实际记的分数。

<div class="table-scroll"><table><thead><tr><th>其他完整系统</th><th>室内 V / R / A / S</th><th>室外 V / R / A / S</th></tr></thead><tbody>
<tr><td>VIGA</td><td>100 / 10.8 / 20.3 / 15.6</td><td>100 / 8.0 / 17.1 / 12.6</td></tr>
<tr><td>SceneConductor</td><td>12.3 / 5.0 / 0 / 0.3</td><td>—</td></tr>
<tr><td>3D-RE-GEN</td><td>100 / 1.2 / 11.3 / 6.3</td><td>—</td></tr>
<tr><td>Gen3DSR</td><td>92.0 / 65.4 / 0 / 30.1</td><td>80.0 / 35.0 / 0 / 14.0</td></tr>
<tr><td>REST3D</td><td>77.5 / 7.2 / 0 / 2.8</td><td>—</td></tr>
<tr><td>SceneGen</td><td>71.6 / 9.7 / 0 / 3.4</td><td>38.7 / 2.6 / 0 / 0.5</td></tr>
</tbody></table></div>

Gen3DSR 的室内 Reconstruction 达到 65.4，高于 Astra 的 52.4，但主表把 Appearance 记为 0；不能说 Astra 在几何上也超过全部专用系统。VIGA 禁用了外部资产生成；3D-RE-GEN 的 PLY 几何经过固定相机、公开相机内参与固定区域灯光转换成 Blender 场景。<strong>这里统一的是评分终点，不是工具、可见信息或推理预算</strong>，因此不能把整张表当作只替换模型的受控比较。

</details>

复杂度分析把六个 GPT 配置合并：三个难度等级的 Validity 都约为 99.5%，Overall 从 Easy 24.6 降至 Medium 21.3、Hard 20.5。室外 Reconstruction 从 18.4 降至 12.7。增加对象没有阻止 Agent 交付文件，却让布局、遮挡和几何更难恢复。

另一组固定 42 道 Office 任务的实验中，把推理强度从 Low 提到 XHigh，使 GPT-6-astra 的 Overall 从 32.3 升到 61.8，Sol 从 21.3 升到 39.7，Luna 从 14.4 升到 21.2；GPT-5.6 没有稳定的单调提升。每个“模型 × 强度 × 任务”组合只运行一次。

<details><summary>展开推理强度实验的重试、区间与配置差别</summary>
六个模型、四档强度、42 题共 1,008 个结果。基础设施失败后的重试保持配置不变，不是多跑后挑最好结果。图中的 95% bootstrap 区间通过重抽任务 10,000 次得到，衡量任务抽样的不确定性，不是同一任务重复运行的方差。

这是一组单独实验：Sol 与 Luna 的 High 结果重新生成，提示词不含主表额外的相机引导，不能直接复用主表。Luna 有 13 次非零退出，但留下合法产物，经重新评分后保留；共享机器的并发与磁盘负载又影响用时，因此墙钟时间不能直接当成受控的推理成本。
</details>

<h3 id="轨迹中的退化">4.1 轨迹中的退化</h3>

作者重新评分所有可渲染的中间保存版本（checkpoint）。GPT-6-astra 较早占用更多绝对时间，但大约在自身执行预算的前 20% 内得到首个可评场景；GPT-5.6-sol 约在 55% 左右才达到这一点。正文中“约前十分之一 / 五分之一”的描述与附录 Figure 11 的在共同任务上的分析口径不同，文章以附录图示口径解释，不把两者混成一个精确数字。

GPT-5.6-sol 有 29.6% 的更新令分数下降，最终结果比最佳中间状态低 3.2 个百分点。附录 Figure 12 给出同一个 House bedroom 案例：GPT-6-astra 在 step 2 的最佳 Q=(R+A)/2 为 33.90%，step 4 的最后结果跌到 4.35%；GPT-5.6-terra 则从 step 4 的 36.93% 跌到 step 19 的 2.10%。另外两条轨迹分别是 Sol 23.53→20.42、Luna 2.45→2.43。<strong>这个案例从四个模型共有任务中，按平均“最好到最后”的损失最大挑出，是严重失败展示，不是随机典型样本。</strong>图中能看到变暗或视角变化，但没有具体代码 diff，不能据此锁定是哪一步修改造成退化。

<figure class="figure original"><a href="/lib/papers/lego-anything/source-figure-12.webp" target="_blank" rel="noopener"><img src="/lib/papers/lego-anything/source-figure-12.webp" width="1419" height="957" alt="Figure 12 原图：同一 House bedroom 任务中四个模型各自最佳中间版本和最后版本的渲染对照与 Q 分数。" loading="lazy" decoding="async"></a><figcaption>Figure 12 原图。同一个 House bedroom 任务的最佳与最终版本，Q=(R+A)/2；作者特意选了平均退化最严重的共有案例，不是随机样本。图像显示结果变化，未提供造成变化的代码 diff。<a href="https://arxiv.org/pdf/2609.36380v1#page=21">Li et al., v1, PDF 第 21 页</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。本站仅裁切页边留白。</figcaption></figure>

<h3 id="Agent-能不能自己选出更好的版本？">4.2 Agent 能不能自己选出更好的版本？</h3>

<p>作者拿 360 对中间版本让六个模型分别判断哪一个更好。原生成模型对几何改善方向的判断与指标一致率为 45.8%，其他模型为 45.4%；外观分别为 62.2% 和 63.9%。<strong>这组比较没有显示模型自评几何有稳定优势。</strong></p>

<details><summary>展开版本配对、评审可见信息与计分规则</summary>
每个生成模型从第 2、3 次主实验运行中，选 60 条不同、产物有效的轨迹，每条取一对中间版本。步数间隔 1–2、3–5、至少 6 的各选 20 对，并平衡环境、难度与运行编号；筛选不按分数差或模型偏好挑案例。总计 360 对，每对由六个模型评审，共 2,160 次主要判断；一次回答同时比较几何和外观，不是 4,320 次调用。

评审模型只看参考图与两张候选渲染图，看不到生成模型身份、执行对话、隐藏深度、mask 或真实分数。检查程序要求判断与真实指标的方向<strong>严格一致</strong>，分差在 10⁻⁶ 内才算平局；回答“两个都不好”或调用最终失败都算错，60 对始终留在每个单元格的分母。另有 36 对交换左右顺序交给六个评审，增加 216 次审计；几何判断的交换顺序一致率为 69.4–100%，外观只有 61.1–83.3%。

原生成模型评审自己作品叫 self-judgment，其他模型来评审叫 cross-model judgment。几何改善方向的一致率分别为 45.8% 和 45.4%；外观分别为 62.2% 和 63.9%。这是针对这些重建版本的指标方向判断，不是所有空间推理任务的能力测量；由于存在平局，也不宜把 50% 当成精确的随机基线。

还有一处版本差异值得保留：公开的 <code>appendix_verified_evidence.json</code> 中，评审记录仍是 <strong>4 个生成模型、240 对、960 次判断</strong>；它不对应 v1 正文的六模型完整实验。本文六模型数字取自论文 Appendix F.3/Table 8，不把较早的 JSON 说成完整复现证据。
</details>

<h2 id="过程修正与场景下游用途">5. Discussion：过程修正与场景下游用途</h2>

**LEGO-Plugin 证明受控初始化、基于证据的修正和版本回退能减少过程性失败；LEGO-World 则检验最终场景能否作为视觉表示。**

<h3 id="三种针对性干预">5.1 三种针对性干预</h3>

作者把辅助流程称为 LEGO-Plugin。其 <strong>Enhanced Initialization</strong> 先用 VGGT 估计与重力对齐、以 Z 轴向上的坐标系，房间主要方向按互相垂直的 Manhattan 假设组织；再一起建立房间外壳与相机。每个可见对象的初始建议包含图中归一化中心、投影范围、相对远近顺序及是否可观察。单图不能稳定恢复绝对距离与实际尺寸，建议刻意不提供这两项。

<strong>Grounded Refinement</strong> 用 SAM 3 的对象区域和 Depth Anything V2 的相对深度检查修改后场景。它核对对象是否存在、位置和尺寸、支撑与碰撞、朝向、相机能否看见对象、投影中心与范围、远近顺序和亮度。必须通过的条件失败或缺少证据时不接受修改；场景变化后，旧检查报告作废，需要重测。

<strong>Version Control</strong> 让 Agent 在编辑前声明哪些对象可改、哪些必须保留、允许怎样改以及怎样验收。系统先保存位置、mesh、材质、层级、可见性、相机和渲染设置。修改越界、没有实现声明的变化或检查失败时，系统移除新增对象并恢复旧场景。这个可以接受或整体撤销的编辑单位称为 <strong>transaction</strong>。实验最多 8 次 transaction、2 次恢复旧场景（rollback）。

插件不训练模型，也不是另一个可以随意执行代码的编辑器。VGGT、SAM 3、Depth Anything V2 只分析公开参考图，不替 Agent 决定哪个 Blender 对象对应哪个参考对象。Agent 仍负责规划和对象对应；通用编辑只经 Blender MCP，插件按限定的操作与参数格式工作。

每个候选修改最多两轮修正。必须通过的检查缺证据也会阻止提交，可选检查失败只给警告；报告绑定精确场景状态，之后修改场景就作废。结束前还要通过流程检查：不能带着未处理的修改、过期报告或未检查的渲染直接交付。最终导出 1920×1080 图像不再改变几何。

这三个模块在 42 道 Office 任务上保持输入、提示词、执行预算、推理强度和评测器相同。六个模型全部提高 Overall：GPT-5.6-luna、terra、sol 分别相对提高 62.7%、55.8%、55.3%；GPT-6-luna 和 sol 提高 27.5%、12.1%；GPT-6-astra 只提高 2.1%。Reception 案例从 14.7 升到 32.5，Copy room 从 10.9 升到 27.8；论文比较的是三次基线运行中的最好成绩与插件输出，不能把这两个案例当成总体均值。

<h3 id="一份场景，直接读出三种视觉任务">5.2 一份场景，直接读出三种视觉任务</h3>

LEGO-World 让 GPT-6-astra 在自然图片上重建场景，再固定场景，不做任务专用训练。评测程序把对象几何投影成二维检测框和分割区域，并从相机视角渲染深度，作为相对深度预测。

<div class="table-scroll">
<table>
  <thead><tr><th>任务</th><th>数据与指标</th><th>LEGO-Anything</th><th>专用模型</th></tr></thead>
  <tbody>
    <tr><td>目标检测</td><td>COCO Box AP ↑</td><td>30.14</td><td>DINO 59.88</td></tr>
    <tr><td>对象分割</td><td>LVIS Mask AP ↑</td><td>14.75</td><td>SAM 3 53.96</td></tr>
    <tr><td>相对深度</td><td>ETH3D AbsRel ↓</td><td>0.1554</td><td>Depth Anything 3 0.0783</td></tr>
  </tbody>
</table>
</div>

这三项任务各尝试 100 张图，但不是同一批图片。检测与分割实际产生 94 份场景，AP（Average Precision，综合检测精度）仍把全部 100 图纳入评测，缺失输出视为未检测到对象。场景没有提供可信的置信度排序，所有对象置信度均设为 1.0；同分时按图像 ID、类别 ID 与输出内容固定顺序。因此这里的 AP 更适合检查场景输出能否接入现有评测，不宜当成标准置信度排序的检测表现。

深度先在逆深度空间拟合尺度与偏移，再算 AbsRel：逐像素绝对误差除以真值深度后平均。因此它是<strong>相对深度评测，不证明场景有正确的绝对米制尺度</strong>。LEGO 有 99 个有效深度输出，主表却并列专用模型的 100 图均值；同一 99 图上的专用模型为 0.07845，LEGO-Anything 为 0.15540，差距仍在。公开证据给出的专用模型配置为 DINO-R50-4scale-24ep、SAM 3、DA3MONO-LARGE，不应把表里的家族名理解成任意版本的这些模型。

<h3 id="可动部件：单独的探索实验">5.3 可动部件：单独的探索实验</h3>

<p>抽屉和门的可执行运动结构（Articulation）不计入主表 Overall。作者补齐参考标注后，同一个固定 Office 场景的 14 个可评可动对象仍得 0；当前场景重建结果尚不能可靠恢复这些运动机制。</p>

<details><summary>展开关节标注过程与辅助评分</summary>
这里的 Articulation 指抽屉、门等部件的可执行运动结构，<strong>不计入主表 Overall</strong>。作者先用 P3-SAM 与 X-Part 提出部件和关节候选，程序检查结构与运动，再由人看完整对象、运动渲染及回到静止姿态的证据。15 轮审查后，443 个规范资产分成 368 个静态、75 个可动资产；历史清单的 597 条记录合并了重复版本，不能再当作 597 个不同资产。

同一个固定 Office 场景的初步输出原来只有 2 个可评对象、12 个缺参考；补齐标注后，14 个可动对象都能评分，另加 12 个静态对照，结果仍为零。初步实验按命中的运动学条件计分；正式辅助协议则合并部件结构 F1、表面质量和关节 F1 的调和平均。两套分数公式不同，这组试验没有证明模型能恢复可靠的运动机制。
</details>

<h2 id="结论与仍待验证的边界">6. Conclusion：结论与仍待验证的边界</h2>

**它证明通用 coding agent 已经能稳定交付可执行 3D 场景，但可见表面、相机与外观仍不足以忠实表示输入图片。**

我最喜欢的是它对评测对象的选择。LEGO-Bench 重新打开最终产物，在固定相机和隐藏对象 mask 下测几何，再统一渲染测外观。Agent 的解释、代码是否优雅以及自己挑选的截图都不参与评分。Validity、Reconstruction 和 Appearance 分开报告，使“程序跑通”和“场景恢复正确”不再混为一个数字。

论文也留下了几条明确边界：

- 输入主要来自专业模拟器场景的渲染。接近自然图片的风格，不等于已经覆盖真实照片的噪声、反射、动态人物和未知相机。
- 单图本身有尺度、遮挡和背面形状歧义；不把候选自动对齐到参考场景的评分严格且清楚，却无法告诉我们某个视觉上合理的多解是否应被接受。
- 主表比较的是完整系统。专用基线的工具、原始输出、恢复流程、推理预算和可见信息并不统一，论文自己也明确写出“equalizes scoring, but not inference budget or information access”。
- LEGO-Plugin 只在 42 道 Office 任务上评测，强模型增益很小；没有逐个关闭模块的消融，无法分清初始化、观测检查和回滚各贡献多少。
- Articulation（可动部件重建）仍是探索性实验。作者补齐 443 个资产的正式标注清单后，重测同一个不再修改的 Office 场景；其 14 个可评的可动对象仍得 0，不能把零分归因于参考标注缺失。
- 论文网站和结果证据已公开，研究仓库与评测器实现尚未公开。当前可以复核结果记录和协议描述，不能独立重跑 LEGO-Bench 或检查全部实现细节。

下一步可以分别控制初始化、几何证据和版本回退，报告最好中间版本到最终版本损失多少分、相机误差、逐对象 F1 与成本。同时加入真实照片和多解标注，区分“与模拟器真值不同”和“视觉上不成立”。LEGO-World 也应在同一批图片上同时评测检测、分割和深度，避免三个各有 100 图的任务被误读为同一组场景支持三项任务。

现阶段最可靠的能力是有效场景交付，最薄弱的仍是几何、相机和外观忠实度；后期修改和自评尤其需要独立证据约束。

<details><summary>其余 25 项原论文图表：工作流、消融、附录协议与完整场景</summary>
<p>正文选用了最能解释任务、构造、评分、结果和失败案例的五项原图表。其他图表保留在原论文中，以下按 PDF 页码直达；其中部分数据和结论已在正文或图解中重排。</p>
<p>工作流与实验：<a href="https://arxiv.org/pdf/2609.36380v1#page=4">Figure 2 · Agent 工作流</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=7">Figure 4 · 推理强度</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=8">Figure 5 · 时间曲线</a>、<a href="https://arxiv.org/pdf/2609.36380v1#page=8">Figure 6 · 自评矩阵</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=9">Figure 7 · 插件流程</a>、<a href="https://arxiv.org/pdf/2609.36380v1#page=9">Figure 8 · 插件增益</a>、<a href="https://arxiv.org/pdf/2609.36380v1#page=9">Figure 9 · 两个场景对照</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=19">Figure 10 · 成本代理</a>、<a href="https://arxiv.org/pdf/2609.36380v1#page=20">Figure 11 · 共有任务轨迹</a>。</p>
<p>场景与评测细节：<a href="https://arxiv.org/pdf/2609.36380v1#page=22">Figure 13 · 六模型场景拼图</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=23">Figure 14 · 输入图</a>、<a href="https://arxiv.org/pdf/2609.36380v1#page=23">Figure 15 · 对象数量</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=24">Figure 16 · 对象尺寸</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=25">Figure 17 · 关节标注</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=27">Figure 19 · 指标敏感度</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=28">Figure 20 · 人工评分界面</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=29">Figure 21 · 默认提示词</a>。</p>
<p>表格：<a href="https://arxiv.org/pdf/2609.36380v1#page=3">Table 1 · 相邻基准</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=5">Table 2 · 数据统计</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=7">Table 4 · 场景复杂度</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=10">Table 5 · 下游读出</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=20">Table 6 · Bird’s-Eye</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=24">Table 7 · 关节真值覆盖</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=30">Table 8 · 自评完整矩阵</a>；<a href="https://arxiv.org/pdf/2609.36380v1#page=32">Table 9 · 自然图片覆盖</a>。</p>
</details>

<p class="source-note">证据范围：arXiv:2609.36380v1 全 33 页正文和附录、Figure 1–21 与 Table 1–9；五张本地原图保留原英文标签、完整数值与图注，只裁切 PDF 页边留白。项目网站可复核公开结果文件与算术，研究仓库和 evaluator 源码仍不可获得。</p>

<div class="paper-sources">
<strong>主要来源</strong>
<a href="https://arxiv.org/abs/2609.36380">论文与 v1 元数据</a>
<a href="https://lego-anything.com">官方项目页</a>
<a href="https://github.com/xirui-li/lego-anything-website/commit/07a67eb8a41d50756a31aa3d73a38cbe10e77e63">项目网站固定版本</a>
<a href="https://arxiv.org/src/2609.36380v1/anc/appendix_verified_evidence.json">官方附录证据 JSON</a>
</div>

</div>

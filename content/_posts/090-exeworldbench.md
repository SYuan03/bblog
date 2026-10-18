---
title: "[2026-10-10] ExeWorldBench: Benchmarking Code-Based Executable 3D World Modeling"
permalink: "/posts/论文解读/exeworldbench.html"
date: "2026-10-15T15:00:00+08:00"
updated: "2026-10-19T04:45:00+08:00"
cover: "/generated-covers/090-exeworldbench.webp"
description: "让模型用 Blender 搭出靠机械作用运行的三维装置。沿一道路口放行的真实任务，介绍题目怎么构建、模型看到什么、动画怎么评分，以及运行成功为何不等于机械正确。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
paper_style: editorial
categories:
  - "论文解读"
tags:
  - "World Modeling"
  - "Coding Agent"
  - "Benchmark"
  - "Blender"
  - "Physical Reasoning"
---

<div class="paper-reading">

<style>
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.dense-original>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.dense-original>a>img{width:850px;max-width:none;height:auto}}
</style>

<section class="deck-wrap" aria-label="ExeWorldBench 论文图解">
  <div class="deck-head"><strong>18 页图解 · 真实任务、评分与结果</strong><a href="/lib/decks/exeworldbench.html">独立阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/exeworldbench.html" title="ExeWorldBench 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>按钮或方向键翻页 · F 全屏 · Esc 退出</span><span>全部 9 图、9 表均可放大；手机密集图表可横滑</span></p></div>
</section>

<p class="paper-meta">Peng et al. · USTC / CUHK · arXiv:2610.15166v1 · 最早公开于 2026-10-10</p>
<div class="source-links"><a href="https://arxiv.org/abs/2610.15166">论文主页</a><a href="https://arxiv.org/pdf/2610.15166v1">原文 PDF</a><a href="https://helen1p.github.io/ExeWorldBench/">项目演示</a><a href="https://github.com/Helen1p/ExeWorldBench">GitHub</a><a href="https://huggingface.co/datasets/HelenPeng/ExeWorldBench">任务与评分提示</a></div>

<p class="lead">ExeWorldBench 让模型写程序，在三维建模和模拟软件 Blender 中搭出能工作的机械装置：看图还原齿轮、接通多级小球装置，或根据文字设计放行机构。后续运动必须由碰撞、约束、重力等机械作用产生。作者测的是模型能否把对装置的理解写成可执行实现，没有训练新模型。</p>

<aside class="part0" aria-label="Blender 基础">
<h3 id="part-0">Part 0：先分清两种“运动”</h3>
<p>Blender 的 Python 接口 <code>bpy</code> 可以创建物体、设置碰撞与关节并保存场景。<code>.py</code> 是搭建程序，<code>.blend</code> 是执行后保存的场景文件。给物体设置关键帧（keyframe），是直接指定“第几帧到哪个位置”；刚体模拟（rigid-body simulation）则设置质量、碰撞形状和约束，由物理引擎计算之后怎么动。题目允许驱动适当的输入组件，例如给循环机构的输入轴持续动力；下游零件必须靠连接、接触等机械作用运动，不能各自按动画时间表启动。</p>
<details><summary>展开：球落向地面的 Blender 教学代码</summary>

```python
import bpy

# 本文教学片段：球在重力下落向固定地面，不是 benchmark 解法。
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.25))
ground = bpy.context.object
ground.dimensions = (4, 4, 0.5)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.ops.rigidbody.object_add()
ground.rigid_body.type = "PASSIVE"
ground.rigid_body.collision_shape = "BOX"

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, location=(0, 0, 2))
ball = bpy.context.object
bpy.ops.rigidbody.object_add()
ball.rigid_body.type = "ACTIVE"
ball.rigid_body.mass = 1.0
ball.rigid_body.collision_shape = "SPHERE"

scene = bpy.context.scene
scene.gravity = (0, 0, -9.81)
scene.frame_end = 120
```

<p><code>ACTIVE</code> 刚体参与动力学运动；<code>PASSIVE</code> 刚体在这个示例中用作固定支撑。</p>
<p class="source-note">基于 Blender 官方 <a href="https://docs.blender.org/api/current/bpy.types.RigidBodyObject.html">RigidBodyObject</a> 与 <a href="https://docs.blender.org/api/current/bpy.ops.rigidbody.html">rigidbody operators</a> 编写。论文提示指定 Blender 5.2；本文只检查了 Python 语法，未在该版本运行。片段不含相机、渲染和完整任务实现。</p>
</details>
</aside>

<aside class="keypoints"><ul>
<li>共 <strong>273 道题</strong>，从看图还原逐步减少提示，直到模型自行选择机构。</li>
<li>评分模型主要看动画采样帧。Codex 在目标设计题中平均满足 90.14% 的评分条件，机械执行分仍为 5.82 / 10；前者不是整题成功率。</li>
<li>题目和评分提示可查，完整执行、修复与评分汇总代码尚未公开。</li>
</ul></aside>

<p class="source-note">与博客作者本人的兴趣相关程度：9 / 10。本文沿用论文的模型名称；原图表来自 Peng et al., v1，许可为 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。详细材料按需展开，不删原始证据。</p>

<h2 id="motivation">1. Motivation：运行成功，还要看机械过程</h2>

<p><strong>装置的外形、运动和机械依赖可能分别出错。</strong>齿轮与连杆可以画得很像，转轴却连接错误；程序也能让零件依次运动，却只是按预设时间播放。多级装置更苛刻：球不仅要滚下斜坡，还要碰到骨牌，骨牌再触发下一级。各级单独正确，不保证位置、方向和距离能把它们接起来。</p>

<p>公开任务 <code>053</code> 要运输两件物体 A、B，它们经过同一个路口。<strong>B 必须先开始接近，A 要先通过；A 完全离开之后，再靠机械作用放行 B。</strong>先让 A 走完才启动 B，或者到固定时刻自动开门，都不符合题目要求。论文的 Codex 输出如下，§3.3 会沿这题讲解判分。</p>

<figure class="figure original"><a href="/lib/papers/exeworldbench/figure-9-detail-codex.png"><img src="/lib/papers/exeworldbench/figure-9-detail-codex.png" width="888" height="206" alt="原图Figure 9的Codex一行：共享路口任务的四个动画时刻"></a><figcaption>Figure 9 局部裁切：同一输出的四个时刻，条件满足率 100%，机械执行分 5 / 10。完整原图在 §3.3。Peng et al., v1, p.19，CC BY 4.0。</figcaption></figure>

<p>论文把推断结构、运动与依赖称为 world understanding，把写成可执行系统称为 executable realization。实验测的是完整产出，没有分别测定理解、规划和实现各自出了多少错。</p>

<h2 id="related-work">2. Related Work：机械组合与判分证据分别比较</h2>

<p><strong>特色是复杂三维机构的组合与自主设计，不是首次生成物理模拟代码。</strong>最接近的前作也并非都只看图像；它们使用的验证证据值得一起比较。</p>

<div class="table-scroll"><table class="comparison-table"><thead><tr><th>工作</th><th>输入与产出</th><th>怎样验证</th><th>主要区别</th></tr></thead><tbody>
<tr><td><a href="https://arxiv.org/abs/2604.23580v2">PhysCodeBench v2</a></td><td>物理描述 → Genesis / MuJoCo 模拟代码；1,200 个专家验证样例</td><td>执行、视觉指标；读取引擎状态，做物理断言和守恒量检查</td><td>直接检查物理量；ExeWorldBench 更集中于多组件装配和机械传递</td></tr>
<tr><td><a href="https://arxiv.org/abs/2606.01869">WorldCoder-Bench</a></td><td>文字与可选三维资产 → Three.js 浏览器世界；2,026 个任务</td><td>StateProbe 执行动作并读取内部状态，检查隐藏规则；注入错误检验规则有效性</td><td>突出交互与界面状态同步；这篇突出 Blender 的接触、关节和机械组合</td></tr>
<tr><td>ExeWorldBench</td><td>图像 / 组件 / 目标 → Blender 装置</td><td>查看采样动画帧，评分结构、机械过程和目标条件</td><td>题目要求真实机械依赖，但视觉证据不足以审计全部实现</td></tr>
</tbody></table></div>

<p>PhysCodeBench 的专家从题目写出可执行的真假检查（assertion），第二位专家复核，评测读取引擎状态。WorldCoder-Bench 的 StateProbe 是执行动作和检查运行状态的程序；作者还往参考实现注入已知错误，检验规则能否抓住问题。ExeWorldBench 则主要让评分模型看帧。三者的任务和证据不同，不跨论文直接比较分数。</p>

<details><summary>补充：视觉动力学、建模与环境变化的相关工作</summary>
<div class="table-scroll"><table class="comparison-table"><thead><tr><th>工作</th><th>任务与规模</th><th>与这篇的边界</th></tr></thead><tbody>
<tr><td><a href="https://arxiv.org/abs/2602.13294">VisPhyWorld</a></td><td>视觉观察 → 可执行模拟；209 个场景、108 种模板</td><td>重建外观与动力学；这篇还包含无视觉参考的设计</td></tr>
<tr><td><a href="https://arxiv.org/abs/2606.01538">MPMWorlds</a></td><td>二维物理视频 → 模拟代码或视频预测；包含变形体与流体</td><td>恢复和外推动力学；二维不等于物理内容简单</td></tr>
<tr><td><a href="https://arxiv.org/abs/2606.01057">3DCodeBench</a></td><td>文字 / 图片 → 三维建模程序；测试 12 个 VLM</td><td>重心是几何、渲染及人工成对偏好；这篇要求完整机械过程</td></tr>
<tr><td><a href="https://arxiv.org/abs/2608.14441">PACE-Bench</a></td><td>已有设计 → 环境变化后的修改；144 对任务</td><td>限定尝试次数，用模拟反馈检验目标；研究改造而非从零构建</td></tr>
</tbody></table></div>
<p class="source-note">这四行的范围与规模核对各自原始摘要。前两篇主要对照分别核查 PhysCodeBench v2 §3–4、WorldCoder-Bench §2–3；不将前作概括成“只看画面”。</p>
</details>

<h2 id="protocol">3. Benchmark / Protocol：一道题怎样得到分数</h2>

<p><strong>先区分题目制作、Agent 生成和 judge 判分。</strong>构建时用过的参考代码与完整动画，不自动成为被测模型的输入；公开评分提示也不等于公开了完整评测程序。</p>

<h3 id="task-package">3.1 四种输入，273 道独立题目</h3>

<div class="table-scroll"><table><thead><tr><th>设置</th><th>题数</th><th>模型可见</th><th>自行决定</th></tr></thead><tbody>
<tr><td>T1 · Mechanism Executability</td><td>50</td><td>单机构静态参考图</td><td>几何、连接、约束与完整运动</td></tr>
<tr><td>T2 · Compositional Executability</td><td>100</td><td>多级装置静态参考图</td><td>调整布局，接通各级机械过程</td></tr>
<tr><td>T3-1 · Component-Constrained Synthesis</td><td>63</td><td>组件名称、定义、组件数与球数</td><td>组件顺序、布局、连接；每实例恰好用一次</td></tr>
<tr><td>T3-2 · Goal-Constrained Synthesis</td><td>60</td><td>目标、物体、状态、事件与规则</td><td>选择机构，再完成机械设计</td></tr>
</tbody></table></div>

<p>论文分 T1、T2、T3，T3 再分两种设置。T1/T2 的主设置不给运动帧，额外的运动参考实验不增加独立题数。T2 允许调整高度、距离和朝向；T3-1 的列表顺序打乱，重复的 Ramp 是不同斜坡实例，并非暗示执行顺序。模型拿到名称和定义，不拿到作者的组件代码。</p>

<h3 id="construction">3.2 谁构建任务，谁执行与修改</h3>

<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/figure-1.png"><img src="/lib/papers/exeworldbench/figure-1.png" width="1840" height="924" alt="Figure 1原图：T1动画筛选、T2组件库组合与T3任务验证"></a><figcaption>Figure 1 · 数据构建路径。图中的 Evidence Generation 等操作用来制作、筛选题目，不是被测模型的答题流程。Peng et al., v1, p.4，CC BY 4.0。</figcaption></figure>

<p>T1 从公开机械动画中筛选画面清楚、至少有三个机械活跃组件、静态结构可推断运动的题目。Astra 同时看静态图与完整运动，写三条<strong>只描述静态结构</strong>的线索；Opus 5 只看图与线索写运动描述；Astra 核对描述与原动画，最后五名人工标注者排除歧义。三条线索用于筛题，<strong>不交给主设置的被测模型</strong>。</p>

<p>T2 由作者制作预定义组件代码库。Astra 提出 4–13 级序列，人工审核，再由 Astra 在 Codex 中组合已有实现、调整布局生成参考。T3-1 从库中抽 4–12 个组件，Astra 检查是否能连成一条链；T3-2 按三档难度各三分之一，让 Astra 写规格、Opus 5 检查一致性和可解性，再人工复核。组件库和完整参考代码尚未公开；任务也不能统称为全部人工标注。</p>

<p>把模型接到文件系统、shell 和 Blender，并组织多轮执行、查看和修改的外层软件，在这里称为 <strong>harness</strong>。被测组合是 Astra + Codex CLI、Fable + Claude Code，交出最终 <code>.py</code> 与执行后生成的 <code>.blend</code>。API 设置先调用模型一次，返回 JSON 的 <code>code</code> 字段；作者另用 Astra + Codex 修复技术性执行错误，记录修复前后结果。修复被要求不改场景结构和预期行为，但每轮改动没有公开，预算也未与 harness 严格匹配。</p>

<details><summary>补充：数据分布、公开范围和隔离限制</summary>
<figure class="figure original narrow"><a href="/lib/papers/exeworldbench/table-5.png"><img src="/lib/papers/exeworldbench/table-5.png" width="968" height="864" alt="Table 5原表：850次组件使用，Ramp256次"></a><figcaption>Table 5 · 850 是组件出现次数，不是题目数。Ramp 占 30.12%，Catch Bowl 占 11.76%。Peng et al., v1, p.13，CC BY 4.0。</figcaption></figure>
<p>题目集中于斜坡、小球、骨牌等机械装置，不能代表流体、柔性体或所有三维世界。公开版本没有固定训练 / 验证 / 测试划分；参考材料已在同一数据集中，未来用于训练需重新划分。T1 来源是已有公开动画，论文未量化模型此前接触它们的程度。</p>
<p>生成提示禁止扫描其他目录，但未公开操作系统隔离配置，也没有把最终评分回传给 Agent 的步骤。总 token（模型处理的文本单位）、工具执行次数、耗时和多随机种子重复结果未完整报告。五名 T1 标注者的逐题分歧与一致性系数也未报告。</p>
</details>

<h3 id="generation">3.3 真实任务 053：先接近，后通行</h3>

<p><strong>先看 Agent 的完整交付要求，再看评分模型能观察什么。</strong>任务来自 <a href="https://huggingface.co/datasets/HelenPeng/ExeWorldBench/blob/c6dc85e412af91046b5a58d783324df7baf846f4/t3/task2/053/053.txt"><code>t3/task2/053/053.txt</code></a>，与论文 pp.20–21 的规格一致，属于前述模型辅助构建、人工复核路径，没有逐题标注者署名。</p>

<div id="case-053"></div>
<p>输入规定两件运载物 <code>payload_A</code>、<code>payload_B</code>，各自接收区域 <code>target_A</code>、<code>target_B</code>，固定且画明边界的路口 <code>shared_region</code>、两个内部检查平面。<code>object_A</code> 是模型自行设计的被动机械组件：A 完全离开路口，要通过物理作用改变它的位置或姿态，再由它放行已经移动的 B。payload 指要运输的物体，并不限定是球。</p>

<ol>
<li>初始 A、B 静止，都在路口和各自目标外；object_A 处于预先声明的 state_A0。另一姿态 state_A1 的范围也需预先声明，并与 A0 不重叠。</li>
<li>B 先持续开始移动，再由 A 进入路口。B 可在接近，但在 A 占据路口期间必须留在外面。</li>
<li>A 依次进入、正向跨过内部 checkpoint_A、完全离开；A 离开靠机械作用改变 object_A，才允许 B 进入。</li>
<li>B 同样进入、跨 checkpoint_B、完全离开，两物体到各自目标。全程不能互相接触、同时占据路口或离开后重入。</li>
<li>最终 A、B 整体持续留在接收区域，object_A 持续保持 state_A1。短暂到达或只在最后一帧出现不够。</li>
</ol>

<p>进入事件按<strong>任意碰撞几何与路口重叠</strong>定义，离开按<strong>全部碰撞几何完全清出</strong>定义；checkpoint 检查物体中心正向过平面，target 要整个碰撞几何被包含。这些定义不能混用：中心出了路口，尾部可能仍在里面。</p>

<div class="formula" aria-label="任务053的关键时序"><div>E_start_B &lt; E_enter_A</div><div>E_exit_A ≤ E_change_A1 ≤ E_enter_B</div><div>E_exit_A &lt; E_enter_B</div></div>

<p>第一行是 R13。R05 允许 A 离开与机构改变、机构改变与 B 进入落在同一模拟步，但仍要求真实机械依赖；R06 另外要求 A 离开<strong>严格早于</strong> B 进入。满足时间不等式还不够，不能用定时器替代机构。</p>

<div id="judge"></div>
<p>作者用 Opus 5.5 作为 <strong>VLM judge</strong>，即独立的多模态模型调用：读取动画采样帧、物体 / 状态 / 事件定义及 I/B/F 评分条目，输出分数。I 指初始条件，B 指过程条件，F 指最终条件；每条完整满足且可见证据充分才给 1，其余给 0。它<strong>不读取源代码、碰撞日志或逐步引擎状态</strong>；运动阈值、最终保持时长、完整采样方案也未公布。</p>

<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/figure-9.png"><img src="/lib/papers/exeworldbench/figure-9.png" width="888" height="749" alt="Figure 9原图：053任务的Codex、Astra API、DeepSeek与Qwen输出及分数"></a><figcaption>Figure 9 · 每行是同一输出的四个时刻；V 是结构分，ECM 是机械执行分，G 是条件满足率。Codex：7、5、100%；Astra API：7、7、100%；DeepSeek：3、1、28.60%；Qwen：2、0、0%。具体评分规则见下一节。手机可横向滚动原图。Peng et al., v1, p.19，CC BY 4.0。</figcaption></figure>

<p>规则能直接给出失败例：尾部没出路口就放 B，违反完全离开与禁止同时占据；A 走完才启动 B，违反 R13；第 60 帧自动开门，违反 R05 的物理依赖。这些是根据规格推导的讲解例，<strong>不是作者公布的模型失败日志</strong>。原规格有 7 条 Initial、13 条 Rules、3 条 Final，但 Rules 到评分 B 的映射未公开，不能拿 23 作分母反推 DeepSeek 的 28.60%。</p>

<h3 id="aggregation">3.4 从一次判分到榜单</h3>

<p><strong>四个指标回答不同问题，G 的分母先按题计算。</strong>Visual Structure（V，0–10）评几何、连接、装配和呈现；普通但正确的呈现通常不高于 8，明确结构缺陷通常不高于 5。Mechanical Motion（M，0–10）用于 T1，比较完整运动与约束，不要求参考和生成帧时间对齐或轨迹逐像素相同。</p>

<p>Executable Causal Mechanism（ECM，0–10）看组件完整动作和前一级的机械传递。T2/T3-1 有 N 个组件就有 N 段：<code>initial → C1</code>，再到 <code>C1 → C2</code>，直到最后。每段评价接收组件的动作与进入它的传递，不再重复前一级动作。断链段按实际部分完成给分，<strong>无法由连续机械传递到达的下游段全部为 0</strong>；之后独立启动不能恢复得分。教学段分 <code>[9, 8, 2, 0]</code> 的均值是 <code>19 / 4 = 4.75</code>。</p>

<p>Goal Satisfaction（G）是 T3-2 的条件满足比例。第 i 题中 P 表示满足条目数，N 表示全部条目数，I/B/F 表示三个类别：</p>

<div class="formula"><div>G_i = (P_i^I + P_i^B + P_i^F) / (N_i^I + N_i^B + N_i^F)</div><div>G = mean_i G_i</div><div>Sat^c = mean_i(P_i^c / N_i^c), c ∈ {I, B, F}</div></div>

<p>各题等权。两道虚构题分别通过 3/4、1/2 条，按题平均为 62.50%，把全部条目混算为 66.67%，论文用前者。三类别率分别平均，直接平均它们通常不等于 G。主表让执行失败题记零，保留全部题；附录只平均能执行的题。Astra T1 修复后执行率 94%、执行成功题 M 均值 5.40，所以全题均值约 <code>0.94 × 5.40 = 5.08</code>。下标 1/2 指修复前/后。</p>

<p><strong>G=100% 不要求 ECM=10，也不是严格整题成功率。</strong>公开 T3-2 提示输出整体 ECM 整数，与正文笼统的“分段均值”描述不同；其他两个任务的分段规则不能直接套过来。论文也未定义某类别没有条目时怎么计算。</p>

<details><summary>补充：帧数、第二个真实案例与可运行的评分算术</summary>
<p>T1 用六张均匀采样的生成帧与有序参考运动帧；T3-1 用九张生成帧；T2/T3-2 未在公开提示中统一固定帧数。T1 的两序列独立排序，不能按下标配对；短事件未直接采到但邻帧支持发生时，M 评分可推断。T2 的组件顺序给 judge，T3-1 则由 judge 从帧推断。</p>
<p>真实 T3-1 任务 <a href="https://huggingface.co/datasets/HelenPeng/ExeWorldBench/blob/c6dc85e412af91046b5a58d783324df7baf846f4/t3/task1/12_10/12_10.txt"><code>12_10</code></a> 有 12 个组件、2 个球：4 个 Ramp、2 个 L-Shaped Chute，以及折返轨道、收集碗、挡板、五块骨牌、四叶拨轮和漏斗。每个实例须用一次；两球可以经机械作用接力，不要求一球走完全程，也不能加新的功能级绕过指定组件。</p>
<figure class="figure original portrait dense-original"><a href="/lib/papers/exeworldbench/figure-8.png"><img src="/lib/papers/exeworldbench/figure-8.png" width="886" height="1061" alt="Figure 8原图：12_10任务中五种模型的机械装置和动画时刻"></a><figcaption>Figure 8 · <code>12_10</code>。Codex ECM=6.67，Astra API=6.50，GLM=0；没有公开逐段判分，不能从图编出骨牌失败日志。Peng et al., v1, p.18，CC BY 4.0。</figcaption></figure>
<p>提示中的“移除 A 后 B 是否仍会动”只是让 judge 辅助推理。T3-2 明确不要求实际干预，评价器没有因此真的拆掉零件重新模拟。</p>

```python
"""Independent arithmetic checks for the ExeWorldBench explainer.

The first examples use invented scores/counts. The final calculations use
rounded values reported in Tables 1/6 and Tables 4/9. This is not the official
judge, runner, a model trace, or a reimplementation of visual evaluation.
"""

ecm_segments = [9, 8, 2, 0]
print(f"ECM example: {sum(ecm_segments) / len(ecm_segments):.2f}")

tasks = [(3, 4), (1, 2)]
macro = sum(p / n for p, n in tasks) / len(tasks)
pooled = sum(p for p, n in tasks) / sum(n for p, n in tasks)
print(f"Task-macro G: {100 * macro:.2f}%")
print(f"Pooled conditions: {100 * pooled:.2f}%")

print(f"Astra T1 M2: {0.94 * 5.40:.2f}")
print(f"Kimi T3-2 G2: {(49 / 60) * 22.20:.2f}%")
```

<p>实际运行输出：4.75、62.50%、66.67%、5.08、18.13%。这些只验证算术，不验证模型判分。下载 <a href="/lib/papers/exeworldbench/score-example.py">score-example.py</a>。</p>
</details>

<h2 id="experiments">4. Experiments：修好执行错误，机械过程仍会失败</h2>

<p><strong>修复明显提高运行率，却未普遍解决机械组合。</strong>Kimi 在 T1 的执行率从 8% 升到 86%，M 只从 0.04 升到 0.80；T2 修复后 79% 可执行，ECM 仍为 0，Qwen 也有 62% 可执行但 ECM=0。这些结果已包含外部 Astra 修复，不能归成原模型独立生成的成绩。</p>

<h3 id="goal-results">4.1 目标设计：条件满足与机械过程的差距</h3>

<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-4.png"><img src="/lib/papers/exeworldbench/table-4.png" width="1624" height="1012" alt="Table 4原表：60道T3-2的执行率、结构、机械过程与条件满足率"></a><figcaption>Table 4 · 全部 60 道 T3-2 题为分母，执行失败计零；G 是按题平均的条件满足比例。API 的第二列含技术性修复。Peng et al., v1, p.8，CC BY 4.0。</figcaption></figure>

<p>Codex 的 G=90.14%、ECM=5.82；Claude Code 为 75.19%、5.17。Astra API 修复后 91.67% 可执行，G=41.07%、ECM=2.55；Kimi 为 81.67%、18.13%、0.63。Harness 组合在平均成绩上领先，但实验未分离基础模型、工具反馈、更多尝试和修复的贡献。</p>

<details><summary>展开：T1 / T2 / T3-1 全部主表与代表例</summary>
<div id="t1-results"></div>
<p>T1 Codex M=6.32、Claude Code=5.68；Astra API 修复前后执行率 58%→94%，M 3.14→5.08。Fable API 修复后 V=4.04、M=3.24，结构分和运动分仍有差距。</p>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-1.png"><img src="/lib/papers/exeworldbench/table-1.png" width="1616" height="1016" alt="Table 1原表：50道T1修复前后的执行、结构与运动分"></a><figcaption>Table 1 · T1，全 50 题。E 执行率，V/M 为 0–10 均值，下标 1/2 为修复前/后。Peng et al., v1, p.7，CC BY 4.0。</figcaption></figure>
<figure class="figure original portrait dense-original"><a href="/lib/papers/exeworldbench/figure-6.png"><img src="/lib/papers/exeworldbench/figure-6.png" width="888" height="957" alt="Figure 6原图：T1齿轮和连杆参考以及模型生成结果"></a><figcaption>Figure 6 · 每行四个时刻，顶部是参考。Kimi 后续零件偏离机构，M=1；DeepSeek M=0。没有代码和逐项分数，不能确定具体代码故障。Peng et al., v1, p.16，CC BY 4.0。</figcaption></figure>
<div id="composition-results"></div>
<p>T2 Codex ECM=5.25、Claude Code=4.08，Astra API 修复后=2.47。ECM 混合了组件动作、空间接触与传递，不能称为纯因果推理准确率。</p>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-2.png"><img src="/lib/papers/exeworldbench/table-2.png" width="1616" height="1016" alt="Table 2原表：100道T2执行率、结构分与ECM"></a><figcaption>Table 2 · T2，全 100 题。Kimi 79% 可执行但 ECM=0。Peng et al., v1, p.7，CC BY 4.0。</figcaption></figure>
<figure class="figure original portrait dense-original"><a href="/lib/papers/exeworldbench/figure-7.png"><img src="/lib/papers/exeworldbench/figure-7.png" width="891" height="880" alt="Figure 7原图：多级装置参考和生成结果"></a><figcaption>Figure 7 · 这一个 T2 代表例中 Astra API ECM=4.08，高于 Codex 3.33。总体领先不代表逐题领先。Peng et al., v1, p.17，CC BY 4.0。</figcaption></figure>
<p>T3-1 Codex ECM=6.11、Claude Code=5.70；Astra API 修复后 3.34，Fable API 2.75，其他 API 最高 0.40。T2/T3-1 的题目和组件分布不同，不能把二者当同题逐步去提示的受控实验。</p>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-3.png"><img src="/lib/papers/exeworldbench/table-3.png" width="1616" height="1016" alt="Table 3原表：63道T3-1指定组件设计结果"></a><figcaption>Table 3 · T3-1，全 63 题。指定组件，不指定顺序和布局。Peng et al., v1, p.8，CC BY 4.0。</figcaption></figure>
</details>

<h3 id="motion-reference">4.2 增加运动参考，也有负结果</h3>

<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/figure-3.png"><img src="/lib/papers/exeworldbench/figure-3.png" width="1575" height="534" alt="Figure 3原图：T1加运动参考前后，Astra API机械分下降"></a><figcaption>Figure 3 · T1 加运动参考。Codex M 6.32→7.08，Astra API 5.08→3.40。Peng et al., v1, p.9，CC BY 4.0。</figcaption></figure>

<p>多数模型获益，但 Astra API 是明确反例。多看几帧并不保证能写对结构和约束。不同机械级数的结果总体下降，但曲线不严格单调，而且分组题目不同、没有组内样本数和误差条；不能从中算出普适的“每多一级损失”。</p>

<details><summary>补充：机械级数、T2 运动参考与初始 / 过程 / 最终条件</summary>
<div id="horizon-results"></div>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/figure-2.png"><img src="/lib/papers/exeworldbench/figure-2.png" width="1520" height="498" alt="Figure 2原图：T2和T3-1按机械级数分组的ECM"></a><figcaption>Figure 2 · Step 指装置执行级数，不是工具调用或修改轮数。修复后结果；早期断链的下游零分也会放大影响。Peng et al., v1, p.9，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/figure-4.png"><img src="/lib/papers/exeworldbench/figure-4.png" width="1559" height="531" alt="Figure 4原图：T2加入运动参考的结果"></a><figcaption>Figure 4 · Codex ECM 5.25→5.66，Claude Code 4.08→4.34，Astra API 与 GLM 略降。额外输入设置的执行率、调用预算和重复统计未补齐。Peng et al., v1, p.10，CC BY 4.0。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/exeworldbench/figure-5.png"><img src="/lib/papers/exeworldbench/figure-5.png" width="601" height="686" alt="Figure 5原图：G与I/B/F类别满足率"></a><figcaption>Figure 5 · API 模型通常更易满足初始条件，过程与最终条件更难。各轴独立按题平均，不能直接平均成 G。Peng et al., v1, p.15，CC BY 4.0。</figcaption></figure>
<p>053 的初始条件主要是摆放、静止和姿态，中途却要求提前接近、机械阻挡、完全离开后放行。类别差异与这个区别一致，但论文没有匹配条件数量、类型和难度的控制实验。</p>
</details>

<details><summary>补充 Tables 6–9：只平均能执行的 API 输出</summary>
<div id="conditioned-results"></div>
<p>排除运行失败后，质量均值换了分母。修复救回困难题、成功子集扩大，子集均值可能下降，同时全题均值提高，二者不矛盾。</p>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-6.png"><img src="/lib/papers/exeworldbench/table-6.png" width="1616" height="832" alt="Table 6原表：T1能执行子集的质量均值"></a><figcaption>Table 6 · T1。Astra M2=5.40，乘 94% 得主表约 5.08。Peng et al., v1, p.13，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-7.png"><img src="/lib/papers/exeworldbench/table-7.png" width="1616" height="832" alt="Table 7原表：T2能执行子集的质量均值"></a><figcaption>Table 7 · T2。Astra ECM2=2.71，排除运行失败仍远低于满分。Peng et al., v1, p.14，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-8.png"><img src="/lib/papers/exeworldbench/table-8.png" width="1616" height="836" alt="Table 8原表：T3-1能执行子集的质量均值"></a><figcaption>Table 8 · T3-1。Astra ECM2=3.90，Fable API=2.75。Peng et al., v1, p.14，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/exeworldbench/table-9.png"><img src="/lib/papers/exeworldbench/table-9.png" width="1624" height="832" alt="Table 9原表：T3-2能执行子集的条件满足率与质量"></a><figcaption>Table 9 · Kimi G2=22.20%，49/60 可执行，主表约为 18.13%。Peng et al., v1, p.15，CC BY 4.0。</figcaption></figure>
</details>

<h2 id="discussion">5. Discussion：下一步先验证真实机械依赖</h2>

<p><strong>帧评分应与可信引擎读数互补。</strong>对 053，可记录任意重叠与完全离开、接触、object_A 姿态，再阻止 A 改变放行机构，重跑检查 B 是否仍自动进入。视频用于检查装配与可见性。这里的干预是本文建议，作者未做；引擎读数也不能仅靠生成程序自报，要用已知错误校准。</p>

<p>另一个应补的实验是同模型、同预算比较单次生成、纯技术修复、查看渲染的多轮修改，公开每轮代码、执行次数和耗时。机械级数实验则可从同一基础装置逐级增加组件或改变参数，控制题目差异，再检查多次生成的稳定性与 judge / 人工一致性。</p>

<p>若用于游戏代码研究，可以借鉴“中间过程也要由正确机制产生”的要求：最终门开了，还需检验是否真由开关触发。本文没有蒸馏或特权信息训练，不能据这些成绩宣称某种训练方法有效。</p>

<h2 id="conclusion">6. Conclusion：任务有价值，分数有证据边界</h2>

<p><strong>这套任务展示了运行成功与机械正确性之间的差距。</strong>理解榜单时，要分清四种任务各给了什么输入、053 怎样要求机械放行，以及断链记分和平均分的分母。采样帧不足以审计所有真实依赖，Codex 的 90.14% 不能读成完整解决了 90.14% 的任务。</p>

<p>GitHub <a href="https://github.com/Helen1p/ExeWorldBench/tree/06bb54244a7240da61c23f2429efc865c5c2197c"><code>06bb542</code></a> 仅有 README、网页和展示资产。数据固定版本 <a href="https://huggingface.co/datasets/HelenPeng/ExeWorldBench/tree/c6dc85e412af91046b5a58d783324df7baf846f4"><code>c6dc85e</code></a> 的完整文件清单有 2,117 项，提供任务、参考、生成与评分提示，未见批量执行、组件库、修复或汇总代码。可以试跑公开提示，还不能完整复现作者流程。</p>

<p class="source-note">本轮重读 v1 全文与附录 21 页，复查全部原图表和上述固定资料。2026-10-19 再查 arXiv 和 GitHub；Hugging Face 新请求超时，数据结论基于已取得的固定版本，不声称核实了更新后的发布。<a href="/lib/papers/exeworldbench/exeworldbench.sources.json">证据与图表清单</a>。</p>

</div>

<script>
(() => {
  const revealAnchor = () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (!target || !target.closest('.paper-reading')) return;
    let opened = false;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open) { parent.open = true; opened = true; }
    }
    if (opened) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  };
  window.addEventListener('hashchange', revealAnchor);
  revealAnchor();
})();
</script>

---
title: "[2026-09-27] SWE-Game: Can Coding Agents Build the Games We Want?"
permalink: "/posts/论文解读/swe-game.html"
date: "2026-10-08T13:26:00+08:00"
updated: "2026-10-08T13:26:00+08:00"
cover: "/lib/papers/swe-game/cover.svg"
description: "SWE-Game 用 41 个可执行 Godot 参考游戏构造 247 道开发、补全、修复与跨引擎移植题。本文从 Beacon Relay 真实题目出发，拆解模型配置、评测 harness、隐藏 checker、no-input control 与最终计分。"
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

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

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

<p class="lead">SWE-Game 让评测器亲自操作游戏，再从引擎状态判断指定机制是否真的发生。41 个可执行参考游戏被拆成 247 道题，覆盖从一句 brief 开发完整游戏、照 GDD 实现、补全骨架、修 bug，以及把 Godot 游戏迁移到 Unity。</p>

<div class="metrics" aria-label="SWE-Game 关键数字">
  <div class="metric"><strong>247</strong><span>任务，来自 41 个参考游戏</span></div>
  <div class="metric"><strong>5</strong><span>开发、补全、修复与移植模式</span></div>
  <div class="metric"><strong>50.38</strong><span>最佳 Brief-to-Game 总分</span></div>
  <div class="metric"><strong>92.59%</strong><span>可执行检查的 balanced accuracy</span></div>
</div>

<aside class="keypoints"><h3>先记住</h3><ul><li>榜单比较的是六个“模型 + 各自 Agent framework”组合，论文没有公开六套 framework 的名字与统一工具预算。</li><li>候选只提交语义绑定，隐藏的 drivers、probes、certified routes 和期望结果归评测器所有。</li><li>三类从头构建任务的最佳总分仍低于 60；能生成合法项目，离实现指定玩法还有明显距离。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 先分清两套系统</span><h3>Agent harness 与 evaluation harness 分工不同</h3><p>模型端的 Agent harness 负责读文件、改代码、运行 Godot 或 Unity、调用工具。论文只说每个模型使用自己的 framework 和 tools，没有披露具体客户端。评测端 harness 则由作者实现：它校验交付物、向工作副本注入 driver 和 probe、重放输入、读取引擎状态并计算分数。下文凡是谈 <code>gb_levels.json</code>、certified route、no-input control 和 hidden check，指的都是评测端。</p></aside>

## Q1. 为什么“能打开”远远不等于“做出了想要的游戏”？

<p><strong>游戏的结果必须由玩家动作引起，画面相似和胜利界面都不能单独证明玩法成立。</strong>一个平台跳跃游戏可以把尖刺画得很像，却没有实现碰撞伤害；一个候选也可能直接进入胜利状态，绕过整条关卡。静态源码检查看不到这类因果错误，单看录像的 VLM 又难以确认隐藏碰撞、精确时序和内部状态。</p>

<p>SWE-Game 把需求落到可执行行为上。评测器按预定输入操作候选游戏，观察玩家、敌人、危险物、收集物和进度等状态。如果同样时长的无输入对照也能达到目标，这条路线不给分。视觉质量另交给带游戏专属 rubric 的 VLM，不让画面评分代替玩法正确性。</p>

<p>这比普通代码题难在实现可以完全不同。两个 Agent 都做出了 Beacon Relay，一个可能把玩家节点叫 <code>Hero</code>，另一个叫 <code>CharacterBody3D</code>。checker 不能依赖候选内部路径，所以论文要求提交者把对象注册为 <code>gb_player</code>、<code>gb_hazard</code> 等语义角色，并把实时 <code>progress</code>、<code>health</code>、<code>timer</code> 映射到统一接口。</p>

## Q2. 它与已有游戏生成 benchmark 的边界在哪里？

<p><strong>SWE-Game 的区别是用同一批可执行参考游戏贯通“从头做、补全、修复、移植”，并让 evaluator-owned runtime checks 验收不同实现。</strong>GameCraft-Bench 偏完整 Godot 游戏生成和多模态 rubric；GameDevBench、JamBench、GameLogicBench 也使用工程或运行时检查，但任务类型、输入材料和计分单元不同。SWE-Game 把 criterion、certified route 与 keypoint 作为主要评分单元，并覆盖 Godot 到 Unity 的迁移。</p>

<div class="table-scroll"><table>
  <thead><tr><th>工作</th><th>主要输入与产物</th><th>主要证据</th><th>SWE-Game 的差别</th></tr></thead>
  <tbody>
    <tr><td>GameCraft-Bench</td><td>文本、资产 → Godot 游戏</td><td>VLM rubric</td><td>增加 evaluator-owned probes、input replay 与五种开发合同</td></tr>
    <tr><td>GameDevBench</td><td>文本、代码、资产、图像、视频 → patch</td><td>unit tests</td><td>验收完整候选项目，并允许内部架构不同</td></tr>
    <tr><td>GameLogicBench</td><td>文本、源码、资产 → patch</td><td>engine assertions</td><td>从构建扩展到修复和跨引擎移植</td></tr>
    <tr><td>SWE-Game</td><td>按模式提供 brief/GDD/代码/资产/视频 → 游戏或修复</td><td>probes、replay、VLM</td><td>41 个 reference games 派生 247 个统一协议任务</td></tr>
  </tbody>
</table></div>

<p>它的边界也很明确：41 个参考项目都是作者围绕许可明确的公共资产制作和人工试玩的 Godot 游戏，不是从真实商业团队的长期 issue 历史抽样。项目规模中位数为 3,367 行 gameplay GDScript 和 32 个 scenes，尚未覆盖大型游戏的多年维护。</p>

## Q3. 247 道题怎样构造，模型又实际拿到什么？

<p><strong>24 个 2D、17 个 3D 参考游戏各产生四道非修复题，再额外生成 83 个 injected-fault repair cases，合计 (41\times4+83=247)。</strong>参考集合覆盖 13 类玩法，含 168,335 行 gameplay GDScript、1,587 个 scenes、22,140 个 scene-tree nodes 和 138 段 gameplay recordings。</p>

<div class="table-scroll"><table>
  <thead><tr><th>模式</th><th>Agent 可见</th><th>必须交付</th><th>评测重点</th></tr></thead>
  <tbody>
    <tr><td>Brief-to-Game</td><td>短 brief、assets、reference video、公开接口</td><td>自写 GDD、Godot 项目、<code>demos.json</code></td><td>mechanics、content、playability、design、VLM</td></tr>
    <tr><td>GDD-to-Game</td><td>完整 GDD、demonstration obligations、assets、video、接口</td><td>Godot 项目、<code>demos.json</code></td><td>mechanics、content、playability、VLM</td></tr>
    <tr><td>Skeleton Completion</td><td>新建的最小 scaffold、requirements、assets、video、接口</td><td>完成后的 Godot 项目、<code>demos.json</code></td><td>前述三项、scaffold integration、VLM</td></tr>
    <tr><td>Bug Repair</td><td>带注入故障的完整项目、玩家视角 bug report、requirements</td><td>保留无关行为的修复项目</td><td>restoration、retained routes、preservation、validity</td></tr>
    <tr><td>Godot-to-Unity</td><td>Godot 源码、GDD、assets、video、锁定的 Unity workspace 与接口</td><td>原生 Unity 项目、<code>ops.json</code>、<code>BUILD.md</code></td><td>mechanics、playability、structure、visual、stability</td></tr>
  </tbody>
</table></div>

<p>Skeleton Completion 值得单独注意。作者没有从 reference game 删除若干函数，再让 Agent 猜回原实现；他们根据公开义务生成一个 implementation-neutral scaffold，只固定入口、占位 levels/endings、InputMap、<code>gb_levels.json</code> 和 player adapter。Agent 可以重新组织其余代码。这样测的是接入约定下的系统构建，不是复原作者代码。</p>

<div class="case"><h4>真实题目：Beacon Relay 在五种模式下长什么样？</h4><p>Brief-to-Game 只要求做一个可恢复失败、有明确终点的第三人称 3D beacon relay，路线拓扑、移动手感、beacon 规则和 checkpoint 都留给 Agent。GDD-to-Game 则明确要求三关、11 个 cells、三类敌对角色、七类移动装置、每关一个 heart、三格 shield，以及固定 60 Hz 下约 6 至 9 分钟的完整流程。玩家拾取 cell 后，13/12/11 秒 fuse 开始倒计时，颜色从绿变黄再变红；携带 cell 踩中敌人可返还 2.5 秒，侧面接触会掉 shield；把 cell 送入 beacon 才增加 relay progress。</p><p>Skeleton 题只给占位三关、胜负场景、player adapter 和必须暴露的 <code>progress/health/timer</code>。Repair 题给一份会运行但行为错误的完整项目和症状报告。Porting 题给 Godot 源码与锁定版本的 Unity 6000.3.23f1 workspace，要求在 Unity 中原生重写，禁止套壳启动 Godot。</p></div>

### 被测模型和模型端 harness 到底是什么

<p>六个配置是 Qwen3.8 Flash、Grok4.6、GPT-5.6 Luna、Opus5、GLM5.3 Flash 和 Minimax M3；每个都跑全部 247 道题。运行环境是隔离 workspace、私有可写 home、无 active display。Godot 版本为 4.5.1，Unity 为 6000.3.23f1。</p>

<aside class="evidence"><strong>论文没有公开的部分：</strong>六个模型各自使用哪一个 Agent framework、工具 schema、terminal/image/video 操作能力、wall-clock limit、失败重试规则和统一调用预算。正文明确说每个模型搭配自己的 framework 和 tools，因此 Table 3 比较的是六套完整系统，无法单独归因于模型。Brief-to-Game 中 Opus5 平均使用 8.49M input tokens、127.34k output tokens 和 111.37 次 tool calls；GPT-5.6 Luna 分别为 2.56M、34.05k 和 57.15 次，资源差异本身已经很大。</aside>

## Q4. evaluation harness 如何把一次试玩变成分数？

<p><strong>评测链分成语义注册、隐藏注入、两种 replay、状态断言、视觉 rubric 和逐层聚合。</strong>候选提交的 <code>gb_levels.json</code> 声明 levels、endings、numeric slots 与 device IDs，并给场景对象加 <code>gb_player</code>、<code>gb_enemy</code>、<code>gb_hazard</code>、<code>gb_collectible</code> 等 group。评测器先验证这些公开绑定，再在工作副本中装入自己的 driver 和 probe。提交者看不到 checks 与 expected outcomes。</p>

<ol>
  <li><strong>Certified route：</strong>作者在 reference game 上编写并验证输入序列，候选上保留相同动作时序，必要时从语义相对位置开始，沿途检查 milestone 和最终 goal。</li>
  <li><strong>No-input control：</strong>同样启动和等待，但不提供玩家动作。如果它也到达 goal，原 route 记 0，防止开局自动加分、自动过关或假胜利。</li>
  <li><strong>Agent-authored demo：</strong>Agent 在 <code>demos.json</code> 里提交多个独立动作片段。每段从第一关 cold launch，不能注入状态或选隐藏起始场景；重复演示不重复计 coverage。</li>
  <li><strong>Visual judge：</strong>评测器录制候选 gameplay，从 41 份游戏专属 rubric 的 658 个 items 中评分，四组权重是 0.10、0.18、0.27、0.45，并应用 deficiency cap。</li>
</ol>

<div class="case"><h4>Beacon Relay 的一条可执行验收链</h4><ol><li>Agent 看到 GDD、assets、reference video、公开 action 与 semantic-role contract，写出候选项目并把玩家、cell、敌人、beacon 和实时进度绑定到统一接口。</li><li>评测器从 fresh launch 启动自己的 driver。公开 GDD 要求：碰到 pedestal cell 后 world collectible census 减少，fuse 开始倒计时；携带 cell 与 beacon 重叠后 progress 增加且 fuse 停止。</li><li>probe 读取碰撞、对象生命周期与 <code>progress</code>/<code>timer</code> 的变化。hidden route 的具体按键时长、起点参数与断言代码尚未公开。</li><li>同长度 no-input control 不得产生同样的 pickup 或 deposit 结果。若候选只按时间自动增加 progress，即使最后显示胜利，也不给这条行为 credit。</li></ol><p class="source-note">最后一条 FAIL 是本文根据论文公开规则整理的解释性轨迹。论文没有发布对应的模型原始 log，也没有公开 task-specific checker 文件。</p></div>

<div class="formula">Construction: <code>S = 0.85O + 0.15V</code><br>Repair case: <code>S = 100 × restoration × retained routes × preservation × validity</code></div>

<p>三类 construction 先按 mode-specific 权重合并 objective components，再加 15% VLM。Bug Repair 在每个 case 内把四个因子相乘，任何一项接近 0 都会压低整题，最后对 83 cases 取算术平均。Porting 则按 mechanics 35%、playability 25%、structure 15%、visual 15%、stability 10% 加权；其余模式各对 41 道题取平均。</p>

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

<p>比起总榜，component gap 更有解释力。Skeleton Completion 的候选普遍能守住 scaffold 约定，Opus5 得 94.62，却只拿到 36.93 Content 和 36.22 Mechanics。Porting 也类似：GPT-5.6 Luna 的 Structure 是 82.87，Playability 51.44，Visual 31.60。项目结构合格并不代表玩法与呈现已经迁移完成。</p>

### 这套自动评测自身准不准

<p>作者从三类 construction 的 100 个 Agent 项目中抽取 1,200 条人工标注 assertions，每个游戏九条 Mechanics、三条 Content。可执行检查正确接受 411/452 条真人判为正确的行为，并抓到 705/748 条缺陷；两率为 90.93% 和 94.25%，算术平均正好是 92.59% balanced accuracy。视频 VLM 的对应值约为 78.41%，差距主要来自 defect detection：75.40% 对 94.25%。</p>

<p>视觉侧在 200 个 clips 上与人工评分的 Spearman (\rho=0.829)，MAE 为 0.103，重复判断的 within-clip SD 为 0.034。论文没有披露人工 annotator 数量、agreement，也没有命名 visual judge 所用的具体 VLM；因此这些数字支持“runtime evidence 比视频判断更适合验功能”，还不足以证明 checker 在所有游戏机制上都同样可靠。</p>

## Q5. 这些结果对下一代游戏 Coding Agent 有什么启发？

<p><strong>下一代系统最需要补上 obligation tracking 与因果 playtesting；“项目已启动”不能继续充当完成信号。</strong>人工复核中，GPT-5.6 Luna 的已分类问题有 56.4% 是 requirement omission，Opus5 为 36.9%；GLM5.3 Flash 最大类别则是 gameplay logic error，占 52.2%。前一类需要把 GDD 每条义务映射到实现和 demo，后一类需要真的触发机制并检查状态变化。</p>

<p>reference video 的 ablation 也说明视频主要帮助呈现。Brief-to-Game 中，加入视频让 GPT-5.6 Luna 的 VLM total 提高 5.60，Opus5 提高 2.23；两者的 Visual Presentation 分别提高 6.48 和 9.00。Content Composition 反而分别下降 6.01 和 9.93。Agent 看见目标画面后更会模仿外观，却不会自然补齐所有内容与机制。</p>

<p>一个可信的后续实验应把模型和 framework 拆开：同一模型跑统一 harness，同一 harness 再换模型；固定 wall-clock、token、tool-call 与视频读取能力；每题重复运行并报告方差。评测器也应公开 task packages、route authoring、probe code 和 human-label protocol，让外部研究者能检查 hidden test 是否过度依赖接口声明，或漏掉非预期但正确的实现。</p>

## Q6. 最后怎样评价 SWE-Game？

<p><strong>这篇把“我们想要的游戏”拆成可执行的玩家动作、可观察状态和独立视觉证据。</strong>VLM 负责 presentation，玩法正确性则交给 engine-state checks、reference replay 与 no-input control。这个分工比单一“像不像、能不能玩”的总评更容易定位问题。</p>

<div class="limit-grid"><div><b>任务规模</b><span>41 个中小型 Godot reference games，尚未覆盖大型项目和长期协作。</span></div><div><b>配置混杂</b><span>六个模型各配自己的 Agent framework 和 tools，缺少同 harness 对照。</span></div><div><b>复现缺口</b><span>截至 2026-10-08，论文未链接公开 benchmark、checker 或完整结果仓库。</span></div><div><b>统计边界</b><span>主榜未报告重复运行和方差；人工标注者数量与 agreement 未披露。</span></div></div>

<p>当前最强配置已经很会搭出可运行、可演示、结构合格的游戏项目，但三类 construction 任务仍没有一个总分达到 60。指定 mechanics 与 content 没有完整接通，是主要失分来源。SWE-Game 给出了一套可信的评测方向，也留下了足以影响排名解释的公开性与实验控制问题。</p>

<p class="source-note">证据范围：本文依据 arXiv:2609.33678v3 的 28 页正文、附录、全部 Figure 1–6 与 Table 1–9，以及 arXiv v1 日期元数据。2026-10-08 检查论文页面和公开搜索时，没有找到作者链接的正式 benchmark/checker repository；一个同名的公开 task catalogue 属于另一套任务，未作为本文证据。</p>

</div>

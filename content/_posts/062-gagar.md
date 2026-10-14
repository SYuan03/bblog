---
title: "[2026-09-26] Groupwise Agentic Grading and Advantage Redistribution for Code Agent RL"
permalink: "/posts/论文解读/gagar.html"
date: "2026-10-06T09:30:00+08:00"
updated: "2026-10-14T08:00:00+08:00"
cover: "/lib/papers/gagar/cover.svg"
description: "GAGAR 如何比较多次通过测试的代码修改质量，再重新分配训练权重；拆解判分 Agent、计算公式、训练结果、带上限的实现与未公开证据。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "Code Agent"
  - "Reinforcement Learning"
  - "Credit Assignment"
  - "Agentic Judge"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Xiaomi MiMo · arXiv:2609.32577v1 · 最早公开于 2026-09-26</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.32577">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.32577">论文 PDF</a>
</div>

<section class="deck-wrap" aria-label="GAGAR 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 判分方法、训练权重、实验结果与证据边界</strong><a href="/lib/decks/gagar-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/gagar-visual-guide.html" title="GAGAR 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可点左下角返回文章</span></p>
  </div>
</section>

<p class="lead">GAGAR 处理的是代码 Agent 强化学习里的一个具体问题。这里的代码 Agent 是能读取代码仓库、修改文件并运行工具的模型系统。同一道任务让它尝试 16 次，其中若有多次都通过测试，普通的 0/1 奖励会给这些成功尝试完全相同的训练权重。论文增加一个能主动检查代码的判分 Agent，让它同时查看代码仓库、完整执行过程、最终代码改动与测试输出，再把一部分训练权重从质量较差的成功实现转给更好的实现。</p>

<aside class="part0">
<span class="kicker">PART 0 · 阅读准备</span>

### 一次完整尝试、尝试组与训练权重是什么？

对一道编程任务，待训练模型会生成多条完整执行记录。每条记录从读取代码仓库开始，包含搜索、编辑、运行测试以及最终的代码改动。论文把一次完整执行称为 **trajectory（轨迹）**，也称一次 **rollout（完整尝试）**；同一道任务的 16 次尝试构成一个 **rollout group（尝试组）**。模型当前用于生成这些尝试的版本叫 **policy（策略模型）**，最终文件差异叫 **patch（代码补丁）**。GRPO 是一种按同组样本的相对得分更新模型的强化学习方法。

测试通过记作 `R=1`，失败记作 `R=0`。这就是 **binary reward（二元奖励）**。GAGAR 沿用 Dr. GRPO 的 **mean-centered advantage**：每条奖励减去同组平均值后的训练权重。不再除以奖励标准差，这点与常见的标准化 GRPO 写法不同：

<div class="formula">Aᵢ = Rᵢ - R̄</div>

假设一组 16 次尝试里有 4 次通过，`R̄=0.25`。四条成功轨迹的 advantage 都是 `0.75`，其余都是 `-0.25`。因此基础算法知道哪些结果成功，却不知道四份成功代码中哪份更精准、哪份带有多余改动。</aside>

<div class="interest"><b>博客作者兴趣度 8.5 / 10</b><span>评分只表示博客作者本人兴趣程度；主题与代码 Agent、强化学习运行框架和自动判分直接相关</span></div>

<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>16</strong><span>每道任务生成 16 次完整尝试</span></div>
  <div class="metric"><strong>62.2%</strong><span>DeepSWE 第 28 步的三次采样平均通过率</span></div>
  <div class="metric"><strong>-15.6%</strong><span>第 28 步平均交互轮数</span></div>
  <div class="metric"><strong>30 个任务</strong><span>独立质量审计样本量</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>GAGAR 不替代可执行测试。</strong>测试先判断成功或失败，判分 Agent 只比较已经通过测试的候选实现。</li>
    <li><strong>方法会重新分配成功样本的正训练权重。</strong>质量较差的成功样本让出一部分权重，再按质量比例分给其他成功样本。</li>
    <li><strong>最可比的结果来自两种方法都完成的第 28 个训练步骤。</strong>DeepSWE 的 <code>avg@3</code> 为 62.2% 对 50.2%，同时交互轮数和总 token 数（模型处理的文本单位）更少。</li>
    <li><strong>公开证据还不足以独立复核判分过程。</strong>论文没有发布判分提示词、训练任务、真实评分记录或实现代码。</li>
  </ul>
</aside>


<h2 id="动机：通过同一套测试的代码，质量仍可能不同">1. Motivation：通过同一套测试的代码，质量仍可能不同</h2>

**测试能验证结果，却不会自动评价实现质量。**

同一套测试可能同时接受两份代码：一份修复了根本原因，只改必要文件；另一份增加特殊分支、修改无关模块，甚至只对已知测试生效。它们的二元奖励都是 1。训练继续强化这两条轨迹时，策略模型得不到“应该更像第一份实现”的信号。

GAGAR 要求 **grader（判分 Agent）** 比较同一任务中已经通过测试的候选实现。这样的比较比逐份独立打分多了一层上下文：判分 Agent 能看到不同 Agent 如何理解同一个缺陷，哪些改动是必要的，哪些只是掩盖症状。失败轨迹也会放进同一个工作区，帮助它识别已经试过但无效的路线，不过失败样本不参加质量排序。

<figure class="figure wide">
  <a href="/lib/papers/gagar/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/gagar/body-method.svg" width="1000" height="900" alt="GAGAR 从同题尝试组、判分 Agent 到训练权重重新分配的流程"></a>
  <figcaption>根据论文图 1 与第 3.1-3.3 节重绘。图中最后一项特意标出：实现中的 λ 上限触发时，正文给出的精确守恒性质不再全部成立。</figcaption>
</figure>

<h2 id="相邻工作：从单个评分到成功实现之间的比较">2. Related Work：从单个评分到成功实现之间的比较</h2>

**GAGAR 保留测试作为正确性门槛，再让一个能读取并运行代码仓库的判分 Agent 比较多条完整轨迹。**

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>输入</th><th>输出信号</th><th>与 GAGAR 的区别</th></tr></thead>
  <tbody>
    <tr><td>二元结果奖励 / GRPO</td><td>最终测试结果</td><td>通过 / 失败</td><td>同一尝试组内的所有成功轨迹得到相同 advantage。</td></tr>
    <tr><td>过程奖励 / 逐步归因</td><td>中间步骤或已经对齐的中间状态</td><td>每一步或每个 token 的训练权重</td><td>代码 Agent 的轨迹很长，各次尝试又会把仓库改成不同状态，很难逐步对齐。</td></tr>
    <tr><td>大语言模型（LLM）静态判分</td><td>提示词、回答或代码改动摘要</td><td>分数或偏好</td><td>GAGAR 的判分 Agent 可以继续读取代码和测试日志，还能运行有针对性的检查。</td></tr>
    <tr><td>ReCode</td><td>逐个候选的推理过程，先通过测试</td><td>候选级过程奖励</td><td>不共同调查同一题的完整代码与执行记录。</td></tr><tr><td>PAPO</td><td>通过测试子集中的评分项</td><td>加法式、子集零和的 advantage 修正</td><td>GAGAR 用质量系数乘权重并重缩放；无上限公式保留成功权重总量，带上限实现有例外。</td></tr><tr><td>Groupwise Ranking Reward</td><td>已被 verifier 判对的多模态推理</td><td>单次文字判分后的组内排名</td><td>GAGAR 的 grader 可以调查仓库、查日志和运行检查，不止读一段文字。</td></tr><tr><td>让 Agent 担任判分者（Agent-as-a-Judge）</td><td>任务环境与候选产物</td><td>由 Agent 主动调查后给出评价</td><td>GAGAR 把相似思想用于在线强化学习，再把排序转成 advantage 的重新分配。</td></tr>
  </tbody>
</table>
</div>

论文的贡献主要在 **credit assignment（训练权重如何归给不同样本）**，没有发明新的代码评测基准（benchmark），也没有用判分 Agent 取代可执行测试。评测仍使用 DeepSWE v1.1 与 SWE-bench Pro。

<h2 id="方法：质量排序如何改变一组轨迹的训练权重">3. Method：质量排序如何改变一组轨迹的训练权重</h2>

**测试仍决定正确性，grader 只决定成功实现之间的质量偏好。** 当前 policy 为一道题生成 16 条完整轨迹；这组轨迹全部完成后，才启动该组的质量检查。其他任务组可以同时继续生成，不需要全批次都等待。

<ol class="steps">
  <li><b>1 · 验证</b><span>先运行任务测试。基础设施故障使轨迹无效；确认依赖泄漏或外部答案的实现，奖励改为 0。只针对测试的特殊处理另归质量最差档。</span></li>
  <li><b>2 · 判分</b><span>判分 Agent 读取任务、仓库、执行轨迹、代码改动与测试输出，只排序有效且通过测试的候选实现。</span></li>
  <li><b>3 · 映射</b><span>T1 的质量系数为 1.0 或 0.9；T2 从 0.85 降至 0.4；T3 为 0.2。</span></li>
  <li><b>4 · 重缩放</b><span>成功样本的正 advantage 先乘质量系数，再乘 λ。无上限公式恢复原正权重总量；上限分支见下文。</span></li>
  <li><b>5 · 训练</b><span>每条轨迹得到一个序列级 advantage，该权重应用到这条轨迹中由模型生成的全部 token。</span></li>
</ol>

线上 grader 是固定的、强化学习前 SFT 的 MiMo-V2.6-Pro，两种被训练模型都使用它。它不是正在更新的 policy，也不与 policy 一起继续训练。初始 Claude Opus 5 grader 每组约需 2,000 秒，换成 Pro 约 600 秒；这些是作者的计时，不是 600 秒内完成整批训练。

检查工作区包含任务、仓库、所有轨迹、补丁与测试结果。grader 先读各步摘要，再定位有关代码或日志，必要时执行针对性检查。失败尝试只提供上下文，不参加质量排序。有 reference patch 时，它只能帮助理解任务，代码相似度不是评分项，也不会作为训练轨迹获得权重。

不能评的基础设施失败先剔除，再计算组内统计；确认使用泄漏或外部答案的候选，其奖励改为 0，并按失败重新计算。排序缺失或无法解析时，保留原学习信号，不以坏评分强行更新。动态采样只保留同时有成功和失败的组。

判分 Agent 使用五项 1-5 分标准：方案是否合理（Approach Suitability）、实现是否准确（Implementation Precision）、改动是否精简（Minimality of Changes）、是否引入副作用（Unintended Side Effects），以及是否符合现有代码风格（Codebase Consistency）。初始加权分数为：

<div class="formula">Wᵢ = 0.30s_app + 0.25s_prec + 0.20s_min + 0.15s_side + 0.10s_style</div>

档位按附录 A.1 的固定规则产生。先判 T3：确认有未经要求的重写、只针对测试的特殊处理、方案合理性得 1 分，或改动精简与避免副作用两项都不超过 2 分。剩余候选若每项至少 4 分，且没有严重过程问题或未解决回归，就进 T1；其他进 T2。

W 只给初始顺序，不是用一个总分阈值直接切档。grader 可以凭任务证据修正档内排序，无法区分就并列。T1 排名第一的并列组都取质量系数 1，其余组取 0.9；T2 按并列组排名从 0.85 线性降至 0.4，只有一组时为 0.85；T3 统一为 0.2。系数按并列组序号计算，不按前面已有多少候选计算。负面判断必须指向代码位置、轨迹事件或执行结果。

<figure class="figure wide"><a href="/lib/papers/gagar/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/gagar/body-case.svg" width="1000" height="900" alt="GAGAR 用四次尝试演示质量系数和 λ 上限怎样改变 advantage"></a><figcaption>本文根据论文公式写出的解释性例子，不是公开训练日志。质量系数先作用于成功权重，再重缩放；未经重新居中的单纯降权，会改变正负权重平衡。</figcaption></figure>

<h3 id="一个明确标注的公式构造例子">3.1 一个明确标注的公式构造例子</h3>

<div class="case">
<h4>这个例子只解释公式，不是论文公开的真实训练样本</h4>
<ol>
  <li>四次尝试中两次通过、两次失败，因此 <code>R̄=0.5</code>。两个成功样本的初始 advantage 都是 <code>+0.5</code>。</li>
  <li>假设判分 Agent 把第一份代码归为 T1，质量系数为 <code>1.0</code>；第二份归为 T3，质量系数为 <code>0.2</code>。</li>
  <li>简单降权后，正 advantage 总量从 <code>1.0</code> 变成 <code>0.6</code>。GAGAR 计算 <code>λ=1/0.6≈1.667</code>。</li>
  <li>两个成功样本的新 advantage 分别为 <code>0.833</code> 与 <code>0.167</code>，总和仍为 <code>1.0</code>；两个失败样本仍为 <code>-0.5</code>。</li>
</ol>
</div>

论文没有发布真实任务、候选代码改动、判分过程或最终档位，所以无法从公开材料复原一个真实的 GAGAR 判分案例。这里保留这个证据缺口，不用合理猜测补齐未公开内容。

把上面的计算写成一般形式：先记成功样本原来的正权重总和为 <code>S+ = Σ Aᵢ</code>，再用降权后的总和求比例：

<div class="formula">λ = S+ / Σ(fᵢ Aᵢ)　　成功样本 Aᵢ* = λ fᵢ Aᵢ　　失败样本 Aᵢ* = Aᵢ</div>

两个求和都只包含成功样本。统一乘 λ 保留它们之间的质量比例，再恢复正权重总量。这里守恒的是<strong>序列级 advantage 的和</strong>；训练损失还按模型生成的 token 取平均，不同轨迹长度不同，不能由序列零和直接断言每个 token 的正负梯度总量也精确平衡。

<h3 id="正文公式和带上限实现的差别">3.2 正文公式和带上限实现的差别</h3>

正文公式 2 的重缩放系数可以精确保持正 advantage 总量。附录 A.2 说明训练实现还会使用 `λ_max=1.5`：

<div class="formula">λ_bnd = min(λ, 1.5)</div>

上面的构造例需要 <code>λ≈1.667</code>，所以触发上限。乘 1.5 后四个权重是 <code>[0.75,0.15,−0.5,−0.5]</code>，平均 <code>−0.025</code>；减去平均后，实际训练权重为：

<div class="formula">A_train = [0.775, 0.175, −0.475, −0.475]</div>

组内仍为零和，成功排序仍保留，但正权重总和从 1.0 变成 0.95，失败权重也不再是 −0.5。<strong>精确守恒只属于正文的无上限公式。</strong> 附录允许另行加入长度奖励处理；此时原始优势可能不相等，还会先取成功权重的正部分。公开材料是论文报告的实现，没有仓库代码可独立核验。

还有一个重要边界：直接把成功 reward 设成质量系数，然后减去新的组均值，也会产生零和 advantage，只是不保留原失败权重和成功比例。论文的“不重分配”消融没有做这一步重新居中；不能据此证明所有 reward shaping 都不稳定。若组内只有一份成功实现，或所有成功系数相同，无上限 GAGAR 退回原二元优势。

<h2 id="实验：通过率、执行长度与质量审计">4. Experiments：通过率、执行长度与质量审计</h2>

**最可靠的结论来自 MiMo-V2.6-Flash 上只训练代码任务的受控对照，不是最终混合任务模型与外部模型的横向比较。**

主要对照从同一个强化学习前的监督微调（SFT）模型存档出发。每个训练批次包含 128 道任务，每题生成 16 次完整尝试。评测使用 DeepSWE v1.1 与 SWE-bench Pro，每题独立生成 3 次；`avg@3` 指这三次结果的平均通过率。只用二元奖励的基线在第 28 步因性能快速下降而停止，因此公平的共同训练区间只到第 28 步。

<figure class="figure wide">
  <a href="/lib/papers/gagar/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/gagar/body-results.svg" width="1000" height="785" alt="GAGAR 在 DeepSWE step 28 的结果与 30 task 质量审计"></a>
  <figcaption>根据论文图 2-3 重绘。62.2 与 50.2 是图表显示值，直接相减为 12.0 个百分点；论文正文写 12.1 个百分点，可能使用未四舍五入的内部数值。</figcaption>
</figure>

<div class="table-scroll">
<table>
  <thead><tr><th>DeepSWE v1.1 · 第 28 步</th><th>二元奖励基线</th><th>GAGAR</th><th>差值</th></tr></thead>
  <tbody>
    <tr><td>三次采样平均通过率 <code>avg@3</code></td><td>50.2%</td><td>62.2%</td><td>图中相差 12.0 个百分点</td></tr>
    <tr><td>主 Agent 平均交互轮数</td><td>132.3</td><td>111.6</td><td>-15.6%</td></tr>
    <tr><td>平均总 token 数</td><td>191.9k</td><td>172.9k</td><td>-9.9%</td></tr>
  </tbody>
</table>
</div>

只降低差样本权重、不重新分配的消融实验在第 28 步得到 56.2%，低于完整方法的 62.2%；平均交互轮数为 143.5 对 111.6，总 token 数为 236.0k 对 172.9k。这个对照支持该次训练中“不要直接丢掉正权重”的设计，但没有比较所有会重新居中的奖励变换，也没有多随机种子。

另一个结果是对 30 个随机 DeepSWE 任务进行质量审计。这次审计改用 Claude Opus 5，区别于线上固定 Pro grader。每个任务各放入两种方法最多三次尝试，包括失败；候选匿名并随机排序。它共同查看执行轨迹、代码改动与测试结果。在两组都训练到的最后一个模型存档上，GAGAR 按评分表加权后的质量分为 4.03，对照为 3.70；平均胜率 69.8% 只计算通过测试的候选，并列拆分后组内排名第一的比例为 65.0%。不能把胜率的成功子集分母套到整个审计上。样本量较小，而且判分者仍是大语言模型（LLM），不能把它等同于真实工程师的代码审查。

另外，混合任务训练的最终 Flash 在 DeepSWE / SWE-Pro 得到 67.9 / 60.9，Pro 为 71.9 / 62.7。但它们与外部前沿模型或代码专用对照不是同预算、同训练数据实验，不能把这些最终差距都算作 GAGAR 的贡献。二元基线的最高 58.5 出现在第 20 步，后面降到第 28 步停止；后续 GAGAR 第 44/52 步的成绩也不应与停止的基线当成共同训练步比较。

<h2 id="下一步：判分稳定性与真实开发成本">5. Discussion：判分稳定性与真实开发成本</h2>

**下一步应该让判分 Agent 本身可以被重复评测，并把质量收益连接到真实开发成本。**

第一项需要公开匿名化的“任务、仓库快照、执行轨迹、代码改动、测试和评分”数据包。这样才能检验不同判分模型、提示词和生成温度是否产生稳定排序，也能让人类审查者测量彼此的一致程度。

第二项需要单独做 `λ_max` 的消融实验。当前论文把精确保持正权重总量的方法和带上限的实现分别写在正文、附录，却没有报告上限触发频率。这个频率决定训练过程中有多少尝试组真正满足正文的守恒性质。

第三项是把“质量”落到开发者成本。比如让审查者在不知道模型来源的情况下记录发现问题所需时间、要求修改的次数，以及代码能否直接合并。这样的指标比另一个大语言模型给出的 1-5 分更接近论文声称的可维护性。

<h2 id="总结：保留测试门槛，但别扩大守恒与质量结论">6. Conclusion：保留测试门槛，但别扩大守恒与质量结论</h2>

**方法抓住了代码 Agent 强化学习中真实存在的盲点，受控实验也给出一致信号；公开证据尚不足以判断判分 Agent 能否可靠识别好代码。**

<div class="limit-grid">
  <div><b>论文已经支持</b><span>从同一个 MiMo-V2.6-Flash 监督微调（SFT）模型存档出发并比较相同训练步数时，GAGAR 的 DeepSWE 通过率更高，执行轨迹更短；未经重居中的只降权消融也明显更不稳定，但未排除其他奖励变换。</span></div>
  <div><b>论文没有支持</b><span>没有多随机种子、置信区间或人工代码审查研究，也没有公开判分提示词、训练任务、真实案例或实现。</span></div>
  <div><b>不要误读</b><span>第 44/52 步的继续训练结果只能说明 GAGAR 还能继续优化，不能与第 28 步停止的基线当成同预算比较。</span></div>
  <div><b>可复用的设计</b><span>保留可执行测试作为正确性门槛，在成功样本内部增加质量偏好，并避免未经重新居中的简单降权丢掉正信号；带上限分支的原正权重总量仍可能改变。</span></div>
</div>

如果研究目标是 Claude Code、Codex 一类完整的软件 Agent 运行框架（harness），这篇值得读。它提供了一种把“能读取整个代码仓库的审查”接进强化学习的方法。复现门槛目前很高；接下来的研究需要公开判分 Agent 的输入和判据，并测量排序稳定性以及它与人工代码审查的一致程度。

<p class="source-note">主要来源：论文 v1 第 1-5 节、附录 A、图 1-4、表 1-2。公开材料检查日期：2026-10-06。未发现官方代码仓库、判分提示词、训练任务或逐组评分记录。</p>

</div>

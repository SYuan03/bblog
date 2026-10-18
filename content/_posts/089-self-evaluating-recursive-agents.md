---
title: "[2026-10-04] Self-Evaluating Recursive Agents"
permalink: "/posts/论文解读/self-evaluating-recursive-agents.html"
date: "2026-10-09T13:20:00+08:00"
updated: "2026-10-19T03:24:26+08:00"
cover: "/lib/papers/sera/cover.svg"
description: "Agent 拆出的子任务没有现成答案，怎样训练它评价这些任务？SERA 让同一模型写评分条件、执行与评分。本文用公开两菜任务的实际程序重放，讲清三种训练奖励、最终验收和关键负结果。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 16
categories:
  - "论文解读"
tags:
  - "Recursive Agent"
  - "Reinforcement Learning"
  - "Self-Evaluation"
  - "Rubric"
  - "Multi-Agent"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>
body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram img{width:100%}
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a>img{width:780px;max-width:none;height:auto}}
</style>

<div class="paper-reading">

<p class="paper-meta">Tianyi Lyu, Xiaozhe Li, Yang Li, et al. · arXiv:2610.04902v1 · 最早公开于 2026-10-04</p>
<div class="source-links"><a href="https://arxiv.org/abs/2610.04902v1">论文主页</a><a href="https://arxiv.org/pdf/2610.04902v1">论文 PDF</a><a href="https://github.com/OliverLeeXZ/SERA/tree/0443b190ccde59486904988e50893102df4563ab">固定版本代码</a><a href="https://huggingface.co/Litux12138/SERA/tree/a5e3c1e141efd1cdf0988debec42ca315d5c752b">公开模型</a></div>

<section class="deck-wrap" aria-label="SERA 交互图解">
  <div class="deck-head"><strong>16 页交互图解 · 一次训练、真实任务与程序验收</strong><a href="/lib/decks/sera-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/sera-visual-guide.html" title="SERA 论文图解，共 16 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机可滚动页内内容与宽图；Esc 退出全屏</span></p></div>
</section>

<p class="lead">SERA 研究一个具体问题：Agent 把大任务拆成临时子任务后，能否学会评价这些子任务，并用评价把任务做得更好？作者训练同一个 Qwen3-4B 模型执行任务、写评分条件和评分。在多菜文字环境 TextWorld 中，训练评分条件只有配合自评分执行奖励，才带来明显改善。</p>

<aside class="part0"><span class="kicker">PART 0 · 递归执行是什么</span><h3>一棵任务树，使用同一个模型</h3><p>根 Agent 接到“准备并吃掉两道菜”，可以把第二道菜委派给子 Agent；子 Agent 又可以委派收集某些食材。父子关系形成任务树，不再创建子任务的节点叫叶节点。各节点使用相同模型参数，论文称这个模型为 policy；每个节点仍有独立的模型调用和执行记录。</p><p>负责评价的调用先写一组带权重的子任务评分条件，叫 rubric，再在任务结束后按条件评分。它与执行者是同一模型的不同调用，不是额外训练的三套模型。本文保留这些英文名称，具体输入、奖励和参数更新在第 3 节逐步说明。</p></aside>

<aside class="keypoints"><ul><li>同一 Qwen3-4B，TextWorld 最终成功率从递归训练基线 RAO 的 51.93% 到 SERA 的 <strong>65.07%</strong>；3 个种子的均值，测试 1,400 题。</li><li>保留外部二元执行奖励、只加评价训练，反而降到 <strong>45.62%</strong>。训练评分器本身不能解释增益。</li><li>主表每题运行一棵递归树，不另生成 rubric 或选择候选；两候选选择属于额外实验。两个环境都不是 Claude Code 或 Codex。</li></ul></aside>

<h2 id="研究问题：递归任务缺少子目标验收标准">1. Motivation：根目标好验收，临时子目标难打分</h2>

<p><strong>最终成败通常有程序判据，模型临时提出的子任务却未必有。</strong>“两道菜都做好并吃掉”可以检查食材、菜品状态；“查看储藏室，把父任务需要的东西带回来”要结合当时的目标、库存和预算判断。只给整题一个 0/1，很难告诉中间的执行者哪里做得不够好。</p>

<p>最接近的前作 RAO（Recursive Agent Optimization）也训练递归 Agent，但给每个节点外部二元成败奖励：能程序验收就用程序，不能就调用模型评审。SERA 想让模型学习一份可重复使用的评价能力，减少后续外部评审。评价仍要靠真实成败训练；没有取消外部监督。</p>

<h2 id="与-RAO-和已有-rubric-训练的区别">2. Related Work：把评价训练接到递归执行奖励上</h2>

<p><strong>区别在于评价什么、谁来评价，以及评价怎样影响训练。</strong>常见的推理时任务拆分解决“怎样分工”；RAO 进一步训练执行；学习 rubric 的工作则研究“怎样写出有效的评分条件”。SERA 把后两件事放到临时生成、结构会变化的任务树中。</p>

<div class="table-scroll comparison-table"><table><thead><tr><th>路线</th><th>中间任务与评价</th><th>SERA 的边界</th></tr></thead><tbody><tr><td>ADaPT / THREAD / RLM</td><td>按需要拆分或递归调用，主要研究推理时计算</td><td>本文还训练拆分后的执行，不只设计调用方式</td></tr><tr><td>RAO</td><td>递归训练；节点由外部程序或模型给二元标签</td><td>子节点改用自评分，并训练评分条件生成；根保留程序验收</td></tr><tr><td>RubricEM / ARCO 等</td><td>学习 rubric，常有独立评价模型或固定阶段</td><td>本文对临时子目标写条件，执行、生成与评分共享参数</td></tr><tr><td>SERA</td><td>当前模型写条件、评价执行；用同起点候选的真实成败训练条件</td><td>结论只验证于 4B 模型和两个合成文字环境</td></tr></tbody></table></div>

<p class="source-note">比较依据原论文 §2；这些前作没有全部作为实验基线。实际基线是单 Agent 提示 / GRPO / CISPO，以及递归 RAO 和组件消融。任务、预算与成绩不能跨表直接混比。</p>

<h2 id="方法：执行、委派和评分标准的交替训练">3. Method：一次委派，三种交替更新</h2>

<p><strong>先按自己的条件奖励执行，再用真实成败训练这些条件；委派质量另外训练。</strong>论文把三阶段分别记为 E（执行）、D（委派）、RT（rubric 生成训练）。它们轮流更新同一组参数，<strong>E:D:RT=16:2:2 是优化步数调度</strong>，不是把三种奖励按比例相加。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sera/training-and-evaluation.svg" target="_blank" rel="noopener"><img src="/lib/papers/sera/training-and-evaluation.svg" width="900" height="356" alt="父任务委派给子Agent，rubric由委派前信息生成，独立评分调用读取执行结果；三阶段更新不同输出"></a><figcaption>独立整理原 Figure 1、§3 与 Table 6 的信息关系。<a href="https://arxiv.org/pdf/2610.04902v1#page=3">原 Figure 1</a> 还画出了训练文字的掩码。生成条件与运行子 Agent 可以并发，图中箭头表示信息来自哪里，不是必须串行的时间表。</figcaption></figure>

<h3 id="执行阶段：固定评分标准，评估子任务结果">3.1 E：执行者不读 rubric，结果由另一次调用评分</h3>

<p>以公开两菜任务中的子目标“准备并吃掉 dish_2”为例。父 Agent 发起委派，训练程序保存委派前的父任务、已有交互记录、委派动作、子目标、可观察初态、工具与预算。生成器仅根据这些信息写 rubric，<strong>不看子任务之后的轨迹和结果</strong>；条件生成后不再改动。异步代码允许它与子 Agent 同时运行。</p>

<p>子 Agent 接收目标、执行上下文、观察和工具，<strong>不接收 rubric</strong>。子任务完成后，训练程序另调用同一模型，输入固定 rubric、子任务轨迹和最终状态，输出完成标记 g 与各项得分。论文定义：</p>

<div class="formula"><code>s = g × Σ w_j c_j；g ∈ {0,1}，Σ w_j = 1，c_j ∈ [0,1]</code></div>

<p>g 表示目标是否完成；w_j 是条件权重，c_j 是该项得分。假设四项权重为 .4/.3/.2/.1，得分为 1/.5/1/1 且 g=1，总分是 .85；若漏吃第二道菜导致 g=0，按规定总分归零。这些权重是本文算例，不是论文记录。E 给根节点程序成败 R，给非根节点自评分 s，训练求解、委派和返回输出；写 rubric 与评分输出不直接进入 E 的损失。</p>

<p><strong>论文评分公式与代码检查强度不同。</strong><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/rubric/scoring.py#L33-L45">公开解析器</a>直接接收模型报出的 <code>final_score</code>，检查分数范围，以及明确的 <code>success=false</code> 是否配零分；它不重新计算各项加权和。本文实际测试：只返回 <code>{"final_score":0.9}</code> 也能通过解析。训练自评分因此是模型判断，不能当成程序逐项验证。</p>

<h3 id="评分标准训练：复制-8-条同起点分支，检验排序">3.2 RT：同一子目标，多种结果，检验评分顺序</h3>

<p>RT 在一个委派点复制环境，采样 B=8 条同起点、同子目标的候选子树。TextCraft 用程序检查候选成败；TextWorld 的任意子目标没有统一程序判据，改用外部 Kimi 给二元标签。同一份 rubric 评价全部候选，生成器仍看不到候选结果。<strong>固定代码总是提交第 0 条候选给父节点</strong>，其余 7 条仅供训练，不是挑最高分继续执行。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sera/ranking-worked.svg" target="_blank" rel="noopener"><img src="/lib/papers/sera/ranking-worked.svg" width="900" height="290" alt="成功分数点8和点4，失败分数点3和点7，四个配对的平均损失点175"></a><figcaption>按 §3.4 Eq. 3 独立整理的四候选算例，实际训练是八候选。外部标签与模型分数可能不一致；失败候选得 .7 正是在说明自评会出错。</figcaption></figure>

<p>对所有“真实成功 i、真实失败 j”的配对，计算 <code>max(0, 0.2-s_i+s_j)</code> 再平均。成功分数高于失败至少 .2，配对损失才为零。图中四项为 0/.1/.1/.5，平均 .175，rubric 生成动作的奖励是 −.175。训练只更新<strong>写这份 rubric 的输出文字</strong>，不把评分器或候选执行输出当成 RT 优化样本。全成功、全失败的组跳过；代码先剔除解析无效的分数，再检查有效候选是否含两种标签。</p>

<h3 id="委派阶段：按成功树中的叶节点覆盖率分配奖励">3.3 D 与优化：拆出的工作量如何变成奖励</h3>

<p>D 给委派动作的奖励为 <code>R × 该委派子树的叶节点数 / 全树叶节点数</code>。全树三个末端节点，某委派覆盖两个且根成功，就得 2/3；根失败，全部委派奖励归零。完整 SERA 不再按子任务成败筛选这些节点。父 Agent 后来补救成功，早先失败子任务也可能得到结构奖励；叶节点占比只是工作量近似。</p>

<p>原始奖励还要减去其他样本均值，称为 LOO（leave-one-out）基线。E 的每个节点减去同题其他根树的 R 均值：子分 .85、其余树平均 .5，优势是 .35，即使本树最终失败也可以为正。D 先平均各树的委派奖励，再跨树比较；RT 在 batch 的有效委派组间比较。CISPO 用当前与采样时输出概率的比值加权并截断，更新被选中文字；另按每层的输出 token 数倒数加权，避免某层因文字更多而占据损失。</p>

<details><summary>优化公式、调度、预算与代码差异</summary>
<p>token 是模型处理的文字单位。共享目标是 <code>ℓ_t = -sg[clip(πθ(a_t|h_t)/πold(a_t|h_t), cmin,cmax)] × A_t × log πθ(a_t|h_t)</code>；sg 表示这部分权重不回传梯度。深度权重 <code>ω_t ∝ 1/N_depth(t)</code> 后，按 <code>Σω_tℓ_t/Σω_t</code> 归约。它是策略梯度，不是两模型间的 KL 蒸馏；同一组参数之后仍会因其他阶段改变，不能因此排除奖励漏洞。</p>
<p>每次优化用 8 根题，每题 K=8 棵独立树；这与 RT 单个委派点 B=8 不同。TextCraft 250 步、TextWorld 400 步；16 张 H200，全参数 Adam，lr=3e-6，温度 1。递归消融保持总步数，但阶段占比不同：RAO 1:0:0、RAO+D 12:4:0、RAO+RT 16:0:2、自评分无 D/RT 1:0:0、自评分+RT 16:0:2、SERA 16:2:2。不能称完全相同执行更新数或计算量。</p>
<p>RT 的累计环境软上限为 16，含根环境：已启动的完整八分支组可越过上限，之后委派回退普通子 Agent。它不是同时在线的硬上限。论文 Eq. 5 说不含委派的树从 D 更新省略；固定代码却把空树均值记为 0 纳入跨树基线。本文区分公式与实现，没有判断哪一版产生了主表。</p>
<p>rubric 提示要求 4 至 8 项，解析器的最低数量由配置决定、没有强制 8 项上限。TextCraft 论文 / 评测的 prompt 上限为 9,728，共享训练 YAML 为 9,600；上下文 / 单次输出分别 10,240 / 512。TextWorld 为 13,312 上下文、10,240 prompt、3,072 单次输出。详见 <a href="https://arxiv.org/pdf/2610.04902v1#page=14">Tables 5、6</a> 和固定版本训练配置。</p>
</details>

<h2 id="实验：真实任务、成功率与关键负结果">4. Experiments：先看一题怎样验收，再看平均成绩</h2>

<p><strong>主表成功率由最终根任务的程序验收决定，自评分不是最终指标。</strong>作者生成两类文字环境：TextCraft-Synth 测多层配方合成；TextWorld-Sync 从 CookingWorld 食材数据库生成多道菜与共享资源约束。题目、配方、初态和预算写入固定记录，根判据由程序定义，不是人工逐题给分。TextWorld 子任务的 RT 标签另由模型给出，不能与根程序混同。</p>

<h3 id="两个真实题目怎样走">4.1 真实 case：八种食材全处理好，仍可能不通过</h3>

<p>公开训练题 <a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Dataset/training/textworld_train.jsonl#L1"><code>multi_dish_fork_join_medium_0000</code></a>，完整 ID 以 <code>cookingworld_multidish_train_</code> 开头，随机种子 seed=850000。模型看到“准备并吃掉两道菜”、完整处理要求、当前位置、可见物体和合法动作，可另查库存；不直接读取所有物体的状态树。该题有九个地点、十一件干扰物，库存容量一，共享世界动作上限 96。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sera/two-dish-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/sera/two-dish-real-case.svg" width="900" height="346" alt="两菜任务每种食材的实际要求与检查状态；25动作通过而漏eat第2菜的24动作得0"></a><figcaption>根据官方首条两菜记录与 <code>composite_scorer.py</code> 独立整理。本文导入公开 Python 环境完成实际 CPU 重放；它不是论文 Figure 2 的五菜故事，也不是训练后模型的执行日志。</figcaption></figure>

<p>初始厨房能看到 red apple、water、orange bell pepper、carrot、purple potato；重放先让 worker_1 收集、烤制并切片苹果，去 pantry（储藏室）拿 olive oil，回来拿 water，再处理彩椒，最后 <code>prepare dish_1</code>、<code>eat dish_1</code>。worker_2 按第二道菜的要求处理盐、胡萝卜、紫土豆和面粉。两人位置、历史独立，库存、食材、菜品与预算共享；世界动作加锁后提交，不是各有独立库存。</p>

<div class="table-scroll"><table><thead><tr><th>本文实际程序重放</th><th>此时状态</th><th>根任务分</th></tr></thead><tbody><tr><td>第 12 次：eat dish_1</td><td>第一道菜完成；第二道菜未完成</td><td>0</td></tr><tr><td>第 24 次：prepare dish_2</td><td>八种食材全符合要求；第二道菜尚未吃掉</td><td><strong>0</strong></td></tr><tr><td>第 25 次：eat dish_2</td><td>两菜全部准备并吃掉；剩 71 次世界动作</td><td><strong>1</strong></td></tr></tbody></table></div>

<p><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/environments/textworld/composite_scorer.py#L14-L45">检查器</a>逐食材要求 <code>collected=true</code>、<code>deleted=false</code>、处理集合与配方完全一致；再要求每菜 <code>meal_prepared=true</code> 且 <code>meal_eaten=true</code>。只有全部满足才得 1，漏吃第二道菜得 0，<strong>没有 1/2 部分分</strong>。漏吃时 <code>task_failure=false</code>，说明还可继续操作，但不代表成功。重放按完整元数据挑动作、两名 worker 顺序执行，验证的是环境和检查器，没有验证模型决策或并行加速。</p>

<details><summary>可运行的 Python 重放与另一个 TextCraft case</summary>
<p>Python 3.12；本文编写的 <a href="/lib/papers/sera/replay-two-dish.py">重放脚本</a> 导入官方代码，不复制其实现。先检出固定版本 SERA，再运行下面命令；输出完整 25 动作与漏最后 eat 的 24 动作记录，并检查 .175 配对损失和两项主表均值。</p>

```bash
python3 replay-two-dish.py --sera-repo /path/to/SERA
```

<p>脚本还单独构造胡萝卜为 <code>fried+sliced</code> 的最终状态，检查器给 0 且 <code>task_failure=true</code>。这是状态验算，不是实际模型动作：固定环境的合法动作列表仅暴露符合配方的处理方式，不能声称它真实执行了“烤错”。</p>
<p>TextCraft 的 <a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Dataset/training/textcraft_synth_train.jsonl#L1"><code>textcraft_synth.train.0</code></a> 目标是 <code>Craft the following items: 3x a1_i5</code>，原料 raw_a1=71、raw_a9=27、raw_a4=48 等。公开参考计划有五层配方、22 次 craft；最后消耗 a7_i4、a3_i4_23、a9_i4 各三个，得到三个 a1_i5。Agent 自己用 <code>get_info</code> 查询配方，不读参考计划。</p>
<p>TextCraft <code>evaluate()</code> 要求显式 <code>finish</code>、非空结束消息、各目标 <code>final_count-initial_count ≥ required_count</code>；只做两个目标物就失败，初始已有的物体不能冒充新产物。22 次 craft 不等于 22 轮模型输出，一段 Python 代码可调用多个工具。评测程序把记录中 <code>max_steps=75</code> 覆盖成每节点 20 轮，并非另外还有 75 次全局工具限额。</p>
</details>

<p>普通评测每题只跑一棵递归树（N=1），不写 rubric、不选候选。根、子各最多 20 轮模型输出，深度最多三；单 Agent 对照根为 200 轮、深度零。TextWorld 另有整题世界动作上限，按每题配置读取，不都等于 100；查库存和委派不消耗世界动作。TextCraft 使用 Platoon / CodeAct 输出并执行 Python，TextWorld 使用作者的 Python 多菜运行程序；都不是 Claude Code、Codex 或 OpenHands。</p>

<p>TextCraft 用 852 道 Medium 训练，最终 632 题四档为 147/213/136/136；TextWorld 训练 1,500、开发 200、测试 1,400，测试四档各 350。每题程序分 0/1，错误算失败；<strong>最终成功率 = 成功题数 / 全部题数</strong>。Table 1 的 SERA 分档均值复算：TextCraft 为 <code>(99.09×147+97.81×213+78.92×136+6.13×136)/632=74.314%</code>；TextWorld 为四档均值 <code>65.0725%</code>。报告的 ± 是三个种子的标准差，不是置信区间。</p>

<h3>4.2 关键结果：哪一步真的解释了增益</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/sera/results-and-cost.svg" target="_blank" rel="noopener"><img src="/lib/papers/sera/results-and-cost.svg" width="900" height="347" alt="TextWorld二元奖励加RT退步而rubric奖励加RT提升，D只在部分情形有效；外部调用减少而总时间增加"></a><figcaption>按 Tables 1、2、7 事实独立整理；图显示均值，完整递归消融及标准差见下表。<a href="https://arxiv.org/pdf/2610.04902v1#page=7">原 Tables 1、2</a> 保留各难度档和所有基线。</figcaption></figure>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>非根执行奖励</th><th>TextCraft %</th><th>TextWorld %</th></tr></thead><tbody><tr><td>RAO</td><td>外部二元成败</td><td>68.93 ± .78</td><td>51.93 ± 1.42</td></tr><tr><td>RAO + D</td><td>外部二元成败</td><td>68.93 ± 1.17</td><td>51.33 ± .50</td></tr><tr><td>RAO + RT</td><td>外部二元成败</td><td>72.47 ± .16</td><td><strong>45.62 ± .46</strong></td></tr><tr><td>SERA w/o D &amp; RT</td><td>自评分</td><td>72.26 ± .18</td><td>51.10 ± .15</td></tr><tr><td>SERA w/o D</td><td>自评分 + RT</td><td><strong>74.84 ± 1.41</strong></td><td>60.26 ± 1.16</td></tr><tr><td>SERA</td><td>自评分 + RT + D</td><td>74.31 ± .90</td><td><strong>65.07 ± 3.48</strong></td></tr></tbody></table></div>

<p>TextWorld 保留二元执行奖励时，加 RT 从 51.93 降到 45.62；换为 rubric 奖励后，加 RT 从 51.10 升到 60.26。这组对照支持“学评价与用评价要配合”。D 加到 RAO 没有收益，加到自评分+RT 提高 4.81 点，主要在难题；TextCraft 加 D 反而下降 .53 点，完整 SERA 不是两环境都第一。</p>

<p>Table 3 还有更强的反例：在 TextCraft，Rank 为 74.84，加 Disc 后只有 <strong>65.77</strong>。Disc 是鼓励候选分数更分散的奖励，不是二元辨别器；分数拉开不代表成功排在失败前。固定代码也把顺序项换成截断的标准化分差，再与分散项各占一半，所以不能严格称“仅在相同损失上加分散项”。这些都是<strong>最终任务成功率</strong>，不是评分器准确率的独立测量。</p>

<details><summary>其他基线、rubric 对照、数据划分与完整原表入口</summary>
<p>单 Agent 基础模型的 TextCraft / TextWorld 成功率为 23.10/13.00，递归提示为 26.37/16.79；单 Agent CISPO 为 33.07/38.86，GRPO 为 28.96/39.29。可见只开放委派接口改善有限，递归训练更强。详见 <a href="https://arxiv.org/pdf/2610.04902v1#page=7">完整 Table 1</a>。</p>
<p><a href="https://arxiv.org/pdf/2610.04902v1#page=8">Table 3</a>：每子任务 policy 生成、policy 评分且无 RT 为 72.26±.18；Kimi 生成 / policy 评分 71.41±.37；Kimi / Kimi 73.10±1.11；全局同一 rubric / policy 67.77±1.14；Rank 74.84±1.41；Rank+Disc 65.77±1.21。代码的后者为 <code>.5×mean clip((s_success-s_failure)/.2,0,1)+.5×clip(2×pstdev(s),0,1)</code>，pstdev 是整组分数的总体标准差。</p>
<p>TextCraft 的 632 题同时用作验证和最终评测；训练器构造其中 100 题的验证子集，默认关闭周期验证。缺少独立盲测，但不能因此直接判定泄漏。TextWorld 训练 Medium/Hard/Extreme 为 900/150/450，开发和测试独立；七任务族 × 四难度 × 五十题构成测试。论文未报告人工逐题审核、一致性统计或基础模型污染分析。</p>
<p><a href="https://arxiv.org/pdf/2610.04902v1#page=16">Table 8</a> 的七族分别需要：独立支路汇合、先做长支路、均衡分工、遵守资源限额、打开前置门、协调共享工具、递归拆到食材层。本文两菜题只代表第一族。共享动作生成范围为 Easy 115–125、Medium 95–100、Hard 75–90、Extreme 65–80；使用每题 <code>parallelism.shared_environment_max_steps</code>，不是一概取训练默认 100。</p>
<p>汇总程序同时记录“成功/已完成”与“成功/计划全部题数”；未完成时两者不同，只在全套完成后产生正式 final report。本文没有把中途 progress summary 当最终主表，也未重训模型复现得分。</p>
</details>

<h3>4.3 外部成本与额外两候选选择</h3>

<p><strong>外部评审更少，但总训练时间不一定更少。</strong>Table 2 中 TextWorld 外部 judge 调用 147.80K→35.79K，输入/输出为 633.80M/16.13M→125.32M/4.27M tokens；TextCraft 程序检查 550.94K→257.96K。Table 7 同 16 H200，RAO/SERA 的 TextCraft 用时 29h36/24h06，TextWorld 为 13h08/24h14。这里节省的是外部监督，不是所有计算。</p>

<p>Table 4 额外测试 N=2：每次委派复制完整世界、跑两棵子树，按同一 rubric 评分并提交选中分支的<strong>完整状态</strong>，不仅选一段文字。SERA N=1 65.07±3.48，自评 N=2 67.50±.54；未训练模型对应 16.79/16.57，没有同样收益。它同时改变候选质量与选择能力，不能单独证明评分器已经可靠。</p>

<details><summary>N=2 的预算、Kimi 行与论文 / 代码差异</summary>
<p>多个委派按顺序选择，后者从前者提交后的状态开始；根温度 0、候选 1、评分 0，整题累计 fork 上限 32，超限让父 Agent 自己继续。它与普通共享世界委派、RT 只提交 branch 0 的协议不同。</p>
<p>论文 Kimi-K3 N=2 为 67.29±.69，描述为同样按 rubric 评分；固定 <a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/TestTimeScale/textworld_bestofn/rubric_selector.py#L329-L359">外部 oracle 选择代码</a>却用二元标签，选首个成功候选，默认模型 <code>kimi-k2.6</code>。policy 模式确实按 rubric。公开脚本与论文 Kimi 行不能当成完全相同协议。完整 <a href="https://arxiv.org/pdf/2610.04902v1#page=9">Table 4</a> 与 <a href="https://arxiv.org/pdf/2610.04902v1#page=15">Table 7</a> 可对照。</p>
</details>

<h2 id="代码阅读与后续验证">5. Discussion：先验证评价质量，再比较节省多少监督</h2>

<p><strong>对真实 coding agent，最应补的实验是自评分与真实检查结果的独立对照。</strong>同一委派点保留目标、rubric、候选轨迹、最终状态和测试结果，统计成功与失败是否真的排对。再固定标签总数、生成 token 与实际时间，比较“外部逐子任务奖励”和“外部只训练 rubric”。本论文没有这类真实代码库结果，不能直接据其均分宣布共享自评优于强模型 judge。</p>

<p>读代码可以沿一条路径：<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/rubric/prompts.py">prompts.py</a> 确认谁看见什么；<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/rubric/scoring.py">scoring.py</a> 确认怎样接收分数；<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/three_stage_train/counterfactual.py">counterfactual.py</a> 确认复制与提交；<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/rubric_generation_ranking/stage.py">ranking/stage.py</a> 确认奖励只训练 rubric 输出；最后看 <a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/sera_training/trainer.py">trainer.py</a> 的实际阶段组装。共享 YAML 默认不等于完整 SERA recipe，启动脚本还会覆盖配置。</p>

<h2 id="结论与测试时选择的边界">6. Conclusion：有效的是有成败依据、被执行训练采用的自评</h2>

<p><strong>SERA 的核心证据是评价训练与执行奖励的配合，而不是增加一个自评调用就有效。</strong>根程序保住最终指标，外部子任务标签校准 rubric，当前模型按 rubric 获得执行训练奖励。普通评测不需要额外评价调用；两候选选择能再提高成绩，但要增加计算。</p>

<p>它只测试 Qwen3-4B 和两个合成文字环境。共享权重仍可能让评分随执行训练漂移；叶节点数也不保证等于贡献。对研究者更有价值的下一步，是检验评价是否可信、减少的标签能否抵消额外分支成本，而不是把 65.07% 外推成真实软件 Agent 的水平。</p>

<details><summary>原文视觉清单与复用边界</summary>
<p>本文完整检查原论文两张 Figure 与八张 Table。arXiv v1 只授予分发许可，没有确认转载原图的权限；代码仓库根无项目 LICENSE，HF 模型的 Apache-2.0 与内置 Platoon 的 MIT 不能扩大为 PDF 许可。因此原图提供精确页链接，配图为独立事实整理，没有描摹原版排版。</p>
<div class="table-scroll"><table><thead><tr><th>原视觉</th><th>信息与本文保留位置</th></tr></thead><tbody><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=3">Figure 1</a></td><td>训练结构与文字掩码；第 3 节关系图、PPT 3/6/8 页</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=13">Figure 2</a></td><td>五菜说明例：甜点子 Agent 做成果汁，父厨师补做后根成功；说明子失败与根成功可同时存在，不冒充本文真实两菜记录</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=7">Tables 1、2</a></td><td>全基线、难度分档、外部标签成本；第 4 节主要对照可见，次要基线折叠</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=8">Table 3</a></td><td>生成器 / 评分器 / 训练对照；分数分散负结果可见，六行数值保留</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=9">Table 4</a></td><td>训练前后 N=1/N=2；第 4.3 节保留自评成绩及外部协议差异</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=14">Tables 5、6</a></td><td>优化、输入预算、数据量、阶段比例；主文与方法补充，不能误作奖励权重</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=15">Table 7</a></td><td>同硬件实际时间；第 4.3 节保留总成本反例</td></tr><tr><td><a href="https://arxiv.org/pdf/2610.04902v1#page=16">Table 8</a></td><td>七类协调结构；数据补充说明，本文 case 不声称覆盖全部</td></tr></tbody></table></div>
</details>

<p class="source-note">依据 17 页 v1 全文与附录 A–C、固定代码 <code>0443b190ccde59486904988e50893102df4563ab</code>、官方任务记录核查。本文完成 CPU 环境重放和算例检查，未运行 GPU 训练，未声称复现模型分数。公开模型版本为 <code>a5e3c1e141efd1cdf0988debec42ca315d5c752b</code>。</p>

</div>

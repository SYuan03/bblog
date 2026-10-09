---
title: "[2026-10-04] Self-Evaluating Recursive Agents"
permalink: "/posts/论文解读/self-evaluating-recursive-agents.html"
date: "2026-10-09T13:20:00+08:00"
updated: "2026-10-09T13:20:00+08:00"
cover: "/lib/papers/sera/cover.svg"
description: "SERA 让同一个 Qwen3-4B 策略模型同时拆解任务、执行子任务和验收结果。父 Agent 在委派前先写好一份验收标准，再用同一起点的 8 条可验证分支训练这份标准。本文结合论文与公开代码，讲清三套奖励、两个 benchmark、真实题目、评测框架和复现成本。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 14
categories:
  - "论文解读"
tags:
  - "Recursive Agent"
  - "Reinforcement Learning"
  - "Self-Evaluation"
  - "Rubric"
  - "Multi-Agent"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Tianyi Lyu, Xiaozhe Li, Yang Li, et al. · arXiv:2610.04902v1 · 最早公开于 2026-10-04</p>
<div class="source-links"><a href="https://arxiv.org/abs/2610.04902">论文主页</a><a href="https://arxiv.org/pdf/2610.04902v1">论文 PDF</a><a href="https://github.com/OliverLeeXZ/SERA">官方代码</a><a href="https://huggingface.co/Litux12138/SERA">公开 checkpoint</a></div>

<section class="deck-wrap" aria-label="SERA 交互图解">
  <div class="deck-head"><strong>14 页交互图解 · 从一次委派看到三套奖励、真实 case 与评测链</strong><a href="/lib/decks/sera-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/sera-visual-guide.html" title="SERA 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">SERA 训练同一个 Qwen3-4B 策略模型（policy）承担三种角色：拆解根任务、执行子任务、验收子任务。每次委派前，父 Agent 先写一份验收标准（rubric）；子 Agent 完成后，同一模型再按这份已冻结的标准评分。算法思路很短，但论文的完整实现仍需要递归轨迹树、环境克隆、逐 token 归因和 16 张 H200。</p>

<div class="metrics" aria-label="SERA 关键数字"><div class="metric"><strong>74.31%</strong><span>TextCraft-Synth 成功率</span></div><div class="metric"><strong>65.07%</strong><span>TextWorld-Sync 成功率</span></div><div class="metric"><strong>4.1×</strong><span>TextWorld 外部 judge 调用减少</span></div><div class="metric"><strong>+2.43</strong><span>N=2 自选增益</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>rubric 必须在子任务开始前生成并冻结，不能先看执行结果再改验收标准。</li><li>普通执行阶段由 policy 自评；训练 rubric 时，仍要用程序检查器或 Kimi 提供真实的成败标签；根任务最终也由程序判定。</li><li>主要增益来自经过真实成败校准的排序训练（verified ranking）。只让模型按提示生成 rubric，在 TextWorld 上几乎没有超过 RAO。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 三种分数不要混</span><h3>根任务、普通子任务与 rubric 训练走三条不同路径</h3><p>根任务最终是否成功，由环境检查器（checker）决定。普通的非根子任务由 policy 按冻结 rubric 给出连续分。只有到了“训练 rubric”的阶段，训练框架才会从同一个委派点复制 8 条分支，并用 TextCraft 程序检查器或 TextWorld 的 Kimi judge 标出真实成败。这些标签用于训练 rubric 生成动作，不直接充当日常执行奖励。</p></aside>

## Q1. 为什么递归 Agent 需要自己学会验收子任务？

<p><strong>根任务通常可验证，Agent 临时发明的中间任务却没有现成答案。</strong>例如根目标是“做完并吃掉两道菜”，环境可以检查最后的食材、烹饪状态，以及菜品是否已完成并吃掉；根 Agent 途中委派的“检查储藏室，把有用食材送到厨房”却没有固定答案。子 Agent 可能拿对了食材，也可能顺手耗掉共享资源。只看根任务最终成败，很难判断这条中间轨迹应承担多少责任。</p>

<p>RAO 的办法是让程序 verifier 或 LLM judge 给树上每个节点二元标签。这样能定位 credit，但每个子任务都要额外判断，成本随树增长，而且标签只回答“做没做成”，无法直接奖励“这次拆分是否承担了有意义的工作”。SERA 把问题拆成 execution、delegation 和 evaluation 三种能力，每种能力使用独立奖励，再交替更新同一组参数。</p>

## Q2. 它与 RAO、普通 rubric 奖励有什么区别？

<p><strong>SERA 的关键变化，是用起点相同、成败可验证的分支来训练评分标准。</strong>静态 rubric 或未经训练的 rubric 生成器也能给连续分，但可能把“看起来完整、实际失败”的轨迹评成高分。SERA 要求成功分支的 rubric 分数至少比失败分支高 0.2。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>子任务的执行奖励</th><th>怎样训练评价能力</th><th>怎样训练拆解</th></tr></thead><tbody><tr><td>RAO</td><td>程序或 LLM 给出的二元成败</td><td>不训练 policy 的评价能力</td><td>没有独立信号</td></tr><tr><td>SERA w/o D &amp; RT</td><td>policy 按 rubric 给分</td><td>只靠提示，不更新 rubric 生成动作</td><td>没有独立信号</td></tr><tr><td>SERA w/o D</td><td>policy 按 rubric 给分</td><td>8 条同起点分支做成败排序</td><td>没有独立信号</td></tr><tr><td>SERA</td><td>policy 按 rubric 给分</td><td>经真实标签校准的排序训练</td><td>根任务成功 × 叶节点覆盖率</td></tr></tbody></table></div>

<p>它也不同于固定的过程奖励（flat process reward）。这里的中间任务、树形拓扑和评价器都由同一 policy 在运行时产生，无法预先列出固定的子任务类型。与 RubricEM、ARCO、EvoRubrics 等学习 rubric 的工作相比，SERA 把 rubric 放进动态递归树，并让负责执行的 policy 同时担任评分器。</p>

## Q3. 一次训练怎样运行，三套奖励分别更新哪些 token？

<p><strong>每次委派都先生成 rubric，再让子 Agent 执行。</strong>训练框架把执行轨迹、发起委派的语句和生成 rubric 的语句分成三个优化目标。三种奖励不会相加；优化器按 16 : 2 : 2 的步数比例依次训练这三类动作。</p>

### Execution：用冻结 rubric 给 child 连续分

<p>父 Agent 写 rubric 时，可以看到父任务、委派前的父轨迹、当前可观察状态、子任务目标、可用工具和预算，但看不到子 Agent 接下来会做什么。公开代码要求生成 4–8 个 <code>rubric_items</code>；每项都包含权重、零分条件和满分条件，另有 <code>success_gate</code> 与 <code>failure_conditions</code>。配置虽然写着 <code>min_criteria=2</code>，<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/rubric/prompts.py#L157-L224">实际构造提示时却取 <code>max(4, min_criteria)</code></a>，所以最少仍是 4 项。</p>

<p>子 Agent 结束后，同一 policy 接受一次独立的评分调用：输入是冻结的 rubric、完整轨迹和最终环境状态，输出是 success gate 与 <code>final_score ∈ [0,1]</code>。根节点仍使用环境给出的成败；非根节点改用 rubric 分数。这个阶段只更新执行轨迹中的 token，生成 rubric 和评分调用产生的 token 都不接收梯度。</p>

### Rubric generation：fork 8 条分支做排序

<p>训练框架在同一个委派点复制环境，针对相同的子任务目标采样 <code>B=8</code> 条分支轨迹。第 0 条分支继续真实执行，并把最终状态提交给父 Agent；另外 7 条只用于训练。TextCraft 用程序检查器标记每条分支的成败。TextWorld 的临时子任务没有统一程序检查器，因此改用 Kimi 做二元判断。如果 8 条分支全成功或全失败，这组数据没有排序信息，会被跳过。</p>

<div class="formula"><code>L_rank = mean max(0, 0.2 - s_success + s_failure)</code></div>

<p><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/rubric_generation_ranking/stage.py#L29-L63">实现</a>会遍历所有成功—失败分支对，计算上面的 hinge loss，再把整组奖励附到生成 rubric 的那段输出上。8 次评分调用只负责算奖励，会与梯度计算断开，也不会进入优化器。这样，模型无法靠直接训练评分器输出高分来走捷径。</p>

### Delegation：成功树里的 leaf coverage

<p>一次委派的奖励是 <code>root_success × subtree_leaves / all_tree_leaves</code>。如果根任务失败，树中所有委派奖励都是 0；如果根任务成功，覆盖 2/3 叶节点的委派动作就得到 2/3。代码只把奖励给到生成 <code>launch_subagent(...)</code> 语句的那段 token。完整 SERA 不再按子任务的 success gate 筛选叶节点，而且所有叶节点等权。因此，“覆盖更多叶节点”只能粗略代表承担了更多工作。</p>

### 两个真实题目怎样走

<div class="case"><h4>TextCraft：<code>Craft 3x a1_i5</code></h4><p>公开训练样例 <code>textcraft_synth.train.0</code> 的目标物有五层配方依赖，记录中的标准计划包含 22 次 <code>craft</code>。Agent 在提示中只拿到目标和工具接口，可以调用 <code>get_info</code>、<code>view_inventory</code>、<code>craft</code>、<code>launch_subagent</code> 与 <code>finish</code>；标准轨迹不会输入模型。检查器只在 Agent 显式调用 <code>finish()</code> 后验收，并计算 <code>final_count - initial_count</code>。净新增至少 3 个 <code>a1_i5</code> 才 PASS，初始库存中已有的目标物不能冒充本次产出。</p></div>

<div class="case"><h4>TextWorld-Sync：两道独立菜</h4><p>一个公开样例要求 dish_1 使用烤切后的 red apple、olive oil、water 和烤切后的 orange bell pepper；dish_2 使用 salt、烤切后的 carrot、烤切后的 purple potato 与 flour。Agent 能看到任务描述、当前位置、可见物体、合法动作和剩余共享步数。每个 Agent 各自保留位置、历史和轨迹预算，但共享库存、物品、门、工具冷却状态、菜品进度和全局动作预算。每次环境动作都会加锁并原子提交。</p><p><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/environments/textworld/composite_scorer.py#L14-L45">根任务检查器</a>要求每种食材都已收集、没有被删除、处理方式完全匹配，而且每道菜都已完成并吃掉。只完成 dish_1、忘记执行 <code>eat</code>，或做了不可逆的错误处理，最终都是 FAIL。</p></div>

## Q4. 模型、Agent harness、题目与最终分数具体怎样测？

<p><strong>主实验固定模型为 Qwen3-4B-Instruct-2507，只比较不同训练方法得到的 checkpoint；最终成败全部由确定性的根任务检查器给出。</strong>所有强化学习配置都做全参数训练，使用 Adam、CISPO、三套留一基线（LOO baseline）和递归深度加权。每次参数更新取 8 个根任务，每个根任务采样 8 棵轨迹树；每个 Agent 最多执行 20 个环境步骤，最大递归深度为 3。</p>

<div class="table-scroll"><table><thead><tr><th>评测合同</th><th>TextCraft-Synth</th><th>TextWorld-Sync</th></tr></thead><tbody><tr><td>任务来源</td><td>程序生成的合成配方；训练集含 852 道 Medium 题</td><td>从 CookingWorld 食物数据库按 seed 生成多菜任务和 7 种协调结构</td></tr><tr><td>最终题集</td><td>固定验证池中的 632 题：147 / 213 / 136 / 136</td><td>独立测试集，1,400 题：7 个任务族 × 4 档难度 × 50</td></tr><tr><td>Agent 运行接口</td><td>CodeAct，通过 IPython 执行器调用 Python 函数</td><td>每步输出 action、inventory、delegate 或 finish block</td></tr><tr><td>评测轨迹</td><td colspan="2">temperature 0；每题一条递归轨迹；根/子 Agent 各 20 步；最大深度 3</td></tr><tr><td>上下文 / 单次输出</td><td>10,240 / 512 tokens</td><td>13,312 / 3,072 tokens</td></tr><tr><td>PASS</td><td>显式 finish，且所有目标物的净增量达标</td><td>全部菜的食材、处理方式、prepare 和 eat 均完成</td></tr><tr><td>聚合</td><td>按 632 道题直接加权</td><td>四档各 350 题，直接加权等于四档宏平均</td></tr></tbody></table></div>

<p>论文表格中的主成功率来自三次运行，报告均值 ± 标准差；评测错误按失败计入。用 Table 1 的四档 SERA 均值复算，TextCraft 为 <code>(99.09×147 + 97.81×213 + 78.92×136 + 6.13×136) / 632 = 74.314%</code>；TextWorld 四档题数相同，均值为 <code>65.0725%</code>，与论文报告的 74.31 和 65.07 一致。</p>

<p>两个环境向模型公开的信息也不同。TextCraft 的配方可通过 <code>get_info</code> 查询，但标准计划和检查器状态不会进入提示。TextWorld 会在任务描述中列出完整食材要求，却不会直接给出物体位置、共享世界的完整对象树，以及检查器读取的内部状态。Agent 只能从观察结果、合法动作和库存查询中逐步发现。论文发布后，题目文件与检查代码都是公开的，因此这不是长期保密测试；作者也没有分析基础模型是否见过这些数据。</p>

<p>TextWorld 的训练、开发和测试题彼此独立。TextCraft 则有一个需要谨慎解释的缺口：仓库 README 明确说明，验证与最终评测使用同一批 632 题；训练还会从中抽出 100 题作为验证子集，不过默认配置关闭了周期性验证。这个设置能测量从 Medium 训练题向四档配方深度的迁移，却不属于严格独立的开发集与测试集。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>TextCraft Avg.</th><th>TextWorld Avg.</th></tr></thead><tbody><tr><td>RAO</td><td>68.93 ± 0.78</td><td>51.93 ± 1.42</td></tr><tr><td>SERA w/o D &amp; RT</td><td>72.26 ± 0.18</td><td>51.10 ± 0.15</td></tr><tr><td>SERA w/o D</td><td><b>74.84 ± 1.41</b></td><td>60.26 ± 1.16</td></tr><tr><td>SERA</td><td>74.31 ± 0.90</td><td><b>65.07 ± 3.48</b></td></tr></tbody></table></div>

<p>结果里最清楚的是三步消融：未经训练的 rubric 在 TextWorld 上只有 51.10，低于 RAO 的 51.93；加入经过真实标签校准的排序训练后升到 60.26；再加入基于叶节点覆盖率的拆解奖励，成绩升到 65.07，而且增益集中在 Hard 与 Extreme。TextCraft 加入拆解奖励后反而下降 0.53，说明相对独立的合成分支未必需要额外结构奖励。</p>

<p>单纯鼓励评分分散也没有奏效。Table 3 的 Rank + Disc. 只有 65.77，比 verified ranking 的 74.84 低 9.07 分。把分数拉开无法保证排序方向正确，也可能只是在一组失败轨迹之间制造差异。</p>

<p>外部监督用量确实下降：TextWorld 的 judge 调用次数从 RAO 的 147.80K 降至 SERA 的 35.79K，输入 token 从 633.80M 降到 125.32M。不过，总训练时间没有同步下降。同样使用 2 × 8 张 H200，TextWorld 上的 RAO 用时 13 小时 08 分，SERA 则用时 24 小时 14 分。共享状态和每次复制 8 条反事实轨迹，增加了另一部分系统成本。</p>

## Q5. 如果想学习或复现，最值得先做哪一部分？

<p><strong>先实现一个可记录、可复制、可验证的委派点，再考虑分布式强化学习。</strong>最小原型只需要：支持 <code>snapshot/commit</code> 的环境、一个 <code>delegate(goal)</code> 接口、委派前冻结的 rubric、4–8 条同起点分支，以及能为每条分支给出二元结果的程序检查器。把父轨迹前缀、子任务目标、rubric、执行轨迹、前后状态、真实标签和 policy 分数写入 JSONL，就能直接检查 rubric 是否真的把成功排在失败前面。</p>

<p>代码阅读顺序可以很短：</p>

<ol><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/rubric/prompts.py"><code>Runtime/rubric/prompts.py</code></a>：rubric 生成器和评分器究竟能看到什么。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/rubric_generation_ranking/stage.py"><code>rubric_generation_ranking/stage.py</code></a>：成败配对损失、与梯度断开的评分器，以及怎样生成训练样本。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/three_stage_train/counterfactual.py"><code>counterfactual.py</code></a>：怎样复制 8 条分支、只提交第 0 条分支，以及如何限制环境数量。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/two_stage_rao_leaf/leaf_credit.py"><code>leaf_credit.py</code></a>：叶节点覆盖率的实际计算。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/sera_training/stage_kernel.py"><code>stage_kernel.py</code></a>：16 : 2 : 2 调度。核心调度器只有约一百行。</li></ol>

<p>之后再补逐 token 掩码、三套 LOO advantage、CISPO、Ray、AReaL、FSDP 与 SGLang。仓库的 <code>--dry-run</code> 不需要 Ray 或 GPU，但仍要先安装依赖；在没有安装依赖的干净 Python 环境中，它会先因缺少 OmegaConf 而停止。论文默认使用 2 台机器、每台 8 张 H200。代码结构清晰，不等于这套训练可以在单机上轻量复现。</p>

<p>一个可信的后续实验，应固定检查器标签总数、实际运行时间和轨迹 token 总量，把“自评能否减少外部监督”与“额外反事实计算是否划算”分开比较。还可以在 coding agent 或 research agent 上加入有噪声的检查器，并暂时拆开 rubric 生成器与评分器，观察同一 policy 兼任两者时是否出现共谋或奖励漂移。</p>

## Q6. 最后怎样评价 SERA？

<p><strong>SERA 把自我评价变成了可训练动作：Agent 在执行前定义何为成功，再用真实成败校准这份定义。</strong>它没有消灭外部检查器，只是把外部标签集中用在少量复制分支上；训练完成后，policy 按 rubric 为普通子任务提供连续奖励。测试时，这份 rubric 还能在 <code>N=2</code> 棵候选子树之间自行选择，把 TextWorld 成功率从 65.07 提到 67.50；使用外部 Kimi 选择时是 67.29。</p>

<div class="limit-grid"><div><b>模型范围</b><span>只测试 Qwen3-4B-Instruct-2507，尚不知道更大模型是否有同样增益。</span></div><div><b>任务范围</b><span>两个 benchmark 都是合成文字环境，距离代码库、网页和研究任务仍远。</span></div><div><b>自评风险</b><span>同一 policy 既写 rubric 又负责评分；训练时的真实成败只能提供锚点，无法彻底排除共谋。</span></div><div><b>拆解近似</b><span>叶节点覆盖率把所有叶节点等权，结构大小不一定等于真实贡献。</span></div><div><b>数据边界</b><span>TextCraft 的验证与最终评测共用 632 题，缺少严格盲测。</span></div><div><b>复用边界</b><span>代码仓库根目录没有项目级 LICENSE；Hugging Face checkpoint 仓库单独保留 Apache-2.0。</span></div></div>

<p>这篇看起来简单，是因为作者把方法内核、训练调度和运行时分层得很清楚。可迁移的思路确实只有四步：事前写 rubric、从同一起点采样反事实分支、用真实成败训练排序、把奖励只归给对应动作。昂贵的是把这四步做成可恢复、可并发、状态一致的递归训练系统。</p>

<p class="source-note">证据范围：本文完整阅读 arXiv:2610.04902v1 的 17 页正文与附录，分别检查文本提取、全部渲染页面、Figure 1–2 与 Table 1–8；代码核验固定在官方仓库 revision <code>0443b190ccde59486904988e50893102df4563ab</code>，checkpoint 页面固定在 Hugging Face revision <code>a5e3c1e141efd1cdf0988debec42ca315d5c752b</code>。论文 Table 4 把外部 selector 写作 Kimi-K3，公开训练脚本当前默认 rubric-training judge 为 <code>kimi-k2.6</code>；二者用途不同。</p>

</div>

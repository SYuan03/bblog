---
title: "[2026-10-04] Self-Evaluating Recursive Agents"
permalink: "/posts/论文解读/self-evaluating-recursive-agents.html"
date: "2026-10-09T13:20:00+08:00"
updated: "2026-10-09T18:10:00+08:00"
cover: "/lib/papers/sera/cover.svg"
description: "SERA 用强化学习训练同一个 Qwen3-4B 模型拆任务、执行和评价。关键对照是：只加评价训练不够，还要把学到的 rubric 用作子任务执行奖励。本文分开解释训练、普通评测和测试时选择，并对照代码说明运行框架、交互预算和真实题目。"
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
  <div class="deck-head"><strong>14 页交互图解 · 评价怎样参与训练，评测又怎样运行</strong><a href="/lib/decks/sera-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/sera-visual-guide.html" title="SERA 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">SERA 研究的是：Agent 学会评价自己拆出的子任务，能否也把任务做得更好？作者用强化学习训练同一个 Qwen3-4B 模型，分别处理执行、委派和评价；论文将这组共享权重称为策略（policy）。训练时，模型生成子任务评分标准（rubric），用真实成败训练这些标准，再按标准给子任务执行奖励。rubric 走独立的评价路径，不会交给执行子 Agent 当作指令。</p>

<div class="metrics" aria-label="SERA 关键数字"><div class="metric"><strong>74.31%</strong><span>TextCraft 主表成功率</span></div><div class="metric"><strong>65.07%</strong><span>TextWorld 主表成功率</span></div><div class="metric"><strong>45.62%</strong><span>RAO + RT 的 TextWorld 负结果</span></div><div class="metric"><strong>20 轮</strong><span>每个递归 Agent 的模型轮数上限</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>评价训练需要与 rubric 执行奖励配合。只给 RAO 加评价训练，TextWorld 从 51.93% 降至 45.62%。</li><li>主表的普通评测只跑递归执行，不生成或评分 rubric；额外 N=2 实验才在推理时选择候选子树。</li><li>每个根/子 Agent 最多 20 轮模型决策，不等于整题只交互 20 次。论文没有报告每题平均模型调用数。</li></ul></aside>

<aside class="part0"><span class="kicker">PART 0 · 训练与评测分开看</span><h3>同一套权重，三种使用方式</h3><p>训练时，执行奖励、委派奖励和 rubric 训练奖励交替更新同一组模型参数。主表 N=1 评测时，训练好的模型直接拆任务、执行，最后由程序检查根任务是否完成。额外 N=2 实验会在委派点运行两棵候选子树，再用 rubric 选择其中一棵。训练的 8 条分支与测试的 N=2 是两个不同设置。</p></aside>

## Q1. 为什么递归 Agent 需要自己学会验收子任务？

<p><strong>根任务通常可验证，Agent 临时提出的中间任务却没有现成答案。</strong>根目标可以是“准备并吃掉两道菜”，程序检查最后的食材和菜品状态即可。途中委派的“检查储藏室，把有用食材送到厨房”，则需要结合当时的目标判断：有没有找齐、是否误用了共享食材、返回结果能否让父 Agent 继续。只看整题成败，很难分清各个子任务做得怎样。</p>

<p>递归 Agent 把子目标交给另一个使用相同权重的 Agent，子 Agent 也能继续委派。前作 RAO 让程序 verifier 或 LLM judge 给树上每个节点二元标签，分别指程序验证和模型判断。每个子任务都要额外判断，标签也只回答做没做成。SERA 想减少这类外部监督，同时学到更细的评价。SERA 把问题拆成 execution、delegation 和 evaluation 三种能力，每种能力使用独立奖励，再交替更新同一组参数。</p>

## Q2. 它与 RAO、普通 rubric 奖励有什么区别？

<p><strong>SERA 同时训练评价能力，并把模型给出的评价用于执行奖励。</strong>rubric 是针对当前子目标的一组评分条件。未经训练的模型也能写这些条件，但写得合理不代表能区分真实成功和失败。作者从相同委派点采样多条分支，用外部标签检验评分是否把成功分支排在失败分支前面，目标分差至少为 0.2。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>非根节点执行奖励</th><th>rubric 训练（RT）</th><th>委派训练（D）</th></tr></thead><tbody><tr><td>RAO</td><td>外部二元成败</td><td>无</td><td>无</td></tr><tr><td>RAO + RT</td><td>外部二元成败</td><td>有</td><td>无</td></tr><tr><td>SERA w/o D &amp; RT</td><td>policy 按 rubric 给分</td><td>无显式训练</td><td>无</td></tr><tr><td>SERA w/o D</td><td>policy 按 rubric 给分</td><td>有</td><td>无</td></tr><tr><td>SERA</td><td>policy 按 rubric 给分</td><td>有</td><td>有</td></tr></tbody></table></div>

<p>这几行对照很重要：评价训练本身是否有效，与执行是否采用 rubric 奖励，是两个问题。作者认为，共享参数让评价学习也能影响执行；主表支持二者配合的效果，但没有单独证明哪些参数变化造成了这种影响。SERA 训练的是模型权重，公开运行框架负责工具与递归调度，不是让 Agent 修改 harness 代码。</p>

<p>固定过程奖励通常评价一条求解轨迹中的步骤。SERA 的子目标和任务树由 Agent 临时生成，评分标准也要适应当前委派。RubricEM、ARCO、EvoRubrics 等工作同样学习 rubric；这里的区别是递归任务结构，以及执行、拆解、评价共用一个 policy。</p>

## Q3. 一次训练怎样运行，三套奖励分别更新哪些 token？

<p><strong>三种奖励分别训练执行输出、委派语句和 rubric 生成输出。</strong>作者记执行为 E、委派为 D、rubric 训练为 RT。完整 SERA 按 16 : 2 : 2 的优化步数交替训练，比例不是三个奖励的加权系数。</p>

### Execution：用冻结 rubric 给 child 连续分

<p>rubric 生成器读取父任务、委派前的父轨迹、初始状态、子目标、工具和预算，不读取子任务的未来轨迹或结果。公开提示要求 4 至 8 个 <code>rubric_items</code>，包括权重、零分和满分条件，另有 <code>success_gate</code> 与 <code>failure_conditions</code>。执行 child 拿到子目标和执行上下文，不拿到这份 rubric。</p>

<p>子 Agent 结束后，同一 policy 接受一次独立的评分调用：输入是冻结的 rubric、完整轨迹和最终环境状态，输出是 success gate 与 <code>final_score ∈ [0,1]</code>。根节点仍使用环境给出的成败；非根节点改用 rubric 分数。这个阶段只更新执行轨迹中的 token，生成 rubric 和评分调用产生的 token 都不接收梯度。</p>

<p>论文以“委派前生成 rubric”描述信息边界。公开实现并非必须等它写完：<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/rubric_subagent_reward/async_pipeline.py#L77-L138">异步执行路径</a>先准备委派前信息，再并发生成 rubric 和运行 child；RT 路径则先采集分支，再用不含子结果的父轨迹前缀生成 rubric。真正约束是生成器看不到子结果，同一组评分始终使用同一份 rubric。</p>

### Rubric generation：fork 8 条分支做排序

<p>训练框架在同一个委派点复制环境，针对相同的子任务目标采样 <code>B=8</code> 条分支轨迹。第 0 条分支继续真实执行，并把最终状态提交给父 Agent；另外 7 条只用于训练。TextCraft 用程序检查器标记每条分支的成败。TextWorld 的临时子任务没有统一程序检查器，因此改用 Kimi 做二元判断。如果 8 条分支全成功或全失败，这组数据没有排序信息，会被跳过。</p>

<div class="formula"><code>L_rank = mean max(0, 0.2 - s_success + s_failure)</code></div>

<p><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/rubric_generation_ranking/stage.py#L29-L63">实现</a>遍历所有成功与失败的配对，rubric 生成动作的奖励为 <code>-L_rank</code>，强化学习据此更新生成 rubric 的 token。评分器输出与梯度断开，不直接作为优化样本。不过三个角色共用权重，其他阶段的更新仍会改变评分行为；这不能证明模型不会利用奖励漏洞。</p>

### Delegation：成功树里的 leaf coverage

<p>一次委派的奖励是 <code>root_success × subtree_leaves / all_tree_leaves</code>。如果根任务失败，树中所有委派奖励都是 0；如果根任务成功，覆盖 2/3 叶节点的委派动作就得到 2/3。代码只把奖励给到生成 <code>launch_subagent(...)</code> 语句的那段 token。完整 SERA 不再按子任务的 success gate 筛选叶节点，而且所有叶节点等权。因此，“覆盖更多叶节点”只能粗略代表承担了更多工作。</p>

<p>训练使用全参数 Adam，学习率 <code>3e-6</code>。每次更新取 8 道根题，每题采样 8 棵独立树；这与 RT 在某个委派点复制 8 条分支不同。CISPO 控制策略更新幅度，留一基线（LOO）用其他样本奖励作比较：E 比较其他根树的成败，D 先平均每树委派分再跨树比较，RT 在 batch 的有效委派组之间比较。作者还按深度出现频率调整权重，避免浅层输出占主导。</p>

## Q4. 模型、Agent harness、题目与最终分数具体怎样测？

<p><strong>主表测的是训练后模型的递归任务成功率，最终由程序判定，N=1 不生成或评分 rubric。</strong>固定模型为 Qwen3-4B-Instruct-2507，各方法用相同总优化步数，TextCraft 250 次、TextWorld 400 次，再比较 checkpoint。这不等于各方法消耗相同 token 或运行相同时间。</p>

<p>TextCraft 用仓库内的 <code>platoon</code> 递归运行时与 CodeAct，通过 IPython 调用工具。TextWorld 用作者实现的 Python V9 composite coordination runtime，解析 action、inventory、delegate、finish block。两者都不是 Codex CLI、Claude Code 或 OpenHands。</p>

<div class="table-scroll"><table><thead><tr><th>普通递归评测设置</th><th>TextCraft-Synth</th><th>TextWorld-Sync</th></tr></thead><tbody><tr><td>任务来源</td><td>程序生成配方；训练 852 道 Medium</td><td>CookingWorld 食物数据库；训练 1,500、开发 200</td></tr><tr><td>最终题集</td><td>632：四档 147/213/136/136</td><td>1,400：7 个任务族 × 4 档 × 50</td></tr><tr><td>模型采样</td><td colspan="2">temperature 0；每题一棵递归执行树；不调用 rubric</td></tr><tr><td>模型轮数上限</td><td colspan="2">根/子 Agent 各 20 轮；根深度 0，最大深度 3；Agent 总数随委派变化</td></tr><tr><td>一轮的含义</td><td>一个 Python cell，可含多个工具调用</td><td>一次模型输出；库存查询和委派不等于世界动作</td></tr><tr><td>上下文 / 单次输出</td><td>10,240 / 512 tokens</td><td>13,312 / 3,072 tokens</td></tr><tr><td>PASS</td><td>显式 finish，目标物净增量达标</td><td>全部食材、处理、prepare 和 eat 完成</td></tr><tr><td>聚合</td><td>按 632 题加权</td><td>每档 350 题，等价四档宏平均</td></tr></tbody></table></div>

<p>公开 single-agent baseline 不委派，根节点上限是 200 轮、深度 0，不能与递归 Agent 一起写成 20 轮。TextWorld 全题世界动作另有共享预算，生成区间是 Easy 115 至 125、Medium 95 至 100、Hard 75 至 90、Extreme 65 至 80；实际读取 <code>parallelism.shared_environment_max_steps</code>，不固定为 100。TextCraft 训练样例的 <code>max_steps=75</code> 是任务预算，也不是每节点 20 轮。论文没有报告每题平均模型调用或工具调用数，只能核实上限和计数方式。</p>

### 两个真实题目怎样走

<div class="case"><h4>TextCraft：<code>textcraft_synth.train.0</code></h4><p>目标是 <code>Craft the following items: 3x a1_i5</code>。初始库存提供 raw_a1=71、raw_a9=27、raw_a4=48 等原料，目标有五层配方依赖。Agent 可查配方和库存，提示不提供标准计划。公开 gold trace 有 22 次 craft；末级先备齐 <code>a7_i4=3</code>、<code>a3_i4_23=3</code>、<code>a9_i4=3</code>，再消费这些中间物，产出 3 个 <code>a1_i5</code>。</p><p>这段顺序依据公开参考轨迹整理，不是模型实测日志，也不是 22 轮模型调用。检查器只在显式 <code>finish()</code> 后验收，计算 <code>final_count - initial_count</code>。净新增至少 3 个 a1_i5 才 PASS，初始库存中已有的目标物不能冒充本次产出。若最后只产出 2 个，即使中间配方都做对，也判 FAIL；这是按检查规则推得的失败示例。</p></div>

<div class="case"><h4>TextWorld：<code>cookingworld_multidish_train_multi_dish_fork_join_medium_0000</code></h4><p>这道公开训练题 seed=850000，有 9 个地点、11 个干扰物，库存容量为 1，整题共享 96 次世界动作。dish_1 要 red apple、orange bell pepper 都 roasted + sliced，olive oil 与 water 保持 raw + uncut；dish_2 同样处理 carrot、purple potato，salt 与 flour 保持原状。Agent 看到配方、当前位置、可见物体、合法动作和剩余预算，不直接看到未探索地点的完整状态。</p><p>执行时要寻找、收集并按配方处理食材，然后对每道菜 prepare 和 eat。各 Agent 的位置和历史独立，库存、食材状态、菜品和动作预算共享；普通委派不会复制独立世界，环境动作加锁后提交。<a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/environments/textworld/composite_scorer.py#L14-L45">根任务检查器</a>要求每种食材都已收集、没有被删除、处理方式完全匹配，而且每道菜都已完成并吃掉。漏吃第二道菜或把应 roasted 的食材做成其他不可逆状态，根分都是 0。这是按公开规则说明失败，不冒充模型日志。</p></div>

<p>主表报告 3 个 seeds 的均值 ± 标准差，不是置信区间；每道题最终只有成功或失败，运行错误按失败计入，完成整套题才生成 final report。用 Table 1 的四档 SERA 均值复算，TextCraft 为 <code>(99.09×147 + 97.81×213 + 78.92×136 + 6.13×136) / 632 = 74.314%</code>；TextWorld 四档题数相同，均值为 <code>65.0725%</code>，与报告一致。</p>

<p>两个环境向模型公开的信息也不同。TextCraft 的配方可通过 <code>get_info</code> 查询，但标准计划和检查器状态不会进入提示。TextWorld 会在任务描述中列出完整食材要求，却不会直接给出物体位置、共享世界的完整对象树，以及检查器读取的内部状态。Agent 只能从观察结果、合法动作和库存查询中逐步发现。论文发布后，题目文件与检查代码都是公开的，因此这不是长期保密测试；作者也没有分析基础模型是否见过这些数据。</p>

<p>TextWorld 的训练、开发和测试题彼此独立。TextCraft 的 632 题同时用于验证和最终评测，默认关闭周期性验证。它缺少独立盲测集，但不能仅凭共用题池认定发生了泄漏。TextWorld 的七个任务族突出 fork-join、critical path、load balanced、resource constrained、dependency gate、conflict 和 hierarchical 协调结构。作者用生成程序固定题目 manifest，根检查器也由环境程序定义，不是人工逐题给分。论文 Figure 2 的“五道菜、甜点误做果汁”是说明性例子，不能当成本文两菜 manifest 或模型实测日志。</p>

<div class="table-scroll"><table><thead><tr><th>Table 1 · 成功率 %</th><th>TextCraft</th><th>TextWorld</th></tr></thead><tbody><tr><td>RAO</td><td>68.93 ± 0.78</td><td>51.93 ± 1.42</td></tr><tr><td>RAO + D</td><td>68.93 ± 1.17</td><td>51.33 ± 0.50</td></tr><tr><td>RAO + RT</td><td>72.47 ± 0.16</td><td>45.62 ± 0.46</td></tr><tr><td>SERA w/o D &amp; RT</td><td>72.26 ± 0.18</td><td>51.10 ± 0.15</td></tr><tr><td>SERA w/o D</td><td><b>74.84 ± 1.41</b></td><td>60.26 ± 1.16</td></tr><tr><td>SERA</td><td>74.31 ± 0.90</td><td><b>65.07 ± 3.48</b></td></tr></tbody></table></div>

<p>单靠开放委派接口，基础模型的成功率只从单 Agent 的 23.10/13.00 升到递归模式的 26.37/16.79（TextCraft/TextWorld）。单 Agent 训练后，CISPO 是 33.07/38.86，GRPO 是 28.96/39.29。RAO 的递归训练明显更强，SERA 又在其上提高 5.38 和 13.14 个百分点。</p>

<p>最有解释力的对照在 TextWorld：保留外部二元执行奖励、只加入 RT，51.93 降到 45.62；采用 rubric 执行奖励时，再加入 RT，51.10 升到 60.26。因此不能概括成“加排序训练就变好”。D 加到 RAO 没有收益，加到 SERA 则从 60.26 升到 65.07；TextCraft 加 D 反而降了 0.53。</p>

<p>Table 3 进一步比较 rubric：policy 生成并评分、无显式 RT 是 72.26；Kimi 生成而 policy 评分是 71.41；两者都用 Kimi 是 73.10；全局固定 rubric 是 67.77；每次子任务生成 rubric 并做 Rank 训练是 74.84。再加分数分散奖励 Rank + Disc.，成绩降到 65.77。拉开分数不保证排对；这些是最终执行成功率，也不是评分器准确率的独立测量。</p>

<p>外部监督和完整成本要分开看。Table 2 中 TextCraft verifier 调用从 550.94K 降到 257.96K；TextWorld judge 从 147.80K 降到 35.79K，输入/输出 token 从 633.80M/16.13M 降到 125.32M/4.27M。无 RT 的 rubric 奖励版本在 TextWorld 不用外部 judge，却只有 51.10%。Table 7 同样使用 2 × 8 H200：TextCraft 的 RAO/SERA 用时 29h36m/24h06m；TextWorld 为 13h08m/24h14m。外部标签更少，不等于总训练更便宜。</p>

## Q5. 如果想学习或复现，最值得先做哪一部分？

<p><strong>先把一组同起点分支的评价过程看懂，再接训练。</strong>学习原型可以用可复制的小环境，记录父轨迹前缀、子目标、一份 rubric、各分支轨迹、最终状态、真实成败和 policy 分数，检查成功与失败配对的差值。它只能验证评价过程，不能代替 SERA 的强化学习结果。执行 child 的输入与评分调用要分开。</p>

<p>代码阅读顺序可以很短：</p>

<ol><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/rubric/prompts.py"><code>Runtime/rubric/prompts.py</code></a>：rubric 生成器和评分器究竟能看到什么。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/rubric_generation_ranking/stage.py"><code>rubric_generation_ranking/stage.py</code></a>：成败配对损失、与梯度断开的评分器，以及怎样生成训练样本。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/three_stage_train/counterfactual.py"><code>counterfactual.py</code></a>：怎样复制 8 条分支、只提交第 0 条分支，以及如何限制环境数量。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/runtime/two_stage_rao_leaf/leaf_credit.py"><code>leaf_credit.py</code></a>：叶节点覆盖率的实际计算。</li><li><a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Training/sera_training/stage_kernel.py"><code>stage_kernel.py</code></a>：16 : 2 : 2 调度。核心调度器只有约一百行。</li></ol>

<p>阅读前也可以先看 <a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/Runtime/vendor/platoon/textcraft/agent.py"><code>textcraft/agent.py</code></a>，确认执行提示和工具。之后再接逐 token 掩码、LOO、CISPO 和 AReaL 等组件。<code>--dry-run</code> 不运行 GPU 训练，但仍需安装 Python 依赖。16 张 H200 是论文实验配置，不是方法必须的卡数。</p>

<p>一个可信的后续实验，应固定检查器标签总数、实际运行时间和轨迹 token 总量，把“自评能否减少外部监督”与“额外反事实计算是否划算”分开比较。还可以在 coding agent 或 research agent 上加入有噪声的检查器，并暂时拆开 rubric 生成器与评分器，观察同一 policy 兼任两者时是否出现共谋或奖励漂移。</p>

## Q6. 最后怎样评价 SERA？

<p><strong>它支持“训练评价与使用评价奖励相配合”这一结论，证据来自一个 4B 模型和两个合成文字环境。</strong>普通评测的增益来自训练后的权重，不需要每个子任务在推理时再写 rubric。额外 Table 4 才研究测试时选择：SERA N=1 为 65.07 ± 3.48，policy N=2 为 67.50 ± 0.54，论文 Kimi N=2 为 67.29 ± 0.69。未经 SERA 训练时，对应三项只有 16.79、16.57、18.00，增加候选数没有同样收益。</p>

<p>N=2 在每次委派复制整个环境，跑完候选子树，policy 用同一份 rubric 评分后提交选中分支的完整状态。同一父输出若委派多个目标，会依次处理，后一个从前一个提交后的状态出发；默认整题累计 fork 上限为 32。这与普通评测的共享世界委派不同。</p>

<p>公开代码与论文有一处差异：论文称 Table 4 的 Kimi-K3 也按 rubric 评分；固定 revision 下的 <a href="https://github.com/OliverLeeXZ/SERA/blob/0443b190ccde59486904988e50893102df4563ab/TestTimeScale/textworld_bestofn/rubric_selector.py#L329-L359"><code>selection_mode=oracle</code></a> 实际调用外部二元子任务 judge，选第一个成功候选，不使用 rubric，脚本默认模型为 <code>kimi-k2.6</code>。policy 模式确实使用 rubric。论文 Kimi 行与当前外部选择代码不能当成完全相同的协议。</p>

<div class="limit-grid"><div><b>模型范围</b><span>只测试 Qwen3-4B-Instruct-2507，尚不知道更大模型是否有同样增益。</span></div><div><b>任务范围</b><span>两个 benchmark 都是合成文字环境，代码库和网页任务尚未验证。</span></div><div><b>评价风险</b><span>共享权重仍可能造成评价漂移；评分输出不收梯度不能排除奖励漏洞。</span></div><div><b>拆解近似</b><span>叶节点等权，结构大小不一定等于真实贡献。</span></div><div><b>数据边界</b><span>TextCraft 共用验证与最终评测池，但不能据此直接判定泄漏。</span></div><div><b>复用边界</b><span>代码仓库根目录没有项目级 LICENSE；Hugging Face checkpoint 仓库单独保留 Apache-2.0。</span></div></div>

<p class="source-note">2026-10-09 修订：重新核对全文、附录及公开代码，纠正 rubric 与 child 的关系、训练/普通评测/测试时选择的混淆、交互预算口径，补齐 RAO + RT 等消融。证据范围为 arXiv:2610.04902v1 全部 17 页、Figure 1 和 2、Table 1 至 8；代码固定 revision <code>0443b190ccde59486904988e50893102df4563ab</code>，checkpoint 页面固定 revision <code>a5e3c1e141efd1cdf0988debec42ca315d5c752b</code>。本文核验源码与论文，未运行 GPU 训练或声称复现模型得分。</p>

</div>

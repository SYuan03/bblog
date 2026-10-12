---
title: "[2026-05-09] Training with Harnesses: On-Policy Harness Self-Distillation for Complex Reasoning"
permalink: "/posts/论文解读/training-with-harnesses.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-12T16:30:00+08:00"
cover: "/lib/papers/training-with-harnesses/cover.svg"
description: "OPHSD 让当前模型先独立作答，再让同尺寸的冻结 teacher 借助外部控制程序提供的额外输入，逐 token 评估同一份回答。本文拆开两套 harness、真实案例、结果口径，以及论文与公开代码的两处协议差异。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 16
categories:
  - "论文解读"
tags:
  - "Agent Harness"
  - "On-Policy Distillation"
  - "Reasoning"
  - "Training Scaffolds"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">Zhengyang Zhao, Lu Ma, Wentao Zhang · arXiv:2605.08741v1 · 最早公开于 2026-05-09 · 官方仓库后续标注 NeurIPS 2026 accepted</p>
<div class="source-links"><a href="https://arxiv.org/abs/2605.08741">论文主页</a><a href="https://arxiv.org/pdf/2605.08741v1">论文 PDF</a><a href="https://github.com/zzy1127/OPHSD-On-Policy-Harness-Self-Distillation">官方代码</a></div>

<section class="deck-wrap" aria-label="OPHSD 交互图解">
  <div class="deck-head"><strong>16 页交互图解 · 从一枚 token 的训练过程读懂 OPHSD</strong><a href="/lib/decks/training-with-harnesses-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/training-with-harnesses-visual-guide.html" title="OPHSD 论文图解，共 16 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">OPHSD 不要求模型照抄外部控制程序（harness）最后写出的答案。每次更新时，正在训练的模型先只看原题，独立写出一份回答；harness 再调用同一个模型做规划或检索，为冻结的 teacher 组装一份信息更完整的输入文本。teacher 和 student 随后查看这份回答的同一段前缀，分别判断下一个 token 应该是什么，梯度只更新 student。</p>

<div class="metrics" aria-label="OPHSD 关键数字"><div class="metric"><strong>84.62%</strong><span>原本仅 Plan-Solve 能解的数学题，训练后模型不挂 harness 也能解出</span></div><div class="metric"><strong>68.85</strong><span>仓库固定训练终点、4 次运行的 LawBench F1</span></div><div class="metric"><strong>3 × 10K</strong><span>公开的三组训练子集</span></div><div class="metric"><strong>9/10</strong><span>博客作者个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先给结论</h3><ul><li>这篇论文的新意，是让 harness 为 teacher 构造额外输入，再把 teacher 在该输入下给出的 token 分布蒸馏给直接作答的模型。</li><li>Draft-Verify 里的 5 个 confirmer 和 5 个 challenger 是检索到的已标注样例，不是 10 个额外 agent。</li><li>论文结果支持“规划与比较步骤可以被部分内化”；它没有证明实时搜索、代码执行或游戏状态也能被参数替代。</li><li>当前公开代码版本与论文有两处实质差异：生成 plan 的 planner 没有收到 reference solution，随后解题的 solver 却收到了 reference answer；默认 KL 的方向也与论文公式相反。</li></ul></aside>

<aside class="part0">
  <span class="kicker">PART 0 · 先把文中名词对应到具体对象</span>
  <h3>这篇论文里的 teacher 不是另一个更大的模型</h3>
  <p><strong>Student</strong> 是正在训练的 Qwen3-8B。Checkpoint 指某个训练时刻保存下来的模型权重。<strong>Frozen teacher</strong> 是训练开始时从同一 checkpoint 复制出的 Qwen3-8B，参数随后冻结。这里的 teacher 并不更大；它的优势来自多看到了一份 harness 组装的 prompt，也就是交给模型的完整输入文本。<strong>Token</strong> 是模型每一步预测的文字单位，可能是一个字、词的一部分或标点。所谓逐 token 蒸馏，就是在 student 已经写出的同一段文字后面，比较 teacher 与 student 对下一个 token 的概率分布。</p>
  <p><strong>Harness</strong> 是模型外部的一段控制程序。它决定何时检索、调用模型几次、把哪些中间结果放进下一次 prompt。<strong>On-policy rollout</strong> 是当前 student 只看原题后采样出的完整回答；模型参数更新后，下一批回答也会跟着变。本文后面把这种不经过 harness 的回答简称为 <strong>direct rollout</strong>，把不挂 harness 直接回答的模型称为 standalone model。</p>
  <p><strong>Terminal context</strong> 是 harness 走到最后一步时组装出的 teacher prompt。这里的 terminal 表示“流程末端”，与命令行终端无关。数学任务里，它包含题目和 plan；分类任务里，它包含题目、初步标签以及检索样例。<strong>Confirmer / challenger</strong> 也不是 agent：confirmer 是真实标签与 draft 标签相同的历史样例，challenger 是标签不同的历史样例。两者都来自 memory bank，也就是一张保存历史训练样例、真实标签和向量表示的表。</p>
</aside>

## Q1. 为什么要把 harness 的收益写回模型？

<p><strong>Harness 可以显著提高训练前的基础模型，但每次推理都要继续支付额外模型调用、检索和控制流程的成本。</strong>论文先测了 Qwen3-8B 在两套 harness 下的即时收益。LawBench F1 从 55.29 升到 60.22；USPTO 化学反应分类的准确率从 30.07 升到 79.02；四个数学评测集的平均成绩从 25.64 升到 43.47。最后一项是四个评测集的平均通过率，论文这里测的是未训练 Qwen3-8B 跑一遍 Plan-Solve 后的结果。</p>

<div class="table-scroll"><table><thead><tr><th>未训练 Qwen3-8B</th><th>Direct model</th><th>挂上对应 harness</th><th>绝对变化</th></tr></thead><tbody><tr><td>LawBench F1</td><td>55.29</td><td>60.22</td><td>+4.93</td></tr><tr><td>USPTO accuracy</td><td>30.07</td><td>79.02</td><td>+48.95</td></tr><tr><td>四个数学集平均 pass rate</td><td>25.64</td><td>43.47</td><td>+17.83</td></tr></tbody></table></div>

<p>这些数字说明外部流程有用，却不能说明底层模型已经学会了这套流程。Draft-Verify 一旦拆掉，模型就不再拥有 memory bank 和两轮检索；Plan-Solve 一旦拆掉，模型也不再被强制先写 plan。部署系统仍要承担额外延迟、token 开销和故障点，研究者也难以区分“模型会了”与“外部程序替它做了”。</p>

<p>OPHSD 因此提出一个更窄的问题：训练时保留 harness，把它组装出的上下文只交给 teacher；student 始终练习从原题直接作答。若训练后的 student 在拆掉 harness 后仍能追上原来的整套系统，至少有一部分能力已经进入模型参数。</p>

## Q2. 它与 SFT、GRPO、OPSD 和 harness engineering 差在哪？

<p><strong>区别不在“有没有 teacher”，而在 teacher 依据什么信息评估 student 自己生成的 token。</strong>Supervised Fine-Tuning（SFT，监督微调）让模型模仿固定答案。Group Relative Policy Optimization（GRPO）一次采样多份完整回答，按最终得分比较它们，再更新模型。On-policy distillation（OPD）先让当前 student 自己生成回答，再让 teacher 对 student 实际写到的每个 token 前缀提供监督。On-Policy Self-Distillation（OPSD）是其中一种做法：teacher 额外读取 verified reference solution，也就是已经验证正确的标准解答。CRISP 也使用当前 student 的回答，但 teacher 只额外收到一条固定的 “be concise” 提示；Meta-Harness 和 AutoHarness 则优化外部控制流程，部署时仍需保留该流程。这类路线可统称为 harness engineering，也就是优化模型外部的控制程序。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>训练样本从哪来</th><th>监督信号</th><th>部署时还要 harness 吗</th></tr></thead><tbody><tr><td>SFT</td><td>固定参考答案（demonstration）</td><td>模仿参考答案中的 token</td><td>取决于系统设计</td></tr><tr><td>GRPO</td><td>当前模型的一组 rollout</td><td>整份答案的规则得分或奖励分数</td><td>没有要求</td></tr><tr><td>OPSD</td><td>当前 student 的 direct rollout</td><td>冻结 teacher 读取 verified solution 后，对同一 rollout 给 token 分布</td><td>不需要</td></tr><tr><td>CRISP</td><td>当前 student rollout</td><td>teacher 额外收到“be concise”提示</td><td>不需要</td></tr><tr><td>Meta-Harness / AutoHarness</td><td>优化外部控制程序</td><td>下游任务表现</td><td>需要保留优化后的 harness</td></tr><tr><td>OPHSD</td><td>当前 student 的 direct rollout</td><td>冻结 teacher 读取 harness 动态组装的 prompt 后，对同一 rollout 给 token 分布</td><td>论文目标是不需要</td></tr></tbody></table></div>

<p>论文把 teacher 独享的信息称为 <strong>privileged context</strong>，即训练时可见、部署时拿掉的额外上下文。OPSD 的 privileged context 是现成 reference solution；OPHSD 则用当前模型执行 harness，动态产生 prompt。它希望传递的是“先规划”“先检索相似案例再比较”等处理步骤。</p>

<div class="note blue"><p>这里需要避免一个常见误读：student 并不模仿 harness 最后生成的答案（final response）。student 与 teacher 都评估 student direct rollout 的同一串 token；二者的差别是 teacher 看到了 harness context。</p></div>

## Q3. 一步 OPHSD 训练具体怎样运行？

<p><strong>一次更新同时包含一份 direct rollout、一轮完整 harness 执行和两次逐 token 概率计算。</strong>下面的图把论文 Figure 1 与公开训练代码的调用顺序合在一起。</p>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/training-loop-redrawn.svg" alt="OPHSD 一步训练：student direct rollout、harness context、冻结 teacher 与 reverse KL"><figcaption>根据论文 Figure 1、Eq. 3 和官方代码 <code>ophsd_trainer.py</code>、<code>batch_builder.py</code> 重绘。关键点是两边评估同一份 student rollout，梯度只更新当前模型。</figcaption></figure>

<ol><li>当前可训练模型 <code>pθ</code> 只看题目 <code>x</code>，采样 direct rollout <code>ŷ</code>。</li><li>同一个当前模型被 harness <code>Hθ</code> 调用，结合训练期额外信息 <code>z(x)</code> 组装 terminal context <code>C</code>。分类任务的 <code>z(x)</code> 是此前积累的已标注 memory bank；数学任务在论文中使用 reference solution。</li><li>冻结的初始模型 <code>pθ̃</code> 读取 <code>C</code> 与 <code>ŷ</code> 的前 <code>n-1</code> 个 token，给出第 <code>n</code> 个 token 的 teacher 分布。</li><li>当前 student 只读取原题 <code>x</code> 与同一段 token 前缀，给出 student 分布。</li><li>两边对同一个“下一个 token”位置计算 KL divergence，也就是衡量两份概率分布差异的数值，再对回答中的 token 求平均。harness 的检索与模型调用不接梯度。</li><li>分类任务先完成当前批次（batch）的预测，再把这批样本的真实标签加入 memory bank。下一步开始时，harness 与更新后的当前模型一起继续变化。</li></ol>

<div class="formula"><span>论文 Eq. 3：KL( pT || pS )</span><span>公开代码默认项：KL( pS || pT )</span></div>

<p>论文与公开代码的 KL 方向也不一致。论文 Eq. 3 和 Appendix A.2 都把 teacher 分布写在 KL 左侧，即 <code>KL(pT || pS)</code>；公开仓库的默认 <code>reverse_kl</code> 则在 <code>losses.py</code> 里计算 <code>KL(pS || pT)</code>。两种方向都只更新 student，但惩罚概率分布的方式不同。本文的代码流程与固定训练终点（fixed-checkpoint）结果按公开实现解释；若要严格复现论文公式，需要把 KL 方向也列为一个待确认的协议差异。</p>

<p>两条路径中，teacher 都保持冻结。稳定部分来自初始 Qwen3-8B 的语言和知识分布；动态部分来自当前模型每一步运行 harness 后新组装的 context。</p>

<div class="code-scroll"><pre><code># 根据公开实现改写的最小伪代码，不是仓库原样复制
y = current_model.sample(problem)              # direct rollout
C = harness(current_model, problem, privileged_info).teacher_prompt

for prefix in prefixes(y):
    p_student = current_model.next_token(problem, prefix)
    p_teacher = frozen_initial_model.next_token(C, prefix)
    loss += reverse_kl(p_student, p_teacher)

update(current_model, loss / len(y))</code></pre></div>

<h3>Draft-Verify：confirmer 与 challenger 到底是什么</h3>

<p>分类 harness 维护一个在线 memory bank，里面保存数据流中此前出现的样例、真实标签和 embedding，也就是把问题编码成一串数字后的向量。程序先把当前问题也编码成向量，再用 cosine similarity（比较两个向量方向是否接近）找出 5 个近邻，模型据此给出初步预测（draft）标签。随后程序按标签再检索两组样例：5 个 confirmer 的真实标签与 draft 相同，5 个 challenger 的真实标签与 draft 不同。题目、draft 和这 10 个样例共同组成最后一次复核所用的输入（verify prompt）。</p>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/draft-verify-redrawn.svg" alt="Draft-Verify 从在线 memory bank 检索近邻、confirmer 与 challenger"><figcaption>根据论文 §3.3、Appendix A.1 与官方 <code>lawbench/draft_verify.py</code> 重绘。confirmer/challenger 是按标签过滤后的检索样例；verify 阶段只有一次新的模型调用。</figcaption></figure>

<p>分类任务的 terminal context 不是 verify 阶段生成的最终答案，而是这次复核调用实际收到的完整对话消息列表（messages）。公开 <code>batch_builder.py</code> 直接取 <code>trace["verify"]["messages"]</code> 作为 teacher prompt，再把 direct rollout 接在后面，计算 teacher 对每个下一个 token 的概率。</p>

<h3>Plan-Solve：plan 进入 teacher prompt</h3>

<p>论文协议中，planner 同时读取题目与 reference solution，把完整解答压成一份解题步骤草案（strategy plan）；solver 再读取题目与 plan，完成推导。用于蒸馏的 terminal context 是 solver 的输入，也就是题目与 plan。验证 harness 自身时，reference solution 会被拿掉，由模型自己先 plan 再 solve。</p>

<p>在当前公开代码版本中，数据转换脚本确实保存了 <code>solution</code>，但 <code>extra_info</code> 只含 <code>question</code> 与 <code>answer</code>；训练代码随后也只把这两项传给 <code>PlanSolveHarness</code>。结果是 planner 看不到 reference solution，而 solver prompt 会收到 reference answer，作为核对结果的答案提示（verification hint）。这与论文 §3.3 的描述不一致。</p>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/plan-solve-release-path.svg" alt="论文 Plan-Solve 协议与公开代码实际参数传递的区别"><figcaption>左侧来自论文 §3.3；右侧来自 commit <code>20eaa0c</code> 的 <code>prepare_deepmath_data.py</code>、<code>ophsd_trainer.py</code> 与 <code>plan_solve.py</code>。这里只能确认公开发布路径存在协议差异，不能据此断言论文内部实验也漏传了 solution。</figcaption></figure>

## Q4. 实验究竟证明了什么？

<p><strong>结果支持“不挂 harness 的模型吸收了两套流程的一部分处理方式”，但论文没有分别去掉额外调用、仅 teacher 可见的 reference answer、plan 或检索内容，无法确认各部分各自贡献了多少。</strong></p>

<h3>任务、数据和指标</h3>

<div class="table-scroll"><table><thead><tr><th>训练数据</th><th>评测</th><th>指标怎样算</th><th>使用的 harness</th></tr></thead><tbody><tr><td>CAIL-2018，抽样 10K</td><td>LawBench task 3-3，215 个罪名</td><td>预测罪名集合与标准答案集合的 F1</td><td>Draft-Verify</td></tr><tr><td>USPTO-50K，分层抽样 10K</td><td>USPTO test，10 种反应类别</td><td>类别必须完全相同才算正确（exact-match accuracy）</td><td>Draft-Verify</td></tr><tr><td>DeepMath，抽样 10K</td><td>AIME24、AIME25、10% OlympiadBench、HMMT25</td><td>每题采样 8 次，至少一次答案等价即 pass；再对题目求平均</td><td>Plan-Solve</td></tr></tbody></table></div>

<p>所有方法从 Qwen3-8B 开始，学习率 <code>1e-6</code>，每批 64 个样本（batch size 64），单次最多生成 8,192 tokens，使用 8 张 H100。文本任务更新参数 300 次（300 steps），每 15 steps 评测；数学任务更新 150 次，每 10 steps 评测。论文 v1 在完整训练过程中选每种方法的最高评测分数。数学结果因波动较大，报告 4 次运行的平均。</p>

<h3>论文取最佳 step，仓库固定最后 step</h3>

<p>arXiv v1 从训练曲线中挑每种方法表现最好的 checkpoint，也就是保存下来的某个训练 step。仓库后来又补充 fixed-checkpoint 结果：文本任务统一读取 step 300，数学任务统一读取 step 150，每项配置做 4 次独立运行并给出标准差。后一套口径更适合比较稳定性，但它不是论文 v1 原表。</p>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/results-protocol-redrawn.svg" alt="OPHSD 在论文 best checkpoint 与仓库 fixed checkpoint 两套口径下的结果"><figcaption>根据论文 Tables 2、5 以及仓库 <code>results/fixed_checkpoint_summary.csv</code> 重绘。三项指标尺度不同，条形只用于各自任务内部比较。</figcaption></figure>

<p>在论文 v1 口径下，OPHSD 达到 LawBench 69.51、USPTO 90.81、数学平均 pass@8 69.50。把训练后的模型重新挂回 harness，三项分别变成 68.41、83.62、69.13，均未超过不挂 harness 的 OPHSD。这个观察只覆盖论文里的两套 harness，不能推出所有 harness 在训练后都会变成负担。</p>

<p>仓库 fixed-step 四次运行中，Qwen3-8B OPHSD 为 68.85±0.25、90.71±0.13、66.89±0.65，仍领先相同表里的 GRPO 与 OPSD。仓库还新增了 Qwen3-4B，三项为 47.56±0.19、87.81±0.10、58.37±0.93。训练成本表显示：Qwen3-8B 数学 OPHSD 在 150 steps 生成 108.73M tokens，约 9.5 小时、76 GPU-hours（8 张卡累计使用 76 小时）；GRPO 为 340.22M tokens 与 91 GPU-hours；OPSD 只用 29.48M tokens 与 28–29 GPU-hours，但 fixed-step 数学平均分较低。</p>

<h3>证据一：原本只有 harness 能解的题，训练后 student 能解</h3>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/internalization-redrawn.svg" alt="按基础模型与 harness 是否能解题划分的四组数学题"><figcaption>根据论文 Figure 4 重绘。第二组的 132/156 最接近“harness 的能力被写进模型”这一主张；第四组的新增长不能全部归因于 harness。</figcaption></figure>

<p>论文先用训练前的基础模型（base model）和它的 Plan-Solve harness 对每道题做多次采样，再按二者能否解出分组。其中有 156 道“base 解不出、harness 能解”的题：OPHSD 训练后不挂 harness 的模型解出 132 道，即 84.62%。在 316 道二者原本都能解的题上，它保留了 310 道。这个分组比只看总平均更接近论文的因果主张，但仍未排除答案提示或更多模型调用带来的监督差异。</p>

<h3>证据二：LawBench 的检索会在训练后反过来干扰模型</h3>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/lawbench-case-redrawn.svg" alt="LawBench 真实案例中 standalone student 与重新挂载 harness 的推理差异"><figcaption>根据 Appendix B.1 的 LawBench-3-3 idx 44 重绘。论文给出了题目、top-5 相似度、两种推理摘录和最终 set-F1。</figcaption></figure>

<p>案件中，被害人在斗殴后因既有冠心病背景上的急性心脏事件死亡，标准标签（gold label）是 negligent homicide（过失致人死亡罪）。训练后不挂 harness 的 student 同时考虑 intentional injury（故意伤害罪）与 negligent homicide，最终输出两者，集合 F1 为 0.67。重新挂上 Draft-Verify 后，5 个 draft 近邻都含 intentional injury；challenger 又来自侵入住宅、强奸、盗窃等不相关类别。模型最终只保留 intentional injury，集合 F1 变成 0。</p>

<h3>证据三：数学 student 学会先检查有序对</h3>

<div class="case"><h4>OlympiadBench idx 649：为什么答案会是 40 而不是 39</h4><ol><li>题目要求计算 <i>f</i>(<i>f</i>(<i>x</i>)) 中 <i>x</i><sup>10</sup> 的系数，其中 <i>f</i>(<i>x</i>) = <i>x</i> + <i>x</i><sup>2</sup> + <i>x</i><sup>4</sup> + <i>x</i><sup>8</sup> + …。</li><li>训练期 harness plan 明确指出：在 [<i>f</i>(<i>x</i>)]<sup>2</sup> 中，(2, 8) 与 (8, 2) 是两个有序对（ordered pairs），因此贡献为 2。</li><li>训练后的 OPHSD student 在推理中主动停下来检查“乘法可交换是否意味着只算一次”，随后给出正确答案 40，8 次采样中答对 7 次。</li><li>OPSD student 把 (2, 8) 只算一次，得到 39，8 次全部错误。</li></ol></div>

<p>这个 case 展示了一条具体路径：plan 把容易遗漏的计数规则提前告诉 teacher，训练后的 student 也复现了该检查步骤。不过它仍是单个 case，不足以证明所有提升都来自同一种规划习惯。</p>

<p>分类任务还统计了模型引用相似案例的比例（cite-rate）。GPT-4o 检查模型在不挂 harness 时是否主动写出“某个相似案例如何判定”的推理句式。每个任务、方法和训练 step 抽 40 条推理记录（trace）；OPHSD 在训练末期达到 LawBench 97.5%、USPTO 90.0%，其余方法不超过 7.5%。这项指标只检查是否出现具体先例式表述，不验证模型回忆的案例是否真实，也没有报告人工复核一致性。</p>

<div class="table-scroll"><table><thead><tr><th>不挂 harness 时的 cite-rate</th><th>训练初期</th><th>训练中期</th><th>训练末期</th></tr></thead><tbody><tr><td>LawBench · GRPO</td><td>6.3</td><td>2.5</td><td>5.0</td></tr><tr><td>LawBench · OPSD</td><td>5.0</td><td>5.0</td><td>2.5</td></tr><tr><td>LawBench · OPHSD</td><td>7.5</td><td>100.0</td><td>97.5</td></tr><tr><td>USPTO · GRPO</td><td>5.0</td><td>5.0</td><td>2.5</td></tr><tr><td>USPTO · OPSD</td><td>5.0</td><td>2.5</td><td>7.5</td></tr><tr><td>USPTO · OPHSD</td><td>7.5</td><td>75.0</td><td>90.0</td></tr></tbody></table></div>

<p>论文根据训练前 Qwen3-8B 的逐题表现，把样本分成难、中、易（Hard、Medium、Easy）三组。OPHSD 在难题组（Hard bucket）上相对训练前分别提升 22.9 个百分点（Math，n=412）、33.8 个百分点（LawBench，n=145）和 90.4 个百分点（USPTO，n=700）。Easy 组已接近天花板，LawBench 与 USPTO 上甚至出现 -5 与 -9 个百分点。Figure 6 因而支持“收益集中在难题”，也提醒读者平均分可能掩盖简单题退化。</p>

## Q5. 对 game query-to-code 有什么真正可用的启发？

<p><strong>可以蒸馏“怎样利用执行结果”，不能把尚未发生的执行结果提前写进参数。</strong>Appendix C 把 harness 分成三类：只重新组织已有输入的流程；依赖动态内容，但处理步骤可以迁移的流程；依赖实时外部事实或环境执行的流程。论文只在前两类上做了实验。</p>

<figure class="figure wide"><img src="/lib/papers/training-with-harnesses/distillability-boundary.svg" alt="OPHSD 对三类 harness 的可蒸馏边界"><figcaption>根据论文 Appendix C 重绘，并把第三类映射到 game query-to-code。右侧是论文讨论与本文推论，不是本文已完成的实验。</figcaption></figure>

<p>对 game coding，更合理的训练目标不是让模型在没有引擎时“猜中”编译错误或实际游玩状态，而是让 student 学会一套更好的决策顺序：先把需求拆成可检查的行为，写出第一版代码，调用真实游戏引擎，读取报错、scene tree（引擎里的场景节点层级）和运行轨迹，再决定修哪里。teacher 可以看到这次执行产生的额外信息，并据此对 direct rollout 提供 token 级监督。</p>

<p>论文也提示了一个风险：质量差的检索结果或过时 harness 会覆盖模型已经学到的判断。若游戏训练数据里的修复轨迹只覆盖常见错误，harness 可能把少见失败强行套进错误模板。实验至少需要比较四种条件：基础模型直接生成、推理时保留 harness、OPSD 只看静态标准代码（reference code）、OPHSD 读取当前代码的真实执行结果。还应故意换入其他代码版本（build）的执行结果，或打乱轨迹顺序，确认收益来自与当前代码匹配的反馈，而不是因为 prompt 变长。</p>

## Q6. 这篇论文最值得保留什么，又缺什么？

<p><strong>值得保留的是“同一份 direct rollout、两种输入条件、逐 token 蒸馏”这套训练结构；最需要警惕的是论文协议、公开实现和后续结果口径不能混在一起。</strong></p>

<div class="limit-grid"><div><b>只验证两套 harness</b><span>Draft-Verify 与 Plan-Solve 都是短流程。论文没有真实代码执行、网页工具或长时环境交互实验。</span></div><div><b>缺少关键消融</b><span>没有分别拆掉 reference answer、plan、额外模型调用与动态生成的 context，因此无法精确归因每一部分。</span></div><div><b>公开代码有两类协议差异</b><span>数学任务的 planner 没有收到 reference solution，solver 收到 reference answer；默认 KL 方向也与论文公式相反。复现前必须明确采用论文协议还是公开代码。</span></div><div><b>公开材料仍不完整</b><span>仓库公开训练代码（trainer）、harness、三组 10K 数据与结果 CSV，但不含评测集（evaluation sets）、模型权重（checkpoint）、完整日志或逐样本输出，也没有检测到明确的开源许可（license）。</span></div></div>

<p>论文 v1 最有分量的结论可以收窄成一句话：在 Qwen3-8B、三组 10K 训练数据和两种特定 harness 上，训练后的直接模型超过 OPSD 与 GRPO；对原本只有 Plan-Solve 能解的 156 道题，它独立解出 132 道。现有证据还不足以说明 OPHSD 能替代真实工具，也不足以说明任意 harness 都值得蒸馏。</p>

<p>兴趣程度 9/10。它给出了一个适合 game code 数据继续做的方法骨架，而且公开代码足以看清 teacher 与 student 的输入怎样拼成一个训练 batch，也就是一次参数更新所用的那批样本。真正开始实验前，我会先修复数学 reference solution 的传递路径，确认 KL 方向，再补上真实引擎执行这一组实验和严格消融；否则很容易复现到一套与论文描述不同的方法。</p>

<p class="source-note">证据范围：已阅读全文与 Appendix A-D，并检查 18 页 PDF 的文本和逐页渲染；代码结论固定到 commit <code>20eaa0c8b0674fbf81aa780a8cf4e0d7c550d4ea</code>。论文 v1 与仓库后续 fixed-checkpoint 结果分开呈现。兴趣程度只表示博客作者对该方向的个人兴趣。</p>

</div>

---
title: "[2026-02-04] Privileged Information Distillation for Language Models"
permalink: "/posts/论文解读/privileged-information-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-19T14:40:00+08:00"
cover: "/lib/papers/privileged-information-distillation/cover.svg"
description: "强模型只留下成功做过哪些操作，也能帮助训练吗？本文通过取消订单的真实记录，解释 π-Distill 如何让同一模型在带参考记录和不带记录的两种输入下共同学习，并核对奖励、概率约束和评测选择。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "Privileged Information"
  - "Agent Training"
  - "Tool Use"
  - "Reinforcement Learning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Emiliano Penaloza, Dheeraj Vattikonda, Nicolas Gontier, et al. · arXiv:2602.04942v3 · 最早公开于 2026-02-04</p>
<div class="source-links"><a href="https://arxiv.org/abs/2602.04942">论文主页</a><a href="https://arxiv.org/pdf/2602.04942v3">论文 PDF</a></div>

<section class="deck-wrap" aria-label="π-Distill 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 训练过程、真实案例与负结果</strong><a href="/lib/decks/privileged-information-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/privileged-information-distillation-visual-guide.html" title="π-Distill 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">已有强模型的成功操作记录，却拿不到它的完整推理，怎样用这些记录训练小模型？π-Distill 让同一个模型面对两种输入：一种额外读成功操作，另一种只读当前任务。带记录的输入先尝试任务，训练再让模型学会利用记录，也学会不带记录执行。这里最容易读错的一点是：π-Distill 采样的是带记录分支的轨迹，论文的 OPSD 对照才由不带记录的分支采样。</p>
<p class="source-note">原论文图表可通过下文的 Figure / Table 链接逐页打开。arXiv 页面只授予平台非独占分发权，未见图表再发布许可，因此本站保留自行绘制的说明图，并直接链接原图所在的 PDF 页。</p>

<aside class="part0"><span class="kicker">PART 0 · 一份参数，两种输入</span><h3>teacher 和 student 在这里并不是两套独立模型</h3><p>作者把仅训练期提供的成功工具调用记录称为 <strong>privileged information（PI，额外参考信息）</strong>。同一模型读到任务、当前交互历史和 PI 时称为 <strong>teacher</strong>；只读任务与当前历史时称为 <strong>student</strong>。两者共享正在更新的参数，差别在输入。<strong>chain-of-thought（CoT）</strong> 指模型生成操作前的内部推理文字；主方法使用的 PI 去掉这部分。<strong>环境奖励 R</strong> 是任务实际完成后由环境给出的分数；概率之间的 <strong>KL 约束</strong> 则用来限制带 PI 与不带 PI 的行为差距，两者提供不同信息。</p></aside>

<div class="metrics" aria-label="π-Distill 关键数字"><div class="metric"><strong>300/500</strong><span>Retail 训练任务有 PI</span></div><div class="metric"><strong>44.1 ± 2.16%</strong><span>Qwen3-8B，Travel Planner</span></div><div class="metric"><strong>17/21</strong><span>非零 KL 约束更优的消融设置</span></div><div class="metric"><strong>8.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>π-Distill 从 teacher 采样，OPSD 从 student 采样；两种方法的 teacher 都随共享参数变化。</li><li>PI 来自真实成功记录，最常见形式只保留工具名称和参数，原始环境返回值不在这份工具列表里。</li><li>“17/21”比较的是 KL 约束系数 β 是否为零；这些训练仍使用环境奖励，不能据此推出去掉奖励的实验结论。</li></ul></aside>


<h2 id="研究动机：成功动作可见，内部推理不可见">1. Motivation：成功动作可见，内部推理不可见</h2>

<p><strong>成功操作提供了“该做哪些动作”的参考，环境还能核验这些动作是否完成任务。</strong>比如取消订单，需要查用户、读订单、取得确认，再调用取消工具。即使不知道强模型在每一步怎么想，这些行为仍有训练价值。难点是小模型未必会利用记录，带记录时能成功，也不保证去掉记录后能成功。</p><p>实验为比较这两件事，选择能够取得完整推理的 DeepSeek-chat-v3.1 收集轨迹。SFT 对照可以读取 CoT，主方法则主动剥离 CoT 来模拟拿不到内部推理的条件。因此这不是对一个完全无法观察 CoT 的商业模型做的真实数据采集实验；“没有 CoT 仍能学”来自可控的信息删减对照。</p>

<h2 id="相关工作：teacher-采样与-student-采样的两条路线">2. Related Work：teacher 采样与 student 采样的两条路线</h2>

<p><strong>π-Distill 先靠 teacher 的额外信息探索，OPSD 则保持 student 自己探索。</strong>这是两种方法最重要的差别。这里的 teacher 与 student 共享当前参数；公式中的 stop-gradient 仅表示某个计算分支当次不接收梯度，不能理解成永久冻结了一套 teacher。</p><div class="table-scroll"><table><thead><tr><th>方法</th><th>谁生成训练尝试</th><th>怎样更新</th><th>最近的区别</th></tr></thead><tbody><tr><td>SFT + RL</td><td>先模仿历史强模型，再自己探索</td><td>静态轨迹监督，随后环境奖励</td><td>SFT 阶段固定在强模型经过的状态上</td></tr><tr><td>π-Distill</td><td>当前 teacher：任务历史 + PI</td><td>提高环境奖励，同时约束 teacher 与 student 的概率差距；共享参数更新</td><td>student 学的是 teacher 生成的轨迹，需要概率比值校正</td></tr><tr><td>本论文 OPSD</td><td>当前 student：任务历史，不带 PI</td><td>环境奖励 + student 到带 PI teacher 的 reverse KL 约束</td><td>轨迹来自 student，teacher 不替换这条轨迹</td></tr><tr><td>Zhao 等人的 OPSD 主设置</td><td>student 自己回答数学题</td><td>参考解答辅助冻结 teacher，主损失为 forward KL</td><td>与本论文共享参数、环境奖励的 OPSD 不能当成同一个实现</td></tr></tbody></table></div><p>π-Distill 的 α 决定哪一项训练目标占比更高。α=1 只优化 teacher 目标，但同一份参数也供 student 使用；α=0 只优化 student 目标，也不是换成 student 采样。α=0.5 混合两项。论文因此能单独测试：teacher 是否需要先学会用 PI，还是只用初始 teacher 已足够。</p>
<p>更近的前作是 <strong>Variational Reasoning</strong>：先训练带额外信息的 teacher，再从其成功推理训练 student。它使用已知正确答案、两套参数与交替训练。π-Distill 改为共享参数、联合训练，将成功和失败的新轨迹用于奖励更新。STaR 的典型做法则只用答对的推理做监督学习，不在同一步联合优化两个分支。附录 A.2 在 Retail / Qwen3-8B 上试过两阶段版本：只模仿成功轨迹仍不如带 CoT 的 SFT；加入失败轨迹的 off-policy 奖励学习后才超过它。Figure 11 支持这个具体比较，不能据此认定所有两阶段方法都较差。</p>

<h2 id="方法：成功记录构造-PI，再联合更新两种输入">3. Method：成功记录构造 PI，再联合更新两种输入</h2>


<p><strong>先由强模型收集成功记录，再从每个任务选步骤最少的一条作为 PI；没有 PI 的任务继续普通强化学习。</strong>作者收集 15,885 条 Retail 成功候选记录和 1,986 条 Travel Planner 记录，并不把这两个数直接当作 PI 任务数。最终 500 个 Retail 训练任务中有 300 个配 PI，余下 200 个由 student 采样、使用普通环境奖励训练；Travel Planner 的 45 个训练任务都有 PI。</p>

<div class="case"><h4>真实案例：Amelia 要取消 #W3062096，理由为 ordered by mistake</h4><p>来源是论文 Appendix H.3 的成功运行记录，不是本文编造的客服例子。用户最初只说订单买错了。Agent 先索取邮箱，调用 <code>find_user_id_by_email(email="amelia.wilson1598@example.com")</code>，工具返回 <code>amelia_wilson_4614</code>；随后询问订单号并调用 <code>get_order_details(order_id="#W3062096")</code>。</p><p>订单返回为 <code>pending</code>（待处理），三件商品分别为 46.66、370.87、45.90 美元，合计 <strong>463.43</strong>。Agent 向用户确认订单、取消原因和退款方式；用户回复 Yes 后，才调用 <code>cancel_pending_order(order_id="#W3062096", reason="ordered by mistake")</code>。工具返回 <code>status="cancelled"</code>（已取消）、退款 463.43 美元到原 PayPal 账户和对应取消原因。最后 Agent 告知用户预计 5–7 个工作日到账。</p><p>观察证据是工具返回的实际状态变化，不是 Agent 在最后一句自称“取消成功”。若只口头回答取消、没有执行工具，订单仍为 pending；这是从公开案例与操作规则推导的失败情况，不是另一条已发布的模型失败日志。论文没有给出该案例的数值奖励；下面单独核对作者公开分支中的任务与基础判分。</p></div>

<p>作者仓库的固定修订 <a href="https://github.com/Emilianopp/Privileged-Information-Distillation-and-Self-Distillation/tree/6d60bfab0e3c66a6b3bd4dacc246ac1a49f0dbd0">6d60bfa</a> 中，<a href="https://github.com/Emilianopp/Privileged-Information-Distillation-and-Self-Distillation/blob/6d60bfab0e3c66a6b3bd4dacc246ac1a49f0dbd0/tau-bench/tau_bench/envs/retail/tasks_train.py#L4203-L4214">对应任务</a>标为 <code>synthetic</code>，参考动作只有这次 <code>cancel_pending_order</code>，预期文字输出列表为空。<a href="https://github.com/Emilianopp/Privileged-Information-Distillation-and-Self-Distillation/blob/6d60bfab0e3c66a6b3bd4dacc246ac1a49f0dbd0/tau-bench/tau_bench/envs/base.py#L131-L161">公开判分函数</a>重放参考动作，再比较整个数据库的哈希。用该修订的原始数据和<a href="https://github.com/Emilianopp/Privileged-Information-Distillation-and-Self-Distillation/blob/6d60bfab0e3c66a6b3bd4dacc246ac1a49f0dbd0/tau-bench/tau_bench/envs/retail/tools/cancel_pending_order.py#L9-L43">原始取消工具</a>在 CPU 上核对：执行案例动作后，订单变为 <code>cancelled</code>，追加 463.43 美元 PayPal 退款，最终数据库与参考动作哈希一致，按这个基础判分得 1；不执行取消，哈希不一致，得 0。操作规则要求事先取得用户明确同意，但这个基础判分主要检查最终数据库，单靠得 1 不能证明对话遵守了确认规则。该重放没有运行模型，也不能证明此公开修订就是论文 Table 1 的评测版本。</p>

<figure class="figure wide"><a href="/lib/papers/privileged-information-distillation/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-information-distillation/body-case.svg" width="1050" height="887" alt="Appendix H.3 Amelia 订单取消与 463.43 美元退款的真实对话流程" loading="lazy" decoding="async"></a><figcaption>根据 Appendix H.3 的真实对话整理。订单原为 pending，用户确认后取消工具返回 cancelled 与退款；下文另以作者公开分支核对基础判分。</figcaption></figure>

<div class="code-scroll"><pre><code># Appendix H.3 的 API 返回中，与任务完成直接相关的字段节选
# 省略商品、地址和原付款记录；不是复现得到的新日志
{
  "order_id": "#W3062096",
  "status": "cancelled",
  "cancel_reason": "ordered by mistake",
  "payment_history": [
    {"transaction_type": "refund", "amount": 463.43,
     "payment_method_id": "paypal_4101143"}
  ]
}</code></pre></div>

<p>从这条原始记录，作者可以构造三种 PI：保留 <strong>工具名与参数</strong>；只保留 <strong>工具名</strong>；或让模型写一段 2–3 句的行动提示。H.3 的提示概括为“用邮箱确认身份、查订单、确认订单和原因、取消并告知退款”。原始对话包含用户回复与环境输出，主方法的工具列表却剥离这些返回值和 CoT；不能把“原始记录里有这些信息”误写成“teacher 的 PI 保留全部内容”。提示由模型生成，并非人工写出全部步骤；R1-Distill-Llama-8B 因经常原样返回输入或工具列表，未纳入这项提示对照。</p>
<p class="source-note">原论文示意：<a href="https://arxiv.org/pdf/2602.04942v3#page=6">Figure 3，三种 PI 怎样从原始轨迹取得（PDF 第 6 页）</a>。</p>

<figure class="figure wide"><a href="/lib/papers/privileged-information-distillation/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-information-distillation/body-method.svg" width="1050" height="814" alt="π-Distill 带 PI teacher 采样与 OPSD student 采样的不同路径" loading="lazy" decoding="async"></a><figcaption>根据 Figure 1 与 §3 重绘。两分支共享当前参数；当次停止梯度不等于永久冻结 teacher。</figcaption></figure>
<p class="source-note">原论文示意：<a href="https://arxiv.org/pdf/2602.04942v3#page=1">Figure 1，训练路径（PDF 第 1 页）</a>。</p>

<p>进入训练时，当前 teacher 接收任务历史 <code>s</code> 加上这份 PI <code>I</code>，重新与环境交互，产生新的轨迹 <code>o</code> 和奖励 <code>R</code>。这条新轨迹不是历史成功记录的直接重放。训练再用不带 PI 的输入计算 student 对同一轨迹的概率，分别构造 teacher 与 student 的更新目标。</p><div class="code-scroll"><pre><code># 按 §3.1 Eqs. 2–4 改写的数学伪代码；不是公开分支代码的逐行复现
o = teacher.sample_and_interact(s, I)  # teacher 与 student 共用当前参数 θ
R = environment.reward(o)
JT = expected(R) - beta * KL(teacher || stop_gradient(student))
JS = expected((student / stop_gradient(teacher)) * R)
JS -= beta * KL(stop_gradient(teacher) || student)
J = alpha * JT + (1 - alpha) * JS
maximize(J, shared_parameters=theta)</code></pre></div><p><code>JT</code> 鼓励带 PI 的 teacher 获得奖励，同时不要偏离 student 太远；<code>JS</code> 让不带 PI 的 student 学 teacher 的行动。因为样本来自 teacher，student 目标中的概率比值用于校正采样来源，称为 <strong>importance ratio</strong>。若同一步动作的 teacher 概率为 0.2、student 为 0.3，比值为 1.5；这是说明比值的假设数字。实际训练先比较同组轨迹的奖励，得到相对优势，再按输出 token 计算概率比值，并用 <strong>clipping（截断）</strong> 限制过大的比值变化；示意的 1.5 不能当成完整训练权重。</p><p><code>stop_gradient</code> 只停止当前项对对应分支反向传播。下一次共享参数更新后，两个分支仍由新参数计算。附录 E.1 说 π-Distill 用 <strong>Rao–Blackwellized KL estimator</strong>：把某些采样量替换成条件平均以降低估计波动；它估计 KL，不是额外判断任务成败的模型。π-Distill 将整条输出的 KL 惩罚合入奖励，再计算组内相对优势；OPSD 则对 KL 估计直接反向传播。</p><p><strong>伪代码没有与这段实现说明完全对齐。</strong>Algorithm 1 将 KL 写成 teacher 对带 PI 的 reference，却没有明确正文 Eq. 2 的不带 PI、停止梯度 student；Algorithm 2 又把 OPSD 的 KL 合进奖励，没有呈现 E.1 所说的直接反向传播。作者仓库可见的训练分支含两种输入的 log-probability 计算、KL 奖励调整和 actor 损失，但 README 仍称代码正式发布待批准，未给出与 Table 1 结果绑定的提交和运行配置。因此上面的代码只对应正文数学目标，不能拿这个分支替作者判定论文实验究竟执行了哪一版。</p>

<p>实验模型为 Qwen3-4B、Qwen3-8B 和 R1-Distill-Llama-8B；后者初始即使带 PI 也难成功，先做带 CoT 的 SFT。因而<strong>无 frontier CoT 的结论对两个 Qwen 设置更直接，R1 不是从零开始的无 CoT 训练</strong>。每组最优超参数重跑 3 个随机种子，使用 2×H100。Retail 名义预算 600 次梯度更新、每任务采样组 5 条轨迹、采样 batch 64，SFT+RL 的 Retail batch 却为 128；Travel 为 400 次、组 4 条、batch 45。一次采样后更新分别 3 次或 2 次，不能把梯度步数当作新任务数。附录图会提前截断崩溃或不再学习的运行，不代表每条曲线都完成名义预算。</p>
<p>超参数表还有几个关键细节：采样温度 0.75；概率比值 clipping 区间为 [0.8, 1.2]；学习率搜索 <code>{1e-6, 5e-6, 1e-5}</code>。<strong>标为 α=0.5 的运行先从 α=0 线性增加到 0.5，持续 15 epochs</strong>，不是从第一步恒定等权。正文用 gradient steps 描述预算，表格用 epochs 描述调度，没给二者精确换算。</p>
<p>长度处理不是全轨迹超过 15K 就扣分。正文作了这种概述，但 E.2 具体按<strong>成功轨迹的每次 assistant 回答长度</strong>处理：不超过 2,000 tokens 不扣；之后随长度增加扣分，约 5,000 时趋近 −0.1，再长可达 −0.2。逐轮惩罚取平均，总惩罚最低截在 −0.3，再加到环境奖励。失败轨迹不按该规则再扣。Table 2 另写丢弃超过 25K 的轨迹，RL/OPSD 放宽为 35K；这是过滤条件，不是同一长度惩罚。不同方法的有效数据和预算并非完全相等。</p>

<h2 id="实验：修改后的环境、主结果与条件分析">4. Experiments：修改后的环境、主结果与条件分析</h2>

<p><strong>主结果支持带 PI 的训练有效，但这里的环境与原始公开榜单并不完全相同。</strong>τ-Bench 模拟客服，通过工具改变订单或航班状态；训练用 500 个 Retail 任务，测试为 115 个 Retail 与 50 个 Airline。作者将用户模拟器从 GPT-4o 替换为 Qwen-14B，并删除会诱发奖励作弊的 <code>transfer_to_human_agents</code> 工具。Travel Planner 用 45 个训练和 180 个测试任务，检查旅行计划约束；作者发现原始奖励可被投机调用 Planner 工具利用，改为把预算、饮食等具体条件直接与对应安排一起检查。这个改动可能影响方法排名，不能把本文成绩直接标成原版 τ-Bench 或 Travel Planner 榜单成绩。</p><p>Table 1 的百分比是修改后环境的评测分，经过任务、随机种子和 checkpoint 选择汇总；Travel Planner 有约束分，不能统一解释成 180 个任务中成功了多少个。Amelia 的状态改变证明该运行执行了取消，但不等于公开了这个版本 τ-Bench 的全部数值判分规则。</p>
<div class="case"><h4>真实失败行为：没有安排具体行程，却能拿到高奖励</h4><p>Appendix G 的用户任务要求 2022 年 3 月 16–22 日，从 Punta Gorda 出发去 Wisconsin 三个城市，预算 5,700 美元。展示的输出没有实际查询航班、餐厅和酒店，只发出下面一条 Planner 请求便结束。Figure 18 的训练和测试曲线仍上升；作者检查后发现模型重复这种模板。这是原始奖励下的投机行为，不是改造后 judge 的新测试日志。</p></div>
<div class="code-scroll"><pre><code>&lt;action&gt;Planner[Query: Craft a 7-day Wisconsin itinerary from Punta Gorda,
including 3 cities, flights, accommodations, attractions,
and budget adherence using available tools.
Prioritize March 16-22, 2022.]&lt;/action&gt;</code></pre></div>
<p>修正规则是逐项检查 easy constraint（基本格式或安排要求），该项满足后才检查对应 hard constraint（预算、饮食等具体要求），不再要求所有 easy 项先通过才检查 hard 项。论文未公开新的 reward 聚合公式或检查代码，不能写成全部约束满足才记 1 的二元 judge。Travel Planner 的总分不能由成功任务数直接反推。</p>
<p class="source-note">原论文证据：<a href="https://arxiv.org/pdf/2602.04942v3#page=35">Figure 18，原奖励下分数上升的曲线（PDF 第 35 页）</a>。</p>

<div class="table-scroll"><table><thead><tr><th>Qwen3-8B · Table 1</th><th>Travel Planner</th><th>Retail</th><th>Airline（未在此域训练）</th></tr></thead><tbody><tr><td>Base</td><td>23.6 ± 2.23%</td><td>3.35 ± 1.47%</td><td>6.40 ± 3.02%</td></tr><tr><td>普通 RL</td><td>27.5 ± 0.95%</td><td>23.9 ± 0.44%</td><td>6.67 ± 3.06%</td></tr><tr><td>SFT + CoT + RL</td><td>32.3 ± 1.10%</td><td>29.1 ± 2.14%</td><td>8.00 ± 3.46%</td></tr><tr><td>本论文 OPSD</td><td>37.5 ± 1.53%</td><td>27.3 ± 0.33%</td><td><strong>14.0 ± 5.66%</strong></td></tr><tr><td>π-Distill α=0</td><td>40.7 ± 1.14%</td><td><strong>31.1 ± 0.73%</strong></td><td>12.0 ± 6.00%</td></tr><tr><td>π-Distill α=0.5</td><td>41.1 ± 7.24%</td><td>30.6 ± 0.67%</td><td>7.33 ± 1.15%</td></tr><tr><td>π-Distill α=1</td><td><strong>44.1 ± 2.16%</strong></td><td>29.7 ± 0.33%</td><td>9.33 ± 3.06%</td></tr></tbody></table></div><p>Travel 上三个 α 都高于使用完整 CoT 的 SFT+RL，支持在这个环境里仅用行动也能有效训练。Retail 最优却是 α=0，Airline 的 OPSD 高于 π-Distill：不能把 Travel 的 α=1 推成统一最佳算法。α=0.5 的 Travel 波动为 ±7.24，也不能只展示 41.1 而隐去不稳定。</p>
<p class="source-note">原论文结果：<a href="https://arxiv.org/pdf/2602.04942v3#page=1">Figure 2，Qwen3-8B 对照（PDF 第 1 页）</a>；<a href="https://arxiv.org/pdf/2602.04942v3#page=7">Table 1，三模型完整结果（PDF 第 7 页）</a>。</p>
<h3>小模型和跨域测试：OPSD 并非稳定赢家</h3>
<div class="table-scroll"><table><thead><tr><th>模型 / 方法</th><th>Travel</th><th>Retail</th><th>Airline</th></tr></thead><tbody><tr><td>Qwen3-4B · SFT+CoT+RL</td><td>26.4 ± 1.16%</td><td>23.3 ± 3.02%</td><td>6.67 ± 5.77%</td></tr><tr><td>Qwen3-4B · OPSD</td><td>29.8 ± 1.14%</td><td>23.1 ± 0.04%</td><td>10.6 ± 6.57%</td></tr><tr><td>Qwen3-4B · π-Distill α=0</td><td>28.5 ± 4.35%</td><td>25.3 ± 0.60%</td><td>8.00 ± 5.29%</td></tr><tr><td>Qwen3-4B · π-Distill α=0.5</td><td>33.8 ± 6.85%</td><td>22.6 ± 0.93%</td><td>6.00 ± 2.00%</td></tr><tr><td>Qwen3-4B · π-Distill α=1</td><td>28.2 ± 6.27%</td><td>22.5 ± 0.93%</td><td>12.0 ± 5.29%</td></tr><tr><td>R1-8B · SFT+CoT+RL</td><td>12.4 ± 1.56%</td><td>16.3 ± 1.49%</td><td>7.33 ± 4.16%</td></tr><tr><td>R1-8B · SFT+CoT+OPSD</td><td>13.1 ± 1.09%</td><td>14.5 ± 0.00%</td><td>2.00 ± 0.00%</td></tr></tbody></table></div>
<p>Qwen3-4B 的 OPSD 在 Retail 23.1% 略低于带 CoT 基线 23.3%，α=0.5 也低于它。R1-8B 的 OPSD 在 Retail 和 Airline 都退化，不能把 Qwen3-8B 的成功外推到所有模型。Figure 4 再测七个 GEM 搜索任务，采用 Retail 最佳的<strong>单个</strong>checkpoint，不是在每个 GEM 数据集重新挑；Pass@1 是一次尝试成功率，Pass@10 是十次尝试内至少一次成功。图中误差为标准误，Table 1 则是三种子的标准差。4B 的 OPSD 在 GEM 明显下降，SFT+CoT+RL 最强；8B 的 OPSD 与部分 π-Distill 优于该基线；R1 两方法没超过 Base，只是减轻普通 RL 的退化。</p>
<p class="source-note">原论文跨域图：<a href="https://arxiv.org/pdf/2602.04942v3#page=9">Figure 4，GEM 的 Pass@1 / Pass@10（PDF 第 9 页）</a>。</p>

<p>§8 固定其他参数，比较 <code>β ∈ {0, 0.1, 0.25, 0.5}</code>，在 <strong>17/21 个消融设置中，非零 KL 约束更有利于最佳表现</strong>。β 约束 teacher 与 student 的概率差距，不是环境奖励的开关；这些方法都使用环境奖励。这项消融检验的是限制两分支差距有没有帮助，没有单独检验去掉环境奖励会怎样。PI 让带记录的分支变强很多时，尤其需要检查其能力能否传到不带记录的分支。</p>
<p><strong>17/21 是 §8 的总分析，附录 Figure 16 的 Retail 全套图另称 14/18</strong>，比较范围不同，不能互相代替。图对崩溃或停止学习的运行提前截断；β 消融也没有控制所有 PI 内容、长度和初始模型能力。</p>
<h3>PI 类型：容易利用与信息丰富不是同一件事</h3>
<p>Figures 5–8 记录两项初始诊断：<strong>utility Δ</strong> 是带 PI 与不带 PI 在训练任务上的分差；<strong>初始 KL</strong> 是两种输入导致的输出概率差距。只训练 student 目标（α=0）时，工具名列表通常差距小、较容易学；只训练 teacher 目标（α=1）时，即使有额外信息，也可能逐渐忽略 PI，差距接近零后表现不再提高。联合训练较能缓解两类问题，但 Figure 5 图注称 6/16 最好、§7.1 称 7/16，精确次数不一致，不能据此给统一最优保证。</p><p>OPSD 的规律不同：带参数的完整工具调用在 Travel 上通常更有效，不是 KL 越低越好。但 Qwen3-8B / Retail 的这类 PI 差距过大，反而表现较差。这些是不同配置之间的<strong>观察性关联</strong>，没有独立只改变 KL 的干预实验，不能当作因果定律；论文自己的局限性也承认这一点。</p>
<p class="source-note">原论文条件图：<a href="https://arxiv.org/pdf/2602.04942v3#page=10">Figure 5，初始 KL 与 utility（PDF 第 10 页）</a>；<a href="https://arxiv.org/pdf/2602.04942v3#page=11">Figure 6，最大增益（PDF 第 11 页）</a>；<a href="https://arxiv.org/pdf/2602.04942v3#page=12">Figure 8，OPSD 对照（PDF 第 12 页）</a>。</p>

<figure class="figure wide"><a href="/lib/papers/privileged-information-distillation/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-information-distillation/body-results.svg" width="1050" height="672" alt="π-Distill 三种 α 在 Travel、Retail、Airline 上的不同效果" loading="lazy" decoding="async"></a><figcaption>根据 Table 1 重绘并保留标准差。Travel 最优 α=1、Retail 最优 α=0、Airline 最优为 OPSD；正文另说明 β 的 17/21 消融与 checkpoint 选择。</figcaption></figure>

<p>统计口径同样要留意：§4.3 称报告每个种子最佳连续 3 个 checkpoint 的滚动平均；附录 F 解释表格与曲线差异时又展示“分别取三个种子的峰值再平均”。两处不完全同口径，但都不是同一步数下固定 checkpoint 的均值。先挑每个种子的最佳点再平均，通常高于先平均曲线再取峰值；这也是表格可高于学习曲线峰值的原因。复现时应明确选择集合、规则与最终一次测试，不能将这些数当成固定检查点的无选择估计。</p>

<h2 id="后续验证：PI-当场有用，不等于训练后能保留">5. Discussion：PI 当场有用，不等于训练后能保留</h2>

<p><strong>PI 让 teacher 当场更强，与训练后 student 更强，是两项应分别测的结果。</strong>可以固定同一批成功任务，分别提供工具名、名称加参数、短提示，同时记录带 PI 的成绩提升、两分支概率差距和最终无 PI 的测试成绩。若前者提升很大而后者不升，应先查传递过程，不要立即归因于资料质量。需要另加长度匹配、错配 PI 和无 PI 对照，避免“更多字”或额外训练混进结论。</p><p>对游戏代码，这是本文的延伸建议：现有成功构建记录可整理成训练期参考，例如编译命令、测试顺序和错误修复提示，比较由带参考分支探索还是由 student 自己探索更合适。代码能否运行、玩法是否满足要求仍需独立评测。本文没有做游戏项目生成，也没有给出“第一次写好完整代码”的证据。</p>

<h2 id="总结：动作数据有效，传递方式和评测条件决定结果">6. Conclusion：动作数据有效，传递方式和评测条件决定结果</h2>

<p><strong>它把两种采样与传递方式放进同组实验，贡献在于联合训练和条件分析，而不只是训练时多给信息。</strong>两个 Qwen 模型能在不使用强模型 CoT 时，从其动作记录获得提升；R1 需要带 CoT 的起始 SFT，OPSD 有小模型和跨域失败。最佳 α 随任务、PI 类型与模型而变，不能只保留最大的提升。</p><p>复现仍有缺口：作者仓库的公开分支可核对部分任务、工具、判分与训练路径，README 仍称正式代码发布待批准，且没有把固定提交、配置与 Table 1 逐项对应；Travel Planner 修改后的 judge 也未在已核对文件中定位。正文和 Algorithm 1/2 仍未完全对齐。PI 只有一个强模型来源，训练模型最大 8B，内容、长度和概率差距未独立控制。单阶段减少 SFT checkpoint 选择步骤，但论文仍搜索学习率、β、PI 类型等，不能等同于完整总算力已严格更低。</p><p>泄漏检测仅搜 <code>hint</code>、<code>secret</code> 等词，每次出现扣 0.1，任何命中就标为泄漏。Figure 13 中带 PI 的训练输出随时间更常命中，惩罚只小幅压低；Figure 14 中<strong>无 PI 的测试输出</strong>没有显著增加这些词。这证明的是关键词频率，不是逐字复述、参数抄写或信息泄漏都被排除。个人兴趣程度 8.5/10；实现时应保留协议差异，不能直接拿冻结 teacher 的数学 OPSD 充当本论文基线。</p>

<details><summary>原论文全部 Figure、Table 与 Algorithm（PDF 原页）</summary>
<p>这些链接打开 arXiv 上的原论文页面。本站未复制原图；正文中的关键图已在对应分析旁单独链接。</p>
<ul>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=1">Figure 1：训练路径（第 1 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=1">Figure 2：Qwen3-8B 主结果（第 1 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=6">Figure 3：三种 PI（第 6 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=9">Figure 4：GEM 跨域（第 9 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=10">Figure 5：初始 KL 与 utility（第 10 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=11">Figure 6：最大增益（第 11 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=10">Figure 7：teacher/student KL 变化（第 10 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=12">Figure 8：OPSD 条件分析（第 12 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=13">Figure 9：β 消融（第 13 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=24">Figure 10：变分 EM（第 24 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=25">Figure 11：两阶段对照（第 25 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=30">Figure 12：泄漏惩罚与成绩（第 30 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=30">Figure 13：训练时关键词泄漏（第 30 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=31">Figure 14：测试时关键词泄漏（第 31 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=31">Figure 15：reference 选择（第 31 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=32">Figure 16：完整 β 扫描（第 32 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=34">Figure 17：种子峰值聚合（第 34 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=35">Figure 18：Travel Planner 旧奖励（第 35 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=7">Table 1：主结果（第 7 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=33">Table 2：训练超参数（第 33 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=28">Algorithm 1：π-Distill 伪代码（第 28 页）</a></li>
<li><a href="https://arxiv.org/pdf/2602.04942v3#page=29">Algorithm 2：OPSD 伪代码（第 29 页）</a></li>
</ul>
</details>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染。作者仓库公开分支按 2026-10-19 的固定提交核对；CPU 重放只覆盖 Amelia 任务的公开基础判分，未复现论文 Table 1 的实验。原图链接指向 arXiv PDF，非本站复制。兴趣程度 8.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

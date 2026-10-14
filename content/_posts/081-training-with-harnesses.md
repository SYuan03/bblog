---
title: "[2026-05-09] Training with Harnesses: On-Policy Harness Self-Distillation for Complex Reasoning"
permalink: "/posts/论文解读/training-with-harnesses.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T17:30:00+08:00"
cover: "/lib/papers/training-with-harnesses/cover.svg"
description: "OPHSD 让当前模型先独立作答，再让同尺寸的冻结副本多看外部流程整理出的计划或检索样例，逐词评估同一份回答。本文拆解两套流程、真实案例、结果口径及论文与公开代码的两处差异。"
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

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<style>
html:not([data-theme="dark"]) body:has(.paper-training-harnesses) { background: #fbfcfd; }
body:has(.paper-training-harnesses) .article-deck > p { font-family: var(--sans); }
.paper-training-harnesses .figure > a { display: block; border: 0; }
.paper-training-harnesses .figure > a:focus-visible { outline: 2px solid #2f6f98; outline-offset: 4px; }
</style>

<div class="paper-reading paper-training-harnesses">

<p class="paper-meta">Zhengyang Zhao, Lu Ma, Wentao Zhang · arXiv:2605.08741v1 · 最早公开于 2026-05-09 · 官方仓库后续标注 NeurIPS 2026 accepted</p>
<div class="source-links"><a href="https://arxiv.org/abs/2605.08741">论文主页</a><a href="https://arxiv.org/pdf/2605.08741v1">论文 PDF</a><a href="https://github.com/zzy1127/OPHSD-On-Policy-Harness-Self-Distillation">官方代码</a></div>

<section class="deck-wrap" aria-label="OPHSD 交互图解">
  <div class="deck-head"><strong>16 页交互图解 · 从一枚 token 的训练过程读懂 OPHSD</strong><a href="/lib/decks/training-with-harnesses-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/training-with-harnesses-visual-guide.html" title="OPHSD 论文图解，共 16 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">OPHSD 不让模型照抄外部流程最后生成的答案。每次更新时，正在训练的模型先只看原题，独立写出一份回答；模型外部的控制程序（harness）再调用同一模型做规划或检索，把计划、检索样例和题目整理成一份额外输入。训练开始时保存的冻结模型副本多看这份输入，与当前模型一起评估同一段回答；参数只更新当前模型。</p>

<aside class="part0">
  <span class="kicker">PART 0 · 读懂训练图需要的两个区别</span>
  <h3>这篇论文里的 teacher 不是另一个更大的模型</h3>
  <p><strong>Student</strong> 是正在训练的 Qwen3-8B。Checkpoint 指某个训练时刻保存下来的模型权重。<strong>Frozen teacher</strong> 是训练开始时从同一 checkpoint 复制出的 Qwen3-8B，参数随后冻结。这里的 teacher 并不更大；它的优势来自多看到了一份 harness 组装的 prompt，也就是交给模型的完整输入文本。<strong>Token</strong> 是模型每一步预测的文字单位，可能是一个字、词的一部分或标点。所谓逐 token 蒸馏，就是在 student 已经写出的同一段文字后面，比较 teacher 与 student 对下一个 token 的概率分布。</p>
  <p><strong>Harness</strong> 是模型外部的一段控制程序。它决定何时检索、调用模型几次、把哪些中间结果放进下一次 prompt。<strong>On-policy rollout</strong> 是当前 student 只看原题后采样出的完整回答；模型参数更新后，下一批回答也会跟着变。本文把这种不经过 harness 的回答简称为 <strong>direct rollout</strong>。要区分“生成回答”与“评估回答的概率”：前者决定这次回答写了什么，后者是在已经写出的同一段文字上计算训练信号。</p>
</aside>

<div class="metrics" aria-label="OPHSD 关键数字"><div class="metric"><strong>132 / 156</strong><span>基础模型解不出、外部规划流程能解的数学题中，训练后模型独立解出的数量（84.62%）</span></div><div class="metric"><strong>68.85</strong><span>固定训练终点、4 次运行的 LawBench 罪名集合匹配分（F1）</span></div><div class="metric"><strong>3 × 10K</strong><span>公开的三组训练子集</span></div><div class="metric"><strong>9/10</strong><span>博客作者个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先给结论</h3><ul><li>这篇论文的新意，是让 harness 为 teacher 构造额外输入，再把 teacher 在该输入下给出的 token 分布蒸馏给直接作答的模型。</li><li>分类复核时的两组参考材料是检索到的已标注样例，每组最多 5 条，不是 10 个额外模型。</li><li>论文结果支持“规划与比较步骤可以被部分内化”；它没有证明实时搜索、代码执行或游戏状态也能被参数替代。</li><li>当前公开代码与论文有两处差异：数学规划阶段没收到完整标准解，解题阶段却收到标准答案提示；比较两份概率分布的损失方向也与论文公式相反。</li></ul></aside>


<h2 id="研究问题：将规划与检索的收益训练进模型">1. Motivation：将规划与检索的收益训练进模型</h2>

<p><strong>Harness 可以显著提高训练前的基础模型，但每次推理都要继续支付额外模型调用、检索和控制流程的成本。</strong>论文先测了 Qwen3-8B 在两套 harness 下的即时收益。LawBench 的罪名集合匹配分（F1，计算见下文实验部分）从 55.29 升到 60.22；USPTO 化学反应分类的准确率从 30.07 升到 79.02；四个数学评测集的一次作答通过率（pass@1）平均从 25.64 升到 43.47。数学这组来自 Table 3，§4.3 明确称为 pass@1；它与训练后 Table 5 的八次尝试通过率（pass@8）不是同一指标。</p>

<div class="table-scroll"><table><thead><tr><th>未训练 Qwen3-8B</th><th>直接作答</th><th>挂上对应 harness</th><th>变化（百分点）</th></tr></thead><tbody><tr><td>LawBench F1</td><td>55.29</td><td>60.22</td><td>+4.93</td></tr><tr><td>USPTO accuracy</td><td>30.07</td><td>79.02</td><td>+48.95</td></tr><tr><td>四个数学集平均 pass@1</td><td>25.64</td><td>43.47</td><td>+17.83</td></tr></tbody></table></div>

<p>分类流程先检索历史案件或反应样例、生成初步标签，再检索参考材料来复核，论文称它为 <strong>Draft-Verify</strong>。数学流程先列解题步骤，再按计划求解，称为 <strong>Plan-Solve</strong>。这些数字说明外部流程有用，却不能说明底层模型已经学会了它们：拆掉程序，模型就不再收到检索样例，也不再被要求先列计划。部署系统仍要承担额外延迟和 token 开销，研究者也难以区分“模型会了”与“外部程序替它做了”。</p>

<p>OPHSD 因此提出一个更窄的问题：训练时保留 harness，把它组装出的上下文只交给 teacher；student 始终练习从原题直接作答。若训练后的 student 在拆掉 harness 后仍能追上原来的整套系统，至少有一部分能力已经进入模型参数。</p>

<h2 id="与答案蒸馏、奖励训练和-harness-优化的区别">2. Related Work：与答案蒸馏、奖励训练和 harness 优化的区别</h2>

<p><strong>区别不在“有没有 teacher”，而在 teacher 依据什么信息评估 student 自己生成的 token。</strong>先区分两种常见训练方式：监督微调（Supervised Fine-Tuning，SFT）让模型模仿固定答案；Group Relative Policy Optimization（GRPO）让当前模型一次采样多份完整回答，按最终得分比较它们，再更新模型。</p>

<p>本文属于另一种方式：当前 student 先自己作答，teacher 再对它实际写到的每段前缀给出下一词概率，用这份分布训练 student。这叫 <strong>on-policy distillation</strong>（OPD）。OPSD 是其中一种 self-distillation，也就是利用同一模型的额外输入条件构造监督：teacher 多看到已经验证正确的标准解答。OPHSD 保留这套概率比较，改变额外输入的来源，让 harness 动态整理计划或检索样例。</p>

<p>两个相邻方向也值得区别。CRISP 的 teacher 只多收到固定的 “be concise”（简洁作答）提示；Meta-Harness 和 AutoHarness 则改进外部控制程序，部署时仍需保留该程序。后者是 harness engineering：优化系统怎样调用模型，而不是用损失函数把收益训练进模型。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>训练样本从哪来</th><th>监督信号</th><th>部署时还要 harness 吗</th></tr></thead><tbody><tr><td>SFT</td><td>固定参考答案（demonstration）</td><td>模仿参考答案中的 token</td><td>取决于系统设计</td></tr><tr><td>GRPO</td><td>当前模型的一组 rollout</td><td>整份答案的规则得分或奖励分数</td><td>没有要求</td></tr><tr><td>OPSD</td><td>当前 student 的 direct rollout</td><td>冻结 teacher 读取 verified solution 后，对同一 rollout 给 token 分布</td><td>不需要</td></tr><tr><td>CRISP</td><td>当前 student rollout</td><td>teacher 额外收到“be concise”提示</td><td>不需要</td></tr><tr><td>Meta-Harness / AutoHarness</td><td>优化外部控制程序</td><td>下游任务表现</td><td>需要保留优化后的 harness</td></tr><tr><td>OPHSD</td><td>当前 student 的 direct rollout</td><td>冻结 teacher 读取 harness 动态组装的 prompt 后，对同一 rollout 给 token 分布</td><td>论文目标是不需要</td></tr></tbody></table></div>

<p>论文把 teacher 独享的信息称为 <strong>privileged context</strong>，即训练时可见、部署时拿掉的额外上下文。OPSD 的 privileged context 是现成 reference solution；OPHSD 则用当前模型执行 harness，动态产生 prompt。它希望传递的是“先规划”“先检索相似案例再比较”等处理步骤。</p>

<div class="note blue"><p>这里需要避免一个常见误读：student 并不模仿 harness 最后生成的答案（final response）。student 与 teacher 都评估 student direct rollout 的同一串 token；二者的差别是 teacher 看到了 harness context。</p></div>

<h2 id="方法：同一份回答，两种输入条件">3. Method：同一份回答，两种输入条件</h2>

<p><strong>对一条训练样本，先生成一份 direct rollout，再另行执行 harness，最后在同一份回答上比较两边的 token 概率。</strong>一次参数更新实际处理 64 条样本；下面先看其中一条，图中展示的是这条样本的数据流，不是把整个批次当成一次单独回答。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-training.svg" target="_blank" rel="noopener" aria-label="新标签页放大训练流程图"><img src="/lib/papers/training-with-harnesses/reading-training.svg" width="600" height="1260" alt="OPHSD 一步训练：student direct rollout、harness context、冻结 teacher 与 reverse KL"></a><figcaption>根据论文 Figure 1、Eq. 3 和官方代码 <code>ophsd_trainer.py</code>、<code>batch_builder.py</code> 重绘。关键点是两边评估同一份 student rollout，梯度只更新当前模型；点击可放大。</figcaption></figure>

<ol><li>当前可训练模型 <code>pθ</code> 只看题目 <code>x</code>，采样 direct rollout <code>ŷ</code>。</li><li>控制程序 <code>Hθ</code> 另行调用同一个当前模型，结合训练期额外信息 <code>z(x)</code>，组装供 teacher 读取的完整输入 <code>C</code>。分类任务使用此前积累的已标注样例；数学任务在论文协议中使用标准解答（reference solution）。</li><li>冻结的初始模型 <code>pθ̃</code> 读取 <code>C</code> 与 <code>ŷ</code> 的前 <code>n-1</code> 个 token，给出第 <code>n</code> 个 token 的 teacher 分布。</li><li>当前 student 只读取原题 <code>x</code> 与同一段 token 前缀，给出 student 分布。</li><li>两边对同一个“下一个 token”位置计算 KL divergence，也就是衡量两份概率分布差异的数值，再对参与训练的回答 token 求平均。参数更新只作用于 student；harness 的检索与生成调用不接梯度。</li><li>分类任务先完成当前批次（batch）的预测，再把这批样本的真实标签加入历史样例表。下一批次使用更新后的当前模型和积累的样例。</li></ol>

<p>第 2 步得到的 <strong>terminal context</strong> 是 harness 走到最后一步时组装出的 teacher prompt；terminal 表示“流程末端”，与命令行终端无关。公开代码分别取分类复核调用或数学解题调用的输入消息，并不把它们生成的最终答案拿来替换 <code>ŷ</code>。harness 也不是先读 <code>ŷ</code> 再修改它：这条路径另从原题启动。</p>

<h3>同一份回答，怎样变成两种训练输入</h3>

<p>以 Appendix B.2 的真实数学题为例：令 <code>f(x)=x+x²+x⁴+x⁸+…</code>，求 <code>f(f(x))</code> 中 <code>x¹⁰</code> 的系数。计划中最关键的提醒是：从两个因子里分别选 <code>x²</code>、<code>x⁸</code>，与反过来选，是乘积展开的两项，必须计数两次。下文实验部分会把完整答案 40 算出来；这里先看这条提醒怎样影响训练。</p>

<div class="table-scroll"><table><thead><tr><th>用于计算概率的一边</th><th>额外输入</th><th>共同的回答前缀</th><th>这一位置要计算什么</th></tr></thead><tbody><tr><td>Student</td><td>只有原题</td><td>student 此次已经生成的同一段文字</td><td>在原题条件下，下一个 token 的概率</td></tr><tr><td>Frozen teacher</td><td>原题＋解题计划；公开发布路径还含答案提示</td><td>与 student 完全相同，不换成 harness 的回答</td><td>多看这份输入后，下一个 token 的概率</td></tr></tbody></table></div>

<p>假设回答写到“这两个选择要计数……”的位置，student 更倾向接“一次”，而多看计划的 teacher 更倾向接“两次”，两份概率就会不同。<strong>这里的续写只是说明机制，不是论文记录的某次训练输出或 tokenizer 的切分结果。</strong>即使 student 此次确实写错，teacher 仍在那个错误前缀上计算概率，不会把前面的文字改成正确推导。参数更新之后，student 下一次生成时才可能改变这个选择。</p>

<p>实现会把“原题＋同一回答”与“teacher 输入＋同一回答”分别拼成两组序列，在批量前向计算中取得各个回答位置的概率。它不需要为了每一个 token 发起一次独立 API 请求。只在回答位置计算蒸馏损失；原题、检索样例和计划本身都不是 student 要照抄的训练目标。</p>

<h3>KL 损失比较的是完整概率分布</h3>

<div class="formula"><span>论文 Eq. 3：KL( pT || pS )</span><span>公开代码默认项：KL( pS || pT )</span></div>

<p>论文与公开代码的 KL 方向也不一致。论文 Eq. 3 和 Appendix A.2 都把 teacher 分布写在 KL 左侧，即 <code>KL(pT || pS)</code>；公开仓库的默认 <code>reverse_kl</code> 则在 <code>losses.py</code> 里计算 <code>KL(pS || pT)</code>。两种方向都只更新 student，但惩罚概率分布的方式不同。本文的代码流程与固定训练终点（fixed-checkpoint）结果按公开实现解释；若要严格复现论文公式，需要把 KL 方向也列为一个待确认的协议差异。</p>

<div class="formula"><span>L = (1 / N) Σₙ Σᵥ pS(v | x, ŷ&lt;n) · ln[pS(v | x, ŷ&lt;n) / pT(v | C, ŷ&lt;n)]</span></div>

<p>上式按公开代码的方向写：<code>N</code> 是实际参与损失计算的回答 token 数；<code>n</code> 是回答中的位置；<code>v</code> 遍历模型词表里的所有候选 token；<code>ŷ&lt;n</code> 是这个位置以前的 student 回答。<code>pS</code> 只看原题 <code>x</code>，<code>pT</code> 则看 harness 输入 <code>C</code>。因此这不是只给最终答案打一个对错分，也不是只给已经采样出的那个 token 加分，而是比较每个位置的整份下一词概率分布。</p>

<p>用两个候选组成的玩具词表说明：student 给 A、B 的概率是 <code>(0.8, 0.2)</code>，teacher 是 <code>(0.2, 0.8)</code>。按公开实现的方向，KL 为 <code>0.8 ln 4 + 0.2 ln(1/4) ≈ 0.8318</code>；两边概率相同时，KL 为 0。此例只演示公式，概率是人为设定的，不能当作模型实测值，也不能据此判断两种 KL 方向在真实任务中的优劣。</p>

<p>整个训练过程中，冻结 teacher 的权重不变，但它收到的计划或检索样例会变：harness 每一步都调用更新后的当前模型，分类样例表也在积累新数据。因此这里的“动态 teacher”指输入条件不断变化，不是 teacher 的参数也在训练。</p>

<div class="code-scroll"><pre><code>&#35; Python 风格伪代码；接口名为说明所写，不是仓库可执行 API
y = current_model.sample(problem)              &#35; direct rollout
with no_grad():
    C = harness(current_model, problem, privileged_info).teacher_prompt
    teacher_logits = frozen_initial_model.forward(C, response=y.token_ids)
student_logits = current_model.forward(problem, response=y.token_ids)
loss = full_vocab_reverse_kl(student_logits, teacher_logits,
                            response_positions_only=True)
update(current_model, loss)</code></pre></div>

<p class="source-note">上面只展开一条样本，实际训练按批次计算；<code>no_grad</code> 表示这部分不记录用于更新参数的梯度。公开 <code>batch_builder.py</code> 会跳过没有非空 <code>final_response</code> 的 harness 输出，这只是样本有效性检查，不代表它检查了 harness 的答案正确性。</p>

<h3>Draft-Verify：检索样例怎样进入复核输入</h3>

<p>分类 harness 维护一个在线 memory bank，也就是一张保存此前训练样例、真实标签和向量表示的表。程序先把当前问题编码成一串数字（embedding），再用 cosine similarity（比较向量方向是否接近）找出最相似的 5 个历史样例。当前模型读取这些样例和原题，生成初步预测（draft）；程序只从最终答案字段提取标签，会先去掉 <code>&lt;think&gt;</code> 中的推理文字。</p>

<p>随后程序按初步标签再检索两组历史样例。<strong>Confirmer / challenger</strong> 是数据行，不是额外 agent：confirmer 的真实标签与 draft 标签集合至少有一个共同标签，challenger 则没有共同标签。这是公开 <code>MemoryBank.retrieve</code> 的过滤条件，不是要求两个标签集合完全相等。每组最多取 5 条，不足时保留实际找到的条数。</p>

<p>题目、初步标签和这两组样例组成复核输入（verify prompt），再调用当前模型一次，要求它维持或修正初步判断。正常路径合计两次生成调用和三次检索。memory bank 少于 10 条时不运行两阶段流程，而是直接调用模型一次；训练代码在整批预测结束后才加入本批真实标签，因此“阈值为 10”不等于“训练只有前 10 个样本走直接调用”。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-retrieval.svg" target="_blank" rel="noopener" aria-label="新标签页放大分类复核流程图"><img src="/lib/papers/training-with-harnesses/reading-retrieval.svg" width="600" height="1420" alt="Draft-Verify 从在线 memory bank 检索近邻、confirmer 与 challenger"></a><figcaption>根据论文 §3.3、Appendix A.1 与官方 <code>lawbench/draft_verify.py</code> 重绘。confirmer/challenger 是按标签过滤后的检索样例；verify 阶段只有一次新的模型调用。</figcaption></figure>

<p>这里的“支持／挑战”只是按标签分组，程序没有验证样例真的构成支持或反驳。下文的 LawBench idx 44 正好暴露这个区别：当前案件的关键是斗殴触发了既有冠心病背景下的死亡，但最相似的样例都含故意伤害标签；另一组虽标签不同，却与这个判定难点无关。<strong>检索到不同标签，不等于提供了有用的反例。</strong></p>

<p>分类任务的 terminal context 不是 verify 阶段生成的最终答案，而是这次复核调用实际收到的完整对话消息列表（messages）。公开 <code>batch_builder.py</code> 直接取 <code>trace["verify"]["messages"]</code> 作为 teacher prompt，再把 direct rollout 接在后面，计算 teacher 对每个下一个 token 的概率。</p>

<h3>Plan-Solve：plan 进入 teacher prompt</h3>

<p>论文协议中，负责规划的模型调用（planner）同时读取题目与完整标准解（reference solution），把它整理成一份解题步骤草案（strategy plan）；负责求解的下一次调用（solver）再读取题目与 plan，完成推导。两次调用仍来自当前模型，不是两个另行训练的模型。用于蒸馏的 terminal context 是 solver 的输入，也就是题目与 plan。验证 harness 自身时，reference solution 会被拿掉，由模型自己先 plan 再 solve。</p>

<p>在当前公开代码版本中，数据转换脚本确实保存了 <code>solution</code>，但 <code>extra_info</code> 只含 <code>question</code> 与 <code>answer</code>；训练代码随后也只把这两项传给 <code>PlanSolveHarness</code>。结果是 planner 看不到 reference solution，而 solver prompt 会收到 reference answer，作为核对结果的答案提示（verification hint）。这与论文 §3.3 的描述不一致。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-plan.svg" target="_blank" rel="noopener" aria-label="新标签页放大论文与代码的协议对照图"><img src="/lib/papers/training-with-harnesses/reading-plan.svg" width="600" height="1130" alt="论文 Plan-Solve 协议与公开代码实际参数传递的区别"></a><figcaption>左侧来自论文 §3.3；右侧来自 commit <code>20eaa0c</code> 的 <code>prepare_deepmath_data.py</code>、<code>ophsd_trainer.py</code> 与 <code>plan_solve.py</code>。这里只能确认公开发布路径存在协议差异，不能据此断言论文内部实验也漏传了 solution。</figcaption></figure>

<h2 id="实验：分数口径与三组机制证据">4. Experiments：分数口径与三组机制证据</h2>

<p><strong>结果支持“不挂 harness 的模型吸收了两套流程的一部分处理方式”，但论文没有分别去掉额外调用、仅 teacher 可见的 reference answer、plan 或检索内容，无法确认各部分各自贡献了多少。</strong></p>

<h3>任务、数据和指标</h3>

<div class="table-scroll"><table><thead><tr><th>训练数据</th><th>评测</th><th>指标怎样算</th><th>使用的 harness</th></tr></thead><tbody><tr><td>CAIL-2018，抽样 10K</td><td>LawBench task 3-3，215 个罪名</td><td>预测罪名集合与标准答案集合的 F1</td><td>Draft-Verify</td></tr><tr><td>USPTO-50K，分层抽样 10K</td><td>USPTO test，10 种反应类别</td><td>类别必须完全相同才算正确（exact-match accuracy）</td><td>Draft-Verify</td></tr><tr><td>DeepMath，抽样 10K</td><td>AIME24、AIME25、10% OlympiadBench、HMMT25</td><td>每题采样 8 次，至少一次答案等价即 pass；再对题目求平均</td><td>Plan-Solve</td></tr></tbody></table></div>

<p>三项指标不能用同一个“正确率”概括。LawBench 允许输出多个罪名：预测集合记作 <code>P</code>，标准标签集合记作 <code>G</code>，单个案件的 <strong>F1 = 2|P∩G| / (|P|+|G|)</strong>；公开评测程序先算每个案件的 F1，再对案件求平均，最后乘 100 展示。它不是把全部案件的标签合在一起算，也不是先按罪名类别分别算再平均。USPTO 则每题只判一个类别，准确率为正确题数除以总题数。</p>

<p>数学训练后的主表使用 <strong>pass@8</strong>：每题独立采样 8 份答案，只要至少一份通过答案等价检查，这题就计 1，否则计 0；再在每个评测集内平均。Table 5 的 Avg 是四个评测集得分的等权平均，不按它们的题目数量加权。它衡量“八次尝试能否至少解出一次”，并不表示模型一次作答有 69.50% 的概率答对。后面的单题 <code>7/8</code> 是 8 份回答中 7 份正确；对这一组回答，该题的 pass@8 为 1，不是 87.5%。</p>

<p>所有方法从 Qwen3-8B 开始，学习率 <code>1e-6</code>，每批 64 个样本（batch size 64），单次最多生成 8,192 tokens，使用 8 张 H100。文本任务更新参数 300 次（300 steps），每 15 steps 评测；数学任务更新 150 次，每 10 steps 评测。论文 v1 在完整训练过程中选每种方法的最高评测分数。数学结果因波动较大，报告 4 次运行的平均。</p>

<h3>论文取最佳 step，仓库固定最后 step</h3>

<p>arXiv v1 从训练曲线中挑每种方法表现最好的 checkpoint，也就是保存下来的某个训练 step。仓库后来又补充 fixed-checkpoint 结果：文本任务统一读取 step 300，数学任务统一读取 step 150，每项配置做 4 次独立运行并给出标准差。后一套口径更适合比较稳定性，但它不是论文 v1 原表。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-results.svg" target="_blank" rel="noopener" aria-label="新标签页放大结果对照图"><img src="/lib/papers/training-with-harnesses/reading-results.svg" width="600" height="1130" alt="OPHSD 在论文 best checkpoint 与仓库 fixed checkpoint 两套口径下的结果"></a><figcaption>根据论文 Tables 2、5 以及仓库 <code>results/fixed_checkpoint_summary.csv</code> 重绘。三项指标尺度不同，条形只用于各自任务内部比较。</figcaption></figure>

<p>在论文 v1 口径下，OPHSD 达到 LawBench 69.51、USPTO 90.81、数学平均 pass@8 69.50。把训练后的模型重新挂回 harness，三项分别变成 68.41、83.62、69.13，均未超过不挂 harness 的 OPHSD。这个观察只覆盖论文里的两套 harness，不能推出所有 harness 在训练后都会变成负担。</p>

<p>仓库 fixed-step 四次运行中，Qwen3-8B OPHSD 为 68.85±0.25、90.71±0.13、66.89±0.65，仍领先相同表里的 GRPO 与 OPSD。仓库还新增了 Qwen3-4B，三项为 47.56±0.19、87.81±0.10、58.37±0.93。训练成本表显示：Qwen3-8B 数学 OPHSD 在 150 steps 生成 108.73M tokens，约 9.5 小时、76 GPU-hours（8 张卡累计使用 76 小时）；GRPO 为 340.22M tokens 与 91 GPU-hours；OPSD 只用 29.48M tokens 与 28–29 GPU-hours，但 fixed-step 数学平均分较低。</p>

<h3>证据一：原本只有 harness 能解的题，训练后 student 能解</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-groups.svg" target="_blank" rel="noopener" aria-label="新标签页放大解题分组图"><img src="/lib/papers/training-with-harnesses/reading-groups.svg" width="600" height="960" alt="按基础模型与 harness 是否能解题划分的四组数学题"></a><figcaption>根据论文 Figure 4 重绘。第二组的 132/156 最接近“harness 的能力被写进模型”这一主张；第四组的新增长不能全部归因于 harness。</figcaption></figure>

<p>论文先用训练前的基础模型（base model）和它的 Plan-Solve harness 对每道题做多次采样，再按二者能否解出分组。其中有 156 道“base 解不出、harness 能解”的题：OPHSD 训练后不挂 harness 的模型解出 132 道，即 84.62%。在 316 道二者原本都能解的题上，它保留了 310 道。这个分组比只看总平均更接近论文的因果主张，但仍未排除答案提示或更多模型调用带来的监督差异。</p>

<h3>证据二：LawBench 的检索会在训练后反过来干扰模型</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-law.svg" target="_blank" rel="noopener" aria-label="新标签页放大法律分类案例图"><img src="/lib/papers/training-with-harnesses/reading-law.svg" width="600" height="1300" alt="LawBench 真实案例中 standalone student 与重新挂载 harness 的推理差异"></a><figcaption>根据 Appendix B.1 的 LawBench-3-3 idx 44 重绘。论文给出了题目、top-5 相似度、两种推理摘录和最终 set-F1。</figcaption></figure>

<p>这是论文 Appendix B.1 选出的 <code>LawBench-3-3 idx 44</code>，不是本文编写的法律例题。两名被告与被害人在餐馆争执、互殴；被害人随后在警方询问时不适，送医后死亡。法医结论是：在既有冠心病的背景下，言语和肢体冲突触发了急性心脏事件，创伤与死亡存在因果关系；鼻骨损伤为轻伤二级。<strong>本数据集的标准标签</strong>（gold label）是 <code>negligent homicide</code>，即过失致人死亡罪。这里解释模型怎样匹配评测标签，不把这个例题当作普遍的法律裁定。</p>

<p>训练后的同一个模型有两种运行方式。不挂 harness 时，它在故意伤害与过失致人死亡之间比较，最终输出 <code>{intentional injury, negligent homicide}</code>，前者对应故意伤害罪。重新挂上 Draft-Verify 后，5 个 draft 近邻都含 intentional injury；challenger 又来自侵入住宅、强奸、盗窃等不相关类别。论文给出的五个 draft 相似度依次是 <code>0.814、0.811、0.808、0.799、0.797</code>；五个 challenger 也都没有过失致人死亡标签。模型的 draft 和复核答案于是都只保留 <code>intentional injury</code>。</p>

<div class="table-scroll"><table><thead><tr><th>运行方式</th><th>预测集合 P</th><th>命中的标准标签数</th><th>逐案 F1</th></tr></thead><tbody><tr><td>不挂 harness</td><td>故意伤害、过失致人死亡</td><td>1</td><td>2×1 / (2+1) = 2/3 ≈ 0.67</td></tr><tr><td>重新挂 Draft-Verify</td><td>故意伤害</td><td>0</td><td>2×0 / (1+1) = 0</td></tr></tbody></table></div>

<p>不挂 harness 的回答也不是全对：它保留了正确标签，但多报了一个罪名，所以只能得 0.67。这个案例支持的较窄结论是：<strong>对当前问题不够有针对性的检索，可能把模型原本考虑的正确选项挤掉。</strong>论文展示了这条具体失败路径，但没有统计类似干扰在全部测试案件中出现的频率，也没有用这个案例单独证明参数中存在真实的案例记忆。</p>

<h3>证据三：同一数学题中的计划提醒与计数差异</h3>

<p>回到前面用于解释训练输入的 <code>OlympiadBench idx 649</code>。题目求 <code>f(f(x))</code> 中 <code>x¹⁰</code> 的系数，<code>f(x)=x+x²+x⁴+x⁸+…</code>。把外层函数展开，就是 <code>f(x)+f(x)²+f(x)⁴+f(x)⁸+…</code>。每个因子的最低次项都是 <code>x</code>，所以 16 个及更多因子不可能贡献 <code>x¹⁰</code>；只需计算 1、2、4、8 个因子这四项。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-math.svg" target="_blank" rel="noopener" aria-label="新标签页放大数学计数图"><img src="/lib/papers/training-with-harnesses/reading-math.svg" width="600" height="1320" alt="OlympiadBench idx 649：各次幂对 x 的十次方系数贡献为 0、2、10、28，合计 40"></a><figcaption>根据论文 Appendix B.2 的题目与计数过程重新绘制。展示的是独立复算的数学关系，不是未公开的模型完整训练轨迹；点击可放大。</figcaption></figure>

<p>图里后两项的计数可以这样检查。四个因子的指数要加到 10，不能选 8，因为其余三个因子最少还要贡献 3；只剩 <code>{1,2,4}</code>。可行组合恰好是三个 2、一个 4（把 4 放在哪个因子，共 4 种），以及两个 1、两个 4（从四个因子选两个放 4，共 6 种），所以为 10。八个因子的最低指数和是 8，要再增加 2，只能把其中两个 1 换成 2；从八个位置选两个，有 <code>8×7/2=28</code> 种。</p>

<p>所以答案是 <strong>0 + 2 + 10 + 28 = 40</strong>。容易错的第二项并不难算，难在把“乘法可交换”误认为“同一乘积只出现一次”：<code>x²·x⁸</code> 与 <code>x⁸·x²</code> 在展开式里都出现，相加才得到 <code>2x¹⁰</code>。漏掉其中一次，最终就会得到 39。</p>

<p>论文中的 plan 明确提醒了这个有序对（ordered pairs）区别，并写出后两项的排列计数。训练到 step 80 时，harness 对这道题采样 8 次，只有 <strong>4/8</strong> 最终答对，不能假定 teacher 每次获得的额外输入都能导向正确答案；这项统计也没有单独评估计划的正确率。论文选出的训练后 OPHSD 模型在不挂 harness 时主动检查了这个区别，8 次回答中 7 次正确；OPSD 的推理摘录把 <code>(2,8)</code> 只算一次，得到 39，8 次全部错误。</p>

<p>下面的 Python 3.10+ 检查器由本文编写，不依赖第三方库，不是官方评测程序。每次乘入一个 <code>f(x)</code>，程序统计指数 0 到 10 的各项系数；超过 10 的项不会影响目标系数，因此直接舍去。它可以检查上述四项的计数，不能验证模型到底怎样推理。</p>

<div class="code-scroll"><pre><code>def coefficient(factors, degree=10):
    dp = [0] * (degree + 1)
    dp[0] = 1  &#35; 尚未乘入因子：常数多项式 1
    for _ in range(factors):
        dp = [
            sum(dp[d - p] for p in (1, 2, 4, 8) if p &lt;= d)
            for d in range(degree + 1)
        ]
    return dp[degree]&#10;
contributions = [coefficient(n) for n in (1, 2, 4, 8)]
assert contributions == [0, 2, 10, 28]
print(contributions, sum(contributions))
&#35; 输出：[0, 2, 10, 28] 40</code></pre></div>

<p>可下载<a href="/lib/papers/training-with-harnesses/worked-case-checks.py">完整验证脚本</a>，同时复算这道题、上一例的 F1 和 KL 玩具数值。这个 case 让“学到解题步骤”有了具体内容，但单个例题仍不能说明所有性能提升都来自这种检查习惯；论文也未对这条计数提醒做单独消融。</p>

<p>分类任务还统计了模型引用相似案例的比例（cite-rate）。GPT-4o 检查模型在不挂 harness 时是否主动写出“某个相似案例如何判定”的推理句式。每个任务、方法和训练 step 抽 40 条推理记录（trace）；OPHSD 在训练末期达到 LawBench 97.5%、USPTO 90.0%，其余方法不超过 7.5%。这项指标只检查是否出现具体先例式表述，不验证模型回忆的案例是否真实，也没有报告人工复核一致性。</p>

<div class="table-scroll"><table><thead><tr><th>不挂 harness 时的 cite-rate</th><th>训练初期</th><th>训练中期</th><th>训练末期</th></tr></thead><tbody><tr><td>LawBench · GRPO</td><td>6.3</td><td>2.5</td><td>5.0</td></tr><tr><td>LawBench · OPSD</td><td>5.0</td><td>5.0</td><td>2.5</td></tr><tr><td>LawBench · OPHSD</td><td>7.5</td><td>100.0</td><td>97.5</td></tr><tr><td>USPTO · GRPO</td><td>5.0</td><td>5.0</td><td>2.5</td></tr><tr><td>USPTO · OPSD</td><td>5.0</td><td>2.5</td><td>7.5</td></tr><tr><td>USPTO · OPHSD</td><td>7.5</td><td>75.0</td><td>90.0</td></tr></tbody></table></div>

<p>论文根据训练前 Qwen3-8B 的逐题表现，把样本分成难、中、易（Hard、Medium、Easy）三组。OPHSD 在难题组（Hard bucket）上相对训练前分别提升 22.9 个百分点（Math，n=412）、33.8 个百分点（LawBench，n=145）和 90.4 个百分点（USPTO，n=700）。Easy 组已接近天花板，LawBench 与 USPTO 上甚至出现 -5 与 -9 个百分点。Figure 6 因而支持“收益集中在难题”，也提醒读者平均分可能掩盖简单题退化。</p>

<h2 id="对游戏代码训练的启发与适用边界">5. Discussion：对游戏代码训练的启发与适用边界</h2>

<p><strong>可以蒸馏“怎样利用执行结果”，不能把尚未发生的执行结果提前写进参数。</strong>Appendix C 把 harness 分成三类：只重新组织已有输入的流程；依赖动态内容，但处理步骤可以迁移的流程；依赖实时外部事实或环境执行的流程。论文只在前两类上做了实验。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/reading-boundary.svg" target="_blank" rel="noopener" aria-label="新标签页放大可蒸馏边界图"><img src="/lib/papers/training-with-harnesses/reading-boundary.svg" width="600" height="1080" alt="OPHSD 对三类 harness 的可蒸馏边界"></a><figcaption>根据论文 Appendix C 重绘，并把第三类映射到 game query-to-code。右侧是论文讨论与本文推论，不是本文已完成的实验。</figcaption></figure>

<p>对 game coding，更合理的训练目标不是让模型在没有引擎时“猜中”编译错误或实际游玩状态，而是让 student 学会一套更好的决策顺序：先把需求拆成可检查的行为，写出第一版代码，调用真实游戏引擎，读取报错、scene tree（引擎里的场景节点层级）和运行轨迹，再决定修哪里。teacher 可以看到这次执行产生的额外信息，并据此对 direct rollout 提供 token 级监督。</p>

<p>论文也提示了一个风险：质量差的检索结果或过时 harness 会覆盖模型已经学到的判断。若游戏训练数据里的修复轨迹只覆盖常见错误，harness 可能把少见失败强行套进错误模板。实验至少需要比较四种条件：基础模型直接生成、推理时保留 harness、OPSD 只看静态标准代码（reference code）、OPHSD 读取当前代码的真实执行结果。还应故意换入其他代码版本（build）的执行结果，或打乱轨迹顺序，确认收益来自与当前代码匹配的反馈，而不是因为 prompt 变长。</p>

<h2 id="结论：结果、协议差异与复现限制">6. Conclusion：结果、协议差异与复现限制</h2>

<p><strong>值得保留的是“同一份 direct rollout、两种输入条件、逐 token 蒸馏”这套训练结构；最需要警惕的是论文协议、公开实现和后续结果口径不能混在一起。</strong></p>

<div class="limit-grid"><div><b>只验证两套 harness</b><span>Draft-Verify 与 Plan-Solve 都是短流程。论文没有真实代码执行、网页工具或长时环境交互实验。</span></div><div><b>缺少关键消融</b><span>没有分别拆掉 reference answer、plan、额外模型调用与动态生成的 context，因此无法精确归因每一部分。</span></div><div><b>公开代码有两类协议差异</b><span>数学任务的 planner 没有收到 reference solution，solver 收到 reference answer；默认 KL 方向也与论文公式相反。复现前必须明确采用论文协议还是公开代码。</span></div><div><b>公开材料仍不完整</b><span>仓库公开训练代码（trainer）、harness、三组 10K 数据与结果 CSV，但不含评测集（evaluation sets）、模型权重（checkpoint）、完整日志或逐样本输出，也没有检测到明确的开源许可（license）。</span></div></div>

<p>论文 v1 最有分量的结论可以收窄成一句话：在 Qwen3-8B、三组 10K 训练数据和两种特定 harness 上，训练后的直接模型超过 OPSD 与 GRPO；对原本只有 Plan-Solve 能解的 156 道题，它独立解出 132 道。现有证据还不足以说明 OPHSD 能替代真实工具，也不足以说明任意 harness 都值得蒸馏。</p>

<p>兴趣程度 9/10。它给出了一个适合 game code 数据继续做的方法骨架，而且公开代码足以看清 teacher 与 student 的输入怎样拼成一个训练 batch，也就是一次参数更新所用的那批样本。真正开始实验前，我会先修复数学 reference solution 的传递路径，确认 KL 方向，再补上真实引擎执行这一组实验和严格消融；否则很容易复现到一套与论文描述不同的方法。</p>

<p class="source-note">证据范围：已阅读全文与 Appendix A-D，并检查 18 页 PDF 的文本和逐页渲染；代码结论固定到 commit <code>20eaa0c8b0674fbf81aa780a8cf4e0d7c550d4ea</code>。论文 v1 与仓库后续 fixed-checkpoint 结果分开呈现。兴趣程度只表示博客作者对该方向的个人兴趣。</p>

</div>

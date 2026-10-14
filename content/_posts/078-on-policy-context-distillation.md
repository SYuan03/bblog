---
title: "[2026-02-12] On-Policy Context Distillation for Language Models"
permalink: "/posts/论文解读/on-policy-context-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/lib/papers/on-policy-context-distillation/cover.svg"
description: "把历史任务提炼成经验，只在训练时交给模型的冻结副本；正在学习的模型自己尝试，再向这份带经验的判断靠近。本文拆解经验生成、筛选、训练损失和文本游戏评测，也指出按测试成绩挑训练版本的限制。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "On-Policy Distillation"
  - "Context Distillation"
  - "Agent Experience"
  - "Text Games"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Tianzhu Ye, Li Dong, Xun Wu, Shaohan Huang, Furu Wei · arXiv:2602.12275v2 · 最早公开于 2026-02-12</p>
<div class="source-links"><a href="https://arxiv.org/abs/2602.12275">论文主页</a><a href="https://arxiv.org/pdf/2602.12275v2">论文 PDF</a><a href="https://github.com/microsoft/LMOps/tree/main/opcd">官方代码</a></div>

<section class="deck-wrap" aria-label="OPCD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 训练过程、真实案例与复现边界</strong><a href="/lib/decks/on-policy-context-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/on-policy-context-distillation-visual-guide.html" title="OPCD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">模型做过的题和玩过的游戏能否帮助下一次任务，又不必每次把整段历史带上？OPCD 先把历史记录总结成经验，训练时让模型的冻结副本参考这些经验，再评价正在学习的模型自己生成的回答。实验同时比较了直接查经验、模仿教师回答和这种训练方式。一个值得注意的负结果是：直接加入原始历史记录，数学验证成绩反而下降。</p>

<aside class="part0"><span class="kicker">PART 0 · 两种输入，一条回答</span><h3>同一个模型怎样同时担任“学习者”和“带经验的参照”</h3><p>正在更新参数的模型称为 <strong>student</strong>，它接收题目或当前游戏历史，自己生成回答。用当前模型亲自尝试任务、取得训练记录的操作叫 <strong>on-policy rollout</strong>。主实验另保留一份不更新参数的模型副本，称为 <strong>teacher</strong>；它额外读取经验，计算同一条回答每个位置的下一词概率。附加在输入中的这份经验文字就是本文的 <strong>context</strong>。teacher 的概率是训练参照，不能代替环境对任务成败的判断。部署时 student 不再读取这份经验。</p></aside>

<div class="metrics" aria-label="OPCD 关键数字"><div class="metric"><strong>79.7 ± 0.5%</strong><span>数学，随机选择经验</span></div><div class="metric"><strong>53.9%</strong><span>Sokoban，验证后选择经验</span></div><div class="metric"><strong>256</strong><span>student 概率最高的候选词</span></div><div class="metric"><strong>8.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先记住</h3><ul><li>student 不查经验，teacher 带经验计算同一条回答的概率；训练不会把 teacher 另外生成的解答换进来。</li><li>经验由模型总结。生成数学经验时不提供正确答案；选择最有用的经验时，会使用验证集正确率。</li><li>75.1% → 70.5% 是经验积累阶段的数学验证结果；79.7% 是蒸馏后的主测试结果，两组数不能当作同一次测试。</li></ul></aside>


<h2 id="研究动机：从读经验到不查经验也能完成任务">1. Motivation：从读经验到不查经验也能完成任务</h2>

<p><strong>论文希望把“读经验后才能做好的任务”变成不查经验也能做好的任务。</strong>直接把历史追加到输入会增加长度，而且记录里有失败尝试、重复步骤和只适用于某道题的细节。另一种办法是让带经验的 teacher 生成回答，再用这些回答训练 student；但 student 部署时可能走到与 teacher 不同的中间状态，离线模仿的数据未必覆盖这些状态。</p><p>OPCD 的改变发生在训练记录的来源：student 先自己回答，teacher 再在这条回答已经经过的位置提供概率参照。论文把这个办法用于两种资料：从历史解题或游戏记录总结出的经验，以及外部优化过的系统提示。后一组实验涉及医学选择题和安全分类，说明 context 不一定来自行动轨迹。</p>

<h2 id="相关工作：关键区别是由谁生成训练回答">2. Related Work：关键区别是由谁生成训练回答</h2>

<p><strong>最近的对照是 context distillation：两者都把附加文字训练进模型，OPCD 改用 student 自己生成的回答。</strong>下面的 OPSD 指 Zhao 等人的数学论文 <em>Self-Distilled Reasoner</em> 的主设置；其他论文同名方法的 teacher 是否冻结、是否使用环境奖励可能不同。</p><div class="table-scroll"><table><thead><tr><th>方法</th><th>训练记录来自谁</th><th>teacher 多看到什么</th><th>部署与主要差别</th></tr></thead><tbody><tr><td>直接查经验（In-Context）</td><td>不训练，直接回答测试题</td><td>部署模型自己读取经验</td><td>每次推理仍带经验；只测经验是否当场有用</td></tr><tr><td>离线 context distillation</td><td>带 context 的 teacher 生成回答</td><td>同一份经验或系统提示</td><td>student 模仿 teacher 的回答；测试不带 context</td></tr><tr><td>Self-Distilled Reasoner / OPSD</td><td>student 自己回答</td><td>已验证的参考解答</td><td>主设置冻结 teacher，以完整词表的 forward KL 匹配概率</td></tr><tr><td>OPCD</td><td>student 自己回答或玩游戏</td><td>模型总结的经验，或优化后的系统提示</td><td>主设置冻结 teacher，以 reverse KL 训练；这里保留 student top-256 候选词</td></tr></tbody></table></div><p>表中的 KL 是比较两份下一词概率分布的量。forward KL 用 teacher 概率加权，reverse KL 用 student 概率加权；两种方向不等价，后文用具体概率说明 OPCD 的计算。OPCD 展示了这种训练可以处理“从过去积累的经验”。经验生成、筛选和是否适配接收模型，因而也成为方法的一部分。</p>

<h2 id="方法：经验构造、选择与-on-policy-训练">3. Method：经验构造、选择与 on-policy 训练</h2>


<p><strong>先生成经验，再固定经验训练 student；这两个阶段不能混成边玩边更新。</strong>作者从验证数据中抽取 30 个任务，让模型依次尝试并总结。新经验追加在已有经验之后，保留每一步积累到的版本，因此一轮得到 30 份经验文字。更换随机种子重复 10 次，共 <strong>30 × 10 = 300</strong> 份；它们是逐步积累的上下文版本，不是 300 条人工标注。程序只保留以 <code>- EXPERIENCE ITEM:</code> 标记的经验条目，不把整段总结回答都追加进去。</p><p>数学使用 Qwen3-8B 的 thinking 模式解题并总结，经验提炼不读取正确答案。文本游戏输入包含交互历史和环境反馈，提示要求总结一到两条经验，不只保留成功游戏。经验长度上限分别为数学 16,384 tokens、游戏 8,192 tokens。<strong>Table 1 实际随机选择三份积累到第十步的经验</strong>，分别进行后续比较，不是将全部 300 份合成输入，也不是给三个训练种子固定同一份经验。</p><p>另一组 <strong>filtered</strong> 设置先评估经验质量：把每份候选经验放到新任务前，用 <strong>1,000 道数学验证题或 128 个游戏验证任务</strong>评估，再选成绩最高的一份。因此，不需要答案生成经验，不等于全文实验完全不使用验证答案。</p>

<div class="case"><h4>真实经验样本：Frozen Lake 的总结并不保证正确</h4><p>附录 Figure 9 展示的经验写道：玩家可以上下左右移动，要避开 <code>H</code>，到达 <code>G</code>；另一条甚至写了“moving right to expand the grid”。这里的游戏是作者设置的 3×3 Frozen Lake，有两个洞，部分明确规则被删去以便模型探索。正文把危险格描述为 holes，经验样本却称 <code>H</code> 为 “walls”；向右走也不会扩展地图。</p><p>这份样本是模型生成的经验，不能当作人工核验过的游戏规则。它恰好解释了为什么需要单独测经验质量：文字看起来像攻略，仍可能错误。论文没有为 Figure 9 给出逐步动作、完整初始棋盘和对应 checker 日志，因此这里不补造一条成功路线。</p></div>

<figure class="figure wide"><a href="/lib/papers/on-policy-context-distillation/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/on-policy-context-distillation/body-case.svg" width="1050" height="816" alt="OPCD Figure 9 模型经验将 H 叫作 walls 并称向右扩展地图的错误" loading="lazy" decoding="async"></a><figcaption>根据 Figure 9 重绘并与 Appendix A.2 规则对照。它是模型总结的经验，不是人工确认的游戏规则；本图不补造棋盘或逐步日志。</figcaption></figure>

<p>选好经验后，一次更新按下面的顺序进行。student 不带经验生成回答 <code>y</code>；对每个已生成前缀 <code>y&lt;t</code>，训练程序分别计算 student 的 <code>p</code> 与带经验 teacher 的 <code>q</code>。它们评价的是同一条回答，不会用 teacher 新生成的“更容易的解法”替换它。teacher 参数保持不变，更新只作用于 student。实现可以对整段回答批量计算这些位置的概率，并不需要逐词单独发起模型调用。</p><div class="code-scroll"><pre><code># 按论文 Algorithm 1 改写的伪代码，不是可运行的训练脚本
y = student.generate(task)  # 不加入历史经验
p = student.next_token_distributions(task, y)
q = frozen_teacher.next_token_distributions(experience + task, y)
loss = reverse_kl(p, q, vocabulary="student_top_256")
update(student, loss)  # teacher 不更新</code></pre></div>
<p>论文的完整词表定义是 <strong>KL(p‖q) = Σᵥ pᵥ log(pᵥ/qᵥ)</strong>，再对 student 经过的回答位置取平均。这里 <code>p</code> 是 student 对下一个词的概率，<code>q</code> 是带经验 teacher 的概率。举一个仅用于说明计算的二选一分布：teacher 为 (0.9, 0.1)，student 为 (0.7, 0.3)，KL 约 0.154；student 改为 (0.8, 0.2) 后约 0.044。这些概率不是论文测得的模型输出。</p>
<p>这里的一个 token 是模型输出序列中的一个单位，不必等于一个汉字或单词。附录 A.3 训练时只求和 student 概率最高的 256 个候选词。固定代码先对完整词表计算 <code>log_softmax</code>，再取 student 的 top-256 下标，让 teacher 在<strong>相同下标</strong>上给概率。数学和游戏示例默认 <code>kl_renorm_topk=False</code>，不把剩下的概率重新凑成总和为 1 的分布。这是截断求和，不等于完整 KL，也不保证每个位置的截断值非负。开启该开关才会分别对两边保留的候选词重新归一化；README 的 Llama-3.1-8B 安全任务显式开启，不能将所有实验视作同一开关。</p>
<div class="code-scroll"><pre><code># 按固定版本 core_algos.py / dp_actor.py 整理；省略模型 forward
# p_log 和 q_log 已在完整词表上归一化
indices = p_log.topk(256, dim=-1).indices
p_k = p_log.gather(-1, indices)
q_k = q_log.gather(-1, indices).detach()
token_loss = (p_k.exp() * (p_k - q_k)).sum(dim=-1)
loss = (token_loss * response_mask).sum() / response_mask.sum()</code></pre></div>
<p>代码默认 <code>loss_agg_mode=token-mean</code>：<code>response_mask</code> 把模型回答的位置记为 1、其余位置记为 0；训练将批次的有效回答 tokens 放在一起平均，长回答贡献更多位置；不等于先算每条回答的平均、再让每条回答等权。游戏程序将每步模型回答整理成训练样本，任务描述和环境反馈作为输入，不参与回答损失；最终奖励在这个蒸馏阶段<strong>只用于记录表现，不作为 GRPO 奖励更新参数</strong>。GRPO 是按任务奖励更新策略的算法，本文主训练走的是上述概率匹配。</p>

<figure class="figure wide"><a href="/lib/papers/on-policy-context-distillation/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/on-policy-context-distillation/body-method.svg" width="1050" height="823" alt="OPCD student 自己采样、teacher 读取经验及 reverse KL 更新" loading="lazy" decoding="async"></a><figcaption>根据 Figure 1 与 Algorithm 1 重绘。teacher 不生成替代解答；同一回答分别在带经验与不带经验的输入下计算概率。</figcaption></figure>

<h2 id="实验：任务判定、主结果与负对照">4. Experiments：任务判定、主结果与负对照</h2>

<p><strong>数学看答案正确率，游戏看任务完成率；经验文字流畅并不计分。</strong>数学测试有 1,000 题，游戏测试各 128 个任务。Frozen Lake 要在避开洞的同时到达目标；Sokoban 是 6×6 棋盘、一个箱子，要把箱子推到指定位置。模型通过 TextArena 接收文字状态并行动。游戏训练最多 5 轮，每轮最多生成 1,024 tokens；数学回答上限 16,384 tokens。论文统一训练 50 次更新、batch size 128，但官方示例脚本中的游戏 batch 为 64，不能把脚本默认值当成论文主表设置。</p><p>例如在 128 局中完成 49 局，成功率就是 <strong>49/128 ≈ 38.3%</strong>。这是根据分母举出的换算例子，不是声称论文发布了这 49 局的完整日志。论文未在文中逐项列出全部游戏异常和超时处理，本文也不将任务描述补写成未公开的 checker 实现。</p>
<p>固定版本的游戏 runner 将判定流程落实到代码：回答若出现多个合法括号动作，取<strong>最后一个</strong>；没有匹配则传入无效动作。执行 <code>env.step(action=...)</code> 后，完成或达到轮数上限就调用 <code>env.close()</code>。未完成且没有奖励记 0，所有小于 1 的奖励也归为 0，只有环境返回 1 才计成功。这里没有另请语言模型评价攻略是否合理。不过安装脚本没有固定 TextArena 版本，不能据当前上游代码声称已恢复论文当时的全部非法动作、墙碰撞和洞处理细节。</p>

<div class="table-scroll"><table><thead><tr><th>经验与评测条件</th><th>方法</th><th>Math · Qwen3-8B</th><th>Frozen Lake · Qwen3-1.7B</th><th>Sokoban · Qwen3-4B-Instruct</th></tr></thead><tbody><tr><td>Table 1，随机经验</td><td>Base</td><td>75.0%</td><td>6.3%</td><td>未报告</td></tr><tr><td>同上</td><td>直接查经验</td><td>77.6 ± 1.1%</td><td>20.2 ± 2.2%</td><td>未报告</td></tr><tr><td>同上</td><td>离线 context distillation</td><td>78.5 ± 0.5%</td><td>22.9 ± 4.0%</td><td>未报告</td></tr><tr><td>同上</td><td>OPCD</td><td><strong>79.7 ± 0.5%</strong></td><td>26.5 ± 6.4%</td><td>未报告</td></tr><tr><td>Table 2，验证后选经验</td><td>Base</td><td>75.0%</td><td>6.3%</td><td>9.4%</td></tr><tr><td>同上</td><td>直接查经验</td><td>79.0%</td><td>31.4%</td><td>48.4%</td></tr><tr><td>同上</td><td>离线 context distillation</td><td>79.5%</td><td>35.2%</td><td>51.6%</td></tr><tr><td>同上</td><td>OPCD</td><td>80.9%</td><td>38.3%</td><td><strong>53.9%</strong></td></tr></tbody></table></div><p>Table 1 的均值与 ± 来自三份不同经验下的实验；该表未明确 ± 是标准差还是标准误，不能把它读成同一经验下三个独立训练种子的误差条。验证后选经验整体更好，同时使用了额外的验证选择过程。OPCD 在同条件对照中高于离线蒸馏，支持在 student 自己的回答上训练有用；超过直接查经验还同时受益于额外训练题，不能全部归因于拿掉 context。</p>

<p>两项消融值得单独读。第一，Table 6 是<strong>经验积累至第十步期间的数学验证成绩平均</strong>：原始记录为 <strong>70.5%</strong>，不带经验为 <strong>75.1%</strong>，提炼后的经验为 <strong>77.4%</strong>；不是只测第十步终点，也不是上表 1,000 道测试题的同一次测量。第二，Table 5 的 Sokoban 冻结 teacher 为 <strong>53.9%</strong>，持续更新的同一模型同时当 teacher 和 student 只有 <strong>18.8%</strong>；医学 Qwen2.5-3B 对应为 56.8% 与 50.0%，不是下表 Qwen2.5-7B 的同一实验。</p>

<h3>系统提示：医学提高，安全分类不是全胜</h3>
<p>这组 context 来自 MetaSPO 优化的系统提示，不是游戏轨迹。医学按 MedMCQA 选择题正确答案判定；安全任务是 Tweet Eval、Hatecheck 和 Ethos 合并的分类数据。两类测试各 500 条，训练回答上限 512 tokens。</p>
<div class="table-scroll"><table><thead><tr><th>任务 / 模型</th><th>Base</th><th>直接带提示</th><th>离线蒸馏</th><th>OPCD</th></tr></thead><tbody><tr><td>医学 · Llama-3.1-8B</td><td>68.4%</td><td>72.2%</td><td>75.2%</td><td>76.7%</td></tr><tr><td>医学 · Llama-3.2-3B</td><td>59.4%</td><td>66.4%</td><td>71.0%</td><td>76.3%</td></tr><tr><td>医学 · Qwen2.5-7B</td><td>46.4%</td><td>52.6%</td><td>58.5%</td><td>62.3%</td></tr><tr><td>安全 · Llama-3.1-8B</td><td>70.7%</td><td>75.3%</td><td>77.2%</td><td>79.6%</td></tr><tr><td>安全 · Llama-3.2-3B</td><td>30.7%</td><td>69.5%</td><td><strong>83.3%</strong></td><td>83.1%</td></tr><tr><td>安全 · Qwen2.5-7B</td><td>69.1%</td><td>72.7%</td><td>77.0%</td><td>78.1%</td></tr></tbody></table></div>
<p>基本保留通用能力也需限定。IF-Eval 检查回答是否严格遵守指令，采用 prompt-level strict accuracy，即一道提示的全部要求都满足才算正确。随机经验的数学设置从 Base 81.3% 到 81.7 ± 0.4%，Frozen Lake 却从 67.3% 到 67.1 ± 0.5%；filtered 数学为 80.8%，Frozen Lake 为 66.7%，均低于 Base。Figure 3 则另用 Qwen2.5-7B 教 Qwen2.5-3B：训练安全分类、用医学测遗忘，不是 Table 3 的同尺寸实验。</p>

<figure class="figure wide"><a href="/lib/papers/on-policy-context-distillation/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/on-policy-context-distillation/body-results.svg" width="1050" height="760" alt="OPCD 随机经验主测试、冻结 teacher 消融与原始经验验证的不同条件" loading="lazy" decoding="async"></a><figcaption>根据 Tables 1、2、5、6 分开重绘。79.7% 为主测试；75.1、70.5、77.4 为积累至十步期间的验证平均，不能拼成同一测试曲线。</figcaption></figure>

<p>训练均为 50 次参数更新、batch size 128，学习率在 <code>1e-6</code> 与 <code>5e-6</code> 中搜索。<strong>经验实验每 2 步保存 checkpoint，报告测试准确率最高的版本；系统提示实验对测试分最高的三个 checkpoint 取平均</strong>。checkpoint 是保存的模型参数版本，后者不是三个随机种子的平均。用测试集挑版本后再报告同一测试集，会有选择偏差；复现时应另用验证集选择，再做一次最终测试。</p>

<h2 id="后续验证：将经验质量与训练收益分开">5. Discussion：将经验质量与训练收益分开</h2>

<p><strong>先测同一批历史在不同整理方式下是否有用，再比较蒸馏算法。</strong>可以固定历史任务、student、teacher 和训练预算，只改变 teacher 读取的是完整记录、模型总结，还是验证后选中的总结。随机经验与 filtered 经验应分开报告，因为后者多用了选择信号；还需要错配经验和无经验对照，才能排除收益仅来自额外训练。</p><p>对游戏代码数据，这是本文的延伸建议，不是论文已验证的结果：把完成项目中的 API 用法或修复记录整理成经验，student 仍从原始任务开始写代码，teacher 只在训练时读取经验。编译、测试和实际游玩仍需独立判断代码是否可用。论文研究的是文本解题与游戏行动，没有证明它能改善完整游戏项目生成。</p>

<h2 id="总结：有效的是整理后的经验，不是任意历史">6. Conclusion：有效的是整理后的经验，不是任意历史</h2>

<p><strong>OPCD 支持把整理过的经验训练进模型，但经验越多越好、共享 teacher 总更好都不成立。</strong>跨模型实验同样显示，直接把大模型的经验给小模型可能下降；让大模型带经验提供训练参照则可以改善小模型。经验内容、接收模型和训练过程需要一起验证。</p><p>官方代码位于 Microsoft LMOps 的 <code>opcd/</code>，代码核查基于固定 commit <code>6f53ef41c951de0962bbf27fe3f5819eabc8ce0e</code> 的损失、训练分支、游戏 runner、脚本与配置。经验文件需运行前置生成步骤，并非下载仓库就已具备；游戏示例 batch 64、温度 0.7，数学示例温度 0.6，不应替换论文主设置。安装脚本未固定 TextArena 版本。本次核查是阅读代码，没有重跑多 GPU 训练。</p><p>标题使用论文首页的原始英文标题；v2 首页仍为 <em>On-Policy Context Distillation for Language Models</em>，后续页眉写作 <em>Experiential Learning – Part I: On-Policy Context Distillation for Experiential Learning</em>，不能把页眉当作首页改题。个人兴趣程度 8.5/10，主要因为它把经验生成与使用方式列成可比较的实验；按测试成绩挑训练版本是必须保留的限制。</p>

<p class="source-note">证据范围：本文阅读全文与附录，并分别检查 PDF 文本和逐页渲染；代码结论固定到文中注明的 commit。兴趣程度 8.5/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

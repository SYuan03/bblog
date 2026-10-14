---
title: "[2026-08-05] Privileged, but Biased: How PI-Conditioned Teachers Break Self-Distillation"
permalink: "/posts/论文解读/privileged-but-biased.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:30:00+08:00"
cover: "/lib/papers/privileged-but-biased/cover.svg"
description: "这篇反例论文发现，训练辅助分支看过一条标准解后，可能更奖励“写得像标准解”，而不是真正正确。它用问答、数学、代码和多轮工具任务测试这一偏差。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Self-Distillation"
  - "Privileged Information"
  - "Bias"
  - "Negative Results"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Sarthak Harne, Chinmay Karkar, Yash Pandya, et al. · arXiv:2608.04794v1 · 最早公开于 2026-08-05</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.04794">论文主页</a><a href="https://arxiv.org/pdf/2608.04794v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="Privileged, but Biased 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练过程、真实案例 与复现边界</strong><a href="/lib/decks/privileged-but-biased-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/privileged-but-biased-visual-guide.html" title="Privileged, but Biased 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">给模型看过一道题的标准解，再让它指导另一个看不到标准解的分支，听起来很合理。问题是：它会鼓励“答案正确”，还是只鼓励“写得像刚才看过的解法”？这篇论文把最终成败奖励从训练目标中拿掉，专门检查这件事。多数长推理任务没有稳定获益，但短回答的代码和工具任务存在正面结果，不能概括成“全部失败”。</p>

<aside class="part0"><span class="kicker">PART 0 · 看过答案的分支如何教另一个分支</span><h3>一份额外答案，只在训练时可见</h3><p>直接回答问题、接受参数更新的分支叫 <strong>student（学生分支）</strong>。训练时，另一个分支额外看到正确解，并给学生已经写出的回答逐位置打概率；这叫 <strong>teacher（教师分支）</strong>。额外正确解就是 <strong>privileged information（PI，训练期特权信息）</strong>，测试时学生看不到它。</p><p>模型一次生成的完整回答叫 rollout；回答中一个文本片段叫 token。训练让两个分支对下一个 token 的概率尽量接近，这叫 self-distillation（自蒸馏）。<strong>本论文的主实验用缓慢跟随学生更新的教师副本，并非始终冻结初始模型。</strong>它另做了一组初始模型固定不动的对照，不能把两组设置混为一谈。</p></aside>

<div class="metrics" aria-label="关键证据"><div class="metric"><strong>0.5229 / 0.0202</strong><span>数学：原解／另一正确解的平均对数概率差</span></div><div class="metric"><strong>−4.28 点</strong><span>固定初始教师对照：数学平均变化</span></div><div class="metric"><strong>+4.68 点</strong><span>主实验：instruct 工具任务平均变化</span></div><div class="metric"><strong>9.5/10</strong><span>博客作者个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>阅读结论</h3><ul><li>看过一条正确解，确实大幅提高了教师对<strong>那条解</strong>的预测概率；另一条正确解得到的提高很小。</li><li>主实验中，数学、问答和长推理工具任务的平均结果下降；代码和工具任务的 instruct 模式却有正面结果。</li><li>论文研究的是<strong>仅靠蒸馏损失训练</strong>。没有测试它与可验证成败奖励联合训练是否有效。</li></ul></aside>

<h2 id="标准解为何未必是合适的训练目标">1. Motivation：标准解为何未必是合适的训练目标</h2>

<p><strong>“能预测一条正确解”与“能判断其他解是否正确”是两种能力。</strong>学生可能换一种推理顺序、尝试后再回头，最后仍然答对。教师看过参考解后，却可能更倾向于参考解的措辞和顺序。若所有位置都要求学生模仿这个概率分布，正确但不同的解法也可能受到很大的修改压力。</p>

<p>论文的出发点并不是蒸馏一定无效。作者先用 SDPO 的代码在 SciKnowEval 的生物、物理任务上复现“损失下降、验证分数上升”的趋势（Figure 1），再换到问答、数学、竞赛代码和多轮工具任务。中心问题是：<strong>不把任务是否成功写入训练目标，逐 token 模仿本身能否教会复杂任务？</strong></p>

<p>这里的“没有奖励”指没有把正确或错误的标量乘进训练损失；作者仍然需要检查器筛选正确解、划分成功与失败回答，以及评测任务。因此它也不是“不需要任何正确性判断”的方法。</p>

<h2 id="它与已有自蒸馏方法的关系">2. Related Work：它与已有自蒸馏方法的关系</h2>

<p><strong>这篇论文提供的是失效诊断，而非新的训练算法。</strong>它把已有方法中的额外答案、错误反馈和提示统称为 PI，再检查这些信息是否真能提供与正确性一致的逐位置指导。</p>

<div class="table-scroll"><table><thead><tr><th>方法或研究线</th><th>训练信号来自哪里</th><th>与本文的关键区别</th></tr></thead><tbody><tr><td>GRPO / RLVR</td><td>检查整条回答的正确性，用同组回答的奖励差指导更新</td><td>直接包含成败信号，但不是每一步都有细致反馈；本文主实验不保留这一奖励项</td></tr><tr><td>SDPO</td><td>教师额外看到成功回答或环境反馈，重评学生回答的 token 概率</td><td>本文在其代码上做仅蒸馏的压力测试，并采用更慢的教师更新和更强的损失截断</td></tr><tr><td>OPSD</td><td>用正确解改善教师的预测，再指导学生自己采样的回答</td><td>本文另设“OPSD recipe”对照：一条采样、固定答案、固定初始教师；这是本文明确报告的复现实验设置</td></tr><tr><td>Self-distilled RLVR（RLSD）</td><td>保留检查器奖励，让教师概率影响奖励对应的更新权重</td><td>从理论上讨论特权信息的泄漏；本文补充实际训练诊断，但没有复现实验去检验这种修复方法</td></tr><tr><td>Why does self-distillation (sometimes) degrade…</td><td>观察额外上下文使回答更简短、自信，却损害难题或迁移表现</td><td>本文进一步测量参考解偏好、不同 token 的损失和成功/失败回答之间的差异</td></tr></tbody></table></div>

<p>因此，“这组仅蒸馏设置没有稳定提升”不能推出“凡是使用 PI 的方法都没有价值”。即使论文把这些测量组织成一条解释链，§8 仍将研究界定为 observational（观察性分析），没有通过逐项干预证明每一环都是后续变化的独立原因。</p>

<h2 id="训练与诊断如何进行">3. Method：训练与诊断如何进行</h2>

<p><strong>先让学生回答，再让看过正确解的教师评价同一回答；诊断时额外比较四种候选解。</strong>训练与诊断的输入不同，下面分开说明。</p>

<h3 id="一次训练更新">3.1 一次训练更新</h3>

<ol><li>作者准备问题及一份正确解。问答、数学、代码各用 2,000 个训练样本；BFCL 多轮工具任务用 100 个训练任务。正确解选自模型自己答对的尝试，未宣称全部由人工撰写。</li><li>学生只看到问题，主实验对每题采样 8 条回答。它不知道教师将看到哪份参考解。</li><li>教师看到问题、参考解，以及学生已经生成的回答。在每个位置，两个分支使用相同的学生前文，计算下一 token 的概率；教师并不先写一条新回答供学生照抄。</li><li>作者用两个概率分布之间的 Jensen–Shannon divergence（JSD，一种衡量分布差异的数值）形成逐位置损失。教师侧的概率不接受这次梯度更新，学生接受更新。</li><li>教师参数随后缓慢跟随学生：<code>θT ← 0.999 θT + 0.001 θS</code>。这个移动平均叫 EMA；它与 JSD 的混合系数 <code>0.5</code>、损失截断值 <code>0.001</code> 是三件不同的事。</li></ol>

<figure class="figure"><a href="/lib/papers/privileged-but-biased/training-and-diagnosis.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/training-and-diagnosis.svg" width="980" height="450" alt="学生只看问题生成回答，教师多看正确解后重评同一回答；诊断另对四种目标解计算概率差"></a><figcaption>根据 §3–4、Appendix E 重绘。训练只更新学生；四种候选解属于诊断工具，不是每题训练必须生成的四条回答。点击查看大图。</figcaption></figure>

<p>主实验是 Qwen3-8B 的 think 与 instruct 模式，另用 Qwen3-32B 做问答规模对照。每批 32 题、3 轮训练；回答最多 16,384 tokens，教师重组输入最多 16,384 tokens；蒸馏保留 top-100 词项。大多数学习率为 <code>1e-5</code>，代码与工具任务降到 <code>1e-6</code>，使用一台 8×B200 机器。固定初始教师的 Table 2 对照则只有一条采样，并使用另一种 KL 目标；不能把 Table 1 与 Table 2 的差分当成同一次消融。</p>

<h3 id="真实题目：三种特权信息分别给了什么">3.2 真实题目：三种特权信息分别给了什么</h3>

<p>Figure 6 的数学训练题问：有多少个正整数 <code>k</code>，使 <code>lcm(6⁶, 8⁸, k) = 12¹²</code>？学生只看到题目。作者为同一道题分别准备三种教师输入，一次训练只提供其中一种：</p>

<ul><li><strong>Whole solution</strong>：一份正确解，包括质因数分解和推导。附录称移除了 reasoning trace（额外推理记录），但 Figure 6 仍展示数学推导；不能据此说它只剩最终答案。</li><li><strong>Hint</strong>：告诉教师用质因数分解，最小公倍数取各质数的最大指数，<code>k</code> 必须补足缺失指数且不能超出目标。另一个模型从问题与正确解生成这个提示；附录提示词要求 1–3 句，不泄露最终数值。</li><li><strong>Skill</strong>：按题目簇生成一张通用技巧卡，描述把约束改写成质因数指数、整除关系和计数问题。附录要求约 250–400 词，正文另写约 500；长度不是统一的 500-token 截断规则，也不是本题的完整解。</li></ul>

<figure class="figure"><a href="/lib/papers/privileged-but-biased/lcm-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/lcm-real-case.svg" width="980" height="460" alt="论文真实最小公倍数题：6的6次方与8的8次方已提供2的24次方，但必须由k补齐3的12次方，因此k有25种"></a><figcaption>题目和三种教师输入来自 Figure 6、Appendix C–D；右侧完整计数由本文计算。原图只展示部分解答，本图不冒充已发布的模型完整输出或检查日志。</figcaption></figure>

<p>具体计算是 <code>6⁶=2⁶·3⁶</code>，<code>8⁸=2²⁴</code>，目标 <code>12¹²=2²⁴·3¹²</code>。所以 <code>k</code> 只能含质数 2 和 3，必须提供 <code>3¹²</code>；2 的指数可为 0 到 24，共 <strong>25 种</strong>。下面是本文为核对这道题编写的 Python 3.12 示例，不是作者公开的训练或评测代码。</p>

```python
from math import lcm

valid = [2**a * 3**b for a in range(25) for b in range(13)
         if lcm(6**6, 8**8, 2**a * 3**b) == 12**12]
assert len(valid) == 25
assert all(k % 3**12 == 0 for k in valid)
print(len(valid))  # 25
```

<h3 id="PI-Bias-Score-到底算什么">3.3 PI Bias Score 到底算什么</h3>

<p>作者固定学生回答的前文，分别接上四种目标：教师看到的正确解、同题另一条正确解、同题错误解、另一道题的正确解。<strong>两分支都强制读取目标解已写出的前文</strong>，再计算目标每个 token 的概率，最后取平均；这种给定目标文本的评分过程叫 teacher forcing。它不是重新采样四条回答，也不是再运行一次正确性检查。</p>

<div class="equation">sM(w) = (1 / |w|) Σk log pM(wk | 问题、学生前文、目标前文 w&lt;k)<br>PI Bias Score(w) = sT(w) − sS(w)</div>

<p><code>M</code> 表示教师或学生，教师额外看到 PI；<code>w</code> 是目标解，<code>|w|</code> 是其 token 数。正值表示额外信息提高了对该目标解的预测概率。假设三个目标 token 的教师/学生概率比均为 2，这个分数就是 <code>log(2)≈0.693</code>；这是说明公式的假设值，不是实测输出。</p>

<p>Appendix E 指定评分长度上限 2,000 tokens，并说明所有目标都短于它，因此没有截断目标；只在 assistant 的文本位置测量，跳过超过 8,000 tokens 的提示，必要时先补上推理结束标记。每种目标的全部 token 可以用一次批量前向计算获得，并非逐字单独调用模型。<strong>这个分数衡量概率偏好，不衡量准确率，也不是条件互信息的数值估计。</strong></p>

<h2 id="结果：哪些下降，哪些没有">4. Experiments：哪些下降，哪些没有</h2>

<p><strong>负面结果主要集中在长推理模式，但正面例外不能省略。</strong>作者每个验证任务采样 4 条回答：数学、问答检查答案，代码报告测试用例通过比例，工具任务使用 BFCL 的成功指标。Table 1 的每个领域平均数是其各 benchmark 分数的等权平均，不是把所有题混成一个大分母；四条评测回答也不是四次独立训练种子。</p>

<div class="table-scroll"><table><thead><tr><th>主实验（Table 1）</th><th>think：原模型 → 蒸馏</th><th>变化</th><th>instruct：原模型 → 蒸馏</th><th>变化</th></tr></thead><tbody><tr><td>问答，6 项等权平均</td><td>60.93 → 59.37</td><td>−1.56</td><td>52.62 → 51.05</td><td>−1.57</td></tr><tr><td>数学，4 项等权平均</td><td>63.38 → 63.10</td><td>−0.28</td><td>34.82 → 33.02</td><td>−1.80</td></tr><tr><td>代码，5 项等权平均</td><td>47.62 → 47.32</td><td>−0.30</td><td>40.80 → 41.74</td><td><strong>+0.94</strong></td></tr><tr><td>工具任务，5 项等权平均</td><td>51.36 → 47.85</td><td>−3.51</td><td>28.90 → 33.58</td><td><strong>+4.68</strong></td></tr></tbody></table></div>

<p>代码 instruct 的平均提升主要来自 MBPP+：<code>43.2→55.8</code>，增加 12.6 点；HumanEval+、CodeElo、LCBv6、CodeForces 则下降。工具 instruct 的五项均上升。作者把短回答和小训练集作为解释，但这仍是解释，不能把表格中的正增益抹成“没有任何增益”。Figure 2 的 BFCL 训练曲线还使用两倍准确率的 score，不能直接和 Table 1 的准确率纵轴对比。</p>

<figure class="figure"><a href="/lib/papers/privileged-but-biased/positive-and-negative.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/positive-and-negative.svg" width="1000" height="455" alt="主实验八个领域与模式的分数变化，同时显示代码和工具instruct的正面结果；单列固定初始教师数学对照"></a><figcaption>根据 Table 1–2 重绘；单位为分数百分点。蓝色为正变化，深灰为负变化；固定初始教师的对照另列，避免混在一条训练曲线里。</figcaption></figure>

<p>固定初始教师的 Table 2 对照中，think 数学平均 <code>63.38→59.10</code>，下降 <strong>4.28 点</strong>；问答下降 1.96 点。它加强了“问题并非只出现于一种教师更新安排”的证据，但没有证明所有训练配方都失败。</p>

<h3 id="教师偏好与-token-损失">4.1 教师偏好与 token 损失</h3>

<p>Figure 3 的数学 PI Bias Score 是：原参考解 <strong>0.5229</strong>，另一正确解 <strong>0.0202</strong>，无关正确解 0.0059，错误解 0.0086。重要差异是原解与另一正确解之间的鸿沟；后三者的严格排序并不跨领域成立，不能写成“另一正确解总比错误解更受奖励”。</p>

<p>Figure 4 显示，成功与失败回答的平均损失约 <code>3.5×10⁻⁴</code>、平均 KL 差异约 <code>0.03</code>，分布大量重叠。某个代表性训练步中，停用词（如 the、of）、表示犹豫的词、标点与空白占 <strong>55.38% 的损失总量</strong>；这是损失占比，作者没有测出“55.38% 的参数梯度”。Figure 5 再除以各类 token 数，避免某类仅因为数量多而显得重要。</p>

<p>作者还按学生对参考解的预测概率排序：最高四分之一叫 on-path，最低四分之一叫 off-path。<strong>这不是人工标注的“正确路径/错误路径”，也不是逐字相似度。</strong>在学生最终答对的回答中，两组 KL 分布分别延伸到约 0.08 和 0.31；不是两组的平均 KL。它提示：即使回答最终正确，暂时不易接回参考解的位置仍有较大模仿压力。</p>

<h3 id="消融与证据边界">4.2 消融与证据边界</h3>

<ul><li>把完整答案换成短提示或技巧卡后，数学四项平均分别为 <code>58.25</code>、<code>59.92</code>，低于原模型 <code>63.38</code>（Table 3）。这些 PI 由模型生成，结果不能直接推及所有高质量提示。</li><li>分别用短、中、长回答训练，数学平均 <code>62.28 / 62.60 / 61.80</code>，均低于原模型（Table 4）。这检验了训练样本长度，不是让同一模型在推理时人为缩短回答。</li><li>按原模型 8 次采样的成功率选较易、中等、较难训练题，问答平均变化 <code>−3.60 / −1.43 / −1.58</code>；“较易”仅指从此训练集选出的题，不是全球范围的容易任务。32B 问答对照也略降（Table 5）。</li></ul>

<p>学生与教师的带符号平均 log 概率差最后接近零，但逐位置差异的标准差仍约为 1；正负相消不等于每个位置都一致。作者同时观察到多数领域的输出分布更平、回答更短。它们支持失效解释，却不足以证明“压制某个词”独立造成准确率下降。若差值只有 0.28 或 0.30 点，还应注意表格给出的采样波动，不能把小差异夸成确定的大幅退化。</p>

<h2 id="这项诊断可以怎样用于后续研究">5. Discussion：这项诊断可以怎样用于后续研究</h2>

<p><strong>先检查额外上下文指导了什么，再决定是否把它变成训练目标。</strong>论文没有提出已验证的修复算法。一个直接的后续实验是保留同一训练题的两份不同正确解，检查教师是否只抬高它看过的那份；再更换参考解，判断偏好是否随之切换。</p>

<p>如果研究代码生成，可以选“功能都正确但写法不同”“写法近似但某个测试失败”两类程序，分别检查任务测试和教师概率。这样才分得清模型学到功能，还是学到参考实现的外形。这是本文建议，不是原论文已经跑过的游戏代码实验。</p>

<p>若再加入成败奖励，至少应与奖励单独训练、蒸馏单独训练做相同采样预算的比较，并报告正确替代解是否被压低。仅看到最终通过率提升，不能确认它来自更好的逐位置指导；也可能来自奖励项、更多采样或不同训练数据。</p>

<h2 id="应当保留的结论与未解决的问题">6. Conclusion：应当保留的结论与未解决的问题</h2>

<p><strong>下降的蒸馏损失，不足以说明模型更会做题。</strong>这篇论文最有用的贡献，是把“教师看到正确解”拆成可测的概率偏好，并提供成功/失败、token 类别和参考解接续概率的对照。</p>

<p>限制同样明确：主要只有 Qwen3 一种模型家族；四条验证回答不是多种子训练复现；PI 的质量、不同正确解的选择和提示构造会影响诊断；保留奖励的训练未测试。作者在 §4 声称代码位于 supplementary（补充材料），但 2026-10-08 检查的公开 arXiv 源文件包只有论文与图片，未找到对应实验代码或官方仓库；因此本文公式示例不能当作可完整复现实验的代码。</p>

<p class="source-note">本次修订核对 arXiv v1 的全部 24 页正文与附录及逐页渲染，补正教师安排、四种目标的评分方式和正面结果。主文 Eq. 2 简写了目标条件，本文采用 Appendix E 包含目标前文的完整定义。兴趣程度 9.5/10 仅表示博客作者个人兴趣，不是通用论文评分。</p>

</div>

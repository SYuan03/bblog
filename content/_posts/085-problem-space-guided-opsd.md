---
title: "[2026-08-03] Is More Privileged Information Better? From Solution Traces to Problem-Solving Structure in Self-Distilled Reasoning"
permalink: "/posts/论文解读/problem-space-guided-opsd.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:30:00+08:00"
cover: "/lib/papers/problem-space-guided-opsd/cover.svg"
description: "PS-OPSD 从已验证的解答中提取题目起点、目标、约束和一条解法的关键步骤，只在训练时让固定模型多看这些资料。主表优于完整解答，但统一模型版本的结果并不都提高，代码也未公开。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "OPSD"
  - "Problem Space"
  - "Structured Context"
  - "Reasoning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Xuyang Zhao, Liting Zhang, Zichen Xu, et al. · arXiv:2608.01589v1 · 最早公开于 2026-08-03</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.01589">论文主页</a><a href="https://arxiv.org/pdf/2608.01589v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="PS-OPSD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练过程、真实案例 与复现边界</strong><a href="/lib/decks/problem-space-guided-opsd-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/problem-space-guided-opsd-visual-guide.html" title="PS-OPSD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">训练时给教师一份标准解，并不一定比给它一份解题方法更好。这篇论文把标准解改写成“已知条件、成功条件、必须遵守的约束、几步变换”，只有教师能看这份提示，学生仍只看题目。三个模型规模的主表平均分都提高，但主表允许每个测试集挑不同的最佳模型；换一种统一模型的比较，优势并不总存在。</p>

<aside class="part0"><span class="kicker">PART 0 · 哪个模型看到提示，哪个模型接受训练</span><h3>教师多看一份材料，学生自己生成回答</h3><p>接受更新、最后部署的模型叫 student（学生）；额外看到训练材料并给学生回答打概率的分支叫 teacher（教师）。只在训练时给教师的材料叫 privileged information（特权信息）。本文的教师固定为初始 Qwen3，学生只更新 LoRA：即附加在模型中的少量可训练参数，主体参数不变。</p><p>学生一次生成的完整回答叫 rollout；其中一个 token 是模型一步预测的文字单位。教师重评学生已经写出的同一回答，而非先写一条新答案让学生背诵；这就是本文使用的 on-policy self-distillation（OPSD，基于学生当前回答的自蒸馏）。</p></aside>

<div class="metrics"><div class="metric"><strong>64.32 ± 0.33</strong><span>4B：按测试集选最佳模型后的平均</span></div><div class="metric"><strong>+0.00 点</strong><span>4B：另一组统一模型比较，相对 OPSD</span></div><div class="metric"><strong>12 次 / 题</strong><span>平均正确率，不是“至少答对一次”</span></div><div class="metric"><strong>8/10</strong><span>博客作者个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>主要结论</h3><ul><li>它只改变教师输入的表示，<strong>不改变学生输入或蒸馏目标</strong>；提示由模型离线提取，不是人工逐题撰写。</li><li>换成同长度但来自另一题的提示，4B 平均分从 64.32 降到 61.76；有用的是与本题相关的信息，不只是长度。</li><li>提示仍来自<strong>一条参考解</strong>，并未枚举所有解法；公开材料也不足以完整复现实验。</li></ul></aside>

<h2 id="为什么不直接把完整标准解给教师">1. Motivation：为什么不直接把完整标准解给教师</h2>

<p><strong>作者希望保留解题关系，减少教师对具体答案、措辞和计算顺序的依赖。</strong>完整标准解同时包含通用方法和本题算出的具体数值。教师看到它以后，对学生下一个词的偏好可能来自“知道最终答案”，而不是学生当前前文真的支持那一步。</p>

<p>作者把正确解改写成 <strong>Problem-Space Guidance</strong>：记录从题目出发怎样进行合法变换的提示。它不是自动求解器，也不是完整的所有可达状态图。论文明确只提取某条已验证解法实际用过的状态和操作；“抽象了措辞”不等于“消除了单一解法偏好”。</p>

<h2 id="与答案蒸馏、计划辅助方法有什么不同">2. Related Work：与答案蒸馏、计划辅助方法有什么不同</h2>

<p><strong>贡献集中在教师上下文的设计，不是“用解题计划”这个概念本身。</strong>Related Work 已承认，从解答提取模板、计划、推理骨架的研究很多。它的对照问题是：学生采样和损失固定时，哪种教师输入更合适？</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>教师或学生多得到什么</th><th>本文区别</th></tr></thead><tbody><tr><td>OPSD</td><td>教师看到完整正确解</td><td>改成固定的四字段变换提示，学生仍只看问题</td></tr><tr><td>AVSD</td><td>完整解、部分解、只给答案等多个教师视角，组合它们的监督</td><td>本文只有一个教师视角；AVSD 是方法对照，不是单纯“同长度另一种表示”</td></tr><tr><td>PAINT / Adaptive Teacher Exposure</td><td>选择给教师看多少参考解，可能随训练或位置变化</td><td>本文在训练前提取并缓存提示，训练期间不再调整曝光范围</td></tr><tr><td>Training with Harnesses（OPHSD）</td><td>通过多阶段计划与求解产生受辅助的行为，再训练不受辅助的模型</td><td>本文不在每次更新中运行计划—验证流程，只改固定教师输入</td></tr><tr><td>SuperCorrect / Reasoning Scaffolding</td><td>从解答中提取层次模板或语义推理信号</td><td>说明解答抽象不是全新思想；本文强调用于相同 OPSD 目标的状态变换表示</td></tr></tbody></table></div>

<h2 id="方法：从标准解提取四字段，再重评学生回答">3. Method：从标准解提取四字段，再重评学生回答</h2>

<p><strong>先离线生成提示，训练时保持提示与教师固定，只更新学生。</strong>训练数据来自 OpenThoughts 的数学子集；提取模型为 Qwen3.6-35B-A3B。它读取题目和验证过的参考解，输出提示并缓存。论文没有宣称这批提示经过逐条人工标注，也没有公开完整生成与校验脚本。</p>

<figure class="figure"><a href="/lib/papers/problem-space-guided-opsd/teacher-context-flow.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/teacher-context-flow.svg" width="980" height="420" alt="离线提取模型把问题和正确解转成四字段提示，训练时固定教师重评学生只看问题生成的回答"></a><figcaption>根据 Figure 1、Algorithm 1 与 §4 重绘。提取模型不参与每次训练更新；测试没有参考解、提示或教师。点击查看大图。</figcaption></figure>

<p>一次更新的执行顺序是：学生只看题目生成回答；固定教师读取“题目 + 缓存提示 + 相同学生前文”；学生读取“题目 + 相同学生前文”；训练器比较每个位置的下一 token 概率。教师关闭 LoRA 且不跟踪梯度，学生只更新 LoRA。提示没有被拼进学生采样或部署输入。</p>

<h3 id="原论文示例：顺流、逆流速度题">3.1 原论文示例：顺流、逆流速度题</h3>

<p>Figure 2 用一道人为写成符号形式的船速题解释表示，不是一个公布了任务 ID 和完整模型输出的 benchmark 样本。船在两次旅程中分别顺流 <code>a、c</code> km、逆流 <code>b、d</code> km，耗时 <code>T₁、T₂</code> 小时，求静水速度 <code>v</code> 和水流速度 <code>u</code>。</p>

<div class="table-scroll"><table><thead><tr><th>提示字段</th><th>这道题实际写什么</th></tr></thead><tbody><tr><td>Initial State（初始条件）</td><td>两个方程：<code>a/(v+u)+b/(v−u)=T₁</code>，<code>c/(v+u)+d/(v−u)=T₂</code></td></tr><tr><td>Goal Conditions（成功条件）</td><td>恢复 <code>v、u</code>，代回两式都成立，且 <code>v&gt;u&gt;0</code></td></tr><tr><td>Constraints（约束）</td><td>分母不为零；二元方程组行列式 <code>ad−bc≠0</code></td></tr><tr><td>Selected State-Transition Path（选定变换步骤）</td><td>先设倒数变量使方程线性化，再解二元方程组，最后反变换并检查目标</td></tr></tbody></table></div>

<figure class="figure"><a href="/lib/papers/problem-space-guided-opsd/boat-worked-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/boat-worked-case.svg" width="1000" height="450" alt="顺逆流案例的三个变换：倒数线性化、解二元方程、恢复v和u；教学数值求出v10u2"></a><figcaption>变换结构来自 Figure 2；数值 <code>a=12,b=8,c=6,d=12,T₁=T₂=2</code> 由本文补充以便计算，不是论文真实测试样本。</figcaption></figure>

<p>每步变换又有四项：Operator（做什么）、Preconditions（做之前的条件）、Transformation（具体改写）、Resulting State（改写后的关系）。第一步设 <code>p=1/(v+u), q=1/(v−u)</code>；在分母非零时，得到 <code>ap+bq=T₁, cp+dq=T₂</code>。第二步在 <code>ad−bc≠0</code> 时解出 <code>p、q</code>。第三步在 <code>p、q≠0</code> 时恢复 <code>v=(1/p+1/q)/2</code>、<code>u=(1/p−1/q)/2</code>。提示保留操作，不直接写本题最终实例化答案。</p>

<p>以下是本文为 Figure 2 补写的 Python 3.12 精确分数示例，可核对变换；它不包含模型训练，不是作者代码：</p>

```python
from fractions import Fraction as F

a, b, c, d, t1, t2 = map(F, (12, 8, 6, 12, 2, 2))
det = a*d - b*c
assert det != 0
p, q = (t1*d - b*t2)/det, (a*t2 - c*t1)/det
v, u = (1/p + 1/q)/2, (1/p - 1/q)/2
assert v > u > 0
assert a/(v+u) + b/(v-u) == t1
assert c/(v+u) + d/(v-u) == t2
print(v, u)  # 10 2
```

<h3 id="损失：截断发生在词表项，不是整句">3.2 损失：截断发生在词表项，不是整句</h3>

<p>论文沿用一个截断后的 KL 形式目标，先按温度 <code>T</code> 缩放教师与学生对候选词的原始打分（logits），再用 softmax 将它们转成概率 <code>pT、pS</code>；再对<strong>词表中每一项</strong>计算贡献：</p>

<div class="equation">d(v) = pT(v) · log[pT(v) / pS(v)]<br>每个回答位置的损失 = Σv min[d(v), c]<br>一条回答的损失 = 非 padding（补齐空位）位置的平均</div>

<p><code>v</code> 在这里表示词表项，不是船速变量；<code>c</code> 是截断阈值。若某词概率为 <code>pT=0.2,pS=0.1</code>，贡献是 <code>0.2·log 2≈0.1386</code>，超过阈值时截到 <code>c</code>。这是假设概率，只用于说明公式。作者明确计算<strong>全词表</strong>，截断后不再是未修改的数学 KL；不能写成只给采样词的损失设上限。论文称温度与阈值绑定各次运行配置，却没有给出完整配置，无法复原数值训练过程。</p>

<h2 id="实验：主表优势与统一模型比较须分开">4. Experiments：主表优势与统一模型比较须分开</h2>

<p><strong>三个规模的主表平均分最高，但它不是一个固定部署模型在所有测试集上的统一结果。</strong>测试为 AIME24、AIME25、HMMT25，每题存储 12 条只看问题的回答，统计其中答对多少条：</p>

<div class="equation">Accuracy = 100 × Σi ci / (12N)<br>Avg = (AIME24 Accuracy + AIME25 Accuracy + HMMT25 Accuracy) / 3</div>

<p><code>ci</code> 是第 <code>i</code> 题答对的次数，<code>N</code> 为该测试集题数。某题 12 次答对 6 次，平均准确率贡献为 50%；若看 pass@12（至少一次成功的题目比例），该题却算成功。两者不能互换。Table 1 的 ± 是<strong>三个独立训练种子的样本标准差</strong>，与每题 12 次采样是不同层次的重复。</p>

<div class="table-scroll"><table><thead><tr><th>模型</th><th>Base</th><th>GRPO</th><th>OPSD</th><th>AVSD</th><th>PS-OPSD</th></tr></thead><tbody><tr><td>Qwen3-1.7B</td><td>36.67</td><td>37.69 ± 0.09</td><td>41.08 ± 0.28</td><td>39.01 ± 0.57</td><td><strong>43.12 ± 2.00</strong></td></tr><tr><td>Qwen3-4B</td><td>61.76</td><td>62.38 ± 0.84</td><td>61.70 ± 0.79</td><td>62.78 ± 0.19</td><td><strong>64.32 ± 0.33</strong></td></tr><tr><td>Qwen3-8B</td><td>62.31</td><td>63.30 ± 0.46</td><td>63.58 ± 0.62</td><td>63.64 ± 0.96</td><td><strong>65.40 ± 0.21</strong></td></tr></tbody></table></div>

<p>作者对每个方法、每个 benchmark，在<strong>正在报告的测试集</strong>上挑跨三个种子平均分最高的 checkpoint（训练期间保存的参数版本）。所以 Avg 可能把三个不同 checkpoint 的最好成绩拼起来；作者称其 oracle envelope。它是看过测试结果后的上限式比较，不是提前在独立验证集选定的部署成绩。</p>

<figure class="figure"><a href="/lib/papers/problem-space-guided-opsd/checkpoint-evidence.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/checkpoint-evidence.svg" width="1000" height="450" alt="按测试集选最佳checkpoint的主表，与每个方法选统一checkpoint的Table5对照不相同"></a><figcaption>根据 Table 1 与 Table 5 重绘。Table 5 每个方法改用其三项平均最高的同一 checkpoint，得到不同的 PS-OPSD 相对 OPSD 差值。</figcaption></figure>

<p><strong>Table 5 是关键限定。</strong>每个方法使用自己平均分最高的同一 checkpoint 后，PS-OPSD 相对 OPSD 的平均变化分别为 <code>−0.68 / +0.00 / +0.68</code> 点（1.7B / 4B / 8B），pass@12 变化 <code>−4.44 / +1.11 / +4.44</code> 点。不能只保留主表就宣称所有规模在统一模型条件下都更好。4B Figure 3 的相同训练步比较提供另一组证据：末端优于 OPSD，但并非每个中间 checkpoint 都领先。</p>

<h3 id="表示消融：什么被固定，什么被破坏">4.1 表示消融：什么被固定，什么被破坏</h3>

<div class="table-scroll"><table><thead><tr><th>4B 教师提示</th><th>修改方式</th><th>主表式 Avg</th></tr></thead><tbody><tr><td>完整四字段</td><td>保留字段、内容及步骤次序</td><td>64.32</td></tr><tr><td>Flattened PS</td><td>去字段名、层次和步骤分隔符，保留内容、次序、token 预算</td><td>63.61</td></tr><tr><td>Mismatched PS</td><td>换成另一题的提示，匹配题型、难度和长度</td><td>61.76</td></tr><tr><td>Path-Corrupted PS</td><td>保留每步内部内容，破坏跨步骤依赖和整体次序</td><td>62.19</td></tr></tbody></table></div>

<p>同长度错题提示和乱序提示都更差，支持本题相关性与变换连贯性的重要性；字段结构的平均优势仅 0.71 点，且 Flattened PS 在 HMMT25 反而高 1.39 点。消融同样允许在所报告测试集挑最佳 checkpoint，不应夸成无条件证明“结构化一定更好”。</p>

<h3 id="能力覆盖与看不见提示的引用">4.2 能力覆盖与看不见提示的引用</h3>

<p>4B 的 90 道测试题中，PS-OPSD 比 Base 在 18 题答对次数更多、7 题更少、65 题相同，平均 +2.56 点；相对 OPSD 则是 23 题更好、9 题更差、58 题相同。注意“答对次数更多”不等于新解出了 18 道原本完全不会的题。Table 4 另看 Base 的 12 次都未成功的难题：成功覆盖率从 OPSD 的 8.70% 到 PS-OPSD 的 13.04%；Base 已会题的保留率为 98.51%，净覆盖增长 +2，与 GRPO 相同。</p>

<p>作者统计学生回答是否明确引用看不到的参考答案、提示或指导材料；训练题的发生率 OPSD 为 3.0%，PS-OPSD 为 0.5%，未见验证题为 2.2% 与 0.4%（Figure 4）。这说明<strong>某种可见行为</strong>减少，不是严格证明没有信息泄漏。Table 5 的正确回答 token 熵衡量预测分布是否集中，也不是不同解题策略的语义多样性；1.7B 相对 OPSD 的覆盖率和平均分更差，不能只解释熵变化而忽略任务结果。</p>

<h2 id="后续最值得验证的方向">5. Discussion：后续最值得验证的方向</h2>

<p><strong>先统一 checkpoint 选择与采样预算，再检验提示是否真的支持不同解法。</strong>最直接的改进是用独立验证集选一个模型，再固定它报告所有 benchmark；同时给出最终 checkpoint 和最好验证 checkpoint 的结果，避免主表式拼接。</p>

<p>表示方面，应该比较来自不同正确解的提示、没有选定变换路径的约束提示，以及学生走到参考步骤之外时提示是否仍有用。若用于代码任务，可以从完成的程序提取功能条件和操作规则，再用功能测试验证迁移；但本论文没有游戏或代码实验，不能把这些设想说成它已经支持的结论。</p>

<h2 id="结论与复现限制">6. Conclusion：结论与复现限制</h2>

<p><strong>它把“教师多看什么”变成了一个可实验比较的问题。</strong>四字段和顺逆流案例让这个想法容易重建；错题与破坏步骤依赖的对照也比只比较“长提示/短提示”更有区分力。</p>

<p>结果限于三个 Qwen3 规模与竞赛数学。提示只来自一份正确解；没有独立证明减少所有特权信息依赖，统一模型比较也不普遍领先。论文未公开官方仓库、完整运行配置、精确温度/截断值、LoRA 参数和全部训练超参数，离线提取成本也未完整计入。因而它适合作为表示设计的参考，尚不能当作配置齐全、可直接重跑的基线。</p>

<p class="source-note">本次修订核对 v1 全部 9 页文本与渲染（没有单独附录），补入 Figure 2 示例、词表项截断定义、Table 5 的反向结果和 checkpoint 选择条件。代码可用性依据 2026-10-08 公开检索记录；兴趣程度 8/10 仅表示博客作者个人兴趣。</p>

</div>

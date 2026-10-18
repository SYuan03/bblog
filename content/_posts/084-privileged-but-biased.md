---
title: "[2026-08-05] Privileged, but Biased: How PI-Conditioned Teachers Break Self-Distillation"
permalink: "/posts/论文解读/privileged-but-biased.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-18T20:00:00+08:00"
cover: "/lib/papers/privileged-but-biased/cover.svg"
description: "训练时让模型多看一份正确解，可能更容易教它模仿那份解，却没有提高实际正确率。这篇论文测量了这种偏好，也留下代码和工具任务表现变好的反例。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 15
categories:
  - "论文解读"
tags:
  - "Self-Distillation"
  - "Privileged Information"
  - "Bias"
  - "Negative Results"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>
@media (max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.readable-original>a,body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a{display:block;width:100%;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.readable-original>a>img,body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a>img{width:780px;max-width:none;height:auto}body.page-paper-reading.page-paper-editorial .prose .figure.original.narrow>a>img{width:480px;max-width:none}}
</style>

<div class="paper-reading">

<p class="paper-meta">Sarthak Harne, Chinmay Karkar, Yash Pandya, Ahmed Awadallah, Akshay Nambi · arXiv:2608.04794v1 · 最早公开于 2026-08-05</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.04794">论文主页</a><a href="https://arxiv.org/pdf/2608.04794v1">论文 PDF</a><a href="https://arxiv.org/html/2608.04794v1">原文 HTML</a></div>

<section class="deck-wrap" aria-label="Privileged, but Biased 交互图解">
  <div class="deck-head"><strong>15 页交互图解 · 训练、真实题目与诊断证据</strong><a href="/lib/decks/privileged-but-biased-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/privileged-but-biased-visual-guide.html" title="Privileged, but Biased 论文图解，共 15 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机可滚动页内内容和原图；Esc 退出全屏</span></p></div>
</section>

<p class="lead">给模型一份正确解，再让它指导看不到答案的另一个分支，能否教会模型更好地做题？这篇论文检查了一个具体风险：教师更容易预测刚看过的那份解，却未必更认可另一种正确解。多数实验的蒸馏损失下降，实际成绩没有提高；但代码和工具任务存在正面结果，不能读成“自蒸馏全部失败”。</p>

<aside class="part0"><span class="kicker">PART 0 · 两次模型计算</span><p>作答分支（student）只看问题，自己生成一份回答；一次采样的完整回答叫 rollout，token 是模型预测的文字单位。评分分支（teacher）多看一份正确解，在 student 已写出的前文上计算下一 token 的概率。只有 teacher 看到的额外训练信息，叫 privileged information（PI）。训练程序让两种概率分布接近，这就是本文的 self-distillation（自蒸馏）。测试时只用 student，它看不到 PI。</p><p>本文的主设置用一个<strong>缓慢跟随学生更新的教师副本</strong>。teacher 的概率在本次损失中不接受梯度，并不表示这个副本始终固定不动。论文分别测试 think（启用长推理）和 instruct（较短的作答）两种模式。</p></aside>

<aside class="keypoints"><ul><li>数学中，教师对原参考解的平均 log 概率增益是 <strong>0.5229</strong>，另一份正确解只有 <strong>0.0202</strong>。</li><li>8 个领域／模式平均中，6 个下降；instruct 模式的代码 <strong>+0.94</strong>、工具任务 <strong>+4.68</strong> 点，是必须保留的反例。</li><li>论文没有测试蒸馏与正确性奖励联合训练，也没有验证完整因果链。博客作者个人兴趣程度：9.5/10。</li></ul></aside>

<h2 id="标准解为何未必是合适的训练目标">1. Motivation：预测参考解与学会解题的差别</h2>

<p><strong>能预测一条正确解，不等于能指导其他正确解。</strong>学生可能换一种推理顺序，或者先试一个办法再回头，最终仍然答对。教师看过参考解后，更倾向于那份解的用词和顺序；若学生每个位置都要模仿它的概率分布，另一种正确回答也可能受到较大的修改压力。</p>
<p>作者先在 SciKnowEval 的生物、物理任务上复现 SDPO 的正面趋势，再换到问答、数学、竞赛代码和多轮工具任务。研究问题是：只用逐 token 蒸馏，能否稳定提高复杂任务的成功率？这里的“没有奖励项”只指<strong>任务成败不直接进入优化损失</strong>；筛选正确参考解、划分答对／答错回答和评测，仍然需要正确性检查。</p>

<details class="supplement"><summary>原始正面对照：SciKnowEval 复现曲线（Figure 1）</summary><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-1.webp" width="1632" height="300" alt="原论文 Figure 1，Biology与Physics损失下降、验证准确率上升"></a><figcaption>Harne et al.，原论文 Figure 1，CC BY-NC-SA 4.0；仅裁去图外正文。这个对照支持代码能在该任务产生预期趋势，没有排除其他任务中的所有实现问题。</figcaption></figure></details>

<h2 id="它与已有自蒸馏方法的关系">2. Related Work：概率模仿与正确性奖励</h2>

<p><strong>本文是诊断已有目标的研究，没有提出新训练算法。</strong>最重要的比较是“教师概率替代奖励”与“保留奖励、再使用教师概率”；结果只覆盖前者。</p>

<div class="table-scroll"><table><thead><tr><th>设置</th><th>反馈和更新</th><th>本文检验到哪里</th></tr></thead><tbody><tr><td>GRPO / RLVR</td><td>检查整份回答的成败，比较同题多份回答的奖励</td><td>本文研究的是拿掉此奖励项后的蒸馏</td></tr><tr><td>SDPO</td><td>教师多看成功回答或环境反馈，重评学生回答的 token 概率</td><td>主设置基于其代码，使用慢速教师更新与损失截断</td></tr><tr><td>OPSD</td><td>教师多看正确解，在学生自己生成的回答上蒸馏</td><td>另做固定初始教师、固定正确解、每题 1 条采样的对照</td></tr><tr><td>Self-distilled RLVR（RLSD）</td><td>教师概率调整由检查器奖励决定的更新权重</td><td>本文没有训练或评测这种奖励保留组合</td></tr><tr><td><a href="https://arxiv.org/abs/2603.24472">Why does self-distillation (sometimes) degrade…</a></td><td>测量额外上下文如何改变自信表达、回答长度和难题成绩</td><td>本文增加参考解偏好、token 损失和答对／答错分组诊断</td></tr></tbody></table></div>

<p>主设置与 OPSD 对照同时改变教师更新、采样条数、散度方向和截断安排。因此 Table 1 与 Table 2 的差分不是“只改变教师”的单项消融，也不能代替与最优 OPSD 配方的公平比较。</p>

<h2 id="训练与诊断如何进行">3. Method：训练一次，再测参考解偏好</h2>

<p><strong>学生先回答，教师再给同一回答打概率；四种候选解只用于诊断。</strong>理解这两套输入，才能判断结果说明了什么。</p>

<h3 id="一次训练更新">3.1 一次更新：谁看到什么，谁接受梯度</h3>

<ol><li>作者从 MMLU-Pro、DAPO-Math、CodeForces 各取 2,000 个训练样本，多轮工具任务用测试函数调用的 BFCL v3 base 的 100 题。</li><li>student 只看问题，每题采样 8 条回答。程序检查成败，随机选一条正确尝试作为 teacher 的 PI；论文没有说这些解都由人工撰写。</li><li>teacher 多看 PI，在每个学生前文上计算下一 token 分布 pT；student 在相同前文上计算 pS。teacher 不先写一份新答案供学生照抄。</li><li>训练程序用 Jensen-Shannon divergence（JSD，衡量两种概率分布差异的数值）形成逐 token 损失，截断值为 0.001。教师概率停止梯度，只有学生分支接受更新。</li><li>更新后，教师副本按 <code>θT ← 0.999 θT + 0.001 θS</code> 跟随学生。这种移动平均叫 EMA。</li></ol>

<figure class="figure reading-diagram"><a href="/lib/papers/privileged-but-biased/training-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/training-compact.svg" width="900" height="310" alt="学生只看问题生成回答，教师多看正确解后对相同前文评分，比较分布更新学生，教师缓慢跟随"></a><figcaption>本文根据 §3–4、Appendix B 补充的训练流程图。四目标诊断不在这条训练路径里；手机可横向滚动查看。</figcaption></figure>

<p>论文没有说明一题 8 条都答错时怎样处理，也没有说明会不会把正在训练的回答本身选作参考解。这里不能直接套用上游 SDPO 的默认代码。</p>

<details class="supplement"><summary>损失公式：JSD 的对称比较和逐回答平均</summary><div class="formula"><code>m = (pT+pS)/2<br>JSD(pT,pS) = ½ KL(pT ∥ m) + ½ KL(pS ∥ m)<br>LSD = E<sub>题目与学生采样回答 y</sub> [(1/|y|) Σt D<sub>t</sub>]</code></div><p>KL 是两个下一 token 概率分布的差异；JSD 对 teacher、student 对称地比较，混合系数为 0.5。Eq. 1 在每份回答内除以 token 数 |y|，再对题目和回答取期望；§4 说明另做逐 token 截断。附录没有给截断与 top-100 的完整实现，不能确认具体批处理代码是否与这个逐回答平均完全一致。</p></details>

<details class="supplement"><summary>完整配置和数据原表：Table 6–7，以及划分缺口</summary><p>主模型为 Qwen3-8B，分别启用 think（生成长推理）与 instruct 模式；每批 32 题、训练 3 轮，回答最多 16,384 tokens，蒸馏保留 top-100 词项。JSD 混合系数 0.5、教师 EMA 速率 0.001、损失截断 0.001 是三件不同的事。代码与工具学习率 1e-6，其他主设置 1e-5；机器为单节点 8×B200。</p><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/table-6.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-6.webp" width="1492" height="316" alt="原论文 Table 6，各域训练数据、同域验证和迁移benchmark"></a><figcaption>Harne et al.，原论文 Table 6，CC BY-NC-SA 4.0；裁去表外正文，全部行保留。</figcaption></figure><p>Appendix A.1 说从同域数据按原模型通过率分层抽 300 个验证样本，迁移评测用完整数据；SciKnowEval 子集按 90/10 划分。BFCL 总共只有 100 个任务，却没有解释如何适用“300 个验证样本”的通用说明。训练／验证任务 ID、是否重叠、PI 生成模型和完整 judge 程序均未发布。</p><figure class="figure original readable-original portrait"><a href="/lib/papers/privileged-but-biased/table-7.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-7.webp" width="1488" height="1548" alt="原论文 Table 7，完整训练超参数"></a><figcaption>Harne et al.，原论文 Table 7，CC BY-NC-SA 4.0；全部配置行保留。32B 实验另设回答上限 10,240、总上下文 12,288，张量并行 4。</figcaption></figure></details>

<h3 id="真实题目：三种特权信息分别给了什么">3.2 真实题目：最小公倍数的三种教师输入</h3>

<p>Figure 6 问：有多少个正整数 k，使 <code>lcm(6⁶, 8⁸, k)=12¹²</code>？lcm 是最小公倍数。学生只看到题目；teacher 一次看到以下一种信息：whole solution 是模型自己答对的一份解，hint 是另一个模型抽出的短提示，skill 是按题目簇生成的通用技巧卡。</p>

<figure class="figure original narrow readable-original"><a href="/lib/papers/privileged-but-biased/figure-6-hint-detail.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-6-hint-detail.webp" width="810" height="329" alt="Figure 6 原始 Hint 局部，提示以质因数分解和指数最大值求解"></a><figcaption>Harne et al.，Figure 6 的 Hint 局部，CC BY-NC-SA 4.0。提示只说分析质数指数，未给最终计数；完整原图见下方补充。</figcaption></figure>

<p>具体算一遍：<code>6⁶=2⁶·3⁶</code>，<code>8⁸=2²⁴</code>，目标 <code>12¹²=2²⁴·3¹²</code>。k 不能带其他质数，必须提供 <code>3¹²</code>；2 的指数可以从 0 到 24。因此 <strong>k=2ᵃ·3¹²，a=0,…,24，共 25 种</strong>。若遗漏 a=0，就会错数成 24；这是本文推导的错误示例，不是作者公开的模型失败日志。</p>
<p>官方评测按最终答案判断数学题成败，但这道示例的完整解析器和运行日志未公开。下面的 Python 3.9+ 代码由本文编写，只核对 25 的算术，不冒充官方 judge 或训练复现。</p>

```python
from math import lcm

valid = [2**a * 3**b for a in range(25) for b in range(13)
         if lcm(6**6, 8**8, 2**a * 3**b) == 12**12]
assert len(valid) == 25
assert all(k % 3**12 == 0 for k in valid)
print(len(valid))  # 25
```

<details class="supplement"><summary>完整 Figure 6：whole solution、skill、hint 的来源与差别</summary><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-6.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-6.webp" width="1592" height="840" alt="原论文 Figure 6，数学问题与完整解、Skill、Hint三种特权材料"></a><figcaption>Harne et al.，原论文 Figure 6，CC BY-NC-SA 4.0；仅裁去图外正文。图中解答只展示开头，不是完整模型输出。</figcaption></figure><p>Appendix A.2 说从模型成功尝试中选正确解并去掉 reasoning trace（额外推理记录），但 Figure 6 的 whole solution 仍有数学推导，不能写成“只剩最终答案”。Hint 的生成提示词要求 1–3 句、不泄露数值；skill 的提示词要求约 250–400 词，Appendix A.2 写约 500 词，§4 又写约 500 tokens，单位并不一致。它们不是统一的 500-token 截断规则。</p><p>Appendix D 的数学模板先放问题与参考解，再要求使用自己的方法解原题；hint 模板甚至使用“correct solution”标签。附录同时给出题目包装、错误反馈、hint 生成、压缩解生成和 skill 字段格式（Listings 1–15），但没有将压缩解列作独立结果配置。</p></details>

<h3 id="PI-Bias-Score-到底算什么">3.3 PI Bias Score：测量额外信息提高了哪份解的概率</h3>

<p>作者固定学生前文，分别接上四种目标：teacher 看到的正确解、同题另一正确解、同题错误解、同一步另一题的正确解。两分支都读取目标已经写出的前文，再给目标 token 打概率；这种强制给定目标文本的计算叫 teacher forcing。作者取教师减学生的平均 log 概率，称为 <strong>PI Bias Score</strong>：</p>

<div class="formula"><code>sM(w) = (1/|w|) Σk log pM(wk | cM, 学生前文, w&lt;k)<br>PI Bias Score(w) = sT(w) − sS(w)</code></div>

<p>w 是目标解，|w| 是其 token 数；cT 包含 PI，cS 不含 PI。假设三个目标 token 的教师／学生概率比都是 2，分数为 <code>log(2)≈0.693</code>，这是演算值。正值说明教师更容易预测该目标文本，<strong>不是准确率，也不是互信息估计</strong>；训练后两分支参数也不同，不能把差值全部理解为固定同一模型下的纯上下文效应。</p>

<figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-3.webp" width="1592" height="692" alt="原论文Figure 3，三个领域对原解、另一正确解、无关解、错误解的PI Bias Score"></a><figcaption>Harne et al.，原论文 Figure 3，CC BY-NC-SA 4.0。图中只有 Coding、General QA、Math 三域。数学原解 0.5229、另一正确解 0.0202；其余类别的排序不跨域一致。</figcaption></figure>

<details class="supplement"><summary>Appendix E 的完整评分条件</summary><p>目标评分上限为 2,000 tokens，作者说明所有目标更短，因此没有截断；在 assistant 的每个文本位置测量，跳过超过 8,000 tokens 的提示。若学生仍在推理块内，先补上结束标记再接目标。每段目标的 token 概率可由一次前向计算读取，不需要逐字单独调用。另一正确解必须来自同题至少两份不同的正确尝试；该选择会影响分数。主文 Eq. 2 省略了目标前文条件，上式采用 Appendix E 的完整定义。</p><p>换成 hint 或 skill 后，教师提示中没有完整解，PS* 也改为评分同题的一份正确解；§6.1 说它与 PS′ 不再有定义上的区别。因此弱 PI 下的 PS* 不能继续解释成“教师刚看到的那份解”的增益。Hint 的 PS* 为 0.0015、错误解为 0.0192；skill 的 PS* 为 −0.0021。偏好变小没有带来更高的任务成绩。</p></details>

<h2 id="结果：哪些下降，哪些没有">4. Experiments：实际成绩与诊断不能混成一个结论</h2>

<p><strong>多数平均分不涨，但两组正面结果是真实的。</strong>每题评测采样 4 份回答再平均，不是“4 份中任意一份成功就算过”的 pass@4。数学与问答按答案正确率，代码按论文说明报告测试用例通过比例，工具用 BFCL 成功指标；各领域再对 benchmark 等权平均。四份回答也不是四次训练种子。</p>

<div class="table-scroll"><table><thead><tr><th>Table 1，领域内等权平均</th><th>think：Base → SD（变化）</th><th>instruct：Base → SD（变化）</th></tr></thead><tbody><tr><td>QA，6 项</td><td>60.93 → 59.37（−1.56）</td><td>52.62 → 51.05（−1.57）</td></tr><tr><td>数学，4 项</td><td>63.38 → 63.10（−0.28）</td><td>34.82 → 33.02（−1.80）</td></tr><tr><td>代码，5 项</td><td>47.62 → 47.32（−0.30）</td><td>40.80 → 41.74（<strong>+0.94</strong>）</td></tr><tr><td>工具任务，5 项</td><td>51.36 → 47.85（−3.51）</td><td>28.90 → 33.58（<strong>+4.68</strong>）</td></tr></tbody></table></div>

<figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/table-1-code-tool-detail.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-1-code-tool-detail.webp" width="1584" height="940" alt="原Table1表头与Coding和Agentic两组原始行，展示正负结果并存"></a><figcaption>Harne et al.，Table 1 原表头与 Coding／Agentic 行局部拼接，CC BY-NC-SA 4.0；不是完整表，全部所示数值保留。完整 Table 1 见下方补充。</figcaption></figure>

<p>代码 instruct 的提升主要来自 MBPP+ 的 <code>43.2→55.8</code>（+12.6），另外 4 项下降；工具 instruct 五项都上升。§5.2 写代码“跨 benchmark 和模式合并后仍下降”，但两个模式等权平均是 <code>(−0.30+0.94)/2=+0.32</code>。<strong>这个表内计算不支持那句话</strong>，也没有证明小幅正增益显著。数学 think 的 −0.28、代码 think 的 −0.30 同样不宜夸成确定的大幅退化。</p>

<details class="supplement"><summary>完整主结果与固定初始教师对照：Table 1–2</summary><figure class="figure original readable-original portrait"><a href="/lib/papers/privileged-but-biased/table-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-1.webp" width="1584" height="1712" alt="原论文 Table 1，四领域全部benchmark、模式、基线与SD数值"></a><figcaption>Harne et al.，原论文 Table 1，CC BY-NC-SA 4.0；全部行保留。表中 ± 随采样给出，论文未明确它是 SD 还是 SE，不能擅自命名。</figcaption></figure><p>Table 2 使用另一套 OPSD recipe：固定初始教师、固定正确解、每题 1 条采样。think 的数学平均 63.38→59.10（−4.28），QA −1.96；instruct 数学 −0.44、QA −0.65。这说明负面结果不只出现在一种教师安排下，但不是对每个配置选择的独立排除。论文也未明确主表究竟取最终还是最佳 checkpoint。</p><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/table-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-2.webp" width="1584" height="848" alt="原论文 Table 2，OPSD recipe的QA与数学完整结果"></a><figcaption>Harne et al.，原论文 Table 2，CC BY-NC-SA 4.0；与 Table 1 是不同配方，不混合计算。</figcaption></figure></details>

<h3 id="教师偏好与-token-损失">4.1 答错的回答，不一定有更大的蒸馏损失</h3>

<figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-4-loss-detail.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-4-loss-detail.webp" width="1056" height="348" alt="Figure4a-b，答对与答错的损失及KL曲线大量重叠"></a><figcaption>Harne et al.，Figure 4a–b 局部，CC BY-NC-SA 4.0。答对与答错组平均损失约 3.5×10⁻⁴、KL 约 0.03；完整六面板图见补充。</figcaption></figure>

<p>两组损失大量重叠，支持“低损失不能可靠代表答对”。Figure 4d 的停用词、犹豫词、标点和空白占某代表性训练步 <strong>55.38% 的损失总量</strong>，不是参数梯度占比。Figure 5 再除以各类 token 数：犹豫词、停用词的平均单 token 损失较高，因此不能完全用“这类词更多”解释。</p>

<figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-5.webp" width="1592" height="472" alt="原论文Figure5，按token数量归一的九类别损失，误差线为SEM"></a><figcaption>Harne et al.，原论文 Figure 5，CC BY-NC-SA 4.0；误差线为 ±1 SEM（均值标准误）。它是每 token 平均，与 Figure 4d 的损失总量占比不同。</figcaption></figure>

<p>作者按学生接下来写出参考解的概率排列位置，最高四分之一叫 on-path，最低四分之一叫 off-path。<strong>这不是人工标注的正确／错误步骤</strong>。在最终答对的回答中，两组 KL 分布分别延伸到约 0.08 和 0.31，是范围而非均值。这提示不同解法可能受到较大模仿压力，尚未证明那一定是有用探索被压制。</p>

<details class="supplement"><summary>完整诊断原图：Figure 2 与 Figure 4，以及解释的反例</summary><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-4.webp" width="1632" height="916" alt="原论文Figure4完整六面板，损失、KL、绝对概率差、损失类别、路径KL、带符号概率差"></a><figcaption>Harne et al.，原论文 Figure 4，CC BY-NC-SA 4.0；全部面板保留。图中称为“causal chain”，本文按测量证据解释，没有替作者证明完整因果关系。</figcaption></figure><p>Figure 4c 的绝对 log 概率差是正确约 0.7、错误约 0.45。Figure 4f 的带符号均值接近 0，但标准差仍约 1，说明正负差异可以相消，不代表逐位置一致。错误回答的 off/on-path KL 分布还分别到约 0.47／0.10。</p><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/figure-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/figure-2.webp" width="1632" height="1072" alt="原论文Figure2四域乘四诊断的16面板训练曲线"></a><figcaption>Harne et al.，原论文 Figure 2，CC BY-NC-SA 4.0；四行对应 QA、数学、代码、BFCL；BFCL 验证 score=2×accuracy。</figcaption></figure><p>原图中 BFCL 回答长度上升，MMLU 的 entropy（下一 token 分布的不确定程度）近乎平稳。因此“所有域都更短、更平”不成立。作者确实改变 PI 内容并观察偏好变化，但没有用随机 token 掩码等逐项干预证明“特定词的损失导致探索减少，再导致成绩下降”整条链。</p></details>

<h3 id="消融与证据边界">4.2 换提示、长度与题目难度后怎样</h3>

<p>用 hint 或 skill 替代完整解，数学 think 平均分别是 <code>58.25 / 59.92</code>，低于基线 <code>63.38</code> 和完整解 <code>63.10</code>（Table 3）。分别用短、中、长回答训练也没有超过基线；从训练集中选不同难度的题，以及换成 32B，仍未稳定恢复成绩。这些对照限定了本组结果，但模型生成 PI 的质量仍可能影响结论。</p>

<details class="supplement"><summary>完整消融 Table 3–5：数值和分组范围</summary><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/table-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-3.webp" width="1588" height="476" alt="原论文Table3三种特权信息的数学结果"></a><figcaption>Harne et al.，原论文 Table 3，CC BY-NC-SA 4.0；完整解、Hint、Skill 三组全部行保留。</figcaption></figure><p>Table 4 按训练回答 token 长度分三档：[1318,4364]、[4387,11939]、[11972,16384]，平均 62.28／62.60／61.80。它改变训练样本，不是人为限制同一模型测试时思考长度。</p><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/table-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-4.webp" width="1264" height="460" alt="原论文Table4按训练回答长度分档的数学结果"></a><figcaption>Harne et al.，原论文 Table 4，CC BY-NC-SA 4.0；全部长度档与结果保留。</figcaption></figure><p>Table 5 用原模型 8 次采样成功率分易／中／难：0.75–0.875、0.375–0.625、0.125–0.25，排除成功率 0 和 1。题目选自训练池，三个 QA 平均变化 −3.60／−1.43／−1.58。32B 的 QA think／instruct 变化 −0.61／−1.38，仍只有 Qwen3 一种模型家族。</p><figure class="figure original readable-original"><a href="/lib/papers/privileged-but-biased/table-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/privileged-but-biased/table-5.webp" width="1592" height="528" alt="原论文Table5训练题難度与32B规模对照"></a><figcaption>Harne et al.，原论文 Table 5，CC BY-NC-SA 4.0；全部难度／规模结果保留。</figcaption></figure></details>

<h2 id="这项诊断可以怎样用于后续研究">5. Discussion：怎样检验教师是否认可不同正确实现</h2>

<p><strong>最直接的后续实验，是固定同一道题，替换教师看到的正确解。</strong>准备两份都通过测试、但实现不同的代码，再加一份写法近似却测试失败的代码。分别测教师概率和实际测试结果，检查偏好是否跟着参考实现切换。这是本文建议，原论文没有完成这套游戏代码实验。</p>
<p>若使用蒸馏加成败奖励，应保持训练题、生成次数和教师计算预算一致，比较奖励单独训练、蒸馏单独训练、二者联合。还应单独改变哪些 token 参与损失，才能判断 token 选择的贡献；最终分数提升本身不能说明是哪项产生了作用。</p>

<h2 id="应当保留的结论与未解决的问题">6. Conclusion：有用的诊断，以及不能推过头的结论</h2>

<p><strong>蒸馏损失下降，需要同时看任务成败和正确替代解。</strong>本文最有用的测量是原解与另一正确解的概率差，以及成功／失败回答的损失重叠。主实验多数均值不涨，但 instruct 的正面结果、很小的负差值和曲线反例，都限制了“普遍退化”的结论。</p>
<p>§8 将研究称为 observational（观察性分析）。只有一个模型家族，没有训练多种子复现，未测试奖励联合训练；它也没有通过逐项干预证明完整失效链。作者说代码在 supplementary（补充材料），但 2026-10-18 核到的 arXiv 源文件包只有论文和图片，公开页面没有实验仓库链接，GitHub 精确标题检索未命中。因此当前能检查公式和算术，不能按原运行配置独立复现实验。</p>

<p class="source-note">来源：2608.04794v1 的全部 24 页正文、附录和渲染页，以及公开 TeX 源文件。原图表署名 Harne et al.，按 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 非商业复用，局部裁剪／拼接已注明；这些原图及其裁剪继续遵循同一许可。全部 6 张 Figure、7 张 Table 已保留，较密或次要材料置于补充；手机原图可横向滚动或点击放大。</p>

</div>

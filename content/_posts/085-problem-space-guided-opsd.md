---
title: "[2026-08-03] Is More Privileged Information Better? From Solution Traces to Problem-Solving Structure in Self-Distilled Reasoning"
permalink: "/posts/论文解读/problem-space-guided-opsd.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-18T21:00:00+08:00"
cover: "/lib/papers/problem-space-guided-opsd/cover.svg"
description: "把正确解改成已知条件、目标、约束和变换步骤，再让模型从自己的回答中学习。这篇论文解释了提示怎样生成，也用错题提示、乱序步骤和不同选模方式检验结果。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "OPSD"
  - "Problem Space"
  - "Structured Context"
  - "Reasoning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>
@media (max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a{display:block;width:100%;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a>img{width:780px;max-width:none;height:auto}}
</style>

<div class="paper-reading">

<p class="paper-meta">Xuyang Zhao, Liting Zhang, Zichen Xu, et al. · arXiv:2608.01589v1 · 最早公开于 2026-08-03</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.01589v1">论文主页</a><a href="https://arxiv.org/pdf/2608.01589v1">论文 PDF</a><a href="https://arxiv.org/html/2608.01589v1">原文 HTML</a></div>

<section class="deck-wrap" aria-label="PS-OPSD 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 提示构造、船速示例与结果限定</strong><a href="/lib/decks/problem-space-guided-opsd-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/problem-space-guided-opsd-visual-guide.html" title="PS-OPSD 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机可滚动页内内容与宽图；Esc 退出全屏</span></p></div>
</section>

<p class="lead">让一个模型多看正确解，再用它指导另一个只看题目的模型，正确解应该以什么形式提供？本文把完整解答改成“起点、目标、约束、变换步骤”。主表的三项平均分更高，但每个测试集可以选不同的最好模型；改成一个模型测所有项目后，优势没有在三个规模上都保留。</p>

<aside class="part0"><span class="kicker">PART 0 · 两个分支分别做什么</span><h3>学生作答，教师给同一回答打概率</h3><p>接受训练、最后部署的 student（学生）只看题目，生成自己的回答；teacher（教师）多看一份训练材料，在学生已经写出的前文上计算下一 token 的概率。token 是模型预测的文字单位；一次完整采样回答叫 rollout。这种在学生当前回答上比较两分支概率的训练叫 on-policy self-distillation（OPSD）。只有教师能看到的额外材料叫 privileged information（PI）。</p><p>本文教师始终是初始 Qwen3，学生只更新 LoRA，即附加在模型里的少量可训练参数，主体参数不动。教师关闭 LoRA，也不接受梯度更新。因此“同一模型初始化”不代表训练期间两个分支的概率一直相同。</p></aside>

<aside class="keypoints"><h3>先记住三点</h3><ul><li>方法只换教师看到的提示，<strong>学生输入和 OPSD 目标不变</strong>。</li><li>提示来自一份已验证参考解，不是所有可行解法；同长度错题提示和破坏步骤依赖的提示都更差。</li><li>每个方法用一个模型版本比较时，相对 OPSD 的平均变化是 <strong>−0.68 / 0.00 / +0.68 点</strong>（1.7B / 4B / 8B）。</li></ul></aside>

<h2 id="为什么不直接把完整标准解给教师">1. Motivation：完整解答可能教出参考答案偏好</h2>

<p><strong>作者想保留“怎样求解”的关系，减少教师对某份答案的直接依赖。</strong>完整解答既有合法变换，也有具体数值和措辞。教师已经看过结论，可能更偏好参考解的写法；学生部署时没有那份解，教师的这种偏好未必能转成更可靠的推理。</p>

<p>作者把解答改写成一份带字段的解题提示，称为 <strong>Problem-Space Guidance</strong>；对应方法叫 PS-OPSD。提示记录起点、目标、约束和参考解用过的步骤。它没有枚举所有状态和操作，也没有证明删掉最终数值就消除了答案信息。研究问题是这种表示是否比完整参考解更适合指导学生。</p>

<h2 id="与答案蒸馏、计划辅助方法有什么不同">2. Related Work：与答案蒸馏、计划辅助方法的区别</h2>

<p><strong>最近的对照是 OPSD：采样方式与损失相同，教师输入不同。</strong>从答案提取模板或计划并非全新概念，本文的贡献要靠表示对照和任务结果判断。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>额外信息怎样用</th><th>与本文的差别</th></tr></thead><tbody><tr><td>OPSD</td><td>固定教师看完整正确解，评分学生前文</td><td>PS-OPSD 改成一份离线缓存的四字段提示</td></tr><tr><td>AVSD</td><td>组合多个教师输入视角，重建共识与视角特有的监督</td><td>同时改变监督构造，不是单纯替换提示的表示对照</td></tr><tr><td>PAINT / Adaptive Teacher Exposure</td><td>控制教师看多少参考解</td><td>本文在训练前构造提示，训练中不调整暴露范围</td></tr><tr><td>Training with Harnesses</td><td>借助多阶段计划和求解产生监督</td><td>本文不在每次更新里调用计划、求解、验证流程</td></tr><tr><td>SuperCorrect / Reasoning Scaffolding</td><td>从解答提取层次模板或推理骨架</td><td>已有答案抽象思想；本文把状态变换提示用于相同 OPSD 目标</td></tr></tbody></table></div>

<p class="source-note">比较依据原论文 §2、§4；这些不是同成本的单项消融。GRPO 是另一类基线：根据同题多份回答的成败奖励更新模型，而非匹配教师的下一词概率。</p>

<h2 id="方法：从标准解提取四字段，再重评学生回答">3. Method：离线提取提示，固定教师重评学生回答</h2>

<p><strong>提示先生成并缓存；训练每步不再调用提取模型。</strong>作者从 OpenThoughts 数学子集取题目与已验证参考解，让 Qwen3.6-35B-A3B 输出四字段提示。论文没有交代参考解怎样验证、提示怎样过滤，也没有公开完整提取脚本、训练子集版本与样本数；不能写成“人工逐条标注并复核”。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/problem-space-guided-opsd/training-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/training-compact.svg" width="900" height="360" alt="离线缓存提示；学生只看题目生成回答，固定教师对相同前文评分，只更新学生LoRA"></a><figcaption>本文按 Figure 1、Algorithm 1 与 §4 独立整理流程；<a href="https://arxiv.org/html/2608.01589v1#S1.F1">原 Figure 1</a>与<a href="https://arxiv.org/html/2608.01589v1#algorithm1">原 Algorithm 1</a>。原图转载许可尚未核实，未复制原版图片。</figcaption></figure>

<p>一次更新：学生只看题目生成 <code>y</code>；教师读取“题目 + 缓存提示 + 学生相同前文”，学生评分分支读取“题目 + 相同前文”。两者在每个回答位置各给一份全词表概率，训练器比较它们并<strong>只更新学生 LoRA</strong>。教师不另写答案，也不修复学生的前文；如果学生走错一步，教师仍在那段前文上评分。Algorithm 1 没有给每题采样条数，不能套用其他论文的 8 条设置。</p>

<h3 id="原论文示例：顺流、逆流速度题">3.1 船速题：四字段到底记录什么</h3>

<p>Figure 2 是论文的<strong>符号教学示例</strong>，不是发布了任务 ID 和模型日志的测试样本。船两次分别顺流 <code>a、c</code> km、逆流 <code>b、d</code> km，耗时 <code>T₁、T₂</code> 小时；求静水速度 <code>v</code> 与水流速度 <code>u</code>。</p>

<div class="table-scroll"><table><thead><tr><th>提示字段</th><th>本题内容</th></tr></thead><tbody><tr><td>Initial State</td><td>初始关系：<code>a/(v+u)+b/(v−u)=T₁</code>，<code>c/(v+u)+d/(v−u)=T₂</code></td></tr><tr><td>Goal Conditions</td><td>成功条件：求出 <code>v、u</code>，代回两式成立，且 <code>v&gt;u&gt;0</code></td></tr><tr><td>Constraints</td><td>有效性约束：分母非零，行列式 <code>Δ=ad−bc≠0</code></td></tr><tr><td>Selected State-Transition Path</td><td>选定步骤：倒数代换、解线性方程、求回速度。每步记录做什么、前提、变换及变换后的状态</td></tr></tbody></table></div>

<figure class="figure reading-diagram"><a href="/lib/papers/problem-space-guided-opsd/boat-case-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/boat-case-compact.svg" width="900" height="300" alt="船速方程通过倒数代换线性化，解p和q，再恢复速度；本文数值示例得到v10u2"></a><figcaption>变换关系按<a href="https://arxiv.org/html/2608.01589v1#S3.F2">原 Figure 2</a>独立整理；具体数值由本文补充，不是作者实测输出。</figcaption></figure>

<p>第一步设 <code>p=1/(v+u)、q=1/(v−u)</code>，把非线性分式改成两个线性方程；第二步在 <code>Δ≠0</code> 时解出 <code>p、q</code>；第三步求回 <code>v、u</code> 并验算。原提示每步用 Operator、Preconditions、Transformation、Resulting State 四项分别写操作、前提、改写与结果。它保留求解关系，却省去实例化最终答案。</p>

<p>用本文数值 <code>a=12,b=8,c=6,d=12,T₁=T₂=2</code>，得到 <code>Δ=96、p=1/12、q=1/8、v=10、u=2</code>。代回耗时是 <code>12/12+8/8=2</code>、<code>6/12+12/8=2</code>，也满足速度条件。若误写 <code>u=1</code>，耗时变成 <code>196/99</code> 和 <code>62/33</code>，两式都不等于 2，按示例成功条件会失败。这是教学验算，<strong>不是论文正式评测器或模型失败日志</strong>。</p>

<details class="supplement"><summary>可运行代码：精确分数验算，不涉及训练</summary><p>本文补写的 Python 3 标准库示例。运行结果为 <code>10 2</code>；只验证代数，不替代作者的答案提取与判分程序。</p>

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

wrong_u = F(1)
assert a/(v+wrong_u) + b/(v-wrong_u) == F(196, 99)
assert c/(v+wrong_u) + d/(v-wrong_u) == F(62, 33)
```

</details>

<h3 id="损失：截断发生在词表项，不是整句">3.2 损失：全词表逐项截断</h3>

<p>KL 衡量两种概率分布的差异；本文对其中各项加了上限。两个分支先把原始打分除以温度 <code>T</code>，用 softmax 得到概率 <code>pT、pS</code>。对词表每个候选 <code>w</code>，Eq. 6 计算 <code>d(w)=pT(w)·log[pT(w)/pS(w)]</code>，取 <code>min[d(w),c]</code> 后求和，再对回答中的非补齐位置平均。<strong>上限作用于每个词表项，不是只截断采样词或整句损失</strong>。教师与提示固定，学生靠这个目标更新。</p>

<details class="supplement"><summary>公式与小算例：截断后不再是标准 KL</summary><div class="formula"><code>pT = softmax(zT/T)，pS = softmax(zS/T)<br>d(w) = pT(w) log[pT(w)/pS(w)]<br>D̃ = Σw∈V min[d(w), c]<br>L = 对学生回答的非 padding 位置平均 D̃，再对样本平均</code></div><p>例如假设两个候选的教师概率是 <code>(0.8,0.2)</code>，学生是 <code>(0.5,0.5)</code>。未截断的两项约为 <code>0.3760、−0.1833</code>，和为 <code>0.1927</code>；若假设 <code>c=0.1</code>，和变成 <code>−0.0833</code>。这些是假设概率，说明上限截断保留负项，目标不必有标准 KL 的非负性质。论文明确采用全词表；温度与阈值绑定未公开的运行配置，不能把示例的 0.1 当成实测超参数。</p></details>

<h2 id="实验：主表优势与统一模型比较须分开">4. Experiments：先看判分与选模，再看优势</h2>

<p><strong>每题 12 份回答的平均正确率，和至少答对一次的覆盖率是两种指标。</strong>测试为 AIME24、AIME25、HMMT25，模型只看题目。论文没有公布答案提取、判分程序（judge）和确切解码上限；只能确认以下聚合，不能补写一个数值比较器当作作者的实现。</p>

<div class="formula"><code>Accuracy = 100 × Σi ci / (12N)<br>Avg = 三个测试集 Accuracy 的等权平均</code></div>

<p><code>ci</code> 是第 <code>i</code> 题 12 份回答中答对的份数，<code>N</code> 是该测试集题数。某题 6 份正确，平均正确率贡献为 50%；pass@12 只问 12 次是否至少成功一次，该题算成功。Table 1 的 ± 则是<strong>三个独立训练种子的样本标准差</strong>，不是 12 次作答的波动。</p>

<h3 id="主表与统一模型选择">4.1 主表和同一模型版本的结果</h3>

<p>Table 1 对每个方法、每个测试集，挑该测试集上跨三个种子平均分最高的 checkpoint，即训练中保存的参数版本。Avg 可能拼接三个版本，作者称这种事后上限式比较为 oracle envelope。PS-OPSD 的三项平均分别为 <code>43.12±2.00、64.32±0.33、65.40±0.21</code>。九个“规模 × 测试集”格子中只有六个独占最高；其余三个被 OPSD 或 AVSD 超过。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/problem-space-guided-opsd/checkpoint-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/checkpoint-compact.svg" width="900" height="320" alt="主表可以拼不同checkpoint的最好结果；统一checkpoint后PS相对OPSD的平均变化为负0.68、0、正0.68"></a><figcaption>本文按<a href="https://arxiv.org/html/2608.01589v1#S4.T1">Table 1</a>与<a href="https://arxiv.org/html/2608.01589v1#S5.T5">Table 5</a>公开数值独立整理；不同选模方式不可混成一组成绩。</figcaption></figure>

<p><strong>Table 5 限定了“所有规模都更好”的读法。</strong>每个方法取三项 Avg 最高的同一个 checkpoint 后，PS-OPSD 相对 OPSD 的 Avg 变化为 <code>−0.68 / 0.00 / +0.68</code>，pass@12 为 <code>−4.44 / +1.11 / +4.44</code> 点。它仍按被报告的测试成绩选模，不是独立验证集上的部署选择。<a href="https://arxiv.org/html/2608.01589v1#S5.F3">原 Figure 3</a>补充 4B 的相同训练步比较：第 100 步三项都领先，但中间步骤并非始终领先。</p>

<details class="supplement"><summary>完整 Table 1：全部方法、测试集与三种子波动</summary><p>以下为原 Table 1 数值的 HTML 重排，保留全部 18 行。最高值标注按原表；每个测试集分别选模。</p><div class="table-scroll"><table><thead><tr><th>规模</th><th>方法</th><th>AIME24</th><th>AIME25</th><th>HMMT25</th><th>Avg</th></tr></thead><tbody><tr><td>1.7B</td><td>Base</td><td>48.89</td><td>38.33</td><td>22.78</td><td>36.67</td></tr><tr><td>1.7B</td><td>SFT</td><td>51.11±0.28</td><td>38.70±0.70</td><td>26.76±0.70</td><td>38.86±0.39</td></tr><tr><td>1.7B</td><td>GRPO</td><td>49.44±0.56</td><td>40.19±0.32</td><td>23.43±0.98</td><td>37.69±0.09</td></tr><tr><td>1.7B</td><td>OPSD</td><td>53.80±0.89</td><td><strong>41.67±0.83</strong></td><td>27.78±0.56</td><td>41.08±0.28</td></tr><tr><td>1.7B</td><td>AVSD</td><td>51.85±0.16</td><td>38.61±0.73</td><td>26.57±1.53</td><td>39.01±0.57</td></tr><tr><td>1.7B</td><td>PS-OPSD</td><td><strong>55.37±1.53</strong></td><td>41.48±2.89</td><td><strong>32.50±1.94</strong></td><td><strong>43.12±2.00</strong></td></tr><tr><td>4B</td><td>Base</td><td>75.28</td><td>66.39</td><td>43.61</td><td>61.76</td></tr><tr><td>4B</td><td>SFT</td><td>74.35±0.42</td><td>66.30±1.53</td><td>44.17±1.00</td><td>61.60±0.79</td></tr><tr><td>4B</td><td>GRPO</td><td>75.74±0.85</td><td>66.57±1.40</td><td>44.81±0.70</td><td>62.38±0.84</td></tr><tr><td>4B</td><td>OPSD</td><td>73.06±0.73</td><td>68.06±1.00</td><td>43.98±0.70</td><td>61.70±0.79</td></tr><tr><td>4B</td><td>AVSD</td><td>75.46±0.70</td><td>66.67±0.28</td><td><strong>46.20±0.42</strong></td><td>62.78±0.19</td></tr><tr><td>4B</td><td>PS-OPSD</td><td><strong>76.57±0.85</strong></td><td><strong>70.56±0.73</strong></td><td>45.83±1.21</td><td><strong>64.32±0.33</strong></td></tr><tr><td>8B</td><td>Base</td><td>75.00</td><td>66.94</td><td>45.00</td><td>62.31</td></tr><tr><td>8B</td><td>SFT</td><td>76.02±0.58</td><td>67.78±1.69</td><td>43.80±1.63</td><td>62.53±1.02</td></tr><tr><td>8B</td><td>GRPO</td><td>75.83±0.48</td><td>69.35±0.58</td><td>44.72±1.00</td><td>63.30±0.46</td></tr><tr><td>8B</td><td>OPSD</td><td>75.74±0.98</td><td>70.09±0.89</td><td>44.91±0.98</td><td>63.58±0.62</td></tr><tr><td>8B</td><td>AVSD</td><td><strong>77.78±0.73</strong></td><td>66.67±1.00</td><td>46.48±1.25</td><td>63.64±0.96</td></tr><tr><td>8B</td><td>PS-OPSD</td><td>77.13±0.85</td><td><strong>71.30±0.58</strong></td><td><strong>47.78±0.28</strong></td><td><strong>65.40±0.21</strong></td></tr></tbody></table></div></details>

<h3 id="表示消融：什么被固定，什么被破坏">4.2 消融：有用的是结构，还是本题内容</h3>

<p>4B 的完整提示 Avg 为 64.32；去掉字段名、层次和步骤边界，但保留内容、次序与 token 预算后为 63.61；换成匹配题型、难度与长度的另一题提示后为 61.76；保留步内内容、破坏跨步依赖后为 62.19。后两项在三个测试集都下降，支持本题相关性和步骤连贯性的作用。<strong>字段结构的优势只有 0.71 点，而且去字段版本在 HMMT25 反而高 1.39 点</strong>。</p>

<details class="supplement"><summary>完整 Table 2：表示对照及反向结果</summary><p>原<a href="https://arxiv.org/html/2608.01589v1#S5.T2">Table 2</a>仍按每个测试集选最佳 checkpoint。Path-Corrupted PS 可以重排或不兼容地组合步骤，不只是删掉标题；作者提到破坏检查，却没有发布实现。</p><div class="table-scroll"><table><thead><tr><th>提示</th><th>AIME24</th><th>AIME25</th><th>HMMT25</th><th>Avg</th></tr></thead><tbody><tr><td>PS-OPSD</td><td>76.57</td><td>70.56</td><td>45.83</td><td>64.32</td></tr><tr><td>Flattened PS</td><td>75.37</td><td>68.24</td><td>47.22</td><td>63.61</td></tr><tr><td>Mismatched PS</td><td>74.63</td><td>67.31</td><td>43.33</td><td>61.76</td></tr><tr><td>Path-Corrupted PS</td><td>73.06</td><td>68.89</td><td>44.63</td><td>62.19</td></tr></tbody></table></div></details>

<h3 id="能力覆盖与看不见提示的引用">4.3 题目覆盖和引用提示的行为</h3>

<p>Table 3 的 90 题中，PS-OPSD 相对 OPSD 在 23 题有更多正确回答、9 题更少、58 题相同，平均 +2.62 点；相对 Base 则是 18／7／65、+2.56 点。“更多正确回答”不等于新解出了这些题。Table 4 单独按 Base 是否至少一次成功，检查新增和丢失的成功题。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/problem-space-guided-opsd/coverage-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/problem-space-guided-opsd/coverage-compact.svg" width="900" height="240" alt="Base全错23题，至少一次对67题；PS救回3题丢失1题，净增2题，OPSD净增0"></a><figcaption>本文由<a href="https://arxiv.org/html/2608.01589v1#S5.T4">Table 4</a>公开比例与 90 题总数补算分母，不是原始逐题数据；GRPO 的净增长也为 +2。</figcaption></figure>

<p>作者另统计回答是否明确引用学生看不到的参考答案或提示（<a href="https://arxiv.org/html/2608.01589v1#S5.F4">Figure 4</a>）。训练题终点发生率 OPSD／PS-OPSD 为 3.0%／0.5%，未见验证题为 2.2%／0.4%。这种行为减少了，但检测器和计数分母未披露，<strong>不能据此证明所有 PI 依赖都被消除</strong>。</p>

<details class="supplement"><summary>完整 Table 3–5、Figure 4 终点与 entropy 定义</summary><p>Table 3–4 使用主表的逐测试集 checkpoint 和每题 12 份回答。Base-hard 指 Base 12 次全错；Hard Avg 是这部分题的平均正确率，Hard Pass 是至少一次成功的题目比例，Ret. 是 Base 原来成功题的保留率，Net Exp. 是新成功题减丢失题。</p><div class="table-scroll"><table><caption><a href="https://arxiv.org/html/2608.01589v1#S5.T3">Table 3</a>：相对 Base 的逐题正确次数变化</caption><thead><tr><th>方法</th><th>ΔBase（点）</th><th>Better</th><th>Worse</th><th>Tied</th></tr></thead><tbody><tr><td>Base</td><td>0.00</td><td>0</td><td>0</td><td>90</td></tr><tr><td>SFT</td><td>−0.15</td><td>13</td><td>15</td><td>62</td></tr><tr><td>GRPO</td><td>+0.62</td><td>17</td><td>13</td><td>60</td></tr><tr><td>OPSD</td><td>−0.06</td><td>13</td><td>11</td><td>66</td></tr><tr><td>AVSD</td><td>+1.02</td><td>13</td><td>11</td><td>66</td></tr><tr><td>PS-OPSD</td><td>+2.56</td><td>18</td><td>7</td><td>65</td></tr></tbody></table></div><div class="table-scroll"><table><caption><a href="https://arxiv.org/html/2608.01589v1#S5.T4">Table 4</a>：Base 未成功题和已成功题分开算</caption><thead><tr><th>方法</th><th>Hard Avg（%）</th><th>Hard Pass（%）</th><th>Ret.（%）</th><th>Net Exp.（题）</th></tr></thead><tbody><tr><td>Base</td><td>0.00</td><td>0.00</td><td>100.00</td><td>0</td></tr><tr><td>SFT</td><td>0.85</td><td>4.35</td><td>97.01</td><td>−1</td></tr><tr><td>GRPO</td><td>6.04</td><td>13.04</td><td>98.51</td><td>+2</td></tr><tr><td>OPSD</td><td>1.69</td><td>8.70</td><td>97.01</td><td>0</td></tr><tr><td>AVSD</td><td>2.66</td><td>4.35</td><td>98.51</td><td>0</td></tr><tr><td>PS-OPSD</td><td>4.35</td><td>13.04</td><td>98.51</td><td>+2</td></tr></tbody></table></div><div class="table-scroll"><table><caption><a href="https://arxiv.org/html/2608.01589v1#S5.F4">Figure 4</a> 的已报告终点：明确引用不可见材料的回答发生率</caption><thead><tr><th>题目来源</th><th>OPSD</th><th>PS-OPSD</th></tr></thead><tbody><tr><td>训练题</td><td>3.0%</td><td>0.5%</td></tr><tr><td>未见验证题</td><td>2.2%</td><td>0.4%</td></tr></tbody></table></div><p>Table 5 的 H<sub>C</sub> 是模型在自己答对的回答上，对下一 token 预测的不确定程度（correct-path token entropy），单位为 nats。作者以温度 1 的原始全词表概率计算，先对每条回答中所选的 token 求平均，再汇总所选回答。文中分别称这些 token 为 non-structural tokens、汇总为 micro-average，但没有公布筛选规则与最终权重公式；置信区间按测试集分层重采样题目，并保留各题 12 条路径。比较的是各自的正确路径，<strong>不是不同解题策略的语义多样性</strong>。表中没有重新明确种子汇总规则，不擅自套上主表的 ± 定义。</p><div class="table-scroll"><table><caption><a href="https://arxiv.org/html/2608.01589v1#S5.T5">Table 5</a>：各方法用同一 checkpoint，PS-OPSD 减参考方法</caption><thead><tr><th>规模</th><th>参考</th><th>ΔAvg（点）</th><th>Δpass@12（点）</th><th>ΔH<sub>C</sub>（nats）</th></tr></thead><tbody><tr><td>1.7B</td><td>Base</td><td>+5.34</td><td>−1.11</td><td>+0.0697</td></tr><tr><td>1.7B</td><td>OPSD</td><td>−0.68</td><td>−4.44</td><td>−0.0185</td></tr><tr><td>4B</td><td>Base</td><td>+0.43</td><td>0.00</td><td>+0.0763</td></tr><tr><td>4B</td><td>OPSD</td><td>0.00</td><td>+1.11</td><td>+0.0321</td></tr><tr><td>8B</td><td>Base</td><td>+1.11</td><td>+2.22</td><td>+0.0453</td></tr><tr><td>8B</td><td>OPSD</td><td>+0.68</td><td>+4.44</td><td>+0.0319</td></tr></tbody></table></div></details>

<h2 id="后续最值得验证的方向">5. Discussion：固定选模规则，再检验替代解法</h2>

<p><strong>最值得补的实验，是在独立验证集选一个模型，再固定报告所有测试。</strong>同时比较不同正确解提取的提示、只有约束而没有选定步骤的提示，以及学生中途偏离参考解时教师是否仍能给出有用反馈。这样才能区分表示带来的作用与某条参考路径的偏好。</p>

<p>用于游戏代码时，可以从经过运行验证的程序提取功能规则，检查它们能否指导不同实现；但论文只有竞赛数学实验，未测试游戏、代码或多轮 Agent。这是后续设想，不能当作已证实的迁移结果。</p>

<h2 id="结论与复现限制">6. Conclusion：有价值的表示对照，仍不是完整可复现基线</h2>

<p><strong>本文提供了可重建的教师提示设计，以及能限制结论的对照。</strong>与错题提示、破坏步骤依赖的提示比较，完整提示更好；字段结构不是每项都赢，同一模型版本的比较也并非三个规模都提高。</p>

<p>完整运行配置、温度与截断阈值、LoRA 设置、训练量、判分程序和离线成本未完整披露。2026-10-18 核查的 arXiv 页面没有作者实验仓库链接；源文件包只有论文 TeX、样式与图片，GitHub 精确“PS-OPSD”仓库检索未命中。这是已检查来源的边界，不是证明任何地方都没有代码。因此可借鉴表示和实验设计，暂不能按原配置完整重跑。</p>

<p class="source-note">来源：2608.01589v1 全部 9 页文本、渲染页与公开 TeX。v1 使用 <a href="https://arxiv.org/licenses/nonexclusive-distrib/1.0/">arXiv 非独占分发许可</a>，未核到原图转载授权；4 张 Figure、5 张 Table 与 Algorithm 1 均有清单，原图逐一链接，流程与数值按事实独立整理，完整表格置于补充。兴趣程度 8/10 仅表示博客作者个人兴趣。</p>

</div>

---
title: "[2026-09-22] What Should a Self-Teacher See? Privileged Context Design for On-Policy Self-Distillation"
permalink: "/posts/论文解读/self-teacher-context-design.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:00:00+08:00"
cover: "/lib/papers/self-teacher-context-design/cover.svg"
description: "训练时已经有参考解答，应该全部交给负责指导的模型，还是只给解题方法或题型？本文用一条公开数学题讲清五种提示、训练代码和评测，再区分最高分、固定检查点与跨随机种子的结果。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "On-Policy Self-Distillation"
  - "Privileged Context"
  - "Context Design"
  - "Code Audit"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Kanghui Tian, Siyuan Liu, Tianxiang Jiang, et al. · arXiv:2609.25623v2 · 最早公开于 2026-09-22</p>
<div class="source-links"><a href="https://arxiv.org/abs/2609.25623">论文主页</a><a href="https://arxiv.org/pdf/2609.25623v2">本次解读的 v2 PDF</a><a href="https://github.com/tiankanghui/Self-Teacher-Context-Design">官方代码与数据</a></div>

<section class="deck-wrap" aria-label="Context Design 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 一道真题、一次训练、三种读分方式</strong><a href="/lib/decks/self-teacher-context-design-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/self-teacher-context-design-visual-guide.html" title="Context Design 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">训练时有一份参考解答，模型自己作答时却没有。作者让同一个基础模型承担两个角色：<strong>student 只看题目，先写自己的回答；teacher 额外看参考资料，判断 student 接下来该怎样写。</strong>论文比较的是 teacher 该看多少资料。完整解答没有一直赢，只给方法、思考方向或题型有时更好，但结果取决于模型规模、任务和选用哪个训练检查点。</p>

<aside class="part0"><span class="kicker">PART 0 · 理解两个模型角色</span><h3>teacher 不另写一份答案，而是在 student 已写的前文上给出下一步概率</h3><p>本文的 <strong>On-Policy Self-Distillation（OPSD）</strong> 指：student 每轮用当前参数生成回答，再由同一基础模型的冻结版本指导这份回答。这里的 on-policy 强调回答来自正在训练的 student；self-distillation 强调 teacher 和 student 从同一基础模型出发，不要求另一个更强模型提供这轮推理轨迹。</p><p>只给 teacher 的额外参考资料叫 <strong>privileged context</strong>。例如 student 已写出“先比较指数”，teacher 就在“题目＋额外资料＋这句前文”下计算下一 token 的概率。token 是模型处理的文本单位，可能是字、词片段或符号；已写出的前文叫 prefix。teacher 的概率不会直接变成 student 的可见输入，训练只用它调整 student。本文 teacher 关闭 LoRA、保持初始基础模型不变；LoRA 是 student 实际更新的低秩参数，不能把这里的 teacher 误读成每轮同步更新的副本。</p></aside>

<div class="metrics" aria-label="Context Design 关键数字"><div class="metric"><strong>29,434</strong><span>每题都有五种提示的公开训练行</span></div><div class="metric"><strong>+1.39</strong><span>4B 的最佳中间提示相对完整解答，逐测试集最高分均值</span></div><div class="metric"><strong>+1.57</strong><span>8B 的同一比较，单位均为百分点</span></div><div class="metric"><strong>9.5/10</strong><span>博客作者个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>本文的三个结论</h3><ul><li>五种提示按同一道题对齐。方法、思考方向和题型由模型离线生成，不能称为人工标注。</li><li>4B、8B 的中间提示平均有优势；1.7B 仍偏向完整解答。不存在一档对所有模型和任务都最好的提示。</li><li>主表可混合三个不同训练检查点的最高分。换成同一个检查点或固定训练终点，优势大小与冠军都会变化。</li></ul></aside>

<h2 id="研究问题：教师应该多看哪种解题材料">1. Motivation：教师应该多看哪种解题材料</h2>

<p><strong>已经有完整解答，不代表把它全部交给 teacher 就最有利于 student 学习。</strong>完整解答同时给出最终答案、具体解法和原作者的措辞。teacher 看完以后可能更偏向参考解答的写法，而 student 当前写出的前文可能走的是另一条路。只给“怎么考虑这道题”，则可能留下让 student 自己完成推导的空间。提示太粗又可能不足以指导下一步。</p>

<p>这是论文的动机，不是已经证明的因果解释。作者通过五组训练来回答更具体的问题：在同一模型规模内，固定 student 提示、冻结 teacher、训练数据和训练方法，只改变 teacher 读到的资料，最终能力会怎样变化？不同组都采用相同的生成流程，但训练后参数不同，实际生成的回答当然不会完全相同。不能把它说成“五组始终训练同一批回答”。</p>

<p>论文把参考资料分成完整解答、具体策略、一般思考方向、题型和最终答案五种。它们是不同的信息包，不是把原文从长到短截成五段；“只给答案”也不在从详细解法到粗略方法的同一条层级上。</p>

<h2 id="与已有自蒸馏方法的区别">2. Related Work：与已有自蒸馏方法的区别</h2>

<p><strong>本文把“teacher 看到什么”作为主要实验变量，训练方法本身沿用 OPSD。</strong>它不提出新的奖励、轨迹搜索或工具系统。最直接的基线是把完整参考解答交给冻结 teacher 的 OPSD。相关方法则扩展了参考资料的来源或表示。</p>

<div class="table-scroll"><table><thead><tr><th>工作</th><th>teacher 的额外输入</th><th>指导什么</th><th>与本文的边界</th></tr></thead><tbody><tr><td><a href="/posts/论文解读/self-distilled-reasoner.html">OPSD</a></td><td>经过验证的完整解答</td><td>student 自己生成的回答</td><td>本文的 L1 直接保留这个起点</td></tr><tr><td><a href="/posts/论文解读/on-policy-context-distillation.html">OPCD</a></td><td>任务提示、经验总结等训练期资料</td><td>不给这些资料的模型</td><td>扩展资料类型；本文针对同题解答比较不同详细程度</td></tr><tr><td><a href="/posts/论文解读/problem-space-guided-opsd.html">PS-OPSD</a></td><td>状态、目标、约束、可执行变化四项描述</td><td>student 的当前回答</td><td>重新组织问题描述；本文主要改变资料的抽象程度</td></tr><tr><td>本文</td><td>同题对齐的 L1、L2、L3、L4、L5</td><td>同一种 OPSD 训练中的当前回答</td><td>比较资料、模型规模、任务与训练检查点之间的关系</td></tr></tbody></table></div>

<p>比较表用于说明各工作的研究范围，不是这些方法在统一数据和算力下的排行榜。本文的主要实测对照是五种提示。后文也会检查它们是否同时改变了提示长度、答案可见性，以及衔接指令的措辞。</p>

<h2 id="方法：五类教师提示与一次训练更新">3. Method：五类教师提示与一次训练更新</h2>

<p><strong>先离线生成每题的五种资料，再让 student 作答，冻结 teacher 重评这份回答，最后只更新 student 的 LoRA。</strong>离线资料生成和在线训练是两件事。下面用仓库中一条真实训练行讲清楚它们怎样连接。</p>

<figure class="figure"><a href="/lib/papers/self-teacher-context-design/training-and-context.svg" target="_blank" rel="noopener"><img src="/lib/papers/self-teacher-context-design/training-and-context.svg" width="1000" height="480" alt="离线生成五种参考资料；在线 student 只看题目，冻结 teacher 看同题资料和 student 前文，并且只更新 student"></a><figcaption>按论文 §3、附录 A.1/B.1 与公开代码重绘。离线生成资料用较强模型，在线 teacher 则是 student 的初始基础模型；这两个角色不能混为一谈。</figcaption></figure>

<h3>公开训练行：比较三个巨大的幂</h3>

<p><code>data/privileged_contexts_l1_l5.jsonl</code> 的 <code>sample_id=1</code> 来自 <code>olympiads</code>，与附录 B.1 的例题一致：令 p＝2<sup>3009</sup>、q＝3<sup>2006</sup>、r＝5<sup>1003</sup>，在五个选项中判断大小关系。正确选项是 D：r＜p＜q。它是一条公开训练样本，不是本文主测试集中的逐模型输出日志。</p>

<figure class="figure"><a href="/lib/papers/self-teacher-context-design/exponent-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/self-teacher-context-design/exponent-real-case.svg" width="1000" height="486" alt="真实指数比较题：2的3009次方等于8的1003次方，3的2006次方等于9的1003次方，故5小于8小于9，选D；五种资料分别保留不同信息"></a><figcaption>根据附录 B.1 和公开 JSONL 的 sample_id=1 重绘。图中的计算是这道题的参考推导，不是声称 student 实际生成了这些步骤。</figcaption></figure>

<div class="table-scroll"><table><thead><tr><th>资料</th><th>这一行实际提供什么</th><th>teacher 可以从中直接知道什么</th></tr></thead><tbody><tr><td>L1：完整解答</td><td>把 p、q、r 改写成 8<sup>1003</sup>、9<sup>1003</sup>、5<sup>1003</sup>，比较底数，得到 r＜p＜q 和 D</td><td>整个解法与最终答案</td></tr><tr><td>L2：strategy</td><td>“Apply the power of a power rule to rewrite each term with a common exponent equal to the greatest common divisor of the original exponents, enabling direct comparison of the resulting bases.”</td><td>具体策略：用幂的乘方规则，把指数统一成原指数的最大公约数，再比较底数；没有给出计算后的 8、9、5 或 D</td></tr><tr><td>L3：framing</td><td>“Reframe the terms into a common representational form so that comparison depends on a single varying attribute.”</td><td>一般方向：把几个量改写成统一形式，只留一个变化量用于比较；没有指定幂的乘方规则</td></tr><tr><td>L4：category</td><td>“Elementary algebra: ordering of exponential terms with different bases and exponents.”</td><td>题型：初等代数中不同底数与指数的幂的排序</td></tr><tr><td>L5：最终答案</td><td><code>D</code></td><td>结果，不提供推导</td></tr></tbody></table></div>

<p>这里保留 L2、L3、L4 的原始英文，再解释它们做什么，避免中文改写后不知不觉多给信息。原始 L1 有一处措辞写成 “same base”，但展示的计算实际上是统一<strong>指数</strong>，不是统一底数。这个文字瑕疵不影响随后正确的等式，但公开参考资料也需要核查，不能默认每句话都准确。</p>

<p>下面是为本文写的 Python 3.12 检查，不是论文的评测器。它只验证这条参考题的算术，避免直接构造几千位的大整数。</p>

```python
from math import gcd

exponents = (3009, 2006, 1003)
common = gcd(*exponents)
rewritten_bases = [
    base ** (exp // common)
    for base, exp in zip((2, 3, 5), exponents)
]
assert common == 1003
assert rewritten_bases == [8, 9, 5]
assert rewritten_bases[2] < rewritten_bases[0] < rewritten_bases[1]
print("D: r < p < q")
```

<h3>29,434 行来自哪里，谁生成摘要</h3>

<p>每行都保留同一道题的标识、来源、题面与 L1 至 L5。基础题面和参考解答来自 OPSD 使用的 OpenThoughts 数学数据；L1 沿用参考解答，L5 取答案字段，并对七条证明类样本做代码规则覆盖。这不等于作者人工重写了所有提示。</p>

<p><strong>L2、L3、L4 由 Qwen3.5-397B-A17B 离线生成。</strong>作者把生成资料的程序称为 compiler，这里它是一个模型提示流程，不是编译游戏代码的编译器。顺序为 L4→L3→L2：L4 看题目和参考解答；L3 再看 L4；L2 再看 L4、L3。参考解答先按字符截到 4,000 字符，主生成配置为 temperature 0.3、最多 512 tokens。上一步错误可能被下一步继承。</p>

<p>作者还用 Qwen3-8B 重新生成三种摘要进行对照。该配置启用 thinking，temperature 0.6、最多 8,192 tokens。因此这项比较同时换了生成模型和解码配置，不能只解释为“编写提示的模型规模不重要”。</p>

<h3>student 的回答怎样成为训练信号</h3>

<ol><li>训练程序取一行题面，并选定这组实验的提示类型。student 只读取题面，按当前参数生成最多 1,024 tokens 的回答。</li><li>对于回答的每个有效位置，student 在“题目＋自身前文”下给出整个词表的下一 token 概率；teacher 则在“题目＋这题所选资料＋同一前文”下给出概率。数学上按位置定义，实现中对整段回答批量计算，不是每个字都重新发起一次独立调用。</li><li>teacher 不采样一条新答案来替换 student 回答。训练程序比较两份概率，只在回答的有效位置计算损失；题面和补齐长度用的 padding 不计入。</li><li>反向传播只更新 student 的 LoRA。teacher 始终关闭 LoRA，因此保持初始基础模型。下一轮 student 用更新后的参数重新作答，推理部署时不提供参考资料。</li></ol>

<p>如果不截断，比较项是 teacher 到 student 的 forward KL：对每个词表项 v，计算 q(v)·[log q(v)−log p(v)] 后求和。q 是 teacher 的概率，p 是 student 的概率。它比较的是整张概率表，而不只奖励已采样出的那个 token。</p>

<div class="formula">每位置损失＝Σ<sub>v</sub> min{q(v)·[log q(v)−log p(v)], τ}；再对有效回答位置取平均。</div>

<p><strong>公开代码先对每个“位置×词表项”的贡献设上限，再对词表求和。</strong><code>jsd.clamp(max=token_clip)</code> 只设上限，不设负方向的下限。它既不是把整项 KL 截断，也不是双侧 <code>clamp(-c, c)</code>。某些词表贡献为负，先截掉大的正贡献后，总和可能为负；不能把它当作始终非负的精确 KL。论文附录 A.1 也明确了这个区别。本文没有另加 GRPO 奖励项。</p>

<div class="table-scroll"><table><thead><tr><th>设置</th><th>1.7B</th><th>4B</th><th>8B</th></tr></thead><tbody><tr><td>基础模型</td><td>Qwen3-1.7B</td><td>Qwen3-4B</td><td>Qwen3-8B</td></tr><tr><td>有效 batch，单位为题</td><td>64</td><td>32</td><td>32</td></tr><tr><td>词表贡献上限 τ</td><td>0.05</td><td>0.05</td><td>0.06</td></tr><tr><td>其余共享设置</td><td colspan="3">8×H200；200 次更新；每 25 步存检查点；学习率 5e-6；LoRA rank/alpha＝64/128；梯度范数上限 0.1；生成与概率计算的 temperature 均为 1.1</td></tr><tr><td>生成范围</td><td colspan="3">最多 1,024 tokens；top-p 0.95、top-k 20 只限制生成，损失使用完整词表</td></tr><tr><td>聊天模板</td><td colspan="3">student 训练生成用 non-thinking；teacher 概率计算用 thinking；最终评测也启用 thinking</td></tr></tbody></table></div>

<p>同一规模内五组设置一致，但跨规模的有效 batch 和截断上限不同。模型规模与提示效果存在关联，不能据此把所有差别都归因于参数量。</p>

<h2 id="实验：评测口径、种子波动与错误案例">4. Experiments：评测口径、种子波动与错误案例</h2>

<p><strong>中间提示的优势在 4B、8B 上有跨种子的平均支持，但主表的最高分不能当作固定终点成绩。</strong>先看一个分数怎么算，再看检查点、随机种子和真实失败。</p>

<h3>Avg@12 是十二次回答的平均正确率</h3>

<p>AIME24、AIME25、HMMT25 每道题各采样 12 次，temperature 1.0、最多 38,912 tokens。评测取最终答案与标准答案比对。<strong>Avg@12＝正确回答总数÷(题数×12)</strong>，不是十二次中只要有一次正确就算通过的 Pass@12。比如一题 12 次里 9 次正确，对 Avg@12 的贡献是 75%；对 Pass@12 的贡献才是 100%。这个 9/12 是解释指标的自拟数字，不是论文某题的记录。</p>

<p>主表为每组实验在第 25、50……200 步的八个检查点中，分别选 AIME24、AIME25、HMMT25 的最高 Avg@12，再把三项平均。三个最高分可能出自三个不同模型检查点。固定同一个检查点的均值、八个检查点的均值与固定第 200 步成绩，都回答不同的问题。</p>

<figure class="figure"><a href="/lib/papers/self-teacher-context-design/peak-and-checkpoint.svg" target="_blank" rel="noopener"><img src="/lib/papers/self-teacher-context-design/peak-and-checkpoint.svg" width="1000" height="472" alt="4B 五种提示的逐测试集最高分、同一检查点最高均值和固定第200步成绩对比；主表L3最高，单一检查点则L4最高"></a><figcaption>按 Table 1、Table 14 重绘，均为主配置 seed 42 的 4B 结果，单位是百分比。L3 的 64.81 不是一个检查点同时取得的三测试集均值；L4 的 64.63 则在第 125 步同时取得。</figcaption></figure>

<div class="table-scroll"><table><thead><tr><th>模型</th><th>L1 完整解答</th><th>L2 策略</th><th>L3 方向</th><th>L4 题型</th><th>L5 答案</th></tr></thead><tbody><tr><td>1.7B</td><td><strong>43.89</strong></td><td>40.83</td><td>42.78</td><td>43.61</td><td>42.13</td></tr><tr><td>4B</td><td>63.43</td><td>64.07</td><td><strong>64.81</strong></td><td>64.63</td><td>63.61</td></tr><tr><td>8B</td><td>66.67</td><td><strong>68.24</strong></td><td>66.85</td><td>67.22</td><td>66.76</td></tr></tbody></table></div>

<p>上表是 Table 1 的逐测试集最高分均值，不是固定终点。4B 的 L3 相对 L1 提高 1.39 个百分点，8B 的 L2 提高 1.57；1.7B 的 L1 仍领先。只给答案的 L5 在 4B、8B 也接近 L1，说明“完整推导不可缺少”并不符合这组结果。</p>

<p>换成一个共同检查点，4B 的 L1/L2/L3/L4 分别为 62.31/63.43/63.24/64.63，最高变成 L4。固定第 200 步，4B 的 L1 为 60.93，L2、L4 均为 62.59；8B 的 L3 相对 L1 只有 65.37−65.28＝0.09 个百分点。最高潜力与固定终点要并排读。</p>

<h3>跨随机种子支持的是平均趋势</h3>

<p>作者只对 L1、L3、L4 补了 seeds 42、43、44，没有为五种提示都做三种子复现。Table 3 将同一种子下的中间提示减去 L1，再报告三个差值的平均值和样本标准差。这里的 ± 是种子之间的波动，不是置信区间。</p>

<div class="table-scroll"><table><thead><tr><th>固定第 200 步的比较</th><th>相对 L1，均值±样本标准差</th><th>三个种子中严格为正</th></tr></thead><tbody><tr><td>4B：L3</td><td>+1.67±0.73</td><td>3/3</td></tr><tr><td>4B：L4</td><td>+1.05±1.32</td><td>2/3</td></tr><tr><td>8B：L3</td><td>+0.28±0.32</td><td>3/3</td></tr><tr><td>8B：L4</td><td>+0.22±1.05</td><td>1/3</td></tr><tr><td>1.7B：L3 / L4</td><td>−0.83±2.33 / −1.33±2.04</td><td>均为 1/3</td></tr></tbody></table></div>

<p>4B、8B 的 L3、L4 在四种汇总规则下的<strong>平均差值</strong>都为正，但不能改写为“每个随机种子都提高”。尤其 8B 的 L4 在固定终点只有一个种子提高。L2 在 8B 的主配置拿到最高分，也没有相同三种子表支持它必然最稳。</p>

<h3>真实对照：多检查几遍，仍可能把条件理解错</h3>

<p>迁移测试使用固定第 200 步模型：MT-AIME 是同一批 30 道 AIME 题的七语言翻译，按语言等权平均 Avg@12；AutoLogi 的 1,575 题由可执行验证器判定，每题一次；GPQA-Diamond 的 198 题每题十次；ZebraLogic 的 1,000 道逻辑格题要求<strong>整个答案表正确</strong>，单元格准确率另报。每种规模都有三种不同提示分别赢得四项测试，没有通用冠军。</p>

<p>附录 D.1 给出 ZebraLogic 的真实题 <code>lgp-test-4x6-25</code>：四栋房子、六类属性。第六条线索说摄影爱好者与喜欢海滩度假的人之间隔着两栋房子，因此位置差必须为 3。</p>

<div class="case"><h4>同一线索，两种推理结果</h4><p>L3 的 8B 模型第一次读线索就写出 beach＝photography±3。四栋房子中只剩两种端点安排，模型继续按其余线索排除，最终整表正确；轨迹长 33,912 字符。</p><p>L1 的模型把位置差误读成 2，接受 photography 在第 2 栋、beach 在第 4 栋。它反复自查，但每次都沿用错误理解；最后 mountain 与 cruise 还有两种可行安排，它凭“题目应该只有一个解”选了其中一种，整表错误。轨迹长 67,938 字符，包含更多检查和重推。</p><p>一次正确、一次错误的判据是最终整表与标准解是否相同，不能因为 L1 写得更长或更多次出现“contradiction”就算推理更可靠。论文事先从成功率反差集合里选例，仍然只是解释性对照，不能凭一个案例证明所有收益都来自更好的条件理解。完整题表和这两段逐项生成日志在本次固定代码版本中未公开，本文不补造它们。</p></div>

<p>迁移也有负结果：C-Eval 的 52 学科均值中，L1 至 L4 在任何规模都没超过未训练 Base；只有 4B 的答案提示 L5 比 Base 高 0.07。所有训练条件的答案提取失败率都升高，评测将失败计为错误。数学训练并未普遍提高中文知识问答。</p>

<h2 id="控制实验与下一步验证">5. Discussion：控制实验与下一步验证</h2>

<p><strong>“中间提示有用”不只依赖原版衔接措辞，但论文仍没把语义、长度和答案可见性完全分离。</strong>以下控制比泛泛地说“抽象优于细节”更值得读。</p>

<div class="table-scroll"><table><thead><tr><th>控制</th><th>实际改变与结果</th><th>能说明什么，不能说明什么</th></tr></thead><tbody><tr><td>统一提示外壳，Table 20</td><td>4B 的标签、分隔符、衔接指令全部统一，只换资料；L2/L3/L4 最高分均值为 64.54/63.98/65.28，L1 为 62.96</td><td>中间提示优势不只来自原外壳措辞。仍没有控制资料长度和内容</td></tr><tr><td>参考解答前 10%＋答案，Table 13</td><td>4B 为 63.89，低于 L3 的 64.81，也高于 L1 的 63.43</td><td>简单缩短并不能复制最好的结果；该组与 L3 既不等长，也不具有相同答案可见性</td></tr><tr><td>更长训练回答，Table 14</td><td>1,024→2,048 tokens 后中间提示的最高分优势保留；L2 固定终点反而 62.59→58.61</td><td>不是只因短生成上限才有优势；最高分稳定不等于终点稳定</td></tr><tr><td>换摘要模型，Table 12</td><td>Qwen3-8B 生成资料后，1.7B 偏完整解答、4B/8B 偏中间提示的最高分趋势保留，具体冠军变化</td><td>趋势不只存在于 397B 摘要。模型和解码配置同时改变，且不能证明无需高质量参考解答</td></tr><tr><td>混合提示与按题选择，Tables 20–22</td><td>没有一组超过最佳固定提示的最高分均值；若干组固定终点较好</td><td>按题动态选择并未成为已验证的更优方法，只显示可能降低对停止位置的敏感性</td></tr></tbody></table></div>

<p>“按题选择”有两种不同操作。资料集里的 routed mixture 只是按行确定使用哪一种提示及对应外壳，不是学出来的选择器。另一组真正的 learned router 则在 student 作答后提取 39 项特征，每十步训练两层网络预测提示选择；还有一组需要对五种资料额外计算 teacher 概率，按相对优势选择。它们有额外开销，而且并未赢得最高分比较。</p>

<p>作者对 1,200 道题的每种摘要做两遍模型审查，不一致时第三遍裁决，审查仍用 Qwen3.5-397B-A17B，不是人类标注。主摘要的直接答案泄漏为 0，等价答案泄漏为 L2 17/1,200、L3 4/1,200、L4 1/1,200；Qwen3-8B 生成资料相应为 50/31/2。字符串扫描无匹配与模型判为无泄漏，都不能保证提示完全没泄漏。</p>

<p>长度成本也要分清：L1 平均存储 657.3 hint tokens，L2/L3/L4 为 38.9/25.2/17.7，减少约 16.9 到 37.1 倍；包含固定外壳的完整 teacher 提示则从 835 降到 225.5/212.7/203.3，只减少约 3.7 到 4.1 倍。这没有计入获得参考解答、生成摘要、student 作答与训练反向传播的成本。</p>

<p>若想延伸到游戏 query→code，本文最直接的启发是<strong>比较“完整参考代码”和“从代码提取、可供 teacher 理解的少量信息”</strong>。可先固定同一个提示外壳，加入等长截取、错误任务资料、隐藏最终答案等控制。当前程序运行后产生的错误与截图则是另一种资料来源，要另设实验组，不能当作本文已经验证的结果。游戏方向不是这篇论文的实验对象。</p>

<h2 id="结论与公开代码的复现边界">6. Conclusion：结论与公开代码的复现边界</h2>

<p><strong>值得保留的是一组可检验的资料设计变量，不是“提示越抽象越好”的结论。</strong>本文把五种资料、三个规模、三项数学测试和多种检查点规则放在一起比较，也给出了负例、迁移失败和提示外壳控制。结果最清楚地支持：完整解答不是默认最优，选择资料必须结合 student 与任务。</p>

<p>机制解释仍有限。初始化时 teacher 与 student 的未截断 KL 最大，不代表后续训练最好；这项 KL 是额外诊断，不是代码实际优化的截断损失。更长回答、更多回溯、更多自查也没有一致对应收益。真实 ZebraLogic 案例揭示了“自查错误条件”的失败，却不足以说明整套收益来自同一种能力。</p>

<p>本文代码核查固定到 <code>76ba7f2346fb7f2c965e4160989fbc701db6f1e6</code>：公开了 29,434 行对齐资料、离线生成提示和程序、OPSD 训练分支、启动配置、评测配置与紧凑 CSV；README 明确没有公开模型检查点、完整训练日志、逐题生成、审查注释和集群启动脚本。可以检查数据如何进训练、损失怎样算，不能独立重建每一题的行为分析。本文未运行完整 GPU 训练。</p>

<p>另一个版本边界：仓库自带 PDF 的 README 声明它比 arXiv 手稿更新，两份 PDF 的文件哈希也不同。本解读的数值和图表以 <strong>arXiv v2</strong> 为准，代码行为另按上述固定版本说明，不把仓库 PDF 中的新内容混进 v2 结论。最早公开日期取 arXiv v1 记录，不取 PDF 内的构建日期。</p>

<p>个人兴趣程度 9.5/10，仅表示博客作者的兴趣。建议先读 OPSD 的基本训练过程，再看本文的 Table 3、14、20：它们分别说明种子波动、停止位置和措辞控制，最能约束只看主表容易得到的过强结论。</p>

<p class="source-note">本次核查范围：arXiv v2 全文、附录与全部 33 页渲染；公开数据的 sample_id=1；固定代码版本的资料生成、collator、训练损失、启动与发布范围。算术示例仅检查该公开训练题，不等于复现训练或 benchmark。图为根据标明位置重绘的事实示意，不复制未确认授权的原图。</p>

</div>

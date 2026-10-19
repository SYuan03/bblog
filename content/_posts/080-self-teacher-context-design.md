---
title: "[2026-09-22] What Should a Self-Teacher See? Privileged Context Design for On-Policy Self-Distillation"
permalink: "/posts/论文解读/self-teacher-context-design.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-19T17:00:00+08:00"
cover: "/lib/papers/self-teacher-context-design/cover.svg"
description: "已有参考解答时，指导学生的模型应该看完整推导、具体方法、思考方向，还是只看答案？沿公开数学题、真实逻辑题与可运行评分代码，解释五组训练、结果选择和有效性边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 16
paper_style: editorial
categories:
  - "论文解读"
tags:
  - "On-Policy Self-Distillation"
  - "Privileged Context"
  - "Context Design"
  - "Code Audit"
---

<div class="paper-reading">
<style>
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.dense-original>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.dense-original>a>img{width:850px;max-width:none;height:auto}}
</style>

<section class="deck-wrap" aria-label="Self-Teacher Context 论文图解">
<div class="deck-head"><strong>16 页图解 · 五种资料、一次更新与真实判分</strong><a href="/lib/decks/self-teacher-context-design-visual-guide.html">独立阅读 ↗</a></div>
<div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/self-teacher-context-design-visual-guide.html" title="Self-Teacher Context 论文图解，共 16 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>按钮或方向键翻页 · F 全屏 · Esc 退出</span><span>正文原图可放大；密集图表在手机上可横滑</span></p></div>
</section>

<p class="paper-meta">Tian et al. · arXiv:2609.25623v2 · 最早公开于 2026-09-22</p>
<div class="source-links"><a href="https://arxiv.org/abs/2609.25623">论文主页</a><a href="https://arxiv.org/pdf/2609.25623v2">本次解读的 33 页 v2</a><a href="https://github.com/tiankanghui/Self-Teacher-Context-Design/tree/76ba7f2346fb7f2c965e4160989fbc701db6f1e6">固定版本代码与数据</a></div>

<p class="lead">训练时已经有参考解答，学生作答时却只能看题目。作者让同一基础模型的冻结版本多看一份资料，用它指导正在训练的学生。论文比较这份资料应该包含多少信息：完整推导没有一直赢，只给方法、思考方向或题型有时更好；结论随模型规模、任务和选取的训练时刻变化。</p>

<aside class="part0"><h3 id="part-0">Part 0：教师指导的是学生正在写的回答</h3>
<p>学生每轮用当前参数作答，再由同一基础模型的冻结版本提供下一步概率，这个训练过程叫 <strong>On-Policy Self-Distillation（OPSD）</strong>。只给负责指导的教师、不给正在作答的学生的额外资料，论文称为 <strong>privileged context</strong>。</p>
<p>学生已经写出的前文叫 <strong>prefix</strong>；教师必须在同一段前文上给概率。例如学生写到“先比较指数”，教师读取“题目＋资料＋这句前文”，计算接下来各文本单位的概率，文本单位称为 token。教师不会把新答案塞回学生输入，训练程序用两份概率的差异更新学生。学生实际更新的是加在基础模型上的低秩参数 <strong>LoRA</strong>；教师关闭它，保留初始基础模型。</p></aside>

<aside class="keypoints"><ul>
<li>29,434 道训练题按五种资料对齐。完整解答来自既有数据，中间三种提示由模型离线生成，学生训练时始终看不到它们。</li>
<li>4B、8B 最好的中间提示相对完整解答提高 <strong>1.39 / 1.57 个百分点</strong>，但这是分别取各数学测试最高分的均值，可能不对应一个模型。</li>
<li>三个训练随机种子支持平均收益，不支持通用冠军：8B 题型提示在固定终点仅 1/3 个种子提高；1.7B 平均更依赖完整解答。</li>
</ul></aside>
<p class="source-note">与博客作者本人的兴趣相关程度：9.5 / 10。原图表来自 Tian et al., arXiv v2，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>；保留英文与数值，裁切另标。本文实际运行数据、算术、损失与评分函数的 CPU 检查，未运行 GPU 训练或复现模型成绩。</p>

<h2 id="研究问题：教师应该多看哪种解题材料">1. Motivation：完整解答是否最适合指导学生</h2>
<p><strong>参考解答的详细程度，与它能否指导学生当前思路，是两件事。</strong>完整解答同时给出答案、具体路径和措辞。学生可能正在走另一条路，教师却更偏向参考路径；过粗的提示又可能不足以帮助教师判断下一步。这是作者提出的解释，实验主要检验训练后的能力，尚未直接证明哪种影响造成收益。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-1.webp"><img src="/lib/papers/self-teacher-context-design/figure-1.webp" width="1700" height="720" alt="Figure 1：离线生成不同资料，冻结教师在学生相同前文上打分，再比较不同规模的训练结果"></a><figcaption>Figure 1 · 左边生成资料，中间才是训练，右边是数学测试最高分相对 L1 的差值。教师与离线资料生成模型不是同一个角色。Tian et al., v2, p.2，CC BY 4.0。</figcaption></figure>
<p>同一规模内，作者固定学生提示、数据、冻结教师和训练配置，每次实验只选一种教师资料。各组训练后参数不同，重新生成的回答也不同；相同的是每轮中教师与学生评估的前文，不能说五组训练始终使用同一批回答。</p>

<h2 id="与已有自蒸馏方法的区别">2. Related Work：从给多少参考解答，到给什么信息</h2>
<p><strong>本文研究教师资料的形式，训练方法沿用 OPSD。</strong>论文 §2 的相邻工作可以按“教师多看到什么”比较；任务和评测不同，不直接横比分数。</p>
<div class="table-scroll"><table><thead><tr><th>路线</th><th>教师可见资料 / 监督</th><th>本篇差别</th></tr></thead><tbody>
<tr><td>OPD / OPSD</td><td>更强教师，或同一基础模型加完整解答，在学生新生成前文上提供概率</td><td>固定初始教师，只替换资料；不增加新的优化器</td></tr>
<tr><td>ATESD</td><td>改变参考推理前缀长度，保留最终答案</td><td>三档语义改写不提供具体推导与最终答案；另设答案提示</td></tr>
<tr><td>Shrestha &amp; Tessier</td><td>比较教师更新方式、参考类型，也包含抽象方法提示</td><td>训练三个相邻粒度，在三种规模和多种停止规则下比较</td></tr>
<tr><td>Armandpour et al.</td><td>用梯度方向的一致程度估计资料用途，不完整训练每个配置</td><td>以实际训练后成绩为主；初始化概率差异仅作诊断</td></tr>
<tr><td>PS-OPSD</td><td>将解答整理为问题状态之间的转换及所选路径</td><td>L2 至 L4 删除显式解题步骤，保留方法、方向或类别</td></tr>
</tbody></table></div>
<p>“不需要更强的在线教师”仍以<strong>已经有参考解答</strong>为前提。主实验还用大模型离线生成提示。它没有证明只拿无答案题目就能训练，也没有验证多轮工具 Agent 或游戏代码生成。</p>

<h2 id="方法：五类教师提示与一次训练更新">3. Method：资料怎样生成，又怎样进训练</h2>
<p><strong>先离线生成五种资料，训练时只选一种交给冻结教师。</strong>先用真实训练题看清资料差别，再走一轮更新。</p>

<h3 id="math-case">3.1 一道公开数学题的五种资料</h3>
<p>公开 JSONL 的 <code>sample_id=1</code>、<code>source=olympiads</code>，与 Appendix B.1 同题：给定 p＝2<sup>3009</sup>、q＝3<sup>2006</sup>、r＝5<sup>1003</sup>，选出它们的大小顺序。答案 D 是 r＜p＜q。题面与参考解答来自 OPSD 使用的 OpenThoughts 数学池，不是作者为解读编的例子。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-math-case-a.webp"><img src="/lib/papers/self-teacher-context-design/appendix-math-case-a.webp" width="1624" height="946" alt="Appendix B.1：真实题目、完整解答L1、具体策略L2与思考方向L3"></a><figcaption>Appendix B.1 原文第一部分 · L1 给出指数 1003、底数 8/9/5 和答案 D；L2 只说明用幂的乘方规则与指数最大公约数，L3 只提出改写成统一形式。Tian et al., v2, p.15，CC BY 4.0。</figcaption></figure>
<p>L4 原文是“Elementary algebra: ordering of exponential terms with different bases and exponents.”，只给题型；L5 只有 <code>D</code>。L2 / L3 / L4 是分别生成的文字，不能理解成把 L1 从长到短截几段。L5 又是保留结果、删除路径的单独对照。</p>
<p>这题的计算只需求指数的最大公约数 gcd(3009,2006,1003)＝1003，把三项改成 8<sup>1003</sup>、9<sup>1003</sup>、5<sup>1003</sup>，比较底数。L1 首句却写“same base”，实际统一的是<strong>指数</strong>。原文保留了这个措辞瑕疵，不能照译成“相同底数”。</p>
<details><summary>补充：L4 / L5 原图、逐字资料与可运行算术检查</summary>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/appendix-math-case-b.webp"><img src="/lib/papers/self-teacher-context-design/appendix-math-case-b.webp" width="1624" height="301" alt="Appendix B.1：L4题型与L5答案原文"></a><figcaption>Appendix B.1 续 · L4 无方法与答案，L5 只给答案。Tian et al., v2, p.16，CC BY 4.0。</figcaption></figure>
<p>L2：“Apply the power-of-a-power rule to rewrite each term with a common exponent equal to the greatest common divisor of the original exponents, enabling direct comparison of the resulting bases.” L3：“Reframe the terms into a common representational form so that comparison depends on a single varying attribute.” 前者指定可使用的规则，后者没有指定该规则。英文按论文保留，中文解释不额外给教师加信息。</p>
<p>以下是本文写的 Python 3.12 算术检查，已实际运行；不是模型输出，也不是论文 benchmark 的评分器。</p>

```python
from math import gcd

common = gcd(3009, 2006, 1003)
bases = [b ** (e // common) for b, e in zip((2, 3, 5), (3009, 2006, 1003))]
assert common == 1003 and bases == [8, 9, 5]
assert bases[2] < bases[0] < bases[1]
print("D: r < p < q")
```
</details>

<h3 id="data-construction">3.2 29,434 行资料的来源与生成</h3>
<p>每行保留题面、来源和 L1 至 L5。L1 沿用参考解答；L5 提取答案，对七条证明类样本做代码规则覆盖。<strong>L2 至 L4 由 Qwen3.5-397B-A17B 离线生成，不是人工标注。</strong>作者称它为 compiler，这里指生成提示的模型流程。</p>
<p>每题分三次调用，顺序 L4→L3→L2：都能看题目和截到 4,000 字符的参考解答，后一步再看已生成的粗粒度资料。主配置 temperature 0.3、上限 512 tokens，提示禁止最终答案和实际推导。资料生成后跨学生规模复用，训练期间不重新总结每轮回答。</p>
<details><summary>补充：生成规则、教师提示外壳与原文训练配置</summary>
<p>L4 只许“领域：对象类别”；L3 只许一个可迁移的思考方向，不能命名方法或串联操作；L2 必须指定方法，但不能代入本题数值和执行推导。典型长度是软要求，传输错误或空结果最多重试三次，不因长度重试。Qwen3-8B 对照启用 thinking、temperature 0.6、上限 8,192 tokens，因此同时改变了模型与解码方式。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-generation-a.webp"><img src="/lib/papers/self-teacher-context-design/appendix-generation-a.webp" width="1624" height="917" alt="Appendix B.1：L4与L3的原文生成规则"></a><figcaption>Appendix B.1 · L4 / L3 生成约束。Tian et al., v2, p.16，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-generation-b.webp"><img src="/lib/papers/self-teacher-context-design/appendix-generation-b.webp" width="1624" height="399" alt="Appendix B.1：L2具体方法的生成规则"></a><figcaption>Appendix B.1 · L2 生成约束。Tian et al., v2, p.17，CC BY 4.0。</figcaption></figure>
<p>把题目、资料和“如何使用资料”的指令拼成教师输入的提示外壳，作者称为 <strong>bridge</strong>。主实验的标签、分隔符和衔接句随 L1 至 L5 变化；统一外壳的控制在 §5 单独说明。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-interfaces.webp"><img src="/lib/papers/self-teacher-context-design/appendix-interfaces.webp" width="1624" height="490" alt="Appendix B.2：教师与学生的输入模板"></a><figcaption>Appendix B.2 · 学生输入没有 hint。Tian et al., v2, p.17，CC BY 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/table-5.webp"><img src="/lib/papers/self-teacher-context-design/table-5.webp" width="1033" height="284" alt="Table 5：五种教师资料的标签与分隔符"></a><figcaption>Table 5 · 标签和分隔符。Tian et al., v2, p.17，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-transitions.webp"><img src="/lib/papers/self-teacher-context-design/appendix-transitions.webp" width="1624" height="1232" alt="Appendix B.2：五种教师衔接指令原文"></a><figcaption>Appendix B.2 · 五种衔接句。固定代码的 L1 使用“derive the same final answer”，此 v2 印为“arrive at the correct final answer”；这里只分别报告，不断言哪段产生论文结果。Tian et al., v2, p.18，CC BY 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/table-4.webp"><img src="/lib/papers/self-teacher-context-design/table-4.webp" width="1176" height="631" alt="Table 4：三种模型规模的完整训练配置"></a><figcaption>Table 4 · 同一规模内各资料条件一致；跨规模 batch 和贡献上限不同。Tian et al., v2, p.14，CC BY 4.0。</figcaption></figure>
</details>

<h3 id="training-update">3.3 一轮更新：相同前文，两张概率表</h3>
<ol>
<li>学生只看题面，按当前 LoRA 参数生成最多 1,024 tokens 的回答。例如它选择直接比较指数，可能尚未按参考解答改写。</li>
<li>训练程序将这份回答分别接在学生提示和教师提示后。学生启用 LoRA；教师关闭 LoRA，在“题目＋选定资料＋同一前文”下给概率。实现对整段回答做批量计算，不是每个字发一个 API 请求。</li>
<li>程序比较有效回答位置的完整词表概率，题面和为补齐长度添加的占位项（padding）不计入。<strong>教师不生成替代答案，资料不进入学生输入。</strong></li>
<li>只更新学生 LoRA，下一轮学生重新作答。评测与部署也只给题目，没有教师资料。</li>
</ol>
<p>令 q(v) 是教师对词表项 v 的概率，p(v) 是学生概率。两边先把未归一化的输出分数（logits）除以 1.1 再归一化；训练损失为：</p>
<div class="formula">L＝Σ<sub>有效位置 t</sub>Σ<sub>词表项 v</sub> min{q<sub>t</sub>(v)·log[q<sub>t</sub>(v)/p<sub>t</sub>(v)], τ} ÷ 有效回答位置数。</div>
<p>没有 min 时，词表求和是教师到学生的 forward KL，即用教师概率加权来衡量两份概率分布的差异。这里<strong>先截每个词表项的正贡献，再求和</strong>，不是截整项 KL；负贡献不截，总和可以为负。公开实现在本地 batch 内合并有效 token 取平均，长回答权重更大，不能说每条回答等权。</p>
<details><summary>补充：实际代码、负值计算与聊天模板</summary>
<p>固定仓库 <code>opsd/opsd_trainer.py:455–490</code> 的 β＝0 分支摘录如下。运行环境 Python 3.9 / PyTorch 2.8，本文用完整函数实际核验，未运行模型。变量 jsd 是函数中的名称，不代表这里使用默认 β＝0.5 的 JSD。</p>

```python
jsd = F.kl_div(student_log_probs, teacher_log_probs,
               reduction="none", log_target=True)
jsd = jsd.clamp(max=token_clip)
mask = labels != -100
jsd = jsd[mask]
loss = jsd.sum() / mask.sum()
```

<p>自拟 q＝(0.9,0.1)、p＝(0.1,0.9)，贡献为 1.9775 和 −0.2197，普通 KL 是 1.7578。设 τ＝0.05，截后 0.05−0.2197＝−0.1697。这个例子验证计算方式，不是测得的模型概率；上限 τ 与梯度范数上限 0.1 也不同。</p>
<p>三种规模均训练 200 步、8×H200、每 25 步存模型，LoRA rank/alpha＝64/128、学习率 5e-6；1.7B / 4B / 8B 有效 batch 为 64/32/32，τ 为 0.05/0.05/0.06。top-p 0.95、top-k 20 只限制生成，损失仍看完整词表。</p>
<p>学生训练生成用不启用单独思考段的 non-thinking 聊天模板，教师打分和最终评测用启用思考段的 thinking 模板。教师的模板标记不同，不意味着先生成一段新推理再评分；主配置没有开启另生成教师推理的 reason_first 分支。代码内还有更新教师参数的其他分支，都不属于本文主实验。</p>
</details>

<h2 id="实验：评测口径、种子波动与错误案例">4. Experiments：最高分、固定终点与真实错误</h2>
<p><strong>4B、8B 有平均收益，最好的资料和收益大小却依赖读分规则。</strong>先说明一份回答的判分和总分分母，再看结果。</p>

<h3 id="metrics">4.1 数学正确率与模型选择</h3>
<p>AIME24、AIME25、HMMT25 各 30 题，每题采样 12 次，temperature 1.0、回答上限 38,912 tokens。公开评测先取最终答案，再用 <code>math_verify</code> 比对，提取失败计错。<strong>Avg@12＝正确回答数÷(30×12)</strong>；不是 12 次只要中一次就算对的 Pass@12。自拟一题 9/12 次正确，前者是 75%，后者是 100%。</p>
<p>主表为三项测试分别取第 25、50……200 步八个 checkpoint（保存的模型）中的最高分，再平均。比如 4B / L3 的三项最高分分别来自第 100、50、125 步，均值 64.81 <strong>不代表某一个模型同时做到</strong>。Base 则是未训练模型一次评测，不做这类选择。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-1.webp"><img src="/lib/papers/self-teacher-context-design/table-1.webp" width="1652" height="753" alt="Table 1：三种规模、五种资料和未训练模型的数学测试最高分"></a><figcaption>Table 1 · seed 42，分别取各测试集最高 Avg@12。4B 最好为 L3，8B 为 L2，1.7B 为 L1；数值差按未四舍五入值计算。Tian et al., v2, p.6，CC BY 4.0。</figcaption></figure>
<p>4B 的 L3 相对 L1 是 64.81 对 63.43，提高 1.39 点；8B 的 L2 是 68.24 对 66.67，提高 1.57 点。1.7B 仍是完整解答最好。只给答案的 L5 在 4B / 8B 与 L1 相差不到 0.2 点，完整推导并非这两组成绩的必要条件。</p>
<p>固定第 200 步，4B 主实验的 L2 / L4 为 62.59、L1 为 60.93；8B 的 L3 对 L1 仅 65.37−65.28＝0.09 点。三个训练随机种子只覆盖 L1 / L3 / L4：4B L3 终点差为 <strong>+1.67±0.73，3/3 提高</strong>；8B L4 为 +0.22±1.05，仅 1/3 提高。± 是种子间样本标准差，不是置信区间。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-3.webp"><img src="/lib/papers/self-teacher-context-design/table-3.webp" width="1652" height="414" alt="Table 3：四种checkpoint汇总规则下，相同种子的L3与L4相对L1差值"></a><figcaption>Table 3 · 括号是三个种子中差值严格为正的数量。中间提示的平均方向比具体冠军稳定。Tian et al., v2, p.7，CC BY 4.0。</figcaption></figure>
<details><summary>补充：所有种子、训练曲线与一处步数记载差异</summary>
<p>“Best common”每组取一个三测试均值最高的 checkpoint；“All-ckpt. mean”平均八个时刻；“Step 200”固定终点。4B 主配置的共同 checkpoint 最好变成 L4（64.63），L3 为 63.24。L2 / L5、迁移和多数控制仍只有一个训练 seed。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-14.webp"><img src="/lib/papers/self-teacher-context-design/table-14.webp" width="1222" height="301" alt="Table 14：训练回答上限1024与2048的不同读分结果"></a><figcaption>Table 14 · 最高分、共同 checkpoint 与终点。Tian et al., v2, p.23，CC BY 4.0。</figcaption></figure>
<p>此表把 4B / L2 / seed 42 的共同最高分 63.43 记为第 125 步，公开 <code>id_run_summary.csv</code> 记为第 50 步。分数一致、步数不同；没有完整逐 checkpoint 日志，不能断言是并列最优。本文不依赖这条步数作结论。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-15.webp"><img src="/lib/papers/self-teacher-context-design/table-15.webp" width="1176" height="1264" alt="Table 15：三个随机种子的绝对成绩"></a><figcaption>Table 15 · 完整三种子结果。Tian et al., v2, p.24，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-16.webp"><img src="/lib/papers/self-teacher-context-design/table-16.webp" width="1652" height="473" alt="Table 16：各测试最高分对应的模型保存步数"></a><figcaption>Table 16 · 每项测试选中的步数。Tian et al., v2, p.25，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-5.webp"><img src="/lib/papers/self-teacher-context-design/figure-5.webp" width="1700" height="565" alt="Figure 5：不同教师资料下的训练损失曲线"></a><figcaption>Figure 5 · 各组教师目标、学生生成都不同，纵轴不能用于判定“哪种资料教得最好”。Tian et al., v2, p.25，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-6.webp"><img src="/lib/papers/self-teacher-context-design/figure-6.webp" width="1700" height="1356" alt="Figure 6：三种规模、三项数学测试随checkpoint变化的完整曲线"></a><figcaption>Figure 6 · 最高分与终点经常不同；虚线是第 200 步。Tian et al., v2, p.26，CC BY 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/table-17.webp"><img src="/lib/papers/self-teacher-context-design/table-17.webp" width="624" height="196" alt="Table 17：各组最高分与第200步成绩差距"></a><figcaption>Table 17 · 最高分与终点之差。Tian et al., v2, p.26，CC BY 4.0。</figcaption></figure>
</details>

<h3 id="zebra-case">4.2 真实逻辑题：把“隔两栋房子”读成距离 2</h3>
<p>Appendix D.2 选的 <code>lgp-test-4x6-25</code> 是 ZebraLogic 四栋房子、六类属性的真实题。学生看题面、15 条线索与输出 JSON 的格式，不看标准表，也不看训练时的资料。上游完整 1,000 题指纹与作者数据记录一致。关键线索原文：“There are two houses between the photography enthusiast and the person who loves beach vacations.”</p>
<p>“中间隔两栋”要求位置差为 3，四栋房子只剩端点 1 和 4。标准表的 photography（摄影爱好）在 1、beach（海滩度假）在 4。8B / L3 第一次就写出 beach＝photography±3，后续按其他线索完成整表，论文记录 PASS，回答长 33,912 字符。</p>
<p>8B / L1 误读成距离 2，接受 photography 在 2、beach 在 4，最后还称所有线索满足。它没确定 mountain（山地度假）/ cruise（邮轮度假）应放在哪两个格子，直接凭“题目应该唯一”挑一种，整表 FAIL；回答长 67,938 字符。更多自查没有修正最初误读。<strong>两份完整生成未公开，不能补造 L1 最终的全部格子。</strong></p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-zebra-case.webp"><img src="/lib/papers/self-teacher-context-design/appendix-zebra-case.webp" width="1624" height="182" alt="Appendix D.2：L1在两个未解决的度假格子间直接猜测的原文摘录"></a><figcaption>Appendix D.2 · 作者公开的失败回答摘录，保留原文。样例按成功反差预选，不是随机代表题。Tian et al., v2, p.31，CC BY 4.0。</figcaption></figure>
<p>作者的公开评分器先从回答取最后一个含 <code>solution</code> 的完整 JSON，再逐格对照标准表。<strong>整题 PASS＝24/24 个标准格都正确</strong>；单格准确率另算。本文实际调用该函数：将标准表故意改错一个格，返回 23/24＝95.83% 单格正确率，但整题 FAIL。这是评分测试，不是论文模型日志。</p>
<details><summary>补充：标准表、公开评分代码与实际测试</summary>
<p><a href="https://huggingface.co/datasets/WildEval/ZebraLogic/viewer/grid_mode/test">上游完整题面与标准表</a>（数据版本 <code>0a473f5a0054835754ed156d5a79c6ce27178bb1</code>）。以下保留用于核验的事实值；不将整套数据作为本博客的再发布附件。数据集许可未核实，论文的 CC BY 不等于数据集许可。</p>
<div class="table-scroll"><table><thead><tr><th>House</th><th>Name</th><th>Hobby</th><th>BookGenre</th><th>Vacation</th><th>MusicGenre</th><th>Education</th></tr></thead><tbody>
<tr><td>1</td><td>Eric</td><td>photography</td><td>mystery</td><td>mountain</td><td>pop</td><td>high school</td></tr>
<tr><td>2</td><td>Arnold</td><td>painting</td><td>fantasy</td><td>cruise</td><td>classical</td><td>bachelor</td></tr>
<tr><td>3</td><td>Alice</td><td>cooking</td><td>science fiction</td><td>city</td><td>jazz</td><td>master</td></tr>
<tr><td>4</td><td>Peter</td><td>gardening</td><td>romance</td><td>beach</td><td>rock</td><td>associate</td></tr>
</tbody></table></div>
<p>固定 <code>eval/evaluate_zebralogic.py:60–71</code> 的评分摘录如下；已运行于 Python 3.12。它是本篇作者发布的 benchmark 评测实现，不冒充 ZebraLogic 上游原始 evaluator。</p>

```python
def score_solution(prediction, gold):
    correct_cells = 0
    total_cells = 0
    for house, attributes in gold.items():
        predicted_house = prediction.get(house, {}) if isinstance(prediction, dict) else {}
        if not isinstance(predicted_house, dict):
            predicted_house = {}
        for attribute, gold_value in attributes.items():
            total_cells += 1
            predicted_value = predicted_house.get(attribute)
            correct_cells += int(normalize_cell(predicted_value) == normalize_cell(gold_value))
    return correct_cells, total_cells, correct_cells == total_cells
```

<p><code>normalize_cell</code> 去首尾空白、忽略大小写，列表取第一项。漏格算错，额外属性或房子不扣分；这些行为都实际核验。评分路径比较标准格，不独立执行 15 条线索，也不检查推理是否成立。提取失败返回零个正确格，分母仍保留。</p>
<div class="table-scroll"><table><thead><tr><th>本文构造的评分测试</th><th>正确格</th><th>整题</th></tr></thead><tbody><tr><td>原标准表</td><td>24/24</td><td>PASS</td></tr><tr><td>改错或漏掉一个标准格</td><td>23/24</td><td>FAIL</td></tr><tr><td>标准表再加无关房子 / 属性</td><td>24/24</td><td>PASS</td></tr></tbody></table></div>
</details>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-8.webp"><img src="/lib/papers/self-teacher-context-design/figure-8.webp" width="1700" height="419" alt="Figure 8：不同规模中间提示救回与丢失的ZebraLogic题目数"></a><figcaption>Figure 8 · 救回题与丢失题必须一起算。8B 救回 48，但原来会做的题丢了 31，净增 17；1.7B 净丢 7。Tian et al., v2, p.29，CC BY 4.0。</figcaption></figure>
<p>8B / L3 相对 L1：救回 48/136 道原先不会的题，同时丢失 31/864 道原先会的题，总提升 (48−31)/1,000＝1.70 点，不是 35.3%。单个案例说明一种失败方式，不能证明主表最高分全部来自更好的条件理解。</p>

<h3 id="transfer">4.3 迁移：没有一档资料通吃</h3>
<p>固定第 200 步测四项迁移：MT-AIME 的 30 题七语言翻译，各语言 Avg@12 等权平均；GPQA-Diamond 198 题每题十次，分母 1,980；AutoLogi-EN 1,575 题每题一次，由题目附带程序检查；ZebraLogic 1,000 题每题一次，主指标整表正确率。每个规模都有三种不同资料赢得这四项测试。</p>
<p>负结果是 C-Eval 中文知识测试：52 学科均值中，<strong>L1 至 L4 在任何规模都没超过 Base</strong>，答案提取失败也计错；只有 4B / L5 略高 0.07 点。数学训练没有普遍提高通用知识。</p>
<details><summary>补充：迁移全表、难度分组与行为分析原图</summary>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-2.webp"><img src="/lib/papers/self-teacher-context-design/table-2.webp" width="1652" height="358" alt="Table 2：各迁移任务的最好资料与相对L1差值"></a><figcaption>Table 2 · 四项迁移的赢家。Tian et al., v2, p.6，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-9.webp"><img src="/lib/papers/self-teacher-context-design/table-9.webp" width="1652" height="820" alt="Table 9：三种规模的完整迁移成绩"></a><figcaption>Table 9 · 固定第 200 步，不为迁移重新选模型。Tian et al., v2, p.21，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-10.webp"><img src="/lib/papers/self-teacher-context-design/table-10.webp" width="1652" height="820" alt="Table 10：ZebraLogic整题、单格与困难大表子集成绩"></a><figcaption>Table 10 · 单格正确不等于整题成功。Tian et al., v2, p.22，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-11.webp"><img src="/lib/papers/self-teacher-context-design/table-11.webp" width="1652" height="820" alt="Table 11：C-Eval通用知识成绩和提取失败率"></a><figcaption>Table 11 · C-Eval 的 32,768-token 上限；提取失败计错。Tian et al., v2, p.22，CC BY 4.0。</figcaption></figure>
<p>AutoLogi 将回答解析成数据，再运行每题的输入检查与全部约束，超时 / 异常 / 无法提取都算错。GPQA 用冻结选项顺序、提取最终标签；迁移采样通常 temperature 0.6、top-p 0.95、top-k 20、上限 32,768 tokens。它们各自的程序与分母不同，不能把分数简单相加。</p>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/figure-3.webp"><img src="/lib/papers/self-teacher-context-design/figure-3.webp" width="1700" height="1542" alt="Figure 3：按L1成功率分组后，不同规模任务上的准确率变化"></a><figcaption>Figure 3 · 不同题难度的收益和损失。Tian et al., v2, p.9，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-18.webp"><img src="/lib/papers/self-teacher-context-design/table-18.webp" width="1652" height="441" alt="Table 18：难度分组的完整收益损失"></a><figcaption>Table 18 · 用 L1 自己的成绩分组，存在向均值回归的影响，不能全归因于能力转移。Tian et al., v2, p.29，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-9.webp"><img src="/lib/papers/self-teacher-context-design/figure-9.webp" width="1700" height="676" alt="Figure 9：MT-AIME逐次正确率与至少一次正确覆盖率的变化"></a><figcaption>Figure 9 · 横轴 Pass@12 覆盖率变化，纵轴 Avg@12 变化，两者可不同向。Tian et al., v2, p.30，CC BY 4.0。</figcaption></figure>
<p>行为分析另外请模型标注“是否自查、回溯、纠错”，不是 benchmark 正确性判分。30 道 AIME24、60 道 GPQA 每条件至多四条有效回答，长轨迹保留首尾，实际有效标注 5,997/6,000。4B / 8B 的中间提示并未一致增加回溯或纠错；合并三个规模的图不能代替分规模结论。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-19.webp"><img src="/lib/papers/self-teacher-context-design/table-19.webp" width="1652" height="473" alt="Table 19：各规模AIME24的模型标注行为比例"></a><figcaption>Table 19 · 行为比例与实际正确率使用的样本数不同。Tian et al., v2, p.30，CC BY 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/figure-10.webp"><img src="/lib/papers/self-teacher-context-design/figure-10.webp" width="1700" height="1738" alt="Figure 10：跨规模合并的模型标注行为差值与按问题重复抽样的区间"></a><figcaption>Figure 10 · 区间按问题重采样，不是三个训练种子的波动。Tian et al., v2, p.30，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-judge-a.webp"><img src="/lib/papers/self-teacher-context-design/appendix-judge-a.webp" width="1624" height="522" alt="Appendix D.2：行为标注模型的字段与定义"></a><figcaption>Appendix D.2 · 行为 judge 的提示第一部分。Tian et al., v2, p.28，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-judge-b.webp"><img src="/lib/papers/self-teacher-context-design/appendix-judge-b.webp" width="1624" height="186" alt="Appendix D.2：行为标注规则续"></a><figcaption>Appendix D.2 · 行为 judge 的续页。Tian et al., v2, p.29，CC BY 4.0。</figcaption></figure>
</details>

<h2 id="控制实验与下一步验证">5. Discussion：哪些解释已有支持，哪些仍缺控制</h2>
<p><strong>中间资料的平均优势有支持，语义、长度和答案可见性尚未完全分开。</strong>最有用的控制是统一教师提示外壳：4B 的 L2 / L3 / L4 最高分均值 64.54/63.98/65.28，L1 是 62.96。优势保留，但冠军从 L3 变 L4，说明外壳不是全部原因，也确实影响结果。</p>
<p>直接截参考解答前 10% 再加答案是 63.89，低于 L3 的 64.81；这组既不等长，又可见最终答案，不能单独证明语义比长度更重要。训练回答上限翻倍到 2,048 后，最高分趋势保留，L2 固定终点却从 62.59 降到 58.61。最高潜力与停止时刻仍要分开。</p>
<p>资料变短也不能按比例宣称训练变便宜：L1 平均 657.3 hint tokens，L2 / L3 / L4 为 38.9/25.2/17.7；加题目和外壳后的教师输入 835→225.5/212.7/203.3，只短约 3.7 至 4.1 倍。参考解答、离线生成与训练反向传播的成本未计入这个比值。</p>
<details><summary>补充：控制原表、泄漏审查、初始化 KL 与按题选择</summary>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-11.webp"><img src="/lib/papers/self-teacher-context-design/figure-11.webp" width="1700" height="577" alt="Figure 11：统一教师外壳与混合提示的完整控制"></a><figcaption>Figure 11 · 中间提示对 L1 的优势保留，具体赢家仍变。Tian et al., v2, p.33，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-20.webp"><img src="/lib/papers/self-teacher-context-design/table-20.webp" width="1652" height="473" alt="Table 20：统一外壳和混合提示成绩"></a><figcaption>Table 20 · 每题只分配一种提示，不拼接全部资料。Tian et al., v2, p.31，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-shared-bridge.webp"><img src="/lib/papers/self-teacher-context-design/appendix-shared-bridge.webp" width="1624" height="319" alt="Appendix E：所有资料共用的教师输入外壳"></a><figcaption>Appendix E · 统一教师外壳。Tian et al., v2, p.31，CC BY 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/self-teacher-context-design/table-12.webp"><img src="/lib/papers/self-teacher-context-design/table-12.webp" width="907" height="277" alt="Table 12：397B与8B生成资料后的最高分均值"></a><figcaption>Table 12 · 换资料生成模型也换了解码配置。Tian et al., v2, p.23，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-13.webp"><img src="/lib/papers/self-teacher-context-design/table-13.webp" width="1652" height="340" alt="Table 13：语义资料与前10%解答加答案的对照"></a><figcaption>Table 13 · 长度和答案可见性未同时控制。Tian et al., v2, p.23，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-6.webp"><img src="/lib/papers/self-teacher-context-design/table-6.webp" width="1652" height="287" alt="Table 6：资料本身与完整教师输入的token长度"></a><figcaption>Table 6 · 资料长度与完整输入长度是两个分母。Tian et al., v2, p.18，CC BY 4.0。</figcaption></figure>
<p>同一个 397B 模型用两种提示审查 1,200 道题，两边不一致再做第三次裁决，不是人工一致性检查。直接答案泄漏为零，仍有“结论等价于答案”的泄漏：主生成器 L2 / L3 / L4 为 17/4/1 条，8B 为 50/31/2 条。字符串扫描不匹配不能保证无泄漏。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-4.webp"><img src="/lib/papers/self-teacher-context-design/figure-4.webp" width="1700" height="476" alt="Figure 4：资料长度分布和审查发现的等价答案泄漏"></a><figcaption>Figure 4 · 长度全量统计 29,434 题，泄漏只审查 1,200 题。Tian et al., v2, p.19，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-7.webp"><img src="/lib/papers/self-teacher-context-design/table-7.webp" width="1652" height="340" alt="Table 7：两种生成器的审查结果"></a><figcaption>Table 7 · 模型裁决后的泄漏与规则合规率。Tian et al., v2, p.19，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-8.webp"><img src="/lib/papers/self-teacher-context-design/table-8.webp" width="1652" height="379" alt="Table 8：两种模型审查提示的一致率"></a><figcaption>Table 8 · 同一模型的提示 A/B 一致率，不是人类标注者一致率。Tian et al., v2, p.20，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-audit-a.webp"><img src="/lib/papers/self-teacher-context-design/appendix-audit-a.webp" width="1624" height="211" alt="Appendix B.3：两个资料审查角色的提示原文"></a><figcaption>Appendix B.3 · 审查提示 A/B。Tian et al., v2, p.19，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/appendix-audit-b.webp"><img src="/lib/papers/self-teacher-context-design/appendix-audit-b.webp" width="1624" height="1267" alt="Appendix B.3：第三次裁决和泄漏合规性定义"></a><figcaption>Appendix B.3 · 第三次裁决与共享规则。Tian et al., v2, p.20，CC BY 4.0。</figcaption></figure>
<p>初始化 KL 使用每规模 600 道训练题各两条 Base 回答，再固定前文计算未截断 KL。L1 的差异最大，却没有训出 4B / 8B 最好成绩。答案附近的子集排除很多未完成回答；四分位图的 Q4 是回答后四分之一，不是最终答案区。这些诊断不等于移动中的训练损失。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-2.webp"><img src="/lib/papers/self-teacher-context-design/figure-2.webp" width="1700" height="581" alt="Figure 2：初始化固定前文下的KL与答案附近窗口差异"></a><figcaption>Figure 2 · 95% 区间按问题重采样，测的是初始化、未截断 KL。Tian et al., v2, p.8，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/figure-7.webp"><img src="/lib/papers/self-teacher-context-design/figure-7.webp" width="1700" height="569" alt="Figure 7：回答四分位位置上的初始化KL"></a><figcaption>Figure 7 · Q4 不是答案窗口，生成长度截断仍会影响观察。Tian et al., v2, p.28，CC BY 4.0。</figcaption></figure>
<p>按题选择的学习网络（<strong>learned router</strong>）在学生作答后提取 39 项特征，每十步训练一次两层分类器；另一组对五种资料额外计算教师概率，再按优势挑选。公开数据的 routed mixture 只是按行套所选提示外壳，不能称为这个学习网络。</p>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-21.webp"><img src="/lib/papers/self-teacher-context-design/table-21.webp" width="1218" height="343" alt="Table 21：四种按题选择教师资料的方法"></a><figcaption>Table 21 · 没有选择策略超过最佳固定资料的最高分；部分终点更好。Tian et al., v2, p.32，CC BY 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/self-teacher-context-design/table-22.webp"><img src="/lib/papers/self-teacher-context-design/table-22.webp" width="1652" height="498" alt="Table 22：固定混合分配和逐资料外壳的结果"></a><figcaption>Table 22 · 混合条件的最高分与固定终点。Tian et al., v2, p.33，CC BY 4.0。</figcaption></figure>
<p>混合与学习选择均未超过最好固定资料的最高分，若干终点更好。固定公开训练器没有释放上述学习选择实现和对应逐题数据，不能声称一条启动命令即可复现该表。</p>
</details>
<p>若把参考代码作为教师资料，可比较完整代码、从代码提取的具体策略和结构说明，并加等长截取、错误任务资料与隐藏答案控制。这个游戏方向是本文的应用推想，不是论文已验证结果。固定训练算法比较资料，再单独改算法，才知道收益来自哪一处。</p>

<h2 id="结论与公开代码的复现边界">6. Conclusion：完整解答是基线，不是默认最优</h2>
<p><strong>最可靠的结论是比较资料设计，而不是宣称越抽象越好。</strong>4B / 8B 的中间提示有跨种子平均收益，1.7B、知识迁移和固定终点提醒我们：哪档资料好、何时停，仍是实验问题。逻辑题的自查错误也说明，可见检查次数不能代替最终正确性。</p>
<p>固定仓库 <code>76ba7f2</code> 提供对齐资料、生成脚本、训练分支、评测器和紧凑 CSV，未提供 checkpoint、完整日志、逐题生成、模型审查标注与学习选择器。本文核验完整题池指纹、实际评分和损失函数，不能重建论文所有行为分析或模型分数。</p>
<p>数值和原图全部以 <strong>arXiv v2</strong> 为准；仓库 PDF 明确是更新手稿，与 v2 哈希不同，不能混用。论文 CC BY 4.0 也不覆盖数据和整个代码仓库：训练器有 Apache 2.0 文件头，其余许可按 <code>NOTICE.md</code> 与上游条款分别核实。</p>

</div>

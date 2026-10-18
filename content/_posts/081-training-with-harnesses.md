---
title: "[2026-05-09] Training with Harnesses: On-Policy Harness Self-Distillation for Complex Reasoning"
permalink: "/posts/论文解读/training-with-harnesses.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-18T21:00:00+08:00"
cover: "/lib/papers/training-with-harnesses/cover.svg"
description: "训练时，让模型多走一遍检索或规划流程，再用这份额外材料训练它直接作答。OPHSD 在两套短流程上有效；本文用真实法律与数学题解释训练、判分，以及论文和公开实现的差异。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 14
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
@media (max-width: 640px) {
  body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram > a { display: block; overflow-x: auto; }
  body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram > a img { width: 760px; max-width: none; height: auto; }
}
</style>

<div class="paper-reading">

<p class="paper-meta">Zhengyang Zhao, Lu Ma, Wentao Zhang · arXiv:2605.08741v1 · 最早公开于 2026-05-09</p>
<div class="source-links"><a href="https://arxiv.org/abs/2605.08741">论文主页</a><a href="https://arxiv.org/pdf/2605.08741v1">论文 PDF</a><a href="https://github.com/zzy1127/OPHSD-On-Policy-Harness-Self-Distillation/tree/20eaa0c8b0674fbf81aa780a8cf4e0d7c550d4ea">核查的官方代码</a></div>

<section class="deck-wrap" aria-label="OPHSD 交互图解">
  <div class="deck-head"><strong>14 页交互图解 · 训练输入、两个真实 case 与判分</strong><a href="/lib/decks/training-with-harnesses-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/training-with-harnesses-visual-guide.html" title="OPHSD 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页；F 全屏，Esc 退出</span><span>手机端可滚动页内内容与宽图表</span></p></div>
</section>

<p class="lead">模型独立作答会漏步骤，先检索相似案例或列计划往往更好。OPHSD 想把这部分收益训练进模型：当前模型先只看原题作答，外部程序另行准备计划或检索材料；训练开始时保存的模型副本多看这些材料，再给当前模型概率反馈。最后使用时，模型直接回答原题。</p>

<aside class="part0"><span class="kicker">PART 0 · 这里的 harness 和蒸馏</span><p>harness 是模型外部的控制程序，决定何时检索、调用模型几次、把哪些结果放进下一次输入。正在训练的作答模型叫 student；负责计算反馈的固定初始副本叫 teacher，两者尺寸相同。token 是模型预测的文字单位。</p><p>teacher 不另写一份答案让 student 照抄，而是在 <strong>student 已经写出的同一份回答</strong>上，计算下一 token 的概率。这叫 on-policy distillation：训练用的是当前模型自己采样的回答。OPHSD 新增的步骤，是用 harness 为 teacher 准备额外输入。</p></aside>

<aside class="keypoints"><ul><li>实验只有<strong>两套短流程</strong>：分类的检索后复核，数学的先规划再求解。没有 Claude Code／Codex 式完整工具交互实验。</li><li>固定训练终点、四次运行中，Qwen3-8B 的数学平均 pass@8 为 <strong>66.89±0.65</strong>，GRPO 为 65.00±0.18。pass@8 是八次尝试至少对一次，详见判分部分。</li><li>论文与发布代码的数学输入、KL 方向不同，复现前必须选定协议。博客作者个人兴趣程度：9/10。</li></ul></aside>
<p class="note">原论文图表未查到明确的第三方复用许可：arXiv 的许可只授权其分发，仓库也没有 LICENSE。下文链接原图，重新排版核心流程和表中数据，没有复制原图画面。</p>

<h2 id="研究问题：将规划与检索的收益训练进模型">1. Motivation：把外部流程的收益训练进模型</h2>

<p><strong>外部流程能帮模型，但移除流程以后，这份帮助通常也消失。</strong>未训练 Qwen3-8B 接上分类流程后，LawBench 的逐案 F1 从 55.29 到 60.22，USPTO 反应分类准确率从 30.07 到 79.02；数学四项平均的一次作答通过率从 25.64 到 43.47。它们来自 Tables 2、3，不能与后文的八次尝试结果混用。</p>
<p>论文问的是：训练时利用流程中的中间材料，能否让模型以后自己做出类似的比较和分解？它训练的是模型权重，外部控制程序本身没有被优化。</p>

<h2 id="与答案蒸馏、奖励训练和-harness-优化的区别">2. Related Work：teacher 的帮助从哪里来</h2>

<p><strong>最接近的对照是 OPSD：同一初始模型，多看标准答案再评分。</strong>OPHSD 改成让当前模型先运行流程，把整理出的中间材料交给 teacher。Table 1 的区别可按实际训练对象来读：</p>
<div class="table-scroll"><table><thead><tr><th>方法</th><th>训练用的回答</th><th>反馈来源</th><th>部署保留什么</th></tr></thead><tbody><tr><td>SFT，监督微调</td><td>固定示范答案</td><td>逐 token 模仿示范</td><td>模型</td></tr><tr><td>GRPO</td><td>当前模型的一组回答</td><td>比较各回答的最终奖励</td><td>模型</td></tr><tr><td>OPSD</td><td>当前模型自己的回答</td><td>teacher 多看标准标签／标准解</td><td>模型</td></tr><tr><td>SDPO / OEL</td><td>当前模型自己的回答</td><td>执行反馈／过去经验给 teacher；本论文没有实测这两项</td><td>取决于任务，不能一概称无工具</td></tr><tr><td>CRISP，数学对照</td><td>当前模型自己的回答</td><td>teacher 多看“更简洁”要求，每 50 步同步权重</td><td>模型</td></tr><tr><td>OPHSD</td><td>当前模型自己的回答</td><td>固定 teacher 多看当前 harness 组装的材料</td><td>模型，移除本文的两套流程</td></tr></tbody></table></div>
<p>Meta-Harness、Natural-Language Agent Harnesses 等工作修改外部流程，部署时仍运行它。OPHSD 的优化对象是模型，这是两条工作的边界。SFT 也没有出现在本文主实验中，不应把概念对比写成实测胜负。</p>

<h2 id="方法：同一份回答，两种输入条件">3. Method：同一份回答，两种输入条件</h2>

<p><strong>teacher 权重固定，但它看到的材料每轮重新生成。</strong>一次训练更新按下面的顺序展开。原论文 <a href="https://arxiv.org/pdf/2605.08741v1#page=4">Figure 1</a>给出总体结构；代码把消息路径展开得更具体。</p>
<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/training-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/training-with-harnesses/training-compact.svg" width="900" height="420" alt="当前模型直接生成回答，harness另行组装输入，固定teacher与student重评相同回答，仅更新student"></a><figcaption>根据 Figure 1、Eq. (3) 和固定代码版本重绘。两边共用的是回答 token，不是始终共用一份更新中的权重。</figcaption></figure>
<ol><li>当前模型只读原题 x，采样完整回答 y。</li><li>harness 另行调用当前模型，检索或规划，准备额外材料。它不是先修改 y。</li><li>训练程序取 harness <strong>最后一次调用的输入消息</strong>作为 C：分类取复核输入，数学取求解输入。代码字段 <code>teacher_prompt</code> 在这里动态组装，不是人工标注的静态字段。</li><li>student 读“原题 + y 的前缀”；teacher 读“C + 相同前缀”。两边计算各位置的下一 token 概率，用它们的差异训练 student。</li><li>只更新 student；分类再把本批已标注数据加入检索表。下一轮重新采样 y、生成 C。</li></ol>
<p>只有回答位置参与损失。harness 最终答案不作为目标文本；代码要求它非空才保留样本，<strong>没有检查是否正确</strong>。默认任务得分只记录，不用作奖励更新。手机端的流程图可横向滚动，也可点击放大。</p>

<h3>3.1 Draft-Verify：检索两次，复核一次</h3>

<p>分类 harness 保存一张含历史样例、真实标签和文本向量的表，称为 memory bank。程序按向量的 cosine similarity（方向相似度）取最接近的 5 条，交给当前模型生成初步标签 draft。随后按 draft 标签再取两组，每组最多 5 条：</p>
<ul><li>confirmers：与 draft 至少共享一个真实标签的已标注数据行。</li><li>challengers：与 draft 没有共同标签的已标注数据行。</li></ul>
<p>它们是<strong>检索样例，不是额外 agent</strong>。原题、draft 标签和两组样例组成 verify prompt，当前模型再调用一次，维持或修正判断。teacher 多看这个输入，不含最后的 verify 回答。正常有两次生成、三次检索。</p>
<p>测试时另建空表，每批预测完才插入该批真实标签；后面的题能用先前测试题标签，不能视为普通独立测试。</p>
<details class="supplement"><summary>检索实现：冷启动、批次与重复题</summary><p>表不足 10 条时只直接调用一次；无有效 draft 标签时停在 draft。verify 不一定包含第一轮全部近邻。测试默认一批 100 题，第一批共享空表，整批预测完再插入。重复遍历训练集（epoch）时不清表，也不排除当前样例索引，重复题可能检索到自身先前已标注的副本。</p></details>

<h3>3.2 真实分类题：检索怎样把得分从 2/3 变成 0</h3>

<p>Appendix B.1 的 case 是 <a href="https://github.com/open-compass/LawBench/blob/e30981bb3ff54c41571f222e0b23e92d27375388/data/zero_shot/3-3.json">LawBench task 3-3，第 44 行</a>（从 0 计数，共 500 行）。原题给出餐馆互殴、被害人冠心病急性发作死亡、鼻骨轻伤等事实，<strong>还包含检方“应当以故意伤害罪追究”的指控</strong>；数据标准答案却是“过失致人死亡”。评测目标是匹配这项数据标签，不是复制检方意见，也不是本文给出普遍法律裁定。</p>
<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/law-case-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/training-with-harnesses/law-case-compact.svg" width="900" height="330" alt="真实LawBench题直接输出两个罪名得2/3，重新检索后只留错误罪名得0"></a><figcaption>根据 Appendix B.1 的作者报告、原始数据行与公开集合 F1 程序重绘。没有重新调用模型；原始 case 面板见 PDF pp. 14–16。</figcaption></figure>
<p>作者展示训练后的同一模型：直接回答同时报出“故意伤害、过失致人死亡”。接上 harness 后，五条 draft 近邻都含“故意伤害”，相似度为 0.814、0.811、0.808、0.799、0.797；另一组虽标签不同，却是侵入住宅、强奸、盗窃等，均没有“过失致人死亡”。draft 和 verify 最后都只留“故意伤害”。<strong>不同标签的近邻不一定是有用反例。</strong></p>
<p>公开 judge（判分程序）先从 <code>[罪名]…&lt;eoa&gt;</code> 提取标签，再按已知罪名规范化；无有效答案块时，去掉闭合的 <code>&lt;think&gt;</code> 内容后扫描文本。预测集合为 P、标准集合为 G，逐案 <code>F1=2|P∩G|/(|P|+|G|)</code>。直接回答为 <code>2×1/(2+1)=2/3</code>；重新检索后交集为空，得 0。最后对案件的 F1 平均，而不是按罪名类别平均。</p>

<h3>3.3 Plan-Solve：计划来源必须分版本看</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/plan-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/training-with-harnesses/plan-compact.svg" width="900" height="300" alt="论文planner看标准解而solver只看计划，发布代码planner只看原题而solver和teacher多看标准答案"></a><figcaption>论文 §3.3 与 commit 20eaa0c 的实际参数传递对照；根据事实重绘，没有断言原实验内部用了发布代码默认流程。</figcaption></figure>
<p>论文让负责规划的调用 planner 看“原题 + 完整标准解”，整理成 plan；求解调用 solver 只看“原题 + plan”。teacher 也使用 solver 的输入。planner、solver 都调用当前模型，没有两个独立训练的 agent。</p>
<p>发布实现保存了 <code>solution</code>，但训练调度只传 <code>question</code> 和 <code>answer</code>：planner 没收到标准解，solver 与 teacher 却收到 <code>Reference answer (for verification only)</code>。本文沿调用路径并用无模型调用的测试确认了这点。验证 harness 时两种额外信息都被移除。它们是不同的训练协议，不能拼成一套“答案只经过 plan”的实现。</p>

<h3>3.4 概率反馈怎样更新参数</h3>

<p>teacher 给出 pT，student 给出 pS，KL 衡量下一 token 分布的差异。论文 Eq. (3) 写 <code>KL(pT ∥ pS)</code>，虽称 reverse KL；发布默认 <code>reverse_kl</code> 实际算：</p>
<div class="formula"><code>KL(pS ∥ pT)=Σ<sub>词表中的 token v</sub> pS(v)·[log pS(v)−log pT(v)]</code></div>
<p>它比较<strong>整个词表分布</strong>，不只比较采样 token；teacher 停止梯度，只通过 pS 更新 student。代码每个小批次合并有效回答 token 求平均，再累积梯度，不等于论文先逐回答平均。</p>
<details class="supplement"><summary>KL 的教学算例与可选配置</summary><p>人为设定 pS=(0.7,0.3)、pT=(0.2,0.8)，代码方向 KL≈0.5827，论文方向约 0.5341。两者优化方向不同；<code>losses.py</code> 的 <code>forward_kl</code> 可切到论文方向。默认不用奖励加权或 token 子采样。完整检查脚本可复算这个非实测例子。</p></details>

<h2 id="实验：分数口径与三组机制证据">4. Experiments：先判一题，再比较结果</h2>

<p><strong>主结果支持完整组合有效，还不能判断计划、答案提示和额外调用各自贡献多少。</strong>三领域分别训练 Qwen3-8B，各用 10K 样本：CAIL-2018、USPTO-50K、DeepMath。作者称过滤过训练／测试污染，但没有发布规则和 ID，不能独立确认。</p>
<div class="table-scroll"><table><thead><tr><th>任务</th><th>一题怎样判</th><th>最后怎样汇总</th></tr></thead><tbody><tr><td>LawBench task 3-3</td><td>按上例提取罪名集合、计算 F1</td><td>逐案 F1 均值 ×100</td></tr><tr><td>USPTO test，10 类</td><td>提取类别编号，必须与标准类别相同；未提取到计 0</td><td>正确题数 / 题数 ×100</td></tr><tr><td>AIME24、AIME25、10% OlympiadBench、HMMT25</td><td>提取最后一个 boxed 答案，检查标准化或数学等价；无 boxed 计 0</td><td>每题 8 次至少成功一次为 pass@8；四数据集等权平均</td></tr></tbody></table></div>

<h3>4.1 真实数学题：40 和 39 只差一次计数</h3>

<p>Appendix B.2 的 <code>OlympiadBench idx 649</code> 求 <code>f(f(x))</code> 中 <code>x¹⁰</code> 的系数，<code>f(x)=x+x²+x⁴+x⁸+…</code>。外层展开为 <code>f(x)+f(x)²+f(x)⁴+f(x)⁸+…</code>。16 个及更多因子的最低指数已大于 10，只需算下面四项：</p>
<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/math-case-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/training-with-harnesses/math-case-compact.svg" width="900" height="300" alt="四项贡献0、2、10、28合计40，有序对漏算一次会得39"></a><figcaption>根据 Appendix B.2 独立复算；原 case 面板见 PDF pp. 16–17。图中的计数可用补充代码验证，不是新的模型运行记录。</figcaption></figure>
<p>关键在第二项：<code>x²·x⁸</code> 与 <code>x⁸·x²</code> 都出现在乘积展开中，贡献是 2；不能因乘法可交换就只算一次。四因子的两种组合有 4+6 个排列；八因子从八个位置选两个把 1 换成 2，有 28 种，总数为 <strong>0+2+10+28=40</strong>。</p>
<p>作者 plan 明确提醒了这个区别，甚至给出了各项计数，不能称为完全不含求解细节。step 80 的 harness 八次只有 4 次最终答对；训练后直接 OPHSD 为 7/8，OPSD 为 0/8，后者把有序对合并，答 39。judge 提取 <code>\boxed{…}</code> 包住的最终答案，40 得 1、39 得 0，不验推理。<strong>7/8 是单题八份回答中的准确率；这一组回答的 pass@8 是 1。</strong>这是作者选出的单题观察，不是本文重跑结果，也不足以独立证明机制。</p>

<details class="supplement"><summary>补充代码：独立复算四项系数（Python 3.10+）</summary><p>本文编写，不依赖第三方库，不是官方 judge；每次乘入一个 f(x)，只保留 0 到 10 次项。它验证算术，不验证模型轨迹。</p>

~~~python
def coefficient(factors, degree=10):
    dp = [0] * (degree + 1)
    dp[0] = 1
    for _ in range(factors):
        dp = [sum(dp[d - p] for p in (1, 2, 4, 8) if p <= d)
              for d in range(degree + 1)]
    return dp[degree]

parts = [coefficient(n) for n in (1, 2, 4, 8)]
assert parts == [0, 2, 10, 28]
print(parts, sum(parts))  # [0, 2, 10, 28] 40
~~~

<p><a href="/lib/papers/training-with-harnesses/worked-case-checks.py">下载完整检查脚本</a>还可复算案件集合 F1 和教学 KL 示例。</p></details>

<h3>4.2 最高分与固定终点，分开读</h3>

<p>v1 选训练期间最高评测分，数学平均四次运行。9 月补充结果改为固定文本 step 300、数学 step 150，± 是四次运行的标准差。GRPO 每题采样 8 份；OPHSD 直接回答一份并额外运行 harness，调用预算并不相同。</p>
<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/results-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/training-with-harnesses/results-compact.svg" width="900" height="370" alt="论文最高分与仓库固定终点分别比较GRPO、OPSD、OPHSD数学平均pass@8"></a><figcaption>根据 Table 5 与官方固定终点 CSV 重绘。相同指标在两套口径下都领先，但不能混用差值。</figcaption></figure>
<div class="table-scroll"><table><thead><tr><th>固定终点 · Qwen3-8B</th><th>LawBench F1</th><th>USPTO accuracy</th><th>数学平均 pass@8</th></tr></thead><tbody><tr><td>GRPO</td><td>61.13±0.11</td><td>89.44±0.11</td><td>65.00±0.18</td></tr><tr><td>OPSD</td><td>64.01±0.12</td><td>87.31±0.42</td><td>62.75±0.05</td></tr><tr><td>OPHSD</td><td>68.85±0.25</td><td>90.71±0.13</td><td>66.89±0.65</td></tr></tbody></table></div>
<p>v1 的直接 OPHSD 为 69.51／90.81／69.50；重新接 harness 后为 68.41／83.62／69.13，没有继续改善。但数学并非逐数据集最好：AIME24 的 79.17 低于 GRPO 的 83.33，AIME25 的 61.67 低于 OPSD 的 63.33。不能把平均领先写成所有任务都赢。</p>

<details class="supplement"><summary>完整数据重排：v1 Tables 2、3、5，以及后续 Qwen3-4B</summary>
<p>v1：8×H100、学习率 <code>1e-6</code>、一次更新 64 题（batch 64）、最大回答 8,192 token；文本训练 300 步，数学 150 步。</p>
<p>分类 Table 2（论文最高分）：</p>
<div class="table-scroll"><table><thead><tr><th>方法</th><th>LawBench</th><th>USPTO</th></tr></thead><tbody><tr><td>Base</td><td>55.29</td><td>30.07</td></tr><tr><td>Harness</td><td>60.22</td><td>79.02</td></tr><tr><td>GRPO</td><td>62.44</td><td>90.01</td></tr><tr><td>OPSD</td><td>64.25</td><td>88.01</td></tr><tr><td>OPHSD + Harness</td><td>68.41</td><td>83.62</td></tr><tr><td>OPHSD</td><td>69.51</td><td>90.81</td></tr></tbody></table></div>
<p>数学 Table 3（基础模型 pass@1）：</p>
<div class="table-scroll"><table><thead><tr><th>方法</th><th>AIME24</th><th>AIME25</th><th>OlympiadBench</th><th>HMMT25</th><th>Avg</th></tr></thead><tbody><tr><td>Base</td><td>23.33</td><td>16.67</td><td>55.88</td><td>6.67</td><td>25.64</td></tr><tr><td>Harness</td><td>40.00</td><td>40.00</td><td>64.71</td><td>29.17</td><td>43.47</td></tr></tbody></table></div>
<p>数学 Table 5（训练后 pass@8，选最高分）：</p>
<div class="table-scroll"><table><thead><tr><th>方法</th><th>AIME24</th><th>AIME25</th><th>OlympiadBench</th><th>HMMT25</th><th>Avg</th></tr></thead><tbody><tr><td>GRPO</td><td>83.33</td><td>60.00</td><td>77.94</td><td>45.00</td><td>66.57</td></tr><tr><td>OPSD</td><td>80.00</td><td>63.33</td><td>80.88</td><td>42.50</td><td>66.68</td></tr><tr><td>CRISP</td><td>56.67</td><td>60.00</td><td>75.00</td><td>43.33</td><td>58.75</td></tr><tr><td>OPHSD + Harness</td><td>80.00</td><td>63.33</td><td>79.85</td><td>53.33</td><td>69.13</td></tr><tr><td>OPHSD</td><td>79.17</td><td>61.67</td><td>83.82</td><td>53.33</td><td>69.50</td></tr></tbody></table></div>
<p>9 月固定终点的 Qwen3-4B 三项平均：GRPO 43.59±0.09／84.53±0.39／53.58±0.90；OPSD 45.82±0.09／85.41±0.32／53.54±0.90；OPHSD 47.56±0.19／87.81±0.10／58.37±0.93。8B 固定终点发布材料没有全部数学分项，不能用 v1 分项填补。原表与训练曲线见 <a href="https://arxiv.org/pdf/2605.08741v1#page=6">PDF pp. 6–7，Figures 2、3</a>；没有发布精确逐步数据，不重画近似曲线。</p>
</details>

<h3>4.3 分组证据、成本与反例</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/training-with-harnesses/groups-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/training-with-harnesses/groups-compact.svg" width="900" height="310" alt="四组数学题训练后通过率98.10、84.62、100、12.54，原来都能解的一组仍有退化"></a><figcaption>根据 Figure 4 重绘全部四组。整数数量按四舍五入比例回算，不是逐题文件验证。</figcaption></figure>
<p>“只有 harness 能解”的 156 题，训练后直接模型通过 84.62%，回算约 132 题。这比总平均更接近“吸收流程收益”的主张。但原本二者都能解的 316 题仅保留 98.10%，约 310 题，<strong>并非完全保留旧能力</strong>。分组也没有排除参考答案、额外调用等监督差异。</p>
<p>数学 150 步的生成 token 总量，OPHSD 为 108.73M，GRPO 为 340.22M，约为其 32%；墙钟 9.5 对 11.4 小时，约为 83%，不是只花 32% 时间。OPSD 更便宜：29.48M token、3.5 小时，但对应平均分较低。这些是作者 8×H100 的运行测量，未独立复现。</p>

<details class="supplement"><summary>补充分析：引用句式、回答长度与难题分组</summary>
<p>Table 4 的 cite-rate 让 GPT-4o 判断回答是否引用具体旧案例，每组称抽 40 条；另一个“是否比较不同标签”字段不用于此比例。末期 OPHSD 的 LawBench／USPTO 为 97.5／90.0，不验证引用案例是否真实。第一格 6.3 也不是单批 40 个二值样本的 2.5 步长，是否跨运行平均未说明。</p>
<div class="table-scroll"><table><thead><tr><th>Table 4 · cite-rate</th><th>early</th><th>mid</th><th>late</th></tr></thead><tbody><tr><td>LawBench GRPO</td><td>6.3</td><td>2.5</td><td>5.0</td></tr><tr><td>LawBench OPSD</td><td>5.0</td><td>5.0</td><td>2.5</td></tr><tr><td>LawBench OPHSD</td><td>7.5</td><td>100.0</td><td>97.5</td></tr><tr><td>USPTO GRPO</td><td>5.0</td><td>5.0</td><td>2.5</td></tr><tr><td>USPTO OPSD</td><td>5.0</td><td>2.5</td><td>7.5</td></tr><tr><td>USPTO OPHSD</td><td>7.5</td><td>75.0</td><td>90.0</td></tr></tbody></table></div>
<p><a href="https://arxiv.org/pdf/2605.08741v1#page=8">Figure 5</a>显示 OPSD 在约 40 步后回答变短，作者把它与性能下降关联；未发布准确时序值，曲线不证明因果。<a href="https://arxiv.org/pdf/2605.08741v1#page=9">Figure 6</a>按基础模型逐题分数分 Hard [0,0.34)、Medium [0.34,0.67)、Easy [0.67,1]。OPHSD 在 Hard 数学 412 题／法律 145 题／化学 700 题分别提高 22.9／33.8／90.4 个百分点；Easy 法律和化学约下降 5／9 点。化学单题是二值结果，没有 Medium 组。</p>
</details>

<h2 id="对游戏代码训练的启发与适用边界">5. Discussion：哪些流程值得蒸馏</h2>

<p><strong>先验证哪份中间材料真正有用，再决定蒸馏它。</strong>论文缺少只去掉 plan、标准答案、检索样例或额外调用的消融。下一步应固定采样量和 teacher，比较原始标准解、其计划摘要、当前模型独立计划、同长度无关材料，并把相同预算的 SFT 和 GRPO 加进来。</p>
<p>Appendix C 的边界可简要理解为：重新组织原题的步骤比较适合学习；依赖动态检索时，可以学比较方式，但不能保证记住或更新外部事实；实时执行结果更不能提前存入参数。cite-rate 只是句式证据，尚不能证明模型没记训练内容、只学了比较结构。</p>
<details class="supplement"><summary>研究延伸：游戏代码作为训练时额外材料</summary><p>可以先比较完整参考代码、从代码提取的实现说明、运行自己代码后的具体错误反馈，让 teacher 用它们重评 student 的回答。数据只需要代码也能研究前两种，不必先假设有强模型推理轨迹。但 OPHSD 没做游戏实验，不能拿它的两套短流程结果保证有效；需要独立测功能、视觉质量及修改次数，并检查错配到其他游戏的材料是否同样“有效”。</p></details>

<h2 id="结论：结果、协议差异与复现限制">6. Conclusion：结果有效，归因和复现仍需补齐</h2>

<p><strong>可复用的是训练结构：直接回答、多看材料的固定 teacher、同一回答上的概率反馈。</strong>两套短流程及三领域结果支持完整组合有效；不能据此说 Claude Code／Codex 式工具执行已经被训练进模型，更不能把检索或实时工具一概移除。</p>
<p>代码可核对消息、固定 teacher、词表 KL 和 judge，但没有原评测切分、训练后权重（checkpoint）、完整日志和逐题输出，verl 依赖未固定 commit。</p>
<details class="supplement"><summary>复现前必须核对的入口与默认值</summary><p>固定 commit：<code>20eaa0c8b0674fbf81aa780a8cf4e0d7c550d4ea</code>。<code>ophsd_train/src/ophsd/batch_builder.py</code> 取 <code>trace.verify.messages</code>／<code>trace.solve.messages</code>；旧 docstring 说拼接生成答案，与实际分支不符。<code>ophsd_worker.py</code> 只更新 actor，<code>losses.py</code> 默认 full-vocabulary <code>KL(pS ∥ pT)</code>。</p><p>数学默认 student 验证 8 次、harness 1 次；比较 pass@8 时应显式统一。所有 API 调用都失败的题，部分验证路径不进入分母；部分失败则补空回答计 0。重新评分必须补齐题和尝试次数。超长 prompt 左截断保留回答，也可能丢检索材料。</p><p>LawBench 论文写 215 类，发布提取器 202 类，上游原 judge 189 类且扫描整个回答；不能称三者完全同一 evaluator。发布 reward 的 <code>acc=float(F1&gt;0)</code> 只表示有标签重叠，不是完整集合正确。GPT-4o 只用于引用句式分析，不是 LawBench 主分数的 judge。</p><p>启动脚本的步数、输出长度与 planner 温度不都等于论文。DeepMath 本地是 LFS 指针；分类文件各 10K 行且没有静态 <code>teacher_prompt</code>。本文做只读 CPU 检查，没有 GPU 训练复现。</p></details>
<p class="source-note">证据：v1 全部 18 页、固定官方代码、后续结果 CSV、LawBench 固定上游。两份分类 JSON 已读取；DeepMath 本地是 LFS 指针，未读取完整数据。原图许可未明确，各项取舍记在来源清单。仓库自称 NeurIPS 2026 accepted，未独立会议核验；兴趣程度仅表示博客作者个人兴趣。</p>

</div>

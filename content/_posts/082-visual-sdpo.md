---
title: "[2026-06-09] Self-Distillation Policy Optimization via Visual Feedback: Bridging Code and Visual Artifacts"
permalink: "/posts/论文解读/visual-sdpo.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:30:00+08:00"
cover: "/lib/papers/visual-sdpo/cover.svg"
description: "Visual-SDPO 用模型自己代码的渲染画面提供训练反馈，再把重叠、裁切等问题定位到代码语句。本文解释共享参数的两个分支、局部加权公式、三套评分规则，以及实验尚未隔离的变量。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 11
categories:
  - "论文解读"
tags:
  - "Visual Feedback"
  - "Code Generation"
  - "Self-Distillation"
  - "Credit Assignment"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Haoyu Dong · arXiv:2606.10334v1 · 最早公开于 2026-06-09</p>
<div class="source-links"><a href="https://arxiv.org/abs/2606.10334">论文主页</a><a href="https://arxiv.org/pdf/2606.10334v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="Visual-SDPO 交互图解">
  <div class="deck-head"><strong>11 页交互图解 · 从执行画面到语句权重</strong><a href="/lib/decks/visual-sdpo-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/visual-sdpo-visual-guide.html" title="Visual-SDPO 论文图解，共 11 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">代码能运行，画面仍可能有图例压住曲线、文字被裁掉、元素错位等问题。Visual-SDPO 在训练时执行模型自己写出的代码，把画面或报错交给同一模型的另一条计算分支，让它重新评估这段代码。方法还记录“哪条语句画出了哪个元素”，对与缺陷区域重叠的语句增加训练权重。部署时仍由模型从原始要求直接写代码。</p>

<aside class="part0"><span class="kicker">PART 0 · 理解训练需要的两个区别</span><h3>生成代码，与计算这段代码的概率，不是同一次操作</h3><p>作答分支（student）先按原始要求采样一串代码。代码由渲染器（renderer）执行，得到图表、网页或幻灯片。评分分支（teacher）随后多看画面和诊断信息，在作答分支已经写出的同一串文字上计算下一 token 的概率；token 是模型预测的文字单位。额外画面只在训练时给评分分支，论文称它为 privileged context。</p><p><strong>这里没有固定在初始时刻的冻结教师。</strong>§2.2 明确写两个分支共享当前参数 θ；teacher 的概率表在本次损失中与梯度断开（detach），参数仍会随 student 更新而在下一轮改变。这与 <a href="/posts/论文解读/training-with-harnesses.html">OPHSD 的固定初始教师</a>不同。</p></aside>

<div class="metrics" aria-label="Visual-SDPO 关键数字"><div class="metric"><strong>78.6</strong><span>ChartMimic：格式分与视觉评审分的均值</span></div><div class="metric"><strong>82.6</strong><span>Design2Code：五项视觉指标的均值</span></div><div class="metric"><strong>60.7</strong><span>AeSlides：四项布局指标的均值</span></div><div class="metric"><strong>10/10</strong><span>博客作者个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>阅读重点</h3><ul><li>反馈来自当前模型自己的程序，训练目标仍是这段代码，不是教师重新生成的参考代码。</li><li>缺陷对应语句的权重增大，其他语句仍有权重 1，并没有全部停止训练。</li><li>三套主结果都超过各自 GRPO 对照，但没有单独去掉语句加权的实验，不能把全部收益归给局部定位。</li></ul></aside>


<h2 id="研究问题：代码与执行画面的反馈差距">1. Motivation：代码与执行画面的反馈差距</h2>

<p><strong>训练预测的是代码，读者看到的是执行后的画面，两者中间隔着一个不能直接反向传播的渲染过程。</strong>参考代码给出了某一种实现，却不能直接告诉模型自己的图例在哪里压住曲线。推理时反复“渲染、批评、重写”能修图，但每轮都要运行程序并调用视觉模型；只用一份整图分数训练，又会把“哪一个元素出了问题”压缩掉。</p><p>论文 Figure 1 用一个图例遮挡折线的示意说明这个差距。它希望把这类具体诊断用于训练，让模型之后少产生同类错误。论文的目标是图表、网页和幻灯片的静态视觉质量，尚不是完整交互应用的功能验收。</p>

<h2 id="与参考代码蒸馏、视觉奖励和修改循环的区别">2. Related Work：与参考代码蒸馏、视觉奖励和修改循环的区别</h2>

<p><strong>新增操作是把画面诊断送进教师输入，并把诊断位置映射成代码的训练权重。</strong>这两个操作与最终奖励同时使用，需要分别理解。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>反馈交给谁</th><th>怎样更新</th><th>部署额外工作</th></tr></thead><tbody><tr><td>参考代码 OPSD 对照</td><td>教师多看标准源码</td><td>比较当前回答的 token 概率</td><td>无教师评分</td></tr><tr><td>视觉奖励 GRPO</td><td>训练程序拿到整份画面的分数</td><td>比较一组代码的最终奖励</td><td>不要求额外修改循环</td></tr><tr><td>PPTAgent 等视觉修改流程</td><td>批评模型看渲染结果，再要求重写</td><td>主要发生在推理阶段</td><td>多次执行与模型调用</td></tr><tr><td>Visual-SDPO</td><td>教师多看当前代码的画面、诊断或报错</td><td>局部加权的概率蒸馏，加整份代码奖励</td><td>模型直接写代码</td></tr></tbody></table></div>

<p>§4.2 还讨论了 Whyline、浏览器 DevTools、RenderDoc 等输出到源码的定位工具。定位本身已有长期积累；本文把定位结果用于语言模型训练，这才是与调试工具的区别。对于 ChartMaster、AeSlides 等视觉奖励训练，区别则是保留具体区域的诊断，而不只使用整图的单个分数。</p>

<h2 id="方法：从画面缺陷定位到代码语句">3. Method：从画面缺陷定位到代码语句</h2>

<figure class="figure"><a href="/lib/papers/visual-sdpo/training-and-localization.svg" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/training-and-localization.svg" width="1000" height="580" alt="学生生成代码，渲染器执行，教师看画面重评相同代码；另一路把缺陷区域关联到源码语句并设置权重"></a><figcaption>按 §2.1–2.5 重绘。两个分支共享当前参数；额外截图不在 student 的原始输入里。画面定位与教师概率评分是两项不同计算。</figcaption></figure>

<p><strong>系统先检测画面中的缺陷区域，再查找画出该区域的代码语句。</strong>按 §2.1–2.4，一次更新经过以下步骤：</p>

<ol><li>当前模型只看任务要求和可选参考图片，采样代码 y；参考图片本来就属于输入，别与代码执行后新增的截图混淆。</li><li>渲染器执行 y。成功时输出画面，检测程序给出每个缺陷的矩形区域和 0/1 严重性；另一条程序把各评分项是否满足整理成结构化表。</li><li>teacher 多看截图或该表，对同一代码 y 的每个前缀计算下一词分布。它不重写 y；本次分布与梯度断开。</li><li>定位程序找出每条语句画出的元素矩形，把与缺陷重叠程度换成语句权重，再分配给这条语句内的 token。</li><li>训练同时使用加权概率差异和整份代码的最终奖励，只通过 student 分支更新共享参数。</li></ol>

<h3>实际怎样建立“画面元素—源码行”对应关系</h3>

<div class="table-scroll"><table><thead><tr><th>渲染工具</th><th>记录什么</th><th>怎样关联源码</th></tr></thead><tbody><tr><td>Matplotlib</td><td>图例、文本等绘图对象（artist）的画面矩形</td><td>创建 artist 时记录调用栈中的用户源码行；绘制后取 <code>get_window_extent()</code></td></tr><tr><td>HTML / 浏览器</td><td>DOM 元素及 <code>getBoundingClientRect()</code></td><td>读取元素携带的 <code>data-src-*</code> 源码属性</td></tr><tr><td><code>python-pptx</code></td><td>幻灯片 shape</td><td>在 shape 创建时记录源语句</td></tr><tr><td>未接入上述记录的工具</td><td>代码、截图和标出的缺陷区域</td><td>视觉语言模型判断对应语句，需要额外教师调用</td></tr></tbody></table></div>

<p>这些是论文披露的做法；缺陷检测器型号、阈值、完整记录代码均未公开。“运行时追踪”也没有保证每个画面问题只能归到一行：一个缺陷可以涉及多个语句，一条语句也可能生成多个元素。</p>

<h3>图例遮挡案例与权重计算</h3>

<p>Figure 1 的真实论文示意是图例遮住折线，不是公开 benchmark 的单题日志。沿着它读：模型写出创建图例的语句，Matplotlib 记录该语句对应的矩形；检测器圈出遮挡区域；教师看到这份画面，图例语句内的 token 获得较高权重。论文没有公开该示例的代码、矩形坐标或更新后结果，不能补成一条实测修复轨迹。</p>

<figure class="figure"><a href="/lib/papers/visual-sdpo/legend-weight-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/legend-weight-case.svg" width="1000" height="500" alt="论文图例遮挡示意与教学权重计算：alpha3、IoU0.5、严重性1时图例语句权重2，其他语句1"></a><figcaption>遮挡类型来自 Figure 1。画面位置与 α=3、IoU=0.5 由本文补充演算；不是作者超参数或真实模型执行记录。</figcaption></figure>

<div class="formula"><code>resp(s) = max<sub>缺陷 i、语句产生的区域 b</sub> IoU(b, region<sub>i</sub>) × severity<sub>i</sub><br>w<sub>t</sub> = 1 + (α − 1) × resp(s(t))<br>L<sub>visual</sub> = Σ<sub>t</sub> w<sub>t</sub> KL(p<sub>S</sub> ∥ detach(p<sub>T</sub>)) / Σ<sub>t</sub> w<sub>t</sub></code></div>

<p>IoU 是两个矩形交集面积除以并集面积，取值 0–1；s(t) 是包含 token t 的最小语句；α≥1 是放大倍数上限。若设 α=3、某语句的区域与缺陷 IoU=0.5、严重性=1，则 resp=0.5，权重=2。没有对应画面元素的 import、声明等语句仍取权重 1。这里的 α 和矩形数值只是按公式演算，不是作者超参数。损失除以权重总和，避免缺陷多的样本单凭总权重变大就支配训练。</p>

<p>整份代码奖励是 <code>r = r_exec × r_vis</code>：r_exec 为运行成功的 0/1，r_vis 为各视觉条件的加权满足率，权重非负且和为 1。代码运行失败时奖励为 0，视觉评分程序不再执行；报错文本仍送给 teacher，因此蒸馏分支还有反馈。最终损失为 <code>L_visual + β L_GRPO</code>。β、α 和稳定化重要性权重的具体实验配置没有披露。</p>

<h2 id="实验：三套视觉指标与组合收益">4. Experiments：三套视觉指标与组合收益</h2>

<p><strong>这些主分数是视觉指标，不是“整款程序所有功能都通过”的成功率。</strong>三领域分别训练，不混合语料；各表的基础模型都为 Qwen3-VL-8B-Instruct，同表方法用相同领域语料。图表用 Chart2Code-160K 中可执行的子集，网页用 WebCode2M 与 WebSight，幻灯片用 AeSlides-7k 的页级要求。幻灯片没有标准源码，因此不做参考代码 OPSD 对照。</p>

<div class="table-scroll"><table><thead><tr><th>评测</th><th>评分对象与主分数</th><th>按论文数据复算</th></tr></thead><tbody><tr><td>ChartMimic Direct Mimic</td><td>Low：文字、布局、图表类型、颜色四项 F1 的均值；High：GPT-4o 视觉评审；Overall=(Low+High)/2。运行率另报。</td><td>(74.8+82.3)/2=78.55，显示为 78.6；运行率为 92.7%</td></tr><tr><td>Design2Code</td><td>CLIP 图像特征相似度、区块匹配、文字、位置、颜色五项的算术均值</td><td>(89.2+69.7+84.9+82.4+86.8)/5=82.6</td></tr><tr><td>AeSlides</td><td>画幅比例、留白、碰撞、失衡四项，统一到越高越好后平均；测试按整份 deck 留出</td><td>表中报 60.7，但没有四项明细可复算</td></tr></tbody></table></div>

<div class="table-scroll"><table><thead><tr><th>评测主分数</th><th>基础模型</th><th>参考代码 OPSD</th><th>GRPO</th><th>Visual-SDPO</th></tr></thead><tbody><tr><td>ChartMimic</td><td>67.9</td><td>77.0</td><td>76.2</td><td><b>78.6</b></td></tr><tr><td>Design2Code</td><td>72.1</td><td>78.6</td><td>80.0</td><td><b>82.6</b></td></tr><tr><td>AeSlides</td><td>49.5</td><td>不适用</td><td>58.2</td><td><b>60.7</b></td></tr></tbody></table></div><p>Visual-SDPO 在 ChartMimic 比参考代码 OPSD 高 1.6，在 Design2Code 高 4.0；相对 GRPO 分别高 2.4、2.6、2.5。网页的位置分从 GRPO 的 78.7 到 82.4，区块分从 64.5 到 69.7，与定位布局问题的设计相符。但 <strong>没有 α=1 的均匀视觉蒸馏对照</strong>，主表把视觉输入、语句加权和联合奖励一并改变，尚不能单独证明哪一项贡献了多少。</p>

<p>训练效率处的约 29% 指“达到 GRPO 完整训练成绩所需的生成及渲染预算”，不是全部训练成本节省 71%。论文没有给出逐域预算表、教师额外前向次数、精确墙钟时间或多随机种子方差。学习率、每批样本数（batch size）、更新次数、采样温度、检测阈值也未披露，结果不能按原运行配置独立复现。</p>

<figure class="figure"><a href="/lib/papers/visual-sdpo/results-and-controls.svg" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/results-and-controls.svg" width="1000" height="490" alt="三项主分数与基础模型、参考代码OPSD、GRPO并列；缺少alpha1的均匀视觉蒸馏对照"></a><figcaption>根据 Tables 1–3 重绘。三项是不同的视觉分数；图中同时保留 GRPO 对照与缺失消融，避免把完整组合的提升全部归给语句定位。</figcaption></figure>

<h2 id="下一步：隔离视觉信息和局部加权">5. Discussion：隔离视觉信息和局部加权</h2>

<p><strong>最先补的是“相同视觉反馈、只改变 token 权重”的对照。</strong>保持模型、生成次数、渲染次数和评分器一致，比较 GRPO、均匀视觉蒸馏、真实区域加权、同样数量的随机语句加权，以及联合训练。这样才能区分额外信息和定位本身。</p><p>扩展到游戏时，还要区分静态画面问题与运行逻辑问题。文字裁切可以沿 UI 元素定位源码；“钥匙拾取后门仍不开”则需要信号连接、执行日志和测试状态，而不只是一张截图。记录能明确指向代码的证据，再测试局部加权是否改善功能通过率。这个扩展是本文的实验建议，不是原论文已验证的方法。</p>

<h2 id="结论与复现限制">6. Conclusion：结论与复现限制</h2>

<p><strong>它给出了清晰的算法方向：用当前代码的画面诊断提供教师信息，再沿画面到源码的对应关系分配训练权重。</strong>三领域结果支持完整组合有效，但局部加权的独立贡献、检测质量和完整成本仍未被充分测量。</p><p>论文共 11 页，没有附录或代码链接，也没有可公开核查的单题输入、生成代码和修复日志。Figure 1 只能用于讲机制，不能冒充真实 benchmark case。博客作者兴趣程度 10/10，是因为它贴近“利用游戏代码和执行信息训练模型”的研究问题；这个分数不表示复现完整或证据已充分。</p>

<p class="source-note">证据范围：本文检查 11 页 PDF 的全文文字与逐页渲染；论文没有 appendix，也没有提供 official repository。代码可用性按 2026-10-08 的 arXiv 页面与公开仓库检索结果记录。兴趣程度 10/10 只表示博客作者对该方向的个人兴趣，不是通用论文评分。</p>

</div>

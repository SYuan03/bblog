---
title: "[2026-06-09] Self-Distillation Policy Optimization via Visual Feedback: Bridging Code and Visual Artifacts"
permalink: "/posts/论文解读/visual-sdpo.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-18T15:00:00+08:00"
cover: "/lib/papers/visual-sdpo/cover.svg"
description: "模型写出代码后，训练程序执行它，让模型多看画面再判断哪些代码应该改。Visual-SDPO 还把遮挡、裁切等问题关联到源码，增加相关语句的训练权重。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
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
  <div class="deck-head"><strong>12 页交互图解 · 从执行画面到语句权重</strong><a href="/lib/decks/visual-sdpo-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/visual-sdpo-visual-guide.html" title="Visual-SDPO 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机端可滚动页内内容与原表；Esc 退出全屏</span></p></div>
</section>

<p class="lead">模型写出的图表代码可以正常运行，图例却压住了曲线。Visual-SDPO 想用这类错误训练代码生成模型：先执行它自己写出的代码，再把画面交给同一模型评分，并对造成遮挡的代码语句增加训练权重。以后生成代码时，模型不需要额外调用这套诊断流程。</p>

<aside class="part0"><span class="kicker">PART 0 · 两次模型计算</span><p>作答分支（student）先按原始要求采样一串代码。代码由渲染器（renderer）执行，得到图表、网页或幻灯片。评分分支（teacher）多看这份画面，在 student 已经写出的代码上计算下一 token 的概率；token 是模型预测的文字单位。只有 teacher 能看到的额外画面，论文称为 privileged context。</p><p><strong>两个分支共享当前参数 θ。</strong>teacher 的概率表在本次损失中与梯度断开（detach），但下一轮会使用更新后的参数。这与 <a href="/posts/论文解读/training-with-harnesses.html">OPHSD 的固定初始教师</a>不同。联合训练中的 GRPO 则对同一要求生成一组代码，比较各份的奖励来更新模型。</p></aside>

<aside class="keypoints"><ul><li>训练用的是模型<strong>自己生成的代码</strong>。teacher 给概率反馈，不重新写一份标准答案。</li><li>图表、网页、幻灯片的主分数比 GRPO 分别高 <strong>2.4、2.6、2.5</strong>；它们是视觉质量分，不是完整应用成功率。</li><li>实验没有单独去掉语句加权，不能把全部提升归给源码定位。作者个人兴趣程度：10/10。</li></ul></aside>


<h2 id="研究问题：代码与执行画面的反馈差距">1. Motivation：代码与执行画面的反馈差距</h2>

<p><strong>模型必须先写代码，执行以后才知道画面哪里出了问题。</strong>标准源码只能提供一种实现；整图奖励只告诉模型这次做得好不好。两者都没有明确指出：这次遮挡与创建图例的那条语句有关。另一种办法是在使用时反复“执行、看图、重写”，但每轮都要运行程序并调用视觉模型。</p><p>论文希望把这份诊断用于训练，让模型以后少写出同类错误。评测范围是图表、网页和幻灯片的静态视觉质量，不包括完整交互应用的功能验收。</p>

<h2 id="与参考代码蒸馏、视觉奖励和修改循环的区别">2. Related Work：与参考代码蒸馏、视觉奖励和修改循环的区别</h2>

<p><strong>Visual-SDPO 同时改变 teacher 看到的信息，以及每段代码在损失中的权重。</strong>论文的 OPSD 对照也在 student 自己生成的代码上蒸馏，但 teacher 额外看到的是标准源码。和相邻方法相比，差别发生在以下环节：</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>反馈交给谁</th><th>怎样更新</th><th>部署额外工作</th></tr></thead><tbody><tr><td>参考代码 OPSD 对照</td><td>教师多看标准源码</td><td>比较当前回答的 token 概率</td><td>无教师评分</td></tr><tr><td>视觉奖励 GRPO</td><td>训练程序拿到整份画面的分数</td><td>比较一组代码的最终奖励</td><td>不要求额外修改循环</td></tr><tr><td>PPTAgent 等视觉修改流程</td><td>批评模型看渲染结果，再要求重写</td><td>主要发生在推理阶段</td><td>多次执行与模型调用</td></tr><tr><td>Visual-SDPO</td><td>教师多看当前代码的画面、诊断或报错</td><td>局部加权的概率蒸馏，加整份代码奖励</td><td>模型直接写代码</td></tr></tbody></table></div>

<details class="supplement"><summary>补充：视觉训练与源码定位的两条相关工作</summary><p>ChartMaster、AeSlides 等工作用画面质量给代码生成模型奖励；Visual-SDPO 还把具体问题送给 teacher。Whyline、浏览器 DevTools、RenderDoc 等工具能帮开发者查找输出对应的源码；本文则在训练时使用这种对应关系，决定哪些代码需要更大的训练权重。§4.2 把这两条工作放到一起讨论。</p></details>

<h2 id="方法：从画面缺陷定位到代码语句">3. Method：从画面缺陷定位到代码语句</h2>

<figure class="figure original"><a href="/lib/papers/visual-sdpo/figure-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/figure-1.webp" width="1604" height="884" alt="原论文 Figure 1：上方为生成、渲染和教师评分，下方为区域关联源码、加权蒸馏与 GRPO"></a><figcaption>Haoyu Dong，原论文 Figure 1，CC BY 4.0；仅裁去图外正文。先看上排的生成、渲染、评分，再看下排代码权重和两项训练损失。图例遮挡是作者的机制示意，不是公开单题日志。</figcaption></figure>

<p><strong>先让 teacher 看懂这次错误，再增加相关代码的训练权重。</strong>一次更新有五步：</p>

<ol><li>student 看任务要求和可选参考图片，生成代码 y。原始参考图与执行 y 后新增的截图要分开。</li><li>渲染器执行 y。检测程序圈出遮挡、裁切等问题，给每个矩形区域一个 0/1 标签；评分程序还把各视觉条件是否满足整理成表。</li><li>teacher 多看画面或这份表，计算 y 各位置的下一 token 概率。例如，在“图例放在哪里”的代码位置，多看画面后它可能给不同写法更高概率。论文没有公开这个示例的实际概率。</li><li>定位程序查出每条语句创建的元素矩形，按它与缺陷的重叠程度设置权重；同一语句里的 token 共用该权重。</li><li>训练程序比较 student 和 teacher 的概率，并结合整份代码的最终奖励，只沿 student 分支更新共享参数。</li></ol>

<h3>3.1 哪条代码画出了这个元素</h3>

<div class="table-scroll"><table><thead><tr><th>渲染工具</th><th>记录什么</th><th>怎样关联源码</th></tr></thead><tbody><tr><td>Matplotlib</td><td>图例、文本等绘图对象（artist）的画面矩形</td><td>创建 artist 时记录调用栈中的用户源码行；绘制后取 <code>get_window_extent()</code></td></tr><tr><td>HTML / 浏览器</td><td>DOM 元素及 <code>getBoundingClientRect()</code></td><td>读取元素携带的 <code>data-src-*</code> 源码属性</td></tr><tr><td><code>python-pptx</code></td><td>幻灯片 shape</td><td>在 shape 创建时记录源语句</td></tr><tr><td>未接入上述记录的工具</td><td>代码、截图和标出的缺陷区域</td><td>视觉语言模型判断对应语句，需要额外教师调用</td></tr></tbody></table></div>

<p>这些是论文披露的做法；缺陷检测器型号、阈值、完整记录代码均未公开。“运行时追踪”也没有保证每个画面问题只能归到一行：一个缺陷可以涉及多个语句，一条语句也可能生成多个元素。</p>

<h3>3.2 图例遮挡：权重具体怎么变</h3>

<p>回到 Figure 1 的图例遮挡。Matplotlib 创建图例时记录源码行，画完后取得图例矩形。检测器圈出遮挡区域，定位程序计算两个矩形的重叠程度，增加创建图例那条语句的权重。teacher 看画面后给出的概率，才决定代码应该往什么方向学；<strong>区域定位只决定哪里学得更重，不直接给出正确代码。</strong></p>

<div class="formula"><code>resp(s) = max<sub>缺陷 i、语句产生的区域 b</sub> IoU(b, region<sub>i</sub>) × severity<sub>i</sub><br>w<sub>t</sub> = 1 + (α − 1) × resp(s(t))<br>L<sub>visual</sub> = Σ<sub>t</sub> w<sub>t</sub> KL(p<sub>S</sub> ∥ detach(p<sub>T</sub>)) / Σ<sub>t</sub> w<sub>t</sub></code></div>

<p>IoU 是两个矩形交集面积除以并集面积，取值从 0 到 1；s(t) 是包含 token t 的最小语句；α≥1 是权重上限。若设 α=3、某语句的区域与缺陷 IoU=0.5、严重性=1，则 resp=0.5，权重=2。import、声明等没有对应元素的语句仍取 1。α=3、IoU=0.5 只是本文演算，不是作者超参数；论文也没有公开图例示例的代码、坐标或更新后画面。</p><p>KL 衡量两个下一 token 概率分布的差异，论文使用的方向是 <code>KL(pS ∥ pT)</code>。加权后再除以权重总和，让损失尺度与均匀训练接近。空白和分隔符沿用前一条语句的权重，无法归入语句的 token 取 1。</p>
<p class="note">原图有一处不一致：Figure 1 把部分语句权重标为 0.2、0.8、1.0，而正文 Eq. (5) 规定权重在 [1, α] 内。论文没有解释图中数值是否已另行归一化；上面的演算严格按正文公式，不把原图数字当作实验配置。</p>

<p>整份代码奖励是 <code>r = r_exec × r_vis</code>：r_exec 为运行成功的 0/1，r_vis 为各视觉条件的加权满足率，权重非负且和为 1。代码运行失败时奖励为 0，视觉评分程序不再执行；报错文本仍送给 teacher，因此蒸馏分支还有反馈。最终损失为 <code>L_visual + β L_GRPO</code>。β、α 和稳定化重要性权重的具体实验配置没有披露。</p>
<p>有标准源码的领域还可以先做 SFT，即用标准代码训练下一 token 预测，再进入上述联合训练。论文把这一步列为可选 warm-start，没有报告各实验采用它的完整配置。</p>

<h2 id="实验：三套视觉指标与组合收益">4. Experiments：三套视觉指标与组合收益</h2>

<p><strong>完整方法超过三个 GRPO 对照，但只能据此判断视觉质量提升。</strong>三领域分别训练；同一张表都从 Qwen3-VL-8B-Instruct 出发，用相同领域语料。图表用 Chart2Code-160K 的可执行子集，网页用 WebCode2M 与 WebSight，幻灯片用 AeSlides-7k 的页级要求。幻灯片没有标准源码，因此没有参考代码 OPSD 对照。</p>

<div class="table-scroll"><table><thead><tr><th>评测</th><th>评分对象与主分数</th><th>按论文数据复算</th></tr></thead><tbody><tr><td>ChartMimic Direct Mimic</td><td>Low：文字、布局、图表类型、颜色四项 F1 的均值；High：GPT-4o 视觉评审；Overall=(Low+High)/2。运行率另报。</td><td>(74.8+82.3)/2=78.55，显示为 78.6；运行率为 92.7%</td></tr><tr><td>Design2Code</td><td>CLIP 图像特征相似度、区块匹配、文字、位置、颜色五项的算术均值</td><td>(89.2+69.7+84.9+82.4+86.8)/5=82.6</td></tr><tr><td>AeSlides</td><td>画幅比例、留白、碰撞、失衡四项，统一到越高越好后平均；测试按整份 deck 留出</td><td>表中报 60.7，但没有四项明细可复算</td></tr></tbody></table></div>

<figure class="figure original"><a href="/lib/papers/visual-sdpo/table-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/table-1.webp" width="1596" height="500" alt="原论文 Table 1：ChartMimic 完整模型对照，保留运行率、Low、High 和 Overall"></a><figcaption>Haoyu Dong，原论文 Table 1，CC BY 4.0；裁去表外正文。完整方法的 Overall 最高，但运行率 92.7% 略低于 GRPO 的 92.9%。</figcaption></figure>
<p>Visual-SDPO 在 ChartMimic 比参考代码 OPSD 高 1.6，在 Design2Code 高 4.0；相对 GRPO 分别高 2.4、2.6、2.5。网页的位置分从 GRPO 的 78.7 到 82.4，区块分从 64.5 到 69.7。但 <strong>没有 α=1 的均匀视觉蒸馏对照</strong>：主表同时改变视觉输入、语句权重和联合奖励，无法计算局部定位单独贡献了多少。</p>
<figure class="figure original"><a href="/lib/papers/visual-sdpo/table-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/table-2.webp" width="1596" height="368" alt="原论文 Table 2：Design2Code 五项视觉评分，包含全部对照与数值"></a><figcaption>Haoyu Dong，原论文 Table 2，CC BY 4.0；裁去表外正文。完整方法五项均超过 GRPO，区块匹配和位置的差距较大。</figcaption></figure>
<details class="supplement"><summary>完整原表：幻灯片结果（Table 3）</summary><figure class="figure original"><a href="/lib/papers/visual-sdpo/table-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/visual-sdpo/table-3.webp" width="1596" height="496" alt="原论文 Table 3：AeSlides 主分数，基础49.5、SFT52.8、GRPO58.2、完整方法60.7"></a><figcaption>Haoyu Dong，原论文 Table 3，CC BY 4.0；裁去表外正文。没有标准源码，所以没有参考代码 OPSD 行；论文未给四项指标明细。</figcaption></figure></details>

<p>训练效率处的约 29% 指“达到 GRPO 完整训练成绩所需的生成及渲染预算”，不是全部训练成本节省 71%。论文没有给出逐域预算表、教师额外前向次数、精确墙钟时间或多随机种子方差。学习率、每批样本数（batch size）、更新次数、采样温度、检测阈值也未披露，结果不能按原运行配置独立复现。</p>

<h2 id="下一步：隔离视觉信息和局部加权">5. Discussion：隔离视觉信息和局部加权</h2>

<p><strong>最有必要的下一步，是在相同视觉反馈下只改变代码权重。</strong>固定模型、生成次数、渲染次数和评分器，比较均匀权重、真实区域加权、相同数量的随机语句加权，并分别检查有无 GRPO。这个实验才能判断：模型是因为 teacher 多看了一张图而进步，还是定位确实让它学得更好。</p><details class="supplement"><summary>研究延伸：游戏代码能否使用类似反馈</summary><p>文字裁切可以沿 UI 元素找源码；“钥匙拾取后门仍不开”还需要信号连接、执行日志和测试状态，一张截图不够。应先收集能够明确关联到代码的运行证据，再检验局部加权能否提高功能通过率。这是本文建议，不是原论文结果。</p></details>

<h2 id="结论与复现限制">6. Conclusion：结论与复现限制</h2>

<p><strong>值得保留的是“看自己的执行结果，再针对相关代码训练”这一步。</strong>三领域结果支持完整组合有效；源码定位的独立贡献、缺陷检测质量和完整训练成本还缺少证据。论文共 11 页，没有附录或官方代码链接，也没有公开单题代码与修复日志。可以按公式检查权重和评分计算，尚不能按原实验配置复现训练。</p>

<p class="source-note">来源：2606.10334v1 全文及全部渲染页；原图复用许可按 2026-10-18 的指定版本 arXiv 页面核实。兴趣程度仅表示博客作者个人兴趣。原图均署名、保留英文标签；局部裁剪已注明。</p>

</div>

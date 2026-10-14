---
title: "[2026-06-04] ViCuR: Visual Cues as Recoverable Privilege for Multimodal On-Policy Distillation"
permalink: "/posts/论文解读/vicur.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:30:00+08:00"
cover: "/lib/papers/vicur/cover.svg"
description: "模型会背相交弦定理，却可能把图里的线段认错。ViCuR 在训练时提供视觉线索，并增加一条读取画面证据的注意力分支。本文用真实几何题说明训练流程、增益与局限。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "Multimodal Reasoning"
  - "Visual Cues"
  - "On-Policy Distillation"
  - "SinkTrack"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Kanghui Tian, Siyuan Liu, Ziang Yan, et al. · arXiv:2606.05718v1 · 最早公开于 2026-06-04</p>
<div class="source-links"><a href="https://arxiv.org/abs/2606.05718">论文主页</a><a href="https://arxiv.org/pdf/2606.05718v1">论文 PDF</a><a href="https://github.com/tiankanghui/ViCuR">官方代码</a></div>

<section class="deck-wrap" aria-label="ViCuR 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练过程、真实案例 与复现边界</strong><a href="/lib/decks/vicur-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/vicur-visual-guide.html" title="ViCuR 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">同一张几何图，模型知道应该用哪个定理，却把 4 与 x 认成同一条弦的两段，最后算出 12。ViCuR 研究的是这种<strong>推理规则没错、画面关系读错</strong>的问题：训练时给负责评分的模型补充画面线索，让作答模型学会从原图找到正确关系。文中的相交弦题来自论文附录，不是为解读虚构的例子。</p>

<aside class="part0"><span class="kicker">PART 0 · 两次模型调用各做什么</span><h3>作答模型先写，评分模型再看同一份回答</h3><p>训练中的作答模型称为 student。它只收到图片与问题，先生成一份回答；评分模型称为 teacher，多看一段训练时才提供的提示，再计算 student 已经写出的每个 token 的概率。token 是模型处理的文字单位。这种在 student 自己生成的回答上训练的方法叫 on-policy distillation（OPD）；teacher 使用同尺寸模型时，本文沿用 OPSD 的名称。teacher 不需要重新写一份示范答案。</p><p>ViCuR 的提示描述原图中的关系，作者称它为 visual cue。推理时不给这段文字，但图片仍在，因此线索的来源没有消失。注意：论文里的“同一 backbone”只说明模型架构与规模，不能据此断言 teacher 会同步更新；公开示例另行加载 teacher checkpoint。</p></aside>

<div class="metrics" aria-label="ViCuR 关键数字"><div class="metric"><strong>+1.19</strong><span>2B，相对答案提示蒸馏的七项平均分增量</span></div><div class="metric"><strong>+1.24</strong><span>8B，同一比较，单位为百分点</span></div><div class="metric"><strong>每 5 层</strong><span>新增视觉读取分支的间隔，首次在第 0 层</span></div><div class="metric"><strong>7.5/10</strong><span>个人兴趣程度</span></div></div>

<aside class="keypoints"><h3>先看结论</h3><ul><li>相对答案提示的 OPSD，七项平均分提高 1.19／1.24 个点；8B 版本仍低于未训练模型，也低于 GRPO。</li><li>新增的视觉读取分支只在处理输入时运行，部署仍保留它。2B／8B 分别增加 100.7M／536.9M 参数。</li><li>真正值得先试的是“换提示内容”：几何消融中，仅换成视觉线索就带来大部分提升。</li></ul></aside>


<h2 id="研究问题：知道答案仍可能读错图">1. Motivation：知道答案仍可能读错图</h2>

<p><strong>评分模型知道答案，并不等于作答模型学会了从画面找到证据。</strong>常规 OPSD 给 teacher 参考答案或推理步骤，teacher 会更偏好能接到正确答案的文字。然而 student 看不到提示，可能只学会模仿答案周围的句式，读图错误仍然存在。ViCuR 把提示换成图片里可观察的关系，例如“x 与 8 在同一条弦上，4 与 6 在另一条弦上”。</p>
<p>作者用 <code>S=f(X)</code> 表达一个理想条件：给定图片与问题 X，线索 S 完全由它们决定，就不引入输入之外的信息。附录 F 的推导在这个假设下成立；现实的外部模型或标注者会犯错、产生不同措辞，也可能掺入答案知识，所以不能把理论写成“已经消除泄漏”的保证。</p>

<h2 id="与答案提示蒸馏和视觉读取方法的区别">2. Related Work：与答案提示蒸馏和视觉读取方法的区别</h2>

<p><strong>ViCuR 同时改变 teacher 的提示和 student 的视觉读取结构。</strong>仅换提示与完整方法必须分开比较，否则不能判断增益来自哪里。</p>
<div class="table-scroll"><table><thead><tr><th>设置</th><th>teacher 多看到什么</th><th>student 改动</th><th>与本文的差别</th></tr></thead><tbody><tr><td>答案提示 OPSD</td><td>参考答案或解题提示</td><td>原模型</td><td>主要对照；提示可能直接给出求解规则</td></tr><tr><td>较强 teacher 的 OPD</td><td>同一图片与问题；模型本身更大</td><td>原模型</td><td>提升来自模型规模；ViCuR 可以叠加其上</td></tr><tr><td>只换视觉线索</td><td>原图中与问题有关的描述</td><td>原模型</td><td>直接隔离提示内容的作用</td></tr><tr><td>完整 ViCuR</td><td>视觉线索</td><td>增加读取视觉 token 的注意力分支</td><td>测试模型能否更有效地吸收线索</td></tr><tr><td>Visual-SDPO</td><td>执行 student 代码后得到的渲染差异</td><td>按代码对应区域加权蒸馏</td><td>研究执行反馈，来源不是原始问题图片</td></tr></tbody></table></div>
<p>论文还借鉴了 SinkTrack 对 attention sink 的研究：序列开头的某些 token 会得到大量注意力，可以承载上下文。ViCuR 用新的 cross-attention 参数实现视觉读取，和复用既有注意力的原始 SinkTrack 并不相同。仓库沿用 SinkTrack 名称，不能把两篇工作的机制直接画等号。</p>

<h2 id="训练流程与相交弦案例">3. Method：训练流程与相交弦案例</h2>

<p><strong>student 先独立回答，teacher 再用视觉线索评估同一份回答，梯度只更新 student 及新增分支。</strong>按论文 §3 和公开示例，一次迭代包含以下操作：</p>
<ol><li>读入图片、问题与离线准备的线索。图片放在数据的 <code>images</code> 字段，teacher 的额外提示放在 <code>teacher_prompt</code>。论文没有公开这批线索由谁、用什么模型和提示批量生成，不能声称它们全是人工标注。</li><li>student 只看图片与问题，生成一份回答。它不会先生成线索文字；新增分支直接修改模型内部表示。</li><li>teacher 收到图片、问题、线索和 student 已写出的回答前缀。它计算 student 实际写出的每个 token 的概率，不替换成另一条 teacher 轨迹。</li><li>训练程序比较两边的 token 概率，构造带停止梯度的差值，再用带概率比与裁剪的策略损失更新 student。停止梯度指把评分结果当常量，不反向训练 teacher。</li><li>下一批重新用更新后的 student 作答。部署输入仍是图片与问题，新增视觉分支仍在，teacher 提示不在。</li></ol>

<figure class="figure wide"><a href="/lib/papers/vicur/training-mechanism.svg" target="_blank" rel="noopener"><img src="/lib/papers/vicur/training-mechanism.svg" width="960" height="440" loading="lazy" alt="ViCuR 将原图视觉 token 聚合到序列首个 token，训练时由 teacher 的额外线索提供概率监督"></a><figcaption>按 §3.2–3.4 与固定版本代码重绘。公开实现的层编号从 0 开始，在 0、5、10…层注入；不是从第 5 层才第一次运行。点击可放大。</figcaption></figure>

<h3 id="新增的注意力分支读什么、改什么？">3.1 新增的注意力分支读什么、改什么？</h3>

<p>图片先被编码成一组 visual tokens，即图片区域对应的向量。处理整段输入的阶段叫 prefill。每隔五层，序列中第一个 <code>&lt;|im_start|&gt;</code> token 的 hidden state（内部向量）作为一个 query，读取当前层全部视觉向量作为 keys 与 values。cross-attention 为各区域计算权重，加权汇总后，再加回这个首 token 的向量。后续文字可以通过原有注意力读取它。</p>
<p>因此更新的是这个 token 的内部向量，<strong>没有一份需要逐字复原的线索文本</strong>。新增分支随 student 的作答损失一起训练，没有额外的线索生成或文字匹配损失。公开代码中的两个实现分别用于 Transformers 训练与 vLLM 生成，必须同时接入，不能只改训练端。</p>
<div class="formula">Aₙ = log p_teacher(实际 tokenₙ | 图片、问题、线索、前缀)<br>− log p_student(实际 tokenₙ | 图片、问题、前缀)<br>L ≈ −meanₙ[ stop_gradient(Aₙ) × log p_student(tokenₙ) ]</div>
<p>这是 §3.3 用于解释的未裁剪形式，实际还有概率比与裁剪。若某 token 的 teacher 概率为 0.4、student 为 0.2，差值是 <code>log(2)≈0.693</code>，会鼓励 student 提高它的概率；反过来则抑制。这里的概率只为解释公式，不是实测。附录的全词表 forward KL 是理论分析的对应形式，不能误写为实际主训练损失。</p>

<h3 id="真实几何题：错在配对，不在代数">3.2 真实几何题：错在配对，不在代数</h3>

<figure class="figure wide"><a href="/lib/papers/vicur/chord-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/vicur/chord-case.svg" width="960" height="445" loading="lazy" alt="论文相交弦案例中，同一个定理因线段配对不同，分别得到错误答案12和正确答案3"></a><figcaption>根据 Figure 8、10 与附录 E.1 的真实 Geometry3K 案例重绘。输入只要求求 x；标准答案是 3。下文给出两条计算与重复作答结果。</figcaption></figure>
<p>原图有两条在圆内相交的弦，一条分成 x 与 8，另一条分成 4 与 6。推理提示直接写出“使用相交弦定理，并令两组乘积相等”；视觉提示仅描述这两组线段及交点位置。后者不告诉模型要用哪个定理，也不写答案。</p>
<p>未训练模型和普通 OPSD 的错误回答都用了正确的定理，但把 4 与 x 配在一起，于是 <code>4x=6×8</code>，得到 <code>x=12</code>。ViCuR 的回答正确恢复配对，得到 <code>4×6=x×8</code>，因此 <code>x=3</code>。同一输入重复 10 次，三者正确次数分别是 <strong>5/10、7/10、10/10</strong>。这是单题稳定性观察，不是整个 Geometry3K 的成功率。</p>
<p>另一例来自 MathVista：问题要求在 <code>Pretrain Loss=1.80</code> 处比较曲线的 Acc。前两种模型选 LLaMA-2-70B，ViCuR 选标准答案 RFT U13B。附录列出的模型“估计数值”是模型输出，不能当作图表原始数据引用；注意力热图（attention heatmap）也只能说明机制相容，不能证明某层必然锁定了正确曲线。</p>

<h2 id="实验：平均增益、基线退化与模块消融">4. Experiments：平均增益、基线退化与模块消融</h2>

<p><strong>它改善了较弱的蒸馏对照，但没有超过同表的 GRPO。</strong>主实验用 Vision R1 训练，student 为 Qwen3-VL-2B／8B-Instruct；较强 teacher 分别为 8B／32B。单机 8×H200，每批 128 条样本，学习率 <code>1e-6</code>，输入上限 2,048、回答上限 4,096 token，5 个 epoch 共 275 步。蒸馏每题生成一次，GRPO 每题五次，因此训练生成量不同。</p>
<p>Table 1 的 Overall Avg. 是七项报告分数的算术平均，不是把所有题合并计算准确率：Vision R1-Test，四个数学集 DynaMath／MathVista／WeMath／MathVerse，以及 MMMU-Val／Video-MME。附录说明后六项用 VLMEvalKit 默认定义和判分规则，温度 0.7，最大新生成 4,096 token；不同数据集的默认规则不能统称为同一个字符串完全匹配 judge。</p>
<div class="table-scroll"><table><thead><tr><th>student</th><th>未训练</th><th>GRPO</th><th>答案 OPSD</th><th>OPSD + ViCuR</th><th>较强 OPD</th><th>OPD + ViCuR</th></tr></thead><tbody><tr><td>2B</td><td>45.42</td><td>48.51</td><td>44.88</td><td>46.07</td><td>46.93</td><td>47.57</td></tr><tr><td>8B</td><td>60.76</td><td>65.35</td><td>58.15</td><td>59.39</td><td>63.88</td><td>64.96</td></tr></tbody></table></div>
<p>2B 的 <code>(26.58+51.60+63.4+33.90+40.00+49.22+57.8)/7=46.07</code> 可以直接复算。相对 OPSD 的差值是 1.19 个百分点；8B 提高 1.24，仍比未训练模型低 1.37。2B 的 DynaMath、MMMU、Video-MME 略降，所以“平均改善”不能写成“每项都改善”。</p>

<figure class="figure wide"><a href="/lib/papers/vicur/main-evidence.svg" target="_blank" rel="noopener"><img src="/lib/papers/vicur/main-evidence.svg" width="1000" height="448" loading="lazy" alt="ViCuR 七项平均分对比中同时展示未训练模型、GRPO、OPSD与ViCuR"></a><figcaption>根据 Table 1 重绘，保留未训练与 GRPO 对照。只展示 44.88→46.07、58.15→59.39 会掩盖基线退化。</figcaption></figure>

<h3 id="哪个改动有效？">4.1 哪个改动有效？</h3>

<p>Geometry3K 独立消融训练 100 个 epoch，Table 2 报告最后 100 步准确率的平均，不能与上面 275 步主表直接混用。2B／8B 的基线为 34.14／52.40：只换视觉提示分别到 36.94／56.76；只加视觉分支到 35.31／52.49；合用到 38.94／57.05。<strong>提示内容是最大的单项贡献</strong>，完整分支对 8B 仅比提示版多 0.29。</p>
<p>迁移测试更能限定结论：Table 5 的 8B OPSD，在 MathVista 几何推理子集，视觉提示版 87.03，加入分支后 85.77。论文把它解释为新增容量可能过拟合，但没有因果实验确认。§6 又称 8B Geometry3K 完整版低于提示版，与 Table 2 的 57.05&gt;56.76 不一致；本文以明确表格为准，并保留这处原文矛盾。</p>
<p>所谓提示泄漏，附录 D 实际数的是输出中大小写不敏感的完整单词 <code>Hint</code>。8B 第五个 epoch，出现该词的样本从 3,743 降到 2,424，总出现次数从 44,453 降到 17,976。它衡量提示格式复述，不能排除不含这个词的答案抄袭或错误捷径。</p>
<p>额外成本也要分开：Table 7 的输入处理时间增加 4.3%–24.5%，但逐 token 生成阶段不再运行分支。不同回答长度会改变总耗时，例如 8B 大图总生成从 6,078ms 到 9,745ms；不能凭“无额外解码操作”就宣称端到端一定更快。</p>

<h2 id="下一步：先验证线索，再判断新增结构">5. Discussion：先验证线索，再判断新增结构</h2>

<p><strong>先判断视觉提示是否可靠，再判断额外模型结构值不值。</strong>论文没有公开完整线索生成流程，这是复现和解释增益最直接的缺口。应固定图片、问题、teacher、训练步数与提示模板，比较答案提示、纯视觉提示、同长度无关提示；再对纯视觉提示比较有无新增分支。这样才能拆开内容、长度和参数量。</p>
<p>对游戏截图或视频生成代码，可以借用“原输入可确认”的边界：例如按钮在右上角、敌人碰到玩家后扣血是原视频中可观察的事实；参考代码的函数名、隐藏测试与运行当前代码后的异常并不是。若想用后者训练，应单独标为执行反馈，不能套用 <code>S=f(X)</code> 的理论。这是本文的实验建议，不是 ViCuR 做过的游戏实验。</p>

<h2 id="结论与代码复现边界">6. Conclusion：结论与代码复现边界</h2>

<p><strong>视觉分支与蒸馏接口公开了，论文训练数据链没有完整公开。</strong>本文复核的仓库版本是 <code>a244a244fc24a202bd720f7aac069bb8bd105b06</code>：<code>vicur/modeling_qwen3_vl.py</code> 与 <code>vicur/qwen3_vl.py</code> 定义训练／生成两端；<code>run_qwen3_vl_example.sh</code> 使用 <code>teacher_prompt</code>、sampled-token <code>k1</code> 策略损失、独立 teacher 模型与无任务奖励配置。</p>
<p>示例默认是 Geometry3K 式 1,024／2,048 长度、100 epoch，而非主表的 Vision R1 设置；Parquet 格式的训练数据文件与带初始化分支的 student checkpoint 都是 <code>/path/to/...</code> 占位。缺少线索生成代码、准备好的数据与训练后 checkpoint，因此“仓库开源”不等于能够一键得到论文数字。</p>
<p>个人兴趣程度 7.5/10。最值得精读的是 Figure 8 的两种提示、E.1 的线段配对错误，以及 Table 2／5 对新增分支的限制。它提供了一个可检验的视觉提示方向，但当前证据不支持把它写成比奖励训练更强、或者彻底解决特权信息泄漏。</p>

<p class="source-note">证据范围：arXiv v1 全文与附录 25 页、逐页图表、上述固定代码版本。主结果、几何消融与单题重复作答分别报告；未运行大型训练。兴趣程度只表示博客作者的个人兴趣。</p>

</div>

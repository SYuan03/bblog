---
title: "[2026-06-04] ViCuR: Visual Cues as Recoverable Privilege for Multimodal On-Policy Distillation"
permalink: "/posts/论文解读/vicur.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-18T20:00:00+08:00"
cover: "/lib/papers/vicur/cover.svg"
description: "模型知道相交弦定理，却把图里的线段配错。ViCuR 用训练时的视觉提示和新增注意力分支改善读图；本文追到公开数据，讲清提示从哪来、怎样蒸馏，以及哪些结果没有变好。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 13
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
<div class="source-links"><a href="https://arxiv.org/abs/2606.05718">论文主页</a><a href="https://arxiv.org/pdf/2606.05718v1">论文 PDF</a><a href="https://github.com/tiankanghui/ViCuR">官方代码</a><a href="https://zenodo.org/records/20363889">作者公开的数据</a></div>

<section class="deck-wrap" aria-label="ViCuR 交互图解">
  <div class="deck-head"><strong>13 页交互图解 · 提示构造、训练过程与真实几何题</strong><a href="/lib/decks/vicur-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/vicur-visual-guide.html" title="ViCuR 论文图解，共 13 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机端可滚动页内内容与原表；Esc 退出全屏</span></p></div>
</section>

<p class="lead">下面这道题只要求求 x。模型知道应该用相交弦定理，却把 4 与 x 配成同一条弦的两段，算出 12；正确配对应该是 x 与 8、4 与 6，答案为 3。ViCuR 想训练模型读对这种画面关系，而不只是跟着答案提示写出一段像样的推理。</p>

<aside class="part0"><span class="kicker">PART 0 · 训练中的两次模型计算</span><p>作答模型称为 student：只看图片和问题，先生成回答。评分模型称为 teacher：训练时多看一段提示，再计算 <strong>student 已写出的同一份回答</strong>里各 token 的概率；token 是模型预测的文字单位。这种在 student 自己生成的回答上做蒸馏的方法叫 on-policy distillation（OPD）。本文把同尺寸 teacher 的设置叫 OPSD，较大 teacher 的设置叫 OPD。</p><p>作者给 teacher 的额外文字称为 visual cue，例如“x 与 8 在同一条弦上”。部署不提供这段文字，但仍提供原图。论文还给 student 增加了读取图片向量的注意力分支；它训练后会保留。另一项对照 GRPO 对同一道题生成多份回答，根据它们的相对奖励训练，不使用 teacher 的 token 概率。</p></aside>

<aside class="keypoints"><ul><li>同尺寸 teacher 设置下，七项平均分比答案提示蒸馏提高 <strong>1.19／1.24</strong> 个百分点；2B／8B 均未超过同表 GRPO，8B 仍低于未训练模型。</li><li>几何消融中，只换提示已有明显收益；新增分支在部分迁移测试中反而降低分数。</li><li>公开数据由 Qwen3.5-397B-A17B 构造。提示摘要的输入含标准答案和完整解题过程，<strong>不能把实际数据等同于严格的“只从图里提取”</strong>。个人兴趣程度：7.5/10。</li></ul></aside>

<h2 id="研究问题：知道答案仍可能读错图">1. Motivation：知道答案仍可能读错图</h2>

<p><strong>teacher 的答案提示可能纠正文字，却没有让 student 学会辨认图片中的关系。</strong>常见 OPSD 给 teacher 参考答案或推理提示，student 仍只看原问题。论文担心，student 学到的是如何顺着已知答案组织回答，原本的读图错误却留下了。相交弦例子很直观：使用的定理没有错，错的是哪两个数字属于同一条弦。</p>
<p>作者因此把 teacher 提示从求解规则改成与问题有关的画面描述，并让 student 用新的注意力分支读取视觉信息。理想情况下，这些信息在部署时仍能从原图找到。</p>

<h2 id="与答案提示蒸馏和视觉读取方法的区别">2. Related Work：与答案提示蒸馏和视觉读取方法的区别</h2>

<p><strong>本文同时改了提示内容和模型结构，需要分别看两项的作用。</strong>最接近的对照是使用相同 teacher 的答案提示蒸馏。</p>
<div class="table-scroll"><table class="comparison-table"><thead><tr><th>设置</th><th>teacher 的额外信息</th><th>student 的变化</th><th>比较什么</th></tr></thead><tbody><tr><td>答案提示 OPSD</td><td>答案或求解规则</td><td>原模型</td><td>主要蒸馏对照</td></tr><tr><td>较强 teacher 的 OPD</td><td>原问题；teacher 本身更大</td><td>原模型</td><td>teacher 能力</td></tr><tr><td>只换 visual cue</td><td>画面关系描述</td><td>原模型</td><td>提示内容的贡献</td></tr><tr><td>完整 ViCuR</td><td>画面关系描述</td><td>新增视觉读取分支</td><td>额外结构是否值得</td></tr><tr><td><a href="/posts/论文解读/visual-sdpo.html">Visual-SDPO</a></td><td>执行当前代码后的画面差异</td><td>按对应源码位置加权训练</td><td>执行反馈，来源不同于原问题图片</td></tr></tbody></table></div>
<p>论文借鉴 attention sink：序列开头某些 token 往往得到较多注意力。原始 SinkTrack 复用模型已有注意力保存上下文；ViCuR 增加专用 cross-attention 参数读取视觉向量。图里也用 SinkTrack 名称，但两者不是同一个实现。</p>

<h2 id="训练流程与相交弦案例">3. Method：训练流程与相交弦案例</h2>

<p><strong>提示先离线构造；训练时 student 独立作答，teacher 重评这份回答。</strong>把这两段流程分开，才能看清强模型究竟用在哪里。</p>

<h3>3.1 visual cue 从哪里来</h3>

<p>作者在 <a href="https://github.com/tiankanghui/ViCuR/issues/1#issuecomment-4686972284">官方 issue 回复</a>给出两次生成的流程：第一次得到完整解答 <code>full_response</code>；第二次摘要要求写 1–3 句英语，描述图中的几何或视觉关系，不写求解步骤。作者文字说明称摘要依据题目与推理，但展示的 user 模板只有 <code>Ground Truth Answer</code>（标准答案）和 <code>Full Solution</code>（完整解答），没有单独的题目字段，也未展示图片输入。摘要模型具体是哪一个，回复未说明。</p>
<p><a href="https://zenodo.org/records/20363889">数据包</a>里的 <code>data.md</code> 指定构造模型为 Qwen3.5-397B-A17B，并说明 <strong>不检查生成解答是否正确</strong>，只保留正常结束的生成，排除超长、格式异常等情况。本文直接检查了 Geometry3K 的 <code>_R</code>（答案／推理提示）与 <code>_S</code>（视觉提示）两个训练文件，各 1,568 行；这不等于原始 Geometry3K 全量训练集。VisionR1 文件在包内，但本文未下载逐条核查。</p>
<p class="note">理论与构造方式要分开：§3.1 和附录 F 在理想条件 <code>S=f(X)</code> 下讨论，X 是图片与问题，S 完全由 X 决定。实际摘要依赖答案和解答，并且样本 2 的“视觉提示”明确写了 <code>Pythagorean theorem</code>（勾股定理）。这不足以证明整批提示都只含视觉事实，也不意味着每条提示必然泄漏答案；需要逐条检查内容。</p>

<h3>3.2 一次训练更新</h3>

<figure class="figure original"><a href="/lib/papers/vicur/figure-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-1.webp" width="1888" height="1136" loading="lazy" alt="原论文 Figure 1：答案提示 OPSD 与视觉提示 ViCuR 的训练、推理输入对比"></a><figcaption>原论文 Figure 1。图中“recoverable”是理想解释，不能代替对公开提示的质量检查，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>

<ol><li>训练程序读入图片、问题和预先准备的 <code>teacher_prompt</code>。这个字段是一整段 teacher 消息，不只是提示字符串。</li><li>student 只看图片与问题，采样一份回答 y。它不先生成 cue，也看不到额外提示。</li><li>teacher 多看 cue，再在相同回答 y 的每个前缀上计算下一个实际 token 的概率。teacher 不另写一条回答替代 y。</li><li>训练程序用两边概率的差值更新 student 及新增分支；teacher 的评分不接收梯度。公开示例独立加载已保存的 teacher 权重，不随 student 同步更新。</li><li>下轮由更新后的 student 重新采样。部署只保留 student 和它的新增分支，输入仍是图片与问题。</li></ol>

<h3 id="新增的注意力分支读什么、改什么？">3.3 新增分支读什么</h3>

<figure class="figure original narrow"><a href="/lib/papers/vicur/figure-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-2.webp" width="916" height="592" loading="lazy" alt="原论文 Figure 2：首 token 通过专用 cross-attention 读取当前层全部视觉向量，结果加回首 token"></a><figcaption>原论文 Figure 2。Q 来自首 token，K/V 来自当前层全部 visual tokens，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<p>图片编码成 visual tokens，即表示图片区域的一组向量。一次处理整段输入的阶段叫 prefill。代码在第 <strong>0、5、10…层之后</strong>，用第一个 <code>&lt;|im_start|&gt;</code> token 的 hidden state（内部向量）去读取当前层全部视觉向量：首 token 提供 query（Q，发起读取的向量），视觉向量提供 keys 和 values（K/V，用于计算权重及被汇总的内容）。专用 cross-attention 分支按权重汇总，再把结果加回首 token；后续文字可以通过原有注意力读取它。</p>
<p>这段分支不生成 cue 文本，也没有额外文字匹配损失。问题通过作答损失影响它的训练；不能把序列首 token 描述成已经直接读过后面的完整问题。2B／8B 分别增加 100.7M／536.9M 参数，约为原模型的 4.52%／5.77%。常规使用缓存的逐 token 解码不再运行这段分支；本文未验证所有分块输入调度。</p>

<div class="formula">Aₙ = log pT(实际 tokenₙ | 图片、问题、cue、回答前缀)<br>− log pS(实际 tokenₙ | 图片、问题、回答前缀)<br>L ≈ −meanₙ[stop_gradient(Aₙ) × log pS(tokenₙ)]</div>
<p>上式是 §3.3 为说明梯度路径写出的未裁剪形式。若 teacher 给某 token 概率 0.4，student 给 0.2，差值是 <code>log(2)≈0.693</code>，更新会鼓励提高该 token 的概率；反过来则抑制。这里的概率是教学假设。实际代码使用 <code>k1</code> 的对数概率差、停止梯度，以及带概率比和裁剪的策略损失；默认不使用任务奖励更新。附录的全词表 forward KL 是理论对应形式，不是主实验损失。</p>

<h3 id="真实几何题：错在配对，不在代数">3.4 真实题：哪里错、怎样判</h3>

<figure class="figure original"><a href="/lib/papers/vicur/figure-8-chords-detail.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-8-chords-detail.webp" width="1880" height="844" loading="lazy" alt="原论文 Figure 8 相交弦部分：推理提示给定理，视觉提示描述两条弦的线段配对"></a><figcaption>原论文 Figure 8 的 Case 1 局部。红框给定理与乘积，蓝框描述 x/8 和 4/6 配对；完整图在补充，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<p>这也是公开 <code>geo3k_train_S.parquet</code> 的第 0 行，<code>extra_info.index=0</code>，标准答案在 <code>reward_model.ground_truth</code> 中为 <code>3</code>。student 的题目只有图片、<code>Find x.</code> 和输出格式要求；teacher 额外收到图中的蓝框描述。</p>
<p>附录 E.1 报告，base 和普通 OPSD 的错误回答把 4 与 x 配在一起，列成 <code>4x=6×8</code>，结果为 12。ViCuR 正确列成 <code>x×8=4×6</code>，得到 3。这里可以直接复算 <code>(4×6)/8=3</code>；单题分析用最终答案是否为 3 计数，不核验整段推理。作者重复同一题 10 次，base／OPSD／ViCuR 答对 <strong>5/10、7/10、10/10</strong>。这是训练样例上的作者单题观察，不是 held-out 泛化准确率；本文没有重新调用模型。</p>

<details class="supplement"><summary>公开数据原样节选，以及“视觉提示”混入定理的反例</summary><p>下面是 Python 3 + pandas／pyarrow 的只读示例，展示已经公开的 Parquet 行，不是作者的训练程序。数据中的完整消息还包括 system prompt、thinking 和 boxed 格式要求：</p>

```python
import pandas as pd

row = pd.read_parquet("Geo3k/geo3k_train_S.parquet").iloc[0]
print(row["extra_info"]["index"])           # 0
print(row["reward_model"]["ground_truth"]) # 3
print(row["teacher_prompt"][-1]["content"])
```

<blockquote><p>[Hint]: The diagram shows a circle with two intersecting chords. One chord is divided into segments labeled $x$ and $8$, while the other chord is divided into segments labeled $4$ and $6$. The intersection point lies inside the circle, and the segment lengths are marked such that the chords cross, forming four distinct segments with the given lengths.</p></blockquote>
<p><code>_R</code> 同行写的是 <code>applying the Intersecting Chords Theorem</code>，并给出 <code>x·8</code> 与 <code>4·6</code>。但是 <code>_S</code> 第 2 行也写了：<code>The geometric relationship between the sides is defined by the Pythagorean theorem.</code> 要求“不写求解步骤”，不等于每条结果都满足纯视觉条件。</p></details>

<details class="supplement"><summary>完整原图：第二道提示题、MathVista 案例与注意力热图</summary>
<figure class="figure original"><a href="/lib/papers/vicur/figure-8.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-8.webp" width="1880" height="1836" loading="lazy" alt="原论文 Figure 8 完整图：相交弦、等腰三角形的两种提示"></a><figcaption>原论文 Figure 8。第二题强调等边标记、高和 73° 的位置；求解提示直接给正弦公式，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-10.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-10.webp" width="1880" height="600" loading="lazy" alt="原论文 Figure 10：Geometry3K 弦图与 MathVista 曲线题"></a><figcaption>原论文 Figure 10。MathVista 在 Pretrain Loss=1.80 比较 Acc，标准答案 RFT U13B；base／OPSD 选 LLaMA-2-70B。模型估算的曲线数值不能当原图数据，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-11.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-11.webp" width="1888" height="952" loading="lazy" alt="原论文 Figure 11：两题的首层、各层均值和逐层注意力热图"></a><figcaption>原论文 Figure 11。没有干预实验，不能证明某个亮区导致了正确答案，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
</details>

<h2 id="实验：平均增益、基线退化与模块消融">4. Experiments：平均增益、基线退化与模块消融</h2>

<p><strong>主结果改善了蒸馏对照，但没有超过 GRPO。</strong>主实验在 Vision R1 上训练 Qwen3-VL-2B／8B-Instruct；较强 teacher 分别是 8B／32B。8×H200，batch 128，学习率 <code>1e-6</code>，输入／回答上限 2,048／4,096 token，5 epoch 共 275 步。蒸馏每题生成一次，GRPO 五次，因此不是相同生成成本。</p>
<p>Table 1 的 Overall Avg. 是 <strong>七项报告分数的等权平均</strong>，不是把七个数据集的全部题合起来算准确率。Vision R1-Test 单独报告；其余六项通过 VLMEvalKit，使用各数据集自己的定义和判分规则。论文未固定评测框架 commit，也没有全部逐题判分记录，不能统称为同一套字符串匹配 judge。</p>
<figure class="figure original"><a href="/lib/papers/vicur/table-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-1.webp" width="1880" height="908" loading="lazy" alt="原论文 Table 1：七个评测、全部 2B/8B 对照及平均分，含降低的红色数值"></a><figcaption>原论文 Table 1。保留全部对照；2B 的 DynaMath、MMMU、Video-MME 比 OPSD 略降，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<p>2B 可复算 <code>(26.58+51.60+63.4+33.90+40.00+49.22+57.8)/7≈46.07</code>，比 OPSD 44.88 高 1.19，却低于 GRPO 48.51。8B 为 59.39，比 OPSD 高 1.24，但低于 base 60.76 和 GRPO 65.35。较强 teacher 的 OPD 叠加 ViCuR 后为 47.57／64.96，分别提高 0.64／1.08，仍低于对应 GRPO。</p>

<h3 id="哪个改动有效？">4.1 只换提示，还是也要加分支</h3>

<figure class="figure original narrow"><a href="/lib/papers/vicur/table-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-2.webp" width="916" height="392" loading="lazy" alt="原论文 Table 2：Geometry3K 的提示、分支及组合四组消融"></a><figcaption>原论文 Table 2。独立训练 100 epoch，分数为最后 100 步准确率均值，不是主表最终 checkpoint，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<p>2B／8B 只换视觉提示，从 34.14／52.40 到 36.94／56.76；只加分支到 35.31／52.49；合用为 38.94／57.05。提示是最大的单项贡献，8B 分支在提示版上只多 0.29。<strong>迁移测试存在反例：</strong>Table 5 的 8B OPSD，MathVista 几何推理子集提示版为 87.03，完整方法为 85.77。作者解释可能是过拟合，尚无实验确认这个原因。</p>
<p>§6 又把 8B Geometry3K 完整版描述为低于提示版，与 Table 2 的 <code>57.05&gt;56.76</code> 不一致。本文保留原文矛盾，不据此修改表中数字。</p>
<details class="supplement"><summary>完整原表：跨数据集消融（Table 5）</summary>
<figure class="figure original"><a href="/lib/papers/vicur/table-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-5.webp" width="1880" height="1008" loading="lazy" alt="原论文 Table 5：Geometry3K 训练后迁移到 MathVista 与 DynaMath 的完整结果"></a><figcaption>原论文 Table 5。完整分支没有在所有迁移列超过提示版，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
</details>

<h3>4.2 提示复述与额外成本</h3>

<p>论文的“泄漏”诊断只数输出中大小写不敏感的完整单词 <code>Hint</code>。8B 第五 epoch，含该词的样本从 3,743 减到 2,424，总次数从 44,453 减到 17,976。这反映提示格式复述减少，不能排除不含该词的答案复制。</p>
<p>分支在常规 prefill 运行，Table 7 输入处理时间增加 4.3% 至 24.5%；总耗时却受回答长度影响，8B 大图例从 6,078ms 到 9,745ms。<strong>无额外解码操作，不等于端到端更快。</strong></p>

<details class="supplement"><summary>完整原图表：提示复述、训练与推理成本</summary>
<figure class="figure original narrow"><a href="/lib/papers/vicur/figure-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-4.webp" width="916" height="324" loading="lazy" alt="原论文 Figure 4：OPSD 五个 epoch 的 Hint 样本与次数"></a><figcaption>原论文 Figure 4。统计完整单词 Hint，不是语义泄漏率，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/table-8.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-8.webp" width="1888" height="712" loading="lazy" alt="原论文 Table 8：全部模型与 epoch 的 Hint 样本数、次数"></a><figcaption>原论文 Table 8。每格为 samples / occurrences，每 epoch 55 步，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-9.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-9.webp" width="1888" height="624" loading="lazy" alt="原论文 Figure 9：较强 teacher OPD 的 Hint 统计"></a><figcaption>原论文 Figure 9。无提示 OPD 与加 cue 的版本都较低，不能套用 OPSD 的统计，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/vicur/table-6.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-6.webp" width="632" height="320" loading="lazy" alt="原论文 Table 6：VisionR1 275 步训练墙钟时间"></a><figcaption>原论文 Table 6。2B 时间略增，8B 表中更短；不能证明固定输出内容下的结构速度优势，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/table-7.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-7.webp" width="1888" height="496" loading="lazy" alt="原论文 Table 7：输入、视觉 token、prefill、解码、回答长度及总耗时"></a><figcaption>原论文 Table 7。单 H200，3 次预热后 10 次测量平均；小图 64 visual tokens，大图 1,782。回答长度不固定，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
</details>

<details class="supplement"><summary>完整原图表：训练／评测配置与概率变化分析</summary>
<figure class="figure original"><a href="/lib/papers/vicur/table-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-3.webp" width="1624" height="512" loading="lazy" alt="原论文 Table 3：VisionR1 蒸馏、GRPO 和 Geometry3K 配置"></a><figcaption>原论文 Table 3。蒸馏 4 student + 4 teacher GPU，GRPO 8 student GPU，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/vicur/table-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/table-4.webp" width="956" height="716" loading="lazy" alt="原论文 Table 4：VLMEvalKit 生成和视觉处理配置"></a><figcaption>原论文 Table 4。温度 0.7、最大新生成 4,096 token 等生成配置，不等于 judge 的逐题实现，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-3.webp" width="1888" height="616" loading="lazy" alt="原论文 Figure 3：准确率、完整回答及前后半段概率差"></a><figcaption>原论文 Figure 3。较容易模仿 teacher 的概率，不一定意味着较高准确率，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-5.webp" width="1888" height="772" loading="lazy" alt="原论文 Figure 5：四组 student/teacher 的 Geometry3K 增益"></a><figcaption>原论文 Figure 5。2B→8B 组合增益不是 Table 1 七项平均，别混用实验，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-6.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-6.webp" width="1888" height="1004" loading="lazy" alt="原论文 Figure 6：Geometry3K 训练和测试准确率、完整回答概率差"></a><figcaption>原论文 Figure 6。较低概率差不必然对应较高准确率，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/vicur/figure-7.webp" target="_blank" rel="noopener"><img src="/lib/papers/vicur/figure-7.webp" width="1888" height="1132" loading="lazy" alt="原论文 Figure 7：回答四等分的概率差变化"></a><figcaption>原论文 Figure 7。四等分位置的趋势不等于标注了哪些 token 属于视觉推理，CC BY 4.0；仅裁去图表外正文。</figcaption></figure>
</details>

<h2 id="下一步：先验证线索，再判断新增结构">5. Discussion：先验证线索，再判断新增结构</h2>

<p><strong>最值得补的实验，是把提示的来源和内容控制住。</strong>固定图片、问题、teacher、训练步数，比较直接从原图生成的提示、答案辅助生成的提示、求解提示和同长度无关提示；对同一批可靠提示，再比较是否添加分支。这能拆开强模型的数据筛选、提示内容和新增参数的影响。</p>
<p>对游戏数据，截图中按钮位置或视频里可观察的行为可以写成提示。参考代码提供的函数、隐藏测试和运行当前代码后的异常则是别的训练信息，不能直接用 <code>S=f(X)</code> 解释。这是本文的研究建议，ViCuR 没有做游戏生成实验。</p>

<h2 id="结论与代码复现边界">6. Conclusion：结论与代码复现边界</h2>

<p><strong>它支持“提示内容影响多模态蒸馏”的判断，尚不能证明纯视觉提示或新增分支普遍更好。</strong>真实题把读图错误讲得很清楚，Table 2 也给出了组件消融；同时要记住公开提示由答案和解答辅助构造，完整方法低于同表 GRPO，部分迁移不如只换提示。</p>
<p>本文复核代码 commit <code>a244a244fc24a202bd720f7aac069bb8bd105b06</code>，以及作者链接的数据。模型分支、蒸馏接口与样本可检查；完整数据生成脚本、结果运行记录和训练后 checkpoint 未找到，不能称为一键复现。公开示例还是 Geometry3K 的 100 epoch、1,024／2,048 长度，不能直接当 VisionR1 主表配置。</p>
<details class="supplement"><summary>代码入口、实际 reward 与复核范围</summary><p><code>vicur/modeling_qwen3_vl.py</code>／<code>vicur/qwen3_vl.py</code> 分别实现 Transformers 与 vLLM 端分支；训练和采样两端都要接入。<code>teacher_model.py</code> 独立加载 teacher；<code>teacher_manager.py</code> 对齐不同长度 teacher prompt 与同一 student 回答。<code>verl/trainer/distillation/losses.py</code> 使用 sampled-token 概率差的负值作为停止梯度的 advantage，送入策略损失。默认 token-mean 汇总与论文解释式的逐回答平均不同。</p><p>默认几何 reward 文件 <code>geo3k.py</code> 把答案正确性按 0.9、格式按 0.1 加权，并期待 <code>&lt;think&gt;</code>；公开数据提示却用 <code>&lt;thinking&gt;</code>。这个 reward 不等同于 Table 2 的准确率，主蒸馏配置 <code>use_task_rewards=False</code>，不靠它更新模型。</p><p>数据抽查文件 SHA256：<code>_S: 55d439721f7eefb47f2b3219e0ab76041c0ecbc9c0f6b51b34b5a426d98e650d</code>，<code>_R: 169985e9ecc87d5116f680af37834e20b4fe2a90d8a8b01723f7517435c63fe9</code>。只下载并检查两份 Geometry3K 文件和包内说明，不声称逐条检查 VisionR1 或复现 GPU 训练。</p></details>
<p class="source-note">证据范围：arXiv v1 全文与附录 25 页、全部 19 张编号图表、固定代码版本、作者 issue 回复与 Zenodo 数据抽查。原图由 Kanghui Tian 等创作，按 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> 标注；兴趣程度仅表示博客作者的个人兴趣。</p>

</div>

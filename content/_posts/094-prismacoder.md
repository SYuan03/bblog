---
title: "[2026-10-14] PrismaCoder: Pushing the Boundaries of Open Multimodal Code Intelligence through Decomposed Rubric Synthesis"
permalink: "/posts/论文解读/prismacoder.html"
date: "2026-10-22T16:00:00+08:00"
updated: "2026-10-22T16:00:00+08:00"
cover: "/generated-covers/094-prismacoder.webp"
description: "追溯 PrismaCoder-2M 的种子、执行筛选与重生成流程，分清 Claude 生成训练代码、Gemini 造评分标准和判分的角色，以及论文能否支持‘蒸馏’这一说法。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
paper_style: editorial
categories:
  - "论文解读"
tags:
  - "PrismaCoder"
  - "Multimodal Code"
  - "Data Synthesis"
  - "GRPO"
---

<style>
.prisma-reading .prisma-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}.prisma-reading .prisma-pair img{width:100%;height:auto}.prisma-reading .prisma-table>a{display:block;overflow-x:auto}.prisma-reading .prisma-table img{width:100%;height:auto}.prisma-reading .prisma-formula{padding:14px 18px;background:#f4f7f8;border-left:3px solid #3974a0;overflow-x:auto;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em}@media(max-width:640px){.prisma-reading .prisma-pair{grid-template-columns:1fr}.prisma-reading .prisma-table img{min-width:760px;max-width:none}}
</style>
<div class="paper-reading prisma-reading">
<section class="deck-wrap" aria-label="PrismaCoder 论文图解"><div class="deck-head"><strong>9 页图解 · 数据怎么来、谁是教师、判分如何进入 RL</strong><a href="/lib/decks/prismacoder.html">独立阅读 ↗</a></div><div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/prismacoder.html" title="PrismaCoder 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>按钮或方向键翻页 · F 全屏 · Esc 退出</span><span>手机端可全屏阅读；下方原图可以放大</span></p></div></section>

<p class="paper-meta">Qiushi Sun、Jingyang Gong 等 · arXiv v1，2026-10-14</p>
<div class="source-links"><a href="https://arxiv.org/html/2610.20538v1">论文 HTML</a><a href="https://arxiv.org/pdf/2610.20538v1">论文 PDF</a><a href="https://qiushisun.github.io/PrismaCoder-Home/">项目页</a><a href="https://github.com/QiushiSun/PrismaCoder/tree/666ab0cfb49ad3508e4e5575e29960dada090724">固定版本代码</a><a href="https://huggingface.co/datasets/QiushiSun/PrismaCoder-2M">数据页</a></div>
<p class="lead">给模型一张网页截图，要它写出能还原页面的 HTML。代码里有第三个服务按钮，截图里却被页脚盖住了。PrismaCoder 关心的是这类“程序能运行，但结果不对”的问题：如何批量造出涵盖网页、图表、SVG、化学结构等格式的训练样本，并用同一套可细分的检查办法筛选数据、给强化学习打分。下文沿着一个样本从来源到训练的路径，核对“是否蒸馏了大模型”。</p>
<aside class="part0"><h3 id="part-0">Part 0：这里的 code intelligence 是什么</h3><p>一条样本包含任务指令（可能附参考图）、模型写出的代码，以及执行代码得到的网页或图像。论文把逐题生成的检查项称作 <strong>rubric</strong>：一部分查代码里有没有要求的内容，另一部分看渲染图是否真的摆对。它训练的是一次生成代码或页面的模型；论文没有描述在文件系统里反复读写、运行测试、修改代码的 Codex 式多轮编程代理。</p></aside>
<aside class="keypoints"><ul><li><strong>数据不是从单一教师模型直接吐出的 2M 条答案。</strong>作者先收集公开代码、网页和图像，再拆分、补写或重生成候选代码，执行和渲染后按逐题评分筛选；高分样本还可作为新任务种子。</li><li><strong>确有教师答案模仿成分。</strong>Claude Opus 4.6 是代码候选的 curation model；Gemini 3 Pro 主要造评分标准，Gemini 3 Flash 判分。论文没有公开 Claude 生成的最终样本比例，也没有使用教师 logits/KL 的报告。</li><li><strong>RL 是单次完成后的外部评分。</strong>Python、HTML、SVG 各有 5K 条从留出指令筛出的 RL 题；每题采样 8 个回答，再用同一 rubric 算组内优势。完整合成与训练脚本尚未公开，不能把论文流程等同于当前仓库可直接复现的流程。</li></ul></aside>

<h2 id="motivation">1. Motivation：代码能运行，画面仍可能错</h2>
<p><strong>可执行性只是第一关。</strong>绘图脚本可能画错刻度，SVG 能打开但图形错位，网页 DOM 有按钮而截图把按钮遮住。单一“整体相似度”难以说明错在哪里；为所有领域手写统一规则，又覆盖不了每道题的具体要求。论文的目标是让检查项随指令变化，同时区分代码证据与视觉证据。来源：论文 §1、§3.1、Figure 3。</p>
<p>这种任务也说明“多模态代码”与传统文本代码补全的差别：输入可以是文字或截图，输出是可执行程序，最终质量还取决于浏览器、绘图库或编译器产生的可见结果。论文 Figure 1 展示的格式范围很广；实际训练集各类任务数量见 Table 1，不能把它理解为单一网页数据集。</p>

<h2 id="related-work">2. Related Work：与已有视觉代码数据和固定判分的边界</h2>
<p><strong>新意主要在跨格式的数据筛选与奖励复用。</strong>JanusCoder、VisCoder2、VinciCoder 等已经覆盖部分视觉代码任务；PrismaCoder 收入更多格式，并让每条指令有自己的代码检查和图像检查。公开代码或论文中的“固定 verifier”适合某一格式的确定性规则，但网页视觉质量、图表布局等还要看渲染结果。论文 Appendix B Table 5 给出各工作的格式覆盖；覆盖广不等于每个格式都领先，也不表示数据来源全为新创。</p>

<h2 id="method">3. Method：一条训练样本怎样被造出来</h2>
<h3 id="seeds">3.1 先找种子，再把代码变成能独立运行的候选</h3>
<p>作者从绘图数据集、GitHub 绘图脚本、arXiv 论文图片、WebCode2M / MCD 网页、PubChem 化学结构和 3Blue1Brown 的 Manim 视频代码等收集种子。这里的 <strong>seed</strong> 是后续改写任务的来源材料，不等于最终入选的训练样本。长绘图脚本和 Manim 文件由 AST 解析成“一张图”或“一个 Scene”对应的自包含代码单元，保留依赖的导入与语句，去掉源仓库私有辅助函数。来源：论文 §4.1、Appendix A.1、Table 4。</p>
<figure class="figure original prisma-table"><a href="/lib/papers/prismacoder/table-4.webp"><img src="/lib/papers/prismacoder/table-4.webp" width="1230" height="582" loading="lazy" alt="论文 Table 4：MCD、GitHub、WebCode2M 等 13 个来源的种子、重生成、合成阶段计数"></a><figcaption>原论文 Appendix B, Table 4，p.19。三列是来源与处理阶段的计数，<strong>不能相加当成最终 2M 的构成</strong>；最终任务类型分布另见 Table 1。Sun et al., arXiv:2610.20538v1，CC BY 4.0；点击看完整原表。</figcaption></figure>
<p>例如 Table 4 的 GitHub 行是 417,000 个种子、297,942 个 regenerated、188,630 个 synthesized；WebSight 虽有 1,922,671 个种子，后两列只有 40,000 和 12,000。这些数说明不同来源经过不同强度的再处理，不能推断“所有 GitHub 样本最终都保留”，也不能把三列求和当教师生成比例。最终 SFT 的任务分布中，WebUI Generation 约 357.1K（17.8%），Chart-to-Code 约 196.5K（9.8%）；总量约 2M。来源：Table 1、Table 4。</p>

<h3 id="synthesis">3.2 Claude 补代码，执行器把失败样本挡在评分前</h3>
<p>种子若没有可用代码，作者让代码整理模型补全或再生成；论文 §5.1 指定这个 <strong>curation model</strong> 为 Claude Opus 4.6。候选随后进入按格式区分的执行器：Python 必须保存图，HTML 在无头浏览器里截图，SVG、LaTeX、Mermaid、Manim 等调用相应渲染或编译程序，化学结构要能解析成有效分子。错误、超时或空产物会失败，仍修不好的候选进入 repair pool。执行成功只表示有产物，不能保证产物符合任务。来源：§4.2、§5.1、Appendix A.2。</p>
<figure class="figure original"><a href="/lib/papers/prismacoder/figure-2.webp"><img src="/lib/papers/prismacoder/figure-2.webp" width="766" height="335" loading="lazy" alt="论文 Figure 2：同一组逐题 rubric 用于监督数据筛选和强化学习奖励"></a><figcaption>原论文 Figure 2：上方从候选代码到执行、判分、保留或重生成；下方把同一 rubric 用于 RL 的采样代码。图中的箭头是信息流，不代表每个阶段只运行一次。Sun et al., v1，p.4，CC BY 4.0。</figcaption></figure>

<h3 id="rubrics">3.3 逐题 rubric 怎么造，怎么把低分样本送回去</h3>
<p>作者先按任务难度决定检查项数量，再让 <strong>rubric generator</strong> 为当前指令写两套带权重的是非题：一套从代码检查结构与内容，一套从渲染图检查布局和可读性；每套又含领域通用项与当前题特有项。论文 §5.1 指定 Gemini 3 Pro 生成这些标准，Gemini 3 Flash 作为独立的 <strong>judge</strong> 逐项判分。Appendix C 的成本说明有一句“Gemini-3-Flash for rubrics”，与 §5.1 的生成器型号写法不一致；本文按 §5.1 区分角色，并保留这处文内歧义。</p>
<div class="prisma-formula">每种证据的分数 = Σ(检查项权重 × 是否通过) / Σ检查项权重；总分 = λcode × 代码分 + λvisual × 视觉分</div>
<p>低于下阈值的候选丢弃；中段候选带着失败的检查项反馈再次合成；高分候选保留，也可当新样本的种子。每次新生成的代码重新经过执行与评分。最终是否进入 SFT 还要满足该领域自己的阈值。论文没有给出所有阈值的可直接复现配置，也未披露最后 2M 中各来源、各教师模型输出的精确交叉比例。来源：§3.1、§4.2、Appendix C。</p>

<h3 id="case">3.4 一次实际判分：代码全对，页脚盖住按钮</h3>
<p>论文 Figure 3 的任务是参照网页截图生成页面。候选 HTML 含要求的产品区、服务区、颜色和版权文字，因此代码 rubric 的 5 项全过，得 1.00；渲染出来后，页脚悬在服务区中间，遮住第三个服务按钮，按钮形状也错了。视觉 rubric 的 5 项只过“水平居中”一项：<strong>0.8 ÷ (1.0 + 0.8 + 0.9 + 0.9 + 0.8) = 0.182</strong>。一个整体判分器仍给 78/100。逐项结果见 Appendix C Table 6；0.182 是视觉分，不能冒充这条样本的最终加权总分。</p>
<figure class="figure original"><div class="prisma-pair"><a href="/lib/papers/prismacoder/figure-3-reference.webp"><img src="/lib/papers/prismacoder/figure-3-reference.webp" width="1280" height="720" loading="lazy" alt="论文 Figure 3 的参考网页，第三个服务按钮完整可见"></a><a href="/lib/papers/prismacoder/figure-3-synthesized.webp"><img src="/lib/papers/prismacoder/figure-3-synthesized.webp" width="1280" height="855" loading="lazy" alt="论文 Figure 3 的生成网页，页脚覆盖第三个服务按钮"></a></div><figcaption>原论文 Figure 3：左为参考页面，右为生成页面。右图中 Service 3 被页脚盖住；代码项 5/5、视觉项 1/5。Sun et al., v1，p.5，CC BY 4.0；原图分别可放大。</figcaption></figure>

<h3 id="distillation">3.5 到底有没有蒸馏某个模型</h3>
<p><strong>有教师生成答案供学生模仿的成分，不能把整个训练概括成“蒸馏 Claude”。</strong>Claude Opus 4.6 负责部分代码的补全、重生成和扩增；保留下来的指令与代码进入 SFT，学生从 Qwen3.5-9B / Qwen3.5-35B-A3B 初始化并做全参数训练。因此若“蒸馏”泛指用强模型造监督答案，答案是有。若特指以教师概率分布为目标的 logits/KL 蒸馏，论文没有报告这种损失。也不能说全部 2M 条都是 Claude 输出：原始公开代码、不同来源的再生成样本和新合成样本混在一起，论文没有给出最终 Claude 占比。</p>
<p>Gemini 3 Pro 是造评分标准的模型，Gemini 3 Flash 是判分模型。后者给 SFT 数据做筛选，还在 RL 阶段给模型新生成的答案打奖励；它不等同于“把 Gemini 的代码答案蒸馏给学生”。判分器对最终能力的影响仍值得实验隔离，论文目前没有这样的教师来源分解。来源：§4.2、§5.1、Appendix F。</p>

<h3 id="rl">3.6 SFT 之后的 RL：同一张 rubric 换成奖励</h3>
<p>作者对 Python、HTML、SVG 各预留 20K 条中高难度指令，SFT 不看这些题。SFT 模型先对每题试 5 个答案；每个答案按 rubric 打分后，作者以五个分数的方差挑每领域前 5K 题。它挑的是“有时会、有时不会”的题，而非最高分题。正式 RL 时每题采样 8 个回答：从回答抽代码，执行并渲染，按代码和视觉 rubric 求 0–1 奖励，组内减均值、除标准差得到优势，再用 GRPO 更新；MoE 模型使用 GSPO 与 Rollout Routing Replay。无代码、执行失败或判分失败且重试后仍无法评分的回答得 0。来源：§3.2、§4.3、Appendix D、F。</p>
<p>论文 Appendix F 报告 SFT 训练 5 epoch，RL 训练 1 epoch；32 张 H200，ms-swift 的 Megatron 后端，rollout 由 vLLM 生成。这里的执行器是按语言调用渲染器和评分插件的训练环境，<strong>没有披露 Codex/Claude Code 式的多轮文件编辑 harness</strong>；数据类型里也没有 PPTX。公开仓库的 RL toolkit 当前只覆盖 text-only Python/SVG/HTML verifier，完整 PrismaForge 合成筛选及 SFT/RL 训练脚本仍列为后续发布，不能按论文描述直接复跑完整流程。来源：Appendix A、D、F；官方仓库 README（固定 commit 666ab0c）。</p>

<h2 id="experiments">4. Experiments：哪些数字支持这套方法</h2>
<p><strong>多项结果较强，但各实验支持的结论不同。</strong>在 ChartMimic Low-Level，9B 模型从 Qwen3.5-9B 基座的 58.35 提升到 81.57；High-Level 从 55.55 到 73.82（论文 Table 2）。Figure 5 的等量训练数据对照，是“用逐项 rubric 筛 SFT 数据”与“整体分数筛 SFT 数据”的比较；它显示所有列有提升、Vega-Lite 最大约 24 点，但不能单独证明 RL 奖励也优于直接打分。Figure 6 对 Gemma-4 和 Qwen3-VL 的迁移实验支持跨基座有效；Appendix H Table 19 里 Gemma 的 HTML Task 在 GPT-5.5 judge 下却是 SFT 77.8 高于 RL 75.4，不能写成任何 judge 下每项 RL 都更好。</p>
<figure class="figure original"><a href="/lib/papers/prismacoder/figure-5.webp"><img src="/lib/papers/prismacoder/figure-5.webp" width="1655" height="355" loading="lazy" alt="论文 Figure 5：等量 SFT 数据中，逐项 rubric 筛选与整体打分筛选的八项基准分数"></a><figcaption>原论文 Figure 5：只比较等量 SFT 样本的筛选方式；Vega-Lite 为 48.5 → 72.6。Sun et al., v1，p.11，CC BY 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/prismacoder/figure-6.webp"><img src="/lib/papers/prismacoder/figure-6.webp" width="1655" height="573" loading="lazy" alt="论文 Figure 6：Gemma-4 与 Qwen3-VL 两个基座在 SFT 和 RL 各阶段的分数变化"></a><figcaption>原论文 Figure 6：两种额外基座的分阶段收益。右侧任务与具体 judge 条件须连同 Appendix H Table 19 阅读。Sun et al., v1，p.11，CC BY 4.0。</figcaption></figure>
<p>在人工一致性实验中，100 个 SFT 样本由 20 名标注者评价，三种模型判分器与人类评分的 Krippendorff α 从整体打分的 0.303–0.514，提高到 rubric 打分的 0.861–0.918；排序一致性 Kendall τ<sub>b</sub> 也从 0.282–0.442 到 0.643–0.670。不同模式下每名标注者看的样本不完全相同，实验比较的是两种判分方式与相应人类评分的一致性，不是给出了实际训练收益的因果证明。来源：§6.3、Appendix H.2、Table 20。</p>
<figure class="figure original"><a href="/lib/papers/prismacoder/figure-7.webp"><img src="/lib/papers/prismacoder/figure-7.webp" width="975" height="510" loading="lazy" alt="论文 Figure 7：三种模型判分器采用 rubric 后与人类评分的 alpha 和 Kendall tau 一致性变化"></a><figcaption>原论文 Figure 7：空心点为直接打分、实心点为 PrismaForge rubric。精确值见 Appendix H Table 20。Sun et al., v1，p.12，CC BY 4.0。</figcaption></figure>

<h2 id="discussion">5. Discussion：最值得补做的实验</h2>
<p><strong>应把教师答案、筛选器和 RL 奖励的贡献分开量。</strong>最直接的对照是固定相同种子、训练样本数与计算量，报告原始代码、Claude 重生成代码、Claude 扩增代码各占最终集多少；再分别拿掉 Claude 生成、逐项筛选和 rubric 奖励。这样才能回答“能力来自强教师代码，还是来自筛选与 RL”。当前 Figure 5 只隔离了 SFT 过滤方式。Appendix D 说明完整 GRPO 的 rubric 与直接打分对照因约 808K 次判分请求未做，仅 Python plotting 局部实验报告 ChartMimic +6.91 点；逐项判分的 API 成本约为只看视觉整体打分的两倍，网页任务还更贵。</p>
<p>另外，论文只用长 n-gram 指令重叠做去污染（Appendix A.3），不足以排除视觉上相似、文字不同的公开网页或图表。独立 judge、人工评审和完整数据来源账本都能增强结论。数据页与训练脚本的发布进度也需要继续核对：论文描述的是完整 2M 流程；页面当前展示的可下载行数与完整规模之间有差距，仓库 README 仍把完整管线列为待公开。</p>

<h2 id="conclusion">6. Conclusion：如何给这篇论文下准确判断</h2>
<p><strong>PrismaCoder 的方法主线是“种子 → 候选代码 → 执行产物 → 逐题分项判分 → SFT / RL”。</strong>它把代码里“写了什么”和最终图像里“看到了什么”分开检查，再把同一标准用于数据过滤和 RL 奖励。Claude Opus 4.6 的确参与了监督答案生成，所以宽义上存在蒸馏成分；论文没有证明学生单靠 rubric 就获得能力，也没有给出 Claude 生成比例或 logits 蒸馏。想复现时，还须等待完整合成与训练代码发布，并单独验证数据来源和判分器带来的偏差。</p>
<p class="source-note">取证范围：arXiv:2610.20538v1 全 38 页（含 Appendix A–I）、官方项目页、GitHub commit <code>666ab0cfb49ad3508e4e5575e29960dada090724</code> 和官方数据页。本文未重训模型。论文原图按作者在 arXiv 标注的 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> 许可引用；局部裁切仅用于 Table 4 页边，原英文、数值和编号保留。</p>
</div>

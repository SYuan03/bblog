---
title: "[2026-06-04] From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
permalink: "/posts/论文解读/harnessfix.html"
date: "2026-10-08T00:04:00+08:00"
updated: "2026-10-20T00:15:00+08:00"
cover: "/lib/papers/harnessfix/cover.svg"
description: "HarnessFix 先把失败记录对应到具体代码：哪些信息没传下去，程序为什么过早结束，再限制补丁可改的范围。本文用 AppWorld 支付请求解释完整诊断与验证过程，并核对四个 benchmark 的评分和证据缺口。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 10
categories:
  - "论文解读"
tags:
  - "Agent Harness"
  - "Coding Agent"
  - "Harness Engineering"
  - "Agent Learning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">arXiv:2606.06324v2 · 本文按 v2 解读；最早公开于 2026-06-04</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2606.06324">论文主页</a>
  <a href="https://arxiv.org/pdf/2606.06324v2">论文 PDF（v2）</a>
  <a href="https://github.com/HarnessFix/HarnessFix">官方代码</a>
</div>

<section class="deck-wrap" aria-label="From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harnessfix-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harnessfix-visual-guide.html" title="From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">一个支付工具返回“执行成功”，数据库却没有新增付款请求，Agent 随即宣布完成。该修提示、错误处理，还是结束条件？HarnessFix 把失败记录连到负责这些行为的代码，再让修复模型只改有证据指向的位置。论文的重点是把“任务没做成”变成可以验证的代码诊断。</p>

<aside class="part0"><span class="kicker">PART 0 · 先分清两种成功</span><h3>工具没抛异常，不代表任务状态变了</h3><p>Agent 的运行程序会调用模型、执行工具、保存反馈并决定何时结束。这层程序称为 harness。这里“执行成功”只描述一次调用正常返回；“任务成功”要由外部测试确认预期文件或应用状态已经改变。HarnessFix 修的是前一层如何传递证据和允许结束，不修改后者的任务答案或测试规则。</p></aside>
<div class="interest"><b>博客作者兴趣度 8.8 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>57,780</strong><span>开发记录</span></div>
  <div class="metric"><strong>26,174</strong><span>运行程序相关开发记录</span></div>
  <div class="metric"><strong>6.3–18.4</strong><span>GPT-5 mini 四环境提升的百分点</span></div>
  <div class="metric"><strong>85.0%</strong><span>责任步骤定位准确率</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>系统先整理每一步输入、输出、状态变化、执行决策和对应代码位置，再诊断原因。</li><li>固定 GPT-5 mini 时，四环境提升 6.3–18.4 个百分点；公开默认验收允许最多两道旧成功退化，不是零回归。</li><li>三人独立标注 80 条失败记录，评测责任步骤定位准确率为 85.0%；人工标注流程与一致性已公开。</li><li>尚缺逐条原始标签和完整开发记录，不能独立重算诊断分数；开发 token 统计也不包含收集轨迹的做题成本。</li></ul></aside>

<h2 id="1-研究问题：失败发生在哪一步，对应哪段代码">1. Motivation：失败发生在哪一步，对应哪段代码</h2>

<p><strong>最终失败分数没有标明出错步骤，也没有指明可修改代码。</strong>运行记录混着模型调用、工具返回、文件变化和是否重试的决策。直接把长日志交给编辑模型，可能得到大范围修改，却说不清它为什么能解决这类失败。</p><p>作者分析 30 个开源 Agent 的约 57,780 条 issue、PR、commit 和 release 记录，经模型分类与人工抽查保留 26,174 条运行程序相关记录，占 45.3%。ETCLOVG 是七类运行职责的简称：执行环境与隔离、工具接口、上下文与记忆、生命周期与调度、日志与可观察性、验证与评测、权限与安全。它用来组织可修范围，不是七个新模型（Table I）。</p>
<figure class="figure wide"><a href="/lib/papers/harnessfix/source-figure-1.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-1.png" width="1096" height="523" alt="Figure 1：开发记录中 45.3% 与 harness 相关；相关记录按七类职责分布" loading="lazy" decoding="async"></a><figcaption>Mengzhuo Chen 等，论文 Figure 1 原图（<a href="https://arxiv.org/abs/2606.06324v2">arXiv v2</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>）。左侧分母是 57,780 条开发记录；右侧只在 26,174 条相关记录中分类。</figcaption></figure>
<p>这个调查怎样变成可用的修复操作？固定仓库的 <code>docs/motivation_study.md</code> 给出过程：从四类任务中按 GitHub stars 选有可执行代码、公开历史的仓库，去重后得到 30 个系统。两名作者先看 100 条随机开发记录、形成判断标准；模型逐条分类并给证据，作者抽查后迭代提示。最后两人独立审计 300 条记录、第三人裁决分歧，报告 precision 97%、recall 94%：前者衡量判为相关的记录有多少真相关，后者衡量真实相关记录找回多少。作者再从 13,238 条关联了修复 commit/PR 的 issue 中归纳常见修改，形成 Table II 的修复操作。完整逐条数据和审计混淆矩阵未发布，这些百分比仍是作者报告。</p>

<h2 id="2-相关工作：在补丁搜索前增加有证据的诊断">2. Related Work：在补丁搜索前增加有证据的诊断</h2>

<p><strong>HarnessFix 在写补丁前，要求先指出失败步骤、对应代码和允许的修复。</strong>GEPA 主要改提示词；Meta-Harness 搜索候选程序。HarnessFix 增加一份可对应到实现的运行记录，让诊断模型回答：哪一步负责、哪个文件和函数实现它、违反哪类职责、允许怎样修。下一节的支付请求说明这份记录怎样构成，而不是只列出模块名。</p>
<div class="table-scroll"><table><thead><tr><th>对照</th><th>输入与产物</th><th>HarnessFix 增加的约束</th></tr></thead><tbody><tr><td>GEPA / SCOPE</td><td>任务得分、执行反思；修改提示</td><td>还能修改工具处理、程序控制与日志；具体到文件和行为</td></tr><tr><td>Meta-Harness</td><td>既有程序、得分、轨迹；搜索新程序</td><td>编辑前先形成责任步骤、代码定位和限定修复规范</td></tr><tr><td>失败归因 / AgentFixer</td><td>失败轨迹；定位原因或推荐修复</td><td>继续生成实现修改，并在独立验证题中检查后果</td></tr></tbody></table></div>

<h2 id="3-方法：从支付失败记录到限定范围的补丁">3. Method：从支付失败记录到限定范围的补丁</h2>

<p><strong>四个角色依次整理记录、诊断、写补丁和验证；前一个角色要给后一个留下可核对证据。</strong>整理角色把一次模型调用、工具动作或结束决策写成 <strong>TraceStep</strong>，记录输入、返回和真实外部变化。所有步骤加上跨步骤关系、代码位置后，形成 <strong>HTIR（Harness-aware Trace Intermediate Representation）</strong>，即“能把这次运行对应到 harness 实现的记录”。</p>
<figure class="figure wide"><a href="/lib/papers/harnessfix/source-figure-2.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-2-stages-1-2.png" width="1430" height="1052" alt="Figure 2 前半：将运行步骤整理为 HTIR，连接代码位置，诊断并归并缺陷" loading="lazy" decoding="async"></a><figcaption>论文 Figure 2 原图局部，Stage 1–2：整理运行记录、诊断并合并相同缺陷。点击查看完整原图。来源：Mengzhuo Chen 等，<a href="https://arxiv.org/abs/2606.06324v2">arXiv v2</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>；只做裁切。</figcaption></figure>
<figure class="figure wide"><a href="/lib/papers/harnessfix/source-figure-2.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-2-stages-3-4.png" width="1138" height="1052" alt="Figure 2 后半：限定补丁范围，在验证集检查并记录接受或拒绝" loading="lazy" decoding="async"></a><figcaption>同一 Figure 2 原图局部，Stage 3–4：限定修复、验证、记录接受或拒绝。两张局部按原图从左到右阅读。</figcaption></figure>
<details><summary>展开完整 Figure 2 原图</summary><figure class="figure wide"><a href="/lib/papers/harnessfix/source-figure-2.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-2.png" width="2988" height="1052" alt="Figure 2：从执行证据到 HTIR、诊断、限定修复与验证的完整流程" loading="lazy" decoding="async"></a><figcaption>Mengzhuo Chen 等，Figure 2 完整原图，<a href="https://arxiv.org/abs/2606.06324v2">arXiv v2</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。正文上方的两张局部便于逐阶段阅读。</figcaption></figure></details>

<div class="case"><h3>论文 Figure 3：请求分摊最近三笔 Amazon 订单费用</h3><ol><li>Agent 先读 <code>create_payment_request</code> 的文档，知道请求必须包含收款人的 <code>user_email</code>。这是步骤 S3。</li><li>Figure 3 的 S4 支付请求包含 <code>amount=117.6</code> 和说明，却没有 <code>user_email</code>。工具错误被运行程序捕获，外层仍返回成功状态；付款请求记录没有增加。</li><li>S5 没有暴露真实状态变化，S6 的结束检查只看成功状态，允许调用 <code>complete_task()</code>。任务因此未完成。</li><li>整理角色连起 S3 的必填字段与 S4 的缺失请求。这种说明信息如何进入下一次输入的关系叫 <strong>data-flow link</strong>。它还连起 S5 的返回状态与 S6 的提前结束，这种说明代码为何继续或终止的关系叫 <strong>control-flow link</strong>。</li><li>整理角色指出运行程序里负责允许结束的函数与文件。这个附带证据的代码定位叫 <strong>implementation anchor</strong>，不是凭任务失败猜一个文件名。</li><li>诊断角色回溯这些关系，确认请求构造遗漏、错误被吞掉和没有效果检查共同造成失败；相同原因的记录合并为一类问题。</li><li>修复角色只能改结束检查及执行结果记录，不能改任务数据、标签和 API。要求是暴露支付错误，并在完成前看到实际 <code>PaymentRequest</code> 变化。</li></ol><p>这是论文贯穿方法的说明案例。v2 公开了步骤、请求金额、缺失字段与修复要求，没有完整 task ID、所有收款人记录或修补后的逐条运行日志；不能写成“这道题已实测拿到 1 分”。</p></div>

<figure class="figure wide"><a href="/lib/papers/harnessfix/source-figure-3.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-3-steps-3-5.png" width="1430" height="528" alt="Figure 3 步骤 S3–S5：文档要求 user_email，117.6 的请求漏传该字段，API 错误被吞掉" loading="lazy" decoding="async"></a><figcaption>论文 Figure 3 原图局部，S3–S5：文档给出必填 <code>user_email</code>，请求却遗漏；图中的金额为 <code>117.6</code>。来源：Mengzhuo Chen 等，<a href="https://arxiv.org/abs/2606.06324v2">arXiv v2</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>；裁切并遮去左上角相邻 S2 的残边，S3–S5 内容未改。点击查看完整原图。</figcaption></figure>
<figure class="figure"><a href="/lib/papers/harnessfix/source-figure-3.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-3-steps-6-result.png" width="903" height="528" alt="Figure 3 步骤 S6 与评测结果：任务被宣布完成，但应有三条付款请求实际为零" loading="lazy" decoding="async"></a><figcaption>同一 Figure 3 原图局部，S6 与 evaluator：程序结束任务，评测发现预期 3 条付款请求、实际 0 条；这不是修补后 PASS 记录。</figcaption></figure>
<details><summary>展开完整 Figure 3 原图</summary><figure class="figure wide"><a href="/lib/papers/harnessfix/source-figure-3.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-figure-3.png" width="3008" height="528" alt="Figure 3：AppWorld 支付请求从查找室友到评分失败的六步完整案例" loading="lazy" decoding="async"></a><figcaption>Mengzhuo Chen 等，Figure 3 完整原图，<a href="https://arxiv.org/abs/2606.06324v2">arXiv v2</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。正文上方的局部保留了影响诊断的字段和评分结果。</figcaption></figure></details>

<p>论文自身的金额有一处不一致：§III-A 的结构化请求摘录写 <code>54.0</code>，Figure 3 原图写 <code>117.6</code>。上面的原图按 Figure 3 展示；两处共同的诊断证据是漏传 <code>user_email</code>、API 错误被吞掉，以及预期 3 条付款请求而实际为 0。论文没有给出可核对这一金额差异的完整执行日志。</p>

<p>系统把允许文件、禁止文件、目标问题和修改后必须满足的行为写进 <strong>repair specification</strong>，即当前补丁的范围和验收条件。验证角色先查代码改动是否越界、语法和静态检查能否通过，再在验证集上重跑：目标问题是否减少，原有成功是否被破坏。有效补丁及其证据保存在修复记录库（harness memory）中，供后续修复避免重复尝试（v2 §III-C/D）。</p>

<p><strong>公开验收脚本允许有限回归。</strong>固定版本 <code>check_val_gate.py</code> 默认要求净解决任务数至少增加 1，同时退化的旧成功任务最多 2 个；提供前后轨迹时，还要求目标行为指标至少一项改善、总变化不小于 0。比如旧成功集合是 <code>{A,B,C,D}</code>，新集合为 <code>{C,D,E,F,G}</code>，丢失 A/B 两题但净增一题，这层默认任务数量检查仍通过。这是假设算例，不是论文的实际候选。代码虽然有 <code>--max-cost-ratio</code> 参数，却明确将成本只作报告，不参与接受；这些是当前代码默认值，不能反推每个论文实验都用了同一命令。</p>



<h2 id="4-实验：任务成功率、诊断标注与关键消融">4. Experiments：任务成功率、诊断标注与关键消融</h2>

<p><strong>任务分数由上游 benchmark 的最终验收决定，诊断准确率另有人工标签。</strong>GAIA 的题目来自公开开发集；SWE 来自真实仓库修复题；AppWorld 用应用状态测试；Terminal-Bench 在容器中执行终端任务。作者分别从 166/500/750/89 题中抽取 150/250/225/85 题，再按 train/validation/test 拆成 <code>60/30/60</code>、<code>100/50/100</code>、<code>90/45/90</code>、<code>34/17/34</code>。搜索用训练与验证数据，主结果在固定 test split 统计任务完成率 TCR；表中分数是<strong>三次独立运行的算术平均</strong>，不是一次最好结果。</p>

<div class="formula">TCR = 完成该 benchmark 官方验收的任务次数 / 评测任务次数</div>

<p>诊断没有由任务测试自动生成的标准答案。作者在最终 harness 冻结后，从四基准各取 20 条初始程序失败轨迹，共 80 条；三名标注者独立读原轨迹、代码/提示、任务元数据和评测反馈，<strong>不看 HarnessFix 的预测诊断</strong>，标出责任步骤、原因、实现位置、职责层和修复范围，再裁决分歧。裁决后的标签称为 gold，只用于诊断评测，不用于修补或选版本。</p>
<p>仓库公开了标注流程与 Fleiss' kappa，即扣除偶然一致后的人际一致性：步骤 .76、原因 .74、代码位置 .73、职责层 .80、修复范围 .75。它们不是模型准确率。评测四种输入表示时，诊断模型相同，只有输入表示改变；原日志的责任步骤准确率 55.0%，加数据关系 70.0%，再加控制关系 77.5%，完整 HTIR 为 85.0%。尚缺 80 条轨迹 ID、逐人标签、裁决后的每行 gold 和预测，不能独立重算这些结果，但不能说人数和一致性没有公开。</p>

<p><strong>固定 GPT-5 mini 时，HarnessFix 在 GAIA、SWE、AppWorld、Terminal-Bench 2.0 分别把初始 harness 从 43.3→61.7、45.3→57.3、36.7→43.0、17.6→26.5。</strong>对应提升 18.4/12.0/6.3/8.9 个百分点。论文摘要的 6.3–18.4 是这个默认模型范围；Table III 的五模型结果还包含 DeepSeek/AppWorld 的 5.9。相对 Meta-Harness，四基准分别高 5.0/2.6/2.6/3.0 个百分点。</p>
<div class="table-scroll"><table><thead><tr><th>GPT-5 mini · Table IV</th><th>GAIA</th><th>SWE</th><th>AppWorld</th><th>Terminal</th></tr></thead><tbody><tr><td>原程序</td><td>43.3</td><td>45.3</td><td>36.7</td><td>17.6</td></tr><tr><td>Meta-Harness</td><td>56.7</td><td>54.7</td><td>40.4</td><td>23.5</td></tr><tr><td>HarnessFix</td><td>61.7</td><td>57.3</td><td>43.0</td><td>26.5</td></tr><tr><td>Meta-Harness 开发 token · 百万</td><td>94.2</td><td>82.9</td><td>74.6</td><td>66.8</td></tr><tr><td>HarnessFix 开发 token · 百万</td><td>57.6</td><td>48.9</td><td>37.2</td><td>33.5</td></tr></tbody></table></div>
<p>Meta-Harness 在这套统计下多用 63.5%–100.5% 的 token；<strong>仅统计离线演化/修复，排除收集轨迹的做题 token</strong>，不等于总体部署或研究成本减少相同比例。默认 task/repair 模型均为 GPT-5 mini，temperature=1、medium reasoning。最大回合、工具、总搜索成本不能只从这张表推断。</p><p>对照人工标签，完整 HTIR 的原因准确率为 83.8%、代码定位为 81.3%、操作选择为 82.5%。职责层 macro-F1 为 86.2%：先算各类 F1 再等权平均。GAIA 迁移实验<strong>直接复用 GPT-5 mini 修好的同一个 harness</strong>，不对目标模型重新诊断；四模型提升 5.5–9.5 个百分点，明显低于为它们专门修程序的 Table III，不能混成同一结果。</p><p>论文报告单侧配对符号检验 p 值为 2.4×10⁻⁴ 到 4.9×10⁻⁴。逐题重复输出未完整公开，因此本文未重算该检验，也不将跨论文的步骤定位分数当成同一测试集的直接比较。</p>

<figure class="figure wide"><a href="/lib/papers/harnessfix/source-table-vi.png" target="_blank" rel="noopener"><img src="/lib/papers/harnessfix/source-table-vi.png" width="1012" height="376" alt="原论文 Table VI：四个 benchmark 中完整 HarnessFix 与四种消融的完成率" loading="lazy" decoding="async"></a><figcaption>Mengzhuo Chen 等，论文 Table VI 原表（<a href="https://arxiv.org/pdf/2606.06324v2">PDF v2，第 9 页</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>）；仅从原页裁出表格。完整系统在四个 benchmark 均高于各项消融，表内数字单位为任务完成率百分比。</figcaption></figure>

<p><strong>只改提示词达不到完整方法的收益。</strong>Table VI 中，GAIA 只修提示词的成功率为 50.6%，完整系统为 61.7%；去掉有运行证据的诊断后为 51.1%，去掉限定修复操作后为 50.6%，去掉回归验收后为 55.6%。这些都是在原起点 43.3% 上比较，说明结构化诊断和候选筛选都参与增益；没有证据支持某一个模块独占全部效果。</p>

<h2 id="5-后续验证：公开诊断标注和失败补丁">5. Discussion：公开诊断标注和失败补丁</h2>

<p><strong>下一步应公开逐条数据，使已经公布的标注流程可复算。</strong>固定仓库 <code>9167a0b9a58748c73b56c3ee04fdc3437ba0c56e</code> 有分类、审计与诊断标注说明，但没有足够的记录 ID、模型判断、逐人标签和裁决数据。还需要原始/候选程序、失败补丁、依赖与运行输出，分别复跑“定位对了”与“任务提高了”。比较诊断方法时还应保持同模型、同 token 和同检索内容预算，区分显式关系结构的作用与额外输入信息的作用。</p>

<h2 id="6-小结：把运行事实连到可改代码">6. Conclusion：把运行事实连到可改代码</h2>

<p><strong>HarnessFix 最值得复用的要求是：补丁必须说明哪个运行事实对应哪段可改代码。</strong>四个 benchmark 都有提升，单独修改提示又明显弱于完整方法。官方已经公开开发记录的筛选与人工标注流程；尚缺逐条记录 ID、标注标签和预测行，外部读者仍无法重算全部诊断指标。</p><div class="limit-grid"><div><b>方法特点</b><span>信息传递、执行决策与代码位置共同约束修改。</span></div><div><b>实验结果</b><span>四任务均高于初始程序，同一 GAIA 补丁跨模型有收益。</span></div><div><b>证据边界</b><span>标注流程已公开，逐行 gold 与预测仍未齐备。</span></div><div><b>适合读者</b><span>研究 Agent 运行诊断和补丁验收的读者。</span></div></div>

<p class="source-note">本文方法和结果按 arXiv:2606.06324v2 的 Figure 3、§III–V、Tables III–VI 核查；最早日期另取 v1 元数据。代码固定版本为 9167a0b9a58748c73b56c3ee04fdc3437ba0c56e。论文中的案例是方法说明，不是公开的完整逐题 checker 记录。</p>

</div>

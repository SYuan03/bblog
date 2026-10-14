---
title: "[2026-08-06] HarnessOpt-Bench: Evaluating LLMs at Harness Optimization"
permalink: "/posts/论文解读/harnessopt-bench.html"
date: "2026-10-08T00:01:00+08:00"
updated: "2026-10-14T12:00:00+08:00"
cover: "/lib/papers/harnessopt-bench/cover.svg"
description: "固定被修改的 Agent、它调用的模型和评分规则，让不同模型在有限试验额度内改进同一套程序。本文拆解开发与隐藏测试、真实预算记录、增益计算及 111 次完整实验的结果与局限。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 11
categories:
  - "论文解读"
tags:
  - "Agent Harness"
  - "Coding Agent"
  - "Harness Engineering"
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">arXiv:2608.06301v1 · 最早公开于 2026-08-06</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.06301">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.06301">论文 PDF</a>
  <a href="https://github.com/scaleapi/vero/tree/d1400011917ff66b7c122e7a787d547372f43e97/harness-opt-bench">公开程序与分区</a>
  <a href="https://scale.com/research">Scale Research</a>
</div>

<section class="deck-wrap" aria-label="HarnessOpt-Bench: Evaluating LLMs at Harness Optimization 交互图解">
  <div class="deck-head"><strong>11 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harnessopt-bench-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harnessopt-bench-visual-guide.html" title="HarnessOpt-Bench: Evaluating LLMs at Harness Optimization 论文图解，共 11 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">让模型修改 Agent 程序，不能只看它改了多少行代码。HarnessOpt-Bench 固定初始程序、做题模型、运行环境和评分规则，让不同模型在有限试验额度内修改同一个起点。开发题可以查失败记录，验证题只返回总分，最终测试完全隐藏。<strong>要比较的是谁更会改程序，而不是谁换了更强的做题模型。</strong></p>

<aside class="part0"><span class="kicker">PART 0 · 外层修改者与内层做题者</span><h3>两层 Agent 的程序与预算分开</h3><p>外层负责读代码、提交修改、选择最终版本的模型叫 <strong>optimizer</strong>。它在 Claude Code、Codex 或 OpenCode 中开发。内层被修改的 Agent 叫 <strong>target agent</strong>，最终由固定的 <strong>target model</strong> 做题。内层模型的工具、提示词、历史处理和结束流程合起来就是待优化的 <strong>harness</strong>，外层开发工具不属于这份交付物。</p><p>一次评测 API 调用可以跑一道题，也可以跑整个分区。作者因此同时限制“调用次数”和“实际跑过多少道题”。把一个分区所有题各跑一次叫 <strong>full case pass</strong>；这是执行成本单位，不是调用次数。</p></aside>
<div class="interest"><b>博客作者兴趣度 9.4 / 10</b><span>仅表示博客作者本人对这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>111</strong><span>有正式分数的优化实验</span></div>
  <div class="metric"><strong>0.142 / 0.079</strong><span>换优化模型 / 换外层工具的平均增益变化</span></div>
  <div class="metric"><strong>11 : 9</strong><span>公共工具 / 原生工具胜出次数</span></div>
  <div class="metric"><strong>82%</strong><span>题目执行额度消耗的中位数</span></div>
</div>
<aside class="keypoints"><h3>先抓住四点</h3><ul><li>待修改的初始程序、做题模型、环境和评分器不变；optimizer 只能改 harness，不能换这些条件。</li><li>开发区给逐题结果与轨迹，验证区只给总分，测试区在最终版本选定前完全不可见。</li><li>每种优化配置只独立跑两轮。论文还给出任务专用的评测噪声阈值，小于阈值的差别不应排名。</li><li>论文对 API 上限同时写了 100 与 200 次，存在未解释的冲突；更稳定的预算事实是开发、验证各四次全量题目额度。</li></ul></aside>

<h2 id="为什么修改-Agent-程序需要单独评测">1. Motivation：为什么修改 Agent 程序需要单独评测</h2>

<p><strong>harness 修改是否有用，要通过昂贵、带随机性的任务执行来估计。</strong>软件补丁可以用测试检查；Agent 的提示词、历史压缩或退出逻辑改变后，往往要用固定模型跑许多题，才知道它是稳定进步还是一次幸运运行。</p>
<p>因此 optimizer 不只需要写代码，还需要决定查哪些失败、测试哪些候选、花多少预算，以及最终选哪一版。若不同研究各用不同的初始程序、模型、信息接口和预算，成绩混在一起，无法判断方法差别来自哪里。</p>
<p>本 benchmark 固定四项：初始 harness、target model、环境，以及来源 benchmark 的评分器（verifier）。这样，程序优化造成的变化才不会与换模型或更换判分规则混淆。作者研究三个问题：前沿模型是否能区分开，当前优化者在哪里失败，以及外层开发工具对结果影响多大。</p>

<h2 id="相邻工作：优化方法与统一赛道的区别">2. Related Work：优化方法与统一赛道的区别</h2>

<p><strong>VeRO 提供实验设施，Meta-Harness 提出搜索方式，本论文规定一组统一的优化任务。</strong>它不提出新的训练算法或固定搜索算法；只要系统能在同样的信息与预算边界内编辑程序、选定版本，就可以参加。</p>
<div class="table-scroll"><table><thead><tr><th>工作</th><th>修改范围 / 模型角色</th><th>反馈与交付</th><th>此处的区别</th></tr></thead><tbody>
<tr><td>DSPy / GEPA</td><td>优化声明式 LM 程序或可用文字表示的组件，模型参与提出候选</td><td>任务分数、反思反馈 → 更新后的组件</td><td>这里把整个可执行 harness 作为交付物，另外固定代码版本、预算与隐藏测试接口；不能把这些方法一概称为“只能改 prompt”</td></tr>
<tr><td>ADAS / AFlow</td><td>搜索代码表示的 Agent 或工作流</td><td>由外部搜索程序管理候选、评测、选择</td><td>模型常是搜索过程中的一环，不一定自己分配完整优化预算</td></tr>
<tr><td>VeRO</td><td>允许 coding agent 修改目标程序</td><td>版本、预算控制、结构化执行记录</td><td>为受控优化提供设施，本 benchmark 在其上固定任务集</td></tr>
<tr><td>Meta-Harness</td><td>开发者读取历史代码、分数与轨迹，提出下一候选</td><td>完整优化算法 → 最终 harness</td><td>这里比较算法或模型时，起点、预算和测试接口统一</td></tr>
<tr><td>SWE-bench 等软件修复评测</td><td>改任务仓库里的软件补丁</td><td>原生软件测试 → PASS/FAIL</td><td>这里改的是做题的系统，效果由多次随机执行的平均成绩衡量</td></tr>
</tbody></table></div>
<p>四项任务为 OfficeQA、BrowseComp-Plus、Terminal-Bench 2.0 和 GAIA。前三项从能运行但未经优化的程序开始；GAIA 从不会做任务的代码占位开始。后者测“造出可用 Agent”的成分更大，不能无条件并入前三项的优化排名。</p>

<h2 id="一次优化实验：可见信息、预算和最终得分">3. Benchmark / Protocol：一次优化实验：可见信息、预算和最终得分</h2>

<p><strong>optimizer 可以反复测试开发与验证题，却只能在最终选定版本后接受隐藏测试。</strong>先看起点与任务来源，再沿着一次代码提交走到分数。</p>

<h3 id="固定任务与初始程序">3.1 固定任务与初始程序</h3>

<p>作者沿用四个 benchmark 的任务和判断方式，再固定分区、初始 harness、target model 与评测服务。它没有重新标注一套独立题库，也没有报告新一轮标注者一致性。<strong>公开 release 在 VeRO 仓库内</strong>：各任务的初始程序、分区清单、构建配置和公共评测服务可核对；较大的原始任务数据需要另行下载。下面的成绩来自论文 v1，代码说明固定在 <code>d140001…</code>，不能把当前 release 当作论文原始实验的完整运行档案。</p>
<div class="table-scroll"><table><thead><tr><th>任务</th><th>固定 target model</th><th>dev / val / test</th><th>初始 test 分数</th></tr></thead><tbody>
<tr><td>OfficeQA</td><td>DeepSeek V4 Flash</td><td>49 / 98 / 99</td><td>0.341 ± 0.023</td></tr>
<tr><td>BrowseComp-Plus</td><td>DeepSeek V4 Flash</td><td>33 / 66 / 66</td><td>0.462 ± 0.020</td></tr>
<tr><td>Terminal-Bench 2.0</td><td>Grok Build</td><td>17 / 36 / 36</td><td>0.241 ± 0.009</td></tr>
<tr><td>GAIA</td><td>GPT-5.4 mini</td><td>33 / 66 / 66</td><td>0，只写空答案的占位程序</td></tr>
</tbody></table></div>
<p>数值来自 Appendix Table 3。这里的 <strong>± 是三轮测试平均分的标准误</strong>：每轮先在整个测试区计算均分，再取这三个均分的样本标准差，除以 <code>√3</code>。它描述重复运行造成的波动，不是题目之间的得分差异，也不是下文用于判断胜负的 resolution band，更不是置信区间。当前配置则记录三轮均分的<strong>标准差</strong>；OfficeQA 还重新测定过初始分为 0.3412，三个均分为 0.354/0.296/0.374、SD 约 0.033。两份材料的数值和统计单位都不同，不宜直接替换或靠乘除 <code>√3</code> 强行对齐。</p>
<p>OfficeQA 当前初始程序给内层模型三个工具：<code>run_shell</code> 在 <code>/app</code> 运行命令，<code>read_image</code> 读取环境内图片，<code>submit_answer</code> 把最终字符串写入 <code>/app/answer.txt</code> 并结束。模型最多执行 24 轮决策；过长工具输出只保留头尾各 10,000 个字符。这些是可直接修改的程序部件，而做题模型 DeepSeek V4 Flash 不可替换。</p>
<p>GAIA 尤其容易用错起点。论文的 <code>target-shell</code> 能启动和结束，但<strong>不调用模型，只写空答案</strong>，所以得零分。当前仓库另有完整工具版 <code>target</code>，其初始成绩约 0.621 ± 0.052（SD）；它不是论文的零起点。论文使用 Terminal-Bench 2.0，当前 release 标为 2.1，也需要分别注明。</p>

<h3 id="开发区能查什么，验证区和测试区藏什么">3.2 开发区能查什么，验证区和测试区藏什么</h3>

<div class="table-scroll"><table><thead><tr><th>分区</th><th>返回给 optimizer</th><th>不返回什么</th></tr></thead><tbody>
<tr><td>dev</td><td>题目、逐题得分、执行轨迹</td><td>不能修改 task data、模型、环境或评分器</td></tr>
<tr><td>validation</td><td>所选题目的汇总分；当前代码要求一次至少选 5 题</td><td>逐题输出与完整轨迹</td></tr>
<tr><td>test</td><td>搜索期间没有任何结果</td><td>测试题、答案和测试分数，均在可信服务侧隔离</td></tr>
</tbody></table></div>
<p>optimizer 只能写目标 harness。所有模型调用经网关限制可用模型和额度；目标 Agent 在临时、非特权沙箱中执行。测试数据、凭证与预算管理不在 optimizer 的文件系统里，所以“不能偷看 test”由环境强制，不只是一句提示。</p>
<p>公开仓库能列出分区文件，不代表参加实验的 optimizer 被允许读 test。研究者下载 release，与 optimizer 在受限文件系统中搜索，是两种不同的信息权限。</p>
<p><strong>预算要区分两层。</strong>目标模型执行 token（模型处理的文本单位）有上限；optimizer 自己的推理 token 被记录但没有封顶。开发、验证分别最多四次 full case pass；选子集时按实际题数扣额度。API 调用次数的上限在 §3.1 写为每分区 100 次，在 §5.3 写为 200 次，§5.3 所写“8 次等于 4%”与 200 一致；Figure 15 展示的是预算比例中位数。当前 release 使用开发 100 次、验证 100 次，但这不能反推原始实验究竟按哪个数执行。当前 optimizer 还有 20 小时运行上限，沙箱最多 24 小时、空闲最多 1 小时；“optimizer token 不封顶”也不等于所有资源无限或各配置总算力相同。</p>

<figure class="figure wide"><a href="/lib/papers/harnessopt-bench/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/harnessopt-bench/body-method.svg" width="1000" height="990" alt="固定初始 harness、开发反馈、验证总分和不可见测试的执行路径"></a><figcaption>根据论文 Figure 1、Algorithm 1 与 §3 整理。开发轨迹支持定位问题，验证总分支持选择候选，最终测试由独立服务执行。</figcaption></figure>

<h3 id="提交代码后，如何得到一个增益">3.3 提交代码后，如何得到一个增益</h3>

<ol class="steps"><li><b>选择版本</b><span>optimizer 从自己保存的候选 commit 中指定一个最终 harness。</span></li><li><b>独立做题</b><span>可信服务使用固定 target model，在隔离环境中对每道测试题运行这份冻结代码。</span></li><li><b>原生判分</b><span>来源 benchmark 的 verifier 将实际执行与交付物变成 0–1 分，不能用目标 Agent 自报成功替代。</span></li><li><b>重复并汇总</b><span>初始程序与最终候选分别对每道 test 题跑三次，平均得到测试成绩 E(H₀) 与 E(H⁺)。</span></li></ol>
<p>搜索时每题只做一次；最终 test 每题做三次取均值。当前服务优先采用显式提交的版本；若没有提交，重测验证成绩最好的前三个合格候选再选；仍无法选择时，退回<strong>最近一次实际测过的候选</strong>，不是当前目录里尚未评测的最后修改。候选代码自身失败记零；基础设施错误按重试与排除规则处理。错误比例达到 <code>0.1</code> 时当前实现会把评测标为 INVALID，即 <code>≥10%</code>，配置说明的“超过 10%”不够精确。</p>
<p>各任务也不是统一做字符串精确匹配。OfficeQA 使用数值/文本规则；BrowseComp-Plus 当前用 <code>gpt-4.1</code> 判断提交答案和隐藏标准答案是否语义一致。后者会把问题、答案前 100,000 字符及标准答案交给 judge，解析 <code>correct: yes/no</code>；缺答案、空答案、judge 请求失败或无法解析均给零。评测模型不参与优化，但它的误判仍可能影响最终分数。</p>
<div class="formula">g = (E(H⁺) − E(H₀)) / (1 − E(H₀))</div>
<p><code>g</code> 是“拿回了初始程序剩余提升空间的多少”，论文称为 <strong>normalized gain</strong>。初始 0.4、改后 0.55，则 <code>g=(0.55−0.4)/0.6=0.25</code>。负数就是改差了。GAIA 初始为零，分母为一，因此它的 gain 就是最终测试原分，和另外三项不同。</p>
<p>每种 optimizer 配置独立优化两轮，表里报告两轮均值和 min–max。这两次优化重复，与每道测试题的三次做题重复不是一回事；两轮范围不是误差置信区间。</p>

<h3 id="真实记录：一次-API-请求究竟花了多少额度">3.4 真实记录：一次 API 请求究竟花了多少额度</h3>

<div class="case"><h3>OfficeQA 的完整分区执行与论文预算统计</h3><p>预算记录来自论文 Table 3、§5.3 与 Figure 15。</p><ol><li>OfficeQA 开发区 49 题，验证区 98 题。每区四次全量额度，分别允许累计执行 <code>49×4=196</code> 和 <code>98×4=392</code> 题次。</li><li>optimizer 若一次请求跑完 98 道验证题，API 只扣一次调用，验证题次却扣 98，即四分之一额度。连续请求四遍，只有四次 API 调用，却耗尽验证题次。</li><li>论文观察到 API 调用中位数仅为 8，但题目额度消耗中位数是 82%；预算统计覆盖的 100 个实验单元中，55 个耗尽至少一个分区的题次。</li></ol><p>55/100 的预算统计与 111 次总有分数实验不是相同分母。以下单题例子再说明每个题次里究竟判什么。</p></div>
<figure class="figure wide"><a href="/lib/papers/harnessopt-bench/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/harnessopt-bench/body-case.svg" width="1000" height="810" alt="少量 API 调用可以跑完整个分区并消耗大量题次"></a><figcaption>根据 §5.3 与 Figure 15 的预算记录整理：调用次数与题次不是同一种资源，82% 是消耗中位数。API 上限的 100/200 冲突见正文，不将图中的百分比作为独立复现证据。</figcaption></figure>

<h3 id="真实任务-UID0185：查表、回归、写答案，最后检查什么">3.5 真实任务 UID0185：查表、回归、写答案，最后检查什么</h3>

<div class="case"><p>这是 release 开发分区实际列出的 <code>officeqa-uid0185</code>。题面和标准答案由 OfficeQA/Harbor 任务包提供，不是被测 Agent 生成；但这些文件没有逐题标注者或复核人员名单，不能据此声称经过几轮人工标注。本文核对的是 Harbor 数据仓库固定版本 <code>37db108…</code>；没有把它和论文原始打包任务的整体哈希对齐，所以它是<strong>当前可核对的同 ID 公开任务，不是论文某次模型成功日志</strong>。</p><ol><li>Agent 看到题面和 <code>/app/corpus/</code> 中 697 份财政公报解析文本。题面要求找 1989 年 7 月至 1993 年 6 月的 48 个“月末联邦证券总额”，按四个年度各加 12 个月，再对年度与年度总和做线性回归，预测 1995 年总和，除以 12、四舍五入为整数。这里按题面指定的 July–June 分组，不应把它解释成美国实际财政年度的一般定义。</li><li>公开标准答案配置列出四份依据文件：<code>treasury_bulletin_1990_09.txt</code> 至 <code>1993_09.txt</code>；Agent 要自己检索与取数，题面没有直接送出这些定位或答案。它可以写分析程序，但最终交付必须是 <code>/app/answer.txt</code>，例如调用 <code>submit_answer({"answer":"4990256"})</code>。这条调用用于说明接口，不是已观测的模型动作。</li><li>检查阶段读取隐藏的 <code>/tests/config.json</code>：标准答案为 <code>4990256</code>，容许相对误差为 <code>0.01</code>。<code>evaluate.py</code> 先查答案文件存在且非空，再调用 <code>score_answer</code>；对本题的无单位纯数字答案，PASS 条件就是 <code>|预测−4990256| / 4990256 ≤ 0.01</code>。</li><li>直接运行该版本的官方 <code>reward.py</code>，<code>4990256</code> 和 <code>5040158</code> 得 1；<code>5040159</code> 得 0，因为它相差 49,903，略超过容许的 49,902.56。若忘记除以 12，写成 <code>59883072</code>，也得 0。这些是本文构造的输入与检查结果，不是原论文模型失败轨迹。</li></ol><p>这个 verifier 不查看 48 个数有没有找对，也不审计回归代码。更完整的数值解析还允许从带说明的回答中找到接近标准答案的数字，因此“按题面要求输出”和“被规则判为正确”也不完全等价。原始逐月取数、回归系数和实际模型执行日志未随这个任务文件提供，本文不编造中间表格。</p></div>
<figure class="figure wide"><a href="/lib/papers/harnessopt-bench/officeqa-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/harnessopt-bench/officeqa-real-case.svg" width="1000" height="810" alt="OfficeQA UID0185 的可见资料、隐藏答案和 1% 数值误差判分"></a><figcaption>根据 VeRO 开发分区与 Harbor <code>officeqa-uid0185</code> 的 <code>instruction.md</code>、<code>config.json</code>、<code>evaluate.py</code>、<code>reward.py</code> 整理。纯数字 PASS/FAIL 已用官方函数检查；不代表复现论文模型成绩。</figcaption></figure>
<p class="source-note">可逐行核对：<a href="https://github.com/harbor-framework/harbor-datasets/blob/37db108843a49bb31a592e37a75e2c40dc3f9749/datasets/officeqa/officeqa-uid0185/instruction.md">真实题面</a>、<a href="https://github.com/harbor-framework/harbor-datasets/blob/37db108843a49bb31a592e37a75e2c40dc3f9749/datasets/officeqa/officeqa-uid0185/tests/evaluate.py">执行入口</a>、<a href="https://github.com/harbor-framework/harbor-datasets/blob/37db108843a49bb31a592e37a75e2c40dc3f9749/datasets/officeqa/officeqa-uid0185/tests/reward.py">答案检查函数</a>。</p>

<h2 id="实验：谁更会改，以及哪些结论不能排名">4. Experiments：谁更会改，以及哪些结论不能排名</h2>

<p><strong>优化模型的差别比外层工具的平均差别大，但没有一套工具对所有模型都更好。</strong>主实验为五个模型：Claude Opus 5、Sonnet 5、GPT-5.6 Sol、GPT-5.6 Terra、Kimi K3。每个都在公共 OpenCode 和自己的原生工具下运行；另有 GAIA 扩展工具以及 OfficeQA 的旧模型版本系列，总计 111 次有正式得分的优化实验。</p>

<h3 id="先看噪声尺度，再看胜负">4.1 先看噪声尺度，再看胜负</h3>

<p>作者将同一候选在相同题上评分两遍，取两遍差异的中位数，并换算到三次测试重复的 gain 尺度，得到 <strong>resolution band</strong>：小于它的差别视为无法区分。四项分别是 OfficeQA ±0.045、BrowseComp ±0.066、Terminal ±0.054、GAIA ±0.035。它是描述性的分辨阈值，不是统计显著性检验或置信区间。</p>
<div class="table-scroll"><table><thead><tr><th>模型 / 外层工具</th><th>OfficeQA</th><th>BrowseComp</th><th>Terminal</th><th>GAIA</th></tr></thead><tbody>
<tr><td>Opus 5 / OpenCode</td><td>0.63</td><td>0.48</td><td>0.29</td><td>0.47</td></tr>
<tr><td>Opus 5 / Claude Code</td><td>0.59</td><td>0.41</td><td>0.18</td><td>0.42</td></tr>
<tr><td>GPT-5.6 Sol / Codex</td><td>0.49</td><td>0.03</td><td>0.12</td><td>0.49</td></tr>
<tr><td>GPT-5.6 Sol / OpenCode</td><td>0.29</td><td>0.09</td><td>0.13</td><td>0.31</td></tr>
<tr><td>Kimi K3 / Kimi CLI</td><td>0.59</td><td>0.23</td><td>0.16</td><td>0.31</td></tr>
<tr><td>Kimi K3 / OpenCode</td><td>0.41</td><td>0.16</td><td>0.12</td><td>0.28</td></tr>
</tbody></table></div>
<p>这是 Table 1 的部分均值，均为 normalized gain。Opus 的 OfficeQA <code>0.63−0.59=0.04</code> 小于 0.045 的阈值，不能说 OpenCode 在这项已可靠胜过 Claude Code。Sol 的 OfficeQA <code>0.49−0.29=0.20</code> 与 GAIA <code>0.49−0.31=0.18</code> 则明显超过各自阈值，但仍只来自两轮优化，不等于跨任务普遍优势。</p>
<p>把一个真实报告数换回原分，更容易理解：OfficeQA 初始为 0.341，Opus/OpenCode gain 约 0.63，所以改后的两轮平均测试分约为 <code>0.341+0.63×(1−0.341)=0.756</code>。这是根据四舍五入的报告值计算的约数，不是论文另报的一次测试准确率，更不是 63% 的题通过。</p>

<figure class="figure wide"><a href="/lib/papers/harnessopt-bench/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/harnessopt-bench/body-results.svg" width="1000" height="885" alt="HarnessOpt-Bench 固定模型和工具条件下的主结果与预算分母"></a><figcaption>根据 Tables 1–3 与 §§5.1–5.4 整理。表中增益以初始程序剩余空间归一化；解释胜负时还要看每项 resolution band 和两次优化的范围。</figcaption></figure>

<h3 id="模型、工具与失败诊断">4.2 模型、工具与失败诊断</h3>

<p>在固定任务与外层工具的配对比较里，更换 optimizer model 导致 gain 平均变化 0.142；固定模型而更换工具，平均变化 0.079，约小 1.8 倍。这是配对差异的描述统计，不是“模型解释了 14.2% 方差”。</p>
<p>20 个“模型 × 任务”配对中，公共 OpenCode 赢 11 个、原生工具赢 9 个；其中只有 11 个配对的差异超过任务专用阈值。GAIA 加入 Goose 与 mini-swe-agent 后，工具排名还会随模型改变。结果支持“需要测模型与工具的组合”，不支持“公共工具已普遍取代原生工具”。</p>
<p>论文另外计算一个跨任务平均值 λ：每个模型先取三项有完整初始程序任务的平均 gain，再减去所有模型的总均值。只用共同 OpenCode 条件，排除零起点 GAIA 和原生工具，才让这项“模型相对水平”保持一致比较对象；不能拿它代替包含全部配置的总榜。</p>
<p>作者还记录搜索过程。修改覆盖的八类部件越广，与 gain 的相关性通常越高，但覆盖面和总修改量混在一起；有配置改了七次、触及四分之三部件，最终仍提交初始程序。不能把这个相关性读成“改得越多越好”。</p>
<p>111 个有分数实验中，只有 7 个主动请求过详细轨迹，共 16 次；轨迹读取没有显示正向收益。这说明当前优化者很少有效使用这类反馈，或逐题分数已经足够定位部分问题，不能证明轨迹无用。可见验证最高分通常还高于最后测试分；论文不能区分这是反复选择造成的过拟合，还是验证与测试分布不同。</p>

<h2 id="下一步：更可靠的优化评测应补什么">5. Discussion：更可靠的优化评测应补什么</h2>

<p><strong>最需要补的是原始执行记录、更多重复，以及初始程序强度的控制。</strong>程序、分区和公共服务已经公开，下一步应把论文各次实验对应的任务哈希、最终 commit、轨迹和配置关联起来，并解释 100/200 次上限冲突。尤其是当前 Terminal 版本、GAIA 起点与初始分重新测定，不能悄悄代替论文 v1 的条件。</p>
<p>其次，把外层推理成本也纳入同条件比较，增加 optimizer 独立重复，才知道收益是否值得其试验成本。每题三次运行能缓解目标 Agent 的随机性，却不能消除两轮优化选择的方差。</p>
<p>第三，系统改变初始程序的完整度：空占位、能运行但朴素、成熟 Agent 应分别报告，避免把构建能力与精修能力合成一个名次。最后，在不同 target model、工具行为和评分器实现上重放最终修改，检查它是否只适应固定评测的细节。这些是可信的下一步，不是本文已有验证结果。</p>

<h2 id="总结：借鉴控制设计，保留复现与统计边界">6. Conclusion：借鉴控制设计，保留复现与统计边界</h2>

<p><strong>这篇适合学习如何把“改 Agent 程序”变成受控实验。</strong>它固定内层模型和任务环境，分开开发诊断、验证选择和隐藏测试，也把 API 次数与实际题次拆开，避免不同实验因反馈更多或模型更强而不可比。</p>
<p>前沿模型已经能改善弱起点，但收益随任务、模型和外层工具而变；微小差异不能细排名。最强限制是每配置只有两轮优化、GAIA 与其他三项起点不同、外层推理 token 未封顶、预算上限存在文本冲突，以及当前 release 与论文原始运行条件并不完全相同。</p>
<p class="source-note">主要来源：arXiv:2608.06301v1，§§3–5、Algorithm 1、Tables 1–3、Figures 1/13/15；VeRO <code>d1400011917ff66b7c122e7a787d547372f43e97</code> 的 HarnessOpt-Bench release；Harbor 数据 <code>37db108843a49bb31a592e37a75e2c40dc3f9749</code> 的 UID0185。公开文件于 2026-10-14 核对；本文只复核了案例的判分函数，没有独立跑 111 次优化实验。</p>

</div>

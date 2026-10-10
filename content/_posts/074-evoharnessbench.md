---
title: "[2026-09-03] EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness?"
permalink: "/posts/论文解读/evoharnessbench.html"
date: "2026-10-08T00:08:00+08:00"
updated: "2026-10-11T02:10:00+08:00"
cover: "/lib/papers/evoharnessbench/cover.svg"
description: "EvoHarnessBench 让外部平台分阶段增加 tools、skills 与 specialist agents，测试部署退化、持久适应、forward transfer 与 forgetting。本文明确它与 harness coding 的边界，并拆解 17 条 streams、802 个任务与三条演化轴。"
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
  - "Benchmark"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css">

<div class="paper-reading">

<p class="paper-meta">arXiv:2609.04280v1 · 最早公开于 2026-09-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.04280">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.04280">论文 PDF</a>
  <a href="https://mas-orchestra.salesforceresearch.ai/evoharness/">项目页</a>
</div>

<section class="deck-wrap" aria-label="EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness? 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/evoharnessbench-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/evoharnessbench-visual-guide.html" title="EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness? 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">EvoHarnessBench 研究的是另一种变化：Agent 不改外部 harness，平台却会分阶段加入新工具、新 skill 或 specialist agent。每道旧题在后续阶段保持不变，唯一变化是可选能力越来越多。benchmark 由 17 条演化序列、802 个不重复任务组成，用来观察新能力加入后旧题是否退化，以及系统能否利用刚出现的能力解决新题。</p>
<div class="interest"><b>博客作者兴趣度 7.8 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>17</strong><span>evolution streams</span></div>
  <div class="metric"><strong>802</strong><span>unique tasks</span></div>
  <div class="metric"><strong>520 / 42 / 62</strong><span>tools / skills / agents</span></div>
  <div class="metric"><strong>−34.7%</strong><span>最严重 agent-axis BWT</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>这篇不让 Agent 编写 harness。外部平台分阶段增加 tools、skills 或 specialist agents，被测系统要适应越来越大的选择空间。</li><li>benchmark 同时报告新阶段学得怎样，以及旧任务在后续阶段是否退化，分别对应 FWT 和 BWT。</li><li>802 个不重复任务来自 EOG 与 ALE；按三条演化轴展开后共有 1,510 个评测样例。</li><li>skills 与任务的对应关系来自规则和关键词匹配，只能视为近似标注，不能直接当作“完成该题必需的唯一技能”。</li></ul></aside>
<aside class="part0"><span class="kicker">PART 0 · 两种变化不要混在一起</span><h3>外部 harness 在长大，Agent 可能保留自己的适应状态</h3><p><strong>outer harness evolution</strong> 指平台逐阶段加入 tools、skills 或 specialist agents；这些能力一旦加入就不会删除。<strong>persistent adaptive state</strong> 是被测系统跨阶段保留的 memory、prompt 或代码。BWT（Backward Transfer）看旧任务后来变好还是变差，FWT（Forward Transfer）看适应新阶段前后，新任务提升多少。benchmark 本身不要求 Agent 编写 harness。</p></aside>

## Q1. 为什么把外部 harness 的持续扩张当成独立问题？

<p><strong>因为部署中的 harness 不会静止：工具目录、技能库和 specialist roster 会不断扩张，旧经验可能失效，选择空间也会变大。</strong>EvoHarnessBench 同时测新能力能否学会，以及旧能力会不会因更大的 harness 或累积状态而遗忘。</p>

## Q2. 它和“让 Agent 写 harness code”的工作到底差在哪？

<p><strong>它主要测“适应外部 harness 演化”，不是直接测“能否写 harness code”。</strong>deployment 模式每阶段重新实例化，只观察更大 capability pool 的直接影响；self-evolving adaptation 才允许 memory、prompt 或 code 跨阶段保留。Meta-Harness 在这里是一个 code-based baseline，不是 benchmark 的唯一任务定义。</p><p>因此把它纳入这组阅读的价值是提供下游压力测试：前八篇产出的动态 harness 若真的投入长期部署，应该同时报告这里的 retention 与 adaptation，而不能只看当前阶段分数。</p>

## Q3. 17 条 streams、三条 axis 与两种模式怎样构造？

<p><strong>作者没有重新生成题目，而是把 EOG 和 ALE 的静态任务按所需能力重新排成 17 条演化序列。</strong>每条序列有 3–6 个 stage，共包含 802 个不重复任务；同一任务按 tools、skills、agents 三条轴展开后，共得到 1,510 个评测样例。</p>

### 三条轴的标注来源不同

<div class="table-scroll"><table><thead><tr><th>演化轴</th><th>任务需要哪些能力</th><th>评测时 Agent 得到什么</th></tr></thead><tbody><tr><td>tools</td><td>直接继承 EOG/ALE 的 oracle tool labels</td><td>截至当前 stage 的完整累计工具目录，不是只给该题需要的工具</td></tr><tr><td>skills</td><td>从原 system prompt 中规则抽取 procedure，再用 verifier 检查的实体或标识符做关键词匹配</td><td>累计 skill pool；原 prompt 中相应 procedure 被移除，需要系统自己检索</td></tr><tr><td>agents</td><td>按 tool 操作的实体把工具分给 database、file、email 等 specialist agents</td><td>没有直接工具的 lead agent 加累计 specialist roster</td></tr></tbody></table></div>

<p>每项能力按它在任务中的出现频率分批释放，常用能力先出现，长尾能力后出现。任务在“它需要的全部能力第一次同时可用”时加入，并且至少需要本 stage 新出现的一项能力。skills 的关键词匹配只是 relatedness proxy：作者明确说明它不保证该 skill 必需、充分或唯一。</p>

### 一道题在各 stage 怎样得到分数

<p>每个 stage 的 evaluation split 都由来源 benchmark 的原 verifier 判定最终状态，成功记为 Pass；支持部分分的来源还返回 Score。deployment 模式在每个 stage 新建系统，只改变可见 harness；self-evolving adaptation 模式先允许系统用累计 adaptation split 更新 memory、prompt 或代码，再在 evaluation split 上测。任务一旦加入，后续 stage 的题目和 verifier 都不变。</p>

<div class="formula">BWT = weighted(final old-task accuracy − introduction accuracy)<br>FWT = weighted(post-adaptation new-task accuracy − pre-adaptation accuracy)</div>

<p>BWT 比较旧题在最终 stage 与首次出现时的准确率，负数表示遗忘；FWT 比较新一批任务适应前后的准确率，正数表示利用 adaptation split 后有所提升。论文另外报告最终累计 ACC、token、tool call 和 latency。一个系统可以 BWT 较好却 FWT 为负，因此不能用单一平均分代替两者。</p>

<div class="case"><h3>论文给出的多实体任务结构，不是公开的 task-level checker case</h3><p>论文用“先在数据库找到用户，再起草并发送邮件”解释 agent 轴：这道题需要 database specialist 和 email specialist，lead agent 自己没有工具，必须把两个子步骤交给正确的 specialist 并传递用户信息。最终 verifier 只检查数据库、文件或邮件等外部状态。</p><p>论文没有公开一个带 task ID 的完整 prompt、初始数据库、动作日志和 verifier assertion，项目页在核查时也没有链接 checker 仓库。因此本文不能写出这道题的精确 PASS 门槛或一个真实 FAIL trajectory；上例只说明论文公开的构造规则。</p></div>

## Q4. tools、skills、agents 三组结果分别暴露什么瓶颈？

<p><strong>三条演化轴暴露的是三种问题：工具目录带来检索噪声，skill pool 可能根本不被调用，specialist roster 则要求同时选对人并协调结果。</strong>tools 轴的累计目录有时提高成功率，也显著增加 token 和 tool call。EOG 上 MemToolAgent 为 38.6%、ReasoningBank 为 36.9%、Meta-Harness 为 35.2%，fresh deployment 为 30.2%；ALE 上多数 adaptation 方法接近或低于不保留状态的 baseline。</p>

<p>skills 轴的外部扩张本身影响较小。GEPA 在 EOG 从 18.9% 提到 24.1%，但默认 GPT-5 Agent 几乎不调用提供的 skills，因此“skill 已经在池里”不能当作模型会用。agents 轴上，Meta-Harness 在 EOG 从 8.8% 提到 18.5%，ALE 多数方法没有改善。论文分析显示 specialist selection precision 已约 90%，主要瓶颈是漏掉必需 specialist，以及选中以后不能协调多个 specialist 的输出。</p>

<div class="case"><h3>为什么旧题保持和新题适应必须分开报告</h3><p>三条轴最差的 BWT 分别是 tools −5.3%、skills −4.0%、agents −34.7%；最好的相对 adaptation gain 分别达到 +27.8%、+27.5%、+110.2%。这些极值来自不同方法和设置，不能拼成同一个“最好系统”。它们说明一种常见情况：系统可以少忘旧题，却在适应新 stage 后把新题做得更差；也可以快速学会新能力，同时严重破坏旧的 routing 习惯。</p></div>

## Q5. harness coding 研究者应该怎样使用这个 benchmark？

<p><strong>把它用作“演化后 harness 的持续部署回归集”，而不是拿它替代 harness-coding benchmark。</strong>创建或修复系统后，应让新工具、skill、agent 分阶段进入，分别测 fresh deployment 与 persistent adaptation；同时记录 catalog size、routing recall、token/call cost 与 old/new cohort matrix。</p><p>项目页可访问，但截至 2026-10-08 未链接独立公开 code/checker repository。skills 的 rule-based annotation 也只是一种 proxy；若把低 skill overlap 直接解释成模型缺能力，会混入 annotation incompleteness。</p>

## Q6. 最后怎样评价 EvoHarnessBench？

<p><strong>EvoHarnessBench 对“写 harness code”的相关性是间接但重要的。</strong>它提醒我们，一个今天高分的 harness，在工具或 agent 池扩大后可能迅速退化；而持续写 prompt/code 的 adaptation 也可能保住旧能力却伤害新任务。</p><div class="limit-grid"><div><b>独特贡献</b><span>把 tools、skills、agents 三种扩张拆开，并同时报告 BWT/FWT。</span></div><div><b>边界</b><span>benchmark 本身不要求 Agent 编写 harness。</span></div><div><b>构造风险</b><span>skill association 是规则匹配，不是完整因果标注。</span></div><div><b>推荐对象</b><span>已经读完前几篇、想补长期部署视角的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：availability checked 2026-10-08; project page available but no dedicated public code/checker repository linked。</p>

</div>

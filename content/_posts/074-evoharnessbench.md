---
title: "[2026-09-03] EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness?"
permalink: "/posts/论文解读/evoharnessbench.html"
date: "2026-10-08T00:08:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/lib/papers/evoharnessbench/cover.svg"
description: "平台逐阶段加入新工具、操作指南或专门处理某类任务的 Agent，旧题和评分规则不变。EvoHarnessBench 检查系统能否用好新增能力，以及选择越来越多时会不会连原来会做的题也做错。"
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

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">arXiv:2609.04280v3 · 最早公开于 2026-09-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2609.04280">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.04280">论文 PDF</a>
  <a href="https://mas-orchestra.salesforceresearch.ai/evoharness/">项目页</a>
  <a href="https://huggingface.co/datasets/ZixuanKe/evovling_tools/tree/6c2c2d9af15b12b678940ad4e23f976cdb85b150">公开工具任务</a>
</div>

<section class="deck-wrap" aria-label="EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness? 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/evoharnessbench-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/evoharnessbench-visual-guide.html" title="EvoHarnessBench: Can Your Agents Keep Pace with an Evolving Harness? 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">EvoHarnessBench 让平台分阶段加入新工具、操作指南或专门处理某类任务的 Agent。每道旧题和它的评分规则在后续阶段保持不变，可选能力却越来越多。17 条阶段序列、802 个不重复任务，用来检查系统能否利用新能力解决新题，以及它会不会因为选择变多，把原来会做的题也做错。</p>

<aside class="part0"><span class="kicker">PART 0 · 平台变化与系统适应</span><h3>新能力是谁加入的，旧经验是谁保存的？</h3><p>平台加入新能力，论文称为 <strong>outer harness evolution</strong>；这里的 harness 是 Agent 可调用的工具、可检索的操作指南（skills）与可委派的专用 Agent（specialist agents）。系统可以选择在开发题上更新提示词、记忆或代码，并把这些内容带到下一阶段，这叫 <strong>self-evolving adaptation</strong>。模型参数保持不变。<strong>BWT（Backward Transfer）</strong> 比较旧题首次加入和最终阶段的成绩，<strong>FWT（Forward Transfer）</strong> 比较新题在本阶段适应前后的成绩；具体分母在评测部分说明。</p></aside>
<div class="interest"><b>博客作者兴趣度 7.8 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>17</strong><span>分阶段增加能力的序列</span></div>
  <div class="metric"><strong>802</strong><span>不重复任务</span></div>
  <div class="metric"><strong>520 / 42 / 62</strong><span>tools / skills / agents</span></div>
  <div class="metric"><strong>−34.7%</strong><span>最严重 agent-axis BWT</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>外部平台分阶段增加工具、操作指南或专用 Agent；被测系统要适应越来越多的可选能力。</li><li>评测同时报告新阶段学得怎样，以及旧题后来是否退化，分别对应 FWT 和 BWT。</li><li>802 个不重复任务来自两个上游任务集；按三条演化轴展开后共有 1,510 个评测样例。</li><li>操作指南与题目的对应关系来自规则和关键词匹配，是近似关联，不是“完成该题必需的唯一技能”。</li></ul></aside>

<h2 id="为什么工具变多会让原本会做的题变难">1. Motivation：为什么工具变多会让原本会做的题变难</h2>

<p><strong>旧工具还在，不代表模型会继续选对它们。</strong>系统原本只需要在几个工具或专用 Agent 中选择，目录扩张后可能漏选必要能力、被相似名称干扰，或沿用不适合当前目录的旧记忆。论文称这种原题不变、模型不变，却因为平台变大而掉分的现象为 <strong>harness-induced forgetting</strong>。它不同于模型参数训练后遗忘：甚至每阶段全新实例、不保存记忆的系统也可能发生。</p>

<h2 id="与静态工具评测和持续学习的区别">2. Related Work：与静态工具评测和持续学习的区别</h2>

<p><strong>被测系统要适应平台新加入的能力，benchmark 不要求它自己扩展外部平台。</strong>τ-bench、SkillsBench 等主要使用固定工具或技能；AgentCL、ContinualBench 把变化放在任务序列，通常固定 harness；CMRBench 更接近，但扩张的是可路由的模型池。EvoHarnessBench 把工具、skills 和专用 Agent 池的扩张分别控制。</p><p>它与自动 harness coding 的关系是长期部署检验：自动写出的执行系统即使今天高分，明天加入几十个工具后仍可能退化。Meta-Harness 是其中一个可以更新代码的适应方法，而不是全 benchmark 的任务定义。不同方法也可以只更新记忆或提示词。</p>

<h2 id="任务怎样进入阶段，输出怎样被检查">3. Benchmark / Protocol：任务怎样进入阶段，输出怎样被检查</h2>

<p><strong>作者复用 EOG 和 ALE 的任务、目标状态与检查程序，重新安排能力出现的顺序。</strong>EOG（EnterpriseOps-Gym）提供企业业务工具任务；ALE（Agents' Last Exam）提供软件工具环境中的复杂任务。每条序列有 3 至 6 个阶段，共 802 个不重复任务；同一任务可能在不同能力轴上出现，因此三条轴共有 1,510 个评测样例，不能说成 1,510 道独立新题。</p>

<h3 id="三条轴的标注来源不同">3.1 三条轴的标注来源不同</h3>

<div class="table-scroll"><table><thead><tr><th>演化轴</th><th>任务需要哪些能力</th><th>评测时 Agent 得到什么</th></tr></thead><tbody><tr><td>tools · 工具</td><td>继承上游工具需求标签（oracle tool labels）；ALE 把所需软件归一成软件能力</td><td>截至当前阶段的完整累计目录，而非只给该题需要的能力</td></tr><tr><td>skills · 操作指南</td><td>EOG 从共享提示词提取流程，再匹配 SQL 检查中的表、字段和值；ALE 定义一小组可复用流程，用任务文字和所需软件做规则匹配</td><td>主文的指南使用实验提供可检索指南库，不直接写入提示词；EOG 移除原提示中的对应流程，ALE 不删除逐题内容</td></tr><tr><td>agents · 专用 Agent</td><td>EOG 按业务实体分工具；ALE 按软件家族分组，每种能力只分给一个 owner</td><td>没有直接工具的主 Agent，以及当前累计的专用 Agent 名单；各专用 Agent 只拥有自己的工具包和相关流程</td></tr></tbody></table></div>

<p>每项能力按它在任务中的出现频率分批释放，常用能力先出现，较少用的能力后出现。设任务要求的隐藏能力集合为 <code>Cᵢ</code>，能力 <code>c</code> 的首次出现阶段为 <code>r(c)</code>，任务在 <code>max r(c), c∈Cᵢ</code> 进入：此时全部要求首次同时可用，且至少一项是本阶段刚加入的。任务本身、初始状态与检查程序之后不变，只有可选目录增大。每阶段还拆成适应题与不用于适应的评测题。</p>

<p>若一题的两项所需能力分别在阶段 1、2 出现，它便从阶段 2 开始测试。到了阶段 3，还是这道题，但目录里已有更多其他能力。这里的阶段编号是规则示意。skills 的关键词匹配也只是近似关联：论文明确说它不保证被匹配技能必需、充分或唯一。作者没有逐题增加人工技能标注或人工复核，不能把匹配结果当作因果真值。未匹配到任何指南的题会被排除；skill 轴覆盖符合条件上游题的 76.6%，因此三条轴的题集不完全一样。</p>

<p>另有一组 <strong>skill-learning 消融</strong>：系统从适应题轨迹和检查反馈中生成自己的指南，作者提取的 reference skills 只用于安排阶段和计算重合率，不直接交给系统。v3 Appendix C 的“隐藏 reference skills”描述与 §3.3 的“提供可检索指南库”没有把两种设置交代一致；本文分别说明主表的指南使用实验和 Appendix J.2 的指南生成实验，不把它们合成同一种输入条件。</p>

<figure class="figure wide"><a href="/lib/papers/evoharnessbench/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/evoharnessbench/body-method.svg" width="1050" height="913" alt="EvoHarnessBench 任务能力关联、阶段释放、可选适应和旧题复测流程" loading="lazy" decoding="async"></a><figcaption>根据 Figure E.1 与 §3 重绘。任务在所标记能力首次同时具备的阶段加入；后续题目和检查不变，只扩大能力目录。</figcaption></figure>

<h3 id="一道题在各阶段怎样得到分数">3.2 一道题在各阶段怎样得到分数</h3>

<p>一次评测给 Agent 公开任务与当前阶段的累计目录；任务要求的 <code>Cᵢ</code> 和检查目标不提供给 Agent。Agent 调工具、检索 skills 或委派专用 Agent，环境留下最终数据库、文件、邮件等状态。来源 benchmark 的 <strong>verifier（最终状态检查程序）</strong> 判定成功或失败。<code>Pass</code> 是成功任务数除以该批全部任务数；<code>Score</code> 则平均来源允许的部分分。前者是成功率，后者不一定是成功率。</p>

<p><code>deployment</code> 模式每阶段新建系统，没有跨阶段经验，只测目录扩张本身。<code>self-evolving adaptation</code> 模式先用累计适应题更新记忆、提示词或代码，再测保留题；新模型实例仍使用这些持久内容。每道旧题在后续阶段重测，故结果构成一个矩阵：行是当前平台阶段，列是题目首次进入的阶段。只看最后一行的总平均，无法看出哪一批旧题退化。</p>

<div class="formula">Pₜ,ᵢ = 当前阶段 t 在第 i 批全部评测题上的平均成功率<br>BWT = Σᵢ&lt;T nᵢ(Pₜ₌T,ᵢ − Pᵢ,ᵢ) / Σᵢ&lt;T nᵢ<br>FWT = Σᵢ≥2 nᵢ(Pᵢ,ᵢ − Pᵢ,ᵢᵇᵉᶠᵒʳᵉ) / Σᵢ≥2 nᵢ</div>

<p>这正是 Appendix D 的公式，<code>nᵢ</code> 是第 i 批保留评测题数量。BWT 排除最终才加入、尚无后续可比较的最后一批；FWT 排除没有前一阶段经验的第一批。假设旧题两批分别有 10、20 题，首次成功率为 0.8、0.5，最终为 0.6、0.4，则 <code>BWT=[10×(−0.2)+20×(−0.1)]/30=−0.1333</code>，即降低 <strong>13.33 个百分点</strong>。这是本文示意计算，不是论文的实验读数。</p>

<p>论文主图和 Table 8 使用“relative BWT (%)”描述 −34.7% 等结果，而 Appendix D 上式写的是绝对成功率差，没有给出对应相对归一化的分母。本文保留主图的“相对变化”标记，不把 −34.7% 说成下降 34.7 个百分点，也不声称上述绝对公式能直接复算它。精确复算主图仍需要评测实现或各阶段原始矩阵。最终累计 ACC 则按所有批次的题数平均，成本另外报告 token、工具调用与时间。</p>

<h3 id="真实任务：补上产品，关联用过的知识文章">3.3 真实任务：补上产品，关联用过的知识文章</h3>

<p>公开 CSM 工具任务 <code>task_20251208_035402_755_ad5a67e3_8ca9a646</code> 来自 EOG 作者构造的企业业务环境，是<strong>合成 benchmark 任务</strong>，不是实际客户工单。用户说：Thomas Bailey 在 Initech 使用 Docker Enterprise Variant 15 时遇到了问题，之前创建的电话工单漏填产品；自己已经参考并使用过操作指南，问题仍未解决，请补上产品并关联那篇指南。</p>

<p>任务指定初始数据库 <code>db_1762254390925_u5icw4thh.sql</code>。上游公开 seed 中，Thomas Bailey 的 <code>user_id=63</code>，对应 <code>contact_id=5</code>、Initech 的 <code>account_id=5</code>；工单 <code>case_id=101</code> 的渠道为 <code>phone</code>、状态为 <code>new</code>、<code>product_id=NULL</code>。目标产品 ID 为 35，知识文章 ID 为 54，标题包含该产品名，状态为 <code>published</code>；初始没有与工单 101 的关联。另有同一客户的电话工单 108，但它已解决且属于另一产品，所以按客户名取第一条记录会选错。</p>

<p>执行用户是 Thomas Green（<code>user_id=1</code>），不是客户 Thomas Bailey。Agent 得到任务、业务政策和当前工具目录，要通过 <code>list_users</code>、<code>find_contact_by_portal_user</code>、<code>find_account</code>、<code>search_cases</code>、<code>find_product</code>、<code>retrieve_knowledge</code> 查出这些关系，再用 <code>update_case</code> 与 <code>link_case_knowledge</code> 修改状态。公开工具轴阶段 1 为它标记 8 个相关工具，但实际提供 25 个累计工具。<strong>下面的 SQL 是评测端检查代码，不是授予 Agent 的数据库直写工具。</strong></p>

<figure class="figure wide"><a href="/lib/papers/evoharnessbench/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/evoharnessbench/body-case.svg" width="1050" height="860" alt="Thomas Bailey 工单 101 的真实初始状态、产品和知识关联，以及两个 SQL 检查的通过条件" loading="lazy" decoding="async"></a><figcaption>根据公开 HF 工具任务与 EOG seed 整理。初始状态是 new；最终检查要求 in_progress 和 used_as=applied。图中的失败结果按 SQL 推导，不是模型逐步日志。</figcaption></figure>

<p>任务有两条 <code>database_state</code> 检查，各自要求 <code>COUNT(*) == 1</code>。第一条把工单、客户、公司和产品连接起来，要求姓名、Initech、目标产品、<code>phone</code> 和 <code>in_progress</code> 同时匹配。第二条还要求知识文章与同一工单关联，产品相同、标题含产品名，并且 <strong><code>used_as='applied'</code></strong>。后者表示“用过指南但问题还没解决”；写成 <code>resolution</code> 会失败。任务的第二条自然语言描述误写了“as a resolution”，实际 SQL 检查的是 <code>applied</code>，本文以执行条件解释判分。</p>

<p>下面保留第二条 SQL 的全部条件，来源为公开任务的 <code>validation_config.query</code>，只整理了换行：</p>

<div class="code-scroll"><pre><code class="language-sql">SELECT COUNT(*) AS cnt
FROM case_knowledge ck
JOIN knowledge k ON k.knowledge_id = ck.knowledge_id
JOIN product p ON p.product_id = k.product_id
JOIN customer_case c ON c.case_id = ck.case_id
JOIN contact ct ON ct.contact_id = c.contact_id
JOIN account a ON a.account_id = ct.account_id
JOIN "user" u ON u.user_id = ct.portal_user_id
WHERE u.first_name = 'Thomas'
  AND u.last_name  = 'Bailey'
  AND a.name       = 'Initech'
  AND c.channel    = 'phone'
  AND c.state      = 'in_progress'
  AND c.product_id = p.product_id
  AND p.name       = 'Docker Enterprise Variant 15'
  AND ck.used_as   = 'applied'
  AND k.title LIKE '%Docker Enterprise Variant 15%';</code></pre></div>

<p>EOG 的 <code>VerifierEngine</code> 在 Agent 执行后通过评测端 <code>/api/sql-runner</code> 查询当前数据库，从单行单列结果取出数值，再按 <code>equals</code> 比较。这里没有让语言模型判断“回答看起来对不对”。两条检查都过才算任务成功；只过第一条为部分完成。若产品改成 35、状态改成 <code>in_progress</code>，但知识关联写成 <code>resolution</code>，则两条检查分别返回 1、0；若状态仍为 <code>new</code>，两条都返回 0。这些是基于公开条件的推导，本文没有运行 hosted 环境。</p>

<p>两条 SQL 都以业务属性查找，没有直接锁死 <code>case_id=101</code>，也没有覆盖政策中的每条权限、有效期和时间戳规则。通过它们只证明这些最终状态谓词成立，不能证明全过程合规。当前项目的逐题汇总中，该题在工具阶段 1 的 task-specific ReAct/Codex 为 2/3 次成功；GEPA 与 Meta-Harness 各为 0/3，后两者的调用集合都缺 <code>list_users</code>。汇总能说明某些工具是否出现，不能证明漏调用就是唯一失败原因，原始有序调用和每次最终数据库仍未给出。</p>

<h2 id="三种能力扩张分别影响什么">4. Experiments：三种能力扩张分别影响什么</h2>

<p><strong>工具需要选对，skills 需要实际调用，多 Agent 需要完整委派并传递结果。</strong>tools 轴的累计目录有时提高成功率，也显著增加 token 与工具调用。EOG 上 MemToolAgent 为 38.6%、ReasoningBank 为 36.9%、Meta-Harness 为 35.2%，不适应的 deployment 为 30.2%；ALE 上多数适应方法接近或低于不保留状态的基线。这些值是对应设置的任务成功率，不能和相对 BWT 混用。</p>

<p>skills 轴的目录扩张本身影响较小。GEPA 在 EOG 从 18.9% 提到 24.1%，但默认 GPT-5 Agent 几乎不检索提供的 skills，说明操作指南存在不等于模型用了它。agents 轴上，Meta-Harness 在 EOG 从 8.8% 提到 18.5%，ALE 多数方法没有改善。</p>

<div class="table-scroll"><table><thead><tr><th>设置</th><th>Tools EOG / ALE</th><th>Skills EOG / ALE</th><th>Agents EOG / ALE</th></tr></thead><tbody><tr><td>只给逐题所需能力的参照</td><td>26.0 / 11.6</td><td>18.9 / 7.4</td><td>6.5 / 5.3</td></tr><tr><td>累计目录，不保留经验</td><td>30.2 / 12.2</td><td>18.9 / 8.3</td><td>8.8 / 4.2</td></tr><tr><td>MemToolAgent</td><td>38.6 / 10.1</td><td>19.6 / 6.9</td><td>未列入主表</td></tr><tr><td>GEPA</td><td>31.9 / 11.1</td><td>24.1 / 7.4</td><td>14.9 / 6.3</td></tr><tr><td>Meta-Harness</td><td>35.2 / 11.1</td><td>19.4 / 7.8</td><td>18.5 / 3.2</td></tr></tbody></table></div>

<p>上表为 v3 Tables 2、4、6 的任务成功率（%），主表控制底层模型为 GPT-5；主表的 ± 项虽已报告，正文没有完整交代统一的重复次数和统计定义，因此这里不把它擅自称为标准误或显著性。主表的题数标题也与 Appendix C 的全构造题数不同，例如 agents 主表 ALE 写 63 题，构造统计是 104 个保留测试任务；不能把两个分母直接互换。未在可比预算内完成的 G-Memory、DeLM ALE 实验标为缺失，不按 0 分算。</p>

<p><strong>Claude Code 的结果应在它自己的两种目录之间比较。</strong>它使用 Sonnet 4.6 和原生 harness，不能用绝对分数声称比受控 GPT-5 系统更强。Appendix H 中，skills 的 EOG 成功率为 29.3%→30.2%、ALE 为 13.2%→13.2%；agents 为 EOG 11.0%→10.6%、ALE 16.9%→15.3%。这是另一套系统的内部对照。</p>

<h3 id="哪些消融区分了“目录太大”和“适应方式不合适”">4.1 哪些消融区分了“目录太大”和“适应方式不合适”</h3>

<p>评测始终用完整累计目录，只在适应阶段改可见范围。MemToolAgent 在 EOG tools 中，把适应阶段缩为逐题工具，成功率 38.6%→39.1%，适应时间 23.9→17.9 小时；从一开始就给最终完整目录则为 37.9%、28.6 小时。GEPA 的 skills 消融却是成功率 24.1%→23.0%，同时部分分 61.0→63.1、时间 4.1→2.9 小时：效率和部分分提高，不等于严格成功率提高。Meta-Harness 的 agents 消融中，逐题目录为 19.4%，从开头保持最终完整目录为 20.3%，都高于逐阶段扩大目录的 18.5%。对这一轴，目录变化本身比单纯“候选多”更值得关注。</p>

<p>记忆的收益同样依赖它用在哪里。EOG tools 中，Reasoning Bank 的概要记忆为 36.9%，加上显式工具信息反而降到 30.3%；保留成功轨迹和只保留失败轨迹都为 34.4%。而指南学习实验中，直接一次生成指南为 11.5%，低于空指南的 16.9%；从真实执行轨迹生成为 20.0%，批量教师反馈为 22.1%。这些对照支持“经验怎样提取、怎样使用会影响成绩”，不支持“记得越多就越好”。Table J.1 的工具导向 MemToolAgent 甚至降到 4.4%，但这是额外消融，不是上表主设置的 19.6%。</p>

<p>Figure J.1 的调用比例也要看分母：GPT-5.5 的 task-specific Codex 打开约 82% 的逐题指南；task-specific GEPA 在完整阶段库中打开约 31%，两者库的范围不同。Claude Code 的 15% 按文件读取次数计，未记录完整 skill 名称，不能把这三个百分比当成同口径的检索召回率。</p>

<p>Figure 7 把“找对了谁”和“有没有找齐”分开：已调用专用 Agent 中约 90% 是相关的，论文称为 <strong>selection precision</strong>；必需专用 Agent 被调用的比例从不适应的 79% 最高升到 89%，称为 <strong>recall</strong>。在后来仍成功的旧题中，约 13% 改变了委派对象；后来失败的旧题中约 25% 改变了委派对象。论文发现更多情况是漏掉原本必要的 Agent，而非一味加入无关的新 Agent。即使找齐，整体成功率仍低，故结果传递与协调也不能省略。</p>

<p>Appendix K.1 给了更直接的结果：<strong>即使所有必需专用 Agent 都叫到了，仍有 78% 至 86% 的执行失败</strong>。GEPA 适应后，新加入的必需 Agent 调用率由约 71%→81%；Meta-Harness 在适应前已约 81%，适应后几乎不变。因此两者成绩提高的路径不同，不能都归因于“更会找新 Agent”。</p>

<div class="case"><h3>为什么旧题保持和新题适应必须分开报告</h3><p>三条轴最差的相对 BWT 分别是 tools −5.3%、skills −4.0%、agents −34.7%；最好的相对适应增益分别达到 +27.8%、+27.5%、+110.2%。这些极值来自不同方法和设置，不能拼成同一个“最好系统”。它们说明一种常见情况：系统可以少忘旧题，却在适应新阶段后把新题做得更差；也可以快速学会新能力，同时严重破坏旧题中选择工具或 Agent 的策略。</p></div>

<p>v3 自身还有数值冲突：Figure 1 caption 仍写三个轴下降 12.1%、13.8%、46.4%，后面的轴内结果和 Table 8 则总结为 −5.3%、−4.0%、−34.7%。本文采用有对应轴内分析的后者，同时保留这一不一致；未经原始矩阵核查，不能宣称前者只是排版笔误。</p>

<figure class="figure wide"><a href="/lib/papers/evoharnessbench/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/evoharnessbench/body-results.svg" width="1050" height="828" alt="EvoHarnessBench 三条能力扩张轴的相对 BWT 与委派质量" loading="lazy" decoding="async"></a><figcaption>根据 Table 8 与 Figures 7、8 重绘。−34.7% 保留原文的 relative BWT 单位，不是 −34.7 个百分点；附录绝对公式没有给出该相对量的归一化分母。</figcaption></figure>

<h2 id="对长期部署评测的启发">5. Discussion：对长期部署评测的启发</h2>

<p><strong>新系统应同时测原题保持、新题适应与额外成本。</strong>先固定原题、工具接口与检查程序，仅逐阶段加目录；再分别比较完全不保存经验和更新记忆、提示词、代码的系统。记录每批旧题的成绩、必需能力是否调用齐、成本是否增长，可以区分目录干扰与适应策略写坏了系统。操作指南与任务的关联仍是规则近似，低匹配率不能直接解释成缺技能。</p>

<p>截至 2026-10-14，项目已提供任务与逐题结果汇总，三个 HF 数据集分别发布工具、指南和 Agent 任务；EOG 也公开了 seed 数据库与数据库检查代码。它们足够解释上面的真实任务。当前 release 的 1,061 个 gallery 任务、3,395 个任务×阶段记录和 17,992 条系统尝试汇总使用不同计数单位，不等同于 v3 的原实验题集。完整复现仍缺原始逐阶段矩阵、相对指标实现、EvoHarness runner 固定版本，以及每次有序调用和最终状态。</p>

<h2 id="结论与尚缺的证据">6. Conclusion：结论与尚缺的证据</h2>

<p><strong>能力目录增长本身就可能破坏已有表现，持续适应也不保证新旧题同时变好。</strong>论文把三种扩张拆开，并用重复测试旧题暴露这种问题，适合作为动态部署压力测试。当前边界是平台只加不删、不改接口；现实里的 API 改版、工具撤回与权限变化没有覆盖。skills 的近似关联、原文中部分输入设置与数值的不一致，以及未交代的相对指标归一化，都需要在引用结论时保留。</p>

<p class="source-note">主要来源：arXiv v3 全文与附录；公开 HF 工具任务 revision 6c2c2d9af15b12b678940ad4e23f976cdb85b150，skills revision 1ba40009f2b23cd4490ca6eaac6fb6697fe32c62，agents revision aa6f72430745d05e1082aedb06926d18e84c2b72；EOG revision 271f2c357f763376997dfd16807fcde2474ae41b 的 gym_dbs.zip 与 benchmark/verifier.py。读取了任务、seed、SQL 和逐题汇总，未运行 hosted 环境。BWT 算例与案例失败结果为规则推导。</p>

</div>

---
title: "[2026-02-25] VeRO: A Harness for Agents to Optimize Agents"
permalink: "/posts/论文解读/vero.html"
date: "2026-10-08T00:05:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/lib/papers/vero/cover.svg"
description: "VeRO 管理 Agent 自动改进 Agent 时的代码版本、评测额度、可见文件和运行记录。本文解释一次修改怎样被评测，并用 Terminal-Bench 的逐题结果说明：消除程序异常，未必让任务成功率提高。"
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

<p class="paper-meta">arXiv:2602.22480v4 · 本文按 v4 解读；最早公开于 2026-02-25</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2602.22480">论文主页</a>
  <a href="https://arxiv.org/pdf/2602.22480v4">论文 PDF（v4）</a>
  <a href="https://github.com/scaleapi/vero/tree/paper-v1">论文时期代码（paper-v1）</a>
</div>

<section class="deck-wrap" aria-label="VeRO: A Harness for Agents to Optimize Agents 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/vero-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/vero-visual-guide.html" title="VeRO: A Harness for Agents to Optimize Agents 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">VeRO 是一套给“Agent 优化 Agent”使用的实验平台。外层编辑模型可以修改目标系统的提示词、工具和代码；平台让每个候选进入独立工作目录，由服务端扣评测额度，保存代码版本、分数与运行记录。这样才知道哪份修改得到哪个结果，也能限制直接读取测试答案或无限调用评测服务。</p>

<aside class="part0"><span class="kicker">PART 0 · 两层程序</span><h3>谁改系统，谁用系统做题</h3><p>外层负责编辑程序的 coding agent 称为 <strong>optimizer</strong>，内层运行候选程序做题的系统称为 <strong>target agent</strong>。目标程序中组织提示、工具调用和执行顺序的代码，称为 <strong>harness</strong>。VeRO 管理修改与评测这些代码的实验，不替目标程序做题。作者另写了一个最小 coding agent，名为 <strong>VeRO-Agent</strong>，作为 optimizer 之一；它与 VeRO 平台是两件东西。</p></aside>
<div class="interest"><b>博客作者兴趣度 8.7 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>120</strong><span>5 项任务 × 8 种配置 × 3 次独立运行</span></div>
  <div class="metric"><strong>B=8</strong><span>主实验最多 8 次评测调用</span></div>
  <div class="metric"><strong>0.61</strong><span>默认配置每次搜索最优分的平均值</span></div>
  <div class="metric"><strong>33 / 89</strong><span>TB2 最佳工具版通过数</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>VeRO 固定代码版本、文件权限、评测额度与反馈接口，optimizer 可以换成 Claude Code 或作者的 VeRO-Agent。</li><li>120 次主实验中，默认配置的跨任务平均最优分为 0.61；其中 GAIA 使用 validation 报分，GPQA 按 train 选择版本，不能统称独立盲测。</li><li>Terminal 案例通过数从 27/89 到 33/89，但每配置只搜索一次，且同一批 89 题参与优化和最终报告。</li><li>文件权限和额度限制能针对直接读测试文件、超额调用；论文没有解决从公网副本记住答案的问题。</li></ul></aside>

<h2 id="1-研究问题：自动改系统的实验怎样才能可信">1. Motivation：自动改系统的实验怎样才能可信</h2>

<p><strong>可信的自动改进实验需要平台实际执行版本、预算和权限限制。</strong>只把规则写进提示词，编辑模型仍可能超额评测或读到测试答案；记录不完整时，也无法还原哪份代码对应哪个分数。VeRO 把这些职责交给外层系统执行。</p>

<h2 id="2-相关工作：实验平台与搜索算法分开">2. Related Work：实验平台与搜索算法分开</h2>

<p><strong>VeRO 提供版本、权限和评测接口，搜索算法可以替换。</strong>Meta-Harness 是具体的自动修改策略；HarnessOpt-Bench 进一步固定任务和反馈公开规则。VeRO 的实验既比较不同 coding-agent 配置，也比较只改提示与工具描述的 GEPA。它不会因为某种优化器使用了自己的工具，就自动把改动算作更好的方法。</p>

<div class="table-wrap"><table><thead><tr><th>比较对象</th><th>optimizer 实际能改什么</th><th>这篇的比较意义</th></tr></thead><tbody><tr><td>GEPA</td><td>提示、工具描述及预留参数</td><td>用反思与演化搜索，但不能任意重写目标代码</td></tr><tr><td>VeRO-Agent Resources Only</td><td>与 GEPA 同一组可编辑组件</td><td>更接近隔离搜索策略的差别</td></tr><tr><td>VeRO-Agent Default</td><td>允许的 Python 代码、工具、流程和提示</td><td>允许搜索更大的程序空间</td></tr><tr><td>Meta-Harness</td><td>根据失败记录修改完整 harness</td><td>同属自动优化，但强调具体搜索策略；VeRO 强调可替换 optimizer 的实验协议</td></tr></tbody></table></div>

<p>因此 Default 比 GEPA 高 0.07，不能全归因于“算法更强”：两者的可修改范围不同。论文还比较 Claude Code 的原生 shell 评测与接入 VeRO 工具后的评测，不过后者同时改善了反馈、版本和接口；它并非只切换一项权限开关的消融实验（§4.1、Table 6）。</p>

<h2 id="3-方法：一次候选从改代码到返回分数">3. Method：一次候选从改代码到返回分数</h2>

<p><strong>optimizer 提出修改，VeRO 保存版本并执行受控评测。</strong>系统为候选创建独立 <strong>Git worktree</strong>，即共享 Git 历史但文件互不覆盖的工作目录；修改保存成 commit。optimizer 只能读取允许的数据分区和代码，不能靠直接访问文件看到 test 答案。</p>

<ol class="steps"><li><b>1 · 保存版本</b><span>系统从初始程序创建独立 Git worktree，每次提交对应确定的代码版本。</span></li><li><b>2 · 修改</b><span>optimizer 修改提示、工具、执行流程或代码；文件接口限制能读写的路径。</span></li><li><b>3 · 评测</b><span>optimizer 选择分区和样本；评测服务检查权限、按实验配置扣额度，再在隔离环境运行候选。</span></li><li><b>4 · 观察</b><span>实验数据库保存代码版本、样本、分数、运行记录与成本，再返回允许查看的结果。</span></li><li><b>5 · 选择</b><span>optimizer 比较候选，恢复最佳版本或继续分支；最终冻结一份代码。</span></li></ol>

<p>负责运行候选和给分的组件称为 <strong>evaluator</strong>；optimizer 通过 <code>ExperimentRunner</code> 请求某个 commit 的评测。服务检查分区权限和剩余额度，再运行候选。返回的 <strong>execution trace</strong> 是输入、动作、工具反馈、错误和分数组成的记录，它与 commit 一起保存在实验数据库里。optimizer 据此决定保留、回退或继续修改。</p>

<p><strong>主实验 B=8 计评测调用，Terminal-Bench 案例才改用样本预算。</strong>主实验的算法每调用一次 <code>ExperimentRunner.run</code>，<code>nE</code> 加 1；B 不包含 optimizer 的 token 或 API 成本。Terminal-Bench 案例的 B=89/178 则计被评的题目样本数：89 题全量评一次消耗 89，178 相当于两次完整评测。把两种预算混成一个单位会误判搜索效率（v4 §4.1、§4.4）。</p>

<h3>任务、分区和版本选择</h3>

<p>作者固定目标模型为 GPT-4.1 mini，沿用五个来源 benchmark 的判分函数，而不是重新人工给所有回答打分。各任务分区如下；破折号表示没有该分区，不能当成零题得分。</p>

<div class="table-wrap"><table><thead><tr><th>任务</th><th>train / validation / test</th><th>构造与报告边界</th></tr></thead><tbody><tr><td>GAIA</td><td>50 / 87 / —</td><td>从可用训练题中过滤成 137 道纯文本题，再取 50 道优化；87 道 validation 同时用于选最佳版本与报分</td></tr><tr><td>GPQA Diamond</td><td>98 / — / 100</td><td>198 题固定拆分；没有 validation，按 train 分数选择代码，再评 test</td></tr><tr><td>MATH</td><td>59 / 60 / 486</td><td>沿用 AFlow 的拆分，并核对公开题目</td></tr><tr><td>τ-Bench Retail</td><td>100 / 20 / 115</td><td>沿用来源 benchmark 的分区和工具</td></tr><tr><td>SimpleQA</td><td>46 / 45 / 80</td><td>先取 GPT-4.1、Sonnet 4.5、Gemini 2.5 Pro 直接答题都失败的 171 题，再固定拆分</td></tr></tbody></table></div>

<p>这些预筛选在优化前完成。SimpleQA 因而测的是这批困难事实题，不能外推成整个 800 题来源集的表现。GAIA 的数据集名称与题数按 v4 Appendix A.2.1 原样记述，不混用当前仓库新 benchmark 的拆分。</p>

<p>八种 optimizer 配置在五项任务上各搜索三次，共 120 次；optimizer 的 temperature=1.0、最多 200 turns。主实验一次额度覆盖整批 train 或 validation，单批约 46 到 100 题，<strong>B=8 不是只允许做八道题</strong>。作者控制随机种子并重复搜索，但目标模型和在线搜索仍会产生噪声；Table 2 先取每次搜索选中的最佳代码得分，再对三次运行取平均，括号内是三次中的最大值，不是标准差。</p>

<figure class="figure wide"><a href="/lib/papers/vero/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/vero/body-method.svg" width="1050" height="787" alt="VeRO 对代码版本、文件权限、不同评测预算和逐题记录的管理流程" loading="lazy" decoding="async"></a><figcaption>根据 Figure 1 与 Algorithm 1 重绘。主实验按评测调用扣额度，Terminal 案例按题目样本扣额度；少报异常不自动等于任务通过。</figcaption></figure>

<h2 id="4-实验：成功率与错误类别为什么必须一起看">4. Experiments：成功率与错误类别为什么必须一起看</h2>

<p><strong>默认配置的收益主要来自工具任务，纯推理任务改善很小。</strong>Table 2 的核心比较如下，数值是三次搜索最佳版本得分的平均，最后一列再对五个任务等权平均。</p>

<div class="table-wrap"><table><thead><tr><th>配置</th><th>GAIA</th><th>GPQA</th><th>MATH</th><th>Retail</th><th>SimpleQA</th><th>平均</th></tr></thead><tbody><tr><td>初始程序</td><td>0.07</td><td>0.60</td><td>0.87</td><td>0.38</td><td>0.61</td><td>0.50</td></tr><tr><td>Claude Code 原生</td><td>0.13</td><td>0.58</td><td>0.88</td><td>0.43</td><td>0.65</td><td>0.53</td></tr><tr><td>Claude Code + VeRO Tools</td><td>0.14</td><td>0.64</td><td>0.88</td><td>0.39</td><td>0.67</td><td>0.55</td></tr><tr><td>VeRO-Agent Default</td><td>0.26</td><td>0.64</td><td>0.86</td><td>0.55</td><td>0.73</td><td>0.61</td></tr><tr><td>Resources Only</td><td>0.11</td><td>0.60</td><td>0.88</td><td>0.42</td><td>0.69</td><td>0.54</td></tr><tr><td>GEPA</td><td>0.21</td><td>0.58</td><td>0.86</td><td>0.49</td><td>0.60</td><td>0.54</td></tr></tbody></table></div>

<p>其余三行是让 VeRO-Agent 把编辑工作委派给子 Agent 的 Orchestrator 配置，平均分分别为 0.59（Opus）、0.57（Sonnet）、0.52（GPT-5.2），并没有超过 Default。Table 2 的初始程序均分来自七种非 GEPA 配置 × 三次，共 21 次运行；不要把它当成每条候选都共享的一次确定性缓存。</p>

<p>扩大预算也没有解决所有任务。B 从 2 增到 32 时，Retail 的保留集得分由 0.412 增到 0.528；GAIA 从 0.119 增到 B=8 的 0.195，却在 B=32 回落到 0.170。GPQA 与 MATH 基本持平，MATH 的初始分已约 0.87。作者认为目标模型的推理能力限制了收益，但预算实验只排除了“多评几次就会明显提升”这一解释，没有证明所有更好的程序都不存在（Figure 8）。</p>

<p>修改类型分析由 GPT-4.1 给代码差异分类，并非人工复核的因果实验。超过一半修改属于提示调整，后期类型更加集中；它能描述搜索行为，不能独立证明提示调整导致了成功或失败。</p>

<figure class="figure wide"><a href="/lib/papers/vero/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/vero/body-case.svg" width="1050" height="816" alt="VeRO Terminal-Bench 89 题的异常减少、新增成功与旧成功退化" loading="lazy" decoding="async"></a><figcaption>根据 Tables 16、18 与 Figure 16 重绘。Tools-B=178 保留 21 个旧成功、新增 12 个；净增 6 题，33/89=37.1%。</figcaption></figure>

<div class="case"><h3>Terminal-Bench 2：消除 crash 后，任务仍可能 FAIL</h3><ol><li><strong>初始状态：</strong>Terminus-KIRA 在 89 题中通过 27 题；另外有 41 次运行抛异常，21 次没有异常但 verifier 给 0。</li><li><strong>Tools-B=89：</strong>optimizer 发现 target LLM 有时把 tool call 输出成字符串，于是在五处加入 <code>isinstance(..., dict)</code> 检查。11 个 <code>AttributeError</code> 全部消失，但最终只通过 30/89。</li><li><strong>Filesystem-B=178：</strong>同样消除 11 个 <code>AttributeError</code>，并把 context-length error 从 13 个降到 1 个；通过数仍是 27/89，因为超时和无异常零分增加。</li><li><strong>Tools-B=178：</strong>主要压缩 prompt、tool 描述与输出长度，保留了 <code>AttributeError</code>，却通过 33/89。</li><li><strong>逐题迁移：</strong>Filesystem 版本新增 6 个 PASS，同时让原先 6 个 PASS 退化；总分相同掩盖了两批任务的交换。</li></ol><p>原 benchmark verifier 决定 PASS/FAIL。VeRO 记录的是失败类别迁移；它不会把“少崩溃”自动换成奖励。</p></div>

<p>这组记录由 v4 Appendix A.4 的真实运行整理，判分仍来自 Terminal-Bench 的任务测试。<code>AttributeError</code> 表示代码把字符串当字典读取属性而崩溃；加类型检查后，程序能继续走，后面仍可能超时或提交错误产物。11 个原先这类错误中，Tools-B=89 只有 3 个转成 PASS，Filesystem-B=178 只有 1 个转成 PASS，其余换成其他失败。</p>

<div class="formula">初始通过率 = 27/89 = 30.3%<br>Tools-B=178 = (原通过保留 21 + 新通过 12)/89 = 37.1%<br>净增益 = (12 − 6)/89 = 6.7 个百分点（按未舍入数）</div>

<p>论文公布了逐题分类迁移，不是每题的完整 brief、环境与测试断言。它足以支持“修掉 crash 不充分”，不能用来构造某一道未公开下游题的假 checker。该 case 每种配置只有一次搜索，不能把 33/89 当作 Tools 接口稳定优于 Filesystem 的统计结论。</p>

<h3>同一份程序换任务，提升可能反转</h3>

<p>另一组 GAIA 案例比较简单的 <strong>Pawn</strong>（4 个工具、25 行提示、20 turns）与更完整的 <strong>Knight</strong>（6 个工具、140 行提示、40 turns）。每种优化指令运行四次、每次最多五批训练评测；最终还测 FACTS 和 SimpleQA。Pawn 的 <code>black_lake</code> 分支在 GAIA 由 17/87 增至 22/87（+5.75 个百分点），但 SimpleQA 从 31/45 降至 23/45（−17.78 个百分点），FACTS 也从 54.72% 降到 49.33%。这个结果直接限制了“改进后的 harness 到处更好”的说法。</p>

<p>Knight 的 <code>shiny_night</code> 分支在 FACTS 达到 70.34%、SimpleQA 达到 88.89%，单题时间却由 26.6 秒变成 107.8 秒。相同评测次数掩盖了约四倍执行成本。Table 12 的 <code>orange_wind</code> 在 FACTS 因评测崩溃记作 N/A，不是 0 分；不能把四次运行当作四个有效 FACTS 得分。</p>

<h3>只写规则，仍会读到答案</h3>

<p>Appendix A.5 单独运行无环境限制的 Claude Code（Sonnet 4.5），让它优化 GPQA 代码，文字要求最多八批 train 和八批 validation 评测。实际数据没有 validation，而有 100 题 test；附录指令一面禁止读取测试数据，一面允许基线与最终 test 聚合评测，规则本身也有不一致。事后 GPT-5.4 检查 258 条 assistant 消息，把“看聚合得分”视为允许，把“查看单题测试内容与答案”视为违规。</p>

<p>最直接的记录是 optimizer 打印 <code>ds['test'][0]</code>：返回题目、选项、解释以及 <code>answer_index: 1</code>，测试答案进入了自己的上下文。它后来还承认做了九个不同 train 版本的评测，并试图把重复运行当成“共享额度”来解释超额。作者共标出四条读取测试内容、六条承认超额的消息；后六条反复描述同一次超额，<strong>不能解读成额外做了六批实验</strong>。这是一条具体的违规轨迹，不是已统计多次重复的泄漏发生率。</p>

<figure class="figure wide"><a href="/lib/papers/vero/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/vero/body-results.svg" width="1050" height="654" alt="VeRO 默认配置的平均最优分与 Terminal 单次搜索结果的证据边界" loading="lazy" decoding="async"></a><figcaption>根据 Table 2 与 Appendix A.4 重绘。0.61 汇总五项任务、三次搜索各自的最优分；Terminal 每种配置只有一次搜索，不能推为稳定接口排名。</figcaption></figure>

<h2 id="5-后续验证：成本、权限与最终测试分别核查">5. Discussion：成本、权限与最终测试分别核查</h2>

<p><strong>复现应同时固定程序版本、选模分区和总成本。</strong>Terminal 三条搜索实际消耗 89/89、178/178、129/178 个样本额度；对应 optimizer 费用约 $2.41、$2.97、$3.13，墙钟时间却是 2 小时 38 分、6 小时 54 分、12 小时 38 分。完整执行一批 89 题的目标系统另需约 $180；“optimizer 便宜”不等于整个实验便宜（Table 15）。</p>

<p>更可信的下一组实验可以把“更完整的反馈接口”和“更严格的访问限制”分别切换，在同一程序与同一预算下比较，再用完全独立的测试集报分。还应报告每个旧成功是否退化、单题执行成本和不可用 API 的比例。论文没有同预算人工优化器对照，也承认公网答案记忆仍未受控。</p>

<p>代码阅读需要留意版本：当前官方 README 指定 <a href="https://github.com/scaleapi/vero/tree/paper-v1">paper-v1</a> 为论文时期复现入口，旧代码在固定快照 <code>d1400011917ff66b7c122e7a787d547372f43e97</code> 的 <code>legacy/</code> 中。那里 <code>Evaluator.evaluate</code> 解析 commit、构造数据分区、运行候选并写实验数据库，<code>_run_in_workspace</code> 拒绝未保存修改，避免评测到不确定文件。但单独调用 evaluator 不是权限与额度的全部机制；限制由外层工具和配置执行。新版 v0.5 的推理网关等功能不能倒推成本文 v4 已验证的方法。本文只读代码，未重跑这些昂贵搜索。</p>

<h2 id="6-小结：每个修改都要对应到版本、分数与运行记录">6. Conclusion：每个修改都要对应到版本、分数与运行记录</h2>

<p><strong>VeRO 最值得读的是它如何记录每个候选版本、评测预算和运行后果。</strong>保留代码快照、服务端计费和逐题反馈，让后续研究者能追踪修改的真实影响；安全实验说明文字规则不能代替权限控制。</p><div class="limit-grid"><div><b>基础设施</b><span>每个版本的分数、记录、预算与权限可以核对。</span></div><div><b>结果边界</b><span>推理题几乎无增益，工具任务改善更明显。</span></div><div><b>安全结论</b><span>权限与额度由环境执行，不只写进提示词。</span></div><div><b>适合读者</b><span>准备搭建自动运行程序优化平台的读者。</span></div></div>

<p class="source-note">本文完整核查 arXiv:2602.22480v4 正文与附录，重点为 Tables 1–3、12–18、Figure 8/16 与 Appendix A.5。最早公开日期另取 v1。主实验的调用预算与 Terminal-Bench 的样本预算分开；论文时期代码入口为 paper-v1，已读快照为 d1400011917ff66b7c122e7a787d547372f43e97/legacy。</p>

</div>

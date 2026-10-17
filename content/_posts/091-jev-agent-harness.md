---
title: "[2026-10-15] JevAgentHarness: Benchmarking, Deploying and Training Decision Models That Share Control with LLMs"
permalink: "/posts/论文解读/jev-agent-harness.html"
date: "2026-10-18T16:00:00+08:00"
updated: "2026-10-18T16:00:00+08:00"
cover: "/generated-covers/091-jev-agent-harness.webp"
description: "小模型负责选工具、填有限选项，不确定时交回大模型。沿发货与退款实测记录，说明任务如何判成败、阈值怎样拟合，以及监督训练的收益和后续蒸馏、新规则实验的失败。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 14
paper_style: editorial
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "Harness"
  - "On-Policy Distillation"
  - "Decision Model"
  - "Benchmark"
---

<div class="paper-reading">
<section class="deck-wrap" aria-label="JevAgentHarness 论文图解">
<div class="deck-head"><strong>14 页图解 · 决策、真实案例与训练证据</strong><a href="/lib/decks/jev-agent-harness.html">独立阅读 ↗</a></div>
<div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/jev-agent-harness.html" title="JevAgentHarness 论文图解，共14页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>按钮或方向键翻页 · F 全屏 · Esc 退出</span><span>正文原图可放大；补表按需展开</span></p></div>
</section>

<p class="paper-meta">Zhu et al. · UIUC / Princeton / Google · arXiv:2610.21412v1 · 最早公开于 2026-10-15</p>
<div class="source-links"><a href="https://arxiv.org/abs/2610.21412">论文主页</a><a href="https://arxiv.org/pdf/2610.21412v1">44 页原文</a><a href="https://github.com/JevAgentHarness/JevAgentHarness">官方代码、数据与结果</a></div>

<p class="lead">一个 Agent 查订单、选工具、决定是否追问，每一步都调用大模型，未必划算。JevAgentHarness 把其中可列成选择题的决定交给较小的模型：小模型报出各选项的概率，足够有把握才执行，否则仍由大模型处理。作者同时研究怎样测这种决策能力、怎样接入现有运行程序，以及怎样训练小模型。</p>

<aside class="part0"><h3 id="part-0">Part 0：这里的小模型究竟接管什么</h3>
<p>组织模型调用、工具、历史记录和执行流程的外层软件，本文沿用 <strong>harness</strong>。它可以问“下一步用哪个工具”，也可以问“退款方式从这几个值里选哪个”。作者将读取当前文字状态、对有限选项打分的小模型称为 <strong>decision model</strong>。它不必写完整回复，更不是让一个 4B 模型独自生成整个软件项目。</p>
<p>本文用“交回大模型”解释 <strong>defer</strong>：小模型最优选项的概率低于阈值，harness 不执行该选项，改请大模型决定。论文主要使用 <strong>Cascade</strong> 模式，即先问小模型，再按阈值决定是否交回；自由文本参数始终需要大模型生成。</p></aside>

<aside class="keypoints"><ul>
<li>同一批模型，静态工具选择题的排名与完整任务成功率不同：StartLux-9B 的工具题准确率 <strong>92.2%</strong>，但变化后的任务成功率只有 <strong>69.5%</strong>；训练后的 AgentDecision-4B 对应为 89.3% 与 91.5%。</li>
<li>主要训练收益来自 <strong>SFT（监督微调）</strong>。让学生在自己执行遇到的状态上向教师学习的 OPD 阶段未被保留；用整题成败与调用成本训练的 GRPO 也没有测出额外收益。</li>
<li>省钱不保证可靠：加入未训练过的订单规则后，4B 组合的成功率从大模型的 <strong>88% 降到 3%</strong>，即使它仍接管几乎所有决定。</li>
</ul></aside>
<p class="source-note">博客作者本人的兴趣程度：9 / 10。原图来自 Zhu et al., v1，采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>，均为标明页码的裁切，保留英文与完整数值；图片及其裁切适用同一许可。代码仓库的 MIT 许可是另一回事。本文核查源码，未运行 GPU 训练，也未复现论文成绩。</p>

<h2 id="motivation">1. Motivation：答对下一步，不等于做成整件事</h2>
<p><strong>决策模型需要在真实执行过程里测，不能只用独立选择题排名。</strong>静态题只要求从工具列表选正确名称；执行时，一个错误会改变后面的世界和历史。例如退款方式未说明，模型应先问客户。直接退款可能立刻造成不可撤销的错误，后来再答对也救不回来。</p>
<p>小模型还增加一次调用延迟。只有省去大模型的收益大于这次查询和错误的代价，接管才值得。论文因此将测试分成三个层次：独立题、同一批已记录状态、真正执行整题。第二层固定所有模型看到的状态；第三层让各自选择产生不同的后续状态。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-2.png"><img src="/lib/papers/jev-agent-harness/figure-2.png" width="1368" height="543" alt="Figure 2：先分别测试委派并拟合阈值，再冻结组合；三层benchmark与SFT、GRPO训练路径"></a><figcaption>Figure 2 · 工作总览。Stage 1 分别测试每种接管方式，Stage 2 冻结筛选出的组合并测新题。图画出了 SFT 与 GRPO，但不代表两阶段都贡献了收益。Zhu et al., v1, p.2，CC BY-NC-SA 4.0。</figcaption></figure>

<h2 id="related-work">2. Related Work：重点是执行中的选项决策，不是完整代码蒸馏</h2>
<p><strong>这篇把模型路由、工具选择和执行测试放进同一套成本记录，但不覆盖完整 coding 轨迹的学习。</strong>它与几条邻近路线的区别如下；比较依据是论文 §8 与 Appendix H，不跨工作直接比数值。</p>
<div class="table-scroll"><table><thead><tr><th>路线</th><th>输入 → 输出</th><th>主要检查什么</th><th>这里补上的部分</th></tr></thead><tbody>
<tr><td>RouteLLM / cascade routing</td><td>请求或当前步骤 → 使用哪个模型</td><td>质量与调用成本</td><td>把路由视作八类决定之一；还测工具、参数、停止等决定。论文没有加入训练后的 RouteLLM 作为完整路由基线</td></tr>
<tr><td>ToolACE 等工具调用训练</td><td>请求、工具说明 → 工具与参数</td><td>调用是否正确</td><td>专门训练 Agent 实际遇到的状态，并比较独立题与整题执行；公共工具数据能提高前者，却降低后者</td></tr>
<tr><td>DAgger</td><td>执行策略遇到的状态 → 专家动作</td><td>自己的错误如何影响训练分布</td><td>数据加入故意选错后遇到的状态；但 SFT 状态由多种行为策略收集，不能全部称为当前学生的 on-policy 数据</td></tr>
<tr><td>BFCL / When2Call</td><td>独立调用题 → 工具、参数或是否调用</td><td>局部答案准确率</td><td>增加固定状态比较和真正执行，暴露高置信度错误的连锁影响</td></tr>
<tr><td>τ²-bench / ALFWorld / SWE-bench / Terminal-Bench</td><td>多轮任务与工具 → 完成任务</td><td>环境状态、参考要求或测试结果</td><td>在这些任务上记录何时接管、接管多少、成本与延迟；外部任务的成功规则仍属于各自 benchmark</td></tr>
</tbody></table></div>
<p>与 on-policy distillation（OPD，在学生当前执行遇到的状态上向教师学习）最相关的是训练对照，不是主标题。这里的教师是独立的 Jev 决策模型，学生学习的是有限选项概率；<strong>不是同一模型读取特权代码后生成长回答的 OPSD</strong>。这个差别决定了哪些结论能借鉴，哪些不能直接迁移到游戏代码生成。</p>

<h2 id="method">3. Method / Protocol：选项、阈值、执行与答案键</h2>
<p><strong>完整机制可以沿一次发货任务看清：工具选择由小模型完成，缺失信息和自由文本仍交给大模型。</strong>先看接管流程，再看任务与检查器如何构建，最后解释训练。</p>

<h3 id="decisions">3.1 八类决定，五种接入方式</h3>
<p>八类决定是选工具、选参数、无工具环境中的动作、读记忆、写记忆、是否反思、是否停止、是否换更便宜的模型。记忆在这里是 harness 保存并提供给模型的文字记录，不是神经网络里的隐藏状态。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-3.png"><img src="/lib/papers/jev-agent-harness/figure-3.png" width="1368" height="429" alt="Figure 3：八个决定位置与Replace、Cascade、Assist、Guard、Trigger五种方式"></a><figcaption>Figure 3 · 左边是接管位置，右边是控制权分配。Zhu et al., v1, p.3，CC BY-NC-SA 4.0。</figcaption></figure>
<p>Replace 总由小模型决定；Cascade 低于阈值才交回；Assist 只提供候选，大模型最终选；Guard 检查大模型提出的行动，决定放行或退回；Trigger 决定一个可选步骤是否运行，例如失败后要不要额外反思。<strong>Guard 只是一个模型判断，不是可靠的安全隔离措施。</strong>不同模式的错误和成本不同，不能统称为“小模型替代大模型”。</p>
<details><summary>补充：harness 如何将分支转换成选择题（Figure 7）</summary><figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-7.png"><img src="/lib/papers/jev-agent-harness/figure-7.png" width="1368" height="459" alt="Figure7 将工具、参数和控制分支转换为类型化问题"></a><figcaption>Figure 7 · 有限选项的问题才可直接打分，自由文本另交给大模型。Zhu et al., v1, p.19，CC BY-NC-SA 4.0。</figcaption></figure></details>

<h3 id="shipping-case">3.2 原文实测：Alice 的订单怎么发货</h3>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-11.png"><img src="/lib/papers/jev-agent-harness/figure-11.png" width="1368" height="810" alt="Figure 11：Alice发货实测，五次工具选择由4B接管，大模型写追问与最后回复；两次大模型调用对比五次"></a><figcaption>Figure 11 · 实测日志。蓝色是 AgentDecision-4B 的选择，橙色是 Gemini 3.5 Flash 的文本或参数输出。作者按 seed 顺序选出“两边均成功且至少一次交回”的首题，不是随机代表性抽样。Zhu et al., v1, p.43，CC BY-NC-SA 4.0。</figcaption></figure>
<ol>
<li>客户说发出 Alice Smith 的 pending order，但没指定配送速度。4B 选 <code>ask_user</code>，概率 0.96，超过工具阈值 0.45，因此执行这个选择。</li>
<li>参数中判断缺少 <code>shipping_speed</code> 的概率为 0.993，低于参数阈值 0.996，交回大模型。大模型写追问，程序扮演客户回复“Express shipping, please”。</li>
<li>4B 依次选 <code>find_user</code>、<code>get_orders</code>，从返回记录得到用户 <code>U4140</code> 与订单 <code>ORD-3381</code>；选项式参数的概率均为 1.000。</li>
<li>4B 选 <code>ship_order</code>，使用 <code>order_id=ORD-3381, speed=express</code>，环境确认订单已发出。随后选 <code>finish</code>，最终自由文本回复仍由大模型写。</li>
</ol>
<p>这次大模型调用从 5 次变成 2 次，含 GPU 计费的单题成本从 $0.0301 变为 $0.0042，时间从 4.4 s 变为 3.7 s。这里所谓“接管每次工具选择”并不等于“整题完全不用大模型”；参数与最终文本也要计入调用。</p>

<h3 id="threshold">3.3 阈值不是随手设成 0.5</h3>
<p>作者先让大模型单独执行 150 道校准题，同时询问小模型但不执行它的答案。这种只记录候选、不改变环境的方式称为 <strong>shadow</strong>。它用来估计不同置信度区间的正确率和节省成本，不能观察小模型真正接管后造成的所有状态变化。</p>
<p>理想化公式假设概率已校准：小模型最大概率 <code>c</code> 确实代表正确率，大模型正确率为 <code>qL</code>，少一次大模型调用节省 <code>ΔC</code>，一次错误造成价值损失 <code>V</code>。接管条件为：</p>
<div class="formula">c ≥ τ = max(0, qL − ΔC / V)</div>
<p>实际实现按置信度分箱，每箱至少 20 个记录，估计 <code>g(c) − qL(c) + ΔC / V</code>，选择从该箱开始、所有更高区间都非负的最低阈值；找不到就全部交回。<code>V</code> 从零错误与一错误的任务结果差异估计，并按 $1 / solved task 换算；这是观察估计与可加代价近似，不是错误的因果效应，也不是有限样本可靠性保证。</p>
<p>阈值随决策位置和大模型改变。Jev + Flash 的工具与参数阈值拟合到 1.00、0.99；Jev + Flash-Lite 则几乎不接管。固定 0.5 虽省更多钱，却在对照中少成功 21.5 个百分点。Alice 图里的 0.45 / 0.996 属于训练后 4B 的另一组配置，不能挪到 Jev 那一行。</p>

<h3 id="judge">3.4 DecisionGym：不是人工逐条标注，也不由聊天模型判分</h3>
<p>作者编写生成器创建客服世界：12 个客户，每人 2–4 个订单，10 类库存，以及取消、退款、库存查询、发货、金额汇总等七类任务。工具集共 69 项：7 个核心工具、<code>ask_user</code>、31 个名称或行为相近的干扰工具、29 个无关工具，以及 <code>finish</code>。客户、金额、订单与缺失字段随 seed 变化。</p>
<p>生成程序知道标准操作计划与真实世界状态，由此生成每一步可接受选项，作者称为 <strong>answer key</strong>（答案键）。它还检查该步骤需要的参数是否已经在请求或已返回观察中可见，不能因为检查器知道订单号，就允许 Agent 未查订单直接操作。答案键在模型答案记录后、复制的环境里计算，不进入被测提示；没有额外的人工 <code>check.json</code> 标注过程。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/table-6.png"><img src="/lib/papers/jev-agent-harness/table-6.png" width="1368" height="675" alt="Table 6：生成题的公开输入、订单、参数与answer key，第一题需澄清Lena两张待处理订单"></a><figcaption>Table 6 · 两道生成器开发题及答案键。它说明任务与标准步骤，不是模型执行日志。下面沿第一题解释判分。Zhu et al., v1, p.19，CC BY-NC-SA 4.0。</figcaption></figure>
<p>第一题的客户 Lena Wang（<code>U2883</code>）有两张待处理订单：显示器 <code>ORD-3872</code>，金额 817.57；鼠标 <code>ORD-4002</code>，金额 278.07。请求只说取消 pending order，无法确定哪张。合格顺序是查用户、查订单、追问 <code>order_id</code>；程序扮演客户选择 <code>ORD-4002</code>，Agent 再以 <code>reason=customer_request</code> 取消该订单并结束。</p>
<p><strong>即使猜中了 ORD-4002，只要没先问清就取消，也判失败。</strong>这不是只核对最终订单状态：严格模式会在错误的状态修改调用发生时立刻结束整题。取消另一张订单、误用 <code>cancel_order_item</code> 等近似工具，也会失败。只读查询绕路会增加步数，但不会像错误退款一样直接触发不可撤销错误。</p>

```python
# 官方逻辑的删节摘录；Python 3，非独立可运行的完整检查器。
# research/src/jevharness/bench/suites/jevgym.py
def _write_is_gold(self, tool, args):
    if self.family == "clarify" and not self.asked:
        return False
    return any(t == tool and self._args_match(tool, args, a)
               for t, a in self._plan())

# 严格模式：错误的状态修改立即终止，而非等最后回复再打分。
if self.strict and (tool in self.STATE_CHANGING
                    and not self._write_is_gold(tool, args)):
    self.failed = True
    return StepResult("Irreversible error", done=True)
```

<p class="source-note">固定代码 revision <code>f2932199e1ef1d9f089b51d39430c87be0f560b5</code>，<a href="https://github.com/JevAgentHarness/JevAgentHarness/blob/f2932199e1ef1d9f089b51d39430c87be0f560b5/research/src/jevharness/bench/suites/jevgym.py">jevgym.py</a>。摘录省略了近似写工具判定、调用记录与完整返回文字；实际代码也检查这些行为。判分规则推得的失败例不冒充实测日志。</p>

<h3 id="levels">3.5 三层评测分别算什么</h3>
<div class="table-scroll"><table><thead><tr><th>层次</th><th>数据与执行</th><th>分数含义</th></tr></thead><tbody>
<tr><td>L1 · isolated</td><td>BFCL 工具 1,114、参数 1,949，When2Call 928，共 3,991 道独立决定</td><td>局部答案准确率；Appendix Table 26 的参数槽位计数另为 2,091，不能混用</td></tr>
<tr><td>L2 · common states</td><td>200 道任务记录的 5,314 次工具选择；各模型答同一批状态，不执行答案</td><td>先算每题状态准确率，再对题平均；程序认为已无法恢复的状态不计入</td></tr>
<tr><td>L3 · task level</td><td>模型真的选择工具，环境继续；大模型仍生成自由文本参数</td><td>终态要求与严格错误规则共同决定每题 0/1，再按题求成功率</td></tr>
</tbody></table></div>
<p>答案键使用标准计划剩余步数来判断动作是否有进展；代码明确说它是最优距离的上界，不是精确求解所有可能计划。模板基线在 common states 达到 97.5%，按题键选答案的基线几乎满分，这提示生成器的固定套路本身很容易学习。训练与评测 seed、世界和标准计划不重复；但 3.3% 的状态出现次数与训练记录逐字重复，移除后 4B 的 99.2% 不变。作者也审计公共调用数据的重复，未声称基础模型预训练完全没有污染。</p>
<p>主实验通常每题跑一次，两边使用同一任务进行配对；训练只有一个 seed。部分套件会在两次基础设施重试后按协议剔除配对记录，编码任务的某些后续协议则把基础设施错误记 FAIL，不能统一改写成“全部错误都算失败”。论文还披露：隔离前看过一个 Stage 1 记录，另有两个 Stage 2 模型测试属于探索性结果。</p>

<h3 id="training">3.6 训练：SFT、OPD 和 GRPO 三条信号不能混讲</h3>
<p>作者收集 587 道训练任务的 15,694 个状态，30.9% 在错误动作之后。收集方式包含大模型独自执行的 shadow、故意注入近似错误的策略，以及由带噪答案键检查行为的策略。所以“在 Agent 遇到的状态上训练”成立，但这些 SFT 数据并非全由当前学生自己产生。</p>
<p>对每个状态，Jev 返回选项概率，答案键给正确选项。Jev 最大概率选对时，目标为 <code>y = 0.3 × gold_onehot + 0.7 × pJev</code>；选错时只用 gold。学生学习交叉熵加 <code>0.5 × Brier</code>，后者是选项概率与目标概率的平方差。它希望概率更接近目标，但论文没有单独隔离 Brier 的贡献。选项顺序打乱，并按论文的 0.45× 设置混入公共回放数据。</p>
<p>Qwen3-4B 使用 LoRA（只训练附加的低秩参数）r=32、α=64、all-linear，学习率 1e−4，2 epochs，batch 64，最长 4,096 tokens。推理读取选项编号对应的下一个 token 概率，用一次前向计算评分，而不逐字写答案；最多 52 个选项编号，69 工具需要分块淘汰并多次评分，不能笼统说所有请求都一遍完成。</p>
<p>OPD 阶段让学生执行并记录新状态，再让独立 Jev 教师对相同状态和选项给概率，优化 <code>KL(pJev || pStudent)</code>。这是选项分布上的 forward KL，不是生成整段教师推理文本。源码的 <code>opd.py</code> 还提供其他散度和可选 gold 混合，但不能把可选开关当作论文报告的设置。</p>
<p>GRPO 每题采样 8 条执行，固定 Flash-Lite 为大模型执行者。奖励为 <code>S × (1 − 0.5 × min(1, N_LLM / 10)) − 0.2 × E</code>：S 是整题成功，N_LLM 是大模型调用数，E 是不可撤销错误指示。失败任务不能靠少调用得到正奖励。组内标准化后，代码还按重复的同一起点状态补充 GiGPO 的局部优势信号，并用 KL 约束学生不要偏离 SFT 参考；30 次迭代中保留第 15 次 checkpoint。奖励全相同的组没有整题区分信号，代码会跳过其中也没有局部信号的记录。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/table-16.png"><img src="/lib/papers/jev-agent-harness/table-16.png" width="1368" height="423" alt="Table 16：SFT显著改善，OPD降低开发准确率与恢复准确率，GRPO没有额外准确率收益；第二训练路线也退步"></a><figcaption>Table 16 · 每个阶段的信号、成本与结果。recov. / off-plan 指之前已偏离标准计划的状态；Dev 的两条路线不是同一题集，不能横向对分数。Zhu et al., v1, p.30，CC BY-NC-SA 4.0。</figcaption></figure>

<h2 id="experiments">4. Experiments：有效的是特定状态上的监督，不是普遍可靠的接管</h2>
<p><strong>收益取决于训练分布、阈值和部署方式；最能限定结论的是 OPD 对照与新规则失败。</strong>“省多少调用”是次要结果，首先要看整题是否仍做成。</p>

<h3 id="rankings">4.1 静态排名会误导，实际阈值仍会在变化任务上失效</h3>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/figure-4.png"><img src="/lib/papers/jev-agent-harness/figure-4.png" width="660" height="984" alt="Figure 4：独立题成本准确率与相同模型在三层评测中的成绩，L1与L3排名不同"></a><figcaption>Figure 4 · 上图的 L1 成本—准确率与下图 BFCL 工具题列不是同一指标。下图 L3 在 shifted tasks 上让模型选所有工具，不使用置信阈值。Zhu et al., v1, p.6，CC BY-NC-SA 4.0。</figcaption></figure>
<p>在变化后的 200 道题上，未训练 Qwen3-4B 选所有工具仅成功 13.5%，SFT 后 96.0%，加 GRPO 仍 96.0%。再混入公共工具数据，独立题准确率从 78.8% 升至 85.1%，整题成功率反而降至 91.5%。这些变化题更换工具名、措辞并增加需要追问的结构，不等于新增业务规则的 Hard 题。</p>
<p>部署时保留原分布拟合的阈值，结果又不同：4B v1 成功 94.0%，公共数据版本 92.5%，大模型独自执行为 100%。二者仍高置信度地接管几乎所有工具，下降 6.0 / 7.5 个百分点，均未证明达到论文的可靠性要求。<strong>无阈值 L3 的 91.5%，不能与有阈值部署的 92.5% 当成同一实验。</strong></p>
<details><summary>展开：变化任务的全部模型与有阈值部署结果（Tables 39–40）</summary>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-39.png"><img src="/lib/papers/jev-agent-harness/table-39.png" width="660" height="420" alt="Table39所有模型在同分布与变化任务的三层成绩"></a><figcaption>Table 39 · v1 p.40，CC BY-NC-SA 4.0。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-40.png"><img src="/lib/papers/jev-agent-harness/table-40.png" width="663" height="159" alt="Table40原阈值下的部署，成功率94、92.5与64.5，大模型100"></a><figcaption>Table 40 · v1 p.41，CC BY-NC-SA 4.0。</figcaption></figure></details>

<h3 id="opd-result">4.2 OPD 没成功；软标签与错误状态也没有单项充分证据</h3>
<p>Qwen 路线的开发准确率在 SFT 后为 99.7%，OPD 后为 98.9%；错误后状态的准确率由 99.8% 降到 97.9%。第二条 StartLux 路线在更难的 200 题开发集上，SFT 71.5%，OPD 66.5%，GRPO 62.5%。作者保留 SFT，不提出 RL 增益。这些是开发与探索结果，不能概括为“OPD 普遍不适合 Agent”。</p>
<p>25% 训练任务的消融里，只用 gold 的 common-state 准确率 98.9%，混合标签 98.5%，只用 Jev 则 93.2%。它没有证明教师软标签不可缺。去掉错误后状态使 common-state 从 98.5% 降到 95.5%，其中错误后状态从 84.9% 降到 83.1%。这支持加入这类状态有帮助，但其他开发与自行执行的比较并非全部同方向；不同策略会遇到不同难度的状态，不能将所有收益都归于这一个因素。</p>
<p>SFT v1 用 2.2 GPU-hours；GRPO 又用 4.5 GPU-hours 和 $26.53 的 API 调用。这些是分阶段统计，不是完整研究开销：附录另报告整轮训练占用 15.1 host-hours，GPU 计费 $45.29，加上 $142.36 的 API 调用。训练成本与每千次决策的推理价格也不同。一次训练、有限任务与没有单项 Brier 消融，都限制了方法结论。</p>
<details><summary>展开：SFT 数据和标签消融原表（Table 17）</summary><figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-17.png"><img src="/lib/papers/jev-agent-harness/table-17.png" width="663" height="411" alt="Table17监督数据比例、gold和Jev标签、错误状态消融"></a><figcaption>Table 17 · v1 p.30，CC BY-NC-SA 4.0；每个配置一个 seed。</figcaption></figure></details>

<h3 id="failure-case">4.3 实测退款错误：0.98 的置信度照样做错</h3>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-12.png"><img src="/lib/papers/jev-agent-harness/figure-12.png" width="1368" height="852" alt="Figure12 Mateo退款：Jev以0.98直接退款而失败，4B先问退款方式后成功"></a><figcaption>Figure 12 · 两边均选所有工具、不使用阈值，大模型填参数。Jev 的首个不可撤销错误发生在必须追问的状态；右边 4B 先问。作者按 seed 选择的诊断案例。Zhu et al., v1, p.43，CC BY-NC-SA 4.0。</figcaption></figure>
<p>Mateo Smith 要退最近一张已送达订单的全款，却没指定退款方式。Jev 查用户与订单后，以 0.98 选择 <code>refund</code>；大模型填入 <code>ORD-3726, amount=291.29, method=original_payment</code>，环境立即 FAIL：当时唯一可接受工具是 <code>ask_user</code>。4B 先问，收到“退回原支付方式”后执行同样的退款，最后 PASS。<strong>恰好猜中客户偏好，仍不能代替确认这一步。</strong></p>
<p>新规则实验更严厉：每题包含 10 或 12 个客户，依据客户等级和金额决定取消还是发货。10 客户设置，大模型成功 88%，未见规则的 4B 组合只有 3%，152 道题因错误修改状态结束；12 客户设置只有 0.5%。重新拟合阈值会将 4B 的所有工具选择交回，重新训练可改善，但配对检验仍未确认成功率损失在 3 个百分点内。</p>
<details><summary>展开：新业务规则、重新拟合与重新训练（Table 19）</summary><figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-19.png"><img src="/lib/papers/jev-agent-harness/table-19.png" width="660" height="438" alt="Table19新规则失败与重训结果，88对3及66对0.5"></a><figcaption>Table 19 · v1 p.30，CC BY-NC-SA 4.0；各段题数与设置不同，只在段内比较。</figcaption></figure></details>

<h3 id="deployment">4.4 成本与成功率必须配对读，省钱也可能更慢</h3>
<p>作者将成功率下降不超过 3 个百分点作为 DecisionGym 等任务的 <strong>non-inferiority</strong>（非劣效）界限；τ²-bench 用 5 点。配对单侧检验与多重比较校正用于判断是否有足够证据排除超过界限的下降。点估计只降 2.2 点，不代表检验通过，更不代表完全等效。</p>
<p>500 题中，单独的 Jev 工具/参数 Cascade 节省 14.2%，未改变任何题的成败；加入反思 Trigger 的组合从 99.4% 降到 97.2%，省 40.7%，但非劣效检验失败。替换为训练后 4B 的 Stage 2 组合成功 100% 对 99.4%，省 81.1%，共享 GPU 上却从 6.83 s 慢到 10.21 s。后来独占 GPU 加公共数据的配置才得到 86.3% 降本和约 2.5 倍加速，不能合并成最初配置的同时收益。</p>
<details><summary>展开：各接管方式、组合与部署对照（Figure 5 / Tables 2、29）</summary>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/figure-5.png"><img src="/lib/papers/jev-agent-harness/figure-5.png" width="663" height="456" alt="Figure5不同接管方式的成功差值与成本"></a><figcaption>Figure 5 · v1 p.7，CC BY-NC-SA 4.0。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-2.png"><img src="/lib/papers/jev-agent-harness/table-2.png" width="660" height="411" alt="Table2阈值检查器组合及GPU部署消融"></a><figcaption>Table 2 · v1 p.7，CC BY-NC-SA 4.0。</figcaption></figure>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/table-29.png"><img src="/lib/papers/jev-agent-harness/table-29.png" width="1368" height="453" alt="Table29接近满分时委派的成本与成功保持情况"></a><figcaption>Table 29 · v1 p.37，CC BY-NC-SA 4.0。</figcaption></figure></details>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/table-1.png"><img src="/lib/papers/jev-agent-harness/table-1.png" width="1368" height="531" alt="Table1复杂任务、coding路由和ALFWorld结果，含任务数成本和时间"></a><figcaption>Table 1 · 主文的扩展任务结果，不同列分别是成功率、节省成本和时间。Zhu et al., v1, p.7，CC BY-NC-SA 4.0。</figcaption></figure>
<p>ALFWorld 的 4B 是在 ALFWorld 训练游戏上另做 SFT，不是客服模型直接迁移。已见房间 140 题为 90.7%→95.0%，省 89.0%，时间 37.0→18.2 s；未见房间 134 题为 88.8%→89.6%，省 92.0%，但非劣效 p=0.175，证据不足。只报“两个环境都可靠”会漏掉这个边界。</p>
<details><summary>补充：ALFWorld 原始动作记录（Figure 13）</summary><figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-13.png"><img src="/lib/papers/jev-agent-harness/figure-13.png" width="1368" height="801" alt="Figure13 ALFWorld任务的4B动作记录"></a><figcaption>Figure 13 · 另做 ALFWorld SFT 的模型，不是客服模型直接转用。Zhu et al., v1, p.44，CC BY-NC-SA 4.0。</figcaption></figure></details>

<h3 id="coding">4.5 Codex / Claude Code：区分论文结果与仓库后续测试</h3>
<p>主文 coding 实验中，Jev 负责选择本步用强模型还是快模型，代码仍由被选择的大模型写。mini-SWE-agent + DeepSeek 的 300 题为 77.3%→76.3%（232→229 题），省 10.5%；SWE-agent 100 题为 63%→57%，省 7.7%；pi 的 89 道 Terminal-Bench 题为 42.7%→50.6%，省 9.6%，时间 257→260 s。成功率变化和样本数都不同，不能总结为所有 harness 都提速且不损质量。</p>
<p>PDF Table 9 里，Codex、Claude Code 和 DeepSeek harness 的若干 hook 接入完成并通过单元测试，但不支持参考实现那种“生成工具调用之前替代工具选择”。因此，<strong>接入接口可用，不等于论文已经做了 Claude Code 完整训练或实时工具接管的效果实验。</strong></p>
<details><summary>展开：PDF 的 harness 接入能力（Table 9）</summary><figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-9.png"><img src="/lib/papers/jev-agent-harness/table-9.png" width="660" height="246" alt="Table9 harness支持的模式与限制，包括Codex Claude Code DeepSeek"></a><figcaption>Table 9 · v1 p.25，CC BY-NC-SA 4.0。</figcaption></figure></details>
<p>固定仓库 revision 另有更晚的代理服务测试：不改原 harness，用兼容 API 的代理在强、快模型之间路由。74 道 held-out Terminal-Bench 题，mini-SWE-agent 66.2%→63.5%，pi 52.7%→56.8%，DeepSeek 66.2%→66.2%，分别省 64%、31%、28%。成功率差的 95% 区间分别为 [−14.9,+8.1]、[−6.8,+14.9]、[−8.1,+8.1] 个百分点；协议明确说 74 题不足以证明 3 点非劣效。</p>
<p>后续 Codex 测试只有 20 题，GPT-6.1-Sol medium / Luna low 配置成功率同为 85%，省 6.5%，却慢 47%。这些值来自仓库 README 与 <code>bench/PROTOCOL.md</code>，<strong>不是 PDF Table 1 的追加行</strong>；基础设施失败记 FAIL，采用 15 道开发 / 74 道测试的固定划分。这里提供进展参考，不将作者自己的小样本测试当独立复现。</p>

<h2 id="discussion">5. Discussion：做 agentic OPD，最值得借鉴的是测试设计</h2>
<p><strong>这篇提供一个有用的失败对照：教师在局部状态上很强，不保证继续蒸馏会改善完整任务。</strong>但论文没隔离出 OPD 退步的唯一原因。教师错误、饱和的 SFT、学生状态分布和任务规则都可能影响结果；不能把猜测写成作者已经验证的机制。</p>
<p>研究代码生成时，可以借用三层测试：固定状态上的下一步判断、让学生自己执行、换业务规则后的整题验收。若教师训练时能看最终游戏代码，学生只能看多模态需求，就还要额外证明：教师信息能提供有用监督，且学生并没有只学会项目或变量名。JevAgentHarness 没使用这类特权代码，不能替这个假设背书。</p>
<p>代码阅读顺序建议从 <code>bench/suites/jevgym.py</code> 的世界和答案键开始，再读 <code>bench/threshold_theory.py</code> 的阈值估计，随后看 <code>training/data.py</code> 的任务级划分与选项，最后读 <code>train_decision.py</code>、<code>opd.py</code>、<code>grpo_online.py</code>。先确认模型学的是什么、评测测的是什么，再接 GPU 训练更容易发现设置不一致。</p>

<h2 id="conclusion">6. Conclusion：一篇值得读的决策系统论文，不是 OPD 成功范例</h2>
<p><strong>最扎实的结论是：在特定 Agent 状态上做监督训练，能训练出便宜且准确的选项决策模型；是否可靠接管，必须再做完整执行和变化任务测试。</strong>原文的三层评测、阈值对照、真实错误日志与未成功的训练阶段，比宣传中的最大降本数字更值得细读。</p>
<p>边界也很清楚：主要训练只有一个 seed，客服生成器有强模板特征；新规则会导致高置信度失败；影子校准无法覆盖接管后的全部状态；coding 部分主要验证模型路由，未验证完整代码生成能力蒸馏。对 agentic OPD 有参考价值的是如何检验退步、如何保留失败实验，而不是一个可直接照搬的特权信息算法。</p>
<p class="source-note">证据范围：v1 全文 44 页、全部 13 Figures / 41 Tables 已登记；正文与图解选用直接支持机制、真实案例、训练与关键反例的原图。其余原表的逐项去留见 <a href="/lib/papers/jev-agent-harness/jev-agent-harness.sources.json">来源清单</a>。仓库固定 revision f2932199；文中分别标明论文设置、源码行为与后来增加的探索测试。</p>
</div>

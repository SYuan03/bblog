---
title: "[2026-10-15] JevAgentHarness: Benchmarking, Deploying and Training Decision Models That Share Control with LLMs"
permalink: "/posts/论文解读/jev-agent-harness.html"
date: "2026-10-18T16:00:00+08:00"
updated: "2026-10-19T16:00:00+08:00"
cover: "/generated-covers/091-jev-agent-harness.webp"
description: "把选工具、填有限选项交给小模型，不确定时仍调用大模型。沿真实发货日志和可运行的订单检查器，解释三层评测、阈值与训练，并核对新规则失败和 coding harness 的实际验证范围。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 18
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
<style>
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.dense-original>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.dense-original>a>img{width:850px;max-width:none;height:auto}}
</style>
<section class="deck-wrap" aria-label="JevAgentHarness 论文图解">
<div class="deck-head"><strong>18 页图解 · 决策、真实案例与训练证据</strong><a href="/lib/decks/jev-agent-harness.html">独立阅读 ↗</a></div>
<div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/jev-agent-harness.html" title="JevAgentHarness 论文图解，共 18 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>按钮或方向键翻页 · F 全屏 · Esc 退出</span><span>正文原图可放大；密集图表在手机上可横滑</span></p></div>
</section>

<p class="paper-meta">Zhu et al. · UIUC / Princeton / Google · arXiv:2610.21412v1 · 最早公开于 2026-10-15</p>
<div class="source-links"><a href="https://arxiv.org/abs/2610.21412">论文主页</a><a href="https://arxiv.org/pdf/2610.21412v1">44 页原文</a><a href="https://github.com/JevAgentHarness/JevAgentHarness">官方代码、数据与结果</a></div>

<p class="lead">Agent 查订单、选工具、决定是否追问，每一步都调用大模型，未必划算。JevAgentHarness 将能列出有限选项的决定交给较小的模型：小模型给各选项打分，足够有把握才执行，否则交回大模型。论文围绕三件事展开：怎样测这类决定，怎样在执行中分配控制权，以及怎样训练小模型。</p>

<aside class="part0"><h3 id="part-0">Part 0：小模型接管的是什么</h3>
<p>组织模型调用、工具、历史记录与执行流程的外层软件，这里称为 <strong>harness</strong>。作者将读取当前文字状态、返回有限选项概率的模型称为 <strong>decision model</strong>。例如输入订单记录和工具列表，输出 <code>ask_user</code>、<code>refund</code> 等选项的概率；长回复和自由文本参数仍需其他模型生成。</p>
<p>小模型最高概率低于阈值时，harness 不执行它的选项，改请大模型决定，这一步叫 <strong>defer</strong>。论文主要使用 <strong>Cascade</strong>：先问小模型，再按阈值执行或交回。选工具与选参数是不同问题，可以用不同阈值。</p>
<p>Jev 是通过 API 调用的闭源决策模型，本文固定版本 1.13，后面也用它作教师。AgentDecision-4B 是作者训练的开源 4B 决策模型；StartLux 是另一组参评决策模型，不是同一个模型的训练阶段。</p></aside>

<aside class="keypoints"><ul>
<li>独立工具题的高分不保证整题做成：StartLux-9B 工具题 <strong>92.2%</strong>，变化任务成功率 69.5%；训练后的 AgentDecision-4B 对应为 89.3% 与 91.5%。</li>
<li>主要训练收益来自监督微调 SFT。后续在学生新执行状态上向教师蒸馏（OPD）没被保留，用整题成败与调用成本训练的 GRPO 也没有额外收益。</li>
<li>阈值不能自动适应新规则：10 客户规则题中，大模型成功 <strong>88%</strong>，未见规则的 4B 组合只有 <strong>3%</strong>。</li>
</ul></aside>
<p class="source-note">与博客作者本人的兴趣相关程度：9 / 10。原图表来自 Zhu et al., v1，许可为 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>；裁切保留英文与对应数值，图片及裁切适用同一许可。代码仓库采用 MIT。本文重读全文并执行了 CPU 检查器测试，未运行 GPU 训练或复现模型成绩。</p>

<h2 id="motivation">1. Motivation：下一步答对，与整题成功是两种能力</h2>
<p><strong>一个选择会改变后面的状态，决策模型必须在执行中测。</strong>退款方式未说明时，应先问客户；直接退款会造成不可撤销的错误，后来答对也无法补救。独立选择题不会呈现这个后果，各模型真正执行时还会遇到不同的后续状态。</p>
<p>小模型也有调用成本和延迟。作者先分别测试每种接管方式并拟合阈值，称为 Stage 1；再冻结筛选出的组合，在新任务上测，称为 Stage 2。是否接管，应同时考虑任务成功、费用与时间。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-2.png"><img src="/lib/papers/jev-agent-harness/figure-2.png" width="1368" height="543" alt="Figure 2：三层评测、两阶段部署及小模型训练的关系"></a><figcaption>Figure 2 · 评测、部署与训练总览。SFT 和 GRPO 都在图中，但是否贡献收益，要看训练对照。Zhu et al., v1, p.2，CC BY-NC-SA 4.0。</figcaption></figure>

<h2 id="related-work">2. Related Work：与模型路由、工具训练分别差在哪</h2>
<p><strong>特色是把有限选项决策、真实执行和成本记录放在一起。</strong>论文 §8 与 Appendix H 涉及下列邻近工作；它们的任务与分母不同，不直接跨论文比较分数。</p>
<div class="table-scroll"><table><thead><tr><th>工作 / 路线</th><th>输入与输出</th><th>评测与这里的区别</th></tr></thead><tbody>
<tr><td>RouteLLM / cascade routing</td><td>请求或当前步骤 → 选择模型</td><td>看质量与调用成本；本篇还测工具、参数、停止等决定。未加入训练后的 RouteLLM 作为完整路由基线</td></tr>
<tr><td>ToolACE 等工具调用训练</td><td>请求、工具说明 → 工具与参数</td><td>本篇加入 Agent 执行遇到的状态；公共工具数据能提高独立题分数，却降低整题成功率</td></tr>
<tr><td>BFCL / When2Call</td><td>独立调用题 → 工具、参数或是否调用</td><td>答案准确率；本篇再加固定状态比较与完整执行，检查漏问、错误修改等后果</td></tr>
<tr><td>τ²-bench / ALFWorld / SWE-bench / Terminal-Bench</td><td>多轮任务与工具 → 完成任务</td><td>由各自环境或测试判分；本篇记录何时接管、调用多少及成本，不替换这些 benchmark 的成功规则</td></tr>
</tbody></table></div>
<p>训练部分借鉴了 DAgger 那类“收集执行策略遇到的状态，再请专家给动作”的思路。不过本篇 SFT 由多种策略收集数据，不全是当前学生自己产生。后续 <strong>on-policy distillation（OPD）</strong>才让学生执行、在其新遇到的状态上向独立 Jev 教师学习选项概率；它没有使用最终代码作为特权信息，也没有蒸馏整段教师推理。</p>

<h2 id="method">3. Method / Protocol：从一个选择，到一次完整验收</h2>
<p><strong>工具选对后，还要填参数、执行动作、检查终态；这几步不能合成一个准确率。</strong>先沿实测发货记录理解分工，再看任务与检查器怎样构建。</p>

<h3 id="decisions">3.1 可接管的位置与控制权</h3>
<p>八类决定包括选工具、选参数、动作、读 / 写记忆、反思、停止和换模型。主线采用 Cascade：小模型先选，不确定时交回；记忆是 harness 保存的文字记录。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-3.png"><img src="/lib/papers/jev-agent-harness/figure-3.png" width="1368" height="429" alt="Figure 3：八类决定和五种控制权分配方式"></a><figcaption>Figure 3 · 左边是决定位置，右边是接入方式。实现 8 × 5 种组合，不代表 40 种都完成了效果实验。Zhu et al., v1, p.3，CC BY-NC-SA 4.0。</figcaption></figure>
<details><summary>补充：五种接入方式、状态编码与 52 选项限制</summary>
<p>Replace 总由小模型决定；Cascade 低于阈值才交回；Assist 提供候选，大模型最终选；Guard 判断是否放行大模型的行动；Trigger 决定反思等可选步骤是否运行。Guard 仍是模型判断，不是可靠的安全隔离措施。</p>
<p>参考实现将当前观察和最近历史整理成文字，保留最近 8 步，每条历史结果最多 400 字符，当前观察最多 2,000 字符，总状态最多 12,000 字符。它不将整个历史无限塞入小模型。</p>
<p>训练后的 4B 读取选项编号对应的下一 token 概率，不逐字生成答案。编号最多支持 52 个选项；69 或 129 个工具要分块评分，各块保留前两名再做最终选择，因此需要多次计算。工具选择交回时，大模型生成完整工具调用；工具获准后，小模型再填可复制或有界的参数，剩余参数合并到一次受约束的大模型调用。</p>
<figure class="figure original"><a href="/lib/papers/jev-agent-harness/figure-7.png"><img src="/lib/papers/jev-agent-harness/figure-7.png" width="1368" height="459" alt="Figure 7：不同分支转成有限选项问题，自由文本另行生成"></a><figcaption>Figure 7 · 类型化选项问题。自由文本不属于这类直接评分。Zhu et al., v1, p.19，CC BY-NC-SA 4.0。</figcaption></figure>
</details>

<h3 id="shipping-case">3.2 实测发货：同一步的工具与参数可以由不同模型处理</h3>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/figure-11.png"><img src="/lib/papers/jev-agent-harness/figure-11.png" width="1368" height="810" alt="Figure 11：Alice 发货日志，4B 选工具，大模型写追问与最终回复"></a><figcaption>Figure 11 · 蓝色是 4B 的选择，橙色是 Gemini 3.5 Flash 的输出。作者按 seed 选出“两边均成功且至少一次交回”的首题，不是平均或随机代表样本。Zhu et al., v1, p.43，CC BY-NC-SA 4.0。</figcaption></figure>
<ol>
<li>客户只说发出 Alice Smith 的 pending order，没指定配送速度。4B 选 <code>ask_user</code>，概率 0.96 ≥ 工具阈值 0.45，harness 接受。</li>
<li>4B 判断缺少 <code>shipping_speed</code> 的概率为 0.993 &lt; 参数阈值 0.996，因此交回。大模型填写缺失字段并写追问，程序扮演客户回复“Express shipping, please”。</li>
<li>4B 选 <code>find_user</code>、<code>get_orders</code>，从返回记录得到 <code>U4140</code> 与 <code>ORD-3381</code>，再选 <code>ship_order(order_id=ORD-3381, speed=express)</code>。</li>
<li>环境确认发货，4B 选 <code>finish</code>，大模型写最终回复，任务 PASS。</li>
</ol>
<p>五次工具选择全部由 4B 完成，但六次非自由文本参数决定只接管五次。大模型调用由 5 次变成 2 次，含 GPU 的单题成本 $0.0301→$0.0042，时间 4.4→3.7 s。<strong>工具全接管，仍可能需要大模型填参数和回复。</strong></p>

<h3 id="threshold">3.3 阈值拟合：先记录候选，再估计接管收益</h3>
<p>作者让大模型单独执行 150 道校准题，同时问小模型但不执行其答案，称为 <strong>shadow</strong>。这样能比较同一状态上的候选与费用，但不能观察小模型真正接管后造成的全部变化。</p>
<p>小模型最高概率是 <code>c</code>，该置信区间的实际正确率为 <code>g(c)</code>，大模型为 <code>qL(c)</code>，少调用一次大模型节省 <code>ΔC</code>，错误价值损失为 <code>V</code>。接管条件是：</p>
<div class="formula">g(c) − qL(c) + ΔC / V ≥ 0</div>
<p>代码按置信度分箱，要求该箱及所有更高箱都有非负收益，才接受该阈值。若概率已校准、大模型正确率不变，才简化为 <code>τ = max(0, qL − ΔC / V)</code>。</p>
<p><strong>Jev + Flash 的实际校准日志无法估计错误代价：</strong>150 题里，大模型没有执行错误决定，缺少“有错误”的比较组。代码因此使用默认 <code>V=$1</code>，把一次错误按损失整题处理，工具阈值拟合为 1.00，参数为 0.99。这是带默认假设的估计，不是可靠性保证。固定 0.5 的对照虽然省钱更多，却少成功 21.5 个百分点。</p>
<details><summary>补充：错误代价、少量样本与参数成本近似</summary>
<p>每箱至少 20 个配对决定。有足够数据时，程序比较“没有错误决定”与“至少一次错误决定”的任务成功率，以每题 $1 换算 V；不是只比较恰好一次错误，也不是随机干预得到的因果效应。≥30 个配对决定采用分箱投影，10–29 个用整体公式，少于 10 个固定阈值 0.9。多个参数可能共用一次大模型调用，成本按参数分摊也是近似。</p>
<p>阈值必须按模型、位置分别拟合。Jev + Flash-Lite 几乎不接管；Alice 的 0.45 / 0.996 属于训练后 4B 的配置，不能移到 Jev 那一行。对应源码是 <a href="https://github.com/JevAgentHarness/JevAgentHarness/blob/f2932199e1ef1d9f089b51d39430c87be0f560b5/research/src/jevharness/bench/threshold_theory.py">threshold_theory.py</a> 的 <code>fit_calibration_arm</code>。</p>
</details>

<h3 id="judge">3.4 DecisionGym 的任务、隐藏参考与实际 judge</h3>
<p>作者编写生成器创建客服世界：12 个客户，每人 2–4 个订单，10 类库存，七类查询、取消、退款、发货与汇总任务。工具由 7 个核心工具、<code>ask_user</code>、31 个近似工具、29 个无关工具及 <code>finish</code> 组成，共 69 项。客户、金额和缺失字段随随机 seed 变化。</p>
<p>生成器掌握完整世界与参考步骤，计算每一步可接受的动作，称为 <strong>answer key（生成程序计算出的可接受下一步）</strong>。它在复制的环境里检查动作，且要求参数已经出现在请求或返回观察中。<strong>被测模型只看请求、工具与已获得观察，不看 answer key 或隐藏世界。</strong>这里没有人工逐题制作 <code>check.json</code>，成败由环境代码检查，不由聊天模型打分。</p>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/table-6.png"><img src="/lib/papers/jev-agent-harness/table-6.png" width="1368" height="675" alt="Table 6：开发题 Lena 的模糊取消请求，以及新等级金额规则题的世界和可接受动作"></a><figcaption>Table 6 · 生成器开发题与参考步骤，不是模型日志。上半题用于下面的 CPU 重放；下半题是新规则。Zhu et al., v1, p.19，CC BY-NC-SA 4.0。</figcaption></figure>
<p>开发 seed 600 中，Lena Wang（<code>U2883</code>）有显示器 <code>ORD-3872</code>（817.57）与鼠标 <code>ORD-4002</code>（278.07）。请求只说取消 pending order，合格过程是：</p>
<p><code>find_user → get_orders → ask_user(order_id) → cancel_order → finish</code>。程序扮演客户选择 <code>ORD-4002</code>；Agent 用 <code>reason=customer_request</code> 取消鼠标订单。起点直接问客户也可接受，参考步骤不是唯一合法顺序。</p>
<p><strong>没问就取消，即使猜中了 ORD-4002，也立即 FAIL。</strong>取消另一张、误用 <code>cancel_order_item</code> 同样失败。只读 <code>get_order</code> 绕路仍可恢复。终态还要满足指定修改与回复要求，部分完成不得分。本文在官方环境中实际重放了这些行为，结果与 Table 6 一致；这些是检查器测试，不是重跑模型。</p>
<details><summary>展开：官方判错代码与可运行的 CPU 检查片段</summary>

```python
# 官方 jevgym.py 的删节摘录；Python 3，不能独立运行。
def _write_is_gold(self, tool, args):
    if self.family == "clarify" and not self.asked:
        return False
    return any(t == tool and self._args_match(tool, args, a)
               for t, a in self._plan())

if self.strict and (tool in self.STATE_CHANGING
                    and not self._write_is_gold(tool, args)):
    self.failed = True
    return StepResult("Irreversible error", done=True)
```

<p>摘录省略近似写工具判定、调用记录及完整返回内容。完整代码：固定 revision <code>f2932199e1ef1d9f089b51d39430c87be0f560b5</code> 的 <a href="https://github.com/JevAgentHarness/JevAgentHarness/blob/f2932199e1ef1d9f089b51d39430c87be0f560b5/research/src/jevharness/bench/suites/jevgym.py">jevgym.py</a>。</p>

```python
from jevharness.bench.suites.jevgym import JevGymEnv

# 本文 CPU 测试；Python 3，需先按固定仓库 research/ 说明安装。
# 无模型调用。不需要用猜订单的方式获得 PASS。
env = JevGymEnv(seed=600, families="v2", distractor_style="near",
                n_distractors=60, noise_lines=20, strict=True)
env.reset()
for _ in range(2):
    tool, args = env.oracle_action()  # 仅测试者读取隐藏参考
    env.step(tool, args)
assert env.oracle_acceptable_tools() == ["ask_user"]

probe = env.oracle_snapshot()        # 不修改实际测试环境
probe.step("cancel_order", {"order_id": "ORD-4002",
                             "reason": "customer_request"})
assert not probe.evaluate("done")["success"]

env.step("ask_user", {"missing": "order_id"})
env.step("cancel_order", {"order_id": "ORD-4002",
                          "reason": "customer_request"})
assert env.evaluate("done")["success"]
```

<p>教学片段使用官方环境；本文实测用轻量导入运行相同方法，不安装训练依赖。下面 Discussion 还会检查此 judge 的盲点。</p>
</details>

<h3 id="levels">3.5 三层评测：分母与执行方式</h3>
<div class="table-scroll"><table><thead><tr><th>层次</th><th>什么输入，是否执行</th><th>怎样聚合</th></tr></thead><tbody>
<tr><td>L1 · isolated</td><td>BFCL 工具 1,114、参数 1,949，When2Call 928，共 3,991 个独立决定</td><td>局部答案准确率；Table 26 的 2,091 参数槽位是另一种计数</td></tr>
<tr><td>L2 · common states</td><td>原题集 200 题、5,314 个记录状态；各模型答同一批，不执行</td><td>先算每题状态准确率，再对题平均；已无法恢复的状态排除</td></tr>
<tr><td>L3 · task level</td><td>真正选择所有工具，不设阈值；大模型仍填自由文本参数</td><td>环境逐步检查和最终验收，<strong>每题 0/1，再求题目成功率</strong></td></tr>
</tbody></table></div>
<p>L2 按参考计划剩余步数判断进展，并非真正最短距离。两题各含 2、8 个状态，准确率 100%、50%，题目平均为 75%，混算全部状态是 60%；论文用前者。这是本文演算。</p>
<details><summary>补充：划分、重复、实验次数与提前接触结果</summary>
<p>训练与评测 seed、世界及参考计划不重复；3.3% 的状态出现次数与训练记录逐字重复，移除后 4B 的 99.2% 不变。基础模型预训练污染仍不能排除。模板查表基线在 L2 达到 97.5%；在测试状态上拟合“一键一工具”的上界达 99.9%，后者不能部署，说明生成器套路较固定。</p>
<p>主要训练只有一个 seed，多数实验每题执行一次。部分套件在两次基础设施重试后剔除仍错误的配对记录，后续 coding 协议则把错误记 FAIL，两种规则不能混写。</p>
<p>作者披露，训练 v1 的人在开始结果隔离前，打开过一个 Stage 1 文件的首条记录以了解格式，没有看汇总或改预定规则；严格读者可将两项 v1 Stage 2 测试视为探索性。第二条训练路线的代码还带有 τ² 转移测试选择摘要，不能把所有结果称为完全盲测。</p>
</details>

<h3 id="training">3.6 训练：监督、OPD 和 GRPO 分开看</h3>
<p>SFT 数据包含 587 道任务的 15,694 个状态，其中 4,843 个（30.9%）出现在偏离参考步骤之后，作者叫 <strong>off-plan</strong>。偏离不必然是致命错误。大模型正常执行、故意注入近似动作、带噪参考检查等多种收集策略，加上早期数据与合成检查题，组成训练集。</p>
<p>Jev 给选项概率，answer key 给正确选项。代码中的 <code>gold_onehot</code> 把正确选项记为 1，其余记为 0；这里的 gold 来自生成器，不是人工标注。Jev 最高概率选对时，目标 <code>y=0.3×gold_onehot+0.7×pJev</code>；选错只用正确选项。学生优化交叉熵加 <code>0.5×Brier</code>，后者是预测与目标概率的平方差。例如 Jev 正确选项概率 0.8，两选项目标变为 [0.86, 0.14]；这是本文演算。没有单项 Brier 消融。</p>
<p>OPD 在学生新执行状态上向独立 Jev 教师学选项概率，优化 <code>KL(pJev || pStudent)</code>。GRPO 每题采样 8 条执行，按成败、调用数与致命错误训练。<strong>保留的是 SFT v1 + GRPO 第 15 轮；OPD 被放弃。</strong></p>
<details><summary>展开：实际配置、回放比例与 GRPO 奖励</summary>
<p>Qwen3-4B 用 LoRA 训练附加低秩参数：r=32、α=64、all-linear，学习率 1e−4，2 epochs，effective batch 64，最长 4,096 tokens。选项打乱。公共回放池有 2,685 行，<code>0.45×</code> 指抽 <code>round(0.45×2685)=1208</code> 行，不是最后混合数据的 45%。</p>
<p>GRPO 固定 Flash-Lite 为大模型执行者，奖励 <code>S×(1−0.5×min(1,N_LLM/10))−0.2×E</code>。S 为整题成功，N_LLM 为调用数，E 为不可撤销错误指示。成功且调用两次的奖励是 0.9，致命失败是 −0.2；失败不会靠少调用得到正奖励。30 次迭代，每次 8 题，每题 8 条执行。</p>
<p>代码将同题执行的奖励做组内标准化，还用 GiGPO 对重复出现的同一决策状态补充局部比较信号，并以 KL 限制学生偏离 SFT 参考。75% 的从零 RL 组奖励相同，难以提供整题区分信号；SFT 起点前 15 轮也有 60%。这里的 OPD 教师不是同一个模型读取额外特权信息的教师分支。</p>
</details>

<h2 id="experiments">4. Experiments：SFT 的增益很大，适用范围仍很窄</h2>
<p><strong>监督训练有效；后续算法、新规则与实际部署的证据必须分别读。</strong>下面先看训练，再看改变任务后是否还能执行。</p>

<h3 id="opd-result">4.1 哪个训练阶段有效</h3>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/table-16.png"><img src="/lib/papers/jev-agent-harness/table-16.png" width="1368" height="423" alt="Table 16：两条训练路线的 SFT、OPD、GRPO 结果与成本"></a><figcaption>Table 16 · 第一条路线 OPD 后开发准确率下降；GRPO 没增加准确率。两条路线的最后 Dev 列不是同一题集。Zhu et al., v1, p.30，CC BY-NC-SA 4.0。</figcaption></figure>
<p>Qwen 路线 SFT 后开发准确率 99.7%，OPD 后 98.9%；偏离计划后状态为 99.8%→97.9%。变化任务中，未训练 4B 的 L3 成功率 13.5%，SFT 后 96.0%，加 GRPO 仍 96.0%。从零 RL 反而为 13.5%→11.5%。这些结果不能推出“OPD 对所有 Agent 无效”，只能说明本设置没有额外收益。</p>
<p>25% 任务消融中，L2 的 gold-only 为 98.9%，混合标签 98.5%，Jev-only 93.2%，没证明教师软标签必要。off-plan 数据的证据也不一致：同一批状态上去掉它会退步，但模型自行执行时的 off-plan 准确率反而更高。不同策略遇到的状态难度不同，不能仅据这一列认定数据有用或无用。</p>
<details><summary>展开：数据消融、第二路线与完整训练成本</summary>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-17.png"><img src="/lib/papers/jev-agent-harness/table-17.png" width="663" height="411" alt="Table 17：训练数据比例、教师与正确标签、off-plan 状态消融"></a><figcaption>Table 17 · 每个配置一个 seed；较少数据也意味着较少优化步数。Zhu et al., v1, p.30，CC BY-NC-SA 4.0。</figcaption></figure>
<p>去掉 off-plan 后，同批 L2 总准确率 98.5%→95.5%，其中 off-plan 为 84.9%→83.1%；自身执行的状态比较却不全同向。StartLux 的第二路线在更难开发任务上，SFT / OPD / GRPO 为 71.5% / 66.5% / 62.5%，作者保留 SFT。</p>
<p>SFT v1 用 2.2 GPU-hours，GRPO 另用 4.5 GPU-hours 与 $26.53 API。整轮研究训练报告 15.1 host-hours、GPU $45.29、API $142.36。分阶段 GPU 时间与整个研究开销、推理价格不能混算。</p>
</details>

<h3 id="rankings">4.2 任务变化后：局部分数与真实成功分离</h3>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/figure-4.png"><img src="/lib/papers/jev-agent-harness/figure-4.png" width="660" height="1002" alt="Figure 4：独立题成本准确率和同一模型三层排名，下半完整任务排序不同"></a><figcaption>Figure 4 · 上半是全部独立题，下半 L1 是 BFCL 工具题，不能混用。下半 L2 / L3 用变化任务，L3 不设接管阈值。Zhu et al., v1, p.6，CC BY-NC-SA 4.0。</figcaption></figure>
<p>变化题更换措辞、工具名、工具数量，并加入新追问结构。混公共工具数据后，独立题准确率从 78.8% 升至 85.1%，200 道变化题的 L3 却从 96.0% 降至 91.5%，必须追问状态准确率从 90.8% 降至 67.4%。</p>
<details><summary>展开：旧阈值在变化题上仍然失败，及完整模型表</summary>
<p>若部署时仍用原题集拟合的阈值，4B v1 成功 94.0%，公共版本 92.5%，大模型 100%。小模型仍接管几乎所有工具，无法及时交回；这又是不同于无阈值 L3 的实验。</p>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-39.png"><img src="/lib/papers/jev-agent-harness/table-39.png" width="660" height="420" alt="Table 39：同分布与变化任务的模型三层结果"></a><figcaption>Table 39 · 变化题 L2 为 100 题、1,250 状态，L3 为 200 题；StartLux-27B 只完成首 164 题。Zhu et al., v1, p.40，CC BY-NC-SA 4.0。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-40.png"><img src="/lib/papers/jev-agent-harness/table-40.png" width="663" height="159" alt="Table 40：原阈值在变化任务上仍接受错误，高接管率没有保住成功率"></a><figcaption>Table 40 · v1 / 公共版本分别接受 62 / 22 次错误选择。Zhu et al., v1, p.41，CC BY-NC-SA 4.0。</figcaption></figure>
</details>

<h3 id="failure-case">4.3 真实失败：高概率不能代替客户确认</h3>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/figure-12.png"><img src="/lib/papers/jev-agent-harness/figure-12.png" width="1368" height="852" alt="Figure 12：Mateo 退款，Jev 漏问失败，4B 先追问再退款成功"></a><figcaption>Figure 12 · 两边都选所有工具，不设阈值；大模型填参数。作者按 seed 选出的诊断案例。Zhu et al., v1, p.43，CC BY-NC-SA 4.0。</figcaption></figure>
<p>Mateo Smith 要退最近一张已送达订单全款，却没指定方式。Jev 查完用户与订单，以 0.98 选 <code>refund</code>；大模型填 <code>ORD-3726, amount=291.29, method=original_payment</code>，环境立刻 FAIL，因为此时应 <code>ask_user</code>。4B 先问，客户回复退回原支付方式，之后执行同样退款，PASS。</p>
<p>更强反例来自 Hard 新规则：basic 客户金额 &gt;$300 或 silver &gt;$600 时取消，gold 永不取消，其余发货。10 客户 / 200 题中，大模型成功 88%，未见规则的 4B 组合只有 <strong>3%</strong>，152 题因错误修改状态结束；12 客户设置只有 0.5%。重拟合会将所有工具交回；重训能改善，却仍未证明成功率下降小于 3 点。</p>
<details><summary>展开：Hard 新规则、阈值重拟合与重训（Table 19）</summary>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-19.png"><img src="/lib/papers/jev-agent-harness/table-19.png" width="660" height="438" alt="Table 19：新规则的失败、重拟合和重训对照"></a><figcaption>Table 19 · 原部署与重训每段 200 题，阈值重拟合段 100 题，段内比较。Zhu et al., v1, p.30，CC BY-NC-SA 4.0。</figcaption></figure>
<p>重新训练后的组合 81.5%，配对大模型 83.5%，非劣效 p=0.402；随机规则训练组合 84.5% 对 83.5%，p=0.091，均证据不足。不能把点估计接近改写成保证可靠。本文用开发 seed 7003 重放参考流程，并核对金额边界使用严格 &gt;，不包含等于阈值。</p>
</details>

<h3 id="deployment">4.4 部署：省钱、变快与非劣效是不同结论</h3>
<p><strong>non-inferiority（非劣效）</strong>检验能否排除超界的成功率下降：DecisionGym 界限 3 点，τ²-bench 5 点。配对单侧检验校正多重比较；点估计下降不足 3 点，不代表通过。</p>
<p>500 题里，单独 Jev 工具 / 参数 Cascade 省 14.2%，没有任何题改变成败。加入反思 Trigger 的组合，99.4%→97.2%，省 40.7%，但检验失败。训练后 4B Stage 2 组合 100% 对 99.4%，省 81.1%，共享 GPU 上反而从 6.83 s 慢到 10.21 s。后来的公共数据 + 独占 GPU 配置才有 86.3% 降本与约 2.5 倍加速，不能拼成原配置的同时收益。</p>
<details><summary>展开：单项、组合与部署原始证据</summary>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/figure-5.png"><img src="/lib/papers/jev-agent-harness/figure-5.png" width="663" height="456" alt="Figure 5：不同接入方式的成功率差和费用"></a><figcaption>Figure 5 · 各模式单独测试，横轴费用不能替代纵轴成功率。Zhu et al., v1, p.7，CC BY-NC-SA 4.0。</figcaption></figure>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-2.png"><img src="/lib/papers/jev-agent-harness/table-2.png" width="660" height="411" alt="Table 2：阈值、检查规则、组合和 GPU 部署消融"></a><figcaption>Table 2 · 不同设置分行列示，部署延迟与费用各自变化。Zhu et al., v1, p.7，CC BY-NC-SA 4.0。</figcaption></figure>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/table-29.png"><img src="/lib/papers/jev-agent-harness/table-29.png" width="1368" height="453" alt="Table 29：接近满分时的接管、费用、时间及非劣效结果"></a><figcaption>Table 29 · 成功率接近满分时的完整部署条件与分母。Zhu et al., v1, p.37，CC BY-NC-SA 4.0。</figcaption></figure>
</details>

<h3 id="coding">4.5 Coding harness：实际测的是模型路由</h3>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/table-1.png"><img src="/lib/papers/jev-agent-harness/table-1.png" width="1368" height="531" alt="Table 1：外部任务、新规则与 coding 模型路由的成功率、成本和时间"></a><figcaption>Table 1 · 主文扩展任务。客服规则、coding 路由与 ALFWorld 的训练及预算不同。Zhu et al., v1, p.7，CC BY-NC-SA 4.0。</figcaption></figure>
<p>主文让 Jev 选择本步用强模型还是快模型，代码仍由选中的大模型写。mini-SWE-agent + DeepSeek 的 300 题成功 232→229，省 10.5%；SWE-agent 的 100 题 63→57，省 7.7%；pi 的 89 题 42.7%→50.6%，省 9.6%，时间 257→260 s。</p>
<p><strong>Codex / Claude Code 的接口实现，不等于完成工具接管效果实验。</strong>PDF Table 9 记载若干 hook（在 harness 执行某一步时调用的扩展接口）已实现并单元测试，但这些接口无法按参考实现那样在大模型生成调用之前替代选工具。后来仓库的代理路由测试又是独立设置。</p>
<details><summary>展开：接口能力、后续代理路由与 ALFWorld</summary>
<figure class="figure original narrow"><a href="/lib/papers/jev-agent-harness/table-9.png"><img src="/lib/papers/jev-agent-harness/table-9.png" width="660" height="246" alt="Table 9：不同 harness 的接口实现、测试及接管限制"></a><figcaption>Table 9 · 支持哪些接口，与哪些实验已评测分开列。Zhu et al., v1, p.25，CC BY-NC-SA 4.0。</figcaption></figure>
<p>固定仓库的后续测试用兼容 API 的代理，在强 / 快模型间路由，不改原 harness。74 道 held-out Terminal-Bench，mini-SWE-agent 66.2%→63.5%，pi 52.7%→56.8%，DeepSeek 66.2%→66.2%，分别省 64%、31%、28%；差值 95% 区间为 [−14.9,+8.1]、[−6.8,+14.9]、[−8.1,+8.1] 点，样本不足以证明 3 点非劣效。</p>
<p>后续 Codex 只有 20 题，强模型为 GPT-6.1-Sol medium，快模型为 Luna low；只用强模型与加入路由都成功 85%，省 6.5%，却慢 47%。这些来自固定 README 与 <code>bench/PROTOCOL.md</code>，不是 PDF Table 1 的追加行，也不是独立复现；后续协议将基础设施错误记 FAIL。</p>
<p>ALFWorld 的 4B 在该环境训练题上另做 SFT。已见房间 140 题为 90.7%→95.0%，省 89%；未见房间 134 题 88.8%→89.6%，省 92%，非劣效 p=0.175，证据不足。</p>
<figure class="figure original dense-original"><a href="/lib/papers/jev-agent-harness/figure-13.png"><img src="/lib/papers/jev-agent-harness/figure-13.png" width="1368" height="801" alt="Figure 13：另行在 ALFWorld 训练的 4B 模型动作日志"></a><figcaption>Figure 13 · ALFWorld 单题动作记录；不是客服模型直接迁移。Zhu et al., v1, p.44，CC BY-NC-SA 4.0。</figcaption></figure>
</details>

<h2 id="discussion">5. Discussion：检查器与模型都要接受反例测试</h2>
<p><strong>严格判错不等于检查器完整覆盖了需求。</strong>本文另外在官方开发 seed 605 做了两个对抗测试：把正确的多客户操作全部逆序执行，最后仍 PASS；应答金额 1210.92，却输出 11210.92，仍 PASS。前者因为终态按排序后的修改列表比较，后者因为只检查回复是否包含正确数字字符串。</p>
<p>这不是论文公布的模型轨迹，也不能推算模型分数有多大虚高。作者仓库本身有 <code>jevgym_checker_audit.py</code>；本轮下载其结果文件超时，因此不报受影响比例。它也说明，整题成功率只能证明代码实际检查过的要求，不能默认覆盖全部请求。</p>
<details><summary>展开：数字误判的可运行测试与源码路径</summary>

```python
from jevharness.bench.suites.jevgym import JevGymEnv

# 本文测试，非实测模型输出；Python 3，固定仓库环境。
env = JevGymEnv(seed=605, families="v2", distractor_style="near",
                n_distractors=60, noise_lines=20, strict=True)
env.reset()
for tool, args in env._plan():
    if tool != "finish":
        env.step(tool, args)
correct = f"{env.multi_total:.2f}"
wrong = "1" + correct
assert correct == "1210.92"
assert float(wrong) != env.multi_total
assert env.evaluate(wrong)["success"]  # 发布代码确实接受这个错误数字
```

<p>对应 <code>jevgym.py</code> 的 <code>evaluate</code>，1026–1064 行；顺序要求在生成请求中，终态却先对修改记录（effect）排序。模型不能读取这些隐藏参考；只有本文测试用它构造动作。</p>
</details>
<p>对后续研究，最有用的是同一批状态测试、自行执行、新规则验收三层组合。OPD 退步究竟来自教师、数据饱和还是学生新状态，论文没隔离出唯一原因；需要改变一个因素并复测整题，而不是从负结果直接猜机制。</p>

<h2 id="conclusion">6. Conclusion：保留训练收益，也保留它的边界</h2>
<p><strong>特定 Agent 状态上的 SFT 能得到便宜、准确的选项决策模型；可靠接管还要完整执行验证。</strong>这篇值得读的内容是三层评测、真实分工日志、校准对照，以及没有成功的训练阶段。</p>
<p>边界集中在一次训练、较固定的客服模板、接管后状态未被 shadow 完整覆盖、新规则高置信度失败，以及 coding 主要验证路由。实际检查器还存在本文重放确认的盲点。它没有验证特权代码蒸馏或完整软件生成能力。</p>
<p class="source-note">证据范围：v1 全文 44 页，包括附录 A–I；13 Figures / 41 Tables 逐项登记。正文保留 18 个原图表，补充材料折叠；去留与来源见 <a href="/lib/papers/jev-agent-harness/jev-agent-harness.sources.json">来源清单</a>。源码固定 f2932199，论文结果、后来仓库测试和本文 CPU 测试分别标明。</p>
</div>

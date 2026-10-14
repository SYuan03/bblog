---
title: "[2026-08-05] When Privileged Guidance Misaligns: State-Matched Routing and Contextualized Self-Distillation for Multi-Turn Agents"
permalink: "/posts/论文解读/state-matched-routing-contextualized-sd.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T17:00:00+08:00"
cover: "/lib/papers/state-matched-routing-contextualized-sd/cover.svg"
description: "成功记录里的下一步，不一定适合模型现在走到的位置。SMRC-SD 先检查位置、手中物体和任务进度是否兼容，再决定是否用成功记录训练；本文展开真实匹配案例、损失分母、重放验证和代码缺口。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 9
categories:
  - "论文解读"
tags:
  - "State Matching"
  - "Agent Training"
  - "On-Policy Distillation"
  - "Routing"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">Junzhuo Liu, Weiwei Li, Jun Ling, Peng Wang · arXiv:2608.05219v1 · 最早公开于 2026-08-05</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.05219">论文主页</a><a href="https://arxiv.org/pdf/2608.05219v1">论文 PDF</a><a href="https://github.com/liujunzhuo/SMRC-SD">官方代码</a></div>

<section class="deck-wrap" aria-label="SMRC-SD 交互图解">
  <div class="deck-head"><strong>9 页交互图解 · 先看训练过程、真实案例 与复现边界</strong><a href="/lib/decks/state-matched-routing-contextualized-sd-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/state-matched-routing-contextualized-sd-visual-guide.html" title="SMRC-SD 论文图解，共 9 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p></div>
</section>

<p class="lead">一份已经成功的操作记录，只能证明“按这个顺序做完了任务”。学生模型若先拿了别的物体、提前完成一个步骤，记录中的下一步就可能不适用。SMRC-SD 不要求学生照着原顺序走：先检查当前位置、手中物体和已完成步骤，再决定这一回合能否借助成功记录训练。</p>

<aside class="part0"><span class="kicker">PART 0 · 两种训练信号</span><h3>训练时多看参考记录，测试时仍自己行动</h3><p>学生根据问题和实际交互记录生成回答，随后执行其中的动作。教师是<strong>同一组当前参数的评分分支</strong>：它多看训练专用提示，对学生已经写出的回答逐个文字单位（token）给概率；教师侧不反向传播，也不另写一条动作。论文把这种训练称为 self-distillation（自蒸馏）。另一项 GRPO 训练按完整任务的成败奖励学生：同一任务采样多次，比较这些执行记录的奖励。SMRC-SD 只筛选前一种训练信号，不删掉后一种。</p><p>下文的 reference path 指同一任务的一条成功动作序列；state signature 指从普通动作、观察和参考序列中重建的位置、持有物体、物体属性等记录。它不是隐藏的模拟器状态。abstain 指<strong>这一回合不计算参考信息带来的蒸馏损失</strong>，不是让模型停止行动。</p></aside>

<aside class="keypoints"><h3>核心结论</h3><ul><li>先判断参考步骤是否适用，再给教师完整路径、当前状态摘要和可执行的下一步；不是简单截短参考路径。</li><li>Qwen3-1.7B 的 ALFWorld 成功率从 FullPath-SD 的 74.6% 提高到 86.5%；只筛回合的对照为 83.6%。</li><li>真实重放检查支持匹配规则的有效性，但不匹配不等于动作错误，抽样全成功也不等于规则没有盲点。</li></ul></aside>

<h2 id="研究问题：成功路径与当前状态未必兼容">1. Motivation：成功路径与当前状态未必兼容</h2>

<p><strong>整条路径正确，不代表它在学生现在到达的位置上仍然正确。</strong>ALFWorld 是一个用文字操作家庭物体的环境：拿取、移动、清洗或加热物体，会改变下一步需要做什么。WebShop 则要求搜索商品、选择颜色和尺码、购买；换到别的商品页面之后，原记录中的点击可能指向完全不同的东西。</p>
<p>例如第一棵生菜已经放进冰箱，学生该去找第二棵。只比较动作文本的前后相似性，可能仍建议重新开冰箱。论文把这种“参考路径和实际到达状态不兼容”叫 state–reference mismatch。问题不是参考答案不对，而是它适用的前提已经变了。</p>
<p>反过来，学生绕了路或用不同顺序完成步骤，也不必被判错。只要此刻的位置、持有物体和相关属性满足参考某一步的要求，仍能接上那里的后续动作。SMRC-SD 要区分的是<strong>现在能否接着这条参考走</strong>，不是学生此前是否逐字模仿了参考。</p>

<h2 id="与行为模仿、完整路径蒸馏的区别">2. Related Work：与行为模仿、完整路径蒸馏的区别</h2>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>训练时怎样使用参考</th><th>本文要解决的区别</th></tr></thead><tbody><tr><td>SFT／行为模仿</td><td>直接训练参考动作及其对应前文</td><td>没有在学生自己探索到的状态上判断参考是否适用</td></tr><tr><td>GRPO</td><td>根据完整执行是否成功训练；不增加参考概率监督</td><td>成败信号较粗，但不要求学生遵循某条参考路径</td></tr><tr><td>FullPath-SD</td><td>教师每回合都多看同一任务的完整成功路径</td><td>任务层面正确的路径仍可能在当前回合不兼容</td></tr><tr><td>Skill-SD／SDAR</td><td>利用任务技巧或成功经验提供教师信息，保留奖励训练</td><td>本文比较的是逐状态的适用性检查；不是说这些方法都不用奖励或都照搬动作</td></tr><tr><td>SMRC-SD</td><td>只在兼容回合蒸馏，教师看完整路径 + 实际状态摘要 + 当前候选动作</td><td>把“是否使用参考”与“如何解释参考”分开控制</td></tr></tbody></table></div>
<p>这里的教师与学生同步到当前参数，教师侧只是停止梯度；<strong>不是始终固定的初始模型，也不是额外训练的强模型</strong>。蒸馏时比较两分支对学生同一段回答的概率，因此没有把参考动作直接替换成学生训练输出。本文对 FullPath-SD 的贡献也不在新的 KL 估计，而在回合筛选和教师提示构造。来源：§2–4、Appendix A。</p>

<h2 id="方法：状态匹配、教师提示与损失计算">3. Method：状态匹配、教师提示与损失计算</h2>

<figure class="figure"><a href="/lib/papers/state-matched-routing-contextualized-sd/state-and-loss.svg" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/state-and-loss.svg" width="1000" height="470" alt="学生实际交互，确定性匹配选择兼容参考步骤，仅匹配回合蒸馏，所有回合保留GRPO"></a><figcaption>根据 Figure 2、Eq. 15 与 Appendix A 重绘。参考中保存的是动作序列；每个动作前的状态由程序重建。筛选蒸馏不等于筛掉整个任务。</figcaption></figure>

<h3 id="先准备参考，再让学生自己执行">3.1 先准备参考，再让学生自己执行</h3>

<p>ALFWorld 的参考来自 TextWorld 的专家执行路径，每个训练游戏一条，经过完整执行成功检查，共 3,553 条。WebShop-small 的参考针对目标商品构造：搜索完整商品名、打开对应商品、依次选择要求的选项、购买。索引清单有 6,910 条，但训练只用编号 <code>500…6909</code>，即 <strong>6,410 个目标</strong>；前 500 个留出，论文固定选其中 128 个评测。不要把清单长度当作训练题量。</p>
<p>每次更新，学生对 16 个任务各采样 8 次，从正常初始状态开始交互。训练器再逐回合处理这些实际到达的状态：查到同题参考，重建参考各步骤执行前的状态，然后寻找兼容位置。这里没有把参考前半段预先在环境中执行，以便让学生从答案中途开始。</p>

<h3 id="匹配规则：不是一句“语义相似”">3.2 匹配规则：不是一句“语义相似”</h3>

<p>ALFWorld 要求当前位置和手中物体与参考位置一致；下一步所依赖的物体位置必须一致，必要属性必须已具备。例如参考要求叉子已清洗，当前记录也必须包含 clean 属性。满足这些前提之外的额外进度可以允许，所以学生不必重走相同历史。候选动作还必须存在于当前允许执行的动作列表。若多个参考位置兼容，选<strong>最靠后的兼容位置</strong>，而不是跳过不满足条件的步骤。具体规则见 §4、Appendix D–F。</p>
<p>WebShop 检查页面类型、商品 ASIN（商品标识）、已选选项和剩余要求。颜色与尺码的选择顺序可以交换；当多个必需选项都可选时，候选可以是一个集合，不强行规定唯一“标准下一步”。商品不对、选项与要求冲突或点击当前不可用，就不提供蒸馏监督。</p>

<figure class="figure"><a href="/lib/papers/state-matched-routing-contextualized-sd/real-state-cases.svg" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/real-state-cases.svg" width="1000" height="490" alt="论文生菜和购物真实例子，当前进度决定教师候选，不匹配只跳过蒸馏"></a><figcaption>根据 Table 12–13 重绘。Table 13 给的是代表性审核记录，不是完整单题动作日志；图中不补造未公开的中间动作或模型输出。</figcaption></figure>

<div class="case"><h4>真实例子：先认出已经完成的步骤</h4><p>Table 13 的 <code>lettuce 3</code> 已经在冰箱里。历史匹配器仍推荐 <code>open fridge 1</code>，状态匹配器转到第二个物体阶段，给出 <code>go to countertop 2</code>。另两条记录是 <code>fork 1</code> 已清洗、<code>mug 4</code> 已加热：新规则不再重复处理，而是导航到目标容器或搁板。若当前在 <code>fridge 1</code>，却只能匹配参考在 <code>diningtable 2</code> 的起点，规则选择 abstain。</p><p>Table 12 的 WebShop 商品是 <code>B07S7HDC88</code>，当前颜色已经选了 <code>blue 137</code>，还缺尺码 <code>9</code>。教师看到的摘要记录这一事实，候选是 <code>click[9]</code>。学生只看到普通页面与交互前文，不会直接收到这个训练专用候选。</p></div>

<h3 id="给教师的仍是完整路径，然后重评学生回答">3.3 给教师的仍是完整路径，然后重评学生回答</h3>

<p>匹配成功才组合三个字段：<strong>完整成功动作序列、实际当前状态的一行摘要、兼容的下一步动作</strong>。匹配位置用于选候选，不会把学生的实际状态改成参考状态。两分支使用相同学生回答前文；教师对这段回答给概率，不生成替代动作。没有匹配时，该回合的蒸馏权重为 0。</p>

<h3 id="损失分母保留所有原回答-token">3.4 损失分母保留所有原回答 token</h3>

<p>对学生采样出的第 <code>i</code> 个 token，设学生与教师的 log 概率之差为 <code>δ</code>；当前学生与采样旧策略之差为 <code>η</code>。Appendix A 先把这个概率差变成非负的分布差异估计，作者称它为 K3；再用当前策略与采样旧策略的概率比调整贡献。这是损失的计算方式，不是另一种模型：</p>

```text
δ = log p_student − log p_teacher
η = log p_student − log p_rollout_old
d = exp(min(−δ, 20)) − 1 + δ
ρ = exp(min(η, 10))

L_SD = Σ(回合是否匹配 × 合法token掩码 × ρ × d)
       / 所有原回答token数
L_total = L_GRPO + 0.01 × L_SD
```

<p>这里的合法 token 掩码只去掉分词器（tokenizer）定义的特殊 token，<strong>推理文字和动作文字都参与，不是只监督动作标签</strong>。分母包含未匹配回合的原回答 token。筛掉回合会降低总蒸馏贡献，不会把剩余少数 token 的权重重新放大。指数截断是数值稳定措施。上述是论文公式转写，不是宣称已重新运行了训练。</p>
<p>固定代码的 <code>dp_actor.py</code> 也把样本权重乘到蒸馏掩码上，另把原 <code>response_mask</code> 传作归一化掩码；<code>path_privileged_utils.py</code> 在 <code>match_only</code> 时直接使用状态匹配布尔掩码。这是实查实现，而非仅凭 README 推断。</p>

<h2 id="实验：成功率、消融与完整重放">4. Experiments：成功率、消融与完整重放</h2>

<h3 id="先把评测单位说清楚">4.1 先把评测单位说清楚</h3>

<p>两个环境都从正常初始状态评测 128 个任务，每题 4 次，合计 512 条完整执行。ALFWorld 的 <strong>Average@4 = 512 次执行中的成功次数 / 512</strong>；Pass@4 则是 128 个任务里“至少一次成功”的比例。WebShop 的 Acc 是完整购买成功率，Score 是按商品属性与选项吻合程度给的部分分数；二者不能混用。</p>
<p>模型是 Qwen3-1.7B（non-thinking）与 Qwen2.5-3B-Instruct；训练学习率 <code>1e-6</code>、4 张 H800、种子 0、每更新 1 个 PPO epoch，训练温度 1.0，评测温度 0.4。Qwen3 ALFWorld 跑 250 次更新、最多 30 回合；其他主设置 150 次更新，Qwen2.5 ALFWorld 最多 50 回合，WebShop 15 回合。<strong>v1 主表使用预先固定的这些 checkpoint，不按验证分数挑最好版本。</strong>因此也没有多训练种子方差可报。</p>

<div class="table-scroll"><table><thead><tr><th>模型与环境</th><th>指标</th><th>FullPath-SD</th><th>SMRC-SD</th><th>绝对变化</th></tr></thead><tbody><tr><td>Qwen3 · ALFWorld</td><td>Average@4 / Pass@4</td><td>0.746 / 0.836</td><td><strong>0.865 / 0.914</strong></td><td>+11.9 / +7.8 百分点</td></tr><tr><td>Qwen3 · WebShop</td><td>Acc / Score</td><td>0.574 / 0.694</td><td>0.693 / 0.825</td><td>+11.9 / +13.1 百分点</td></tr><tr><td>Qwen2.5 · ALFWorld</td><td>Average@4 / Pass@4</td><td>0.766 / 0.852</td><td>0.883 / 0.938</td><td>+11.7 / +8.6 百分点</td></tr><tr><td>Qwen2.5 · WebShop</td><td>Acc / Score</td><td>0.734 / 0.842</td><td>0.736 / 0.863</td><td><strong>+0.2</strong> / +2.1 百分点</td></tr></tbody></table></div>
<p>来源：Table 2。Qwen2.5 的部分 GRPO、Skill-SD、SDAR 数字带 †，是从 SDAR 报告引用；不是全部方法都由本文重新运行。FullPath-SD 与 SMRC-SD 是对齐的本地实验。Qwen2.5 WebShop 的成功率几乎不变，不能写成每个设置都大幅提升。</p>

<figure class="figure"><a href="/lib/papers/state-matched-routing-contextualized-sd/routing-controls.svg" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/routing-controls.svg" width="1000" height="455" alt="同一ALFWorld设置拆分回合筛选与教师上下文，单独候选或摘要均未改善筛选基线"></a><figcaption>根据 Table 3–5 重绘。蓝色条为 Average@4，横轴统一为 0–100%；有局部提示不等于这一回合就适合蒸馏。</figcaption></figure>

<h3 id="筛回合与补上下文必须一起检查">4.2 筛回合与补上下文必须一起检查</h3>

<p>Qwen3 ALFWorld 的 2×2 对照是：所有回合 + 普通完整路径 <code>0.746</code>；仅匹配回合 + 普通路径 <code>0.836</code>；所有回合都蒸馏、只对匹配回合增加状态提示 <code>0.695</code>；匹配回合 + 完整新提示 <code>0.865</code>。这支持先避免在不适用回合模仿参考，再让匹配回合获得更清楚的提示。</p>
<p>但提示也不是每加一项都有效。仅匹配回合的基线是 <code>0.836</code>，单加候选降到 <code>0.820</code>，单加状态摘要为 <code>0.834</code>；三字段组合才到 <code>0.865</code>。不能只凭完整方法的结果说“候选动作单独贡献了提升”。</p>
<p>随机选择相同回合数的对照为 <code>0.723</code>，只选不匹配回合为 <code>0.750</code>。这说明任意少训练几个回合不足以解释 <code>0.836</code>。不过“相同回合数”<strong>不等于相同 token 数或梯度总量</strong>：Table 14 的更新平均选中 token 比例分别是 <code>0.142</code> 与 <code>0.164</code>，且这些数字来自不同训练策略产生的回答。</p>

<h3 id="匹配覆盖与完整重放不是同一个指标">4.3 匹配覆盖与完整重放不是同一个指标</h3>

<p>作者对同一批 35,712 条存档回合运行两种匹配器。历史匹配选中 5,496 条（15.4%），状态匹配 7,203 条（20.2%）；交集 5,428 条，占历史匹配的 98.8%，交集中的候选动作有 99.4% 相同。这个 coverage 是“能提供候选的存档回合占比”，不是对所有正确动作的召回率。</p>
<p>接着作者真正重置环境，执行学生原前文，到达那一状态后接上候选动作，再执行参考剩余动作，最后看<strong>整题是否成功</strong>。按任务类型独立抽样，历史组为 792/800，状态组为 781/781。两组不是成对的同一批状态。历史组的 8 次失败中，候选自身都可执行，但后续参考没完成任务；其中 Look 2 次、Pick Two 6 次。状态组抽样全成功支持这组规则，不能推出任何未来状态都可匹配或“没匹配就是错误”。来源：Table 15–17。</p>

<h3 id="固定状态、更换教师提示：只检查评分偏好">4.4 固定状态、更换教师提示：只检查评分偏好</h3>

<p>另一项检查固定 79 个游戏里的 1,200 个状态，每类 400 个：匹配且学生动作与候选一致；匹配但不同；未匹配但学生执行有效且整题成功。作者固定学生回答，只改变教师提示，用初始 Qwen3 和 GRPO 第 250 步两个冻结模型评分，不再生成动作或更新参数。</p>
<p>完整路径对第一类动作的概率增益比第三类平均多 <code>0.070</code>，95% 区间 <code>[0.012, 0.153]</code>；第二类中 SMRC 提示比 FullPath 更偏好候选，差 <code>0.266</code>，区间 <code>[0.206, 0.328]</code>。区间按整个游戏分组重抽样（bootstrap）计算，不把同一游戏的每个状态当成独立样本。第二类的学生动作也可能是有效替代，并未被直接标成错误。这些是<strong>提示改变评分偏好的证据</strong>，不是证明每次新增蒸馏更新都会提高成功率。</p>

<h2 id="下一步：多条参考与不完整状态">5. Discussion：多条参考与不完整状态</h2>

<p>最值得借用的是<strong>在当前状态上验证参考是否适用</strong>，而不是某份固定字段清单。本文能用确定性规则，是因为两个环境有明确的动作、物体和选项。迁移到开放网页或代码编辑时，状态观察不完整，参考也未必只有一条；如何拒绝错误匹配，同时保留另一种有效做法，才是下一步真正需要验证的部分。</p>
<p>一个自然的对照是每题放入多条验证成功、顺序不同的参考，检查覆盖增加是否带来任务成功率提升，并单独报告误用参考和拒绝有效状态的代价。本文还没有做这个实验。对于游戏代码生成，可以先研究同一功能的两种实现是否会被错误判为不兼容；不能把文件名相同或参考项目最终能运行，当作中间步骤适用的证明。</p>
<p>训练成本也要拆开。作者在单核 Xeon 上测得完整提示提供器平均 <code>0.833 ms</code>，约 95% 的调用不超过 <code>1.335 ms</code>，一次索引构造平均 <code>437.1 ms</code>；匹配提示比普通完整路径平均多 <code>20.96</code> 个 context token。它们不是总 GPU 训练耗时，也不是“只增加 0.833 ms 就获得提升”。推理时确实移除参考、匹配器和教师提示，环境工具本身仍保留。</p>

<h2 id="结论与参考数据的复现缺口">6. Conclusion：结论与参考数据的复现缺口</h2>

<p><strong>这是一项“先检查参考适用性”的多轮 Agent 训练方法，不是把有工具模型蒸馏成无工具模型。</strong>它在两个受控环境的小模型上取得明确收益；最强证据是路由／提示的分开对照、同回合审核和候选加剩余路径的真实执行。限制是单个训练种子、有限测试子集、人工设计的领域规则，以及匹配标签不等于动作正确性。</p>
<p>官方代码核查固定到 <code>f3e43bab78828d12ee7e2f717e041b70f43ad43f</code>。<code>path_privileged_utils.py</code>、<code>dp_actor.py</code> 和训练启动器实现了匹配、提示、掩码与损失路径；仓库还包含环境与检查脚本。不过 README 列为已提供的以下四份文件，在该 commit 的 Git tree 中没有出现：</p>

<div class="code-scroll"><pre><code>examples/smrc_sd/data/alfworld_verified_walkthrough_prefixes.jsonl
examples/smrc_sd/data/alfworld_verified_walkthrough_trajectories.jsonl
examples/smrc_sd/data/webshop_small_seed0_oracle_paths.jsonl
examples/smrc_sd/data/webshop_small_seed0_val128.json</code></pre></div>

<p>因此<strong>算法代码可读，不代表默认启动命令能直接复现主表</strong>。需要作者提供这些参考和固定评测清单，或者独立重建并声明与原实验的差异。本文检查了公开实现，没有重新运行完整训练，也不把 README 的“included”当作文件实际存在的证明。</p>
<p class="source-note">依据 arXiv:2608.05219v1 全文与附录，PDF 共 17 页；表格、公式与逐页渲染交叉核查。实现证据固定到上述 commit。个人兴趣程度 10/10，仅表示与博客作者兴趣的相关程度。</p>

</div>

---
title: "[2026-08-05] When Privileged Guidance Misaligns: State-Matched Routing and Contextualized Self-Distillation for Multi-Turn Agents"
permalink: "/posts/论文解读/state-matched-routing-contextualized-sd.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-19T00:30:00+08:00"
cover: "/lib/papers/state-matched-routing-contextualized-sd/cover.svg"
description: "成功记录里的下一步，不一定适合模型现在走到的位置。本文用真实购物和家庭操作案例，解释 SMRC-SD 如何检查参考步骤、训练同一模型，以及匹配规则和任务判分为什么不能混为一谈。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 13
categories:
  - "论文解读"
tags:
  - "State Matching"
  - "Agent Training"
  - "On-Policy Distillation"
  - "Routing"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>
body.page-paper-reading.page-paper-editorial .prose .figure.original-wide>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}
body.page-paper-reading.page-paper-editorial .prose .figure.original-wide>a>img{width:1100px;min-width:1100px;max-width:none;height:auto}
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a>img{width:780px;max-width:none;height:auto}}
</style>

<div class="paper-reading">

<p class="paper-meta">Junzhuo Liu, Weiwei Li, Jun Ling, Peng Wang · arXiv:2608.05219v1 · 最早公开于 2026-08-05</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.05219v1">论文主页</a><a href="https://arxiv.org/pdf/2608.05219v1">论文 PDF</a><a href="https://github.com/liujunzhuo/SMRC-SD">官方代码与参考数据</a></div>

<section class="deck-wrap" aria-label="SMRC-SD 交互图解">
  <div class="deck-head"><strong>13 页交互图解 · 原流程图、真实案例与判分</strong><a href="/lib/decks/state-matched-routing-contextualized-sd-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/state-matched-routing-contextualized-sd-visual-guide.html" title="SMRC-SD 论文图解，共 13 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机可滚动页内内容与宽图；Esc 退出全屏</span></p></div>
</section>

<p class="lead">成功记录里写着“选颜色，再选尺码”，学生已经先选了尺码，训练时还该要求它按原顺序走吗？SMRC-SD 先检查学生实际到达的状态，判断参考里的哪一步还能接着执行，再决定是否用这条参考训练。测试时学生继续自己操作环境，不读取参考。</p>

<aside class="part0"><span class="kicker">PART 0 · 一次交互，两种训练信号</span><h3>学生行动，教师给学生的同一回答打概率</h3><p>部署时自己操作环境、接受训练的模型叫 student（学生）；从初态到任务结束的一次完整交互叫 rollout。每回合学生读取当前观察、最近的交互记录和可执行动作，写出回答，再执行回答里的动作。</p><p>teacher（教师）使用<strong>同一组当前参数</strong>，额外读取一份训练参考，对学生已写回答的每个 token（文字单位）计算概率，不另写动作。训练器在学生当前交互上比较两分支的概率，称为 on-policy self-distillation（OPSD）；教师侧不接受梯度，下次更新后两分支的参数一起变化。论文保留 GRPO：同题采样多次，按整题成败比较这些交互，提供另一项奖励训练。</p></aside>

<aside class="keypoints"><h3>先记住三点</h3><ul><li>方法分别控制<strong>哪一回合使用参考</strong>和教师怎样理解参考；匹配失败时只跳过蒸馏，任务奖励保留。</li><li>Qwen3-1.7B 在文字操作家庭物体的 ALFWorld 中，平均成功率从“每回合给完整参考”的 <strong>74.6% 到 86.5%</strong>；只筛回合、不改提示的对照是 83.6%。</li><li>匹配规则不是成败判分器：参考下一步可执行、整题最终成功、学生动作是否错误，是三个不同问题。</li></ul></aside>

<h2 id="研究问题：成功路径与当前状态未必兼容">1. Motivation：成功路径与当前状态未必兼容</h2>

<p><strong>一条参考从它自己的初态能成功，不代表学生现在还能接上。</strong>ALFWorld 用文字命令操作家庭物体，拿取、清洗、加热和放置都会改变任务进度。WebShop 要搜索商品、选择选项、购买；学生若点开另一件商品，原参考的点击也可能不再适用。</p>

<p>Figure 1 的示意更直接：参考进入 Product A，学生却在 Product B 页面上，合理动作是 Back to Search（返回搜索）。教师若每回合都多看同题完整路径，仍可能降低这个返回动作的概率。作者称这种“参考的执行前提与当前状态不兼容”为 state–reference mismatch；图里的概率箭头是示意，实测证据另见固定状态评分实验。</p>

<p>学生换了步骤顺序也可能正确。这里要检查的是<strong>当前位置和进度能否支持参考后续</strong>，而非此前动作是否逐字相同。</p>

<h2 id="与行为模仿、完整路径蒸馏的区别">2. Related Work：从挑监督信号，到检查参考前提</h2>

<p><strong>最近的对照是 FullPath-SD：同一套奖励与概率监督，但教师每回合都看完整参考。</strong>本文新增程序规则来检查当前状态，再据此构造教师提示，沿用已有蒸馏损失。</p>

<div class="table-scroll"><table><thead><tr><th>研究路线</th><th>主要改变什么</th><th>与本文的区别</th></tr></thead><tbody><tr><td>SFT / 行为模仿</td><td>在参考前文上学习参考动作</td><td>本文在学生实际交互到达的状态上训练</td></tr><tr><td>TCOD / ReOPD</td><td>改变交互长度或开始生成时的前文</td><td>本文从正常初态出发，不先执行参考前半段</td></tr><tr><td>Skill-SD / SDAR / TurnOPD 等</td><td>依据技巧、置信度、分歧、回合或结果挑选监督</td><td>本文先查参考动作依赖的状态是否成立</td></tr><tr><td>FullPath-SD → SMRC-SD</td><td>所有回合完整路径 → 匹配回合完整路径、状态摘要、候选</td><td>能分别实验“筛回合”和“改提示”</td></tr></tbody></table></div>

<p class="source-note">依据原文 Related Work。这里概括论文的比较轴，不表示已独立复现每项邻近工作。GRPO 在两种路径蒸馏方法中都保留；教师不是始终固定的初始模型。</p>

<h2 id="方法：状态匹配、教师提示与损失计算">3. Method：匹配实际状态，再重评学生回答</h2>

<p><strong>每回合先决定参考是否适用，适用时教师才多看局部解释。</strong>同题的一条参考动作序列叫 reference path；程序记录的位置、手中物体和相关任务进度叫 state signature。参考每一步执行前的记录由动作前缀重建。</p>

<figure class="figure original-wide"><a href="/lib/papers/state-matched-routing-contextualized-sd/figure-2-original.webp" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/figure-2-original.webp" width="3331" height="1418" alt="完整原Figure2：当前状态与参考前置状态匹配，教师读取完整路径、实际状态和候选，GRPO保留"></a><figcaption>原 Figure 2。可横向滚动或放大查看，英文标签保留。图片由作者 <a href="https://github.com/liujunzhuo/SMRC-SD/blob/f3e43bab78828d12ee7e2f717e041b70f43ad43f/assets/smrc_sd_overview.png">SMRC-SD 仓库</a>发布，依据其 Apache-2.0 许可复用；仅无损转为 WebP，<a href="/lib/papers/state-matched-routing-contextualized-sd/SMRC-SD-LICENSE.txt">许可证副本</a>。</figcaption></figure>

<h3 id="先准备参考，再让学生自己执行">3.1 参考从哪里来，一次更新做什么</h3>

<p>ALFWorld 使用 TextWorld 专家路径，每个训练游戏一条，执行验证后收录，共 3,553 条。WebShop-small 有 1,000 件商品；作者按目标商品标识 ASIN 和要求选项构造“搜完整商品名 → 打开目标 → 选选项 → 购买”。清单有 6,910 个目标，训练只用编号 <code>500…6909</code>，即 <strong>6,410 个</strong>；前 500 个排除，固定选 128 个评测。这些购物记录叫 oracle traces：按已知目标构造的参考，<strong>不保证官方购物评分达到 1</strong>。</p>

<p>一次更新让学生对 16 个任务各交互 8 次，全部从正常初态开始。训练器逐回合取学生实际动作与观察，查同题参考，寻找可接续的位置。匹配回合的教师读取<strong>完整参考 + 实际状态的一行摘要 + 当前候选动作</strong>，然后重评学生的同一回答。这里不截短完整参考，不替换学生动作，也不把环境改成参考状态。</p>

<p>决定这一回合是否加入参考损失，叫 routing。匹配失败时 abstain，即<strong>这一回合参考损失为零</strong>，模型仍行动，GRPO 仍训练，也不把该动作自动标成错误。</p>

<h3 id="匹配规则：不是一句“语义相似”">3.2 购物案例：颜色、尺码可以换顺序</h3>

<p>Table 12 给出一条真实的教师输入：目标商品 <code>B07S7HDC88</code>，颜色 <code>blue137</code>，尺码 <code>9</code>。原参考先选颜色再选尺码。当前颜色已经选好，候选就是 <code>click[9]</code>；若学生先选了 9，程序会给 <code>click[blue137]</code>。两项都缺时给一个可选动作集合，不硬定唯一顺序。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/state-matched-routing-contextualized-sd/webshop-case-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/webshop-case-compact.svg" width="900" height="300" alt="真实Table12完整购物参考；当前颜色blue137已选、size9未选，候选click9；拒绝边界与任务判分分开"></a><figcaption>本文按 Table 12 和公开函数独立整理。原文未给这个输入的任务 ID、完整学生动作日志或最终得分；底部拒绝状态是本文补写的代码检查。</figcaption></figure>

<p>规则检查页面类型、商品、已选选项是否与目标冲突，以及候选是否在当前可点击列表里。商品不对、颜色冲突、缺少必要按钮都会拒绝该回合。本文直接运行固定版本的 <code>webshop_goal_progress_guidance</code>，确认上述分支；只验证函数，不冒充真实购物重放。</p>

<details class="supplement"><summary>实现核查：可运行购物匹配示例与状态来源的差别</summary><p>Python 3，本文写的调用示例；需在固定仓库 <code>f3e43bab</code> 根目录运行，预期候选 <code>click[9]</code>。这是实际公开函数，不是本文重写的正式判分器。</p>

```python
from agent_system.webshop_state_utils import webshop_goal_progress_guidance

result = webshop_goal_progress_guidance(
    {"page_type": "item_page", "asin": "B07S7HDC88",
     "options": {"color": "blue137"}},
    target_asin="B07S7HDC88",
    target_options={"color": "blue137", "size": "9"},
    available_actions=["click[9]", "click[buy now]"],
)
assert result["state_match"]
assert result["action"] == "click[9]"
print(result["action"])
```

<p>论文说两个适配器由普通观察和执行记录重建状态。公开 ALFWorld 实现符合这一路径；但 WebShop 的 <code>capture_webshop_state</code> 实际读取模拟器会话中的商品、选项和浏览器 URL，再传给训练器。这些字段对应页面已显示的信息，却<strong>不是仅从学生可见文本独立解析出来</strong>。迁移到真实网站时，需要补一个页面解析器，不能把这版实现称为已验证的“纯观察状态恢复”。来源：<code>webshop_state_utils.py</code> 第 142–156 行，<code>webshop/envs.py</code> 第 98–113 行。</p></details>

<h3 id="给教师的仍是完整路径，然后重评学生回答">3.3 家庭操作：精确检查对象与已完成步骤</h3>

<p>ALFWorld 主实验要求当前位置和手中物体一致，参考需要的物体位置一致，参考需要的属性已具备。它用精确物体编号；允许额外兼容进度，但不会把缺失前提当作已完成。候选还必须可执行；多个位置通过时选<strong>最靠后的兼容位置</strong>。</p>

<p>Table 13 中 <code>lettuce 3</code> 已放进冰箱：历史匹配器仍建议再次开冰箱，状态匹配器给 <code>go to countertop 2</code>，转去处理第二个物体。<code>fork 1</code> 已清洗、<code>mug 4</code> 已加热的记录也不再重复处理。当前在 <code>fridge 1</code> 时，不能用参考起点 <code>diningtable 2</code> 的前提强行匹配。这些是代表性审核记录，未公开完整单题前文。</p>

<details class="supplement"><summary>已公开参考的完整案例：清洗 cloth 4 并放回 drawer 6</summary><p>新发布数据的首条完整轨迹，任务 <code>trial_T20190909_070356_398456</code>，来自作者验证过的 TextWorld 专家参考。初始任务是 <code>clean some cloth and put it in drawer</code>。动作顺序：</p><div class="code-scroll"><pre><code>go to drawer 6 → open drawer 6 → take cloth 4 from drawer 6
→ go to sinkbasin 1 → clean cloth 4 with sinkbasin 1
→ go to drawer 6 → move cloth 4 to drawer 6</code></pre></div><p>记录先观察到抽屉关闭，打开后见到 cloth 4；拿起后到 sinkbasin 1，观察确认清洗；最后返回抽屉并放入。数据的 <code>success=true</code> 和最后观察 <code>You move the cloth 4 to the drawer 6.</code> 是作者发布的执行证据。它不是 SMRC-SD 学生的一次测试成绩。文件含动作与观察，没有强模型的推理文字；训练也不按这些 <code>prefix_actions</code> 预先重置到中途。</p></details>

<h3 id="损失分母保留所有原回答-token">3.4 损失：只取采样 token，分母保留全部回答</h3>

<p>教师与学生对同一个采样 token 给概率，论文用它们的概率比估计分布差异，称为 <strong>K3</strong>。它不是遍历整个词表的 KL。pS、pT 分别是当前学生与教师的概率，pOld 是生成这条回答时的学生概率；设 <code>δ=log pS−log pT</code>，<code>η=log pS−log pOld</code>：</p>

<div class="formula"><code>d = exp(min(−δ,20)) − 1 + δ<br>ρ = exp(min(η,10))<br>L_SD = Σ(匹配回合 × 非特殊 token × ρ × d) / 所有原回答 token 数<br>L_total = L_GRPO + 0.01 × L_SD</code></div>

<p>推理和动作文字都参加，只去分词器特殊 token。未匹配回合仍在分母里，所以减少匹配回合也减少总蒸馏贡献。pT 和 pOld 停止梯度，<strong>ρ 对当前学生仍可求导</strong>；代码中可选的另一种 KL 路径不能与主实验混用。</p>

<p>一个本文假设算例：两回合各 2 个 token，只有第一回合匹配，每个 token 的 <code>pS=pOld=0.2、pT=0.4</code>。于是 <code>d=1−ln2≈0.30685、ρ=1</code>，<code>L_SD=2d/4≈0.15343</code>；若误用“仅选中 token”的分母，就会翻倍。本文用公开损失函数做了 CPU 验算，不代表训练实测概率。</p>

<h2 id="实验：成功率、消融与完整重放">4. Experiments：先区分任务判分与参考匹配</h2>

<p><strong>主结果测的是整题任务成功；参考匹配只是训练中的筛选规则。</strong>128 个固定任务各从初态执行 4 次，共 512 条交互。ALFWorld 的 <strong>Average@4 = 成功执行次数 / 512</strong>；Pass@4 则是 128 题中至少一次成功的比例。例如一题四次只成功一次，前者对该题贡献 25%，后者计成功。</p>

<p>WebShop 点击购买后由环境打分。公开规则是 <code>r = r_type × (匹配属性数 + 匹配选项数 + 价格是否合格) / (要求属性数 + 要求选项数 + 1)</code>；r_type 再检查商品类型。<strong>Score 平均这个部分分数，Acc 只认终局 r=1</strong>。若类型合格、两项属性和价格都满足，但两个选项只对一个，教学分数为 <code>4/5=0.8</code>，仍不是完整成功。它不是 Table 12 的实际得分。公开环境把 r=1 变成训练奖励 10，其余为 0，保留原 r 供报告 Score。</p>

<figure class="figure original-wide"><a href="/lib/papers/state-matched-routing-contextualized-sd/table-2-original.webp" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/table-2-original.webp" width="1717" height="861" alt="完整原Table2全部模型、任务类型、Avg4、Pass4、WebShopScore和Acc；部分Qwen2.5基线带dagger"></a><figcaption>完整原 Table 2，SMRC-SD 作者仓库资产，依据 Apache-2.0 许可复用；保留全部行、英文表头与原注释，无损转为 WebP。可横向滚动或放大。† 是前人报告的数字，其余由论文作者本地运行，不表示所有基线都重跑。</figcaption></figure>

<p>Qwen3-1.7B 的 ALFWorld Average@4 从 <strong>74.6% 到 86.5%</strong>，WebShop Acc 从 <strong>57.4% 到 69.3%</strong>。Qwen2.5-3B 的 ALFWorld 从 76.6% 到 88.3%，但 WebShop Acc 只有 73.4% 到 73.6%。单类任务也并非都赢：Qwen3 Heat 为 FullPath 88.7%、SMRC 87.5%。</p>

<p>主表使用预先指定的参数版本，不按验证成绩选最佳：Qwen3 ALFWorld 第 250 次更新，其他第 150 次。四张 H800、单训练种子 0、学习率 <code>1e-6</code>；每批交互数据只做一轮 PPO 更新（1 epoch），训练温度 1、评测 0.4。最大回合数分别为 Qwen3 ALFWorld 30、Qwen2.5 ALFWorld 50、WebShop 15；没有多种子方差。</p>

<h3 id="筛回合与补上下文必须一起检查">4.1 最有区分力的对照：单加提示并不够</h3>

<figure class="figure reading-diagram"><a href="/lib/papers/state-matched-routing-contextualized-sd/routing-controls-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/state-matched-routing-contextualized-sd/routing-controls-compact.svg" width="900" height="390" alt="Table3到5消融：仅筛回合83.6，完整86.5；不筛回合加新提示69.5，单加候选或摘要也不改善基线"></a><figcaption>本文按 Table 3–5 数值独立整理，Qwen3-1.7B / ALFWorld / Average@4。回合筛选与提示组合分开比较，未复制原表排版。</figcaption></figure>

<p>只筛回合就由 74.6% 到 83.6%，完整提示再到 86.5%；不筛回合、只在匹配处加新提示反而 69.5%。在匹配回合上，单加候选 82.0%、单加摘要 83.4%，都没有超过普通路径的 83.6%。证据支持<strong>筛选与完整提示组合</strong>，不支持“加任何一个字段都有效”。</p>

<p>随机选同样回合数仅 72.3%，说明任意少蒸馏几个回合不足以解释收益。但 Table 14 的选中 token 比例为 14.2% 对 16.4%，<strong>回合数相同不等于 token 数或梯度总量相同</strong>。</p>

<h3 id="匹配覆盖与完整重放不是同一个指标">4.2 匹配之后，真的能执行到成功吗</h3>

<p>作者对同一批 35,712 个存档回合运行两种匹配器：历史规则选中 15.4%，状态规则 20.2%。然后重置环境，执行学生实际前文，接上候选和参考剩余动作，看<strong>终局任务成功</strong>：历史组 792/800，状态组 781/781。两组独立分层抽样，不是逐状态成对比较。</p>

<p>历史组 8 次失败的首个候选都可执行，问题出在后续参考没有完成任务：Look 类 2 次、Pick Two 类 6 次。状态组抽样全成功支持这些匹配，但没测未匹配状态的正确动作召回率。另有可用不同物体成功、却不符合精确编号参考的情况，<strong>未匹配不等于错误</strong>。</p>

<details class="supplement"><summary>附录证据：同回合审核、固定状态评分和提示成本</summary><p>Table 15 的两规则交集是 5,428 回合，占历史选中的 98.8%；交集中 5,395 个候选相同。新增状态匹配 1,775 回合，排除历史独有 68 回合，主要是手中物体不符（63）。只换匹配器、固定教师提示的在线对照，Average@4 为历史 75.6%、状态 86.5%。WebShop 的 31,296 个存档回合另做规则审核，覆盖 53.9%；这是离线覆盖统计，没有等同 ALFWorld 的完整后续重放。</p><p>Table 1、7–9 固定 79 个游戏的 1,200 个状态，使用预训练模型和 GRPO 第 250 步两个冻结评分模型；只换教师提示，不生成或训练。匹配且动作一致的一类与未匹配但有效成功的一类，FullPath 概率变化之差为 0.070，95% 区间 [0.012,0.153]。匹配但动作不同的一类，SMRC 相对 FullPath 的“候选减学生动作”概率差增量为 0.266，[0.206,0.328]；原始差仍可能为负，不能说教师已经更喜欢候选，也不把不同动作标错。区间按整游戏重采样，不把两个评分模型当作两个训练种子。</p><p>Table 18–19 在相同 800 个匹配状态上测 CPU：单核 Xeon 提示提供器平均 0.833 ms，p95 1.335 ms，索引一次构造 437.1 ms；教师额外信息块为 FullPath 112.9、SMRC 133.8 token，完整提示分别 635.7、656.6。准确差为 20.96 token。它们不是总 GPU 训练成本。Table 20 中短回答和重复片段下降，也不是不同解题策略的语义多样性。</p></details>

<h2 id="下一步：多条参考与不完整状态">5. Discussion：领域规则怎样迁移到代码编辑</h2>

<p><strong>值得借鉴的是检验参考步骤的执行前提，领域字段仍需重做。</strong>两个实验环境有明确物体、动作和选项，作者可以手写规则。代码编辑中“已经加了碰撞处理”不代表测试已通过；相同功能也可能有不同实现。下一步应准备多条验证过的参考，分别测错误匹配、拒绝有效状态、任务成功率与 token 成本。本文没有开放代码编辑或游戏项目实验。</p>

<p>迁移到网页时，还应比较会话字段与只解析页面的状态恢复。观察遗漏、按钮改变或已完成状态不明时，能否可靠地不提供参考监督，需要独立验证。测试时论文只移除参考、匹配器和教师额外提示，<strong>环境工具仍在</strong>。</p>

<h2 id="结论与参考数据的复现缺口">6. Conclusion：有效的参考适用性对照，数据已补齐</h2>

<p><strong>SMRC-SD 把“参考能成功”进一步拆成“此刻还能接上参考吗”。</strong>最有说服力的是筛回合与提示分开的对照，以及候选加后续动作的真实重放。结果仍限于两个受控环境的小模型、单训练种子和手写状态规则；匹配不是动作正确性标注。</p>

<p>本次核查发现：旧代码版本 <code>f3e43bab</code> 缺少四份默认参考文件，但作者在 <code>0435026e</code>（2026-10-10）已补齐，最新 <code>6fb24338</code> 也保留它们。本文完整核对了 128 题清单的唯一 ID 和留出范围，并抽查大文件中的动作与观察；没有完整下载全部大文件或重新训练。最新仓库另加了 4B、FTRL 与 WebShop 服务，<strong>不把新增结果混入 v1 主表</strong>。</p>

<details class="supplement"><summary>参考数据链接、完整原图和所有附录图表入口</summary><p>作者在新增数据 commit 下发布：<a href="https://github.com/liujunzhuo/SMRC-SD/blob/0435026eb2a32eb68c2c888e2ca5e8e3a92c8e1f/examples/smrc_sd/data/alfworld_verified_walkthrough_prefixes.jsonl">ALFWorld 前缀索引</a>、<a href="https://github.com/liujunzhuo/SMRC-SD/blob/0435026eb2a32eb68c2c888e2ca5e8e3a92c8e1f/examples/smrc_sd/data/alfworld_verified_walkthrough_trajectories.jsonl">完整动作与观察</a>、<a href="https://github.com/liujunzhuo/SMRC-SD/blob/0435026eb2a32eb68c2c888e2ca5e8e3a92c8e1f/examples/smrc_sd/data/webshop_small_seed0_oracle_paths.jsonl">WebShop oracle 路径</a>、<a href="https://github.com/liujunzhuo/SMRC-SD/blob/0435026eb2a32eb68c2c888e2ca5e8e3a92c8e1f/examples/smrc_sd/data/webshop_small_seed0_val128.json">固定 128 题清单</a>。最后一个完整文件有 128 个唯一任务 ID，goal_index 全在 0–499；大文件仅抽查可完整解析的部分记录，不宣称核完总行数。</p><p>原文全部图表：<a href="https://arxiv.org/pdf/2608.05219v1#page=1">Figure 1（购物错位示意）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=4">Figure 2（本文已保留）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=6">Figure 3、Table 2–3（训练动态、主结果和路由对照）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=3">Table 1（固定状态评分）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=7">Table 4–6（筛回合、提示字段与匹配审核）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=11">Table 7–8（状态分组和候选概率）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=12">Table 9（动作概率变化）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=13">Table 10–12（教师提示、购物审核、真实输入）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=15">Table 13–17（代表案例、token 量、同回合和重放）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=16">Figure 4、Table 18–21（匹配器动态、CPU、长度、配置）</a>；<a href="https://arxiv.org/pdf/2608.05219v1#page=17">Table 22（各设置上限）</a>。仓库许可只用于作者单独发布的 Figure 2、Table 2 资产；没有把它扩大为整份 PDF 的转载许可。</p></details>

<p class="source-note">依据 17 页 v1 全文、附录与逐页渲染，以及固定代码和新增数据检查。源码可读、CPU 函数验算通过，不等于完整训练复现。个人兴趣程度 10/10，仅表示与博客作者本人兴趣的相关程度。</p>

</div>

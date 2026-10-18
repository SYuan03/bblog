---
title: "[2026-07-23] Sample-Efficient Learning from Agent Experience"
permalink: "/posts/论文解读/sample-efficient-learning-from-agent-experience.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-19T01:10:00+08:00"
cover: "/lib/papers/sample-efficient-learning-from-agent-experience/cover.svg"
description: "模型修错五次，第六次才发现漏掉了查询刷新：这些经验怎样变成训练数据？本文用真实 MapStore2 案例讲清教师重写、样本打包、补丁验收，以及少跑环境与少花计算的区别。"
paper_style: editorial
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 14
categories:
  - "论文解读"
tags:
  - "Agent Experience"
  - "Context Distillation"
  - "Software Engineering"
  - "Sample Efficiency"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a>img{width:780px;max-width:none;height:auto}}
</style>

<div class="paper-reading">

<p class="paper-meta">Chenhui Gou, Haoqin Tu, Yunhao Fang, Jianfei Cai, Hamid Rezatofighi · arXiv:2607.21051v1 · 最早公开于 2026-07-23</p>
<div class="source-links"><a href="https://arxiv.org/abs/2607.21051v1">论文主页</a><a href="https://arxiv.org/pdf/2607.21051v1">论文 PDF</a></div>

<section class="deck-wrap" aria-label="Experience Distillation 交互图解">
  <div class="deck-head"><strong>14 页交互图解 · 从真实试错，到新目标与验收</strong><a href="/lib/decks/sample-efficient-learning-from-agent-experience-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/sample-efficient-learning-from-agent-experience-visual-guide.html" title="Experience Distillation 论文图解，共 14 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>手机可滚动页内内容与宽图；Esc 退出全屏</span></p></div>
</section>

<p class="lead">模型为同一个软件问题试错了六次，终于知道：按钮发出清除事件还不够，查询管线也得接收这个事件。论文研究怎样把这些后来才发现的知识训练进模型，同时避免为了生成训练数据再把所有新动作运行一遍。方法叫 Experience Distillation，简称 EPD。</p>

<aside class="part0"><span class="kicker">PART 0 · 经验、决策与环境返回</span><h3>一次完整尝试里，可以有很多次工具调用</h3><p>模型读问题、查仓库、改代码、跑测试，最后交出一次修复，称为一个 trial。中间每次模型输出的分析与最终工具动作，叫一次 decision；工具执行后的结果叫 observation。多次 trial 的这些记录合起来，就是本题的经验。</p><p>本文让 teacher（教师）多看整题经验，重新生成一次决策；student（学生）不看这份额外经验，学习教师的新决策。两者从同一模型出发，蒸馏阶段教师固定，只更新学生。测试时学生仍然调用工具，只是不再携带旧试错记录。</p></aside>

<aside class="keypoints"><h3>先记住三点</h3><ul><li>749 道训练过的软件题中，单次通过率从未训练的 5.3%、直接训练旧记录的 8.0%，到 EPD 的 <strong>51.4%</strong>；做题时保留旧经验的参考是 76.4%。</li><li>教师新动作<strong>不执行、不另做验收</strong>；真实旧工具返回只对应真实旧动作。它们的关系决定训练样本能否讲对。</li><li>未参与收集与训练的 494 道新题，单次通过率为 <strong>4.62% → 8.84%</strong>。训练内高分和新题泛化要分开看。</li></ul></aside>

<h2 id="研究问题：如何利用试错之后才得到的证据">1. Motivation：让后来发现的知识改变早先的决策</h2>

<p><strong>直接模仿旧记录，会同时学习当时的错误方案；看到后续反馈的教师可以重新考虑那一步。</strong>同一道题第六次才找到关键原因，前五次的分析与改动并不会自动变成好答案。本文先让教师读整段经验，再从记录里的某个位置重新生成下一步。</p>

<p>把旧经验放在输入里重新做题，是 in-context learning（ICL）：参数不变，模型根据额外证据改变行为。作者希望移除这份长经验后，收益仍留在参数里。但让经验教师从头执行新修复，又要花测试、工具和环境成本。</p>

<p>另一种办法是让模型预测工具返回，再继续生成动作。预测若错，后续决策也会跟着错。EPD 把分支缩到一次决策，<strong>在新动作结束、环境还没返回时停止</strong>。这样收集经验之后的蒸馏不再需要新增环境执行，但教师生成与学生训练仍有计算成本。</p>

<h2 id="与旧轨迹微调和-on-policy-蒸馏的区别">2. Related Work：谁生成目标，谁重新执行</h2>

<p><strong>最直接的比较是同一份经验上的 SFT：它模仿旧决策，EPD 学习教师读完经验后新写的决策。</strong>论文 §5 还讨论了经验记忆、context distillation（把额外输入带来的行为训练进参数）和样本高效强化学习。</p>

<div class="table-scroll"><table><thead><tr><th>路线</th><th>输入与输出</th><th>这里改变什么</th></tr></thead><tbody><tr><td>旧记录 SFT（监督微调）</td><td>旧前文 → 当时的旧决策</td><td>重新生成利用后续证据的训练目标</td></tr><tr><td>Reflexion / ExpeL 等经验记忆方法</td><td>做题时读取反思、经验或外部记忆</td><td>还要把经验的收益训练进参数</td></tr><tr><td><a href="/posts/论文解读/on-policy-context-distillation.html">On-Policy Context Distillation（OPCD）</a> / <a href="/posts/论文解读/privileged-information-distillation.html">Privileged Information Distillation（PID）</a> 的 on-policy 模式</td><td>学生自己执行；教师多看资料，重评学生输出</td><td>从存档前文生成教师目标，不采新的学生执行</td></tr><tr><td>模型模拟环境的多步分支</td><td>新动作 → 预测返回 → 再生成动作</td><td>只生成一次新决策，不预测新返回</td></tr></tbody></table></div>

<p>默认由教师采样 token（模型处理的文字单位），学生提高这些 token 的预测概率，训练称为 next-token prediction（NTP）。它在期望上对应 forward KL：按教师的输出分布要求学生跟上。通常 on-policy self-distillation（OPSD）则让学生先生成，教师重评学生同一输出。on-policy 指数据来自学生当前的行为；本文默认数据来自固定教师，不属于这一模式。OPCD / PID 还可有其他模式，表格只比较原文讨论的 on-policy 路线。</p>

<h2 id="方法：经验收集、单步分支与样本打包">3. Method：先形成经验，再重写并打包决策</h2>

<p><strong>先收集同题的反复修复记录，再从真实动作边界生成新的教师目标。</strong>软件每题启动 8–12 个独立过程，每个最多 10 次 trial。只保留超过一次尝试才得到接受提交的过程；若多条满足，均匀随机选一条。</p>

<p>同一过程里，模型保留以前的历史与工作树修改，可继续修、保留或撤回旧编辑。独立的是不同过程，<strong>不是同一段历史里的几次尝试</strong>。749 份选中记录平均每题 60.5 次交互、82.4K token，总量 45,301 次交互、61.7M token；总量不是一次模型输入。</p>

<p>文字游戏用 TaleSuite：模型发自然语言命令，读游戏描述与积分。每次 trial 重置游戏状态，经验仍保留。主实验六题共 47 次 trial、3,672 次交互、502K token；软件和游戏用不同内部模型，名称未披露。任务清单、原始经验和外部验收器也未提供，不能当成公开可重跑的数据集。</p>

<h3 id="从一条真实记录生成目标">3.1 教师读什么，学生学什么</h3>

<p>作者先整理整题经验，记作 <code>g(history)</code>，可能重写或总结记录，保留重要反馈。教师看到真实前文、这份额外经验，以及固定的深入推理要求，生成一次完整分析与动作。<strong>不执行该新动作，也不生成它的返回</strong>。学生只见训练前文，损失只算新教师输出；额外经验和推理要求不进入学生输入。具体整理提示与完整训练模板没有公开。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/branch-packing.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/branch-packing.svg" width="900" height="320" alt="新教师决策、旧动作和旧返回交错；蓝色新决策计算损失，真实返回只接旧动作"></a><figcaption>本文按 §3.3、Eq. 3–4 独立整理。a′ 是新教师决策，a 是旧决策，o 是真实工具返回；箭头表示序列顺序，不表示新动作被执行。</figcaption></figure>

<h3 id="Branch-packing-为何不是一条新执行轨迹">3.2 多个分支怎样打包</h3>

<p>每个动作边界单独生成样本，会反复处理重叠的长前文。作者把同一记录的多个分支合进一个序列，称为 branch packing：<code>o₀, a′₀, a₀, o₁, a′₁, a₁, o₂…</code>。教师生成 a′₀ 后，插回真实旧决策 a₀ 和它的真实返回 o₁，再生成下一个分支。</p>

<p><strong>o₁ 属于旧 a₀，不属于新 a′₀。</strong>实际模板用标记区分两类决策。后面的前文还含更早的 a′，所以 Eq. 4 是实用近似，不是 Eq. 2 中每个分支独立生成的严格实现，更不是一条新执行轨迹。</p>

<div class="formula">L = − Σ log p_student(a′ₜ | 打包前文 cₜ)<br>只计算新分析与新动作的 token；旧决策和旧返回只作前文。</div>

<p>例如假设某个新决策只有两个 token，学生分别给概率 0.5、0.25，这个决策的负对数似然为 <code>−ln(0.5)−ln(0.25)≈2.07944</code>。这是教学验算，不是实测概率；实际批次按 token 还是序列平均，论文未披露。</p>

<h3 id="贯穿案例：MapStore2-的过滤器为什么清不掉">3.3 MapStore2：清除事件卡在哪一段</h3>

<p>C.3 给出真实问题：打开地图图层的要素表格（feature grid），点 marker 在地图上选中一个要素，打开再关闭高级过滤面板，最后点 x 清除空间过滤，表格却仍被原条件过滤。任务要求修代码，让清除恢复未过滤结果。原 issue 摘录由论文提供，未给可独立定位的任务 ID 或仓库起始版本。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/mapstore-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/mapstore-real-case.svg" width="900" height="320" alt="MapStore2第5次组件发出null重置但被查询条件过滤，第6次保留geometry类型更新后通过"></a><figcaption>按 C.3、Table 15 与原文三组件关系独立整理。三段是作者对修复的分析，不是三条独立评分断言；每次后续尝试继承前次工作树。</figcaption></figure>

<p>面板来回之后，geometry value（保存的空间过滤范围）还在，控件却标为 deactivated（停用）。原点击处理器显示 x，却不执行清除。第 5 次已经让组件明确发出 <code>value: null</code> 和 <code>deactivated: true</code>，仍被拒绝。</p>

<p>第 6 次发现：query epic 用 <code>!!update.value</code> 过滤输入，null 被当成假值丢掉，没有触发新查询。这里 epic 是 RxJS 的事件处理管线。最终补丁保留组件重置，再用 <code>!!update.value || update.type === 'geometry'</code> 允许 geometry 更新继续进入查询流程。</p>

<p>教师重新生成的所选目标 1 和 4 包含组件重置、查询入口修复；目标 2 和 3 却重提了早先被否决的改动位置或假设。<strong>最后一次旧修复被接受，不代表每条新教师目标都验证过。</strong></p>

<details><summary>补充：前五次如何失败，以及可运行的条件检查</summary><p>Table 15 的每行只记本次主要新增改动：第 1 次改程序取消路径，第 2 次让 x 可点，第 3 次尝试退出临时编辑状态，第 4 次组合多个改动，第 5 次明确组件端 null，第 6 次让 null 进入查询。临时状态解释后来被质疑，不能把第 3 次的假设当成已确定的根因。</p><p>以下是按论文展示的入口条件独立写的教学示例，运行环境 Node.js 22，不是原补丁或官方验收器。它只验证 null 能否通过两个条件，不模拟 React、RxJS 或浏览器。</p>

```javascript
import assert from "node:assert/strict";

const oldAccepts = (u = {}) => !!u.value;
const repairedAccepts = (u = {}) =>
  !!u.value || u.type === "geometry";
const reset = { type: "geometry", value: null, deactivated: true };
assert.equal(oldAccepts(reset), false);
assert.equal(repairedAccepts(reset), true);
assert.equal(repairedAccepts({ type: "text", value: null }), false);
console.log("geometry reset: blocked before, admitted after");
```

<p>所选 EPD 补丁还在面板返回路径清除残留 geometry，其改动位置不与每条教师目标逐一相同。论文没有证明“一个目标精确造成一个最终编辑”。</p></details>

<h2 id="实验：训练内巩固、未见题泛化与预算">4. Experiments：先看判分，再分清效果与成本</h2>

<p><strong>主实验检验同题经验能否留在参数里；新题能力另用未见任务评测。</strong>所有软件评测从原始仓库和问题开始，不继承收集时的代码。只有 ICL 参考额外读取本题历史，其他方法不给历史。</p>

<h3 id="补丁与游戏各怎样计分">4.1 一个补丁怎样通过</h3>

<p>软件补丁交给外部 verifier（验收程序），接受记 1，拒绝记 0。pass@1 对全部 749 题的单次结果取平均，主实验每题评测 10 次；pass@10 是 10 个独立候选里至少一个被接受的题数除以 749，不是十次通过率均值。</p>

<p>MapStore2 的 EPD 测试不带六次经验，所选补丁让 null 继续触发查询。论文记录的外部局部测试要求：禁用的已存 geometry 更新必须发出 <code>UPDATE_QUERY</code>，且 <code>reason=geometry</code>。它通过外部验收；但候选<strong>没有跑通本地整套浏览器测试</strong>，不能说完整 UI 重放已验证。ICL / EPD 各接受 10/10 个候选，未训练、SFT、PPO 各 0/10。这是训练内的精选案例，完整验收代码与构建过程未公开。</p>

<p>游戏先算 <code>100 × 获得积分 / 本题最高积分</code>，再对六题取算术平均，主表重复 16 次。43.8 是平均归一化积分，<strong>不等于 43.8% 游戏通关</strong>。软件 10 次、游戏 16 次都是评测重复，不是训练种子数。</p>

<p>另一个指标是 ICL-normalized gain，即保留了多少“ICL 相对未训练模型的提升”：<code>G=(S_method−S_zero)/(S_ICL−S_zero)×100%</code>。软件验算 <code>(51.4−5.3)/(76.4−5.3)≈64.8%</code>。G 可为负或超过 100%，ICL 参考不是理论上限。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/results-and-budget.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/results-and-budget.svg" width="900" height="390" alt="Table1主结果软件单次通过率和游戏积分分别比较，不把训练内分数当新题泛化"></a><figcaption>按完整 Table 1 的数值独立整理，原表保留在<a href="https://arxiv.org/pdf/2607.21051v1#page=5">第 5 页</a>。学生测试不看经验，ICL 参考仍看经验；主表的 G 先跨任务平均再计算。</figcaption></figure>

<h3 id="最能检验机制的对照">4.2 哪些对照真正支持方法</h3>

<p>去掉模拟返回：五游戏中，一次新决策均分 49.8，两个决策加一次模拟返回为 40.1；但 <strong>Acorncourt 反向，34.9 &lt; 53.6</strong>。附录模拟 Detective 时，模型说 dance 不能执行却报加 10 分，诱导下一步 sing，展示了一个具体错误，没有统计环境模拟的错误率。</p>

<p>打包分支：4,096 个样本合为 128 个序列，训练步数 768 →64，教师生成加学生训练的合计时间降低超过 10 倍，均分 43.1 →43.8；<strong>Inhumane 却从 41.5 降到 36.6</strong>。效率改善不能写成每题都更强。</p>

<p>教师与学生采样的比较只测两个单独训练、匹配计算量的游戏。Balances / Detective 的 G，教师采样为 96.7% / 98.4%，学生采样 reverse KL 为 9.1% / 0.4%；reverse KL 按学生自己采到的输出计算教师与学生的概率差。作者认为学生很少采到经验支持的关键决策，重评已有输出难以补上它们；两题结果不能推出所有学生采样的蒸馏都失败。</p>

<h3 id="9-6×-少的是什么">4.3 环境样本与模型计算分开记账</h3>

<p>一次 environment sample 指完整 trial，不是一个工具调用。软件收集预算包括为选出成功记录花掉的全部探索。强化学习基线 PPO 最好也是最后的成绩 17.74%，对应平均每题 504.9 次完整执行；EPD 用 9.6 倍更少的环境样本得到 51.4%。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/budget-compact.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/budget-compact.svg" width="900" height="300" alt="少用完整环境trial与额外教师生成的两本账，最好RL成绩配完整预算，不是同分最低成本"></a><figcaption>按 Figures 1 / 3 数据独立整理。增加教师生成仍要计算，最大约 172M token 是本文用 61.7M×2.79 验算，原文没有完整 GPU 成本账单。</figcaption></figure>

<p>游戏基线 GRPO 按同题一组尝试的相对奖励训练模型。最好 29.9 分出现在第 16 次更新、240 次执行，完整运行到 448 次后为 26.0。Figure 1 配对<strong>最好成绩与完整运行预算</strong>，据此报 57.2 倍；不是达到同分的最低样本成本。教师生成量增加带来的提升，也不能换算成同等墙钟时间。</p>

<h3 id="跨未见软件题提升多大">4.4 新任务提升更小，但确实另测了</h3>

<p>494 个新题排除在经验收集与蒸馏之外，含未见仓库和任务类型的 278 题、旧仓库里新任务类型的 216 题。总 pass@1 为 <strong>4.62% →8.84%</strong>，pass@5 为 20.39% →26.13%；两子集单次通过率分别 4.72% →8.87%、4.49% →8.80%。有转移收益，但绝对成绩远低于训练内 51.4%。</p>

<details><summary>补充：完整主表、消融数值、重复设置与各游戏子集</summary><p>Tables 1 / 9 的完整主结果如下。软件 G / 游戏 G 是增益保留率。Table 3 先算每题 G 再平均，所以同样均分 43.8 对应平均 G=90.1%，与主表先平均再算的 93.4% 不冲突。</p><div class="table-scroll"><table><thead><tr><th>方法</th><th>软件 pass@1 / pass@10</th><th>游戏平均分</th><th>软件 G / 游戏 G</th></tr></thead><tbody><tr><td>未训练</td><td>5.3% / 31.9%</td><td>18.5</td><td>0% / 0%</td></tr><tr><td>ICL 参考</td><td>76.4% / 86.4%</td><td>45.6</td><td>100% / 100%</td></tr><tr><td>SFT</td><td>8.0% / 39.8%</td><td>17.8</td><td>3.8% / −2.6%</td></tr><tr><td>EPD</td><td>51.4% / 80.9%</td><td>43.8</td><td>64.8% / 93.4%</td></tr></tbody></table></div><p>Table 6 比较保存完整教师词表概率与只训练采样 token：独立单步分支、训练 16 epochs（完整遍历训练数据 16 次），平均分 43.4 vs 43.1、每题 G 平均 82.0% vs 84.2%，没有清晰全分布优势。Table 7 的深入教师推理令 Detective 50.7 →71.8，但使用 4,096 次教师生成、三步分支和 1–5 段历史，不是默认单步方法的直接消融。</p><p>Figure 4 中，小学习率 <code>1e−6</code> 配合 4 →16 epochs 改善；<code>1e−5</code> 继续训练虽降低 loss，却降低任务成绩。原图横轴反向，低 loss 在右边；不应只按训练 loss 选模型。Table 8 的六游戏 EPD 均分 43.77 与 Claude Opus 4.5 的 43.76 相近，但后者是推理时不看经验的参考，不能推成通用能力追平。</p><p>Figure 3 固定经验库，每次 trial 生成 1 / 2 / 5 / 8 / 16 条打包序列，对应生成量 0.17 / 0.35 / 0.87 / 1.39 / 2.79 倍经验 token，G=31.8% / 37.0% / 45.1% / 53.7% / 64.8%。没有新增环境执行，计算量明显不同。</p><p>Figure 2 持续学习每轮每题收集四次 trial，清空旧经验、从上一轮参数初始化；五轮每题共 20 次，均分 7.1 →47.0。主六题是 Balances、Detective、Enter、Inhumane、Library、Reverb；模拟环境对照五题加入 Acorncourt、去 Library / Reverb；持续学习六题用 Acorncourt 替换 Enter。它们不是同一子集的直接分数比较。</p><p>A.7 写每个游戏 trial 最多 100 次交互，Table 10 中 Enter 为 6 trials / 606 turns，Inhumane 为 12 / 1,212；如何统计多出的 turns 未说明。本文保留原数，不自行修正。论文只给评测重复和部分学习率检查，没有完整优化参数或训练种子方差。</p></details>

<h2 id="下一步：核验新目标和打包前文">5. Discussion：优先检查新目标与前文是否可信</h2>

<p><strong>值得补的实验是：同一经验与计算预算下，筛掉错误目标、去掉不自然打包，收益怎样变化。</strong>MapStore2 新目标会重提失败假设。可以先用已有反馈检查它是否受支持，再花少量环境执行验证筛选效果；新增执行要单独计入，不能仍称完全不新增交互。</p>

<p>另一个问题是学生训练时看见较早的教师决策，却紧接旧动作的真实返回。部署不会自然出现这种交错。应在相同经验和总生成 token 下比较独立分支、打包分支、仅真实前文的目标，再加入少量学生执行校准，分别看训练内巩固与新任务成绩。</p>

<details><summary>补充：ColorButton 为什么“多采样”不保证探索到正确行为</summary><p>作者在 B.2 构造三次按钮选择，选项数 2×3×3=18；只有完整顺序正确才得 1，前两步不反馈对错。理想的经验模型记住失败、不重复，最多 18 次可枚举找到答案。这是理想枚举结论，不是对实际 ICL 模型的保证。</p><p>GRPO 同题从当前模型重复采样一组，再按组内奖励比较。若正确序列概率为 p，组大小 G，至少采中一次的概率为 <code>1−(1−p)^G</code>，不会强制遍历不同序列。绿→蓝→红为答案、G=16 的运行从 60% 到 100%；换成红→红→绿、G=256 后仍全零。答案与组大小同时变了，不是单变量消融。</p><p>全组奖励为零时，组内相对优势为零，任务奖励损失的梯度也为零；KL 或其他辅助项仍可能有梯度。诊断只表明没有成功样本时缺少任务奖励方向，不表明以后采到正确行为仍不能学。原 <a href="https://arxiv.org/pdf/2607.21051v1#page=25">Figure 7</a> 与 <a href="https://arxiv.org/pdf/2607.21051v1#page=26">Table 12</a> 保留这两个不同设置。</p></details>

<h2 id="结论与复现边界">6. Conclusion：复用真实反馈，不把新目标当已验证轨迹</h2>

<p><strong>本文的贡献是具体的数据生成与打包办法：用真实旧反馈生成新决策，再训练不给额外经验的学生。</strong>主结果明显强于直接模仿同一份旧记录，新题也有改善；一次新决策、不预测返回的设计解释了它为何不新增环境执行。</p>

<p>复现仍缺内部模型、749 题清单、原始历史、完整整理与打包提示、优化设置、官方训练代码和验收器。公开精确标题搜索找到的是 alphaXiv 的替代环境复现，使用不同模型与任务，不能当作作者实现。原图的转载许可也未确认；本文链接原图，独立整理事实关系与数值，不复制其排版。</p>

<p>八个软件案例特意选强对比：ICL 接受 79/80，EPD 接受 72/79 个有效候选，两者都在至少一次通过的口径下解决八题。Auth0 只有九个有效 EPD 候选，原因未交代；<strong>不能把 72/79 当作 749 题的总体通过率</strong>，也不能把展示的一段补丁认作唯一学习因果链。</p>

<details><summary>补充：其余七个真实软件案例，哪些证据支持、哪些尚未验证</summary><div class="table-scroll"><table><thead><tr><th>项目 / 试错次数</th><th>成功修复的实际区分</th><th>EPD 接受候选 / 边界</th></tr></thead><tbody><tr><td>Billboard.js / 6</td><td>共享排序时间轴用二分搜索，分系列时间轴遍历；API、联动图表与 DOM 都要处理无匹配</td><td>9/10；所选教师只生成四处修复中的两处，本地浏览器套件未运行</td></tr><tr><td>Relay / 2</td><td>缓存需保留的记录，与活跃订阅需保留的记录分开；不删缓存也可停止订阅</td><td>9/10；验收显式释放引用后跑 GC，非完整 React 卸载重放</td></tr><tr><td>Auth0 SDK / 2</td><td>Set-Cookie 逗号既可分 cookie，也可在 Expires 日期里；解析与逐项写回都需修</td><td>8/9 有效；49 个工具测试通过，边界正则不是完整 cookie 标准</td></tr><tr><td>GraphQL Mesh / 6</td><td>等 schema 可用才找现有根类型，配置名与生成的 SomeSourceQuery 名分开</td><td>9/10；同时修改运行逻辑与三种公开配置表示，146 测试过、1 跳过</td></tr><tr><td>GitHub CLI / 5</td><td>默认用 PR 标题正文；仅交互模式且 stdin 为终端时询问，选项传入合并 API</td><td>9/10；有终端不等于用户同意交互询问</td></tr><tr><td>Gauge / 2</td><td>循环引用清理两个内部表；公共文件发现去重，而非只在编辑器调用端去重</td><td>9/10；教师对第一次改动的描述部分不准确，最终编辑仍符合第二次发现</td></tr><tr><td>Strapi / 4</td><td>已存相对媒体路径补 backend URL；用户输入的外部 URL 仍要求绝对路径</td><td>9/10；已接受的旧修复放宽了输入，教师后来纠正，学生未修改该输入 schema</td></tr></tbody></table></div><p>来自 C.4–C.11。ICL 在这些题除 GraphQL Mesh 为 9/10 外均 10/10；未训练、SFT、PPO 各题均 0/10。以上只是论文选中案例及日志报告，本文没有重跑这些测试。完整任务包缺失时，无法据此估计策略出现频率或独立复现。</p></details>

<details><summary>来源索引：全部原图、原表与公开材料边界</summary><p>原文 8 幅 Figure：<a href="https://arxiv.org/pdf/2607.21051v1#page=6">Figure 1（完整执行预算）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=8">Figure 2（持续学习）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=10">Figure 3（教师生成量）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=17">Figure 4（学习率）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=23">Figure 5（GRPO 完整曲线）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=24">Figure 6（各游戏曲线）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=25">Figure 7（ColorButton）</a>、<a href="https://arxiv.org/pdf/2607.21051v1#page=29">Figure 8（PPO 完整曲线）</a>。</p><p>Tables：<a href="https://arxiv.org/pdf/2607.21051v1#page=5">1 主结果</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=6">2 单步 / 模拟返回</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=7">3 打包</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=8">4 新题</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=9">5–6 采样方式 / 全词表</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=16">7 教师推理</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=18">8–9 模型参考 / pass@10</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=21">10–11 经验统计</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=26">12 ColorButton</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=31">13–14 八案例与接受数</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=32">15 MapStore2 试错</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=35">16–17 MapStore2 结果 / Billboard 试错</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=38">18 Relay</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=40">19 Auth0</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=42">20 GraphQL Mesh</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=45">21 GitHub CLI</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=48">22 Gauge</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=50">23 Strapi</a>；<a href="https://arxiv.org/pdf/2607.21051v1#page=52">24 八案例行为对比</a>。重要未编号展示包括第 4 页打包公式、第 19–20 页错误输出、第 27–28 页同状态行为比较、第 33 页三组件关系。</p><p>依据 <a href="https://arxiv.org/src/2607.21051v1">v1 TeX</a> 核对公式、聚合和子集。arXiv nonexclusive-distribution 许可未授予通用转载权，来源包未附明确图像许可。<a href="https://github.com/alphaXiv/sample-efficient-learning-from-agent-experience">alphaXiv 第三方项目</a>自称替代环境复现，换用 TextWorldExpress 与 Qwen2.5-0.5B；本文仅核查其 README，不把它的代码或结果当论文原实现。检索核查日期 2026-10-19；公开搜索不是“绝无其他材料”的证明。</p></details>

<p class="source-note">本轮重新阅读 v1 全部 53 页、Appendix A–C 与逐页渲染，核对数值和 TeX。教学条件检查与算术验算不等于模型训练或官方验收复现。个人兴趣程度 8/10，仅表示与博客作者本人兴趣的相关程度。</p>

</div>

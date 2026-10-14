---
title: "[2026-07-23] Sample-Efficient Learning from Agent Experience"
permalink: "/posts/论文解读/sample-efficient-learning-from-agent-experience.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:30:00+08:00"
cover: "/lib/papers/sample-efficient-learning-from-agent-experience/cover.svg"
description: "保留真实试错记录，让看到这些经验的模型重新写下一步决策，训练时不再执行新动作。本文用 MapStore2 修复解释训练样本如何打包、哪些步骤未验证，以及 749 个软件任务和游戏实验的成本与泛化边界。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "Agent Experience"
  - "Context Distillation"
  - "Software Engineering"
  - "Sample Efficiency"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<div class="paper-reading">
<p class="paper-meta">Chenhui Gou, Haoqin Tu, Yunhao Fang, Jianfei Cai, Hamid Rezatofighi · arXiv:2607.21051v1 · 最早公开于 2026-07-23</p>
<div class="source-links"><a href="https://arxiv.org/abs/2607.21051">论文主页</a><a href="https://arxiv.org/pdf/2607.21051v1">论文 PDF</a></div>
<section class="deck-wrap" aria-label="Experience Distillation 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 真实历史怎样变成训练样本</strong><a href="/lib/decks/sample-efficient-learning-from-agent-experience-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/sample-efficient-learning-from-agent-experience-visual-guide.html" title="Experience Distillation 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 切换全屏</span><span>Esc 退出；独立页面可返回文章</span></p></div>
</section>

<p class="lead">修一个软件问题，模型可能已经试过好几次：改文件、运行测试、被拒绝，再换思路。论文希望把这些经验留在模型参数里，同时避免为了训练又把所有新动作执行一遍。它让同一个起点的模型读取完整经验，在历史中的某个位置重新写下一步；这段新决策一到动作就停止，不生成动作之后的环境返回。</p>

<aside class="part0"><span class="kicker">PART 0 · 决策、环境返回与训练目标</span><h3>新写出的动作不等于已经执行过</h3><p>这里一次 <strong>decision</strong> 是一整段模型输出，包含分析和最后的工具动作。执行工具后得到的结果叫 <strong>observation</strong>。论文从真实记录的前文处分叉，只重新生成一次 decision，称为 <strong>one-step branch</strong>。教师和学生从相同的未公开模型出发，额外经验只给教师。教师新写出的 decision 是训练目标，但不执行、不独立验证；学生做任务时仍正常使用工具。</p></aside>

<aside class="keypoints"><h3>先看结论</h3><ul><li>749 个软件任务中，未训练模型 5.3%、直接模仿旧记录 8.0%、新决策蒸馏 <strong>51.4% 单次尝试通过率（pass@1）</strong>；保留经验做任务的参考为 76.4%。</li><li>默认方法训练教师新采样的决策，不在学生当前轨迹上做概率重评，因此<strong>不是通常的 on-policy self-distillation</strong>。</li><li>主实验检验同一批任务的经验能否留在参数里；494 个未见软件任务上的 pass@1 为 4.62% → 8.84%，不能用 51.4% 代表跨任务泛化。</li></ul></aside>

<h2 id="研究问题：如何利用试错之后才得到的证据">1. Motivation：如何利用试错之后才得到的证据</h2>

<p><strong>旧记录同时包含失败做法和后来才发现的正确做法，直接逐步模仿难以利用后来的证据。</strong>模型在第一次尝试时可能不知道某个测试为什么失败；读完后面几次尝试，才知道该查哪份文件、哪些改动需要配合。论文先让教师读完任务的经验，再让它回到旧记录中的某个前文，重新生成一次决策。</p>

<p>保留历史做任务称为 <strong>in-context learning（ICL）</strong>：模型参数不变，只因为看到额外证据而改变行为。这个方案每次都要携带长历史，移除历史就丢失收益。Experience Distillation（下文简称 EPD）的问题是，能否把 ICL 的收益训练进参数，又不重新消耗昂贵的环境执行。</p>

<p>若让教师从头重新完成整题，仍然要运行环境；若用模型预测环境返回，又可能出现假的测试通过、错误道具状态。作者把分支缩到一次决策，在新动作产生后立即停止，因此不需要预测未来 observation。节省的是<strong>新增环境交互</strong>，不是免费生成训练数据。</p>

<h2 id="与旧轨迹微调和-on-policy-蒸馏的区别">2. Related Work：与旧轨迹微调和 on-policy 蒸馏的区别</h2>

<p><strong>关键差别是训练目标从哪里来，以及新动作是否被执行。</strong>直接 SFT 的目标是旧动作；本方法的目标是读完经验后新写的动作。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>模型看什么、训练什么</th><th>新增环境执行</th><th>主要风险</th></tr></thead><tbody><tr><td>旧记录 SFT</td><td>真实旧前文 → 真实旧决策</td><td>不需要</td><td>失败动作也可能被模仿</td></tr><tr><td>经验 ICL</td><td>做任务时保留整题历史，不更新参数</td><td>新尝试需执行</td><td>每次携带长经验</td></tr><tr><td>OPSD / OPCD</td><td>学生当前生成，教师看额外资料重评学生前文</td><td>学生通常需执行</td><td>学生可能采不到有用决策</td></tr><tr><td>model-based rollout</td><td>教师产生动作，模型预测下一环境返回，再继续</td><td>模拟替代真实执行</td><td>错误 observation 累积</td></tr><tr><td>Experience Distillation</td><td>已存前文 → 教师新决策，学生模仿新决策</td><td>蒸馏阶段不需要</td><td>新决策未经执行，前文仍来自旧行为</td></tr></tbody></table></div>

<p>默认 loss 是教师采样 token 的交叉熵，也就是通常的 next-token prediction（NTP）。把教师采样作为期望后，对应教师分布加权的 forward KL，教师熵对学生参数是常数。它不要求保存完整教师词表概率，但也没有把训练前文变成当前学生会访问的状态。</p>

<p>论文 §5 将它放在 context distillation、ICL 和样本高效 RL 三条线上。与 OPCD/PID 最有用的比较不是哪个名字更新，而是：额外资料是否是真实交互经验、模型是否需要重新执行、训练目标是否由学生采样。</p>

<h2 id="方法：经验收集、单步分支与样本打包">3. Method：经验收集、单步分支与样本打包</h2>

<p><strong>先用重复尝试形成整题历史，再从历史中的动作边界生成新的教师目标。</strong>软件任务有 749 道，模型可检查仓库、改文件、运行命令与测试，再接收提交验收反馈。各题启动 8–12 个独立的重复尝试过程，每个最多 10 次 trial。只保留<strong>经过多于一次尝试才得到通过验收的代码提交（accepted commit）</strong> 的过程；若多条满足，均匀随机选一条。</p>

<p>一个过程内的 trial 是顺序的：软件工作区保留前次修改，模型也看到以前历史。独立的是不同过程，不是同一历史里的几次尝试。这个筛选使数据集中于需要反复修订的任务，不能当成所有软件问题的自然分布。</p>

<p>每题选中历史平均 60.5 次交互、82.4K token，最大 140 次、130K token。749 题合计 45,301 次交互、61.7M token；61.7M 是不同题的总量，不是一份模型 context。公开论文没有任务列表、原始历史或验收器，未披露模型名称，软件和游戏还使用不同初始 checkpoint。</p>

<p>游戏用 TaleSuite 的七题池，主实验选 Balances、Detective、Enter、Inhumane、Library、Reverb。每次尝试重置游戏状态，但保留以前经验；六题记录共 47 次 trial、3,672 次交互、502K token。模拟环境消融和持续学习各用另一组固定六/五题，不能把它们直接混成同一对照。</p>

<h3 id="从一条真实记录生成目标">3.1 从一条真实记录生成目标</h3>

<ol><li>先整理整题经验。论文用 g(history) 表示重写、抽象或总结，保留重要反馈、删掉重复内容；没有公开具体 preprocessing prompt。</li><li>选一个真实历史前文，如“刚发现重置状态没刷新查询”。教师看到这个前文、整理后的整题经验和固定的深入推理要求。</li><li>教师生成一次完整分析与动作，动作结束即停止。不运行该动作，不生成其返回。</li><li>学生不看整题额外经验，只看训练前文；loss 仅计算教师新生成的 token。</li></ol>

<figure class="figure"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/branch-packing.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/branch-packing.svg" width="1080" height="650" alt="教师新决策与真实旧动作、旧返回交错打包；只有新决策计算loss，旧返回属于旧动作"></a><figcaption>据 §3.2–3.3、Eq. 2–4 重绘。a′ 是教师新决策，a 是真实旧动作，o 是旧动作的真实返回；a′ 没有被执行。</figcaption></figure>

<h3 id="Branch-packing-为何不是一条新执行轨迹">3.2 Branch packing 为何不是一条新执行轨迹</h3>

<p>给每个动作边界单独生成样本，会反复处理相同的长前文。论文把多个分支放入一个序列，称为 <strong>branch packing</strong>：</p>

<div class="formula">o₀ → a′₀ → a₀ → o₁ → a′₁ → a₁ → o₂ → …<br>只对 a′₀、a′₁… 计算 loss</div>

<p>这里 <strong>o₁ 是旧动作 a₀ 的返回，不是新动作 a′₀ 的返回</strong>。新决策后仍插入旧动作和它真实得到的 observation，让下一个分支有可信的历史依据。论文说明实际有提示标记区分两类动作，公式省略了标记，但没有公开完整模板。</p>

<p>后一个分支的前文也含更早的 a′，因此它不是 Eq. 2 中每个分支完全独立的严格实现，而是 Eq. 4 的实用近似。不能画成“教师动作 → 新环境返回 → 下一个教师动作”，那会把没有运行过的步骤误写成真实轨迹。</p>

<h3 id="贯穿案例：MapStore2-的过滤器为什么清不掉">3.3 贯穿案例：MapStore2 的过滤器为什么清不掉</h3>

<p>这是 Appendix C.3 的真实软件题。用户打开图层的要素表格（feature grid），点选取按钮 marker，在地图上选中一个地理要素（feature）。然后打开并关闭高级过滤面板，最后点 x 清除空间过滤，表格却仍受原过滤条件限制。模型要修代码，让 x 真正清除 geometry 约束并刷新表格。</p>

<figure class="figure"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/mapstore-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/mapstore-real-case.svg" width="1080" height="670" alt="MapStore2点击x后需要发出null重置，query guard保留geometry更新，最后刷新；六次尝试前五失败"></a><figcaption>据 C.3、Tables 15–16 重绘。三步是对成功修复的分析，不是验收器公开的三条独立断言。</figcaption></figure>

<p>面板来回后，状态中仍保存着空间过滤区域（geometry value），但控制器已标为关闭（deactivated）。原点击处理器仍显示 x，却让它不执行任何操作（no-op），首先需要让按钮能发出清除事件。清除要明确写 <code>value: null</code>、<code>deactivated: true</code>；只关闭面板或改变过滤组合不够。</p>

<p>前五次修改均被拒绝：第 1 次改程序取消流程，第 2 次让 x 可点击，第 3 次退出 temporary-change mode，第 4 次组合多个位置，第 5 次在组件端明确发出 null 重置。第 6 次发现，query epic 的初始条件 <code>!!update.value</code> 把 null 更新丢掉了，导致根本没发起新查询。这里的 <strong>epic 是 RxJS 处理动作事件的流水线</strong>，不是模型模块。</p>

<p>成功补丁保留第 5 次的按钮重置，再让 geometry 类型即使 value 为 null 也通过过滤。论文展示的关键 JavaScript 摘录如下；这是原文补丁的一段，不是完整可运行项目，也不是作者公开的 checker：</p>

```javascript
.filter(({update = {}}) =>
  !!update.value || update.type === 'geometry'
)
```

<p>教师的新目标中，第 1 条讲组件端明确 null，第 4 条讲 epic 保留更新，包含成功修复知识；第 2、3 条却重提了之前被否定的改动位置。历史最后一次被验收，不代表<strong>从历史重新生成的每条教师目标都被验收</strong>。</p>

<h2 id="实验：训练内巩固、未见题泛化与预算">4. Experiments：训练内巩固、未见题泛化与预算</h2>

<p><strong>主要实验支持“把已有同题经验留在参数里”，跨新题收益另行测量。</strong>评测时，所有方法从原始仓库和任务开始，不保留收集时的工作区修改。只有 ICL 额外看到本题历史；SFT 和 EPD 都不带历史。软件成绩平均 10 次运行，主表游戏平均 16 次；这些是评测重复次数，不能写成 10/16 个训练 seeds。</p>

<h3 id="补丁与游戏各怎样计分">4.1 补丁与游戏各怎样计分</h3>

<p>软件模型交出补丁，由外部 verifier 接受或拒绝；pass@1 对任务和重复运行取平均。pass@10 是 10 次尝试中至少一次被接受的任务比例，不是十次正确率均值。游戏分数是 <code>100 × 获得积分 / 该游戏最高积分</code>，再对固定游戏集宏平均，43.8 不代表 43.8% 游戏全部通关。</p>

<p>MapStore2 在主训练题中，EPD 测试时从未改的仓库开始且不看六次历史；选中的补丁实现按钮重置、null 传播和查询刷新。十个 EPD/ICL 候选全部被接受，其他三种方法各 0/10。外部验收日志中有一个只检查该事件处理链的局部测试（focused epic test）：禁用的存储 geometry 更新要发出 <code>UPDATE_QUERY</code>，reason 为 <code>geometry</code>。</p>

<p>选中的 EPD 候选未能在本地环境完成整套浏览器测试。因此这是外部验收及补丁行为证据，不是“完整 GUI 操作已在本地重放通过”。它也是训练内任务的巩固案例，不是未见任务的泛化案例。</p>

<div class="table-scroll"><table><thead><tr><th>Table 1</th><th>749 软件题 pass@1</th><th>六游戏平均归一化分</th><th>软件 / 游戏 ICL 增益保留率</th></tr></thead><tbody><tr><td>未训练模型</td><td>5.3%</td><td>18.5</td><td>0 / 0</td></tr><tr><td>ICL 参考</td><td>76.4%</td><td>45.6</td><td>100 / 100</td></tr><tr><td>SFT</td><td>8.0%</td><td>17.8</td><td>3.8 / −2.6</td></tr><tr><td>Experience Distillation</td><td><strong>51.4%</strong></td><td><strong>43.8</strong></td><td>64.8 / 93.4</td></tr></tbody></table></div>

<p><strong>ICL-normalized gain</strong> 衡量某方法获得了多少 ICL 相对未训练模型的提升：<code>G = (S_method − S_zero) / (S_ICL − S_zero) × 100%</code>。例如软件 <code>(51.4−5.3)/(76.4−5.3)=64.84%</code>。这是提升比例，不是正确率；可为负，也可超过 100，因为 ICL 不是绝对上限。</p>

<p>主表先跨任务平均再算 G；部分消融则先算每题 G 再平均。因此同样游戏均分 43.8，Table 1 的 G=93.4%、Table 3 的平均 G=90.1% 并不冲突，聚合顺序不同。软件 pass@10 中，未训练 31.9%、SFT 39.8%、EPD 80.9%、ICL 86.4%。</p>

<figure class="figure"><a href="/lib/papers/sample-efficient-learning-from-agent-experience/results-and-budget.svg" target="_blank" rel="noopener"><img src="/lib/papers/sample-efficient-learning-from-agent-experience/results-and-budget.svg" width="1080" height="650" alt="软件训练内51.4%，OOD8.84%，环境trial成本不含教师生成，最大额外生成约172Mtoken"></a><figcaption>据 Table 1、4、Figure 1、3 重绘。分开看训练内巩固、未见题泛化和完整成本；避免一组高分回答所有问题。</figcaption></figure>

<h3 id="最能检验机制的对照">4.2 最能检验机制的对照</h3>

<p>one-step 与含模拟 observation 的 two-step 分支在五个游戏平均 49.8 对 40.1，G 为 83.8% 对 57.3%。但 Acorncourt 反过来，two-step 53.6 高于 one-step 34.9，不能说每题都受益。Detective 的模拟长路径还出现“dance 不可执行却获得 10 reward”的假返回；这解释了风险，却不代表所有 world model 都不可用。</p>

<p>branch packing 把 4,096 个独立样本变成 128 个序列，训练步数 768 → 64，教师生成加学生训练的合计时间超过 10 倍改善，均分 43.1 → 43.8。但 Inhumane 由 41.5 降到 36.6；打包提高效率，不保证每题提升。</p>

<p>单题、匹配计算量的 Balances/Detective 实验中，教师采样方法 G=96.7/98.4，学生采样 reverse KL 为 9.1/0.4。两题现象支持学生采不到重要动作的解释，不能推出“OPD 普遍失败”。比较完整教师分布与 NTP 时，游戏均分 43.4 对 43.1、平均 G 82.0 对 84.2，也没有清晰的全分布优势。</p>

<p>“增加教师推理”在附录把 Detective 50.7 升到 71.8，但用的是早期三步分支版本，不是默认 one-step 的单变量消融。持续学习每轮清空旧历史，从上一轮参数出发，每题收集四次尝试；五轮后六题均分 7.1 → 47.0，总计每题 20 个 trials，任务子集与主表不同。</p>

<h3 id="9-6×-少的是什么">4.3 × 少的是什么</h3>

<p>一次 environment sample 指完整 trial，不是一个工具调用。软件预算包含筛选选中历史所花的全部探索，非只算最后成功那条。PPO 最好/最终观察成绩为 17.74，完整预算平均每题 504.9 trials；ICL+EPD 是 51.4，并以 9.6× 更少 trials 获得这一成绩。</p>

<p>游戏 GRPO 最好成绩 29.9 出现在第 16 次更新、240 samples，完整运行到 448 samples 后为 26.0。Figure 1 把<strong>最好成绩与完整运行预算配对</strong>，相对 EPD 报 57.2×；这不是刚到同等成绩时的最小成本比较。预算也没有把较少环境 trials 自动换算为墙钟时间。</p>

<p>教师生成并不便宜：在固定 61.7M 经验 token 上，把每次 trial 的打包序列由 1 加到 16，生成量从经验的 0.17× 加到 2.79×，G 从 31.8% 到 64.8%。最大约 <strong>172M 额外生成 token</strong>，没有新增环境执行，仍有模型计算成本。</p>

<h3 id="跨未见软件题提升多大">4.4 跨未见软件题提升多大</h3>

<p>494 个新题被排除在收集和蒸馏之外，包括未见仓库/任务类型 278 题，以及旧仓库里的新任务类型 216 题。总 pass@1 为 4.62% → 8.84%，pass@5 为 20.39% → 26.13%；两子集 pass@1 分别 4.72→8.87、4.49→8.80。它表明知识可以转移，但绝对水平远低于训练内 51.4%。</p>

<h2 id="下一步：核验新目标和打包前文">5. Discussion：核验新目标和打包前文</h2>

<p><strong>优先核验新目标质量和前文错位，而不是只增加教师生成量。</strong>MapStore2 已经展示新目标会重提失败假设。可以用保留的真实证据检查每个新决策是否受支持，再用少量新增执行检验这类筛选是否值得；这种执行成本要单独计入，不能仍声称训练完全不新增交互。</p>

<p>第二个重点是打包前文。学生看见此前教师决策，却接着看到旧动作的返回，实际部署不会自然产生这种交错。需要同资料、同计算量比较独立分支、打包分支、只含真实前文的目标，以及少量学生执行校准，观察收益和不一致风险。</p>

<p>如果环境运行昂贵，这条路线值得做。但更有意义的指标是：在固定总环境预算和总生成 token 下，训练内巩固与独立测试集分别提升多少。仅拿高 ICL 分作为参考，没有解决新任务探索问题。</p>

<h2 id="结论与复现边界">6. Conclusion：结论与复现边界</h2>

<p><strong>它给出一种具体的样本复用算法，证据集中于未公开模型的特定任务集。</strong>方法把真实旧 observation 与教师新决策分开，避免预测下一环境返回；打包让长历史的训练密度更高。算法链条清楚，结果也包含独立新题与失败案例，不应只读主表高分。</p>

<p>复现仍缺模型、749 题列表、试错记录、preprocessing prompt、完整优化设置、官方代码和外部 verifier。八个软件案例特意选择方法差异明显的任务：ICL 79/80、EPD 72/79 个有效候选被接受，不代表总体软件题成功率。Auth0 少一个有效样本，不能把分母强写成 80。</p>

<p>附录其他案例也说明“学到经验”不是逐行复制：Relay 区分缓存保留与活跃引用；GraphQL Mesh 同时修改 schema-time 检查和配置界面；Strapi 教师修正了已被接受补丁中的弱化 URL 验证。它们支持多处修改可以协调，却没有公开全部输入与验收包，无法独立复跑。</p>

<p>ColorButton 的探索诊断将 18 种按钮序列与稀疏奖励联系起来，示例还同时改变目标序列和组大小，不是只改变一个变量的对照。全组零奖励意味着结果优势项为零，不表示包括 KL 等辅助项在内的所有梯度都为零。</p>

<p>个人兴趣程度 8/10，仅代表博客作者本人的兴趣。最值得保留的边界是：<strong>不新增环境交互，不等于新训练动作已验证，也不等于没有新增计算成本</strong>。</p>

<p class="source-note">本文核查 v1 全部 53 页，包括 Appendix A–C、8 幅 Figure 和 24 张 Table。案例与数值来自论文；正文图为事实重绘，不复制原版排版。补丁摘录只说明论文展示的修改，不代表公开完整项目或本文独立运行过验收器。</p>
</div>

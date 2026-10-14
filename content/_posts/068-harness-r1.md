---
title: "[2026-08-03] Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories"
permalink: "/posts/论文解读/harness-r1.html"
date: "2026-10-08T00:02:00+08:00"
updated: "2026-10-14T12:00:00+08:00"
cover: "/lib/papers/harness-r1/cover.svg"
description: "Harness-R1 训练一个 9B 模型读取失败记录、修改 Agent 的运行程序，再用实际重跑的成绩变化奖励补丁。重点是四个可修改位置、训练奖励与最终成功率的区别，以及补丁对未见任务是否仍有效。"
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
  - "Agent Learning"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">

<div class="paper-reading">

<p class="paper-meta">arXiv:2608.02276v1 · 最早公开于 2026-08-03</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.02276">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.02276">论文 PDF</a>
  <a href="https://github.com/DeepExperience/Harness-R1">官方代码</a>
  <a href="https://huggingface.co/ShaoShuai0605/Harness-R1">模型</a>
</div>

<section class="deck-wrap" aria-label="Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories 交互图解">
  <div class="deck-head"><strong>10 页交互图解 · 任务、机制、真实案例、结果与边界</strong><a href="/lib/decks/harness-r1-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/harness-r1-visual-guide.html" title="Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories 论文图解，共 10 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>按 Esc 退出全屏；独立打开后可返回文章</span></p>
  </div>
</section>

<p class="lead">Harness-R1 训练一个 9B 模型专门修 Agent 的运行程序。它读取失败记录，修改组装提示、转发动作和处理环境反馈的代码，再让原 Agent 重做任务。训练奖励来自重跑前后的环境得分差；负责做任务的模型不更新，更新的是负责写补丁的模型。</p>

<aside class="part0"><span class="kicker">PART 0 · 先分清训练对象</span><h3>做任务的模型与写补丁的模型</h3><p>负责购物、家务操作和数据库任务的系统称为 <strong>target agent</strong>；训练工程师及测试补丁时，它的模型参数冻结。另一个 9B 模型称为 <strong>harness engineer</strong>，只负责修改 target agent 外面的运行代码。下文的“补丁有效”要看原 Agent 在装上补丁后怎么行动，不能只看补丁能否运行。</p></aside>
<div class="interest"><b>博客作者兴趣度 9.1 / 10</b><span>评分只表示博客作者本人对“写、修、演化 harness code”这条研究线的阅读兴趣，不是论文质量评级</span></div>
<div class="metrics" aria-label="论文关键数字">
  <div class="metric"><strong>9B</strong><span>专门的 harness engineer</span></div>
  <div class="metric"><strong>44.3 → 53.6%</strong><span>未微调任务模型的三环境平均成功率</span></div>
  <div class="metric"><strong>877</strong><span>监督训练用的示范补丁</span></div>
  <div class="metric"><strong>+8.9 ± 1.5</strong><span>未见任务提升的百分点；± 为三组证据种子的标准差</span></div>
</div>
<aside class="keypoints"><h3>先记住</h3><ul><li>训练对象是一个 9B harness engineer；负责执行 WebShop、ALFWorld 和 DBBench 的 target agent 始终冻结。</li><li>工程师写出的代码补丁必须能安装并完成重跑。无效、没有改动或中途运行失败的补丁都得到 0 奖励。</li><li>主要奖励来自提供失败记录的同一批任务，可能鼓励只对眼前任务有效的修补。</li><li>较可信的泛化结果来自 1,270 个未见任务：平均提升 8.9±1.5 个百分点。</li></ul></aside>

<h2 id="1-研究问题：怎样从失败中学会修补运行程序">1. Motivation：怎样从失败中学会修补运行程序</h2>

<p><strong>论文训练模型完成“读失败记录、改运行代码、重跑验证”这件事。</strong>直接请一个强模型写补丁，有时能修好，也会把原来能完成的题改坏；固定规则又很难处理新出现的失败。Harness-R1 用单独的 Qwen3.5-9B 学习：当前失败是否可以靠外部代码修正，以及应在动作发出前还是环境反馈后介入。</p>
<p>例如购物模型已经找对商品，却漏选颜色就点击购买。再次让模型思考整道题未必比在购买前检查“必需选项是否选好”更有效。反过来，把所有动作都按一个粗糙的任务阶段重写，也会破坏原本正确的决策。论文要训练工程师学会何时干预、干预到什么程度；补丁是否可执行只是最低要求，真正的训练信号来自安装后的任务结果。</p>

<h2 id="2-相关工作：搜索补丁、诊断补丁与训练工程师">2. Related Work：搜索补丁、诊断补丁与训练工程师</h2>

<p><strong>它训练专门的补丁模型，用安装补丁后真实重跑的环境奖励差更新模型。</strong>Self-Harness 用同一个冻结模型提出并筛选自己的修改；HarnessFix 先把失败步骤对应到代码，再限定修复范围；直接监督微调（SFT）任务模型则更新做题模型本身。Harness-R1 保持做题模型不变，只训练另一个模型编辑四个预留调用位置。</p><p>所以主结果衡量的是“工程师修改运行程序后，冻结的任务模型提高多少”。任务模型先经过 SFT 后，另行训练的工程师还能继续提高分数，说明任务模型训练与外部程序修补可以叠加。WebShop 的训练奖励是连续匹配分，不能把它等同于最终完整任务成功率。</p>
<div class="table-scroll"><table><thead><tr><th>相邻方法</th><th>谁提出修改</th><th>反馈实际更新什么</th><th>与本文的差别</th></tr></thead><tbody><tr><td>Meta-Harness / AHE</td><td>固定的 coding agent</td><td>候选程序、选择结果与历史记录</td><td>不靠补丁收益更新提出者的模型权重</td></tr><tr><td>Self-Harness / HarnessFix</td><td>固定模型提出或诊断局部修复</td><td>通过测试筛选、接受补丁</td><td>学到的产物主要是运行程序，编辑策略本身没有在线训练</td></tr><tr><td>HarnessX</td><td>符号化修改与组合组件</td><td>跨 harness 的 GRPO 更新做任务的模型</td><td>训练对象不同</td></tr><tr><td>Harness-R1</td><td>独立 9B engineer</td><td>同批任务重跑的奖励差更新 engineer</td><td>但编辑空间是四类预留 hooks，不是任意代码库维护</td></tr></tbody></table></div>

<h2 id="3-方法：一包失败记录怎样变成一次训练更新">3. Method：一包失败记录怎样变成一次训练更新</h2>

<p><strong>工程师只读失败题，但补丁必须在原来整批题上重跑，包括原本成功的题。</strong>系统先缓存 target agent 的原始运行和得分，用确定性提取程序留下失败题的要求、关键动作、反馈、结果及必要环境状态。这包证据称为 <strong>failure packet</strong>；提示词另外说明 hook 接口、可读取字段与限制。它没有人工逐步标注的正确解，也不是工程师自己玩出的新轨迹；公开构造程序拼接的是接口说明与失败记录，不能据此说它附上了完整 Agent 仓库源码。</p>

<div class="table-scroll"><table><thead><tr><th>可修改位置</th><th>何时调用</th><th>允许改变什么</th></tr></thead><tbody><tr><td><code>on_init</code></td><td>原 Agent 第一次决策前</td><td>加入可复用的任务指导或工具提示</td></tr><tr><td><code>make_pre_hint</code></td><td>每次模型决策前</td><td>根据当前状态补一条提示，不执行环境动作</td></tr><tr><td><code>on_before_action</code></td><td>模型提出动作之后、环境执行之前</td><td>拦截并要求重选；接口支持时可改写动作</td></tr><tr><td><code>on_post_step</code></td><td>环境反馈回来之后</td><td>更新运行记录、加入恢复提示；接口支持时安排下一动作</td></tr></tbody></table></div>

<p>这些由运行程序预留的调用位置称为 <strong>hooks</strong>。工程师一次性输出补丁后就退出，不参加后续购物或 SQL 操作；宿主程序解释补丁的返回值。DBBench v1 只接受提示与拦截，不允许补丁直接改写 SQL 或强制提交数据库操作（论文 Appendix C）。动作发出前检查条件、必要时拦截的这段代码称为 <strong>guard</strong>，例如必须选好颜色后才允许购买。</p>
<p>补丁是 <code>&lt;patch&gt;</code> 内的 JSON，含 <code>benchmark</code>、<code>description</code> 和 <code>actions</code>。每个 action 指定 <code>add_code_hook</code>、调用位置和定义 <code>hook(ctx, nb)</code> 的 Python 代码：<code>ctx</code> 是宿主提供的当前动作、状态与任务要求，<code>nb</code> 用来保存本次任务的阶段记录。一个补丁可以在这批任务内复用，但论文没有跨批次持续累积补丁，也不在同一 editing instance 里反复修改到通过为止。</p>
<p>训练的“在线”指当前 engineer 会采样新的候选，再真实执行它们；原始基线轨迹、奖励和 failure packet 在训练前已缓存。不能把 Algorithm 1 读成每次更新都重新收集一批未经修补的基线轨迹。</p>

<ol class="steps"><li><b>冷启动</b><span>先用 877 个经过安装和重跑筛选的示范补丁做 SFT：WebShop 381、ALFWorld 248、DBBench 248。示范由强模型提出，筛选要求补丁可执行、评测完整且不退化。</span></li><li><b>采样</b><span>在线训练对同一个 failure packet 生成 8 个候选补丁，分别安装到隔离的重跑中。</span></li><li><b>重跑</b><span>原 Agent 在每个候选下重新执行完整 batch；无效、没有实际干预或评测不完整的候选记 0。</span></li><li><b>更新</b><span>比较 8 个候选的得分差，将组内相对好坏交给 GRPO，只更新写补丁的 engineer。</span></li></ol>

<div class="formula">Δ<sub>B</sub>(P) = (1/n) Σ<sub>i=1…n</sub>(R<sub>i</sub><sup>P</sup> − R<sub>i</sub><sup>0</sup>)<br>r(B,P) = Δ<sub>B</sub>(P)，若补丁有效且评测完整；否则为 0</div>

<p><code>n</code> 是整批任务数，<code>R⁰</code> 与 <code>Rᴾ</code> 是同一道题修补前后的环境奖励。<strong>WebShop 使用连续的商品匹配分，ALFWorld 与 DBBench 使用二元成功分。</strong>有效补丁若造成退化，可以得到负奖励；“格式正确”本身没有奖金。GRPO 再用 <code>(r−组内均值)/组内标准差</code> 得到候选优势，同一补丁的输出 token 共用该优势。</p>
<p>实现对 token 的新旧策略概率比使用非对称裁剪：<code>ε_lower=0.20</code>、<code>ε_upper=0.28</code>，对应裁剪区间 <code>[1−0.20, 1+0.28]=[0.80, 1.28]</code>，不是把概率比裁到 0.20 与 0.28 之间。训练引擎与采样引擎的旧策略概率可能不同，所以另有截断重要性权重，最大为 2。没有显式 KL 或熵奖励。冷启动用 GPT-5.5 生成并筛选的 877 例训练两轮；在线训练用约 1,500 个 failure packets。工程师 SFT、工程师 GRPO 与另行比较的任务模型 SFT 各使用一节点 8 张 H800；前两项才是 Harness-R1 的两阶段训练。</p>
<div class="table-scroll"><table><thead><tr><th>任务</th><th>SFT 任务池</th><th>RL 任务池</th><th>验证 / 测试</th><th>需要注意</th></tr></thead><tbody><tr><td>WebShop</td><td>5,290</td><td>5,190</td><td>100 / 500</td><td>测试索引 0–499；前后重跑固定 goal seed 233</td></tr><tr><td>ALFWorld</td><td>1,380</td><td>1,280</td><td>99 / 500</td><td>测试由 109 个 new_std 加 391 个 train_valid 分层样本组成</td></tr><tr><td>DBBench</td><td>2,401</td><td>2,302</td><td>100 / 300</td><td>300 个单独标准测试任务</td></tr></tbody></table></div>
<p>这些是 Appendix D 的独立任务数，分区先于轨迹与补丁生成；SFT/RL 任务不重叠。过滤与组装以后才得到 877 个示范补丁和约 1,500 个 failure packets，不能把记录数量当作任务池大小。</p>

<p>这个奖励直接针对产生 failure packet 的同一 batch 优化，论文称为 <strong>transductive objective</strong>：模型可以利用这一批已发生的失败，训练目标没有单独要求另一批题也提高，也没有惩罚额外推理成本。</p>

<figure class="figure wide"><a href="/lib/papers/harness-r1/body-method.svg" target="_blank" rel="noopener"><img src="/lib/papers/harness-r1/body-method.svg" width="1050" height="1022" alt="Harness-R1 失败包、八个候选补丁、同批重跑及模型更新流程" loading="lazy" decoding="async"></a><figcaption>根据 Figure 2 与 Algorithm 1 重绘。工程师只写补丁；冻结的任务模型在完整批次重跑，环境奖励差用于更新工程师。</figcaption></figure>

<h2 id="4-实验：购物案例、评分分母与未见任务迁移">4. Experiments：购物案例、评分分母与未见任务迁移</h2>

<p><strong>训练奖励与主榜成功率不是同一个指标。</strong>主榜分别在 WebShop 500 题、ALFWorld 500 题、DBBench 300 题上算任务成功率，再对三项成功率等权平均；不是把 1,300 题混成一个平均值。WebShop 另外报告连续 Score。以原系统为例，<code>(31.2+40.6+61.0)/3≈44.3%</code>（Table 1）。Reflection 行允许两次尝试，其他行是单次成功率，不能直接按同预算排名。</p>

<figure class="figure wide"><a href="/lib/papers/harness-r1/body-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/harness-r1/body-case.svg" width="1050" height="781" alt="WebShop batch 008：漏选 black brown 被拦截，单题奖励与批次奖励不同" loading="lazy" decoding="async"></a><figcaption>根据 Appendix H.1 与 Table H.1 重绘。单题 0.667→1.0；十题连续奖励均值 0.682→0.768，所以训练奖励为 0.086，不能换成成功率差 0.3。</figcaption></figure>

<div class="case"><h3>真实 WebShop 案例：先选颜色，再允许购买</h3><ol><li><strong>初始任务：</strong>购买价格低于 40 美元的 synthetic hairpiece（人造发片），颜色必须选择页面上的 <code>black brown</code>（黑棕色）选项。</li><li><strong>原始轨迹：</strong>target agent 找到合适商品，却没有选择颜色就执行 <code>Buy Now</code>（立即购买）；环境只给 0.667 的部分奖励。</li><li><strong>补丁：</strong>harness engineer 在 <code>on_before_action</code> 安装前述 guard。只要价格超预算，或任务要求的商品选项尚未选择，它就拦截购买动作。</li><li><strong>重跑：</strong>target agent 再次尝试提前购买，guard 返回提示；Agent 随后选择 black brown，再购买。</li><li><strong>结果：</strong>同一道题从 0.667 变成 1.0；同一十题批次的完整成功数从 2/10 增至 5/10，原先已成功的两题没有退化。</li></ol></div>

<p>这是论文 Appendix H.1 的 WebShop batch 008。连续奖励的批均值实际由 0.682 到 0.768，因此该补丁的训练奖励是 <code>0.768−0.682=0.086</code>，不是完整成功率差 <code>5/10−2/10=0.3</code>。公开记录足以复核这一计算，但没有给出十题所有商品属性和 WebShop scorer 的逐属性分解，不能把 0.667 擅自解释成“恰好通过三条要求中的两条”。</p>

<p>ALFWorld 的补丁记录任务进行到哪一步、给出下一步提示，并阻止把物体放到错误位置。十题批次从 1/10 提到 6/10：它修好六条失败，同时让唯一一条原本成功的任务退化，净增加五条成功。Gemini 的另一组补丁则把 ALFWorld 从 41.6% 降到 35.4%；最差批次 7/10→0/10，原因是过早强制放置第一个物体，破坏了需要收集两个物体的正确行为。</p>
<p>DBBench batch 022 更能说明谁在执行。任务要求修改 <code>Race Schedule</code> 表中 <code>Moosehead Grand Prix</code> 的长度。原 Agent 已看到旧值 <code>3 Hours</code>，却写 <code>4 hours</code>；GLM-5.2 的有效补丁也没有避免这个错误。Harness-R1 的 hook 先提醒恢复表结构、检查当前行，再由<strong>冻结的 target agent 生成 SQL</strong>，写成大小写一致的 <code>4 Hours</code>，核对后提交。论文的精确格式判分把前两者记失败、后者记成功；批次分别是 4/10、5/10、6/10。这里没有发布这条完整 SQL checker 的逐步重放，不能补写成 hook 直接修改数据库。</p>
<p>下面是本文写的 Python 3 简化示意，说明宿主如何使用购买前 hook 的返回值；不是 batch 008 原补丁。真实公开的购买拦截见 <a href="https://github.com/DeepExperience/Harness-R1/blob/94f2e087f573e1b82fc9568bb634d4ae9a887e28/examples/heldout_generalization/harness-r1/seed20260720/webshop.json">held-out seed 20260720 的补丁</a>，它属于另一组实验，只检查未选选项，不含 batch 008 所述的超预算条件。</p>
<div class="code-scroll"><pre><code>def hook(ctx, nb):
    action = ctx["action"]
    if action["tool"] != "click_action":
        return None
    if action["value_normalized"] != "buy now":
        return None
    if not ctx["predicates"]["required_options_unselected"]:
        return None
    return {
        "kind": "block_and_prompt",
        "message": "Select the requested visible option before buying."
    }</code></pre></div>
<p><code>required_options_unselected</code> 是宿主对当前页面和任务要求检查后的布尔值；为真时，宿主取消这次购买，把 message 交给 target 重新决策。工程师不直接选择某个商品，也不直接完成购买。这个示意只展示返回效果，没有运行整个 WebShop 环境或证明某条新轨迹会成功。</p>

<h3 id="主结果与稀疏失败迁移：用的是两种平均方式">4.1 主结果与稀疏失败迁移：用的是两种平均方式</h3>

<p><strong>在三个训练环境上，vanilla Qwen3.5-9B 从 44.3% 提到 53.6%，增加 9.3 个百分点；target 先 SFT 后再修 harness，则从 59.2% 到 64.2%。</strong>监督训练工程师为 46.4%，最强一次性编辑器 GLM-5.2 为 48.8%。但 target 先 SFT 后，WebShop 连续 Score 从 71.5 降到 68.7，说明“平均成功率提高”不等于所有指标都提高。</p>
<p>20 个未参与训练的 target 配置各提供自己的失败记录，工程师重新生成补丁，不是迁移一个固定补丁。各模型的三环境平均增益都为正，平均提升 7.06 个百分点；包含训练 target 的 21×3 个配对中有 56 个改善、4 个不变、3 个下降。</p>
<p>未见任务实验采用另一种平均：每个环境只给相同的 10 条失败，生成一份环境专用补丁，评测其余 <code>490+490+290=1270</code> 题，按<strong>题数合并</strong>计算增益，不再三环境等权。三个证据种子的成功数分别为 <code>550→656</code>、<code>550→685</code>、<code>549→648</code>，所以 <code>(106+135+99)/3/1270×100≈8.92</code> 个百分点；±1.50 是三个种子增益的样本标准差，不是逐题标准误。</p>
<p>公开 seed 20260720 中，ALFWorld 修好 102 条失败、改坏 59 条旧成功，净增加 43/490。这个结果支持平均迁移收益，不能说补丁保住了每一条旧能力。相同协议的 Qwen3.5-397B 与 DeepSeek-V4-Pro 平均变化分别为 −4.3±2.5、−0.4±3.6 个百分点。</p>

<p>固定补丁、分别关闭某个调用位置的消融中，移除动作前检查的平均成功率下降 3.9 个百分点，移除环境反馈后的状态记录与恢复提示下降 3.3 个百分点；不同环境的下降幅度并不一致，不能把它们相加成固定的组件排名。</p>

<figure class="figure wide"><a href="/lib/papers/harness-r1/body-results.svg" target="_blank" rel="noopener"><img src="/lib/papers/harness-r1/body-results.svg" width="1050" height="762" alt="Harness-R1 主结果、跨模型迁移和稀疏失败任务结果的不同分母" loading="lazy" decoding="async"></a><figcaption>根据 Table 1、Figure 4 与 Appendix E 重绘。主结果是三个环境的成功率等权平均；更换任务模型时重新生成补丁，不是把同一个固定补丁直接迁移。</figcaption></figure>

<h2 id="5-后续问题：补丁能否保住未见任务和运行成本">5. Discussion：补丁能否保住未见任务和运行成本</h2>

<p><strong>最需要补的对照，是同一补丁在另一批任务上的得分与代价。</strong>现在的在线奖励可以发现局部有效的修改，却没有区分“修好了通用行为”与“适配了眼前十题”。可在奖励里加入未参与失败提取的回归集，并报告额外模型调用、动作数和运行时间；这样才知道工程师是否靠反复提示换分。已有迁移测试仍沿用相同 hook 接口，不能代表能维护任意 Agent 代码库。</p><p>官方仓库固定到 <code>94f2e087f573e1b82fc9568bb634d4ae9a887e28</code>，模型权重也已公开。复现时还要固定上游环境、任务 split 与补丁接口，不能只复用一个模型文件。</p>

<h2 id="6-小结：学到的是外部干预，不是任务模型的新权重">6. Conclusion：学到的是外部干预，不是任务模型的新权重</h2>

<p><strong>Harness-R1 把可执行补丁的实际后果变成工程师模型的训练信号。</strong>证据表明专门化工程师比通用模型一次性编辑更稳定；但同批奖励仍可能鼓励局部修补，尚不能证明它学会了普遍的软件维护能力。</p><div class="limit-grid"><div><b>可复用设计</b><span>无效、无改动补丁归零；任务模型冻结，奖励来自真实重跑。</span></div><div><b>主要限制</b><span>训练主要针对提供失败记录的同一批任务。</span></div><div><b>可靠结果</b><span>未见任务增益报告了三组证据种子的标准差。</span></div><div><b>适合读者</b><span>研究运行程序修补与模型、程序共同改进的读者。</span></div></div>

<p class="source-note">主要来源：论文全文与附录、arXiv v1 元数据；代码或项目页于 2026-10-08 核验。固定来源状态：94f2e087f573e1b82fc9568bb634d4ae9a887e28。</p>

</div>

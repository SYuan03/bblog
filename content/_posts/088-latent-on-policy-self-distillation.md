---
title: "[2026-08-13] Latent On-Policy Self-Distillation"
permalink: "/posts/论文解读/latent-on-policy-self-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-13T18:30:00+08:00"
cover: "/lib/papers/latent-on-policy-self-distillation/cover.svg"
description: "把过去成功任务的记录压成连续向量，只在训练时交给教师。LOPD 同时训练学生和经验压缩模块，靠结果奖励防止教师越学越弱。本文用真实工具任务解释数据、梯度、评测与代码差异。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 12
categories:
  - "论文解读"
tags:
  - "Latent Context"
  - "On-Policy Distillation"
  - "Experience Retrieval"
  - "Code Generation"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<div class="paper-reading">
<p class="paper-meta">Guibin Zhang, Jiayang Lyu, Ran Sun, Xinlei Yu, Haoyu Zhao, Qibing Ren, Shuicheng Yan · arXiv:2608.13040v1 · 最早公开于 2026-08-13</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.13040">论文主页</a><a href="https://arxiv.org/pdf/2608.13040v1">论文 PDF</a><a href="https://github.com/bingreeky/LOPD/tree/50c3d7f53f8b062153f23f3f9b56e949c888e071">核查版本的官方代码</a></div>
<section class="deck-wrap" aria-label="LOPD 交互图解">
  <div class="deck-head"><strong>12 页交互图解 · 经验怎样变成训练信号</strong><a href="/lib/decks/latent-on-policy-self-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/latent-on-policy-self-distillation-visual-guide.html" title="LOPD 论文图解，共 12 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 切换全屏</span><span>Esc 退出；独立页面可返回文章</span></p></div>
</section>

<p class="lead">过去的成功记录很长，直接塞给模型未必有用：别人的操作顺序可能不适合当前状态，有些细节还会让模型误以为任务已经做完。LOPD 训练一个模块，把相关记录压成少量连续向量，再让同一起点的教师模型用它们指导学生。训练结束后只保留学生，做任务时仍然可以调用工具，但不再读取这批训练用经验。</p>

<aside class="part0"><span class="kicker">PART 0 · 先区分三个对象</span><h3>执行任务的是学生，额外经验只给教师</h3><p>学生先根据任务和真实交互历史写下一步操作，完整执行记录叫 <strong>rollout</strong>。普通 token 是模型预测的文字单位。教师读取相同的前文，给学生已经写出的每个位置重新计算“下一 token 的概率”；教师额外看到的资料叫 <strong>privileged context</strong>，只在训练时提供。LOPD 不把资料写成普通提示词，而是生成可训练的输入向量，称为 <strong>latent tokens</strong>。每个 latent token 是一个向量位置，不是一段可读词语；不要与前面用于生成文字的 token 混淆。</p></aside>

<aside class="keypoints"><h3>先看结论</h3><ul><li>默认检索 3 条成功记录，每条压成 32 个向量；<strong>教师主模型固定，学生与压缩模块更新</strong>。</li><li>Qwen3-4B 的 EnvScaler 平均完成奖励从 48.6 升到 63.7；但联合训练设 m=0 时，反而不如固定压缩模块。</li><li>论文与公开代码的主流程一致，检索索引构造、损失归一化和分阶段更新仍有差别；经验库、压缩模块权重和完整实验日志没有随该代码版本发布。</li></ul></aside>

<h2 id="研究问题：成功经验该怎样表示">1. Motivation：成功经验该怎样表示</h2>

<p><strong>LOPD 要解决的是：如何从成功记录中提取适合监督当前学生的信息。</strong>现有方法常把完整答案、成功路径或文字总结交给教师。这些资料的内容由人或固定规则决定，而学生未必走同一条路径。即使资料完全正确，教师也可能偏好照抄参考步骤，而非继续学生已经到达的状态。</p>

<p>LOPD 把“保留哪些信息”交给可训练的压缩模块。教师看这些向量后的概率分布既训练学生，也反过来训练压缩模块。它的主要贡献是这条训练关系和防退化约束；论文明确说，并不把某种新 attention 结构当作贡献。</p>

<p>这也带来新的问题：如果两个概率分布越接近，蒸馏损失越小，压缩模块可以把教师变弱，让它迎合学生。此时 loss 降了，学生却没有获得更好的指导。论文最关键的消融就是检验这个问题，而不是单纯展示向量比文字短。</p>

<h2 id="与文字蒸馏和部署用记忆的区别">2. Related Work：与文字蒸馏和部署用记忆的区别</h2>

<p><strong>差别在于教师额外输入的产生方式，以及谁能被训练。</strong>下面按本文实验中的实现比较；各方法在其他论文中的默认配置可能不同。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>教师多看到什么</th><th>教师怎样更新</th><th>训练信号</th></tr></thead><tbody><tr><td>OPSD</td><td>同题经过验证的参考路径</td><td>固定初始模型</td><td>全词表 forward KL</td></tr><tr><td>SDFT</td><td>成功示范的文字版本</td><td>学生参数的缓慢移动平均，更新率 0.01</td><td>全词表 forward KL</td></tr><tr><td>SDPO</td><td>同一步采样的 4 条学生路径中成功的那条</td><td>移动平均，更新率 0.05</td><td>top-K 加剩余概率的 reverse KL</td></tr><tr><td>Skill-SD</td><td>从经验总结出的“有效做法、失败做法、建议流程”</td><td>遵循其原实现</td><td>结果奖励加采样 token 蒸馏</td></tr><tr><td>LOPD</td><td>检索记录经训练后压成的连续向量</td><td>主模型固定，经验压缩模块可训练</td><td>reverse KL、结果约束和向量锚定</td></tr></tbody></table></div>

<p>forward KL 把教师分布作为期望权重；reverse KL 把学生分布作为期望权重。这里不需要先记住名字，只要知道 LOPD 在学生实际写出的前文上比较两个完整的下一词分布，而不是只奖励最后成功的那一个 token。</p>

<p>另一条相关路线是 <strong>latent memory</strong>：把历史信息保存在连续向量里，做任务时仍读取这些向量。LOPD 的向量只在训练时交给教师。部署学生时移除经验库、检索模型和压缩模块，并不移除任务本来需要的 API 工具。</p>

<h2 id="方法：经验压缩、参数更新与防退化约束">3. Method：经验压缩、参数更新与防退化约束</h2>

<p><strong>学生先真实执行，教师再用压缩后的成功经验重评同一条记录。</strong>先看论文 Figure 6 的真实工具任务 <code>env_174_rl-task_29</code>：添加一份健康保险方案，修改牙科方案，再为多位员工变更选择或撤回申请。教师检索到的另一条任务也包含“查询当前登记期、添加方案、修改方案、切换选择、撤回”的操作顺序。</p>

<figure class="figure"><a href="/lib/papers/latent-on-policy-self-distillation/experience-to-teacher.svg" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/experience-to-teacher.svg" width="1080" height="670" alt="学生实际执行，检索记录压成 96 个向量给固定教师，损失分别更新学生和压缩模块"></a><figcaption>据 §3、Figure 2、Algorithm 1 重绘。教师模型不更新，但它对输入向量的梯度必须保留；教师不替学生执行新动作。</figcaption></figure>

<h3 id="先建经验库，再初始化压缩模块">3.1 先建经验库，再初始化压缩模块</h3>

<p>作者离线保留训练任务中的成功记录，每条包含任务描述和紧凑的动作、返回结果，删除冗长 observation。工具任务按结果奖励阈值筛选，代码题要求全部测试通过；论文没有给出工具任务的具体入库阈值和库大小。评测任务及其记录不得入库。</p>

<p>论文用 Qwen3-Embedding-8B 产生 4,096 维检索向量，用向量搜索库 FAISS 精确查找余弦最相近的 3 条。检索查询只有当前任务描述，不用学生当前动作前文。对每条检索结果，编码器输入“当前任务 + 参考记录”，产生长度为 T<sub>j</sub>、隐藏维度为 d 的表示。编码器主模型冻结，只训练附加的少量参数（LoRA），其 rank 为 8、α 为 16，覆盖每层的七个线性投影。</p>

<p>负责压缩的网络叫 <strong>QFormer</strong>。它从 32 个可训练的查询向量开始，每个向量都对记录中各位置的表示计算权重，再按权重汇总信息，更新自己。论文把这种“查询向量读取另一组表示”的操作称为 <strong>cross-attention</strong>。公开代码还把当前查询向量加入可读取列表，所以查询之间也能交换信息。每轮读取后，再用前馈网络变换这些向量。</p>

<p>网络重复这个过程八轮，始终使用同一套注意力和前馈参数；八轮不是八套独立参数。输出有 32 个向量，每个 d 维，即 <code>32×d</code> 个数。这组压缩模块称为 <strong>composer</strong>，包含编码器 LoRA 和 QFormer；三条结果拼接后是 <code>96×d</code>。</p>

<p>正式蒸馏前有 <strong>cold start</strong>：先让固定教师在这些向量帮助下预测成功记录的 assistant token，只更新 composer。论文给出 AdamW、学习率 <code>1e-5</code>、batch 8、梯度裁剪 3.0，但没有公布各领域初始化的训练步数和数据量。把这个初始模块记作 φ₀，后续用它作为稳定参照。</p>

<h3 id="正式更新：一条记录上的六步">3.2 正式更新：一条记录上的六步</h3>

<ol><li>学生仅看当前任务和真实交互前文，调用环境 API，最多 30 步；检查器给完整记录的结果奖励 r。</li><li>检索模型找 3 条成功经验，composer 把它们压成 96 个向量。</li><li>在第一条 user 消息中放置 96 个占位 token，用向量替换其输入 embedding。替换发生在第一层 Transformer <em>之前</em>，不是随意插入某个 hidden-state 层。</li><li>教师主模型保持初始参数，并在重评分时关闭编码器 LoRA。它读取任务、学生同一条前文和额外向量，计算下一 token 的概率。</li><li>按教师概率取 top-20，再把词表其余部分合成一个 tail bucket。学生和教师在相同的 21 个事件上计算 reverse KL，监督 assistant 动作 token，用户和工具返回不计算这项 loss。</li><li>更新学生与 composer，并调整防退化约束的权重。部署只保留学生。</li></ol>

<p class="source-note">§3.3、A.4；代码 <code>teacher.py</code>、<code>serialization.py</code>、<code>worker.py</code>。固定教师参数仍允许梯度穿过其激活回到输入向量。把整次教师调用放进 <code>torch.no_grad()</code> 会切断 composer 的学习；代码只在为学生准备固定评分时使用 no-grad，在 composer 更新阶段保留计算图。</p>

<h3 id="结果奖励怎样防止教师被压缩模块拖弱">3.3 结果奖励怎样防止教师被压缩模块拖弱</h3>

<p>设学生实际采样 token 的概率是 p<sub>S</sub>，教师对同一个 token 的概率是 p<sub>T</sub>，定义 <code>δ = log p_T − stop_gradient(log p_S)</code>。完整任务奖励变成 <code>A = 2r − 1</code>：完全成功为 +1，失败为 −1，部分完成可能在两者之间。平均的 <code>Aδ</code> 记作 Δ。</p>

<div class="formula">min<sub>θ,φ</sub> max<sub>β≥0</sub> [ L<sub>KL</sub> + β(m − Δ) + λ‖c<sub>φ</sub> − stop_gradient(c<sub>φ₀</sub>)‖² ]<br>β ← max(0, β + η<sub>β</sub>(m − Δ))</div>

<p>默认 m=0.05、λ=0.2、η<sub>β</sub>=0.5。成功记录中，约束鼓励教师提高学生已选 token 的概率；失败记录中，则鼓励教师降低这些 token 的概率。若 r=0.5，A=0，这条记录不向 Δ 提供方向。学生概率在这一项被 detach，因此<strong>结果约束直接训练的是 composer，学生通过 KL 接收改变后的教师分布</strong>。</p>

<p>这是整条记录奖励加权的概率差，不是每个 token 正确与否的标签，也不等于“教师执行后的成功率至少高 m”。在 m>0 时，如果教师分布完全退化为学生分布，Δ 会接近 0，约束会增加惩罚。向量锚定项限制偏离 cold start；初始向量可缓存，命中时不用再跑初始 composer。</p>

<p>下面是本文自写的 Python 3.12 算术演示，概率为示意值，不是模型实测。在 top-2 加 tail 的三个事件上，KL≈0.0811；成功 token 的概率由 0.4 变为 0.6，δ≈0.4055。它只核对公式，不复现训练。</p>

```python
from math import log

student = [0.4, 0.3, 0.3]  # 最后一项是 tail 概率
teacher = [0.6, 0.2, 0.2]
kl = sum(s * log(s / t) for s, t in zip(student, teacher))
delta = log(0.6) - log(0.4)
beta_next = max(0.0, 0.0 + 0.5 * (0.05 - delta))
print(round(kl, 4), round(delta, 4), beta_next)
```

<h3 id="真实检索例子能证明什么">3.4 真实检索例子能证明什么</h3>

<figure class="figure"><a href="/lib/papers/latent-on-policy-self-distillation/benefits-real-case.svg" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/benefits-real-case.svg" width="1080" height="640" alt="当前保险方案任务与另一份方案修改记录共享操作顺序，但实体编号与参数不同，投影词语不构成可读流程"></a><figcaption>据 Figure 6 重绘真实任务与 rank-2 检索结果。0.886 是检索相似度，不是成功率；论文未给出该样本完整学生执行和逐项 judge 结果。</figcaption></figure>

<p>当前任务添加的是 <code>PLAN-HI-03</code>，保费 310.25；检索结果添加 <code>BP-HEALTH-010</code>，保费 210。这些编号和数值不能照抄。参考记录的“已执行”也只发生在另一场会话。论文提示明确提醒教师：当前环境尚未操作，需要学生自己查询和调用。</p>

<p>另一个真实题 <code>taco_00713</code> 是带硬币转移的循环淘汰，检索到普通 Josephus survivor：7 人每数到第 3 人淘汰，最终 survivor 为 4。两者共享循环淘汰结构，但前者还要累计硬币，直接复制后者递推式并不能完成当前题。</p>

<p>作者把 32 个向量经过固定的词表输出层（LM head）投影成词，得到混合语言和代码碎片。这个展示说明它们不能直接读成一份步骤表；既不能据此证明压缩模块掌握了算法，也不能证明它没有复制答案。论文没有提供这些样本完整的模型输出和官方评分记录。</p>

<h2 id="实验：完成奖励、关键消融与成本口径">4. Experiments：完成奖励、关键消融与成本口径</h2>

<p><strong>LOPD 在 10 个模型、评测组合的汇总项上均领先，但提升大小与统计条件要分开看。</strong>工具训练用 2,349 个 EnvScaler 任务，代码训练用约 7,000 个 TACO Python 题。每个训练步共 32 条记录；采样 temperature=0.7、top-p=0.95、top-k=20，学习率 <code>1e-5</code>。采样的 top-k 与蒸馏保留的 top-20 是两项不同配置。</p>

<h3 id="一个提交怎样得到分数">4.1 一个提交怎样得到分数</h3>

<p>EnvScaler 用 200 个未入训练集的任务。公开适配器真实执行工具，保存初始和最终状态；任务文件中的 <code>checklist_with_func</code> 包含若干检查函数。每条检查返回布尔值，失败、异常或非布尔结果不通过。奖励是 <strong>通过检查数 ÷ 全部检查数</strong>，空清单为 0，最后对任务平均。63.7 表示平均部分完成奖励×100，不是“63.7% 的任务全部完成”。</p>

<p>例如一份任务若有 5 项检查、3 项通过，则 r=0.6、A=0.2。这里的 5/3 是解释公式的自写例子；保险方案样本的真实清单和每项结果未发布，不能把这个数字当成它的官方判分。公开适配器能验证评分方式，不能替代缺失的任务包。</p>

<p>BFCL-v3 的四个子集各 200 题，报告四项均值。ACEBench 有 20 个 multi-step、30 个 multi-turn 任务，后者用 DeepSeek-V4-Flash 模拟用户；汇总按 20/30 加权。LiveCodeBench v5/v6 分别 279/131 题，代码必须通过其测试；EvalPlus 的 HumanEval+/MBPP+ 为 164/378 题。代码列的 pass@1 是一次生成通过全部测试的题目比例，两组 Avg 都按题数加权，不能直接平均两个百分比。</p>

<div class="table-scroll"><table><thead><tr><th>模型 / 汇总评测</th><th>未训练模型</th><th>最强其他方法</th><th>LOPD</th><th>相对最强对照</th></tr></thead><tbody><tr><td>Qwen3-4B · EnvScaler</td><td>48.6</td><td>GRPO 61.8</td><td><strong>63.7</strong></td><td>+1.9</td></tr><tr><td>Qwen3-4B · BFCL</td><td>22.88</td><td>GRPO 25.25</td><td>27.38</td><td>+2.13</td></tr><tr><td>Qwen3-4B · ACEBench</td><td>50.6</td><td>GRPO / Skill-SD 56.0</td><td>60.6</td><td>+4.6</td></tr><tr><td>Qwen3-8B · EnvScaler</td><td>49.2</td><td>Skill-SD 60.2</td><td>66.4</td><td>+6.2</td></tr><tr><td>Qwen3-8B · BFCL</td><td>28.38</td><td>GRPO 29.00</td><td>29.88</td><td>+0.88</td></tr><tr><td>Qwen3-8B · ACEBench</td><td>54.6</td><td>GRPO 58.0</td><td>62.7</td><td>+4.7</td></tr><tr><td>Qwen3-4B · LiveCodeBench</td><td>45.61</td><td>GRPO 48.29</td><td>48.78</td><td>+0.49</td></tr><tr><td>Qwen3-4B · EvalPlus</td><td>78.79</td><td>SDFT 80.07</td><td>81.36</td><td>+1.29</td></tr><tr><td>Olmo3-7B · LiveCodeBench</td><td>46.34</td><td>GRPO 48.29</td><td>50.98</td><td>+2.69</td></tr><tr><td>Olmo3-7B · EvalPlus</td><td>75.28</td><td>SDFT 77.86</td><td>78.41</td><td>+0.55</td></tr></tbody></table></div>

<p class="source-note">Tables 1–2；所有差值是本文据表计算的百分点。主表未报告多训练 seed 方差或置信区间，不足以把 +0.49、+0.55 这样的差异称为显著。各方法教师、KL 方向和辅助奖励不同；SDFT/OPSD 的示范池覆盖不足时还使用更强模型补充，所以不是仅换 context 表示的单变量实验。</p>

<h3 id="最有区分力的是防退化消融">4.2 最有区分力的是防退化消融</h3>

<figure class="figure"><a href="/lib/papers/latent-on-policy-self-distillation/margin-evidence.svg" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/margin-evidence.svg" width="1080" height="640" alt="固定 composer 0.573，联合训练 m=0 为 0.551，m=0.05 为 0.637；行为统计有好有坏"></a><figcaption>据 Figure 3、Table 3 重绘。这里统一用 0–1 奖励；增加可训练参数本身并没有带来提升。</figcaption></figure>

<p>固定 cold-start composer 得 0.573；联合训练但 m=0 得 0.551，反而下降。m=0.05 得 0.637，m=0.10 为 0.626，继续增至 0.20 则为 0.613。它支持“联合训练需要约束”这条结论，却不能独立归因到 latent representation：仍缺同样检索、同样资料和相同预算下的文字压缩对照。</p>

<p class="source-note">论文 §4.3 把 m=0 称为“without the margin constraint”，Appendix B.4 则说联合训练各组只改变 m。严格地说，m=0 取消的是正的最低差距：Δ=0 的退化解不再违反要求。固定版本的 <code>worker.py:236–294</code> 也没有在 m=0 时关闭奖励项；只改 m 不等于删除整项结果约束。这里沿用数值标签 m=0，不推断作者另外关闭了 β 或向量锚定。</p>

<p>容量消融中每条 8/16 个向量的奖励为 56.5/56.3，32 个为 63.7，64 个反降到 60.6，128 个为 62.9。检索从 1 条到 3 条由 0.605 升到 0.637，此后不单调改善。不能概括成“向量越多、经验越多越好”。</p>

<p>行为变化也不是全项改善：学生每题交互步数由 11.12 增到 17.04，但每步工具调用由 3.50 降到 1.11，重复调用由 8.89 降到 5.25。相比“原模型 + 已训练 composer”，最终学生的重复调用仍更多（5.25 对 4.49），每次调用奖励仍更低（0.050 对 0.053）。训练确实改变了调用方式，尚不能证明它学会了唯一正确的内部计划。</p>

<h3 id="少于-30-指哪种成本">4.3 少于 30% 指哪种成本</h3>

<p>Figure 4 中，Qwen3-4B 的 LOPD 在 320 条生成记录后超过 0.61，576 条时到 0.637；GRPO 和 Skill-SD 在 1,600 条末尾分别为 0.611、0.588。320/1,600=20%，能解释“用不到 30% 的 rollout 预算超过对照”这一表述；576/1,600=36%，则是达到自身最终高分所需的比例。</p>

<p>这些数字不包含经验库收集、Embedding 计算、cold start 和 composer 反向传播的全部成本。论文没给出完整 GPU 小时、模型调用 token 和端到端费用，不能进一步写成训练成本降低 70%。</p>

<h2 id="下一步：固定经验来源，隔离表示收益">5. Discussion：固定经验来源，隔离表示收益</h2>

<p><strong>最重要的是控制经验来源，检验收益是否真的来自可学习表示。</strong>用完全相同的三条记录，对比原文字、等长文字总结、固定向量和联合训练向量；控制教师模型、奖励、KL、训练步数与总 token。这样才能拆开检索、压缩和约束各自的作用。</p>

<p>第二个关键区分是同题经验与跨题经验。训练时读取同题成功记录是合法的特权监督，但与从另一题检索通用做法不是一回事，应单列结果。仅过滤完全相同的任务字符串也不能排除模板、实体替换后的近重复题；还需要任务族分组与近重复审计。</p>

<p>第三个实验应直接改变经验：替换其中的工具名称、参数或关键步骤，测教师和最终学生的响应。LM-head 投影不可读只能说明人难以解码，不能判断教师真正使用了什么。</p>

<h2 id="结论与公开代码的实现差异">6. Conclusion：结论与公开代码的实现差异</h2>

<p><strong>可学习的训练用 context 有价值，但公开代码还不能直接重跑论文全部结果。</strong>本文核查固定 commit <code>50c3d7f53f8b062153f23f3f9b56e949c888e071</code>，不把之后的仓库变化当作本轮证据。</p>

<div class="table-scroll"><table><thead><tr><th>核查对象</th><th>论文 / 该代码版本</th><th>影响</th></tr></thead><tbody><tr><td>检索文档</td><td>论文编码任务+路径；<code>MemoryBank.build_index()</code> 只编码 <code>instruction</code></td><td>自行建索引不等于论文检索方式；外部预建索引未发布</td></tr><tr><td>同题过滤</td><td>类默认 false，训练 YAML 显式 <code>allow_self_retrieval: true</code></td><td>允许检索同题记录；这不是评测集泄漏的证据，但要区分同题与跨题监督</td></tr><tr><td>更新顺序</td><td>先教师评分、学生更新，再 composer 更新</td><td>composer 使用保存的更新前学生概率，而非重新运行更新后的学生</td></tr><tr><td>归一化</td><td>学生 loss 按全局 token 数；composer 按本地有效记录均值，β 统计按全局 token 数；anchor 用平方均值</td><td>不同长度与样本数可能改变梯度权重；论文抽象式不能代替这段实现</td></tr><tr><td>缺失或失败</td><td>无检索结果、执行异常的记录跳过监督，全批失败则中止</td><td>失败记录的处理与正常 r=0 记录不同</td></tr><tr><td>发布完整性</td><td>README 链接学生模型，核心 pipeline 已放出；compressor checkpoint 标注待发布，YAML 仍为路径占位</td><td>经验库、检索向量、场景任务包（scenario）、完整日志和其他评测适配器未随版本提供</td></tr></tbody></table></div>

<p>最值得保留的是一个清楚的失败模式：<strong>同时训练学生和教师的 context 时，降低分布差异可以通过削弱教师实现</strong>。LOPD 用完整任务结果约束这种退化，并给出了固定 composer、m=0 的联合训练和不同正 margin 的对照。这比“把经验压成 96 个向量”更能解释论文的算法价值。</p>

<p class="source-note">本文核查 20 页正文与附录、全部 6 幅 Figure、5 张 Table 和 Algorithm 1。原版图授权未另行确认，正文使用标明来源的事实重绘，不复制论文排版。个人兴趣程度 7/10，仅代表博客作者本人的兴趣。算术代码仅检查公式，不代表重跑模型训练或验证未公开任务。</p>
</div>

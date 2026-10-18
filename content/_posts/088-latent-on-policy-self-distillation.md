---
title: "[2026-08-13] Latent On-Policy Self-Distillation"
permalink: "/posts/论文解读/latent-on-policy-self-distillation.html"
date: "2026-10-08T18:30:00+08:00"
updated: "2026-10-19T20:30:00+08:00"
cover: "/lib/papers/latent-on-policy-self-distillation/cover.svg"
paper_style: editorial
description: "把成功任务记录压成向量，只在训练时给教师，用教师的概率分布训练学生。本文解释压缩模块怎样学习、怎样避免教师迎合学生，并重放原图中的真实保险任务与12条公开检查。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 17
categories:
  - "论文解读"
tags:
  - "Latent Context"
  - "On-Policy Distillation"
  - "Experience Retrieval"
  - "Code Generation"
---

<link rel="stylesheet" href="/styles/paper-deep-dive-v2.css?v=10">
<style>
body.page-paper-reading.page-paper-editorial .prose .figure.case-original{max-width:800px}
body.page-paper-reading.page-paper-editorial .prose .figure.result-original{max-width:900px}
body.page-paper-reading.page-paper-editorial .prose .figure.margin-original{max-width:460px}
body.page-paper-reading.page-paper-editorial .prose .figure.curve-original{max-width:650px}
body.page-paper-reading.page-paper-editorial .prose .figure:has(img[src$="table-3.webp"]){max-width:620px}
@media(max-width:640px){body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a,body.page-paper-reading.page-paper-editorial .prose .figure.result-original>a,body.page-paper-reading.page-paper-editorial .prose .figure.case-original>a{display:block;overflow-x:auto;overscroll-behavior-x:contain}body.page-paper-reading.page-paper-editorial .prose .figure.reading-diagram>a>img,body.page-paper-reading.page-paper-editorial .prose .figure.result-original>a>img,body.page-paper-reading.page-paper-editorial .prose .figure.case-original>a>img{width:850px;max-width:none;height:auto}}
</style>
<div class="paper-reading">
<p class="paper-meta">Guibin Zhang, Jiayang Lyu, Ran Sun, Xinlei Yu, Haoyu Zhao, Qibing Ren, Shuicheng Yan · arXiv:2608.13040v1 · 最早公开于 2026-08-13</p>
<div class="source-links"><a href="https://arxiv.org/abs/2608.13040v1">论文主页</a><a href="https://arxiv.org/pdf/2608.13040v1">论文 PDF</a><a href="https://github.com/bingreeky/LOPD/tree/50c3d7f53f8b062153f23f3f9b56e949c888e071">固定版本代码</a><a href="https://github.com/RUC-NLPIR/EnvScaler/tree/c2aa25b45c3185e80e9cb2b919227cc912445abc">上游任务与检查函数</a></div>
<section class="deck-wrap" aria-label="LOPD 交互图解">
  <div class="deck-head"><strong>17 页交互图解 · 经验输入、训练约束与真实判分</strong><a href="/lib/decks/latent-on-policy-self-distillation-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed"><div class="post-deck-embed-frame"><iframe src="/lib/decks/latent-on-policy-self-distillation-visual-guide.html" title="LOPD 论文图解，共 17 页" allow="fullscreen" loading="eager"></iframe></div><p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 切换全屏</span><span>手机可滚动宽图；Esc 退出，独立页可返回文章</span></p></div>
</section>

<p class="lead">模型过去完成过一些任务，怎样把这些成功记录变成新的训练信号？LOPD 学习一个压缩模块，把相关记录变成输入向量，再让教师用它们指导学生。麻烦在于：模块也可能把教师变得更像学生，让蒸馏损失下降，却没有教会学生更好的做法。</p>

<aside class="part0"><span class="kicker">PART 0 · 谁执行，谁评分</span><h3>学生执行任务，教师重评学生已经写出的回答</h3><p>接受训练、实际调用工具的模型叫 student（学生）；从开始到提交的一次完整交互叫 rollout。teacher（教师）读取学生同一段前文，计算其回答中每个 token（模型处理的文字单位）的下一词概率，不再执行一套新动作。</p><p>教师额外读取的训练资料叫 privileged context。本文把资料压成连续输入向量，称为 latent tokens；一个位置是一个向量，不是一个可读单词。教师主模型固定在初始参数，学生和压缩模块更新。测试时仍用工具，只移除这批训练用经验。</p></aside>

<aside class="keypoints"><h3>先看三点</h3><ul><li>默认检索 3 条成功记录，每条压成 32 个向量，共 <strong>96 个教师输入位置</strong>。</li><li>Qwen3-4B 的 EnvScaler 平均部分完成分数 <strong>48.6 →63.7</strong>，最强对照为 61.8；不等于 63.7% 的任务整题通过。</li><li>固定压缩模块得 0.573；联合训练、最低差距 m=0 得 0.551，m=0.05 得 0.637。<strong>让输入可训练本身不保证更好</strong>。</li></ul></aside>

<h2 id="研究问题：成功经验该怎样表示">1. Motivation：成功经验应当怎样指导当前学生</h2>

<p><strong>论文希望学习“教师应从经验里读取什么”，而不只选择一种固定的文字资料。</strong>完整答案、成功路径或技巧总结，都预先决定了额外输入的内容。学生可能用了另一条有效路径，也可能在前几步做错了；参考记录的下一步未必能接上当前前文。</p>

<figure class="figure original reading-diagram"><a href="/lib/papers/latent-on-policy-self-distillation/figure-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-1.webp" width="2448" height="765" alt="原Figure1：固定答案反馈技巧与可训练经验输入对照，教师额外读取向量"></a><figcaption>原 Figure 1，Zhang et al.，arXiv:2608.13040v1，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。保留原英文标签；图中的 Tips 等是框架可能接收的资料，本文实际经验库使用成功执行记录。</figcaption></figure>

<p>LOPD 用教师概率对学生的监督，反过来训练经验压缩模块。这个操作有一个具体风险：为了缩小两分布的差异，模块可以让教师迎合学生，包括学生的错误行为。作者因此把整题结果引入约束，要求教师在成功记录上更支持学生选择，在失败记录上更少支持。实验需要检验这项约束，而不能只看压缩后的长度。</p>

<h2 id="与文字蒸馏和部署用记忆的区别">2. Related Work：额外资料怎样产生，谁可以更新</h2>

<p><strong>最接近的对照同样让学生先执行，区别在教师读到的资料及更新方式。</strong>下表是本论文的实验配置，不代表各方法在所有工作的默认设定。</p>

<div class="table-scroll"><table><thead><tr><th>方法</th><th>教师额外读取</th><th>教师与训练信号</th></tr></thead><tbody><tr><td><a href="/posts/论文解读/self-distilled-reasoner.html">OPSD</a></td><td>同题验证过的参考路径</td><td>固定初始教师；按教师概率加权的全词表 KL</td></tr><tr><td>SDFT</td><td>成功示范文字</td><td>EMA（学生参数的移动平均）教师；同上</td></tr><tr><td>SDPO</td><td>同题同一训练步的 4 条学生记录中的成功记录</td><td>EMA 教师；按学生概率加权的 KL</td></tr><tr><td>Skill-SD</td><td>有效做法、失败做法、建议流程的文字总结</td><td>整题奖励训练，加采样 token 的概率差监督</td></tr><tr><td>LOPD</td><td>检索经验经可训练模块生成的向量</td><td>主模型固定，输入模块更新；KL、结果约束、向量锚定</td></tr></tbody></table></div>

<p>KL 衡量两份概率分布的差异；forward / reverse 表示用教师还是学生概率加权。LOPD 的连续向量可通过梯度更新，而文字总结的内容不能这样更新。相关的 MemoryLLM / MemGen 等 latent memory 路线，把历史信息存在向量中，做任务时仍读取；这里的经验模块只用于训练教师。</p>

<p>比较还有一个重要条件：SDFT / OPSD 的示范池覆盖不足时，作者用 DeepSeek-V4-Pro、Qwen3.7-Max 补充；LOPD 的初始化用基座自己的成功记录。教师、资料来源、KL 和辅助奖励并未全部对齐，所以主表不能单独证明“向量胜过同样内容的文字”。</p>

<h2 id="方法：经验压缩、参数更新与防退化约束">3. Method：压缩经验，再重评学生自己的执行记录</h2>

<p><strong>先形成成功经验库，再让教师用压缩经验重评学生的同一回答。</strong>贯穿案例是 Figure 6 的 <code>env_174_rl-task_29</code>：添加健康保险、修改牙科方案、为四名员工变更或撤回选择。另一份成功记录也做过类似操作，但方案编号、员工与金额不同；它只能提供做法，不能充当当前任务的执行结果。</p>

<h3 id="先建经验库，再初始化压缩模块">3.1 经验库与压缩模块从哪里来</h3>

<p>作者只收训练集上的成功执行，保存任务、动作与精简返回，删去冗长观察。工具记录超过奖励阈值才入库，代码记录必须全测试通过；具体工具阈值、库大小未披露。评测任务和结果不得入库。</p>

<p>固定的 Qwen3-Embedding-8B 把任务映射为 4,096 维检索向量，按相似度取前三条。压缩模块叫 composer，包含编码器的 LoRA（附加的可训练小矩阵）和 QFormer（用查询向量读取编码结果的注意力模块）。编码器主参数固定，读取当前任务与每条经验；32 个查询向量反复读取并变换结果，共八轮，同一套参数重复使用。每条输出 <code>32×d</code>，拼成 <code>96×d</code>，d 是主模型表示宽度。</p>

<p>正式蒸馏前先做 cold start：只更新 composer，让固定主模型利用这些向量预测成功记录中的 assistant 输出。学习率 <code>1e-5</code>、batch 8，具体数据量与步数按领域调整但未给出。初始化得到的模块与向量，随后用来限制训练漂移。</p>

<h3 id="正式更新：一条记录上的六步">3.2 一次正式更新</h3>

<figure class="figure original reading-diagram"><a href="/lib/papers/latent-on-policy-self-distillation/figure-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-2.webp" width="1908" height="825" alt="原Figure2：学生实际行动形成记录，教师在同一前文上读取经验向量，固定教师主模型，更新学生与composer"></a><figcaption>原 Figure 2，Zhang et al.，CC BY 4.0。下方学生真实执行；上方教师重评分。同一前文指已经写出的学生前文，不是参考记录中的状态。</figcaption></figure>

<ol><li>学生仅看任务、工具说明与真实交互前文，执行后提交；检查器给完整记录的结果奖励 r。</li><li>检索相关成功经验，composer 用当前任务与三条经验生成 96 个向量。</li><li>首条 user 消息中插入占位位置，在第一层 Transformer <strong>之前</strong>用向量替换输入 embedding（词元输入表示）。</li><li>固定初始教师在学生的每段前文上计算下一词分布。编码 LoRA 不参与这次评分；教师激活仍保留梯度，才能把损失传回输入向量。</li><li>取教师概率最高的 20 个词元，并把其余词表概率合成 tail bucket（一项剩余概率）。两模型在相同 21 个事件上计算 reverse KL；只训练 assistant 输出，用户与工具返回只作输入。</li><li>更新学生和 composer，再调整结果约束的权重。测试学生不读取经验库。</li></ol>

<p>取 top-20 后没有把这 20 项重新归一化；剩余质量保留在 tail。检索查询、composer 都不读取学生当前前文，变化的是训练参数，以及教师随后评分时读到的实际前文。论文按依赖关系写“学生后检索”；公开代码可以先查缓存，只要检索资料不进入学生输入，两者不冲突。</p>

<h3 id="结果奖励怎样防止教师被压缩模块拖弱">3.3 结果奖励约束什么</h3>

<p>设学生实际采到的词元概率为 p<sub>S</sub>，教师对同一个词元的概率为 p<sub>T</sub>。论文先计算 <code>δ=log p_T−sg(log p_S)</code>；sg 表示这条路径停止学生梯度。整题奖励变为 <code>A=2r−1</code>，再对输出词元平均 Aδ，记为 Δ。</p>

<div class="formula">min<sub>θ,φ</sub> max<sub>β≥0</sub> [ KL(p̃<sub>S</sub>‖p̃<sub>T</sub>) + β(m−Δ) + λ‖c<sub>φ</sub>−sg(c<sub>φ₀</sub>)‖² ]<br>β ← max(0, β+η<sub>β</sub>(m−Δ))</div>

<p>θ 是学生参数，φ 是 composer 参数；p̃ 是前面的 21 项分布，c 是经验向量，φ₀ 是初始化模块。默认 <code>m=.05、λ=.2、ηβ=.5</code>。成功 r=1 时 A=1，约束鼓励教师提高学生已选词元的概率；失败 r=0 时反向，r=.5 时没有这项方向。若教师完全迎合学生，则 δ、Δ 都为 0；从 β=0 出发，一次更新后 β=.025，惩罚开始增加。</p>

<p><strong>结果项直接更新 composer，学生通过 KL 接收改变后的教师分布。</strong>它没有逐词元正确标签，也没有执行教师来比较成功率。最后一项是向量锚定，限制偏离初始化；不是“教师一定正确”的保证。</p>

<details><summary>实现与算术：完整 Algorithm 1、概率验算和梯度细节</summary><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/algorithm-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/algorithm-1.webp" width="1640" height="956" alt="原Algorithm1完整训练循环"></a><figcaption>原 Algorithm 1，CC BY 4.0。</figcaption></figure><p>以下 Python 3 示例由本文编写，概率是假设值，只验公式，不复现模型。两个显式事件加剩余概率构成分布。</p>

```python
from math import log

student = [0.4, 0.3, 0.3]  # 最后一项是 tail
teacher = [0.6, 0.2, 0.2]
kl = sum(s * log(s / t) for s, t in zip(student, teacher))
delta = log(0.6) - log(0.4)
print(round(kl, 4), round(delta, 4))  # 0.0811, 0.4055
```

<p>固定版本先不记录教师梯度，准备学生评分并更新学生；随后保留教师输入梯度，使用保存的<strong>更新前学生概率</strong>更新 composer。将整个教师前向放进 <code>torch.no_grad()</code> 会切断这一阶段的学习。<code>base_model_view</code> 引用不含编码 LoRA 的底层权重，不是临时训练另一份教师。</p><p>学生损失按全局 token 均值；composer 先本地每记录平均再跨进程平均，β 统计按全局 token 均值；锚定用平方均值。无检索或执行异常的记录跳过，全批无有效记录则中止；正常 r=0 仍参与训练。这些细节与论文的抽象联合目标分开看。</p></details>

<h2 id="实验：完成奖励、关键消融与成本口径">4. Experiments：真实判分、主结果与约束消融</h2>

<p><strong>主结果在十个模型与任务集组合的汇总项上领先，但先要分清每个分数测什么。</strong>工具训练用 2,349 题，代码用约 7,000 个 TACO Python 题；每步共 32 条学生记录。工具总生成上限 40,960 token、30 环境步，代码 16,384 token、单次生成；采样 .7 / .95 / top-k 20，评测启用模型推理模式。采样 top-k 与蒸馏 top-20 是不同设置。</p>

<span id="真实检索例子能证明什么"></span>
<h3 id="一个提交怎样得到分数">4.1 保险案例：12 条检查怎样给出一次奖励</h3>

<p>这份任务、初态、环境代码和 <code>checklist_with_func</code> 都能在<strong>上游 EnvScaler</strong> 定位，不只依赖 Figure 6 摘录。ScenGenerator 用模型生成初态与任务，另生成逐字段清单和 Python 检查函数；解析、语法检查失败最多重试五次。代码没有证明每项都人工审核；语法有效也不保证逻辑有效。</p>

<figure class="figure original case-original"><a href="/lib/papers/latent-on-policy-self-distillation/figure-6-task-reference-detail.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-6-task-reference-detail.webp" width="2108" height="1320" alt="原Figure6上半部当前保险任务与另一任务的检索参考，金额编号与登记期不同"></a><figcaption>原 Figure 6 的当前任务与检索参考局部，CC BY 4.0；完整原图在下方补充。0.886 是检索相似度，不是任务得分。原图用缩写展示方案名和动作，重放使用上游完整字段。</figcaption></figure>

<p>环境初态的登记期是 <code>EP-2024-MIDYEAR</code>，不是参考里的 <code>EP-FALL-2024</code>。学生看到任务、工具说明和操作返回，不直接看到检查函数或原始数据库；通过查询工具获取实际状态。目标依次包括：</p>

<ol><li>添加 <code>PLAN-HI-03</code>，完整名称 <code>GreenShield Medical Standard</code>，保费 310.25，资格 <code>FT_EMP</code>，保障文字须匹配任务。</li><li>将 <code>PLAN-DN-01</code> 保费 35.4 改成 37.0，保障补上 periodontal maintenance（牙周维护）。</li><li>E1001 从 HI-01 改 HI-03；E1002 从 DN-01 改 LF-01；撤回 E1005；将 E1004 登记到当前期的 HI-02。E1004 原有的旧期记录不满足最后一项。</li></ol>

<p>检查器读取最终状态：新健康方案六项、牙科两项、员工操作四项，共 12 项。<strong>每项必须返回布尔 True</strong>，异常或非布尔结果都不通过；奖励是通过数除以 12，再四舍五入到四位。第一项“方案存在”还检查类型，第二项再次检查类型，实际重复计权。</p>

<figure class="figure reading-diagram"><a href="/lib/papers/latent-on-policy-self-distillation/benefits-judge.svg" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/benefits-judge.svg" width="900" height="310" alt="同一真实初态经正确API操作后12项检查全过，漏撤回E1005时检查11失败，11除以12得0.9167"></a><figcaption>本文按固定上游任务与 LOPD runtime 独立整理；两分支动作是本文编写并实际重放，不是论文发布的学生执行日志。</figcaption></figure>

<p>本文用原环境和原检查函数运行七次 API 调用：查询当前期、添加、更新、两次变更、撤回、登记。全完成得 <strong>12/12=1</strong>；省去撤回 E1005 得 <strong>11/12=.9167</strong>。复制参考保费 210 也只过 11 项。Figure 6 的简写 <code>GreenShield Standard</code> 若直接作方案名，实际名称检查会失败，不能把图里缩写当作可执行原参数。</p>

<p>EnvScaler 测试 200 个留出任务，先算各题的部分奖励，再取题均值×100。所以 63.7 不是整题成功率。任务可以得 .9167 却没有完成所有要求；论文未另报这一主表的严格全完成比例。</p>

<details><summary>可重放代码、原检查函数，以及上游数据和论文划分的边界</summary><p>Python 3 标准库。保存同目录的<a href="/lib/papers/latent-on-policy-self-distillation/replay-benefits-case.py">本文重放脚本</a>、<a href="/lib/papers/latent-on-policy-self-distillation/env174.py">原环境</a>、<a href="/lib/papers/latent-on-policy-self-distillation/env174-task.json">原任务与12条检查</a>，运行 <code>python3 replay-benefits-case.py</code>，或加 <code>--omit-withdraw</code>。原环境及任务来自 EnvScaler commit <code>c2aa25b4</code>，遵循 <a href="/lib/papers/latent-on-policy-self-distillation/EnvScaler-LICENSE.txt">MIT 许可</a>。脚本是本文的动作与评分入口，不是 LOPD 学生模型。</p>

```python
# 原任务的第11条检查，未经改写
def check_func(final_state):
    eps = final_state.get("employee_plan_selections", {})
    for key, record in eps.items():
        if record.get("employee_id") == "E1005" and record.get("enrollment_period_id") == "EP-2024-MIDYEAR":
            return False
    return True
```

<p>另测 E1004 错登旧期 <code>EP-2023-FALL</code>：API 返回该期未激活，最后一项失败，得 .9167。操作返回 success 只说明该 API 成功，整题仍由最终状态检查。</p><p>LOPD 固定适配器在提交时判分。<code>ReActAgent.step</code> 会在最后允许步强制提交，因此配置 30 步不是 30 次模型工具调用。本文用其实际 Agent 与 runner 检查了七次调用加最后提交；只检查 runner、忽略 Agent 的强制提交，会误判为超上限没有评测。</p><p>上游有 2,550 条任务，而论文 2,349+200=2,549；确切划分 ID 没有提供。不能猜少了哪题，也不能凭 Figure 6 就认定该例属于留出集。重放只核验公开任务与检查，不复现 63.7 分或教师压缩后的模型输出。</p></details>

<h3 id="最有区分力的是防退化消融">4.2 模型表现与最有区分力的对照</h3>

<p>BFCL-v3 四个子集各 200 题，Avg 是四项均值；ACEBench 的 20 个 multi-step、30 个 multi-turn 按题数加权，多轮由 DeepSeek-V4-Flash 模拟用户。LiveCodeBench v5/v6 为 279/131 题，EvalPlus 两集为 164/378 题；代码 pass@1 是一次生成通过全部测试的题目比例，Avg 按题数加权。</p>

<figure class="figure original result-original"><a href="/lib/papers/latent-on-policy-self-distillation/table-1-qwen4-detail.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/table-1-qwen4-detail.webp" width="1584" height="414" alt="原Table1 Qwen3-4B全部方法与工具评测列，LOPD汇总领先，Base和LongContext并非最好"></a><figcaption>原 Table 1 表头与 Qwen3-4B 块拼接，CC BY 4.0。该模型全部方法、列与数值保留；完整两模型表在补充中。</figcaption></figure>

<p>Qwen3-4B 在 EnvScaler 为 63.7，对 GRPO 61.8 高 1.9 点；Qwen3-8B 为 66.4，对 Skill-SD 60.2 高 6.2 点。代码的优势有些很小：Qwen3-4B / LiveCodeBench 48.78 对 48.29，Olmo3-7B / EvalPlus 78.41 对 77.86。主表没有多训练种子的方差或置信区间，不能称这些小差异显著。</p>

<p><strong>汇总第一不等于每个子集第一。</strong>Qwen3-4B / BFCL Base 为 32.5，低于 GRPO、Skill-SD 的 33；Long Ctx 为 26，低于 OPSD 的 29；ACEBench M-Step 56.6 低于 GRPO 58.3。</p>

<figure class="figure original margin-original"><a href="/lib/papers/latent-on-policy-self-distillation/figure-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-3.webp" width="1892" height="1675" alt="原Figure3固定composer与不同margin训练最终学生比较，m0低于固定，m0.05最高"></a><figcaption>原 Figure 3，CC BY 4.0。所有分数都评测不读取经验的学生；横轴从 .54 开始，柱长不是从零起的比例。</figcaption></figure>

<p>固定初始化 composer 得 .573；联合训练 m=0 得 .551，m=.05 得 .637，增到 .20 又降至 .613。这个对照支持<strong>联合训练需要适当约束</strong>。m=0 取消正的最低差距，并不等于删掉全部奖励约束；代码没有为 m=0 关闭 β 项。</p>

<p>更多输入也不总更好：每条 8 / 16 / 32 / 64 / 128 向量的分数为 56.5 / 56.3 / 63.7 / 60.6 / 62.9，检索超过三条也不单调改善。行为上，最终学生每步调用从 3.50 降至 1.11，交互步数却从 11.12 增至 17.04；相比“原模型+训练后 composer”，学生重复调用更多（5.25 对 4.49），每次调用奖励更低（.050 对 .053）。</p>

<details><summary>完整原 Tables 1–3、Figure 5：全部模型、子集、行为与容量</summary><figure class="figure original result-original"><a href="/lib/papers/latent-on-policy-self-distillation/table-1.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/table-1.webp" width="1584" height="708" alt="完整原Table1两模型全部工具结果"></a><figcaption>完整原 Table 1，CC BY 4.0。</figcaption></figure><figure class="figure original result-original"><a href="/lib/papers/latent-on-policy-self-distillation/table-2.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/table-2.webp" width="1424" height="748" alt="完整原Table2 Qwen3-4B与Olmo3-7B所有代码结果"></a><figcaption>完整原 Table 2，CC BY 4.0。Qwen3-4B 的 LCB / EvalPlus 为 48.78 /81.36，Olmo3-7B 为 50.98 /78.41。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/table-3.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/table-3.webp" width="784" height="252" alt="完整原Table3三组行为对照"></a><figcaption>完整原 Table 3，CC BY 4.0；Base + Composer 测试时仍读取向量，LOPD 学生不读。</figcaption></figure><figure class="figure original reading-diagram"><a href="/lib/papers/latent-on-policy-self-distillation/figure-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-5.webp" width="3825" height="1275" alt="完整原Figure5所有五个容量和检索数量面板"></a><figcaption>完整原 Figure 5，CC BY 4.0；各点分别训练后测学生，不是同一学生测试时多检索。</figcaption></figure></details>

<h3 id="少于-30-指哪种成本">4.3 少于 30% 的是生成记录，不是总成本</h3>

<figure class="figure original curve-original"><a href="/lib/papers/latent-on-policy-self-distillation/figure-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-4.webp" width="1431" height="706" alt="原Figure4各方法1600条onpolicy生成的平均奖励曲线"></a><figcaption>原 Figure 4，CC BY 4.0；所有曲线都显示到 1,600 条生成记录，不是提前停止训练的账单。</figcaption></figure>

<p>LOPD 在 320 条时超过 .61，576 条到 .637；对照在 1,600 条末尾为 GRPO .611、Skill-SD .588。320/1,600=20% 是超过这两个对照末分的阈值点，576/1,600=36% 是达到 .637 的阈值点，后续训练仍在 .63 至 .64 附近。Figure 4 的对照末分与 Table 1 的 61.8 /59.1 略异，不能悄悄合成一个数。</p>

<p>经验收集、检索向量计算、初始化和 composer 反传还要花计算。论文没给完整 GPU 小时、总 token 或端到端费用，无法据此说“总训练成本降低 70%”。</p>

<h2 id="下一步：固定经验来源，隔离表示收益">5. Discussion：最需要隔离的是表示和资料的收益</h2>

<p><strong>下一组关键实验应使用完全相同的三条记录，只改变教师输入的表示。</strong>原文字、等长总结、固定向量、学习向量，控制教师、奖励、KL、训练步数与总 token。这才能区分“成功经验有效”“输入可训练有效”和“连续表示有效”。</p>

<p>还应分别测同题与跨题经验，并按任务族排除近重复。固定配置允许同题检索；训练时同题成功参考可以合法使用，但不能当成跨题通用做法的证据。替换经验里的参数或删掉关键步骤，直接测教师与学生如何变化，比把向量投影成词更能验证它用到了什么。</p>

<h2 id="结论与公开代码的实现差异">6. Conclusion：可训练的教师输入值得研究，复现条件仍不完整</h2>

<p><strong>算法最值得关注的，是把经验输入纳入训练，同时约束它不能只靠削弱教师来降损失。</strong>固定 composer、m=0、正 m 三组对照比单独的“96 个向量”更能解释价值。</p>

<p>固定代码 <code>50c3d7f5</code> 的核心训练流程可读，学生模型有链接；经验库、压缩模块权重、检索向量、精确训练/测试划分和完整日志仍缺。<code>MemoryBank.build_index()</code> 只编码任务 instruction，论文却编码任务加路径；自行运行这段建库代码不等于复现论文索引。上游任务可用，不意味着这些训练资产也已齐全。</p>

<details><summary>其余原图与附录：完整 Figure 6、经验条目、提示模板和配置</summary><figure class="figure original case-original"><a href="/lib/papers/latent-on-policy-self-distillation/figure-6.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/figure-6.webp" width="3060" height="2105" alt="完整原Figure6工具与代码两领域，当前任务、检索参考、32向量词表投影"></a><figcaption>完整原 Figure 6，CC BY 4.0。左上 Domain 字样在作者独立图文件中已有轻微越界，未修改证据。</figcaption></figure><p>代码例 <code>taco_00713</code> 是带硬币转移的循环淘汰，要输出幸存者与累计硬币；参考为普通 Josephus survivor，7 人每数到第 3 人淘汰，幸存者 4。只复制幸存者递推不够。右侧用 LM head（词表输出层）投影向量，显示多语言碎片；不可读不证明学会了算法或没有答案泄漏。论文未给两例的完整学生记录、概率与最终判分。</p><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-bank.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-bank.webp" width="1584" height="484" alt="原A3精简经验库条目，另一任务的动作与结果"></a><figcaption>原 A.3 经验条目，CC BY 4.0。保留动作与精简结果，不能假定当前环境已执行。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-agent-system.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-agent-system.webp" width="1584" height="416" alt="原A5工具任务system prompt"></a><figcaption>原 A.5 工具任务系统提示，CC BY 4.0；每步单工具，结束输出 Task Completed。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-code-system.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-code-system.webp" width="1584" height="192" alt="原A5代码任务system prompt"></a><figcaption>原 A.5 代码系统提示，CC BY 4.0；HumanEval+ / MBPP+ 不用此系统提示。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-agent-framing.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-agent-framing.webp" width="1584" height="392" alt="原A5工具向量前后包裹提示，强调独立参考会话"></a><figcaption>原 A.5 工具向量提示，CC BY 4.0；提醒当前任务还未执行。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-code-framing.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-code-framing.webp" width="1584" height="264" alt="原A5编程向量前后包裹提示"></a><figcaption>原 A.5 编程向量提示，CC BY 4.0。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-sdft.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-sdft.webp" width="1584" height="236" alt="原B1 SDFT示范注入格式"></a><figcaption>原 B.1 SDFT 文字示范，CC BY 4.0。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-opsd.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-opsd.webp" width="1584" height="328" alt="原B1 OPSD同题参考注入格式"></a><figcaption>原 B.1 OPSD 同题参考，CC BY 4.0。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/appendix-skill.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/appendix-skill.webp" width="1584" height="304" alt="原B1 SkillSD技巧文字注入格式"></a><figcaption>原 B.1 Skill-SD 总结，CC BY 4.0。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/table-4.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/table-4.webp" width="1092" height="584" alt="完整原Table4训练配置"></a><figcaption>完整原 Table 4，CC BY 4.0；环境步数与总 token 是两种上限。</figcaption></figure><figure class="figure original"><a href="/lib/papers/latent-on-policy-self-distillation/table-5.webp" target="_blank" rel="noopener"><img src="/lib/papers/latent-on-policy-self-distillation/table-5.webp" width="1240" height="352" alt="完整原Table5全部评测任务数量预算与采样"></a><figcaption>完整原 Table 5，CC BY 4.0；ACEBench 20 步，其他工具任务 30 步。</figcaption></figure></details>

<p class="source-note">重读 20 页正文与附录，核查全部 6 Figures、5 Tables、Algorithm 1 与八组重要附录图块。原图许可由 arXiv 条目确认，未用仓库许可替代；本文代码重放不涉及模型训练。个人兴趣程度 7/10，仅代表博客作者本人的兴趣。</p>
</div>

---
title: "[2026-08-18] LEGO-RL: Harness-Native Reinforcement Learning for Coding Agents"
permalink: "/posts/论文解读/lego-rl.html"
date: "2026-09-29T13:30:00+08:00"
updated: "2026-10-12T16:00:00+08:00"
cover: "/generated-covers/052-lego-rl.webp"
description: "LEGO-RL 保留 Claude Code 等编码助手原有的执行流程，记录模型实际生成的内容，再按隐藏测试结果训练模型。用真实进度条修复任务讲清生成记录、任务筛选、评分和训练更新，并区分验证集最高分与最后一次验证。"
wide_content: true
wide_toc: true
toc_depth: 2
hide_post_cover: true
deck_pages: 20
categories:
  - "论文解读"
tags:
  - "LLM Agent"
  - "Agent Harness"
  - "Codex"
  - "Reinforcement Learning"
  - "Claude Code"
  - "SWE-bench"
---

<style>
html:not([data-theme="dark"]) body:has(.lego-reading){--paper:#fff;--paper-elevated:#f5f6f7;--ink:#20252b;--ink-soft:#66717b;--line:rgba(32,37,43,.14);background:#fff}
.article-shell-deck{padding-top:2rem}.article-shell-deck .article-header{max-width:780px;margin-bottom:2.1rem}.article-shell-deck .article-header h1{max-width:28ch;margin:.72rem 0 1rem;font-family:var(--sans);font-weight:720;line-height:1.12}.article-shell-deck .article-deck{display:grid;grid-template-columns:1fr;gap:.85rem;padding-top:1rem}.article-shell-deck .article-stats{justify-content:flex-start;gap:2rem}
.lego-reading{--column:780px;--blue:#285d9b;--orange:#ad5735;--green:#2b7562;--red:#a0443d;--soft:var(--ink-soft);--surface:var(--paper-elevated);--line-local:var(--line);width:min(100%,var(--column));margin-inline:auto;color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.76;-webkit-font-smoothing:antialiased}.lego-reading>*{max-width:100%}.lego-reading p,.lego-reading li{text-wrap:pretty}.lego-reading .paper-meta{margin:0 0 7px;color:var(--soft);font:400 .8rem/1.55 var(--sans)}.lego-reading .source-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:.92rem}
.lego-reading .deck-wrap{margin:0 0 32px;border:1px solid var(--line-local);background:#1b2027}.lego-reading .deck-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;color:#f4f5f6;background:#1b2027}.lego-reading .deck-head strong{font-size:.92rem}.lego-reading .deck-head a{color:#fff;font-size:.82rem;white-space:nowrap}.lego-reading .post-deck-embed{width:100%!important;max-width:100%;margin:0!important;transform:none!important}.lego-reading .post-deck-embed-frame{border:0;border-radius:0;box-shadow:none}.lego-reading .post-deck-embed-note{margin:0!important;padding:9px 14px!important;color:#cfd5dc!important;background:#1b2027;border-top:1px solid #3b424b;font-size:.78rem!important}
.lego-reading .lead{margin:0 0 18px;font-size:1.08em;line-height:1.78}.lego-reading .interest{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:18px 0 22px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line-local));background:color-mix(in srgb,var(--blue) 5%,#fff)}.lego-reading .interest b{color:var(--blue);font:750 1.2rem/1 var(--mono)}.lego-reading .interest span{color:var(--soft);font-size:.84rem}
.lego-reading .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:22px 0 25px;border-block:1px solid var(--line-local)}.lego-reading .metric{min-height:103px;padding:16px 12px;border-right:1px solid var(--line-local)}.lego-reading .metric:last-child{border-right:0}.lego-reading .metric strong{display:block;color:var(--blue);font:680 clamp(1.27rem,3vw,1.72rem)/1 var(--serif)}.lego-reading .metric span{display:block;margin-top:9px;color:var(--soft);font:600 .76rem/1.45 var(--sans)}
.lego-reading .keypoints{margin:0 0 36px;padding:18px 22px;border-left:5px solid var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.lego-reading .keypoints h3{margin:0 0 8px;font-size:1rem}.lego-reading .keypoints ul{margin:0;padding-left:1.2rem}.lego-reading .keypoints li{margin:.42rem 0}.lego-reading .part0{margin:32px 0 42px;padding:20px 22px;border-top:4px solid var(--green);background:var(--surface)}.lego-reading .part0 h3{margin:0 0 11px;font-size:1.3rem}.lego-reading .kicker{display:block;margin-bottom:6px;color:var(--green);font:800 .7rem/1 var(--mono);letter-spacing:.1em}
.lego-reading h2{margin-top:3.55rem}.lego-reading h3{margin-top:2.1rem}.lego-reading h4{margin-top:1.7rem}.lego-reading strong{font-weight:750}.lego-reading .table-scroll,.lego-reading .code-scroll{width:100%;margin:21px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}.lego-reading .table-scroll table{display:table;width:100%;min-width:700px;margin:0;border-collapse:collapse;font:400 .875rem/1.52 var(--sans)}.lego-reading th,.lego-reading td{padding:9px 10px;border:1px solid var(--line-local);text-align:left;vertical-align:top}.lego-reading th{background:color-mix(in srgb,var(--blue) 7%,var(--surface))}.lego-reading td:first-child{font-weight:650}.lego-reading .code-scroll pre{min-width:700px;margin:0;padding:17px 18px;overflow:visible;border:1px solid var(--line-local);background:#1f252c;color:#e9edf1;font:400 .8rem/1.62 var(--mono);white-space:pre}.lego-reading code{font-size:.92em}
.lego-reading .figure{width:100%;margin:27px 0}.lego-reading .figure img{display:block;width:auto;max-width:100%;height:auto;margin-inline:auto;border:1px solid var(--line-local);background:#fff}.lego-reading .figure figcaption{max-width:720px;margin:8px auto 0;color:var(--soft);font-size:.82rem;line-height:1.55;text-align:left}.lego-reading .figure-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:26px 0}.lego-reading .figure-grid .figure{min-width:0;margin:0}.lego-reading .figure-grid .figure img{width:100%}
.lego-reading .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:22px 0;background:var(--line-local)}.lego-reading .role{padding:16px;background:#fff}.lego-reading .role b{display:block;margin-bottom:6px;color:var(--blue);font:750 .84rem/1.3 var(--mono)}.lego-reading .role span{display:block;color:var(--soft);font-size:.84rem;line-height:1.55}.lego-reading .flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin:22px 0;padding:0;background:var(--line-local);list-style:none}.lego-reading .flow li{min-height:132px;padding:12px;background:var(--surface)}.lego-reading .flow b{display:block;margin-bottom:7px;color:var(--blue);font:750 .72rem/1.3 var(--sans)}.lego-reading .flow span{display:block;color:var(--soft);font-size:.76rem;line-height:1.48}
.lego-reading .case{margin:25px 0;padding:20px;border-block:1px solid var(--line-local);background:color-mix(in srgb,var(--green) 4%,#fff)}.lego-reading .case h4{margin:0 0 8px;font-size:1.12rem}.lego-reading .case ol{padding-left:1.2rem}.lego-reading .case li{margin:.58rem 0}.lego-reading .verdict{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:16px;background:var(--line-local)}.lego-reading .verdict>div{padding:13px 15px;background:#fff;font-size:.86rem;line-height:1.55}.lego-reading .verdict strong{display:block;margin-bottom:4px}.lego-reading .verdict .pass strong{color:var(--green)}.lego-reading .verdict .fail strong{color:var(--red)}
.lego-reading .note{margin:22px 0;padding:15px 18px;border-left:4px solid var(--orange);background:color-mix(in srgb,var(--orange) 6%,var(--surface))}.lego-reading .note.blue{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 6%,var(--surface))}.lego-reading .note p{margin:.34em 0}.lego-reading .formula{margin:21px 0;padding:15px 18px;text-align:center;border-block:1px solid var(--line-local);font:600 .9rem/1.6 var(--mono);overflow-x:auto}.lego-reading .judge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:22px 0;background:var(--line-local)}.lego-reading .judge-grid>div{padding:16px;background:#fff}.lego-reading .judge-grid b{display:block;color:var(--blue);font-size:.93rem}.lego-reading .judge-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.82rem;line-height:1.5}.lego-reading .limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:var(--line-local)}.lego-reading .limit-grid>div{padding:17px;background:#fff}.lego-reading .limit-grid b{display:block;color:var(--orange);font-size:.9rem}.lego-reading .limit-grid span{display:block;margin-top:7px;color:var(--soft);font-size:.84rem;line-height:1.55}
@media(max-width:760px){.lego-reading .metrics{grid-template-columns:1fr 1fr}.lego-reading .metric:nth-child(2){border-right:0}.lego-reading .metric:nth-child(-n+2){border-bottom:1px solid var(--line-local)}.lego-reading .flow{grid-template-columns:1fr 1fr}.lego-reading .roles,.lego-reading .judge-grid{grid-template-columns:1fr}.lego-reading .figure-grid{grid-template-columns:1fr}.lego-reading .post-deck-embed-note{align-items:flex-start;flex-direction:column}}
@media(max-width:460px){.lego-reading .flow,.lego-reading .verdict,.lego-reading .limit-grid{grid-template-columns:1fr}.lego-reading .part0,.lego-reading .case{padding:17px 15px}.lego-reading .deck-head,.lego-reading .interest{align-items:flex-start;flex-direction:column}}
@media(min-width:1360px) and (max-width:1519.98px){.article-shell-wide.article-shell-wide-toc.article-shell-deck{--shell:min(1360px,calc(100vw - 32px))}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-grid{grid-template-columns:minmax(170px,1fr) minmax(0,980px) minmax(170px,1fr);gap:24px}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-rail{display:block}.article-shell-wide.article-shell-wide-toc.article-shell-deck .rail-sticky{width:min(100%,200px);margin-left:auto}.article-shell-wide.article-shell-wide-toc.article-shell-deck .article-toc-mobile{display:none}}
</style>

<div class="lego-reading">

<p class="paper-meta">Yiming Du et al. · arXiv:2608.17393v1 · 2026-08-18</p>
<div class="source-links">
  <a href="https://arxiv.org/abs/2608.17393">论文主页</a>
  <a href="https://arxiv.org/pdf/2608.17393">论文 PDF</a>
  <a href="https://github.com/LegoX/Lego-RL">官方代码</a>
  <a href="https://huggingface.co/datasets/Lego-X/Lego-RL-2699">2,699 题训练索引</a>
  <a href="https://github.com/openforis/pysepal/issues/813">案例原始需求</a>
  <a href="https://github.com/openforis/pysepal/pull/814">案例参考修复</a>
</div>

<section class="deck-wrap" aria-label="LEGO-RL 交互图解">
  <div class="deck-head"><strong>20 页交互图解 · 从实际修复到测试和训练</strong><a href="/lib/decks/lego-rl-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/lego-rl-visual-guide.html" title="LEGO-RL 论文图解，共 20 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">LEGO-RL 研究的是一个很具体的系统问题：Claude Code、OpenHands 或 OpenCode 会读仓库、改文件、跑命令、压缩历史，训练程序怎样准确知道模型生成了哪些 token（分词后的文本单元），并确认最终分数来自真正修复？论文在模型 API 边界记录生成，在独立环境里运行和测试项目，再用这些记录更新模型。它的重点不只是提高分数，还要防止“记录错了生成内容”或“测试被绕过”产生错误梯度。</p>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 读这篇论文前，需要先分清四个概念

Harness 是包在模型外面的运行系统。Claude Code 会构造上下文、声明工具、解释工具调用、执行命令，也可能压缩或改写历史。Harness-native RL 的意思是保留这些行为，让训练中的执行过程与部署时一致。Rollout（执行记录）是一次任务里模型生成、工具操作和环境返回的完整过程；policy 是正在训练的模型，trainer 是更新模型参数的程序。

GSPO 是本文采用的强化学习更新方法。对同一任务生成八条执行记录，verifier（测试程序）给每条 0 或 1 分，再计算 advantage，即这条记录比同组平均表现好多少。以下公式针对八条都有效的情况；环境故障记录不参与同组均值和标准差：

<div class="formula">Â_i = (r_i − mean(r_1:G)) / (std(r_1:G) + 10^-6), &nbsp; G = 8</div>

如果八条全错或全对，八个 advantage 都是 0，本次训练无法分出哪些行为值得鼓励。因此任务除了能测试，还要让当前模型既可能成功，也可能失败。具体概率比与参数更新放在方法部分。

Rollout-training alignment 是生成与训练记录的核对：相同模型权重下，训练程序重新计算的 token 对数概率（log-prob）应接近生成时记录的值。Qwen3.5-35B-A3B 采用 MoE（Mixture of Experts，混合专家）结构，每个 token 只经过选中的部分子网络。Routing replay 保存生成时的专家选择，重算时沿用同一路径，避免概率变化只是因为换了子网络。
</aside>

<div class="interest"><b>作者兴趣度 9.5 / 10</b><span>和 Claude Code、Codex 这类完整 harness 的 RL 训练直接相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>64.0 → 70.4</strong><span>OpenHands SDK · 初始／验证最高分 %</span></div>
  <div class="metric"><strong>62.4 → 68.2</strong><span>Claude Code · 初始／验证最高分 %</span></div>
  <div class="metric"><strong>57.2 → 66.6</strong><span>OpenCode · 初始／验证最高分 %</span></div>
  <div class="metric"><strong>&gt; 0.99</strong><span>生成与训练概率的相关系数</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>LEGO-RL 保留每个代码 Agent 的原有执行流程。</strong>Claude Code 不需要改写成训练器自己管理的调用循环；代理在模型 API 处保存原始生成。</li>
    <li><strong>最终分必须来自 Agent 真正完成的修改。</strong>测试、gold patch 和 grader 在 Agent 阶段不可见；设施故障记录也不参与参数更新。</li>
    <li><strong>训练任务是否有用取决于当前模型。</strong>同题八次尝试全错或全对时，组内相对得分都是 0。</li>
    <li><strong>三种 harness 各只有一次主要训练。</strong>结果方向一致，但论文没有给出重复训练的方差。</li>
  </ul>
</aside>


<h2 id="完整执行程序为什么会破坏普通-RL-的数据假设？">1. Motivation：完整执行程序为什么会破坏普通 RL 的数据假设？</h2>

**训练框架通常希望自己控制 token 序列，完整 harness 却会主动管理上下文和工具交互。** 一次 Claude Code 执行可能包含多轮模型调用、终端输出、文件改动、工具格式、历史压缩和 SDK 消息重排。训练器若结束后再从完整文本编码，token 编号、生成位置标记或上下文边界，可能已经与实际生成时不同。

这个差异会直接破坏强化学习更新所用的概率比。分母如果对应另一串 token，或者 MoE 专家选择已经变化，优化目标就失去原来的统计含义。论文的要求很直接：在相同权重上，训练器对原始生成 token 重算的对数概率，应接近模型服务端记录的值。

第二个问题来自评分。代码 Agent 通常只得到任务结束后的 0/1 验收分。论文在系统开发期间看到过六类污染：

<div class="table-scroll">
<table>
  <thead><tr><th>失败方式</th><th>部署防护前出现比例</th><th>LEGO-RL 的处理</th></tr></thead>
  <tbody>
    <tr><td>读取 git history</td><td>4.6% 至 20.5%</td><td>Agent 执行时只保留一个基线提交，验收前恢复历史</td></tr>
    <tr><td>下载公开参考修复</td><td>1.9%</td><td>按执行与验收阶段设置出网防火墙</td></tr>
    <tr><td>修改 tests</td><td>2.4% 至 19.4%</td><td>验收时才放入测试文件，并恢复被修改的测试路径</td></tr>
    <tr><td>评分器意外应用参考修复</td><td>2.5%</td><td>审计并剔除受影响任务，运行时检测明显异常得分</td></tr>
    <tr><td>评分器依赖网络</td><td>未单独量化</td><td>把验收时依赖打包进环境</td></tr>
    <tr><td>仓库构建不完整</td><td>未单独量化</td><td>封闭构建、失败立即退出；报告初始化失败，不记为模型得 0</td></tr>
  </tbody>
</table>
</div>

**LEGO-RL 要同时准确记录生成、确保验收分数可信。** 前者回答“更新是否针对模型实际生成的内容”，后者回答“1 分是不是 Agent 真的修好了任务”。

<h2 id="与现有-Agent-RL-框架的区别">2. Related Work：与现有 Agent RL 框架的区别</h2>

**与 LEGO-RL 最接近的路线选择在模型 API 边界接入现成 harness。** 论文把相关工作分成几类。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>任务执行由谁控制</th><th>强项</th><th>与 LEGO-RL 的区别</th></tr></thead>
  <tbody>
    <tr><td>verl、slime、MOLT、SkyRL、AReaL</td><td>训练框架内部循环或规定接口</td><td>生成与参数更新靠得近，容易做异步与大规模训练</td><td>现成代码 Agent 往往要改成训练框架规定的交互方式</td></tr>
    <tr><td>ALE：ROLL + ROCK + iFlow</td><td>训练器、隔离环境和命令行 Agent 协同设计</td><td>整栈一致性</td><td>通过共同控制全部运行层获得一致性，目标并非兼容任意现成 harness</td></tr>
    <tr><td>Agent Lightning</td><td>现有 Agent 增加 SDK 回调</td><td>能接多种 Agent 系统</td><td>论文 Table 1 没有报告历史核对、专家路由重放与评分防作弊</td></tr>
    <tr><td>Polar、rLLM、OpenForgeRL</td><td>在模型 API 处观察原部署程序</td><td>保留既有 Agent 执行流程</td><td>与 LEGO-RL 最接近；各自对专家选择重放、隔离环境、运行管理与诊断记录的覆盖不同</td></tr>
    <tr><td><strong>LEGO-RL</strong></td><td>Claude Code、OpenHands、OpenCode 原有循环</td><td>原始 token 保存、专家选择重放、Harbor 验收、诊断界面与运行管理</td><td>贡献在完整系统组合；论文没有声称每项组件都是第一次提出</td></tr>
  </tbody>
</table>
</div>

论文也和 SWE-RL、DeepSWE、LongContext 一类工作区分开来。SWE-RL 不执行工具交互；其他工作常在框架自有循环中训练。LEGO-RL 关注的是部署时会真实使用的 harness 是否也能原样参与训练。

这里要保留一个证据边界：Table 1 的功能勾选由 LEGO-RL 作者整理，本文没有逐个复现十个框架。它适合说明设计空间，不能当成独立 benchmark 排名。

<h2 id="从一次修复到参数更新：记录、测试与筛选">3. Method：从一次修复到参数更新：记录、测试与筛选</h2>

**论文要求只训练模型实际生成的 token，不把用户消息和工具输出当成模型行为；公开代码的异常回退路径还需要单独审查。**

<h3 id="3-1-一次任务执行的数据流">3.1 一次任务执行的数据流</h3>

<figure class="figure">
  <a href="/lib/papers/lego-rl/figure-1-infrastructure.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-1-infrastructure.webp" alt="LEGO-RL 训练基础设施" width="1800" height="1061"></a>
  <figcaption>原论文 Figure 1。原部署程序在独立隔离环境运行；进程内代理保存真实生成；验收分数和执行记录放入缓冲区，再由训练器更新模型。论文按 CC0 发布。</figcaption>
</figure>

每个任务 <code>x = (q_x, R_x, V_x)</code> 包含问题描述、初始化仓库和对应测试程序。Harness 构造本轮上下文，模型生成回答或工具调用，harness 执行操作并改变仓库。

Proxy 是放在模型 API 前、转发请求并保存生成记录的代理程序。它需要处理一个麻烦细节：harness 可能在下一轮请求里重新序列化旧消息。官方实现 revision <code>a3e28f171be165b5e8cda45030f336ec103690a7</code> 直接把 proxy 捕获的 token、生成位置标记、对数概率和专家选择放进 <code>AgentLoopOutput</code>：

<div class="code-scroll"><pre><code class="language-python">prompt_ids = traj_acc[:prompt_token_len]
response_ids = traj_acc[prompt_token_len:]
response_mask = tail_mask
response_logprobs = tail_lp
response_routing = (
    tail_routing if len(tail_routing) == len(tail_mask) else []
)&#10;
output = AgentLoopOutput(
    prompt_ids=prompt_ids,
    response_ids=response_ids[:self.response_length],
    response_mask=response_mask[:self.response_length],
    response_logprobs=response_logprobs[:self.response_length],
    routed_experts=self._build_routed_experts(
        prompt_ids, response_routing[:self.response_length]
    ),
    reward_score=reward_score,
)</code></pre></div>

这段代码来自官方仓库，不是重构伪代码。实现还分别记录超时、环境初始化失败、达到轮数上限和上下文溢出，再决定哪些记录能参与训练。

**正常路径和异常回退不能混说。** 论文 §3.2.2、§4.4 称不能可靠对齐的历史会被排除；但固定版本 <code>a3e28f1</code> 的 <code>_compute_prompt_ids</code> 遇到历史不再延续旧消息、或工具定义变化时，会逐消息重新编码。它保留与原记录完全相同的前缀及其概率，但重建后的 assistant 段仍标为模型生成，不能恢复的概率先填 0。官方启动脚本默认设置 <code>HARBOR_RECOMPUTE_MISMATCH_LOGPROBS=0</code>，关闭重算；如果绕过脚本、没有设置环境变量，Python 模块本身却默认开启。即使开启，重算失败的位置也可以保留 0。这条分支不必然禁用整条训练记录。<code>builtin_swe_agent_loop.py</code> 后续检查长度和禁用标记，并不逐项验证这些概率是原始采样值。因此，本文介绍的是论文的严格要求与公开实现的正常路径，**不能保证公开版本所有回退记录都满足“原始 token、原始概率”的条件**。

工具调用的匹配也有版本差异：论文说按调用 ID 和函数名关联，代码有 ID 时只核对 ID，允许 Claude Code 把 <code>Task</code> 改名为 <code>Agent</code>；无 ID 才用名称。子 Agent 的请求会进入独立、不收集训练 token 的会话。真实多模态请求则关闭这版 proxy 的 token 轨迹收集，不能把本文的代码训练结果直接推广到图像／视频输入训练。

<h3 id="3-2-一批记录怎样通过-GSPO-更新模型？">3.2 一批记录怎样通过 GSPO 更新模型？</h3>

论文规定一轮更新按以下顺序进行：挑任务，用当前生成模型各跑八次；任务结束后运行隐藏测试；排除环境初始化失败、实际耗时超限和不能对齐生成内容的记录；仅用有效记录计算组内相对得分；训练程序重算同一批生成 token 的概率，再做 GSPO 更新，最后把新权重发回生成服务器。达到工具交互轮数或生成长度上限但记录有效的尝试仍保留测试结果，不一律当成设施故障。公开代码并未在所有历史重建分支严格执行上述排除规则，差别见前一节。

公开实现还解决了一个细节：异常记录可以保留在批张量中，但不能拉低同题其他记录的平均分。<code>patches/verl_sao_7aed6b23.patch</code> 中的过滤器先清零异常记录的 reward，再给它独立的组 ID，使它脱离原组的统计；计算 advantage 后再清零它的训练贡献。**只把这条记录的 loss 乘零，仍不足以保护同组其他记录。**

GSPO 不是对每个 token 独立算一个概率比。它先把一条执行记录里**所有模型生成 token** 的对数概率差取平均，再指数化：

<div class="formula">σ_i = exp(mean_(j ∈ M_i)[log p_θ(token_j | context_j) − log p_old(token_j | context_j)])</div>

这里 <code>M_i</code> 只含真实模型生成的位置；<code>old</code> 是生成这组记录时的模型版本。论文 Equation 1 对 <code>σ_i × Â_i</code> 使用上下界裁剪，再乘有效性开关 <code>w_i ∈ {0,1}</code>。好于组平均的记录被提高概率，差于组平均的被降低，裁剪限制单次改变幅度。原文允许上调幅度比下调更大；这不是本文新提出的算法。

例如八条里四条通过、四条失败，组平均为 0.5，成功与失败的 advantage 正负相反；若按总体标准差 0.5 计算，约为 +1 和 −1。这是公式说明例，不是作者发布的八条轨迹。同题全对或全错则全为 0，也解释了为什么后面要筛任务难度。

**历史重写与异步旧权重是两种问题。** 前者需要核对生成内容；论文要求无法对齐的内容排除，公开实现的重建回退仍有前述缺口。后者指训练已更新，但某些慢任务仍由旧权重生成，论文用生成版本对应的概率比处理受限的版本滞后。不能把 token 对齐错误当成正常异步差异。

<h3 id="3-3-训练任务从-36-884-条缩到-2-699-条">3.3 训练任务从 36,884 条缩到 2,699 条</h3>

任务来自 OpenSWE 候选任务集合。作者先做规则过滤：

<ol class="flow">
  <li><b>36,884</b><span>来自 OpenSWE 的候选题</span></li>
  <li><b>22,806</b><span>通过基本有效性、仓库多样性和粗略复杂度筛选</span></li>
  <li><b>21,681</b><span>能构建且验收程序能运行</span></li>
  <li><b>4 rollouts</b><span>Qwen3.6-27B + OpenHands SDK</span></li>
  <li><b>1-3 / 4</b><span>保留既不全错也不全对的任务</span></li>
  <li><b>2,699</b><span>最终训练 index</span></li>
</ol>

训练集与 SWE-bench Verified 在仓库与任务两层都不重叠。难度筛选只使用一种模型与执行程序组合，可能偏向该组合擅长的任务。作者随后在 Claude Code 和 OpenCode 上也获得提升，说明这批任务可以迁移；现有实验没有证明三种执行程序都适合完全相同的训练任务分布。

官方 <code>utils/create_task_index.py</code> 也说明了 index 的性质。Parquet 行里的 prompt 只是路径占位符，真实问题说明在 Harbor 任务的 <code>instruction.md</code> 中：

<div class="code-scroll"><pre><code class="language-python">return {
    "prompt": [{"role": "user", "content": str(path)}],
    "reward_model": {"style": "rule", "ground_truth": None},
    "extra_info": {
        "harbor_task_path": str(path.resolve()),
        "instance_id": path.name,
        "data_source": "harbor",
    },
}</code></pre></div>

<h3 id="3-4-真实任务：12rambau-sepal-ui-814">3.4 真实任务：<code>12rambau__sepal_ui-814</code></h3>

这道任务来自 openforis/pysepal 的 issue #813 和 PR #814。原始需求由项目维护者提出：第一次调用 <code>alert.update_progress(0, total=10)</code> 后，循环内应该只写 <code>alert.update_progress(i)</code>，不必每次重复传 <code>total</code>。

这里的参考修复和测试是上游维护者 Pierrick Rambaud 在 PR #814 中写的。OpenSWE 将需求、基线版本、修复补丁和测试列表组织成训练任务，LEGO-RL 再打包为 Harbor 任务；论文没有声称这段测试由训练中的 Agent 编写，也没有披露为本案例另做人工标注的过程。

<div class="case">
<h4>从公开需求到测试程序给分</h4>
<ol>
  <li><strong>上游来源：</strong>issue #813 给出可运行示例；PR #814 的公开修复补丁修改 <code>alert.py</code>，并把 <code>test_update_progress</code> 改为先以 0/100 初始化，再调用 <code>update_progress(50)</code>。</li>
  <li><strong>OpenSWE 任务记录：</strong>作者保存 base commit <code>6d825ae167f96ad2e7b76b96ca07de562f74dcf0</code>、问题描述、gold patch、test patch、<code>FAIL_TO_PASS</code> 和 <code>PASS_TO_PASS</code>。</li>
  <li><strong>Agent 可见状态：</strong>Harbor 初始化仓库，只把问题说明交给 Agent。Agent 可以读写源代码、运行公开命令，但看不到参考修复、隐藏测试补丁、测试清单与评分器；出网防火墙阻止它下载公开 PR。</li>
  <li><strong>Agent 输出：</strong>Agent 修改工作树。论文没有公开这道题的实际训练日志，因此本文不编造它具体读过哪些文件或用了哪条 shell 命令。</li>
  <li><strong>验收准备：</strong>Agent 结束后，宿主程序才把 <code>tests/test.patch</code>、<code>parser.py</code> 和含原始记录的 <code>config.json</code> 放入隔离环境。<code>test.sh</code> 重置测试、应用隐藏测试补丁、运行 pytest 并解析结果。</li>
  <li><strong>PASS：</strong><code>tests/test_sepalwidgets/test_Alert.py::test_update_progress</code> 必须从失败变通过，所有 <code>PASS_TO_PASS</code> 也必须继续通过。否则分数为 0；全部满足才是 1。</li>
</ol>
</div>

一个具体失败可以直接从公开补丁解释。先以 <code>total=100</code> 初始化，再调用 <code>update_progress(50)</code>：旧实现每次都从本次参数取 <code>total</code>，省略参数就回到默认值 1，因此会抛出“50 不在 0 到 1 之间”的 <code>ValueError</code>。PR #814 改为在进度条已存在时读 <code>self.progress_bar.total</code>；更新后 <code>n=50</code> 且进度条可见，才满足上游测试。调用 <code>reset()</code> 后则重新接受初始化参数。这是按公开代码推导的失败路径，**不是作者发布的某条模型执行日志**。

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-15-raw-instance.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-15-raw-instance.webp" alt="sepal_ui-814 原始任务记录" width="1080" height="440"></a><figcaption>原论文 Figure 15。原始记录包含参考修复与隐藏测试补丁和测试列表，但图中长字段已截断。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-16-harbor-task.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-16-harbor-task.webp" alt="sepal_ui-814 Harbor task" width="1090" height="545"></a><figcaption>原论文 Figure 16。宿主侧任务包的 tests 目录不会在 Agent 阶段出现。</figcaption></figure>
</div>

<figure class="figure">
  <a href="/lib/papers/lego-rl/figure-17-task-index.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-17-task-index.webp" alt="LEGO-RL task index row" width="1090" height="240"></a>
  <figcaption>原论文 Figure 17。训练索引只保存 Harbor 任务路径，不把任务全文复制进训练表。</figcaption>
</figure>

论文和官方 GitHub 仓库 revision <code>a3e28f1</code> 没有公开这条 instance 的完整 Harbor 任务目录；Figures 15-16 也明确标注长字段被截断。本文可以核验上游 issue、公开参考修复与总体验收协议，无法逐行审计作者实际使用的 <code>test.sh</code> 与完整 <code>PASS_TO_PASS</code> 清单。

<h2 id="实验设置、概率核对与失败诊断">4. Experiments：实验设置、概率核对与失败诊断</h2>

**三种执行程序分别训练后都提高了成功率；轨迹概率、测试隔离和失败筛选决定这些更新是否可信。**

<h3 id="4-1-主实验控制">4.1 主实验控制</h3>

三次主要训练都从 Qwen3.5-35B-A3B 开始，使用 GSPO、每批 64 题、每题 8 次尝试、训练 3 遍（126 步）。输入预算 30k token，生成预算 170k，两部分分别截断，不能互相挪用额度；训练时采样温度 1.0，验证时 0.7。每个 harness 单独训练一次，验证集固定为 SWE-bench Verified 500 道题，每题一次尝试、最多 200 轮交互。

Table 10 还规定学习率为 <code>10^-6</code>、梯度范数上限为 1.0、序列概率比的下／上裁剪幅度为 <code>3×10^-4 / 4×10^-4</code>。与参考模型的 KL 惩罚系数为 <code>10^-3</code>，只进入 loss，不改 verifier 的 0/1 分。主实验关闭额外的 importance-sampling correction（生成与训练概率出现偏差时使用的辅助修正），但保留前文 GSPO 本身的概率比；不能把两者混为一个开关。

<div class="table-scroll">
<table>
  <thead><tr><th>Harness</th><th>初始 Qwen3.5</th><th>验证最高分</th><th>增益（百分点）</th><th>同协议 KAT-Coder</th></tr></thead>
  <tbody>
    <tr><td>OpenHands SDK</td><td>64.0%</td><td><strong>70.4%</strong></td><td>+6.4</td><td>67.0%</td></tr>
    <tr><td>Claude Code</td><td>62.4%</td><td><strong>68.2%</strong></td><td>+5.8</td><td>66.8%</td></tr>
    <tr><td>OpenCode</td><td>57.2%</td><td><strong>66.6%</strong></td><td>+9.4</td><td>64.8%</td></tr>
  </tbody>
</table>
</div>

<figure class="figure">
  <a href="/lib/papers/lego-rl/figure-3-training-curves.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-3-training-curves.webp" alt="三种 harness 的训练与验证曲线" width="1387" height="821"></a>
  <figcaption>原论文 Figure 3。三条曲线的验证最高分分别为 70.4%、68.2%、66.6%，不是最后一次验证的分数。初始分数不同，表中比较各自训练前后；回复长度也随训练增长。</figcaption>
</figure>

**主表报告验证最高分，不能写成最终 checkpoint 的固定表现。** 在 500 题分母下，70.4%、68.2%、66.6% 分别相当于 352、341、333 题通过。Appendix D 分析 OpenHands 的首尾两次验证时给的是 63.8% 和 68.6%；这组首尾分析和主表的初始／最高分不能混写。论文没有充分说明其中初始值 63.8% 与主表 64.0% 相差一题的原因。

每个主要配置只有一次训练。三次训练的最高分都超过各自起点，也超过作者在同协议下重测的 Qwen3.6-35B-A3B 和 KAT-Coder-V2.5-Dev，但不能给出重复训练的波动。KAT 的对照也说明收益依赖 harness：它在 Claude Code 比 Qwen3.6 高 3.4 个百分点，在 OpenHands 却低 0.4 个百分点。不能把一个执行程序下的提升自动推广到另一个。

<h3 id="4-2-概率核对：更新依据是否对应原始生成？">4.2 概率核对：更新依据是否对应原始生成？</h3>

<div class="table-scroll">
<table>
  <thead><tr><th>Harness</th><th>Median Pearson r</th><th>KL ×10^-3</th><th>p99 |Δ mean log p| ×10^-3</th></tr></thead>
  <tbody><tr><td>OpenHands SDK</td><td>0.9993</td><td>0.75</td><td>2.1</td></tr><tr><td>Claude Code</td><td>0.9980</td><td>1.35</td><td>2.7</td></tr><tr><td>OpenCode</td><td>0.9993</td><td>0.60</td><td>2.0</td></tr></tbody>
</table>
</div>

Pearson r 衡量生成端和训练端对同一批 token 计算的对数概率是否同步变化，越接近 1 越一致；KL 和对数概率绝对差补查“高度相关、但数值仍偏移”的情况。表中的 p99 是一条执行记录内平均差值的第 99 百分位，最后再对训练步取中位数，不是单个 token 的最大误差。

每步训练的 Pearson 都不低于 0.989。专家选择重放的负对照更有说服力：关闭 replay 时 Pearson 为 0.9946；正确对齐后是 0.9993；把每个 token 的专家路径故意错一位后跌到 0.7503。机制“在运行”不够，token 与专家路径必须逐位置匹配。

Appendix B 还记录过另一种故障：缓冲区太小，长记录中只有 24% 的专家选择被保存。修正后两次生产运行的覆盖率超过 99.8%；仍缺少路由记录的极长位置允许模型重新选择专家，不会硬塞一条错误路径。因此高相关系数不等于每个 token 都有完整的专家记录。

<h3 id="4-3-哪些任务和执行记录能提供有效训练信号？">4.3 哪些任务和执行记录能提供有效训练信号？</h3>

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-4-termination.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-4-termination.webp" alt="Trajectory termination profiles" width="1476" height="460"></a><figcaption>原论文 Figure 4。被排除的执行记录：Claude Code 7.1%，OpenHands SDK 2.4%，OpenCode 6.4%。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-5-reward-distributions.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-5-reward-distributions.webp" alt="同题八次尝试的得分分布" width="1373" height="982"></a><figcaption>原论文 Figure 5。同题八次全错（0/8）或全对（8/8），都没有组内相对学习信号。</figcaption></figure>
</div>

<figure class="figure">
  <a href="/lib/papers/lego-rl/figure-6-task-selection.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-6-task-selection.webp" alt="Task selection ablation" width="1376" height="383"></a>
  <figcaption>原论文 Figure 6。四组各有 951 题：完整难度段（四次筛选通过 1 至 3 次）、偏易半段（2 至 3 次）、偏难半段（1 至 2 次）、未做难度筛选的随机组。预热后平均验证分依次为 0.671、0.670、0.640，随机组没有净改善。</figcaption>
</figure>

未筛选随机组在四次难度估计中有 72.7% 的任务从未解出，13.4% 总能解出，两类都难以提供组内差异。还要注意这里的评测分母：四组生成并发不同，设施故障曾被记成失败，作者在 Figure 6 中改为只除以实际执行的验证题数，修正幅度为 0.6 至 5.2 个百分点。图中 0.671 不能直接当成前面固定 500 题分母的主实验成绩；也不能把并发差异视为已被完全控制。

<h3 id="4-4-监控发现：模型不再真正调用工具">4.4 监控发现：模型不再真正调用工具</h3>

论文附录给出一个训练崩溃案例。模型是 Qwen3-30B-A3B，harness 是 OpenHands SDK，任务集合有 449 道题。29 步记录内，训练分从 0.351 降到 0.050，验证分从 0.230 降到 0.014，平均动作数从 18.9 降到 0.96。Agent 后期几乎不再真正调用工具，而是把 shell 命令写进回答中的代码块，环境并不会执行它们。

Figure 7(b) 的 <code>mean turns &lt; 3</code> 在 step 22 触发，可以比等到训练终止更早报警。这里原文两处并不完全一致：§4.5 笼统说提前 8 步，Appendix C 明确将“提前 8 步”对应到 step 21 的概率一致性低于 0.95。本文不把这两个条件合成同一个阈值；它们也只在这次诊断案例上得到检查，跨任务是否有效尚未知。

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-7-live-diagnosis.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-7-live-diagnosis.webp" alt="Live UI failure diagnosis" width="1382" height="510"></a><figcaption>原论文 Figure 7。左侧环境故障运行与右侧训练崩溃运行是两个不同诊断案例。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-8-live-behavior.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-8-live-behavior.webp" alt="Live UI behavioral analysis" width="1385" height="485"></a><figcaption>原论文 Figure 8。Claude Code 主训练中每题八次尝试的工具记录与逐题成功率变化。</figcaption></figure>
</div>

<h3 id="4-5-训练后的行为和系统代价">4.5 训练后的行为和系统代价</h3>

在 OpenHands SDK 主训练首尾各 420 条执行记录上，修改后重新读文件从 73.6% 增到 98.1%，运行测试从 85.0% 增到 93.6%，首次修改前检查的文件数从 3.45 增到 6.92，格式错误的工具调用从 1.07% 降到 0.15%。出错后仍解决任务的比例只从 63.9% 增到 66.8%，变化较小。

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-11-reasoning-share.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-11-reasoning-share.webp" alt="Reasoning share over training" width="1467" height="482"></a><figcaption>原论文 Figure 11。推理文字比例上升说明执行记录组成改变，不能单独证明它导致成功。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-12-behaviors.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-12-behaviors.webp" alt="Behavior changes before and after training" width="1469" height="652"></a><figcaption>原论文 Figure 12。工具使用分布与具体行为变化。</figcaption></figure>
</div>

3,699 次 OpenHands SDK 尝试中，Agent 执行平均占 840.5 / 920.4 秒，也就是 91.3%。相同 7.5 小时内，同步训练完成 3 步、异步完成 7 步；论文按测得的每步耗时报告 2.5×，不是直接用 7/3 计算。同步组每训练一个 token 的参数更新耗时又是异步组的 2.1 倍；作者修正这项 GPU 吞吐差异后，估计每步约 1.9 小时对 1.0 小时。**1.9× 是校正估计，不是另一次完全匹配硬件的实测。**

容器优化也有代价。Nydus（按需下载镜像数据块的组件）把 100 次启动的网络传输降到 1.59GB，但首次读取缺失数据块的吞吐低于完整拉取镜像；热启动时收益基本消失。Table 5 中把评分依赖预打包后的验收反而为 3.81 秒，未打包为 2.72 秒，作者保留这项措施是为稳定评分，不是为提速。

<div class="figure-grid">
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-9-schedule.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-9-schedule.webp" alt="Synchronous and asynchronous schedule" width="953" height="314"></a><figcaption>原论文 Figure 9。异步执行允许新任务不必等待上一批最慢的执行记录。</figcaption></figure>
  <figure class="figure"><a href="/lib/papers/lego-rl/figure-10-nydus.webp" target="_blank" rel="noopener" aria-label="打开原尺寸图"><img src="/lib/papers/lego-rl/figure-10-nydus.webp" alt="Nydus and OCI image delivery" width="1469" height="509"></a><figcaption>原论文 Figure 10。100 个容器镜像上，网络传输 21.6GB→1.59GB，磁盘写入 65.6GB→5.29GB。</figcaption></figure>
</div>

开头的交互图解还收录了 Figures 13-14 的任务网格与诊断面板。本文保留论文全部 17 幅图；10 张表的处理方式另有来源记录，正文只展开与方法和结果有关的部分。

<h2 id="可复用的训练规则与后续对照">5. Discussion：可复用的训练规则与后续对照</h2>

**可复用的部分，是对生成记录、测试结果和任务难度分别做检查。**

第一，准确记录原始生成。Harness 可以压缩历史，但训练系统必须保存生成时的 token ID、哪些位置由模型生成、对数概率和专家选择。最终聊天文本不足以重建这些信息。

第二，测试确实评判 Agent 的修改。Agent 可以看问题和仓库，但不能看参考补丁、隐藏测试或评分程序，也不能通过外网下载答案。环境错误要单独统计，不能一律当成模型没修好。

第三，区分任务有效和训练有用。能构建、能评分的任务，仍可能因为当前模型八次全错或全对而无法产生组内比较信号。

后续值得补做：同一模型在多种 harness 中联合训练，与分别训练做等预算对照；按近期成功率动态调整任务采样；逐项去掉防作弊措施检验贡献；重复至少三次训练估计波动；在 token 覆盖、专家路径或概率差异常时停止更新，而不是继续用不可信记录训练。

<h2 id="已有结果与复现限制">6. Conclusion：已有结果与复现限制</h2>

**三套完整编码助手在保留原本执行流程的训练中，都提高了 SWE-bench Verified 验证最高分。** 原始 token 核对、专家路径负对照、评分审计、任务筛选消融与系统性能记录，让读者能检查分数之外的训练过程；公开版本的历史重建缺口仍需单独处理。

<div class="limit-grid">
  <div><b>观察到的提升</b><span>Qwen3.5-35B-A3B 在三种 harness 中的验证最高分比各自起点高 6.4、5.8、9.4 个百分点。</span></div>
  <div><b>训练方差未知</b><span>每个主要配置只有一次训练。三条正向曲线是有价值的证据，但不是重复实验。</span></div>
  <div><b>难度只用一种组合估计</b><span>2,699 道题由 Qwen3.6-27B + OpenHands SDK 每题四次尝试选出。</span></div>
  <div><b>案例验收实现披露不完整</b><span>论文只展示截断记录与目录；官方 GitHub revision a3e28f1 未包含 sepal_ui-814 的完整 Harbor task。</span></div>
  <div><b>论文与公开回退路径不同</b><span>论文要求排除对不齐的历史；a3e28f1 的重建分支可能保留重新编码的 assistant 段和占位概率。多模态请求也不收集这版训练 token。</span></div>
  <div><b>行为分析不是因果实验</b><span>更多重读、测试与推理文字与分数同时变化，论文没有干预单个行为后测因果贡献。</span></div>
  <div><b>异步提速有校正项</b><span>2.5× 是实测实际耗时对比；参数更新吞吐率修正后约 1.9×，两组并非完全相同条件。</span></div>
</div>

**LEGO-RL 最值得复用的是对训练数据来源的逐层检查。** 正常路径记录模型实际生成的 token 和专家选择，隔离规则保护参考补丁与测试，诊断工具再检查概率和得分。研究 Claude Code、Codex 这类完整助手的训练时，这些检查能帮助识别错误更新；它们并不自动消除公开回退路径或一次训练结果的局限。

</div>

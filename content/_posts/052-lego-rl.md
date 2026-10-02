---
title: "[2026-08-18] LEGO-RL: Harness-Native Reinforcement Learning for Coding Agents"
permalink: "/posts/论文解读/lego-rl.html"
date: "2026-09-29T13:30:00+08:00"
updated: "2026-09-29T13:30:00+08:00"
cover: "/generated-covers/052-lego-rl.webp"
description: "从真实 sepal_ui-814 case 出发，拆解 LEGO-RL 如何让 Claude Code、OpenHands 与 OpenCode 保留原生 control flow，同时把 token 对齐、MoE routing replay、隐藏 verifier、任务筛选和异步训练接成可信的 RL 闭环。"
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
  <a href="https://huggingface.co/datasets/Lego-X/Lego-RL-2699">2,699-task index</a>
  <a href="https://github.com/openforis/pysepal/issues/813">case 原始 issue</a>
  <a href="https://github.com/openforis/pysepal/pull/814">case 原始 PR</a>
</div>

<section class="deck-wrap" aria-label="LEGO-RL 交互图解">
  <div class="deck-head"><strong>20 页交互图解 · 从 GSPO 到真实 sepal_ui verifier</strong><a href="/lib/decks/lego-rl-visual-guide.html">大屏阅读 ↗</a></div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame"><iframe src="/lib/decks/lego-rl-visual-guide.html" title="LEGO-RL 论文图解，共 20 页" allow="fullscreen" loading="eager"></iframe></div>
    <p class="post-deck-embed-note"><span>使用按钮或 ← → 翻页，F 进入或退出全屏</span><span>独立打开后可随时点“返回文章”</span></p>
  </div>
</section>

<p class="lead">LEGO-RL 研究的是一个很具体的系统问题：Claude Code、OpenHands 或 OpenCode 会读仓库、改文件、跑命令、压缩历史，policy-gradient trainer 怎样从这类长轨迹中拿到可信的 token 和 reward？论文把 model-API proxy、Harbor sandbox、隐藏 verifier、MoE routing replay、任务筛选和 Live UI 接成一条链，让“一次修复得到 1 分”可以对应到“这批 token 应该被上调”。</p>

<div class="interest"><b>作者兴趣度 9.5 / 10</b><span>和 Claude Code、Codex 这类完整 harness 的 RL 训练直接相关</span></div>

<div class="metrics" aria-label="论文关键结果">
  <div class="metric"><strong>64.0 → 70.4</strong><span>OpenHands SDK · SWE-bench Verified</span></div>
  <div class="metric"><strong>62.4 → 68.2</strong><span>Claude Code</span></div>
  <div class="metric"><strong>57.2 → 66.6</strong><span>OpenCode</span></div>
  <div class="metric"><strong>&gt; 0.99</strong><span>rollout-training probability correlation</span></div>
</div>

<aside class="keypoints">
  <h3>先记住四个结论</h3>
  <ul>
    <li><strong>LEGO-RL 保留每个 coding harness 的原生 control flow。</strong>Claude Code 不需要改写成 trainer 自己的 agent loop；proxy 在模型 API 边界截获真实生成。</li>
    <li><strong>reward 必须与 Agent 真正完成的修改绑定。</strong>测试、gold patch 和 grader 在 Agent 阶段不可见；基础设施失败的 trajectory 也不会混进 policy loss。</li>
    <li><strong>训练任务是否有用取决于当前 policy。</strong>同题 8 条 rollout 全错或全对时，group-relative advantage 都是 0。</li>
    <li><strong>三种 harness 各只有一次主要训练 run。</strong>结果方向一致，但论文没有给出 run-to-run variance。</li>
  </ul>
</aside>

<aside class="part0">
<span class="kicker">PART 0 · READING PRIMER</span>

### 读这篇论文前，需要先分清四个概念

Harness 是包在模型外面的运行系统。Claude Code 会构造上下文、声明工具、解释 tool call、执行命令，也可能压缩或改写历史。Harness-native RL 的意思是保留这些行为，让训练中的 rollout 与部署时真正使用的 Agent 尽量一致。

GSPO 对同一任务采样一组 trajectory。本文每组有 8 条，verifier 给每条一个 0/1 reward，再计算组内标准化 advantage：

<div class="formula">Â_i = (r_i − mean(r_1:G)) / (std(r_1:G) + 10^-6), &nbsp; G = 8</div>

如果 8 条全错或全对，8 个 advantage 都是 0，这个任务在本次 batch 里不产生梯度。因此，训练集不能只满足“测试可运行”，还要让当前 policy 既有成功机会，也有失败机会。

Rollout-training alignment 检查 trainer 重算的 token log-prob 是否接近 rollout 时记录的值。Qwen3.5-35B-A3B 是 sparse MoE model。同一个 token 如果在 rollout 和 training 阶段走进不同 experts，文字虽然没变，概率也会变。Routing replay 会保存 rollout 时的 expert choices，并在 trainer 重算时复用。
</aside>

## Q1. 为什么完整 coding harness 很难直接拿来做 RL？

**训练框架通常希望自己控制 token 序列，完整 harness 却会主动管理上下文和工具交互。** 一次 Claude Code trajectory 可能包含多轮模型调用、shell 输出、文件 diff、tool schema、history compaction 和 SDK 重序列化。Trainer 如果只在结束后读取 transcript，再把文字 tokenize 一遍，拿到的 token IDs、response mask 或上下文边界可能已经和 rollout 时不同。

这个差异会直接破坏 policy gradient 的概率比。分母如果对应另一串 token，或者 MoE expert routing 已经变化，优化目标就失去原来的统计含义。论文的要求很直接：在相同权重上，trainer 对 policy-generated tokens 重算的 log-prob 应当接近 serving boundary 记录的 rollout log-prob。

第二个问题来自 reward。Coding Agent 最终只得到一个 sparse verifier reward。论文在系统开发期间看到过六类污染：

<div class="table-scroll">
<table>
  <thead><tr><th>失败方式</th><th>部署防护前出现比例</th><th>LEGO-RL 的处理</th></tr></thead>
  <tbody>
    <tr><td>读取 git history</td><td>4.6% 至 20.5%</td><td>Agent 阶段把 history rebase 成单一 commit，grading 前恢复</td></tr>
    <tr><td>下载 reference fix</td><td>1.9%</td><td>分阶段 egress firewall</td></tr>
    <tr><td>修改 tests</td><td>2.4% 至 19.4%</td><td>tests 到 grading 才注入，并回滚 test-path edits</td></tr>
    <tr><td>grader 自己套用 reference patch</td><td>2.5%</td><td>审计并剔除受影响任务，线上检测 degenerate reward</td></tr>
    <tr><td>grader 依赖网络</td><td>未单独量化</td><td>把 grade-time dependency 打包进环境</td></tr>
    <tr><td>仓库构建不完整</td><td>未单独量化</td><td>hermetic fail-fast build，报告 setup failure 而不是 reward 0</td></tr>
  </tbody>
</table>
</div>

**LEGO-RL 的 motivation 可以压缩成一句话：训练系统必须同时守住 trajectory fidelity 和 reward integrity。** 前者回答“梯度是不是对着 rollout 时的 policy 行为算的”，后者回答“1 分是不是 Agent 真的修好了任务”。

## Q2. 它和现有 agentic RL 框架的边界在哪里？

**与 LEGO-RL 最接近的路线选择在 model API 边界接入现成 harness。** 论文把相关工作分成几类。

<div class="table-scroll">
<table>
  <thead><tr><th>路线</th><th>rollout 由谁控制</th><th>强项</th><th>与 LEGO-RL 的区别</th></tr></thead>
  <tbody>
    <tr><td>verl、slime、MOLT、SkyRL、AReaL</td><td>RL framework 内部 loop 或其 abstraction</td><td>生成和 optimizer 靠得近，容易做异步与大规模训练</td><td>完整 coding harness 往往要适配成框架规定的 interaction loop</td></tr>
    <tr><td>ALE：ROLL + ROCK + iFlow</td><td>trainer、sandbox、CLI agent 协同设计</td><td>整栈一致性</td><td>通过共同控制 full stack 获得一致性，目标并非兼容任意现成 harness</td></tr>
    <tr><td>Agent Lightning</td><td>现有 Agent 加 SDK callback</td><td>能接多种 agent system</td><td>论文 Table 1 没有报告 history alignment、R3 或 reward-hack defense</td></tr>
    <tr><td>Polar、rLLM、OpenForgeRL</td><td>model API 边界观察原生 harness</td><td>保留既有 Agent control flow</td><td>与 LEGO-RL 最接近；各自对 routing replay、sandbox、operations 和 observability 的覆盖不同</td></tr>
    <tr><td><strong>LEGO-RL</strong></td><td>Claude Code、OpenHands、OpenCode 原生 loop</td><td>token capture、R3、Harbor verifier、Live UI 和运维闭环</td><td>贡献在完整系统组合；论文没有声称每项组件都是第一次提出</td></tr>
  </tbody>
</table>
</div>

论文也和 SWE-RL、DeepSWE、LongContext 一类工作区分开来。SWE-RL 没有 executable interaction；其他工作常在框架自有 loop 中训练。LEGO-RL 关注的是部署时会真实使用的 harness 是否也能原样参与训练。

这里要保留一个证据边界：Table 1 的功能勾选由 LEGO-RL 作者整理，本文没有逐个复现十个框架。它适合说明设计空间，不能当成独立 benchmark 排名。

## Q3. LEGO-RL 的训练闭环、数据和 judge 到底怎样工作？

### 3.1 一条 trajectory 的数据流

<figure class="figure">
  <img src="/lib/papers/lego-rl/figure-1-infrastructure.webp" alt="LEGO-RL 训练基础设施">
  <figcaption>原论文 Figure 1。Native harness 在独立 sandbox 中运行；in-process proxy 保存真实生成；verifier reward 和 trajectory 进入 buffer，再由 trainer 更新 policy。论文按 CC0 发布。</figcaption>
</figure>

每个 task 是 <code>x = (q_x, R_x, V_x)</code>：问题描述、初始化仓库和 task-specific verifier。Harness 根据当前交互状态构造 context，policy 生成 assistant tokens，harness 执行工具并改变仓库。LEGO-RL 只训练 assistant response tokens，不把 tool output 或 user message 当成 policy action。

Proxy 需要处理一个麻烦细节：harness 可能在下一轮请求里重新序列化旧消息。官方实现 revision <code>a3e28f171be165b5e8cda45030f336ec103690a7</code> 直接把 proxy 捕获的 token、mask、log-prob 和 routing 放进 <code>AgentLoopOutput</code>：

<div class="code-scroll"><pre><code class="language-python">prompt_ids = traj_acc[:prompt_token_len]
response_ids = traj_acc[prompt_token_len:]
response_mask = tail_mask
response_logprobs = tail_lp
response_routing = (
    tail_routing if len(tail_routing) == len(tail_mask) else []
)

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

这段代码来自官方仓库，不是文章重构的伪代码。实现还会把 timeout、environment setup failure、max turns 和 context overflow 分开标记；trajectory filter 再决定是否进入 loss。

### 3.2 训练任务从 36,884 条缩到 2,699 条

任务来自 OpenSWE candidate pools。作者先做规则过滤：

<ol class="flow">
  <li><b>36,884</b><span>OpenSWE-derived candidates</span></li>
  <li><b>22,806</b><span>通过基本有效性、repo diversity、coarse complexity</span></li>
  <li><b>21,681</b><span>build 与 verifier 可运行</span></li>
  <li><b>4 rollouts</b><span>Qwen3.6-27B + OpenHands SDK</span></li>
  <li><b>1-3 / 4</b><span>保留既不全错也不全对的任务</span></li>
  <li><b>2,699</b><span>最终训练 index</span></li>
</ol>

训练集与 SWE-bench Verified 在 repository 和 instance 两层都不重叠。难度筛选只使用一个 model-harness 组合，这是潜在 bias。作者随后在 Claude Code 和 OpenCode 上也获得提升，说明这批任务可以迁移；现有实验没有证明三种 harness 共享同一个最优 curriculum。

官方 <code>utils/create_task_index.py</code> 也说明了 index 的性质。Parquet 行里的 prompt 只是路径占位符，真实 issue 在 Harbor task 的 <code>instruction.md</code> 中：

<div class="code-scroll"><pre><code class="language-python">return {
    "prompt": [{"role": "user", "content": str(path)}],
    "reward_model": {"style": "rule", "ground_truth": None},
    "extra_info": {
        "harbor_task_path": str(path.resolve()),
        "instance_id": path.name,
        "data_source": "harbor",
    },
}</code></pre></div>

### 3.3 真实 case：<code>12rambau__sepal_ui-814</code>

这个 instance 来自 openforis/pysepal 的 issue #813 和 PR #814。原始需求由项目维护者提出：第一次调用 <code>alert.update_progress(0, total=10)</code> 后，循环内应该只写 <code>alert.update_progress(i)</code>，不必每次重复传 <code>total</code>。

<div class="case">
<h4>从公开 issue 到 verifier verdict</h4>
<ol>
  <li><strong>上游来源：</strong>issue #813 给出可运行示例；PR #814 的公开 patch 修改 <code>alert.py</code>，并把 <code>test_update_progress</code> 改为先以 0/100 初始化，再调用 <code>update_progress(50)</code>。</li>
  <li><strong>OpenSWE record：</strong>作者保存 base commit <code>6d825ae167f96ad2e7b76b96ca07de562f74dcf0</code>、问题描述、gold patch、test patch、<code>FAIL_TO_PASS</code> 和 <code>PASS_TO_PASS</code>。</li>
  <li><strong>Agent 可见状态：</strong>Harbor 初始化仓库，只把 issue text 交给 Agent。Agent 可以读写源代码、运行公开命令，但看不到 gold patch、test patch、测试清单或 grader；egress firewall 阻止它下载公开 PR。</li>
  <li><strong>Agent 输出：</strong>Agent 修改工作树。论文没有公开这条 instance 的实际训练 transcript，因此本文不编造它具体读过哪些文件或用了哪条 shell 命令。</li>
  <li><strong>Verifier setup：</strong>Agent 结束后，host 才把 <code>tests/test.patch</code>、<code>parser.py</code> 和含 raw record 的 <code>config.json</code> 注入 sandbox。<code>test.sh</code> 重置测试、应用 test patch、运行 pytest 并解析结果。</li>
  <li><strong>PASS：</strong><code>tests/test_sepalwidgets/test_Alert.py::test_update_progress</code> 必须从 fail 变 pass，所有 <code>PASS_TO_PASS</code> 也必须继续通过。否则 reward 为 0；全部满足才是 1。</li>
</ol>
</div>

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-15-raw-instance.webp" alt="sepal_ui-814 raw instance"><figcaption>原论文 Figure 15。Raw record 包含 gold/test patch 和测试列表，但图中长字段已截断。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-16-harbor-task.webp" alt="sepal_ui-814 Harbor task"><figcaption>原论文 Figure 16。Host-side task package 的 tests 目录不会在 Agent 阶段出现。</figcaption></figure>
</div>

<figure class="figure">
  <img src="/lib/papers/lego-rl/figure-17-task-index.webp" alt="LEGO-RL task index row">
  <figcaption>原论文 Figure 17。Trainer index 只保存 Harbor task path，不把任务全文复制进训练表。</figcaption>
</figure>

论文和官方 GitHub 仓库 revision <code>a3e28f1</code> 没有公开这条 instance 的完整 Harbor directory；Figures 15-16 也明确标注 long fields truncated。本文可以核验上游 issue、公开 reference patch 和总体 grading protocol，无法逐行审计作者实际使用的 <code>test.sh</code> 与完整 <code>PASS_TO_PASS</code> 清单。

## Q4. 实验怎样设置，结果到底说明了什么？

### 4.1 主实验控制

三次 production run 都从 Qwen3.5-35B-A3B 开始，使用 GSPO、64 prompts/batch、8 rollouts/prompt、3 epochs。Prompt budget 是 30k tokens，response budget 是 170k；rollout temperature 1.0，validation temperature 0.7。每个 harness 单独训练一次，验证集固定为 SWE-bench Verified 500 tasks。

<div class="table-scroll">
<table>
  <thead><tr><th>Harness</th><th>初始 Qwen3.5</th><th>LEGO-RL</th><th>绝对增益</th><th>同协议 KAT-Coder</th></tr></thead>
  <tbody>
    <tr><td>OpenHands SDK</td><td>64.0%</td><td><strong>70.4%</strong></td><td>+6.4</td><td>67.0%</td></tr>
    <tr><td>Claude Code</td><td>62.4%</td><td><strong>68.2%</strong></td><td>+5.8</td><td>66.8%</td></tr>
    <tr><td>OpenCode</td><td>57.2%</td><td><strong>66.6%</strong></td><td>+9.4</td><td>64.8%</td></tr>
  </tbody>
</table>
</div>

<figure class="figure">
  <img src="/lib/papers/lego-rl/figure-3-training-curves.webp" alt="三种 harness 的训练与验证曲线">
  <figcaption>原论文 Figure 3。三种 harness 的 training reward 和 validation 都提高，response length 也随训练增长。Step-0 分数不同，因此不能把三行直接解释为 harness 排名。</figcaption>
</figure>

每个主要配置只有一次 run。表格证明三次训练都沿同一方向改善，也超过作者在同协议下重测的 Qwen3.6-35B-A3B 和 KAT-Coder-V2.5-Dev；它不能给出优化方差或复现成功概率。

### 4.2 Alignment：训练的真是 rollout 时那批 token 吗？

<div class="table-scroll">
<table>
  <thead><tr><th>Harness</th><th>Median Pearson r</th><th>KL ×10^-3</th><th>p99 |Δ mean log p| ×10^-3</th></tr></thead>
  <tbody><tr><td>OpenHands SDK</td><td>0.9993</td><td>0.75</td><td>2.1</td></tr><tr><td>Claude Code</td><td>0.9980</td><td>1.35</td><td>2.7</td></tr><tr><td>OpenCode</td><td>0.9993</td><td>0.60</td><td>2.0</td></tr></tbody>
</table>
</div>

每个 training step 的 Pearson 都不低于 0.989。Routing replay 的 negative control 更有说服力：关闭 replay 时 Pearson 为 0.9946；正确对齐后是 0.9993；把每个 token 的 route 故意错一位后跌到 0.7503。机制“在运行”不够，token 与 route 必须逐位置匹配。

### 4.3 Task admission 与 curriculum

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-4-termination.webp" alt="Trajectory termination profiles"><figcaption>原论文 Figure 4。被排除的 trajectory：Claude Code 7.1%，OpenHands SDK 2.4%，OpenCode 6.4%。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-5-reward-distributions.webp" alt="In-batch reward distributions"><figcaption>原论文 Figure 5。0/8 与 8/8 groups 都没有 group-relative learning signal。</figcaption></figure>
</div>

<figure class="figure">
  <img src="/lib/papers/lego-rl/figure-6-task-selection.webp" alt="Task selection ablation">
  <figcaption>原论文 Figure 6。四个 951-task pools 中，full band 与 upper half 的 post-warmup validation average 分别为 0.671、0.670；lower half 为 0.640；unscreened pool 没有净改善。</figcaption>
</figure>

Unscreened pool 在四次 screening rollout 中有 72.7% 的任务从未解出，13.4% 总能解出。能产生组内 reward variation 的任务只占很小一部分。

### 4.4 Live UI 发现了什么真实 failure？

论文附录给出一个 collapsed run。模型是 Qwen3-30B-A3B，harness 是 OpenHands SDK，task pool 有 449 条。29 个 logged steps 内，training reward 从 0.351 降到 0.050，validation 从 0.230 降到 0.014，mean turns 从 18.9 降到 0.96。Agent 后期几乎不再发 tool call，而是把 shell command 写进 fenced prose。

作者据此构造 early-stop 条件 <code>mean turns &lt; 3</code>，它会在 step 22 触发，比人工终止早 8 步。这个阈值只在一个 case study 上得到验证，能否跨任务工作仍未知。

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-7-live-diagnosis.webp" alt="Live UI failure diagnosis"><figcaption>原论文 Figure 7。左侧 environment-failure run 与右侧 collapsed run 是两个不同诊断案例。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-8-live-behavior.webp" alt="Live UI behavioral analysis"><figcaption>原论文 Figure 8。Claude Code production run 的单题 8-rollout tool trajectory 与 task-level solve-rate changes。</figcaption></figure>
</div>

### 4.5 训练后的行为和系统代价

在 OpenHands SDK production run 的首尾各 420 条 trajectory 上，修改后重新读文件从 73.6% 增到 98.1%，运行 tests 从 85.0% 增到 93.6%，首次修改前检查的文件数从 3.45 增到 6.92，malformed tool calls 从 1.07% 降到 0.15%。出错后仍解决任务的比例只从 63.9% 增到 66.8%，变化较小。

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-11-reasoning-share.webp" alt="Reasoning share over training"><figcaption>原论文 Figure 11。Reasoning share 上升表示 trajectory shape 改变，不能单独证明它导致成功。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-12-behaviors.webp" alt="Behavior changes before and after training"><figcaption>原论文 Figure 12。Tool allocation 与具体行为变化。</figcaption></figure>
</div>

3,699 条 OpenHands SDK trials 中，Agent execution 平均占 840.5 / 920.4 秒，也就是 91.3%。相同 7.5 小时内，synchronous training 完成 3 steps，asynchronous 完成 7 steps；实测 step time 改善 2.5×。两组 optimizer throughput 不匹配，校正后估计约 1.9×。

<div class="figure-grid">
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-9-schedule.webp" alt="Synchronous and asynchronous schedule"><figcaption>原论文 Figure 9。异步执行允许新 rollout 不等待上一批最慢 trajectory。</figcaption></figure>
  <figure class="figure"><img src="/lib/papers/lego-rl/figure-10-nydus.webp" alt="Nydus and OCI image delivery"><figcaption>原论文 Figure 10。100 个 images 上，network 21.6GB→1.59GB，disk writes 65.6GB→5.29GB。</figcaption></figure>
</div>

Deck 还完整收录了论文 Figures 13-14 的 task grid 与 diagnostic panels，以及 Figures 15-17 的三种 data representation。原论文 17 幅 Figure 均未遗漏；10 张 Table 已在正文、Deck 或 source manifest 中逐项登记。

## Q5. 对 Claude Code、Codex harness 研究有什么直接启发？

**最值得复用的是三份明确的契约。**

第一份是 trajectory contract。Harness 可以自由压缩和重写上下文，训练系统必须在 model-serving boundary 保存真实 token IDs、response mask、log-probs 和必要的 routing metadata。只保存最终 transcript 不够。

第二份是 reward contract。Agent 看得到 issue 和 repo，看不到 gold patch、hidden tests、测试列表或 grader；外网也不能成为下载 reference fix 的旁路。Verifier 在 Agent 结束后运行，基础设施错误单独分类。这样 reward 才能代表“修复是否通过验收”。

第三份是 curriculum contract。Task validity、trajectory validity 和 reward informativeness 要分开检查。一个能构建、能判分的任务，仍可能因为当前 policy 0/8 或 8/8 而没有训练价值。

如果沿着这篇论文继续做，我会优先补五个实验：

1. 训练一个同时经历 Claude Code、OpenHands、OpenCode 的 shared policy，再与三个单-harness policies 做等 token、等 wall time 对照，测 harness-general behavior。
2. 让 sampler 按最近的组内 reward variance 动态重加权，替代三轮训练都使用固定 2,699-task pool 的做法。
3. 对 reward-integrity defense 做逐项消融，分别量化 hidden tests、egress firewall、history rebasing 和 test-path rollback 的价值。
4. 在同一配置上做至少 3 个 training seeds，并报告 final、best、area under validation curve 与每题转移矩阵。
5. 把 alignment 变成 fail-closed invariant。Token coverage、route coverage 或 log-prob discrepancy 一旦越界，trainer 立即停止更新。

## Q6. 这篇论文能证明什么，还缺什么？

**它证明了三套完整 coding harness 可以在不修改内部 control flow 的前提下进行有效 policy-gradient training。** 三次 production run 都提高 SWE-bench Verified。Token-level alignment、routing negative control、reward-integrity audit、task selection ablation 和系统 profiling 同时检查了训练链本身。

<div class="limit-grid">
  <div><b>能证明</b><span>Qwen3.5-35B-A3B 在 OpenHands SDK、Claude Code、OpenCode 中分别提高 6.4、5.8、9.4 个绝对百分点。</span></div>
  <div><b>训练方差未知</b><span>每个主要配置只有一次 run。三条正向曲线是有价值的证据，但不是重复实验。</span></div>
  <div><b>任务筛选有单-harness bias</b><span>2,699 tasks 由 Qwen3.6-27B + OpenHands SDK 的四次 rollout 选出。</span></div>
  <div><b>Case checker 披露不完整</b><span>论文只展示截断 record 与目录；官方 GitHub revision a3e28f1 未包含 sepal_ui-814 的完整 Harbor task。</span></div>
  <div><b>行为分析不是因果实验</b><span>更多重读、测试和 reasoning 与分数同时变化，论文没有干预单个行为后测因果贡献。</span></div>
  <div><b>异步 speedup 有校正项</b><span>2.5× 是实测 wall-time 对比；optimizer throughput 修正后约 1.9×，两组并非完全 matched。</span></div>
</div>

我的结论是：**LEGO-RL 的主要贡献是一条可审计的训练数据链。** Native harness 生成什么 token、这些 token 走了哪些 experts、Agent 在什么仓库状态上行动、grader 为什么给 1 分，都能回到明确的系统边界。对 Claude Code、Codex 方向的研究，先把这套训练协议做扎实，再讨论 optimizer 的差异。

</div>

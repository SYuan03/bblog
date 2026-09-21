---
title: "GameASG-Bench 如何验证一个游戏真的做完了"
permalink: "/posts/论文解读/gameasg-bench.html"
date: "2026-09-21T21:31:01+08:00"
updated: "2026-09-22T00:02:00+08:00"
cover: "/generated-covers/046-gameasg-bench.webp"
description: "逐文件拆解 GameASG-Bench：人类如何写规格与隐藏测试，Agent 能看到什么，L1/L2 怎样执行，以及真实浏览器输入为什么能抓住看似完成的游戏。"
wide_content: true
hide_post_cover: true
deck_pages: 26
categories:
  - "论文解读"
tags:
  - "Coding Agent"
  - "Benchmark"
  - "游戏开发"
  - "软件测试"
---

<style>
.gb-reading{--gb-blue:#2676c9;--gb-orange:#e86c36;--gb-green:#3f8a68;--gb-ink:#20262d;--gb-paper:#f8f5ee;--gb-line:#d7d2c8;color:var(--gb-ink)}
.gb-reading .gb-button{display:inline-block;padding:11px 18px;border:1px solid #155b9f;background:var(--gb-blue);color:#fff!important;text-decoration:none!important;font-weight:700;white-space:nowrap}
.gb-reading .gb-player-shell{width:100%;margin:4px 0 34px;border:1px solid #c5c2ba;background:#252b31;box-shadow:0 20px 60px #17202a24}
.gb-reading .gb-player-bar{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:17px 20px;color:#eef3f7;background:#252b31}
.gb-reading .gb-player-copy{display:grid;gap:3px}.gb-reading .gb-player-copy small{font:800 .72em/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#7fc1ff}.gb-reading .gb-player-copy strong{font-size:1.02em}.gb-reading .gb-player-copy span{font-size:.82em;color:#b9c2ca}
.gb-reading .gb-player-shell .post-deck-embed{margin:0}.gb-reading .gb-player-shell .post-deck-embed-frame{border:0;border-top:1px solid #424950;background:#dcd9d2}.gb-reading .gb-player-shell .post-deck-embed-note{margin:0;padding:11px 17px;color:#c4ccd3;background:#252b31;border-top:1px solid #424950}
.gb-reading .gb-source-links{display:flex;flex-wrap:wrap;gap:8px 20px;margin:0 0 34px;font-size:.94em}
.gb-reading .gb-callout{padding:18px 22px;margin:22px 0;border-left:5px solid var(--gb-orange);background:#fff7f1}
.gb-reading .gb-callout.blue{border-color:var(--gb-blue);background:#f1f7fd}.gb-reading .gb-callout.green{border-color:var(--gb-green);background:#f1f8f4}
.gb-reading .gb-figure{margin:30px 0}.gb-reading .gb-figure img{display:block;width:100%;height:auto;border:1px solid #dedad2;background:white}.gb-reading .gb-figure figcaption{margin-top:9px;color:#66707a;font-size:.9em;line-height:1.55}
.gb-reading .gb-flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin:24px 0}.gb-reading .gb-flow>div{position:relative;min-height:132px;padding:16px 14px;border-top:5px solid var(--gb-blue);background:#f7f7f5}.gb-reading .gb-flow>div:nth-child(2n){border-color:var(--gb-orange)}.gb-reading .gb-flow b{display:block;margin-bottom:8px;font-size:.95em}.gb-reading .gb-flow span{display:block;color:#5f6872;font-size:.86em;line-height:1.45}.gb-reading .gb-flow em{position:absolute;right:-10px;top:50%;z-index:2;font-style:normal;color:#8b9299;background:white;padding:2px}
.gb-reading .gb-role-table,.gb-reading .gb-compare{width:100%;border-collapse:collapse;margin:20px 0;font-size:.92em}.gb-reading th,.gb-reading td{padding:10px 11px;border:1px solid var(--gb-line);text-align:left;vertical-align:top}.gb-reading th{background:#f1f0ec}.gb-reading code{font-size:.92em}.gb-reading pre{overflow:auto;max-height:none}
.gb-reading .gb-two{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:22px 0}.gb-reading .gb-two>*{min-width:0}.gb-reading .gb-mini{padding:18px;border-top:5px solid var(--gb-blue);background:#f7f7f5}.gb-reading .gb-mini:nth-child(2){border-color:var(--gb-orange)}.gb-reading .gb-mini h4{margin-top:0}
.gb-reading .gb-inline-code{padding:2px 6px;border:1px solid #d8d8d3;background:#f4f4f1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}
.gb-reading .gb-deck-heading{margin-top:54px}
.gb-reading #interactive-deck{scroll-margin-top:88px}
@media(max-width:900px){.gb-reading .gb-player-shell{margin-bottom:28px}.gb-reading .gb-player-bar{align-items:flex-start;padding:14px;gap:12px}.gb-reading .gb-player-copy span{display:none}.gb-reading .gb-button{padding:9px 12px;font-size:.84em}.gb-reading .gb-flow{grid-template-columns:1fr 1fr}.gb-reading .gb-flow em{display:none}.gb-reading .gb-two{grid-template-columns:1fr}.gb-reading .gb-compare{display:block;overflow-x:auto;white-space:nowrap}.gb-reading .gb-button{text-align:center}}
</style>

<div class="gb-reading">

<div id="interactive-deck" class="gb-player-shell">
  <div class="gb-player-bar">
    <div class="gb-player-copy"><small>INTERACTIVE PAPER DECK</small><strong>GameASG-Bench · 26 页可交互图解</strong><span>页面内直接翻页；支持方向键、目录、全屏与手机横屏。</span></div>
    <a class="gb-button" href="/lib/decks/gameasg-bench-visual-guide.html">沉浸模式 ↗</a>
  </div>
  <div class="post-deck-embed">
    <div class="post-deck-embed-frame">
      <iframe src="/lib/decks/gameasg-bench-visual-guide.html" title="GameASG-Bench 论文图解，共 26 页" allow="fullscreen" loading="eager"></iframe>
    </div>
    <p class="post-deck-embed-note"><span>共 26 页 · 点击按钮或使用 ← → 翻页</span><span>手机端建议横屏后全屏阅读</span></p>
  </div>
</div>

<div class="gb-source-links">
  <a href="https://arxiv.org/abs/2609.21293">论文主页</a>
  <a href="https://arxiv.org/pdf/2609.21293">论文 PDF</a>
  <a href="https://github.com/areal-project/GameASG-Bench">官方代码与 47 个任务</a>
  <a href="#原论文表格索引">跳到原论文表格</a>
</div>

## 先说结论

GameASG-Bench 直接验证 Coding Agent 能否交付一个可玩的、能被稳定复现和验证的完整浏览器游戏，而不把“网页像不像游戏”当作完成标准。每道题要求模型在干净工作区里写出一个自包含的 `index.html`。评测端再用预先固定的静态检查和浏览器行为检查验证它。

这套 benchmark 最值得研究的是测试边界。人类开发者先写玩法规格、测试接口规格和隐藏检查。Agent 能读到规格，但拿不到 `checks.json`、`checks.js` 或以前的测试报告。这样既给了模型足够明确的工程契约，也避免模型直接针对断言字符串做题。

论文包含 47 个任务、336 个 L1 静态检查和 885 个 L2 浏览器行为检查。表现最好的 GPT-6-Astra + Codex CLI 通过了 26/47 个任务，严格成功率 55.3%。它的平均 L2 通过率却有 93.2%。这两个数字之间的差距正是论文的主要发现：一个游戏可以让绝大多数检查通过，仍然在某条必需机制上失败。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/figure-1-corpus.png" alt="GameASG-Bench 47 个任务的类型、2D/3D 与参考实现技术分布">
  <figcaption>原论文 Figure 1。47 个任务覆盖 12 类游戏，其中 32 个为 2D、15 个为 3D。参考实现主要使用 Canvas 2D 和 Three.js。论文明确说明：这里统计的是参考实现技术，并不限制 Agent 必须采用同一种技术。</figcaption>
</figure>

## Motivation：完整应用没有一个天然的判题器

函数题有输入和返回值，仓库修复题通常有现成测试。一个游戏把控制、状态机、渲染、动画、资源、反馈和终局绑在一起。以下几种“看起来完成了”的证据都不够：

- 页面能打开，只能说明 HTML 没有在启动阶段崩掉。
- 截图里有角色、HUD 和按钮，只能说明某一帧像游戏。
- 源码里出现 `win`、`ammo`、`restart`，不能证明这些变量真的接上了玩法。
- Agent 自己写的测试可能只走测试接口，漏掉鼠标、触摸和自然时间推进。
- 平均通过率会掩盖必需机制失败。一个任务如果只漏掉 1 个 P1 检查，平均分可能仍然很高，严格成功则必须记为失败。

评测还面临一个工程矛盾。纯 GUI 操作很难稳定到达“敌军运输车已经接近基地”这类罕见状态；直接修改实现内部变量又会把测试绑在某个对象名和数据结构上。GameASG-Bench 采用一个公开的语义接口来准备合法状态、执行玩家级动作并读取稳定快照。测试知道“要发生什么”，无需知道游戏内部怎样组织对象。

## Related work：差别不只在任务更长

论文把自己放在完整应用与游戏生成评测这一支。下面的比较按论文第 5 节整理；名称链接到各工作的原始页面。

<table class="gb-compare">
  <thead><tr><th>工作</th><th>主要产物</th><th>状态与证据</th><th>GameASG-Bench 的差别</th></tr></thead>
  <tbody>
    <tr><td><a href="https://arxiv.org/abs/2105.09938">APPS</a> / <a href="https://arxiv.org/abs/2305.01210">EvalPlus</a></td><td>边界明确的函数程序</td><td>输入、返回值、扩展测试</td><td>GameASG-Bench 处理持续运行、可交互、可渲染的完整产物。</td></tr>
    <tr><td><a href="https://www.swebench.com/">SWE-bench</a></td><td>已有仓库中的修复</td><td>Issue、仓库上下文、项目测试</td><td>这里从空工作区生成完整单页游戏，并额外定义可测试的运行时接口。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.17637">WebGameBench</a></td><td>浏览器游戏</td><td>真实浏览器交互与规格引导</td><td>GameASG-Bench 强调生成前固定的人写接口规格与隐藏检查。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2606.17861">GameCraft-Bench</a></td><td>Godot 项目</td><td>回放、多模态证据、隐藏 rubric</td><td>GameASG-Bench 的交付协议更窄，统一为自包含的浏览器 `index.html`。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2605.07442">GameGen-Verifier</a></td><td>生成游戏</td><td>从规格抽取 keypoint，运行时状态注入</td><td>本文限制场景必须是正常游玩可达的合法状态，且不能预先制造待测结果。</td></tr>
    <tr><td><a href="https://arxiv.org/abs/2608.21833">GameXpert-Bench</a></td><td>生成、修复与迭代</td><td>代码检查、现场交互、人工审核</td><td>GameASG-Bench 给出固定、可复跑的 L1/L2 检查和严格成功定义。</td></tr>
  </tbody>
</table>

任务范围窄也带来好处。所有产物都能在同一种浏览器沙箱里运行，同一套 runner 可以记录输入监听、动画帧、Canvas/WebGL 活动、异常与语义快照。它牺牲了后端、多文件工程和长期服务行为，换来可复现的端到端检查。

## `checks.json` 和 `checks.js` 到底从哪来

论文第 3.2 节写得很明确：每个游戏概念选定后，**人类开发者**写 `game-spec.md`，再定义 `tdd.md` 里的场景、动作、快照字段、期望结果、拒绝行为和不变量。L1 检查写入 `checks.json`，L2 检查实现于 `checks.js`，P0/P1/P2 的优先级也由人类在测试编写阶段分配。

每道题还有一个独立验证过的参考实现。人类会实际操作它，检查核心状态转移、终局与重启，并确认测试接口和屏幕上的游戏同步。随后，同一套 L1 与 L2 检查会跑在参考实现上。47 个参考实现全部通过了所有 L1 和适用的 L2 P0/P1 检查。

因此这些文件不是模型生成后再让另一个模型临时编出来的，也不是从提交代码中自动猜出来的。它们在生成开始之前就已经固定。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-1-task-documents.png" alt="原论文 Table 1：三份任务文档及其作用">
  <figcaption>原论文 Table 1。三份文档都会放进 Agent 的工作区；只有 `target.md` 直接进入 harness 的生成提示，Agent 再从工作区读取其余两份规格。</figcaption>
</figure>

<table class="gb-role-table">
  <thead><tr><th>文件或产物</th><th>作者</th><th>Agent 是否可见</th><th>作用</th></tr></thead>
  <tbody>
    <tr><td><code>target.md</code></td><td>人类 benchmark 作者</td><td>可见，直接作为生成任务</td><td>工作区规则、交付协议、简短玩法说明。</td></tr>
    <tr><td><code>game-spec.md</code></td><td>人类 benchmark 作者</td><td>可见</td><td>玩家看到的机制、反馈、资源变化、终局和最低可玩循环。</td></tr>
    <tr><td><code>tdd.md</code></td><td>人类 benchmark 作者</td><td>可见</td><td>公开测试接口、合法场景、动作、快照字段、拒绝语义与不变量。</td></tr>
    <tr><td><code>checks.json</code></td><td>人类 benchmark 作者</td><td>不可见</td><td>L1 静态检查，包括结构、正则、工具检查和反模式。</td></tr>
    <tr><td><code>checks.js</code></td><td>人类 benchmark 作者</td><td>不可见</td><td>L2 浏览器检查，组合场景准备、真实输入、语义快照与浏览器证据。</td></tr>
    <tr><td>参考实现</td><td>benchmark 团队</td><td>不可见</td><td>人工验证后的正控制，用于确认测试不会把合格游戏误判为失败。</td></tr>
    <tr><td><code>index.html</code></td><td>Coding Agent</td><td>Agent 自己生成</td><td>最终交付物，HTML、CSS 与 JavaScript 自包含。</td></tr>
  </tbody>
</table>

## 一道题从编写到计分的完整路径

下面是根据论文第 2、3 节和附录 B 重绘的流程，不是论文原图。

<div class="gb-flow" aria-label="GameASG-Bench 完整工作流">
  <div><b>1. 人工选题</b><span>要求有完整可玩循环，能在有界浏览器执行中到达并观察。</span><em>→</em></div>
  <div><b>2. 人工写规格</b><span>`target.md`、`game-spec.md`、`tdd.md` 先固定。</span><em>→</em></div>
  <div><b>3. 人工写隐藏测试</b><span>`checks.json`、`checks.js` 与优先级在生成前完成。</span><em>→</em></div>
  <div><b>4. 验证参考实现</b><span>人工操作并运行自动检查，确认核心合规。</span><em>→</em></div>
  <div><b>5. Agent 生成</b><span>干净工作区、新会话，只能读三份公开文档。</span><em>→</em></div>
  <div><b>6. 独立评测</b><span>预检交付，再跑 L1、L2，最后计算严格成功。</span></div>
</div>

生成和评测放在两个容器。生成容器有可写工作区，但测试与 runner 不挂载进去。Agent 结束后，系统先做交付预检：进程成功退出，`index.html` 必须是常规文件、非符号链接、非空，并包含 `</html>`。通过后，评测容器以只读方式挂载提交和测试。

每个 task 与 configuration 组合只跑一次。论文使用固定的 1280×800 无头 Chromium。这个细节很重要：表里的差异包含模型、harness、工具权限和单次运行随机性的共同影响，不能直接读成模型能力的精确总体排名。

## `tdd.md` 不是测试代码，它是一份公开的行为协议

所有游戏暴露同一个入口：

```js
window.__gameTest = {
  reset(options),
  loadScenario(name, options),
  input(action),
  getSnapshot()
}
```

四个方法的名字统一，具体场景、动作和快照字段由任务决定。

- `reset` 回到初始状态，并清除上一局的弹窗、结果锁和临时对象。
- `loadScenario` 把游戏放到正常游玩可达的状态。它可以调整位置和资源来缩短准备时间，但不能直接制造胜利、伤害或订单完成。
- `input` 执行玩家级语义动作，例如下单、选择目标或暂停。部分 L2 检查会绕过该方法，直接发送鼠标、键盘或触摸输入。
- `getSnapshot` 返回 JSON 可序列化的语义摘要。字段需要稳定，但 Agent 可以自由决定内部对象图和代码结构。

接口的状态必须和画面共用同一份底层状态。测试端不接受一套只给 `__gameTest` 看的影子状态。L2 会把快照变化与真实输入、Canvas 哈希、渲染 revision、动画帧和异常记录相互对照。

## Armor Alley：从玩法要求到隐藏断言

Armor Alley 是一款横向卷轴直升机战术游戏。玩家既驾驶直升机，又花钱生产地面单位。友方运输车到达敌方基地后获胜，敌方运输车突破己方基地则失败。公开 `game-spec.md` 还要求持续飞行、持续射击、炸弹、制导武器、士兵投放、落地补给、生产队列、雷达、暂停、胜负锁和重启。

这里选“按住空格持续开火，松开后停止”这一条，因为它能把规格如何落到测试里完整串起来。

### 1. `game-spec.md` 写玩家能观察到的因果链

公开需求要求：按住开火键会持续消耗弹药，并生成向目标或朝向移动的可见弹丸；松开后持续射击停止。只有数字下降不够，只有屏幕特效也不够。

### 2. `tdd.md` 给出合法起点和可观察字段

测试场景 `air_attack_with_targets` 必须处于 `phase === "playing"`、`result === "none"`、直升机在空中，并且存在可攻击目标。快照公开弹药、弹丸数量、战斗 revision 和通知等语义字段。场景只能准备条件，不能提前开火或造成伤害。

### 3. `checks.json` 先检查契约外壳

下面是官方仓库中 Armor Alley 的真实 L1 条目，正则被缩短为便于阅读的形式。原文件会同时检查四个方法的多种合法 JavaScript 写法。

```json
{
  "id": "p0-contract-methods-reset-input-snapshot",
  "level": "P0",
  "name": "Required contract methods are defined together",
  "type": "regex_all",
  "patterns": [
    "... reset ...",
    "... input ...",
    "... getSnapshot ...",
    "... loadScenario ..."
  ],
  "fix_hint": "Define reset, loadScenario, input, and getSnapshot on window.__gameTest."
}
```

另一个 P1 条目会搜索 `startBattle`、`setFlightIntent`、`holdFire`、`dropBomb`、`orderUnit` 等动作分支。L1 的目标是快速发现缺失接口和明显空壳。论文也承认它的上限：正则可能匹配到注释或字符串，所以 L1 通过并不代表玩法成立。

### 4. `checks.js` 用真实键盘输入验证持续射击

下面保留了官方检查的核心代码。测试没有调用 `input({type: 'holdFire'})` 来“帮”游戏开火，而是向浏览器发送真实 Space 键按下与松开。

```js
const setup = await legalScenario(
  game,
  'air_attack_with_targets',
  s => s.phase === 'playing' &&
       s.result === 'none' &&
       s.helicopter?.airborne,
  'air attack must be active and airborne'
);
if (!setup.ok) return FAIL(setup.detail);

const before = setup.snap;
await browser.keyDown('Space');
await browser.sleep(650);
const held = await game.snapshot();

await browser.keyUp('Space');
await browser.sleep(300);
const released = await game.snapshot();
const afterRelease = await game.wait(550);

const grewWhileHeld =
  count(held, 'projectiles') > count(before, 'projectiles') ||
  rev(held, 'projectiles') > rev(before, 'projectiles') ||
  rev(held, 'combat') > rev(before, 'combat') ||
  num(held.helicopter?.ammo?.current) <
    num(before.helicopter?.ammo?.current);

const plateauAfterRelease =
  count(afterRelease, 'projectiles') <=
    count(released, 'projectiles') + 1 ||
  rev(afterRelease, 'projectiles') ===
    rev(released, 'projectiles');

if (!grewWhileHeld)
  return FAIL('held fire did not create projectile/combat/ammo evidence');
if (!plateauAfterRelease)
  return FAIL('fire continued growing after release');
return PASS('real key path creates and stops sustained fire');
```

这条检查的完整判定链是：

1. `legalScenario` 先验证起点没有提前满足结果。
2. 浏览器按下 Space，等待 650 ms。
3. 弹丸数量、弹丸 revision、战斗 revision 或弹药至少一个发生正确变化。
4. 浏览器松开 Space，再分两次取样。
5. 弹丸增长进入平台期，证明 release 真的终止了持续射击。

它能排除几类常见空壳：只实现 `holdFire` 语义 API 却没有键盘监听；快照里写 `firing: true` 但没有弹丸、战斗或弹药变化；松开按键后计时器仍在生成弹丸。

### 5. 同一个游戏还会检查方向、伤害、经济和终局

Armor Alley 的方向检查会分别从 `flight_control_sample` 场景开始，向右、左、上、下移动真实鼠标。它要求左右位移符号相反、上下位移符号相反，并确认世界仍在推进。危险检查则从安全且非终局的 `air_hazard_nearby` 开始，让直升机朝可见危险移动，随后寻找生命、战斗 revision、爆炸效果或警告变化。

这解释了为什么 `checks.js` 很长。它不只问“有没有按钮”，还要验证准备状态、动作渠道、结果证据、拒绝路径和无关状态不变。

## 两层检查分别能证明什么

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-2-check-counts.png" alt="原论文 Table 2：L1 与 L2 检查数量">
  <figcaption>原论文 Table 2。L1 有 336 条，L2 有 885 条。层级和优先级是两套正交标签：L1/L2 表示证据来自源码还是运行行为，P0/P1/P2 表示需求重要性。</figcaption>
</figure>

L1 runner 检查 HTML 及其内联或本地脚本，支持工具检查、正则和反模式。每一条都会留下结果与修复提示。L1 即使失败，L2 仍然继续运行，这样报告能区分“契约没声明”和“玩法运行失败”。

L2 在无头 Chromium 中执行 `checks.js`。每一条检查创建一个新页面，结束或超时后关闭，再开始下一条。共享浏览器 hook 记录 animation frame、输入监听器、Canvas/WebGL 活动和运行时异常。单个检查按需要组合这些证据，不要求每条都使用全部信号。

P0 覆盖启动、测试接口和最低运行条件。P1 对应核心机制、交互、不变量与相关接口。P2 记录高级玩法和完整度，不进入严格成功条件。L2 返回 `PASS`、`FAIL` 或 `NOT_APPLICABLE`。论文特别指出，当前 runner 没有限制 P1 返回 `NOT_APPLICABLE`，这是一个真实的计分边界。

## 严格成功为什么比平均通过率低得多

对任务 `g`，严格成功需要同时满足：交付有效、评测完成、全部 L1 通过、所有适用的 L2 P0/P1 通过。任何一个必需检查失败，整个任务记 0。P2 不影响严格成功。

这是一种产品交付式指标。一个射击游戏的 99 条要求都工作，唯独玩家按键不能开火，它仍然没有完成。平均检查通过率适合观察“差多少”，严格成功率回答“能不能交付”。论文同时报告两者，避免只看一个数字。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-3-leaderboard.png" alt="原论文 Table 3：九个模型与 harness 组合的严格成功率和检查通过率">
  <figcaption>原论文 Table 3。GPT-6-Astra + Codex CLI 的严格成功为 26/47，平均 L2 为 93.2%。Claude-Opus-5 为 24/47，GPT-5.6-Sol 为 21/47。所有结果来自每个 task-configuration 组合的一次运行。</figcaption>
</figure>

最直观的一组对比来自 GPT-6-Astra：平均 L2 已到 93.2%，严格成功仍只有 55.3%。Claude-Opus-5 的 L1 最高，为 99.6%，严格成功是 51.1%。源码级合规在所有模型上都接近满分，但可交付率没有同步接近满分。

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-4-resource-use.png" alt="原论文 Table 4：各模型与 harness 组合的产物大小、token 和报告成本">
  <figcaption>原论文 Table 4。更大的产物或更多 token 没有稳定对应更多严格成功。例如 Claude-Opus-5 的平均输入 token 远高于 GPT-6-Astra，严格成功少 2 个任务。</figcaption>
</figure>

## 工具、轮数、推理强度和 harness 分别改变了什么

<div class="gb-two">
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-5-tool-ablation.png" alt="原论文 Table 5：工具权限消融"><figcaption>原论文 Table 5。DeepSeek-V4-Flash 在无工具、仅文件、文件加语法检查、完整工具下分别成功 7、6、9、18 个任务。完整工具主要拉高 P1 行为检查。</figcaption></figure>
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-6-turn-budget.png" alt="原论文 Table 6：30、60、120 轮预算"><figcaption>原论文 Table 6。30/60/120 轮时，完成评测的任务数为 10/32/47。短预算首先伤害的是“有没有交付并进入评测”，条件成功率会因此看起来比全体成功率高。</figcaption></figure>
</div>

完整工具让 DeepSeek-V4-Flash 从 6 至 9 个严格成功上升到 18 个。只增加语法检查并没有稳定改善 P1，说明能解析不等于能玩。轮数结果还暴露了 benchmark 的工程属性：30 轮只有 10/47 个任务完成评测，其中 7 个严格成功；把未完成任务从分母拿掉会得到 70.0% 的条件成功率，但全体任务成功率仍是 14.9%。

<div class="gb-two">
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-7-reasoning-effort.png" alt="原论文 Table 7：推理强度比较"><figcaption>原论文 Table 7。High 比 Max 少用 26.9% 的 reasoning tokens，却多成功 1 个任务。Max 的 P0/P1/P2 通过率更高，严格成功并不单调。</figcaption></figure>
  <figure class="gb-figure"><img src="/lib/papers/gameasg-bench/table-8-harness.png" alt="原论文 Table 8：Claude Code 与 Codex CLI harness 比较"><figcaption>原论文 Table 8。两种 harness 都是 18/47，但只有 10 个任务共同成功，另有 8 个各自独占成功，21 个都失败。</figcaption></figure>
</div>

同一个 DeepSeek-V4-Flash 在 Claude Code 与 Codex CLI 上得到相同总数，却解决了不同任务。harness 包含系统指令、上下文管理、工具 schema、命令执行和 endpoint 协议，因此它本身就是被测 agent stack 的一部分。只报总分会把这种差异抹掉。

## 两个失败案例为什么比总榜更有用

<figure class="gb-figure">
  <img src="/lib/papers/gameasg-bench/table-9-diagnostics.png" alt="原论文 Table 9：Diner Dasher 与 Turbo Smash Beast 的诊断证据">
  <figcaption>原论文 Table 9。两个产物都能正常启动，行为缺口出现在组合操作中。</figcaption>
</figure>

### Diner Dasher：API 能服务，真实拖拽不工作

测试先加载 `tray_with_correct_item`，从快照读取托盘物品和顾客的屏幕边界，再从两个矩形中心发送真实鼠标拖拽。拖完后，它要求服务计数、当日收入或顾客完成数至少有一个增加；若顾客已被服务，托盘数量还必须下降。最后再比较 Canvas 哈希或 render revision，确认画面真的变化。

GPT-6-Astra 的失败产物通过 L1，也通过 L2 的 P0/P2，但鼠标和触摸拖拽都没有推动服务流程。这类问题不会出现在接口存在性检查或静态截图里。

```js
const setup = await game.loadScenario('tray_with_correct_item');
const from = center(firstTrayItem(setup).bounds);
const to = center(firstCustomer(setup).bounds);
await game.realMouseDrag(from, to);
const after = await game.snapshot();

if (served(after) <= served(setup) &&
    moneyToday(after) <= moneyToday(setup)) {
  return FAIL('correct real drag produced no service progress');
}
```

### Turbo Smash Beast：场景加载和自然时间单独都能跑，组合后停住

失败实现里，`reset` 或 `loadScenario` 会开启 test mode，并关闭自然时间模拟。Agent 自测了两条独立路径：通过测试接口显式推进时间，以及从新页面直接做真实驾驶。两条都通过。benchmark 的 L2 先加载合法场景，再发送真实鼠标按住并等待浏览器自然时间。这个组合让车辆完全不前进，随后加速、滑行和相关检查一起失败。

真实加速检查会在 `readyUnlockedLevel` 中按下鼠标，分别等待 350 ms 和 450 ms，要求 `speedRatio` 连续增长，`forwardProgress` 和 `motionRevision` 增长，HUD 速度也同步上升。松开检查再要求车辆短暂滑行，然后减速。场景、输入、时间和 HUD 缺一不可。

## 这套 benchmark 仍然有哪些边界

- 47 个任务都限制为自包含浏览器单页。结果不能直接外推到后端服务、多人同步、大型资产管线或长期运行系统。
- 每个 task-configuration 组合只跑一次。模型与 harness 排名包含随机性，论文没有给多次运行的方差或置信区间。
- 语义接口提高了可控性，也增加了实现负担。Agent 需要同时写游戏和测试适配层，能力测量包含了“能否正确实现公开测试契约”。
- L1 主要给出源码证据，正则可能命中注释。论文没有把它解释成玩法正确性。
- P1 的 `NOT_APPLICABLE` 当前缺少硬性限制，可能让某些必需检查退出分母。
- 参考实现通过说明测试能接受一组人工确认合格的实现，不能证明测试覆盖了规格里的每一种错误。

这篇论文最有价值的部分在于它把完整应用评测拆成了可检查的职责边界：人类先固定行为契约和隐藏检查，Agent 自由实现内部结构，评测器用合法场景、真实输入、稳定快照和渲染证据复核因果链。55.3% 的榜单数字会随模型更新，测试设计更值得迁移到编辑器、数据产品或交互式科研工具。

## 原论文表格索引

为了不丢失原文信息，下面保留其余实验表的原图入口：

- [Table 1：任务文档](/lib/papers/gameasg-bench/table-1-task-documents.png)
- [Table 2：检查数量](/lib/papers/gameasg-bench/table-2-check-counts.png)
- [Table 3：主结果](/lib/papers/gameasg-bench/table-3-leaderboard.png)
- [Table 4：资源消耗](/lib/papers/gameasg-bench/table-4-resource-use.png)
- [Table 5：工具消融](/lib/papers/gameasg-bench/table-5-tool-ablation.png)
- [Table 6：轮数预算](/lib/papers/gameasg-bench/table-6-turn-budget.png)
- [Table 7：推理强度](/lib/papers/gameasg-bench/table-7-reasoning-effort.png)
- [Table 8：harness 比较](/lib/papers/gameasg-bench/table-8-harness.png)
- [Table 9：失败诊断](/lib/papers/gameasg-bench/table-9-diagnostics.png)

论文：[GameASG-Bench: Benchmarking Autonomous Software Generation for Game Development](https://arxiv.org/abs/2609.21293)。代码与任务：[areal-project/GameASG-Bench](https://github.com/areal-project/GameASG-Bench)。文中的 Figure 与 Table 图片均裁自原论文；流程图与中文解读根据论文第 2、3 节和官方仓库整理。

</div>

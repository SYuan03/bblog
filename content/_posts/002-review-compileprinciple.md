---
title: "Review-CompilePrinciple"
permalink: "/posts/2023-Spring-Courses-编译原理/review-compileprinciple.html"
date: "2023-06-22T08:00:22.000Z"
updated: "2024-09-30T12:52:04.678Z"
description: "面向编译原理复习，串联正则表达式与自动机转换、LL/LR 语法分析、ANTLR 优先级处理、语法制导翻译及 RISC-V 目标代码生成。"
cover: "/generated-covers/legacy-ESvOUMFbak2VYRj-7a523913.webp"
categories:
  - "2023-Spring-Courses-编译原理"
tags:
  - "编译原理"
---

<!-- Migrated from posts/2023-Spring-Courses-编译原理/review-compileprinciple.html. Keep the permalink stable. -->
<div class="legacy-content">
<h2 id="题目1-正则表达式与自动机">题目1 正则表达式与自动机</h2>
<h3 id="前置知识">前置知识</h3>
<h4 id="自动机：">自动机：</h4>
<p>Automaton/Automata 状态集+转移函数</p>
<h4 id="RE：">RE：</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622172316744.png" class="" title="image-20230622172316744">
<p>RE与DFA与NFA表达能力是等价的，所以可以相互转换</p>
<h4 id="DFA与NFA：">DFA与NFA：</h4>
<p>确定性和非确定性有穷自动机</p>
<p>DFA一个状态通过一个字符转移只能有一个确定的状态（也就是隐含了无法使用空串进行转移</p>
<p><strong>NFA 简洁易于理解, 便于描述语言 <em>L</em>(<em>A</em>)</strong></p>
<p><strong>DFA 易于判断 <em>x</em> <em>∈</em> <em>L</em>(<em>A</em>), 适合产生词法分析器</strong></p>
<p>用 NFA 描述语言, 用 DFA 实现词法分析器</p>
<p>RE =<em>⇒</em> NFA =<em>⇒</em> DFA =<em>⇒</em> 词法分析器</p>
<h4 id="DFA的死状态：">DFA的死状态：</h4>
<blockquote>
<p>死状态的画法：圈里面套个类似空集的符号</p>
</blockquote>
<h3 id="Thompson-构造法-从RE到-NFA">Thompson 构造法 (从RE到 NFA)</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622171006623.png" class="" title="image-20230622171006623">
<blockquote>
<p>外面的q/f是新增的开始和截止状态</p>
</blockquote>
<h4 id="一个例子">一个例子</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622173337939.png" class="" title="image-20230622173337939">
<blockquote>
<p>画完记得重标下状态序号</p>
</blockquote>
<h3 id="子集构造法-NFA-到-DFA">子集构造法 (NFA 到 DFA)</h3>
<p>一开始的状态可以是0,1,2,4,7</p>
<p>再看通过a,b可以转移到哪里，注意空串转移也算可到</p>
<p>某个状态包含NFA的某一个结束状态，就是DFA的结束状态</p>
<blockquote>
<p>可以有多个结束状态，2022-hw2甚至全是结束状态</p>
<p>做的时候直接看某个节点有没有通过某个字符的路径，不需要考虑他空串转移了再继续，因为他空串转移能到的那个状态本身也会在这个集合里</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622194807211.png" class="" title="image-20230622194807211">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622194743475.png" class="" title="image-20230622194743475">
<h3 id="DFA-最小化">DFA 最小化</h3>
<p>一开始分成接受状态，非接受状态，死状态<strong>三类</strong></p>
<blockquote>
<p>课上的例子遗漏了补充死状态</p>
</blockquote>
<p>这三者肯定不等价，然后就是回到死状态的肯定跟不到的不一样，所以要补上死状态</p>
<ol>
<li>先划分等价类</li>
<li>再合并状态</li>
</ol>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622201739476.png" class="" title="image-20230622201739476">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622201828915.png" class="" title="image-20230622201828915">
<h2 id="题目2-LL语法分析">题目2 LL语法分析</h2>
<h3 id="前置知识-2">前置知识</h3>
<h4 id="LL1文法：">LL1文法：</h4>
<p>L的含义：</p>
<p>第一个L表示 从左向右读入词法单元</p>
<p>第二个L表示 总是选择最左边的非终结符进行展开</p>
<p>语法分析的算法主要有两大类LR和LL，LL自顶向下，LR自底向上，我们只考虑无二义性的文法</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622203259136.png" class="" title="image-20230622203259136">
<h4 id="预测分析表：用于选择产生式">预测分析表：用于选择产生式</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622203820425.png" class="" title="image-20230622203820425">
<blockquote>
<p>当前读到某个非终结符，该选用那条产生式展开，这就是预测分析表的作用</p>
</blockquote>
<h4 id="First集合：对所有产生式的右部求">First集合：对所有产生式的右部求</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622204247007.png" class="" title="image-20230622204247007">
<blockquote>
<p>参照上例</p>
<p>如果当前指针指向的是a2，A有三条展开式，只有第一条的右部的FIRST中包含a2，那么选用第一条产生式</p>
<p>FIRST集合可能会有空串符号</p>
</blockquote>
<h4 id="Follow集合：对所有非终结符">Follow集合：对所有非终结符</h4>
<p>其实FOLLOW集合就是对FIRST集合做了进一步补充和防备？</p>
<p>因为FIRST可能推出空串，所以需要FOLLOW集合辅助判断</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622205655897.png" class="" title="image-20230622205655897">
<blockquote>
<p>FOLLOW集合可能有结束符$</p>
</blockquote>
<h3 id="•-First-集合与-Follow-集合">• First 集合与 Follow 集合</h3>
<h4 id="计算FIRST">计算FIRST</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622210009638.png" class="" title="image-20230622210009638">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622210107455.png" class="" title="image-20230622210107455">
<h5 id="例子">例子</h5>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622211046488.png" class="" title="image-20230622211046488">
<p>看一眼右边所有的可能性，发现要先计算FIRST(X) FIRST(Y) FIRST(Z)，仔细想想这是显然的</p>
<blockquote>
<p>推到FIRSTZ 包含于 FIRSTZ，这句显然是废话</p>
<p>继续考虑FIRSTZ集合有没有空串就行了</p>
<p>大致看一下，发现是不行的</p>
</blockquote>
<h4 id="计算FOLLOW">计算FOLLOW</h4>
<p>注意下图说的是对X，不是对A</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622212559227.png" class="" title="image-20230622212559227">
<blockquote>
<p>如果是开始符号，FOLLOW集合中就加入$</p>
</blockquote>
<h5 id="例子：">例子：</h5>
<p><strong>先看X会在右侧哪里出现和是否是开始符号</strong></p>
<p>X是初始符，放入$</p>
<p>然后发现X会在Z-&gt;XYZ中</p>
<p>那么FLX就会包含<strong>FIRST(YZ)</strong>，先加入FIRSTY，加入了c，发现Y有可能是空串，那么FLX就会包含FIRSTZ，加入a,c,d</p>
<p>然后判断<strong>YZ</strong>整体会不会空，如果空了就要按照第二条把FOLLOWZ加到FOLLOWX里面</p>
<blockquote>
<p>FLZ是空，因为推到了FLZ包含FLZ，不再变化了</p>
</blockquote>
<h3 id="•-构造预测分析表">• 构造预测分析表</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622232028397.png" class="" title="image-20230622232028397">
<blockquote>
<p>上下两种表述等价，推导符号上面加个*表示经过多次推导（多次推导得到空串和空串属于FIRST alpha是等价的表述</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622232036113.png" class="" title="image-20230622232036113">
<blockquote>
<p>满足两者之一，即可填入</p>
</blockquote>
<p><strong>行是终结符和$，列是非终结符</strong></p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230622235125782.png" class="" title="image-20230622235125782">
<h3 id="•-判断文法是否是LL-1-文法">• 判断文法是否是LL(1)文法</h3>
<p>预测分析表无冲突，即为LL1文法</p>
<h2 id="题目3-LR语法分析">题目3 LR语法分析</h2>
<blockquote>
<p>考试时会给出 LR(0) 自动机</p>
</blockquote>
<h3 id="•-掌握-LR-0-自动机的构造方法以及-SLR-1-表格的构造方法">• 掌握 LR(0) 自动机的构造方法以及 SLR(1) 表格的构造方法</h3>
<h3 id="•-掌握-LR-0-自动机与栈之间的交互运行过程">• 掌握 LR(0) 自动机与栈之间的交互运行过程</h3>
<h2 id="题目4-ANTLR4与“优先级上升算法”">题目4 ANTLR4与“优先级上升算法”</h2>
<h3 id="前置知识-3">前置知识</h3>
<p>消除左递归：</p>
<p>因为自顶向下的算法如LL1没法处理左递归，所以需要先改写一下</p>
<p>书P134</p>
<blockquote>
<p>不考查 ANTLR 4 AllStar 算法的其余内容</p>
<p>不考查LR1、LALR1</p>
</blockquote>
<h3 id="•-能够根据优先级上升算法改造给定文法">• 能够根据优先级上升算法改造给定文法</h3>
<h3 id="•-能够给出给定输入在改造后的文法下对应的语法分析树">• 能够给出给定输入在改造后的文法下对应的语法分析树</h3>
<p><strong>antlr4不能处理间接左递归</strong>，但是<code>直接左递归</code>可以，并且处理的很好</p>
<blockquote>
<p>注意是非左递归，不是像我们前面一样写成右递归，右递归不太好看，且存在一定问题（结合性问题好像是）</p>
</blockquote>
<h4 id="重点：antlr如何处理优先级和直接左递归？">重点：antlr如何<code>处理优先级</code>和<code>直接左递归</code>？</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410211520448.png" class="" title="image-20230410211520448">
<p>使用该命令可看到antlr把上述语法改写成什么样</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410211927751.png" class="" title="image-20230410211927751">
<p>看上去大体上是把递归改写成了循环</p>
<p>对应一段带参数的递归函数</p>
<blockquote>
<p><mark>这张图上的算法是有助于理解的</mark></p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410212354906.png" class="" title="image-20230410212354906">
<h4 id="优先级怎么定的">优先级怎么定的</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410212636567.png" class="" title="image-20230410212636567">
<h4 id="例子1-2-3">例子1+2+3</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410213228783.png" class="" title="image-20230410213228783">
<p>匹配加法展开后参数_p变成4，目的是为了让加法优先级高的才能继续向下深入展开，因为语法树的优先级越往下展开越高，乘法同理，_p相当于一个判断能否展开的当前优先级</p>
<h4 id="例子1-2-3-2">例子1+2*3</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410213708956.png" class="" title="image-20230410213708956">
<h4 id="根本问题">根本问题</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410213741515.png" class="" title="image-20230410213741515">
<h4 id="另一个例子">另一个例子</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410213934203.png" class="" title="image-20230410213934203">
<h4 id="优先级一定就是要上升-1吗">优先级一定就是要上升+1吗</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410214150813.png" class="" title="image-20230410214150813">
<p><code>-</code>右结合</p>
<p><code>!</code>左结合</p>
<p>改写：</p>
 <img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410214820860.png" class="" title="image-20230410214820860">
<p><code>-</code>是右结合，不是左递归的，所以放在上面的部分，并且优先级不变</p>
<p><code>!</code>左结合左递归但是是一元的左结合运算符，不需要再调用expr[]递归函数</p>
<h4 id="例子：-a-b">例子：-a+b!</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410215257229.png" class="" title="image-20230410215257229">
<p><strong>注意</strong>从E[4]返回时代码中是返回到第一个括号后，而不是回到最开始，所以开始匹配加号（进入了带*的那个循环里</p>
<h4 id="二元左递归运算符想要右结合">二元左递归运算符想要右结合</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86/review-compileprinciple/image-20230410215713340.png" class="" title="image-20230410215713340">
<p><mark>反正就是右结合不升级，左结合升一级</mark></p>
<h2 id="题目5-语法制导的翻译">题目5 语法制导的翻译</h2>
<blockquote>
<p>不考查 ANTLR 4 中的写法</p>
</blockquote>
<h3 id="•-语法制导的翻译">• 语法制导的翻译</h3>
<h2 id="题目6-目标代码生成">题目6 目标代码生成</h2>
<h3 id="•-给定一段-C-语言程序-含过程调用-与对应的-RISC-V-代码片段-填充缺失的代码行。">• 给定一段 C 语言程序 (含过程调用) 与对应的 RISC-V 代码片段, 填充缺失的代码行。</h3>
</div>

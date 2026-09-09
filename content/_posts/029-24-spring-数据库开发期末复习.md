---
title: "24-Spring-数据库开发期末复习"
permalink: "/posts/期末复习/数据库开发/24-spring-数据库开发期末复习.html"
date: "2024-06-15T15:21:51.000Z"
updated: "2024-09-30T12:51:33.130Z"
cover: "/generated-covers/029-24-spring-数据库开发期末复习.webp"
description: "24 Spring 数据库开发复习，先看三道 SQL 和索引结构。"
categories:
  - "期末复习"
  - "数据库开发"
tags:
  - "数据库"
---

<!-- Migrated from posts/期末复习/数据库开发/24-spring-数据库开发期末复习.html. Keep the permalink stable. -->
<div class="legacy-content">
<blockquote>
<p>24 Spring 数据库开发期末复习</p>
<p>ChrisDing1105 version 1.4</p>
<p>Salute to the Legendary Software Workers <a class="link" target="_blank" rel="noopener" href="https://github.com/SEBugMaker">SEBugMaker <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a> <a class="link" target="_blank" rel="noopener" href="https://github.com/ZUOHS">ZUOHS <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a> <a class="link" target="_blank" rel="noopener" href="https://github.com/huangwei021230">huangwei021230 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a> <a class="link" target="_blank" rel="noopener" href="https://github.com/quas-modo">quas-modo <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>文字版复习录音转写：<a class="link" target="_blank" rel="noopener" href="https://d412hlgjpp.feishu.cn/docx/YsHfdpdljomhApx3kOlcutVQnRf?from=from_copylink">https://d412hlgjpp.feishu.cn/docx/YsHfdpdljomhApx3kOlcutVQnRf?from=from_copylink <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<h2 id="题型">题型</h2>
<h3 id="难点：三道SQL">难点：三道SQL</h3>
<h4 id="时间、字符串、数值三选二">时间、字符串、数值三选二</h4>
<p>代码行数不会超过15-20</p>
<p>关键是要记得常见的函数:replace等</p>
<p>数值要考虑空值(平均值) COALESCE 中位数、众数不太好考</p>
<p>日期要知道使用索引有三种写法(前一天后一天范围怎么写、算日期之间的差 practice on class7.7)</p>
<p>标注用的mysql还是oracle</p>
<h4 id="会考一个递归-withas-树状结构自顶向下查询">会考一个递归(withas) 树状结构自顶向下查询</h4>
<p>起始体，union all，递归体，合并成一个视图的形式，最后写一句sql</p>
<h4 id="有一道可能会使用外连接">有一道可能会使用外连接</h4>
<p>会把外连接和那几个sql的计算变量融在一起</p>
<p>结构合理、关键字合理，函数用对都有分，细节对了全分</p>
<p>实在不会就写select from，不要空</p>
<h3 id="索引结构一定会考">索引结构一定会考</h3>
<p>n n+1个link</p>
<p>B树？对枝叶节点插入，如果满了会造成分裂，删除可能造成合并 在叶节点和内部节点不一样，是什么逻辑，怎么影响上面的节点(那两张图)</p>
<p>讲过例子，看下PPT</p>
<h3 id="日志">日志</h3>
<p>redo undo 怎么完成、区别，怎么实现(物理组织的PPT里写清楚了)</p>
<h3 id="分区分表分库">分区分表分库</h3>
<p>也是在物理组织部分</p>
<p>原因是什么，能够解决什么问题，会遇到什么问题（又怎么解决）</p>
<h3 id="SQL解释器：基于成本和基于规则">SQL解释器：基于成本和基于规则</h3>
<p>可能会考一个，关于SQL基于成本呢解释器的成本计算，成本优化？</p>
<p>（知道sql优化的基本逻辑）怎么计算优化路径的成本呢</p>
<p>等价变化，算出多个路径，估算每个路径的成本，哪些估算哪些是实际的，，有什么问题，为什么要改写sql</p>
<h3 id="送分题">送分题?</h3>
<p>可能还会再出一道题，自己思考，有什么建议和想法，纯粹的主观题</p>
<blockquote>
<p>以下为复习部分</p>
</blockquote>
<h2 id="SQL">SQL</h2>
<h3 id="聚合函数">聚合函数</h3>
<p>注意：当使用聚合函数（如 MAX, SUM, AVG 等）时，所有非聚合字段必须出现在 GROUP BY ⼦句中。否则，SQL 引擎无法确定如何处理这些字段。</p>
<p>Select后面接的结果集字段只有两种</p>
<ul>
<li>要么是group by出现的字段</li>
<li>要么是group by后出现的字段+聚合函数的组合</li>
</ul>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616154704762.png" alt="image-20240616154704762"></p>
<blockquote>
<p>但实际运行好像无论MySQL5.7还是8.0也能选没group的</p>
</blockquote>
<h3 id="NULL如何成组">NULL如何成组?</h3>
<p>利用coalesce函数</p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616155109877.png" alt="image-20240616155109877"></p>
<h3 id="coalesce函数">coalesce函数</h3>
<p><code>COALESCE</code> 是 SQL 中的一个函数，它的作用是返回第一个非空表达式的结果。如果所有的表达式都是空（NULL），则 <code>COALESCE</code> 函数返回 NULL。这个函数常用于处理可能为 NULL 的数据列，确保查询结果中不会出现 NULL 值，而是使用一个默认的值。</p>
<p>语法：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">COALESCE</span>(expression1, expression2, ..., expressionN)</span><br></pre></td></tr></tbody></table></figure></div>
<p>参数：</p>
<p><code>expression1, expression2, ..., expressionN</code>：可以是列名或值，<code>COALESCE</code> 会从左到右检查这些表达式，返回第一个非 NULL 的结果。</p>
<h3 id="字符串">字符串</h3>
<h4 id="substr-完整str-pos-长度">substr(完整str, pos, 长度)</h4>
<p>Q：把EMP表中的ENAME=KING的字符串拆开显示为4行，每行一个字符</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">select</span> substr(e.ename, iter.pos, <span class="number">1</span>) <span class="keyword">as</span> C</span><br><span class="line"><span class="keyword">from</span> (<span class="keyword">select</span> ename <span class="keyword">from</span> emp <span class="keyword">where</span> ename <span class="operator">=</span> <span class="string">'KING'</span>) e,</span><br><span class="line">(<span class="keyword">select</span> id <span class="keyword">as</span> pos <span class="keyword">from</span> t10) iter</span><br><span class="line"><span class="keyword">where</span> iter.pos <span class="operator">&lt;=</span> length(e.ename)</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>t10表</strong></p>
<p><code>t10</code> 表：这是一个特殊的表，通常在 Oracle 数据库中用来生成一个从 1 到 10 的数字序列。这个表的每一行都有一个 <code>id</code> 列，包含一个数字，用于表示序列中的一个位置。</p>
<blockquote>
<p>在 MySQL 数据库中，并没有像 Oracle 中的 <code>t10</code> 表这样的内置表来直接生成数字序列。不过，MySQL 可以通过其他方式来生成数字序列，例如使用递归的公用表表达式（Common Table Expressions, CTE）或者临时表。</p>
<p>以下是使用递归 CTE 生成数字序列的一个例子：</p>
<div class="highlight-container" data-rel="Pgsql"><figure class="iseeu highlight pgsql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line">复制<span class="keyword">WITH</span> <span class="keyword">RECURSIVE</span> num(n) <span class="keyword">AS</span> (</span><br><span class="line">  <span class="keyword">SELECT</span> <span class="number">1</span></span><br><span class="line">  <span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line">  <span class="keyword">SELECT</span> n + <span class="number">1</span> <span class="keyword">FROM</span> num <span class="keyword">WHERE</span> n &lt; <span class="number">10</span></span><br><span class="line">)</span><br><span class="line"><span class="keyword">SELECT</span> * <span class="keyword">FROM</span> num;</span><br></pre></td></tr></tbody></table></figure></div>
<p>这个递归 CTE 会生成从 1 到 10 的数字序列。你可以调整 <code>n &lt; 10</code> 的条件来改变生成的序列长度。</p>
</blockquote>
<h4 id="replace函数">replace函数</h4>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">REPLACE(string, <span class="keyword">search</span>, replace)</span><br></pre></td></tr></tbody></table></figure></div>
<p>参数（会替换所有的）</p>
<ul>
<li><code>string</code>：要搜索和替换的原始字符串。</li>
<li><code>search</code>：要在 <code>string</code> 中搜索的子字符串。</li>
<li><code>replace</code>：用于替换 <code>search</code> 子字符串的新字符串。</li>
</ul>
<p><strong>使用 <code>REPLACE</code> 统计字符出现次数</strong></p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> (length(<span class="string">'10,CLARK,MANAGER'</span>) <span class="operator">-</span> length(REPLACE(<span class="string">'10,CLARK,MANAGER'</span>, <span class="string">','</span>, <span class="string">''</span>))) <span class="operator">/</span> length(<span class="string">','</span>) <span class="keyword">as</span> cnt;</span><br></pre></td></tr></tbody></table></figure></div>
<p>思路：把找到的字符串换成空，再计算长度差，注意除以本身长度</p>
<h4 id="translate函数">translate函数</h4>
<p>感觉就是强化版replace</p>
<p><strong>语法（Oracle）：</strong></p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">TRANSLATE</span>(string, from_string, to_string)</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>参数：</strong></p>
<ul>
<li><code>string</code>：要进行字符转换的原始字符串。</li>
<li><code>from_string</code>：一个包含要被替换的字符的字符串。</li>
<li><code>to_string</code>：一个包含用于替换的字符的字符串，顺序应与 <code>from_string</code> 中的字符顺序相对应。</li>
</ul>
<p><strong>删除不想要的字符</strong></p>
<p>Oracle才有translate</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">select</span> replace(<span class="built_in">translate</span>(ename, <span class="string">'AEIOU'</span>,<span class="string">'aaaaa'</span>), <span class="string">'a'</span>, <span class="string">''</span>) <span class="keyword">as</span> stripped1,</span><br><span class="line">       sal</span><br><span class="line">       replace(sal, <span class="number">0</span>, <span class="string">''</span>) <span class="keyword">as</span> stripped2 <span class="keyword">from</span> emp  </span><br></pre></td></tr></tbody></table></figure></div>
<p>先全换成某个字符，比如’a’，然后再删掉</p>
<h4 id="regexp-replace">regexp_replace</h4>
<p>分离数字和字符数据</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">select</span> data,</span><br><span class="line">    regexp_replace(ename, <span class="string">'[0-9]'</span>, <span class="string">''</span>) <span class="keyword">as</span> characters</span><br><span class="line">    regexp_replace(ename, <span class="string">'[^0-9]'</span>, <span class="string">''</span>) <span class="keyword">as</span> numbers</span><br><span class="line"><span class="keyword">from</span> emp</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="regexp">regexp</h4>
<p>判断是否含有数字或字符</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">select</span> ename <span class="keyword">from</span> V</span><br><span class="line"><span class="keyword">where</span> ename regexp <span class="string">'[^0-9a-zA-Z]'</span> <span class="operator">=</span> <span class="number">0</span></span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="rpad">rpad</h4>
<blockquote>
<p>Oracle/Postgre</p>
</blockquote>
<p><code>RPAD</code> 函数的语法如下：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">RPAD(string, length, pad_string)</span><br></pre></td></tr></tbody></table></figure></div>
<ul>
<li><code>string</code>：要填充的原始字符串。</li>
<li><code>length</code>：目标字符串的长度。</li>
<li><code>pad_string</code>：用来填充的字符串。</li>
</ul>
<p>Q：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> REPLACE(</span><br><span class="line">    REPLACE(</span><br><span class="line">        <span class="built_in">TRANSLATE</span>(REPLACE(<span class="string">'Stewie Griffin'</span>, <span class="string">'.'</span>, <span class="string">''</span>), </span><br><span class="line">            <span class="string">'abcdefghijklmnopqrstuvwxyz'</span>, </span><br><span class="line">            RPAD(<span class="string">'#'</span>, <span class="number">26</span>, <span class="string">'#'</span>)), <span class="string">'#'</span>, <span class="string">''</span>), <span class="string">' '</span>, <span class="string">'.'</span>) <span class="operator">||</span> <span class="string">'.'</span></span><br><span class="line"><span class="keyword">FROM</span> t1;</span><br></pre></td></tr></tbody></table></figure></div>
<p><code>Stewie Griffin</code> -&gt; <code>Stewie Griffin</code> -&gt; <code>S##### G######</code> -&gt; <code>S G</code> -&gt; <code>S.G</code> -&gt; <code>S.G.</code></p>
<h3 id="数值处理">数值处理</h3>
<h4 id="平均值（要考虑空值">平均值（要考虑空值</h4>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">select</span> <span class="built_in">avg</span>(<span class="built_in">coalesce</span>(salary, <span class="number">0</span>)) <span class="keyword">as</span> average_score <span class="keyword">from</span> emp</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="累计求和-Running-Total">累计求和 Running Total</h4>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">select</span> e.ename, e.sal</span><br><span class="line">    (<span class="keyword">select</span> <span class="built_in">sum</span>(d.sal) <span class="keyword">from</span> emp d</span><br><span class="line">    <span class="keyword">where</span> d.empno <span class="operator">&lt;=</span> e.empno) <span class="keyword">as</span> runnin_total</span><br><span class="line"><span class="keyword">from</span> emp e</span><br><span class="line"><span class="keyword">order</span> <span class="keyword">by</span> <span class="number">3</span></span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>没什么新的</p>
</blockquote>
<h4 id="条件语句-百分比">条件语句-百分比</h4>
<p><strong>IF</strong>（适合简单语句）</p>
<p>IF(condition, result_if_true, result_if_false)</p>
<p><strong>CASE WHEN</strong>（适合多条件）</p>
<p><code>CASE WHEN</code> 是一个通用的 SQL 语句，用于实现复杂的条件判断。它可以用于所有支持 SQL 的数据库，包括 MySQL、PostgreSQL、Oracle、SQL Server 等。</p>
<p><strong>语法</strong></p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">CASE</span></span><br><span class="line">    <span class="keyword">WHEN</span> condition1 <span class="keyword">THEN</span> result1</span><br><span class="line">    <span class="keyword">WHEN</span> condition2 <span class="keyword">THEN</span> result2</span><br><span class="line">    ...</span><br><span class="line">    <span class="keyword">ELSE</span> resultN</span><br><span class="line"><span class="keyword">END</span></span><br></pre></td></tr></tbody></table></figure></div>
<p>计算部门编号为10的员工薪水总和占所有员工薪水总和的百分比。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> </span><br><span class="line">    (<span class="built_in">SUM</span>(IF(deptno <span class="operator">=</span> <span class="number">10</span>, sal, <span class="number">0</span>)) <span class="operator">/</span> <span class="built_in">SUM</span>(sal)) <span class="operator">*</span> <span class="number">100</span> <span class="keyword">AS</span> pct</span><br><span class="line"><span class="keyword">FROM</span> emp;</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="计算平均值时去掉最大值和最小值">计算平均值时去掉最大值和最小值</h4>
<p>注意最大最小可能不止一个，所以用not in</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> <span class="built_in">AVG</span>(sal)</span><br><span class="line"><span class="keyword">FROM</span> emp</span><br><span class="line"><span class="keyword">WHERE</span> sal <span class="keyword">NOT</span> <span class="keyword">IN</span> (</span><br><span class="line">    (<span class="keyword">SELECT</span> <span class="built_in">MIN</span>(sal) <span class="keyword">FROM</span> emp),</span><br><span class="line">    (<span class="keyword">SELECT</span> <span class="built_in">MAX</span>(sal) <span class="keyword">FROM</span> emp)</span><br><span class="line">);</span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>Tag: 修改累计值 没看</p>
</blockquote>
<h3 id="日期处理">日期处理</h3>
<p><strong>需要知道算日期的差</strong></p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">date_add(hiredate, <span class="type">interval</span> <span class="number">-5</span> <span class="keyword">day</span>) <span class="keyword">as</span> hd_add_1D</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>相差的日期</strong></p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">date_diff(ward_hd, allen_hd)</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>依据特定时间单位检索数据</strong></p>
<p><strong>monthname，dayname</strong></p>
<p>MYSQL</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> ename</span><br><span class="line"><span class="keyword">FROM</span> emp</span><br><span class="line"><span class="keyword">WHERE</span> MONTHNAME(hiredate) <span class="keyword">IN</span> (<span class="string">'February'</span>, <span class="string">'December'</span>)</span><br><span class="line">   <span class="keyword">OR</span> DAYNAME(hiredate) <span class="operator">=</span> <span class="string">'Tuesday'</span>;</span><br></pre></td></tr></tbody></table></figure></div>
<h3 id="Union">Union</h3>
<p>Union All + Distinct = Union</p>
<p>Union All不去重</p>
<blockquote>
<p>⼤体⽽⾔，使用union等同于针对union all的输出结果，再执⾏⼀次distinct操作</p>
</blockquote>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> CONCAT(ename, <span class="string">' '</span>, dname) <span class="keyword">AS</span> ename_and_dname, deptno</span><br><span class="line"><span class="keyword">FROM</span> emp</span><br><span class="line"><span class="keyword">JOIN</span> dept <span class="keyword">ON</span> emp.deptno <span class="operator">=</span> dept.deptno</span><br><span class="line"><span class="keyword">WHERE</span> emp.deptno <span class="operator">=</span> <span class="number">10</span></span><br><span class="line"></span><br><span class="line"><span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line"><span class="keyword">SELECT</span> <span class="string">'----------'</span> <span class="keyword">AS</span> ename_and_dname, <span class="keyword">NULL</span> <span class="keyword">AS</span> deptno</span><br><span class="line"></span><br><span class="line"><span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line"><span class="keyword">SELECT</span> dname <span class="keyword">AS</span> ename_and_dname, deptno</span><br><span class="line"><span class="keyword">FROM</span> dept;</span><br></pre></td></tr></tbody></table></figure></div>
<p>注意select选的两个要一样</p>
<h3 id="连接">连接</h3>
<p>join = inner join；left join = left outer join等</p>
<p>在 SQL 中，连接是用来结合两个或多个表的记录的一种机制。根据关联条件的不同，连接可以分为多种类型，主要包括内连接（INNER JOIN）、外连接（OUTER JOIN，具体又分为左外连接 LEFT JOIN、右外连接 RIGHT JOIN 和全外连接 FULL OUTER JOIN）以及交叉连接（CROSS JOIN）。下面详细解释每种连接类型，并给出示例。</p>
<h4 id="内连接（INNER-JOIN）">内连接（INNER JOIN）</h4>
<p><strong>内连接</strong>返回两个表中符合连接条件的记录。如果在一个表中的记录在另一个表中没有匹配，则这些记录不会出现在结果集中。</p>
<p><strong>示例</strong>：有两个表，一个是员工表 <code>employees</code>（包含员工编号 <code>eno</code> 和姓名 <code>ename</code>），另一个是部门表 <code>departments</code>（包含部门编号 <code>dno</code> 和部门名称 <code>dname</code>）。我们想找出所有员工及其所属部门的名称。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> employees.ename, departments.dname</span><br><span class="line"><span class="keyword">FROM</span> employees</span><br><span class="line"><span class="keyword">INNER</span> <span class="keyword">JOIN</span> departments</span><br><span class="line"><span class="keyword">ON</span> employees.dno <span class="operator">=</span> departments.dno;</span><br></pre></td></tr></tbody></table></figure></div>
<p>这个查询会返回所有存在于 <code>employees</code> 表和 <code>departments</code> 表中的匹配部门编号的员工姓名和部门名称。</p>
<h4 id="左外连接（LEFT-JOIN）">左外连接（LEFT JOIN）</h4>
<p><strong>左外连接</strong>返回左表（<code>LEFT JOIN</code> 左侧的表）的所有记录和右表中符合连接条件的记录。如果左表的记录在右表中没有匹配，则相关的右表列将返回 NULL。</p>
<p><strong>示例</strong>：使用上述的员工表和部门表，如果我们想列出所有员工及其可能的部门名称（即使某些员工没有部门信息）。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> employees.ename, departments.dname</span><br><span class="line"><span class="keyword">FROM</span> employees</span><br><span class="line"><span class="keyword">LEFT</span> <span class="keyword">JOIN</span> departments</span><br><span class="line"><span class="keyword">ON</span> employees.dno <span class="operator">=</span> departments.dno;</span><br></pre></td></tr></tbody></table></figure></div>
<p>这个查询会返回所有员工的姓名，对于那些没有部门的员工，部门名称会显示为 NULL。</p>
<h4 id="右外连接（RIGHT-JOIN）">右外连接（RIGHT JOIN）</h4>
<p><strong>右外连接</strong>与左外连接相反，它返回右表（<code>RIGHT JOIN</code> 右侧的表）的所有记录和左表中符合连接条件的记录。如果右表的记录在左表中没有匹配，则相关的左表列将返回 NULL。</p>
<p><strong>示例</strong>：如果我们想要列出所有部门及其可能的员工名称（即使某些部门没有员工）。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> employees.ename, departments.dname</span><br><span class="line"><span class="keyword">FROM</span> employees</span><br><span class="line"><span class="keyword">RIGHT</span> <span class="keyword">JOIN</span> departments</span><br><span class="line"><span class="keyword">ON</span> employees.dno <span class="operator">=</span> departments.dno;</span><br></pre></td></tr></tbody></table></figure></div>
<p>这个查询会返回所有部门的名称，对于那些没有员工的部门，员工名称会显示为 NULL。</p>
<h4 id="全外连接（FULL-OUTER-JOIN）">全外连接（FULL OUTER JOIN）</h4>
<p><strong>全外连接</strong>返回左表和右表中的所有记录。如果左表的记录在右表中没有匹配，或右表的记录在左表中没有匹配，则相关的另一侧表列将返回 NULL。注意，并非所有的 SQL 数据库系统都支持全外连接。</p>
<p><strong>示例</strong>：列出所有员工和所有部门，不论它们是否有匹配。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> employees.ename, departments.dname</span><br><span class="line"><span class="keyword">FROM</span> employees</span><br><span class="line"><span class="keyword">FULL</span> <span class="keyword">OUTER</span> <span class="keyword">JOIN</span> departments</span><br><span class="line"><span class="keyword">ON</span> employees.dno <span class="operator">=</span> departments.dno;</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="交叉连接（CROSS-JOIN）">交叉连接（CROSS JOIN）</h4>
<h4 id="交叉连接的语法">交叉连接的语法</h4>
<p>在SQL中，交叉连接的语法如下：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> <span class="operator">*</span></span><br><span class="line"><span class="keyword">FROM</span> table1</span><br><span class="line"><span class="keyword">CROSS</span> <span class="keyword">JOIN</span> table2;</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>或者可以用隐式的语法：</strong></p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> <span class="operator">*</span></span><br><span class="line"><span class="keyword">FROM</span> table1, table2;</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>交叉连接</strong>产生左表和右表的笛卡尔积，每个左表的记录与右表的每个记录相组合。</p>
<p><strong>示例</strong>：如果我们想要列出员工和部门的所有可能组合。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> employees.ename, departments.dname</span><br><span class="line"><span class="keyword">FROM</span> employees</span><br><span class="line"><span class="keyword">CROSS</span> <span class="keyword">JOIN</span> departments;</span><br></pre></td></tr></tbody></table></figure></div>
<p>这个查询将为每个员工与每个部门之间创建一个组合，不考虑他们之间是否有实际的关联。</p>
<h3 id="递归查询">递归查询</h3>
<blockquote>
<p>PPT 6.0 数据库设计</p>
<p>内含 树的三种实际实现：邻接模型、物化路径模型、嵌套集合模型</p>
<ol>
<li>
<p>邻接模型就像家庭树中的每个人都有一个“父亲”指向谁是他的父亲。每个节点都知道自己的父节点是谁，但不一定知道自己的子节点是谁。</p>
</li>
<li>
<p>物化路径模型就像每个分类都带有一张地图，指示它从根分类到当前分类的完整路径。</p>
<p>用相同的分类系统，这次每个分类记录路径：</p>
<table>
<thead>
<tr>
<th>id</th>
<th>name</th>
<th>path</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>电子产品</td>
<td>/1</td>
</tr>
<tr>
<td>2</td>
<td>笔记本电脑</td>
<td>/1/2</td>
</tr>
<tr>
<td>3</td>
<td>手机</td>
<td>/1/3</td>
</tr>
<tr>
<td>4</td>
<td>摄像机</td>
<td>/1/4</td>
</tr>
<tr>
<td>5</td>
<td>配件</td>
<td>/1/2/5</td>
</tr>
</tbody>
</table>
</li>
<li>
<p>嵌套集合模型就像每个分类都有一个范围，表示它和它的所有子分类的范围。范围用两个数字表示：左值（lft）和右值（rgt）。</p>
<p>还是相同的分类系统：</p>
<table>
<thead>
<tr>
<th>id</th>
<th>name</th>
<th>lft</th>
<th>rgt</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>电子产品</td>
<td>1</td>
<td>10</td>
</tr>
<tr>
<td>2</td>
<td>笔记本电脑</td>
<td>2</td>
<td>7</td>
</tr>
<tr>
<td>3</td>
<td>手机</td>
<td>8</td>
<td>9</td>
</tr>
<tr>
<td>4</td>
<td>摄像机</td>
<td>10</td>
<td>11</td>
</tr>
<tr>
<td>5</td>
<td>配件</td>
<td>3</td>
<td>4</td>
</tr>
</tbody>
</table>
<p>这里，<code>lft</code> 和 <code>rgt</code> 表示这个分类和它的子分类在树结构中的位置。</p>
</li>
</ol>
</blockquote>
<h4 id="with-as">with-as</h4>
<p><code>WITH</code> 语法（也称为公用表表达式，Common Table Expressions，<strong>CTE</strong>）在 SQL 中用于定义临时的结果集，这些结果集可以在单个查询的上下文中多次引用。它使复杂查询变得更清晰和更易于维护。下面是对 <code>WITH</code> 语法的详细解释和一些示例。</p>
<p>基本的 <code>WITH</code> 语法如下：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">WITH</span> cte_name <span class="keyword">AS</span> (</span><br><span class="line">    <span class="comment">-- 这里是子查询</span></span><br><span class="line">    <span class="keyword">SELECT</span> column1, column2, ...</span><br><span class="line">    <span class="keyword">FROM</span> table_name</span><br><span class="line">    <span class="keyword">WHERE</span> <span class="keyword">condition</span></span><br><span class="line">)</span><br><span class="line"><span class="keyword">SELECT</span> column1, column2, ...</span><br><span class="line"><span class="keyword">FROM</span> cte_name</span><br><span class="line"><span class="keyword">WHERE</span> <span class="keyword">condition</span>;</span><br></pre></td></tr></tbody></table></figure></div>
<p>示例</p>
<p>假设有一个员工表 <code>emp</code>，我们想要计算每个部门的平均工资，然后找出平均工资高于特定值的部门。</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">WITH</span> avg_salaries <span class="keyword">AS</span> (</span><br><span class="line">    <span class="keyword">SELECT</span> deptno, <span class="built_in">AVG</span>(sal) <span class="keyword">AS</span> avg_sal</span><br><span class="line">    <span class="keyword">FROM</span> emp</span><br><span class="line">    <span class="keyword">GROUP</span> <span class="keyword">BY</span> deptno</span><br><span class="line">)</span><br><span class="line"><span class="keyword">SELECT</span> deptno, avg_sal</span><br><span class="line"><span class="keyword">FROM</span> avg_salaries</span><br><span class="line"><span class="keyword">WHERE</span> avg_sal <span class="operator">&gt;</span> <span class="number">5000</span>;</span><br></pre></td></tr></tbody></table></figure></div>
<p>你可以定义多个 CTE，通过逗号分隔它们。</p>
<h4 id="递归-SQL-的语法">递归 SQL 的语法</h4>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">WITH</span> <span class="keyword">RECURSIVE</span> cte_name (column_list) <span class="keyword">AS</span> (</span><br><span class="line">    <span class="comment">-- 初始查询</span></span><br><span class="line">    <span class="keyword">SELECT</span> ...</span><br><span class="line">    <span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line">    <span class="comment">-- 递归查询</span></span><br><span class="line">    <span class="keyword">SELECT</span> ...</span><br><span class="line">    <span class="keyword">FROM</span> cte_name</span><br><span class="line">    <span class="keyword">WHERE</span> ...</span><br><span class="line">)</span><br><span class="line"><span class="comment">-- 主查询</span></span><br><span class="line"><span class="keyword">SELECT</span> ...</span><br><span class="line"><span class="keyword">FROM</span> cte_name</span><br><span class="line"><span class="keyword">WHERE</span> ...;</span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>关于column_list</p>
<p>你的递归CTE的写法是正确的，即使没有显式地写出 <code>column_list</code>。在许多SQL数据库中， <code>column_list</code> 是可选的，如果你在初始查询和递归查询中明确了所选列，那么数据库系统会自动推断出列名。</p>
<p>不过，为了代码的可读性和维护性，显式地写出 <code>column_list</code> 会更好，特别是在列名较多或结构复杂的情况下。这可以帮助你和其他阅读代码的人更清楚地了解CTE的输出列结构。</p>
<p>你可以显式地写出 <code>column_list</code>，像这样：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">WITH</span> <span class="keyword">RECURSIVE</span> DepartmentHierarchy (dept_id, parent_dept_id, dept_name, level) <span class="keyword">AS</span> (</span><br><span class="line">    <span class="comment">-- 初始查询：选择顶级部门（没有父部门）作为起点</span></span><br><span class="line">    <span class="keyword">SELECT</span> dept_id, parent_dept_id, dept_name, <span class="number">1</span> <span class="keyword">AS</span> level</span><br><span class="line">    <span class="keyword">FROM</span> Departments</span><br><span class="line">    <span class="keyword">WHERE</span> parent_dept_id <span class="keyword">IS</span> <span class="keyword">NULL</span></span><br><span class="line"></span><br><span class="line">    <span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line"></span><br><span class="line">    <span class="comment">-- 递归查询：连接上一级部门和当前部门</span></span><br><span class="line">    <span class="keyword">SELECT</span> d.dept_id, d.parent_dept_id, d.dept_name, dh.level <span class="operator">+</span> <span class="number">1</span></span><br><span class="line">    <span class="keyword">FROM</span> Departments d</span><br><span class="line">    <span class="keyword">JOIN</span> DepartmentHierarchy dh <span class="keyword">ON</span> d.parent_dept_id <span class="operator">=</span> dh.dept_id</span><br><span class="line">)</span><br><span class="line"><span class="comment">-- 主查询：查询所有部门及其层级关系</span></span><br><span class="line"><span class="keyword">SELECT</span> dept_id, parent_dept_id, dept_name, level</span><br><span class="line"><span class="keyword">FROM</span> DepartmentHierarchy</span><br><span class="line"><span class="keyword">ORDER</span> <span class="keyword">BY</span> level, dept_id;</span><br></pre></td></tr></tbody></table></figure></div>
<p>这样写的好处是：</p>
<ol>
<li><strong>明确性</strong>：清楚地定义了CTE的输出列。</li>
<li><strong>一致性</strong>：确保初始查询和递归查询的列名一致。</li>
<li><strong>可读性</strong>：提高代码的可读性，使得其他人更容易理解。</li>
</ol>
<p>总结来说，虽然不显式写出 <code>column_list</code> 在大多数情况下也是正确的，但显式地写出它有助于提高代码的清晰度和可维护性。</p>
</blockquote>
<p><strong>示例</strong></p>
<p>假设我们有一个部门表 <code>Departments</code>，其结构如下：</p>
<table>
<thead>
<tr>
<th>dept_id</th>
<th>parent_dept_id</th>
<th>dept_name</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>NULL</td>
<td>Corporate</td>
</tr>
<tr>
<td>2</td>
<td>1</td>
<td>Sales</td>
</tr>
<tr>
<td>3</td>
<td>1</td>
<td>HR</td>
</tr>
<tr>
<td>4</td>
<td>2</td>
<td>Domestic Sales</td>
</tr>
<tr>
<td>5</td>
<td>2</td>
<td>International Sales</td>
</tr>
<tr>
<td>6</td>
<td>3</td>
<td>Recruitment</td>
</tr>
<tr>
<td>7</td>
<td>3</td>
<td>Employee Relations</td>
</tr>
</tbody>
</table>
<p>希望查询所有部门及其层级关系</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">WITH</span> <span class="keyword">RECURSIVE</span> DepartmentHierarchy <span class="keyword">AS</span> (</span><br><span class="line">    <span class="comment">-- 初始查询：选择顶级部门（没有父部门）作为起点</span></span><br><span class="line">    <span class="keyword">SELECT</span> dept_id, parent_dept_id, dept_name, <span class="number">1</span> <span class="keyword">AS</span> level</span><br><span class="line">    <span class="keyword">FROM</span> Departments</span><br><span class="line">    <span class="keyword">WHERE</span> parent_dept_id <span class="keyword">IS</span> <span class="keyword">NULL</span></span><br><span class="line"></span><br><span class="line">    <span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line"></span><br><span class="line">    <span class="comment">-- 递归查询：连接上一级部门和当前部门</span></span><br><span class="line">    <span class="keyword">SELECT</span> d.dept_id, d.parent_dept_id, d.dept_name, dh.level <span class="operator">+</span> <span class="number">1</span></span><br><span class="line">    <span class="keyword">FROM</span> Departments d</span><br><span class="line">    <span class="keyword">JOIN</span> DepartmentHierarchy dh <span class="keyword">ON</span> d.parent_dept_id <span class="operator">=</span> dh.dept_id</span><br><span class="line">)</span><br><span class="line"><span class="comment">-- 主查询：查询所有部门及其层级关系</span></span><br><span class="line"><span class="keyword">SELECT</span> dept_id, parent_dept_id, dept_name, level</span><br><span class="line"><span class="keyword">FROM</span> DepartmentHierarchy</span><br><span class="line"><span class="keyword">ORDER</span> <span class="keyword">BY</span> level, dept_id;</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="关于递归查询的终止">关于递归查询的终止</h4>
<p>递归查询的结束条件由以下两部分决定：</p>
<ol>
<li><strong>递归查询部分的 <code>WHERE</code> 子句</strong>：用于控制递归的深度或范围。</li>
<li><strong>数据本身的结构</strong>：当没有更多的记录满足递归条件时，递归自然结束。</li>
</ol>
<p><u><strong>1.递归查询部分的 <code>WHERE</code> 子句</strong></u></p>
<p>在递归 CTE 中，<code>WHERE</code> 子句可以限制递归的范围或深度。例如，你可以通过 <code>WHERE</code> 子句限制递归的深度，以避免无限递归。虽然在你的示例中没有使用 <code>WHERE</code> 子句来限制递归，但在某些情况下，添加这样的限制可能是必要的。</p>
<p>示例：限制递归深度</p>
<p>假设我们希望限制部门层级的递归深度为3层，可以使用以下查询：</p>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">WITH</span> <span class="keyword">RECURSIVE</span> DepartmentHierarchy <span class="keyword">AS</span> (</span><br><span class="line">    <span class="comment">-- 初始查询：选择顶级部门（没有父部门）作为起点</span></span><br><span class="line">    <span class="keyword">SELECT</span> dept_id, parent_dept_id, dept_name, <span class="number">1</span> <span class="keyword">AS</span> level</span><br><span class="line">    <span class="keyword">FROM</span> Departments</span><br><span class="line">    <span class="keyword">WHERE</span> parent_dept_id <span class="keyword">IS</span> <span class="keyword">NULL</span></span><br><span class="line"></span><br><span class="line">    <span class="keyword">UNION</span> <span class="keyword">ALL</span></span><br><span class="line"></span><br><span class="line">    <span class="comment">-- 递归查询：连接上一级部门和当前部门，限制层级深度为3</span></span><br><span class="line">    <span class="keyword">SELECT</span> d.dept_id, d.parent_dept_id, d.dept_name, dh.level <span class="operator">+</span> <span class="number">1</span></span><br><span class="line">    <span class="keyword">FROM</span> Departments d</span><br><span class="line">    <span class="keyword">JOIN</span> DepartmentHierarchy dh <span class="keyword">ON</span> d.parent_dept_id <span class="operator">=</span> dh.dept_id</span><br><span class="line">    <span class="keyword">WHERE</span> dh.level <span class="operator">&lt;</span> <span class="number">3</span></span><br><span class="line">)</span><br><span class="line"><span class="comment">-- 主查询：查询所有部门及其层级关系</span></span><br><span class="line"><span class="keyword">SELECT</span> dept_id, parent_dept_id, dept_name, level</span><br><span class="line"><span class="keyword">FROM</span> DepartmentHierarchy</span><br><span class="line"><span class="keyword">ORDER</span> <span class="keyword">BY</span> level, dept_id;</span><br></pre></td></tr></tbody></table></figure></div>
<p>在这个查询中，递归查询的 <code>WHERE dh.level &lt; 3</code> 子句限制了递归的深度，确保不会超过3层。</p>
<p><u><strong>2. 数据本身的结构</strong></u></p>
<p>即使没有显式的结束条件，递归查询也会根据数据结构自然结束。当递归查询中没有新的记录生成时，递归就会自动结束。在你的示例中，每次递归都从 <code>Departments</code> 表中选择子部门，直到没有更多的子部门可以选择为止。</p>
<p>考虑以下数据结构：</p>
<table>
<thead>
<tr>
<th>dept_id</th>
<th>parent_dept_id</th>
<th>dept_name</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>NULL</td>
<td>Corporate</td>
</tr>
<tr>
<td>2</td>
<td>1</td>
<td>Sales</td>
</tr>
<tr>
<td>3</td>
<td>1</td>
<td>HR</td>
</tr>
<tr>
<td>4</td>
<td>2</td>
<td>Domestic Sales</td>
</tr>
<tr>
<td>5</td>
<td>2</td>
<td>International Sales</td>
</tr>
<tr>
<td>6</td>
<td>3</td>
<td>Recruitment</td>
</tr>
<tr>
<td>7</td>
<td>3</td>
<td>Employee Relations</td>
</tr>
</tbody>
</table>
<p>在上述数据中，部门4、5、6、7没有子部门，因此递归在达到这些部门时自然结束。</p>
<p><strong>递归 CTE 工作机制示意</strong></p>
<ol>
<li><strong>初始查询</strong>：找到顶级部门（没有父部门），作为递归的起点。</li>
<li><strong>递归查询</strong>：每次递归查询从上一步的结果集中选择子部门。</li>
<li><strong>结束条件</strong>：
<ul>
<li>显式结束条件：如 <code>WHERE dh.level &lt; 3</code> 限制递归深度。</li>
<li>隐式结束条件：当没有更多记录满足递归条件时，递归自然结束。</li>
</ul>
</li>
</ol>
<h2 id="B树">B树</h2>
<h3 id="背景-B树与磁盘">背景-B树与磁盘</h3>
<p>扇出（fanout）：每个节点允许最大的子节点</p>
<p><strong>高扇出</strong>，以改善临近键的数据局限性；<strong>低高度</strong>，以减少遍历期间的寻道次数</p>
<p>B树（B-Tree）是一种平衡树数据结构，广泛用于数据库和文件系统中。它的设计目标是减少磁盘访问次数，提高大规模数据存取的效率。以下是B树与磁盘以及寻道之间的关系：</p>
<h4 id="B树结构和磁盘的关系">B树结构和磁盘的关系</h4>
<h4 id="块结构与分页">块结构与分页</h4>
<ul>
<li><strong>节点大小与磁盘块大小匹配</strong>：B树的每个节点大小通常与磁盘的块大小（或页大小）匹配。这样，每次从磁盘读取一个节点时，可以充分利用磁盘的读写效率，因为一次I/O操作能够读取或写入完整的节点。</li>
<li><strong>减少磁盘I/O次数</strong>：由于B树具有较高的扇出（即每个节点可以有多个子节点），树的高度相对较低。这意味着查找、插入或删除操作所需的磁盘访问次数较少，从而减少了I/O操作的开销。</li>
</ul>
<h4 id="B树与寻道的关系">B树与寻道的关系</h4>
<h4 id="寻道时间">寻道时间</h4>
<ul>
<li><strong>降低寻道次数</strong>：B树通过其平衡性和高扇出特性，显著减少了需要访问的节点数量，进而降低了磁盘寻道的次数。寻道时间是机械硬盘中将磁头移动到目标轨道所需的时间，是磁盘访问延迟的一个重要组成部分。</li>
</ul>
<blockquote>
<p><strong><u>B树构建了一个快速导航和定位搜索项的层次结构，达到这个目标需要高扇出，低树高</u></strong></p>
</blockquote>
<h3 id="B树结构">B树结构</h3>
<p>概念、插入：<a class="link" target="_blank" rel="noopener" href="https://www.bilibili.com/video/BV1tJ4m1w7yR/?spm_id_from=333.788&amp;vd_source=54bdc0734ba281535b1404bbbce896ef">https://www.bilibili.com/video/BV1tJ4m1w7yR/?spm_id_from=333.788&amp;vd_source=54bdc0734ba281535b1404bbbce896ef <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>删除：<a class="link" target="_blank" rel="noopener" href="https://www.bilibili.com/video/BV1JU411d7iY/?spm_id_from=333.788&amp;vd_source=54bdc0734ba281535b1404bbbce896ef">https://www.bilibili.com/video/BV1JU411d7iY/?spm_id_from=333.788&amp;vd_source=54bdc0734ba281535b1404bbbce896ef <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p><strong>B树：多叉平衡搜索树</strong></p>
<p>B树需要满足三个特点(m阶B树就是最多有m个分支)</p>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616232633809.png" alt="image-20240616232633809" style="zoom: 25%;">
<blockquote>
<p>上取整</p>
</blockquote>
<p>内存与硬盘（并且会有查找失败的可能</p>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616232911847.png" alt="image-20240616232911847" style="zoom: 67%;">
<p><strong>B 树 与 B+树两者有何异同呢？</strong></p>
<ul>
<li>B 树的所有节点既存放键(key) 也存放数据(data)，而 B+树只有叶子节点存放 key 和 data，其他内节点只存放 key。</li>
<li>B 树的叶子节点都是独立的;B+树的叶子节点有一条引用链指向与它相邻的叶子节点。</li>
<li><strong>B 树的检索的过程</strong>相当于对范围内的每个节点的关键字做二分查找，**可能还没有到达叶子节点，检索就结束了。**而 <strong>B+树的检索效率</strong>就很稳定了，任何查找都是从根节点到叶子节点的过程，叶子节点的顺序检索很明显。</li>
<li>在 B 树中进行范围查询时，首先找到要查找的下限，然后对 B 树进行中序遍历，直到找到查找的上限；而 B+树的范围查询，只需要对链表进行遍历即可。</li>
</ul>
<p>综上，B+树与 B 树相比，具备更少的 IO 次数、更稳定的查询效率和更适于范围查询这些优势。</p>
<h3 id="B-树的节点分裂（叶节点）">B+树的节点分裂（叶节点）</h3>
<p><strong><u>B+树 叶节点 分裂 选一个移上去就行，需要复制，因为是非叶结点</u></strong></p>
<p>以下是4阶B树插入11：N是4-1=3</p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616235206850.png" alt="image-20240616235206850"></p>
<blockquote>
<p>这应该是B+树</p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616234710682.png" alt="image-20240616234710682"></p>
</blockquote>
<p>**Step 1: **查找算法定位目标叶节点，并将新值关联</p>
<p><strong>Step 2:</strong> 有空就插⼊，没空就叫“节点溢出”overflow，必须分裂</p>
<ol>
<li>C1:叶节点：只能放N个值（阶数-1）</li>
<li>C2:非叶节点：指针超过N+1（KEY也是只能N个）</li>
</ol>
<p>**Step 3: **分裂——分配新节点，将⼀半元素从原分裂节点传输给它，并添加它的第⼀个键和指向⽗节点的指针，这时候，键被提升了（promote）</p>
<p>执⾏分裂的数组下标称之为分裂点（也叫中点），分裂点之后的所有元素被传输到新创建的兄弟节点</p>
<blockquote>
<p>11插不进去，所以要分裂，先把原来的分裂下，13提上去</p>
</blockquote>
<h3 id="B-树的节点分裂（非叶节点）">B+树的节点分裂（非叶节点）</h3>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240616235311923.png" alt="image-20240616235311923"></p>
<p><strong><u>B+树 非叶节点 分裂选一个直接移上去就行，不需要复制，因为是非叶结点</u></strong></p>
<h3 id="B-树的叶节点合并（删除16后）">B+树的叶节点合并（删除16后）</h3>
<p><strong>如果是删除16</strong></p>
<p>删除可能会要节点合并</p>
<blockquote>
<p>删除会出现<strong>下溢出</strong>，也就是删完节点太少了，相邻加起来小于某个值了</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617000237631.png" alt="image-20240617000237631" style="zoom: 67%;">
<p>对于叶节点：两个相邻节点中的键值对数量 小于或等于 N</p>
<p>对于非叶节点：两个相邻节点中指针的数量 小于或等于 N+1（感觉是一个意思）</p>
<p><strong>如果是删除20</strong></p>
<p>⼀般50%是树状结构节点占用率的阈值</p>
<p>如果是删除20，那么20消失就行了</p>
<h3 id="B-树的非叶节点合并（删除10后）">B+树的非叶节点合并（删除10后）</h3>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617003550839.png" alt="image-20240617003550839" style="zoom:50%;">
<h3 id="B树的分裂（插入）-合并（删除）">B树的分裂（插入）/合并（删除）</h3>
<p><strong>B树</strong>的<strong>非叶结点</strong><u>分裂合并</u>与<strong>B+树</strong>的<strong>非叶结点</strong><u>分裂合并</u>是一致的</p>
<p><strong>B树</strong>的<strong>非叶结点</strong><u>分裂合并</u>与<strong>B树</strong>的<strong>叶结点</strong><u>分裂合并</u>是一致的</p>
<p>叶节点自行领会，B+树的叶都得复制之类的，大致理解下</p>
<h2 id="分区分表分库-2">分区分表分库</h2>
<p>• 分区</p>
<ul>
<li>就是把一张表的数据分成N个区块，在逻辑上看最终只是一张表，但底层是由N个物理区块组成的</li>
</ul>
<p>• 分表（手搓分区）</p>
<ul>
<li>就是把一张表按一定的规则分解成N个具有独立存储空间的实体表</li>
<li>系统读写时需要根据定义好的规则得到对应的字表明，然后操作它</li>
</ul>
<p>• 分库</p>
<blockquote>
<p>04 B+树结构的物理实现</p>
</blockquote>
<p>用来解决下列问题：</p>
<ul>
<li>I/O瓶颈
<ul>
<li>热点数据太多，数据缓存不够，每次查询产生大量I/O —— 分库，垂直分表</li>
<li>网络I/O瓶颈，带宽不够，连接数过多 —— 分库</li>
</ul>
</li>
<li>CPU瓶颈
<ul>
<li>SQL问题，join、group by、order by —— SQL优化，构建索引</li>
<li>单表数据量过大，扫描行太多，SQL效率过低 —— 水平分表</li>
</ul>
</li>
</ul>
<h3 id="分区">分区</h3>
<p>一张表的数据分为N个区块，在逻辑上看最终只是一张表，但底层是由N个物理区块组成的</p>
<h4 id="要解决的问题">要解决的问题</h4>
<p>分区是一种数据分组方式，数据分组可以：</p>
<p>1、提高<strong>并发性</strong>和<strong>并行性</strong></p>
<p>2、扩增系统架构的<strong>可伸缩性</strong></p>
<p>分区目标：</p>
<p>分区想做到的：查询时可以过滤掉很多无用分区、分区本身不会带来很多代价</p>
<h4 id="面对两大问题">面对两大问题</h4>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617150424273.png" alt="image-20240617150424273"></p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617150525113.png" alt="image-20240617150525113"></p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617150816868.png" alt="image-20240617150816868"></p>
<blockquote>
<p>• NULL值会使分区过滤无效（PATITION by RANGE COLUMN（order_date））</p>
<p>• 分区列和索引列不匹配（没有索引，或关联查询时关联条件不匹配索引）</p>
<p>• 选择分区的成本可能很高（范围分区的成本需要注意）</p>
<p><strong>• 打开并锁住所有底层表的成本可能很高（开销和分区类型无关，主键查找单行会带来明显开销）</strong></p>
<p>• 维护分区的成本可能很高</p>
</blockquote>
<h3 id="分库表">分库表</h3>
<p><strong>分区</strong>：将一个表划分成多个较小的部分（分区），逻辑上是一个表，物理上有多个部分。</p>
<p><strong>分表</strong>：将一个表水平拆分成多个独立的子表，可以分布在同一个或多个数据库实例中。</p>
<p><strong>分区表</strong>：将一个表按某种规则划分成多个分区，逻辑上是一个表，但在物理上存储在不同的区域。这是分区技术在一个表上的具体应用。</p>
<blockquote>
<p>感觉<strong>分区表</strong>就是一个管理底层表的东西？</p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617151531213.png" alt="image-20240617151531213"></p>
<h3 id="分表">分表</h3>
<p>一张表按照一定规则分为N个独立存储空间的实体表，系统读写时需要根据定义好的规则得到对应的字表明，然后操作</p>
<h4 id="解决什么问题">解决什么问题</h4>
<ul>
<li>
<p>分表后单表的并发能力提高了，磁盘I/O性能也提高了，写操作效率提高了</p>
<blockquote>
<p>因为单表的并发量小了，不用的表在不同的磁盘上，可以同时读写了</p>
</blockquote>
</li>
<li>
<p>数据分布在不同的文件，磁盘I/O性能提高了</p>
<blockquote>
<p>不用的表在不同的磁盘上，可以同时读写了</p>
</blockquote>
</li>
<li>
<p>读写锁影响的数据量变小</p>
<blockquote>
<p>当一个分表在进行写操作时，只会锁定这个小表，不会影响到其他分表的读写操作。</p>
</blockquote>
</li>
<li>
<p>插入数据库需要重新建立索引的数据量减少</p>
</li>
</ul>
<h4 id="会遇到的问题">会遇到的问题</h4>
<p><u><strong>如何保证插入不同表的多条记录（事务）要么同时成功，要么同时失败？</strong></u></p>
<ul>
<li>
<p>TCC 柔性事务</p>
<blockquote>
<p>TCC柔性事务的三个步骤包括：首先，在<strong>Try</strong>阶段，系统会预留必要的资源，但不进行最终的操作，比如预留库存、生成临时订单和冻结用户余额。接着，在<strong>Confirm</strong>阶段，如果所有尝试步骤都成功，系统将正式执行这些操作，真正扣减库存、生成正式订单并扣款。最后，如果任何尝试步骤失败，系统会进入<strong>Cancel</strong>阶段，取消预留的资源并恢复原状，比如释放预留库存、取消临时订单和解冻余额。这种机制确保了在分布式系统中，所有相关操作要么全部成功，要么全部失败。</p>
</blockquote>
</li>
</ul>
<p><u><strong>分表的实现方式（复杂）</strong></u></p>
<ul>
<li>需要业务系统配合升级，工作量大</li>
</ul>
<p><strong>跨分片查询低效</strong>：使用中间件来支持跨分片查询</p>
<p>**数据分布不均（数据倾斜）：**使用更好的划分算法，哈希之类的</p>
<p>**维护和管理复杂性：**自动化运维工具，中间件等</p>
<blockquote>
<p>补充 by GPT4o</p>
<p><strong>3. 全局唯一ID生成</strong>：</p>
<ul>
<li><strong>问题</strong>：在多个分表中插入数据时，需要确保每个记录有唯一的标识符（ID）。传统的自增ID可能会在不同的分表中产生冲突。</li>
<li>解决方案：
<ul>
<li><strong>UUID</strong>：使用全局唯一标识符（UUID），但UUID长度较长，且无序，影响性能。</li>
<li><strong>雪花算法（Snowflake）</strong>：生成全局唯一的、有序的ID，可以保证分布式系统中的唯一性和有序性。</li>
<li><strong>分布式ID生成服务</strong>：如Twitter的Snowflake、Flink的Flink ID等。</li>
</ul>
</li>
</ul>
<p><strong>4. 跨分片查询</strong>：</p>
<ul>
<li><strong>问题</strong>：有时需要对多个分表的数据进行联合查询（如统计分析），这类查询在分表环境中变得复杂和低效。</li>
<li>解决方案：
<ul>
<li><strong>应用层合并</strong>：在应用层对各个分表的查询结果进行合并。</li>
<li><strong>中间件</strong>：使用数据库中间件（如ShardingSphere、Vitess）来支持跨分片查询。</li>
<li><strong>预计算和缓存</strong>：预先计算常用的统计结果，存储在缓存或单独的聚合表中。</li>
</ul>
</li>
</ul>
<p><strong>5. 数据分布不均（数据倾斜）</strong>：</p>
<ul>
<li><strong>问题</strong>：如果分表规则不合理，可能导致部分分表的数据量过大或过小，造成负载不均衡，影响系统性能。</li>
<li>解决方案：
<ul>
<li><strong>合理的分片键</strong>：选择合适的分片键，保证数据均匀分布。</li>
<li><strong>动态分片</strong>：根据数据增长动态调整分片策略。</li>
<li><strong>哈希分片</strong>：使用哈希算法进行分片，通常能保证数据的均匀分布。</li>
</ul>
</li>
</ul>
<p><strong>6. 维护和管理复杂性</strong>：</p>
<ul>
<li><strong>问题</strong>：分表增加了数据库的维护和管理难度，如备份、恢复、监控等操作变得复杂。</li>
<li>解决方案：
<ul>
<li><strong>自动化运维工具</strong>：使用自动化工具进行分表的管理和运维，如备份和恢复脚本、监控系统等。</li>
<li><strong>数据库中间件</strong>：使用中间件简化分表的管理工作。</li>
</ul>
</li>
</ul>
<p><strong>7. 跨分片的事务管理</strong>：</p>
<ul>
<li><strong>问题</strong>：传统的单机事务无法跨多个分表执行，需要分布式事务支持。</li>
<li>解决方案：
<ul>
<li><strong>TCC柔性事务</strong>：如你所提到的，Try-Confirm-Cancel模式。</li>
<li><strong>XA协议</strong>：使用支持XA协议的数据库，进行两阶段提交。</li>
<li><strong>本地事务+补偿机制</strong>：先执行本地事务，再通过补偿机制确保最终一致性。</li>
</ul>
</li>
</ul>
<p><strong>8. 数据迁移和扩容</strong>：</p>
<ul>
<li><strong>问题</strong>：随着数据量增长，可能需要增加新的分表或重新分配数据，这些操作需要复杂的数据迁移。</li>
<li>解决方案：
<ul>
<li><strong>分片重平衡</strong>：使用工具进行分片重平衡，自动将数据迁移到新的分片。</li>
<li><strong>中间件支持</strong>：使用支持动态扩容和数据迁移的中间件。</li>
</ul>
</li>
</ul>
<p><strong>9. 索引管理</strong>：</p>
<ul>
<li><strong>问题</strong>：每个分表的索引需要单独管理，且在查询时需要考虑跨表的索引优化。</li>
<li>解决方案：
<ul>
<li><strong>统一索引策略</strong>：在所有分表上使用相同的索引策略，确保查询优化的一致性。</li>
<li><strong>全局索引</strong>：使用中间件或数据库支持全局索引，优化跨表查询。</li>
</ul>
</li>
</ul>
</blockquote>
<h4 id="分区和分表的区别和联系">分区和分表的区别和联系</h4>
<ul>
<li><u>目的都是减少数据库的负担，提高表的增删改查效率</u></li>
<li><u>分区只是一张表的物理存储位置发生变化，分表是将一张表分为多个实体表</u>
<ul>
<li>访问量大，数据大，两种配合</li>
<li>访问量不大，数据大，可以只分区（分表可以提升单表的并发能力，所以访问量不大只分个区也行</li>
<li>分表可以多库，分区不可以</li>
</ul>
</li>
<li>常见分区分表的策略是类似的</li>
</ul>
<h3 id="分库">分库</h3>
<p><strong>解决什么问题？</strong></p>
<ul>
<li>单台DB的存储空间不够</li>
<li>查询量的增加导致数据库服务器已经没法支撑</li>
</ul>
<p><strong>为什么要分库？</strong></p>
<p>突破单节点数据库服务器的I/O能力限制，解决数据库扩展性的问题</p>
<p><strong>怎么分库？</strong></p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617152718689.png" alt="image-20240617152718689"></p>
<p><strong>会遇到什么问题？</strong></p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617153056627.png" alt="image-20240617153056627"></p>
<h2 id="SQL成本计算">SQL成本计算</h2>
<blockquote>
<p>SQL解释器</p>
<ul>
<li>
<p>基于成本优化器</p>
<p>例如基于成本优化器的计算方式</p>
</li>
<li>
<p>基于规则优化器</p>
</li>
</ul>
</blockquote>
<h3 id="优化最重要的方向：连接">优化最重要的方向：连接</h3>
<p>连接就是把各个表中的记录都取出来依次进行匹配，并把匹配的组合返回</p>
<p>驱动表和被驱动表 A join B，A是驱动表</p>
<h4 id="嵌套循环连接">嵌套循环连接</h4>
<p>驱动表只访问一次，但被驱动表却可能被多次访问，访问次数取决于对驱动表执行单表查询后的结果集中的记录条数的连接执行方式称之为 嵌套循环连接 ( Nested-Loop Join )</p>
<blockquote>
<p>嵌套循环连接通过在外层循环中逐条读取驱动表记录，并在内层循环中查找被驱动表的匹配记录来实现连接。这种逐条匹配的过程类似于嵌套循环，因此得名嵌套循环连接（Nested-Loop Join）。</p>
</blockquote>
<div class="highlight-container" data-rel="Sql"><figure class="iseeu highlight sql"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">SELECT</span> customers.name, orders.order_id</span><br><span class="line"><span class="keyword">FROM</span> customers</span><br><span class="line"><span class="keyword">JOIN</span> orders <span class="keyword">ON</span> customers.customer_id <span class="operator">=</span> orders.customer_id;</span><br></pre></td></tr></tbody></table></figure></div>
<p>对customers的每一条都访问orders表</p>
<p><strong><u>一、使用索引加速连接查询</u></strong></p>
<ol>
<li>
<p><strong>被驱动表有索引时</strong>：被驱动表的数据在被驱动表筛选后，会进行多次基于索引的查询以加速连接。</p>
<blockquote>
<p>意思就是比如对驱动表的数据每条进行遍历，那每个驱动表的值就可以看作一个常数，然后就使用索引</p>
</blockquote>
</li>
<li>
<p><strong>多个条件的情况</strong>：如果查询有多个条件，优化器会选择最合适的索引来执行查询。</p>
</li>
<li>
<p><strong>连接查询和过滤条件</strong>：连接查询和过滤条件通常只涉及被驱动表的部分列。因此，在实际工作中，不建议使用<code>*</code>作为查询列表。</p>
</li>
</ol>
<p><strong><u>二、基于块的连接优化</u></strong>：通过减少对被驱动表的多次遍历来提高连接效率（感觉像是倒反天罡</p>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617133051390.png" alt="image-20240617133051390" style="zoom: 50%;">
<ol>
<li>尽量减少访问被驱动表的次数（驱动表的记录不会都放入 join buffer，只会将部分列放入）</li>
<li>join buffer 足够大，就可以一次访问被驱动表完成连接</li>
<li>join buffer 一般 256KB（相比来看，索引仍然是最好的选择）</li>
</ol>
<h3 id="连接小结（总结的还可以">连接小结（总结的还可以</h3>
<p>• 本质上，连接就是把各个表中的记录都取出来依次进行匹配，并把匹配的组合返回</p>
<p>• 内连接和外连接的本质都是确定驱动表</p>
<p>• 嵌套循环连接算法是：驱动表只访问一次，但被驱动表可能会访问多次，访问次数取决于被驱动表执行单表查询后结果集中有多少条记录</p>
<ol>
<li><strong>被驱动表会被多次访问</strong>，所以，建立合适的索引用以加快访问速度</li>
<li><strong>被驱动表很大</strong>，多次访问会导致更多的磁盘 I/O，基于块的嵌套循环算法来缓解</li>
</ol>
<h3 id="基于成本的优化器-CBO">基于成本的优化器 CBO</h3>
<blockquote>
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/wangen2010/article/details/100516113">https://blog.csdn.net/wangen2010/article/details/100516113 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<p>要点是<strong>执行计划的成本估算</strong></p>
<p>基础仍然是规则方案探索</p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/1718595481773-21.png" alt="img"></p>
<h4 id="什么是“成本”">什么是“成本”</h4>
<ul>
<li>一个查询有不同的执行方案，它会选择其中成本最低的（也就是代价最低的）</li>
<li>成本一般有两个方面组成
<ul>
<li>I/O 成本，MyISAM 、 InnoDB 存储引擎都是将数据和索引存储到磁盘的
<ul>
<li>从磁盘到内存的加载，涉及到“物理读写”，这种耗损的时间称之为 I/O 成本</li>
</ul>
</li>
<li>CPU 成本，读取记录，以及检测记录是否满足搜索条件、对结果集排序，称之为 CPU 成本</li>
</ul>
</li>
<li>一般来说，需要确定不同操作，不同算子的成本常数
<ul>
<li><strong>物理读取一个页面</strong>默认成本是 1.0</li>
<li><strong>逻辑读取</strong>和<strong>检测条件</strong>默认为 0.2</li>
</ul>
</li>
</ul>
<h4 id="一个单表查询的例子">一个单表查询的例子</h4>
<p>单表查询，大意指不涉及连接</p>
<p><strong><u>单表查询成本优化基本步骤：</u></strong></p>
<ol>
<li>
<p>根据搜索条件，<strong>找出所有可能使用的索引</strong></p>
<blockquote>
<p><strong>二级索引</strong>就是除了主键索引之外的</p>
<p>我们分析一下上边查询中涉及到的几个搜索条件：</p>
<ul>
<li><code>key1 IN ('a', 'b', 'c')</code>，这个搜索条件可以使用二级索引<code>idx_key1</code>。</li>
<li><code>key2 &gt; 10 AND key2 &lt; 1000</code>，这个搜索条件可以使用二级索引<code>idx_key2</code>。</li>
<li><code>key3 &gt; key2</code>，<strong>这个搜索条件的索引列由于没有和常数比较，所以并不能使用到索引。</strong></li>
<li><code>key_part1 LIKE '%hello%'</code>，<code>key_part1</code>通过<code>LIKE</code>操作符和以通配符开头的字符串做比较，不可以适用索引。</li>
<li><code>common_field = '123'</code>，由于该列上压根儿没有索引，所以不会用到索引。</li>
</ul>
<p>综上所述，上边的查询语句可能用到的索引，也就是<code>possible keys</code>只有<code>idx_key1</code>和<code>idx_key2</code>。</p>
</blockquote>
</li>
<li>
<p>计算<strong>全表扫描</strong>的代价（row，Data_length)</p>
<blockquote>
<p>这两个信息可以通过语句<code>show table status like 'table_name' \ G</code>查询得到</p>
<ul>
<li>
<p><u><strong>Rows</strong></u></p>
<p>本选项表示表中的记录条数。对于使用<code>MyISAM</code>存储引擎的表来说，该值是准确的，对于使用<code>InnoDB</code>存储引擎的表来说，该值是一个<strong>估计值</strong>。从查询结果我们也可以看出来，由于我们的<code>single_table</code>表是使用<code>InnoDB</code>存储引擎的，所以虽然实际上表中有10000条记录，但是<code>SHOW TABLE STATUS</code>显示的<code>Rows</code>值只有9693条记录。</p>
</li>
<li>
<p><u><strong>Data_length</strong></u></p>
<p>本选项表示表占用的存储空间字节数。使用<code>MyISAM</code>存储引擎的表来说，该值就是数据文件的大小，对于使用<code>InnoDB</code>存储引擎的表来说，该值就相当于聚簇索引占用的存储空间大小，也就是说可以这样计算该值的大小：</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">Data_length = 聚簇索引的页面数量 x 每个页面的大小</span><br></pre></td></tr></tbody></table></figure></div>
<p>我们的<code>single_table</code>使用默认<code>16KB</code>的页面大小，而上边查询结果显示<code>Data_length</code>的值是<code>1589248</code>，所以我们可以反向来推导出<code>聚簇索引的页面数量</code>：</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">聚簇索引的页面数量 = 1589248 ÷ 16 ÷ 1024 = 97</span><br></pre></td></tr></tbody></table></figure></div>
</li>
</ul>
<p>我们现在已经得到了聚簇索引占用的页面数量以及该表记录数的估计值</p>
</blockquote>
</li>
<li>
<p>计算<strong>使用不同索引的代价</strong></p>
</li>
<li>
<p>对比各种执行方案的代价，找出成本最低的那一个</p>
</li>
</ol>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617125503524.png" alt="image-20240617125503524" style="zoom:50%;">
<blockquote>
<p>1.1，1.0这些都是常数，加一些偏置值而已</p>
</blockquote>
<h3 id="基于规则的优化器-RBO">基于规则的优化器 RBO</h3>
<p>要点是**<u>结构匹配和替换</u>**</p>
<ul>
<li>应用规则的算法<strong>一般需要先在关系代数结构上匹配一部分局部结构</strong></li>
<li>再根据结构的特点进行辩护乃至替换操作</li>
</ul>
<h4 id="基于规则的优化算法">基于规则的优化算法</h4>
<ul>
<li>变化规则的选择，哪些规则应该被应用，以什么顺序被使用？</li>
<li>变换效果的评价，经过变换的查询性能的评估，算子效率和数据集</li>
<li>所以，一般固定规则一定会构建人工的优先级顺序 =&gt; 通用性下降，适应范围变窄</li>
</ul>
<h4 id="优先级顺序和通用性">优先级顺序和通用性</h4>
<p>由于规则的应用顺序会影响优化效果，因此，优化器通常会给规则分配一个优先级顺序。这个优先级顺序是基于经验和常见查询模式人工设置的。虽然这种方法可以在特定场景下提高查询效率，但也有其局限性：</p>
<ul>
<li><strong>通用性下降</strong>：由于规则的优先级是固定的，优化器在某些情况下可能无法找到最优的查询执行计划。</li>
<li><strong>适应范围窄</strong>：固定优先级顺序意味着优化器在面对不同类型的查询时，可能不能很好地适应多变的查询模式和数据特性。</li>
</ul>
<h4 id="一个例子（GPT）">一个例子（GPT）</h4>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617113254543.png" alt="image-20240617113254543" style="zoom:50%;">
<h2 id="日志-2">日志</h2>
<blockquote>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cnblogs.com/xiaolincoding/p/16396502.html">https://www.cnblogs.com/xiaolincoding/p/16396502.html <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<h3 id="ACID">ACID</h3>
<ul>
<li><strong>原子性（Atomicity）：事务的本质要求</strong>
<ul>
<li><code>单个事务，为一个不可分割的最小工作单元</code>，整个事务中的所有操作要么全部commit成功，要么全部失败rollback，对于一个事务来说，不可能只执行其中的一部分SQL操作，这就是事务的原子性。</li>
</ul>
</li>
<li><strong>一致性（Consistency）：数据完整的要求</strong>
<ul>
<li>定义最弱的属性，也是<u>唯一一个可以由开发者控制而不是仅凭数据库自身保证的属性</u></li>
<li>一致性指的是在事务执行前后，数据库必须从一个一致状态转变为另一个一致状态。也就是说，任何事务都必须使数据库保持一致的状态。具体来说，一致性要求：
<ul>
<li><strong>数据库规则的满足</strong>：事务执行后，所有数据库的完整性约束（如余额不能为负数）都必须满足。</li>
<li><strong>数据的合法性</strong>：事务执行后，数据库中的数据必须是合法的，不会出现不合法的数据。</li>
<li><strong>正确的状态转变</strong>：事务执行后，数据库状态的变化是正确的，从一个正确的状态变为另一个正确的状态。</li>
</ul>
</li>
</ul>
</li>
<li><strong>隔离性（Isolation）：并发的本质要求</strong>
<ul>
<li>通常来说，一个事务所做的修改在最终提交以前，对其他事务是不可见的。在前面的例子中，当执行完第三条语句、第四条语句还未开始时，此时有另外一个账户查询余额SQL开始运行，则其看到的信用卡账户的余额并没有被减去100元。后面我们讨论隔离级别(Isolation level)的时候，会发现为什么我们要说事务通常来说是不可见的</li>
</ul>
</li>
<li><strong>持久性（Durability）：数据库系统的本质要求</strong>
<ul>
<li><u>一旦事务提交，那么对其所做的修改就会永久保存在数据库中</u>，此时即使系统崩溃，修改的数据也不会丢失</li>
</ul>
</li>
</ul>
<h3 id="缓冲区管理">缓冲区管理</h3>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617092103635.png" alt="image-20240617092103635"></p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617092119912.png" alt="image-20240617092119912"></p>
<h3 id="请求页的基本步骤">请求页的基本步骤</h3>
<ul>
<li>检查该页是否已被缓存
<ol>
<li>如果该页在缓存中，直接返回缓存的页；</li>
<li>如果没有缓存，则页缓存会将其逻辑地址或页id转化为物理地址，加载到内存，并返回；
<ol>
<li>一旦返回，这个存有缓存页内容的缓冲区就被称为被<strong>引用的（referenced）</strong></li>
<li>用完之后将其归还给页缓存或解除引用</li>
</ol>
</li>
</ol>
</li>
<li>若想让页缓存不要换出某些页，则可以将其固定（pin）</li>
<li>如果某些页被修改，标记为脏页（dirty page），脏页表示内容与磁盘不同步，换出时必须将其刷写到磁盘</li>
</ul>
<h3 id="恢复Recovery">恢复Recovery</h3>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617093143299.png" alt="image-20240617093143299"></p>
<blockquote>
<p>意思是本来事务提交是在缓存完成就修改就事务提交了，这样能快一点，但是就会存在<strong>在提交和写入磁盘</strong>之间崩溃的可能，无法恢复，违反持久性；所以一个方案是使用写入disk才算完成，这样固然可以，但是显然太麻烦，因此redo日志诞生。</p>
</blockquote>
<h3 id="Redo-log（重做日志）-的特点">Redo log（重做日志） 的特点</h3>
<ol>
<li>占用空间很小</li>
<li>顺序写入磁盘（顺序 I/O）</li>
</ol>
<h3 id="redo日志格式">redo日志格式</h3>
<blockquote>
<p>比ppt清晰</p>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cnblogs.com/kuangtf/articles/16353184.html#4log-sequeue-number">https://www.cnblogs.com/kuangtf/articles/16353184.html#4log-sequeue-number <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<p>Redo 日志格式不同数据库有不同的定义，但整体的分类就这三种：</p>
<ol>
<li>记录具体位置的物理修改</li>
<li>记录一个 page 的全部修改</li>
<li>记录操作（执行恢复的参数）</li>
</ol>
<p>一些数据库也会做一些压缩操作，比如 space id，page number 等</p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/1718588747996-1.png" alt="img"></p>
<blockquote>
<p>对应第一种</p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617095405672.png" alt="image-20240617095405672"></p>
<blockquote>
<p>方案2大体对应第二种</p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617095801000.png" alt="image-20240617095801000"></p>
<blockquote>
<p>大体上是第三种</p>
</blockquote>
<h3 id="Mini-Transaction">Mini-Transaction</h3>
<p>以组的形式写入 redo 日志</p>
<p>• 一组操作，一组日志的不可分割性</p>
<p>• 索引、基本表、聚簇、二级索引、目录等多个页的操作</p>
<p><strong>MLOG_MULTI_REC_END</strong></p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/1718589881176-4.png" alt="img"></p>
<h3 id="redo-log-block">redo log block</h3>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/1718589935838-11.png" alt="img"></p>
<blockquote>
<p>512B，512K也太大了</p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/1718589956060-14.png" alt="img"></p>
<h3 id="redo-log-的刷盘时机">redo log 的刷盘时机</h3>
<p>redo log刷盘是指将这些日志从内存中的log buffer（日志缓冲区）写入磁盘的过程。这个过程确保了数据的<strong>持久性</strong>，即使在系统崩溃或宕机后，数据库也能通过这些日志恢复到一致的状态。</p>
<ul>
<li>log buffer空间不足（50%的阈值）</li>
<li><strong>事务提交时</strong></li>
<li><strong>脏页刷新</strong></li>
<li>定时进程，固定频率刷新（1s，log buffer中的redo log刷新到硬盘）</li>
<li>正常关闭服务器</li>
</ul>
<h3 id="lsn值（log-sequence-number）">lsn值（log sequence number）</h3>
<p><strong><u>check point的步骤</u></strong></p>
<ol>
<li>
<p>计算当前系统可以被覆盖的redo日志对应的lsn值最大是多少</p>
</li>
<li>
<p>将信息写入日志文件的管理信息中，记录check point的操作</p>
</li>
</ol>
<blockquote>
<p>Checkpoint是数据库系统中的一个关键机制，用于确保数据一致性和加速恢复过程。执行checkpoint时，数据库会做以下事情：</p>
<ol>
<li><strong>刷新脏页</strong>：将所有脏页（内存中被修改但尚未写入磁盘的数据页）写入磁盘。</li>
<li><strong>记录LSN</strong>：将当前的LSN记录在某个稳定存储位置（如日志文件头部），这标志着所有在这个LSN之前的变更都已经持久化到磁盘。(<strong>checkpoint_lsn</strong>)</li>
</ol>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617102214425.png" alt="image-20240617102214425"></p>
<blockquote>
<p>checkpoint就是之前的都完成了，lsn是目前有多少了，最新的一个增长，应该跟buf_free对应的？</p>
</blockquote>
<h3 id="恢复">恢复</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cnblogs.com/kuangtf/articles/16353184.html#4log-sequeue-number">https://www.cnblogs.com/kuangtf/articles/16353184.html#4log-sequeue-number <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p><strong>博客讲的很详细</strong></p>
<p>小trick就是使用Hash表，相同的页面不用多次取回</p>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617103555399.png" alt="image-20240617103555399"></p>
<h3 id="Undo日志（Undo-log）">Undo日志（Undo log）</h3>
<ul>
<li>事务保证原子性靠的就是日志
<ul>
<li>错误：服务器、操作系统、断电</li>
<li>手动或自动rollback</li>
</ul>
</li>
<li>对每一条记录进行改动的时候，需要留一手
<ul>
<li>INSERT，记录主键，rollback就删除主键</li>
<li>DELECT，记录内容，rollback恢复记录</li>
<li>UPDATE，记录内容，rollback恢复记录</li>
</ul>
</li>
</ul>
<p>每一个事务对数据的修改都会被记录到 undo log ，当执行事务过程中出现错误或者需要执行回滚操作的话，MySQL 可以利用 undo log 将数据恢复到事务开始之前的状态。</p>
<p><strong>undo log 属于逻辑日志，记录的是 SQL 语句</strong></p>
<p>比如说事务执行一条 DELETE 语句，那 undo log 就会记录一条相对应的 INSERT 语句。同时，undo log 的信息也会被记录到 redo log 中，因为 undo log 也要实现持久性保护。<strong>并且，undo-log 本身是会被删除清理的，例如 INSERT 操作，在事务提交之后就可以清除掉了；UPDATE/DELETE 操作在事务提交不会立即删除，会加入 history list，由后台线程 purge 进行清理。</strong></p>
<h3 id="Write-Ahead-Log-WAL（GPT）">Write-Ahead Log WAL（GPT）</h3>
<p>基本原理</p>
<ul>
<li><strong>保证数据库系统的持久性语义，即操作日志必须在修改页之前写入磁盘。</strong></li>
<li><strong>系统崩溃时，通过操作日志重建内存中丢失的更改。</strong></li>
</ul>
<p>性能优化</p>
<ul>
<li>后台独立进程循环刷写（如PostgreSQL的后台刷写器）。</li>
<li>定期执行Checkpoint操作。</li>
</ul>
<p>日志语义</p>
<ul>
<li>WAL是仅追加的，已写入内容不可变。</li>
<li>强制刷盘操作确保事务提交记录完成后才视为“已提交”。</li>
<li>LSN（Log Sequence Number）唯一且单调递增。</li>
</ul>
<h3 id="Redo-log-Undo-log">Redo log &amp; Undo log</h3>
<ul>
<li>
<p><strong>前像（before-image）和后像（after-image）的相互转换</strong></p>
</li>
<li>
<p><strong>Undo：一个事务在执行过程中，还未提交，发生崩溃或者需要回滚</strong></p>
<p><mark>保障原⼦性、实现MVCC（多版本并发控制）</mark></p>
<ul>
<li>Undo log 撤销回滚的日志，记录更新前的数据到undo日志文件中</li>
<li>Undo日志记录的是操作记录，插入记录主键、删除记录内容、更新记录旧值</li>
<li>Undo日志只在乎“操作之前”（roll_pointer指针串成链表/版本表，trx_id事务id）</li>
</ul>
</li>
<li>
<p><strong>Redo：掉电，磁盘I/O崩了，之前提交的记录如何保存（crash-safe 奔溃恢复）</strong></p>
<p><mark>保障持久性</mark></p>
<ul>
<li>事务提交时，未必检查点同步，事务提交成功的标记是——redo日志持久化了</li>
<li>Redo日志记录的是物理修改，（xxx数据页yyy的偏移量做了zzz的修改/影子页）</li>
<li>循环写，不用于备份恢复、主从复制，用于掉电等故障恢复——binlog用于全局备份</li>
</ul>
</li>
<li>
<p>被修改的Undo log本身，也会记录Redo log</p>
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617110010159.png" alt="image-20240617110010159" style="zoom: 67%;">
</blockquote>
</li>
</ul>
<h3 id="steal和force策略">steal和force策略</h3>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617110532293.png" alt="image-20240617110532293"></p>
<blockquote>
<p>事务提交前能不能刷脏页？能 steal（要undo日志，未能提交的话要恢复）</p>
<p>事务提交前要不要保证所有的脏页都刷了？不要保证 no-force（要redo日志），要保证 force</p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="24-spring-%E6%95%B0%E6%8D%AE%E5%BA%93%E5%BC%80%E5%8F%91%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0/image-20240617110548879.png" alt="image-20240617110548879"></p>
<h2 id="SQL题目补充（一开始跳了几道">SQL题目补充（一开始跳了几道</h2>
<blockquote>
<p>全用mysql，不用oracle吧</p>
</blockquote>
<h3 id="Any和All关键字">Any和All关键字</h3>
<p>其实可以用min/max等价实现</p>
<p><strong>any/some</strong></p>
<ol>
<li>Select * from t1 where m1 &gt; any (select m2 from t2)</li>
<li>如果子查询结果集存在小于m1列的值，则表达式为true</li>
<li>Select * from t1 where m1 &gt; (select min(m2) from t2)</li>
</ol>
<p><strong>all</strong></p>
<ol>
<li>Select * from t1 where m1 &gt; all(select m2 from t2)</li>
<li>如果子查询的结果集中所有值都小于m1，则表达式为true</li>
<li>Select * from t1 where m1 &gt; (select max(m2) from t2)</li>
</ol>
<h3 id="char-length和length">char_length和length</h3>
<table>
<thead>
<tr>
<th>example_column</th>
<th>byte_length</th>
<th>char_length</th>
</tr>
</thead>
<tbody>
<tr>
<td>hello</td>
<td>5</td>
<td>5</td>
</tr>
<tr>
<td>你好</td>
<td>6</td>
<td>2</td>
</tr>
</tbody>
</table>
</div>

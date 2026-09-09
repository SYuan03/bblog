---
title: "notes-dbms"
permalink: "/posts/2023-Spring-Courses-数据库管理/notes-dbms.html"
date: "2023-06-14T14:04:35.000Z"
updated: "2024-09-30T12:52:21.056Z"
description: "数据库课程综合笔记，涵盖关系模型与 SQL、安全和完整性、函数依赖与范式、数据库设计、事务恢复、并发控制及 NoSQL 基础。"
cover: "https://s2.loli.net/2023/04/24/3DWJMp2ZnT4iL1j.jpg"
categories:
  - "2023-Spring-Courses-数据库管理"
tags:
  - "数据库管理"
---

<!-- Migrated from posts/2023-Spring-Courses-数据库管理/notes-dbms.html. Keep the permalink stable. -->
<div class="legacy-content">
<h2 id="chap1-绪论">chap1 绪论</h2>
<h3 id="SQL数据库与NoSQL数据库">SQL数据库与NoSQL数据库</h3>
<p>其实就是NoSQL主要是面向单一的大量数据（比如一个人每天的定位数据这种，显然那比较适合NoSQL</p>
<p>但是那种需要经常读写的，就需要关系型数据库来维持ACID的性质</p>
<style>.mbyggdcckiuk{zoom: 33%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230606145656080.png" class="mbyggdcckiuk" alt="image-20230606145656080">
<blockquote>
<p>SQL 结构化查询语言</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230606145744392.png" class="" title="image-20230606145744392">
</blockquote>
<h3 id="三级模式结构-例子">三级模式结构-例子</h3>
<p>GPT:</p>
<p>让我们以一个简单的学生信息管理系统为例来说明外模式-模式-内模式的概念。</p>
<p>假设我们有一个学生信息管理系统，其中包含以下数据：</p>
<ul>
<li>**内模式（Internal Schema）：**在底层，数据库的内模式定义了数据在物理存储介质上的实际存储方式和结构。假设我们使用关系型数据库，并使用MySQL的InnoDB存储引擎，数据以表格的形式存储在磁盘上，包括学生表（Student table）、课程表（Course table）和成绩表（Grade table）等。内模式定义了表的存储方式、索引结构、数据分区等底层实现细节。</li>
<li>**模式（Conceptual Schema）：**在中间层，数据库的模式定义了整个数据库的逻辑结构和关系。假设我们的模式包括学生表（Student table）、课程表（Course table）和成绩表（Grade table）之间的关系。它描述了表之间的主键-外键关系、表的属性和约束等信息。模式是对整个数据库的全局视图，独立于具体的应用程序。</li>
<li>**外模式（External Schema）：**在最高层，数据库的外模式定义了特定用户或应用程序对数据库的部分可见视图。假设我们有两个外模式：
<ol>
<li>学生用户外模式（Student User External Schema）：学生用户只对学生表（Student table）感兴趣，他们可以访问学生的基本信息，如学号、姓名、年龄等。其他表（如课程表和成绩表）对他们不可见。</li>
<li>教师用户外模式（Teacher User External Schema）：教师用户对课程表（Course table）和成绩表（Grade table）感兴趣，他们可以访问课程的信息和学生的成绩。其他表（如学生表）对他们不可见。</li>
</ol>
</li>
</ul>
<p>通过这个案例，可以看到：</p>
<ul>
<li>内模式定义了数据在底层存储介质上的物理结构和存储方式。</li>
<li>模式定义了整个数据库的逻辑结构和表之间的关系。</li>
<li><mark>外模式定义了特定用户或应用程序对数据库的部分可见视图，根据用户的需求定义了他们可以访问的数据集合。</mark></li>
</ul>
<p>这种外模式-模式-内模式的层次结构帮助实现数据的抽象和分离，使得不同用户或应用程序可以根据自己的需求访问数据库中的数据，而不需要了解底层的物理存储细节或其他用户不可见的数据。</p>
<h2 id="chap2-关系数据库">chap2 关系数据库</h2>
<h3 id="规范条件">规范条件</h3>
<p>最基本的一条，不允许“表中有表”</p>
<h3 id="关系模式">关系模式</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230607093402503.png" class="" title="image-20230607093402503">
<p>D就是域的集合</p>
<p>DOM是指明属性的域是哪个</p>
<h3 id="外码">外码</h3>
<p>参照关系和被参照关系不一定是不同的关系</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230607094521264.png" class="" title="image-20230607094521264">
<h3 id="主键和主属性">主键和主属性</h3>
<p>个人感觉任一候选码的属性都是主属性</p>
<p>主键就是人为选定的一个候选码，应该等同于主码的概念</p>
<h3 id="五种基本关系代数运算">五种基本关系代数运算</h3>
<p>并 差 笛卡尔积 选 投</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230607130030167.png" class="" title="image-20230607130030167">
<h3 id="连接操作">连接操作</h3>
<p>分类众多</p>
<p>连接：</p>
<ul>
<li>等值连接
<ul>
<li>自然连接
<ul>
<li>内连接</li>
<li>外连接
<ul>
<li>外连接</li>
<li>左外连接</li>
<li>右外连接</li>
</ul>
</li>
</ul>
</li>
<li>普通等值连接</li>
</ul>
</li>
<li>非等值连接</li>
</ul>
<h2 id="chap3-SQL">chap3 SQL</h2>
<blockquote>
<div class="highlight-container" data-rel="Html"><figure class="iseeu highlight html"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"><span class="tag">&lt;<span class="name">center</span>&gt;</span><span class="tag">&lt;<span class="name">embed</span> <span class="attr">src</span>=<span class="string">"https://box.nju.edu.cn/f/e58b4ec1bf54441eb433/"</span> <span class="attr">width</span>=<span class="string">"100%"</span> <span class="attr">height</span>=<span class="string">"700"</span>&gt;</span><span class="tag">&lt;/<span class="name">center</span>&gt;</span></span><br></pre></td></tr></tbody></table></figure></div>
</blockquote>
<center><embed src="https://box.nju.edu.cn/f/69dba853072a483ea525/" width="100%" height="700"></center>
<h3 id="MySQL中没有模式Schema的概念吗？">MySQL中没有模式Schema的概念吗？</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230608223932854.png" class="" title="image-20230608223932854">
<blockquote>
<p>比如PostgreSQL中一个数据库下还是有Schema的概念的</p>
<style>.cgdhvsblmpjm{zoom:33%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230608224113186.png" class="cgdhvsblmpjm" alt="image-20230608224113186">
</blockquote>
<h3 id="Show-search-path-语句">Show search_path; 语句</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230608232225767.png" class="" title="image-20230608232225767">
<h3 id="索引">索引</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230608234525154.png" class="" title="image-20230608234525154">
<blockquote>
<p>以及数据字典</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230608234659179.png" class="" title="image-20230608234659179">
</blockquote>
<h3 id="涉及空串的查询-P96">涉及空串的查询 P96</h3>
<p>必须用IS NULL 或者IS NOT NULL</p>
<p>用=NULL永远返回False</p>
<h3 id="派生表">派生表</h3>
<p>AS关键字可以省略，但是必须起一个别名</p>
<h3 id="空值">空值</h3>
<style>.fedsxpillavt{zoom: 50%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230609223622182.png" class="fedsxpillavt" alt="image-20230609223622182">
<h3 id="行列子集视图">行列子集视图</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230609230314911.png" class="" title="image-20230609230314911">
<h3 id="视图消解">视图消解</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610113136034.png" class="" title="image-20230610113136034">
<p>意思就是转换成对基本表的操作</p>
<h3 id="视图的作用-更清晰的表达">视图的作用-更清晰的表达</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610113942910.png" class="" title="image-20230610113942910">
<blockquote>
<p>感觉也可以用嵌套查询</p>
<p>比如使用派生表，感觉差不太多</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610114303292.png" class="" title="image-20230610114303292">
</blockquote>
<h3 id="join关键字">join关键字</h3>
<p>ppt貌似只有这里出现过</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610114454170.png" class="" title="image-20230610114454170">
<h3 id="视图的作用">视图的作用</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610130713351.png" class="" title="image-20230610130713351">
<h3 id="SQL语言的两种使用方式">SQL语言的两种使用方式</h3>
<p><strong>交互式</strong>和<strong>嵌入式</strong></p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610132105603.png" class="" title="image-20230610132105603">
<h3 id="GROUP-BY-多个字段">GROUP BY 多个字段</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cnblogs.com/zhuchenglin/p/9732612.html">group by 多个字段 - lin_zone - 博客园 (cnblogs.com) <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<h2 id="chap4-数据库安全性">chap4 数据库安全性</h2>
<h3 id="不安全因素">不安全因素</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610152056054.png" class="" title="image-20230610152056054">
<h3 id="用户身份鉴别">用户身份鉴别</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610152855646.png" class="" title="image-20230610152855646">
<h3 id="存取控制">存取控制</h3>
<p>• <strong>用户权限定义</strong>，并将用户权限登记到数据字典中</p>
<p>​	<strong>–</strong> 用户对某一数据对象的操作权力称为权限</p>
<p>​	<strong>–</strong> DBMS 提供适当的语言来定义用户权限，存放在数据字典中，称做安全规则或授权规则</p>
<p>• <strong>合法权限检查</strong></p>
<p>• 用户权限定义和合法权检查机制一起组成了数据库管理系统的存取控制子系统</p>
<h3 id="两种存取控制方法">两种存取控制方法</h3>
<p>C2 级的数据库管理系统支持自主存取控制（Discretionary Access Control，DAC），B1 级的数据库管理系统支持强制存取控制（Mandatory Access Control，MAC）</p>
<p><strong>–</strong> 在<strong>自主存取控制</strong>方法中，用户对不同的数据对象有不同的存取权限，不同的用户对同一对象也</p>
<p>有不同的权限，而且用户还可将其拥有的存取权限转授给其他用户</p>
<p><strong>–</strong> 在<strong>强制存取控制</strong>方法中，每一个数据对象被标以一定的密级，每一个用户也被授予某一个级别</p>
<p>的许可证，对于任意一个对象，只有具有合法许可证的用户才可以存取</p>
<h3 id="DAC-自主存取控制">DAC 自主存取控制</h3>
<h3 id="PUBLIC">PUBLIC</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610153601736.png" class="" title="image-20230610153601736">
<h3 id="WITH-GRANT-OPTION">WITH GRANT OPTION</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610153638308.png" class="" title="image-20230610153638308">
<h3 id="REVOKE">REVOKE</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610153855101.png" class="" title="image-20230610153855101">
<h3 id="创建数据库模式的权限">创建数据库模式的权限</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610160403928.png" class="" title="image-20230610160403928">
<h3 id="数据库角色">数据库角色</h3>
<p>先给角色grant权限再把角色grant给用户，能稍微简便点</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610160614668.png" class="" title="image-20230610160614668">
<h3 id="自主存取控制的缺点">自主存取控制的缺点</h3>
<p>优点就是灵活吧，并且达到了C级别的安全级别（C2？）</p>
<p>缺点如下</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610160736743.png" class="" title="image-20230610160736743">
<h3 id="MAC？强取存取控制">MAC？强取存取控制</h3>
<blockquote>
<p>解释</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610165125024.png" class="" title="image-20230610165125024">
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610165149459.png" class="" title="image-20230610165149459">
<h3 id="视图机制">视图机制</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610165235728.png" class="" title="image-20230610165235728">
<blockquote>
<p>这个间接有点迷，背背吧</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610165642818.png" class="" title="image-20230610165642818">
</blockquote>
<h3 id="审计">审计</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610165742294.png" class="" title="image-20230610165742294">
<h4 id="审计语句AUDIT">审计语句AUDIT</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610165827484.png" class="" title="image-20230610165827484">
<h3 id="数据加密">数据加密</h3>
<p>存储加密，传输加密等</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610170017449.png" class="" title="image-20230610170017449">
<h2 id="chap5-数据库完整性">chap5 数据库完整性</h2>
<h3 id="完整性机制">完整性机制</h3>
<p>三类</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610184540328.png" class="" title="image-20230610184540328">
<h3 id="实体完整性">实体完整性</h3>
<p>PRIMARY KEY</p>
<p>列级和表级说明</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610184746158.png" class="" title="image-20230610184746158">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610184755985.png" class="" title="image-20230610184755985">
<h3 id="实体完整性检查">实体完整性检查</h3>
<p>唯一 + 主码各属性非空</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610184910472.png" class="" title="image-20230610184910472">
<h4 id="全表扫描-或-索引（如B-树）">全表扫描 或 索引（如B+树）</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610185757457.png" class="" title="image-20230610185757457">
<h3 id="参照完整性">参照完整性</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610190521113.png" class="" title="image-20230610190521113">
<h4 id="处理">处理</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610190621422.png" class="" title="image-20230610190621422">
<h4 id="例：SET-NULL">例：SET-NULL</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610190652007.png" class="" title="image-20230610190652007">
<h3 id="显示说明参照完整性的违约处理">显示说明参照完整性的违约处理</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610190808522.png" class="" title="image-20230610190808522">
<h3 id="用户定义的完整性">用户定义的完整性</h3>
<h4 id="属性上">属性上</h4>
<p>非空 唯一等</p>
<p>或者使用CHECK关键字</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610193319187.png" class="" title="image-20230610193319187">
<h4 id="元组上">元组上</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610193354768.png" class="" title="image-20230610193354768">
<h3 id="还可以使用完整性命名子句CONSTRAINT">还可以使用完整性命名子句CONSTRAINT</h3>
<p>这样约束就能有名字了，同时也便于删去</p>
<p>主码约束也可以成为Constraint的一部分</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610193927385.png" class="" title="image-20230610193927385">
<h3 id="删除（修改）CONSTARINT">删除（修改）CONSTARINT</h3>
<p>似乎没有修改语句</p>
<p>只能先DROP掉，再ADD</p>
<p>注意要配合<strong>alter table</strong>使用</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610194023534.png" class="" title="image-20230610194023534">
<h3 id="断言">断言</h3>
<p>可以定义更具一般性的约束，比如涉及聚合操作等比较复杂的完整性约束</p>
<h4 id="例子">例子</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610194721442.png" class="" title="image-20230610194721442">
<h3 id="触发器">触发器</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610194850051.png" class="" title="image-20230610194850051">
<h4 id="定义">定义</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610195159214.png" class="" title="image-20230610195159214">
<h4 id="触发器类型">触发器类型</h4>
<p>行级，语句级</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610195232494.png" class="" title="image-20230610195232494">
<h4 id="例子-2">例子</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610200130535.png" class="" title="image-20230610200130535">
<blockquote>
<p>这是一个<strong>行级触发器</strong>，有FOR EACH ROW</p>
<p>这例子有点绕，OLDROW（或者OLD）和NEWROW（或者NEW）是保留字，不随题目变化而变化，Oldgrade和Newgrade只是该题恰好要的两个属性</p>
</blockquote>
<h4 id="触发器激活顺序">触发器激活顺序</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610200341268.png" class="" title="image-20230610200341268">
<h4 id="删除触发器">删除触发器</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610200404711.png" class="" title="image-20230610200404711">
<h2 id="chap6-关系数据理论">chap6 关系数据理论</h2>
<h3 id="1NF">1NF</h3>
<p>First Normal Form</p>
<p>通俗理解</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610213750498.png" class="" title="image-20230610213750498">
<blockquote>
<p>虽然chatgpt说理解为“表中有表”并不完全正确</p>
</blockquote>
<h3 id="数据依赖">数据依赖</h3>
<p>有很多类型</p>
<p>主要是<strong>函数依赖</strong>和<strong>多值依赖</strong></p>
<h3 id="函数依赖-FD-Function-Dependency">函数依赖 FD Function Dependency</h3>
<p>很字面的意思，就是像y=fx一样，y由x决定</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610214138860.png" class="" title="image-20230610214138860">
<h3 id="1NF：F的表示">1NF：F的表示</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610214809590.png" class="" title="image-20230610214809590">
<h3 id="范式">范式</h3>
<p>模式分解</p>
<p>规范化</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610215237850.png" class="" title="image-20230610215237850">
<h3 id="函数依赖的标准定义">函数依赖的标准定义</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610222733548.png" class="" title="image-20230610222733548">
<blockquote>
<p>简单说就是X一样，Y一定一样，所以X-&gt;Y</p>
<p>X 函数确定 Y</p>
<p>Y 函数依赖于 X</p>
</blockquote>
<h3 id="平凡函数依赖与非平凡函数依赖">平凡函数依赖与非平凡函数依赖</h3>
<p>关键在于Y是否被包含于X</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610223048974.png" class="" title="image-20230610223048974">
<blockquote>
<p>显然平凡函数依赖没什么意义</p>
</blockquote>
<h3 id="完全函数依赖和部分函数依赖">完全函数依赖和部分函数依赖</h3>
<p>看例子就懂意思了，定义削微有点晦涩</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610223748591.png" class="" title="image-20230610223748591">
<h3 id="传递函数依赖">传递函数依赖</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610224944849.png" class="" title="image-20230610224944849">
<p>Y非平凡依赖于X，Z非平凡依赖于Y，同时X不依赖与Y（否则Z就直接函数依赖于X了）</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230614220209386.png" class="" title="image-20230614220209386">
<h3 id="码">码</h3>
<blockquote>
<p>书P181：</p>
<p>在后面的章节中<strong>主码</strong>或<strong>候选码</strong>都简称为<strong>码</strong></p>
<p>书上这段文字很清晰</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610230200735.png" class="" title="image-20230610230200735">
<h3 id="外码-2">外码</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610232027629.png" class="" title="image-20230610232027629">
<h3 id="1NF-2">1NF</h3>
<p>关系数据库的最基本要求</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610232142373.png" class="" title="image-20230610232142373">
<h3 id="2NF">2NF</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610232505906.png" class="" title="image-20230610232505906">
<style>.vwofejohgwyh{zoom:50%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230614220229006.png" class="vwofejohgwyh" alt="image-20230614220229006">
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610232940543.png" class="" title="image-20230610232940543">
</blockquote>
<p>1NF + 没有非主属性对码的部分依赖</p>
<h3 id="分解成2NF">分解成2NF</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610233628746.png" class="" title="image-20230610233628746">
<h3 id="3NF">3NF</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610233812701.png" class="" title="image-20230610233812701">
<blockquote>
<p>为什么不分解成S(Student)-D(Department)和S-L？这样会使得函数依赖关系丢失？不太好</p>
</blockquote>
<blockquote>
<p>消除了非主属性对码的传递函数依赖</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610233955791.png" class="" title="image-20230610233955791">
<p>辨析</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230610234017147.png" class="" title="image-20230610234017147">
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611223918842.png" class="" title="image-20230611223918842">
<h3 id="1NF-2NF-3NF-依赖关系图对比">1NF 2NF 3NF 依赖关系图对比</h3>
<p>看图更容易判断</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611103438269.png" class="" title="image-20230611103438269">
<p>存在非主属性对码的<strong>部分函数依赖</strong>，所以不是2NF</p>
<p>也有非主属性对码的<strong>传递函数依赖</strong>，所以不是3NF</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611103720282.png" class="" title="image-20230611103720282">
<p>存在非主属性对码的<strong>传递函数依赖</strong>，所以不是3NF</p>
<h3 id="BCNF-Boyce-Codd-NF">BCNF Boyce Codd NF</h3>
<p>修正的第三范式，扩充的第三范式</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611104036019.png" class="" title="image-20230611104036019">
<p>决定属性集就是指X</p>
<p>1NF + 所有决定属性集都包含候选码/没有主属性对码的部分和传递依赖</p>
<h3 id="BCNF：消除了插入异常和删除异常">BCNF：消除了<strong>插入异常</strong>和<strong>删除异常</strong></h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611104712457.png" class="" title="image-20230611104712457">
<h3 id="BCNF与3NF">BCNF与3NF</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611105330946.png" class="" title="image-20230611105330946">
<h3 id="多值依赖">多值依赖</h3>
<p>简单看了下</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611110509370.png" class="" title="image-20230611110509370">
<h4 id="例子：">例子：</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611110559465.png" class="" title="image-20230611110559465">
<h2 id="chap7-数据库设计">chap7 数据库设计</h2>
<h3 id="数据库设计6个阶段">数据库设计6个阶段</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611125725981.png" class="" title="image-20230611125725981">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611125829451.png" class="" title="image-20230611125829451">
<h3 id="各级模式">各级模式</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611130015952.png" class="" title="image-20230611130015952">
<h3 id="需求分析">需求分析</h3>
<h4 id="需求分析过程">需求分析过程</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611140356001.png" class="" title="image-20230611140356001">
<h3 id="数据字典">数据字典</h3>
<blockquote>
<p>注意区分之前的“数据字典”</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611141116947.png" class="" title="image-20230611141116947">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611141055207.png" class="" title="image-20230611141055207">
<h3 id="需求分析小结">需求分析小结</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611141343015.png" class="" title="image-20230611141343015">
<h3 id="概念模型">概念模型</h3>
<p>真实反映现实世界，易于理解，可以用于和不熟悉计算机的用户交换意见</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611142343528.png" class="" title="image-20230611142343528">
<blockquote>
<p>1.2.2节 概念模型</p>
<p>实体：学生</p>
<p>属性：学号、姓名</p>
<p>码：学号</p>
<p>实体型：实体名+属性名集合，如<code>学生（学号，姓名）</code></p>
<p>实体集：全体学生</p>
<p>联系：</p>
<p>概念模型的一种表示方法：实体E-联系R方法 <strong>E-R方法</strong> <strong>使用 E-R图</strong></p>
</blockquote>
<h3 id="联系-Relation">联系 Relation</h3>
<h4 id="两个实体性之间">两个实体性之间</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611143648711.png" class="" title="image-20230611143648711">
<h4 id="两个以上实体型之间">两个以上实体型之间</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611143708189.png" class="" title="image-20230611143708189">
<h4 id="单个实体型内部">单个实体型内部</h4>
<p>员工之间存在领导和被领导的关系</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611145518615.png" class="" title="image-20230611145518615">
<h3 id="联系的度">联系的度</h3>
<p>几个实体型就是几元联系</p>
<h3 id="E-R图">E-R图</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611151855601.png" class="" title="image-20230611151855601">
<h4 id="联系也可以有属性">联系也可以有属性</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611151917472.png" class="" title="image-20230611151917472">
<h3 id="ISA联系">ISA联系</h3>
<p>三角形，代表继承父类所有属性，并且子类可以有自己的属性</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611152520080.png" class="" title="image-20230611152520080">
<h4 id="分类属性">分类属性</h4>
<p>比如学生类别</p>
<p>可用于进行实体分派</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611152639167.png" class="" title="image-20230611152639167">
<h4 id="不相交-可重叠约束">不相交/可重叠约束</h4>
<p>既是，又是</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611152826795.png" class="" title="image-20230611152826795">
<p>能否属于子类中的过多个实体集</p>
<h4 id="完备性约束：是否必须是其中之一？">完备性约束：是否必须是其中之一？</h4>
<p>要么是，要么是</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611152914464.png" class="" title="image-20230611152914464">
<h4 id="基数约束">基数约束</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611153052561.png" class="" title="image-20230611153052561">
<p>左到右 学生 可以选修 20-30门 课程</p>
<p>右到左 课程 可以<strong>被</strong>0-*个学生选修</p>
<h4 id="Part-Of-联系">Part Of 联系</h4>
<p>非独占(的Part Of)联系：整体实体如果被破坏，另一部分实体仍然可以独立存在</p>
<p>独占(的Part Of)联系：整体实体如果被破坏，部分实体不能存在**（整体没了，部分就没了）**</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611153716106.png" class="" title="image-20230611153716106">
<h3 id="概念结构设计的方法">概念结构设计的方法</h3>
<blockquote>
<p>这部分书上没有？</p>
</blockquote>
<p>自顶向下：先全局概念结构</p>
<p>自底向上：先子需求</p>
<p>逐步扩张</p>
<p>混合策略</p>
<h3 id="自底向上的概念结构设计的步骤">自底向上的概念结构设计的步骤</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611154352614.png" class="" title="image-20230611154352614">
<h3 id="实体与属性的划分原则">实体与属性的划分原则</h3>
<ul>
<li>
<p>属性不可再有属性</p>
</li>
<li>
<p>属性不能再与其他实体有联系</p>
</li>
</ul>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611154431578.png" class="" title="image-20230611154431578">
<h4 id="例子：职工和职称">例子：职工和职称</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611154533909.png" class="" title="image-20230611154533909">
<blockquote>
<p>ppt有好多例子</p>
</blockquote>
<h3 id="E-R图的集成">E-R图的集成</h3>
<p>合并 + 重构去除冗余</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611155101043.png" class="" title="image-20230611155101043">
<h3 id="三类冲突">三类冲突</h3>
<p>1属性冲突：整数类型和字符串类型，单位冲突</p>
<p>2命名冲突：同名异义，异名同义（一义多名）</p>
<blockquote>
<p>讨论协商解决</p>
</blockquote>
<h4 id="3结构冲突">3结构冲突</h4>
<p>合并</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611155606670.png" class="" title="image-20230611155606670">
<h3 id="E-R图集成之二：修改和重构">E-R图集成之二：修改和重构</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611155826245.png" class="" title="image-20230611155826245">
<h3 id="第三步：逻辑结构设计">第三步：逻辑结构设计</h3>
<h4 id="任务">任务</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611160014880.png" class="" title="image-20230611160014880">
<h4 id="转换">转换</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611160227449.png" class="" title="image-20230611160227449">
<h4 id="对于实体型">对于实体型</h4>
<p>很直接的转换</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611160359028.png" class="" title="image-20230611160359028">
<h4 id="对于联系">对于联系</h4>
<p>• 一个 1 ∶ 1 联系可以转换为一个独立的关系模式，也可以与任意一端对应的关系模式合并</p>
<p>• 一个 1 ∶ 𝑛 联系可以转换为一个独立的关系模式，也可以与 𝑛 端对应的关系模式合并</p>
<p>• 一个 𝑚 ∶ 𝑛 联系转换为一个关系模式，与该联系相连的各实体部分的码以及联系本身的属性均转换为关系的属性，各实体的码组成关系的码或关系码的一部分</p>
<p>• 三个或三个以上实体间的一个多元联系转换为一个关系模式</p>
<p>• 具有相同码的关系模式可合并</p>
<h3 id="数据模型的优化">数据模型的优化</h3>
<p>关系数据模型的优化通常以<strong>规范化理论</strong>为指导，方法为：</p>
<ul>
<li>
<p>确定数据依赖</p>
</li>
<li>
<p>对于各个关系模式之间的数据依赖进行极小化处理，消除冗余的联系</p>
</li>
<li>
<p>按照数据依赖的理论对关系模式进行分析，考察是否存在部分函数依赖、传递函数依赖、多值依赖等，确定各关系模式分别属于第几范式</p>
</li>
<li>
<p>按照需求分析阶段得到的各种应用对数据处理的要求，分析对于这样的应用环境这些模式是否合适，确定是否要对它们进行合并或分解</p>
</li>
<li>
<p>对关系模式进行必要<strong>分解</strong>，提高数据操作效率和存储空间的利用率</p>
</li>
</ul>
<h4 id="并不是规范化程度越高的关系就越优">并不是规范化程度越高的关系就越优</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611162121086.png" class="" title="image-20230611162121086">
<h3 id="关系模式的分解">关系模式的分解</h3>
<h4 id="水平分解">水平分解</h4>
<p>元组分解，例如分解出经常用的</p>
<p>80/20原则</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611162252101.png" class="" title="image-20230611162252101">
<h4 id="垂直分解">垂直分解</h4>
<p>对常用属性分解</p>
<p>风险是可能有时必须进行连接操作了</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611162404663.png" class="" title="image-20230611162404663">
<h3 id="设计用户子模式">设计用户子模式</h3>
<p>应该还是自底向上设计过程中的一部分</p>
<p>现在已经有全局逻辑模型了</p>
<p>现在是根据局部需求，设计用户的外模式</p>
<p>但应该还是处于<code>逻辑结构设计</code>的部分</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611163854720.png" class="" title="image-20230611163854720">
<p>别名、视图、简化使用</p>
<h3 id="第四步：物理结构设计">第四步：物理结构设计</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611165012425.png" class="" title="image-20230611165012425">
<h4 id="存取方法的选择">存取方法的选择</h4>
<h5 id="B-树索引存取">B+树索引存取</h5>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611165346315.png" class="" title="image-20230611165346315">
<h5 id="Hash索引存取">Hash索引存取</h5>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611165525925.png" class="" title="image-20230611165525925">
<h5 id="聚簇存取">聚簇存取</h5>
<p>Cluster</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611165649840.png" class="" title="image-20230611165649840">
<h5 id="例如：">例如：</h5>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611165721350.png" class="" title="image-20230611165721350">
<h5 id="聚簇存取方法的选择">聚簇存取方法的选择</h5>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611165937973.png" class="" title="image-20230611165937973">
<h3 id="数据库的重组织">数据库的重组织</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611170318483.png" class="" title="image-20230611170318483">
<h3 id="数据库的重构造">数据库的重构造</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611170410197.png" class="" title="image-20230611170410197">
<h2 id="chap8-数据库编程">chap8 数据库编程</h2>
<h3 id="JDBC驱动">JDBC驱动</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611170906433.png" class="" title="image-20230611170906433">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611170913063.png" class="" title="image-20230611170913063">
<blockquote>
<p>可以看某次实验的代码</p>
</blockquote>
<h3 id="过程化SQL">过程化SQL</h3>
<p>SQL的扩展</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611171635704.png" class="" title="image-20230611171635704">
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611172133121.png" class="" title="image-20230611172133121">
</blockquote>
<h3 id="游标">游标</h3>
<p>类似于指针吧</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611172712784.png" class="" title="image-20230611172712784">
<h3 id="SQL块的概念">SQL块的概念</h3>
<p>主要就是两种</p>
<p>命名块有名字，能存储在数据库中供调用</p>
<p><code>过程</code>和<code>函数</code>的区别在于函数必须制定返回的类型</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611172739476.png" class="" title="image-20230611172739476">
<blockquote>
<p>没太懂存储过程和过程的区别在哪</p>
</blockquote>
<h2 id="chap10-数据库恢复技术">chap10 数据库恢复技术</h2>
<h3 id="事务Transaction">事务Transaction</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612134242791.png" class="" title="image-20230612134242791">
<h3 id="ACID特性">ACID特性</h3>
<p>事物的ACID特性：</p>
<p><strong>原子性Atomicity</strong>：事务是数据库的逻辑工作单位，事务中包括的诸操作要么都做，要么都不做</p>
<p><strong>一致性Consistency</strong>：</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612142553431.png" class="" title="image-20230612142553431">
<p><strong>隔离性Isolation</strong>：</p>
<p>隔离性是指多个并发事务同时运行时，每个事务都被隔离并互不干扰的特性。</p>
<p>隔离性确保了并发事务之间的独立性，以防止出现干扰、数据损坏或不一致的情况。当多个事务同时访问和修改数据库时，隔离性保证每个事务都感觉不到其他事务的存在，就好像它们是按顺序执行的一样。这意味着每个事务将以一种隔离的方式运行，不会受到其他事务的干扰。</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612142813057.png" class="" title="image-20230612142813057">
<p><strong>持续性Durability</strong>：</p>
<p>也称永久性</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612142843495.png" class="" title="image-20230612142843495">
<h3 id="恢复子系统">恢复子系统</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143003438.png" class="" title="image-20230612143003438">
<h3 id="故障的种类">故障的种类</h3>
<h4 id="故障1-事务内部的故障">故障1-事务内部的故障</h4>
<p>非预期的</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143237450.png" class="" title="image-20230612143237450">
<p>恢复操作是进行<strong>事务撤销（UNDO）</strong>，即强行回滚事务</p>
<h4 id="故障2-系统故障">故障2-系统故障</h4>
<p>又称为“软故障”</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143414907.png" class="" title="image-20230612143414907">
<h5 id="恢复">恢复</h5>
<p>既要UNDO，又要REDO</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143549455.png" class="" title="image-20230612143549455">
<h4 id="故障3-介质故障">故障3-介质故障</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143752017.png" class="" title="image-20230612143752017">
<h4 id="故障4-计算机病毒">故障4-计算机病毒</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143825578.png" class="" title="image-20230612143825578">
<h3 id="恢复的基本原理">恢复的基本原理</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612143917410.png" class="" title="image-20230612143917410">
<h3 id="数据转储">数据转储</h3>
<p>简单说就是定期保存下</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612153437885.png" class="" title="image-20230612153437885">
<h4 id="转储方法1-静态转储">转储方法1-静态转储</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612153605130.png" class="" title="image-20230612153605130">
<h4 id="转储方法2-动态转储">转储方法2-动态转储</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612153732379.png" class="" title="image-20230612153732379">
<h3 id="转储分类2-海量与增量">转储分类2-海量与增量</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612153832744.png" class="" title="image-20230612153832744">
<blockquote>
<p>所以排列组合后一共可以有4种转储方式</p>
</blockquote>
<h3 id="日志文件">日志文件</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612154302917.png" class="" title="image-20230612154302917">
<blockquote>
<p>协助动态转储的后备副本进行数据库恢复至某一正确状态</p>
</blockquote>
<h4 id="以记录为单位的日志文件">以记录为单位的日志文件</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612154629419.png" class="" title="image-20230612154629419">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612154646743.png" class="" title="image-20230612154646743">
<h4 id="以数据块为单位的日志文件">以数据块为单位的日志文件</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612154857301.png" class="" title="image-20230612154857301">
<blockquote>
<p>均要记录事务标识</p>
</blockquote>
<h3 id="日志文件的作用">日志文件的作用</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612155105439.png" class="" title="image-20230612155105439">
<blockquote>
<p>最后一点的意思是不需要运行<strong>程序</strong>，直接根据日志文件记录的一步步操作即可</p>
</blockquote>
<h3 id="先日志，后改数据库">先日志，后改数据库</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612155244493.png" class="" title="image-20230612155244493">
<h4 id="原因">原因</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612155328096.png" class="" title="image-20230612155328096">
<h3 id="恢复策略">恢复策略</h3>
<h4 id="事务故障的恢复">事务故障的恢复</h4>
<p>事务故障是指未正常运行到commit或者rollback</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612155835375.png" class="" title="image-20230612155835375">
<h4 id="事务故障的恢复步骤">事务故障的恢复步骤</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612160125271.png" class="" title="image-20230612160125271">
<blockquote>
<p>细读这段可以明白究竟日志文件里面记了些什么</p>
<p>反正开始结束标志肯定记了，然后每个事物都有ID（事务标识），然后有增删改查的操作就记一条（所谓的更新操作，这种记录就会包括上面讲的五个部分）</p>
<p>反向扫描</p>
</blockquote>
<h4 id="系统故障的恢复">系统故障的恢复</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612160525864.png" class="" title="image-20230612160525864">
<h4 id="系统故障的恢复步骤">系统故障的恢复步骤</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612160604161.png" class="" title="image-20230612160604161">
<h4 id="介质故障的恢复">介质故障的恢复</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612160754358.png" class="" title="image-20230612160754358">
<h4 id="介质故障的恢复步骤">介质故障的恢复步骤</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612160854540.png" class="" title="image-20230612160854540">
<h3 id="检查点技术">检查点技术</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161347266.png" class="" title="image-20230612161347266">
<h3 id="日志文件加入检查点记录">日志文件加入检查点记录</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161458253.png" class="" title="image-20230612161458253">
<h3 id="采取的策略">采取的策略</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161514500.png" class="" title="image-20230612161514500">
<blockquote>
<p>为什么T1不用重做？有没有可能他的数据还在缓冲区？</p>
<p>没有可能，这正是检查点的作用</p>
<p>因为在“动态维护日志文件”中，有一个步骤是“将当前数据缓冲区的所有数据记录写入磁盘的数据库中”</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161704463.png" class="" title="image-20230612161704463">
</blockquote>
<h3 id="数据库镜像">数据库镜像</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161837298.png" class="" title="image-20230612161837298">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161847115.png" class="" title="image-20230612161847115">
<blockquote>
<p>有故障时可救火，没故障时还可并发</p>
</blockquote>
<h4 id="并不对整个数据库进行镜像">并不对整个数据库进行镜像</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612161940076.png" class="" title="image-20230612161940076">
<h2 id="chap11-并发控制">chap11 并发控制</h2>
<p>串行、交叉并行、同时并行</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612162828851.png" class="" title="image-20230612162828851">
<blockquote>
<p>事务是并发控制的基本单位</p>
</blockquote>
<h3 id="并发操作带来的数据不一致性">并发操作带来的数据不一致性</h3>
<h4 id="1-丢失修改">1.丢失修改</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612162958300.png" class="" title="image-20230612162958300">
<h4 id="2-不可重复读"><strong>2.不可重复读</strong></h4>
<p>有好几种</p>
<p>还有幻影现象Phantom Row</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612163220847.png" class="" title="image-20230612163220847">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612163102314.png" class="" title="image-20230612163102314">
<h4 id="3-读-脏-数据">3.读"脏"数据</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612163335089.png" class="" title="image-20230612163335089">
<p>原本的修改事务被撤销了，读到了脏数据</p>
<h3 id="并发控制的主要技术">并发控制的主要技术</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612163452173.png" class="" title="image-20230612163452173">
<h3 id="封锁">封锁</h3>
<p>排它锁：写锁，只能上锁者读写</p>
<p>共享锁：读锁，自己只能读，保证别人不能改</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612165226372.png" class="" title="image-20230612165226372">
<h3 id="封锁协议">封锁协议</h3>
<h4 id="一级封锁协议">一级封锁协议</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612170010908.png" class="" title="image-20230612170010908">
<p>因为一定在T改完后</p>
<p>别人才能读或者写，所以不会丢失修改</p>
<h4 id="二级封锁协议"><strong>二级封锁协议</strong></h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612170120631.png" class="" title="image-20230612170120631">
<h4 id="三级封锁协议"><strong>三级封锁协议</strong></h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612170250578.png" class="" title="image-20230612170250578">
<h4 id="小结">小结</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612170302699.png" class="" title="image-20230612170302699">
<blockquote>
<p>不可重复读的理解：</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612170442391.png" class="" title="image-20230612170442391">
</blockquote>
<h3 id="活锁">活锁</h3>
<p>意思就是有个怨种一直没轮到，一直在等</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612172602170.png" class="" title="image-20230612172602170">
<h4 id="如何避免">如何避免</h4>
<p>FCFS</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612172617900.png" class="" title="image-20230612172617900">
<h3 id="死锁">死锁</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612173202725.png" class="" title="image-20230612173202725">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612173139839.png" class="" title="image-20230612173139839">
<h4 id="死锁的预防">死锁的预防</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612174053238.png" class="" title="image-20230612174053238">
<h4 id="死锁的诊断">死锁的诊断</h4>
<p>超时法：可能误判</p>
<p>等待图法</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612174206336.png" class="" title="image-20230612174206336">
<h4 id="等待图法">等待图法</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612174252132.png" class="" title="image-20230612174252132">
<h3 id="解除死锁">解除死锁</h3>
<p>选择处理代价最小的事务，将其撤销</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612174324233.png" class="" title="image-20230612174324233">
<h3 id="可串行调度">可串行调度</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612184556826.png" class="" title="image-20230612184556826">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612185725296.png" class="" title="image-20230612185725296">
<h3 id="冲突可串行化：给出一个判断课串行化的充分条件">冲突可串行化：给出一个判断课串行化的充分条件</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612185846853.png" class="" title="image-20230612185846853">
<h3 id="充分条件">充分条件</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190015596.png" class="" title="image-20230612190015596">
<h3 id="例子-3">例子</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190041353.png" class="" title="image-20230612190041353">
<h3 id="两段锁协议2PL">两段锁协议2PL</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190423127.png" class="" title="image-20230612190423127">
<p>就是对事务来说，所有获取锁的操作都在释放锁之前</p>
<h3 id="扩展阶段和收缩阶段">扩展阶段和收缩阶段</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190524530.png" class="" title="image-20230612190524530">
<h3 id="遵循2PL协议：又一个可串行化的充分条件">遵循2PL协议：又一个可串行化的充分条件</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190649405.png" class="" title="image-20230612190649405">
<h3 id="一次封锁法-vs-2PL协议">一次封锁法 vs 2PL协议</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190741530.png" class="" title="image-20230612190741530">
<p>例如</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612190757867.png" class="" title="image-20230612190757867">
<h3 id="封锁粒度">封锁粒度</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612191103318.png" class="" title="image-20230612191103318">
<h3 id="选择封锁粒度原则"><strong>选择封锁粒度原则</strong></h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612191131578.png" class="" title="image-20230612191131578">
<h3 id="多粒度树">多粒度树</h3>
<h3 id="多粒度协议">多粒度协议</h3>
<h3 id="显示封锁与隐式封锁">显示封锁与隐式封锁</h3>
<h3 id="引进意向锁的目的Intention-Lock">引进意向锁的目的Intention Lock</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612191438951.png" class="" title="image-20230612191438951">
<blockquote>
<p>注意，上层所有节点都要加上意向锁</p>
</blockquote>
<h3 id="意向共享锁IS">意向共享锁IS</h3>
<h3 id="意向排它锁IX">意向排它锁IX</h3>
<h3 id="共享意向排它锁SIX">共享意向排它锁SIX</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612191647028.png" class="" title="image-20230612191647028">
<blockquote>
<p>表达的是，要读这个节点，并且可能修改子节点</p>
</blockquote>
<h3 id="意向锁提高了加锁时的检查效率">意向锁提高了加锁时的检查效率</h3>
<blockquote>
<p>因为不用往下检查了</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612191853109.png" class="" title="image-20230612191853109">
<blockquote>
<p>例子：</p>
<p>意向锁的作用，相当于就是在低层次资源是否使用，加了一个tag来标识而已。对于步骤2的执行可以大大加速，仅此而已。</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612192429335.png" class="" title="image-20230612192429335">
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/dreamvyps/article/details/84500543">(1条消息) 意向锁的作用_werflychen的博客-CSDN博客 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<h3 id="意向锁的相容矩阵">意向锁的相容矩阵</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612192552557.png" class="" title="image-20230612192552557">
<blockquote>
<p>意向锁之间，只有互相带X的不兼容</p>
</blockquote>
<h2 id="NoSQL">NoSQL</h2>
<h3 id="阻抗失谐">阻抗失谐</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612201130858.png" class="" title="image-20230612201130858">
<h3 id="集群问题">集群问题</h3>
<p>关系型数据库不适合集群，大规模的数据</p>
<p>涉及分片和复制，但关系型数据库本身其实没有这些概念</p>
<p>所以NoSQL要更加适合集群，有的NoSQL就是分布式的</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612204205658.png" class="" title="image-20230612204205658">
<h3 id="特点">特点</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612201752496.png" class="" title="image-20230612201752496">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612204327913.png" class="" title="image-20230612204327913">
<blockquote>
<p>无模式，上课举了不同宠物有不同的描述属性的例子</p>
<p>有点类似于面向对象的感觉</p>
<p>比如A有属性A1 A2</p>
<p>B可以有B1 B2 B3 B4</p>
<p>不需要每个都有相同的属性列</p>
</blockquote>
<h3 id="聚合：名词而非动词">聚合：名词而非动词</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612202818656.png" class="" title="image-20230612202818656">
<h3 id="NoSQL特点：无模式">NoSQL特点：无模式</h3>
<p><img lazyload="" src="/images/loading.svg" data-src="../../../NJUer-dsy/2023-Spring/Devens_Yuan/%25E6%2595%25B0%25E6%258D%25AE%25E7%25AE%25A1%25E7%2590%2586%25E5%259F%25BA%25E7%25A1%2580-dsy/%25E6%2595%25B0%25E6%258D%25AE%25E7%25AE%25A1%25E7%2590%2586%25E5%259F%25BA%25E7%25A1%2580%25E6%259C%259F%25E6%259C%25AB%25E5%25A4%258D%25E4%25B9%25A0-dsy/%25E8%25AF%25BB%25E4%25B9%25A6%25E5%25A4%258D%25E4%25B9%25A0%25E7%25AC%2594%25E8%25AE%25B0/image-20230612205211355.png" alt="image-20230612205211355"></p>
<h3 id="格式不一致的数据">格式不一致的数据</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612205304934.png" class="" title="image-20230612205304934">
<blockquote>
<p>直接看看这两篇文章</p>
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/Foools/article/details/120205655">《NoSQL精粹》了解NoSQL这一篇就够了_Foools的博客-CSDN博客 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a>这篇全一点，但错别字有点多</p>
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/qq_27250279/article/details/129234918">NoSQL精粹笔记-概念_面向聚合数据库_平平无奇的小颜的博客-CSDN博客 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<h3 id="CAP定理">CAP定理</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612221537514.png" class="" title="image-20230612221537514">
<h3 id="BASE属性">BASE属性</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230612221630548.png" class="" title="image-20230612221630548">
<h2 id="做题记录">做题记录</h2>
<h3 id="如何判断码">如何判断码</h3>
<style>.izxzlcppxcvm{zoom: 50%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611233327926.png" class="izxzlcppxcvm" alt="image-20230611233327926">
<p>R型没什么写的必要，写出L和LR型就够了</p>
<p>先求所有L型的闭包，不够再LR型一个个加进去</p>
<blockquote>
<p>对于判断迷茫了可以看看P203第6题</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%95%B0%E6%8D%AE%E5%BA%93%E7%AE%A1%E7%90%86/notes-dbms/image-20230611233533751.png" class="" title="image-20230611233533751">
</blockquote>
</div>

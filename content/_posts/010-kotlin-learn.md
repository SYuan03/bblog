---
title: "kotlin-learn"
permalink: "/posts/2023-Summer-Courses-百度移动端/kotlin-learn.html"
date: "2023-07-24T02:26:50.000Z"
updated: "2024-09-30T12:51:52.217Z"
description: "菜鸟教程：Kotlin 教程 | 菜鸟教程 (runoob.com)  官方文档：入门 · Kotlin 官方文档 中文版 (kotlincn.net)  在线运行：Kotlin Playground: Edit, Run, Share Kotlin Code Online (kotlinlang.org)  / https://try.kotlinlang.org  简介 Kotlin 是一种在"
cover: "https://s2.loli.net/2023/07/24/NsAn8BtIVudU6yj.jpg"
categories:
  - "2023-Summer-Courses-百度移动端"
tags:
  - "移动端开发"
  - "Kotlin学习"
---

<!-- Migrated from posts/2023-Summer-Courses-百度移动端/kotlin-learn.html. Keep the permalink stable. -->
<div class="legacy-content">
<p>菜鸟教程：<a class="link" target="_blank" rel="noopener" href="https://www.runoob.com/kotlin/kotlin-tutorial.html">Kotlin 教程 | 菜鸟教程 (runoob.com) <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>官方文档：<a class="link" target="_blank" rel="noopener" href="https://book.kotlincn.net/text/getting-started.html">入门 · Kotlin 官方文档 中文版 (kotlincn.net) <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>在线运行：<a class="link" target="_blank" rel="noopener" href="https://play.kotlinlang.org/#eyJ2ZXJzaW9uIjoiMS45LjAiLCJwbGF0Zm9ybSI6ImphdmEiLCJhcmdzIjoiIiwibm9uZU1hcmtlcnMiOnRydWUsInRoZW1lIjoiaWRlYSIsImNvZGUiOiIvKipcbiAqIFlvdSBjYW4gZWRpdCwgcnVuLCBhbmQgc2hhcmUgdGhpcyBjb2RlLlxuICogcGxheS5rb3RsaW5sYW5nLm9yZ1xuICovXG5mdW4gbWFpbigpIHtcbiAgICBwcmludGxuKFwiSGVsbG8sIHdvcmxkISEhXCIpXG59In0=">Kotlin Playground: Edit, Run, Share Kotlin Code Online (kotlinlang.org) <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a> / <a class="link" target="_blank" rel="noopener" href="https://try.kotlinlang.org">https://try.kotlinlang.org <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<h1>简介</h1>
<p>Kotlin 是一种在 Java 虚拟机上运行的静态类型编程语言，被称之为 Android 世界的Swift，由 JetBrains 设计开发并开源。</p>
<p>Kotlin 可以编译成Java字节码，也可以编译成 JavaScript，方便在没有 JVM 的设备上运行。</p>
<p>在Google I/O 2017中，Google 宣布 Kotlin 成为 Android 官方开发语言。</p>
<h1>变量</h1>
<p>如果你学过Java并且足够细心的话，你可能发现了Kotlin中Int的首字母是大写的，而Java中int的首字母是小写的。不要小看这一个字母大小写的差距，这表示Kotlin<strong>完全抛弃了Java中的基本数据类型，全部使用了对象数据类型</strong>。在Java中int是关键字，而在Kotlin中Int变成了一个类，它拥有自己的方法和继承结构。</p>
<h2 id="为什么要设计val和var">为什么要设计val和var</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230724181158627.png" class="" title="image-20230724181158627">
<h1>函数</h1>
<p>一个语法糖：当一个函数中只有一行代码时，Kotlin允许我们不必编写函数体，可以直接将唯一的一行代码写在函数定义的尾部，中间用等号连接即可。</p>
<p>让kotlin自己作类型推导，所以返回类型都不用写</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">package</span> nju.dsy.helloworld</span><br><span class="line"></span><br><span class="line"><span class="keyword">import</span> kotlin.math.max</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">largerNumber</span><span class="params">(num1:<span class="type">Int</span>, num2:<span class="type">Int</span>)</span></span>: <span class="built_in">Int</span> {</span><br><span class="line">    <span class="keyword">return</span> max(num1, num2)</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">largerNumber2</span><span class="params">(num1: <span class="type">Int</span>, num2: <span class="type">Int</span>)</span></span> = max(num1, num2)</span><br><span class="line"></span><br><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">main</span><span class="params">()</span></span> {</span><br><span class="line">    <span class="keyword">var</span> a: <span class="built_in">Int</span> = largerNumber2(<span class="number">2</span>, <span class="number">40</span>)</span><br><span class="line">    a = a * <span class="number">10</span></span><br><span class="line">    println(<span class="string">"a = "</span> + a)</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<h1>if条件语句</h1>
<p>可以有返回值</p>
<p>Kotlin中的if语句相比于Java有一个额外的功能，它是可以有返回值的，返回值就是if语句每一个条件中最后一行代码的返回值。</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">largerNumber</span><span class="params">(num1: <span class="type">Int</span>, num2: <span class="type">Int</span>)</span></span> = <span class="keyword">if</span> (num1 &gt; num2) {</span><br><span class="line">    num1</span><br><span class="line">} <span class="keyword">else</span> {</span><br><span class="line">    num2</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<h1>When条件语句</h1>
<p>值匹配</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">getScore</span><span class="params">(name: <span class="type">String</span>)</span></span> = <span class="keyword">when</span> (name) {</span><br><span class="line">    <span class="string">"Tom"</span> -&gt; <span class="number">86</span></span><br><span class="line">    <span class="string">"Jim"</span> -&gt; <span class="number">77</span></span><br><span class="line">    <span class="string">"Jack"</span> -&gt; <span class="number">95</span></span><br><span class="line">    <span class="string">"Lily"</span> -&gt; <span class="number">100</span></span><br><span class="line">    <span class="keyword">else</span> -&gt; <span class="number">0</span></span><br><span class="line">}</span><br><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">getScore2</span><span class="params">(name: <span class="type">String</span>)</span></span> = <span class="keyword">when</span> {</span><br><span class="line">    name.startsWith(<span class="string">"Tom"</span>) -&gt; <span class="number">86</span></span><br><span class="line">    name == <span class="string">"Jim"</span> -&gt; <span class="number">77</span></span><br><span class="line">    name == <span class="string">"Jack"</span> -&gt; <span class="number">95</span></span><br><span class="line">    name == <span class="string">"Lily"</span> -&gt; <span class="number">100</span></span><br><span class="line">    <span class="keyword">else</span> -&gt; <span class="number">0</span></span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<p>也支持类型匹配，使用is关键字</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">checkNumber</span><span class="params">(num: <span class="type">Number</span>)</span></span> {</span><br><span class="line">    <span class="keyword">when</span> (num) {</span><br><span class="line">        <span class="keyword">is</span> <span class="built_in">Int</span> -&gt; println(<span class="string">"number is Int"</span>)</span><br><span class="line">        <span class="keyword">is</span> <span class="built_in">Double</span> -&gt; println(<span class="string">"number is Double"</span>)</span><br><span class="line">        <span class="keyword">else</span> -&gt; println(<span class="string">"number not support"</span>)</span><br><span class="line">    }</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<h1>循环语句</h1>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">val</span> range1 = <span class="number">0.</span><span class="number">.9</span>       <span class="comment">// 闭区间</span></span><br><span class="line"><span class="keyword">val</span> range2 = <span class="number">0</span> until <span class="number">10</span> <span class="comment">// 左闭右开区间</span></span><br><span class="line"><span class="keyword">val</span> range3 = <span class="number">0</span> until <span class="number">10</span> step <span class="number">2</span> <span class="comment">// 左闭右开区间，步长为2</span></span><br><span class="line"><span class="keyword">val</span> range4 = <span class="number">9</span> downTo <span class="number">0</span> step <span class="number">2</span> <span class="comment">// 闭区间，倒序</span></span><br></pre></td></tr></tbody></table></figure></div>
<h1>面向对象编程</h1>
<p>对话框在默认情况下自动选中的是创建一个File，File通常是用于编写Kotlin顶层函数和扩展函数的</p>
<h2 id="继承">继承</h2>
<p>这就是Kotlin不同的地方，在Kotlin中任何一个非抽象类默认都是不可以被继承的，相当于Java中给类声明了final关键字。</p>
<p>之所以这么设计，其实和val关键字的原因是差不多的，因为类和变量一样，最好都是不可变的，而一个类允许被继承的话，它无法预知子类会如何实现，因此可能就会存在一些未知的风险。<em>Effective Java</em>这本书中明确提到，如果一个类不是专门为继承而设计的，那么就应该主动将它加上final声明，禁止它可以被继承。</p>
<h2 id="open关键字">open关键字</h2>
<p>主动告诉编译器这个类可以被继承（即使是非抽象类</p>
<h2 id="构造函数">构造函数</h2>
<p>任何一个面向对象的编程语言都会有构造函数的概念，Kotlin中也有，但是Kotlin将构造函数分成了两种：<strong>主构造函数</strong>和<strong>次构造函数</strong></p>
<p>你可能会问，主构造函数没有函数体，如果我想在主构造函数中编写一些逻辑，该怎么办呢？Kotlin给我们提供了一个init结构体，所有主构造函数中的逻辑都可以写在里面</p>
<p>父类的字段传参不用加var/val</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725163527604.png" class="" title="image-20230725163527604">
<blockquote>
<p>简单来说就是子类有主构造函数的话，也就是子类名后面有（）不管是否有参数，说明是有主构造函数的，那么就需要继承父类的构造函数</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725202950881.png" class="" title="image-20230725202950881">
<p>如果子类没有主构造函数而是有次构造函数，那么就不需要在初始化时调用父类的构造函数了</p>
</blockquote>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// 很乱，就看懂这个得了</span></span><br><span class="line"><span class="comment">// Kotlin规定，当一个类既有主构造函数又有次构造函数时，所有的次构造函数都必须调用主构造函数（包括间接调用）</span></span><br><span class="line"><span class="keyword">class</span> <span class="title class_">Student</span>(<span class="keyword">val</span> sno: String, <span class="keyword">val</span> grade: <span class="built_in">Int</span>, name: String, age: <span class="built_in">Int</span>)</span><br><span class="line">:</span><br><span class="line"> Person(name, age) {</span><br><span class="line"> <span class="keyword">constructor</span>(name: String, age: <span class="built_in">Int</span>) : <span class="keyword">this</span>(<span class="string">""</span>, <span class="number">0</span>, name, age) {</span><br><span class="line"> }</span><br><span class="line"> <span class="keyword">constructor</span>() : <span class="keyword">this</span>(<span class="string">""</span>, <span class="number">0</span>) {</span><br><span class="line"> }</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<h2 id="接口">接口</h2>
<p>与java类似，单继承，多实现</p>
<h2 id="特性：默认实现">特性：默认实现</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725204122418.png" class="" title="image-20230725204122418">
<h2 id="可见性修饰符">可见性修饰符</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725204706614.png" class="" title="image-20230725204706614">
<h2 id="数据类：data关键字">数据类：data关键字</h2>
<p>自动重写hashCode()，toString()，equals()方法</p>
<blockquote>
<p>这三个方法在Java中是Object类的常用方法，它们在Java编程中非常重要，并且在很多场景下都是关键的。下面简要介绍它们的用途和重要性：</p>
<ol>
<li><code>hashCode()</code>方法：
<ul>
<li>用途：<code>hashCode()</code>方法返回对象的哈希码值，它是一个32位整数，用于散列数据结构中，如哈希表。</li>
<li>重要性：在使用散列数据结构时，比如HashSet、HashMap等，哈希码值决定了对象在数据结构中的存储位置。确保正确实现<code>hashCode()</code>方法是保证散列数据结构正常运作的关键。在集合类中查找对象时，首先通过哈希码值定位可能存在的位置，然后再使用<code>equals()</code>方法比较对象是否真正相等。</li>
</ul>
</li>
<li><code>toString()</code>方法：
<ul>
<li>用途：<code>toString()</code>方法返回对象的字符串表示形式，通常用于将对象转换为可读的字符串，方便调试和日志记录。</li>
<li>重要性：在调试和日志输出中，将对象转换为可读的字符串表示形式是很常见的需求。如果没有自定义<code>toString()</code>方法，通常会返回默认的类名和哈希码，这对于调试和日志记录来说是不够有用的。通过重写<code>toString()</code>方法，可以自定义对象的输出格式，使其更加有意义。</li>
</ul>
</li>
<li><code>equals()</code>方法：
<ul>
<li>用途：<code>equals()</code>方法用于比较两个对象是否相等。在默认情况下，它比较的是对象的引用（即内存地址），但在很多情况下，我们希望比较对象的内容是否相等。</li>
<li>重要性：在集合类中查找对象时，通常需要通过<code>equals()</code>方法来确定对象是否与集合中的某个元素相等。如果不正确实现<code>equals()</code>方法，可能导致集合类无法正确识别对象的相等性，从而引发错误的结果。通常，重写<code>equals()</code>方法需要同时重写<code>hashCode()</code>方法，以保持对象相等时哈希码值一致的规则。</li>
</ul>
</li>
</ol>
<p>总结：这三个方法在Java中很关键，特别是在涉及集合类的使用时。确保正确实现<code>hashCode()</code>和<code>equals()</code>方法可以保证对象在散列数据结构中正确存储和查找，而重写<code>toString()</code>方法可以方便地查看对象的内容。同时，这些方法也是面向对象编程中的基本原则之一，可以帮助我们更好地设计和使用Java类。</p>
</blockquote>
<p>省流：hashCode()和equals()方法在集合类的使用中有较大的作用</p>
<h2 id="单例类-Object类">单例类:Object类</h2>
<p>kotlin隐藏了实现</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725210813625.png" class="" title="image-20230725210813625">
<h1>lambda编程</h1>
<h2 id="mutableListOf-函数">mutableListOf()函数</h2>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="keyword">fun</span> <span class="title">main</span><span class="params">()</span></span> {</span><br><span class="line">    <span class="keyword">val</span> list = mutableListOf(</span><br><span class="line">        <span class="string">"Apple"</span>, <span class="string">"Banana"</span>, <span class="string">"Orange"</span>, <span class="string">"Pear"</span>,</span><br><span class="line">        <span class="string">"Grape"</span></span><br><span class="line">    )</span><br><span class="line">    list.add(<span class="string">"Watermelon"</span>)</span><br><span class="line">    <span class="keyword">for</span> (fruit <span class="keyword">in</span> list) {</span><br><span class="line">        println(fruit)</span><br><span class="line">    }</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<h2 id="mutableSetOf-函数">mutableSetOf()函数</h2>
<h2 id="mutableMapOf-函数">mutableMapOf()函数</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725213016399.png" class="" title="image-20230725213016399">
<h2 id="lambda表达式的语法结构">lambda表达式的语法结构</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725213743675.png" class="" title="image-20230725213743675">
<h3 id="最原始">最原始</h3>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">val</span> list = listOf(<span class="string">"Apple"</span>, <span class="string">"Banana"</span>, <span class="string">"Orange"</span>, <span class="string">"Pear"</span>, <span class="string">"Grape"</span>, <span class="string">"Watermelon"</span>)</span><br><span class="line"><span class="keyword">val</span> lambda = { fruit: String -&gt; fruit.length }</span><br><span class="line"><span class="keyword">val</span> maxLengthFruit = list.maxBy(lambda)</span><br><span class="line"><span class="comment">// -&gt; 后面是函数体，最后一行是lambda表达式的返回值，也就是说上例返回fruit.length</span></span><br><span class="line"><span class="comment">// 传入lambda表达式的参数是fruit:String</span></span><br></pre></td></tr></tbody></table></figure></div>
<p>可以看到，maxBy函数实质上就是接收了一个Lambda参数而已，并且这个Lambda参数是完全按照刚才学习的表达式的语法结构来定义的，因此这段代码应该算是比较好懂的。</p>
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725214614356.png" class="" title="image-20230725214614356">
</blockquote>
<h3 id="第一步简化">第一步简化</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725214217161.png" class="" title="image-20230725214217161">
<h3 id="继续简化">继续简化</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725214716479.png" class="" title="image-20230725214716479">
<h3 id="最终">最终</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725214653043.png" class="" title="image-20230725214653043">
<blockquote>
<p>在这里，<code>it</code>关键字代表集合中的每个元素（在这种情况下，代表集合中的每个字符串），并且由于<code>length</code>是字符串的属性，编译器可以推断出<code>it</code>是String类型，因此无需显式指定参数类型。</p>
</blockquote>
<h3 id="集合的map函数">集合的map函数</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725214859050.png" class="" title="image-20230725214859050">
<h3 id="filter函数">filter函数</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725214938865.png" class="" title="image-20230725214938865">
<h3 id="any存在-all所有">any存在 all所有</h3>
<p>返回true, false</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725215134406.png" class="" title="image-20230725215134406">
<h3 id="Java函数式API的使用">Java函数式API的使用</h3>
<p>Thread类的构造方法中接收了一个Runnable参数，我们可以使用如下Java代码创建并执行一个子线程：</p>
<div class="highlight-container" data-rel="Java"><figure class="iseeu highlight java"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">new</span> <span class="title class_">Thread</span>(<span class="keyword">new</span> <span class="title class_">Runnable</span>() {</span><br><span class="line"> <span class="meta">@Override</span></span><br><span class="line"> <span class="keyword">public</span> <span class="keyword">void</span> <span class="title function_">run</span><span class="params">()</span> {</span><br><span class="line"> System.out.println(<span class="string">"Thread is running"</span>);</span><br><span class="line"> }</span><br><span class="line">}).start();</span><br></pre></td></tr></tbody></table></figure></div>
<p>注意，这里使用了<strong>匿名类</strong>的写法，我们创建了一个Runnable接口的匿名类实例，并将它传给了Thread类的构造方法，最后调用Thread类的start()方法执行这个线程。</p>
<p>而如果直接将这段代码翻译成Kotlin版本，写法将如下所示：</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line">Thread(<span class="keyword">object</span> : Runnable {</span><br><span class="line"> <span class="keyword">override</span> <span class="function"><span class="keyword">fun</span> <span class="title">run</span><span class="params">()</span></span> {</span><br><span class="line"> println(<span class="string">"Thread is running"</span>)</span><br><span class="line"> }</span><br><span class="line">}).start()</span><br></pre></td></tr></tbody></table></figure></div>
<p>Kotlin中匿名类的写法和Java有一点区别，由于Kotlin完全舍弃了new关键字，因此创建匿名类实例的时候就不能再使用new了，而是改用了<strong>object</strong>关键字。这种写法虽然算不上复杂，但是相比于Java的匿名类写法，并没有什么简化之处。</p>
<p>但是别忘了，目前Thread类的构造方法是符合<strong>Java函数式API</strong>的使用条件的，下面我们就看看如何对代码进行精简，如下所示：</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">Thread(Runnable {</span><br><span class="line"> println(<span class="string">"Thread is running"</span>)</span><br><span class="line">}).start()</span><br></pre></td></tr></tbody></table></figure></div>
<p>这段代码明显简化了很多，既可以实现同样的功能，又不会造成任何歧义。因为Runnable类中只有一个待实现方法，即使这里没有显式地重写run()方法，Kotlin也能自动明白Runnable后面的Lambda表达式就是要在run()方法中实现的内容。</p>
<p>另外，如果一个Java方法的参数列表中有且仅有一个Java单抽象方法接口参数，我们还可以将接口名进行省略，这样代码就变得更加精简了：</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">Thread({</span><br><span class="line"> println(<span class="string">"Thread is running"</span>)</span><br><span class="line">}).start()</span><br></pre></td></tr></tbody></table></figure></div>
<p>不过到这里还没有结束，和之前Kotlin中函数式API的用法类似，当Lambda表达式是方法的最后一个参数时，可以将Lambda表达式移到方法括号的外面。同时，如果Lambda表达式还是方法的唯一一个参数，还可以将方法的括号省略，最终简化结果如下：</p>
<div class="highlight-container" data-rel="Kotlin"><figure class="iseeu highlight kotlin"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">Thread {</span><br><span class="line"> println(<span class="string">"Thread is running"</span>)</span><br><span class="line">}.start()</span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>总结就是只要没有歧义，随便怎么简化</p>
</blockquote>
<blockquote>
<p>挖坑：高阶函数</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725220214837.png" class="" title="image-20230725220214837">
</blockquote>
<h1>空指针检查</h1>
<h2 id="空指针异常检查提前">空指针异常检查提前</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725220523675.png" class="" title="image-20230725220523675">
<h2 id="可为空的类型系统">可为空的类型系统</h2>
<p><code>?</code>操作符</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725220710813.png" class="" title="image-20230725220710813">
<p><code>?.</code>操作符</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725220654674.png" class="" title="image-20230725220654674">
<p><code>?:</code>左边空就返回右边</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725220818466.png" class="" title="image-20230725220818466">
<h2 id="let函数">let函数</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725221229409.png" class="" title="image-20230725221229409">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725221238609.png" class="" title="image-20230725221238609">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-%E7%99%BE%E5%BA%A6%E7%A7%BB%E5%8A%A8%E7%AB%AF/kotlin-learn/image-20230725221246138.png" class="" title="image-20230725221246138">
</div>

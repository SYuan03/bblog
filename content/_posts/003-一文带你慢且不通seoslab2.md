---
title: "一文带你慢且不通SEOSLab2"
permalink: "/posts/2023-Spring-Courses-操作系统/一文带你慢且不通seoslab2.html"
date: "2023-04-14T15:45:07.000Z"
updated: "2024-09-30T12:52:08.489Z"
cover: "/generated-covers/003-一文带你慢且不通seoslab2.webp"
description: "记录 SEOS Lab2 的实现过程：从 Makefile 和 FAT12 镜像结构入手，解析目录与文件并构建树，再用汇编输出完成 cat、ls 等命令。"
categories:
  - "2023-Spring-Courses-操作系统"
tags:
  - "操作系统"
---

<!-- Migrated from posts/2023-Spring-Courses-操作系统/一文带你慢且不通seoslab2.html. Keep the permalink stable. -->
<div class="legacy-content">
<blockquote>
<p>主要是针对OS Lab2的一些记录，自己看看的</p>
</blockquote>
<h2 id="makefile解读">makefile解读</h2>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/XHoR61YnEw3OAlr.png" alt="image-20230427102950131"></p>
<p>一共三条，<code>make onlyCpp</code>主要是一开始没写汇编的打印函数，全用的cout，先编译出来看看效果</p>
<p>同时也是为了便于调试，打断点（./main的过程可能也是可以调的，没试</p>
<br>
<h2 id="实验开始前">实验开始前</h2>
<h3 id="装库">装库</h3>
<p>gcc-multilib 和 g+±multilib</p>
<p>不然后面会报错</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/1QvgZUe8h4tfKy3.png" alt="image-20230427103322790"></p>
<h3 id="制作软盘并建立结构">制作软盘并建立结构</h3>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line">mkfs.fat -C a.img 1440</span><br><span class="line"><span class="built_in">mkdir</span> mountlab2 <span class="comment"># 挂载点</span></span><br><span class="line">sudo mount ./a.img ./mountlab2 <span class="comment"># 进行挂载</span></span><br><span class="line"><span class="built_in">cd</span> ./mountlab2 <span class="comment"># 就可以进行一些创建之类的操作了</span></span><br></pre></td></tr></tbody></table></figure></div>
<p>补充：</p>
<ol>
<li>
<p>创建层及目录mkdir可加-p参数</p>
<p><code>mkdir -p a/b/c</code></p>
</li>
<li>
<p>进入挂载好的目录之后，切换成root创建各种东西会方便点</p>
<p>如果是普通用户vim文件时可能显示文件read only</p>
</li>
<li>
<p>在盘的根路径下使用tree命令查看结构</p>
</li>
</ol>
<br>
<h2 id="代码部分">代码部分</h2>
<p>直接从主代码开始看</p>
<p><strong>整个结构，很重要：</strong></p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/Dx4ABkqjgGSsz28.png" alt="image-20230427143504426"></p>
<h3 id="1-初始化BPB信息">1. 初始化BPB信息</h3>
<p>打开文件，用自建的BPB类读取相关信息</p>
<h4 id="BPB类如下：">BPB类如下：</h4>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/u3E6vf5xDYZ4RLl.png" alt="image-20230427142737793"></p>
<h4 id="init函数读取">init函数读取</h4>
<p>bpb-&gt;init(fat12)进行读取</p>
<p><strong>先读到bpb类的成员函数里面（两行就行</strong></p>
<div class="highlight-container" data-rel="C++"><figure class="iseeu highlight c++"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// BPB从第11个字节处开始，0-2为短跳转指令，3-10为厂商名</span></span><br><span class="line"><span class="built_in">fseek</span>(fat12, <span class="number">11</span>, SEEK_SET);</span><br><span class="line"><span class="built_in">fread</span>(<span class="keyword">this</span>, <span class="number">1</span>, <span class="number">25</span>, fat12); <span class="comment">// BPB长度为25字节</span></span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>再初始化一些后面可能用到的全局变量</strong></p>
<p>要计算的是四个</p>
<p>BytesPerClus = 1 * 512</p>
<p>FATBase = 1 * 512</p>
<p>RootDirBase = (1 + 2 * 9) * 512</p>
<p>DataBase = ((224 * 32 + 32 - 1) / 512 + 1 + 2 * 9) * 512</p>
<h3 id="2-创建root根节点（所要建立的那个树">2. 创建root根节点（所要建立的那个树</h3>
<h4 id="Node类如下：">Node类如下：</h4>
<p>以及还有一部分get set方法</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/lKzvMIarEkH984i.png" alt="image-20230427145121947"></p>
<h4 id="设置一些root的成员变量">设置一些root的成员变量</h4>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/sM3mtyTRpl2ZcA9.png" alt="image-20230427145612583"></p>
<h3 id="3-开始创建树，利用根目录区开始">3. 开始创建树，利用根目录区开始</h3>
<blockquote>
<p>根目录区其实就是很多目录项（这里的目录包含文件，比如我使用的img文件中根目录下就应该有三项</p>
<p>0x2600根目录区开始</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/ZnjXdrGlfqoF2Js.png" alt="image-20230427150108412"></p>
<p>后面不用管，注意文件名是8+3</p>
</blockquote>
<p>由此开始读文件（并且建立树结构）之旅</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/nrEPK7HThxu3JLW.png" alt="image-20230427150150503"></p>
<p><strong>RootDirEntry结构如下：</strong></p>
<blockquote>
<p>RootDirEntry纯粹就是个读东西存放用的工具</p>
<p>一共32字节，也就是两行</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/6Uq8TxrPiVkyBpX.png" alt="image-20230427151107912"></p>
<p>这样就是一个目录项</p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/jf5dEMYhKNoUHv3.png" alt="image-20230427150323300"></p>
<h4 id="RootDirEntry里有readFile方法，从这个开始递归读取">RootDirEntry里有readFile方法，从这个开始递归读取</h4>
<blockquote>
<p>注1：讲道理这个readFile方法其实就调用了一次，不该作为RootDirEntry的成员方法，而应该是全局的一个函数</p>
<p>注2：RootDirEntry类的DIR_Name就是那个占11字节的名字</p>
<p>注3：就是在这里获取了DIR_FstClus，后面读取内容会用到</p>
</blockquote>
<h4 id="主体结构如下">主体结构如下</h4>
<blockquote>
<p>注1：根目录项的文件属性</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/lCxYyKrFcNUXia3.png" alt="image-20230427154655628"></p>
</blockquote>
<div class="highlight-container" data-rel="C++"><figure class="iseeu highlight c++"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br></pre></td><td class="code"><pre><span class="line"><span class="function"><span class="type">void</span> <span class="title">RootDirEntry::readFile</span><span class="params">(FILE *fat12)</span> </span>{</span><br><span class="line">    <span class="type">int</span> base = RootDirBase; <span class="comment">// 读取位置，起始位置为根目录区首地址</span></span><br><span class="line">    </span><br><span class="line">    <span class="keyword">for</span> (<span class="type">int</span> i = <span class="number">0</span>; i &lt; RootEntCnt; i++) {</span><br><span class="line">        <span class="built_in">fseek</span>(fat12, base, SEEK_SET);</span><br><span class="line">        <span class="built_in">fread</span>(<span class="keyword">this</span>, <span class="number">1</span>, <span class="number">32</span>, fat12); <span class="comment">// 读32字节，即一个条目的大小</span></span><br><span class="line">        base += <span class="number">32</span>;</span><br><span class="line">        <span class="keyword">if</span> (<span class="keyword">this</span>-&gt;<span class="built_in">isInvalidName</span>()) {</span><br><span class="line">            <span class="keyword">continue</span>;</span><br><span class="line">        }</span><br><span class="line">        <span class="keyword">if</span> ((<span class="keyword">this</span>-&gt;DIR_Attr &amp; <span class="number">0x10</span>) == <span class="number">0</span>) { <span class="comment">// 属性是0x10表示是文件</span></span><br><span class="line">            string name = <span class="built_in">dealFileName</span>(<span class="keyword">this</span>-&gt;DIR_Name); <span class="comment">// 处理文件名</span></span><br><span class="line"></span><br><span class="line">            <span class="comment">// 创建node* fileNode将其加入到root的children里</span></span><br><span class="line">            <span class="comment">// 略</span></span><br><span class="line">            </span><br><span class="line">            <span class="comment">// 读取文件内容</span></span><br><span class="line">            <span class="built_in">readFileContent</span>(fat12, fileChild);</span><br><span class="line">        } <span class="keyword">else</span> <span class="keyword">if</span> ((<span class="keyword">this</span>-&gt;DIR_Attr &amp; <span class="number">0x20</span>) == <span class="number">0</span>) {     <span class="comment">// 0x20表示是目录</span></span><br><span class="line">            string name = <span class="built_in">dealDirName</span>(<span class="keyword">this</span>-&gt;DIR_Name); <span class="comment">// 处理目录名</span></span><br><span class="line"></span><br><span class="line">			<span class="comment">// 创建node* dirNode将其加入到root的children里</span></span><br><span class="line">            <span class="comment">// 略</span></span><br><span class="line"></span><br><span class="line">            <span class="comment">// 读取目录，更确切的来说是根目录的子目录的内容</span></span><br><span class="line">            <span class="built_in">readDirContent</span>(fat12, dirChild);</span><br><span class="line">        }</span><br><span class="line">    }</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<p><strong>bool RootDirEntry::isInvalidName()：</strong></p>
<p>读取根目录项时判断哪些是需要的文件或目录</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/i2hB95QRzKj3Aor.png" alt="image-20230427154404957"></p>
<p>以’\0’开头（就是空的目录项）或者出现11个字节内出现任何不合法字符就是invalid</p>
<blockquote>
<p>可如下验证：</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/O92YWmEZfbXvF4r.png" alt="image-20230427154538896"></p>
</blockquote>
<h4 id="RootDirEntry-readFile内的四个函数">RootDirEntry::readFile内的四个函数</h4>
<p>string name = <strong>dealFileName</strong>(entry-&gt;getDirName());</p>
<p><strong>readFileContent</strong>(fat12, fileChild);</p>
<p>string name = <strong>dealDirName</strong>(entry-&gt;getDirName());</p>
<p><strong>readDirContent</strong>(fat12, dirChild);</p>
<p>递归就是靠这两个readContent函数实现的</p>
<blockquote>
<p>个人感觉递归的关键在于</p>
<p><strong>如果根目录下是一个目录，那么在数据区对应的地方也是会有一个32字节的目录项，就跟根目录区是一样的构成</strong></p>
<p><strong>数据区并不全是数据，非根目录的目录也是会在这的</strong></p>
</blockquote>
<blockquote>
<p>复看代码的时候发现一处问题</p>
<p>linux并不是文件都有扩展名，所以在dealFileName的时候，文件名是不一定包含’.'的</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/YuvREt7VBNdKxw5.png" alt="image-20230427160658080"></p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/nxRQVtFbqlg2WkK.png" alt="image-20230427160823064"></p>
<p>但好像这次实验又说了文件会有扩展名，所以就不修这个地方了，要修的话无非就是判断下后面有没有扩展名，没有的话就把’.'去掉而已</p>
</blockquote>
<h4 id="getFatValue">getFatValue()</h4>
<p>实现两个readContent函数还有一个关键的地方在于获取fat表项的值</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/hul6sjEVRDn9XJy.png" alt="image-20230427162922356"></p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/57hN1yMDAeGI2CL.png" alt="image-20230427162954663"></p>
<blockquote>
<p>小端存储：低地址向高地址生长</p>
<p>数据的高字节在高位就是小端存储</p>
<p>图中的例子，读到HOUSE的FstClus=3然后</p>
<p>0x200 + 3 * 3 / 2 = 0x204</p>
<p>把204(f0) 205(ff)的字节读出来是fff0，奇数，取高12位fff</p>
<p>说明结束了，HOUSE的内容只在簇3</p>
<p>然后簇3-2=簇1</p>
<p>数据区起始在0x4200一个簇512字节就是0x200所以0x4400的数据就是它的内容</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/fqAZPeU1lI3tp6x.png" alt="image-20230427164448142"></p>
</blockquote>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/4klpcnRqob28ANB.png" alt="image-20230427163104689"></p>
<p>至此，文件终于读完了！树也构建好了</p>
<h3 id="4-汇编实现的打印函数">4. 汇编实现的打印函数</h3>
<div class="highlight-container" data-rel="Plaintext"><figure class="iseeu highlight plaintext"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br></pre></td><td class="code"><pre><span class="line">global myAsmPrint</span><br><span class="line"></span><br><span class="line">	section .text</span><br><span class="line">myAsmPrint:</span><br><span class="line">	; 利用栈传递参数</span><br><span class="line">	mov	eax,4		; 系统调用号</span><br><span class="line">	mov	ebx,1 		; 文件描述符，1表示stdout</span><br><span class="line">	mov	ecx,[esp+4]	; char * s ;加4是因为调用函数首先要压IP进栈，接下来的两个</span><br><span class="line">	mov	edx,[esp+8]	; length </span><br><span class="line">	int	80h</span><br><span class="line">	ret</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="关于参数压栈顺序">关于参数压栈顺序</h4>
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/zhengnianli/article/details/106684135">(2条消息) C语言 | 函数参数压栈的顺序是？_函数参数压栈顺序_嵌入式大杂烩的博客-CSDN博客 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>栈应该是高地址往地址生长</p>
<p>C/C++ 参数从右往左压栈，而之前要先压入一个IP，所以栈从高到低是</p>
<p>长度、首地址、IP</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://s2.loli.net/2023/04/27/LPSv248pch5xslB.png" alt="image-20230427165628885"></p>
<h3 id="5-实现cat命令">5. 实现cat命令</h3>
<p>cat和ls都用到了一个关键的函数</p>
<h4 id="findFileNodeByName">findFileNodeByName</h4>
<p>找到的话就返回节点，没找到或者找的过程中有不存在的，也会返回空</p>
<h3 id="6-实现ls和ls-l">6. 实现ls和ls -l</h3>
<blockquote>
<p>注意<code>ls -</code> 是要报错的</p>
</blockquote>
<p>ls 和 ls -l差不太多</p>
<p>递归实现下listAllContentWithoutL和listAllContentWithL就行</p>
<div class="highlight-container" data-rel="C++"><figure class="iseeu highlight c++"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br><span class="line">33</span><br><span class="line">34</span><br><span class="line">35</span><br><span class="line">36</span><br><span class="line">37</span><br><span class="line">38</span><br><span class="line">39</span><br><span class="line">40</span><br><span class="line">41</span><br><span class="line">42</span><br><span class="line">43</span><br><span class="line">44</span><br><span class="line">45</span><br><span class="line">46</span><br><span class="line">47</span><br><span class="line">48</span><br><span class="line">49</span><br><span class="line">50</span><br><span class="line">51</span><br><span class="line">52</span><br><span class="line">53</span><br><span class="line">54</span><br><span class="line">55</span><br><span class="line">56</span><br><span class="line">57</span><br><span class="line">58</span><br><span class="line">59</span><br><span class="line">60</span><br><span class="line">61</span><br><span class="line">62</span><br><span class="line">63</span><br><span class="line">64</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// ls指令，要处理的东西还是很多的</span></span><br><span class="line"><span class="function"><span class="type">void</span> <span class="title">ls</span><span class="params">(vector&lt;string&gt; &amp;commands)</span> </span>{</span><br><span class="line">    <span class="type">bool</span> haveL = <span class="literal">false</span>;</span><br><span class="line">    <span class="type">bool</span> haveDir = <span class="literal">false</span>;</span><br><span class="line">    <span class="type">int</span> dirCount = <span class="number">0</span>;</span><br><span class="line">    string dir;</span><br><span class="line"></span><br><span class="line">    <span class="keyword">for</span> (<span class="type">int</span> i = <span class="number">1</span>; i &lt; commands.<span class="built_in">size</span>(); i++) {</span><br><span class="line">        <span class="keyword">if</span> (commands[i][<span class="number">0</span>] == <span class="string">'-'</span>) {</span><br><span class="line">            haveL = <span class="literal">true</span>;</span><br><span class="line">            <span class="type">bool</span> validL = <span class="built_in">isValidL</span>(commands[i]);</span><br><span class="line">            <span class="keyword">if</span> (!validL) { <span class="comment">// 如果指令不合法，提示输入错误，并直接结束</span></span><br><span class="line">                <span class="built_in">myPrint</span>(ERROR_COMMAND);</span><br><span class="line">                <span class="keyword">return</span>;</span><br><span class="line">            }</span><br><span class="line">        } <span class="keyword">else</span> {</span><br><span class="line">            haveDir = <span class="literal">true</span>;</span><br><span class="line">            dir = commands[i];</span><br><span class="line">            dirCount++;</span><br><span class="line">        }</span><br><span class="line">    }</span><br><span class="line">    </span><br><span class="line">    <span class="comment">// 执行到这里如果有l也是合法的</span></span><br><span class="line">    <span class="keyword">if</span> (dirCount &gt; <span class="number">1</span>) { <span class="comment">// 有多个目录是不合法的</span></span><br><span class="line">        <span class="built_in">myPrint</span>(<span class="string">"Too much directory!"</span>);</span><br><span class="line">        <span class="built_in">myPrint</span>(<span class="string">"\n"</span>);</span><br><span class="line">        <span class="keyword">return</span>;</span><br><span class="line">    }</span><br><span class="line">    </span><br><span class="line">    <span class="keyword">if</span> (haveL) {</span><br><span class="line">        <span class="keyword">if</span> (!haveDir) { <span class="comment">// 有l 没目录</span></span><br><span class="line">            <span class="built_in">listAllContentWithL</span>(root);</span><br><span class="line">        } <span class="keyword">else</span> { <span class="comment">// 有l 有目录</span></span><br><span class="line">            Node *file = <span class="built_in">findFileNodeByName</span>(dir);</span><br><span class="line">            <span class="keyword">if</span> (file != <span class="literal">nullptr</span>) { </span><br><span class="line">                <span class="keyword">if</span> (file-&gt;<span class="built_in">getFileType</span>() == FileType::FILE) {</span><br><span class="line">                    <span class="built_in">myPrint</span>(<span class="string">"This is a File!\n"</span>);</span><br><span class="line">                    <span class="keyword">return</span>;</span><br><span class="line">                }</span><br><span class="line">                <span class="built_in">listAllContentWithL</span>(file);</span><br><span class="line">            } <span class="keyword">else</span> {</span><br><span class="line">                <span class="built_in">myPrint</span>(CANNOT_FOUND);</span><br><span class="line">                <span class="keyword">return</span>;</span><br><span class="line">            }</span><br><span class="line">        }</span><br><span class="line">    } <span class="keyword">else</span> {</span><br><span class="line">        <span class="keyword">if</span> (!haveDir) { <span class="comment">// 没l 没目录</span></span><br><span class="line">            <span class="built_in">listAllContentWithoutL</span>(root);</span><br><span class="line">        } <span class="keyword">else</span> { <span class="comment">// 没l 有目录</span></span><br><span class="line">            Node *file = <span class="built_in">findFileNodeByName</span>(dir);</span><br><span class="line">            <span class="keyword">if</span> (file != <span class="literal">nullptr</span>) { <span class="comment">// 如果文件存在，则输出，不存在则报错退出</span></span><br><span class="line">                <span class="keyword">if</span> (file-&gt;<span class="built_in">getFileType</span>() == FileType::FILE) {</span><br><span class="line">                    <span class="built_in">myPrint</span>(<span class="string">"This is a File!\n"</span>);</span><br><span class="line">                    <span class="keyword">return</span>;</span><br><span class="line">                }</span><br><span class="line">                <span class="built_in">listAllContentWithoutL</span>(file);</span><br><span class="line">                <span class="keyword">return</span>;</span><br><span class="line">            } <span class="keyword">else</span> {</span><br><span class="line">                <span class="built_in">myPrint</span>(CANNOT_FOUND);</span><br><span class="line">                <span class="keyword">return</span>;</span><br><span class="line">            }</span><br><span class="line">        }</span><br><span class="line">    }</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
</div>

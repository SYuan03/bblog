---
title: "notes-os"
permalink: "/posts/2023-Spring-Courses-操作系统/notes-os.html"
date: "2023-06-16T14:25:39.000Z"
updated: "2024-09-30T12:52:08.717Z"
description: "一份覆盖操作系统核心章节的复习笔记，整理进程与调度、虚拟内存、页面置换、I/O 与磁盘调度、文件系统等概念及典型题型。"
cover: "/generated-covers/legacy-KfOI7iDNwsPCGBX-e117d1a1.webp"
categories:
  - "2023-Spring-Courses-操作系统"
tags:
  - "操作系统"
---

<!-- Migrated from posts/2023-Spring-Courses-操作系统/notes-os.html. Keep the permalink stable. -->
<div class="legacy-content">
<p>[TOC]</p>
<h1>chap2 处理器管理</h1>
<h2 id="如何区分内核态和用户态？">如何区分内核态和用户态？</h2>
<p>P43</p>
<p>处理器状态位（程序状态字PSW中的一个比特位</p>
<h2 id="中断源">中断源</h2>
<ol>
<li>
<p><strong>硬件故障中断</strong>：电源故障，主存故障，线路故障</p>
</li>
<li>
<p><strong>程序性中断</strong>：执行指令异常或出错</p>
<p>除0、溢出、虚拟地址异常等</p>
</li>
<li>
<p>**自愿性中断：**又称为系统调用</p>
</li>
<li>
<p>**I/O中断：**比如外围设备输入输出完了，又或者输入输出异常了</p>
</li>
<li>
<p>**外部中断：**时钟中断，关机重启等</p>
</li>
</ol>
<h2 id="系统调用的处理过程">系统调用的处理过程</h2>
<p>P46 + P25-26（详细）</p>
<p>陷入指令：操作码（用于标识是陷入指令）+ 功能号</p>
<p>这是非特权指令</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613160246671.png" class="" title="image-20230613160246671">
<h2 id="中断、异常与系统异常">中断、异常与系统异常</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613160644480.png" class="" title="image-20230613160644480">
<p>感觉就是前面5类分成了三类</p>
<ul>
<li>中断：I/O + 外部</li>
<li>异常：程序性 + 硬件故障</li>
<li>系统异常：自愿性中断（系统调用）</li>
</ul>
<h2 id="三态模型">三态模型</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613163358249.png" class="" title="image-20230613163358249">
<h2 id="PSW-vs-PCB">PSW vs PCB</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613164054502.png" class="" title="image-20230613164054502">
<h2 id="进程管理是由许多程序共同实现的">进程管理是由许多程序共同实现的</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613170109607.png" class="" title="image-20230613170109607">
<h2 id="队列管理程序：核心模块">队列管理程序：核心模块</h2>
<h2 id="进程控制程序：使用原语">进程控制程序：使用原语</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613170548730.png" class="" title="image-20230613170548730">
<h2 id="进程切换：必须在内核态完成，所以需要模式切换">进程切换：必须在内核态完成，所以需要模式切换</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613170847402.png" class="" title="image-20230613170847402">
<blockquote>
<p>进程切换使用的是软中断，反正不是硬件中断，就是软中断了，书上程序性中断里有一条就是“终止进程中断”，应该就是能引起进程切换的一种中断</p>
</blockquote>
<h2 id="单线程到多线程">单线程到多线程</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613184055766.png" class="" title="image-20230613184055766">
<blockquote>
<p>用户栈和内核栈</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613184324234.png" class="" title="image-20230613184324234">
</blockquote>
<h2 id="多线程技术的优点和应用">多线程技术的优点和应用</h2>
<p>P67</p>
<h2 id="KLT与ULT">KLT与ULT</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613185033419.png" class="" title="image-20230613185033419">
<blockquote>
<p>稍微有点理解，因为虽然是用户级多线程，但是OS调度的还是进程去执行，并没有达到并行的效果</p>
</blockquote>
<h2 id="混合策略">混合策略</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613185331108.png" class="" title="image-20230613185331108">
<h2 id="三级调度">三级调度</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613190255629.png" class="" title="image-20230613190255629">
<blockquote>
<p>补充：周转时间的概念</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613194512119.png" class="" title="image-20230613194512119">
<style>.qoyrfwgmwzle{zoom: 50%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613194611521.png" class="qoyrfwgmwzle" alt="image-20230613194611521">
</blockquote>
<blockquote>
<p><strong>进程调度算法汇总</strong></p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620202102546.png" class="" title="image-20230620202102546">
</blockquote>
<h2 id="1-优先数调度算法">1.优先数调度算法</h2>
<p>分为抢占式和非抢占式</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191056829.png" class="" title="image-20230613191056829">
<h3 id="优先数可以是">优先数可以是</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191112408.png" class="" title="image-20230613191112408">
<h3 id="1-1-FCFS先来先服务">1.1 FCFS先来先服务</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191930833.png" class="" title="image-20230613191930833">
<blockquote>
<ul>
<li>
<p><strong><mark>一个短进程可能不得不等待很长时间才能获得执行</mark></strong></p>
</li>
<li>
<p><mark><strong>偏袒计算为主的进程</strong></mark></p>
<p><mark><strong>I/O多的进程不得不等待计算为主的进程做完</strong></mark></p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613192032887.png" class="" title="image-20230613192032887">
</li>
</ul>
</blockquote>
<h3 id="1-2-最短进程优先SPF">1.2 最短进程优先SPF</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613193043368.png" class="" title="image-20230613193043368">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613193056108.png" class="" title="image-20230613193056108">
<p>例子</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613193109303.png" class="" title="image-20230613193109303">
<blockquote>
<p>非抢占式，所以轮到了就能执行完，从没轮到的里挑最短的就行</p>
<p><mark>问题在于长进程可能会饿死</mark></p>
</blockquote>
<h3 id="1-3-最短剩余时间优先SRTF">1.3 最短剩余时间优先SRTF</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613193302122.png" class="" title="image-20230613193302122">
<p>例子</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613193616228.png" class="" title="image-20230613193616228">
<blockquote>
<p>应该每个时间片都会检查下，不然没法抢占</p>
<p><strong>emm也可能是有新进程到达的时刻会进行能否抢占的判断</strong></p>
</blockquote>
<h3 id="1-4-最高响应比优先HRRF">1.4 最高响应比优先HRRF</h3>
<p>非抢占式，一个进程能运行完</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613193855402.png" class="" title="image-20230613193855402">
<blockquote>
<p>作业1有例子：算一下1+ 已等待时间/服务所需时间</p>
</blockquote>
<h2 id="2-时间片轮转调度算法">2.时间片轮转调度算法</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191149620.png" class="" title="image-20230613191149620">
<h3 id="2-1-RR时间片轮转">2.1 RR时间片轮转</h3>
<p>反正就是有个队列</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613192454834.png" class="" title="image-20230613192454834">
<p>例子</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613192703778.png" class="" title="image-20230613192703778">
<blockquote>
<p>0-1: A</p>
<p>1-2: A</p>
<p>2-3: B执行（因为2的时候B来了，B开始执行，A进入队列</p>
<p>3-4: A执行（B进入队列，4的时候C进入队列，此时队列是BC</p>
<p>4-5: B执行（队列C，A执行完了</p>
</blockquote>
<h2 id="3-分级调度算法feedback">3.分级调度算法feedback</h2>
<p>又叫<strong>多级反馈队列</strong>，抢占式</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191253802.png" class="" title="image-20230613191253802">
<h3 id="例子">例子</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191317257.png" class="" title="image-20230613191317257">
<h3 id="如何分级？">如何分级？</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191414270.png" class="" title="image-20230613191414270">
<h3 id="算法如下：">算法如下：</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/731364e5424c493ae86ec16e7a368c8c.png" class="" title="BF5A3j.png">
<blockquote>
<p>被抢占才会降级</p>
</blockquote>
<h3 id="q-1">q=1</h3>
<blockquote>
<p>q=1表示虽然是多级但其实每个分的时间片都是1，所以后续会有一个跟RR算法的比较（因为看起来似乎一样，都是平等时间片</p>
<p>q=2<sup>i</sup> 表示RQ0分到2<sup>0</sup> = 1个片，RQ1分到2个，RQ2分到4个</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613195235656.png" class="" title="image-20230613195235656">
<h3 id="对比RR和Feedback-q-1">对比RR和Feedback(q=1)</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613195655867.png" class="" title="image-20230613195655867">
<blockquote>
<p><strong>上面的比较就是Feedback算法 C会先获得一段运行的时间</strong></p>
<p>Feedback：RQ0-&gt;RQ2优先级降低，时间片增长，有种均衡的感觉，优先级高的队列里都没了才轮到优先级低的队列</p>
<p>t=0，A到进入RQ0，A运行</p>
<p>t=1，A虽然没有结束，但是没有别的队列，所以A还是可以运行</p>
<p>t=2，B到B进入RQ0，A被降到RQ1，B运行</p>
<p>t=3，B也没运行完，进入RQ1排在A后面，由于没有RQ0，调度RQ1，A轮到运行，A结束</p>
<p>t=4，C到了，进入RQ0，C运行</p>
<p>t=5，C进入RQ1排在B之后，B运行</p>
<p>t=6，B又没运行完，进入RQ2，C运行</p>
<p>B一直运行到结束</p>
</blockquote>
<h3 id="例2">例2</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613202244850.png" class="" title="image-20230613202244850">
<h2 id="4-彩票调度算法">4.彩票调度算法</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613191435701.png" class="" title="image-20230613191435701">
<ol>
<li>基本思想：为进程发放针对<strong>系统各种资源</strong>(如CPU时间)的彩票；当调度程序需要做出决策时，随机选择一张彩票，持有该彩票的进程将获得系统资源</li>
<li>功能比保证调度好的多，服务器和客户：客户需要调用服务器服务，则将彩票交给服务器</li>
<li>合作进程之间的彩票交换</li>
<li>一般不会在实时操作系统中使用，但是可以在服务器端进行使用，特别是视频点播服务器</li>
</ol>
<blockquote>
<p>这篇文章写的蛮生动的，但是公式显然是错的</p>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cnblogs.com/tobe98/p/11792610.html">彩票调度算法——让进程们拼手气？ - tobe的呓语 - 博客园 (cnblogs.com) <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/1780031-20191104161113276-377431431.png" class="" title="img">
<p>P应该是1-(99/100)^100 = 0.634概率随n增大而增大</p>
</blockquote>
<h2 id="Unix-SVR4-调度算法"><strong>Unix SVR4</strong> 调度算法</h2>
<p>任务的优先级分成了三种</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613220816415.png" class="" title="image-20230613220816415">
<p>实时》内核》分时</p>
<h2 id="进程管理的fork调用">进程管理的fork调用</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613221513690.png" class="" title="image-20230613221513690">
<blockquote>
<p>注意题干：可再产生，所以是7个</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613222130541.png" class="" title="image-20230613222130541">
</blockquote>
<h1>chap3 存储管理</h1>
<p>逻辑地址：用户编程用的</p>
<p>物理地址：又叫绝对地址，是实际的地址</p>
<h2 id="四种模式">四种模式</h2>
<p>P83</p>
<p>2*2=4种</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230613232345541.png" class="" title="image-20230613232345541">
<p>大体分为两类</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615192544792.png" class="" title="image-20230615192544792">
<h2 id="虚拟存储器的基本思想">虚拟存储器的基本思想</h2>
<ul>
<li>存储管理把进程全部信息放在辅存中，执行时先将其中一部分装入主存，以后根据执行行为<strong>随用随调入</strong>（<mark>部分装入</mark></li>
<li>如主存中没有足够的空闲空间，存储管理需要根据执行行为把主存中暂时不用的信息<strong>调出</strong>到辅存上去（空间不足时需要调出一部分信息（<mark>部分替换</mark></li>
</ul>
<h2 id="虚拟存储器的示意图">虚拟存储器的示意图</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/0615164452.png" class="">
<blockquote>
<p>虚拟地址可以说是将逻辑地址映射到物理地址的一种手段</p>
</blockquote>
<h2 id="单用户连续分区存储管理-固定分区存储管理-可变分区存储管理">单用户连续分区存储管理-&gt;固定分区存储管理-&gt;可变分区存储管理</h2>
<p>P90</p>
<h3 id="可变分区主存分配算法">可变分区主存分配算法</h3>
<ol>
<li>
<p><strong>最先适配/最先适应：</strong></p>
<p>最先适应就是从上向下查找，找到第一块区域放进去，将剩下的区域分割后仍作为空闲区。有利于大作业装入，但也使得内存低地址和高地址两端的分区利用不均衡，回收分区麻烦。（都从低开始放，为的是后面能放下大的，但也势必造成不平衡</p>
</li>
<li>
<p><strong>邻近适应/下次适配：</strong></p>
<p>从上次查找结束的地方开始执行最先适应分配算法</p>
<p>缩短平均查找时间，且存储空间利用率更均衡，不会使得小空闲区集中在内存一侧（算是对最先适应的变种</p>
</li>
<li>
<p><strong>最优适应</strong></p>
<p>最优就是要找到最适合的，所以未分配分区按小到大排，查找到第一个满足的就用</p>
<p>明显更容易造成很多小的内存内零头</p>
<p>每次都是分配最接近需要使用大小的部分，会生成很多很小的内存内零头，通常会将空闲区按照长度递增顺序排列，等同于最先适应分配算法，查找时间最长</p>
<blockquote>
<p>最优适配算法最容易产生外零头</p>
</blockquote>
</li>
<li>
<p><strong>最坏适应</strong></p>
<p>与最优相反，每次都挑最大的进行分配，有利于中小型作业，剩下的空闲区不至于过小</p>
</li>
</ol>
<h2 id="移动技术（内存紧凑-程序浮动技术）">移动技术（内存紧凑/程序浮动技术）</h2>
<p>P95</p>
<h2 id="页式存储管理的地址转换思路">页式存储管理的地址转换思路</h2>
<p>逻辑地址到物理地址的转换 通过 页号到页框号的转换实现（利用页表）</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615192401412.png" class="" title="image-20230615192401412">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615192630913.png" class="" title="image-20230615192630913">
<h2 id="使用位示图记录分配情况">使用位示图记录分配情况</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615192807367.png" class="" title="image-20230615192807367">
<blockquote>
<p>每一位与页框相对应，记录使用情况</p>
</blockquote>
<h2 id="利用Cache存放部分页表">利用Cache存放部分页表</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615193454572.png" class="" title="image-20230615193454572">
<blockquote>
<p>只是部分存在cache，主存中依旧有</p>
<p>页表通常被存储在主存中。每个进程都有自己的页表，用于将其虚拟地址空间映射到物理内存中的实际地址。当程序访问虚拟地址时，通过查询页表可以确定对应的物理地址，从而进行实际的内存访问。</p>
<p>由于页表通常比较大，访问页表可能会导致频繁的主存访问。为了提高访问效率，现代计算机系统通常使用缓存（cache）来存储最近访问的页表项。这样，当需要查询页表时，先在缓存中搜索，如果缓存命中则可以快速获取所需的映射关系，减少对主存的访问。</p>
<p>这个缓存通常称为"Translation Lookaside Buffer"（TLB），它是一个快速的硬件缓存，用于存储页表的部分或全部映射信息。TLB位于CPU内部，作为虚拟地址到物理地址转换的一级缓存。当CPU需要进行地址转换时，首先在TLB中查找对应的页表项，如果找到了映射关系，则可以直接进行物理地址访问，而无需访问主存中的页表。如果在TLB中未找到对应的映射关系，就需要访问主存中的页表来获取相应的映射信息，并将其存储到TLB中以供后续使用。</p>
<p>总结起来，页表主要存储在主存中，但部分或全部的页表项可能被缓存到TLB中，以提高地址转换的速度。</p>
</blockquote>
<h2 id="抖动或颠簸">抖动或颠簸</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615200501368.png" class="" title="image-20230615200501368">
<blockquote>
<p>缺页中断率：类似于未命中率</p>
<style>.xumombucrkfr{zoom:50%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615200617786.png" class="xumombucrkfr" alt="image-20230615200617786">
</blockquote>
<h2 id="1-Belady-最佳置换-OPT">1. Belady/最佳置换/OPT</h2>
<p>按照不再访问、最长时间后访问到进行替换</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615201125633.png" class="" title="image-20230615201125633">
<h2 id="2-FIFO-先进先出">2. FIFO/先进先出</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615201245959.png" class="" title="image-20230615201245959">
<blockquote>
<p>存在Belady异常：</p>
<p>一般情况下，增加物理内存的页框数会减少缺页次数，因为更多的页面可以留在内存中，减少了对磁盘的访问。然而，FIFO算法存在Belady异常，即在某些情况下，增加物理内存的页框数反而导致更多的页面置换和更高的缺页次数。</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615201536957.png" class="" title="image-20230615201536957">
</blockquote>
<h2 id="3-最近最少使用-LRU">3. 最近最少使用/ LRU</h2>
<p>严格实现的代价比较大</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615201727995.png" class="" title="image-20230615201727995">
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615202040744.png" class="" title="image-20230615202040744">
<p>前面3个有5，命中</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615202102891.png" class="" title="image-20230615202102891">
<p>前面3个没2，F，最前的是4，替换4</p>
</blockquote>
<h2 id="4-最不常使用-LFU">*4. 最不常使用 LFU</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615202234944.png" class="" title="image-20230615202234944">
<blockquote>
<p>这个似乎不考</p>
</blockquote>
<h2 id="5-时钟CLOCK">5. 时钟CLOCK</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615205048843.png" class="" title="image-20230615205048843">
<blockquote>
<p>一步步移动，2 3 2 1 5</p>
<p>5的时候发生了什么？指针开始寻找插入位置，会把带星号的变成不带星号的（即把访问位为1的置为了0</p>
<p>一遍走下来全是0了，指针回到指向2的位置，发现2的访问位为0了，就进行替换，同时让5带上*，指针指向下一个3</p>
</blockquote>
<h2 id="为什么有了页表还要反置页表">*为什么有了页表还要反置页表?</h2>
<p>只记住了减少了空间使用</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615210911649.png" class="" title="image-20230615210911649">
<blockquote>
<style>.ncbbeemvyxlk{zoom: 67%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615211123452.png" class="ncbbeemvyxlk" alt="image-20230615211123452">
</blockquote>
<h2 id="请求-分-页式存储管理">请求(分)页式存储管理</h2>
<p>首次只把进程第一页信息装入主存</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615211338877.png" class="" title="image-20230615211338877">
<h2 id="页式和段式">页式和段式</h2>
<blockquote>
<p>书上写的很好的一段话</p>
</blockquote>
<ul>
<li>
<p>如果说促使存储管理方式<strong>从固定分区到动态分区，从分区方式向分页方式发展</strong>的主要原因是要是<strong>提高主存空间利用率。</strong></p>
</li>
<li>
<p>那么，<strong>引人段式</strong>存储管理的主要目的则是<strong>满足用户编程的需求。</strong></p>
</li>
</ul>
<p>页式存储管理是从0开始编址的单一连续逻辑地址空问，虽然可以把程序划分成页面，<strong>但页面与源程序之间并不存在逻辑关系</strong>，也就难以对源程序以模块为单位进行分配、共享和保护。段式程序设计可以更好地体现<strong>模块化程序设计</strong>的思想,应用程序由若干程序段(模块）和数据段组成，如主程序段(M)、子程序段(又）、数据段(D)和工作区段(W），每段都从0 开始编址，有各自的名字和长度，且实现不同的功能。</p>
<h2 id="程序的分段结构">程序的分段结构</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615212334147.png" class="" title="image-20230615212334147">
<blockquote>
<p>数组也可分成一“段”</p>
</blockquote>
<h2 id="从段式存储到段式虚拟存储">从段式存储到段式虚拟存储</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615213449495.png" class="" title="image-20230615213449495">
<h2 id="请求分段管理方式">请求分段管理方式</h2>
<p>在请求分段存储管理系统中，作业运行之前，只要求将当前需要的若干个分段装入内存，便可启动作业运行。在作业运行过程中，如果要访问的分段不在内存中，则通过调段功能将其调入，同时还可以通过置换功能将暂时不用的分段换出到外存，以便腾出内存空间。</p>
<blockquote>
<p>跟请求分页大致一个意思</p>
</blockquote>
<h2 id="关于辅存">关于辅存</h2>
<style>.rxpnxnhuugqq{zoom:50%;}</style><img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615214447358.png" class="rxpnxnhuugqq" alt="image-20230615214447358">
<h2 id="段页式存储的地址转换过程">段页式存储的地址转换过程</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615215247468.png" class="" title="image-20230615215247468">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615215421204.png" class="" title="image-20230615215421204">
<blockquote>
<p>gg补充部分</p>
<p>这一章有好多部分没细看，页的大小设计之类的</p>
</blockquote>
<h2 id="伙伴系统">伙伴系统</h2>
<blockquote>
<p>参考1：</p>
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/djl806943371/article/details/90246313">(2条消息) 操作系统学习笔记（九）：连续内存分配——伙伴系统_时间很奇妙！的博客-CSDN博客 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>长得有点丑</p>
<p>参考2：</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615221916536.png" class="" title="image-20230615221916536">
</blockquote>
<h3 id="例题">例题</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615220746714.png" class="" title="image-20230615220746714">
<h3 id="Slab分配器">Slab分配器</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://zhuanlan.zhihu.com/p/358891862">Linux 内核 | 内存管理——slab 分配器 - 知乎 (zhihu.com) <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>其中一个功能就是可以自己分配管理更小的内存，减少与Buddy系统打交道</p>
<h2 id="6-局部最佳页面替换算法MIN">*6. 局部最佳页面替换算法MIN</h2>
<blockquote>
<p>可能不考？</p>
<p>看个例子吧</p>
<p>驻留集其实没必要分成已驻留和In，徒增麻烦</p>
<p>好像也有点用，In的次数好像就是缺页的次数</p>
<p>因为是闭区间，所以刚到来的那个肯定是会驻留的（下一时刻能不能留当然还不好说</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615223200898.png" class="" title="image-20230615223200898">
<h2 id="7-工作集模型和工作集置换方法">7. 工作集模型和工作集置换方法</h2>
<p>基于程序性原理向后看</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615231752703.png" class="" title="image-20230615231752703">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230615231804685.png" class="" title="image-20230615231804685">
<blockquote>
<p>补充一道mooc选择题：</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616110831405.png" class="" title="image-20230616110831405">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616110809512.png" class="" title="image-20230616110809512">
<p>简单理解就是<strong>分段</strong>是按自己需求来的，要多少划分多少，所以不可能有内部碎片（内部就是指放段的地方和段本身是否契合，那显然是正好的，因为是自己划分的），但是<strong>会有外部碎片</strong>，因为段和段直接肯定没法正好放下相容</p>
<p><strong>分页</strong>全都分成一个个固定的页了，自然没有外部碎片，但是自己一个页内不一定能放满，自然就<strong>造成了内部碎片</strong></p>
<p><strong>段页式</strong>本质还是分页，只是对段进行页的拆解后再塞入，所以还是有<strong>内部碎片</strong></p>
<p><strong>固定分区</strong>显然还会有内部碎片</p>
</blockquote>
<h1>chap4 设备管理</h1>
<h2 id="I-O设备分类">*I/O设备分类</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616135838645.png" class="" title="image-20230616135838645">
<h2 id="设备管理的目标">设备管理的目标</h2>
<p>解决设备和CPU速度的不匹配，使主机和设备充分并行工作，提高设备使用效率</p>
<h2 id="什么是设备控制器？">什么是设备控制器？</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616140924473.png" class="" title="image-20230616140924473">
<h2 id="I-O控制">I/O控制</h2>
<p><strong>轮询</strong></p>
<p><strong>中断</strong></p>
<p>**DMA直接存储器访问：**相当于小处理器：模仿处理器来控制主存和设备控制器之间的数据交换</p>
<p>“周期窃取”</p>
<blockquote>
<p>完成后依然需要中断，因为要告知CPU处理的情况，只是数据交换/传输/传送不需要CPU的介入了</p>
</blockquote>
<p><strong>通道 I/O处理器 通道控制器</strong></p>
<p>多级连接</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616142347755.png" class="" title="image-20230616142347755">
<blockquote>
<p>通道可以一次面向多个不同的数据块</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616142306767.png" class="" title="image-20230616142306767">
<h2 id="I-O缓冲">*I/O缓冲</h2>
<p>解决设备和进程速度不匹配的问题</p>
<h3 id="单缓冲技术">单缓冲技术</h3>
<h3 id="双缓冲技术">双缓冲技术</h3>
<p>以输入为例，从设备读一部分数据到缓冲区1，用户进程从缓冲区1读取数据的同时，缓冲区2可以从设备读取下一部分数据读取，这样就有了一定的并行性，提高了效率</p>
<h3 id="循环缓冲技术">循环缓冲技术</h3>
<p>没细看</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616144518266.png" class="" title="image-20230616144518266">
<h2 id="设备独立性">*设备独立性</h2>
<p>用户不指定物理设备，而是逻辑设备</p>
<p>分离用户进程和物理设备，达成设备的独立性</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616144627412.png" class="" title="image-20230616144627412">
<h2 id="独占型设备需要分配-共享设备一般不必分配">独占型设备需要分配 共享设备一般不必分配</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616144932095.png" class="" title="image-20230616144932095">
<h2 id="磁盘存取时间：三部分">磁盘存取时间：三部分</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616145406139.png" class="" title="image-20230616145406139">
<h2 id="驱动调度：移臂调度-旋转调度">驱动调度：移臂调度 + 旋转调度</h2>
<p>**移臂调度：**使移动臂的移动时间最短，从而减少寻道总时间</p>
<p>**旋转调度：**在最少的旋转圈数之内解决该柱面上的全部I/O请求（处理同一个柱面上的请求</p>
<h2 id="移臂调度算法">移臂调度算法</h2>
<h3 id="1-FCFS">1. FCFS</h3>
<ul>
<li>
<p>移臂距离大，性能不好，移动臂是随机移动，寻道性能较差</p>
</li>
<li>
<p>按顺序处理请求，对所有进程公平</p>
</li>
</ul>
<h3 id="2-最短查找时间优先-SSTF">2. 最短查找时间优先 SSTF</h3>
<ul>
<li>先执行查找时间最短的请求，具有较好的寻道性能</li>
<li>存在“饥饿”现象：距离比较远的很难被满足</li>
<li>总是选择最小寻道时间并不能保证平均寻道时间最小，但是它的性能比 FCFS 更好</li>
</ul>
<h3 id="3-扫描算法">3. 扫描算法</h3>
<ol>
<li>
<p><strong>SCAN/双向扫描</strong></p>
<p>双向，扫到头回头</p>
</li>
<li>
<p><strong>分步扫描/N-step-SCAN</strong></p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620201058810.png" class="" title="image-20230620201058810">
</li>
<li>
<p><strong>LOOK/电梯</strong></p>
<p>双向，扫到某方向最后一个回头</p>
</li>
<li>
<p><strong>C-SCAN/循环扫描/单向扫描</strong></p>
</li>
</ol>
<h2 id="旋转调度">旋转调度</h2>
<p>没看</p>
<h2 id="虚拟设备">虚拟设备</h2>
<h3 id="虚拟设备技术">虚拟设备技术</h3>
<p>虚拟设备是用一类物理设备模拟另一类物理设备的技术，可以让独享型设备变为共享设备</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616172015815.png" class="" title="image-20230616172015815">
<blockquote>
<p>鼠标模拟游戏操纵杆</p>
<p>串行接口设备模拟并行接口设备</p>
</blockquote>
<h2 id="SPOOLing系统">SPOOLing系统</h2>
<p>SPOOLing = 外围设备联机并行操作 = 假脱机操作</p>
<blockquote>
<p>简单理解</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616173055924.png" class="" title="image-20230616173055924">
</blockquote>
<h2 id="一个经典的SPOOLing系统">一个经典的SPOOLing系统</h2>
<p>主要就是预输入，缓输出，加上一个“井”管理程序</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616173702995.png" class="" title="image-20230616173702995">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616173833922.png" class="" title="image-20230616173833922">
<blockquote>
<p>简单理解就是先存一点，然后统一抽个去处理，这样就不会某个设备其实实际上使用外围设备的时间就只有一开始一点点，但是占用了外围设备很久，导致其他进程无法使用外围设备</p>
</blockquote>
<blockquote>
<p>补充内容</p>
</blockquote>
<h2 id="磁盘Cache">磁盘Cache</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616175638916.png" class="" title="image-20230616175638916">
<h2 id="设备的分配">设备的分配</h2>
<p>设备类表和设备表</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616175821628.png" class="" title="image-20230616175821628">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616175903847.png" class="" title="image-20230616175903847">
<p>设备分配算法</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616175913552.png" class="" title="image-20230616175913552">
<h2 id="出错处理">出错处理</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616180050230.png" class="" title="image-20230616180050230">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616180110001.png" class="" title="image-20230616180110001">
<h2 id="I-O软件层次">I/O软件层次</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616185653196.png" class="" title="image-20230616185653196">
<p>其中设备驱动程序会做一件事情：</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616185723178.png" class="" title="image-20230616185723178">
<blockquote>
<p>这部分最好再看看，每个层次的I/O都做了什么事情</p>
</blockquote>
<h2 id="习题">习题</h2>
<h3 id="通道技术是一种硬件机制">通道技术是一种硬件机制</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616185138645.png" class="" title="image-20230616185138645">
<h1>chap5 文件管理</h1>
<h2 id="文件系统的组成">文件系统的组成</h2>
<p>总体结构</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616200234765.png" class="" title="image-20230616200234765">
<h2 id="存取存储方法">存取存储方法</h2>
<h3 id="顺序存取">顺序存取</h3>
<p>磁带机</p>
<p>光盘设备</p>
<h3 id="直接存取-随机存取">直接存取/随机存取</h3>
<p>磁盘</p>
<p>机械硬盘 + 固态硬盘</p>
<p>它的每个物理记录有确定的位置和唯一的地址，存取任何一个物理块所需的时间几乎不依赖于此信息的位置</p>
<blockquote>
<p>顺序存取和直接存取的理解：</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616221907283.png" class="" title="image-20230616221907283">
</blockquote>
<h2 id="文件的逻辑结构">文件的逻辑结构</h2>
<h3 id="流式文件">流式文件</h3>
<p>全是连续字节流，可能有特殊字符作为分界线</p>
<p>无结构</p>
<h3 id="记录式文件">记录式文件</h3>
<p>若干逻辑记录组成的记录流文件</p>
<p>如每个职工的工资信息是一个逻辑记录</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616220621896.png" class="" title="image-20230616220621896">
<h2 id="成组与分解">成组与分解</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616221105634.png" class="" title="image-20230616221105634">
<h2 id="文件的物理结构">文件的物理结构</h2>
<h3 id="顺序文件-连续文件">顺序文件/连续文件</h3>
<p>磁带文件、光盘文件</p>
<h3 id="连接文件-串联文件">连接文件/串联文件</h3>
<p>每个块会有个连接字，指出文件的下一个物理块位置，为0则表示本文件块结束，第一个块的位置由文件目录给出</p>
<h3 id="直接文件-散列文件">直接文件/散列文件</h3>
<p>hash</p>
<p>通过计算记录的关键字建立与其物理存储地址之间的对应关系</p>
<h3 id="索引文件">索引文件</h3>
<p>文件目录-&gt;索引表地址-&gt;查索引表得到键和存储地址</p>
<p>多级索引结构</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616224722564.png" class="" title="image-20230616224722564">
<h2 id="文件目录">文件目录</h2>
<h3 id="一级文件目录">一级文件目录</h3>
<h3 id="二级文件目录">二级文件目录</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616235630425.png" class="" title="image-20230616235630425">
<h3 id="树形目录结构">树形目录结构</h3>
<p>有点像FAT12</p>
<p>内容既可以是文件也可以是目录</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230616235913120.png" class="" title="image-20230616235913120">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617000121547.png" class="" title="image-20230617000121547">
<blockquote>
<p>应该是目前主流的，树形目录结构</p>
</blockquote>
<h2 id="存取控制矩阵">存取控制矩阵</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617000311267.png" class="" title="image-20230617000311267">
<h2 id="存取控制表">存取控制表</h2>
<p>因为矩阵往往比较稀疏</p>
<h2 id="文件的存取方法">文件的存取方法</h2>
<h3 id="顺序存取-2">顺序存取</h3>
<p>读指针，写指针进行推进</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617000526507.png" class="" title="image-20230617000526507">
<h3 id="直接存取">直接存取</h3>
<p>没啥可说的，找到地方直接就能读写</p>
<h3 id="索引存取">索引存取</h3>
<p>实际的系统中，大都采用多级索引，以加速记录查找过程</p>
<h2 id="再遇位示图">再遇位示图</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617000849041.png" class="" title="image-20230617000849041">
<h2 id="成组连接法">成组连接法</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617004856741.png" class="" title="image-20230617004856741">
<p>比如这张图上，盘块50里面的内容就是记录了下一组的情况，空闲数100，有哪些空闲块，然后第一个空闲块是150，又被用来记录下一组的情况，依此类推（其实是一个栈的结构，第一个空闲块最先进入，所以最后出去</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617005320992.png" class="" title="image-20230617005320992">
<blockquote>
<p>归还时的算法</p>
<p>如果已经100了怎么办</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230617010049445.png" class="" title="image-20230617010049445">
<p>比如a盘块目前记录了100个空闲块，</p>
<p>又归还来一个c，那么把a盘块的专用快b的信息复制到c，然后把b清空，c放进去（b的空间快置为1）</p>
<p>分配时如果不够了怎么办，其实就是把下一个的数据复制进来</p>
<p>a盘块目前只有一个空闲块b，b是专用块，里面存了信息的，现在要分配，那么复制b的信息到栈中继续分配</p>
</blockquote>
<blockquote>
<p>看这个例子把，PPT不知道写的什么玩意</p>
<p><a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/smartab/article/details/81285353">(2条消息) 实例讲解成组链接法_成组链接法例题_smartab的博客-CSDN博客 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<blockquote>
<p>补充部分chap5</p>
</blockquote>
<p>最重要的其实就是这一张表</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620175412980.png" class="" title="image-20230620175412980">
<blockquote>
<p>用户打开文件表在pcb里，存放的是指向系统打开文件表项的指针，系统打开文件表就有inode等重要信息</p>
<p>files_struct 用户打开文件表</p>
<p>file_struct 系统打开文件表</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620175638662.png" class="" title="image-20230620175638662">
</blockquote>
<h2 id="简答题汇总">简答题汇总</h2>
<h3 id="1-试写出进程映像包括哪些组成部分-不必详述每个组成部分的具体内容-。">1. 试写出进程映像包括哪些组成部分(不必详述每个组成部分的具体内容)。</h3>
<p>进程控制块、进程程序块（进程数据块）和进程核心栈。</p>
<blockquote>
<p>第六版的书上P57只分了三个</p>
<p>进程数据块包含了下图的绿色部分</p>
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620194342893.png" class="" title="image-20230620194342893">
<h3 id="2-I-O-软件的一般分为四层结构，请按照自顶向下的顺序写出四层结构的名称。">2. I/O 软件的一般分为四层结构，请按照自顶向下的顺序写出四层结构的名称。</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620194352594.png" class="" title="image-20230620194352594">
<h3 id="3-请画出三状态、五状态和七状态进程模型（包括挂起）及其状态转换图">3. 请画出三状态、五状态和七状态进程模型（包括挂起）及其状态转换图</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620200130428.webp" class="" title="image-20230620200130428">
<h3 id="4-进程调度：6种-3抢-3不抢">4. 进程调度：6种 3抢 3不抢</h3>
<p>感觉就是FeedBack只要来了就会给机会运行一段时间</p>
<p>注意RR算法是先来先服务的，所以新来的只要还有在运行，就要排队，<strong>而且新来的会比正在运行的那个先排到队尾</strong></p>
<h3 id="5-银行家算法">5. 银行家算法</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620213058841.png" class="" title="image-20230620213058841">
<h3 id="6-页面替换算法">6. 页面替换算法</h3>
<p>Belady/最佳置换/OPT</p>
<p>FIFO/先进先出</p>
<p>最近最少使用/ LRU</p>
<p>时钟CLOCK</p>
<ul>
<li>设置访问位和一个循环移动的指针</li>
<li>如果命中，指针是不会动的，只是把访问位变为1（本来是1就还是1</li>
</ul>
<p>工作集模型和工作集置换方法</p>
<ul>
<li>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230620221401511.webp" class="" title="image-20230620221401511">
</li>
</ul>
<h3 id="7-操作系统三个最基本的抽象以及为什么要引入">7. 操作系统三个最基本的抽象以及为什么要引入</h3>
<ul>
<li>进程抽象–是对已进入主存正在运行的程序在处理器上操作的状态集的抽象</li>
<li>虚存抽象–是对物理主存的抽象,进程可获得-个硕大的连续地址空间来存放可执行程序和数据，可使用虚拟地址来引用物理主存单元。</li>
<li>文件抽象–是对设备(磁盘)的抽象。</li>
</ul>
<p><strong>防止硬件资源被失控的应用程序滥用</strong></p>
<p>以及<strong>屏蔽复杂的硬件资源操作细节</strong>，为应用程序提供使用硬件资源的简单且一致的方法。</p>
<h3 id="8-霍尔管程">8. 霍尔管程</h3>
<p>读者写者：应该是写者优先，实现的是</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230621004746103.png" class="" title="image-20230621004746103">
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230621004842245.png" class="" title="image-20230621004842245">
</blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230621013953943.png" class="" title="image-20230621013953943">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230621014011125.png" class="" title="image-20230621014011125">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Spring-Courses-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/notes-os/image-20230621014029945.png" class="" title="image-20230621014029945">
</div>

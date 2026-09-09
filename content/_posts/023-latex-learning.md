---
title: "latex-learning"
permalink: "/posts/工具学习/latex-learning.html"
date: "2023-04-16T09:38:54.000Z"
updated: "2024-09-30T12:52:39.130Z"
cover: "/generated-covers/023-latex-learning.webp"
description: "整理 LaTeX 插图时常用的 figure 环境、尺寸与浮动位置参数，记录图片排版失控时的处理经验，便于随时查用。"
categories:
  - "工具学习"
tags:
  - "latex"
---

<!-- Migrated from posts/工具学习/latex-learning.html. Keep the permalink stable. -->
<div class="legacy-content">
<p>记录下一些latex的用法</p>
<p>收藏夹太满了</p>
<p>并且懒得每次都因为同样的问题去查</p>
<h3 id="1-图片插入相关-单张">1.图片插入相关-单张</h3>
<div class="highlight-container" data-rel="Latex"><figure class="iseeu highlight latex"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="keyword">\begin</span>{figure}[h]</span><br><span class="line">  <span class="keyword">\centering</span></span><br><span class="line">  <span class="keyword">\includegraphics</span>[width=0.8<span class="keyword">\textwidth</span>]{1.jpg}</span><br><span class="line">  <span class="keyword">\caption</span>{question1<span class="keyword">\\</span>文法一是LL(1)文法}</span><br><span class="line"><span class="keyword">\end</span>{figure}</span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>就写个[h]得了，[htp]反而不太对</p>
<p><strong>最好写[H]吧，保证在当前位置，编译原理那个环境怪怪的，大H用不了，引了宏包还是不行…</strong></p>
</blockquote>
<p>图片因为排版而位置不受控制在LaTex中，\begin{figure}[~]是图片环境，常用选择项[htbp]是浮动格式：<br>
[h] ~ here，当前位置。将图形放置在正文文本中给出该图形环境的地方。如果本页所剩页面不够，这一参数将不起作用。<br>
[t] ~ top，顶部。将图形放置在页面的顶部。<br>
[b] ~ bottom，底部。将图形放置在页面的底部。<br>
[p] ~ page of its own，浮动页。将图形放置在一个允许有浮动对象的页面上。一般使用[htb]这样的组合，只用[h]是没有用的。这样组合的意思就是LaTex会尽量满足排在前面的浮动格式，就是h-t-b这个顺序，让排版的效果尽量好。<br>
[!h]只是试图放在当前位置。如果页面剩下的部分放不下，还是会跑到下一页的。一般而言，用[!h]选项通常会出现不能正确放置的问题，所以常用[ht]、[htbp]等。这里加感叹号的意思是 忽略 “美学” 标准。</p>
<blockquote>
<p>参数详解链接：<a class="link" target="_blank" rel="noopener" href="https://blog.csdn.net/king0406/article/details/51252298">https://blog.csdn.net/king0406/article/details/51252298 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
</div>

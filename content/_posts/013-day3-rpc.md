---
title: "Day3-RPC"
permalink: "/posts/2023-summer-courses-cloudwego/day3-rpc.html"
date: "2023-07-12T02:11:40.000Z"
updated: "2024-09-30T12:52:01.933Z"
description: "介绍 RPC 的基本概念、Thrift 协议与 IDL 语法，并用 CloudWeGo Kitex 生成服务端和调用端，记录 Hertz 转发 Kitex 的课堂练习。"
cover: "/generated-covers/legacy-I8YSvEDi5eJyH6U-3ded4a89.webp"
categories:
  - "2023-Summer-Courses-CloudWeGo"
tags:
---

<!-- Migrated from posts/2023-Summer-Courses-CloudWeGo/day3-rpc.html. Keep the permalink stable. -->
<div class="legacy-content">
<h2 id="Day2-1">Day2-1</h2>
<h3 id="RPC的定义">RPC的定义</h3>
<p>From wiki:  远程过程调用是一个计算机通信协议。该协议允许运行于一台计算机的程序调用另一个地址空间（通常为一个开放网络的一台计算机）的子程序。</p>
<p>可以像调用本地方法一样调用远程方法。</p>
<p>解决跨进程间/远程通信问题。</p>
<h3 id="通信协议">通信协议</h3>
<h4 id="Thrift-一个FaceBook开发的框架">Thrift-一个FaceBook开发的框架</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712111928707.png" class="" title="image-20230712111928707">
<h4 id="IDL">IDL</h4>
<p>跨语言，规范性，代码生成</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712113858288.png" class="" title="image-20230712113858288">
<h4 id="Thrift-IDL">Thrift IDL</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712114126789.png" class="" title="image-20230712114126789">
<p>基本语法</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712114436233.png" class="" title="image-20230712114436233">
<p>Field Requiredness</p>
<p>optional required optional</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712114634069.png" class="" title="image-20230712114634069">
<p>default未赋值也会编码</p>
<h3 id="快速入门-ppt上的使用入门案例复现">快速入门-ppt上的使用入门案例复现</h3>
<p>第三步，生成服务端代码</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">kitex -module github.com/SYuan03/Day3-kitex1 -service nju.dsy.kitex.demo1 ./idl/kitex_greet.thrift</span><br><span class="line">go mod tidy</span><br></pre></td></tr></tbody></table></figure></div>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712155853571.png" class="" title="image-20230712155853571">
<p>第四步，生成调用端代码</p>
<p>成功</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712165547865.png" class="" title="image-20230712165547865">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day3-rpc/image-20230712165558739.png" class="" title="image-20230712165558739">
<h3 id="进阶特性-泛化调用">进阶特性-泛化调用</h3>
<h3 id="Day3-随堂练习">Day3-随堂练习</h3>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line">hz new -mod github.com/SYuan03/Day3/HertzServer -idl idl/student.thrift</span><br><span class="line">go mod tidy</span><br><span class="line"></span><br><span class="line">kitex -service kitex.demo -module github.go mod tidycom/SYuan03/Day3/KitexServer idl/student.thrift</span><br><span class="line">go mod tidy</span><br></pre></td></tr></tbody></table></figure></div>
<h4 id="Hertz-Server">Hertz-Server</h4>
<p>修改Kitex Server的main.go，配置监听端口，修改 main.go。（Kitex 与 Hertz 默认端口均是 8888，需要修改端口）</p>
<p>修改student.service，用client作一下转发</p>
<h4 id="Kitex-Server">Kitex-Server</h4>
<p>修改main.go</p>
<p>修改handler.go</p>
</div>

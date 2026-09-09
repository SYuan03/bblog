---
title: "Day2-HTTP"
permalink: "/posts/2023-Summer-Courses-CloudWeGo/day2-http.html"
date: "2023-07-11T03:42:29.000Z"
updated: "2024-09-30T12:52:01.761Z"
description: "先梳理 HTTP 版本、状态码与请求响应报文，再以 Thrift IDL 和 CloudWeGo Hertz 实战演示服务端、接口更新及客户端代码生成。"
cover: "https://s2.loli.net/2023/07/11/pVQlX1SdDe6nAhU.png"
categories:
  - "2023-Summer-Courses-CloudWeGo"
tags:
  - "计算机网络"
---

<!-- Migrated from posts/2023-Summer-Courses-CloudWeGo/day2-http.html. Keep the permalink stable. -->
<div class="legacy-content">
<h2 id="Day2-1-HTTP基础">Day2-1 HTTP基础</h2>
<h3 id="为什么需要协议">为什么需要协议</h3>
<ol>
<li>明确的边界</li>
<li>信息解析</li>
<li>（预留拓展）</li>
</ol>
<h3 id="HTTP最早版本">HTTP最早版本</h3>
<p>0.9</p>
<p>HTTP协议的最初版本是HTTP/0.9，它于1991年问世。这个版本非常简单，只支持无格式的文本数据传输，没有请求头、响应头等结构化信息。</p>
<p>HTTP/0.9的主要特点如下：</p>
<ol>
<li>请求方式：只支持GET请求方法，即通过GET方法请求服务器上的资源。</li>
<li>URL：只能包含请求的路径，没有主机名、端口号、查询参数等。</li>
<li>响应格式：服务器返回的响应只包含请求资源的纯文本内容，没有响应头、状态码等。</li>
<li>连接：每次请求都会关闭连接，无法保持持久连接。</li>
<li>内容类型：响应的内容类型默认为HTML。</li>
</ol>
<h3 id="HTTP协议里有什么">HTTP协议里有什么</h3>
<p>0.9到1.1的版本变化</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711105619899.png" class="" title="image-20230711105619899">
<h3 id="状态码">状态码</h3>
<ul>
<li>1xx（信息性状态码）：表示请求已被接收，正在处理中。
<ul>
<li>100 Continue：服务器已收到请求的初始部分，客户端应继续发送剩余部分。</li>
<li>101 Switching Protocols：服务器已经理解请求，将切换到不同的协议进行通信。</li>
</ul>
</li>
<li>2xx（成功状态码）：表示请求已成功处理。
<ul>
<li>200 OK：请求成功，返回对应的资源。</li>
<li>201 Created：请求已成功处理，并在服务器上创建了新资源。</li>
<li>204 No Content：请求成功，但响应不包含实体主体内容。</li>
</ul>
</li>
<li>3xx（重定向状态码）：表示需要进行进一步操作以完成请求。
<ul>
<li>301 Moved Permanently：资源的URI已永久移动到新位置。</li>
<li>302 Found：资源的URI已临时移动到新位置。</li>
<li>304 Not Modified：客户端的缓存副本仍然有效，可以使用缓存的版本。</li>
</ul>
</li>
<li>4xx（客户端错误状态码）：表示请求包含语法错误或无法完成请求。
<ul>
<li>400 Bad Request：请求无效，服务器无法理解请求。</li>
<li>401 Unauthorized：请求要求身份验证。</li>
<li>404 Not Found：请求的资源不存在。</li>
</ul>
</li>
<li>5xx（服务器错误状态码）：表示服务器在处理请求时发生错误。
<ul>
<li>500 Internal Server Error：服务器遇到意外错误，无法完成请求。</li>
<li>502 Bad Gateway：服务器作为网关或代理，从上游服务器收到无效响应。</li>
</ul>
</li>
</ul>
<blockquote>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711111350794.png" class="" title="image-20230711111350794">
</blockquote>
<h3 id="HTTP报文结构">HTTP报文结构</h3>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711112326548.png" class="" title="image-20230711112326548">
<h4 id="1、请求行和响应行（状态行）">1、请求行和响应行（状态行）</h4>
<p>请求行：请求方法，url，HTTP版本</p>
<p>相应行：HTTP版本，状态码，状态描述</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711112540419.png" class="" title="image-20230711112540419">
<h4 id="2、请求头和响应头">2、请求头和响应头</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711112702967.png" class="" title="image-20230711112702967">
<blockquote>
<p>不止有图上这些</p>
</blockquote>
<h5 id="1-请求头">1.请求头</h5>
<p><strong>Accept:MIME</strong> 可选项，不一定有</p>
<p>指明了期望返回的类型</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711113256917.png" class="" title="image-20230711113256917">
<p><strong>Host</strong></p>
<p>请求头中的 “Host” 字段用于指定目标服务器的主机名或 IP 地址。它是 HTTP/1.1 协议中的一个必需字段，在发送请求时应该包含在请求头部中。</p>
<h5 id="2-响应头">2.响应头</h5>
<p>Content-Length</p>
<p>Content-Type</p>
<h4 id="3、空行">3、空行</h4>
<h4 id="4、请求体和响应体">4、请求体和响应体</h4>
<h3 id="Day2-2-Hertz-应用篇">Day2-2 Hertz 应用篇</h3>
<h4 id="hz和thriftgo">hz和thriftgo</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711151253162.png" class="" title="image-20230711151253162">
<h4 id="IDL-Interface-Definition-Language">IDL Interface Definition Language</h4>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711151516937.png" class="" title="image-20230711151516937">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711151635573.png" class="" title="image-20230711151635573">
<h3 id="Hz实战1">Hz实战1</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cloudwego.io/zh/docs/hertz/tutorials/toolkit/usage/usage-thrift/">hz 使用 (thrift) | CloudWeGo <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>创建hello.thrift文件</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">mkdir</span> idl</span><br><span class="line">vim hello.thrift</span><br></pre></td></tr></tbody></table></figure></div>
<p><code>hello.thrift</code>文件内容</p>
<div class="highlight-container" data-rel="Java"><figure class="iseeu highlight java"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// idl/hello.thrift</span></span><br><span class="line">namespace go nju.dsy.example </span><br><span class="line"><span class="comment">// 指明目标代码语言是go</span></span><br><span class="line"><span class="comment">// 命名空间是nju.dsy.example</span></span><br><span class="line"></span><br><span class="line">struct HelloReq {</span><br><span class="line">    <span class="number">1</span>: string <span class="title function_">Name</span> <span class="params">(api.query=<span class="string">"name"</span>)</span>; </span><br><span class="line">    <span class="comment">// 添加 api 注解为方便进行参数绑定</span></span><br><span class="line">}</span><br><span class="line"></span><br><span class="line">struct HelloResp {</span><br><span class="line">    <span class="number">1</span>: string RespBody;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line"></span><br><span class="line">service HelloService {</span><br><span class="line">    HelloResp <span class="title function_">HelloMethod</span><span class="params">(<span class="number">1</span>: HelloReq request)</span> (api.get=<span class="string">"/hello"</span>);</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">hz new -module github.com/SYuan03/thrift/example -idl idl/hello.thrift</span><br><span class="line">go mod tidy	<span class="comment"># 整理 &amp; 拉取依赖</span></span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>namespace里面就是对应的多级目录结构</p>
</blockquote>
<blockquote>
<p>执行go mod tidy后，爆红消失</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711231931491.png" class="" title="image-20230711231931491">
</blockquote>
<p>修改 handler，添加自己的逻辑</p>
<div class="highlight-container" data-rel="Go"><figure class="iseeu highlight go"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// handler path: biz/handler/hello/example/hello_service.go</span></span><br><span class="line"><span class="comment">// 其中 "hello/example" 是 thrift idl 的 namespace</span></span><br><span class="line"><span class="comment">// "hello_service.go" 是 thrift idl 中 service 的名字，所有 HelloService 定义的方法都会生成在这个文件中</span></span><br><span class="line"></span><br><span class="line"><span class="comment">// HelloMethod .</span></span><br><span class="line"><span class="comment">// @router /hello [GET]</span></span><br><span class="line"><span class="function"><span class="keyword">func</span> <span class="title">HelloMethod</span><span class="params">(ctx context.Context, c *app.RequestContext)</span></span> {</span><br><span class="line">        <span class="keyword">var</span> err <span class="type">error</span></span><br><span class="line">        <span class="keyword">var</span> req example.HelloReq</span><br><span class="line">        err = c.BindAndValidate(&amp;req)</span><br><span class="line">        <span class="keyword">if</span> err != <span class="literal">nil</span> {</span><br><span class="line">                c.String(<span class="number">400</span>, err.Error())</span><br><span class="line">                <span class="keyword">return</span></span><br><span class="line">        }</span><br><span class="line"></span><br><span class="line">        resp := <span class="built_in">new</span>(example.HelloResp)</span><br><span class="line"></span><br><span class="line">        <span class="comment">// 你可以修改整个函数的逻辑，而不仅仅局限于当前模板</span></span><br><span class="line">        resp.RespBody = <span class="string">"hello,"</span> + req.Name <span class="comment">// 添加的逻辑</span></span><br><span class="line"></span><br><span class="line">        c.JSON(<span class="number">200</span>, resp)</span><br><span class="line">}</span><br></pre></td></tr></tbody></table></figure></div>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line">go build</span><br><span class="line"><span class="built_in">ls</span></span><br><span class="line">./example</span><br><span class="line">curl http://127.0.0.1:8888/hello?name=dsy -w <span class="string">"\n"</span></span><br></pre></td></tr></tbody></table></figure></div>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711233040123.png" class="" title="image-20230711233040123">
<p>成功</p>
<h3 id="Hz实战2">Hz实战2</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cloudwego.io/zh/docs/hertz/tutorials/toolkit/usage/usage-thrift/">hz 使用 (thrift) | CloudWeGo <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>更新一个已有的项目</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711233626785.png" class="" title="image-20230711233626785">
<p>根据需求重写hello.thrift的内容</p>
<div class="highlight-container" data-rel="Java"><figure class="iseeu highlight java"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">// idl/hello.thrift</span></span><br><span class="line">namespace go nju.dsy.example </span><br><span class="line"><span class="comment">// 指明目标代码语言是go</span></span><br><span class="line"><span class="comment">// 命名空间是nju.dsy.example</span></span><br><span class="line"></span><br><span class="line">struct GetStudentInfoReq {</span><br><span class="line">    <span class="number">1</span>: i32 <span class="title function_">ID</span> <span class="params">(api.query=<span class="string">"id"</span>)</span>; <span class="comment">// 添加 api 注解为方便进行参数绑定</span></span><br><span class="line">}</span><br><span class="line"></span><br><span class="line">struct GetStudentInfoResp {</span><br><span class="line">    <span class="number">1</span>: i32 ID;</span><br><span class="line">    <span class="number">2</span>: string Name;</span><br><span class="line">    <span class="number">3</span>: string Favorite;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line">struct PostStudentInfoReq {</span><br><span class="line">    <span class="number">1</span>: i32 ID;</span><br><span class="line">    <span class="number">2</span>: string Name;</span><br><span class="line">    <span class="number">3</span>: string Favorite;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line">struct PostStudentInfoResp {</span><br><span class="line">    <span class="number">1</span>: string RespBody;</span><br><span class="line">}</span><br><span class="line"></span><br><span class="line">service StudentService {</span><br><span class="line">    GetStudentInfoResp <span class="title function_">GetStudentInfoMethod</span><span class="params">(<span class="number">1</span>: GetStudentInfoReq request)</span> (api.get=<span class="string">"/query"</span>);</span><br><span class="line"></span><br><span class="line">    PostStudentInfoResp <span class="title function_">PostStudentInfoMethod</span><span class="params">(<span class="number">1</span>: PostStudentInfoReq request)</span> (api.post=<span class="string">"/add-student-info"</span>);</span><br><span class="line">}</span><br><span class="line"></span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<p>thrift的idl的结构体需要标序号，参数也要标序号，以指明顺序</p>
<p>int用不了，要用i32</p>
</blockquote>
<p>执行</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">hz update -idl idl/hello.thrift</span><br></pre></td></tr></tbody></table></figure></div>
<p>关于make</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230711235734655.png" class="" title="image-20230711235734655">
<p>成功</p>
<p>post</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">curl http://127.0.0.1:8888/add-student-info -X POST -H <span class="string">'Content-Type:application/json'</span> -d <span class="string">'{"ID":666,"Name": "dsy", "Favorite": "peach"}'</span> -w <span class="string">"\n"</span></span><br></pre></td></tr></tbody></table></figure></div>
<p>get</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">curl http://127.0.0.1:8888/query?<span class="built_in">id</span>=10 -w <span class="string">"\n"</span></span><br></pre></td></tr></tbody></table></figure></div>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230712001708832.png" class="" title="image-20230712001708832">
<h3 id="Hz实战3">Hz实战3</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://www.cloudwego.io/zh/docs/hertz/tutorials/toolkit/more-feature/client/">hz client 代码生成 | CloudWeGo <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>参考</p>
<p><a class="link" target="_blank" rel="noopener" href="https://github.com/cloudwego/hertz-examples/tree/main/hz/hz_client">hertz-examples/hz/hz_client at main · cloudwego/hertz-examples · GitHub <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<p>啥玩意？</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230712002635960.png" class="" title="image-20230712002635960">
<blockquote>
<ul>
<li>
<p>IDL（Interface Definition Language）：接口定义语言，用于定义分布式系统中服务接口的规范和格式。IDL 可以用于生成客户端和服务器端的代码，以便它们可以相互通信和交互数据。Thrift 和 gRPC 等框架都支持使用 IDL 进行服务定义和代码生成。</p>
</li>
<li>
<p>RPC（Remote Procedure Call）：远程过程调用，是一种跨网络的分布式系统通信方式，允许客户端应用程序调用远程服务器上的过程或方法，并接收返回结果。RPC 可以使用 HTTP、TCP、UDP 等协议进行通信，常用的框架包括 Thrift、gRPC、Dubbo 等。</p>
</li>
<li>
<p>HTTP 请求：超文本传输协议（HTTP）定义了客户端和服务器之间的通信协议。HTTP 请求是客户端向服务器发送的请求，包括请求方法、URL、请求头、请求体等信息。服务器根据这些信息来处理请求，并返回响应结果。</p>
</li>
<li>
<p>Hertz client：Hertz 是一个开源的 RPC 框架，支持使用 IDL 进行服务定义和代码生成。Hertz client 是客户端程序，用于向 Hertz server 发送 RPC 请求，并接收响应结果。</p>
</li>
<li>
<p>Hertz server：Hertz server 是服务端程序，用于接收 Hertz client 发送的 RPC 请求，并处理请求，返回响应结果。</p>
</li>
</ul>
<p>它提到了一种工具或框架，可以根据 IDL 文件生成客户端代码，并自动屏蔽创建和初始化 Hertz client 的繁琐操作。生成的客户端代码可以直接使用 HTTP 请求调用 Hertz server 提供的服务，并接收响应结果。使用这种工具或框架，可以大大简化分布式系统中的开发和调试过程，提高开发效率。</p>
</blockquote>
<p>先把之前的idl搬过来</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="built_in">mkdir</span> server</span><br><span class="line"><span class="built_in">cd</span> server</span><br><span class="line">hz new -mod=github.com/SYuan03/thrift/example2 --idl=../idl/hello.thrift --handler_by_method -t=template=slim</span><br></pre></td></tr></tbody></table></figure></div>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment"># 同理，略</span></span><br><span class="line">hz client -mod=github.com/SYuan03/thrift/client --idl=../idl/hello.thrift --model_dir=hertz_gen -t</span><br><span class="line">=template=slim --client_dir=hz_client</span><br></pre></td></tr></tbody></table></figure></div>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230712004622251.png" class="" title="image-20230712004622251">
<p>成功！</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-Courses-CloudWeGo/day2-http/image-20230712012317679.png" class="" title="image-20230712012317679">
</div>

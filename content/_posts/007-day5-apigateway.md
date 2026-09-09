---
title: "Day5-APIGateway"
permalink: "/posts/2023-Summer-CloudWeGo/day5-apigateway.html"
date: "2023-07-14T02:17:05.000Z"
updated: "2024-09-30T12:52:01.789Z"
description: "从正向代理和反向代理的区别切入，说明 Nginx 流量网关与 API 业务网关的分工，并简要梳理网关分类、形态及 Sidecar 场景。"
cover: "https://s2.loli.net/2023/04/24/3DWJMp2ZnT4iL1j.jpg"
categories:
  - "2023-Summer-CloudWeGo"
tags:
---

<!-- Migrated from posts/2023-Summer-CloudWeGo/day5-apigateway.html. Keep the permalink stable. -->
<div class="legacy-content">
<h2 id="正向-反向代理">正向/反向代理</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-CloudWeGo/day5-apigateway/image-20230714102358455.png" class="" title="image-20230714102358455">
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-CloudWeGo/day5-apigateway/image-20230714102453866.png" class="" title="image-20230714102453866">
<p>正向代理是客户端主动知道要找一个代理：VPN</p>
<p>反向代理是客户端并不知道，是服务端的一些代理：基本的服务网关如Nginx</p>
<h2 id="反向代理服务器就是服务网关，那-API-网关是什么？">反向代理服务器就是服务网关，那 API 网关是什么？</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-CloudWeGo/day5-apigateway/image-20230714103405605.png" class="" title="image-20230714103405605">
<p>比如大门只控制学校的进出控制（流量网关，如nginx，其实还是不太一样，因为基本网关是有URL路由转发到不同服务器的），但是某个特定的事务处理，显然不能都交给流量网关，需要对于业务有特定的了解，相当于有了业务属性（业务网关，即API网关）</p>
<h2 id="反向代理-Nginx-基本功能">反向代理-Nginx-基本功能</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-CloudWeGo/day5-apigateway/image-20230714104026842.png" class="" title="image-20230714104026842">
<h2 id="网关分类">网关分类</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-CloudWeGo/day5-apigateway/image-20230714104230191.png" class="" title="image-20230714104230191">
<h2 id="API网关形态">API网关形态</h2>
<img lazyload="" src="/images/loading.svg" data-src="/posts/2023-Summer-CloudWeGo/day5-apigateway/image-20230714104757280.png" class="" title="image-20230714104757280">
<p>可以把与服务端更耦合的流量分给Sidecar来处理</p>
</div>

---
title: "不知道花了多久但我就要说很快速的docker部署前后端项目"
permalink: "/posts/实践记录/不知道花了多久但我就要说很快速的docker部署前后端项目.html"
date: "2024-04-16T15:40:58.000Z"
updated: "2024-09-30T12:51:51.006Z"
cover: "/generated-covers/035-不知道花了多久但我就要说很快速的docker部署前后端项目.webp"
description: "从前端 Dockerfile、Nginx 反向代理到域名解析，记录一次前后端项目容器化部署过程。"
categories:
  - "实践记录"
tags:
  - "docker"
---

<!-- Migrated from posts/实践记录/不知道花了多久但我就要说很快速的docker部署前后端项目.html. Keep the permalink stable. -->
<div class="legacy-content">
<blockquote>
<p>首先感谢LLM4SE小组的所有成员的付出！</p>
</blockquote>
<h2 id="前端">前端</h2>
<h3 id="扔到github仓库">扔到github仓库</h3>
<p>主要是原先不在github上</p>
<p><img lazyload="" src="/images/loading.svg" data-src="%E4%B8%8D%E7%9F%A5%E9%81%93%E8%8A%B1%E4%BA%86%E5%A4%9A%E4%B9%85%E4%BD%86%E6%88%91%E5%B0%B1%E8%A6%81%E8%AF%B4%E5%BE%88%E5%BF%AB%E9%80%9F%E7%9A%84docker%E9%83%A8%E7%BD%B2%E5%89%8D%E5%90%8E%E7%AB%AF%E9%A1%B9%E7%9B%AE/image-20240416234307784.png" alt="image-20240416234307784"></p>
<h3 id="前端该点东西you-know-what">前端该点东西you know what</h3>
<p>诸如api_url之类的</p>
<blockquote>
<p>Tips</p>
<p>其实可以用nginx反代把后端api隐藏</p>
<p>但这里懒得搞了，可以参考我软工3的CI/CD</p>
<p><a class="link" target="_blank" rel="noopener" href="https://git.nju.edu.cn/2024seiii-19-ineedoffer/frontend-nju2">frontend-nju2 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
</blockquote>
<h3 id="邀请gpt4撰写一份前端的Dockerfile">邀请gpt4撰写一份前端的Dockerfile</h3>
<p>本地跑了下18能跑</p>
<div class="highlight-container" data-rel="Dockerfile"><figure class="iseeu highlight dockerfile"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment"># 使用官方的 Node.js 18 镜像作为基础镜像</span></span><br><span class="line"><span class="keyword">FROM</span> node:<span class="number">18</span> AS build</span><br><span class="line"></span><br><span class="line"><span class="comment"># 设置工作目录</span></span><br><span class="line"><span class="keyword">WORKDIR</span><span class="language-bash"> /usr/src/app</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 复制 package.json 和 package-lock.json 到工作目录</span></span><br><span class="line"><span class="keyword">COPY</span><span class="language-bash"> package*.json ./</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 安装项目依赖</span></span><br><span class="line"><span class="keyword">RUN</span><span class="language-bash"> npm install</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 复制项目文件到工作目录</span></span><br><span class="line"><span class="keyword">COPY</span><span class="language-bash"> . .</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 构建项目</span></span><br><span class="line"><span class="keyword">RUN</span><span class="language-bash"> npm run build</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 使用 nginx 镜像作为基础镜像</span></span><br><span class="line"><span class="keyword">FROM</span> nginx:stable-alpine</span><br><span class="line"></span><br><span class="line"><span class="comment"># 安装 vim</span></span><br><span class="line"><span class="keyword">RUN</span><span class="language-bash"> apk add vim</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 将构建产物复制到 nginx 的网页目录</span></span><br><span class="line"><span class="keyword">COPY</span><span class="language-bash"> --from=build /usr/src/app/dist /usr/share/nginx/html</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 对外暴露 80 端口</span></span><br><span class="line"><span class="keyword">EXPOSE</span> <span class="number">80</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 启动 nginx</span></span><br><span class="line"><span class="keyword">CMD</span><span class="language-bash"> [<span class="string">"nginx"</span>, <span class="string">"-g"</span>, <span class="string">"daemon off;"</span>]</span></span><br></pre></td></tr></tbody></table></figure></div>
<h3 id="（可选）自定义nginx-conf">（可选）自定义nginx.conf</h3>
<p>可以把自己的nginx.conf复制到容器内运行</p>
<h3 id="打包运行">打包运行</h3>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line">docker build -t llm4se_frontend:1.0 .</span><br><span class="line">docker run -p 7001:80 -d llm4se_frontend:1.0</span><br></pre></td></tr></tbody></table></figure></div>
<p><img lazyload="" src="/images/loading.svg" data-src="%E4%B8%8D%E7%9F%A5%E9%81%93%E8%8A%B1%E4%BA%86%E5%A4%9A%E4%B9%85%E4%BD%86%E6%88%91%E5%B0%B1%E8%A6%81%E8%AF%B4%E5%BE%88%E5%BF%AB%E9%80%9F%E7%9A%84docker%E9%83%A8%E7%BD%B2%E5%89%8D%E5%90%8E%E7%AB%AF%E9%A1%B9%E7%9B%AE/image-20240417003432802.png" alt="image-20240417003432802"></p>
<p>打包打了117.3秒</p>
<h3 id="（必选）域名配置">（<s>必选</s>）域名配置</h3>
<p>改下服务器上的nginx配置就行（注意不是容器内部的那个）</p>
<p>ip+端口先测下成功没**（似乎比我本地npm run dev之后第一次访问快多了**</p>
<p>配域名A记录</p>
</div>

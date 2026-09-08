---
title: "GitlabRunner流水线之DockerHub重配置"
permalink: "/posts/杂记/gitlabrunner流水线之dockerhub重配置.html"
date: "2024-06-08T16:09:32.000Z"
updated: "2024-10-05T07:17:15.750Z"
categories:
  - "杂记"
tags:
  - "GitlabRunner"
  - "Proxy"
---

<!-- Migrated from posts/杂记/gitlabrunner流水线之dockerhub重配置.html. Keep the permalink stable. -->
<div class="legacy-content">
<h2 id="前言">前言</h2>
<p>突然发现最近后端流水线连续几次都没成功，于是看了下果然又是Docker服务在国外的原因，咳咳</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://2024-dsy.s3.bitiful.net/imgs/2024/10/05/1728112634.png" alt="image-20240609001313763"></p>
<p>于是搜索了一番，换了一个还能用的地址</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://2024-dsy.s3.bitiful.net/imgs/2024/10/05/1728112634.png" alt="image-20240609001429312"></p>
<p>命令如下</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo vim /etc/docker/daemon.json</span><br></pre></td></tr></tbody></table></figure></div>
<div class="highlight-container" data-rel="Json"><figure class="iseeu highlight json"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="punctuation">{</span></span><br><span class="line">  <span class="attr">"registry-mirrors"</span><span class="punctuation">:</span> <span class="punctuation">[</span></span><br><span class="line">    <span class="string">"https://docker.m.daocloud.io"</span></span><br><span class="line">  <span class="punctuation">]</span></span><br><span class="line"><span class="punctuation">}</span></span><br></pre></td></tr></tbody></table></figure></div>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">sudo systemctl restart docker</span><br></pre></td></tr></tbody></table></figure></div>
<p>PS：如果出现</p>
<p>Job for docker.service failed because the control process exited with error code.<br>
See “systemctl status docker.service” and “journalctl -xeu docker.service” for details.</p>
<p>那说明daemon.json写错力</p>
<h2 id="结果">结果</h2>
<p>等了12分钟终于好了</p>
<p><img lazyload="" src="/images/loading.svg" data-src="https://2024-dsy.s3.bitiful.net/imgs/2024/10/05/1728112634.png" alt="image-20240609001959554"></p>
<h2 id="补充">补充</h2>
<p>感觉这个很快就要不能用了</p>
</div>

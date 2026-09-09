---
title: "FaceFusion使用记录"
permalink: "/posts/杂记/facefusion使用记录.html"
date: "2024-07-05T07:29:59.000Z"
updated: "2024-09-30T12:51:30.561Z"
cover: "/generated-covers/043-facefusion使用记录.webp"
description: "南软面试刚结束，用驱动云送的计算点折腾了一下 FaceFusion。"
categories:
  - "杂记"
tags:
  - "FaceFusion"
---

<!-- Migrated from posts/杂记/facefusion使用记录.html. Keep the permalink stable. -->
<div class="legacy-content">
<blockquote>
<p>刚刚南软面试结束，稍稍放松下</p>
</blockquote>
<h2 id="环境">环境</h2>
<p>用了驱动云，白嫖了一些计算点</p>
<p><a class="link" target="_blank" rel="noopener" href="https://www.virtaicloud.com/">https://www.virtaicloud.com/ <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<h3 id="换源">换源</h3>
<p>jupterbook + 网页终端，要记得保存环境</p>
<p>conda换源，感觉它这个速度一般，似乎不如不换</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">conda config --add default_channels https://conda.virtaicloud.com/repository/anaconda/main</span><br><span class="line">conda config --add default_channels https://conda.virtaicloud.com/repository/anaconda/r</span><br><span class="line">conda config --add default_channels https://conda.virtaicloud.com/repository/anaconda/msys2</span><br></pre></td></tr></tbody></table></figure></div>
<h3 id="apt换源">apt换源</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://developer.aliyun.com/article/1180548">https://developer.aliyun.com/article/1180548 <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment"># 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释</span></span><br><span class="line">deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse</span><br><span class="line"><span class="comment"># deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse</span></span><br><span class="line">deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse</span><br><span class="line"><span class="comment"># deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse</span></span><br><span class="line">deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse</span><br><span class="line"><span class="comment"># deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse</span></span><br><span class="line">deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse</span><br><span class="line"><span class="comment"># deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse</span></span><br><span class="line"></span><br><span class="line"><span class="comment"># 预发布软件源，不建议启用</span></span><br><span class="line"><span class="comment"># deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse</span></span><br><span class="line"><span class="comment"># deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse</span></span><br></pre></td></tr></tbody></table></figure></div>
<h3 id="Platform">Platform</h3>
<p><a class="link" target="_blank" rel="noopener" href="https://docs.facefusion.io/installation">https://docs.facefusion.io/installation <i class="fa-regular fa-arrow-up-right-from-square fa-sm"></i></a></p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">apt install git-all curl ffmpeg mesa-va-drivers</span><br></pre></td></tr></tbody></table></figure></div>
<p>conda镜像里已经装了</p>
<h3 id="environment">environment</h3>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">conda create --name facefusion python=3.10</span><br></pre></td></tr></tbody></table></figure></div>
<h3 id="accelerator">accelerator</h3>
<p>cuda</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">conda install conda-forge::cuda-runtime=12.4.1 cudnn=8.9.2.26 conda-forge::gputil=1.4.0</span><br></pre></td></tr></tbody></table></figure></div>
</div>

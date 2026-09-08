---
title: "docker常用命令"
permalink: "/posts/工具学习/docker常用命令.html"
date: "2023-10-12T03:46:19.000Z"
updated: "2024-09-30T12:52:39.136Z"
description: "docker run 1docker run -it --network mongo-net-1012 --rm mongo mongosh --host my-mongo-1012  docker run: 这是Docker的运行容器命令，用于创建和启动一个新的容器。 -it: 这两个选项组合表示以交互式模式运行容器并分配一个伪终端（TTY）。这允许你在容器内部与终端进行交互。 --networ"
cover: "https://s2.loli.net/2023/10/12/54d1YtI3KwlCoZW.png"
categories:
  - "工具学习"
tags:
  - "docker"
---

<!-- Migrated from posts/工具学习/docker常用命令.html. Keep the permalink stable. -->
<div class="legacy-content">
<h1>docker run</h1>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker run -it --network mongo-net-1012 --<span class="built_in">rm</span> mongo mongosh --host my-mongo-1012</span><br></pre></td></tr></tbody></table></figure></div>
<ol>
<li><code>docker run</code>: 这是Docker的运行容器命令，用于创建和启动一个新的容器。</li>
<li><code>-it</code>: 这两个选项组合表示以交互式模式运行容器并分配一个伪终端（TTY）。这允许你在容器内部与终端进行交互。</li>
<li><code>--network mongo-net-1012</code>: 这个选项将容器连接到名为 <code>mongo-net-1012</code> 的Docker网络，以便容器之间可以相互通信。</li>
<li><code>--rm</code>: 这个选项指示Docker在容器退出时自动删除容器。这是为了确保容器不会留在系统中，以避免占用存储空间。</li>
<li><code>mongo</code>: 这是要运行的Docker镜像的名称，它表示你要使用MongoDB官方镜像来创建容器。（这里也可以用image:tag，不加的话默认latest)</li>
<li><code>mongosh --host my-mongo-1012</code>: 这是要在容器内运行的命令。<code>mongosh</code> 是MongoDB的官方命令行客户端，<code>--host my-mongo-1012</code> 指定了MongoDB服务器的主机名为 <code>my-mongo-1012</code>，以便连接到该服务器。</li>
</ol>
<h1>docker ps</h1>
<p>ps即Process Status</p>
<h1>启动/停止容器</h1>
<p>要启动和停止Docker容器，你可以使用以下两个常用的Docker命令：</p>
<ol>
<li>
<p><strong>启动容器</strong>：</p>
<p>使用 <code>docker start</code> 命令可以启动一个已经创建的但是已经停止的容器。你需要提供容器的名称或容器ID作为参数。例如：</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker start CONTAINER_NAME_OR_ID</span><br></pre></td></tr></tbody></table></figure></div>
<p>例如，如果你有一个名为 <code>my-container</code> 的容器，要启动它，可以运行：</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker start my-container</span><br></pre></td></tr></tbody></table></figure></div>
</li>
<li>
<p><strong>停止容器</strong>：</p>
<p>使用 <code>docker stop</code> 命令可以停止一个正在运行的容器。你同样需要提供容器的名称或容器ID作为参数。例如：</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker stop CONTAINER_NAME_OR_ID</span><br></pre></td></tr></tbody></table></figure></div>
<p>例如，如果你有一个名为 <code>my-container</code> 的容器，要停止它，可以运行：</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker stop my-container</span><br></pre></td></tr></tbody></table></figure></div>
</li>
</ol>
<p>这些命令允许你在需要时启动或停止容器，以便有效地管理你的Docker容器。</p>
<blockquote>
<p>使用names来停止也是可以的</p>
<p>比如docker stop my-mongo-1012</p>
</blockquote>
<p>停止所有容器</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker stop $(docker ps -q)</span><br></pre></td></tr></tbody></table></figure></div>
<blockquote>
<ol>
<li>
<p><code>docker ps -q</code>:</p>
<ul>
<li>这个命令用于列出运行中的容器的容器ID，而不包括已经停止的容器。</li>
<li><code>-q</code> 选项代表 “quiet”，它仅返回容器的ID而不显示容器的详细信息。</li>
</ul>
<p>例如，执行 <code>docker ps -q</code> 将列出当前正在运行的容器的ID列表。</p>
</li>
<li>
<p><code>docker ps -a</code>:</p>
<ul>
<li>这个命令用于列出所有容器，包括正在运行和已经停止的容器。</li>
<li><code>-a</code> 选项代表 “all”，它显示所有容器的详细信息，包括容器ID、镜像、创建时间、状态等。</li>
</ul>
<p>例如，执行 <code>docker ps -a</code> 将列出所有容器的详细信息，无论它们是运行中的还是已经停止的。</p>
</li>
</ol>
</blockquote>
<h1>使用redis</h1>
<p>创建网络</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker network create redis-net-1012</span><br></pre></td></tr></tbody></table></figure></div>
<p>启动server</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker run --name my-redis-1012 --network redis-net-1012 -p 6379:6379 -d redis:latest</span><br></pre></td></tr></tbody></table></figure></div>
<p>客户端访问</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker run -it --network redis-net-1012 --<span class="built_in">rm</span> redis redis-cli -h my-redis-1012</span><br></pre></td></tr></tbody></table></figure></div>
<p>启动成功</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/%E5%B7%A5%E5%85%B7%E5%AD%A6%E4%B9%A0/docker%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4/image-20231012144424264.png" class="" title="image-20231012144424264">
<p>测试</p>
<img lazyload="" src="/images/loading.svg" data-src="/posts/%E5%B7%A5%E5%85%B7%E5%AD%A6%E4%B9%A0/docker%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4/image-20231012144958421.png" class="" title="image-20231012144958421">
<h1>mysql</h1>
<p>为了区分，映射了一个51001端口，注意容器端口还得是3306，不然好像连接不上</p>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line">docker pull mysql</span><br><span class="line"></span><br><span class="line">docker network create mysql-net-1026</span><br><span class="line"></span><br><span class="line">docker run --name my-mysql-1026 --network mysql-net-1026 -e MYSQL_ROOT_PASSWORD=root1234 -d -p 51001:3306 mysql:latest</span><br><span class="line"></span><br><span class="line">docker run -it --network mysql-net-1026 --<span class="built_in">rm</span> mysql:latest mysql -h my-mysql-1026 -u root -p</span><br></pre></td></tr></tbody></table></figure></div>
<ul>
<li>
<p><code>docker run</code>: 启动一个 Docker 容器。</p>
</li>
<li>
<p><code>-it</code>: 这是两个参数的组合，<code>-i</code> 表示交互式模式，允许您与容器交互，<code>-t</code> 分配一个终端。</p>
</li>
<li>
<p><code>--network mysql-net-1026</code>: 指定容器连接的网络。在这里，容器将连接到名为 <code>mysql-net-1026</code> 的 Docker 网络，这使得容器可以与该网络中的其他容器进行通信。</p>
</li>
<li>
<p><code>--rm</code>: 表示容器退出时自动删除容器。这有助于确保在容器退出后不会留下残留的容器。</p>
</li>
<li>
<p><code>mysql:latest</code>: 指定要运行的 Docker 镜像。在这里，使用了 MySQL 的最新版本。</p>
</li>
<li>
<p><code>mysql -h my-mysql-1026 -u root -p</code>:</p>
<p>这是在容器内运行的命令。它执行了以下操作：</p>
<ul>
<li><code>mysql</code>: 启动 MySQL 客户端。</li>
<li><code>-h my-mysql-1026</code>: 指定要连接的 MySQL 服务器的主机名。在这里，<code>my-mysql-1026</code> 是您 MySQL 容器的主机名，它连接到该容器的 MySQL 服务器。</li>
<li><code>-u root</code>: 指定 MySQL 用户名，这里是 root。</li>
<li><code>-p</code>: 要求输入密码，这样您可以输入 MySQL 的密码以连接到 MySQL 服务器。</li>
</ul>
</li>
</ul>
<h1>进入容器</h1>
<div class="highlight-container" data-rel="Bash"><figure class="iseeu highlight bash"><table><tbody><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">docker <span class="built_in">exec</span> -it &lt;container_name_or_id&gt; bash</span><br></pre></td></tr></tbody></table></figure></div>
</div>

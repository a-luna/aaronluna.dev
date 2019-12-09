---
title: "Create a Shell Script to Install NGINX from Source On Ubuntu"
slug: "install-nginx-source-code-shell-script"
aliases:
    - /2018/01/22/install-nginx-source-code-shell-script/
date: "2018-01-22"
categories: ["Linux"]
---

Why would you want to install NGINX from source code rather than a pre-built package? The most important reason is that the libraries which NGINX depends on (PCRE, zlib, OpenSSL) are part of the pre-built package, and building from source allows you to use the latest versions which may contain vital security patches.

For instance, you will find that the version of NGINX available through your package manager is several major versions behind [the current mainline](http://nginx.org/en/download.html). Note, for Ubuntu systems, you can find pre-built packages which are much closer to the current mainline from Launchpad's [Personal Package Archive](https://launchpad.net/ubuntu/+ppas?name_filter=nginx) service.

Another reason to install from source is that NGINX can be [configured in many different ways](https://www.nginx.com/resources/wiki/start/topics/tutorials/installoptions/), and the only way to choose how it is configured is to install from source. When you install NGINX from a pre-built package, you are stuck with whatever set of modules are enabled. In this post, I will show how to include third-party modules and how to enable modules which are disabled by default.

If you just came here for the script, you can [download the completed shell script](https://gist.github.com/a-luna/316f1f8ed95d9c138eb04eecc3ba348d) from the gist linked below. This script installs the latest mainline NGINX version along with the latest versions of PCRE, zlib and OpenSSL libraries, and includes two useful third-party modules:

<div class="center"><a href="https://gist.github.com/a-luna/316f1f8ed95d9c138eb04eecc3ba348d" class="eyeballs" target="_blank">Shell Script: Build and Install NGINX from Source (Ubuntu) [github.com]</a></div>

The rest of this post will explain in detail how to install NGINX from source. It does not match my shell script exactly since the script is designed to run non-interactively and uses variables. The steps below require user input and no variables are used.

## Build and Install NGINX from Source Code

These steps produce a .deb package which can be used to uninstall this version of NGINX via apt-get (the .deb package can also be used to install this customized version of NGINX on another system with the same architecture). You can find information on the checkinstall program which creates the .deb package [here](https://wiki.debian.org/CheckInstall).

After NGINX is built and installed, all source code files are added to a .tar.gz archive file. This allows you to avoid downloading the source code again if you use the .deb package to install this version of NGINX on another system.

<div class="post__toc toc">
  <div class="toc__title"><span>Table of Contents</span></div>
	<div class="toc__menu">
		<nav id="TableOfContents"></nav>
      <ul>
        <li><a href="#install-prerequisites-and-dependancies">Install Prerequisites and Dependancies</a></li>
        <li><a href="#prepare-for-install">Prepare for Install</a></li>
        <li><a href="#build-configuration">Build Configuration</a></li>
        <li><a href="#create-debian-install-package">Create Debian Install Package</a></li>
        <li><a href="#install-and-configure-nginx">Install and Configure NGINX</a></li>
      </ul>
    </nav>
	</div>
</div>

### Install Prerequisites and Dependancies

This guide is written for Ubuntu, but the steps only need to be changed in minor ways to apply to other Linux distributions.

The steps also assume that you are logged in with a user account that has sudo access. If you are unsure what this means, please perform the steps in [this guide from DigitalOcean](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04).

If you are using a different Linux distribution the steps to create a user with sudo access will be similar, try a google search with your distro's name and "root privileges".

<ol>
  <li>
    <p>To begin, add the <a href="https://launchpad.net/~maxmind/+archive/ubuntu/ppa">Maxmind PPA</a> to your list of sources. This PPA has much newer versions of the GeoIP libraries and databases than the default apt source:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo add-apt-repository ppa:maxmind/ppa -y</span>
<span class="cmd-results">gpg: keyring `/tmp/tmpmku7ishg/secring.gpg' created
gpg: keyring `/tmp/tmpmku7ishg/pubring.gpg' created
gpg: requesting key DE742AFA from hkp server keyserver.ubuntu.com
gpg: /tmp/tmpmku7ishg/trustdb.gpg: trustdb created
gpg: key DE742AFA: public key "Launchpad PPA for MaxMind" imported
gpg: Total number processed: 1
gpg:               imported: 1  (RSA: 1)
OK</span></code></pre>
  </li>
  <li>
    <p>Update your system (Depending on your Ubuntu version and configuration, libgeoip1 may be updated from the PPA added in the previous step):</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo apt update && sudo apt upgrade -y</span>
<span class="cmd-comment">#removed messages detailing update process</span>
<span class="cmd-results">The following packages will be upgraded:
  libgeoip1
1 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
Need to get 76.7 kB of archives.
After this operation, 3,072 B disk space will be freed.
#removed messages detailing upgrade process</span></code></pre>
  </li>
  <li>
    <p>Remove any libraries which are no longer needed:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo apt autoremove -y</span>
<span class="cmd-results">Reading package lists... Done
Building dependency tree
Reading state information... Done
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.</span></code></pre>
  </li>
  <li>
    <p>NGINX is written in C, so we need to install GCC, make and other tools:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo apt install build-essential -y</span>
<span class="cmd-comment">#removed messages detailing install process</span></code></pre>
  </li>
  <li>
    <p>We are going to install a third-party GeoIP module, but in order to do so we must first install these libraries:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo apt install libmaxminddb0 libmaxminddb-dev mmdb-bin -y</span>
<span class="cmd-comment">#removed output messages detailing install process</span></code></pre>
  </li>
  <li>
    <p>Install checkinstall:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo apt install checkinstall -y</span>
<span class="cmd-comment">#removed output messages detailing install process</span></code></pre>
  </li>
  <li>
    <p>Install <a href="https://launchpad.net/ufw">Uncomplicated Firewall (UFW)</a> which makes it easier to manage rules for ports used by NGINX:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo apt install ufw -y</span>
<span class="cmd-comment">#removed output messages detailing install process</span></code></pre>
  </li>
</ol>

### Prepare for Install

<ol start="8">
  <li>
    <p>Next, create a directory to store source files:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo mkdir -p /opt/src_files && cd /opt/src_files</span>
<span class="cmd-prompt">/opt/src_files $</span></code></pre>
    <div class="alert alert-flex">
      <div class="alert-icon">
        <i class="fa fa-exclamation-triangle"></i>
      </div>
      <div class="alert-message">
        <p><span class="bold-italics">PLEASE DO NOT USE A FOLDER IN YOUR USER'S HOME DIRECTORY</span>. If you plan on using the .deb file to install your custom version of NGINX on another system, the source files must be located in the same path on each system. If you store the source files in a directory in this user's home directory, you will only be able to use the .deb package on another system with a user who's name is exactly the same.</p>
      </div>
    </div>
  </li>
  <li>
    <p>Download and extract the source code for <a href="http://www.nginx.org/en/download.html">the latest version of NGINX</a>:</p>
    <pre><code><span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo wget http://nginx.org/download/nginx-1.15.6.tar.gz && \</span>
<span class="cmd-prompt">></span> <span class="cmd-input">sudo tar xzf nginx-1.15.6.tar.gz</span>
<span class="cmd-comment">#removed messages detailing download progress</span>
<span class="cmd-results">2018-11-26 16:36:19 (2.98 MB/s) - ‘nginx-1.15.6.tar.gz’ saved [1025761/1025761]</span></code></pre>
  </li>
  <li>
    <p>Download dependencies (PCRE, zlib and OpenSSL) and extract the source code:</p>
    <pre><code><span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo wget https://downloads.sourceforge.net/project/pcre/pcre/8.42/pcre-8.42.tar.gz && \</span>
<span class="cmd-prompt">></span> <span class="cmd-input">sudo tar xzf pcre-8.42.tar.gz</span>
<span class="cmd-comment">#removed messages detailing download progress</span>
<span class="cmd-results">2018-11-26 16:40:14 (5.18 MB/s) - ‘pcre-8.42.tar.gz’ saved [2081413/2081413]</span>
<span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo wget http://zlib.net/zlib-1.2.11.tar.gz && \</span>
<span class="cmd-prompt">></span> <span class="cmd-input">sudo tar xzf zlib-1.2.11.tar.gz</span>
<span class="cmd-comment">#removed messages detailing download progress</span>
<span class="cmd-results">2018-11-26 16:41:56 (2.80 MB/s) - ‘zlib-1.2.11.tar.gz’ saved [607698/607698]</span>
<span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo wget https://www.openssl.org/source/openssl-1.1.1a.tar.gz && \</span>
<span class="cmd-prompt">></span> <span class="cmd-input">sudo tar xzf openssl-1.1.1a.tar.gz</span>
<span class="cmd-comment">#removed messages detailing download progress</span>
<span class="cmd-results">2018-11-26 16:42:56 (6.66 MB/s) - ‘openssl-1.1.1a.tar.gz’ saved [8350547/8350547]</span></code></pre>
  <p>You can find the latest version for each library at the following locations:</p>
    <ul>
      <li>
        <a href="https://www.pcre.org">https://www.pcre.org</a>
        <div class="alert alert-flex">
          <div class="alert-icon">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <div class="alert-message">
            <p>NGINX requires the original PCRE library, <span class="bold-italics">NOT PCRE2</span></p>
          </div>
        </div>
      </li>
      <li>
        <a href="http://zlib.net">http://zlib.net</a>
      </li>
      <li>
        <a href="https://www.openssl.org/source/">https://www.openssl.org/source/</a>
        <div class="alert alert-flex">
          <div class="alert-icon">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <div class="alert-message">
            <p>NGINX can be built with any 1.x.x version of OpenSSL, but using the latest (1.1.1) is strongly recommended since this version includes suport for TLS 1.3, the latest and most secure version of the encryption protocol.</p>
          </div>
        </div>
      </li>
    </ul>
  </li>
  <li>
    <p>Download third-party NGINX modules: <a href="http://labs.frickle.com/nginx_ngx_cache_purge/">cache purge</a> and <a href="https://github.com/leev/ngx_http_geoip2_module">GeoIP2</a>:</p>
    <p>Feel free to omit this step or substitute different third-party modules, depending on your website's requirements. In that case, you will need to modify the configure command in <span class="emphasis">Step 13</span></p>
    <p>If you do not want to install any third-party modules, remove the two lines which start with <code>&#8211;&#8211;add&#8211;module&#61;</code> <span class="emphasis">(lines 49-50)</span>. If you are installing different modules, modify these lines to point to folders containing module source code.</p>
    <pre><code><span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo git clone --recursive https://github.com/FRiCKLE/ngx_cache_purge.git</span>
<span class="cmd-results">Cloning into 'ngx_cache_purge'...</span>
<span class="cmd-comment">#removed messages detailing download progress</span>
<span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo git clone --recursive https://github.com/leev/ngx_http_geoip2_module.git</span>
<span class="cmd-results">Cloning into 'ngx_http_geoip2_module'...</span>
<span class="cmd-comment">#removed messages detailing download progress</span></code></pre>
    <p>The GeoIP module included with NGINX only works with v1 MaxMind database files. <a href="https://dev.maxmind.com/geoip/geoip2/whats-new-in-geoip2/">V2 database provide better info</a> than v1, to use v2 files on NGINX you will need to install this module.</p>
  </li>
</ol>

### Build Configuration

<ol start="12">
  <li>
    <p>We are ready to begin building NGINX. Delete all .tar.gz files. After doing so, your directory should contain folders for each program/library downloaded in the previous steps. After confirming this is the case, navigate to the folder containing the NGINX source code:</p>
<pre><code><span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">sudo rm -rf *.tar.gz</span>
<span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">ls -al</span>
<span class="cmd-results">total 32
drwxr-xr-x  8 root root  4096 Nov 26 17:23 .
drwxr-xr-x  3 root root  4096 Nov 26 16:34 ..
drwxr-xr-x  8 1001  1001 4096 Nov  6 13:32 nginx-1.15.6
drwxr-xr-x  4 root root  4096 Nov 26 17:20 ngx_cache_purge
drwxr-xr-x  3 root root  4096 Nov 26 17:20 ngx_http_geoip2_module
drwxr-xr-x 19 root root  4096 Nov 20 13:35 openssl-1.1.1a
drwxr-xr-x  7 1169  1169 4096 Mar 20  2018 pcre-8.42
drwxr-xr-x 14  501 staff 4096 Jan 15  2017 zlib-1.2.11</span>
<span class="cmd-prompt">/opt/src_files $</span> <span class="cmd-input">cd nginx-1.15.6</span>
<span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span></code></pre>
  </li>
  <li>
    <p><strong>This is the most important step</strong>. With this <code>./configure</code> command, you enable/disable modules and manage all configuration settings:</p>
    <div class="note note-flex">
      <div class="note-icon">
        <i class="fa fa-pencil"></i>
      </div>
      <div class="note-message" style="flex-flow: column wrap">
        <p>The values below for OpenSSL, PCRE and zlib library folder paths (<strong>Line #18, 21 and 23</strong>, respectively)  are valid for the actions performed in <strong>Step 10</strong>. If you saved the source code somewhere besides <code>/opt/src_files</code>, modify the config arguments to use the correct location.</p>
      </div>
    </div>
    <pre><code><span class="cmd-lineno"> 1</span> <span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo ./configure \</span>
<span class="cmd-lineno"> 2</span> <span class="cmd-prompt">></span> <span class="cmd-input">--prefix=/usr/share/nginx \</span>
<span class="cmd-lineno"> 3</span> <span class="cmd-prompt">></span> <span class="cmd-input">--sbin-path=/usr/sbin/nginx \</span>
<span class="cmd-lineno"> 4</span> <span class="cmd-prompt">></span> <span class="cmd-input">--modules-path=/usr/lib/nginx/modules \</span>
<span class="cmd-lineno"> 5</span> <span class="cmd-prompt">></span> <span class="cmd-input">--conf-path=/etc/nginx/nginx.conf \</span>
<span class="cmd-lineno"> 6</span> <span class="cmd-prompt">></span> <span class="cmd-input">--error-log-path=/var/log/nginx/error.log \</span>
<span class="cmd-lineno"> 7</span> <span class="cmd-prompt">></span> <span class="cmd-input">--http-log-path=/var/log/nginx/access.log \</span>
<span class="cmd-lineno"> 8</span> <span class="cmd-prompt">></span> <span class="cmd-input">--pid-path=/var/run/nginx.pid \</span>
<span class="cmd-lineno"> 9</span> <span class="cmd-prompt">></span> <span class="cmd-input">--lock-path=/var/lock/nginx.lock \</span>
<span class="cmd-lineno">10</span> <span class="cmd-prompt">></span> <span class="cmd-input">--user=www-data \</span>
<span class="cmd-lineno">11</span> <span class="cmd-prompt">></span> <span class="cmd-input">--group=www-data \</span>
<span class="cmd-lineno">12</span> <span class="cmd-prompt">></span> <span class="cmd-input">--build=Ubuntu \</span>
<span class="cmd-lineno">13</span> <span class="cmd-prompt">></span> <span class="cmd-input">--http-client-body-temp-path=/var/lib/nginx/body \</span>
<span class="cmd-lineno">14</span> <span class="cmd-prompt">></span> <span class="cmd-input">--http-fastcgi-temp-path=/var/lib/nginx/fastcgi \</span>
<span class="cmd-lineno">15</span> <span class="cmd-prompt">></span> <span class="cmd-input">--http-proxy-temp-path=/var/lib/nginx/proxy \</span>
<span class="cmd-lineno">16</span> <span class="cmd-prompt">></span> <span class="cmd-input">--http-scgi-temp-path=/var/lib/nginx/scgi \</span>
<span class="cmd-lineno">17</span> <span class="cmd-prompt">></span> <span class="cmd-input">--http-uwsgi-temp-path=/var/lib/nginx/uwsgi \</span>
<span class="cmd-lineno cmd-hl-border">18</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-openssl=/opt/src_files/openssl-1.1.1a \</span>
<span class="cmd-lineno">19</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-openssl-opt=enable-ec_nistp_64_gcc_128 \</span>
<span class="cmd-lineno">20</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-openssl-opt=no-weak-ssl-ciphers \</span>
<span class="cmd-lineno cmd-hl-border">21</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-pcre=/opt/src_files/pcre-8.42 \</span>
<span class="cmd-lineno">22</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-pcre-jit \</span>
<span class="cmd-lineno cmd-hl-border">23</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-zlib=/opt/src_files/zlib-1.2.11 \</span>
<span class="cmd-lineno">24</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-compat \</span>
<span class="cmd-lineno">25</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-file-aio \</span>
<span class="cmd-lineno">26</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-threads \</span>
<span class="cmd-lineno">27</span> <span class="cmd-prompt">></span> <span class="cmd-input">--<with-http_addition_module \</span>
<span class="cmd-lineno">28</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_auth_request_module \</span>
<span class="cmd-lineno">29</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_dav_module \</span>
<span class="cmd-lineno">30</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_flv_module \</span>
<span class="cmd-lineno">31</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_gunzip_module \</span>
<span class="cmd-lineno">32</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_gzip_static_module \</span>
<span class="cmd-lineno">33</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_mp4_module \</span>
<span class="cmd-lineno">34</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_random_index_module \</span>
<span class="cmd-lineno">35</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_realip_module \</span>
<span class="cmd-lineno">36</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_slice_module \</span>
<span class="cmd-lineno">37</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_ssl_module \</span>
<span class="cmd-lineno">38</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_sub_module \</span>
<span class="cmd-lineno">39</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_stub_status_module \</span>
<span class="cmd-lineno">40</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_v2_module \</span>
<span class="cmd-lineno">41</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-http_secure_link_module \</span>
<span class="cmd-lineno">42</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-mail \</span>
<span class="cmd-lineno">43</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-mail_ssl_module \</span>
<span class="cmd-lineno">44</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-stream \</span>
<span class="cmd-lineno">45</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-stream_realip_module \</span>
<span class="cmd-lineno">46</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-stream_ssl_module \</span>
<span class="cmd-lineno">47</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-stream_ssl_preread_module \</span>
<span class="cmd-lineno">48</span> <span class="cmd-prompt">></span> <span class="cmd-input">--with-debug \</span>
<span class="cmd-lineno cmd-hl-border">49</span> <span class="cmd-prompt">></span> <span class="cmd-input">--add-module=../ngx_http_geoip2_module \</span>
<span class="cmd-lineno cmd-hl-border">50</span> <span class="cmd-prompt">></span> <span class="cmd-input">--add-module=../ngx_cache_purge \</span></code></pre>
    <p>If you need to disable a module which is enabled by default, please read <a href="https://www.nginx.com/resources/admin-guide/installing-nginx-open-source/#modules">these instructions</a>. All arguments of the form <code>&#8211;&#8211;with*_module</code> enable NGINX modules which are by default disabled. If you need to do the opposite (i.e. disable a module which by default is enabled when installing NGINX) (e.g. the fastcgi module), you would add <code>&#8211;&#8211;without&#8211;http_fastcgi_module</code> to the list of arguments.</p>
    <p>For more information on how you can customize your install with arguments supplied to the configure command, see the links below:</p>
    <ul class="list-of-links">
      <li><a href="http://nginx.org/en/docs/configure.html">http://nginx.org/en/docs/configure.html</a></li>
      <li><a href="https://www.nginx.com/resources/wiki/start/topics/tutorials/installoptions/">(https://www.nginx.com/resources/wiki/start/topics/tutorials/installoptions/)</a></li>
    </ul>
  </li>
  <li>
    <p>When you are 100% confident that every requirement of your NGINX installation is satisfied, run the <code>./configure</code> command. When the configuration is complete, you should see a report of the configuration settings that will be used to build NGINX.</p>
          <pre><code><span class="cmd-lineno"> 1</span> <span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo ./configure </span>
<span class="cmd-lineno"> 2</span> <span class="cmd-comment">#removed configuration arguments</span>
<span class="cmd-lineno"> 3</span> <span class="cmd-comment">#removed verification statements</span>
<span class="cmd-lineno"> 4</span> <span class="cmd-results">configuring additional modules</span>
<span class="cmd-lineno"> 5</span> <span class="cmd-results">adding module in ../ngx_http_geoip2_module</span>
<span class="cmd-lineno"> 6</span> <span class="cmd-results">checking for MaxmindDB library ... found</span>
<span class="cmd-lineno"> 7</span> <span class="cmd-results">+ ngx_geoip2_module was configured</span>
<span class="cmd-lineno"> 8</span> <span class="cmd-results">adding module in ../ngx_cache_purge</span>
<span class="cmd-lineno"> 9</span> <span class="cmd-results">+ ngx_http_cache_purge_module was configure</span>
<span class="cmd-lineno">10</span> <span class="cmd-results">creating objs/Makefile</span>
<span class="cmd-lineno">11</span>
<span class="cmd-lineno">12</span> <span class="cmd-results">Configuration summary</span>
<span class="cmd-lineno">13</span> <span class="cmd-results">  + using threads</span>
<span class="cmd-lineno">14</span> <span class="cmd-results">  + using PCRE library: /opt/src_files/pcre-8.42</span>
<span class="cmd-lineno">15</span> <span class="cmd-results">  + using OpenSSL library: /opt/src_files/openssl-1.1.1a</span>
<span class="cmd-lineno">16</span> <span class="cmd-results">  + using zlib library: /opt/src_files/zlib-1.2.11</span>
<span class="cmd-lineno">17</span>
<span class="cmd-lineno">18</span> <span class="cmd-results">  nginx path prefix: "/usr/share/nginx"</span>
<span class="cmd-lineno">19</span> <span class="cmd-results">  nginx binary file: "/usr/sbin/nginx"</span>
<span class="cmd-lineno">20</span> <span class="cmd-results">  nginx modules path: "/usr/lib/nginx/modules"</span>
<span class="cmd-lineno">21</span> <span class="cmd-results">  nginx configuration prefix: "/etc/nginx"</span>
<span class="cmd-lineno">22</span> <span class="cmd-results">  nginx configuration file: "/etc/nginx/nginx.conf"</span>
<span class="cmd-lineno">23</span> <span class="cmd-results">  nginx pid file: "/var/run/nginx.pid"</span>
<span class="cmd-lineno">24</span> <span class="cmd-results">  nginx error log file: "/var/log/nginx/error.log"</span>
<span class="cmd-lineno">25</span> <span class="cmd-results">  nginx http access log file: "/var/log/nginx/access.log"</span></code></pre>
    <p>You should be able to confirm several of the configuration settings have been correctly defined:</p>
    <ul>
      <li><strong>Lines 4-9</strong> confirm that the third-party modules downloaded in <strong>Step 11</strong> (GeoIP2 and cache purge) are configured correctly (also, the MaxMind libraries installed in <strong>Step 5</strong> were successfully located).</li>
      <li><strong>Lines 12-16</strong> confirm that the versions of PCRE, zlib and OpenSSL downloaded in <strong>Step 10</strong> will be used to build NGINX</li>
      <li><strong>Lines 18-25</strong> confirm various settings such as where to store the NGINX binary, location of NGINX configuration files, location of log files, etc.</li>
    </ul>
  </li>
  <li>
    <p>After finalizing your configuration, build NGINX:</p>
    <pre><code><span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo make</span>
<span class="cmd-comment">#removed thousands of build statements
#eventually, you should see a message like this:</span>
<span class="cmd-results">sed -e "s|%%PREFIX%%|/usr/share/nginx|" \
  -e "s|%%PID_PATH%%|/var/run/nginx.pid|" \
  -e "s|%%CONF_PATH%%|/etc/nginx/nginx.conf|" \
  -e "s|%%ERROR_LOG_PATH%%|/var/log/nginx/error.log|" \
  < man/nginx.8 > objs/nginx.8
make[1]: Leaving directory '/opt/src_files/nginx-1.15.6'</span></code></pre>
    <p>At this point, you are probably thinking that the next step is to run <code>sudo make install</code>. Doing so would produce a working install of NGINX, finely calibrated to our unique demands, but would deprive us of benefits that we have come to expect when we install a program using apt or any other package management product (pip, npm, brew, etc). We can achieve a few of these benefits by utilizing the <code>checkinstall</code> program that we installed in <strong>Step 6</strong>.</p>
    <p><code>checkinstall</code> is a simple program which monitors the installation of files, and creates a Debian package from them. There are two primary benefits to using <code>checkinstall</code> instead of running <code>make install</code>:</p>
    <ul>
      <li>You can easily remove the package with one step.</li>
      <li>You can install the resulting package upon multiple machines.</li>
    </ul>
    <p>After building the binary, you are ready to use checkinstall to create a .deb package for your custom NGINX configuration.</p>
  </li>
</ol>

### Create Debian Install Package

<ol start="16">
  <li>
    <p>Run checkinstall and specify values for two flags:</p>
  <ul>
    <li><code>--install=no</code> will cause ONLY a .deb package to be created, the default behavior is to install the binary and create the .deb package.</li>
    <li><code>-y</code> will create the .deb package non-interactively, accepting the default value for all prompts that are normally presented to the user.</li>
  </ul>
  <pre><code><span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo checkinstall --install=no -y</span>
<span class="cmd-comment">#removed installation messages
#eventually, you should see a message like this:</span>
<span class="cmd-results">**********************************************************************

Done. The new package has been saved to

/opt/src_files/nginx-1.15.6/nginx_1.15.6-1_amd64.deb
You can install it in your system anytime using:

      dpkg -i nginx_1.15.6-1_amd64.deb

**********************************************************************</span></code></pre>
  </li>
  <li>
    <p>You can examine the contents of the .deb package to see the target location of all files that will be copied to your system during installation:</p>
    <pre><code><span class="cmd-lineno"> 1</span> <span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">dpkg --contents  nginx_1.15.6-1_amd64.deb</span>
<span class="cmd-lineno"> 2</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./</span>
<span class="cmd-lineno"> 3</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./etc/</span>
<span class="cmd-lineno"> 4</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./etc/nginx/</span>
<span class="cmd-lineno"> 5</span> <span class="cmd-comment">#removed listing of files in nginx config folder</span>
<span class="cmd-lineno"> 6</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-14 21:43 ./usr/</span>
<span class="cmd-lineno"> 7</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./usr/share/</span>
<span class="cmd-lineno"> 8</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./usr/share/nginx/</span>
<span class="cmd-lineno"> 9</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./usr/share/nginx/html/</span>
<span class="cmd-lineno">10</span> <span class="cmd-comment">#removed listing of files in default website root</span>
<span class="cmd-lineno">11</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./usr/share/doc/</span>
<span class="cmd-lineno">12</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./usr/share/doc/nginx/</span>
<span class="cmd-lineno">13</span> <span class="cmd-comment">#removed listing of files in nginx documentation folder</span>
<span class="cmd-lineno">14</span> <span class="cmd-results">drwxr-xr-x root/root         0 2018-11-27 12:24 ./usr/sbin/</span>
<span class="cmd-lineno">15</span> <span class="cmd-results">-rwxr-xr-x root/root   4820568 2018-11-27 12:24 ./usr/sbin/nginx</span></code></pre>
    <p>The folder paths listed in the .deb package are taken from values provided to the <code>./configure</code> command in <strong>Step 13</strong>:</p>
    <ul>
      <li><strong>/etc/nginx</strong> is the root path for NGINX configuration files, this location is taken from the value <code>--conf-path=/etc/nginx/nginx.conf</code> <strong>(Step 13, Line #5)</strong></li>
      <li><strong>/usr/share/nginx</strong> is the folder used to serve html content in the default configuration, this location is taken from the value <code>--prefix=/usr/share/nginx</code> <strong>(Step 13, Line #2)</strong></li>
      <li><strong>/usr/sbin</strong> is the location of the NGINX binary and **/usr/sbin/nginx** is the binary file, this location (and the name of the binary itself) is taken from the value <code>--sbin-path=/usr/sbin/nginx</code> <strong>(Step 13, Line #3)</strong></li>
    </ul>
    <p>The location used to store NGINX documentation (<strong>/usr/share/doc/nginx</strong>) is NOT controlled by the <code>./configure</code> command. This directory was created because we ran checkinstall with the <code>-y</code> flag, answering "yes" to the prompt asking if you want to create the documentation directory. There are several values you can customize when creating the .deb package, please see <a href="http://checkinstall.izto.org/docs/README">the official documentation</a> for more details.</p>
  </li>
</ol>

### Install and Configure NGINX

<ol start="18">
  <li>
    <p>We are finally ready to install NGINX using the .deb package:</p>
    <pre><code><span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo dpkg -i nginx_1.15.6-1_amd64.deb</span>
<span class="cmd-results">(Reading database ... 56508 files and directories currently installed.)
Preparing to unpack nginx_1.15.6-1_amd64.deb ...
Unpacking nginx (1.15.6-1) over (1.15.6-1) ...
Setting up nginx (1.15.6-1) ...</span></code></pre>
    <p>Installing with the .deb package (rather than the usual <code>sudo make install</code>) allows our custom version of NGINX to be cleanly uninstalled with either command below:</p>
    <ul>
      <li><code>sudo apt-get remove nginx</code></li>
      <li><code>sudo dpkg &#8211;&#8211;remove nginx</code></li>
    </ul>
    <p>Now that the installation is complete, we are going to create an archive file from the source code we used to build NGINX.</p>
  </li>
  <li>
    <p>Move the .deb package to a new folder since we want to keep it separate from the source code files. Navigate to the location of the .deb file after you have moved it:</p>
    <div class="note note-flex">
      <div class="note-icon">
        <i class="fa fa-pencil"></i>
      </div>
      <div class="note-message" style="flex-flow: column wrap">
        <p>I created a new folder, <code>/opt/save</code>, and moved the .deb file to this location. Feel free to use any folder other than the directory containing the source files.</p>
      </div>
    </div>
    <pre><code><span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo mkdir -p /opt/save</span>
<span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">sudo mv nginx_1.15.6-1_amd64.deb /opt/save</span>
<span class="cmd-prompt">/opt/src_files/nginx-1.15.6 $</span> <span class="cmd-input">cd /opt/save</span>
<span class="cmd-prompt">/opt/save $</span></code></pre>
  </li>
  <li>
    <p>Create a tar file from the directory containing the source code files. Modify the command accordingly if you used a different directory:</p>
      <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo tar -zcf nginx_1.15.6-src_files.tar.gz /opt/src_files</span>
<span class="cmd-results">tar: Removing leading `/' from member names</span></code></pre>
  </li>
  <li>
    <p>The current folder contain two files: the .deb package and a .tar.gz file containing the downloaded source code. Make both files executable by all users:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo chmod 755 nginx*.*</span>
<span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">ls -al</span>
<span class="cmd-results">total 186452
drwxr-xr-x 2 root root      4096 Nov 28 17:43 .
drwxr-xr-x 4 root root      4096 Nov 28 17:37 ..
-rwxr-xr-x 1 root root   1841212 Nov 27 12:24 nginx_1.15.6-1_amd64.deb
-rwxr-xr-x 1 root root 189067874 Nov 28 17:47 nginx_1.15.6-src_files.tar.gz</span></code></pre>
  </li>
  <li>
    <p>For some reason NGINX does not create a folder at <code>/var/lib/nginx</code> even though this location is specified several times in our list of configure arguments in <code>Step 13</code>. Create this directory to ensure the config file passes verification in the next step:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo mkdir -p /var/lib/nginx</span></code></pre>
  </li>
  <li>
    <p>The <code>nginx -t</code> command checks the nginx.conf file for syntax errors and performs serveral other helpful tests as well. It looks at all included config files and reports if there are any issues with permissions, file-not-found, etc. I recommend making a habit of running this command everytime you modify your web server's configuration to check for errors you may have introduced.</p>
    <p>Running the command at this point should report that the config file syntax is error-free and passes the verification tests:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo nginx -t</span>
<span class="cmd-results">nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful</span></code></pre>
    <p>Another usefu command is <code>nginx -V</code>. This will report the version number of NGINX as well as the version of OpenSSL that was used to build the binary. The values that were provided to configure the build (<strong>Step 13</strong>) are also reported:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo nginx -V</span>
<span class="cmd-results">nginx version: nginx/1.15.6 (Ubuntu)
built by gcc 5.4.0 20160609 (Ubuntu 5.4.0-6ubuntu1~16.04.10)
built with OpenSSL 1.1.1a  20 Nov 2018
TLS SNI support enabled
configure arguments: --prefix=/usr/share/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib/nginx/modules --conf-path=/etc/nginx/nginx.conf
--error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/lock/nginx.lock
--user=www-data --group=www-data --build=Ubuntu --http-client-body-temp-path=/var/lib/nginx/body --http-fastcgi-temp-path=/var/lib/nginx/fastcgi
--http-proxy-temp-path=/var/lib/nginx/proxy --http-scgi-temp-path=/var/lib/nginx/scgi --http-uwsgi-temp-path=/var/lib/nginx/uwsgi
--with-openssl=/opt/src_files/openssl-1.1.1a --with-openssl-opt=enable-ec_nistp_64_gcc_128 --with-openssl-opt=no-weak-ssl-ciphers --with-pcre=/opt/src_files/pcre-8.42
--with-pcre-jit --with-zlib=/opt/src_files/zlib-1.2.11 --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module
--with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module
--with-http_realip_module --with-http_slice_module --with-http_ssl_module --with-http_sub_module --with-http_stub_status_module --with-http_v2_module
--with-http_secure_link_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
--with-debug --add-module=../ngx_http_geoip2_module --add-module=../ngx_cache_purge
--with-cc-opt='-g -O2 -fstack-protector --param=ssp-buffer-size=4 -Wformat -Werror=format-security -Wp,-D_FORTIFY_SOURCE=2'
--with-ld-opt='-Wl,-z,relro -Wl,--as-needed'</span></code></pre>
  </li>
  <li>
    <p>If your config file passes validation, create two folders as shown below which will contain config settings for the website(s) which this server is hosting:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo mkdir /etc/nginx/sites-available</span>
<span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo mkdir /etc/nginx/sites-enabled</span></code></pre>
  </li>
  <li>
    <p>To easily manage the ports NGINX will use for HTTP/HTTPS traffic, create a UFW profile (feel free to use a different text editor than nano):</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo nano /etc/ufw/applications.d/nginx</span></code></pre>
    <p>Copy the text below into the file:</p>
      {{< highlight ini >}}[Nginx HTTP]
title=Web Server (Nginx, HTTP)
description=Small, but very powerful and efficient web server
ports=80/tcp

[Nginx HTTPS]
title=Web Server (Nginx, HTTPS)
description=Small, but very powerful and efficient web server
ports=443/tcp

[Nginx Full]
title=Web Server (Nginx, HTTP + HTTPS)
description=Small, but very powerful and efficient web server
ports=80,443/tcp{{< /highlight >}}
    <p>Save and close the file.</p>
  </li>
  <li>
    <p>Verify the UFW profiles for NGINX are available:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo ufw app list</span>
<span class="cmd-results">Available applications:
  Nginx Full
  Nginx HTTP
  Nginx HTTPS
  OpenSSH</span></code></pre>
  </li>
  <li>
    <p>Create a systemd unit file for NGINX:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo nano /etc/systemd/system/nginx.service</span></code></pre>
    <p>Copy the text below into the file. Verify the location of the PIDFile and NGINX binaries, these should match the settings specified in <strong>Step 13</strong>:</p>
      {{< highlight ini >}}[Unit]
Description=A high performance web server and a reverse proxy server
After=network.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t -q -g 'daemon on; master_process on;'
ExecStart=/usr/sbin/nginx -g 'daemon on; master_process on;'
ExecReload=/usr/sbin/nginx -g 'daemon on; master_process on;' -s reload
ExecStop=-/sbin/start-stop-daemon --quiet --stop --retry QUIT/5 --pidfile /run/nginx.pid
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target{{< /highlight >}}
    <p>Save and close the file.</p>
  </li>
  <li>
    <p>Remove all source code files:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo rm -rf /opt/src_files</span></code></pre>
  </li>
  <li>
    <p>Start and enable NGINX</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo systemctl start nginx.service && sudo systemctl enable nginx.service</span></code></pre>
  </li>
  <li>
    <p>Verify NGINX is running:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo systemctl status nginx.service</span>
<span class="cmd-results">● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/etc/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Thu 2018-11-29 15:08:48 UTC; 9s ago
 Main PID: 3118 (nginx)
   CGroup: /system.slice/nginx.service
           ├─3118 nginx: master process /usr/sbin/nginx -g daemon on; master_process on
           └─3119 nginx: worker process

Nov 29 15:08:48 ip-10-10-0-225 systemd[1]: Starting A high performance web server and a reverse proxy server...
Nov 29 15:08:48 ip-10-10-0-225 systemd[1]: Started A high performance web server and a reverse proxy server.</span></code></pre>
  </li>
  <li>
    <p>Reboot your server to check NGINX starts automatically:</p>
    <pre><code><span class="cmd-prompt">/opt/save $</span> <span class="cmd-input">sudo shutdown -r now</span></code></pre>
  </li>
  <li>
    <p>Log in after the reboot is complete, and verify NGINX is running:</p>
    <pre><code><span class="cmd-prompt">~$</span> <span class="cmd-input">sudo systemctl status nginx.service</span>
<span class="cmd-results">● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/etc/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Thu 2018-11-29 15:10:57 UTC; 1min 53s ago
  Process: 1150 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
  Process: 1083 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
 Main PID: 1159 (nginx)
    Tasks: 2
   Memory: 4.7M
      CPU: 31ms
   CGroup: /system.slice/nginx.service
           ├─1159 nginx: master process /usr/sbin/nginx -g daemon on; master_process on
           └─1162 nginx: worker process

Nov 29 15:10:56 ip-10-10-0-225 systemd[1]: Starting A high performance web server and a reverse proxy server...
Nov 29 15:10:57 ip-10-10-0-225 systemd[1]: Started A high performance web server and a reverse proxy server.</span></code></pre>
  </li>
</ol>

### Conclusion

Congratulations! You are now running the latest version of NGINX which includes the latest versions of the PCRE, zlib and OpenSSL libraries. Pre-built NGINX packages often include older versions of these libraries, which may contain high-severity bugs. By building NGINX from source, your web server contains the most up-to-date features of these libraries along with any bug fixes and security patches that have been released.

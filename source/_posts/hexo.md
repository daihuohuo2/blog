---
title: blog搭建流程
date: 2026-04-23 15:00:46
categories:
  - 技术回顾
tags:
  - 简单技术
---

## 记录blog搭建流程
防止自己忘记了

1.配置环境
不讲了

只要配置好hexo和node就行，网上有详细教程

2.如何启动

cmd
cd到myblog
hexo server启动
点击link(一个静态网页)
ctrl+c终止服务
如果有更新hexo clean(清除缓存)

3.配置更改

myblog\_config.yml
里面可以改一下配置，之后用到再补充吧

4.导航界面
目前有三个：归档(按时间分类)，标签(按标签分类)，分类(按类型分类)
分别在这三个文件夹下面的md文件里面修改
{% asset_img 1.png %}
之后写文章的时候可以在这个三个里面添加分类，会自动进行分类

5.hexo常见问题
(1)不显示md里面的图片文件
因为md里面的图片是本地路径，hexo生成网页的时候找不到图片
解决方法:
打开`C:\Users\20694\Desktop\myblog\_config.yml`
找到post_asset_folder: true并改正
只用在post下面新建一个和md同名的文件夹，把图片资源存里就行
并且要是用这样的路径`{% asset_img 1.png %}`

6.部署到GitHub Page
新建仓库
修改url，保证最后一个目录要到myblog这个地方，不然会导致浏览器找不到css/js的资源文件导致只剩一个html页面，从而使渲染失败
之后快速部署，终端输入：hexo clean && hexo generate && hexo deploy
点击link就可以访问GitHub Page部署的网站了

7.修改与提交
同样hexo clean && hexo generate && hexo deploy
简化版本hexo clean && hexo g && hexo d



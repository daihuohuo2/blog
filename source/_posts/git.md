---
title: git基础操作
date: 2026-04-23 19:25:59
categories:
  - 方法回顾
tags:
  - 简单技术
sticky: 0
---

# Git 基础指令速查手册

## 一、配置

```bash
# 设置用户名
git config --global user.name "你的名字"

# 设置邮箱
git config --global user.email "你的邮箱"

# 查看配置
git config --list

```

## 二.初始化仓库

```bush
# 初始化仓库
git init

# 克隆远程仓库
git clone https://github.com/用户名/仓库名.git

```

## 基本操作

```bush
# 查看状态
git status

# 添加指定文件到暂存区
git add 文件名

# 添加所有文件到暂存区
git add .

# 提交
git commit -m "提交说明"

# 查看修改内容
git diff

# 查看提交历史
git log

# 查看提交历史（简洁版）
git log --oneline

```
## 四、分支操作

```bush
# 查看所有分支
git branch

# 创建分支
git branch 新分支名

# 切换分支
git checkout 分支名

# 创建并切换分支
git checkout -b 新分支名

# 合并分支（先切到目标分支再合并）
git merge 要合并的分支名

# 删除分支
git branch -d 分支名

```

## 五、远程仓库

```bush
# 关联远程仓库
git remote add origin https://github.com/用户名/仓库名.git

# 查看远程仓库
git remote -v

# 推送到远程
git push origin main

# 第一次推送（设置上游分支）
git push --set-upstream origin main

# 强制推送（覆盖远程）
git push --force

# 拉取远程内容
git pull origin main

```

## 六、撤销操作

```bush
# 撤销工作区的修改
git checkout -- 文件名

# 撤销暂存区的文件
git reset HEAD 文件名

# 回退到某个提交
git reset --hard 提交ID

# 修改上一次提交
git commit --amend -m "新说明"

```

## 七.标签

```bush
# 查看标签
git tag

# 创建标签
git tag 标签名

# 推送标签到远程
git push origin 标签名

# 推送所有标签
git push origin --tags

```

## 八、日常流程

```bush
# 1. 写文章或改配置
# 2. 查看状态
git status

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "更新说明"

# 5. 推送到 GitHub
git push origin main

# 6. 从 GitHub 拉取更新
git pull origin main

```

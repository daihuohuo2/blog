---
title: git基础操作
date: 2026-04-23 19:25:59
categories:
  - 开发工具
tags:
  - Git
  - 版本控制
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

---

## 九、文件上传与删除详解

### 9.1 上传本地文件到远程仓库

上传文件的完整流程分三步：**添加（add）→ 提交（commit）→ 推送（push）**

```bash
# 第一步：将文件加入"暂存区"（告诉 git 你要跟踪这个文件）
git add 文件名.txt          # 添加单个文件
git add src/               # 添加整个文件夹
git add .                  # 添加当前目录下所有改动

# 第二步：提交到"本地仓库"（生成一条历史记录）
git commit -m "添加了 xxx 文件"

# 第三步：推送到远程仓库（上传到 GitHub/Gitee 等平台）
git push origin main
```

> **新手理解：** 可以把暂存区想成"待寄的快递盒"，commit 是"打包封箱"，push 是"交给快递员寄出去"。

---

### 9.2 删除仓库中的文件

#### 方式一：同时删除本地文件和仓库文件（最常用）

```bash
# 删除单个文件
git rm 文件名.txt

# 删除整个文件夹（-r 表示递归）
git rm -r 文件夹名/

# 提交删除记录
git commit -m "删除了 xxx 文件"

# 推送到远程，远程仓库中的文件也会被删除
git push origin main
```

#### 方式二：只删除仓库中的文件，保留本地文件

```bash
# --cached 表示只从 git 跟踪中移除，不删除本地磁盘上的文件
git rm --cached 文件名.txt
git rm --cached -r 文件夹名/

git commit -m "从仓库移除 xxx，但本地保留"
git push origin main
```

> **使用场景：** 不小心把密码文件、node_modules、.env 等文件提交上去了，用这个方法把它从仓库删掉，同时本地文件不受影响。

---

### 9.3 本地文件覆盖远程仓库文件

当你在本地修改了文件，想让远程仓库的版本与本地保持一致：

#### 正常情况（远程没有你没有的新提交）

```bash
git add .
git commit -m "更新了 xxx 文件"
git push origin main
```

#### 强制覆盖（远程有冲突或历史不一致时）

```bash
# ⚠️ 危险操作，会强制覆盖远程，慎用！团队项目禁止对 main 分支使用
git push --force origin main
```

#### 推荐做法：先拉取再推送，避免冲突

```bash
git pull origin main       # 先把远程的更新拉下来合并
git add .
git commit -m "更新内容"
git push origin main       # 再推送
```

---

## 十、团队协作：分支开发完整示例

### 场景描述

假设你们团队在开发一个**在线商城项目 `ShopMall`**，仓库地址为：
`https://github.com/team/ShopMall.git`

团队成员：
- **张三（队长）**：负责维护 `main` 主分支，审核合并代码
- **李四**：负责开发用户登录模块
- **王五**：负责开发商品列表模块

---

### 10.1 项目初始化（张三操作一次）

```bash
# 在本地创建项目并推送到 GitHub
mkdir ShopMall
cd ShopMall
git init
git add .
git commit -m "初始化项目"

# 关联远程仓库并推送 main 分支
git remote add origin https://github.com/team/ShopMall.git
git push -u origin main
```

---

### 10.2 队员加入项目（李四、王五各自操作）

```bash
# 克隆项目到本地
git clone https://github.com/team/ShopMall.git
cd ShopMall

# 查看当前所有分支
git branch -a
```

---

### 10.3 李四开发登录模块（在副分支上开发）

```bash
# 从 main 分支创建自己的功能分支 feature/login
git checkout -b feature/login

# 开始写代码...（新建 login.js、修改 index.html 等）

# 查看改了哪些文件
git status

# 将改动加入暂存区
git add login.js
git add index.html

# 提交，写清楚做了什么
git commit -m "feat: 完成用户登录表单和基本验证"

# 继续开发，多次提交
# ...

# 开发完毕，把本地的 feature/login 分支推送到远程
git push origin feature/login
```

---

### 10.4 王五开发商品列表模块（同时进行）

```bash
# 王五也从最新的 main 分支创建自己的分支
git checkout main
git pull origin main          # 先更新本地 main，确保是最新的
git checkout -b feature/product-list

# 写代码...
git add product-list.js
git commit -m "feat: 完成商品列表展示和分页"

# 推送到远程
git push origin feature/product-list
```

---

### 10.5 提交 Pull Request，张三审核合并

李四和王五在 GitHub 上分别对 `main` 分支发起 **Pull Request（PR）**。

张三审核代码后，点击 **Merge Pull Request**，将 `feature/login` 和 `feature/product-list` 合并进 `main`。

---

### 10.6 队员同步最新的 main 分支

功能合并进 main 后，所有人都应该更新本地的 main：

```bash
# 切回 main 分支
git checkout main

# 拉取远程最新内容
git pull origin main

# 如果要继续开发新功能，再从最新 main 创建新分支
git checkout -b feature/order
```

---

### 10.7 处理冲突（当两个人改了同一个文件）

假设李四和王五都修改了 `utils.js`，合并时会产生冲突：

```bash
# 王五在推送前先拉取最新 main
git pull origin main

# git 会提示冲突，打开冲突文件，内容类似：
# <<<<<<< HEAD
# 王五的代码
# =======
# 李四的代码
# >>>>>>> feature/login

# 手动编辑文件，保留正确的内容，删除冲突标记

# 解决后重新提交
git add utils.js
git commit -m "fix: 解决 utils.js 合并冲突"
git push origin feature/product-list
```

---

### 10.8 分支开发流程总结图

```
main ──────────────────────────────────────────► 稳定版本
       │                 ▲               ▲
       │  创建分支        │  李四 PR 合并  │  王五 PR 合并
       ▼                 │               │
feature/login ──────────┘               │
       │                                │
       └─► feature/product-list ────────┘
```

**核心原则：**
1. `main` 分支永远保持稳定，不直接在上面写代码
2. 每个新功能/修复都开一个独立分支
3. 开发完成后通过 PR 合并，由负责人审核
4. 合并后及时同步 `main`，避免分支落后太多导致大量冲突

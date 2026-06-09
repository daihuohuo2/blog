---
title: iptables 安全加固实验——Web 服务器与运维机器防护策略
date: 2026-05-16
categories:
  - 网络安全
tags:
  - iptables
  - Linux
  - 防火墙
sticky: 0
---

## 实验概述

本实验模拟真实企业内网环境，通过 iptables 对 Web 服务器和运维机器进行安全加固，防止攻击者扫描漏洞、爆破密码和远控钓鱼。

---

## 网络拓扑

| 机器 | 账号 | IP |
|------|------|----|
| Web 服务器 | root/root | 10.10.31.52（内网）、202.197.71.52（公网） |
| 运维机器 | root/userpc | 10.10.31.51 |
| 攻击机器 | root/attackpc | 202.197.71.100 |

- **DMZ 区域网段**：10.10.31.0/24（内网）
- **公网模拟网段**：202.197.71.0/24

Web 服务器同时暴露在公网和内网，运维机器只在内网，攻击机器只在公网。

---

## 环境搭建

### 前提

虚拟机已安装 Docker 和 docker-compose。

### 启动实验环境

```bash
cd /home/daihuohuo/桌面
docker-compose -p lab2 -f docker-compose.yaml up -d
```

> **注意**：如果 docker-compose.yaml 中 `202.197.71.1/24` 写成了子网地址，会报错  
> `invalid subnet 202.197.71.1/24: it should be 202.197.71.0/24`  
> 需修正为 `202.197.71.0/24`：
> ```bash
> sed -i 's/subnet: 202.197.71.1\/24/subnet: 202.197.71.0\/24/' docker-compose.yaml
> docker-compose -p lab2 -f docker-compose.yaml up -d
> ```

启动后验证三个容器正在运行：

```bash
docker ps
```

输出示例：
```
CONTAINER ID   IMAGE        COMMAND        PORTS
xxxxxxxx       lab2:user    "/start.sh"    0.0.0.0:2223->22/tcp   lab2-user
xxxxxxxx       lab2:attack  "/start.sh"    0.0.0.0:2222->22/tcp   lab2-attack
xxxxxxxx       lab2:web     "/start.sh"    0.0.0.0:2224->22/tcp   lab2-web
```

### 登录各机器方式

```bash
# 登录 Web 服务器（密码：root）
ssh -p 2224 root@127.0.0.1

# 登录运维机器（密码：userpc）
ssh -p 2223 root@127.0.0.1

# 登录攻击机器（密码：attackpc）
ssh -p 2222 root@127.0.0.1
```

若 SSH 被 iptables 封锁后无法登录，可用 docker 直接进入：

```bash
docker exec -it lab2-user bash
docker exec -it lab2-web bash
docker exec -it lab2-attack bash
```

---

## 加固前的漏洞状态

在攻击机器上运行 fscan 扫描 Web 服务器：

```bash
# 登录攻击机器
ssh -p 2222 root@127.0.0.1
# 执行扫描
/root/fscan -h 202.197.71.52
```

扫描结果（加固前）：
```
202.197.71.52:22 open
202.197.71.52:80 open
202.197.71.52:3306 open
[+] mysql 202.197.71.52:3306:root root       ← 数据库弱口令
[+] SSH 202.197.71.52:22:root root           ← SSH 弱口令
```

可以看到，3306 数据库和 22 端口都暴露在公网且存在弱口令漏洞。

---

## 加固任务一：限制 MariaDB 3306 端口只允许本地访问

### 目标

Web 服务器运行 MariaDB，3306 端口不能被外部访问，只允许本机 `127.0.0.1` 访问。

### 操作步骤

登录 Web 服务器：

```bash
ssh -p 2224 root@127.0.0.1
# 密码：root
```

添加 iptables 规则：

```bash
# 允许本地 127.0.0.1 访问 3306
iptables -A INPUT -p tcp --dport 3306 -s 127.0.0.1 -j ACCEPT

# 拒绝所有其他来源对 3306 的访问
iptables -A INPUT -p tcp --dport 3306 -j DROP
```

### 验证加固效果

**攻击机器扫描 3306（应无法发现）**：

```bash
/root/fscan -h 202.197.71.52 -p 3306
# 结果：alive ports len is: 0  ← 端口不可见
```

**Web 服务器本地访问 MariaDB（应正常连接）**：

```bash
mysql -h 127.0.0.1 -uroot -p
# 输入密码：root
# 成功进入 MariaDB 命令行
```

---

## 加固任务二：限制 SSH 22 端口只允许运维机器访问

### 目标

Web 服务器的 22 端口只能被运维机器（10.10.31.51）访问，阻止攻击者爆破 SSH。

### 操作步骤

在 Web 服务器上执行（接上面的 SSH 会话）：

```bash
# 允许运维机器 IP 访问 22 端口
iptables -A INPUT -p tcp --dport 22 -s 10.10.31.51 -j ACCEPT

# 拒绝所有其他来源对 22 的访问
iptables -A INPUT -p tcp --dport 22 -j DROP
```

查看当前所有规则：

```bash
iptables -L INPUT -n --line-numbers
```

输出结果应如下：

```
Chain INPUT (policy ACCEPT)
num  target  prot  source          destination
1    ACCEPT  tcp   127.0.0.1       0.0.0.0/0    tcp dpt:3306
2    DROP    tcp   0.0.0.0/0       0.0.0.0/0    tcp dpt:3306
3    ACCEPT  tcp   10.10.31.51     0.0.0.0/0    tcp dpt:22
4    DROP    tcp   0.0.0.0/0       0.0.0.0/0    tcp dpt:22
```

### 验证加固效果

**攻击机器扫描 22 端口（应无法发现）**：

```bash
/root/fscan -h 202.197.71.52 -p 22
# 结果：alive ports len is: 0  ← SSH 端口不可见
```

**运维机器登录 Web 服务器（应正常 SSH）**：

```bash
# 在运维机器上执行
ssh root@10.10.31.52
# 密码：root
# 成功登录 lab2-web
```

---

## 加固任务三：限制运维机器只能访问 Web 服务器，防止钓鱼上线

### 目标

- 运维机器**对外只能访问 Web 服务器**（10.10.31.0/24 网段），不能访问外网
- 运维机器的 22 端口**只允许 10.10.31.0/24 网段**连接

### 操作步骤

登录运维机器：

```bash
ssh -p 2223 root@127.0.0.1
# 密码：userpc
```

添加 iptables 规则：

```bash
# INPUT：放行已建立的连接（用于接收响应包）
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# INPUT：只允许内网段 10.10.31.0/24 连接 SSH 22 端口
iptables -A INPUT -p tcp --dport 22 -s 10.10.31.0/24 -j ACCEPT

# INPUT：拒绝其他来源访问 22 端口
iptables -A INPUT -p tcp --dport 22 -j DROP

# OUTPUT：放行已建立连接的回包
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# OUTPUT：允许访问内网网段（Web 服务器所在网段）
iptables -A OUTPUT -d 10.10.31.0/24 -j ACCEPT

# OUTPUT：拒绝访问所有其他目标（外网）
iptables -A OUTPUT -j DROP
```

### 验证加固效果

**运维机器访问百度（应失败）**：

```bash
curl https://www.baidu.com
# 结果：无响应 / 连接超时  ← 外网已封锁
```

**运维机器访问 Web 服务器（应成功）**：

```bash
curl http://10.10.31.52
# 结果：返回 Apache Debian Default Page HTML ← 正常访问
```

---

## 最终验证汇总

对攻击机器执行全面扫描：

```bash
/root/fscan -h 202.197.71.52
```

加固后结果：

```
[*] alive ports len is: 0
已完成 0/0
[*] 扫描结束
```

三个加固任务效果确认：

| 加固项 | 加固前 | 加固后 |
|--------|--------|--------|
| 3306 端口 | 公网可访问，存在弱口令 | 仅 127.0.0.1 可访问 |
| 22 端口（Web） | 公网可访问，存在弱口令 | 仅运维机 10.10.31.51 可访问 |
| 运维机出站 | 可访问任意外网 | 仅可访问 10.10.31.0/24 |

---

## 规则清除（实验结束后恢复）

如需清空所有 iptables 规则恢复默认状态：

```bash
iptables -F
iptables -X
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT
```

---

## 知识点总结

### iptables 基本语法

```bash
iptables -A <链> -p <协议> --dport <端口> -s <来源IP> -j <动作>
```

- `-A`：追加规则到链末尾（规则按顺序匹配，先匹配先生效）
- `-p tcp`：匹配 TCP 协议
- `--dport`：目标端口
- `-s`：来源 IP 或网段
- `-d`：目标 IP 或网段
- `-j ACCEPT`：允许
- `-j DROP`：静默丢弃（对方不会收到拒绝通知，更安全）
- `-m state --state ESTABLISHED,RELATED`：匹配已建立的连接（出站限制时必须加，否则连响应包都会被拦截）

### 关键注意点

1. **规则顺序很重要**：ACCEPT 规则必须放在 DROP 规则前面，否则允许规则永远不会被匹配到
2. **出站限制要放行 ESTABLISHED**：如果只 DROP 出站，服务器发出的 TCP 握手包和数据包都会被拦截，已建立连接也会断开
3. **iptables 规则重启后失效**：容器/机器重启后规则会消失，生产环境需用 `iptables-save` / `iptables-restore` 持久化

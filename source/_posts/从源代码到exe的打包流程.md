---
title: 从源代码到exe的打包流程
date: 2026-05-20 13:40:00
categories:
  - 编程实践
tags:
  - 编译
  - exe打包
  - Windows
sticky: 0
---

## 一、什么是“把程序包装成 exe”

平时说“把程序包装成 exe”，本质上是把源代码变成操作系统能启动的可执行文件。

以这次 UDP 广播工具为例：

```text
UdpBroadcastSingleExe.cs
  ↓
UdpBroadcastTool.exe
```

源代码是人能读懂的文本，exe 是 Windows 能加载运行的可执行程序。

## 二、一个程序从源码到运行的大流程

通用理解可以分成几步：

```text
源代码
  ↓
预处理/语法分析
  ↓
编译
  ↓
汇编
  ↓
链接
  ↓
生成可执行文件
  ↓
加载运行
```

不过不同语言细节不同。

## 三、C/C++ 的典型流程

C/C++ 更接近传统的“编译、汇编、链接”过程：

```text
hello.c
  ↓ 预处理
hello.i
  ↓ 编译
hello.s
  ↓ 汇编
hello.o
  ↓ 链接
hello.exe
```

各阶段含义：

| 阶段 | 输入 | 输出 | 作用 |
|---|---|---|---|
| 预处理 | `.c` | `.i` | 展开头文件、宏定义、条件编译 |
| 编译 | `.i` | `.s` | 把高级语言翻译成汇编代码 |
| 汇编 | `.s` | `.o/.obj` | 把汇编翻译成机器码目标文件 |
| 链接 | `.o/.obj` | `.exe` | 合并目标文件和库，生成可执行文件 |

简单说：

```text
编译：人类代码 → 汇编
汇编：汇编 → 机器码
链接：多个机器码文件 + 库 → exe
```

## 四、C#/.NET 的流程

这次 UDP 广播工具是 C# 写的，它的流程不完全一样。

实际过程更像：

```text
C# 源码 .cs
  ↓ csc 编译器
IL 中间语言 + 元数据
  ↓ 写入 PE 文件格式
.exe
  ↓ 程序运行时 CLR 加载
JIT 编译成本机机器码
  ↓ CPU 执行
```

其中：

| 名称 | 说明 |
|---|---|
| C# 源码 | 程序员写的 `.cs` 文件 |
| csc | C# 编译器 |
| IL | Intermediate Language，中间语言 |
| 元数据 | 类、方法、引用库等信息 |
| PE 文件 | Windows 可执行文件格式，exe 就是 PE 文件 |
| CLR | .NET 公共语言运行时 |
| JIT | Just-In-Time，即时编译器，运行时把 IL 编译成机器码 |

所以 C# 里通常没有一个必须手动执行的“汇编”步骤。它不是先生成 `.asm`，而是先生成 IL，再由运行时 JIT 生成机器码。

## 五、这次 UDP 广播工具的源码组成

源码文件：

```text
C:\Users\20694\Desktop\myblog\UdpBroadcastSingleExe.cs
```

程序由三部分组成：

| 部分 | 作用 |
|---|---|
| `Program` | 程序入口，启动 WinForms 界面 |
| `BroadcastTarget` | 保存广播地址和显示文本 |
| `MainForm` | 主窗口，包含 UI、发送、接收、日志逻辑 |

结构：

```text
Program.Main()
  ↓
MainForm()
  ↓
BuildUi()
  ↓
LoadBroadcastAddresses()
```

用户点击按钮后：

```text
发送广播按钮
  ↓
btnSend_Click()
  ↓
UdpClient.SendAsync()
```

用户点击监听后：

```text
开始监听按钮
  ↓
btnListen_Click()
  ↓
UdpClient.Bind()
  ↓
ReceiveAsync()
  ↓
显示到日志框
```

## 六、为什么这个程序能做成单文件 exe

这次使用的是 .NET Framework 自带的编译器：

```text
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe
```

它编译时引用的是 Windows/.NET Framework 自带的基础库：

```text
System.dll
System.Core.dll
System.Drawing.dll
System.Windows.Forms.dll
```

这些库一般 Windows 上已经有，所以我们只需要输出一个自己的 exe 文件。

如果使用较新的 .NET 8/.NET 10，也可以打包，但通常会遇到两种情况：

| 方式 | 特点 |
|---|---|
| framework-dependent | exe 依赖本机安装的 .NET 运行时 |
| self-contained | 把运行时也一起打进去，文件更大 |

本次为了简单、单文件、离线可编译，选择了 .NET Framework `csc.exe`。

## 七、实际编译命令

完整命令：

```powershell
& 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe' `
  /nologo `
  /target:winexe `
  /out:C:/Users/20694/Desktop/myblog/UdpBroadcastTool.exe `
  /reference:System.dll `
  /reference:System.Core.dll `
  /reference:System.Drawing.dll `
  /reference:System.Windows.Forms.dll `
  C:/Users/20694/Desktop/myblog/UdpBroadcastSingleExe.cs
```

命令解释：

| 参数 | 解释 |
|---|---|
| `csc.exe` | C# 编译器 |
| `/target:winexe` | 生成 Windows 窗口程序 |
| `/out:...` | 指定输出文件名 |
| `/reference:...` | 指定程序需要使用的系统库 |
| `.cs` 文件 | 要编译的源码 |

生成结果：

```text
C:\Users\20694\Desktop\myblog\UdpBroadcastTool.exe
```

复制到下载目录：

```powershell
Copy-Item `
  -LiteralPath 'C:\Users\20694\Desktop\myblog\UdpBroadcastTool.exe' `
  -Destination 'D:\下载\UdpBroadcastTool.exe' `
  -Force
```

## 八、编译器内部大概做了什么

以 C# 编译器为例，可以简单理解为：

1. 读取 `.cs` 源文件
2. 进行词法分析，把文本切成关键字、变量名、符号等 token
3. 进行语法分析，判断代码结构是否合法
4. 进行语义分析，检查类型、方法调用、引用库等是否正确
5. 生成 IL 中间语言
6. 把 IL、元数据、资源信息写入 PE 格式
7. 输出 exe 文件

这个 exe 里面并不全是最终机器码，它主要包含：

| 内容 | 说明 |
|---|---|
| PE 头 | Windows 用来识别可执行文件 |
| CLR 头 | 表示这是 .NET 程序 |
| IL 代码 | C# 编译后的中间语言 |
| 元数据 | 类、方法、字段、引用信息 |
| 清单信息 | 程序运行需要的基本信息 |

## 九、运行时发生了什么

双击 exe 后：

```text
Windows 加载 exe
  ↓
发现它是 .NET 程序
  ↓
启动 CLR
  ↓
CLR 读取 IL 和元数据
  ↓
JIT 把即将执行的方法编译成机器码
  ↓
CPU 执行机器码
```

例如 `btnSend_Click()` 第一次被调用时，JIT 会把它对应的 IL 编译成本机机器码，然后执行。

## 十、和“汇编”的关系

传统 C/C++ 中，汇编阶段很明显：

```text
.s 汇编文件 → 汇编器 → .obj 目标文件
```

C# 中通常看不到 `.s` 或 `.asm` 文件。它的中间结果是 IL，不是 CPU 汇编。

可以这样类比：

| 传统 C/C++ | C#/.NET |
|---|---|
| C 源码 | C# 源码 |
| 汇编代码 `.s` | IL 中间语言 |
| 汇编器生成 `.obj` | csc 生成 exe 中的 IL |
| 链接器生成 exe | csc 直接生成 .NET exe |
| 运行时直接跑机器码 | 运行时 JIT 成机器码 |

所以如果老师问“有没有汇编过程”，可以回答：

> C# 程序没有像 C/C++ 那样显式生成汇编文件的步骤。C# 编译器先把源码编译成 IL 中间语言并放进 exe，程序运行时 CLR 的 JIT 编译器再把 IL 编译成 CPU 能执行的机器码。

## 十一、为什么选择 WinForms

这次选择 WinForms 的原因：

1. Windows 自带支持比较好。
2. 做简单工具界面很快。
3. 可以直接用按钮、输入框、日志框。
4. 配合 .NET Framework 的 `csc.exe` 可以很容易生成 exe。

如果用 WPF、Avalonia、Electron，也能做 UI，但打包会更复杂，文件也更大。

## 十二、这个例子的完整打包路线

最终路线：

```text
确定需求：UDP 广播发送和接收
  ↓
选择技术：C# + WinForms + UdpClient
  ↓
编写源码：UdpBroadcastSingleExe.cs
  ↓
检查系统编译器：csc.exe
  ↓
执行编译命令
  ↓
生成 UdpBroadcastTool.exe
  ↓
复制到 D:\下载
  ↓
双击运行测试
```

如果以后要包装其他小工具，也可以套这个流程：

1. 明确程序输入、输出、按钮功能。
2. 用 WinForms 写一个窗口。
3. 把核心功能写到按钮事件里。
4. 用 `csc.exe /target:winexe` 编译。
5. 把生成的 exe 放到目标目录。
6. 双击测试。

## 十三、常见问题

### 1. 为什么双击没有黑窗口？

因为编译时用了：

```text
/target:winexe
```

它表示生成 Windows 图形界面程序。如果用 `/target:exe`，可能会出现控制台窗口。

### 2. 为什么不用 Visual Studio？

这个程序很小，一个 `.cs` 文件就能完成。用命令行编译更方便说明整个过程。

### 3. 为什么 exe 只有十几 KB？

因为它没有把 .NET Framework 系统库打进去，只保存自己的 IL 和元数据。运行时使用系统已有的 .NET Framework。

### 4. UDP 广播为什么可能收不到？

常见原因：

| 原因 | 解决方法 |
|---|---|
| 防火墙拦截 | 允许程序访问局域网 |
| 端口不一致 | 发送端和接收端都用同一个端口 |
| 不在同一局域网 | 确认两台电脑网络连通 |
| 路由器隔离广播 | 换同一网段或关闭 AP 隔离 |
| 广播地址不合适 | 选择具体网卡的子网广播地址 |


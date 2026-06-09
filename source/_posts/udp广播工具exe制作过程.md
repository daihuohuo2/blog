---
title: UDP 广播工具
date: 2026-05-20 15:39:46
categories:
  - 编程实践
tags:
  - CSharp
  - UDP
  - Windows Forms
sticky: 0
---

## 一、程序目标

这次做的是一个 Windows 桌面 UDP 广播工具，最终生成了一个可以双击运行的 exe：

```text
D:\下载\UdpBroadcastTool.exe
```

程序功能比较简单：

| 功能 | 说明 |
|---|---|
| 发送广播 | 把输入框中的内容用 UDP 广播发出去 |
| 接收广播 | 监听指定端口，显示收到的 UDP 消息 |
| 选择端口 | 默认端口是 3000，也可以自己修改 |
| 自动获取广播地址 | 支持 255.255.255.255，也能根据本机网卡计算子网广播地址 |
| UI 界面 | 使用 Windows Forms 做图形界面 |

核心广播代码的思想类似：

```csharp
IPEndPoint endPoint = new IPEndPoint(IPAddress.Broadcast, 3000);
client.EnableBroadcast = true;
client.Send(data, data.Length, endPoint);
```

实际程序中不只支持 `IPAddress.Broadcast`，还会根据本机 IP 和子网掩码算出子网广播地址。

## 二、源代码结构

本程序为了方便打成单个 exe，源码集中在一个文件中：

```text
C:\Users\20694\Desktop\myblog\UdpBroadcastSingleExe.cs
```

主要结构如下：

```text
Program
└── Main()
    └── Application.Run(new MainForm())

BroadcastTarget
├── Label
└── Address

MainForm
├── BuildUi()
├── LoadBroadcastAddresses()
├── GetBroadcastAddress()
├── btnSend_Click()
├── btnListen_Click()
├── TryGetPort()
├── StopListening()
└── Log()
```

## 三、入口逻辑

程序入口是 `Main()`：

```csharp
[STAThread]
private static void Main()
{
    Application.EnableVisualStyles();
    Application.SetCompatibleTextRenderingDefault(false);
    Application.Run(new MainForm());
}
```

含义：

| 代码 | 作用 |
|---|---|
| `[STAThread]` | Windows Forms 程序常用要求，表示 UI 线程使用单线程单元模型 |
| `EnableVisualStyles()` | 让控件使用现代 Windows 样式 |
| `SetCompatibleTextRenderingDefault(false)` | 使用默认 GDI+ 文本渲染 |
| `Application.Run(new MainForm())` | 创建并显示主窗口，开始消息循环 |

这里的“消息循环”就是 UI 程序一直等待按钮点击、窗口关闭、文本输入等事件。

## 四、UI 界面逻辑

界面是在 `BuildUi()` 里手写创建的，没有用设计器。

主要控件：

| 控件 | 变量名 | 作用 |
|---|---|---|
| 端口输入框 | `txtPort` | 输入 UDP 端口，默认 3000 |
| 广播地址下拉框 | `cmbAddress` | 选择广播地址 |
| 消息输入框 | `txtMessage` | 输入要发送的内容 |
| 日志框 | `txtLog` | 显示发送和接收记录 |
| 发送按钮 | `btnSend` | 点击后发送 UDP 广播 |
| 监听按钮 | `btnListen` | 开始或停止监听 |
| 刷新网卡按钮 | `btnRefresh` | 重新读取本机网卡和广播地址 |

按钮事件绑定：

```csharp
btnSend.Click += btnSend_Click;
btnListen.Click += btnListen_Click;
btnRefresh.Click += delegate { LoadBroadcastAddresses(); };
```

意思是：用户点击按钮时，自动调用对应函数。

## 五、广播地址获取逻辑

程序启动时会执行：

```csharp
LoadBroadcastAddresses();
```

它做了几件事：

1. 先加入通用广播地址 `255.255.255.255`
2. 枚举本机所有网卡
3. 只选择已经启用的网卡
4. 只处理 IPv4 地址
5. 根据 IP 地址和子网掩码计算子网广播地址
6. 把结果显示到下拉框中

关键代码：

```csharp
foreach (NetworkInterface network in NetworkInterface.GetAllNetworkInterfaces())
{
    if (network.OperationalStatus != OperationalStatus.Up)
    {
        continue;
    }

    IPInterfaceProperties props = network.GetIPProperties();
    foreach (UnicastIPAddressInformation address in props.UnicastAddresses)
    {
        if (address.Address.AddressFamily != AddressFamily.InterNetwork || address.IPv4Mask == null)
        {
            continue;
        }

        IPAddress broadcast = GetBroadcastAddress(address.Address, address.IPv4Mask);
    }
}
```

计算广播地址的公式是：

```text
广播地址 = IP地址 | ~子网掩码
```

例如：

```text
IP地址：192.168.1.23
子网掩码：255.255.255.0
广播地址：192.168.1.255
```

代码实现：

```csharp
private static IPAddress GetBroadcastAddress(IPAddress ipAddress, IPAddress subnetMask)
{
    byte[] ip = ipAddress.GetAddressBytes();
    byte[] mask = subnetMask.GetAddressBytes();
    byte[] broadcast = new byte[ip.Length];

    for (int i = 0; i < broadcast.Length; i++)
    {
        broadcast[i] = (byte)(ip[i] | ~mask[i]);
    }

    return new IPAddress(broadcast);
}
```

## 六、发送广播逻辑

点击“发送广播”按钮后，会进入：

```csharp
btnSend_Click()
```

主要流程：

1. 读取端口
2. 检查端口是否合法
3. 获取当前选择的广播地址
4. 读取输入框中的消息
5. 把字符串转成 UTF-8 字节数组
6. 创建 `UdpClient`
7. 开启广播发送
8. 发送数据
9. 在日志框显示发送记录

关键代码：

```csharp
byte[] data = Encoding.UTF8.GetBytes(message);
using (UdpClient client = new UdpClient())
{
    client.EnableBroadcast = true;
    IPEndPoint endPoint = new IPEndPoint(target.Address, port);
    await client.SendAsync(data, data.Length, endPoint);
    Log(string.Format("发送到 {0}: {1}", endPoint, message));
}
```

重点：

| 代码 | 作用 |
|---|---|
| `Encoding.UTF8.GetBytes(message)` | 把字符串转为网络可发送的字节 |
| `UdpClient` | .NET 封装好的 UDP 通信类 |
| `EnableBroadcast = true` | 允许发送广播 |
| `IPEndPoint` | 表示目标 IP 和端口 |
| `SendAsync` | 异步发送，不阻塞 UI |

## 七、接收广播逻辑

点击“开始监听”按钮后，会进入：

```csharp
btnListen_Click()
```

主要流程：

1. 如果已经在监听，再点按钮就停止监听
2. 检查端口是否合法
3. 创建 `UdpClient`
4. 绑定到 `IPAddress.Any` 和指定端口
5. 循环接收 UDP 数据
6. 把收到的字节转成字符串
7. 显示到日志框

关键代码：

```csharp
listener = new UdpClient();
listener.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
listener.Client.Bind(new IPEndPoint(IPAddress.Any, port));
```

这里 `IPAddress.Any` 表示监听本机所有网卡。

接收数据：

```csharp
UdpReceiveResult result = await Task.Run(
    function: () => listener.ReceiveAsync().Result,
    cancellationToken: listenCts.Token
);
string message = Encoding.UTF8.GetString(result.Buffer);
Log(string.Format("收到 {0}: {1}", result.RemoteEndPoint, message));
```

因为接收 UDP 是阻塞操作，所以放到后台任务里，避免卡住 UI 界面。

## 八、停止监听逻辑

停止监听函数是：

```csharp
private void StopListening()
{
    if (listenCts != null)
    {
        listenCts.Cancel();
        listenCts.Dispose();
        listenCts = null;
    }

    if (listener != null)
    {
        listener.Close();
        listener = null;
    }

    btnListen.Text = "开始监听";
}
```

它负责：

| 操作 | 说明 |
|---|---|
| `Cancel()` | 通知监听循环停止 |
| `Dispose()` | 释放取消令牌资源 |
| `Close()` | 关闭 UDP socket |
| 修改按钮文字 | UI 回到“开始监听”状态 |

## 九、编译和生成 exe

这次没有使用 Visual Studio，而是直接用 Windows 自带的 C# 编译器 `csc.exe` 编译。

编译器位置：

```text
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe
```

使用的编译命令：

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

参数说明：

| 参数 | 含义 |
|---|---|
| `/nologo` | 编译时不显示版权头 |
| `/target:winexe` | 生成 Windows 图形界面程序，不弹出控制台 |
| `/out:...` | 指定输出 exe 文件路径 |
| `/reference:System.dll` | 引用基础系统库 |
| `/reference:System.Core.dll` | 引用 LINQ、Task 等基础扩展库 |
| `/reference:System.Drawing.dll` | 引用绘图和字体相关库 |
| `/reference:System.Windows.Forms.dll` | 引用 WinForms UI 库 |
| `UdpBroadcastSingleExe.cs` | 源代码文件 |

编译成功后生成：

```text
C:\Users\20694\Desktop\myblog\UdpBroadcastTool.exe
```

然后复制到下载目录：

```powershell
Copy-Item `
  -LiteralPath 'C:\Users\20694\Desktop\myblog\UdpBroadcastTool.exe' `
  -Destination 'D:\下载\UdpBroadcastTool.exe' `
  -Force
```

最终文件：

```text
D:\下载\UdpBroadcastTool.exe
```

## 十、关于“编译、汇编、打包”的说明

这个程序是 C# 写的，所以流程和 C/C++ 不完全一样。

大致过程：

```text
C# 源码
  ↓ csc 编译
IL 中间语言 + 元数据
  ↓ 打包成 PE 格式
exe 文件
  ↓ 运行时由 .NET CLR/JIT
机器码
  ↓ CPU 执行
```

也就是说：

| 阶段 | C/C++ 常见流程 | C#/.NET 流程 |
|---|---|---|
| 源码 | `.c/.cpp` | `.cs` |
| 编译 | 生成汇编或目标文件 | 生成 IL 中间语言 |
| 汇编 | 汇编成机器码目标文件 | 通常没有单独手写汇编阶段 |
| 链接 | 链接成 exe | csc 直接生成 .NET exe |
| 运行 | 直接执行机器码 | CLR 加载 exe，JIT 编译成机器码 |

所以这里说“汇编”时，可以理解为：C# 编译器不会像 C 语言那样先生成给人看的 `.asm` 文件，而是生成 IL；真正的机器码是在程序运行时由 JIT 编译器生成。

## 十一、运行注意事项

1. 两台电脑要在同一个局域网。
2. 发送端和接收端端口要一致，例如都用 `3000`。
3. Windows 防火墙弹窗时要允许访问局域网。
4. 如果 `255.255.255.255` 不好用，可以选择下拉框里的具体子网广播地址。
5. UDP 不保证一定送达，适合简单广播通知，不适合可靠文件传输。


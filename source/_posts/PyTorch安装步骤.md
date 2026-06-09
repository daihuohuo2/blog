---
title: PyTorch安装步骤
date: 2026-05-23 15:30:00
categories:
  - 机器学习
tags:
  - PyTorch
  - Conda
  - 环境配置
sticky: 0
---

# PyTorch 安装步骤：使用 conda 环境管理

这篇文章记录如何把 PyTorch 安装到单独的 conda 环境中，方便后续管理、删除、迁移和在 Jupyter Notebook 中使用。

官方安装页面：

- PyTorch 官网安装选择器：https://pytorch.org/get-started/locally/
- PyTorch 官方文档安装页：https://docs.pytorch.org/get-started/locally/

## 一、为什么建议放进 conda 环境

不要把 PyTorch 直接装进全局 Python 或 Anaconda 的 `base` 环境。更推荐单独创建一个环境，例如 `pytorch`。

这样做的好处：

- 不污染 `base` 环境
- 不同项目可以使用不同 Python 和 PyTorch 版本
- 装错了可以直接删除环境重来
- Jupyter Notebook 可以绑定这个环境作为独立内核
- 后面安装 `numpy`、`matplotlib`、`scikit-learn` 等包也更清晰

## 二、检查本机环境

打开 PowerShell 或 Anaconda Prompt。

### 1. 查看 conda 是否可用

```powershell
conda --version
```

本机当前结果：

```text
conda 25.11.1
```

### 2. 查看已有 conda 环境

```powershell
conda env list
```

本机当前已有环境：

```text
base                 *   D:\Anaconda
                         c:\Users\20694\Desktop\code\.conda
```

### 3. 查看 Python 版本

```powershell
python --version
```

本机当前 `base` 环境结果：

```text
Python 3.13.9
```

PyTorch 官网当前说明支持 Python 3.10 到 3.14。为了兼容性和教程稳定性，学习阶段推荐在 conda 环境中使用 Python 3.12。

### 4. 查看显卡驱动

如果有 NVIDIA 显卡，执行：

```powershell
nvidia-smi
```

本机检测到：

```text
GPU: NVIDIA GeForce RTX 4060 Laptop GPU
Driver Version: 595.71
CUDA Version: 13.2
```

注意：`nvidia-smi` 里的 CUDA Version 表示显卡驱动最高支持的 CUDA 运行环境版本，不代表 PyTorch 必须安装 CUDA 13.2。  
PyTorch 的 pip 安装包通常自带 CUDA runtime，所以安装命令应该以官网安装选择器为准。

## 三、创建 PyTorch 专用 conda 环境

### 方案 A：创建到 conda 默认环境目录

如果 conda 默认环境目录有写入权限，直接执行：

```powershell
conda create -n pytorch python=3.12 -y
conda activate pytorch
```

解释：

- `-n pytorch` 表示环境名字叫 `pytorch`
- `python=3.12` 表示环境里安装 Python 3.12
- `-y` 表示自动确认安装

激活成功后，命令行前面一般会出现：

```text
(pytorch)
```

### 方案 B：创建到当前项目目录

如果出现下面这种错误：

```text
NoWritableEnvsDirError: No writeable envs directories configured.
```

说明 conda 没有权限写默认环境目录。可以把环境创建到当前项目目录下面：

```powershell
conda create -p C:\Users\20694\Desktop\myblog\.conda\pytorch python=3.12 -y
conda activate C:\Users\20694\Desktop\myblog\.conda\pytorch
```

这种方式也完全是 conda 环境，只是不用环境名激活，而是用完整路径激活。

如果以后要删除这个环境，可以执行：

```powershell
conda env remove -p C:\Users\20694\Desktop\myblog\.conda\pytorch
```

## 四、升级 pip

激活 conda 环境后，先升级 pip：

```powershell
python -m pip install --upgrade pip
```

确认当前 Python 来自新环境：

```powershell
where python
python --version
python -m pip --version
```

如果使用的是项目内环境，`where python` 应该优先显示类似：

```text
C:\Users\20694\Desktop\myblog\.conda\pytorch\python.exe
```

## 五、安装 PyTorch

PyTorch 官方现在推荐通过官网选择器生成安装命令。虽然我们用 conda 管环境，但在环境内部安装 PyTorch 时仍然可以使用 pip，这是最常见、最直接的方式。

打开官网：

https://pytorch.org/get-started/locally/

选择：

```text
PyTorch Build: Stable
Your OS: Windows
Package: Pip
Language: Python
Compute Platform: CUDA 12.8 或官网当前推荐版本
```

### 1. NVIDIA GPU 版本

本机有 RTX 4060 Laptop GPU，优先推荐安装 CUDA 版。官网当前如果推荐 CUDA 12.8，可以执行：

```powershell
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

如果官网选择器给出的是 CUDA 11.8，则执行：

```powershell
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

重点：

- 不要根据 `nvidia-smi` 的 CUDA 13.2 自己写 `cu132`
- 以 PyTorch 官网生成的命令为准
- PyTorch CUDA 版 wheel 通常自带 CUDA runtime，不需要单独安装完整 CUDA Toolkit

### 2. CPU 版本

如果只是学习基础语法，也可以安装 CPU 版：

```powershell
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

CPU 版更容易安装，但训练速度会慢一些。

## 六、验证安装

安装完成后，先确认包已经存在：

```powershell
python -m pip show torch torchvision torchaudio
```

再检查 PyTorch 是否能导入：

```powershell
python -c "import torch; print(torch.__version__)"
```

检查 CUDA 是否可用：

```powershell
python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('CUDA version:', torch.version.cuda); print('Device count:', torch.cuda.device_count())"
```

如果 GPU 版安装成功，理想输出类似：

```text
CUDA available: True
CUDA version: 12.8
Device count: 1
```

查看显卡名字：

```powershell
python -c "import torch; print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CUDA不可用')"
```

## 七、运行最小测试程序

可以直接在命令行执行：

```powershell
python -c "import torch; device=torch.device('cuda' if torch.cuda.is_available() else 'cpu'); x=torch.randn(3,4,device=device); w=torch.randn(4,2,device=device); y=x@w; print('device:', device); print('y shape:', y.shape); print(y)"
```

如果能输出 Tensor，说明基础计算正常。

也可以写成 `test_pytorch.py`：

```python
import torch

print("PyTorch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

x = torch.randn(3, 4).to(device)
w = torch.randn(4, 2).to(device)
y = x @ w

print("x shape:", x.shape)
print("w shape:", w.shape)
print("y shape:", y.shape)
print(y)
```

运行：

```powershell
python test_pytorch.py
```

## 八、让 Jupyter Notebook 使用这个 conda 环境

如果要运行 `.ipynb`，需要在这个 conda 环境里安装 Jupyter kernel：

```powershell
python -m pip install notebook ipykernel
python -m ipykernel install --user --name pytorch --display-name "Python 3.12 (PyTorch)"
```

启动 Jupyter：

```powershell
jupyter notebook
```

打开 notebook 后，在右上角内核中选择：

```text
Python 3.12 (PyTorch)
```

然后运行：

```python
import torch
print(torch.__version__)
print(torch.cuda.is_available())
```

## 九、常见问题

### 1. 创建环境时没有写入权限

报错：

```text
NoWritableEnvsDirError: No writeable envs directories configured.
```

解决方案：

```powershell
conda create -p C:\Users\20694\Desktop\myblog\.conda\pytorch python=3.12 -y
conda activate C:\Users\20694\Desktop\myblog\.conda\pytorch
```

### 2. conda 或 pip 无法联网

报错可能类似：

```text
Failed to establish a new connection: [WinError 10013]
```

这通常是当前终端、代理、防火墙或执行沙箱限制了联网，不是 PyTorch 代码问题。

解决思路：

- 换到正常联网的 PowerShell 或 Anaconda Prompt
- 检查代理和防火墙
- 使用管理员权限打开终端
- 在浏览器打开 PyTorch 官网，复制最新安装命令
- 必要时配置 pip 或 conda 镜像源

### 3. `No matching distribution found for torch`

常见原因：

- Python 版本和 PyTorch wheel 不匹配
- pip 太旧
- 当前网络没有访问到正确的 PyTorch wheel 源
- 复制了错误的 CUDA 版本命令

处理方法：

```powershell
python --version
python -m pip install --upgrade pip
```

然后重新执行官网安装选择器生成的命令。

### 4. `torch.cuda.is_available()` 是 False

可能原因：

- 安装了 CPU 版 PyTorch
- NVIDIA 驱动太旧
- 当前电脑没有 NVIDIA 显卡
- 当前 Python 环境不是刚才安装 PyTorch 的 conda 环境

检查：

```powershell
where python
python -m pip show torch
nvidia-smi
```

## 十、本机本次操作记录

本机已经确认：

```text
conda 25.11.1
Python 3.13.9
GPU: NVIDIA GeForce RTX 4060 Laptop GPU
Driver Version: 595.71
nvidia-smi CUDA Version: 13.2
```

尝试使用默认 conda 环境目录创建环境：

```powershell
conda create -n pytorch python=3.12 -y
```

遇到权限问题：

```text
NoWritableEnvsDirError: No writeable envs directories configured.
```

随后改为项目内路径：

```powershell
conda create -p C:\Users\20694\Desktop\myblog\.conda\pytorch python=3.12 -y
```

但当前执行环境限制联网和部分目录写入，出现：

```text
Failed to establish a new connection: [WinError 10013]
CondaToSPermissionError
```

所以这次在当前受限执行环境里还没有真正完成下载安装。  
在正常联网并允许 conda 写入缓存的 PowerShell 或 Anaconda Prompt 中，推荐继续执行下面这套最终命令。

## 十一、推荐最终命令

如果 conda 默认环境目录可写：

```powershell
conda create -n pytorch python=3.12 -y
conda activate pytorch
python -m pip install --upgrade pip
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
python -m pip install notebook ipykernel
python -m ipykernel install --user --name pytorch --display-name "Python 3.12 (PyTorch)"
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CUDA不可用')"
```

如果 conda 默认环境目录不可写，就创建到当前博客项目目录：

```powershell
conda create -p C:\Users\20694\Desktop\myblog\.conda\pytorch python=3.12 -y
conda activate C:\Users\20694\Desktop\myblog\.conda\pytorch
python -m pip install --upgrade pip
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
python -m pip install notebook ipykernel
python -m ipykernel install --user --name pytorch --display-name "Python 3.12 (PyTorch)"
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CUDA不可用')"
```

如果 `cu128` 后续安装失败，回到 PyTorch 官网安装选择器，重新复制它给出的最新命令。

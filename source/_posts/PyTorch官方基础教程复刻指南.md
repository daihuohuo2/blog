---
title: PyTorch 官方基础教程复刻指南
date: 2026-05-26 15:30:00
categories:
  - 机器学习
tags:
  - PyTorch
  - 深度学习
  - 模型训练
sticky: 1
---

这篇笔记根据 PyTorch 官方 **Learn the Basics** 教程整理，目标不是只看懂概念，而是可以一步一步把官方入门项目复刻出来。

官方教程入口：

- [Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/intro.html)
- [Quickstart](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)
- [Tensors](https://docs.pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html)
- [Datasets & DataLoaders](https://docs.pytorch.org/tutorials/beginner/basics/data_tutorial.html)
- [Transforms](https://docs.pytorch.org/tutorials/beginner/basics/transforms_tutorial.html)
- [Build the Neural Network](https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html)
- [Autograd](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html)
- [Optimization](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)
- [Save and Load the Model](https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html)

---

# 1. 这个官方项目到底在做什么

这个教程会带你完成一个非常典型的深度学习入门项目：

```text
下载 FashionMNIST 数据集
        ↓
把图片转换成 Tensor
        ↓
用 DataLoader 分批读取数据
        ↓
搭建一个简单神经网络
        ↓
训练模型
        ↓
测试模型效果
        ↓
保存模型参数
        ↓
重新加载模型并做预测
```

## 1.1 FashionMNIST 是什么

FashionMNIST 是一个服装图片分类数据集。

它里面的图片是灰度图，也就是黑白图片。每张图片大小是：

```text
28 x 28 像素
```

每张图片属于 10 个类别中的一个：

| 标签编号 | 类别名称 |
| --- | --- |
| 0 | T-shirt/top |
| 1 | Trouser |
| 2 | Pullover |
| 3 | Dress |
| 4 | Coat |
| 5 | Sandal |
| 6 | Shirt |
| 7 | Sneaker |
| 8 | Bag |
| 9 | Ankle boot |

## 1.2 这个项目的输入和输出

输入：

```text
一张 28 x 28 的服装图片
```

输出：

```text
模型判断这张图片属于哪一类衣服
```

比如模型看到一张鞋子的图片，输出结果可能是：

```text
Sneaker
```

---

# 2. 初学者先懂这些词

下面这些词会贯穿整个教程。先看懂它们，后面代码就不会那么吓人。

| 术语 | 人话解释 |
| --- | --- |
| 样本 | 一条数据，比如一张衣服图片 |
| 特征 | 输入给模型的信息，比如图片像素 |
| 标签 | 正确答案，比如这张图是 Sneaker |
| 模型 | 根据输入做预测的函数 |
| 参数 | 模型内部会被训练改变的数字 |
| 预测值 | 模型算出来的答案 |
| 损失 | 预测值和正确答案差得有多远 |
| 优化器 | 根据损失调整模型参数的工具 |
| batch | 一小批数据 |
| epoch | 把全部训练数据完整学习一遍 |
| 训练 | 用数据不断调整模型参数 |
| 测试 | 用没参与训练的数据检查模型效果 |
| 推理 | 用训练好的模型预测新数据 |

---

# 3. 准备环境

官方教程默认你已经安装好 PyTorch、TorchVision 和 Matplotlib。

如果你用 conda，可以在你的环境里安装：

```bash
conda install pytorch torchvision torchaudio cpuonly -c pytorch
```

如果你有 NVIDIA 显卡，需要去 PyTorch 官网选择适合自己 CUDA 版本的安装命令。

验证安装：

```python
# 导入 PyTorch
import torch

# 导入 torchvision，里面有常用数据集和图片处理工具
import torchvision

# 输出 PyTorch 版本
print(torch.__version__)

# 检查是否可以使用 CUDA GPU
print(torch.cuda.is_available())
```

---

# 4. Quickstart：先把完整流程跑通

官方 Quickstart 的思路是：先不要纠结每个细节，先把完整项目跑起来。

## 4.1 导入需要的库

```python
# PyTorch 主库
import torch

# 神经网络相关模块
from torch import nn

# DataLoader 用来分批读取数据
from torch.utils.data import DataLoader

# torchvision 里有官方准备好的数据集
from torchvision import datasets

# ToTensor 用来把图片转换成 Tensor
from torchvision.transforms import ToTensor
```

## 4.2 下载训练集和测试集

```python
# 下载训练集
training_data = datasets.FashionMNIST(
    root="data",          # 数据保存到 data 文件夹
    train=True,           # True 表示训练集
    download=True,        # 如果本地没有就自动下载
    transform=ToTensor()  # 把图片转换成 Tensor
)

# 下载测试集
test_data = datasets.FashionMNIST(
    root="data",          # 数据保存到 data 文件夹
    train=False,          # False 表示测试集
    download=True,
    transform=ToTensor()
)
```

训练集用于让模型学习。

测试集用于检查模型有没有真的学会。

## 4.3 用 DataLoader 分批读取数据

```python
# batch_size 表示每次给模型看 64 张图片
batch_size = 64

# 训练数据加载器
train_dataloader = DataLoader(training_data, batch_size=batch_size)

# 测试数据加载器
test_dataloader = DataLoader(test_data, batch_size=batch_size)

# 取出一个 batch 看看形状
for X, y in test_dataloader:
    print("图片 batch 的形状：", X.shape)
    print("标签 batch 的形状：", y.shape)
    break
```

你会看到类似：

```text
图片 batch 的形状：torch.Size([64, 1, 28, 28])
标签 batch 的形状：torch.Size([64])
```

解释：

```text
64：这一批有 64 张图片
1：每张图片只有 1 个颜色通道，灰度图
28：图片高度
28：图片宽度
```

## 4.4 选择运行设备

```python
# 如果有 GPU，就使用 cuda；否则使用 cpu
device = "cuda" if torch.cuda.is_available() else "cpu"

print("当前使用设备：", device)
```

模型和数据必须放在同一个设备上。

如果模型在 GPU 上，数据也要放到 GPU 上。

## 4.5 定义神经网络模型

```python
# 定义一个神经网络类
class NeuralNetwork(nn.Module):
    def __init__(self):
        # 调用父类 nn.Module 的初始化方法
        super().__init__()

        # Flatten 把 28x28 的图片拉平成一维向量
        self.flatten = nn.Flatten()

        # Sequential 表示按顺序执行里面的层
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(28 * 28, 512),  # 输入 784 个像素，输出 512 个特征
            nn.ReLU(),                # 激活函数，增加非线性能力
            nn.Linear(512, 512),      # 再做一次线性变换
            nn.ReLU(),                # 再做一次激活
            nn.Linear(512, 10)        # 输出 10 个类别的分数
        )

    def forward(self, x):
        # 先把图片拉平
        x = self.flatten(x)

        # 再送入全连接网络
        logits = self.linear_relu_stack(x)

        # 返回每个类别的原始分数
        return logits


# 创建模型，并移动到指定设备
model = NeuralNetwork().to(device)

print(model)
```

注意：

```text
logits 是模型输出的原始分数，还不是概率。
```

## 4.6 定义损失函数和优化器

```python
# 交叉熵损失，常用于多分类任务
loss_fn = nn.CrossEntropyLoss()

# SGD 优化器，用来更新模型参数
optimizer = torch.optim.SGD(model.parameters(), lr=1e-3)
```

这里的 `lr` 是 learning rate，也就是学习率。

学习率太大，模型可能学不稳。

学习率太小，模型可能学得很慢。

## 4.7 写训练函数

```python
def train(dataloader, model, loss_fn, optimizer):
    # 获取数据集总长度
    size = len(dataloader.dataset)

    # 设置为训练模式
    model.train()

    # 遍历每一个 batch
    for batch, (X, y) in enumerate(dataloader):
        # 把图片和标签移动到同一个设备
        X, y = X.to(device), y.to(device)

        # 前向传播：模型做预测
        pred = model(X)

        # 计算预测结果和真实标签之间的损失
        loss = loss_fn(pred, y)

        # 清空上一轮梯度
        optimizer.zero_grad()

        # 反向传播：计算梯度
        loss.backward()

        # 优化器更新参数
        optimizer.step()

        # 每隔 100 个 batch 打印一次训练状态
        if batch % 100 == 0:
            loss_value = loss.item()
            current = (batch + 1) * len(X)
            print(f"loss: {loss_value:>7f}  [{current:>5d}/{size:>5d}]")
```

训练循环最重要的是这 5 行：

```python
pred = model(X)
loss = loss_fn(pred, y)
optimizer.zero_grad()
loss.backward()
optimizer.step()
```

它们对应：

```text
预测 -> 算错多少 -> 清梯度 -> 算梯度 -> 改参数
```

## 4.8 写测试函数

```python
def test(dataloader, model, loss_fn):
    # 获取数据集总长度
    size = len(dataloader.dataset)

    # batch 数量
    num_batches = len(dataloader)

    # 设置为评估模式
    model.eval()

    # 累计损失和正确数量
    test_loss = 0
    correct = 0

    # 测试阶段不需要计算梯度
    with torch.no_grad():
        for X, y in dataloader:
            # 移动到指定设备
            X, y = X.to(device), y.to(device)

            # 模型预测
            pred = model(X)

            # 累加损失
            test_loss += loss_fn(pred, y).item()

            # pred.argmax(1) 取出每一行分数最高的类别编号
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()

    # 计算平均损失
    test_loss /= num_batches

    # 计算准确率
    correct /= size

    print(f"Test Error: Accuracy: {(100 * correct):>0.1f}%, Avg loss: {test_loss:>8f}")
```

测试时用 `torch.no_grad()`，因为测试不需要训练参数。

这样可以节省内存，也能运行得更快。

## 4.9 开始训练

```python
# 训练轮数
epochs = 5

for t in range(epochs):
    print(f"Epoch {t + 1}\\n-------------------------------")
    train(train_dataloader, model, loss_fn, optimizer)
    test(test_dataloader, model, loss_fn)

print("Done!")
```

每个 epoch 都会完整看一遍训练集。

训练过程中，你应该能看到 loss 逐渐变化，测试准确率逐渐提升。

## 4.10 保存模型

```python
# 保存模型参数
torch.save(model.state_dict(), "model.pth")

print("Saved PyTorch Model State to model.pth")
```

推荐保存 `state_dict()`，也就是模型参数字典。

## 4.11 加载模型并预测

```python
# 类别名称列表
classes = [
    "T-shirt/top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot",
]

# 重新创建同样结构的模型
model = NeuralNetwork().to(device)

# 加载保存好的参数
model.load_state_dict(torch.load("model.pth"))

# 切换到评估模式
model.eval()

# 从测试集中拿一张图片和它的真实标签
x, y = test_data[0][0], test_data[0][1]

# 推理阶段不计算梯度
with torch.no_grad():
    # 模型需要 batch 维度，所以用 x.to(device) 后再传入
    pred = model(x.to(device))

    # 取分数最高的类别编号
    predicted = classes[pred[0].argmax(0)]

    # 真实类别名称
    actual = classes[y]

    print(f'Predicted: "{predicted}", Actual: "{actual}"')
```

---

# 5. Tensors：PyTorch 最核心的数据结构

Tensor 可以理解成 PyTorch 里的多维数组。

它和 NumPy 数组很像，但 Tensor 可以在 GPU 上运行，也可以参与自动求导。

## 5.1 创建 Tensor

```python
import torch
import numpy as np

# 从 Python 列表创建 Tensor
data = [[1, 2], [3, 4]]
x_data = torch.tensor(data)

# 从 NumPy 数组创建 Tensor
np_array = np.array(data)
x_np = torch.from_numpy(np_array)

# 创建和 x_data 形状一样的全 1 Tensor
x_ones = torch.ones_like(x_data)

# 创建和 x_data 形状一样的随机 Tensor，并指定数据类型为 float
x_rand = torch.rand_like(x_data, dtype=torch.float)

print(x_data)
print(x_np)
print(x_ones)
print(x_rand)
```

## 5.2 根据形状创建 Tensor

```python
# shape 表示 Tensor 的形状
shape = (2, 3)

# 随机 Tensor
rand_tensor = torch.rand(shape)

# 全 1 Tensor
ones_tensor = torch.ones(shape)

# 全 0 Tensor
zeros_tensor = torch.zeros(shape)

print(rand_tensor)
print(ones_tensor)
print(zeros_tensor)
```

## 5.3 Tensor 的属性

```python
tensor = torch.rand(3, 4)

# shape：形状
print("Shape:", tensor.shape)

# dtype：数据类型
print("Datatype:", tensor.dtype)

# device：所在设备，cpu 或 cuda
print("Device:", tensor.device)
```

## 5.4 Tensor 放到 GPU 上

```python
# 如果有 GPU，就把 Tensor 移动到 GPU
if torch.cuda.is_available():
    tensor = tensor.to("cuda")

print(tensor.device)
```

## 5.5 Tensor 索引和切片

```python
tensor = torch.ones(4, 4)

# 第一行
print("First row:", tensor[0])

# 第一列
print("First column:", tensor[:, 0])

# 最后一列
print("Last column:", tensor[..., -1])

# 把第二列全部改成 0
tensor[:, 1] = 0

print(tensor)
```

## 5.6 Tensor 拼接

```python
tensor = torch.ones(4, 4)

# dim=1 表示按列方向拼接
t1 = torch.cat([tensor, tensor, tensor], dim=1)

print(t1)
```

## 5.7 Tensor 运算

```python
tensor = torch.ones(4, 4)

# 矩阵乘法
y1 = tensor @ tensor.T

# 另一种矩阵乘法写法
y2 = tensor.matmul(tensor.T)

# 逐元素乘法
z1 = tensor * tensor

# 另一种逐元素乘法写法
z2 = tensor.mul(tensor)

print(y1)
print(y2)
print(z1)
print(z2)
```

## 5.8 单元素 Tensor 转 Python 数字

```python
agg = tensor.sum()

# item() 把只有一个元素的 Tensor 转成 Python 数字
agg_item = agg.item()

print(agg_item)
print(type(agg_item))
```

## 5.9 原地操作

```python
tensor = torch.ones(4, 4)

# add_ 末尾有下划线，表示原地修改 tensor 自己
tensor.add_(5)

print(tensor)
```

注意：

```text
带下划线的方法会直接修改原 Tensor。
原地操作可能节省内存，但有时会影响自动求导，初学时谨慎使用。
```

## 5.10 Tensor 和 NumPy 共享内存

```python
t = torch.ones(5)
n = t.numpy()

print(t)
print(n)

# 修改 Tensor，NumPy 数组也会变
t.add_(1)

print(t)
print(n)
```

反过来也一样：

```python
n = np.ones(5)
t = torch.from_numpy(n)

# 修改 NumPy 数组，Tensor 也会变
np.add(n, 1, out=n)

print(t)
print(n)
```

---

# 6. Datasets 和 DataLoaders

官方把数据处理拆成两个概念：

```text
Dataset：负责保存样本和标签
DataLoader：负责把 Dataset 分批取出来
```

## 6.1 加载 FashionMNIST

```python
from torch.utils.data import Dataset
from torchvision import datasets
from torchvision.transforms import ToTensor
import matplotlib.pyplot as plt

# 训练数据
training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor()
)

# 测试数据
test_data = datasets.FashionMNIST(
    root="data",
    train=False,
    download=True,
    transform=ToTensor()
)
```

## 6.2 查看数据样本

```python
labels_map = {
    0: "T-Shirt",
    1: "Trouser",
    2: "Pullover",
    3: "Dress",
    4: "Coat",
    5: "Sandal",
    6: "Shirt",
    7: "Sneaker",
    8: "Bag",
    9: "Ankle Boot",
}

# 创建画布
figure = plt.figure(figsize=(8, 8))

# 显示 9 张随机图片
cols, rows = 3, 3
for i in range(1, cols * rows + 1):
    # 随机取一个样本下标
    sample_idx = torch.randint(len(training_data), size=(1,)).item()

    # 取出图片和标签
    img, label = training_data[sample_idx]

    # 添加子图
    figure.add_subplot(rows, cols, i)

    # 设置标题为标签名称
    plt.title(labels_map[label])

    # 不显示坐标轴
    plt.axis("off")

    # squeeze 去掉通道维度，灰度图才能正常显示
    plt.imshow(img.squeeze(), cmap="gray")

plt.show()
```

## 6.3 自定义 Dataset

自定义 Dataset 通常需要实现三个方法：

| 方法 | 作用 |
| --- | --- |
| `__init__` | 初始化，读取文件路径、标签表等 |
| `__len__` | 返回数据集长度 |
| `__getitem__` | 根据下标返回一个样本 |

示例结构：

```python
import os
import pandas as pd
from torchvision.io import read_image

class CustomImageDataset(Dataset):
    def __init__(self, annotations_file, img_dir, transform=None, target_transform=None):
        # 读取标签 CSV 文件
        self.img_labels = pd.read_csv(annotations_file)

        # 图片所在文件夹
        self.img_dir = img_dir

        # 图片转换
        self.transform = transform

        # 标签转换
        self.target_transform = target_transform

    def __len__(self):
        # 返回样本数量
        return len(self.img_labels)

    def __getitem__(self, idx):
        # 拼接图片完整路径
        img_path = os.path.join(self.img_dir, self.img_labels.iloc[idx, 0])

        # 读取图片
        image = read_image(img_path)

        # 读取标签
        label = self.img_labels.iloc[idx, 1]

        # 如果有图片转换，就应用图片转换
        if self.transform:
            image = self.transform(image)

        # 如果有标签转换，就应用标签转换
        if self.target_transform:
            label = self.target_transform(label)

        # 返回图片和标签
        return image, label
```

## 6.4 使用 DataLoader

```python
from torch.utils.data import DataLoader

# shuffle=True 表示每轮训练前打乱数据
train_dataloader = DataLoader(training_data, batch_size=64, shuffle=True)

test_dataloader = DataLoader(test_data, batch_size=64, shuffle=True)
```

取出一个 batch：

```python
# 把 dataloader 变成迭代器
train_features, train_labels = next(iter(train_dataloader))

print("Feature batch shape:", train_features.size())
print("Labels batch shape:", train_labels.size())

# 取 batch 里的第一张图
img = train_features[0].squeeze()
label = train_labels[0]

plt.imshow(img, cmap="gray")
plt.show()

print("Label:", label)
```

---

# 7. Transforms：数据转换

机器学习模型通常不能直接处理原始图片、文字和标签。

Transforms 的作用就是把原始数据转换成模型可以使用的格式。

## 7.1 ToTensor

```python
from torchvision.transforms import ToTensor

training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor()
)
```

`ToTensor()` 做两件事：

```text
1. 把 PIL 图片或 NumPy 数组转换成 Tensor
2. 把像素值缩放到 0 到 1 之间
```

## 7.2 Lambda

`Lambda` 可以自定义一个转换函数。

官方例子里用它把数字标签转换成 one-hot 向量。

什么是 one-hot？

```text
如果一共有 10 类，第 3 类可以表示成：
[0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
```

示例：

```python
from torchvision.transforms import Lambda

target_transform = Lambda(
    lambda y: torch.zeros(10, dtype=torch.float).scatter_(0, torch.tensor(y), value=1)
)
```

解释：

```text
torch.zeros(10)：先创建长度为 10 的全 0 Tensor
scatter_：把标签对应的位置改成 1
```

---

# 8. Build Model：搭建神经网络

本节解释官方模型为什么这么写。

## 8.1 nn.Module

所有自定义神经网络都应该继承 `nn.Module`。

```python
from torch import nn

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(28 * 28, 512),
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, 10),
        )

    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits
```

## 8.2 模型层解释

| 层 | 作用 |
| --- | --- |
| `nn.Flatten()` | 把图片从二维拉平成一维 |
| `nn.Linear()` | 全连接层，做线性变换 |
| `nn.ReLU()` | 激活函数，让模型能学习复杂关系 |
| `nn.Sequential()` | 把多个层按顺序组合起来 |

## 8.3 查看模型输出

```python
model = NeuralNetwork().to(device)

# 创建一张假图片，形状是 [1, 28, 28]
X = torch.rand(1, 28, 28, device=device)

# 模型输出 10 个类别的分数
logits = model(X)

# Softmax 把分数转换成概率
pred_probab = nn.Softmax(dim=1)(logits)

# argmax 取概率最大的类别编号
y_pred = pred_probab.argmax(1)

print(f"Predicted class: {y_pred}")
```

## 8.4 模型参数

```python
print("Model structure:", model, "\\n\\n")

for name, param in model.named_parameters():
    print(f"Layer: {name}")
    print(f"Size: {param.size()}")
    print(f"Values: {param[:2]} \\n")
```

`named_parameters()` 可以查看模型中每个可训练参数。

---

# 9. Autograd：自动求导

神经网络训练依赖反向传播。

PyTorch 的 autograd 会自动记录 Tensor 的计算过程，并帮你计算梯度。

## 9.1 一个简单例子

```python
import torch

# 输入 Tensor
x = torch.ones(5)

# 正确标签
y = torch.zeros(3)

# 权重，需要计算梯度
w = torch.randn(5, 3, requires_grad=True)

# 偏置，也需要计算梯度
b = torch.randn(3, requires_grad=True)

# 模型输出
z = torch.matmul(x, w) + b

# 二分类交叉熵损失
loss = torch.nn.functional.binary_cross_entropy_with_logits(z, y)
```

## 9.2 查看梯度函数

```python
print("Gradient function for z =", z.grad_fn)
print("Gradient function for loss =", loss.grad_fn)
```

`grad_fn` 记录这个 Tensor 是怎么计算出来的。

## 9.3 计算梯度

```python
# 反向传播
loss.backward()

# 查看 w 的梯度
print(w.grad)

# 查看 b 的梯度
print(b.grad)
```

注意：

```text
只有 requires_grad=True 的叶子节点 Tensor 才会保存 grad。
```

## 9.4 关闭梯度计算

测试和推理时不需要计算梯度。

写法一：

```python
z = torch.matmul(x, w) + b
print(z.requires_grad)

with torch.no_grad():
    z = torch.matmul(x, w) + b
print(z.requires_grad)
```

写法二：

```python
z = torch.matmul(x, w) + b
z_det = z.detach()

print(z_det.requires_grad)
```

关闭梯度的常见原因：

- 推理时不训练模型
- 节省内存
- 加快计算
- 有些参数需要固定，不参与训练

## 9.5 计算图

PyTorch 会把 Tensor 和操作组成一个有向无环图。

前向传播时，PyTorch 记录计算过程。

反向传播时，PyTorch 根据计算图从损失往前计算每个参数的梯度。

默认情况下，一次计算图只能反向传播一次。

如果要多次调用 `backward()`，需要设置：

```python
loss.backward(retain_graph=True)
```

---

# 10. Optimization：训练优化

这一节把完整训练过程拆开讲。

## 10.1 超参数

超参数是训练前手动设置的参数，不是模型自己学出来的。

官方教程用到：

```python
learning_rate = 1e-3
batch_size = 64
epochs = 5
```

解释：

| 超参数 | 说明 |
| --- | --- |
| learning rate | 学习率，每次参数更新的步子大小 |
| batch size | 每次训练用多少条样本 |
| epochs | 完整遍历训练集多少次 |

## 10.2 损失函数

损失函数衡量模型预测和真实标签之间的差距。

常见损失函数：

| 损失函数 | 适合任务 |
| --- | --- |
| `nn.MSELoss()` | 回归任务 |
| `nn.NLLLoss()` | 分类任务的一种写法 |
| `nn.CrossEntropyLoss()` | 多分类任务常用 |

FashionMNIST 是 10 分类任务，所以用：

```python
loss_fn = nn.CrossEntropyLoss()
```

## 10.3 优化器

优化器负责根据梯度更新模型参数。

```python
optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
```

训练时常见三步：

```python
# 清空旧梯度
optimizer.zero_grad()

# 反向传播，计算新梯度
loss.backward()

# 根据梯度更新参数
optimizer.step()
```

## 10.4 完整训练函数

```python
def train_loop(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset)

    # 遍历 batch
    for batch, (X, y) in enumerate(dataloader):
        # 模型预测
        pred = model(X)

        # 计算损失
        loss = loss_fn(pred, y)

        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # 打印训练进度
        if batch % 100 == 0:
            loss_value = loss.item()
            current = batch * batch_size + len(X)
            print(f"loss: {loss_value:>7f}  [{current:>5d}/{size:>5d}]")
```

## 10.5 完整测试函数

```python
def test_loop(dataloader, model, loss_fn):
    size = len(dataloader.dataset)
    num_batches = len(dataloader)

    test_loss = 0
    correct = 0

    # 测试时不计算梯度
    with torch.no_grad():
        for X, y in dataloader:
            pred = model(X)
            test_loss += loss_fn(pred, y).item()
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()

    test_loss /= num_batches
    correct /= size

    print(f"Test Error: Accuracy: {(100 * correct):>0.1f}%, Avg loss: {test_loss:>8f}")
```

## 10.6 执行训练

```python
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

epochs = 5
for t in range(epochs):
    print(f"Epoch {t + 1}\\n-------------------------------")
    train_loop(train_dataloader, model, loss_fn, optimizer)
    test_loop(test_dataloader, model, loss_fn)

print("Done!")
```

---

# 11. Save and Load：保存与加载模型

训练好的模型如果不保存，程序关闭后参数就没了。

## 11.1 保存参数

```python
# 保存模型参数字典
torch.save(model.state_dict(), "model.pth")

print("Saved PyTorch Model State to model.pth")
```

## 11.2 加载参数

加载参数时，必须先创建同样结构的模型。

```python
model = NeuralNetwork().to(device)

# weights_only=True 在新版 PyTorch 中更安全
model.load_state_dict(torch.load("model.pth", weights_only=True))
```

如果你的 PyTorch 版本不支持 `weights_only=True`，可以写成：

```python
model.load_state_dict(torch.load("model.pth"))
```

## 11.3 用加载后的模型预测

```python
classes = [
    "T-shirt/top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot",
]

# 评估模式
model.eval()

# 取测试集中的第一张图片
x, y = test_data[0][0], test_data[0][1]

with torch.no_grad():
    # 增加 batch 维度，并移动到设备
    x = x.to(device)
    pred = model(x)

    predicted = classes[pred[0].argmax(0)]
    actual = classes[y]

    print(f'Predicted: "{predicted}", Actual: "{actual}"')
```

---

# 12. 建议你这样复刻

不要一口气全写完。建议按下面顺序每天跟一小段。

## 12.1 第一步：跑通 quickstart

新建文件：

```text
quickstart.py
```

先把下面模块写进去：

```text
1. 导入库
2. 下载 FashionMNIST
3. 创建 DataLoader
4. 定义 NeuralNetwork
5. 定义 loss_fn 和 optimizer
6. 写 train 函数
7. 写 test 函数
8. 训练 5 个 epoch
9. 保存 model.pth
10. 加载并预测一张图片
```

只要能跑出准确率，就算第一轮成功。

## 12.2 第二步：逐章理解

按这个顺序回头补细节：

```text
Tensor 是什么
Dataset 和 DataLoader 怎么分工
Transform 为什么要存在
nn.Module 为什么要写 forward
loss.backward() 到底做了什么
optimizer.step() 为什么能更新参数
state_dict() 保存了什么
```

## 12.3 第三步：自己改一点东西

可以做这些小改动：

- 把 `epochs` 从 5 改成 10，观察准确率
- 把 `batch_size` 从 64 改成 32，观察训练速度
- 把 `learning_rate` 改大或改小，观察 loss
- 把隐藏层 `512` 改成 `256`
- 多打印几个预测结果
- 试着画出预测错误的图片

## 12.4 第四步：复述训练流程

你能自己说出下面这段话，就说明主线已经通了：

```text
我们先用 torchvision 下载 FashionMNIST。
每张图片通过 ToTensor 转成 Tensor。
DataLoader 每次取出一个 batch。
模型把图片拉平成 784 个数字，再经过几个 Linear 和 ReLU 层，输出 10 个类别分数。
CrossEntropyLoss 比较模型输出和真实标签，得到损失。
backward 根据损失计算梯度。
optimizer.step 根据梯度更新模型参数。
训练完成后，用测试集计算准确率。
最后保存 state_dict，并重新加载模型做预测。
```

---

# 13. 最小完整复刻代码

下面是一份可以单独运行的完整版本。建议你先复制到 `quickstart.py` 跑通，再拆回 notebook 一段段理解。

```python
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision.transforms import ToTensor


# 1. 下载训练集
training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor()
)

# 2. 下载测试集
test_data = datasets.FashionMNIST(
    root="data",
    train=False,
    download=True,
    transform=ToTensor()
)

# 3. 创建 DataLoader
batch_size = 64
train_dataloader = DataLoader(training_data, batch_size=batch_size)
test_dataloader = DataLoader(test_data, batch_size=batch_size)

# 4. 选择设备
device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)


# 5. 定义模型
class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()

        # 把 28x28 图片拉平成 784 个数字
        self.flatten = nn.Flatten()

        # 三层全连接网络
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(28 * 28, 512),
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, 10),
        )

    def forward(self, x):
        # 拉平图片
        x = self.flatten(x)

        # 输出 10 个类别分数
        logits = self.linear_relu_stack(x)
        return logits


model = NeuralNetwork().to(device)
print(model)

# 6. 定义损失函数和优化器
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=1e-3)


def train(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset)
    model.train()

    for batch, (X, y) in enumerate(dataloader):
        # 移动数据到 CPU 或 GPU
        X, y = X.to(device), y.to(device)

        # 预测
        pred = model(X)

        # 计算损失
        loss = loss_fn(pred, y)

        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # 打印训练进度
        if batch % 100 == 0:
            loss_value = loss.item()
            current = (batch + 1) * len(X)
            print(f"loss: {loss_value:>7f}  [{current:>5d}/{size:>5d}]")


def test(dataloader, model, loss_fn):
    size = len(dataloader.dataset)
    num_batches = len(dataloader)

    model.eval()
    test_loss = 0
    correct = 0

    # 测试阶段不计算梯度
    with torch.no_grad():
        for X, y in dataloader:
            X, y = X.to(device), y.to(device)
            pred = model(X)
            test_loss += loss_fn(pred, y).item()
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()

    test_loss /= num_batches
    correct /= size

    print(f"Test Error: Accuracy: {(100 * correct):>0.1f}%, Avg loss: {test_loss:>8f}")


# 7. 训练模型
epochs = 5
for t in range(epochs):
    print(f"Epoch {t + 1}\\n-------------------------------")
    train(train_dataloader, model, loss_fn, optimizer)
    test(test_dataloader, model, loss_fn)

print("Done!")

# 8. 保存模型参数
torch.save(model.state_dict(), "model.pth")
print("Saved PyTorch Model State to model.pth")

# 9. 加载模型并预测
classes = [
    "T-shirt/top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot",
]

loaded_model = NeuralNetwork().to(device)

try:
    # 新版 PyTorch 推荐 weights_only=True
    loaded_model.load_state_dict(torch.load("model.pth", weights_only=True))
except TypeError:
    # 旧版 PyTorch 没有 weights_only 参数
    loaded_model.load_state_dict(torch.load("model.pth"))

loaded_model.eval()

x, y = test_data[0][0], test_data[0][1]

with torch.no_grad():
    x = x.to(device)
    pred = loaded_model(x)
    predicted = classes[pred[0].argmax(0)]
    actual = classes[y]
    print(f'Predicted: "{predicted}", Actual: "{actual}"')
```

---

# 14. 学完这篇你应该掌握什么

学完官方基础教程后，你应该能做到：

- 知道 Tensor 是 PyTorch 的核心数据结构
- 会下载和读取 FashionMNIST
- 知道 Dataset 和 DataLoader 的区别
- 会把图片转换成 Tensor
- 会定义一个简单的 `nn.Module`
- 看懂 `forward`
- 知道 logits、loss、optimizer、gradient 的关系
- 会写训练循环和测试循环
- 会保存和加载模型参数
- 能用训练好的模型预测一张图片

这就是 PyTorch 入门最重要的一条主线。

---

# 15. 官方源码对照区

这一节专门用来对照你自己复刻出来的代码。

官方仓库目录：

[pytorch/tutorials/beginner_source/basics](https://github.com/pytorch/tutorials/tree/main/beginner_source/basics)

## 15.1 官方文件对应关系

| 官方源码文件 | 对应教程 | 你复刻时主要对照什么 |
| --- | --- | --- |
| `intro.py` | Learn the Basics 入口 | 教程目录和学习顺序 |
| `quickstart_tutorial.py` | Quickstart | 完整训练、测试、保存、加载流程 |
| `tensorqs_tutorial.py` | Tensors | Tensor 创建、属性、索引、运算、NumPy 转换 |
| `data_tutorial.py` | Datasets & DataLoaders | FashionMNIST、Dataset、DataLoader、自定义 Dataset |
| `transforms_tutorial.py` | Transforms | `ToTensor`、`Lambda`、标签转换 |
| `buildmodel_tutorial.py` | Build Model | `nn.Module`、`Flatten`、`Linear`、`ReLU`、`Sequential` |
| `autogradqs_tutorial.py` | Autograd | `requires_grad`、`backward`、`grad`、`no_grad`、`detach` |
| `optimization_tutorial.py` | Optimization | 超参数、loss、optimizer、训练循环、测试循环 |
| `saveloadrun_tutorial.py` | Save and Load | `state_dict`、`torch.save`、`torch.load`、模型预测 |

建议对照顺序：

```text
先对照 quickstart_tutorial.py
再按章节对照 tensor / data / transforms / buildmodel / autograd / optimization / saveload
```

---

# 16. Quickstart 官方核心代码对照

官方文件：

[quickstart_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/quickstart_tutorial.py)

## 16.1 官方导入

```python
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision.transforms import ToTensor
```

对照重点：

- `torch` 是 PyTorch 主库
- `nn` 用来搭建神经网络
- `DataLoader` 用来分批读取数据
- `datasets` 用来下载官方数据集
- `ToTensor` 用来把图片转换成 Tensor

## 16.2 官方下载 FashionMNIST

```python
training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor(),
)

test_data = datasets.FashionMNIST(
    root="data",
    train=False,
    download=True,
    transform=ToTensor(),
)
```

你自己的代码要重点比对：

```text
root 是否是 data
train=True 是否用于训练集
train=False 是否用于测试集
download=True 是否打开
transform=ToTensor() 是否写上
```

## 16.3 官方 DataLoader

```python
batch_size = 64

train_dataloader = DataLoader(training_data, batch_size=batch_size)
test_dataloader = DataLoader(test_data, batch_size=batch_size)

for X, y in test_dataloader:
    print(f"Shape of X [N, C, H, W]: {X.shape}")
    print(f"Shape of y: {y.shape} {y.dtype}")
    break
```

对照重点：

```text
X 是图片数据
y 是标签
X.shape 通常是 [64, 1, 28, 28]
y.shape 通常是 [64]
```

## 16.4 官方设备选择

新版官方代码使用 `torch.accelerator`：

```python
device = torch.accelerator.current_accelerator().type if torch.accelerator.is_available() else "cpu"
print(f"Using {device} device")
```

如果你的 PyTorch 版本比较旧，可能没有 `torch.accelerator`，可以用这个兼容写法：

```python
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using {device} device")
```

两个写法目的相同：选择当前能用的加速设备，否则使用 CPU。

## 16.5 官方模型类

```python
class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(28*28, 512),
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, 10)
        )

    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits


model = NeuralNetwork().to(device)
print(model)
```

对照重点：

```text
类名是否是 NeuralNetwork
是否继承 nn.Module
__init__ 里是否调用 super().__init__()
是否有 Flatten
是否有 3 个 Linear
是否有 2 个 ReLU
最后一层输出是否是 10
forward 是否返回 logits
```

## 16.6 官方损失函数和优化器

```python
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=1e-3)
```

对照重点：

```text
多分类任务使用 CrossEntropyLoss
优化器使用 SGD
优化对象是 model.parameters()
学习率 lr 是 1e-3
```

## 16.7 官方训练函数

```python
def train(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset)
    model.train()
    for batch, (X, y) in enumerate(dataloader):
        X, y = X.to(device), y.to(device)

        pred = model(X)
        loss = loss_fn(pred, y)

        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        if batch % 100 == 0:
            loss, current = loss.item(), (batch + 1) * len(X)
            print(f"loss: {loss:>7f} [{current:>5d}/{size:>5d}]")
```

你复刻时最容易写错的是这三行顺序：

```python
loss.backward()
optimizer.step()
optimizer.zero_grad()
```

很多教程会写成：

```python
optimizer.zero_grad()
loss.backward()
optimizer.step()
```

两种写法都可以，关键是每轮训练都要清理旧梯度，避免梯度不断累加。

## 16.8 官方测试函数

```python
def test(dataloader, model, loss_fn):
    size = len(dataloader.dataset)
    num_batches = len(dataloader)
    model.eval()
    test_loss, correct = 0, 0

    with torch.no_grad():
        for X, y in dataloader:
            X, y = X.to(device), y.to(device)
            pred = model(X)
            test_loss += loss_fn(pred, y).item()
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()

    test_loss /= num_batches
    correct /= size
    print(f"Test Error: \n Accuracy: {(100*correct):>0.1f}%, Avg loss: {test_loss:>8f} \n")
```

对照重点：

```text
测试前调用 model.eval()
测试时使用 torch.no_grad()
pred.argmax(1) 得到预测类别
correct 除以 size 得到准确率
```

## 16.9 官方训练入口

```python
epochs = 5
for t in range(epochs):
    print(f"Epoch {t+1}\n-------------------------------")
    train(train_dataloader, model, loss_fn, optimizer)
    test(test_dataloader, model, loss_fn)
print("Done!")
```

对照重点：

```text
官方 Quickstart 训练 5 个 epoch
每一轮先 train，再 test
```

## 16.10 官方保存和加载

```python
torch.save(model.state_dict(), "model.pth")
print("Saved PyTorch Model State to model.pth")

model = NeuralNetwork().to(device)
model.load_state_dict(torch.load("model.pth", weights_only=True))
```

如果你的版本不支持 `weights_only=True`，使用：

```python
model.load_state_dict(torch.load("model.pth"))
```

## 16.11 官方预测代码

```python
classes = [
    "T-shirt/top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot",
]

model.eval()
x, y = test_data[0][0], test_data[0][1]

with torch.no_grad():
    x = x.to(device)
    pred = model(x)
    predicted, actual = classes[pred[0].argmax(0)], classes[y]
    print(f'Predicted: "{predicted}", Actual: "{actual}"')
```

对照重点：

```text
classes 顺序必须和 FashionMNIST 标签编号一致
预测前使用 model.eval()
推理时使用 torch.no_grad()
pred[0].argmax(0) 得到预测类别编号
```

---

# 17. 分章节官方代码对照

下面这些片段来自官方 `beginner_source/basics` 目录中的其他源码文件，用来和你自己的分章节练习对比。

## 17.1 Tensor 官方片段

官方文件：

[tensorqs_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/tensorqs_tutorial.py)

### 从数据创建 Tensor

```python
data = [[1, 2], [3, 4]]
x_data = torch.tensor(data)
```

### 从 NumPy 创建 Tensor

```python
np_array = np.array(data)
x_np = torch.from_numpy(np_array)
```

### 根据已有 Tensor 创建

```python
x_ones = torch.ones_like(x_data)
x_rand = torch.rand_like(x_data, dtype=torch.float)
```

### 根据 shape 创建

```python
shape = (2, 3,)
rand_tensor = torch.rand(shape)
ones_tensor = torch.ones(shape)
zeros_tensor = torch.zeros(shape)
```

### 查看 Tensor 属性

```python
tensor = torch.rand(3, 4)

print(f"Shape of tensor: {tensor.shape}")
print(f"Datatype of tensor: {tensor.dtype}")
print(f"Device tensor is stored on: {tensor.device}")
```

### 移动到 GPU

```python
if torch.cuda.is_available():
    tensor = tensor.to("cuda")
```

### 索引和切片

```python
tensor = torch.ones(4, 4)
print(f"First row: {tensor[0]}")
print(f"First column: {tensor[:, 0]}")
print(f"Last column: {tensor[..., -1]}")
tensor[:, 1] = 0
print(tensor)
```

### 拼接 Tensor

```python
t1 = torch.cat([tensor, tensor, tensor], dim=1)
print(t1)
```

### 矩阵乘法和逐元素乘法

```python
y1 = tensor @ tensor.T
y2 = tensor.matmul(tensor.T)

z1 = tensor * tensor
z2 = tensor.mul(tensor)
```

### 单元素 Tensor 转数字

```python
agg = tensor.sum()
agg_item = agg.item()
print(agg_item, type(agg_item))
```

### 原地操作

```python
print(f"{tensor} \n")
tensor.add_(5)
print(tensor)
```

---

## 17.2 DataLoader 官方片段

官方文件：

[data_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/data_tutorial.py)

### 加载 FashionMNIST

```python
from torch.utils.data import Dataset
from torchvision import datasets
from torchvision.transforms import ToTensor
import matplotlib.pyplot as plt

training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor()
)

test_data = datasets.FashionMNIST(
    root="data",
    train=False,
    download=True,
    transform=ToTensor()
)
```

### 标签映射表

```python
labels_map = {
    0: "T-Shirt",
    1: "Trouser",
    2: "Pullover",
    3: "Dress",
    4: "Coat",
    5: "Sandal",
    6: "Shirt",
    7: "Sneaker",
    8: "Bag",
    9: "Ankle Boot",
}
```

### 自定义 Dataset 结构

```python
class CustomImageDataset(Dataset):
    def __init__(self, annotations_file, img_dir, transform=None, target_transform=None):
        self.img_labels = pd.read_csv(annotations_file)
        self.img_dir = img_dir
        self.transform = transform
        self.target_transform = target_transform

    def __len__(self):
        return len(self.img_labels)

    def __getitem__(self, idx):
        img_path = os.path.join(self.img_dir, self.img_labels.iloc[idx, 0])
        image = read_image(img_path)
        label = self.img_labels.iloc[idx, 1]
        if self.transform:
            image = self.transform(image)
        if self.target_transform:
            label = self.target_transform(label)
        return image, label
```

### 创建 DataLoader

```python
train_dataloader = DataLoader(training_data, batch_size=64, shuffle=True)
test_dataloader = DataLoader(test_data, batch_size=64, shuffle=True)
```

### 取出一个 batch

```python
train_features, train_labels = next(iter(train_dataloader))
print(f"Feature batch shape: {train_features.size()}")
print(f"Labels batch shape: {train_labels.size()}")
img = train_features[0].squeeze()
label = train_labels[0]
plt.imshow(img, cmap="gray")
plt.show()
print(f"Label: {label}")
```

---

## 17.3 Transforms 官方片段

官方文件：

[transforms_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/transforms_tutorial.py)

### ToTensor 和 Lambda

```python
from torchvision.transforms import ToTensor, Lambda

ds = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor(),
    target_transform=Lambda(lambda y: torch.zeros(10, dtype=torch.float).scatter_(0, torch.tensor(y), value=1))
)
```

对照重点：

```text
transform 处理输入图片
target_transform 处理标签
ToTensor 把图片转 Tensor
Lambda 自定义标签转换
```

---

## 17.4 Build Model 官方片段

官方文件：

[buildmodel_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/buildmodel_tutorial.py)

### 定义模型

```python
class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(28*28, 512),
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, 10),
        )

    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits
```

### 查看模型预测类别

```python
X = torch.rand(1, 28, 28, device=device)
logits = model(X)
pred_probab = nn.Softmax(dim=1)(logits)
y_pred = pred_probab.argmax(1)
print(f"Predicted class: {y_pred}")
```

### 查看模型参数

```python
print(f"Model structure: {model}\n\n")

for name, param in model.named_parameters():
    print(f"Layer: {name} | Size: {param.size()} | Values : {param[:2]} \n")
```

---

## 17.5 Autograd 官方片段

官方文件：

[autogradqs_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/autogradqs_tutorial.py)

### 创建需要梯度的参数

```python
x = torch.ones(5)
y = torch.zeros(3)
w = torch.randn(5, 3, requires_grad=True)
b = torch.randn(3, requires_grad=True)
z = torch.matmul(x, w) + b
loss = torch.nn.functional.binary_cross_entropy_with_logits(z, y)
```

### 查看 grad_fn

```python
print(f"Gradient function for z = {z.grad_fn}")
print(f"Gradient function for loss = {loss.grad_fn}")
```

### 反向传播

```python
loss.backward()
print(w.grad)
print(b.grad)
```

### 关闭梯度

```python
z = torch.matmul(x, w) + b
print(z.requires_grad)

with torch.no_grad():
    z = torch.matmul(x, w) + b
print(z.requires_grad)
```

### detach

```python
z = torch.matmul(x, w) + b
z_det = z.detach()
print(z_det.requires_grad)
```

---

## 17.6 Optimization 官方片段

官方文件：

[optimization_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/optimization_tutorial.py)

### 超参数

```python
learning_rate = 1e-3
batch_size = 64
epochs = 5
```

### 损失函数

```python
loss_fn = nn.CrossEntropyLoss()
```

### 优化器

```python
optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
```

### 官方训练循环

```python
def train_loop(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset)
    model.train()
    for batch, (X, y) in enumerate(dataloader):
        pred = model(X)
        loss = loss_fn(pred, y)

        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        if batch % 100 == 0:
            loss, current = loss.item(), batch * batch_size + len(X)
            print(f"loss: {loss:>7f} [{current:>5d}/{size:>5d}]")
```

### 官方测试循环

```python
def test_loop(dataloader, model, loss_fn):
    model.eval()
    size = len(dataloader.dataset)
    num_batches = len(dataloader)
    test_loss, correct = 0, 0

    with torch.no_grad():
        for X, y in dataloader:
            pred = model(X)
            test_loss += loss_fn(pred, y).item()
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()

    test_loss /= num_batches
    correct /= size
    print(f"Test Error: \n Accuracy: {(100*correct):>0.1f}%, Avg loss: {test_loss:>8f} \n")
```

### 官方执行训练

```python
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

epochs = 10
for t in range(epochs):
    print(f"Epoch {t+1}\n-------------------------------")
    train_loop(train_dataloader, model, loss_fn, optimizer)
    test_loop(test_dataloader, model, loss_fn)
print("Done!")
```

注意：

```text
Quickstart 里 epochs 是 5。
Optimization 章节最后示例里 epochs 是 10。
这不是矛盾，只是不同章节演示不同。
```

---

## 17.7 Save and Load 官方片段

官方文件：

[saveloadrun_tutorial.py](https://github.com/pytorch/tutorials/blob/main/beginner_source/basics/saveloadrun_tutorial.py)

### 保存模型参数

```python
torch.save(model.state_dict(), "model.pth")
```

### 加载模型参数

```python
model = NeuralNetwork().to(device)
model.load_state_dict(torch.load("model.pth", weights_only=True))
```

### 预测一张图片

```python
model.eval()
x, y = test_data[0][0], test_data[0][1]

with torch.no_grad():
    x = x.to(device)
    pred = model(x)
    predicted, actual = classes[pred[0].argmax(0)], classes[y]
    print(f'Predicted: "{predicted}", Actual: "{actual}"')
```

---

# 18. 你复刻后怎么对比

建议你每写完一个阶段，就按下面清单对照官方代码。

## 18.1 数据阶段

检查：

```text
是否使用 FashionMNIST
训练集 train=True
测试集 train=False
是否使用 ToTensor()
DataLoader 的 batch_size 是否是 64
```

## 18.2 模型阶段

检查：

```text
是否继承 nn.Module
是否写了 forward
是否使用 Flatten
第一层 Linear 是否是 28*28 -> 512
第二层 Linear 是否是 512 -> 512
第三层 Linear 是否是 512 -> 10
是否在层之间使用 ReLU
```

## 18.3 训练阶段

检查：

```text
loss_fn 是否是 CrossEntropyLoss
optimizer 是否是 SGD
学习率是否是 1e-3
是否调用 loss.backward()
是否调用 optimizer.step()
是否每轮清空梯度
```

## 18.4 测试阶段

检查：

```text
是否调用 model.eval()
是否使用 torch.no_grad()
是否使用 pred.argmax(1) 得到类别
是否统计 correct
是否计算平均 test_loss
```

## 18.5 保存加载阶段

检查：

```text
是否保存 model.state_dict()
加载前是否重新创建同结构模型
是否 load_state_dict()
预测前是否 model.eval()
```

---
title: adversarial-attacks-pytorch 项目复盘
date: 2026-06-01 19:47:08
categories:
  - 机器学习
tags:
  - PyTorch
  - 对抗攻击
  - torchattacks
sticky: 0
---

# adversarial-attacks-pytorch 项目复盘

项目地址：[Harry24k/adversarial-attacks-pytorch](https://github.com/Harry24k/adversarial-attacks-pytorch)

本文按“从零跑通一次攻击实验”的顺序整理，适合复盘 `torchattacks` 这个项目的使用流程、核心 API、demo 逻辑和源码运行机制。

## 1. 项目定位

`adversarial-attacks-pytorch` 对外提供的包名是 `torchattacks`。它是一个 PyTorch 对抗攻击库，用来为图像分类模型生成 adversarial examples，即对抗样本。

它的设计目标是：

- 用 PyTorch 风格的接口调用攻击算法。
- 输入模型、原始图片和标签，输出对抗图片。
- 支持常见白盒攻击、黑盒攻击、目标攻击、迁移攻击、多攻击组合。
- 支持保存攻击后的数据，再加载到另一个模型上做鲁棒性评估。

最小调用形式如下：

```python
import torchattacks

atk = torchattacks.PGD(model, eps=8/255, alpha=2/255, steps=4)
adv_images = atk(images, labels)
```

这段代码表达的是：对 `model` 使用 PGD 攻击，在扰动半径 `eps=8/255` 内，按步长 `alpha=2/255` 迭代 4 步，生成 `adv_images`。

## 2. 环境准备

### 2.1 官方要求

README 中给出的要求是：

- Python >= 3.6
- PyTorch >= 1.4.0

如果要复现 demo，还经常需要：

- `torchvision`
- `robustbench`
- `matplotlib`
- `numpy`

### 2.2 安装方式

方式一：直接安装 PyPI 包。

```bash
pip install torchattacks
```

方式二：从 GitHub 安装最新版。

```bash
pip install git+https://github.com/Harry24k/adversarial-attacks-pytorch.git
```

方式三：克隆源码并以 editable 模式安装。

```bash
git clone https://github.com/Harry24k/adversarial-attacks-pytorch.git
cd adversarial-attacks-pytorch
pip install -e .
```

复盘源码时推荐第三种，因为可以直接看 `torchattacks/attack.py` 和 `torchattacks/attacks/*.py`。

## 3. 使用前必须注意的条件

### 3.1 模型输出格式

模型输出必须是一个分类 logits 向量，形状通常是：

```text
(N, C)
```

含义：

- `N`：batch size
- `C`：类别数

也就是说，模型应该返回类似 `model(images) -> logits` 的结果，而不是返回多个对象、字典、特征图列表等复杂结构。

如果你的模型返回：

```python
return logits, features
```

就需要包一层 wrapper，只返回 logits：

```python
class LogitsOnlyModel(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, x):
        logits, _ = self.model(x)
        return logits
```

### 3.2 输入图片范围

`torchattacks` 默认要求输入图片在 `[0, 1]` 范围内。

原因是攻击过程中会对扰动后的图片执行裁剪：

```python
torch.clamp(adv_images, min=0, max=1)
```

所以，如果输入已经做过标准化，例如 ImageNet 常见的：

```python
transforms.Normalize(mean=[0.485, 0.456, 0.406],
                     std=[0.229, 0.224, 0.225])
```

就需要告诉攻击器标准化参数：

```python
atk.set_normalization_used(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225],
)
```

源码里的逻辑是：攻击前先反标准化回 `[0, 1]` 空间，生成对抗样本后再标准化回模型需要的输入空间。

### 3.3 复现实验时的随机性

README 建议固定随机种子时加上：

```python
torch.backends.cudnn.deterministic = True
```

PGD、RFGSM、随机目标攻击、随机重启等方法都可能含随机初始化。即使 seed 固定，GPU 浮点计算中也可能存在非确定性，所以复现实验时要记录：

- random seed
- CUDA/cuDNN 配置
- 攻击参数
- 模型权重版本
- 数据集样本范围

## 4. 推荐复盘目录结构

如果你自己复盘，建议把项目整理成这样：

```text
adversarial-attacks-pytorch/
├── torchattacks/
│   ├── attack.py              # 攻击基类，负责模式切换、保存加载、标准化、模型状态
│   └── attacks/
│       ├── fgsm.py            # FGSM 实现
│       ├── pgd.py             # PGD 实现
│       └── ...
├── demo/
│   ├── White-box Attack on CIFAR10.ipynb
│   ├── White-box Targeted Attack on CIFAR10.ipynb
│   ├── Transfer Attack on CIFAR10.ipynb
│   └── utils.py
├── README.md
├── setup.py
└── requirements.txt
```

复盘时优先看：

1. `README.md`
2. `demo/White-box Attack on CIFAR10.ipynb`
3. `demo/White-box Targeted Attack on CIFAR10.ipynb`
4. `demo/Transfer Attack on CIFAR10.ipynb`
5. `torchattacks/attack.py`
6. `torchattacks/attacks/pgd.py`
7. `torchattacks/attacks/fgsm.py`

## 5. 通用实验流程

无论是白盒攻击、目标攻击还是迁移攻击，整体流程都差不多。

```text
准备环境
  ↓
导入 torch / torchattacks / robustbench
  ↓
加载数据 images, labels
  ↓
加载模型 model
  ↓
检查干净样本准确率 clean accuracy
  ↓
选择攻击算法 atk
  ↓
设置攻击参数 eps / alpha / steps / random_start
  ↓
如有标准化，调用 set_normalization_used
  ↓
生成对抗样本 adv_images = atk(images, labels)
  ↓
用 model(adv_images) 测鲁棒准确率 / 攻击成功率
  ↓
可视化或保存 adv_images
```

## 6. 白盒攻击流程：White-box Attack on CIFAR10

白盒攻击的含义：攻击者知道目标模型结构和参数，可以对目标模型反向传播求梯度。

demo 文件：`demo/White-box Attack on CIFAR10.ipynb`

### 6.1 导入依赖

```python
import sys
import torch
import torch.nn as nn

sys.path.insert(0, '..')
import torchattacks
```

这里 `sys.path.insert(0, '..')` 是为了在源码目录下直接导入本地 `torchattacks`。

### 6.2 加载 CIFAR10 样本

demo 使用 RobustBench：

```python
from robustbench.data import load_cifar10

images, labels = load_cifar10(n_examples=5)
```

这里取 5 张 CIFAR10 图片做演示。

复盘时要注意：

- `images` 是原始输入图片，形状一般是 `(N, 3, 32, 32)`。
- `labels` 是真实类别标签，形状是 `(N,)`。
- RobustBench 加载的 CIFAR10 图片通常已经是 `[0, 1]` 范围。

### 6.3 加载目标模型

```python
from robustbench.utils import load_model, clean_accuracy

device = "cuda"
model = load_model("Standard", norm="Linf").to(device)
```

这里加载的是 RobustBench 中的 `Standard` CIFAR10 模型。

### 6.4 测干净样本准确率

```python
acc = clean_accuracy(model, images.to(device), labels.to(device))
print("Acc: %2.2f %%" % (acc * 100))
```

这一步是基线检查。

如果干净样本准确率很低，说明模型或数据加载就有问题，后面的攻击结果没有复盘意义。

### 6.5 构造 PGD 攻击器

```python
from torchattacks import PGD

atk = PGD(
    model,
    eps=8/255,
    alpha=2/225,
    steps=10,
    random_start=True,
)
```

参数含义：

- `model`：被攻击的模型。
- `eps`：最大扰动范围，L∞ 约束下每个像素最多改动多少。
- `alpha`：每一步梯度更新的步长。
- `steps`：迭代次数。
- `random_start`：是否从 `[-eps, eps]` 范围内随机初始化扰动。

注意：README 示例里常见 `alpha=2/255`，demo 中写的是 `2/225`。复盘时要如实记录自己使用的参数，因为这个差异会影响攻击强度。

### 6.6 如果模型输入使用标准化

如果你的模型 forward 里不包含标准化，但 dataloader 输入已经标准化，需要：

```python
atk.set_normalization_used(
    mean=[...],
    std=[...],
)
```

如果模型本身内部已经处理标准化，或者输入就是 `[0, 1]`，则不需要设置。

### 6.7 生成对抗样本

```python
adv_images = atk(images, labels)
```

这行会触发：

1. `Attack.__call__`
2. 切换模型到 eval 模式
3. 如果设置了 normalization，先反标准化
4. 调用 `PGD.forward`
5. 得到 `adv_images`
6. 恢复模型原来的 train/eval 状态

### 6.8 评估攻击结果

常见评估指标：

- 干净准确率：`model(images)` 上的准确率。
- 鲁棒准确率：`model(adv_images)` 上仍然分类正确的比例。
- 攻击成功率：`1 - robust_accuracy`。
- 平均扰动大小：例如 L2 distance。

可以这样算：

```python
with torch.no_grad():
    logits = model(adv_images.to(device))
    preds = logits.argmax(dim=1)

robust_acc = (preds == labels.to(device)).float().mean()
attack_success_rate = 1 - robust_acc
```

### 6.9 可视化

demo 的 `utils.py` 中有：

```python
imshow(adv_images[idx:idx+1], title="True:%d, Pre:%d" % (labels[idx], pre))
```

它的作用是把对抗样本显示出来，并把真实标签和预测标签写到标题里。

复盘时建议同时看：

- 原图
- 对抗图
- 扰动图：`adv_images - images`
- 原预测类别
- 攻击后预测类别

## 7. 目标攻击流程：White-box Targeted Attack on CIFAR10

目标攻击的目的不是“让模型错”，而是“让模型错成指定类别”。

demo 文件：`demo/White-box Targeted Attack on CIFAR10.ipynb`

### 7.1 加载模型和数据

这部分和普通白盒攻击一样：

```python
from robustbench.data import load_cifar10
from robustbench.utils import load_model, clean_accuracy

images, labels = load_cifar10(n_examples=5)
device = "cuda"
model = load_model("Standard", norm="Linf").to(device)
```

### 7.2 构造 PGD 攻击器

```python
from torchattacks import PGD

atk = PGD(model, eps=8/255, alpha=2/225, steps=10, random_start=True)
```

### 7.3 切换到 targeted by label 模式

```python
atk.set_mode_targeted_by_label()
```

这个模式的含义是：调用 `atk(images, target_labels)` 时，第二个参数不再表示真实标签，而是目标标签。

### 7.4 构造目标标签

demo 中使用：

```python
new_labels = (labels + 1) % 10
```

含义：

- 原标签 0 变成目标 1
- 原标签 1 变成目标 2
- ...
- 原标签 9 变成目标 0

这是一个简单的目标类别映射。

### 7.5 生成目标攻击样本

```python
adv_images = atk(images, new_labels)
```

### 7.6 检查是否攻击到目标类别

```python
adv_pred = model(adv_images)
print(labels)
print(torch.argmax(adv_pred, 1))
```

目标攻击成功的标准是：

```text
argmax(model(adv_images)) == target_labels
```

而不是仅仅 `!= labels`。

## 8. 其他 targeted mode

README 里还提供了几种目标攻击模式。

### 8.1 随机目标标签

```python
atk.set_mode_targeted_random()
```

库会自动为每个样本随机选一个不同于真实类别的目标类别。

适合快速测试目标攻击，但复现实验时要注意随机性。

### 8.2 最不可能类别

```python
atk.set_mode_targeted_least_likely(kth_min=1)
```

含义：选择模型当前认为概率最低的类别作为目标类别。

如果 `kth_min=2`，就是第二低概率的类别。

### 8.3 自定义映射函数

```python
atk.set_mode_targeted_by_function(
    target_map_function=lambda images, labels: (labels + 1) % 10
)
```

这适合你自己指定类别映射规则。

### 8.4 恢复默认非目标攻击

```python
atk.set_mode_default()
```

恢复后，`labels` 又表示真实标签，攻击目标变回“让模型分类错误”。

## 9. 迁移攻击流程：Transfer Attack on CIFAR10

迁移攻击的核心思想：

1. 在源模型上生成对抗样本。
2. 把这些对抗样本拿去攻击另一个目标模型。
3. 如果目标模型也被欺骗，说明攻击具有 transferability。

demo 文件：`demo/Transfer Attack on CIFAR10.ipynb`

### 9.1 加载数据

```python
from robustbench.data import load_cifar10

images, labels = load_cifar10(n_examples=5)
```

### 9.2 加载源模型

demo 中源模型是：

```python
model = load_model("Wong2020Fast", norm="Linf").to(device)
```

这个模型用于生成对抗样本。

### 9.3 在源模型上生成并保存对抗样本

```python
from torchattacks import PGD

atk = PGD(model, eps=8/255, alpha=2/225, steps=10, random_start=True)
atk.save(data_loader=[(images, labels)], save_path="_transfer.pt")
```

`atk.save` 做了几件事：

- 遍历 `data_loader`
- 对每个 batch 调用攻击器生成 `adv_inputs`
- 计算并打印 robust accuracy、L2 distance、速度
- 把 `adv_inputs` 和 `labels` 保存到 `.pt` 文件

如果设置更多参数，还可以保存：

```python
atk.save(
    data_loader,
    save_path="./data.pt",
    save_predictions=True,
    save_clean_inputs=True,
    save_type="float",
)
```

可保存内容包括：

- `adv_inputs`
- `labels`
- `preds`
- `clean_inputs`
- `save_type`

### 9.4 加载保存的对抗数据

```python
adv_loader = atk.load(load_path="_transfer.pt")
adv_images, labels = iter(adv_loader).next()
```

新版本 PyTorch 中更稳的写法是：

```python
adv_images, labels = next(iter(adv_loader))
```

### 9.5 加载目标模型

demo 中目标模型是：

```python
model = load_model("Standard", norm="Linf").to(device)
```

注意：这里变量名仍然叫 `model`，但它已经从源模型换成了目标模型。

### 9.6 在目标模型上评估迁移攻击效果

```python
acc = clean_accuracy(model, adv_images.to(device), labels.to(device))
print("Acc: %2.2f %%" % (acc * 100))
```

这里的准确率越低，说明对抗样本迁移性越强。

复盘时建议记录：

| 项目 | 内容 |
|---|---|
| 源模型 | 生成对抗样本的模型 |
| 目标模型 | 被迁移攻击评估的模型 |
| 攻击算法 | 如 PGD、MIFGSM、DIFGSM |
| 扰动范数 | L∞ / L2 / L1 / L0 |
| eps | 最大扰动 |
| steps | 迭代步数 |
| 源模型鲁棒准确率 | 源模型在 adv_images 上的准确率 |
| 目标模型鲁棒准确率 | 目标模型在 adv_images 上的准确率 |

## 10. MultiAttack：组合多个攻击

README 中给了三种典型用法。

### 10.1 强攻击组合

```python
atk1 = torchattacks.FGSM(model, eps=8/255)
atk2 = torchattacks.PGD(model, eps=8/255, alpha=2/255, iters=40, random_start=True)
atk = torchattacks.MultiAttack([atk1, atk2])
```

含义：先后使用多个攻击，通常用于更严格评估模型鲁棒性。

### 10.2 CW 的参数搜索

```python
atk1 = torchattacks.CW(model, c=0.1, steps=1000, lr=0.01)
atk2 = torchattacks.CW(model, c=1, steps=1000, lr=0.01)
atk = torchattacks.MultiAttack([atk1, atk2])
```

CW 攻击中的 `c` 很关键，单个值可能不合适，因此可以用多个 `c` 做近似搜索。

### 10.3 PGD 随机重启

```python
atk1 = torchattacks.PGD(model, eps=8/255, alpha=2/255, iters=40, random_start=True)
atk2 = torchattacks.PGD(model, eps=8/255, alpha=2/255, iters=40, random_start=True)
atk = torchattacks.MultiAttack([atk1, atk2])
```

含义：同一种攻击多次随机初始化，增加找到有效对抗样本的概率。

注意：有些版本参数名用 `steps`，README 中部分示例写 `iters`。实际复盘时以你安装版本的类签名为准；当前源码中 PGD 参数名是 `steps`。

## 11. 核心源码机制：Attack 基类

核心文件：`torchattacks/attack.py`

所有攻击类基本都继承：

```python
class Attack(object):
    ...
```

它负责通用流程，具体攻击算法只需要实现 `forward`。

### 11.1 初始化做了什么

初始化时主要设置：

- `self.attack`：攻击名称。
- `self.model`：被攻击模型。
- `self.device`：自动从模型参数推断设备。
- `self.attack_mode`：默认是 `"default"`。
- `self.targeted`：默认是 `False`。
- `self.normalization_used`：是否使用标准化参数。
- 模型训练/评估模式控制参数。

### 11.2 调用攻击器时发生什么

当执行：

```python
adv_images = atk(images, labels)
```

实际调用的是：

```python
Attack.__call__
```

流程可以概括为：

```text
记录模型当前是 train 还是 eval
  ↓
攻击期间按配置切换模型模式
  ↓
如果启用了 normalization：
    对输入 inverse_normalize
    调用具体攻击 forward
    对结果 normalize
否则：
    直接调用具体攻击 forward
  ↓
恢复模型原来的 train/eval 状态
  ↓
返回 adv_inputs
```

### 11.3 模型模式控制

默认情况下，攻击时模型会切到 eval 模式。

如果是 RNN 类模型，eval 模式下可能无法正常计算梯度，可以设置：

```python
atk.set_model_training_mode(
    model_training=True,
    batchnorm_training=False,
    dropout_training=False,
)
```

这表示：

- 整体模型进入 train。
- BatchNorm 仍然保持 eval。
- Dropout 仍然保持 eval。

## 12. PGD 源码逻辑

文件：`torchattacks/attacks/pgd.py`

PGD 是这个项目里最常用、也最适合复盘的攻击之一。

### 12.1 PGD 初始化参数

```python
PGD(model, eps=8/255, alpha=2/255, steps=10, random_start=True)
```

含义：

- `eps`：扰动半径。
- `alpha`：每步更新大小。
- `steps`：迭代次数。
- `random_start`：是否随机初始化。
- 支持模式：`default` 和 `targeted`。

### 12.2 PGD forward 流程

源码逻辑可以概括为：

```text
复制 images 和 labels 到 device
  ↓
如果是 targeted attack：
    根据模式得到 target_labels
  ↓
设置 loss = CrossEntropyLoss
  ↓
adv_images = images 的副本
  ↓
如果 random_start=True：
    在 [-eps, eps] 内随机扰动
    clamp 到 [0, 1]
  ↓
循环 steps 次：
    adv_images.requires_grad = True
    outputs = model(adv_images)
    如果 targeted：
        cost = -CE(outputs, target_labels)
    否则：
        cost = CE(outputs, labels)
    grad = 对 adv_images 求梯度
    adv_images = adv_images + alpha * sign(grad)
    delta = clamp(adv_images - images, -eps, eps)
    adv_images = clamp(images + delta, 0, 1)
  ↓
返回 adv_images
```

### 12.3 为什么 targeted 时 loss 前面是负号

非目标攻击希望模型远离真实标签，所以最大化真实标签上的交叉熵。

目标攻击希望模型靠近目标标签，所以最小化目标标签上的交叉熵。

因为代码更新方向统一写成：

```python
adv_images = adv_images + alpha * grad.sign()
```

所以 targeted 情况下用：

```python
cost = -loss(outputs, target_labels)
```

这样梯度上升 `cost` 就等价于梯度下降目标标签 loss。

## 13. FGSM 源码逻辑

文件：`torchattacks/attacks/fgsm.py`

FGSM 可以看成 PGD 的一步版本。

流程：

```text
复制 images 和 labels 到 device
  ↓
如果是 targeted：
    得到 target_labels
  ↓
images.requires_grad = True
  ↓
outputs = model(images)
  ↓
非目标攻击：cost = CE(outputs, labels)
目标攻击：cost = -CE(outputs, target_labels)
  ↓
grad = 对 images 求梯度
  ↓
adv_images = images + eps * sign(grad)
  ↓
clamp 到 [0, 1]
  ↓
返回 adv_images
```

FGSM 快，但通常弱于多步 PGD。

## 14. 支持的攻击类别梳理

README 列了很多攻击。复盘时可以按范数和用途分类。

### 14.1 L∞ 攻击

常见：

- FGSM
- BIM
- RFGSM
- PGD
- MIFGSM
- TPGD
- EOTPGD
- DIFGSM
- TIFGSM
- NIFGSM
- SINIFGSM
- VMIFGSM
- VNIFGSM
- Jitter
- SPSA
- PIFGSM
- PIFGSM++

适合复盘重点：

- FGSM：一步梯度符号攻击。
- PGD：多步投影梯度攻击，鲁棒性评估常用。
- MIFGSM/DIFGSM/TIFGSM：更偏迁移攻击。

### 14.2 L2 攻击

常见：

- CW
- PGDL2
- APGD
- APGDT
- FAB
- Square
- AutoAttack
- DeepFool
- EADEN

适合复盘重点：

- CW：经典优化式攻击。
- PGDL2：L2 约束下的 PGD。
- AutoAttack：自动组合多种强攻击，常用于鲁棒性评估。

### 14.3 L0 / 稀疏攻击

常见：

- OnePixel
- SparseFool
- Pixle
- JSMA

它们更关注“改动很少像素也能欺骗模型”。

### 14.4 黑盒攻击

常见：

- Square
- SPSA
- Pixle

黑盒攻击不依赖目标模型梯度，通常通过查询或随机搜索构造对抗样本。

## 15. 保存与加载对抗样本

### 15.1 保存

```python
atk.save(data_loader, save_path="./data.pt", verbose=True)
```

保存过程中会打印：

- Save progress
- Robust accuracy
- L2
- 每次迭代耗时

### 15.2 加载

```python
adv_loader = atk.load(load_path="./data.pt")
```

加载后返回的是 PyTorch `DataLoader`。

默认数据顺序：

```text
[adv_inputs, labels]
```

如果保存了 predictions 或 clean inputs，加载时需要指定：

```python
adv_loader = atk.load(
    load_path="./data.pt",
    load_predictions=True,
    load_clean_inputs=True,
)
```

返回顺序会变成：

```text
[adv_inputs, labels, preds, clean_inputs]
```

## 16. 评估指标复盘模板

每次攻击实验建议记录这些字段：

```markdown
| 字段 | 记录 |
|---|---|
| 数据集 | CIFAR10 / ImageNet / 自定义 |
| 样本数量 | 例如 5 / 50 / 10000 |
| 模型 | Standard / Wong2020Fast / 自己的模型 |
| 攻击算法 | FGSM / PGD / CW / AutoAttack |
| 攻击类型 | 非目标 / 目标 / 迁移 |
| 范数约束 | L∞ / L2 / L1 / L0 |
| eps | 例如 8/255 |
| alpha | 例如 2/255 |
| steps | 例如 10 / 40 |
| random_start | True / False |
| clean accuracy | 干净样本准确率 |
| robust accuracy | 对抗样本准确率 |
| attack success rate | 1 - robust accuracy |
| 平均 L2 | 扰动平均 L2 距离 |
| 是否标准化 | mean/std |
| 是否固定随机性 | seed / cudnn.deterministic |
```

## 17. 常见坑

### 17.1 输入不是 `[0, 1]`

如果输入已经标准化，但没有设置 `set_normalization_used`，攻击过程中的 clamp 会把标准化空间当成像素空间，结果会不可信。

### 17.2 模型输出不是 `(N, C)`

`torchattacks` 默认只处理单个分类 logits 输出。多输出模型需要 wrapper。

### 17.3 忘记 `.to(device)`

模型、图片、标签要在同一个设备上。demo 默认：

```python
device = "cuda"
```

如果没有 GPU，要改成：

```python
device = "cpu"
```

### 17.4 目标攻击标签理解错

`set_mode_targeted_by_label()` 之后，传给 `atk(images, labels)` 的第二个参数是目标标签，不是真实标签。

### 17.5 PGD 参数名版本差异

README 部分示例使用 `iters`，当前源码 PGD 类使用 `steps`。

如果报错：

```text
TypeError: __init__() got an unexpected keyword argument 'iters'
```

把 `iters=40` 改成：

```python
steps=40
```

### 17.6 迁移攻击源模型和目标模型混淆

迁移攻击至少有两个模型：

- source model：用来生成对抗样本。
- target model：用来测试对抗样本是否迁移成功。

复盘时必须写清楚。

## 18. 最小可复现脚本：普通白盒 PGD

```python
import torch
from robustbench.data import load_cifar10
from robustbench.utils import load_model, clean_accuracy
from torchattacks import PGD

device = "cuda" if torch.cuda.is_available() else "cpu"

images, labels = load_cifar10(n_examples=5)
model = load_model("Standard", norm="Linf").to(device)
model.eval()

clean_acc = clean_accuracy(model, images.to(device), labels.to(device))

atk = PGD(
    model,
    eps=8/255,
    alpha=2/255,
    steps=10,
    random_start=True,
)

adv_images = atk(images, labels)

with torch.no_grad():
    pred = model(adv_images.to(device)).argmax(dim=1)
    robust_acc = (pred == labels.to(device)).float().mean().item()

print("Clean acc:", clean_acc)
print("Robust acc:", robust_acc)
print("Attack success rate:", 1 - robust_acc)
```

## 19. 最小可复现脚本：目标 PGD

```python
import torch
from robustbench.data import load_cifar10
from robustbench.utils import load_model
from torchattacks import PGD

device = "cuda" if torch.cuda.is_available() else "cpu"

images, labels = load_cifar10(n_examples=5)
model = load_model("Standard", norm="Linf").to(device)
model.eval()

target_labels = (labels + 1) % 10

atk = PGD(model, eps=8/255, alpha=2/255, steps=10, random_start=True)
atk.set_mode_targeted_by_label()

adv_images = atk(images, target_labels)

with torch.no_grad():
    pred = model(adv_images.to(device)).argmax(dim=1).cpu()

print("true labels:", labels)
print("target labels:", target_labels)
print("adv preds:", pred)
print("target success rate:", (pred == target_labels).float().mean().item())
```

## 20. 最小可复现脚本：迁移攻击

```python
import torch
from robustbench.data import load_cifar10
from robustbench.utils import load_model, clean_accuracy
from torchattacks import PGD

device = "cuda" if torch.cuda.is_available() else "cpu"

images, labels = load_cifar10(n_examples=5)

source_model = load_model("Wong2020Fast", norm="Linf").to(device)
source_model.eval()

atk = PGD(source_model, eps=8/255, alpha=2/255, steps=10, random_start=True)
atk.save(data_loader=[(images, labels)], save_path="_transfer.pt")

adv_loader = atk.load(load_path="_transfer.pt")
adv_images, labels = next(iter(adv_loader))

target_model = load_model("Standard", norm="Linf").to(device)
target_model.eval()

transfer_acc = clean_accuracy(target_model, adv_images.to(device), labels.to(device))
print("Target robust accuracy:", transfer_acc)
print("Transfer attack success rate:", 1 - transfer_acc)
```

## 21. 复盘建议顺序

第一遍只跑通：

1. 安装 `torchattacks`。
2. 加载 5 张 CIFAR10 图片。
3. 加载 RobustBench 的 `Standard` 模型。
4. 测干净准确率。
5. 用 PGD 生成对抗样本。
6. 测对抗样本准确率。
7. 可视化一张对抗样本。

第二遍理解参数：

1. 改 `eps`：如 `2/255`、`4/255`、`8/255`、`16/255`。
2. 改 `steps`：如 `1`、`4`、`10`、`40`。
3. 改 `random_start`：比较 True/False。
4. 比较 FGSM 和 PGD。

第三遍理解攻击类型：

1. 非目标 PGD。
2. 目标 PGD。
3. 迁移攻击。
4. MultiAttack。

第四遍看源码：

1. 看 `Attack.__call__`：理解通用调用流程。
2. 看 `PGD.forward`：理解迭代攻击。
3. 看 `FGSM.forward`：理解一步攻击。
4. 看 `Attack.save/load`：理解对抗样本落盘和复用。

## 22. 参考来源

- GitHub README：[Harry24k/adversarial-attacks-pytorch](https://github.com/Harry24k/adversarial-attacks-pytorch)
- CIFAR10 白盒攻击 demo：`demo/White-box Attack on CIFAR10.ipynb`
- CIFAR10 目标攻击 demo：`demo/White-box Targeted Attack on CIFAR10.ipynb`
- CIFAR10 迁移攻击 demo：`demo/Transfer Attack on CIFAR10.ipynb`
- 工具函数：`demo/utils.py`
- 攻击基类：`torchattacks/attack.py`
- PGD 实现：`torchattacks/attacks/pgd.py`
- FGSM 实现：`torchattacks/attacks/fgsm.py`

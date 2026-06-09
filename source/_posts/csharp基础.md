---
title: C# 基础
date: 2026-05-25 15:00:00
categories:
  - 编程基础
tags:
  - CSharp
  - .NET
sticky: 0
---

# C# 是什么

C# 读作 **C Sharp**，是一门由 Microsoft 推出的面向对象编程语言。

它常用于：

- Windows 桌面程序开发
- Web 后端开发
- 游戏开发，比如 Unity
- 命令行工具
- 企业级管理系统
- 跨平台应用开发

简单理解：

```text
C#：编写程序逻辑
.NET：运行 C# 程序的平台和工具集合
Visual Studio / VS Code：常用开发工具
```

---

# 第一个 C# 程序

新建一个 `Program.cs` 文件，写入下面的代码：

```csharp
// 引入 System 命名空间，里面包含 Console 等常用类
using System;

// Program 是程序类，C# 程序通常由类组成
class Program
{
    // Main 方法是程序入口，程序会从这里开始执行
    static void Main()
    {
        // 在控制台输出一行文字
        Console.WriteLine("Hello, C#!");
    }
}
```

运行结果：

```text
Hello, C#!
```

如果使用较新的 .NET，也可以写成更简短的形式：

```csharp
// 直接输出一行文字
Console.WriteLine("Hello, C#!");
```

这种写法叫 **顶级语句**，适合刚入门时快速练习。

---

# 输出内容

C# 中最常用的输出方式是 `Console.WriteLine()` 和 `Console.Write()`。

```csharp
// 输出后自动换行
Console.WriteLine("第一行");

// 输出后不自动换行
Console.Write("第二行");

// 接着上一行继续输出
Console.Write("，还在第二行");
```

运行结果：

```text
第一行
第二行，还在第二行
```

---

# 变量

变量用来保存数据。常见类型如下：

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| int | 整数 | 18 |
| double | 小数 | 3.14 |
| string | 字符串 | "Tom" |
| char | 单个字符 | 'A' |
| bool | 布尔值 | true / false |

示例：

```csharp
// int 用来保存整数
int age = 18;

// double 用来保存小数
double height = 1.75;

// string 用来保存文本
string name = "小明";

// char 用来保存单个字符，注意使用单引号
char grade = 'A';

// bool 用来保存真假
bool isStudent = true;

// 输出变量的值
Console.WriteLine(age);
Console.WriteLine(height);
Console.WriteLine(name);
Console.WriteLine(grade);
Console.WriteLine(isStudent);
```

---

# 字符串拼接和插值

字符串可以用 `+` 拼接，也可以用 `$"{}"` 插值。

```csharp
string name = "小明";
int age = 18;

// 使用 + 拼接字符串
Console.WriteLine("姓名：" + name + "，年龄：" + age);

// 使用字符串插值，更清晰
Console.WriteLine($"姓名：{name}，年龄：{age}");
```

推荐使用字符串插值，因为它更容易阅读。

---

# 接收用户输入

`Console.ReadLine()` 可以读取用户在控制台输入的一行内容。

```csharp
// 提示用户输入姓名
Console.Write("请输入你的姓名：");

// 读取用户输入，并保存到 name 变量
string name = Console.ReadLine();

// 输出欢迎信息
Console.WriteLine($"你好，{name}！");
```

注意：`Console.ReadLine()` 读取到的内容永远是字符串。

如果想读取数字，需要进行类型转换：

```csharp
// 提示用户输入年龄
Console.Write("请输入你的年龄：");

// 先读取字符串
string input = Console.ReadLine();

// 把字符串转换成整数
int age = int.Parse(input);

// 输出转换后的结果
Console.WriteLine($"明年你就 {age + 1} 岁了。");
```

---

# 运算符

C# 支持常见数学运算：

```csharp
int a = 10;
int b = 3;

// 加法
Console.WriteLine(a + b);

// 减法
Console.WriteLine(a - b);

// 乘法
Console.WriteLine(a * b);

// 整数除法，结果还是整数
Console.WriteLine(a / b);

// 取余数
Console.WriteLine(a % b);
```

运行结果：

```text
13
7
30
3
1
```

如果想得到小数结果，可以使用 `double`：

```csharp
double a = 10;
double b = 3;

// double 除法会得到小数结果
Console.WriteLine(a / b);
```

---

# 条件判断

`if` 用来根据条件执行不同代码。

```csharp
int score = 85;

// 如果分数大于等于 60，说明及格
if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}
```

多个条件可以使用 `else if`：

```csharp
int score = 85;

// 根据分数输出等级
if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 80)
{
    Console.WriteLine("良好");
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}
```

---

# 循环

循环用来重复执行代码。

## for 循环

适合知道循环次数的场景。

```csharp
// 从 1 输出到 5
for (int i = 1; i <= 5; i++)
{
    Console.WriteLine(i);
}
```

## while 循环

适合不知道具体循环次数，但知道循环条件的场景。

```csharp
int count = 1;

// 只要 count 小于等于 5，就继续循环
while (count <= 5)
{
    Console.WriteLine(count);

    // 每次循环后让 count 增加 1，避免死循环
    count++;
}
```

---

# 数组

数组用来保存一组相同类型的数据。

```csharp
// 创建一个整数数组
int[] scores = { 90, 85, 70, 60 };

// 输出第一个元素，数组下标从 0 开始
Console.WriteLine(scores[0]);

// 修改第二个元素
scores[1] = 88;

// 遍历数组中的每一个元素
for (int i = 0; i < scores.Length; i++)
{
    Console.WriteLine(scores[i]);
}
```

也可以使用 `foreach` 遍历数组：

```csharp
int[] scores = { 90, 85, 70, 60 };

// foreach 会依次取出数组中的每个元素
foreach (int score in scores)
{
    Console.WriteLine(score);
}
```

---

# 方法

方法可以把一段代码封装起来，方便重复使用。

```csharp
// 定义一个方法，用来计算两个整数的和
static int Add(int a, int b)
{
    // return 表示把结果返回给调用者
    return a + b;
}

// 调用 Add 方法，并接收返回值
int result = Add(3, 5);

// 输出结果
Console.WriteLine(result);
```

如果方法不需要返回值，可以使用 `void`：

```csharp
// 定义一个没有返回值的方法
static void SayHello(string name)
{
    // 直接输出问候语
    Console.WriteLine($"你好，{name}！");
}

// 调用方法
SayHello("小明");
```

---

# 类和对象

C# 是面向对象语言。简单理解：

```text
类：一种模板
对象：根据模板创建出来的具体东西
```

例如定义一个学生类：

```csharp
// 定义一个学生类
class Student
{
    // 字段：保存学生姓名
    public string Name;

    // 字段：保存学生年龄
    public int Age;

    // 方法：让学生进行自我介绍
    public void Introduce()
    {
        Console.WriteLine($"大家好，我叫 {Name}，今年 {Age} 岁。");
    }
}
```

使用这个类：

```csharp
// 创建一个 Student 对象
Student student = new Student();

// 给对象的字段赋值
student.Name = "小明";
student.Age = 18;

// 调用对象的方法
student.Introduce();
```

---

# 属性

实际开发中，通常使用属性而不是直接使用字段。

```csharp
class Student
{
    // 属性：外部可以读取和修改
    public string Name { get; set; }

    // 属性：外部可以读取和修改
    public int Age { get; set; }

    // 方法：输出学生信息
    public void Introduce()
    {
        Console.WriteLine($"姓名：{Name}，年龄：{Age}");
    }
}
```

使用属性：

```csharp
// 创建对象时直接初始化属性
Student student = new Student
{
    Name = "小红",
    Age = 19
};

// 调用方法
student.Introduce();
```

---

# List 集合

数组长度固定，`List<T>` 长度可以动态变化。

```csharp
// 引入集合相关命名空间
using System.Collections.Generic;

// 创建一个字符串 List
List<string> names = new List<string>();

// 添加元素
names.Add("小明");
names.Add("小红");
names.Add("小刚");

// 删除元素
names.Remove("小刚");

// 遍历 List
foreach (string name in names)
{
    Console.WriteLine(name);
}
```

也可以直接初始化：

```csharp
// 创建 List 时直接放入初始数据
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };

// 输出集合长度
Console.WriteLine(numbers.Count);
```

---

# 异常处理

程序运行时可能出现错误，比如输入的不是数字。

可以使用 `try-catch` 捕获异常：

```csharp
try
{
    // 提示用户输入数字
    Console.Write("请输入一个数字：");

    // 尝试把输入内容转换成整数
    int number = int.Parse(Console.ReadLine());

    // 转换成功后输出结果
    Console.WriteLine($"你输入的是：{number}");
}
catch
{
    // 如果转换失败，就执行这里的代码
    Console.WriteLine("输入格式错误，请输入整数。");
}
```

更推荐的写法是 `int.TryParse()`：

```csharp
// 提示用户输入数字
Console.Write("请输入一个数字：");

// 读取用户输入
string input = Console.ReadLine();

// 尝试转换，成功时 number 会得到转换后的值
bool success = int.TryParse(input, out int number);

// 根据转换结果进行判断
if (success)
{
    Console.WriteLine($"转换成功：{number}");
}
else
{
    Console.WriteLine("转换失败，请输入整数。");
}
```

---

# 小练习：成绩判断程序

下面是一个综合练习：输入成绩，判断等级。

```csharp
// 提示用户输入成绩
Console.Write("请输入成绩：");

// 读取用户输入
string input = Console.ReadLine();

// 尝试把输入内容转换成整数
bool success = int.TryParse(input, out int score);

// 如果转换失败，提示错误
if (!success)
{
    Console.WriteLine("请输入正确的整数成绩。");
}
else if (score < 0 || score > 100)
{
    // 判断成绩是否在合理范围内
    Console.WriteLine("成绩范围应该是 0 到 100。");
}
else if (score >= 90)
{
    Console.WriteLine("等级：优秀");
}
else if (score >= 80)
{
    Console.WriteLine("等级：良好");
}
else if (score >= 60)
{
    Console.WriteLine("等级：及格");
}
else
{
    Console.WriteLine("等级：不及格");
}
```

---

# 学习路线

建议按这个顺序学习：

1. 输出、输入、变量
2. 条件判断和循环
3. 数组、List 集合
4. 方法
5. 类、对象、属性
6. 异常处理
7. 文件读写
8. 面向对象进阶：继承、接口、多态
9. 使用 .NET 开发控制台程序、Web 程序或 Unity 游戏

刚开始学习时，不需要一次记住所有语法。先能看懂代码，再能改代码，最后再自己写完整程序。

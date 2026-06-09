---
title: php基础
date: 2026-05-11 19:02:56
categories:
  - 编程基础
tags:
  - PHP
  - 后端
sticky: 0
---

# PHP 基础教学笔记

> 说明：下面全部内容都使用 Markdown 格式，包括代码示例、解释、表格和练习。

---

# 1. PHP 是什么？

PHP 是一种主要用于 **Web 后端开发** 的脚本语言。

简单理解：

```text
HTML：负责网页结构
CSS：负责网页样式
JavaScript：负责网页交互
PHP：负责服务器端逻辑
MySQL：负责保存数据
```

例如一个登录功能：

```text
用户输入账号密码
        ↓
浏览器把账号密码提交给服务器
        ↓
PHP 接收账号密码
        ↓
PHP 查询 MySQL 数据库
        ↓
判断账号密码是否正确
        ↓
返回登录成功或失败
```

PHP 常用于：

```text
1. 网站后端
2. 登录注册
3. 表单提交
4. 数据库操作
5. 文件上传
6. CMS 系统
7. CTF Web 题
```

---

# 2. PHP 文件格式

PHP 文件后缀一般是：

```text
.php
```

例如：

```text
index.php
login.php
upload.php
config.php
```

PHP 代码必须写在：

```php
<?php
    // PHP 代码写这里
?>
```

示例：

```php
<?php
echo "Hello PHP";
?>
```

输出：

```text
Hello PHP
```

---

# 3. PHP 和 HTML 混合写法

PHP 经常和 HTML 一起写。

```php
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PHP 示例</title>
</head>
<body>

<h1>我的第一个 PHP 页面</h1>

<?php
echo "这是 PHP 输出的内容";
?>

</body>
</html>
```

执行后，浏览器最终看到的是 HTML 结果，不会直接看到 PHP 源码。

---

# 4. PHP 运行原理

访问：

```text
http://example.com/index.php
```

执行流程：

```text
1. 浏览器发送 HTTP 请求
2. Web 服务器接收请求
3. 服务器发现请求的是 .php 文件
4. 把 PHP 文件交给 PHP 解释器执行
5. PHP 执行代码，生成 HTML
6. 服务器把 HTML 返回给浏览器
7. 浏览器显示页面
```

重点：

```text
PHP 是在服务器端执行的
浏览器只能看到 PHP 执行后的结果
浏览器看不到 PHP 源码
```

---

# 5. PHP 输出语句

## 5.1 echo

`echo` 是最常用的输出语句。

```php
<?php
echo "Hello World";
?>
```

输出：

```text
Hello World
```

也可以输出多个内容：

```php
<?php
echo "Hello", " PHP";
?>
```

输出：

```text
Hello PHP
```

---

## 5.2 print

```php
<?php
print "Hello PHP";
?>
```

输出：

```text
Hello PHP
```

`echo` 和 `print` 很像，初学阶段主要用 `echo`。

---

## 5.3 var_dump

`var_dump()` 用来查看变量的类型和值。

```php
<?php
$name = "Tom";
var_dump($name);
?>
```

输出类似：

```text
string(3) "Tom"
```

解释：

```text
string 表示字符串
3 表示字符串长度
Tom 是变量的值
```

---

## 5.4 print_r

`print_r()` 常用于打印数组。

```php
<?php
$arr = array("apple", "banana", "orange");
print_r($arr);
?>
```

输出：

```text
Array
(
    [0] => apple
    [1] => banana
    [2] => orange
)
```

---

# 6. PHP 变量

PHP 变量以 `$` 开头。

```php
<?php
$name = "张三";
$age = 18;

echo $name;
echo $age;
?>
```

变量规则：

```text
1. 变量必须以 $ 开头
2. 变量名区分大小写
3. 变量名可以包含字母、数字、下划线
4. 变量名不能以数字开头
```

正确示例：

```php
<?php
$username = "admin";
$user_age = 20;
$_token = "abc123";
?>
```

错误示例：

```php
<?php
$1name = "Tom";      // 错误，不能以数字开头
$user-name = "Tom";  // 错误，不能使用减号
?>
```

---

# 7. PHP 数据类型

PHP 常见数据类型：

| 类型 | 中文含义 | 示例 |
|---|---|---|
| string | 字符串 | `"admin"` |
| integer | 整数 | `100` |
| float | 浮点数 | `3.14` |
| boolean | 布尔值 | `true` / `false` |
| array | 数组 | `[1, 2, 3]` |
| object | 对象 | `new User()` |
| NULL | 空值 | `null` |

示例：

```php
<?php
$name = "Tom";       // string
$age = 18;           // integer
$price = 9.99;       // float
$isLogin = true;     // boolean
$data = null;        // NULL

var_dump($name);
var_dump($age);
var_dump($price);
var_dump($isLogin);
var_dump($data);
?>
```

---

# 8. 字符串

## 8.1 单引号字符串

```php
<?php
$name = 'Tom';
echo $name;
?>
```

输出：

```text
Tom
```

单引号里面的变量不会被解析。

```php
<?php
$name = "Tom";
echo 'Hello $name';
?>
```

输出：

```text
Hello $name
```

---

## 8.2 双引号字符串

双引号里面的变量会被解析。

```php
<?php
$name = "Tom";
echo "Hello $name";
?>
```

输出：

```text
Hello Tom
```

---

## 8.3 字符串拼接

PHP 使用 `.` 拼接字符串。

```php
<?php
$name = "Tom";
echo "Hello " . $name;
?>
```

输出：

```text
Hello Tom
```

多个变量拼接：

```php
<?php
$name = "Tom";
$age = 18;

echo "姓名：" . $name . "，年龄：" . $age;
?>
```

输出：

```text
姓名：Tom，年龄：18
```

---

# 9. 运算符

## 9.1 算术运算符

```php
<?php
$a = 10;
$b = 3;

echo $a + $b; // 加法
echo $a - $b; // 减法
echo $a * $b; // 乘法
echo $a / $b; // 除法
echo $a % $b; // 取余
?>
```

结果解释：

```text
10 + 3 = 13
10 - 3 = 7
10 * 3 = 30
10 / 3 = 3.333...
10 % 3 = 1
```

---

## 9.2 赋值运算符

```php
<?php
$a = 10;

$a += 5; // 等价于 $a = $a + 5
$a -= 2; // 等价于 $a = $a - 2
$a *= 3; // 等价于 $a = $a * 3
$a /= 2; // 等价于 $a = $a / 2
$a %= 3; // 等价于 $a = $a % 3

echo $a;
?>
```

---

## 9.3 比较运算符

```php
<?php
$a = 10;
$b = "10";

var_dump($a == $b);
var_dump($a === $b);
?>
```

输出：

```text
bool(true)
bool(false)
```

解释：

```text
==  只比较值，不比较类型
=== 比较值，也比较类型
```

所以：

```text
10 == "10"   结果是 true
10 === "10" 结果是 false
```

在安全开发和 CTF 中，`===` 比 `==` 更安全。

---

## 9.4 逻辑运算符

```php
<?php
$a = true;
$b = false;

var_dump($a && $b); // 与
var_dump($a || $b); // 或
var_dump(!$a);      // 非
?>
```

输出：

```text
bool(false)
bool(true)
bool(false)
```

解释：

```text
&&：两个都为 true，结果才是 true
||：只要有一个为 true，结果就是 true
! ：取反
```

---

# 10. 条件判断

## 10.1 if

```php
<?php
$age = 18;

if ($age >= 18) {
    echo "成年人";
}
?>
```

输出：

```text
成年人
```

---

## 10.2 if else

```php
<?php
$age = 16;

if ($age >= 18) {
    echo "成年人";
} else {
    echo "未成年人";
}
?>
```

输出：

```text
未成年人
```

---

## 10.3 if elseif else

```php
<?php
$score = 85;

if ($score >= 90) {
    echo "优秀";
} elseif ($score >= 60) {
    echo "及格";
} else {
    echo "不及格";
}
?>
```

输出：

```text
及格
```

---

## 10.4 switch

```php
<?php
$level = "admin";

switch ($level) {
    case "admin":
        echo "管理员";
        break;

    case "user":
        echo "普通用户";
        break;

    default:
        echo "未知用户";
}
?>
```

输出：

```text
管理员
```

`break` 的作用：

```text
结束当前 case，防止继续往下执行
```

---

# 11. 循环

## 11.1 for 循环

```php
<?php
for ($i = 1; $i <= 5; $i++) {
    echo $i . "<br>";
}
?>
```

输出：

```html
1<br>
2<br>
3<br>
4<br>
5<br>
```

浏览器显示为：

```text
1
2
3
4
5
```

解释：

```text
$i = 1      初始值
$i <= 5     循环条件
$i++        每次循环后加 1
```

---

## 11.2 while 循环

```php
<?php
$i = 1;

while ($i <= 5) {
    echo $i . "<br>";
    $i++;
}
?>
```

输出：

```text
1
2
3
4
5
```

---

## 11.3 do while 循环

```php
<?php
$i = 1;

do {
    echo $i . "<br>";
    $i++;
} while ($i <= 5);
?>
```

输出：

```text
1
2
3
4
5
```

特点：

```text
do while 至少执行一次
```

---

## 11.4 foreach 循环

`foreach` 常用于遍历数组。

```php
<?php
$arr = array("apple", "banana", "orange");

foreach ($arr as $item) {
    echo $item . "<br>";
}
?>
```

输出：

```text
apple
banana
orange
```

---

# 12. 数组

## 12.1 索引数组

索引数组就是下标为数字的数组。

```php
<?php
$arr = array("apple", "banana", "orange");

echo $arr[0];
echo $arr[1];
echo $arr[2];
?>
```

输出：

```text
applebananaorange
```

新版写法：

```php
<?php
$arr = ["apple", "banana", "orange"];
?>
```

---

## 12.2 关联数组

关联数组就是下标是字符串。

```php
<?php
$user = [
    "username" => "admin",
    "password" => "123456",
    "role" => "root"
];

echo $user["username"];
echo $user["password"];
?>
```

输出：

```text
admin123456
```

类似 Python 字典：

```python
user = {
    "username": "admin",
    "password": "123456"
}
```

---

## 12.3 多维数组

```php
<?php
$users = [
    [
        "username" => "admin",
        "age" => 20
    ],
    [
        "username" => "test",
        "age" => 18
    ]
];

echo $users[0]["username"];
echo $users[1]["username"];
?>
```

输出：

```text
admintest
```

---

## 12.4 遍历关联数组

```php
<?php
$user = [
    "username" => "admin",
    "password" => "123456",
    "role" => "root"
];

foreach ($user as $key => $value) {
    echo $key . " => " . $value . "<br>";
}
?>
```

输出：

```text
username => admin
password => 123456
role => root
```

---

# 13. 函数

## 13.1 定义函数

```php
<?php
function sayHello() {
    echo "Hello PHP";
}

sayHello();
?>
```

输出：

```text
Hello PHP
```

---

## 13.2 带参数的函数

```php
<?php
function sayHello($name) {
    echo "Hello " . $name;
}

sayHello("Tom");
?>
```

输出：

```text
Hello Tom
```

---

## 13.3 带返回值的函数

```php
<?php
function add($a, $b) {
    return $a + $b;
}

$result = add(10, 20);
echo $result;
?>
```

输出：

```text
30
```

---

# 14. GET 请求参数

GET 参数通常出现在 URL 里面。

例如：

```text
http://example.com/index.php?id=1&name=admin
```

PHP 使用 `$_GET` 接收：

```php
<?php
$id = $_GET["id"];
$name = $_GET["name"];

echo "id 是：" . $id . "<br>";
echo "name 是：" . $name;
?>
```

访问：

```text
index.php?id=1&name=admin
```

输出：

```text
id 是：1
name 是：admin
```

---

## 14.1 判断 GET 参数是否存在

直接写：

```php
$id = $_GET["id"];
```

如果没有传 `id`，可能会报错。

更安全写法：

```php
<?php
if (isset($_GET["id"])) {
    $id = $_GET["id"];
    echo $id;
} else {
    echo "没有传 id 参数";
}
?>
```

访问：

```text
index.php?id=100
```

输出：

```text
100
```

访问：

```text
index.php
```

输出：

```text
没有传 id 参数
```

---

# 15. POST 请求参数

POST 参数一般来自表单。

HTML 表单：

```html
<form method="post" action="login.php">
    用户名：<input type="text" name="username">
    密码：<input type="password" name="password">
    <button type="submit">登录</button>
</form>
```

PHP 接收：

```php
<?php
$username = $_POST["username"];
$password = $_POST["password"];

echo "用户名：" . $username . "<br>";
echo "密码：" . $password;
?>
```

---

# 16. GET 和 POST 的区别

| 对比 | GET | POST |
|---|---|---|
| 参数位置 | URL 里面 | 请求体里面 |
| 是否容易看到 | 容易看到 | 不直接显示在 URL |
| 适合场景 | 查询数据 | 提交数据 |
| 数据长度 | 较短 | 相对较大 |
| 传密码是否合适 | 不合适 | 比 GET 好，但仍需 HTTPS |

注意：

```text
POST 不是绝对安全。
如果没有 HTTPS，POST 数据也可能被抓包看到。
```

---

# 17. 常见超全局变量

PHP 中常见超全局变量：

| 变量 | 作用 |
|---|---|
| `$_GET` | 接收 GET 参数 |
| `$_POST` | 接收 POST 参数 |
| `$_REQUEST` | 接收 GET、POST、COOKIE 参数 |
| `$_COOKIE` | 接收 Cookie |
| `$_SESSION` | 接收 Session |
| `$_FILES` | 接收上传文件 |
| `$_SERVER` | 获取服务器和请求信息 |

示例：

```php
<?php
echo $_SERVER["REQUEST_METHOD"] . "<br>";
echo $_SERVER["REMOTE_ADDR"] . "<br>";
echo $_SERVER["HTTP_USER_AGENT"] . "<br>";
?>
```

---

# 18. 表单登录示例

## 18.1 login.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>登录页面</title>
</head>
<body>

<form method="post" action="login.php">
    用户名：<input type="text" name="username"><br>
    密码：<input type="password" name="password"><br>
    <button type="submit">登录</button>
</form>

</body>
</html>
```

---

## 18.2 login.php

```php
<?php
$username = $_POST["username"];
$password = $_POST["password"];

if ($username === "admin" && $password === "123456") {
    echo "登录成功";
} else {
    echo "登录失败";
}
?>
```

测试输入：

```text
用户名：admin
密码：123456
```

输出：

```text
登录成功
```

测试输入：

```text
用户名：admin
密码：111111
```

输出：

```text
登录失败
```

---

# 19. include 和 require

PHP 可以引入其他 PHP 文件。

## 19.1 include

```php
<?php
include "config.php";
?>
```

如果文件不存在：

```text
include 会警告，但程序可能继续执行
```

---

## 19.2 require

```php
<?php
require "config.php";
?>
```

如果文件不存在：

```text
require 会报错，程序停止执行
```

---

## 19.3 示例

`config.php`：

```php
<?php
$db_host = "localhost";
$db_user = "root";
$db_pass = "123456";
?>
```

`index.php`：

```php
<?php
require "config.php";

echo $db_host;
?>
```

输出：

```text
localhost
```

---

# 20. 文件操作

## 20.1 读取文件

```php
<?php
$content = file_get_contents("test.txt");
echo $content;
?>
```

如果 `test.txt` 内容是：

```text
Hello PHP
```

输出：

```text
Hello PHP
```

---

## 20.2 写入文件

```php
<?php
file_put_contents("test.txt", "Hello PHP");
?>
```

效果：

```text
会把 Hello PHP 写入 test.txt
如果 test.txt 原来有内容，会被覆盖
```

---

## 20.3 追加写入

```php
<?php
file_put_contents("test.txt", "新内容\n", FILE_APPEND);
?>
```

效果：

```text
不会覆盖原内容
会在文件末尾追加新内容
```

---

## 20.4 判断文件是否存在

```php
<?php
if (file_exists("test.txt")) {
    echo "文件存在";
} else {
    echo "文件不存在";
}
?>
```

---

# 21. Cookie

Cookie 是保存在浏览器里的小数据。

## 21.1 设置 Cookie

```php
<?php
setcookie("username", "admin", time() + 3600);
echo "Cookie 设置成功";
?>
```

解释：

```text
username        Cookie 名
admin           Cookie 值
time() + 3600   有效期 1 小时
```

---

## 21.2 读取 Cookie

```php
<?php
echo $_COOKIE["username"];
?>
```

输出：

```text
admin
```

注意：

```text
setcookie() 必须在页面输出内容之前执行
```

错误示例：

```php
<?php
echo "hello";
setcookie("username", "admin");
?>
```

可能会报错，因为已经输出了内容。

---

# 22. Session

Session 是保存在服务器端的会话数据。

使用 Session 前要先写：

```php
session_start();
```

---

## 22.1 设置 Session

```php
<?php
session_start();

$_SESSION["username"] = "admin";

echo "Session 设置成功";
?>
```

---

## 22.2 读取 Session

```php
<?php
session_start();

echo $_SESSION["username"];
?>
```

输出：

```text
admin
```

---

## 22.3 删除 Session

```php
<?php
session_start();

unset($_SESSION["username"]);
session_destroy();

echo "Session 已删除";
?>
```

---

# 23. Cookie 和 Session 的区别

| 对比 | Cookie | Session |
|---|---|---|
| 保存位置 | 浏览器 | 服务器 |
| 安全性 | 较低 | 较高 |
| 容量 | 较小 | 相对较大 |
| 是否可被用户修改 | 可以 | 一般不能直接修改 |
| 常见用途 | 记住用户信息 | 登录状态 |

登录状态一般用：

```text
Session
```

---

# 24. 文件上传

## 24.1 HTML 上传表单

```html
<form method="post" action="upload.php" enctype="multipart/form-data">
    <input type="file" name="file">
    <button type="submit">上传</button>
</form>
```

注意：

```text
文件上传必须加 enctype="multipart/form-data"
```

---

## 24.2 upload.php

```php
<?php
$fileName = $_FILES["file"]["name"];
$tmpName = $_FILES["file"]["tmp_name"];

move_uploaded_file($tmpName, "uploads/" . $fileName);

echo "上传成功";
?>
```

---

## 24.3 查看 $_FILES 内容

```php
<?php
var_dump($_FILES);
?>
```

常见字段：

| 字段 | 含义 |
|---|---|
| `name` | 原始文件名 |
| `type` | 文件 MIME 类型 |
| `tmp_name` | 临时文件路径 |
| `error` | 上传错误码 |
| `size` | 文件大小 |

---

## 24.4 文件上传安全问题

不安全写法：

```php
<?php
$fileName = $_FILES["file"]["name"];
$tmpName = $_FILES["file"]["tmp_name"];

move_uploaded_file($tmpName, "uploads/" . $fileName);
?>
```

问题：

```text
1. 没有检查文件类型
2. 没有检查文件后缀
3. 没有重命名文件
4. 可能上传 PHP 木马
5. 可能造成路径穿越
```

更安全思路：

```text
1. 限制文件后缀
2. 限制 MIME 类型
3. 限制文件大小
4. 上传后重命名
5. 上传目录禁止执行 PHP
6. 不要相信用户传来的文件名
```

---

# 25. PHP 连接 MySQL

PHP 连接 MySQL 常见方式：

```text
1. mysqli
2. PDO
```

新手可以先学 `mysqli`。

---

## 25.1 mysqli 连接数据库

```php
<?php
$conn = mysqli_connect("localhost", "root", "123456", "test");

if (!$conn) {
    die("数据库连接失败：" . mysqli_connect_error());
}

echo "数据库连接成功";
?>
```

解释：

```text
localhost   数据库地址
root        数据库用户名
123456      数据库密码
test        数据库名
```

---

## 25.2 查询数据

假设数据库中有表：

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50),
    password VARCHAR(50)
);
```

PHP 查询：

```php
<?php
$conn = mysqli_connect("localhost", "root", "123456", "test");

$sql = "SELECT * FROM users";
$result = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($result)) {
    echo $row["id"] . " ";
    echo $row["username"] . " ";
    echo $row["password"] . "<br>";
}
?>
```

---

## 25.3 插入数据

```php
<?php
$conn = mysqli_connect("localhost", "root", "123456", "test");

$username = "admin";
$password = "123456";

$sql = "INSERT INTO users(username, password) VALUES('$username', '$password')";

if (mysqli_query($conn, $sql)) {
    echo "插入成功";
} else {
    echo "插入失败：" . mysqli_error($conn);
}
?>
```

---

# 26. SQL 注入基础

下面这个代码有安全问题：

```php
<?php
$conn = mysqli_connect("localhost", "root", "123456", "test");

$username = $_POST["username"];
$password = $_POST["password"];

$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";

$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    echo "登录成功";
} else {
    echo "登录失败";
}
?>
```

如果用户输入：

```text
username: admin' OR '1'='1
password: 随便
```

SQL 可能变成：

```sql
SELECT * FROM users WHERE username='admin' OR '1'='1' AND password='随便'
```

这可能造成登录绕过。

---

## 26.1 防御 SQL 注入

核心原则：

```text
不要直接把用户输入拼接进 SQL
使用预处理语句
```

mysqli 预处理示例：

```php
<?php
$conn = mysqli_connect("localhost", "root", "123456", "test");

$username = $_POST["username"];
$password = $_POST["password"];

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE username=? AND password=?");

mysqli_stmt_bind_param($stmt, "ss", $username, $password);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) > 0) {
    echo "登录成功";
} else {
    echo "登录失败";
}
?>
```

解释：

```text
? 表示占位符
ss 表示两个参数都是 string 字符串
bind_param 把变量绑定到占位符
```

---

# 27. PHP 常见危险函数

CTF Web 题里经常考 PHP 危险函数。

---

## 27.1 命令执行函数

常见函数：

```text
system()
exec()
shell_exec()
passthru()
popen()
proc_open()
```

示例：

```php
<?php
system("whoami");
?>
```

如果命令来自用户输入，就很危险。

危险代码：

```php
<?php
$cmd = $_GET["cmd"];
system($cmd);
?>
```

访问：

```text
http://example.com/test.php?cmd=whoami
```

服务器可能会执行：

```bash
whoami
```

---

## 27.2 代码执行函数

常见函数：

```text
eval()
assert()
```

危险代码：

```php
<?php
$code = $_GET["code"];
eval($code);
?>
```

访问：

```text
http://example.com/test.php?code=phpinfo();
```

可能执行 PHP 代码。

---

## 27.3 文件包含函数

常见函数：

```text
include()
require()
include_once()
require_once()
```

危险代码：

```php
<?php
$page = $_GET["page"];
include $page;
?>
```

访问：

```text
http://example.com/index.php?page=../../../../etc/passwd
```

可能造成文件包含或敏感文件读取。

---

# 28. PHP 弱类型问题

PHP 是弱类型语言，有时会自动转换类型。

示例：

```php
<?php
var_dump("123" == 123);
var_dump("123" === 123);
?>
```

输出：

```text
bool(true)
bool(false)
```

重点：

```text
==  会自动类型转换
=== 不会自动类型转换
```

---

## 28.1 md5 弱比较

经典 CTF 例子：

```php
<?php
$a = $_GET["a"];
$b = $_GET["b"];

if ($a != $b && md5($a) == md5($b)) {
    echo "flag";
}
?>
```

某些字符串的 md5 值长得像：

```text
0e123456789...
```

PHP 用 `==` 比较时，可能把它当成数字 `0`，从而造成绕过。

更安全写法：

```php
<?php
if (md5($a) === md5($b)) {
    echo "safe";
}
?>
```

---

# 29. PHP 魔术方法

面向对象和反序列化中常见。

| 魔术方法 | 触发时机 |
|---|---|
| `__construct()` | 创建对象时自动调用 |
| `__destruct()` | 对象销毁时自动调用 |
| `__toString()` | 对象被当作字符串时调用 |
| `__wakeup()` | `unserialize()` 时调用 |
| `__sleep()` | `serialize()` 时调用 |
| `__call()` | 调用不存在的方法时调用 |
| `__get()` | 访问不存在或不可访问属性时调用 |
| `__set()` | 设置不存在或不可访问属性时调用 |

示例：

```php
<?php
class User {
    public function __construct() {
        echo "对象创建了<br>";
    }

    public function __destruct() {
        echo "对象销毁了<br>";
    }
}

$user = new User();
?>
```

输出：

```text
对象创建了
对象销毁了
```

---

# 30. 序列化和反序列化

## 30.1 serialize

```php
<?php
$user = [
    "username" => "admin",
    "role" => "root"
];

$str = serialize($user);

echo $str;
?>
```

输出类似：

```text
a:2:{s:8:"username";s:5:"admin";s:4:"role";s:4:"root";}
```

---

## 30.2 unserialize

```php
<?php
$str = 'a:2:{s:8:"username";s:5:"admin";s:4:"role";s:4:"root";}';

$data = unserialize($str);

print_r($data);
?>
```

输出：

```text
Array
(
    [username] => admin
    [role] => root
)
```

---

## 30.3 反序列化安全问题

危险代码：

```php
<?php
$data = $_GET["data"];
$obj = unserialize($data);
?>
```

风险：

```text
如果反序列化用户可控数据，可能触发对象魔术方法，造成漏洞。
```

CTF 中常见：

```text
PHP 反序列化
POP 链
__wakeup 绕过
__destruct 触发
```

---

# 31. 常见 PHP Web 漏洞类型

PHP 在 CTF Web 中常见漏洞：

```text
1. SQL 注入
2. 命令执行
3. 代码执行
4. 文件包含
5. 文件上传
6. 弱类型比较
7. 变量覆盖
8. 反序列化
9. 任意文件读取
10. 路径穿越
11. SSRF
12. Session 伪造
13. Cookie 伪造
```

---

# 32. PHP 基础练习

## 练习 1：输出个人信息

要求：

```text
定义 name、age、school 三个变量
输出：我叫 xxx，今年 xx 岁，来自 xxx
```

参考代码：

```php
<?php
$name = "张三";
$age = 18;
$school = "某某大学";

echo "我叫 " . $name . "，今年 " . $age . " 岁，来自 " . $school;
?>
```

---

## 练习 2：判断成绩

要求：

```text
分数 >= 90 输出 优秀
分数 >= 60 输出 及格
否则输出 不及格
```

参考代码：

```php
<?php
$score = 75;

if ($score >= 90) {
    echo "优秀";
} elseif ($score >= 60) {
    echo "及格";
} else {
    echo "不及格";
}
?>
```

---

## 练习 3：遍历数组

要求：

```text
定义一个数组，里面有 3 个用户名
用 foreach 输出
```

参考代码：

```php
<?php
$users = ["admin", "test", "guest"];

foreach ($users as $user) {
    echo $user . "<br>";
}
?>
```

---

## 练习 4：GET 参数

要求：

```text
访问 index.php?name=admin
页面输出：你好 admin
```

参考代码：

```php
<?php
if (isset($_GET["name"])) {
    echo "你好 " . $_GET["name"];
} else {
    echo "请传入 name 参数";
}
?>
```

---

## 练习 5：简单登录

要求：

```text
username=admin
password=123456
登录成功
否则登录失败
```

参考代码：

```php
<?php
$username = $_POST["username"];
$password = $_POST["password"];

if ($username === "admin" && $password === "123456") {
    echo "登录成功";
} else {
    echo "登录失败";
}
?>
```

---

# 33. PHP 学习路线

## 第一阶段：语法基础

```text
1. PHP 文件结构
2. 变量
3. 数据类型
4. 字符串
5. 运算符
6. if 判断
7. for / while / foreach 循环
8. 数组
9. 函数
```

---

## 第二阶段：Web 基础

```text
1. GET 参数
2. POST 参数
3. 表单提交
4. Cookie
5. Session
6. 文件上传
7. 文件读取
8. include / require
```

---

## 第三阶段：数据库

```text
1. MySQL 基础
2. mysqli 连接数据库
3. 增删改查
4. 登录注册功能
5. 预处理语句
6. SQL 注入防御
```

---

## 第四阶段：安全方向

```text
1. SQL 注入
2. XSS
3. 文件上传漏洞
4. 命令执行漏洞
5. 文件包含漏洞
6. PHP 弱类型
7. 反序列化漏洞
8. 代码审计
```

---

## 第五阶段：CTF Web

```text
1. PHP 代码审计题
2. GET / POST 参数题
3. 弱类型绕过题
4. 文件包含题
5. 文件上传题
6. 反序列化题
7. 命令执行题
```

---

# 34. 新手必须记住的 PHP 重点

```text
1. PHP 代码写在 <?php ?> 中
2. 变量必须以 $ 开头
3. echo 用来输出内容
4. . 用来拼接字符串
5. $_GET 接收 URL 参数
6. $_POST 接收表单参数
7. $_FILES 接收上传文件
8. $_SESSION 保存登录状态
9. include / require 可以引入文件
10. 不要直接拼接用户输入到 SQL
11. == 有弱类型问题，安全判断优先用 ===
12. eval、system、include 用户可控时非常危险
```

---

# 35. 最小 PHP 示例

创建文件：

```text
index.php
```

内容：

```php
<?php
$name = "PHP";

echo "Hello " . $name;
?>
```

运行方式：

```bash
php -S 127.0.0.1:8000
```

浏览器访问：

```text
http://127.0.0.1:8000/index.php
```

输出：

```text
Hello PHP
```

---

# 36. 一句话总结

PHP 是服务器端脚本语言，主要用于 Web 后端开发。

学习顺序：

```text
基础语法
↓
GET / POST / 表单
↓
Cookie / Session
↓
文件操作 / 文件上传
↓
MySQL 数据库
↓
PHP Web 安全漏洞
↓
CTF Web 代码审计
```



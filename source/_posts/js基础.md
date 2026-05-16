---
title: js基础
date: 2026-05-09 20:19:32
categories:
  - 学习
  - 基础知识
tags:
  - 简单知识
sticky: 0
---



# JavaScript 是什么

JavaScript 简称 **JS**，是一门主要用于网页交互的脚本语言。

它可以用来：

- 修改网页内容
- 控制页面样式
- 处理用户点击、输入等事件
- 发送网络请求
- 操作浏览器中的数据
- 配合 HTML / CSS 实现动态网页

在 Web CTF 中，JS 常用于：

- 前端校验
- 参数生成
- 加密 / 编码
- 登录逻辑
- 跳转控制
- 隐藏接口
- flag 提示

---

# JS 写在哪里

## 1. 写在 HTML 的 `<script>` 标签里

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JS 示例</title>
</head>
<body>

  <h1>Hello</h1>

  <script>
    alert("这是 JavaScript");
  </script>

</body>
</html>
```

---

## 2. 写在单独的 `.js` 文件里

HTML：

```html
<script src="./index.js"></script>
```

index.js：

```javascript
console.log("这是外部 JS 文件");
```

---

# 输出内容

## 1. 输出到控制台

```javascript
console.log("Hello JavaScript");
```

在浏览器中按：

```text
F12 -> Console
```

可以看到输出。

---

## 2. 弹窗输出

```javascript
alert("你好");
```

---

## 3. 写入网页

```javascript
document.write("Hello");
```

---

# 变量

JS 中常见变量声明方式：

```javascript
var a = 10;
let b = 20;
const c = 30;
```

---

## 1. var

```javascript
var name = "Tom";
console.log(name);
```

`var` 是早期写法，现在不推荐大量使用。

---

## 2. let

```javascript
let age = 18;
age = 19;

console.log(age);
```

`let` 声明的变量可以重新赋值。

---

## 3. const

```javascript
const pi = 3.14;
console.log(pi);
```

`const` 声明的是常量，不能重新赋值。

错误示例：

```javascript
const x = 10;
x = 20; // 报错
```

---

## 推荐使用

```text
能用 const 就用 const
需要修改再用 let
尽量少用 var
```

---

# 数据类型

JavaScript 常见数据类型：

- Number：数字
- String：字符串
- Boolean：布尔值
- Undefined：未定义
- Null：空值
- Object：对象
- Array：数组

---

## 1. Number 数字

```javascript
let age = 18;
let price = 9.9;

console.log(age);
console.log(price);
```

---

## 2. String 字符串

```javascript
let name = "Tom";
let city = 'Changsha';

console.log(name);
console.log(city);
```

也可以使用反引号：

```javascript
let name = "Tom";
let msg = `Hello, ${name}`;

console.log(msg);
```

输出：

```text
Hello, Tom
```

---

## 3. Boolean 布尔值

```javascript
let isLogin = true;
let isAdmin = false;

console.log(isLogin);
console.log(isAdmin);
```

---

## 4. Undefined

```javascript
let x;
console.log(x);
```

输出：

```text
undefined
```

表示变量声明了，但没有赋值。

---

## 5. Null

```javascript
let user = null;
console.log(user);
```

表示空值。

---

## 6. Object 对象

```javascript
let user = {
  username: "admin",
  password: "123456",
  age: 18
};

console.log(user.username);
console.log(user.password);
```

---

## 7. Array 数组

```javascript
let arr = [10, 20, 30];

console.log(arr[0]);
console.log(arr[1]);
console.log(arr[2]);
```

注意：

```text
数组下标从 0 开始
```

---

# typeof 查看类型

```javascript
console.log(typeof 123);
console.log(typeof "hello");
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof {});
console.log(typeof []);
```

输出大概是：

```text
number
string
boolean
undefined
object
object
object
```

注意：

```javascript
typeof null
```

结果是：

```text
object
```

这是 JS 的历史遗留问题。

---

# 运算符

## 1. 算术运算符

```javascript
let a = 10;
let b = 3;

console.log(a + b); // 13
console.log(a - b); // 7
console.log(a * b); // 30
console.log(a / b); // 3.333...
console.log(a % b); // 1
```

---

## 2. 字符串拼接

```javascript
let name = "Tom";
let msg = "Hello " + name;

console.log(msg);
```

输出：

```text
Hello Tom
```

推荐使用模板字符串：

```javascript
let name = "Tom";
let msg = `Hello ${name}`;

console.log(msg);
```

---

## 3. 比较运算符

```javascript
console.log(10 > 5);   // true
console.log(10 < 5);   // false
console.log(10 >= 10); // true
console.log(10 <= 9);  // false
```

---

## 4. == 和 === 的区别

```javascript
console.log(1 == "1");   // true
console.log(1 === "1");  // false
```

区别：

```text
==  只比较值，会自动类型转换
=== 比较值和类型，不会自动类型转换
```

推荐使用：

```javascript
===
```

---

## 5. 逻辑运算符

```javascript
let a = true;
let b = false;

console.log(a && b); // false
console.log(a || b); // true
console.log(!a);     // false
```

含义：

```text
&&  并且
||  或者
!   取反
```

---

# 条件判断

## 1. if

```javascript
let age = 18;

if (age >= 18) {
  console.log("成年人");
}
```

---

## 2. if else

```javascript
let age = 16;

if (age >= 18) {
  console.log("成年人");
} else {
  console.log("未成年人");
}
```

---

## 3. else if

```javascript
let score = 85;

if (score >= 90) {
  console.log("优秀");
} else if (score >= 60) {
  console.log("及格");
} else {
  console.log("不及格");
}
```

---

## 4. 三元运算符

```javascript
let age = 18;

let result = age >= 18 ? "成年人" : "未成年人";

console.log(result);
```

---

# 循环

## 1. for 循环

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

输出：

```text
0
1
2
3
4
```

---

## 2. while 循环

```javascript
let i = 0;

while (i < 5) {
  console.log(i);
  i++;
}
```

---

## 3. 遍历数组

```javascript
let arr = ["HTML", "CSS", "JavaScript"];

for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```

---

## 4. for...of

```javascript
let arr = ["HTML", "CSS", "JavaScript"];

for (let item of arr) {
  console.log(item);
}
```

---

# 函数

函数用于封装一段可以重复使用的代码。

---

## 1. 普通函数

```javascript
function sayHello() {
  console.log("Hello");
}

sayHello();
```

---

## 2. 带参数的函数

```javascript
function add(a, b) {
  console.log(a + b);
}

add(3, 5);
```

输出：

```text
8
```

---

## 3. 有返回值的函数

```javascript
function add(a, b) {
  return a + b;
}

let result = add(3, 5);

console.log(result);
```

---

## 4. 函数表达式

```javascript
const sayHello = function() {
  console.log("Hello");
};

sayHello();
```

---

## 5. 箭头函数

箭头函数是 JavaScript 中一种更简洁的函数写法。

普通函数写法：

```javascript
function add(a, b) {
  return a + b;
}
```

箭头函数写法：

```javascript
const add = (a, b) => {
  return a + b;
};

console.log(add(3, 5));
```

如果函数体只有一行，可以简写：

```javascript
const add = (a, b) => a + b;

console.log(add(3, 5));
```

---

# 数组

## 1. 创建数组

```javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr);
```

---

## 2. 获取数组元素

```javascript
let arr = ["a", "b", "c"];

console.log(arr[0]); // a
console.log(arr[1]); // b
```

---

## 3. 数组长度

```javascript
let arr = [1, 2, 3];

console.log(arr.length);
```

---

## 4. 添加元素

```javascript
let arr = [1, 2, 3];

arr.push(4);

console.log(arr);
```

输出：

```text
[1, 2, 3, 4]
```

---

## 5. 删除最后一个元素

```javascript
let arr = [1, 2, 3];

arr.pop();

console.log(arr);
```

输出：

```text
[1, 2]
```

---

## 6. map

map 是什么

`map()` 用来遍历数组，并把数组中的每一项处理后，生成一个新的数组。

```javascript
let arr = [1, 2, 3];

let result = arr.map(function(item) {
  return item * 2;
});

console.log(result);
```

输出：

```text
[2, 4, 6]
```

箭头函数写法：

```javascript
let arr = [1, 2, 3];

let result = arr.map(item => item * 2);

console.log(result);
```

---

## 7. filter

filter() 用来筛选所有符合条件的元素。

```javascript
let arr = [1, 2, 3, 4, 5];

let result = arr.filter(item => item > 3);

console.log(result);
```

输出：

```text
[4, 5]
```

---

## 8. find

find() 用来查找第一个符合条件的元素。

```javascript
let users = [
  { id: 1, name: "Tom" },
  { id: 2, name: "Jerry" }
];

let user = users.find(item => item.id === 2);

console.log(user);
```

输出：

```javascript
{ id: 2, name: "Jerry" }
```

---

# 对象

## 1. 创建对象

```javascript
let user = {
  username: "admin",
  password: "123456",
  age: 18
};
```

---

## 2. 访问对象属性

```javascript
console.log(user.username);
console.log(user["password"]);
```

---

## 3. 修改对象属性

```javascript
user.age = 20;

console.log(user.age);
```

---

## 4. 添加属性

```javascript
user.role = "admin";

console.log(user);
```

---

## 5. 删除属性

```javascript
delete user.password;

console.log(user);
```

---

## 6. 遍历对象

```javascript
let user = {
  username: "admin",
  age: 18,
  role: "root"
};

for (let key in user) {
  console.log(key, user[key]);
}
```

---

# DOM 基础与操作

---

## 1. DOM 是什么

DOM（Document Object Model，文档对象模型）是浏览器把 HTML 页面解析成的一棵对象树。  
每一个 HTML 元素都会成为 DOM 树中的一个节点，JavaScript 可以通过 DOM 来访问和修改这些节点，从而动态改变网页内容和行为。

### 核心概念

- **节点**：HTML 标签对应的对象
- **文档对象**：整个 HTML 页面对应的对象，即 `document`
- **操作**：获取元素、修改内容、修改样式、绑定事件等

---

## 2. 获取元素

### 2.1 根据 id 获取元素

HTML：

```html
<h1 id="title">Hello World</h1>
```

JS：

```javascript
let title = document.getElementById("title");

console.log(title);
```

说明：

- `document.getElementById("title")`：根据 HTML 元素的 `id` 获取对应的 DOM 元素
- 返回值是 **元素对象**，如果不存在则返回 `null`
- `console.log(title)` 会在控制台显示整个元素 `<h1 id="title">Hello World</h1>`

---

### 2.2 根据 class 获取元素集合

HTML：

```html
<p class="item">A</p>
<p class="item">B</p>
<p class="item">C</p>
```

JS：

```javascript
let items = document.getElementsByClassName("item");

console.log(items[0].innerText); // 输出 A
```

说明：

- `getElementsByClassName` 返回的是 **HTMLCollection**（类数组对象）
- 可以通过索引访问每个元素
- 注意它是实时集合，如果 DOM 结构发生变化，内容也会更新

---

### 2.3 querySelector 和 querySelectorAll

```javascript
let firstItem = document.querySelector(".item"); // 获取第一个匹配的元素
let allItems = document.querySelectorAll(".item"); // 获取所有匹配的元素
```

- `querySelector` 返回 **第一个匹配元素**
- `querySelectorAll` 返回 **NodeList**（静态节点列表）
- NodeList 可以用 `forEach` 遍历：

```javascript
allItems.forEach(item => {
  console.log(item.innerText);
});
```

---

## 3. 修改内容

### 3.1 修改文本

```javascript
let title = document.getElementById("title");

title.innerText = "新的标题";
```

- `innerText`：修改元素的纯文本
- `textContent` 也可以，区别在于 textContent 会返回元素内部的所有文本（包括隐藏文本）

### 3.2 修改 HTML 内容

```javascript
let box = document.getElementById("box");

box.innerHTML = "<strong>加粗文字</strong>";
```

- `innerHTML` 可以设置 HTML 标签，会解析 HTML 结构

---

## 4. 修改样式

```javascript
let title = document.getElementById("title");

title.style.color = "red";
title.style.fontSize = "30px";
```

- `style` 是直接修改 **行内样式**，覆盖原有样式
- 可以动态改变颜色、字体大小、显示隐藏等

---

## 5. 总结

DOM 操作是前端与页面交互的核心：

- 获取元素：`getElementById`、`getElementsByClassName`、`querySelector(All)`
- 修改内容：`innerText`、`innerHTML`
- 修改样式：`style` 属性
- 绑定事件：`onclick`、`addEventListener`
- 获取输入值：`element.value`

理解 DOM 后，你可以操作页面上的文本、样式、结构，以及监听用户操作，实现动态交互或前端逻辑验证。

---


# 事件

事件就是用户在网页上的操作，例如：

- 点击
- 输入
- 鼠标移动
- 提交表单
- 页面加载

---

## 1. 点击事件

HTML：

```html
<button id="btn">点击我</button>
```

JS：

```javascript
let btn = document.getElementById("btn");

btn.onclick = function() {
  alert("按钮被点击了");
};
```

---

## 2. addEventListener

推荐写法：

```javascript
let btn = document.getElementById("btn");

btn.addEventListener("click", function() {
  alert("按钮被点击了");
});
```

---

## 3. 输入事件

HTML：

```html
<input id="username" placeholder="请输入用户名">
```

JS：

```javascript
let input = document.getElementById("username");

input.addEventListener("input", function() {
  console.log(input.value);
});
```

---

## 4. 表单提交事件

HTML：

```html
<form id="loginForm">
  <input name="username">
  <input name="password">
  <button type="submit">登录</button>
</form>
```

JS：

```javascript
let form = document.getElementById("loginForm");

form.addEventListener("submit", function(event) {
  event.preventDefault();

  console.log("表单被提交了");
});
```

`event.preventDefault()` 的作用是阻止表单默认提交。

---

# 表单数据获取

HTML：

```html
<input id="username" placeholder="用户名">
<input id="password" placeholder="密码">
<button id="btn">登录</button>
```

JS：

```javascript
let btn = document.getElementById("btn");

btn.onclick = function() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  console.log(username);
  console.log(password);
};
```

---

# 前端校验

前端校验常见于登录、注册页面。

---

## 1. 判断是否为空

```javascript
let username = "";
let password = "1234";

if (username === "") {
  alert("用户名不能为空");
}
```

---

## 2. 判断密码长度

```javascript
let password = "123";

if (password.length !== 4) {
  alert("密码必须是4位");
}
```

---

## 3. 判断是否为4位数字

```javascript
let password = "1234";

let reg = /^\d{4}$/;

if (reg.test(password)) {
  console.log("密码格式正确");
} else {
  console.log("密码必须是4位数字");
}
```

---

## 4. CTF 中的意义

如果校验只在前端 JS 中完成：

```javascript
if (!/^\d{4}$/.test(password)) {
  alert("密码必须是4位数字");
  return;
}
```

那么可以用 Burp Suite 直接改包绕过。

因为：

```text
前端限制不可信
```

---

# 正则表达式基础

正则表达式用于匹配字符串。

---

## 1. 判断是否是数字

```javascript
let reg = /^\d+$/;

console.log(reg.test("123")); // true
console.log(reg.test("abc")); // false
```

---

## 2. 判断是否是4位数字

```javascript
let reg = /^\d{4}$/;

console.log(reg.test("1234")); // true
console.log(reg.test("123"));  // false
```

---

## 3. 判断手机号格式

```javascript
let reg = /^1[3-9]\d{9}$/;

console.log(reg.test("13800138000"));
```

---

## 4. 常见符号

| 符号 | 含义 |
|---|---|
| `^` | 开头 |
| `$` | 结尾 |
| `\d` | 数字 |
| `\w` | 字母、数字、下划线 |
| `.` | 任意字符 |
| `+` | 一次或多次 |
| `*` | 零次或多次 |
| `{4}` | 正好4次 |
| `{1,4}` | 1到4次 |

---

# JSON

JSON 是一种常见的数据格式。

---

## 1. JSON 字符串

```javascript
let jsonStr = '{"username":"admin","age":18}';
```

---

## 2. JSON 字符串转对象

```javascript
let jsonStr = '{"username":"admin","age":18}';

let obj = JSON.parse(jsonStr);

console.log(obj.username);
console.log(obj.age);
```

---

## 3. 对象转 JSON 字符串

```javascript
let user = {
  username: "admin",
  age: 18
};

let jsonStr = JSON.stringify(user);

console.log(jsonStr);
```

输出：

```json
{"username":"admin","age":18}
```

---

# 浏览器存储

## 1. localStorage

长期保存，关闭浏览器后仍然存在。

```javascript
localStorage.setItem("username", "admin");

let username = localStorage.getItem("username");

console.log(username);
```

删除：

```javascript
localStorage.removeItem("username");
```

清空：

```javascript
localStorage.clear();
```

---

## 2. sessionStorage

页面会话级保存，关闭标签页后消失。

```javascript
sessionStorage.setItem("token", "abc123");

console.log(sessionStorage.getItem("token"));
```

---

## 3. CTF 中常见考点

有些题会把 flag 或 token 放在：

```text
localStorage
sessionStorage
Cookie
```

可以在浏览器开发者工具中查看：

```text
F12 -> Application / Storage
```

---

# Cookie 基础

Cookie 是浏览器保存的小段数据，每次请求会自动带给服务器。

---

## 1. 设置 Cookie

```javascript
document.cookie = "username=admin";
```

---

## 2. 查看 Cookie

```javascript
console.log(document.cookie);
```

---

## 3. Cookie 在 HTTP 请求中

```http
GET /index HTTP/1.1
Host: example.com
Cookie: username=admin
```

---

## 4. CTF 常见考点

有些题会检查：

```javascript
document.cookie
```

或者后端检查：

```php
$_COOKIE["role"]
```

可以尝试：

```http
Cookie: role=admin
```

---

# fetch 网络请求

`fetch` 用于发送 HTTP 请求。

---

## 1. GET 请求

```javascript
fetch("/api/user")
  .then(response => response.json())
  .then(data => {
    console.log(data);
  });
```

---

## 2. POST 请求

```javascript
fetch("/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: "username=admin&password=1234"
})
.then(response => response.text())
.then(data => {
  console.log(data);
});
```

---

## 3. JSON POST

```javascript
fetch("/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "admin",
    password: "1234"
  })
})
.then(response => response.json())
.then(data => {
  console.log(data);
});
```

---

## 4. CTF 中的意义

看到前端 JS 里有：

```javascript
fetch("/complete.php", {
  method: "POST",
  body: "solved=1"
});
```

说明可以用 Burp 构造：

```http
POST /complete.php HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

solved=1
```

---

# 异步基础

JS 中网络请求、定时器等通常是异步执行。

---

## 1. setTimeout

```javascript
console.log("开始");

setTimeout(function() {
  console.log("2秒后执行");
}, 2000);

console.log("结束");
```

输出顺序：

```text
开始
结束
2秒后执行
```

---

## 2. Promise

```javascript
let p = new Promise(function(resolve, reject) {
  resolve("成功");
});

p.then(function(result) {
  console.log(result);
});
```

---

## 3. async / await

```javascript
async function getData() {
  let response = await fetch("/api/user");
  let data = await response.json();

  console.log(data);
}

getData();
```

---

# 常见前端漏洞思路

## 1. 前端校验绕过

JS：

```javascript
if (password.length !== 4) {
  alert("密码必须是4位");
  return;
}
```

绕过方式：

```text
用 Burp 修改请求体，直接提交后端
```

---

## 2. 隐藏接口泄露

JS：

```javascript
fetch("/api/flag")
```

说明可以尝试访问：

```text
/api/flag
```

---

## 3. 敏感信息写在 JS 中

```javascript
const password = "123456";
const apiKey = "abc123";
```

这种属于前端敏感信息泄露。

---

## 4. 前端权限判断

```javascript
if (role === "admin") {
  showFlag();
}
```

如果权限只在前端判断，可以尝试修改：

```javascript
role = "admin";
```

或者修改 Cookie / localStorage。

---

# 浏览器开发者工具看 JS

打开方式：

```text
F12
```

常用面板：

| 面板 | 作用 |
|---|---|
| Elements | 查看 HTML |
| Console | 执行 JS |
| Sources | 查看 JS 源码 |
| Network | 查看请求 |
| Application | 查看 Cookie / localStorage |

---

## 1. Console 执行 JS

```javascript
console.log(document.cookie);
```

---

## 2. 查看页面标题

```javascript
console.log(document.title);
```

---

## 3. 修改页面内容

```javascript
document.body.innerHTML = "页面被我修改了";
```

---

## 4. 查看所有链接

```javascript
document.querySelectorAll("a").forEach(a => {
  console.log(a.href);
});
```

---

# CTF 中读 JS 的方法

看到 JS 文件时，重点搜索：

```text
flag
password
token
secret
key
admin
login
fetch
ajax
api
cookie
localStorage
sessionStorage
```

---

## 示例

```javascript
const api = "/api/getFlag";
```

说明可以访问：

```text
/api/getFlag
```

---

## 示例

```javascript
if (username === "admin" && password === "1234") {
  alert("flag{xxxx}");
}
```

说明账号密码直接写在前端。

---

## 示例

```javascript
localStorage.setItem("role", "user");
```

可以尝试在 Console 里修改：

```javascript
localStorage.setItem("role", "admin");
```

---

# 小练习

## 练习 1：判断密码是否为4位数字

```javascript
let password = "1234";

if (/^\d{4}$/.test(password)) {
  console.log("格式正确");
} else {
  console.log("格式错误");
}
```

---

## 练习 2：点击按钮修改文字

HTML：

```html
<h1 id="title">原始标题</h1>
<button id="btn">修改</button>
```

JS：

```javascript
let btn = document.getElementById("btn");

btn.onclick = function() {
  document.getElementById("title").innerText = "标题被修改了";
};
```

---

## 练习 3：获取输入框内容

HTML：

```html
<input id="username" placeholder="用户名">
<button id="btn">提交</button>
```

JS：

```javascript
document.getElementById("btn").onclick = function() {
  let username = document.getElementById("username").value;
  console.log(username);
};
```

---

## 练习 4：发送登录请求

```javascript
fetch("/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: "username=admin&password=1234"
})
.then(res => res.text())
.then(data => console.log(data));
```



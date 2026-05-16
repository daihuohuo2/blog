---
title: http基础知识
date: 2026-04-23 22:32:38
categories:
  - 学习
  - 基础知识
tags:
  - 简单知识
sticky: 0
---

## 一、HTTP 是什么

HTTP（HyperText Transfer Protocol）是**超文本传输协议**，用于浏览器和服务器之间的通信。


## 二、HTTP 特点

| 特点 | 说明 |
|---|---|
| 无状态 | 服务器不记录之前的请求，每次请求独立 |
| 无连接 | 每次请求建立新连接（HTTP/1.0） |
| 基于TCP | 底层使用TCP协议，默认端口80 |
| 明文传输 | 数据不加密（HTTPS才加密） |

## 三、URL 结构

http://www.example.com:80/path/page.html?name=value#section
| 协议 | 主机名 | 端口 | 路径 | 参数 | 锚点 |


## 四、HTTP 请求方法

| 方法 | 说明 | 用途 |
|---|---|---|
| GET | 获取资源，参数在URL中 | 最常用，获取页面 |
| POST | 提交数据，参数在请求体中 | 提交表单、登录 |
| PUT | 上传文件 | 更新资源 |
| DELETE | 删除资源 | 删除数据 |
| HEAD | 只获取响应头 | 信息收集 |
| OPTIONS | 查询服务器支持的方法 | 探测可用方法 |

## 五、HTTP 请求格式

HTTP 请求格式包含了请求的各个部分，包括请求行、请求头以及可选的请求体。

### 1. 请求行 (Request Line)

请求行由三个部分组成：

- **请求方法**：表明请求的操作类型，如 `GET`, `POST`, `PUT`, `DELETE` 等。
- **请求 URL**：指定资源的路径。
- **协议版本**：指定使用的 HTTP 版本，通常是 `HTTP/1.1` 或 `HTTP/2`。

**示例：**


GET /index.html HTTP/1.1


### 2. 请求头字段 (Request Headers)

请求头包含了有关请求的元信息，用于告诉服务器如何处理请求，通常包括以下几个部分：

- **Host**：请求的目标主机。
- **User-Agent**：客户端软件的名称和版本。
- **Accept**：客户端能处理的内容类型。
- **Accept-Language**：客户端能理解的语言。
- **Connection**：是否保持连接。

**请求头的格式**：


字段名称: 字段值


**示例：**


Host: www.example.com

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8
Accept-Language: en-US,en;q=0.9
Connection: keep-alive


### 3. 请求体 (Request Body) - 可选

对于某些 HTTP 请求方法（如 `POST` 或 `PUT`），请求中可能会包含一个请求体，它通常包含数据，如提交的表单内容、JSON 数据或文件。

**示例：**


{
"username": "testuser",
"password": "testpassword"
}


### 4. 完整的 HTTP 请求示例


POST /login HTTP/1.1
Host: www.example.com

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36
Accept: application/json
Content-Type: application/json
Connection: keep-alive

{
"username": "testuser",
"password": "testpassword"
}


### 常见的请求头字段

| 字段名           | 描述                                       |
|------------------|--------------------------------------------|
| `Host`           | 请求的目标主机                             |
| `User-Agent`     | 客户端软件信息                             |
| `Accept`         | 客户端可以接受的媒体类型                   |
| `Accept-Language`| 客户端支持的语言                           |
| `Connection`     | 是否保持连接                               |
| `Content-Type`   | 请求体的媒体类型，如 `application/json`    |
| `Authorization`  | 授权信息，用于身份验证                     |
| `Cookie`         | 客户端发送的 Cookie 数据                   |
| `Content-Length` | 请求体的长度，通常用于指明请求体的字节数   |


## 六、HTTP 响应格式

HTTP 响应是服务器返回给客户端的消息，包含了响应状态、响应头以及可选的响应体。

### 1. 响应行 (Response Line)

响应行包含三个部分：

- **HTTP 版本**：表示使用的 HTTP 协议版本，通常为 `HTTP/1.1` 或 `HTTP/2`。
- **状态码**：表示响应的状态，三位数字，告诉客户端请求的处理结果。
- **状态描述**：状态码的简短描述，帮助客户端理解响应的状态。

### 响应行格式：

<HTTP 版本> <状态码> <状态描述>

### 示例：

HTTP/1.1 200 OK

- **200**：表示请求成功，且服务器已返回所请求的内容。
- **404**：表示请求的资源未找到。
- **500**：表示服务器内部错误。

### 2. 响应头 (Response Headers)

响应头包含了关于响应的元数据。每个响应头都由字段名称和字段值组成，格式如下：

<字段名称>: <字段值>

### 常见响应头字段：

- **Content-Type**：表示返回内容的类型，如 `text/html`, `application/json`。
- **Content-Length**：表示响应体的长度，以字节为单位。
- **Date**：表示响应生成的日期和时间。
- **Server**：返回服务器的信息，如 Web 服务器软件的名称和版本。
- **Location**：在 3xx 重定向响应中，指定要转向的新 URL。

### 示例：

Content-Type: text/html; charset=UTF-8
Content-Length: 3050
Date: Sat, 23 Apr 2026 10:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)
Location: http://www.example.com/new-location

### 3. 响应体 (Response Body) - 可选

响应体包含了实际的响应内容，通常是 HTML 页面、JSON 数据、图像等。

<响应体数据>

### 示例：

```bush
<!DOCTYPE html> <html> <head> <title>Welcome</title> </head> <body> <h1>Hello, World!</h1> <p>This is an example response body.</p> </body> </html>
```

### 4. 完整的 HTTP 响应示例

这是一个完整的 HTTP 响应示例，展示了响应行、响应头和响应体：

HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 3050
Date: Sat, 23 Apr 2026 10:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)

```bush
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is an example response body.</p>
  </body>
</html>
```

### 5. 常见响应头字段说明

字段名	描述
Content-Type	响应内容的类型，如 text/html, application/json
Content-Length	响应体的长度，以字节为单位
Date	响应生成的日期和时间
Server	服务器软件的名称和版本
Location	在重定向响应中，指定新 URL
Cache-Control	控制缓存的行为，告诉客户端是否缓存响应
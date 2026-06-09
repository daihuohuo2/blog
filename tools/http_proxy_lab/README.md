# HTTP Proxy Lab

Build:

```sh
make
```

Run:

```sh
./proxy 8080
```

Test with telnet:

```text
telnet 127.0.0.1 8080
GET http://example.com/ HTTP/1.0

```

Only `GET` is implemented. Other HTTP methods return `501 Not Implemented`.

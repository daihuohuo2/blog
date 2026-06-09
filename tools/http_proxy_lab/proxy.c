#define _POSIX_C_SOURCE 200112L

#include <arpa/inet.h>
#include <ctype.h>
#include <errno.h>
#include <netdb.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#define BACKLOG 100
#define BUF_SIZE 8192
#define MAX_HEADER 65536

static void reap_children(int signo) {
    (void)signo;
    while (waitpid(-1, NULL, WNOHANG) > 0) {
    }
}

static int write_all(int fd, const void *buf, size_t len) {
    const char *p = (const char *)buf;
    while (len > 0) {
        ssize_t n = send(fd, p, len, 0);
        if (n < 0) {
            if (errno == EINTR) {
                continue;
            }
            return -1;
        }
        if (n == 0) {
            return -1;
        }
        p += n;
        len -= (size_t)n;
    }
    return 0;
}

static void send_error(int client_fd, int status, const char *reason, const char *body) {
    char response[1024];
    int n = snprintf(response, sizeof(response),
                     "HTTP/1.0 %d %s\r\n"
                     "Content-Type: text/plain; charset=utf-8\r\n"
                     "Connection: close\r\n"
                     "Content-Length: %zu\r\n"
                     "\r\n"
                     "%s",
                     status, reason, strlen(body), body);
    if (n > 0) {
        write_all(client_fd, response, (size_t)n);
    }
}

static int create_listener(const char *port) {
    struct addrinfo hints;
    struct addrinfo *res = NULL;
    struct addrinfo *rp;
    int listen_fd = -1;
    int yes = 1;

    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    if (getaddrinfo(NULL, port, &hints, &res) != 0) {
        return -1;
    }

    for (rp = res; rp != NULL; rp = rp->ai_next) {
        listen_fd = socket(rp->ai_family, rp->ai_socktype, rp->ai_protocol);
        if (listen_fd < 0) {
            continue;
        }

        setsockopt(listen_fd, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(yes));

        if (bind(listen_fd, rp->ai_addr, rp->ai_addrlen) == 0 &&
            listen(listen_fd, BACKLOG) == 0) {
            break;
        }

        close(listen_fd);
        listen_fd = -1;
    }

    freeaddrinfo(res);
    return listen_fd;
}

static int connect_remote(const char *host, const char *port) {
    struct addrinfo hints;
    struct addrinfo *res = NULL;
    struct addrinfo *rp;
    int remote_fd = -1;

    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    if (getaddrinfo(host, port, &hints, &res) != 0) {
        return -1;
    }

    for (rp = res; rp != NULL; rp = rp->ai_next) {
        remote_fd = socket(rp->ai_family, rp->ai_socktype, rp->ai_protocol);
        if (remote_fd < 0) {
            continue;
        }
        if (connect(remote_fd, rp->ai_addr, rp->ai_addrlen) == 0) {
            break;
        }
        close(remote_fd);
        remote_fd = -1;
    }

    freeaddrinfo(res);
    return remote_fd;
}

static int read_request_header(int fd, char *buf, size_t cap) {
    size_t used = 0;

    while (used + 1 < cap) {
        ssize_t n = recv(fd, buf + used, cap - used - 1, 0);
        if (n < 0) {
            if (errno == EINTR) {
                continue;
            }
            return -1;
        }
        if (n == 0) {
            break;
        }

        used += (size_t)n;
        buf[used] = '\0';
        if (strstr(buf, "\r\n\r\n") != NULL || strstr(buf, "\n\n") != NULL) {
            return (int)used;
        }
    }

    return -1;
}

static char *trim(char *s) {
    while (*s && isspace((unsigned char)*s)) {
        s++;
    }
    char *end = s + strlen(s);
    while (end > s && isspace((unsigned char)end[-1])) {
        *--end = '\0';
    }
    return s;
}

static int parse_url(const char *uri, char *host, size_t host_len,
                     char *port, size_t port_len, char *path, size_t path_len) {
    const char *p = uri;
    const char *host_start;
    const char *host_end;
    const char *path_start;
    const char *colon;

    if (strncmp(p, "http://", 7) == 0) {
        p += 7;
    }

    host_start = p;
    path_start = strchr(host_start, '/');
    if (path_start == NULL) {
        path_start = host_start + strlen(host_start);
    }

    host_end = path_start;
    colon = memchr(host_start, ':', (size_t)(host_end - host_start));

    if (colon != NULL) {
        size_t hlen = (size_t)(colon - host_start);
        size_t plen = (size_t)(host_end - colon - 1);
        if (hlen == 0 || hlen >= host_len || plen == 0 || plen >= port_len) {
            return -1;
        }
        memcpy(host, host_start, hlen);
        host[hlen] = '\0';
        memcpy(port, colon + 1, plen);
        port[plen] = '\0';
    } else {
        size_t hlen = (size_t)(host_end - host_start);
        if (hlen == 0 || hlen >= host_len) {
            return -1;
        }
        memcpy(host, host_start, hlen);
        host[hlen] = '\0';
        snprintf(port, port_len, "80");
    }

    if (*path_start == '\0') {
        snprintf(path, path_len, "/");
    } else {
        snprintf(path, path_len, "%s", path_start);
    }

    return 0;
}

static int parse_host_header(char *headers, char *host, size_t host_len,
                             char *port, size_t port_len) {
    char *line = strtok(headers, "\r\n");

    while (line != NULL) {
        if (strncasecmp(line, "Host:", 5) == 0) {
            char *value = trim(line + 5);
            char *colon = strrchr(value, ':');

            if (colon != NULL) {
                *colon = '\0';
                snprintf(host, host_len, "%s", trim(value));
                snprintf(port, port_len, "%s", trim(colon + 1));
            } else {
                snprintf(host, host_len, "%s", value);
                snprintf(port, port_len, "80");
            }

            return host[0] != '\0' ? 0 : -1;
        }
        line = strtok(NULL, "\r\n");
    }

    return -1;
}

static int should_skip_header(const char *line) {
    return strncasecmp(line, "Host:", 5) == 0 ||
           strncasecmp(line, "Connection:", 11) == 0 ||
           strncasecmp(line, "Proxy-Connection:", 17) == 0 ||
           strncasecmp(line, "Keep-Alive:", 11) == 0;
}

static int build_forward_request(const char *raw_request, const char *method,
                                 const char *path, const char *host,
                                 char *out, size_t out_len) {
    char headers[MAX_HEADER];
    char *line;
    size_t used = 0;
    int n;

    n = snprintf(out, out_len,
                 "%s %s HTTP/1.0\r\n"
                 "Host: %s\r\n"
                 "Connection: close\r\n"
                 "Proxy-Connection: close\r\n",
                 method, path, host);
    if (n < 0 || (size_t)n >= out_len) {
        return -1;
    }
    used = (size_t)n;

    snprintf(headers, sizeof(headers), "%s", raw_request);
    line = strtok(headers, "\r\n");
    line = strtok(NULL, "\r\n");

    while (line != NULL && *line != '\0') {
        if (!should_skip_header(line)) {
            n = snprintf(out + used, out_len - used, "%s\r\n", line);
            if (n < 0 || (size_t)n >= out_len - used) {
                return -1;
            }
            used += (size_t)n;
        }
        line = strtok(NULL, "\r\n");
    }

    if (used + 2 >= out_len) {
        return -1;
    }
    out[used++] = '\r';
    out[used++] = '\n';
    out[used] = '\0';
    return (int)used;
}

static void relay_response(int remote_fd, int client_fd) {
    char buf[BUF_SIZE];

    for (;;) {
        ssize_t n = recv(remote_fd, buf, sizeof(buf), 0);
        if (n < 0) {
            if (errno == EINTR) {
                continue;
            }
            break;
        }
        if (n == 0) {
            break;
        }
        if (write_all(client_fd, buf, (size_t)n) < 0) {
            break;
        }
    }
}

static void handle_client(int client_fd) {
    char request[MAX_HEADER];
    char request_copy[MAX_HEADER];
    char host[512] = "";
    char port[16] = "80";
    char path[4096] = "/";
    char method[32];
    char uri[4096];
    char version[32];
    char forward_request[MAX_HEADER];
    int remote_fd;
    int forward_len;

    if (read_request_header(client_fd, request, sizeof(request)) < 0) {
        send_error(client_fd, 400, "Bad Request", "Bad Request\n");
        return;
    }

    snprintf(request_copy, sizeof(request_copy), "%s", request);
    if (sscanf(request_copy, "%31s %4095s %31s", method, uri, version) != 3) {
        send_error(client_fd, 400, "Bad Request", "Bad Request\n");
        return;
    }

    if (strcmp(method, "GET") != 0) {
        send_error(client_fd, 501, "Not Implemented", "Only GET is implemented.\n");
        return;
    }

    if (strncmp(uri, "http://", 7) == 0) {
        if (parse_url(uri, host, sizeof(host), port, sizeof(port), path, sizeof(path)) < 0) {
            send_error(client_fd, 400, "Bad Request", "Invalid URL\n");
            return;
        }
    } else if (uri[0] == '/') {
        char header_copy[MAX_HEADER];
        snprintf(path, sizeof(path), "%s", uri);
        snprintf(header_copy, sizeof(header_copy), "%s", request);
        if (parse_host_header(header_copy, host, sizeof(host), port, sizeof(port)) < 0) {
            send_error(client_fd, 400, "Bad Request", "Missing Host header\n");
            return;
        }
    } else {
        send_error(client_fd, 400, "Bad Request", "Invalid URL\n");
        return;
    }

    forward_len = build_forward_request(request, method, path, host,
                                        forward_request, sizeof(forward_request));
    if (forward_len < 0) {
        send_error(client_fd, 400, "Bad Request", "Request header too large\n");
        return;
    }

    remote_fd = connect_remote(host, port);
    if (remote_fd < 0) {
        send_error(client_fd, 502, "Bad Gateway", "Cannot connect to remote host\n");
        return;
    }

    if (write_all(remote_fd, forward_request, (size_t)forward_len) == 0) {
        relay_response(remote_fd, client_fd);
    }

    close(remote_fd);
}

int main(int argc, char **argv) {
    int listen_fd;

    if (argc != 2) {
        fprintf(stderr, "Usage: %s <port>\n", argv[0]);
        return 1;
    }

    signal(SIGCHLD, reap_children);
    signal(SIGPIPE, SIG_IGN);

    listen_fd = create_listener(argv[1]);
    if (listen_fd < 0) {
        perror("listen");
        return 1;
    }

    printf("HTTP proxy listening on port %s\n", argv[1]);
    fflush(stdout);

    for (;;) {
        struct sockaddr_storage client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(listen_fd, (struct sockaddr *)&client_addr, &client_len);

        if (client_fd < 0) {
            if (errno == EINTR) {
                continue;
            }
            perror("accept");
            continue;
        }

        pid_t pid = fork();
        if (pid < 0) {
            perror("fork");
            close(client_fd);
            continue;
        }

        if (pid == 0) {
            close(listen_fd);
            handle_client(client_fd);
            close(client_fd);
            _exit(0);
        }

        close(client_fd);
    }
}

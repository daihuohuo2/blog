CC ?= gcc
CFLAGS ?= -Wall -Wextra -O2 -std=c11

.PHONY: all clean

all: proxy

proxy: proxy.c
	$(CC) $(CFLAGS) -o $@ proxy.c

clean:
	rm -f proxy

"""
PHP md5 部分哈希爆破脚本
题目：substr(md5($qc), -6, 6) === 'd54e23'
用法：直接运行，找到满足条件的字符串后复制到 URL 参数
"""

import hashlib

TARGET = 'd54e23'  # 修改为目标末尾哈希
SUFFIX_LEN = 6     # 末尾几位

i = 0
while True:
    s = str(i)
    h = hashlib.md5(s.encode()).hexdigest()
    if h[-SUFFIX_LEN:] == TARGET:
        print(f'Found : {s}')
        print(f'MD5   : {h}')
        print(f'Payload: ?QC={s}')
        break
    i += 1

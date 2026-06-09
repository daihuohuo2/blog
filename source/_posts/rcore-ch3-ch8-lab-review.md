---
title: rCore ch3-ch8 实验复盘笔记
date: 2026-05-19 17:17:41
categories:
  - 操作系统
tags:
  - rCore
  - Rust
  - 实验复盘
sticky: 0
---

# rCore ch3-ch8 实验复盘笔记

> 说明：本文已经按 WSL 中实际项目重新核对过。实验代码主要在 `/home/daihuohuo/code` 下；评分脚本实际位于 `/home/daihuohuo/code/rCore-fullscore-labs/ci-user`，它是 checker 拷贝进实验仓库后的目录，而不是单独命名为 `rCore-Tutorial-checker-2024S` 的仓库。

## 0. 项目、教程和评分系统关系

实验教程：

- rCore Tutorial Book v3：<https://rcore-os.cn/rCore-Tutorial-Book-v3/index.html>

评分脚本：

- checker：<https://github.com/LearningOS/rCore-Tutorial-checker-2024S>
- 本机实际位置：`/home/daihuohuo/code/rCore-fullscore-labs/ci-user`

常见目录关系大致如下：

```text
/home/daihuohuo/code
├── rCore-fullscore-labs
│   ├── ci-user
│   ├── os
│   ├── user
│   ├── easy-fs
│   └── reports
├── rCore-Tutorial-Code-2025S-ch3
│   ├── os
│   └── user
├── rCore-Tutorial-Code-2025S-ch4
├── rCore-Tutorial-Code-2025S-ch5
├── rCore-Tutorial-Code-2025S-ch6
├── rCore-Tutorial-Code-2025S-ch7
├── rCore-Tutorial-Code-2025S-ch8
├── rCore-Tutorial-Code-2024S
│   └── ci-user
└── rCore-Tutorial-Code-2025S
```

checker 里常见的章节映射是：

| 教程章节 | 实验主题 | checker 中常见 lab |
|---|---|---|
| ch3 | 多道程序与分时多任务 | lab1 |
| ch4 | 地址空间与虚存 | lab2 |
| ch5 | 进程管理与调度 | lab3 |
| ch6 | 文件系统 | lab4 |
| ch7 | 进程间通信/管道等扩展 | 通常接在 lab4/ch6 系列后，部分 checker 不单列 |
| ch8 | 并发机制、死锁检测 | lab5 |

如果你要复盘，建议先确认每章当前分支和工作区：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5
git status --short --branch
git diff
```

如果你要看某一章改了哪些文件：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5
git diff --stat
git diff -- os/src/task/task.rs
```

### 0.1 本机实际检查结果

重新整理后，最终使用的新实验工作区是：

```text
/home/daihuohuo/code/rCore-fullscore-labs
```

这个目录是从已有 rCore 仓库重新整理出来的干净工作区。旧目录没有继续作为主复盘对象使用，避免被历史脚本、旧分支、randomize 后的 checker 文件影响。

本次最终跑分结果：

| 章节 | 使用分支 | checker 命令 | 结果 |
|---|---|---|---|
| ch3 | `codex/ch3-full` | `make test CHAPTER=3` | `7/7` |
| ch4 | `codex/ch4-full` | `make test CHAPTER=4` | `15/15` |
| ch5 | `codex/ch5-full` | `make test CHAPTER=5` | `15/15` |
| ch6 | `ch6_work` | `make test CHAPTER=6` | `31/31` |
| ch7 | `ch7_work` | `make test CHAPTER=7` | `21/21` |
| ch8 | `ch8_work` | `make test CHAPTER=8` | `25/25` |

本次处理过的环境问题：

- 原 `/home/daihuohuo/code/rCore-Tutorial-Code-2024S/ci-user` 被多次 `randomize` 后污染，表现为用户程序里的 `OK随机数` 和 `check/*.py` 里的期望随机数不一致。
- 已在 `/home/daihuohuo/code/rCore-fullscore-labs/ci-user` 重新克隆一份干净 checker，并且每次跑分前重置 `ci-user/check` 和 `ci-user/user`。
- 当前 QEMU 环境下 `../bootloader/rustsbi-qemu.bin` 会卡住，因此把 checker 覆盖用的 `Makefile-ch3` 和 `Makefile-ch6` 改为 `-bios default`。
- ch6 及以后构建 `easy-fs-fuse` 时，`ppv-lite86 0.2.21` 会拉取 `zerocopy 0.8.48`，旧 nightly 编译不了；已把 `ppv-lite86` 降到 `0.2.17`，避免拉取新版 `zerocopy`。

之前检查 WSL 时，得到的旧项目信息是：

```text
/home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch3
  当前分支：ch3
  改动文件：os/src/config.rs、syscall、task 相关文件

/home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch4
  不是独立 git 仓库，但 os/Makefile 固定 CHAPTER=4

/home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5
  不是独立 git 仓库，但 os/Makefile 固定 CHAPTER=5

/home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch6
  当前是 detached HEAD，只改了 os/Makefile

/home/daihuohuo/code/rCore-Tutorial-Code-2024S
  当前分支：ch9_work
  同时存在 ch3、ch4_work、ch5_work、ch6_work、ch7_work、ch8_work、ch9_work 等分支
```

真正比较像“已经打到满分的完成分支”的是：

```text
ch6_work:
  提交说明：ch6: implement fstat/linkat/unlinkat, carry forward ch5 features
  已实现：sys_task_info、mmap、munmap、spawn、set_priority、fstat、linkat、unlinkat

ch7_work:
  提交说明：ch7: implement all features, 21/21

ch8_work:
  提交说明：ch8: implement semaphore deadlock detection with Banker algorithm
  已实现：thread_create、waittid、mutex、semaphore、condvar、enable_deadlock_detect
```

需要注意：`/home/daihuohuo/code/rCore-Tutorial-Code-2024S` 当前工作树停在 `ch9_work`，里面仍然能搜到一些前面章节的 `NOT IMPLEMENTED` 占位函数，例如 `sys_fstat`、`sys_linkat`、`sys_task_info`、`sys_mmap`、`sys_spawn` 等。这不一定说明你没满分，因为满分代码已经在 `ch6_work`、`ch7_work`、`ch8_work` 分支里；但如果直接在当前 `ch9_work` 上跑某些前置章节测试，就可能失败。

本机 checker 还要求报告文件存在。当前有：

```text
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/reports/lab1.md
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/reports/lab2.md
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/reports/lab3.md
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/reports/lab4.md
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/reports/lab5.md
```

其中 `lab1.md` 到 `lab4.md` 只有 15 字节，说明它们更像是“为了满足 checker 存在性检查的占位报告”。如果要写给自己复盘，应该以本文为主，把每章代码思路补完整。

## 1. Rust 基础速记：看实验代码需要知道的最少知识

rCore 里大量代码看起来难，是因为它同时用了 Rust、裸机、内核、所有权和智能指针。先记住这些就够用：

### 1.1 `struct` 和 `impl`

```rust
pub struct TaskControlBlock {
    pub pid: PidHandle,
    inner: UPSafeCell<TaskControlBlockInner>,
}

impl TaskControlBlock {
    pub fn inner_exclusive_access(&self) -> RefMut<'_, TaskControlBlockInner> {
        self.inner.exclusive_access()
    }
}
```

解释：

- `struct` 定义数据结构，类似 C 里的 `struct`。
- `impl` 给这个结构体实现方法。
- `pub` 表示公开，其他模块可以用。
- `&self` 表示借用当前对象，不拿走所有权。
- `RefMut` 表示拿到一个可变借用，后面可以改结构体内部字段。

### 1.2 `Arc<T>`：多个地方共享同一个对象

```rust
use alloc::sync::Arc;

pub type TaskRef = Arc<TaskControlBlock>;
```

解释：

- 内核里一个进程/任务可能被调度器、父进程、等待队列同时引用。
- `Arc` 是“引用计数指针”：每多一个引用，计数加一；没有引用后自动释放。
- 它适合“多个所有者共享一个对象”的场景。

### 1.3 `Option<T>`：可能有，也可能没有

```rust
let task = current_task().unwrap();
```

解释：

- `Option<T>` 只有两种：`Some(value)` 或 `None`。
- `unwrap()` 是直接取出 `Some` 里的值；如果是 `None` 就 panic。
- 内核实验里常用 `unwrap()`，因为当前任务不存在通常就是内核逻辑错误。

### 1.4 `Result<T, E>`：成功或失败

```rust
pub fn translated_refmut<T>(
    token: usize,
    ptr: *mut T,
) -> &'static mut T {
    // ...
}
```

不少 rCore 代码为了简化，没有到处写 `Result`，而是用 `is_valid`、`return -1` 这种 C 风格系统调用返回值。系统调用里通常：

- 成功返回非负值。
- 失败返回 `-1`。

### 1.5 `unsafe`

```rust
unsafe {
    core::slice::from_raw_parts_mut(pa as *mut u8, len)
}
```

解释：

- `unsafe` 不是“这段一定错”，而是“编译器无法替你证明它安全”。
- 操作裸指针、物理地址、页表时必须用。
- 内核代码里 `unsafe` 很常见，但要非常小心边界、权限和地址是否合法。

## 2. 常用构建、运行、评分命令

### 2.1 构建用户程序

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5/user
make build
```

作用：

- 编译 `user/src/bin/*.rs` 里的用户态程序。
- 生成 ELF。
- 这些 ELF 会被内核加载执行。

### 2.2 构建并运行内核

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5/os
make run
```

作用：

- 编译内核。
- 用 QEMU 启动 RISC-V 虚拟机。
- 进入 rCore shell 或自动运行测试。

有些章节用自动测试变量：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5/os
make run TEST=5 BASE=1
```

不同仓库版本变量可能略有差异，建议先看 `os/Makefile`：

```bash
sed -n '1,160p' os/Makefile
```

### 2.3 checker 评分

本机实际使用方式：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=5
```

常见参数：

```bash
make test CHAPTER=3
make test CHAPTER=4
make test CHAPTER=5
make test CHAPTER=6
make test CHAPTER=7
make test CHAPTER=8
```

如果 checker 要你指定实验代码目录，常见形式类似：

```bash
make test CHAPTER=5 LOG=1
```

或修改 checker Makefile 里的 `BASE`、`CHAPTER`、代码路径变量。最稳的复盘方式是：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
sed -n '1,220p' Makefile
```

然后照 Makefile 里定义的变量来跑。

### 2.4 清理重新编译

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch6/os
make clean
make run
```

如果用户程序也要重新编译：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch6/user
make clean
make build
```

### 2.5 查看某个测试输出

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5/os
make run TEST=5 BASE=1 | tee run.log
grep -n "OK\|FAIL\|panic" run.log
```

如果输出太多，建议用 `tee` 保存日志，然后搜索关键字。

## 3. ch3：多道程序与分时多任务

### 3.1 实验目标

ch3 的核心是让内核支持多个用户程序轮流运行，而不是一个程序运行完才运行下一个。关键点：

- 支持任务上下文 `TaskContext` 保存和恢复。
- 支持任务状态 `Ready`、`Running`、`Exited`。
- 支持 `sys_yield` 主动让出 CPU。
- 支持时钟中断触发抢占式调度。
- 支持 `sys_task_info` 之类的查询任务信息接口。

### 3.2 关键代码：任务状态和任务控制块

```rust
#[derive(Copy, Clone, PartialEq)]
pub enum TaskStatus {
    UnInit,   // 还没有初始化
    Ready,    // 已经准备好，可以被调度
    Running,  // 正在 CPU 上执行
    Exited,   // 已经退出
}

pub struct TaskControlBlock {
    pub task_cx: TaskContext,     // 任务上下文，保存 ra/sp 等寄存器
    pub task_status: TaskStatus,  // 当前任务状态
    pub syscall_times: [u32; MAX_SYSCALL_NUM], // 每种系统调用调用次数
    pub first_run_time: usize,    // 第一次运行时间，用于统计运行时长
}
```

逻辑解释：

- `TaskControlBlock` 可以理解成“进程/任务档案袋”。
- 调度器不直接关心用户程序具体在干什么，只关心它的上下文和状态。
- `task_cx` 用来切换任务时保存内核态寄存器。
- `syscall_times` 是实验常要求统计的系统调用次数。

### 3.3 关键代码：主动让出 CPU

```rust
pub fn sys_yield() -> isize {
    suspend_current_and_run_next();
    0
}
```

解释：

- 用户程序调用 `yield` 后进入内核。
- 内核把当前任务从 `Running` 改回 `Ready`。
- 然后调度下一个可运行任务。

典型实现逻辑：

```rust
pub fn suspend_current_and_run_next() {
    let task = take_current_task().unwrap();
    let mut task_inner = task.inner_exclusive_access();
    let task_cx_ptr = &mut task_inner.task_cx as *mut TaskContext;
    task_inner.task_status = TaskStatus::Ready;
    drop(task_inner);
    add_task(task);
    schedule(task_cx_ptr);
}
```

这里几个 Rust 点：

- `drop(task_inner)` 是主动释放可变借用，否则后面 `add_task(task)` 可能和借用规则冲突。
- `*mut TaskContext` 是裸指针，因为上下文切换函数通常用汇编实现，Rust 类型系统无法完全表达。

### 3.4 关键代码：时钟中断抢占

```rust
match scause.cause() {
    Trap::Interrupt(Interrupt::SupervisorTimer) => {
        set_next_trigger();
        suspend_current_and_run_next();
    }
    _ => { /* 其他异常或系统调用 */ }
}
```

实现了什么：

- QEMU 的定时器周期性产生中断。
- 内核每次收到时钟中断，就重新设置下一次中断。
- 当前任务被挂起，调度器选择下一个任务。

这就是“分时多任务”：一个程序即使不主动 `yield`，也不能永久霸占 CPU。

### 3.5 复盘思路

复盘 ch3 时建议按这个顺序看：

1. `os/src/trap/mod.rs`：系统调用和时钟中断怎么进入内核。
2. `os/src/syscall/process.rs`：`sys_yield`、`sys_exit`、`sys_task_info` 怎么写。
3. `os/src/task/mod.rs`：当前任务如何挂起、退出、切换。
4. `os/src/task/manager.rs`：就绪队列如何保存任务。
5. `os/src/task/switch.rs` 和 `switch.S`：真正的上下文切换。

运行建议：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch3/os
make clean
make run
```

评分建议：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=3
```

## 4. ch4：地址空间与虚拟内存

### 4.1 实验目标

ch4 的核心是把“程序直接使用物理地址”升级为“每个应用有自己的虚拟地址空间”。关键点：

- Sv39 页表。
- 虚拟页号 `VirtPageNum` 到物理页号 `PhysPageNum` 的映射。
- 用户程序 ELF 加载到自己的地址空间。
- 系统调用参数需要从用户虚拟地址翻译到内核可访问的物理地址。
- 实验常要求实现 `mmap` / `munmap`。

### 4.2 关键代码：页表项权限

```rust
bitflags! {
    pub struct PTEFlags: u8 {
        const V = 1 << 0; // valid，有效
        const R = 1 << 1; // readable，可读
        const W = 1 << 2; // writable，可写
        const X = 1 << 3; // executable，可执行
        const U = 1 << 4; // user，用户态可访问
    }
}
```

解释：

- 页表项不仅记录“虚拟页映射到哪个物理页”，还记录权限。
- 用户程序代码段一般 `R | X | U`。
- 数据段一般 `R | W | U`。
- 内核不能把不可写页误设成可写，否则测试会检查出来。

### 4.3 关键代码：`mmap`

典型实现：

```rust
pub fn sys_mmap(start: usize, len: usize, port: usize) -> isize {
    if start % PAGE_SIZE != 0 || len == 0 {
        return -1;
    }
    if port & !0x7 != 0 || port & 0x7 == 0 {
        return -1;
    }

    let task = current_task().unwrap();
    let mut inner = task.inner_exclusive_access();
    let memory_set = &mut inner.memory_set;

    let vpn_start = VirtAddr::from(start).floor();
    let vpn_end = VirtAddr::from(start + len).ceil();

    for vpn in vpn_start..vpn_end {
        if memory_set.translate(vpn).is_some() {
            return -1;
        }
    }

    let mut map_perm = MapPermission::U;
    if port & 0x1 != 0 { map_perm |= MapPermission::R; }
    if port & 0x2 != 0 { map_perm |= MapPermission::W; }
    if port & 0x4 != 0 { map_perm |= MapPermission::X; }

    memory_set.insert_framed_area(
        VirtAddr::from(start),
        VirtAddr::from(start + len),
        map_perm,
    );
    0
}
```

逻辑解释：

- `start` 必须页对齐，因为页表按页管理。
- `len` 可以不是页大小整数倍，所以结束位置通常用 `ceil()` 向上取整。
- `port` 是权限位，常见约定是 `R=1`、`W=2`、`X=4`。
- 映射前要检查目标虚拟页是否已经被使用。
- 最后创建按需分配或直接分配的 framed area。

### 4.4 关键代码：`munmap`

```rust
pub fn sys_munmap(start: usize, len: usize) -> isize {
    if start % PAGE_SIZE != 0 || len == 0 {
        return -1;
    }

    let task = current_task().unwrap();
    let mut inner = task.inner_exclusive_access();
    let memory_set = &mut inner.memory_set;

    let vpn_start = VirtAddr::from(start).floor();
    let vpn_end = VirtAddr::from(start + len).ceil();

    for vpn in vpn_start..vpn_end {
        if memory_set.translate(vpn).is_none() {
            return -1;
        }
    }

    for vpn in vpn_start..vpn_end {
        memory_set.unmap(vpn);
    }
    0
}
```

实现了什么：

- 把一段用户虚拟地址解除映射。
- 如果其中有页面本来没映射，直接失败。
- 解除映射后访问该地址会触发 page fault。

### 4.5 用户指针翻译

系统调用参数来自用户程序，内核不能直接信任：

```rust
pub fn translated_byte_buffer(
    token: usize,
    ptr: *const u8,
    len: usize,
) -> Vec<&'static [u8]> {
    let page_table = PageTable::from_token(token);
    let mut start = ptr as usize;
    let end = start + len;
    let mut v = Vec::new();
    while start < end {
        let start_va = VirtAddr::from(start);
        let mut vpn = start_va.floor();
        let ppn = page_table.translate(vpn).unwrap().ppn();
        vpn.step();
        let mut end_va: VirtAddr = vpn.into();
        end_va = end_va.min(VirtAddr::from(end));
        v.push(&ppn.get_bytes_array()[start_va.page_offset()..end_va.page_offset()]);
        start = end_va.into();
    }
    v
}
```

解释：

- 用户传入的 `ptr` 是用户虚拟地址。
- 内核通过用户页表 `token` 把虚拟页翻译到物理页。
- 缓冲区可能跨页，所以返回多个切片。

### 4.6 复盘思路

建议按这个顺序看：

1. `os/src/mm/address.rs`：虚拟地址、物理地址、页号的类型封装。
2. `os/src/mm/page_table.rs`：页表创建、查找、映射、解除映射。
3. `os/src/mm/memory_set.rs`：地址空间和逻辑段。
4. `os/src/syscall/process.rs` 或 `mm.rs`：`mmap`、`munmap`。
5. `os/src/trap/mod.rs`：page fault 如何处理。

运行：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch4/os
make clean
make run TEST=4 BASE=1
```

评分：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=4
```

## 5. ch5：进程管理、`spawn` 和 stride 调度

这一章当前工作区已有 `reports/lab3.md`，可以认为你之前主要实现的是：

- `sys_spawn`
- `sys_set_priority`
- `sys_task_info`
- stride 调度
- 系统调用统计

### 5.1 进程控制块扩展

```rust
pub struct TaskControlBlockInner {
    pub trap_cx_ppn: PhysPageNum,
    pub base_size: usize,
    pub task_cx: TaskContext,
    pub task_status: TaskStatus,
    pub memory_set: MemorySet,
    pub parent: Option<Weak<TaskControlBlock>>,
    pub children: Vec<Arc<TaskControlBlock>>,
    pub exit_code: i32,

    pub syscall_times: [u32; MAX_SYSCALL_NUM], // 每种系统调用的调用次数
    pub start_time: usize,                     // 进程创建或首次运行时间
    pub priority: usize,                       // stride 调度优先级
    pub stride: usize,                         // 当前 stride 值
}
```

解释：

- `parent` 用 `Weak`，避免父子进程互相 `Arc` 导致引用计数永远不为 0。
- `children` 保存子进程。
- `priority` 越高，理论上获得 CPU 的比例越高。
- `stride` 越小，越优先被调度；每次运行后增加 `BIG_STRIDE / priority`。

### 5.2 `spawn`：从 ELF 创建新进程

典型逻辑：

```rust
pub fn spawn(self: &Arc<Self>, elf_data: &[u8]) -> Arc<Self> {
    let (memory_set, user_sp, entry_point) = MemorySet::from_elf(elf_data);
    let trap_cx_ppn = memory_set
        .translate(VirtAddr::from(TRAP_CONTEXT).into())
        .unwrap()
        .ppn();

    let pid_handle = pid_alloc();
    let kernel_stack = KernelStack::new(&pid_handle);
    let kernel_stack_top = kernel_stack.get_top();

    let task_control_block = Arc::new(Self {
        pid: pid_handle,
        kernel_stack,
        inner: unsafe {
            UPSafeCell::new(TaskControlBlockInner {
                trap_cx_ppn,
                base_size: user_sp,
                task_cx: TaskContext::goto_trap_return(kernel_stack_top),
                task_status: TaskStatus::Ready,
                memory_set,
                parent: Some(Arc::downgrade(self)),
                children: Vec::new(),
                exit_code: 0,
                syscall_times: [0; MAX_SYSCALL_NUM],
                start_time: get_time_ms(),
                priority: 16,
                stride: 0,
            })
        },
    });

    let trap_cx = task_control_block.inner_exclusive_access().get_trap_cx();
    *trap_cx = TrapContext::app_init_context(
        entry_point,
        user_sp,
        KERNEL_SPACE.exclusive_access().token(),
        kernel_stack_top,
        trap_handler as usize,
    );

    self.inner_exclusive_access()
        .children
        .push(task_control_block.clone());
    task_control_block
}
```

实现了什么：

- 根据 ELF 文件创建一个新的用户地址空间。
- 分配 pid 和内核栈。
- 初始化 trap context，让新进程第一次被调度时能从用户态入口开始运行。
- 把新进程挂到父进程的 `children` 里。

### 5.3 `sys_spawn`

```rust
pub fn sys_spawn(path: *const u8) -> isize {
    let token = current_user_token();
    let path = translated_str(token, path);

    if let Some(app_inode) = open_file(path.as_str(), OpenFlags::RDONLY) {
        let elf_data = app_inode.read_all();
        let current = current_task().unwrap();
        let new_task = current.spawn(elf_data.as_slice());
        let new_pid = new_task.pid.0;
        add_task(new_task);
        new_pid as isize
    } else {
        -1
    }
}
```

逻辑：

- 用户传进来的是程序路径字符串，比如 `"ch5b_stride\0"`。
- 内核从文件系统或链接进内核的应用表里找到 ELF。
- 调用 `spawn()` 创建新进程。
- 加入调度队列。
- 返回新进程 pid。

### 5.4 `sys_set_priority`

```rust
pub fn sys_set_priority(prio: isize) -> isize {
    if prio < 2 {
        return -1;
    }
    let task = current_task().unwrap();
    task.inner_exclusive_access().priority = prio as usize;
    prio
}
```

解释：

- priority 太小会导致步长过大或不合法。
- 设置后调度器下一轮会按新 priority 计算 pass。

### 5.5 stride 调度

```rust
const BIG_STRIDE: usize = usize::MAX >> 2;

pub fn fetch_task(&mut self) -> Option<Arc<TaskControlBlock>> {
    if self.ready_queue.is_empty() {
        return None;
    }

    let mut min_idx = 0;
    let mut min_stride = self.ready_queue[0].inner_exclusive_access().stride;

    for (idx, task) in self.ready_queue.iter().enumerate() {
        let stride = task.inner_exclusive_access().stride;
        if (stride.wrapping_sub(min_stride) as isize) < 0 {
            min_idx = idx;
            min_stride = stride;
        }
    }

    let task = self.ready_queue.remove(min_idx);
    {
        let mut inner = task.inner_exclusive_access();
        inner.stride = inner
            .stride
            .wrapping_add(BIG_STRIDE / inner.priority);
    }
    Some(task)
}
```

核心逻辑：

- 每次选择 `stride` 最小的任务运行。
- 运行后给它的 `stride` 增加 `BIG_STRIDE / priority`。
- priority 越大，增加越小，所以越容易再次被选中。
- `wrapping_sub` 是为了处理整数溢出后的环绕比较。

为什么不能直接用 `<`：

- `usize` 到达最大值后会回绕到 0。
- 如果直接比较大小，溢出后的任务可能被错误判断为最小或最大。
- stride 算法通常使用环绕有符号差判断先后关系。

### 5.6 系统调用统计

```rust
pub fn syscall(syscall_id: usize, args: [usize; 3]) -> isize {
    if let Some(task) = current_task() {
        let mut inner = task.inner_exclusive_access();
        if syscall_id < MAX_SYSCALL_NUM {
            inner.syscall_times[syscall_id] += 1;
        }
    }

    match syscall_id {
        SYSCALL_DUP => sys_dup(args[0]),
        SYSCALL_OPEN => sys_open(args[0] as *const u8, args[1] as u32),
        SYSCALL_CLOSE => sys_close(args[0]),
        SYSCALL_PIPE => sys_pipe(args[0] as *mut usize),
        SYSCALL_READ => sys_read(args[0], args[1] as *const u8, args[2]),
        SYSCALL_WRITE => sys_write(args[0], args[1] as *const u8, args[2]),
        SYSCALL_EXIT => sys_exit(args[0] as i32),
        SYSCALL_YIELD => sys_yield(),
        SYSCALL_GET_TIME => sys_get_time(args[0] as *mut TimeVal, args[1]),
        SYSCALL_TASK_INFO => sys_task_info(args[0] as *mut TaskInfo),
        _ => panic!("Unsupported syscall_id: {}", syscall_id),
    }
}
```

### 5.7 复盘命令

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5/os
make clean
make run TEST=5 BASE=1
```

checker：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=5
```

重点看测试：

- `ch5_spawn`：验证 `spawn` 是否能创建新进程。
- `ch5_stride`：验证优先级比例调度。
- `taskinfo` 类测试：验证状态、系统调用次数、运行时间。

## 6. ch6：文件系统与文件相关系统调用

### 6.1 实验目标

ch6 引入文件系统，重点是让内核支持：

- 文件抽象 `File` trait。
- 标准输入、标准输出。
- 普通文件打开、读、写、关闭。
- 文件描述符表。
- 可能包括硬链接、删除、目录项等扩展。

### 6.2 `File` trait

```rust
pub trait File: Send + Sync {
    fn readable(&self) -> bool;
    fn writable(&self) -> bool;
    fn read(&self, buf: UserBuffer) -> usize;
    fn write(&self, buf: UserBuffer) -> usize;
}
```

解释：

- `trait` 类似接口。
- 标准输入、标准输出、普通文件都可以实现 `File`。
- 进程的文件描述符表里只保存 `Arc<dyn File>`，不需要关心具体文件类型。

### 6.3 文件描述符表

```rust
pub struct TaskControlBlockInner {
    pub fd_table: Vec<Option<Arc<dyn File + Send + Sync>>>,
}
```

解释：

- `fd_table[0]` 通常是 stdin。
- `fd_table[1]` 通常是 stdout。
- `fd_table[2]` 通常是 stderr，部分实验里可能没有单独实现。
- `Option` 表示这个 fd 槽位是否已经打开。

分配 fd 的典型代码：

```rust
pub fn alloc_fd(&mut self) -> usize {
    if let Some(fd) = (0..self.fd_table.len()).find(|fd| self.fd_table[*fd].is_none()) {
        fd
    } else {
        self.fd_table.push(None);
        self.fd_table.len() - 1
    }
}
```

### 6.4 `sys_open`

```rust
bitflags! {
    pub struct OpenFlags: u32 {
        const RDONLY = 0;
        const WRONLY = 1 << 0;
        const RDWR   = 1 << 1;
        const CREATE = 1 << 9;
        const TRUNC  = 1 << 10;
    }
}

pub fn sys_open(path: *const u8, flags: u32) -> isize {
    let task = current_task().unwrap();
    let token = current_user_token();
    let path = translated_str(token, path);

    if let Some(inode) = open_file(path.as_str(), OpenFlags::from_bits(flags).unwrap()) {
        let mut inner = task.inner_exclusive_access();
        let fd = inner.alloc_fd();
        inner.fd_table[fd] = Some(inode);
        fd as isize
    } else {
        -1
    }
}
```

实现了什么：

- 从用户地址空间读出路径字符串。
- 按 flags 打开或创建文件。
- 把文件对象放进当前进程的 fd 表。
- 返回 fd。

### 6.5 `sys_read` / `sys_write`

```rust
pub fn sys_read(fd: usize, buf: *const u8, len: usize) -> isize {
    let task = current_task().unwrap();
    let inner = task.inner_exclusive_access();
    if fd >= inner.fd_table.len() {
        return -1;
    }
    if let Some(file) = &inner.fd_table[fd] {
        if !file.readable() {
            return -1;
        }
        let token = current_user_token();
        file.read(UserBuffer::new(translated_byte_buffer(token, buf, len))) as isize
    } else {
        -1
    }
}

pub fn sys_write(fd: usize, buf: *const u8, len: usize) -> isize {
    let task = current_task().unwrap();
    let inner = task.inner_exclusive_access();
    if fd >= inner.fd_table.len() {
        return -1;
    }
    if let Some(file) = &inner.fd_table[fd] {
        if !file.writable() {
            return -1;
        }
        let token = current_user_token();
        file.write(UserBuffer::new(translated_byte_buffer(token, buf, len))) as isize
    } else {
        -1
    }
}
```

关键点：

- fd 越界必须返回 `-1`。
- fd 对应槽位是 `None` 也要返回 `-1`。
- 不可读文件不能读，不可写文件不能写。
- 用户缓冲区必须通过页表翻译。

### 6.6 `sys_close`

```rust
pub fn sys_close(fd: usize) -> isize {
    let task = current_task().unwrap();
    let mut inner = task.inner_exclusive_access();
    if fd >= inner.fd_table.len() {
        return -1;
    }
    if inner.fd_table[fd].is_none() {
        return -1;
    }
    inner.fd_table[fd].take();
    0
}
```

解释：

- `take()` 会把 `Option` 里的值拿出来，并把原位置变成 `None`。
- 如果没有其他引用，文件对象会被释放。

### 6.7 复盘命令

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch6/easy-fs
cargo test
```

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch6/os
make clean
make run TEST=6 BASE=1
```

checker：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=6
```

复盘重点：

1. `easy-fs/src/layout.rs`：磁盘布局、inode、数据块。
2. `easy-fs/src/efs.rs`：文件系统整体结构。
3. `easy-fs/src/vfs.rs`：文件系统逻辑接口。
4. `os/src/fs/inode.rs`：内核如何包装 easy-fs 的 inode。
5. `os/src/syscall/fs.rs`：系统调用层怎么检查 fd 和用户指针。

## 7. ch7：管道、进程间通信和 I/O 扩展

### 7.1 实验目标

不同年份的 rCore ch7 内容可能略有变化，但常见核心是：

- 管道 `pipe`。
- `dup` 复制文件描述符。
- 通过 `fork` 后共享 fd 实现父子进程通信。
- shell 支持管道命令。

### 7.2 `pipe` 的结构

```rust
pub struct Pipe {
    readable: bool,
    writable: bool,
    buffer: Arc<UPSafeCell<PipeRingBuffer>>,
}

pub struct PipeRingBuffer {
    arr: [u8; RING_BUFFER_SIZE],
    head: usize,
    tail: usize,
    status: RingBufferStatus,
    write_end: Option<Weak<Pipe>>,
}
```

解释：

- 管道本质是一个环形缓冲区。
- 读端只读，写端只写。
- `Arc<UPSafeCell<PipeRingBuffer>>` 让读端和写端共享同一个缓冲区。
- `Weak<Pipe>` 用来判断写端是否已经全部关闭。

### 7.3 创建管道

```rust
pub fn make_pipe() -> (Arc<Pipe>, Arc<Pipe>) {
    let buffer = Arc::new(unsafe {
        UPSafeCell::new(PipeRingBuffer::new())
    });
    let read_end = Arc::new(Pipe {
        readable: true,
        writable: false,
        buffer: buffer.clone(),
    });
    let write_end = Arc::new(Pipe {
        readable: false,
        writable: true,
        buffer: buffer.clone(),
    });
    buffer
        .exclusive_access()
        .set_write_end(&write_end);
    (read_end, write_end)
}
```

实现了什么：

- 创建一个共享缓冲区。
- 创建两个文件对象：读端和写端。
- 两端都实现 `File` trait，因此可以放入 fd 表。

### 7.4 `sys_pipe`

```rust
pub fn sys_pipe(pipe: *mut usize) -> isize {
    let task = current_task().unwrap();
    let token = current_user_token();
    let mut inner = task.inner_exclusive_access();

    let (pipe_read, pipe_write) = make_pipe();
    let read_fd = inner.alloc_fd();
    inner.fd_table[read_fd] = Some(pipe_read);
    let write_fd = inner.alloc_fd();
    inner.fd_table[write_fd] = Some(pipe_write);

    *translated_refmut(token, pipe) = read_fd;
    *translated_refmut(token, unsafe { pipe.add(1) }) = write_fd;
    0
}
```

解释：

- 用户传入一个 `usize pipefd[2]`。
- 内核分配两个 fd。
- `pipefd[0]` 是读端。
- `pipefd[1]` 是写端。

### 7.5 `dup`

```rust
pub fn sys_dup(fd: usize) -> isize {
    let task = current_task().unwrap();
    let mut inner = task.inner_exclusive_access();
    if fd >= inner.fd_table.len() {
        return -1;
    }
    if inner.fd_table[fd].is_none() {
        return -1;
    }
    let new_fd = inner.alloc_fd();
    inner.fd_table[new_fd] = Some(inner.fd_table[fd].as_ref().unwrap().clone());
    new_fd as isize
}
```

解释：

- `clone()` 克隆的是 `Arc`，不是复制整个文件。
- 新旧 fd 指向同一个文件对象。
- 对管道来说，这意味着多个 fd 可以指向同一个读端或写端。

### 7.6 复盘命令

如果你的仓库有 ch7：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch7/os
make clean
make run
```

如果 checker 没有单独的 ch7：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=6
```

复盘重点：

1. `os/src/fs/pipe.rs`：管道读写逻辑。
2. `os/src/syscall/fs.rs`：`sys_pipe`、`sys_dup`。
3. `user/src/bin/*pipe*.rs`：用户程序如何创建管道并读写。
4. shell 代码：如何把 `cmd1 | cmd2` 转换为两个进程和一个管道。

## 8. ch8：并发、同步和死锁检测

### 8.1 实验目标

ch8 的核心是让内核支持线程和同步原语，并在此基础上处理死锁问题。常见内容包括：

- `thread_create` 创建线程。
- `waittid` 等待线程退出。
- mutex 互斥锁。
- semaphore 信号量。
- condvar 条件变量。
- 死锁检测。

### 8.2 线程与进程的关系

```rust
pub struct TaskControlBlockInner {
    pub process: Weak<ProcessControlBlock>,
    pub trap_cx_ppn: PhysPageNum,
    pub task_cx: TaskContext,
    pub task_status: TaskStatus,
    pub exit_code: Option<i32>,
}

pub struct ProcessControlBlockInner {
    pub tasks: Vec<Option<Arc<TaskControlBlock>>>,
    pub task_res_allocator: RecycleAllocator,
    pub mutex_list: Vec<Option<Arc<dyn Mutex>>>,
    pub semaphore_list: Vec<Option<Arc<Semaphore>>>,
    pub condvar_list: Vec<Option<Arc<Condvar>>>,
}
```

解释：

- 进程是资源容器：地址空间、文件描述符、同步对象列表。
- 线程是调度单位：每个线程有自己的 trap context 和内核栈。
- 同一进程里的线程共享地址空间。

### 8.3 `thread_create`

```rust
pub fn sys_thread_create(entry: usize, arg: usize) -> isize {
    let task = current_task().unwrap();
    let process = task.process.upgrade().unwrap();

    let new_task = Arc::new(TaskControlBlock::new(
        Arc::clone(&process),
        task.inner_exclusive_access()
            .res
            .as_ref()
            .unwrap()
            .ustack_base,
        true,
    ));

    let new_task_inner = new_task.inner_exclusive_access();
    let new_task_res = new_task_inner.res.as_ref().unwrap();
    let new_task_tid = new_task_res.tid;
    let trap_cx = new_task_inner.get_trap_cx();
    *trap_cx = TrapContext::app_init_context(
        entry,
        new_task_res.ustack_top(),
        KERNEL_SPACE.exclusive_access().token(),
        new_task.kstack.get_top(),
        trap_handler as usize,
    );
    trap_cx.x[10] = arg;

    process
        .inner_exclusive_access()
        .tasks[new_task_tid] = Some(Arc::clone(&new_task));
    add_task(new_task);
    new_task_tid as isize
}
```

逻辑：

- 在当前进程中创建一个新的调度任务。
- 新线程共享进程资源，但有自己的用户栈、内核栈和 trap context。
- RISC-V ABI 中 `x10` 是第一个参数寄存器，也就是 `a0`，所以把 `arg` 放入 `x10`。

### 8.4 `waittid`

```rust
pub fn sys_waittid(tid: usize) -> i32 {
    let task = current_task().unwrap();
    let process = task.process.upgrade().unwrap();
    let mut process_inner = process.inner_exclusive_access();

    if tid >= process_inner.tasks.len() {
        return -1;
    }
    if let Some(waited_task) = &process_inner.tasks[tid] {
        if Arc::strong_count(waited_task) > 1 {
            return -2;
        }
    } else {
        return -1;
    }

    let waited_task = process_inner.tasks[tid].take().unwrap();
    let exit_code = waited_task.inner_exclusive_access().exit_code.unwrap();
    exit_code
}
```

常见返回值约定：

- `-1`：tid 不存在。
- `-2`：线程还没退出。
- 非负或具体 exit code：等待成功。

### 8.5 mutex

```rust
pub trait Mutex: Sync + Send {
    fn lock(&self);
    fn unlock(&self);
}

pub struct MutexBlocking {
    inner: UPSafeCell<MutexBlockingInner>,
}

pub struct MutexBlockingInner {
    locked: bool,
    wait_queue: VecDeque<Arc<TaskControlBlock>>,
}
```

阻塞式锁的逻辑：

```rust
fn lock(&self) {
    let mut inner = self.inner.exclusive_access();
    if inner.locked {
        inner.wait_queue.push_back(current_task().unwrap());
        drop(inner);
        block_current_and_run_next();
    } else {
        inner.locked = true;
    }
}

fn unlock(&self) {
    let mut inner = self.inner.exclusive_access();
    if let Some(task) = inner.wait_queue.pop_front() {
        wakeup_task(task);
    } else {
        inner.locked = false;
    }
}
```

解释：

- 如果锁空闲，当前线程拿到锁。
- 如果锁已被占用，当前线程进入等待队列并阻塞。
- 解锁时优先唤醒等待队列里的线程。

### 8.6 semaphore

```rust
pub struct Semaphore {
    pub inner: UPSafeCell<SemaphoreInner>,
}

pub struct SemaphoreInner {
    pub count: isize,
    pub wait_queue: VecDeque<Arc<TaskControlBlock>>,
}
```

P 操作：

```rust
pub fn down(&self) {
    let mut inner = self.inner.exclusive_access();
    inner.count -= 1;
    if inner.count < 0 {
        inner.wait_queue.push_back(current_task().unwrap());
        drop(inner);
        block_current_and_run_next();
    }
}
```

V 操作：

```rust
pub fn up(&self) {
    let mut inner = self.inner.exclusive_access();
    inner.count += 1;
    if inner.count <= 0 {
        if let Some(task) = inner.wait_queue.pop_front() {
            wakeup_task(task);
        }
    }
}
```

解释：

- `count` 表示可用资源数量。
- `down` 请求资源；没有资源就阻塞。
- `up` 释放资源；如果有人等待就唤醒。

### 8.7 condvar

```rust
pub struct Condvar {
    pub inner: UPSafeCell<CondvarInner>,
}

pub struct CondvarInner {
    pub wait_queue: VecDeque<Arc<TaskControlBlock>>,
}
```

等待：

```rust
pub fn wait(&self, mutex: Arc<dyn Mutex>) {
    mutex.unlock();
    self.inner
        .exclusive_access()
        .wait_queue
        .push_back(current_task().unwrap());
    block_current_and_run_next();
    mutex.lock();
}
```

解释：

- 条件变量等待时必须先释放 mutex。
- 线程被唤醒后要重新拿锁。
- 这对应经典的 `cond_wait(cond, mutex)` 语义。

### 8.8 死锁检测

教程练习要求里，死锁检测通常围绕资源分配图：

- 线程正在等待某个锁/信号量。
- 锁/信号量被某个线程持有。
- 如果形成环，就说明可能死锁。

简化思路：

```rust
fn deadlock_detect(waiting: usize, resource: usize) -> bool {
    // 假设当前线程 waiting 想等待 resource
    // 从 resource 的持有者继续 DFS
    // 如果最终又回到 waiting，说明形成环
    dfs(resource_owner(resource), waiting)
}
```

实际实现一般需要维护：

```rust
pub struct ProcessControlBlockInner {
    pub mutex_need: Vec<Vec<usize>>,       // 线程正在等待哪些资源
    pub mutex_allocation: Vec<Vec<usize>>, // 线程已经持有哪些资源
}
```

或用更通用的矩阵：

```rust
available: Vec<usize>,
allocation: Vec<Vec<usize>>,
need: Vec<Vec<usize>>,
```

逻辑：

1. 当前线程要申请一个资源。
2. 先假设它会等待这个资源。
3. 检查等待关系图有没有环。
4. 如果有环，返回错误，避免真正阻塞进去。
5. 如果没有环，允许等待或分配。

### 8.9 复盘命令

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f ch8_work
cd os
make clean
make run TEST=8 BASE=1
```

checker：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=8
```

复盘重点：

1. `os/src/task/process.rs`：进程级资源。
2. `os/src/task/task.rs`：线程级上下文。
3. `os/src/sync/mutex.rs`：mutex 的阻塞与唤醒。
4. `os/src/sync/semaphore.rs`：信号量。
5. `os/src/sync/condvar.rs`：条件变量。
6. `os/src/syscall/sync.rs`：用户态系统调用入口。
7. 死锁测试用户程序：看它如何制造环形等待。

## 9. 那些 Python 脚本有什么用？能不能删？

截图里的脚本已经定位到：

```text
/mnt/c/Users/20694/add_debug.py
/mnt/c/Users/20694/ch6_step1.py
/mnt/c/Users/20694/ch6_step2.py
/mnt/c/Users/20694/ch6_step2b.py
/mnt/c/Users/20694/ch6_step3.py
/mnt/c/Users/20694/ch6_step3b.py
/mnt/c/Users/20694/ch6_step4.py
```

也就是 Windows 路径：

```text
C:\Users\20694\add_debug.py
C:\Users\20694\ch6_step1.py
C:\Users\20694\ch6_step2.py
C:\Users\20694\ch6_step2b.py
C:\Users\20694\ch6_step3.py
C:\Users\20694\ch6_step3b.py
C:\Users\20694\ch6_step4.py
```

结论先说：这些不是 rCore 官方源码的一部分，也不是 checker 必需文件。它们是 AI 当时为了分步骤修改实验代码而生成的“一次性补丁脚本”。如果最终 Rust 代码已经提交或保存在完成分支里，这些脚本理论上可以删除；但建议先移动到备份目录，不要直接删。

### 9.1 `add_debug.py`

这个脚本的内容大致是：

```python
path = '/home/daihuohuo/code/rCore-Tutorial-Code-2024S/os/src/syscall/process.rs'
# 找到 sys_get_time 的实现位置
# 往里面插入 println!("[sys_get_time] pid={} time_ms={}", pid, ms);
```

用途：

- 给 `sys_get_time` 加调试输出。
- 方便当时看系统调用是否被调用、时间值是否正确。

风险：

- 调试输出可能污染 checker 输出。
- 如果 checker 匹配固定输出，额外 `println!` 可能导致扣分或失败。

这次检查当前源码，没有发现 `[sys_get_time]` 这类调试输出残留，说明它要么没成功应用，要么后来被清掉了。

能不能删：

- 可以删，或者先备份。
- 它不是构建、运行、评分所必需的脚本。

### 9.2 `ch6_step1.py`

这个脚本直接修改：

```text
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/easy-fs/src/efs.rs
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/easy-fs/src/vfs.rs
```

用途：

- 给 easy-fs 增加 inode 相关辅助能力。
- 例如从磁盘 inode 位置反推 inode id。
- 给 VFS 层增加 `get_inode_id`、`is_dir`、`count_link`、`link`、`unlink` 之类能力。
- 这些能力是 ch6 `fstat`、`linkat`、`unlinkat` 的底层支撑。

能不能删：

- 如果 `ch6_work` 分支已经包含最终 Rust 修改，可以删。
- 它只是“把代码写进去”的脚本，不是运行时依赖。

### 9.3 `ch6_step2.py` 和 `ch6_step2b.py`

这两个脚本直接修改：

```text
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/os/src/fs/mod.rs
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/os/src/fs/inode.rs
/home/daihuohuo/code/rCore-Tutorial-Code-2024S/os/src/syscall/fs.rs
```

用途：

- 给 `Stat` 增加构造函数或开放字段。
- 给 `File` trait 增加 `stat()` 能力。
- 在 OS 文件系统层包装 easy-fs 的 `fstat`、`link`、`unlink`。
- 实现 `sys_fstat`、`sys_linkat`、`sys_unlinkat`。

`step2b` 看起来是 `step2` 的修正版，说明当时第一次脚本可能有 pattern 匹配不全或设计不完整，后来补了一版。

能不能删：

- 可以删，但建议保留 `step2b` 的备份价值高于 `step2`。
- 如果你只想留一个“施工记录”，保留 `ch6_step2b.py` 即可。

### 9.4 `ch6_step3.py` 和 `ch6_step3b.py`

这两个脚本用于把 ch5 的进程管理能力继续带到 ch6：

```text
task.rs
manager.rs
processor.rs
memory_set.rs
syscall/mod.rs
syscall/process.rs
```

用途：

- 增加 `syscall_times`、`start_time`、`priority`、`stride` 字段。
- 增加系统调用计数。
- 增加 stride 调度。
- 增加 `spawn`、`set_priority`、`task_info`、`mmap`、`munmap` 相关实现。

`step3b` 是 `step3` 的修正版，价值高于 `step3`。

能不能删：

- 如果 `ch6_work` 分支已经正常满分，可以删。
- 如果要保留历史，优先保留 `ch6_step3b.py`，`ch6_step3.py` 可以不要。

### 9.5 `ch6_step4.py`

这个脚本集中补 `os/src/syscall/process.rs` 里的 stubs：

```text
sys_get_time
sys_task_info
sys_mmap
sys_munmap
sys_spawn
sys_set_priority
```

用途：

- 把 ch4/ch5 的进程和内存相关系统调用补齐。
- 让 ch6 在文件系统测试之外，也能通过继承来的前置测试。

能不能删：

- 如果 `ch6_work` 分支已经包含这些实现，可以删。
- 如果要保留一份“最后补全 stubs 的记录”，这个脚本比 `step1/2/3` 更直观。

### 9.6 安全删除建议

这次检查中，没有发现这些脚本被 Makefile 或 checker 当作运行依赖。它们位于 `C:\Users\20694`，也不在 rCore 仓库目录里。因此更合理的处理是“归档或删除”，不要继续留在源代码管理的已修改列表里。

本次已经把这类一次性 AI 补丁脚本从 Windows 用户目录移走，统一备份到：

```text
/home/daihuohuo/code/_deleted_ai_patch_scripts_20260519
```

也就是先“从项目视角删除”，但保留一份备份，方便以后万一要追溯某个补丁是怎么改出来的。

当时等价操作类似：

```bash
mkdir -p /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519
mv /mnt/c/Users/20694/add_debug.py /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519/
mv /mnt/c/Users/20694/ch*_*.py /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519/
mv /mnt/c/Users/20694/fix_*.py /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519/
mv /mnt/c/Users/20694/debug_*.py /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519/
```

然后确认它们不再出现在 Windows 用户目录：

```bash
find /mnt/c/Users/20694 -maxdepth 1 -type f -name '*.py' -print
```

如果确认 `rCore-fullscore-labs` 里的 ch3 到 ch8 都还能跑过 checker，再真正删除备份也可以。

不建议直接做：

```bash
rm /mnt/c/Users/20694/*.py
```

原因是 `C:\Users\20694` 下可能还有其他 Python 文件，不一定都属于这次实验。

注意：不要删除 checker 和构建系统自己的 Python 文件，例如：

```text
/home/daihuohuo/code/rCore-fullscore-labs/ci-user/check/*.py
/home/daihuohuo/code/rCore-fullscore-labs/ci-user/overwrite.py
/home/daihuohuo/code/rCore-fullscore-labs/user/build.py
```

这些 Python 文件不是实验实现代码，而是评分、覆盖测试、构建用户程序用的工具。实验主体仍然是 Rust，主要在 `os/`、`user/`、`easy-fs/`、`easy-fs-fuse/` 下面。

### 9.7 删除前检查命令

查看这些脚本有没有被引用：

```bash
cd /home/daihuohuo/code
rg "add_debug.py|ch6_step1.py|ch6_step2.py|ch6_step2b.py|ch6_step3.py|ch6_step3b.py|ch6_step4.py"
```

看 Makefile 是否调用 Python：

```bash
find . -name Makefile -print -exec grep -n "python\|python3\|\\.py" {} \;
```

重新跑 checker：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=3
make test CHAPTER=4
make test CHAPTER=5
make test CHAPTER=6
make test CHAPTER=8
```

## 10. 一条完整复盘路线

建议你按下面方式复盘，效率最高：

### 10.1 每章先跑分

本次重新整理后的主复盘目录是：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
```

每章跑分前，先切到对应完成分支；进入 `ci-user` 后只重置 checker 的 `check`、`Makefile`、`overwrite.py` 和嵌套的 `user` 测试仓库。不要在 `ci-user` 里直接执行 `git clean -fd`，因为 `ci-user/user` 在外层 checker 仓库里可能是未跟踪目录，直接 clean 会把它删掉。

ch3：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f codex/ch3-full
cd ci-user
git checkout -- check Makefile overwrite.py
git -C user reset --hard
git -C user clean -fd
make test CHAPTER=3
```

ch4：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f codex/ch4-full
cd ci-user
git checkout -- check Makefile overwrite.py
git -C user reset --hard
git -C user clean -fd
make test CHAPTER=4
```

ch5：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f codex/ch5-full
cd ci-user
git checkout -- check Makefile overwrite.py
git -C user reset --hard
git -C user clean -fd
make test CHAPTER=5
```

ch6：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f ch6_work
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
git checkout -- check Makefile overwrite.py
git -C user reset --hard
git -C user clean -fd
make test CHAPTER=6
```

ch7：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f ch7_work
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
git checkout -- check Makefile overwrite.py
git -C user reset --hard
git -C user clean -fd
make test CHAPTER=7
```

ch8：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs
git switch -f ch8_work
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
git checkout -- check Makefile overwrite.py
git -C user reset --hard
git -C user clean -fd
make test CHAPTER=8
```

目标：

- 先切到对应完成分支，再确认该分支确实还能满分。
- 防止后来整理、移动脚本或清理文件后破坏环境。

### 10.2 每章列出改动文件

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5
git diff --stat
```

如果你之前已经提交过 AI 代码，就看提交历史：

```bash
git log --oneline --decorate -20
git show --stat HEAD
```

### 10.3 每章抓关键代码

推荐只抓这些文件：

```text
ch3:
  os/src/task/*
  os/src/trap/mod.rs
  os/src/syscall/*

ch4:
  os/src/mm/*
  os/src/syscall/*

ch5:
  os/src/task/*
  os/src/syscall/process.rs
  os/src/syscall/mod.rs

ch6:
  easy-fs/src/*
  os/src/fs/*
  os/src/syscall/fs.rs

ch7:
  os/src/fs/pipe.rs
  os/src/syscall/fs.rs
  user/src/bin/*pipe*

ch8:
  os/src/sync/*
  os/src/task/*
  os/src/syscall/sync.rs
```

### 10.4 给每段代码写三件事

每段代码都按这个格式复盘：

```text
代码位置：
  os/src/task/manager.rs

实现功能：
  从就绪队列中选择下一个任务。

核心逻辑：
  stride 最小的任务先运行，运行后 stride 增加 pass。

容易错的点：
  stride 会溢出，所以比较时要用 wrapping_sub。
```

### 10.5 最后清理脚本

先查引用：

```bash
cd /home/daihuohuo/code
find . -name '*.py' -print
rg "python|python3|\\.py"
```

再移动备份：

```bash
mkdir -p /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519
mv path/to/script.py /home/daihuohuo/code/_deleted_ai_patch_scripts_20260519/
```

再跑分：

```bash
cd /home/daihuohuo/code/rCore-fullscore-labs/ci-user
make test CHAPTER=3
make test CHAPTER=4
make test CHAPTER=5
make test CHAPTER=6
make test CHAPTER=7
make test CHAPTER=8
```

全部通过后再决定是否删除 `/home/daihuohuo/code/_deleted_ai_patch_scripts_20260519`。

## 11. 最重要的理解主线

从 ch3 到 ch8，其实是一条逐步扩展 OS 能力的线：

```text
ch3：任务切换
  一个 CPU 上轮流跑多个用户程序

ch4：虚拟内存
  每个程序有自己的地址空间，内核负责地址翻译和权限保护

ch5：进程管理
  程序可以创建子进程，调度器可以按优先级分配 CPU

ch6：文件系统
  进程可以通过 fd 访问 stdin/stdout/普通文件

ch7：进程间通信
  进程可以通过 pipe 等机制交换数据

ch8：线程与同步
  一个进程内可以有多个线程，并通过锁、信号量、条件变量协作
```

你复盘时不要先陷入 Rust 语法细节。更好的顺序是：

1. 先问“这个系统调用要给用户提供什么能力”。
2. 再看“内核为了这个能力新增了哪些数据结构”。
3. 再看“系统调用如何检查参数、修改内核状态、返回结果”。
4. 最后才看 Rust 里的 `Arc`、`Option`、`RefMut`、`unsafe` 是怎么配合完成这件事的。

## 12. 后续如果要把本文变成你的真实最终报告

等 WSL 能正常访问后，建议执行：

```bash
cd /home/daihuohuo/code
find . -maxdepth 2 -type d -name 'rCore-Tutorial-Code-2025S-ch*' | sort
```

然后每章导出关键 diff：

```bash
cd /home/daihuohuo/code/rCore-Tutorial-Code-2025S-ch5
git diff > /tmp/ch5.diff
```

或者如果已经提交：

```bash
git show HEAD > /tmp/ch5.patch
```

把真实代码替换到本文对应章节。这样本文就能从“复盘讲义”升级成“你的实验最终报告”。


# 异常、RAII 与 C++17 值类型

## 失败也属于接口设计

函数可能没有正常结果时，先决定怎样表达：普通分支可返回 bool 或状态；有值/无值可用 optional；若调用链无法就地恢复，可抛出异常并由合适边界处理。不要把每次循环退出都设计成异常。

`throw std::runtime_error(...)` 创建异常对象；`catch (const std::exception& e)` 按引用捕获，避免切片。派生异常的 catch 写在基类之前。`throw;` 在处理器中重新抛出原异常；`throw e;` 可能复制并切片。

## 栈展开调用已经构造完成的局部对象析构

异常离开一个作用域时，该作用域内已经构造完成的自动对象会被销毁。因而资源放在 vector、unique_ptr 或自定义 RAII 守卫中，就不必为每个 return/catch 重复清理。裸指针局部变量自己被销毁，不会自动 delete 它指向的对象。

析构通常隐式 noexcept。异常越过 noexcept 边界会调用 terminate；析构期间再抛出未被处理的异常也很危险。可以在析构内做必要的尽力清理，把能报告失败的操作放到显式成员函数。

## 三种值类型不要混用

| 类型 | 表达的含义 | 常见访问方式 |
|---|---|---|
| `optional<T>` | 可能没有一个 T | 先检查，再 `*value` 或 value() |
| `variant<A,B>` | 已知类型集合中的一个值 | visit、get_if |
| `any` | 运行时存储可拷贝的某种类型 | any_cast，类型不匹配需处理 |

variant 的候选类型在编译期已知，但当前激活哪一种可以在运行时改变。不要把它说成“所有类型都在运行时随意添加”。any 则需要运行时类型检查；二者都不应通过 memset 清零内部表示。

## 代码实验：失败之前先清理

```cpp
#include <iostream>
#include <optional>
#include <stdexcept>
struct Guard {
    Guard() { std::cout << "acquire\n"; }
    ~Guard() { std::cout << "release\n"; }
};
void work() { Guard g; throw std::runtime_error("failed"); }
int main() {
    try { work(); }
    catch(const std::exception&) { std::cout << "caught\n"; }
    std::optional<int> result;
    std::cout << result.has_value() << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
acquire
release
caught
0
```

</details>

本机运行：`python practice/judge.py demo d14`。源码位于 `demos/d14.cpp`。

输出中 release 出现在 caught 之前，表明异常处理器开始执行前，局部守卫已经完成清理。整个程序正常结束，没有依赖未定义行为。

## 自查

- 未捕获异常会怎样？程序会进入 terminate 处理，不应期待外层不存在的 catch。
- optional 为 nullopt 时能直接解引用吗？不能，先判断。
- `variant` 里不是 int 时 `get_if<int>` 返回什么？空指针，可安全用条件分支处理。

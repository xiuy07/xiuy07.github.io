# 拷贝、移动与值语义

## 先判断对象是否已经存在

`Buffer b = a;` 创建 b，通常涉及拷贝构造；`b = a;` 修改已经存在的 b，涉及拷贝赋值。右侧即使写等号，也不能只凭符号判断是哪种机制。

类含有裸拥有指针时，默认成员拷贝只复制地址。两个对象可能因此释放同一块内存。深拷贝需要为新对象取得独立存储并复制元素，使修改副本不影响原对象。

拷贝赋值还必须考虑自赋值、旧资源释放和分配失败。可以先构造临时副本，再交换资源；分配失败时原对象保持不变。p13 用 unique_ptr 管理数组，但要求你自己补上深拷贝协议。

## 移动是在转移资源

`std::move(x)` 本身不搬运任何资源，它把表达式转换为可参与移动重载的形式。之后选中的是移动还是拷贝，要看类型、const 和可用重载。`std::move` 一个 const string 通常仍走拷贝，因为常见移动构造需要非常量右值引用。

移动后的标准库对象通常保持有效但值未指定，除非具体接口另有保证。不能笼统要求所有 moved-from 对象都为空。本指南自定义 Buffer/MoveBox 会在题面明确规定“移动后为空”，那是这些类自己的契约。

命名的右值引用变量本身作为表达式仍是左值。函数内要继续转移它的资源，通常需要显式 std::move。转发引用则使用 std::forward，模板章再讲。

## noexcept 与复制消除

不抛异常的移动构造适合声明 noexcept，容器在重分配时可据此选择更合适的策略。它是承诺，不要在内部执行可能逃逸的异常操作。

C++17 对某些纯右值初始化提供保证的复制消除；命名局部对象的 NRVO 仍是可选优化。因此不要把所有 `return local;` 的构造次数写死，也不要习惯性写 `return std::move(local);`，这可能妨碍 NRVO。

## 代码实验：独立副本与移动后的自定义约定

```cpp
#include <iostream>
#include <vector>
#include <utility>
struct Buffer { std::vector<int> data; };
int main() {
    Buffer a{{2,4,6}};
    Buffer clone=a;
    clone.data[0]=99;
    std::cout << a.data[0] << ' ' << clone.data[0] << '\n';
    Buffer target=std::move(a);
    std::cout << target.data.size() << ' ' << target.data[2] << '\n';
    std::cout << clone.data[0] << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
2 99
3 6
99
```

</details>

本机运行：`python practice/judge.py demo d07`。源码位于 `demos/d07.cpp`。

这里 clone 是 vector 的独立副本。演示不读取移动后的 vector 内容，而只观察目标对象以及仍有效的其他副本。

## 自查

- 深拷贝等于“每个成员都必须手写复制”吗？不是，vector 等成员已经提供正确的值语义。
- 有析构函数就必须手写五个成员吗？先判断所有权与可复制性，也可以明确删除拷贝。
- 自移动赋值要保留值吗？由具体契约决定；p14 特别要求自移动后保持值，参考实现会检查自身。

# 运算符重载与转换

## 运算符本质上仍是函数

重载不能改变优先级、结合性和操作数个数，不能创造新符号。至少一个操作数需要是类或枚举类型，不能替内置 int 重新定义加法。点号、作用域解析、条件运算符等不能按普通重载方式重载。

设计 Rational 时先建立不变式：分母为正，分子分母约分，零统一为 0/1。这样相等比较与输出都更简单。算术过程中使用 long long，并根据题目范围保证交叉乘法不溢出。

对称二元运算常用非成员函数，使左右操作数转换规则更对称；复合赋值通常修改左操作数并返回引用。可以先实现 `+=`，再让 `+` 按值接收左操作数并调用 `+=`。不要让加法偷偷改变原操作数。

## 前置与后置 ++

前置 `T& operator++()` 先修改自己，返回自己；后置 `T operator++(int)` 先保存旧值，再修改自己，返回旧值。那个 int 是用来区分签名的占位参数，不是用户提供的步长。

返回旧值不能用局部变量的引用，否则函数退出后引用悬空。返回值优化与移动可以减少复制开销，但首先应保证语义正确。

## 流输出返回原来的流

`std::ostream& operator<<(std::ostream&, const T&)` 通常返回传入的流引用，这样 `out << a << b` 才能链式调用。不要在内部硬编码使用 cout，测试可能传入 ostringstream。

单参数构造与转换运算符可能引入隐式转换。优先使用 explicit 限制意外转换，避免“自定义类型 + int”出现多个同样好的匹配。逻辑运算符重载也不会保留内置 &&/|| 的短路行为，通常不值得这样设计。

## 代码实验：后置返回旧值，前置返回自身

```cpp
#include <iostream>
struct Counter {
    int n;
    explicit Counter(int x):n(x) {}
    Counter& operator++() { ++n; return *this; }
    Counter operator++(int) { Counter old=*this; ++(*this); return old; }
};
int main() {
    Counter c(4);
    Counter old=c++;
    std::cout << old.n << ' ' << c.n << '\n';
    Counter& same=++c;
    std::cout << same.n << ' ' << (&same==&c) << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
4 5
6 1
```

</details>

本机运行：`python practice/judge.py demo d11`。源码位于 `demos/d11.cpp`。

第一行得到旧值 4，同时对象变为 5；第二行先增到 6，再读取返回的自身引用。

## 自查

- `operator[]` 的 const 重载为什么重要？只读对象也需要安全查询。
- 运算符重载能把 `a+b*c` 改成先做加法吗？不能。
- 为什么输出函数的对象参数通常是 const 引用？输出不应修改对象，也应接受只读对象。

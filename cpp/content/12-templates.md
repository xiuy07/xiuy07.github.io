# 函数模板、类模板与转发

## 模板表达一族实现

函数模板 `template<class T> T larger(T a,T b)` 在需要时生成相应实例。它要求 T 支持比较和返回所需的复制/移动。模板不等于运行时“任意类型”，类型不满足要求时，通常在实例化阶段报错。

同一个 T 的两个参数需要推导一致，所以 `larger(1,2.5)` 未必能直接推导成功。可以明确指定模板实参，或设计允许两个类型的接口。不要用宏替代模板：宏没有同样的类型检查，而且可能重复求值。

类模板 `Stack<T>` 把存储和操作绑定到同一种元素类型。静态成员属于具体实例化类型，Stack<int> 与 Stack<string> 不共享同一个模板静态变量。

## 为什么定义常放头文件

编译器在实例化使用点通常需要看到完整定义。只在头文件声明模板，而把实现藏进另一个不显式实例化的 .cpp，可能造成链接错误。初学阶段把模板定义放在头文件中最直接；显式实例化是进一步的工程技巧。

## if constexpr 与普通 if

普通 if 的两个分支通常都必须满足编译要求；模板中的 if constexpr 会根据编译期条件丢弃对应分支，使不同类型能使用不同实现。它不能让模板之外任意错误代码都变合法。

## 转发引用与命名表达式

当 T 需要推导时，`T&&` 可以成为转发引用，接收左值或右值。函数内部的命名参数 arg 本身是左值表达式；`std::forward<T>(arg)` 按推导出的类型保留原调用者的值类别。固定类型 `Widget&&` 不属于这里的转发引用。

## 代码实验：同一个参数，命名后是左值

```cpp
#include <iostream>
#include <utility>
void choose(int&) { std::cout << "lvalue\n"; }
void choose(int&&) { std::cout << "rvalue\n"; }
template<class T> void relay(T&& x) {
    choose(x);
    choose(std::forward<T>(x));
}
int main() { int a=3; relay(a); relay(4); }
```

<details><summary>查看已验证的运行输出</summary>

```text
lvalue
lvalue
lvalue
rvalue
```

</details>

本机运行：`python practice/judge.py demo d12`。源码位于 `demos/d12.cpp`。

每次进入 relay，直接传 x 都选左值重载；forward 则让第二次调用保留右值类别。理解这一点再使用完美转发，避免无条件 move 走调用者仍需使用的资源。

## 自查

- 函数模板能偏特化吗？不能直接按类模板偏特化的方式做，通常使用重载。
- 模板会在程序运行时才生成代码吗？普通模板实例化发生在编译阶段。
- 模板报错很多行时先看哪里？找自己的实例化调用点，再看缺少的操作或类型不匹配。

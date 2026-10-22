# const 成员、静态成员与友元

## const 是接口承诺

`int value() const` 表示该成员函数不能通过普通成员访问修改对象的非 mutable 状态，因此 const 对象也能调用。一个类可以为同名函数提供 const 与非 const 重载：可修改对象返回 `T&`，只读对象返回 `const T&`。

const 成员函数不自动使指针指向的对象也变成 const。它限制 this 所指对象的访问路径；拥有指针的类仍要自己设计深层只读语义。不要从只读接口泄漏一个可任意修改内部数据的引用。

`mutable` 允许特定成员在 const 函数中修改，适合缓存、统计等不改变逻辑值的状态，不应该被用来绕过所有 const 约束。缓存还需要考虑并发；本指南练习是单线程。

## static 属于类，而不是每个对象

静态成员函数没有 this，不能直接访问某个对象的非静态成员。静态数据成员由同一类型的对象共享。C++17 可以在类内用 `inline static int alive = 0;` 定义计数器；传统写法则需在一个 .cpp 中提供定义。

对象计数要把每个实际创建的对象都算进去。拷贝构造创建一个新对象，所以要加一；拷贝赋值只是修改已有对象，数量不变。析构减一。依赖可选复制消除的“固定计数题”应谨慎处理，本指南测试使用明确的创建与销毁。

## 友元是受控协作

友元函数仍是非成员函数，只是被授予访问私有成员的权限。友元关系不自动传递、不自动互相授予，也不被派生类继承。通常先考虑是否能用公开接口实现；需要对称运算或流输出时，再使用友元。

## 代码实验：只读对象与类级计数

```cpp
#include <iostream>
struct Counter {
    inline static int alive=0;
    int n;
    explicit Counter(int x):n(x) { ++alive; }
    Counter(const Counter& x):n(x.n) { ++alive; }
    Counter& operator=(const Counter&)=default;
    ~Counter() { --alive; }
    int value() const { return n; }
};
int main() {
    const Counter a(7);
    std::cout << a.value() << ' ' << Counter::alive << '\n';
    { Counter b=a; b=a; std::cout << Counter::alive << '\n'; }
    std::cout << Counter::alive << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
7 1
2
1
```

</details>

本机运行：`python practice/judge.py demo d08`。源码位于 `demos/d08.cpp`。

a 的 const 查询能被调用；b 的创建使 alive 增加，赋值没有增加。离开内层作用域后 b 析构，计数回到 1。

## 自查

- `const Counter& c` 能调用没有 const 后缀的 get 吗？不能。
- static 成员函数能直接使用 this 吗？不能。
- 友元为什么不属于“把所有成员设成 public”？它只授予特定函数/类访问权，但仍应控制数量与职责。

# 继承、虚函数与对象切片

## 公开继承表达可以替换的关系

`class Circle : public Shape` 表示 Circle 可以在需要 Shape 的位置使用。基类接口应描述共同契约，派生类补充具体行为。仅仅为了借用几段实现代码，通常优先考虑组合成员，而不是建立继承层次。

通过 `Base&` 或 `Base*` 调用虚函数时，会按实际对象的动态类型选择最终覆盖函数。普通非虚函数按静态类型决定。写 `override` 让编译器检查签名，特别是参数和 const 是否一致；函数名一样不代表成功覆盖。

## 按值传参会切片

把 Derived 赋给 Base 对象，只保留基类子对象。`void show(Base b)` 因而无法保留完整派生身份。需要多态时用引用、指针或拥有派生对象的智能指针，而不是 `vector<Base>`。

若允许通过基类指针 delete 派生对象，基类应提供适当的虚析构函数，例如 `virtual ~Base() = default;`。否则在本指南的普通类层次中会产生未定义行为，不能简单说成“只漏调一个析构”。

## 三个独立步骤

首先按静态类型查找名称与选择重载；接着确定调用是否为虚调用；最后虚调用才按动态类型选择覆盖函数。因此默认实参来自静态可见的声明，而函数体可以来自派生类。避免在派生类重新给同一虚函数设置不同默认值。

构造和析构期间的虚调用按当前正在构造/析构的类层次工作，不会像完整对象阶段那样调用更派生部分。不要从基类构造函数依赖派生状态。

## 代码实验：虚函数和普通函数走不同规则

```cpp
#include <iostream>
struct Base {
    virtual ~Base()=default;
    virtual const char* name() const { return "Base"; }
    const char* plain() const { return "Base plain"; }
};
struct Derived:Base {
    const char* name() const override { return "Derived"; }
    const char* plain() const { return "Derived plain"; }
};
int main() {
    Derived d;
    Base& b=d;
    std::cout << b.name() << '\n' << b.plain() << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
Derived
Base plain
```

</details>

本机运行：`python practice/judge.py demo d09`。源码位于 `demos/d09.cpp`。

b 的静态类型是 Base&，所以 plain 调用 Base 版本；动态对象是 Derived，所以 name 调用 Derived 版本。注意 `const` 也是覆盖签名的一部分。

## 自查

- 虚函数能写 inline 吗？可以。inline 与 virtual 不冲突，是否展开由调用和优化条件决定。
- 静态成员函数或构造函数能是 virtual 吗？不能。
- `vector<unique_ptr<Base>>` 可以存不同派生对象吗？可以，配合虚析构管理生命期。

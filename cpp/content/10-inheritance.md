# 多继承、虚基类与 NVI

## 先数有几份基类子对象

若 Student 和 Worker 都普通继承 Person，Assistant 同时继承两者，通常会含有两份 Person 子对象。`a.id` 会因路径不明确而产生二义性；显式写路径只是在选其中一份，不是让两份自动合并。

让两条继承边都使用 `virtual public Person`，最派生对象中相应的 Person 虚基类子对象才共享。虚继承解决的是子对象共享问题，与“虚函数负责动态调用”不是同一个机制。

虚基类由最派生类负责初始化。直接基类的初始化列表中可以写 Person，但当它们只是 Assistant 的子对象时，相应虚基类初始化由 Assistant 决定。练习 p19 会分别通过两条路径修改和观察同一份 id。

## 构造顺序与对象布局

先构造虚基类，再按基类列表顺序构造直接非虚基类，再按声明顺序构造成员，最后执行构造函数体。不要用某次编译器输出的对象大小或虚表布局，推断所有平台都相同。课程中的内存图有助于理解实现，但不是跨平台 ABI 承诺。

多继承还可能带来同名成员和覆盖冲突。设计时先确认是否真需要共享基类；许多业务关系用组合更清楚。这里保留虚继承，是因为它属于课程要求，并有明确的机制练习。

## NVI：公开接口调用虚的实现钩子

NVI（非虚接口）让公开的普通成员执行统一流程，再调用一个虚函数完成变化部分。例如 `render()` 负责统一格式，`write()` 负责具体内容。

`operator<<` 是非成员函数，不能声明为虚函数；可以让它调用对象的普通 render，再由 render 调用虚的 write。这样通过 `const Document&` 输出时仍能保留派生类型行为。

## 代码实验：共同入口与派生内容

```cpp
#include <iostream>
class Document {
    virtual void write(std::ostream& out) const=0;
public:
    virtual ~Document()=default;
    void render(std::ostream& out) const { out << '['; write(out); out << ']'; }
    friend std::ostream& operator<<(std::ostream& out,const Document& d) {
        d.render(out); return out;
    }
};
class Text:public Document {
    void write(std::ostream& out) const override { out << "hello"; }
};
int main() { Text t; const Document& d=t; std::cout << d << '\n'; }
```

<details><summary>查看已验证的运行输出</summary>

```text
[hello]
```

</details>

本机运行：`python practice/judge.py demo d10`。源码位于 `demos/d10.cpp`。

查找过程是非成员输出函数 → 公共 render → 虚 write。每一步职责都可单独解释，避免把“友元”误当成动态分派。

## 自查

- virtual 继承会让所有同名成员都共享吗？只共享相应虚基类子对象。
- 基类的私有虚函数能被派生类覆盖吗？可以，覆盖与访问控制是不同问题。
- 友元输出函数会被继承吗？不会，示例依靠参数绑定和虚调用实现多态。

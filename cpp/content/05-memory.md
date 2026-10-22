# 动态内存、所有权与链表

## 生命期比地址更重要

自动对象通常在离开作用域时销毁；动态对象的生命期由所有者管理。`new T(...)` 分配存储并构造对象，`delete p` 析构并释放；`new T[n]` 必须配 `delete[]`。malloc/free 只处理原始存储，不会按 C++ 类的规则自动构造与析构。

拥有一个指针，是指负责决定何时释放它；借用一个指针，是只在约定生命期内使用它。两个裸指针都指向同一对象，并不能说明谁负责 delete。给指针改成 nullptr 也不会让其他别名自动失效。

工程代码优先让资源由对象管理。`unique_ptr<T>` 表示独占所有权，不能复制但能移动；`shared_ptr<T>` 表示共享所有权，最后一个共享所有者离开时释放。`weak_ptr<T>` 不延长生命期，使用前通过 lock 尝试取得共享所有者。不要从同一个裸指针分别构造两个独立 shared_ptr。

## 链表反转的三步

对当前结点 cur，先保存原后继 next，再把 cur->next 改成 prev，最后向前推进。若先修改连接再查找后继，就会丢失未处理部分。

```text
已反转部分 <- prev     cur -> next -> 未处理部分
```

每轮开始时，prev 指向已反转部分的头，cur 指向尚未处理部分的头。循环结束 cur=nullptr，prev 就是新头。头结点为空、只有一个结点都自然适用。

练习中手写裸指针链表是为了观察连接变化；提交前仍要释放所有结点。这里没有环，所以可以循环保存 next 后逐个 delete。长链表用循环释放可避免很深的递归析构链。

## 代码实验：所有权能移动，借用只在作用域内使用

```cpp
#include <iostream>
#include <memory>
#include <utility>
struct Item {
    int value;
    explicit Item(int x):value(x) { std::cout << "acquire\n"; }
    ~Item() { std::cout << "release\n"; }
};
int main() {
    auto a=std::make_unique<Item>(7);
    Item* observed=a.get();
    auto b=std::move(a);
    std::cout << (a==nullptr) << ' ' << observed->value << ' ' << b->value << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
acquire
1 7 7
release
```

</details>

本机运行：`python practice/judge.py demo d05`。源码位于 `demos/d05.cpp`。

移动后 a 为空，b 持有对象。示例里的 observed 在 b 销毁后会失效，因此不能在作用域外继续使用。

## 调试清单

内存题先画“谁拥有谁”，再排查：未初始化指针、越界、释放后访问、重复释放、泄漏。GCC/Clang 可在支持的环境中启用 ASan/UBSan；Windows 部分发行版不支持该选项，默认评测不会强行启用。没有报错不能代替正确的生命期推理。

## 自查

- 为什么反转时要先存 next？原连接即将被覆盖。
- shared_ptr 循环引用为什么泄漏？双方强引用都无法降到零；适当方向改用 weak_ptr。
- unique_ptr 可以管理数组吗？可以用 `unique_ptr<T[]>`；普通序列通常直接选 vector。

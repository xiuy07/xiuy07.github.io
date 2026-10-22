# 数组、string 与 vector

## 先选能表达长度的类型

原生数组 `int a[4]` 有固定长度，元素连续存储。`std::array<int,4>` 把固定长度封装成容器；`std::vector<int>` 的元素个数可以变化；`std::string` 管理字符序列。日常题目优先用后两者，学习原生数组是为了理解接口与内存布局。

`vector<int> a(n)` 创建 n 个可访问的元素；`a.reserve(n)` 只是预留存储能力，size 仍是 0，不能随后直接写 `a[0]`。要么先 resize，要么用 push_back 增加元素。`operator[]` 不检查越界；`at()` 会在越界时抛异常。

## 扩容会改变地址

vector 的连续存储意味着扩容可能搬迁整段元素。原来的指针、引用和迭代器在重分配后失效，不应继续使用。提前 reserve 能减少重分配，但不能把它当成无限有效的承诺。`erase` 也会使删除位置及后面的迭代器失效。

范围 for 的 `auto x` 是副本，修改它不会改变容器；`auto& x` 是引用，可以修改元素；`const auto& x` 用于只读遍历。

## 输入字符串时保留什么

`cin >> s` 读取一个被空白分隔的词；`getline(cin,s)` 读取一整行，可以包含空格。刚用 `>>` 读完数字再 getline，换行可能还留在流中。若题目允许空行，使用 `ignore(...,'\n')` 丢弃上一行剩余部分；不要无条件用 `std::ws`，它也会吃掉合法的前导空白与空行。

## 代码实验：容量、长度与引用

```cpp
#include <iostream>
#include <vector>
int main() {
    std::vector<int> a;
    a.reserve(8);
    std::cout << a.size() << ' ' << (a.capacity() >= 8) << '\n';
    a.push_back(3); a.push_back(5);
    for (auto x : a) x *= 2;
    std::cout << a[0] << ' ' << a[1] << '\n';
    for (auto& x : a) x *= 2;
    std::cout << a[0] << ' ' << a[1] << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
0 1
3 5
6 10
```

</details>

本机运行：`python practice/judge.py demo d03`。源码位于 `demos/d03.cpp`。

容量只保证“不小于申请值”，具体扩容倍数由实现决定，所以示例输出判断值而不输出具体 capacity。

## 原地去重的读写指针

对已排序序列，维护一个写入位置 k。依次读取 x，若 k=0 或 x 与最后保留值不同，就写到 `a[k++]`。不变式是 `[0,k)` 已经是处理部分的无重复结果。读取位置永远不落后于写入位置，所以覆盖不会破坏尚未读取的元素。

这比反复 erase 简单：每个元素只读写常数次，总时间 O(n)。练习 p05 要求输出有效前缀，数组尾部不属于答案。

## 自查

- reserve 后能访问新位置吗？不能，合法位置由 size 决定。
- 清空 vector 后容量一定归零吗？不一定。
- 为什么排序是本章去重算法的前提？相同值必须相邻，才能只比较最后保留值。

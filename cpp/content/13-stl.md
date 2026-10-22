# STL、迭代器、算法与 Lambda

## 容器选择对应操作需求

vector 适合连续存储与下标访问；deque 支持两端插入删除；list 支持已知迭代器位置的常数时间连接操作。map 按键有序，单次查找通常 O(log n)；unordered_map 平均查找为 O(1)，最坏情况不能保证常数时间。

stack、queue、priority_queue 是适配器。它们隐藏了不需要的操作，例如 stack 只有栈顶访问。需要同时访问队首和队尾的单调队列用 deque；本指南单调栈则用 vector 保存下标。

## 算法接收迭代器区间

`sort(begin,end)` 处理 `[begin,end)`；end 不是最后一个元素，不可解引用。sort 需要随机访问迭代器，不能直接用于 list，list 有自己的 sort 成员。

比较器必须给出严格弱序，例如 `a.score > b.score`，而不是 `>=`。相等对象之间必须返回 false；错误比较器可能使算法行为不符合要求。要确定输出顺序，给相同分数设置姓名等次级键，或选择有明确保序需求的 stable_sort。

## Lambda 的捕获决定生命期关系

`[x]` 保存当时的副本；`[&x]` 借用原对象。按值捕获通常不能在非 mutable 的调用运算符中修改自己的副本；加 mutable 后改的仍是那份副本。不要从函数返回一个借用局部变量的 lambda。

`[p=std::move(owner)]` 可以把独占资源移动进闭包。闭包能否复制取决于它的成员；不能假定所有 lambda 都适合放入要求可复制目标的 std::function。

## 代码实验：排序条件与捕获副本

```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
struct Student { std::string name; int score; };
int main() {
    std::vector<Student> a={{"Bob",90},{"Amy",90},{"Cid",80}};
    std::sort(a.begin(),a.end(),[](const auto& x,const auto& y) {
        if(x.score!=y.score) return x.score>y.score;
        return x.name<y.name;
    });
    for(const auto& s:a) std::cout << s.name << ' ' << s.score << '\n';
    int n=5;
    auto next=[n]() mutable { return ++n; };
    std::cout << next() << ' ' << next() << ' ' << n << '\n';
}
```

<details><summary>查看已验证的运行输出</summary>

```text
Amy 90
Bob 90
Cid 80
6 7 5
```

</details>

本机运行：`python practice/judge.py demo d13`。源码位于 `demos/d13.cpp`。

排序以分数降序、姓名升序为规则。lambda 的两次调用修改内部副本，所以外面的 n 仍然是 5。

## 自查

- `map[key]` 查询不存在的键会怎样？通常会插入默认值；只查询用 find 或 at。
- unordered_map 的遍历顺序能作为输出契约吗？不能，需自行排序。
- two-sum 查找时为什么先查补数、后插当前值？避免把同一个位置使用两次。

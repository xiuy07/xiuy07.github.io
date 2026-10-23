# 算法分析与二分边界

## 先写操作契约

数据结构把“能做什么”与“怎样存储”分开。一个顺序表需要位置访问、插入和删除；它可以用动态数组实现，也可以用链表实现。讨论速度时必须具体到操作，而不是笼统说某种结构更快。分析模型通常把一次整数访问或比较视作常数，但大整数、字符串比较与内存分配不一定如此。

O 是渐近上界，Ω 是下界，Θ 是同量级界；它们本身不是最坏、最好、平均情况的同义词。要分别说明分析的是哪一种输入情况。二重循环也不一定 Θ(n²)：如果内层总共只推进 n 次，整体可能是 Θ(n)。动态数组一次扩容是 O(n)，一串尾插的摊还成本可为 O(1)，这又不同于假设随机输入的平均成本。

## 用半开区间表达二分

在非递减数组中找第一个不小于 x 的位置，维护 `[left,right)`。始终保证 left 左侧全部小于 x，right 及其右侧全部不小于 x。若 a[mid]<x，则 left=mid+1；否则 right=mid。每轮严格缩短区间，退出时两个边界重合，就是答案；可能等于 n，表示没有这样的元素。

中点写成 `left+(right-left)/2`。数组为空也能直接返回 0。不要把“查某个相等值”的闭区间模板与这段下界模板混用。浏览器里的逐步演示会显示每轮区间、mid 和被排除的部分。

## 最大子数组：状态到底表示什么

ending 是“以当前元素结尾、允许取空”的最佳和；best 是已经处理部分的全局最佳和。转移 `ending=max(0,ending+x)`，再更新 best。每个元素只处理一次，时间 O(n)，额外空间 O(1)。允许空与必须非空是两种题意，本章练习明确允许空，因此全负数组答案为 0。

## 手推检查

1. 数组 `[1,2,2,8]` 中 x=2、9、0 的下界分别在哪里？
2. 从容量 1 开始按倍增扩容，前 8 次尾插一共搬运几次旧元素？

<details><summary>核对思路</summary>

下界分别为 1、4、0。旧元素搬运发生于 1→2、2→4、4→8，共 1+2+4=7 次；加上本来的 8 次写入，总工作仍与 n 同量级。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：search</summary>

```cpp
inline int lower_bound_index(const std::vector<i64> &a, i64 x) {
    int left = 0, right = static_cast<int>(a.size());
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (a[mid] < x)
            left = mid + 1;
        else
            right = mid;
    }
    return left;
}
inline i64 max_subarray(const std::vector<i64> &a) {
    i64 ending = 0, best = 0;
    // 允许空子数组，和为 0。
    for (i64 x : a) {
        ending = std::max<i64>(0, ending + x);
        best = std::max(best, ending);
    }
    return best;
}
```

</details>

## 可运行实验

先预测输出，再运行；这里的演示代码直接使用上面的实现。

```cpp
#include "../algorithms/dsa.hpp"
#include <iostream>
using namespace study;
template <class T> void print(const std::vector<T> &a) {
    for (std::size_t i = 0; i < a.size(); ++i) {
        if (i)
            std::cout << ' ';
        std::cout << a[i];
    }
    std::cout << '\n';
}
int main() {
    print(std::vector<int>{lower_bound_index({1, 2, 2, 8}, 2)});
    std::cout << max_subarray({-4, 3, -1, 5, -9}) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
1
7
```

</details>

本机运行：`python practice/judge.py demo d17`。

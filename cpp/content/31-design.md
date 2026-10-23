# 贪心、分治与动态规划

## 三种思想关注不同结构

分治把问题拆成规模较小的子问题，再合并结果，归并排序是直接例子。动态规划记录有重复利用价值的子问题结果，避免反复求解；可以自顶向下记忆化，也可以自底向上填表。贪心每步承诺一个局部选择，需要证明不会失去全局最优，不能只凭“看起来最好”。

复习资料中的经验性口号不应替代定义。动态规划可以结合回溯恢复方案，记忆化也是一种正常实现；“有回溯就不是 DP”的说法不成立。关键是状态含义、转移关系与计算依赖，而不是代码有没有递归。

## 活动选择的交换论证

活动时间为 `[start,finish)`，要求 start<finish，结束时刻相同允许下一项马上开始。要选最多个互不重叠活动，可以每次选最早结束者：在任意最优方案中，把第一项换成结束更早的选择，不会阻碍后续活动，再对子问题重复。按最短持续时间或最早开始选择则没有同样保证。

## 0/1 背包为何倒序更新

dp[c] 表示容量不超过 c 时的最大价值。每个物品只能选一次，转移是 `max(不选, dp[c-weight]+value)`。压缩成一维后，容量必须从大到小扫描，保证右侧仍来自处理本物品之前的状态。正序扫描会把同一物品重复使用，变成另一类问题。

这里要求物品重量为正、价值非负，初始 dp 全零对应允许不选任何物品。若题目要求“恰好装满”，未达到的状态应初始化成负无穷；不能直接照搬本实现。时间 O(nC) 是关于数值容量 C 的伪多项式界，容量很大时即使物品数不多也可能不可行。

## 手推检查

只有一个重量 2、价值 3 的物品，容量为 4。正序更新为何可能得到 6，正确 0/1 答案又是多少？

<details><summary>核对结果</summary>

更新 c=2 得到 3 后，c=4 又使用了同一轮 dp[2]，把物品算了两次。倒序处理时正确答案为 3。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：dp_greedy</summary>

```cpp
inline int activity_selection(std::vector<std::pair<i64, i64>> intervals) {
    std::sort(intervals.begin(), intervals.end(), [](auto a, auto b) {
        return a.second != b.second ? a.second < b.second : a.first < b.first;
    });
    i64 end = std::numeric_limits<i64>::lowest();
    int count = 0;
    for (auto [start, finish] : intervals)
        if (start >= end) {
            ++count;
            end = finish;
        }
    return count;
}
inline i64 knapsack01(int capacity, const std::vector<std::pair<int, i64>> &items) {
    std::vector<i64> dp(capacity + 1);
    for (auto [weight, value] : items)
        for (int c = capacity; c >= weight; --c)
            dp[c] = std::max(dp[c], dp[c - weight] + value);
    return dp[capacity];
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
    std::cout << activity_selection({{0, 3}, {1, 2}, {2, 4}, {4, 5}}) << '\n';
    std::cout << knapsack01(5, {{2, 3}, {3, 4}, {4, 10}}) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
3
10
```

</details>

本机运行：`python practice/judge.py demo d31`。

# 前缀和、树状数组与懒标记线段树

## 从静态前缀和开始

前缀和 prefix[r]-prefix[l] 可以 O(1) 查询 `[l,r)`，但一次点修改可能影响其后所有前缀。数据会变时，树状数组将前缀拆成若干低位长度块，支持点加和前缀查询 O(log n)。不应一上来就用最复杂的数据结构。

## 树状数组的 lowbit

内部使用 1 起点，lowbit(i)=i&-i。查询不断减 lowbit 走向更短前缀；更新不断加 lowbit，把变动传给包含该点的更大块。公开接口仍用零起点点下标与半开区间。index=0 时先转换成 1，避免内部更新在 i=0 处永远无法前进。

## 线段树保存区间信息

每个结点对应 `[l,r)`，左右孩子分界为 mid。查询覆盖整个结点时可直接使用保存的 sum；部分重叠才向下。点更新的树高为 O(log n)，建树 O(n)，数组实现通常预留约 4n 个槽。

区间加若逐叶修改会变慢。懒标记表示“整段已加、孩子尚未同步”的增量。给长度 len 的段加 delta 时，sum 增加 delta×len，lazy 增加 delta；向下访问前把累积标记作用到两个孩子，再清除父标记。父段和始终包含尚未下推的更新，不能等到查询时才把父 sum 补上。

本实现只有区间加与区间和。区间赋值、乘法、取最值需要不同的标记组合规则，不能只改一个运算符。long long 仍有范围，题面限定数值确保总和与长度乘积安全。

## 手推检查

初始 `[1,2,3,4]`，给 `[1,3)` 加 5 后，全段和与 `[1,3)` 的和分别是多少？`[2,2)` 的查询与更新应做什么？

<details><summary>核对结果</summary>

数组为 `[1,7,8,4]`，全段 20，子段 15。空区间查询为 0，更新不改变任何状态。这些都在本地测试中覆盖。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：ranges</summary>

```cpp
class Fenwick {
    std::vector<i64> bit_;

  public:
    explicit Fenwick(int n) : bit_(n + 1) {}
    void add(int index, i64 delta) {
        for (int i = index + 1; i < static_cast<int>(bit_.size()); i += i & -i)
            bit_[i] += delta;
    }
    i64 prefix(int end) const {
        i64 sum = 0;
        for (int i = end; i > 0; i -= i & -i)
            sum += bit_[i];
        return sum;
    }
    i64 sum(int left, int right) const {
        return prefix(right) - prefix(left);
    }
};
class RangeSum {
    int n_;
    std::vector<i64> sum_, lazy_;
    void build(int p, int l, int r, const std::vector<i64> &a) {
        if (r - l == 1) {
            sum_[p] = a[l];
            return;
        }
        int m = l + (r - l) / 2;
        build(p * 2, l, m, a);
        build(p * 2 + 1, m, r, a);
        sum_[p] = sum_[p * 2] + sum_[p * 2 + 1];
    }
    void apply(int p, int length, i64 value) {
        sum_[p] += value * length;
        lazy_[p] += value;
    }
    void push(int p, int l, int r) {
        int m = l + (r - l) / 2;
        if (lazy_[p] && r - l > 1) {
            apply(p * 2, m - l, lazy_[p]);
            apply(p * 2 + 1, r - m, lazy_[p]);
            lazy_[p] = 0;
        }
    }
    void add_at(int p, int l, int r, int ql, int qr, i64 value) {
        if (ql <= l && r <= qr) {
            apply(p, r - l, value);
            return;
        }
        push(p, l, r);
        int m = l + (r - l) / 2;
        if (ql < m)
            add_at(p * 2, l, m, ql, qr, value);
        if (qr > m)
            add_at(p * 2 + 1, m, r, ql, qr, value);
        sum_[p] = sum_[p * 2] + sum_[p * 2 + 1];
    }
    i64 sum_at(int p, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr)
            return sum_[p];
        push(p, l, r);
        int m = l + (r - l) / 2;
        i64 result = 0;
        if (ql < m)
            result += sum_at(p * 2, l, m, ql, qr);
        if (qr > m)
            result += sum_at(p * 2 + 1, m, r, ql, qr);
        return result;
    }

  public:
    explicit RangeSum(const std::vector<i64> &a)
        : n_(static_cast<int>(a.size())), sum_(4 * std::max(1, n_)), lazy_(sum_.size()) {
        if (n_)
            build(1, 0, n_, a);
    }
    void add(int l, int r, i64 value) {
        if (l < r)
            add_at(1, 0, n_, l, r, value);
    }
    i64 sum(int l, int r) {
        return l < r ? sum_at(1, 0, n_, l, r) : 0;
    }
};
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
    std::vector<i64> a = {1, 2, 3, 4};
    Fenwick f(4);
    for (int i = 0; i < 4; ++i)
        f.add(i, a[i]);
    std::cout << f.sum(1, 4) << '\n';
    f.add(2, -1);
    std::cout << f.sum(0, 4) << '\n';
    RangeSum t(a);
    t.add(1, 3, 5);
    std::cout << t.sum(0, 4) << ' ' << t.sum(1, 3) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
9
9
20 15
```

</details>

本机运行：`python practice/judge.py demo d32`。

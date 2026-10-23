# 排序、稳定性与逆序对

## 比较成本与附加约束

排序不只看 O(n log n)，还要问是否稳定、是否原地、输入是否接近有序。稳定是相同关键码的记录保持原相对次序，并不要求所有元素都不同。可用 `(key,原始编号)` 记录检查，但不能偷偷把编号加入比较器后宣称算法本身稳定。

| 算法 | 典型最坏时间 | 稳定性与本实现范围 |
|---|---|---|
| 插入排序 | O(n²) | 仅移动严格更大元素时稳定；近有序输入可较快 |
| 归并排序 | O(n log n) | 相等时先取左侧，可稳定；临时数组 O(n) |
| 三路快速排序 | O(n²) | 一般不稳定；重复值分成小于/等于/大于三段 |
| 堆排序 | O(n log n) | 通常不稳定；本指南复用额外堆，空间 O(n) |
| 基数排序 | O(d(n+B)) | 本实现按字节做 4 轮稳定分配，只接收 uint32_t |

经典原地堆排序可用 O(1) 附加空间，但本章复用最小堆的教学实现不具备这个空间界。希尔排序依赖增量序列，没有一个不加条件就适用的统一最坏公式；选择排序与冒泡排序适合手推，不作为大量输入的默认方案。

## 归并为什么可以同时计逆序对

两半已经有序。若左元素≤右元素，取左边不会产生新的跨区逆序；若右元素更小，那么尚未取出的所有左元素都大于它，一次增加 `mid-i`。相等不算逆序。最终计数最多 n(n-1)/2，需要 long long。

快速排序的实现递归处理较短分区，迭代继续较长分区，以限制调用栈；这只改进栈空间，不取消最坏 O(n²) 时间。整数基数排序也必须说明符号与位宽，本实现不能直接拿来排序负 long long。

## 手推检查

键值序列 `(2,A),(1,B),(2,C)` 稳定排序后编号顺序是什么？`[3,1,2]` 有几对逆序？

<details><summary>核对结果</summary>

编号为 B、A、C；逆序为 (3,1)、(3,2)，共 2 对。两个 2 的先后应保持不变。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：sorting</summary>

```cpp
using Record = std::pair<i64, int>;
inline void stable_merge_sort(std::vector<Record> &a) {
    std::vector<Record> temp(a.size());
    std::function<void(int, int)> sort = [&](int l, int r) {
        if (r - l <= 1)
            return;
        int m = l + (r - l) / 2;
        sort(l, m);
        sort(m, r);
        int i = l, j = m, k = l;
        while (i < m && j < r)
            temp[k++] = a[i].first <= a[j].first ? a[i++] : a[j++];
        while (i < m)
            temp[k++] = a[i++];
        while (j < r)
            temp[k++] = a[j++];
        for (int p = l; p < r; ++p)
            a[p] = temp[p];
    };
    sort(0, static_cast<int>(a.size()));
}
inline i64 inversion_count(std::vector<i64> a) {
    std::vector<i64> temp(a.size());
    std::function<i64(int, int)> count = [&](int l, int r) -> i64 {
        if (r - l <= 1)
            return 0;
        int m = l + (r - l) / 2;
        i64 answer = count(l, m) + count(m, r);
        int i = l, j = m, k = l;
        while (i < m && j < r) {
            if (a[i] <= a[j])
                temp[k++] = a[i++];
            else {
                temp[k++] = a[j++];
                answer += m - i;
            }
        }
        while (i < m)
            temp[k++] = a[i++];
        while (j < r)
            temp[k++] = a[j++];
        for (int p = l; p < r; ++p)
            a[p] = temp[p];
        return answer;
    };
    return count(0, static_cast<int>(a.size()));
}
inline void insertion_sort(std::vector<i64> &a) {
    for (std::size_t i = 1; i < a.size(); ++i) {
        i64 value = a[i];
        std::size_t j = i;
        while (j && a[j - 1] > value) {
            a[j] = a[j - 1];
            --j;
        }
        a[j] = value;
    }
}
inline void quick_sort(std::vector<i64> &a) {
    std::function<void(int, int)> sort = [&](int l, int r) {
        while (l < r) {
            i64 pivot = a[l + (r - l) / 2];
            int less = l, i = l, greater = r;
            while (i <= greater) {
                if (a[i] < pivot)
                    std::swap(a[less++], a[i++]);
                else if (a[i] > pivot)
                    std::swap(a[i], a[greater--]);
                else
                    ++i;
            }
            if (less - l < r - greater) {
                sort(l, less - 1);
                l = greater + 1;
            } else {
                sort(greater + 1, r);
                r = less - 1;
            }
        }
    };
    sort(0, static_cast<int>(a.size()) - 1);
}
inline void heap_sort(std::vector<i64> &a) {
    // 教学复用最小堆，使用 O(n) 额外空间；不是原地堆排序版本。
    MinHeap heap(a);
    for (auto &x : a)
        x = heap.pop();
}
inline void radix_sort(std::vector<std::uint32_t> &a) {
    std::vector<std::uint32_t> temp(a.size());
    for (int shift = 0; shift < 32; shift += 8) {
        std::array<std::size_t, 256> count{};
        for (auto x : a)
            ++count[(x >> shift) & 255];
        std::size_t sum = 0;
        for (auto &c : count) {
            std::size_t old = c;
            c = sum;
            sum += old;
        }
        for (auto x : a)
            temp[count[(x >> shift) & 255]++] = x;
        a.swap(temp);
    }
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
    std::vector<Record> a = {{2, 0}, {1, 1}, {2, 2}};
    stable_merge_sort(a);
    std::vector<int> ids;
    for (auto x : a)
        ids.push_back(x.second);
    print(ids);
    std::cout << inversion_count({3, 1, 2}) << '\n';
    std::vector<i64> b = {4, 2, 4, 1};
    quick_sort(b);
    print(b);
    std::vector<std::uint32_t> c = {3, 0, 2};
    radix_sort(c);
    print(c);
}
```

<details><summary>查看示例输出</summary>

```text
1 0 2
2
1 2 4 4
0 2 3
```

</details>

本机运行：`python practice/judge.py demo d30`。

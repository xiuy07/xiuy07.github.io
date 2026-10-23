# 二叉堆、优先队列与 Huffman

## 堆不是二叉搜索树

最小堆只要求父结点不大于孩子，兄弟之间不要求有序，中序也不保证有序。形状是完全二叉树，用数组便可隐式保存连接。push 在末尾写入，再沿父亲上浮；pop 用最后一个值替换根，再沿较小孩子下沉。取最小值 O(1)，插入和删除 O(log n)。

从任意数组建堆时，自最后一个非叶结点向前执行下沉。底层结点多但下沉距离短，总成本 O(n)，不是把 n 个结点都按最坏 O(log n) 相乘。向已经维护好的空堆逐个 push 则是另一种建法。

标准库 priority_queue 默认是最大堆，求最小值需要 greater 比较器。它是很好的工程工具；本章练习则要求手写上浮和下沉，观察数组下标，避免只会调用接口而不理解结构。

## Huffman 的合并成本

给每个叶子非负权重，每次取最小的两个合并，把合并值放回优先队列。所有合并权重之和等于最终树的加权路径长度：每合并一次，该子树中每个叶子的深度都加一。贪心正确性可通过交换论证说明：两个最轻叶子可被安排成最深层兄弟而不增加成本，再缩并为子问题。

本实现只计算最优代价，不生成具体的位串。相同权重可能产生不同但同样最优的编码树；要求唯一编码时还需要 tie-break 规则。单叶树按深度 0 计 WPL=0，这与某些实际编码格式强制使用一位的约定不同。

## 手推检查

权重 1、2、3、4 的每次合并是什么？堆数组 `[1,3,2]` 是否合法？

<details><summary>核对结果</summary>

合并代价依次 3、6、10，总和 19。该数组是合法最小堆，不需要把兄弟 3、2 排成升序。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：heap</summary>

```cpp
class MinHeap {
    std::vector<i64> a_;
    void down(std::size_t p) {
        while (2 * p + 1 < a_.size()) {
            std::size_t c = 2 * p + 1;
            if (c + 1 < a_.size() && a_[c + 1] < a_[c])
                ++c;
            if (a_[p] <= a_[c])
                break;
            std::swap(a_[p], a_[c]);
            p = c;
        }
    }

  public:
    MinHeap() = default;
    explicit MinHeap(std::vector<i64> a) : a_(std::move(a)) {
        for (std::size_t i = a_.size() / 2; i > 0; --i)
            down(i - 1);
    }
    std::size_t size() const {
        return a_.size();
    }
    void push(i64 x) {
        a_.push_back(x);
        std::size_t p = a_.size() - 1;
        while (p && a_[p] < a_[(p - 1) / 2]) {
            std::swap(a_[p], a_[(p - 1) / 2]);
            p = (p - 1) / 2;
        }
    }
    i64 top() const {
        if (a_.empty())
            throw std::out_of_range("empty");
        return a_[0];
    }
    i64 pop() {
        i64 out = top();
        a_[0] = a_.back();
        a_.pop_back();
        if (!a_.empty())
            down(0);
        return out;
    }
};
inline i64 huffman_cost(const std::vector<i64> &weights) {
    MinHeap heap(weights);
    i64 answer = 0;
    while (heap.size() > 1) {
        i64 a = heap.pop(), b = heap.pop();
        answer += a + b;
        heap.push(a + b);
    }
    return answer;
    // 单个叶子的树深度定义为 0。
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
    MinHeap h({7, 2, 5});
    h.push(1);
    std::vector<i64> a;
    while (h.size())
        a.push_back(h.pop());
    print(a);
    std::cout << huffman_cost({1, 2, 3, 4}) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
1 2 5 7
19
```

</details>

本机运行：`python practice/judge.py demo d23`。

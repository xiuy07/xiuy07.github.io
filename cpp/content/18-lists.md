# 顺序表、链表与约瑟夫环

## 同一种线性关系，不同的存储

顺序表把逻辑相邻元素放在连续存储中，下标访问 O(1)，在中间插入或删除需要搬移后继，最坏 O(n)。单链表用 next 保存关系；已知前驱时插删连接 O(1)，但找第 k 个位置仍要走 O(k)。因此“链表插入 O(1)”必须带上已知位置/前驱的条件。

动态顺序表维护 size≤capacity。扩容时先取得新存储、复制旧元素，再替换指针。插入从右往左搬移，避免覆盖尚未搬走的值；删除从左往右填补空位。下面实现专门存 long long，不要求你现在实现通用 allocator，且不提供拷贝语义。

## 链表删除的责任

单链表删除结点通常要修改它的前驱 next。把后继内容复制到当前结点的技巧不适用于尾结点，也会改变结点身份，不能作为所有场景的通用删除。双向链表则要同步维护前后两条边；空表、首尾结点可以用哨兵统一处理。原指南第 05 章已有反转与释放练习，这里进一步组合成循环结构。

## 约瑟夫环

让 1..n 按环连接，从 1 开始报数，每次数到 k 的人离开，下一人重新从 1 报数。保留“待删结点的前驱”tail；向前走 `(k-1)%remain` 步，再删除 tail->next。取模避免 k 很大时空转，但这个朴素链表算法最坏仍 O(n²)，适合本章限定规模。最后一个结点删除后不要再解引用 tail。

## 手推检查

把 `[10,30]` 在位置 1 插入 20，列出搬移顺序；再画出 n=5、k=2 的每次删除连接。

<details><summary>核对结果</summary>

先把原位置 1 的 30 搬到位置 2，再把 20 写入位置 1。出圈顺序为 2、4、1、5、3。只求最后生存者可以用递推 O(n)，但它不直接输出完整出圈序列。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：list</summary>

```cpp
class LinearList {
    std::unique_ptr<i64[]> data_;
    std::size_t size_ = 0, capacity_ = 0;
    void grow() {
        std::size_t next = capacity_ ? capacity_ * 2 : 1;
        auto fresh = std::make_unique<i64[]>(next);
        for (std::size_t i = 0; i < size_; ++i)
            fresh[i] = data_[i];
        data_ = std::move(fresh);
        capacity_ = next;
    }

  public:
    std::size_t size() const {
        return size_;
    }
    void insert(std::size_t pos, i64 value) {
        if (pos > size_)
            throw std::out_of_range("position");
        if (size_ == capacity_)
            grow();
        for (std::size_t i = size_; i > pos; --i)
            data_[i] = data_[i - 1];
        data_[pos] = value;
        ++size_;
    }
    i64 erase(std::size_t pos) {
        if (pos >= size_)
            throw std::out_of_range("position");
        i64 old = data_[pos];
        for (std::size_t i = pos + 1; i < size_; ++i)
            data_[i - 1] = data_[i];
        --size_;
        return old;
    }
    i64 at(std::size_t pos) const {
        if (pos >= size_)
            throw std::out_of_range("position");
        return data_[pos];
    }
};
inline std::vector<int> josephus(int n, i64 k) {
    struct Node {
        int value;
        Node *next;
    };
    std::vector<int> order;
    if (!n)
        return order;
    Node *tail = new Node{1, nullptr};
    Node *head = tail;
    for (int value = 2; value <= n; ++value) {
        tail->next = new Node{value, nullptr};
        tail = tail->next;
    }
    tail->next = head;
    for (int remain = n; remain > 0; --remain) {
        for (i64 steps = (k - 1) % remain; steps > 0; --steps)
            tail = tail->next;
        Node *removed = tail->next;
        order.push_back(removed->value);
        if (remain > 1)
            tail->next = removed->next;
        delete removed;
    }
    return order;
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
    LinearList a;
    a.insert(0, 10);
    a.insert(1, 30);
    a.insert(1, 20);
    std::cout << a.erase(0) << ' ' << a.size() << ' ' << a.at(0) << '\n';
    print(josephus(5, 2));
}
```

<details><summary>查看示例输出</summary>

```text
10 2 20
2 4 1 5 3
```

</details>

本机运行：`python practice/judge.py demo d18`。

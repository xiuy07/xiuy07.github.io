# 并查集与动态连通性

## parent 数组表示一片森林

每个集合由一棵树表示，根满足 parent[root]=root。find 返回代表元；两个元素同组，当且仅当代表元相同。unite 必须连接两个根，直接把任意 a 的 parent 改成 b 可能破坏整组关系，甚至产生环。

按大小合并，把较小的根接到较大的根上，根的 size 保存集合元素数。路径压缩则让查找路径上的结点靠近根；下面用路径减半，每次把当前结点接到祖父。两者组合后，一串操作的摊还复杂度接近常数，通常记为 O(α(n))，不应把每一次操作都宣称成严格 O(1)。

## 它擅长什么，不保存什么

动态加边的无向连通性、等价关系合并和 Kruskal 判环都适合并查集。它不保存具体路径，也不能直接回答最短距离；普通并查集也不支持随意删边后的动态连通性。需要撤销时有专门的 rollback 设计，通常还要调整路径压缩策略。

unite 返回是否真正合并。已同组的操作不能再次减少连通分量数量，也不能重复累加 size。孤立点从初始化开始就是一个独立分量。图结点的外部编号如果很大但出现数量小，可以先离散化，再建立紧凑数组。

## 手推检查

5 个点，合并 0-1、1-2、0-2、3-4，最后有几个分量？第三次合并是否成功？画出路径减半前后的 parent，说明集合成员有没有变化。

<details><summary>核对结果</summary>

最后两个分量，分别 {0,1,2} 与 {3,4}；第三次返回 false。压缩只改变内部表示，集合关系不变。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：dsu</summary>

```cpp
class DSU {
    std::vector<int> parent_, size_;
    int count_;

  public:
    explicit DSU(int n) : parent_(n), size_(n, 1), count_(n) {
        std::iota(parent_.begin(), parent_.end(), 0);
    }
    int find(int x) {
        while (parent_[x] != x) {
            parent_[x] = parent_[parent_[x]];
            x = parent_[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b)
            return false;
        if (size_[a] < size_[b])
            std::swap(a, b);
        parent_[b] = a;
        size_[a] += size_[b];
        --count_;
        return true;
    }
    int size(int x) {
        return size_[find(x)];
    }
    int components() const {
        return count_;
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
    DSU d(5);
    d.unite(0, 1);
    d.unite(1, 2);
    d.unite(3, 4);
    std::cout << d.components() << ' ' << d.size(0) << ' ' << (d.find(0) == d.find(4)) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
2 3 0
```

</details>

本机运行：`python practice/judge.py demo d25`。

# 图的表示、BFS 与 DFS

## 表示方式决定实际成本

邻接矩阵占 O(V²) 空间，可常数时间检查一条边，适合较稠密图或 Floyd；邻接表占 O(V+E)，适合遍历稀疏图。无向边 u-v 需要存两个方向，有向边只存一个方向。重边、自环、孤立点是否允许，都应在输入契约中写明。

邻接表遍历时，每条存储边只访问常数次，所以复杂度 O(V+E)。若用矩阵为每个结点扫描整行，就成为 O(V²)。不要把算法名称与某一个固定复杂度绑定，而忽略表示方式。

## BFS 按距离层推进

无权图中每条边代价相同，队列保证先处理距离较小的结点。把结点放入队列时就标记并设置距离，防止同一个结点被多个前驱重复入队。源点距离 0，未访问点 -1。第一次发现 v 时，当前路径就有最少边数；这项结论不适用于一般带权图。

## DFS 与连通分量

DFS 用调用栈或显式栈深入一条分支。长链图可用显式栈避免调用栈溢出。无向图中从每个尚未访问的点启动一次 DFS，启动次数就是分量数。有向图的可达关系不等于无向连通，也不等于强连通分量；不要直接复用这个计数函数宣称得到 SCC。

遍历顺序会受邻接表顺序影响；本章练习主要核对距离和分量数量。若要求唯一 DFS/BFS 顺序，需要额外排序邻接边并规定起点与扫描规则。

## 手推检查

图有边 0-1、0-2、1-3，源点 0 的各距离是什么？再加一个孤立点 4，分量数如何变化？

<details><summary>核对结果</summary>

距离为 0、1、1、2；孤立点距离 -1，分量数由 1 变为 2。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：graph</summary>

```cpp
using Graph = std::vector<std::vector<int>>;
inline std::vector<int> bfs_distances(const Graph &g, int source) {
    std::vector<int> d(g.size(), -1);
    std::queue<int> q;
    d[source] = 0;
    q.push(source);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u])
            if (d[v] < 0) {
                d[v] = d[u] + 1;
                q.push(v);
            }
    }
    return d;
}
inline int connected_components(const Graph &g) {
    std::vector<bool> seen(g.size());
    int count = 0;
    for (int s = 0; s < static_cast<int>(g.size()); ++s)
        if (!seen[s]) {
            ++count;
            std::vector<int> st{s};
            seen[s] = true;
            while (!st.empty()) {
                int u = st.back();
                st.pop_back();
                for (int v : g[u])
                    if (!seen[v]) {
                        seen[v] = true;
                        st.push_back(v);
                    }
            }
        }
    return count;
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
    Graph g = {{1, 2}, {0, 3}, {0}, {1}};
    print(bfs_distances(g, 0));
    std::cout << connected_components(g) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
0 1 1 2
1
```

</details>

本机运行：`python practice/judge.py demo d26`。

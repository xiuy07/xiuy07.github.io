# 最小生成树：Prim 与 Kruskal

## 生成树与最短路回答不同问题

连通无向图的生成树包含所有 V 个点、V-1 条边且无环。最小生成树最小化这 V-1 条边的总权，不保证任意两点之间的树路径也是原图最短路径。带负权并不妨碍 MST，重边也可参与比较；自环不会连接不同点。

割性质解释两个贪心算法：把点集分成两侧，连接两侧的一条最轻边可以作为某棵最小生成树的安全选择。存在相同权时树形可能不唯一，但最优总权仍相同；因此练习只比较总权。

## Prim 逐步长大一个连通部分

先任选一个起点，每次选择从已选集合通向外部的最小边。堆中存边权与目标点，而不是“源点到目标的累计距离”；这是它与 Dijkstra 的一个关键差别。弹到已经选过的点就跳过，防止重复计权。

堆版本使用邻接表，复杂度 O(E log E) 可作直接上界；稠密图可用 O(V²) 的矩阵版本。结束后若选中点数不足 V，原图不连通，不能把局部生成树总权当成完整答案。

## Kruskal 按全局边权排序

依次扫描从小到大的边，仅当两端属于不同并查集时才选它，并合并两个分量。选到 V-1 条即完成。排序成本 O(E log E)，并查集维护接近线性。图不连通时无法选满，需要返回无解；如果题目问最小生成森林，则应采用另一份输出契约。

## 手推检查

三角形边权 0-1 为 3、1-2 为 2、0-2 为 8，MST 总权是多少？若把 8 改为 -1，两个算法还适用吗？

<details><summary>核对结果</summary>

原总权 5。改为 -1 后总权 1，Prim 与 Kruskal 都可处理；不能把 Dijkstra 的非负条件搬到 MST 上。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：mst</summary>

```cpp
inline std::optional<i64> kruskal(int n, std::vector<Edge> edges) {
    if (n <= 1)
        return 0;
    std::sort(edges.begin(), edges.end(),
              [](const Edge &a, const Edge &b) { return a.weight < b.weight; });
    DSU dsu(n);
    i64 total = 0;
    int used = 0;
    for (const auto &e : edges)
        if (dsu.unite(e.from, e.to)) {
            total += e.weight;
            if (++used == n - 1)
                return total;
        }
    return std::nullopt;
}
inline std::optional<i64> prim(const WeightedGraph &g) {
    if (g.empty())
        return 0;
    std::vector<bool> used(g.size());
    using State = std::pair<i64, int>;
    std::priority_queue<State, std::vector<State>, std::greater<State>> q;
    q.push({0, 0});
    i64 total = 0;
    std::size_t count = 0;
    while (!q.empty()) {
        auto [w, u] = q.top();
        q.pop();
        if (used[u])
            continue;
        used[u] = true;
        ++count;
        total += w;
        for (auto [v, cost] : g[u])
            if (!used[v])
                q.push({cost, v});
    }
    return count == g.size() ? std::optional<i64>(total) : std::nullopt;
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
    std::vector<Edge> e = {{0, 1, 3}, {1, 2, 2}, {0, 2, 8}};
    WeightedGraph g(3);
    for (auto x : e) {
        g[x.from].push_back({x.to, x.weight});
        g[x.to].push_back({x.from, x.weight});
    }
    std::cout << *prim(g) << ' ' << *kruskal(3, e) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
5 5
```

</details>

本机运行：`python practice/judge.py demo d29`。

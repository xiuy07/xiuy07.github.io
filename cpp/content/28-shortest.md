# 最短路：Dijkstra、Bellman–Ford 与 Floyd

## 松弛是一条共同规则

若到 u 已有有限距离，边 u→v 的代价为 w，则可尝试把 d[v] 改成更小的 d[u]+w。初始化源点 0、其他 INF。INF 只是哨兵，不应直接参与加法；本实现选 long long 并根据题目范围保证有限距离和加法不溢出。

## Dijkstra 的前提是非负边权

每次取当前距离最小的未确定状态，非负性保证未来绕路不能使它再变得更小。用堆时可以直接压入新距离，旧状态仍在堆中，弹出后若与 d[u] 不同就跳过。邻接表版本通常为 O((V+E)log V)，稠密图也可用 O(V²) 的数组选择版本。

负边会破坏这个确定性的论证，不能因为某个负边样例碰巧跑对，就把 Dijkstra 当成通用算法。下面接口检查扫描到的负边，练习输入保证所有边非负。

## Bellman–Ford 处理负边

不含可达负环时，最短简单路径最多 V-1 条边。反复扫描全部边进行松弛，最多 V-1 轮，若某轮没有变化可提前停止。再扫描一轮仍能改善，就有从源点可达的负环。本章遇到这种情况统一报告 NEGATIVE CYCLE，不输出受影响点的有限距离。

位于另一个不可达分支的负环不应触发单源负环报告。由于实现原地更新，同一轮可能利用刚刚改善的结果，不能把“第 k 轮输出”机械地解释为恰好只用 k 条边；V-1 轮的正确性与最后检测仍成立。

## Floyd 把允许的中间点逐步扩大

状态 d[i][j] 表示仅允许已经处理过的中间点时的最短距离，k 必须放在最外层。复杂度 O(V³)、空间 O(V²)，适合小规模多源查询。初始化平行边取最小权，自身距离 0。若结束后 d[k][k]<0，则存在负环；相关点对的最短路可能没有有限值，不能把矩阵里的暂存值当最终有限答案。

## 手推检查

为什么 BFS 不能直接用于权值 1 和 10 混合的图？不可达结点输出 -1 时，是否代表它存在一条权为 -1 的路径？

<details><summary>核对思路</summary>

BFS 最小化边数而非总权。本章 demo 的非负权演示将不可达输出为 -1；练习 p55、p56 统一使用 INF 文本，避免与合法负距离混淆。标记含义由输出契约决定。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：shortest</summary>

```cpp
using WeightedGraph = std::vector<std::vector<std::pair<int, i64>>>;
inline std::vector<i64> dijkstra(const WeightedGraph &g, int source) {
    std::vector<i64> d(g.size(), INF);
    d[source] = 0;
    using State = std::pair<i64, int>;
    std::priority_queue<State, std::vector<State>, std::greater<State>> q;
    q.push({0, source});
    while (!q.empty()) {
        auto [distance, u] = q.top();
        q.pop();
        if (distance != d[u])
            continue;
        for (auto [v, w] : g[u]) {
            if (w < 0)
                throw std::invalid_argument("Dijkstra requires nonnegative edges");
            if (distance + w < d[v]) {
                d[v] = distance + w;
                q.push({d[v], v});
            }
        }
    }
    return d;
}
struct BellmanResult {
    bool negative_cycle;
    std::vector<i64> distance;
};
inline BellmanResult bellman_ford(int n, const std::vector<Edge> &edges, int source) {
    std::vector<i64> d(n, INF);
    d[source] = 0;
    for (int pass = 1; pass < n; ++pass) {
        bool changed = false;
        for (const auto &e : edges)
            if (d[e.from] != INF && d[e.from] + e.weight < d[e.to]) {
                d[e.to] = d[e.from] + e.weight;
                changed = true;
            }
        if (!changed)
            break;
    }
    for (const auto &e : edges)
        if (d[e.from] != INF && d[e.from] + e.weight < d[e.to])
            return {true, d};
    return {false, d};
}
inline std::vector<std::vector<i64>> floyd(int n, const std::vector<Edge> &edges) {
    std::vector<std::vector<i64>> d(n, std::vector<i64>(n, INF));
    for (int i = 0; i < n; ++i)
        d[i][i] = 0;
    for (const auto &e : edges)
        d[e.from][e.to] = std::min(d[e.from][e.to], e.weight);
    for (int k = 0; k < n; ++k)
        for (int i = 0; i < n; ++i)
            if (d[i][k] != INF)
                for (int j = 0; j < n; ++j)
                    if (d[k][j] != INF)
                        d[i][j] = std::min(d[i][j], d[i][k] + d[k][j]);
    return d;
    // 若 d[i][i]<0，存在负环；有限最短路查询须先排除相关负环。
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
    std::vector<Edge> e = {{0, 1, 2}, {1, 2, 1}, {0, 2, 8}};
    WeightedGraph g(4);
    for (auto x : e)
        g[x.from].push_back({x.to, x.weight});
    auto d = dijkstra(g, 0);
    for (auto &x : d)
        if (x == INF)
            x = -1;
    print(d);
    std::cout << floyd(4, e)[0][2] << '\n';
    e[1].weight = -1;
    std::cout << bellman_ford(4, e, 0).distance[2] << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
0 2 3 -1
3
1
```

</details>

本机运行：`python practice/judge.py demo d28`。

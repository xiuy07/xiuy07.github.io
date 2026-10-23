# 拓扑排序、AOE 与关键路径

## Kahn 算法维护入度

有向无环图的拓扑序要求每条边 u→v 中 u 都在 v 前。先把入度零的点放入待处理结构，取出一个后删除它的出边，将新变成零入度的点加入。最终处理点数不足 V，说明存在有向环，不存在拓扑序。

普通队列实现为 O(V+E)。下面为了使输出唯一，使用最小堆，每次选最小编号的可选点，复杂度增加为 O((V+E)log V)。多个入度零点通常意味着有多个可能的合法拓扑顺序，但“无环”本身不保证唯一序。

## 事件与活动不要混淆

AOE 网络以结点表示事件，以带权边表示活动。earliest[v] 是事件最早发生时刻，按拓扑方向对每条 u→v 更新 `max(earliest[v],earliest[u]+w)`。总工期为各终点最早时刻的最大值；多源多汇可想象添加零权超级源汇。

latest 从统一总工期开始，按逆拓扑方向取 `min(latest[u],latest[v]-w)`。边 u→v 的最早开始为 earliest[u]，最迟开始为 latest[v]-w，两者相等才是关键活动。关键活动可能有多条支路，不能只取某一次最长路恢复出来的那条路径。

本实现允许多个不连通的 DAG 分支，并使用统一项目终止时刻。较短分支可以有浮动时间；它的边不一定是整个项目的关键活动。若有环则练习输出 CYCLE，不强行给一个“工期”。

## 手推检查

活动 0→2 长 3、1→2 长 5、2→3 长 2。总工期是多少，哪些活动关键？

<details><summary>核对结果</summary>

事件 2 最早为 5，事件 3 最早为 7。后两条活动关键；第一条可以延迟 2 个单位，不延误项目结束。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：dag</summary>

```cpp
inline std::vector<int> topological_order(const Graph &g) {
    std::vector<int> indegree(g.size()), order;
    for (const auto &row : g)
        for (int v : row)
            ++indegree[v];
    std::priority_queue<int, std::vector<int>, std::greater<int>> ready;
    for (int i = 0; i < static_cast<int>(g.size()); ++i)
        if (!indegree[i])
            ready.push(i);
    while (!ready.empty()) {
        int u = ready.top();
        ready.pop();
        order.push_back(u);
        for (int v : g[u])
            if (--indegree[v] == 0)
                ready.push(v);
    }
    if (order.size() != g.size())
        return {};
    return order;
}
struct Edge {
    int from, to;
    i64 weight;
};
struct CriticalPath {
    bool dag;
    i64 duration;
    std::vector<int> edges;
};
inline CriticalPath critical_path(int n, const std::vector<Edge> &edges) {
    Graph g(n);
    std::vector<std::vector<int>> out(n);
    for (int i = 0; i < static_cast<int>(edges.size()); ++i) {
        g[edges[i].from].push_back(edges[i].to);
        out[edges[i].from].push_back(i);
    }
    auto order = topological_order(g);
    if (static_cast<int>(order.size()) != n)
        return {false, 0, {}};
    std::vector<i64> earliest(n), latest(n);
    for (int u : order)
        for (int id : out[u]) {
            const auto &e = edges[id];
            earliest[e.to] = std::max(earliest[e.to], earliest[u] + e.weight);
        }
    i64 duration = n ? *std::max_element(earliest.begin(), earliest.end()) : 0;
    std::fill(latest.begin(), latest.end(), duration);
    for (auto it = order.rbegin(); it != order.rend(); ++it)
        for (int id : out[*it]) {
            const auto &e = edges[id];
            latest[e.from] = std::min(latest[e.from], latest[e.to] - e.weight);
        }
    std::vector<int> critical;
    for (int i = 0; i < static_cast<int>(edges.size()); ++i)
        if (earliest[edges[i].from] == latest[edges[i].to] - edges[i].weight)
            critical.push_back(i + 1);
    return {true, duration, critical};
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
    Graph g = {{2}, {2}, {3}, {}};
    print(topological_order(g));
    auto x = critical_path(4, {{0, 2, 3}, {1, 2, 5}, {2, 3, 2}});
    std::cout << x.duration << '\n';
    print(x.edges);
}
```

<details><summary>查看示例输出</summary>

```text
0 1 2 3
7
2 3
```

</details>

本机运行：`python practice/judge.py demo d27`。

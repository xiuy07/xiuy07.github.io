# 图论进阶：0–1 BFS、二分图与 SCC

## 读题与方法选择

无权最短路用 BFS；0/1 边权用双端队列；一般非负权用 Dijkstra；负权再考虑 Bellman–Ford 等。算法选择来自前置条件，而不是题目看起来像迷宫就统一 BFS。

无向连通表示忽略路径方向后能走到；强连通要求有向路径双向存在。1→2→3 是一个弱连通块，却有三个 SCC。并查集不能直接求有向图强连通分量。

## 状态与不变式

二分图相邻两点颜色必须不同，不连通图从每个未染色点启动。SCC 的 Kosaraju 需要 DFS 退出顺序，再在反图中按逆退出序遍历。显式栈要记每个结点下一条待访问边，否则得到的只是发现顺序。

## 手推一遍

三角形 1–2–3–1 从 1 染 0，2、3 都染 1，检查 2–3 发现同色冲突；即使另一个连通块是一条正常链，也不能让整体通过。

0–1 BFS 中 0 代价边放队首，1 代价边放队尾。距离允许被更短路线改善，不能沿用无权 BFS“第一次入队即最优”的标记方式。

## 从实现到证明

以 [p91 无向图二分染色](#problem/p91) 为例：

对每个未染色连通块做 BFS，相邻结点染相反颜色。若发现同色邻接则拒绝。

正确性：每条边要求颜色异或为 1，BFS 传播所有必要约束；出现冲突说明沿两种路径得出矛盾。没有冲突时最终颜色直接给出合法划分。

复杂度：O(n+m) 时间、O(n+m) 空间。

易错点：只从 1 号出发会漏掉其他分量；自环必然不可行；重复边不影响结论。

<details><summary>完整 C++17 参考实现</summary>

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    while (m--) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> c(n + 1, -1);
    bool ok = true;
    for (int s = 1; s <= n; ++s)
        if (c[s] < 0) {
            queue<int> q;
            q.push(s);
            c[s] = 0;
            while (!q.empty()) {
                int u = q.front();
                q.pop();
                for (int v : g[u]) {
                    if (c[v] < 0) {
                        c[v] = c[u] ^ 1;
                        q.push(v);
                    } else if (c[v] == c[u])
                        ok = false;
                }
            }
        }
    cout << (ok ? "YES" : "NO") << '\n';
}
```

</details>

## 升学与面试追问

把 SCC 缩成 DAG 后可以做什么？能按拓扑序进行分量间 DP、统计依赖或计算最少增加连接。先证明缩点图无环：若多个分量仍构成有向环，它们本来就应属于同一 SCC。

回答时按“前置条件 → 状态含义 → 转移或维护规则 → 为什么不漏不重 → 时间空间 → 边界反例”展开，不需要背诵固定话术。面试中也要解释标准库容器的代价，而不是只说调用了某个函数。

## 手动练习与验收

1. 不看代码，给本章样例写出每一轮的关键状态。
2. 用最直观的暴力解先验证 5–10 个小输入，再与目标解交叉检查。
3. 构造最小规模、重复值、极端数值及边界条件；不适用的条件说明原因。
4. 限时独立完成下方练习。做错后记录“错误假设、反例、修复理由”，隔 2 天和 7 天再写。

## 可运行代码演示

`d42.cpp` 内嵌本章题目的自编样例，不需要额外 stdin。先预测结果，再运行 `python practice/judge.py demo d42`。想测试自己的输入，请在 OJ 编辑 p91，或直接编译对应参考程序。

<details><summary>查看演示输出</summary>

```text
NO
```

</details>

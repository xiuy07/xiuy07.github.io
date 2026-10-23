# 数据结构与算法实现索引

所有实现位于 `dsa.hpp` 的 `study` 命名空间，基线 C++17。

```cpp
#include "algorithms/dsa.hpp"
int main() {
    study::DSU groups(5);
    groups.unite(0, 1);
    return groups.size(0) == 2 ? 0 : 1;
}
```

从项目根目录编译：`g++ -std=c++17 -O2 main.cpp -o main`。

| 章节 | 接口 | 主要成本与约定 |
|---|---|---|
| 17 | `lower_bound_index`、`max_subarray` | 非降序二分 O(log n)；允许空段最大和 O(n) |
| 18 | `LinearList`、`josephus` | 倍增数组；访问 O(1)，移动 O(n)；循环链表约瑟夫最坏 O(n²) |
| 19 | `valid_brackets`、`CircularQueue` | 括号 O(n)；固定正容量队列，单次 O(1) |
| 20 | `prefix_function`、`kmp_matches`、`Trie` | KMP 重叠与空模式；Trie 仅 a..z、计重复次数 |
| 21 | `TreeNode`、`traverse_tree`、`rebuild_tree` | 合法树、互异键合法序列，显式栈 O(n) |
| 22 | `BST`、`AVL`、`BTree` | BST 可退化；AVL 插入删除 O(log n)；B 树插入查找 |
| 23 | `MinHeap`、`huffman_cost` | 建堆 O(n)，修改 O(log n)；Huffman 非负权 |
| 24 | `ProbeSet` | 固定正容量、线性探测、墓碑；最坏单次 O(容量) |
| 25 | `DSU` | 路径压缩、按大小合并，均摊 O(α(n)) |
| 26 | `Graph`、`bfs_distances`、`connected_components` | 邻接表 O(V+E)，分量计数用于无向图 |
| 27 | `topological_order`、`critical_path` | 最小堆拓扑 O((V+E)log V)；AOE 非负活动 |
| 28 | `dijkstra`、`bellman_ford`、`floyd` | O((V+E)log(V+E))、O(VE)、O(V³) |
| 29 | `prim`、`kruskal` | 无向图，可负权；不连通 nullopt，单点 0 |
| 30 | `stable_merge_sort`、`inversion_count`、`insertion_sort`、`quick_sort`、`heap_sort`、`radix_sort` | 归并稳定；快排最坏 O(n²)；本版堆排另用 O(n) 空间；基数仅 uint32_t |
| 31 | `activity_selection`、`knapsack01` | 半开时间段；正重量非负价值背包 O(nC) |
| 32 | `Fenwick`、`RangeSum` | 点加/区间和、区间加/区间和，单次 O(log n) |

## 前置条件与范围

- 数组、图结点从 0 开始；所有区间是 `[l,r)`，`Fenwick.prefix(end)` 为 `[0,end)`。
- 结点编号、数组下标、区间与树结构必须合法。教学实现不为每个非法输入做防御检查。
- 顺序表非法位置、空队列/空堆访问抛 `out_of_range`；队列与哈希表容量必须正数。
- BST、AVL 的下标结点池不回收删除槽，空间按历史创建数量计算。顺序表用 `unique_ptr` 管理数组，不支持隐式复制。
- B 树的 `t` 是最小度数，非根有 `t−1..2t−1` 个键，和课程 `m` 阶符号不同；这里只实现插入、查找。B 树删除、B+ 树和红黑树作为延伸，未实现。
- Dijkstra 所有边必须非负。Bellman–Ford 只报告可达负环。Floyd 不报告负环影响范围，有相关负环时不能把结果当作正常最短路。
- `i64` 是 `long long`，`INF` 为最大值四分之一。真实路径应远小于该哨兵；练习约束满足，复用前请重算累计上界。
- 公开测试检查结果，复杂度与指定实现仍要手推和审查。教学堆排序不是原地堆排序；基数排序不接受负 long long。

## 练习与回归

`practice/solutions/p33/` 至 `p64/` 留给你独立实现。接口参考头文件引入本库；网页章节同时展示对应完整代码。

```text
python practice/judge.py list --track dsa
python practice/judge.py p43
python practice/judge.py all --track dsa --reference
python practice/judge.py demo all --track dsa
g++ -std=c++17 -O2 -Wall -Wextra -Werror tests/test_algorithms.cpp -o algorithm-check
```

运行生成的 `algorithm-check`（Windows 为 `algorithm-check.exe`）。固定种子将树与 `std::set`、排序与标准排序、区间与朴素数组、最短路与 Floyd、Prim 与 Kruskal 交叉核对。

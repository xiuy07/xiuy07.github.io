# 二叉树、遍历与重建

## 先分清结构和存储

树中除根外，每个结点恰有一个父结点；二叉树每个结点最多有两个有区分的孩子。满二叉树、完全二叉树与二叉搜索树描述不同性质。完全二叉树适合数组表示：零起点下左右孩子为 2i+1、2i+2，父亲为 (i-1)/2；一开始就要确定下标约定。

一般二叉树可用左右孩子指针，或用数组下标表示连接。下面使用 -1 表示空孩子，根下标显式传入。孩子不是“必须紧挨着父亲存储”，算法只依赖连接关系。一般树还可用孩子列表或左孩子右兄弟表示，后者把多叉关系转换成二叉连接，不代表原树每个结点只有两个孩子。

## 三种遍历只改变访问时机

前序在处理左子树前访问根，中序在左右子树之间访问根，后序在两棵子树结束后访问根。递归代码短，但极度偏斜的长树可能耗尽调用栈。本实现用 `(结点,阶段)` 保存“回到哪里继续”，阶段 0/1/2 对应三种访问时刻；时间 O(n)，显式栈最坏 O(h)。

层序遍历则使用队列，按从根出发的层数访问。不要把 DFS 的任意访问顺序误当成层序。原始数据必须是一棵合法树；若可能有环或共享孩子，就要先验证结构，不能直接套树递归。

## 前序与中序重建

键互异时，前序首项确定根，中序把其左右子树分开，因此能唯一重建。只有前序与后序通常不能唯一确定左右孩子。下面用迭代栈重建，避免反复线性查找导致 O(n²)，也不依赖长递归；前提是两份序列合法且键互异。

## 手推检查

前序 2、1、3，中序 1、2、3 的后序是什么？只有前序 1、2，能确定 2 是左孩子还是右孩子吗？

<details><summary>核对结果</summary>

后序为 1、3、2。只有前序无法区分两种单孩子方向，不能唯一确定。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：tree</summary>

```cpp
struct TreeNode {
    i64 value;
    int left = -1, right = -1;
};
struct Traversals {
    std::vector<i64> preorder, inorder, postorder;
};
inline Traversals traverse_tree(const std::vector<TreeNode> &nodes, int root) {
    Traversals out;
    if (root < 0)
        return out;
    std::vector<std::pair<int, int>> st{{root, 0}};
    while (!st.empty()) {
        auto [u, state] = st.back();
        st.pop_back();
        if (state == 0) {
            out.preorder.push_back(nodes[u].value);
            st.push_back({u, 1});
            if (nodes[u].left >= 0)
                st.push_back({nodes[u].left, 0});
        } else if (state == 1) {
            out.inorder.push_back(nodes[u].value);
            st.push_back({u, 2});
            if (nodes[u].right >= 0)
                st.push_back({nodes[u].right, 0});
        } else
            out.postorder.push_back(nodes[u].value);
    }
    return out;
}
inline std::vector<TreeNode> rebuild_tree(const std::vector<i64> &pre,
                                          const std::vector<i64> &in) {
    std::vector<TreeNode> nodes;
    if (pre.empty())
        return nodes;
    for (i64 x : pre)
        nodes.push_back({x, -1, -1});
    std::vector<int> st{0};
    int j = 0;
    for (int i = 1; i < static_cast<int>(pre.size()); ++i) {
        int parent = st.back();
        if (nodes[parent].value != in[j])
            nodes[parent].left = i;
        else {
            while (!st.empty() && nodes[st.back()].value == in[j]) {
                parent = st.back();
                st.pop_back();
                ++j;
            }
            nodes[parent].right = i;
        }
        st.push_back(i);
    }
    return nodes;
    // 前提：互异键的合法前序、中序序列。
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
    auto t = rebuild_tree({2, 1, 3}, {1, 2, 3});
    auto x = traverse_tree(t, 0);
    print(x.preorder);
    print(x.inorder);
    print(x.postorder);
}
```

<details><summary>查看示例输出</summary>

```text
2 1 3
1 2 3
1 3 2
```

</details>

本机运行：`python practice/judge.py demo d21`。

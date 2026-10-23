# BST、AVL 与 B 树

## BST 的不变式

每个结点的左子树键都小于它，右子树键都大于它，本实现把键当集合，重复插入不新增结点。中序遍历因此得到升序键。查找、插入与删除都与树高 h 成正比；不平衡 BST 可能退化成链，不能无条件声称 O(log n)。

删除叶子直接断开；只有一个孩子时让孩子接替；有两个孩子时，可用右子树最小键作为中序后继，再从右侧删除该后继。本实现用下标数组管理结点，不立即复用被删除的槽，所以空间按历史插入数量计，而不是仅按当前存活数量计。

## AVL 在每个结点限制高度差

高度定义为空树 0、叶子 1，平衡因子为左高减右高。插入或删除之后，先更新高度，再根据失衡方向选择单旋或双旋。左高且左孩子右高时先左旋孩子再右旋根；另外一侧对称。旋转必须保持中序顺序，而非任意交换数值。

旋转结束要先更新旧根，再更新新根。删除可能使多个祖先失衡，因此沿返回路径持续修复；不能把插入时的局部处理直接截断套到删除。完整实现同时支持 AVL 插入、删除与中序查询。

## B 树把多个键放进一个结点

B 树适合一次读写一个较大的存储块，用更多分支降低块访问层数。本实现用最小度 t≥2 描述：非根结点至少 t-1、最多 2t-1 个键；内部结点孩子数为键数+1；所有叶子同层。课程的“m 阶”可能按最大孩子数定义，与这里的 t 不是同一个符号。

插入前先把将要进入的满孩子分裂，中间键提升到父结点。根满时创建新根并分裂，因此高度只在根处增加。这里提供查找、插入和有序导出；B 树删除的借位/合并仅作为延伸，不声称已实现。B+ 树的记录位置与叶子链接又有额外约定，不能直接等同本实现。

## 手推检查

向空 AVL 依次插入 30、10、20，画出双旋后的根；向 t=2 的 B 树插入 1、2、3、4，指出第一次根分裂提升哪个键。

<details><summary>核对结果</summary>

AVL 为 LR 型，先对 10 左旋，再对 30 右旋，根为 20。B 树在进入满根插入 4 前分裂，提升 2，左右结点初始分别包含 1 与 3，随后 4 进入右侧。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：bst</summary>

```cpp
class BST {
    struct Node {
        i64 key;
        int left = -1, right = -1;
    };
    std::vector<Node> nodes_;
    int root_ = -1;

  public:
    bool contains(i64 x) const {
        int p = root_;
        while (p >= 0) {
            if (nodes_[p].key == x)
                return true;
            p = x < nodes_[p].key ? nodes_[p].left : nodes_[p].right;
        }
        return false;
    }
    void insert(i64 x) {
        if (root_ < 0) {
            root_ = static_cast<int>(nodes_.size());
            nodes_.push_back({x});
            return;
        }
        int p = root_;
        while (true) {
            if (nodes_[p].key == x)
                return;
            bool left = x < nodes_[p].key;
            int next = left ? nodes_[p].left : nodes_[p].right;
            if (next >= 0) {
                p = next;
                continue;
            }
            int id = static_cast<int>(nodes_.size());
            nodes_.push_back({x});
            if (left)
                nodes_[p].left = id;
            else
                nodes_[p].right = id;
            return;
        }
    }
    bool erase(i64 x) {
        int p = root_, parent = -1;
        while (p >= 0 && nodes_[p].key != x) {
            parent = p;
            p = x < nodes_[p].key ? nodes_[p].left : nodes_[p].right;
        }
        if (p < 0)
            return false;
        if (nodes_[p].left >= 0 && nodes_[p].right >= 0) {
            int successor = nodes_[p].right;
            parent = p;
            while (nodes_[successor].left >= 0) {
                parent = successor;
                successor = nodes_[successor].left;
            }
            nodes_[p].key = nodes_[successor].key;
            p = successor;
        }
        int child = nodes_[p].left >= 0 ? nodes_[p].left : nodes_[p].right;
        if (parent < 0)
            root_ = child;
        else if (nodes_[parent].left == p)
            nodes_[parent].left = child;
        else
            nodes_[parent].right = child;
        return true;
    }
    std::vector<i64> inorder() const {
        std::vector<i64> result;
        std::vector<int> st;
        int p = root_;
        while (p >= 0 || !st.empty()) {
            while (p >= 0) {
                st.push_back(p);
                p = nodes_[p].left;
            }
            p = st.back();
            st.pop_back();
            result.push_back(nodes_[p].key);
            p = nodes_[p].right;
        }
        return result;
    }
};
```

</details>

<details><summary>完整 C++17 实现：avl</summary>

```cpp
class AVL {
    struct Node {
        i64 key;
        int left = -1, right = -1, height = 1;
    };
    std::vector<Node> t_;
    int root_ = -1;
    int h(int p) const {
        return p < 0 ? 0 : t_[p].height;
    }
    void update(int p) {
        t_[p].height = 1 + std::max(h(t_[p].left), h(t_[p].right));
    }
    int balance(int p) const {
        return h(t_[p].left) - h(t_[p].right);
    }
    int right_rotate(int y) {
        int x = t_[y].left, middle = t_[x].right;
        t_[x].right = y;
        t_[y].left = middle;
        update(y);
        update(x);
        return x;
    }
    int left_rotate(int x) {
        int y = t_[x].right, middle = t_[y].left;
        t_[y].left = x;
        t_[x].right = middle;
        update(x);
        update(y);
        return y;
    }
    int repair(int p) {
        update(p);
        if (balance(p) > 1) {
            if (balance(t_[p].left) < 0)
                t_[p].left = left_rotate(t_[p].left);
            return right_rotate(p);
        }
        if (balance(p) < -1) {
            if (balance(t_[p].right) > 0)
                t_[p].right = right_rotate(t_[p].right);
            return left_rotate(p);
        }
        return p;
    }
    int insert_at(int p, i64 x) {
        if (p < 0) {
            t_.push_back({x});
            return static_cast<int>(t_.size()) - 1;
        }
        if (x < t_[p].key)
            t_[p].left = insert_at(t_[p].left, x);
        else if (x > t_[p].key)
            t_[p].right = insert_at(t_[p].right, x);
        else
            return p;
        return repair(p);
    }
    int erase_at(int p, i64 x) {
        if (p < 0)
            return -1;
        if (x < t_[p].key)
            t_[p].left = erase_at(t_[p].left, x);
        else if (x > t_[p].key)
            t_[p].right = erase_at(t_[p].right, x);
        else {
            if (t_[p].left < 0)
                return t_[p].right;
            if (t_[p].right < 0)
                return t_[p].left;
            int s = t_[p].right;
            while (t_[s].left >= 0)
                s = t_[s].left;
            t_[p].key = t_[s].key;
            t_[p].right = erase_at(t_[p].right, t_[s].key);
        }
        return repair(p);
    }
    void collect(int p, std::vector<i64> &out) const {
        if (p < 0)
            return;
        collect(t_[p].left, out);
        out.push_back(t_[p].key);
        collect(t_[p].right, out);
    }

  public:
    void insert(i64 x) {
        root_ = insert_at(root_, x);
    }
    void erase(i64 x) {
        root_ = erase_at(root_, x);
    }
    int height() const {
        return h(root_);
    }
    i64 root_key() const {
        if (root_ < 0)
            throw std::out_of_range("empty");
        return t_[root_].key;
    }
    std::vector<i64> inorder() const {
        std::vector<i64> out;
        collect(root_, out);
        return out;
    }
};
```

</details>

<details><summary>完整 C++17 实现：btree</summary>

```cpp
class BTree {
    struct Node {
        bool leaf;
        std::vector<i64> keys;
        std::vector<int> child;
    };
    std::vector<Node> t_;
    int degree_, root_ = -1;
    void split(int parent, int pos) {
        int left = t_[parent].child[pos];
        i64 middle = t_[left].keys[degree_ - 1];
        Node right{t_[left].leaf, {}, {}};
        right.keys.assign(t_[left].keys.begin() + degree_, t_[left].keys.end());
        if (!right.leaf)
            right.child.assign(t_[left].child.begin() + degree_, t_[left].child.end());
        t_[left].keys.resize(degree_ - 1);
        if (!t_[left].leaf)
            t_[left].child.resize(degree_);
        int id = static_cast<int>(t_.size());
        t_.push_back(std::move(right));
        t_[parent].keys.insert(t_[parent].keys.begin() + pos, middle);
        t_[parent].child.insert(t_[parent].child.begin() + pos + 1, id);
    }
    void collect(int p, std::vector<i64> &out) const {
        for (int i = 0; i < static_cast<int>(t_[p].keys.size()); ++i) {
            if (!t_[p].leaf)
                collect(t_[p].child[i], out);
            out.push_back(t_[p].keys[i]);
        }
        if (!t_[p].leaf)
            collect(t_[p].child.back(), out);
    }

  public:
    explicit BTree(int minimum_degree = 2) : degree_(minimum_degree) {
        if (degree_ < 2)
            throw std::invalid_argument("degree");
    }
    bool contains(i64 x) const {
        int p = root_;
        while (p >= 0) {
            int i = static_cast<int>(std::lower_bound(t_[p].keys.begin(), t_[p].keys.end(), x) -
                                     t_[p].keys.begin());
            if (i < static_cast<int>(t_[p].keys.size()) && t_[p].keys[i] == x)
                return true;
            if (t_[p].leaf)
                return false;
            p = t_[p].child[i];
        }
        return false;
    }
    void insert(i64 x) {
        if (contains(x))
            return;
        if (root_ < 0) {
            root_ = 0;
            t_.push_back({true, {x}, {}});
            return;
        }
        if (static_cast<int>(t_[root_].keys.size()) == 2 * degree_ - 1) {
            int old = root_;
            root_ = static_cast<int>(t_.size());
            t_.push_back({false, {}, {old}});
            split(root_, 0);
        }
        int p = root_;
        while (!t_[p].leaf) {
            int i = static_cast<int>(std::lower_bound(t_[p].keys.begin(), t_[p].keys.end(), x) -
                                     t_[p].keys.begin());
            if (static_cast<int>(t_[t_[p].child[i]].keys.size()) == 2 * degree_ - 1) {
                split(p, i);
                if (x > t_[p].keys[i])
                    ++i;
            }
            p = t_[p].child[i];
        }
        t_[p].keys.insert(std::lower_bound(t_[p].keys.begin(), t_[p].keys.end(), x), x);
    }
    std::vector<i64> inorder() const {
        std::vector<i64> out;
        if (root_ >= 0)
            collect(root_, out);
        return out;
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
    AVL a;
    for (int x : {30, 10, 20})
        a.insert(x);
    std::cout << a.root_key() << ' ' << a.height() << '\n';
    print(a.inorder());
    BTree b;
    for (int i = 0; i < 10; ++i)
        b.insert(i);
    std::cout << b.contains(7) << ' ' << b.contains(99) << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
20 2
10 20 30
1 0
```

</details>

本机运行：`python practice/judge.py demo d22`。

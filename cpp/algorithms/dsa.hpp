#pragma once
// 本指南的教学实现；C++17。下标与空状态约定见各章和 algorithms/README.md。
#include <algorithm>
#include <array>
#include <cstdint>
#include <functional>
#include <limits>
#include <memory>
#include <numeric>
#include <optional>
#include <queue>
#include <stdexcept>
#include <string>
#include <tuple>
#include <utility>
#include <vector>
namespace study {
using i64 = long long;
inline constexpr i64 INF = std::numeric_limits<i64>::max() / 4;
// BEGIN search
inline int lower_bound_index(const std::vector<i64> &a, i64 x) {
    int left = 0, right = static_cast<int>(a.size());
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (a[mid] < x)
            left = mid + 1;
        else
            right = mid;
    }
    return left;
}
inline i64 max_subarray(const std::vector<i64> &a) {
    i64 ending = 0, best = 0;
    // 允许空子数组，和为 0。
    for (i64 x : a) {
        ending = std::max<i64>(0, ending + x);
        best = std::max(best, ending);
    }
    return best;
}
// END search
// BEGIN list
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
// END list
// BEGIN stack_queue
inline bool valid_brackets(const std::string &s) {
    std::vector<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{')
            st.push_back(c);
        else {
            if (st.empty())
                return false;
            char open = st.back();
            st.pop_back();
            if (!((open == '(' && c == ')') || (open == '[' && c == ']') ||
                  (open == '{' && c == '}')))
                return false;
        }
    }
    return st.empty();
}
class CircularQueue {
    std::vector<i64> data_;
    std::size_t head_ = 0, size_ = 0;

  public:
    explicit CircularQueue(std::size_t capacity) : data_(capacity) {
        if (!capacity)
            throw std::invalid_argument("capacity must be positive");
    }
    std::size_t size() const {
        return size_;
    }
    bool push(i64 x) {
        if (size_ == data_.size())
            return false;
        data_[(head_ + size_) % data_.size()] = x;
        ++size_;
        return true;
    }
    i64 front() const {
        if (!size_)
            throw std::out_of_range("empty");
        return data_[head_];
    }
    i64 pop() {
        i64 x = front();
        head_ = (head_ + 1) % data_.size();
        --size_;
        return x;
    }
};
// END stack_queue
// BEGIN strings
inline std::vector<int> prefix_function(const std::string &pattern) {
    std::vector<int> pi(pattern.size());
    for (int i = 1; i < static_cast<int>(pattern.size()); ++i) {
        int j = pi[i - 1];
        while (j && pattern[i] != pattern[j])
            j = pi[j - 1];
        if (pattern[i] == pattern[j])
            ++j;
        pi[i] = j;
    }
    return pi;
}
inline std::vector<int> kmp_matches(const std::string &text, const std::string &pattern) {
    std::vector<int> matches;
    if (pattern.empty()) {
        for (int i = 0; i <= static_cast<int>(text.size()); ++i)
            matches.push_back(i);
        return matches;
    }
    auto pi = prefix_function(pattern);
    int j = 0;
    for (int i = 0; i < static_cast<int>(text.size()); ++i) {
        while (j && text[i] != pattern[j])
            j = pi[j - 1];
        if (text[i] == pattern[j])
            ++j;
        if (j == static_cast<int>(pattern.size())) {
            matches.push_back(i - j + 1);
            j = pi[j - 1];
            // 保留重叠匹配。
        }
    }
    return matches;
}
class Trie {
    struct Node {
        std::array<int, 26> next;
        int pass = 0, end = 0;
        Node() {
            next.fill(-1);
        }
    };
    std::vector<Node> nodes_{1};
    int locate(const std::string &s) const {
        int p = 0;
        for (char c : s) {
            p = nodes_[p].next[c - 'a'];
            if (p < 0)
                return -1;
        }
        return p;
    }

  public:
    void add(const std::string &s) {
        int p = 0;
        ++nodes_[p].pass;
        for (char c : s) {
            int k = c - 'a', next = nodes_[p].next[k];
            if (next < 0) {
                next = static_cast<int>(nodes_.size());
                nodes_[p].next[k] = next;
                nodes_.emplace_back();
                // 不保留可能因扩容失效的引用。
            }
            p = next;
            ++nodes_[p].pass;
        }
        ++nodes_[p].end;
    }
    int count_word(const std::string &s) const {
        int p = locate(s);
        return p < 0 ? 0 : nodes_[p].end;
    }
    int count_prefix(const std::string &s) const {
        int p = locate(s);
        return p < 0 ? 0 : nodes_[p].pass;
    }
};
// END strings
// BEGIN tree
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
// END tree
// BEGIN bst
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
// END bst
// BEGIN avl
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
// END avl
// BEGIN btree
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
// END btree
// BEGIN heap
class MinHeap {
    std::vector<i64> a_;
    void down(std::size_t p) {
        while (2 * p + 1 < a_.size()) {
            std::size_t c = 2 * p + 1;
            if (c + 1 < a_.size() && a_[c + 1] < a_[c])
                ++c;
            if (a_[p] <= a_[c])
                break;
            std::swap(a_[p], a_[c]);
            p = c;
        }
    }

  public:
    MinHeap() = default;
    explicit MinHeap(std::vector<i64> a) : a_(std::move(a)) {
        for (std::size_t i = a_.size() / 2; i > 0; --i)
            down(i - 1);
    }
    std::size_t size() const {
        return a_.size();
    }
    void push(i64 x) {
        a_.push_back(x);
        std::size_t p = a_.size() - 1;
        while (p && a_[p] < a_[(p - 1) / 2]) {
            std::swap(a_[p], a_[(p - 1) / 2]);
            p = (p - 1) / 2;
        }
    }
    i64 top() const {
        if (a_.empty())
            throw std::out_of_range("empty");
        return a_[0];
    }
    i64 pop() {
        i64 out = top();
        a_[0] = a_.back();
        a_.pop_back();
        if (!a_.empty())
            down(0);
        return out;
    }
};
inline i64 huffman_cost(const std::vector<i64> &weights) {
    MinHeap heap(weights);
    i64 answer = 0;
    while (heap.size() > 1) {
        i64 a = heap.pop(), b = heap.pop();
        answer += a + b;
        heap.push(a + b);
    }
    return answer;
    // 单个叶子的树深度定义为 0。
}
// END heap
// BEGIN hashing
class ProbeSet {
    struct Slot {
        int state = 0;
        i64 key = 0;
    };
    // 0 从未使用，1 占用，2 墓碑。
    std::vector<Slot> table_;
    int home(i64 x) const {
        i64 m = static_cast<i64>(table_.size());
        return static_cast<int>((x % m + m) % m);
    }

  public:
    explicit ProbeSet(int capacity) : table_(capacity) {
        if (capacity <= 0)
            throw std::invalid_argument("capacity");
    }
    std::pair<int, int> find(i64 x) const {
        int m = static_cast<int>(table_.size()), start = home(x);
        for (int step = 0; step < m; ++step) {
            int p = (start + step) % m;
            if (table_[p].state == 0)
                return {-1, step + 1};
            if (table_[p].state == 1 && table_[p].key == x)
                return {p, step + 1};
        }
        return {-1, m};
    }
    int insert(i64 x) {
        int m = static_cast<int>(table_.size()), start = home(x), deleted = -1;
        for (int step = 0; step < m; ++step) {
            int p = (start + step) % m;
            if (table_[p].state == 1 && table_[p].key == x)
                return p;
            if (table_[p].state == 2 && deleted < 0)
                deleted = p;
            if (table_[p].state == 0) {
                int target = deleted < 0 ? p : deleted;
                table_[target] = {1, x};
                return target;
            }
        }
        if (deleted >= 0)
            table_[deleted] = {1, x};
        return deleted;
    }
    bool erase(i64 x) {
        int p = find(x).first;
        if (p < 0)
            return false;
        table_[p].state = 2;
        return true;
    }
};
// END hashing
// BEGIN dsu
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
// END dsu
// BEGIN graph
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
// END graph
// BEGIN dag
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
// END dag
// BEGIN shortest
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
// END shortest
// BEGIN mst
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
// END mst
// BEGIN sorting
using Record = std::pair<i64, int>;
inline void stable_merge_sort(std::vector<Record> &a) {
    std::vector<Record> temp(a.size());
    std::function<void(int, int)> sort = [&](int l, int r) {
        if (r - l <= 1)
            return;
        int m = l + (r - l) / 2;
        sort(l, m);
        sort(m, r);
        int i = l, j = m, k = l;
        while (i < m && j < r)
            temp[k++] = a[i].first <= a[j].first ? a[i++] : a[j++];
        while (i < m)
            temp[k++] = a[i++];
        while (j < r)
            temp[k++] = a[j++];
        for (int p = l; p < r; ++p)
            a[p] = temp[p];
    };
    sort(0, static_cast<int>(a.size()));
}
inline i64 inversion_count(std::vector<i64> a) {
    std::vector<i64> temp(a.size());
    std::function<i64(int, int)> count = [&](int l, int r) -> i64 {
        if (r - l <= 1)
            return 0;
        int m = l + (r - l) / 2;
        i64 answer = count(l, m) + count(m, r);
        int i = l, j = m, k = l;
        while (i < m && j < r) {
            if (a[i] <= a[j])
                temp[k++] = a[i++];
            else {
                temp[k++] = a[j++];
                answer += m - i;
            }
        }
        while (i < m)
            temp[k++] = a[i++];
        while (j < r)
            temp[k++] = a[j++];
        for (int p = l; p < r; ++p)
            a[p] = temp[p];
        return answer;
    };
    return count(0, static_cast<int>(a.size()));
}
inline void insertion_sort(std::vector<i64> &a) {
    for (std::size_t i = 1; i < a.size(); ++i) {
        i64 value = a[i];
        std::size_t j = i;
        while (j && a[j - 1] > value) {
            a[j] = a[j - 1];
            --j;
        }
        a[j] = value;
    }
}
inline void quick_sort(std::vector<i64> &a) {
    std::function<void(int, int)> sort = [&](int l, int r) {
        while (l < r) {
            i64 pivot = a[l + (r - l) / 2];
            int less = l, i = l, greater = r;
            while (i <= greater) {
                if (a[i] < pivot)
                    std::swap(a[less++], a[i++]);
                else if (a[i] > pivot)
                    std::swap(a[i], a[greater--]);
                else
                    ++i;
            }
            if (less - l < r - greater) {
                sort(l, less - 1);
                l = greater + 1;
            } else {
                sort(greater + 1, r);
                r = less - 1;
            }
        }
    };
    sort(0, static_cast<int>(a.size()) - 1);
}
inline void heap_sort(std::vector<i64> &a) {
    // 教学复用最小堆，使用 O(n) 额外空间；不是原地堆排序版本。
    MinHeap heap(a);
    for (auto &x : a)
        x = heap.pop();
}
inline void radix_sort(std::vector<std::uint32_t> &a) {
    std::vector<std::uint32_t> temp(a.size());
    for (int shift = 0; shift < 32; shift += 8) {
        std::array<std::size_t, 256> count{};
        for (auto x : a)
            ++count[(x >> shift) & 255];
        std::size_t sum = 0;
        for (auto &c : count) {
            std::size_t old = c;
            c = sum;
            sum += old;
        }
        for (auto x : a)
            temp[count[(x >> shift) & 255]++] = x;
        a.swap(temp);
    }
}
// END sorting
// BEGIN dp_greedy
inline int activity_selection(std::vector<std::pair<i64, i64>> intervals) {
    std::sort(intervals.begin(), intervals.end(), [](auto a, auto b) {
        return a.second != b.second ? a.second < b.second : a.first < b.first;
    });
    i64 end = std::numeric_limits<i64>::lowest();
    int count = 0;
    for (auto [start, finish] : intervals)
        if (start >= end) {
            ++count;
            end = finish;
        }
    return count;
}
inline i64 knapsack01(int capacity, const std::vector<std::pair<int, i64>> &items) {
    std::vector<i64> dp(capacity + 1);
    for (auto [weight, value] : items)
        for (int c = capacity; c >= weight; --c)
            dp[c] = std::max(dp[c], dp[c - weight] + value);
    return dp[capacity];
}
// END dp_greedy
// BEGIN ranges
class Fenwick {
    std::vector<i64> bit_;

  public:
    explicit Fenwick(int n) : bit_(n + 1) {}
    void add(int index, i64 delta) {
        for (int i = index + 1; i < static_cast<int>(bit_.size()); i += i & -i)
            bit_[i] += delta;
    }
    i64 prefix(int end) const {
        i64 sum = 0;
        for (int i = end; i > 0; i -= i & -i)
            sum += bit_[i];
        return sum;
    }
    i64 sum(int left, int right) const {
        return prefix(right) - prefix(left);
    }
};
class RangeSum {
    int n_;
    std::vector<i64> sum_, lazy_;
    void build(int p, int l, int r, const std::vector<i64> &a) {
        if (r - l == 1) {
            sum_[p] = a[l];
            return;
        }
        int m = l + (r - l) / 2;
        build(p * 2, l, m, a);
        build(p * 2 + 1, m, r, a);
        sum_[p] = sum_[p * 2] + sum_[p * 2 + 1];
    }
    void apply(int p, int length, i64 value) {
        sum_[p] += value * length;
        lazy_[p] += value;
    }
    void push(int p, int l, int r) {
        int m = l + (r - l) / 2;
        if (lazy_[p] && r - l > 1) {
            apply(p * 2, m - l, lazy_[p]);
            apply(p * 2 + 1, r - m, lazy_[p]);
            lazy_[p] = 0;
        }
    }
    void add_at(int p, int l, int r, int ql, int qr, i64 value) {
        if (ql <= l && r <= qr) {
            apply(p, r - l, value);
            return;
        }
        push(p, l, r);
        int m = l + (r - l) / 2;
        if (ql < m)
            add_at(p * 2, l, m, ql, qr, value);
        if (qr > m)
            add_at(p * 2 + 1, m, r, ql, qr, value);
        sum_[p] = sum_[p * 2] + sum_[p * 2 + 1];
    }
    i64 sum_at(int p, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr)
            return sum_[p];
        push(p, l, r);
        int m = l + (r - l) / 2;
        i64 result = 0;
        if (ql < m)
            result += sum_at(p * 2, l, m, ql, qr);
        if (qr > m)
            result += sum_at(p * 2 + 1, m, r, ql, qr);
        return result;
    }

  public:
    explicit RangeSum(const std::vector<i64> &a)
        : n_(static_cast<int>(a.size())), sum_(4 * std::max(1, n_)), lazy_(sum_.size()) {
        if (n_)
            build(1, 0, n_, a);
    }
    void add(int l, int r, i64 value) {
        if (l < r)
            add_at(1, 0, n_, l, r, value);
    }
    i64 sum(int l, int r) {
        return l < r ? sum_at(1, 0, n_, l, r) : 0;
    }
};
// END ranges
} // namespace study
// namespace study

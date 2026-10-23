// 固定随机种子的独立交叉检查：STL/朴素模型核对教学实现。
#include "../algorithms/dsa.hpp"
#include <cassert>
#include <iostream>
#include <random>
#include <set>
using namespace study;
int main() {
    std::mt19937 rng(20261023);
    BST bst;
    // 删除到空后再次插入：结点池中仍有旧槽，不得把根误设为 0。
    bst.insert(9);
    assert(bst.erase(9));
    bst.insert(2);
    assert(bst.inorder() == std::vector<i64>{2});
    assert(!bst.contains(9));
    bst.erase(2);
    AVL avl;
    std::set<i64> expected;
    for (int t = 0; t < 6000; ++t) {
        i64 x = static_cast<int>(rng() % 400) - 200;
        if (rng() % 2) {
            bst.insert(x);
            avl.insert(x);
            expected.insert(x);
        } else {
            bst.erase(x);
            avl.erase(x);
            expected.erase(x);
        }
        std::vector<i64> values(expected.begin(), expected.end());
        assert(bst.inorder() == values);
        assert(avl.inorder() == values);
        assert(avl.height() <= 16);
    }
    for (i64 x : expected) {
        avl.erase(x);
        bst.erase(x);
    }
    assert(avl.height() == 0 && bst.inorder().empty());
    for (int degree = 2; degree <= 8; ++degree) {
        BTree b(degree);
        std::set<i64> model;
        for (int i = 0; i < 1500; ++i) {
            i64 x = static_cast<int>(rng() % 5000) - 2500;
            b.insert(x);
            model.insert(x);
        }
        assert(b.inorder() == std::vector<i64>(model.begin(), model.end()));
        for (int x = -2600; x <= 2600; ++x)
            assert(b.contains(x) == bool(model.count(x)));
    }
    for (int trial = 0; trial < 120; ++trial) {
        int n = rng() % 80;
        std::vector<i64> a(n);
        for (auto &x : a)
            x = static_cast<int>(rng() % 31) - 15;
        auto ordered = a;
        std::sort(ordered.begin(), ordered.end());
        auto b = a;
        insertion_sort(b);
        assert(b == ordered);
        b = a;
        quick_sort(b);
        assert(b == ordered);
        b = a;
        heap_sort(b);
        assert(b == ordered);
        MinHeap heap(a);
        b.clear();
        while (heap.size())
            b.push_back(heap.pop());
        assert(b == ordered);
        i64 inv = 0;
        for (int i = 0; i < n; ++i)
            for (int j = i + 1; j < n; ++j)
                inv += a[i] > a[j];
        assert(inversion_count(a) == inv);
        std::vector<Record> records;
        for (auto x : a)
            records.push_back({x, static_cast<int>(rng())});
        auto stable = records;
        std::stable_sort(stable.begin(), stable.end(),
                         [](auto x, auto y) { return x.first < y.first; });
        stable_merge_sort(records);
        assert(records == stable);
        std::vector<uint32_t> u(n);
        for (auto &x : u)
            x = rng();
        auto u2 = u;
        std::sort(u2.begin(), u2.end());
        radix_sort(u);
        assert(u == u2);
        Fenwick bit(n);
        RangeSum segment(a);
        for (int i = 0; i < n; ++i)
            bit.add(i, a[i]);
        for (int t = 0; t < 100; ++t) {
            int l = rng() % (n + 1), r = rng() % (n + 1);
            if (l > r)
                std::swap(l, r);
            if (rng() % 2) {
                i64 delta = static_cast<int>(rng() % 200) - 100;
                segment.add(l, r, delta);
                for (int i = l; i < r; ++i) {
                    a[i] += delta;
                    bit.add(i, delta);
                }
            } else {
                i64 sum = std::accumulate(a.begin() + l, a.begin() + r, 0LL);
                assert(bit.sum(l, r) == sum);
                assert(segment.sum(l, r) == sum);
            }
        }
        std::string text, pattern;
        for (int i = 0; i < n; ++i)
            text += char('a' + rng() % 3);
        for (int i = rng() % 8; i > 0; --i)
            pattern += char('a' + rng() % 3);
        std::vector<int> positions;
        for (int i = 0; i <= (int)text.size(); ++i)
            if (text.substr(i, pattern.size()) == pattern)
                positions.push_back(i);
        assert(kmp_matches(text, pattern) == positions);
    }
    for (int trial = 0; trial < 100; ++trial) {
        int n = 1 + rng() % 12;
        std::vector<Edge> edges;
        WeightedGraph directed(n), undirected(n);
        for (int k = 0; k < 30; ++k) {
            int u = rng() % n, v = rng() % n;
            i64 w = rng() % 20;
            edges.push_back({u, v, w});
            directed[u].push_back({v, w});
            undirected[u].push_back({v, w});
            undirected[v].push_back({u, w});
        }
        auto matrix = floyd(n, edges);
        for (int s = 0; s < n; ++s) {
            assert(dijkstra(directed, s) == matrix[s]);
            auto r = bellman_ford(n, edges, s);
            assert(!r.negative_cycle && r.distance == matrix[s]);
        }
        assert(prim(undirected) == kruskal(n, edges));
    }
    std::cout << "Algorithm cross-checks passed: trees, sorting, heap, KMP, ranges, shortest "
                 "paths, MST.\n";
}

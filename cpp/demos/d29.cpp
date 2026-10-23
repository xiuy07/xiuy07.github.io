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

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

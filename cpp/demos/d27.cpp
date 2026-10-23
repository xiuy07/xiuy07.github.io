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

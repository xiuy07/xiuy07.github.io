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
    Graph g = {{1, 2}, {0, 3}, {0}, {1}};
    print(bfs_distances(g, 0));
    std::cout << connected_components(g) << '\n';
}

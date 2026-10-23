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
    DSU d(5);
    d.unite(0, 1);
    d.unite(1, 2);
    d.unite(3, 4);
    std::cout << d.components() << ' ' << d.size(0) << ' ' << (d.find(0) == d.find(4)) << '\n';
}

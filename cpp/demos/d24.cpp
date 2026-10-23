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
    ProbeSet h(5);
    std::cout << h.insert(1) << ' ' << h.insert(6) << ' ' << h.insert(11) << '\n';
    h.erase(6);
    auto a = h.find(11);
    std::cout << a.first << ' ' << a.second << '\n';
    std::cout << h.insert(16) << '\n';
    auto b = h.find(6);
    std::cout << b.first << ' ' << b.second << '\n';
}

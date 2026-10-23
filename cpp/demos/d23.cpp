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
    MinHeap h({7, 2, 5});
    h.push(1);
    std::vector<i64> a;
    while (h.size())
        a.push_back(h.pop());
    print(a);
    std::cout << huffman_cost({1, 2, 3, 4}) << '\n';
}

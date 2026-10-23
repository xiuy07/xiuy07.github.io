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
    std::cout << activity_selection({{0, 3}, {1, 2}, {2, 4}, {4, 5}}) << '\n';
    std::cout << knapsack01(5, {{2, 3}, {3, 4}, {4, 10}}) << '\n';
}

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
    print(std::vector<int>{lower_bound_index({1, 2, 2, 8}, 2)});
    std::cout << max_subarray({-4, 3, -1, 5, -9}) << '\n';
}

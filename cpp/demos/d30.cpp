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
    std::vector<Record> a = {{2, 0}, {1, 1}, {2, 2}};
    stable_merge_sort(a);
    std::vector<int> ids;
    for (auto x : a)
        ids.push_back(x.second);
    print(ids);
    std::cout << inversion_count({3, 1, 2}) << '\n';
    std::vector<i64> b = {4, 2, 4, 1};
    quick_sort(b);
    print(b);
    std::vector<std::uint32_t> c = {3, 0, 2};
    radix_sort(c);
    print(c);
}

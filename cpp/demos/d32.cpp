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
    std::vector<i64> a = {1, 2, 3, 4};
    Fenwick f(4);
    for (int i = 0; i < 4; ++i)
        f.add(i, a[i]);
    std::cout << f.sum(1, 4) << '\n';
    f.add(2, -1);
    std::cout << f.sum(0, 4) << '\n';
    RangeSum t(a);
    t.add(1, 3, 5);
    std::cout << t.sum(0, 4) << ' ' << t.sum(1, 3) << '\n';
}

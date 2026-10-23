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
    auto t = rebuild_tree({2, 1, 3}, {1, 2, 3});
    auto x = traverse_tree(t, 0);
    print(x.preorder);
    print(x.inorder);
    print(x.postorder);
}

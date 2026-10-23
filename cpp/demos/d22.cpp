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
    AVL a;
    for (int x : {30, 10, 20})
        a.insert(x);
    std::cout << a.root_key() << ' ' << a.height() << '\n';
    print(a.inorder());
    BTree b;
    for (int i = 0; i < 10; ++i)
        b.insert(i);
    std::cout << b.contains(7) << ' ' << b.contains(99) << '\n';
}

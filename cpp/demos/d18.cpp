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
    LinearList a;
    a.insert(0, 10);
    a.insert(1, 30);
    a.insert(1, 20);
    std::cout << a.erase(0) << ' ' << a.size() << ' ' << a.at(0) << '\n';
    print(josephus(5, 2));
}

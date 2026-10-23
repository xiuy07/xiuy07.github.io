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
    std::cout << valid_brackets("([])") << ' ' << valid_brackets("([)]") << '\n';
    CircularQueue q(2);
    q.push(1);
    q.push(2);
    std::cout << q.push(3) << ' ' << q.pop() << ' ';
    std::cout << q.push(3) << ' ' << q.front() << ' ' << q.size() << '\n';
}

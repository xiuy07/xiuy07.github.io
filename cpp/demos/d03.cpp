#include <iostream>
#include <vector>
int main() {
    std::vector<int> a;
    a.reserve(8);
    std::cout << a.size() << ' ' << (a.capacity() >= 8) << '\n';
    a.push_back(3); a.push_back(5);
    for (auto x : a) x *= 2;
    std::cout << a[0] << ' ' << a[1] << '\n';
    for (auto& x : a) x *= 2;
    std::cout << a[0] << ' ' << a[1] << '\n';
}

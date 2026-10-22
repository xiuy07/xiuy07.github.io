#include <iostream>
#include <limits>
int main() {
    int a = 50000, b = 50000;
    std::cout << 1LL * a * b << '\n';
    std::cout << 7 / 2 << ' ' << 7 / 2.0 << '\n';
    std::cout << (std::numeric_limits<long long>::digits >= 63) << '\n';
}

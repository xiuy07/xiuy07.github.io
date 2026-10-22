#include <iostream>
struct Counter {
    int n;
    explicit Counter(int x):n(x) {}
    Counter& operator++() { ++n; return *this; }
    Counter operator++(int) { Counter old=*this; ++(*this); return old; }
};
int main() {
    Counter c(4);
    Counter old=c++;
    std::cout << old.n << ' ' << c.n << '\n';
    Counter& same=++c;
    std::cout << same.n << ' ' << (&same==&c) << '\n';
}

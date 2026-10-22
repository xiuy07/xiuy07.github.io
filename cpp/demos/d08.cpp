#include <iostream>
struct Counter {
    inline static int alive=0;
    int n;
    explicit Counter(int x):n(x) { ++alive; }
    Counter(const Counter& x):n(x.n) { ++alive; }
    Counter& operator=(const Counter&)=default;
    ~Counter() { --alive; }
    int value() const { return n; }
};
int main() {
    const Counter a(7);
    std::cout << a.value() << ' ' << Counter::alive << '\n';
    { Counter b=a; b=a; std::cout << Counter::alive << '\n'; }
    std::cout << Counter::alive << '\n';
}

#include <iostream>
#include <utility>
void choose(int&) { std::cout << "lvalue\n"; }
void choose(int&&) { std::cout << "rvalue\n"; }
template<class T> void relay(T&& x) {
    choose(x);
    choose(std::forward<T>(x));
}
int main() { int a=3; relay(a); relay(4); }

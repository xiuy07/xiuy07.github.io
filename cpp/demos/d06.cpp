#include <iostream>
#include <string>
struct Trace {
    std::string name;
    explicit Trace(std::string s):name(s) { std::cout << '+' << name << '\n'; }
    ~Trace() { std::cout << '-' << name << '\n'; }
};
struct Pair {
    Trace a;
    Trace b;
    Pair():a("a"),b("b") { std::cout << "body\n"; }
    ~Pair() { std::cout << "~Pair\n"; }
};
int main() { Pair p; }

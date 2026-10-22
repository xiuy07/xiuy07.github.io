#include <iostream>
struct Base {
    virtual ~Base()=default;
    virtual const char* name() const { return "Base"; }
    const char* plain() const { return "Base plain"; }
};
struct Derived:Base {
    const char* name() const override { return "Derived"; }
    const char* plain() const { return "Derived plain"; }
};
int main() {
    Derived d;
    Base& b=d;
    std::cout << b.name() << '\n' << b.plain() << '\n';
}

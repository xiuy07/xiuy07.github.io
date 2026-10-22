#include <iostream>
#include <memory>
#include <utility>
struct Item {
    int value;
    explicit Item(int x):value(x) { std::cout << "acquire\n"; }
    ~Item() { std::cout << "release\n"; }
};
int main() {
    auto a=std::make_unique<Item>(7);
    Item* observed=a.get();
    auto b=std::move(a);
    std::cout << (a==nullptr) << ' ' << observed->value << ' ' << b->value << '\n';
}

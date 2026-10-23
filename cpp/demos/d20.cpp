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
    print(kmp_matches("aaaaa", "aaa"));
    Trie t;
    t.add("app");
    t.add("apple");
    t.add("app");
    std::cout << t.count_word("app") << ' ' << t.count_prefix("app") << '\n';
}

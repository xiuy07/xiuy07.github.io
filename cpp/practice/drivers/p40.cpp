#include <algorithm>
#include <array>
#include <iostream>
#include <limits>
#include <list>
#include <map>
#include <memory>
#include <numeric>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <utility>
#include <variant>
#include <vector>
using namespace std;
#include "solution.hpp"
int main() {
    Trie t;
    int q;
    cin >> q;
    while (q--) {
        char op;
        string s;
        cin >> op >> s;
        if (op == 'A')
            t.add(s);
        else
            cout << (op == 'W' ? t.count_word(s) : t.count_prefix(s)) << '\n';
    }
}

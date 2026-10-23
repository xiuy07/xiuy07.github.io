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
    BST t;
    int q;
    cin >> q;
    while (q--) {
        char op;
        long long x;
        cin >> op;
        if (op == 'T') {
            auto a = t.inorder();
            for (size_t i = 0; i < a.size(); ++i) {
                if (i)
                    cout << ' ';
                cout << a[i];
            }
            cout << '\n';
        } else {
            cin >> x;
            if (op == 'I')
                t.insert(x);
            else
                cout << (op == 'E' ? t.erase(x) : t.contains(x)) << '\n';
        }
    }
}

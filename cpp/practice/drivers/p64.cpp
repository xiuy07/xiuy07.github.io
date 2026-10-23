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
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto &x : a)
        cin >> x;
    RangeSum tree(a);
    while (q--) {
        char op;
        int l, r;
        cin >> op >> l >> r;
        if (op == 'A') {
            long long d;
            cin >> d;
            tree.add(l, r, d);
        } else
            cout << tree.sum(l, r) << '\n';
    }
}

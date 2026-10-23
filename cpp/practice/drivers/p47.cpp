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
    int m, q;
    cin >> m >> q;
    ProbeSet s(m);
    while (q--) {
        char op;
        long long x;
        cin >> op >> x;
        if (op == 'I')
            cout << s.insert(x) << '\n';
        else if (op == 'E')
            cout << s.erase(x) << '\n';
        else {
            auto r = s.find(x);
            cout << r.first << ' ' << r.second << '\n';
        }
    }
}

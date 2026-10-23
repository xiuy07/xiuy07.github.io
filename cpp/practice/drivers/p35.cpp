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
    LinearList a;
    int q;
    cin >> q;
    while (q--) {
        char c;
        size_t p;
        long long x;
        cin >> c;
        if (c == 'I') {
            cin >> p >> x;
            a.insert(p, x);
        } else if (c == 'E') {
            cin >> p;
            cout << a.erase(p) << '\n';
        } else if (c == 'A') {
            cin >> p;
            cout << a.at(p) << '\n';
        } else
            cout << a.size() << '\n';
    }
}

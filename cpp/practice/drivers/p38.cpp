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
    size_t cap;
    int q;
    cin >> cap >> q;
    CircularQueue a(cap);
    while (q--) {
        char op;
        long long x;
        cin >> op;
        try {
            if (op == 'P') {
                cin >> x;
                cout << a.push(x) << '\n';
            } else if (op == 'O')
                cout << a.pop() << '\n';
            else if (op == 'F')
                cout << a.front() << '\n';
            else
                cout << a.size() << '\n';
        } catch (const out_of_range &) {
            cout << "EMPTY\n";
        }
    }
}

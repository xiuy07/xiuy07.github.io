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
    MinHeap h;
    int q;
    cin >> q;
    while (q--) {
        char op;
        long long x;
        cin >> op;
        try {
            if (op == 'P') {
                cin >> x;
                h.push(x);
            } else if (op == 'O')
                cout << h.pop() << '\n';
            else if (op == 'F')
                cout << h.top() << '\n';
            else
                cout << h.size() << '\n';
        } catch (const out_of_range &) {
            cout << "EMPTY\n";
        }
    }
}

#include "../../../algorithms/dsa.hpp"
#include <iostream>
using namespace std;
using namespace study;
template <class T> void output(const vector<T> &a) {
    for (size_t i = 0; i < a.size(); ++i) {
        if (i)
            cout << ' ';
        cout << a[i];
    }
    cout << '\n';
}
vector<i64> read_array(int n) {
    vector<i64> a(n);
    for (auto &x : a)
        cin >> x;
    return a;
}
int main() {
    int n, q;
    cin >> n >> q;
    DSU d(n);
    while (q--) {
        char op;
        int u, v;
        cin >> op >> u;
        if (op == 'S')
            cout << d.size(u) << '\n';
        else {
            cin >> v;
            if (op == 'U')
                d.unite(u, v);
            else
                cout << (d.find(u) == d.find(v)) << '\n';
        }
    }
}

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
    auto a = read_array(n);
    Fenwick f(n);
    for (int i = 0; i < n; ++i)
        f.add(i, a[i]);
    while (q--) {
        char op;
        int l;
        i64 r;
        cin >> op >> l >> r;
        if (op == 'A')
            f.add(l, r);
        else
            cout << f.sum(l, (int)r) << '\n';
    }
}

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
    int n, m;
    cin >> n >> m;
    Graph g(n);
    while (m--) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
    }
    auto a = topological_order(g);
    if ((int)a.size() != n)
        cout << "CYCLE\n";
    else
        output(a);
}

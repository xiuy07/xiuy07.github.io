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
    vector<Edge> e(m);
    for (auto &x : e)
        cin >> x.from >> x.to >> x.weight;
    WeightedGraph g(n);
    for (auto x : e) {
        g[x.from].push_back({x.to, x.weight});
        g[x.to].push_back({x.from, x.weight});
    }
    auto r = prim(g);
    if (r)
        cout << *r << '\n';
    else
        cout << "DISCONNECTED\n";
}

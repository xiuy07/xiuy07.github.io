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
void printdist(const vector<i64> &d) {
    for (size_t i = 0; i < d.size(); ++i) {
        if (i)
            cout << ' ';
        if (d[i] == INF)
            cout << "INF";
        else
            cout << d[i];
    }
    cout << '\n';
}
int main() {
    int n, m, s;
    cin >> n >> m >> s;
    WeightedGraph g(n);
    while (m--) {
        int u, v;
        i64 w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    printdist(dijkstra(g, s));
}

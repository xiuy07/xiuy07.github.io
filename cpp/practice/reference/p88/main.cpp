#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    int L = 1;
    while ((1LL << L) <= n)
        ++L;
    vector<vector<int>> g(n + 1), up(L, vector<int>(n + 1, 1));
    for (int i = 1, u, v; i < n; ++i) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> d(n + 1), order{1};
    for (size_t i = 0; i < order.size(); ++i) {
        int u = order[i];
        for (int v : g[u])
            if (v != up[0][u]) {
                up[0][v] = u;
                d[v] = d[u] + 1;
                order.push_back(v);
            }
    }
    for (int k = 1; k < L; ++k)
        for (int v = 1; v <= n; ++v)
            up[k][v] = up[k - 1][up[k - 1][v]];
    while (q--) {
        int u, v;
        cin >> u >> v;
        if (d[u] < d[v])
            swap(u, v);
        int delta = d[u] - d[v];
        for (int k = 0; k < L; ++k)
            if (delta >> k & 1)
                u = up[k][u];
        if (u != v) {
            for (int k = L - 1; k >= 0; --k)
                if (up[k][u] != up[k][v]) {
                    u = up[k][u];
                    v = up[k][v];
                }
            u = up[0][u];
        }
        cout << u << '\n';
    }
}

#include <iostream>
#include <queue>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    while (m--) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> c(n + 1, -1);
    bool ok = true;
    for (int s = 1; s <= n; ++s)
        if (c[s] < 0) {
            queue<int> q;
            q.push(s);
            c[s] = 0;
            while (!q.empty()) {
                int u = q.front();
                q.pop();
                for (int v : g[u]) {
                    if (c[v] < 0) {
                        c[v] = c[u] ^ 1;
                        q.push(v);
                    } else if (c[v] == c[u])
                        ok = false;
                }
            }
        }
    cout << (ok ? "YES" : "NO") << '\n';
}

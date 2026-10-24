#include <iostream>
#include <queue>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> g(n + 1);
    for (int i = 1, u, v; i < n; ++i) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    auto bfs = [&](int s) {
        vector<int> d(n + 1, -1);
        queue<int> q;
        q.push(s);
        d[s] = 0;
        int best = s;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            if (d[u] > d[best])
                best = u;
            for (int v : g[u])
                if (d[v] < 0) {
                    d[v] = d[u] + 1;
                    q.push(v);
                }
        }
        return pair<int, int>{best, d[best]};
    };
    auto a = bfs(1);
    cout << bfs(a.first).second << '\n';
}

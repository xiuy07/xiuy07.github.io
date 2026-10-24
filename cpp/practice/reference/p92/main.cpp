#include <algorithm>
#include <cstddef>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1), r(n + 1);
    while (m--) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        r[v].push_back(u);
    }
    vector<char> seen(n + 1);
    vector<int> order;
    for (int s = 1; s <= n; ++s)
        if (!seen[s]) {
            vector<pair<int, size_t>> st{{s, 0}};
            seen[s] = 1;
            while (!st.empty()) {
                int u = st.back().first;
                auto &i = st.back().second;
                if (i < g[u].size()) {
                    int v = g[u][i++];
                    if (!seen[v]) {
                        seen[v] = 1;
                        st.push_back({v, 0});
                    }
                } else {
                    order.push_back(u);
                    st.pop_back();
                }
            }
        }
    fill(seen.begin(), seen.end(), 0);
    int ans = 0;
    for (auto it = order.rbegin(); it != order.rend(); ++it)
        if (!seen[*it]) {
            ++ans;
            vector<int> st{*it};
            seen[*it] = 1;
            while (!st.empty()) {
                int u = st.back();
                st.pop_back();
                for (int v : r[u])
                    if (!seen[v]) {
                        seen[v] = 1;
                        st.push_back(v);
                    }
            }
        }
    cout << ans << '\n';
}

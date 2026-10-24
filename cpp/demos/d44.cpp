#include <algorithm>
#include <climits>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(4
0 6 22 12
24 0 12 24
17 10 0 1
30 21 6 0
)SAMPLE");
    int n;
    input >> n;
    vector<vector<ll>> a(n, vector<ll>(n));
    for (auto &r : a)
        for (auto &x : r)
            input >> x;
    if (n == 1) {
        cout << 0 << '\n';
        return 0;
    }
    const ll INF = LLONG_MAX / 4;
    int all = 1 << n;
    vector<ll> d((size_t)all * n, INF);
    d[n] = 0;
    for (int mask = 1; mask < all; mask += 2)
        for (int u = 0; u < n; ++u) {
            ll cur = d[(size_t)mask * n + u];
            if (cur == INF)
                continue;
            for (int v = 1; v < n; ++v)
                if (!(mask >> v & 1)) {
                    auto &to = d[(size_t)(mask | 1 << v) * n + v];
                    to = min(to, cur + a[u][v]);
                }
        }
    ll ans = INF;
    for (int u = 1; u < n; ++u)
        ans = min(ans, d[(size_t)(all - 1) * n + u] + a[u][0]);
    cout << ans << '\n';
}

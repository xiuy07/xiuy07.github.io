#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<ll> a(n + 1), down(n + 1);
    vector<int> l(n + 1), r(n + 1);
    for (int i = 1; i <= n; ++i)
        cin >> a[i] >> l[i] >> r[i];
    vector<int> order{1};
    for (size_t i = 0; i < order.size(); ++i) {
        int u = order[i];
        if (l[u])
            order.push_back(l[u]);
        if (r[u])
            order.push_back(r[u]);
    }
    ll ans = LLONG_MIN;
    for (auto it = order.rbegin(); it != order.rend(); ++it) {
        int u = *it;
        ll x = max(0LL, down[l[u]]), y = max(0LL, down[r[u]]);
        ans = max(ans, a[u] + x + y);
        down[u] = a[u] + max(x, y);
    }
    cout << ans << '\n';
}

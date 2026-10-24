#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<ll> a(n + 1), d(n + 2);
    for (int i = 1; i <= n; ++i)
        cin >> a[i];
    while (q--) {
        int l, r;
        ll x;
        cin >> l >> r >> x;
        d[l] += x;
        d[r + 1] -= x;
    }
    ll cur = 0, ans = LLONG_MAX;
    for (int i = 1; i <= n; ++i) {
        cur += d[i];
        ans = min(ans, a[i] + cur);
    }
    cout << ans << '\n';
}

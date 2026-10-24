#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> a(n);
    ll l = 0, r = 0;
    for (auto &x : a) {
        cin >> x;
        r = max(r, x);
    }
    auto ok = [&](ll x) {
        ll c = 0;
        for (ll y : a) {
            c += y / x;
            if (c >= k)
                return true;
        }
        return false;
    };
    while (l < r) {
        ll m = l + (r - l + 1) / 2;
        if (ok(m))
            l = m;
        else
            r = m - 1;
    }
    cout << l << '\n';
}

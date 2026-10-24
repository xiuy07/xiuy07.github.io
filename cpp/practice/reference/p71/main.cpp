#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, d;
    cin >> n >> d;
    vector<ll> a(n);
    ll l = 0, r = 0;
    for (auto &x : a) {
        cin >> x;
        l = max(l, x);
        r += x;
    }
    auto ok = [&](ll c) {
        int days = 1;
        ll s = 0;
        for (ll x : a) {
            if (s + x > c) {
                ++days;
                s = 0;
            }
            s += x;
        }
        return days <= d;
    };
    while (l < r) {
        ll m = l + (r - l) / 2;
        if (ok(m))
            r = m;
        else
            l = m + 1;
    }
    cout << l << '\n';
}

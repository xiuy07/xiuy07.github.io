#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
vector<ll> sums(const vector<ll> &a, int l, int r) {
    vector<ll> v{0};
    for (int i = l; i < r; ++i) {
        int z = v.size();
        for (int j = 0; j < z; ++j)
            v.push_back(v[j] + a[i]);
    }
    return v;
}
int main() {
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> a(n);
    for (auto &x : a)
        cin >> x;
    auto l = sums(a, 0, n / 2), r = sums(a, n / 2, n);
    sort(r.begin(), r.end());
    ll ans = 0;
    for (ll s : l) {
        auto it = equal_range(r.begin(), r.end(), k - s);
        ans += it.second - it.first;
    }
    cout << ans << '\n';
}

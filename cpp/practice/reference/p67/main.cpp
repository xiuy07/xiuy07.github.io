#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto &x : a)
        cin >> x;
    sort(a.begin(), a.end());
    ll ans = 0;
    for (int i = 0; i < n; ++i) {
        if (i && a[i] == a[i - 1])
            continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            ll s = a[i] + a[l] + a[r];
            if (s < 0)
                ++l;
            else if (s > 0)
                --r;
            else {
                ++ans;
                ll x = a[l], y = a[r];
                while (l < r && a[l] == x)
                    ++l;
                while (l < r && a[r] == y)
                    --r;
            }
        }
    }
    cout << ans << '\n';
}

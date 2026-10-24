#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int n;
    cin >> n;
    vector<pair<ll, int>> e;
    while (n--) {
        ll l, r;
        cin >> l >> r;
        e.push_back({l, 1});
        e.push_back({r, -1});
    }
    sort(e.begin(), e.end());
    int cur = 0, ans = 0;
    for (auto [t, d] : e) {
        (void)t;
        cur += d;
        ans = max(ans, cur);
    }
    cout << ans << '\n';
}

#include <algorithm>
#include <climits>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int n;
    cin >> n;
    vector<pair<ll, ll>> v;
    while (n--) {
        ll s, e;
        cin >> s >> e;
        v.push_back({e, s});
    }
    sort(v.begin(), v.end());
    ll last = LLONG_MIN;
    int ans = 0;
    for (auto [e, s] : v)
        if (s >= last) {
            ++ans;
            last = e;
        }
    cout << ans << '\n';
}

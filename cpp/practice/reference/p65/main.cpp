#include <iostream>
#include <unordered_map>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    ll k, x, ans = 0;
    cin >> n >> k;
    unordered_map<ll, ll> f;
    f.reserve(n * 2 + 1);
    while (n--) {
        cin >> x;
        auto it = f.find(k - x);
        if (it != f.end())
            ans += it->second;
        ++f[x];
    }
    cout << ans << '\n';
}

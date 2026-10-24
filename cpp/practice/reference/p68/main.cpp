#include <iostream>
#include <unordered_map>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    ll k, s = 0, ans = 0, x;
    cin >> n >> k;
    unordered_map<ll, ll> f;
    f.reserve(n * 2 + 1);
    f[0] = 1;
    while (n--) {
        cin >> x;
        s += x;
        auto it = f.find(s - k);
        if (it != f.end())
            ans += it->second;
        ++f[s];
    }
    cout << ans << '\n';
}

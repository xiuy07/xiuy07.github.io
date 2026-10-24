#include <algorithm>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(6 3
3 2 2 4 1 4
)SAMPLE");
    ios::sync_with_stdio(false);
    input.tie(nullptr);
    int n, d;
    input >> n >> d;
    vector<ll> a(n);
    ll l = 0, r = 0;
    for (auto &x : a) {
        input >> x;
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

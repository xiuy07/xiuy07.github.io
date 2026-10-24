#include <algorithm>
#include <climits>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(5
9 5 2
-6 3 4
9 0 0
9 0 0
-8 0 0
)SAMPLE");
    ios::sync_with_stdio(false);
    input.tie(nullptr);
    int n;
    input >> n;
    vector<ll> a(n + 1), down(n + 1);
    vector<int> l(n + 1), r(n + 1);
    for (int i = 1; i <= n; ++i)
        input >> a[i] >> l[i] >> r[i];
    vector<int> order{1};
    for (size_t i = 0; i < order.size(); ++i) {
        int u = order[i];
        if (l[u])
            order.push_back(l[u]);
        if (r[u])
            order.push_back(r[u]);
    }
    ll ans = LLONG_MIN;
    for (auto it = order.rbegin(); it != order.rend(); ++it) {
        int u = *it;
        ll x = max(0LL, down[l[u]]), y = max(0LL, down[r[u]]);
        ans = max(ans, a[u] + x + y);
        down[u] = a[u] + max(x, y);
    }
    cout << ans << '\n';
}

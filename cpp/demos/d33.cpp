#include <iostream>
#include <sstream>
#include <unordered_map>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(5 4
1 3 2 2 4
)SAMPLE");
    ios::sync_with_stdio(false);
    input.tie(nullptr);
    int n;
    ll k, x, ans = 0;
    input >> n >> k;
    unordered_map<ll, ll> f;
    f.reserve(n * 2 + 1);
    while (n--) {
        input >> x;
        auto it = f.find(k - x);
        if (it != f.end())
            ans += it->second;
        ++f[x];
    }
    cout << ans << '\n';
}

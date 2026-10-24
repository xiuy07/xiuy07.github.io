#include <iostream>
#include <sstream>
#include <unordered_map>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(4 2
1 -1 1 1
)SAMPLE");
    ios::sync_with_stdio(false);
    input.tie(nullptr);
    int n;
    ll k, s = 0, ans = 0, x;
    input >> n >> k;
    unordered_map<ll, ll> f;
    f.reserve(n * 2 + 1);
    f[0] = 1;
    while (n--) {
        input >> x;
        s += x;
        auto it = f.find(s - k);
        if (it != f.end())
            ans += it->second;
        ++f[s];
    }
    cout << ans << '\n';
}

#include <algorithm>
#include <climits>
#include <iostream>
#include <sstream>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(5
7 9
-10 -6
-2 0
0 2
-2 -1
)SAMPLE");
    int n;
    input >> n;
    vector<pair<ll, ll>> v;
    while (n--) {
        ll s, e;
        input >> s >> e;
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

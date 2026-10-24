#include <algorithm>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(8
10 9 2 5 3 7 101 18
)SAMPLE");
    ios::sync_with_stdio(false);
    input.tie(nullptr);
    int n;
    input >> n;
    vector<ll> t;
    while (n--) {
        ll x;
        input >> x;
        auto it = lower_bound(t.begin(), t.end(), x);
        if (it == t.end())
            t.push_back(x);
        else
            *it = x;
    }
    cout << t.size() << '\n';
}

#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    unordered_map<ll, int> f;
    while (n--) {
        ll x;
        cin >> x;
        ++f[x];
    }
    using P = pair<int, ll>;
    priority_queue<P, vector<P>, greater<P>> q;
    for (auto [x, c] : f) {
        q.push({c, -x});
        if ((int)q.size() > k)
            q.pop();
    }
    vector<P> v;
    while (!q.empty()) {
        v.push_back(q.top());
        q.pop();
    }
    reverse(v.begin(), v.end());
    for (int i = 0; i < k; ++i)
        cout << (i ? " " : "") << -v[i].second;
    cout << '\n';
}

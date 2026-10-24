#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    priority_queue<ll> lo;
    priority_queue<ll, vector<ll>, greater<ll>> hi;
    while (n--) {
        ll x;
        cin >> x;
        if (lo.empty() || x <= lo.top())
            lo.push(x);
        else
            hi.push(x);
        if (lo.size() > hi.size() + 1) {
            hi.push(lo.top());
            lo.pop();
        }
        if (lo.size() < hi.size()) {
            lo.push(hi.top());
            hi.pop();
        }
        cout << lo.top() << '\n';
    }
}

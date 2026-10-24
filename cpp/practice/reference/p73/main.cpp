#include <deque>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<ll> a(n);
    deque<int> q;
    bool first = true;
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
        while (!q.empty() && q.front() <= i - k)
            q.pop_front();
        while (!q.empty() && a[q.back()] <= a[i])
            q.pop_back();
        q.push_back(i);
        if (i >= k - 1) {
            if (!first)
                cout << ' ';
            first = false;
            cout << a[q.front()];
        }
    }
    cout << '\n';
}

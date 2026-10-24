#include <deque>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(8 3
1 3 -1 -3 5 3 6 7
)SAMPLE");
    ios::sync_with_stdio(false);
    input.tie(nullptr);
    int n, k;
    input >> n >> k;
    vector<ll> a(n);
    deque<int> q;
    bool first = true;
    for (int i = 0; i < n; ++i) {
        input >> a[i];
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

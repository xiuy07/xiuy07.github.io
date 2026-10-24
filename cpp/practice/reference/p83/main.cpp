#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int n, x;
    cin >> n >> x;
    vector<int> a(n);
    for (auto &c : a)
        cin >> c;
    const int INF = 1000000000;
    vector<int> d(x + 1, INF);
    d[0] = 0;
    for (int s = 1; s <= x; ++s)
        for (int c : a)
            if (c <= s)
                d[s] = min(d[s], d[s - c] + 1);
    cout << (d[x] == INF ? -1 : d[x]) << '\n';
}

#include <cstdlib>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    int s = 0;
    for (auto &x : a) {
        cin >> x;
        s += x;
    }
    if (abs(k) > s || (s + k) % 2) {
        cout << 0 << '\n';
        return 0;
    }
    int t = (s + k) / 2;
    vector<ll> d(t + 1);
    d[0] = 1;
    for (int x : a)
        for (int j = t; j >= x; --j)
            d[j] += d[j - x];
    cout << d[t] << '\n';
}

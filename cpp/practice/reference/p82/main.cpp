#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int n, c;
    cin >> n >> c;
    vector<ll> d(c + 1);
    while (n--) {
        int w;
        ll v;
        cin >> w >> v;
        for (int j = c; j >= w; --j)
            d[j] = max(d[j], d[j - w] + v);
    }
    cout << d[c] << '\n';
}

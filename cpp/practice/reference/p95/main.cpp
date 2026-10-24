#include <iostream>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> q;
    const ll M = 1000000007;
    while (q--) {
        ll a, b, r = 1;
        cin >> a >> b;
        a %= M;
        while (b) {
            if (b & 1)
                r = r * a % M;
            a = a * a % M;
            b >>= 1;
        }
        cout << r << '\n';
    }
}

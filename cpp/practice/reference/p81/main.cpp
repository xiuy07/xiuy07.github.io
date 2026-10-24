#include <algorithm>
#include <iostream>
using namespace std;
using ll = long long;
int main() {
    int n;
    cin >> n;
    ll prev2 = 0, prev1 = 0;
    while (n--) {
        ll x;
        cin >> x;
        ll cur = max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    cout << prev1 << '\n';
}

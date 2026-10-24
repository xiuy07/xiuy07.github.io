#include <iostream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int h, w;
    cin >> h >> w;
    const ll M = 1000000007;
    vector<ll> d(w + 1);
    d[1] = 1;
    for (int i = 1; i <= h; ++i) {
        string s;
        cin >> s;
        for (int j = 1; j <= w; ++j) {
            if (s[j - 1] == '*')
                d[j] = 0;
            else
                d[j] = (d[j] + d[j - 1]) % M;
        }
    }
    cout << d[w] << '\n';
}

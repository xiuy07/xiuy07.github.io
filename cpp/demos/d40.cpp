#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(3 3
...
*..
...
)SAMPLE");
    int h, w;
    input >> h >> w;
    const ll M = 1000000007;
    vector<ll> d(w + 1);
    d[1] = 1;
    for (int i = 1; i <= h; ++i) {
        string s;
        input >> s;
        for (int j = 1; j <= w; ++j) {
            if (s[j - 1] == '*')
                d[j] = 0;
            else
                d[j] = (d[j] + d[j - 1]) % M;
        }
    }
    cout << d[w] << '\n';
}

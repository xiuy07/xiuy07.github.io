#include <algorithm>
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    // 固定样例输入；可改这里观察不同边界。
    istringstream input(R"SAMPLE(3 5
8 15
4 29
3 5
)SAMPLE");
    int n, c;
    input >> n >> c;
    vector<ll> d(c + 1);
    while (n--) {
        int w;
        ll v;
        input >> w >> v;
        for (int j = c; j >= w; --j)
            d[j] = max(d[j], d[j - w] + v);
    }
    cout << d[c] << '\n';
}

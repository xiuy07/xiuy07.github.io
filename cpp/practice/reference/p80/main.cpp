#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    string a, b;
    getline(cin, a);
    getline(cin, b);
    int m = b.size();
    vector<int> prev(m + 1), cur(m + 1);
    iota(prev.begin(), prev.end(), 0);
    for (int i = 1; i <= (int)a.size(); ++i) {
        cur[0] = i;
        for (int j = 1; j <= m; ++j)
            cur[j] = min(
                {prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] != b[j - 1])});
        swap(cur, prev);
    }
    cout << prev[m] << '\n';
}

#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    string a, b;
    getline(cin, a);
    getline(cin, b);
    int m = b.size();
    vector<int> p(m + 1), c(m + 1);
    for (char x : a) {
        c[0] = 0;
        for (int j = 1; j <= m; ++j)
            c[j] = x == b[j - 1] ? p[j - 1] + 1 : max(p[j], c[j - 1]);
        swap(p, c);
    }
    cout << p[m] << '\n';
}

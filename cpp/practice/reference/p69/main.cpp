#include <iostream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int h, w, q;
    cin >> h >> w >> q;
    vector<vector<int>> s(h + 1, vector<int>(w + 1));
    for (int i = 1; i <= h; ++i) {
        string row;
        cin >> row;
        for (int j = 1; j <= w; ++j)
            s[i][j] = (row[j - 1] == '*') + s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1];
    }
    while (q--) {
        int a, b, c, d;
        cin >> a >> b >> c >> d;
        cout << s[c][d] - s[a - 1][d] - s[c][b - 1] + s[a - 1][b - 1] << '\n';
    }
}

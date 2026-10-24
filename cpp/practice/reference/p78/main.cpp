#include <iostream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;
int h, w;
vector<string> g;
string s;
bool used[6][6];
int dx[] = {1, -1, 0, 0}, dy[] = {0, 0, 1, -1};
bool dfs(int x, int y, int i) {
    if (x < 0 || x >= h || y < 0 || y >= w || used[x][y] || g[x][y] != s[i])
        return false;
    if (i + 1 == (int)s.size())
        return true;
    used[x][y] = true;
    bool ok = false;
    for (int k = 0; k < 4; ++k)
        if (dfs(x + dx[k], y + dy[k], i + 1)) {
            ok = true;
            break;
        }
    used[x][y] = false;
    return ok;
}
int main() {
    cin >> h >> w;
    g.resize(h);
    for (auto &r : g)
        cin >> r;
    cin >> s;
    bool ok = false;
    if ((int)s.size() <= h * w)
        for (int i = 0; i < h; ++i)
            for (int j = 0; j < w; ++j)
                ok = ok || dfs(i, j, 0);
    cout << (ok ? "YES" : "NO") << '\n';
}

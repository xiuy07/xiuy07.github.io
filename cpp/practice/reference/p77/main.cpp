#include <iostream>
using namespace std;
using ll = long long;
int n;
ll ans = 0;
bool col[12], d1[25], d2[25];
void dfs(int r) {
    if (r == n) {
        ++ans;
        return;
    }
    for (int c = 0; c < n; ++c) {
        int x = r - c + n, y = r + c;
        if (col[c] || d1[x] || d2[y])
            continue;
        col[c] = d1[x] = d2[y] = true;
        dfs(r + 1);
        col[c] = d1[x] = d2[y] = false;
    }
}
int main() {
    cin >> n;
    dfs(0);
    cout << ans << '\n';
}

#include <deque>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
using ll = long long;
int main() {
    int h, w;
    cin >> h >> w;
    vector<string> g(h);
    for (auto &s : g)
        cin >> s;
    const int INF = 1000000000;
    vector<int> d(h * w, INF);
    deque<pair<int, int>> q;
    d[0] = 0;
    q.push_back({0, 0});
    int dx[] = {1, -1, 0, 0}, dy[] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [u, z] = q.front();
        q.pop_front();
        if (z != d[u])
            continue;
        int x = u / w, y = u % w;
        for (int k = 0; k < 4; ++k) {
            int a = x + dx[k], b = y + dy[k];
            if (a < 0 || a >= h || b < 0 || b >= w)
                continue;
            int v = a * w + b, c = g[a][b] - '0';
            if (d[v] > z + c) {
                d[v] = z + c;
                if (c)
                    q.push_back({v, d[v]});
                else
                    q.push_front({v, d[v]});
            }
        }
    }
    cout << d.back() << '\n';
}

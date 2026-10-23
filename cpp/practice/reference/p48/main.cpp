#include "../../../algorithms/dsa.hpp"
#include <iostream>
#include <unordered_map>
using namespace std;
using namespace study;
template <class T> void output(const vector<T> &a) {
    for (size_t i = 0; i < a.size(); ++i) {
        if (i)
            cout << ' ';
        cout << a[i];
    }
    cout << '\n';
}
vector<i64> read_array(int n) {
    vector<i64> a(n);
    for (auto &x : a)
        cin >> x;
    return a;
}
int main() {
    int n;
    cin >> n;
    auto a = read_array(n);
    unordered_map<i64, int> count;
    for (auto x : a)
        ++count[x];
    for (int i = 0; i < n; ++i)
        if (count[a[i]] == 1) {
            cout << i << '\n';
            return 0;
        }
    cout << -1 << '\n';
}

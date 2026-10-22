#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>
#include <memory>
#include <utility>
#include <map>
#include <unordered_map>
#include <list>
#include <stdexcept>
#include <sstream>
#include <limits>
#include <type_traits>
#include <optional>
#include <variant>
#include <array>
using namespace std;
int main() {
    int n;
    long long target;
    cin>>n>>target;
    unordered_map<long long,int>first;
    for(int j=0; j<n; ++j) {
        long long x;
        cin>>x;
        auto it=first.find(target-x);
        if(it!=first.end()) {
            cout<<it->second<<' '<<j<<'\n';
            return 0;
        }
        first.emplace(x,j);
    }
    cout<<"-1 -1\n";
}

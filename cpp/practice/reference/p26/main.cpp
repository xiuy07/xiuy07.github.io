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
    cin>>n;
    map<string,int>freq;
    while(n--) {
        string s;
        cin>>s;
        ++freq[s];
    }
    vector<pair<string,int>>a(freq.begin(),freq.end());
    sort(a.begin(),a.end(),[](const auto&x,const auto&y) {
        if(x.second!=y.second)return x.second>y.second; return x.first<y.first;
    });
    cout<<a.size()<<'\n';
    for(const auto&[s,c]:a)cout<<s<<' '<<c<<'\n';
}

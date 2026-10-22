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
#include "solution.hpp"
int main() {
    int n,l,r;
    cin>>n>>l>>r;
    vector<long long>a(n+1,1234567890123LL);
    for(int i=0; i<n; ++i)cin>>a[i];
    reverse_segment(a.data()+l,a.data()+r);
    if(a[n]!=1234567890123LL) {
        cout<<"GUARD_CHANGED\n";
        return 0;
    }
    for(int i=0; i<n; ++i) {
        if(i)cout<<' ';
        cout<<a[i];
    }
    cout<<'\n';
}

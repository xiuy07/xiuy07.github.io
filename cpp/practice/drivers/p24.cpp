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
static_assert(is_same_v<decltype(clamp_value(1,0,2)),int>);
int main() {
    char t;
    cin>>t;
    if(t=='I') {
        long long x,lo,hi;
        cin>>x>>lo>>hi;
        cout<<clamp_value(x,lo,hi)<<'\n';
    }
    else {
        string x,lo,hi;
        cin>>x>>lo>>hi;
        cout<<clamp_value(x,lo,hi)<<'\n';
    }
}

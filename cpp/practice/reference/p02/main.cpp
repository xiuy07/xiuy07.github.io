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
    long long x;
    cin>>x;
    long long lo=x,hi=x,s=x;
    for(int i=1; i<n; ++i) {
        cin>>x;
        lo=min(lo,x);
        hi=max(hi,x);
        s+=x;
    }
    cout<<lo<<' '<<hi<<' '<<s<<'\n';
}

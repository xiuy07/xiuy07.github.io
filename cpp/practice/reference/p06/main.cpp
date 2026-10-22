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
    int L,m;
    cin>>L>>m;
    vector<int>d(L+2);
    while(m--) {
        int l,r;
        cin>>l>>r;
        ++d[l];
        --d[r+1];
    }
    int cover=0,ans=0;
    for(int x=0; x<=L; ++x) {
        cover+=d[x];
        if(!cover)++ans;
    }
    cout<<ans<<'\n';
}

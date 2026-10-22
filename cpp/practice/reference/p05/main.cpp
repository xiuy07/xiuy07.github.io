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
    vector<long long>a(n);
    for(auto&x:a)cin>>x;
    int k=0;
    for(int i=0; i<n; ++i)if(k==0||a[i]!=a[k-1])a[k++]=a[i];
    cout<<k<<'\n';
    for(int i=0; i<k; ++i) {
        if(i)cout<<' ';
        cout<<a[i];
    }
    cout<<'\n';
}

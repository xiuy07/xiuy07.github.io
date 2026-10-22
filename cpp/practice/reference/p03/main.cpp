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
long long gcd_value(long long a,long long b) {
    if(a<0)a=-a;
    if(b<0)b=-b;
    while(b) {
        long long r=a%b;
        a=b;
        b=r;
    }
    return a;
}
int main() {
    long long a,b;
    cin>>a>>b;
    cout<<gcd_value(a,b)<<'\n';
}

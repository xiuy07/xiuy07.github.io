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
long long divide(long long a,long long b) {
    if(!b)throw domain_error("zero");
    return a/b;
}
int main() {
    int q;
    cin>>q;
    while(q--) {
        long long a,b;
        cin>>a>>b;
        try {
            cout<<divide(a,b)<<'\n';
        }
        catch(const domain_error&) {
            cout<<"ERROR\n";
        }
    }
}

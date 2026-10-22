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
    long long sum=0,x;
    for(int i=0; i<n; ++i) {
        cin>>x;
        sum+=x;
    }
    cout<<sum<<'\n';
}

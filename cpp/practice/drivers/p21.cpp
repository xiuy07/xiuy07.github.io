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
    long long a,b,c,d;
    cin>>a>>b>>c>>d;
    const Rational x(a,b),y(c,d);
    ostringstream out;
    out<<(x+y)<<'\n'<<(x-y)<<'\n'<<(x<y)<<'\n';
    cout<<out.str();
}

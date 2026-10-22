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
static_assert(is_same_v<decltype(++declval<StepCounter&>()),StepCounter&>);
static_assert(is_same_v<decltype(declval<StepCounter&>()++),StepCounter>);
int main() {
    int x;
    cin>>x;
    StepCounter c(x);
    StepCounter old=c++;
    cout<<old.value()<<' '<<c.value()<<'\n';
    StepCounter& ref=++c;
    cout<<ref.value()<<' '<<(&ref==&c)<<'\n';
}

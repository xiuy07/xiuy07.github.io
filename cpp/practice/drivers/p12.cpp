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
void nested(int n) {
    if(!n)return;
    Tracer current(n);
    nested(n-1);
}
int main() {
    int n;
    cin>>n;
    nested(n);
}

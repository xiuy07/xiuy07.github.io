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
    int x,k;
    cin>>x>>k;
    unique_ptr<Record>a=make_unique<ValueRecord>(x);
    auto b=a->clone();
    for(int i=0; i<k; ++i)b->bump();
    cout<<a->value()<<'\n'<<b->value()<<'\n';
    a.reset();
    cout<<b->value()<<'\n';
}

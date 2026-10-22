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
static_assert(!is_copy_constructible_v<MoveBox>);
static_assert(!is_copy_assignable_v<MoveBox>);
static_assert(is_nothrow_move_constructible_v<MoveBox>);
static_assert(is_nothrow_move_assignable_v<MoveBox>);
int main() {
    int a,b;
    cin>>a>>b;
    MoveBox x(a),y(b);
    y=move(x);
    cout<<x.empty()<<' '<<y.get()<<'\n';
    MoveBox z(move(y));
    cout<<y.empty()<<' '<<z.get()<<'\n';
    z=move(z);
    cout<<z.get()<<'\n';
}

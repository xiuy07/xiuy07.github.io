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
static_assert(has_virtual_destructor_v<Shape>);
int main() {
    int n;
    cin>>n;
    vector<unique_ptr<Shape>> shapes;
    while(n--) {
        char t;
        long long a,b;
        cin>>t>>a;
        if(t=='R') {
            cin>>b;
            shapes.push_back(make_unique<Rect>(a,b));
        }
        else shapes.push_back(make_unique<Square>(a));
    }
    long long total=0;
    for(const auto& s:shapes) {
        const Shape& view=*s;
        long long v=view.area();
        cout<<v<<'\n';
        total+=v;
    }
    cout<<"total "<<total<<'\n';
}

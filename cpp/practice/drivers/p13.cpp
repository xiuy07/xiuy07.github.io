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
static_assert(is_nothrow_move_constructible_v<Buffer>);
static_assert(is_nothrow_move_assignable_v<Buffer>);
void print(const Buffer& b) {
    for(size_t i=0; i<b.size(); ++i) {
        if(i)cout<<' ';
        cout<<b.get(i);
    }
    cout<<'\n';
}
int main() {
    int n;
    cin>>n;
    Buffer a(n);
    for(int i=0,x; i<n; ++i) {
        cin>>x;
        a.set(i,x);
    }
    int pos,value;
    cin>>pos>>value;
    Buffer b=a;
    b.set(pos,value);
    b=b;
    Buffer c(0);
    c=b;
    print(a);
    print(b);
    Buffer d=std::move(c);
    if(d.size()) {
        int old=b.get(0);
        d.set(0,d.get(0)+1);
        if(b.get(0)!=old) {
            cout<<"SHARED_COPY\n";
            return 0;
        }
        d.set(0,d.get(0)-1);
    }
    cout<<c.size()<<' '<<d.size()<<'\n';
    print(d);
    Buffer empty(0);
    Buffer copy=empty;
    if(copy.size()!=0)cout<<"BAD_EMPTY\n";
}

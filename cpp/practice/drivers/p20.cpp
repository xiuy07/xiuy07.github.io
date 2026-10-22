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
    int n;
    cin>>n;
    while(n--) {
        char type;
        cin>>type;
        unique_ptr<Report>r;
        if(type=='T') {
            string s;
            cin>>s;
            r=make_unique<TextReport>(s);
        }
        else {
            long long x;
            cin>>x;
            r=make_unique<NumberReport>(x);
        }
        ostringstream out;
        const Report& view=*r;
        out<<view;
        cout<<out.str()<<'\n';
    }
}

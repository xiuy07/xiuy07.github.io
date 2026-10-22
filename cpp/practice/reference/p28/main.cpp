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
    int q;
    cin>>q;
    optional<variant<long long,string>>state;
    while(q--) {
        string op;
        cin>>op;
        if(op=="INT") {
            long long x;
            cin>>x;
            state=x;
        }
        else if(op=="TEXT") {
            string x;
            cin>>x;
            state=x;
        }
        else if(op=="CLEAR")state.reset();
        else if(op=="ADD") {
            long long x;
            cin>>x;
            if(!state)cout<<"EMPTY\n";
            else if(auto p=get_if<long long>(&*state))*p+=x;
            else cout<<"TYPE_ERROR\n";
        }
        else {
            if(!state)cout<<"EMPTY\n";
            else if(auto p=get_if<long long>(&*state))cout<<"I "<<*p<<'\n';
            else cout<<"S "<<get<string>(*state)<<'\n';
        }
    }
}

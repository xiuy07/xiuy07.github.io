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
template<class T>void run(int q) {
    Stack<T>s;
    while(q--) {
        string op;
        cin>>op;
        try {
            if(op=="push") {
                T x;
                cin>>x;
                s.push(x);
            }
            else if(op=="pop")cout<<s.pop()<<'\n';
            else if(op=="top") {
                const Stack<T>&v=s;
                cout<<v.top()<<'\n';
            }
            else cout<<s.size()<<'\n';
        }
        catch(const out_of_range&) {
            cout<<"EMPTY\n";
        }
    }
}
int main() {
    char t;
    int q;
    cin>>t>>q;
    if(t=='I')run<long long>(q);
    else run<string>(q);
}

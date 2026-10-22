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
class MinStack {
    vector<pair<long long,long long>>a_;
    public:bool empty()const {
        return a_.empty();
    }
    void push(long long x) {
        a_.push_back( {
            x,a_.empty()?x:min(x,a_.back().second)
        });
    }
    long long top()const {
        return a_.back().first;
    }
    long long minimum()const {
        return a_.back().second;
    }
    void pop() {
        a_.pop_back();
    }
};
int main() {
    int q;
    cin>>q;
    MinStack s;
    while(q--) {
        string op;
        cin>>op;
        if(op=="push") {
            long long x;
            cin>>x;
            s.push(x);
        }
        else if(s.empty())cout<<"EMPTY\n";
        else if(op=="min")cout<<s.minimum()<<'\n';
        else {
            cout<<s.top()<<'\n';
            if(op=="pop")s.pop();
        }
    }
}

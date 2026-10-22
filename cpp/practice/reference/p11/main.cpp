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
class Account {
    long long balance_;
    public:explicit Account(long long x):balance_(x) {
    }
    bool deposit(long long x) {
        if(x<0)return false;
        balance_+=x;
        return true;
    }
    bool withdraw(long long x) {
        if(x<0||x>balance_)return false;
        balance_-=x;
        return true;
    }
    long long balance()const {
        return balance_;
    }
};
int main() {
    long long initial;
    int q;
    cin>>initial>>q;
    Account a(initial);
    while(q--) {
        string op;
        cin>>op;
        if(op=="balance")cout<<a.balance()<<'\n';
        else {
            long long x;
            cin>>x;
            bool ok=op=="deposit"?a.deposit(x):a.withdraw(x);
            cout<<(ok?"OK":"REJECT")<<'\n';
        }
    }
}

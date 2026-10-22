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
    Counter c(x);
    const Counter& view=c;
    cout<<view.get()<<'\n';
    for(int i=0; i<k; ++i)c.inc();
    cout<<view.get()<<'\n'<<view.reads()<<'\n';
    Counter other(0);
    if(other.reads()!=0)cout<<"SHARED_STATE\n";
}

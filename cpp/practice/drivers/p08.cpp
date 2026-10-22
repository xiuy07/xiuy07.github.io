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
    int check[1][2]= {
        {
            2,3
        }
    };
    if(row_sums(check)[0]!=5) {
        cout<<"WRONG_GENERIC_SIZE\n";
        return 0;
    }
    int a[3][4];
    for(auto& row:a)for(int& x:row)cin>>x;
    const auto result=row_sums(a);
    for(int i=0; i<3; ++i) {
        if(i)cout<<' ';
        cout<<result[i];
    }
    cout<<'\n';
}

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
    string p;
    getline(cin,p);
    int n;
    cin>>n;
    cin.ignore(numeric_limits<streamsize>::max(),'\n');
    int count=0;
    for(int i=0; i<n; ++i) {
        string s;
        getline(cin,s);
        if(s.size()>=p.size()&&s.compare(0,p.size(),p)==0)++count;
    }
    cout<<count<<'\n';
}

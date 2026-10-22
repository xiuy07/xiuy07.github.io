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
    cout<<Live::alive()<<'\n';
    {
        Live outer;
        cout<<Live::alive()<<'\n';
        {
            vector<unique_ptr<Live>> a;
            for(int i=0; i<n; ++i)a.push_back(make_unique<Live>(outer));
            if(n)*a[0]=*a[0];
            cout<<Live::alive()<<'\n';
        }
        cout<<Live::alive()<<'\n';
    }
    cout<<Live::alive()<<'\n';
}

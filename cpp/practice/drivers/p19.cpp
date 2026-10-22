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
    int a,b;
    cin>>a>>b;
    Assistant x(a);
    Person*p=static_cast<Student*>(&x);
    Person*q=static_cast<Worker*>(&x);
    cout<<p->id<<' '<<q->id<<'\n';
    p->id=b;
    cout<<p->id<<' '<<q->id<<'\n'<<(p==q)<<'\n';
    Student s(a);
    Worker w(b);
    if(s.id!=a||w.id!=b)cout<<"BAD_DIRECT\n";
}

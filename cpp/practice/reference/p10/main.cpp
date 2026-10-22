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
struct Node {
    long long v;
    Node*next;
};
Node*read_list(int n) {
    Node dummy {
        0,nullptr
    };
    Node*t=&dummy;
    while(n--) {
        long long x;
        cin>>x;
        t->next=new Node {
            x,nullptr
        };
        t=t->next;
    }
    return dummy.next;
}
int main() {
    int n,m;
    cin>>n>>m;
    Node*a=read_list(n),*b=read_list(m);
    Node dummy {
        0,nullptr
    };
    Node*t=&dummy;
    while(a&&b) {
        Node*&p=(a->v<=b->v)?a:b;
        t->next=p;
        p=p->next;
        t=t->next;
    }
    t->next=a?a:b;
    Node*p=dummy.next;
    bool first=true;
    while(p) {
        if(!first)cout<<' ';
        first=false;
        cout<<p->v;
        Node*next=p->next;
        delete p;
        p=next;
    }
    cout<<'\n';
}

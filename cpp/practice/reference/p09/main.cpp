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
    long long value;
    Node*next;
};
int main() {
    int n;
    cin>>n;
    Node*head=nullptr,*tail=nullptr;
    for(int i=0; i<n; ++i) {
        long long x;
        cin>>x;
        Node*p=new Node {
            x,nullptr
        };
        if(tail)tail->next=p;
        else head=p;
        tail=p;
    }
    Node*prev=nullptr;
    while(head) {
        Node*next=head->next;
        head->next=prev;
        prev=head;
        head=next;
    }
    bool first=true;
    while(prev) {
        if(!first)cout<<' ';
        first=false;
        cout<<prev->value;
        Node*next=prev->next;
        delete prev;
        prev=next;
    }
    cout<<'\n';
}

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
class LRU {
    using Items=list<pair<long long,long long>>;
    size_t cap_;
    Items items_;
    unordered_map<long long,Items::iterator>index_;
    public:explicit LRU(size_t c):cap_(c) {
    }
    LRU(const LRU&)=delete;
    LRU&operator=(const LRU&)=delete;
    long long get(long long k) {
        auto it=index_.find(k);
        if(it==index_.end())return -1;
        items_.splice(items_.begin(),items_,it->second);
        return it->second->second;
    }
    void put(long long k,long long v) {
        if(!cap_)return;
        auto it=index_.find(k);
        if(it!=index_.end()) {
            it->second->second=v;
            items_.splice(items_.begin(),items_,it->second);
            return;
        }
        items_.push_front( {
            k,v
        });
        index_[k]=items_.begin();
        if(items_.size()>cap_) {
            index_.erase(items_.back().first);
            items_.pop_back();
        }
    }
};
int main() {
    int capacity,q;
    cin>>capacity>>q;
    LRU cache(capacity);
    while(q--) {
        string op;
        long long k,v;
        cin>>op>>k;
        if(op=="get")cout<<cache.get(k)<<'\n';
        else {
            cin>>v;
            cache.put(k,v);
        }
    }
}

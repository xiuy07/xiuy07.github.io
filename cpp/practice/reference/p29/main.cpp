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
    int n;
    cin>>n;
    vector<long long>h(n+1);
    for(int i=0; i<n; ++i)cin>>h[i];
    vector<int>st;
    long long ans=0;
    for(int j=0; j<=n; ++j) {
        while(!st.empty()&&h[st.back()]>=h[j]) {
            long long v=h[st.back()];
            st.pop_back();
            int left=st.empty()?-1:st.back();
            ans=max(ans,v*(j-left-1));
        }
        st.push_back(j);
    }
    cout<<ans<<'\n';
}

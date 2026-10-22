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
    int H,W;
    while(cin>>H>>W) {
        if(!H&&!W)break;
        vector<int>h(W+1),st;
        int ans=0;
        for(int i=0; i<H; ++i) {
            string row;
            cin>>row;
            for(int j=0; j<W; ++j)h[j]=row[j]=='.'?h[j]+1:0;
            st.clear();
            for(int j=0; j<=W; ++j) {
                while(!st.empty()&&h[st.back()]>=h[j]) {
                    int v=h[st.back()];
                    st.pop_back();
                    int left=st.empty()?-1:st.back();
                    ans=max(ans,v*(j-left-1));
                }
                st.push_back(j);
            }
        }
        cout<<ans<<'\n';
    }
}

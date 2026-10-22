#include <algorithm>
#include <iostream>
#include <vector>
int main() {
    std::vector<int> h={2,3,1,0}, st;
    int ans=0;
    for(int j=0;j<static_cast<int>(h.size());++j) {
        while(!st.empty() && h[st.back()]>=h[j]) {
            int value=h[st.back()]; st.pop_back();
            int left=st.empty()?-1:st.back();
            int width=j-left-1;
            std::cout << value << ' ' << left << ' ' << width << '\n';
            ans=std::max(ans,value*width);
        }
        st.push_back(j);
    }
    std::cout << "area " << ans << '\n';
}

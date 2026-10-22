#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
int main() {
    std::vector<std::pair<int,int>> st;
    for(int x:{4,2,2,7}) {
        int m=st.empty()?x:std::min(x,st.back().second);
        st.push_back({x,m});
    }
    std::cout << st.back().second << '\n';
    st.pop_back(); st.pop_back();
    std::cout << st.back().second << '\n';
}

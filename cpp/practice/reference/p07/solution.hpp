#pragma once
#include <utility>
inline void reverse_segment(long long* first,long long* last) {
    while(first!=last) {
        --last;
        if(first==last)break;
        std::swap(*first,*last);
        ++first;
    }
}

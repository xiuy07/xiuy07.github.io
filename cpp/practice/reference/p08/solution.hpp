#pragma once
#include <array>
#include <cstddef>
template<std::size_t R,std::size_t C> std::array<long long,R> row_sums(const int (&a)[R][C]) {
    std::array<long long,R> result {
    };
    for(std::size_t i=0; i<R; ++i)for(std::size_t j=0; j<C; ++j)result[i]+=a[i][j];
    return result;
}

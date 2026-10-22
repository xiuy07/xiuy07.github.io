#pragma once
#include <array>
#include <cstddef>
#include <stdexcept>
template<std::size_t R,std::size_t C> std::array<long long,R> row_sums(const int (&a)[R][C]) {
    (void)a;
    // TODO: 使用 R、C，不要硬编码 3、4。
    throw std::logic_error("TODO p08");
}

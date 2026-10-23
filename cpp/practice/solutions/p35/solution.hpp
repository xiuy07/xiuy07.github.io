#pragma once
#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>
class LinearList {
  public:
    LinearList() = default;
    std::size_t size() const {
        throw std::logic_error("TODO");
    }
    void insert(std::size_t pos, long long x) {
        throw std::logic_error("TODO");
    }
    long long erase(std::size_t pos) {
        throw std::logic_error("TODO");
    }
    long long at(std::size_t pos) const {
        throw std::logic_error("TODO");
    }
};

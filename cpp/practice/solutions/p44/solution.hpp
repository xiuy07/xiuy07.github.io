#pragma once
#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>
class BTree {
  public:
    explicit BTree(int t) {}
    void insert(long long x) {
        throw std::logic_error("TODO");
    }
    bool contains(long long x) const {
        throw std::logic_error("TODO");
    }
    std::vector<long long> inorder() const {
        throw std::logic_error("TODO");
    }
};

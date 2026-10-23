#pragma once
#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>
class CircularQueue {
  public:
    explicit CircularQueue(std::size_t capacity) {}
    std::size_t size() const {
        throw std::logic_error("TODO");
    }
    bool push(long long x) {
        throw std::logic_error("TODO");
    }
    long long front() const {
        throw std::logic_error("TODO");
    }
    long long pop() {
        throw std::logic_error("TODO");
    }
};

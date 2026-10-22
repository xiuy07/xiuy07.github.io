#pragma once
#include <vector>
#include <stdexcept>
template<class T>class Stack {
    std::vector<T>a_;
    public:void push(const T&x) {
        (void)x;
        /* TODO */
    }
    T pop() {
        throw std::out_of_range("TODO");
    }
    const T& top()const {
        throw std::out_of_range("TODO");
    }
    std::size_t size()const {
        return a_.size();
    }
};

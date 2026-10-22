#pragma once
#include <vector>
#include <stdexcept>
#include <utility>
template<class T>class Stack {
    std::vector<T>a_;
    public:void push(const T&x) {
        a_.push_back(x);
    }
    T pop() {
        if(a_.empty())throw std::out_of_range("empty");
        T x=std::move(a_.back());
        a_.pop_back();
        return x;
    }
    const T& top()const {
        if(a_.empty())throw std::out_of_range("empty");
        return a_.back();
    }
    std::size_t size()const {
        return a_.size();
    }
};

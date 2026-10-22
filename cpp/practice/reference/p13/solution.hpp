#pragma once
#include <memory>
#include <utility>
#include <cstddef>
class Buffer {
    std::size_t n_=0;
    std::unique_ptr<int[]> data_;
    public: explicit Buffer(std::size_t n):n_(n),data_(n?std::make_unique<int[]>(n):nullptr) {
    }
    std::size_t size()const {
        return n_;
    }
    int get(std::size_t i)const {
        return data_[i];
    }
    void set(std::size_t i,int x) {
        data_[i]=x;
    }
    Buffer(const Buffer& other):Buffer(other.n_) {
        for(std::size_t i=0; i<n_; ++i)data_[i]=other.data_[i];
    }
    Buffer& operator=(const Buffer& other) {
        if(this!=&other) {
            Buffer copy(other);
            std::swap(n_,copy.n_);
            data_.swap(copy.data_);
        }
        return *this;
    }
    Buffer(Buffer&& other)noexcept:n_(std::exchange(other.n_,0)),data_(std::move(other.data_)) {
    }
    Buffer& operator=(Buffer&& other)noexcept {
        if(this!=&other) {
            data_=std::move(other.data_);
            n_=std::exchange(other.n_,0);
        }
        return *this;
    }
};

#pragma once
#include <memory>
#include <cstddef>
#include <stdexcept>
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
    Buffer(const Buffer&) {
        throw std::logic_error("TODO copy constructor");
    }
    Buffer& operator=(const Buffer&) {
        throw std::logic_error("TODO copy assignment");
    }
    Buffer(Buffer&&) noexcept {
        /* TODO: 转移资源并清空源 */
    }
    Buffer& operator=(Buffer&&) noexcept {
        /* TODO */ return *this;
    }
};

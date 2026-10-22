#pragma once
#include <memory>
#include <utility>
class MoveBox {
    std::unique_ptr<int>p_;
    public:explicit MoveBox(int x):p_(std::make_unique<int>(x)) {
    }
    MoveBox(const MoveBox&)=delete;
    MoveBox& operator=(const MoveBox&)=delete;
    MoveBox(MoveBox&& x)noexcept:p_(std::move(x.p_)) {
    }
    MoveBox& operator=(MoveBox&& x)noexcept {
        if(this!=&x)p_=std::move(x.p_);
        return *this;
    }
    bool empty()const {
        return !p_;
    }
    int get()const {
        return *p_;
    }
};

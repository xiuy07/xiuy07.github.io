#pragma once
#include <memory>
class MoveBox {
    std::unique_ptr<int> p_;
    public: explicit MoveBox(int x):p_(std::make_unique<int>(x)) {
    }
    MoveBox(const MoveBox&)=delete;
    MoveBox& operator=(const MoveBox&)=delete;
    MoveBox(MoveBox&&) noexcept {
        /* TODO */
    }
    MoveBox& operator=(MoveBox&&) noexcept {
        /* TODO */ return *this;
    }
    bool empty()const {
        return !p_;
    }
    int get()const {
        return p_?*p_:0;
    }
};

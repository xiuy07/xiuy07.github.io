#pragma once
class Live {
    inline static int count_=0;
    public:Live() {
        ++count_;
    }
    Live(const Live&) {
        ++count_;
    }
    Live& operator=(const Live&) {
        return *this;
    }
    ~Live() {
        --count_;
    }
    static int alive() {
        return count_;
    }
};

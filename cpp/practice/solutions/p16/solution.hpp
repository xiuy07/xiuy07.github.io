#pragma once
class Live {
    inline static int count_=0;
    public: Live() {
        /* TODO */
    }
    Live(const Live&) {
        /* TODO */
    }
    Live& operator=(const Live&) {
        return *this;
    }
    ~Live() {
        /* TODO */
    }
    static int alive() {
        return count_;
    }
};

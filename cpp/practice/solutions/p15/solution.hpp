#pragma once
class Counter {
    int n_;
    mutable int reads_=0;
    public: explicit Counter(int n):n_(n) {
    }
    void inc() {
        /* TODO */
    }
    int get()const {
        /* TODO */ return n_;
    }
    int reads()const {
        return reads_;
    }
};

#pragma once
class StepCounter {
    int n_;
    public:explicit StepCounter(int n):n_(n) {
    }
    int value()const {
        return n_;
    }
    StepCounter& operator++() {
        ++n_;
        return *this;
    }
    StepCounter operator++(int) {
        StepCounter old=*this;
        ++*this;
        return old;
    }
};

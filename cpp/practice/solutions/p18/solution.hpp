#pragma once
#include <memory>
#include <stdexcept>
struct Record {
    virtual ~Record()=default;
    virtual int value()const=0;
    virtual void bump()=0;
    virtual std::unique_ptr<Record> clone()const=0;
};
class ValueRecord:public Record {
    int x_;
    public:explicit ValueRecord(int x):x_(x) {
    }
    int value()const override {
        return x_;
    }
    void bump()override {
        /* TODO */
    }
    std::unique_ptr<Record> clone()const override {
        throw std::logic_error("TODO clone");
    }
};

#pragma once
struct Shape {
    virtual ~Shape()=default;
    virtual long long area()const=0;
};
class Rect:public Shape {
    long long a_,b_;
    public:Rect(long long a,long long b):a_(a),b_(b) {
    }
    long long area()const override {
        /* TODO */ return 0;
    }
};
class Square:public Shape {
    long long a_;
    public:explicit Square(long long a):a_(a) {
    }
    long long area()const override {
        /* TODO */ return 0;
    }
};

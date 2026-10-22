#pragma once
#include <iostream>
class Tracer {
    int id_;
    public:explicit Tracer(int id):id_(id) {
        std::cout<<'+'<<id_<<'\n';
    }
    ~Tracer() {
        std::cout<<'-'<<id_<<'\n';
    }
    Tracer(const Tracer&)=delete;
    Tracer& operator=(const Tracer&)=delete;
};

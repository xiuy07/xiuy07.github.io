#pragma once
#include <iostream>
class Tracer {
    int id_;
    public: explicit Tracer(int id):id_(id) {
        /* TODO: 输出构造事件 */
    }
    ~Tracer() {
        /* TODO: 输出析构事件 */
    }
    Tracer(const Tracer&)=delete;
    Tracer& operator=(const Tracer&)=delete;
};

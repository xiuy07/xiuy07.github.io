#pragma once
template<class T>T clamp_value(const T&x,const T&lo,const T&hi) {
    if(x<lo)return lo;
    if(hi<x)return hi;
    return x;
}

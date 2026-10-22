#pragma once
#include <numeric>
#include <ostream>
class Rational {
    long long n_,d_;
    public:Rational(long long n,long long d):n_(n),d_(d) {
        if(d_<0) {
            n_=-n_;
            d_=-d_;
        }
        long long g=std::gcd(n_,d_);
        n_/=g;
        d_/=g;
    }
    friend Rational operator+(const Rational&a,const Rational&b) {
        return {
            a.n_*b.d_+b.n_*a.d_,a.d_*b.d_
        };
    }
    friend Rational operator-(const Rational&a,const Rational&b) {
        return {
            a.n_*b.d_-b.n_*a.d_,a.d_*b.d_
        };
    }
    friend bool operator<(const Rational&a,const Rational&b) {
        return a.n_*b.d_<b.n_*a.d_;
    }
    friend std::ostream& operator<<(std::ostream&out,const Rational&r) {
        return out<<r.n_<<'/'<<r.d_;
    }
};

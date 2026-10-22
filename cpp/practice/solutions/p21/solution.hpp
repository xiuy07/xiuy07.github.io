#pragma once
#include <ostream>
class Rational {
    long long n_,d_;
    public:Rational(long long n,long long d):n_(n),d_(d) {
        /* TODO: 规范化 */
    }
    friend Rational operator+(const Rational&a,const Rational&b) {
        (void)b;
        return a;
        /* TODO */
    }
    friend Rational operator-(const Rational&a,const Rational&b) {
        (void)b;
        return a;
        /* TODO */
    }
    friend bool operator<(const Rational&a,const Rational&b) {
        (void)a;
        (void)b;
        return false;
        /* TODO */
    }
    friend std::ostream& operator<<(std::ostream&out,const Rational&r) {
        return out<<r.n_<<'/'<<r.d_;
    }
};

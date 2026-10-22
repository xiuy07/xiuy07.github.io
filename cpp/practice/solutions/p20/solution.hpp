#pragma once
#include <ostream>
#include <string>
class Report {
    protected:virtual void write(std::ostream&)const=0;
    public:virtual ~Report()=default;
    void render(std::ostream& out)const {
        /* TODO: 括号和虚钩子 */ (void)out;
    }
    friend std::ostream& operator<<(std::ostream& out,const Report& r) {
        r.render(out);
        return out;
    }
};
class TextReport:public Report {
    std::string s_;
    void write(std::ostream& out)const override {
        /* TODO */ (void)out;
    }
    public:explicit TextReport(std::string s):s_(s) {
    }
};
class NumberReport:public Report {
    long long n_;
    void write(std::ostream& out)const override {
        /* TODO */ (void)out;
    }
    public:explicit NumberReport(long long n):n_(n) {
    }
};

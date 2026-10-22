#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
struct Student { std::string name; int score; };
int main() {
    std::vector<Student> a={{"Bob",90},{"Amy",90},{"Cid",80}};
    std::sort(a.begin(),a.end(),[](const auto& x,const auto& y) {
        if(x.score!=y.score) return x.score>y.score;
        return x.name<y.name;
    });
    for(const auto& s:a) std::cout << s.name << ' ' << s.score << '\n';
    int n=5;
    auto next=[n]() mutable { return ++n; };
    std::cout << next() << ' ' << next() << ' ' << n << '\n';
}

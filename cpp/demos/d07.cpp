#include <iostream>
#include <vector>
#include <utility>
struct Buffer { std::vector<int> data; };
int main() {
    Buffer a{{2,4,6}};
    Buffer clone=a;
    clone.data[0]=99;
    std::cout << a.data[0] << ' ' << clone.data[0] << '\n';
    Buffer target=std::move(a);
    std::cout << target.data.size() << ' ' << target.data[2] << '\n';
    std::cout << clone.data[0] << '\n';
}

#include <iostream>
#include <type_traits>
int main() {
    int a[2][3]={{1,2,3},{4,5,6}};
    static_assert(std::is_same_v<decltype(a+0), int (*)[3]>);
    int (*row)[3]=a;
    std::cout << (*(row+1))[2] << '\n';
    int& alias=a[0][1];
    alias=20;
    const int* p=&a[0][1];
    std::cout << *p << '\n';
}

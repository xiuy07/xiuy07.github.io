#include <iostream>
void swap_value(int a, int b) { int t=a; a=b; b=t; }
void swap_ref(int& a, int& b) { int t=a; a=b; b=t; }
int main() {
    int x=2, y=9;
    swap_value(x,y);
    std::cout << x << ' ' << y << '\n';
    swap_ref(x,y);
    std::cout << x << ' ' << y << '\n';
}

#include <iostream>
#include <optional>
#include <stdexcept>
struct Guard {
    Guard() { std::cout << "acquire\n"; }
    ~Guard() { std::cout << "release\n"; }
};
void work() { Guard g; throw std::runtime_error("failed"); }
int main() {
    try { work(); }
    catch(const std::exception&) { std::cout << "caught\n"; }
    std::optional<int> result;
    std::cout << result.has_value() << '\n';
}

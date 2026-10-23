# 栈、循环队列与表达式

## 栈顶代表最近尚未完成的任务

栈是后进先出。遇到左括号压栈，遇到右括号时，必须与栈顶的左括号同类型；不能向栈中间寻找一个“看起来匹配”的括号。扫描后栈还非空，说明有未关闭的括号。每个字符进出至多一次，时间 O(n)。同样的嵌套关系也用于函数调用、深度优先搜索与中缀表达式求值。

表达式中还需要区分运算符优先级与括号作用，不能只按出现顺序计算。后缀表达式遇到数字压栈，遇到二元运算先弹右操作数，再弹左操作数；减法和除法会暴露顺序错误。本章先练括号与队列，后缀求值可按这一规则自行扩展。

## 队列与环形数组

队列先进先出，BFS 依赖这个访问次序。环形数组用取模把物理位置接回开头，避免每次出队都搬动整段数组。下面选择 head+size 的表示：有效元素数由 size 记录，下一次写入位置是 `(head+size)%capacity`。空为 size=0，满为 size=capacity，所有容量槽都能使用。

另一种常见表示只存 front/rear，故意空出一个槽区分空满。两种设计都成立，但公式与实际可用容量不同，不能把一种的判满条件套到另一种上。这里要求 capacity>0；空状态读取/出队抛异常，满状态 push 返回 false 且不修改内容。

## 手推检查

容量为 3，依次入队 10、20，出队一次，再入队 30、40。请写出物理数组和逻辑队列。再判断 `([)]` 为什么不能配对。

<details><summary>核对结果</summary>

head=1，size=3，物理槽为 `[40,20,30]`，逻辑队列是 20、30、40。`([)]` 在遇到 ) 时，栈顶是 [，立即失败，不能跳过它寻找 (。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：stack_queue</summary>

```cpp
inline bool valid_brackets(const std::string &s) {
    std::vector<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{')
            st.push_back(c);
        else {
            if (st.empty())
                return false;
            char open = st.back();
            st.pop_back();
            if (!((open == '(' && c == ')') || (open == '[' && c == ']') ||
                  (open == '{' && c == '}')))
                return false;
        }
    }
    return st.empty();
}
class CircularQueue {
    std::vector<i64> data_;
    std::size_t head_ = 0, size_ = 0;

  public:
    explicit CircularQueue(std::size_t capacity) : data_(capacity) {
        if (!capacity)
            throw std::invalid_argument("capacity must be positive");
    }
    std::size_t size() const {
        return size_;
    }
    bool push(i64 x) {
        if (size_ == data_.size())
            return false;
        data_[(head_ + size_) % data_.size()] = x;
        ++size_;
        return true;
    }
    i64 front() const {
        if (!size_)
            throw std::out_of_range("empty");
        return data_[head_];
    }
    i64 pop() {
        i64 x = front();
        head_ = (head_ + 1) % data_.size();
        --size_;
        return x;
    }
};
```

</details>

## 可运行实验

先预测输出，再运行；这里的演示代码直接使用上面的实现。

```cpp
#include "../algorithms/dsa.hpp"
#include <iostream>
using namespace study;
template <class T> void print(const std::vector<T> &a) {
    for (std::size_t i = 0; i < a.size(); ++i) {
        if (i)
            std::cout << ' ';
        std::cout << a[i];
    }
    std::cout << '\n';
}
int main() {
    std::cout << valid_brackets("([])") << ' ' << valid_brackets("([)]") << '\n';
    CircularQueue q(2);
    q.push(1);
    q.push(2);
    std::cout << q.push(3) << ' ' << q.pop() << ' ';
    std::cout << q.push(3) << ' ' << q.front() << ' ' << q.size() << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
1 0
0 1 1 2 2
```

</details>

本机运行：`python practice/judge.py demo d19`。

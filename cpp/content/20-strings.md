# 字符串匹配：KMP 与 Trie

## KMP 的状态不是文本回退位置

朴素匹配失败后可能重新比较许多字符。KMP 用模式串的前缀函数 pi：pi[i] 是 pattern[0..i] 的最长“真前缀且也是后缀”的长度。真前缀不包括整个串本身。失配时 j=pi[j-1]，保留仍可能匹配的前缀长度，文本下标不回退。

以模式 `abab` 为例，pi 为 0、0、1、2。已经匹配 abab 后，末尾 ab 仍可作为下一次匹配的开头，所以找到一次匹配后也要回退到 pi[j-1]，才能发现重叠。构造与扫描的总复杂度 O(n+m)，因为 j 的增加次数与回退总量都受线性推进约束。

不同教材的 next 数组定义可能不同，有的使用 -1，有的表示长度。下面统一使用零起点的 pi 长度定义。空模式在本指南规定为匹配文本的 n+1 个边界，这是一项接口约定。

## Trie 把共同前缀存成共同路径

每条边表示一个字符，沿根到结点的路径代表一个前缀。结点 pass 统计经过它的单词数量，end 统计恰在这里结束的单词数量。插入 app、apple、app 后，app 的 end=2、pass=3。它能区分“完整单词”与“仅仅是前缀”。

固定 26 分支适合小写英文字母，空间为 O(26×结点数)；更大的字符集可考虑映射。不能直接把 UTF-8 的每个字节减去 'a' 当索引。vector 扩容会使引用失效，因此插入新结点前不要保留指向旧 vector 元素的引用供扩容后使用。

## 手推检查

手算 `aaaa` 的 pi，再列出它在 `aaaaa` 的出现位置。插入 app、apple 后，count_word("ap") 和 count_prefix("ap") 分别是多少？

<details><summary>核对结果</summary>

pi 为 0、1、2、3；出现位置为 0、1。ap 不是完整单词，单词次数为 0，前缀次数为 2。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：strings</summary>

```cpp
inline std::vector<int> prefix_function(const std::string &pattern) {
    std::vector<int> pi(pattern.size());
    for (int i = 1; i < static_cast<int>(pattern.size()); ++i) {
        int j = pi[i - 1];
        while (j && pattern[i] != pattern[j])
            j = pi[j - 1];
        if (pattern[i] == pattern[j])
            ++j;
        pi[i] = j;
    }
    return pi;
}
inline std::vector<int> kmp_matches(const std::string &text, const std::string &pattern) {
    std::vector<int> matches;
    if (pattern.empty()) {
        for (int i = 0; i <= static_cast<int>(text.size()); ++i)
            matches.push_back(i);
        return matches;
    }
    auto pi = prefix_function(pattern);
    int j = 0;
    for (int i = 0; i < static_cast<int>(text.size()); ++i) {
        while (j && text[i] != pattern[j])
            j = pi[j - 1];
        if (text[i] == pattern[j])
            ++j;
        if (j == static_cast<int>(pattern.size())) {
            matches.push_back(i - j + 1);
            j = pi[j - 1];
            // 保留重叠匹配。
        }
    }
    return matches;
}
class Trie {
    struct Node {
        std::array<int, 26> next;
        int pass = 0, end = 0;
        Node() {
            next.fill(-1);
        }
    };
    std::vector<Node> nodes_{1};
    int locate(const std::string &s) const {
        int p = 0;
        for (char c : s) {
            p = nodes_[p].next[c - 'a'];
            if (p < 0)
                return -1;
        }
        return p;
    }

  public:
    void add(const std::string &s) {
        int p = 0;
        ++nodes_[p].pass;
        for (char c : s) {
            int k = c - 'a', next = nodes_[p].next[k];
            if (next < 0) {
                next = static_cast<int>(nodes_.size());
                nodes_[p].next[k] = next;
                nodes_.emplace_back();
                // 不保留可能因扩容失效的引用。
            }
            p = next;
            ++nodes_[p].pass;
        }
        ++nodes_[p].end;
    }
    int count_word(const std::string &s) const {
        int p = locate(s);
        return p < 0 ? 0 : nodes_[p].end;
    }
    int count_prefix(const std::string &s) const {
        int p = locate(s);
        return p < 0 ? 0 : nodes_[p].pass;
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
    print(kmp_matches("aaaaa", "aaa"));
    Trie t;
    t.add("app");
    t.add("apple");
    t.add("app");
    std::cout << t.count_word("app") << ' ' << t.count_prefix("app") << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
0 1 2
2 3
```

</details>

本机运行：`python practice/judge.py demo d20`。

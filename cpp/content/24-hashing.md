# 哈希表、线性探测与墓碑

## 哈希函数只决定起点

不同键可以映射到同一位置，这是碰撞，不代表键相等。拉链法把同一桶中的键放进列表；开放寻址则在表内继续探测。装载因子上升会增加查找成本，实际哈希表还需要扩容与重新散列。平均 O(1) 依赖合理散列与负载，最坏情况仍可能退化。

本章选线性探测 `(home+step)%m`，最多查看 m 个槽。为清楚观察探测顺序，表容量固定，不自动扩容，插入返回实际槽号。负键先正规化余数，避免得到负数组下标。

## 必须区分三种槽状态

从未使用的空槽意味着查找链在这里结束；占用槽需要比较键；墓碑表示曾经放过元素，查找还必须继续。若直接把删除槽改成“从未使用”，同一碰撞链中后面的元素就可能永远查不到。

插入可复用第一个墓碑，但不能见到墓碑立即写入，因为后面可能已有同一个键。应继续查重，直到遇到真正空槽或扫描完整圈，再选择复用位置。测试会输出槽号与探测次数，使这种区别可见。

探测次数把成功匹配槽和终止空槽也算一次；扫描满表而失败则为 m 次。这里不把一次查询内部重复运行的辅助查找混入次数，计数由一次实际探测过程定义。

## 手推检查

m=5，插入 1、6、11，删除 6 后查 11，需要经过哪些槽？再插入 16，应复用哪里？

<details><summary>核对结果</summary>

原槽为 1、2、3。查 11 经过 1、墓碑 2、3，共三次。插入 16 查重后复用槽 2；它不会使 11 的查找失效。

</details>

下面片段位于 `study` 命名空间，`i64` 为 `long long`；公共头文件与依赖结构见 `algorithms/dsa.hpp`。直接运行请使用本章完整 demo。

<details><summary>完整 C++17 实现：hashing</summary>

```cpp
class ProbeSet {
    struct Slot {
        int state = 0;
        i64 key = 0;
    };
    // 0 从未使用，1 占用，2 墓碑。
    std::vector<Slot> table_;
    int home(i64 x) const {
        i64 m = static_cast<i64>(table_.size());
        return static_cast<int>((x % m + m) % m);
    }

  public:
    explicit ProbeSet(int capacity) : table_(capacity) {
        if (capacity <= 0)
            throw std::invalid_argument("capacity");
    }
    std::pair<int, int> find(i64 x) const {
        int m = static_cast<int>(table_.size()), start = home(x);
        for (int step = 0; step < m; ++step) {
            int p = (start + step) % m;
            if (table_[p].state == 0)
                return {-1, step + 1};
            if (table_[p].state == 1 && table_[p].key == x)
                return {p, step + 1};
        }
        return {-1, m};
    }
    int insert(i64 x) {
        int m = static_cast<int>(table_.size()), start = home(x), deleted = -1;
        for (int step = 0; step < m; ++step) {
            int p = (start + step) % m;
            if (table_[p].state == 1 && table_[p].key == x)
                return p;
            if (table_[p].state == 2 && deleted < 0)
                deleted = p;
            if (table_[p].state == 0) {
                int target = deleted < 0 ? p : deleted;
                table_[target] = {1, x};
                return target;
            }
        }
        if (deleted >= 0)
            table_[deleted] = {1, x};
        return deleted;
    }
    bool erase(i64 x) {
        int p = find(x).first;
        if (p < 0)
            return false;
        table_[p].state = 2;
        return true;
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
    ProbeSet h(5);
    std::cout << h.insert(1) << ' ' << h.insert(6) << ' ' << h.insert(11) << '\n';
    h.erase(6);
    auto a = h.find(11);
    std::cout << a.first << ' ' << a.second << '\n';
    std::cout << h.insert(16) << '\n';
    auto b = h.find(6);
    std::cout << b.first << ' ' << b.second << '\n';
}
```

<details><summary>查看示例输出</summary>

```text
1 2 3
3 3
2
-1 4
```

</details>

本机运行：`python practice/judge.py demo d24`。

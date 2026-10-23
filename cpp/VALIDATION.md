# 验证记录

验证日期：2026-10-23。环境：Windows、Python 3、GCC 15.2（C++17）。

- 全部 64 个参考实现通过，合计 531 组输入输出；新增算法部分 32 题、265 组。预期结果由 Python 小模型或明确的机制契约独立生成。
- 全部 32 个运行示例通过输出比对；新代码经 clang-format 整理后重新验证算法示例与参考实现。
- test_algorithms.cpp 固定随机种子，将 BST/AVL/B 树与 std::set、排序与标准排序、KMP 与朴素匹配、区间结构与数组、最短路与 Floyd、Prim 与 Kruskal 交叉核对；启用 -Wall -Wextra -Werror。
- 修复并专门测试 BST 删空后重新插入的根下标问题；稳定排序测试包含无序 id，防止把 id 当第二关键字。
- 评测器端到端检查 AC、WA、CE、RE、TLE、OLE，及头文件接口编译和参考解标记；运行目录彼此隔离。
- 检查章节、题目、demo 对应关系、测试数量、下载包内容与 SHA-256。
- 浏览器核对上下篇切换、搜索、练习筛选、代码折叠、接口题入口、暗色、字号、二分/堆/BFS 演示；375px 视口检查目录与溢出。
- 13 份只读参考课件 SHA-256 与读取前一致。未上传原课件、试卷或书籍全文；旧版输出保留。

复现：

```text
python practice/judge.py all --reference --keep-going
python practice/judge.py demo all
python tests/test_judge.py
g++ -std=c++17 -O2 -Wall -Wextra -Werror tests/test_algorithms.cpp -o algorithm-check
python tools/build.py
python tests/check_content.py
```

编译后运行 algorithm-check（Windows 为 algorithm-check.exe）。本次未使用 ASan；公开测试不能代替证明，也不能自动证明采用了指定结构或复杂度。网页为静态讲义，实际编译在本机进行。

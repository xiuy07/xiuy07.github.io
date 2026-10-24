# 来源、课程映射与精简说明

## 这版保留什么

面向已经学过一点 C、仍需逐步解释机制的学习者。以 C++17 统一运行，重组为上下两篇，共 32 章、32 个完整示例、64 道练习。上篇保留精简 C++ 主线，下篇补充数据结构与算法的机制、实现与手推。先建立对象、区间和生命期的模型，再进入类与泛型；算法练习服务于语言和容器的使用。

初稿中的大段历史、同一知识点的重复讲解、多套几乎相同的题解、难度过早的底层实现被合并或移到延伸阅读。不再要求初学者先完成一整套大题库才能进入 C++。每章保留机制、最小示例、易错边界和少量能本地验收的题。

原始初稿与课程文件均只读。本项目只发布重新编写的讲解、演示代码、题面和测试，不包含原课件、原试卷或参考书全文。课程映射基于提供的 Slides2025 七份课件（共 318 页）的可提取文字，以及部分历年题和初稿章节结构；未声称逐份核对所有历史附件，也不把回忆题当成权威语言规则。

## 课程映射

| 新指南 | 课程资料主题 | 初稿合并来源 |
|---|---|---|
| 01–02 编译、类型、函数 | 0102 Introduction；0304 DataType；0506 Pointer-Function | 原 01–04 课 |
| 03–05 容器、指针与内存 | 0304 DataType；0506 Pointer-Function | C 补强、原 05–08 课 |
| 06–08 类、拷贝与成员机制 | 0708 OOP | 原 09–11 课 |
| 09–10 继承、多态与 NVI | 09 Virtual-Inheritance；11 Template-Exception 的多态输出 | 原 12–14 课 |
| 11 运算符 | 10 Overloading | 原 13、15 课 |
| 12–14 模板、STL 与异常 | 11 Template-Exception；0304 中的值类型 | 原 16–17 课 |
| 15–16 算法与综合 | 原综合练习方向，自编机制讲解 | 原 18–20 及专项练习精选 |

## 数据结构与算法课程映射

新增部分参考 `D:/xiuy/nju/2-1数据结构与算法/`。只读提取 `Slides/` 的 11 份课件与 `slides26/` 的 2 份课件，共 13 份、893 页；参看 `Review/FinalReview.md`、`Exam/2024.md`、`Exam/2025.md` 的复习范围。不是逐题复刻历年考试，也没有改动原文件。893 页是提取文字所覆盖的文件页数，不代表每页图示都作了逐图复核。

| 新章节 | 课件文件 / 主题 |
|---|---|
| 17 算法分析 | chapter1_Introduction、chapter2_AlgorithmAnalysis；slides26 两份新版引论与分析 |
| 18 线性表 | chapter3.0_List |
| 19 栈、队列 | chapter3.1_StackQueue |
| 20 KMP、Trie | 自编拓展，补字符串与查找实践；不声称来自独立字符串课件 |
| 21 二叉树 | chapter4.0_Tree：表示、遍历、重建 |
| 22 BST、AVL、B 树 | chapter4.1_SpecificTrees |
| 23 堆与 Huffman | chapter6_PriorityQueue；chapter4.0_Tree 的 Huffman |
| 24 哈希 | chapter5_Hashing |
| 25 并查集 | chapter7_DisjointSet |
| 26–29 图 | chapter8_Graph：遍历、拓扑、AOE、最短路、生成树 |
| 30 排序 | chapter9_Sorting |
| 31 算法设计 | 引论/分析及复习范围；自编贪心与 DP 的可运行对照 |
| 32 区间结构 | 自编拓展，承接前缀和与树的结构；不声称是课件完整原章 |

每个新增章节附一组纸面推演与核对说明、一个运行 demo、两道编程题（p33–p64）。这些新题按机制独立设计；不冒用力扣或洛谷题号。实际实现与复杂度的适用条件以本指南契约为准。

## 算法参考书与公开资料

- [Algorithms, 4th Edition 官方书站](https://algs4.cs.princeton.edu/home/)：用于核对排序、查找和图主题的组织；[查找章节](https://algs4.cs.princeton.edu/30searching/)区分 BST、平衡查找与哈希。本指南采用独立 C++17 实现，没有翻译或复制站内 Java 源码。
- [The Algorithm Design Manual 作者资料站](https://algorist.com/)：用于算法建模与数据结构选型的延伸阅读；[图的表示](https://algorist.com/problems/Graph_Data_Structures.html)用于邻接表/矩阵的主题核对。
- [Introduction to Algorithms 官方书页](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)：用于查找树、图、贪心与动态规划的系统延伸。本指南不转载书中正文或习题数据。
- [cppreference：lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound)：用于标准库边界查找接口对照；教学实现仍手写循环。

本地 Textbook 目录仅作为书目参考，未复制、上传或附带整本 PDF。课程资料没有覆盖的拓展主题已单独注明。

## 算法部分特别说明

动态规划可采用记忆化递归（自顶向下）或表格递推（自底向上），不能把递归与 DP 对立；是否重复求解子问题以及缓存状态，才是核心区分。AVL 删除需要沿祖先链持续修复，不能照搬插入后提前停止的条件。B 树区分最小度数 t 与 m 阶；本版实现插入、查找，不包含删除与 B+ 树。Dijkstra 明确要求非负边，Bellman–Ford 的负环判断区分源点可达性。

界面参考已有 COA 与 IAI 讲义的纸面阅读、目录与阅读工具，并重新实现上下篇导航、暗色/字号控制、实现索引与三个逐步演示。只修改本项目 `/cpp/`，不修改参考网页。

## 参考书如何使用

- [C++ Primer，第 5 版（出版社介绍）](https://www.informit.com/store/c-plus-plus-primer-9780321714114)：用于安排基础、类、拷贝控制和模板的阅读顺序。该版以 C++11 为背景；本指南补充 C++17 适用范围。不要与 C++ Primer Plus 混淆。
- [Programming: Principles and Practice Using C++，第 3 版（作者页面）](https://www.stroustrup.com/PPP3.html)：适合补编程方法、建模和逐步验证。该版使用 C++20/23，阅读时注意与本指南练习基线的区别。
- [A Tour of C++，第 3 版（作者页面）](https://www.stroustrup.com/tour3.html)：适合完成主线后快速浏览现代语言与标准库，不作为零基础逐句教程。
- [Scott Meyers 的书籍页面](https://www.aristeia.com/books.html)：Effective C++ 与 Effective Modern C++ 用于延伸讨论资源管理、特殊成员、推导和转发的设计取舍；后者主要讨论 C++11/14。
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)：用于检查所有权、接口和异常安全的设计方向。这是指导原则，不是 ISO 标准条文。

以上链接用于核对书目信息与学习主题。本指南的解释、代码和测试独立编写，不逐章复制或声称覆盖参考书全部内容。

## 特别修正的表述

| 容易误导的说法 | 本指南采用的说法与核对入口 |
|---|---|
| struct/class 只差成员默认权限 | 还包括默认继承权限；见 [class.access.base](https://eel.is/c++draft/class.access.base) |
| const 成员只能写在初始化列表 | 在进入构造函数体前完成初始化；符合条件的类内初始值也可使用；见 [class.base.init](https://eel.is/c++draft/class.base.init) |
| 虚函数不能 inline | inline 与 virtual 可以共存，展开不是语言保证；见 [class.virtual](https://eel.is/c++draft/class.virtual) |
| std::move 一定搬走资源 | 它提供类型转换，实际重载决定是否移动；移动后状态由具体类型契约决定 |
| 编译器总是提供六个可用特殊成员 | 隐式声明、删除和生成都有条件；优先零法则 |
| 所有表达式陷阱都能猜输出 | 先区分编译错误、未定义行为、实现相关行为和确定语义；版本差异要标注 |

eel.is 链接是持续更新的标准草案镜像，本指南运行基线固定为 C++17；上述核对只用于对应的长期规则，不代表草案所有新特性都能在 C++17 使用。

## 练习改编与测试

题号 p05、p09、p10、p25、p29–p32 分别参考 LeetCode 26、206、21、1、84、85、155、146；p06 参考洛谷 P1047。每题页面都列出原题链接和输入输出/边界改编。其他题为按课程机制设计的原创练习。

算法题参考的是问题思想，题面重新表述，示例与全部测试数据自行编写；参考解独立实现。测试输出由 Python 的独立小模型或明确的机制契约产生，再与 C++ 参考解核对，避免直接把参考程序自己的输出当成唯一依据。公开测试不等于隐藏 OJ，也不能证明实现结构或复杂度；题面要求仍需人工检查。

## 网页与本机职责

GitHub Pages 提供静态讲解、搜索、代码展示和下载；不在服务器接收或执行 C++。示例的“查看输出”展示已核对的预期结果。实际编译、运行、超时检查与输出比对由下载包内的 Python 工具在本机完成。

## 更新记录

2026-10-23：完成独立精简版，统一 C++17，增加本地评测、接口题、示例输出核对与课程映射。

2026-10-23：新增数据结构与算法下篇 16 章、32 道练习及独立测试，更新阅读界面与算法演示。

<h2 id="ui-template">界面模板与授权</h2>

本版前端采用 [Tabler](https://github.com/tabler/tabler) 1.7.0 的官方开源 CSS，并基于卡片、表单、按钮、表格和进度组件改造成课程学习空间。图标来自 [Tabler Icons](https://github.com/tabler/tabler-icons)，英文字体使用 [Inter](https://github.com/rsms/inter)。模板与图标为 MIT 授权；Inter 为 SIL OFL 1.1。完整版权与许可保存在本地 `assets/vendor/` 和下载包中，详见 [第三方资源说明](THIRD_PARTY.md)。

课程首页、阅读页、练习区与移动导航经过重新编排。保留全部原讲义、练习、代码、测试和浏览器进度键；模板资源全部本地部署，不依赖 CDN。Tabler 官方仓库与本文档中的任何外部说明均只作为参考资料，不影响用户自己的学习文件。

## 升学与求职训练扩充（2026-10-24）

新增第 33–44 章，将课程数据结构基础与刷题建模连接。选题参考 [LeetCode Top Interview 150](https://leetcode.com/studyplan/top-interview-150/)、[CSES 官方分类题库](https://cses.fi/problemset/) 及洛谷模板题；逐题来源与改编说明见各题和 practice/training-sources.json。两条训练路线是本指南按知识依赖重新编排，不是官方题单或录取、求职保证。

题面、讲解、代码、自编样例与测试均重新制作。保留原课件中链表、树、哈希、堆、并查集、图和排序基础，补充窗口、二分答案、回溯、背包、二维与状态压缩 DP、LCA、0–1 BFS、二分图、SCC、扫描线等。课程资料只读，新增专题属于训练扩展，不宣称是原讲义完整涵盖的内容。

p65 改为下标配对数量，p67 只输出不同数值三元组数量；p75 偶数长度使用下中位数；p84 包含空数组与零的符号；p85 对路径数取模；p88 根固定为 1；p89 用结点编号输入并扩大到深链；p92 只输出 SCC 数量。所有改编以本指南题面为准。

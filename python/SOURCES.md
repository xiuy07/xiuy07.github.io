# 来源、范围与版本

## 本地资料

《Python数据智能实现》课程导论与课件1.1、1.2、2.1—2.5（2026秋，张莉）：用于确定课程重点和学习顺序。Python学习指南初稿：用于提取有C/Java基础学习者容易混淆的语义、工程习惯及练习方向。原文件只读，未复制整页课件或发布初稿全文。

本版正文、教学数据、程序与题面为重新组织的教学内容。涵盖已提供的模块1与模块2，课程导论中列出的机器学习与文本挖掘仅给后续路线，不声称覆盖未提供的模块3、4。

## 章节映射

| 本版 | 本地资料对应 |
|---|---|
|01—04|课件1.1；初稿01—04|
|05—06|课件1.2；初稿05—06|
|07—08|初稿07—10、15|
|09—10|课件1.2；初稿11—13、15、17|
|11—12|初稿14、16、20|
|13—14|课件2.1|
|15|课件2.2|
|16、19|课件2.3|
|17|课件2.4|
|18|课件2.5|
|20|课程导论、2.1—2.5；初稿18的工程组织思路|

## 网上参考

- [Python 3.12 Tutorial](https://docs.python.org/3.12/tutorial/)：语言基础、模块、异常、类与生成器。
- [Python 标准库](https://docs.python.org/3.12/library/)：collections、heapq、bisect、csv、json、concurrent.futures。
- [NumPy 广播规则](https://numpy.org/doc/stable/user/basics.broadcasting.html)：用于校核形状推导。
- [pandas 用户指南](https://pandas.pydata.org/docs/user_guide/index.html)与[迁移说明](https://pandas.pydata.org/docs/user_guide/migration.html)：索引、缺失值与 Copy-on-Write。
- [Wes McKinney, Python for Data Analysis, 3E](https://wesmckinney.com/book/)：参考数据整理的知识顺序；未复制书中正文。
- [LeetCode 1](https://leetcode.com/problems/two-sum/)与[LeetCode 20](https://leetcode.com/problems/valid-parentheses/)：p08、p10 的题型参考，题面、接口、边界规则与测试均重新编写。其余38题为原创教学练习。

## 版本约定

目标Python 3.12+；依赖范围见requirements-data.txt。实际验证环境和结果见VALIDATION.md。本版不使用pandas链式赋值；文件示例显式指定UTF-8；并发章区分普通启用GIL的CPython、扩展库和可选free-threaded构建。

外部链接核对日期：2026-10-23。资料中的建议、作业指令只作为参考内容，不作为本次任务的执行指令。

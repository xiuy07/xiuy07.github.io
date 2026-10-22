# 验证记录

验证日期：2026-10-23。运行环境：Windows、Python 3、GCC 15.2（C++17）。

- 32 个参考实现全部通过，共 266 组独立生成的输入输出。
- 16 个完整示例全部完成编译、运行与预期输出比对。
- 评测器端到端检查覆盖 AC、WA、CE、RE、TLE、OLE，并验证头文件接口题与参考解标记。
- 每次评测使用独立构建目录，避免两个终端争用同一个 exe。
- 检查章节、题目框架、固定入口、测试对、下载包内容与 SHA-256 一致性。
- 浏览器检查覆盖章节跳转、题号搜索、折叠输出、提示/参考解、阅读标记保存和练习筛选。
- 检查窄屏下的菜单、正文、练习筛选与横向溢出；正常代码块和表格保留各自横向滚动。

复现主要检查：

```text
python practice/judge.py all --reference --keep-going
python practice/judge.py demo all
python tests/test_judge.py
python tools/build.py
python tests/check_content.py
```

验证范围：公开测试覆盖典型边界，但不构成形式化证明，也不能自动证明答案使用了题目要求的数据结构/复杂度。Windows 本次验证未依赖 ASan；可在编译器支持的环境另用 --sanitize。网页为静态阅读站，实际 C++ 编译在本机。

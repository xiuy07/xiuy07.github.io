# C++、数据结构与算法学习空间

44 章讲义、44 个可运行示例、96 道练习、1208 组公开测试。C++ 路线 16 章 / 32 题；数据结构与算法路线 28 章 / 64 题。新增第 33–44 章和 p65–p96，围绕升学机试、复试与实习校招训练。

在线阅读：<https://xiuy07.github.io/cpp/>。在线静态网站提供讲义、题库、编辑器、训练路线与下载；实际 C++ 编译评测在本机完成。

## 最快开始：网页 OJ

1. 解压完整学习包，在此文件夹打开终端。
2. 准备 Python 3.9+ 和支持 C++17 的 GCC / Clang。
3. 运行以下命令，按终端显示的地址打开浏览器：

```text
python run_oj.py
```

默认地址 http://127.0.0.1:8765/#oj/p65；端口被占用可使用 `--port 8766`。编译器未加入 PATH 时运行 `python run_oj.py --cxx "完整编译器路径"`。使用 `--no-browser` 只启动服务，不自动打开浏览器；按 Ctrl+C 停止。

网页内可按专题、难度、章节和完成状态筛题，编辑 C++17，运行样例或自定义输入，提交本题全部公开测试。结果支持 AC / WA / CE / RE / TLE / OLE，显示编译信息、用时、首个失败输入与期望/实际输出。每个测试默认 2 秒，编译最多 60 秒，输出最多约 1 MiB。比较保留行边界，只忽略行末空白和文件末尾空行。

“运行输入”不计入整题通过。只有全量提交 AC 才自动标记完成；手动完成和阅读标记仅表示个人记录。题解和参考实现在折叠区，建议独立尝试后再看。

代码草稿只保存在当前浏览器。GitHub Pages 和本地地址属于不同来源，不会自动共用草稿；切换前用“下载代码”保存，再复制到本地编辑器。每次本地提交的代码快照、结果、提交历史保存在 `.local-oj/`，不会覆盖 `practice/solutions/` 中的个人文件，也不会进入分发包。历史列表保留最近 300 次，通过记录独立保留。

本地服务只绑定 127.0.0.1，标准库即可运行，不需要 npm、数据库或网络账户。它用于运行你自己的可信代码，属于个人开发工具，不是隔离不可信代码的公共沙箱；不要把监听地址改成公网服务。

## 直接写预留文件并用命令行评测

每题保留 TODO 文件。完整程序题在 main.cpp 编写；接口题在 solution.hpp 实现指定接口，固定 driver 自动调用。

```text
python practice/judge.py list --track dsa
python practice/judge.py p65
python practice/judge.py all --track dsa
python practice/judge.py p65 --file "自己的代码.cpp"
python practice/judge.py p65 --reference
python practice/judge.py demo d33
```

`--reference` 只核对参考解，不修改个人文件；参考解成绩不会计入导入进度。CLI 将本轮结果写到 practice/local-results.json，可在网页题库导入。OJ 的本地提交历史与 CLI 本轮结果分开保存。

## 怎样用于升学和就业

网页“升学与求职训练”提供两条按依赖组织的六阶段路线。升学侧重基本结构、手推与证明、标准输入输出；就业侧重数组字符串、DP、树图和口述优化。以 8–12 周为参考，每天先学一个模型，再做 1–2 题，错题在 2 天与 7 天后重写；每周一次 60–90 分钟混合模拟。

新增专题：哈希与双指针、前缀和与差分、二分答案、单调队列与双堆、回溯与折半搜索、LIS/编辑距离/非相邻 DP、0/1/完全/计数背包、网格与 LCS、树直径/LCA/最大路径和、0–1 BFS/二分图/SCC、区间贪心与扫描线、快速幂与状态压缩。难度标签按本指南安排，不等于来源平台难度。不能保证覆盖所有升学或招聘题目；验收标准是能独立建模、证明、实现、找反例并解释代价。

## 目录

```text
content/                    44 章 Markdown 讲义与来源说明
demos/                      44 个 .cpp 与预期 .out
algorithms/dsa.hpp           原课程可复用数据结构与算法
practice/solutions/pXX/      你的预留代码文件
practice/statements/        题面、样例、范围、来源
practice/editorials/        推导、正确性、复杂度、参考解
practice/reference/         参考实现
practice/tests/             公开输入与期望输出
practice/judge.py           原命令行评测器
training-paths.json         两条分阶段训练路线
oj/server.py                本地 OJ HTTP 与评测服务
run_oj.py                   本地网页 OJ 启动入口
notes/                      留给你的笔记、错题和额外程序
tools/                      网页构建与字体子集工具
tests/                      内容、字体、评测器与 HTTP 集成验证
downloads/                  完整离线学习包与摘要
```

## 维护与验证

```text
python -m pip install -r requirements-dev.txt
python tools/build.py
python tests/check_content.py
python tests/check_ui.py
python tests/test_oj_server.py
node tests/test_results.js
```

构建依赖 Markdown 与 Pygments；运行 OJ 或 CLI 不需要它们。中文是 Noto Sans SC 的本地课程子集，英文 Inter，代码 JetBrains Mono；编辑器是本地 CodeMirror 5，均不依赖字体/脚本 CDN。新增汉字可用 `fonttools[woff]` 与只读原字体运行 `python tools/build_fonts.py 原字体路径` 后再构建。详情见 THIRD_PARTY.md。

原始课程资料目录与旧版本输出保持不改。题面、代码、测试和讲解在本项目单独制作；逐题改编说明见题面、content/sources.md 和 practice/training-sources.json。未复制平台隐藏测试或书籍、课件全文。

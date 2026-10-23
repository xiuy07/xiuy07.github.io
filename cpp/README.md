# C++ 与数据结构学习讲义

面向学过基础 C、正在学习高级程序设计与数据结构算法的中文学习者。以 C++17 为统一运行基线，按“讲解 → 手推 → 运行示例 → 自己实现 → 本地测试”学习。全书 32 章、32 个运行示例、64 道编程练习；上篇 01–16 为 C++，下篇 17–32 为数据结构与算法。算法章节各附手推题与核对说明。

在线阅读：<https://xiuy07.github.io/cpp/>

## 第一次使用

1. 安装 Python 3.9+ 和支持 C++17 的 GCC 或 Clang。Windows 上可使用已有的 MinGW-w64；先在终端验证 `python --version` 和 `g++ --version`。
2. 在解压目录打开终端，运行 `python practice/judge.py list`。
3. 打开 `practice/solutions/p01/main.cpp`，填写 `TODO`。
4. 运行 `python practice/judge.py p01`，查看用例结果。

```text
python practice/judge.py list
python practice/judge.py list --track dsa
python practice/judge.py p33
python practice/judge.py all --track dsa --keep-going
python practice/judge.py p01
python practice/judge.py p13
python practice/judge.py all --keep-going
python practice/judge.py p01 --file D:/my-code/main.cpp
python practice/judge.py all --reference
python practice/judge.py demo all
python practice/judge.py p09 --sanitize
```

`--sanitize` 需要本机编译器/运行库支持，部分 Windows MinGW 发行版不提供 ASan，默认评测不启用。Clang 可用 `--cxx clang++`。不需要 npm，也不需要在线 OJ 账户。

## 目录

```text
content/                    精简后的章节 Markdown，适合继续维护
algorithms/dsa.hpp          数据结构与算法的完整 C++17 教学实现
algorithms/README.md        实现索引、复杂度与前置条件
demos/                      完整可运行示例及预期输出
practice/solutions/pXX/      留给你写的 main.cpp 或 solution.hpp
practice/drivers/            类、模板题的固定测试入口，不需要修改
practice/tests/pXX/          每题 .in / .out 测试数据
practice/reference/pXX/      参考实现，建议完成题目后再看
practice/statements/         可离线阅读的完整题面
practice/judge.py            本地评测器
notes/                      你的笔记、错题与额外程序
tools/build.py              从 Markdown 生成静态网页与下载包
tests/                      评测器本身的回归检查
downloads/                  可直接下载的学习包
```

题目分为完整程序题和接口题。程序题通过标准输入输出测试；接口题在 `solution.hpp` 中完成指定类/函数，固定 driver 会调用接口，因此 `const`、拷贝/移动和泛型接口也能在编译期受到检查。测试通过不等同于证明所有实现细节正确；题面要求的数据结构、复杂度与内存释放还需自行检查。

评测结果：AC 通过；WA 输出不符；CE 编译错误；RE 非零退出；TLE 超时；OLE 输出超限。每个用例默认 2 秒，输出最多约 1 MiB。比较时保留行边界，仅忽略行末空白和文件末尾空行。默认停在本题首个失败用例，`--keep-going` 可继续查看。

这是用于运行自己练习代码的本机工具，不是隔离不可信代码的安全沙箱，也不提供严格内存限制。程序会在 `practice/.build/题号/` 运行；输入通过 stdin 提供，不要在答案里硬编码测试文件路径。

## 查看网页与维护

无需构建即可打开已有 `index.html`（全部内容在本地 `assets/data.js` 中，无需 fetch）。也可运行 `python -m http.server 8000`，浏览器访问 <http://localhost:8000/>。

修改章节后重新生成：

```text
python -m pip install -r requirements-dev.txt
python tools/build.py
```

生成器只写本项目内的网页数据和下载包。评测器只使用 Python 标准库。网页是静态阅读站，示例按钮展示已由本地编译运行核对的输出；实际编译与测试在本机执行。阅读进度保存在当前浏览器，可导入本地 `local-results.json` 同步本次评测结果。

## 内容与来源

课程映射、精简记录、参考书和题目改编说明见 `content/sources.md`。讲解、示例、题目改写、参考实现和测试均在本项目中重新编写，不附原始课件、试卷或书籍全文。原始资料目录未修改。

## 新版界面

前端基于 MIT 授权的 Tabler 1.7.0，入口为 index.html，定制样式为 assets/workspace.css。配备课程卡片、分组目录、练习筛选、阅读设置和移动抽屉导航；Ctrl+K 聚焦全书搜索。已有阅读与完成进度沿用原本机存储键。所有模板、字体与图标随包分发，详情见 THIRD_PARTY.md。

## 字体与阅读排版

中文采用 Noto Sans SC 的课程字符子集（内部名 Study Sans SC），拉丁文字为 Inter，代码为 JetBrains Mono。字体全部随网页与学习包保存，不需要访问字体 CDN。代码关闭连字，便于辨认 `!=`、`<=`、`->` 等运算符；中文注释与正文使用相同字形。字号仍可在右上角的阅读设置中调整。

目录与辅助文字的字号调大，正文默认 18px，手机为 17px；中文标题使用 600 字重和正常字距。完整字体来源与许可见 THIRD_PARTY.md。

增加课程内容后，超出字体子集的字会自动使用系统字体。若要更新子集，单独安装 `fonttools[woff]`，从 dependencies.json 的 source_file 下载原始 Noto Sans SC，再运行 `python tools/build_fonts.py 原始字体路径`，最后运行 `python tools/build.py`。仅重新生成网页内容不需要安装字体工具。

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

## Tabler 前端改版验证

本次只修改前端与相应说明。与上一版逐文件核对，全部 32 章正文，以及 1409 个算法实现、示例和练习相关文件保持不变；上面的 C++ 验证记录沿用，不把 UI 改版描述为重新运行了一遍所有 C++。

- Tabler 1.7.0 CSS、Inter 字体、Tabler SVG 图标均随项目本地分发，核对版本、文件摘要和完整 MIT/OFL 许可证。
- 重新构建后通过 check_content.py 与 check_ui.py，检查 32 章、64 题、531 组测试、资源完整性、下载包、授权文件和 SHA-256。
- Node 单元测试覆盖成绩解析、拒绝参考解、非法格式、未知项、重复题号以最后结果为准，以及输入对象不被修改；通过 JS 语法检查。
- 浏览器核对课程进入、目录分组、搜索与 Ctrl+K、键盘打开结果、章节深链、暗色、字号、练习关键词与完成状态筛选、空结果、完成标记及刷新后恢复。
- 在 375/390、768、1024、1440 宽度读取实际 DOM 尺寸与布局状态，未发现全页横向溢出；手机抽屉的遮罩、焦点、关闭和导航后收起正常。
- 成绩文件的浏览器自动化选择步骤受扩展文件权限限制，未更改扩展设置；文件解析通过独立单元测试，页面的完成状态与统计同步另在浏览器验证。未宣称文件选择端到端自动化已通过。

复现界面检查（Node 只用于开发验证，本地 C++ 评测仍只需 Python 与编译器）：

```text
node --check assets/app.js
node tests/test_results.js
python tools/build.py
python tests/check_content.py
python tests/check_ui.py
```

## 字体与排版增量验证

本次使用独立的 cpp-ui-typography 输出目录，上一版输出、原始讲义和课程目录未修改。与 cpp-ui-tabler 逐文件比较课程正文、算法、示例、练习、个人笔记框架，以及 curriculum.json、app.js、results.js 和 data.js 的字节；本次只更新字体、CSS、资源构建与相关开发说明。

- Noto Sans SC 只读源字体生成 1465 个 Unicode 字符的 WOFF2 子集，重命名内部字体族为 Study Sans SC，保留上游版权和 OFL。子集约 332 KiB，覆盖当前课程的 943 个汉字；400、500、600、700 实例化校验通过。
- JetBrains Mono 随项目分发；可打印 ASCII 字符均存在，字宽一致；CSS 关闭代码连字。中文注释回退到本地课程中文字体。
- 字体 URL 带内容摘要版本，同时更新预加载引用与 CSS 摘要，避免旧缓存延续。静态检查核对字体摘要、WOFF2 文件头、本地引用及学习包内字体和许可字节一致。
- 重新构建并通过 check_content.py、check_ui.py、check_fonts.py、成绩解析测试及 JS 语法检查。C++ 内容未改，本次未重复运行全部 C++ 编译测试。
- 上一节的浏览器交互与多尺寸验证属于 Tabler 前端版记录；本次字体调整的程序检查不替代实际浏览器截图验收。

字体开发检查单独执行 `python tests/check_fonts.py`，需要安装 `fonttools[woff]`。课程构建与本地评测无需安装该依赖。

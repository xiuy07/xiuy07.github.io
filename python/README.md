# Python 学习讲义：从代码到数据

20章精简讲解、20个可运行示例、40道练习、400组固定测试，以及一个完整数据分析项目。

在线入口：https://xiuy07.github.io/python/

## 从这里开始

解压完整学习包，直接打开 `index.html`。讲义、字体、搜索、演示均在本地，无需安装网页框架。也可以运行 `python -m http.server 8000`，浏览器访问 `http://localhost:8000/`。

Python 目标版本为3.12+。基础题 p01—p24 只需标准库；数据题 p25—p40 按题面使用NumPy/pandas。完整项目另需Matplotlib。

```text
python --version
python practice/judge.py doctor
python practice/judge.py list
python practice/judge.py list --track data
```

打开 `practice/solutions/p01/main.py`，实现 `solve(data)`，然后：

```text
python practice/judge.py p01
python practice/judge.py p01 --file D:/my-code/main.py
python practice/judge.py all --track base --keep-going
python practice/judge.py all --keep-going --report my-results.json
```

驱动器将JSON读入为Python值，把函数返回值输出为JSON。无需自己写input/print，也不要保留调试print。字典键顺序不影响结果，列表顺序按题面要求；整数精确比较，浮点数用绝对/相对误差1e-9比较。

可以在网页“编程练习”导入 `my-results.json`。参考解生成的报告不会作为个人成绩导入；“已独立完成”是自评，与本地AC分开显示。每个用例重新启动进程，不会沿用前一个用例的模块状态。

## 安装数据分析依赖

建议单独创建环境。Windows无需激活即可使用：

```text
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements-data.txt
.venv\Scripts\python.exe practice/judge.py p25
.venv\Scripts\python.exe demos/project.py
```

macOS/Linux将解释器路径改为 `.venv/bin/python`。始终用同一个解释器执行安装与评测。

## 运行演示与综合项目

```text
python demos/02.py
python practice/judge.py demo all
python demos/project.py
```

`demos/01.py`—`20.py` 对应每章示例，`.out` 为预期输出。`project.py` 从学习包 `data/orders.csv` 读取教学数据，将输出写入**当前工作目录**的 `project-output/`：

- `cleaned.csv`：清洗后明细。
- `summary.csv`：按城市汇总收入。
- `report.json`：清洗行数与金额校验。
- `revenue.png`：城市收入条形图。

给定教学数据的预期：10条输入、去重1条、删除无效3条、保留6条；收入118元（Nanjing 50，Suzhou 44，Wuxi 24）。

## 目录

```text
content/                    20章Markdown讲义
assets/                     页面、课程数据、离线字体
demos/                      示例、预期输出、完整项目
data/                       原创教学数据
practice/solutions/pXX/      给你预留的main.py
practice/reference/pXX/      参考实现
practice/statements/        完整离线题面
practice/tests/pXX/          JSON格式 .in / .out 固定测试
practice/driver.py          JSON输入输出驱动
practice/judge.py           本地评测器
tests/test_judge.py          评测器回归检查
notes/                      个人错题本模板
tools/                      页面数据与学习包重建工具
SOURCES.md                  来源与课程范围
VALIDATION.md               实际验证环境及结果
THIRD_PARTY.md              字体许可
```

## 评测结果与边界

AC通过；WA输出错误（含多余print）；CE语法错误；RE运行异常；TLE超时；OLE输出过量；DE缺依赖；FE文件不存在或无法读取。

默认每例5秒，可通过 `--timeout 10` 调整；stdout与stderr合计约1MiB上限。程序在 `practice/.build/` 下的临时目录运行，结束后清理本次目录。它是运行自己练习代码的教学工具，不是隔离不可信代码的安全沙箱，没有严格内存限制；不用于执行未知来源代码。

测试验证结果，无法代替对生成器、类、并发、指定库和复杂度的人工检查。空输入、重复值、边界、缺失与非法数据均有代表性用例，400例不构成数学正确性证明。

## 学习安排

每章按“读说明→手推→运行示例→独立做题→记录错因”推进。会C++/Java可先精读02、04、06，再从13进入数据分析。正文阅读合计约13小时，练习、项目与复习另计。

本版覆盖已提供的课程模块1、2。机器学习与文本挖掘仅提供后续路线，未把导论中的目录当成已有专题资料。所有参考原文件保持只读；本文件夹为独立输出。

## 验证和维护

```text
python practice/judge.py all --reference --keep-going
python practice/judge.py demo all
python tests/test_judge.py
python tools/build.py
python tools/package.py
```

页面内容源为 `content/*.md` 和 `practice/statements/*.md`。重建网页需要 `python -m pip install -r requirements-dev.txt`。字体已打包，重建内容不依赖原始课件或桌面初稿。新增字符如超出字体子集，浏览器自动使用系统中文字体。

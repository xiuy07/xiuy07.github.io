"""单个用例的独立 Python 进程入口。"""
import json
import runpy
import sys

sys.dont_write_bytecode = True
namespace = runpy.run_path(sys.argv[1], run_name='student_solution')
solve = namespace.get('solve')
if not callable(solve):
    raise TypeError('请提供 solve(data) 函数')
data = json.loads(sys.stdin.read())
result = solve(data)
print(json.dumps(result, ensure_ascii=False, allow_nan=False))

"""运行：python tests/test_judge.py。验证评测器关键失败路径。"""
from pathlib import Path
import importlib.util
import tempfile
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('local_judge',ROOT/'practice/judge.py')
judge=importlib.util.module_from_spec(spec)
spec.loader.exec_module(judge)

def main():
    checks=0
    def expect(value):
        nonlocal checks
        assert value
        checks+=1
    expect(judge.equal(10,10))
    expect(not judge.equal(10**12+1,10**12))
    expect(not judge.equal(True,1))
    expect(not judge.equal(1,True))
    expect(judge.equal(1.0000000001,1.0))
    expect(not judge.equal(float('nan'),1.0))
    expect(not judge.equal(10**400,1.0))
    expect(not judge.equal(-10**400,-1.0))
    expect(judge.equal(10**400,10**400))
    expect(not judge.equal([10**400],[1.0]))
    expect(not judge.equal({'value':10**400},{'value':1.0}))
    expect(not judge.equal([1,2],[2,1]))
    expect(judge.equal({'b':2,'a':1},{'a':1,'b':2}))
    expect(not judge.equal({'a':1,'b':2},{'a':1}))
    base=ROOT/'practice/.build'
    base.mkdir(exist_ok=True)
    cases=[('def solve(data):\n    return data\n','OK'),
           ('def solve(:\n','CE'),
           ('def solve(data):\n    raise RuntimeError("test")\n','RE'),
           ('def solve(data):\n    print("debug")\n    return data\n','WA'),
           ('def solve(data):\n    while True: pass\n','TLE'),
           ('def solve(data):\n    print("x" * 2000000)\n    return 0\n','OLE'),
           ('x = 1\n','RE'),
           ('def solve(data):\n    return float("nan")\n','RE')]
    with tempfile.TemporaryDirectory(dir=base,prefix='regression-') as temp:
        path=Path(temp)/'main.py'
        for code,verdict in cases:
            path.write_text(code,encoding='utf-8')
            actual,detail=judge.execute(path,'[1,2]',timeout=0.6)
            expect(actual==verdict)
            if actual=='OK':expect(judge.equal(detail,[1,2]))
        actual,_=judge.execute(Path(temp)/'missing.py','null')
        expect(actual=='FE')
    for invalid in ['nan','inf','0','-1']:
        result=subprocess.run([sys.executable,str(ROOT/'practice/judge.py'),'list','--timeout='+invalid],capture_output=True,timeout=5)
        expect(result.returncode==2)
    print(f'{checks} judge regression checks passed')

if __name__=='__main__':main()

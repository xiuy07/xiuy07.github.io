"""评测器的端到端回归：验证 AC/WA/CE/RE/TLE/OLE 和接口题。"""
from pathlib import Path
import json
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
P=ROOT/'practice'
BUILD=P/'.build'/'selftest'
BUILD.mkdir(parents=True,exist_ok=True)

def check(source,status,timeout=2):
    f=BUILD/'case.cpp'
    f.write_text(source,encoding='utf-8')
    prior_runs=set((P/'.build'/'p01').glob('run-*'))
    result=subprocess.run([sys.executable,str(P/'judge.py'),'p01','--file',str(f),'--timeout',str(timeout)],capture_output=True,timeout=75)
    output=result.stdout.decode('utf-8',errors='replace')
    assert f': {status}' in output,(status,output,result.stderr.decode('utf-8',errors='replace'))
    assert result.returncode==(0 if status=='AC' else 1)
    assert set((P/'.build'/'p01').glob('run-*'))==prior_runs, '评测遗留编译目录'
    print(f'{status}: verified',flush=True)

check((P/'reference/p01/main.cpp').read_text(encoding='utf-8'),'AC')
check('#include <iostream>\nint main(){std::cout<<0<<"\\n";}','WA')
check('int main( {','CE')
check('int main(){return 7;}','RE')
check('int main(){for(;;){}}','TLE',.15)
check('#include <iostream>\nint main(){for(int i=0;i<2000000;++i)std::cout<<"xxxxxxxxxxxxxxxx\\n";}','OLE',3)
r=subprocess.run([sys.executable,str(P/'judge.py'),'p13','--reference'],capture_output=True,timeout=75)
assert r.returncode==0,r.stdout.decode('utf-8',errors='replace')
result=json.loads((P/'local-results.json').read_text(encoding='utf-8'))
assert result['reference'] is True
print('header compilation / reference flag: verified',flush=True)

for invalid in ['nan','inf','0','-1']:
    result=subprocess.run([sys.executable,str(P/'judge.py'),'list','--timeout='+invalid],capture_output=True,timeout=5)
    assert result.returncode==2,(invalid,result.stdout,result.stderr)
print('non-finite / non-positive timeouts rejected: verified',flush=True)

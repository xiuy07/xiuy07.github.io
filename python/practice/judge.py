"""本地教学 OJ：每例新进程、JSON比较、时间及输出限制。"""
from pathlib import Path
import argparse
import importlib.util
import json
import math
import os
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parent
PACKAGE = ROOT.parent
LIMIT = 1024 * 1024

def equal(actual, expected):
    if actual is None or expected is None:
        return actual is expected
    if isinstance(expected, bool):
        return type(actual) is bool and actual == expected
    if type(expected) is int:
        return type(actual) in (int, float) and actual == expected
    if isinstance(expected, float):
        if type(actual) not in (int, float):
            return False
        try:
            return math.isfinite(actual) and math.isclose(actual, expected, rel_tol=1e-9, abs_tol=1e-9)
        except OverflowError:
            # JSON 允许任意精度整数；超出 float 范围的答案应判错，而非中断整轮评测。
            return False
    if isinstance(expected, str):
        return type(actual) is str and actual == expected
    if isinstance(expected, list):
        return type(actual) is list and len(actual) == len(expected) and all(equal(a,b) for a,b in zip(actual,expected))
    if isinstance(expected, dict):
        return type(actual) is dict and actual.keys() == expected.keys() and all(equal(actual[k],expected[k]) for k in expected)
    return False

def execute(path, input_text, timeout=5.0):
    """stdout/stderr 写入临时文件，避免无限输出填满内存。"""
    try:
        compile(path.read_text(encoding='utf-8-sig'), str(path), 'exec')
    except (SyntaxError, UnicodeError) as exc:
        return 'CE', str(exc)
    except OSError as exc:
        return 'FE', str(exc)
    build = ROOT / '.build'
    build.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='case-', dir=build) as temp:
        work = Path(temp)
        stdin, stdout, stderr = work/'input.json', work/'output.txt', work/'error.txt'
        stdin.write_text(input_text, encoding='utf-8')
        env = dict(os.environ, PYTHONIOENCODING='utf-8', PYTHONUTF8='1', PYTHONDONTWRITEBYTECODE='1')
        start = time.monotonic()
        verdict = None
        with stdin.open('rb') as fi, stdout.open('wb') as fo, stderr.open('wb') as fe:
            try:
                proc = subprocess.Popen([sys.executable, '-X', 'utf8', '-B', str(ROOT/'driver.py'), str(path.resolve())], stdin=fi, stdout=fo, stderr=fe, cwd=work, env=env)
            except OSError as exc:
                return 'RE', str(exc)
            while proc.poll() is None:
                if stdout.stat().st_size + stderr.stat().st_size > LIMIT:
                    verdict = 'OLE'
                    proc.kill()
                    break
                if time.monotonic()-start > timeout:
                    verdict = 'TLE'
                    proc.kill()
                    break
                time.sleep(0.01)
            proc.wait()
        if verdict:
            return verdict, '输出超过1 MiB' if verdict == 'OLE' else f'超过 {timeout:g} 秒'
        if stdout.stat().st_size + stderr.stat().st_size > LIMIT:
            return 'OLE', '输出超过1 MiB'
        if proc.returncode != 0:
            return 'RE', stderr.read_text(encoding='utf-8', errors='replace')[-1800:]
        try:
            result = json.loads(stdout.read_text(encoding='utf-8'))
        except (ValueError, UnicodeError) as exc:
            return 'WA', '需要且只能输出一个JSON值，请移除调试print：'+str(exc)
        return 'OK', result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('target', help='list / doctor / demo / all / p01..p40')
    parser.add_argument('demo_id', nargs='?', default='all')
    parser.add_argument('--reference', action='store_true', help='验证参考实现')
    parser.add_argument('--file', type=Path, help='指定自己的main.py（仅单题）')
    parser.add_argument('--track', choices=['base','data'])
    parser.add_argument('--keep-going', action='store_true')
    parser.add_argument('--timeout', type=float, default=5.0)
    parser.add_argument('--report', type=Path, help='保存评测JSON，可在网页练习页导入')
    args = parser.parse_args()
    if not math.isfinite(args.timeout) or args.timeout <= 0:
        parser.error('--timeout 必须为有限正数')
    tasks = json.loads((ROOT/'problems.json').read_text(encoding='utf-8'))
    if args.target == 'doctor':
        print('Python:', sys.version.split()[0], '\n解释器:', sys.executable)
        for name in ['numpy','pandas','matplotlib']:
            print(name, 'OK' if importlib.util.find_spec(name) else '未安装；基础题仍可运行')
        return 0
    if args.target == 'demo':
        files = sorted((PACKAGE/'demos').glob('??.py')) if args.demo_id == 'all' else [PACKAGE/'demos'/f'{args.demo_id.zfill(2)}.py']
        failed = False
        for path in files:
            if not path.exists():
                print('FE', path); failed=True; continue
            expected = path.with_suffix('.out').read_text(encoding='utf-8')
            try:
                result = subprocess.run([sys.executable,'-X','utf8',str(path)],capture_output=True,text=True,encoding='utf-8',timeout=args.timeout,env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'))
                ok = result.returncode == 0 and result.stdout.replace('\r\n','\n').strip() == expected.strip()
                print(path.stem, 'AC' if ok else 'FAIL')
                if not ok: print(result.stderr[-1000:]); failed=True
            except subprocess.TimeoutExpired:
                print(path.stem,'TLE');failed=True
        return int(failed)
    selected = [p for p in tasks if (not args.track or p['track']==args.track)]
    if args.target == 'list':
        for p in selected: print(p['id'], p['title'], f"({','.join(p['deps']) or '标准库'})")
        return 0
    if args.target != 'all':
        selected = [p for p in selected if p['id']==args.target]
    if not selected:
        parser.error('题号不存在，使用 list 查看')
    if args.file and len(selected)!=1:
        parser.error('--file 只能用于单题')
    report={'schema':1,'course':'python-guide-v1','python':sys.version.split()[0],'reference':args.reference,'results':[]}
    failed=False; total=0;passed=0
    for p in selected:
        missing=[name for name in p['deps'] if importlib.util.find_spec(name) is None]
        path=args.file.resolve() if args.file else ROOT/('reference' if args.reference else 'solutions')/p['id']/'main.py'
        record={'id':p['id'],'verdict':'AC','passed':0,'total':len(p['tests'])}
        if missing:
            record['verdict']='DE'
            print(p['id'],'DE 缺少依赖:',','.join(missing),'；运行 python -m pip install -r requirements-data.txt')
        else:
            for case in p['tests']:
                inp=ROOT/case['in']; expected=json.loads((ROOT/case['out']).read_text(encoding='utf-8'))
                verdict,actual=execute(path,inp.read_text(encoding='utf-8'),args.timeout)
                total+=1
                if verdict=='OK': verdict='AC' if equal(actual,expected) else 'WA'
                if verdict=='AC':record['passed']+=1;passed+=1
                else:
                    if record['verdict']=='AC':record['verdict']=verdict
                    print(p['id'],inp.stem,verdict)
                    print('  ',str(actual)[:600])
                    if verdict=='WA':print('  expected:',json.dumps(expected,ensure_ascii=False)[:600])
                    if not args.keep_going:break
            print(f"{p['id']} {record['verdict']} {record['passed']}/{record['total']} {p['title']}")
        failed |= record['verdict']!='AC'
        report['results'].append(record)
    print(f'用例通过 {passed}/{total}；题目通过 {sum(r["verdict"]=="AC" for r in report["results"])}/{len(selected)}')
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    return int(failed)

if __name__=='__main__':
    raise SystemExit(main())

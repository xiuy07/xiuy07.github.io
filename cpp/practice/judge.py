#!/usr/bin/env python3
"""本机 C++17 练习评测器；只依赖 Python 标准库，不是安全沙箱。"""
import argparse
import difflib
import json
import math
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent


def terminate(process):
    if os.name == 'nt':
        # 使用直接子进程句柄终止，避免依赖 taskkill 的外部进程枚举权限。
        process.kill()
    else:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    process.wait()


def run_limited(command, input_path, cwd, timeout, output_limit=1024 * 1024):
    # 输出写入临时文件；监控大小，避免错误循环把终端/内存塞满。
    with input_path.open('rb') as inp, tempfile.TemporaryFile(dir=cwd) as out, tempfile.TemporaryFile(dir=cwd) as err:
        options = {'start_new_session': True} if os.name != 'nt' else {}
        p = subprocess.Popen(command, stdin=inp, stdout=out, stderr=err, cwd=cwd, **options)
        start = time.monotonic()
        status = 'OK'
        while p.poll() is None:
            if time.monotonic() - start > timeout:
                status = 'TLE'
                terminate(p)
                break
            if os.fstat(out.fileno()).st_size + os.fstat(err.fileno()).st_size > output_limit:
                status = 'OLE'
                terminate(p)
                break
            time.sleep(0.01)
        elapsed = time.monotonic() - start
        if os.fstat(out.fileno()).st_size + os.fstat(err.fileno()).st_size > output_limit:
            status = 'OLE'
        out.seek(0)
        err.seek(0)
        stdout = out.read(output_limit).decode('utf-8', errors='replace')
        stderr = err.read(8192).decode('utf-8', errors='replace')
        if status == 'OK' and p.returncode:
            status = 'RE'
        return status, stdout, stderr, elapsed


def normalize(text):
    # 保留行边界；仅忽略每行行末空白和文件末尾的空行。
    return '\n'.join(line.rstrip() for line in text.replace('\r\n', '\n').splitlines()).rstrip('\n')


def evaluate(problem, args, compiler):
    pid = problem['id']
    parent = 'reference' if args.reference else 'solutions'
    source = Path(args.file).resolve() if args.file else ROOT / parent / pid / problem['filename']
    if not source.is_file():
        print(f'{pid}: MISSING 找不到 {source}')
        return {'id': pid, 'status': 'MISSING', 'passed': 0, 'total': 0}

    build_parent = ROOT / '.build' / pid
    build_parent.mkdir(parents=True, exist_ok=True)
    # 每次运行独立目录，避免两个终端同时评测时争用同一可执行文件。
    with tempfile.TemporaryDirectory(prefix='run-', dir=build_parent) as temp:
        return evaluate_in_build(problem, args, compiler, source, Path(temp))


def evaluate_in_build(problem, args, compiler, source, build):
    pid = problem['id']
    exe = build / ('submission.exe' if os.name == 'nt' else 'submission')
    command = [compiler, '-std=c++17', '-O2', '-Wall', '-Wextra', '-pedantic', '-I', str(source.parent)]
    if args.sanitize:
        command += ['-g', '-O1', '-fsanitize=address,undefined', '-fno-omit-frame-pointer']

    if problem['mode'] == 'header':
        driver = (ROOT / 'drivers' / f'{pid}.cpp').read_text(encoding='utf-8')
        driver = driver.replace('#include "solution.hpp"', '#include ' + json.dumps(source.as_posix(), ensure_ascii=False))
        actual_source = build / 'driver.cpp'
        actual_source.write_text(driver, encoding='utf-8')
    else:
        actual_source = source
    command += [str(actual_source), '-o', str(exe)]

    try:
        compiled = subprocess.run(command, capture_output=True, timeout=60)
    except subprocess.TimeoutExpired:
        print(f'{pid}: CE 编译超过 60 秒')
        return {'id': pid, 'status': 'CE', 'passed': 0, 'total': 0}
    if compiled.returncode:
        print(f'{pid}: CE 编译错误\n{compiled.stderr.decode("utf-8", errors="replace")[:10000]}')
        return {'id': pid, 'status': 'CE', 'passed': 0, 'total': 0}

    cases = sorted((ROOT / 'tests' / pid).glob('*.in'))
    if not cases:
        print(f'{pid}: ERROR 没有测试文件')
        return {'id': pid, 'status': 'ERROR', 'passed': 0, 'total': 0}
    passed, failures = 0, []
    for inp in cases:
        expected_path = inp.with_suffix('.out')
        if not expected_path.is_file():
            failures.append('ERROR')
            print(f'  {inp.name}: ERROR 缺少 .out 文件')
            continue
        expected = expected_path.read_text(encoding='utf-8')
        status, stdout, stderr, elapsed = run_limited([str(exe)], inp, build, args.timeout)
        if status == 'OK':
            status = 'AC' if normalize(stdout) == normalize(expected) else 'WA'
        if status == 'AC':
            passed += 1
            if args.verbose:
                print(f'  {inp.name}: AC {elapsed * 1000:.0f} ms')
        else:
            failures.append(status)
            print(f'  {inp.name}: {status} {elapsed * 1000:.0f} ms')
            if status == 'WA':
                delta = difflib.unified_diff(normalize(expected).splitlines(), normalize(stdout).splitlines(),
                                             fromfile='期望输出', tofile='你的输出', lineterm='')
                print('\n'.join(list(delta)[:24]))
            elif stderr:
                print(stderr[:2000])
            if not args.keep_going:
                break
    status = failures[0] if failures else 'AC'
    print(f'{pid} {problem["title"]}: {status} ({passed}/{len(cases)})', flush=True)
    return {'id': pid, 'status': status, 'passed': passed, 'total': len(cases)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('target', nargs='?', default='list', help='list / all / p01 / demo')
    parser.add_argument('demo_id', nargs='?', default='all')
    parser.add_argument('--reference', action='store_true', help='仅用于核对参考实现，不修改自己的文件')
    parser.add_argument('--track', choices=['cpp', 'dsa'], help='仅列出或评测指定学习路线')
    parser.add_argument('--file', help='指定自己的 .cpp 或 .hpp 文件；仅允许单题')
    parser.add_argument('--cxx', default=os.environ.get('CXX', 'g++'))
    parser.add_argument('--timeout', type=float, default=2.0, help='每个用例的运行时间，默认 2 秒')
    parser.add_argument('--sanitize', action='store_true', help='需要编译器支持 ASan/UBSan')
    parser.add_argument('--keep-going', action='store_true', help='某用例失败后继续检查本题其余用例')
    parser.add_argument('--verbose', action='store_true')
    args = parser.parse_args()
    if not math.isfinite(args.timeout) or args.timeout <= 0:
        parser.error('--timeout 必须为有限正数')
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    problems = [p for p in manifest['problems'] if not args.track or p.get('track') == args.track]
    if args.target == 'list':
        for p in problems:
            print(f'{p["id"]:4} {p["title"]:16} {p["difficulty"]}  solutions/{p["id"]}/{p["filename"]}')
        return 0
    if args.file and args.target in ('all', 'demo'):
        parser.error('--file 仅用于单题')
    compiler = shutil.which(args.cxx)
    if not compiler:
        print(f'找不到编译器 {args.cxx}。请安装 GCC/Clang 并加入 PATH，或用 --cxx 指定可执行文件路径。')
        return 2
    if args.target == 'demo':
        selected = [p for p in manifest['demos'] if (args.demo_id == 'all' or p['id'] == args.demo_id) and (not args.track or p.get('track') == args.track)]
        if not selected:
            parser.error('不存在该示例编号')
        results = []
        demo_build = ROOT / '.build' / 'demos'
        demo_build.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='run-', dir=demo_build) as temp:
            temp = Path(temp)
            for demo in selected:
                exe = temp / ('demo.exe' if os.name == 'nt' else 'demo')
                source = PROJECT / 'demos' / f'{demo["id"]}.cpp'
                comp = subprocess.run([compiler, '-std=c++17', '-O2', '-Wall', '-Wextra', str(source), '-o', str(exe)],
                                      capture_output=True, timeout=60)
                if comp.returncode:
                    print(f'{demo["id"]}: CE\n{comp.stderr.decode("utf-8", errors="replace")}')
                    results.append(False)
                    continue
                inp = temp / 'empty.in'
                inp.write_text('', encoding='utf-8')
                status, stdout, stderr, _ = run_limited([str(exe)], inp, temp, args.timeout)
                expected = (PROJECT / 'demos' / f'{demo["id"]}.out').read_text(encoding='utf-8')
                ok = status == 'OK' and normalize(stdout) == normalize(expected)
                results.append(ok)
                print(f'{demo["id"]}: {"AC" if ok else status if status != "OK" else "WA"}', flush=True)
                if not ok:
                    print(f'期望：{expected!r}\n实际：{stdout!r}\n{stderr}')
        return 0 if all(results) else 1
    selected = [p for p in problems if args.target == 'all' or p['id'] == args.target]
    if not selected:
        parser.error(f'未知题号 {args.target}，使用 list 查看题目')
    results = [evaluate(p, args, compiler) for p in selected]
    print(f'\n完成：{sum(r["status"] == "AC" for r in results)}/{len(results)} 题通过。')
    (ROOT / 'local-results.json').write_text(json.dumps({'version': 1, 'reference': args.reference, 'results': results}, ensure_ascii=False, indent=2), encoding='utf-8')
    return 0 if all(r['status'] == 'AC' for r in results) else 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print('\n已中断。')
        sys.exit(130)

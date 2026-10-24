"""Same-origin local OJ; not a sandbox or multi-user public service."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from functools import partial
import importlib.util
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import threading
import time
from urllib.parse import urlsplit, unquote
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('practice_judge', ROOT / 'practice/judge.py')
judge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(judge)
MAX_SOURCE = 256 * 1024
MAX_INPUT = 64 * 1024


class Busy(Exception):
    pass


class Engine:
    def __init__(self, root=ROOT, cxx='g++', timeout=2.0):
        self.root = Path(root).resolve()
        self.practice = self.root / 'practice'
        self.problems = {p['id']: p for p in json.loads((self.practice / 'manifest.json').read_text(encoding='utf-8'))['problems']}
        self.compiler = shutil.which(cxx)
        self.timeout = timeout
        self.token = secrets.token_urlsafe(32)
        self.folder = self.root / '.local-oj'
        self.folder.mkdir(exist_ok=True)
        self.pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix='cpp-judge')
        self.capacity = threading.BoundedSemaphore(4)
        self.lock = threading.RLock()
        self.jobs = {}
        self.history = []
        self.best = {}
        self.history_path = self.folder / 'history.json'
        self.accepted_path = self.folder / 'accepted.json'
        try:
            accepted = json.loads(self.accepted_path.read_text(encoding='utf-8'))
            if isinstance(accepted, list):
                self.best = {pid: {'problem': pid, 'status': 'AC'} for pid in accepted if isinstance(pid, str) and pid in self.problems}
        except (OSError, ValueError):
            pass
        try:
            saved = json.loads(self.history_path.read_text(encoding='utf-8'))
            if isinstance(saved, list):
                self.history = saved[-300:]
                for row in self.history:
                    if row.get('mode') == 'judge' and row.get('status') == 'AC' and row.get('problem') in self.problems:
                        self.best[row['problem']] = row
        except (OSError, ValueError):
            pass

    def create(self, problem, source, mode, input_text=''):
        if not self.compiler:
            raise ValueError('未找到 C++ 编译器。将 GCC/Clang 加入 PATH，或启动时用 --cxx 指定路径。')
        if problem not in self.problems or mode not in {'sample', 'judge'}:
            raise ValueError('题号或运行方式无效。')
        if not isinstance(source, str) or not source.strip() or len(source.encode('utf-8')) > MAX_SOURCE:
            raise ValueError('代码不能为空，且不得超过 256 KiB。')
        if not isinstance(input_text, str) or len(input_text.encode('utf-8')) > MAX_INPUT:
            raise ValueError('运行输入不得超过 64 KiB。')
        if not self.capacity.acquire(blocking=False):
            raise Busy('评测队列已满，请等待已有提交完成。')
        key = secrets.token_hex(12)
        job = {'job': key, 'problem': problem, 'mode': mode, 'state': 'queued', 'progress': 0,
               'total': 1 if mode == 'sample' else self.problems[problem]['test_count'],
               'submitted': datetime.now(timezone.utc).isoformat()}
        try:
            folder = self.folder / 'submissions' / key
            folder.mkdir(parents=True)
            (folder / self.problems[problem]['filename']).write_bytes(source.encode('utf-8'))
            if mode == 'sample':
                (folder / 'sample.in').write_bytes(input_text.encode('utf-8'))
            with self.lock:
                self.jobs[key] = job
            self.pool.submit(self.work, key, folder)
        except Exception:
            self.capacity.release()
            raise
        return dict(job)

    def snapshot(self, key):
        with self.lock:
            if key not in self.jobs:
                raise KeyError(key)
            return json.loads(json.dumps(self.jobs[key]))

    def work(self, key, folder):
        start = time.monotonic()
        with self.lock:
            job = self.jobs[key]
            job['state'] = 'running'
        p = self.problems[job['problem']]
        try:
            result = self.evaluate(p, job, folder)
        except Exception as error:
            result = {'status': 'ERROR', 'message': f'本地评测未完成：{type(error).__name__}。请查看服务终端。', 'passed': 0, 'cases': []}
            print(f'OJ internal error: {error}', flush=True)
        try:
            with self.lock:
                job.update(result)
                job.update(state='done', elapsed_ms=round((time.monotonic() - start) * 1000))
                row = {k: job[k] for k in ['job', 'problem', 'mode', 'status', 'submitted', 'elapsed_ms', 'total']}
                row['passed'] = job.get('passed', 0)
                self.history.append(row)
                self.history = self.history[-300:]
                if job['mode'] == 'judge' and job['status'] == 'AC':
                    self.best[job['problem']] = row
                temporary = self.history_path.with_suffix('.tmp')
                temporary.write_bytes((json.dumps(self.history, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
                temporary.replace(self.history_path)
                accepted_temporary = self.accepted_path.with_suffix('.tmp')
                accepted_temporary.write_bytes((json.dumps(sorted(self.best)) + '\n').encode('utf-8'))
                accepted_temporary.replace(self.accepted_path)
                (folder / 'result.json').write_bytes((json.dumps(job, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
        finally:
            self.capacity.release()

    def evaluate(self, p, job, folder):
        source = folder / p['filename']
        build = folder / 'build'
        build.mkdir()
        if p['mode'] == 'header':
            driver = (self.practice / 'drivers' / (p['id'] + '.cpp')).read_text(encoding='utf-8')
            driver = driver.replace('#include "solution.hpp"', '#include ' + json.dumps(source.as_posix(), ensure_ascii=False))
            actual = build / 'driver.cpp'
            actual.write_bytes(driver.encode('utf-8'))
        else:
            actual = source
        exe = build / ('program.exe' if os.name == 'nt' else 'program')
        command = [self.compiler, '-std=c++17', '-O2', '-Wall', '-Wextra', '-pedantic', '-I', str(source.parent), str(actual), '-o', str(exe)]
        try:
            compiled = subprocess.run(command, capture_output=True, timeout=60)
        except subprocess.TimeoutExpired:
            return {'status': 'CE', 'message': '编译超过 60 秒。', 'passed': 0, 'cases': []}
        log = compiled.stderr.decode('utf-8', errors='replace')[:12000]
        if compiled.returncode:
            return {'status': 'CE', 'message': '编译错误，请检查下方编译器输出。', 'compiler_log': log, 'passed': 0, 'cases': []}
        inputs = [folder / 'sample.in'] if job['mode'] == 'sample' else sorted((self.practice / 'tests' / p['id']).glob('*.in'))
        if not inputs:
            return {'status': 'ERROR', 'message': '本题缺少测试文件。', 'passed': 0, 'cases': []}
        cases = []
        passed = 0
        for i, inp in enumerate(inputs, 1):
            status, stdout, stderr, elapsed = judge.run_limited([str(exe)], inp, build, self.timeout)
            row = {'name': inp.name, 'status': status, 'elapsed_ms': round(elapsed * 1000)}
            if job['mode'] == 'judge' and status == 'OK':
                expected = inp.with_suffix('.out').read_text(encoding='utf-8')
                status = 'AC' if judge.normalize(expected) == judge.normalize(stdout) else 'WA'
                row['status'] = status
                if status == 'WA':
                    row.update(expected=expected[:8000], actual=stdout[:8000], input=inp.read_text(encoding='utf-8')[:8000])
            elif job['mode'] == 'sample':
                row.update(actual=stdout[:12000])
            if stderr:
                row['stderr'] = stderr[:8000]
            cases.append(row)
            if status in {'AC', 'OK'}:
                passed += 1
            with self.lock:
                job['progress'] = i
            if status not in {'AC', 'OK'}:
                break
        final = next((r['status'] for r in cases if r['status'] not in {'AC', 'OK'}), 'OK' if job['mode'] == 'sample' else 'AC')
        return {'status': final, 'passed': passed, 'cases': cases, 'compiler_log': log,
                'message': '运行完成，请核对输出；样例运行不计入整题通过。' if job['mode'] == 'sample' and final == 'OK' else f'{passed}/{len(inputs)} 组测试通过。'}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, engine, **kwargs):
        self.engine = engine
        super().__init__(*args, directory=str(engine.root), **kwargs)

    def log_message(self, fmt, *args):
        if args and '/api/jobs/' in str(args[0]):
            return
        super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def trusted(self, mutation=False):
        host = f'127.0.0.1:{self.server.server_address[1]}'
        if self.headers.get('Host') != host:
            self.json_response(403, {'error': '请使用启动终端显示的 127.0.0.1 地址。'})
            return False
        origin = self.headers.get('Origin')
        if (origin is not None and origin != 'http://' + host) or (mutation and origin != 'http://' + host):
            self.json_response(403, {'error': '只接受本地 OJ 同源请求。'})
            return False
        if mutation and self.headers.get('X-OJ-Token') != self.engine.token:
            self.json_response(403, {'error': '会话已变化，请刷新本地 OJ 页面。'})
            return False
        return True

    def json_response(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if not self.trusted():
            return
        path = urlsplit(self.path).path
        if path == '/api/meta':
            self.json_response(200, {'local': True, 'token': self.engine.token, 'compiler': Path(self.engine.compiler).name if self.engine.compiler else None, 'standard': 'C++17'})
        elif path == '/api/history':
            with self.engine.lock:
                self.json_response(200, {'history': list(reversed(self.engine.history)), 'accepted': list(self.engine.best)})
        elif re.fullmatch(r'/api/jobs/[a-f0-9]{24}', path):
            try:
                self.json_response(200, self.engine.snapshot(path.rsplit('/', 1)[1]))
            except KeyError:
                self.json_response(404, {'error': '未找到该次提交；重启前的记录可在提交历史查看。'})
        elif path.startswith('/api/'):
            self.json_response(404, {'error': '未知接口。'})
        else:
            decoded = unquote(path)
            segments = Path(decoded.replace('\\', '/').lstrip('/')).parts
            dest = Path(self.translate_path(self.path)).resolve()
            if any(s.startswith('.') for s in segments) or not dest.is_relative_to(self.engine.root):
                self.send_error(403)
                return
            if dest.is_dir() and not (dest / 'index.html').is_file():
                self.send_error(403, 'Directory listings disabled')
                return
            super().do_GET()

    def do_HEAD(self):
        # Keep identical path/Host protections; GET sends the same headers for browser assets.
        self.send_error(405, 'Use GET')

    def do_POST(self):
        if not self.trusted(mutation=True):
            return
        if self.path != '/api/jobs':
            self.json_response(404, {'error': '未知接口。'})
            return
        if self.headers.get_content_type() != 'application/json':
            self.json_response(415, {'error': '需要 JSON 请求。'})
            return
        try:
            size = int(self.headers.get('Content-Length', '-1'))
            if size <= 0 or size > MAX_SOURCE + MAX_INPUT + 32768:
                self.json_response(413, {'error': '提交过大或请求长度无效。'})
                return
            payload = json.loads(self.rfile.read(size).decode('utf-8'))
            if not isinstance(payload, dict):
                raise ValueError('请求格式无效。')
            problem = payload.get('problem')
            if not isinstance(problem, str):
                raise ValueError('题号无效。')
            job = self.engine.create(problem, payload.get('source'), payload.get('mode'), payload.get('input', ''))
            self.json_response(202, job)
        except Busy as error:
            self.json_response(429, {'error': str(error)})
        except (ValueError, UnicodeError, TypeError) as error:
            self.json_response(400, {'error': str(error)})


def make_server(engine, port=8765):
    server = ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, engine=engine))
    server.daemon_threads = True
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--cxx', default=os.environ.get('CXX', 'g++'))
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error('端口范围为 0..65535；0 表示选择空闲端口。')
    engine = Engine(cxx=args.cxx)
    try:
        server = make_server(engine, args.port)
    except OSError as error:
        parser.exit(2, f'无法启动本地服务：{error}。可使用 --port 8766 更换端口。\n')
    url = f'http://127.0.0.1:{server.server_address[1]}/#oj/p65'
    print(f'本地 OJ：{url}\n编译器：{engine.compiler or "未找到，请用 --cxx 指定"}\n提交快照：{engine.folder}\n只运行自己的可信代码；按 Ctrl+C 停止服务。', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n正在等待本次评测结束…', flush=True)
    finally:
        server.server_close()
        engine.pool.shutdown(wait=True)


if __name__ == '__main__':
    main()

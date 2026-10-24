"""Real HTTP + compiler integration tests; uses an isolated temporary course tree."""
from pathlib import Path
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from oj.server import Engine, make_server

manifest=json.loads((ROOT/'practice/manifest.json').read_text(encoding='utf-8'))
test_build=ROOT/'.build'
test_build.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='cpp-oj-test-',dir=test_build) as temp:
    base=Path(temp).resolve()
    assert base.is_relative_to(test_build.resolve())
    practice=base/'practice';practice.mkdir()
    selected=[p for p in manifest['problems'] if p['id'] in {'p01','p13','p65'}]
    (practice/'manifest.json').write_text(json.dumps({'problems':selected}),encoding='utf-8')
    for p in selected:
        shutil.copytree(ROOT/'practice/tests'/p['id'],practice/'tests'/p['id'])
        if p['mode']=='header':
            (practice/'drivers').mkdir(exist_ok=True)
            shutil.copy2(ROOT/'practice/drivers'/f'{p["id"]}.cpp',practice/'drivers'/f'{p["id"]}.cpp')
    (base/'index.html').write_text('<!doctype html><title>Local OJ test</title>',encoding='utf-8')
    before=(ROOT/'practice/solutions/p65/main.cpp').read_bytes()
    engine=Engine(base,timeout=.2)
    server=make_server(engine,0);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    address=f'http://127.0.0.1:{server.server_address[1]}'

    def request(path,payload=None,headers=None,raw=None):
        h={'Origin':address}
        if payload is not None or raw is not None:
            h.update({'Content-Type':'application/json','X-OJ-Token':engine.token})
        h.update(headers or {})
        body=raw if raw is not None else json.dumps(payload).encode() if payload is not None else None
        r=urllib.request.Request(address+path,data=body,headers=h)
        try:
            with urllib.request.urlopen(r,timeout=10) as response:
                text=response.read();return response.status,json.loads(text) if response.headers.get_content_type()=='application/json' else text
        except urllib.error.HTTPError as error:
            body=error.read()
            return error.code,json.loads(body) if error.headers.get_content_type()=='application/json' else body

    def submit(source,status,problem='p01',mode='judge',input_text=''):
        code,job=request('/api/jobs',{'problem':problem,'mode':mode,'source':source,'input':input_text})
        assert code==202,(code,job)
        states={job['state']};deadline=time.monotonic()+75
        while True:
            code,result=request('/api/jobs/'+job['job']);assert code==200
            states.add(result['state'])
            if result['state']=='done':break
            assert time.monotonic()<deadline,'job never completed'
            time.sleep(.05)
        assert result['status']==status,(status,result)
        assert (engine.folder/'submissions'/job['job']/'result.json').is_file()
        assert result['mode']==mode and 'done' in states
        print(f'HTTP {mode} {problem}: {status}, {result["passed"]}/{result["total"]}',flush=True)
        return result

    try:
        assert request('/')[0]==200
        meta=request('/api/meta')[1];assert meta['compiler'] and meta['token']==engine.token
        assert request('/api/meta',headers={'Host':'evil.test'})[0]==403
        assert request('/api/meta',headers={'Origin':'https://evil.test'})[0]==403
        assert request('/.local-oj/history.json')[0]==403
        assert request('/api/jobs',{'problem':'p01','mode':'judge','source':'int main(){}'},headers={'X-OJ-Token':'wrong'})[0]==403
        assert request('/api/jobs',{'problem':'../p01','mode':'judge','source':'int main(){}'})[0]==400
        assert request('/api/jobs',{'problem':'p01','mode':'judge','source':'x'*262145})[0]==400
        assert request('/api/jobs',raw=b'not json')[0]==400
        assert request('/api/jobs',{'problem':'p01','mode':'judge','source':'int main(){}'},headers={'Origin':'null'})[0]==403
        ac=(ROOT/'practice/reference/p01/main.cpp').read_text(encoding='utf-8')
        sample=submit('#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}','OK',mode='sample',input_text='2 5\n')
        assert sample['cases'][0]['actual'].replace('\r\n','\n')=='7\n',sample
        assert request('/api/history')[1]['accepted']==[], 'Sample run incorrectly marked accepted.'
        good=submit(ac,'AC')
        bad=submit('int main(){}','WA');assert 'expected' in bad['cases'][0] and 'actual' in bad['cases'][0]
        ce=submit('int main( {','CE');assert ce['compiler_log']
        submit('int main(){return 7;}','RE')
        submit('int main(){for(;;){}}','TLE')
        engine.timeout=3
        output='#include <cstdio>\nstatic char s[2097152];\nint main(){std::fwrite(s,1,sizeof(s),stdout);}'
        submit(output,'OLE')
        engine.timeout=2
        header=(ROOT/'practice/reference/p13/solution.hpp').read_text(encoding='utf-8')
        submit(header,'AC',problem='p13')
        submit((ROOT/'practice/reference/p65/main.cpp').read_text(encoding='utf-8'),'AC',problem='p65')
        history=request('/api/history')[1]
        assert set(history['accepted'])=={'p01','p13','p65'}
        assert len(history['history'])==9
        assert (ROOT/'practice/solutions/p65/main.cpp').read_bytes()==before,'Starter overwritten by submission.'
        # Test bounded admission without relying on compilation timing.
        for _ in range(4):assert engine.capacity.acquire(blocking=False)
        assert request('/api/jobs',{'problem':'p01','mode':'judge','source':ac})[0]==429
        for _ in range(4):engine.capacity.release()
        engine.pool.shutdown(wait=True)
        # Old ACs survive history trimming, independently of the latest 300 submissions.
        engine.history_path.write_text(json.dumps([r for r in engine.history if r['problem']=='p01']),encoding='utf-8')
        restored=Engine(base,timeout=.2)
        assert set(restored.best)=={'p01','p13','p65'}
        restored.pool.shutdown(wait=True)
        print('Local OJ integration passed: compiler/runtime verdicts, interface driver, samples excluded from AC, persistence, isolated snapshots, bounded queue, invalid input/origin/Host rejected.',flush=True)
    finally:
        server.shutdown();server.server_close();engine.pool.shutdown(wait=True)

"""结构、下载包与内部数据的一致性检查。"""
import hashlib
import json
from pathlib import Path
import re
import zipfile

ROOT=Path(__file__).resolve().parents[1]
curriculum=json.loads((ROOT/'curriculum.json').read_text(encoding='utf-8'))
manifest=json.loads((ROOT/'practice/manifest.json').read_text(encoding='utf-8'))
assert len(curriculum['chapters'])==44
assert len(manifest['problems'])==96
assert len(manifest['demos'])==44
assert {c['track'] for c in curriculum['chapters']} == {'cpp','dsa'}
assert len({p['id'] for p in manifest['problems']}) == 96
assert [c['number'] for c in curriculum['chapters']]==list(range(1,45))
total=0
for chapter in curriculum['chapters']:
    assert (ROOT/chapter['file']).is_file()
    assert 2<=len(chapter['problems'])<=3
    assert all(next(p for p in manifest['problems'] if p['id']==pid)['chapter']==chapter['number'] for pid in chapter['problems'])
    assert (ROOT/'demos'/f'{chapter["demo"]}.cpp').is_file()
    assert '{{demo}}' not in (ROOT/chapter['file']).read_text(encoding='utf-8')
for p in manifest['problems']:
    for folder in ['solutions','reference']:
        assert (ROOT/'practice'/folder/p['id']/p['filename']).is_file()
    inputs=list((ROOT/'practice/tests'/p['id']).glob('*.in'))
    assert len(inputs)==p['test_count']
    assert all(f.with_suffix('.out').is_file() for f in inputs)
    total+=len(inputs)
pack=ROOT/'downloads/cpp-study-kit.zip'
with zipfile.ZipFile(pack) as z:
    names=z.namelist()
    assert len(names)==len(set(names))
    assert 'cpp-guide/practice/judge.py' in names
    assert not any('/.build/' in x or '/.local-oj/' in x or '/review/' in x or x.endswith('.exe') or 'local-results.json' in x for x in names)
    assert all(not x.startswith('/') and '..' not in Path(x).parts for x in names)
    for name in ['practice/judge.py','assets/app.js','content/07-copy-move.md','algorithms/dsa.hpp','content/22-search-trees.md','run_oj.py','oj/server.py','assets/oj.js','assets/oj.css','training-paths.json','practice/solutions/p96/main.cpp']:
        assert z.read('cpp-guide/'+name)==(ROOT/name).read_bytes()
expected=(ROOT/'downloads/SHA256SUMS.txt').read_text(encoding='utf-8').split()[0]
assert hashlib.sha256(pack.read_bytes()).hexdigest()==expected
payload=(ROOT/'assets/data.js').read_text(encoding='utf-8')
data=json.loads(payload[len('window.CPP_GUIDE='):-2])
assert len(data['chapters'])==44 and len(data['problems'])==96
assert all('<h2' in c['html'] and '<pre>' in c['html'] for c in data['chapters'])
assert all('<int[]>' not in p['html'].replace('&lt;int[]&gt;','') for p in data['problems'])
for p in data['problems']:
    assert p['starter_source']==(ROOT/'practice/solutions'/p['id']/p['filename']).read_text(encoding='utf-8')
    sample=p['samples'][0]
    first=sorted((ROOT/'practice/tests'/p['id']).glob('*.in'))[0]
    assert sample['input']==first.read_text(encoding='utf-8')
    assert sample['output']==first.with_suffix('.out').read_text(encoding='utf-8')
paths=data['training_paths']['paths']
assert {p['id'] for p in paths}=={'exam','career'}
for path in paths:
    assert len(path['stages'])==6
    listed=[pid for s in path['stages'] for pid in s['problems']]
    assert len(set(listed))==len(listed),'Duplicate assignment within a route'
    assert set(listed)<=set(p['id'] for p in data['problems'])
    assert all(1<=n<=44 for s in path['stages'] for n in s['chapters'])
assert total==1208
print(f'Content consistency: 44 chapters, 44 demos, 96 exercises, {total} test pairs, 2 staged paths and package checksum verified.')

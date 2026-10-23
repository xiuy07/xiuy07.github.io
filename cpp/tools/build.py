#!/usr/bin/env python3
"""从本项目 Markdown/manifest 生成网页数据与可下载学习包。"""
import hashlib
import html
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
try:
    import markdown
    from pygments.formatters import HtmlFormatter
except ImportError:
    sys.exit('构建网页需要 Markdown 与 Pygments：python -m pip install -r requirements-dev.txt；本地评测本身无需安装。')


def render(text):
    return markdown.markdown(text, extensions=['fenced_code', 'tables', 'toc', 'codehilite'],
                             extension_configs={'codehilite': {'guess_lang': False}})


def write_utf8(path, text):
    path.write_bytes(text.encode('utf-8'))


def body(text):
    return re.sub(r'^# [^\n]*\n', '', text, count=1).strip()


def outline(rendered):
    return [{'id': key, 'title': html.unescape(re.sub('<[^>]+>', '', text))}
            for key, text in re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', rendered)]


def main():
    curriculum=json.loads((ROOT/'curriculum.json').read_text(encoding='utf-8'))
    manifest=json.loads((ROOT/'practice/manifest.json').read_text(encoding='utf-8'))
    data={'version':'2026-10-23','chapters':[],'problems':[]}
    for ch in curriculum['chapters']:
        text=(ROOT/ch['file']).read_text(encoding='utf-8')
        rendered=render(body(text))
        data['chapters'].append({**ch,'html':rendered,'toc':outline(rendered),'search':text})
    for p in manifest['problems']:
        pid=p['id']
        text=(ROOT/'practice/statements'/f'{pid}.md').read_text(encoding='utf-8')
        source=(ROOT/'practice/reference'/pid/p['filename']).read_text(encoding='utf-8')
        stub=(ROOT/'practice/solutions'/pid/p['filename']).read_text(encoding='utf-8')
        driver=(ROOT/'practice/drivers'/f'{pid}.cpp').read_text(encoding='utf-8') if p['mode']=='header' else ''
        data['problems'].append({**p,'html':render(body(text)), 'search':text,
                                 'reference_html':render('```cpp\n'+source+'\n```'),
                                 'starter_html':render('```cpp\n'+stub+'\n```'),
                                 'driver_html':render('```cpp\n'+driver+'\n```') if driver else ''})
    source_text=(ROOT/'content/sources.md').read_text(encoding='utf-8')
    data['sources']=render(body(source_text))
    (ROOT/'assets').mkdir(exist_ok=True)
    payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    write_utf8(ROOT/'assets/data.js', 'window.CPP_GUIDE='+payload+';\n')
    write_utf8(ROOT/'assets/highlight.css', HtmlFormatter(style='native').get_style_defs('.codehilite'))

    # 资源随内容变化版本，避免发布更新后浏览器沿用旧代码或样式。
    entry=(ROOT/'index.html').read_text(encoding='utf-8')
    for asset in ['vendor/tabler/tabler.min.css','workspace.css','highlight.css','data.js','results.js','app.js']:
        version=hashlib.sha256((ROOT/'assets'/asset).read_bytes()).hexdigest()[:10]
        entry=re.sub(r'assets/'+re.escape(asset)+r'(?:\?v=[a-f0-9]+)?', 'assets/'+asset+'?v='+version, entry)
    write_utf8(ROOT/'index.html', entry)

    # 下载包排除临时文件、测试结果、发布包本身与构建目录。
    downloads=ROOT/'downloads'
    downloads.mkdir(exist_ok=True)
    pack=downloads/'cpp-study-kit.zip'
    with zipfile.ZipFile(pack,'w',compression=zipfile.ZIP_DEFLATED) as z:
        for f in sorted(ROOT.rglob('*')):
            if not f.is_file():continue
            rel=f.relative_to(ROOT)
            if any(x in {'.build','downloads','__pycache__','.git','review'} for x in rel.parts):continue
            if f.name in {'local-results.json','.DS_Store'} or f.suffix in {'.exe','.pyc'}:continue
            z.write(f,'cpp-guide/'+rel.as_posix())
    digest=hashlib.sha256(pack.read_bytes()).hexdigest()
    write_utf8(downloads/'SHA256SUMS.txt', digest+'  cpp-study-kit.zip\n')
    print(f'Built {len(data["chapters"])} chapters, {len(data["problems"])} problems; package {pack.stat().st_size:,} bytes.')


if __name__=='__main__':main()

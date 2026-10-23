"""静态界面的本地资源、授权和下载包检查；仅依赖 Python 标准库。"""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]


class Entry(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'script' and attrs.get('src'):
            self.assets.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') in {'stylesheet', 'preload', 'icon'}:
            self.assets.append(attrs['href'])


entry = Entry()
entry.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
assert len(entry.ids) == len(set(entry.ids)), 'duplicate ids in application shell'
for element in ['sidebar', 'global-nav', 'course-nav', 'menu-toggle', 'menu-close',
                'menu-backdrop', 'reader-settings', 'theme-toggle', 'search', 'search-results']:
    assert element in entry.ids
for asset in entry.assets:
    assert not re.match(r'https?:|//', asset), f'external runtime dependency: {asset}'
    assert (ROOT / asset.split('?')[0]).is_file(), asset
record = json.loads((ROOT / 'assets/vendor/dependencies.json').read_text(encoding='utf-8'))
core = ROOT / 'assets/vendor/tabler/tabler.min.css'
assert hashlib.sha256(core.read_bytes()).hexdigest() == record['tabler']['sha256']
assert record['tabler']['version'] == '1.7.0'
assert 'assets/workspace.css' in ' '.join(entry.assets)
assert not any('assets/style.css' in x for x in entry.assets)
with zipfile.ZipFile(ROOT / 'downloads/cpp-study-kit.zip') as archive:
    for relative in ['assets/vendor/tabler/LICENSE', 'assets/vendor/bootstrap/LICENSE', 'assets/vendor/tabler-icons/LICENSE',
                     'assets/vendor/inter/LICENSE', 'assets/vendor/inter/inter-latin-wght-normal.woff2',
                     'assets/vendor/study-sans-sc/LICENSE', 'assets/vendor/study-sans-sc/study-sans-sc-wght.woff2',
                     'assets/vendor/study-sans-sc/coverage.json',
                     'assets/vendor/jetbrains-mono/LICENSE', 'assets/vendor/jetbrains-mono/jetbrains-mono-latin-wght-normal.woff2',
                     'assets/vendor/tabler/tabler.min.css', 'assets/workspace.css', 'THIRD_PARTY.md']:
        assert archive.read('cpp-guide/' + relative) == (ROOT / relative).read_bytes(), relative
for css in [core, ROOT / 'assets/workspace.css']:
    for url in re.findall(r'url\(([^)]+)\)', css.read_text(encoding='utf-8')):
        url = url.strip('\"\' ')
        if url.startswith('data:'):
            continue
        assert not url.startswith(('http:', 'https:', '//')), url
        assert (css.parent / url.split('?')[0]).is_file(), url
for key, relative in [('study-sans-sc', 'study-sans-sc/study-sans-sc-wght.woff2'),
                      ('jetbrains-mono', 'jetbrains-mono/jetbrains-mono-latin-wght-normal.woff2')]:
    font = ROOT / 'assets/vendor' / relative
    assert font.read_bytes()[:4] == b'wOF2', font
    assert hashlib.sha256(font.read_bytes()).hexdigest() == record[key]['sha256'], font
print('UI integrity OK: local template/font/icons, unique shell controls, pinned CSS digest and packaged licenses.')

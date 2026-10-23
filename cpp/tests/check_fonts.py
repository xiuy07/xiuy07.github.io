"""Font development check. Requires fonttools[woff]; not needed for local judging."""
import importlib.util
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_fonts', ROOT / 'tools/build_fonts.py')
build_fonts = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_fonts)

cjk = TTFont(ROOT / 'assets/vendor/study-sans-sc/study-sans-sc-wght.woff2')
cmap = cjk.getBestCmap()
course = build_fonts.course_characters()
han = {c for c in course if 0x3400 <= c <= 0x9fff}
assert han <= set(cmap), f'Missing course Han characters: {sorted(han - set(cmap))}'
assert cjk['name'].getDebugName(1) == 'Study Sans SC'
assert cjk['name'].getDebugName(6) == 'StudySansSC'
record = json.loads((ROOT / 'assets/vendor/study-sans-sc/coverage.json').read_text())
assert set(record) == set(cmap)
for weight in [400, 500, 600, 700]:
    instance = instantiateVariableFont(cjk, {'wght': weight}, inplace=False)
    assert instance.getBestCmap() == cmap
    assert len(instance['hmtx'].metrics) > len(han)

mono = TTFont(ROOT / 'assets/vendor/jetbrains-mono/jetbrains-mono-latin-wght-normal.woff2')
latin = mono.getBestCmap()
assert set(range(32, 127)) <= set(latin)
widths = {mono['hmtx'][latin[c]][0] for c in range(32, 127)}
assert len(widths) == 1, 'Programming glyphs must retain a fixed advance width.'
axis = next(a for a in mono['fvar'].axes if a.axisTag == 'wght')
assert axis.minValue <= 400 and axis.maxValue >= 700
print(f'Fonts OK: {len(han)} course Han characters covered; 400/500/600/700 weights; all printable ASCII code glyphs monospaced.')

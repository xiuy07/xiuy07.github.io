#!/usr/bin/env python3
"""Rebuild the course's local CJK font. Optional dev dependencies: fonttools, brotli.

Usage: python tools/build_fonts.py /path/to/original/NotoSansSC[wght].ttf
The original font is read only. Preserve the bundled OFL license.
"""
import argparse
import hashlib
import json
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / 'assets/vendor/study-sans-sc'


def course_characters():
    paths = [ROOT / 'index.html', ROOT / 'curriculum.json', ROOT / 'practice/manifest.json',
             ROOT / 'assets/app.js']
    for folder, suffixes in [('content', {'.md'}), ('practice', {'.md', '.cpp', '.hpp'}),
                             ('demos', {'.cpp', '.out'}), ('algorithms', {'.md', '.hpp'})]:
        paths += [p for p in (ROOT / folder).rglob('*') if p.is_file() and p.suffix in suffixes]
    characters = set(''.join(p.read_text(encoding='utf-8') for p in paths))
    # Retain punctuation and printable Latin in addition to all current course text.
    for start, end in [(0x20, 0x7f), (0xa0, 0x100), (0x2000, 0x2070), (0x3000, 0x3040), (0xff00, 0xfff0)]:
        characters.update(chr(c) for c in range(start, end))
    return {ord(c) for c in characters}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    font = TTFont(args.source)
    original_map = font.getBestCmap()
    keep = course_characters() & set(original_map)
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=keep)
    worker.subset(font)
    # This is a modified font under OFL. Use an independent internal family name.
    names = {1: 'Study Sans SC', 2: 'Regular', 3: 'StudySansSC-CourseSubset-1',
             4: 'Study Sans SC', 6: 'StudySansSC', 16: 'Study Sans SC', 17: 'Regular',
             25: 'StudySansSC'}
    for record in font['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    font.flavor = 'woff2'
    output = FONT_DIR / 'study-sans-sc-wght.woff2'
    font.save(output)
    rebuilt = TTFont(output)
    assert keep <= set(rebuilt.getBestCmap())
    axis = next(a for a in rebuilt['fvar'].axes if a.axisTag == 'wght')
    assert axis.minValue <= 400 and axis.maxValue >= 700
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    record = json.loads((ROOT / 'assets/vendor/dependencies.json').read_text(encoding='utf-8'))
    record['study-sans-sc'] = {
        'source': 'https://github.com/google/fonts/tree/main/ofl/notosanssc',
        'source_file': 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',
        'original_version': font['name'].getDebugName(5), 'family': 'Study Sans SC',
        'upstream_family': 'Noto Sans SC', 'license': 'OFL-1.1',
        'modification': 'Course character subset, renamed internal family, converted to WOFF2; variable weight preserved.',
        'source_sha256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
        'sha256': digest, 'unicode_count': len(keep),
        'weight_range': [axis.minValue, axis.maxValue],
    }
    (ROOT / 'assets/vendor/dependencies.json').write_bytes((json.dumps(record, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    (FONT_DIR / 'coverage.json').write_bytes((json.dumps(sorted(keep)) + '\n').encode('utf-8'))
    print(f'Study Sans SC: {len(keep)} code points, {output.stat().st_size:,} bytes, wght {axis.minValue:g}..{axis.maxValue:g}.')


if __name__ == '__main__':
    main()

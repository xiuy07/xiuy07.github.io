"""从本学习包的Markdown重新生成data.js，无需原始资料。"""
from pathlib import Path
import json
import markdown
import re

ROOT=Path(__file__).resolve().parents[1]
def render(text):
    return markdown.markdown(text,extensions=['fenced_code','tables','sane_lists','codehilite'],extension_configs={'codehilite':{'guess_lang':False,'css_class':'highlight'}})
def main():
    data=json.loads((ROOT/'curriculum.json').read_text(encoding='utf-8'))
    for c in data['chapters']:
        text=(ROOT/'content'/f'{c["id"]}.md').read_text(encoding='utf-8')
        c['html']=render(text)
        # 搜索也使用编辑后的正文。
        c['body']=text
        for p in c['problems']:
            c['html']=c['html'].replace(f'../practice/statements/{p}.md',f'#problem/{p}')
        c['html']=c['html'].replace('../SOURCES.md','#sources')
    for p in data['problems']:
        p['html']=render((ROOT/'practice/statements'/f'{p["id"]}.md').read_text(encoding='utf-8'))
        p['reference']=(ROOT/'practice/reference'/p['id']/'main.py').read_text(encoding='utf-8')
    data['sourcesHtml']=render((ROOT/'SOURCES.md').read_text(encoding='utf-8'))
    (ROOT/'curriculum.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    (ROOT/'assets/data.js').write_text('window.PYTHON_GUIDE = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print('Rebuilt',len(data['chapters']),'chapters and',len(data['problems']),'problems')
if __name__=='__main__':main()

"""生成完整离线学习包，排除个人答案、临时文件与下载包自身。"""
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]
def main():
    target=ROOT/'downloads/python-study-kit.zip'
    target.parent.mkdir(exist_ok=True)
    files=[]
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file():continue
        rel=path.relative_to(ROOT)
        if any(v in rel.parts for v in ['downloads','__pycache__','.build','.venv','project-output','.git']):continue
        if path.suffix=='.pyc':continue
        files.append((path,rel))
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for path,rel in files:
            # 避免维护者重打包时分发自己的答案：作答区始终重新生成空模板。
            if len(rel.parts)==4 and rel.parts[:2]==('practice','solutions') and path.name=='main.py':
                z.writestr('python-study-kit/'+rel.as_posix(),f'"""{rel.parts[2]} 在 solve(data) 中完成题目，题面见 practice/statements。"""\n\ndef solve(data):\n    # TODO：实现后运行 python practice/judge.py {rel.parts[2]}\n    raise NotImplementedError("请完成本题")\n')
            elif rel.parts[0]=='notes':
                z.writestr('python-study-kit/'+rel.as_posix(),'# 我的错题本\n\n日期 | 题号 | 最小失败输入 | 根因 | 修正 | 重做日期\n---|---|---|---|---|---\n')
            else:z.write(path,'python-study-kit/'+rel.as_posix())
    print(target,'files',len(files),'bytes',target.stat().st_size)
if __name__=='__main__':main()

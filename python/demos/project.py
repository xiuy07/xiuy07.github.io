"""运行：python demos/project.py；结果写入当前目录 project-output。"""
from pathlib import Path
import json
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def run():
    source=Path(__file__).resolve().parents[1]/'data'/'orders.csv'
    out=Path.cwd()/'project-output'
    out.mkdir(exist_ok=True)
    raw=pd.read_csv(source,dtype={'id':'string'})
    dedup=raw.drop_duplicates('id',keep='last').copy()
    for col in ['price','qty']:
        dedup[col]=pd.to_numeric(dedup[col],errors='coerce')
    clean=dedup.dropna(subset=['price','qty'])
    clean=clean.loc[(clean['price']>=0)&(clean['qty']>=0)].copy()
    clean['revenue']=clean['price']*clean['qty']
    summary=clean.groupby('city',as_index=False)['revenue'].sum().sort_values('city')
    clean.to_csv(out/'cleaned.csv',index=False,encoding='utf-8-sig')
    summary.to_csv(out/'summary.csv',index=False,encoding='utf-8-sig')
    report={'input_rows':len(raw),'duplicate_rows_removed':len(raw)-len(dedup),'invalid_rows_removed':len(dedup)-len(clean),'valid_rows':len(clean),'total_revenue':float(clean['revenue'].sum()),'city_revenue':summary.to_dict('records')}
    (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    fig,ax=plt.subplots(figsize=(7,4),layout='constrained')
    ax.bar(summary['city'],summary['revenue'],color='#236759')
    ax.set(title='Revenue by city (teaching dataset)',xlabel='City',ylabel='Revenue / CNY')
    ax.spines[['top','right']].set_visible(False)
    fig.savefig(out/'revenue.png',dpi=180)
    plt.close(fig)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return report

if __name__=='__main__':
    run()

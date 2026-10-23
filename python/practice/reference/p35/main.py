import pandas as pd
def solve(data):
    df = pd.DataFrame(data, columns=['city','score'])
    df['score'] = pd.to_numeric(df['score'])
    result = df.groupby('city', as_index=False, sort=True).agg(rows=('score','size'), valid=('score','count'), mean=('score','mean'))
    return [{'city':r.city,'rows':int(r.rows),'valid':int(r.valid),'mean':None if pd.isna(r.mean) else float(r.mean)} for r in result.itertuples(index=False)]

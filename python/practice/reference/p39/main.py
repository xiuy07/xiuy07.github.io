import pandas as pd
def solve(data):
    df = pd.DataFrame(data, columns=['id','city','price','qty']).drop_duplicates('id', keep='last')
    for col in ['price','qty']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=['price','qty'])
    df = df.loc[(df['price'] >= 0) & (df['qty'] >= 0)].copy()
    df['revenue'] = df['price'] * df['qty']
    result = df.groupby('city', sort=True)['revenue'].sum()
    return [[str(k),float(v)] for k,v in result.items()]

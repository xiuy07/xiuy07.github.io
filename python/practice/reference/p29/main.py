import pandas as pd
def solve(data):
    df = pd.DataFrame(data['rows'], columns=['name','score'])
    df['score'] = pd.to_numeric(df['score'])
    mask = (df['score'] >= data['low']) & (df['score'] < data['high'])
    return df.loc[mask, 'name'].tolist()

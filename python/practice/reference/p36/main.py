import pandas as pd
def solve(data):
    df = pd.DataFrame(data, columns=['city','score'])
    df['score'] = pd.to_numeric(df['score'])
    result = df['score'] - df.groupby('city')['score'].transform('mean')
    return [None if pd.isna(v) else float(v) for v in result]

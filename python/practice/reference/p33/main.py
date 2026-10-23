import pandas as pd
def solve(data):
    df = pd.DataFrame(data, columns=['id','score'])
    df['score'] = pd.to_numeric(df['score'], errors='coerce')
    df = df.drop_duplicates('id', keep='last')
    df['score'] = df['score'].fillna(0)
    return df.to_dict('records')

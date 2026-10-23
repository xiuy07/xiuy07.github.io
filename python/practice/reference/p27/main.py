import pandas as pd
def solve(data):
    df = pd.DataFrame(data, columns=['id', 'score'])
    return {'rows': len(df), 'columns': len(df.columns), 'missing': int(df['score'].isna().sum()), 'unique_ids': int(df['id'].nunique())}

import pandas as pd
def solve(data):
    df = pd.DataFrame({'score': pd.Series(data['scores'], dtype=float)})
    df.loc[df['score'] < data['floor'], 'score'] = data['floor']
    return [None if pd.isna(v) else float(v) for v in df['score']]

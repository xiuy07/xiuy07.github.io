import pandas as pd
def solve(data):
    if not data:
        return []
    df = pd.DataFrame(data)
    df = df.assign(item=df['item'].str.strip().str.upper(), revenue=df['price'] * df['qty'])
    return df[['item','revenue']].to_dict('records')

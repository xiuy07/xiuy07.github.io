import pandas as pd
def solve(data):
    a = pd.Series(data['left'], dtype=float)
    b = pd.Series(data['right'], dtype=float)
    result = (a + b).sort_index()
    return [[str(k), None if pd.isna(v) else float(v)] for k, v in result.items()]

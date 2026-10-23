import pandas as pd
def solve(data):
    frames = [pd.DataFrame(rows, columns=['id','value']).assign(month=i) for i,rows in enumerate(data, 1) if rows]
    return pd.concat(frames, ignore_index=True).to_dict('records') if frames else []

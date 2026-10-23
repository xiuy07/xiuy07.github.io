import pandas as pd
def solve(data):
    df = pd.DataFrame(data, columns=['name','math','python'])
    return df.melt(id_vars='name', value_vars=['math','python'], var_name='subject', value_name='score').to_dict('records')

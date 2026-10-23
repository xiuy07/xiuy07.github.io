import pandas as pd
def solve(data):
    left = pd.DataFrame(data['orders'], columns=['user','amount'])
    right = pd.DataFrame(data['users'], columns=['user','city'])
    if left.empty:
        return []
    if right.empty:
        return [dict(r, city=None) for r in data['orders']]
    result = left.merge(right, on='user', how='left', validate='many_to_one', sort=False)
    return [{'user':int(r.user),'amount':int(r.amount),'city':None if pd.isna(r.city) else r.city} for r in result.itertuples(index=False)]

import pandas as pd
df = pd.DataFrame({"city": ["A", "A", "B"], "score": [80, None, 90]})
report = df.groupby("city", as_index=False).agg(rows=("score", "size"), valid=("score", "count"), mean=("score", "mean"))
print(report.to_dict("records"))
print(df.groupby("city")["score"].transform("mean").tolist())

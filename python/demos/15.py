import pandas as pd
df = pd.DataFrame({"name": ["A", "B", "C"], "score": [58, 80, 95]}, index=[10, 20, 30])
mask = (df["score"] >= 60) & (df["score"] < 90)
print(df.loc[mask, "name"].tolist())
df.loc[df["score"] < 60, "score"] = 60
print(df.loc[10:20, "score"].tolist())
print(df.iloc[0:2]["name"].tolist())

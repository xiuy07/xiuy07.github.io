import pandas as pd
df = pd.DataFrame({"id": [1, 2, 2, 3], "score": ["80", "bad", "90", None]})
df["score"] = pd.to_numeric(df["score"], errors="coerce")
df = df.drop_duplicates("id", keep="last")
missing = int(df["score"].isna().sum())
df["score"] = df["score"].fillna(0).astype("Int64")
print(df.to_dict("records"))
print("filled", missing)

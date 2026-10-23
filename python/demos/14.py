import pandas as pd
from io import StringIO
df = pd.read_csv(StringIO("id,score\n001,80\n002,\n003,90\n"), dtype={"id": "string"})
print(df["id"].tolist())
print(df.shape, df["score"].isna().sum().item())
a = pd.Series([10, 20], index=["A", "B"])
b = pd.Series([1, 2], index=["B", "A"])
print((a + b).to_dict())

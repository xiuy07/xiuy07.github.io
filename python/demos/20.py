import pandas as pd
df = pd.DataFrame({"city": ["A", "B", "A"], "price": [10, 5, 8], "qty": [2, 3, 1]})
df["revenue"] = df["price"] * df["qty"]
summary = df.groupby("city", as_index=False)["revenue"].sum().sort_values("city")
print(summary.to_dict("records"))
print("total", int(summary["revenue"].sum()))

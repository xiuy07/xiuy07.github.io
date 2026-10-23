import pandas as pd
df = pd.DataFrame({"item": [" tea ", "milk"], "price": [5, 8], "qty": [3, 2]})
df = df.assign(item=df["item"].str.strip().str.upper(), revenue=lambda x: x["price"] * x["qty"])
print(df[["item", "revenue"]].to_dict("records"))
wide = pd.DataFrame({"name": ["A"], "math": [80], "python": [90]})
print(wide.melt(id_vars="name", var_name="subject", value_name="score").to_dict("records"))

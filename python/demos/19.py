import pandas as pd
orders = pd.DataFrame({"user": [1, 2, 1], "amount": [10, 20, 5]})
users = pd.DataFrame({"user": [1, 2], "city": ["A", "B"]})
joined = orders.merge(users, on="user", how="left", validate="many_to_one", indicator=True)
print(joined.groupby("city")["amount"].sum().to_dict())
print(joined["_merge"].astype(str).tolist())

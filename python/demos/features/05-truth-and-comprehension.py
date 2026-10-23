print(0 or 99, None or 99, "ok" and 8)
values = [-2, 0, 3, 5]
compact = [x * x for x in values if x > 0]
expanded = []
for x in values:
    if x > 0:
        expanded.append(x * x)
print(compact, compact == expanded)

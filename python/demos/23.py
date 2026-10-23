def summarize(values):
    first, *middle, last = values
    return {"ends": [first, last], "middle_sum": sum(middle)}

print(summarize([2, 4, 6, 8]))
print(summarize([2, 8]))

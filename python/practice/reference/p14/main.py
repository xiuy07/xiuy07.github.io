def windows(values, k):
    if k > len(values):
        return
    total = sum(values[:k])
    yield total
    for i in range(k, len(values)):
        total += values[i] - values[i-k]
        yield total
def solve(data):
    return list(windows(data['values'], data['k']))

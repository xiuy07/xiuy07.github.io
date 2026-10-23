def solve(data):
    total = sum(data['weights'])
    if total == 0:
        return None
    return sum(v*w for v,w in zip(data['values'], data['weights'], strict=True)) / total

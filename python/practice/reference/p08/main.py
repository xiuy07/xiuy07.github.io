def solve(data):
    seen = {}
    for i, value in enumerate(data['nums']):
        need = data['target'] - value
        if need in seen:
            return [seen[need], i]
        seen.setdefault(value, i)
    return []

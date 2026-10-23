def summarize(value):
    if not isinstance(value, list):
        return (value, 1, 0)
    total, leaves, depth = 0, 0, 0
    for child in value:
        s, count, child_depth = summarize(child)
        total += s
        leaves += count
        depth = max(depth, child_depth)
    return total, leaves, depth + 1

def solve(data):
    total, leaves, depth = summarize(data)
    return {'sum': total, 'leaves': leaves, 'depth': depth}

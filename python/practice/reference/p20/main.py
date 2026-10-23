def solve(data):
    return sorted(data, key=lambda row: (-row['score'], row['name']))

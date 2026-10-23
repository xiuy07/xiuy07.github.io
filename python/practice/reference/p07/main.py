from collections import Counter
def solve(data):
    counts = Counter(data)
    return [[word, count] for word, count in sorted(counts.items(), key=lambda p: (-p[1], p[0]))]

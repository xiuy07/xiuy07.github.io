def solve(data):
    result = [0] * 5
    for score in data:
        index = 0 if score >= 90 else 1 if score >= 80 else 2 if score >= 70 else 3 if score >= 60 else 4
        result[index] += 1
    return result

def solve(data):
    first, *middle, last = data
    return {'ends': [first, last], 'middle_sum': sum(middle)}

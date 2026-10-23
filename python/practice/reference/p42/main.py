def make_counter(start):
    total = start
    def add(delta):
        nonlocal total
        total += delta
        return total
    return add

def solve(data):
    counters = [make_counter(x) for x in data['starts']]
    result = [counters[i](delta) for i, delta in data['calls']]
    return {'results': result, 'final': [counter(0) for counter in counters]}

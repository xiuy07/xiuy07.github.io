def compose(outer, inner):
    def combined(x):
        return outer(inner(x))
    return combined

def make_op(name, amount):
    if name == 'add':
        return lambda x: x + amount
    return lambda x: x * amount

def solve(data):
    fn = lambda x: x
    for name, amount in data['ops']:
        fn = compose(make_op(name, amount), fn)
    return fn(data['value'])

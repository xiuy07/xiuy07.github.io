def compose(outer, inner):
    return lambda x: outer(inner(x))

def add_two(x):
    return x + 2

def times_three(x):
    return x * 3

print(compose(times_three, add_two)(4))
print(compose(add_two, times_three)(4))

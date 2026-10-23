def make_counter(start):
    total = start
    def add(step):
        nonlocal total
        total += step
        return total
    return add

a = make_counter(10)
b = make_counter(100)
print(a(2), a(3), b(1))

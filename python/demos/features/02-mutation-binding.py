def change(xs):
    xs.append(3)
    xs = xs + [4]
    return xs

original = [1, 2]
result = change(original)
print(original)
print(result)

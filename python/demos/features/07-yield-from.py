def values():
    print("start")
    yield 2
    yield from [4, 6]
    print("end")

g = values()
print("created")
print(next(g))
print(list(g))
print(next(g, "empty"))

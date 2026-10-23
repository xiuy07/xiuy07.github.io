first, *middle, last = [2, 4, 6, 8]
print(first, middle, last)
print([first, *middle, last, 10])
defaults = {"limit": 5, "reverse": False}
options = {**defaults, "limit": 2}
print(options)

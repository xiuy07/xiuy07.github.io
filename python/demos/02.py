a = [[1], [2]]
b = a.copy()
b[0].append(9)
b.append([3])
print(a)
print(b)
print(a is b, a[0] is b[0])

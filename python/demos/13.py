import numpy as np
a = np.array([[1, 2], [3, 4], [5, 6]], dtype=np.int64)
print(a.shape, a.sum(axis=0).tolist())
centered = a - a.mean(axis=1, keepdims=True)
print(centered.tolist())
b = a[:1]
b[0, 0] = 9
print(a[0].tolist())

import numpy as np
def solve(data):
    a = np.asarray(data, dtype=float)
    return (a - a.mean(axis=1, keepdims=True)).tolist()

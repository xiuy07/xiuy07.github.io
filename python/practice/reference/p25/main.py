import numpy as np
def solve(data):
    return np.asarray(data, dtype=np.int64).sum(axis=0).tolist()

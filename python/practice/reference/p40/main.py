import numpy as np
def solve(data):
    counts, _ = np.histogram(data['values'], bins=data['edges'])
    return counts.tolist()

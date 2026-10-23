import numpy as np
def solve(data):
    train = np.asarray(data['train'], dtype=float)
    test = np.asarray(data['test'], dtype=float)
    std = float(train.std(ddof=0))
    return np.zeros_like(test).tolist() if std == 0 else ((test-train.mean())/std).tolist()

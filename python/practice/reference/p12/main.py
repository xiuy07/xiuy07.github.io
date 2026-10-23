def record(value, history=None):
    if history is None:
        history = []
    history.append(value)
    return history
def solve(data):
    result = []
    for group in data:
        history = None
        for value in group:
            history = record(value, history)
        result.append(history if history is not None else [])
    return result

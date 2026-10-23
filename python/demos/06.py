def record(value, history=None, *, copy_input=True):
    if history is None:
        history = []
    elif copy_input:
        history = history.copy()
    history.append(value)
    return history

old = [1]
print(record(2, old), old)
print(record(3), record(4))

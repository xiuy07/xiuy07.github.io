from functools import wraps
def doubled(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        return 2 * fn(*args, **kwargs)
    return wrapper

@doubled
def total(values):
    return sum(values)

g = (x*x for x in range(4))
print(next(g), list(g), list(g))
print(total([1, 2, 3]), total.__name__)

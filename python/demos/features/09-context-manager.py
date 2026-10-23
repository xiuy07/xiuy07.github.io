from contextlib import contextmanager

@contextmanager
def section():
    print("enter")
    try:
        yield
    finally:
        print("leave")

try:
    with section():
        print("body")
        raise ValueError("bad row")
except ValueError:
    print("handled")

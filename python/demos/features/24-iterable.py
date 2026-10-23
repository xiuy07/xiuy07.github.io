class Countdown:
    def __init__(self, start):
        self.start = start
    def __iter__(self):
        for value in range(self.start, 0, -1):
            yield value

items = Countdown(3)
a, b = iter(items), iter(items)
print(next(a), next(a), next(b))
print(list(items), list(items))

from dataclasses import dataclass

@dataclass(frozen=True)
class Window:
    start: int
    stop: int
    def __iter__(self):
        return iter(range(self.start, self.stop))
    def __len__(self):
        return max(0, self.stop - self.start)
    def __contains__(self, value):
        return value in range(self.start, self.stop)

w = Window(2, 5)
print(list(w), len(w), 4 in w, 5 in w)

from dataclasses import dataclass
@dataclass(frozen=True)
class Vec2:
    x: int
    y: int
    def __add__(self, other):
        if not isinstance(other, Vec2):
            return NotImplemented
        return Vec2(self.x + other.x, self.y + other.y)
def solve(data):
    result = []
    for a, b in data:
        c = Vec2(*a) + Vec2(*b)
        result.append([c.x, c.y])
    return result

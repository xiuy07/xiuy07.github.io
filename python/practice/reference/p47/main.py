from dataclasses import dataclass
from math import gcd

@dataclass(frozen=True)
class Rational:
    numerator: int
    denominator: int
    def __post_init__(self):
        n, d = self.numerator, self.denominator
        if d == 0:
            raise ValueError('zero denominator')
        if d < 0:
            n, d = -n, -d
        g = gcd(n, d)
        object.__setattr__(self, 'numerator', n // g)
        object.__setattr__(self, 'denominator', d // g)
    def __add__(self, other):
        if not isinstance(other, Rational):
            return NotImplemented
        return Rational(self.numerator * other.denominator + other.numerator * self.denominator, self.denominator * other.denominator)

def solve(data):
    total = Rational(0, 1)
    for n, d in data['fractions']:
        total = total + Rational(n, d)
    return [total.numerator, total.denominator]

from functools import cache

def solve(data):
    blocked = set(data['blocked'])
    @cache
    def count(n):
        if n < 0 or n in blocked:
            return 0
        if n == 0:
            return 1
        return count(n - 1) + count(n - 3)
    return count(data['n'])

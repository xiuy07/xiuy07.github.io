from functools import cache

@cache
def ways(n):
    if n < 0:
        return 0
    if n == 0:
        return 1
    return ways(n - 1) + ways(n - 3)

print(ways(8))
print(ways(20))

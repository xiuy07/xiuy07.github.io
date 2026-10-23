from bisect import bisect_left, bisect_right
values = [1, 3, 3, 3, 8]
left = bisect_left(values, 3)
right = bisect_right(values, 3)
print(left, right, values[left:right])
print(max([], default=None))

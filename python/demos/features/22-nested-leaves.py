def count_leaves(tree):
    if not isinstance(tree, list):
        return 1
    return sum(count_leaves(child) for child in tree)

print(count_leaves([1, [2, 3], []]))
print(count_leaves([]))

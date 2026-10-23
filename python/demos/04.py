from collections import Counter
words = ["pear", "apple", "pear", "banana", "apple", "pear"]
counts = Counter(words)
rank = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
print(rank)
print(list(dict.fromkeys(words)))

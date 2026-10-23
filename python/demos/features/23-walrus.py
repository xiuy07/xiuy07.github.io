words = ["py", "python", "data", "x"]
result = [(word, n) for word in words if (n := len(word)) >= 4]
print(result)

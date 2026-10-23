def describe(value):
    match value:
        case ["point", x, y] if x == y:
            return "diagonal"
        case ["point", x, y]:
            return "other point"
        case {"kind": "text", "value": str(text)}:
            return text.upper()
        case _:
            return "unknown"

print(describe(["point", 2, 2]))
print(describe({"kind": "text", "value": "py", "extra": 1}))
print(describe(["point", 2]))

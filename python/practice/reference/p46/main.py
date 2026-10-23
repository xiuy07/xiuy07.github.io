import re

def parse_numbers(parts):
    if any(re.fullmatch(r'[+-]?[0-9]+', p) is None for p in parts):
        return None
    return [int(p) for p in parts]

def evaluate(line):
    match line.split():
        case ['add', x, y]:
            values = parse_numbers([x, y])
            return None if values is None else sum(values)
        case ['neg', x]:
            values = parse_numbers([x])
            return None if values is None else -values[0]
        case ['sum', *parts]:
            values = parse_numbers(parts)
            return None if values is None else sum(values)
        case _:
            return None

def solve(data):
    return [evaluate(line) for line in data]

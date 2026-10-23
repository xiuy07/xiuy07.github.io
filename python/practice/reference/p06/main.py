import re
def solve(data):
    pattern = r'([A-Za-z]+):\s*([0-9]{1,3})(?![0-9])'
    return [[m[1].lower(), int(m[2])] for m in re.finditer(pattern, data) if int(m[2]) <= 100]

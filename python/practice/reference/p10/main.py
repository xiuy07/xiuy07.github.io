def solve(data):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in data:
        if char in '([{':
            stack.append(char)
        elif not stack or stack.pop() != pairs[char]:
            return False
    return not stack

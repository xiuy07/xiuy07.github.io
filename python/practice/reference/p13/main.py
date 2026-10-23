def chunks(values, size):
    block = []
    for value in values:
        block.append(value)
        if len(block) == size:
            yield block
            block = []
    if block:
        yield block
def solve(data):
    return list(chunks(iter(data['values']), data['size']))

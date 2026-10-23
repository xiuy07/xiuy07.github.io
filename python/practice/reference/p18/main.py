def solve(data):
    valid, invalid = [], []
    for i, row in enumerate(data):
        name, age = row.get('name'), row.get('age')
        if isinstance(name, str) and name.strip() and type(age) is int and 0 <= age <= 150:
            valid.append([name.strip(), age])
        else:
            invalid.append(i)
    return {'valid': valid, 'invalid': invalid}

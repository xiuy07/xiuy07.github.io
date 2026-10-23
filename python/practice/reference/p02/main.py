def solve(data):
    total = data['cents'] * data['qty']
    yuan, cents = divmod(total, 100)
    return f'{yuan}.{cents:02d}'

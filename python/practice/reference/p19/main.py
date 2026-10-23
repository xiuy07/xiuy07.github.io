def solve(data):
    return {'count': len(data), 'mean': sum(data)/len(data) if data else None, 'min': min(data) if data else None, 'max': max(data) if data else None}

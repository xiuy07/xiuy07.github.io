def solve(data):
    grid = [[0] * data['m'] for _ in range(data['n'])]
    for r, c, value in data['updates']:
        grid[r][c] = value
    return grid

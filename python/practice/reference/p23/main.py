from concurrent.futures import ThreadPoolExecutor
def square(x):
    return x*x
def solve(data):
    with ThreadPoolExecutor(max_workers=4) as pool:
        return list(pool.map(square, data))

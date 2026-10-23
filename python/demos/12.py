from concurrent.futures import ThreadPoolExecutor
def square(x):
    return x * x

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(square, [3, 1, 2]))
    print(results)

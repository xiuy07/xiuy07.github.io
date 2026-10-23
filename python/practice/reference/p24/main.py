from concurrent.futures import ThreadPoolExecutor
def count_words(text):
    return len(text.split())
def solve(data):
    with ThreadPoolExecutor(max_workers=4) as pool:
        return list(pool.map(count_words, data))

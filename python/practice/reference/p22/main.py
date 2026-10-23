import heapq
def solve(data):
    k = data['k']
    if k == 0:
        return []
    heap = []
    for value in data['values']:
        if len(heap) < k:
            heapq.heappush(heap, value)
        elif value > heap[0]:
            heapq.heapreplace(heap, value)
    return sorted(heap, reverse=True)

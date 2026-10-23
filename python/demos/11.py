from collections import deque
graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
dist = {0: 0}
queue = deque([0])
while queue:
    u = queue.popleft()
    for v in graph[u]:
        if v not in dist:
            dist[v] = dist[u] + 1
            queue.append(v)
print(sorted(dist.items()))

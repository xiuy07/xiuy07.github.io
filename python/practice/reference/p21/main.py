from collections import deque
def solve(data):
    graph = [[] for _ in range(data['n'])]
    for u, v in data['edges']:
        graph[u].append(v)
        graph[v].append(u)
    dist = [-1] * data['n']
    dist[data['start']] = 0
    queue = deque([data['start']])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist

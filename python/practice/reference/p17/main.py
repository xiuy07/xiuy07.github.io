import csv, io
def solve(data):
    valid, rejected = [], 0
    for row in csv.DictReader(io.StringIO(data)):
        try:
            score = int(row['score'])
        except ValueError:
            rejected += 1
            continue
        if not 0 <= score <= 100:
            rejected += 1
            continue
        valid.append([row['name'], score])
    return {'rows': valid, 'rejected': rejected}

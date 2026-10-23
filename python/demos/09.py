import csv, io, json
text = 'name,score\nAlice,88\nBob,unknown\nCai,0\n'
good, rejected = [], 0
for row in csv.DictReader(io.StringIO(text)):
    try:
        score = int(row["score"])
    except ValueError:
        rejected += 1
        continue
    good.append({"name": row["name"], "score": score})
print(json.dumps(good, ensure_ascii=False))
print("rejected", rejected)

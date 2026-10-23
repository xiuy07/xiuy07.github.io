def report(name, /, score=0, *, passed=60):
    return f"{name}: {score >= passed}"

print(report("Lin", 58))
print(report("Lin", score=58, passed=50))
parts = ["Mei", 80]
options = {"passed": 70}
print(report(*parts, **options))

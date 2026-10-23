import re
raw = "  Alice: 88; Bob: 72  "
pairs = re.findall(r"([A-Za-z]+):\s*(\d+)", raw)
print([(name.lower(), int(score)) for name, score in pairs])
print(len("中文"), len("中文".encode("utf-8")))

text = "python"
print(text[1:5:2], text[::-1])
raw = "  py_report.csv  "
clean = raw.strip().removeprefix("py_")
print(clean, raw == clean)
print("ababa".strip("ab"))

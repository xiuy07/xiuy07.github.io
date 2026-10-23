def mean(values: list[float]) -> float | None:
    if not values:
        return None
    return sum(values) / len(values)

def main():
    assert mean([]) is None
    assert mean([0, 2, 4]) == 2
    print("3 values ->", mean([0, 2, 4]))

if __name__ == "__main__":
    main()

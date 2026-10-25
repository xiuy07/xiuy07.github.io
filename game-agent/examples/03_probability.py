"""Stable softmax, sampling, entropy loss and a Wilson teaching interval."""
import json
import math
import random


def softmax(scores, temperature=1.):
    if not scores or not math.isfinite(temperature) or temperature <= 0:
        raise ValueError("Need scores and a finite positive temperature")
    if not all(math.isfinite(s) for s in scores):
        raise ValueError("Scores must be finite")
    shift = max(scores)
    values = [math.exp((s-shift)/temperature) for s in scores]
    total = sum(values)
    return [v/total for v in values]


def wilson(successes, n, z=1.959963984540054):
    if type(n) is not int or type(successes) is not int or n <= 0 or not 0 <= successes <= n:
        raise ValueError("Need 0 <= integer successes <= positive integer n")
    p = successes/n
    denominator = 1 + z*z/n
    center = (p+z*z/(2*n))/denominator
    radius = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n))/denominator
    return max(0., center-radius), min(1., center+radius)


def main():
    p = softmax([0., math.log(2)])
    assert math.isclose(p[1], 2/3)
    assert math.isclose(sum(softmax([1000., 1001.])), 1.)
    rng = random.Random(7)
    draws = rng.choices([0, 1], weights=p, k=1000)
    count = sum(draws)
    low, high = wilson(count, len(draws))
    assert 0 <= low <= count/len(draws) <= high <= 1
    print(json.dumps({
        "source_kind": "teaching_sampling", "is_model_result": False,
        "theoretical_probabilities": p, "target_class_1_loss": -math.log(p[1]),
        "seed": 7, "draws": len(draws), "class_1_count": count,
        "observed_frequency": count/len(draws), "wilson_95_interval": [low, high],
        "assumption": "independent Bernoulli draws; not grouped game evaluation",
    }, indent=2))


if __name__ == "__main__":
    main()

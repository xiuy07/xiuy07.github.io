"""Teaching fixture, not real model performance. Standard library only."""
import argparse
from collections import Counter
import json
from pathlib import Path

DEMO = [
    {"episode_id": "demo-a", "seed": 1, "success": True, "steps": 8, "end_reason": "goal"},
    {"episode_id": "demo-b", "seed": 2, "success": False, "steps": 20, "end_reason": "time_limit"},
    {"episode_id": "demo-c", "seed": 3, "success": True, "steps": 12, "end_reason": "goal"},
]


def summarize(records):
    if not isinstance(records, list):
        raise ValueError("Input must be a list")
    ids = set()
    for index, row in enumerate(records):
        if not isinstance(row, dict):
            raise ValueError(f"Record {index}: expected an object")
        for key in ("episode_id", "seed", "success", "steps", "end_reason"):
            if key not in row:
                raise ValueError(f"Record {index}: missing {key}")
        if not isinstance(row["episode_id"], str) or not row["episode_id"]:
            raise ValueError(f"Record {index}: invalid episode_id")
        if row["episode_id"] in ids:
            raise ValueError(f"Record {index}: duplicate episode_id")
        ids.add(row["episode_id"])
        if type(row["seed"]) is not int or type(row["success"]) is not bool:
            raise ValueError(f"Record {index}: invalid seed or success type")
        if type(row["steps"]) is not int or row["steps"] < 0:
            raise ValueError(f"Record {index}: steps must be a nonnegative integer")
        if not isinstance(row["end_reason"], str) or not row["end_reason"]:
            raise ValueError(f"Record {index}: invalid end_reason")
    successes = [row for row in records if row["success"]]
    return {
        "episodes": len(records),
        "successes": len(successes),
        "success_rate": len(successes) / len(records) if records else None,
        "mean_steps_all": sum(r["steps"] for r in records) / len(records) if records else None,
        "mean_steps_success": sum(r["steps"] for r in successes) / len(successes) if successes else None,
        "end_reasons": dict(Counter(r["end_reason"] for r in records)),
    }


def check_boundaries():
    assert summarize([])["success_rate"] is None
    assert summarize([DEMO[1]])["mean_steps_success"] is None
    for field, value in [("steps", True), ("steps", -1), ("success", "false")]:
        bad = dict(DEMO[0], **{field: value})
        try:
            summarize([bad])
        except ValueError:
            pass
        else:
            raise AssertionError(f"Accepted invalid {field}={value!r}")
    missing = dict(DEMO[0])
    del missing["steps"]
    try:
        summarize([missing])
    except ValueError:
        pass
    else:
        raise AssertionError("Accepted missing steps")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    check_boundaries()
    rows = json.loads(args.input.read_text(encoding="utf-8")) if args.input else DEMO
    result = {"source_kind": "teaching_fixture", "is_model_result": False, **summarize(rows)}
    if not args.input:
        assert result["successes"] == 2
        assert abs(result["mean_steps_all"] - 40 / 3) < 1e-12
        assert result["mean_steps_success"] == 10
    content = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        # Exclusive creation prevents overwriting a previous learning record.
        with args.output.open("x", encoding="utf-8") as stream:
            stream.write(content + "\n")
    print(content)


if __name__ == "__main__":
    main()

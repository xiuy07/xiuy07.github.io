"""Run the seven local teaching checks; record optional missing environment dependencies."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import platform
import subprocess
import sys
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    output = args.output.resolve()
    if not output.is_relative_to(root):
        parser.error("Output must stay inside this project")
    output.mkdir(parents=True, exist_ok=False)
    scripts = sorted(Path(__file__).parent.glob("0[1-7]_*.py"))
    entries = []
    for script in scripts:
        command = [sys.executable, str(script)]
        if script.name.startswith("04_"):
            command.extend(["--save-dir", str(output / "mlp_checkpoint")])
        started = time.perf_counter()
        try:
            result = subprocess.run(command, cwd=root, text=True, encoding="utf-8", errors="replace",
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
            stdout, stderr, code = result.stdout, result.stderr, result.returncode
        except subprocess.TimeoutExpired as exc:
            stdout = exc.stdout.decode("utf-8", "replace") if isinstance(exc.stdout, bytes) else exc.stdout or ""
            stderr, code = "Timed out after 60 seconds", None
        (output / f"{script.stem}.stdout.txt").write_text(stdout, encoding="utf-8")
        (output / f"{script.stem}.stderr.txt").write_text(stderr, encoding="utf-8")
        entry = {"script": script.name, "sha256": hashlib.sha256(script.read_bytes()).hexdigest(),
                 "command": command, "exit_code": code, "seconds": time.perf_counter()-started}
        if code == 0:
            try:
                entry["result"] = json.loads(stdout)
            except json.JSONDecodeError:
                entry["parse_error"] = "stdout was not valid JSON"
        entry["passed"] = code == 0 and "result" in entry
        entries.append(entry)
        print(f"{script.name}: {'PASS' if entry['passed'] else 'FAIL'}", flush=True)
    optional = {name: importlib.util.find_spec(name) is not None for name in ("gymnasium", "minigrid")}
    summary = {"python": sys.version, "executable": sys.executable, "platform": platform.platform(),
               "source_kind": "teaching_checks", "is_research_result": False,
               "passed": len(entries) == 7 and all(e["passed"] for e in entries), "entries": entries,
               "optional_minigrid_dependencies": optional,
               "minigrid_executed": False, "minigrid_note": "Separate optional exercise; not run by this runner"}
    (output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"passed": summary["passed"], "output": str(output), "minigrid_executed": False}))
    if not summary["passed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

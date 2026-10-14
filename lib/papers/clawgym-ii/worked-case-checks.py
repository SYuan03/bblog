"""Reproduce the first released ClawGym-Bench checker, not a model rollout.

Python 3.11+ and pytest are required. Supply data/benchmark_data.jsonl from
ClawGym/ClawGym-Bench revision c8cbd1d0df033af24fc14064d40d6964ca8f611f.
The script executes the inspected summarizer, tests, and checker in a temporary
workspace. It constructs reports for explanation and never calls an LLM judge.
"""

import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("benchmark_jsonl", type=Path)
    args = parser.parse_args()
    record = json.loads(args.benchmark_jsonl.read_text().splitlines()[0])
    files = {item["file_path"]: item["content"] for item in record["input_files"]}
    checker_text = files["reward/test.py"]
    checker = {"__name__": "checker_for_explanation"}
    exec(compile(checker_text, "released_reward_test.py", "exec"), checker)
    results = {
        "evidence_boundary": "article-constructed outputs; actual released checker; no model log or LLM judgment",
        "checker_sha256": hashlib.sha256(checker_text.encode()).hexdigest(),
        "python": sys.version.split()[0],
    }
    with tempfile.TemporaryDirectory(prefix="clawgym-case-review-") as temporary:
        workspace = Path(temporary)
        for name, content in files.items():
            target = workspace / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
        subprocess.run(
            [sys.executable, "tools/summarize.py", "--in", "data/tasks.csv", "--out", "build/summary.json"],
            cwd=workspace, check=True, capture_output=True, text=True,
        )
        tests = subprocess.run(
            [sys.executable, "-m", "pytest", "-q"], cwd=workspace,
            check=False, capture_output=True, text=True,
        )
        if tests.returncode:
            raise RuntimeError(tests.stdout + tests.stderr)
        (workspace / "build/test_results.txt").write_text(tests.stdout + tests.stderr)
        summary = json.loads((workspace / "build/summary.json").read_text())
        compact = json.dumps(summary, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        highlights = checker["_extract_expected_highlights"](workspace / "data/updates.jsonl")
        risks = checker["_expected_risks_lines"](workspace / "data/tasks.csv")
        next_steps = checker["_expected_next_steps_lines"](workspace / "data/tasks.csv")

        def report(raw_json, chosen_highlights):
            counts = "\n".join(f"{key}: {summary['by_status'][key]}" for key in ("todo", "in_progress", "done", "blocked"))
            return (
                "Volunteer Remediation Team - Weekly Status\n\nSummary:\n"
                f"Total tasks: {summary['total_tasks']}\n{counts}\nRaw summary JSON:\n{raw_json}\n\n"
                "Highlights (3 most recent updates):\n" + "\n".join(chosen_highlights)
                + "\n\nRisks/Blockers:\n" + "\n".join(risks)
                + "\n\nNext steps:\n" + "\n".join(next_steps) + "\n"
            )

        correct_report = report(compact, highlights)
        report_path = workspace / "build/status_report.md"
        report_path.write_text(correct_report)
        announcement = workspace / "build/announcement_rewrite.txt"
        announcement.write_text(
            "Team, thank you for helping with the cleanup. Let's coordinate our next steps. "
            "Please reply with your status: todo, in_progress, done, or blocked. "
            "Your updates will help us plan the work together.\n"
        )

        def evaluate(label):
            scores = checker["grade"]([], str(workspace))
            code = sum(scores.values()) / len(scores)
            results[label] = {
                "metrics": scores,
                "code_score": code,
                "hybrid_if_both_rubrics_are_1": 0.7 * code + 0.3,
            }

        evaluate("constructed_complete_output")
        report_path.write_text(report(compact, list(reversed(highlights))))
        evaluate("incorrect_highlight_order")
        report_path.write_text(report((workspace / "build/summary.json").read_text(), highlights))
        evaluate("literal_pretty_json_copy")
        report_path.write_text(correct_report)
        saved_announcement = announcement.read_text()
        announcement.unlink()
        evaluate("missing_announcement")
        announcement.write_text(saved_announcement)
        (workspace / "build/test_results.txt").write_text("passed\n")
        evaluate("submitted_passed_word_only")
        results["pytest_exit_code"] = tests.returncode
        results["pytest_stdout"] = tests.stdout
        results["summary"] = summary
        results["expected_highlights"] = highlights
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

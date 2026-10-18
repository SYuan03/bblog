"""Blog-authored arithmetic check; Python 3 stdlib, no model or simulator calls.

This verifies public summary calculations, not unreleased rollout/checker logs.
Save selected-results.json beside this file and run: python3 verify_metrics.py
"""
import json
from pathlib import Path

data = json.loads(Path(__file__).with_name("selected-results.json").read_text())
rows = data["cases"]
totals = {}
for method, name in (("mix", "Hybrid"), ("gpt", "Direct")):
    group = [r for r in rows if r["method"] == method]
    scored = [r["score"] for r in group if r["score"] is not None]
    assert len(group) == 50
    sr = 100 * sum(r["success"] for r in group) / len(group)
    score = 100 * sum(scored) / len(scored)
    steps = sum(r["steps"] for r in group)
    tokens = sum(r["tokens"]["totalTokens"] for r in group)
    corrections = sum(r["corrected_steps"] for r in group)
    segments = sum(r["chunks"] for r in group)
    totals[method] = tokens
    print(f"{name}: success {sr:.2f}% / n={len(group)}, "
          f"Score {score:.4f} / score_n={len(scored)}, "
          f"steps={steps}, segments={segments}, tokens={tokens}")
    if method == "mix":
        print(f"Correction share: {100 * corrections / steps:.4f}% of control steps")
    for r in group:
        if r["score"] is None:
            print("Missing Score:", r["id"])

print(f"Recorded token reduction: {100 * (1 - totals['mix'] / totals['gpt']):.4f}%")
assert sum(r["success"] for r in rows if r["method"] == "mix") == 24
assert sum(r["success"] for r in rows if r["method"] == "gpt") == 13

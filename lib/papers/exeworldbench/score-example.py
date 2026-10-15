"""Independent arithmetic checks for the ExeWorldBench explainer.

The first examples use invented scores/counts. The final calculations use
rounded values reported in Tables 1/6 and Tables 4/9. This is not the official
judge, runner, a model trace, or a reimplementation of visual evaluation.
"""

ecm_segments = [9, 8, 2, 0]
print(f"ECM example: {sum(ecm_segments) / len(ecm_segments):.2f}")

tasks = [(3, 4), (1, 2)]
macro = sum(p / n for p, n in tasks) / len(tasks)
pooled = sum(p for p, n in tasks) / sum(n for p, n in tasks)
print(f"Task-macro G: {100 * macro:.2f}%")
print(f"Pooled conditions: {100 * pooled:.2f}%")

print(f"Astra T1 M2: {0.94 * 5.40:.2f}")
print(f"Kimi T3-2 G2: {(49 / 60) * 22.20:.2f}%")

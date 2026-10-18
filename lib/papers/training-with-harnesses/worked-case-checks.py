"""Article-authored checks, Python 3.10+, no third-party dependencies.

Sources: Training with Harnesses, arXiv:2605.08741v1, Appendix B.1-B.2;
official repository revision 20eaa0c, LawBench set-F1 and KL definition.
This is not the official evaluator and does not reproduce any model run.
KL probabilities below are illustrative, not measured model probabilities.
"""

from math import isclose, log


def coefficient(factors, degree=10):
    dp = [0] * (degree + 1)
    dp[0] = 1
    for _ in range(factors):
        dp = [
            sum(dp[d - p] for p in (1, 2, 4, 8) if p <= d)
            for d in range(degree + 1)
        ]
    return dp[degree]


def set_f1(predicted, gold):
    if not predicted and not gold:
        return 1.0
    if not predicted or not gold:
        return 0.0
    return 2 * len(predicted & gold) / (len(predicted) + len(gold))


def kl(student, teacher):
    return sum(s * log(s / t) for s, t in zip(student, teacher))


def main():
    contributions = [coefficient(n) for n in (1, 2, 4, 8)]
    assert contributions == [0, 2, 10, 28]
    assert sum(contributions) == 40
    print("Math contributions:", contributions, "total:", sum(contributions))

    gold = {"negligent homicide"}
    standalone = {"intentional injury", "negligent homicide"}
    with_harness = {"intentional injury"}
    assert isclose(set_f1(standalone, gold), 2 / 3)
    assert set_f1(with_harness, gold) == 0
    print("LawBench set-F1:", set_f1(standalone, gold), set_f1(with_harness, gold))

    student, teacher = (0.7, 0.3), (0.2, 0.8)
    divergence = kl(student, teacher)
    assert isclose(divergence, 0.5826853020432397)
    assert kl(teacher, teacher) == 0
    print("Illustrative KL(S || T):", round(divergence, 4))
    print("Illustrative KL(T || S):", round(kl(teacher, student), 4))


if __name__ == "__main__":
    main()

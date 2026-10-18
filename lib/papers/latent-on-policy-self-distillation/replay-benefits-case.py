"""Article-authored API replay, not a LOPD student run. Python 3 standard library.

Save this file, env174.py, env174-task.json and EnvScaler-LICENSE.txt together.
Original task/environment: RUC-NLPIR/EnvScaler @ c2aa25b4, MIT License.
The score follows LOPD runtime.py @ 50c3d7f5: bool True count / all checks.
"""
import argparse
import json
from copy import deepcopy
from pathlib import Path
from env174 import EmployeeBenefitsEnrollmentPortal

args = argparse.ArgumentParser()
args.add_argument("--omit-withdraw", action="store_true")
options = args.parse_args()
task = json.loads(Path(__file__).with_name("env174-task.json").read_text())
env = EmployeeBenefitsEnrollmentPortal({})
for key, value in deepcopy(task["init_config"]).items():
    setattr(env, key, value)
initial = deepcopy(vars(env))


def call(name, *positional, **keywords):
    result = getattr(env, name)(*positional, **keywords)
    print(name, result)
    if not result.get("success"):
        raise RuntimeError(result)
    return result


period = call("get_current_active_enrollment_period")["data"]["enrollment_period_id"]
call("add_benefit_plan", "PLAN-HI-03", "health insurance", "GreenShield Medical Standard",
     "Core medical, telehealth, urgent care, generic prescriptions.", 310.25, "FT_EMP")
call("update_benefit_plan", "PLAN-DN-01", premiums=37.0,
     coverage_details="Preventive, basic and major dental; orthodontics for dependents; periodontal maintenance.")
call("change_employee_plan_selection", "E1001", "PLAN-HI-03")
call("change_employee_plan_selection", "E1002", "PLAN-LF-01")
if not options.omit_withdraw:
    call("withdraw_employee_plan_selection", "E1005")
call("enroll_employee_in_plan", "E1004", "PLAN-HI-02", period, "2024-06-15")

# Trusted, inspected functions from this fixed released task. Do not execute
# arbitrary downloaded checker code in this process without isolation/review.
final = deepcopy(vars(env))
passed = 0
for number, item in enumerate(task["checklist_with_func"], 1):
    scope = {"initial_state": deepcopy(initial)}
    try:
        exec(item["check_func"], scope)
        value = scope["check_func"](final)
        ok = isinstance(value, bool) and value is True
    except Exception:
        ok = False
    passed += int(ok)
    print(number, "PASS" if ok else "FAIL", item["check_item"])
total = len(task["checklist_with_func"])
print("reward", round(passed / total, 4) if total else 0.0, f"({passed}/{total})")

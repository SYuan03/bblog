"""Article-authored CPU replay, not an observed SERA model trajectory.

Run with Python 3.12 and --sera-repo pointing at official SERA revision
0443b190ccde59486904988e50893102df4563ab. Imports official code without
copying it. Actions below are selected from the public task's full metadata
to test the environment and verifier, not to evaluate a trained policy.
"""
import argparse
import asyncio
import copy
import json
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--sera-repo", type=Path, required=True)
args = parser.parse_args()
sys.path.insert(0, str(args.sera_repo.resolve()))
from Runtime.environments.textworld.composite_cooking import CompositeCookingWorldCoordinator
from Runtime.environments.textworld.composite_scorer import score_task
from Runtime.environments.textworld.manifest import TaskSpec
from Runtime.rubric.scoring import parse_policy_score

source = args.sera_repo / "Dataset/training/textworld_multidish_train_1500_v9.json"
row = json.loads(source.read_text())["tasks"][0]
assert row["task_id"] == "cookingworld_multidish_train_multi_dish_fork_join_medium_0000"
task = TaskSpec(**row)
budget = task.generation_properties["parallelism"]["shared_environment_max_steps"]


async def run(omit_last_eat=False):
    world = CompositeCookingWorldCoordinator(task, env_step_limit=budget)
    initial, _ = world.reset()
    events = []
    for index, dish in enumerate(task.generation_properties["dishes"]):
        actor = f"worker_{index + 1}"
        world.fork_shared(actor)

        async def step(action):
            observation, reward, done, infos = await world.step(actor, action)
            event = world.get_events()[-1]
            assert event["accepted"], action
            events.append({"agent": actor, "action": action, "reward": reward,
                           "remaining": infos["remaining_shared_steps"]})
            return infos

        for ingredient in dish["recipe"]:
            name = ingredient["name"]
            location = ingredient["candidate_source_locations"][0].split(".")[0]
            _, infos = world.observe(actor)
            if infos["agent_location"] != location:
                await step("go to " + location)
            await step("take " + name)
            if "roasted" in ingredient["preparation"]:
                await step("cook " + name + " in oven")
            if "sliced" in ingredient["preparation"]:
                await step("slice " + name)
        await step("prepare " + dish["dish_id"])
        if not (omit_last_eat and index == 1):
            await step("eat " + dish["dish_id"])

    report = score_task(task.generation_properties["dishes"], world.getObjectTree())
    return {"initial_observation": initial, "events": events,
            "world_steps": world.getObjectTree()["steps"], "report": report}


passed = asyncio.run(run())
omitted = asyncio.run(run(omit_last_eat=True))
assert passed["report"]["score"] == 1.0
assert passed["report"]["completed_dishes"] == 2
assert omitted["report"]["score"] == 0.0
assert omitted["report"]["completed_dishes"] == 1
assert not omitted["report"]["task_failure"]

# Test the verifier on a deliberately modified state, not an executable action.
wrong = {}
for dish in task.generation_properties["dishes"]:
    wrong[dish["dish_id"]] = {
        "ingredients": {x["name"]: {"collected": True, "deleted": False,
                                     "preparation": x["preparation"]}
                        for x in dish["recipe"]},
        "meal_prepared": True, "meal_eaten": True,
    }
wrong = copy.deepcopy(wrong)
wrong["dish_2"]["ingredients"]["carrot"]["preparation"] = ["fried", "sliced"]
wrong_report = score_task(task.generation_properties["dishes"], {"dishes": wrong})
assert wrong_report["score"] == 0.0 and wrong_report["task_failure"]

# Scorer parser accepts a self-reported score without per-criterion evidence.
accepted_score, _ = parse_policy_score('{"final_score": 0.9}')
assert accepted_score == 0.9
try:
    parse_policy_score('{"success": false, "final_score": 0.9}')
except ValueError:
    inconsistent_gate_rejected = True
else:
    raise AssertionError("An explicit false gate must reject a positive score")

success_scores, failure_scores = [0.8, 0.4], [0.3, 0.7]
hinges = [max(0.0, 0.2 - good + bad)
          for good in success_scores for bad in failure_scores]
ranking_loss = sum(hinges) / len(hinges)
assert abs(ranking_loss - 0.175) < 1e-9
craft_avg = (99.09 * 147 + 97.81 * 213 + 78.92 * 136 + 6.13 * 136) / 632
world_avg = (98.19 + 84.95 + 54.29 + 22.86) / 4
print(json.dumps({"scope": __doc__, "task_id": task.task_id, "budget": budget,
                  "full_replay": passed, "omit_last_eat_replay": omitted,
                  "constructed_wrong_preparation": wrong_report,
                  "parser": {"bare_score_accepted": accepted_score,
                             "explicit_failed_positive_rejected": inconsistent_gate_rejected},
                  "arithmetic": {"hinges": hinges, "ranking_loss": ranking_loss,
                                 "craft_avg": craft_avg, "world_avg": world_avg}},
                 ensure_ascii=False, indent=2))

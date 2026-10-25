"""Optional DoorKey interface exercise. Requires gymnasium and minigrid."""
import argparse
import importlib.metadata
import json
from pathlib import Path

ENV_ID = "MiniGrid-DoorKey-5x5-v0"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--steps", type=int, default=60)
    args = parser.parse_args()
    if args.steps <= 0:
        parser.error("steps must be positive")
    import gymnasium as gym
    import minigrid  # noqa: F401; registers the environments
    def observed(obs):
        return {"image": obs["image"].tolist(), "direction": int(obs["direction"]),
                "mission": str(obs["mission"])}
    env = gym.make(ENV_ID)
    try:
        obs, info = env.reset(seed=args.seed)
        env.action_space.seed(args.seed)
        initial, trajectory = observed(obs), []
        terminated = truncated = False
        reward = 0.
        for index in range(args.steps):
            action = int(env.action_space.sample())
            obs, reward, terminated, truncated, info = env.step(action)
            trajectory.append({"index": index, "action": action, "reward": float(reward),
                               "observation": observed(obs), "terminated": bool(terminated),
                               "truncated": bool(truncated)})
            if terminated or truncated:
                break
        record = {
            "source_kind": "random_policy_environment_exercise", "is_llm_result": False,
            "env_id": ENV_ID, "seed": args.seed, "external_step_budget": args.steps,
            "gymnasium": importlib.metadata.version("gymnasium"),
            "minigrid": importlib.metadata.version("minigrid"),
            "initial_observation": initial, "trajectory": trajectory,
            "end_reason": "terminated" if terminated else "truncated" if truncated else "external_budget",
            "success": bool(terminated and reward > 0),
            "success_rule": "DoorKey-specific: terminated with positive goal reward; not a generic reward rule",
        }
    finally:
        env.close()
    with args.output.open("x", encoding="utf-8") as stream:
        json.dump(record, stream, ensure_ascii=False, indent=2)
    print(json.dumps({"output": str(args.output), "steps": len(trajectory), "end_reason": record["end_reason"]}))


if __name__ == "__main__":
    main()

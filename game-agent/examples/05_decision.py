"""Known-model value iteration versus sampled tabular Q-learning; no LLM."""
import json
import random

GOAL, GAMMA = 4, 0.9


def transition(state, action):
    if state == GOAL:
        return GOAL, 0., True
    next_state = min(GOAL, max(0, state + (-1 if action == 0 else 1)))
    done = next_state == GOAL
    return next_state, 1. if done else -0.01, done


def value_iteration():
    values = [0.] * (GOAL+1)
    for _ in range(200):
        new = [0.] * (GOAL+1)
        for state in range(GOAL):
            candidates = []
            for action in (0, 1):
                successor, reward, done = transition(state, action)
                candidates.append(reward + (0 if done else GAMMA*values[successor]))
            new[state] = max(candidates)
        change = max(abs(a-b) for a, b in zip(new, values))
        values = new
        if change < 1e-12:
            break
    return values


def main():
    values = value_iteration()
    expected = [0.7019, 0.791, 0.89, 1., 0.]
    assert max(abs(a-b) for a, b in zip(values, expected)) < 1e-10
    rng, q = random.Random(7), [[0., 0.] for _ in range(5)]
    truncations = 0
    for _ in range(600):
        state = 0
        for step in range(30):
            action = rng.randrange(2) if rng.random() < 0.2 else max(range(2), key=lambda a:q[state][a])
            successor, reward, done = transition(state, action)
            # The 30-step collection limit is external, so nonterminal updates still bootstrap.
            target = reward if done else reward + GAMMA*max(q[successor])
            q[state][action] += 0.2*(target-q[state][action])
            state = successor
            if done:
                break
        else:
            truncations += 1
    trajectory, state, terminated = [], 0, False
    for _ in range(30):
        action = max(range(2), key=lambda a:q[state][a])
        successor, reward, terminated = transition(state, action)
        trajectory.append({"state": state, "action": action, "next": successor, "reward": reward})
        state = successor
        if terminated:
            break
    assert terminated and len(trajectory) == 4
    update = 2+0.1*(1+0.9*4-2)
    assert abs(update-2.26) < 1e-12
    print(json.dumps({
        "source_kind": "five_state_teaching_mdp", "is_llm_result": False,
        "value_iteration": values, "q_values": q, "training_episodes": 600,
        "training_external_truncations": truncations, "seed": 7,
        "greedy_evaluation": trajectory, "success": terminated,
        "single_update_nonterminal": update, "single_update_terminal": 1.9,
    }, indent=2))


if __name__ == "__main__":
    main()

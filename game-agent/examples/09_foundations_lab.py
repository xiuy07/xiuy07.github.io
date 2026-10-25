"""Reproduce the studybook's worked examples; no model/API or environment run.

Examples:
    python examples/09_foundations_lab.py --lesson 03
    python examples/09_foundations_lab.py
Lessons 02/03/04/09 use NumPy. Lesson 05 additionally uses PyTorch CPU.
"""
import argparse
import json
import math


def lesson01():
    original = [1, 2]
    def replace(items):
        items = [9]
        return items
    replacement = replace(original)
    assert original == [1, 2] and replacement == [9]
    original.clear()
    assert original == []
    rows = [(True, 8), (False, 20), (True, 12), (False, 30)]
    successful = [steps for success, steps in rows if success]
    result = dict(n=len(rows), successes=len(successful),
                  success_rate=len(successful)/len(rows),
                  mean_all=sum(steps for _, steps in rows)/len(rows),
                  mean_success=sum(successful)/len(successful))
    assert result == dict(n=4, successes=2, success_rate=.5, mean_all=17.5, mean_success=10.)
    return result


def lesson02():
    import numpy as np
    X = np.array([[1., 2.], [3., 4.], [-1., 1.]])
    w, b = np.array([2., -1.]), .5
    prediction = X @ w + b
    np.testing.assert_allclose(prediction, [.5, 2.5, -2.5])
    p, y = np.array([[1.], [2.], [3.]]), np.array([1., 2., 3.])
    wrong = p - y
    assert wrong.shape == (3, 3)
    np.testing.assert_allclose((wrong*wrong).mean(), 4/3)
    np.testing.assert_array_equal(p[:, 0] - y, np.zeros(3))
    train, valid = np.array([[1., 2.], [3., 2.]]), np.array([[100., 2.]])
    mu, std = train.mean(0), train.std(0, ddof=0)
    scale = np.where(std == 0, 1., std)
    np.testing.assert_allclose((train-mu)/scale, [[-1, 0], [1, 0]])
    np.testing.assert_allclose((valid-mu)/scale, [[98, 0]])
    raw_bias = b - np.sum(w*mu/scale)
    np.testing.assert_allclose((train-mu)/scale @ w + b, train @ (w/scale) + raw_bias)
    return dict(predictions=prediction.tolist(), incorrect_broadcast_mse=float((wrong*wrong).mean()),
                mu=mu.tolist(), scale=scale.tolist(), valid_z=((valid-mu)/scale).tolist(), raw_bias=float(raw_bias))


def lesson03():
    import numpy as np
    x, y = np.array([1., 2.]), np.array([3., 5.])
    theta = np.zeros(2, dtype=np.float64)
    def loss(t):
        error = x*t[0]+t[1]-y
        return np.mean(error*error)/2
    h, numeric = 1e-5, np.empty(2)
    for j in range(2):
        plus, minus = theta.copy(), theta.copy()
        plus[j] += h
        minus[j] -= h
        numeric[j] = (loss(plus)-loss(minus))/(2*h)
    analytic = np.array([-6.5, -4.])
    np.testing.assert_allclose(numeric, analytic, rtol=1e-8, atol=1e-8)
    assert not np.allclose(numeric, analytic*len(x))
    next_theta = theta-.1*analytic
    np.testing.assert_allclose(next_theta, [.65, .4])
    assert math.isclose(float(loss(next_theta)), 3.673125)
    ratios = {str(eta):(1-eta)**2 for eta in (.1, 1., 1.5, 2., 3.)}
    assert ratios['3.0'] == 4
    return dict(old_loss=float(loss(theta)), analytic=analytic.tolist(), numerical=numeric.tolist(),
                new_parameters=next_theta.tolist(), new_loss=float(loss(next_theta)), quadratic_loss_ratios=ratios)


def lesson04():
    import numpy as np
    x, p = np.array([0., 1., 2.]), np.array([.2, .3, .5])
    mean = float(x @ p)
    direct = float(((x-mean)**2) @ p)
    by_moments = float((x*x) @ p)-mean**2
    assert math.isclose(mean, 1.3) and math.isclose(direct, .61)
    assert math.isclose(direct, by_moments)
    tp, fn, fp, tn = 8, 2, 99, 891
    assert tp+fn+fp+tn == 1000
    precision, recall = tp/(tp+fp), tp/(tp+fn)
    assert math.isclose(recall, .8)
    return dict(expectation=mean, variance=direct, cross_entropy=-math.log(.5),
                precision=precision, recall=recall, counts=dict(tp=tp, fn=fn, fp=fp, tn=tn))


def lesson05():
    import torch
    w = torch.nn.Parameter(torch.tensor(1.))
    optimizer = torch.optim.SGD([w], lr=.1)
    optimizer.zero_grad(set_to_none=True)
    ((w-3)**2/2).backward()
    first = w.grad.item()
    ((w-3)**2/2).backward()
    second = w.grad.item()
    optimizer.step()
    assert first == -2 and second == -4
    assert math.isclose(w.item(), 1.4, rel_tol=1e-6)
    assert w.grad.item() == -4
    return dict(first_gradient=first, accumulated_gradient=second, updated_parameter=w.item(),
                weighted_batch_mean=(6*1+4*3)/10)


def lesson06():
    image = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    output = [[image[i][j]-image[i+1][j+1] for j in range(2)] for i in range(2)]
    assert output == [[-4, -4], [-4, -4]]
    h1 = .5*0+2
    h2 = .5*h1+0
    assert h1 == 2 and h2 == 1
    return dict(correlation=output, conv_parameters=8*3*3*3+8,
                projection_parameters=8*16+16, recurrent_states=[h1, h2])


def lesson07():
    values, rounds = [0.]*5, []
    for _ in range(4):
        old = values.copy()
        values = [-.1+.9*old[s+1] for s in range(3)]+[1., 0.]
        rounds.append(values)
    assert all(math.isclose(a, b) for a, b in zip(values, [.458, .62, .8, 1, 0]))
    direct = -.1-.1*.9-.1*.9**2+.9**3
    assert math.isclose(direct, values[0])
    return dict(synchronous_rounds=rounds, direct_return=direct)


def lesson08():
    q_target, sarsa_target = 1+.9*4, 1+.9*1
    q_learning, sarsa = 2+.1*(q_target-2), 2+.1*(sarsa_target-2)
    terminal = 2+.1*(1-2)
    assert math.isclose(q_learning, 2.26) and math.isclose(sarsa, 1.99)
    assert math.isclose(terminal, 1.9)
    return dict(q_learning=q_learning, sarsa=sarsa, terminal_update=terminal)


def lesson09():
    import numpy as np
    q, k, v = np.array([[1.], [2.]]), np.array([[1.], [0.]]), np.array([[10.], [20.]])
    scores = q @ k.T
    def attend(raw):
        exp = np.exp(raw-raw.max(axis=-1, keepdims=True))
        weights = exp/exp.sum(axis=-1, keepdims=True)
        return weights, weights @ v
    weights, output = attend(scores)
    causal_scores = scores.copy()
    causal_scores[0, 1] = -np.inf
    masked_weights, masked_output = attend(causal_scores)
    np.testing.assert_allclose(output[:, 0], [12.68941421369995, 11.192029220221176])
    assert masked_output[0, 0] == 10 and masked_weights[0, 1] == 0
    return dict(weights=weights.tolist(), output=output.tolist(), masked_output=masked_output.tolist())


def lesson10():
    episodes = [[20], [4, 4, 4]]
    costs = [sum(calls) for calls in episodes]
    average_cost = sum(costs)/len(costs)
    mean_calls = sum(map(len, episodes))/len(episodes)
    mean_of_episode_lengths = sum(sum(c)/len(c) for c in episodes)/len(episodes)
    weighted_length = sum(costs)/sum(map(len, episodes))
    assert average_cost == 16 and mean_calls*mean_of_episode_lengths == 24
    assert mean_calls*weighted_length == average_cost
    return dict(average_raw_actions=average_cost, wrong_product=mean_calls*mean_of_episode_lengths,
                call_weighted_length=weighted_length, matched_product=mean_calls*weighted_length)


def lesson11():
    counts = dict(both=5, a_only=1, b_only=2, neither=2)
    assert sum(counts.values()) == 10
    delta = (counts['b_only']-counts['a_only'])/10
    assert math.isclose(delta, .1)
    return dict(counts=counts, probability_difference=delta, percentage_points=delta*100)


LESSONS = {f'{i:02}': globals()[f'lesson{i:02}'] for i in range(1, 12)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lesson', choices=tuple(LESSONS))
    args = parser.parse_args()
    selected = {args.lesson: LESSONS[args.lesson]} if args.lesson else LESSONS
    results = {key: fn() for key, fn in selected.items()}
    print(json.dumps(dict(passed=True, source_kind='worked_teaching_examples',
                          is_research_result=False, results=results), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()

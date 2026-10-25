"""Batch prediction, independent gradient check, and small synthetic regression."""
import json
import numpy as np


def linear_loss_grad(X, y, w, b):
    if X.ndim != 2 or w.shape != (X.shape[1],) or y.shape != (X.shape[0],):
        raise ValueError("Expected X=(N,d), y=(N,), w=(d,)")
    if len(y) == 0:
        raise ValueError("Empty batches are not allowed")
    error = X @ w + b - y
    loss = float(np.mean(error**2) / 2)
    return loss, X.T @ error / len(y), float(error.mean())


def gradient_check():
    X = np.array([[1., 2.], [3., 4.], [-1., 1.]])
    y = np.array([2., -1., 0.5])
    w = np.array([0.3, -0.2])
    b, h = 0.1, 1e-6
    _, dw, db = linear_loss_grad(X, y, w, b)
    numerical = []
    for j in range(len(w)):
        delta = np.zeros_like(w)
        delta[j] = h
        plus = linear_loss_grad(X, y, w + delta, b)[0]
        minus = linear_loss_grad(X, y, w - delta, b)[0]
        numerical.append((plus - minus) / (2 * h))
    numerical_b = (linear_loss_grad(X, y, w, b+h)[0] - linear_loss_grad(X, y, w, b-h)[0]) / (2*h)
    np.testing.assert_allclose(dw, numerical, rtol=1e-6, atol=1e-8)
    np.testing.assert_allclose(db, numerical_b, rtol=1e-6, atol=1e-8)
    return max(float(np.max(np.abs(dw-numerical))), abs(db-numerical_b))


def main():
    X_demo = np.array([[1., 2.], [3., 4.], [-1., 1.]])
    w_demo = np.array([2., -1.])
    prediction = X_demo @ w_demo + 0.5
    by_loop = np.array([sum(a*b for a, b in zip(row, w_demo)) + 0.5 for row in X_demo])
    np.testing.assert_allclose(prediction, [0.5, 2.5, -2.5])
    np.testing.assert_allclose(prediction, by_loop)
    wrong_error_shape = (prediction[:, None] - np.zeros(3)).shape
    assert wrong_error_shape == (3, 3)
    check_error = gradient_check()
    rng = np.random.default_rng(42)
    X = rng.normal(size=(240, 2))
    y = X @ np.array([2., -1.]) + 0.5 + rng.normal(scale=0.1, size=240)
    order = rng.permutation(len(y))
    train, valid = order[:180], order[180:]
    mean, std = X[train].mean(axis=0), X[train].std(axis=0)
    scale = np.where(std < 1e-12, 1., std)
    train_X, valid_X = (X[train]-mean)/scale, (X[valid]-mean)/scale
    w, b = np.zeros(2), 0.
    initial = linear_loss_grad(train_X, y[train], w, b)[0]
    for _ in range(200):
        _, dw, db = linear_loss_grad(train_X, y[train], w, b)
        w, b = w-0.1*dw, b-0.1*db
    final = linear_loss_grad(train_X, y[train], w, b)[0]
    valid_loss = linear_loss_grad(valid_X, y[valid], w, b)[0]
    assert final < initial and np.isfinite(valid_loss)
    raw_w = w / scale
    raw_b = b - mean @ raw_w
    print(json.dumps({
        "source_kind": "synthetic_regression", "is_research_result": False,
        "numpy": np.__version__, "seed": 42, "prediction": prediction.tolist(),
        "broadcast_error_shape": wrong_error_shape, "gradient_max_abs_error": check_error,
        "train_n": len(train), "valid_n": len(valid), "loss_definition": "mean_squared_error/2",
        "initial_train_loss": initial, "final_train_loss": final, "validation_loss": valid_loss,
        "raw_coordinate_weights": raw_w.tolist(), "raw_coordinate_bias": float(raw_b),
    }, indent=2))


if __name__ == "__main__":
    main()

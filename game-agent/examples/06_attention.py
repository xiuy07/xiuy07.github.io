"""Hand-computable attention and a future-information invariance check."""
import json
import math
import torch


def attention(Q, K, V, causal=True):
    scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.shape[-1])
    if causal:
        future = torch.ones(scores.shape[-2:], dtype=torch.bool, device=scores.device).triu(1)
        scores = scores.masked_fill(future, float("-inf"))
    weights = scores.softmax(dim=-1)
    return weights @ V, weights


def main():
    torch.set_num_threads(1)
    Q = torch.tensor([[[1.], [2.]]], dtype=torch.float64)
    K = torch.tensor([[[1.], [0.]]], dtype=torch.float64)
    V = torch.tensor([[[10.], [20.]]], dtype=torch.float64)
    unmasked, _ = attention(Q, K, V, causal=False)
    masked, weights = attention(Q, K, V)
    assert abs(unmasked[0, 0, 0].item() - (10+10/(math.e+1))) < 1e-10
    assert masked[0, 0, 0].item() == 10
    assert weights[0, 0, 1].item() == 0
    torch.manual_seed(8)
    X = torch.randn(1, 5, 4, dtype=torch.float64)
    altered = X.clone()
    altered[:, 3:, :] += 100
    before, _ = attention(X, X, X)
    after, _ = attention(altered, altered, altered)
    torch.testing.assert_close(before[:, :3], after[:, :3], rtol=0, atol=0)
    print(json.dumps({
        "source_kind": "attention_mechanism_check", "is_language_model_result": False,
        "unmasked_output": unmasked.tolist(), "causal_output": masked.tolist(),
        "causal_weights": weights.tolist(),
        "prefix_max_difference_after_future_change": (before[:, :3]-after[:, :3]).abs().max().item(),
        "torch": torch.__version__,
    }, indent=2))


if __name__ == "__main__":
    main()

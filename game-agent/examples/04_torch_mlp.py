"""CPU neural-network lesson: synthetic XOR, autograd and reload consistency."""
import argparse
import json
from pathlib import Path
import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader


def make_model():
    return nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))


def evaluate(model, X, y):
    model.eval()
    with torch.no_grad():
        logits = model(X)
        return {
            "loss": nn.functional.cross_entropy(logits, y).item(),
            "accuracy": (logits.argmax(-1) == y).float().mean().item(),
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--save-dir", type=Path)
    args = parser.parse_args()
    torch.set_num_threads(1)
    torch.manual_seed(42)
    w = torch.tensor(1., dtype=torch.float64, requires_grad=True)
    b = torch.tensor(0., dtype=torch.float64, requires_grad=True)
    loss = (2*w+b-3).square()/2
    loss.backward()
    assert w.grad.item() == -2 and b.grad.item() == -1
    X = torch.randn(600, 2)
    y = (X[:, 0]*X[:, 1] > 0).long()
    order = torch.randperm(600)
    train, valid = order[:400], order[400:]
    mean, scale = X[train].mean(0), X[train].std(0, correction=0).clamp_min(1e-8)
    train_X, valid_X = (X[train]-mean)/scale, (X[valid]-mean)/scale
    loader = DataLoader(TensorDataset(train_X, y[train]), batch_size=64, shuffle=True,
                        generator=torch.Generator().manual_seed(43))
    model = make_model()
    assert sum(p.numel() for p in model.parameters()) == 82
    optimizer = torch.optim.Adam(model.parameters(), lr=0.02)
    before = evaluate(model, train_X, y[train])
    for _ in range(100):
        model.train()
        for inputs, labels in loader:
            optimizer.zero_grad(set_to_none=True)
            logits = model(inputs)
            loss = nn.functional.cross_entropy(logits, labels)
            if not torch.isfinite(loss):
                raise RuntimeError("Non-finite training loss")
            loss.backward()
            optimizer.step()
    after = evaluate(model, train_X, y[train])
    validation = evaluate(model, valid_X, y[valid])
    assert after["loss"] < before["loss"]
    payload = {"model": model.state_dict(), "mean": mean, "scale": scale,
               "architecture": "Linear2_16_ReLU_Linear16_2", "seed": 42}
    if args.save_dir:
        args.save_dir.mkdir(parents=True, exist_ok=False)
        checkpoint = args.save_dir / "model.pt"
        torch.save(payload, checkpoint)
        payload = torch.load(checkpoint, map_location="cpu", weights_only=True)
    restored = make_model()
    restored.load_state_dict(payload["model"])
    restored.eval()
    model.eval()
    with torch.no_grad():
        original = model(valid_X)
        reloaded = restored((X[valid]-payload["mean"])/payload["scale"])
        torch.testing.assert_close(original, reloaded, rtol=0, atol=0)
    print(json.dumps({
        "source_kind": "synthetic_xor_training", "is_game_agent_result": False,
        "torch": torch.__version__, "device": "cpu", "seed": 42,
        "parameters": 82, "train_n": 400, "validation_n": 200, "epochs": 100,
        "autograd_dw_db": [w.grad.item(), b.grad.item()],
        "before": before, "after": after, "validation": validation,
        "reload_max_abs_difference": (original-reloaded).abs().max().item(),
        "disk_checkpoint_verified": args.save_dir is not None,
    }, indent=2))


if __name__ == "__main__":
    main()

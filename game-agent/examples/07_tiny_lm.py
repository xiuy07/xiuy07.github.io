"""A single-head causal character LM on repeated, self-created action text."""
import json
import math
import torch
from torch import nn


class TinyLM(nn.Module):
    def __init__(self, vocab_size, width=24, context=24):
        super().__init__()
        self.context = context
        self.token = nn.Embedding(vocab_size, width)
        self.position = nn.Embedding(context, width)
        self.norm1 = nn.LayerNorm(width)
        self.qkv = nn.Linear(width, 3*width)
        self.projection = nn.Linear(width, width)
        self.norm2 = nn.LayerNorm(width)
        self.ffn = nn.Sequential(nn.Linear(width, 2*width), nn.ReLU(), nn.Linear(2*width, width))
        self.head = nn.Linear(width, vocab_size)

    def forward(self, ids):
        B, T = ids.shape
        if T > self.context:
            raise ValueError("Input exceeds context")
        X = self.token(ids) + self.position(torch.arange(T, device=ids.device))
        Q, K, V = self.qkv(self.norm1(X)).chunk(3, dim=-1)
        scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.shape[-1])
        mask = torch.ones(T, T, device=ids.device, dtype=torch.bool).triu(1)
        weights = scores.masked_fill(mask, float("-inf")).softmax(-1)
        X = X + self.projection(weights @ V)
        X = X + self.ffn(self.norm2(X))
        return self.head(X)


def token_loss(logits, targets):
    return nn.functional.cross_entropy(logits.reshape(-1, logits.shape[-1]), targets.reshape(-1))


def main():
    torch.set_num_threads(1)
    torch.manual_seed(17)
    corpus = ("look key pickup door open goal\n"
              "look wall turn forward goal\n"
              "look door key pickup open goal\n") * 16
    vocab = sorted(set(corpus))
    encode = {char:index for index, char in enumerate(vocab)}
    data = torch.tensor([encode[c] for c in corpus], dtype=torch.long)
    model = TinyLM(len(vocab))
    context = model.context
    def batch():
        starts = torch.randint(len(data)-context, (16,))
        inputs = torch.stack([data[i:i+context] for i in starts])
        labels = torch.stack([data[i+1:i+context+1] for i in starts])
        return inputs, labels
    fixed_X, fixed_y = batch()
    # Teacher forcing and next-token shift are explicit in batch().
    model.eval()
    with torch.no_grad():
        initial_loss = token_loss(model(fixed_X), fixed_y).item()
        variant = fixed_X[:1].clone()
        variant[:, 12:] = (variant[:, 12:]+1) % len(vocab)
        difference = (model(fixed_X[:1])[:, :12]-model(variant)[:, :12]).abs().max().item()
        assert difference < 1e-6
    optimizer = torch.optim.Adam(model.parameters(), lr=0.006)
    for _ in range(160):
        inputs, labels = batch()
        model.train()
        optimizer.zero_grad(set_to_none=True)
        loss = token_loss(model(inputs), labels)
        if not torch.isfinite(loss):
            raise RuntimeError("Non-finite loss")
        loss.backward()
        optimizer.step()
    model.eval()
    with torch.no_grad():
        final_loss = token_loss(model(fixed_X), fixed_y).item()
        generated = [encode[c] for c in "look"]
        for _ in range(60):
            ids = torch.tensor([generated[-context:]], dtype=torch.long)
            generated.append(model(ids)[0, -1].argmax().item())
    assert final_loss < initial_loss
    print(json.dumps({
        "source_kind": "repeated_synthetic_action_text", "is_game_agent_result": False,
        "has_independent_test": False, "torch": torch.__version__, "seed": 17,
        "parameters": sum(p.numel() for p in model.parameters()), "steps": 160,
        "vocab_size": len(vocab), "initial_fixed_training_loss": initial_loss,
        "final_fixed_training_loss": final_loss, "prefix_causality_difference": difference,
        "greedy_generation": "".join(vocab[i] for i in generated),
    }, indent=2))


if __name__ == "__main__":
    main()

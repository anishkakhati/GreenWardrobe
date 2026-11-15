from pathlib import Path

import torch


class EarlyStopping:
    """Track validation performance and stop after prolonged stagnation."""

    def __init__(self, patience=5, min_delta=0.001):
        self.patience = patience
        self.min_delta = min_delta
        self.best_score = float("-inf")
        self.counter = 0
        self.should_stop = False

    def update(self, score):
        improved = score > self.best_score + self.min_delta

        if improved:
            self.best_score = score
            self.counter = 0
        else:
            self.counter += 1

        if self.counter >= self.patience:
            self.should_stop = True

        return improved


def save_checkpoint(
    model,
    optimizer,
    epoch,
    metrics,
    class_to_id,
    output_path,
    stage,
):
    """Save a complete reproducible training checkpoint."""

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    checkpoint = {
        "epoch": epoch,
        "stage": stage,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "metrics": metrics,
        "class_to_id": class_to_id,
    }

    torch.save(checkpoint, output_path)

    return output_path

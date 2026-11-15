import torch
import torch.nn as nn


def calculate_class_weights(dataset, max_weight=5.0):
    """
    Calculate capped square-root inverse-frequency class weights.

    Classes with no training samples receive zero weight.
    Original class IDs are preserved.
    """

    if max_weight <= 0:
        raise ValueError("max_weight must be positive.")

    num_classes = len(dataset.label_to_id)
    class_counts = torch.zeros(num_classes, dtype=torch.float64)

    for _, label_id in dataset.samples:
        class_counts[label_id] += 1

    active_mask = class_counts > 0

    if not active_mask.any():
        raise ValueError("Training dataset contains no active classes.")

    max_count = class_counts[active_mask].max()

    weights = torch.zeros(num_classes, dtype=torch.float64)

    weights[active_mask] = torch.sqrt(
        max_count / class_counts[active_mask]
    ).clamp(max=max_weight)

    # Normalize active weights to mean 1.
    weights[active_mask] /= weights[active_mask].mean()

    return weights.float()


def build_weighted_loss(dataset, max_weight=5.0):
    """Build weighted Cross-Entropy Loss from a training dataset."""

    weights = calculate_class_weights(
        dataset,
        max_weight=max_weight,
    )

    criterion = nn.CrossEntropyLoss(weight=weights)

    return criterion, weights

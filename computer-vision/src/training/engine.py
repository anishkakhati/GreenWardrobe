import torch

from src.training.metrics import calculate_metrics


def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    device,
    stage=1,
):
    """Train the model for one epoch."""

    model.train()

    # Frozen BatchNorm layers must remain in evaluation mode in Stage 1.
    if stage == 1:
        for module in model.modules():
            if isinstance(
                module,
                torch.nn.modules.batchnorm._BatchNorm,
            ):
                if not any(
                    parameter.requires_grad
                    for parameter in module.parameters()
                ):
                    module.eval()

    running_loss = 0.0
    total_samples = 0

    for images, targets in loader:
        images = images.to(device)
        targets = targets.to(device)

        optimizer.zero_grad(set_to_none=True)

        outputs = model(images)
        loss = criterion(outputs, targets)

        loss.backward()
        optimizer.step()

        batch_size = images.size(0)
        running_loss += loss.item() * batch_size
        total_samples += batch_size

    return running_loss / total_samples


def evaluate(
    model,
    loader,
    criterion,
    device,
    supported_class_ids,
):
    """Evaluate model without updating its parameters."""

    model.eval()

    running_loss = 0.0
    total_samples = 0

    all_targets = []
    all_predictions = []

    with torch.no_grad():
        for images, targets in loader:
            images = images.to(device)
            targets = targets.to(device)

            outputs = model(images)
            loss = criterion(outputs, targets)

            predictions = outputs.argmax(dim=1)

            batch_size = images.size(0)
            running_loss += loss.item() * batch_size
            total_samples += batch_size

            all_targets.extend(targets.cpu().tolist())
            all_predictions.extend(predictions.cpu().tolist())

    if total_samples == 0:
        raise ValueError("Cannot evaluate an empty DataLoader.")

    metrics = calculate_metrics(
        y_true=all_targets,
        y_pred=all_predictions,
        label_ids=supported_class_ids,
    )

    metrics["loss"] = running_loss / total_samples

    return metrics

from pathlib import Path

import torch

from src.data.dataloaders import create_dataloaders
from src.training.callbacks import EarlyStopping, save_checkpoint
from src.training.config import (
    MANIFEST_PATH,
    LABELS_PATH,
    OUTPUT_DIR,
    BATCH_SIZE,
    NUM_WORKERS,
    RANDOM_SEED,
    SPLIT_COLUMN,
    EXCLUDED_TRAIN_LABELS,
    STAGE1_EPOCHS,
    STAGE1_CLASSIFIER_LR,
    WEIGHT_DECAY,
    SCHEDULER_FACTOR,
    SCHEDULER_PATIENCE,
    MIN_LEARNING_RATE,
    EARLY_STOPPING_PATIENCE,
    MONITOR_METRIC,
    MAX_CLASS_WEIGHT,
)
from src.training.losses import build_weighted_loss
from src.training.metrics import calculate_metrics
from src.training.model_setup import (
    get_device,
    load_pretrained_model,
    freeze_backbone,
)
from src.training.engine import train_one_epoch, evaluate


def run_stage1():
    """Train the classifier while keeping the pretrained backbone frozen."""

    torch.manual_seed(RANDOM_SEED)

    if torch.backends.mps.is_available():
        torch.mps.manual_seed(RANDOM_SEED)

    device = get_device()
    print(f"Using device: {device}")

    datasets, loaders = create_dataloaders(
        manifest_path=MANIFEST_PATH,
        labels_path=LABELS_PATH,
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
        seed=RANDOM_SEED,
        split_column=SPLIT_COLUMN,
    )

    train_dataset = datasets["train"]
    validation_loader = loaders["validation"]

    model, pretrained_checkpoint = load_pretrained_model()
    model = model.to(device)

    freeze_backbone(model)

    criterion, class_weights = build_weighted_loss(
        train_dataset,
        max_weight=MAX_CLASS_WEIGHT,
    )
    criterion = criterion.to(device)

    optimizer = torch.optim.AdamW(
        model.fc.parameters(),
        lr=STAGE1_CLASSIFIER_LR,
        weight_decay=WEIGHT_DECAY,
    )

    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=SCHEDULER_FACTOR,
        patience=SCHEDULER_PATIENCE,
        min_lr=MIN_LEARNING_RATE,
    )

    early_stopping = EarlyStopping(
        patience=EARLY_STOPPING_PATIENCE
    )

    class_to_id = train_dataset.label_to_id

    supported_class_ids = [
        class_id
        for label, class_id in class_to_id.items()
        if label not in EXCLUDED_TRAIN_LABELS
    ]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    best_checkpoint_path = OUTPUT_DIR / "stage1_best.pth"

    print(f"Training images: {len(train_dataset)}")
    print(f"Validation images: {len(datasets['validation'])}")
    print(f"Trainable parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")
    print(f"Pretrained checkpoint epoch: {pretrained_checkpoint['epoch']}")

    for epoch in range(1, STAGE1_EPOCHS + 1):
        train_loss = train_one_epoch(
            model=model,
            loader=loaders["train"],
            criterion=criterion,
            optimizer=optimizer,
            device=device,
            stage=1,
        )

        validation_metrics = evaluate(
            model=model,
            loader=validation_loader,
            criterion=criterion,
            device=device,
            supported_class_ids=supported_class_ids,
        )

        score = validation_metrics[MONITOR_METRIC]
        scheduler.step(score)

        improved = early_stopping.update(score)

        print(
            f"Epoch {epoch}/{STAGE1_EPOCHS} | "
            f"Train Loss: {train_loss:.4f} | "
            f"Val Loss: {validation_metrics['loss']:.4f} | "
            f"Val Accuracy: {validation_metrics['accuracy']:.4f} | "
            f"Val Macro F1: {validation_metrics['macro_f1']:.4f}"
        )

        if improved:
            save_checkpoint(
                model=model,
                optimizer=optimizer,
                epoch=epoch,
                metrics=validation_metrics,
                class_to_id=class_to_id,
                output_path=best_checkpoint_path,
                stage=1,
            )
            print("  Best Stage 1 checkpoint saved.")

        if early_stopping.should_stop:
            print("Early stopping triggered.")
            break

    print(f"\nBest checkpoint: {best_checkpoint_path}")
    print(f"Best validation {MONITOR_METRIC}: {early_stopping.best_score:.4f}")

    return best_checkpoint_path


if __name__ == "__main__":
    run_stage1()

import torch

from src.training.config import (
    MANIFEST_PATH,
    LABELS_PATH,
    OUTPUT_DIR,
    BATCH_SIZE,
    NUM_WORKERS,
    RANDOM_SEED,
    SPLIT_COLUMN,
    EXCLUDED_TRAIN_LABELS,
    STAGE2_EPOCHS,
    STAGE2_BACKBONE_LR,
    STAGE2_CLASSIFIER_LR,
    WEIGHT_DECAY,
    SCHEDULER_FACTOR,
    SCHEDULER_PATIENCE,
    MIN_LEARNING_RATE,
    EARLY_STOPPING_PATIENCE,
    MONITOR_METRIC,
    MAX_CLASS_WEIGHT,
)
from src.data.dataloaders import create_dataloaders
from src.training.callbacks import EarlyStopping, save_checkpoint
from src.training.losses import build_weighted_loss
from src.training.model_setup import (
    get_device,
    load_pretrained_model,
    unfreeze_model,
)
from src.training.engine import train_one_epoch, evaluate


def run_stage2():
    """Fine-tune the complete ResNet-18 from the best Stage 1 checkpoint."""

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

    # Load the original architecture, then restore Stage 1's best weights.
    model, _ = load_pretrained_model()

    stage1_path = OUTPUT_DIR / "stage1_best.pth"
    if not stage1_path.exists():
        raise FileNotFoundError(
            f"Stage 1 checkpoint not found: {stage1_path}"
        )

    stage1_checkpoint = torch.load(
        stage1_path,
        map_location="cpu",
        weights_only=True,
    )

    model.load_state_dict(stage1_checkpoint["model_state_dict"])
    model = model.to(device)

    # Unfreeze the entire network.
    unfreeze_model(model)

    criterion, class_weights = build_weighted_loss(
        train_dataset,
        max_weight=MAX_CLASS_WEIGHT,
    )
    criterion = criterion.to(device)

    # Use a smaller learning rate for the pretrained backbone.
    optimizer = torch.optim.AdamW(
        [
            {
                "params": [
                    parameter
                    for name, parameter in model.named_parameters()
                    if not name.startswith("fc.")
                ],
                "lr": STAGE2_BACKBONE_LR,
            },
            {
                "params": model.fc.parameters(),
                "lr": STAGE2_CLASSIFIER_LR,
            },
        ],
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
    best_checkpoint_path = OUTPUT_DIR / "stage2_best.pth"

    print(f"Loaded Stage 1 checkpoint from epoch: {stage1_checkpoint['epoch']}")
    print(f"Training images: {len(train_dataset)}")
    print(f"Validation images: {len(datasets['validation'])}")
    print(
        "Trainable parameters:",
        f"{sum(p.numel() for p in model.parameters() if p.requires_grad):,}",
    )
    print(f"Backbone learning rate: {STAGE2_BACKBONE_LR}")
    print(f"Classifier learning rate: {STAGE2_CLASSIFIER_LR}")

    for epoch in range(1, STAGE2_EPOCHS + 1):
        train_loss = train_one_epoch(
            model=model,
            loader=loaders["train"],
            criterion=criterion,
            optimizer=optimizer,
            device=device,
            stage=2,
        )

        validation_metrics = evaluate(
            model=model,
            loader=loaders["validation"],
            criterion=criterion,
            device=device,
            supported_class_ids=supported_class_ids,
        )

        score = validation_metrics[MONITOR_METRIC]
        scheduler.step(score)

        improved = early_stopping.update(score)

        print(
            f"Epoch {epoch}/{STAGE2_EPOCHS} | "
            f"Train Loss: {train_loss:.4f} | "
            f"Val Loss: {validation_metrics['loss']:.4f} | "
            f"Val Accuracy: {validation_metrics['accuracy']:.4f} | "
            f"Val Macro F1: {validation_metrics['macro_f1']:.4f} | "
            f"Backbone LR: {optimizer.param_groups[0]['lr']:.2e} | "
            f"Head LR: {optimizer.param_groups[1]['lr']:.2e}"
        )

        if improved:
            save_checkpoint(
                model=model,
                optimizer=optimizer,
                epoch=epoch,
                metrics=validation_metrics,
                class_to_id=class_to_id,
                output_path=best_checkpoint_path,
                stage=2,
            )
            print("  Best Stage 2 checkpoint saved.")

        if early_stopping.should_stop:
            print("Early stopping triggered.")
            break

    print(f"\nBest checkpoint: {best_checkpoint_path}")
    print(
        f"Best validation {MONITOR_METRIC}: "
        f"{early_stopping.best_score:.4f}"
    )

    return best_checkpoint_path


if __name__ == "__main__":
    run_stage2()

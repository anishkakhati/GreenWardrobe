import sys
from pathlib import Path

import torch
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

sys.path.insert(0, str(Path(__file__).parent.resolve()))

from src.training.config import *
from src.training.model_setup import get_device, load_pretrained_model
from src.data.dataloaders import create_dataloaders


def collect_predictions(model, loader, device):
    model.eval()
    actual = []
    predicted = []

    with torch.no_grad():
        for images, targets in loader:
            images = images.to(device)
            outputs = model(images)

            actual.extend(targets.numpy().tolist())
            predicted.extend(
                outputs.argmax(dim=1).cpu().numpy().tolist()
            )

    return actual, predicted


def main():
    device = get_device()

    datasets, loaders = create_dataloaders(
        manifest_path=MANIFEST_PATH,
        labels_path=LABELS_PATH,
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
        seed=RANDOM_SEED,
        split_column=SPLIT_COLUMN,
    )

    label_to_id = datasets["train"].label_to_id
    id_to_label = {v: k for k, v in label_to_id.items()}

    supported_ids = [
        class_id
        for label, class_id in label_to_id.items()
        if label not in EXCLUDED_TRAIN_LABELS
    ]

    output_dir = OUTPUT_DIR / "analysis"
    output_dir.mkdir(parents=True, exist_ok=True)

    models = {
        "pretrained": None,
        "stage1": OUTPUT_DIR / "stage1_best.pth",
        "stage2": OUTPUT_DIR / "stage2_best.pth",
    }

    reports = {}

    for name, checkpoint_path in models.items():
        print(f"\nEvaluating {name}...")

        model, _ = load_pretrained_model()

        if checkpoint_path is not None:
            checkpoint = torch.load(
                checkpoint_path,
                map_location="cpu",
                weights_only=True,
            )
            model.load_state_dict(checkpoint["model_state_dict"])

        model = model.to(device)

        actual, predicted = collect_predictions(
            model,
            loaders["validation"],
            device,
        )

        report = classification_report(
            actual,
            predicted,
            labels=list(range(len(label_to_id))),
            output_dict=True,
            zero_division=0,
        )

        rows = []

        for class_id in supported_ids:
            label = id_to_label[class_id]
            metrics = report[str(class_id)]

            rows.append({
                "class": label,
                "precision": metrics["precision"],
                "recall": metrics["recall"],
                "f1_score": metrics["f1-score"],
                "support": metrics["support"],
            })

        reports[name] = pd.DataFrame(rows).set_index("class")

        reports[name].to_csv(
            output_dir / f"{name}_classification_report.csv"
        )

        matrix = confusion_matrix(
            actual,
            predicted,
            labels=list(range(len(label_to_id))),
        )

        pd.DataFrame(
            matrix,
            index=[id_to_label[i] for i in range(len(label_to_id))],
            columns=[id_to_label[i] for i in range(len(label_to_id))],
        ).to_csv(output_dir / f"{name}_confusion_matrix.csv")

        print(f"{name} analysis saved.")

    comparison = pd.DataFrame({
        "pretrained_f1": reports["pretrained"]["f1_score"],
        "stage1_f1": reports["stage1"]["f1_score"],
        "stage2_f1": reports["stage2"]["f1_score"],
    })

    comparison["stage2_vs_pretrained"] = (
        comparison["stage2_f1"] - comparison["pretrained_f1"]
    )

    comparison["stage2_vs_stage1"] = (
        comparison["stage2_f1"] - comparison["stage1_f1"]
    )

    comparison = comparison.sort_values(
        "stage2_vs_pretrained",
        ascending=False,
    )

    comparison.to_csv(output_dir / "classwise_comparison.csv")

    print("\nTOP 10 IMPROVED CLASSES")
    print(comparison.head(10).round(4).to_string())

    print("\nTOP 10 DECLINED CLASSES")
    print(comparison.tail(10).round(4).to_string())

    print(f"\nAll reports saved to: {output_dir}")


if __name__ == "__main__":
    main()

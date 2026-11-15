import sys
from pathlib import Path

import torch
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.resolve()))

from src.training.config import *
from src.training.model_setup import get_device, load_pretrained_model
from src.data.dataloaders import create_dataloaders


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

    model, _ = load_pretrained_model()

    checkpoint = torch.load(
        OUTPUT_DIR / "stage2_best.pth",
        map_location="cpu",
        weights_only=True,
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)
    model.eval()

    dataset = datasets["validation"]
    id_to_label = {
        value: key
        for key, value in dataset.label_to_id.items()
    }

    focus_classes = {
        "elastane_spandex",
        "llama",
        "cashmere",
        "abaca",
        "jute",
    }

    records = []
    sample_index = 0

    with torch.no_grad():
        for images, targets in loaders["validation"]:
            images = images.to(device)

            probabilities = torch.softmax(model(images), dim=1)
            confidence, predictions = probabilities.topk(3, dim=1)

            for i in range(len(targets)):
                actual_id = int(targets[i])
                predicted_id = int(predictions[i, 0])

                image_path, _ = dataset.samples[sample_index]
                sample_index += 1

                actual = id_to_label[actual_id]

                if actual not in focus_classes:
                    continue

                if predicted_id == actual_id:
                    continue

                records.append({
                    "image_path": str(image_path),
                    "actual": actual,
                    "predicted": id_to_label[predicted_id],
                    "confidence": float(confidence[i, 0]),
                    "top2": id_to_label[int(predictions[i, 1])],
                    "top2_confidence": float(confidence[i, 1]),
                    "top3": id_to_label[int(predictions[i, 2])],
                    "top3_confidence": float(confidence[i, 2]),
                })

    output_dir = OUTPUT_DIR / "analysis"
    output_dir.mkdir(parents=True, exist_ok=True)

    result = pd.DataFrame(records)

    output_path = output_dir / "stage2_misclassified_samples.csv"
    result.to_csv(output_path, index=False)

    print("\nMISCLASSIFIED IMAGE SUMMARY")
    print("-" * 55)

    if not result.empty:
        print(
            result.groupby("actual")
            .size()
            .rename("incorrect_images")
            .to_string()
        )

        print("\nHIGHEST-CONFIDENCE INCORRECT PREDICTIONS")

        for label in focus_classes:
            subset = result[result["actual"] == label]
            subset = subset.sort_values(
                "confidence",
                ascending=False,
            )

            print(f"\n{label}:")
            print(
                subset[
                    ["predicted", "confidence", "top2", "top3"]
                ].head(5).to_string(index=False)
            )

    print(f"\nSaved misclassified images report: {output_path}")
    print("\nERROR EXTRACTION COMPLETED")


if __name__ == "__main__":
    main()

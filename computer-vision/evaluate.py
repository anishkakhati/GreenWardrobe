import argparse
import ast
import csv
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageFile
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import classification_report, confusion_matrix

import sys

MODULE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(MODULE_DIR))

from src.resnet_model.resnet import get_resnet18

ImageFile.LOAD_TRUNCATED_IMAGES = True

EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".ppm", ".bmp",
    ".pgm", ".tif", ".tiff", ".webp"
}


class FibreDataset(Dataset):
    def __init__(self, root, label_to_id):
        self.samples = []

        for category, label in label_to_id.items():
            folder = root / category

            if not folder.exists():
                continue

            for path in sorted(folder.iterdir()):
                if (
                    path.is_file()
                    and path.suffix.lower() in EXTENSIONS
                    and not path.name.startswith("._")
                    and not path.name.startswith(".")
                ):
                    self.samples.append((path, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        path, label = self.samples[index]

        try:
            with Image.open(path) as img:
                image = img.convert("RGB").resize((224, 224))
                array = np.asarray(image, dtype=np.float32) / 255.0

            tensor = torch.from_numpy(array).permute(2, 0, 1)
            return tensor, label
        except Exception as exc:
            print(f"Skipping unreadable image {path}: {exc}")
            return None


def collate_valid(batch):
    batch = [item for item in batch if item is not None]

    if not batch:
        return None

    images, labels = zip(*batch)
    return torch.stack(images), torch.tensor(labels)


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate the TextileNet fibre ResNet-18 model."
    )
    parser.add_argument("--data-dir", required=True,
                        help="Test directory containing one folder per fibre class.")
    parser.add_argument("--checkpoint", required=True,
                        help="Path to the pretrained model checkpoint.")
    parser.add_argument("--labels", default="labels/fibre_label.txt",
                        help="Path to fibre_label.txt.")
    parser.add_argument("--output-dir", default="evaluation",
                        help="Directory for evaluation CSV outputs.")
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--device", choices=["auto", "cpu", "mps"],
                        default="auto")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    checkpoint_path = Path(args.checkpoint)
    labels_path = Path(args.labels)
    output_dir = Path(args.output_dir)

    for path in (data_dir, checkpoint_path, labels_path):
        if not path.exists():
            raise FileNotFoundError(f"Required path does not exist: {path}")

    output_dir.mkdir(parents=True, exist_ok=True)

    with labels_path.open() as file:
        label_to_id = ast.literal_eval(file.read())

    id_to_label = {value: key for key, value in label_to_id.items()}
    class_names = [id_to_label[i] for i in range(len(id_to_label))]

    if args.device == "auto":
        device = torch.device(
            "mps" if torch.backends.mps.is_available() else "cpu"
        )
    else:
        device = torch.device(args.device)

    if device.type == "mps" and not torch.backends.mps.is_available():
        raise RuntimeError("MPS was requested but is not available.")

    dataset = FibreDataset(data_dir, label_to_id)

    if len(dataset) == 0:
        raise RuntimeError(f"No supported images found in {data_dir}")

    loader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0,
        collate_fn=collate_valid
    )

    checkpoint = torch.load(
        checkpoint_path,
        map_location="cpu",
        weights_only=True
    )

    model = get_resnet18(num_classes=len(class_names))

    state_dict = {
        key.removeprefix("module."): value
        for key, value in checkpoint["model"].items()
    }

    model.load_state_dict(state_dict, strict=True)
    model.to(device)
    model.eval()

    y_true = []
    y_pred = []
    top3_correct = 0
    processed = 0

    print(f"Device: {device}")
    print(f"Images discovered: {len(dataset)}")
    print("Running evaluation...")

    with torch.inference_mode():
        for batch_number, batch in enumerate(loader, start=1):
            if batch is None:
                continue

            images, labels = batch
            outputs = model(images.to(device))

            predictions = outputs.argmax(dim=1).cpu()
            top3 = outputs.topk(3, dim=1).indices.cpu()

            y_true.extend(labels.tolist())
            y_pred.extend(predictions.tolist())

            top3_correct += (
                top3 == labels.unsqueeze(1)
            ).any(dim=1).sum().item()

            processed += len(labels)

            if batch_number % 20 == 0:
                print(f"Processed {processed}/{len(dataset)} images")

    if processed == 0:
        raise RuntimeError("No images could be evaluated.")

    top1_accuracy = sum(
        actual == predicted
        for actual, predicted in zip(y_true, y_pred)
    ) / processed

    top3_accuracy = top3_correct / processed

    report = classification_report(
        y_true,
        y_pred,
        labels=list(range(len(class_names))),
        target_names=class_names,
        output_dict=True,
        zero_division=0
    )

    report_path = output_dir / "classification_report.csv"
    with report_path.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Class", "Precision", "Recall", "F1-score", "Support"])

        for name in class_names:
            row = report[name]
            writer.writerow([
                name,
                row["precision"],
                row["recall"],
                row["f1-score"],
                row["support"]
            ])

    matrix = confusion_matrix(
        y_true,
        y_pred,
        labels=list(range(len(class_names)))
    )

    matrix_path = output_dir / "confusion_matrix.csv"
    with matrix_path.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Actual / Predicted"] + class_names)

        for name, row in zip(class_names, matrix):
            writer.writerow([name] + row.tolist())

    print("\nEvaluation complete")
    print(f"Processed images: {processed}")
    print(f"Top-1 accuracy: {top1_accuracy * 100:.2f}%")
    print(f"Top-3 accuracy: {top3_accuracy * 100:.2f}%")
    print(f"Classification report: {report_path}")
    print(f"Confusion matrix: {matrix_path}")


if __name__ == "__main__":
    main()

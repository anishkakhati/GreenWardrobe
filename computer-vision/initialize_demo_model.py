import ast
from pathlib import Path

import torch

from src.resnet_model.resnet import get_resnet18

PROJECT_DIR = Path(__file__).parent
CHECKPOINT_DIR = PROJECT_DIR / "checkpoints"
DEMO_DIR = PROJECT_DIR / "data" / "demo"

STAGE2_PATH = CHECKPOINT_DIR / "stage2_best.pth"
ORIGINAL_LABELS_PATH = PROJECT_DIR / "labels" / "fibre_label.txt"
DEMO_LABELS_PATH = DEMO_DIR / "demo_labels.txt"

OUTPUT_PATH = CHECKPOINT_DIR / "demo_initialized.pth"


def main():
    # Read both label mappings.
    original_labels = ast.literal_eval(
        ORIGINAL_LABELS_PATH.read_text()
    )

    demo_labels = ast.literal_eval(
        DEMO_LABELS_PATH.read_text()
    )

    assert len(demo_labels) == 8
    assert all(label in original_labels for label in demo_labels)

    # Load the best Stage 2 checkpoint.
    checkpoint = torch.load(
        STAGE2_PATH,
        map_location="cpu",
        weights_only=True,
    )

    source_state = checkpoint["model_state_dict"]

    # Create an eight-class ResNet-18.
    model = get_resnet18(num_classes=len(demo_labels))
    target_state = model.state_dict()

    # Transfer all backbone parameters.
    for key in target_state:
        if not key.startswith("fc."):
            target_state[key] = source_state[key].clone()

    # Transfer only the selected classifier rows.
    for label, new_id in demo_labels.items():
        old_id = original_labels[label]

        target_state["fc.weight"][new_id] = (
            source_state["fc.weight"][old_id].clone()
        )

        target_state["fc.bias"][new_id] = (
            source_state["fc.bias"][old_id].clone()
        )

    model.load_state_dict(target_state, strict=True)

    # Save without overwriting either original checkpoint.
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "class_to_id": demo_labels,
            "num_classes": len(demo_labels),
            "source_stage": 2,
            "source_epoch": checkpoint["epoch"],
        },
        OUTPUT_PATH,
    )

    print("DEMO MODEL INITIALIZED")
    print("Architecture: ResNet-18")
    print("Output classes:", len(demo_labels))
    print("Source Stage 2 epoch:", checkpoint["epoch"])

    print("\nTransferred classifier mapping:")

    for label, new_id in demo_labels.items():
        print(
            f"{label:<20} "
            f"Original ID: {original_labels[label]:>2} "
            f"Demo ID: {new_id:>2}"
        )

    print("\nSaved:", OUTPUT_PATH)


if __name__ == "__main__":
    main()

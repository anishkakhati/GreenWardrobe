import ast
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

from src.resnet_model.resnet import get_resnet18


class MaterialPredictor:
    """GreenWardrobe 8-class material prediction service."""

    def __init__(
        self,
        checkpoint_path=None,
        labels_path=None,
        confidence_threshold=0.55,
        device=None,
    ):
        base_dir = Path(__file__).resolve().parents[2]

        self.checkpoint_path = Path(
            checkpoint_path or base_dir / "checkpoints/demo_initialized.pth"
        )
        self.labels_path = Path(
            labels_path or base_dir / "data/demo/demo_labels.txt"
        )

        self.confidence_threshold = confidence_threshold

        if not self.checkpoint_path.exists():
            raise FileNotFoundError(
                f"Checkpoint not found: {self.checkpoint_path}"
            )

        if not self.labels_path.exists():
            raise FileNotFoundError(
                f"Labels file not found: {self.labels_path}"
            )

        if device is None:
            device = (
                "mps" if torch.backends.mps.is_available()
                else "cuda" if torch.cuda.is_available()
                else "cpu"
            )

        self.device = torch.device(device)

        with open(self.labels_path, "r") as file:
            self.class_to_id = ast.literal_eval(file.read())

        self.id_to_class = {
            class_id: name
            for name, class_id in self.class_to_id.items()
        }

        checkpoint = torch.load(
            self.checkpoint_path,
            map_location="cpu",
            weights_only=True,
        )

        self.model = get_resnet18(
            num_classes=checkpoint["num_classes"]
        )

        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])

    def predict(self, image_path, top_k=3):
        image_path = Path(image_path)

        if not image_path.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        if top_k < 1:
            raise ValueError("top_k must be at least 1.")

        top_k = min(top_k, len(self.class_to_id))

        with Image.open(image_path) as image:
            image = image.convert("RGB")
            tensor = self.transform(image).unsqueeze(0)

        tensor = tensor.to(self.device)

        with torch.inference_mode():
            logits = self.model(tensor)
            probabilities = torch.softmax(logits, dim=1)[0]

        scores, indices = torch.topk(probabilities, top_k)

        predictions = []

        for score, index in zip(scores.tolist(), indices.tolist()):
            predictions.append({
                "material": self.id_to_class[index],
                "confidence": round(score, 4),
                "confidence_percent": round(score * 100, 2),
            })

        top_prediction = predictions[0]

        return {
            "success": True,
            "predicted_material": top_prediction["material"],
            "confidence": top_prediction["confidence"],
            "confidence_percent": top_prediction["confidence_percent"],
            "low_confidence": (
                top_prediction["confidence"] < self.confidence_threshold
            ),
            "confidence_threshold": self.confidence_threshold,
            "top_predictions": predictions,
            "model": "GreenWardrobe-ResNet18",
            "device": str(self.device),
        }

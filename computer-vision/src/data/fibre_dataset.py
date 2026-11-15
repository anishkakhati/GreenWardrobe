import ast
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from PIL import Image, ImageFile
from torch.utils.data import Dataset


ImageFile.LOAD_TRUNCATED_IMAGES = True

VALID_SPLITS = {"train", "validation", "test"}
IMAGE_SIZE = (224, 224)


class FibreDataset(Dataset):
    """
    Manifest-based PyTorch dataset for GreenWardrobe fibre classification.

    Expected manifest columns:
        image_path, label, final_split

    Returns:
        image_tensor: FloatTensor of shape (3, 224, 224)
        label_id: Integer class index
    """

    def __init__(
        self,
        manifest_path,
        labels_path,
        split,
        image_size=IMAGE_SIZE,
        split_column="final_split",
        transform=None,
        exclude_labels=None,
    ):
        if split not in VALID_SPLITS:
            raise ValueError(
                f"Invalid split '{split}'. "
                f"Choose from {sorted(VALID_SPLITS)}."
            )

        self.manifest_path = Path(manifest_path)
        self.labels_path = Path(labels_path)
        self.split = split
        self.image_size = tuple(image_size)
        self.split_column = split_column
        self.transform = transform
        self.exclude_labels = set(exclude_labels or [])

        if not self.manifest_path.is_file():
            raise FileNotFoundError(
                f"Manifest not found: {self.manifest_path}"
            )

        if not self.labels_path.is_file():
            raise FileNotFoundError(
                f"Label mapping not found: {self.labels_path}"
            )

        # Load the original fibre-to-index mapping.
        with self.labels_path.open("r") as file:
            self.label_to_id = ast.literal_eval(file.read())

        if not isinstance(self.label_to_id, dict):
            raise ValueError("Fibre label mapping must be a dictionary.")

        expected_ids = list(range(len(self.label_to_id)))

        if sorted(self.label_to_id.values()) != expected_ids:
            raise ValueError(
                "Fibre label IDs must be unique and consecutive from 0."
            )

        self.id_to_label = {
            index: label
            for label, index in self.label_to_id.items()
        }

        # Load and validate the selected split manifest.
        manifest = pd.read_csv(self.manifest_path)

        required_columns = {
            "image_path",
            "label",
            self.split_column,
        }

        missing_columns = required_columns - set(manifest.columns)

        if missing_columns:
            raise ValueError(
                f"Manifest is missing columns: {sorted(missing_columns)}"
            )

        split_data = manifest[
            manifest[self.split_column] == self.split
        ].copy()

        if self.exclude_labels:
            split_data = split_data[
                ~split_data["label"].isin(self.exclude_labels)
            ].copy()

        if split_data.empty:
            raise ValueError(
                f"No records found for split '{self.split}'."
            )

        if split_data["image_path"].duplicated().any():
            raise ValueError(
                f"Duplicate image paths found in '{self.split}' split."
            )

        unknown_labels = (
            set(split_data["label"].unique())
            - set(self.label_to_id.keys())
        )

        if unknown_labels:
            raise ValueError(
                f"Unknown fibre labels: {sorted(unknown_labels)}"
            )

        # Store image paths and their corresponding class indices.
        self.samples = [
            (
                Path(row.image_path),
                self.label_to_id[row.label],
            )
            for row in split_data.itertuples(index=False)
        ]

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        image_path, label_id = self.samples[index]

        try:
            with Image.open(image_path) as image:
                image = image.convert("RGB")

                if self.transform is not None:
                    image_tensor = self.transform(image)
                else:
                    image = image.resize(self.image_size)

                    array = np.asarray(
                        image,
                        dtype=np.float32
                    ) / 255.0

                    image_tensor = (
                        torch.from_numpy(array)
                        .permute(2, 0, 1)
                        .contiguous()
                    )

            return image_tensor, label_id

        except Exception as exc:
            raise RuntimeError(
                f"Failed to load image: {image_path}"
            ) from exc

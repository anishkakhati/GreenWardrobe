import random

import numpy as np
import torch
from torch.utils.data import DataLoader
from torchvision import transforms

from src.data.fibre_dataset import FibreDataset


def seed_worker(worker_id):
    """Seed NumPy and Python random for each worker."""
    worker_seed = torch.initial_seed() % (2**32)
    np.random.seed(worker_seed)
    random.seed(worker_seed)


def create_dataloaders(
    manifest_path,
    labels_path,
    batch_size=32,
    num_workers=0,
    seed=42,
    split_column="final_split",
):
    """
    Create reproducible train, validation and test DataLoaders.
    """

    if batch_size <= 0:
        raise ValueError("Batch size must be positive.")

    if num_workers < 0:
        raise ValueError("num_workers cannot be negative.")

    generator = torch.Generator()
    generator.manual_seed(seed)

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ToTensor(),
    ])

    evaluation_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    datasets = {
        "train": FibreDataset(
            manifest_path=manifest_path,
            labels_path=labels_path,
            split="train",
            split_column=split_column,
            transform=train_transform,
            exclude_labels={"polyolefin"},
        ),
        "validation": FibreDataset(
            manifest_path=manifest_path,
            labels_path=labels_path,
            split="validation",
            split_column=split_column,
            transform=evaluation_transform,
        ),
        "test": FibreDataset(
            manifest_path=manifest_path,
            labels_path=labels_path,
            split="test",
            split_column=split_column,
            transform=evaluation_transform,
        ),
    }

    loaders = {
        "train": DataLoader(
            datasets["train"],
            batch_size=batch_size,
            shuffle=True,
            num_workers=num_workers,
            pin_memory=False,
            worker_init_fn=seed_worker,
            generator=generator,
            drop_last=False,
        ),

        "validation": DataLoader(
            datasets["validation"],
            batch_size=batch_size,
            shuffle=False,
            num_workers=num_workers,
            pin_memory=False,
            drop_last=False,
        ),

        "test": DataLoader(
            datasets["test"],
            batch_size=batch_size,
            shuffle=False,
            num_workers=num_workers,
            pin_memory=False,
            drop_last=False,
        ),
    }

    return datasets, loaders

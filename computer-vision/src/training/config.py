from pathlib import Path


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]

MANIFEST_PATH = (
    Path.home() / "Desktop/GreenWardrobe_experiment_split_manifest.csv"
)

LABELS_PATH = PROJECT_ROOT / "labels" / "fibre_label.txt"

CHECKPOINT_PATH = (
    Path.home()
    / "Desktop/TextileNet/baselines/TextileNet-fibre/res18_ckpt.pth"
)

OUTPUT_DIR = PROJECT_ROOT / "checkpoints"


# Dataset configuration
BATCH_SIZE = 32
NUM_WORKERS = 0
RANDOM_SEED = 42
SPLIT_COLUMN = "experiment_split"

EXCLUDED_TRAIN_LABELS = {"polyolefin"}


# Model configuration
NUM_CLASSES = 33
IMAGE_SIZE = 224


# Stage 1: Train classifier only
STAGE1_EPOCHS = 5
STAGE1_CLASSIFIER_LR = 1e-3


# Stage 2: Fine-tune complete network
STAGE2_EPOCHS = 20
STAGE2_BACKBONE_LR = 1e-4
STAGE2_CLASSIFIER_LR = 5e-4


# Optimizer configuration
WEIGHT_DECAY = 1e-4


# Learning-rate scheduler
SCHEDULER_FACTOR = 0.5
SCHEDULER_PATIENCE = 2
MIN_LEARNING_RATE = 1e-7


# Early stopping
EARLY_STOPPING_PATIENCE = 5
MONITOR_METRIC = "macro_f1"


# Class imbalance
MAX_CLASS_WEIGHT = 5.0


# Device preference
PREFERRED_DEVICE = "mps"

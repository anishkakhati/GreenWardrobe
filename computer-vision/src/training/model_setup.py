import torch
import torch.nn as nn

from src.resnet_model.resnet import get_resnet18
from src.training import config


def get_device():
    """Select the best available device."""

    if (
        config.PREFERRED_DEVICE == "mps"
        and torch.backends.mps.is_available()
    ):
        return torch.device("mps")

    if torch.cuda.is_available():
        return torch.device("cuda")

    return torch.device("cpu")


def load_pretrained_model():
    """Load the pretrained TextileNet ResNet-18 model."""

    checkpoint = torch.load(
        config.CHECKPOINT_PATH,
        map_location="cpu",
        weights_only=True,
    )

    state_dict = {
        key.removeprefix("module."): value
        for key, value in checkpoint["model"].items()
    }

    model = get_resnet18(num_classes=config.NUM_CLASSES)
    model.load_state_dict(state_dict, strict=True)

    return model, checkpoint


def freeze_backbone(model):
    """Freeze feature extractor and train classifier only."""

    for parameter in model.parameters():
        parameter.requires_grad = False

    for parameter in model.fc.parameters():
        parameter.requires_grad = True


def unfreeze_model(model):
    """Enable training for the complete network."""

    for parameter in model.parameters():
        parameter.requires_grad = True


def set_stage1_mode(model):
    """Keep frozen backbone BatchNorm layers in evaluation mode."""

    model.train()

    for module in model.modules():
        if isinstance(module, nn.modules.batchnorm._BatchNorm):
            if not any(
                parameter.requires_grad
                for parameter in module.parameters()
            ):
                module.eval()


def get_trainable_parameters(model):
    """Return only parameters that require gradients."""

    return [
        parameter
        for parameter in model.parameters()
        if parameter.requires_grad
    ]

import numpy as np

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)


def calculate_metrics(y_true, y_pred, label_ids):
    """
    Calculate classification metrics for supported fibre classes.
    """

    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    label_ids = list(label_ids)

    if len(y_true) != len(y_pred):
        raise ValueError("Targets and predictions must have equal lengths.")

    if len(y_true) == 0:
        raise ValueError("Cannot calculate metrics on empty data.")

    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "macro_precision": precision_score(
            y_true, y_pred,
            labels=label_ids,
            average="macro",
            zero_division=0,
        ),
        "macro_recall": recall_score(
            y_true, y_pred,
            labels=label_ids,
            average="macro",
            zero_division=0,
        ),
        "macro_f1": f1_score(
            y_true, y_pred,
            labels=label_ids,
            average="macro",
            zero_division=0,
        ),
        "weighted_f1": f1_score(
            y_true, y_pred,
            labels=label_ids,
            average="weighted",
            zero_division=0,
        ),
        "classification_report": classification_report(
            y_true,
            y_pred,
            labels=label_ids,
            zero_division=0,
            output_dict=True,
        ),
    }

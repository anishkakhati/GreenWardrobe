# GreenWardrobe: Computer Vision

## Phase 1: TextileNet Fibre Classification Baseline

### 1. Objective

This module establishes a computer vision baseline for identifying textile fibres from garment images.

The initial baseline uses the pretrained fibre-classification model from [TextileNet](https://github.com/hahashu/TextileNet), a research project that introduces separate taxonomies for fibre and fabric identification.

This phase focuses on research, model inspection, inference, and evaluation. It does not yet implement GreenWardrobe's production prediction API or fine-tune the model.

### 2. Model Details

| Property | Details |
|---|---|
| Source project | TextileNet |
| Task | Fibre classification |
| Architecture | ResNet-18 |
| Framework | PyTorch |
| Number of output classes | 33 |
| Input image size | 224 × 224 |
| Input channels | RGB |
| Output | Fibre class scores |

The model implementation is based on the upstream TextileNet repository.

**Important:** The upstream README benchmark table refers to ResNet50, while the inspected model implementation and checkpoint used in this experiment correspond to ResNet-18. These should not be treated as the same model configuration.

### 3. Fibre Classes

The class-to-index mapping is maintained in:

`labels/fibre_label.txt`

The 33 classes are:

Abaca, Acrylic, Alpaca, Angora, Aramid, Camel, Cashmere, Cotton, Cupro, Elastane/Spandex, Flax/Linen, Fur, Hemp, Horse Hair, Jute, Leather, Llama, Lyocell, Milk Fibre, Modal, Mohair, Nylon, Polyester, Polyolefin, Ramie, Silk, Sisal, Soybean Fibre, Suede, Triacetate/Acetate, Viscose/Rayon, Wool, and Yak.

### 4. Baseline Evaluation

The pretrained model was evaluated on the locally available TextileNet fibre test directory.

| Metric | Result |
|---|---:|
| Images evaluated | 24,886 |
| Represented test classes | 32 |
| Top-1 accuracy | 45.94% |
| Top-3 accuracy | 73.41% |
| Macro F1-score (32 represented classes) | 0.2755 |
| Weighted F1-score | 0.4286 |

The label mapping contains 33 classes, but the local test directory had no valid test images for `polyolefin`.

The evaluation used the available local test directory. It has not been established that this directory exactly matches the split used to produce the checkpoint's reported metadata.

### 5. Evaluation Observations

The model performs unevenly across fibre classes.

Examples of stronger top-1 class accuracy:

- Polyester: 74.09%
- Camel: 65.68%
- Cotton: 61.58%
- Leather: 60.31%
- Wool: 59.82%

Examples of weaker top-1 class accuracy:

- Soybean fibre: 0%
- Acrylic: 7.21%
- Angora: 10.15%
- Ramie: 10.19%
- Lyocell: 10.77%

The confusion matrix shows substantial confusion between visually or statistically similar classes. Frequent errors include:

- Cotton predicted as polyester.
- Elastane/spandex predicted as polyester.
- Polyester predicted as cotton.
- Nylon predicted as polyester.
- Silk predicted as polyester.

These results indicate that the pretrained model is a useful research baseline, but its predictions should not be treated as definitive fibre composition.

### 6. Checkpoint Accuracy Discrepancy

The checkpoint metadata reports an accuracy of approximately 49.70%.

Our evaluation measured 45.94% top-1 accuracy, a difference of approximately 3.76 percentage points.

The exact cause has not been established. Potential factors include differences in the original evaluation split, dataset version, or evaluation configuration.

Therefore, the local result is documented as an independent baseline measurement, not as an exact reproduction of the upstream benchmark.

### 7. Repository Structure

```text
computer-vision/
├── README.md
├── evaluate.py
├── TEXTILENET-LICENSE
├── labels/
│   └── fibre_label.txt
├── evaluation/
│   ├── classification_report.csv
│   └── confusion_matrix.csv
└── src/
    └── resnet_model/
        └── resnet.py
```

### 8. Running the Evaluation

#### Requirements

- Python 3
- PyTorch
- NumPy
- Pillow
- scikit-learn

Install the Python dependencies:

```bash
pip install torch numpy Pillow scikit-learn
```

#### Dataset directory format

The test directory should contain one folder per fibre class:

```text
test/
├── abaca/
├── acrylic/
├── alpaca/
├── ...
└── yak/
```

Images are resized to 224 × 224 pixels and converted to RGB.

#### Checkpoint

The pretrained checkpoint is not included in this repository.

Obtain the appropriate TextileNet fibre ResNet-18 checkpoint from the upstream project, subject to its applicable usage and redistribution terms.

#### Run

From the GreenWardrobe repository root:

```bash
python computer-vision/evaluate.py \
  --data-dir /path/to/fibre/test \
  --checkpoint /path/to/res18_ckpt.pth \
  --labels computer-vision/labels/fibre_label.txt \
  --output-dir computer-vision/evaluation \
  --device auto
```

Available device options:

- `auto`: Uses Apple Silicon MPS when available, otherwise CPU.
- `mps`: Uses Apple Silicon GPU.
- `cpu`: Uses CPU.

The script generates:

- `classification_report.csv`
- `confusion_matrix.csv`

### 9. Current Limitations

- Predictions are based on garment image appearance, not direct laboratory fibre analysis.
- Visually similar fibres may be confused.
- Performance varies considerably across classes.
- The local evaluation does not establish performance on real-world user-uploaded images.
- The checkpoint's reported accuracy has not been exactly reproduced.
- The current module is an offline evaluation baseline, not yet integrated with the GreenWardrobe backend.
- The model does not independently verify fibre composition from garment labels.

Computer vision predictions should eventually be combined with OCR-extracted garment label information and confidence-aware recommendations.

### 10. Next Steps

1. Inspect training class distribution.
2. Investigate class imbalance and model confusion.
3. Experiment with fine-tuning and improved evaluation.
4. Build a reusable image prediction interface.
5. Integrate the prediction module with the GreenWardrobe backend.

### 11. References and Attribution

- TextileNet repository: https://github.com/hahashu/TextileNet
- TextileNet research paper: https://arxiv.org/abs/2301.06160
- The upstream repository's MIT licence is included as `TEXTILENET-LICENSE`.

The upstream README separately describes the licensing of its data-collection code and dataset. The inclusion of the MIT licence here does not imply that the dataset or pretrained checkpoint is relicensed under MIT.

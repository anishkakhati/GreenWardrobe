
# GreenWardrobe — Clothing Label OCR

### Automated Clothing Composition Extraction and OCR Accuracy Evaluation

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![OCR](https://img.shields.io/badge/OCR-EasyOCR-purple)
![Dataset](https://img.shields.io/badge/Dataset-500%20Images-green)
![Status](https://img.shields.io/badge/Project-Development-orange)

## 1. Project Overview

The Clothing Label OCR module is a part of the GreenWardrobe project.

Its primary objective is to automatically extract textile composition information from clothing-label images using Optical Character Recognition (OCR).

Clothing labels contain important information such as:

- Fibre names
- Fabric composition percentages
- Country of manufacture
- RN and CA identification numbers
- Washing and care instructions

Manually reading this information from hundreds of clothing labels is time-consuming.

This module automates the process by extracting the text from label images and evaluating how accurately the OCR system recognizes the information.

## 2. Objectives

The major objectives of this module are:

1. Extract text from clothing composition label images.
2. Identify textile fibre names such as Cotton, Polyester, Viscose, Nylon and Wool.
3. Extract the corresponding fibre percentages.
4. Retrieve country-of-origin and identification information.
5. Compare OCR-generated text with the ground-truth metadata.
6. Calculate OCR accuracy using different evaluation metrics.
7. Generate reports for incorrect predictions and performance analysis.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| EasyOCR | Text recognition |
| OpenCV | Image preprocessing |
| Pandas | Dataset and metadata handling |
| NumPy | Numerical operations |
| Matplotlib | Visualization |
| JiWER | CER and WER evaluation |
| Google Colab | Cloud notebook environment |

## 4. Dataset Description

The project uses a dataset containing 100 synthetic clothing composition label images.

Dataset contents:

- 100 JPG label images
- Ground-truth metadata CSV
- Composition percentages
- Country information
- RN and CA numbers
- Care instructions

The metadata file contains the expected information associated with each image.

The dataset is used to evaluate the OCR pipeline across all 100 images.

**Important:** This is a synthetic development dataset. Its results should not be treated as a measurement of performance on real-world garment-label photographs.

## 5. System Architecture

```text
         Clothing Label Images
                   |
                   v
             Image Loading
                   |
                   v
          Image Preprocessing
                   |
                   v
             EasyOCR Model
                   |
                   v
           Extracted OCR Text
                   |
                   v
          Ground Truth CSV
                   |
                   v
             Text Comparison
                   |
          -------------------
          |                 |
          v                 v
     Text Metrics      Field Evaluation
          |                 |
          v                 v
       CER / WER       Fibre Percentages
          |             Fibre Names
          |             Country / IDs
          -------------------
                   |
                   v
             Final Reports
```

## 6. Working Methodology

### Step 1: Dataset Loading

The system loads all 100 images and the corresponding metadata CSV.

### Step 2: Image Preprocessing

OpenCV is used to improve image readability through:

- Image resizing
- Grayscale conversion
- Contrast enhancement
- Sharpening

### Step 3: OCR Text Extraction

EasyOCR detects and recognizes text from each clothing-label image.

The recognized text is stored for further evaluation.

### Step 4: Ground Truth Generation

Expected text is generated from the metadata CSV.

This expected text acts as the reference against which OCR output is evaluated.

### Step 5: Accuracy Evaluation

The predicted OCR text is compared against the reference text.

The evaluation includes:

- Character Error Rate (CER)
- Word Error Rate (WER)
- Exact text match
- Fibre-name accuracy
- Percentage accuracy
- Composition exact match

### Step 6: Report Generation

The system generates CSV files containing all predictions, incorrect predictions and summary metrics.

## 7. Evaluation Metrics

### Character Error Rate (CER)

Measures the number of character-level errors.

CER = (Substitutions + Deletions + Insertions) / Total Reference Characters

Lower CER indicates better recognition.

### Word Error Rate (WER)

Measures errors at the word level.

WER = (Substitutions + Deletions + Insertions) / Total Reference Words

Lower WER indicates better recognition.

### Exact Text Accuracy

Measures the percentage of images for which normalized predicted text matches the reference text exactly.

### Composition Accuracy

Checks whether the extracted fibre names and their corresponding percentages match the expected composition.

### Percentage Accuracy

Evaluates whether the numerical percentages associated with textile fibres are extracted correctly.

## 8. Repository Structure

```text
clothing-label-ocr/
│
├── data/
│   └── clothing_composition_label_dataset_100.zip
│
├── notebooks/
│   └── GreenWardrobe_OCR_Evaluation.ipynb
│
├── src/
│   └── evaluate_ocr.py
│
├── outputs/
│
├── requirements.txt
├── README.md
└── .gitignore
```

## 9. Installation and Setup

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Navigate to the project:

```bash
cd clothing-label-ocr
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Extract the dataset:

```bash
python -c "import zipfile; zipfile.ZipFile('data/clothing_composition_label_dataset_100.zip').extractall('data')"
```

Run the evaluation:

```bash
python src/evaluate_ocr.py --data-dir data --output-dir outputs
```

## 10. Generated Outputs

The evaluation pipeline generates:

| Output File | Description |
|---|---|
| all_ocr_results.csv | OCR predictions for all images |
| incorrect_predictions.csv | Images with mismatches |
| accuracy_summary.csv | Overall evaluation metrics |

## 11. Future Improvements

- Integrate a fine-tuned TrOCR model.
- Improve recognition of percentage symbols.
- Improve recognition of small textile-label text.
- Add real-world garment-label images.
- Improve fibre composition parsing.
- Add confidence-based error analysis.
- Integrate OCR results with the GreenWardrobe backend.

## 12. Important Notes

This repository currently implements an EasyOCR baseline and an evaluation pipeline.

It does not claim to contain a newly trained OCR model.

The 100-image dataset is synthetic and is intended for controlled development and testing.

The current evaluation checks printed care-instruction text. It does not evaluate the visual meaning of washing symbols.

## 13. Project Contribution

This module contributes to GreenWardrobe by providing automated text extraction and evaluation for clothing composition labels.

It helps reduce manual reading effort and provides measurable information about OCR recognition quality.

---

**Project:** GreenWardrobe

**Module:** Clothing Label OCR

**Primary Language:** Python

**OCR Engine:** EasyOCR

from pathlib import Path

import pandas as pd
from PIL import Image, ImageDraw, ImageFont

CSV_PATH = Path(
    "computer-vision/checkpoints/analysis/"
    "stage2_misclassified_samples.csv"
)

OUTPUT_DIR = Path(
    "computer-vision/checkpoints/analysis/contact_sheets"
)

FOCUS_CLASSES = [
    "elastane_spandex",
    "llama",
    "cashmere",
    "abaca",
    "jute",
]

df = pd.read_csv(CSV_PATH)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

font = ImageFont.load_default()

columns = 2
rows = 2
card_width = 340
card_height = 270
image_width = 320
image_height = 205

for label in FOCUS_CLASSES:
    subset = (
        df[df["actual"] == label]
        .sort_values("confidence", ascending=False)
        .head(4)
    )

    sheet = Image.new(
        "RGB",
        (columns * card_width, rows * card_height),
        "white",
    )

    draw = ImageDraw.Draw(sheet)

    for index, (_, record) in enumerate(subset.iterrows()):
        x = (index % columns) * card_width
        y = (index // columns) * card_height

        try:
            image = Image.open(record["image_path"]).convert("RGB")
            image.thumbnail((image_width, image_height))

            image_x = x + (card_width - image.width) // 2
            sheet.paste(image, (image_x, y + 5))

            text_y = y + 215

            lines = [
                f"Actual: {record['actual']}",
                f"Predicted: {record['predicted']}",
                f"Confidence: {record['confidence']:.2%}",
                f"Top 2: {record['top2']} | Top 3: {record['top3']}",
            ]

            for line in lines:
                draw.text(
                    (x + 10, text_y),
                    line,
                    fill="black",
                    font=font,
                )
                text_y += 13

        except Exception as error:
            draw.text(
                (x + 10, y + 20),
                f"Image error: {error}",
                fill="red",
                font=font,
            )

    output_path = OUTPUT_DIR / f"{label}_errors.png"
    sheet.save(output_path)

    print(f"Created: {output_path}")

print("\nCONTACT SHEETS GENERATED")

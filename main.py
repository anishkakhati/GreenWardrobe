import argparse
import json
from green_wardrobe import EnvironmentalScorer, RecommendationEngine


def main():
    parser = argparse.ArgumentParser(description="Green Wardrobe Environmental Scoring Engine")
    parser.add_argument(
        "--composition",
        default="polyester:65,cotton:35",
        help="Comma-separated material:percentage pairs, e.g. polyester:65,cotton:35",
    )
    parser.add_argument("--condition", default="new", help="new, damaged, repairable, usable")
    parser.add_argument("--shopping", action="store_true", help="User is considering a purchase")
    parser.add_argument("--second-hand-available", action="store_true")
    args = parser.parse_args()

    composition = {}
    for item in args.composition.split(","):
        material, percentage = item.strip().split(":")
        composition[material.strip()] = float(percentage)

    scorer = EnvironmentalScorer()
    result = scorer.score(composition)

    recommendation = RecommendationEngine().recommend(
        result["overall_score"],
        garment_condition=args.condition,
        shopping=args.shopping,
        second_hand_available=args.second_hand_available,
    )
    result["recommendation"] = recommendation
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()


## Module Ownership & Contribution

# **Module:** – Environmental Scoring & Recommendation Engine

**Contributor:** Manish Yadav

**Primary Responsibilities:**
- Research and define environmental scoring methodology.
- Develop material-level environmental scoring algorithms.
- Implement weighted calculations for blended fabrics.
- Develop the recommendation engine.
- Handle missing environmental data.
- Implement score classification and thresholds.
- Write and execute automated test cases.
- Document scoring methodology and assumptions.

**Technology Stack:** Python, Pandas, NumPy, Pytest

**Project:** Green Wardrobe

## Important data and methodology warning

The values in `data/material_impact_data.csv` are **DEMO PLACEHOLDERS**, not verified lifecycle-assessment (LCA) measurements and must not be presented as scientifically established facts. Replace them with sourced, consistently scoped data before making real-world claims.

The current model:
- Uses a 0–100 impact index for each of six categories (higher = worse).
- Applies provisional category weights from `green_wardrobe/config.py`.
- Calculates each blend category as a percentage-weighted average.
- Calculates an overall weighted score.
- Excludes missing categories and renormalizes remaining weights.
- Refuses to publish a score if less than 60% of the category weight has data.
- Separates environmental score from condition/context-based recommendations.

## Requirements

Python 3.10+ recommended.

```bash
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install:
```bash
pip install -r requirements.txt
```

Run the example:
```bash
python main.py
```

Custom blend:
```bash
python main.py --composition polyester:65,cotton:35 --shopping
```

Second-hand suggestion:
```bash
python main.py --composition polyester:65,cotton:35 --shopping --second-hand-available
```

Repair an existing garment:
```bash
python main.py --composition cotton:100 --condition damaged
```

## Run tests

```bash
pip install pytest
python -m pytest -q
```

## Input format

Composition is a dictionary of material names and percentages. Percentages must total 100. Material names must match entries in the CSV.

## Dataset format

Each material row has one 0–100 impact value for each category:
`water, carbon, energy, chemicals, microfibres, waste`.

For missing information, leave the cell blank. The engine omits that category's unavailable material share when calculating the category blend and reports category-weight coverage. Review this assumption carefully: missing data is not treated as zero impact.

## Important limitations to document to the team

1. A single material score is not a complete garment LCA. Results depend on fibre production, yarn/fabric processing, dyeing, garment construction, transport, use/washing and end-of-life boundaries.
2. Do not compare scores across datasets unless functional units, geography, time period and lifecycle boundaries are compatible.
3. The blend calculation assumes linear impact by fibre mass share; real processes can be non-linear.
4. Category weights and classification thresholds are provisional governance choices and require team review.
5. Repair, Reuse and Second-hand require garment condition and shopping context; they cannot be reliably inferred from fibre composition alone.
6. The current engine is rule-based. It does not use machine learning or computer vision.
7. For a defensible release, add data source name, URL/DOI, geography, year, lifecycle boundary, functional unit and uncertainty for each material/category value.

## Example output

The command prints JSON containing:
- overall score and classification
- category-level scores
- data coverage
- composition
- assumptions
- recommendation and explanation

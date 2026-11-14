// src/data/sampleData.js
// Sample data and educational benchmarks for GreenWardrobe
// This file serves as the fallback/demo data provider when the backend API is offline.

/**
 * 5 Standard Circular Fashion Recommendations
 * Used to guide consumers on what action to take for a garment.
 */
export const RECOMMENDATIONS = [
  {
    id: "BUY",
    title: "BUY",
    tagline: "Eco-Friendly & Sustainable Choice",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    activeColor: "bg-emerald-600 text-white",
    description:
      "This garment has a minimal ecological footprint. Made from renewable, organic, or certified recycled fibers with non-toxic dyes and ethical production.",
    actionTips: [
      "Purchase with confidence if you plan to wear it at least 30+ times.",
      "Follow gentle wash instructions (cold wash) to prolong its lifespan.",
      "Support brands with transparent supply chain certifications (GOTS, Fair Trade)."
    ]
  },
  {
    id: "THINK TWICE",
    title: "THINK TWICE",
    tagline: "High Resource Toll or Synthetic Blend",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    activeColor: "bg-amber-500 text-white",
    description:
      "This garment has moderate-to-high environmental costs—such as high water usage, non-biodegradable synthetic fibers, or intensive chemical processing.",
    actionTips: [
      "Ask yourself: Will I wear this garment at least 30 times?",
      "Check if you already own a similar piece in your existing wardrobe.",
      "Consider renting or borrowing if it is for a one-time event."
    ]
  },
  {
    id: "REPAIR",
    title: "REPAIR",
    tagline: "Mend, Patch, and Restore",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    activeColor: "bg-blue-600 text-white",
    description:
      "Extending a garment's life by just 9 months reduces its carbon, water, and waste footprints by around 20-30%. Small repairs prevent garments from going to landfills.",
    actionTips: [
      "Sew loose buttons, fix broken zippers, or patch small tears with sashiko stitching.",
      "Visit a local tailor or cobbler rather than discarding the garment.",
      "Dye faded cotton items with natural indigo or fabric dye to restore vibrant color."
    ]
  },
  {
    id: "REUSE",
    title: "REUSE",
    tagline: "Upcycle & Repurpose Creatively",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    activeColor: "bg-purple-600 text-white",
    description:
      "If a garment cannot be worn as clothing anymore, upcycle its textile into new functional items to eliminate landfill waste.",
    actionTips: [
      "Cut worn-out cotton t-shirts into zero-waste cleaning rags or kitchen wipes.",
      "Convert old denim jeans into reusable tote bags, pot holders, or cushion covers.",
      "Swap gently worn pieces with friends through clothing swap parties."
    ]
  },
  {
    id: "SECOND-HAND",
    title: "SECOND-HAND",
    tagline: "Thrift, Donate, or Resell",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    activeColor: "bg-teal-600 text-white",
    description:
      "Buying or passing on second-hand clothing prevents the enormous carbon and water expenditure required to produce a brand-new garment from virgin raw materials.",
    actionTips: [
      "Explore local thrift stores or peer-to-peer resale apps (Depop, Vinted, Poshmark).",
      "Donate in-good-condition clothes to local shelters or registered charities.",
      "Opt for certified pre-owned garments instead of virgin synthetic fast-fashion."
    ]
  }
];

/**
 * Sample clothing presets for one-click testing in Demo Mode
 */
export const SAMPLE_GARMENTS = [
  {
    id: "garment-1",
    name: "Organic Cotton T-Shirt",
    category: "Topwear / T-Shirt",
    brand: "EcoThread Studio",
    estimatedWeight: "180 g",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    fabricComposition: [
      { material: "Organic Cotton", percentage: 95, type: "Natural / Renewable" },
      { material: "Elastane", percentage: 5, type: "Synthetic" }
    ],
    environmentalImpact: {
      score: 88, // out of 100
      grade: "A",
      ratingText: "Excellent - Low Environmental Footprint",
      waterConsumptionLiters: 420,
      carbonFootprintKg: 1.8,
      energyConsumptionKwh: 2.1,
      microplasticRisk: "Very Low",
      biodegradability: "95% Biodegradable",
      comparisonBenchmark: {
        waterSavedVsConventional: "79% less water than conventional cotton",
        carbonSavedVsSynthetic: "65% lower carbon footprint than polyester"
      }
    },
    recommendation: "BUY",
    recommendationReason:
      "High percentage of certified organic cotton grown without synthetic pesticides. Excellent lifespan and fully recyclable."
  },
  {
    id: "garment-2",
    name: "Fast-Fashion Polyester Hoodie",
    category: "Outerwear / Hoodie",
    brand: "TrendyFast Co.",
    estimatedWeight: "520 g",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    fabricComposition: [
      { material: "Virgin Polyester", percentage: 70, type: "Petroleum-Based Synthetic" },
      { material: "Conventional Cotton", percentage: 30, type: "High-Water Natural" }
    ],
    environmentalImpact: {
      score: 38, // out of 100
      grade: "D",
      ratingText: "High Impact - Significant Resource Toll",
      waterConsumptionLiters: 3200,
      carbonFootprintKg: 8.7,
      energyConsumptionKwh: 12.4,
      microplasticRisk: "High (sheds microfibers during machine washing)",
      biodegradability: "Non-Biodegradable (synthetic fibers persist 200+ years)",
      comparisonBenchmark: {
        waterSavedVsConventional: "High water usage due to non-organic cotton",
        carbonSavedVsSynthetic: "Produces 3x more CO2 than an organic wool or linen hoodie"
      }
    },
    recommendation: "THINK TWICE",
    recommendationReason:
      "Heavy reliance on virgin polyester (fossil fuel derivative) and non-sustainable cotton. Microfiber pollution risk during laundry cycles is severe."
  },
  {
    id: "garment-3",
    name: "Vintage Rigid Denim Jeans",
    category: "Bottomwear / Jeans",
    brand: "Heritage Denim Works",
    estimatedWeight: "650 g",
    imageUrl: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80",
    fabricComposition: [
      { material: "Heavyweight Cotton Denim", percentage: 100, type: "Natural Fiber" }
    ],
    environmentalImpact: {
      score: 72, // out of 100
      grade: "B",
      ratingText: "Good - Highly Durable & Mended easily",
      waterConsumptionLiters: 1800,
      carbonFootprintKg: 4.2,
      energyConsumptionKwh: 5.6,
      microplasticRisk: "None (zero plastic fibers)",
      biodegradability: "100% Biodegradable (untreated cotton)",
      comparisonBenchmark: {
        waterSavedVsConventional: "High initial production water, but offset by 10+ year lifespan",
        carbonSavedVsSynthetic: "No fossil fuel inputs; fully repairable"
      }
    },
    recommendation: "REPAIR",
    recommendationReason:
      "100% natural cotton denim has exceptional longevity. Patching tears or reinforcing pockets prolongs its usability for decades."
  },
  {
    id: "garment-4",
    name: "Pure Flax Linen Summer Shirt",
    category: "Topwear / Button-up",
    brand: "Nordic Loom",
    estimatedWeight: "210 g",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    fabricComposition: [
      { material: "Flax Linen", percentage: 100, type: "Rain-fed Natural Fiber" }
    ],
    environmentalImpact: {
      score: 94, // out of 100
      grade: "A+",
      ratingText: "Exceptional - Sustainable Gold Standard",
      waterConsumptionLiters: 190,
      carbonFootprintKg: 1.1,
      energyConsumptionKwh: 1.4,
      microplasticRisk: "Zero",
      biodegradability: "100% Biodegradable & Compostable",
      comparisonBenchmark: {
        waterSavedVsConventional: "Flax relies almost entirely on natural rainwater",
        carbonSavedVsSynthetic: "82% lower emissions than polyester or nylon shirts"
      }
    },
    recommendation: "BUY",
    recommendationReason:
      "Flax linen requires minimal irrigation, no harmful chemicals, and is one of the most eco-friendly textiles on the planet."
  }
];

/**
 * Global GreenWardrobe statistics for the dashboard
 */
export const DASHBOARD_STATS = [
  {
    id: "scanned",
    label: "Garments Analyzed",
    value: "1,428",
    change: "+18% this month",
    iconName: "Shirt"
  },
  {
    id: "avg-score",
    label: "Average Eco-Score",
    value: "74 / 100",
    change: "Tier B (Moderate)",
    iconName: "Activity"
  },
  {
    id: "water-saved",
    label: "Water Conserved",
    value: "142,500 L",
    change: "Equal to 950 baths",
    iconName: "Droplet"
  },
  {
    id: "carbon-offset",
    label: "Carbon Avoided",
    value: "3,890 kg",
    change: "18,400 km car drive offset",
    iconName: "Leaf"
  }
];

/**
 * Educational guide comparing common textile fibers
 */
export const FABRIC_GUIDE = [
  {
    name: "Flax Linen",
    ecoRating: "A+",
    waterImpact: "Very Low",
    carbonImpact: "Very Low",
    microplastics: "Zero",
    pros: "Grown with rainwater; naturally durable; compostable.",
    cons: "Prone to wrinkling; higher upfront price."
  },
  {
    name: "Organic Cotton",
    ecoRating: "A",
    waterImpact: "Moderate",
    carbonImpact: "Low",
    microplastics: "Zero",
    pros: "Zero toxic pesticides; healthy soil management; soft & breathable.",
    cons: "Still requires substantial agricultural water."
  },
  {
    name: "Recycled Polyester (rPET)",
    ecoRating: "B-",
    waterImpact: "Low",
    carbonImpact: "Moderate",
    microplastics: "High",
    pros: "Diverts PET bottles from oceans and landfills; strong fibers.",
    cons: "Still sheds microplastics during washing; difficult to recycle repeatedly."
  },
  {
    name: "Conventional Cotton",
    ecoRating: "C",
    waterImpact: "Extremely High",
    carbonImpact: "Moderate",
    microplastics: "Zero",
    pros: "Natural fiber, comfortable, widely available.",
    cons: "Requires ~2,700L water per t-shirt; heavy pesticide usage in non-organic farming."
  },
  {
    name: "Virgin Polyester / Nylon",
    ecoRating: "D",
    waterImpact: "Low",
    carbonImpact: "Extremely High",
    microplastics: "Severe",
    pros: "Cheap, wrinkle-resistant, quick-drying.",
    cons: "Derived from petroleum; non-biodegradable; major source of ocean microplastics."
  }
];

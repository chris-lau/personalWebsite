export interface AmazonCategoryFee {
  id: string;
  name: string;
  referralPercentage: number;
  minFee: number;
  notes?: string;
}

export type FbaSizeTier =
  | 'small_standard'
  | 'large_standard'
  | 'large_bulky'
  | 'extra_large';

export interface FbaTierConfig {
  id: FbaSizeTier;
  label: string;
  maxWeightLb: number;
  standardFee: number;
  lowPriceFee: number; // For items priced < $10
  description: string;
}

export interface NicheTrend {
  id: string;
  name: string;
  category: string;
  searchVolume: number;
  searchVolumeGrowthPct: number; // 90-day growth %
  avgPrice: number;
  avgCogs: number;
  avgWeightLb: number;
  fbaTier: FbaSizeTier;
  avgMonthlySales: number;
  // Based on top 10 sellers review counts; 'Unknown' when live review data
  // could not be parsed (scored neutrally, never as a low barrier).
  reviewBarrier: 'Low' | 'Medium' | 'High' | 'Unknown';
  avgTop10Reviews: number;
  topCompetitorRating: number;
  seasonality: 'Low' | 'Moderate' | 'High';
  // True when no honest demand-growth signal exists for this niche (live
  // listings without trend data) — UI hides the velocity claim instead of
  // fabricating one.
  growthUnknown?: boolean;
  painPoints: string[];
  differentiationAngle: string;
  tags: string[];
  suggestedPrompt: string;
}

export const AMAZON_CATEGORY_FEES: AmazonCategoryFee[] = [
  { id: 'home_kitchen', name: 'Home & Kitchen', referralPercentage: 15, minFee: 0.3 },
  { id: 'office_products', name: 'Office & Workstation Products', referralPercentage: 15, minFee: 0.3 },
  { id: 'pet_supplies', name: 'Pet Supplies', referralPercentage: 15, minFee: 0.3 },
  { id: 'sports_outdoors', name: 'Sports & Outdoors', referralPercentage: 15, minFee: 0.3 },
  { id: 'beauty_personal', name: 'Beauty & Personal Care', referralPercentage: 15, minFee: 0.3 },
  { id: 'electronics_acc', name: 'Electronics Accessories', referralPercentage: 15, minFee: 0.3 },
  { id: 'tools_home', name: 'Tools & Home Improvement', referralPercentage: 15, minFee: 0.3 },
  { id: 'toys_games', name: 'Toys & Games', referralPercentage: 15, minFee: 0.3 },
  { id: 'health_household', name: 'Health & Household', referralPercentage: 15, minFee: 0.3 },
];

export const FBA_TIERS: FbaTierConfig[] = [
  {
    id: 'small_standard',
    label: 'Small Standard (< 16 oz, max 15x12x0.75 in)',
    maxWeightLb: 1.0,
    standardFee: 3.22,
    lowPriceFee: 2.45,
    description: 'Lightweight flat or compact products (cables, small cosmetics, slim desk accessories)',
  },
  {
    id: 'large_standard',
    label: 'Large Standard (16 oz - 20 lbs, max 18x14x8 in)',
    maxWeightLb: 20.0,
    standardFee: 4.75,
    lowPriceFee: 3.15,
    description: 'Most common Amazon catalog products (desk pads, pet bowls, kitchen organizers, water bottles)',
  },
  {
    id: 'large_bulky',
    label: 'Large Bulky / Oversize (up to 50 lbs, max 59 in length)',
    maxWeightLb: 50.0,
    standardFee: 9.73,
    lowPriceFee: 7.5,
    description: 'Bulky items requiring special freight routing (ergonomic chairs, large cat trees, shelving units)',
  },
  {
    id: 'extra_large',
    label: 'Extra-Large (50+ lbs)',
    maxWeightLb: 150.0,
    standardFee: 26.33,
    lowPriceFee: 22.0,
    description: 'Heavy machinery, gym equipment, large furniture assemblies',
  },
];

export const SAMPLE_NICHE_TRENDS: NicheTrend[] = [
  {
    id: 'felt-desk-pads',
    name: 'Modular Merino Wool & Felt Desk Mats',
    category: 'office_products',
    searchVolume: 84500,
    searchVolumeGrowthPct: 142,
    avgPrice: 36.99,
    avgCogs: 5.8,
    avgWeightLb: 1.2,
    fbaTier: 'large_standard',
    avgMonthlySales: 1250,
    reviewBarrier: 'Low',
    avgTop10Reviews: 185,
    topCompetitorRating: 4.1,
    seasonality: 'Low',
    painPoints: [
      'Edges fray or curl after 2 weeks of mouse movement',
      'No non-slip rubber grip underneath causing slipping on hardwood desks',
      'Strong chemical off-gassing smell out of package',
    ],
    differentiationAngle: 'Stitched anti-fray edging + natural non-slip cork backing with magnetic cable routing channel.',
    tags: ['Workstation', 'Minimalist', 'WFH', 'High Velocity'],
    suggestedPrompt: `Generate high-converting Amazon bullet points for a Premium Merino Wool Desk Mat. Highlight our anti-fray reinforced edge stitching, 100% natural grip cork backing (zero smell), and integrated magnetic cable organizer. Focus on ergonomic comfort and desktop aesthetics.`,
  },
  {
    id: 'airtight-cold-brew',
    name: 'Borosilicate Cold Brew Coffee Maker with Dual-Mesh Filter',
    category: 'home_kitchen',
    searchVolume: 128000,
    searchVolumeGrowthPct: 88,
    avgPrice: 32.5,
    avgCogs: 6.2,
    avgWeightLb: 2.1,
    fbaTier: 'large_standard',
    avgMonthlySales: 2100,
    reviewBarrier: 'Medium',
    avgTop10Reviews: 620,
    topCompetitorRating: 4.3,
    seasonality: 'Moderate',
    painPoints: [
      'Fine coffee sediment leaks through standard mesh into the brew',
      'Glass carafe shatters easily when washing in standard sink',
      'Silicone seal degrades and leaks inside refrigerator doors',
    ],
    differentiationAngle: 'Ultra-fine 15-micron laser-cut stainless filter + shock-absorbing silicone base boot + leakproof twist lid.',
    tags: ['Coffee', 'Kitchen', 'Zero Sediment', 'Summer Surge'],
    suggestedPrompt: `Draft an Amazon listing package (Title, 5 Feature Bullets, and Backend Search Terms) for a 1.5L Borosilicate Cold Brew Pitcher. Emphasize zero-sludge 15-micron dual filtration, drop-resistant silicone boot, and fridge-door slim profile. Target specialty coffee enthusiasts.`,
  },
  {
    id: 'slow-feeder-ceramic',
    name: 'Orthopedic Elevated Ceramic Slow Feeder Pet Bowl',
    category: 'pet_supplies',
    searchVolume: 64200,
    searchVolumeGrowthPct: 215,
    avgPrice: 28.99,
    avgCogs: 4.9,
    avgWeightLb: 2.4,
    fbaTier: 'large_standard',
    avgMonthlySales: 940,
    reviewBarrier: 'Low',
    avgTop10Reviews: 120,
    topCompetitorRating: 4.0,
    seasonality: 'Low',
    painPoints: [
      'Plastic slow feeders trigger feline/canine chin acne and harbor bacteria',
      'Flat bowls cause neck strain and acid reflux in senior pets',
      'Maze grooves are too deep for pets to reach food, causing frustration',
    ],
    differentiationAngle: 'Heavy human-grade lead-free ceramic with 15-degree ergonomic tilt, shallow rounded ridges for easy tongue access & dishwasher-safe cleaning.',
    tags: ['Pet Health', 'Ceramic', 'Veterinarian Approved', 'Fast Growing'],
    suggestedPrompt: `Create an Amazon product listing for an Elevated Ceramic Pet Slow Feeder. Address common buyer anxieties around plastic acne and neck strain. Emphasize 15-degree orthopedic tilt, lead-free food-safe glaze, and veterinarian-recommended digestive benefits.`,
  },
  {
    id: 'magnetic-travel-chargers',
    name: '3-in-1 Foldable MagSafe Travel Charging Station',
    category: 'electronics_acc',
    searchVolume: 245000,
    searchVolumeGrowthPct: 165,
    avgPrice: 42.99,
    avgCogs: 9.1,
    avgWeightLb: 0.85,
    fbaTier: 'small_standard',
    avgMonthlySales: 3400,
    reviewBarrier: 'High',
    avgTop10Reviews: 1850,
    topCompetitorRating: 4.2,
    seasonality: 'Low',
    painPoints: [
      'Overheats phone and cuts charging speed after 20 minutes',
      'Weak magnet allows heavy phones to slide off in vertical mode',
      'Cheap plastic hinges crack after repeated folding in luggage',
    ],
    differentiationAngle: 'Aircraft-grade aluminum hinge + active thermo-dissipation chamber with 15W Qi2 certified fast charging.',
    tags: ['Electronics', 'Travel', 'MagSafe', 'High Volume'],
    suggestedPrompt: `Generate Amazon A+ content structure and listing bullets for a Qi2-Certified 3-in-1 Foldable Aluminum Travel Charger. Focus on safety certifications, zero-thermal throttling heat dissipation, and sturdy CNC metal hinge durability.`,
  },
  {
    id: 'travel-compression-cubes',
    name: 'Waterproof Ultralight Cordura Compression Packing Cubes',
    category: 'sports_outdoors',
    searchVolume: 175000,
    searchVolumeGrowthPct: 110,
    avgPrice: 34.99,
    avgCogs: 5.2,
    avgWeightLb: 0.95,
    fbaTier: 'small_standard',
    avgMonthlySales: 2800,
    reviewBarrier: 'Medium',
    avgTop10Reviews: 780,
    topCompetitorRating: 4.4,
    seasonality: 'Moderate',
    painPoints: [
      'Compression zippers snag and rip fragile ripstop nylon when full',
      'No transparency or labeling to know what is packed inside',
      'Not truly water-resistant against shampoo spills in luggage',
    ],
    differentiationAngle: 'Self-repairing YKK double zippers + tear-proof TPU clear view window + waterproof seam taped fabric.',
    tags: ['Luggage', 'Travel Gear', 'YKK Zippers', 'Best Seller Candidate'],
    suggestedPrompt: `Write 5 benefit-driven Amazon bullet points for a 6-Piece Double-Zipper Compression Cube Set. Highlight heavy-duty YKK compression zips that never snag, see-through identification windows, and 60% luggage volume savings.`,
  },
  {
    id: 'bamboo-drawer-dividers',
    name: 'Spring-Loaded Expandable Deep Bamboo Drawer Organizers',
    category: 'home_kitchen',
    searchVolume: 92000,
    searchVolumeGrowthPct: 75,
    avgPrice: 29.99,
    avgCogs: 4.5,
    avgWeightLb: 2.8,
    fbaTier: 'large_standard',
    avgMonthlySales: 1600,
    reviewBarrier: 'Low',
    avgTop10Reviews: 240,
    topCompetitorRating: 4.1,
    seasonality: 'Low',
    painPoints: [
      'Internal tension spring is too weak causing divider to slip out of place',
      'Foam pads on ends scratch painted drawer interiors',
      'Splinters and rough unpolished bamboo edges snag cloth napkins',
    ],
    differentiationAngle: 'Heavy-duty steel reinforced springs + non-marring silicone end pads + triple-sanded food-safe wax finish.',
    tags: ['Kitchen Organization', 'Eco Living', 'Bamboo', 'Low Competition'],
    suggestedPrompt: `Generate Amazon listing copy for a 4-Pack of Expandable Deep Bamboo Drawer Dividers. Emphasize scratch-free silicone grip ends, extra-strong internal springs that stay locked in place, and ultra-smooth splinter-free finish.`,
  },
];

/**
 * Calculates Opportunity Score (0 - 100) based on trend velocity,
 * review barrier, margin potential, and price sweet spot.
 */
export function calculateOpportunityScore(params: {
  searchVolumeGrowthPct: number;
  avgPrice: number;
  reviewBarrier: 'Low' | 'Medium' | 'High' | 'Unknown';
  estimatedMarginPct: number;
  searchVolume: number;
}): {
  score: number;
  rating: 'Exceptional' | 'Strong' | 'Moderate' | 'Challenging';
  breakdown: {
    demandScore: number;
    competitionScore: number;
    marginScore: number;
    pricePointScore: number;
  };
} {
  // 1. Demand & Velocity Score (max 30 pts)
  let demandScore = 15;
  if (params.searchVolumeGrowthPct > 150) demandScore += 15;
  else if (params.searchVolumeGrowthPct > 80) demandScore += 10;
  else if (params.searchVolumeGrowthPct > 30) demandScore += 5;

  if (params.searchVolume > 100000) demandScore = Math.min(30, demandScore + 5);

  // 2. Competition & Review Barrier Score (max 30 pts)
  // Unknown review data gets the neutral baseline — never the Low-barrier
  // bonus, which would inflate live listings whose reviews failed to parse.
  let competitionScore = 15;
  if (params.reviewBarrier === 'Low') competitionScore = 30;
  else if (params.reviewBarrier === 'Medium') competitionScore = 20;
  else if (params.reviewBarrier === 'High') competitionScore = 10;

  // 3. Margin Potential Score (max 25 pts)
  let marginScore = 10;
  if (params.estimatedMarginPct >= 35) marginScore = 25;
  else if (params.estimatedMarginPct >= 25) marginScore = 20;
  else if (params.estimatedMarginPct >= 15) marginScore = 12;
  else marginScore = 5;

  // 4. Price Point Sweet Spot ($25 - $75) (max 15 pts)
  let pricePointScore = 5;
  if (params.avgPrice >= 25 && params.avgPrice <= 65) {
    pricePointScore = 15; // Optimal sweet spot for Amazon impulse purchase & healthy margins
  } else if (params.avgPrice >= 18 && params.avgPrice <= 90) {
    pricePointScore = 10;
  }

  const rawScore = demandScore + competitionScore + marginScore + pricePointScore;
  const score = Math.max(10, Math.min(99, rawScore));

  let rating: 'Exceptional' | 'Strong' | 'Moderate' | 'Challenging' = 'Moderate';
  if (score >= 85) rating = 'Exceptional';
  else if (score >= 70) rating = 'Strong';
  else if (score >= 55) rating = 'Moderate';
  else rating = 'Challenging';

  return {
    score,
    rating,
    breakdown: {
      demandScore,
      competitionScore,
      marginScore,
      pricePointScore,
    },
  };
}

/**
 * Calculates comprehensive Amazon FBA / FBM unit economics, fees, and profit breakdown.
 */
export function calculateUnitEconomics(inputs: {
  salePrice: number;
  cogs: number;
  shippingToAmazonPerUnit: number;
  categoryId: string;
  fbaTier: FbaSizeTier;
  tacosPct: number; // Target Advertising Cost of Sales %
  returnRatePct?: number;
  fulfillmentType?: 'FBA' | 'FBM';
  customFbmShippingCost?: number;
}): {
  salePrice: number;
  referralFee: number;
  fbaFulfillmentFee: number;
  totalAmazonFees: number;
  landedCost: number; // COGS + Shipping
  adSpendPerUnit: number;
  returnsCostPerUnit: number;
  netProfit: number;
  netMarginPct: number;
  roiPct: number;
  breakevenLandedCost: number;
  breakevenSalePrice: number;
  isLowPriceFba: boolean;
} {
  const {
    salePrice,
    cogs,
    shippingToAmazonPerUnit,
    categoryId,
    fbaTier,
    tacosPct,
    returnRatePct = 2.5,
    fulfillmentType = 'FBA',
    customFbmShippingCost = 0,
  } = inputs;

  const category =
    AMAZON_CATEGORY_FEES.find((c) => c.id === categoryId) || AMAZON_CATEGORY_FEES[0];
  const tierConfig = FBA_TIERS.find((t) => t.id === fbaTier) || FBA_TIERS[1];

  // 1. Referral Fee Calculation (with minimum $0.30)
  let referralFee = (salePrice * category.referralPercentage) / 100;
  if (referralFee < category.minFee) {
    referralFee = category.minFee;
  }

  // 2. FBA vs FBM Fulfillment Fee
  const isLowPriceFba = salePrice < 10.0;
  let fbaFulfillmentFee = 0;

  if (fulfillmentType === 'FBA') {
    fbaFulfillmentFee = isLowPriceFba
      ? tierConfig.lowPriceFee
      : tierConfig.standardFee;
  } else {
    fbaFulfillmentFee = customFbmShippingCost;
  }

  const totalAmazonFees = referralFee + fbaFulfillmentFee;
  const landedCost = cogs + shippingToAmazonPerUnit;
  const adSpendPerUnit = (salePrice * tacosPct) / 100;
  const returnsCostPerUnit = (salePrice * (returnRatePct / 100)) * 0.4; // 40% loss on returned unit

  const totalCostPerUnit = landedCost + totalAmazonFees + adSpendPerUnit + returnsCostPerUnit;
  const netProfit = salePrice - totalCostPerUnit;
  const netMarginPct = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;
  const roiPct = landedCost > 0 ? (netProfit / landedCost) * 100 : 0;

  // Breakeven Landed Cost: Max manufacturing + freight cost allowable before profit hits $0
  const breakevenLandedCost = Math.max(
    0,
    salePrice - totalAmazonFees - adSpendPerUnit - returnsCostPerUnit
  );

  // Breakeven Sale Price
  const nonPriceDependentCosts = landedCost + fbaFulfillmentFee;
  const variableCostRate =
    category.referralPercentage / 100 +
    tacosPct / 100 +
    (returnRatePct / 100) * 0.4;
  const breakevenSalePrice =
    variableCostRate < 1
      ? nonPriceDependentCosts / (1 - variableCostRate)
      : nonPriceDependentCosts * 1.5;

  return {
    salePrice,
    referralFee: Number(referralFee.toFixed(2)),
    fbaFulfillmentFee: Number(fbaFulfillmentFee.toFixed(2)),
    totalAmazonFees: Number(totalAmazonFees.toFixed(2)),
    landedCost: Number(landedCost.toFixed(2)),
    adSpendPerUnit: Number(adSpendPerUnit.toFixed(2)),
    returnsCostPerUnit: Number(returnsCostPerUnit.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    netMarginPct: Number(netMarginPct.toFixed(1)),
    roiPct: Number(roiPct.toFixed(1)),
    breakevenLandedCost: Number(breakevenLandedCost.toFixed(2)),
    breakevenSalePrice: Number(breakevenSalePrice.toFixed(2)),
    isLowPriceFba,
  };
}

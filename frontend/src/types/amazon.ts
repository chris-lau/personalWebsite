export interface AmazonProductItem {
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  product_url: string;
  is_prime: boolean;
  category: string;
  fba_tier: 'small_standard' | 'large_standard' | 'large_bulky' | 'extra_large';
}

export interface AmazonSearchResponse {
  query: string;
  category: string;
  total_results: number;
  products: AmazonProductItem[];
  is_live: boolean;
  source: 'live_marketplace' | 'simulated_benchmark';
  cached: boolean;
  note: string;
}

export interface AmazonAsinDetail {
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviews_count: number;
  category: string;
  category_name: string;
  fba_tier: 'small_standard' | 'large_standard' | 'large_bulky' | 'extra_large';
  fba_tier_label: string;
  image_url: string;
  product_url: string;
  bullets: string[];
  weight_lb: number;
  estimated_cogs: number;
  is_live: boolean;
  source: 'live_marketplace' | 'simulated_benchmark';
}

export interface GoogleTrendPoint {
  date: string;
  value: number;
}

export interface AmazonTrendResponse {
  query: string;
  trend_points: GoogleTrendPoint[];
  /** Null when no honest demand-growth signal exists (autocomplete counts aren't one). */
  growth_velocity_pct: number | null;
  suggestions: string[];
  is_live: boolean;
  source: 'live_autocomplete' | 'simulated_benchmark';
}

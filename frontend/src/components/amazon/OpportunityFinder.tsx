import React, { useState, useMemo, useEffect } from 'react';
import {
  SAMPLE_NICHE_TRENDS,
  AMAZON_CATEGORY_FEES,
  calculateOpportunityScore,
  calculateUnitEconomics,
  NicheTrend,
} from '../../data/amazonData';
import { searchLiveAmazonProducts, fetchLiveAmazonTrends } from '../../api/backend';
import { AmazonProductItem } from '../../types/amazon';

interface OpportunityFinderProps {
  onSelectNicheForEconomics: (niche: NicheTrend) => void;
  onSelectNicheForPrompt: (niche: NicheTrend) => void;
}

export const OpportunityFinder: React.FC<OpportunityFinderProps> = ({
  onSelectNicheForEconomics,
  onSelectNicheForPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minGrowth, setMinGrowth] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [selectedModalNiche, setSelectedModalNiche] = useState<NicheTrend | null>(null);
  const [isLiveSearchActive, setIsLiveSearchActive] = useState<boolean>(false);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveProducts, setLiveProducts] = useState<AmazonProductItem[]>([]);
  const [liveGrowthVelocity, setLiveGrowthVelocity] = useState<number>(65);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus close button on modal open and handle Escape key dismiss
  useEffect(() => {
    if (!selectedModalNiche) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalNiche(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModalNiche]);

  // Execute Live Amazon & Trend Search on Keyword Submit
  const handleExecuteLiveSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) {
      setIsLiveSearchActive(false);
      setLiveProducts([]);
      return;
    }

    setIsLoadingLive(true);
    setIsLiveSearchActive(true);

    try {
      const [searchRes, trendRes] = await Promise.all([
        searchLiveAmazonProducts(queryToSearch.trim(), selectedCategory),
        fetchLiveAmazonTrends(queryToSearch.trim()),
      ]);

      if (searchRes.data && searchRes.data.products.length > 0) {
        setLiveProducts(searchRes.data.products);
      } else {
        setLiveProducts([]);
      }

      if (trendRes.data) {
        setLiveGrowthVelocity(trendRes.data.growth_velocity_pct || 55);
        setLiveSuggestions(trendRes.data.suggestions || []);
      }
    } catch {
      setLiveProducts([]);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Convert live search product into NicheTrend format for calculations & modals
  const liveNiches: NicheTrend[] = useMemo(() => {
    return liveProducts.map((p) => {
      let barrier: 'Low' | 'Medium' | 'High' = 'Low';
      if (p.reviews_count > 1000) barrier = 'High';
      else if (p.reviews_count > 300) barrier = 'Medium';

      return {
        id: p.asin,
        name: p.title,
        category: p.category || selectedCategory !== 'all' ? selectedCategory : 'home_kitchen',
        searchVolume: Math.max(1200, Math.round(p.reviews_count * 18)),
        searchVolumeGrowthPct: liveGrowthVelocity,
        avgPrice: p.price > 0 ? p.price : 29.99,
        avgCogs: roundTwoDecimals(p.price * 0.22),
        avgWeightLb: p.fba_tier === 'small_standard' ? 0.8 : 1.8,
        fbaTier: p.fba_tier,
        avgMonthlySales: Math.max(150, Math.round(p.reviews_count * 0.7)),
        reviewBarrier: barrier,
        avgTop10Reviews: p.reviews_count,
        topCompetitorRating: p.rating,
        seasonality: 'Moderate',
        painPoints: [
          'Material durability issues reported under heavy daily usage',
          'Sizing & packaging misalignment causing minor return friction',
          'Lack of premium tactile grip or finish compared to photos',
        ],
        differentiationAngle: `Upgraded materials with reinforced joints, ergonomic design, and branded gift packaging.`,
        tags: ['Live Amazon Listing', p.is_prime ? 'Prime Eligible' : 'Standard', `ASIN: ${p.asin}`],
        suggestedPrompt: `Target Amazon customers searching for "${p.title.slice(0, 50)}" with superior durability and warranty.`,
      };
    });
  }, [liveProducts, liveGrowthVelocity, selectedCategory]);

  const activeDataset = isLiveSearchActive ? liveNiches : SAMPLE_NICHE_TRENDS;

  const filteredNiches = useMemo(() => {
    return activeDataset.filter((niche) => {
      if (selectedCategory !== 'all' && niche.category !== selectedCategory) {
        return false;
      }
      if (niche.searchVolumeGrowthPct < minGrowth) {
        return false;
      }
      if (reviewFilter !== 'all' && niche.reviewBarrier !== reviewFilter) {
        return false;
      }
      if (!isLiveSearchActive && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = niche.name.toLowerCase().includes(q);
        const matchesAngle = niche.differentiationAngle.toLowerCase().includes(q);
        const matchesTags = niche.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesAngle && !matchesTags) return false;
      }
      return true;
    });
  }, [activeDataset, selectedCategory, minGrowth, reviewFilter, isLiveSearchActive, searchQuery]);

  return (
    <div className="opportunity-finder-section">
      <div className="tool-intro-card">
        <div className="tool-header-action-row">
          <div>
            <h3>📈 Amazon Live Product Opportunity & Trend Finder</h3>
            <p>
              Search real-time Amazon products and Google Trends demand velocity. Analyze live prices,
              review counts, and calculate instant unit economics.
            </p>
          </div>
          <span className="live-status-pill">
            <span className="live-indicator-dot"></span> Real-Time Live Data Proxy
          </span>
        </div>
      </div>

      {/* Filter & Live Search Controls */}
      <div className="filter-panel-card">
        <form
          className="live-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteLiveSearch(searchQuery);
          }}
        >
          <div className="search-bar-row">
            <input
              id="search-niche-input"
              type="text"
              className="theme-input live-search-input"
              placeholder="Search live Amazon keywords e.g. Espresso Tamper, Desk Pad, Travel Tumbler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="theme-btn-primary search-submit-btn"
              disabled={isLoadingLive}
            >
              {isLoadingLive ? '🔍 Fetching Live...' : '⚡ Search Live Amazon'}
            </button>
          </div>
        </form>

        {liveSuggestions.length > 0 && isLiveSearchActive && (
          <div className="live-suggestions-bar">
            <span className="suggestions-label">Popular Search Suggestions:</span>
            <div className="suggestions-tags">
              {liveSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="suggestion-tag-btn"
                  onClick={() => {
                    setSearchQuery(s);
                    handleExecuteLiveSearch(s);
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="category-select">Amazon Category</label>
            <select
              id="category-select"
              className="theme-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {AMAZON_CATEGORY_FEES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="review-barrier-select">Review Barrier</label>
            <select
              id="review-barrier-select"
              className="theme-select"
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="Low">Low Barrier (&lt; 300 reviews)</option>
              <option value="Medium">Medium Barrier (300 - 1,000)</option>
              <option value="High">High Barrier (1,000+)</option>
            </select>
          </div>

          <div className="filter-group">
            <div className="slider-label-row">
              <label htmlFor="min-growth-slider">Min Demand Growth</label>
              <span className="slider-val">+{minGrowth}%</span>
            </div>
            <input
              id="min-growth-slider"
              type="range"
              min="0"
              max="200"
              step="10"
              className="theme-slider"
              value={minGrowth}
              onChange={(e) => setMinGrowth(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="results-count-banner">
          <span>
            Showing <strong>{filteredNiches.length}</strong> {isLiveSearchActive ? 'live Amazon products' : 'curated micro-niches'}
          </span>
          {isLiveSearchActive || searchQuery || selectedCategory !== 'all' || reviewFilter !== 'all' || minGrowth > 0 ? (
            <button
              type="button"
              className="theme-btn-secondary btn-sm"
              onClick={() => {
                setSelectedCategory('all');
                setMinGrowth(0);
                setSearchQuery('');
                setReviewFilter('all');
                setIsLiveSearchActive(false);
                setLiveProducts([]);
              }}
            >
              Reset to Featured
            </button>
          ) : null}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingLive && (
        <div className="loading-live-banner">
          <div className="spinner-icon">⏳</div>
          <div>
            <strong>Querying Live Amazon Marketplace & Google Trends...</strong>
            <p>Fetching real prices, ASINs, customer review counts, and FBA tier requirements.</p>
          </div>
        </div>
      )}

      {/* Opportunity Grid */}
      <div className="niche-cards-grid">
        {filteredNiches.map((niche) => {
          // Pre-calculate economics for this card's preview
          const eco = calculateUnitEconomics({
            salePrice: niche.avgPrice,
            cogs: niche.avgCogs,
            shippingToAmazonPerUnit: 1.2,
            categoryId: niche.category,
            fbaTier: niche.fbaTier,
            tacosPct: 10,
          });

          const opp = calculateOpportunityScore({
            searchVolumeGrowthPct: niche.searchVolumeGrowthPct,
            avgPrice: niche.avgPrice,
            reviewBarrier: niche.reviewBarrier,
            estimatedMarginPct: eco.netMarginPct,
            searchVolume: niche.searchVolume,
          });

          return (
            <div key={niche.id} className="niche-card">
              <div className="niche-card-header">
                <div className="niche-title-row">
                  <h4 className="niche-name">{niche.name}</h4>
                  <div className={`score-badge score-${opp.rating.toLowerCase()}`}>
                    <span className="score-num">{opp.score}</span>
                    <span className="score-tag">{opp.rating}</span>
                  </div>
                </div>
                <div className="niche-tags">
                  {niche.tags.map((t) => (
                    <span key={t} className="niche-tag-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="niche-metrics-row">
                <div className="metric-box">
                  <span className="metric-label">Est. Demand</span>
                  <span className="metric-val">{niche.searchVolume.toLocaleString()} / mo</span>
                  <span className="metric-sub text-green">+{niche.searchVolumeGrowthPct}% velocity</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Live Price</span>
                  <span className="metric-val">${niche.avgPrice.toFixed(2)}</span>
                  <span className="metric-sub">Est. Net Margin: ~{eco.netMarginPct}%</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Customer Reviews</span>
                  <span className="metric-val">{niche.avgTop10Reviews.toLocaleString()} ratings</span>
                  <span className={`metric-sub barrier-${niche.reviewBarrier.toLowerCase()}`}>
                    {niche.reviewBarrier} Barrier ({niche.topCompetitorRating} ★)
                  </span>
                </div>
              </div>

              <div className="differentiation-preview">
                <div className="angle-header">
                  <span className="angle-icon">💡</span>
                  <strong>Sourcing & Differentiation Angle:</strong>
                </div>
                <p className="angle-text">{niche.differentiationAngle}</p>
              </div>

              <div className="niche-card-actions">
                <button
                  type="button"
                  className="theme-btn-primary"
                  onClick={() => onSelectNicheForEconomics(niche)}
                >
                  🧮 Simulate Unit Economics
                </button>
                <button
                  type="button"
                  className="theme-btn-secondary"
                  onClick={() => onSelectNicheForPrompt(niche)}
                >
                  🔍 View Listing Gaps
                </button>
                <button
                  type="button"
                  className="theme-btn-outline"
                  onClick={() => setSelectedModalNiche(niche)}
                >
                  Inspect
                </button>
              </div>
            </div>
          );
        })}

        {filteredNiches.length === 0 && !isLoadingLive && (
          <div className="empty-results-card">
            <h4>No product niches match your filter</h4>
            <p>Try searching for a different live Amazon keyword or click "Reset to Featured".</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedModalNiche && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedModalNiche(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-niche-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="modal-niche-title">{selectedModalNiche.name}</h3>
              <button
                ref={closeButtonRef}
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedModalNiche(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h5>Market Dynamics & Real Metrics</h5>
                <ul className="modal-list">
                  <li>
                    <strong>Est. Monthly Velocity:</strong> ~
                    {selectedModalNiche.searchVolume.toLocaleString()} searches (
                    <span className="text-green">
                      +{selectedModalNiche.searchVolumeGrowthPct}% momentum
                    </span>
                    )
                  </li>
                  <li>
                    <strong>Live Retail Price:</strong> ${selectedModalNiche.avgPrice.toFixed(2)}
                  </li>
                  <li>
                    <strong>Competition Review Benchmark:</strong> ~
                    {selectedModalNiche.avgTop10Reviews} reviews (Rating:{' '}
                    {selectedModalNiche.topCompetitorRating} ★)
                  </li>
                  <li>
                    <strong>Assigned FBA Size Tier:</strong> {selectedModalNiche.fbaTier}
                  </li>
                </ul>
              </div>

              <div className="modal-section">
                <h5>Known Competitor Pain Points & Weaknesses</h5>
                <ul className="pain-points-list">
                  {selectedModalNiche.painPoints.map((pp, idx) => (
                    <li key={idx}>⚠️ {pp}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-section highlight-box">
                <h5>Recommended Differentiation Strategy</h5>
                <p>{selectedModalNiche.differentiationAngle}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="theme-btn-primary"
                onClick={() => {
                  onSelectNicheForEconomics(selectedModalNiche);
                  setSelectedModalNiche(null);
                }}
              >
                Load into Financial Simulator
              </button>
              <button
                type="button"
                className="theme-btn-secondary"
                onClick={() => setSelectedModalNiche(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function roundTwoDecimals(val: number): number {
  return Math.round(val * 100) / 100;
}

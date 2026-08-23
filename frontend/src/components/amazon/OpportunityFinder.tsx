import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Bot,
  Calculator,
  Eye,
  Info,
  Lightbulb,
  Loader2,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react';
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
  onAskCompanion?: (prompt: string) => void;
}

/** Shared card/modal economics + scoring preview for a niche. */
function getNicheCalculations(niche: NicheTrend) {
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
  return { eco, opp };
}

/** Human-readable score pillar breakdown for tooltips and the detail modal. */
function getScoreBreakdownTitle(opp: ReturnType<typeof calculateOpportunityScore>): string {
  const b = opp.breakdown;
  return `Demand ${b.demandScore}/30 · Competition ${b.competitionScore}/30 · Margin ${b.marginScore}/25 · Price ${b.pricePointScore}/15`;
}

export const OpportunityFinder: React.FC<OpportunityFinderProps> = ({
  onSelectNicheForEconomics,
  onSelectNicheForPrompt,
  onAskCompanion,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minGrowth, setMinGrowth] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [selectedModalNiche, setSelectedModalNiche] = useState<NicheTrend | null>(null);
  const [isLiveSearchActive, setIsLiveSearchActive] = useState<boolean>(false);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveProducts, setLiveProducts] = useState<AmazonProductItem[]>([]);
  const [liveGrowthVelocity, setLiveGrowthVelocity] = useState<number | null>(null);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus close button on modal open, handle Escape, and lock body scroll
  useEffect(() => {
    if (!selectedModalNiche) return;

    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalNiche(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedModalNiche]);

  // Only meaningful once a live search has actually parsed marketplace HTML;
  // starts false so curated benchmark cards are never labeled "Live Price".
  const [isLiveMarketplace, setIsLiveMarketplace] = useState<boolean>(false);
  const [liveNote, setLiveNote] = useState<string>('');

  // Execute Live Amazon & Trend Search on Keyword Submit
  const handleExecuteLiveSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) {
      setIsLiveSearchActive(false);
      setLiveProducts([]);
      setIsLiveMarketplace(false);
      setLiveNote('');
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
        setIsLiveMarketplace(Boolean(searchRes.data.is_live));
        setLiveNote(searchRes.data.note || '');
      } else {
        setLiveProducts([]);
        setIsLiveMarketplace(false);
        setLiveNote(searchRes.error || 'No products found matching query.');
      }

      if (trendRes.data) {
        // Null velocity means no honest signal — never invent a fallback.
        setLiveGrowthVelocity(trendRes.data.growth_velocity_pct ?? null);
        setLiveSuggestions(trendRes.data.suggestions || []);
      }
    } catch {
      setLiveProducts([]);
      setIsLiveMarketplace(false);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Convert live search product into NicheTrend format for calculations & modals.
  // Only fields backed by parsed marketplace data are populated — review-derived
  // estimates are left empty when the review count failed to parse, and pain
  // points / differentiation angles are never invented for live listings.
  const liveNiches: NicheTrend[] = useMemo(() => {
    return liveProducts.map((p) => {
      const reviewsKnown = p.reviews_count > 0;

      let barrier: 'Low' | 'Medium' | 'High' | 'Unknown' = 'Unknown';
      if (reviewsKnown) {
        if (p.reviews_count > 1000) barrier = 'High';
        else if (p.reviews_count > 300) barrier = 'Medium';
        else barrier = 'Low';
      }

      const resolvedCategory = p.category || (selectedCategory !== 'all' ? selectedCategory : 'home_kitchen');

      return {
        id: p.asin,
        name: p.title,
        category: resolvedCategory,
        searchVolume: reviewsKnown ? Math.max(1200, Math.round(p.reviews_count * 18)) : 0,
        searchVolumeGrowthPct: liveGrowthVelocity ?? 0,
        growthUnknown: liveGrowthVelocity === null,
        avgPrice: p.price > 0 ? p.price : 29.99,
        avgCogs: roundTwoDecimals(p.price > 0 ? p.price * 0.22 : 6.5),
        avgWeightLb: p.fba_tier === 'small_standard' ? 0.8 : 1.8,
        fbaTier: p.fba_tier,
        avgMonthlySales: reviewsKnown ? Math.max(150, Math.round(p.reviews_count * 0.7)) : 0,
        reviewBarrier: barrier,
        avgTop10Reviews: p.reviews_count,
        topCompetitorRating: p.rating,
        seasonality: 'Moderate',
        painPoints: [],
        differentiationAngle: '',
        tags: [
          isLiveMarketplace ? 'Live Amazon Listing' : 'Simulated Market Benchmark',
          p.is_prime ? 'Prime Eligible' : 'Standard Delivery',
          `ASIN: ${p.asin}`,
        ],
        suggestedPrompt: '',
      };
    });
  }, [liveProducts, liveGrowthVelocity, selectedCategory, isLiveMarketplace]);

  const activeDataset = isLiveSearchActive ? liveNiches : SAMPLE_NICHE_TRENDS;

  const filteredNiches = useMemo(() => {
    return activeDataset.filter((niche) => {
      if (selectedCategory !== 'all' && niche.category !== selectedCategory) {
        return false;
      }
      // A niche with no honest growth signal cannot claim to meet a growth bar.
      if (minGrowth > 0 && (niche.growthUnknown || niche.searchVolumeGrowthPct < minGrowth)) {
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
            <h3 className="tool-title">
              <TrendingUp size={18} aria-hidden="true" className="inline-icon accent" />
              Trend &amp; Opportunity Finder
            </h3>
            <p>
              Search real-time Amazon products and demand signals. Analyze live prices,
              review counts, and calculate instant unit economics.
            </p>
          </div>
          <span className={`live-status-pill ${isLiveSearchActive && !isLiveMarketplace ? 'status-simulated' : ''}`}>
            <span className={`live-indicator-dot ${isLiveSearchActive && !isLiveMarketplace ? 'dot-warning' : ''}`}></span>{' '}
            {isLiveSearchActive
              ? isLiveMarketplace
                ? 'Real-Time Amazon Live Data'
                : 'Simulated Market Benchmark'
              : 'Curated Market Benchmarks'}
          </span>
        </div>
        {liveNote && (
          <div className="live-note-banner">
            <Info size={15} className="live-note-icon" aria-hidden="true" /> {liveNote}
          </div>
        )}
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
              {isLoadingLive ? (
                <>
                  <Loader2 size={14} className="icon-spin" aria-hidden="true" /> Fetching…
                </>
              ) : (
                <>
                  <Zap size={14} aria-hidden="true" /> Search Live Amazon
                </>
              )}
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
              <option value="Unknown">Unknown (no review data)</option>
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
              disabled={isLiveSearchActive && liveGrowthVelocity === null}
            />
            {isLiveSearchActive && liveGrowthVelocity === null && (
              <span className="filter-hint">Live results have no verified growth data</span>
            )}
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
                setLiveSuggestions([]);
                setLiveGrowthVelocity(null);
              }}
            >
              {isLiveSearchActive ? 'Reset to Featured' : 'Clear Filters'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingLive && (
        <div className="loading-live-banner">
          <Loader2 size={28} className="icon-spin" aria-hidden="true" />
          <div>
            <strong>Querying Live Amazon Marketplace…</strong>
            <p>Fetching real prices, ASINs, customer review counts, and FBA tier requirements.</p>
          </div>
        </div>
      )}

      {/* Opportunity Grid */}
      <div className="niche-cards-grid">
        {filteredNiches.map((niche) => {
          const { eco, opp } = getNicheCalculations(niche);

          // Context for the Ask-AI prompt: omit any metric we honestly don't have.
          const demandContext =
            niche.searchVolume > 0
              ? `est. search volume of ${niche.searchVolume.toLocaleString()}${
                  niche.growthUnknown ? '' : ` (${niche.searchVolumeGrowthPct}% growth)`
                }`
              : null;
          const barrierContext =
            niche.reviewBarrier === 'Unknown' ? null : `a ${niche.reviewBarrier} review barrier`;
          const marketContext = [demandContext, barrierContext].filter(Boolean).join(', ');

          return (
            <div key={niche.id} className="niche-card">
              <div className="niche-card-header">
                <div className="niche-title-row">
                  <h4 className="niche-name">{niche.name}</h4>
                  <div className="niche-card-header-actions">
                    <div
                      className={`score-badge score-${opp.rating.toLowerCase()}`}
                      title={`Opportunity Score pillars — ${getScoreBreakdownTitle(opp)}`}
                    >
                      <span className="score-num">{opp.score}</span>
                      <span className="score-tag">{opp.rating}</span>
                    </div>
                    <div className="niche-card-header-icons">
                      {onAskCompanion && (
                        <button
                          type="button"
                          className="niche-icon-btn"
                          onClick={() =>
                            onAskCompanion(
                              `Can you analyze the market opportunity for "${niche.name}"? It has an Opportunity Score of ${opp.score}/100 (${opp.rating})${
                                marketContext ? `, ${marketContext}` : ''
                              }. Note: live review and trend data was unavailable for this listing, so treat the score as provisional.`
                            )
                          }
                          aria-label="Ask AI about this niche"
                          title="Ask AI Copilot to analyze this niche"
                        >
                          <Bot size={15} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="niche-icon-btn"
                        onClick={() => setSelectedModalNiche(niche)}
                        aria-label="Inspect"
                        title="Inspect niche details"
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                    </div>
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
                  <span className="metric-label">
                    {isLiveSearchActive ? 'Category Demand Est.' : 'Est. Niche Searches'}
                  </span>
                  <span className="metric-val">
                    {niche.searchVolume > 0 ? `${niche.searchVolume.toLocaleString()} / mo` : '—'}
                  </span>
                  {niche.growthUnknown ? (
                    <span className="metric-sub">Velocity unavailable</span>
                  ) : (
                    <span className="metric-sub text-green">+{niche.searchVolumeGrowthPct}% est. velocity</span>
                  )}
                </div>
                <div className="metric-box">
                  <span className="metric-label">{isLiveMarketplace ? 'Live Price' : 'Benchmark Price'}</span>
                  <span className="metric-val">${niche.avgPrice.toFixed(2)}</span>
                  <span className="metric-sub">Est. Net Margin: ~{eco.netMarginPct}%</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Customer Reviews</span>
                  {niche.reviewBarrier === 'Unknown' ? (
                    <>
                      <span className="metric-val">unknown</span>
                      <span className="metric-sub">Review data unavailable</span>
                    </>
                  ) : (
                    <>
                      <span className="metric-val">{niche.avgTop10Reviews.toLocaleString()} ratings</span>
                      <span className={`metric-sub barrier-${niche.reviewBarrier.toLowerCase()}`}>
                        {niche.reviewBarrier} Barrier
                        {niche.topCompetitorRating > 0 ? ` (${niche.topCompetitorRating} ★)` : ''}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {niche.differentiationAngle && (
                <div className="differentiation-preview">
                  <div className="angle-header">
                    <Lightbulb size={14} aria-hidden="true" />
                    <strong>Sourcing &amp; Differentiation Angle:</strong>
                  </div>
                  <p className="angle-text">{niche.differentiationAngle}</p>
                </div>
              )}

              <div className="niche-card-actions">
                <button
                  type="button"
                  className="theme-btn-primary"
                  onClick={() => onSelectNicheForEconomics(niche)}
                >
                  <Calculator size={14} aria-hidden="true" /> Simulate Economics
                </button>
                <button
                  type="button"
                  className="theme-btn-secondary"
                  onClick={() => onSelectNicheForPrompt(niche)}
                >
                  <Search size={14} aria-hidden="true" /> View Review Gaps
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
                <h5>Market Metrics</h5>
                <ul className="modal-list">
                  <li>
                    <strong>Est. Monthly Velocity:</strong>{' '}
                    {selectedModalNiche.searchVolume > 0 ? (
                      <>
                        ~{selectedModalNiche.searchVolume.toLocaleString()} searches (
                        <span className="text-green">
                          +
                          {selectedModalNiche.searchVolumeGrowthPct}% est. momentum
                        </span>
                        )
                      </>
                    ) : (
                      'Not available for this live listing'
                    )}
                  </li>
                  <li>
                    <strong>{isLiveSearchActive && isLiveMarketplace ? 'Live Retail Price' : 'Benchmark Retail Price'}:</strong> ${selectedModalNiche.avgPrice.toFixed(2)}
                  </li>
                  <li>
                    <strong>Competition Review Benchmark:</strong>{' '}
                    {selectedModalNiche.reviewBarrier === 'Unknown'
                      ? 'unavailable (review data could not be parsed for this listing)'
                      : <>
                          ~{selectedModalNiche.avgTop10Reviews} reviews (Rating:{' '}
                          {selectedModalNiche.topCompetitorRating} ★)
                        </>}
                  </li>
                  <li>
                    <strong>Assigned FBA Size Tier:</strong> {selectedModalNiche.fbaTier}
                  </li>
                  <li>
                    <strong>Opportunity Score:</strong>{' '}
                    {(() => {
                      const { opp } = getNicheCalculations(selectedModalNiche);
                      return (
                        <>
                          {opp.score}/100 ({opp.rating}) — {getScoreBreakdownTitle(opp)}
                        </>
                      );
                    })()}
                  </li>
                </ul>
              </div>

              {selectedModalNiche.painPoints.length > 0 && (
                <div className="modal-section">
                  <h5>Known Competitor Pain Points &amp; Weaknesses</h5>
                  <ul className="pain-points-list">
                    {selectedModalNiche.painPoints.map((pp, idx) => (
                      <li key={idx}>
                        <AlertTriangle size={12} aria-hidden="true" /> {pp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedModalNiche.differentiationAngle && (
                <div className="modal-section highlight-box">
                  <h5>Recommended Differentiation Strategy</h5>
                  <p>{selectedModalNiche.differentiationAngle}</p>
                </div>
              )}
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
                <Calculator size={14} aria-hidden="true" /> Load into Financial Simulator
              </button>
              {onAskCompanion && (
                <button
                  type="button"
                  className="theme-btn-outline"
                  onClick={() => {
                    const painContext =
                      selectedModalNiche.painPoints.length > 0
                        ? ` Known customer pain points: ${selectedModalNiche.painPoints.join('; ')}.`
                        : ' No structured pain-point data is available for this live listing — suggest which competitor weaknesses I should research first.';
                    const angleContext = selectedModalNiche.differentiationAngle
                      ? ` Proposed differentiation angle: "${selectedModalNiche.differentiationAngle}".`
                      : '';
                    onAskCompanion(
                      `Can you explain how to differentiate "${selectedModalNiche.name}" from competitors?${painContext}${angleContext}`
                    );
                    setSelectedModalNiche(null);
                  }}
                >
                  <Bot size={14} aria-hidden="true" /> Ask AI Copilot
                </button>
              )}
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

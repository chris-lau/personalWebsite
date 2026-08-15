import React, { useState, useMemo } from 'react';
import {
  SAMPLE_NICHE_TRENDS,
  AMAZON_CATEGORY_FEES,
  calculateOpportunityScore,
  calculateUnitEconomics,
  NicheTrend,
} from '../../data/amazonData';

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
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus close button on modal open and handle Escape key dismiss
  React.useEffect(() => {
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

  const filteredNiches = useMemo(() => {
    return SAMPLE_NICHE_TRENDS.filter((niche) => {
      if (selectedCategory !== 'all' && niche.category !== selectedCategory) {
        return false;
      }
      if (niche.searchVolumeGrowthPct < minGrowth) {
        return false;
      }
      if (reviewFilter !== 'all' && niche.reviewBarrier !== reviewFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = niche.name.toLowerCase().includes(q);
        const matchesAngle = niche.differentiationAngle.toLowerCase().includes(q);
        const matchesTags = niche.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesAngle && !matchesTags) return false;
      }
      return true;
    });
  }, [selectedCategory, minGrowth, reviewFilter, searchQuery]);

  return (
    <div className="opportunity-finder-section">
      <div className="tool-intro-card">
        <h3>📈 Amazon Product Opportunity & Trend Finder</h3>
        <p>
          Discover curated micro-niches showing surging 90-day search demand, favorable review
          barriers, and strong profit margins. Click <strong>Simulate Unit Economics</strong> on any
          card to test its financial model.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="filter-panel-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="search-niche-input">Search Keywords or Niches</label>
            <input
              id="search-niche-input"
              type="text"
              className="theme-input"
              placeholder="e.g. Desk, Coffee, Ceramic, Travel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
              <label htmlFor="min-growth-slider">Min 90-Day Growth</label>
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
            Showing <strong>{filteredNiches.length}</strong> of {SAMPLE_NICHE_TRENDS.length} trending
            niches
          </span>
          {searchQuery || selectedCategory !== 'all' || reviewFilter !== 'all' || minGrowth > 0 ? (
            <button
              type="button"
              className="theme-btn-secondary btn-sm"
              onClick={() => {
                setSelectedCategory('all');
                setMinGrowth(0);
                setSearchQuery('');
                setReviewFilter('all');
              }}
            >
              Reset Filters
            </button>
          ) : null}
        </div>
      </div>

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
                  <span className="metric-label">Monthly Demand</span>
                  <span className="metric-val">{niche.searchVolume.toLocaleString()} searches</span>
                  <span className="metric-sub text-green">+{niche.searchVolumeGrowthPct}% (90d)</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Avg Selling Price</span>
                  <span className="metric-val">${niche.avgPrice.toFixed(2)}</span>
                  <span className="metric-sub">Est. Net Margin: ~{eco.netMarginPct}%</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Top 10 Reviews</span>
                  <span className="metric-val">~{niche.avgTop10Reviews} reviews</span>
                  <span className={`metric-sub barrier-${niche.reviewBarrier.toLowerCase()}`}>
                    {niche.reviewBarrier} Barrier
                  </span>
                </div>
              </div>

              <div className="differentiation-preview">
                <div className="angle-header">
                  <span className="angle-icon">💡</span>
                  <strong>Winning Angle:</strong>
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

        {filteredNiches.length === 0 && (
          <div className="empty-results-card">
            <h4>No product niches match your filter</h4>
            <p>Try resetting the growth slider or clearing the keyword search.</p>
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
                <h5>Market Dynamics</h5>
                <ul className="modal-list">
                  <li>
                    <strong>Est. Search Volume:</strong>{' '}
                    {selectedModalNiche.searchVolume.toLocaleString()} / mo (
                    <span className="text-green">
                      +{selectedModalNiche.searchVolumeGrowthPct}% 90-day surge
                    </span>
                    )
                  </li>
                  <li>
                    <strong>Est. Monthly Velocity:</strong> ~
                    {selectedModalNiche.avgMonthlySales.toLocaleString()} units / mo
                  </li>
                  <li>
                    <strong>Competition Review Benchmark:</strong> ~
                    {selectedModalNiche.avgTop10Reviews} reviews (Rating:{' '}
                    {selectedModalNiche.topCompetitorRating} ★)
                  </li>
                  <li>
                    <strong>Seasonality:</strong> {selectedModalNiche.seasonality} Seasonality Risk
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

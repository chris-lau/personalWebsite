import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, Calculator, Search, Bookmark } from 'lucide-react';
import { OpportunityFinder } from '../components/amazon/OpportunityFinder';
import { UnitEconomicsCalculator } from '../components/amazon/UnitEconomicsCalculator';
import { ReviewGapScanner } from '../components/amazon/ReviewGapScanner';
import { NicheTrend } from '../data/amazonData';
import './AmazonToolsPage.css';

type ActiveTab = 'trends' | 'calculator' | 'review_gap';

export const AmazonToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('trends');
  const [selectedNiche, setSelectedNiche] = useState<NicheTrend | null>(null);

  const handleSelectNicheForEconomics = (niche: NicheTrend) => {
    setSelectedNiche(niche);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNicheForPrompt = (niche: NicheTrend) => {
    setSelectedNiche(niche);
    setActiveTab('review_gap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container amazon-tools-page">
      <header className="page-header">
        <h1 className="page-title">
          <ShoppingBag size={28} aria-hidden="true" style={{ color: 'var(--accent-primary)' }} />
          <span>Amazon Seller Trend & Opportunity Suite</span>
        </h1>
        <p className="page-description">
          An interactive intelligence toolkit for Amazon private label sellers and brand builders.
          Discover high-velocity product niches, model accurate 2026 FBA unit economics, and exploit
          competitor review weaknesses.
        </p>
      </header>

      {/* Cross-Tool State Banner if a niche was selected from Opportunity Finder */}
      {selectedNiche && activeTab !== 'trends' && (
        <div className="active-niche-banner">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bookmark size={16} aria-hidden="true" style={{ color: 'var(--accent-primary)' }} />
            <span>
              Loaded Active Niche: <strong>{selectedNiche.name}</strong> (Category:{' '}
              {selectedNiche.category}, Avg Price: ${selectedNiche.avgPrice.toFixed(2)})
            </span>
          </span>
          <button
            type="button"
            className="banner-reset-btn"
            onClick={() => setSelectedNiche(null)}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Top Tab Switcher */}
      <nav className="amazon-tabs-bar" aria-label="Amazon Tools Navigation">
        <button
          type="button"
          className={`amazon-tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={16} aria-hidden="true" />
          <span>Product Trend & Opportunity Finder</span>
        </button>
        <button
          type="button"
          className={`amazon-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <Calculator size={16} aria-hidden="true" />
          <span>Unit Economics & Profit Simulator</span>
        </button>
        <button
          type="button"
          className={`amazon-tab-btn ${activeTab === 'review_gap' ? 'active' : ''}`}
          onClick={() => setActiveTab('review_gap')}
        >
          <Search size={16} aria-hidden="true" />
          <span>Review Gap & Listing Prompt Scanner</span>
        </button>
      </nav>

      {/* Active Tab Panel Rendering */}
      <main className="amazon-tool-canvas">
        {activeTab === 'trends' && (
          <OpportunityFinder
            onSelectNicheForEconomics={handleSelectNicheForEconomics}
            onSelectNicheForPrompt={handleSelectNicheForPrompt}
          />
        )}

        {activeTab === 'calculator' && (
          <UnitEconomicsCalculator initialNiche={selectedNiche} />
        )}

        {activeTab === 'review_gap' && (
          <ReviewGapScanner initialNiche={selectedNiche} />
        )}
      </main>
    </div>
  );
};

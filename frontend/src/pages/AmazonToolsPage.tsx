import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Calculator, Search, Bot, Bookmark, X } from 'lucide-react';
import { OpportunityFinder } from '../components/amazon/OpportunityFinder';
import { UnitEconomicsCalculator } from '../components/amazon/UnitEconomicsCalculator';
import { ReviewGapScanner } from '../components/amazon/ReviewGapScanner';
import { ChatPanel } from '../components/chat/ChatPanel';
import { BoxContainer } from '../components/ui/BoxContainer';
import { useChat } from '../hooks/useChat';
import {
  AMAZON_TRENDS_STARTERS,
  AMAZON_CALCULATOR_STARTERS,
  AMAZON_REVIEW_GAP_STARTERS,
} from '../components/chat/starters';
import { NicheTrend } from '../data/amazonData';
import './AmazonToolsPage.css';

type ActiveTab = 'trends' | 'calculator' | 'review_gap';

const COMPANION_STORAGE_KEY = 'amazon_companion_mode';

export const AmazonToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('trends');
  const [selectedNiche, setSelectedNiche] = useState<NicheTrend | null>(null);

  // Companion mode state with persistent local storage
  const [companionMode, setCompanionMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(COMPANION_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMPANION_STORAGE_KEY, String(companionMode));
    } catch {
      // Private browsing — silently ignore
    }
  }, [companionMode]);

  const companionInputRef = useRef<HTMLInputElement>(null);
  const companionAsideRef = useRef<HTMLElement>(null);
  const chat = useChat();

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

  const handleAskCompanion = async (prompt: string) => {
    if (!companionMode) {
      setCompanionMode(true);
    }
    // Scroll companion into view on mobile screens
    if (window.innerWidth < 1024 && companionAsideRef.current) {
      setTimeout(() => {
        companionAsideRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setTimeout(() => {
      companionInputRef.current?.focus();
    }, 150);
    await chat.sendMessage(prompt);
  };

  const handleToggleCompanion = () => {
    setCompanionMode((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          companionInputRef.current?.focus();
        }, 100);
      }
      return next;
    });
  };

  // Tab-aware context and starters
  const { tabTitle, currentStarters, currentGreeting } = useMemo(() => {
    switch (activeTab) {
      case 'trends':
        return {
          tabTitle: 'Trend & Opportunity Finder',
          currentStarters: AMAZON_TRENDS_STARTERS,
          currentGreeting:
            'Ask me anything about product trend momentum, 0-100 Opportunity Scoring, and competitor review barriers.',
        };
      case 'calculator':
        return {
          tabTitle: 'Unit Economics Simulator',
          currentStarters: AMAZON_CALCULATOR_STARTERS,
          currentGreeting:
            'Ask me anything about 2026 Amazon FBA fees, Low-Price FBA (<$10), TACoS advertising spend, and breakeven landed costs.',
        };
      case 'review_gap':
        return {
          tabTitle: 'Review Gap Scanner',
          currentStarters: AMAZON_REVIEW_GAP_STARTERS,
          currentGreeting:
            'Ask me anything about turning competitor 1-star complaints into winning product features and crafting high-converting listing prompts.',
        };
    }
  }, [activeTab]);

  return (
    <div className="page-container amazon-tools-page">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <ShoppingBag size={28} aria-hidden="true" className="inline-icon accent" />
              <span>Amazon Seller Trend &amp; Opportunity Suite</span>
            </h1>
            <p className="page-description">
              <strong>Live product demo:</strong> an opportunity-scoring suite I designed and built end-to-end.
              An interactive intelligence toolkit for Amazon private label sellers and brand builders.
              Discover high-velocity product niches, model accurate 2026 FBA unit economics, and exploit
              competitor review weaknesses.
            </p>
          </div>
          <button
            type="button"
            className={`companion-mode-toggle-btn ${companionMode ? 'active' : ''}`}
            onClick={handleToggleCompanion}
            aria-pressed={companionMode}
            aria-label={companionMode ? 'Disable AI Companion Mode' : 'Enable AI Companion Mode'}
          >
            <Bot size={16} aria-hidden="true" />
            <span>AI Companion Mode</span>
            <span className="companion-toggle-pill">{companionMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Cross-Tool State Banner if a niche was selected from Opportunity Finder */}
      {selectedNiche && activeTab !== 'trends' && (
        <div className="active-niche-banner">
          <span className="inline-icon-label">
            <Bookmark size={16} aria-hidden="true" className="inline-icon accent" />
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
          <span>Product Trend &amp; Opportunity Finder</span>
        </button>
        <button
          type="button"
          className={`amazon-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <Calculator size={16} aria-hidden="true" />
          <span>Unit Economics &amp; Profit Simulator</span>
        </button>
        <button
          type="button"
          className={`amazon-tab-btn ${activeTab === 'review_gap' ? 'active' : ''}`}
          onClick={() => setActiveTab('review_gap')}
        >
          <Search size={16} aria-hidden="true" />
          <span>Review Gap &amp; Listing Prompt Scanner</span>
        </button>
      </nav>

      {/* Main Suite Canvas + Companion Side-by-Side Grid */}
      <div className={`amazon-suite-layout ${companionMode ? 'amazon-suite-layout--split' : ''}`}>
        <main className="amazon-tool-canvas">
          {activeTab === 'trends' && (
            <OpportunityFinder
              onSelectNicheForEconomics={handleSelectNicheForEconomics}
              onSelectNicheForPrompt={handleSelectNicheForPrompt}
              onAskCompanion={handleAskCompanion}
            />
          )}

          {activeTab === 'calculator' && (
            <UnitEconomicsCalculator
              initialNiche={selectedNiche}
              onAskCompanion={handleAskCompanion}
            />
          )}

          {activeTab === 'review_gap' && (
            <ReviewGapScanner
              initialNiche={selectedNiche}
              onAskCompanion={handleAskCompanion}
            />
          )}
        </main>

        {companionMode && (
          <aside
            ref={companionAsideRef}
            className="amazon-companion-aside"
            aria-label="Amazon AI Companion Panel"
          >
            <BoxContainer title="AMAZON AI COPILOT">
              <div className="companion-header-meta">
                <div className="companion-grounding-status">
                  <span className="grounding-dot" aria-hidden="true" />
                  <span>2026 FBA &amp; Private Label Intelligence</span>
                </div>
                <div className="companion-context-badge">
                  <span>Context: {tabTitle}</span>
                </div>
              </div>

              <ChatPanel
                chat={chat}
                className="chat-panel--embedded chat-panel--amazon-companion"
                starterQuestions={currentStarters}
                greeting={currentGreeting}
                inputRef={companionInputRef}
                headerActions={
                  <button
                    type="button"
                    className="chat-panel__icon-btn"
                    onClick={() => setCompanionMode(false)}
                    aria-label="Hide companion panel"
                    title="Hide AI Companion"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                }
              />
            </BoxContainer>
          </aside>
        )}
      </div>
    </div>
  );
};

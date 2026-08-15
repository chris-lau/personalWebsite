import React, { useState } from 'react';
import { SAMPLE_NICHE_TRENDS, AMAZON_CATEGORY_FEES, NicheTrend } from '../../data/amazonData';

interface ReviewGapScannerProps {
  initialNiche?: NicheTrend | null;
}

export const ReviewGapScanner: React.FC<ReviewGapScannerProps> = ({ initialNiche }) => {
  const [selectedNicheId, setSelectedNicheId] = useState<string>(
    initialNiche ? initialNiche.id : SAMPLE_NICHE_TRENDS[0].id
  );
  const [customFeedbackText, setCustomFeedbackText] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Sync if selected from outside
  React.useEffect(() => {
    if (initialNiche) {
      setSelectedNicheId(initialNiche.id);
    }
  }, [initialNiche]);

  const activeNiche =
    SAMPLE_NICHE_TRENDS.find((n) => n.id === selectedNicheId) || SAMPLE_NICHE_TRENDS[0];

  const categoryName =
    AMAZON_CATEGORY_FEES.find((c) => c.id === activeNiche.category)?.name ||
    activeNiche.category;

  const generatedPrompt = `Act as an expert Amazon FBA Brand Strategist and Product Designer.

Product Concept: ${activeNiche.name}
Category: ${categoryName}

Top Identified Competitor Weaknesses & Customer Pain Points:
${activeNiche.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Our Key Product Differentiation Angle:
"${activeNiche.differentiationAngle}"

${
  customFeedbackText.trim()
    ? `Additional Sourcing Requirements:
"${customFeedbackText.trim()}"\n`
    : ''
}
Please generate:
1. High-Converting Amazon Listing Title (incorporating main search keywords within 180 chars).
2. 5 Compelling Benefit-Driven Bullet Points that directly overcome the customer pain points above.
3. 3 Strategic A+ Content Brand Story & Feature Modules to highlight product superiority.
4. Suggested 5 Target Search Terms (backend keywords, no punctuation, max 249 bytes).`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="review-gap-section">
      <div className="tool-intro-card">
        <h3>🔍 Competitor Review & Listing Gap Scanner</h3>
        <p>
          Analyze top 1-star & 2-star review complaint patterns across competitor listings to discover
          engineered product improvements. Generate optimized AI prompts for listing creation.
        </p>
      </div>

      <div className="review-gap-layout">
        {/* Niche Selector & Pain Point Breakdown */}
        <div className="gap-analysis-card">
          <div className="input-field">
            <label htmlFor="niche-gap-select">Select Product Micro-Niche to Inspect</label>
            <select
              id="niche-gap-select"
              className="theme-select"
              value={selectedNicheId}
              onChange={(e) => setSelectedNicheId(e.target.value)}
            >
              {SAMPLE_NICHE_TRENDS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pain-points-breakdown">
            <h4 className="panel-subhead">🚨 Recurring Competitor Flaws & Customer Frustrations</h4>
            <div className="pain-points-grid">
              {activeNiche.painPoints.map((point, idx) => (
                <div key={idx} className="pain-point-item">
                  <span className="pain-badge">Issue #{idx + 1}</span>
                  <p className="pain-text">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="differentiation-solution-card">
            <div className="solution-header">
              <span className="star-icon">✨</span>
              <strong>Recommended Engineering & Differentiation Fix:</strong>
            </div>
            <p className="solution-body">{activeNiche.differentiationAngle}</p>
          </div>

          <div className="custom-input-group">
            <label htmlFor="custom-notes-input">
              Add Custom Sourcing Specs / Notes (Optional)
            </label>
            <textarea
              id="custom-notes-input"
              rows={3}
              className="theme-textarea"
              placeholder="e.g. Must support 220V, include travel pouch, eco-friendly kraft packaging..."
              value={customFeedbackText}
              onChange={(e) => setCustomFeedbackText(e.target.value)}
            />
          </div>
        </div>

        {/* AI Listing Prompt Generator */}
        <div className="ai-prompt-generator-card">
          <div className="generator-header">
            <div>
              <h4 className="panel-subhead">🤖 AI Product Differentiation & Listing Prompt</h4>
              <p className="subtext">
                Ready-to-use prompt configured to highlight pain-point solutions in ChatGPT, Claude,
                or Gemini.
              </p>
            </div>
            <button
              type="button"
              className="theme-btn-primary btn-sm"
              onClick={handleCopyPrompt}
            >
              {copiedPrompt ? '✓ Copied to Clipboard!' : '📋 Copy AI Prompt'}
            </button>
          </div>

          <div className="prompt-display-terminal">
            <pre className="prompt-pre-block">
              <code>{generatedPrompt}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

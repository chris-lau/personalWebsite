import React, { useState } from 'react';
import { AlertTriangle, Bot, Copy, Search, Sparkles } from 'lucide-react';
import { SAMPLE_NICHE_TRENDS, AMAZON_CATEGORY_FEES, NicheTrend } from '../../data/amazonData';

interface ReviewGapScannerProps {
  initialNiche?: NicheTrend | null;
  onAskCompanion?: (prompt: string) => void;
}

export const ReviewGapScanner: React.FC<ReviewGapScannerProps> = ({ initialNiche, onAskCompanion }) => {
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

  // A live listing (ASIN id) is never in the curated dataset — use it directly
  // instead of silently falling back to an unrelated curated niche.
  const isCuratedInitial = initialNiche
    ? SAMPLE_NICHE_TRENDS.some((n) => n.id === initialNiche.id)
    : false;

  const activeNiche =
    SAMPLE_NICHE_TRENDS.find((n) => n.id === selectedNicheId) ||
    initialNiche ||
    SAMPLE_NICHE_TRENDS[0];

  const categoryName =
    AMAZON_CATEGORY_FEES.find((c) => c.id === activeNiche.category)?.name ||
    activeNiche.category;

  const painPointsSection = activeNiche.painPoints.length
    ? `Top Identified Competitor Weaknesses & Customer Pain Points:
${activeNiche.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : `Top Identified Competitor Weaknesses & Customer Pain Points:
(None recorded for this live listing. Infer the most likely customer frustrations for this product type and clearly label them as hypotheses to validate against real reviews.)`;

  const differentiationSection = activeNiche.differentiationAngle
    ? `Our Key Product Differentiation Angle:
"${activeNiche.differentiationAngle}"`
    : `Our Key Product Differentiation Angle:
(Not yet defined. Propose the strongest differentiation angle based on the product concept and category.)`;

  const generatedPrompt = `Act as an expert Amazon FBA Brand Strategist and Product Designer.

Product Concept: ${activeNiche.name}
Category: ${categoryName}

${painPointsSection}

${differentiationSection}

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
        <h3 className="tool-title">
          <Search size={18} aria-hidden="true" className="inline-icon accent" />
          Review Gap Scanner
        </h3>
        <p>
          Analyze top 1-star &amp; 2-star review complaint patterns across competitor listings to discover
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
              {!isCuratedInitial && initialNiche && (
                <option value={initialNiche.id}>
                  Live listing: {initialNiche.name.slice(0, 60)}
                  {initialNiche.name.length > 60 ? '…' : ''}
                </option>
              )}
              {SAMPLE_NICHE_TRENDS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pain-points-breakdown">
            <h4 className="panel-subhead">
              <AlertTriangle size={15} aria-hidden="true" className="inline-icon accent" />{' '}
              Recurring Competitor Flaws &amp; Customer Frustrations
            </h4>
            {activeNiche.painPoints.length > 0 ? (
              <div className="pain-points-grid">
                {activeNiche.painPoints.map((point, idx) => (
                  <div key={idx} className="pain-point-item">
                    <span className="pain-badge">Issue #{idx + 1}</span>
                    <p className="pain-text">{point}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pain-points-empty-note">
                No competitor pain-point data is available for live listings yet. Use the notes
                field below to add issues you've observed — the generated prompt will ask the AI
                to propose and clearly label hypotheses you should validate against real reviews.
              </p>
            )}
          </div>

          {activeNiche.differentiationAngle && (
            <div className="differentiation-solution-card">
              <div className="solution-header">
                <Sparkles size={14} aria-hidden="true" />
                <strong>Recommended Engineering &amp; Differentiation Fix:</strong>
              </div>
              <p className="solution-body">{activeNiche.differentiationAngle}</p>
            </div>
          )}

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
              <h4 className="panel-subhead">
                <Bot size={15} aria-hidden="true" className="inline-icon accent" />{' '}
                AI Product Differentiation &amp; Listing Prompt
              </h4>
              <p className="subtext">
                Ready-to-use prompt configured to highlight pain-point solutions in ChatGPT, Claude,
                or Gemini.
              </p>
            </div>
            <div className="generator-actions">
              {onAskCompanion && (
                <button
                  type="button"
                  className="theme-btn-outline btn-sm"
                  onClick={() => {
                    const flawsContext = activeNiche.painPoints.length
                      ? ` against competitor flaws: ${activeNiche.painPoints.join('; ')}`
                      : ' (no structured pain-point data yet — suggest what to research in competitor reviews)';
                    const angleContext = activeNiche.differentiationAngle
                      ? ` Current angle: "${activeNiche.differentiationAngle}".`
                      : '';
                    onAskCompanion(
                      `For the product "${activeNiche.name}" in ${categoryName}, how can I refine this differentiation strategy${flawsContext}?${angleContext} What specific questions should I ask manufacturers?`
                    );
                  }}
                  title="Ask AI Copilot to refine differentiation strategy"
                >
                  <Bot size={14} aria-hidden="true" /> Ask AI Copilot
                </button>
              )}
              <button
                type="button"
                className="theme-btn-primary btn-sm"
                onClick={handleCopyPrompt}
              >
                <Copy size={14} aria-hidden="true" /> {copiedPrompt ? 'Copied to Clipboard!' : 'Copy AI Prompt'}
              </button>
            </div>
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

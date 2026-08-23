import React, { useState, useMemo } from 'react';
import { Bot, Calculator, Copy, Loader2, Package, Truck, Zap } from 'lucide-react';
import {
  AMAZON_CATEGORY_FEES,
  FBA_TIERS,
  FbaSizeTier,
  calculateUnitEconomics,
  NicheTrend,
} from '../../data/amazonData';
import { lookupLiveAmazonAsin } from '../../api/backend';

interface UnitEconomicsCalculatorProps {
  initialNiche?: NicheTrend | null;
  onAskCompanion?: (prompt: string) => void;
}

export const UnitEconomicsCalculator: React.FC<UnitEconomicsCalculatorProps> = ({
  initialNiche,
  onAskCompanion,
}) => {
  const [asinInput, setAsinInput] = useState<string>('');
  const [isLoadingAsin, setIsLoadingAsin] = useState<boolean>(false);
  const [asinError, setAsinError] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState<string>(initialNiche ? initialNiche.name : '');

  const [salePrice, setSalePrice] = useState<number>(initialNiche ? initialNiche.avgPrice : 34.99);
  const [cogs, setCogs] = useState<number>(initialNiche ? initialNiche.avgCogs : 6.5);
  const [shippingToAmazon, setShippingToAmazon] = useState<number>(1.5);
  const [categoryId, setCategoryId] = useState<string>(
    initialNiche ? initialNiche.category : 'home_kitchen'
  );
  const [fbaTier, setFbaTier] = useState<FbaSizeTier>(
    initialNiche ? initialNiche.fbaTier : 'large_standard'
  );
  const [tacosPct, setTacosPct] = useState<number>(12); // 12% target advertising cost
  const [returnRatePct, setReturnRatePct] = useState<number>(3.0);
  const [fulfillmentType, setFulfillmentType] = useState<'FBA' | 'FBM'>('FBA');
  const [fbmShipping, setFbmShipping] = useState<number>(5.5);
  const [monthlyUnits, setMonthlyUnits] = useState<number>(800);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Sync if initialNiche prop changes from outside (e.g. 1-click bridge)
  React.useEffect(() => {
    if (initialNiche) {
      setProductTitle(initialNiche.name);
      setSalePrice(initialNiche.avgPrice);
      setCogs(initialNiche.avgCogs);
      setCategoryId(initialNiche.category);
      setFbaTier(initialNiche.fbaTier);
    }
  }, [initialNiche]);

  const handleFetchAsin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asinInput.trim()) return;

    setIsLoadingAsin(true);
    setAsinError(null);

    try {
      const res = await lookupLiveAmazonAsin(asinInput.trim());

      if (!res.data) {
        setAsinError(res.error || 'Failed to fetch ASIN details. Please check the ID.');
        return;
      }

      // `lookupLiveAmazonAsin` never throws — it returns benchmark fallback
      // data with `isFallback`/`is_live` flags. Surface that state instead of
      // silently filling the form with estimates.
      if (res.isFallback || !res.data.is_live) {
        setAsinError(
          res.error
            ? `Live lookup unavailable (${res.error}) — showing benchmark estimates.`
            : 'Amazon blocked the live request — showing benchmark estimates.'
        );
      }

      setProductTitle(res.data.title);
      setSalePrice(res.data.price);
      if (res.data.estimated_cogs > 0) setCogs(res.data.estimated_cogs);
      if (res.data.category) setCategoryId(res.data.category);
      if (res.data.fba_tier) setFbaTier(res.data.fba_tier);
    } catch {
      setAsinError('Failed to fetch ASIN details. Please check the ID.');
    } finally {
      setIsLoadingAsin(false);
    }
  };

  const economics = useMemo(() => {
    return calculateUnitEconomics({
      salePrice,
      cogs,
      shippingToAmazonPerUnit: shippingToAmazon,
      categoryId,
      fbaTier,
      tacosPct,
      returnRatePct,
      fulfillmentType,
      customFbmShippingCost: fbmShipping,
    });
  }, [
    salePrice,
    cogs,
    shippingToAmazon,
    categoryId,
    fbaTier,
    tacosPct,
    returnRatePct,
    fulfillmentType,
    fbmShipping,
  ]);

  const monthlyGrossRevenue = salePrice * monthlyUnits;
  const monthlyTotalProfit = economics.netProfit * monthlyUnits;

  // Percentage breakdown for visual stacked bar (normalized so sum equals 100%)
  const priceSafe = salePrice > 0 ? salePrice : 1;
  const rawLanded = (economics.landedCost / priceSafe) * 100;
  const rawAmazon = (economics.totalAmazonFees / priceSafe) * 100;
  const rawAds = (economics.adSpendPerUnit / priceSafe) * 100;
  const rawReturns = (economics.returnsCostPerUnit / priceSafe) * 100;
  const totalCostPct = rawLanded + rawAmazon + rawAds + rawReturns;

  let landedPct = rawLanded;
  let amazonFeePct = rawAmazon;
  let adSpendPct = rawAds;
  let netProfitPct = Math.max(0, economics.netMarginPct);

  // If costs exceed revenue (unprofitable), normalize cost segments so total bar width is 100%
  if (totalCostPct > 100) {
    const scale = 100 / totalCostPct;
    landedPct = rawLanded * scale;
    amazonFeePct = rawAmazon * scale;
    adSpendPct = rawAds * scale;
    netProfitPct = 0;
  }

  const handleCopySummary = async () => {
    const summary = `### Amazon Product Sourcing & Economics Summary
- **Sale Price**: $${economics.salePrice.toFixed(2)}
- **Fulfillment**: ${fulfillmentType} ${economics.isLowPriceFba ? '(Low-Price FBA Rate Applied)' : ''
      }
- **COGS**: $${cogs.toFixed(2)} | **Freight**: $${shippingToAmazon.toFixed(2)}
- **Total Landed Cost**: $${economics.landedCost.toFixed(2)}
- **Amazon Referral Fee**: $${economics.referralFee.toFixed(2)}
- **Amazon Fulfillment Fee**: $${economics.fbaFulfillmentFee.toFixed(2)}
- **Estimated PPC Ad Spend (${tacosPct}% TACoS)**: $${economics.adSpendPerUnit.toFixed(2)}
---------------------------------------------
- **Net Profit / Unit**: $${economics.netProfit.toFixed(2)}
- **Net Margin**: ${economics.netMarginPct}%
- **ROI**: ${economics.roiPct}%
- **Max Allowable Landed Cost (Breakeven)**: $${economics.breakevenLandedCost.toFixed(2)}
- **Est. Monthly Profit @ ${monthlyUnits} units/mo**: $${monthlyTotalProfit.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="unit-economics-section">
      <div className="tool-intro-card">
        <div className="tool-header-action-row">
          <div>
            <h3 className="tool-title">
              <Calculator size={18} aria-hidden="true" className="inline-icon accent" />
              Unit Economics Simulator
            </h3>
            <p>
              Simulate net margins, referral fees, 2026 FBA size tier costs (including
              Low-Price FBA rates), PPC ad spend, and breakeven limits.
            </p>
          </div>
          <div className="tool-actions-flex">
            {onAskCompanion && (
              <button
                type="button"
                className="theme-btn-outline"
                onClick={() =>
                  onAskCompanion(
                    `Can you analyze the unit economics for "${productTitle || 'Product'}"? Sale Price: $${economics.salePrice.toFixed(2)}, Landed Cost: $${economics.landedCost.toFixed(2)} (COGS $${cogs.toFixed(2)} + Freight $${shippingToAmazon.toFixed(2)}), Total Amazon Fees: $${economics.totalAmazonFees.toFixed(2)} (${fulfillmentType} fulfillment $${economics.fbaFulfillmentFee.toFixed(2)} + Referral $${economics.referralFee.toFixed(2)}), TACoS: ${tacosPct}% ($${economics.adSpendPerUnit.toFixed(2)}), Net Margin: ${economics.netMarginPct}% ($${economics.netProfit.toFixed(2)}/unit), Breakeven Landed Cost: $${economics.breakevenLandedCost.toFixed(2)}. Is this viable for private label FBA?`
                  )
                }
                title="Ask AI Copilot to analyze these unit economics"
              >
                <Bot size={14} aria-hidden="true" /> Ask AI to Analyze
              </button>
            )}
            <button
              type="button"
              className="theme-btn-secondary"
              onClick={handleCopySummary}
              title="Copy formatted markdown report for suppliers & sourcing agents"
            >
              <Copy size={14} aria-hidden="true" /> {copySuccess ? 'Copied Summary!' : 'Copy Sourcing Summary'}
            </button>
          </div>
        </div>
      </div>

      <div className="economics-layout-grid">
        {/* Input Parameters Panel */}
        <div className="calculator-inputs-panel">
          <div className="asin-quick-loader-box">
              <label htmlFor="quick-asin-input" className="asin-loader-label">
                <Zap size={14} aria-hidden="true" /> Inspect Real Amazon ASIN / Product Link
              </label>
            <form onSubmit={handleFetchAsin} className="asin-input-form">
              <input
                id="quick-asin-input"
                type="text"
                className="theme-input asin-field"
                placeholder="e.g. B08N5WRWNW or paste amazon.com/dp/... link"
                value={asinInput}
                onChange={(e) => setAsinInput(e.target.value)}
              />
              <button
                type="submit"
                className="theme-btn-primary asin-fetch-btn"
                disabled={isLoadingAsin}
              >
                {isLoadingAsin ? (
                  <>
                    <Loader2 size={14} className="icon-spin" aria-hidden="true" /> Fetching…
                  </>
                ) : (
                  'Fetch ASIN'
                )}
              </button>
            </form>
            {asinError && <span className="asin-error-msg">{asinError}</span>}
            {productTitle && (
              <div className="active-product-title-badge">
                <span className="product-tag">Active Product:</span> {productTitle}
              </div>
            )}
          </div>

          <h4 className="panel-subhead">1. Pricing & Landed Cost Inputs</h4>

          <div className="input-group-row">
            <div className="input-field">
              <label htmlFor="sale-price-input">Target Retail Price ($)</label>
              <input
                id="sale-price-input"
                type="number"
                step="0.50"
                min="1"
                className="theme-input"
                value={salePrice}
                onChange={(e) => setSalePrice(Math.max(0, Number(e.target.value)))}
              />
              {economics.isLowPriceFba && (
                <span className="badge-pill pill-green">
                  <Zap size={11} aria-hidden="true" /> Qualifies for Low-Price FBA (&lt;$10)
                </span>
              )}
            </div>

            <div className="input-field">
              <label htmlFor="cogs-input">Product Cost / COGS ($)</label>
              <input
                id="cogs-input"
                type="number"
                step="0.25"
                min="0"
                className="theme-input"
                value={cogs}
                onChange={(e) => setCogs(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          <div className="input-group-row">
            <div className="input-field">
              <label htmlFor="shipping-input">Inbound Freight to Amazon ($ / unit)</label>
              <input
                id="shipping-input"
                type="number"
                step="0.10"
                min="0"
                className="theme-input"
                value={shippingToAmazon}
                onChange={(e) => setShippingToAmazon(Math.max(0, Number(e.target.value)))}
              />
            </div>

            <div className="input-field">
              <label htmlFor="eco-category-select">Amazon Product Category</label>
              <select
                id="eco-category-select"
                className="theme-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {AMAZON_CATEGORY_FEES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.referralPercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h4 className="panel-subhead" style={{ marginTop: '1.5rem' }}>
            2. Fulfillment & PPC Settings
          </h4>

          <div className="fulfillment-toggle-row">
            <label className="toggle-label">Fulfillment Method:</label>
            <div className="segmented-btn-group">
              <button
                type="button"
                className={`segment-btn ${fulfillmentType === 'FBA' ? 'active' : ''}`}
                onClick={() => setFulfillmentType('FBA')}
              >
                <Package size={13} aria-hidden="true" /> Amazon FBA
              </button>
              <button
                type="button"
                className={`segment-btn ${fulfillmentType === 'FBM' ? 'active' : ''}`}
                onClick={() => setFulfillmentType('FBM')}
              >
                <Truck size={13} aria-hidden="true" /> Merchant Fulfilled (FBM)
              </button>
            </div>
          </div>

          {fulfillmentType === 'FBA' ? (
            <div className="input-field full-width">
              <label htmlFor="fba-tier-select">FBA Size & Weight Tier</label>
              <select
                id="fba-tier-select"
                className="theme-select"
                value={fbaTier}
                onChange={(e) => setFbaTier(e.target.value as FbaSizeTier)}
              >
                {FBA_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label} — ${economics.isLowPriceFba ? tier.lowPriceFee : tier.standardFee}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="input-field full-width">
              <label htmlFor="fbm-cost-input">Direct Merchant Shipping & Packaging ($)</label>
              <input
                id="fbm-cost-input"
                type="number"
                step="0.25"
                min="0"
                className="theme-input"
                value={fbmShipping}
                onChange={(e) => setFbmShipping(Math.max(0, Number(e.target.value)))}
              />
            </div>
          )}

          <div className="slider-row-card">
            <div className="slider-label-row">
              <label htmlFor="tacos-slider">Target Ad Spend (TACoS % of Revenue)</label>
              <span className="slider-val">{tacosPct}% (~${economics.adSpendPerUnit.toFixed(2)})</span>
            </div>
            <input
              id="tacos-slider"
              type="range"
              min="0"
              max="35"
              step="1"
              className="theme-slider"
              value={tacosPct}
              onChange={(e) => setTacosPct(Number(e.target.value))}
            />
          </div>

          <div className="slider-row-card">
            <div className="slider-label-row">
              <label htmlFor="return-rate-slider">Estimated Customer Return Rate</label>
              <span className="slider-val">{returnRatePct}% (~${economics.returnsCostPerUnit.toFixed(2)})</span>
            </div>
            <input
              id="return-rate-slider"
              type="range"
              min="0"
              max="15"
              step="0.5"
              className="theme-slider"
              value={returnRatePct}
              onChange={(e) => setReturnRatePct(Number(e.target.value))}
            />
          </div>

          <div className="slider-row-card">
            <div className="slider-label-row">
              <label htmlFor="volume-slider">Projected Monthly Sales Volume</label>
              <span className="slider-val">{monthlyUnits.toLocaleString()} units / mo</span>
            </div>
            <input
              id="volume-slider"
              type="range"
              min="50"
              max="5000"
              step="50"
              className="theme-slider"
              value={monthlyUnits}
              onChange={(e) => setMonthlyUnits(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Output & Visual Financial Breakdown Panel */}
        <div className="calculator-outputs-panel">
          <h4 className="panel-subhead">3. Profitability Scorecard</h4>

          <div className="hero-metrics-grid">
            <div className={`hero-metric-card ${economics.netProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
              <span className="hero-label">Net Profit / Unit</span>
              <span className="hero-val">${economics.netProfit.toFixed(2)}</span>
              <span className="hero-sub">{economics.netMarginPct}% Net Margin</span>
            </div>

            <div className="hero-metric-card">
              <span className="hero-label">Estimated ROI</span>
              <span className="hero-val">{economics.roiPct}%</span>
              <span className="hero-sub">On Landed Cost (${economics.landedCost.toFixed(2)})</span>
            </div>

            <div className="hero-metric-card">
              <span className="hero-label">Est. Monthly Profit</span>
              <span className="hero-val">
                ${monthlyTotalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="hero-sub">From ${monthlyGrossRevenue.toLocaleString()} Revenue</span>
            </div>
          </div>

          {/* Revenue Stacked Visual Bar */}
          <div className="stacked-bar-container">
            <label className="stacked-label">Unit Revenue Allocation Breakdown ($)</label>
            <div className="stacked-bar-track">
              <div
                className="stacked-segment segment-cogs"
                style={{ width: `${landedPct}%` }}
                title={`Landed Cost: $${economics.landedCost.toFixed(2)} (${landedPct.toFixed(1)}%)`}
              />
              <div
                className="stacked-segment segment-amazon"
                style={{ width: `${amazonFeePct}%` }}
                title={`Amazon Fees: $${economics.totalAmazonFees.toFixed(2)} (${amazonFeePct.toFixed(1)}%)`}
              />
              <div
                className="stacked-segment segment-ads"
                style={{ width: `${adSpendPct}%` }}
                title={`PPC Ads: $${economics.adSpendPerUnit.toFixed(2)} (${adSpendPct.toFixed(1)}%)`}
              />
              <div
                className="stacked-segment segment-profit"
                style={{ width: `${netProfitPct}%` }}
                title={`Net Profit: $${economics.netProfit.toFixed(2)} (${netProfitPct.toFixed(1)}%)`}
              />
            </div>
            <div className="stacked-legend">
              <span className="legend-item">
                <span className="dot dot-cogs" /> Landed Cost (${economics.landedCost.toFixed(2)})
              </span>
              <span className="legend-item">
                <span className="dot dot-amazon" /> Amazon Fees (${economics.totalAmazonFees.toFixed(2)})
              </span>
              <span className="legend-item">
                <span className="dot dot-ads" /> PPC Ads (${economics.adSpendPerUnit.toFixed(2)})
              </span>
              <span className="legend-item">
                <span className="dot dot-profit" /> Net Profit (${economics.netProfit.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Itemized Line-Item Table */}
          <div className="fee-breakdown-table-wrap">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Cost Component</th>
                  <th>Amount</th>
                  <th>% of Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Product COGS</td>
                  <td>${cogs.toFixed(2)}</td>
                  <td>{((cogs / priceSafe) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Inbound Freight</td>
                  <td>${shippingToAmazon.toFixed(2)}</td>
                  <td>{((shippingToAmazon / priceSafe) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Amazon Referral Fee</td>
                  <td>${economics.referralFee.toFixed(2)}</td>
                  <td>{((economics.referralFee / priceSafe) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>
                    Fulfillment Fee ({fulfillmentType})
                    {economics.isLowPriceFba && ' [Low-Price Discount]'}
                  </td>
                  <td>${economics.fbaFulfillmentFee.toFixed(2)}</td>
                  <td>{((economics.fbaFulfillmentFee / priceSafe) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Target Ad Spend ({tacosPct}% TACoS)</td>
                  <td>${economics.adSpendPerUnit.toFixed(2)}</td>
                  <td>{tacosPct.toFixed(1)}%</td>
                </tr>
                <tr className="table-highlight-row">
                  <td>
                    <strong>Max Allowable Landed Cost (Breakeven)</strong>
                  </td>
                  <td colSpan={2}>
                    <strong>${economics.breakevenLandedCost.toFixed(2)} / unit</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

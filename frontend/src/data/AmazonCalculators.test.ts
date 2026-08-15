import { describe, it, expect } from 'vitest';
import {
  calculateOpportunityScore,
  calculateUnitEconomics,
  AMAZON_CATEGORY_FEES,
  FBA_TIERS,
} from '../data/amazonData';

describe('AmazonCalculators', () => {
  describe('calculateOpportunityScore', () => {
    it('calculates high opportunity score for high growth, low review barrier products', () => {
      const result = calculateOpportunityScore({
        searchVolumeGrowthPct: 180,
        avgPrice: 35.0,
        reviewBarrier: 'Low',
        estimatedMarginPct: 32,
        searchVolume: 120000,
      });

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(['Exceptional', 'Strong']).toContain(result.rating);
      expect(result.breakdown.demandScore).toBe(30);
      expect(result.breakdown.competitionScore).toBe(30);
      expect(result.breakdown.pricePointScore).toBe(15);
    });

    it('penalizes high review barrier and low growth niches', () => {
      const result = calculateOpportunityScore({
        searchVolumeGrowthPct: 15,
        avgPrice: 12.0,
        reviewBarrier: 'High',
        estimatedMarginPct: 12,
        searchVolume: 20000,
      });

      expect(result.score).toBeLessThan(60);
      expect(['Moderate', 'Challenging']).toContain(result.rating);
      expect(result.breakdown.competitionScore).toBe(10);
    });
  });

  describe('calculateUnitEconomics', () => {
    it('computes standard FBA fees and profit margins accurately', () => {
      const result = calculateUnitEconomics({
        salePrice: 35.0,
        cogs: 6.0,
        shippingToAmazonPerUnit: 1.5,
        categoryId: 'office_products',
        fbaTier: 'large_standard',
        tacosPct: 10,
        returnRatePct: 2.0,
      });

      // 15% of $35 = $5.25
      expect(result.referralFee).toBe(5.25);
      // Large standard standardFee = $4.75
      expect(result.fbaFulfillmentFee).toBe(4.75);
      expect(result.totalAmazonFees).toBe(10.0);
      expect(result.landedCost).toBe(7.5);
      // 10% TACoS on $35 = $3.50
      expect(result.adSpendPerUnit).toBe(3.5);
      expect(result.isLowPriceFba).toBe(false);
      expect(result.netProfit).toBeGreaterThan(10.0);
      expect(result.netMarginPct).toBeGreaterThan(30);
      expect(result.roiPct).toBeGreaterThan(150);
      expect(result.breakevenLandedCost).toBeGreaterThan(0);
    });

    it('applies low-price FBA fee rates for items under $10', () => {
      const result = calculateUnitEconomics({
        salePrice: 9.99,
        cogs: 1.5,
        shippingToAmazonPerUnit: 0.5,
        categoryId: 'home_kitchen',
        fbaTier: 'small_standard',
        tacosPct: 8,
      });

      expect(result.isLowPriceFba).toBe(true);
      // Small standard lowPriceFee = $2.45
      expect(result.fbaFulfillmentFee).toBe(2.45);
      // 15% referral on 9.99 = 1.50
      expect(result.referralFee).toBe(1.5);
      expect(result.netProfit).toBeGreaterThan(0);
    });

    it('respects minimum $0.30 Amazon referral fee', () => {
      const result = calculateUnitEconomics({
        salePrice: 1.0,
        cogs: 0.2,
        shippingToAmazonPerUnit: 0.1,
        categoryId: 'office_products',
        fbaTier: 'small_standard',
        tacosPct: 0,
      });

      expect(result.referralFee).toBe(0.3);
    });
  });

  describe('Configuration fixtures', () => {
    it('has all expected categories and tier structures', () => {
      expect(AMAZON_CATEGORY_FEES.length).toBeGreaterThanOrEqual(8);
      expect(FBA_TIERS.length).toBe(4);
    });
  });
});

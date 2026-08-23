import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpportunityFinder } from './OpportunityFinder';
import { UnitEconomicsCalculator } from './UnitEconomicsCalculator';
import { ReviewGapScanner } from './ReviewGapScanner';
import { SAMPLE_NICHE_TRENDS, NicheTrend } from '../../data/amazonData';
import {
  searchLiveAmazonProducts,
  fetchLiveAmazonTrends,
} from '../../api/backend';

vi.mock('../../api/backend', () => ({
  searchLiveAmazonProducts: vi.fn(),
  fetchLiveAmazonTrends: vi.fn(),
  lookupLiveAmazonAsin: vi.fn(),
}));

describe('Amazon Individual Components Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('OpportunityFinder', () => {
    it('handles category filtering and reset', () => {
      const mockEconomics = vi.fn();
      const mockPrompt = vi.fn();

      render(
        <OpportunityFinder
          onSelectNicheForEconomics={mockEconomics}
          onSelectNicheForPrompt={mockPrompt}
        />
      );

      // Select 'Pet Supplies' category
      const categorySelect = screen.getByLabelText(/Amazon Category/i);
      fireEvent.change(categorySelect, { target: { value: 'pet_supplies' } });

      expect(screen.getByText(/Orthopedic Elevated Ceramic Slow Feeder/i)).toBeInTheDocument();
      expect(screen.queryByText(/Borosilicate Cold Brew/i)).not.toBeInTheDocument();

      // Click Reset Filters / Reset to Featured
      const resetBtn = screen.getByRole('button', { name: /Reset to Featured|Clear Filters|Reset Filters/i });
      fireEvent.click(resetBtn);

      expect(screen.getByText(/Borosilicate Cold Brew/i)).toBeInTheDocument();
    });

    it('opens detail modal on Inspect and triggers callbacks', () => {
      const mockEconomics = vi.fn();
      const mockPrompt = vi.fn();

      render(
        <OpportunityFinder
          onSelectNicheForEconomics={mockEconomics}
          onSelectNicheForPrompt={mockPrompt}
        />
      );

      const inspectButtons = screen.getAllByRole('button', { name: /^Inspect$/i });
      fireEvent.click(inspectButtons[0]);

      expect(screen.getByText(/Market Metrics/i)).toBeInTheDocument();
      expect(screen.getByText(/Known Competitor Pain Points/i)).toBeInTheDocument();

      // Click "Load into Financial Simulator" inside modal
      const modalLoadBtn = screen.getByRole('button', { name: /Load into Financial Simulator/i });
      fireEvent.click(modalLoadBtn);
      expect(mockEconomics).toHaveBeenCalledTimes(1);
    });

    it('submits live Amazon keyword search form', async () => {
      const mockEconomics = vi.fn();
      const mockPrompt = vi.fn();

      render(
        <OpportunityFinder
          onSelectNicheForEconomics={mockEconomics}
          onSelectNicheForPrompt={mockPrompt}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search live Amazon keywords/i);
      fireEvent.change(searchInput, { target: { value: 'Cold Brew Maker' } });

      const searchSubmitBtn = screen.getByRole('button', { name: /Search Live Amazon/i });
      fireEvent.click(searchSubmitBtn);

      expect(searchInput).toHaveValue('Cold Brew Maker');
    });

    it('labels curated cards as benchmarks and degrades unknown live data honestly', async () => {
      const mockEconomics = vi.fn();
      const mockPrompt = vi.fn();

      vi.mocked(searchLiveAmazonProducts).mockResolvedValue({
        isFallback: false,
        data: {
          query: 'espresso tamper',
          category: 'all',
          total_results: 2,
          products: [
            {
              asin: 'B09C5PWJXL',
              title: 'Normcore V4 Coffee Tamper 53.3mm',
              price: 42.29,
              rating: 4.6,
              reviews_count: 3336,
              image_url: '',
              product_url: 'https://www.amazon.com/dp/B09C5PWJXL',
              is_prime: true,
              category: 'home_kitchen',
              fba_tier: 'large_standard',
            },
            {
              asin: 'B0NEW0NEW0',
              title: 'Brand New Untested Gadget',
              price: 12.0,
              rating: 0,
              reviews_count: 0,
              image_url: '',
              product_url: 'https://www.amazon.com/dp/B0NEW0NEW0',
              is_prime: false,
              category: 'home_kitchen',
              fba_tier: 'small_standard',
            },
          ],
          is_live: true,
          source: 'live_marketplace',
          cached: false,
          note: '',
        },
      });
      vi.mocked(fetchLiveAmazonTrends).mockResolvedValue({
        isFallback: false,
        data: {
          query: 'espresso tamper',
          trend_points: [],
          growth_velocity_pct: null,
          suggestions: ['espresso tamper 53mm'],
          is_live: true,
          source: 'live_autocomplete',
        },
      });

      render(
        <OpportunityFinder
          onSelectNicheForEconomics={mockEconomics}
          onSelectNicheForPrompt={mockPrompt}
        />
      );

      // Curated view must not claim to show live prices
      expect(screen.getAllByText('Benchmark Price').length).toBeGreaterThan(0);
      expect(screen.queryByText('Live Price')).not.toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Search live Amazon keywords/i);
      fireEvent.change(searchInput, { target: { value: 'espresso tamper' } });
      fireEvent.click(screen.getByRole('button', { name: /Search Live Amazon/i }));

      // After a successful live search, prices are labeled live
      await waitFor(() => {
        expect(screen.getAllByText('Live Price').length).toBeGreaterThan(0);
      });

      // Parsed review counts drive the barrier display
      expect(screen.getByText('3,336 ratings')).toBeInTheDocument();
      expect(screen.getByText(/High Barrier \(4\.6 ★\)/)).toBeInTheDocument();

      // Unparseable reviews are labeled unknown — never "Low Barrier (0 ratings)"
      expect(screen.getByText('unknown')).toBeInTheDocument();
      expect(screen.getByText('Review data unavailable')).toBeInTheDocument();

      // No velocity signal means no velocity claim
      expect(screen.getAllByText('Velocity unavailable').length).toBe(2);

      // No demand floor is invented for unknown review data
      expect(screen.getByText('—')).toBeInTheDocument();

      // Canned pain points / differentiation angles never appear on live cards
      expect(
        screen.queryByText(/Upgraded materials with reinforced joints/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Sourcing & Differentiation Angle/i)).not.toBeInTheDocument();
    });
  });

  describe('UnitEconomicsCalculator', () => {
    it('reacts to retail price, COGS, and TACoS slider updates', () => {
      render(<UnitEconomicsCalculator />);

      const priceInput = screen.getByLabelText(/Target Retail Price/i);
      fireEvent.change(priceInput, { target: { value: '49.99' } });

      const cogsInput = screen.getByLabelText(/Product Cost \/ COGS/i);
      fireEvent.change(cogsInput, { target: { value: '8.00' } });

      // Change TACoS slider
      const tacosSlider = screen.getByLabelText(/Target Ad Spend/i);
      fireEvent.change(tacosSlider, { target: { value: '15' } });

      // Swapping fulfillment to FBM
      const fbmBtn = screen.getByRole('button', { name: /Merchant Fulfilled/i });
      fireEvent.click(fbmBtn);
      expect(screen.getByLabelText(/Direct Merchant Shipping/i)).toBeInTheDocument();
    });

    it('copies sourcing summary to clipboard on button click', async () => {
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextSpy },
        configurable: true,
        writable: true,
      });

      render(<UnitEconomicsCalculator initialNiche={SAMPLE_NICHE_TRENDS[0]} />);

      const copyBtn = screen.getByRole('button', { name: /Copy Sourcing Summary/i });
      fireEvent.click(copyBtn);

      expect(writeTextSpy).toHaveBeenCalled();
      expect(await screen.findByText(/Copied Summary!/i)).toBeInTheDocument();
    });

    it('handles live ASIN inspection form submit', async () => {
      render(<UnitEconomicsCalculator />);

      const asinInput = screen.getByPlaceholderText(/e.g. B08N5WRWNW/i);
      fireEvent.change(asinInput, { target: { value: 'B08N5WRWNW' } });

      const fetchBtn = screen.getByRole('button', { name: /Fetch ASIN/i });
      fireEvent.click(fetchBtn);

      expect(asinInput).toHaveValue('B08N5WRWNW');
    });
  });

  describe('ReviewGapScanner', () => {
    it('switches active niche and copies generated AI prompt', async () => {
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextSpy },
        configurable: true,
        writable: true,
      });

      render(<ReviewGapScanner initialNiche={SAMPLE_NICHE_TRENDS[1]} />);

      // Switch niche dropdown
      const nicheSelect = screen.getByLabelText(/Select Product Micro-Niche to Inspect/i);
      fireEvent.change(nicheSelect, { target: { value: SAMPLE_NICHE_TRENDS[2].id } });

      expect(screen.getAllByText(/Lead-free/i).length).toBeGreaterThanOrEqual(1);

      // Add custom note
      const customNotes = screen.getByPlaceholderText(/Must support 220V/i);
      fireEvent.change(customNotes, { target: { value: 'Must include extra stainless filters' } });

      // Copy AI Prompt
      const copyPromptBtn = screen.getByRole('button', { name: /Copy AI Prompt/i });
      fireEvent.click(copyPromptBtn);

      expect(writeTextSpy).toHaveBeenCalled();
      expect(await screen.findByText(/Copied to Clipboard!/i)).toBeInTheDocument();
    });

    it('shows the live listing itself, never a silent curated fallback', () => {
      const liveNiche: NicheTrend = {
        ...SAMPLE_NICHE_TRENDS[0],
        id: 'B09C5PWJXL',
        name: 'Normcore V4 Coffee Tamper 53.3mm',
        painPoints: [],
        differentiationAngle: '',
      };

      render(<ReviewGapScanner initialNiche={liveNiche} />);

      // The live product appears as the inspected niche
      expect(screen.getByText(/Live listing: Normcore V4 Coffee Tamper/i)).toBeInTheDocument();

      // Honest empty state instead of the first curated niche's desk-mat pain points
      expect(screen.getByText(/No competitor pain-point data/i)).toBeInTheDocument();
      expect(screen.queryByText(/Edges fray or curl/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Recommended Engineering & Differentiation Fix/i)).not.toBeInTheDocument();

      // The generated prompt targets the live product and labels hypotheses
      expect(screen.getByText(/Product Concept: Normcore V4 Coffee Tamper/i)).toBeInTheDocument();
      expect(screen.getByText(/\(None recorded for this live listing/i)).toBeInTheDocument();
    });
  });
});

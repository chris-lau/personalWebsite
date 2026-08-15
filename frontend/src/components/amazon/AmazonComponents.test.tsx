import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpportunityFinder } from './OpportunityFinder';
import { UnitEconomicsCalculator } from './UnitEconomicsCalculator';
import { ReviewGapScanner } from './ReviewGapScanner';
import { SAMPLE_NICHE_TRENDS } from '../../data/amazonData';

describe('Amazon Individual Components Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

      // Click Reset Filters
      const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
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

      expect(screen.getByText(/Market Dynamics/i)).toBeInTheDocument();
      expect(screen.getByText(/Known Competitor Pain Points/i)).toBeInTheDocument();

      // Click "Load into Financial Simulator" inside modal
      const modalLoadBtn = screen.getByRole('button', { name: /Load into Financial Simulator/i });
      fireEvent.click(modalLoadBtn);
      expect(mockEconomics).toHaveBeenCalledTimes(1);
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
      expect(await screen.findByText(/✓ Copied Summary!/i)).toBeInTheDocument();
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
      expect(await screen.findByText(/✓ Copied to Clipboard!/i)).toBeInTheDocument();
    });
  });
});

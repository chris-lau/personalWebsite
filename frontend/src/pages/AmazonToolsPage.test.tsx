import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AmazonToolsPage } from './AmazonToolsPage';
import { ThemeProvider } from '../context/ThemeContext';

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AmazonToolsPage />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('AmazonToolsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('renders the header and tabs correctly', () => {
    renderWithProviders();

    expect(screen.getByRole('heading', { name: /Amazon Seller Trend & Opportunity Suite/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Product Trend & Opportunity Finder/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unit Economics & Profit Simulator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review Gap & Listing Prompt Scanner/i })).toBeInTheDocument();
  });

  it('switches between tabs on click', () => {
    renderWithProviders();

    // Click Unit Economics tab
    const calcTab = screen.getByRole('button', { name: /Unit Economics & Profit Simulator/i });
    fireEvent.click(calcTab);
    expect(screen.getByRole('heading', { name: /Amazon FBA \/ FBM Profit & Unit Economics Simulator/i })).toBeInTheDocument();

    // Click Review Gap tab
    const reviewTab = screen.getByRole('button', { name: /Review Gap & Listing Prompt Scanner/i });
    fireEvent.click(reviewTab);
    expect(screen.getByRole('heading', { name: /Competitor Review & Listing Gap Scanner/i })).toBeInTheDocument();
  });

  it('transfers niche data from Opportunity Finder into Unit Economics Calculator', () => {
    renderWithProviders();

    // Find and click "Simulate Unit Economics" on the first card
    const simulateButtons = screen.getAllByRole('button', { name: /Simulate Unit Economics/i });
    expect(simulateButtons.length).toBeGreaterThan(0);
    fireEvent.click(simulateButtons[0]);

    // Should switch to calculator and display banner
    expect(screen.getByText(/Loaded Active Niche:/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Amazon FBA \/ FBM Profit & Unit Economics Simulator/i })).toBeInTheDocument();
  });

  it('filters niches based on search query', () => {
    renderWithProviders();

    const searchInput = screen.getByPlaceholderText(/e.g. Desk, Coffee, Ceramic, Travel.../i);
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });

    expect(screen.getByText(/Borosilicate Cold Brew Coffee Maker/i)).toBeInTheDocument();
    expect(screen.queryByText(/Modular Merino Wool & Felt Desk Mats/i)).not.toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AmazonToolsPage } from './AmazonToolsPage';
import { ThemeProvider } from '../context/ThemeContext';

const mockSendMessage = vi.fn();

vi.mock('../hooks/useChat', () => ({
  useChat: () => ({
    messages: [],
    loading: false,
    error: null,
    isFallback: false,
    models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
    selectedModel: 'gemini-2.5-flash',
    setSelectedModel: vi.fn(),
    sendMessage: mockSendMessage,
    clearChat: vi.fn(),
    metricsMap: new Map(),
    streamProgress: null,
  }),
}));

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
    mockSendMessage.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('renders the header and tabs correctly with showcase framing', () => {
    renderWithProviders();

    expect(screen.getByRole('heading', { name: /Amazon Seller Trend & Opportunity Suite/i })).toBeInTheDocument();
    expect(screen.getByText(/Live product demo:/i)).toBeInTheDocument();
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

    const searchInput = screen.getByPlaceholderText(/Search live Amazon keywords/i);
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });

    expect(screen.getByText(/Borosilicate Cold Brew Coffee Maker/i)).toBeInTheDocument();
    expect(screen.queryByText(/Modular Merino Wool & Felt Desk Mats/i)).not.toBeInTheDocument();
  });

  it('renders AI Companion Mode and updates context on tab switch', () => {
    renderWithProviders();

    // Verify toggle button
    const toggleBtn = screen.getByRole('button', { name: /Disable AI Companion Mode|Enable AI Companion Mode/i });
    expect(toggleBtn).toBeInTheDocument();

    // Verify companion panel is rendered
    expect(screen.getByText(/2026 FBA & Private Label Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Context: Trend & Opportunity Finder/i)).toBeInTheDocument();
    expect(screen.getByText(/How is the 0-100 Opportunity Score calculated\?/i)).toBeInTheDocument();

    // Switch to calculator tab and verify companion context updates
    const calcTab = screen.getByRole('button', { name: /Unit Economics & Profit Simulator/i });
    fireEvent.click(calcTab);
    expect(screen.getByText(/Context: Unit Economics Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/What is TACoS vs ACoS/i)).toBeInTheDocument();

    // Switch to review gap tab and verify companion context updates
    const reviewTab = screen.getByRole('button', { name: /Review Gap & Listing Prompt Scanner/i });
    fireEvent.click(reviewTab);
    expect(screen.getByText(/Context: Review Gap Scanner/i)).toBeInTheDocument();
    expect(screen.getByText(/How do I turn 1-star competitor reviews into product specs\?/i)).toBeInTheDocument();
  });

  it('allows toggling AI Companion Mode on and off', () => {
    renderWithProviders();

    const toggleBtn = screen.getByRole('button', { name: /Disable AI Companion Mode|Enable AI Companion Mode/i });
    expect(screen.getByText(/2026 FBA & Private Label Intelligence/i)).toBeInTheDocument();

    // Toggle off
    fireEvent.click(toggleBtn);
    expect(screen.queryByText(/2026 FBA & Private Label Intelligence/i)).not.toBeInTheDocument();

    // Toggle back on
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/2026 FBA & Private Label Intelligence/i)).toBeInTheDocument();
  });

  it('triggers companion chat when clicking Ask AI on a niche card', () => {
    renderWithProviders();

    const askAiButtons = screen.getAllByRole('button', { name: /Ask AI/i });
    expect(askAiButtons.length).toBeGreaterThan(0);
    fireEvent.click(askAiButtons[0]);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(expect.stringContaining('Can you analyze the market opportunity'));
  });

  it('triggers companion chat when clicking Ask AI to Analyze on the unit economics calculator', () => {
    renderWithProviders();

    const calcTab = screen.getByRole('button', { name: /Unit Economics & Profit Simulator/i });
    fireEvent.click(calcTab);

    const askAiBtn = screen.getByRole('button', { name: /Ask AI to Analyze/i });
    fireEvent.click(askAiBtn);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(expect.stringContaining('Can you analyze the unit economics'));
  });
});

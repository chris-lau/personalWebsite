import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectsPage } from './ProjectsPage';
import { ExperiencePage } from './ExperiencePage';
import { HowThisSiteWorksPage } from './HowThisSiteWorksPage';
import { CHAT_OPEN_EVENT } from '../components/chat/chatControl';

// Wrapper for components that use React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock console.error to keep test output clean
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('useEffect')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('Contextual Chat Links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProjectsPage', () => {
    it('renders "Ask this site →" buttons for each project', () => {
      render(<RouterWrapper><ProjectsPage /></RouterWrapper>);

      // Find all "Ask this site" buttons
      const askButtons = screen.getAllByText(/ask this site/i);
      expect(askButtons.length).toBeGreaterThan(0);
    });

    it('dispatches chat:open event with correct starter when project button is clicked', () => {
      render(<RouterWrapper><ProjectsPage /></RouterWrapper>);

      // Spy on event dispatching
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      // Find and click the first "Ask this site" button
      const firstAskButton = screen.getAllByText(/ask this site/i)[0];
      fireEvent.click(firstAskButton);

      // Verify event was dispatched
      expect(dispatchSpy).toHaveBeenCalledOnce();

      // Get the dispatched event
      const dispatchedEvent = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(dispatchedEvent.type).toBe(CHAT_OPEN_EVENT);
      expect(dispatchedEvent.detail).toHaveProperty('starter');
      expect(typeof dispatchedEvent.detail.starter).toBe('string');
      expect(dispatchedEvent.detail.starter).toContain('project');

      dispatchSpy.mockRestore();
    });

    it('includes project title in aria-label', () => {
      render(<RouterWrapper><ProjectsPage /></RouterWrapper>);

      // Find a button with aria-label containing project name
      const askButtons = screen.getAllByText(/ask this site/i);
      expect(askButtons[0]).toHaveAttribute('aria-label');
      expect(askButtons[0].getAttribute('aria-label')).toMatch(/Ask this site about the .* project/i);
    });
  });

  describe('ExperiencePage', () => {
    it('renders "Ask this site →" buttons for each role', () => {
      render(<RouterWrapper><ExperiencePage /></RouterWrapper>);

      // Find all "Ask this site" buttons
      const askButtons = screen.getAllByText(/ask this site/i);
      expect(askButtons.length).toBeGreaterThan(0);
    });

    it('dispatches chat:open event with correct starter when role button is clicked', () => {
      render(<RouterWrapper><ExperiencePage /></RouterWrapper>);

      // Spy on event dispatching
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      // Find and click the first "Ask this site" button
      const firstAskButton = screen.getAllByText(/ask this site/i)[0];
      fireEvent.click(firstAskButton);

      // Verify event was dispatched
      expect(dispatchSpy).toHaveBeenCalledOnce();

      // Get the dispatched event
      const dispatchedEvent = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(dispatchedEvent.type).toBe(CHAT_OPEN_EVENT);
      expect(dispatchedEvent.detail).toHaveProperty('starter');
      expect(typeof dispatchedEvent.detail.starter).toBe('string');
      expect(dispatchedEvent.detail.starter).toMatch(/role at/i);

      dispatchSpy.mockRestore();
    });

    it('includes role and company in aria-label', () => {
      render(<RouterWrapper><ExperiencePage /></RouterWrapper>);

      // Find a button with aria-label containing role and company
      const askButtons = screen.getAllByText(/ask this site/i);
      expect(askButtons[0]).toHaveAttribute('aria-label');
      expect(askButtons[0].getAttribute('aria-label')).toMatch(/Ask this site about the .* role/i);
    });
  });

  describe('HowThisSiteWorksPage', () => {
    it('chat observability button calls openChat without DOM queries', () => {
      render(<RouterWrapper><HowThisSiteWorksPage /></RouterWrapper>);

      // Spy on querySelector to ensure no DOM queries for .chat-launcher
      const querySelectorSpy = vi.spyOn(document, 'querySelector');

      // Spy on event dispatching
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      // Find and click the "Chat Observability & Telemetry" button
      const chatObsButton = screen.getByText(/chat observability/i);
      fireEvent.click(chatObsButton);

      // Verify no DOM query for .chat-launcher was made
      expect(querySelectorSpy).not.toHaveBeenCalledWith('.chat-launcher');

      // Verify openChat was called via event dispatch
      expect(dispatchSpy).toHaveBeenCalledOnce();

      const dispatchedEvent = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(dispatchedEvent.type).toBe(CHAT_OPEN_EVENT);

      querySelectorSpy.mockRestore();
      dispatchSpy.mockRestore();
    });

    it('sets companion mode localStorage when chat observability button is clicked', () => {
      render(<RouterWrapper><HowThisSiteWorksPage /></RouterWrapper>);

      // Get initial localStorage value
      const initialValue = localStorage.getItem('chat_companion_mode');

      // Click the chat observability button
      const chatObsButton = screen.getByText(/chat observability/i);
      fireEvent.click(chatObsButton);

      // Verify companion mode was set
      expect(localStorage.getItem('chat_companion_mode')).toBe('true');

      // Restore original value
      if (initialValue === null) {
        localStorage.removeItem('chat_companion_mode');
      } else {
        localStorage.setItem('chat_companion_mode', initialValue);
      }
    });
  });
});
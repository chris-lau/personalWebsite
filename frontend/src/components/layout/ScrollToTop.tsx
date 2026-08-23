import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the viewport to the top on client-side route changes. React Router
 * preserves the scroll offset across navigations, so without this a footer
 * link on a long page lands the visitor mid-way down the next page.
 *
 * Skips the reset when the target URL carries a hash (in-page anchors must
 * keep their jump behavior). Back/forward navigation also scrolls to top —
 * the conventional tradeoff until the app migrates to a data router with
 * <ScrollRestoration>.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
};

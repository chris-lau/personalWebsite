import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders inline links with target=_blank and rel attributes', () => {
    render(<MarkdownRenderer content="[Click here](https://example.com)" variant="blog" />);

    const link = screen.getByText('Click here');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders bold and inline code', () => {
    render(<MarkdownRenderer content="This is **bold** and `code`" variant="blog" />);

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders headings h2 and h3 (but skips h1)', () => {
    const { container } = render(
      <MarkdownRenderer content={'# Title\n\n## Section\n\n### Subsection'} variant="blog" />,
    );

    // H1 is suppressed (null component).
    const h1 = container.querySelector('h1');
    expect(h1).toBeNull();
    const h2 = container.querySelector('h2');
    expect(h2?.textContent).toBe('Section');
    const h3 = container.querySelector('h3');
    expect(h3?.textContent).toBe('Subsection');
  });

  it('wraps list items in a <ul> element (valid HTML)', () => {
    const { container } = render(
      <MarkdownRenderer content={'- Item one\n- Item two'} variant="blog" />,
    );

    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();
    const items = ul!.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('Item one');
    expect(items[1].textContent).toBe('Item two');
  });

  it('renders ordered lists', () => {
    const { container } = render(
      <MarkdownRenderer content={'1. First\n2. Second'} variant="reader" />,
    );

    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.querySelectorAll('li')).toHaveLength(2);
  });

  it('detects TL;DR blockquotes and applies the callout class', () => {
    const { container } = render(
      <MarkdownRenderer content={'> TL;DR: This is a summary.'} variant="blog" />,
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).not.toBeNull();
    expect(blockquote!.className).toContain('tldr-callout');
  });

  it('renders regular blockquotes with the blockquote class', () => {
    const { container } = render(
      <MarkdownRenderer content={'> A normal quote.'} variant="blog" />,
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).not.toBeNull();
    expect(blockquote!.className).toContain('blockquote');
  });

  it('renders code blocks in a pre wrapper', () => {
    const { container } = render(
      <MarkdownRenderer content={'```ts\nconst x = 1;\n```'} variant="blog" />,
    );

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('const x = 1');
  });

  it('renders GFM tables', () => {
    const { container } = render(
      <MarkdownRenderer
        content={'| Col A | Col B |\n| --- | --- |\n| 1 | 2 |'}
        variant="blog"
      />,
    );

    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table!.querySelectorAll('th')).toHaveLength(2);
    expect(table!.querySelectorAll('td')).toHaveLength(2);
  });

  it('applies reader-prefixed classes in reader variant', () => {
    const { container } = render(<MarkdownRenderer content={'## Hello'} variant="reader" />);

    const h2 = container.querySelector('h2');
    expect(h2?.className).toContain('reader-heading-2');
  });

  it('renders horizontal rules', () => {
    const { container } = render(
      <MarkdownRenderer content={'Above\n\n---\n\nBelow'} variant="reader" />,
    );

    const hr = container.querySelector('hr');
    expect(hr).not.toBeNull();
    expect(hr!.className).toContain('divider');
  });

  it('renders empty content without crashing', () => {
    const { container } = render(<MarkdownRenderer content="" variant="blog" />);
    expect(container.textContent?.trim()).toBe('');
  });
});

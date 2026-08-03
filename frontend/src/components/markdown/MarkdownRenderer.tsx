import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Shared Markdown renderer backed by react-markdown + remark-gfm.
 *
 * Replaces the two duplicated hand-rolled parsers (BlogDetailPage and
 * GuidebookPage) with full GFM support: inline links, bold, italic, inline
 * code, fenced code blocks, tables, ordered/unordered lists, blockquotes,
 * and images.
 *
 * The `variant` prop maps the rendered elements to the existing CSS class
 * names so current styles continue to apply without changes.
 */

type Variant = 'blog' | 'reader';

interface MarkdownRendererProps {
  content: string;
  variant?: Variant;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  variant = 'blog',
}) => {
  const cls = (name: string) => `${variant}-${name}`;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: () => null, // Skip H1 — title rendered in page header.
        h2: ({ node: _node, ...props }) => <h2 className={cls('heading-2')} {...props} />,
        h3: ({ node: _node, ...props }) => <h3 className={cls('heading-3')} {...props} />,
        h4: ({ node: _node, ...props }) => <h4 className={cls('heading-4')} {...props} />,
        p: ({ node: _node, ...props }) => <p className={cls('paragraph')} {...props} />,
        a: ({ node: _node, ...props }) => (
          <a className={cls('link')} target="_blank" rel="noopener noreferrer" {...props} />
        ),
        ul: ({ node: _node, ...props }) => <ul className={cls('list')} {...props} />,
        ol: ({ node: _node, ...props }) => <ol className={cls('ordered-list')} {...props} />,
        li: ({ node: _node, ...props }) => <li className={cls('list-item')} {...props} />,
        blockquote: ({ node: _node, children, ...props }) => {
          // Detect TL;DR callouts (blockquote containing "TL;DR").
          const text = extractText(children);
          const isTldr = text.includes('TL;DR');
          return (
            <blockquote
              className={isTldr ? cls('tldr-callout') : cls('blockquote')}
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        code: ({ node: _node, className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className={cls('inline-code')} {...props}>
                {children}
              </code>
            );
          }
          return (
            <div className={cls('code-wrapper')}>
              <pre className={cls('code-block')}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },
        pre: ({ node: _node, children }) => <>{children}</>, // Wrap handled by `code` above.
        table: ({ node: _node, ...props }) => (
          <div className={variant === 'blog' ? 'blog-table-container' : 'table-responsive-container'}>
            <table className={cls('table')} {...props} />
          </div>
        ),
        hr: ({ node: _node, ...props }) => <hr className={cls('divider')} {...props} />,
        img: ({ node: _node, ...props }) => (
          <img className={cls('image')} loading="lazy" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

/** Recursively extract plain text from React children (for TL;DR detection). */
function extractText(children: React.ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children)) {
    return extractText(children.props.children);
  }
  return '';
}

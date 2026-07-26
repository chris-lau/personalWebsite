import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blogPosts';
import { BlogCard } from '../components/blog/BlogCard';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  const relatedPosts = useMemo(() => {
    return post ? getRelatedBlogPosts(post, 3) : [];
  }, [post]);

  if (!post) {
    return (
      <div className="page-container blog-detail-page">
        <div className="not-found-container">
          <h2>BLOG POST NOT FOUND</h2>
          <p>The requested article slug "{slug}" does not exist.</p>
          <Link to="/blog" className="back-link">
            &larr; Back to all blog posts
          </Link>
        </div>
      </div>
    );
  }

  // Helper to convert simple markdown headers & lists to readable styled layout blocks
  const renderMarkdownLines = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = (keyIndex: number) => {
      if (tableHeader.length > 0) {
        elements.push(
          <div key={`table-wrapper-${keyIndex}`} className="blog-table-container">
            <table className="blog-table">
              <thead>
                <tr>
                  {tableHeader.map((cell, i) => (
                    <th key={i}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIndex) => (
                  <tr key={rIndex}>
                    {row.map((cell, cIndex) => (
                      <td key={cIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableHeader = [];
      tableRows = [];
    };

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inTable) flushTable(index);
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="blog-code-block">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.trim().startsWith('|')) {
        // Table line
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // Skip divider line (e.g., | :--- | :--- |)
        if (cells.every((c) => /^[:-\s]+$/.test(c))) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable(index);
      }

      if (line.startsWith('# ')) {
        // Skip title as rendered in header
        return;
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="blog-heading-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="blog-heading-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="blog-list-item">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="blog-blockquote">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.trim() !== '' && line.trim() !== '---') {
        elements.push(
          <p key={index} className="blog-paragraph">
            {line}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }


    return elements;
  };

  return (
    <article className="page-container blog-detail-page">
      <nav className="blog-breadcrumb" aria-label="Breadcrumbs">
        <Link to="/blog" className="back-link">
          &larr; Back to all blog posts
        </Link>
      </nav>

      <header className="blog-detail-header">
        <div className="blog-detail-meta">
          <span className="blog-detail-date">Updated: {post.updatedDate}</span>
          <span className="blog-card-dot">•</span>
          <span className="blog-detail-readtime">{post.readTime}</span>
          <span className="blog-card-dot">•</span>
          <span className="blog-detail-author">By {post.author}</span>
        </div>
        <h1 className="blog-detail-title">{post.title}</h1>
        <div className="blog-card-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="blog-tag">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <hr className="blog-divider" />

      <div className="blog-detail-content">{renderMarkdownLines(post.content)}</div>

      {relatedPosts.length > 0 && (
        <section className="related-posts-section">
          <hr className="blog-divider" />
          <h2 className="related-posts-title">RELATED ARTICLES</h2>
          <div className="blog-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      <footer className="blog-detail-footer">
        <Link to="/blog" className="back-link">
          &larr; Back to all blog posts
        </Link>
      </footer>
    </article>
  );
};


import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blogPosts';
import { BlogCard } from '../components/blog/BlogCard';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import './Pages.css';

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

      <div className="blog-detail-content">
        <MarkdownRenderer content={post.content} variant="blog" />
      </div>

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


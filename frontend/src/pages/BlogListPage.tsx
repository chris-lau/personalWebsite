import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllBlogPosts, getAllBlogTags } from '../data/blogPosts';
import { BlogPost } from '../types/portfolio';
import './Pages.css';

/** Featured (latest) post — large editorial treatment, no box. */
const FeaturedPost = ({ post }: { post: BlogPost }) => (
  <article className="blog-featured">
    <div className="blog-featured__meta">
      <span className="blog-row__date">{post.updatedDate}</span>
      <span className="blog-row__dot" aria-hidden="true">·</span>
      <span>{post.readTime}</span>
      {post.tags.slice(0, 3).map((tag) => (
        <span key={tag} className="tech-tag">#{tag}</span>
      ))}
    </div>
    <h2 className="blog-featured__title">
      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
    </h2>
    <p className="blog-featured__excerpt">{post.description}</p>
    <Link to={`/blog/${post.slug}`} className="blog-featured__readlink">
      Read the post <ArrowRight size={13} aria-hidden="true" />
    </Link>
  </article>
);

/** Editorial index row: date column | title + excerpt | read time. */
const BlogRow = ({ post }: { post: BlogPost }) => (
  <article className="blog-row">
    <span className="blog-row__date">{post.updatedDate}</span>
    <div className="blog-row__body">
      <h3 className="blog-row__title">
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="blog-row__excerpt">{post.description}</p>
      <div className="tech-tags">
        {post.tags.map((tag) => (
          <span key={tag} className="tech-tag">#{tag}</span>
        ))}
      </div>
    </div>
    <span className="blog-row__readtime">{post.readTime}</span>
  </article>
);

export const BlogListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Newest first so the featured slot holds the latest post.
  const allPosts = useMemo(
    () => getAllBlogPosts().slice().sort((a, b) => b.updatedDate.localeCompare(a.updatedDate)),
    [],
  );
  const allTags = useMemo(() => ['All', ...getAllBlogTags()], []);

  const isFiltering = searchQuery.trim() !== '' || selectedTag !== 'All';

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || post.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [allPosts, searchQuery, selectedTag]);

  const [featured, ...rest] = allPosts;

  return (
    <div className="page-container blog-list-page">
      <header className="page-header">
        <h1 className="page-title">TECHNICAL BLOG</h1>
        <p className="page-subtitle">
          My build log from teaching myself modern frontend development — React architecture, testing strategy, and TypeScript — as a hands-on complement to my day job leading AI product and governance work. If you&apos;re here for the AI/PM side, start with /now or /experience.
        </p>
      </header>

      <div className="blog-filter-section">
        <div className="search-box">
          <input
            type="text"
            className="blog-search-input"
            placeholder="Search posts by keyword or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search blog posts"
          />
        </div>

        <div className="tag-filter-list">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag === 'All' ? '[All]' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      <div className="blog-results-meta">
        Showing {filteredPosts.length} of {allPosts.length} post{allPosts.length === 1 ? '' : 's'}
      </div>

      {isFiltering ? (
        <div className="blog-index">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <BlogRow key={post.id} post={post} />)
          ) : (
            <div className="no-posts-found">
              <p>No blog posts found matching your criteria.</p>
              <button
                className="tag-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('All');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="blog-index">
          {featured && <FeaturedPost post={featured} />}
          {rest.map((post) => (
            <BlogRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

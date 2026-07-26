import React, { useState, useMemo } from 'react';
import { getAllBlogPosts, getAllBlogTags, getGroupedBlogPostsByCategory } from '../data/blogPosts';
import { BlogCard } from '../components/blog/BlogCard';

export const BlogListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const allTags = useMemo(() => ['All', ...getAllBlogTags()], []);
  const groupedByCategory = useMemo(() => getGroupedBlogPostsByCategory(), []);

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

  return (
    <div className="page-container blog-list-page">
      <header className="page-header">
        <h1 className="page-title">TECHNICAL BLOG</h1>
        <p className="page-subtitle">
          Articles on React architecture, testing strategies, TypeScript, and modern web engineering.
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
        <div className="blog-posts-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <BlogCard key={post.id} post={post} />)
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
        <div className="blog-category-groups">
          {Object.entries(groupedByCategory).map(([category, posts]) => (
            <section key={category} className="blog-category-section">
              <h2 className="blog-category-title">{category}</h2>
              <div className="blog-posts-grid">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};


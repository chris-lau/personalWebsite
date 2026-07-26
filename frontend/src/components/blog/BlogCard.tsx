import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types/portfolio';
import './BlogCard.css';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <article className="blog-card" data-testid={`blog-card-${post.id}`}>
      <div className="blog-card-meta">
        <span className="blog-card-date">{post.date}</span>
        <span className="blog-card-dot">•</span>
        <span className="blog-card-readtime">{post.readTime}</span>
      </div>
      <h3 className="blog-card-title">
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="blog-card-description">{post.description}</p>
      <div className="blog-card-tags">
        {post.tags.map((tag) => (
          <span key={tag} className="blog-tag">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
};

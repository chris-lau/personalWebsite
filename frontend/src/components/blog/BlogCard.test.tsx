import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BlogCard } from './BlogCard';
import { BlogPost } from '../../types/portfolio';

const mockPost: BlogPost = {
  id: 'test-post',
  slug: 'test-post-slug',
  title: 'Test Blog Post Title',
  description: 'Test post description for unit testing.',
  updatedDate: '2026-07-26',
  readTime: '5 min read',

  tags: ['Testing', 'React'],
  author: 'Chris Lau',
  content: '# Test Content',
};

describe('BlogCard Component Unit Tests', () => {
  it('renders post title, date, description, and tags', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Blog Post Title')).toBeDefined();
    expect(screen.getByText('Test post description for unit testing.')).toBeDefined();
    expect(screen.getByText('Updated: 2026-07-26')).toBeDefined();
    expect(screen.getByText('5 min read')).toBeDefined();
    expect(screen.getByText('#Testing')).toBeDefined();
    expect(screen.getByText('#React')).toBeDefined();
  });

  it('links correctly to the post detail slug', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Test Blog Post Title' });
    expect(link.getAttribute('href')).toBe('/blog/test-post-slug');
  });
});

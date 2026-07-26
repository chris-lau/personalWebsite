import { describe, it, expect } from 'vitest';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostsByTag,
  getAllBlogTags,
} from './blogPosts';

describe('Blog Posts Data Layer Unit Tests', () => {
  it('returns all blog posts', () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(6);
  });

  it('retrieves a post by slug accurately', () => {
    const post = getBlogPostBySlug('demystifying-react-architecture-and-dev-tools');
    expect(post).toBeDefined();
    expect(post?.title).toContain('Demystifying Modern React Architecture');
  });

  it('returns undefined for non-existent slug', () => {
    const post = getBlogPostBySlug('non-existent-blog-slug');
    expect(post).toBeUndefined();
  });

  it('filters posts by tag correctly', () => {
    const reactPosts = getBlogPostsByTag('React');
    expect(reactPosts.length).toBeGreaterThan(0);
    reactPosts.forEach((post) => {
      expect(post.tags).toContain('React');
    });
  });

  it('returns all posts when filtering tag is "All"', () => {
    const allPosts = getBlogPostsByTag('All');
    expect(allPosts.length).toEqual(getAllBlogPosts().length);
  });

  it('collects unique list of all tags', () => {
    const tags = getAllBlogTags();
    expect(tags).toContain('React');
    expect(tags).toContain('TypeScript');
    expect(tags).toContain('Testing');
  });
});

# Building a Full-Featured Blog Engine in React & TypeScript: Architecture, Search, and Multi-Tier Testing

*A comprehensive, developer-friendly guide on how we designed, implemented, and tested a production-ready blog system in our React & TypeScript portfolio website.*

> **TL;DR**: Build a modular 4-tier blog system by separating TypeScript data contracts (`BlogPost`), a pure data query layer (`blogPosts.ts` + Vite `?raw` markdown imports), presentational cards vs page views (`BlogCard`, `BlogListPage`, `BlogDetailPage`), and multi-theme layout routing (`LayoutRenderer` + `App.tsx`).

---


## Table of Contents
1. [Introduction](#introduction)
2. [Architectural Overview: The 4-Tier Blueprint](#architectural-overview-the-4-tier-blueprint)
3. [Step 1: Designing the Data Contract (`BlogPost` Interface)](#step-1-designing-the-data-contract-blogpost-interface)
4. [Step 2: Building the Data Layer & Search Logic](#step-2-building-the-data-layer--search-logic)
5. [Step 3: Component Architecture (Presentational vs. Page Views)](#step-3-component-architecture-presentational-vs-page-views)
6. [Step 4: Layout & Routing Setup](#step-4-layout--routing-setup)
7. [Step 5: Writing Comprehensive Multi-Tier Tests](#step-5-writing-comprehensive-multi-tier-tests)
   - [Data Unit Tests (Vitest)](#data-unit-tests-vitest)
   - [Component & Integration Tests (React Testing Library)](#component--integration-tests-react-testing-library)
   - [End-to-End Browser Tests (Playwright)](#end-to-end-browser-tests-playwright)
8. [Conclusion & Key Takeaways](#conclusion--key-takeaways)

---

## Introduction

When expanding a modern web application, adding a new domain feature like a **Blog Engine** can quickly become messy if code is not cleanly structured. A common anti-pattern is jamming API calls, state management, search logic, markdown formatting, and styling all inside a single page component.

In this guide, we break down how we built the blog feature for our open-source multi-theme portfolio site. We will walk step-by-step through our clean architecture pattern, using real code snippets from the codebase (`personalWebsite/frontend`).

---

## Architectural Overview: The 4-Tier Blueprint

To keep the application modular, maintainable, and easy to test, we split the blog system into four explicit tiers:

```text
┌─────────────────────────────────────────────────────────┐
│ 1. Data Contracts (TypeScript Interfaces)               │
│    frontend/src/types/portfolio.ts                      │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│ 2. Data Layer & Search Utilities                        │
│    frontend/src/data/blogPosts.ts                       │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│ 3. Presentation & Page Components                       │
│    frontend/src/components/blog/BlogCard.tsx            │
│    frontend/src/pages/BlogListPage.tsx                  │
│    frontend/src/pages/BlogDetailPage.tsx                │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│ 4. Layout & Routing Layer                               │
│    frontend/src/components/layout/AsciiLayout.tsx       │
│    frontend/src/components/layout/CliLayout.tsx         │
│    frontend/src/App.tsx                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Designing the Data Contract (`BlogPost` Interface)

Before writing any user interface components, we define the exact TypeScript data contract for a blog post.

```typescript
// frontend/src/types/portfolio.ts

export interface BlogPost {
  id: string;          // Unique identifier
  slug: string;        // URL-friendly identifier (e.g. "demystifying-react-architecture")
  title: string;       // Full post headline
  description: string; // Summary blurb for post lists
  date: string;        // ISO publication date (YYYY-MM-DD)
  readTime: string;    // Estimated reading time (e.g. "6 min read")
  tags: string[];      // Topic tags (e.g. ["React", "TypeScript"])
  author: string;      // Author name
  content: string;     // Full markdown body text
  featured?: boolean;  // Optional flag for featured section highlights
}
```

### Why Start with Interfaces?
- **Type Safety**: Any component consuming a `BlogPost` gets full editor autocomplete and compile-time verification.
- **Contract Decoupling**: Components don't care where the data comes from—whether it is static memory, local files, or a remote API.

---

## Step 2: Building the Data Layer & Vite Raw Markdown Imports (`?raw`)

Instead of embedding multi-thousand-line string literals directly inside `blogPosts.ts` or forcing components to run complex asynchronous `fetch()` calls at runtime, we store markdown articles in individual `.md` files under `src/data/posts/` and leverage **Vite's Raw Asset Import capability (`?raw`)**:

```typescript
// frontend/src/data/blogPosts.ts
import { BlogPost } from '../types/portfolio';

// 1. Import markdown content strings cleanly using Vite's ?raw suffix
import buildingBlogEngineContent from './posts/blog-building-a-full-featured-react-blog-engine.md?raw';
import demystifyingArchitectureContent from './posts/blog-demystifying-react-architecture-and-dev-tools.md?raw';

// 2. Export metadata alongside imported content
export const blogPostsData: BlogPost[] = [
  {
    id: 'building-a-full-featured-react-blog-engine',
    slug: 'building-a-full-featured-react-blog-engine',
    title: 'Building a Full-Featured Blog Engine in React & TypeScript',
    description: 'A comprehensive guide on clean architecture, search, and multi-tier testing.',
    date: '2026-07-26',
    readTime: '8 min read',
    tags: ['React', 'TypeScript', 'Architecture', 'Testing'],
    author: 'Chris Lau',
    featured: true,
    content: buildingBlogEngineContent,
  },
  // ... other posts
];

// Helper Functions
export function getAllBlogPosts(): BlogPost[] {
  return blogPostsData;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsData.find((post) => post.slug === slug);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  if (!tag || tag === 'All') return blogPostsData;
  return blogPostsData.filter((post) => post.tags.includes(tag));
}

export function getAllBlogTags(): string[] {
  const tagsSet = new Set<string>();
  blogPostsData.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet);
}
```

### TypeScript Module Declaration (`vite-env.d.ts`)
To tell TypeScript how to handle `?raw` imports, we add a module declaration:

```typescript
// frontend/src/vite-env.d.ts
declare module '*.md?raw' {
  const content: string;
  export default content;
}
```

### Key Architectural Benefits:
1. **Single Source of Truth**: Editing a `.md` file in `src/data/posts/` automatically updates the site with zero manual copy-pasting into TypeScript strings.
2. **Ultra-Clean Codebase**: Reduced `blogPosts.ts` from ~800 lines down to ~100 lines.
3. **Zero Component Side Effects & Fast Unit Testing**: Pure functions mean `getBlogPostBySlug` and `getAllBlogTags` can be tested in milliseconds via Vitest.
4. **Compile-Time Bundling**: Vite bundles raw markdown text directly into JavaScript assets during `npm run build`, eliminating runtime network delays or loading spinners.




---

## Step 3: Component Architecture (Presentational vs. Page Views)

### A. Reusable Presentational Component (`BlogCard.tsx`)
`BlogCard` is a presentational component responsible for rendering a single post item preview.

```tsx
// frontend/src/components/blog/BlogCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types/portfolio';
import './BlogCard.css';

export const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <article className="blog-card" data-testid={`blog-card-${post.id}`}>
      <div className="blog-card-meta">
        <span>{post.date}</span> • <span>{post.readTime}</span>
      </div>
      <h3 className="blog-card-title">
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="blog-card-description">{post.description}</p>
      <div className="blog-card-tags">
        {post.tags.map((tag) => (
          <span key={tag} className="blog-tag">#{tag}</span>
        ))}
      </div>
    </article>
  );
};
```

### B. Blog List Page with Search & Filtering (`BlogListPage.tsx`)
`BlogListPage` combines state (`searchQuery`, `selectedTag`) with our data helper functions to deliver real-time filtering:

```tsx
// frontend/src/pages/BlogListPage.tsx
import React, { useState, useMemo } from 'react';
import { getAllBlogPosts, getAllBlogTags } from '../data/blogPosts';
import { BlogCard } from '../components/blog/BlogCard';

export const BlogListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const allTags = useMemo(() => ['All', ...getAllBlogTags()], []);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || post.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [allPosts, searchQuery, selectedTag]);

  return (
    <div className="page-container blog-list-page">
      <header className="page-header">
        <h1 className="page-title">TECHNICAL BLOG</h1>
      </header>

      <div className="blog-filter-section">
        <input
          type="text"
          className="blog-search-input"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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

      <div className="blog-posts-grid">
        {filteredPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
```

### C. Article Viewer Page (`BlogDetailPage.tsx`)
`BlogDetailPage` uses React Router's `useParams` hook to read the `:slug` path parameter from the URL, fetches the post via `getBlogPostBySlug(slug)`, and renders structured markdown content sections:

```tsx
// frontend/src/pages/BlogDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug } from '../data/blogPosts';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="page-container blog-detail-page">
        <h2>BLOG POST NOT FOUND</h2>
        <p>The requested article slug "{slug}" does not exist.</p>
        <Link to="/blog" className="back-link">&larr; Back to all blog posts</Link>
      </div>
    );
  }

  return (
    <article className="page-container blog-detail-page">
      <nav className="blog-breadcrumb">
        <Link to="/blog" className="back-link">&larr; Back to all blog posts</Link>
      </nav>

      <header className="blog-detail-header">
        <div className="blog-detail-meta">
          <span>{post.date}</span> • <span>{post.readTime}</span> • <span>By {post.author}</span>
        </div>
        <h1 className="blog-detail-title">{post.title}</h1>
      </header>

      <hr className="blog-divider" />
      <div className="blog-detail-content">{/* Render markdown blocks */}</div>
    </article>
  );
};
```


---

## Step 4: Layout & Routing Setup

### Connecting Routes (`App.tsx`)
We register `/blog` (list view) and `/blog/:slug` (detail view) inside `App.tsx`:

```tsx
// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { BlogListPage } from './pages/BlogListPage';
import { BlogDetailPage } from './pages/BlogDetailPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutRenderer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </LayoutRenderer>
    </ThemeProvider>
  );
};
```

Because routes are wrapped in `<LayoutRenderer>`, the blog page automatically adopts both **ASCII** and **CLI** themes dynamically!

---

## Step 5: Writing Comprehensive Multi-Tier Tests

A key requirement of our engineering workflow is verifying features at every level of the testing pyramid.

### 1. Data Unit Tests (`blogPosts.test.ts`)
Fast in-memory tests running in Vitest verifying filtering and data retrieval:

```typescript
// frontend/src/data/blogPosts.test.ts
import { describe, it, expect } from 'vitest';
import { getBlogPostBySlug, getBlogPostsByTag } from './blogPosts';

describe('Blog Posts Data Layer Unit Tests', () => {
  it('retrieves a post by slug accurately', () => {
    const post = getBlogPostBySlug('demystifying-react-architecture-and-dev-tools');
    expect(post).toBeDefined();
    expect(post?.author).toBe('Chris Lau');
  });

  it('filters posts by tag correctly', () => {
    const reactPosts = getBlogPostsByTag('React');
    expect(reactPosts.length).toBeGreaterThan(0);
  });
});
```

### 2. Component Integration Tests (`Pages.test.tsx`)
Testing component rendering and search input interaction using `@testing-library/react`:

```tsx
// frontend/src/pages/Pages.test.tsx
it('renders BlogListPage and filters by search input', () => {
  render(
    <MemoryRouter>
      <BlogListPage />
    </MemoryRouter>
  );

  expect(screen.getByText('TECHNICAL BLOG')).toBeDefined();

  const searchInput = screen.getByPlaceholderText(/Search posts/i);
  fireEvent.change(searchInput, { target: { value: 'Scaffolding' } });

  expect(screen.getByText(/Demystifying Modern React Scaffolding/i)).toBeDefined();
});
```

### 3. End-to-End Browser Tests (`portfolio.spec.ts`)
Testing full user navigation and slug routing in a real browser using Playwright:

```typescript
// frontend/e2e/portfolio.spec.ts
test('searches and navigates to blog post detail view', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: 'TECHNICAL BLOG' })).toBeVisible();

  // Search for post
  const searchInput = page.getByPlaceholder('Search posts by keyword or topic...');
  await searchInput.fill('Architecture');

  // Navigate to detail view
  await page.click('text=Demystifying Modern React Architecture');
  await expect(page).toHaveURL(/\/blog\/demystifying-react-architecture-and-dev-tools/);

  // Return to list
  await page.click('text=← Back to all blog posts');
  await expect(page).toHaveURL('/blog');
});
```

---

## Conclusion & Key Takeaways

By following a decoupled 4-tier design pattern:

1. **Type Safety First**: Defining `BlogPost` interfaces guarantees consistent data across layouts.
2. **Pure Data Utilities**: Separating search and filtering logic into plain TypeScript files makes unit testing simple and lightning fast.
3. **Dynamic Theme Inheritance**: Wrapping routes inside layout renderers allows new pages to instantly adapt to multi-theme design systems.
4. **Multi-Tiered Testing**: Combining Vitest unit tests with Playwright browser E2E tests provides 100% confidence before deploying to production.

Happy building! 🚀

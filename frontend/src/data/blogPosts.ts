import { BlogPost } from '../types/portfolio';

import buildingBlogEngineContent from './posts/blog-building-a-full-featured-react-blog-engine.md?raw';
import demystifyingArchitectureContent from './posts/blog-demystifying-react-architecture-and-dev-tools.md?raw';
import modularArchitectureContent from './posts/blog-modular-react-architecture-and-design-tokens.md?raw';
import testingStorybookA11yContent from './posts/blog-testing-storybook-and-a11y-react-architecture.md?raw';
import testingStrategyContent from './posts/blog-testing-strategy-vitest-happy-dom-and-playwright.md?raw';
import frontendFoundationsQAContent from './posts/blog-frontend-foundations-q-and-a.md?raw';
import demystifyingScaffoldingContent from './posts/blog-demystifying-react-scaffolding.md?raw';
import howToAddANewThemeContent from './posts/blog-how-to-add-a-new-theme.md?raw';
import howToPushProjectToGithubContent from './posts/blog-how-to-push-project-to-github.md?raw';

export const blogPostsData: BlogPost[] = [
  {
    id: 'how-to-push-project-to-github',
    slug: 'how-to-push-project-to-github',
    title: 'How to Push Your Project to GitHub: A Beginner\'s Complete Step-by-Step Guide',
    description: 'A beginner-friendly guide covering Git vs GitHub fundamentals, git init, .gitignore, staging, committing, and pushing using GitHub CLI or Web interface.',
    date: '2026-07-26',
    readTime: '5 min read',
    tags: ['Git', 'GitHub', 'Tooling', 'Beginner', 'CLI'],
    author: 'Chris Lau',
    featured: true,
    content: howToPushProjectToGithubContent,
  },
  {
    id: 'how-to-add-a-new-theme',
    slug: 'how-to-add-a-new-theme',
    title: 'How to Add a New Theme to a Modern React & TypeScript App: Design Tokens, Layouts, and Context',
    description: 'A developer-friendly step-by-step guide on expanding a multi-theme React application with CSS custom properties, type-safe Context, and E2E testing.',
    date: '2026-07-26',
    readTime: '6 min read',
    tags: ['React', 'TypeScript', 'CSS', 'Design System', 'Architecture'],
    author: 'Chris Lau',
    featured: true,
    content: howToAddANewThemeContent,
  },
  {
    id: 'building-a-full-featured-react-blog-engine',
    slug: 'building-a-full-featured-react-blog-engine',
    title: 'Building a Full-Featured Blog Engine in React & TypeScript: Architecture, Search, and Multi-Tier Testing',
    description: 'A comprehensive, developer-friendly guide on how we designed, implemented, and tested a production-ready blog system in our React & TypeScript portfolio website.',
    date: '2026-07-26',
    readTime: '8 min read',
    tags: ['React', 'TypeScript', 'Architecture', 'Testing'],
    author: 'Chris Lau',
    featured: true,
    content: buildingBlogEngineContent,
  },
  {
    id: 'demystifying-react-architecture-and-dev-tools',
    slug: 'demystifying-react-architecture-and-dev-tools',
    title: 'Demystifying Modern React Architecture: Data Contracts, Dev Servers, and Type-Safe State',
    description: 'A beginner-friendly deep dive into TypeScript interfaces, static data layers, and how modern dev tools like Vite actually work under the hood.',
    date: '2026-07-20',
    readTime: '6 min read',
    tags: ['React', 'TypeScript', 'Vite', 'Architecture'],
    author: 'Chris Lau',
    featured: true,
    content: demystifyingArchitectureContent,
  },
  {
    id: 'modular-react-architecture-and-design-tokens',
    slug: 'modular-react-architecture-and-design-tokens',
    title: 'Building a Scalable React Architecture: Design Tokens, Global State, and Type Contracts',
    description: 'A step-by-step developer\'s guide to building modular, multi-theme web applications with React, TypeScript, and CSS Custom Properties.',
    date: '2026-07-21',
    readTime: '7 min read',
    tags: ['React', 'CSS', 'Design System', 'Architecture'],
    author: 'Chris Lau',
    featured: true,
    content: modularArchitectureContent,
  },
  {
    id: 'testing-storybook-and-a11y-react-architecture',
    slug: 'testing-storybook-and-a11y-react-architecture',
    title: 'Modern Frontend Development: Component Architecture, Storybook, Accessibility, and Testing',
    description: 'A beginner-to-intermediate guide to building a modular, multi-theme React application with TypeScript, Storybook, Vitest, Playwright, and WCAG accessibility standards.',
    date: '2026-07-22',
    readTime: '8 min read',
    tags: ['Testing', 'Storybook', 'a11y', 'React'],
    author: 'Chris Lau',
    featured: true,
    content: testingStorybookA11yContent,
  },
  {
    id: 'testing-strategy-vitest-happy-dom-and-playwright',
    slug: 'testing-strategy-vitest-happy-dom-and-playwright',
    title: 'Testing Modern React Applications: From In-Memory Unit Tests to Real Browser Playwright E2E',
    description: 'A practical guide to building a comprehensive, multi-tier testing strategy using Vitest, React Testing Library, and Playwright E2E.',
    date: '2026-07-23',
    readTime: '7 min read',
    tags: ['Vitest', 'Playwright', 'Testing', 'React'],
    author: 'Chris Lau',
    featured: false,
    content: testingStrategyContent,
  },
  {
    id: 'frontend-foundations-q-and-a',
    slug: 'frontend-foundations-q-and-a',
    title: 'Teaching Code: Answers to Fundamental Frontend Development Questions',
    description: 'A comprehensive compilation of explanations and code-backed answers to essential developer questions on build tools, compilers, package.json, and the DOM.',
    date: '2026-07-24',
    readTime: '6 min read',
    tags: ['Tooling', 'TypeScript', 'Vite', 'Frontend'],
    author: 'Chris Lau',
    featured: false,
    content: frontendFoundationsQAContent,
  },
  {
    id: 'demystifying-react-scaffolding',
    slug: 'demystifying-react-scaffolding',
    title: 'Demystifying Modern React Scaffolding: From package.json to the Virtual DOM',
    description: 'A complete step-by-step walkthrough of modern React scaffolding, exploring how config files, Vite entry points, and virtual DOM nodes come together.',
    date: '2026-07-25',
    readTime: '7 min read',
    tags: ['React', 'Scaffolding', 'Vite', 'DOM'],
    author: 'Chris Lau',
    featured: false,
    content: demystifyingScaffoldingContent,
  },
];

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

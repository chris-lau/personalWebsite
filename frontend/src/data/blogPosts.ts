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
import masterTestingStrategyContent from './posts/blog-master-frontend-testing-strategy.md?raw';
import backendEngineerFrontendJourneyContent from './posts/blog-backend-engineer-learning-frontend-journey.md?raw';
import learningFrontendViaAiPairProgrammingContent from './posts/blog-learning-frontend-via-ai-pair-programming.md?raw';
import understandingSpaRoutingContent from './posts/blog-understanding-spa-routing-and-cloud-hosting.md?raw';

export const blogPostsData: BlogPost[] = [
  {
    id: 'understanding-spa-routing-and-cloud-hosting',
    slug: 'understanding-spa-routing-and-cloud-hosting',
    title: 'Demystifying SPA Routing: Why Client-Side Apps Break on Refresh and How to Fix It',
    description: 'A deep dive into Single Page Application routing mechanics, the HTML5 History API, server catch-all rules, and deploying React apps seamlessly to Cloudflare Pages.',
    updatedDate: '2026-07-26',
    readTime: '6 min read',
    tags: ['React', 'Routing', 'Cloudflare', 'Vite', 'DevOps', 'Architecture'],
    author: 'Chris Lau',
    category: 'React Architecture & Design Systems',
    featured: true,
    content: understandingSpaRoutingContent,
  },
  {
    id: 'learning-frontend-via-ai-pair-programming',
    slug: 'learning-frontend-via-ai-pair-programming',
    title: 'Pair Programming with AI: How a Backend TPM Mastered Modern Frontend Development',
    description: 'How to rapidly develop technical domain depth in React, TypeScript, and CSS as a TPM by pairing with AI in micro-steps, inspecting code diffs line-by-line, and asking deep architectural questions.',
    updatedDate: '2026-07-26',
    readTime: '7 min read',
    tags: ['AI', 'Pair Programming', 'React', 'TypeScript', 'TPM', 'Workflows'],
    author: 'Chris Lau',
    category: 'Developer Workflows & Tooling',
    featured: true,
    content: learningFrontendViaAiPairProgrammingContent,
  },
  {
    id: 'backend-engineer-learning-frontend-journey',
    slug: 'backend-engineer-learning-frontend-journey',
    title: 'A Backend TPM\'s Journey to Modern Frontend: Building a Multi-Theme React & TypeScript Portfolio',
    description: 'Reflections and core architectural lessons learned by a backend TPM building a production-ready, multi-theme React application to gain hands-on technical domain depth.',
    updatedDate: '2026-07-26',
    readTime: '8 min read',
    tags: ['Career', 'TPM', 'React', 'TypeScript', 'Architecture', 'Leadership'],
    author: 'Chris Lau',
    category: 'Developer Workflows & Tooling',
    featured: true,
    content: backendEngineerFrontendJourneyContent,
  },


  {
    id: 'master-frontend-testing-strategy',
    slug: 'master-frontend-testing-strategy',
    title: 'Master Frontend Testing Strategy: Vitest, React Testing Library, Storybook, and Playwright',
    description: 'A comprehensive, beginner-friendly deep dive into our 4-tier testing architecture, explaining why and how we combine Vitest, RTL, Storybook, and Playwright.',
    updatedDate: '2026-07-26',
    readTime: '9 min read',
    tags: ['Vitest', 'Playwright', 'Testing', 'React', 'Storybook', 'a11y'],
    author: 'Chris Lau',
    category: 'Testing & Quality Assurance',
    featured: true,
    content: masterTestingStrategyContent,
  },

  {
    id: 'how-to-push-project-to-github',
    slug: 'how-to-push-project-to-github',
    title: 'How to Push Your Project to GitHub: A Beginner\'s Complete Step-by-Step Guide',
    description: 'A beginner-friendly guide covering Git vs GitHub fundamentals, git init, .gitignore, staging, committing, and pushing using GitHub CLI or Web interface.',
    updatedDate: '2026-07-26',
    readTime: '5 min read',
    tags: ['Git', 'GitHub', 'Tooling', 'Beginner', 'CLI'],
    author: 'Chris Lau',
    category: 'Developer Workflows & Tooling',
    featured: true,
    content: howToPushProjectToGithubContent,
  },

  {
    id: 'how-to-add-a-new-theme',
    slug: 'how-to-add-a-new-theme',
    title: 'How to Add a New Theme to a Modern React & TypeScript App: Design Tokens, Layouts, and Context',
    description: 'A developer-friendly step-by-step guide on expanding a multi-theme React application with CSS custom properties, type-safe Context, and E2E testing.',
    updatedDate: '2026-07-26',
    readTime: '6 min read',
    tags: ['React', 'TypeScript', 'CSS', 'Design System', 'Architecture'],
    author: 'Chris Lau',
    category: 'React Architecture & Design Systems',
    featured: true,
    content: howToAddANewThemeContent,
  },
  {
    id: 'building-a-full-featured-react-blog-engine',
    slug: 'building-a-full-featured-react-blog-engine',
    title: 'Building a Full-Featured Blog Engine in React & TypeScript: Architecture, Search, and Multi-Tier Testing',
    description: 'A comprehensive, developer-friendly guide on how we designed, implemented, and tested a production-ready blog system in our React & TypeScript portfolio website.',
    updatedDate: '2026-07-26',
    readTime: '8 min read',
    tags: ['React', 'TypeScript', 'Architecture', 'Testing'],
    author: 'Chris Lau',
    category: 'React Architecture & Design Systems',
    featured: true,
    content: buildingBlogEngineContent,
  },
  {
    id: 'demystifying-react-architecture-and-dev-tools',
    slug: 'demystifying-react-architecture-and-dev-tools',
    title: 'Demystifying Modern React Architecture: Data Contracts, Dev Servers, and Type-Safe State',
    description: 'A beginner-friendly deep dive into TypeScript interfaces, static data layers, and how modern dev tools like Vite actually work under the hood.',
    updatedDate: '2026-07-26',
    readTime: '6 min read',
    tags: ['React', 'TypeScript', 'Vite', 'Architecture'],
    author: 'Chris Lau',
    category: 'React Architecture & Design Systems',
    featured: true,
    content: demystifyingArchitectureContent,
  },
  {
    id: 'modular-react-architecture-and-design-tokens',
    slug: 'modular-react-architecture-and-design-tokens',
    title: 'Building a Scalable React Architecture: Design Tokens, Global State, and Type Contracts',
    description: 'A step-by-step developer\'s guide to building modular, multi-theme web applications with React, TypeScript, and CSS Custom Properties.',
    updatedDate: '2026-07-26',
    readTime: '7 min read',
    tags: ['React', 'CSS', 'Design System', 'Architecture'],
    author: 'Chris Lau',
    category: 'React Architecture & Design Systems',
    featured: true,
    content: modularArchitectureContent,
  },
  {
    id: 'testing-storybook-and-a11y-react-architecture',
    slug: 'testing-storybook-and-a11y-react-architecture',
    title: 'Modern Frontend Development: Component Architecture, Storybook, Accessibility, and Testing',
    description: 'A beginner-to-intermediate guide to building a modular, multi-theme React application with TypeScript, Storybook, Vitest, Playwright, and WCAG accessibility standards.',
    updatedDate: '2026-07-26',
    readTime: '8 min read',
    tags: ['Testing', 'Storybook', 'a11y', 'React'],
    author: 'Chris Lau',
    category: 'Testing & Quality Assurance',
    featured: true,
    content: testingStorybookA11yContent,
  },
  {
    id: 'testing-strategy-vitest-happy-dom-and-playwright',
    slug: 'testing-strategy-vitest-happy-dom-and-playwright',
    title: 'Testing Modern React Applications: From In-Memory Unit Tests to Real Browser Playwright E2E',
    description: 'A practical guide to building a comprehensive, multi-tier testing strategy using Vitest, React Testing Library, and Playwright E2E.',
    updatedDate: '2026-07-26',
    readTime: '7 min read',
    tags: ['Vitest', 'Playwright', 'Testing', 'React'],
    author: 'Chris Lau',
    category: 'Testing & Quality Assurance',
    featured: false,
    content: testingStrategyContent,
  },
  {
    id: 'frontend-foundations-q-and-a',
    slug: 'frontend-foundations-q-and-a',
    title: 'Teaching Code: Answers to Fundamental Frontend Development Questions',
    description: 'A comprehensive compilation of explanations and code-backed answers to essential developer questions on build tools, compilers, package.json, and the DOM.',
    updatedDate: '2026-07-26',
    readTime: '6 min read',
    tags: ['Tooling', 'TypeScript', 'Vite', 'Frontend'],
    author: 'Chris Lau',
    category: 'Developer Workflows & Tooling',
    featured: false,
    content: frontendFoundationsQAContent,
  },
  {
    id: 'demystifying-react-scaffolding',
    slug: 'demystifying-react-scaffolding',
    title: 'Demystifying Modern React Scaffolding: From package.json to the Virtual DOM',
    description: 'A complete step-by-step walkthrough of modern React scaffolding, exploring how config files, Vite entry points, and virtual DOM nodes come together.',
    updatedDate: '2026-07-26',
    readTime: '7 min read',
    tags: ['React', 'Scaffolding', 'Vite', 'DOM'],
    author: 'Chris Lau',
    category: 'Developer Workflows & Tooling',
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

export function getGroupedBlogPostsByCategory(): Record<string, BlogPost[]> {
  const grouped: Record<string, BlogPost[]> = {};
  blogPostsData.forEach((post) => {
    const category = post.category || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(post);
  });
  return grouped;
}

export function getRelatedBlogPosts(currentPost: BlogPost, limit = 3): BlogPost[] {
  return blogPostsData
    .filter((post) => post.id !== currentPost.id)
    .map((post) => {
      let score = 0;
      if (post.category && post.category === currentPost.category) {
        score += 3;
      }
      const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
      score += sharedTags.length;
      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}


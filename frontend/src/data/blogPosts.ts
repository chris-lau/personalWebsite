import { BlogPost } from '../types/portfolio';
import rawBlogMeta from '../../../backend/data/blog_posts.json';

import buildingBlogEngineContent from '../../../backend/posts/blog-building-a-full-featured-react-blog-engine.md?raw';
import demystifyingArchitectureContent from '../../../backend/posts/blog-demystifying-react-architecture-and-dev-tools.md?raw';
import modularArchitectureContent from '../../../backend/posts/blog-modular-react-architecture-and-design-tokens.md?raw';
import testingStorybookA11yContent from '../../../backend/posts/blog-testing-storybook-and-a11y-react-architecture.md?raw';
import testingStrategyContent from '../../../backend/posts/blog-testing-strategy-vitest-happy-dom-and-playwright.md?raw';
import frontendFoundationsQAContent from '../../../backend/posts/blog-frontend-foundations-q-and-a.md?raw';
import demystifyingScaffoldingContent from '../../../backend/posts/blog-demystifying-react-scaffolding.md?raw';
import howToAddANewThemeContent from '../../../backend/posts/blog-how-to-add-a-new-theme.md?raw';
import howToPushProjectToGithubContent from '../../../backend/posts/blog-how-to-push-project-to-github.md?raw';
import masterTestingStrategyContent from '../../../backend/posts/blog-master-frontend-testing-strategy.md?raw';
import backendEngineerFrontendJourneyContent from '../../../backend/posts/blog-backend-engineer-learning-frontend-journey.md?raw';
import learningFrontendViaAiPairProgrammingContent from '../../../backend/posts/blog-learning-frontend-via-ai-pair-programming.md?raw';
import understandingSpaRoutingContent from '../../../backend/posts/blog-understanding-spa-routing-and-cloud-hosting.md?raw';
import whyIsItCalledReactContent from '../../../backend/posts/blog-why-is-it-called-react.md?raw';
import buildingLiveGithubDashboardContent from '../../../backend/posts/blog-building-live-github-dashboard-integration.md?raw';
import demystifyingFastapiScaffoldingContent from '../../../backend/posts/blog-demystifying-fastapi-backend-scaffolding.md?raw';
import whyEslintContent from '../../../backend/posts/blog-why-eslint-by-default-instead-of-biome.md?raw';
import whatRuffDoesContent from '../../../backend/posts/blog-what-ruff-does-python-linter.md?raw';
import demystifyingVenvContent from '../../../backend/posts/blog-demystifying-python-virtual-environments-venv.md?raw';
import demystifyingSecurityHeadersContent from '../../../backend/posts/blog-demystifying-http-security-headers-fastapi.md?raw';

const contentMap: Record<string, string> = {
  'blog-demystifying-http-security-headers-fastapi.md': demystifyingSecurityHeadersContent,
  'blog-demystifying-python-virtual-environments-venv.md': demystifyingVenvContent,
  'blog-why-eslint-by-default-instead-of-biome.md': whyEslintContent,
  'blog-what-ruff-does-python-linter.md': whatRuffDoesContent,
  'blog-demystifying-fastapi-backend-scaffolding.md': demystifyingFastapiScaffoldingContent,
  'blog-building-live-github-dashboard-integration.md': buildingLiveGithubDashboardContent,
  'blog-why-is-it-called-react.md': whyIsItCalledReactContent,
  'blog-understanding-spa-routing-and-cloud-hosting.md': understandingSpaRoutingContent,
  'blog-learning-frontend-via-ai-pair-programming.md': learningFrontendViaAiPairProgrammingContent,
  'blog-backend-engineer-learning-frontend-journey.md': backendEngineerFrontendJourneyContent,
  'blog-master-frontend-testing-strategy.md': masterTestingStrategyContent,
  'blog-how-to-add-a-new-theme.md': howToAddANewThemeContent,
  'blog-building-a-full-featured-react-blog-engine.md': buildingBlogEngineContent,
  'blog-demystifying-react-architecture-and-dev-tools.md': demystifyingArchitectureContent,
  'blog-modular-react-architecture-and-design-tokens.md': modularArchitectureContent,
  'blog-testing-storybook-and-a11y-react-architecture.md': testingStorybookA11yContent,
  'blog-testing-strategy-vitest-happy-dom-and-playwright.md': testingStrategyContent,
  'blog-frontend-foundations-q-and-a.md': frontendFoundationsQAContent,
  'blog-demystifying-react-scaffolding.md': demystifyingScaffoldingContent,
  'blog-how-to-push-project-to-github.md': howToPushProjectToGithubContent,
};

export const blogPostsData: BlogPost[] = (rawBlogMeta as Array<Omit<BlogPost, 'content'> & { markdownFile: string }>).map((item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  description: item.description,
  updatedDate: item.updatedDate,
  readTime: item.readTime,
  tags: item.tags,
  author: item.author,
  category: item.category,
  featured: item.featured,
  content: contentMap[item.markdownFile] || '',
}));

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

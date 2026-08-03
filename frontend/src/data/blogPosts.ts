import { BlogPost } from '../types/portfolio';
import rawBlogMeta from '../../../backend/data/blog_posts.json';

// Auto-discover all blog post markdown files at build time.
// Replaces 21 manual ?raw imports + a 22-entry contentMap that had to be kept in sync.
const markdownFiles = import.meta.glob<string>('../../../backend/posts/blog-*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Build a filename -> content lookup from the glob results.
const contentMap: Record<string, string> = {};
for (const [path, content] of Object.entries(markdownFiles)) {
  // Extract just the filename (e.g. "blog-foo.md") from the full path.
  const filename = path.split('/').pop() || '';
  contentMap[filename] = content;
}

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

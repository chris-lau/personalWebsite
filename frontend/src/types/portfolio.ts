export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Profile {
  name: string;
  handle: string;
  title: string;
  credentials?: string;
  location: string;
  bio: string;
  avatarUrl?: string | null;
  socials: SocialLink[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface NowState {
  lastUpdated: string;
  currentFocus: string;
  workingOn: string[];
  reading: string[];
  learning: string[];
}

export interface SiteArchitectureItem {
  name: string;
  desc: string;
}

export interface SiteArchitectureCategory {
  category: string;
  items: SiteArchitectureItem[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  updatedDate: string;
  readTime: string;
  tags: string[];
  author: string;
  content: string;
  category?: string;
  featured?: boolean;
}

export interface GuidebookChapter {
  id: string;
  number: number;
  title: string;
  subsections: string[];
  content: string;
}





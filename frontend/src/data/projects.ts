import { Project } from '../types/portfolio';

export const projectsData: Project[] = [
  {
    id: 'multi-agent-system',
    title: 'Multi-Agent System Platform',
    description: 'An AI-powered platform using multiple specialized agents to address complex tasks across different domains.',
    techStack: ['Python', 'LLM Agents', 'Task Orchestration'],
    githubUrl: 'https://github.com/chris-lau/multi-agent-system',
    featured: true,
  },
  {
    id: 'personal-os',
    title: 'Personal Portfolio Website',
    description: 'Triple-themed (Modern Editorial, ASCII Terminal & Retro CLI) personal website featuring a live GitHub Activity Dashboard, REST API integration, sessionStorage caching, and CSS Design Tokens.',
    techStack: ['React', 'TypeScript', 'GitHub API', 'Vite', 'CSS Tokens'],
    githubUrl: 'https://github.com/chris-lau/personalWebsite',
    featured: true,
  },
];




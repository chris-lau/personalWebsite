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
    id: 'critique-companion',
    title: 'Critique Companion',
    description: 'A developer & writer companion tool for structured feedback, analysis, and refinement workflows.',
    techStack: ['TypeScript', 'React', 'Node.js'],
    githubUrl: 'https://github.com/chris-lau/critique-companion',
    featured: true,
  },
  {
    id: 'personal-os',
    title: 'Personal OS Portfolio',
    description: 'Triple-themed (Modern Editorial, ASCII Terminal & Retro CLI) personal website built with React 18, TypeScript, Vite, and CSS Design Tokens.',
    techStack: ['React', 'TypeScript', 'Vite', 'CSS Tokens'],
    githubUrl: 'https://github.com/chris-lau/personalWebsite',
    featured: true,
  },
  {
    id: 'tokyo-2026',
    title: 'Tokyo 2026 Planner',
    description: 'Travel itinerary and interactive exploration application built with modern web technologies.',
    techStack: ['JavaScript', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/chris-lau/Tokyo2026',
    featured: false,
  },
];


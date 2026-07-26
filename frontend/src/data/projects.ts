import { Project } from '../types/portfolio';

export const projectsData: Project[] = [
  {
    id: 'personal-os',
    title: 'Personal OS Portfolio',
    description: 'Dual-themed (ASCII & CLI) portfolio website built with React, TypeScript, Vite, and CSS Tokens.',
    techStack: ['React', 'TypeScript', 'Vite', 'CSS Custom Properties'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: true,
  },
  {
    id: 'agentic-workflow-engine',
    title: 'Agentic Workflow Engine',
    description: 'A lightweight task orchestration framework for multi-agent LLM systems with step verification.',
    techStack: ['TypeScript', 'Node.js', 'Async Queue', 'JSON Schema'],
    githubUrl: 'https://github.com',
    featured: true,
  },
  {
    id: 'terminal-ui-kit',
    title: 'Terminal UI Component Kit',
    description: 'Accessible, responsive monospace React component library inspired by early terminal interfaces.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: false,
  },
];

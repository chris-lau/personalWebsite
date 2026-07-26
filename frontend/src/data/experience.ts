import { Experience } from '../types/portfolio';

export const experienceData: Experience[] = [
  {
    id: 'exp-1',
    role: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    startDate: '2023',
    endDate: 'Present',
    description: 'Leading frontend architecture and building scalable user-facing web tools.',
    highlights: [
      'Architected micro-frontend systems improving build and load times by 40%.',
      'Mentored engineering teams on modern React & TypeScript best practices.',
      'Designed end-to-end design token system supporting multi-theme rendering.',
    ],
  },
  {
    id: 'exp-2',
    role: 'Full Stack Engineer',
    company: 'Innovate Labs',
    location: 'San Francisco, CA',
    startDate: '2021',
    endDate: '2023',
    description: 'Developed full-stack web applications and developer tools.',
    highlights: [
      'Built high-throughput backend APIs handling 1M+ daily queries.',
      'Implemented real-time WebSocket communication features for team collaboration.',
    ],
  },
];

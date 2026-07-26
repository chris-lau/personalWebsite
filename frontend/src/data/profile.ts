import { Profile } from '../types/portfolio';

export const profileData: Profile = {
  name: 'Chris Lau',
  handle: 'chrislau',
  title: 'Software Engineer & Systems Architect',
  location: 'San Francisco, CA',
  bio: 'Building performant web applications, distributed systems, and agentic AI tools. Passionate about clean code, retro terminal UIs, and minimalist design systems.',
  avatarUrl: '/favicon.ico',
  socials: [
    { platform: 'GitHub', url: 'https://github.com' },
    { platform: 'LinkedIn', url: 'https://linkedin.com' },
    { platform: 'Twitter', url: 'https://x.com' },
    { platform: 'Email', url: 'mailto:hello@example.com' },
  ],
};

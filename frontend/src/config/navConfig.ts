export interface NavChildItem {
  path: string;
  modernLabel: string;
  cliLabel: string;
  asciiLabel: string;
}

export interface NavGroupItem {
  id: string;
  modernLabel: string;
  cliLabel: string;
  asciiLabel: string;
  path?: string; // If direct link (e.g. Contact)
  children?: NavChildItem[];
}

export const NAV_GROUPS: NavGroupItem[] = [
  {
    id: 'about',
    modernLabel: 'About',
    cliLabel: 'about/',
    asciiLabel: 'ABOUT',
    children: [
      {
        path: '/about',
        modernLabel: 'Bio & Profile',
        cliLabel: 'about.txt',
        asciiLabel: 'ABOUT',
      },
      {
        path: '/experience',
        modernLabel: 'Experience & Career',
        cliLabel: 'history.log',
        asciiLabel: 'EXP',
      },
      {
        path: '/now',
        modernLabel: 'What I\'m Doing Now',
        cliLabel: 'now.md',
        asciiLabel: 'NOW',
      },
    ],
  },
  {
    id: 'work',
    modernLabel: 'Work & Writing',
    cliLabel: 'work/',
    asciiLabel: 'WORK',
    children: [
      {
        path: '/projects',
        modernLabel: 'Projects',
        cliLabel: 'projects/',
        asciiLabel: 'PROJECTS',
      },
      {
        path: '/blog',
        modernLabel: 'Blog',
        cliLabel: 'blog/',
        asciiLabel: 'BLOG',
      },
      {
        path: '/guidebook',
        modernLabel: 'Book',
        cliLabel: 'book.md',
        asciiLabel: 'BOOK',
      },
    ],
  },
  {
    id: 'system',
    modernLabel: 'System & Ops',
    cliLabel: 'sys/',
    asciiLabel: 'SYS',
    children: [
      {
        path: '/how-this-site-works',
        modernLabel: 'Site Architecture',
        cliLabel: 'stack.md',
        asciiLabel: 'STACK',
      },
      {
        path: '/monitoring',
        modernLabel: 'Ops Dashboard',
        cliLabel: 'top.sh',
        asciiLabel: 'OPS',
      },
    ],
  },
  {
    id: 'contact',
    modernLabel: 'Contact',
    cliLabel: 'contact.sh',
    asciiLabel: 'CONTACT',
    path: '/contact',
  },
];

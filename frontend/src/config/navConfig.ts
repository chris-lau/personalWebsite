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
  path?: string; // If direct link (e.g. Contact, Projects, Experience)
  children?: NavChildItem[];
}

export const NAV_GROUPS: NavGroupItem[] = [
  {
    id: 'experience',
    modernLabel: 'Experience',
    cliLabel: 'experience/',
    asciiLabel: 'EXP',
    path: '/experience',
  },
  {
    id: 'projects',
    modernLabel: 'Projects',
    cliLabel: 'projects/',
    asciiLabel: 'PROJECTS',
    path: '/projects',
  },
  {
    id: 'about',
    modernLabel: 'About',
    cliLabel: 'about/',
    asciiLabel: 'ABOUT',
    children: [
      {
        path: '/about',
        modernLabel: 'Bio & Skills',
        cliLabel: 'about.txt',
        asciiLabel: 'ABOUT',
      },
      {
        path: '/now',
        modernLabel: "What I'm Doing Now",
        cliLabel: 'now.md',
        asciiLabel: 'NOW',
      },
      {
        path: '/blog',
        modernLabel: 'Blog',
        cliLabel: 'blog/',
        asciiLabel: 'BLOG',
      },
      {
        path: '/guidebook',
        modernLabel: 'Engineering Guidebook',
        cliLabel: 'book.md',
        asciiLabel: 'BOOK',
      },
    ],
  },
  {
    id: 'lab',
    modernLabel: 'Lab',
    cliLabel: 'lab/',
    asciiLabel: 'LAB',
    children: [
      {
        path: '/how-this-site-works',
        modernLabel: 'How This Site Works',
        cliLabel: 'stack.md',
        asciiLabel: 'STACK',
      },
      {
        path: '/monitoring',
        modernLabel: 'Live Ops Dashboard',
        cliLabel: 'top.sh',
        asciiLabel: 'OPS',
      },
      {
        path: '/amazon-tools',
        modernLabel: 'Amazon Seller Suite',
        cliLabel: 'amazon-tools.sh',
        asciiLabel: 'AMZ-TOOLS',
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

export interface NavChildItem {
  path: string;
  label: string;
}

export interface NavGroupItem {
  id: string;
  label: string;
  path?: string; // If direct link (e.g. Contact, Projects, Experience)
  children?: NavChildItem[];
}

export const NAV_GROUPS: NavGroupItem[] = [
  {
    id: 'experience',
    label: 'Experience',
    path: '/experience',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
  },
  {
    id: 'about',
    label: 'About',
    children: [
      {
        path: '/about',
        label: 'Bio & Skills',
      },
      {
        path: '/now',
        label: "What I'm Doing Now",
      },
      {
        path: '/blog',
        label: 'Blog',
      },
      {
        path: '/guidebook',
        label: 'Engineering Guidebook',
      },
    ],
  },
  {
    id: 'lab',
    label: 'Lab',
    children: [
      {
        path: '/how-this-site-works',
        label: 'How This Site Works',
      },
      {
        path: '/monitoring',
        label: 'Live Ops Dashboard',
      },
      {
        path: '/amazon-tools',
        label: 'Amazon Seller Suite',
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
  },
];

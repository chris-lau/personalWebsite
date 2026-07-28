import { GuidebookChapter } from '../types/portfolio';
import guidebookMasterContent from './posts/guidebook-master.md?raw';

export const getGuidebookMasterContent = (): string => {
  return guidebookMasterContent;
};

export const guidebookChapters: GuidebookChapter[] = [
  {
    id: 'chapter-1',
    number: 1,
    title: 'The Modern Frontend Ecosystem & Project Setup',
    subsections: [
      '1.1 Understanding the Stack: React, TypeScript, Vite, and Node.js',
      '1.2 The Standard 7 Boilerplate Files Explained',
      '1.3 Step-by-Step Project Initialization',
    ],
    content: `## Chapter 1: The Modern Frontend Ecosystem & Project Setup

### 1.1 Understanding the Stack

Before writing a single line of code, let's break down the role of each tool in a modern frontend project:

- **React**: A JavaScript library for building user interfaces using declarative **Components**. Instead of manually manipulating web page elements (like in jQuery or raw HTML), you write components that re-render automatically when data changes.
- **TypeScript**: A strongly typed superset of JavaScript. It acts as an automated safety net, catching bugs (like typos, missing properties, or incorrect data types) *before* you run your code in a browser.
- **Vite** *(pronounced "veet")*: A lightning-fast modern build tool and local development server. It compiles your TypeScript code and reloads the browser in under 10 milliseconds when you save changes.
- **\`npm\` (Node Package Manager)**: The package manager used to install third-party libraries (like React, icons, and routers).

---

### 1.2 The Standard 7 Boilerplate Files

When initializing a modern Vite + React + TypeScript application, 7 core configuration and entry files form the backbone of the project:

| File Name | Purpose & Responsibility |
| :--- | :--- |
| **\`index.html\`** | The single HTML file served to the browser. Contains \`<div id="root"></div>\` where React mounts. |
| **\`package.json\`** | The project manifest file listing all installed dependencies (\`react\`, \`vite\`), dev tools, and runnable scripts (\`npm run dev\`, \`npm test\`). |
| **\`tsconfig.json\`** | The compiler configuration file telling TypeScript how strictly to check your code and how to parse JSX. |
| **\`vite.config.ts\`** | The Vite build server configuration file (sets server port, React plugins, and test environment rules). |
| **\`src/main.tsx\`** | The **Application Entry Point**. Connects React to the HTML DOM (\`ReactDOM.createRoot\`), wraps the app in top-level providers, and imports global CSS. |
| **\`src/App.tsx\`** | The **Root Component Shell**. Holds top-level layout containers, theme providers, and page navigation routes. |
| **\`src/vite-env.d.ts\`** | TypeScript type declarations for Vite environment features (e.g. \`import.meta.env\` and raw static imports). |

---

### 1.3 Step-by-Step Project Initialization

To create a new Vite + React + TypeScript project from scratch:

\`\`\`bash
# 1. Create a new Vite app using the React-TS template
npm create vite@latest my-app -- --template react-ts

# 2. Navigate into the project folder
cd my-app

# 3. Install core dependencies
npm install react react-dom react-router-dom lucide-react

# 4. Start the local development server
npm run dev
\`\`\`

Your browser will automatically open \`http://localhost:3000\` with instant Hot Module Replacement (HMR) enabled!`,
  },
  {
    id: 'chapter-2',
    number: 2,
    title: 'Design Tokens & CSS Architecture',
    subsections: [
      '2.1 What Are Design Tokens?',
      '2.2 CSS Custom Properties (var(--token))',
      '2.3 Separation of Concerns: variables.css vs global.css',
      '2.4 Accessibility & Contrast Ratios (WCAG AA)',
    ],
    content: `## Chapter 2: Design Tokens & CSS Architecture

### 2.1 What Are Design Tokens?

Design tokens are key-value pairs that store visual design decisions (colors, fonts, line heights, spacing) in a centralized location. Instead of hardcoding hex colors like \`#121316\` or \`#f4ab6a\` across dozens of CSS files, you store them in variable names like \`--bg-primary\` or \`--accent-primary\`.

### 2.2 CSS Custom Properties (\`var(--token)\`)

Native CSS custom properties allow web applications to change visual themes dynamically without rewriting component code or loading new CSS stylesheets:

\`\`\`css
/* Define design tokens under theme data attributes */
[data-theme="modern"] {
  --bg-primary: #121316;
  --text-primary: #f4f4f6;
  --accent-primary: #f4ab6a;
}

[data-theme="ascii"] {
  --bg-primary: #181616;
  --text-primary: #f2e3c6;
  --accent-primary: #d97457;
}

/* UI components consume tokens dynamically */
.card {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--accent-primary);
}
\`\`\`

---

### 2.3 Separation of Concerns: \`variables.css\` vs \`global.css\`

In a clean frontend architecture, split CSS responsibilities into two distinct layers:

1. **\`variables.css\` (Design Tokens)**: Contains ONLY color palettes, font stacks, and layout constraints grouped by theme selectors. No HTML element styling or resets belong here.
2. **\`global.css\` (Universal Resets & Measure)**: Contains CSS resets (\`box-sizing: border-box\`), HTML/body resets, and baseline typography measure (\`max-width: 70ch\`).

---

### 2.4 Accessibility & Contrast Ratios (WCAG AA)

Web Content Accessibility Guidelines (WCAG 2.1 AA) require a minimum color contrast ratio of **4.5:1** for standard body text and **3.0:1** for large headings and interactive UI buttons. When selecting theme colors, always verify contrast against background surfaces using WCAG contrast calculators.`,
  },
  {
    id: 'chapter-3',
    number: 3,
    title: 'Data Architecture & The Repository Pattern',
    subsections: [
      '3.1 Defining Data Contracts in src/types/',
      '3.2 Decoupling Content with src/data/',
      '3.3 The Repository Pattern (blogPosts.ts)',
      '3.4 .ts vs .tsx File Extensions',
    ],
    content: `## Chapter 3: Data Architecture & The Repository Pattern

### 3.1 Defining Data Contracts in \`src/types/\`

Never write UI components that consume unstructured JavaScript objects. Always define explicit **TypeScript Interfaces** to establish strict data contracts:

\`\`\`typescript
// src/types/portfolio.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}
\`\`\`

---

### 3.2 Decoupling Content with \`src/data/\`

Never hardcode copy or text directly inside JSX templates. Move text and static data into dedicated modules under \`src/data/\` that import your TypeScript interfaces. This ensures that if you redesign your UI components or switch themes, your underlying data remains untouched.

---

### 3.3 The Repository Pattern (\`blogPosts.ts\`)

Instead of making components query array data directly with messy inline \`.filter()\` or \`.find()\` logic, wrap data lookups in clean service helper functions:

\`\`\`typescript
export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPostsData.find((post) => post.slug === slug);
};
\`\`\`

This decouples presentation from data retrieval, making future migrations to REST APIs, GraphQL, or headless CMS backends seamless.

---

### 3.4 \`.ts\` vs \`.tsx\` File Extensions

- **\`.ts\`**: Used for pure TypeScript files (type interfaces, utility helpers, data query repositories, unit test files).
- **\`.tsx\`**: Used exclusively for files that render **JSX syntax** (React components and layout wrappers).`,
  },
  {
    id: 'chapter-4',
    number: 4,
    title: 'React State Management & Theme Engine',
    subsections: [
      '4.1 What Problem Does React Context Solve?',
      '4.2 Building a 3-Way Theme Switcher (ThemeContext.tsx)',
      '4.3 Persisting State with localStorage',
    ],
    content: `## Chapter 4: React State Management & Theme Engine

### 4.1 What Problem Does React Context Solve?

In React, data flows downward from parent components to child components via **props**. When state is needed by many components across different parts of the application (like active theme, user auth, or language), passing props through every intermediate component is called **Prop Drilling**.

React Context creates a global state channel that any component can subscribe to directly without passing props through intermediate parents.

---

### 4.2 Building a 3-Way Theme Switcher (\`ThemeContext.tsx\`)

\`\`\`tsx
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('modern');

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('portfolio_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

---

### 4.3 Persisting State with \`localStorage\`

By saving state changes to browser \`localStorage\`, the user's selected theme choice persists across page refreshes and future browsing sessions.`,
  },
  {
    id: 'chapter-5',
    number: 5,
    title: 'Single Page Application (SPA) Routing',
    subsections: [
      '5.1 Multi-Page Apps vs Single Page Applications (SPAs)',
      '5.2 The 3-Layer Routing Architecture (react-router-dom)',
      '5.3 Dynamic Slugs & 404 Route Fallbacks',
    ],
    content: `## Chapter 5: Single Page Application (SPA) Routing

### 5.1 Multi-Page Apps vs Single Page Applications (SPAs)

- **Traditional Multi-Page Apps (MPA)**: Every click sends a request to the server, resulting in a full white-screen browser refresh.
- **Single Page Applications (SPA)**: The browser downloads a single HTML shell once. Navigating between routes updates the address bar via the HTML5 History API and swaps React components instantly in milliseconds without server round-trips.

---

### 5.2 The 3-Layer Routing Architecture (\`react-router-dom\`)

1. **Router Shell (\`src/main.tsx\`)**: \`<BrowserRouter>\` listens to URL changes in the browser address bar.
2. **Route Switch (\`src/App.tsx\`)**: \`<Routes>\` maps URL paths to Page components:
   \`\`\`tsx
   <Routes>
     <Route path="/" element={<HomePage />} />
     <Route path="/about" element={<AboutPage />} />
     <Route path="/blog/:slug" element={<BlogDetailPage />} />
     <Route path="*" element={<NotFoundPage />} />
   </Routes>
   \`\`\`
3. **Client Navigation Link (\`<Link to="...">\`)**: Intercepts link clicks to perform instant client-side route transitions without reloading the page.`,
  },
  {
    id: 'chapter-6',
    number: 6,
    title: 'Modern Testing Strategy & The Testing Pyramid',
    subsections: [
      '6.1 The 3 Tiers of Frontend Testing (Unit, Integration, E2E)',
      '6.2 Unit & Integration Testing with Vitest + React Testing Library',
      '6.3 Isolated Component Workshops with Storybook 8',
      '6.4 Real Browser End-to-End Testing with Playwright',
    ],
    content: `## Chapter 6: Modern Testing Strategy & The Testing Pyramid

### 6.1 The 3 Tiers of Frontend Testing

A robust frontend testing strategy follows the **Testing Pyramid**:

1. **Unit Tests (Vitest)**: Test isolated helper functions, algorithms, and data repositories in milliseconds.
2. **Component Integration Tests (Vitest + React Testing Library)**: Test components in a simulated DOM (\`happy-dom\`), verifying user interactions like button clicks, form fills, and state changes.
3. **End-to-End (E2E) Tests (Playwright)**: Launch real browser instances (Chromium, Firefox, WebKit) to verify complete multi-page user journeys and theme switching under real browser conditions.

---

### 6.2 Component Testing Example with React Testing Library

\`\`\`tsx
it('renders page and handles tag filtering', () => {
  render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>
  );

  const reactTag = screen.getByRole('button', { name: '#React' });
  fireEvent.click(reactTag);
  expect(reactTag.className).toContain('active');
});
\`\`\``,
  },
  {
    id: 'chapter-7',
    number: 7,
    title: 'Building a Dynamic Blog Engine & Content Processing',
    subsections: [
      '7.1 Vite Raw Asset Imports (?raw)',
      '7.2 Markdown Content Processing & Custom Table Parsers',
      '7.3 Content Recommendations & Related Article Algorithms',
    ],
    content: `## Chapter 7: Building a Dynamic Blog Engine & Content Processing

### 7.1 Vite Raw Asset Imports (\`?raw\`)

Vite allows importing raw markdown file text directly into JavaScript components at build time using the \`?raw\` query parameter:

\`\`\`typescript
import articleContent from './posts/blog-article.md?raw';
\`\`\`

This eliminates the need for expensive external database queries or runtime CMS fetches for static tech blogs.

---

### 7.2 Related Article Recommendation Algorithm

To recommend related articles, compute tag overlap scores between posts:

\`\`\`typescript
export const getRelatedBlogPosts = (currentPost: BlogPost, limit = 3): BlogPost[] => {
  return blogPostsData
    .filter((post) => post.id !== currentPost.id)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
      return { post, score: sharedTags.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
};
\`\`\``,
  },
  {
    id: 'chapter-8',
    number: 8,
    title: 'UX Polish, Accessibility SME Rules & Cloudflare Pages Deployment',
    subsections: [
      '8.1 Accessibility Skip Navigation (#main-content)',
      '8.2 Accessible Segmented Controls (role="radiogroup")',
      '8.3 Mobile Responsive Drawers & Touch Targets',
      '8.4 Deploying SPAs to Cloudflare Pages (_redirects SPA Fallbacks)',
    ],
    content: `## Chapter 8: UX Polish, Accessibility SME Rules & Cloudflare Pages Deployment

### 8.1 Accessibility Skip Navigation (\`#main-content\`)

Keyboard and screen-reader users rely on a **Skip Link** to bypass header navigation links on every page load:

\`\`\`html
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  <!-- Page Content -->
</main>
\`\`\`

---

### 8.2 Accessible Segmented Controls

When building multi-state selectors (like a theme toggle), use ARIA radiogroup roles:

\`\`\`tsx
<div role="radiogroup" aria-label="Theme Selection">
  <button role="radio" aria-checked={theme === 'modern'}>MODERN</button>
  <button role="radio" aria-checked={theme === 'ascii'}>ASCII</button>
  <button role="radio" aria-checked={theme === 'cli'}>CLI</button>
</div>
\`\`\`

---

### 8.3 Deploying SPAs to Cloudflare Pages (\`_redirects\`)

In a Single Page Application, client-side routes (like \`/blog\` or \`/projects\`) do not exist as physical HTML files on the server. To prevent 404 errors when users refresh sub-pages directly, place a \`_redirects\` file in your build folder:

\`\`\`text
/*  /index.html  200
\`\`\`

This instructs Cloudflare Pages to serve \`index.html\` with a \`200\` OK status code for all requests, allowing React Router to handle the route client-side!`,
  },
  {
    id: 'chapter-9',
    number: 9,
    title: 'Consuming External REST APIs & Client-Side Caching',
    subsections: [
      '9.1 Decoupling Raw API Payloads from View Models',
      '9.2 Handling Rate Limits with sessionStorage Caching',
      '9.3 Encapsulating Async Lifecycles in Custom React Hooks',
      '9.4 Tabbed UI Integration & Storybook Visual Workshops',
    ],
    content: `## Chapter 9: Consuming External REST APIs & Client-Side Caching

### 9.1 Decoupling Raw API Payloads from View Models

When integrating third-party APIs (such as GitHub's REST API \`api.github.com/users/{username}\`), raw JSON responses contain dozens of unused or unstable fields.

To protect UI components from API contract breakage, decouple raw API schemas from clean View Models:

\`\`\`typescript
// Raw API contract matching external service schema
export interface GitHubRepoResponse {
  id: number;
  name: string;
  stargazers_count: number;
  pushed_at: string;
}

// Clean View Model consumed by React UI components
export interface GitHubRepo {
  id: number;
  name: string;
  stars: number;
  formattedLastUpdated: string;
  isRecentlyUpdated: boolean; // Precomputed: updated within last 30 days
}
\`\`\`

---

### 9.2 Handling Rate Limits with \`sessionStorage\` Caching

Unauthenticated public API calls are often subject to strict IP rate limits (e.g. 60 req/hr on GitHub). To prevent quota exhaustion:

1. Check \`sessionStorage\` before firing \`fetch()\`.
2. Save successful JSON payloads with a timestamp and a 15-minute TTL (Time-To-Live).

\`\`\`typescript
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const cacheKey = \`gh_user_\\\${username.toLowerCase()}\`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data; // Return cached payload instantly!
    }
  }

  const response = await fetch(\`https://api.github.com/users/\\\${encodeURIComponent(username)}\`);
  const rawData = await response.json();
  const transformed = transformUser(rawData);

  sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: transformed }));
  return transformed;
}
\`\`\`

---

### 9.3 Encapsulating Async Lifecycles in Custom React Hooks

Move asynchronous state management (\`loading\`, \`error\`, \`data\`, \`refetch\`) out of UI components and into reusable custom hooks:

\`\`\`typescript
export function useGitHubData(initialUsername = 'chris-lau') {
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([fetchGitHubUser(username), fetchGitHubRepos(username)])
      .then(([userData, reposData]) => {
        if (isMounted) {
          setUser(userData);
          setRepos(reposData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [username]);

  return { username, setUsername, user, repos, loading, error };
}
\`\`\`

---

### 9.4 Tabbed UI Integration & Storybook Visual Workshops

1. **Accessible Tab Control**: Use \`role="tablist"\` and \`role="tab"\` buttons to switch between static curated portfolio projects and dynamic live API feeds (\`<GitHubDashboard />\`).
2. **Storybook Stories**: Write \`.stories.tsx\` files to visual-test API UI components with mock payload states across all visual themes (\`Modern Editorial\`, \`Warm ASCII\`, and \`Retro CLI\`).`,
  },
];

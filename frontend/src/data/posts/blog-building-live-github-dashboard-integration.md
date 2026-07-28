# Building a Live GitHub Activity Dashboard: A Step-by-Step Architectural Deep Dive

Modern portfolio websites often suffer from static obsolescence: projects featured on the home page reflect a snapshot in time rather than active development. To solve this, we integrated a live, real-time **GitHub Activity & Repository Dashboard** directly into our portfolio website.

In this guide, we walk through the step-by-step implementation of this feature—explaining the architectural concepts, design trade-offs, and why specific engineering decisions were made at each layer of the application.

---

## The Architectural Blueprint

Before writing code, we designed a clean separation of concerns across 6 distinct phases:

```text
[ GitHub REST API ]
        │ (60 req/hr limit)
        ▼
[ API Client & sessionStorage Cache ]  <-- Step 2 (15-min TTL per username)
        │
        ▼
[ Custom React Hook: useGitHubData ]   <-- Step 3 (Reactive state management)
        │
        ▼
[ Container: GitHubDashboard ]          <-- Step 4 (UI components & Storybook)
        │
        ▼
[ ProjectsPage Tab Navigation ]        <-- Step 5 (Tabbed integration)
```

---

## Visual Call Flow & Reactive Component Updates

The diagram below illustrates the exact sequence of events and reactive state updates when a visitor clicks the **`🐙 Live GitHub Activity`** tab on the Projects page:

```text
[ USER CLICKS "🐙 Live GitHub Activity" TAB ]
                     │
                     ▼
           ProjectsPage.tsx (state: activeTab = 'github')
                     │
                     ▼ Mounts Container
            <GitHubDashboard />
                     │
                     ▼ Calls Custom Hook
              useGitHubData()
                     │
     ┌───────────────┴───────────────┐
     ▼                               ▼
1. Initial Render (Sync)        2. useEffect Triggers (Async)
   loading = true                  loadData('chris-lau')
   user = null                        │
   repos = []                         ▼
   │                            fetchGitHubUser() & fetchGitHubRepos()
   ▼                                  │
Renders <GitHubSpinner />             ▼ Checks sessionStorage
                                Cached? ──YES──> Returns cached data instantly
                                   │
                                  NO
                                   │
                                   ▼
                                Live fetch('api.github.com/users/chris-lau')
                                   │
                                   ▼ Data Transformed & Sanitized
                                State Update:
                                user = { displayName: 'Chris Lau', ... }
                                repos = [ { name: 'personalWebsite', ... } ]
                                loading = false
                                   │
                                   ▼
                       RE-RENDER COMPONENT TREE
                                   │
     ┌──────────────────┬──────────┴──────────┬──────────────────┐
     ▼                  ▼                     ▼                  ▼
<GitHubUsernameSelector> <GitHubSummary>   <GitHubFilters>     <GitHubRepoCard>
[Search & Presets]   [Avatar & Stats]   [Search & 30d Pill] [Repo Cards]
```

### How React Component State Updates Flow:

1. **Tab Switch & Mounting**: Clicking `Live GitHub Activity` updates `ProjectsPage` state (`activeTab = 'github'`), unmounting the featured projects list and mounting `<GitHubDashboard />`.
2. **Hook Execution**: `<GitHubDashboard />` invokes `useGitHubData()`. On initial synchronous render, `loading = true`, causing `<GitHubDashboard />` to render a loading spinner.
3. **Asynchronous Data Retrieval**: `useGitHubData`'s `useEffect` fires `loadData('chris-lau')`. The API service checks `sessionStorage` for key `gh_user_chris-lau`:
   * **Cache Hit**: Resolves immediately without network traffic.
   * **Cache Miss**: Executes `Promise.all()` fetching profile and repository arrays from `api.github.com`.
4. **Reactive Re-render**: Calling `setUser()`, `setRepos()`, and `setLoading(false)` triggers React's reconciliation engine:
   * **`<GitHubUsernameSelector />`** updates active chip highlighting (`@chris-lau`).
   * **`<GitHubSummary />`** receives `user` object and paints avatar, bio, follower counters, and top language bar.
   * **`<GitHubFilters />`** extracts available languages into a dropdown.
   * **`<GitHubRepoCard />`** maps over `filteredAndSortedRepos` to render repository cards with `🔥 Active` 30-day badges.


---

## Step 1: Data Modeling & Schema Transformation

### Why Separate Raw API Payloads from View Models?

When integrating third-party APIs (like GitHub's `https://api.github.com/users/{username}/repos`), raw API payloads contain hundreds of fields (e.g., `node_id`, `stargazers_count`, `has_discussions`, `owner.gravatar_id`) that UI components do not need.

Instead of passing raw JSON objects directly into components, we defined explicit TypeScript view models in [`src/types/github.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/types/github.ts):

```typescript
// Raw API payload type matching GitHub REST API v3
export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
}

// Clean View Model consumed by React UI components
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  githubUrl: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  formattedLastUpdated: string; // Precomputed: "3 days ago"
  isRecentlyUpdated: boolean;    // Precomputed: Pushed/updated within past 30 days
}
```

### Key Insight: Precomputing UI Flags at the Data Boundary
By computing `isRecentlyUpdated` (checking if `pushed_at` is within the last 30 days) during the API transformation step rather than inside React render loops, we ensure:
1. **0 duplicate date parsing math** during re-renders.
2. **Simplified UI logic**: Components simply read `repo.isRecentlyUpdated` to render glowing `🔥 Active` badges.

---

## Step 2: API Service & Caching Layer

### Overcoming GitHub API Rate Limits with `sessionStorage`

Unauthenticated GET requests to the GitHub REST API are limited to **60 requests per hour per IP address**. Without caching, every tab switch or page re-navigation would consume API quota.

In [`src/api/github.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/api/github.ts), we built a lightweight `sessionStorage` caching wrapper with a 15-minute Time-To-Live (TTL):

```typescript
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 Minutes

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const cacheKey = `gh_user_${username.toLowerCase()}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data; // Return cached payload instantly!
    }
  }

  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!response.ok) {
    throw new Error(`GitHub user "@${username}" not found.`);
  }

  const rawData: GitHubUserResponse = await response.json();
  const transformed = transformUserPayload(rawData);

  sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: transformed }));
  return transformed;
}
```

### Why `sessionStorage` instead of `localStorage`?
* `sessionStorage` persists data across page navigation during an active browser session.
* Unlike `localStorage`, `sessionStorage` clears automatically when the tab closes, ensuring visitors see updated GitHub activity when returning in a new session.

---

## Step 3: Custom React Hook (`useGitHubData`)

### Encapsulating Async Lifecycles & State Transitions

To keep UI components purely presentational, we encapsulated all fetching, loading, error, and username switching logic into a custom hook [`src/hooks/useGitHubData.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/hooks/useGitHubData.ts):

```typescript
export function useGitHubData(initialUsername = 'chris-lau') {
  const [username, setUsernameState] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (targetUser: string) => {
    setLoading(true);
    setError(null);
    try {
      const [userData, reposData] = await Promise.all([
        fetchGitHubUser(targetUser),
        fetchGitHubRepos(targetUser),
      ]);
      setUser(userData);
      setRepos(reposData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(username);
  }, [username, loadData]);

  return { username, setUsername: setUsernameState, user, repos, loading, error };
}
```

### Concept: Parallel Data Fetching with `Promise.all`
Executing `Promise.all([fetchGitHubUser(target), fetchGitHubRepos(target)])` fires both network calls concurrently, reducing network latency by ~50% compared to sequential `await` statements.

---

## Step 4: Atomic UI Components & Storybook Workshops

We decomposed the dashboard interface into small, single-responsibility presentational components:

1. **`<GitHubUsernameSelector />`**: Allows visitors to lookup any GitHub user/organization (e.g. `@facebook`, `@vercel`) or reset back to `@chris-lau`.
2. **`<GitHubSummary />`**: Displays profile avatar, bio, follower count, and primary language percentage breakdown bar.
3. **`<GitHubRepoCard />`**: Renders repository cards with stars ⭐, forks 🍴, language dot color, and `🔥 Active` 30-day badges.
4. **`<GitHubFilters />`**: Search box, language filter dropdown, and `⚡ Active (Past 30 Days)` pill button.

### Visual Component Testing with Storybook
To ensure these components render correctly across all 3 site themes (`Modern Editorial`, `Warm ASCII`, and `Retro CLI`), we created Storybook stories (`.stories.tsx`):

```typescript
// src/components/github/GitHubRepoCard.stories.tsx
export const ActiveRepo: Story = {
  args: {
    repo: {
      name: 'personalWebsite',
      stars: 24,
      isRecentlyUpdated: true,
      formattedLastUpdated: '2 hours ago',
    },
  },
};
```

Running `npm run storybook` opens an isolated component workshop on `http://localhost:6006` to verify UI states without making real network requests.

---

## Step 5: Projects Page Tabbed Integration

Rather than cluttering the Projects page with two competing views, we implemented an accessible tab bar in [`src/pages/ProjectsPage.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/pages/ProjectsPage.tsx):

```tsx
<div className="projects-tab-bar" role="tablist">
  <button
    role="tab"
    aria-selected={activeTab === 'featured'}
    className={`projects-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
    onClick={() => setActiveTab('featured')}
  >
    📁 Featured Projects
  </button>
  <button
    role="tab"
    aria-selected={activeTab === 'github'}
    className={`projects-tab-btn ${activeTab === 'github' ? 'active' : ''}`}
    onClick={() => setActiveTab('github')}
  >
    🐙 Live GitHub Activity
  </button>
</div>
```

Visitors can seamlessly toggle between hand-picked **Featured Projects** and the live **GitHub Activity Dashboard**.

---

## Step 6: Multi-Layered Testing Strategy

To guarantee zero regressions, we verified the integration across three testing tiers:

1. **Unit Tests (Vitest)**: Mocked `globalThis.fetch` using `vi.spyOn` in `github.test.ts` to test API transformation, date calculations, and 15-minute caching TTL offline.
2. **Hook & Component Tests**: Tested hook state updates (`useGitHubData.test.ts`) and dashboard filter interactions (`GitHubDashboard.test.tsx`).
3. **End-to-End Tests (Playwright)**: Verified tab navigation and search inputs in automated Chromium tests (`portfolio.spec.ts`).

```bash
# Result of automated verification:
✓ 49/49 Vitest unit & component tests passing
✓ 5/5 Playwright E2E tests passing
✓ Production build bundle compiled cleanly in 1.3s
```

---

## Conclusion

Building a robust third-party API integration requires more than just calling `fetch()`. By decoupling raw API payloads into clean view models, implementing client-side `sessionStorage` caching, encapsulating state in custom hooks, and testing with Storybook and Vitest, we created a fast, rate-limit resilient, and interactive live dashboard.

# Implementation Plan — Phase 2: Live GitHub API Integration

Build and integrate a live **GitHub Activity & Repository Dashboard** into the personal portfolio using unauthenticated public requests to the GitHub REST API (`api.github.com`), featuring a tabbed interface on the Projects page ([ProjectsPage.tsx](file:///Users/chrislau/Documents/personalWebsite/frontend/src/pages/ProjectsPage.tsx)), an **interactive GitHub Username Switcher** (allowing visitors to inspect any GitHub user or organization repository, defaulting to `chris-lau`), **Active in Past 30 Days filtering & highlight badges**, 15-minute per-username `sessionStorage` caching, search/filter controls, and seamless styling across all 3 visual themes (`ascii`, `cli`, and `modern`).

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## Goals & Scope

- **Unauthenticated REST API Integration**: Fetch live public profile statistics and public repositories from GitHub (`https://api.github.com/users/{username}`).
- **Interactive Username Switcher**: Visitors can view your profile (`chris-lau`) by default or type any GitHub username/org (e.g. `facebook`, `vercel`, `google`) to dynamically fetch and display their live activity dashboard! Includes a 1-click "Reset to @chris-lau" button.
- **30-Day Activity Filter & Badges**:
  - Filter option: `⚡ Active (Past 30 Days)` — filters repositories with commits/updates within the last 30 days.
  - Visual badge: `🔥 Active` badge on repository cards updated within the last 30 days.
- **No API Keys Required**: Uses unauthenticated GET requests (within GitHub's 60 requests/hour limit per IP address).
- **Client-Side Caching**: Implement `sessionStorage` caching per username with a 15-minute TTL to prevent rate limits during navigation.
- **Option A Tabbed Layout on `/projects`**:
  - `[ 📁 Featured Projects ]` — Displays static curated projects from `frontend/src/data/projects.ts`.
  - `[ 🐙 Live GitHub Activity ]` — Displays live GitHub statistics, language breakdown, repo search, and repo card grid.
- **Triple-Theme Compatibility**: Fully responsive and styled for **Warm Earthy ASCII**, **Retro Terminal CLI**, and **Modern Editorial** themes.
- **Comprehensive Test Coverage**: Unit tests for API transformers & caching, component tests for dashboard elements.

---

## Workspace Directory Structure Updates

```text
personalWebsite/
├── README.md                          # Project documentation
├── personal-os-project-plan.md        # Master architectural project plan
├── phase-1-implementation-plan.md     # Phase 1 execution plan & checklist
├── phase-2-implementation-plan.md     # Phase 2 execution plan & checklist
└── frontend/
    └── src/
        ├── api/
        │   └── github.ts                  # API fetch client & per-username sessionStorage caching utility
        ├── hooks/
        │   └── useGitHubData.ts           # React hook for managing active username, loading, error, and cached data
        ├── types/
        │   └── github.ts                  # Raw API response models & internal clean view models
        ├── components/
        │   └── github/
        │       ├── GitHubUsernameSelector.tsx # Input & preset buttons to switch inspected GitHub user/org
        │       ├── GitHubSummary.tsx      # Avatar, handle, stats counter & top languages bar
        │       ├── GitHubRepoCard.tsx     # Card with stars, forks, language dot, 30-day active badge, & updated date
        │       └── GitHubFilters.tsx      # Repo search input, language filter & 30-day activity filter
        └── pages/
            └── ProjectsPage.tsx           # Tabbed navigation switcher ([Featured] vs [GitHub Activity])
```

---

## Detailed Task Breakdown for Execution

### Step 1: Types & Data Models (`frontend/src/types/github.ts`)
- [x] Define raw GitHub API response interfaces (`GitHubUserResponse`, `GitHubRepoResponse`).
- [x] Define transformed view models (`GitHubUser`, `GitHubRepo`) with `isRecentlyUpdated` flag (pushed/updated within 30 days).
- [x] Define filter and statistic types (`RepoSortOption`: `'active' | 'stars' | 'updated' | 'name'`, `LanguageStat`).

### Step 2: API Service & Caching Layer (`frontend/src/api/github.ts`)
- [x] Implement `fetchGitHubUser(username: string)` and `fetchGitHubRepos(username: string)`.
- [x] Add `sessionStorage` caching per username with timestamp checks (`GITHUB_CACHE_TTL = 15 * 60 * 1000`).
- [x] Handle API status codes gracefully (e.g. 404 User Not Found, 403 Rate Limit Exceeded).


### Step 3: Custom React Hook (`frontend/src/hooks/useGitHubData.ts`)
- [x] Expose `{ username, setUsername, user, repos, loading, error, resetDefault }`.
- [x] Provide immediate response from cache if valid, otherwise perform asynchronous fetch.


### Step 4: GitHub Dashboard UI Components (`frontend/src/components/github/`)
- [x] `<GitHubUsernameSelector />`: Search input, submission button, and preset chips (`@chris-lau`, `@facebook`, `@vercel`).
- [x] `<GitHubSummary />`: Display profile header, stats, and language percentage progress bar.
- [x] `<GitHubRepoCard />`: Display repository card with topic tags, language dot color, stars ⭐, forks 🍴, `🔥 Active` badge (past 30 days), and relative timestamp.
- [x] `<GitHubFilters />`: Real-time text search, language filter dropdown, and sorting options (*All Repos*, *⚡ Active (Past 30 Days)*, *⭐ Most Stars*, *Recently Updated*, *Alphabetical*).


### Step 5: Tabbed Integration on Projects Page (`frontend/src/pages/ProjectsPage.tsx`)
- [x] Add accessible tab control (`[Featured Projects] | [GitHub Activity]`).
- [x] Integrate `<GitHubDashboard />` under the "Live GitHub Activity" tab.
- [x] Ensure styles seamlessly adapt across all 3 visual themes (`Modern Editorial`, `Warm ASCII`, `Retro CLI`).

### Step 6: Automated Testing & Verification
- [x] Write unit tests for `github.ts` API client, 30-day date calculation helper, and per-username caching layer.
- [x] Write unit tests for `useGitHubData.ts` custom hook.
- [x] Write component tests for `<GitHubDashboard />` interactive states and 30-day filter toggle.
- [x] Update Playwright E2E suite (`portfolio.spec.ts`) for tabbed navigation and Live GitHub Activity view.

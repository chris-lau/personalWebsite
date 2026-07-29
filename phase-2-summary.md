# Phase 2 Summary — Live GitHub API Integration & Repository Dashboard

This document provides a comprehensive summary of all architectural decisions, components, data flows, and test results implemented during **Phase 2** of the Personal Website project.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## 📌 Phase 2 Overview & Goals

The primary goal of Phase 2 was to integrate an existing public API (the **GitHub REST API** `api.github.com`) into the personal portfolio. This feature allows visitors to inspect live GitHub activity, repository statistics, primary language distributions, and recent commit highlights without static content obsolescence.

---

## 🛠️ Work Accomplished in Phase 2

### 1. Data Contracts & View Models (`frontend/src/types/github.ts`)
* Defined raw response interfaces (`GitHubUserResponse`, `GitHubRepoResponse`) matching GitHub API payloads.
* Built clean internal View Models (`GitHubUser`, `GitHubRepo`) decoupling UI components from raw API structures.
* Precomputed `isRecentlyUpdated` boolean flag indicating repositories updated within the last 30 days.

### 2. Client-Side API & Caching Layer (`frontend/src/api/github.ts`)
* Created async fetch functions `fetchGitHubUser(username)` and `fetchGitHubRepos(username)`.
* Implemented a 15-minute TTL per-username `sessionStorage` caching mechanism to preserve GitHub's unauthenticated 60 requests/hour IP rate limit.
* Created date calculation helpers `isWithinPast30Days` and `formatRelativeTime`.

### 3. Custom Reactive Hook (`frontend/src/hooks/useGitHubData.ts`)
* Encapsulated async lifecycle state management (`loading`, `error`, `user`, `repos`, `setUsername`, `refetch`, `resetDefault`).
* Automated concurrent data fetching via `Promise.all([fetchUser, fetchRepos])` with `isMounted` cleanup guards.

### 4. UI Dashboard Components & Storybook Catalog (`frontend/src/components/github/`)
* **`<GitHubUsernameSelector />`**: Input field & 1-click preset chips (`@chris-lau`, `@facebook`, `@vercel`) with reset button.
* **`<GitHubSummary />`**: Profile avatar, bio summary, follower stats, and language distribution progress bar.
* **`<GitHubRepoCard />`**: Repository card with star count, fork count, language color dot, formatted date, and glowing `🔥 Active` badge.
* **`<GitHubFilters />`**: Search input, language selector, sort control, and `⚡ Active (Past 30 Days)` filter pill.
* **`<GitHubDashboard />`**: Container component integrating selector, summary, filters, and repo grid.
* **Storybook Stories**: Created `.stories.tsx` files for `GitHubSummary`, `GitHubRepoCard`, and `GitHubUsernameSelector`.

### 5. Projects Page Tabbed Integration (`frontend/src/pages/ProjectsPage.tsx`)
* Added accessible segmented tab navigation (`role="tablist"` and `role="tab"`):
  * `📁 Featured Projects` — Static curated projects from `projects.ts`.
  * `🐙 Live GitHub Activity` — Embedded live `<GitHubDashboard />`.

### 6. Documentation & Educational Content
* Created **Chapter 9** in the *Frontend Development Guidebook* (`frontend/src/data/posts/guidebook-master.md` & `guidebookData.ts`) covering REST API consumption, view model decoupling, `sessionStorage` caching, and custom hooks.
* Authored technical article [`blog-building-live-github-dashboard-integration.md`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/posts/blog-building-live-github-dashboard-integration.md).

---

## 🧪 Verification & Test Metrics

- **Unit & Integration Tests**: **49 / 49 Vitest tests passing** (`10 / 10 test files`).
- **End-to-End Browser Tests**: **5 / 5 Playwright E2E tests passing** across Chromium/WebKit.
- **Production Build**: Clean `npm run build` compilation without errors.

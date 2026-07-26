# Personal OS Portfolio — Project Plan

## Project Description

Personal OS Portfolio is a personal website combined with a progressively developed full-stack web application.

The project will begin as a polished, frontend-only portfolio built with React, TypeScript, and Vite. It will initially present my experience, projects, skills, current activities, and résumé using static local data.

The website will then grow through deliberately ordered phases. First, it will introduce more advanced frontend interactions and browser-based state. Next, it will consume an existing public API so that I can learn how a frontend interacts with a real backend before designing one myself.

After that, I will create my own FastAPI backend, connect it to PostgreSQL, and build a private administration dashboard. The administration system will allow me to update projects, posts, reading entries, and other public website content without changing the source code.

Later phases may add publishing, image uploads, a contact inbox, automated testing, monitoring, and a read-only Model Context Protocol server.

The purpose is not to add as many technologies as possible. Each new service or technology will be introduced only when the project has a real requirement for it.

---

## Main Objectives

The project should demonstrate:

- React and TypeScript frontend development
- Responsive and accessible interface design
- Consuming external REST APIs
- Designing a REST API with FastAPI
- Python backend development
- PostgreSQL database design
- Authentication and authorization
- Full-stack CRUD operations
- Testing and continuous integration
- Cloud deployment
- Technical documentation and architectural decision-making
- Optional MCP integration with AI clients

---

## Intended Users

### Public Visitors

Public visitors will be able to:

- Learn about me
- View my experience and skills
- Explore my projects
- View what I am currently building and learning
- Browse technical posts and public notes
- View selected reading and activity information
- Contact me
- Explore interactive application features

### Administrator

I will be the only administrator initially.

The private admin area will eventually allow me to:

- Create and edit projects
- Publish and unpublish content
- Update my “Now” page
- Manage reading entries
- Write posts in Markdown
- Upload images
- Review contact messages

---

# Planned Architecture

## Final Target Architecture

```text
GitHub monorepo
│
├── frontend/
│   └── React + TypeScript + Vite
│
└── backend/
    └── FastAPI + Python
         │
         ├── PostgreSQL
         ├── External APIs
         └── Optional MCP server
```

## Production Deployment

```text
Visitor
   │
   ▼
Cloudflare Pages
React frontend
   │
   ▼
Render
FastAPI backend
   │
   ▼
Neon
PostgreSQL database
```

The frontend and backend will remain separate deployments. This allows the frontend to load quickly even when a free backend has entered an inactive state.

---

# Service Signup Strategy

## Core Rule

> Do not create an account, database, deployment, domain, or paid resource until the phase actually requires it.

## Create Now

### GitHub

**Purpose:**

- Store the repository
- Track source-code history
- Manage issues and milestones
- Connect the repository to hosting services
- Add GitHub Actions later

**Required in:** Phase 1

**Plan:** Free

**Payment card:** Do not add one.

## Create When Phase 1 Is Ready to Deploy

### Cloudflare

**Purpose:**

- Deploy the React frontend through Cloudflare Pages
- Receive a free `pages.dev` address
- Generate preview deployments
- Add a custom domain much later

**Required in:** Phase 1 deployment

**Plan:** Free

**Payment card:** Do not add one.

## Do Not Create Yet

Do not sign up for:

- A domain registrar
- Render
- Neon
- Supabase
- An authentication provider
- Object storage
- Email delivery
- Error monitoring
- An AI API
- Any MCP-specific hosting service

These services do not solve a Phase 1 problem.

---

# Phase 1 — Static Portfolio

## Goal

Create and publish a professional frontend-only portfolio.

## Technologies

- React
- TypeScript
- Vite
- React Router, if multiple routes are needed
- CSS Modules, Tailwind CSS, or structured standard CSS
- Git and GitHub
- Cloudflare Pages

## Pages

```text
/
├── Home
├── About
├── Projects
├── Experience
├── Now
└── Contact
```

## Local Content Structure

```text
frontend/src/data/
├── profile.ts
├── projects.ts
├── experience.ts
├── skills.ts
└── now.ts
```

## Features

- Responsive desktop and mobile layouts
- Accessible navigation
- Light and dark themes
- Project cards
- Technology filters
- Experience timeline
- Downloadable résumé
- “Now” section
- Social and contact links
- Custom loading and 404 pages
- SEO metadata
- Open Graph metadata
- Keyboard navigation
- Basic component tests

## Accounts Required

- GitHub
- Cloudflare only when deployment begins

## Accounts Not Required

- Domain registrar
- Backend host
- Database provider
- Authentication provider

## Deployment Address

Use the free Cloudflare address initially:

```text
project-name.pages.dev
```

## Completion Criteria

- The public website is deployed
- It works on mobile and desktop
- Visitors can understand who I am
- Projects and experience are clearly presented
- No backend is required for normal use
- Accessibility and performance issues have been reviewed
- The repository contains setup instructions

---

# Phase 2 — Interactive Frontend

## Goal

Make the portfolio behave like an application while remaining frontend-only.

## Features

### Global Search

Search across:

- Project names
- Descriptions
- Technologies
- Experience
- Skills

### Project Filtering and Sorting

Visitors can filter projects by:

- Technology
- Project type
- Status
- Year

### Personal OS Dashboard

The dashboard can include:

- Current projects
- Current learning
- Reading list
- Recent updates
- Development goals

### Local Browser State

Use `localStorage` for:

- Theme preference
- Layout preference
- Selected filters
- Demo task-board state

### Demo Task Board

```text
To Do → In Progress → Complete
```

The task data belongs to each visitor and remains only in their browser.

## Skills Demonstrated

- React state management
- Custom hooks
- Forms
- Validation
- Browser storage
- Search and filtering
- Component composition
- Loading and empty states

## New Accounts Required

None.

## Completion Criteria

- Interactive features work without a backend
- Refreshing the page preserves appropriate preferences
- Local state is clearly separated from permanent application data
- Components have useful empty and error states
- Important interactions have tests

---

# Phase 3 — Existing Public API Integration

## Goal

Learn how to consume an existing backend before building one.

## Selected API

Use the GitHub REST API to create a GitHub activity and repository dashboard.

## Feature

```text
GitHub Dashboard
├── Profile summary
├── Public repositories
├── Featured repositories
├── Primary languages
├── Repository search
├── Language filters
├── Sorting
└── Recently updated projects
```

## Data Flow

```text
React
   │
   ▼
GitHub REST API
   │
   ▼
Response validation and transformation
   │
   ▼
Portfolio components
```

## Engineering Requirements

- Keep API functions outside React page components
- Define TypeScript types for API responses
- Transform external data into internal view models
- Display loading skeletons
- Display useful error messages
- Handle empty responses
- Cache successful responses
- Avoid unnecessary API calls
- Handle rate-limit errors
- Test API-dependent components using mocked responses
- Never expose a private access token in frontend code

## Suggested Structure

```text
frontend/src/
├── api/
│   └── github.ts
├── hooks/
│   └── useGitHubRepositories.ts
├── types/
│   └── github.ts
└── components/github/
    ├── GitHubSummary.tsx
    ├── RepositoryCard.tsx
    └── RepositoryFilters.tsx
```

## New Accounts Required

None.

Use the existing GitHub account and begin with public, unauthenticated GitHub API requests.

## Completion Criteria

- The frontend calls a real public API
- External data is typed and transformed
- Loading, error, success, and empty states work
- Results are cached
- Rate-limit failures are handled gracefully
- Tests do not rely on the live GitHub service

---

# Phase 4 — FastAPI Backend

## Goal

Build a personal backend after gaining experience as an API consumer.

## Technologies

- Python
- FastAPI
- Pydantic
- Uvicorn
- Pytest
- Ruff
- mypy or Pyright
- Docker

## Initial Endpoints

```text
GET /health
GET /api/profile
GET /api/projects
GET /api/projects/{slug}
GET /api/now
GET /api/reading
GET /api/github-summary
```

The first version may load content from local JSON files. A database is not needed yet.

## Why Begin Without a Database?

This separates two learning goals:

1. Designing and deploying an API
2. Designing persistent database storage

## GitHub API Proxy

```text
React
   │
   ▼
FastAPI
   │
   ├── GitHub API
   └── Response cache
```

Benefits include:

- Centralized caching
- Consistent response models
- Better error handling
- No frontend secrets
- A simplified response designed for the website

## New Service Required

### Render

**Sign up:** Only when the FastAPI backend works locally and is ready for its first public deployment.

**Purpose:**

- Host the FastAPI web service
- Deploy from the `/backend` monorepo directory
- Automatically redeploy backend changes

**Plan:** Use the free plan if it still meets the project’s needs when this phase begins.

**Payment card:** Do not add one unless required and intentionally approved.

## Services Not Yet Required

- Neon
- Authentication provider
- Object storage
- Domain
- Email delivery
- MCP hosting

## Completion Criteria

- FastAPI is deployed
- `/health` confirms the service is running
- React successfully calls at least one backend endpoint
- CORS allows only approved frontend origins
- Input and output schemas are defined
- API tests pass
- Errors use consistent response formats
- API documentation is available
- The frontend remains usable when the backend is unavailable

---

# Phase 5 — PostgreSQL and CRUD

## Goal

Replace static backend data with persistent database records.

## Technologies

- PostgreSQL
- Neon
- SQLAlchemy
- Alembic
- psycopg
- FastAPI

## New Service Required

### Neon

**Sign up:** Only when the API is deployed and the first database-backed feature is ready to be implemented.

**Purpose:**

- Host PostgreSQL
- Store projects, updates, reading entries, and posts
- Practise relational database design and migrations

**Plan:** Use the free plan if it still meets the project’s needs.

**Payment card:** Do not add one.

## Initial Database Tables

```text
projects
├── id
├── title
├── slug
├── summary
├── description
├── status
├── repository_url
├── live_url
├── is_published
├── created_at
└── updated_at

technologies
├── id
└── name

project_technologies
├── project_id
└── technology_id

project_updates
├── id
├── project_id
├── content
└── created_at

now_entries
├── id
├── category
├── content
└── updated_at

reading_items
├── id
├── title
├── author
├── status
├── rating
└── notes
```

## API Operations

```text
GET    /api/projects
GET    /api/projects/{slug}
POST   /api/projects
PATCH  /api/projects/{id}
DELETE /api/projects/{id}
```

Write operations should not be publicly available before authentication is added.

## Database Rules

- Every schema change uses an Alembic migration
- Database credentials remain in environment variables
- Credentials are never committed to GitHub
- The frontend never connects directly to PostgreSQL
- Public responses expose only approved fields
- Development and production configurations remain separate

## Completion Criteria

- Production data survives redeployments
- Database migrations run successfully
- Projects are loaded from PostgreSQL
- CRUD services have tests
- The database URL is stored securely
- Database models are separate from API response schemas

---

# Phase 6 — Authentication and Admin Dashboard

## Goal

Manage portfolio content through a private interface.

## Admin Routes

```text
/admin
├── Dashboard
├── Projects
├── Now
├── Reading
└── Posts
```

## Features

- Administrator login
- Protected frontend routes
- Protected backend endpoints
- Create and edit projects
- Publish and unpublish content
- Update the “Now” page
- Add reading entries
- Log out securely

## Authentication Decision

Do not sign up for a separate authentication provider automatically.

### Option A — One Administrator Account

Use:

- One administrator record
- Secure password hashing
- Secure HTTP-only cookies
- CSRF protection where required
- Login rate limiting
- Short session lifetime

This does not require another service account.

### Option B — Multiple Users or Social Login

Only then consider a managed authentication provider.

## New Accounts Required

Possibly none.

## Completion Criteria

- Unauthenticated users cannot access admin data
- Public users cannot call write endpoints
- Passwords are never stored in plain text
- Sessions expire
- Login attempts are rate-limited
- Authentication and authorization tests pass
- Administrative actions are validated on the backend

---

# Phase 7 — Markdown Publishing

## Goal

Create a small publishing and knowledge-management system.

## Features

- Markdown editor
- Drafts
- Published posts
- Tags
- Syntax highlighting
- Preview
- Slug-based URLs
- Search
- Publication dates

## Data Model

```text
posts
├── id
├── title
├── slug
├── summary
├── markdown_content
├── status
├── published_at
├── created_at
└── updated_at
```

## New Accounts Required

None.

## Completion Criteria

- Posts can be written in the admin dashboard
- Drafts remain private
- Published posts appear publicly
- Markdown output is sanitized
- Search returns relevant published content

---

# Phase 8 — Images and Optional Travel Journal

## Goal

Add cloud-hosted images only when the site supports original photographs or image uploads.

## Features

- Image upload
- Image captions
- Responsive image sizes
- Lazy loading
- Gallery
- Optional travel entries
- File-type and size validation

## New Service Potentially Required

### Object Storage Provider

Do not sign up until the image-upload feature is actively being built.

Compare current plans for:

- Cloudflare R2
- Supabase Storage
- Another reputable object-storage provider

Select only one.

Do not store large image files directly in PostgreSQL.

## Completion Criteria

- Uploads are restricted to authenticated administrators
- File type and file size are validated
- Database records store file metadata and URLs
- Images are optimized for web delivery
- Deleted database records do not leave uncontrolled orphan files

---

# Phase 9 — Contact Inbox

## Goal

Replace contact links with a secure contact workflow.

## Flow

```text
Visitor form
     │
     ▼
FastAPI validation
     │
     ▼
PostgreSQL
     │
     ▼
Admin inbox
```

## Features

- Contact form
- Validation
- Spam protection
- Rate limiting
- Message status
- Admin inbox

## Message Statuses

```text
new
read
replied
archived
```

## Email Notification

Do not sign up for an email delivery service when the contact form is first built.

Start by storing submissions in the admin inbox. Add an email provider only if missing notifications becomes a real problem.

## New Accounts Required

None initially.

## Completion Criteria

- Valid messages are stored
- Invalid and excessive requests are rejected
- Public users cannot read submitted messages
- Sensitive fields are not written to application logs
- The administrator can manage message status

---

# Phase 10 — Production Engineering

## Goal

Demonstrate that the project can be maintained reliably.

## Features

- Frontend unit tests
- Backend unit and integration tests
- GitHub Actions
- Type checking
- Linting
- Build verification
- Migration verification
- Structured logs
- Health checks
- Security headers
- Dependency updates
- Backup documentation
- Architecture documentation

## Suggested CI Workflow

```text
Pull request
│
├── Frontend
│   ├── Install
│   ├── Lint
│   ├── Type check
│   ├── Test
│   └── Build
│
└── Backend
    ├── Install
    ├── Lint
    ├── Type check
    ├── Test
    └── Check migrations
```

## New Accounts Required

None initially.

Do not sign up for a monitoring provider until built-in logs and health checks are genuinely insufficient.

## Completion Criteria

- Pull requests run automated checks
- Failed tests prevent broken changes from merging
- Backend errors use structured logs
- Deployment and recovery steps are documented
- Major architectural decisions are explained

---

# Phase 11 — Optional MCP Server

## Goal

Expose selected public portfolio information to MCP-compatible AI clients.

## Position in the Architecture

```text
                       ┌── REST API → React
PostgreSQL → services ─┤
                       └── MCP tools → AI clients
```

The REST API and MCP server must call the same service layer.

## Initial Read-Only Tools

```text
search_projects(query)
get_project(slug)
list_published_posts(limit)
search_published_posts(query)
get_public_profile()
get_now_entries()
```

## Potential Resources

```text
portfolio://profile
portfolio://projects
portfolio://resume
portfolio://now
```

## Security Scope

The first MCP version must not:

- Modify projects
- Publish posts
- Access private notes
- Access contact messages
- Upload files
- Delete content
- Return database credentials or private fields

## New Service Requirements

None for local development.

Use:

- The official MCP Python SDK
- MCP Inspector for local testing
- The existing backend repository and service layer

Create a separate public deployment only when remote MCP access is needed.

## Completion Criteria

- The server exposes only public information
- Tool inputs and outputs have clear schemas
- MCP tools reuse existing backend services
- Private database fields cannot be returned
- Tool requests are logged
- Tool calls are rate-limited where appropriate
- Automated tests cover tool behaviour
- MCP Inspector can connect successfully
- The architecture page explains why MCP supplements REST rather than replacing it

---

# Phase 12 — Custom Domain

## Goal

Add a professional domain only after the website is stable and worth maintaining.

## When to Purchase

Purchase a domain only when:

- The portfolio has polished content
- The Cloudflare Pages deployment is stable
- The URL is being placed on a résumé or job application
- I am prepared to pay the annual renewal cost
- I have checked both first-year and renewal prices

A domain is not necessary for development, testing, or early deployment.

## Possible Providers to Compare Later

- Cloudflare Registrar
- Porkbun

Do not create registrar accounts now.

## Expected Setup

```text
example.com      → Cloudflare Pages
api.example.com  → Render
```

---

# Account Creation Timeline

## Create Now

| Service | Reason |
|---|---|
| GitHub | Repository and source control |

## Create When Phase 1 Is Ready to Deploy

| Service | Reason |
|---|---|
| Cloudflare | Host the React frontend |

## Create When Phase 4 Is Ready to Deploy

| Service | Reason |
|---|---|
| Render | Host the FastAPI backend |

## Create When Phase 5 Begins

| Service | Reason |
|---|---|
| Neon | Host PostgreSQL |

## Create Only When the Relevant Feature Begins

| Service | Trigger |
|---|---|
| Object storage | Image uploads are being implemented |
| Authentication provider | The project needs more than simple single-admin authentication |
| Email provider | Admin-inbox-only contact management is insufficient |
| Monitoring provider | Platform logs are insufficient |
| AI API provider | A specific AI feature is approved and has a cost plan |
| Domain registrar | The site is ready for résumés and applications |
| Additional backend host | MCP cannot reasonably share the existing backend |

---

# Services That Should Not Be Created Speculatively

Do not create unused projects in:

- Render
- Neon
- Supabase
- Vercel
- Netlify
- Cloudflare R2
- Authentication platforms
- Email platforms
- AI API platforms
- Analytics platforms
- Domain registrars

Unused accounts increase complexity, expose credentials, and make it harder to remember which service is responsible for each part of the system.

---

# Cost-Safety Rules

1. Do not enter a payment card unless a later decision explicitly requires it.
2. Do not enable automatic paid upgrades.
3. Do not enable usage-based resources without a hard spending limit.
4. Use provider-supplied subdomains until a custom domain has a real purpose.
5. Store secrets only in local `.env` files and deployment environment settings.
6. Include `.env` in `.gitignore`.
7. Add `.env.example` containing names but no secret values.
8. Recheck current pricing before every new service signup.
9. Delete unused test deployments and databases.
10. Design the site to fail gracefully when a free external service is unavailable.

---

# Recommended Repository Structure

```text
personal-os/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── mcp/
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
│
├── docs/
│   ├── architecture.md
│   ├── decisions/
│   └── roadmap.md
│
├── .github/
│   └── workflows/
│
├── .gitignore
├── README.md
└── LICENSE
```

The backend directory does not need to exist during Phase 1. It can be added when Phase 4 begins.

---

# Minimum Successful Version

## Strong Frontend Version

Complete Phases 1–3:

- React portfolio
- Interactive frontend
- Public API integration
- Deployed on Cloudflare Pages

## Strong Full-Stack Version

Complete Phases 1–6:

- React and TypeScript
- External API integration
- FastAPI backend
- PostgreSQL
- CRUD
- Authentication
- Admin dashboard

## Advanced Version

Complete the production-engineering phase and one optional advanced feature:

- Markdown publishing
- Image gallery
- Contact inbox
- MCP server

The priority is always a polished and reliable core application—not completing the largest possible number of phases.

---

# Recommended Signup Order

```text
Now:            GitHub only
First deploy:   Cloudflare
Backend deploy: Render
Database work:  Neon
Much later:     Domain and optional services
```

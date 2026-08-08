# Phase 5 Implementation Plan — Authentication and Draft Posts

## Executive Summary

Phase 5 introduces multi-provider authentication (Password, GitHub OAuth, and Google OAuth) and draft post filtering to the Personal OS backend service. It enables secure administrator access control via JWTs delivered in `HttpOnly` + `SameSite=Strict` cookies, preventing unauthorized write operations while allowing authenticated admins to publish content and preview draft blog posts before they are visible to the public.

---

## Key Requirements & Scope

1. **Multi-Provider Authentication:**
   - **Password Login:** `POST /api/auth/login` using credentials configured via environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`).
   - **GitHub OAuth:** `GET /api/auth/github` and `/api/auth/github/callback` to verify authenticated GitHub users against an `ALLOWED_ADMIN_USERS` list.
   - **Google OAuth:** `GET /api/auth/google` and `/api/auth/google/callback` to verify authenticated Google users against an `ALLOWED_ADMIN_USERS` list.

2. **Secure Session Cookie Management:**
   - Cryptographically signed JWT tokens issued upon successful authentication.
   - Delivered in `HttpOnly`, `Secure` (production), `SameSite=Strict` cookies (`access_token`).
   - Logout endpoint (`POST /api/auth/logout`) that clears the session cookie.
   - Session status check endpoint (`GET /api/auth/me`).

3. **Draft Post Filtering Integration:**
   - Add `"status": "published"` | `"draft"` and optional `publishDate` fields to post schema and data store (`blog_posts.json`).
   - `GET /api/posts` and `GET /api/posts/{slug}` check authentication status:
     - **Public Visitors (No Auth Token):** Filter out posts where `status != "published"`. Returns `404` for draft slugs.
     - **Authenticated Admin:** Returns all posts (published + drafts).

4. **Security & Validation:**
   - Input validation to protect against CRLF, path traversal, and header injection.
   - Password verification using secure hashing algorithms (`passlib` / `bcrypt`).

5. **Testing & Quality Assurance:**
   - Unit tests covering password auth, JWT creation/verification, allowlist checking, OAuth flow helpers, and public vs admin draft post visibility.

---

## Technical Details

### Auth & Draft Filtering Architecture

```text
Client Request
     │
     ├─► Password Login: POST /api/auth/login
     │        │
     │        └─► Verify hash -> Issue JWT HttpOnly Cookie
     │
     ├─► GitHub OAuth: GET /api/auth/github
     │        │
     │        └─► Redirect -> Callback -> Fetch GitHub profile -> Validate allowlist -> Issue JWT HttpOnly Cookie
     │
     ├─► Google OAuth: GET /api/auth/google
     │        │
     │        └─► Redirect -> Callback -> Fetch Google profile -> Validate allowlist -> Issue JWT HttpOnly Cookie
     │
     └─► GET /api/posts (Draft Filter)
              │
              ├─► Valid Admin Cookie? YES ──► Return ALL posts (Published + Drafts)
              └─► Valid Admin Cookie? NO  ──► Return ONLY Published posts
```

---

## Deliverables

- `backend/requirements.txt`: Updated with `PyJWT>=2.8.0` and `passlib[bcrypt]>=1.7.4`.
- `backend/config.py`: Added JWT secret key, admin credentials, OAuth client IDs/secrets, and `ALLOWED_ADMIN_USERS` config.
- `backend/core/auth.py`: Password hashing/verification, JWT creation, allowlist validation, and FastAPI dependencies (`get_current_user_optional`, `require_admin_user`).
- `backend/api/endpoints/auth.py`: Auth endpoints (`/login`, `/logout`, `/me`, `/github`, `/google`).
- `backend/schemas/blog.py`: Updated `BlogPostMetaResponse` with `status` and `publishDate`.
- `backend/data/blog_posts.json`: Updated entries with `status: "published"` and sample `"draft"` entry.
- `backend/api/endpoints/posts.py`: Refactored endpoints with auth-aware draft filtering.
- `personal-os-project-plan.md`: Updated Phase 5 status and roadmap details.
- `backend/tests/test_auth.py`: Unit tests for authentication and session cookies.
- `backend/tests/test_posts_drafts.py`: Unit tests for draft post filtering behavior.

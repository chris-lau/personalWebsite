# Understanding SPA Routing: Why Client-Side Apps Need Server Catch-All Rules

### TL;DR Executive Summary
Single Page Applications (SPAs) built with modern frameworks like React, Vue, or Svelte handle page transitions entirely in the browser using client-side routing. However, when deploying static builds (`dist/`) to edge platforms like Cloudflare Pages, Netlify, or AWS S3, hitting refresh (`F5`) on a sub-route like `/blog` causes a **404 Not Found** error. This article breaks down why client-side routing breaks on server reload, how the HTML5 History API works under the hood, and how to resolve it permanently with server catch-all redirect rules (`_redirects`).

---

## 1. The Anatomy of Traditional vs Single Page Architecture

To understand why routing breaks on static hosts, we must look at how traditional web servers differ from modern Single Page Applications.

### Traditional Multi-Page Applications (MPAs)
In traditional web applications, every URL path corresponds to a physical file or directory on a server filesystem:
- Requesting `https://example.com/about.html` -> Server fetches `/var/www/html/about.html`.
- Requesting `https://example.com/blog/` -> Server fetches `/var/www/html/blog/index.html`.

Every time a user clicks a hyperlink, the browser sends an HTTP GET request over the network, tears down the current DOM, and renders the newly received HTML document.

### Modern Single Page Applications (SPAs)
Modern frontend frameworks ship a single entry point file: `index.html`. 
When Vite compiles your React application, it produces:
```text
dist/
├── index.html         <-- The ONLY physical HTML file!
├── assets/
│   ├── index-abc.js  <-- Your entire React bundle & routes
│   └── index-xyz.css <-- Bundled stylesheets
└── _redirects         <-- Cloudflare Pages SPA catch-all rule
```

When a user visits `https://example.com/`, the browser downloads `index.html` and executes the JavaScript bundle. When the user clicks a navigation link to `/blog`, React Router intercepts the click, updates the URL bar, and mounts the `<BlogListPage />` component **without sending a request to the server**.

---

## 2. Why Page Refresh (`F5`) Returns a 404 Error

Client-side routing works smoothly as long as navigation happens inside the active JavaScript session. However, the moment a user performs any of these actions:
1. Opens `https://my-site.pages.dev/blog` directly from a bookmark or external link.
2. Presses `F5` or Cmd+R to reload while viewing `/projects`.
3. Shares a deep link like `/blog/master-frontend-testing-strategy` with a colleague.

The browser bypasses React Router entirely and issues a fresh HTTP GET request to Cloudflare Pages:

```http
GET /blog HTTP/1.1
Host: my-site.pages.dev
```

Cloudflare Pages inspects its static file directory for a physical file named `/blog` or `/blog/index.html`. Because that file **does not exist** (only `index.html` exists at the root), Cloudflare returns a `404 Not Found` response!

---

## 3. How the HTML5 History API Powers Client-Side Routing

Behind the scenes, client-side routing libraries like `react-router-dom` rely on the native browser **HTML5 History API**:

```javascript
// Navigates to /blog without triggering a page reload
window.history.pushState({ page: 'blog' }, 'Blog', '/blog');
```

- `history.pushState()`: Modifies the URL displayed in the browser's address bar without triggering a network request or document load.
- `window.addEventListener('popstate', callback)`: Listens for browser Back and Forward button clicks so React can render the previous component view.

While `pushState()` handles URL manipulation in memory, it does not inform the remote web server about these dynamic client routes.

---

## 4. The Solution: Configuring Server Catch-All Rules

To fix the 404 issue, we must configure our host server to redirect all unhandled route requests back to `index.html` with an HTTP `200 OK` status code.

### Cloudflare Pages & Netlify (`_redirects`)
Create a file located at `frontend/public/_redirects`:

```text
/*  /index.html  200
```

* **What `/*` means**: Matches any incoming path (`/blog`, `/about`, `/projects/123`).
* **What `/index.html` means**: Serves the root static `index.html` bundle.
* **What `200` means**: Returns an HTTP 200 OK status code (rather than a 301/302 redirect), preserving the user's requested URL path in the address bar.

Once Cloudflare serves `index.html`, the browser runs the JavaScript bundle, React initializes, reads `window.location.pathname`, and instantly mounts the correct route component!

### Cloudflare Dashboard Build Settings Summary

When connecting your Git repository to Cloudflare Pages, use these settings:

| Setting | Recommended Value | Explanation |
| :--- | :--- | :--- |
| **Root Directory** | `frontend` | Root directory containing `package.json` |
| **Build Command** | `npm run build` | Runs `tsc && vite build` |
| **Build Output Directory** | `dist` | Production static bundle path |

---

## Key Takeaways

1. **SPAs only have one real HTML file**: Client-side routing happens in JavaScript via `history.pushState()`.
2. **Server reloads require server fallback**: Direct visits or page refreshes send raw HTTP GET requests to the host.
3. **`_redirects` solves 404s permanently**: Placing `/* /index.html 200` in your `public/` directory ensures Cloudflare Pages delegates all URL routing to React Router.

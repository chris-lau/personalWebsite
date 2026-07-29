# Why Is It Called React? Demystifying Reactive UI, State Synchronization, and Custom Hooks

**Author:** Chris Lau  
**Date:** July 2026  
**Category:** React Architecture & Design Systems  
**Read Time:** 5 min read  

---

## 1. The Origin Story: Declarative vs. Imperative

When Jordan Walke created React at Facebook in 2011 (originally launched internally as FaxJS), web development was dominated by **imperative DOM manipulation**. Frameworks and libraries like jQuery required developers to write manual step-by-step instructions telling the browser *how* to mutate every single DOM element whenever application state changed:

```js
// The Traditional Imperative Approach (jQuery / Vanilla JS)
function onUserDataLoaded(user) {
  // Step 1: Hide spinner
  document.getElementById('loading-spinner').style.display = 'none';
  
  // Step 2: Update text fields manually
  document.getElementById('user-name').innerText = user.name;
  document.getElementById('repo-count').innerText = user.publicRepos;
  
  // Step 3: Mutate DOM nodes individually
  const container = document.getElementById('repo-list');
  container.innerHTML = ''; // clear old list
  user.repos.forEach(repo => {
    const li = document.createElement('li');
    li.textContent = repo.name;
    container.appendChild(li);
  });
}
```

As web applications grew in size and complexity, keeping state in sync across hundreds of UI elements became error-prone and brittle. If a developer forgot to update a badge or hide a spinner on one specific edge case, the UI became out of sync with the underlying application data.

React changed the core paradigm by introducing **Reactive UI**: instead of writing step-by-step instructions to mutate the DOM, you describe your UI as a pure function of your state.

$$\text{UI} = f(\text{State})$$

---

## 2. Why "React"?

The framework is named **React** because components **automatically "react" to state changes**.

When state inside a component or custom hook updates (e.g. `loading` changes from `true` to `false`, or `user` transitions from `null` to a fetched data payload), React automatically detects the state update and triggers a re-render.

```tsx
// The Declarative Reactive Approach (React Component)
export function GitHubUserProfile({ username }: { username: string }) {
  const { user, loading, error } = useGitHubData(username);

  // 1. Reactive render condition 1: Loading
  if (loading) return <LoadingSpinner />;

  // 2. Reactive render condition 2: Error
  if (error) return <ErrorMessage message={error} />;

  // 3. Reactive render condition 3: Data Ready
  return (
    <div className="user-profile">
      <h2>{user.displayName}</h2>
      <span className="repo-count">{user.publicRepos} Repositories</span>
    </div>
  );
}
```

Notice how there are **no `document.getElementById` or DOM mutation commands**. You simply state *what* the UI should look like for every state condition, and React automatically updates the real DOM via its virtual DOM diffing engine.

---

## 3. How Custom Hooks Supercharge Reactivity

In modern React architecture, separation of concerns is achieved by splitting **raw API operations** from **reactive state management**:

1. **API Client (`/api/github.ts`)**: Pure TypeScript functions (`fetchGitHubUser`) that execute network requests and return promises.
2. **Custom Hook (`/hooks/useGitHubData.ts`)**: React state engine managing `useState` and `useEffect`.
3. **UI Components (`/components/github/`)**: Pure rendering functions that consume hook state and display UI.

### Bridging APIs with Reactivity

```tsx
// Custom Hook encapsulating reactive state
export function useGitHubData(initialUsername = 'chris-lau') {
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchGitHubUser(username)
      .then((data) => {
        if (isMounted) {
          setUser(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [username]); // Automatically re-reacts whenever `username` changes!

  return { username, setUsername, user, loading, error };
}
```

Whenever `setUsername('facebook')` is invoked, the `username` state changes, causing the `useEffect` dependency to trigger, fetching new data, updating `setUser`, and seamlessly forcing the entire UI component hierarchy to **react** and render the updated GitHub profile.

---

## 4. Key Takeaways for Developers

* **Declarative > Imperative**: You specify *what* the UI should look like for a given state, not *how* to manually change elements.
* **Predictable Data Flow**: Unidirectional state flow ensures your interface never gets stuck in half-updated UI states.
* **Custom Hooks as Reactive Bridges**: Hooks encapsulate state, side effects, and caching, allowing UI components to remain clean, simple, and declarative.

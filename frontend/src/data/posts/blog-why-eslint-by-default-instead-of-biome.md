# Why ESLint Remains React's Default Linter Over Biome (And When to Switch)

In modern web development, code linting and formatting are non-negotiable foundations for building clean, maintainable applications. While the JavaScript ecosystem has historically relied on **ESLint** and **Prettier**, a new generation of Rust-powered tools like **Biome** (formerly Rome) has emerged, offering sub-millisecond execution speeds.

Why does `npm create vite@latest` still default to ESLint? What makes ESLint the standard choice for React apps, and when does it make sense to adopt Biome? This article explores the architectural tradeoffs, ecosystem depth, and React hook mechanics behind this choice.

---

## 1. The 3 Core Reasons ESLint Remains React's Default

### Reason 1: Official React Core Team Rules (`eslint-plugin-react-hooks`)
The React core team at Meta built custom static analysis rules specifically for React:
* **`eslint-plugin-react-hooks`**: Enforces the strict "Rules of Hooks" (e.g., ensuring hooks are called at the top level and catching missing dependencies in `useEffect`, `useCallback`, or `useMemo`).
* **`eslint-plugin-react-refresh`**: Guarantees Vite's Fast Refresh mechanism updates components smoothly during local development without losing component state.

Because these rules are maintained directly by the React core team alongside React releases, ESLint provides instant support for new React features and edge cases before third-party tools can catch up.

### Reason 2: Vite Scaffolding Baseline (`create-vite`)
When you initialize a modern React + TypeScript application using `npm create vite@latest`, Vite scaffolds **ESLint** and **`@typescript-eslint`** out of the box. Because millions of developers rely on standard Vite templates, ESLint remains the universal baseline across tutorials, documentation, and open-source boilerplates.

### Reason 3: Deep Tooling & Plugin Ecosystem
Frontend development extends beyond raw JavaScript parsing. Modern projects integrate plugins for:
* **Storybook 8**: Linting component stories and documentation.
* **Accessibility (`@storybook/addon-a11y` / `eslint-plugin-jsx-a11y`)**: Auditing WCAG compliance, missing ARIA labels, and focus trap states directly in your editor.
* **TailwindCSS / Design Tokens**: Enforcing class sorting and custom utility rules.

ESLint's plugin architecture has over a decade of community extensions, making it easy to layer specialized static checks onto your build pipeline.

---

## 2. Enter Biome: The Rust-Powered Challenger

**Biome** (formerly Rome) is a single, zero-config tool written in **Rust** that replaces both ESLint and Prettier.

### Key Advantages of Biome:
1. **Blazing Speed**: Runs **10x to 100x faster** than ESLint because it compiles to native machine code rather than running inside Node.js.
2. **Unified Tooling**: Replaces linting, code formatting, and import sorting in a single binary with zero configuration friction.
3. **Built-in Formatting**: Eliminates the common conflicts between ESLint rules and Prettier formatting rules.

---

## 3. Direct Tooling Comparison

| Feature | ESLint + Prettier | Biome |
| :--- | :--- | :--- |
| **Primary Goal** | Pluggable, ecosystem-wide static analysis | All-in-one fast linting & formatting |
| **Implementation Language** | JavaScript / Node.js | **Rust** 🦀 |
| **Execution Speed** | Moderate | **Blazing Fast** (< 10ms) |
| **Official React Hook Rules** | ✅ Maintained by Meta React team | ⚠️ Reverse-engineered rules |
| **Ecosystem Plugins (A11y, Storybook)** | ✅ Thousands of plugins | ⏳ Growing core ruleset |
| **Config Setup** | `eslint.config.js` + `.prettierrc` | `biome.json` |

---

## 4. Summary: When Should You Use Which?

* **Use ESLint + Prettier (Default)** if you are building complex React applications using Storybook, custom design token linters, advanced JSX accessibility rules, or want official React Core team hook validation out of the box.
* **Use Biome** if you want ultra-fast Rust linting and formatting in a single zero-config file without managing separate ESLint and Prettier dependencies.

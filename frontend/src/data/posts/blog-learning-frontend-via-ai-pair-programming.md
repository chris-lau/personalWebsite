# Pair Programming with AI: How a Backend TPM Mastered Modern Frontend Development

> **TL;DR**: Developing deep technical domain knowledge across stack boundaries doesn't require passive video courses or copying monolithic boilerplate. By pairing with AI in micro-iterations—breaking implementation down into granular steps, inspecting code diffs line-by-line, and questioning architectural decisions in real time—I rapidly mastered modern React, TypeScript, and CSS design tokens as a Technical Product Manager while keeping 100% control of the codebase. Here is how to use AI as an interactive senior pair programmer.

---

## Table of Contents
1. [Introduction: Beyond Copy-Pasting AI Code](#introduction-beyond-copy-pasting-ai-code)
2. [The Micro-Iteration Workflow: Step-by-Step Learning](#the-micro-iteration-workflow-step-by-step-learning)
3. [Phase 1: Establishing Incremental Implementation Plans](#phase-1-establishing-incremental-implementation-plans)
4. [Phase 2: Small Diffs & Granular Inspection](#phase-2-small-diffs--granular-inspection)
5. [Phase 3: Deep-Diving "Why" & "What" Questions](#phase-3-deep-diving-why--what-questions)
6. [Phase 4: Reading Code with Conceptual Mental Models](#phase-4-reading-code-with-conceptual-mental-models)
7. [Real Example: Learning CSS Design Tokens & Theme Context](#real-example-learning-css-design-tokens--theme-context)
8. [Conclusion: AI as a Thought Partner for Technical Leaders](#conclusion-ai-as-a-thought-partner-for-technical-leaders)

---

## Introduction: Beyond Copy-Pasting AI Code

When developers and product managers talk about using AI for coding, they often describe two extremes:
1. **Generating complete 500-line files** with a single prompt, which often breaks or introduces unmaintainable anti-patterns.
2. **Simple syntax completion**, like inline autocompletion for variable names.

As a Technical Product Manager (TPM) with a backend background wanting to gain hands-on technical depth in frontend development, neither extreme offered genuine learning. If the AI generates an entire application in one shot, you gain zero technical insight into *how* or *why* the components fit together.

Instead, I adopted an interactive **Pair Programming Workflow with AI**. By taking small, deliberate steps, reviewing concise git diffs, and interrogating every architectural choice, I turned building this portfolio into a personalized, high-velocity technical masterclass.



---

## The Micro-Iteration Workflow: Step-by-Step Learning

The key to learning with AI is **keeping iteration loops small**. Rather than asking AI to *"build a blog engine with multi-theme support,"* we broke the goal into bite-sized architectural steps:

```text
┌─────────────────────────────────────────────────────────┐
│ 1. Propose Micro-Step (e.g. "Create BlogPost interface")│
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│ 2. Apply Targeted Code Diff (< 50 lines changed)        │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│ 3. Inspect Diff & Ask "Why" & "What"                    │
│    - "Why wrap this in a Context provider?"             │
│    - "What is list-style-position: inside doing?"       │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│ 4. Verify & Run Test Suite (Vitest / Playwright)        │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Establishing Incremental Implementation Plans

Before writing code, we created an explicit **Implementation Plan** (`phase-1-implementation-plan.md`). Each step had a single, focused responsibility:

- **Step 1**: Scaffold Vite + React 18 + TypeScript project structure.
- **Step 2**: Create CSS variables & design tokens for ASCII, CLI, and Modern themes.
- **Step 3**: Define TypeScript interfaces (`Profile`, `Project`, `BlogPost`).
- **Step 4**: Build layout wrapper components (`AsciiLayout`, `CliLayout`, `ModernLayout`).
- **Step 5**: Setup React Router & page components.
- **Step 6**: Add modular markdown blog engine & query helpers.

By defining small boundaries, I could evaluate each step in isolation without getting lost in application-wide complexity.

---

## Phase 2: Small Diffs & Granular Inspection

A crucial rule in our AI pairing session was: **Never edit a file without showing the exact diff**.

When the AI modified a component (e.g. `Pages.css` or `BlogDetailPage.tsx`), it applied surgical edits rather than overwriting entire files. Seeing code diffs allowed me to observe patterns in real time:

```diff
  .blog-list-item {
-   margin-left: 1.25rem;
+   padding-left: 0;
+   margin-left: 0;
+   list-style-position: inside;
    list-style-type: square;
  }
```

Seeing this exact 4-line diff made it instantly clear how `list-style-position: inside` moves bullet markers inside the principal block box—preventing bullet points from sticking out past the margin!

---

## Phase 3: Deep-Diving "Why" & "What" Questions

The real learning happened right after code diffs were applied. Whenever a new tool or syntax pattern appeared, I paused execution to ask the AI probing questions about **what** was happening under the hood and **why** a specific implementation choice was made:

- *"What is `package.json` doing and what is `"private": true` for?"*
- *"Why do we need a `src/` directory while configuration files sit outside?"*
- *"What role does Vite play alongside TypeScript, and why is `vite build` required if we run `tsc`?"*
- *"Does TypeScript compile code at build time or runtime?"*
- *"What is the difference between Syntax Errors, Type Errors, and Linting?"*

### Turning Questions Into a Dedicated Reference Post

As we went through these questions, I realized that these answers were invaluable—not just for my immediate comprehension, but also as a reference I could revisit whenever I needed a refresher in the future. 

Instead of letting these insights get lost in chat transcripts, we compiled all of those exact questions and code-backed answers into a dedicated blog post: **[Teaching Code: Answers to Fundamental Frontend Development Questions](/blog/frontend-foundations-q-and-a)**.

This created a double win:
1. **Personal Reference**: A permanent, searchable reference guide in my own portfolio to refresh my memory whenever I start a new frontend feature.
2. **Knowledge Sharing**: A beginner-friendly resource for other developers making the same transition to modern frontend development.

---

## Phase 4: Reading Code with Conceptual Mental Models


By pairing these explanations with small code changes, I formed **mental models** grounded in backend engineering concepts:

1. **CSS Design Tokens = Environment Variables**: Scoping CSS variables under `[data-theme="modern"]` is just like reading environment configuration from a `.env` file or config server.
2. **React Context = Dependency Injection**: Registering `ThemeProvider` at `main.tsx` is functionally identical to registering a singleton service container in FastAPI or Spring Boot.
3. **TypeScript Interfaces = API Schemas**: Writing `export interface BlogPost` is the exact same discipline as writing Pydantic models or OpenAPI JSON schemas.

---

## Real Example: Learning CSS Design Tokens & Theme Context

Here is how the interactive learning loop unfolded when building theme toggling:

1. **The Goal**: Allow users to click a toggle button to cycle between `ascii`, `cli`, and `modern` visual themes.
2. **AI Action**: Created `ThemeContext.tsx` with `localStorage` persistence and applied `document.documentElement.setAttribute('data-theme', theme)`.
3. **My Question**: *"What does `setAttribute('data-theme')` actually trigger in the DOM?"*
4. **AI Explanation & Code Inspection**: Showed how CSS rules like `[data-theme="cli"] { --bg-primary: #0a0c10; }` automatically apply new color variables to every element instantly.
5. **My Insight**: Instead of React re-rendering every element's inline styles, CSS variable cascades handle visual updates at the browser rendering engine level!

---

## Conclusion: AI as a Thought Partner for Technical Leaders

Using AI to copy-paste code without understanding creates technical debt and stifles technical leadership. But using AI as an **interactive, patient, line-by-line pair programmer** is one of the most effective ways for a Technical Product Manager to gain deep domain depth.

By enforcing small implementation steps, inspecting git diffs, and relentlessly asking *"why"* and *"what"*, I developed strong technical intuition across modern React, TypeScript, and design token architectures.

If you are a TPM or product leader expanding into new technical domains, don't just ask AI to generate output—ask AI to **teach you while building together**!



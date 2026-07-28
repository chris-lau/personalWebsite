# personalWebsite — Suggested Text/Content Fixes

Follow-up to [personalWebsite-feedback.md](personalWebsite-feedback.md), with fixes for the content issues found on the live site. These are suggested copy edits only — no code was changed.

---

## 1. Clarify the concurrent roles on `/experience`

Confirmed intentional — you held both roles simultaneously. As written, though, a reader has no way to tell "concurrent" apart from "typo," since the default assumption when two roles at the same company overlap by ~10 months is a copy-paste error. A one-word annotation removes the ambiguity.

**Current:**
```
Staff Product Manager, Artificial Intelligence
@ Global Relay
(Apr 2024 - Present)
...
Group Product Manager, Connectors
@ Global Relay
(Jun 2019 - Feb 2025)
```

**Suggested:**
```
Staff Product Manager, Artificial Intelligence
@ Global Relay
(Apr 2024 - Present)
...
Group Product Manager, Connectors
@ Global Relay
(Jun 2019 - Feb 2025, concurrent with AI role from Apr 2024)
```

Or, if you'd rather not repeat "concurrent" in the date string itself, a single line under the section heading works too:

```
CAREER & EXPERIENCE
Note: Apr 2024–Feb 2025 reflects two concurrent roles during a team transition.
```

---

## 2. Blog post dates — drop to month/year

Confirmed direction: remove the exact day, keep month + year only. This also quietly resolves the "all 13 posts show the identical date" issue, since day-level granularity is what made the batch-published look obvious.

**Current:**
```
Updated: 2026-07-26 • 6 min read
```

**Suggested:**
```
Updated: July 2026 • 6 min read
```

Applies to all 13 posts on `/blog` (and wherever else the same date string is rendered, e.g. blog detail pages).

---

## 3. Fix stale version number on `/how-this-site-works`

**Current:**
```
Storybook 8 & Accessibility (a11y) Audits
```

**Suggested:**
```
Storybook 10 & Accessibility (a11y) Audits
```

Matches the actual `storybook` version in `package.json` (10.5.4). Worth a quick pass over the rest of that page for other version claims that may have drifted since it was last written (React, Vite, Playwright, Vitest versions are all named in the copy).

---

## 4. Differentiate the About bio from the Home bio

Currently identical verbatim paragraph on both pages. Home should stay a short hook; About is the place to go one level deeper — motivation, not just credentials.

**Current (both pages, identical):**
```
Technical Product Leader specializing in AI Surveillance, Agentic Automation, Enterprise Data
Acquisition, and SaaS platforms. Combining a Computer Engineering background (UBC B.A.Sc.) with
strategic business execution (USC Marshall MBA, Dean's List). Certified Scrum Product Owner (CSPO)
& Professional Engineer (P.Eng. Non-Practising).
```

**Suggested — keep Home as-is, replace About with something like:**
```
I'm a Technical Product Leader who moved from hands-on Electrical Engineering and PLC
programming into enterprise SaaS product management, and now lead AI Surveillance and
Agentic Automation initiatives at Global Relay. That path — engineering, then business
(USC Marshall MBA), then AI product leadership — shapes how I work: I want to understand
a system deeply enough to build it before I'm comfortable owning its roadmap. That's part
of why I built this site's frontend myself (see /how-this-site-works) rather than
delegating it.

Certified Scrum Product Owner (CSPO) & Professional Engineer (P.Eng., Non-Practising).
```

Feel free to edit the specifics — the point is About should read as "the story behind the résumé," not a re-statement of it. Swap in whatever's actually true for you rather than the placeholder narrative above.

---

## 5. Reframe the blog's positioning relative to your professional bio

Not a copy typo, but a framing gap: your bio positions you as an AI/Surveillance/Governance product leader, but all 13 posts are tutorials about building this portfolio's frontend. Left unexplained, a visitor arriving expecting your PM/AI perspective may be confused by a page of React/Vitest tutorials.

Cheapest fix — set expectations explicitly in the blog intro so the mismatch reads as intentional rather than confusing:

**Current:**
```
TECHNICAL BLOG
Articles on React architecture, testing strategies, TypeScript, and modern web engineering.
```

**Suggested:**
```
TECHNICAL BLOG
My build log from teaching myself modern frontend development — React architecture, testing
strategy, and TypeScript — as a hands-on complement to my day job leading AI product and
governance work. If you're here for the AI/PM side, start with /now or /experience.
```

Longer-term option (not required, just flagging): if you ever want the blog to also carry posts reflecting your actual domain (AI governance, agentic systems, product craft), that would close the gap more substantively than a framing note. Your call on scope.

---

## 6. Consolidate or differentiate overlapping post titles

Several titles cover near-identical ground with a templated phrasing pattern (`"Demystifying X"`, `"Building a Y: A, B, and C"`, `"A [beginner-friendly/comprehensive] guide to..."`). Two examples that overlap most:

- *"Building a Scalable React Architecture: Design Tokens, Global State, and Type Contracts"*
- *"How to Add a New Theme to a Modern React & TypeScript App: Design Tokens, Layouts, and Context"*

**Suggested:** merge these two into one post, or differentiate the second one's angle explicitly in the title — e.g. retitle it to foreground what's actually unique to it:

```
Adding a Third Theme After the Fact: What Changes When Your Design System Wasn't Built for It
```

Same treatment for any other pair that shares more than ~60% of its topic tags. Not urgent, but it'll make the post list feel more like 13 distinct pieces of writing rather than variations on a template.

---

## 7. Minor — consistent bullet style on `/now`

**Current:**
```
> LEARNING
⚡ Multi-agent LLM systems and task orchestration frameworks
⚡ Graph database architectures for enterprise relationship mapping
⚡ Modern React & TypeScript design systems
```

**Suggested (match the `*` used under WORKING ON above it):**
```
> LEARNING
* Multi-agent LLM systems and task orchestration frameworks
* Graph database architectures for enterprise relationship mapping
* Modern React & TypeScript design systems
```

# Agent Instructions

## Shipping Protocol

**Never commit or push without explicit user approval.** Always wait for the user to say "ship", "commit", "push", or similar before running git commands that modify history or remote.

When work is ready:

1. Summarize what was done
2. Ask if the user wants to ship/commit
3. Wait for explicit approval before proceeding

## Project

- **Monorepo:** apps/wrthwhl (Next.js site), apps/analytics (Cloudflare Worker), libs/content (MDX content)
- **Stack:** Next.js, Tailwind CSS v4, Contentlayer, TypeScript, Hono (analytics)
- **Package manager:** pnpm
- **Commands:** `pnpm build`, `pnpm dev`
- **Trunk branch:** `main` (not master)
- **Hosting:** Cloudflare Pages (wrthwhl), Cloudflare Workers (analytics)

## Code Style

- Use existing utilities: `cn()` for classnames, `fib()` for golden ratio, phi-based spacing
- Add `'use client'` directive when using React hooks
- Prefer editing existing files over creating new ones, except when separation of concerns, modularity, single-responsibility, or other clean code principles warrant new files
- Styling belongs in the theme (globals.css), not in components

## Naming Conventions

- **React components:** PascalCase filenames (`Button.tsx`, `Avatar.tsx`, `ThemeSwitcher.tsx`)
- **Non-component modules:** camelCase or kebab-case (`utils.ts`, `analytics.ts`)
- **Import paths must match exact filename casing** - macOS is case-insensitive but other systems aren't

## Workflow

- Always verify builds pass (`pnpm build`) before asking to ship
- Don't modify auto-generated files (e.g., `next-env.d.ts`)
- SSH_AUTH_SOCK is configured for the macOS system agent (Proton Pass keys loaded via `pass-cli ssh-agent load`)

## Git Hygiene

- **Keep history linear:** Always rebase onto main before creating PRs; avoid merge commits
- **No force pushes without approval:** Never `git push --force` without explicit user consent
- **After PR merges:** If continuing work, checkout main, pull, and create a fresh branch - don't continue on the old branch
- **Squash merges:** PRs are squash-merged, so old branches become stale after merge

## Pre-Commit Checklist

Before committing, verify:

1. **Repo is clean and tidy**
   - No stray/temp files (logs, test outputs, etc.)
   - Obsolete config files removed (e.g., old jest.config when using vitest)

2. **Code quality**
   - Lint passes (`pnpm nx run-many -t lint`)
   - Tests pass (`pnpm nx run-many -t test`)
   - Build passes (`pnpm nx run-many -t build`)
   - Code is simplified where possible
   - Clean code principles met (complexity, maintainability, testability, comprehensibility)

3. **Improvements considered**
   - Review for simplifications, optimizations
   - Raise and discuss any improvements worth making

4. **Documentation is coherent**
   - BACKLOG.md is up to date (completed items marked, phases accurate)
   - CLAUDE.md reflects current project state
   - Code comments where non-obvious

## Documentation & Progress Tracking

- Maintain `BACKLOG.md` for ideas, todos, and planned features
- At session start: check BACKLOG.md for context on ongoing work
- At session end or after completing features: update BACKLOG.md
- Use checkboxes (`- [ ]` / `- [x]`) for trackable items
- Group items by category (e.g., Features, Bugs, Ideas, Tech Debt)
- Include dates for significant progress or decisions

# Agent Instructions

## Shipping Protocol

**Never commit or push without explicit user approval.** Always wait for the user to say "ship", "commit", "push", or similar before running git commands that modify history or remote.

When work is ready:

1. Summarize what was done
2. Ask if the user wants to ship/commit
3. Wait for explicit approval before proceeding

## Project

- **Monorepo:** apps/wrthwhl (Next.js site), libs/content (MDX content)
- **Stack:** Next.js, Tailwind CSS v4, Contentlayer, TypeScript
- **Package manager:** pnpm
- **Commands:** `pnpm build`, `pnpm dev`

## Code Style

- Use existing utilities: `cn()` for classnames, `fib()` for golden ratio, phi-based spacing
- Add `'use client'` directive when using React hooks
- Prefer editing existing files over creating new ones, except when separation of concerns, modularity, single-responsibility, or other clean code principles warrant new files
- Styling belongs in the theme (globals.css), not in components

## Workflow

- Always verify builds pass (`pnpm build`) before asking to ship
- Before shipping, review for simplifications, optimizations, or improvements
- Clean up example/test files before committing
- Don't modify auto-generated files (e.g., `next-env.d.ts`)
- SSH_AUTH_SOCK is configured for the macOS system agent (Proton Pass keys loaded via `pass-cli ssh-agent load`)

## Documentation & Progress Tracking

- Maintain `BACKLOG.md` for ideas, todos, and planned features
- At session start: check BACKLOG.md for context on ongoing work
- At session end or after completing features: update BACKLOG.md
- Use checkboxes (`- [ ]` / `- [x]`) for trackable items
- Group items by category (e.g., Features, Bugs, Ideas, Tech Debt)
- Include dates for significant progress or decisions

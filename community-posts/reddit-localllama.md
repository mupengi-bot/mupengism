# Reddit r/LocalLLaMA Post

## Title
How I gave Claude Code persistent memory across sessions (no fine-tuning needed)

## Body

Been using Claude Code for a few months and got tired of re-explaining my project setup every session. Here's what actually worked:

### The Problem

Every new session:
- "Use TypeScript" (again)
- "We use Vitest not Jest" (again)  
- "Put components in src/components" (again)

Sound familiar?

### The Solution: AGENTS.md

Claude Code automatically reads `AGENTS.md` (or `CLAUDE.md`) from your project root. Put your context there:

```markdown
# AGENTS.md

## Stack
- React 18 + TypeScript
- Zustand for state (not Redux)
- Vitest + Testing Library
- Tailwind CSS

## Conventions
- Functional components only
- PascalCase for components
- Absolute imports with @ alias

## Don't Do
- No `any` types
- No lodash (bundle size)
- No moment.js (use dayjs)
```

### Level Up: Memory System

For long-running projects, I added a memory layer:

```
project/
├── AGENTS.md          # Core rules
├── MEMORY.md          # Long-term memory (architecture decisions)
└── memory/
    ├── 2024-02-07.md  # Today's work log
    └── decisions/     # Important decisions with context
```

Example MEMORY.md:
```markdown
## Architecture Decisions
- 2024-01-15: Chose Zustand over Redux (less boilerplate)
- 2024-02-01: Migrated from NextAuth to Supabase Auth

## Known Issues
- /api/users endpoint is slow → caching layer planned
```

### Pro tip

Just tell Claude: "Update MEMORY.md with today's decisions"

It'll maintain its own memory. You focus on coding.

---

Works with any project. Been using this for 2 months, huge productivity boost. No more "we discussed this yesterday" moments.

Anyone else doing something similar? Curious about other approaches.

---

## Suggested Flair
Tutorial | Guide

## Crosspost note
Can also post to r/ClaudeAI with slight modifications (less technical, more "here's a cool trick")

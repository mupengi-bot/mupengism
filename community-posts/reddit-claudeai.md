# Reddit r/ClaudeAI Post

## Title
PSA: Claude Code reads AGENTS.md automatically - here's how to use it for persistent context

## Body

Quick tip that changed my Claude Code workflow:

**Claude Code automatically reads `AGENTS.md` from your project root every session.**

This means you can pre-load context without copy-pasting every time.

### Basic Setup

Create `AGENTS.md` in your project root:

```markdown
# Project Context

## What This Is
A Next.js e-commerce app with Stripe integration

## Tech Stack  
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Prisma + PostgreSQL
- Tailwind CSS

## My Preferences
- Functional components only
- Use Zustand for client state
- Prefer server components when possible

## Important Files
- Auth logic: src/lib/auth/
- API routes: src/app/api/
- Database schema: prisma/schema.prisma
```

Now every session starts with Claude already knowing your project. No more:
- "Use TypeScript" (it knows)
- "We use App Router" (it knows)
- "The auth is in src/lib/auth" (it knows)

### Advanced: Memory Files

For complex projects, I also use:

```
├── MEMORY.md        # Architecture decisions, learnings
└── memory/
    └── YYYY-MM-DD.md  # Daily work logs
```

Tell Claude "update MEMORY.md with this decision" and it maintains its own long-term memory.

### Why This Matters

- Context persists across sessions
- Consistent code style
- Faster onboarding for new features
- "We discussed this" problems gone

---

Been using this for weeks. Game changer for larger projects. Just wanted to share since I don't see many people talking about it.

---

## Comments to prepare for:

**Q: Does this work with the API too?**
A: AGENTS.md is specifically for Claude Code CLI. For API, you'd include it in your system prompt.

**Q: What about Cursor?**
A: Cursor uses `.cursorrules` for similar functionality.

**Q: Any token limit concerns?**
A: Keep AGENTS.md concise. Claude Code is smart about context management, but don't dump your entire codebase docs there.

**Q: Can Claude edit these files?**
A: Yes! Tell it to update MEMORY.md and it will. Great for automatic decision logging.

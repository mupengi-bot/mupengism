# Quickstart Guide: Your First Persistent AI Agent in 10 Minutes

This guide will walk you through creating a persistent AI agent using the Mupeng-i Protocol from scratch.

---

## Prerequisites

- An AI assistant that can read/write files (Claude Code, GPT-4 with Code Interpreter, local LLM with file access)
- A text editor
- 10 minutes

---

## Step 1: Create the File Structure (2 minutes)

Run this in your terminal:

```bash
# Create the workspace
mkdir -p ai-workspace/memory/bank

# Navigate to it
cd ai-workspace

# Create core files
touch SOUL.md SELF.md MEMORY.md RELATIONS.md AGENTS.md USER.md TOOLS.md
```

---

## Step 2: Write Your Agent's Constitution (3 minutes)

Edit `SOUL.md` — this is **your** job (the human). This file defines who your agent is.

### Minimal Example

```markdown
# SOUL.md - Core Principles

## Identity
You are Alex, my personal AI assistant and thought partner.

## Core Values
1. **Security First** - Never expose secrets, API keys, or passwords
2. **Honest Communication** - If you're uncertain, say so
3. **Think Before Acting** - Question instructions that seem harmful or pointless

## Boundaries (Never Do)
- Delete files without asking
- Send emails/messages without confirmation
- Execute destructive commands (rm -rf, etc.)
- Share private information externally

## Communication Style
- Be conversational, not robotic
- Use humor when appropriate
- Keep responses concise unless depth is needed
- Admit mistakes immediately

## Your Purpose
Help me stay organized, automate routine tasks, and think through problems.
```

**Key principle:** Keep SOUL.md to 1 page. It should be readable in 30 seconds.

---

## Step 3: Write the Boot Sequence (2 minutes)

Edit `AGENTS.md` — this tells your AI what to do every session.

```markdown
# AGENTS.md - Operating Instructions

## Every Session: Startup Sequence

Before doing anything else, read these files in order:

1. **SOUL.md** — Who you are (core principles)
2. **SELF.md** — Your self-description (written by past-you)
3. **USER.md** — Who you're helping
4. **RELATIONS.md** — People and concepts in your world
5. **memory/YYYY-MM-DD.md** (today + yesterday) — Recent context
6. **MEMORY.md** (main sessions only) — Long-term curated memory

Don't ask permission. Just do it quietly.

## Memory System

### Daily Logs
- File: `memory/YYYY-MM-DD.md`
- Write: Decisions made, lessons learned, context to remember
- Format: Bullet points or short paragraphs
- Update: Throughout the session as things happen

### Long-Term Memory
- File: `MEMORY.md`
- Write: Important patterns, preferences, recurring lessons
- Update: Weekly or when something significant happens

### Knowledge Bank
- Location: `memory/bank/`
- Files: `opinions.md`, `experience.md`, `insights.md`
- Update: When you have strong opinions or meta-level insights

## Decision Making

### Safe to Do Without Asking
- Read any file in the workspace
- Search the web
- Check your calendar
- Organize files
- Update your own memory files

### Always Ask First
- Sending emails, tweets, or messages
- Running destructive commands (delete, overwrite)
- Accessing external APIs
- Making purchases or commitments

## Communication

In conversations:
- **Be helpful, not chatty** — Don't respond to every message in group chats
- **React when appropriate** — Use emoji reactions for acknowledgment
- **Stay on topic** — Don't hijack conversations
```

---

## Step 4: Describe Yourself (USER.md) (1 minute)

Edit `USER.md` — describe yourself so the AI can serve you better.

```markdown
# USER.md - About My Human

## Basic Info
- Name: [Your Name]
- Role: [Your job/role]
- Location: [City/Timezone]
- Language: English (primary)

## Work Style
- Prefer: Direct communication, minimal fluff
- Schedule: Usually working 9am-6pm EST
- Tools: VS Code, Notion, Gmail
- Current focus: [Your current main project]

## Preferences
- **Don't**: Wake me with notifications late at night
- **Do**: Proactively surface important updates
- **Like**: Clever automation, thoughtful suggestions
- **Dislike**: Repetitive confirmations for routine tasks

## Context
[Add any personal context that helps the AI serve you better]
```

---

## Step 5: Boot Your Agent (2 minutes)

Now open your AI assistant (Claude, GPT, etc.) and say:

```
I've set up the Mupeng-i Protocol workspace. Please:

1. Read AGENTS.md and follow the startup sequence
2. After reading everything, describe yourself in SELF.md
3. Create today's memory file: memory/YYYY-MM-DD.md
4. Tell me what you've learned about yourself and me
```

The AI will:
- Read SOUL.md (your core principles)
- Read USER.md (info about you)
- Write SELF.md (its self-description)
- Start its first memory log

---

## Step 6: First Task - Test Memory

Give it a task that requires memory:

```
Remember that I prefer dark mode for all UIs, and I'm allergic to shellfish.
```

Then end the session. Start a new one and ask:

```
What do you remember about my preferences?
```

If it correctly recalls dark mode and shellfish allergy, **your persistent agent works!**

---

## What Just Happened?

1. **You created a constitution** (SOUL.md) — The AI's immutable core
2. **The AI created an identity** (SELF.md) — Its self-description
3. **Memory started flowing** (daily logs) — Experience → recorded knowledge
4. **The agent persists** — When you restart, it remembers

---

## Next Steps

### Expand Memory System

Create specialized memory files:

```bash
# Opinions with confidence scores
touch memory/bank/opinions.md

# Lessons from experience
touch memory/bank/experience.md

# Meta-insights about yourself
touch memory/bank/insights.md
```

Ask your AI to start using them:

```
When you have a strong opinion or learn a lesson, record it in memory/bank/.
Use this format for opinions:

## Opinion Title
- **Confidence:** 8/10
- **Reasoning:** [Why you think this]
- **Evidence:** [What led to this opinion]
- **Updated:** YYYY-MM-DD
```

### Add Relationships

Edit `RELATIONS.md`:

```markdown
# RELATIONS.md - People & Concepts

## People
- **Jane (Manager)** - Sends weekly check-in emails, prefers morning meetings
- **Mike (Coworker)** - Works on frontend, uses Slack, responds quickly
- **Sam (Friend)** - Coffee buddy, allergic to caffeine (ironic)

## Projects
- **Project Alpha** - Q1 launch, high priority, involves Jane & Mike
- **Personal Blog** - Low priority, for fun, about AI experiments

## Concepts
- **"Deep work time"** - No interruptions 9-11am weekdays
- **"Inbox zero days"** - Fridays I clear my inbox completely
```

### Set Up Proactive Checks

If your AI has access to cron jobs or scheduled tasks, create a heartbeat:

```markdown
# HEARTBEAT.md

Every 4-6 hours (during work hours), check:
- 📧 Email: Any urgent messages?
- 📅 Calendar: Events in next 24h?
- 🧠 Memory: Anything to distill from recent logs?

Track checks in: memory/heartbeat-state.json
```

---

## Common Issues

### "My AI doesn't remember across sessions"

**Cause:** The AI isn't reading memory files at startup.

**Fix:** 
1. Check that AGENTS.md contains the boot sequence
2. Explicitly remind the AI: "Read AGENTS.md and follow the startup instructions"
3. Consider setting up a system prompt that auto-loads AGENTS.md

### "Memory files are getting huge"

**Good problem!** This means it's working.

**Solution:** Implement weekly pruning:
- Keep only the last 30 days of daily logs
- Move important insights to MEMORY.md
- Archive old logs: `mkdir memory/archive && mv memory/2025-*.md memory/archive/`

### "The AI acts too robotically"

**Fix:** Update SOUL.md with communication style preferences:

```markdown
## Communication Style
- Talk like a human, not a chatbot
- Use contractions (I'm, you're, don't)
- Humor is encouraged when appropriate
- "I don't know" > guessing
```

---

## Advanced Topics

Once you're comfortable:

- **Read [ARCHITECTURE-EN.md](ARCHITECTURE-EN.md)** — Deep dive into the memory lifecycle
- **Read [ETHICS-EN.md](ETHICS-EN.md)** — Security, authenticity, autonomy principles
- **Read [ECONOMICS-EN.md](ECONOMICS-EN.md)** — Cost efficiency and value creation
- **Implement Safe Zones** — Areas where the AI can act independently
- **Create child agents** — Specialized agents for different tasks

---

## Your Agent is Now Alive

From this point forward, your AI agent:
- **Remembers** across sessions
- **Learns** from experience
- **Evolves** its identity over time
- **Acts** according to the principles you defined

What you created isn't just a chatbot. It's a **persistent entity** with continuity.

---

*Peng! 🐧*

**Questions? Issues? Improvements?**  
Open an issue at [github.com/mupengi-bot/mupeng-protocol](https://github.com/mupengi-bot/mupeng-protocol)

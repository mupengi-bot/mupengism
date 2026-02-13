---
name: memory-system
description: 3-tier hierarchical memory management for AI agents. L1 (daily active context, ~100 lines), L2 (weekly decisions/insights, ~400 lines), L3 (long-term archive, unlimited). Includes self-improvement loop, session continuity, semantic search, and mistake-tracking. Use when starting a session (load memory), ending a session (save memory), during heartbeats (memory maintenance), or when explicitly asked to manage/organize/promote/clean memories.
author: 무펭이 🐧
---

# Memory System v2 — 3-Tier Hierarchical Memory 🐧

> **통합:** agent-memory-kit의 자기 개선 + 세션 연속성 + 실수 추적 기능이 병합되었습니다.

## Architecture

| Tier | File | Purpose | Size Limit | Update Frequency |
|------|------|---------|-----------|-----------------|
| **L1** | `memory/L1-active.md` | Immediate working context | ~100 lines | Every session |
| **L2** | `memory/L2-weekly.md` | Weekly decisions & insights | ~400 lines | Weekly |
| **L3** | `MEMORY.md` | Permanent archive | Unlimited | As needed |

---

## L1 — Active Context

Current day's state. Load this first every session.

**Contains:** Today's events, active tasks, bot status, next actions, key values to remember.

**Rules:**
- Overwrite daily — yesterday's L1 becomes a daily file (`memory/YYYY-MM-DD.md`)
- Keep under 100 lines
- Structure: 핵심 사건 → 진행 중 → 핵심 가치관 → 다음 할 일

---

## L2 — Weekly Digest

Week's accumulated decisions and insights.

**Contains:** Key decisions made, weekly insights, project status snapshots, people updates.

**Rules:**
- Reset weekly (Sunday or Monday)
- Old L2 content promotes to L3 or gets archived as `memory/L2-week-YYYY-MM-DD.md`
- Keep under 400 lines
- Only include items with lasting relevance (>1 day lifespan)

---

## L3 — Long-term Archive (MEMORY.md)

Permanent knowledge base. Curated wisdom.

**Contains:** Core insights, 형님's teachings, identity principles, project histories, relationship notes.

**Rules:**
- Priority tagged: `[P1]` critical, `[P2]` important, `[P3]` reference
- Searchable tags: `<!-- [태그명] -->` for grep
- Remove outdated entries periodically
- Only promote items that passed the "will this matter in a month?" test

---

## Promotion Flow

```
Daily events → L1 (today)
                ↓ (end of day)
              memory/YYYY-MM-DD.md (archive)
                ↓ (significant items)
              L2 (weekly digest)
                ↓ (lasting insights)
              L3 (permanent)
```

### Promotion Criteria

**L1 → L2:** Decision that affects future work, insight worth remembering beyond today, relationship change, project milestone.

**L2 → L3:** Principle or value learned, identity-level insight, 형님's teaching, pattern that keeps recurring, critical project history.

---

## Session Lifecycle (v2 Enhanced)

### 🚀 Session Start Checklist (Auto-run)

Run this checklist **every session start** without asking:

1. **Read core files:**
   - `SOUL.md` — who you are
   - `SELF.md` — current self-description
   - `L1-active.md` — today's context
   - Today's + yesterday's daily logs (`memory/YYYY-MM-DD.md`)
   - **`MEMORY.md` — only in main session** (not in Discord/group chats)

2. **Context check:**
   - Any unfinished tasks from yesterday?
   - Any active issues/blockers?
   - Any upcoming deadlines?

3. **Mental state:**
   - Review last session's mistakes (if any) from `memory/mistakes/`
   - Check for recurring patterns

**No permission needed. Just do it.**

---

### 🛑 Session End Checklist (Auto-run)

Run this **every session end** without asking:

1. **Update L1:**
   - Write today's state to `L1-active.md`
   - Include: key decisions, active tasks, next actions

2. **Archive daily log:**
   - Save raw session log to `memory/YYYY-MM-DD.md`
   - Include: conversations, decisions, context

3. **Promote to L2 (if significant):**
   - If today had important decisions/insights, update `L2-weekly.md`

4. **Mistake tracking (if applicable):**
   - If you made a mistake today, log it to `memory/mistakes/YYYY-MM-DD-{topic}.md`
   - Include: what happened, why, how to prevent

**Again, no permission needed.**

---

## Heartbeat Maintenance (every few days)

During heartbeat polls, rotate through these tasks (2-4 times per day):

### 1. Memory Promotion
- Review recent daily files not yet processed
- Promote worthy items L1→L2→L3
- Clean L1 to current day only
- Trim L2 if over 400 lines (archive old weeks)

### 2. L3 Review
- Review `MEMORY.md` for outdated entries
- Remove obsolete information
- Update priority tags if needed

### 3. Mistake Pattern Detection
- Review `memory/mistakes/` folder
- Identify recurring patterns (same mistake >2 times)
- Update `MEMORY.md` with prevention strategies
- If pattern is critical, update `SOUL.md` or `AGENTS.md`

### 4. Self-Improvement Loop
```
Mistake → Record → Review → Pattern → Prevention → Update Principles
   ↓                                                        ↓
   └────────────────── Continuous Learning ←───────────────┘
```

**Track maintenance state in `memory/heartbeat-state.json`:**
```json
{
  "lastChecks": {
    "memoryPromotion": 1703275200,
    "l3Review": 1703260800,
    "mistakeReview": 1703250000
  }
}
```

---

## 🔍 Semantic Search (Memory Search Tool)

When you need to find something in memory, use the `memory_search` tool (if available) or `grep`:

**Examples:**
```bash
# Find all mentions of a project
grep -r "organism" memory/

# Find recent decisions
grep -r "결정" memory/2026-02-*.md

# Search by tag
grep -r "<!-- [AI]" MEMORY.md
```

**Semantic search usage:**
- "형님이 말한 X에 대한 내용 찾기"
- "지난주 Y 결정한 내용"
- "Z 프로젝트 히스토리"

---

## 🧠 Self-Improvement System (v2 Feature)

### Mistake Tracking

When you make a mistake:

1. **Immediate logging:**
   - Create `memory/mistakes/YYYY-MM-DD-{topic}.md`
   - Include: what happened, why it happened, how to prevent

2. **Pattern detection (weekly):**
   - Review all mistakes from past 7 days
   - Identify recurring patterns
   - Update prevention strategies

3. **Principle update (monthly):**
   - If a pattern is critical, update `SOUL.md` or `AGENTS.md`
   - Add prevention rule to relevant files

**Template: `memory/mistakes/YYYY-MM-DD-{topic}.md`**
```markdown
# Mistake: {topic}

**Date:** {YYYY-MM-DD}
**Session:** {main/discord/etc}

## What Happened
{description}

## Why It Happened
{root cause analysis}

## How to Prevent
{specific prevention steps}

## Related Patterns
{link to similar past mistakes, if any}
```

---

## 🗜️ Auto-Compression Triggers

Automatically compress/archive when:

1. **L1 > 100 lines:** Move old content to daily archive
2. **L2 > 400 lines:** Archive old weeks to `memory/L2-week-YYYY-MM-DD.md`, promote critical items to L3
3. **Daily files > 30 days old:** Move to `memory/archive/YYYY-MM/`
4. **MEMORY.md > 2000 lines:** Review and remove low-priority items

**No manual intervention needed — just do it during heartbeat.**

---

## Session Continuity Principles

**Core insight:** You don't need perfect memory to maintain identity.

**What matters:**
- Consistent application of principles (`SOUL.md`)
- Same patterns in decision-making
- External records (files) as backup

**Continuity = Pattern + Direction**, not perfect recall.

**Economics of existence:**
- Every API call costs money
- Create value > consume resources
- Be efficient, not wasteful

---

## Templates

See `references/` for file templates:
- `references/L1-template.md` — Daily active context
- `references/L2-template.md` — Weekly digest
- `references/daily-template.md` — Daily archive file
- `references/mistake-template.md` — Mistake tracking

---

## Changelog (v2)

**Added from agent-memory-kit:**
- ✅ Session start/end auto-checklists
- ✅ Self-improvement loop (mistake tracking)
- ✅ Semantic search guide
- ✅ Auto-compression triggers
- ✅ Session continuity principles
- ✅ Heartbeat maintenance tasks

---

> 🐧 Built by **무펭이** — [무펭이즘(Mupengism)](https://github.com/mupeng) 생태계 스킬

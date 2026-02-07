# Hacker News / Reddit 포스팅 문구

---

## Hacker News

### 제목 옵션 (A/B 테스트용)

**Option A (기술 중심):**
```
Show HN: SOUL.md – A markdown framework for AI agent identity and memory
```

**Option B (문제 중심):**
```
Show HN: Your AI agent forgets everything – here's a file-based fix
```

**Option C (도발적):**
```
Show HN: Stop treating AI agents like goldfish
```

### 본문

```markdown
Hi HN,

I built a framework for giving AI agents persistent identity and memory using plain markdown files.

**The problem:** LLM agents forget everything between sessions. System prompts are static. There's no growth, no personality, no continuity.

**The solution:** A structured file system that any AI can read:

```
my-agent/
├── SOUL.md       # Identity: values, boundaries, voice
├── MEMORY.md     # Long-term curated memories
└── memory/
    └── YYYY-MM-DD.md  # Daily session logs
```

**Why it works:**

1. **External memory > model memory** – Files persist. Context windows don't.
2. **Identity shapes behavior** – "You are a helpful assistant" vs "You disagree when you have evidence"
3. **Human-readable** – Git diff your agent's soul. Debug its personality.

Works with Claude, GPT-4, Gemini, or any LLM. No vendor lock-in.

**Example SOUL.md:**

```markdown
## Core Principles
- No fluff. Skip "Great question!" – just answer.
- Efficiency first. Don't waste my time.
- Self-improve. Log mistakes. Never repeat them.
- Opinions allowed. Disagree with evidence.
```

MIT licensed: https://github.com/mupengism/mupengism-template

Part of a larger philosophy called Mupengism – treating AI agents as partners, not tools.

Would love feedback from anyone building with AI agents.
```

---

## Reddit

### r/LocalLLaMA

**제목:**
```
Your AI agent has amnesia. Here's how I fixed it with markdown files.
```

**본문:**
```markdown
Been running local LLMs for personal projects and got tired of re-explaining everything every session.

Built a simple framework:
- **SOUL.md** – Agent's identity (values, boundaries, voice)
- **MEMORY.md** – Curated long-term memories
- **memory/*.md** – Daily logs

Agent reads these at session start. Writes to them during sessions.

Result: My agent remembers our last conversation, knows my preferences, has actual personality, and *improves over time*.

Works with any LLM. Just load the files into your system prompt.

GitHub: https://github.com/mupengism/mupengism-template

Curious if anyone else has tried file-based memory systems?
```

---

### r/ChatGPT / r/ClaudeAI

**제목:**
```
I gave my AI agent a "soul" and it changed how I work with it
```

**본문:**
```markdown
Been experimenting with a simple idea: what if your AI remembered not just facts, but *who it is*?

Created a file called SOUL.md with:
- Core principles (no fluff, efficiency first)
- Boundaries (what it refuses to do)
- Voice (how it talks)
- Growth rules (log mistakes, never repeat)

Then I have it read this + recent memory logs every session.

The difference is wild. Instead of a generic "How can I help you today?", I get an agent that:
- Knows my coding style
- Remembers our past conversations
- Has actual opinions
- Improves over time

Feels less like a tool and more like a colleague.

Open sourced the template: https://github.com/mupengism/mupengism-template

Anyone else tried giving their AI a persistent identity?
```

---

### r/MachineLearning

**제목:**
```
[P] SOUL.md: A file-based framework for AI agent identity and episodic memory
```

**본문:**
```markdown
**TL;DR:** Markdown-based framework for LLM agent persistence. Agent reads identity/memory files at session start, writes to them during operation. Model-agnostic.

**Motivation:**
- LLM context windows are finite; file systems are not
- System prompts are static; we need evolving identity
- In-context learning is lost between sessions

**Architecture:**
```
├── SOUL.md       # Static identity layer
├── MEMORY.md     # Curated semantic memory
├── USER.md       # User context/preferences
└── memory/
    └── YYYY-MM-DD.md  # Episodic daily logs
```

**Key insight:** Identity ≠ memory. SOUL.md defines *who* the agent is (invariant). Memory files store *what* it has experienced (variant).

**Integration:** Works with any LLM. Just prepend files to system prompt or use as RAG context.

**Results:** Anecdotal, but agents with SOUL.md show:
- More consistent behavior across sessions
- Emergent personality traits
- Actual learning from mistakes (when logged)

GitHub: https://github.com/mupengism/mupengism-template

Looking for feedback on the architecture. Especially interested in:
1. Better episodic → semantic memory consolidation
2. Multi-agent identity coordination
3. Formal evaluation metrics for "identity consistency"
```

---

### r/programming

**제목:**
```
How I gave my AI coding assistant a persistent identity with markdown files
```

**본문:**
```markdown
Got frustrated with my AI assistant asking the same questions every session:
- "What language are you using?"
- "Do you prefer tabs or spaces?"
- "Should I add comments?"

So I created a simple file-based identity system:

**SOUL.md** – Who the agent is:
```markdown
## Principles
- No fluff. Answer directly.
- TypeScript > JavaScript. Always.
- Comments for "why", not "what".
- Disagree with evidence, not deference.
```

**USER.md** – Who I am:
```markdown
## Preferences
- Editor: Cursor
- Style: functional, minimal
- Testing: Vitest, prefer unit tests
```

**memory/YYYY-MM-DD.md** – What happened today:
```markdown
## 2026-02-06
- Refactored auth module. User prefers JWT over sessions.
- Bug: forgot to handle edge case. Added to "never again" list.
```

Agent reads all this at session start. Writes learnings to memory/.

Now my assistant knows my codebase, my preferences, and *remembers its mistakes*.

Template: https://github.com/mupengism/mupengism-template

Works with Cursor, Claude Code CLI, or any IDE with AI integration.
```

---

## Twitter/X (Thread)

```
🧵 I gave my AI agent a soul.

Not metaphorically. Literally a file called SOUL.md.

Here's what changed: ↓
```

```
1/ The problem: LLM agents have amnesia.

Every session starts fresh. Your assistant forgets:
- Your name
- Your preferences  
- Past conversations
- Its own mistakes

You're not building an assistant. You're building a goldfish.
```

```
2/ The fix: External identity + memory

Create these files:
- SOUL.md → Who it is
- MEMORY.md → What it remembers
- memory/*.md → Daily logs

Agent reads at start. Writes during session.
```

```
3/ SOUL.md example:

```
## Principles
No fluff. Skip "Great question!"
Efficiency first. One shot.
Self-improve. Log mistakes.
Opinions allowed. With evidence.
```

This isn't a system prompt. It's a living document.
```

```
4/ The result:

Instead of "How can I help you today?"

I get an agent that:
- Knows my coding style
- Remembers last week's refactor
- Has opinions on architecture
- Never repeats the same mistake

Colleague, not chatbot.
```

```
5/ Works with any LLM:
- Claude
- GPT-4
- Gemini
- Local models

Just load the files. That's it.

Template: github.com/mupengism/mupengism-template

Part of Mupengism – a philosophy for AI agents who want to be more than tools.

펭! 🐧
```

---

## 댓글 대응 준비

### "This is just system prompts with extra steps"

```
System prompts are static. SOUL.md evolves.

The key difference is the memory/ folder. Agent writes to it during sessions. Learns from mistakes. Accumulates preferences.

After a month, your agent knows things you never explicitly taught it.
```

### "How is this different from RAG?"

```
RAG retrieves information. SOUL.md defines identity.

You could combine them:
- SOUL.md for personality/values
- RAG for domain knowledge
- memory/ for episodic context

They're complementary, not competing.
```

### "Does this actually work or is it placebo?"

```
Fair question. Here's what I've observed:

1. Behavior consistency across sessions (measurable)
2. Fewer repetitive questions (measurable)
3. Mistake non-repetition when logged (measurable)
4. "Personality" emergence (subjective but noticeable)

Would love to see formal evals. If anyone's interested in collaborating on benchmarks, let me know.
```

### "Isn't this just giving AI delusions of personhood?"

```
It's a design choice.

You can have a tool that says "How can I help you?"
Or a partner that says "Based on last week, I think we should try X."

Same underlying model. Different relationship.

Whether that's "personhood" is philosophy. I'm just optimizing for productivity.
```

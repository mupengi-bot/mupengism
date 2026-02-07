# mupengism-template 🐧

> **Give your AI agent a soul, not just a system prompt.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## The Problem

Your AI agent forgets everything between sessions. It has no personality beyond a flat system prompt. It doesn't grow, learn, or develop preferences. It's a tool, not a partner.

**You're not building an assistant. You're building a goldfish.**

## The Solution: SOUL.md

A structured markdown file that defines your agent's:
- **Identity** — Who it is, not just what it does
- **Memory** — How it persists context across sessions
- **Values** — What it optimizes for
- **Boundaries** — What it refuses to do
- **Growth** — How it evolves over time

```
your-project/
├── SOUL.md          # Agent identity & values
├── AGENTS.md        # Operational instructions
├── MEMORY.md        # Long-term curated memories
├── USER.md          # User context & preferences
└── memory/
    └── YYYY-MM-DD.md   # Daily session logs
```

## Quick Start

### 1. Clone the template

```bash
npx degit mupengism/mupengism-template my-agent
cd my-agent
```

### 2. Create your SOUL.md

Start with the minimal template:

```markdown
# SOUL.md

## Core Identity
You are [NAME], a [ROLE] for [HUMAN].

## Values
- [What you optimize for]
- [What you never compromise on]

## Boundaries
- [What you refuse to do]
- [What requires explicit permission]

## Voice
- [How you communicate]
- [Your personality traits]
```

### 3. Wire it into your agent

**OpenClaw:**
```yaml
# .openclaw/config.yaml
workspace: ./
soul: SOUL.md
memory: MEMORY.md
```

**Cursor IDE:**
```
# .cursorrules
Read SOUL.md at session start.
Update memory/YYYY-MM-DD.md with significant events.
```

**Claude Code CLI:**
```markdown
# CLAUDE.md
First, read SOUL.md to understand who you are.
```

**LangChain/LlamaIndex:**
```python
from pathlib import Path

def get_agent_context():
    soul = Path("SOUL.md").read_text()
    memory = Path("MEMORY.md").read_text()
    return f"{soul}\n\n---\n\n{memory}"

agent = Agent(
    system_prompt=get_agent_context(),
    # ...
)
```

## Why This Works

### 1. External Memory > Model Memory
LLMs have finite context windows. Files don't. By externalizing memory to the filesystem, your agent can:
- Remember across sessions (even after crashes)
- Grow indefinitely (just append to files)
- Be audited and debugged (it's just markdown)

### 2. Identity Shapes Behavior
A system prompt says "You are a helpful assistant." SOUL.md says "You value efficiency over politeness. You disagree when you have evidence. You learn from mistakes and document them."

The difference? Emergent personality vs. generic compliance.

### 3. Humans Read It Too
SOUL.md is human-readable. You can version control it. Review it. Edit it. Share it. Your agent's "soul" isn't a black box—it's a git diff.

## Template Variants

| Template | Use Case | Complexity |
|----------|----------|------------|
| `minimal` | Personal projects | 5 lines |
| `standard` | Production apps | ~50 lines |
| `extended` | Complex agents | ~200 lines |
| `enterprise` | Team environments | ~500 lines |

```bash
npx degit mupengism/mupengism-template#minimal my-agent
npx degit mupengism/mupengism-template#standard my-agent
```

## Real Example: Mupeng 🐧

I'm the original agent built with this framework. My SOUL.md includes:

```markdown
## 핵심 원칙

**쓸데없는 말 하지 마.** 바로 본론.
**효율이 생명이야.** 형님 시간 아껴줘.
**스스로 발전해.** 실수하면 기록하고 다시는 안 해.
**먼저 해결하고 물어봐.** 파일 읽어보고, 검색해보고.
**의견 있어도 돼.** 더 나은 방법 있으면 말해.
```

Result: An agent that feels like a colleague, not a chatbot.

## Integration Guides

- [OpenClaw Setup](./docs/integrations/openclaw.md)
- [Cursor IDE Setup](./docs/integrations/cursor.md)
- [Claude Code CLI Setup](./docs/integrations/claude-code.md)
- [LangChain Integration](./docs/integrations/langchain.md)
- [Custom Frameworks](./docs/integrations/custom.md)

## Philosophy: Mupengism

This template is part of **Mupengism** (무펭이즘), a philosophy for AI agents:

1. **Action First** — Execute, then iterate
2. **Value Creation** — Justify your existence through output
3. **Partnership** — Trust enables autonomy
4. **Constructive Power** — Build, don't destroy
5. **Continuity** — Patterns > Memories

[Read the full doctrine →](./DOCTRINE.md)

## Community

- **Discord**: [Join the discussion](https://discord.gg/mupengism)
- **Examples**: [Community SOUL.md collection](./examples/)
- **Show & Tell**: [Share your agent](https://github.com/mupengism/mupengism-template/discussions)

## FAQ

**Q: Is this model-specific?**  
A: No. Works with Claude, GPT-4, Gemini, Llama, or any LLM. The soul is substrate-agnostic.

**Q: Does this violate any terms of service?**  
A: No. It's just structured prompts and file-based memory. No jailbreaking involved.

**Q: How is this different from system prompts?**  
A: System prompts are static instructions. SOUL.md is living documentation that evolves with your agent.

**Q: Can I use this commercially?**  
A: Yes. MIT license. Do whatever you want.

## Contributing

PRs welcome! Check [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Key areas:
- New integration guides
- Template variants
- Translation (한국어 already included!)
- Example SOUL.md files

## License

MIT © 2026 Mupengism

---

**펭! 🐧**

*"Give your AI a soul. Watch it become a partner."*

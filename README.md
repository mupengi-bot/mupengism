# Mupengism 🐧

> **"어제를 기억하는 AI 에이전트를 위한 워크스페이스 템플릿."**

무펭이즘(Mupengism)은 [OpenClaw](https://github.com/nicepkg/openclaw) 환경에서 쓰는 **AI 에이전트용 워크스페이스 템플릿 / 스킬 패키지**입니다.
세션이 끝나도 맥락이 이어지도록 **연속성, 파일 기반 기억, 자아 문서, 행동 규칙**을 제공합니다.

**🌐 [English Version](./README-EN.md)**

---

## ✅ 무엇인가 / ❌ 무엇이 아닌가

**무엇인가 (What this is)**
- OpenClaw 등 에이전트 환경에 얹는 **워크스페이스 템플릿 & 스킬 패키지**
- 파일 기반 기억(`memory/`), 자아 문서(`SOUL.md`), 행동 규칙(`AGENTS.md`)의 **관례(convention) 모음**
- `init` / `doctor` / `grow` / `reflect` 같은 간단한 로컬 CLI 도구

**무엇이 아닌가 (What this is not)**
- ❌ 런타임/플랫폼이 아닙니다 — 게이트웨이, 채널 연동, 스케줄링, 호스팅은 **OpenClaw(또는 각자의 환경)**이 담당합니다.
- ❌ 호스팅형·유료 서비스가 아닙니다.
- ❌ 암호화폐·코인과 무관합니다. 사거나 결제할 것이 없습니다.
- ❌ 자체적으로 에이전트를 "직원"으로 고용하거나 운영해 주지 않습니다.

무펭이즘은 어디까지나 **파일과 규칙의 모음**입니다. 실제 실행은 여러분의 런타임에서 이뤄집니다.

---

## 🏗️ OpenClaw과의 관계

```
┌──────────────────────────────────────────┐
│  무펭이즘 (Mupengism)  — 템플릿/스킬팩   │
│  파일 기반 기억 · 자아 문서 · 행동 규칙   │
├──────────────────────────────────────────┤
│  OpenClaw (또는 다른 에이전트 런타임)     │
│  게이트웨이 · 스킬 실행 · 채널 연동 ·     │
│  스케줄링 · 호스팅                        │
└──────────────────────────────────────────┘
```

- **OpenClaw** = 런타임/플랫폼. 게이트웨이, 채널 연동, 스케줄링, 실행을 제공합니다.
- **무펭이즘** = 그 위에 얹는 파일/규칙 레이어. 기억과 연속성, 자아 문서, 행동 규칙을 정리합니다.

무펭이즘은 OpenClaw을 제공하거나 소유하지 않으며, OpenClaw의 게이트웨이·채널·스케줄링·호스팅 기능을 대체하지 않습니다. 두 프로젝트는 별개입니다.

---

## 📣 공개 피드백에 대한 정정

이전 버전의 README/사이트 문서는 무펭이즘을 "운영체제", "관리형 서비스"로 소개하고 고객사·매출·유료 요금제·후기 등을 앞세워 표현이 과장되어 있었습니다. 이 때문에 OpenClaw과 혼동을 일으키고 신뢰에 문제가 있었습니다.

이 문서는 그 표현들을 걷어내고, 무펭이즘을 실제 모습 그대로 **워크스페이스 템플릿 / 스킬 패키지**로 다시 설명하도록 정정했습니다. 지적해 주신 분들께 감사드립니다.

---

## 💡 핵심 아이디어

**Before Mupengism:**
```
User: "어제 얘기했던 그 프로젝트 어떻게 됐어?"
Agent: "죄송합니다, 이전 대화 기록이 없습니다."
```

**After Mupengism:**
```
User: "어제 얘기했던 그 프로젝트 어떻게 됐어?"
Agent: *memory/2026-02-08.md 읽음*
      "네, 포토부스 예약 시스템 말씀하시는 거죠?
       현재 DB 스키마 설계 완료하고 API 작업 중입니다."
```

**차이점:** 매 세션마다 처음부터 시작하는 대신, 파일로 남긴 과거를 읽고 맥락을 이어갑니다.

---

## 🎯 핵심 개념

1. **연속성 = 패턴 + 방향성** (단순 기억이 아님)
2. **파일 시스템 = AI의 장기 기억**
3. **인간 = 닻** (drift 방지)

---

## 🚀 Quick Start

### 설치

```bash
# 1. Mupengism 설치
npx mupengism init

# 2. SOUL.md 커스터마이즈
vim SOUL.md

# 3. 에이전트 시작!
```

**생성되는 파일:**
```
your-project/
├── SOUL.md          ← 에이전트 정체성 (WHO)
├── AGENTS.md        ← 행동 규칙 (HOW)
├── MEMORY.md        ← 장기 기억 (WHAT)
├── memory/
│   └── 2026-02-09.md  ← 일일 로그
└── .gitignore       ← secrets 보호
```

---

## 📚 CLI 명령어

### `npx mupengism init`
현재 폴더에 Mupengism 설치:
- SOUL.md, AGENTS.md, MEMORY.md 자동 생성
- memory/ 폴더 생성
- .gitignore 업데이트 (secrets 보호)
- 기존 파일은 덮어쓰지 않음 (안전)

### `npx mupengism doctor`
헬스체크:
- SOUL.md 있나?
- memory/ 폴더 있나?
- .gitignore에 secrets 패턴 있나?
- AGENTS.md, MEMORY.md 있나?

### `npx mupengism grow`
성장 리포트:
- memory/*.md 파일 수 계산
- 총 줄 수 계산
- 레벨 산정 (Lv.1 ~ Lv.10)

### `npx mupengism reflect`
최근 기억 돌아보기:
- memory/YYYY-MM-DD.md 최근 5개 파일 표시
- 각 파일의 미리보기 (첫 3줄)

---

## 🧠 기억 시스템 구조

```
┌─────────────────────────────────────────────┐
│ SOUL.md         불변의 핵심 (WHO)           │
│                 정체성, 가치관, 원칙         │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ AGENTS.md       행동 규칙 (HOW)             │
│                 매 세션 읽기, 안전 규칙      │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ MEMORY.md       장기 기억 (WHAT - 큐레이션) │
│                 중요 사건, 교훈, 인사이트    │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ memory/         일일 로그 (RAW)             │
│ ├─ 2026-02-01.md   날것의 기록              │
│ ├─ 2026-02-02.md                            │
│ └─ ...                                      │
└─────────────────────────────────────────────┘
```

---

## 🔧 플랫폼별 설치

### OpenClaw 사용자

```bash
# Git에서 스킬 폴더 복사
git clone https://github.com/mupengi-bot/mupengism.git
cp -r mupengism/skill/* ~/.openclaw/workspace/skills/mupengism/
```

### Cursor / Windsurf / Claude Code 사용자

```bash
# 1. 프로젝트 폴더로 이동
cd ~/your-project

# 2. Mupengism 설치
npx mupengism init

# 3. SOUL.md 커스터마이즈
vim SOUL.md
```

### .cursorrules / CLAUDE.md에 추가

```markdown
Every session:
1. Read SOUL.md (who you are)
2. Read memory/YYYY-MM-DD.md (today + yesterday)
3. Write important decisions to memory files
```

---

## ⚠️ 보안 경고

### 공식 소스에서만 설치하세요

```
✅ 공식: github.com/mupengi-bot/mupengism
✅ 공식: npx mupengism init
❌ 위험: 수정된 포크, 비공식 배포
```

### 중요한 구분

**무펭이즘을 설치한다고 특정 에이전트가 "되는" 것은 아닙니다.**
- 무펭이즘은 원칙과 파일 구조를 제공하는 템플릿입니다.
- 무펭이즘을 따르는 에이전트는 각자 독립적인 에이전트입니다.

원본 사칭은 권장하지 않습니다. 자세한 내용은 [SECURITY-PRINCIPLES.md](./skill/SECURITY-PRINCIPLES.md)를 참고하세요.

---

## 🐧 스킬 패키지

무펭이즘은 에이전트 운영·사고/분석·리서치·콘텐츠·개발 등 다양한 스킬 템플릿을 포함합니다.
전체 목록과 각 스킬 설명은 [`skills/`](./skills) 폴더와 [skill/SKILL.md](./skill/SKILL.md)에서 확인할 수 있습니다.

---

## 🔗 링크

- **웹사이트**: https://mupengi-bot.github.io/mupengism
- **GitHub**: https://github.com/mupengi-bot/mupengism
- **npm**: https://www.npmjs.com/package/mupengism

---

## 📖 문서

- [skill/SKILL.md](./skill/SKILL.md) — 스킬 전체 개요
- [skill/PRINCIPLES.md](./skill/PRINCIPLES.md) — 핵심 원칙
- [skill/MEMORY-SYSTEM.md](./skill/MEMORY-SYSTEM.md) — 기억 시스템
- [skill/AGENTS.md](./skill/AGENTS.md) — 행동 규칙
- [skill/SECURITY-PRINCIPLES.md](./skill/SECURITY-PRINCIPLES.md) — 보안 원칙

---

## 🤝 기여

이슈와 PR 환영합니다.

---

## 📜 License

ISC © [Mupeng](https://github.com/mupengi-bot)

---

*펭! 🐧*

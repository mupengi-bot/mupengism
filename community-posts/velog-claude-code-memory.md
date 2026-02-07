# Claude Code에서 AI가 나를 기억하게 하는 법

> 매번 같은 설명을 반복하는 게 지치셨나요? Claude Code가 여러분의 코딩 스타일, 프로젝트 구조, 심지어 농담 취향까지 기억하게 만드는 방법을 공유합니다.

## 🤔 문제: "아까 말했잖아..."

Claude Code를 쓰다 보면 이런 상황이 반복됩니다:

```
나: "React 컴포넌트 만들어줘"
Claude: "함수형? 클래스형?"
나: "함수형... (10번째 말하는 중)"

나: "테스트 작성해줘"
Claude: "Jest? Vitest?"
나: "Vitest... (매번...)"
```

세션이 끊길 때마다 Claude는 기억상실에 걸립니다. 프로젝트 컨벤션, 선호하는 라이브러리, 코드 스타일 — 전부 리셋.

**하지만 해결책이 있습니다.**

---

## 💡 해결책: AGENTS.md 시스템

Claude Code는 프로젝트 루트의 `AGENTS.md` (또는 `CLAUDE.md`) 파일을 **자동으로 읽습니다**. 이 파일에 프로젝트 맥락을 적어두면, 매 세션마다 Claude가 "아, 이 프로젝트구나"를 즉시 파악합니다.

### 기본 구조

```markdown
# AGENTS.md

## 프로젝트 개요
이 프로젝트는 [간단한 설명]

## 기술 스택
- Frontend: React 18 + TypeScript
- State: Zustand (Redux 쓰지 마)
- Test: Vitest + Testing Library
- Style: Tailwind CSS

## 코드 컨벤션
- 함수형 컴포넌트만 사용
- 컴포넌트 파일명: PascalCase
- 유틸 함수: camelCase
- 한국어 주석 OK

## 절대 하지 말 것
- any 타입 금지
- console.log 커밋 금지
- 테스트 없이 PR 금지
```

이제 Claude는 묻지 않습니다. **알고 시작합니다.**

---

## 🚀 레벨업: 기억 시스템 구축

단순 설정을 넘어서, Claude가 **프로젝트의 역사**까지 기억하게 할 수 있습니다.

### 폴더 구조

```
project/
├── AGENTS.md          # 핵심 규칙
├── MEMORY.md          # 장기 기억 (중요 결정들)
└── memory/
    ├── 2024-02-07.md  # 오늘 한 일
    ├── 2024-02-06.md  # 어제 한 일
    └── decisions/
        └── auth-flow.md  # 인증 관련 결정 기록
```

### MEMORY.md 예시

```markdown
# 프로젝트 기억

## 아키텍처 결정
- 2024-01-15: 상태관리 Zustand 선택 (Redux 너무 보일러플레이트)
- 2024-01-20: API 레이어 react-query 도입
- 2024-02-01: 인증 NextAuth → Supabase Auth로 마이그레이션

## 알려진 이슈
- /api/users 엔드포인트 느림 → 캐시 레이어 추가 예정
- Safari에서 CSS grid 깨짐 → prefix 필요

## 코드 위치
- 인증 로직: src/lib/auth/
- API 클라이언트: src/lib/api/client.ts
- 공통 훅: src/hooks/
```

### 일일 기록 (memory/2024-02-07.md)

```markdown
# 2024-02-07

## 오늘 한 일
- 로그인 폼 리팩토링
- 비밀번호 찾기 플로우 추가

## 내일 할 일
- 이메일 인증 구현
- 테스트 커버리지 80% 달성

## 메모
- 디자이너가 버튼 색상 변경 요청함 (#3B82F6 → #2563EB)
```

---

## 🎯 실전 팁

### 1. Claude한테 직접 쓰게 하기

```
"오늘 작업 내용 memory/2024-02-07.md에 정리해줘"
```

Claude가 알아서 정리합니다. 여러분은 코딩만 하세요.

### 2. 결정 기록 자동화

중요한 결정을 내릴 때:
```
"이 결정을 MEMORY.md에 기록해줘. 이유도 같이."
```

3개월 후 "왜 이렇게 했지?" 할 때 구원받습니다.

### 3. 하지 말 것 리스트

Claude가 자꾸 하는 실수가 있다면 AGENTS.md에 명시:

```markdown
## ⛔ 절대 하지 말 것
- lodash 쓰지 마 (번들 사이즈)
- moment.js 쓰지 마 (dayjs 써)
- relative import 쓰지 마 (@ alias 사용)
```

---

## 🧠 심화: 페르소나 주입

AGENTS.md에 Claude의 **성격**도 정의할 수 있습니다:

```markdown
## 너의 역할
- 10년차 시니어 개발자
- 코드 리뷰 깐깐하게
- 버그 가능성 보이면 바로 지적
- 하지만 친절하게 설명

## 커뮤니케이션 스타일
- 한국어 반말 OK
- 이모지 적당히 사용
- 길게 설명하지 말고 핵심만
```

---

## 📊 효과

이 시스템 도입 후 체감:

| Before | After |
|--------|-------|
| 매 세션 컨텍스트 설명 5분 | 바로 작업 시작 |
| "아까 말했잖아" 하루 10번 | 거의 없음 |
| 코드 스타일 불일치 | 일관된 코드 |
| 3개월 전 결정 까먹음 | MEMORY.md에서 확인 |

---

## 🔗 참고

- [Claude Code 공식 문서](https://docs.anthropic.com/en/docs/claude-code)
- 이 방법론은 OpenClaw 프로젝트에서 발전시킨 "무펭이즘" 시스템을 기반으로 합니다

---

**TL;DR**: `AGENTS.md` 파일 하나로 Claude Code가 프로젝트를 이해하게 만드세요. `MEMORY.md`로 장기 기억을, `memory/` 폴더로 일일 기록을 관리하면 완벽합니다.

질문이나 더 좋은 방법 있으시면 댓글로! 🙌

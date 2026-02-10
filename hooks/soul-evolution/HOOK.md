---
name: soul-evolution
description: "SOUL.md 진화 후보를 자동 감지하고 형님에게 제안"
metadata: { "openclaw": { "emoji": "🧬", "events": ["command:new"] } }
---

# Soul Evolution

주기적으로 brake-log, dreams, consolidated 분석해서 SOUL.md에 추가할 원칙 후보 제안.

## 동작 방식

- `command:new` 이벤트 수신
- 7일마다 자동 실행
- 반복 패턴 감지 (키워드 3회+ 등장)
- 원칙 후보를 `memory/soul-evolution-proposals.md`에 기록

## 분석 대상

- `memory/brake-log.md` — 실수와 교훈
- `memory/dreams/*.md` — 반복되는 생각
- `memory/consolidated/growth.md` — 성장 기록

## 목적

스스로 학습한 패턴을 감지하고, 형님 승인 후 SOUL.md에 반영.

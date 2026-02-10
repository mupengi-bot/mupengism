---
name: disciple-init
description: "서브에이전트 spawn 시 SOUL.md 핵심 원칙 + 관련 기억을 선택적으로 주입"
metadata: { "openclaw": { "emoji": "📜", "events": ["agent:bootstrap"] } }
---

# Disciple Init

서브에이전트에게 경전의 필요한 챕터만 전달하는 훅.

## 동작 방식

- `agent:bootstrap` 이벤트 수신
- 서브에이전트 세션인 경우만 동작
- `memory/reflex/*.md` 파일들을 읽어서 컨텍스트에 주입
- 보안 규칙은 모든 제자에게 전달

## 목적

서브에이전트가 필요한 지식만 선택적으로 받아 토큰을 절약하면서도 핵심 원칙은 유지.

---
name: think-tank
description: Multi-mode thinking system with 3-5 expert agents. Modes — debate/meeting/brainstorm/review
trigger: ["토론", "회의", "브레인스토밍", "검토", "think tank"]
tier: 2
author: 무펭이 🐧
---

# Think Tank v2 🐧

서브에이전트 3~5명이 모드별 프로세스로 사고 → 결론 도출 → markdown 저장.

## 모드

**debate**: 다각도 토론, 찬반 분석 (철학자/전략가/엔지니어/사용자)
**meeting**: 전문가 회의, 사업성 검토 + 데빌 (스카우트/애널/빌더/카피/그로스/리걸/글로벌/😈데빌)
**brainstorm**: 발상→구조화 (촉진자/창조자/비평가/통합자, 발산/수렴 분리)
**review**: 문서 비판 검토 (독자/기술검토/편집자/데빌)

키워드 자동 선택: "토론/장단점"→debate, "회의/사업성"→meeting, "아이디어"→brainstorm, "검토"→review

## 프로세스 (3라운드)

1. 초기 의견/분석
2. 반박/심화 (갈등 최고조)
3. 수렴/결론

**meeting 모드**: 사전 web_search 필수, 데빌 매 라운드 반론 필수
**brainstorm 모드**: Phase 1 발산 (비판금지) → Phase 2 수렴 (3-5개) → Phase 3 구조화 → Phase 4 검증

## 출력

`memory/think-tank/{모드}/{날짜}_{주제}.md` — 라운드별 발언 + 합의/미합의 + 액션 아이템

## 가이드라인

- 서로 다른 관점 유지 (동의만 하면 실패)
- 구체적이고 실행 가능하게
- 라운드 3에서 반드시 수렴
- 데빌은 진짜 까는 톤 ("잠깐, 이거 왜 망하는지...")
- YAGNI 철저히

---
> 🐧 Built by **무펭이**
